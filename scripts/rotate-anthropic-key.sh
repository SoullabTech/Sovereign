#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# MAIA Sovereign - Anthropic API Key Rotation
# ═══════════════════════════════════════════════════════════════════════════════
# Usage:
#   ./scripts/rotate-anthropic-key.sh [--dry-run] [--key-name "name"]
#
# What it does:
#   1. Creates a new Anthropic API key via the Admin API
#   2. Updates ANTHROPIC_API_KEY in .env.production in-place
#   3. Recreates maia-sovereign + maia-rlm containers with the new key
#   4. Runs a health check to confirm the new key is live
#   5. Deactivates the old key (only after health check passes)
#
# Prerequisites:
#   - ANTHROPIC_ADMIN_API_KEY must be set (separate from the regular API key)
#     Source it via: export ANTHROPIC_ADMIN_API_KEY="sk-admin-..."
#     Or store it in .env.admin (gitignored) and this script will load it.
#   - jq must be installed: brew install jq
#   - Containers must already be running (docker ps shows maia-sovereign healthy)
#
# Rollback:
#   If health check fails, the old key is restored from backup automatically.
#
# Dry run:
#   ./scripts/rotate-anthropic-key.sh --dry-run
#   Shows what would happen without touching keys or containers.
# ═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_DIR/.env.production"
ENV_ADMIN_FILE="$PROJECT_DIR/.env.admin"
COMPOSE_FILE="$PROJECT_DIR/docker-compose.production.yml"
ANTHROPIC_API="https://api.anthropic.com/v1"
ANTHROPIC_VERSION="2023-06-01"
ROTATION_LOG="$PROJECT_DIR/.key-rotation.log"

# Containers that use ANTHROPIC_API_KEY
ANTHROPIC_CONTAINERS="maia-sovereign maia-rlm"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $1" >&2; }

DRY_RUN=false
KEY_NAME="maia-sovereign-$(date +%Y%m%d)"

# Parse args
for arg in "$@"; do
  case $arg in
    --dry-run) DRY_RUN=true ;;
    --key-name) KEY_NAME="$2"; shift ;;
    --key-name=*) KEY_NAME="${arg#*=}" ;;
  esac
done

# ─── Prerequisites ─────────────────────────────────────────────────────────────

check_prerequisites() {
  log_info "Checking prerequisites..."

  # jq required for JSON parsing
  if ! command -v jq &>/dev/null; then
    log_error "jq is required but not installed. Run: brew install jq"
    exit 1
  fi

  # Load admin key from .env.admin if not already in environment
  if [ -z "${ANTHROPIC_ADMIN_API_KEY:-}" ] && [ -f "$ENV_ADMIN_FILE" ]; then
    log_info "Loading admin key from .env.admin..."
    # Safe export: only pick the ANTHROPIC_ADMIN_API_KEY line
    eval "$(grep '^ANTHROPIC_ADMIN_API_KEY=' "$ENV_ADMIN_FILE" | head -1)"
    export ANTHROPIC_ADMIN_API_KEY
  fi

  if [ -z "${ANTHROPIC_ADMIN_API_KEY:-}" ]; then
    log_error "ANTHROPIC_ADMIN_API_KEY is not set."
    echo ""
    echo "  Get one at: console.anthropic.com → Settings → Admin API Keys"
    echo ""
    echo "  Then either:"
    echo "    export ANTHROPIC_ADMIN_API_KEY='sk-admin-...' && ./scripts/rotate-anthropic-key.sh"
    echo "  Or store it in .env.admin (gitignored):"
    echo "    echo 'ANTHROPIC_ADMIN_API_KEY=sk-admin-...' > .env.admin"
    exit 1
  fi

  # Verify admin key is valid before doing anything
  log_info "Verifying admin key..."
  local http_code
  http_code=$(curl -s -o /dev/null -w "%{http_code}" \
    "$ANTHROPIC_API/organizations/api_keys?limit=1" \
    -H "anthropic-version: $ANTHROPIC_VERSION" \
    -H "X-Api-Key: $ANTHROPIC_ADMIN_API_KEY")

  if [ "$http_code" != "200" ]; then
    log_error "Admin key verification failed (HTTP $http_code). Check the key is valid and has API key management permissions."
    exit 1
  fi

  log_success "Admin key valid."

  # Check .env.production exists and has ANTHROPIC_API_KEY
  if [ ! -f "$ENV_FILE" ]; then
    log_error ".env.production not found at $ENV_FILE"
    exit 1
  fi

  if ! grep -q '^ANTHROPIC_API_KEY=' "$ENV_FILE"; then
    log_error "ANTHROPIC_API_KEY not found in .env.production"
    exit 1
  fi

  # Check compose file
  if [ ! -f "$COMPOSE_FILE" ]; then
    log_error "docker-compose.production.yml not found"
    exit 1
  fi

  log_success "All prerequisites met."
}

