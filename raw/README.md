# Raw Materials Staging Directory (`raw/`)

This directory is the immutable source intake zone for the **P3MD MBA Knowledge Base**. It sits outside `content/` and is never published directly by Quartz.

## Directory Structure

```text
raw/
├── courses/
│   ├── mk1/
│   │   ├── week-01/          <-- Drop slides, case PDFs, quiz briefs for MK1 Week 1
│   │   └── ...
│   └── mk[2-6]/
└── rabuan/                   <-- Drop Wednesday executive guest speaker decks & transcripts
```

## Supported Source Formats

- **Pre-Expanded Handbook Drafts (Recommended)**:
  - `handbook-draft.md`, `handbook-draft.tex`, or `handbook-draft.txt` (Generated from **Gemini Advanced Web**, **ChatGPT Prism**, or **Claude** using the Unified Master Prompt)
- **Primary Lecture Slides**: `.pdf`, `.pptx`
- **Case Studies & HBR Readings**: `.pdf`, `.docx`, `.md`
- **Audio & Video Transcripts**: `.txt`, `.vtt`, `.srt`
- **Cloud Links Index**: `drive_links_to_be_inserted.txt`

When files are placed here, invoke the ingestion workflow to parse them into the 4-act storytelling structure, extract qualifying concepts into `content/concepts/`, generate reading satellites, and resolve Quartz backlinks. See `.agents/skills/mba-wiki/references/hybrid-expansion-protocol.md` for the master prompts.
