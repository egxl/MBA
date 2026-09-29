---
title: "Week 06: Process Design, Analysis & Little's Law"
course: "Operations and Supply Chain Management"
course_code: "MK4"
week: 6
module: "Capacity and Process"
type: "weekly-lecture"
tags:
  - MK4
  - process-analysis
  - littles-law
  - bottleneck
  - theory-of-constraints
---

# Week 06: Process Design, Analysis & Little's Law

## 🎯 Executive Summary

Every enterprise is a collection of interconnected processes. Process analysis provides the quantitative toolkit to map operational workflows, measure cycle times, identify system bottlenecks, and dramatically compress lead times using fundamental operational laws.

---

## 1. Core Metrics & Little's Law

### Fundamental Operational Metrics

- **Cycle Time (CT)**: The average time between completions of successive units at a workstation.
- **Throughput Rate ($R$)**: The number of units processed per unit of time ($\text{Throughput} = 1 / \text{Cycle Time}$).
- **Flow Time ($T$)**: The total time a unit spends within the process from entry to exit (including processing and buffer queue times).
- **Work-In-Process ($I$)**: The total number of inventory units contained within the process boundaries.

### Little's Law (The Fundamental Law of Operations)

Under steady-state conditions:
$$I = R \times T$$
$$\text{Inventory (WIP)} = \text{Throughput Rate} \times \text{Flow Time}$$

- **Strategic Implication**: To reduce customer waiting time ($T$) at a given throughput rate ($R$), management _must_ ruthlessly eliminate Work-In-Process ($I$). Excess inventory creates bloated lead times.

---

## 2. Bottleneck Analysis & Goldratt's Theory of Constraints (TOC)

### Identifying the Bottleneck

- The bottleneck is the operation with the **longest cycle time** (lowest processing rate) in the entire system.
- **The System Rule**: The throughput of the entire system is strictly dictated by the capacity of the bottleneck workstation. An hour saved at a non-bottleneck is a mirage.

### The 5 Focusing Steps of TOC

1. **Identify** the system's constraint.
2. **Exploit** the constraint (ensure the bottleneck never sits idle).
3. **Subordinate** everything else to the constraint (pace upstream input strictly to bottleneck speed).
4. **Elevate** the constraint (invest CapEx to expand bottleneck capacity).
5. **Repeat** (do not let inertia become the constraint).

---

## 🔗 Navigation

- **Previous Session**: [[courses/mk4-operations-supply-chain-management/week-05/index|Week 05: Strategic Capacity Planning]]
- **Next Topic**: [[courses/mk4-operations-supply-chain-management/week-07/index|Week 07: Waiting Line Analysis, Simulation & OSCM Game]]
- Return to [[courses/mk4-operations-supply-chain-management/index|MK 4 Course Overview]]
