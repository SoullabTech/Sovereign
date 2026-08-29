#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# Witness Instrument — common substrate (run dirs, manifest, logging)
# ═══════════════════════════════════════════════════════════════════════════════
# Sourced by scripts/witness/witness.sh and by the self-test. Never executed
# directly. Defines no policy — policy lives in witness-guards.sh.
#
# A "run" is one witness attempt against one named candidate commit. Everything
# a run knows about itself lives in ONE sourceable file:
#
#   $WITNESS_RUN_DIR/manifest.env
#
# The manifest is the only channel between verbs. `verify` does not re-derive
# what `prepare` decided; it reads it and re-proves it. That is what makes
# "candidate mutation" detectable at all.
# ═══════════════════════════════════════════════════════════════════════════════

[ -n "${_WITNESS_COMMON_SOURCED:-}" ] && return 0
_WITNESS_COMMON_SOURCED=1

_W_RED='\033[0;31m'; _W_GREEN='\033[0;32m'; _W_YELLOW='\033[1;33m'
_W_BLUE='\033[0;34m'; _W_DIM='\033[2m'; _W_NC='\033[0m'

# All diagnostics to STDERR; STDOUT stays clean for machine-readable answers.
w_log()   { echo -e "${_W_BLUE}[witness]${_W_NC} $1" >&2; }
w_ok()    { echo -e "${_W_GREEN}[witness:ok]${_W_NC} $1" >&2; }
w_warn()  { echo -e "${_W_YELLOW}[witness:warn]${_W_NC} $1" >&2; }
w_block() { echo -e "${_W_RED}[witness:REFUSED]${_W_NC} $1" >&2; }
w_fail()  { echo -e "${_W_RED}[witness:FAIL]${_W_NC} $1" >&2; }
w_dim()   { echo -e "${_W_DIM}    $1${_W_NC}" >&2; }

w_rule()  { echo -e "${_W_BLUE}────────────────────────────────────────────────────────────────${_W_NC}" >&2; }

# ── Exit codes — distinct so callers can tell WHY, not just THAT ──────────────
#   0  pass
#   1  refused by a mechanical guard (isolation / immutability / naming)
#   2  usage error
#   3  runtime provenance UNPROVEN (expected before provision; fatal after)
#   4  evidence incomplete but explicitly qualified (collect only)
#   5  environment/tooling missing (docker, git, compose)
W_EXIT_PASS=0
W_EXIT_REFUSED=1
W_EXIT_USAGE=2
W_EXIT_UNPROVEN=3
W_EXIT_QUALIFIED=4
W_EXIT_ENV=5

# ── Roots ─────────────────────────────────────────────────────────────────────
# WITNESS_RUN_ROOT holds run dirs + snapshots. It MUST live outside any protected
# project dir (guard_no_protected_writes proves this).
w_run_root() { echo "${WITNESS_RUN_ROOT:-$HOME/.maia-witness}"; }

w_source_repo() {
    if [ -n "${WITNESS_SOURCE_REPO:-}" ]; then echo "$WITNESS_SOURCE_REPO"; return 0; fi
    git -C "${WITNESS_SCRIPT_DIR:-.}" rev-parse --show-toplevel 2>/dev/null || pwd
}

# ── Manifest ──────────────────────────────────────────────────────────────────
w_manifest_path() { echo "${1:-$WITNESS_RUN_DIR}/manifest.env"; }

# wm_set KEY VALUE — idempotent replace-or-append, shell-safe quoting.
wm_set() {
    local key="$1" val="$2" mf tmp
    mf="$(w_manifest_path)"
    tmp="${mf}.tmp.$$"
    : > "$tmp"
    [ -f "$mf" ] && grep -v "^${key}=" "$mf" >> "$tmp" 2>/dev/null
    # escape single quotes for a single-quoted shell literal
    printf "%s='%s'\n" "$key" "$(printf '%s' "$val" | sed "s/'/'\\\\''/g")" >> "$tmp"
    mv "$tmp" "$mf"
}

# wm_get KEY — empty string when unset. Sourced in a subshell so a malformed
# manifest can never poison the caller's environment.
wm_get() {
    local mf; mf="$(w_manifest_path)"
    [ -f "$mf" ] || { printf ''; return 0; }
    ( set +u; . "$mf" >/dev/null 2>&1 || true; eval "printf '%s' \"\${$1:-}\"" )
}

# Display helper: an unset field reads as an em dash, never as an empty string
# that could be misread as a value.
wm_show() { local v; v="$(wm_get "$1")"; printf '%s' "${v:-—}"; }

# Render manifest.env → manifest.json (no jq dependency; values are ours).
wm_render_json() {
    local mf out; mf="$(w_manifest_path)"; out="$WITNESS_RUN_DIR/manifest.json"
    [ -f "$mf" ] || return 0
    {
        echo "{"
        sed -n "s/^\([A-Z0-9_]*\)='\(.*\)'$/\1\t\2/p" "$mf" | awk -F'\t' '
            function esc(s) { gsub(/\\/,"\\\\",s); gsub(/"/,"\\\"",s); gsub(/\t/," ",s); return s }
            { if (NR>1) printf(",\n"); printf("  \"%s\": \"%s\"", esc($1), esc($2)) }
            END { printf("\n") }'
        echo "}"
    } > "$out"
}

