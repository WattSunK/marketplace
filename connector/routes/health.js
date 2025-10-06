// routes/health.js
import express from "express";
import { db } from "../db.js";

const router = express.Router();

router.get("/", (req, res) => {
  try {
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")
      .all()
      .map(t => t.name);

    let migrations = [];
    try {
      migrations = db
        .prepare("SELECT id, filename, applied_at FROM migrations ORDER BY id;")
        .all();
    } catch {
      // migrations table not yet created
    }

    res.json({
      ok: true,
      uptime: `${Math.round(process.uptime())}s`,
      db: { connected: true, tables, migrations },
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
