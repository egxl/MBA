# Depth & Academic Rigor Standard (`depth-and-rigor-standard.md`)

This standard governs the level of detail, analytical machinery, and completeness required when ingesting course materials into the **P3MD MBA Knowledge Base**.

---

## 🚫 The Anti-Simplification Mandate

> [!CAUTION] The Core Prohibition
> **Never reduce rich academic papers, Harvard business cases, or lecture decks into high-level, generic bullet summaries.**
> An MBA portal is an institutional reference manual and executive study companion. If a student or executive cannot prepare for a cold-call, execute a diagnostic exercise, or inspect the underlying data from your note, the ingestion has failed.

---

## 🏗️ Architecture: Master Hub + Dedicated Satellites

When ingesting a weekly module with multiple heavy materials:

```text
content/courses/mkX/week-YY/
├── index.md                              <-- Master Lecture Hub (Acts 1-4, slide frameworks, classroom context)
├── reading-[author]-[slug].md            <-- Dedicated Deep-Dive Academic Reading Note (300-800 lines)
├── case-[company]-[slug].md              <-- Full Business Case Study with Exhibits & Decision Analysis
└── quiz-[num]-discussion.md              <-- Exam / Quiz Preparation & Problem Walkthroughs
```

### 1. The Master Lecture Hub (`index.md`)

- **Act 1: Executive Dilemma**: The high-stakes boardroom hook, statistical context (e.g. Kearney CEO turnover data), and planning paradox.
- **Act 2: Theoretical Mechanism**: Detailed framework breakdown, $\LaTeX$ mathematical formulas, Mermaid flowcharts, and slide deck concepts.
- **Act 3: Real-World Crucible**: Practical friction in Indonesian BUMNs, ASEAN conglomerates, high power-distance cultures, and AKHLAK values.
- **Act 4: Seminar Debrief & Synthesis**: High-level cross-reading synthesis, in-class assignment prompts, and executive provocation.
- **📂 Primary Source Media**: Complete table linking to official Google Drive video streams, slide downloads, and raw file paths.
- **🔗 Knowledge Graph & Curriculum Bridges**: Active wikilinks to all generated satellites, concepts, and entity profiles.

### 2. Dedicated Reading Satellites (`reading-[author]-[slug].md`)

Every major Harvard Business Review, Sloan Management Review, or peer-reviewed academic reading must have its own standalone note preserving:

1. **Bibliographic & Author Profile**: Full institutional affiliations, research pedigree, and context.
2. **Core Executive Thesis**: The primary theoretical argument and empirical basis.
3. **Complete Conceptual Architecture**:
   - The diagnostic problem statement and psychological/organizational roots.
   - All empirical data, surveys, and scientific studies cited (e.g. Gallup engagement distributions, neuroscience citations).
4. **All Executive Case Vignettes (Unabridged)**:
   - Preserves _every_ real-world story mentioned by the authors (e.g., Heineken USA CEO Dolf van den Brink, West Point Colonel Kathi Snook, Unilever / Ben & Jerry's CEO Jostein Solheim, Egyptian factory director).
5. **Full Diagnostic Worksheets & Toolkits**:
   - The literal step-by-step instructions, reflective prompts, and scoring criteria.
   - Spider diagrams, matrix axes, and data recording tables (e.g. 8-wedge Wheel of Life, 7-point Life Journey Map, 7-step Purpose-to-Impact plan).
6. **Comparative Data Tables & Exhibits**:
   - Reconstruct all exhibits and comparative tables (e.g., Bad vs. Good Purpose Statements, Traditional vs. Purpose-to-Impact Planning).
7. **Classroom Cold-Call & Debate Strategy**:
   - Direct answers and strategic debate angles for the official pre-assignment / seminar discussion questions.

### 3. Dedicated Enterprise Case Notes (`case-[company]-[slug].md`)

When ingesting full Harvard Business School or INSEAD case studies:

1. **Executive Summary & Dilemma**: The urgent decision facing the protagonist.
2. **Company & Industry Context**: Competitive environment, market trends, financial standing.
3. **Data Exhibits & Financials**: Reconstructed income statements, balance sheets, operational flow rates, or market share data.
4. **Strategic Alternatives Matrix**:
   - Option A vs Option B vs Option C.
   - Pros, cons, financial impact, operational feasibility, and organizational resistance for each.
5. **Strategic Recommendation & Implementation Roadmap**:
   - Phased 30-60-90 day execution plan.
   - Risk mitigation and contingency planning.
6. **Boardroom & Cold-Call Questions**: Anticipating professor queries, key exhibits to cite, and contrarian perspectives.

---

## 📋 The "No Lost Signal" Ingestion Rubric

Before declaring an ingestion complete, verify against this checklist:

- [ ] **Are all named case subjects retained?** (Did any company, CEO, or protagonist get dropped?)
- [ ] **Are all diagnostic exercises fully executable?** (Can a student sit down and complete the worksheet using only this markdown note?)
- [ ] **Are all comparative exhibits reconstructed?** (Are tables from the readings present in markdown format?)
- [ ] **Are empirical statistics cited with exact figures?** (Percentages, dollar amounts, sample sizes, multiplier factors).
- [ ] **Are mathematical formulas written in KaTeX?** ($\LaTeX$ math formatting for all formulas).
- [ ] **Are structural relationships visualized with Mermaid?** (Clear diagrams for multi-stage workflows or frameworks).
- [ ] **Are official cloud media links embedded?** (Google Drive streams, downloads, and slides).
