import sys
import time
from typing import Any

from patchright.sync_api import sync_playwright
from scrapling.fetchers import StealthySession

from .config import (
    CLASSROOM_HOME_URL,
    SESSION_DIR,
    STATE_FILE,
)
from .parser import parse_classwork, parse_courses


class ClassroomScraper:
    def __init__(
        self,
        headless: bool = True,
        real_chrome: bool = False,
        user_data_dir: str | None = None,
        state_file: str | None = None,
        cdp_url: str | None = None,
    ):
        self.headless = headless
        self.real_chrome = real_chrome
        self.user_data_dir = user_data_dir or str(SESSION_DIR)
        self.state_file = state_file or str(STATE_FILE)
        self.cdp_url = cdp_url

    def interactive_login(self) -> bool:
        """Opens a visible browser window for the user to sign in to Google Classroom,

        auto-detects when the Classroom dashboard loads, and saves the session state.
        """
        print("\n" + "=" * 60, flush=True)
        print("OPENING BROWSER FOR GOOGLE CLASSROOM LOGIN", flush=True)
        print("=" * 60, flush=True)
        print("1. Look for the browser window on your screen.", flush=True)
        print("2. Sign in to your Google Account.", flush=True)
        print("3. Once your Classroom dashboard loads, it auto-detects.", flush=True)
        print("=" * 60 + "\n", flush=True)

        SESSION_DIR.mkdir(parents=True, exist_ok=True)

        try:
            with sync_playwright() as p:
                launch_kwargs: dict[str, Any] = {
                    "headless": False,
                    "no_viewport": True,
                }
                if self.cdp_url:
                    browser = p.chromium.connect_over_cdp(self.cdp_url)
                    ctx = browser.new_context()
                else:
                    ctx = p.chromium.launch_persistent_context(
                        self.user_data_dir,
                        **launch_kwargs,
                    )

                page = ctx.pages[0] if ctx.pages else ctx.new_page()
                page.goto(CLASSROOM_HOME_URL)

                print("[Auth] Waiting for sign-in to complete...", flush=True)
                logged_in = False
                for _ in range(150):  # Wait up to 5 minutes
                    time.sleep(2)
                    try:
                        url = str(page.url)
                        if "classroom.google.com" in url and "accounts.google.com" not in url:
                            has_cards = page.query_selector('a[href*="/c/"], [data-course-id], div[role="listitem"], nav')
                            if has_cards or "signin" not in url.lower():
                                print("\n[Auth] SUCCESS: Google Classroom dashboard detected!", flush=True)
                                logged_in = True
                                time.sleep(2)
                                break
                    except Exception:
                        pass

                if logged_in:
                    ctx.storage_state(path=self.state_file)
                    print(f"[Auth] Saved session cookies to {self.state_file}\n", flush=True)
                    ctx.close()
                    return True
                else:
                    print("[Auth] Timed out waiting for login. Saving current state...", flush=True)
                    ctx.storage_state(path=self.state_file)
                    ctx.close()
                    return False
        except Exception as err:
            print(f"[Auth] Error during login flow: {err}", flush=True)
            return False

    def list_courses(self) -> list[dict[str, Any]]:
        """Fetches and parses available courses from Google Classroom home."""
        SESSION_DIR.mkdir(parents=True, exist_ok=True)

        with StealthySession(
            headless=self.headless,
            real_chrome=self.real_chrome if not self.cdp_url else False,
            user_data_dir=self.user_data_dir if not self.cdp_url else None,
            cdp_url=self.cdp_url,
            timeout=45000,
        ) as session:
            if Path(self.state_file).exists():
                try:
                    import json
                    with open(self.state_file, "r", encoding="utf-8") as sf:
                        s_data = json.load(sf)
                        if "cookies" in s_data:
                            session.context.add_cookies(s_data["cookies"])
                except Exception as e:
                    print(f"[Session] Note on cookies: {e}", flush=True)

            print(f"[Scraper] Fetching courses from {CLASSROOM_HOME_URL}...", flush=True)
            resp = session.fetch(
                CLASSROOM_HOME_URL,
                network_idle=True,
                wait_selector='a[href*="/c/"]',
                wait=3000,
            )

            html = resp.body.decode("utf-8", errors="replace")
            courses = parse_courses(html)
            return courses

    def scrape_course(self, course: dict[str, Any]) -> list[dict[str, Any]]:
        """Scrapes classwork, topics, timestamps, filenames, and Drive links for a course.

        ZERO downloads; Drive folders are NEVER opened.
        """
        cname = course.get("course_name", "Unknown Course")
        cw_url = course.get("classwork_url") or f"{CLASSROOM_HOME_URL}/c/{course.get('course_id')}"
        print(f"\n[Scraper] Scraping course: {cname} ({cw_url})...", flush=True)

        SESSION_DIR.mkdir(parents=True, exist_ok=True)

        def expand_and_guard(page: Any):
            """Playwright page action:

            1. Prevents any popup/tab opening or navigation to drive.google.com.
            2. Expands collapsed coursework items so DOM attachment nodes render.
            3. Scrolls down to trigger lazy loading.
            """
            try:
                # Guard against opening tabs or downloading
                page.evaluate("""() => {
                    window.open = function() { console.log('Intercepted window.open'); return null; };
                    document.querySelectorAll('a').forEach(a => {
                        a.removeAttribute('target');
                    });
                }""")

                # Expand collapsed items
                page.evaluate("""() => {
                    const expandables = document.querySelectorAll('[aria-expanded="false"]');
                    expandables.forEach(el => {
                        try {
                            el.click();
                        } catch(e) {}
                    });
                }""")

                # Scroll down in increments
                for _ in range(4):
                    page.mouse.wheel(0, 1000)
                    time.sleep(0.5)

                # Expand any newly rendered items
                page.evaluate("""() => {
                    const expandables = document.querySelectorAll('[aria-expanded="false"]');
                    expandables.forEach(el => {
                        try {
                            el.click();
                        } catch(e) {}
                    });
                }""")
                time.sleep(1)
            except Exception as e:
                print(f"[Action] Note during DOM expansion: {e}", flush=True)

        with StealthySession(
            headless=self.headless,
            real_chrome=self.real_chrome if not self.cdp_url else False,
            user_data_dir=self.user_data_dir if not self.cdp_url else None,
            cdp_url=self.cdp_url,
            timeout=60000,
        ) as session:
            if Path(self.state_file).exists():
                try:
                    import json
                    with open(self.state_file, "r", encoding="utf-8") as sf:
                        s_data = json.load(sf)
                        if "cookies" in s_data:
                            session.context.add_cookies(s_data["cookies"])
                except Exception:
                    pass

            resp = session.fetch(
                cw_url,
                network_idle=True,
                page_action=expand_and_guard,
                wait=2000,
            )

            html = resp.body.decode("utf-8", errors="replace")
            items = parse_classwork(html, course_meta=course)
            print(f"[Scraper] Extracted {len(items)} items/materials for {cname}", flush=True)
            return items
