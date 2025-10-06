# S0-T2 — Database Bootstrap & Migrations (Revision B)

This revision aligns exactly with Marketplace-Structure-and-Ops-README v1.1.
It switches to **better-sqlite3** for synchronous, stable local development.

### Contents
- connector/db.js
- connector/routes/health.js
- connector/scripts/sql/2025-10-05_init.sql
- connector/scripts/migrate.sh
- connector/.env.example
- connector/package.json

### Usage
```bash
npm install
bash scripts/migrate.sh
npm start
curl http://127.0.0.1:3101/api/health
```

You should see:
```json
{ "ok": true, "db": { "connected": true } }
```
