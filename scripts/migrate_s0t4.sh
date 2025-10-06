#!/bin/bash
set -e
DB_PATH="data/dev/marketplace.dev.db"
SQL_FILE="scripts/sql/2025-10-06_create_s0t4_base_tables.sql"

echo "=== 🧱 Applying S0-T4 base table migration ==="
if [ ! -f "$DB_PATH" ]; then
  echo "❌ DB not found at $DB_PATH"; exit 1
fi

sqlite3 "$DB_PATH" < "$SQL_FILE"
echo "✅ Migration complete: users, properties, leases"
