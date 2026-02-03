#!/bin/bash

# Soul Memory Integration Test Script
echo "🌀 Testing Soul Memory Integration"
echo "=================================="
echo ""

# Test the integration endpoint
echo "📤 Sending test message to Oracle..."
echo ""

curl -X POST http://localhost:3000/api/test/test-integration \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I am feeling overwhelmed by all these changes in my life"
  }' | jq '.'

echo ""
echo "✅ Test complete!"
echo ""
echo "Check the response above for:"
echo "- oracleResponse: The Oracle's response"
echo "- memoryStored: Should be true"
echo "- memory: The stored memory object with emotional tone, element, etc."