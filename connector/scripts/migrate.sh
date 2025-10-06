#!/bin/bash
set -e

DB_PATH=${DB_PATH:-"data/dev/marketplace.dev.db"}
MIGRATIONS_DIR=${MIGRATIONS_DIR:-"scripts/sql"}

echo "🚀 Running migrations on $DB_PATH"
mkdir -p "$(dirname "$DB_PATH")"

if [ ! -f "$DB_PATH" ]; then
  echo "Initializing migrations table"
  sqlite3 "$DB_PATH" "CREATE TABLE IF NOT EXISTS migrations (id INTEGER PRIMARY KEY AUTOINCREMENT, filename TEXT, applied_at TEXT DEFAULT CURRENT_TIMESTAMP);"
fi

for file in $(ls "$MIGRATIONS_DIR"/*.sql | sort); do
  filename=$(basename "$file")
  applied=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM migrations WHERE filename='$filename';")
  if [ "$applied" -eq 0 ]; then
    echo "🧩 Applying $filename"
    sqlite3 "$DB_PATH" < "$file"
    sqlite3 "$DB_PATH" "INSERT INTO migrations (filename) VALUES ('$filename');"
  else
    echo "⏩ Skipping $filename (already applied)"
  fi
done

echo "✅ Migrations complete."
