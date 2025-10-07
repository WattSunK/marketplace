// routes/leases.js — aligned with actual leases schema, S1-T4 property joins

import express from "express";
import db from "../connector/db.mjs";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

// 🧱 GET all leases (paginated, enriched with property info)
router.get("/", requireRole(["admin", "landlord", "tenant"]), (req, res) => {
  try {
    const page = parseInt(req.query.page || "1");
    const per = parseInt(req.query.per || "10");
    const offset = (page - 1) * per;

    const leases = db
      .prepare(
        `SELECT l.*, 
                p.name AS property_name, 
                p.address AS property_address
         FROM leases l
         LEFT JOIN properties p ON p.id = l.property_id
         WHERE 1=1
         ${req.query.property_id ? "AND l.property_id = @property_id" : ""}
         ORDER BY l.id DESC
         LIMIT @per OFFSET @offset`
      )
      .all({
        property_id: req.query.property_id,
        per,
        offset,
      });

    res.json({ success: true, data: leases, page, per });
  } catch (err) {
    console.error("[leases:list]", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 🧱 GET single lease by ID (joined with property)
router.get("/:id", requireRole(["admin", "landlord", "tenant"]), (req, res) => {
  try {
    const lease = db
      .prepare(
        `SELECT l.*, 
                p.name AS property_name, 
                p.address AS property_address
         FROM leases l
         LEFT JOIN properties p ON p.id = l.property_id
         WHERE l.id = ?`
      )
      .get(req.params.id);

    if (!lease)
      return res.status(404).json({ success: false, error: "Lease not found" });

    const payments = db
      .prepare(`SELECT * FROM payments WHERE lease_id = ?`)
      .all(req.params.id);
    lease.payments = payments;

    res.json({ success: true, data: lease });
  } catch (err) {
    console.error("[leases:get]", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 🧱 CREATE lease (auto-links property_id from unit)
router.post("/", requireRole(["admin", "landlord"]), (req, res) => {
  try {
    const { unit_id, tenant_id, start_date, end_date, rent_amount, status } =
      req.body;

    if (!unit_id || !tenant_id || !start_date || !end_date || !rent_amount)
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields" });

    // Derive property_id from the selected unit
    const unit = db.prepare("SELECT property_id FROM units WHERE id = ?").get(unit_id);
    const property_id = unit ? unit.property_id : null;

    const stmt = db.prepare(
      `INSERT INTO leases (unit_id, property_id, tenant_id, start_date, end_date, rent_cents, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );
    const result = stmt.run(
      unit_id,
      property_id,
      tenant_id,
      start_date,
      end_date,
      rent_amount * 100,
      status || "Active"
    );

    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    console.error("[leases:create]", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 🧱 UPDATE lease (unchanged)
router.put("/:id", requireRole(["admin", "landlord"]), (req, res) => {
  try {
    const { start_date, end_date, rent_amount, status } = req.body;

    const stmt = db.prepare(
      `UPDATE leases SET 
         start_date = COALESCE(?, start_date),
         end_date   = COALESCE(?, end_date),
         rent_cents = COALESCE(?, rent_cents),
         status     = COALESCE(?, status)
       WHERE id = ?`
    );

    const result = stmt.run(
      start_date,
      end_date,
      rent_amount ? rent_amount * 100 : null,
      status,
      req.params.id
    );

    res.json({ success: true, changes: result.changes });
  } catch (err) {
    console.error("[leases:update]", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
