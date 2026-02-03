#!/bin/bash

echo "Testing backend server endpoints..."
echo ""

# Test health endpoint
echo "1. Testing /health endpoint:"
curl -s http://localhost:3002/health | jq .

echo ""
echo "2. Testing /api endpoint:"
curl -s http://localhost:3002/api | jq .

echo ""
echo "3. Testing /api/orchestrator/health endpoint:"
curl -s http://localhost:3002/api/orchestrator/health | jq .

echo ""
echo "4. Testing non-existent endpoint (should return 404):"
curl -s http://localhost:3002/api/v1/converse/health | jq .