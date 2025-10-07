#!/bin/bash
# ===============================================
# 🧪 S1-T4 Verification — Property Mapping Tests
# ===============================================

BASE_URL="http://127.0.0.1:3101"
COOKIE_FILE="admin.jar"

GREEN="\033[0;32m"; RED="\033[0;31m"; NC="\033[0m"
PASS_COUNT=0; FAIL_COUNT=0

check() {
  local label="$1" cmd="$2" expect="$3"
  echo -ne "🔎  $label ... "
  local out
  out=$(eval "$cmd" 2>/dev/null)
  if echo "$out" | grep -q "$expect"; then
    echo -e "${GREEN}PASS${NC}"
    ((PASS_COUNT++))
  else
    echo -e "${RED}FAIL${NC}"
    echo "↳ Response: $out"
    ((FAIL_COUNT++))
  fi
}

echo "=============================================="
echo "🧩 Tenant–Landlord Marketplace — Phase S1-T4"
echo "=============================================="

# 1️⃣ Check Leases contain property_id
check "Lease contains property_id"   "curl -s -b $COOKIE_FILE $BASE_URL/api/leases | jq '.data[0].property_id'" "[0-9]"

# 2️⃣ Verify property details embedded
check "Lease includes property details"   "curl -s -b $COOKIE_FILE $BASE_URL/api/leases/1" "property"

# 3️⃣ Filter by property_id
check "Filter leases by property_id"   "curl -s -b $COOKIE_FILE $BASE_URL/api/leases?property_id=1" '"success":true'

# 4️⃣ Health check shows linkage
check "Health includes property-lease linkage"   "curl -s $BASE_URL/api/health" "leases"

echo "----------------------------------------------"
echo "✅ PASSED: $PASS_COUNT   ❌ FAILED: $FAIL_COUNT"
echo "🏁 Completed at $(date)"
echo "=============================================="
