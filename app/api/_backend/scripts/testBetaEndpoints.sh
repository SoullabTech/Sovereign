#!/bin/bash
# 🧪 AIN Oracle System - Beta Testing Script

echo "🧪 Testing AIN Oracle System - Private Beta"
echo "=================================================="

BASE_URL="http://localhost:3000"
TEST_TOKEN="beta-test-token-2024"

echo ""
echo "🔍 Testing Knowledge Base Endpoints..."
echo ""

# Test 1: Book Wisdom
echo "1️⃣ Testing Elemental Wisdom Access..."
curl -s -X GET "${BASE_URL}/elemental-alchemy/book/wisdom" \
  -H "Authorization: Bearer ${TEST_TOKEN}" \
  -H "Content-Type: application/json" | \
  jq '.success, .data.type, (.data.elements | keys)' 2>/dev/null || echo "❌ Endpoint not responding"

echo ""
echo "2️⃣ Testing Fire Element Wisdom..."
curl -s -X GET "${BASE_URL}/elemental-alchemy/book/element/fire" \
  -H "Authorization: Bearer ${TEST_TOKEN}" \
  -H "Content-Type: application/json" | \
  jq '.success, .data.element, .data.essence[0:100]' 2>/dev/null || echo "❌ Fire endpoint not responding"

echo ""
echo "3️⃣ Testing Book Information..."
curl -s -X GET "${BASE_URL}/elemental-alchemy/book/info" \
  -H "Authorization: Bearer ${TEST_TOKEN}" \
  -H "Content-Type: application/json" | \
  jq '.success, .data.title, .data.author, .data.chapters | length' 2>/dev/null || echo "❌ Book info not responding"

echo ""
echo "4️⃣ Testing Core Teachings..."
curl -s -X GET "${BASE_URL}/elemental-alchemy/book/teachings/5" \
  -H "Authorization: Bearer ${TEST_TOKEN}" \
  -H "Content-Type: application/json" | \
  jq '.success, .data.returned, (.data.teachings[0][0:80] + "...")' 2>/dev/null || echo "❌ Teachings not responding"

echo ""
echo "🪞 Testing Sacred Mirror Protocol..."
echo ""

# Test 5: Sacred Mirror Metrics
echo "5️⃣ Testing Sacred Mirror Metrics..."
curl -s -X GET "${BASE_URL}/sacred-mirror/metrics" \
  -H "Authorization: Bearer ${TEST_TOKEN}" \
  -H "Content-Type: application/json" | \
  jq '.success, .data.protocol_status, .data.total_users_tracked' 2>/dev/null || echo "❌ Sacred Mirror not responding"

echo ""
echo "6️⃣ Testing Dissonance Detection..."
curl -s -X POST "${BASE_URL}/sacred-mirror/test-dissonance" \
  -H "Authorization: Bearer ${TEST_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "sample_text": "Absolutely! You are amazing and definitely doing the perfect thing! Everything is wonderful!",
    "user_query": "Am I doing the right thing?"
  }' | \
  jq '.success, .data.mirror_applied, .data.dissonance_detected' 2>/dev/null || echo "❌ Dissonance test not responding"

echo ""
echo "7️⃣ Testing System Prompt Access..."
curl -s -X GET "${BASE_URL}/sacred-mirror/system-prompt" \
  -H "Authorization: Bearer ${TEST_TOKEN}" \
  -H "Content-Type: application/json" | \
  jq '.success, (.data.content[0:100] + "...")' 2>/dev/null || echo "❌ System prompt not responding"

echo ""
echo "🌍 Testing General Endpoints..."
echo ""

# Test 8: Root endpoint
echo "8️⃣ Testing Root Endpoint..."
curl -s -X GET "${BASE_URL}/" | head -c 50

echo ""
echo ""
echo "🎯 Testing Elemental Houses..."
curl -s -X GET "${BASE_URL}/elemental-alchemy/houses" | \
  jq '.success, (.data | length), .data[0].element' 2>/dev/null || echo "❌ Houses not responding"

echo ""
echo "=================================================="
echo "✅ Beta Testing Complete!"
echo ""
echo "🧪 Next Steps:"
echo "1. Verify all endpoints return success: true"
echo "2. Check that elemental wisdom contains Kelly's teachings"
echo "3. Confirm Sacred Mirror detects sycophancy"
echo "4. Test with Postman for more detailed exploration"
echo ""
echo "🌟 Ready for hands-on beta testing!"