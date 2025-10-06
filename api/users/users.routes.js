import express from "express";
import db from "../../db.js";
const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const rows = await db.all("SELECT * FROM users ORDER BY id DESC");
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/", async (req, res) => {
  const { name, email, role } = req.body;
  try {
    const stmt = await db.run(
      "INSERT INTO users (name, email, role) VALUES (?, ?, ?)",
      [name, email, role]
    );
    res.status(201).json({ success: true, id: stmt.lastID });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;
  try {
    const stmt = await db.run(
      "UPDATE users SET name=?, email=?, role=? WHERE id=?",
      [name, email, role, id]
    );
    res.json({ success: stmt.changes > 0 });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const stmt = await db.run("DELETE FROM users WHERE id=?", [req.params.id]);
    res.json({ success: stmt.changes > 0 });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
