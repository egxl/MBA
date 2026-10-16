---
name: mba-wiki
description: >-
  Compounding knowledge management system for the P3MD MBA portal. Ingests raw slides, case studies,
  and plenary transcripts into an enriched, 4-act storytelling lecture wiki with dedicated reading
  satellites, multi-disciplinary concepts, and living entities in Quartz.
---

# MBA Wiki Skill (`mba-wiki`)

The **MBA Wiki** skill transforms raw MBA slide decks, Harvard business cases, academic papers, and executive guest lectures into an interconnected, compounding knowledge base powered by Quartz 4.

```
       +-------------------------------------------------------------+
       |               P3MD MBA COHORT KNOWLEDGE BASE                |
       |                (Quartz 4 Static Web Portal)                 |
       +-------------------------------------------------------------+
                                      |
         Curricular Journey (Spine)   |   Semantic Lattice (Network)
                                      v
       +-------------------------------------------------------------+
       |                         MBA-WIKI                            |
       |  - Master Hub + Satellites   - Depth & Rigor Standard       |
       |  - 4-Act Storytelling Engine - Multi-MK Concept Compounding |
       |  - Rabuan Plenary Isolation  - Zero-Broken-Link Precision   |
       +-------------------------------------------------------------+
                    |                                  |
   Reads (Staging)  |                                  | Writes & Maintains
                    v                                  v
+-----------------------+              +-------------------------------------+
|      RAW STAGING      |              |              THE PORTAL             |
| raw/courses/mkX/wYY/  |              | - courses/mk[1-6]/week-YY/index.md  |
| raw/rabuan/           |              | - courses/.../reading-[slug].md     |
| (Transcripts, Slides, |              | - courses/.../case-[slug].md        |
|  Case PDFs, Outlines) |              | - rabuan/YYYY-MM-DD-speaker.md      |
|                       |              | - concepts/ (Living topics/metrics) |
|                       |              | - entities/ (Theorists, BUMNs, Cos) |
+-----------------------+              +-------------------------------------+
```

---

## Operating Principles & Golden Rules

1. **The Depth & Rigor Mandate (The "No Lost Signal" Contract)**:
   Never over-simplify raw academic papers, Harvard business cases, or lecture slides into superficial bullet summaries.
   - Retain all named corporate case vignettes (CEOs, companies, dilemmas).
   - Reconstruct all diagnostic exercises, worksheets, scoring rubrics, and step-by-step prompts.
   - Reconstruct comparative tables and exhibits in Markdown.
   - Cite all empirical statistics, survey percentages, and formulas in KaTeX ($\LaTeX$).
   - See **[Depth & Academic Rigor Standard](./references/depth-and-rigor-standard.md)**.

2. **Master Hub + Dedicated Satellite Architecture**:
   To prevent compressing heavy 10-page HBR articles or 20-page Harvard cases:
   - `index.md`: The cohesive **Master Lecture Hub** synthesizing slides, in-class discussions, and BUMN context across the 4-Act narrative.
   - `reading-[author]-[slug].md`: Standalone deep-dive study notes for each foundational reading.
   - `case-[company]-[slug].md`: Standalone business case studies with quantitative exhibits and strategic options.
   - `quiz-[num]-discussion.md`: Standalone exam/quiz preparation notes.

3. **The 4-Act Storytelling Contract (Anti-Slop)**:
   Structure lecture hubs as an executive narrative:
   - **Act 1: The Executive Dilemma & Boardroom Context** (The hook; what breaks when leaders fail here).
   - **Act 2: The Core Mechanism & Analytical Frameworks** (Deep theoretical breakdown, models, formulas).
   - **Act 3: Real-World Crucible (Indonesian BUMN & Global Enterprise Context)** (Practical friction, state-owned enterprise dynamics, ASEAN business realities).
   - **Act 4: Boardroom Reflection & Key Takeaways** (Discussion prompts, ALP application, exam synthesis).

4. **The Concept Qualification Gate (Anti-Sprawl)**:
   Do NOT turn ordinary nouns (_"Meeting"_, _"Email"_, _"Discussion"_) into concept pages.
   A concept page is generated in `content/concepts/<slug>.md` ONLY if it meets at least one criterion:
   - A recognized academic framework (_Maslow's Hierarchy_, _Porter's 5 Forces_, _DuPont Analysis_).
   - A measurable business formula or metric (_WACC_, _Compa-Ratio_, _ROIC_, _Turnover Drag_).
   - A core strategic mechanism spanning multiple business functions (_Psychological Safety_, _Agency Theory_, _Resource Allocation_).

5. **The Strict Anti-Stub Rule & MOC Synchronization**:
   - Never create empty, stub, or mock weekly lecture files.
   - In each course's `content/courses/mkX-.../index.md`, un-ingested weeks must remain unlinked in the syllabus table with status `Scheduled (Pending Ingestion)`.
   - Only when authentic materials are ingested do you flip the row to **Ingested** and add the active Quartz wikilink.

