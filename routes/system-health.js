// routes/system-health.js — baseline + S1-T6 linkage + financial counts
import express from "express";
import fs from "fs";
import path from "path";
import db from "../connector/db.mjs";

const router = express.Router();
const startTime = Date.now();
const VERSION = "0.3.4"; // incremented after S1-T6

// --- /api/health ------------------------------------------------------------
router.get("/health", (_req, res) => {
  const dbPath = process.env.DB_PATH || "data/dev/marketplace.dev.db";
  let connected = false;
  let migrationCount = 0;
  let entityCounts = { properties: 0, units: 0, leases: 0, payments: 0 };
  let paymentsLinkage = { linked: 0, unlinked: 0 };
  let invoicesIssued = 0;
  let receiptsLogged = 0;

  try {
    if (fs.existsSync(path.resolve(dbPath))) {
      connected = true;

      // --- Migration count
      const row = db.prepare(
        "SELECT COUNT(*) AS cnt FROM sqlite_master WHERE type='table' AND name='migrations'"
      ).get();
      if (row && row.cnt > 0) {
        const c = db.prepare("SELECT COUNT(*) AS m FROM migrations").get();
        migrationCount = c ? c.m : 0;
      }

      // --- Core entity counts
      const tables = db
        .prepare(
          "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('properties','units','leases','payments')"
        )
        .all()
        .map((r) => r.name);

      if (tables.includes("properties")) {
        const { count } = db.prepare("SELECT COUNT(*) AS count FROM properties").get();
        entityCounts.properties = count;
      }
      if (tables.includes("units")) {
        const { count } = db.prepare("SELECT COUNT(*) AS count FROM units").get();
        entityCounts.units = count;
      }
      if (tables.includes("leases")) {
        const { count } = db.prepare("SELECT COUNT(*) AS count FROM leases").get();
        entityCounts.leases = count;
      }
      if (tables.includes("payments")) {
        const { count } = db.prepare("SELECT COUNT(*) AS count FROM payments").get();
        entityCounts.payments = count;
      }

      // 🔹 S1-T5: linked/unlinked payments
      try {
        const link = db
          .prepare(
            "SELECT " +
            "SUM(CASE WHEN lease_id IS NOT NULL THEN 1 ELSE 0 END) AS linked, " +
            "SUM(CASE WHEN lease_id IS NULL THEN 1 ELSE 0 END) AS unlinked " +
            "FROM payments"
          )
          .get();
        if (link) paymentsLinkage = link;
      } catch (err) {
        console.error("[system-health:S1-T5]", err.message);
      }

      // 🔹 S1-T6: invoices & receipts counts
      try {
        const extraTables = db
          .prepare(
            "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('invoices','receipts')"
          )
          .all()
          .map((r) => r.name);

        if (extraTables.includes("invoices")) {
          const { count } = db.prepare("SELECT COUNT(*) AS count FROM invoices").get();
          invoicesIssued = count;
        }
        if (extraTables.includes("receipts")) {
          const { count } = db.prepare("SELECT COUNT(*) AS count FROM receipts").get();
          receiptsLogged = count;
        }
      } catch (err) {
        console.error("[system-health:S1-T6]", err.message);
      }
    }
  } catch (err) {
    console.error("DB health check error:", err.message);
  }

  res.json({
    ok: true,
    uptime: ((Date.now() - startTime) / 1000).toFixed(2) + "s",
    db: {
      connected,
      path: path.resolve(dbPath),
      migrations: migrationCount,
      entities: entityCounts,
      payments_linkage: paymentsLinkage,
      invoices_issued: invoicesIssued,
      receipts_logged: receiptsLogged,
    },
    version: VERSION,
  });
});

// --- /api/ping --------------------------------------------------------------
router.get("/ping", (_req, res) => {
  res.json({ ok: true, pong: true, timestamp: new Date().toISOString() });
});

// --- /api/version -----------------------------------------------------------
router.get("/version", (_req, res) => {
  res.json({
    ok: true,
    version: VERSION,
    started: new Date(startTime).toISOString(),
  });
});

export default router;
