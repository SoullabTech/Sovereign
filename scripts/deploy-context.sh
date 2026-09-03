#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# Immutable-SHA build context — "build a commit, not a checkout"
# ═══════════════════════════════════════════════════════════════════════════════
# On 2026-07-27 two parallel Claude sessions raced against minisforum's single
# SHARED production checkout. Session A checked out a synthetic branch; Session B's
# `deploy-production.sh deploy` then built Session A's commit — because the deploy
# resolved the commit-to-build from `git rev-parse HEAD` of the shared working
# tree, and the Docker build context was that same working tree (`context: .`).
# The deploy-lane flock (scripts/deploy-lock.sh) correctly SERIALIZES deploys, but
# it does not protect the interval between a checkout/pull and lock acquisition —
# so serialization alone cannot stop a deploy from building an unintended checkout.
# See memory reference_shared_checkout_deploy_incident.
#
# ── Ratified invariant (Kelly, 2026-07-27) ─────────────────────────────────────
#   "A deploy must build an explicitly named immutable commit, never whichever
#    branch happens to be checked out in a shared repository."
#
# This file is the structural realization of that invariant. It is the seam every
# deploy build passes through, and it closes the gap in one move:
#
#   resolve  — the operator names a commit (an explicit SHA/ref, Option 1). We
#              verify it is a real commit OBJECT independent of what is checked
#              out (Option 2, as an existence assertion — NOT a HEAD==SHA check,
#              which would re-couple us to the checkout we are trying to escape).
#   materialize — `git archive <SHA>` extracts that commit's tree into a fresh,
#              isolated directory, and THAT becomes the Docker build context
#              (Option 4). Because the context is a snapshot of an immutable
#              commit, it is decoupled from the shared working tree entirely:
#                • a concurrent `git checkout` of another branch cannot change it
#                  (closes the TOCTOU race the flock cannot);
#                • uncommitted files cannot enter the image (Option 3 is SUBSUMED
#                  — the known pre-existing `M Caddyfile` on minisforum physically
#                  cannot be in an archive of a committed SHA, so no dirty-tree
#                  refusal is needed to keep it out of the image).
#   stamp    — GIT_COMMIT is exported from the asserted SHA (Option 5), never a
#              re-resolution of HEAD, so the image provenance label IS the commit
#              we authorized.
#   verify   — after the container swap, we assert the RUNNING container's baked
#              GIT_COMMIT equals the asserted SHA (Option 5), so a mis-tag or a
#              stale image is caught loudly instead of surfacing days later.
#
# ── What this deliberately does NOT touch ──────────────────────────────────────
# Only the IMAGE BUILD context is materialized. Runtime service orchestration
# (volume bind-mounts like ./Caddyfile and ./beta, networks, the compose project
# identity, --env-file) still resolves from the project directory exactly as
# before. That is intentional: the live staging Caddyfile route must keep working
# at runtime, and no image ever copies it from the materialized context. Builds
# become immutable; runtime is unchanged.
#
# ── Public API (sourced by deploy-production.sh and pre-deploy-gate.sh) ─────────
#   deploy_ctx_resolve_sha "<ref>"          -> sets DEPLOY_CTX_FULL_SHA / _SHORT_SHA
#   deploy_ctx_materialize                   -> exports MAIA_BUILD_CONTEXT + GIT_COMMIT
#   deploy_ctx_assert_and_materialize "<ref>"-> the composite entry (resolve+refuse+materialize)
#   deploy_ctx_verify_running "<short> [container]" -> post-swap provenance assertion
#   deploy_ctx_verify_image "<short> [image]"        -> PRE-swap: built image carries the stamp
#   deploy_ctx_compose <args...>                     -> docker compose with the SNAPSHOT compose
#                                                       file + the project dir for runtime files
#   deploy_ctx_refuse_compose_runtime_override <f>   -> no GIT_COMMIT under services:
#   deploy_ctx_refuse_env_collision <envfile>        -> .env.production may not set GIT_COMMIT
#
# ── Deploy-provenance repair (Kelly, 2026-09-03) ───────────────────────────────
# Incident: image maia-sovereign:current carried GIT_COMMIT=2fafaa4c4 (build stamp
# intact) while the running container reported GIT_COMMIT=unknown. The stamp was
# overwritten at CONTAINER CREATION by the checkout's compose `environment:`
# override, interpolated at `up` without the variable. Two defects, both closed:
#   (1) a launcher could rewrite an immutable image's identity  → the compose
#       override is gone; the gate refuses any compose that sets GIT_COMMIT under
#       services:, and refuses an .env.production that defines it. ONE writer.
#   (2) the build used the SNAPSHOT but the swap used the CHECKOUT's compose —
#       a two-source deploy. deploy_ctx_compose now takes the compose file from
#       the materialized snapshot (--project-directory keeps runtime files —
#       .env.production, bind-mounts — on the project dir). The 2026-07-27 note
#       below ("runtime is unchanged") is superseded for the compose file only.
#   Plus: pre-swap image verify (abort BEFORE the swap) and a dual post-swap
#   verify (container Config.Env AND printenv) — a container that disagrees with
#   its image, or with the asserted SHA, fails the deploy.
#
# ── Escape hatch (explicit, loud, never silent — same philosophy as the lock) ──
#   DEPLOY_ALLOW_HEAD=1   Build the currently-checked-out HEAD when no SHA is
#                         given. Still materialized + announced; the operator has
#                         consciously accepted the shared-checkout risk. Used
#                         internally by `deploy-production.sh update` (whose whole
#                         contract is "build the tip I just pulled").
#
# ── Test / simulation seams (used by scripts/verify-deploy-context.sh) ─────────
#   DEPLOY_SOURCE_REPO             git repo to resolve/archive from (default $PROJECT_DIR)
#   DEPLOY_CONTEXT_DIR             parent dir for the materialized context (default $TMPDIR)
#   DEPLOY_VERIFY_PRINTENV_CMD     command whose stdout is the running GIT_COMMIT (printenv)
#   DEPLOY_VERIFY_INSPECT_CMD      command whose stdout is the running container Config.Env GIT_COMMIT
#   DEPLOY_VERIFY_IMAGE_CMD        command whose stdout is the built image Config.Env GIT_COMMIT
#   DEPLOY_DOCKER_BIN              docker binary used by deploy_ctx_compose (default docker)
#   DEPLOY_VERIFY_RETRIES          attempts when reading the running GIT_COMMIT (default 5)
# ═══════════════════════════════════════════════════════════════════════════════