6. **The Hub Directory Registration Contract**:
   Every newly created or modified concept or entity must be registered in its master index:
   - Concepts $\rightarrow$ `content/concepts/index.md` (Six Core Business Pillars grid).
   - Entities $\rightarrow$ `content/entities/index.md` (Principal Taxonomy directory).
   - Rabuan Sessions $\rightarrow$ `content/rabuan/index.md` (Executive Masterclass Archive table).

7. **The Digital Media Archives Standard**:
   Every weekly lecture note and Rabuan session must feature a dedicated `## 📂 Primary Source Media & Digital Archives` table linking to official Google Drive video streams, slide downloads, and raw staging paths.

8. **Bilingual Canonical Naming**:
   - Slugs are always canonical academic English: `content/concepts/resource-allocation.md`.
   - Frontmatter includes Indonesian aliases: `aliases: ["Alokasi Sumber Daya", "Alokasi Kapital"]`.

9. **The Rabuan Anti-Contamination Boundary**:
   - Rabuan notes (`content/rabuan/`) may freely cite academic concepts.
   - Core academic course notes do not depend on Rabuan for syllabus completion, linking to Rabuan only via optional callout boxes (`> [!TIP] Practical BUMN Perspective`).

10. **Quartz Title & Link Integrity**:
    - Omit body `<h1>` tags (Quartz already renders frontmatter `title` as `<h1>`).
    - Use relative or absolute Quartz wikilinks: `[[concepts/resource-allocation|Resource Allocation]]`.
    - Always verify with `npm run titles:check`, `npm test`, `npm run check`, and `npx quartz build`.

---

## Detailed Reference Guides

- **[Hybrid Expansion Protocol (Slide-to-Handbook)](./references/hybrid-expansion-protocol.md)**: Unified format-agnostic master expansion prompt with mandatory web search grounding, visual asset preservation, and dual-staging (.md/.tex) support.
- **[Depth & Academic Rigor Standard](./references/depth-and-rigor-standard.md)**: Guidelines for unabridged ingestion, worksheets, and case exhibits.
- **[Canonical Schema & Document Templates](./references/schema-templates.md)**: Frontmatter and markdown skeletons for all 5 document archetypes.
- **[Course Ingestion Protocol](./references/course-ingestion-protocol.md)**: Step-by-step 8-phase execution checklist from `raw/` intake to build verification.

---

## Core Workflows

### Workflow 1: Ingest Course Lecture & Satellites (`ingest-course`)

Follow the 8 phases in **[Course Ingestion Protocol](./references/course-ingestion-protocol.md)** and **[Hybrid Expansion Protocol](./references/hybrid-expansion-protocol.md)**:

1. **Intake & Triage**:
   - Check `raw/courses/mkX/week-YY/` for pre-expanded drafts:
     - If `handbook-draft.md`, `handbook-draft.tex`, or `handbook-draft.txt` is present $\rightarrow$ read directly as the expanded lecture baseline.
     - If only raw slides exist $\rightarrow$ prompt the user to run the Slide-to-Handbook master prompt in Gemini Web or Prism.
   - Parse `drive_links_to_be_inserted.txt` for official cloud stream/download links.
2. Author dedicated reading satellites (`reading-*.md`) and case notes (`case-*.md`) with full exhibits and worksheets.
3. Author the Master Lecture Hub (`index.md`) with 4-Act narrative and media archive table.
4. Extract qualifying concepts into `content/concepts/` and entities into `content/entities/`.
5. Synchronize master hubs (`concepts/index.md` and `entities/index.md`).
6. Flip course roadmap row in `courses/mkX/index.md` from `Scheduled` to `Ingested`.
7. Verify with `npm run check`, `npm test`, `npx quartz build`.

### Workflow 2: Ingest Rabuan Plenary (`ingest-rabuan`)

1. Read keynote slides, transcripts, or summaries from `raw/rabuan/`.
2. Author `content/rabuan/YYYY-MM-DD-speaker-topic.md` using the guest-lecture schema.
3. Author speaker & enterprise profile in `content/entities/<slug>.md`.
4. Register the session in `content/rabuan/index.md`.
5. Link qualifying concepts without polluting core course notes.

### Workflow 3: Concept Synthesis & Compounding (`compound-concept`)

1. Open `content/concepts/<slug>.md`.
2. Harmonize multi-disciplinary lenses across MK1–MK6.
3. Document cross-functional boardroom friction (e.g. Finance vs Ops vs HR).
4. Detail Action Learning Project (ALP) BUMN application.
5. Register and cross-link in `content/concepts/index.md`.
