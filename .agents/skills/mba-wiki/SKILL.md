---
name: mba-wiki
description: >-
  Compounding cohort-wide knowledge management system for the P3MD MBA portal. Ingests raw slides,
  case studies, syndicate/personal assignments, and plenary transcripts into an enriched modular
  lecture handbook with cohort-ready case dossiers, pre/post-deadline assignment guides, and
  selective cross-curricular concepts in Quartz 4.
---

# MBA Wiki Skill (`mba-wiki`)

The **MBA Wiki** skill transforms raw MBA slide decks, business cases, academic papers, student work, and executive guest lectures into an interconnected, cohort-wide academic portal powered by Quartz 4.

```
       +-------------------------------------------------------------+
       |          P3MD MBA COHORT-WIDE KNOWLEDGE PORTAL              |
       |                (Quartz 4 Static Web Portal)                 |
       +-------------------------------------------------------------+
                                      |
         Curricular Journey (Spine)   |   Semantic Lattice (Network)
                                      v
       +-------------------------------------------------------------+
       |                         MBA-WIKI                            |
       |  - Automated Raw Intake (`npm run raw:prep`)                |
       |  - Pre-Class (Spoiler-Free) vs Post-Class (Debrief) Modes   |
       |  - F9 Syndicate & Maintainer Attribution Standard           |
       |  - Selective Concept Gate (1-2/wk) + Auto Sync (`wiki:sync`)|
       +-------------------------------------------------------------+
                    |                                  |
   Reads (Staging)  |                                  | Writes & Maintains
                    v                                  v
+-----------------------+              +-------------------------------------+
|      RAW STAGING      |              |              THE PORTAL             |
| raw/courses/mkX/wYY/  |              | - courses/mk[1-6]/week-YY/index.md  |
| raw/rabuan/           |              | - courses/.../case-[slug].md        |
| (.pdf, .pptx, .docx,  |              | - courses/.../reading-[slug].md     |
|  .xlsx, .m4a, .md)    |              | - courses/.../assignment-[slug].md  |
| + .extracted/ cache   |              | - concepts/ & entities/ (Selective) |
+-----------------------+              +-------------------------------------+
```

---

## Operating Principles & Golden Rules

1. **Cohort-Wide Audience & Attribution Standard**:
   This portal is published for the **entire P3MD Batch I Soedirman cohort**, not as a private personal diary.
   - Write all pages in an authoritative, cohort-helpful institutional study guide voice.
   - **Group Assignment Attribution**: When synthesizing group submissions from `raw/`, credit **`F9 (Class F / Syndicate 9)`** (or **`F9 (Class F / Syndicate 9) & the Portal Maintainer`** when combining group and personal files).
   - **Personal Assignment Attribution**: When synthesizing an individual student submission, credit **`the Portal Maintainer`**—**never expose the maintainer's personal name or compare raw personal file drafts** on the public site.

2. **Two-Phase Assignment Lifecycle (Pre-Class vs. Post-Class Modes)**:
   Because the whole cohort reads this portal, assignment handling adapts to whether the deadline has passed:
   - **Pre-Class Mode (Spoiler-Free Brief)**: Used before an assignment is due. Publishes the full Master Lecture Hub (`index.md`) and a **Cohort Pre-Class Assignment & Case Brief** (`assignment-brief.md` or `case-[slug].md`) that maps case facts, timelines, quantitative exhibits, and slide-to-question connections **without spoiling the group recommendation or final answers** (*"Ini peta, bukan jawaban"*).
   - **Post-Class / Archive Mode (Full Debrief)**: Used after the deadline or for past weeks. Synthesizes the full worked calculations, strategic options matrix, and classroom cold-call defense into a polished **Model Analysis & Case Debrief**.

3. **Zero-Banner Direct Ingestion (Optional Handbook Boost)**:
   - Never place yellow `[!WARNING] Handbook Expansion Pending` banners on published lecture pages.
   - Whether `raw/courses/mkX/week-YY/` contains a pre-expanded `handbook-draft.md` or only raw slides/PDFs/DOCXs, Antigravity compiles a complete, first-class modular **Master Lecture Hub (`index.md`)** in one pass. If `handbook-draft.*` is present, use it as an automatic boost; if absent, expand directly from the slides and textbook context.

4. **Automated Raw Intake & Safety Scanning (`npm run raw:prep`)**:
   - Before reading a raw folder, run `npm run raw:prep`.
   - This automatically normalizes messy folder names (`Week 1` $\rightarrow$ `week-01`), extracts clean plain text from `.docx` and `.xlsx` files into `.extracted/*.txt` for instant AI reading, and runs a **Step 0 Safety Scan** on PDFs/TXTs for steganographic or prompt-injection anomalies.

5. **The Selective Concept & Entity Gate (Anti-Sprawl — Max 1–2 Per Week)**:
   To prevent drowning the knowledge graph in hundreds of thin pages:
   - Extract at most **1 to 2 foundational concepts** per week into `content/concepts/<slug>.md` (only major cross-curricular frameworks or quantitative formulas).
   - Create an entity page in `content/entities/<slug>.md` **only** for primary case enterprises, lead faculty, or foundational theorists that recur across multiple weeks.
   - Run `npm run wiki:sync` (`node ./scripts/check-wiki-integrity.mjs --sync`) to automatically register any new concepts or entities in `concepts/index.md` and `entities/index.md`.

