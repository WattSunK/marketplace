﻿// /server.js — Tenant–Landlord Marketplace API
// ==================================================
// 🏠 Integrates role-based authorization (S0–S1)
// with persistent sessions, DB health reporting,
// and environment diagnostics.
// ==================================================

import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { logger, errorHandler } from "./middleware/logger.js";
import systemHealthRouter from "./routes/system-health.js";
import healthRouter from "./routes/health.js";          // Infrastructure-level health
import authRouter from "./routes/auth.js";
import usersRoutes from "./api/users/users.routes.js";
import propertiesRoutes from "./api/properties/properties.routes.js";

// === 🆕 S1-T3 New Routes (Leases + Payments) ===
import leasesRouter from "./routes/leases.js";
import paymentsRouter from "./routes/payments.js";

import { sessionMiddleware, attachUser } from "./connector/session.js";
import { requireAuth, requireRole, requireAnyRole } from "./middleware/auth.js";
import db from "./connector/db.mjs"; // For graceful shutdown close()

// --------------------------------------------------
// Env setup
// --------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

const PORT = process.env.PORT || 3101;
const NODE_ENV = process.env.NODE_ENV || "development";
const APP_VERSION = process.env.APP_VERSION || "S1-T3";

const app = express();

// ==================================================
// 1️⃣  Core Middlewares
// ==================================================
app.use(express.json());
app.use(logger);
app.use(sessionMiddleware);
app.use(attachUser);

// Optionally serve frontend (public folder)
app.use(express.static(path.join(__dirname, "public")));

// ==================================================
// 2️⃣  API Routes
// ==================================================

// 🔹 Application-level health (DB, entities, uptime)
app.use("/api", systemHealthRouter); // /api/health, /api/ping, /api/version

// 🔹 Infrastructure-level health (env vars, writable dirs)
app.use("/_ops/health", healthRouter); // /_ops/health

// 🔹 Auth + Core Business APIs
app.use("/api/auth", authRouter);            // /api/auth/login, /api/auth/signup
app.use("/api/users", usersRoutes);          // /api/users
app.use("/api/properties", propertiesRoutes); // /api/properties

// === 🆕 Mount S1-T3 Endpoints ===
app.use("/api/leases", leasesRouter);         // /api/leases
app.use("/api/payments", paymentsRouter);     // /api/payments

// --- Financial Layer Routes ---
import invoicesRouter from "./routes/invoices.js";
import receiptsRouter from "./routes/receipts.js";

app.use("/api/invoices", invoicesRouter);
app.use("/api/receipts", receiptsRouter);


// ==================================================
// 3️⃣  Role-Based Test Endpoints
// ==================================================
app.get("/api/protected", requireAuth, (req, res) =>
  res.json({ ok: true, user: req.user, message: "Authenticated access granted." })
);

app.get("/api/admin", requireRole("admin"), (req, res) =>
  res.json({ ok: true, message: "Welcome Admin", user: req.user })
);

app.get("/api/landlord", requireAnyRole(["landlord", "admin"]), (req, res) =>
  res.json({ ok: true, message: "Welcome Landlord/Admin", user: req.user })
);

app.get("/api/tenant", requireRole("tenant"), (req, res) =>
  res.json({ ok: true, message: "Welcome Tenant", user: req.user })
);

// ==================================================
// 4️⃣  Root & Error Handling
// ==================================================
app.get("/", (_req, res) => {
  res.json({
    ok: true,
    message: "Tenant–Landlord Marketplace API root",
    version: APP_VERSION,
    env: NODE_ENV,
    uptime: `${Math.floor(process.uptime())}s`,
  });
});

app.use((_req, res) => res.status(404).json({ ok: false, error: "Not found" }));
app.use(errorHandler);

// ==================================================
// 5️⃣  Startup & Graceful Shutdown
// ==================================================
const server = app.listen(PORT, () => {
  console.log(`✅ Marketplace API listening on ${PORT} [${NODE_ENV}]`);
});

["SIGTERM", "SIGINT"].forEach((sig) => {
  process.on(sig, () => {
    console.log(`🛑 Received ${sig}, closing DB and shutting down...`);
    try {
      db.close?.();
    } catch (err) {
      console.error("⚠️ Error closing DB:", err.message);
    }
    server.close(() => process.exit(0));
  });
});
