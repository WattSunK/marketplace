# 🧩 S1 — Core Integrations Plan  
**Tenant–Landlord Marketplace Project**  
_Date Planned: 08–22 Oct 2025_

---

## 🎯 Objective
Establish the first functional layer of the Marketplace platform by integrating real-world entities — **Properties, Units, Leases, and Payments** — into the API and database.  
This phase builds directly on the S0 authentication and role-based authorization stack, introducing domain logic and structured persistence.

---

## 🧱 Implementation Summary

| Task | Title | Description | Target Dates |
|------|--------|-------------|---------------|
| **S1-T1** | Entity Schema Expansion | Define new database tables and relations for `properties`, `units`, `leases`, `payments`, and seed data for development. | **08–10 Oct** |
| **S1-T2** | Property & Unit APIs | Create CRUD endpoints for managing properties and units; access controlled by role (`landlord`/`admin` create/update, `tenant` view). | **10–13 Oct** |
| **S1-T3** | Lease Linking & Validation | Implement tenant–unit assignment, rent schedule, and lease status logic. Validate one active lease per unit per tenant. | **13–15 Oct** |
| **S1-T4** | Payments Integration | Add endpoints for recording rent payments, balances, and receipts; prepare for future billing workflows. | **15–18 Oct** |
| **S1-T5** | Maintenance Requests (prototype) | Scaffold ticketing for tenant maintenance requests (table + routes + notifications stub). | **18–20 Oct** |
| **S1-T6** | Health & Sync Tests | Run integration and relational join checks across all entities. Validate CRUD operations, foreign key integrity, and role enforcement. | **20–22 Oct** |

---

## ⚙️ Dependencies
- Builds on **S0-T9 Role-Based Authorization** for user/role management.
- Reuses `marketplace.dev.db` with new migrations under `/scripts/sql/2025-10-xx_*.sql`.
- Extends backend endpoints under `/routes/`.
- Requires updated `/api/health` to include entity counts.

---

## 🗂️ Data Model Outline

### Properties
| Field | Type | Description |
|--------|------|--------------|
| `id` | INTEGER PK | Auto-increment primary key |
| `name` | TEXT | Property name |
| `address` | TEXT | Street or descriptive address |
| `owner_id` | INTEGER FK | Links to `users.id` (landlord) |
| `created_at` | DATETIME | Default current timestamp |

### Units
| Field | Type | Description |
|--------|------|--------------|
| `id` | INTEGER PK | Auto-increment primary key |
| `property_id` | INTEGER FK | Belongs to a property |
| `unit_number` | TEXT | Internal identifier (e.g. A1, Flat 2) |
| `rent_amount` | INTEGER | Monthly rent in cents |
| `status` | TEXT | Available / Occupied / Maintenance |

### Leases
| Field | Type | Description |
|--------|------|--------------|
| `id` | INTEGER PK | Lease record |
| `unit_id` | INTEGER FK | Linked to a unit |
| `tenant_id` | INTEGER FK | Linked to user (tenant) |
| `start_date` | DATE | Lease start |
| `end_date` | DATE | Lease end |
| `rent_cents` | INTEGER | Agreed rent value |
| `status` | TEXT | Active / Ended / Terminated |

### Payments
| Field | Type | Description |
|--------|------|--------------|
| `id` | INTEGER PK | Transaction record |
| `lease_id` | INTEGER FK | Associated lease |
| `amount_cents` | INTEGER | Paid amount |
| `method` | TEXT | Cash, M-Pesa, Bank, etc. |
| `paid_at` | DATETIME | Payment timestamp |

---

## 🧠 Technical Deliverables
1. Create migration scripts under `/scripts/sql/` for all entities.
2. Add corresponding data access helpers under `/connector/db_entities/`.
3. Implement CRUD routes in `/routes/properties.js`, `/routes/units.js`, `/routes/leases.js`, `/routes/payments.js`.
4. Update `/api/health` to summarize counts: `{ properties: x, units: y, leases: z, payments: w }`.
5. Add integration tests verifying role-based access (tenant read-only, landlord/admin write).

---

## ✅ Definition of Done for S1
| ✔ | Requirement |
|----|--------------|
| ☐ | Database schemas migrated and verified |
| ☐ | CRUD routes created and protected by role middleware |
| ☐ | Health endpoint extended to include entity counts |
| ☐ | Data integrity verified via relational joins |
| ☐ | Sample data available for testing (seed script) |
| ☐ | Admin and landlord views list accurate properties and units |
| ☐ | Tenant sees only assigned leases |

---

## 🪶 Deliverables
- `/scripts/sql/2025-10-08_create_entities.sql`  
- `/routes/properties.js`, `/routes/units.js`, `/routes/leases.js`, `/routes/payments.js`  
- `/tests/integration_s1.http` (REST verification set)  
- Updated `/api/health` summary section  
- Verification report `S1-Verification.md`

---

**Prepared by:** Marketplace Core Development  
**Phase Start:** 08 Oct 2025  
**Phase End:** 22 Oct 2025  
**Environment:** Synology NAS / Node 20.19.5 / SQLite 3.40.0

