#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# O1 RUNBOOK — S3 SCHEMA-FIRST PRODUCTION ACT (SINGLE USE, CANDIDATE-PINNED)
# ═══════════════════════════════════════════════════════════════════════════════
# Founder ruling 2026-09-14 (DEPLOYMENT-SAFETY-02): O1 selected — a deliberate,
# founder-supervised act. ⛔ O2/O3/O4/O5 NOT authorized.
#
# ⛔⛔ THIS IS NOT A NEW DEPLOYMENT PATH AND MUST NEVER BECOME ONE.
# `scripts/deploy-production.sh` is unchanged and still orders swap → migrate.
# This runbook exists for ONE act, over ONE pending set, and REFUSES to run
# against any other: the five expected filenames are hardcoded below and the
# pending set must match them exactly. A sixth pending file stops it dead.
# ⭐ That refusal is what keeps a one-off safe set from being promoted into an
# unproven universal deployment law.
#
# ── THE CUSTODY PROBLEM THIS CLOSES ───────────────────────────────────────────
# `deploy <SHA>` materializes an immutable named candidate; `cmd_migrate` takes
# no SHA and runs compose from the SHARED production checkout. Sequencing those
# two commands by hand would reintroduce exactly the checkout/provenance
# ambiguity the deploy path was built to eliminate.
# ⭐ So this runbook materializes the candidate ONCE and derives BOTH the
# migration tree AND the reader image from that single snapshot: the compose
# `migrate` service bind-mounts ${MAIA_BUILD_CONTEXT}/database/migrations, so
# after materialize the migrations that RUN are the candidate's by construction.
#
# ── SELF-PINNING: THE RUNBOOK IS ITSELF THE CANDIDATE'S ───────────────────────
# ⭐⭐ `git fetch` updates refs, NOT the working tree. Invoking this file from the
# shared checkout would pin the PAYLOAD to the candidate while the shell AUTHORITY
# performing the act came from whatever the checkout happened to hold. So phase 0
# re-execs this script out of a disposable detached worktree at the named SHA,
# and phase 0b — running pinned — PROVES it: the worktree HEAD must be the named
# commit, and this file plus every deployment helper it sources must hash-match
# that commit's blobs. ⛔ No trust in shared-checkout HEAD, and a hostile launcher
# that skips the worktree is refused by the hash comparison, not by convention.
#
# ── ORDER ─────────────────────────────────────────────────────────────────────
#   pin → prove self → lock → materialize <SHA> → assert pending set
#       → BUILD → verify image → MIGRATE (fail closed)
#       → PROVE ROLLBACK CUSTODY → SWAP → verify running → Co-Lab → complete
#
# ⭐ Build precedes migrate deliberately: a build failure must cost no schema
# change at all. Building is not swapping — no container is replaced until the
# migrations have succeeded.
#
# ── FAILURE SEMANTICS ─────────────────────────────────────────────────────────
#   build fails       → no migration, no swap; current reader untouched
#   migration fails   → candidate reader NEVER becomes live; current reader live
#   rollback custody
#     unprovable      → REFUSED BEFORE THE SWAP. ⛔ `tag_images_for_rollback`
#                       suppresses each `docker tag` with `|| true`, so its exit
#                       code cannot establish that :previous/:current/:<sha> are
#                       truthful. This runbook proves the tags itself.
#   swap fails        │
#   provenance fails  ├→ non-zero · RECOVERY REQUIRED · ⛔ NO completion claim.
#   Co-Lab fails      │  ⛔ This does NOT assert "the old reader remains live" —
#                        `up -d` can fail after doing work, and provenance fails
#                        after the swap. What IS established: the migrated schema
#                        is the proved-compatible SUPERSET (census §3), so
#                        restoring the previous reader is safe, and :previous was
#                        proved truthful before the boundary was crossed.
#                        ⛔ Automatic rollback is NOT part of this act.
#   success           → candidate reader and S3 schema agree, Co-Lab PASSED
#
# ⛔ `pre-deploy-gate.sh deploy-maia` is FORBIDDEN for this act: it runs no
# migrations at all, so it cannot fail closed on one.
# ⛔ No DEPLOY_ALLOW_HEAD escape: this act names its candidate or does nothing.
#
# Proof: scripts/verify-s3-schema-first-runbook.sh (npm run verify:s3-runbook)
# ═══════════════════════════════════════════════════════════════════════════════
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="${PROJECT_DIR:-$(cd "$SCRIPT_DIR/.." && pwd)}"
export PROJECT_DIR

