import csv
import json
import shutil
import tempfile
import unittest
from pathlib import Path

from gclass_scraping.src.config import classify_url
from gclass_scraping.src.exporter import export_all
from gclass_scraping.src.parser import extract_timestamps, parse_classwork, parse_courses


class TestClassroomParser(unittest.TestCase):
    def test_classify_url(self):
        # Folder links must be saved_without_opening
        folder_url = "https://drive.google.com/drive/folders/1aBcDeFgHiJkLmNoPqRsTuVwXyZ"
        ltype, action = classify_url(folder_url)
        self.assertEqual(ltype, "drive_folder")
        self.assertEqual(action, "saved_without_opening")

        # Multi-user folder links
        folder_u_url = "https://drive.google.com/drive/u/1/folders/1aBcDeFgHiJkLmNoPqRsTuVwXyZ?usp=drive_link"
        ltype, action = classify_url(folder_u_url)
        self.assertEqual(ltype, "drive_folder")
        self.assertEqual(action, "saved_without_opening")

        # Folderview URL
        folderview_url = "https://drive.google.com/folderview?id=0B_xyz123"
        ltype, action = classify_url(folderview_url)
        self.assertEqual(ltype, "drive_folder")
        self.assertEqual(action, "saved_without_opening")

        # Drive file links
        file_url = "https://drive.google.com/file/d/1234567890/view?usp=sharing"
        ltype, action = classify_url(file_url)
        self.assertEqual(ltype, "drive_file")
        self.assertEqual(action, "logged_only")

        # Google Docs
        doc_url = "https://docs.google.com/document/d/12345/edit"
        ltype, action = classify_url(doc_url)
        self.assertEqual(ltype, "google_doc")
        self.assertEqual(action, "logged_only")

        # Google Slides
        slides_url = "https://docs.google.com/presentation/d/67890/edit"
        ltype, action = classify_url(slides_url)
        self.assertEqual(ltype, "google_slides")
        self.assertEqual(action, "logged_only")

        # Google Sheets
        sheets_url = "https://docs.google.com/spreadsheets/d/abcde/edit"
        ltype, action = classify_url(sheets_url)
        self.assertEqual(ltype, "google_sheets")
        self.assertEqual(action, "logged_only")

        # Google Forms
        forms_url = "https://docs.google.com/forms/d/form123/viewform"
        ltype, action = classify_url(forms_url)
        self.assertEqual(ltype, "google_form")
        self.assertEqual(action, "logged_only")

        # YouTube
        yt_url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        ltype, action = classify_url(yt_url)
        self.assertEqual(ltype, "youtube_video")
        self.assertEqual(action, "logged_only")

    def test_extract_timestamps(self):
        sample_text = """
        Marketing Session 01
        Posted Sep 12, 2026, 8:30 AM (Edited Sep 13)
        Due Oct 1, 2026, 11:59 PM
        """
        ts = extract_timestamps(sample_text)
        self.assertIn("Sep 12, 2026", ts["posted_timestamp"])
        self.assertIn("Sep 13", ts["edited_timestamp"])
        self.assertIn("Oct 1, 2026", ts["due_date"])

        # Indonesian timestamps
        id_text = """
        Tugas Analisis Kasus
        Diposting 14 Sep 2026
        Tenggat 20 Sep 2026 23.59
        """
        ts_id = extract_timestamps(id_text)
        self.assertIn("14 Sep 2026", ts_id["posted_timestamp"])
        self.assertIn("20 Sep 2026", ts_id["due_date"])

    def test_parse_courses(self):
        sample_html = """
        <html>
          <body>
            <div role="listitem">
              <h2><a href="/c/NjU0MzIx">MK3 - Marketing Management</a></h2>
              <div class="subtitle">Cohort P3MD MBA</div>
            </div>
            <div role="listitem">
              <h2><a href="/c/OTg3NjU0">MK4 - Operations Management</a></h2>
              <div class="subtitle">Cohort P3MD MBA</div>
            </div>
          </body>
        </html>
        """
        courses = parse_courses(sample_html)
        self.assertEqual(len(courses), 2)
        self.assertEqual(courses[0]["course_id"], "NjU0MzIx")
        self.assertIn("Marketing Management", courses[0]["course_name"])
        self.assertEqual(courses[1]["course_id"], "OTg3NjU0")

    def test_parse_classwork(self):
        sample_html = """
        <html>
          <body>
            <section>
              <h2>Week 1 - Brand Strategy</h2>
              <div role="article">
                <h3><a href="/c/123/m/456">Session 1 Lecture Slides & Reading</a></h3>
                <div>Posted Sep 4, 2026</div>
                <div>
                  <a href="https://drive.google.com/file/d/abcdef/view" aria-label="Slide 01 - Brand Equity.pdf">Slide 01 - Brand Equity.pdf</a>
                  <a href="https://drive.google.com/drive/folders/folder123" title="Case Studies Repository">Case Studies Repository</a>
                </div>
              </div>
            </section>
          </body>
        </html>
        """
        items = parse_classwork(sample_html, course_meta={"course_id": "123", "course_name": "MK3"})
        self.assertEqual(len(items), 1)
        item = items[0]
        self.assertEqual(item["item_type"], "material")
        self.assertEqual(item["topic"], "Week 1 - Brand Strategy")
        self.assertEqual(item["posted_timestamp"], "Sep 4, 2026")

        attachments = item["attachments"]
        self.assertEqual(len(attachments), 2)

        file_att = attachments[0]
        self.assertEqual(file_att["file_name"], "Slide 01 - Brand Equity.pdf")
        self.assertEqual(file_att["link_type"], "drive_file")
        self.assertEqual(file_att["action_taken"], "logged_only")

        folder_att = attachments[1]
        self.assertEqual(folder_att["file_name"], "Case Studies Repository")
        self.assertEqual(folder_att["link_type"], "drive_folder")
        self.assertEqual(folder_att["action_taken"], "saved_without_opening")

    def test_export_all(self):
        temp_dir = Path(tempfile.mkdtemp())
        try:
            sample_items = [
                {
                    "scraped_at": "2026-11-04T14:00:00Z",
                    "course_id": "c1",
                    "course_name": "MK3 Marketing",
                    "course_section": "MBA",
                    "topic": "Week 1",
                    "item_type": "material",
                    "item_title": "Intro to Marketing",
                    "item_url": "https://classroom.google.com/c/c1/m/m1",
                    "posted_timestamp": "Sep 1, 2026",
                    "due_date": None,
                    "attachments": [
                        {
                            "file_name": "Deck.pdf",
                            "url": "https://drive.google.com/file/d/xyz",
                            "link_type": "drive_file",
                            "action_taken": "logged_only",
                        },
                        {
                            "file_name": "Week 1 Folder",
                            "url": "https://drive.google.com/drive/folders/f1",
                            "link_type": "drive_folder",
                            "action_taken": "saved_without_opening",
                        },
                    ],
                }
            ]

            out_files = export_all(sample_items, output_dir=temp_dir)
            self.assertTrue(out_files["json"].exists())
            self.assertTrue(out_files["csv"].exists())
            self.assertTrue(out_files["md"].exists())

            # Check JSON
            with open(out_files["json"], "r", encoding="utf-8") as f:
                data = json.load(f)
                self.assertEqual(len(data), 1)

            # Check CSV
            with open(out_files["csv"], "r", encoding="utf-8") as f:
                rows = list(csv.reader(f))
                self.assertEqual(len(rows), 3)  # header + 2 attachment rows

            # Check Markdown
            with open(out_files["md"], "r", encoding="utf-8") as f:
                md_content = f.read()
                self.assertIn("MK3 Marketing", md_content)
                self.assertIn("Deck.pdf", md_content)
                self.assertIn("`drive_folder`", md_content)
        finally:
            shutil.rmtree(temp_dir, ignore_errors=True)


if __name__ == "__main__":
    unittest.main()
