#!/usr/bin/env bash
# PT-3 PRODUCTION CUTOVER — one locked, executable transition. PRODUCTION HOST.
#
# AUTHORITY. Founder ruling, Writer's Studio, 2026-09-08 §VII–§XV (B29, B30, B31, B32).
#
#   ACCEPTED_SHA=<40 hex> MAIA_BUILD_CONTEXT=<snapshot> scripts/pt3-cutover.sh
#
# ⭐ WHY THIS EXISTS (B29). The runbook described a fifteen-step protocol while the executable
# instrument was still the pre-B22 eight-step one: it never built the PT-3 image, never quiesced,
# migrated before any boundary, and still fetched the Experiences branch. The protocol existed as
# prose. This is the protocol.
#
# ⭐ ONE LOCK (B31). The deploy lane's lock is process-lifetime: `flock` on fd 9, released only when
# this process and every child exit. Acquired ONCE here and held across the whole transition, so no
# deploy, update, rollback or migrate can enter between acts.
#
#   ⚠️ `deploy-production.sh migrate` acquires the SAME lock, so calling it from here would contend
#   with its own parent. The migration therefore runs as the compose command directly, BENEATH the
#   lane authority already held.
#
# ⭐ ONE RELEASE (B30). Quiescence begins when the old runtime stops and ends at exactly one act:
# recreating the recorded set onto the new image with constrained authority. Nothing starts runtime
# before that — not the image build, not the migration, not the credential move.
#
# ⛔ POINT OF NO RETURN (§X). Once the migration commits, the pre-PT-3 image is NOT a rollback
# target: the old protocol writes Source sections by direct INSERT and does not understand the seam.
# On failure after that point: stay quiesced, report, recover forward. Never restart the old runtime
# against the migrated schema.

set -euo pipefail

: "${ACCEPTED_SHA:?set ACCEPTED_SHA to the full 40-character reviewed commit}"
: "${MAIA_BUILD_CONTEXT:?set MAIA_BUILD_CONTEXT to the snapshot the preflight materialized}"
[[ "$ACCEPTED_SHA" =~ ^[0-9a-f]{40}$ ]] || { echo "ABORT — ACCEPTED_SHA must be a full 40-char hex SHA." >&2; exit 1; }

# ⭐ SELF-PROVENANCE (B19 class). Every witness below runs from the immutable snapshot, and so must
# this launcher: the runbook invokes "$MAIA_BUILD_CONTEXT/scripts/pt3-cutover.sh". The natural
# mistake is to run ~/MAIA-SOVEREIGN/scripts/pt3-cutover.sh instead, because that is where scripts
# normally live — and the shared checkout can be on any branch. B19 was that same asymmetry one
# level up. So the launcher refuses unless it IS the accepted commit's copy: the sequence that
# governs the transition must be the sequence that was reviewed.
SELF="$(cd "$(dirname "$0")" && pwd)/$(basename "$0")"
SNAP_SELF="$MAIA_BUILD_CONTEXT/scripts/pt3-cutover.sh"
if [ ! -r "$SNAP_SELF" ]; then
  echo "ABORT — $SNAP_SELF is absent. The snapshot does not carry this orchestrator." >&2; exit 1
fi
if ! cmp -s "$SELF" "$SNAP_SELF"; then
  echo "ABORT — this launcher differs from the accepted commit's copy." >&2
  echo "        running: $SELF" >&2
  echo "        accepted: $SNAP_SELF" >&2
  echo "        Do not reconcile by editing either. Re-materialize the snapshot from $ACCEPTED_SHA." >&2
  exit 1
fi

PROJECT="${PROJECT_DIR:-$HOME/MAIA-SOVEREIGN}"
COMPOSE="$PROJECT/docker-compose.production.yml"
W="$MAIA_BUILD_CONTEXT/scripts/witness"
DB="${PT3_DB:-maia_consciousness}"
export GIT_COMMIT="$ACCEPTED_SHA"
export MIGRATION_RUN_ID="${MIGRATION_RUN_ID:-pt3-cutover-$(date -u +%Y%m%dT%H%M%SZ)}"

cd "$PROJECT"
# shellcheck source=/dev/null
. "$MAIA_BUILD_CONTEXT/scripts/deploy-lock.sh"
acquire_deploy_lock "pt3-cutover" "$ACCEPTED_SHA"
echo "── deploy-lane lock held for the whole transition (pid $$) ──"

