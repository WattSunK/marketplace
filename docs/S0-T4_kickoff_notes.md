# 🧩 Sprint 0 — Task 4 (S0-T4): Feature-Level API Scaffolding

**Goal:** Introduce modular routes and domain structure for the first real entities (Users, Properties, Leases).

## Scope
- `/api/users` CRUD routes (in-memory for now)
- `/api/properties` stub routes
- `/api/leases` stub routes
- SQLite table schemas + SQL migration script
- Middleware for validation
- Server mounts all new routes

## Definition of Done
- `npm start` → app launches on port 3101
- `/api/health` → still OK
- `/api/users`, `/api/properties`, `/api/leases` → return JSON arrays
- `scripts/migrate_s0t4.sh` applies SQL successfully

## Next Step → S0-T5
Convert the in-memory stubs to use actual SQLite reads/writes.
