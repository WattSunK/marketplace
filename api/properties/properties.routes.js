import express from "express";
import db from "../../db.js";
const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const rows = await db.all("SELECT * FROM properties ORDER BY id DESC");
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/", async (req, res) => {
  const { name, address, landlord_id } = req.body;
  try {
    const stmt = await db.run(
      "INSERT INTO properties (name, address, landlord_id) VALUES (?, ?, ?)",
      [name, address, landlord_id]
    );
    res.status(201).json({ success: true, id: stmt.lastID });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