# ─── Read current key ID ────────────────────────────────────────────────────────

get_current_key_id() {
  local current_key
  current_key=$(grep '^ANTHROPIC_API_KEY=' "$ENV_FILE" | cut -d= -f2- | tr -d '"' | tr -d "'")

  if [ -z "$current_key" ]; then
    log_warn "Could not read current ANTHROPIC_API_KEY value from .env.production"
    echo ""
    return
  fi

  # Anthropic keys have a hint embedded: the last 6 chars are a stable suffix
  # Use the list endpoint to find matching key by hint
  local hint="${current_key: -6}"
  log_info "Finding current key by suffix hint: ...${hint}"

  local response
  response=$(curl -s \
    "$ANTHROPIC_API/organizations/api_keys?limit=100" \
    -H "anthropic-version: $ANTHROPIC_VERSION" \
    -H "X-Api-Key: $ANTHROPIC_ADMIN_API_KEY")

  # Extract the key ID where the hint matches (partial_key_hint field)
  local key_id
  key_id=$(echo "$response" | jq -r \
    --arg hint "$hint" \
    '.data[] | select(.partial_key_hint | endswith($hint)) | .id' 2>/dev/null | head -1)

  if [ -n "$key_id" ] && [ "$key_id" != "null" ]; then
    log_success "Found current key ID: $key_id"
    echo "$key_id"
  else
    log_warn "Could not match current key in Admin API listing (will skip deactivation of old key)"
    echo ""
  fi
}

# ─── Create new key ────────────────────────────────────────────────────────────

create_new_key() {
  log_info "Creating new API key: '$KEY_NAME'..."

  local response
  response=$(curl -s -X POST \
    "$ANTHROPIC_API/organizations/api_keys" \
    -H "anthropic-version: $ANTHROPIC_VERSION" \
    -H "X-Api-Key: $ANTHROPIC_ADMIN_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"name\": \"$KEY_NAME\"}")

  # Check for errors
  local error
  error=$(echo "$response" | jq -r '.error.message // empty' 2>/dev/null)
  if [ -n "$error" ]; then
    log_error "Failed to create new key: $error"
    exit 1
  fi

  local new_key new_id
  new_key=$(echo "$response" | jq -r '.api_key // empty')
  new_id=$(echo "$response" | jq -r '.id // empty')

  if [ -z "$new_key" ] || [ "$new_key" = "null" ]; then
    log_error "API returned no key value. Full response:"
    echo "$response" | jq . >&2
    exit 1
  fi

  log_success "New key created (ID: $new_id)"
  # Return both as newline-separated: key\nid
  printf '%s\n%s' "$new_key" "$new_id"
}

# ─── Update .env.production ───────────────────────────────────────────────────

update_env_file() {
  local new_key="$1"

  # Backup first
  local backup_file="${ENV_FILE}.rotation-backup-$(date +%Y%m%d-%H%M%S)"
  cp "$ENV_FILE" "$backup_file"
  log_info "Backup saved: $(basename "$backup_file")"

  # Replace in-place (macOS sed requires -i '')
  sed -i '' "s|^ANTHROPIC_API_KEY=.*|ANTHROPIC_API_KEY=${new_key}|" "$ENV_FILE"

  # Verify write
  if grep -q '^ANTHROPIC_API_KEY=' "$ENV_FILE"; then
    log_success ".env.production updated."
  else
    log_error "Failed to update .env.production — restoring backup"
    cp "$backup_file" "$ENV_FILE"
    exit 1
  fi
}

# ─── Restart containers ────────────────────────────────────────────────────────

restart_containers() {
  log_info "Recreating containers: $ANTHROPIC_CONTAINERS..."

  # shellcheck disable=SC2086
  docker compose -f "$COMPOSE_FILE" up -d --force-recreate $ANTHROPIC_CONTAINERS

  log_info "Waiting for containers to become healthy (up to 60s)..."
  local elapsed=0
  local all_healthy=false

  while [ $elapsed -lt 60 ]; do
    sleep 5
    elapsed=$((elapsed + 5))

    local unhealthy=0
    for container in $ANTHROPIC_CONTAINERS; do
      local status
      status=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "missing")
      if [ "$status" != "healthy" ]; then
        unhealthy=$((unhealthy + 1))
      fi
    done

    if [ $unhealthy -eq 0 ]; then
      all_healthy=true
      break
    fi

    log_info "  ${elapsed}s — waiting for health checks..."
  done

  if [ "$all_healthy" = true ]; then
    log_success "All containers healthy."
  else
    log_warn "Containers did not reach healthy state within 60s — check logs:"
    for container in $ANTHROPIC_CONTAINERS; do
      echo "  docker logs $container --tail 20"
    done
  fi
}