# Idempotent source guard — both entry points may source this.
[ -n "${_DEPLOY_CONTEXT_SOURCED:-}" ] && return 0
_DEPLOY_CONTEXT_SOURCED=1

_DCTX_RED='\033[0;31m'; _DCTX_GREEN='\033[0;32m'; _DCTX_YELLOW='\033[1;33m'
_DCTX_BLUE='\033[0;34m'; _DCTX_NC='\033[0m'

# All logging goes to STDERR so callers can still capture a SHA on STDOUT.
_dctx_log()      { echo -e "${_DCTX_BLUE}[deploy-ctx]${_DCTX_NC} $1" >&2; }
_dctx_ok()       { echo -e "${_DCTX_GREEN}[deploy-ctx:ok]${_DCTX_NC} $1" >&2; }
_dctx_warn()     { echo -e "${_DCTX_YELLOW}[deploy-ctx:warn]${_DCTX_NC} $1" >&2; }
_dctx_block()    { echo -e "${_DCTX_RED}[deploy-ctx:BLOCK]${_DCTX_NC} $1" >&2; }

# Snapshot cleanup — a registry + a SINGLE fixed-string EXIT trap, installed once.
# Each materialized context pushes its dir onto a list; the handler removes them
# all on exit. Three things this design gets right, each learned the hard way:
#
#  1. Never re-parse `trap -p` and re-append. bash re-quotes a trap body when you
#     read it back, turning embedded single quotes into '\'' sequences, so
#     appending `rm -rf '<dir>'` corrupts the trap on the second call ("unexpected
#     EOF looking for matching '"). We install a CONSTANT trap string once and
#     keep paths in a variable instead.
#  2. Don't clobber a pre-existing EXIT trap. deploy-lock.sh installs one on
#     no-flock (macOS) hosts. We capture its body ONCE and re-run it via the
#     handler.
#  3. Preserve the triggering exit status. On minisforum (flock) there was no EXIT
#     trap before this; adding one must NOT turn a FAILED deploy into exit 0. The
#     handler captures $? on entry and returns it, so best-effort cleanup can never
#     mask a deploy failure (nor invent one).
_DEPLOY_CTX_CLEANUP_DIRS=""
_DEPLOY_CTX_TRAP_INSTALLED=""
_DEPLOY_CTX_PRIOR_EXIT_TRAP=""

