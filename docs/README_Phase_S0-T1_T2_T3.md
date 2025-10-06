📘 docs/README_Phase_S0-T1_T2_T3.md
# Tenant–Landlord Marketplace — Phase S0 Summary (T1–T3)

## 1. Overview
**Phase S0 — Repository Foundation & Health Bootstrap**  
This phase established a fully modular Node/Express backend with SQLite persistence, environment management, migration scripts, and core health endpoints.  
The goal was to reach a stable, reproducible baseline ready for feature-level API development.

---

## 2. S0-T1 — Repo Skeleton & Ops Scripts
### 🎯 Objective
Create a minimal Express server with health check and basic operational scripts.

### 🧩 Achievements
- Added canonical folders: `/scripts`, `/routes`, `/docs`
- Added scripts: `start.sh`, `stop.sh`, `status.sh`, `update.sh`
- Implemented `/api/health` returning `{ ok:true }`
- Verified startup via `npm start` on port **3101**

### ✅ Definition of Done
- Server boots without error  
- `/api/health` responds `{ ok:true }`  
- Repo structure matches the baseline layout

---

## 3. S0-T2 — Database Bootstrap & Migrations
### 🎯 Objective
Integrate a lightweight database layer for local development.

### 🧩 Achievements
- Introduced **better-sqlite3** connector (`connector/db.js`)
- Added baseline migration `2025-10-05_init.sql`
- Implemented `connector/scripts/migrate.sh`
- `/api/health` extended to report DB connectivity
- `.env` added to manage `DB_PATH`, `PORT`, etc.

### ✅ Definition of Done
- `data/dev/marketplace.dev.db` created
- `/api/health` → `"db": { "connected": true }`

---

## 4. S0-T3 — API Bootstrap & Health Integration
### 🎯 Objective
Refactor into a modular Express API with full health, version, and ping endpoints.

### 🧩 Achievements
- Refactored `server.js` to modular routing (`routes/system-health.js`)
- Added `/api/health`, `/api/ping`, `/api/version`
- Introduced `middleware/logger.js`
- Extended `.env` for `LOG_DIR`, `RUN_DIR`
- Verified NAS runtime:


✅ Connected to SQLite database at data/dev/marketplace.dev.db
✅ Marketplace API listening on port 3101 [development]


### ✅ Definition of Done
- All health endpoints return `ok:true`
- DB connected and writable
- Verified on NAS + PC
- Tag created: `S0-T3-clean-baseline`

---

## 5. Repository Structure (Post-S0-T3)


/volume1/web/marketplace/
├── connector/
│ ├── db.js
│ └── scripts/sql/2025-10-05_init.sql
├── routes/system-health.js
├── middleware/logger.js
├── docs/
│ ├── README_Phase_S0-T1_T2_T3.md
│ └── S0-T3-README.md
├── data/dev/marketplace.dev.db
├── scripts/
│ ├── migrate.sh
│ └── backup_sqlite.sh
├── server.js
└── .env


---

## 6. Verified Environment Matrix
| Layer | Result |
|-------|---------|
| PC | Clean packs committed (S0-T1 → S0-T3) |
| GitHub | Tag `S0-T3-clean-baseline` |
| NAS | Node v20.19.5 + better-sqlite3 ✓ |
| Endpoints | `/api/health`, `/api/ping`, `/api/version` ✓ |
| DB Path | `data/dev/marketplace.dev.db` ✓ |

---

## 7. Next Phase — S0-T4 Feature API Scaffolding
The next task will establish the project’s first functional endpoints for system entities (Users, Properties, Leases).  
See below for kickoff outline.

---

# 🔜 S0-T4 — Feature-Level API Scaffolding

### 🎯 Objective
Lay the foundation for business-level endpoints using modular routes and shared middleware.  
This task extends the clean API base into the first tenant/landlord domain modules.

---

### 🧱 Scope
| Component | Description |
|------------|--------------|
| `/api/users` | Basic CRUD with in-memory store or SQLite table |
| `/api/properties` | Placeholder route structure |
| `/api/leases` | Read-only mock endpoint for initial tests |
| `/middleware/errorHandler.js` | Unified error + 404 handling |
| `/routes/index.js` | Automatic route loader |
| `/api/health` | Extended to list registered routes count |
| `docs/S0-T4-README.md` | Documentation for new routes + tests |

---

### ⚙️ Definition of Done (DoD)
- ✅ All `/api/*` routes return valid JSON with `ok:true` and sample payloads  
- ✅ `/api/health` shows `"routes": <count>`  
- ✅ Code style and middleware consistent with S0-T3 baseline  
- ✅ Verified locally (`curl` / `sqlite3` checks)  
- ✅ NAS pull → `npm start` works with all new routes  
- ✅ Commit tagged as `S0-T4-kickoff`  

---

**Document Version:** `README_Phase_S0-T1_T2_T3.md`  
**Date:** 06 Oct 2025  
**Maintainer:** Tenant–Landlord Marketplace Core Team
