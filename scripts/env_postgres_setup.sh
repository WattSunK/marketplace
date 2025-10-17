#!/bin/bash
echo "Creating .env.postgres ..."
cat > .env.postgres <<EOF
DB_ENGINE=postgres
PGHOST=127.0.0.1
PGPORT=5433
PGUSER=marketuser
PGPASSWORD=marketpass
PGDATABASE=marketplace
KILLBILL_DB=killbill
KILLBILL_USER=marketuser
KILLBILL_PASSWORD=marketpass
EOF
echo ".env.postgres created."