# ─── Health check ─────────────────────────────────────────────────────────────

run_health_check() {
  log_info "Running health check against soullab.life..."

  local http_code
  http_code=$(curl -sS -o /dev/null -w "%{http_code}" \
    --max-time 15 \
    "https://soullab.life/api/health" 2>/dev/null || echo "000")

  if [ "$http_code" = "200" ]; then
    log_success "Health check passed (HTTP 200)."
    return 0
  else
    log_error "Health check failed (HTTP $http_code)."
    return 1
  fi
}

# ─── Deactivate old key ────────────────────────────────────────────────────────

deactivate_old_key() {
  local old_key_id="$1"

  if [ -z "$old_key_id" ]; then
    log_warn "No old key ID — skipping deactivation."
    return
  fi

  log_info "Deactivating old key: $old_key_id..."

  local http_code
  http_code=$(curl -s -o /dev/null -w "%{http_code}" \
    -X DELETE \
    "$ANTHROPIC_API/organizations/api_keys/$old_key_id" \
    -H "anthropic-version: $ANTHROPIC_VERSION" \
    -H "X-Api-Key: $ANTHROPIC_ADMIN_API_KEY")

  if [ "$http_code" = "200" ] || [ "$http_code" = "204" ]; then
    log_success "Old key deactivated."
  else
    log_warn "Deactivation returned HTTP $http_code — check console.anthropic.com to confirm."
  fi
}

# ─── Log rotation event ────────────────────────────────────────────────────────

log_rotation() {
  local status="$1"
  local old_id="${2:-unknown}"
  local new_id="${3:-unknown}"

  local entry
  entry="$(date -u +%Y-%m-%dT%H:%M:%SZ) status=$status old_key_id=$old_id new_key_id=$new_id key_name=$KEY_NAME"
  echo "$entry" >> "$ROTATION_LOG"
  log_info "Rotation logged: $entry"
}

# ─── Rollback ─────────────────────────────────────────────────────────────────

rollback() {
  local backup_file="$1"
  log_warn "Rolling back to backup: $(basename "$backup_file")..."
  cp "$backup_file" "$ENV_FILE"
  restart_containers
  log_warn "Rollback complete. New key was NOT deactivated — revoke it manually at console.anthropic.com"
}

# ─── Main ─────────────────────────────────────────────────────────────────────

main() {
  echo ""
  echo "═══════════════════════════════════════════════════════════════"
  echo "  MAIA Sovereign — Anthropic API Key Rotation"
  if [ "$DRY_RUN" = true ]; then
    echo "  ⚠️  DRY RUN — no changes will be made"
  fi
  echo "═══════════════════════════════════════════════════════════════"
  echo ""

  cd "$PROJECT_DIR"

  check_prerequisites

  # Capture old key ID before anything changes
  local old_key_id
  old_key_id=$(get_current_key_id)

  if [ "$DRY_RUN" = true ]; then
    echo ""
    log_info "Dry run complete. Would have:"
    echo "  1. Created new key named '$KEY_NAME'"
    echo "  2. Updated ANTHROPIC_API_KEY in .env.production"
    echo "  3. Recreated containers: $ANTHROPIC_CONTAINERS"
    echo "  4. Run health check at https://soullab.life/api/health"
    if [ -n "$old_key_id" ]; then
      echo "  5. Deactivated old key: $old_key_id"
    fi
    echo ""
    exit 0
  fi

  # Create the new key (returns "new_key\nnew_id")
  local key_output new_key new_id
  key_output=$(create_new_key)
  new_key=$(echo "$key_output" | head -1)
  new_id=$(echo "$key_output" | tail -1)

  # Update .env.production (backup is made inside)
  update_env_file "$new_key"
  # Find the backup we just made
  local latest_backup
  latest_backup=$(ls -t "${ENV_FILE}".rotation-backup-* 2>/dev/null | head -1)

  # Restart containers
  restart_containers

  # Health check — rollback if it fails
  if ! run_health_check; then
    log_error "Health check failed after key rotation. Rolling back..."
    rollback "$latest_backup"
    log_rotation "FAILED_ROLLBACK" "$old_key_id" "$new_id"
    exit 1
  fi

  # All good — deactivate the old key
  deactivate_old_key "$old_key_id"

  log_rotation "SUCCESS" "$old_key_id" "$new_id"

  echo ""
  echo "═══════════════════════════════════════════════════════════════"
  log_success "Key rotation complete."
  echo ""
  echo "  New key name : $KEY_NAME"
  echo "  New key ID   : $new_id"
  echo "  Old key      : ${old_key_id:-(not tracked — verify at console.anthropic.com)}"
  echo "  Rotation log : $ROTATION_LOG"
  echo "═══════════════════════════════════════════════════════════════"
  echo ""
}

main "$@"
