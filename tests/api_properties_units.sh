#!/bin/bash
# --- S1-T2 API Smoke Tests ---
BASE_URL="http://127.0.0.1:3101/api"

echo "== GET /properties =="
curl -s "$BASE_URL/properties" | jq .

echo "== POST /properties (landlord) =="
curl -s -X POST -H "Content-Type: application/json" \
  -b landlord.jar \
  -d '{"name":"Green Estate","address":"Lyon, France"}' \
  "$BASE_URL/properties" | jq .

echo "== GET /units?property_id=1 =="
curl -s "$BASE_URL/units?property_id=1" | jq .

echo "== PUT /units/:id (update rent) =="
curl -s -X PUT -H "Content-Type: application/json" \
  -b landlord.jar \
  -d '{"rent_amount":750,"status":"occupied"}' \
  "$BASE_URL/units/1" | jq .
