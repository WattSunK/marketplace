#!/bin/bash
echo "Starting SQLite → PostgreSQL migration ..."
SQLITE_DB="data/dev/marketplace.dev.db"
PG_URL="postgresql://marketuser:marketpass@127.0.0.1:5432/marketplace"

if command -v pgloader &> /dev/null
then
    pgloader $SQLITE_DB $PG_URL
else
    echo "pgloader not found; exporting manually."
    sqlite3 $SQLITE_DB .dump | psql $PG_URL
fi

echo "Migration completed."
