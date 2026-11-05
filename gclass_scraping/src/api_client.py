import json
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from typing import Any

from .config import classify_url

CLASSROOM_API_BASE = "https://classroom.googleapis.com/v1"


class GoogleClassroomApiClient:
    """Direct REST API client for Google Classroom using OAuth2 Bearer Token.

    Complies with Zero Binary Downloads policy: extracts file IDs, titles,
    and metadata without downloading raw payloads.
    """

    def __init__(self, bearer_token: str):
        self.bearer_token = bearer_token.strip()

    def _request(self, endpoint: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
        """Makes an authenticated GET request to Google Classroom API."""
        url = f"{CLASSROOM_API_BASE}/{endpoint.lstrip('/')}"
        if params:
            query = urllib.parse.urlencode({k: v for k, v in params.items() if v is not None})
            url = f"{url}?{query}"

        headers = {
            "Authorization": f"Bearer {self.bearer_token}",
            "Accept": "application/json",
            "User-Agent": "GClass-Scraper/2.0",
        }

        req = urllib.request.Request(url, headers=headers, method="GET")
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = resp.read().decode("utf-8")
                return json.loads(data)
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8", errors="replace")
            if e.code == 401:
                raise PermissionError(
                    f"Google Classroom API 401 Unauthorized. Token may be expired or missing scopes: {err_body}"
                )
            elif e.code == 403:
                raise PermissionError(
                    f"Google Classroom API 403 Forbidden. Check required scopes (classroom.courses.readonly, etc.): {err_body}"
                )
            raise RuntimeError(f"HTTP {e.code} for {url}: {err_body}")
        except Exception as e:
            raise RuntimeError(f"API request failed for {url}: {e}")

    def list_courses(self) -> list[dict[str, Any]]:
        """Lists all active and enrolled courses."""
        courses = []
        page_token = None
        while True:
            resp = self._request("courses", {"pageSize": 100, "pageToken": page_token})
            for c in resp.get("courses", []):
                courses.append(
                    {
                        "course_id": c.get("id"),
                        "course_name": c.get("name", "Untitled Course"),
                        "course_section": c.get("section", ""),
                        "url": c.get("alternateLink", ""),
                        "enrollment_code": c.get("enrollmentCode", ""),
                        "course_state": c.get("courseState", "ACTIVE"),
                    }
                )
            page_token = resp.get("nextPageToken")
            if not page_token:
                break
        return courses

    def list_topics(self, course_id: str) -> dict[str, str]:
        """Fetches topic mapping (topicId -> topicName)."""
        topics = {}
        page_token = None
        while True:
            try:
                resp = self._request(
                    f"courses/{course_id}/topics",
                    {"pageSize": 100, "pageToken": page_token},
                )
                for t in resp.get("topic", []):
                    topics[t.get("topicId")] = t.get("name", "General")
                page_token = resp.get("nextPageToken")
                if not page_token:
                    break
            except Exception:
                break
        return topics

    def _parse_materials(self, materials_list: list[dict[str, Any]]) -> list[dict[str, Any]]:
        """Extracts Drive links, YouTube links, and forms from API materials array."""
        attachments = []
        for m in materials_list:
            if "driveFile" in m:
                df = m["driveFile"].get("driveFile", {})
                title = df.get("title", "Google Drive File")
                alt_link = df.get("alternateLink") or f"https://drive.google.com/file/d/{df.get('id')}/view"
                ltype, action = classify_url(alt_link)
                attachments.append(
                    {
                        "file_name": title,
                        "url": alt_link,
                        "link_type": ltype,
                        "action_taken": action,
                        "drive_id": df.get("id"),
                        "thumbnail_url": df.get("thumbnailUrl"),
                    }
                )
            elif "youtubeVideo" in m:
                yt = m["youtubeVideo"]
                alt_link = yt.get("alternateLink") or f"https://youtube.com/watch?v={yt.get('id')}"
                attachments.append(
                    {
                        "file_name": yt.get("title", "YouTube Video"),
                        "url": alt_link,
                        "link_type": "youtube_video",
                        "action_taken": "logged_only",
                    }
                )
            elif "link" in m:
                lk = m["link"]
                url = lk.get("url", "")
                ltype, action = classify_url(url)
                attachments.append(
                    {
                        "file_name": lk.get("title") or url,
                        "url": url,
                        "link_type": ltype,
                        "action_taken": action,
                    }
                )
            elif "form" in m:
                fm = m["form"]
                url = fm.get("formUrl", "")
                attachments.append(
                    {
                        "file_name": fm.get("title", "Google Form"),
                        "url": url,
                        "link_type": "google_form",
                        "action_taken": "logged_only",
                    }
                )
        return attachments

    def _format_due_date(self, due_date: dict[str, Any] | None, due_time: dict[str, Any] | None) -> str | None:
        """Formats API dueDate and dueTime dicts into readable string."""
        if not due_date or not due_date.get("year"):
            return None
        y = due_date.get("year")
        m = due_date.get("month", 1)
        d = due_date.get("day", 1)
        h = due_time.get("hours", 23) if due_time else 23
        mi = due_time.get("minutes", 59) if due_time else 59
        return f"{y:04d}-{m:02d}-{d:02d} {h:02d}:{mi:02d}"

    def list_course_work(
        self, course: dict[str, Any], topic_map: dict[str, str]
    ) -> list[dict[str, Any]]:
        """Fetches all coursework/tasks (assignments, quizzes, questions) for a course."""
        cid = course["course_id"]
        cname = course["course_name"]
        items = []
        page_token = None

        while True:
            try:
                resp = self._request(
                    f"courses/{cid}/courseWork",
                    {"pageSize": 100, "pageToken": page_token},
                )
            except Exception as e:
                print(f"[API] Note on courseWork ({cname}): {e}")
                break

            for cw in resp.get("courseWork", []):
                topic_id = cw.get("topicId")
                topic_name = topic_map.get(topic_id, "General / No Topic")
                attachments = self._parse_materials(cw.get("materials", []))
                due_str = self._format_due_date(cw.get("dueDate"), cw.get("dueTime"))

                items.append(
                    {
                        "scraped_at": datetime.now(timezone.utc).isoformat(),
                        "course_id": cid,
                        "course_name": cname,
                        "course_section": course.get("course_section", ""),
                        "topic": topic_name,
                        "item_type": "assignment",
                        "work_type": cw.get("workType", "ASSIGNMENT"),
                        "item_title": cw.get("title", "Untitled Assignment"),
                        "description": cw.get("description", ""),
                        "item_url": cw.get("alternateLink", ""),
                        "posted_timestamp": cw.get("creationTime"),
                        "edited_timestamp": cw.get("updateTime"),
                        "due_date": due_str,
                        "max_points": cw.get("maxPoints"),
                        "attachments": attachments,
                    }
                )

            page_token = resp.get("nextPageToken")
            if not page_token:
                break

        return items

    def list_course_work_materials(
        self, course: dict[str, Any], topic_map: dict[str, str]
    ) -> list[dict[str, Any]]:
        """Fetches all coursework reading materials and lecture notes."""
        cid = course["course_id"]
        cname = course["course_name"]
        items = []
        page_token = None

        while True:
            try:
                resp = self._request(
                    f"courses/{cid}/courseWorkMaterials",
                    {"pageSize": 100, "pageToken": page_token},
                )
            except Exception as e:
                print(f"[API] Note on courseWorkMaterials ({cname}): {e}")
                break

            for cm in resp.get("courseWorkMaterial", []):
                topic_id = cm.get("topicId")
                topic_name = topic_map.get(topic_id, "General / No Topic")
                attachments = self._parse_materials(cm.get("materials", []))

                items.append(
                    {
                        "scraped_at": datetime.now(timezone.utc).isoformat(),
                        "course_id": cid,
                        "course_name": cname,
                        "course_section": course.get("course_section", ""),
                        "topic": topic_name,
                        "item_type": "material",
                        "item_title": cm.get("title", "Untitled Material"),
                        "description": cm.get("description", ""),
                        "item_url": cm.get("alternateLink", ""),
                        "posted_timestamp": cm.get("creationTime"),
                        "edited_timestamp": cm.get("updateTime"),
                        "due_date": None,
                        "attachments": attachments,
                    }
                )

            page_token = resp.get("nextPageToken")
            if not page_token:
                break

        return items

    def list_announcements(
        self, course: dict[str, Any]
    ) -> list[dict[str, Any]]:
        """Fetches stream announcements (class schedules, Zoom links, reminders)."""
        cid = course["course_id"]
        cname = course["course_name"]
        items = []
        page_token = None

        while True:
            try:
                resp = self._request(
                    f"courses/{cid}/announcements",
                    {"pageSize": 100, "pageToken": page_token},
                )
            except Exception as e:
                print(f"[API] Note on announcements ({cname}): {e}")
                break

            for an in resp.get("announcements", []):
                attachments = self._parse_materials(an.get("materials", []))
                text_snippet = an.get("text", "").strip()
                title = text_snippet.split("\n")[0][:80] if text_snippet else "Announcement"

                items.append(
                    {
                        "scraped_at": datetime.now(timezone.utc).isoformat(),
                        "course_id": cid,
                        "course_name": cname,
                        "course_section": course.get("course_section", ""),
                        "topic": "Announcements & Schedule",
                        "item_type": "announcement",
                        "item_title": title,
                        "description": text_snippet,
                        "item_url": an.get("alternateLink", ""),
                        "posted_timestamp": an.get("creationTime"),
                        "edited_timestamp": an.get("updateTime"),
                        "due_date": None,
                        "attachments": attachments,
                    }
                )

            page_token = resp.get("nextPageToken")
            if not page_token:
                break

        return items

    def scrape_course(self, course: dict[str, Any], include_announcements: bool = True) -> list[dict[str, Any]]:
        """Aggregates all coursework, materials, and announcements for a course."""
        cid = course["course_id"]
        cname = course["course_name"]
        print(f"[API Client] Scraping {cname} (ID: {cid})...")

        topic_map = self.list_topics(cid)
        items = []

        # 1. Coursework (Assignments & Tasks)
        cw = self.list_course_work(course, topic_map)
        items.extend(cw)

        # 2. Materials (Slides, Handouts, Readings)
        cm = self.list_course_work_materials(course, topic_map)
        items.extend(cm)

        # 3. Announcements (Schedules & Zoom Links)
        if include_announcements:
            an = self.list_announcements(course)
            items.extend(an)

        print(f"  • Retrieved: {len(cw)} tasks, {len(cm)} materials, {len(items) - len(cw) - len(cm)} announcements")
        return items
