import assert from "node:assert/strict"
import { test } from "node:test"
import { validateMermaidBlock } from "./validate-mermaid.mjs"

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
