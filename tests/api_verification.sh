#!/bin/bash
# ===========================================================
# Marketplace API Verification Script
# Checks root, /api/health, /_ops/health, /api/auth/_whoami
# ===========================================================

BASE_URL="http://127.0.0.1:3101"
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[1;33m"
NC="\033[0m" # No Color

check_endpoint() {
  local url="$1"
  local expected="$2"
  local label="$3"

  echo -ne "🔎  Checking ${label} ... "
  local start=$(date +%s%3N)
  local response
  response=$(curl -s -m 5 "$url")
  local code=$?
  local end=$(date +%s%3N)
  local elapsed=$((end - start))

  if [[ $code -ne 0 ]]; then
    echo -e "${RED}FAIL${NC} (no response)"
    return
  fi

  if echo "$response" | grep -q "$expected"; then
    echo -e "${GREEN}PASS${NC} (${elapsed}ms)"
  else
    echo -e "${RED}FAIL${NC} (${elapsed}ms)"
    echo -e "${YELLOW}↳ Response:${NC} $response"
  fi
}

echo "=========================================="
echo "🧪 Tenant–Landlord Marketplace Health Check"
echo "=========================================="

check_endpoint "$BASE_URL/" "Marketplace" "Static Root"
check_endpoint "$BASE_URL/api/health" "\"ok\":true" "Application Health"
check_endpoint "$BASE_URL/_ops/health" "\"ok\":true" "Infrastructure Health"
check_endpoint "$BASE_URL/api/auth/_whoami" "\"success\"" "Auth Session Check"

echo "------------------------------------------"
echo -e "🏁  Completed at $(date)"
echo "=========================================="
