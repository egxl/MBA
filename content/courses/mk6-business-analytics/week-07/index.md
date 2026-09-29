---
title: "Week 07: Supply Chain Analytics (Network Optimization & Demand Sensing)"
course: "Applied Business Analytics"
course_code: "MK6"
week: 7
module: "Applied Analytics"
type: "weekly-lecture"
tags:
  - MK6
  - supply-chain-analytics
  - network-optimization
  - linear-programming
  - demand-sensing
---

# Week 07: Supply Chain Analytics (Network Optimization & Demand Sensing)

## 🎯 Executive Summary

Supply Chain Analytics leverages mathematical programming, network algorithms, and real-time telemetry to optimize multi-tier logistics networks, slash transportation costs, and sense demand shifts ahead of traditional forecasting cycles.

---

## 1. Network Design & Linear Programming Optimization

### The Transportation / Transshipment Formulation

Minimizing total network shipping and facility costs subject to supply capacity and customer demand constraints:

$$\min \sum_{i=1}^m \sum_{j=1}^n c_{ij} X_{ij}$$
Subject to:
$$\sum_{j=1}^n X_{ij} \le S_i \quad \forall i \in \{1, \dots, m\} \quad \text{(Supply Constraints)}$$
$$\sum_{i=1}^m X_{ij} \ge D_j \quad \forall j \in \{1, \dots, n\} \quad \text{(Demand Constraints)}$$
$$X_{ij} \ge 0$$

- Solved using the **Simplex Algorithm** or Mixed-Integer Linear Programming (MILP) for discrete warehouse location choices.

---

## 2. Demand Sensing vs. Traditional Demand Planning

- **Traditional Planning**: Monthly time-series lag relying on historic sales invoices.
- **Demand Sensing**: Daily real-time algorithmic ingestion of downstream point-of-sale (POS) data, retailer inventory levels, weather anomalies, and digital search trends.
- Drastically reduces the Bullwhip Effect by transmitting true end-consumer demand signals upstream across the supply chain.

---

## 🔗 Navigation

- **Previous Session**: [[courses/mk6-business-analytics/week-06/index|Week 06: Financial Analytics]]
- **Next Topic**: [[courses/mk6-business-analytics/week-08/index|Week 08: Risk Analytics]]
- Return to [[courses/mk6-business-analytics/index|MK 6 Course Overview]]
