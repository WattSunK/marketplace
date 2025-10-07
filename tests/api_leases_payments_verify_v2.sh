#!/bin/bash
# ===========================================================
# 🧪 Tenant–Landlord Marketplace API Verification – Phase S1-T3
# End-to-End tests for Lease & Payment CRUD and linkage
# ===========================================================

BASE_URL="http://127.0.0.1:3101"
EMAIL="superadmin@example.com"
PASSWORD="Pass123"
COOKIE_FILE="admin.jar"

GREEN="\033[0;32m"; RED="\033[0;31m"; YELLOW="\033[1;33m"; NC="\033[0m"
PASS_COUNT=0; FAIL_COUNT=0

check() {
  local label="$1" cmd="$2" expect="$3"
  echo -ne "🔎  $label ... "
  local start=$(date +%s%3N)
  local out
  out=$(eval "$cmd" 2>/dev/null)
  local end=$(date +%s%3N); local elapsed=$((end - start))
  if echo "$out" | grep -q "$expect"; then
    echo -e "${GREEN}PASS${NC} (${elapsed}ms)"
    ((PASS_COUNT++))
  else
    echo -e "${RED}FAIL${NC} (${elapsed}ms)"
    echo -e "${YELLOW}↳ Response:${NC} $out"
    ((FAIL_COUNT++))
  fi
}

echo "=========================================="
echo "🧩 Tenant–Landlord Marketplace – Phase S1-T3"
echo "=========================================="

# ---------- Login ----------
echo "🔐  Authenticating as SuperAdmin ..."
LOGIN_RESP=$(curl -s -i -c "$COOKIE_FILE" -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
  "$BASE_URL/api/auth/login")

if echo "$LOGIN_RESP" | grep -q "200 OK"; then
  echo -e "${GREEN}✅ Login successful${NC}"
else
  echo -e "${RED}❌ Login failed – check credentials or server${NC}"
  echo "$LOGIN_RESP"
  exit 1
fi

# ---------- Lease CRUD ----------
check "List Leases (admin)" \
  "curl -s -b $COOKIE_FILE $BASE_URL/api/leases" '"success":true'

check "Create Lease (admin)" \
  "curl -s -X POST -H 'Content-Type: application/json' -b $COOKIE_FILE \
   -d '{\"tenant_id\":3,\"unit_id\":1,\"start_date\":\"2025-10-15\",\"end_date\":\"2026-10-15\",\"rent_amount\":1500}' \
   $BASE_URL/api/leases" '"success":true'

check "Fetch Lease by ID" \
  "curl -s -b $COOKIE_FILE $BASE_URL/api/leases/1" '"success":true'

check "Update Lease (admin)" \
  "curl -s -X PUT -H 'Content-Type: application/json' -b $COOKIE_FILE \
   -d '{\"status\":\"Renewed\",\"rent_amount\":1600}' \
   $BASE_URL/api/leases/1" '"success":true'

# ---------- Payment CRUD ----------
check "List Payments (admin)" \
  "curl -s -b $COOKIE_FILE $BASE_URL/api/payments" '"success":true'

check "Add Payment (admin)" \
  "curl -s -X POST -H 'Content-Type: application/json' -b $COOKIE_FILE \
   -d '{\"lease_id\":1,\"amount\":800,\"method\":\"mpesa\",\"note\":\"partial rent\"}' \
   $BASE_URL/api/payments" '"success":true'

check "Update Payment (admin)" \
  "curl -s -X PUT -H 'Content-Type: application/json' -b $COOKIE_FILE \
   -d '{\"amount\":900,\"method\":\"bank\"}' \
   $BASE_URL/api/payments/1" '"success":true'

# ---------- Linkage ----------
check "Lease shows embedded payments" \
  "curl -s -b $COOKIE_FILE $BASE_URL/api/leases/1" '"payments"'

# ---------- Health ----------
check "Health includes leases/payments" \
  "curl -s $BASE_URL/api/health" '"leases"'

# ---------- Summary ----------
echo "------------------------------------------"
echo -e "✅ PASSED: ${GREEN}${PASS_COUNT}${NC}   ❌ FAILED: ${RED}${FAIL_COUNT}${NC}"
if [ $FAIL_COUNT -eq 0 ]; then
  echo -e "${GREEN}All Phase S1-T3 tests passed successfully!${NC}"
else
  echo -e "${RED}Some tests failed – see responses above.${NC}"
fi
echo "------------------------------------------"
echo -e "🏁  Completed at $(date)"
echo "=========================================="
