// /server.js
// ==================================================
// 🏠 Tenant–Landlord Marketplace Server
// --------------------------------------------------
// Integrates role-based authorization (S0-T9)
// with persistent sessions and route protection.
// ==================================================

import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { logger, errorHandler } from "./middleware/logger.js";
import systemHealth from "./routes/system-health.js";
import usersRoutes from "./api/users/users.routes.js";
import propertiesRoutes from "./api/properties/properties.routes.js";
import leasesRoutes from "./api/leases/leases.routes.js";
import authRoutes from "./routes/auth.js";

// 🧩 NEW imports
import { sessionMiddleware, attachUser } from "./connector/session.js";
import { requireAuth, requireRole, requireAnyRole } from "./middleware/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

const PORT = process.env.PORT || 3101;
const NODE_ENV = process.env.NODE_ENV || "development";
const app = express();

// ==================================================
// 1️⃣  Core Middlewares
// ==================================================
app.use(express.json());
app.use(logger);

// --- Session + User Attach (from connector/session.js)
app.use(sessionMiddleware);
app.use(attachUser);

// ==================================================
// 2️⃣  API Routes
// ==================================================
app.use("/api", systemHealth);
app.use("/api", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/properties", propertiesRoutes);
app.use("/api/leases", leasesRoutes);

// ==================================================
// 3️⃣  Role-Based Test Endpoints
// --------------------------------------------------
// These confirm middleware and role segregation work.
// ==================================================
app.get("/api/protected", requireAuth, (req, res) => {
  res.json({ ok: true, user: req.user, message: "Authenticated access granted." });
});

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
app.get("/", (_req, res) =>
  res.json({ ok: true, message: "Tenant–Landlord Marketplace API root" })
);

app.use((_req, res) => res.status(404).json({ ok: false, error: "Not found" }));
app.use(errorHandler);

// ==================================================
// 5️⃣  Startup & Graceful Shutdown
// ==================================================
const server = app.listen(PORT, () =>
  console.log(`✅ Marketplace API listening on ${PORT} [${NODE_ENV}]`)
);

["SIGTERM", "SIGINT"].forEach((sig) => {
  process.on(sig, () => {
    console.log(`🛑 Received ${sig}, shutting down...`);
    server.close(() => process.exit(0));
  });
});
