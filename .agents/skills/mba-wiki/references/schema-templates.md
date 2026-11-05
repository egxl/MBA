# Canonical Schema & Document Templates (`schema-templates.md`)

Use these templates when generating pages in the **P3MD MBA Knowledge Base**.

---

## 1. Master Weekly Lecture Note (`content/courses/mkX/week-YY/index.md`)

````yaml
---
title: "Week YY: [Topic Headline] — [Subtitle / Core Focus]"
course: "[Full Course Name, e.g. Organizational Behaviour & Managing People]"
course_code: "[MK1 - MK6]"
week: [1 - 14]
module: "[Module Name from Syllabus]"
type: "weekly-lecture"
tags:
  - [MK Code]
  - [primary-domain]
  - [secondary-topic]
  - sbm-itb
---

> [!NOTE] Curricular & Faculty Metadata
> - **Course:** [Course Code] [Course Name] — Week [YY]
> - **Teaching Team:** [Faculty Names & Credentials]
> - **Primary Curricular Spine:** [Slide Deck Name & Slide Count]
> - **Direct Satellites & Problem Sets:**
>   - [[courses/mkX-slug/week-YY/assignment-slug|Assignment Guide Title]]
>   - [[courses/mkX-slug/week-YY/case-slug|Case Study Dossier]]
>   - [[courses/mkX-slug/week-YY/reading-slug|Academic Reading Note]]

## 1. Executive Overview & Foundations of [Topic]

