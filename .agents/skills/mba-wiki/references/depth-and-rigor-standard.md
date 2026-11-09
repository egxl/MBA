# Depth & Academic Rigor Standard (`depth-and-rigor-standard.md`)

This standard governs the level of detail, analytical machinery, and cohort-wide clarity required when ingesting course materials into the **P3MD MBA Knowledge Base**.

---

## 🚫 The Anti-Simplification Mandate

> [!CAUTION] The Core Prohibition
> **Never reduce rich academic papers, Harvard/INSEAD business cases, or lecture decks into high-level, generic bullet summaries.**
> The P3MD MBA portal is a cohort-wide reference manual and executive study companion. If a classmate cannot prepare for a cold-call, execute a diagnostic exercise, or inspect the underlying case exhibits from your note, the ingestion has failed.

---

## 🏗️ Architecture: Master Hub + Dedicated Satellites

When ingesting a weekly module with multiple materials:

```text
content/courses/mkX/week-YY/
├── index.md                              <-- Master Lecture Hub (Modular handbook chapters, slide frameworks, BUMN context)
├── case-[company]-[slug].md              <-- Full Business Case Study with Exhibits & Strategic Options Matrix
├── reading-[author]-[slug].md            <-- Dedicated Deep-Dive Academic Reading Note
└── assignment-[slug].md                  <-- Cohort Assignment Guide (Pre-Class Skim Brief OR Post-Class F9/Maintainer Debrief)
```

### 1. The Master Lecture Hub (`index.md`)

Structure the lecture hub using **clean, topic-driven modular sections** aligned with the curricular slide spine (avoid theatrical "Act 1–4" labels):

- **1. Executive Overview & Strategic Foundations**: The core business dilemma, why the topic matters to enterprise leaders, and empirical stakes.
- **2. Theoretical Architecture & Core Frameworks**: Detailed breakdown of every slide model, $\LaTeX$ mathematical formulas, comparative matrices, and Mermaid flowcharts.
- **3. Managerial Crucible: Indonesian Enterprise & BUMN Context**: Practical friction in Indonesian state-owned enterprises (BUMN), traditional vs. modern trade (`warung` economy), regulatory constraints, and AKHLAK governance.
- **4. Cross-Functional Implementation & Strategic Trade-offs**: Inter-departmental tensions (e.g., Marketing vs. Finance vs. Operations) and executive takeaways.
- **📚 Required Readings, Cases & Satellites**: Complete table linking to all satellites for the week.
- **📂 Primary Source Media & Digital Archives**: Table linking to official Google Drive video streams, slide downloads, and raw staging paths.
- **🔗 Knowledge Graph & Curriculum Bridges**: Active wikilinks to concepts, entities, and course overview.

### 2. Dedicated Reading Satellites (`reading-[author]-[slug].md`)

Every major Harvard Business Review, Sloan Management Review, or foundational academic reading must preserve:

1. **Bibliographic & Author Profile**: Full institutional affiliations, research pedigree, and context.
2. **Core Executive Thesis**: The primary theoretical argument and empirical basis.
3. **Complete Conceptual Architecture**: All empirical data, surveys, and scientific studies cited.
4. **All Executive Case Vignettes (Unabridged)**: Every real-world company or leader story mentioned by the authors.
5. **Full Diagnostic Worksheets & Toolkits**: Step-by-step instructions, reflective prompts, and scoring rubrics so any cohort peer can execute the exercise directly.
6. **Comparative Data Tables & Exhibits**: Reconstructed exhibits and comparison tables in Markdown.

### 3. Dedicated Enterprise Case Notes (`case-[company]-[slug].md`)

When ingesting Harvard Business School, INSEAD, or SBM ITB case studies:

1. **Executive Summary & Dilemma**: The urgent decision facing the protagonist.
2. **Company & Industry Context**: Business model, competitive landscape, historical evolution, and customer behavior.
3. **Quantitative Exhibits & Financial Breakdown**: Reconstructed income statements, operational capacities, market share breakdowns, or attribute rankings.
4. **Strategic Alternatives Matrix**: Side-by-side comparison of Option A vs. Option B vs. Option C across pros, cons, financial impact, and operational risk.
5. **Strategic Recommendation & Cold-Call Prep**:
   - In **Pre-Class Mode**: Highlight the key tensions and questions the case leaves open without spoiling the answer.
   - In **Post-Class Mode**: Provide the recommended roadmap, break-even thresholds, and boardroom defense scripts.

### 4. Cohort Assignment Guides (`assignment-[slug].md`)