# ── Run resolution ────────────────────────────────────────────────────────────
# ⛔ A VERB MUST NEVER INFER WHICH RUN IT BELONGS TO.
#
# Found by the second device qualification (2026-08-29): a run was prepared and
# verified as 20260829T205354Z, and then `provision` and `collect` — invoked with
# no run argument — acted on 20260829T205439Z, because a second prepare had moved
# the shared `current` pointer in between. No container was stolen; the run-scoped
# runtime repair held. But the OPERATOR's commands silently changed subject, and
# the diagnostic check that followed read the wrong run directory.
#
# It is the same ownership principle as the container defect, one layer up:
# "whichever run was prepared most recently" is not identity. `current` is shared
# mutable state that any lane on the machine can rewrite between two of your
# verbs.
#
# So `latest` is now advisory only — written for a human to read, never an input
# to a verb. A run is named explicitly, or through $WITNESS_RUN, which lives in
# one shell and no other lane can write.
w_set_current_run() {
    local root; root="$(w_run_root)"
    echo "$1" > "$root/latest"
    # Kept only so an older instrument's pointer file does not go stale and
    # mislead someone reading the directory by hand.
    echo "$1" > "$root/current"
}

_w_latest_run() {
    local root; root="$(w_run_root)"
    [ -f "$root/latest" ] && cat "$root/latest" && return 0
    [ -f "$root/current" ] && cat "$root/current" && return 0
    printf ''
}

_w_run_dir_for() {
    local id="$1" root; root="$(w_run_root)"
    if [ -d "$root/runs/$id" ]; then echo "$root/runs/$id"; return 0; fi
    if [ -d "$id" ]; then echo "$id"; return 0; fi
    return 1
}

w_resolve_run() {
    local want="${1:-}" pinned="${WITNESS_RUN:-}" dir latest

    # An argument and a pinned handle that disagree is ambiguity, not precedence.
    if [ -n "$want" ] && [ -n "$pinned" ] && [ "$want" != "$pinned" ]; then
        w_block "Ambiguous run: argument '$want' but WITNESS_RUN='$pinned'."
        w_dim "Refusing to pick. Unset WITNESS_RUN, or pass the run it names."
        return 1
    fi
    [ -n "$want" ] || want="$pinned"

    if [ -z "$want" ]; then
        latest="$(_w_latest_run)"
        w_block "No run named. This verb will not infer one."
        w_dim "The most-recently-prepared run is shared, mutable state: another lane"
        w_dim "can prepare a run between two of your commands, and a verb that guesses"
        w_dim "would then act on someone else's run. Name it:"
        w_dim ""
        w_dim "  export WITNESS_RUN=<run-id>       pins it for this shell, or"
        w_dim "  witness.sh <verb> <run-id>        pins it for one command"
        [ -n "$latest" ] && w_dim "" && w_dim "Most recently prepared here: $latest"
        return 1
    fi

    if ! dir="$(_w_run_dir_for "$want")"; then
        w_block "No such witness run: '$want'"
        return 1
    fi
    echo "$dir"
    return 0
}

# Load a run into the process: sets WITNESS_RUN_DIR + WITNESS_RUN_ID.
w_load_run() {
    local dir
    dir="$(w_resolve_run "${1:-}")" || return 1
    WITNESS_RUN_DIR="$dir"
    WITNESS_RUN_ID="$(basename "$dir")"
    export WITNESS_RUN_DIR WITNESS_RUN_ID
    return 0
}

w_utc() { date -u +%Y-%m-%dT%H:%M:%SZ; }

# ── Observer identity ─────────────────────────────────────────────────────────
# The instrument's own commit and tree state. The candidate cannot change during
# a run; neither can the witness. Resolved from the checkout the running scripts
# actually live in — not from $PWD, which is exactly how an operator ends up
# executing one instrument while believing they are running another.
w_instrument_sha() {
    git -C "$WITNESS_SCRIPT_DIR" rev-parse HEAD 2>/dev/null || printf 'unknown'
}

# A commit alone cannot identify a locally modified instrument: two checkouts at
# the same SHA with different working trees are different observers. Only the
# instrument's own files are considered — unrelated dirt elsewhere in the
# repository does not change which witness is executing.
w_instrument_tree_state() {
    local dirty
    dirty="$(git -C "$WITNESS_SCRIPT_DIR" status --porcelain --untracked-files=no -- \
             "$WITNESS_SCRIPT_DIR" 2>/dev/null || true)"
    [ -z "$dirty" ] && printf 'clean' || printf 'dirty'
}

w_instrument_dirty_paths() {
    git -C "$WITNESS_SCRIPT_DIR" status --porcelain --untracked-files=no -- \
        "$WITNESS_SCRIPT_DIR" 2>/dev/null || true
}

# Record a verb outcome on the run — the run's own ledger, appended never edited.
w_journal() {
    printf '%s  %-9s %s\n' "$(w_utc)" "${1}" "${2}" >> "$WITNESS_RUN_DIR/journal.log"
}

# Test seam: the self-test runs with no daemon and must be able to force the
# no-docker branch deterministically (same spirit as DEPLOY_VERIFY_PRINTENV_CMD
# in scripts/deploy-context.sh).
# Every docker invocation in the instrument goes through this seam, so the
# self-test can drive the runtime-provenance and evidence paths against a fake
# daemon on a host that has none. Same idea as DEPLOY_VERIFY_PRINTENV_CMD in
# scripts/deploy-context.sh — the alternative is that the guards which decide
# attribution are the only guards never exercised by a test.
_w_docker() { "${WITNESS_DOCKER_CMD:-docker}" "$@"; }

w_have_docker() {
    [ "${WITNESS_ASSUME_NO_DOCKER:-0}" = "1" ] && return 1
    command -v "${WITNESS_DOCKER_CMD:-docker}" >/dev/null 2>&1 && _w_docker info >/dev/null 2>&1
}

# A run's identity token: short, docker-name-safe, derived from the run id.
# Runtime objects carry it so that no two runs can ever address the same
# containers, project or volumes.
w_run_token_for() { printf '%s' "$1" | _w_sha256 | cut -c1-8; }
