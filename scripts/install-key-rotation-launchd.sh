#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# Install (or reinstall) the Anthropic key rotation launchd job
# ═══════════════════════════════════════════════════════════════════════════════
# Usage: bash scripts/install-key-rotation-launchd.sh
# ═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

PLIST_SRC="$SCRIPT_DIR/life.soullab.anthropic-key-rotation.plist"
PLIST_LABEL="life.soullab.anthropic-key-rotation"
LAUNCH_AGENTS_DIR="$HOME/Library/LaunchAgents"
PLIST_DEST="$LAUNCH_AGENTS_DIR/$PLIST_LABEL.plist"
LOG_DIR="$PROJECT_DIR/logs"
ENV_ADMIN="$PROJECT_DIR/.env.admin"
ROTATE_SCRIPT="$SCRIPT_DIR/rotate-anthropic-key.sh"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
log_info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $1" >&2; }

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  MAIA Sovereign — Key Rotation launchd Installer"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# ── Preflight ─────────────────────────────────────────────────────────────────

log_info "Checking prerequisites..."

if [ ! -f "$PLIST_SRC" ]; then
  log_error "Plist not found: $PLIST_SRC"
  exit 1
fi

if [ ! -f "$ROTATE_SCRIPT" ]; then
  log_error "Rotation script not found: $ROTATE_SCRIPT"
  exit 1
fi

if ! command -v jq &>/dev/null; then
  log_error "jq is required: brew install jq"
  exit 1
fi

# Check .env.admin exists and has the admin key
if [ ! -f "$ENV_ADMIN" ]; then
  log_error ".env.admin not found at $ENV_ADMIN"
  echo ""
  echo "  Create it:"
  echo "    echo 'ANTHROPIC_ADMIN_API_KEY=sk-admin-...' > $ENV_ADMIN"
  echo "    chmod 600 $ENV_ADMIN"
  exit 1
fi

if ! grep -q '^ANTHROPIC_ADMIN_API_KEY=' "$ENV_ADMIN"; then
  log_error "ANTHROPIC_ADMIN_API_KEY not found in .env.admin"
  exit 1
fi

chmod 600 "$ENV_ADMIN"
log_success ".env.admin present and permissions locked (600)."

# Ensure logs dir exists
mkdir -p "$LOG_DIR"
log_success "Logs directory ready: $LOG_DIR"

# ── Install ───────────────────────────────────────────────────────────────────

mkdir -p "$LAUNCH_AGENTS_DIR"

# Unload if already installed (silent on failure — not installed yet is fine)
if launchctl list | grep -q "$PLIST_LABEL" 2>/dev/null; then
  log_info "Unloading existing job for reinstall..."
  launchctl unload "$PLIST_DEST" 2>/dev/null || true
fi

# Copy plist to LaunchAgents
cp "$PLIST_SRC" "$PLIST_DEST"
chmod 644 "$PLIST_DEST"
log_success "Plist installed: $PLIST_DEST"

# Load the job
launchctl load "$PLIST_DEST"
log_success "Job loaded into launchd."

# ── Verify ────────────────────────────────────────────────────────────────────

echo ""
log_info "Verifying installation..."

if launchctl list | grep -q "$PLIST_LABEL"; then
  log_success "Job is registered: $PLIST_LABEL"
else
  log_warn "Job does not appear in launchctl list — may need a re-login."
fi

# ── Dry run smoke test ────────────────────────────────────────────────────────

echo ""
log_info "Running dry-run smoke test..."
bash "$ROTATE_SCRIPT" --dry-run

# ── Summary ───────────────────────────────────────────────────────────────────

echo ""
echo "═══════════════════════════════════════════════════════════════"
log_success "Installation complete."
echo ""
echo "  Schedule     : Quarterly (Jan/Apr/Jul/Oct 1st at 03:00)"
echo "  Stdout log   : $LOG_DIR/key-rotation-launchd.log"
echo "  Stderr log   : $LOG_DIR/key-rotation-launchd.error.log"
echo "  Rotation log : $PROJECT_DIR/.key-rotation.log"
echo ""
echo "  Commands:"
echo "    Force run now    : launchctl start $PLIST_LABEL"
echo "    Check status     : launchctl list | grep anthropic"
echo "    Watch output     : tail -f $LOG_DIR/key-rotation-launchd.log"
echo "    Uninstall        : launchctl unload $PLIST_DEST && rm $PLIST_DEST"
echo "    Change schedule  : edit $PLIST_SRC then re-run this script"
echo "═══════════════════════════════════════════════════════════════"
echo ""
