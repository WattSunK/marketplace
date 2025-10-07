# S1-T4 Kickoff Notes — Relational Joins & Property Mapping
_Date: 07 Oct 2025_

## 🎯 Objective
Reintroduce `property_id` into the `leases` table for efficient property-to-lease joins.  
This enables direct property-based filtering and enriched API responses for landlords, tenants, and admins.

## 🧱 Scope
| Component | Description |
|------------|-------------|
| **Migration** | Add `property_id INTEGER REFERENCES properties(id)` to `leases`. |
| **Backfill** | Populate `property_id` using `units.property_id` for all existing rows. |
| **API Update** | Extend `/api/leases` responses to include property name/address via JOIN. |
| **Filtering** | Support `/api/leases?property_id=1` queries. |
| **Health** | Update `/api/health` to show relational linkage counts. |

## ⚙️ SQL Migration Outline
File: `scripts/sql/2025-10-07_add_property_id_to_leases.sql`

```sql
ALTER TABLE leases ADD COLUMN property_id INTEGER REFERENCES properties(id);
UPDATE leases
SET property_id = (
  SELECT u.property_id FROM units u WHERE u.id = leases.unit_id
)
WHERE property_id IS NULL;
```

## 🧪 Verification Plan
| Step | Endpoint | Expected Result |
|------|-----------|-----------------|
| 1 | GET /api/leases | Returns `property_id` + nested property info |
| 2 | GET /api/leases?property_id=1 | Filters correctly |
| 3 | POST /api/leases | Accepts valid `property_id` |
| 4 | DELETE /api/properties/:id | Cascades or rejects if leases exist |
| 5 | GET /api/health | Shows counts for `leases` and property mapping |

## ✅ Definition of Done
- [ ] `property_id` added to `leases` table  
- [ ] Data backfilled for all rows  
- [ ] `/api/leases` returns property info inline  
- [ ] Filtering by `property_id` works  
- [ ] Health shows property-lease linkage counts  
- [ ] `S1-T4` verification script passes  
- [ ] Tag `S1-T4-complete` pushed


---

## 🧩 Verification & Completion Summary
_Date Verified: 07 Oct 2025_

| Check | Result |
|--------|--------|
| property_id column added | ✅ |
| Backfill successful | ✅ |
| /api/leases join enrichment | ✅ |
| Filtering by property_id | ✅ |
| /_ops/health counts | ✅ |
| Authenticated test via superadmin@example.com | ✅ |
| Automated script v3 (jq) | ✅ |
| Tag pushed | `S1-T4-complete` |

**Next:** Proceed to S1-T5 — Lease–Payment Linkage & Derived Totals
