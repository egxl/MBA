---
title: "Week 07: Time Value of Money (Part 2: Bond & Stock Valuation)"
course: "Financial Management and Strategy"
course_code: "MK2"
week: 7
module: "Time Value of Money"
type: "weekly-lecture"
tags:
  - MK2
  - bond-valuation
  - stock-valuation
  - ddm
  - ytm
---

# Week 07: Time Value of Money (Part 2: Bond & Stock Valuation)

## 🎯 Executive Summary

The intrinsic value of any financial asset is the present value of its expected future cash flows, discounted at a risk-adjusted rate. Applying TVM concepts to corporate bonds and common equities illuminates how interest rate movements and earnings expectations drive market valuations.

---

## 1. Bond Valuation & Yield Dynamics

### The Bond Pricing Formula

For a bond with coupon payment $C$, face value $F$, maturity $n$, and yield to maturity $y$:

$$P_0 = \sum_{t=1}^n \frac{C}{(1 + y)^t} + \frac{F}{(1 + y)^n} = C \left[\frac{1 - (1 + y)^{-n}}{y}\right] + \frac{F}{(1 + y)^n}$$

- If Coupon Rate = Yield ($y$), Bond sells at **Par** ($P_0 = F$).
- If Coupon Rate < Yield ($y$), Bond sells at a **Discount** ($P_0 < F$).
- If Coupon Rate > Yield ($y$), Bond sells at a **Premium** ($P_0 > F$).

### Interest Rate Risk & Duration (Macaulay Duration)

- Longer maturity and lower coupon rates increase a bond's price sensitivity to interest rate fluctuations.
- **Modified Duration**: Approximates the percentage price change for a 100 bps shift in yield:
  $$\% \Delta P \approx - \text{ModD} \times \Delta y$$

---

## 2. Equity Valuation Models

### Dividend Discount Model (DDM) & Gordon Growth

For a stock paying continuous dividends growing at constant rate $g$:
$$P_0 = \frac{D_1}{r_e - g} = \frac{D_0 (1 + g)}{r_e - g}$$
Where $r_e$ = Cost of equity (derived via CAPM), and $g = \text{ROE} \times b$.

### Multi-Stage (Supernormal Growth) DDM

When an enterprise experiences rapid initial growth ($g_{\text{high}}$) followed by mature stable growth ($g_{\text{stable}}$):
$$P_0 = \sum_{t=1}^T \frac{D_t}{(1 + r_e)^t} + \frac{P_T}{(1 + r_e)^T}, \quad \text{where } P_T = \frac{D_{T+1}}{r_e - g_{\text{stable}}}$$

---

## 🔗 Navigation

- **Previous Session**: [[courses/mk2-financial-management-strategy/week-06/index|Week 06: Time Value of Money (Part 1)]]
- **Next Topic**: [[courses/mk2-financial-management-strategy/week-08/index|Week 08: Capital Budgeting (Part 1)]]
- Return to [[courses/mk2-financial-management-strategy/index|MK 2 Course Overview]]
