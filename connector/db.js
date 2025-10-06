// db.js — Revision B using better-sqlite3 (sync, dev-friendly)
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const DB_PATH = process.env.DB_PATH || path.resolve("data/dev/marketplace.dev.db");
const MIGRATIONS_DIR = process.env.MIGRATIONS_DIR || "scripts/sql";

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH, { verbose: console.log });
db.pragma("foreign_keys = ON");

console.log(`✅ Database ready at ${DB_PATH}`);

export { db, DB_PATH, MIGRATIONS_DIR };
