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

# ⭐ A STAND-IN PRODUCTION RUNTIME ROOT. The runbook now REFUSES to load without a
# verified one, so the harness must build a real one: the operational files and a
# git worktree whose top is the root itself.
FAKE_ROOT="$TMP/prod-root"
mkdir -p "$FAKE_ROOT"
: > "$FAKE_ROOT/.env.production"
: > "$FAKE_ROOT/docker-compose.production.yml"
git -C "$FAKE_ROOT" init -q 2>/dev/null
export PROJECT_DIR="$FAKE_ROOT"

# ⭐⭐ THE TEST SEAM LIVES HERE, NOT IN PRODUCTION AUTHORITY. The runbook's
# production root is a non-overridable literal, so the harness cannot point it at
# a fixture with an environment variable — and must not be able to. It mutates a
# DISPOSABLE COPY instead. Every functional check below runs against that copy;
# the STATIC checks and the digest run against the real file.
RUNBOOK_UT="$TMP/runbook-under-test.sh"
sed 's|^readonly RB_PRODUCTION_ROOT=.*|readonly RB_PRODUCTION_ROOT="'"$FAKE_ROOT"'"|' \
  "$RUNBOOK" > "$RUNBOOK_UT"
chmod +x "$RUNBOOK_UT"
if cmp -s "$RUNBOOK" "$RUNBOOK_UT"; then
  echo "  FAIL: the root literal could not be rewritten — the harness is not testing what it thinks"
  exit 1
