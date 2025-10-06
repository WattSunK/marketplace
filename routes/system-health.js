/**
 * routes/system-health.js
 * Implements /api/health, /api/ping, /api/version
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
const VERSION = "0.3.0";

// --- /api/health ------------------------------------------------------------
router.get("/health", (_req, res) => {
  const dbPath = process.env.DB_PATH || "data/dev/marketplace.dev.db";
  let connected = false;
  let migrationCount = 0;

  try {
    if (fs.existsSync(path.resolve(dbPath))) {
      connected = true;
      const row = db
        .prepare(
          "SELECT COUNT(*) AS cnt FROM sqlite_master WHERE type='table' AND name='migrations'"
        )
        .get();
      if (row && row.cnt > 0) {
        const c = db.prepare("SELECT COUNT(*) AS m FROM migrations").get();
        migrationCount = c ? c.m : 0;
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
    },
  });
});

// --- /api/ping --------------------------------------------------------------
router.get("/ping", (_req, res) => {
  res.json({ ok: true, pong: true, timestamp: new Date().toISOString() });
});

// --- /api/version -----------------------------------------------------------
router.get("/version", (_req, res) => {
  res.json({ ok: true, version: VERSION, started: new Date(startTime).toISOString() });
});

export default router;
