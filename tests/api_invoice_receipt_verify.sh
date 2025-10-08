#!/bin/bash
echo "=========================================="
echo "🧩 Tenant–Landlord Marketplace – S1-T6 Test"
echo "=========================================="
API="http://127.0.0.1:3101/api"
echo "🔹 Creating Invoice..."
curl -s -X POST -H "Content-Type: application/json" -d '{"lease_id":1,"period_start":"2025-10-01","period_end":"2025-10-31","amount_cents":60000}' $API/invoices | jq .
echo "🔹 Listing Invoices..."
curl -s "$API/invoices?lease_id=1" | jq .
echo "🔹 Issuing Receipt..."
curl -s -X POST -H "Content-Type: application/json" -d '{"invoice_id":1,"payment_id":1,"amount_cents":60000}' $API/receipts | jq .
echo "🔹 Listing Receipts..."
curl -s "$API/receipts?invoice_id=1" | jq .
echo "🔹 Checking Health..."
curl -s "$API/health" | jq .
