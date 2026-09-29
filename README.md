<div align="center">

<img src="quartz/static/logo.png" alt="P3MD MBA Logo" width="320" />

# P3MD MBA ACADEMIC PORTAL

**Executive Knowledge Base and Strategic Curriculum Hub**<br />
_School of Business and Management, Institut Teknologi Bandung (SBM ITB)_

[![Institution](https://img.shields.io/badge/Institution-SBM%20ITB-003366?style=flat-square)](https://www.sbm.itb.ac.id/)
[![Cohort](https://img.shields.io/badge/Cohort-P3MD%20Nawasena-7c3aed?style=flat-square)](#overview)
[![Framework](https://img.shields.io/badge/Framework-Quartz%204.5.2-1e293b?style=flat-square)](https://quartz.jzhao.xyz/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-0284c7?style=flat-square)](LICENSE.txt)

<p align="center">
  <a href="#overview">Overview</a> •
  <a href="#curriculum-matrix">Curriculum Matrix</a> •
  <a href="#70-20-10-learning-model">Learning Model</a> •
  <a href="#capstone-and-governance">Capstone & Governance</a> •
  <a href="#technical-architecture">Architecture</a> •
  <a href="#getting-started">Getting Started</a>
</p>

---

</div>

## Overview

The **P3MD MBA Knowledge Base** is the official academic repository, curriculum directory, and strategic knowledge graph for the P3MD MBA Nawasena cohort at SBM ITB. Built on Quartz 4, the portal synthesizes academic lecture notes, quantitative modeling guides, Harvard business cases, capstone consulting blueprints, and faculty directory assets into an interlinked digital garden.

The portal provides an operational bridge between academic theory and institutional practice across state-owned enterprises (BUMN), Danantara Indonesia, and the Ministry of Defense (Kemhan RI).

---

## Curriculum Matrix

The core academic curriculum spans six foundational management courses alongside specialized workforce analytics electives.

| Code       | Course Title                              | Core Disciplines                                                               | Deliverables & Cases                                         |
| :--------- | :---------------------------------------- | :----------------------------------------------------------------------------- | :----------------------------------------------------------- |
| **MK 001** | Organizational Behavior & Managing People | Organizational dynamics, leadership models, team behavior, change architecture | Harvard Walmart Case, Five Forces analysis, weekly quizzes   |
| **MK 002** | Financial Management & Strategy           | Corporate finance, WACC modeling, capital structure, valuation multiples       | WACC calculation sheets, valuation models, capital budgeting |
| **MK 003** | Marketing Management                      | Market segmentation, positioning strategy, brand equity, digital reach         | Value proposition blueprints, GTM strategies, market audits  |
| **MK 004** | Operations & Supply Chain Management      | Process mapping, bottleneck elimination, lean logistics, supply resilience     | SCM optimization models, capacity planning studies           |
| **MK 005** | Decision Making & Negotiation             | Game theory, cognitive bias mitigation, multi-party bargaining                 | Negotiation simulation dossiers, decision analysis matrices  |
| **MK 006** | Business Analytics                        | Predictive modeling, econometric regression, decision trees, analytics ops     | Statistical models, data intelligence notebooks              |
| **BONUS**  | PeopleMath (Elective)                     | Quantitative HR analytics, workforce capacity planning, compensation design    | Workforce attrition models, compensation formulas            |

---

## 70-20-10 Learning Model

The program operates under an integrated adult learning paradigm calibrated to develop executive problem-solving and cross-functional leadership capabilities.

```text
70% EXPERIENTIAL (868 Hours)
└── Action Learning Project (ALP) consulting across partner BUMNs
└── On-site strategic problem definition, diagnostics, and intervention execution

20% SOCIAL (196 Hours)
└── Executive coaching, mentor debriefs, and cross-cohort sparring sessions
└── Peer defense panels, case group discussions, and leadership workshops

10% FORMAL (112 Hours)
└── Core modular lectures (MK 001 - MK 006), masterclasses, and examinations
└── Structured frameworks, quantitative method drills, and academic reviews
```

| Component                 | Share |  Volume   | Educational Focus                          | Primary Outcomes                                        |
| :------------------------ | :---: | :-------: | :----------------------------------------- | :------------------------------------------------------ |
| **Experiential Learning** |  70%  | 868 Hours | Enterprise consulting, on-site diagnostics | Validated intervention roadmap, BUMN capstone defense   |
| **Social Learning**       |  20%  | 196 Hours | Executive coaching, cohort case debates    | Peer feedback integration, cross-sector insight sharing |
| **Formal Instruction**    |  10%  | 112 Hours | Structured syllabus, case lectures         | Conceptual mastery, quantitative analysis rigor         |

---

## Capstone and Governance

The portal houses complete governance, scheduling, and execution documents for both cohort members and academic leadership.

- **Program Architecture Hub:** Comprehensive curriculum logic, credit structures, and institutional governance.
- **Action Learning Project (ALP) Blueprint:** 6-stage gated capstone methodology deployed across 10 partner BUMN entities, detailing Gate M1 (Diagnostic), Gate M2 (Solution), and Gate M3 (Execution).
- **Master Academic Calendar:** 16-week synchronized timeline coordinating case discussions, CEO guest lectures, exams, and milestone gates.
- **Faculty & Course Assistant Directory:** Centralized contact ledger and office hour scheduling for SBM ITB Lead Faculty, co-lecturers, and teaching assistants.

---

## Technical Architecture

The knowledge base is generated statically through an optimized Quartz 4 pipeline with custom extensions for executive readability.

### Core Stack

- **Static Site Engine:** Quartz 4.5.2 (Node.js ecosystem)
- **Component Layer:** Preact / JSX / TSX
- **Styling Architecture:** Custom SCSS with semantic design tokens, responsive typography, and adaptive light/dark theming
- **Mathematics & Diagrams:** KaTeX (LaTeX math expressions) and Mermaid.js (state diagrams, workflows)
- **Search & Exploration:** Client-side full-text search index and interactive D3 force-directed knowledge graph
- **Navigation:** Dual-sidebar layout with collapsible explorer, breadcrumb navigation, and SPA prefetching

### Directory Layout

```text
MBA/
├── .agents/                    # Agent operational context, handoff templates, and task logs
├── AGENTS.md                   # Operational guidelines for automated agents and contributors
├── Mightbeuseful/              # Reference LaTeX sources, journey notes, and curriculum input
├── content/                    # Published markdown knowledge base
│   ├── assets/                 # Embedded media files and poster graphics
│   ├── courses/                # Syllabi, lecture notes, case studies (MK 001 - MK 006)
│   ├── program/                # Academic calendar, ALP blueprint, faculty directory
│   └── index.md                # Portal home featuring Socratica-style course cards
├── quartz/                     # Quartz engine, custom components, and layout logic
│   ├── components/             # TSX components (HomeButton, Explorer, Graph, PageTitle)
│   ├── plugins/                # Content transformers and static emitters
│   ├── static/                 # Static branding assets, logos, and stylesheets
│   └── styles/                 # Global styles, variables, and typography rules
├── quartz.config.ts            # Site identity, URL, plugins, and theme tokens
├── quartz.layout.ts            # Component positioning for desktop and mobile viewports
├── scripts/                    # Maintenance and agent utility scripts
├── package.json                # Project dependencies and script declarations
└── tsconfig.json               # TypeScript compiler configuration
```

---

## Getting Started

### Prerequisites

Ensure the following runtimes are installed on your workstation:

- **Node.js:** version 20.0.0 or higher
- **npm:** version 10.0.0 or higher

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/egxl/MBA.git
cd MBA
npm install
```

### Local Development

Launch the live-reloading Quartz preview server:

```bash
npx quartz build --serve
```

Open `http://localhost:8080` in your web browser to explore the portal.

### Code Style and Quality Checks

Validate TypeScript types and verify Prettier code formatting:

```bash
npm run check
```

Format code and markdown files automatically:

```bash
npm run format
```

Run test suite:

```bash
npm test
```

### Production Build

Compile the production-ready static assets:

```bash
npx quartz build
```

Build output is written to the `public/` directory.

---

## Contributing and Content Rules

1. **Content Root:** All documentation edits and additions must reside in `content/`.
2. **Formatting Standards:** Ensure markdown headers, YAML frontmatter, and internal wikilinks match existing naming structures.
3. **Build Artifacts:** Do not edit or track files in `public/`.
4. **Theme Modifications:** Maintain responsive layouts and dual light/dark mode contrast when editing `quartz/styles/` or `quartz.config.ts`.
5. **Agent Workflows:** Consult `AGENTS.md` and update `.agents/current-task.md` when executing automated tasks.

---

## License and Acknowledgments

- **Engine:** Built with [Quartz v4](https://quartz.jzhao.xyz/) by Jacky Zhao, released under the MIT License.
- **Academic Rights:** All curriculum outlines, lecture notes, case materials, and institutional insignia are the proprietary property of SBM ITB, the P3MD program, and partner organizations.
