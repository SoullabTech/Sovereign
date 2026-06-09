#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# MAIA Sovereign — Zero-Downtime (health-gated) Deploy
# ═══════════════════════════════════════════════════════════════════════════════
# Replaces the `up -d --build maia` recreate that causes a ~1–2 min 502 window
# (Caddy proxies to the new container before Next.js binds :3000 — heavy
# consciousness-engine boot + schema gate). This script keeps the OLD container
# serving until the NEW one passes a readiness check, then cuts Caddy over with a
# graceful reload (in-flight requests drained, never dropped).
#
# Mechanism (see docs/ops/ZERO_DOWNTIME_DEPLOY_2026-06-09.md for the full design):
#   1. build new image
#   2. start a transient `maia-sovereign-standby` on the new image
#   3. health-gate the standby on /api/consciousness/health
#   4. point Caddy at the standby + graceful reload   ← cutover 1 (atomic)
#   5. recreate the canonical `maia-sovereign` on the new image (boot now invisible)
#   6. health-gate the canonical
#   7. point Caddy back at the canonical + graceful reload  ← cutover 2 (atomic)
#   8. drain, then stop+remove the standby
#
# The canonical container NAME (`maia-sovereign`) is preserved in steady state, so
# every `docker exec/logs/inspect maia-sovereign` admin script keeps working.
#
# USAGE (run on minisforum, from ~/MAIA-SOVEREIGN):
#   ./scripts/deploy-zero-downtime.sh deploy        # full zero-downtime deploy
#   ./scripts/deploy-zero-downtime.sh deploy --dry-run
#   ./scripts/deploy-zero-downtime.sh status        # show colors + current Caddy target
#   ./scripts/deploy-zero-downtime.sh point-canonical   # force Caddy back to canonical + reload
#   ./scripts/deploy-zero-downtime.sh cleanup-standby   # stop+remove a leftover standby
#
# This is intentionally NOT wired into CI. It runs from clean-main-no-secrets, the
# same branch as the existing flow. The legacy `up -d --build maia` still works as
# a fallback (with the old 502 window).
# ═══════════════════════════════════════════════════════════════════════════════
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

# ── Configuration (override via env) ───────────────────────────────────────────
PROJECT="${MAIA_COMPOSE_PROJECT:-maia-sovereign}"
COMPOSE_BASE="${MAIA_COMPOSE_FILE:-docker-compose.production.yml}"
COMPOSE_OVERRIDE="${MAIA_COMPOSE_BLUEGREEN:-docker-compose.bluegreen.yml}"
ENV_FILE="${MAIA_ENV_FILE:-.env.production}"

CANONICAL="maia-sovereign"              # canonical container name (preserved)
STANDBY="maia-sovereign-standby"        # transient container name
STANDBY_SVC="maia-standby"              # compose service name in the override
CANONICAL_SVC="maia"                    # compose service name in the base file

CADDY="maia-caddy"
UPSTREAM_FILE="upstream-maia.caddy"                # host path (bind-mounted into caddy)
CADDY_CONF="/etc/caddy/Caddyfile"

HEALTH_PATH="/api/consciousness/health"
HEALTH_TIMEOUT="${HEALTH_TIMEOUT:-240}"   # seconds to wait for a container to go healthy
HEALTH_INTERVAL="${HEALTH_INTERVAL:-5}"
DRAIN_SECONDS="${DRAIN_SECONDS:-15}"      # let Caddy keep-alives cycle before removing old

DRY_RUN=0

# ── Pretty logging ──────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
log()  { echo -e "${BLUE}[deploy]${NC} $1"; }
ok()   { echo -e "${GREEN}[ ok ]${NC} $1"; }
warn() { echo -e "${YELLOW}[warn]${NC} $1"; }
err()  { echo -e "${RED}[fail]${NC} $1" >&2; }

run() {
	if [[ "$DRY_RUN" == "1" ]]; then
		echo -e "${YELLOW}[dry-run]${NC} $*"
	else
		"$@"
	fi
}

compose() { run docker compose -p "$PROJECT" -f "$COMPOSE_BASE" -f "$COMPOSE_OVERRIDE" --env-file "$ENV_FILE" --profile bluegreen "$@"; }

