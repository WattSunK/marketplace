export const USER_SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT UNIQUE,
  role TEXT CHECK(role IN ('tenant','landlord','admin')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);`;
