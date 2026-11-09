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

9. **Epistemic Primacy & Conflict Resolution (Handling Collisions & Placeholders)**:
   - **Hierarchy of Authority**: Authentic primary materials (Tier 1: SBM ITB slide decks, official cases, rubrics) strictly supersede and invalidate all provisional scaffolding, tentative syllabus guesses, or early hallucinated placeholders (Tier 0).
   - **Reconnaissance Before Ingestion**: When ingesting `mkX week-YY`, inspect `content/courses/mkX/week-YY/` to catalog existing files.
   - **Full Master Rewrite**: Never append blindly to existing notes; completely re-author `index.md` from primary evidence.
   - **Zombie Satellite Purge**: Delete obsolete or fabricated satellites; overwrite matching satellites with verified academic depth.
   - **Syllabus & Lattice Realignment**: Reconcile topic titles in `content/courses/mkX-.../index.md` to reflect the authentic lecture slides, update concepts/entities, and verify with `npm run check` and `npx quartz build`.

10. **The First-Principles Accessibility Mandate (Zero-Prerequisite & Anti-Formula-Dump Standard)**:
    This portal exists so anyone—even without prior business, mathematical, or psychological training—can master the material from first principles.
    - **Never Dump Formulas**: Do not output consecutive display equations (`$$...$$`) without explanatory prose.
    - **The 4-Layer Pedagogical Architecture**: Every quantitative formula or multi-part framework must provide:
      1. *Plain-English Intuition & Everyday Analogy* (why the concept exists in the real world before diving into technicalities).
      2. *Prerequisite & Jargon Decoder* (explaining underlying variables like EBIT, Poisson variance, discount rate, or psychological ego states on the spot).
      3. *Structural Anatomy of the Mechanism* (explaining why the numerator scales the metric and why the denominator acts as a penalty or drag).
      4. *Micro-Numerical Toy Example* (a 10-second mental-math walkthrough with simple, round numbers).
    - Always verify accessibility with `npm run wiki:pedagogy -- --target "<course/week>"`.

11. **Visual Fidelity & Multi-Type Mermaid Selection Mandate**:
    When recreating visual exhibits, charts, matrices, or frameworks from raw slides, cases, or readings:
    - **Never default reflexively to `flowchart LR`**.
    - Consult **[Mermaid Diagram Taxonomy & Selection Guide](./references/mermaid-diagram-taxonomy.md)** to match the visual archetype across all 25+ supported Mermaid.js diagram types:
      - 2x2 Matrices & Positioning Grids $\rightarrow$ `quadrantChart`
      - Value & Cash Flow Waterfalls $\rightarrow$ `sankey-beta`
      - Cartesian Trends & Comparative Bars $\rightarrow$ `xychart-beta`
      - Multi-Attribute Competency / 5-Forces Benchmarks $\rightarrow$ `radar-beta`
      - Market Share & Budget Breakdown $\rightarrow$ `pie`
      - Overlapping Capabilities / Sweet Spots $\rightarrow$ `venn-beta`
      - Sense-Making / Decision Frameworks $\rightarrow$ `cynefin-beta`
      - Chronology & Milestone Histories $\rightarrow$ `timeline`
      - 30-60-90 Day Implementation Schedules $\rightarrow$ `gantt`
      - Customer / Employee Journeys $\rightarrow$ `journey`
      - Stage-Gate & Backlog Pipelines $\rightarrow$ `kanban`
      - Concept & Issue Trees $\rightarrow$ `mindmap`
      - Department Handoffs $\rightarrow$ `swimlane-beta`
      - Buyer-Seller Negotiations & Protocol Sequences $\rightarrow$ `sequenceDiagram`
      - State Regimes & Lifecycle Transitions $\rightarrow$ `stateDiagram-v2`
      - Relational Schemas & ERP Tables $\rightarrow$ `erDiagram`
      - Value Chains & Architectural Layers $\rightarrow$ `block-beta`
      - IT Topologies & Cloud Services $\rightarrow$ `architecture-beta` / `C4Context`
      - Process Mechanisms & Decision Trees $\rightarrow$ `flowchart LR` / `flowchart TD`
    - Always verify diagram syntax and vector formatting with `npm run mermaid:check`.

---

## Detailed Reference Guides

- **[Course Ingestion Protocol](./references/course-ingestion-protocol.md)**: Step-by-step execution checklist from `npm run raw:prep` to cohort publication.
- **[Mermaid Diagram Taxonomy & Selection Guide](./references/mermaid-diagram-taxonomy.md)**: Authoritative classification matrix and syntax templates for 25+ Mermaid diagram types.
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