_deploy_ctx_exit_handler() {
    local rc=$?               # the status that triggered the trap — preserve it
    # Re-run whatever EXIT trap existed before we took over (e.g. lockfile rm).
    [ -n "$_DEPLOY_CTX_PRIOR_EXIT_TRAP" ] && eval "$_DEPLOY_CTX_PRIOR_EXIT_TRAP" || true
    local d
    while IFS= read -r d; do
        if [ -n "$d" ]; then rm -rf "$d" || true; fi   # if-guarded so set -e can't abort us
    done <<EOF
${_DEPLOY_CTX_CLEANUP_DIRS}
EOF
    return "$rc"
}

_deploy_ctx_register_cleanup_dir() {
    _DEPLOY_CTX_CLEANUP_DIRS="${_DEPLOY_CTX_CLEANUP_DIRS}$1
"
    if [ -z "$_DEPLOY_CTX_TRAP_INSTALLED" ]; then
        _DEPLOY_CTX_TRAP_INSTALLED=1
        # Capture the prior EXIT trap body EXACTLY ONCE (before any single-quote
        # pollution can occur), then install our constant handler.
        _DEPLOY_CTX_PRIOR_EXIT_TRAP="$(trap -p EXIT 2>/dev/null | sed -n "s/^trap -- '\(.*\)' EXIT\$/\1/p")"
        trap '_deploy_ctx_exit_handler' EXIT
    fi
}

# ───────────────────────────────────────────────────────────────────────────────
# resolve — the operator names a commit; we prove it is a real commit object.
# Sets DEPLOY_CTX_FULL_SHA and DEPLOY_CTX_SHORT_SHA on success.
#   return 0  resolved
#   return 2  empty ref (caller decides: refuse, or HEAD-ack)
#   return 3  ref does not resolve to a commit in the source repo
# ───────────────────────────────────────────────────────────────────────────────
deploy_ctx_resolve_sha() {
    local ref="${1:-}"
    local repo="${DEPLOY_SOURCE_REPO:-${PROJECT_DIR:-.}}"
    DEPLOY_CTX_FULL_SHA=""
    DEPLOY_CTX_SHORT_SHA=""

    if [ -z "$ref" ]; then
        return 2
    fi

    local full
    full="$(git -C "$repo" rev-parse --verify --quiet "${ref}^{commit}" 2>/dev/null || true)"
    if [ -z "$full" ]; then
        _dctx_block "'$ref' does not resolve to a commit in $repo — refusing."
        _dctx_block "Pass a real commit SHA (or a ref that points at one). A deploy names a commit,"
        _dctx_block "it does not trust whatever happens to be checked out."
        return 3
    fi

    DEPLOY_CTX_FULL_SHA="$full"
    DEPLOY_CTX_SHORT_SHA="$(git -C "$repo" rev-parse --short "$full")"
    return 0
}

