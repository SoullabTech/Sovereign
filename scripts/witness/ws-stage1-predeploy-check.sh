#!/usr/bin/env bash
# WRITERS-STUDIO-PRODUCTION-DEPLOY-01 · Stage 1 — PRE-DEPLOY IDENTITY CHECK.
#
# ⛔ READ ONLY. It changes nothing. Run from the Mac Studio IMMEDIATELY before
# the Stage 1 deploy; its whole value is that it was run against the state the
# deploy is about to act on, not against a state remembered from a conversation.
#
# ⭐⭐ THE TWO SHAs ARE PINNED AND IMMUTABLE. Canonical moved four times during
# the reconciliation ruling, all documentation. That churn must not ride this
# release, so the release SHA is named, never "whatever canonical is now."
#
# ⛔ PRODUCTION MOVING IS NOT THE SAME AS CANONICAL MOVING. Harmless docs churn
# on canonical is expected; a changed production target means the thing this
# deploy was reasoned about no longer exists, and that is a STOP.
set -uo pipefail
PROD_EXPECTED="${PROD_EXPECTED:-e57ca1baa}"
RELEASE_SHA="${RELEASE_SHA:-ae27205d9}"
WORK_ID="${WORK_ID:-55742458-be2c-406a-a158-d0438cf02892}"
H=soullab@minisforum
stop=0
say()  { printf '  %-12s %s\n' "$1" "$2"; }
gate() { if [ "$2" = "$3" ]; then say "✅ $1" "$2"; else say "⛔ STOP $1" "expected [$3] got [$2]"; stop=1; fi; }

echo "════ PINNED TARGETS ════"
say "production" "$PROD_EXPECTED"
say "release"    "$RELEASE_SHA"
echo
echo "════ 1 · PRODUCTION HAS NOT MOVED ════"
CONT=$(ssh $H 'docker exec maia-sovereign printenv GIT_COMMIT' 2>/dev/null | tr -d '\r')
IMG=$(ssh $H 'docker image inspect maia-sovereign:current --format "{{range .Config.Env}}{{println .}}{{end}}"' 2>/dev/null | sed -n 's/^GIT_COMMIT=//p' | tr -d '\r')
gate "container" "$CONT" "$PROD_EXPECTED"
gate "image"     "$IMG"  "$PROD_EXPECTED"

echo
echo "════ 2 · THE RELEASE SHA CARRIES WHAT IT MUST ════"
echo "-- ⛔ Asserted against the SHA, never against the working tree."
git cat-file -e "$RELEASE_SHA^{commit}" 2>/dev/null || { say "⛔ STOP release" "not present — fetch first"; stop=1; }
for f in lib/maia/continuity/sessionRecovery.ts \
         lib/sovereign/maiaService.ts \
         app/writers-studio/canvas/WorkConversation.tsx \
         app/writers-studio/canvas/RelationshipChooser.tsx \
         lib/manuscript/editorialRuntime/adoption.ts \
         lib/manuscript/sections/sectionProjection.ts \
         lib/manuscript/ask/workContext.ts; do
  if git cat-file -e "$RELEASE_SHA:$f" 2>/dev/null; then say "✅ present" "$(basename "$f")"
  else say "⛔ STOP absent" "$f"; stop=1; fi
done
# ⭐ L1 must be byte-identical to what production is RUNNING, not merely present.
for f in $(git show --name-only --format="" 56334e5d5 2>/dev/null); do
  a=$(git rev-parse "$PROD_EXPECTED:$f" 2>/dev/null); b=$(git rev-parse "$RELEASE_SHA:$f" 2>/dev/null)
  if [ -n "$a" ] && [ "$a" = "$b" ]; then say "✅ L1 same" "$(basename "$f")"
  else say "⛔ STOP L1" "$f differs from production"; stop=1; fi
done

echo
echo "════ 3 · EDITORIAL FLAG MUST BE OFF FOR STAGE 1 ════"
FLAG=$(ssh $H 'docker exec maia-sovereign printenv WRITERS_STUDIO_EDITORIAL_ENABLED' 2>/dev/null | tr -d '\r')
if [ -z "$FLAG" ]; then say "✅ flag" "absent (OFF) — correct for Stage 1"
else say "⛔ STOP flag" "set to [$FLAG]; Stage 1 requires OFF"; stop=1; fi

echo
echo "════ 4 · SCHEMA AND THE REAL SUBJECT ════"
ssh $H "docker exec -i maia-postgres psql -U soullab maia_consciousness -v ON_ERROR_STOP=1 -v work_id=\"'$WORK_ID'\"" <<'SQL'
\pset pager off
\echo '-- ⛔ Every count below must be exactly as annotated, or STOP.'
SELECT
  (SELECT count(*) FROM schema_migrations WHERE filename IN (
     '20260914000001_proposal_succession.sql','20260914000002_manuscript_revision_offers.sql',
     '20260914000003_proposal_chains_member_identity.sql',
     '20260914000004_manuscript_revision_authorizations.sql',
     '20260914000005_editorial_ontology.sql',
     '20260915000001_ask_threads_subject_preparation.sql',
     '20260915000002_editorial_turn_bindings.sql')) AS "migrations applied (want 7)",
  (SELECT count(*) FROM ask_threads WHERE anchor IS NULL AND proposal_chain_id IS NULL)
                                                        AS "subject-less threads (want 0)",
  (SELECT count(*) FROM (SELECT thread_id,turn_index,speaker FROM ask_turns
                          GROUP BY 1,2,3 HAVING count(*)>1) d)
                                                        AS "turn dupes (want 0)";
\echo ''
\echo '-- The Living Work, by UUID. ⛔ Never by title: there are two ELEMENTAL_ALCHEMY rows.'
SELECT mm.id, mm.title, m.username AS owner,
       d.section_addressable_at IS NOT NULL AS addressable, d.revision_count,
       (SELECT count(*) FROM manuscript_draft_sections s WHERE s.draft_id = d.id) AS sections
  FROM member_manuscripts mm
  JOIN members m ON m.id = mm.member_id
  JOIN manuscript_working_drafts d ON d.manuscript_id = mm.id
 WHERE mm.id = :work_id::uuid;
\echo ''
\echo '-- Chapter 10 · root 198, scope 198-221. ⛔ Every row must be addressable.'
SELECT s.position, left(coalesce(s.heading,'(none)'),46) AS heading,
       ds.id IS NOT NULL AS addressable
  FROM manuscript_sections s
  LEFT JOIN manuscript_draft_sections ds ON ds.source_section_id = s.id
 WHERE s.manuscript_id = :work_id::uuid AND s.position BETWEEN 198 AND 221
 ORDER BY s.position;
SQL

echo
if [ "$stop" -ne 0 ]; then echo "⛔⛔ STOP — do not deploy."; exit 1; fi
echo "✅ Local gates clean. ⚠️ Read section 4 yourself: its rows are not scored here,"
echo "   because a subject check that scores itself is a subject check that can lie."
