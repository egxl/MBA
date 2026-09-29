---
title: "Week 13: Inventory Management & Stochastic Safety Stock"
course: "Operations and Supply Chain Management"
course_code: "MK4"
week: 13
module: "Demand Fulfillment"
type: "weekly-lecture"
tags:
  - MK4
  - inventory-management
  - eoq
  - safety-stock
  - reorder-point
---

# Week 13: Inventory Management & Stochastic Safety Stock

## 🎯 Executive Summary

Inventory is simultaneously an operating asset that buffers against uncertainty and a major cash liability that ties up working capital. Disciplined inventory models balance ordering/setup costs against holding costs and calibrate safety stocks to achieve target service levels.

---

## 1. Classical Deterministic Model: Economic Order Quantity (EOQ)

Balancing annual ordering costs ($S$) and annual holding costs ($H$):

$$\text{Total Annual Cost (TC)} = \left(\frac{D}{Q} \times S\right) + \left(\frac{Q}{2} \times H\right)$$

Taking first derivative with respect to $Q$ yields the optimal lot size:
$$\text{EOQ } (Q^*) = \sqrt{\frac{2DS}{H}}$$
Where $D$ = Annual demand, $S$ = Cost per order, $H$ = Annual holding cost per unit ($H = i \times C$).

---

## 2. Stochastic Continuous Review Model $(Q, R)$

Under uncertain daily demand ($\sigma_d$) and constant replenishment lead time ($L$):

### The Reorder Point (ROP)

$$\text{ROP} = \bar{d} \cdot L + \text{Safety Stock (SS)}$$
$$\text{Safety Stock} = z \cdot \sigma_L = z \sqrt{L} \cdot \sigma_d$$

Where:

- $\bar{d} \cdot L$ = Expected demand during lead time
- $z$ = Standard normal score corresponding to target cycle service level (e.g., $z = 1.65$ for 95%, $z = 2.33$ for 99%)
- $\sigma_L = \sqrt{L} \cdot \sigma_d$ = Standard deviation of demand during lead time

### Stochastic Lead Time & Demand

When both lead time ($L, \sigma_L$) and demand ($d, \sigma_d$) are random variables:
$$\sigma_{dL} = \sqrt{\bar{L} \sigma_d^2 + \bar{d}^2 \sigma_L^2}$$
$$\text{Safety Stock} = z \cdot \sigma_{dL}$$

---

## 3. Inventory Categorization: ABC Classification (Pareto Principle)

- **Class A**: Top 15–20% of SKUs accounting for 70–80% of total annual dollar inventory value. _Demands continuous daily monitoring, tightest controls, and supplier partnerships._
- **Class B**: Next 30% of SKUs accounting for 15–25% of dollar value. _Periodic review._
- **Class C**: Bottom 50% of SKUs accounting for under 5% of value. _Automated two-bin systems, bulk ordering._

---

## 🔗 Navigation

- **Previous Session**: [[courses/mk4-operations-supply-chain-management/week-12/index|Week 12: Sales & Operations Planning]]
- **Next Topic**: [[courses/mk4-operations-supply-chain-management/week-14/index|Week 14: Material Requirements Planning & ERP]]
- Return to [[courses/mk4-operations-supply-chain-management/index|MK 4 Course Overview]]