6. **The Depth & Rigor Mandate (The "No Lost Signal" Contract)**:
   Never over-simplify raw academic papers, business cases, or lecture slides into superficial bullet summaries.
   - Retain all named corporate case vignettes (CEOs, companies, dilemmas).
   - Reconstruct all diagnostic exercises, worksheets, scoring rubrics, and comparative exhibits in Markdown.
   - Cite all empirical statistics, survey percentages, and formulas in KaTeX ($\LaTeX$).
   - Avoid artificial theatrical dramatization (no arbitrary "Act 1–4" labels); use clean, topic-led modular sections.

7. **The Strict Anti-Stub Rule & MOC Synchronization**:
   - Never create empty, stub, or mock weekly lecture files.
   - In each course's `content/courses/mkX-.../index.md`, un-ingested weeks must remain unlinked in the syllabus table with status `_Scheduled (Pending Ingestion)_`.
   - When ingested, flip the row to **`**Ingested**`** and add the active Quartz wikilink.

8. **Bilingual Canonical Naming & Quartz Integrity**:
   - Slugs are canonical academic English (`content/concepts/resource-allocation.md`) with Indonesian frontmatter `aliases`.
   - Omit body `<h1>` tags (Quartz renders frontmatter `title` as `<h1>`).
   - Always verify with `npm run wiki:sync`, `npm run check`, `npm test`, and `npx quartz build`.

---

## Detailed Reference Guides

- **[Course Ingestion Protocol](./references/course-ingestion-protocol.md)**: Step-by-step execution checklist from `npm run raw:prep` to cohort publication.
- **[Hybrid Expansion Protocol (Optional Boost)](./references/hybrid-expansion-protocol.md)**: Optional external LLM prompt for pre-expanding heavy slide decks.
- **[Depth & Academic Rigor Standard](./references/depth-and-rigor-standard.md)**: Guidelines for unabridged ingestion, worksheets, and case exhibits.
- **[Canonical Schema & Document Templates](./references/schema-templates.md)**: Frontmatter and markdown skeletons for all document archetypes (including Pre-Class Briefs and Post-Class Debriefs).

---

## Core Workflows

### Workflow 1: Ingest Course Week (`ingest-course`)

1. **Automated Prep & Safety Scan**:
   - Run `npm run raw:prep` to normalize `raw/courses/mkX/week-YY/` folder names, extract `.docx`/`.xlsx` text into `.extracted/`, and inspect `intake-manifest.json` for PDF safety.
2. **Determine Assignment Mode**:
   - **Post-Class Mode (Default for past weeks / when group submissions exist in `raw/`)**: Author full case analysis and worked assignment debriefs, attributing group insights to **`F9 (Class F / Syndicate 9)`** and individual files to **`the Portal Maintainer`** (never naming the maintainer).
   - **Pre-Class Mode (When requested for upcoming deadlines)**: Author a spoiler-free **Assignment & Case Skim Brief** mapping exhibits, timeline, and guiding frameworks without giving away final group recommendations.
3. **Author Satellites First**:
   - Create `case-[slug].md`, `reading-[slug].md`, or `assignment-[slug].md` with full exhibits, tables, and formulas.
4. **Author Master Lecture Hub (`index.md`)**:
   - Synthesize slides, `handbook-draft.md` (if present), lecturer notes (`Catatan`), cases, and BUMN context into a comprehensive modular chapter.
5. **Selective Concept/Entity Extraction & Auto-Sync**:
   - Extract at most 1–2 major concepts/entities and run `npm run wiki:sync` to auto-register them in the hub directories.
6. **Flip Course MOC & Verify**:
   - Update `content/courses/mkX-.../index.md` row to `**Ingested**`.
   - Run `npm run check`, `npm test`, and `npx quartz build`.

### Workflow 2: Upgrade Pre-Class Brief to Post-Class Debrief (`upgrade-week`)

When a week was initially published in **Pre-Class (Spoiler-Free) Mode** and the deadline has now passed (or when a deeper `handbook-draft.md` is added):
1. Run `npm run raw:prep` to extract newly added `Group 9` / maintainer submission files.
2. Enrich `assignment-*.md` or `case-*.md` with the worked analytical walkthrough, attributing **`F9 (Class F / Syndicate 9)`** or **`the Portal Maintainer`**.
3. Verify with `npm run check`, `npm test`, and `npx quartz build`.

### Workflow 3: Ingest Rabuan Plenary (`ingest-rabuan`)

1. Read keynote slides, transcripts, or summaries from `raw/rabuan/`.
2. Author `content/rabuan/YYYY-MM-DD-speaker-topic.md` using the guest-lecture schema.
3. Author speaker profile in `content/entities/<slug>.md` and register in `content/rabuan/index.md`.
4. Run `npm run wiki:sync` and `npm run check`.
