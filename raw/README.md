# Raw Materials Staging Directory (`raw/`)

This directory is the immutable source intake zone for the **P3MD MBA Cohort Knowledge Base**. It sits outside `content/` and is never published directly by Quartz.

## Directory Structure

```text
raw/
├── courses/
│   ├── mk1/
│   │   ├── week-01/          <-- Drop slides, case PDFs, .docx notes, assignments
│   │   │   └── .extracted/   <-- Auto-generated text sidecars & safety scan manifest
│   │   └── ...
│   └── mk[2-6]/
└── rabuan/                   <-- Drop Wednesday executive guest speaker decks & transcripts
```

## Automated Intake (`npm run raw:prep`)

You do not need to manually rename folders or convert Office files before ingestion. Running `npm run raw:prep` automatically:

1. Normalizes week folder names (`Week 1` $\rightarrow$ `week-01`).
2. Extracts plain text from `.docx` and `.xlsx` files into `.extracted/<filename>.txt` for instant AI reading.
3. Runs a Step 0 safety scan on `.pdf`, `.txt`, and `.md` files and records `.extracted/intake-manifest.json`.

## Supported Source Formats

- **Primary Lecture Slides**: `.pdf`, `.pptx`
- **Case Studies, HBR Readings & Assignments**: `.pdf`, `.docx`, `.xlsx`, `.md`
- **Optional Pre-Expanded Handbook Drafts**: `handbook-draft.md`, `handbook-draft.tex`, or `handbook-draft.txt`
- **Audio & Video Transcripts**: `.txt`, `.vtt`, `.srt`, `.m4a`
- **Cloud Links Index**: `drive_links_to_be_inserted.txt`

See `.agents/skills/mba-wiki/SKILL.md` and `.agents/skills/mba-wiki/references/course-ingestion-protocol.md` for the cohort-wide ingestion and attribution rules.
