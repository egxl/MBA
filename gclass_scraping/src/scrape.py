import argparse
import sys
from pathlib import Path

# Add project root to sys.path so relative imports work when executed directly
current_dir = Path(__file__).resolve().parent
parent_dir = current_dir.parent
sys.path.insert(0, str(parent_dir))

from src.api_client import GoogleClassroomApiClient
from src.config import BASE_DIR, OUTPUT_DIR, STATE_FILE
from src.exporter import export_all
from src.scraper import ClassroomScraper
from src.token_manager import TokenManager


def get_token_manager(args: argparse.Namespace) -> TokenManager:
    """Instantiates TokenManager from CLI arguments or environment."""
    token_str = getattr(args, "token", None)
    token_file = getattr(args, "token_file", None)
    cookies = getattr(args, "cookie", None)
    return TokenManager(token_str=token_str, token_file=token_file, cookies=cookies)


def cmd_login(args: argparse.Namespace) -> None:
    scraper = ClassroomScraper(headless=False, real_chrome=False)
    scraper.interactive_login()


def cmd_courses(args: argparse.Namespace) -> None:
    tm = get_token_manager(args)

    # 1. Try via API if Bearer token present
    if tm.has_bearer_token():
        print("\n[Auth] Using Google Classroom REST API (OAuth2 Bearer Token)...")
        try:
            client = GoogleClassroomApiClient(tm.get_bearer_token())
            courses = client.list_courses()
            print(f"\n[Courses] Discovered {len(courses)} course(s) via Google Classroom API:")
            print("-" * 60)
            for c in courses:
                print(f"• {c['course_name']} (ID: {c['course_id']})")
                if c.get("course_section"):
                    print(f"  Section: {c['course_section']}")
                print(f"  URL: {c['url']}")
            print("-" * 60 + "\n")
            return
        except Exception as e:
            print(f"[API Error] {e}")
            print("Falling back to web browser scraper...")

    # 2. Try via Scrapling browser
    if tm.cookie_items and not STATE_FILE.exists():
        tm.sync_to_storage_state(STATE_FILE)

    scraper = ClassroomScraper(headless=not args.no_headless, real_chrome=False)
    courses = scraper.list_courses()

    if not courses:
        print("\n[Courses] No courses found. You may need to run 'login' or provide tokens:")
        print("  py src/scrape.py run --token-file gclass_tokens.json\n")
        return

    print(f"\n[Courses] Discovered {len(courses)} course(s) via Web Session:")
    print("-" * 60)
    for c in courses:
        print(f"• {c['course_name']} (ID: {c['course_id']})")
        if c.get("course_section"):
            print(f"  Section: {c['course_section']}")
        print(f"  URL: {c['url']}")
    print("-" * 60 + "\n")


