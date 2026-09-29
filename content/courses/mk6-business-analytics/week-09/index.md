---
title: "Week 09: Big Data in Business (Data Architecture & Lakes)"
course: "Applied Business Analytics"
course_code: "MK6"
week: 9
module: "Data & Responsibility"
type: "weekly-lecture"
tags:
  - MK6
  - big-data
  - data-warehouse
  - data-lake
  - data-architecture
---

# Week 09: Big Data in Business (Data Architecture & Lakes)

## 🎯 Executive Summary

Managing big data at enterprise scale requires modernizing beyond legacy relational database management systems (RDBMS). Week 9 explores enterprise data architectures—from normalized relational warehouses to unstructured data lakes and hybrid lakehouses.

---

## 1. The Architecture of Modern Data Systems

```
  Operational Systems                  Ingestion & Storage                 Analytics & Serving
  ┌──────────────────┐               ┌───────────────────────┐            ┌──────────────────┐
  │  ERP & CRM (OLTP)│               │      DATA LAKE        │            │  BI Dashboards   │
  ├──────────────────┤ ── Streaming/ ├───────────────────────┤ ── SQL ──► ├──────────────────┤
  │  Web Clickstreams│    Batch ETL  │   DATA WAREHOUSE      │    Query   │  Machine Learning│
  ├──────────────────┤ ────────────► │   (OLAP - Star Schema)│            ├──────────────────┤
  │  IoT Telemetry   │               └───────────────────────┘            │  Ad-Hoc Analysis │
  └──────────────────┘                                                    └──────────────────┘
```

### Data Warehouse vs. Data Lake vs. Lakehouse

- **Data Warehouse (OLAP)**: Highly structured, cleaned, and curated historical data organized into dimensional models (Star Schema, Snowflake Schema). Optimized for fast SQL aggregation and executive reporting.
- **Data Lake**: Centralized repository storing vast amounts of raw data in its native format (structured, semi-structured JSON/XML, unstructured audio/text). Cheap object storage (e.g., AWS S3, Azure Blob, Google Cloud Storage).
- **Data Lakehouse**: Emerging modern architecture unifying the low-cost flexibility of data lakes with the ACID transaction reliability and schema governance of warehouses (e.g., Databricks, Snowflake).

---

## 2. Executive Governance of Data Pipelines

- Balancing **Schema-on-Write** (tight validation upon entry) with **Schema-on-Read** (flexibility for data scientists).
- Eliminating data silos across enterprise subsidiaries and BUMN holding structures.

---

## 🔗 Navigation

- **Previous Session**: [[courses/mk6-business-analytics/week-08/index|Week 08: Risk Analytics]]
- **Next Topic**: [[courses/mk6-business-analytics/week-10/index|Week 10: Ethical Considerations in Analytics]]
- Return to [[courses/mk6-business-analytics/index|MK 6 Course Overview]]
