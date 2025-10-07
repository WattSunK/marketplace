# S1-T2 Test Plan — Property & Unit APIs

## 1️⃣ Pre-checks
- `marketplace.dev.db` must contain tables: properties, units.
- `requireRole` middleware active and sessions working.
- Logged in cookies for admin, landlord, tenant available.

## 2️⃣ API Verification
| Step | Endpoint | Role | Expected |
|------|-----------|------|-----------|
| 1 | GET /api/properties | all | Returns property list (paginated). |
| 2 | POST /api/properties | landlord | New property created (owner_id set). |
| 3 | GET /api/units?property_id=1 | all | Returns units for property 1. |
| 4 | PUT /api/units/:id | landlord | Rent updated in DB. |
| 5 | Unauthorized POST | tenant | HTTP 403. |
| 6 | DELETE /api/properties/:id | admin | Property and related units removed. |

## 3️⃣ SQL Validation
\`\`\`sql
SELECT COUNT(*) FROM properties;
SELECT COUNT(*) FROM units;
SELECT * FROM units WHERE property_id=1;
\`\`\`

## 4️⃣ Health Check
\`\`\`
curl http://127.0.0.1:3101/api/health
# → should include "properties" and "units" counts
\`\`\`

## ✅ Completion
- All CRUD operations verified via curl and SQL.
- Git tag applied: `S1-T2-complete`.
