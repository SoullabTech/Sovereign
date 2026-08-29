#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# WITNESS-INSTRUMENT-V1 — the laboratory, script-first
# ═══════════════════════════════════════════════════════════════════════════════
# Phase 0 of the MAIA Conversational Completion Program. Before any conversational
# lane can be witnessed, there has to be a place to witness it that cannot lie:
# a stack built from an explicitly named commit, provably isolated from
# production, whose evidence is attributable to that commit and honest about
# what it did not capture.
#
#   prepare <SHA>   name + snapshot the candidate; declare the artifact assertion
#   verify          run the refusal set, then prove runtime provenance
#   provision       build + start the isolated witness stack from the snapshot
#   collect         capture evidence in two named classes (server / client)
#   teardown        destroy the witness stack; keep the evidence
#
#   status | selftest | help
#
# NOT in V1, deliberately:
#   launch_desktop_authenticated — Desktop targeting and auth lifecycle are not
#   yet understood. Launching blind would produce confident-looking evidence
#   about the wrong session, which is worse than no launcher. It stays
#   investigation-only until that lifecycle is established.
#
# Verb order in normal use:
#   prepare → verify (static gates PASS, provenance UNPROVEN by construction)
#          → provision → verify (full PASS) → collect → teardown
#
# `verify` before provision is EXPECTED to exit 3 (UNPROVEN). That is the point:
# runtime provenance is never assumed, so there is no state in which "not yet
# proven" can read as "pass".
# ═══════════════════════════════════════════════════════════════════════════════

set -uo pipefail

WITNESS_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export WITNESS_SCRIPT_DIR

# shellcheck source=lib/witness-common.sh
. "$WITNESS_SCRIPT_DIR/lib/witness-common.sh"
# shellcheck source=lib/witness-guards.sh
. "$WITNESS_SCRIPT_DIR/lib/witness-guards.sh"
# shellcheck source=lib/witness-evidence.sh
. "$WITNESS_SCRIPT_DIR/lib/witness-evidence.sh"

WITNESS_COMPOSE_FILE="$WITNESS_SCRIPT_DIR/docker-compose.witness.yml"
WITNESS_ENV_FILE="${WITNESS_ENV_FILE:-$WITNESS_SCRIPT_DIR/.env.witness}"
export WITNESS_ENV_FILE

# ═══════════════════════════════════════════════════════════════════════════════
# Witness lane lock — same structural idea as the deploy lane, separate lane.
# ═══════════════════════════════════════════════════════════════════════════════
# Deliberately NOT scripts/deploy-lock.sh: that helper exports
# DEPLOY_LANE_TOKEN=deploy-lane, which would let a witness build claim the deploy
# lane's identity. The witness lane declares itself, and only itself.
witness_lock_file() { echo "$(w_run_root)/.witness.lock"; }

acquire_witness_lock() {
    local label="${1:-witness}" lf
    lf="$(witness_lock_file)"
    mkdir -p "$(dirname "$lf")"
    if command -v flock >/dev/null 2>&1; then
        exec 8>>"$lf"
        if ! flock -n 8; then
            w_block "Another witness run holds the lane."
            [ -s "$lf" ] && sed 's/^/      /' "$lf" >&2
            w_dim "One witness at a time: concurrent runs would interleave evidence."
            exit "$W_EXIT_REFUSED"
        fi
    else
        if [ -f "$lf" ]; then
            local pid; pid="$(sed -n 's/^pid=//p' "$lf" | head -1)"
            if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
                w_block "Another witness run holds the lane (pid $pid)."
                exit "$W_EXIT_REFUSED"
            fi
            w_warn "Stale witness lock (pid ${pid:-?} is dead) — breaking it."
            rm -f "$lf"
        fi
        trap 'rm -f "$(witness_lock_file)"' EXIT
    fi
    : > "$lf"
    {
        echo "pid=$$"
        echo "started=$(w_utc)"
        echo "who=$(id -un)@$(hostname 2>/dev/null || echo '?')"
        echo "entry=$label"
        echo "run=${WITNESS_RUN_ID:-<none>}"
    } >> "$lf"
    export WITNESS_LANE_HELD=1
}

