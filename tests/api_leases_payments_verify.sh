#!/bin/bash
# ===========================================================
# 🧪 Marketplace API Verification – Phase S1-T3
# Verifies Lease & Payment CRUD, linkage, and permissions
# ===========================================================

BASE_URL="http://127.0.0.1:3101"
GREEN="\033[0;32m"; RED="\033[0;31m"; YELLOW="\033[1;33m"; NC="\033[0m"

PASS_COUNT=0; FAIL_COUNT=0

check() {
  local label="$1" cmd="$2" expect="$3"
  echo -ne "🔎  $label ... "
  local start=$(date +%s%3N)
  local out=$(eval "$cmd" 2>/dev/null)
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

# ---------- Leases CRUD ----------
check "List Leases (admin)" \
  "curl -s -b admin.jar $BASE_URL/api/leases" '"success":true'

check "Create Lease (landlord)" \
  "curl -s -X POST -H 'Content-Type: application/json' -b landlord.jar \
    -d '{\"tenant_id\":2,\"property_id\":1,\"unit_id\":1,\"start_date\":\"2025-10-10\",\"end_date\":\"2026-10-10\",\"rent_amount\":1200}' \
    $BASE_URL/api/leases" '"success":true'

check "Fetch Lease by ID" \
  "curl -s -b admin.jar $BASE_URL/api/leases/1" '"success":true'

check "Update Lease (landlord)" \
  "curl -s -X PUT -H 'Content-Type: application/json' -b landlord.jar \
    -d '{\"rent_amount\":1500,\"status\":\"renewed\"}' \
    $BASE_URL/api/leases/1" '"success":true'

# ---------- Payments CRUD ----------
check "List Payments (admin)" \
  "curl -s -b admin.jar $BASE_URL/api/payments" '"success":true'

check "Add Payment (landlord)" \
  "curl -s -X POST -H 'Content-Type: application/json' -b landlord.jar \
    -d '{\"lease_id\":1,\"amount\":600,\"method\":\"mpesa\",\"note\":\"first half\"}' \
    $BASE_URL/api/payments" '"success":true'

check "Update Payment (landlord)" \
  "curl -s -X PUT -H 'Content-Type: application/json' -b landlord.jar \
    -d '{\"amount\":650,\"method\":\"bank\"}' \
    $BASE_URL/api/payments/1" '"success":true'

# ---------- Linkage ----------
check "Lease shows embedded payments" \
  "curl -s -b admin.jar $BASE_URL/api/leases/1" '"payments"'

# ---------- Permissions ----------
check "Tenant forbidden to create lease" \
  "curl -s -X POST -b tenant.jar $BASE_URL/api/leases -d '{}' " '403'

check "Landlord forbidden to delete payment" \
  "curl -s -X DELETE -b landlord.jar $BASE_URL/api/payments/1" '403'

# ---------- Health Counts ----------
check "Health includes leases/payments entities" \
  "curl -s $BASE_URL/api/health" '"leases"'

# ---------- Summary ----------
echo "------------------------------------------"
echo -e "✅ PASSED: ${GREEN}${PASS_COUNT}${NC}   ❌ FAILED: ${RED}${FAIL_COUNT}${NC}"
if [ $FAIL_COUNT -eq 0 ]; then
  echo -e "${GREEN}All Phase S1-T3 tests passed successfully!${NC}"
else
  echo -e "${RED}Some tests failed. Review logs above.${NC}"
fi
echo "------------------------------------------"
echo -e "🏁  Completed at $(date)"
echo "=========================================="