step() { printf '\n════════ %s ════════\n' "$1"; }
q()    { docker exec maia-postgres psql -U soullab -d "$DB" -tAc "$1"; }
die()  { echo "ABORT — $1" >&2; exit 1; }
die_quiesced() {
  echo "ABORT — $1" >&2
  echo "        Runtime remains QUIESCED. The pre-PT-3 image is not a rollback target (§X)." >&2
  echo "        Recover forward with the PT-3 runtime; do not restart the old application." >&2
  exit 1
}

step "0 · fail-closed host verification (B36) — prove the installed surface before mutating it"
#
# ⭐ B36 — PROVE ARTIFACT → INSTALL BOUNDED SURFACE → PROVE INSTALLED SURFACE → MUTATE.
# The immutable preflight proves the ACCEPTED artifact and must not demand that changed host files
# already equal it — that gate was internally impossible, because this repair changes
# deploy-production.sh and the preflight ran before the step that installs it. The equality question
# belongs HERE, after the forward step and before the first mutation, where it can actually be true.
HOST_SURFACE="docker-compose.production.yml scripts/deploy-production.sh scripts/deploy-lock.sh scripts/deploy-tag.sh scripts/pt3-cutover.sh"
surface_fail=0
for f in $HOST_SURFACE; do
  [ -r "$MAIA_BUILD_CONTEXT/$f" ] || continue
  if [ ! -r "$PROJECT/$f" ]; then
    echo "  MISSING  $f — install it from $ACCEPTED_SHA and re-run"; surface_fail=1; continue
  fi
  a=$(sha256sum "$MAIA_BUILD_CONTEXT/$f" | cut -d" " -f1)
  b=$(sha256sum "$PROJECT/$f" | cut -d" " -f1)
  if [ "$a" = "$b" ]; then
    echo "  OK       $f  $(printf '%s' "$a" | cut -c1-12)"
  else
    echo "  DIFFERS  $f  accepted $(printf '%s' "$a" | cut -c1-12) vs host $(printf '%s' "$b" | cut -c1-12)"
    surface_fail=1
  fi
done
[ "$surface_fail" -eq 0 ] || die "the installed host surface is not the accepted artifact. Install it, then re-run. Nothing has been mutated."

step "1 · stage owner authority into service-specific custody — FAIL CLOSED (B37)"
sh "$W/pt3-stage-migration-authority.sh"

step "2 · verify migration authority (fail-closed)"
sh "$W/pt3-verify-migration-authority.sh" || die "migration authority not ready"

step "3 · build BOTH PT-3 runtime images — prepared, NOT started (B34)"
#
# ⭐ B34 — THERE ARE TWO PRODUCTION RUNTIMES. maia-sovereign:prod (Dockerfile) and maia-api:prod
# (apps/api/Dockerfile) are separate images, and apps/api/src/db/postgres.ts was the sixth database
# pool — outside the five-pool census because the search covered lib/ and app/ and production also
# builds from apps/. Correcting the API source without rebuilding its image would leave production
# running the old owner-era binary: the fix would exist in the repository and not in the platform.
docker compose --env-file "$PROJECT/.env.production" -f "$COMPOSE" build \
  --build-arg GIT_COMMIT="$ACCEPTED_SHA" maia maia-api \
  || die "a PT-3 image did not build — nothing has been quiesced and nothing migrated"

# Provenance BEFORE the outage. An image that cannot state its commit cannot join an immutable-SHA
# transition, and discovering that after the point of no return is the worst possible moment.
for img in maia-sovereign:prod maia-api:prod; do
  stamped=$(docker image inspect "$img" --format '{{range .Config.Env}}{{println .}}{{end}}' 2>/dev/null \
            | sed -n 's/^GIT_COMMIT=//p' | head -1)
  [ "$stamped" = "$ACCEPTED_SHA" ] \
    || die "$img is stamped '${stamped:-<none>}', not $ACCEPTED_SHA — build provenance failed before any outage"
  echo "  $img stamped $ACCEPTED_SHA"
done
echo "both images built and provenance-verified; no container has been swapped"

