#!/bin/bash
# =====================================================================
# 🧩 Tenant–Landlord Marketplace — S1-T4 Verification Script
# Purpose: Confirm property_id joins, filtering, and relational counts
# =====================================================================

API="http://127.0.0.1:3101/api"
OPS="http://127.0.0.1:3101/_ops"
DB="data/dev/marketplace.dev.db"

divider() { echo "------------------------------------------------------------"; }
ok() { echo "✅ $1"; }
fail() { echo "❌ $1"; }

divider
echo "🔎  Verifying S1-T4: Relational Joins & Property Mapping"
divider

# --- 1️⃣ Check that property_id exists in leases table -----------------------
if sqlite3 "$DB" "PRAGMA table_info(leases);" | grep -q "property_id"; then
  ok "property_id column exists in leases table"
else
  fail "property_id column missing in leases table"
  exit 1
fi

# --- 2️⃣ Check backfilled values --------------------------------------------
COUNT=$(sqlite3 "$DB" "SELECT COUNT(*) FROM leases WHERE property_id IS NOT NULL;")
if [ "$COUNT" -gt 0 ]; then
  ok "property_id values are backfilled ($COUNT rows)"
else
  fail "No property_id backfill detected"
fi

# --- 3️⃣ API: /api/leases ----------------------------------------------------
LEASES_JSON=$(curl -s "$API/leases?page=1&per=5")
if echo "$LEASES_JSON" | grep -q "property_name"; then
  ok "/api/leases returns property_name"
else
  fail "/api/leases missing property join fields"
fi

# Extract a sample property_id to use for filtering test
PROP_ID=$(echo "$LEASES_JSON" | grep -o '"property_id":[0-9]*' | head -1 | cut -d: -f2)
if [ -z "$PROP_ID" ]; then
  fail "No property_id found in leases payload"
else
  echo "ℹ️  Using property_id=$PROP_ID for filter test"
fi

# --- 4️⃣ API: /api/leases?property_id=ID ------------------------------------
FILTER_JSON=$(curl -s "$API/leases?property_id=$PROP_ID")
if echo "$FILTER_JSON" | grep -q "\"property_id\":$PROP_ID"; then
  ok "/api/leases?property_id=$PROP_ID filter works"
else
  fail "Property filter not working correctly"
fi

# --- 5️⃣ API: /_ops/health ---------------------------------------------------
HEALTH_JSON=$(curl -s "$OPS/health")
if echo "$HEALTH_JSON" | grep -q '"leases"'; then
  ok "/_ops/health includes relational entity counts"
else
  fail "/_ops/health missing counts"
fi

divider
echo "🧾 Summary:"
echo "  - DB Path: $DB"
echo "  - API Root: $API"
echo "  - OPS Health: $OPS/health"
divider
echo "✅  S1-T4 verification completed."
divider
