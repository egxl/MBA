import { describe, it } from "node:test"
import assert from "node:assert/strict"
import path from "node:path"
import { fileURLToPath } from "node:url"
import {
  parsePedagogyTargetSpec,
  analyzeMarkdownPedagogy,
  resolvePedagogyTargets,
} from "./audit-pedagogy.mjs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, "..")

describe("Pedagogy & Target Resolver (audit-pedagogy.mjs)", () => {
  it("parses diverse target specifications correctly", () => {
    assert.deepEqual(parsePedagogyTargetSpec("mk2"), { type: "course", course: "mk2" })
    assert.deepEqual(parsePedagogyTargetSpec("mk2 week 5"), {
      type: "week",
      course: "mk2",
      week: "week-05",
    })
    assert.deepEqual(parsePedagogyTargetSpec("mk4 w7"), {
      type: "week",
      course: "mk4",
      week: "week-07",
    })
    assert.deepEqual(parsePedagogyTargetSpec("mk2 mid"), {
      type: "week",
      course: "mk2",
      week: "mid",
    })
    assert.deepEqual(parsePedagogyTargetSpec("concepts/queuing-theory"), {
      type: "concept",
      slug: "queuing-theory",
    })
    assert.deepEqual(parsePedagogyTargetSpec("concept:time-value-of-money"), {
      type: "concept",
      slug: "time-value-of-money",
    })
    assert.deepEqual(parsePedagogyTargetSpec("all-concepts"), { type: "all-concepts" })
    assert.deepEqual(parsePedagogyTargetSpec("entities/unilever"), {
      type: "entity",
      slug: "unilever",
    })
    assert.deepEqual(parsePedagogyTargetSpec("case-alpine-ridge-cvp"), {
      type: "query",
      query: "case-alpine-ridge-cvp",
    })
  })

  it("resolves target files correctly against the repository", async () => {
    const mk2Week5 = await resolvePedagogyTargets(repoRoot, "mk2 week 5")
    assert.ok(mk2Week5.length >= 1, "Should find files in mk2 week 5")
    assert.ok(
      mk2Week5.some((f) => f.includes("index.md")),
      "Should contain index.md in week 5",
    )

    const concept = await resolvePedagogyTargets(repoRoot, "concept:queuing-theory")
    assert.equal(concept.length, 1)
    assert.ok(concept[0].endsWith("queuing-theory.md"))
  })

  it("detects consecutive stacked $$...$$ formula dumps without prose", () => {
    const badContent = `---
title: "Formula Dump Test"
---

## 1. Math Section

$$
\\text{BEP} = \\frac{\\text{Fixed Cost}}{\\text{CM}}
$$
$$
\\text{CM Ratio} = \\frac{P - V}{P}
$$
`
    const issues = analyzeMarkdownPedagogy(badContent, "test.md")
    assert.ok(
      issues.some((i) => i.type === "FORMULA_DUMP" && i.severity === "ERROR"),
      "Should flag stacked display formulas with 0 words between them",
    )
  })

  it("passes well-annotated formulas with intuition and variable mechanics", () => {
    const goodContent = `---
title: "First Principles Walkthrough"
---

## 1. Break-Even Point Intuition

Before calculating the break-even volume, understand the core trade-off: every item sold generates a contribution margin ($P - V$) that chips away at the company's fixed overhead expenses. Once all fixed costs are covered, every subsequent unit sold translates directly into bottom-line operating income.

$$
\\mathbf{\\text{BEP}_{\\text{units}} = \\frac{\\text{Total Fixed Costs}}{\\text{Unit Contribution Margin}}}
$$

### Variable Mechanics & Step-by-Step Breakdown:
- **Total Fixed Costs (Numerator)**: The unavoidable overhead (factory rent, machine leases, baseline salaries). Higher fixed costs push the break-even threshold further to the right.
- **Unit Contribution Margin (Denominator)**: The net cash left over after deducting direct variable production expenses from the selling price ($P - V$). A higher contribution margin allows the company to reach profitability with fewer sales units.
`
    const issues = analyzeMarkdownPedagogy(goodContent, "good.md")
    const formulaDumps = issues.filter((i) => i.type === "FORMULA_DUMP")
    assert.equal(formulaDumps.length, 0, "Well-annotated formula must not trigger formula dump")
  })

  it("detects corrupted frontmatter titles containing stripped wikilink artifacts", () => {
    const badFm = `---
title: "Week 05: Cost Analysis,  & "
module: ""
---
## Overview
Some text.
`
    const issues = analyzeMarkdownPedagogy(badFm, "corrupt.md")
    assert.ok(
      issues.some((i) => i.type === "CORRUPTED_TITLE"),
      "Should detect truncated trailing ampersand/comma in title",
    )
    assert.ok(
      issues.some((i) => i.type === "EMPTY_MODULE"),
      "Should detect empty module frontmatter",
    )
  })
})
