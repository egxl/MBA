---
title: "Week 05: Decision Analysis: SMART (Simple Multi-Attribute Rating Technique)"
course: "Problem Solving, Decision Making and Negotiation"
course_code: "MK5"
week: 5
module: "Kepner-Tregoe"
type: "weekly-lecture"
tags:
  - MK5
  - multi-criteria
  - smart-technique
  - decision-analysis
  - utility-theory
---

# Week 05: Decision Analysis: SMART (Simple Multi-Attribute Rating Technique)

## 🎯 Executive Summary

Executive decisions typically involve multiple conflicting criteria (e.g., maximizing speed, minimizing cost, maximizing safety). The **Simple Multi-Attribute Rating Technique (SMART)** provides an intuitive, mathematically grounded multi-criteria decision analysis (MCDA) framework based on linear additive utility theory.

---

## 1. The SMART 8-Step Procedure

1. **Identify the Decision Maker & Objective**: Clarify who owns the choice and define the strategic context.
2. **Identify the Alternatives**: Establish the mutually exclusive set of options under consideration ($A_1, A_2, \dots, A_m$).
3. **Identify the Attributes (Criteria)**: Structure a value tree of relevant evaluation criteria ($C_1, C_2, \dots, C_n$). Ensure criteria are mutually independent and comprehensive.
4. **Assign Values (Scores) to Alternatives on Each Attribute**:
   - Rescale physical measurements (costs, days, defect rates) to an interval utility scale from 0 (worst plausible level) to 100 (best plausible level).
5. **Determine Attribute Weights (Swing Weighting)**:
   - Avoid subjective ranking without context. Use **Swing Weighting**: Evaluate how much the decision maker cares about moving (swinging) an attribute from its worst level to its best level compared to swings in other attributes.
6. **Normalize Attribute Weights**:
   $$w_j = \frac{W_j}{\sum_{k=1}^n W_k}, \quad \text{such that } \sum_{j=1}^n w_j = 1.0$$
7. **Calculate Aggregate Utility for Each Alternative**:
   $$U(A_i) = \sum_{j=1}^n w_j \cdot u_{ij}$$
   Where $u_{ij}$ is the scaled score of alternative $i$ on attribute $j$.
8. **Perform Sensitivity Analysis**: Stress-test results by varying attribute weights to see if the optimal alternative changes.

---

## 2. Advantages over Ad-Hoc Scoring Matrices

- Prevents double-counting correlated criteria.
- Grounded in Multi-Attribute Utility Theory (MAUT).
- Provides audit trails and institutional defensibility for public sector and BUMN boards.

---

## 🔗 Navigation

- **Previous Session**: [[courses/mk5-decision-making-negotiation/week-04/index|Week 04: Kepner-Tregoe (Part 2)]]
- **Next Topic**: [[courses/mk5-decision-making-negotiation/week-06/index|Week 06: Decision Analysis: AHP & Decision Trees]]
- Return to [[courses/mk5-decision-making-negotiation/index|MK 5 Course Overview]]
