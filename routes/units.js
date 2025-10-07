import express from "express";
import db from "../connector/db.js";
import requireRole from "../middleware/requireRole.js";

const router = express.Router();

// GET /api/units
router.get("/", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const per = parseInt(req.query.per) || 10;
  const { property_id, status } = req.query;
  try {
    let sql = "SELECT u.*, p.name AS property_name FROM units u LEFT JOIN properties p ON u.property_id = p.id WHERE 1=1";
    const params = [];
    if (property_id) { sql += " AND u.property_id = ?"; params.push(property_id); }
    if (status) { sql += " AND u.status = ?"; params.push(status); }
    sql += " ORDER BY u.id DESC LIMIT ? OFFSET ?";
    params.push(per, (page - 1) * per);
    const rows = db.prepare(sql).all(...params);
    const count = db.prepare("SELECT COUNT(*) AS total FROM units").get().total;
    res.json({ success: true, data: rows, total: count, page, per });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/units/:id
router.get("/:id", (req, res) => {
  try {
    const row = db.prepare(
      "SELECT u.*, p.name AS property_name FROM units u LEFT JOIN properties p ON u.property_id = p.id WHERE u.id = ?"
    ).get(req.params.id);
    if (!row) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: row });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/units
router.post("/", requireRole(["landlord", "admin"]), (req, res) => {
  const { property_id, unit_number, rent_amount, status } = req.body;
  if (!property_id || !unit_number)
    return res.status(400).json({ success: false, error: "Missing required fields" });
  try {
    const stmt = db.prepare(
      "INSERT INTO units (property_id, unit_number, rent_amount, status, created_at) VALUES (?, ?, ?, ?, datetime('now'))"
    );
    const info = stmt.run(property_id, unit_number, rent_amount || 0, status || "available");
    res.json({ success: true, id: info.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/units/:id
router.put("/:id", requireRole(["landlord", "admin"]), (req, res) => {
  const { rent_amount, status } = req.body;
  try {
    const stmt = db.prepare("UPDATE units SET rent_amount = ?, status = ? WHERE id = ?");
    const info = stmt.run(rent_amount, status, req.params.id);
    res.json({ success: true, changes: info.changes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/units/:id
router.delete("/:id", requireRole(["admin"]), (req, res) => {
  try {
    const info = db.prepare("DELETE FROM units WHERE id = ?").run(req.params.id);
    res.json({ success: true, deleted: info.changes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
