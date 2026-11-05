# Negotiation Styles Analysis - Standalone Interactive App

A standalone, zero-dependency Rust application designed to guide Executive MBA students interactively through the **Negotiation Styles Analysis (Thomas-Kilmann Conflict Mode Instrument / TKI)** worksheet, calculate scores, provide an executive diagnostic profile, and automatically populate the original assignment Word document (`.docx`).

---

## Quick Start

### Run the Interactive App
Simply run the compiled executable from PowerShell or CMD:

```powershell
.\tools\negotiation-app.exe
```

Or build and run from source with Cargo:

```powershell
cd tools/negotiation-app
cargo run --release
```

---

## Key Features

1. **Interactive Terminal Assessment:**
   - Evaluates all **20 question pairs** one by one with progress indication.
   - Smart point allocation: enter a single number `0` to `5` for statement `(a)`, and statement `(b)` is automatically computed as `5 - a`.
   - Supports explicit entries such as `3 2`, `3/2`, `4 1`, etc.
   - Non-destructive navigation: type `b` or `prev` to go back and revise any previous answer.
   - Direct jump: type `j <1-20>` to inspect or modify any question.

2. **Draft Persistence (Save / Load):**
   - Type `save` at any prompt to save current progress to `negotiation_draft.json`.
   - Type `load` to resume from a previous draft.

3. **Built-in Presets for Rapid Exploration:**
   - `collaborative` / `collaborator` (Integrative win-win focus)
   - `competitive` / `competitor` (Distributive value claiming focus)
   - `compromising` / `compromiser` (Pragmatic midpoint focus)
   - `accommodating` / `accommodator` (Relationship preservation focus)
   - `avoiding` / `avoider` (Diplomatic tension reduction focus)
   - `balanced` (Uniform distribution across styles)

4. **Executive Diagnostic Report:**
   - Real-time ASCII bar charts showing scores across all 5 styles:
     - **Competing** (Assertive, Uncooperative)
     - **Accommodating** (Unassertive, Cooperative)
     - **Collaborating** (Assertive, Cooperative)
     - **Avoiding** (Unassertive, Uncooperative)
     - **Compromising** (Intermediate)
   - Identifies **Primary Dominant Style**, **Secondary Supporting Style**, and **Underutilized / Blind Spot Style**.
   - Dual-Concern Framework visualization and strategic MBA recommendations (strengths, pitfalls, when to deploy).

5. **Automated DOCX Population:**
   - Injects student **Name and NIM** into the worksheet title block with proper formatting.
   - Automatically populates all 20 question pair scores into **Table 1** (Rows 0 to 60).
   - Automatically populates the 40 score cells in the **Scoring Key matrix** (Table 2).
   - Computes and writes column totals into the total row.
   - Automatically outputs an accompanying Markdown report (`.md`) and raw JSON data (`.json`).
   - Offers to immediately open the finished Word document in Microsoft Word on completion.

---

## Command Line Usage

```text
Usage: negotiation-app [OPTIONS]

Options:
  -n, --name <NAME>            Set student full name
      --nim <NIM>              Set student ID / NIM
  -i, --input <DOCX>           Custom template DOCX file path (default: embedded template)
  -o, --output <DOCX>          Target output DOCX file path (default: Negotiation_Styles_Analysis_Filled.docx)
  -p, --preset <PRESET>        Load preset: collaborative | competitive | compromising | accommodating | avoiding | balanced
      --draft <JSON>           Load state from an existing JSON draft
      --non-interactive        Run without terminal prompts (requires complete preset or draft)
  -h, --help                   Print help menu
```

### Examples

#### Launch Interactive Mode:
```powershell
.\tools\negotiation-app.exe
```

#### Pre-populate Name and NIM:
```powershell
.\tools\negotiation-app.exe --name "Havergal Samosir" --nim "29124001"
```

#### Batch Generation (e.g. for testing or templating):
```powershell
.\tools\negotiation-app.exe --preset collaborative --name "Havergal Samosir" --nim "29124001" --output "Negotiation_Assignment.docx" --non-interactive
```

---

## Technical Specifications

- **Language:** Rust 1.99.1 (2021 Edition)
- **Binary Size:** ~2.5 MB (standalone Windows x86_64 PE binary, zero runtime dependencies)
- **Template Embedding:** `include_bytes!` bundles `assets/template.docx` into the binary so it can run from any folder without external asset files.
- **XML Processing:** `xmltree` parses and mutates Word OpenXML structures cleanly while preserving namespaces, styles, and table borders.
- **Archive Engine:** `zip` with pure Rust `deflate` (no external C DLLs or MSVC runtime dependencies).
