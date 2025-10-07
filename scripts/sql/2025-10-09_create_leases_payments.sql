CREATE TABLE IF NOT EXISTS leases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL REFERENCES users(id),
  property_id INTEGER NOT NULL REFERENCES properties(id),
  unit_id INTEGER NOT NULL REFERENCES units(id),
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  rent_amount REAL NOT NULL CHECK(rent_amount >= 0),
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lease_id INTEGER NOT NULL REFERENCES leases(id),
  payment_date TEXT NOT NULL DEFAULT (datetime('now')),
  amount REAL NOT NULL CHECK(amount >= 0),
  method TEXT DEFAULT 'cash',
  note TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE VIEW IF NOT EXISTS lease_balances AS
SELECT l.id AS lease_id,
       l.tenant_id,
       l.property_id,
       l.unit_id,
       l.rent_amount,
       COALESCE(SUM(p.amount), 0) AS total_paid,
       (l.rent_amount - COALESCE(SUM(p.amount), 0)) AS balance
FROM leases l
LEFT JOIN payments p ON l.id = p.lease_id
GROUP BY l.id;