# ═══════════════════════════════════════════════════════════════════════════════
# Protected-container custody — recorded before and after every docker verb.
# ═══════════════════════════════════════════════════════════════════════════════
# The instrument does not merely intend to leave production alone; it records
# production's state on both sides of every action it takes, so "untouched" is
# an observation rather than a claim.
w_protected_state() {
    local n
    w_have_docker || { echo "NO_DOCKER"; return 0; }
    for n in $WITNESS_PROTECTED_CONTAINERS; do
        if docker inspect "$n" >/dev/null 2>&1; then
            echo "$n $(docker inspect --format '{{.Id}} {{.State.Status}} {{.State.StartedAt}}' "$n" 2>/dev/null)"
        else
            echo "$n ABSENT"
        fi
    done
}

w_assert_protected_untouched() {
    local before="$1" after="$2"
    if [ "$before" = "$after" ]; then
        w_ok "Protected containers untouched (state identical before/after)."
        return 0
    fi
    w_fail "PROTECTED CONTAINER STATE CHANGED during this verb."
    diff <(printf '%s\n' "$before") <(printf '%s\n' "$after") | sed 's/^/      /' >&2
    return 1
}

# ═══════════════════════════════════════════════════════════════════════════════
# prepare
# ═══════════════════════════════════════════════════════════════════════════════
cmd_prepare() {
    local ref="${1:-}" repo
    repo="$(w_source_repo)"

    w_rule
    w_log "prepare — naming a candidate and snapshotting it"
    w_rule

    guard_candidate_named "$ref" "$repo" || exit "$W_EXIT_REFUSED"
    guard_candidate_clean "$repo"        || exit "$W_EXIT_REFUSED"

    local root run_id run_dir snap_parent snap
    root="$(w_run_root)"
    run_id="$(date -u +%Y%m%dT%H%M%SZ)-${WITNESS_CANDIDATE_SHORT}"
    run_dir="$root/runs/$run_id"
    snap_parent="$root/snapshots"
    mkdir -p "$run_dir" "$snap_parent" || { w_fail "Cannot create run dir under $root"; exit "$W_EXIT_ENV"; }

    WITNESS_RUN_DIR="$run_dir"; WITNESS_RUN_ID="$run_id"
    export WITNESS_RUN_DIR WITNESS_RUN_ID

    guard_no_protected_writes || exit "$W_EXIT_REFUSED"

    snap="$(mktemp -d "$snap_parent/${WITNESS_CANDIDATE_SHORT}.XXXXXX")" || {
        w_fail "Cannot create snapshot dir under $snap_parent"; exit "$W_EXIT_ENV"; }

    w_log "Materializing ${WITNESS_CANDIDATE_SHORT} into an immutable snapshot (git archive)..."
    if ! git -C "$repo" archive --format=tar "$WITNESS_CANDIDATE_FULL" | tar -xf - -C "$snap"; then
        w_fail "git archive of $WITNESS_CANDIDATE_SHORT failed."
        exit "$W_EXIT_ENV"
    fi
    if [ ! -f "$snap/Dockerfile" ]; then
        w_fail "Snapshot has no Dockerfile — refusing to call this a candidate tree."
        exit "$W_EXIT_REFUSED"
    fi

    local tree_digest snap_digest
    tree_digest="$(w_candidate_digest "$WITNESS_CANDIDATE_FULL" "$repo")"
    snap_digest="$( (cd "$snap" && find . -type f -print0 | LC_ALL=C sort -z | xargs -0 cat 2>/dev/null) | _w_sha256 )"
    if [ "$tree_digest" = "NO_SHA256_TOOL" ]; then
        w_fail "No sha256 tool on this host — candidate immutability could not be established."
        exit "$W_EXIT_ENV"
    fi

    wm_set RUN_ID                    "$run_id"
    wm_set PREPARED_AT               "$(w_utc)"
    wm_set PREPARED_BY               "$(id -un)@$(hostname 2>/dev/null || echo '?')"
    wm_set SOURCE_REPO               "$repo"
    wm_set CANDIDATE_REF             "$ref"
    wm_set CANDIDATE_FULL_SHA        "$WITNESS_CANDIDATE_FULL"
    wm_set CANDIDATE_SHORT_SHA       "$WITNESS_CANDIDATE_SHORT"
    wm_set CANDIDATE_SUBJECT         "$(git -C "$repo" log -1 --format='%s' "$WITNESS_CANDIDATE_FULL" 2>/dev/null)"
    wm_set CANDIDATE_TREE_STATE      "$WITNESS_TREE_STATE"
    wm_set CANDIDATE_TREE_DIGEST     "$tree_digest"
    wm_set SNAPSHOT_DIR              "$snap"
    wm_set SNAPSHOT_CONTENT_DIGEST   "$snap_digest"
    wm_set COMPOSE_FILE              "$WITNESS_COMPOSE_FILE"
    wm_set COMPOSE_PROJECT           "${WITNESS_PREFIX}-${WITNESS_CANDIDATE_SHORT}"
    wm_set ENV_FILE                  "$WITNESS_ENV_FILE"
    wm_set MAIA_CONTAINER            "${WITNESS_PREFIX}-app"
    wm_set PG_CONTAINER              "${WITNESS_PREFIX}-postgres"
    wm_set HTTP_PORT                 "${WITNESS_HTTP_PORT:-3999}"
    wm_set ARTIFACT_PATTERN          "${WITNESS_ARTIFACT_PATTERN:-}"
    wm_set ARTIFACT_SOURCE_PATH      "${WITNESS_ARTIFACT_SOURCE_PATH:-}"
    wm_set ARTIFACT_RUNTIME_PROBE    "${WITNESS_ARTIFACT_RUNTIME_PROBE:-}"
    wm_set ARTIFACT_NEGATIVE_REF     "${WITNESS_ARTIFACT_NEGATIVE_REF:-}"
    wm_set RUNTIME_PROVENANCE        "UNPROVEN"
    wm_set WITNESS_READY             "false"
    wm_set EVIDENCE_COMPLETE         "false"

    # The assertion must be true of the candidate before we go any further —
    # an assertion false of the candidate could never prove the candidate runs.
    guard_artifact_assertion_declared       || exit "$W_EXIT_REFUSED"
    guard_artifact_assertion_discriminating || exit "$W_EXIT_REFUSED"

    wm_render_json
    w_set_current_run "$run_id"
    w_journal prepare "PASS candidate=$WITNESS_CANDIDATE_SHORT digest=${tree_digest:0:12}"

    w_ok "Run $run_id prepared."
    w_dim "candidate: $WITNESS_CANDIDATE_SHORT  ($WITNESS_CANDIDATE_FULL)"
    w_dim "subject:   $(wm_get CANDIDATE_SUBJECT)"
    w_dim "tree:      $WITNESS_TREE_STATE"
    w_dim "snapshot:  $snap"
    w_dim "assertion: '$(wm_get ARTIFACT_PATTERN)' in $(wm_get ARTIFACT_SOURCE_PATH) (discriminating: $(wm_get ARTIFACT_ASSERTION_DISCRIMINATING))"
    w_dim "run dir:   $run_dir"
    echo "$run_id"
    return "$W_EXIT_PASS"
}

