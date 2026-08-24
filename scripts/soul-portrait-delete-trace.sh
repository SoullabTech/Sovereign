#!/usr/bin/env bash
#
# Soul Portrait delete trace — READ ONLY.
#
# The 2026-08-24 witness found n_tup_del = 6 on soul_portraits. That is real
# deletion activity and was explicitly NOT dismissed (founder ruling): it gets
# its own small trace rather than being folded into the portrait story.
#
# This script does not assume it can identify the six rows. Postgres counters do
# not retain identity, so the honest first question is whether ANY evidence
# survives. It establishes that, and reports plainly when the answer is no.
#
# What is already known without any log (from the witness):
#   · 24 inserted − 6 deleted = 18 live. The arithmetic closes; nothing is
#     unaccounted for beyond those six.
#   · 9 ledger rows == 9 'active' portraits, 0 orphans.
#   · The consent FK is NO ACTION, so a portrait WITH AN EXTANT LEDGER ROW
#     cannot be plainly deleted. soul_portrait_consents also shows n_tup_del = 0,
#     so no child was removed first to clear the way (same reset caveat).
#     This bounds the six to rows that had NO ledger row at delete time.
#     It does NOT bound them to unpublished rows: publishing stamps
#     published_at and does NOT write consent (portraitStore.ts:181-190), so a
#     published-but-unconsented portrait was deletable. Publication is not what
#     the FK protects.
#   · A surviving row is literally named 'liveness-test-delete-me-525d2a9e',
#     showing throwaway drafts were being created in this window. Suggestive of
#     development cleanup — not evidence of it.
# So the six are bounded to rows without ledger entries. Whether any was
# published is NOT established. This trace asks whether we can say more.
#
# STRUCTURALLY READ ONLY. No writes, no log rotation, no cleanup.
set -euo pipefail

HOST="${MINISFORUM_HOST:-soullab@minisforum}"
psql_ro() {
  ssh "$HOST" "docker exec -i maia-postgres psql -U soullab maia_consciousness \
    -v ON_ERROR_STOP=1 -c \"SET default_transaction_read_only = on;\" -c \"$1\""
}

echo "════════════════════════════════════════════════════════════════════"
echo " Soul Portrait delete trace — READ ONLY"
echo " host=$HOST   at=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "════════════════════════════════════════════════════════════════════"

echo; echo "── 1. Is statement logging even on? (decides if evidence exists) ─────"
psql_ro "BEGIN READ ONLY;
SELECT name, setting FROM pg_settings
 WHERE name IN ('log_statement','log_min_duration_statement','logging_collector',
                'log_destination','log_directory','data_directory','wal_level')
 ORDER BY name;
COMMIT;"

echo; echo "── 2. Current portrait population, for the arithmetic ────────────────"
psql_ro "BEGIN READ ONLY;
SELECT count(*) AS live_rows,
       count(*) FILTER (WHERE published_at IS NOT NULL) AS published,
       count(*) FILTER (WHERE consent_state = 'active')  AS consent_active,
       count(*) FILTER (WHERE consent_state = 'pending') AS consent_pending,
       count(*) FILTER (WHERE slug ILIKE '%test%' OR slug ILIKE '%delete-me%') AS test_shaped
  FROM soul_portraits;
COMMIT;"

echo; echo "── 3. Postgres container log — any DELETE against soul_portraits? ────"
echo "     Absence here is NOT absence of the event: docker log retention is"
echo "     finite and log_statement is usually 'none' in production."
ssh "$HOST" "docker logs maia-postgres 2>&1 | grep -iE 'delete .*soul_portrait' | tail -40" \
  || echo "     (no matching lines in retained container log)"

echo; echo "── 4. App log — the app has no delete path, so any hit is notable ────"
echo "     Verified in Phase 1: no code in 5,180 commits deletes a portrait row."
echo "     A hit here would mean that finding is wrong and must be re-opened."
ssh "$HOST" "docker logs maia-sovereign 2>&1 | grep -iE 'soul-portrait.*(delete|remove)' | tail -20" \
  || echo "     (no matching lines in retained container log)"

cat <<'EOT'

════════════════════════════════════════════════════════════════════
 HOW TO READ THIS
════════════════════════════════════════════════════════════════════
 §1 log_statement = 'none'  → per-statement evidence was never written.
   The six deletes cannot be identified from logs, and no amount of
   searching will change that. Say so plainly rather than implying the
   question stays open forever.

 In that case the defensible finding is the bounded one, and it is
 already established without any log:

   Six rows were deleted from soul_portraits at an unrecorded time. None
   of them carried a consent-ledger row: the NO ACTION FK refuses that
   delete, and no ledger row was itself ever deleted (n_tup_del = 0 on
   soul_portrait_consents). Whether any of the six was PUBLISHED is not
   established — publishing does not write consent, so a
   published-but-unconsented portrait was deletable.

   24 - 6 = 18 against the live count is supporting consistency, NOT an
   identity reconstruction. Counters do not retain row identity. The six
   cannot be named, and this arithmetic does not name them.

 §3 or §4 returns hits → the trace becomes a real investigation. A hit in
   §4 in particular would contradict the Phase 1 finding that no code path
   deletes portraits, and that finding would have to be re-opened.

 This trace authorizes nothing. It does not restore, recreate, or clean up
 anything — including the surviving 'liveness-test-delete-me' row, which
 belongs to ce284751 and is not ours to remove.
════════════════════════════════════════════════════════════════════
EOT
