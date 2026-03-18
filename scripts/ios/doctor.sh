#!/bin/bash
# scripts/ios/doctor.sh — MAIA iOS Environment Verification
#
# Checks that every dependency required for a successful iOS build is present
# and at the correct version before you run build.sh or upload.sh.
#
# Usage:
#   ./scripts/ios/doctor.sh
#
# Exit codes:
#   0 — All checks passed
#   1 — One or more checks failed (details printed above)

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

# ── colour helpers ────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

PASS=0
FAIL=0
WARN=0

ok()   { echo -e "  ${GREEN}✅ $1${NC}";   PASS=$((PASS+1)); }
fail() { echo -e "  ${RED}❌ $1${NC}";    FAIL=$((FAIL+1)); }
warn() { echo -e "  ${YELLOW}⚠️  $1${NC}"; WARN=$((WARN+1)); }
info() { echo -e "  ${BLUE}ℹ️  $1${NC}"; }

# ── utility: compare semver ───────────────────────────────────────────────────
# Returns 0 if $1 >= $2
version_gte() {
  [ "$(printf '%s\n' "$1" "$2" | sort -V | head -1)" = "$2" ]
}

# ── header ────────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}══════════════════════════════════════════${NC}"
echo -e "${BOLD}  MAIA iOS Doctor${NC}"
echo -e "${BOLD}══════════════════════════════════════════${NC}"
echo ""

# ── 1. Node.js ────────────────────────────────────────────────────────────────
echo -e "${BOLD}[1] Runtime environment${NC}"

if node_ver=$(node --version 2>/dev/null); then
  node_ver="${node_ver#v}"
  if version_gte "$node_ver" "22.0.0"; then
    ok "Node.js v$node_ver (>= 22 required)"
  else
    fail "Node.js v$node_ver — need >= 22. Run: nvm install 22 && nvm use 22"
  fi
else
  fail "Node.js not found. Install via: https://nodejs.org or nvm"
fi

# ── 2. npm ────────────────────────────────────────────────────────────────────
if npm_ver=$(npm --version 2>/dev/null); then
  if version_gte "$npm_ver" "10.0.0"; then
    ok "npm v$npm_ver (>= 10 required)"
  else
    fail "npm v$npm_ver — need >= 10. Run: npm install -g npm@latest"
  fi
else
  fail "npm not found"
fi

# ── 3. Xcode ──────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}[2] Xcode toolchain${NC}"

if xcode_path=$(xcode-select -p 2>/dev/null); then
  ok "Xcode tools at: $xcode_path"
else
  fail "Xcode command-line tools not found. Run: xcode-select --install"
fi

if xcodebuild_ver=$(xcodebuild -version 2>/dev/null | head -1); then
  ok "$xcodebuild_ver"
else
  fail "xcodebuild unavailable — open Xcode and accept license"
fi

# Check for simulator SDK (required for archive)
if xcrun simctl list >/dev/null 2>&1; then
  ok "Simulator runtime available"
else
  warn "Simulator runtime unavailable — archive may still work but diagnostics limited"
fi

# ── 4. Ruby + Bundler ─────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}[3] Ruby / Bundler / Fastlane${NC}"

if ruby_ver=$(ruby --version 2>/dev/null | awk '{print $2}'); then
  if version_gte "$ruby_ver" "3.3.0"; then
    ok "Ruby v$ruby_ver (>= 3.3 required)"
  else
    fail "Ruby v$ruby_ver — need >= 3.3. Use rbenv/rvm to upgrade"
  fi
else
  fail "Ruby not found"
fi

if bundler_ver=$(bundle --version 2>/dev/null | awk '{print $3}'); then
  ok "Bundler v$bundler_ver"
else
  fail "Bundler not found. Run: gem install bundler"
fi

# Check Gemfile.lock is present and Fastlane is installed via bundle
if [ -f "$REPO_ROOT/ios/App/Gemfile" ]; then
  ok "Gemfile present"
  if (cd "$REPO_ROOT/ios/App" && bundle exec fastlane --version >/dev/null 2>&1); then
    fl_ver=$(cd "$REPO_ROOT/ios/App" && bundle exec fastlane --version 2>/dev/null | tail -1)
    ok "Fastlane $fl_ver (via bundle exec)"
  else
    fail "Fastlane not installed for this project. Run: cd ios/App && bundle install"
  fi
else
  fail "ios/App/Gemfile not found — Fastlane not configured"
fi

# ── 5. CocoaPods ──────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}[4] CocoaPods${NC}"

if pod_ver=$(pod --version 2>/dev/null); then
  if version_gte "$pod_ver" "1.16.0"; then
    ok "CocoaPods v$pod_ver (>= 1.16 required)"
  else
    fail "CocoaPods v$pod_ver — need >= 1.16. Run: sudo gem install cocoapods"
  fi
else
  fail "CocoaPods not found. Run: sudo gem install cocoapods"
fi

# ── 6. Capacitor ──────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}[5] Capacitor${NC}"

if cap_ver=$(cd "$REPO_ROOT" && npx cap --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1); then
  if version_gte "$cap_ver" "8.0.0"; then
    ok "Capacitor v$cap_ver (>= 8 required)"
  else
    fail "Capacitor v$cap_ver — need >= 8"
  fi
else
  fail "Capacitor CLI not found. Run: npm install"
fi

# ── 7. Project structure ──────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}[6] Project structure${NC}"

workspace="$REPO_ROOT/ios/App/App.xcworkspace"
if [ -d "$workspace" ]; then
  ok "ios/App/App.xcworkspace exists"
else
  fail "ios/App/App.xcworkspace missing — run: npx cap sync ios"
fi

