---
title: "Week 04: Project Management (CPM / PERT & Critical Chain)"
course: "Operations and Supply Chain Management"
course_code: "MK4"
week: 4
module: "Strategy and Product Design"
type: "weekly-lecture"
tags:
  - MK4
  - project-management
  - cpm
  - pert
  - critical-chain
---

# Week 04: Project Management (CPM / PERT & Critical Chain)

## 🎯 Executive Summary

Complex, non-routine enterprise initiatives (capital expansions, digital ERP implementations, Action Learning Projects) require specialized project management architectures. Leaders use network path analysis to identify bottlenecks, control project duration, and optimize resource allocation.

---

## 1. Network Scheduling & Critical Path Method (CPM)

### Network Logic & Critical Path Identification

- **Critical Path**: The longest sequence of dependent activities through the project network. It defines the minimum possible completion time.
- **Float (Slack)**: The amount of time an activity can be delayed without delaying the overall project completion date:
  $$\text{Slack} = \text{Late Start (LS)} - \text{Early Start (ES)} = \text{Late Finish (LF)} - \text{Early Finish (EF)}$$
- Activities on the critical path have **zero slack** ($\text{Slack} = 0$). Any delay on a critical activity directly pushes back project delivery.

### Program Evaluation and Review Technique (PERT)

Under conditions of activity duration uncertainty, PERT models duration as a Beta distribution using three estimates:
$$\text{Expected Duration } (\mu) = \frac{a + 4m + b}{6}$$
$$\text{Variance } (\sigma^2) = \left(\frac{b - a}{6}\right)^2$$
Where $a$ = Optimistic time, $m$ = Most likely time, $b$ = Pessimistic time.

---

## 2. Project Crashing & Critical Chain (Goldratt)

- **Project Crashing**: Compressing project schedule by adding resources to critical path activities with the lowest crash cost per unit time.
- **Critical Chain Project Management (CCPM)**: Shifting safety buffers from individual task levels to the project level (Project Buffer, Feeding Buffers) to overcome Student Syndrome and Parkinson's Law.

---

## 🔗 Navigation

- **Previous Session**: [[courses/mk4-operations-supply-chain-management/week-03/index|Week 03: Product & Service Design]]
- **Next Topic**: [[courses/mk4-operations-supply-chain-management/week-05/index|Week 05: Strategic Capacity Planning]]
- Return to [[courses/mk4-operations-supply-chain-management/index|MK 4 Course Overview]]