fi
# The copy must resolve its siblings.
for sib in "$SCRIPT_DIR"/*.sh; do ln -sf "$sib" "$TMP/$(basename "$sib")"; done

# A LOOKALIKE: same shape, different identity. It must not be accepted.
LOOKALIKE="$TMP/lookalike"
mkdir -p "$LOOKALIKE"
: > "$LOOKALIKE/.env.production"
: > "$LOOKALIKE/docker-compose.production.yml"
git -C "$LOOKALIKE" init -q 2>/dev/null

PASS=0; FAIL=0
ok()  { echo "  ok:   $1"; PASS=$((PASS + 1)); }
bad() { echo "  FAIL: $1"; FAIL=$((FAIL + 1)); }

# ⭐ The proved set, corrected 2026-09-14 (DEPLOYMENT-SAFETY-02A): production's
# ledger already carries the two older filenames, applied 2026-01-23.
PROVED='20260913000001_ask_authorization_acts.sql
20260913000002_disclosure_boundary_developmental_ask.sql
20260913000003_disclosure_gesture_authorize_sections.sql'

# ⛔ The STALE five-file set the act was authored with. It must now be REFUSED —
# a correction is only real if the superseded law is actively rejected rather
# than quietly replaced.
STALE_FIVE='20260121_trusted_colleagues.sql
20260122_transcript_encryption.sql
20260913000001_ask_authorization_acts.sql
20260913000002_disclosure_boundary_developmental_ask.sql
20260913000003_disclosure_gesture_authorize_sections.sql'

# Trace one run of the REAL function with every docker-touching seam stubbed.
#   $1 script  $2 sha  $3 pending-set  $4 step that fails ("" = none)
#   RB_UNPINNED=1 in the caller drops the RB_PINNED marker, so phase 0 runs.
trace() {
  local script="$1" sha="$2" pending="$3" failstep="${4:-}"
  TRACE="$TMP/trace"; : > "$TRACE"
  PENDING="$pending" FAILSTEP="$failstep" TRACEFILE="$TRACE" \
  RB_PINNED="${RB_UNPINNED:+0}" RB_PINNED="${RB_PINNED:-1}" bash -c '
    source "$1" >/dev/null 2>&1
    set +e
    rb_pin_and_reexec() { echo "pin $1" >> "$TRACEFILE"; [ "$FAILSTEP" = pin ] && return 2; echo "reexec $1" >> "$TRACEFILE"; return 0; }
    rb_prove_self_provenance() { echo "prove-self $1" >> "$TRACEFILE"; [ "$FAILSTEP" = provenance ] && return 2; return 0; }
    rb_live_reader_image_id() { [ "$FAILSTEP" = no-reader ] && return 0; echo "sha256:PREACT"; }
    rb_establish_recovery_tag() { echo "recovery-tag $1 pre=$2" >> "$TRACEFILE"; [ "$FAILSTEP" = recovery-tag ] && return 1; return 0; }
    rb_prove_rollback_custody() { echo "rollback-custody $1 pre=$2" >> "$TRACEFILE"; [ "$FAILSTEP" = custody ] && return 1; return 0; }
    tag_images_for_rollback() { echo "tag $1" >> "$TRACEFILE"; }
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
    docker() {
      case "$*" in
        *verify-constitution-colab*) echo "colab" >> "$TRACEFILE"; [ "$FAILSTEP" = colab ] && return 1 ;;
        *) echo "docker $*" >> "$TRACEFILE" ;;
      esac
      return 0
    }
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
T="$(trace "$RUNBOOK_UT" abc1234 "$PROVED" "")"
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
T="$(trace "$RUNBOOK_UT" abc1234 "$PROVED" migrate)"
grep -q '^swap' <<<"$T" && bad "migration failure still swapped the reader" \
  || ok "migration failure → candidate reader NEVER becomes live"
[ "$(code "$T")" != "0" ] && ok "migration failure exits non-zero" || bad "migration failure exited 0"

T="$(trace "$RUNBOOK_UT" abc1234 "$PROVED" build)"
{ grep -q '^migrate' <<<"$T" || grep -q '^swap' <<<"$T"; } \
  && bad "build failure still migrated or swapped" \
  || ok "build failure → no migration and no swap"

T="$(trace "$RUNBOOK_UT" abc1234 "$PROVED" swap)"
grep -q '^migrate' <<<"$T" && [ "$(code "$T")" != "0" ] \
  && ok "swap failure → non-zero, after a migration that already succeeded" || bad "swap failure path wrong"

T="$(trace "$RUNBOOK_UT" abc1234 "$PROVED" verify-running)"
[ "$(code "$T")" != "0" ] && ok "post-swap provenance failure → non-zero" || bad "provenance failure exited 0"

# ── 3 · ACT SCOPE — exactly the proved three, and nothing else ─────────────
# ⭐ The happy path is asserted elsewhere; here every NEIGHBOURING set is refused,
# in both directions. A guard that only rejects "more" is half a guard — the first
# production invocation was stopped by a set SMALLER than expected.
scope_refuses() { # $1 label  $2 pending set
  local T; T="$(trace "$RUNBOOK_UT" abc1234 "$2" "")"
  if grep -qE '^(build|migrate|swap|recovery-tag)' <<<"$T"; then
    bad "ACT SCOPE: $1 did not stop the act"
  else
    ok "ACT SCOPE: $1 refuses before build, migration and swap"
  fi
}
scope_refuses "a FOURTH pending migration" "$PROVED
20261001_something_else.sql"
scope_refuses "the STALE five-file set" "$STALE_FIVE"
scope_refuses "a narrower set (two of three)" "20260913000001_ask_authorization_acts.sql
20260913000002_disclosure_boundary_developmental_ask.sql"
scope_refuses "a single file" "20260913000001_ask_authorization_acts.sql"
scope_refuses "an EMPTY pending set" ""
scope_refuses "the three plus one already-applied January name" "20260121_trusted_colleagues.sql
$PROVED"

# ⭐ And the corrected law is the one actually ENFORCED — read out of the runbook,
# so this harness cannot pass against a stale expectation it carries itself.
EXPECTED_IN_RUNBOOK="$(sed -n '/^RB_EXPECTED_PENDING=(/,/^)/p' "$RUNBOOK" | sed -n 's/^  \([0-9].*\.sql\)$/\1/p')"
[ "$EXPECTED_IN_RUNBOOK" = "$PROVED" ] \
  && ok "the runbook's own RB_EXPECTED_PENDING is exactly the proved three" \
  || bad "the runbook expects a different set than this harness proves"
grep -qE '20260121_trusted_colleagues|20260122_transcript_encryption' <<<"$EXPECTED_IN_RUNBOOK" \
  && bad "an already-applied January filename is still in the act scope" \
  || ok "neither already-applied January filename remains in the act scope"
T="$(trace "$RUNBOOK_UT" "" "$PROVED" "")"
{ grep -q '^materialize' <<<"$T" || grep -q '^lock' <<<"$T"; } \
  && bad "ran without a named candidate SHA" \
  || ok "no SHA → refuses before the lock; ⛔ no DEPLOY_ALLOW_HEAD escape"

# ── 3a · RUNTIME ROOT CUSTODY (DEPLOYMENT-SAFETY-02B) ──────────────────────
# ⭐⭐ THE GAP THAT LET THE FIRST ACT THROUGH. The harness stubbed the lock and
# never asked WHERE it landed, so a lock taken in a throwaway directory passed
# every check. That omission is now lethal.

# The runbook is run as a SUBPROCESS here: a refusal must happen at load time,
# before any helper is sourced, so it cannot be observed by sourcing it.
root_refuses() { # $1 label  $2 PROJECT_DIR value ("" = unset)
  local out rc
  if [ -z "$2" ]; then
    out="$(env -u PROJECT_DIR bash "$RUNBOOK_UT" abc1234 2>&1)"; rc=$?
  else
    out="$(PROJECT_DIR="$2" bash "$RUNBOOK_UT" abc1234 2>&1)"; rc=$?
  fi
  # ⭐ THE DISCRIMINATOR IS THE GUARD'S OWN VERDICT, NEVER THE EXIT CODE. A run
  # can pass the root guard and still exit non-zero further down — which is
  # exactly how the pre-repair form would have slipped through a code-only check.
  if grep -q 'Runtime root verified' <<<"$out"; then
    bad "RUNTIME ROOT: $1 PASSED the root guard"
  elif grep -q 'acquired' <<<"$out"; then
    bad "RUNTIME ROOT: $1 refused, but a deploy lock was taken first"
  elif [ "$rc" = "0" ]; then
    bad "RUNTIME ROOT: $1 was ACCEPTED"
  else
    ok "RUNTIME ROOT: $1 refuses before any helper is sourced or lock taken"
  fi
}
root_refuses "PROJECT_DIR unset"                    ""
root_refuses "PROJECT_DIR = a pinned temp worktree" "$TMP"
root_refuses "PROJECT_DIR = a LOOKALIKE dir with the right files" "$LOOKALIKE"
root_refuses "PROJECT_DIR = a nonexistent path"     "$TMP/does-not-exist"

# ⭐ And the GOOD case: the lock must resolve INTO the production runtime root.
LOCKPATH="$(PROJECT_DIR="$FAKE_ROOT" bash -c '
  source "$1" >/dev/null 2>&1; echo "$DEPLOY_LOCK_FILE"' _ "$RUNBOOK_UT" 2>/dev/null)"
[ "$LOCKPATH" = "$FAKE_ROOT/.deploy.lock" ] \
  && ok "RUNTIME ROOT: the deploy-lane lock resolves to the production root's .deploy.lock" \
  || bad "the lock resolves to '${LOCKPATH:-none}', not the production root"
case "$LOCKPATH" in
  "$TMP"/prod-root/*) ok "the lock path is INSIDE the verified runtime root" ;;
  *) bad "the lock path is outside the verified runtime root" ;;
esac

# ⛔⛔ THE HOSTILE OVERRIDE — the defect this repair exists to close.
# The copy's literal is FAKE_ROOT; the caller tries to redirect it to a lookalike
# through the environment. If the env could redefine the root, this would pass.
OUT="$(RB_PRODUCTION_ROOT="$LOOKALIKE" PROJECT_DIR="$LOOKALIKE" bash "$RUNBOOK_UT" abc1234 2>&1)"
if grep -q 'Runtime root verified' <<<"$OUT"; then
  bad "RUNTIME ROOT: an environment override REDEFINED the production root"
elif grep -q 'not the production runtime root' <<<"$OUT"; then
  ok "RUNTIME ROOT: an environment override CANNOT redefine the production root"
else
  bad "RUNTIME ROOT: the override case refused for an unexpected reason — not proof"
fi

# ⭐⭐ DISCRIMINATION: the PRE-REPAIR `${RB_PRODUCTION_ROOT:-…}` form, restored on a
# throwaway copy, MUST be caught by the check above. Without this the check could
# be green against the very defect it was written for.
VULN="$TMP/vulnerable.sh"
sed 's|^readonly RB_PRODUCTION_ROOT=.*|RB_PRODUCTION_ROOT="${RB_PRODUCTION_ROOT:-'"$FAKE_ROOT"'}"|' \
  "$RUNBOOK" > "$VULN"; chmod +x "$VULN"
OUT="$(RB_PRODUCTION_ROOT="$LOOKALIKE" PROJECT_DIR="$LOOKALIKE" bash "$VULN" abc1234 2>&1)"
grep -q 'Runtime root verified' <<<"$OUT" \
  && ok "DISCRIMINATION: the pre-repair overridable form IS detected as accepting a lookalike" \
  || bad "the pre-repair overridable form was not detected — this check proves nothing"

# ⭐ And production authority carries the real literal, with no env-derived form.
grep -qE '^readonly RB_PRODUCTION_ROOT="/home/soullab/MAIA-SOVEREIGN"$' "$RUNBOOK" \
  && ok "the production root is a readonly LITERAL in the real runbook" \
  || bad "the real runbook does not declare the production root as a readonly literal"
grep -qE 'RB_PRODUCTION_ROOT="\$\{RB_PRODUCTION_ROOT' "$RUNBOOK" \
  && bad "the real runbook still derives its production root from the environment" \
  || ok "the real runbook derives NOTHING about its root from the environment"

# ⛔ The runbook must not reintroduce a location-derived default.
grep -qE 'PROJECT_DIR="\$\{PROJECT_DIR:-' "$RUNBOOK" \
  && bad "PROJECT_DIR still has a fallback default" \
  || ok "PROJECT_DIR has NO fallback — it is supplied or the act refuses"

# ⭐ RECOVERY CARRIES THE SAME CUSTODY. `rb_recover` reads the runtime compose and
# env straight from PROJECT_DIR, so a recovery launched from a temp worktree would
# have operated on the wrong root. The load-time assertion covers it.
out="$(PROJECT_DIR="$TMP" bash "$RUNBOOK_UT" recover abc1234 2>&1)"; rc=$?
{ [ "$rc" != "0" ] && ! grep -q 'acquired' <<<"$out"; } \
  && ok "RUNTIME ROOT: recover from a temp root refuses before doing anything" \
  || bad "recover accepted a temp runtime root"

# ⛔ No stale count may survive in prose: the messages derive from the array.
grep -qi 'five-file\|(five files)' "$RUNBOOK" \
  && bad "a stale five-file claim survives in the runbook's prose" \
  || ok "no stale five-file claim survives — messages derive from the governed array"

# ── 3b · SELF-PINNING: the runbook must be the CANDIDATE'S ─────────────────
T="$(RB_UNPINNED=1 trace "$RUNBOOK_UT" abc1234 "$PROVED" "")"
I="$(step_index "$T" pin)"; L="$(step_index "$T" lock)"
[ -n "$I" ] && { [ -z "$L" ] || [ "$I" -lt "$L" ]; } \
  && ok "PIN: an unpinned invocation re-execs from the candidate BEFORE the lock" \
  || bad "an unpinned invocation proceeded without pinning itself"
T="$(RB_UNPINNED=1 trace "$RUNBOOK_UT" abc1234 "$PROVED" pin)"
{ grep -qE '^(migrate|swap|build)' <<<"$T"; } \
  && bad "a failed pin still reached build/migrate/swap" \
  || ok "PIN failure → nothing else runs"
T="$(trace "$RUNBOOK_UT" abc1234 "$PROVED" provenance)"
{ grep -qE '^(migrate|swap|build)' <<<"$T"; } && bad "a provenance failure still proceeded" \
  || ok "SOURCE CUSTODY: a hostile stale/shared-checkout source refuses before the lock"
grep -q '^prove-self' <<<"$T" && ok "self-provenance is asserted on every pinned run" \
  || bad "self-provenance is not asserted"

# ⭐ The provenance assertion is exercised for REAL (not stubbed) on this tree:
# a file that does not hash-match the named commit must be refused.
REAL="$(cd "$SCRIPT_DIR/.." && git rev-parse HEAD 2>/dev/null)"
if [ -n "$REAL" ]; then
  OUT="$(RB_PIN_REPO="$SCRIPT_DIR/.." bash -c '
    source "$1" >/dev/null 2>&1; set +e
    rb_prove_self_provenance "$2"; echo "RC=$?"' _ "$RUNBOOK_UT" "$REAL" 2>&1)"
  # ⛔ Deliberately NOT scored either way: a working copy with uncommitted edits
  # legitimately fails its own HEAD, so a pass here would prove nothing. The
  # discriminating case is the negative one below.
  case "$OUT" in *"RC="*) ok "REAL provenance check runs and returns a definite verdict" ;;
    *) bad "REAL provenance check did not run" ;; esac
  OUT="$(RB_PIN_REPO="$SCRIPT_DIR/.." bash -c '
    source "$1" >/dev/null 2>&1; set +e
    rb_prove_self_provenance "0000000000000000000000000000000000000000"; echo "RC=$?"' _ "$RUNBOOK_UT" 2>&1)"
  case "$OUT" in *"RC=0"*) bad "provenance accepted a commit that is not this tree's HEAD" ;;
    *) ok "REAL provenance check REFUSES a SHA that is not the running tree's commit" ;; esac
fi

# ── 3c · RECOVERY CUSTODY — established and proved before ANYTHING crosses ──
T="$(trace "$RUNBOOK_UT" abc1234 "$PROVED" "")"
R="$(step_index "$T" recovery-tag)"; M="$(step_index "$T" migrate)"; S="$(step_index "$T" swap)"
[ -n "$R" ] && [ "$R" -lt "$M" ] && [ "$M" -lt "$S" ] \
  && ok "ORDER: build → capture + recovery tag → migrate → swap" \
  || bad "the recovery tag is not established before migration"
grep -q '^recovery-tag abc1234 pre=sha256:PREACT' <<<"$T" \
  && ok "the PRE-ACT live reader identity is captured and pinned by the recovery tag" \
  || bad "the pre-act reader identity is not pinned"
T="$(trace "$RUNBOOK_UT" abc1234 "$PROVED" recovery-tag)"
{ grep -qE '^(migrate|swap)' <<<"$T"; } \
  && bad "an unestablished recovery tag still migrated or swapped" \
  || ok "recovery-tag failure REFUSES before migration AND before the swap"
[ "$(code "$T")" != "0" ] && ok "recovery-tag failure exits non-zero" || bad "recovery-tag failure exited 0"
T="$(trace "$RUNBOOK_UT" abc1234 "$PROVED" no-reader)"
{ grep -qE '^(migrate|swap)' <<<"$T"; } && bad "proceeded with no live reader captured" \
  || ok "no capturable live reader → refuses before migration and before the swap"

# ⭐ NO SHARED ROLE TAG IS TOUCHED BEFORE THE SWAP — so a pre-swap refusal cannot
# leave deployment metadata falsely describing production.
for step in recovery-tag migrate no-reader; do
  T="$(trace "$RUNBOOK_UT" abc1234 "$PROVED" "$step")"
  grep -q '^tag ' <<<"$T" && bad "$step refusal moved the shared role tags" \
    || ok "$step refusal leaves the shared :current/:previous role tags untouched"
done
T="$(trace "$RUNBOOK_UT" abc1234 "$PROVED" "")"
Tg="$(step_index "$T" tag)"; V="$(step_index "$T" colab)"
[ -n "$Tg" ] && [ "$V" -lt "$Tg" ] \
  && ok "shared role tags are written only AFTER a verified, gated success" \
  || bad "shared role tags are written before the act is verified"

# ── 3c2 · THE RECOVERY OPERATION ITSELF ────────────────────────────────────
# Exercised for REAL against stubbed docker, so the proposition proved is
# "recovery retags :prod and confirms", not "a message mentions rollback".
recover_run() { # $1 script  $2 mode  -> prints trace then RC=<n>
  RTRACE="$TMP/rtrace"; : > "$RTRACE"
  MODE="$2" RTRACE="$RTRACE" bash -c '
    source "$1" >/dev/null 2>&1; set +e
    PROJECT_DIR=/proj
    PROD=CANDIDATE
    rb_image_id() { case "$1" in *o1-recovery-*) echo PREACT;; *:prod) echo "$PROD";; *) echo "";; esac; }
    rb_image_commit() { echo preact-commit; }
    sleep() { :; }
    docker() {
      case "$1 $2" in
        "tag "*) echo "tag $2 -> $3" >> "$RTRACE"
                 case "$3" in *:prod) [ "$MODE" = only-role-tags ] || PROD=PREACT;; esac
                 case "$MODE" in only-role-tags) : ;; esac ;;
      esac
      case "$*" in
        tag*) case "$MODE" in only-role-tags) PROD=CANDIDATE;; esac ;;
        compose*) echo "restart" >> "$RTRACE" ;;
        *printenv*) [ "$PROD" = PREACT ] && echo preact-commit || echo candidate-commit ;;
        *ps*) echo maia-sovereign ;;
      esac
      return 0
    }
    rb_recover abc1234 >/dev/null 2>&1; echo "RC=$?" >> "$RTRACE"
  ' _ "$1"
  cat "$RTRACE"
}
RT="$(recover_run "$RUNBOOK_UT" honest)"
grep -q 'tag .*:prod' <<<"$RT" \
  && ok "RECOVERY retags the captured image onto :prod — the alias compose consumes" \
  || bad "recovery never retags :prod"
grep -q '^restart' <<<"$RT" && ok "RECOVERY restarts maia after retagging" || bad "recovery does not restart"
grep -q 'RC=0' <<<"$RT" && ok "RECOVERY confirms the restored commit and that the reader is running" \
  || bad "recovery did not confirm restoration"

# ⭐⭐ DISCRIMINATION: a recovery that only moves :current/:previous and leaves
# :prod on the candidate — i.e. exactly what `deploy-production.sh rollback`
# does — MUST be detected as a FAILED recovery.
RT="$(recover_run "$RUNBOOK_UT" only-role-tags)"
grep -q 'RC=0' <<<"$RT" \
  && bad "a recovery that left :prod on the candidate reported SUCCESS" \
  || ok "DISCRIMINATION: recovery that leaves :prod on the candidate is DETECTED as failed"

# ⭐ THE PREMISE OF RECOVERY, ASSERTED RATHER THAN ASSUMED. Recovery retags
# :prod because that is the alias compose gives the maia service. If someone
# changed the service to consume a different tag, recovery would silently restore
# the wrong alias — the SAME defect class as the general rollback primitive,
# arriving from the other side. So the premise is checked against the real file.
COMPOSE="$SCRIPT_DIR/../docker-compose.production.yml"
ALIAS="$(sed -n 's/^x-maia-image: &maia_image \(.*\)$/\1/p' "$COMPOSE" | head -1)"
[ "$ALIAS" = "maia-sovereign:prod" ] \
  && ok "compose gives the maia service $ALIAS — the alias recovery retags" \
  || bad "the maia service consumes '${ALIAS:-unknown}', not maia-sovereign:prod — recovery targets the wrong alias"
grep -qE '^\s+image: \*maia_image' "$COMPOSE" \
  && ok "the maia service uses that alias by anchor, not a second literal" \
  || bad "the maia service does not use the x-maia-image anchor"
grep -q 'MAIA_IMAGE_REPO:-maia-sovereign}:prod' "$RUNBOOK" \
  && ok "recovery retags exactly that alias" || bad "recovery does not name the compose alias"

# The act must not send the operator to the defective general primitive.
OUT="$(bash -c 'source "$1" >/dev/null 2>&1; set +e; rb_recovery_required "t"' _ "$RUNBOOK_UT" 2>&1)"
grep -q 'runbook.sh recover' <<<"$OUT" \
  && ok "the recovery instruction names the act's own operation" || bad "no act-owned recovery instruction"
grep -qE 'NOT ./scripts/deploy-production.sh rollback|NOT \./scripts/deploy-production\.sh rollback' <<<"$OUT" \
  && ok "the defective general rollback primitive is explicitly ruled out" \
  || bad "the operator is not warned off deploy-production.sh rollback"

# ⭐ The custody proof is exercised for REAL against stubbed image ids.
custody_real() { # $1 previous-id $2 current-id $3 sha-id -> rc
  bash -c '
    source "$1" >/dev/null 2>&1; set +e
    rb_image_id() { case "$1" in *:prod) echo CAND;; *:previous) echo "$PREV";; *:current) echo "$CUR";; *) echo "$SHAT";; esac; }
    PREV="$2" CUR="$3" SHAT="$4" rb_prove_rollback_custody abc1234 sha256:PREACT >/dev/null 2>&1; echo $?' \
    _ "$RUNBOOK_UT" "$1" "$2" "$3"
}
[ "$(PREV=x custody_real sha256:PREACT CAND CAND)" = "0" ] \
  && ok "REAL custody proof accepts truthful :previous/:current/:<sha>" || bad "truthful tags were refused"
[ "$(custody_real sha256:SOMETHING_ELSE CAND CAND)" != "0" ] \
  && ok "REAL custody proof REFUSES an untruthful :previous — the suppressed-tagging defect" \
  || bad "an untruthful :previous was accepted"
[ "$(custody_real sha256:PREACT STALE CAND)" != "0" ] \
  && ok "REAL custody proof REFUSES an untruthful :current" || bad "an untruthful :current was accepted"
[ "$(custody_real sha256:PREACT CAND STALE)" != "0" ] \
  && ok "REAL custody proof REFUSES an untruthful :<sha>" || bad "an untruthful :<sha> was accepted"

# ── 3d · LATE FAILURES MAY NOT DECLARE COMPLETION ──────────────────────────
for step in swap verify-running colab; do
  T="$(trace "$RUNBOOK_UT" abc1234 "$PROVED" "$step")"
  [ "$(code "$T")" != "0" ] && ok "$step failure → non-zero" || bad "$step failure exited 0"
done
T="$(trace "$RUNBOOK_UT" abc1234 "$PROVED" colab)"
grep -q '^colab' <<<"$T" && ok "the Co-Lab gate is actually invoked" || bad "Co-Lab is never invoked"
T="$(trace "$RUNBOOK_UT" abc1234 "$PROVED" "")"
grep -q '^colab' <<<"$T" && ok "the happy path reaches the Co-Lab gate" || bad "happy path skipped Co-Lab"

# ⭐ COMPLETION IS REACHED BY THE HAPPY PATH ALONE. Asserted on stdout, because
# "act complete" is the only claim an operator reads as authorisation.
complete_says() { # $1 failstep -> prints "yes"/"no"
  local out
  out="$(PENDING="$PROVED" FAILSTEP="$1" TRACEFILE=/dev/null RB_PINNED=1 bash -c '
    source "$1" >/dev/null 2>&1; set +e
    rb_pin_and_reexec() { return 0; }; rb_prove_self_provenance() { return 0; }
    rb_live_reader_image_id() { echo sha256:PREACT; }
    rb_establish_recovery_tag() { [ "$FAILSTEP" = recovery-tag ] && return 1; return 0; }
    rb_prove_rollback_custody() { return 0; }
    tag_images_for_rollback() { :; }; acquire_deploy_lock() { :; }
    deploy_ctx_assert_and_materialize() { export GIT_COMMIT="$1" MAIA_BUILD_CONTEXT=/s DEPLOY_COMPOSE_FILE=/s/c.yml; }
    deploy_ctx_refuse_env_collision() { return 0; }; deploy_ctx_refuse_compose_runtime_override() { return 0; }
    deploy_ctx_verify_image() { return 0; }
    deploy_ctx_verify_running() { [ "$FAILSTEP" = verify-running ] && return 1; return 0; }
    rb_pending_set() { printf "%s" "$PENDING"; }; sleep() { :; }
    deploy_ctx_compose() { case "$*" in build*) [ "$FAILSTEP" = build ] && return 1;; *migrate*) [ "$FAILSTEP" = migrate ] && return 1;; up\ -d*) [ "$FAILSTEP" = swap ] && return 1;; esac; return 0; }
    docker() { case "$*" in *colab*) [ "$FAILSTEP" = colab ] && return 1;; esac; return 0; }
    s3_schema_first_main abc1234' _ "$RUNBOOK_UT" 2>&1)"
  grep -q "act complete" <<<"$out" && echo yes || echo no
}
[ "$(complete_says "")" = "yes" ] && ok "the happy path DOES declare the act complete" || bad "happy path never declares completion"
for step in build migrate recovery-tag swap verify-running colab; do
  [ "$(complete_says "$step")" = "no" ] \
    && ok "$step failure CANNOT declare the act complete" \
    || bad "$step failure declared the act complete"
done
for step in swap verify-running colab; do
  out="$(PENDING="$PROVED" FAILSTEP="$step" bash -c '
    source "$1" >/dev/null 2>&1; set +e; rb_recovery_required "test"' _ "$RUNBOOK_UT" 2>&1)"
  grep -q 'RECOVERY REQUIRED' <<<"$out" || bad "recovery statement missing for $step"
done
out="$(bash -c 'source "$1" >/dev/null 2>&1; set +e; rb_recovery_required "t"' _ "$RUNBOOK_UT" 2>&1)"
grep -qi 'old reader remains live\|current reader remains live' <<<"$out" \
  && bad "the recovery statement CLAIMS the old reader is still live" \
  || ok "the recovery statement does NOT claim the old reader is still live"
grep -q 'UNKNOWN to this script' <<<"$out" \
  && ok "the recovery statement says the live reader's state is UNKNOWN and must be read" \
  || bad "the recovery statement does not admit what it cannot know"

# ── 4 · DISCRIMINATION — swap-before-migrate must be DETECTED ──────────────
MUT="$TMP/mutant.sh"
for sib in "$SCRIPT_DIR"/*.sh; do ln -sf "$sib" "$TMP/$(basename "$sib")"; done
python3 - "$RUNBOOK_UT" "$MUT" <<'MUTPY'
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
T="$(trace "$MUT" abc1234 "$PROVED" "")"
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
