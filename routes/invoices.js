// routes/invoices.js — S1-T6 full CRUD
import express from "express";
import db from "../connector/db.mjs";

const router = express.Router();

router.post("/", (req, res) => {
  try {
    const { lease_id, period_start, period_end, amount_cents, status } = req.body;
    const stmt = db.prepare(`
      INSERT INTO invoices (lease_id, period_start, period_end, amount_cents, status)
      VALUES (?, ?, ?, ?, ?)
    `);
    const info = stmt.run(lease_id, period_start, period_end, amount_cents, status || "Unpaid");
    const invoice = db.prepare("SELECT * FROM invoices WHERE id = ?").get(info.lastInsertRowid);
    res.json({ success: true, data: invoice });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/", (req, res) => {
  try {
    const { lease_id, status } = req.query;
    let sql = `
      SELECT i.*, l.tenant_name, l.unit_id
      FROM invoices i
      JOIN leases l ON i.lease_id = l.id
      WHERE 1=1
    `;
    const params = [];
    if (lease_id) { sql += " AND i.lease_id = ?"; params.push(lease_id); }
    if (status) { sql += " AND i.status = ?"; params.push(status); }
    const data = db.prepare(sql).all(...params);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/:id", (req, res) => {
  try {
    const invoice = db.prepare(`
      SELECT i.*, l.tenant_name, l.unit_id
      FROM invoices i
      LEFT JOIN leases l ON i.lease_id = l.id
      WHERE i.id = ?
    `).get(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, error: "Invoice not found" });
    res.json({ success: true, data: invoice });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put("/:id", (req, res) => {
  try {
    const { period_start, period_end, amount_cents, status } = req.body;
    const stmt = db.prepare(`
      UPDATE invoices
      SET period_start = COALESCE(?, period_start),
          period_end = COALESCE(?, period_end),
          amount_cents = COALESCE(?, amount_cents),
          status = COALESCE(?, status)
      WHERE id = ?
    `);
    stmt.run(period_start, period_end, amount_cents, status, req.params.id);
    const updated = db.prepare("SELECT * FROM invoices WHERE id = ?").get(req.params.id);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/:id", (req, res) => {
  try {
    const info = db.prepare("DELETE FROM invoices WHERE id = ?").run(req.params.id);
    res.json({ success: true, deleted: info.changes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
