// routes/receipts.js — S1-T6 full CRUD
import express from "express";
import db from "../connector/db.mjs";
import { randomUUID } from "crypto";

const router = express.Router();

router.post("/", (req, res) => {
  try {
    const { invoice_id, payment_id, amount_cents } = req.body;
    const receipt_number = "RCPT-" + randomUUID().slice(0, 8).toUpperCase();
    const stmt = db.prepare(`
      INSERT INTO receipts (invoice_id, payment_id, amount_cents, receipt_number)
      VALUES (?, ?, ?, ?)
    `);
    const info = stmt.run(invoice_id, payment_id, amount_cents, receipt_number);
    db.prepare("UPDATE invoices SET status='Paid' WHERE id = ?").run(invoice_id);
    const receipt = db.prepare("SELECT * FROM receipts WHERE id = ?").get(info.lastInsertRowid);
    res.json({ success: true, data: receipt });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/", (req, res) => {
  try {
    const { invoice_id, payment_id } = req.query;
    let sql = `
      SELECT r.*, i.lease_id, p.method AS payment_method
      FROM receipts r
      LEFT JOIN invoices i ON r.invoice_id = i.id
      LEFT JOIN payments p ON r.payment_id = p.id
      WHERE 1=1
    `;
    const params = [];
    if (invoice_id) { sql += " AND r.invoice_id = ?"; params.push(invoice_id); }
    if (payment_id) { sql += " AND r.payment_id = ?"; params.push(payment_id); }
    const data = db.prepare(sql).all(...params);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/:id", (req, res) => {
  try {
    const receipt = db.prepare(`
      SELECT r.*, i.lease_id, p.method AS payment_method
      FROM receipts r
      LEFT JOIN invoices i ON r.invoice_id = i.id
      LEFT JOIN payments p ON r.payment_id = p.id
      WHERE r.id = ?
    `).get(req.params.id);
    if (!receipt) return res.status(404).json({ success: false, error: "Receipt not found" });
    res.json({ success: true, data: receipt });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put("/:id", (req, res) => {
  try {
    const { amount_cents } = req.body;
    const stmt = db.prepare(`UPDATE receipts SET amount_cents = COALESCE(?, amount_cents) WHERE id = ?`);
    stmt.run(amount_cents, req.params.id);
    const updated = db.prepare("SELECT * FROM receipts WHERE id = ?").get(req.params.id);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/:id", (req, res) => {
  try {
    const info = db.prepare("DELETE FROM receipts WHERE id = ?").run(req.params.id);
    res.json({ success: true, deleted: info.changes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
