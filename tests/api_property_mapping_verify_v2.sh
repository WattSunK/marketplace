#!/bin/bash
# =====================================================================
# 🧩 Tenant–Landlord Marketplace — S1-T4 Verification Script (v3)
# Purpose: Confirm property_id joins, filtering, and relational counts
# Updated: Auth-aware, jq-based JSON parsing (2025-10-07)
# =====================================================================

API="http://127.0.0.1:3101/api"
OPS="http://127.0.0.1:3101/_ops"
DB="data/dev/marketplace.dev.db"
COOKIE="superadmin.jar"

divider() { echo "------------------------------------------------------------"; }
ok() { echo "✅ $1"; }
fail() { echo "❌ $1"; }

divider
echo "🔎  Verifying S1-T4: Relational Joins & Property Mapping"
divider

# --- 0️⃣ Check authentication cookie -----------------------------------------
if [ ! -s "$COOKIE" ]; then
  fail "Missing or empty $COOKIE. Please log in as admin first."
  exit 1
fi

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
LEASES_JSON=$(curl -s -b "$COOKIE" "$API/leases?page=1&per=5")

if echo "$LEASES_JSON" | jq -e '.data[0].property_name' >/dev/null 2>&1; then
  ok "/api/leases returns property_name"
else
  fail "/api/leases missing property join fields"
fi

# Extract a sample property_id using jq
PROP_ID=$(echo "$LEASES_JSON" | jq -r '.data[0].property_id // empty')

if [ -z "$PROP_ID" ]; then
  fail "No property_id found in leases payload"
else
  echo "ℹ️  Using property_id=$PROP_ID for filter test"
fi

# --- 4️⃣ API: /api/leases?property_id=ID ------------------------------------
FILTER_JSON=$(curl -s -b "$COOKIE" "$API/leases?property_id=$PROP_ID")

FILTER_COUNT=$(echo "$FILTER_JSON" | jq -r --arg pid "$PROP_ID" '[.data[] | select(.property_id == ($pid|tonumber))] | length')

if [ "$FILTER_COUNT" -gt 0 ]; then
  ok "/api/leases?property_id=$PROP_ID filter works ($FILTER_COUNT results)"
else
  fail "Property filter not working correctly"
fi

# --- 5️⃣ API: /_ops/health ---------------------------------------------------
HEALTH_JSON=$(curl -s "$OPS/health")
if echo "$HEALTH_JSON" | jq -e '.checks.db.counts.leases' >/dev/null 2>&1; then
  ok "/_ops/health includes relational entity counts"
else
  fail "/_ops/health missing counts"
fi

divider
echo "🧾 Summary:"
echo "  - DB Path: $DB"
echo "  - API Root: $API"
echo "  - OPS Health: $OPS/health"
echo "  - Auth Cookie: $COOKIE"
divider
echo "✅  S1-T4 verification completed."
divider
