import express from "express";
import db from "../connector/db.js";
const router = express.Router();

router.post("/", (req, res) => {
  const { provider, type, status = "inactive", api_key = null } = req.body;
  if (!provider || !type)
    return res.status(400).json({ success: false, message: "Missing provider or type" });
  const stmt = db.prepare("INSERT INTO integrations (provider, type, status, api_key) VALUES (?, ?, ?, ?)");
  const info = stmt.run(provider, type, status, api_key);
  res.json({ success: true, id: info.lastInsertRowid });
});

router.get("/", (req, res) => {
  const rows = db.prepare("SELECT * FROM integrations ORDER BY id DESC").all();
  res.json({ success: true, count: rows.length, data: rows });
});

export default router;
