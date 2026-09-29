# P3MD MBA Knowledge Base and Academic Portal

The P3MD MBA Knowledge Base is the centralized academic portal and curriculum repository for the P3MD MBA cohort at SBM ITB. Powered by Quartz 4, this site compiles course content, weekly lecture notes, case studies, academic governance documentation, and the Action Learning Project (ALP) framework into an interlinked knowledge graph.

## Overview

The portal serves cohort participants, faculty members, course assistants, and organizational partners across BUMN, Danantara Indonesia, and Kemhan RI. The curriculum integrates rigorous business theory with practical strategic execution through a 70-20-10 adult learning framework.

## Curriculum Structure

### Core Courses

- MK 001: Organizational Behavior and Managing People (OB and HR leadership, team dynamics, culture, and organizational transformation)
- MK 002: Financial Management and Strategy (Corporate finance, WACC, capital structure, valuation, and capital allocation)
- MK 003: Marketing Management (Strategic marketing, customer value creation, segmentation, positioning, and digital reach)
- MK 004: Operations and Supply Chain Management (Process optimization, lean manufacturing, logistics, and supply resilience)
- MK 005: Decision Making and Negotiation (Quantitative and behavioral decision analysis, game theory, and strategic bargaining)
- MK 006: Business Analytics (Data-driven intelligence, predictive modeling, statistical inference, and managerial analytics)

### Elective and Supplementary Studies

- PeopleMath: Quantitative foundations in workforce analytics, compensation design, and organizational capacity modeling

### Program Governance and Capstone

- Program Architecture Hub: Strategic overview, learning philosophies, and modular course sequencing
- Learning Journey and 70-20-10 Pedagogy: Experiential learning (868 hours), social coaching (196 hours), and formal coursework (112 hours)
- Action Learning Project (ALP) Blueprint: Multi-stage real-world consulting capstone executed across partner state-owned enterprises (BUMN)
- Master Academic Calendar: 16-week timeline synchronizing lectures, case discussions, CEO guest lectures, exams, and milestone gates
- Faculty and Assistant Directory: Complete directory of Lead Faculty, co-lecturers, and teaching assistants

## Technical Stack

- Engine: Quartz 4.5.2 static site generator
- Languages: TypeScript, TSX, SCSS, Markdown
- Math and Graphics: KaTeX (LaTeX math rendering), Mermaid.js (diagrams), custom inline SVG course posters
- Search and Navigation: Local full-text search index, interactive force-directed graph view, responsive dual-sidebar layout, and Single Page Application (SPA) routing

## Repository Layout

```text
.
├── .agents/              # Agent operating context, handoff templates, and task state
├── AGENTS.md             # Developer and agent operational guidelines
├── Mightbeuseful/        # LaTeX source material and historical curriculum references
├── content/              # Published markdown knowledge base
│   ├── assets/           # Media files and poster assets
│   ├── courses/          # Core course notes, weekly syllabi, cases, and assignments
│   ├── program/          # Program architecture, calendar, ALP blueprint, faculty roster
│   └── index.md          # Cohort portal homepage
├── quartz/               # Quartz core engine, custom components, plugins, and styles
│   ├── components/       # Custom TSX components (HomeButton, Explorer, Graph, PageTitle)
│   ├── plugins/          # Content transformers and page emitters
│   ├── static/           # Static assets, logos, and stylesheets
│   └── styles/           # Base SCSS, variables, and custom typography/theme styling
├── quartz.config.ts      # Site configuration, plugins, typography, and color schemes
├── quartz.layout.ts      # Page component layouts for desktop and mobile views
├── scripts/              # Project maintenance and context scripts
├── package.json          # Node.js dependencies and operational scripts
└── tsconfig.json         # TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js version 20 or higher
- npm version 10 or higher

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/egxl/MBA.git
cd MBA
npm install
```

### Development Server

Start the local live-reloading preview server:

```bash
npx quartz build --serve
```

The documentation and portal will be available at `http://localhost:8080/`.

### Validation and Quality Checks

Run TypeScript typechecking and Prettier formatting validation:

```bash
npm run check
```

Automatically format codebase and markdown files:

```bash
npm run format
```

Run test suite:

```bash
npm test
```

### Production Build

Generate static output for deployment:

```bash
npx quartz build
```

The static site files are generated in the `public/` directory (which is ignored by Git and should not be modified manually).

## Contributing Guidelines

1. Make content additions and adjustments inside `content/`.
2. Ensure every markdown note adheres to frontmatter conventions and valid wikilink syntax.
3. For theme and UI adjustments, edit files within `quartz/` or `quartz.config.ts` without breaking responsive layouts or light/dark mode support.
4. Run `npm run check` and `npx quartz build` before submitting changes.
5. Review `AGENTS.md` before making architectural or automated changes.

## License

This project is built on [Quartz v4](https://quartz.jzhao.xyz/) by Jacky Zhao and licensed under the MIT License. Course materials, curriculum structures, and branding remain the property of their respective academic and institutional owners.