# ═══════════════════════════════════════════════════════════════════════════════
# verify
# ═══════════════════════════════════════════════════════════════════════════════
cmd_verify() {
    w_load_run "${1:-}" || exit "$W_EXIT_USAGE"

    w_rule
    w_log "verify — refusal set + runtime provenance (run $WITNESS_RUN_ID)"
    w_rule

    if ! witness_static_gates; then
        wm_set LAST_VERIFY "REFUSED"
        wm_render_json
        w_journal verify "REFUSED static gates"
        w_fail "Static gates REFUSED. Nothing was started; nothing was touched."
        exit "$W_EXIT_REFUSED"
    fi
    w_ok "Static gates PASS — production isolation and candidate immutability proven."

    guard_runtime_provenance
    local rc=$?
    if [ "$rc" -ne 0 ]; then
        wm_set LAST_VERIFY "UNPROVEN"
        wm_set WITNESS_READY "false"
        wm_render_json
        w_journal verify "UNPROVEN runtime provenance"
        w_rule
        w_fail "VERIFY FAILED — RUNTIME_PROVENANCE=UNPROVEN"
        w_dim "Before provision this is expected: there is no witness runtime yet."
        w_dim "  scripts/witness/witness.sh provision"
        w_dim "After provision it is a real failure: the running container is not"
        w_dim "provably the candidate, so nothing observed through it may be cited."
        exit "$W_EXIT_UNPROVEN"
    fi

    wm_set LAST_VERIFY "PASS"
    wm_set WITNESS_READY "true"
    wm_render_json
    w_journal verify "PASS provenance=PROVEN"
    w_ok "RUNTIME_PROVENANCE=PROVEN — the running container is the candidate."
    w_dim "GIT_COMMIT=$(wm_get RUNTIME_GIT_COMMIT)  DEPLOY_LANE=$(wm_get RUNTIME_DEPLOY_LANE)"
    w_dim "artifact assertion held inside $(wm_get MAIA_CONTAINER)"
    return "$W_EXIT_PASS"
}

