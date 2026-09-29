---
title: "Week 05: Marketing Analytics (Attribution & Marketing Mix Modeling)"
course: "Applied Business Analytics"
course_code: "MK6"
week: 5
module: "Applied Analytics"
type: "weekly-lecture"
tags:
  - MK6
  - marketing-analytics
  - mmm
  - attribution
  - roas
---

# Week 05: Marketing Analytics (Attribution & Marketing Mix Modeling)

## 🎯 Executive Summary

John Wanamaker famously quipped: _"Half the money I spend on advertising is wasted; the trouble is I don't know which half."_ Modern Marketing Analytics answers this dilemma using econometric **Marketing Mix Modeling (MMM)** and digital **Multi-Touch Attribution (MTA)** to optimize marketing budget allocation.

---

## 1. Marketing Mix Modeling (MMM) vs. Multi-Touch Attribution (MTA)

| Dimension               | Marketing Mix Modeling (MMM)                              | Multi-Touch Attribution (MTA)                                   |
| :---------------------- | :-------------------------------------------------------- | :-------------------------------------------------------------- |
| **Data Level**          | Macro, aggregated time-series (weekly/monthly by region). | User-level, granular digital clickstream touchpoints.           |
| **Channels Covered**    | Both online and offline (TV, Radio, Billboards, Digital). | Exclusively digital touchpoints (search, display, social).      |
| **Privacy Sensitivity** | Highly resilient (cookieless, no PII required).           | Extremely vulnerable to privacy regulations (iOS ATT, cookies). |
| **Core Objective**      | Long-term budget allocation across channels and seasons.  | Short-term bidding optimization and tactical targeting.         |

---

## 2. Econometric MMM Mechanics

A multivariate regression model incorporating non-linear advertising effects:
$$\text{Sales}_t = \beta_0 + \sum_{i=1}^m \beta_i \cdot \text{Adstock}(X_{it}) + \sum_{j=1}^k \gamma_j \cdot Z_{jt} + \epsilon_t$$

- **Adstock Transformation (Carryover Effect)**: Advertising impact does not vanish immediately; it decays geometrically over time with retention rate $\lambda$:
  $$\text{Adstock}_t = X_t + \lambda \cdot \text{Adstock}_{t-1}$$
- **Diminishing Returns (Hill Function / Log Transformation)**: Capturing the S-curve or concave saturation curve where incremental spend yields declining marginal conversions.

---

## 🔗 Navigation

- **Previous Session**: [[courses/mk6-business-analytics/week-04/index|Week 04: Customer Analytics]]
- **Next Topic**: [[courses/mk6-business-analytics/week-06/index|Week 06: Financial Analytics]]
- Return to [[courses/mk6-business-analytics/index|MK 6 Course Overview]]
