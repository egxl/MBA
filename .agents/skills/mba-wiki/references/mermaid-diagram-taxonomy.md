# Mermaid.js Visual Taxonomy & Diagram Selection Guide (`mermaid-diagram-taxonomy.md`)

This guide defines the authoritative visual classification taxonomy and syntax standard for the **P3MD MBA Knowledge Base**.

When re-creating or creating visualizations from raw slides, business cases, textbook readings, or guest lectures, **never default reflexively to `flowchart LR`**. Classify the source visualization's underlying informational archetype and choose the exact Mermaid.js diagram type from the 25+ supported types.

---

## 🚫 The Anti-Default-Flowchart Rule

> [!CAUTION] The Core Prohibition
> **Do not force matrices, waterfalls, radar benchmarks, schedules, or hierarchies into `flowchart LR`.**
> A 2x2 matrix forced into a flowchart loses its quadrants and spatial meaning. A cash waterfall forced into a flowchart loses its flow magnitude. A timeline forced into a flowchart creates awkward horizontal arrows. Always pick the diagram type designed for the visual archetype.

---

## 🗺️ Visual Archetype Decision Matrix (25+ Types)

Use this decision matrix to identify which Mermaid diagram type matches the raw visual:

```
                                  [Source Material Visual]
                                              |
        +-------------------------------------+-------------------------------------+
        |                                     |                                     |
[Quantitative & Matrix]              [Process & Dynamic]                  [Structural & Planning]
        |                                     |                                     |
  * 2x2 Grid / Matrix                   * Step-by-Step Flow                   * Project Schedule
    -> quadrantChart                      -> flowchart LR                       -> gantt
  * Volume / Cash Flow Waterfall        * Binomial Decision Tree              * Chronology / Milestones
    -> sankey-beta                        -> flowchart TD                       -> timeline
  * Trend / Cartesian Coordinates       * Actor Message / Protocol            * Customer / Employee UX
    -> xychart-beta                       -> sequenceDiagram                    -> journey
  * Multi-Metric Spider Benchmark       * Lifecycle States / Regimes          * Stage-Gate / Kanban Board
    -> radar-beta                         -> stateDiagram-v2                    -> kanban
  * Market Share / Proportions          * Cross-Functional Lanes              * WBS / Idea Decomposition
    -> pie                                -> swimlane-beta                      -> mindmap
  * Overlapping Sets / Shared           * Multi-Agent Orchestration           * Value Chain / Layer Stack
    -> venn-beta                          -> agentflow-beta                     -> block-beta
  * Sense-Making Domains                * ERP Data / Tables                   * IT Cloud Topology
    -> cynefin-beta                       -> erDiagram                          -> architecture-beta / C4Context
```

---

## 📋 Comprehensive Classification & Usage Catalog

### 1. Strategic Matrices & Positioning Grids: `quadrantChart`
* **Trigger Patterns in Raw Decks**: 2x2 grids, BCG Matrix (Growth vs. Share), Ansoff Matrix, Kraljic Matrix (Risk vs. Profit Impact), Eisenhower Matrix (Urgency vs. Importance), Price vs. Quality positioning, Risk vs. Return grids.
* **Syntax Template**:
  ```mermaid
  quadrantChart
    title BCG Growth-Share Matrix
    x-axis "Low Market Share" --> "High Market Share"
    y-axis "Low Market Growth" --> "High Market Growth"
    quadrant-1 "Stars"
    quadrant-2 "Question Marks"
    quadrant-3 "Dogs"
    quadrant-4 "Cash Cows"
    "Product A": [0.75, 0.85]
    "Product B": [0.25, 0.70]
    "Product C": [0.80, 0.20]
    "Product D": [0.15, 0.15]
  ```

---

### 2. Quantitative Waterfalls & Value Flows: `sankey-beta`
* **Trigger Patterns in Raw Decks**: Revenue to Net Income waterfall, Income Statement breakdown (Revenue $\rightarrow$ Gross Profit $\rightarrow$ Operating Income $\rightarrow$ Net Income), supply chain material flow, marketing conversion funnel volume, energy/carbon mass balances.
* **Syntax Template** (pure CSV without flowchart arrows):
  ```mermaid
  sankey-beta
    Gross Revenue,COGS,55
    Gross Revenue,Gross Profit,45
    Gross Profit,OpEx & SG&A,25
    Gross Profit,Operating Profit (EBIT),20
    Operating Profit (EBIT),Interest & Tax,8
    Operating Profit (EBIT),Net Profit,12
  ```

---

