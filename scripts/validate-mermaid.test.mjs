import assert from "node:assert/strict"
import { test } from "node:test"
import { validateMermaidBlock, detectAsciiBoxArt } from "./validate-mermaid.mjs"

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
