# S1-T3 Kickoff Notes — Lease & Payment Integration
**Tenant–Landlord Marketplace Project**  
**Date:** 09 Oct 2025

---

## 🎯 Objective

Implement **Lease** and **Payment** APIs that connect tenants to specific property units, define rental terms, and record payments.  
This milestone introduces the core transactional layer of the marketplace, enabling lease management, rent tracking, and balance computation.

---

## 🧱 Scope

| Area | Description |
|------|--------------|
| **Database Layer** | Create new tables: `leases` and `payments`, linked to `users`, `properties`, and `units`. |
| **API Layer** | Implement REST endpoints `/api/leases` and `/api/payments` using modular route files. |
| **Relations** | Each lease links one `tenant_id`, one `unit_id`, and one `property_id`. Payments link to a specific `lease_id`. |
| **Permissions** | Landlords/Admins can create, update, and close leases. Tenants can view only their own leases and payment history. |
| **Validation** | Ensure valid foreign keys, non-negative amounts, and logical date ranges (`start_date` < `end_date`). |
| **Computed Fields** | Expose calculated balance (total_rent - total_paid) in lease queries. |
| **Health Integration** | Extend `/api/health` to report counts for leases and payments. |
| **Testing** | Manual and automated curl-based verification scripts to ensure API correctness and data integrity. |

---

## 🔧 Deliverables

| File | Purpose |
|------|----------|
| `/routes/leases.js` | CRUD routes for lease management. |
| `/routes/payments.js` | CRUD routes for recording payments. |
| `/scripts/sql/2025-10-xx_create_leases_payments.sql` | Database migration for leases/payments tables. |
| `/docs/S1-T3_Test_Plan.md` | Manual test plan and SQL validation snippets. |

---

## 🧩 API Outline

### `/api/leases`
| Method | Path | Role | Description |
|---------|------|------|-------------|
| GET | `/api/leases` | landlord/admin/tenant | List leases (tenant sees only their own). |
| GET | `/api/leases/:id` | all | Fetch lease details with linked unit, property, and payments. |
| POST | `/api/leases` | landlord/admin | Create new lease (assign tenant, property, unit). |
| PUT | `/api/leases/:id` | landlord/admin | Update lease terms or status. |
| DELETE | `/api/leases/:id` | admin | Delete lease record. |

### `/api/payments`
| Method | Path | Role | Description |
|---------|------|------|-------------|
| GET | `/api/payments` | landlord/admin/tenant | List payments (tenant sees only their own). |
| GET | `/api/payments/:id` | all | Fetch payment details by ID. |
| POST | `/api/payments` | landlord/admin | Record payment for a lease. |
| PUT | `/api/payments/:id` | landlord/admin | Update payment details (amount/date). |
| DELETE | `/api/payments/:id` | admin | Delete a payment record. |

---

## 🧮 Example SQL Migration (`2025-10-xx_create_leases_payments.sql`)

```sql
-- Create leases table
CREATE TABLE IF NOT EXISTS leases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL REFERENCES users(id),
  property_id INTEGER NOT NULL REFERENCES properties(id),
  unit_id INTEGER NOT NULL REFERENCES units(id),
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  rent_amount REAL NOT NULL CHECK(rent_amount >= 0),
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lease_id INTEGER NOT NULL REFERENCES leases(id),
  payment_date TEXT NOT NULL DEFAULT (datetime('now')),
  amount REAL NOT NULL CHECK(amount >= 0),
  method TEXT DEFAULT 'cash',
  note TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Optional: Derived view for lease balances
CREATE VIEW IF NOT EXISTS lease_balances AS
SELECT l.id AS lease_id,
       l.tenant_id,
       l.property_id,
       l.unit_id,
       l.rent_amount,
       COALESCE(SUM(p.amount), 0) AS total_paid,
       (l.rent_amount - COALESCE(SUM(p.amount), 0)) AS balance
FROM leases l
LEFT JOIN payments p ON l.id = p.lease_id
GROUP BY l.id;
```

---

## 📊 Test Plan Summary
1. Create tenant and landlord users.
2. Create a property and a unit.
3. POST `/api/leases` → verify new lease creation.
4. POST `/api/payments` → record payment and confirm in DB.
5. GET `/api/leases/:id` → ensure embedded payments and correct balance.
6. DELETE `/api/leases/:id` → cascade behavior check.
7. Verify counts appear under `/api/health` → `leases`, `payments`.

---

## ✅ Definition of Done (DoD)
| Requirement | Status |
|--------------|---------|
| `leases` and `payments` tables created and migrated. | ☐ |
| `/api/leases` and `/api/payments` CRUD routes implemented. | ☐ |
| Role guards enforced (`requireRole`, `requireAnyRole`). | ☐ |
| Balances computed via SQL view or backend aggregation. | ☐ |
| `/api/health` extended to include lease/payment counts. | ☐ |
| All tests in `S1-T3_Test_Plan.md` pass. | ☐ |
| Repository tagged `S1-T3-complete`. | ☐ |

