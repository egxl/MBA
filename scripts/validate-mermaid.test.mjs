import assert from "node:assert/strict"
import { test } from "node:test"
import { extractDiagramType, validateMermaidBlock, detectAsciiBoxArt } from "./validate-mermaid.mjs"

test("extractDiagramType parses diagram types correctly", () => {
  assert.equal(extractDiagramType("flowchart LR\n  A --> B"), "flowchart")
  assert.equal(
    extractDiagramType("---\ntitle: Sample\n---\nquadrantChart\n  x-axis L --> H"),
    "quadrantChart",
  )
  assert.equal(
    extractDiagramType("%%{init: {'theme': 'dark'}}%%\nsankey-beta\n  A,B,10"),
    "sankey-beta",
  )
  assert.equal(extractDiagramType("erDiagram\n  CUSTOMER ||--o{ ORDER : places"), "erDiagram")
  assert.equal(extractDiagramType("classDiagram\n  class BankAccount"), "classDiagram")
  assert.equal(extractDiagramType("stateDiagram-v2\n  [*] --> Still"), "stateDiagram-v2")
})

test("validateMermaidBlock allows structural braces in erDiagram, classDiagram, and stateDiagram-v2", () => {
  const er = `erDiagram
  CUSTOMER ||--o{ ORDER : places
  CUSTOMER {
    string name
    string email
  }`
  assert.equal(validateMermaidBlock(er, "test.md", 1).length, 0)

  const cls = `classDiagram
  class BankAccount {
    +String owner
    +BigDecimal balance
    +deposit(amount)
  }`
  assert.equal(validateMermaidBlock(cls, "test.md", 1).length, 0)

  const state = `stateDiagram-v2
  [*] --> Still
  state Active {
    [*] --> Processing
  }`
  assert.equal(validateMermaidBlock(state, "test.md", 1).length, 0)
})

test("validateMermaidBlock validates sankey-beta CSV format and flags arrows", () => {
  const validSankey = `sankey-beta
  Revenue,COGS,60
  Revenue,GrossProfit,40`
  assert.equal(validateMermaidBlock(validSankey, "test.md", 1).length, 0)

  const invalidSankey = `sankey-beta
  Revenue --> COGS : 60`
  const errors = validateMermaidBlock(invalidSankey, "test.md", 1)
  assert.ok(errors.some((e) => e.message.includes("Sankey diagrams require CSV format")))
})

test("validateMermaidBlock validates quadrantChart axes requirements", () => {
  const validQuadrant = `quadrantChart
  title Strategic Priority Matrix
  x-axis Low Urgency --> High Urgency
  y-axis Low Impact --> High Impact
  quadrant-1 Quick Wins
  quadrant-2 Major Projects
  Task A: [0.3, 0.6]`
  assert.equal(validateMermaidBlock(validQuadrant, "test.md", 1).length, 0)

  const invalidQuadrant = `quadrantChart
  title Strategic Priority Matrix
  Task A: [0.3, 0.6]`
  const errors = validateMermaidBlock(invalidQuadrant, "test.md", 1)
  assert.ok(errors.some((e) => e.message.includes("should define both 'x-axis' and 'y-axis'")))
})

test("validateMermaidBlock accepts valid 25+ diagram types", () => {
  const validBlocks = [
    `xychart-beta\n  title "Revenue"\n  x-axis [2021, 2022]\n  y-axis "USD" 0 --> 100\n  bar [50, 75]`,
    `mindmap\n  root((MBA))\n    Finance\n      WACC`,
    `timeline\n  title History\n  2020 : Founded\n  2024 : Expansion`,
    `gantt\n  title Roadmap\n  dateFormat YYYY-MM-DD\n  section Phase 1\n  Task 1 :2024-01-01, 30d`,
    `pie title Market Share\n  "Company A" : 60\n  "Company B" : 40`,
    `kanban\n  Todo\n    [Task 1]\n  Done\n    [Task 2]`,
    `block-beta\n  columns 3\n  A["Block A"] B["Block B"] C["Block C"]`,
    `radar-beta\n  axis Quality [0, 10], Speed [0, 10]\n  "Our Enterprise": [8, 9]`,
  ]
  for (const b of validBlocks) {
    assert.equal(validateMermaidBlock(b, "test.md", 1).length, 0, `Failed for:\n${b}`)
  }
})

test("validateMermaidBlock flags unknown diagram type", () => {
  const invalid = `fabricatedDiagramType\n  A -> B`
  const errors = validateMermaidBlock(invalid, "test.md", 1)
  assert.ok(errors.some((e) => e.message.includes("Unknown or unsupported Mermaid diagram type")))
})

test("validateMermaidBlock accepts valid quoted nodes and <br/> linebreaks", () => {
  const validDiagram = `
flowchart TD
    Start([Passenger Arrives at Station]) --> GateCheck{"FR-Ready?<br/>Registered & Willing?"}
    GateCheck -- "YES (Registered)" --> ApproachFR[Approach Face Recognition Gate]
    GateCheck -- "NO (Unregistered)" --> ChoiceGate{"Choose Path?"}
    ChoiceGate --> CSQueue["Queue at Customer Service Desk"]
  `
  const errors = validateMermaidBlock(validDiagram, "test.md", 1)
  assert.equal(errors.length, 0)
})

test("validateMermaidBlock catches unquoted decision nodes with special characters", () => {
  const invalidDiagram = `
flowchart TD
    Start([Passenger Arrives]) --> GateCheck{FR-Ready?\nRegistered & Willing?}
    GateCheck --> ChoiceGate{Choose Path?}
  `
  const errors = validateMermaidBlock(invalidDiagram, "test.md", 1)
  assert.ok(errors.length >= 2)
  assert.ok(errors.some((e) => e.message.includes("Decision node has unquoted special characters")))
})

