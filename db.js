import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";

const dbPath = path.resolve("data/dev/marketplace.dev.db");

const db = await open({
  filename: dbPath,
  driver: sqlite3.Database,
});

export default db;