[Core dilemma, why this matters to enterprise leaders, what fails when unaddressed, empirical stakes / statistics. Weave inline links to foundational mental models like [[concepts/slug|Master Concept]] or sub-frameworks like [[concepts/slug#section-anchor|Sub-Framework]] at first mention.]

---

## 2. Theoretical Architecture & Core Frameworks

[Detailed breakdown of slide deck models, formulas, LaTeX math, and Mermaid process diagrams. Link models inline directly: e.g. [[concepts/slug|Core Framework Name]].]

### 💡 First-Principles Intuition & Everyday Analogy
[Explain the kitchen-table intuition: what problem does this solve in plain English before presenting any math or technical jargon.]

### 🔑 Prerequisite Concepts & Jargon Decoder
- **[Variable / Acronym 1]**: [Plain-English explanation without assuming prior finance, accounting, or stats coursework].
- **[Variable / Acronym 2]**: [Plain-English explanation].

$$\mathbf{OUTPUT = \frac{\text{DRIVING FACTORS}}{\text{DRAG / CAPACITY FACTOR}}}$$

### ⚙️ Mechanics & Structural Anatomy:
- **Numerator**: Why increasing this term directly scales the desired output.
- **Denominator**: Why this term acts as a buffer, cost, dilution, or capacity ceiling.
- **10-Second Micro-Example**: With simple round numbers (e.g. 100 / 20 = 5), show how the calculation works in practice.

```mermaid
flowchart LR
    A["Input"] --> B["Processing Mechanism<br/>([[concepts/slug|Anchor Concept]])"] --> C["Executive Output"]
```

---

## 3. Managerial Crucible: Indonesian Enterprise & BUMN Context

[Real-world friction: Indonesian corporate governance, traditional trade vs modern trade dynamics, AKHLAK values, cross-linking to relevant organizational frameworks like [[concepts/slug|Framework]].]

---

## 4. Cross-Functional Implementation & Strategic Trade-offs

[Analysis of inter-departmental tensions (Marketing vs Finance vs Operations), risk mitigation, and executive debrief, cross-linking relevant mechanisms like [[concepts/slug|Mechanism]].]

---

## 📚 Required Readings & In-Depth Satellites

| Document Title    | Author / Institution | Core Focus / Methodological Contribution | Study Note                                                     |
| :---------------- | :------------------- | :--------------------------------------- | :------------------------------------------------------------- |
| **[Paper Title]** | [Author(s)]          | [1-sentence summary]                     | [[courses/mkX-slug/week-YY/reading-slug\|Open Deep-Dive Note]] |

---

## 📂 Primary Source Media & Digital Archives

| Material Title               |      Media Type       | Direct Cloud Repository                                  |
| :--------------------------- | :-------------------: | :------------------------------------------------------- |
| **[Presentation Title]**     | Presentation (`.pdf`) | `raw/courses/mkX/week-YY/...`                            |
| **[Video Title]**            |    Video (`.mp4`)     | [Stream / Download Video](https://drive.google.com/...)  |
| **[Masterclass Slide Deck]** |    Slides (`.pdf`)    | [Download Official Slides](https://drive.google.com/...) |

---

## 🔗 Knowledge Graph & Curriculum Bridges

- **Featured Frameworks in Knowledge Matrix**:
  - [[concepts/slug|Concept Title]]
- **Theorist & Author Profiles**:
  - [[entities/slug|Author / Theorist]]
- **Next Curricular Module**: Week YY+1: [Next Title] _(Scheduled / Ingestion Pending)_
- Return to **[[courses/mkX-slug/index|MK X Course Overview]]**

````

---

## 2. Dedicated Academic Reading Satellite (`content/courses/mkX/week-YY/reading-[slug].md`)

```yaml
---
title: "Reading: [Article Title]"
author: "[Author Name(s)]"
publication: "[HBR / MIT Sloan / WEF / Journal Name, Year]"
course_code: "[MK1 - MK6]"
week: [1 - 14]
type: "reading-satellite"
tags:
  - [MK Code]
  - reading
  - [topic]
  - [methodology]
---

## 📄 Executive Synopsis & Context

- **Source Reference**: [Full academic citation].
- **Author Background**: [Key credentials, institutional roles].
- **Core Thesis**: [The primary insight and argument].

---

## 🧠 Complete Conceptual Architecture

[Exhaustive breakdown of the authors' model, psychological/business roots, empirical research, and survey findings.]

---

## 🏢 Real-World Executive Case Vignettes

[Every corporate example, CEO crucible, and organization mentioned in the article, fully fleshed out.]

---

## 🛠️ Complete Diagnostic Worksheets & Toolkits

[Step-by-step instructions, prompts, scoring scales, and exercises enabling the student to execute the diagnostic.]

---

## 📊 Comparative Exhibits & Framework Tables

[Markdown tables replicating all exhibits, comparisons, and matrices from the paper.]

---

## 💬 Classroom Cold-Call & Discussion Strategy

### Discussion Question: "[Official Pre-Assignment Question]"
- **Direct Answer**: [Crisp, high-signal response for cold-call recitation].
- **Underlying Mechanism**: [Why the authors take this stance].
- **Contrarian / Critical Perspective**: [Nuanced counter-argument for advanced debate].

---

## 🔗 Knowledge Graph & Bridges

- Master Lecture Note: [[courses/mkX-slug/week-YY/index|Week YY Masterclass]]
- Related Concept: [[concepts/slug|Concept Name]]
- Author Profile: [[entities/slug|Author Name]]
````

---

## 3. Dedicated Business Case Study Note (`content/courses/mkX/week-YY/case-[slug].md`)

```yaml
---
title: "Case Study: [Company Name] — [Case Focus]"
case_publisher: "[Harvard Business School / INSEAD / SBM ITB]"
case_year: [Year]
course_code: "[MK1 - MK6]"
week: [1 - 14]
type: "case-study"
tags:
  - [MK Code]
  - case-study
  - [industry]
  - [functional-area]
---

## 🚨 The Executive Dilemma

[The immediate crisis, decision point, or strategic crossroads facing leadership.]

---

## 🏢 Enterprise & Industry Background

[Business model, competitive landscape, historical evolution, regulatory context.]

---

## 📈 Quantitative Exhibits & Financial Breakdown

[Reconstructed financial statements, operational throughput, unit economics, or market share data.]

---

## ⚖️ Strategic Alternatives Matrix

| Strategic Option | Pros | Cons & Risks | Financial Impact | Organizational Resistance |
| :--- | :--- | :--- | :--- | :--- |
| **Option A: [Name]** | ... | ... | ... | ... |
| **Option B: [Name]** | ... | ... | ... | ... |
| **Option C: [Name]** | ... | ... | ... | ... |

---

## 🎯 Executive Recommendation & Implementation Roadmap

[Selected path, rationale, phased rollout (30-60-90 days), and risk mitigation.]

---

## 🎙️ Classroom Cold-Call & Boardroom Defense

[Anticipated opening questions, data points to cite, and defense against skeptical faculty or board members.]
```

---

## 4. Atomic Business Concept Note (`content/concepts/[slug].md`)

```yaml
---
title: "[Canonical Academic English Name]"
type: "concept"
aliases:
  - "[Indonesian Term 1]"
  - "[Indonesian Term 2]"
  - "[Synonym]"
courses_covered:
  - "[MK1]"
  - "[MK3]"
  - "[Rabuan]"
tags:
  - concept
  - [domain]
  - [mechanism]
---

## 💡 First-Principles Intuition & Conceptual Core

[Universal explanation independent of any specific course. Start with a plain-English analogy or common-sense enterprise scenario that any beginner understands before showing any math or diagram.]

### 🔑 Prerequisite Concepts & Jargon Decoder
- **[Key Sub-Term 1]**: [Plain-English explanation without assuming prior business knowledge].
- **[Key Sub-Term 2]**: [Plain-English explanation].

---

## 📐 Universal Mechanism & Mathematical Architecture

$$\mathbf{\text{METRIC} = \frac{\text{ECONOMIC DRIVER}}{\text{SCALING BASE OR HURDLE}}}$$

### ⚙️ Mechanics & Structural Anatomy:
- **Driving Component (Numerator)**: Why higher values expand this metric.
- **Scaling Component (Denominator)**: Why this factor acts as friction, dilution, or scale control.
- **Mental-Math Micro-Example**: Concrete calculation using simple round numbers to anchor the reader's intuition.

---

## 🏛️ Multi-Disciplinary Lenses Across the MBA Curriculum

### 1. [Discipline 1, e.g. Organizational Dynamics (MK 1)]
- **Primary Mechanism**: ...
- **Core Insight**: ...
- _Discussed in_: [[courses/mk1-slug/week-01/index|MK 1 Week 01]].

### 2. [Discipline 2, e.g. Capital Strategy & Valuation (MK 2)]
- **Primary Mechanism**: ...
- **Core Insight**: ...

---

## ⚖️ Cross-Functional Boardroom Tensions

[Friction points where departments clash over this concept, e.g. Finance lean inventory vs Ops safety buffer.]

---

## 🚀 Action Learning Project (ALP) Application

> [!TIP] ALP Capstone Alignment
> [How consulting teams apply this mechanism to their partner BUMN project.]

---

## 🔗 Contributing Sessions & References

- Lecture Note: [[courses/mkX-slug/week-YY/index|Week YY]]
- Entity Profile: [[entities/slug|Author / Enterprise]]
- Hub: [[concepts/index|Knowledge Matrix]]
```

---

## 5. Living Entity Profile (`content/entities/[slug].md`)

### Archetype 5A: Real-World Enterprise (`category: company`)

```yaml
---
title: "[Organization Name]"
type: "entity"
category: "company"
data_basis: "real-world-and-case"
aliases:
  - "[Short Name / Acronym]"
roles:
  - "[Role 1]"
  - "[Role 2]"
tags:
  - entity
  - company
  - [domain]
---

## 👤 Enterprise Profile

[Authoritative summary of background, ownership structure, history, and institutional significance in the national/global economy. Keep strictly to timeless, verified real-world facts. Do not mix classroom case exhibits or syndicate estimates here.]

---

## 📋 Curriculum Case Snapshots (Case-Basis Data)

> [!NOTE] Case-Basis Epistemic Notice
> The operational metrics, financial figures, unit economics, and strategic scenarios below are extracted from **[Course / Case Publisher]** classroom materials (**[[courses/mkX-slug/week-YY/case-[slug]|Case Title]]**) and/or **F9 (Class F / Syndicate 9)** analytical models. These figures may incorporate pedagogical simplifications, illustrative estimates, composite personas, or time-bounded assumptions and should not be cited as live audited investor disclosures.

### [Course Code Week YY]: [Case / Assignment Context Title]

- **Source Material**: [[courses/mkX-slug/week-YY/case-[slug]|Case Title]]
- **Case-Basis Metrics & Dilemma**: ...

---

## 🎤 Contributions to P3MD MBA

- **Course Appearances**: [[courses/mkX-slug/week-YY/index|Week YY Lecture]]
- **Related Concepts**:
  - [[concepts/slug|Concept 1]]

---

## 🔗 Traceability & Directory

- Return to **[[entities/index|Entity Directory]]**
- Return to **[[index|MBA Cohort Portal Home]]**
```

### Archetype 5B: Fictional / Composite Case Enterprise (`category: fictional-enterprise`)

```yaml
---
title: "[Fictional Organization Name]"
type: "entity"
category: "fictional-enterprise"
data_basis: "fictional-pedagogical"
aliases:
  - "[Acronym]"
roles:
  - "Pedagogical Case Subject"
tags:
  - entity
  - fictional-enterprise
  - case-study
---

> [!IMPORTANT] Fictional / Composite Pedagogical Enterprise
> **[Organization Name]** is an illustrative teaching-case enterprise synthesized specifically for **[Course Code] [Course Name]** problem sets. Operating metrics, organizational charts, and financial data are stylized pedagogical constructs designed for analytical practice rather than real-world corporate records.

## 👤 Pedagogical Enterprise Profile

[Context, business scenario, product catalog, or production setup as described in the case materials.]

---

## 📋 Curriculum Case Snapshots (Case-Basis Data)

### [Course Code Week YY]: [Problem Set / Case Title]
- **Source Case**: [[courses/mkX-slug/week-YY/case-[slug]|Case Title]]
- **Problem Dilemma**: ...

---

## 🔗 Traceability & Directory

- Return to **[[entities/index|Entity Directory]]**
- Return to **[[index|MBA Cohort Portal Home]]**
```

### Archetype 5C: Academic Theorist or Executive Leader (`category: person`)

```yaml
---
title: "[Person Name]"
type: "entity"
category: "person"
aliases:
  - "[Short Name]"
roles:
  - "[Academic / Corporate Role]"
tags:
  - entity
  - [domain]
---

## 👤 Executive / Theorist Profile

[Authoritative summary of background, credentials, and institutional significance.]

---

## 🧠 Core Philosophy & Contributions

[The principal frameworks, models, or corporate breakthroughs associated with this entity.]

---

## 🎤 Contributions to P3MD MBA

- **Course Appearances**: [[courses/mkX-slug/week-YY/index|Week YY Lecture]]
- **Related Concepts**:
  - [[concepts/slug|Concept 1]]
- **Rabuan Sessions** (if applicable): [[rabuan/YYYY-MM-DD-slug|Session Title]]

---

## 🔗 Traceability & Directory

- Return to **[[entities/index|Entity Directory]]**
- Return to **[[index|MBA Cohort Portal Home]]**
```

---

## 6. Cohort Assignment Guide (`content/courses/mkX/week-YY/assignment-[slug].md`)

Use **Mode A (Pre-Class Brief)** before an assignment deadline so cohort peers get a fast navigation map without spoilers, or **Mode B (Post-Class Debrief)** after the deadline with full worked calculations attributed to **`F9 (Class F / Syndicate 9)`** (for group work) or **`the Portal Maintainer`** (for individual work—never name the maintainer personally).

```yaml
---
title: "MK[X] W[YY] Assignment: [Topic / Case Name]"
type: "assignment-analysis"
course_code: "MK[X]"
week: [1 - 14]
assignment_type: "[Pre-Assignment | Post-Assignment | Syndicate Challenge]"
mode: "[pre-class-brief | post-class-debrief]"
tags:
  - course/mk[x]
  - assignment
  - [discipline-tag]
  - [framework-tag]
date: YYYY-MM-DD
---

> [!NOTE] Assignment Context & Attribution
> - **Course:** MK[X] [Full Course Name] — Week [YY]
> - **Source Prompt:** `raw/courses/mkX/week-YY/[Prompt_File.pdf]`
> - **Reference Attribution:** Analytical synthesis contributed by **F9 (Class F / Syndicate 9)** & **the Portal Maintainer** *(or solely **the Portal Maintainer** for individual assignments; omit if in Pre-Class Brief mode)*
> - **Parent Lecture:** [[courses/mkX-slug/week-YY/index|Week YY Master Lecture Hub]]
> - **Target Case:** [[courses/mkX-slug/week-YY/case-[slug]|Case Study]]

---

## 📋 Part 1: Official Assignment Prompt & Skim Map

- **Executive Objective:** [What the professor tests in this problem set]
- **Target Deliverable:** [Format: Memo, Slide Deck, STP Grid, Financial Sizing]
- **Core Diagnostic Questions & Case Exhibit Map:**
  1. *[Question 1 verbatim]* — **Where to look:** [Case pages / Exhibits / Slide numbers]
  2. *[Question 2 verbatim]* — **Where to look:** [Case pages / Exhibits / Slide numbers]

---

## 💡 Part 2: Reference Solution & Strategic Analysis *(Post-Class Mode Only)*

*(In Pre-Class Mode, replace Part 2 with a **Key Case Tensions & Data Points to Pull** table and remind cohort readers: "Baca case lengkap sebelum syndicate meeting — panduan ini adalah peta navigasi, bukan jawaban akhir.")*

### Question 1: [Problem Title]
- **Analytical Stance:** [Core thesis]
- **Quantitative Model & Calculation:**
  $$\text{Formula} = \text{Variables}$$
- **Reconstructed Data Matrix:**
  | Dimension | Metric | Strategic Implication |
  | :--- | :--- | :--- |
  | ... | ... | ... |

---

## 🔬 Part 3: Methodological Rigor & Key Analytical Nuances

| Analytical Dimension | Baseline Case Intuition | Rigorous Methodological Nuance (F9 / Maintainer Synthesis) |
| :--- | :--- | :--- |
| ... | ... | ... |

---

## 🎙️ Part 4: Classroom Cold-Call & Faculty Debrief Strategy

- **Faculty Angle:** [Where lecturer challenges standard answers]
- **High-Signal Response:** [Concise 30-second cold-call recitation script]
- **Indonesian / BUMN Reality:** [Local market friction, regulatory constraints, channel dynamics]

---

## 🔗 Knowledge Graph & Curriculum Bridges

- Return to **[[courses/mkX-slug/week-YY/index|Week YY Masterclass Hub]]**
- Linked Case: **[[courses/mkX-slug/week-YY/case-[slug]|Case Study]]**
- Applied Concept: **[[concepts/slug|Concept Name]]**
```
