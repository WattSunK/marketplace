/**
 * Tenant–Landlord Marketplace — S0-T4 Feature-Level API Scaffolding
 * Unified Express entrypoint
 */

import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { logger, errorHandler } from "./middleware/logger.js";
import systemHealth from "./routes/system-health.js";

// === NEW: domain feature routes (S0-T4) ====================================
import usersRoutes from "./api/users/users.routes.js";
import propertiesRoutes from "./api/properties/properties.routes.js";
import leasesRoutes from "./api/leases/leases.routes.js";

// --- resolve paths ----------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

// --- environment ------------------------------------------------------------
const PORT = process.env.PORT || 3101;
const NODE_ENV = process.env.NODE_ENV || "development";

// --- express app ------------------------------------------------------------
const app = express();
app.use(express.json());
app.use(logger);

// --- mount routes -----------------------------------------------------------
// system health / base
app.use("/api", systemHealth);

// === NEW: feature-level domain endpoints ===================================
app.use("/api/users", usersRoutes);
app.use("/api/properties", propertiesRoutes);
app.use("/api/leases", leasesRoutes);

// --- root redirect ----------------------------------------------------------
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
    ],
  });
});

// --- 404 + error handling ---------------------------------------------------
app.use((_req, res) => res.status(404).json({ ok: false, error: "Not found" }));
app.use(errorHandler);

// --- startup ---------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`✅ Marketplace API listening on port ${PORT} [${NODE_ENV}]`);
});
