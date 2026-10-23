#!/usr/bin/env bash
# D23 review-only physical PG16 acceptance for SAME D21B author-context addendum.
# Never run against a real Writer DB, owner checkout, vault, member or source.
set -euo pipefail
test "$GITHUB_ACTIONS" = true && test "$GITHUB_REPOSITORY" = SoullabTech/Sovereign &&
test "$RUNNER_ENVIRONMENT" = github-hosted && test "$RUNNER_OS" = Linux ||
  { echo D23_REFUSE_NONHOSTED; exit 90; }
test -z "$(printenv DOCKER_HOST || :)" &&
test -z "$(printenv DOCKER_CONTEXT || :)" &&
test "$(docker context show)" = default || { echo D23_REFUSE_DOCKER_CONTEXT; exit 90; }
cd "$(dirname "$0")/../.."
base=scripts/qualification/fixtures/D21_SOURCE_V2_INTENT_REVIEW.sql
delta=scripts/qualification/fixtures/D21B_AUTHOR_CONTEXT_GUARD_REVIEW_ONLY.patch
printf '%s  %s\n' e81b5a16f57d508376d4ac5c248541a2820645876a819f7f1f54edf0c52a005c "$base" |
  sha256sum -c - >/dev/null || exit 91
printf '%s  %s\n' 8f121eaeaf61babccef24e88a62349c65b5a210109d2f8cd2ce8ed498950b6b7 "$delta" |
  sha256sum -c - >/dev/null || exit 91
while read -r sha file; do
  test "$(git hash-object "$file")" = "$sha" || { echo D23_UNPINNED_CANONICAL_FILE; exit 91; }
done <<'EXACT_SCHEMA'
84500afd80da26f9421f7a0360efe5003d98aaa8 database/migrations/20260721000003_press_manuscript_room.sql
2e75701ed8c7eb6f180cca10884577d75ffa418e database/migrations/20260727000001_manuscript_working_drafts.sql
4edec442909dcc51d59ee2c8f32f15be1dcceff4 database/migrations/20260801000001_living_works.sql
EXACT_SCHEMA

tmp="$(mktemp -d)"
pg="d23_writer_$GITHUB_RUN_ID"
cleanup(){ docker rm -f "$pg" >/dev/null 2>&1 || :; rm -rf "$tmp"; }
trap cleanup EXIT
fail(){ echo "D23_FAILED $1"; exit 92; }
mkdir -p "$tmp/database/migrations"
candidate="$tmp/database/migrations/20261023000003_writer_source_v2_intent_publication_REVIEW_ONLY.sql"
cp "$base" "$candidate"
patch -p1 --fuzz=0 --batch -d "$tmp" -i "$PWD/$delta" >/dev/null || fail patch_application
printf '%s  %s\n' 3eeaac2f110e1865934aacaa126e40d201c35ab5d12c6fd9bb6f34cd15a3e306 "$candidate" |
  sha256sum -c - >/dev/null || fail candidate_postimage
echo D23_PASS_exact_existing_D21B_amendment_postimage

docker run -d --name "$pg" --network none --memory 512m --cpus 1 \
  -e POSTGRES_DB=d23 -e POSTGRES_USER=d23 -e POSTGRES_PASSWORD=FICTIONAL_D23_ONLY \
  postgres:16-alpine >/dev/null
ready=0
for j in $(seq 1 50); do
  if docker exec "$pg" psql -X -qAt -v ON_ERROR_STOP=1 -U d23 -d d23 -c "SELECT 1" >/dev/null 2>&1; then
    ready=1; break
  fi
  sleep 1
