#!/bin/sh
# PT-3 §IX — cutover preflight. READ ONLY. Run on the production host BEFORE any mutation.
#
# AUTHORITY. Founder ruling, Writer's Studio, 2026-09-08 §II–§IX.
#
#   ACCEPTED_SHA=<full 40-char sha> ssh soullab@minisforum 'sh -s' < scripts/witness/pt3-cutover-preflight.sh
#   (or, on the host:  ACCEPTED_SHA=... sh pt3-cutover-preflight.sh)
#
# It proves the ten §IX conditions and prints the §VII evidence record. It creates the snapshot the
# migration will use, and mutates NOTHING in production.
#
# ⚠️ ACCEPTED_SHA HAS NO DEFAULT, AND MUST NOT ACQUIRE ONE (§II — B3).
# A runbook cannot call a snapshot immutable while building it from whatever occupies a branch name
# that morning. The branch may be fetched so the object is local; it may not determine the tree.

set -eu
: "${ACCEPTED_SHA:?§II — set ACCEPTED_SHA to the full 40-character reviewed commit. A branch ref is not an authorization.}"

case "$ACCEPTED_SHA" in
  [0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f]) ;;
  *) echo "ABORT — ACCEPTED_SHA must be a full 40-character hex SHA, not '$ACCEPTED_SHA'." >&2; exit 1 ;;
esac

BRANCH="${CUTOVER_BRANCH:-claude/writers-studio-experiences-afia8t}"
PT3_MIGRATION="20260908000001_pt3_source_custody_enforcement.sql"
HELD_MIGRATION="20260908000002_writer_experiences.sql"
PROJECT="${PROJECT_DIR:-$HOME/MAIA-SOVEREIGN}"

fail=0
ok()  { printf 'OK    %-4s %s\n' "$1" "$2"; }
bad() { fail=$((fail+1)); printf 'ABORT %-4s %s\n      %s\n' "$1" "$2" "$3"; }

cd "$PROJECT"

echo "════════ §IX.1–2 — THE EXACT ACCEPTED TREE ════════"
git fetch -q origin "$BRANCH" 2>/dev/null || true
if git cat-file -e "${ACCEPTED_SHA}^{commit}" 2>/dev/null; then
  ok "1" "the accepted commit is present locally: $ACCEPTED_SHA"
else
  bad "1" "the accepted commit is not available" "fetch the branch containing $ACCEPTED_SHA, then re-run"
  echo; echo "PREFLIGHT FAILED"; exit 1
fi

SNAP="$(mktemp -d /tmp/pt3-cutover.XXXXXX)"
git archive "$ACCEPTED_SHA" | tar -x -C "$SNAP"
ok "2" "snapshot materialized from the SHA, not from $BRANCH: $SNAP"

echo
echo "════════ §IX.3 — THE HELD MIGRATION IS ABSENT FROM WHAT THE RUNNER WILL SEE ════════"
rm -f "$SNAP/database/migrations/$HELD_MIGRATION"
if [ -e "$SNAP/database/migrations/$HELD_MIGRATION" ]; then
  bad "3" "the held Experiences migration is still present" "§VIII — Experience deployment is not authorized"
else
  ok "3" "$HELD_MIGRATION removed from the presented set"
fi

echo
echo "════════ §IX.4 — THE COMPLETE PENDING SET (B4) ════════"
# Not a date-prefix listing. Every file the runner will see, minus every migration production has
# already recorded. Authorization is evaluated at execution time, never from an earlier observation.
PRESENTED="$(mktemp)"; APPLIED="$(mktemp)"; PENDING="$(mktemp)"
trap 'rm -f "$PRESENTED" "$APPLIED" "$PENDING"' EXIT

ls -1 "$SNAP/database/migrations/" | grep '\.sql$' | sort > "$PRESENTED"
docker exec -i maia-postgres psql -U soullab -d maia_consciousness -tAc \
  "SELECT filename FROM schema_migrations WHERE filename IS NOT NULL" 2>/dev/null | sort > "$APPLIED"
comm -23 "$PRESENTED" "$APPLIED" > "$PENDING"

echo "  files presented to the runner : $(wc -l < "$PRESENTED" | tr -d ' ')"
echo "  already applied in production : $(wc -l < "$APPLIED" | tr -d ' ')"
echo "  COMPUTED PENDING SET          : $(wc -l < "$PENDING" | tr -d ' ')"
sed 's/^/      /' "$PENDING"

if [ "$(wc -l < "$PENDING" | tr -d ' ')" = "1" ] && [ "$(cat "$PENDING")" = "$PT3_MIGRATION" ]; then
  ok "4" "the pending set is exactly the PT-3 migration"
else
  bad "4" "the pending set is not exactly one PT-3 migration" \
      "§III — no second pending migration of any date or name may proceed. ABORT."
