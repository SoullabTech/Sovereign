#!/bin/bash

# Test userName flow to verify it's being passed correctly

echo "🧪 Testing userName Flow..."
echo ""

# Test 1: With userName "Kelly"
echo "Test 1: With userName='Kelly'"
curl -s -X POST http://localhost:3000/api/sovereign/app/maia \
  -H "Content-Type: application/json" \
  -d '{"message":"Hi Maya","userName":"Kelly","mode":"dialogue"}' | jq -r '.message'

echo ""
echo "---"
echo ""

# Test 2: Without userName (should default)
echo "Test 2: Without userName (should use default)"
curl -s -X POST http://localhost:3000/api/sovereign/app/maia \
  -H "Content-Type: application/json" \
  -d '{"message":"Hi Maya","mode":"dialogue"}' | jq -r '.message'

echo ""
echo "---"
echo ""

# Test 3: With userName "Explorer"
echo "Test 3: With userName='Explorer'"
curl -s -X POST http://localhost:3000/api/sovereign/app/maia \
  -H "Content-Type: application/json" \
  -d '{"message":"Hi Maya","userName":"Explorer","mode":"dialogue"}' | jq -r '.message'

echo ""
echo "✅ Test complete!"
