#!/bin/bash
# scripts/migrate.sh
set -e
DB_PATH="/volume1/web/marketplace/data/dev/marketplace.dev.db"
echo "🚀 Applying S1-T1 migrations..."
sqlite3 "$DB_PATH" < scripts/sql/2025-10-08_create_entities.sql
if [ -f scripts/sql/2025-10-08_seed_entities.sql ]; then
  echo "🌱 Inserting seed data..."
  sqlite3 "$DB_PATH" < scripts/sql/2025-10-08_seed_entities.sql
fi
echo "✅ Migration complete."
