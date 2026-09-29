---
title: "Week 14: Material Requirements Planning (MRP) & Enterprise ERP"
course: "Operations and Supply Chain Management"
course_code: "MK4"
week: 14
module: "Demand Fulfillment"
type: "weekly-lecture"
tags:
  - MK4
  - mrp
  - erp
  - bom
  - enterprise-systems
---

# Week 14: Material Requirements Planning (MRP) & Enterprise ERP

## 🎯 Executive Summary

Managing dependent demand for complex manufactured assemblies requires computerized coordination. **Material Requirements Planning (MRP)** explodes master production schedules into component purchase orders, while **Enterprise Resource Planning (ERP)** unifies these workflows across procurement, finance, HR, and customer fulfillment.

---

## 1. Material Requirements Planning (MRP) Architecture

### Dependent vs. Independent Demand

- **Independent Demand**: Demand for final finished goods influenced by external market forces (requires forecasting).
- **Dependent Demand**: Demand for subassemblies, parts, and raw materials derived mathematically from the production schedule of the parent product (calculated via MRP).

### The 3 Core Inputs of MRP

1. **Master Production Schedule (MPS)**: Specifies what end items are to be produced, in what quantities, and when.
2. **Bill of Materials (BOM)**: Complete engineering product structure tree listing all subassemblies, parts, and raw materials needed to build one unit of end product, with exact per-unit quantities.
3. **Inventory Records File**: Current on-hand inventory, scheduled receipts (open purchase orders), lead times, and lot-sizing rules per part.

### MRP Computational Explosion

For each time bucket and part:
$$\text{Net Requirements} = \text{Gross Requirements} - \text{Projected On-Hand} - \text{Scheduled Receipts} + \text{Safety Stock}$$
$$\text{Planned Order Release} = \text{Planned Order Receipt (offset backward by replenishment lead time)}$$

---

## 2. Enterprise Resource Planning (ERP) Systems

- Evolution: MRP I (Materials) $\to$ MRP II (Manufacturing Resource Planning: capacity, machines, tooling) $\to$ **ERP** (Enterprise-wide database integrating accounting, supply chain, CRM, and human resources; e.g., SAP S/4HANA, Oracle Cloud).
- Governance and change management challenges in large-scale enterprise ERP rollouts.

---

## 🔗 Navigation

- **Previous Session**: [[courses/mk4-operations-supply-chain-management/week-13/index|Week 13: Inventory Management]]
- **Course Overview**: [[courses/mk4-operations-supply-chain-management/index|MK 4 Syllabus & Weekly Map]]
- Return to [[index|MBA Cohort Portal Home]]
