-- 2025-10-08_create_entities.sql
-- Tenant–Landlord Marketplace | S1-T1: Entity Schema Expansion
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS properties (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  owner_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS units (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  property_id INTEGER NOT NULL,
  unit_number TEXT NOT NULL,
  rent_amount INTEGER NOT NULL,
  status TEXT DEFAULT 'Available',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS leases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  unit_id INTEGER NOT NULL,
  tenant_id INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  rent_cents INTEGER NOT NULL,
  status TEXT DEFAULT 'Active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE,
  FOREIGN KEY (tenant_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lease_id INTEGER NOT NULL,
  amount_cents INTEGER NOT NULL,
  method TEXT DEFAULT 'Cash',
  paid_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lease_id) REFERENCES leases(id) ON DELETE CASCADE
);
INSERT INTO migrations (name, applied_at)
SELECT '2025-10-08_create_entities.sql', datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM migrations WHERE name='2025-10-08_create_entities.sql');
