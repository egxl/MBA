# Processed Raw Archive (`archive/`)

This directory is the cold storage archive for raw binary materials that have **already been ingested** into the **P3MD MBA Knowledge Base**.

## Purpose

- **Provenance & Reference**: Holds original lecture slides, case files, student submissions, and audio recordings for academic reference or revision.
- **Git Ignored**: Binary assets (PDFs, PPTXs, MP4s, DOCXs) remain untracked in git to keep repository cloning fast and lightweight.
- **Dormant Storage**: During standard ingestion runs, the agent **never scans this directory**. It is only inspected if explicitly requested to re-read historical files.

## Structure

```text
archive/
├── courses/
│   ├── mk1/
│   │   ├── week-01/
│   │   │   └── .extracted/   <-- Text extraction cache
│   │   └── ...
│   └── mk[2-6]/
└── rabuan/                   <-- Wednesday plenary sessions
```