# ── Preflight ────────────────────────────────────────────────────────────────────
preflight() {
	[[ -f "$COMPOSE_BASE" ]]     || { err "missing $COMPOSE_BASE (run from repo root on minisforum)"; exit 1; }
	[[ -f "$COMPOSE_OVERRIDE" ]] || { err "missing $COMPOSE_OVERRIDE"; exit 1; }
	[[ -f "$ENV_FILE" ]]         || { err "missing $ENV_FILE"; exit 1; }
	[[ -f "$UPSTREAM_FILE" ]]    || { err "missing $UPSTREAM_FILE (Caddy floating-upstream pointer)"; exit 1; }
	command -v docker >/dev/null || { err "docker not found"; exit 1; }
	if ! docker ps --format '{{.Names}}' | grep -qx "$CADDY"; then
		err "$CADDY container is not running — refusing to deploy (cutover needs Caddy)"; exit 1
	fi
	# Confirm Caddy can actually see the upstream pointer (mount + import wired).
	if ! docker exec "$CADDY" test -f "$CADDY_CONF"; then
		err "$CADDY has no $CADDY_CONF — Caddy not configured as expected"; exit 1
	fi
}

# Point the Caddy floating upstream at a target container and graceful-reload.
# $1 = target host:port (e.g. maia-sovereign:3000 or maia-sovereign-standby:3000)
point_caddy() {
	local target="$1"
	log "pointing Caddy upstream → ${target} and reloading (graceful)…"
	if [[ "$DRY_RUN" == "1" ]]; then
		echo -e "${YELLOW}[dry-run]${NC} rewrite ${UPSTREAM_FILE}: reverse_proxy …:3000 → reverse_proxy ${target}"
		echo -e "${YELLOW}[dry-run]${NC} docker exec ${CADDY} caddy validate && caddy reload"
		return 0
	fi
	# Rewrite BOTH snippets' address (matches maia-sovereign:3000 and maia-sovereign-standby:3000).
	# Portable in-place edit — GNU and BSD/macOS sed disagree on `-i`, so use a temp file.
	sed -E "s#reverse_proxy maia-sovereign(-standby)?:3000#reverse_proxy ${target}#g" "$UPSTREAM_FILE" > "${UPSTREAM_FILE}.tmp"
	mv "${UPSTREAM_FILE}.tmp" "$UPSTREAM_FILE"
	# Validate BEFORE reloading so a bad edit can never take Caddy down.
	if ! docker exec "$CADDY" caddy validate --config "$CADDY_CONF" --adapter caddyfile >/dev/null 2>&1; then
		err "caddy validate FAILED after pointing at ${target} — NOT reloading"
		return 1
	fi
	docker exec "$CADDY" caddy reload --config "$CADDY_CONF" --adapter caddyfile
	ok "Caddy now serving from ${target}"
}

current_caddy_target() {
	grep -oE 'reverse_proxy maia-sovereign(-standby)?:3000' "$UPSTREAM_FILE" | head -1 | awk '{print $2}'
}

# Block until a container's internal /api/consciousness/health returns 200, or timeout.
wait_healthy() {
	local container="$1" waited=0
	log "health-gating ${container} (${HEALTH_PATH}, timeout ${HEALTH_TIMEOUT}s)…"
	if [[ "$DRY_RUN" == "1" ]]; then echo -e "${YELLOW}[dry-run]${NC} would poll ${container}${HEALTH_PATH}"; return 0; fi
	while (( waited < HEALTH_TIMEOUT )); do
		if docker exec "$container" node -e "require('http').get('http://localhost:3000${HEALTH_PATH}',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))" >/dev/null 2>&1; then
			ok "${container} healthy after ${waited}s"
			return 0
		fi
		sleep "$HEALTH_INTERVAL"; waited=$(( waited + HEALTH_INTERVAL ))
		printf '.'
	done
	echo
	err "${container} did not become healthy within ${HEALTH_TIMEOUT}s"
	warn "last 40 log lines from ${container}:"
	docker logs --tail 40 "$container" 2>&1 || true
	return 1
}

