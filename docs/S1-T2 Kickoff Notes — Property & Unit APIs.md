# S1-T2 Kickoff Notes — Property & Unit APIs
**Tenant–Landlord Marketplace Project**  
**Date:** 09 Oct 2025

---

## 🎯 Objective
Expose CRUD-style REST endpoints for **Properties** and **Units**, powered by the relational schema introduced in **S1-T1**.  
This milestone enables:
- **Landlords** to register and manage their properties/units.
- **Tenants** to view available rentals.
- **Admins** to oversee listings and enforce data consistency.

---

## 🧱 Scope

| Area | Description |
|------|--------------|
| **API Layer** | Create modular Express routes under `/api/properties` and `/api/units`. |
| **Data Layer** | Use existing `db.js` connector (better-sqlite3/sqlite3) for SQL CRUD operations. |
| **Auth & Roles** | Reuse `requireRole` middleware. `POST/PUT/DELETE` require landlord/admin; `GET` is public. |
| **Validation** | Validate fields (e.g., non-empty name/address, `rent_amount >= 0`). |
| **Pagination** | Implement `page` and `per` query params in GET routes. |
| **Relations** | Support `GET /api/properties/:id/units` for linked units. |
| **Error Handling** | Use consistent JSON errors: `{ success: false, error }`. |
| **Health Integration** | Extend `/api/health` to report counts for properties and units. |

---

## ⚙️ Deliverables

| File | Purpose |
|------|----------|
| `/routes/properties.js` | CRUD endpoints for property records. |
| `/routes/units.js` | CRUD endpoints for unit records. |
| `/middleware/requireRole.js` | Existing role-based guard. |
| `/tests/api_properties_units.sh` | Curl-based smoke test script. |
| `/docs/S1-T2_Test_Plan.md` | Manual test plan + SQL verification steps. |

---

## 🧩 API Outline

### `/api/properties`
| Method | Path | Role | Description |
|---------|------|------|-------------|
| GET | `/api/properties` | all | List properties (supports pagination). |
| GET | `/api/properties/:id` | all | Fetch a single property and its owner. |
| POST | `/api/properties` | landlord/admin | Create a new property record. |
| PUT | `/api/properties/:id` | landlord/admin | Update name, address, or metadata. |
| DELETE | `/api/properties/:id` | admin | Remove property and cascade delete units. |

### `/api/units`
| Method | Path | Role | Description |
|---------|------|------|-------------|
| GET | `/api/units` | all | List units (optionally filter by `property_id` or `status`). |
| GET | `/api/units/:id` | all | Fetch details for a specific unit (+ property name). |
| POST | `/api/units` | landlord/admin | Add unit to an existing property. |
| PUT | `/api/units/:id` | landlord/admin | Update rent amount or status. |
| DELETE | `/api/units/:id` | admin | Delete unit. |

---

## 🧮 Example SQL Snippets

```sql
-- Paginated property listing
SELECT * FROM properties
ORDER BY id DESC
LIMIT :per OFFSET (:page - 1) * :per;

-- Create new unit
INSERT INTO units (property_id, unit_number, rent_amount, status)
VALUES (:property_id, :unit_number, :rent_amount, :status);

-- Retrieve property and its units
SELECT * FROM units WHERE property_id = :property_id;
```

---

## 🔒 Role Guard Usage

```js
import requireRole from "../middleware/requireRole.js";

router.post("/", requireRole(["landlord", "admin"]), (req, res) => { /* ... */ });
router.delete(":id", requireRole(["admin"]), (req, res) => { /* ... */ });
```

---

## 🧠 Test Plan (Summary)

1. `GET /api/properties` → Returns seeded records (paginated).
2. `POST /api/properties` as landlord → Property created with `owner_id`.
3. `GET /api/units?property_id=1` → Returns linked units.
4. `PUT /api/units/:id` → Updates rent/status.
5. Unauthorized tenant `POST` → Returns 403.
6. Cascade delete → Deleting a property removes its units.

---

## ✅ Definition of Done (DoD)

| Status | Requirement |
|---------|--------------|
| ☐ | `/api/properties` and `/api/units` fully implemented. |
| ☐ | Role guards enforced for write ops. |
| ☐ | CRUD verified via curl + SQL checks. |
| ☐ | `/api/health` extended with entity counts. |
| ☐ | All items in `S1-T2_Test_Plan.md` verified. |
| ☐ | Tagged `S1-T2-complete` in Git after successful verification. |

