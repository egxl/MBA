# Course Ingestion Protocol (`course-ingestion-protocol.md`)

This protocol outlines the streamlined workflow for ingesting raw course materials into the **P3MD MBA Cohort-Wide Knowledge Base** with zero manual file-wrangling and complete academic rigor.

---

## Execution Workflow

### Phase 1: Automated Intake, Extraction & Safety Scan (`npm run raw:prep`)

1. Run `npm run raw:prep` from the repository root.
2. What this does automatically:
   - **Normalizes folder names**: Converts `raw/courses/mk3/Week 1` $\rightarrow$ `raw/courses/mk3/week-01`.
   - **Extracts Office binaries**: Unpacks `.docx` (lecture notes, group submissions) and `.xlsx` spreadsheets into `raw/courses/mkX/week-YY/.extracted/<filename>.txt` so you can read them directly with `read_file`.
   - **Step 0 Safety Scan**: Scans all `.pdf`, `.txt`, and `.md` files for hidden prompt-injection / steganographic anomalies and writes `.extracted/intake-manifest.json`.
3. Inspect the contents of `raw/courses/mkX/week-YY/` and its `.extracted/` folder:
   - Primary lecture slides (`.pdf`, `.pptx`) and optional `handbook-draft.md` (if present).
   - Academic readings (`.pdf`) and enterprise case studies (`.pdf`).
   - Assignment prompts and student solutions (`.pdf`, `.docx` $\rightarrow$ `.extracted/*.txt`).
   - Lecturer notes (`Catatan*.docx` $\rightarrow$ `.extracted/*.txt`), audio (`.m4a`), video transcripts (`.txt`), and cloud links (`drive_links_to_be_inserted.txt`).

---

### Phase 2: Author Cohort-Ready Satellites (Pre-Class vs. Post-Class Mode)

Because this portal serves the **entire P3MD MBA cohort**, author dedicated satellites before drafting the master lecture hub, observing the **Cohort Attribution & Spoiler Rules**:

#### 1. Academic Readings (`reading-[slug].md`)
- Extract all named corporate crucibles, empirical statistics, diagnostic worksheets, and comparative tables following the [Depth & Academic Rigor Standard](./depth-and-rigor-standard.md).

#### 2. Business Case Studies (`case-[slug].md`)
- Reconstruct the executive dilemma, company/industry context, quantitative exhibits, and strategic options matrix in clean modular sections (no theatrical "Act 1–4" labels).

#### 3. Assignment Guides (`assignment-[slug].md`)
Choose the appropriate mode based on deadline status:
- **Mode A: Pre-Class Mode (Before Deadline — Spoiler-Free Cohort Brief)**
  - Map the official assignment instructions, case timeline, exhibit skim map, and slide-to-question connections.
  - Explicitly remind readers that the brief is a navigation map (*"bukan jawaban"*) and **do not** state a final recommended option or publish completed group answers.
- **Mode B: Post-Class / Archive Mode (After Deadline — Model Analysis & Debrief)**
  - Present the official diagnostic questions followed by a rigorous, cohort-neutral **Reference Solution & Strategic Analysis**, mathematical walkthroughs, and classroom cold-call defense.
  - **Strict Attribution Rule**:
    - Credit group submissions to **`F9 (Class F / Syndicate 9)`** (or **`F9 (Class F / Syndicate 9) & the Portal Maintainer`** if combined with personal notes).
    - Credit individual submissions solely to **`the Portal Maintainer`**—**never publish the maintainer's personal name** and never compare raw internal file drafts (e.g. "Draft v1 vs Humanized v2") on the public page.

---

### Phase 3: Author the Master Lecture Hub (`index.md`)

Create `content/courses/mkX/week-YY/index.md` synthesizing the entire week into an exhaustive, readable modular chapter:

- **One-Pass Completeness (No Warning Banners)**: Whether `handbook-draft.md` exists in `raw/` or you are expanding directly from raw slides + textbook + `Catatan`, always produce a finished, authoritative chapter. Never insert yellow "Handbook Expansion Pending" banners.
- **Modular Topic Sections**: Systematically expand every slide topic, weaving in textbook foundations (Kotler, Chase, etc.), lecturer insights, and empirical case findings.
- **Formulas & Visual Architecture**: Embed $\LaTeX$ formulations, comparative tables, and Mermaid process flowcharts (following the Mermaid safety rules: quoted node labels, no numbered lists inside nodes).
- **Cross-Functional & BUMN Crucible**: Real-world friction points, Indonesian enterprise dynamics, channel economics, and regulatory realities.
- **📚 Required Readings, Cases & Satellites Table**: Overview table linking to every reading, case, and assignment satellite authored in Phase 2.
- **📂 Primary Source Media**: Table linking to official Google Drive streams/downloads and raw staging paths.
- **🔗 Knowledge Graph & Curriculum Bridges**: Wikilinks to concepts, entities, next module, and course overview.

---

### Phase 4: Selective Concept & Entity Extraction (Max 1–2 Per Week)

To prevent knowledge-graph sprawl:

1. **Concept Qualification Gate**: Create or update at most **1 to 2 foundational concepts** per week in `content/concepts/[slug].md`. Only extract major, reusable cross-curricular frameworks or quantitative business metrics.
2. **Entity Gate**: Create or update `content/entities/[slug].md` **only** for primary case companies, lead course faculty, or foundational theorists that recur across the curriculum.
3. **Automated Hub Synchronization**:
   Run:
   ```powershell
   npm run wiki:sync
   ```
   This automatically registers any new concepts or entities in `content/concepts/index.md` and `content/entities/index.md` and verifies satellite links. Also place new concepts under the appropriate thematic pillar in `content/concepts/index.md` if needed.

---

### Phase 5: Course MOC Status Flip & Build Verification

1. Open the course overview page `content/courses/mkX-[course-name]/index.md` and flip the current week's row from `_Scheduled (Pending Ingestion)_` to:
   `| **Week YY** | Module Name | [[courses/mkX-slug/week-YY/index\|Topic & Core Focus]] | **Ingested** |`
2. Execute the validation suite:
   ```powershell
   npm run check
   npm test
   npx quartz build
   ```
   Ensure 0 duplicate `<h1>` titles, 0 Mermaid errors, 0 unregistered wiki files, and 0 broken links.
