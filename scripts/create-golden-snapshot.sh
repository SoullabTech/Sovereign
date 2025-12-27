#!/usr/bin/env bash
#
# Golden Snapshot Creator
# Creates a timestamped snapshot of code state, tests, and behavior
#
# Usage:
#   ./scripts/create-golden-snapshot.sh
#   TAG_NAME="v1.0.0-canon-wrap" ./scripts/create-golden-snapshot.sh

set -euo pipefail

# Configuration
STAMP=$(date +%Y%m%d_%H%M%S)
SNAPSHOT_DIR="snapshots/$STAMP"
TAG_NAME="${TAG_NAME:-golden-$STAMP}"

echo "📸 Creating Golden Snapshot"
echo "   Timestamp: $STAMP"
echo "   Directory: $SNAPSHOT_DIR"
echo "   Git tag: $TAG_NAME"
echo ""

# 1) Create snapshot directory
mkdir -p "$SNAPSHOT_DIR"

# 2) Capture exact code state
echo "🔍 Capturing git state..."
git rev-parse HEAD | tee "$SNAPSHOT_DIR/git_sha.txt"
git status --porcelain | tee "$SNAPSHOT_DIR/git_status.txt"
git diff > "$SNAPSHOT_DIR/git_diff.patch"
git log -1 --pretty=format:"%H%n%an%n%ae%n%ai%n%s%n%b" > "$SNAPSHOT_DIR/git_commit.txt"

# 3) Capture build sanity
echo "🔨 Running typecheck..."
npm run typecheck 2>&1 | tee "$SNAPSHOT_DIR/typecheck.txt" || echo "⚠️  Typecheck had errors (captured)"

echo "🧪 Running tests..."
npm run test 2>&1 | tee "$SNAPSHOT_DIR/tests.txt" || echo "⚠️  Tests had failures (captured)"

# 4) Capture environment config (non-secrets only)
echo "⚙️  Capturing environment config..."
cat > "$SNAPSHOT_DIR/env_config.txt" <<EOF
NODE_ENV=$NODE_ENV
CANON_WRAP_ENABLED=${CANON_WRAP_ENABLED:-not set}
VOICE_REMOTE_RENDERING_ENABLED=${VOICE_REMOTE_RENDERING_ENABLED:-not set}
ALLOW_ANTHROPIC_CHAT=${ALLOW_ANTHROPIC_CHAT:-not set}
ALLOW_ANTHROPIC_CONSCIOUSNESS=${ALLOW_ANTHROPIC_CONSCIOUSNESS:-not set}
SPIRALOGIC_ENABLED=${SPIRALOGIC_ENABLED:-not set}
SOVEREIGN_MODE=${SOVEREIGN_MODE:-not set}
EOF

# 5) Capture Canon Wrap smoke tests (requires dev server running)
echo "🧪 Running Canon Wrap smoke tests..."
echo "   (Requires dev server at http://localhost:3000)"

# Test A: Direct (no wrap)
curl -s -X POST http://localhost:3000/api/between/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What is MAIA?","mode":"counsel","allowCanonWrap":false,"sessionId":"golden-A"}' \
  2>/dev/null \
  | tee "$SNAPSHOT_DIR/smoke_A.json" \
  | jq '.metadata.processingPath' > "$SNAPSHOT_DIR/smoke_A_path.txt" \
  || echo "null" > "$SNAPSHOT_DIR/smoke_A_path.txt"

# Test B: Wrapped
curl -s -X POST http://localhost:3000/api/between/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What is MAIA?","mode":"counsel","allowCanonWrap":true,"sessionId":"golden-B"}' \
  2>/dev/null \
  | tee "$SNAPSHOT_DIR/smoke_B.json" \
  | jq '.metadata.processingPath' > "$SNAPSHOT_DIR/smoke_B_path.txt" \
  || echo "null" > "$SNAPSHOT_DIR/smoke_B_path.txt"

# Test C: Non-canon
curl -s -X POST http://localhost:3000/api/between/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Help me write a short bio","mode":"counsel","allowCanonWrap":true,"sessionId":"golden-C"}' \
  2>/dev/null \
  | tee "$SNAPSHOT_DIR/smoke_C.json" \
  | jq '.metadata.processingPath' > "$SNAPSHOT_DIR/smoke_C_path.txt" \
  || echo "null" > "$SNAPSHOT_DIR/smoke_C_path.txt"

# 6) Capture package versions
echo "📦 Capturing package versions..."
npm ls --depth=0 2>&1 | head -50 > "$SNAPSHOT_DIR/npm_packages.txt" || true

# 7) Create snapshot summary
echo "📝 Creating snapshot summary..."
cat > "$SNAPSHOT_DIR/README.md" <<EOF
# Golden Snapshot $STAMP

**Created**: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
**Git SHA**: $(cat "$SNAPSHOT_DIR/git_sha.txt")
**Tag**: $TAG_NAME

---

## Smoke Test Results

### Test A: Canon Direct (no wrap)
- **Processing Path**: \`$(cat "$SNAPSHOT_DIR/smoke_A_path.txt")\`
- **Expected**: \`"CANON_BEAD_DIRECT"\`

### Test B: Canon Wrapped
- **Processing Path**: \`$(cat "$SNAPSHOT_DIR/smoke_B_path.txt")\`
- **Expected**: \`"CANON_BEAD_WRAPPED"\`

### Test C: Non-Canon
- **Processing Path**: \`$(cat "$SNAPSHOT_DIR/smoke_C_path.txt")\`
- **Expected**: \`null\` or other non-canon path

---

## Files

- \`git_sha.txt\` - Git commit SHA
- \`git_status.txt\` - Working directory status
- \`git_diff.patch\` - Uncommitted changes
- \`git_commit.txt\` - Last commit details
- \`typecheck.txt\` - TypeScript compilation output
- \`tests.txt\` - Test suite output
- \`env_config.txt\` - Environment configuration (non-secrets)
- \`smoke_A.json\`, \`smoke_B.json\`, \`smoke_C.json\` - Smoke test responses
- \`npm_packages.txt\` - Package versions

---

## Restore This Snapshot

\`\`\`bash
# Checkout exact commit
git checkout $(cat snapshots/$STAMP/git_sha.txt)

# Apply any uncommitted changes (if needed)
git apply snapshots/$STAMP/git_diff.patch

# Verify typecheck matches
npm run typecheck 2>&1 | diff - snapshots/$STAMP/typecheck.txt
\`\`\`
EOF

# 8) Optional: Tag in git
echo ""
echo "🏷️  Tag this snapshot in git?"
echo "   Command: git tag -a $TAG_NAME -m \"Golden snapshot $STAMP\""
read -p "   Create tag? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  git tag -a "$TAG_NAME" -m "Golden snapshot $STAMP"
  echo "   ✅ Tag created: $TAG_NAME"
  echo "   Push with: git push --tags"
fi

# 9) Print summary
echo ""
echo "============================================================"
echo "✅ Golden Snapshot Complete"
echo "============================================================"
echo "   Location: $SNAPSHOT_DIR"
echo "   Git SHA: $(cat "$SNAPSHOT_DIR/git_sha.txt")"
echo ""
echo "Smoke Test Results:"
echo "   A (direct):  $(cat "$SNAPSHOT_DIR/smoke_A_path.txt")"
echo "   B (wrapped): $(cat "$SNAPSHOT_DIR/smoke_B_path.txt")"
echo "   C (non-canon): $(cat "$SNAPSHOT_DIR/smoke_C_path.txt")"
echo ""
echo "View full snapshot: cat $SNAPSHOT_DIR/README.md"
echo "============================================================"
