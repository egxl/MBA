---
title: "Week 06: Time Value of Money (Part 1: Compounding & Annuities)"
course: "Financial Management and Strategy"
course_code: "MK2"
week: 6
module: "Time Value of Money"
type: "weekly-lecture"
tags:
  - MK2
  - tvm
  - present-value
  - annuities
  - perpetuities
---

# Week 06: Time Value of Money (Part 1: Compounding & Annuities)

## 🎯 Executive Summary

A dollar today is worth more than a dollar tomorrow due to its earning potential (opportunity cost of capital), inflation, and risk. The **Time Value of Money (TVM)** is the foundational mathematical bedrock for corporate valuation, debt pricing, lease evaluation, and capital budgeting decisions.

---

## 1. Core Mathematical Mechanics

### Future Value (FV) & Present Value (PV) of a Single Sum

$$\text{FV}_n = \text{PV} \times (1 + r)^n$$
$$\text{PV} = \frac{\text{FV}_n}{(1 + r)^n}$$

### Non-Annual Compounding & Effective Annual Rate (EAR)

When interest compounds $m$ times per year at nominal annual rate $r_{\text{nom}}$:
$$\text{EAR} = \left(1 + \frac{r_{\text{nom}}}{m}\right)^m - 1$$

### Ordinary Annuities vs. Annuities Due

- **Ordinary Annuity** (Cash flows occur at the _end_ of each period):
  $$\text{PV}_{\text{annuity}} = \text{PMT} \times \left[\frac{1 - (1 + r)^{-n}}{r}\right]$$
  $$\text{FV}_{\text{annuity}} = \text{PMT} \times \left[\frac{(1 + r)^n - 1}{r}\right]$$
- **Annuity Due** (Cash flows occur at the _beginning_ of each period, e.g. leases):
  $$\text{PV}_{\text{annuity due}} = \text{PV}_{\text{ordinary annuity}} \times (1 + r)$$

### Perpetuities

- **Constant Perpetuity**: Cash flows continue indefinitely at rate PMT:
  $$\text{PV} = \frac{\text{PMT}}{r}$$
- **Growing Perpetuity** (constant growth rate $g < r$):
  $$\text{PV} = \frac{\text{PMT}_1}{r - g}$$

---

## 2. Executive Takeaways

- Amortization schedules for corporate loans and syndicated credit facilities.
- Inflation adjustment: Nominal discount rates must discount nominal cash flows; real discount rates must discount real cash flows ($1 + r_{\text{nominal}} = (1 + r_{\text{real}})(1 + \pi)$).

---

## 🔗 Navigation

- **Previous Session**: [[courses/mk2-financial-management-strategy/week-05/index|Week 05: Activity-Based Costing]]
- **Next Topic**: [[courses/mk2-financial-management-strategy/week-07/index|Week 07: Time Value of Money (Part 2: Bond & Stock Valuation)]]
- Return to [[courses/mk2-financial-management-strategy/index|MK 2 Course Overview]]