podfile="$REPO_ROOT/ios/App/Podfile"
if [ -f "$podfile" ]; then
  ok "ios/App/Podfile exists"
else
  fail "ios/App/Podfile missing — project setup incomplete"
fi

podfile_lock="$REPO_ROOT/ios/App/Podfile.lock"
if [ -f "$podfile_lock" ]; then
  ok "Podfile.lock present (pods installed)"
else
  warn "Podfile.lock missing — run: cd ios/App && pod install"
fi

info_plist="$REPO_ROOT/ios/App/App/Info.plist"
if [ -f "$info_plist" ]; then
  ok "ios/App/App/Info.plist exists"
else
  fail "ios/App/App/Info.plist missing — project setup incomplete"
fi

patch_script="$REPO_ROOT/scripts/capacitor-patch-routes.sh"
if [ -f "$patch_script" ] && [ -x "$patch_script" ]; then
  ok "scripts/capacitor-patch-routes.sh exists and is executable"
else
  fail "scripts/capacitor-patch-routes.sh missing or not executable"
fi

export_options="$REPO_ROOT/ios/App/exportOptions.plist"
if [ -f "$export_options" ]; then
  ok "ios/App/exportOptions.plist exists"
else
  fail "ios/App/exportOptions.plist missing — gym cannot export IPA"
fi

# ── 8. Bundle ID ──────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}[7] Bundle ID + Team${NC}"

EXPECTED_BUNDLE_ID="life.soullab.maia"
EXPECTED_TEAM_ID="ZVK2X646Z2"

if bundle_id=$(cd "$REPO_ROOT" && node -e "const c=require('./capacitor.config.ts' in require.resolve ? './capacitor.config.ts' : './capacitor.config'); console.log(c.default?.appId ?? c.appId ?? '')" 2>/dev/null) && [ -n "$bundle_id" ]; then
  if [ "$bundle_id" = "$EXPECTED_BUNDLE_ID" ]; then
    ok "Bundle ID: $bundle_id"
  else
    fail "Bundle ID mismatch: got $bundle_id, expected $EXPECTED_BUNDLE_ID"
  fi
else
  # Fallback: grep capacitor.config.ts directly
  if grep -q "$EXPECTED_BUNDLE_ID" "$REPO_ROOT/capacitor.config.ts" 2>/dev/null; then
    ok "Bundle ID: $EXPECTED_BUNDLE_ID (found in capacitor.config.ts)"
  else
    warn "Could not verify Bundle ID — check capacitor.config.ts"
  fi
fi

# Team ID in Fastfile
if grep -q "$EXPECTED_TEAM_ID" "$REPO_ROOT/ios/App/fastlane/Fastfile" 2>/dev/null; then
  ok "Team ID: $EXPECTED_TEAM_ID (in Fastfile)"
else
  warn "Team ID $EXPECTED_TEAM_ID not found in Fastfile — check ios/App/fastlane/Fastfile"
fi

# ── 9. Code signing ───────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}[8] Code signing${NC}"

# Look for Apple Distribution or iPhone Distribution identity
if security find-identity -v -p codesigning 2>/dev/null | grep -qiE "(Apple Distribution|iPhone Distribution)"; then
  cert_count=$(security find-identity -v -p codesigning 2>/dev/null | grep -cE "(Apple Distribution|iPhone Distribution)" || true)
  ok "$cert_count code-signing certificate(s) found"
else
  fail "No 'Apple Distribution' or 'iPhone Distribution' certificates found"
  info "Check: security find-identity -v -p codesigning"
  info "Ensure certificate is in login keychain and not expired"
fi

# ── 10. ASC API key ───────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}[9] App Store Connect API key${NC}"

ASC_KEY_ID="36J9MBP9U6"
ASC_KEY_PATH="$HOME/.appstoreconnect/private_keys/AuthKey_${ASC_KEY_ID}.p8"

if [ -f "$ASC_KEY_PATH" ]; then
  ok "ASC API key: $ASC_KEY_PATH"
else
  fail "ASC API key not found: $ASC_KEY_PATH"
  info "Download from App Store Connect → Users & Access → Keys"
fi

# Env vars (Fastlane beta lane needs these or ASC_KEY_PATH)
if [ -n "${ASC_KEY_ID:-}" ] && [ -n "${ASC_ISSUER_ID:-}" ]; then
  if [ -n "${ASC_KEY_CONTENT:-}" ] || [ -n "${ASC_KEY_PATH:-}" ]; then
    ok "ASC env vars set (ASC_KEY_ID + ASC_ISSUER_ID + key)"
  else
    warn "ASC_KEY_CONTENT and ASC_KEY_PATH env vars not set — upload.sh will use file path fallback"
  fi
else
  warn "ASC_KEY_ID / ASC_ISSUER_ID env vars not set — upload.sh sets them from hardcoded values"
fi

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}══════════════════════════════════════════${NC}"

TOTAL=$((PASS + FAIL + WARN))
echo -e "  Results: ${GREEN}$PASS passed${NC}  ${RED}$FAIL failed${NC}  ${YELLOW}$WARN warnings${NC}  (of $TOTAL checks)"

if [ $FAIL -gt 0 ]; then
  echo ""
  echo -e "  ${RED}❌ Environment not ready — fix the failed checks above before building${NC}"
  echo ""
  exit 1
elif [ $WARN -gt 0 ]; then
  echo ""
  echo -e "  ${YELLOW}⚠️  Environment mostly ready — review warnings before uploading${NC}"
  echo ""
  exit 0
else
  echo ""
  echo -e "  ${GREEN}✅ Environment ready — proceed with ./scripts/ios/build.sh${NC}"
  echo ""
  exit 0
fi
