---
title: "Week 06: Financial Analytics (Credit Scoring & Fraud Detection)"
course: "Applied Business Analytics"
course_code: "MK6"
week: 6
module: "Applied Analytics"
type: "weekly-lecture"
tags:
  - MK6
  - financial-analytics
  - credit-scoring
  - fraud-detection
  - altman-z
---

# Week 06: Financial Analytics (Credit Scoring & Fraud Detection)

## 🎯 Executive Summary

Financial Analytics applies statistical learning and pattern recognition to financial records to predict institutional bankruptcy, score retail credit risk, and detect fraudulent transactional anomalies in real time.

---

## 1. Credit Scoring & Bankruptcy Prediction

### Altman Z-Score Model (Corporate Default Prediction)

A multivariate discriminant analysis model predicting corporate failure within 24 months:

$$Z = 1.2 X_1 + 1.4 X_2 + 3.3 X_3 + 0.6 X_4 + 0.999 X_5$$
Where:

- $X_1$ = $\text{Working Capital} / \text{Total Assets}$ (Liquidity)
- $X_2$ = $\text{Retained Earnings} / \text{Total Assets}$ (Cumulative profitability)
- $X_3$ = $\text{EBIT} / \text{Total Assets}$ (Operating asset productivity)
- $X_4$ = $\text{Market Value of Equity} / \text{Total Liabilities}$ (Financial leverage)
- $X_5$ = $\text{Sales} / \text{Total Assets}$ (Asset turnover)
- **Zones of Discrimination**: $Z > 2.99$ (Safe Zone), $1.81 < Z < 2.99$ (Grey Zone), $Z < 1.81$ (Distress Zone / High Default Risk).

### Modern Retail Credit Scorecards

- Logistic regression and gradient boosted models predicting **Probability of Default (PD)**.
- Weight of Evidence (WoE) and Information Value (IV) for credit feature selection.

---

## 2. Real-Time Fraud Detection & Anomaly Recognition

- The **Imbalanced Data Challenge**: Fraud represents $< 0.1\%$ of transactions; naive models predicting "no fraud" achieve 99.9% accuracy but fail completely.
- Techniques: Synthetic Minority Over-sampling Technique (SMOTE), Isolation Forests, and Autoencoder Neural Networks.

---

## 🔗 Navigation

- **Previous Session**: [[courses/mk6-business-analytics/week-05/index|Week 05: Marketing Analytics]]
- **Next Topic**: [[courses/mk6-business-analytics/week-07/index|Week 07: Supply Chain Analytics]]
- Return to [[courses/mk6-business-analytics/index|MK 6 Course Overview]]
