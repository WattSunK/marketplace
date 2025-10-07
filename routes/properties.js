import express from "express";
import db from "../connector/db.js";
import requireRole from "../middleware/requireRole.js";

const router = express.Router();

// GET /api/properties?page=&per=
router.get("/", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const per = parseInt(req.query.per) || 10;
  try {
    const rows = db
      .prepare("SELECT * FROM properties ORDER BY id DESC LIMIT ? OFFSET ?")
      .all(per, (page - 1) * per);
    const count = db.prepare("SELECT COUNT(*) AS total FROM properties").get().total;
    res.json({ success: true, data: rows, total: count, page, per });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/properties/:id
router.get("/:id", (req, res) => {
  try {
    const property = db.prepare("SELECT * FROM properties WHERE id = ?").get(req.params.id);
    if (!property)
      return res.status(404).json({ success: false, error: "Not found" });
    const units = db.prepare("SELECT * FROM units WHERE property_id = ?").all(req.params.id);
    res.json({ success: true, property, units });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/properties
router.post("/", requireRole(["landlord", "admin"]), (req, res) => {
  const { name, address } = req.body;
  const userId = req.user?.id;
  if (!name || !address)
    return res.status(400).json({ success: false, error: "Missing fields" });
  try {
    const stmt = db.prepare(
      "INSERT INTO properties (name, address, owner_id, created_at) VALUES (?, ?, ?, datetime('now'))"
    );
    const info = stmt.run(name, address, userId);
    res.json({ success: true, id: info.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/properties/:id
router.put("/:id", requireRole(["landlord", "admin"]), (req, res) => {
  const { name, address } = req.body;
  try {
    const stmt = db.prepare("UPDATE properties SET name = ?, address = ? WHERE id = ?");
    const info = stmt.run(name, address, req.params.id);
    res.json({ success: true, changes: info.changes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/properties/:id
router.delete("/:id", requireRole(["admin"]), (req, res) => {
  try {
    db.prepare("DELETE FROM units WHERE property_id = ?").run(req.params.id);
    const info = db.prepare("DELETE FROM properties WHERE id = ?").run(req.params.id);
    res.json({ success: true, deleted: info.changes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
