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
if grep -q 'GIT_COMMIT: \${GIT_COMMIT' "$PROJECT/docker-compose.production.yml" 2>/dev/null; then
  ok "5" "the checkout's compose carries the attribution passthrough"
else
  bad "5" "the checkout's compose has no attribution passthrough" \
      "cmd_migrate reads \$PROJECT_DIR's compose, not the snapshot's. Bring it forward first, or migration records commit=unknown."
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

COMPOSE="$PROJECT/docker-compose.production.yml"
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

# The owner credential must not be reachable by ordinary runtime once cutover completes; before it,
# report the state rather than judging it.
if grep -qE '^DATABASE_URL=' "$PROJECT/.env.production" 2>/dev/null; then
  echo "      .env.production still carries DATABASE_URL — expected BEFORE the credential step"
else
  ok "8" "the owner credential has already left .env.production"
fi
if grep -qE '^MIGRATE_DATABASE_URL=' "$PROJECT/.env" 2>/dev/null; then
  ok "8" "MIGRATE_DATABASE_URL is set for the migrate service"
else
  echo "      MIGRATE_DATABASE_URL not yet set in .env — required before Step 2, written by the credential installer"
fi

echo
echo "════════ §IX.9 — CREDENTIAL ESTABLISHMENT DOES NOT EXPOSE THE SECRET ════════"
INSTALLER="$SNAP/scripts/witness/pt3-install-runtime-credential.sh"
if [ -r "$INSTALLER" ]; then
  if grep -q "PASSWORD '\$" "$INSTALLER" && ! grep -q 'printf "ALTER ROLE' "$INSTALLER"; then
    bad "9" "the installer interpolates the password into a command" "§V — it must reach psql on stdin"
  elif grep -q 'stty -echo' "$INSTALLER" && grep -q 'docker exec -i' "$INSTALLER" \
       && grep -q 'check-ignore' "$INSTALLER"; then
    ok "9" "credential installation is non-echoing, stdin-delivered, and refuses a tracked destination"
  else
    bad "9" "the installer does not satisfy §X.3" "expected non-echo, stdin delivery, and a gitignore check"
  fi
else
  bad "9" "the credential installer is missing from the snapshot" "$INSTALLER"
fi

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
