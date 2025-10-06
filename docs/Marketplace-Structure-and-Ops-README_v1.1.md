# Tenant–Landlord Marketplace — Structure & Ops (README v1.1)

**Project:** Tenant–Landlord Marketplace  
**Environment:** Synology NAS (shared with WattSun)  
**Primary Domain:** https://boma.wattsun.co.ke  
**Date:** October 2025  
**Status:** Dev + Infra merged baseline ready  
**Version:** 1.1 (Primary Reference Document; supersedes earlier ops/deployment docs)

---

## 1. Overview

This repository defines the **core runtime, folder structure, database layer, deployment, and ops practices** for the Marketplace platform.  
It **merges** the approved *Marketplace-Deployment-Plan v1.0* with the S0-T1 Structure & Ops baseline.

| Layer        | Technology               | Purpose                                  |
|-------------|--------------------------|------------------------------------------|
| Marketplace | Cocorico (PHP / Symfony) | Listings + applications                   |
| Property Ops| Condo (Node.js / Express)| Leases, tenants, maintenance              |
| Billing     | Kill Bill (Java)         | Invoicing + payments                      |
| Connector   | Node.js microservice     | Data bridge and API hub                   |
| Persistence | PostgreSQL + Redis       | Database + queue/cache                    |

**Early phases (S0–S1):** develop on **SQLite + Node.js Connector** only; later move to **PostgreSQL + Redis** via Docker on Synology NAS.

---

## 2. Repository Layout

```
tenant-landlord-marketplace/
├── connector/                # Node.js Connector service (dev-first target)
│   ├── server.js
│   ├── routes/
│   ├── db.js
│   ├── scripts/
│   ├── public/
│   └── package.json
├── condo/                    # Property-Ops service (future)
├── cocorico/                 # Marketplace web frontend (PHP/Symfony)
├── killbill/                 # Billing engine container (Java)
├── postgres/                 # Data volume / init scripts
├── redis/                    # Cache / job queue
├── scripts/
│   ├── start_all.sh
│   ├── stop_all.sh
│   ├── backup_postgres.sh
│   ├── healthcheck.sh
│   └── logs/
├── data/dev/
├── logs/
├── run/
├── docs/
│   ├── FRD_Tenant_Landlord_Marketplace_Complete_v0.2.docx
│   ├── FRD_Illustrated_vFinal.pdf
│   └── Marketplace-Deployment-Plan_v1.0.md
└── docker-compose.yml
```

---

## 3. Runtime Configuration

### 3.1 Environment Variables (`.env` Example)

```
# Domain + ports
DOMAIN=https://boma.wattsun.co.ke
PORT_CONNECTOR=3101
PORT_CONDO=3102
PORT_KILLBILL=3103
PORT_COCORICO=3104

# Database
DB_ENGINE=sqlite        # or postgres
DB_PATH=./data/dev/marketplace.dev.db
POSTGRES_DB=marketplace
POSTGRES_USER=marketuser
POSTGRES_PASSWORD=strongpassword
POSTGRES_HOST=postgres
MIGRATIONS_DIR=./scripts/sql

# Redis
REDIS_URL=redis://redis:6379

# Secrets
SESSION_SECRET=change-me-please-32chars
```

### 3.2 Local Dev vs NAS
- **Local Dev (S0–S1):** run Connector on port **3101**, SQLite at `data/dev/marketplace.dev.db`.
- **NAS Deploy (post S0–T3):** Docker Compose runs Postgres/Redis; Cloudflare Tunnel exposes paths under **boma.wattsun.co.ke**.

---

## 4. Infrastructure Architecture

**Target:** Synology NAS with Docker. Persistent volumes under `/volume1/web/marketplace/`.

```
/volume1/web/marketplace/
├── docker-compose.yml
├── connector/
├── condo/
├── cocorico/
├── killbill/
├── postgres/
├── redis/
└── scripts/
```

### 4.1 Network Diagram (Mermaid placeholder)

```mermaid
graph TD
  CF[Cloudflare Tunnel (HTTPS Proxy)]
  A[Connector Service] -->|REST| B[(PostgreSQL)]
  A --> C[(Redis)]
  D[Cocorico] --> A
  E[Condo] --> A
  F[Kill Bill] --> A
  CF --> D
  CF --> E
  CF --> F
  CF --> A
```

---

## 5. Deployment & Proxy Strategy

### 5.1 Unified Domain
All modules operate under **https://boma.wattsun.co.ke**:

```
/api/connector/* → Connector (3101)
/condo/*         → Condo (3102)
/billing/*       → Kill Bill (3103)
/cocorico/*      → Marketplace Frontend (3104)
```

### 5.2 Cloudflare Tunnel Config
Path: `/volume1/web/cloudflared/config.yml`

