#!/bin/bash

# Sesame CI Stress Test - Validate all element × archetype combinations
# This ensures Maya's sacred embodiment is stable across all pathways

# Elements
ELEMENTS=("fire" "water" "earth" "air" "aether")
# Archetypes
ARCHETYPES=("sage" "oracle" "companion")

# Test phrase
PHRASE="This is a stress test of Maya's sacred embodiment."

echo "🔥🌊🌍🌬️✨ Running Sesame CI Stress Test..."
echo "================================================"
echo "Testing ${#ELEMENTS[@]} elements × ${#ARCHETYPES[@]} archetypes = 15 combinations"
echo ""

PASSED=0
FAILED=0

for e in "${ELEMENTS[@]}"; do
  for a in "${ARCHETYPES[@]}"; do
    echo "----------------------------------------"
    echo "🧪 Testing Element: $e | Archetype: $a"
    
    RESPONSE=$(curl -s -X POST http://localhost:8000/ci/shape \
      -H "Content-Type: application/json" \
      -d "{\"text\":\"$PHRASE\",\"style\":\"$e\",\"archetype\":\"$a\"}")
    
    # Check if shaping was applied
    if echo "$RESPONSE" | grep -q '"shapingApplied":true'; then
      echo "✅ PASSED - Shaping applied"
      PASSED=$((PASSED + 1))
      
      # Extract and show tags
      TAGS=$(echo "$RESPONSE" | jq -r '.tags | join(", ")')
      echo "   Tags: $TAGS"
      
      # Show shaped text snippet
      SHAPED=$(echo "$RESPONSE" | jq -r '.shaped' | head -c 100)
      echo "   Shaped: ${SHAPED}..."
    else
      echo "❌ FAILED - Shaping not applied"
      FAILED=$((FAILED + 1))
      echo "$RESPONSE" | jq '.'
    fi
  done
done

echo ""
echo "================================================"
echo "📊 STRESS TEST RESULTS"
echo "   ✅ Passed: $PASSED/15"
echo "   ❌ Failed: $FAILED/15"
echo ""

if [ $FAILED -eq 0 ]; then
  echo "🎉 ALL TESTS PASSED! Maya's sacred embodiment is stable."
  echo "   You can safely set SESAME_CI_REQUIRED=true"
else
  echo "⚠️  Some tests failed. Review the output above."
  echo "   Do not set SESAME_CI_REQUIRED=true yet."
fi

echo "================================================"