done
test "$ready" = 1 || fail pg_boot
sql(){ docker exec "$pg" psql -X -qAt -v ON_ERROR_STOP=1 -U d23 -d d23 -c "$1"; }
id(){ printf '00000000-0000-4000-8000-%012d' "$1"; }
equal(){
  local got
  got="$(sql "$2")" || fail "$1"
  test "$got" = "$3" || { echo "D23_WANTED $3 GOT $got"; fail "$1"; }
  echo "D23_PASS $1"
}
refuse(){
  if sql "$2" >"$tmp/refused" 2>&1; then fail "$1 accepted"; fi
  grep -Fq "$3" "$tmp/refused" || { cat "$tmp/refused"; fail "$1 wrong_refusal"; }
  echo "D23_PASS $1 refused"
}
intent(){
  printf "INSERT INTO writer_source_v2_import_intents (arrival_id,member_id,gesture_id,living_work_id,work_decision,declaration_epoch,manuscript_id,object_id,key_id,generation,expected_original_bytes,expected_original_sha256,author_action_sha256,intent_receipt_sha256,reservation_sha256) VALUES ('%s','%s','%s','%s','add_existing',1,'%s','%s','%s',1,22447594,repeat('a',64),repeat('b',64),repeat('c',64),repeat('d',64))" \
  "$(id "$4")" "$(id "$1")" "$(id "$6")" "$(id "$2")" "$(id "$3")" "$(id "$5")" "$(id 600)"
}
sealed(){
  printf "INSERT INTO writer_source_v2_completed_originals (arrival_id,object_id,original_sha256,manifest_sha256,total_plaintext_bytes,chunk_count,immutable_version_id,external_snapshot_witness_sha256) VALUES ('%s','%s',repeat('a',64),repeat('b',64),22447594,6,'fictional-version-immutable-001',repeat('c',64))" \
  "$(id "$1")" "$(id "$2")"
}
pending(){
  printf "INSERT INTO writer_source_v2_pending_publications (arrival_id,member_id,living_work_id,manuscript_id,declaration_id,draft_id,first_revision_id,section_count,figure_reference_count,confirmed_cuts_sha256,figure_anchors_sha256,encrypted_derived_text_sha256,local_publication_receipt_sha256) VALUES ('%s','%s','%s','%s','%s','%s','%s',13,8,repeat('1',64),repeat('2',64),repeat('3',64),repeat('4',64))" \
  "$(id "$1")" "$(id "$2")" "$(id "$3")" "$(id "$4")" "$(id "$5")" "$(id "$6")" "$(id "$7")"
}

sql "CREATE TABLE members(id uuid PRIMARY KEY); INSERT INTO members VALUES ('$(id 1)'),('$(id 2)')" >/dev/null
for file in database/migrations/20260721000003_press_manuscript_room.sql \
            database/migrations/20260727000001_manuscript_working_drafts.sql \
            database/migrations/20260801000001_living_works.sql; do
  docker exec -i "$pg" psql -X -q -v ON_ERROR_STOP=1 -U d23 -d d23 < "$file" >/dev/null ||
    fail canonical_migration
done
docker exec -i "$pg" psql -X -q -v ON_ERROR_STOP=1 -U d23 -d d23 < "$candidate" >/dev/null ||
  fail amended_d21b_sql
equal five_canonical_FKs "SELECT count(*) FROM pg_constraint WHERE conrelid='writer_source_v2_pending_publications'::regclass AND contype='f' AND confrelid IN ('living_works'::regclass,'member_manuscripts'::regclass,'living_work_expressions'::regclass,'manuscript_working_drafts'::regclass,'working_draft_revisions'::regclass)" 5
sql "$(intent 1 101 201 301 501 401); $(sealed 301 501)" >/dev/null
refuse D22_missing_canonical_rejected "$(pending 301 1 101 201 701 901 801)" "writer_source_v2_author_context_unverified"
equal missing_canonical_leaves_zero_pending "SELECT count(*) FROM writer_source_v2_pending_publications" 0

sql "INSERT INTO living_works(id,member_id,title) VALUES ('$(id 101)','$(id 1)','Fictional Work A'),('$(id 102)','$(id 2)','Fictional Work B'),('$(id 103)','$(id 1)','Fictional Work A2'); INSERT INTO member_manuscripts(id,member_id,title) VALUES ('$(id 201)','$(id 1)','Fictional Manuscript A'),('$(id 202)','$(id 2)','Fictional Manuscript B'),('$(id 203)','$(id 1)','Fictional Manuscript A2')" >/dev/null
sql "INSERT INTO living_work_expressions(id,living_work_id,expression_type,expression_id,declared_by) VALUES ('$(id 701)','$(id 101)','manuscript','$(id 201)','$(id 1)'),('$(id 702)','$(id 102)','manuscript','$(id 202)','$(id 2)'),('$(id 703)','$(id 103)','manuscript','$(id 201)','$(id 1)')" >/dev/null
sql "INSERT INTO manuscript_working_drafts(id,manuscript_id,member_id,content,base_source_hash,revision_count) VALUES ('$(id 901)','$(id 201)','$(id 1)','Fiction A',repeat('a',64),3),('$(id 902)','$(id 202)','$(id 2)','Fiction B',repeat('a',64),1),('$(id 903)','$(id 203)','$(id 1)','Fiction A2',repeat('a',64),1)" >/dev/null
sql "INSERT INTO working_draft_revisions(id,draft_id,revision_number,content,saved_by,note) VALUES ('$(id 801)','$(id 901)',1,'Fiction A','$(id 1)','Baseline A'),('$(id 802)','$(id 902)',1,'Fiction B','$(id 2)','Baseline B'),('$(id 803)','$(id 901)',2,'Fiction A','$(id 1)','Revision A2'),('$(id 804)','$(id 901)',3,'Fiction A','$(id 2)','Foreign contributor'),('$(id 805)','$(id 903)',1,'Fiction A2','$(id 1)','Baseline A2')" >/dev/null

