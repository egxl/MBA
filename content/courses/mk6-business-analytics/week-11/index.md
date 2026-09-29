---
title: "Week 11: Practical: Big Data Technologies & Cloud Pipelines"
course: "Applied Business Analytics"
course_code: "MK6"
week: 11
module: "Data & Responsibility"
type: "weekly-lecture"
tags:
  - MK6
  - big-data-tech
  - cloud-computing
  - etl-pipelines
  - spark
---

# Week 11: Practical: Big Data Technologies & Cloud Pipelines

## 🎯 Executive Summary

Executive decision-makers do not need to write low-level distributed computing code, but they must master the architectural components of modern cloud data stacks to evaluate technology vendor proposals, estimate infrastructure budgets, and structure data engineering teams.

---

## 1. The Modern Cloud Data Stack (MDS)

```
  Data Sources         Ingestion & Sync         Storage & Compute       Transformation       Consumption
  ┌──────────┐        ┌────────────────┐       ┌─────────────────┐     ┌──────────────┐     ┌───────────┐
  │PostgreSQL│        │ Fivetran /     │       │ Snowflake /     │     │ dbt          │     │ Tableau / │
  │Salesforce│ ─────► │ Airbyte /      │ ────► │ BigQuery /      │ ──► │ (Data Build  │ ──► │ PowerBI / │
  │Kafka     │        │ Spark Streaming│       │ Databricks      │     │  Tool)       │     │ Looker    │
  └──────────┘        └────────────────┘       └─────────────────┘     └──────────────┘     └───────────┘
```

### Key Technological Paradigms

- **ETL (Extract, Transform, Load) vs. ELT (Extract, Load, Transform)**:
  - _Legacy ETL_: Data transformed in pipeline memory before loading into expensive on-premise storage.
  - _Modern ELT_: Raw data loaded directly into cheap cloud storage, transformed inside the cloud warehouse using SQL and dbt.
- **Distributed Computing (Apache Spark & MapReduce)**: Partitioning petabyte datasets across compute clusters for parallel in-memory processing.
- **Data Orchestration (Apache Airflow)**: Managing complex Directed Acyclic Graphs (DAGs) of dependent data tasks.

---

## 2. Cloud Economics & Vendor Evaluation

- Separating compute from storage: Auto-scaling compute clusters up during peak analytics queries and spinning down to zero to eliminate idle overhead.
- Multi-cloud strategy vs. single-ecosystem lock-in (AWS vs. Azure vs. Google Cloud).

---

## 🔗 Navigation

- **Previous Session**: [[courses/mk6-business-analytics/week-10/index|Week 10: AI Ethics & Algorithmic Bias]]
- **Next Topic**: [[courses/mk6-business-analytics/week-12/index|Week 12: Data Privacy, Cybersecurity & Compliance]]
- Return to [[courses/mk6-business-analytics/index|MK 6 Course Overview]]