# shellcheck source=deploy-lock.sh
source "$SCRIPT_DIR/deploy-lock.sh"
# shellcheck source=deploy-context.sh
source "$SCRIPT_DIR/deploy-context.sh"
# shellcheck source=deploy-tag.sh
source "$SCRIPT_DIR/deploy-tag.sh"

RB_RED='\033[0;31m'; RB_GREEN='\033[0;32m'; RB_YELLOW='\033[1;33m'; RB_NC='\033[0m'
rb_info() { echo -e "[RUNBOOK] $1"; }
rb_ok()   { echo -e "${RB_GREEN}[RUNBOOK OK]${RB_NC} $1"; }
rb_warn() { echo -e "${RB_YELLOW}[RUNBOOK]${RB_NC} $1"; }
rb_stop() { echo -e "${RB_RED}[RUNBOOK STOP]${RB_NC} $1"; }

# ⭐ THE ONE HONEST STATEMENT FOR EVERY FAILURE PAST THE SWAP BOUNDARY.
# ⛔ It does NOT claim the old reader is still live — `up -d` can fail after doing
# work and provenance fails after the swap. It states only what was established.
rb_recovery_required() {
  rb_stop "RECOVERY REQUIRED — $1"
  rb_warn "⛔ THIS ACT DID NOT COMPLETE. Nothing here declares it complete."
  rb_warn "Established before the boundary was crossed:"
  rb_warn "  · the five-file migration set applied successfully;"
  rb_warn "  · that schema is the proved-compatible SUPERSET (census §3), so the"
  rb_warn "    previous reader is safe against it and NO schema rollback is implied;"
  rb_warn "  · ${MAIA_IMAGE_REPO:-maia-sovereign}:previous was PROVED to be the pre-act reader."
  rb_warn "⛔ The live reader's state is UNKNOWN to this script — read it, do not assume it:"
  rb_warn "    docker ps --filter name=maia-sovereign"
  rb_warn "    docker exec maia-sovereign printenv GIT_COMMIT"
  rb_warn "Then decide deliberately. To restore the previous reader:"
  rb_warn "    ./scripts/deploy-production.sh rollback"
}

# ⭐ THE ACT'S SCOPE, AS DATA. Sorted exactly as the runner's glob encounters it.
RB_EXPECTED_PENDING=(
  20260121_trusted_colleagues.sql
  20260122_transcript_encryption.sql
  20260913000001_ask_authorization_acts.sql
  20260913000002_disclosure_boundary_developmental_ask.sql
  20260913000003_disclosure_gesture_authorize_sections.sql
)

# Pending = files in the CANDIDATE tree absent from the production ledger.
# Read-only. Overridable by the proof harness; never by an operator.
rb_pending_set() {
  local tree ledger
  tree="$(ls -1 "$MAIA_BUILD_CONTEXT/database/migrations"/*.sql 2>/dev/null | xargs -r -n1 basename | sort)"
  ledger="$("${DEPLOY_DOCKER_BIN:-docker}" exec maia-postgres psql -U soullab -d maia_consciousness -tAc \
      "SELECT filename FROM schema_migrations WHERE filename IS NOT NULL;" 2>/dev/null \
      | sed 's/[[:space:]]*$//' | sort)"
  comm -23 <(printf '%s\n' "$tree") <(printf '%s\n' "$ledger")
}

# ⭐ The deployment authority whose provenance must be proved: this file and every
# helper it sources. A stale helper is as dangerous as a stale runbook.
RB_PINNED_FILES=(
  s3-schema-first-runbook.sh
  deploy-context.sh
  deploy-lock.sh
  deploy-tag.sh
)

# PHASE 0 — re-exec out of a disposable detached worktree at the named commit.
rb_pin_and_reexec() {
  local sha="$1" repo full wt
  repo="${DEPLOY_SOURCE_REPO:-$PROJECT_DIR}"
  full="$(git -C "$repo" rev-parse --verify "${sha}^{commit}" 2>/dev/null)" || {
    rb_stop "'$sha' does not name a commit in $repo. Fetch first; ⛔ do not guess."
    return 2
  }
  wt="$(mktemp -d "${TMPDIR:-/tmp}/s3-runbook-pin.XXXXXX")"
  rb_info "Pinning the runbook itself to $full"
  git -C "$repo" worktree add --detach "$wt" "$full" >/dev/null 2>&1 || {
    rb_stop "Could not materialize a detached worktree at $full."
    rm -rf "$wt"; return 2
  }
  RB_PINNED=1 RB_PIN_DIR="$wt" RB_PIN_REPO="$repo" \
    PROJECT_DIR="$PROJECT_DIR" DEPLOY_SOURCE_REPO="$repo" \
    exec "$wt/scripts/s3-schema-first-runbook.sh" "$full"
}

