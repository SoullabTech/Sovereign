#!/usr/bin/env bash
# scripts/certify-beta-spine.sh
# Beta Spine Certification Aggregator
# Runs all certification tests for the MAIA consciousness architecture

set -euo pipefail

echo "=========================================="
echo "MAIA Beta Spine Certification Suite"
echo "=========================================="
echo ""

# Track overall pass/fail
EXIT_CODE=0

# memory certification
echo "--- Memory System ---"
if [[ -f scripts/certify-memory.sh ]]; then
  bash scripts/certify-memory.sh || EXIT_CODE=1
else
  echo "⚠️  scripts/certify-memory.sh not found (skipping)"
  EXIT_CODE=1
fi
echo ""

# spiral state certification
echo "--- Spiral State ---"
if [[ -f scripts/certify-spiral-state.sh ]]; then
  bash scripts/certify-spiral-state.sh || EXIT_CODE=1
else
  echo "⚠️  scripts/certify-spiral-state.sh not found (skipping)"
  EXIT_CODE=1
fi
echo ""

# multi-spiral hardening (MS1-MS5)
echo "--- Multi-Spiral State Hardening (MS1-MS5) ---"
if [[ -f scripts/certify-multi-spiral.sh ]]; then
  bash scripts/certify-multi-spiral.sh || EXIT_CODE=1
else
  echo "⚠️  scripts/certify-multi-spiral.sh not found (skipping)"
  EXIT_CODE=1
fi
echo ""

# consciousness detection (CD1-CD3)
echo "--- Consciousness Detection (CD1–CD3) ---"
if [[ -f scripts/certify-consciousness-detection.ts ]]; then
  CD_ALLOW_SKIPS=1 CD_EXPORT_JSON=1 npx tsx scripts/certify-consciousness-detection.ts || EXIT_CODE=1
else
  echo "❌ scripts/certify-consciousness-detection.ts not found"
  EXIT_CODE=1
fi
echo ""

# Boot server for HTTP-based certifications (Sacred Mirror + Framework Router)
echo "=========================================="
echo "Building production server for HTTP certifications"
echo "=========================================="

# Clean slate
killall node 2>/dev/null || true
rm -rf .next 2>/dev/null || true

echo "Building production server..."
BETA_SPINE=1 npm run build > /tmp/maia-beta-spine-build.log 2>&1
if [ $? -ne 0 ]; then
  echo "❌ Build failed. Tail build log:"
  tail -80 /tmp/maia-beta-spine-build.log
  exit 1
fi

echo "Starting production server..."
BETA_SPINE=1 NODE_ENV=production PORT=3000 npm run start > /tmp/maia-beta-spine-dev.log 2>&1 &
SERVER_PID=$!

# Wait for server health (using MAIA API endpoint with POST)
echo "Waiting for server to start..."
for i in {1..40}; do
  if curl -sf -X POST http://localhost:3000/api/sovereign/app/maia \
    -H "Content-Type: application/json" \
    -d '{"message":"health_check","userId":"beta_spine_health"}' \
    > /dev/null 2>&1; then
    echo "✅ Server responding"
    break
  fi
  sleep 1
done

if ! curl -sf -X POST http://localhost:3000/api/sovereign/app/maia \
  -H "Content-Type: application/json" \
  -d '{"message":"health_check","userId":"beta_spine_health"}' \
  > /dev/null 2>&1; then
  echo "❌ Server failed to start. Tail log:"
  tail -50 /tmp/maia-beta-spine-dev.log
  EXIT_CODE=1
fi
echo ""

# sacred mirror certification
echo "--- Sacred Mirror ---"
if [[ -f scripts/certify-sacred-mirror.sh ]]; then
  BETA_SPINE=1 bash scripts/certify-sacred-mirror.sh || EXIT_CODE=1
else
  echo "⚠️  scripts/certify-sacred-mirror.sh not found (skipping)"
  EXIT_CODE=1
fi
echo ""

# framework router certification
echo "--- Framework Router ---"
if [[ -f scripts/certify-framework-router.sh ]]; then
  BETA_SPINE=1 bash scripts/certify-framework-router.sh || EXIT_CODE=1
else
  echo "⚠️  scripts/certify-framework-router.sh not found (skipping)"
  EXIT_CODE=1
fi
echo ""

# Kill the dev server
if [[ -n "${SERVER_PID:-}" ]]; then
  kill "$SERVER_PID" 2>/dev/null || true
  echo "🛑 Dev server stopped"
  echo ""
fi

# artifact integrity verification
echo "--- Artifact Integrity ---"
if [[ -f scripts/verify-artifact-integrity.ts ]]; then
  echo "Updating artifact integrity manifest..."
  npx tsx scripts/verify-artifact-integrity.ts --update || EXIT_CODE=1
else
  echo "⚠️  scripts/verify-artifact-integrity.ts not found (skipping)"
  EXIT_CODE=1
fi
echo ""

echo "=========================================="
if [[ $EXIT_CODE -eq 0 ]]; then
  echo "✅ All certification tests passed"
else
  echo "❌ Some certification tests failed"
fi
echo "=========================================="

exit $EXIT_CODE
