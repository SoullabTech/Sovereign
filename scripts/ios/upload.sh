#!/bin/bash
# scripts/ios/upload.sh — MAIA TestFlight Upload
#
# Uploads an existing IPA to TestFlight WITHOUT rebuilding.
# Requires build.sh to have completed successfully first.
#
# Usage:
#   ./scripts/ios/upload.sh
#   ./scripts/ios/upload.sh --ipa /path/to/custom.ipa   # Use a specific IPA
#   ./scripts/ios/upload.sh --notify                     # Notify beta testers (default: silent)
#   ./scripts/ios/upload.sh --changelog "What's new..."  # TestFlight changelog text
#
# Auth (in priority order):
#   1. ASC_KEY_CONTENT env var  — base64-encoded .p8 content (best for CI)
#   2. ASC_KEY_PATH env var     — explicit path to .p8 file
#   3. Default key path         — ~/.appstoreconnect/private_keys/AuthKey_36J9MBP9U6.p8
#
# All other ASC variables default to the MAIA production values if not set.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
IOS_APP="$REPO_ROOT/ios/App"
BUILD_DIR="$IOS_APP/build"
INFO_PLIST="$IOS_APP/App/Info.plist"

# UTF-8 required for Ruby/Fastlane
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

# ── defaults ──────────────────────────────────────────────────────────────────
IPA_PATH="$BUILD_DIR/MAIA.ipa"
NOTIFY=false
CHANGELOG=""

# ── ASC credentials (override via env vars) ───────────────────────────────────
export ASC_KEY_ID="${ASC_KEY_ID:-36J9MBP9U6}"
export ASC_ISSUER_ID="${ASC_ISSUER_ID:-2f3ea491-8e65-4769-b503-3c50172f10ab}"
# ASC_KEY_CONTENT — set externally for CI (base64-encoded .p8)
# ASC_KEY_PATH — fallback to well-known location if not set
if [ -z "${ASC_KEY_PATH:-}" ]; then
  export ASC_KEY_PATH="$HOME/.appstoreconnect/private_keys/AuthKey_${ASC_KEY_ID}.p8"
fi

# ── option parsing ────────────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    --ipa)        IPA_PATH="$2"; shift 2 ;;
    --notify)     NOTIFY=true; shift ;;
    --changelog)  CHANGELOG="$2"; shift 2 ;;
    *)            shift ;;
  esac
done

# ── colour helpers ────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

info() { echo -e "  ${BLUE}→${NC}  $1"; }
ok()   { echo -e "  ${GREEN}✅ $1${NC}"; }
fail() { echo -e "  ${RED}❌ FAILED: $1${NC}"; exit 1; }
warn() { echo -e "  ${YELLOW}⚠️ ${NC} $1"; }

# ── header ────────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}══════════════════════════════════════════${NC}"
echo -e "${BOLD}  MAIA TestFlight Upload${NC}"
echo -e "${BOLD}══════════════════════════════════════════${NC}"

# ── pre-flight checks ─────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}[1] Pre-flight${NC}"

if [ ! -f "$IPA_PATH" ]; then
  fail "IPA not found: $IPA_PATH\n       Run ./scripts/ios/build.sh first"
fi
IPA_SIZE_MB=$(du -sm "$IPA_PATH" | awk '{print $1}')
ok "IPA: $IPA_PATH (${IPA_SIZE_MB} MB)"

BUILD_NUM=$(/usr/libexec/PlistBuddy -c "Print :CFBundleVersion" "$INFO_PLIST" 2>/dev/null || echo "unknown")
MARKETING_VER=$(/usr/libexec/PlistBuddy -c "Print :CFBundleShortVersionString" "$INFO_PLIST" 2>/dev/null || echo "unknown")
ok "Build: $MARKETING_VER ($BUILD_NUM)"
info "Notify testers: $NOTIFY"

# Auth check — at least one of key content or key file must be available
if [ -n "${ASC_KEY_CONTENT:-}" ]; then
  ok "Auth: ASC_KEY_CONTENT env var (base64)"
elif [ -f "$ASC_KEY_PATH" ]; then
  ok "Auth: ASC_KEY_PATH ($ASC_KEY_PATH)"
else
  fail "No ASC authentication available.\n       Set ASC_KEY_CONTENT (base64) or ensure $ASC_KEY_PATH exists"
fi

# ── Fastlane upload ───────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}[2] Upload to TestFlight${NC}"
info "Using Fastlane upload_ipa lane (ios/App/fastlane/Fastfile)"

cd "$IOS_APP"

# Pass each key:value as a separate shell word — Fastlane parses positional args
# as "key:value" pairs. Combining them into one string causes Fastlane to treat
# the entire string as a single option value (the IPA path bug).
FL_NOTIFY="notify:false"
[ "$NOTIFY" = true ] && FL_NOTIFY="notify:true"

info "bundle exec fastlane ios upload_ipa ipa_path:$IPA_PATH $FL_NOTIFY"

if [ -n "$CHANGELOG" ]; then
  bundle exec fastlane ios upload_ipa \
    "ipa_path:$IPA_PATH" \
    "$FL_NOTIFY" \
    "changelog:$CHANGELOG"
else
  bundle exec fastlane ios upload_ipa \
    "ipa_path:$IPA_PATH" \
    "$FL_NOTIFY"
fi

# ── summary ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}══════════════════════════════════════════${NC}"
echo -e "${GREEN}${BOLD}  UPLOAD COMPLETE${NC}"
echo -e "  Build     : ${BOLD}$MARKETING_VER ($BUILD_NUM)${NC}"
echo -e "  IPA       : $IPA_PATH"
echo -e "  Notify    : $NOTIFY"
echo ""
echo -e "  Check build status:"
echo -e "    https://appstoreconnect.apple.com/apps"
echo -e "${BOLD}══════════════════════════════════════════${NC}"
echo ""
