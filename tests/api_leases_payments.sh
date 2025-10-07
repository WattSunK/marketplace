#!/bin/bash
BASE_URL="http://127.0.0.1:3101"
echo "Testing /api/leases and /api/payments ..."
curl -s "$BASE_URL/api/leases" | jq .
curl -s "$BASE_URL/api/payments" | jq .
