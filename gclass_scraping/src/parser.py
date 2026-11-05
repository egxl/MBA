import re
from datetime import datetime, timezone
from typing import Any
from urllib.parse import urljoin

from scrapling.parser import Selector

from .config import CLASSROOM_HOME_URL, classify_url

COURSE_URL_RE = re.compile(r"/c/([a-zA-Z0-9_\-]+)", re.IGNORECASE)
CLASSROOM_INTERNAL_URL_RE = re.compile(
    r"(?:classroom\.google\.com|^)/(?:u/\d+/)?(?:h|w|c)/", re.IGNORECASE
)

def get_all_text(element: Any) -> str:
    """Helper to extract all recursive text inside a Scrapling Selector/Element."""
    if not element:
        return ""
    try:
        parts = element.css("::text").getall()
        return "\n".join(p.strip() for p in parts if p.strip())
    except Exception:
        return getattr(element, "text", "") or ""


def find_item_container(anchor: Any) -> Any:
    """Walks up ancestors to find the closest item container (article, listitem, etc.)."""
    curr = anchor
    candidate = anchor
    while curr and curr.parent:
        curr = curr.parent
        tag = str(getattr(curr, "tag", "")).lower()
        if tag in ("body", "html", "section"):
            break
        role = curr.attrib.get("role", "").lower()
        cls = curr.attrib.get("class", "").lower()
        if role in ("article", "listitem") or "item" in cls:
            return curr
        candidate = curr
    return candidate


def parse_courses(html_content: str) -> list[dict[str, Any]]:
    """Extracts course list from Google Classroom home page HTML."""
    selector = Selector(html_content)
    courses: list[dict[str, Any]] = []
    seen_ids = set()

    # Look for course links matching /c/<id>
    links = selector.css('a[href*="/c/"]')
    for link in links:
        href = link.attrib.get("href", "")
        match = COURSE_URL_RE.search(href)
        if not match:
            continue
        course_id = match.group(1)
        if course_id in seen_ids:
            continue

        full_url = urljoin(CLASSROOM_HOME_URL, f"/c/{course_id}")

        # Extract title and section from the card / link context
        card = link.parent or link
        container = card
        for _ in range(3):
            if container.parent and str(getattr(container.parent, "tag", "")).lower() not in ("body", "html"):
                container = container.parent

        name_candidate = (
            link.css("h2::text").get()
            or link.css("h3::text").get()
            or link.attrib.get("aria-label", "")
            or get_all_text(link)
        ).strip()

        # If name is empty, try container
        if not name_candidate:
            name_candidate = (
                container.css("h2::text").get()
                or container.css("h3::text").get()
                or ""
            ).strip()

        # Section or subtitle
        section_candidate = ""
        sec_el = container.css('div[class*="subtitle"], div[class*="section"]')
        if sec_el:
            section_candidate = get_all_text(sec_el).strip()

        # Filter out navigation links like "Stream", "Classwork"
        if name_candidate.lower() in {
            "stream",
            "classwork",
            "people",
            "grades",
            "forum",
            "tugas kelas",
            "anggota",
            "nilai",
        }:
            continue

        seen_ids.add(course_id)
        courses.append(
            {
                "course_id": course_id,
                "course_name": name_candidate or f"Course {course_id}",
                "course_section": section_candidate,
                "url": full_url,
                "classwork_url": urljoin(CLASSROOM_HOME_URL, f"/w/{course_id}/t/all"),
            }
        )

    return courses


def extract_timestamps(text: str) -> dict[str, str | None]:
    """Extracts posted, edited, and due timestamps from a text block."""
    result: dict[str, str | None] = {
        "posted_timestamp": None,
        "edited_timestamp": None,
        "due_date": None,
    }
    if not text:
        return result

    for line in text.splitlines():
        line_clean = line.strip()
        m_posted = re.search(
            r"(?:Posted|Diposting)[\s:]+(.+?)(?:\s*\(|$)", line_clean, re.IGNORECASE
        )
        if m_posted and not result["posted_timestamp"]:
            result["posted_timestamp"] = m_posted.group(1).strip()

        m_edited = re.search(
            r"(?:Edited|Diedit)[\s:]+(.+?)(?:\s*\(|$)", line_clean, re.IGNORECASE
        )
        if m_edited and not result["edited_timestamp"]:
            result["edited_timestamp"] = m_edited.group(1).strip()

        m_due = re.search(
            r"(?:Due|Tenggat)[\s:]+(.+?)(?:\s*\(|$)", line_clean, re.IGNORECASE
        )
        if m_due and not result["due_date"]:
            result["due_date"] = m_due.group(1).strip()

    return result


