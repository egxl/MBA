# Course Ingestion Protocol (`course-ingestion-protocol.md`)

This protocol outlines the streamlined workflow for ingesting raw course materials into the **P3MD MBA Cohort-Wide Knowledge Base** with zero manual file-wrangling and complete academic rigor.

---

## 3-Tier Architecture Principles & Epistemic Truth Hierarchy

1. **`inbox/` (Drop Zone)**: Staging zone for un-ingested files. The user dumps raw files freely here.
2. **`content/` (Published Knowledge Base)**: Clean, published Markdown (`.md`) rendered by Quartz and tracked in git.
3. **`archive/` (Processed Raw Storage)**: Cold storage for original binaries (`archive/courses/mkX/week-YY/` or `archive/rabuan/`). Ignored by git.

### The Epistemic Truth Hierarchy (Conflict Resolution Mandate)

When newly ingested materials conflict with existing portal content, resolve collisions using the 4-tier authority hierarchy:

- **Tier 1: Ground Truth (Primary Authority)**: Authentic SBM ITB lecturer slides, official case studies, syllabus documents, official rubrics, and plenary recordings.
- **Tier 2: Syndicate & Cohort Working Evidence**: Group submissions (`F9`), maintainer debriefs, and professor verbal classroom debriefs.
- **Tier 3: Published Knowledge Portal**: Ingested `content/` pages rendered by Quartz.
- **Tier 0: Provisional Scaffolding (Zero Authority)**: Tentative syllabus guesses, unverified AI assertions, or historical placeholder files.

> [!IMPORTANT]
> **The Golden Law of Epistemic Ingestion**:
> Primary Evidence (Tier 1) always supersedes and invalidates Tier 0 and Tier 3. When authentic materials arrive in `inbox/`, existing placeholder text, incorrect topic titles, fabricated numbers, or ungrounded frameworks must be overwritten or purged.

> [!IMPORTANT]
> **Strict Inbox Scope Isolation**:
> When an ingestion is triggered from `inbox/`, the agent inspects **only** the files currently sitting in `inbox/`. It never scans, traverses, or re-reads `archive/courses/` unless the user explicitly requests a historical re-audit.

---

## Execution Workflow

### Phase 1: Automated Inbox Intake & Extraction (`scripts/prep-raw.mjs`)

1. User prompts: `/mba-wiki ingest this to mkX week YY` (e.g. `mk3 week 1` or `rabuan`).
2. Run `node ./scripts/prep-raw.mjs --target "mkX week YY"`.
3. What this does automatically:
   - Moves files from `inbox/` into `archive/courses/mkX/week-YY/` (or `archive/rabuan/`).
   - Extracts plain text from `.docx` and `.xlsx` into `archive/courses/mkX/week-YY/.extracted/<filename>.txt`.
   - Runs Step 0 safety scan on `.pdf`, `.txt`, and `.md` files.
   - Audits target `content/courses/mkX/week-YY/` for existing files and collision status.
4. The agent reads **only the files that were moved from `inbox/`**.

### Phase 1b: Pre-Ingestion Target Reconnaissance & Placeholder Purge

Before authoring new files, inspect `content/courses/mkX/week-YY/` and `content/courses/mkX-.../index.md`:
1. **Catalog Existing Satellites**: Check if satellite files already exist from an earlier scaffold or placeholder era.
2. **Purge Obsolete / Hallucinated Satellites**: If an existing file represents a fabricated case or obsolete stub not supported by the authentic slides (e.g., `case-harvard-walmart.md`), delete the file immediately.
3. **Reconcile MOC Syllabus Topic**: Check the tentative topic title in `content/courses/mkX-.../index.md`. If the authentic slide deck specifies a different topic name or thematic pillar, update the syllabus row to match authentic reality.

---

### Phase 2: Author Cohort-Ready Satellites (Pre-Class vs. Post-Class Mode)

Author dedicated satellites before drafting the master lecture hub, observing the **Cohort Attribution & Spoiler Rules**:

#### Visual Diagram Selection Rule
When extracting frameworks, process flows, or data exhibits from raw materials into satellites, consult the **[Mermaid Diagram Taxonomy](./mermaid-diagram-taxonomy.md)**. Never default reflexively to `flowchart LR`. Pick the diagram matching the visual archetype (e.g. `quadrantChart` for 2x2 matrices, `sankey-beta` for cash/material flows, `timeline` for corporate chronology, `gantt` for schedules, `radar-beta` for competency spider plots, `sequenceDiagram` for negotiation/message protocols).

#### 1. Academic Readings (`reading-[slug].md`)
- Extract all named corporate crucibles, empirical statistics, diagnostic worksheets, and comparative tables following the [Depth & Academic Rigor Standard](./depth-and-rigor-standard.md).

#### 2. Business Case Studies (`case-[slug].md`)
- Reconstruct the executive dilemma, company/industry context, quantitative exhibits, and strategic options matrix in clean modular sections (no theatrical "Act 1–4" labels).