# ═══════════════════════════════════════════════════════════════════════════════
# provision
# ═══════════════════════════════════════════════════════════════════════════════
cmd_provision() {
    w_load_run "${1:-}" || exit "$W_EXIT_USAGE"
    acquire_witness_lock "provision"

    w_rule
    w_log "provision — building the candidate into an isolated witness stack"
    w_rule

    if ! witness_static_gates; then
        w_journal provision "REFUSED static gates"
        w_fail "Static gates REFUSED — nothing built, nothing started."
        exit "$W_EXIT_REFUSED"
    fi
    w_ok "Static gates PASS."

    if ! w_have_docker; then
        w_fail "No docker daemon reachable — provision needs one."
        w_journal provision "ENV no docker"
        exit "$W_EXIT_ENV"
    fi

    local project file snap before after
    project="$(wm_get COMPOSE_PROJECT)"
    file="$(wm_get COMPOSE_FILE)"
    snap="$(wm_get SNAPSHOT_DIR)"
    before="$(w_protected_state)"
    printf '%s\n' "$before" > "$WITNESS_RUN_DIR/protected-before.txt"

    export WITNESS_BUILD_CONTEXT="$snap"
    export GIT_COMMIT="$(wm_get CANDIDATE_SHORT_SHA)"
    export DEPLOY_LANE_TOKEN="$WITNESS_LANE_TOKEN"
    export WITNESS_HTTP_PORT="$(wm_get HTTP_PORT)"

    local dc=(docker compose -p "$project" -f "$file" --env-file "$WITNESS_ENV_FILE")

    w_log "Building witness image from snapshot $snap ..."
    if ! "${dc[@]}" build witness-app 2>&1 | tee "$WITNESS_RUN_DIR/build.log" | tail -25 >&2; then
        w_fail "Witness build failed — see $WITNESS_RUN_DIR/build.log"
        w_journal provision "FAIL build"
        exit "$W_EXIT_ENV"
    fi

    w_log "Starting witness database ..."
    "${dc[@]}" up -d witness-postgres >> "$WITNESS_RUN_DIR/provision.log" 2>&1 || {
        w_fail "Witness postgres failed to start."; w_journal provision "FAIL postgres"; exit "$W_EXIT_ENV"; }

    w_log "Applying the candidate's own migration set to the witness database ..."
    if ! "${dc[@]}" --profile migrate run --rm witness-migrate >> "$WITNESS_RUN_DIR/provision.log" 2>&1; then
        w_warn "Witness migrations reported failure — see $WITNESS_RUN_DIR/provision.log"
        wm_set MIGRATIONS "FAILED"
    else
        wm_set MIGRATIONS "APPLIED"
    fi

    w_log "Starting the candidate ..."
    if ! "${dc[@]}" up -d witness-app >> "$WITNESS_RUN_DIR/provision.log" 2>&1; then
        w_fail "Witness app failed to start — see $WITNESS_RUN_DIR/provision.log"
        w_journal provision "FAIL app-start"
        exit "$W_EXIT_ENV"
    fi

    local container health i=0
    container="$(wm_get MAIA_CONTAINER)"
    w_log "Waiting for the witness app to report healthy ..."
    while [ "$i" -lt 60 ]; do
        health="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$container" 2>/dev/null || echo missing)"
        [ "$health" = "healthy" ] && break
        [ "$health" = "missing" ] && break
        sleep 5; i=$((i+1))
    done
    wm_set APP_HEALTH "${health:-unknown}"
    if [ "${health:-}" != "healthy" ]; then
        w_warn "Witness app health = ${health:-unknown} (not healthy)."
        w_dim "Health is not candidate proof either way — provenance is decided below."
    fi

    after="$(w_protected_state)"
    printf '%s\n' "$after" > "$WITNESS_RUN_DIR/protected-after-provision.txt"
    if ! w_assert_protected_untouched "$before" "$after"; then
        wm_set PRODUCTION_ISOLATION "VIOLATED"
        wm_render_json
        w_journal provision "FAIL protected-state-changed"
        exit "$W_EXIT_REFUSED"
    fi
    wm_set PRODUCTION_ISOLATION "OBSERVED_INTACT"

    # Fail-closed: a provisioned stack that cannot prove it is the candidate is
    # left standing for diagnosis, but is never marked ready.
    if ! guard_runtime_provenance; then
        wm_set WITNESS_READY "false"
        wm_render_json
        w_journal provision "FAIL provenance UNPROVEN"
        w_fail "Provisioned, but RUNTIME_PROVENANCE=UNPROVEN. Stack left up for diagnosis."
        w_dim "Nothing observed through it may be cited as evidence about the candidate."
        w_dim "  docker logs $container   |   scripts/witness/witness.sh teardown"
        exit "$W_EXIT_UNPROVEN"
    fi

    wm_set WITNESS_READY "true"
    wm_set PROVISIONED_AT "$(w_utc)"
    wm_render_json
    w_journal provision "PASS provenance=PROVEN health=${health:-unknown}"
    w_ok "Witness stack up and PROVEN to be $(wm_get CANDIDATE_SHORT_SHA)."
    w_dim "app: http://127.0.0.1:$(wm_get HTTP_PORT)  (loopback only)"
    w_dim "db:  $(wm_get PG_CONTAINER) / maia_witness (no host port)"
    return "$W_EXIT_PASS"
}

