# Alternative Billing Engines Comparison
_Date: 08 Oct 2025_

## 🎯 Objective
Evaluate open-source and lightweight billing/reconciliation solutions for the Tenant–Landlord Marketplace project, hosted on Synology NAS.  
Conclude with the official decision to adopt **Kill Bill** as the enterprise-grade billing and reconciliation engine for Phase S2-T0.

---

## 🧱 Evaluation Matrix

| Platform | Stack | Core Strengths | Weaknesses | NAS Suitability | Decision |
|-----------|--------|----------------|-------------|-----------------|-----------|
| **Kill Bill** | Java / PostgreSQL | Enterprise-grade billing, subscription, invoicing, and reconciliation engine. REST API-driven. | Heavier memory footprint (Java). | ✅ Excellent — Docker deployable on NAS with Postgres backend. | **Adopt** |
| **Crater Invoice** | PHP / Laravel / MySQL | Simple invoicing, nice UI, self-hostable. | No reconciliation or complex billing logic. | ⚙️ Moderate — runs on NAS but PHP stack adds overhead. | Reference only |
| **Invoice Ninja** | PHP / Laravel / MySQL | Full invoicing suite, recurring billing, multiple payment gateways. | Monolithic PHP app; heavy dependencies. | ⚙️ Moderate | Reference only |
| **Medusa JS** | Node.js | Headless commerce framework; modular billing and order logic; modern stack. | Not full financial engine; lacks reconciliation. | ✅ Lightweight (Node-native). | Optional secondary candidate |
| **Vendure** | Node.js / TypeScript | Extensible with payment and billing plugins. | Commerce-focused rather than tenancy-based. | ✅ Lightweight | Optional |
| **Dolibarr ERP** | PHP / MySQL | Mature ERP + billing + accounting modules. | Large legacy system; slow on NAS. | ⚙️ Heavy | Reference only |

---

## 🧭 Final Decision

| Aspect | Selected Engine | Justification |
|--------|------------------|----------------|
| **Billing Core** | **Kill Bill** | Proven open-source billing platform; rich REST API and event model. |
| **Invoicing and Receipts** | **Marketplace native modules** | Your S1-T6 `/api/invoices` and `/api/receipts` already handle this locally. |
| **Reconciliation** | **Kill Bill + Postgres** | Real-time reconciliation and financial tracking. |
| **Integration Layer** | **/api/billing/* connectors** | Bridges Marketplace → Kill Bill API. |

Kill Bill will serve as the **canonical billing source of truth**, complementing your internal invoice and receipt models.

---

## 🧩 Integration Phase

| Phase | Action | Deliverable |
|--------|--------|-------------|
| **S2-T0.1** | Deploy Kill Bill container post-Postgres migration | Kill Bill API reachable at `http://127.0.0.1:8080` |
| **S2-T0.2** | Build `/api/billing/*` connectors for invoice/payment sync | Marketplace ↔ Kill Bill event flow |
| **S2-T1** | Activate recurring billing and reconciliation | Tenant & landlord cycles automated |
| **S2-T2** | Add financial reports and audit scripts | `/scripts/reconcile_billing.js` |

---

## ⚙️ Integration Prerequisites Checklist

| Requirement | Specification | Notes |
|--------------|----------------|--------|
| **NAS RAM** | ≥ 4 GB recommended | Java runtime + Postgres container require memory headroom. |
| **Docker Runtime** | Installed and verified on NAS | Use existing `/volume1/web/marketplace/infra/docker-compose.yml`. |
| **Database** | PostgreSQL running as container service | Same host network for `killbill` container. |
| **Network Port** | 8080 exposed to localhost | Accessible via `curl http://127.0.0.1:8080`. |
| **Environment Variables** | `KILLBILL_DATABASE_URL`, `KILLBILL_DATABASE_USER`, `KILLBILL_DATABASE_PASSWORD` | Add to `.env` and pass into container. |
| **API Connectivity** | `/api/billing/*` endpoints implemented | Integrates with Kill Bill REST API. |
| **Persistence** | Docker volume for `/var/lib/postgresql/data` | Ensures billing data survives reboots. |

---

## 🔧 Example Docker Snippet

```yaml
killbill:
  image: killbill/killbill:latest
  restart: always
  ports:
    - "8080:8080"
  environment:
    - KILLBILL_DATABASE_URL=jdbc:postgresql://postgres:5432/killbill
    - KILLBILL_DATABASE_USER=marketuser
    - KILLBILL_DATABASE_PASSWORD=marketpass
  depends_on:
    - postgres
```

---

## 📊 Integration Flow Overview

```
Tenant–Landlord Marketplace
        │
        ▼
 Integration Layer (Hooks + Registry)
        │
        ▼
 /api/billing/* → Kill Bill API (Invoices, Payments, Subscriptions)
        │
        ▼
 PostgreSQL (Kill Bill schema) → Reconciliation Jobs
```

---

## ✅ Summary

- **Kill Bill** is officially adopted as the billing and reconciliation engine.  
- Integration begins **immediately after PostgreSQL migration (S2-T0.1)**.  
- NAS deployment will use Docker containers (`postgres`, `killbill`, `redis`).  
- Internal endpoints (`/api/billing/*`) bridge your existing invoice/receipt flow to Kill Bill.  
- Reconciliation, reporting, and audit automation will follow in **S2-T1 → S2-T2**.

---

**Author:** Marketplace Engineering Team  
**Version:** 1.0 (08 Oct 2025)