step "4 · record the owner-credential holders (B38) — before anything changes"
# Two different sets, and conflating them is the B38 defect: the SOURCE-WRITING set is stopped at
# quiescence; the OWNER-CREDENTIAL-HOLDING set must be recreated after .env.production is cleansed.
# maia-caddy is in the second and not the first — it stays up so the outage presents as a refusal.
sh "$W/pt3-recreate-credential-bearing-runtime.sh" record || die "could not record owner-credential holders"

step "5 · QUIESCE — the outage begins"
sh "$W/pt3-quiesce-source-writes.sh" || die "quiescence failed; nothing has been migrated"

step "6 · apply exactly the PT-3 migration, attributed"
# Beneath the lane authority already held — never via deploy-production.sh, which would re-acquire.
docker compose --env-file "$PROJECT/.env.production" -f "$COMPOSE" \
  --profile migrate run --rm migrate || die_quiesced "the migration failed"

step "7 · verify migration, attribution and scope"
[ "$(q "SELECT count(*) FROM schema_migrations WHERE filename='20260908000001_pt3_source_custody_enforcement.sql' AND applied_by_commit='$ACCEPTED_SHA'")" = "1" ] \
  || die_quiesced "the migration is not attributed to $ACCEPTED_SHA"
[ "$(q "SELECT count(*) FROM information_schema.tables WHERE table_name LIKE 'writer_experience%'")" = "0" ] \
  || die_quiesced "Experience tables exist — §XII does not authorize Experience deployment"
[ "$(q "SELECT count(*) FROM pg_roles WHERE rolname='maia_app'")" = "1" ] \
  || die_quiesced "maia_app was not created"
echo "migration attributed to the full SHA · no Experience table · maia_app created"

step "8 · assert the deterministic backfill — WHILE STILL QUIESCED (B32)"
# These counts are deterministic only because no member can write. After release they may lawfully
# change, and asserting them then would call a healthier platform a defect.
sh "$W/pt3-verify-backfill.sh" || die_quiesced "the backfill did not match the accepted census"

step "9 · establish the maia_app credential and remove ALL owner material — runtime still stopped"
sh "$W/pt3-activate-runtime-authority.sh" || die_quiesced "credential activation failed"

step "10 · shed stale owner credentials from surviving containers (B38)"
# maia-caddy never stopped, so it still holds the environment it was created with — a running
# container does not reread an env file. It is recreated here, before release, so that by the time
# anything serves members no ordinary container possesses owner material in any form.
sh "$W/pt3-recreate-credential-bearing-runtime.sh" shed || die_quiesced "owner material survives in a running container"

step "11 · RELEASE — recreate the recorded set onto the new images with constrained authority"
# ⭐ The single release act (B30). Source-writing runtime starts here and nowhere earlier.
sh "$W/pt3-quiesce-source-writes.sh" release || die_quiesced "release failed"

step "12 · prove the running images and the constrained authority"
# ⛔ NOT A WARNING. A runtime serving an image other than the accepted one, against a migrated
# schema, is a §X abort condition: the pre-PT-3 application writes Source by direct INSERT and does
# not understand the seam. Reporting that as WARN would let the cutover announce success over it.
# ⭐ BOTH runtimes (B34), and not as a warning. A runtime serving an image other than the accepted
# one against a migrated schema is a §X abort condition: the pre-PT-3 application writes Source by
# direct INSERT and does not understand the seam.
for c in maia-sovereign maia-api; do
  RUNNING=$(docker exec "$c" printenv GIT_COMMIT 2>/dev/null || echo '<none>')
  if [ "$RUNNING" != "$ACCEPTED_SHA" ]; then
    echo "ABORT — $c runs $RUNNING, not $ACCEPTED_SHA." >&2
    echo "        The schema is migrated. Quiesce again and recover forward to $ACCEPTED_SHA;" >&2
    echo "        the pre-PT-3 image is not a rollback target (§X)." >&2
    exit 1
  fi
  echo "  $c = $ACCEPTED_SHA"
done
PT3_ACCEPTED_SHA="$ACCEPTED_SHA" sh "$W/pt3-cutover-readiness.sh"    || die "readiness did not return READY"
PT3_ACCEPTED_SHA="$ACCEPTED_SHA" sh "$W/pt3-post-cutover-witness.sh" || die "the post-cutover witness did not return READY"

step "CUTOVER COMPLETE"
echo "PT-3 is structurally enforced in production."
echo "run id: $MIGRATION_RUN_ID · commit: $ACCEPTED_SHA"
