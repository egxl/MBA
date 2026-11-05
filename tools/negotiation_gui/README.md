# Negotiation Styles Analysis - GUI Application & Document Generator

An interactive desktop application built in Python (Tkinter + python-docx) designed for MBA students and executives to complete the 20-pair **Negotiation Styles Analysis** assessment (Thomas-Kilmann / Lewicki model) and automatically generate the filled Word Document (`.docx`) using the original template.

---

## Features

1. **Interactive Point Distribution**:
   - For each of the 20 question pairs, distributes 5 points between statements **a** and **b**.
   - Moving statement A automatically recalculates statement B (`B = 5 - A`), ensuring arithmetic validity (`A + B = 5`).
   - Quick one-click preset buttons: `[5:0]`, `[4:1]`, `[3:2]`, `[2:3]`, `[1:4]`, `[0:5]`.

2. **Dual Questionnaire Views**:
   - **Step-by-Step Wizard**: Comfortable focused card with clear statement descriptions, negotiation style tags, visual distribution bar, and jump navigation buttons.
   - **Full Worksheet Grid**: Scrollable tabular overview of all 20 questions for rapid review and direct editing.

3. **Live Negotiation Profile Analytics**:
   - Real-time score aggregation across the 5 primary styles:
     - ⚔️ **Competing** (Assertive, Uncooperative)
     - 🤝 **Accommodating** (Unassertive, Cooperative)
     - 🌟 **Collaborating** (Assertive, Cooperative)
     - 🛡️ **Avoiding** (Unassertive, Uncooperative)
     - ⚖️ **Compromising** (Intermediate)
   - Color-coded progress bars with percentage of total (always 100 points total).
   - Dominant style identification, strengths, potential pitfalls, and situational guidance.

4. **One-Click Word Document (.docx) Export**:
   - Inserts **Name and NIM** into header.
   - Populates all 40 statement scores into **Table 0** with clean centered formatting.
   - Populates the 8 category item scores and column totals into **Table 1** (Scoring Key).
   - Preserves all original styles, shapes (including floating $\sum$ sum symbols), fonts, and layout.
   - Displays completion dialog with shortcuts to **Open Document** directly in Microsoft Word or **Show in Folder**.

5. **State Persistence**:
   - Save your in-progress answers to JSON (`Save JSON`).
   - Reload anytime (`Load JSON`).
   - Quick demo profile (`Fill Demo`) for testing.

---

## Quick Start

### Option 1: Double-Click Launcher (Windows)
Double-click `run.bat` in this folder or `run_negotiation_app.bat` at the repository root.

### Option 2: Command Line
```powershell
# From this directory
py app.py

# Or directly
py tools/negotiation_gui/app.py
```

---

## File Structure

```
tools/negotiation_gui/
├── app.py                # Main Tkinter desktop application
├── data.py               # Question items, 5 styles metadata & scoring key mapping
├── docx_generator.py     # Pure-Python Word template populator
├── template.docx         # Bundled original template document
├── test_generator.py     # Unit tests verifying docx manipulation & arithmetic
├── test_gui.py           # Headless GUI automated tests
├── run.bat               # Windows double-click runner
└── README.md             # Documentation
```
