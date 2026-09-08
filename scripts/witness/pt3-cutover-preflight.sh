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
echo "════════ §IX.6–8 — THE RUNTIME SEAM, BEFORE IT IS APPLIED ════════"
OVERRIDE="$SNAP/docker-compose.pt3-cutover.yml"
if [ -r "$OVERRIDE" ]; then
  n_app=$(grep -c 'MAIA_APP_DATABASE_URL: \${MAIA_APP_DATABASE_URL' "$OVERRIDE" || true)
  n_own=$(grep -c 'DATABASE_URL: ""' "$OVERRIDE" || true)
  ok "6" "the override gives $n_app runtime services the constrained credential"
  if [ "$n_own" = "$n_app" ]; then
    ok "7" "the same $n_own services receive DATABASE_URL as an empty literal, never an interpolation"
  else
    bad "7" "constrained/blanked service counts disagree" "app=$n_app blanked=$n_own"
  fi
  if grep -q 'psql \$\${DATABASE_URL}' "$OVERRIDE"; then
    bad "8" "a healthcheck in the override still uses owner authority" "§VI — health must not require the credential being removed"
  else
    ok "8" "no healthcheck in the override depends on owner authority"
  fi
  if grep -qE '^\s{2}migrate:' "$OVERRIDE"; then
    bad "8" "the override touches the migrate service" "§IX.5 — migration authority must stay separate"
  fi
else
  bad "6" "docker-compose.pt3-cutover.yml is absent from the snapshot" "the runtime seam cannot be applied"
fi

# Every ordinary runtime container that currently POSSESSES owner authority must be covered.
echo
echo "  services currently possessing DATABASE_URL, and whether the override covers them:"
for c in $(docker ps --format '{{.Names}}' 2>/dev/null); do
  [ "$c" = "maia-postgres" ] && continue
  url=$(docker exec "$c" printenv DATABASE_URL 2>/dev/null || true)
  [ -n "$url" ] || continue
  svc=$(docker inspect -f '{{index .Config.Labels "com.docker.compose.service"}}' "$c" 2>/dev/null || echo '?')
  if [ -r "$OVERRIDE" ] && grep -qE "^  ${svc}:" "$OVERRIDE"; then
    printf '      %-24s (service %-22s) covered\n' "$c" "$svc"
  else
    printf '      %-24s (service %-22s) NOT COVERED\n' "$c" "$svc"
    bad "7" "$c would keep owner authority after cutover" \
        "§IX.4 — any additional ordinary runtime service that accesses the database must be included"
  fi
done

echo
echo "════════ §IX.9 — CREDENTIAL ESTABLISHMENT DOES NOT EXPOSE THE SECRET ════════"
RUNBOOK="$SNAP/docs/programme/WS-LIFE-OF-A-WORK_PT3_CUTOVER_RUNBOOK_2026-09-08.md"
if [ -r "$RUNBOOK" ]; then
  if grep -q "PASSWORD '\$" "$RUNBOOK"; then
    bad "9" "the runbook still interpolates the password into SQL" "§VI — use psql's \\password instead"
  elif grep -q '\\password maia_app' "$RUNBOOK"; then
    ok "9" "the runbook uses psql's \\password — the secret is never a shell or SQL argument"
  else
    bad "9" "no credential-establishment mechanism found in the runbook" "expected \\password maia_app"
  fi
else
  bad "9" "the runbook is missing from the snapshot" "$RUNBOOK"
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
  export GIT_COMMIT="$(printf '%s' "$ACCEPTED_SHA" | cut -c1-9)"
  export MIGRATION_RUN_ID="$RUN_ID"
  cd "$PROJECT" && scripts/deploy-production.sh migrate

Record the evidence block above alongside the run.
NEXT
