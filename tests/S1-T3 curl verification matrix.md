S1-T3 curl verification matrix
Each block can be executed exactly as-is from your NAS shell after your server is running on http://127.0.0.1:3101.

🧩 Environment Setup

Make sure you have 3 role cookies:

admin.jar
landlord.jar
tenant.jar


These should already exist from your /api/auth/login tests (created using -c cookie files).

🧪 A. Lease API Verification
#	Action	Command
1	List all leases (admin)	`curl -s -b admin.jar 127.0.0.1:3101/api/leases
2	List leases (tenant only theirs)	`curl -s -b tenant.jar 127.0.0.1:3101/api/leases
3	Create new lease (landlord)	```bash
curl -s -X POST -H "Content-Type: application/json" -b landlord.jar \		
-d '{"tenant_id":2,"property_id":1,"unit_id":1,"start_date":"2025-10-10","end_date":"2026-10-10","rent_amount":1200}' \		
127.0.0.1:3101/api/leases	jq .	
| 4 | **Fetch lease by ID** | `curl -s -b admin.jar 127.0.0.1:3101/api/leases/1 | jq .` |
| 5 | **Update lease (rent or status)** | ```bash
curl -s -X PUT -H "Content-Type: application/json" -b landlord.jar \
-d '{"rent_amount":1500,"status":"renewed"}' \
127.0.0.1:3101/api/leases/1 | jq .
``` |
| 6 | **Delete lease (admin-only)** | `curl -s -X DELETE -b admin.jar 127.0.0.1:3101/api/leases/1 | jq .` |

---

## 💰 **B. Payment API Verification**

| # | Action | Command |
|---|---------|----------|
| 1 | **List all payments (admin)** | `curl -s -b admin.jar 127.0.0.1:3101/api/payments | jq .` |
| 2 | **List tenant payments (filtered)** | `curl -s -b tenant.jar 127.0.0.1:3101/api/payments?lease_id=1 | jq .` |
| 3 | **Add payment (landlord)** | ```bash
curl -s -X POST -H "Content-Type: application/json" -b landlord.jar \
-d '{"lease_id":1,"amount":600,"method":"mpesa","note":"first half"}' \
127.0.0.1:3101/api/payments | jq .
``` |
| 4 | **Update payment record** | ```bash
curl -s -X PUT -H "Content-Type: application/json" -b landlord.jar \
-d '{"amount":650,"method":"bank"}' \
127.0.0.1:3101/api/payments/1 | jq .
``` |
| 5 | **Delete payment (admin-only)** | `curl -s -X DELETE -b admin.jar 127.0.0.1:3101/api/payments/1 | jq .` |

---

## 📊 **C. Balance & Linkage Validation**

| Test | Command | Expected |
|------|----------|----------|
| Check lease 1 with payments | `curl -s -b admin.jar 127.0.0.1:3101/api/leases/1 | jq .` | JSON includes `payments:[...]` and `balance` = `rent_amount - Σ(amount)` |
| Check health counts | `curl -s 127.0.0.1:3101/api/health | jq .` | Under `db.entities` → `leases > 0`, `payments > 0` |

---

## 🧾 **D. Error and Permission Tests**

| Scenario | Command | Expected |
|-----------|----------|----------|
| Tenant tries to POST lease | `curl -s -X POST -b tenant.jar 127.0.0.1:3101/api/leases -d '{}' | jq .` | 403 Forbidden |
| Landlord deletes payment | `curl -s -X DELETE -b landlord.jar 127.0.0.1:3101/api/payments/1 | jq .` | 403 Forbidden |
| Admin lists tenant leases (override) | `curl -s -b admin.jar 127.0.0.1:3101/api/leases?tenant_id=2 | jq .` | All leases for tenant 2 |

---

## 🧩 **E. SQL Spot-Checks**

```bash
sqlite3 data/dev/marketplace.dev.db "SELECT COUNT(*) FROM leases;"
sqlite3 data/dev/marketplace.dev.db "SELECT COUNT(*) FROM payments;"
sqlite3 data/dev/marketplace.dev.db "SELECT * FROM lease_balances LIMIT 5;"

✅ Expected Outcome Summary
Check	Pass Criteria
Lease creation works	New row in leases
Payment logs to correct lease	payments.lease_id matches
Lease → Payments linkage	/api/leases/:id embeds payments array
Balance calculation	Correct subtraction of total_paid
Role enforcement	Only allowed roles succeed
Health metrics	/api/health shows non-zero leases, payments

Would you like me to turn this verification matrix into an executable test script