# PHASE 0b — prove, from inside the pinned run, that we ARE the candidate.
rb_prove_self_provenance() {
  local full="$1" repo="${RB_PIN_REPO:-${DEPLOY_SOURCE_REPO:-$PROJECT_DIR}}"
  local head want got f
  head="$(git -C "$SCRIPT_DIR/.." rev-parse HEAD 2>/dev/null)"
  if [ "$head" != "$full" ]; then
    rb_stop "The runbook is NOT running from the candidate: HEAD=${head:-none}, expected $full."
    return 2
  fi
  for f in "${RB_PINNED_FILES[@]}"; do
    want="$(git -C "$repo" rev-parse "$full:scripts/$f" 2>/dev/null)"
    got="$(git hash-object "$SCRIPT_DIR/$f" 2>/dev/null)"
    if [ -z "$want" ] || [ "$want" != "$got" ]; then
      rb_stop "scripts/$f is not the candidate's copy (want ${want:-none}, got ${got:-none})."
      rb_warn "⛔ Shared-checkout or stale deployment authority. Nothing was changed."
      return 2
    fi
  done
  rb_ok "Runbook and all ${#RB_PINNED_FILES[@]} sourced helpers hash-match $full"
  return 0
}

rb_image_id() { "${DEPLOY_DOCKER_BIN:-docker}" image inspect "$1" --format '{{.Id}}' 2>/dev/null; }
rb_live_reader_image_id() { "${DEPLOY_DOCKER_BIN:-docker}" inspect maia-sovereign --format '{{.Image}}' 2>/dev/null; }

# ⭐ ROLLBACK CUSTODY, PROVED — never inferred from tag_images_for_rollback's exit
# code, whose three `docker tag` calls each end in `|| true`.
rb_prove_rollback_custody() {
  local sha="$1" pre="$2" repo="${MAIA_IMAGE_REPO:-maia-sovereign}"
  local cand prev cur shatag
  cand="$(rb_image_id "$repo:prod")"
  prev="$(rb_image_id "$repo:previous")"
  cur="$(rb_image_id "$repo:current")"
  shatag="$(rb_image_id "$repo:$sha")"

  [ -n "$cand" ] || { rb_stop "No built candidate image $repo:prod to roll forward from."; return 1; }
  if [ "$prev" != "$pre" ]; then
    rb_stop "ROLLBACK TARGET IS NOT TRUTHFUL: $repo:previous is ${prev:-none}, the pre-act reader was ${pre:-none}."
    rb_warn "⛔ Refusing BEFORE the swap: crossing it without a truthful rollback image is the one"
    rb_warn "   thing this act must never do. Nothing was swapped."
    return 1
  fi
  if [ "$cur" != "$cand" ] || [ "$shatag" != "$cand" ]; then
    rb_stop "Candidate tags are not truthful: :current=${cur:-none} :$sha=${shatag:-none} :prod=$cand."
    rb_warn "⛔ Refusing BEFORE the swap. Nothing was swapped."
    return 1
  fi
  rb_ok "Rollback custody proved — :previous is the pre-act reader; :current and :$sha are the candidate"
  return 0
}

