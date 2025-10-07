# S1-T3 Test Plan — Lease & Payment Integration
1️⃣ Create users, property, and unit.
2️⃣ POST /api/leases → verify lease creation.
3️⃣ POST /api/payments → record payment.
4️⃣ GET /api/leases/:id → verify embedded payments & balance.
5️⃣ DELETE /api/leases/:id → confirm cascade.
6️⃣ Verify counts appear under /api/health.
