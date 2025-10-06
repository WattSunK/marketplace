// routes: /api/leases
import express from "express";
const router = express.Router();

let leases = [
  { id: 1, tenantId: 1, propertyId: 1, startDate: "2025-01-01", endDate: "2025-12-31" }
];

router.get("/", (req, res) => res.json(leases));

router.get("/:id", (req, res) => {
  const lease = leases.find(l => l.id === Number(req.params.id));
  if (!lease) return res.status(404).json({ error: "Lease not found" });
  res.json(lease);
});

export default router;
