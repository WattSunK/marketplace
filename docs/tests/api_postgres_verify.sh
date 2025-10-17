#!/bin/bash
echo "Running PostgreSQL connectivity tests ..."
curl -s http://127.0.0.1:3101/api/health | jq
psql -h 127.0.0.1 -U marketuser -d marketplace -c "\dt"
curl -s http://127.0.0.1:8080 | grep "Kill Bill"
echo "Verification complete."
