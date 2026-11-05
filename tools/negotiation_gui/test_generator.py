"""
Unit tests for docx_generator.py.
Verifies document generation, table cell placements, arithmetic sums, and data integrity.
"""

import os
import unittest
import docx

from docx_generator import fill_negotiation_docx, compute_style_scores, normalize_answers
from data import QUESTIONS, TABLE_0_ROW_MAP, STYLES, STYLE_CONFIG


class TestDocxGenerator(unittest.TestCase):
    def setUp(self):
        self.template_path = os.path.join(os.path.dirname(__file__), "template.docx")
        self.output_path = os.path.join(os.path.dirname(__file__), "test_filled_output.docx")

    def tearDown(self):
        if os.path.exists(self.output_path):
            try:
                os.remove(self.output_path)
            except OSError:
                pass

    def test_template_exists(self):
        self.assertTrue(os.path.exists(self.template_path), "Bundled template.docx must exist")

    def test_generate_sample_answers(self):
        # Create a realistic answer set where each question pair sums to 5
        sample_answers = {}
        # Let's give specific distributions:
        # e.g., Q1: (3, 2), Q2: (1, 4), ...
        for q in range(1, 21):
            score_a = (q % 6)       # between 0 and 5
            score_b = 5 - score_a   # between 5 and 0
            sample_answers[f"{q}a"] = score_a
            sample_answers[f"{q}b"] = score_b

        res = fill_negotiation_docx(
            template_path=self.template_path,
            output_path=self.output_path,
            name="John Doe",
            nim="12345678",
            answers=sample_answers,
            sum_row=9,
        )

        self.assertTrue(os.path.exists(self.output_path), "Output file should be created")
        self.assertEqual(res["total_points"], 100, "Total points across all styles must sum to 100")

        # Now re-open generated document and inspect
        doc = docx.Document(self.output_path)

        # 1. Check Name/NIM paragraph
        p1_text = doc.paragraphs[1].text
        self.assertIn("John Doe", p1_text)
        self.assertIn("12345678", p1_text)

        # 2. Check Table 0 cells
        t0 = doc.tables[0]
        for q_num in range(1, 21):
            ra, rb = TABLE_0_ROW_MAP[q_num]
            cell_a_txt = t0.cell(ra, 1).text.strip()
            cell_b_txt = t0.cell(rb, 1).text.strip()
            self.assertEqual(cell_a_txt, str(sample_answers[f"{q_num}a"]))
            self.assertEqual(cell_b_txt, str(sample_answers[f"{q_num}b"]))

        # 3. Check Table 1 cells and column sums
        t1 = doc.tables[1]
        style_scores = res["style_scores"]

        for style in STYLES:
            cfg = STYLE_CONFIG[style]
            col = cfg["score_col"]
            items = cfg["items"]

            col_sum = 0
            for r_idx, item_code in enumerate(items):
                cell_txt = t1.cell(r_idx, col).text.strip()
                expected_score = sample_answers[item_code]
                self.assertEqual(cell_txt, str(expected_score), f"Mismatch at style {style} item {item_code}")
                col_sum += expected_score

            self.assertEqual(col_sum, style_scores[style])

            # Check sum in Row 9
            sum_cell_txt = t1.cell(9, col).text.strip()
            self.assertEqual(sum_cell_txt, str(style_scores[style]), f"Mismatch in sum for style {style}")

        print("Test passed successfully! Output verified against all 20 questions and 5 style sums.")


if __name__ == "__main__":
    unittest.main()
