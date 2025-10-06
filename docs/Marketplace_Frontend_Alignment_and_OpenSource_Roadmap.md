/docs/Marketplace_Frontend_Alignment_and_OpenSource_Roadmap.md

It unifies:

Frontend Alignment with WattSun Framework, and

Open-Source / Third-Party Component Installation Roadmap.

# 🏗️ Tenant–Landlord Marketplace  
## Frontend Alignment & Open-Source Integration Roadmap  
**Document Version:** 1.0  
**Date:** 2025-10-06  
**Status:** ✅ Baseline Confirmed  

---

## 🎨 Frontend Framework Alignment with WattSun

The Marketplace frontend is intentionally modelled after the **WattSun Solar** architecture for consistency, reuse, and rapid deployment.

| Area | Marketplace Plan | Inherited from WattSun |
|------|------------------|------------------------|
| **Frontend Stack** | Static HTML + modular JS using `fetch()` | ✅ Same minimal JS pattern (no SPA) |
| **Theme System** | Light + Golden for admin, neutral for users | ✅ Same palette and `.btn` classes |
| **Structure** | `/public/` root with `/js/`, `/css/`, `/partials/`, `/images/` | ✅ Identical folder layout |
| **Dynamic Data** | API endpoints `/api/properties`, `/api/leases`, `/api/users`, etc. | ✅ Mirrors `/api/items`, `/api/orders` |
| **Session Handling** | `auth.js` manages login + session + localStorage | ✅ Derived from WattSun `auth.js` |
| **Role Dashboards** | Separate views: Admin / Landlord / Tenant | ✅ Mirrors WattSun admin vs. customer portals |
| **Deployment** | Served via Express or Synology Web Station | ✅ Same NAS + Cloudflare Tunnel pipeline |
| **Styling** | Tailwind-style utilities + unified `/admin/admin.css` | ✅ Single-skin Light + Golden theme |
| **Assets** | `/public/images/` for all categories and site images | ✅ Same caching and URL scheme |
| **Build Tooling** | None (manual + scripts) until Sprint 1 | ✅ Same zero-build workflow |

### 💡 Reuse Advantages
- Shared UI/UX tokens and buttons  
- Shared auth/session modules  
- Single deployment + caching strategy  
- Reduced maintenance and regression risk  

---

## ⚙️ Open-Source / Third-Party Component Roadmap

| Component | License | Type | Purpose | Planned Sprint | Status |
|------------|----------|------|----------|----------------|---------|
| **Node.js** | MIT | Open Source | API + session runtime | S0 | ✅ Active |
| **SQLite → PostgreSQL** | PostgreSQL License | Open Source | Core database migration | S1-T1 | 🟩 Planned |
| **Docker** | Apache 2.0 | Open Source | Containerization & CI | S1-T0 | 🟨 Partial setup |
| **Redis** | BSD 3-Clause | Open Source | Cache + queue layer | S1-T3 | 🟦 Planned |
| **Kill Bill** | Apache 2.0 | Open Source | Billing + subscriptions | S1-T4 | 🟨 Planned |
| **Cocorico** | MIT | Open Source | Booking & service marketplace reference | S1-T5 | 🟨 Planned |
| **Condo** | MIT / Apache 2.0 | Open Source | Property & lease management reference | S1-T6 | 🟨 Planned |
| **Cloudflare** | Proprietary (Free Tier) | Service | Secure tunnel + routing | S0-T4 | ✅ Active |
| **Synology** | Proprietary | Appliance | NAS runtime environment | Permanent | ✅ Existing |

---

## 🧭 Installation Schedule Overview

| Window | Integration Focus | Deliverables |
|---------|------------------|---------------|
| **Sprint 0 (Setup)** | Baseline runtime: Node.js + SQLite + Cloudflare + Synology | ✅ Completed |
| **Sprint 1 (Infra & Integrations)** | PostgreSQL + Docker + Redis setup | `docker-compose.yml`, migration scripts |
| **Sprint 2 (Domain Layer)** | Integrate Cocorico & Condo data models (leases, bookings, tenants) | API extensions + schema merges |
| **Sprint 3 (Billing & Automation)** | Deploy Kill Bill for billing, Redis queues, webhooks | Billing module + notification service |
| **Sprint 4 (Optimization)** | Cache tuning, CI pipelines, API metrics | Health + monitoring suite |

---

## 🧱 Dependency Governance

- All open-source components use **permissive licenses** (MIT, Apache 2.0, BSD, PostgreSQL).  
- Third-party/proprietary tools (Cloudflare, Synology) remain optional service layers.  
- Installations follow a **containerized model** with scripts under `/scripts/infra/` for consistent deployment on the NAS.

---

## 🗆 Next Steps
- Finalize **S0-T9 (Role-Based Authorization)** before Sprint 1.  
- Prepare `docker-compose` baseline for PostgreSQL + Redis.  
- Align frontend dashboards with role-guarded access logic.

---

**📍 Document Location:** `/docs/Marketplace_Frontend_Alignment_and_OpenSource_Roadmap.md`  
**Author:** Maina Kamunyu  
**Last Updated:** 2025-10-06