#!/bin/bash
BASE_URL="http://127.0.0.1:3101/api"
echo "=== 🔍 S1-T7 Integration Smoke Test ==="

curl -s -X POST $BASE_URL/integrations -H "Content-Type: application/json" -d '{"provider":"flutterwave","type":"billing","status":"active"}' | tee /tmp/integration_create.json
curl -s $BASE_URL/integrations | tee /tmp/integration_list.json
curl -s -X POST $BASE_URL/hooks/notify -H "Content-Type: application/json" -d '{"kind":"email","to":"test@example.com","message":"Integration smoke test"}' | tee /tmp/integration_notify.json
curl -s $BASE_URL/health | tee /tmp/integration_health.json

echo "=== ✅ Integration Smoke Test Completed ==="
