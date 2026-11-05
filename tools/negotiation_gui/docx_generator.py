"""
Document Generator for Negotiation Styles Analysis.
Reads the original template.docx and populates:
- Name/NIM in header paragraph
- Individual question scores in Table 0 (Questions 1 to 20)
- Aggregated style scores and totals in Table 1 (Scoring Key)
"""

import os
from typing import Dict, Any, Tuple, Optional
import docx
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Pt, RGBColor

from data import QUESTIONS, TABLE_0_ROW_MAP, STYLES, STYLE_CONFIG


def normalize_answers(answers: Any) -> Dict[str, int]:
    """
    Normalizes answers into a dict of {"1a": score, "1b": score, ...}.
    Accepts:
    - Dict[str, int]: {"1a": 3, "1b": 2, ...}
    - Dict[int, Tuple[int, int]]: {1: (3, 2), 2: (4, 1), ...}
    - Dict[int, Dict[str, int]]: {1: {"a": 3, "b": 2}, ...}
    """
    normalized: Dict[str, int] = {}

    for q in QUESTIONS:
        q_num = q["num"]
        code_a = q["a"]["code"]
        code_b = q["b"]["code"]

        if code_a in answers and code_b in answers:
            normalized[code_a] = int(answers[code_a])
            normalized[code_b] = int(answers[code_b])
        elif q_num in answers:
            val = answers[q_num]
            if isinstance(val, (tuple, list)) and len(val) >= 2:
                normalized[code_a] = int(val[0])
                normalized[code_b] = int(val[1])
            elif isinstance(val, dict):
                normalized[code_a] = int(val.get("a", 0))
                normalized[code_b] = int(val.get("b", 0))
        elif str(q_num) in answers:
            val = answers[str(q_num)]
            if isinstance(val, (tuple, list)) and len(val) >= 2:
                normalized[code_a] = int(val[0])
                normalized[code_b] = int(val[1])
            elif isinstance(val, dict):
                normalized[code_a] = int(val.get("a", 0))
                normalized[code_b] = int(val.get("b", 0))
        else:
            # Default to 0 if missing
            normalized[code_a] = 0
            normalized[code_b] = 0

    return normalized


def compute_style_scores(answers_dict: Dict[str, int]) -> Dict[str, int]:
    """Computes total score for each of the 5 styles."""
    style_scores: Dict[str, int] = {}
    for style, cfg in STYLE_CONFIG.items():
        total = sum(answers_dict.get(item_code, 0) for item_code in cfg["items"])
        style_scores[style] = total
    return style_scores


def get_dominant_style(style_scores: Dict[str, int]) -> Tuple[str, int]:
    """Returns (dominant_style_name, score). If tie, returns the first highest."""
    max_score = -1
    dominant = "Collaborating"
    for style, score in style_scores.items():
        if score > max_score:
            max_score = score
            dominant = style
    return dominant, max_score


def _format_cell_score(cell, score_text: str, bold: bool = False, font_size_pt: float = 11.0, align=WD_ALIGN_PARAGRAPH.CENTER):
    """Safely formats score inside a table cell while keeping cell properties."""
    cell.text = ""  # Clears existing paragraphs
    p = cell.paragraphs[0]
    p.alignment = align
    # Keep line spacing compact
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.line_spacing = 1.0

    run = p.add_run(score_text)
    run.bold = bold
    run.font.size = Pt(font_size_pt)
    run.font.color.rgb = RGBColor(0x1A, 0x20, 0x2C)  # Dark slate for clean print


def fill_negotiation_docx(
    template_path: str,
    output_path: str,
    name: str = "",
    nim: str = "",
    answers: Any = None,
    sum_row: int = 9,
) -> Dict[str, Any]:
    """
    Fills the Negotiation Styles Analysis docx template.

    Parameters:
    - template_path: Path to the original template docx file.
    - output_path: Path where the filled docx will be saved.
    - name: Student/Participant name.
    - nim: Student ID (NIM).
    - answers: Answers dictionary (normalized or per question).
    - sum_row: Row index in Table 1 where column total should be placed (default 9).

    Returns:
    - Dictionary with results and analysis.
    """
    if not os.path.exists(template_path):
        raise FileNotFoundError(f"Template docx file not found: {template_path}")

    answers_dict = normalize_answers(answers or {})
    style_scores = compute_style_scores(answers_dict)
    dominant_style, max_score = get_dominant_style(style_scores)

    doc = docx.Document(template_path)

    # 1. Fill Name/NIM in paragraph 1
    if len(doc.paragraphs) > 1:
        p1 = doc.paragraphs[1]
        name_clean = (name or "").strip()
        nim_clean = (nim or "").strip()

        if name_clean and nim_clean:
            header_text = f"Name/NIM: {name_clean} / {nim_clean}"
        elif name_clean:
            header_text = f"Name/NIM: {name_clean}"
        elif nim_clean:
            header_text = f"Name/NIM: {nim_clean}"
        else:
            header_text = "Name/NIM:"

        p1.text = header_text

    # 2. Fill Table 0 (Questions 1 to 20)
    if len(doc.tables) > 0:
        table_0 = doc.tables[0]
        for q_num in range(1, 21):
            if q_num not in TABLE_0_ROW_MAP:
                continue
            row_a_idx, row_b_idx = TABLE_0_ROW_MAP[q_num]

            score_a = answers_dict.get(f"{q_num}a", 0)
            score_b = answers_dict.get(f"{q_num}b", 0)

            # Option a score in row_a_idx, col 1
            cell_a = table_0.cell(row_a_idx, 1)
            _format_cell_score(cell_a, str(score_a), bold=False, font_size_pt=10.5)

            # Option b score in row_b_idx, col 1
            cell_b = table_0.cell(row_b_idx, 1)
            _format_cell_score(cell_b, str(score_b), bold=False, font_size_pt=10.5)

    # 3. Fill Table 1 (Scoring Key)
    if len(doc.tables) > 1:
        table_1 = doc.tables[1]

        for style in STYLES:
            cfg = STYLE_CONFIG[style]
            score_col = cfg["score_col"]
            items = cfg["items"]

            # Rows 0 to 7: the 8 item scores
            for row_idx, item_code in enumerate(items):
                score = answers_dict.get(item_code, 0)
                cell = table_1.cell(row_idx, score_col)
                _format_cell_score(cell, str(score), bold=False, font_size_pt=10.5)

            # Total score
            total_style_score = style_scores.get(style, 0)

            # Fill Row 9 (aligned with sigma sum shape)
            if sum_row in (8, 9):
                sum_cell = table_1.cell(sum_row, score_col)
                _format_cell_score(sum_cell, str(total_style_score), bold=True, font_size_pt=11.5)

    # Ensure parent output directory exists
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    doc.save(output_path)

    return {
        "output_path": output_path,
        "name": name,
        "nim": nim,
        "style_scores": style_scores,
        "total_points": sum(style_scores.values()),
        "dominant_style": dominant_style,
        "dominant_score": max_score,
        "answers": answers_dict,
    }
