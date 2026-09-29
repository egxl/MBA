---
title: "Week 04: Customer Analytics (Segmentation, LTV, Churn Prediction)"
course: "Applied Business Analytics"
course_code: "MK6"
week: 4
module: "Applied Analytics"
type: "weekly-lecture"
tags:
  - MK6
  - customer-analytics
  - churn-prediction
  - rfm
  - clustering
---

# Week 04: Customer Analytics (Segmentation, LTV, Churn Prediction)

## 🎯 Executive Summary

Customer Analytics applies mathematical algorithms to customer transactional and behavioral data to optimize acquisition, maximize lifetime customer equity, and preempt customer attrition (churn).

---

## 1. Core Methodologies & Algorithms

### 1. RFM Scoring Architecture

Scoring customers from 1 (lowest) to 5 (highest) across three empirical dimensions:

- **Recency ($R$)**: Days since last commercial transaction.
- **Frequency ($F$)**: Total number of transactions in the observation window.
- **Monetary ($M$)**: Total cumulative dollar expenditure.
- Creating targeted micro-segments (e.g., _Champions [555]_, _Loyal Customers [454]_, _At Risk [155]_, _Hibernating [112]_).

### 2. Unsupervised Clustering ($k$-Means & Hierarchical)

- Partitioning high-dimensional customer feature spaces into $k$ distinct clusters by minimizing within-cluster sum of squares (inertia).
- Determining optimal $k$ using the **Elbow Method** and **Silhouette Coefficient Analysis**.

### 3. Predictive Churn Modeling

- Training supervised classification models (Logistic Regression, Random Forests) on customer usage telemetry to compute individual **Churn Probability Scores** ($P_{\text{churn}}$).
- Formulating dynamic retention campaigns: Identifying high-value accounts whose $P_{\text{churn}} > 0.65$ and triggering personalized interventions before customer defection.

---

## 2. Customer Equity Management

- Balancing Customer Acquisition Cost (CAC) against Customer Lifetime Value (CLV).
- Next-Best-Action (NBA) recommendation engines using collaborative filtering.

---

## 🔗 Navigation

- **Previous Session**: [[courses/mk6-business-analytics/week-03/index|Week 03: Predictive Analytics]]
- **Next Topic**: [[courses/mk6-business-analytics/week-05/index|Week 05: Marketing Analytics]]
- Return to [[courses/mk6-business-analytics/index|MK 6 Course Overview]]
