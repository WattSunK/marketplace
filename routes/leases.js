import express from "express";
import db from "../connector/db.mjs";
import { requireRole, requireAnyRole } from "../middleware/auth.js";
const router = express.Router();

router.get("/", requireAnyRole(["admin", "landlord", "tenant"]), (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const per = parseInt(req.query.per) || 10;
  const role = req.user?.role;
  const userId = req.user?.id;
  const tenantId = req.query.tenant_id;
  try {
    let sql = `SELECT * FROM leases`;
    const params = [];
    if (role === "tenant") { sql += " WHERE tenant_id = ?"; params.push(userId); }
    else if (tenantId) { sql += " WHERE tenant_id = ?"; params.push(tenantId); }
    sql += " ORDER BY id DESC LIMIT ? OFFSET ?";
    params.push(per, (page - 1) * per);
    const data = db.prepare(sql).all(...params);
    res.json({ success: true, data, page, per });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.get("/:id", requireAnyRole(["admin", "landlord", "tenant"]), (req, res) => {
  try {
    const lease = db.prepare("SELECT * FROM leases WHERE id = ?").get(req.params.id);
    if (!lease) return res.status(404).json({ success: false, error: "Lease not found" });
    const payments = db.prepare("SELECT * FROM payments WHERE lease_id = ? ORDER BY id DESC").all(req.params.id);
    lease.payments = payments;
    const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    lease.balance = lease.rent_amount - totalPaid;
    res.json({ success: true, data: lease });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.post("/", requireAnyRole(["landlord", "admin"]), (req, res) => {
  const { tenant_id, property_id, unit_id, start_date, end_date, rent_amount, status } = req.body;
  try {
    const stmt = db.prepare(
      `INSERT INTO leases (tenant_id, property_id, unit_id, start_date, end_date, rent_amount, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );
    const result = stmt.run(tenant_id, property_id, unit_id, start_date, end_date, rent_amount, status || "active");
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.put("/:id", requireAnyRole(["landlord", "admin"]), (req, res) => {
  const { start_date, end_date, rent_amount, status } = req.body;
  try {
    const stmt = db.prepare(
      `UPDATE leases SET start_date=?, end_date=?, rent_amount=?, status=?, updated_at=datetime('now') WHERE id=?`
    );
    const result = stmt.run(start_date, end_date, rent_amount, status, req.params.id);
    res.json({ success: true, changes: result.changes });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.delete("/:id", requireRole("admin"), (req, res) => {
  try {
    const result = db.prepare("DELETE FROM leases WHERE id = ?").run(req.params.id);
    res.json({ success: true, deleted: result.changes });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

export default router;
