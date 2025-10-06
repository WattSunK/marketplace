export const LEASE_SCHEMA = `
CREATE TABLE IF NOT EXISTS leases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER,
  property_id INTEGER,
  start_date DATE,
  end_date DATE,
  rent_amount INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);`;
