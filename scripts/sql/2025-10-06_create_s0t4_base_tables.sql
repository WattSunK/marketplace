PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT UNIQUE,
  role TEXT CHECK(role IN ('tenant','landlord','admin')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS properties (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  address TEXT,
  landlord_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER,
  property_id INTEGER,
  start_date DATE,
  end_date DATE,
  rent_amount INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
