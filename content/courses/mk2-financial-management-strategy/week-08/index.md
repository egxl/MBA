---
title: "Week 08: Capital Budgeting (Part 1: Decision Criteria & Cash Flows)"
course: "Financial Management and Strategy"
course_code: "MK2"
week: 8
module: "Corporate Financial Decisions"
type: "weekly-lecture"
tags:
  - MK2
  - capital-budgeting
  - npv
  - irr
  - free-cash-flow
---

# Week 08: Capital Budgeting (Part 1: Decision Criteria & Cash Flows)

## 🎯 Executive Summary

Capital budgeting determines how the firm allocates long-term capital across competing real investment opportunities. The **Net Present Value (NPV)** rule is the gold standard for financial decision-making because it directly quantifies the net dollar addition to shareholder wealth.

---

## 1. Investment Decision Criteria

### Net Present Value (NPV)

$$\text{NPV} = \sum_{t=0}^n \frac{\text{CF}_t}{(1 + \text{WACC})^t} = \text{PV of Cash Inflows} - \text{Initial Outlay } (I_0)$$

- **Decision Rule**: Accept project if $\text{NPV} > 0$. If mutually exclusive, accept the highest positive NPV.

### Internal Rate of Return (IRR) & Pitfalls

The discount rate that drives NPV to exactly zero:
$$\sum_{t=0}^n \frac{\text{CF}_t}{(1 + \text{IRR})^t} = 0$$

- **Flaws of IRR**:
  - Unrealistic reinvestment rate assumption (assumes cash flows reinvested at IRR rather than WACC).
  - Multiple IRRs or no real IRR for non-conventional cash flows (sign changes).
  - Scale problem when comparing projects of different capital sizes.

### Profitability Index (PI)

$$\text{PI} = \frac{\text{PV of Future Cash Flows}}{I_0}$$

- Critical for capital rationing when capital budgets are constrained.

---

## 2. Project Cash Flow Mechanics (Unlevered Free Cash Flow)

Only **incremental after-tax cash flows** matter:
$$\text{Free Cash Flow (FCFF)} = \text{EBIT}(1 - T_c) + \text{Depreciation \& Amortization} - \text{CapEx} - \Delta \text{NWC}$$

- **Include**: Opportunity costs, externalities/cannibalization of existing lines, working capital commitments.
- **Exclude**: Sunk costs, financing charges (interest is accounted for in WACC discount rate to prevent double counting).

---

## 🔗 Navigation

- **Previous Session**: [[courses/mk2-financial-management-strategy/week-07/index|Week 07: Bond & Stock Valuation]]
- **Next Topic**: [[courses/mk2-financial-management-strategy/week-09/index|Week 09: Capital Budgeting (Part 2: Risk & Real Options)]]
- Return to [[courses/mk2-financial-management-strategy/index|MK 2 Course Overview]]