s3_schema_first_main() {
  local sha="${1:-}"

  if [ -z "$sha" ]; then
    rb_stop "This act names its candidate SHA or does nothing. ⛔ No DEPLOY_ALLOW_HEAD."
    return 2
  fi

  if [ "${RB_PINNED:-0}" != "1" ]; then
    rb_pin_and_reexec "$sha"   # execs; only returns on failure
    return $?
  fi
  cd "$PROJECT_DIR" || return 2
  if [ -n "${RB_PIN_DIR:-}" ]; then
    trap 'git -C "${RB_PIN_REPO:-$PROJECT_DIR}" worktree remove --force "$RB_PIN_DIR" >/dev/null 2>&1' EXIT
  fi
  rb_prove_self_provenance "$sha" || return $?

  acquire_deploy_lock "s3-schema-first-runbook" "$sha"
  deploy_ctx_assert_and_materialize "$sha" || return 1
  deploy_ctx_refuse_env_collision "$PROJECT_DIR/.env.production" || return 1
  deploy_ctx_refuse_compose_runtime_override "$DEPLOY_COMPOSE_FILE" || return 1

  # ── ACT SCOPE ──────────────────────────────────────────────────────────────
  # ⭐ Re-verified HERE, at execution time, against the candidate's own tree.
  # The founder's preflight is evidence; this is the act's own reading.
  local pending expected
  pending="$(rb_pending_set)"
  expected="$(printf '%s\n' "${RB_EXPECTED_PENDING[@]}")"
  if [ "$pending" != "$expected" ]; then
    rb_stop "The pending set is not the set this act was proved for."
    echo "--- expected ---"; printf '%s\n' "$expected"
    echo "--- actual ---";   printf '%s\n' "${pending:-（none）}"
    rb_warn "⛔ Compatibility was proved for the expected set ONLY. A different set"
    rb_warn "   needs its own census and its own ruling. Nothing was changed."
    return 3
  fi
  rb_ok "Pending set matches the proved five-file set"

  # ── BUILD (no swap) ────────────────────────────────────────────────────────
  export APP_VERSION="$(node -p "require('$MAIA_BUILD_CONTEXT/package.json').version" 2>/dev/null || echo '1.0.0')"
  export BUILD_DATE="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  rb_info "Building candidate $GIT_COMMIT (no container is replaced by this step)"
  if ! deploy_ctx_compose build \
        --build-arg GIT_COMMIT="$GIT_COMMIT" \
        --build-arg APP_VERSION="$APP_VERSION" \
        --build-arg BUILD_DATE="$BUILD_DATE"; then
    rb_stop "Build failed. ⛔ No migration ran and no container was replaced."
    return 1
  fi
  deploy_ctx_verify_image "$GIT_COMMIT" "${MAIA_IMAGE_REPO:-maia-sovereign}:prod" || return 1

  # ── MIGRATE — from the SAME snapshot, BEFORE any swap ──────────────────────
  rb_info "Migrating from the candidate snapshot (five files)"
  if ! deploy_ctx_compose --profile migrate run --rm migrate; then
    rb_stop "MIGRATIONS FAILED — the candidate reader NEVER became live."
    rb_warn "The current reader is untouched and still serving. Nothing was swapped."
    rb_warn "The runner stops at the first failing file, so later files are unapplied."
    rb_warn "Diagnose, then re-run this runbook with the same SHA."
    return 1
  fi
  rb_ok "Migrations applied — schema is ready for the candidate reader"

  # ── ROLLBACK CUSTODY — proved BEFORE the swap boundary ────────────────────
  local pre_reader
  pre_reader="$(rb_live_reader_image_id)"
  if [ -z "$pre_reader" ]; then
    rb_stop "No live reader to capture. This act assumes a running production reader."
    return 1
  fi
  rb_ok "Pre-act live reader captured"
  tag_images_for_rollback "$GIT_COMMIT" >/dev/null 2>&1 || true
  rb_prove_rollback_custody "$GIT_COMMIT" "$pre_reader" || return 1

  # ── SWAP — only now ───────────────────────────────────────────────────────
  rb_info "Swapping the reader"
  if ! deploy_ctx_compose up -d; then
    rb_recovery_required "the swap did not complete"
    return 1
  fi
  sleep 10
  if ! deploy_ctx_verify_running "$GIT_COMMIT"; then
    rb_recovery_required "the running container does not report the authorized candidate $GIT_COMMIT"
    return 1
  fi
  rb_ok "Running container reports the authorized candidate $GIT_COMMIT"

  # ── CO-LAB — a GATE, not a warning ────────────────────────────────────────
  rb_info "Co-Lab release gate"
  if ! "${DEPLOY_DOCKER_BIN:-docker}" exec maia-sovereign sh -c \
      'DATABASE_URL="$DATABASE_URL" npx tsx scripts/verify-constitution-colab.ts'; then
    rb_recovery_required "the Co-Lab release gate did not pass"
    return 1
  fi
  rb_ok "Co-Lab release gate passed"

  rb_ok "S3 schema-first act complete for $GIT_COMMIT"
  return 0
}

if [ "${BASH_SOURCE[0]}" = "$0" ]; then
  s3_schema_first_main "$@"
  exit $?
fi
