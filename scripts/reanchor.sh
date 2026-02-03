#!/usr/bin/env bash

# MAIA Re-Anchor Script
# Run this at the start of any new session to restore context.
# Usage: ./scripts/reanchor.sh

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "                    MAIA RE-ANCHOR"
echo "═══════════════════════════════════════════════════════════════"
echo ""

echo "— SESSION ANCHOR —"
echo ""
sed -n '1,60p' CLAUDE.md

echo ""
echo "— MAIA OATH —"
echo ""
cat docs/canon/MAIA_OATH.md | head -40

echo ""
echo "— PROJECT CONTEXT (ORIGIN + ETHOS) —"
echo ""
sed -n '1,80p' PROJECT_CONTEXT.md

echo ""
echo "— CURRENT PRIORITY THREAD —"
echo ""
grep -A 10 "## Current priority thread" CLAUDE.md

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "                    END RE-ANCHOR"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Before proceeding, confirm:"
echo "  - I understand what MAIA is and is not."
echo "  - I understand the ethical boundaries I must not cross."
echo "  - I understand what continuity means in this system."
echo "  - I understand what question this session is truly serving."
echo ""