```yaml
tunnel: wattsun-prod
credentials-file: /etc/cloudflared/wattsun.json
ingress:
  - hostname: boma.wattsun.co.ke
    service: http://localhost:3104
  - hostname: boma.wattsun.co.ke
    path: /api/*
    service: http://localhost:3101
  - hostname: boma.wattsun.co.ke
    path: /condo/*
    service: http://localhost:3102
  - hostname: boma.wattsun.co.ke
    path: /billing/*
    service: http://localhost:3103
  - service: http_status:404
```
Restart: `sudo docker restart cloudflared`

---

## 6. Database Bootstrap & Migrations

### 6.1 Local Dev (S0–S1)
- **SQLite** at `data/dev/marketplace.dev.db`
- Run `scripts/migrate.sh` to apply `scripts/sql/*.sql`
- `db.js` uses `better-sqlite3` (simple, synchronous, fast for dev)

### 6.2 Production (Post-S1)
- **PostgreSQL 16** via Docker Compose
- Migrations tracked in `migrations` table
- Backups via `scripts/backup_postgres.sh` → `pg_dump`
- Connector `.env` switches to `DB_ENGINE=postgres`

---

## 7. Health Checks & Monitoring

**Endpoint:** `/api/health`  

**Sample (post S0-T2):**
```json
{
  "ok": true,
  "uptime": 320,
  "db": { "connected": true, "migrations": ["2025-10-05_init.sql"] },
  "redis": { "ok": false }
}
```

Add NAS cron/Task Scheduler polling and alerting (email/webhook) later.

---

## 8. Ops Scripts (Summary)

| Script                 | Purpose                                  |
|------------------------|------------------------------------------|
| `scripts/start.sh`     | Launch connector service                 |
| `scripts/stop.sh`      | Gracefully stop service                  |
| `scripts/status.sh`    | Show PID status                          |
| `scripts/update.sh`    | Git pull + restart                       |
| `scripts/migrate.sh`   | Apply SQL migrations                     |
| `scripts/backup_sqlite.sh` | Local SQLite backup                 |
| `scripts/start_all.sh` | Compose-based multi-service start        |
| `scripts/backup_postgres.sh` | Dump PostgreSQL DB                |
| `scripts/healthcheck.sh` | Curl `/api/health` and log result     |

---

## 9. Backup & Auto-Start

**DSM Task Scheduler:** On Boot → root → `/volume1/web/marketplace/scripts/start_all.sh`

**Backup example:**
```bash
bash scripts/backup_postgres.sh
# → /volume1/backups/marketplace_YYYYMMDD-HHMM.sql
```

---

## 10. Update & Rollback

```bash
# Update
git pull
docker compose build
docker compose up -d

# Rollback
docker compose down
git checkout <last_good_commit>
docker compose up -d
```

---

## 11. Definition of Done (Infra Baseline)

✅ Cloudflare Tunnel active → boma.wattsun.co.ke  
✅ PostgreSQL + Redis containers operational  
✅ Connector responds to `/api/health`  
✅ Cocorico + Condo reachable under paths  
✅ Kill Bill UI accessible  
✅ Admin login functional on Cocorico  

---

## 12. Licensing & Compliance Summary

| Component  | License           | Type        | Note                                     |
|-----------|-------------------|-------------|------------------------------------------|
| Cocorico  | MIT               | Open Source | Rental/service marketplace                |
| Condo     | MIT / Apache 2.0  | Open Source | Property management                       |
| Kill Bill | Apache 2.0        | Open Source | Billing engine                            |
| PostgreSQL| PostgreSQL License| Open Source | Core DB                                   |
| Redis     | BSD 3-Clause      | Open Source | Cache + queue                             |
| Node.js   | MIT               | Open Source | Connector runtime                         |
| Docker    | Apache 2.0        | Open Source | Infra engine                              |
| Cloudflare| Proprietary (free)| Service     | Routing only                              |
| Synology  | Proprietary       | Appliance   | Existing hardware                         |

All core components are permissive open source; no recurring license fees.

---

## 13. Roadmap Bridge (S0 → S1)

| Sprint   | Focus                                | Key Deliverables                        |
|----------|--------------------------------------|-----------------------------------------|
| S0-T1    | Repo skeleton + health endpoint      | ✅ Completed                             |
| S0-T2    | DB bootstrap + migrations integration| `/db.js`, `/scripts/sql`, health db info|
| S0-T3    | Docker Compose bring-up              | Postgres + Redis online                 |
| S1-T1    | Connector API v1 (users + leases)    | CRUD + auth bridge                      |
| S1-T2    | Condo integration                    | Auth + data sync                        |

---

## 14. Quick Start (Dev Mode)

```bash
cp .env.example .env
npm install
./scripts/migrate.sh
./scripts/start.sh
# → http://127.0.0.1:3101/api/health
```

---

*End of Marketplace-Structure-and-Ops-README v1.1 (Primary Reference)*