refuse foreign_Work "$(pending 301 1 102 201 701 901 801)" writer_source_v2_author_context_unverified
refuse foreign_manuscript "$(pending 301 1 101 202 701 901 801)" writer_source_v2_author_context_unverified
refuse foreign_declaration "$(pending 301 1 101 201 702 901 801)" writer_source_v2_author_context_unverified
refuse different_selected_Work_same_manuscript "$(pending 301 1 101 201 703 901 801)" writer_source_v2_author_context_unverified
refuse foreign_draft "$(pending 301 1 101 201 701 902 801)" writer_source_v2_author_context_unverified
refuse foreign_revision "$(pending 301 1 101 201 701 901 802)" writer_source_v2_author_context_unverified
refuse revision_number_two "$(pending 301 1 101 201 701 901 803)" writer_source_v2_author_context_unverified
refuse revision_saved_by_foreign_author "$(pending 301 1 101 201 701 901 804)" writer_source_v2_author_context_unverified
refuse same_member_different_manuscript_draft "$(pending 301 1 101 201 701 903 805)" writer_source_v2_author_context_unverified
equal nine_invalid_publications_leave_zero "SELECT count(*) FROM writer_source_v2_pending_publications" 0
sql "$(pending 301 1 101 201 701 901 801)" >/dev/null
equal correct_13_parts_8_figures_pending "SELECT section_count::text || '/' || figure_reference_count::text FROM writer_source_v2_pending_publications" "13/8"
refuse same_publication_not_recreated "$(pending 301 1 101 201 701 901 801)" "duplicate key"
refuse pending_cannot_mutate "UPDATE writer_source_v2_pending_publications SET section_count=14" writer_source_v2_immutable_record
sql "$(intent 2 102 202 302 502 402); $(sealed 302 502); $(pending 302 2 102 202 702 902 802)" >/dev/null
equal two_fictional_authors_correct "SELECT count(*) FROM writer_source_v2_pending_publications" 2
equal no_cross_author_dedup "SELECT count(DISTINCT object_id) FROM writer_source_v2_import_intents WHERE expected_original_sha256=repeat('a',64)" 2

# Deliberately demonstrate remaining at-use gap without repairing it by fiat.
sql "UPDATE living_work_expressions SET expression_id='$(id 203)' WHERE id='$(id 701)'" >/dev/null
equal changed_declaration_still_has_pending_row "SELECT count(*) FROM writer_source_v2_pending_publications WHERE arrival_id='$(id 301)'" 1
equal changed_declaration_no_longer_matches "SELECT count(*) FROM writer_source_v2_pending_publications p JOIN living_work_expressions e ON e.id=p.declaration_id AND e.expression_id=p.manuscript_id WHERE p.arrival_id='$(id 301)'" 0
echo D23_EXPECTED_UNSAFE_INSERT_ONLY_GUARD: canonical declaration can change after pending was written
sql "UPDATE living_work_expressions SET expression_id='$(id 201)' WHERE id='$(id 701)'" >/dev/null
refuse canonical_delete_BLOCKED_pending_FK "DELETE FROM member_manuscripts WHERE id='$(id 201)'" "foreign key"
echo D23_EXPECTED_ERASURE_BLOCKER: a pending FK is not completed deletion/revocation and requires independent R20 custodian

# D25: Extend the SAME D21B+canonical PG16 harness without changing SQL.
# All rows are fictional. These SQL-local reads MUST NOT authorize Source V2.
# The ontology explicitly permits one manuscript to appear in multiple Works.
equal D25_two_same_author_Works_share_manuscript \
  "SELECT count(*) FROM living_work_expressions WHERE expression_type='manuscript' AND expression_id='$(id 201)' AND declared_by='$(id 1)' AND living_work_id IN ('$(id 101)','$(id 103)')" 2