### 3. Cartesian Trends & Comparative Bars: `xychart-beta`
* **Trigger Patterns in Raw Decks**: Multi-year financial growth, Revenue vs. Cost overlays, Demand vs. Capacity curves, Inventory run-out rates, Queuing waiting time vs. utilization curves.
* **Syntax Template**:
  ```mermaid
  xychart-beta
    title "Revenue vs Operating Costs (2020-2024)"
    x-axis [2020, 2021, 2022, 2023, 2024]
    y-axis "USD (Millions)" 0 --> 100
    bar [35, 48, 62, 78, 92]
    line [28, 36, 45, 52, 60]
  ```

---

### 4. Multi-Attribute Competency & Competitive Profiling: `radar-beta`
* **Trigger Patterns in Raw Decks**: Porter's 5 Forces intensity comparison, 360-degree leadership assessment, product feature benchmarking against competitors, operational readiness assessments.
* **Syntax Template**:
  ```mermaid
  radar-beta
    axis Quality [0, 10], Cost [0, 10], Speed [0, 10], Flexibility [0, 10], Service [0, 10]
    "Our Enterprise": [9, 6, 8, 7, 9]
    "Competitor Benchmark": [7, 9, 6, 5, 6]
  ```

---

### 5. Proportional Composition & Market Share: `pie`
* **Trigger Patterns in Raw Decks**: Industry market share breakdown, CapEx budget allocation, customer segment share, revenue by geography.
* **Syntax Template**:
  ```mermaid
  pie title Indonesian EV Market Share (2024)
    "Wuling" : 48
    "Hyundai" : 24
    "BYD" : 18
    "Others" : 10
  ```

---

### 6. Overlapping Sets & Core Intersections: `venn-beta`
* **Trigger Patterns in Raw Decks**: Strategic "Sweet Spot" (Customer Needs $\cap$ Company Capabilities $\setminus$ Competitor Offerings), Jim Collins' Hedgehog Concept (Passions $\cap$ Best in World $\cap$ Economic Engine), Ikigai.
* **Syntax Template**:
  ```mermaid
  venn-beta
    A["Customer Unmet Needs"]
    B["Company Core Capabilities"]
    C["Competitor Offerings"]
  ```

---

### 7. Complexity & Sense-Making Domains: `cynefin-beta`
* **Trigger Patterns in Raw Decks**: Dave Snowden's Cynefin framework, decision-making environments (Clear, Complicated, Complex, Chaotic, Aporetics/Confusion).
* **Syntax Template**:
  ```mermaid
  cynefin-beta
  ```

---

### 8. Work Breakdown & Idea Decomposition: `mindmap`
* **Trigger Patterns in Raw Decks**: Work Breakdown Structures (WBS), MECE Issue Trees, Root-Cause 6M Ishikawa decomposition, course concept taxonomies, strategy brainstorm trees.
* **Syntax Template**:
  ```mermaid
  mindmap
    root((Supply Chain Risk))
      Supply Side
        Single-Source Supplier
        Geopolitical Embargo
      Demand Side
        Bullwhip Amplification
        Forecast Volatility
      Operational
        Bottleneck Capacity
        Machine Downtime
  ```

---

### 9. Hierarchical Sizing & Portfolio Blocks: `treemap`
* **Trigger Patterns in Raw Decks**: Revenue breakdown by division and product category, Market sizing (TAM, SAM, SOM), conglomerate asset allocation.
* **Syntax Template**:
  ```mermaid
  treemap
    title "Revenue by Division"
    "BUMN Holding"
      "Mining & Resources" : 45
        "Coal" : 30
        "Nickel" : 15
      "Infrastructure" : 35
        "Toll Roads" : 20
        "Ports" : 15
      "Energy & Utilities" : 20
  ```

---

### 10. Chronological History & Corporate Evolution: `timeline`
* **Trigger Patterns in Raw Decks**: Corporate history milestones, regulatory evolution over decades, M&A history, industrial revolution phases.
* **Syntax Template**:
  ```mermaid
  timeline
    title Corporate Evolution of PT Kereta Commuter Indonesia
    section Pre-Reform
      2008 : Established as KRL Commuter Jabodetabek
    section Modernization
      2013 : E-Ticketing System Rollout
           : Elimination of Roof Riders
      2017 : Rebranded to PT Kereta Commuter Indonesia (KCI)
    section Network Expansion
      2020 : Electrification of Solo-Yogyakarta Line
  ```

---

