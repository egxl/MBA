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

## 📋 The "No Lost Signal" Ingestion Rubric

Before declaring an ingestion complete, verify against this checklist:

- [ ] **Are all named case subjects retained?** (Did any company, protagonist, or exhibit get dropped?)
- [ ] **Are all diagnostic exercises fully executable?** (Can a classmate complete the worksheet using only this markdown note?)
- [ ] **Are all comparative exhibits reconstructed?** (Are tables from the cases/readings present in Markdown format?)
- [ ] **Are empirical statistics cited with exact figures?** (Percentages, currency amounts, sample sizes, capacities).
- [ ] **Are mathematical formulas written in KaTeX?** ($\LaTeX$ math formatting for all formulas).
- [ ] **Are structural relationships visualized with Mermaid?** (Clean diagrams passing `npm run mermaid:check`).
- [ ] **Is cohort attribution clean and anonymous for personal files?** (`F9 (Class F / Syndicate 9)` for group work; `the Portal Maintainer` for personal work).