fi

echo
echo "════════ §IX.5 — ATTRIBUTION REACHES THE MIGRATE CONTAINER ════════"
#
# ⭐ B17 — PROVE, THEN CHANGE. This reads the ACCEPTED SHA's Compose out of the snapshot, not the
# production checkout. The earlier order mutated the production checkout in Step 1 and ran the
# "pre-mutation" preflight in Step 2, so an abort left the deployment checkout altered for some
# later unrelated deploy to consume. Nothing on this host has been changed when this runs.
SNAP_COMPOSE="$SNAP/docker-compose.production.yml"
if grep -q 'GIT_COMMIT: \${GIT_COMMIT' "$SNAP_COMPOSE" 2>/dev/null; then
  ok "5" "the accepted tree's compose carries the attribution passthrough"
else
  bad "5" "the accepted tree's compose has no attribution passthrough" \
      "migration would record commit=unknown"
fi

# Whether the production checkout has been brought forward YET is reported, not judged: bringing it
# forward is the first bounded act AFTER this preflight passes.
if grep -q 'GIT_COMMIT: \${GIT_COMMIT' "$PROJECT/docker-compose.production.yml" 2>/dev/null; then
  echo "      production checkout's compose is already forward"
else
  echo "      production checkout's compose is NOT yet forward — expected; bring it forward after this preflight"
fi

echo
echo "════════ §IX.6–8 — THE RUNTIME SEAM, AND ITS DURABILITY (B12) ════════"
#
# ⭐ THERE IS NO OVERLAY. An earlier design put the authority seam in an optional second Compose
# file, which meant an ordinary deploy that failed to name it handed owner authority back to
# runtime. A boundary that disappears down the ordinary path is not a boundary.
#
# The seam is now a property of `.env.production` — the file EVERY service already loads. After
# cutover it carries the constrained credential and no owner credential, so no invocation can
# restore owner authority by omitting anything. `migrate` alone gets the owner credential back,
# from Compose's own .env. Forgetting that breaks MIGRATION, loudly; it never weakens the boundary.

COMPOSE="$SNAP/docker-compose.production.yml"
if grep -q 'DATABASE_URL: \${MIGRATE_DATABASE_URL' "$COMPOSE" 2>/dev/null; then
  ok "6" "the production compose separates migration authority from runtime authority"
else
  bad "6" "compose does not carry the migration-authority separation" \
      "bring $COMPOSE forward from $ACCEPTED_SHA on THIS host"
fi

if grep -q 'MAIA_APP_DATABASE_URL:-\$\${DATABASE_URL}' "$COMPOSE" 2>/dev/null \
   || grep -q 'MAIA_APP_DATABASE_URL:-\${DATABASE_URL}' "$COMPOSE" 2>/dev/null; then
  ok "7" "database healthchecks follow the authority, not the owner credential"
else
  bad "7" "a healthcheck still requires owner authority" \
      "§VI — health must not require the credential being removed"
fi

# There is no optional file whose omission could revert the cutover.
if ls "$PROJECT"/docker-compose.*cutover*.yml >/dev/null 2>&1; then
  bad "8" "an optional cutover overlay is present" \
      "§VII (B12) — the boundary must not depend on a file an ordinary deploy can omit"
else
  ok "8" "no optional overlay exists — the boundary cannot be omitted"
fi

# §V (B14) — this instrument proves the IMMUTABLE ARTIFACT. It deliberately does NOT pronounce on
# migration readiness, because that depends on an act (staging MIGRATE_DATABASE_URL) which has not
# happened yet and must not be pre-judged here. An earlier version printed a note about the missing
# variable and continued toward PREFLIGHT PASSED — a false green, since the canonical Compose now
# sources migrate's credential from it. Readiness is answered by
# scripts/witness/pt3-verify-migration-authority.sh, which FAILS CLOSED.
echo
echo "  phase state (reported, not judged — readiness is the verifier's question):"
if grep -qE '^DATABASE_URL=' "$PROJECT/.env.production" 2>/dev/null; then
  echo "      .env.production still carries the owner credential — expected before activation"
else
  echo "      .env.production no longer carries the owner credential — activation has run"
fi
if grep -qE '^MIGRATE_DATABASE_URL=' "$PROJECT/.env" 2>/dev/null; then
  echo "      MIGRATE_DATABASE_URL staged"
else
  echo "      MIGRATE_DATABASE_URL not staged — stage it, then run the migration-authority verifier"
fi

