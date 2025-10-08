# Reference Open Source Comparison
_Date: 08 Oct 2025_

## 🎯 Purpose
This document compares open-source platforms relevant to the Tenant–Landlord Marketplace project.  
Each tool is evaluated by purpose, architecture, relevance, and integration fit with the NAS-hosted system.

---

## 🧩 Comparison Summary

| Platform | Type | Stack | Strengths | Weaknesses | Role in Marketplace |
|-----------|------|--------|------------|-------------|---------------------|
| **Cocorico** | Service Marketplace | PHP / Symfony / MySQL | Mature booking flow, good schema reference | Heavy, monolithic, not modular | **Reference only (data model, UX)** |
| **Condo** | Property Management | PHP / Laravel / MySQL | Billing + maintenance model reference | HOA-focused, LAMP-bound | **Reference only (maintenance workflow)** |
| **Kill Bill** | Billing & Invoicing Engine | Java / PostgreSQL | Scalable open-source billing engine | Complex setup | **Adopt in S2-T0 as billing layer** |
| **PostgreSQL** | Database | C | Enterprise-grade relational DB | Requires migration from SQLite | **Adopt in S2-T0** |
| **Redis** | Cache / Queue | C | Lightweight caching and job queue | Needs container setup | **Adopt in S1-T9/S2-T0** |
| **Node.js** | Runtime | JS / V8 | Fast, modular backend environment | None significant | **Active runtime** |

---

## 🔍 Evaluation Notes

### Cocorico
- **Keep**: Conceptual reference for listings, availability, and payment linking.
- **Drop**: PHP/Twig stack — not compatible with Node runtime.
- **Why**: Marketplace has replaced its domain cleanly through modular APIs.

### Condo
- **Keep**: Reference for property management workflows and maintenance cycles.
- **Drop**: Legacy LAMP architecture.
- **Why**: Marketplace already implements maintenance and billing modules more efficiently.

### Kill Bill
- **Keep**: To be deployed as billing microservice (Dockerized) in S2-T0.
- **Why**: Best-in-class for complex recurring billing; will extend invoices/receipts logic.

---

## 🧭 Integration Strategy
Only **Kill Bill**, **PostgreSQL**, and **Redis** will be deployed locally on the NAS via Docker.  
**Cocorico** and **Condo** remain **reference-only**, used for conceptual and schema mapping.

---

## ✅ Decision Summary

| Category | Tools Installed | Reference Only |
|-----------|-----------------|----------------|
| Marketplace Core | Node.js | — |
| Database | PostgreSQL | — |
| Billing Engine | Kill Bill | — |
| Cache | Redis | — |
| Marketplace Reference | — | Cocorico |
| Property Management Reference | — | Condo |

---

**Author:** Marketplace Engineering Team  
**Version:** 1.0 (08 Oct 2025)
