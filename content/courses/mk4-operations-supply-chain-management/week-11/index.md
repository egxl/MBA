---
title: "Week 11: Demand Forecasting & Time-Series Analytics"
course: "Operations and Supply Chain Management"
course_code: "MK4"
week: 11
module: "Demand Fulfillment"
type: "weekly-lecture"
tags:
  - MK4
  - forecasting
  - time-series
  - exponential-smoothing
  - mad-mape
---

# Week 11: Demand Forecasting & Time-Series Analytics

## 🎯 Executive Summary

Every operational decision—from procurement to workforce scheduling—relies on an explicit or implicit demand forecast. While all forecasts are inherently wrong, disciplined statistical forecasting minimizes error, measures variance, and provides the baseline for aggregate planning.

---

## 1. Quantitative Time-Series Methodologies

### 1. Moving Average & Weighted Moving Average

- **Simple Moving Average (SMA)**:
  $$\text{SMA}_t = \frac{\sum_{i=1}^n A_{t-i}}{n}$$
- **Weighted Moving Average (WMA)**: Assigns higher weights to recent observations ($\sum w_i = 1$).

### 2. Simple Exponential Smoothing (SES)

Weights all past data with exponentially declining importance using smoothing constant $\alpha \in [0, 1]$:
$$F_{t+1} = F_t + \alpha (A_t - F_t) = \alpha A_t + (1 - \alpha) F_t$$

- Higher $\alpha$ makes the forecast highly responsive to recent demand; lower $\alpha$ dampens noise.

### 3. Holt-Winters Exponential Smoothing (Trend & Seasonality)

- **Holt's Linear (Trend)**: Adjusts SES for linear slope using trend constant $\beta$.
- **Winter's Multiplicative (Seasonality)**: Computes seasonal indices to capture cyclical demand surges (e.g., Ramadhan/Lebaran consumer spikes in Indonesia).

---

## 2. Forecast Error Metrics & Tracking Signals

$$\text{Forecast Error } (e_t) = \text{Actual Demand } (A_t) - \text{Forecast } (F_t)$$

- **Mean Absolute Deviation (MAD)**: $\text{MAD} = \frac{\sum |e_t|}{n}$
- **Mean Squared Error (MSE)**: $\text{MSE} = \frac{\sum e_t^2}{n}$ (penalizes large outlier errors).
- **Mean Absolute Percentage Error (MAPE)**: $\text{MAPE} = \frac{1}{n} \sum \left|\frac{e_t}{A_t}\right| \times 100\%$
- **Tracking Signal (TS)**: $\text{TS} = \frac{\sum e_t}{\text{MAD}}$. Values beyond $\pm 4$ indicate systematic bias (chronic over/under-forecasting).

---

## 🔗 Navigation

- **Previous Session**: [[courses/mk4-operations-supply-chain-management/week-10/index|Week 10: Statistical Quality Control]]
- **Next Topic**: [[courses/mk4-operations-supply-chain-management/week-12/index|Week 12: Sales & Operations Planning (S&OP)]]
- Return to [[courses/mk4-operations-supply-chain-management/index|MK 4 Course Overview]]
