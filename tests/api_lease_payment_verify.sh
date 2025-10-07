#!/bin/bash
# tests/api_lease_payment_verify.sh — S1-T5 linkage verification

API="http://127.0.0.1:3101/api"
COOKIE_JAR="admin.jar"

echo "=========================================="
echo "🧩 Tenant–Landlord Marketplace – Phase S1-T5"
echo "=========================================="

echo "🔐 Authenticating as Admin..."
curl -s -c $COOKIE_JAR -H "Content-Type: application/json"   -d '{"email":"admin@example.com","password":"Pass123"}'   $API/auth/login >/dev/null

echo "🔎 Verify payments linkage..."
curl -s -b $COOKIE_JAR $API/payments | jq '.data[0]'

echo "🔎 Verify lease with payments + totals..."
curl -s -b $COOKIE_JAR $API/leases/1 | jq '.data | {id,total_rent,total_paid,balance_due}'

echo "🔎 Verify /api/health linkage counts..."
curl -s $API/health | jq '.db.payments_linkage'

echo "✅ S1-T5 verification sequence completed."
