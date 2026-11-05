import json
import os
import re
from pathlib import Path
from typing import Any

from .config import BASE_DIR, STATE_FILE

BEARER_PATTERN = re.compile(r"ya29\.[a-zA-Z0-9_\-]+")


class TokenManager:
    """Manages parsing, validating, and supplying tokens and session credentials.

    Supports:
    - Exported JSON from export_tokens.js (gclass_tokens.json)
    - Direct OAuth2 Bearer tokens (ya29...)
    - Cookie header strings (SID=...; SAPISID=...)
    - Environment variables (GCLASS_TOKEN / GOOGLE_CLASSROOM_TOKEN)
    """

    def __init__(
        self,
        token_str: str | None = None,
        token_file: str | Path | None = None,
        cookies: str | None = None,
    ):
        self.raw_bearer_token: str | None = None
        self.cookie_header: str = ""
        self.cookie_items: list[dict[str, Any]] = []
        self.wiz_data: dict[str, Any] = {}
        self.active_courses: list[dict[str, Any]] = []

        # 1. Check direct CLI arguments
        if token_str and BEARER_PATTERN.search(token_str):
            match = BEARER_PATTERN.search(token_str)
            if match:
                self.raw_bearer_token = match.group(0)

        if cookies:
            self.cookie_header = cookies.strip()

        # 2. Check token file
        candidate_file = None
        if token_file:
            p = Path(token_file)
            candidate_file = p if p.is_absolute() else BASE_DIR / p
        elif (BASE_DIR / "gclass_tokens.json").exists():
            candidate_file = BASE_DIR / "gclass_tokens.json"

        if candidate_file and candidate_file.exists():
            self._load_from_json(candidate_file)

        # 3. Check environment variables if bearer token still not set
        if not self.raw_bearer_token:
            env_tok = os.getenv("GCLASS_TOKEN") or os.getenv("GOOGLE_CLASSROOM_TOKEN")
            if env_tok:
                match = BEARER_PATTERN.search(env_tok)
                if match:
                    self.raw_bearer_token = match.group(0)
                else:
                    self.raw_bearer_token = env_tok.strip()

    def _load_from_json(self, file_path: Path) -> None:
        """Loads credentials from exported JSON file."""
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception as e:
            print(f"[TokenManager] Warning: failed to parse {file_path}: {e}")
            return

        # Check OAuth Bearer token
        if data.get("oauth_bearer_token"):
            self.raw_bearer_token = data["oauth_bearer_token"]

        # Check storage tokens if top-level bearer is missing
        if not self.raw_bearer_token and data.get("storage_tokens"):
            for tok in data["storage_tokens"]:
                if BEARER_PATTERN.search(tok):
                    self.raw_bearer_token = tok
                    break

        # Check cookies
        if data.get("cookies"):
            self.cookie_header = data["cookies"]
        if data.get("cookie_items"):
            self.cookie_items = data["cookie_items"]

        # Check WIZ data
        if data.get("wiz_global_data"):
            self.wiz_data = data["wiz_global_data"]

        # Check active courses detected in browser
        if data.get("active_courses_on_page"):
            self.active_courses = data["active_courses_on_page"]

    def has_bearer_token(self) -> bool:
        """Returns True if a valid Bearer token is available."""
        return bool(self.raw_bearer_token)

    def get_bearer_token(self) -> str | None:
        """Returns the active Bearer token."""
        return self.raw_bearer_token

    def get_cookie_header(self) -> str:
        """Returns raw cookie header string."""
        return self.cookie_header

    def get_wiz_data(self) -> dict[str, Any]:
        """Returns WIZ session dictionary."""
        return self.wiz_data

    def sync_to_storage_state(self, target_path: Path | None = None) -> Path | None:
        """Converts cookie_items into Playwright/Scrapling storage state format."""
        if not self.cookie_items:
            return None

        out_path = target_path or STATE_FILE
        playwright_cookies = []
        for c in self.cookie_items:
            same_site = c.get("sameSite", "Lax")
            if same_site == "unspecified":
                same_site = "Lax"
            elif same_site not in ("Strict", "Lax", "None"):
                same_site = "Lax"

            playwright_cookies.append(
                {
                    "name": c["name"],
                    "value": c["value"],
                    "domain": c.get("domain") or ".google.com",
                    "path": c.get("path") or "/",
                    "expires": -1,
                    "httpOnly": False,
                    "secure": bool(c.get("secure", True)),
                    "sameSite": same_site,
                }
            )

        storage_data = {
            "cookies": playwright_cookies,
            "origins": [
                {
                    "origin": "https://classroom.google.com",
                    "localStorage": [],
                }
            ],
        }

        try:
            with open(out_path, "w", encoding="utf-8") as f:
                json.dump(storage_data, f, indent=2)
            return out_path
        except Exception as e:
            print(f"[TokenManager] Warning: failed writing storage state: {e}")
            return None
