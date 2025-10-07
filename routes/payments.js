// routes/payments.js — aligned with actual payments schema

import express from "express";
import db from "../connector/db.mjs";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

// 🧱 GET all payments
router.get("/", requireRole(["admin", "landlord", "tenant"]), (req, res) => {
  try {
    const payments = db
      .prepare(`SELECT * FROM payments ORDER BY id DESC`)
      .all();
    res.json({ success: true, data: payments });
  } catch (err) {
    console.error("[payments:list]", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 🧱 CREATE payment
router.post("/", requireRole(["admin", "landlord"]), (req, res) => {
  try {
    const { lease_id, amount, method } = req.body;
    if (!lease_id || !amount)
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields" });

    const stmt = db.prepare(
      `INSERT INTO payments (lease_id, amount_cents, method)
       VALUES (?, ?, ?)`
    );
    const result = stmt.run(lease_id, amount * 100, method || "Cash");
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    console.error("[payments:create]", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 🧱 UPDATE payment
router.put("/:id", requireRole(["admin", "landlord"]), (req, res) => {
  try {
    const { amount, method } = req.body;
    const stmt = db.prepare(
      `UPDATE payments SET 
         amount_cents = COALESCE(?, amount_cents),
         method = COALESCE(?, method)
       WHERE id = ?`
    );
    const result = stmt.run(amount ? amount * 100 : null, method, req.params.id);
    res.json({ success: true, changes: result.changes });
  } catch (err) {
    console.error("[payments:update]", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