def cmd_run(args: argparse.Namespace) -> None:
    tm = get_token_manager(args)
    all_items = []
    target_filter = args.course.lower() if args.course else None

    # Track A: Direct Google Classroom REST API (Bearer token present)
    if tm.has_bearer_token():
        print("\n" + "=" * 60)
        print("RUNNING GOOGLE CLASSROOM SCRAPER (REST API ENGINE)")
        print("=" * 60)
        print("[Auth] Active OAuth2 Bearer Token detected.")
        client = GoogleClassroomApiClient(tm.get_bearer_token())

        try:
            courses = client.list_courses()
        except Exception as err:
            print(f"\n[API Error] Failed to list courses: {err}")
            print("If token is expired, re-run 'export_tokens.js' in browser console.")
            return

        matched_courses = [
            c for c in courses
            if not target_filter or target_filter in c["course_name"].lower() or target_filter in c["course_id"].lower()
        ]

        if not matched_courses:
            print(f"\n[Error] No courses matched filter: '{args.course}'")
            return

        print(f"[API] Found {len(matched_courses)} course(s) to scrape:")
        for c in matched_courses:
            print(f"  • {c['course_name']}")

        include_announcements = not args.no_announcements
        for c in matched_courses:
            items = client.scrape_course(c, include_announcements=include_announcements)
            all_items.extend(items)

    # Track B: Scrapling Web Session
    else:
        print("\n" + "=" * 60)
        print("RUNNING GOOGLE CLASSROOM SCRAPER (SCRAPLING WEB ENGINE)")
        print("=" * 60)

        if tm.cookie_items and not STATE_FILE.exists():
            tm.sync_to_storage_state(STATE_FILE)

        scraper = ClassroomScraper(
            headless=not args.no_headless,
            real_chrome=False,
            cdp_url=args.cdp if hasattr(args, "cdp") else None,
        )

        if not STATE_FILE.exists() and not tm.cookie_header:
            print("\n[Auth] No saved session or token found.")
            print("Tip: Run 'export_tokens.js' in your browser console, or run:")
            print("  py src/scrape.py login")
            scraper.interactive_login()

        courses = scraper.list_courses()
        if not courses:
            print("\n[Auth] Session invalid or expired. Opening login window...")
            scraper.interactive_login()
            courses = scraper.list_courses()

        if not courses:
            print("\n[Error] No courses discovered.")
            return

        matched_courses = [
            c for c in courses
            if not target_filter or target_filter in c["course_name"].lower() or target_filter in c["course_id"].lower()
        ]

        if not matched_courses:
            print(f"\n[Error] No courses matched filter: '{args.course}'")
            return

        print(f"\n[Scraper] Starting scrape for {len(matched_courses)} course(s)...")
        for c in matched_courses:
            items = scraper.scrape_course(c)
            all_items.extend(items)

    # Count attachments
    total_attachments = sum(len(it.get("attachments", [])) for it in all_items)
    total_tasks = sum(1 for it in all_items if it.get("item_type") == "assignment" or it.get("due_date"))

    # Export all artifacts to gclass_scraping/output/
    out_files = export_all(all_items)

    print("\n" + "=" * 60)
    print("EXTRACTION COMPLETE (ZERO BINARY DOWNLOADS)")
    print("=" * 60)
    print(f"Total Items Logged              : {len(all_items)}")
    print(f"Total Tasks & Schedules Logged  : {total_tasks}")
    print(f"Total Attachment Links Logged   : {total_attachments}")
    print(f"JSON Output                     : {out_files['json']}")
    print(f"CSV Tasks & Schedules           : {out_files['csv_tasks']}")
    print(f"CSV Links & Attachments         : {out_files['csv_links']}")
    print(f"Markdown Catalog                : {out_files['md']}")
    print("=" * 60 + "\n")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Google Classroom Metadata & Attachment Link Scraper (Powered by Scrapling & Classroom API)"
    )
    # Global token arguments
    parser.add_argument("--token", type=str, default=None, help="Google OAuth2 Bearer token (ya29...)")
    parser.add_argument("--token-file", type=str, default=None, help="Path to gclass_tokens.json (default: gclass_scraping/gclass_tokens.json)")
    parser.add_argument("--cookie", type=str, default=None, help="Raw cookie header string")

    subparsers = parser.add_subparsers(dest="command", required=True)

    # Subcommand: login
    subparsers.add_parser("login", help="Open browser to sign in to Google Classroom")

    # Subcommand: courses
    sub_courses = subparsers.add_parser("courses", help="List available Google Classroom courses")
    sub_courses.add_argument("--no-headless", action="store_true", help="Show browser window")
    sub_courses.add_argument("--token", type=str, default=None, help="Google OAuth2 Bearer token")
    sub_courses.add_argument("--token-file", type=str, default=None, help="Path to gclass_tokens.json")

    # Subcommand: run
    sub_run = subparsers.add_parser("run", help="Scrape metadata, schedules, tasks, and Drive links")
    sub_run.add_argument("--course", type=str, default="", help="Filter by course name substring (e.g. 'MK3')")
    sub_run.add_argument("--token", type=str, default=None, help="Google OAuth2 Bearer token")
    sub_run.add_argument("--token-file", type=str, default=None, help="Path to gclass_tokens.json")
    sub_run.add_argument("--no-announcements", action="store_true", help="Skip stream announcements")
    sub_run.add_argument("--no-headless", action="store_true", help="Show browser window (web scraper)")
    sub_run.add_argument("--cdp", type=str, default=None, help="Connect to running Chrome CDP URL (e.g. http://localhost:9222)")

    args = parser.parse_args()

    if args.command == "login":
        cmd_login(args)
    elif args.command == "courses":
        cmd_courses(args)
    elif args.command == "run":
        cmd_run(args)


if __name__ == "__main__":
    main()
