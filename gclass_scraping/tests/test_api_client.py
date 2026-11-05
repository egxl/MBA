import sys
import unittest
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.api_client import GoogleClassroomApiClient


class TestGoogleClassroomApiClient(unittest.TestCase):
    def setUp(self):
        self.client = GoogleClassroomApiClient(bearer_token="ya29.mock_token")

    def test_format_due_date(self):
        due_date = {"year": 2026, "month": 11, "day": 15}
        due_time = {"hours": 23, "minutes": 59}
        res = self.client._format_due_date(due_date, due_time)
        self.assertEqual(res, "2026-11-15 23:59")

        # Missing due_date
        self.assertIsNone(self.client._format_due_date(None, None))

    def test_parse_materials(self):
        materials = [
            {
                "driveFile": {
                    "driveFile": {
                        "id": "1abc_drive_id",
                        "title": "Week 1 Syllabus.pdf",
                        "alternateLink": "https://drive.google.com/file/d/1abc_drive_id/view"
                    }
                }
            },
            {
                "youtubeVideo": {
                    "id": "xyz987",
                    "title": "Lecture Recording",
                    "alternateLink": "https://youtube.com/watch?v=xyz987"
                }
            },
            {
                "link": {
                    "url": "https://drive.google.com/drive/folders/1folder_id",
                    "title": "Course Materials Folder"
                }
            }
        ]
        parsed = self.client._parse_materials(materials)
        self.assertEqual(len(parsed), 3)

        # Drive file
        self.assertEqual(parsed[0]["link_type"], "drive_file")
        self.assertEqual(parsed[0]["file_name"], "Week 1 Syllabus.pdf")
        self.assertEqual(parsed[0]["action_taken"], "logged_only")

        # YouTube video
        self.assertEqual(parsed[1]["link_type"], "youtube_video")

        # Drive folder (Zero folder traversal check)
        self.assertEqual(parsed[2]["link_type"], "drive_folder")
        self.assertEqual(parsed[2]["action_taken"], "saved_without_opening")


if __name__ == "__main__":
    unittest.main()
