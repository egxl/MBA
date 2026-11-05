"""
Headless unit test for app.py.
Instantiates the GUI app, simulates answering questions, tests spoiler toggle,
checks live updates, and generates docx.
"""

import os
import unittest
from unittest.mock import patch
import docx

from app import NegotiationApp


class TestNegotiationAppGUI(unittest.TestCase):
    def setUp(self):
        self.app = NegotiationApp()
        self.app.withdraw()  # Hide window during automated test
        self.output_test_file = os.path.join(self.app.app_dir, "test_gui_output.docx")

    def tearDown(self):
        self.app.destroy()
        if os.path.exists(self.output_test_file):
            try:
                os.remove(self.output_test_file)
            except OSError:
                pass

    def test_app_initialization(self):
        self.assertEqual(len(self.app.answers), 20)
        self.assertEqual(self.app.current_q_idx, 0)
        self.assertTrue(os.path.exists(self.app.var_template_path.get()))
        # Verify spoiler mode is False by default
        self.assertFalse(self.app.var_show_spoilers.get())

    def test_anti_spoiler_toggle(self):
        self.app._load_question(0)
        # By default, spoilers are hidden
        self.assertEqual(self.app.lbl_tag_a.cget("text"), "Statement A")
        self.assertEqual(self.app.lbl_tag_b.cget("text"), "Statement B")
        self.assertTrue(self.app.frame_blind.winfo_manager() != "")

        # Enable spoilers
        self.app._enable_spoilers()
        self.assertTrue(self.app.var_show_spoilers.get())
        self.assertIn("Accommodating", self.app.lbl_tag_a.cget("text"))
        self.assertIn("Collaborating", self.app.lbl_tag_b.cget("text"))
        self.assertTrue(self.app.frame_spoilers.winfo_manager() != "")

        # Disable spoilers again
        self.app._disable_spoilers()
        self.assertFalse(self.app.var_show_spoilers.get())
        self.assertEqual(self.app.lbl_tag_a.cget("text"), "Statement A")
        self.assertEqual(self.app.lbl_tag_b.cget("text"), "Statement B")

    def test_horizontal_slider_and_navigation(self):
        # Set Q1 score: A=4, B=1
        self.app._load_question(0)
        self.app._set_score_a(4)
        self.assertEqual(self.app.answers[1], [4, 1])
        self.assertTrue(self.app.is_answered[1])
        self.assertEqual(self.app.lbl_ratio_display.cget("text"), "4 pts  :  1 pts")

        # Navigate next
        self.app._next_question()
        self.assertEqual(self.app.current_q_idx, 1)

        # Set Q2 score: A=2, B=3
        self.app._set_score_a(2)
        self.assertEqual(self.app.answers[2], [2, 3])
        self.assertEqual(self.app.lbl_ratio_display.cget("text"), "2 pts  :  3 pts")

    @patch("tkinter.messagebox.showinfo")
    def test_demo_fill_and_generate(self, mock_showinfo):
        # Fill demo data
        self.app._fill_demo_data()
        self.assertEqual(sum(1 for a in self.app.is_answered.values() if a), 20)

        # Set name and nim
        self.app.var_name.set("Jane MBA")
        self.app.var_nim.set("29124999")
        self.app.var_output_path.set(self.output_test_file)

        # Mock the success dialog so it doesn't block
        with patch.object(self.app, "_show_success_dialog") as mock_dialog:
            self.app._generate_docx()
            mock_dialog.assert_called_once()
            res = mock_dialog.call_args[0][0]
            self.assertEqual(res["total_points"], 100)
            self.assertEqual(res["name"], "Jane MBA")
            self.assertEqual(res["nim"], "29124999")

        # Verify generated file on disk
        self.assertTrue(os.path.exists(self.output_test_file))
        doc = docx.Document(self.output_test_file)
        self.assertIn("Jane MBA", doc.paragraphs[1].text)
        self.assertIn("29124999", doc.paragraphs[1].text)
        print("All GUI tests passed successfully!")


if __name__ == "__main__":
    unittest.main()
