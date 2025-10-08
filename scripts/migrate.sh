#!/bin/bash
# scripts/migrate.sh — extended for S1-T6
set -e

DB_PATH="/volume1/web/marketplace/data/dev/marketplace.dev.db"

echo "🚀 Applying S1-T1 baseline migrations..."
sqlite3 "$DB_PATH" < scripts/sql/2025-10-08_create_entities.sql

if [ -f scripts/sql/2025-10-08_seed_entities.sql ]; then
  echo "🌱 Inserting seed data..."
  sqlite3 "$DB_PATH" < scripts/sql/2025-10-08_seed_entities.sql
fi

echo "🚀 Applying S1-T6: Invoices & Receipts migration..."
if [ -f scripts/sql/2025-10-09_create_invoices_receipts.sql ]; then
  sqlite3 "$DB_PATH" < scripts/sql/2025-10-09_create_invoices_receipts.sql
  echo "✅ S1-T6 migration applied successfully."
else
  echo "⚠️  S1-T6 migration file not found!"
fi

echo "✅ All migrations complete."
