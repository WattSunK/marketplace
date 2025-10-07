// routes/auth.js — Persistent Users in SQLite (S0-T8 → S0-T9)
// ------------------------------------------------------------
// Database-backed signup/login with Joi validation,
// password hashing, and Express-session persistence.

import express from "express";
import JoiPkg from "joi";
const Joi = JoiPkg.default || JoiPkg;

import { db } from "../connector/db.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { validateBody } from "../middleware/validate.js";

const router = express.Router();

// ------------------------------------------------------------
// Validation Schemas
// ------------------------------------------------------------
const signupSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("tenant", "landlord", "admin").default("tenant"),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// ------------------------------------------------------------
// POST /api/signup
// ------------------------------------------------------------
router.post("/signup", validateBody(signupSchema), async (req, res) => {
  try {
    const name = req.body.name.trim();
    const email = req.body.email.trim().toLowerCase();
    const { password, role } = req.body;

    // 1️⃣ Check for duplicate email
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existing) {
      return res.status(400).json({ success: false, error: "Email already exists" });
    }

    // 2️⃣ Hash password and insert new record
    const hashed = await hashPassword(password);
    const stmt = db.prepare(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)"
    );
    const result = stmt.run(name, email, hashed, role);

    // 3️⃣ Save minimal user info in session
    req.session.user = { id: result.lastInsertRowid, name, email, role };
    return res.json({ success: true, message: "User created", user: req.session.user });
  } catch (err) {
    console.error("[signup]", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// ------------------------------------------------------------
// POST /api/login
// ------------------------------------------------------------
router.post("/login", validateBody(loginSchema), async (req, res) => {
  try {
    const email = req.body.email.trim().toLowerCase();
    const password = req.body.password;

    // 1️⃣ Look up user
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user) {
      req.session.user = null;
      return res.status(400).json({ success: false, error: "Invalid email or password" });
    }

    // 2️⃣ Verify password
    const match = await verifyPassword(password, user.password_hash);
    if (!match) {
      req.session.user = null;
      return res.status(400).json({ success: false, error: "Invalid email or password" });
    }

    // 3️⃣ Store minimal identity in session
    req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role };
    return res.json({ success: true, user: req.session.user });
  } catch (err) {
    console.error("[login]", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// ------------------------------------------------------------
// GET /api/_whoami
// ------------------------------------------------------------
router.get("/_whoami", (req, res) => {
  if (req.session?.user) {
    res.json({ success: true, user: req.session.user });
  } else {
    res.json({ success: false, user: null });
  }
});

// ------------------------------------------------------------
// POST /api/logout
// ------------------------------------------------------------
router.post("/logout", (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

export default router;
