---
title: "Week 10: Ethical Considerations in Business Analytics & Algorithmic Bias"
course: "Applied Business Analytics"
course_code: "MK6"
week: 10
module: "Data & Responsibility"
type: "weekly-lecture"
tags:
  - MK6
  - algorithmic-bias
  - ai-ethics
  - responsible-ai
  - fairness
---

# Week 10: Ethical Considerations in Business Analytics & Algorithmic Bias

## 🎯 Executive Summary

Data is not objective truth; it reflects the historical, social, and cultural biases embedded in its collection. As predictive and automated machine learning algorithms increasingly govern credit decisions, hiring filters, and justice systems, executives must establish rigorous ethical AI governance.

---

## 1. Sources of Algorithmic Bias

### How Models Inherit Injustice

1. **Historical Bias**: Models trained on historical data perpetuate past systemic discrimination (e.g., resume screening models penalizing women for technical roles because historical hires were predominantly male).
2. **Representation Bias**: Training datasets where minority demographic groups or rural populations are severely underrepresented, leading to degraded model accuracy for those groups.
3. **Measurement Bias**: Proxy variables that unintentionally correlate with protected classes (e.g., using ZIP codes or neighborhood identifiers in credit underwriting, effectively replicating racial redlining).

### Mathematical Definitions of Algorithmic Fairness

- **Demographic Parity**: Equal proportion of positive outcomes across demographic groups: $P(\hat{Y}=1 | A=0) = P(\hat{Y}=1 | A=1)$.
- **Equal Opportunity**: Equal True Positive Rates across groups (equal chance of being approved among qualified candidates).
- **The Fairness Impossibility Theorem**: Mathematical proof demonstrating that multiple intuitive fairness definitions are mutually exclusive when base rates differ.

---

## 2. Responsible AI Governance Framework

- **Explainability & Transparency (XAI)**: Black-box models (deep neural networks) vs. interpretable models (SHAP values, LIME).
- Human-in-the-loop oversight for consequential credit, hiring, and legal decisions.

---

## 🔗 Navigation

- **Previous Session**: [[courses/mk6-business-analytics/week-09/index|Week 09: Big Data Architecture]]
- **Next Topic**: [[courses/mk6-business-analytics/week-11/index|Week 11: Big Data Technologies]]
- Return to [[courses/mk6-business-analytics/index|MK 6 Course Overview]]
