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
# `current` is a pointer file (not a symlink — portable across macOS/Linux and
# survives being copied around).
w_set_current_run() { echo "$1" > "$(w_run_root)/current"; }

w_resolve_run() {
    local want="${1:-}" root; root="$(w_run_root)"
    if [ -n "$want" ]; then
        if [ -d "$root/runs/$want" ]; then echo "$root/runs/$want"; return 0; fi
        if [ -d "$want" ]; then echo "$want"; return 0; fi
        w_block "No such witness run: '$want'"
        return 1
    fi
    if [ -f "$root/current" ]; then
        local id; id="$(cat "$root/current")"
        if [ -d "$root/runs/$id" ]; then echo "$root/runs/$id"; return 0; fi
    fi
    w_block "No current witness run. Start one:  witness.sh prepare <SHA>"
    return 1
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

# Record a verb outcome on the run — the run's own ledger, appended never edited.
w_journal() {
    printf '%s  %-9s %s\n' "$(w_utc)" "${1}" "${2}" >> "$WITNESS_RUN_DIR/journal.log"
}

# Test seam: the self-test runs with no daemon and must be able to force the
# no-docker branch deterministically (same spirit as DEPLOY_VERIFY_PRINTENV_CMD
# in scripts/deploy-context.sh).
w_have_docker() {
    [ "${WITNESS_ASSUME_NO_DOCKER:-0}" = "1" ] && return 1
    command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1
}
