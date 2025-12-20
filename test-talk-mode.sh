#!/bin/bash

# Test Talk Mode Fix V2
# Tests the new principles-based guidance

echo "🧪 Testing Talk Mode Fix V2..."
echo ""

# Test 1: Greeting
echo "Test 1: Greeting - 'Hi Maya'"
curl -s -X POST http://localhost:3000/api/sovereign/app/maia \
  -H "Content-Type: application/json" \
  -d '{"message":"Hi Maya","userName":"Kelly","mode":"dialogue"}' | jq -r '.message'

echo ""
echo "---"
echo ""

# Test 2: Question
echo "Test 2: Question - 'Hi, can you hear me Maya?'"
curl -s -X POST http://localhost:3000/api/sovereign/app/maia \
  -H "Content-Type: application/json" \
  -d '{"message":"Hi, can you hear me Maya?","userName":"Kelly","mode":"dialogue"}' | jq -r '.message'

echo ""
echo "---"
echo ""

# Test 3: Another question
echo "Test 3: Question - 'What is going on?'"
curl -s -X POST http://localhost:3000/api/sovereign/app/maia \
  -H "Content-Type: application/json" \
  -d '{"message":"What is going on?","userName":"Kelly","mode":"dialogue"}' | jq -r '.message'

echo ""
echo "---"
echo ""

# Test 4: Sharing something
echo "Test 4: Sharing - 'I am feeling really stuck'"
curl -s -X POST http://localhost:3000/api/sovereign/app/maia \
  -H "Content-Type: application/json" \
  -d '{"message":"I am feeling really stuck","userName":"Kelly","mode":"dialogue"}' | jq -r '.message'

echo ""
echo "---"
echo ""

echo "✅ Test complete!"
