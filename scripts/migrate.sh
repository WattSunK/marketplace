#!/bin/sh
set -eu
ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
SQL_DIR="${SQL_DIR:-$ROOT_DIR/scripts/sql}"
DB_PATH="${DB_PATH:-$ROOT_DIR/data/dev/marketplace.dev.db}"

mkdir -p "$(dirname "$DB_PATH")"
echo "DB_PATH=$DB_PATH"

if command -v sqlite3 >/dev/null 2>&1; then
  if [ -d "$SQL_DIR" ]; then
    for f in "$SQL_DIR"/*.sql; do
      [ -e "$f" ] || continue
      echo "Applying $f..."
      sqlite3 "$DB_PATH" < "$f"
    done
  else
    echo "No SQL directory ($SQL_DIR); skipping."
  fi
else
  echo "sqlite3 not found; skipping DB migrations."
fi

echo "Done."
