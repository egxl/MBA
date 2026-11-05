# Staging Intake Directory (`inbox/`)

This directory is the unsorted staging drop zone for raw materials before ingestion into the **P3MD MBA Knowledge Base**.

## Usage

1. **Drop files freely**: Place any raw slide decks (`.pdf`, `.pptx`), case studies, notes (`.docx`), spreadsheets (`.xlsx`), or recordings here without any manual sorting or folder creation.
2. **Trigger Ingestion**:
   Prompt the agent in chat:
   ```text
   /mba-wiki ingest this to mk3 week 1
   ```
   _(or `mk4 week 6`, `rabuan`, etc.)_

## Lifecycle

- When ingestion begins, the agent inspects **only** this directory.
- The files are extracted and synthesized into clean markdown inside `content/` (which is tracked in git).
- The raw source binaries are moved out of `inbox/` into `archive/` (which is ignored by git).
- This directory is kept clean and empty between ingestion runs.
