#!/usr/bin/env bash
# backend/devops
# Creates or updates MAIA triage labels (idempotent)
# Usage:
#   export REPO="SoullabTech/Sovereign"
#   ./scripts/ensure-github-labels.sh
#
# Requires: gh auth login

set -euo pipefail

REPO="${REPO:-SoullabTech/Sovereign}"

if ! command -v gh >/dev/null 2>&1; then
  echo "Error: gh CLI not found. Install GitHub CLI first."
  exit 1
fi

ensure_label () {
  local name="$1"
  local color="$2"
  local desc="$3"

  # Try create; if it exists, edit to enforce color/description
  gh label create "$name" \
    --repo "$REPO" \
    --color "$color" \
    --description "$desc" \
    >/dev/null 2>&1 \
  || gh label edit "$name" \
    --repo "$REPO" \
    --color "$color" \
    --description "$desc" \
    >/dev/null
}

# Priority labels
ensure_label "P0"          "B60205" "Crash / voice unusable"
ensure_label "P1"          "D93F0B" "Voice flaky but usable"
ensure_label "P2"          "FBCA04" "UI / minor UX issue"

# Cause buckets
ensure_label "voice"       "1D76DB" "Mic / transcription issues"
ensure_label "ui"          "A371F7" "Layout / buttons"
ensure_label "permissions" "0E8A16" "iOS permissions (Mic / Speech Recognition)"
ensure_label "bluetooth"   "2AA198" "AirPods / car audio routing"
ensure_label "crash"       "B60205" "App crash"
ensure_label "needs-repro" "6A737D" "Needs reproduction steps / info"

# Source labels
ensure_label "testflight"  "0969DA" "TestFlight beta testing"

echo "✅ Labels ensured on $REPO:"
gh label list --repo "$REPO" \
  | grep -E '^(P[0-2]|voice|ui|permissions|bluetooth|crash|needs-repro|testflight)([[:space:]]|$)' \
  || true
