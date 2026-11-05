import re
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
SESSION_DIR = BASE_DIR / ".session"
STATE_FILE = BASE_DIR / "state.json"
OUTPUT_DIR = BASE_DIR / "output"

CLASSROOM_HOME_URL = "https://classroom.google.com"

# Regex patterns for link classification
DRIVE_FOLDER_PATTERN = re.compile(
    r"(?:drive\.google\.com/(?:drive/|drive/u/\d+/)?folders/|drive\.google\.com/folderview\?id=)",
    re.IGNORECASE,
)
DRIVE_FILE_PATTERN = re.compile(
    r"drive\.google\.com/(?:file/d/|open\?id=)",
    re.IGNORECASE,
)
DOCS_PATTERN = re.compile(r"docs\.google\.com/document/d/", re.IGNORECASE)
SLIDES_PATTERN = re.compile(r"docs\.google\.com/presentation/d/", re.IGNORECASE)
SHEETS_PATTERN = re.compile(r"docs\.google\.com/spreadsheets/d/", re.IGNORECASE)
FORMS_PATTERN = re.compile(r"docs\.google\.com/forms/d/", re.IGNORECASE)
YOUTUBE_PATTERN = re.compile(r"(?:youtube\.com/watch\?v=|youtu\.be/)", re.IGNORECASE)


def classify_url(url: str, label: str = "") -> tuple[str, str]:
    """Classifies a URL into a link type and action taken.

    Returns:
        (link_type, action_taken)
    """
    if not url:
        return "unknown", "logged_only"

    url_clean = url.strip()

    # Rule: Google Drive Folder links MUST NOT be opened, just saved
    if DRIVE_FOLDER_PATTERN.search(url_clean):
        return "drive_folder", "saved_without_opening"

    # Other Google Drive and Google Workspace documents
    if DRIVE_FILE_PATTERN.search(url_clean):
        return "drive_file", "logged_only"
    if DOCS_PATTERN.search(url_clean):
        return "google_doc", "logged_only"
    if SLIDES_PATTERN.search(url_clean):
        return "google_slides", "logged_only"
    if SHEETS_PATTERN.search(url_clean):
        return "google_sheets", "logged_only"
    if FORMS_PATTERN.search(url_clean):
        return "google_form", "logged_only"
    if YOUTUBE_PATTERN.search(url_clean):
        return "youtube_video", "logged_only"

    return "external_link", "logged_only"