# A published Source linked to Work 101 currently prevents author detach.
refuse D25_selected_Work_detach_BLOCKED_by_pending_FK \
  "DELETE FROM living_work_expressions WHERE id='$(id 701)'" "foreign key"
# The unrelated Work 103 edge is independently removable; the common manuscript remains.
# ROLLBACK makes this a non-destructive control even in the fictional database.
equal D25_other_Work_detach_preserves_shared_manuscript \
  "BEGIN; DELETE FROM living_work_expressions WHERE id='$(id 703)'; SELECT count(*) FROM member_manuscripts WHERE id='$(id 201)'; ROLLBACK;" 1
equal D25_other_Work_declaration_restored \
  "SELECT count(*) FROM living_work_expressions WHERE id='$(id 703)' AND expression_id='$(id 201)'" 1

# Strongest possible purely SQL-local current join, not an external R20 authority.
# The missing independently administered revocation epoch is the expected red.
current_context="SELECT count(*) FROM writer_source_v2_pending_publications p
JOIN writer_source_v2_import_intents i ON i.arrival_id=p.arrival_id AND i.member_id=p.member_id AND i.living_work_id=p.living_work_id AND i.manuscript_id=p.manuscript_id
JOIN writer_source_v2_completed_originals o ON o.arrival_id=p.arrival_id AND o.object_id=i.object_id
JOIN living_works w ON w.id=p.living_work_id AND w.member_id=p.member_id
JOIN member_manuscripts m ON m.id=p.manuscript_id AND m.member_id=p.member_id
JOIN living_work_expressions e ON e.id=p.declaration_id AND e.living_work_id=p.living_work_id AND e.expression_type='manuscript' AND e.expression_id=p.manuscript_id AND e.declared_by=p.member_id
JOIN manuscript_working_drafts d ON d.id=p.draft_id AND d.manuscript_id=p.manuscript_id AND d.member_id=p.member_id
JOIN working_draft_revisions r ON r.id=p.first_revision_id AND r.draft_id=p.draft_id AND r.revision_number=1 AND r.saved_by=p.member_id
WHERE p.arrival_id='$(id 301)'"
equal D25_local_join_before_change "$current_context" 1
sql "UPDATE living_work_expressions SET expression_id='$(id 203)' WHERE id='$(id 701)'" >/dev/null
equal D25_local_join_refuses_rebound_away "$current_context" 0
equal D25_other_Work_remains_valid \
  "SELECT count(*) FROM living_work_expressions WHERE id='$(id 703)' AND living_work_id='$(id 103)' AND expression_id='$(id 201)'" 1
equal D25_pending_survives_rebind_away \
  "SELECT count(*) FROM writer_source_v2_pending_publications WHERE arrival_id='$(id 301)'" 1
sql "UPDATE living_work_expressions SET expression_id='$(id 201)' WHERE id='$(id 701)'" >/dev/null
equal D25_LOCAL_JOIN_ABA_returns_true_without_epoch "$current_context" 1
echo "D25_EXPECTED_UNSAFE_ABA_REBIND: local join returns true after declaration rebind, although no independent generation/withdrawal attestation was issued"

# Canonical Work ownership itself is mutable under the original migrations.
# The guard is only BEFORE INSERT; it cannot protect post-commit owner changes.
sql "UPDATE living_works SET member_id='$(id 2)' WHERE id='$(id 101)'" >/dev/null
equal D25_local_join_refuses_changed_Work_owner "$current_context" 0
equal D25_pending_still_exists_after_Work_owner_change \
  "SELECT count(*) FROM writer_source_v2_pending_publications WHERE arrival_id='$(id 301)'" 1
sql "UPDATE living_works SET member_id='$(id 1)' WHERE id='$(id 101)'" >/dev/null
equal D25_LOCAL_JOIN_owner_ABA_returns_true "$current_context" 1
echo "D25_EXPECTED_UNSAFE_OWNER_ABA: the canonical Work owner can change and revert without invalidating the local pending publication"
echo "D25_EXPECTED_ERASURE_BLOCKER: selected-Work detachment is FK-blocked; other-Work detachment is possible without deleting shared manuscript"
echo "D25_SQL_LOCAL_ONLY: no trusted R20, encrypted projection, vault actor, actual HTTP, author import, or deletion completion is qualified"

echo D23_PHYSICAL_PG16_EXPECTED_PASS: exact same candidate source, physically guarded initial insert, no external authority/serving GO