#### 3. Assignment Guides (`assignment-[slug].md`)
Choose the appropriate mode based on deadline status:
- **Mode A: Pre-Class Mode (Before Deadline — Spoiler-Free Cohort Brief)**
  - Map the official assignment instructions, case timeline, exhibit skim map, and slide-to-question connections.
  - Remind readers that the brief is a navigation map (*"bukan jawaban"*) and **do not** state a final recommended option or publish completed group answers.
- **Mode B: Post-Class / Archive Mode (After Deadline — Model Analysis & Debrief)**
  - Present the official diagnostic questions followed by a rigorous, cohort-neutral **Reference Solution & Strategic Analysis**, mathematical walkthroughs, and classroom cold-call defense.
  - **Strict Attribution Rule**:
    - Credit group submissions to **`F9 (Class F / Syndicate 9)`** (or **`F9 (Class F / Syndicate 9) & the Portal Maintainer`** if combined with personal notes).
    - Credit individual submissions solely to **`the Portal Maintainer`**—**never publish the maintainer's personal name** and never compare raw internal file drafts on the public page.

---

### Phase 3: Author the Master Lecture Hub (`index.md`)

Create `content/courses/mkX/week-YY/index.md` synthesizing the entire week into an exhaustive, readable modular chapter:

- **One-Pass Completeness (No Warning Banners)**: Compile a complete, polished chapter in one pass.
- **Full Rewrite Over Placeholders**: Completely re-author `index.md` from primary evidence. Never blend unverified claims from provisional stubs.
- **Preserve Specificity**: Include concrete numbers, names, framework steps, formulas, and diagrams.
- **Multi-Type Visual Fidelity**: Map each slide exhibit or framework to its exact Mermaid diagram archetype per **[Mermaid Diagram Taxonomy](./mermaid-diagram-taxonomy.md)** (`quadrantChart`, `sankey-beta`, `xychart-beta`, `radar-beta`, `timeline`, `gantt`, `journey`, `kanban`, `mindmap`, `swimlane-beta`, `stateDiagram-v2`, `sequenceDiagram`, `block-beta`, `flowchart LR/TD`). Never force non-process visuals into flowcharts.
- **Cross-Curricular Alignment**: Highlight intersections with other MBA modules (e.g. MK1 Leadership, MK3 Marketing, MK4 Operations).

---

### Phase 4: Concept Governance & Semantic Lattice Linking (The 3 Pillars)

1. **Apply the Qualitative 3-Criteria Granularity Gate**:
   Create a standalone page in `content/concepts/<slug>.md` only if the framework satisfies:
   - *Cross-Context Reusability*: Applicable across multiple industries, cases, or courses.
   - *Mechanism Depth*: Contains an explicit mathematical formula, multi-axis matrix, structural diagram, or trade-off analysis capable of sustaining a rich $\ge 45$-line analytical note. Never create thin dictionary stubs.
   - *Multi-Disciplinary Compounding*: Bridges $\ge 2$ sessions, cases, or courses.
2. **Master Concept Umbrellas & Section Anchors**:
   Do not split sub-components of a framework into separate files. House sub-terms (e.g., *Adult Ego State*, *5-Stage Extended DuPont*) inside the master concept file and link to them using `#heading-anchors` (`[[concepts/slug#section|Display Text]]`).
3. **Compound Existing Concepts & Weave Inline Links**:
   - Before creating new concepts, check `content/concepts/index.md` to see if an existing concept applies. If so, update the existing concept note to add the new course lens/case link.
   - Weave inline wikilinks (`[[concepts/<slug>|...]]` or `[[concepts/<slug>#anchor|...]]`) throughout weekly lecture notes, cases, readings, and problem sets at first mention in prose and diagrams (minimum 3 concept links per weekly hub).
4. **Entity Gate & Epistemic Separation on Companies**:
   - Extract an entity into `content/entities/<slug>.md` if it represents a recurring company, institution, or theorist.
   - Keep `## 👤 Enterprise Profile` strictly for timeless, verified real-world facts.
   - Move case-specific financial exhibits, unit economics, and student pro-forma projections into `## 📋 Curriculum Case Snapshots (Case-Basis Data)` under a `[!NOTE] Case-Basis Epistemic Notice` citing the source case.
   - If ingesting an entity for a purely fictional/composite case company, set `category: "fictional-enterprise"` and include the `[!IMPORTANT] Fictional / Composite Pedagogical Enterprise` callout.
5. **Purge / Reconcile Placeholder Concepts & Entities**:
   - If prior notes introduced concepts or entities that were fabricated or based on placeholder data, reconcile them with authentic data or delete them.
   - If deleting an entity or concept, grep across `content/` to remove or repoint any incoming wikilinks.
6. **Run Auto-Sync**:
   ```bash
   npm run wiki:sync
   ```
   This automatically registers new concepts/entities in `content/concepts/index.md` and `content/entities/index.md`.

---

### Phase 5: Verification & Quality Gate

1. Flip the syllabus row in `content/courses/mkX-.../index.md` to `**Ingested**` with active Quartz wikilink.
2. Run automated validation:
   ```bash
   node ./scripts/audit-pedagogy.mjs --target "mkX week YY"
   npm run check
   npm test
   npx quartz build
   ```
