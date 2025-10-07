import express from "express";
import db from "../connector/db.mjs";
import { requireRole, requireAnyRole } from "../middleware/auth.js";
const router = express.Router();

router.get("/", requireAnyRole(["admin", "landlord", "tenant"]), (req, res) => {
  const leaseId = req.query.lease_id;
  const role = req.user?.role;
  const userId = req.user?.id;
  try {
    let sql = "SELECT p.* FROM payments p JOIN leases l ON p.lease_id = l.id";
    const params = [];
    if (role === "tenant") { sql += " WHERE l.tenant_id = ?"; params.push(userId); }
    else if (leaseId) { sql += " WHERE p.lease_id = ?"; params.push(leaseId); }
    sql += " ORDER BY p.id DESC";
    const data = db.prepare(sql).all(...params);
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.post("/", requireAnyRole(["landlord", "admin"]), (req, res) => {
  const { lease_id, amount, method, note } = req.body;
  try {
    const stmt = db.prepare("INSERT INTO payments (lease_id, amount, method, note) VALUES (?, ?, ?, ?)");
    const result = stmt.run(lease_id, amount, method || "cash", note || "");
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.put("/:id", requireAnyRole(["landlord", "admin"]), (req, res) => {
  const { amount, method, note } = req.body;
  try {
    const stmt = db.prepare("UPDATE payments SET amount=?, method=?, note=? WHERE id=?");
    const result = stmt.run(amount, method, note, req.params.id);
    res.json({ success: true, changes: result.changes });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.delete("/:id", requireRole("admin"), (req, res) => {
  try {
    const result = db.prepare("DELETE FROM payments WHERE id = ?").run(req.params.id);
    res.json({ success: true, deleted: result.changes });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

export default router;