# ═══════════════════════════════════════════════════════════════════════════════
# collect
# ═══════════════════════════════════════════════════════════════════════════════
cmd_collect() {
    w_load_run "${1:-}" || exit "$W_EXIT_USAGE"

    w_rule
    w_log "collect — evidence in two classes (run $WITNESS_RUN_ID)"
    w_rule

    # Evidence is only attributable while the candidate is still immutable.
    if ! guard_candidate_immutable; then
        w_journal collect "REFUSED candidate mutated"
        exit "$W_EXIT_REFUSED"
    fi

    witness_collect_server || true
    witness_collect_client || true

    if witness_evidence_rollup; then
        wm_render_json
        w_journal collect "PASS evidence complete"
        w_ok "EVIDENCE_COMPLETE=true — server and client classes both captured."
        w_dim "$(_ev_dir)"
        return "$W_EXIT_PASS"
    fi

    wm_render_json
    w_journal collect "QUALIFIED server=$(wm_get SERVER_EVIDENCE) client=$(wm_get CLIENT_CONSOLE_CAPTURE)"
    w_rule
    w_warn "COLLECT QUALIFIED — EVIDENCE_COMPLETE=false"
    w_dim "SERVER_EVIDENCE=$(wm_get SERVER_EVIDENCE)"
    w_dim "CLIENT_CONSOLE_CAPTURE=$(wm_get CLIENT_CONSOLE_CAPTURE)"
    w_dim "This run may be cited only with that qualification attached. Server logs"
    w_dim "are not a substitute for client evidence — see $(_ev_client_dir)/README.txt"
    return "$W_EXIT_QUALIFIED"
}

