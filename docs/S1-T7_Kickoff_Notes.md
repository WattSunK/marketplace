# S1-T7 Kickoff Notes — Light Integration Phase
_Date: 08 Oct 2025_

## 🎯 Objective
Introduce **lightweight, decoupled integrations** aligned with the *Third-Party Integration Roadmap* and the *Overall Marketplace Roadmap*.  
This sprint focuses on establishing integration scaffolds without committing to heavy external dependencies.

---

## 🧱 Scope

| Component | Description |
|------------|--------------|
| **Integration Registry** | Table `integrations` to store provider name, type, status, API keys (if any). |
| **Notification Hook** | `/api/hooks/notify` endpoint for simulated outbound notifications (email/SMS/webhook). |
| **Billing Gateway Stub** | Placeholder for external payment gateways (e.g., Flutterwave, Stripe, Pesapal). |
| **Config & Secrets Layer** | `.env` extension for third-party keys, loaded via `config/integrations.mjs`. |
| **Test Harness** | `tests/api_integration_smoke.sh` validating registry listing + webhook send. |

---

## ⚙️ SQL Migration Outline
File: `scripts/sql/2025-10-12_create_integrations_table.sql`
```sql
CREATE TABLE IF NOT EXISTS integrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider TEXT NOT NULL,
  type TEXT NOT NULL,       -- e.g., 'notification', 'billing'
  status TEXT DEFAULT 'inactive',
  api_key TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🧪 Verification Plan
| Step | Endpoint | Expected Result |
|------|-----------|-----------------|
| 1 | `POST /api/integrations` | Creates a new provider entry |
| 2 | `GET /api/integrations` | Lists registered integrations |
| 3 | `POST /api/hooks/notify` | Simulated outbound notification logged |
| 4 | `GET /api/health` | Includes `integrations_registered` count |
| 5 | `bash tests/api_integration_smoke.sh` | All checks PASS |

---

## ✅ Definition of Done (DoD)
- [ ] Integration registry migration applied  
- [ ] `/api/integrations` CRUD endpoints live  
- [ ] `/api/hooks/notify` responds and logs outbound calls  
- [ ] `/api/health` extended with `integrations_registered`  
- [ ] Test harness passes and tag `S1-T7-complete`

---

## 🔜 Next Phase Preview
S1-T8 will evolve light integrations into **live notification delivery** and **real payment confirmation**, building on these stubs.