- **Cohort-Neutral Voice**: Write for the entire cohort. Never expose raw personal file names or compare internal student revision drafts (e.g., do not write *"Draft 1 vs Humanized Draft 2"*).
- **Attribution Etiquette**:
  - Group assignments: Attribute reference analysis to **`F9 (Class F / Syndicate 9)`** (or **`F9 (Class F / Syndicate 9) & the Portal Maintainer`**).
  - Individual assignments: Attribute reference analysis to **`the Portal Maintainer`** (never name the maintainer personally).

---

---

## 📐 Mermaid Architectural Layout Standard & Multi-Type Visual Fidelity

The P3MD MBA portal requires professional vector diagrams that utilize desktop reading space effectively, convey authentic visual meaning, and adapt gracefully to split views and mobile devices:

1. **Zero-ASCII Policy**:
   - **Never generate ASCII or Unicode box art** (`+---+`, `┌───┐`, `│   │`, `──►`) inside plain code blocks.
   - All workflows, frameworks, timelines, and organizational hierarchies must be rendered as vector **Mermaid.js** diagrams.
   - Pure data matrices must be authored as standard Markdown tables (`| Col 1 | Col 2 |`).

2. **Visual Archetype Matching (Pick Across 25+ Types)**:
   - **Never default reflexively to `flowchart LR`**.
   - Review **[Mermaid Diagram Taxonomy & Selection Guide](./mermaid-diagram-taxonomy.md)** to match the visual archetype:
     - 2x2 Strategic Matrices $\rightarrow$ `quadrantChart`
     - Quantitative & Cash Flow Waterfalls $\rightarrow$ `sankey-beta`
     - Numerical Trends & Bar/Line Overlays $\rightarrow$ `xychart-beta`
     - Multi-Dimensional Competency / 5-Forces Benchmarks $\rightarrow$ `radar-beta`
     - Market Share / Portfolio Composition $\rightarrow$ `pie`
     - Overlapping Capabilities / Strategic Intersections $\rightarrow$ `venn-beta`
     - Complexity & Sense-Making Domains $\rightarrow$ `cynefin-beta`
     - Chronological History & Corporate Evolution $\rightarrow$ `timeline`
     - 30-60-90 Day Roadmaps & Implementation Schedules $\rightarrow$ `gantt`
     - Customer Experience / User Journey Maps $\rightarrow$ `journey`
     - Stage-Gate Pipelines & Task Backlogs $\rightarrow$ `kanban`
     - WBS, Categorization Trees & Brainstorms $\rightarrow$ `mindmap`
     - Cross-Functional Department Lanes $\rightarrow$ `swimlane-beta`
     - Multi-Party Negotiations & Protocols $\rightarrow$ `sequenceDiagram`
     - Regime Transitions & Lifecycle States $\rightarrow$ `stateDiagram-v2`
     - Relational Database Schemas $\rightarrow$ `erDiagram`
     - Value Chain Layers & Architectural Stacks $\rightarrow$ `block-beta`
     - Cloud / IT Topologies $\rightarrow$ `architecture-beta` / `C4Context`

3. **Horizontal-First Architecture for Processes (`flowchart LR`)**:
   - When a diagram is a true directional process, pipeline, or progression, it must flow horizontally from left to right (`flowchart LR`).
   - Do not stack linear process steps vertically (`flowchart TD` or `flowchart BT`).

4. **Balanced Multi-Column Subgraphs**:
   - When a framework has distinct phases (e.g. Foundation $\rightarrow$ Expansion $\rightarrow$ Stewardship), connect the subgraphs horizontally:
     ```mermaid
     flowchart LR
         subgraph S1["Phase 1: Foundation"]
             direction TB
             A["Item 1"] --> B["Item 2"]
         end
         subgraph S2["Phase 2: Expansion"]
             direction TB
             C["Item 3"] --> D["Item 4"]
         end
         S1 --> S2
     ```
   - This creates compact, side-by-side columns (~260px tall) instead of 1,000px vertical towers.

5. **Linear Depth Cap in Vertical Trees**:
   - `flowchart TD` is permitted *only* for branching trees where each level expands horizontally ($\ge 2$ child nodes).
   - Single-column linear chains exceeding 3 nodes in `TD` or `BT` direction are forbidden and blocked by CI.

6. **2D Matrix Grids for Parallel Item Sets**:
   - Parallel competency sets, pillars, or virtues must be laid out in 2-column or 3-column networks or matrices, never as 1D linear poles (`C1 --- C2 --- C3 ...`).

