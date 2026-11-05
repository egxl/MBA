---
name: mba-enrich
description: >-
  First-principles pedagogical remediation and concept expansion skill for the P3MD MBA portal.
  Transforms formula-dump pages, bare equation stacks, and unexplained prerequisite jargon into
  zero-prerequisite, intuition-first executive study guides. Can target a specific course (mk1-mk6),
  week (mk2 week 5), concept (concept:time-value-of-money), article (case-... or assignment-...), or
  entity (entity:pt-bukit-asam).
---

# MBA Pedagogical Remediation & Concept Expander (`mba-enrich`)

The **MBA Enrich** skill remediates existing pages in the P3MD MBA Knowledge Base that feel like a compilation of naked mathematical formulas or assume deep prior knowledge. It injects a **Zero-Prerequisite, First-Principles Pedagogical Architecture** so that any reader—regardless of technical or mathematical background—can understand every concept from intuition to execution.

```
       +-------------------------------------------------------------+
       |             THE FIRST-PRINCIPLES REMEDIATION PIPELINE       |
       +-------------------------------------------------------------+
                                      |
                      User Target Query (Flexible Scopes)
                      - Course: `mk2`
                      - Week: `mk2 week 5`, `mk4 w7`, `mk2 mid`
                      - Concept: `concepts/queuing-theory`, `time-value-of-money`
                      - Article: `case-alpine-ridge-cvp`, `assignment-wacc`
                      - Entity: `entities/pt-bukit-asam`
                                      v
       +-------------------------------------------------------------+
       | 1. RESOLVE & AUDIT (`node ./scripts/audit-pedagogy.mjs`)     |
       |    - Pinpoints stacked $$...$$ math blocks without prose    |
       |    - Finds high-density formula clusters with thin context  |
       |    - Detects corrupted frontmatter titles/modules           |
       +-------------------------------------------------------------+
                                      |
                                      v
       +-------------------------------------------------------------+
       | 2. INJECT THE 4 FIRST-PRINCIPLES PEDAGOGICAL LAYERS         |
       |    1. Plain-English Intuition & Everyday Analogy            |
       |    2. Prerequisite & Jargon Decoder (EBIT, Poisson, etc.)   |
       |    3. Structural Mechanics (Why numerator vs denominator)   |
       |    4. 10-Second Mental-Math Micro-Example                   |
       +-------------------------------------------------------------+
                                      |
                                      v
       +-------------------------------------------------------------+
       | 3. VERIFY & VALIDATE                                        |
       |    - `npm run wiki:pedagogy -- --target "<target>"`         |
       |    - `npm run check` & `npx quartz build`                   |
       +-------------------------------------------------------------+
```

---

## Operating Principles & Golden Rules

1. **Zero Prior Knowledge Assumed**:
   Write as if the reader has never studied financial accounting, calculus, probability distributions, or organizational psychology. Jargon like *EBIT*, *working capital*, *beta*, *Poisson arrival*, *test-retest reliability*, or *tax shield* must be explained on the spot in plain terms.

2. **The "No Lost Signal" Contract**:
   **Never delete or water down existing formulas, data tables, case exhibits, or empirical numbers.** Remediation is additive and structural: explain and bridge the existing rigor, never eliminate it.

3. **Break Apart Stacked Formula Blocks**:
   Never leave consecutive `$$...$$` blocks glued together. Every formula must be prefaced by what it measures and followed by why its variables interact the way they do.

4. **Preserve Frontmatter & Wikilink Integrity**:
   Ensure frontmatter `title` and `module` fields are clean, canonical strings (never broken by link-cleaning artifacts like trailing commas or ampersands). Maintain all existing Quartz wikilinks (`[[concepts/...]]`).

---

## The 4 First-Principles Pedagogical Layers

When remediating any mathematical equation or quantitative framework, structure the content using these four layers:

### Layer 1: Plain-English Intuition ("The Kitchen-Table Analogy")
Explain what real-world dilemma or common-sense truth this formula solves before displaying mathematical symbols.
> *Example:* Before computing Break-Even Point ($BEP = \text{Fixed Costs} / CM$), explain: *"Imagine you open a coffee cart. You pay Rp 1,000,000 every month in cart rent whether you sell zero cups or a thousand. Each cup costs Rp 10,000 in beans and milk and sells for Rp 25,000, leaving you with Rp 15,000 in gross margin per cup. To not lose money, how many cups of coffee must you sell just to pay the landlord?"*

### Layer 2: Prerequisite & Jargon Decoder
Define every variable, symbol, and acronym on the spot:
- **$\text{Fixed Costs}$**: Unavoidable baseline expenses (rent, equipment depreciation, salaries) that do not change whether factory volume is high or zero.
- **$\text{Contribution Margin } (P - V)$**: The net cash each sale contributes toward covering the fixed overhead bills after paying direct raw material and labor costs.

### Layer 3: Structural Anatomy (Why This Formula Works)
Explain the physics of the fraction:
- **Numerator**: Why increasing this term drives the metric up.
- **Denominator**: Why this term acts as a drag, friction, penalty, or scaling base.
- *"If fixed rent doubles, you need twice as many customers to break even. But if you raise your margin per cup, each cup chips away at the rent faster, shrinking the number of sales required."*

### Layer 4: 10-Second Mental-Math Micro-Example
Provide a simple calculation with round numbers so the reader can immediately verify the arithmetic in their head:
$$\text{BEP} = \frac{\text{Rp } 1,000,000}{\text{Rp } 15,000/\text{cup}} \approx 66.7 \implies \mathbf{67\text{ cups of coffee to break even}}.$$

---

## Supported Target Selectors

Run the remediation workflow using any of the following scopes:

| Selector Pattern | Example Command / Query | What It Resolves |
| :--- | :--- | :--- |
| **Course-wide** | `/mba-enrich mk2` | All weekly lecture hubs and satellites in MK2, prioritized by formula density. |
| **Week-level** | `/mba-enrich mk2 week 5` | `content/courses/mk2-.../week-05/index.md` and all related satellites in week 5. |
| **Mid-term dossier** | `/mba-enrich mk2 mid` | `content/courses/mk2-.../mid/index.md`. |
| **Concept note** | `/mba-enrich concept:time-value-of-money` | `content/concepts/time-value-of-money.md`. |
| **All concepts** | `/mba-enrich all-concepts` | All files in `content/concepts/`. |
| **Case / Assignment**| `/mba-enrich case-alpine-ridge-cvp` | Specific case, reading, or assignment file. |
| **Entity note** | `/mba-enrich entity:pt-bukit-asam` | `content/entities/pt-bukit-asam.md` (explaining financial/operational metrics in case snapshots). |

---

## Remediation Execution Workflow

1. **Audit & Target Resolution**:
   Run the CLI auditor on your target to inspect all flagged issues and line numbers:
   ```bash
   node ./scripts/audit-pedagogy.mjs --target "<target>"
   ```
2. **Review Target Files & Catalog Prerequisites**:
   Read the target file. Identify all unannotated formulas, domain acronyms, and implied prior knowledge.
3. **Apply the 4 First-Principles Layers**:
   - Add plain-English intuition and real-world analogies.
   - Insert jargon decoders defining prerequisite terms.
   - Break apart consecutive `$$...$$` math blocks with structural explanations.
   - Add micro-numerical mental-math walkthroughs.
   - Fix any corrupted frontmatter titles.
4. **Verify Quality & Zero Regressions**:
   ```bash
   node ./scripts/audit-pedagogy.mjs --target "<target>"
   npm run check
   npm test
   npx quartz build
   ```