### 11. Project Schedules & 30-60-90 Day Roadmaps: `gantt`
* **Trigger Patterns in Raw Decks**: Action Learning Project (ALP) schedules, 30-60-90 day executive turnaround plans, CPM/PERT project plans, product launch roadmaps.
* **Syntax Template**:
  ```mermaid
  gantt
    title ALP 90-Day Turnaround Roadmap
    dateFormat YYYY-MM-DD
    section Phase 1: Diagnostic
      Stakeholder Interviews   :done, p1, 2024-01-01, 2024-01-20
      Financial Health Audit   :active, p2, 2024-01-15, 2024-02-05
    section Phase 2: Solution Design
      Pilot Operational Model  :crit, p3, 2024-02-06, 2024-03-01
    section Phase 3: Executive Handover
      Board Presentation       :p4, 2024-03-02, 2024-03-15
  ```

---

### 12. Customer / Employee Experience Maps: `journey`
* **Trigger Patterns in Raw Decks**: Customer journey mapping, patient experience audits, student onboarding journeys, service design touchpoints with emotional scores (1–5).
* **Syntax Template**:
  ```mermaid
  journey
    title B2B Enterprise Client Onboarding Journey
    section Discovery
      Visit Website: 4: Client
      Download Whitepaper: 3: Client
    section Procurement
      RFP Review: 2: Client, Procurement
      Price Negotiation: 1: Client, Sales, Legal
    section Deployment
      Kickoff Workshop: 5: Client, Implementation Team
      System Integration: 3: Technical Lead
  ```

---

### 13. Stage-Gate & Agile Workflow Boards: `kanban`
* **Trigger Patterns in Raw Decks**: Stage-gate innovation pipelines, M&A deal funnel stages, product feature backlogs, Kaizen continuous improvement boards.
* **Syntax Template**:
  ```mermaid
  kanban
    Deal Sourcing
      id1[Target Alpha: Clean Energy]
      id2[Target Beta: Logistics]
    Due Diligence
      id3[Target Gamma: HealthTech - Financial Audit]
    Investment Committee
      id4[Target Delta: Approved for Term Sheet]
    Completed
      id5[Target Epsilon: Acquired]
  ```

---

### 14. Cross-Functional Department Lanes: `swimlane-beta`
* **Trigger Patterns in Raw Decks**: Cross-departmental handoffs, Order-to-Cash process across Sales, Finance, Warehouse, and Shipping; service blueprints.
* **Syntax Template**:
  ```mermaid
  swimlane-beta
    lane Sales
      Lead Intake --> Credit Check Request
    lane Finance
      Credit Check Request --> Credit Approval
    lane Warehouse
      Credit Approval --> Pick & Pack
  ```

---

### 15. Actor-to-Actor Protocols & Negotiations: `sequenceDiagram`
* **Trigger Patterns in Raw Decks**: Buyer-Seller bargaining rounds, Bullwhip effect order placements across retail/wholesale/factory, Letter of Credit (L/C) trade finance transaction flows, API interactions.
* **Syntax Template**:
  ```mermaid
  sequenceDiagram
    autonumber
    actor Buyer as Syndicate Buyer
    actor Seller as Enterprise Seller
    participant Bank as Escrow Bank

    Buyer->>Seller: Initial Tender Offer ($10M)
    Seller-->>Buyer: Counter-Offer ($12M with Service SLA)
    Buyer->>Bank: Deposit 20% Performance Bond
    Bank-->>Seller: Confirm Funds Held in Escrow
    Seller->>Buyer: Transfer Operating Assets
  ```

---

### 16. State Machines & Strategic Regimes: `stateDiagram-v2`
* **Trigger Patterns in Raw Decks**: Customer lifecycle regimes (Prospect $\rightarrow$ Active $\rightarrow$ At-Risk $\rightarrow$ Churned), credit rating transitions (AAA $\rightarrow$ BBB $\rightarrow$ Default), corporate turnaround stages.
* **Syntax Template**:
  ```mermaid
  stateDiagram-v2
    [*] --> Prospect
    Prospect --> ActiveCustomer: First Purchase
    ActiveCustomer --> AtRisk: Inactivity > 60 Days
    AtRisk --> Churned: No Response to Promotion
    AtRisk --> ActiveCustomer: Retention Discount Accepted
    Churned --> WinBack: Targeted Campaign
    WinBack --> ActiveCustomer: Re-onboarding
    Churned --> [*]
  ```

---

### 17. Relational Data Models & Schemas: `erDiagram`
* **Trigger Patterns in Raw Decks**: Relational database schemas, star schemas for analytics, ERP tables (Orders, Customers, LineItems, Inventory).
* **Syntax Template**:
  ```mermaid
  erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ ORDER-ITEM : contains
    PRODUCT ||--o{ ORDER-ITEM : included_in
    CUSTOMER {
      string customerId PK
      string companyName
      string tier
    }
    ORDER {
      int orderId PK
      date orderDate
      decimal totalAmount
    }
  ```

