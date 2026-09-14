#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# Falsification harness — O1 RUNBOOK (DEPLOYMENT-SAFETY-02)
# ═══════════════════════════════════════════════════════════════════════════════
# Proves the eight properties the founder required of the candidate-pinned
# schema-first act, by TRACING the real function out of the real script with the
# docker-touching seams stubbed. No docker, no database, no network, no
# production. Every seam is a reader/executor the script already calls.
#
# ⭐ The load-bearing case is the DISCRIMINATION one: a hostile mutant that swaps
# before migrating is applied to a THROWAWAY COPY and must be DETECTED. Without
# it, every green line below would also be green against swap-before-migrate.
#
# Run: scripts/verify-s3-schema-first-runbook.sh  (npm run verify:s3-runbook)
# ═══════════════════════════════════════════════════════════════════════════════
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUNBOOK="$SCRIPT_DIR/s3-schema-first-runbook.sh"
BEFORE="$(sha256sum "$RUNBOOK" | cut -c1-16)"
TMP="$(mktemp -d "${TMPDIR:-/tmp}/s3-runbook-proof.XXXXXX")"
trap 'rm -rf "$TMP"' EXIT

PASS=0; FAIL=0
ok()  { echo "  ok:   $1"; PASS=$((PASS + 1)); }
bad() { echo "  FAIL: $1"; FAIL=$((FAIL + 1)); }

FIVE='20260121_trusted_colleagues.sql
20260122_transcript_encryption.sql
20260913000001_ask_authorization_acts.sql
20260913000002_disclosure_boundary_developmental_ask.sql
20260913000003_disclosure_gesture_authorize_sections.sql'

# Trace one run of the REAL function with every docker-touching seam stubbed.
#   $1 script  $2 sha  $3 pending-set  $4 step that fails ("" = none)
trace() {
  local script="$1" sha="$2" pending="$3" failstep="${4:-}"
  TRACE="$TMP/trace"; : > "$TRACE"
  PENDING="$pending" FAILSTEP="$failstep" TRACEFILE="$TRACE" bash -c '
    source "$1" >/dev/null 2>&1
    set +e
    acquire_deploy_lock() { echo "lock $2" >> "$TRACEFILE"; }
    deploy_ctx_assert_and_materialize() {
      echo "materialize $1" >> "$TRACEFILE"
      export GIT_COMMIT="$1"
      export MAIA_BUILD_CONTEXT="/snapshot-of-$1"
      export DEPLOY_COMPOSE_FILE="/snapshot-of-$1/docker-compose.production.yml"
    }
    deploy_ctx_refuse_env_collision() { return 0; }
    deploy_ctx_refuse_compose_runtime_override() { return 0; }
    deploy_ctx_verify_image()   { echo "verify-image $1" >> "$TRACEFILE"; [ "$FAILSTEP" = verify-image ] && return 1; return 0; }
    deploy_ctx_verify_running() { echo "verify-running $1" >> "$TRACEFILE"; [ "$FAILSTEP" = verify-running ] && return 1; return 0; }
    tag_images_for_rollback()   { echo "tag $1" >> "$TRACEFILE"; }
    rb_pending_set() { printf "%s" "$PENDING"; }
    sleep() { :; }
    deploy_ctx_compose() {
      case "$*" in
        build*)             echo "build ctx=$MAIA_BUILD_CONTEXT" >> "$TRACEFILE"; [ "$FAILSTEP" = build ]   && return 1 ;;
        *profile\ migrate*) echo "migrate ctx=$MAIA_BUILD_CONTEXT compose=$DEPLOY_COMPOSE_FILE" >> "$TRACEFILE"; [ "$FAILSTEP" = migrate ] && return 1 ;;
        up\ -d*)            echo "swap ctx=$MAIA_BUILD_CONTEXT" >> "$TRACEFILE"; [ "$FAILSTEP" = swap ] && return 1 ;;
        *)                  echo "compose $*" >> "$TRACEFILE" ;;
      esac
      return 0
    }
    docker() { echo "docker $*" >> "$TRACEFILE"; }
    s3_schema_first_main "$2"
    echo "EXIT=$?" >> "$TRACEFILE"
  ' _ "$script" "$sha" >/dev/null 2>&1
  cat "$TRACE"
}

