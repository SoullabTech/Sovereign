#!/bin/bash

# Test Talk Mode Fixes V3
# Tests both Spiralogic knowledge and userName handling

echo "🧪 Testing Talk Mode Fixes V3..."
echo ""
echo "This tests:"
echo "1. Spiralogic knowledge (should explain when asked)"
echo "2. userName handling (should use real name, NOT 'Guest')"
echo ""

# Test 1: Spiralogic Question with Real Name
echo "═══════════════════════════════════════════════════════════════"
echo "Test 1: Spiralogic Question with userName='Kelly'"
echo "───────────────────────────────────────────────────────────────"
echo "Input: 'What do you think of the Spiralogic model?'"
echo "Expected: Clear explanation of Spiralogic, uses 'Kelly' if greeting"
echo "───────────────────────────────────────────────────────────────"
curl -s -X POST http://localhost:3000/api/sovereign/app/maia \
  -H "Content-Type: application/json" \
  -d '{"message":"What do you think of the Spiralogic model?","userName":"Kelly","mode":"dialogue"}' | jq -r '.message'

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Test 2: Greeting with Real Name
echo "Test 2: Greeting with userName='Kelly'"
echo "───────────────────────────────────────────────────────────────"
echo "Input: 'Hi Maya'"
echo "Expected: Uses 'Kelly' or simple greeting, NO 'Guest'"
echo "───────────────────────────────────────────────────────────────"
curl -s -X POST http://localhost:3000/api/sovereign/app/maia \
  -H "Content-Type: application/json" \
  -d '{"message":"Hi Maya","userName":"Kelly","mode":"dialogue"}' | jq -r '.message'

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Test 3: Greeting WITHOUT userName (should not say "Guest")
echo "Test 3: Greeting WITHOUT userName"
echo "───────────────────────────────────────────────────────────────"
echo "Input: 'Hi Maya'"
echo "Expected: Simple greeting ('Hey.', 'Hi there.'), NO 'Guest'"
echo "───────────────────────────────────────────────────────────────"
curl -s -X POST http://localhost:3000/api/sovereign/app/maia \
  -H "Content-Type: application/json" \
  -d '{"message":"Hi Maya","mode":"dialogue"}' | jq -r '.message'

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Test 4: Spiralogic Follow-up Question
echo "Test 4: Spiralogic Follow-up"
echo "───────────────────────────────────────────────────────────────"
echo "Input: 'What do you know about it?'"
echo "Expected: Substantive answer about Spiralogic, NOT 'What's happening?'"
echo "───────────────────────────────────────────────────────────────"
curl -s -X POST http://localhost:3000/api/sovereign/app/maia \
  -H "Content-Type: application/json" \
  -d '{"message":"What do you know about it?","userName":"Kelly","mode":"dialogue"}' | jq -r '.message'

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Test 5: Question with userName='Explorer' (should NOT use generic name)
echo "Test 5: Question with userName='Explorer' (generic name)"
echo "───────────────────────────────────────────────────────────────"
echo "Input: 'Hi, can you hear me?'"
echo "Expected: Substantive answer, NO 'Explorer', NO 'Guest'"
echo "───────────────────────────────────────────────────────────────"
curl -s -X POST http://localhost:3000/api/sovereign/app/maia \
  -H "Content-Type: application/json" \
  -d '{"message":"Hi, can you hear me?","userName":"Explorer","mode":"dialogue"}' | jq -r '.message'

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""

echo "✅ Test complete!"
echo ""
echo "Check results for:"
echo "  ✓ Spiralogic explanations (not circular 'What's happening?')"
echo "  ✓ Real name usage ('Kelly') when provided"
echo "  ✓ NO 'Guest' or 'Explorer' in responses"
echo "  ✓ Simple greetings when name unknown"
