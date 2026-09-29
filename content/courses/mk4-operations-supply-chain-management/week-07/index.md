---
title: "Week 07: Waiting Line Analysis, Simulation & OSCM Game"
course: "Operations and Supply Chain Management"
course_code: "MK4"
week: 7
module: "Capacity and Process"
type: "weekly-lecture"
tags:
  - MK4
  - queuing-theory
  - simulation
  - oscm-game
  - gamification
---

# Week 07: Waiting Line Analysis, Simulation & OSCM Game

## 🎯 Executive Summary

Waiting lines (queues) occur not necessarily because a system lacks capacity on average, but because arrivals and service times are inherently stochastic. Week 7 combines mathematical **Queuing Theory**, discrete-event simulation, and the **OSCM Gamification Simulation** (2 sessions).

---

## 1. Queuing Theory Mathematics (M/M/1 System)

In a single-server queuing system with Poisson arrivals at rate $\lambda$ and exponential service times at rate $\mu$ (where $\lambda < \mu$):

### System Metrics

- **Server Utilization**: $\rho = \frac{\lambda}{\mu}$
- **Average Number in Queue ($L_q$)**: $L_q = \frac{\lambda^2}{\mu(\mu - \lambda)}$
- **Average Number in System ($L$)**: $L = \frac{\lambda}{\mu - \lambda} = L_q + \rho$
- **Average Time in Queue ($W_q$)**: $W_q = \frac{L_q}{\lambda} = \frac{\lambda}{\mu(\mu - \lambda)}$
- **Average Total Time in System ($W$)**: $W = \frac{L}{\lambda} = \frac{1}{\mu - \lambda}$

### The Non-Linear Waiting Trap

As server utilization approaches 100% ($\rho \to 1.0$), queue length and waiting time explode toward infinity in an exponential hockey-stick curve:

- At $\rho = 80\%$, average queue is 3.2 units.
- At $\rho = 95\%$, average queue surges to 18.0 units!
- **Key Takeaway**: High asset utilization in stochastic environments directly destroys service velocity.

---

## 2. The OSCM Gamification Simulation (2 Sessions)

An intensive multi-echelon business simulation:

- Cohort teams manage an integrated supply network subject to demand shocks and lead-time variability.
- Balancing stockout penalties against inventory holding costs and expedited freight premiums.
- Discovering and overcoming the **Bullwhip Effect** in real-time competitive gameplay.

---

## 🔗 Navigation

- **Previous Session**: [[courses/mk4-operations-supply-chain-management/week-06/index|Week 06: Process Design & Little's Law]]
- **Next Topic**: [[courses/mk4-operations-supply-chain-management/week-08/index|Week 08: Lean Operations & Waste Elimination]]
- Return to [[courses/mk4-operations-supply-chain-management/index|MK 4 Course Overview]]
