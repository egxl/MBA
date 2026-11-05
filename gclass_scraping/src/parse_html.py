import argparse
import sys
from pathlib import Path

# Add project root to sys.path
current_dir = Path(__file__).resolve().parent
parent_dir = current_dir.parent
sys.path.insert(0, str(parent_dir))

from src.config import BASE_DIR, OUTPUT_DIR
from src.exporter import export_all
from src.parser import parse_classwork, parse_courses


def parse_saved_html(file_path: Path) -> list[dict]:
    """Parses a saved Google Classroom HTML file (e.g. from Ctrl+S in browser)."""
    if not file_path.exists():
        print(f"[Error] File not found: {file_path}")
        return []

    print(f"[Parser] Reading {file_path.name}...")
    with open(file_path, "r", encoding="utf-8", errors="replace") as f:
        html = f.read()

    # Try detecting course name from title
    course_name = file_path.stem
    items = parse_classwork(html, course_meta={"course_name": course_name, "course_id": file_path.stem})

    # If classwork parser found items, return them
    if items:
        return items

    # Otherwise check if it's the home page with course list
    courses = parse_courses(html)
    if courses:
        print(f"[Parser] Detected courses home page with {len(courses)} courses:")
        for c in courses:
            print(f"  • {c['course_name']} ({c['url']})")

    return items


def main() -> None:
    parser = argparse.ArgumentParser(description="Parse saved Google Classroom HTML files without browser automation")
    parser.add_argument("path", nargs="?", default="gclass_scraping/raw", help="Path to an .html file or directory containing .html files")
    args = parser.parse_args()

    target_path = Path(args.path)
    if not target_path.is_absolute():
        target_path = BASE_DIR.parent / target_path

    html_files = []
    if target_path.is_file():
        html_files.append(target_path)
    elif target_path.is_dir():
        html_files.extend(list(target_path.glob("*.html")) + list(target_path.glob("*.htm")))

    if not html_files:
        print(f"[Parser] No .html files found in: {target_path}")
        print("Tip: In your normal Chrome, open Google Classroom -> press Ctrl+S -> save as .html into gclass_scraping/raw/")
        return

    all_items = []
    total_attachments = 0

    for hf in html_files:
        items = parse_saved_html(hf)
        all_items.extend(items)
        for it in items:
            total_attachments += len(it.get("attachments", []))

    if not all_items:
        print("[Parser] No items or attachments found in provided HTML file(s).")
        return

    out = export_all(all_items)
    print("\n" + "=" * 60)
    print("EXTRACTION COMPLETE (ZERO DOWNLOADS)")
    print("=" * 60)
    print(f"Total Coursework/Material Items : {len(all_items)}")
    print(f"Total Attachment Links Logged   : {total_attachments}")
    print(f"JSON Output                     : {out['json']}")
    print(f"CSV Output                      : {out['csv']}")
    print(f"Markdown Catalog                : {out['md']}")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    main()
