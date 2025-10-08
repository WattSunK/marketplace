# NAS Integration Deployment Plan
_Date: 08 Oct 2025_

## 🎯 Objective
Define how and when third-party open-source services (PostgreSQL, Redis, Kill Bill) will be deployed on the Synology NAS to support the Tenant–Landlord Marketplace integrations roadmap.

---

## 🧱 NAS Runtime Overview
| Component | Description | Status |
|------------|--------------|---------|
| **Node.js** | Core Marketplace backend | ✅ Active |
| **SQLite** | Current dev database | ✅ Active |
| **PostgreSQL** | Production DB (Docker) | ⏳ Planned – S2-T0 |
| **Redis** | Cache & message queue | ⏳ Optional – S1-T9/S2-T0 |
| **Kill Bill** | Billing engine | ⏳ Planned – S2-T0 |
| **Cloudflared** | HTTPS tunnel to Cloudflare | ✅ Active |

---

## 🧩 Integration Phases

| Phase | Goal | Containers / Services | Deliverable |
|--------|------|----------------------|--------------|
| **S1-T7** | Build integration scaffolds (registry, config, hooks). | — | Simulated outbound calls only. |
| **S1-T8** | Add local event queue simulation. | `redis:latest` | Redis container running locally. |
| **S2-T0** | Move to PostgreSQL backend and introduce billing engine. | `postgres:latest`, `killbill/killbill:latest` | Full DB + billing transition. |
| **S2-T1** | Live payment integrations and notifications. | Kill Bill + external APIs | Production-ready connectors. |

---

## 🧰 Docker Deployment Structure
Each container will live under `/volume1/web/marketplace/infra/docker-compose.yml`.

```yaml
version: '3.8'
services:
  marketplace_web:
    build: ../
    ports:
      - "3101:3101"
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:latest
    restart: always
    environment:
      POSTGRES_USER: marketuser
      POSTGRES_PASSWORD: marketpass
      POSTGRES_DB: marketplace
    volumes:
      - /volume1/docker/postgres:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:latest
    restart: always
    ports:
      - "6379:6379"

  killbill:
    image: killbill/killbill:latest
    restart: always
    ports:
      - "8080:8080"
    environment:
      - KILLBILL_DATABASE_URL=jdbc:postgresql://postgres:5432/killbill
      - KILLBILL_DATABASE_USER=marketuser
      - KILLBILL_DATABASE_PASSWORD=marketpass
```

---

## ⚙️ Verification Checklist
- [ ] `docker ps` shows all containers running.  
- [ ] `curl http://127.0.0.1:8080` returns Kill Bill welcome message.  
- [ ] `/api/health` includes `integrations_registered`.  
- [ ] Data persists after NAS reboot.  

---

## 🔒 Security Notes
- Use separate `.env` for DB and billing secrets.  
- Enforce internal network for inter-container traffic.  
- Backup `/volume1/docker/postgres` daily.  

---

## ✅ Timeline Summary

| Week | Milestone | Key Outcome |
|------|------------|-------------|
| Week 1 (S1-T7) | Integration scaffolds ready | `/api/integrations` operational |
| Week 2 (S1-T8) | Redis deployed | Queues & hooks tested |
| Week 3 (S2-T0) | PostgreSQL + Kill Bill deployed | Full billing + DB migration |
| Week 4 (S2-T1) | External API connections live | Production-ready integration |

---

**Author:** Marketplace Engineering Team  
**Version:** 1.0 (08 Oct 2025)
