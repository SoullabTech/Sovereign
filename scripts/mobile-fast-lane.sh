#!/usr/bin/env bash
#
# mobile-fast-lane.sh — one-command launcher for the Mobile Conversation
# Verification Loop (fast lane, Phase 1).
# Spec: docs/engineering/MOBILE_CONVERSATION_VERIFICATION_LOOP.md
#
# Starts the Capacitor DEV-mode path (live server, HMR) with a TRUTHFUL,
# EXPLICIT API target and a printed build-identity block. It makes NO product
# behavior changes — it only sets build-identity env vars and starts `next dev`.
#
# HARD RULES (fail loudly, non-zero exit):
#   * NEXT_PUBLIC_API_BASE_URL must be set explicitly — no silent prod fallback.
#   * A production target (soullab.life) requires FAST_LANE_ALLOW_PROD=1 and is
#     announced as the labeled PRODUCTION TEST exception (spec §2.1).
#
# Usage:
#   NEXT_PUBLIC_API_BASE_URL=http://192.168.0.101:3000 scripts/mobile-fast-lane.sh
#   NEXT_PUBLIC_API_BASE_URL=https://soullab.life FAST_LANE_ALLOW_PROD=1 scripts/mobile-fast-lane.sh
#   ... --dry-run    # validate + print identity, do NOT start the dev server

set -euo pipefail

DRY_RUN=0
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=1 ;;
    -h|--help) grep '^#' "$0" | sed 's/^#\{1,\} \{0,1\}//'; exit 0 ;;
    *) echo "unknown arg: $arg" >&2; exit 64 ;;
  esac
done

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

red() { printf '\033[31m%s\033[0m\n' "$*"; }
grn() { printf '\033[32m%s\033[0m\n' "$*"; }
ylw() { printf '\033[33m%s\033[0m\n' "$*"; }

# ── HARD GUARD 1: explicit API target (Kelly point 3) ────────────────────────
if [ -z "${NEXT_PUBLIC_API_BASE_URL:-}" ]; then
  red "✖ FAST-LANE REFUSED: NEXT_PUBLIC_API_BASE_URL is not set."
  echo "  The fast lane never falls back to production silently."
  echo "  Set an explicit target, e.g.:"
  echo "    NEXT_PUBLIC_API_BASE_URL=http://<lan-ip>:3000 $0"
  echo "  See docs/engineering/MOBILE_CONVERSATION_VERIFICATION_LOOP.md §2 / §2.1"
  exit 2
fi
API_TARGET="$NEXT_PUBLIC_API_BASE_URL"

# ── HARD GUARD 2: production target requires an explicit, named exception ─────
API_LC="$(printf '%s' "$API_TARGET" | tr 'A-Z' 'a-z')"
case "$API_LC" in
  *soullab.life*)
    if [ "${FAST_LANE_ALLOW_PROD:-0}" != "1" ]; then
      red "✖ FAST-LANE REFUSED: target is PRODUCTION ($API_TARGET)."
      echo "  Production is a deliberate, temporary exception (spec §2.1), not a default."
      echo "  To proceed you must name it explicitly:  FAST_LANE_ALLOW_PROD=1"
      echo "  Constraints: dedicated throwaway member · no Sanctuary/sensitive content ·"
      echo "  named time-boxed window · server-log correlation · cleanup after · no broad distribution."
      exit 3
    fi
    ENV_LABEL="PRODUCTION TEST"
    ;;
  *staging*) ENV_LABEL="STAGING" ;;
  *localhost*|*127.0.0.1*|*192.168.*|*10.*|*172.1[6-9].*|*172.2*|*172.3[01].*) ENV_LABEL="LOCAL DEV" ;;
  *) ENV_LABEL="$API_TARGET" ;;
esac

# ── build identity (captured now = build time for a dev server) ──────────────
SHA="$(git rev-parse --short HEAD 2>/dev/null || echo UNSTAMPED)"
BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo UNSTAMPED)"
BUILD_TIME="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
BUILD_MODE="capacitor-dev"
PORT="${PORT:-3000}"
LAN_IP="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo 127.0.0.1)"
LAN_URL="http://${LAN_IP}:${PORT}"

# ── soft warnings (do NOT block a live-reload dev loop) ──────────────────────
if [ -n "$(git status --porcelain 2>/dev/null || true)" ]; then
  ylw "⚠ working tree is dirty — dev-loop iteration is expected to dirty it, but the"
  ylw "  printed SHA ($SHA) is the last commit, not your uncommitted edits."
fi
case "$BRANCH" in
  chore/e2e-layout-invariants|clean-main-no-secrets|clean-main)
    ylw "⚠ on '$BRANCH' — prefer a dedicated fast-lane branch off clean-main." ;;
esac

# ── identity block ───────────────────────────────────────────────────────────
echo ""
if [ "$ENV_LABEL" = "PRODUCTION TEST" ]; then
  red "  ┌───────────────────────────────┐"
  red "  │        PRODUCTION TEST        │"
  red "  └───────────────────────────────┘"
else
  grn "  [$ENV_LABEL]"
fi
echo "  SHA        : $SHA"
echo "  branch     : $BRANCH"
echo "  build mode : $BUILD_MODE"
echo "  build time : $BUILD_TIME"
echo "  API target : $API_TARGET"
echo "  LAN URL    : $LAN_URL   (point the on-device WebView here)"
echo "  diagnostics: ${LAN_URL}/diag   (ENABLED via NEXT_PUBLIC_MOBILE_FAST_LANE=1)"
echo ""

export NEXT_PUBLIC_BUILD_SHA="$SHA"
export NEXT_PUBLIC_BUILD_BRANCH="$BRANCH"
export NEXT_PUBLIC_BUILD_TIME="$BUILD_TIME"
export NEXT_PUBLIC_BUILD_MODE="$BUILD_MODE"
export NEXT_PUBLIC_API_BASE_URL="$API_TARGET"
export CAPACITOR_MODE="dev"
export CAPACITOR_DEV_SERVER_URL="$LAN_URL"
export PORT="$PORT"
# Test-only diagnostics surface (/diag) renders ONLY when this flag is present.
export NEXT_PUBLIC_MOBILE_FAST_LANE="1"

if [ "$DRY_RUN" = "1" ]; then
  grn "✓ dry-run: preconditions satisfied, identity resolved. Dev server NOT started."
  echo "  On-device build:  CAPACITOR_DEV_SERVER_URL=$LAN_URL CAPACITOR_MODE=dev npx cap run ios"
  exit 0
fi

grn "▶ starting fast-lane dev server on $LAN_URL (Ctrl-C to stop)…"
echo "  On-device build (separate terminal):  CAPACITOR_DEV_SERVER_URL=$LAN_URL CAPACITOR_MODE=dev npx cap run ios"
exec npm run dev
