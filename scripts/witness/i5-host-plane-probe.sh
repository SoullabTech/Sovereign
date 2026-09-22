#!/usr/bin/env bash
# JARVIS-KP-01 / I5 — host plane probe. READ ONLY. Run on minisforum.
#
# WHY IT EXISTS
#   I5-P0R2 dry run 2 hung indefinitely inside `docker inspect maia-sovereign`.
#   That is a statement about the Docker CONTROL PLANE and says nothing about
#   whether MAIA is serving members — request traffic reaches the app through
#   published ports and iptables, never through the Docker API socket. A wedged
#   daemon and a dead service are DIFFERENT INCIDENTS and must be diagnosed
#   separately before anything is restarted.
#
#   Part A is the founder's bounded Docker probe (2026-09-22), implemented here so
#   it is committed and reviewable rather than pasted.
#   Part B is the Docker-INDEPENDENT half, which Part A cannot supply.
#
# ⛔ It mutates nothing: no restart, no recreate, no config write, no database
#    write, no flag, no deploy. Every call carries a ceiling so this probe can
#    never itself become the ambiguous hang it exists to diagnose.

set -uo pipefail
CONTAINER="${I5_CONTAINER:-maia-sovereign}"
T="${I5_PROBE_TIMEOUT_S:-8}"
HOSTNAME_PUBLIC="${I5_PUBLIC_HOST:-soullab.life}"

run() { # run <label> <cmd...>
  local label="$1"; shift
  printf '\n── %s ──\n' "$label"
  local out rc=0
  out="$(timeout "$T" "$@" 2>&1)" || rc=$?
  if [ "$rc" = "124" ]; then printf 'TIMEOUT after %ss\n' "$T"; return 124; fi
  printf 'exit=%s\n' "$rc"
  [ -n "$out" ] && printf '%s\n' "$out"
  return "$rc"
}

echo "════ PART A · Docker control plane (founder probe, 2026-09-22) ════"
run "context-show"      docker context show
run "context-list"      docker context ls
run "server-version"    docker version --format 'server={{.Server.Version}}'
run "container-list"    docker ps --filter "name=^/${CONTAINER}$" --format '{{.ID}}	{{.Status}}	{{.Image}}'
run "container-inspect" docker inspect "$CONTAINER" --format 'id={{.Id}} image={{.Image}} status={{.State.Status}}'
A_INSPECT=$?

echo
echo "════ PART B · service liveness, INDEPENDENT of the Docker API ════"
echo "  Traffic reaches MAIA through published ports and iptables, not through"
echo "  dockerd's API. These calls therefore stay meaningful while Part A hangs."
echo "  Route: --resolve ${HOSTNAME_PUBLIC}:443:127.0.0.1 — public name for TLS SNI,"
echo "  loopback for the address. No DNS, no hairpin, no Docker API."
echo "  ⚠️ This probe diagnoses THE HOST IT RUNS ON. Run it on minisforum;"
echo "     elsewhere it reports that machine's Docker and localhost, not production."

# ⚠️ Two constraints must hold at once, and the first version satisfied only one.
#  (1) Do NOT resolve soullab.life through DNS from inside the LAN: consumer
#      routers usually disable hairpin NAT, so an external-name probe returns
#      HTTP 000 and is MISLEADING (CLAUDE.md, LAN IP drift trap).
#  (2) ⭐ The TLS handshake must still carry soullab.life as SNI. An HTTP
#      `Host:` header does NOT do this — it is sent AFTER the handshake, so
#      Caddy's SNI-based site matching never sees the public name and the
#      request is judged against 127.0.0.1. That was a real defect: it made a
#      HEALTHY production serving plane look broken.
#      Corrected 2026-09-22 (founder finding).
# --resolve satisfies both: the URL authority is the public name, so SNI is
# correct, while only the ADDRESS is forced to loopback.
RESOLVE="--resolve ${HOSTNAME_PUBLIC}:443:127.0.0.1"
BASE="https://${HOSTNAME_PUBLIC}"
run "caddy-tls-health"   bash -c "curl -sS -m $T $RESOLVE -o /dev/null -w 'http=%{http_code} time=%{time_total}s\n' $BASE/api/health"
run "caddy-health-body"  bash -c "curl -sS -m $T $RESOLVE $BASE/api/health  | head -c 400; echo"
run "caddy-version"      bash -c "curl -sS -m $T $RESOLVE $BASE/api/version | head -c 200; echo"
run "caddy-ready"        bash -c "curl -sS -m $T $RESOLVE $BASE/api/ready   | head -c 200; echo"

# Container processes are visible in the host PID namespace, so this reports
# whether the app process is alive without asking dockerd anything.
run "app-process"        bash -c "pgrep -af 'next-server|node .*server.js' | head -5 || echo '(no matching process)'"
run "listening-ports"    bash -c "(ss -ltnp 2>/dev/null || netstat -ltnp 2>/dev/null) | grep -E ':(80|443|3000|5432)\b' | head -10"

echo
echo "════ CLASSIFY ════"
cat <<'GUIDE'
  context ok · version/ps/inspect TIMEOUT      → DOCKER_DAEMON_UNRESPONSIVE_TO_CLI
  context or daemon reports socket/context err → DOCKER_CONTEXT_OR_SOCKET_UNAVAILABLE
  version + ps ok · only inspect TIMEOUT       → CONTAINER_INSPECT_PATH_STALL
  Docker ok · container absent                 → CONTAINER_NOT_FOUND
  all Docker calls normal                      → the stall is not generically Docker's;
                                                 inspect the exact script/shell call
  ⭐ Cross Part A with Part B before concluding:
     A broken + B healthy → management-plane incident ONLY. MAIA is serving.
                            ⛔ Do NOT restart Docker or the container to
                               "fix" a witness that could not read a label.
     A broken + B broken   → a real service incident. That outranks I5 entirely.
     A healthy + B broken  → serving-path incident with a readable control plane.
GUIDE
echo
echo "⛔ This probe authorizes no recovery act. I5-P0R2 stays UNSPENT either way."
