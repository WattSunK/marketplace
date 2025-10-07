# S1-T5 Kickoff Notes — Lease–Payment Linkage & Derived Totals
_Date: 07 Oct 2025_

## 🎯 Objective
Establish relational joins between **leases ↔ payments** to support linked financial records, per-lease payment summaries, and computed balances.  
This sprint enables a clear financial view for each lease, showing how much has been paid, how much is due, and providing data for automated reporting and reconciliation.

---

## 🧱 Scope

| Component | Description |
|------------|-------------|
| **Migration** | Add `lease_id INTEGER REFERENCES leases(id)` to `payments`. |
| **Backfill** | Populate `lease_id` for existing payments by matching `tenant_id` + `unit_id` to existing leases. |
| **API Updates** | Extend `/api/payments` to show linked lease details; update `/api/leases/:id` to include payment history. |
| **Computed Fields** | Expose `total_rent`, `total_paid`, and `balance_due` for each lease via aggregation of linked payments. |
| **Health Endpoint** | Extend `/api/health` to report counts of linked vs unlinked payments. |
| **Testing & Validation** | Create `tests/api_lease_payment_verify.sh` following S1-T4 pattern, verifying joins and computed totals. |

---

## ⚙️ SQL Migration Outline
File: `scripts/sql/2025-10-08_add_lease_id_to_payments.sql`

```sql
ALTER TABLE payments ADD COLUMN lease_id INTEGER REFERENCES leases(id);

-- Backfill payments using tenant/unit matching logic
UPDATE payments
SET lease_id = (
  SELECT l.id
  FROM leases l
  WHERE l.tenant_id = payments.tenant_id
    AND l.unit_id = payments.unit_id
  LIMIT 1
)
WHERE lease_id IS NULL;
```

---

## 🧪 Verification Plan

| Step | Endpoint | Expected Result |
|------|-----------|-----------------|
| 1 | `GET /api/payments` | Each record includes `lease_id` and lease summary (property/unit). |
| 2 | `GET /api/leases/:id` | Returns nested `payments[]` and computed totals. |
| 3 | `GET /api/health` | Reports linked/unlinked payment counts. |
| 4 | `GET /api/payments?lease_id=1` | Filters by lease correctly. |
| 5 | `GET /api/leases` | Aggregated totals visible inline per lease. |
| 6 | Test script | `tests/api_lease_payment_verify.sh` passes all checks. |

---

## ✅ Definition of Done

- [ ] Database migration applied (`lease_id` added to `payments`).  
- [ ] Backfill completed successfully.  
- [ ] `/api/payments` shows linked lease data.  
- [ ] `/api/leases/:id` exposes nested payment history.  
- [ ] Computed fields `total_rent`, `total_paid`, `balance_due` verified.  
- [ ] `/api/health` displays payment linkage counts.  
- [ ] All automated verification steps pass.  
- [ ] Commit tagged as **`S1-T5-complete`**.

---

### 🧭 Next Phase Preview
S1-T6 will extend the financial model with **invoicing**, **receipts**, and optional **tenant payment schedules**, building on these payment-link foundations.
