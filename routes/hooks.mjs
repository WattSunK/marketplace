import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();
const LOG_PATH = path.resolve("logs/notifications.log");

router.post("/notify", (req, res) => {
  const payload = req.body || {};
  const entry = {
    timestamp: new Date().toISOString(),
    kind: payload.kind || "generic",
    to: payload.to || "unknown",
    message: payload.message || "No message",
  };
  fs.appendFileSync(LOG_PATH, JSON.stringify(entry) + "\n");
  res.json({ success: true, logged: entry });
});

export default router;