step_index() { grep -n "^$2" <<<"$1" | head -1 | cut -d: -f1; }
code() { sed -n 's/^EXIT=//p' <<<"$1"; }

echo "O1 RUNBOOK — falsification harness"
echo ""

# ── 1 · HAPPY PATH: order, custody, one SHA throughout ──────────────────────
T="$(trace "$RUNBOOK" abc1234 "$FIVE" "")"
M="$(step_index "$T" migrate)"; S="$(step_index "$T" swap)"; B="$(step_index "$T" build)"
[ -n "$M" ] && [ -n "$S" ] && [ "$M" -lt "$S" ] \
  && ok "MIGRATE strictly precedes SWAP" || bad "migrate does not precede swap ($M vs $S)"
[ -n "$B" ] && [ "$B" -lt "$M" ] \
  && ok "BUILD precedes MIGRATE — a build failure costs no schema change" || bad "build does not precede migrate"
[ "$(code "$T")" = "0" ] && ok "happy path exits 0" || bad "happy path exited $(code "$T")"
grep -q "^migrate ctx=/snapshot-of-abc1234 compose=/snapshot-of-abc1234/" <<<"$T" \
  && ok "CUSTODY: migrations run from the materialized snapshot of the named SHA" \
  || bad "migrate did not run from the candidate snapshot"
[ "$(grep -c 'ctx=/snapshot-of-abc1234' <<<"$T")" = "3" ] \
  && ok "CUSTODY: build, migrate and swap all derive from ONE snapshot" \
  || bad "build/migrate/swap do not share one snapshot"
grep -q "^verify-running abc1234" <<<"$T" \
  && ok "the running container is verified against the SAME named SHA" || bad "running verify uses another SHA"

# ── 2 · FAILURE PATHS ──────────────────────────────────────────────────────
T="$(trace "$RUNBOOK" abc1234 "$FIVE" migrate)"
grep -q '^swap' <<<"$T" && bad "migration failure still swapped the reader" \
  || ok "migration failure → candidate reader NEVER becomes live"
[ "$(code "$T")" != "0" ] && ok "migration failure exits non-zero" || bad "migration failure exited 0"

T="$(trace "$RUNBOOK" abc1234 "$FIVE" build)"
{ grep -q '^migrate' <<<"$T" || grep -q '^swap' <<<"$T"; } \
  && bad "build failure still migrated or swapped" \
  || ok "build failure → no migration and no swap"

T="$(trace "$RUNBOOK" abc1234 "$FIVE" swap)"
grep -q '^migrate' <<<"$T" && [ "$(code "$T")" != "0" ] \
  && ok "swap failure → non-zero, after a migration that already succeeded" || bad "swap failure path wrong"

T="$(trace "$RUNBOOK" abc1234 "$FIVE" verify-running)"
[ "$(code "$T")" != "0" ] && ok "post-swap provenance failure → non-zero" || bad "provenance failure exited 0"

# ── 3 · ACT SCOPE — it refuses any other pending set ───────────────────────
T="$(trace "$RUNBOOK" abc1234 "$FIVE
20261001_something_else.sql" "")"
{ grep -q '^migrate' <<<"$T" || grep -q '^swap' <<<"$T"; } \
  && bad "a sixth pending file did not stop the act" \
  || ok "ACT SCOPE: a sixth pending file refuses before any migration"
T="$(trace "$RUNBOOK" abc1234 "20260913000001_ask_authorization_acts.sql" "")"
grep -q '^migrate' <<<"$T" && bad "a narrower pending set was accepted" \
  || ok "ACT SCOPE: a different pending set refuses — this is not a general path"