cleanup_standby() {
	if docker ps -a --format '{{.Names}}' | grep -qx "$STANDBY"; then
		log "removing standby ${STANDBY}…"
		compose stop "$STANDBY_SVC" >/dev/null 2>&1 || run docker stop "$STANDBY" >/dev/null 2>&1 || true
		compose rm -f "$STANDBY_SVC" >/dev/null 2>&1 || run docker rm -f "$STANDBY" >/dev/null 2>&1 || true
		ok "standby removed"
	else
		log "no standby container present"
	fi
}

cmd_status() {
	echo
	log "Caddy upstream pointer → $(current_caddy_target || echo '??')"
	echo
	log "MAIA app containers:"
	docker ps -a --filter "name=${CANONICAL}" --format 'table {{.Names}}\t{{.Status}}\t{{.Image}}' || true
	echo
}

# ── The deploy ───────────────────────────────────────────────────────────────────
cmd_deploy() {
	preflight

	export GIT_COMMIT="$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"
	log "deploying commit ${GIT_COMMIT} with zero downtime"

	# Safety: if a previous deploy died mid-flight leaving Caddy on the standby,
	# refuse to start until that's resolved — otherwise we'd recreate the canonical
	# while Caddy points at a standby we're about to churn.
	local target; target="$(current_caddy_target || true)"
	if [[ "$target" == "${STANDBY}:3000" ]]; then
		err "Caddy is currently pointed at the standby (${target}). A prior deploy did not finish."
		err "Resolve first:  ./scripts/deploy-zero-downtime.sh point-canonical   (then re-run)"
		exit 1
	fi

	# 1. Build the new image (shared by canonical + standby; both use maia-sovereign:prod).
	log "building new image…"
	compose build "$CANONICAL_SVC"

	# 2. Start the standby on the freshly-built image.
	log "starting standby ${STANDBY} on the new image…"
	compose up -d --no-deps --force-recreate "$STANDBY_SVC"

	# 3. Health-gate the standby. If it never goes healthy, abort with the canonical
	#    completely untouched (zero user impact).
	if ! wait_healthy "$STANDBY"; then
		err "standby unhealthy — aborting. Canonical is untouched and still serving."
		cleanup_standby
		exit 1
	fi

	# 4. Cutover #1 — Caddy → standby (atomic graceful reload).
	point_caddy "${STANDBY}:3000"

	# 5. Recreate the canonical on the new image. Its boot is invisible (standby serves).
	log "recreating canonical ${CANONICAL} on the new image (traffic is on the standby)…"
	compose up -d --no-deps --force-recreate "$CANONICAL_SVC"

	# 6. Health-gate the canonical. If it fails (e.g. schema gate), LEAVE Caddy on the
	#    standby so users keep serving, and exit non-zero for the operator to fix.
	if ! wait_healthy "$CANONICAL"; then
		err "canonical ${CANONICAL} did not become healthy."
		warn "Caddy is STILL serving from the standby — users are unaffected."
		warn "Likely a pending migration (schema gate). Fix, then:"
		warn "  ./scripts/apply-migrations.sh   &&   ./scripts/deploy-zero-downtime.sh deploy"
		exit 1
	fi

	# 7. Cutover #2 — Caddy → canonical (atomic graceful reload).
	point_caddy "${CANONICAL}:3000"

	# 8. Drain Caddy keep-alives, then retire the standby.
	log "draining ${DRAIN_SECONDS}s before retiring standby…"
	run sleep "$DRAIN_SECONDS"
	cleanup_standby

	ok "zero-downtime deploy of ${GIT_COMMIT} complete — canonical ${CANONICAL} is live."
	cmd_status
}

usage() {
	sed -n '2,40p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
}

# ── Arg parsing ──────────────────────────────────────────────────────────────────
CMD="${1:-help}"; shift || true
for a in "$@"; do [[ "$a" == "--dry-run" ]] && DRY_RUN=1; done

case "$CMD" in
	deploy)            cmd_deploy ;;
	status)            cmd_status ;;
	point-canonical)   preflight; point_caddy "${CANONICAL}:3000" ;;
	point-standby)     preflight; point_caddy "${STANDBY}:3000" ;;
	cleanup-standby)   cleanup_standby ;;
	help|--help|-h)    usage ;;
	*)                 err "unknown command: ${CMD}"; usage; exit 1 ;;
esac