test("validateMermaidBlock catches literal \\n in diagram labels", () => {
  const invalidDiagram = `
graph TD
    NodeA["First Line\\nSecond Line"] --> NodeB["Third Line"]
  `
  const errors = validateMermaidBlock(invalidDiagram, "test.md", 1)
  assert.ok(errors.some((e) => e.message.includes("Found literal '\\n'")))
})

test("validateMermaidBlock catches unmatched quotes", () => {
  const invalidDiagram = `
graph TD
    NodeA["Unclosed quote] --> NodeB["Valid"]
  `
  const errors = validateMermaidBlock(invalidDiagram, "test.md", 1)
  assert.ok(errors.some((e) => e.message.includes("Unmatched double quotes")))
})

test("validateMermaidBlock catches unescaped markdown list syntax in labels", () => {
  const invalidDiagram = `
flowchart TD
    S1["1. Create Purpose Statement"]
    BUMN --> M1["Mandat 1<br/>- Item one"]
  `
  const errors = validateMermaidBlock(invalidDiagram, "test.md", 1)
  assert.equal(errors.length, 2)
  assert.ok(errors.some((e) => e.message.includes("Unsupported markdown: list")))
})

test("validateMermaidBlock accepts safe escaped numbers and unicode bullets", () => {
  const validDiagram = `
flowchart TD
    S1["1\\. Create Purpose Statement"]
    S2["Stage 1: Create Purpose Statement"]
    BUMN --> M1["Mandat 1<br/>• Item one"]
  `
  const errors = validateMermaidBlock(validDiagram, "test.md", 1)
  assert.equal(errors.length, 0)
})

test("validateMermaidBlock catches unquoted parentheses in edge labels", () => {
  const invalidDiagram = `
flowchart LR
    A -->|Multiply by (1 + r)| B
  `
  const errors = validateMermaidBlock(invalidDiagram, "test.md", 1)
  assert.equal(errors.length, 1)
  assert.ok(errors[0].message.includes("Edge label contains unquoted parentheses"))
})

test("validateMermaidBlock accepts quoted edge labels with parentheses", () => {
  const validDiagram = `
flowchart LR
    A -->|"Multiply by (1 + r)"| B
  `
  const errors = validateMermaidBlock(validDiagram, "test.md", 1)
  assert.equal(errors.length, 0)
})

test("validateMermaidBlock flags excessively long vertical linear chains in TD/BT direction", () => {
  const tallChainDiagram = `
flowchart BT
    L1 --> L2 --> L3 --> L4 --> L5
  `
  const errors = validateMermaidBlock(tallChainDiagram, "test.md", 1)
  assert.ok(errors.some((e) => e.message.includes("excessively long single-column vertical chain")))
})

test("validateMermaidBlock accepts balanced horizontal flowcharts and multi-column subgraphs", () => {
  const horizontalDiagram = `
flowchart LR
    S1["Phase 1"] --> S2["Phase 2"] --> S3["Phase 3"] --> S4["Phase 4"] --> S5["Phase 5"]
  `
  const errors = validateMermaidBlock(horizontalDiagram, "test.md", 1)
  assert.equal(errors.length, 0)
})

test("detectAsciiBoxArt flags Unicode and ASCII box art in code blocks", () => {
  const asciiBox = `
┌──────────────────┐    ┌──────────────────┐
│ 1. Scoping       │───►│ 2. Data          │
└──────────────────┘    └──────────────────┘
  `
  const errors = detectAsciiBoxArt(asciiBox, "test.md", 1)
  assert.ok(errors.length > 0)
  assert.ok(errors.some((e) => e.message.includes("Found ASCII/Unicode box diagram")))
})

test("detectAsciiBoxArt accepts normal text and code snippets", () => {
  const normalCode = `
const x = 10;
const y = 20;
console.log(x + y);
  `
  const errors = detectAsciiBoxArt(normalCode, "test.md", 1)
  assert.equal(errors.length, 0)
})

test("validateMermaidBlock catches overflowing quadrantChart labels (> 28 chars)", () => {
  const badQuadrant = `quadrantChart
  title Test
  x-axis Low --> High
  y-axis Low --> High
  quadrant-1 "Super Long Overflowing Quadrant Header That Overlaps Others"
  quadrant-2 "Short"
  quadrant-3 "Short"
  quadrant-4 "Short"`
  const errors = validateMermaidBlock(badQuadrant, "test.md", 1)
  assert.ok(errors.some((e) => e.message.includes("exceeds 28 characters")))
})

test("validateMermaidBlock catches stateDiagram-v2 vertical chain without direction LR", () => {
  const badState = `stateDiagram-v2
  [*] --> State1
  State1 --> State2
  State2 --> State3
  State3 --> State4
  State4 --> [*]`
  const errors = validateMermaidBlock(badState, "test.md", 1)
  assert.ok(errors.some((e) => e.message.includes("without 'direction LR'")))
})

test("validateMermaidBlock catches colon in timeline section header", () => {
  const badTimeline = `timeline
  title Schedule
  section Phase 1: Planning
    Task 1 : Event 1`
  const errors = validateMermaidBlock(badTimeline, "test.md", 1)
  assert.ok(errors.some((e) => e.message.includes("timeline section header contains a colon")))
})

test("validateMermaidBlock flags xychart-beta titled as pyramid or funnel", () => {
  const badXy = `xychart-beta
  title "Piramida Seleksi Nasional"
  x-axis [A, B]
  y-axis "Count" 0 --> 100
  bar [100, 10]`
  const errors = validateMermaidBlock(badXy, "test.md", 1)
  assert.ok(errors.some((e) => e.message.includes("cannot render stepped pyramids or funnels")))
})
