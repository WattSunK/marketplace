CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT CHECK(role IN ('admin','landlord','tenant')) NOT NULL DEFAULT 'tenant',
  phone TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT
);

-- seed default admin
INSERT INTO users (name, email, password, role, phone)
VALUES ('Admin', 'admin@example.com', 'Pass123', 'admin', '+254700000000');
