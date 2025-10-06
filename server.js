/**
 * Tenant–Landlord Marketplace — S0-T6 Auth Integration
 * Unified Express entrypoint (with session + validation)
 */

import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { logger, errorHandler } from "./middleware/logger.js";
import systemHealth from "./routes/system-health.js";

import usersRoutes from "./api/users/users.routes.js";
import propertiesRoutes from "./api/properties/properties.routes.js";
import leasesRoutes from "./api/leases/leases.routes.js";
import authRoutes from "./routes/auth.js"; // ✅ Added for S0-T6

// ---------------------------------------------------------------------------
// Env + app setup
// ---------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

const PORT = process.env.PORT || 3101;
const NODE_ENV = process.env.NODE_ENV || "development";

const app = express();

// JSON + logging middleware
app.use(express.json());
app.use(logger);

// ✅ Session middleware (required for cookie-based auth)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "change_me",
    resave: false,
    saveUninitialized: false,
  })
);

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.use("/api", systemHealth);
app.use("/api/users", usersRoutes);
app.use("/api/properties", propertiesRoutes);
app.use("/api/leases", leasesRoutes);
app.use("/api", authRoutes); // ✅ Mount Auth endpoints: signup/login/logout/whoami

// Root endpoint
app.get("/", (_req, res) => {
  res.json({
    ok: true,
    message: "Tenant–Landlord Marketplace API root",
    endpoints: [
      "/api/health",
      "/api/ping",
      "/api/version",
      "/api/users",
      "/api/properties",
      "/api/leases",
      "/api/signup",
      "/api/login",
      "/api/_whoami",
      "/api/logout",
    ],
  });
});

// 404 + error handler
app.use((_req, res) => res.status(404).json({ ok: false, error: "Not found" }));
app.use(errorHandler);

// ---------------------------------------------------------------------------
// Startup
// ---------------------------------------------------------------------------
const server = app.listen(PORT, () => {
  console.log(`✅ Marketplace API listening on port ${PORT} [${NODE_ENV}]`);
});

// Graceful shutdown handlers
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} is already in use. Aborting startup.`);
    process.exit(1);
  } else {
    console.error("❌ Server startup error:", err);
    process.exit(1);
  }
});

process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down server...");
  server.close(() => {
    console.log("✅ Server stopped gracefully.");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down server...");
  server.close(() => {
    console.log("✅ Server stopped gracefully.");
    process.exit(0);
  });
});
