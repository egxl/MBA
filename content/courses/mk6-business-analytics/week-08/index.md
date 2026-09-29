---
title: "Week 08: Risk Analytics (VaR Modeling & Stress Testing)"
course: "Applied Business Analytics"
course_code: "MK6"
week: 8
module: "Applied Analytics"
type: "weekly-lecture"
tags:
  - MK6
  - risk-analytics
  - var
  - value-at-risk
  - stress-testing
---

# Week 08: Risk Analytics (VaR Modeling & Stress Testing)

## 🎯 Executive Summary

Risk Analytics provides mathematical methodologies to quantify the probability, magnitude, and financial impact of adverse enterprise events. Executives use **Value-at-Risk (VaR)** and macroeconomic **Stress Testing** to calibrate capital reserves and prevent catastrophic insolvencies.

---

## 1. Value-at-Risk (VaR) Methodologies

VaR answers the fundamental executive question: _"What is the maximum dollar loss we can expect over a time horizon $T$ at confidence level $(1 - \alpha)$ under normal market conditions?"_

### 1. Parametric (Variance-Covariance) VaR

Assumes portfolio returns are normally distributed:
$$\text{VaR}_{(1 - \alpha)} = Z_{\alpha} \times \sigma_p \times V_p \times \sqrt{T}$$
Where $Z_{\alpha}$ = Normal critical value ($Z = 1.65$ for 95%, $Z = 2.33$ for 99%), $\sigma_p$ = Portfolio volatility, $V_p$ = Portfolio value.

### 2. Historical Simulation VaR

- Re-prices existing asset portfolios against actual historical price movements over the past 500–1,000 trading days.
- **Advantage**: Completely non-parametric; naturally captures non-normal skewness and fat-tail kurtosis without assuming normal distributions.

### 3. Conditional VaR (Expected Shortfall / CVaR)

- Measures the expected loss _given_ that the loss has exceeded the VaR threshold. Addresses VaR's blind spot regarding tail risk severity.

---

## 2. Macroeconomic Stress Testing & Reverse Stress Testing

- **Forward Stress Testing**: Simulating the enterprise balance sheet under severe stagflation, currency depreciation (e.g., Rupiah weakening by 25%), and commodity crashes.
- **Reverse Stress Testing**: Identifying what specific combination of economic catastrophes would cause total institutional collapse, and working backward to build preventative firewalls.

---

## 🔗 Navigation

- **Previous Session**: [[courses/mk6-business-analytics/week-07/index|Week 07: Supply Chain Analytics]]
- **Next Topic**: [[courses/mk6-business-analytics/week-09/index|Week 09: Big Data in Business]]
- Return to [[courses/mk6-business-analytics/index|MK 6 Course Overview]]
