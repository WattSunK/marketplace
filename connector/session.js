// /connector/session.js
// ==================================================
// 🔐 Session Connector
// --------------------------------------------------
// Centralizes session and user restoration logic.
// Works with express-session (cookie-based) or JWT.
// Ensures req.user is always populated for downstream
// middlewares like requireAuth / requireRole.
// ==================================================

import session from 'express-session';
import SQLiteStoreFactory from 'connect-sqlite3';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../connector/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Configuration constants ---
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev_secret';
const JWT_SECRET = process.env.JWT_SECRET || 'jwt_dev_secret';
const SQLiteStore = SQLiteStoreFactory(session);

const storePath = path.join(__dirname, '../data/dev/session.db');

// ==================================================
// 1️⃣  Express Session Setup
// ==================================================
export const sessionMiddleware = session({
  store: new SQLiteStore({ db: 'session.db', dir: path.dirname(storePath) }),
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    httpOnly: true,
  },
});

// ==================================================
// 2️⃣  JWT Decode Helper (for API token requests)
// ==================================================
function decodeJWT(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    console.warn('[session] Invalid or expired JWT token');
    return null;
  }
}

// ==================================================
// 3️⃣  Middleware: Restore user from session or JWT
// ==================================================
export async function attachUser(req, res, next) {
  try {
    // 1. Try from session
    if (req.session && req.session.user) {
      req.user = req.session.user;
      return next();
    }

    // 2. Try from Authorization: Bearer <token>
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = decodeJWT(token);
      if (decoded && decoded.email) {
        const user = db
          .prepare('SELECT id, name, email, role FROM users WHERE email = ?')
          .get(decoded.email);
        if (user) {
          req.user = user;
        }
      }
    }

    // 3. Continue regardless; downstream auth checks will enforce
    return next();
  } catch (err) {
    console.error('[session] attachUser failed:', err.message);
    return next();
  }
}

// ==================================================
// 4️⃣  Helper: Issue session or JWT on login
// ==================================================
export function startUserSession(req, res, user, useJWT = false) {
  if (useJWT) {
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    return res.json({ success: true, token, user });
  }

  // Session-based
  req.session.user = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
  return res.json({
    success: true,
    user: req.session.user,
  });
}

// ==================================================
// 5️⃣  Logout Helper
// ==================================================
export function destroyUserSession(req, res) {
  if (req.session) {
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      return res.json({ success: true, message: 'Session terminated' });
    });
  } else {
    res.json({ success: true });
  }
}

// ==================================================
// ✅ Example Integration in server.js
// --------------------------------------------------
// import express from 'express';
// import { sessionMiddleware, attachUser } from './connector/session.js';
// app.use(sessionMiddleware);
// app.use(attachUser);
// ==================================================
