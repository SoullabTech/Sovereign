#!/usr/bin/env bash
# WRITERS-STUDIO-PRODUCTION-DEPLOY-01 · Stage 1 — INDEPENDENT VERIFICATION.
#
# ⛔ READ ONLY, and deliberately independent of `deploy-production.sh`.
#
# ⭐⭐ WHY THIS EXISTS AT ALL: that script orders build → swap → verify →
# migrate, and its migrate step only `log_warn`s on failure while still printing
# "Deployment complete!". A green deploy is therefore NOT evidence a migration
# ran. Nothing below reads its output; every fact is queried directly.
set -uo pipefail
RELEASE_SHA="${RELEASE_SHA:-ae27205d9}"
WORK_ID="${WORK_ID:-55742458-be2c-406a-a158-d0438cf02892}"
H=soullab@minisforum
stop=0
say()  { printf '  %-14s %s\n' "$1" "$2"; }
gate() { if [ "$2" = "$3" ]; then say "✅ $1" "$2"; else say "⛔ STOP $1" "expected [$3] got [$2]"; stop=1; fi; }

echo "════ STAGE 1 · did production become exactly the release? ════"
say "release" "$RELEASE_SHA"
echo
CONT=$(ssh $H 'docker exec maia-sovereign printenv GIT_COMMIT' 2>/dev/null | tr -d '\r')
IMG=$(ssh $H 'docker image inspect maia-sovereign:current --format "{{range .Config.Env}}{{println .}}{{end}}"' 2>/dev/null | sed -n 's/^GIT_COMMIT=//p' | tr -d '\r')
LANE=$(ssh $H 'docker exec maia-sovereign printenv DEPLOY_LANE' 2>/dev/null | tr -d '\r')
# ⚠️ BOTH CHANNELS, SEPARATELY. A stale compose runtime override can stamp the
# image and not the container (2026-09-03); one check would have missed it.
gate "container" "$CONT" "$RELEASE_SHA"
gate "image"     "$IMG"  "$RELEASE_SHA"
gate "lane"      "$LANE" "deploy-lane"

echo
echo "── health ──"
ssh $H 'curl -sk https://soullab.life/api/health' 2>/dev/null | head -c 400; echo

echo
echo "── ⛔ the flag must STILL be off: Stage 1 does not activate editorial ──"
FLAG=$(ssh $H 'docker exec maia-sovereign printenv WRITERS_STUDIO_EDITORIAL_ENABLED' 2>/dev/null | tr -d '\r')
if [ -z "$FLAG" ]; then say "✅ flag" "absent (OFF)"; else say "⛔ STOP flag" "[$FLAG] — Stage 2 has not been ruled"; stop=1; fi

echo
echo "════ SCHEMA AND SUBJECT SURVIVED THE DEPLOY ════"
ssh $H "docker exec -i maia-postgres psql -U soullab maia_consciousness -v ON_ERROR_STOP=1 -v work_id=\"'$WORK_ID'\"" <<'SQL'
\pset pager off
SELECT
  (SELECT count(*) FROM schema_migrations WHERE filename IN (
     '20260914000001_proposal_succession.sql','20260914000002_manuscript_revision_offers.sql',
     '20260914000003_proposal_chains_member_identity.sql',
     '20260914000004_manuscript_revision_authorizations.sql',
     '20260914000005_editorial_ontology.sql',
     '20260915000001_ask_threads_subject_preparation.sql',
     '20260915000002_editorial_turn_bindings.sql')) AS "migrations (want 7)",
  (SELECT count(*) FROM member_manuscripts WHERE id = :work_id::uuid) AS "the Work (want 1)",
  (SELECT count(*) FROM manuscript_working_drafts d
    WHERE d.manuscript_id = :work_id::uuid AND d.section_addressable_at IS NOT NULL)
                                                                     AS "addressable draft (want 1)",
  (SELECT count(*) FROM manuscript_sections s
     JOIN manuscript_draft_sections ds ON ds.source_section_id = s.id
    WHERE s.manuscript_id = :work_id::uuid AND s.position BETWEEN 198 AND 221)
                                                                     AS "Ch10 scope addressable";
SQL

echo
if [ "$stop" -ne 0 ]; then echo "⛔⛔ STAGE 1 FAILED — do not proceed to Stage 2. Consider rollback."; exit 1; fi
echo "✅ Stage 1 identity, lane and flag verified independently of the deploy script."
echo "⚠️ Read the SQL row yourself — it is printed, not scored."