def parse_attachments(container: Any) -> list[dict[str, Any]]:
    """Extracts all attachment drive links, folder links, file names without downloading."""
    attachments: list[dict[str, Any]] = []
    seen_urls = set()

    # Find anchor links inside container
    anchors = container.css("a[href]")
    for a in anchors:
        href = a.attrib.get("href", "").strip()
        if not href or href.startswith("javascript:") or href == "#":
            continue

        # Skip classroom internal navigation, courses, and coursework post links
        if CLASSROOM_INTERNAL_URL_RE.search(href):
            continue

        link_type, action_taken = classify_url(href)

        # Only capture materials: drive files, drive folders, docs, forms, youtube, or external links
        if link_type == "external_link" and "classroom.google.com" in href:
            continue

        # Extract file name / title
        file_name = (
            a.attrib.get("aria-label", "")
            or a.attrib.get("title", "")
            or a.css("span::text").get()
            or a.css("div::text").get()
            or get_all_text(a)
        ).strip()

        # Clean up multi-line file name
        if "\n" in file_name:
            file_name = " - ".join(
                [part.strip() for part in file_name.splitlines() if part.strip()]
            )

        if not file_name:
            # Fallback file name from url
            file_name = href.split("/")[-1].split("?")[0] or "Attachment"

        if href in seen_urls:
            continue
        seen_urls.add(href)

        attachments.append(
            {
                "file_name": file_name,
                "url": href,
                "link_type": link_type,
                "action_taken": action_taken,
            }
        )

    return attachments


def parse_classwork(
    html_content: str, course_meta: dict[str, Any] | None = None
) -> list[dict[str, Any]]:
    """Parses full Classwork page HTML into structured materials and coursework items."""
    selector = Selector(html_content)
    now_iso = datetime.now(timezone.utc).isoformat()
    meta = course_meta or {}
    items: list[dict[str, Any]] = []

    # Let's inspect anchor items with classwork / materials / assignments
    item_anchors = selector.css('a[href*="/m/"], a[href*="/a/"]')

    for anchor in item_anchors:
        href = anchor.attrib.get("href", "")
        # Resolve parent block for title, timestamp, and attachments
        parent_block = find_item_container(anchor)

        full_text = get_all_text(parent_block)
        timestamps = extract_timestamps(full_text)

        item_title = (
            anchor.attrib.get("aria-label", "")
            or anchor.css("h2::text").get()
            or anchor.css("h3::text").get()
            or get_all_text(anchor)
        ).strip()

        # Detect item type
        item_type = "material" if "/m/" in href else "assignment"

        # Topic detection by checking ancestor heading
        topic = "General / No Topic"
        ancestor = parent_block
        while ancestor and ancestor.parent:
            ancestor = ancestor.parent
            tag = str(getattr(ancestor, "tag", "")).lower()
            if tag in ("body", "html"):
                break
            heading = ancestor.css("h2::text").get() or ancestor.css("h1::text").get()
            if heading and heading.strip() != item_title:
                topic = heading.strip()
                break

        attachments = parse_attachments(parent_block)

        items.append(
            {
                "scraped_at": now_iso,
                "course_id": meta.get("course_id", ""),
                "course_name": meta.get("course_name", ""),
                "course_section": meta.get("course_section", ""),
                "topic": topic,
                "item_type": item_type,
                "item_title": item_title or f"Untitled {item_type}",
                "item_url": urljoin(CLASSROOM_HOME_URL, href),
                "posted_timestamp": timestamps.get("posted_timestamp"),
                "edited_timestamp": timestamps.get("edited_timestamp"),
                "due_date": timestamps.get("due_date"),
                "attachments": attachments,
            }
        )

    # If item_anchors didn't yield items (e.g. non-anchor expanded DOM view),
    # parse from generic stream/classwork cards
    if not items:
        # Fallback card parsing
        cards = selector.css('div[role="listitem"], div[role="article"]')
        for card in cards:
            text = get_all_text(card)
            if not text.strip():
                continue
            attachments = parse_attachments(card)
            if not attachments:
                continue

            timestamps = extract_timestamps(text)
            title = (
                card.css("h2::text").get()
                or card.css("h3::text").get()
                or card.css('div[role="heading"]::text').get()
                or (text.splitlines()[0] if text else "")
            ).strip()

            items.append(
                {
                    "scraped_at": now_iso,
                    "course_id": meta.get("course_id", ""),
                    "course_name": meta.get("course_name", ""),
                    "course_section": meta.get("course_section", ""),
                    "topic": "General",
                    "item_type": "material",
                    "item_title": title,
                    "item_url": meta.get("classwork_url", ""),
                    "posted_timestamp": timestamps.get("posted_timestamp"),
                    "edited_timestamp": timestamps.get("edited_timestamp"),
                    "due_date": timestamps.get("due_date"),
                    "attachments": attachments,
                }
            )

    return items