# ───────────────────────────────────────────────────────────────────────────────
# materialize — snapshot the resolved commit's tree into an isolated build
# context and point the build at it. Requires deploy_ctx_resolve_sha first.
# Exports MAIA_BUILD_CONTEXT (the snapshot dir) and GIT_COMMIT (the short SHA).
# ───────────────────────────────────────────────────────────────────────────────
deploy_ctx_materialize() {
    local repo="${DEPLOY_SOURCE_REPO:-${PROJECT_DIR:-.}}"
    local full="${DEPLOY_CTX_FULL_SHA:-}" short="${DEPLOY_CTX_SHORT_SHA:-}"

    if [ -z "$full" ] || [ -z "$short" ]; then
        _dctx_block "deploy_ctx_materialize called before a SHA was resolved. This is a bug."
        return 1
    fi

    local parent ctx
    parent="${DEPLOY_CONTEXT_DIR:-${TMPDIR:-/tmp}}"
    mkdir -p "$parent" 2>/dev/null || true
    ctx="$(mktemp -d "${parent%/}/maia-deploy-ctx.${short}.XXXXXX")" || {
        _dctx_block "Could not create a temp build-context dir under $parent."
        return 1
    }
    # Clean the snapshot up when the deploy process exits (crash-safe), without
    # disturbing the deploy-lock EXIT trap.
    _deploy_ctx_register_cleanup_dir "$ctx"

    _dctx_log "Materializing $short into an isolated build context (git archive) ..."
    if ! git -C "$repo" archive --format=tar "$full" | tar -xf - -C "$ctx"; then
        _dctx_block "git archive of $short failed — could not materialize the build context."
        return 1
    fi

    # Sanity: the snapshot must contain the app Dockerfile; a truncated/empty
    # archive would otherwise fail deep in the build with a confusing error.
    if [ ! -f "$ctx/Dockerfile" ]; then
        _dctx_block "Materialized context $ctx has no Dockerfile — refusing to build."
        return 1
    fi

    # ── Deployment STRUCTURE binds to the authorized commit too (2026-09-03) ──
    # The compose file the build AND the swap use is the snapshot's, never the
    # checkout's. It must exist in the snapshot and must not carry a runtime
    # GIT_COMMIT override; the operational env file must not define GIT_COMMIT.
    local compose="$ctx/docker-compose.production.yml"
    if [ ! -f "$compose" ]; then
        _dctx_block "Materialized context $ctx has no docker-compose.production.yml — refusing."
        _dctx_block "A deploy launches the named commit's deployment structure, not the checkout's."
        return 1
    fi
    deploy_ctx_refuse_compose_runtime_override "$compose" || return 1
    deploy_ctx_refuse_env_collision "${PROJECT_DIR:-.}/.env.production" || return 1
    export DEPLOY_COMPOSE_FILE="$compose"
    _dctx_ok "Deployment structure = snapshot compose: $compose"

    export MAIA_BUILD_CONTEXT="$ctx"
    export GIT_COMMIT="$short"
    _dctx_ok "Build context = immutable snapshot of $short at $ctx"
    _dctx_ok "GIT_COMMIT stamped from asserted SHA: $short"
    return 0
}

# ───────────────────────────────────────────────────────────────────────────────
# assert + materialize — the composite entry used by the deploy drivers.
# Refuses (exit-worthy return 1) when no SHA is named and DEPLOY_ALLOW_HEAD!=1.
# ───────────────────────────────────────────────────────────────────────────────
deploy_ctx_assert_and_materialize() {
    local ref="${1:-}"
    local repo="${DEPLOY_SOURCE_REPO:-${PROJECT_DIR:-.}}"

    if [ -z "$ref" ]; then
        if [ "${DEPLOY_ALLOW_HEAD:-0}" = "1" ]; then
            local br
            ref="$(git -C "$repo" rev-parse HEAD 2>/dev/null || true)"
            br="$(git -C "$repo" rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
            if [ -z "$ref" ]; then
                _dctx_block "DEPLOY_ALLOW_HEAD=1 but HEAD does not resolve in $repo."
                return 1
            fi
            _dctx_warn "No explicit SHA given; DEPLOY_ALLOW_HEAD=1 → building the CURRENT checkout tip."
            _dctx_warn "  repo=$repo  branch=$br  HEAD=$ref"
            _dctx_warn "  Shared-checkout risk accepted by ack. The resolved SHA is still snapshotted."
        else
            _dctx_block "Refusing: no explicit commit SHA was named."
            _dctx_block "A deploy must build an explicitly named immutable commit, never whichever"
            _dctx_block "branch happens to be checked out in a shared repository."
            _dctx_block "  Name the commit:      <entrypoint> <SHA>"
            _dctx_block "  Or ack current tip:   DEPLOY_ALLOW_HEAD=1 <entrypoint>"
            return 1
        fi
    fi

    deploy_ctx_resolve_sha "$ref" || return 1

    # Ownership window opens at announcement (per the durable invariant: a single
    # accountable lane owns the deploy from announcement through evidence capture).
    _dctx_log "──────────────────────────────────────────────────────────────"
    _dctx_log "DEPLOY TARGET (immutable): $DEPLOY_CTX_SHORT_SHA  ($DEPLOY_CTX_FULL_SHA)"
    _dctx_log "  source repo: $repo"
    _dctx_log "  subject:     $(git -C "$repo" log -1 --format='%s' "$DEPLOY_CTX_FULL_SHA" 2>/dev/null || echo '?')"
    _dctx_log "──────────────────────────────────────────────────────────────"

    deploy_ctx_materialize || return 1
    return 0
}

