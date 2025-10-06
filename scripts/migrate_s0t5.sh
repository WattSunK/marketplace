#!/bin/bash
set -e
DB_PATH="data/dev/marketplace.dev.db"
SQL_FILE="scripts/sql/2025-10-07_seed_data.sql"

echo "=== 🧱 Applying S0-T5 seed migration ==="
sqlite3 "$DB_PATH" < "$SQL_FILE"
echo "✅ Seed data inserted."