---

## 🧑‍🏫 The First-Principles Accessibility Standard (Zero-Prerequisite Pedagogy)

> [!IMPORTANT] The Zero-Prerequisite Guarantee
> The purpose of the P3MD MBA Knowledge Base is to make every subject understandable to any cohort peer—including someone who has never taken accounting, calculus, statistics, corporate finance, or psychology.
> Rigor does **not** mean dumping naked formulas or academic jargon. Rigor means explaining the underlying economic, operational, or behavioral intuition so clearly that the formula feels like common sense.

### 1. The Anti-Formula-Dump Rule
- **Never stack display math blocks**: Stacking consecutive `$$...$$` blocks without explanatory prose in between is strictly forbidden and flagged by CI (`npm run wiki:pedagogy`).
- **Maximum 1 standalone formula block** (or tightly coupled pair) before providing explanatory text.

### 2. The 4-Layer Pedagogical Anatomy for Quantitative Models & Formulas
Whenever a mathematical formula appears (e.g. TVM, DuPont, CAPM, WACC, CVP, Kingman VUT, Little's Law, CPM/PERT):
1. **Plain-English Intuition ("The Kitchen-Table Analogy")**: Explain what real-world problem or common-sense truth this formula captures *before* writing the equation.
2. **Prerequisite & Jargon Decoder**: Define every variable and acronym on the spot (e.g., explain what *EBIT* actually means in cash terms, what *variance* measures, what *discount rate* reflects) without assuming prior courses.
3. **Structural Anatomy of the Mechanism**: Explain why the formula is built the way it is:
   - *Why is this term in the numerator?* (Because higher values directly increase the outcome).
   - *Why is this term in the denominator?* (Because it acts as a drag, friction, penalty, or scaling base).
4. **10-Second Mental-Math Micro-Walkthrough**: Provide a toy numerical calculation with simple round numbers (e.g., "$100 fixed costs, $20 margin = 5 units to break even") so the reader builds instant quantitative intuition.

### 3. The Prerequisite Bridge Rule for Non-Mathematical Frameworks
When presenting qualitative frameworks (e.g., Big Five psychometrics, Transactional Analysis ego states, SCOR, 5C Environmental Analysis, French & Raven power bases):
- Never drop unexplained technical terms (e.g., *p-value < 0.001*, *test-retest reliability*, *cross-subsidization*, *bimodal distribution*, *credit default swap*).
- Provide a brief 1-sentence lay explanation right next to the wikilink or terminology.

---

## 📋 The "No Lost Signal" Ingestion Rubric

Before declaring an ingestion complete, verify against this checklist:

- [ ] **Are all named case subjects retained?** (Did any company, protagonist, or exhibit get dropped?)
- [ ] **Are all diagnostic exercises fully executable?** (Can a classmate complete the worksheet using only this markdown note?)
- [ ] **Are all comparative exhibits reconstructed?** (Are tables from the cases/readings present in Markdown format?)
- [ ] **Are empirical statistics cited with exact figures?** (Percentages, currency amounts, sample sizes, capacities).
- [ ] **Are mathematical formulas written in KaTeX and contextualized?** ($\LaTeX$ math formatting with zero unannotated formula dumps, passing `npm run wiki:pedagogy`).
- [ ] **Are all prerequisite concepts decoded for beginners?** (Intuition first, jargon decoded on the spot, structural mechanics explained, and micro-examples provided).
- [ ] **Are structural relationships visualized with the accurate Mermaid diagram type?** (Classified across 25+ types via [Mermaid Diagram Taxonomy](./mermaid-diagram-taxonomy.md), 0 ASCII art, horizontal-first for flows, passing `npm run mermaid:check`).
- [ ] **Are core concepts woven inline?** (First prominent mention in prose and diagrams linked via `[[concepts/<slug>|...]]` or `[[concepts/<slug>#anchor|...]]`; minimum 3 concept links per weekly hub).
- [ ] **Do newly created concepts meet the depth threshold?** ($\ge 45$ lines, $\ge 3$ analytical sections, zero shallow dictionary stubs).
- [ ] **Is epistemic data provenance preserved on enterprise entities?** (Timeless real-world identity separated from `Curriculum Case Snapshots`, with `[!NOTE] Case-Basis Epistemic Notice` citing the case, or `category: fictional-enterprise` badging applied).
- [ ] **Is cohort attribution clean and anonymous for personal files?** (`F9 (Class F / Syndicate 9)` for group work; `the Portal Maintainer` for personal work).
