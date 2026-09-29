---
title: "Week 06: Decision Analysis: AHP & Decision Trees"
course: "Problem Solving, Decision Making and Negotiation"
course_code: "MK5"
week: 6
module: "Kepner-Tregoe"
type: "weekly-lecture"
tags:
  - MK5
  - ahp
  - decision-trees
  - expected-monetary-value
  - saaty
---

# Week 06: Decision Analysis: AHP & Decision Trees

## 🎯 Executive Summary

When decision criteria are complex, subjective, and difficult to quantify directly, Thomas Saaty's **Analytic Hierarchy Process (AHP)** provides pairwise comparison rigor with consistency checks. When decisions involve sequential uncertainty, **Decision Trees** calculate Expected Monetary Value (EMV).

---

## 1. The Analytic Hierarchy Process (AHP)

### 1. Structure the Hierarchy

Decompose the decision into three levels: **Goal** (Top Level) $\to$ **Criteria & Sub-Criteria** (Middle Level) $\to$ **Alternatives** (Bottom Level).

### 2. Pairwise Comparison Matrix

Compare elements pairwise using Saaty's fundamental 1–9 ratio scale:

- 1 = Equal importance, 3 = Moderate, 5 = Strong, 7 = Very Strong, 9 = Extreme importance.
- If element $A$ is 5 times more important than $B$ ($a_{12} = 5$), then $B$ compared to $A$ is $a_{21} = 1/5$.

### 3. Eigenvector Priority & Consistency Ratio (CR)

- Calculate normalized principal eigenvector to derive priority weights.
- **Consistency Index (CI)** & **Consistency Ratio (CR)**:
  $$\text{CI} = \frac{\lambda_{\max} - n}{n - 1}, \quad \text{CR} = \frac{\text{CI}}{\text{RI}}$$
- If $\text{CR} \le 0.10$ (10%), judgments are consistent and acceptable. If $\text{CR} > 0.10$, pairwise judgments must be re-evaluated for logical inconsistency.

---

## 2. Decision Trees & Sequential Decisions

```
  [Decision Node □] ──── Choice 1 ────► (Chance Node ○) ──── Outcome A (p = 0.7) ──► $10M
                     │                                   └── Outcome B (p = 0.3) ──► -$2M
                     └──── Choice 2 ────► $3M (Riskless)
```

- **Expected Monetary Value (EMV)**: Roll back from right to left:
  $$\text{EMV} = \sum p_i \times \text{Payoff}_i$$
- **Expected Value of Perfect Information (EVPI)**: The maximum price an enterprise should pay to eliminate uncertainty before deciding:
  $$\text{EVPI} = \text{Expected Value with Perfect Information} - \text{EMV without Information}$$

---

## 🔗 Navigation

- **Previous Session**: [[courses/mk5-decision-making-negotiation/week-05/index|Week 05: Decision Analysis: SMART]]
- **Next Topic**: [[courses/mk5-decision-making-negotiation/week-07/index|Week 07: Scenario Planning & Systems Thinking (Part 1)]]
- Return to [[courses/mk5-decision-making-negotiation/index|MK 5 Course Overview]]
