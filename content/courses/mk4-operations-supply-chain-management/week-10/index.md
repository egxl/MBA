---
title: "Week 10: Statistical Quality Control (SPC & Control Charts)"
course: "Operations and Supply Chain Management"
course_code: "MK4"
week: 10
module: "Quality Assurance"
type: "weekly-lecture"
tags:
  - MK4
  - spc
  - control-charts
  - quality-control
  - statistical-process-control
---

# Week 10: Statistical Quality Control (SPC & Control Charts)

## 🎯 Executive Summary

Statistical Quality Control (SQC) uses statistical sampling and monitoring to distinguish between natural background variation (common causes) and systemic disruptions (assignable causes). **Control charts** prevent managers from both under-reacting to true defects and over-reacting to random system noise (tampering).

---

## 1. Core Frameworks & Control Chart Mathematics

### Variation Typologies (Deming)

- **Common Cause (Random) Variation**: Inherent to the existing process design, machinery, and environment. A process subject only to common causes is in a state of **statistical control**.
- **Assignable (Special) Cause Variation**: Specific external shocks (operator error, broken tool, bad raw material batch). Demands immediate root-cause intervention.

### Variable Control Charts ($\bar{X}$ and $R$ Charts)

Used for continuous dimensional measurements (diameter, weight, temperature):

- **$\bar{X}$-Chart (Central Tendency)**:
  $$\text{UCL}_{\bar{X}} = \bar{\bar{X}} + A_2 \bar{R}, \quad \text{LCL}_{\bar{X}} = \bar{\bar{X}} - A_2 \bar{R}$$
- **$R$-Chart (Dispersion / Variability)**:
  $$\text{UCL}_R = D_4 \bar{R}, \quad \text{LCL}_R = D_3 \bar{R}$$

### Attribute Control Charts ($p$-Chart and $c$-Chart)

Used for discrete counts (pass/fail, defective/non-defective):

- **$p$-Chart (Fraction Defective)**:
  $$\text{Center Line} = \bar{p}, \quad \text{UCL} / \text{LCL} = \bar{p} \pm 3 \sqrt{\frac{\bar{p}(1 - \bar{p})}{n}}$$
- **$c$-Chart (Defects per Unit)**:
  $$\text{Center Line} = \bar{c}, \quad \text{UCL} / \text{LCL} = \bar{c} \pm 3 \sqrt{\bar{c}}$$

---

## 2. Out-of-Control Diagnostic Rules (Western Electric Rules)

A process is flagged as statistically out of control if:

1. One point falls outside the $3\sigma$ control limits.
2. Two out of three consecutive points fall beyond the $2\sigma$ warning limits on the same side.
3. Four out of five consecutive points fall beyond the $1\sigma$ band on the same side.
4. Eight or nine consecutive points fall on the same side of the center line (run).

---

## 🔗 Navigation

- **Previous Session**: [[courses/mk4-operations-supply-chain-management/week-09/index|Week 09: Lean Six Sigma]]
- **Next Topic**: [[courses/mk4-operations-supply-chain-management/week-11/index|Week 11: Demand Forecasting & Time-Series Analytics]]
- Return to [[courses/mk4-operations-supply-chain-management/index|MK 4 Course Overview]]
