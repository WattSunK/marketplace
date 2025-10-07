/**
 * routes/system-health.js
 * Implements /api/health, /api/ping, /api/version
 * Extended in S1-T2 to include Property & Unit entity counts
 */

import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import db from "../connector/db.mjs";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const startTime = Date.now();
const VERSION = "0.3.1"; // Incremented after S1-T2 integration

// --- /api/health ------------------------------------------------------------
router.get("/health", (_req, res) => {
  const dbPath = process.env.DB_PATH || "data/dev/marketplace.dev.db";
  let connected = false;
  let migrationCount = 0;
  let entityCounts = { properties: 0, units: 0 };

  try {
    if (fs.existsSync(path.resolve(dbPath))) {
      connected = true;

      // --- Migrations count ---
      const row = db
        .prepare(
          "SELECT COUNT(*) AS cnt FROM sqlite_master WHERE type='table' AND name='migrations'"
        )
        .get();
      if (row && row.cnt > 0) {
        const c = db.prepare("SELECT COUNT(*) AS m FROM migrations").get();
        migrationCount = c ? c.m : 0;
      }

      // --- Entity counts (S1-T3) ---
      const tables = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('properties','units','leases','payments')"
      )
      .all()
      .map((r) => r.name);


      if (tables.includes("properties")) {
        const { count } = db
          .prepare("SELECT COUNT(*) AS count FROM properties")
          .get();
        entityCounts.properties = count;
      }

      if (tables.includes("units")) {
  const { count } = db
    .prepare("SELECT COUNT(*) AS count FROM units")
    .get();
  entityCounts.units = count;
}

if (tables.includes("leases")) {
  const { count } = db
    .prepare("SELECT COUNT(*) AS count FROM leases")
    .get();
  entityCounts.leases = count;
}

if (tables.includes("payments")) {
  const { count } = db
    .prepare("SELECT COUNT(*) AS count FROM payments")
    .get();
  entityCounts.payments = count;
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
    },
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