---

### 18. Value Chains, Layered Stacks & Architectural Blocks: `block-beta`
* **Trigger Patterns in Raw Decks**: Porter's Value Chain (Support activities spanning across primary activity columns), Balanced Scorecard 4-perspective stacked layers, Enterprise architecture tech stacks, Stepped Selection Pyramids, Tiered Funnels.
* **Syntax Template (Value Chain)**:
  ```mermaid
  block-beta
    columns 5
    block:support:5
      FirmInfrastructure["Firm Infrastructure & Corporate Governance"]
      HumanResources["HR Management & Talent Development"]
      TechDev["Technology & R&D Development"]
      Procurement["Procurement & Vendor Relationships"]
    end
    Inbound["Inbound Logistics"]
    Operations["Operations"]
    Outbound["Outbound Logistics"]
    Marketing["Marketing & Sales"]
    Service["After-Sales Service"]
  ```
* **Syntax Template (Stepped Selection Pyramid)**:
  ```mermaid
  block-beta
    columns 12
    space:5 Apex[/"Tier 4: 100 Selected"\]:2 space:5
    space:4 Tier3[/"Tier 3: 500 Interviewed"\]:4 space:4
    space:2 Tier2[/"Tier 2: 2,500 Screened"\]:8 space:2
    Tier1[/"Tier 1: 10,000 Applicants"\]:12
  ```

---

### Strict Diagram Guardrails (CI Enforced)

1. **`quadrantChart`**: Keep all `quadrant-[1-4]`, `x-axis`, and `y-axis` text $\le 28$ characters. Mermaid 12.3.0 renders raw SVG text without word wrapping on a 500–640px grid; longer labels collide and overlap.
2. **`stateDiagram-v2`**: When authoring sequential states ($\ge 4$ transitions), declare `direction LR` (optionally grouped into composite `state "Phase Name" as P { direction LR ... }`) to avoid tall vertical towers.
3. **`timeline`**: Never put a colon `:` inside `section` or `title` headers. In Mermaid 12.3.0's timeline lexer, `:` is the token separator for events; a colon in section headers causes `Cannot read properties of undefined (reading 'events')`.
4. **Pyramids & Funnels**: Do not use `xychart-beta` for pyramids or funnels (it renders standard Cartesian vertical bar charts). Use centered 12-column `block-beta` trapezoids with `space:K` margins or `sankey-beta`.

---

### 19. Enterprise IT & Cloud Topology: `architecture-beta` / `C4Context`
* **Trigger Patterns in Raw Decks**: Core banking modernization, API gateway topologies, microservices environments, enterprise data warehouse architecture.
* **Syntax Template**:
  ```mermaid
  architecture-beta
    group core(cloud)[Core Banking System]
    service api(server)[API Gateway] in core
    service db(database)[PostgreSQL Ledger] in core
    service mobile(internet)[Mobile App Client]

    mobile:R --> L:api
    api:B --> T:db
  ```

---

### 20. Process Mechanisms & Decision Trees: `flowchart LR` / `flowchart TD`
* **Trigger Patterns in Raw Decks**: Causal loop mechanisms, multi-stage production processes, decision logic with conditional branching.
* **Horizontal-First Rule**: Use `flowchart LR` for processes, progressions, and timelines.
* **Branching Trees Only**: Use `flowchart TD` *only* for top-down branching decision trees where each level expands horizontally ($\ge 2$ children per node). Never author linear single-column towers in `TD`.
* **Syntax Template**:
  ```mermaid
  flowchart LR
    A["Raw Material Intake"] --> B["Quality Inspection"]
    B -->|Passed| C["Assembly & Packaging"]
    B -->|Failed| D["Scrap or Rework"]
  ```

---

## 🛠️ Step-by-Step Decision Protocol for Ingestion

Before writing a diagram into a lecture hub or satellite:
1. **Identify the Visual Purpose**: What does this slide convey? Is it a grid? A flow volume? A chronology? A set overlap? A protocol sequence?
2. **Consult the Decision Matrix**: Find the matching Mermaid diagram type.
3. **Copy the Tested Syntax Template**: Use the canonical template above to prevent syntax errors.
4. **Preserve Vector Quality**: Do not substitute with ASCII box art (`+---+`) or generic bullet lists.
5. **Verify with CI**: Run `npm run mermaid:check` to validate all syntax, quotes, and structural rules.
