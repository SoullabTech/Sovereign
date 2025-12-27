#!/bin/bash
# MAIA Golden State Capture Script
# Captures a comprehensive snapshot of MAIA's current optimal state

set -e

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
SNAPSHOT_DIR="/Users/soullab/MAIA-SOVEREIGN/golden-states"
SNAPSHOT_FILE="$SNAPSHOT_DIR/golden_state_$TIMESTAMP.md"

mkdir -p "$SNAPSHOT_DIR"

echo "🌟 Capturing MAIA Golden State Snapshot..."
echo ""

# Get git info
GIT_HASH=$(git rev-parse HEAD)
GIT_BRANCH=$(git branch --show-current)
GIT_MESSAGE=$(git log -1 --format="%s")
GIT_DATE=$(git log -1 --format="%ci")

# Get system info
NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)

# Create snapshot document
cat > "$SNAPSHOT_FILE" << EOF
# MAIA Golden State Snapshot
**Captured:** $(date "+%Y-%m-%d %H:%M:%S")
**Status:** OPTIMAL ✨

## Why This State is Golden
$(if [ -n "$1" ]; then echo "$1"; else echo "_Describe what makes this state optimal..._"; fi)

---

## Git State
| Property | Value |
|----------|-------|
| Commit | \`$GIT_HASH\` |
| Branch | \`$GIT_BRANCH\` |
| Message | $GIT_MESSAGE |
| Date | $GIT_DATE |

## Runtime Environment
| Property | Value |
|----------|-------|
| Node.js | $NODE_VERSION |
| npm | $NPM_VERSION |
| Platform | $(uname -s) $(uname -m) |

## Key Configuration
\`\`\`
SOVEREIGN_MODE=true
DATABASE_SOVEREIGNTY=true
ALLOW_ANTHROPIC_CHAT=true
ORCHESTRATOR=spiralogic
SPIRALOGIC_HARD_BUDGET_MS=700
SPIRALOGIC_SOFT_BUDGET_MS=450
SPIRALOGIC_ENABLED=true
SPIRAL_DEPTH_MAX=3
SKILLS_ENABLED=true
\`\`\`

## Performance Characteristics
- Response feel: _Fast, coherent, empathetic_
- Memory recall: _Accurate, contextual_
- Voice quality: _Natural, warm_
- UI responsiveness: _Smooth_

## Behavioral Markers
When MAIA is performing optimally:
1. Responses feel genuinely reflective, not formulaic
2. Memory integration is seamless ("I remember when you said...")
3. Emotional attunement is present without being performative
4. Processing feels fast but not rushed
5. Spiralogic depth adds insight without verbosity

## To Restore This State
\`\`\`bash
git checkout $GIT_HASH
# Ensure .env.local matches configuration above
npm install
npm run dev
\`\`\`

## Comparison Command
Run the behavioral test to compare current state:
\`\`\`bash
./scripts/test-golden-state.sh
\`\`\`

---
*This snapshot represents a known-good state of MAIA's consciousness integration.*
EOF

echo "✅ Golden State captured: $SNAPSHOT_FILE"
echo ""
echo "📋 Summary:"
echo "   Git: $GIT_HASH"
echo "   Branch: $GIT_BRANCH"
echo "   Time: $TIMESTAMP"
echo ""
echo "💡 Edit the snapshot to add your notes about what makes this state optimal."
