---
title: "Week 09: Lean Six Sigma & DMAIC Methodology"
course: "Operations and Supply Chain Management"
course_code: "MK4"
week: 9
module: "Quality Assurance"
type: "weekly-lecture"
tags:
  - MK4
  - six-sigma
  - dmaic
  - quality-management
  - process-improvement
---

# Week 09: Lean Six Sigma & DMAIC Methodology

## 🎯 Executive Summary

While Lean focuses on process velocity and waste elimination, **Six Sigma** focuses on process stability and variation reduction. Merged together as **Lean Six Sigma (LSS)**, they provide the quantitative problem-solving architecture to achieve near-perfection in manufacturing and service operations.

---

## 1. Six Sigma Fundamentals & Metrics

### The 3.4 DPMO Benchmark

- In a true Six Sigma process, the distance between the process mean ($\mu$) and the nearest specification limit is at least $6\sigma$.
- Accounting for a standard $1.5\sigma$ long-term mean drift, a Six Sigma process produces no more than **3.4 Defects Per Million Opportunities (DPMO)** (99.99966% defect-free yield).

### The DMAIC Problem-Solving Roadmap

```
  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
  │  1. DEFINE   │───► │  2. MEASURE  │───► │  3. ANALYZE  │
  └──────────────┘     └──────────────┘     └──────────────┘
                                                   │
  ┌──────────────┐     ┌──────────────┐     ┌──────▼───────┐
  │  5. CONTROL  │◄─── │  4. IMPROVE  │◄─── │ Root Causes  │
  └──────────────┘     └──────────────┘     └──────────────┘
```

1. **Define**: Establish project charter, scope, business case, and Customer Critical-to-Quality (CTQ) metrics.
2. **Measure**: Map the detailed process, validate measurement system accuracy (Gage R&R), and calculate baseline process capability ($C_p, C_{pk}$).
3. **Analyze**: Identify the critical root causes ($X$'s) of variation and defects using Ishikawa (Fishbone) diagrams, 5 Whys, and hypothesis testing (ANOVA, Chi-square).
4. **Improve**: Brainstorm, model, test, and implement optimal solutions using Design of Experiments (DOE).
5. **Control**: Institutionalize gains using Statistical Process Control (SPC) charts, standard operating procedures, and mistake-proofing (Poka-Yoke).

---

## 2. Process Capability Indices

- **Potential Capability ($C_p$)**: $C_p = \frac{\text{USL} - \text{LSL}}{6\sigma}$ (spread only).
- **Actual Capability ($C_{pk}$)**: $C_{pk} = \min\left[\frac{\text{USL} - \mu}{3\sigma}, \frac{\mu - \text{LSL}}{3\sigma}\right]$ (accounts for centering).
- $C_{pk} \ge 1.33$ is standard minimum industrial requirement; $C_{pk} \ge 2.0$ represents World-Class Six Sigma.

---

## 🔗 Navigation

- **Previous Session**: [[courses/mk4-operations-supply-chain-management/week-08/index|Week 08: Lean Operations & Muda]]
- **Next Topic**: [[courses/mk4-operations-supply-chain-management/week-10/index|Week 10: Statistical Quality Control (SQC)]]
- Return to [[courses/mk4-operations-supply-chain-management/index|MK 4 Course Overview]]
