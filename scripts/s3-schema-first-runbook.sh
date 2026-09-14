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
# ── ORDER, AND WHY BUILD COMES FIRST ──────────────────────────────────────────
#   lock → materialize <SHA> → assert pending set → BUILD → verify image
#        → MIGRATE (fail closed) → tag → SWAP → verify running → smoke
#
# ⭐ Build precedes migrate deliberately: a build failure must cost no schema
# change at all. Building is not swapping — no container is replaced until the
# migrations have succeeded.
#
# ── FAILURE SEMANTICS ─────────────────────────────────────────────────────────
#   build fails      → no migration, no swap; current reader untouched
#   migration fails  → candidate reader NEVER becomes live; current reader live
#   swap/verify fails→ current reader live against the already-proved-compatible
#                      SUPERSET schema (all five are additive or widening —
#                      DEPLOYMENT-SAFETY-02 census §3)
#   success          → candidate reader and S3 schema agree
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

RB_RED='\033[0;31m'; RB_GREEN='\033[0;32m'; RB_YELLOW='\033[1;33m'; RB_NC='\033[0m'
rb_info() { echo -e "[RUNBOOK] $1"; }
rb_ok()   { echo -e "${RB_GREEN}[RUNBOOK OK]${RB_NC} $1"; }
rb_warn() { echo -e "${RB_YELLOW}[RUNBOOK]${RB_NC} $1"; }
rb_stop() { echo -e "${RB_RED}[RUNBOOK STOP]${RB_NC} $1"; }

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

s3_schema_first_main() {
  local sha="${1:-}"

  if [ -z "$sha" ]; then
    rb_stop "This act names its candidate SHA or does nothing. ⛔ No DEPLOY_ALLOW_HEAD."
    return 2
  fi

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

  # ── SWAP — only now ────────────────────────────────────────────────────────
  tag_images_for_rollback "$GIT_COMMIT" 2>/dev/null || rb_warn "rollback tagging reported a problem"
  rb_info "Swapping the reader"
  deploy_ctx_compose up -d || { rb_stop "Swap failed."; rb_warn "Schema is the proved-compatible SUPERSET; the previous reader remains safe against it."; return 1; }
  sleep 10
  if ! deploy_ctx_verify_running "$GIT_COMMIT"; then
    rb_stop "Post-swap provenance verification FAILED."
    rb_warn "⛔ Roll the READER back: ./scripts/deploy-production.sh rollback"
    rb_warn "The migrated schema is a superset the previous reader was proved compatible with,"
    rb_warn "so a reader rollback is safe and no schema rollback is implied."
    return 1
  fi
  rb_ok "Running container reports the authorized candidate $GIT_COMMIT"

  rb_info "Co-Lab release gate"
  "${DEPLOY_DOCKER_BIN:-docker}" exec maia-sovereign sh -c \
    'DATABASE_URL="$DATABASE_URL" npx tsx scripts/verify-constitution-colab.ts' \
    || rb_warn "Co-Lab gate reported failures — inspect before declaring the act complete"

  rb_ok "S3 schema-first act complete for $GIT_COMMIT"
  return 0
}

if [ "${BASH_SOURCE[0]}" = "$0" ]; then
  s3_schema_first_main "$@"
  exit $?
fi
