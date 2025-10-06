# S0-T3 — API Bootstrap & Health Integration

This phase establishes a unified Express API entrypoint for the Tenant–Landlord Marketplace and integrates system health endpoints with database connectivity.

---

## 🎯 Objective
- Create modular Express server (`server.js`)
- Add `/api/health`, `/api/ping`, and `/api/version` routes
- Extend health endpoint to show DB connection + migration count
- Add timestamped request logging middleware
- Confirm startup on port **3101**

---

## 🗂 Directory Structure
```
/volume1/web/marketplace/
├── server.js
├── middleware/
│   └── logger.js
├── routes/
│   └── system-health.js
└── docs/
    └── S0-T3-README.md
```

---

## 🧱 Run Instructions
```bash
cd /volume1/web/marketplace
npm install express better-sqlite3 dotenv
npm start
```

---

## 🔍 Test Endpoints
```bash
curl http://127.0.0.1:3101/api/health
curl http://127.0.0.1:3101/api/ping
curl http://127.0.0.1:3101/api/version
```

**Expected Output Example**
```json
{
  "ok": true,
  "uptime": "5.12s",
  "db": {
    "connected": true,
    "path": "data/dev/marketplace.dev.db",
    "migrations": 1
  }
}
```

---

## ✅ Definition of Done
- `npm start` runs cleanly on port 3101
- `/api/health` returns DB connection and migration count
- `/api/ping` and `/api/version` respond correctly
- Logger outputs timestamps for all requests
- No 404 or runtime errors

---

**Document Version:** S0-T3 Kickoff Pack — 06 Oct 2025