# ═══════════════════════════════════════════════════════════════════════════════
# teardown
# ═══════════════════════════════════════════════════════════════════════════════
cmd_teardown() {
    w_load_run "${1:-}" || exit "$W_EXIT_USAGE"
    acquire_witness_lock "teardown"

    w_rule
    w_log "teardown — destroying the witness stack, keeping the evidence"
    w_rule

    # The one guard that makes `down -v` safe to run at all.
    guard_compose_project || exit "$W_EXIT_REFUSED"
    guard_container_names || exit "$W_EXIT_REFUSED"
    guard_no_protected_writes || exit "$W_EXIT_REFUSED"
    w_ok "Target is a witness project ($(wm_get COMPOSE_PROJECT)); no protected name in scope."

    local project file before after
    project="$(wm_get COMPOSE_PROJECT)"; file="$(wm_get COMPOSE_FILE)"

    if w_have_docker; then
        before="$(w_protected_state)"
        WITNESS_BUILD_CONTEXT="$(wm_get SNAPSHOT_DIR)" \
        GIT_COMMIT="$(wm_get CANDIDATE_SHORT_SHA)" \
        WITNESS_HTTP_PORT="$(wm_get HTTP_PORT)" \
        docker compose -p "$project" -f "$file" --env-file "$WITNESS_ENV_FILE" \
            down -v --remove-orphans >> "$WITNESS_RUN_DIR/teardown.log" 2>&1 || \
            w_warn "compose down reported an error — see $WITNESS_RUN_DIR/teardown.log"
        after="$(w_protected_state)"
        printf '%s\n' "$after" > "$WITNESS_RUN_DIR/protected-after-teardown.txt"
        if ! w_assert_protected_untouched "$before" "$after"; then
            wm_set PRODUCTION_ISOLATION "VIOLATED"
            wm_render_json
            w_journal teardown "FAIL protected-state-changed"
            exit "$W_EXIT_REFUSED"
        fi
    else
        w_warn "No docker daemon — nothing to bring down."
    fi

    # Drop the snapshot; keep the run dir, the manifest and every artifact of
    # evidence. A witness that deletes its own evidence is not a witness.
    local snap; snap="$(wm_get SNAPSHOT_DIR)"
    if [ -n "$snap" ] && [ -d "$snap" ]; then
        case "$snap" in
            "$(w_run_root)/snapshots/"*) rm -rf "$snap"; w_ok "Snapshot removed: $snap" ;;
            *) w_warn "Snapshot dir is outside the witness snapshot root — not removing: $snap" ;;
        esac
    fi

    wm_set TORN_DOWN_AT "$(w_utc)"
    wm_set WITNESS_READY "false"
    wm_render_json
    w_journal teardown "PASS"
    w_ok "Witness stack torn down. Evidence retained at $WITNESS_RUN_DIR"
    return "$W_EXIT_PASS"
}