# ───────────────────────────────────────────────────────────────────────────────
# compose — docker compose bound to the SNAPSHOT's compose file, with the project
# directory supplying runtime files (.env.production, ./Caddyfile bind-mounts…).
# Requires deploy_ctx_materialize first (DEPLOY_COMPOSE_FILE). One writer for the
# deployment structure: the authorized commit.
# ───────────────────────────────────────────────────────────────────────────────
deploy_ctx_compose() {
    local compose="${DEPLOY_COMPOSE_FILE:-}"
    local project_dir="${PROJECT_DIR:-.}"
    if [ -z "$compose" ] || [ ! -f "$compose" ]; then
        _dctx_block "deploy_ctx_compose called before materialize (no snapshot compose file). This is a bug."
        return 1
    fi
    case "$compose" in
        "${MAIA_BUILD_CONTEXT:-/nonexistent}"/*) ;;
        *) _dctx_block "Compose file '$compose' is not inside the materialized snapshot — refusing a two-source deploy."; return 1 ;;
    esac
    local env_args=()
    if [ -f "$project_dir/.env.production" ]; then
        env_args=(--env-file "$project_dir/.env.production")
    fi
    "${DEPLOY_DOCKER_BIN:-docker}" compose \
        -p "${MAIA_COMPOSE_PROJECT:-maia-sovereign}" \
        --project-directory "$project_dir" \
        -f "$compose" \
        "${env_args[@]}" \
        "$@"
}

# ───────────────────────────────────────────────────────────────────────────────
# refusals — source provenance has ONE writer: the image build.
# ───────────────────────────────────────────────────────────────────────────────
# The compose file may reference GIT_COMMIT exactly once, as the shared build arg
# BEFORE `services:`. Any GIT_COMMIT under services: is a runtime override that
# can rewrite an immutable image's identity at launch — refused.
deploy_ctx_refuse_compose_runtime_override() {
    local f="${1:-}"
    if [ -z "$f" ] || [ ! -f "$f" ]; then
        _dctx_block "compose override check: file not found: '${f:-<empty>}'"
        return 1
    fi
    local services_line
    services_line="$(grep -nE '^services:' "$f" | head -1 | cut -d: -f1)"
    if [ -z "$services_line" ]; then
        _dctx_block "compose override check: no top-level 'services:' in $f"
        return 1
    fi
    local runtime_hits
    runtime_hits="$(awk -v s="$services_line" 'NR>s && /^[[:space:]]*GIT_COMMIT[[:space:]]*:/ {print NR": "$0}' "$f")"
    if [ -n "$runtime_hits" ]; then
        _dctx_block "PROVENANCE OVERRIDE: $f sets GIT_COMMIT under services: — a launcher may not rewrite image identity."
        while IFS= read -r line; do _dctx_block "  $line"; done <<EOF
$runtime_hits
EOF
        return 1
    fi
    local build_arg_hits
    build_arg_hits="$(awk -v s="$services_line" 'NR<s && /^[[:space:]]*GIT_COMMIT[[:space:]]*:/' "$f" | wc -l | tr -d ' ')"
    if [ "$build_arg_hits" != "1" ]; then
        _dctx_block "compose override check: expected exactly 1 GIT_COMMIT build arg before services: in $f, found $build_arg_hits"
        return 1
    fi
    _dctx_ok "compose carries GIT_COMMIT only as the build arg (no runtime override)"
    return 0
}

# .env.production is operational configuration, not source provenance. If it
# defines GIT_COMMIT, two writers exist — refused before any build.
deploy_ctx_refuse_env_collision() {
    local envfile="${1:-}"
    if [ -z "$envfile" ] || [ ! -f "$envfile" ]; then
        return 0   # no env file (self-tests, fresh hosts): nothing to collide with
    fi
    if grep -qE '^[[:space:]]*(export[[:space:]]+)?GIT_COMMIT[[:space:]]*=' "$envfile"; then
        _dctx_block "ENV COLLISION: $envfile defines GIT_COMMIT. Source provenance has one writer (the image build)."
        _dctx_block "Remove it and re-run."
        return 1
    fi
    _dctx_ok "env file does not define GIT_COMMIT"
    return 0
}

# ───────────────────────────────────────────────────────────────────────────────
# verify (PRE-swap) — the freshly built image must carry the asserted stamp.
# Mismatch → abort BEFORE replacing the running container.
# ───────────────────────────────────────────────────────────────────────────────
deploy_ctx_verify_image() {
    local expect="${1:-${DEPLOY_CTX_SHORT_SHA:-}}"
    local image="${2:-${MAIA_IMAGE_REPO:-maia-sovereign}:prod}"
    local cmd="${DEPLOY_VERIFY_IMAGE_CMD:-docker image inspect $image --format '{{range .Config.Env}}{{println .}}{{end}}' | sed -n 's/^GIT_COMMIT=//p' | head -1}"
    if [ -z "$expect" ]; then
        _dctx_block "deploy_ctx_verify_image called without an asserted SHA. This is a bug."
        return 1
    fi
    local got
    got="$(eval "$cmd" 2>/dev/null | tr -d '\r\n' || true)"
    if [ "$got" = "$expect" ]; then
        _dctx_ok "Built image provenance verified: $image GIT_COMMIT=$got == asserted $expect"
        return 0
    fi
    _dctx_block "IMAGE PROVENANCE MISMATCH: $image carries GIT_COMMIT='${got:-<empty>}', asserted '$expect'."
    _dctx_block "Refusing to swap: the image you built is not the commit you authorized."
    return 1
}

# ───────────────────────────────────────────────────────────────────────────────
# verify (POST-swap) — the running container must report the asserted SHA on BOTH
# channels: its Config.Env (what compose/docker constructed it with) and printenv
# (what the process sees). A container that disagrees with its image, or with the
# asserted SHA, fails the deploy. Overridable seams let the self-test inject readers.
# ───────────────────────────────────────────────────────────────────────────────
deploy_ctx_verify_running() {
    local expect="${1:-${DEPLOY_CTX_SHORT_SHA:-}}"
    local container="${2:-${MAIA_CONTAINER:-maia-sovereign}}"
    local cmd="${DEPLOY_VERIFY_PRINTENV_CMD:-docker exec $container printenv GIT_COMMIT}"
    local inspect_cmd="${DEPLOY_VERIFY_INSPECT_CMD:-docker inspect $container --format '{{range .Config.Env}}{{println .}}{{end}}' | sed -n 's/^GIT_COMMIT=//p' | head -1}"
    local max="${DEPLOY_VERIFY_RETRIES:-5}"

    if [ -z "$expect" ]; then
        _dctx_block "deploy_ctx_verify_running called without an asserted SHA. This is a bug."
        return 1
    fi

    local got="" attempt=1
    while [ "$attempt" -le "$max" ]; do
        got="$(eval "$cmd" 2>/dev/null | tr -d '\r\n' || true)"
        [ -n "$got" ] && break
        sleep 2
        attempt=$((attempt + 1))
    done
    local cfg
    cfg="$(eval "$inspect_cmd" 2>/dev/null | tr -d '\r\n' || true)"

    if [ "$got" = "$expect" ] && [ "$cfg" = "$expect" ]; then
        _dctx_ok "Running container provenance verified: GIT_COMMIT=$got (printenv) == $cfg (Config.Env) == asserted $expect"
        return 0
    fi

    _dctx_block "PROVENANCE MISMATCH: container '$container' reports GIT_COMMIT printenv='${got:-<empty>}' Config.Env='${cfg:-<empty>}',"
    _dctx_block "but this deploy asserted '$expect'. The live container is NOT provably the commit you authorized."
    _dctx_block "Do NOT trust production until reconciled (check rollback tags / re-run the deploy)."
    return 1
}
