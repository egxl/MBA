---
title: "WACC Calculation & Financial Modeling Notes"
course: "Financial Management and Strategy"
course_code: "MK2"
week: 1
type: "reading-summary"
tags:
  - MK2
  - financial-management
  - wacc
  - corporate-finance
  - financial-modeling
---

# WACC Calculation & Financial Modeling Notes

## 📐 Core Formulation

The Weighted Average Cost of Capital (WACC) represents the blended after-tax rate of return demanded by all capital providers (equity holders and debt holders):

$$\text{WACC} = \left(\frac{E}{V}\right) \cdot r_e + \left(\frac{D}{V}\right) \cdot r_d \cdot (1 - T_c)$$

Where:

- $E$ = Market value of equity ($\text{Shares Outstanding} \times \text{Current Share Price}$)
- $D$ = Market value of net debt
- $V = E + D$ = Total enterprise capital base
- $r_e$ = Cost of equity
- $r_d$ = Pre-tax cost of debt
- $T_c$ = Marginal corporate income tax rate

---

## 🔬 Component Deconstruction

### 1. Cost of Equity ($r_e$) via Capital Asset Pricing Model (CAPM)

$$r_e = r_f + \beta_e \cdot (\text{ERP})$$

- **Risk-Free Rate ($r_f$)**: Yield on the 10-Year Sovereign Treasury Bond.
- **Equity Risk Premium ($\text{ERP}$)**: Expected excess return of the broad equity market over the risk-free rate ($r_m - r_f$), historically 5.0% - 6.5%.
- **Levered Beta ($\beta_e$)**: Sensitivity of the security's returns relative to market portfolio volatility.

### 2. Hamada's Equation: Unlevering and Re-levering Beta

When benchmarking across comparable public peers:
$$\beta_u = \frac{\beta_l}{1 + (1 - T_c) \cdot \left(\frac{D}{E}\right)}$$
$$\beta_{l,\text{target}} = \beta_{u,\text{industry}} \cdot \left[1 + (1 - T_{c,\text{target}}) \cdot \left(\frac{D}{E}\right)_{\text{target}}\right]$$

### 3. Pre-Tax Cost of Debt ($r_d$)

- Never use historical coupon rate on existing balance sheet debt.
- Use the current **Yield to Maturity (YTM)** on long-term liquid corporate bonds, or calculate synthetic cost of debt based on the firm's Interest Coverage Ratio ($\frac{\text{EBIT}}{\text{Interest Expense}}$) and associated credit rating spread.

---

## 📊 Practical Numerical Example

Consider an enterprise with the following capital parameters:

- Stock price: \$45.00 | Shares: 20,000,000 $\rightarrow E = \$900\text{M}$
- Net debt book & market value: $D = \$300\text{M}$
- Total Capital: $V = \$1,200\text{M}$ ($\frac{E}{V} = 75\%$, $\frac{D}{V} = 25\%$)
- Risk-free rate ($r_f$): $4.2\%$
- Equity Risk Premium ($\text{ERP}$): $5.5\%$
- Levered Beta ($\beta_e$): $1.20$
- Pre-tax Cost of Debt ($r_d$): $6.5\%$
- Marginal Tax Rate ($T_c$): $25\%$

### Step-by-Step Calculation:

1. $r_e = 4.2\% + 1.20 \times 5.5\% = 4.2\% + 6.6\% = 10.8\%$
2. After-tax $r_d = 6.5\% \times (1 - 0.25) = 4.875\%$
3. $\text{WACC} = (0.75 \times 10.8\%) + (0.25 \times 4.875\%) = 8.10\% + 1.22\% = 9.32\%$

---

## ⚠️ Common Financial Modeling Pitfalls

1. **Using Book Value of Equity**: Book equity reflects historical accounting bookkeeper conventions, not current investor opportunity costs. Always use market capitalization.
2. **Double-Counting Inflation**: Ensure cash flow forecasts and WACC are either both nominal or both real.
3. **Mismatched Tax Shield Timing**: When forecasting volatile debt paydown schedules, use Adjusted Present Value (APV) rather than static WACC.

---

## 🔗 Related Notes

- [[courses/mk2-financial-management-strategy/week-01/index|Week 01 Lecture Notes]]
- [[courses/mk2-financial-management-strategy/index|MK 2 Course Syllabus]]
