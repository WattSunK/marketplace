import express from "express";
import session from "express-session";
import SQLiteStoreFactory from "connect-sqlite3";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { logger, errorHandler } from "./middleware/logger.js";
import systemHealth from "./routes/system-health.js";
import usersRoutes from "./api/users/users.routes.js";
import propertiesRoutes from "./api/properties/properties.routes.js";
import leasesRoutes from "./api/leases/leases.routes.js";
import authRoutes from "./routes/auth.js";
import { requireRole } from "./middleware/requireRole.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

const PORT = process.env.PORT || 3101;
const NODE_ENV = process.env.NODE_ENV || "development";
const app = express();
app.use(express.json());
app.use(logger);

const SQLiteStore = SQLiteStoreFactory(session);
app.use(session({
  store: new SQLiteStore({
    db:"sessions.db",
    dir: path.join(__dirname,"data/dev"),
  }),
  secret: process.env.SESSION_SECRET || "marketplace-dev-secret",
  resave:false,
  saveUninitialized:false,
  cookie:{ maxAge:86400000,sameSite:"lax" }
}));

app.use("/api", systemHealth);
app.use("/api/users", usersRoutes);
app.use("/api/properties", propertiesRoutes);
app.use("/api/leases", leasesRoutes);
app.use("/api", authRoutes);

app.use("/api/admin", requireRole("admin"), (req,res)=>res.json({ok:true,message:"Welcome Admin"}));
app.use("/api/landlord", requireRole("landlord"), (req,res)=>res.json({ok:true,message:"Welcome Landlord"}));
app.use("/api/tenant", requireRole("tenant"), (req,res)=>res.json({ok:true,message:"Welcome Tenant"}));

app.get("/", (_req,res)=>res.json({ ok:true, message:"Tenant–Landlord Marketplace API root" }));
app.use((_req,res)=>res.status(404).json({ ok:false, error:"Not found" }));
app.use(errorHandler);

const server = app.listen(PORT,()=>console.log(`✅ Marketplace API listening on ${PORT} [${NODE_ENV}]`));
["SIGTERM","SIGINT"].forEach(sig=>{
  process.on(sig,()=>{
    console.log(`🛑 Received ${sig}, shutting down...`);
    server.close(()=>process.exit(0));
  });
});
