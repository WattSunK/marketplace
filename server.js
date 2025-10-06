/**
 * Tenant–Landlord Marketplace — S0-T4 Feature-Level API Scaffolding (Hardened)
 * Unified Express entrypoint
 */

import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { logger, errorHandler } from "./middleware/logger.js";
import systemHealth from "./routes/system-health.js";

import usersRoutes from "./api/users/users.routes.js";
import propertiesRoutes from "./api/properties/properties.routes.js";
import leasesRoutes from "./api/leases/leases.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

const PORT = process.env.PORT || 3101;
const NODE_ENV = process.env.NODE_ENV || "development";

const app = express();
app.use(express.json());
app.use(logger);

app.use("/api", systemHealth);
app.use("/api/users", usersRoutes);
app.use("/api/properties", propertiesRoutes);
app.use("/api/leases", leasesRoutes);

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

app.use((_req, res) => res.status(404).json({ ok: false, error: "Not found" }));
app.use(errorHandler);

// --- startup ---------------------------------------------------------------
const server = app.listen(PORT, () => {
  console.log(`✅ Marketplace API listening on port ${PORT} [${NODE_ENV}]`);
});

// --- graceful error handling -----------------------------------------------
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
