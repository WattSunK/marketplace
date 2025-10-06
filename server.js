/**
 * Tenant–Landlord Marketplace — S0-T3 API Bootstrap
 * Unified Express entrypoint
 */

import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { logger, errorHandler } from "./middleware/logger.js";
import systemHealth from "./routes/system-health.js";

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
app.use("/api", systemHealth);

// --- root redirect ----------------------------------------------------------
app.get("/", (_req, res) => {
  res.json({
    ok: true,
    message: "Tenant–Landlord Marketplace API root",
    endpoints: ["/api/health", "/api/ping", "/api/version"],
  });
});

// --- 404 + error handling ---------------------------------------------------
app.use((_req, res) => res.status(404).json({ ok: false, error: "Not found" }));
app.use(errorHandler);

// --- startup ---------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`✅ Marketplace API listening on port ${PORT} [${NODE_ENV}]`);
});
