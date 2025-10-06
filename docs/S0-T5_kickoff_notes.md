# 🧩 Sprint 0 — Task 5 (S0-T5): Data-Backed CRUD Endpoints

**Goal:** Replace static in-memory routes with live SQLite CRUD endpoints for users, properties, and leases.

## Scope
- Implement full CRUD for all three tables.
- Use db.js connection with prepared statements.
- Add seed SQL for demonstration data.
- Update migrate_s0t5.sh for fast setup.
- Confirm /api/health includes DB stats.

## Definition of Done
1. Server runs cleanly on port 3101.
2. GET /api/users returns DB rows.
3. POST /api/users inserts correctly.
4. PATCH/DELETE work as expected.
5. All CRUD for properties & leases functional.
6. sqlite3 shows populated tables.
7. Docs and scripts added to repo.

✅ Ready for next increment (S0-T6: Validation & Auth Integration)