echo
echo "════════ §IX.9 — CREDENTIAL ESTABLISHMENT DOES NOT EXPOSE THE SECRET ════════"
STAGE="$SNAP/scripts/witness/pt3-stage-migration-authority.sh"
ACT="$SNAP/scripts/witness/pt3-activate-runtime-authority.sh"
if [ -r "$STAGE" ] && [ -r "$ACT" ]; then
  # B13 — activation must refuse before the migration has created the role.
  if grep -q "maia_app does not exist" "$ACT" && grep -q 'rolname=.maia_app' "$ACT"; then
    ok "9" "activation refuses until the migration has created maia_app"
  else
    bad "9" "activation does not check that maia_app exists" "§III (B13) — it cannot succeed before the migration"
  fi
  # B13 — staging must not touch the role or remove owner authority.
  if grep -q 'ALTER ROLE' "$STAGE"; then
    bad "9" "the staging phase configures maia_app" "§IV — that belongs after the migration"
  elif grep -q 'UNCHANGED' "$STAGE"; then
    ok "9" "staging preserves migration authority and leaves runtime authority intact"
  fi
  # B16 — no arbitrary-password path.
  if grep -qE 'read -r PW|PROMPT_FOR_PASSWORD' "$ACT"; then
    bad "9" "an arbitrary-password path remains" "§VII (B16) — stdin-safe is not SQL-literal-safe"
  else
    ok "9" "the credential is generated from a safe alphabet; no arbitrary password can alter the SQL"
  fi
  # B15 — the backup must be proven outside the repository.
  if grep -q 'REPO_ROOT' "$ACT" && grep -q 'chmod 700' "$ACT"; then
    ok "9" "the owner-credential backup is proven outside the repository, mode 700/600"
  else
    bad "9" "the backup location is not proven protected" "§VI (B15)"
  fi
else
  bad "9" "the two-phase authority scripts are missing from the snapshot" "$STAGE / $ACT"
fi

echo
echo "════════ §XIII — THE HIGH-PRIVILEGE LAUNCHER IS THE LAST MUTABLE DEPENDENCY ════════"
#
# The witnesses are piped from the accepted SHA and the migration SQL and runner arrive inside
# MAIA_BUILD_CONTEXT. But the owner-level mutation is launched by the PRODUCTION CHECKOUT's
# scripts/deploy-production.sh and its helpers. Leaving the command that chooses and launches the
# migration as a mutable dependency would undo the pinning one level up.
for helper in scripts/deploy-production.sh scripts/deploy-lock.sh scripts/deploy-tag.sh; do
  [ -r "$SNAP/$helper" ] || { echo "      $helper not in the accepted tree — skipped"; continue; }
  if [ ! -r "$PROJECT/$helper" ]; then
    bad "13" "$helper missing from the production checkout" "the launcher cannot be proven"
    continue
  fi
  a=$(sha256sum "$SNAP/$helper" | cut -d' ' -f1)
  b=$(sha256sum "$PROJECT/$helper" | cut -d' ' -f1)
  if [ "$a" = "$b" ]; then
    ok "13" "$helper matches the accepted artifact ($(printf '%s' "$a" | cut -c1-12))"
  else
    bad "13" "$helper DIFFERS from the accepted artifact" \
        "accepted $(printf '%s' "$a" | cut -c1-12) vs production $(printf '%s' "$b" | cut -c1-12) — bring it forward or run the migration from the reviewed source"
  fi
done

echo
echo "════════ §VII — SNAPSHOT EVIDENCE RECORD ════════"
CHECKSUM=$(sha256sum "$SNAP/database/migrations/$PT3_MIGRATION" 2>/dev/null | cut -d' ' -f1)
RUN_ID="pt3-cutover-$(date -u +%Y%m%dT%H%M%SZ)"
cat <<EVIDENCE
  pinned_source_commit : $ACCEPTED_SHA
  snapshot_path        : $SNAP
  excluded_migration   : $HELD_MIGRATION
  pending_set          : $(tr '\n' ' ' < "$PENDING")
  pt3_migration_sha256 : ${CHECKSUM:-<unreadable>}
  migration_run_id     : $RUN_ID
EVIDENCE

echo
echo "════════ VERDICT ════════"
if [ "$fail" -gt 0 ]; then
  echo "PREFLIGHT FAILED — $fail condition(s). No production mutation is authorized."
  exit 1
fi
cat <<NEXT
PREFLIGHT PASSED — all §IX conditions hold. Step 1 may now mutate production:

  export MAIA_BUILD_CONTEXT="$SNAP"
  export GIT_COMMIT="$ACCEPTED_SHA"        # §VI (B11) — all 40 characters. applied_by_commit is
                                          # TEXT and stores it whole; the commit authorized, presented
                                          # and recorded must be one identity. Short form: $(printf '%s' "$ACCEPTED_SHA" | cut -c1-9)
  export MIGRATION_RUN_ID="$RUN_ID"
  cd "$PROJECT" && scripts/deploy-production.sh migrate

Record the evidence block above alongside the run.
NEXT