T="$(trace "$RUNBOOK" "" "$FIVE" "")"
{ grep -q '^materialize' <<<"$T" || grep -q '^lock' <<<"$T"; } \
  && bad "ran without a named candidate SHA" \
  || ok "no SHA → refuses before the lock; ⛔ no DEPLOY_ALLOW_HEAD escape"

# ── 4 · DISCRIMINATION — swap-before-migrate must be DETECTED ──────────────
MUT="$TMP/mutant.sh"
for sib in "$SCRIPT_DIR"/*.sh; do ln -sf "$sib" "$TMP/$(basename "$sib")"; done
python3 - "$RUNBOOK" "$MUT" <<'MUTPY'
import re, sys
src = open(sys.argv[1]).read()
m = re.search(r'^s3_schema_first_main\(\) \{.*?^\}', src, re.S | re.M)
body = m.group(0)
mig = re.search(r'  # ── MIGRATE.*?(?=  # ── SWAP)', body, re.S)
swap = re.search(r'  # ── SWAP.*?(?=\n  rb_info "Co-Lab)', body, re.S)
assert mig and swap, 'blocks not found'
# The hostile mutation: the two blocks exchanged — swap first, migrate after.
mutated = body.replace(mig.group(0) + swap.group(0), swap.group(0) + mig.group(0))
assert mutated != body, 'mutation did not apply'
open(sys.argv[2], 'w').write(src[:m.start()] + mutated + src[m.end():])
MUTPY
T="$(trace "$MUT" abc1234 "$FIVE" "")"
M="$(step_index "$T" migrate)"; S="$(step_index "$T" swap)"
if [ -n "$M" ] && [ -n "$S" ] && [ "$S" -lt "$M" ]; then
  ok "DISCRIMINATION: swap-before-migrate mutant is DETECTED by this harness"
else
  bad "the swap-before-migrate mutant was NOT detected — this harness proves nothing"
fi

# ── 5 · STATIC — the forbidden path, and no general reordering ─────────────
# ⭐ COMMENTS STRIPPED FIRST — the C21 lesson, which bit on the first run of this
# harness: the runbook's header DOCUMENTS that deploy-maia is forbidden and that
# there is no ALLOW_HEAD escape, and a scanner reading raw source failed the file
# precisely because it states its own compliance. Full-line and trailing shell
# comments are removed; `${VAR#...}` is untouched because the trailing form
# requires preceding whitespace.
SRC="$(sed -e '/^[[:space:]]*#/d' -e 's/[[:space:]]#.*$//' "$RUNBOOK")"
grep -q 'deploy-maia' <<<"$SRC" && bad "the runbook references deploy-maia" \
  || ok "⛔ deploy-maia is never invoked by this act"
# ⭐ ASK THE RIGHT QUESTION. `DEPLOY_ALLOW_HEAD` is NAMED in the refusal message,
# which is not a consultation of it — the same confusion as above, one layer in.
# The law is that no code path READS the variable. The inherited escape inside
# `deploy_ctx_assert_and_materialize` is unreachable because the empty-SHA case
# returns before materialize is ever called — proved dynamically by the "no SHA"
# trace above, where no `materialize` step appears at all.
grep -qE '\$DEPLOY_ALLOW_HEAD|\$\{DEPLOY_ALLOW_HEAD' <<<"$SRC" \
  && bad "the runbook CONSULTS DEPLOY_ALLOW_HEAD" \
  || ok "DEPLOY_ALLOW_HEAD is never consulted; the inherited escape is unreachable"
if git -C "$SCRIPT_DIR/.." diff --quiet HEAD -- scripts/deploy-production.sh 2>/dev/null; then
  ok "scripts/deploy-production.sh is UNCHANGED — no general ordering repair (O2) shipped"
else
  bad "deploy-production.sh was modified — that would be O2, which is not authorized"
fi

AFTER="$(sha256sum "$RUNBOOK" | cut -c1-16)"
[ "$BEFORE" = "$AFTER" ] && ok "runbook untouched by the harness ($BEFORE)" || bad "runbook CHANGED"

echo ""
echo "$PASS passed · $FAIL failed"
[ "$FAIL" -eq 0 ] || exit 1