# ═══════════════════════════════════════════════════════════════════════════════
# status / selftest / help
# ═══════════════════════════════════════════════════════════════════════════════
cmd_status() {
    w_load_run "${1:-}" || exit "$W_EXIT_USAGE"
    echo "run                    $(wm_show RUN_ID)"
    echo "candidate              $(wm_show CANDIDATE_SHORT_SHA)  $(wm_show CANDIDATE_SUBJECT)"
    echo "tree at prepare        $(wm_show CANDIDATE_TREE_STATE)"
    echo "compose project        $(wm_show COMPOSE_PROJECT)"
    echo "artifact assertion     '$(wm_show ARTIFACT_PATTERN)' in $(wm_show ARTIFACT_SOURCE_PATH)"
    echo "  discriminating       $(wm_show ARTIFACT_ASSERTION_DISCRIMINATING)"
    echo "migrations             $(wm_show MIGRATIONS)"
    echo "app health             $(wm_show APP_HEALTH)"
    echo "RUNTIME_PROVENANCE     $(wm_show RUNTIME_PROVENANCE)"
    echo "PRODUCTION_ISOLATION   $(wm_show PRODUCTION_ISOLATION)"
    echo "WITNESS_READY          $(wm_show WITNESS_READY)"
    echo "SERVER_EVIDENCE        $(wm_show SERVER_EVIDENCE)"
    echo "CLIENT_CONSOLE_CAPTURE $(wm_show CLIENT_CONSOLE_CAPTURE)"
    echo "EVIDENCE_COMPLETE      $(wm_show EVIDENCE_COMPLETE)"
    echo "run dir                $WITNESS_RUN_DIR"
    [ -f "$WITNESS_RUN_DIR/journal.log" ] && { echo "--- journal ---"; cat "$WITNESS_RUN_DIR/journal.log"; }
    return 0
}

cmd_selftest() { exec "$WITNESS_SCRIPT_DIR/verify-witness-instrument.sh" "$@"; }

cmd_help() {
    sed -n '2,40p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
    cat <<'USAGE'

Environment:
  WITNESS_RUN_ROOT              where runs + snapshots live (default ~/.maia-witness)
  WITNESS_SOURCE_REPO           repo to resolve/archive the candidate from
  WITNESS_ENV_FILE              witness env file (default scripts/witness/.env.witness)
  WITNESS_HTTP_PORT             loopback port for the witness app (default 3999)

  WITNESS_ARTIFACT_SOURCE_PATH  file in the candidate that identifies it        (required)
  WITNESS_ARTIFACT_PATTERN      string in that file, >= 8 chars, non-universal  (required)
  WITNESS_ARTIFACT_NEGATIVE_REF ref where the pattern must be ABSENT            (optional)
  WITNESS_ARTIFACT_RUNTIME_PROBE shell command run inside the container         (optional)

  WITNESS_CLIENT_CONSOLE_LOG    browser/Electron console log to adopt at collect

Exit codes:
  0 pass · 1 refused by a guard · 2 usage · 3 runtime provenance UNPROVEN
  4 evidence qualified/incomplete · 5 environment/tooling missing
USAGE
}

# ═══════════════════════════════════════════════════════════════════════════════
main() {
    local verb="${1:-help}"; shift || true
    case "$verb" in
        prepare)   cmd_prepare   "$@" ;;
        verify)    cmd_verify    "$@" ;;
        provision) cmd_provision "$@" ;;
        collect)   cmd_collect   "$@" ;;
        teardown)  cmd_teardown  "$@" ;;
        status)    cmd_status    "$@" ;;
        selftest)  cmd_selftest  "$@" ;;
        help|-h|--help) cmd_help ;;
        *) w_block "Unknown verb '$verb'"; cmd_help; exit "$W_EXIT_USAGE" ;;
    esac
}

main "$@"
