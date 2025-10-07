# S1-T6 Kickoff Notes — Invoicing & Receipts Layer
_Date: 08 Oct 2025_

## 🎯 Objective
Extend the financial subsystem by introducing **Invoices** and **Receipts** built on the verified lease–payment linkage (S1‑T5).  
This sprint formalizes rent cycles, payment tracking, and document traceability, enabling automated reporting and audit trails.

---

## 🧱 Scope

| Component | Description |
|------------|--------------|
| **Invoices Table** | Store rent charge entries generated from active leases. Each invoice includes lease_id, period_start, period_end, amount_cents, status, and issued_at. |
| **Receipts Table** | Record confirmed payments referencing invoices. Includes payment_id, invoice_id, amount_cents, receipt_number, and issued_at. |
| **Relationships** | invoices.lease_id → leases.id; receipts.payment_id → payments.id; receipts.invoice_id → invoices.id. |
| **API Endpoints** | `/api/invoices` (CRUD + filters by lease_id/status) and `/api/receipts` (list + issue receipt). |
| **Health Extension** | `/api/health` to include counts of `invoices_issued` and `receipts_logged`. |
| **Testing & Validation** | Create `tests/api_invoice_receipt_verify.sh` verifying full issue→payment→receipt flow. |

---

## ⚙️ SQL Migration Outline
File: `scripts/sql/2025-10-09_create_invoices_receipts.sql`

```sql
-- 1️⃣ Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lease_id INTEGER NOT NULL REFERENCES leases(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  amount_cents INTEGER NOT NULL,
  status TEXT DEFAULT 'Unpaid',
  issued_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2️⃣ Receipts table
CREATE TABLE IF NOT EXISTS receipts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id INTEGER REFERENCES invoices(id) ON DELETE SET NULL,
  payment_id INTEGER REFERENCES payments(id) ON DELETE SET NULL,
  amount_cents INTEGER NOT NULL,
  receipt_number TEXT UNIQUE,
  issued_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3️⃣ Indexes for performance
CREATE INDEX IF NOT EXISTS idx_invoices_lease ON invoices(lease_id);
CREATE INDEX IF NOT EXISTS idx_receipts_invoice ON receipts(invoice_id);
CREATE INDEX IF NOT EXISTS idx_receipts_payment ON receipts(payment_id);
```

---

## 🧪 Verification Plan

| Step | Endpoint | Expected Result |
|------|-----------|-----------------|
| 1 | `POST /api/invoices` | Creates invoice linked to lease; returns ID and amount. |
| 2 | `GET /api/invoices?lease_id=1` | Lists invoices for lease; correct totals and status shown. |
| 3 | `POST /api/receipts` | Creates receipt referencing invoice and payment. |
| 4 | `GET /api/receipts?invoice_id=1` | Returns all receipts linked to invoice. |
| 5 | `GET /api/health` | Reports `invoices_issued` and `receipts_logged` counts. |
| 6 | Run `tests/api_invoice_receipt_verify.sh` | All verifications pass. |

---

## ✅ Definition of Done (DoD)

- [ ] Migration applied without errors (invoices & receipts tables created).  
- [ ] Invoice issuance tested via API; linked to lease_id.  
- [ ] Receipts issued successfully for payments and invoices.  
- [ ] `/api/health` displays invoice/receipt counts.  
- [ ] Test script executes successfully.  
- [ ] Commit tagged as **`S1-T6-complete`**.

---

### 🧭 Next Phase Preview
S1‑T7 will extend this foundation with **automated billing cycles** (monthly invoice generation), **tenant notifications**, and **ledger reconciliation** for landlords and admins.
