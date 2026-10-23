#!/usr/bin/env bash
# D22 QA-only: physical PG16 verification of the byte-pinned D21 intent schema.
set -euo pipefail
test "$GITHUB_ACTIONS" = true && test "$GITHUB_REPOSITORY" = SoullabTech/Sovereign &&
test "$RUNNER_ENVIRONMENT" = github-hosted && test "$RUNNER_OS" = Linux ||
  { echo D22_REFUSE_NON_HOSTED >&2; exit 90; }
test -z "$(printenv DOCKER_HOST || :)" && test -z "$(printenv DOCKER_CONTEXT || :)" &&
test "$(docker context show)" = default || { echo D22_REFUSE_NONLOCAL_DOCKER >&2; exit 90; }
cd "$(dirname "$0")/../.."
fixture=scripts/qualification/fixtures/D21_SOURCE_V2_INTENT_REVIEW.sql
printf '%s  %s\n' e81b5a16f57d508376d4ac5c248541a2820645876a819f7f1f54edf0c52a005c "$fixture" |
  sha256sum -c - >/dev/null || { echo D22_PIN_REFUSED >&2; exit 91; }
pg=d22_source_v2_$GITHUB_RUN_ID
cleanup(){ docker rm -f "$pg" >/dev/null 2>&1 || :; }
trap cleanup EXIT
fail(){ echo "D22_FAIL $*" >&2; exit 92; }
docker run -d --name "$pg" --network none --memory 512m --cpus 1   -e POSTGRES_DB=d22 -e POSTGRES_USER=d22 -e POSTGRES_PASSWORD=D22_SYNTHETIC_ONLY   postgres:16-alpine >/dev/null
ready=0
for i in $(seq 1 50); do
  if docker exec "$pg" psql -X -qAt -v ON_ERROR_STOP=1 -U d22 -d d22 -c "SELECT 1" >/dev/null 2>&1; then ready=1; break; fi
  sleep 1
done
test "$ready" = 1 || fail pg16_not_ready
sql(){ docker exec "$pg" psql -X -qAt -v ON_ERROR_STOP=1 -U d22 -d d22 -c "$1"; }
expect_count(){ local label="$1" statement="$2" expected="$3" got; got="$(sql "$statement")" || fail "$label SQL"; test "$got" = "$expected" || fail "$label got=$got expected=$expected"; echo "D22_PASS $label"; }
refuse(){ local label="$1" statement="$2"; if sql "$statement" >/dev/null 2>&1; then fail "$label unexpectedly accepted"; fi; echo "D22_PASS $label refused"; }
id(){ printf '00000000-0000-4000-8000-%012d' "$1"; }
sql "CREATE TABLE members(id uuid PRIMARY KEY); INSERT INTO members VALUES ('$(id 1)'),('$(id 2)'),('$(id 3)'),('$(id 4)')" >/dev/null
docker exec -i "$pg" psql -X -q -v ON_ERROR_STOP=1 -U d22 -d d22 < "$fixture" >/dev/null
# Pin and physically apply the THREE EXACT canonical Writer schema migrations
# as read on the protected f70 Mac, without editing any application schema.
# We are testing D21B's unqualified pending receipt against ACTUAL structures.
canonical_files=(
  database/migrations/20260721000003_press_manuscript_room.sql
  database/migrations/20260727000001_manuscript_working_drafts.sql
  database/migrations/20260801000001_living_works.sql
)
canonical_blobs=(
  84500afd80da26f9421f7a0360efe5003d98aaa8
  2e75701ed8c7eb6f180cca10884577d75ffa418e
  4edec442909dcc51d59ee2c8f32f15be1dcceff4
)
for index in 0 1 2; do
  f="${canonical_files[$index]}"
  test "$(git hash-object "$f")" = "${canonical_blobs[$index]}" ||
    fail "unapproved canonical schema bytes for $f"
  docker exec -i "$pg" psql -X -q -v ON_ERROR_STOP=1 -U d22 -d d22 < "$f" >/dev/null ||
    fail "canonical migration failed: $f"
done
echo D22_PASS_three_canonical_migrations_exact_source
v="$(sql 'SHOW server_version_num')"; test "$v" -ge 160000 && test "$v" -lt 170000 || fail not_pg16
expect_count 'three_d21_metadata_tables' "SELECT count(*) FROM pg_tables WHERE tablename LIKE 'writer_source_v2_%'" 3
ins(){
  local n="$1" work="$(id $((100+$1)))" extra="$2"
  test -z "$extra" || work="$extra"
  printf "INSERT INTO writer_source_v2_import_intents (arrival_id,member_id,gesture_id,living_work_id,work_decision,declaration_epoch,manuscript_id,object_id,key_id,generation,expected_original_bytes,expected_original_sha256,author_action_sha256,intent_receipt_sha256,reservation_sha256) VALUES ('%s','%s','%s','%s','add_existing',1,'%s','%s','%s',1,22447594,repeat('a',64),repeat('b',64),repeat('c',64),repeat('d',64))"   "$(id $((300+n)))" "$(id "$n")" "$(id $((400+n)))" "$work" "$(id $((200+n)))" "$(id $((500+n)))" "$(id $((600+n)))"
}
sql "$(ins 1 '')" >/dev/null
expect_count first_intention_one_row "SELECT count(*) FROM writer_source_v2_import_intents" 1
expect_count exact_gesture_replay_returns_no_new_row "$(ins 1 '') ON CONFLICT (member_id,gesture_id) DO NOTHING RETURNING arrival_id" ''
expect_count exact_replay_preserves_one_row "SELECT count(*) FROM writer_source_v2_import_intents" 1
sql "$(ins 1 "$(id 999)") ON CONFLICT (member_id,gesture_id) DO NOTHING" >/dev/null
expect_count changed_Work_cannot_rebind "SELECT living_work_id FROM writer_source_v2_import_intents WHERE member_id='$(id 1)'" "$(id 101)"
sql "$(ins 2 '')" >/dev/null
expect_count identical_file_hash_separate_objects 'SELECT count(DISTINCT object_id) FROM writer_source_v2_import_intents' 2
expect_count identical_file_hash_one_digest 'SELECT count(DISTINCT expected_original_sha256) FROM writer_source_v2_import_intents' 1
# Both foreign uniqueness and chunk constraints are enforced by REAL PostgreSQL.
refuse wrong_chunk_count "INSERT INTO writer_source_v2_completed_originals (arrival_id,object_id,original_sha256,manifest_sha256,total_plaintext_bytes,chunk_count,immutable_version_id,external_snapshot_witness_sha256) VALUES ('$(id 301)','$(id 501)',repeat('a',64),repeat('b',64),22447594,5,'immutable-version-v1',repeat('c',64))"
refuse foreign_object_reference "INSERT INTO writer_source_v2_completed_originals (arrival_id,object_id,original_sha256,manifest_sha256,total_plaintext_bytes,chunk_count,immutable_version_id,external_snapshot_witness_sha256) VALUES ('$(id 301)','$(id 502)',repeat('a',64),repeat('b',64),22447594,6,'immutable-version-v1',repeat('c',64))"
sql "INSERT INTO writer_source_v2_completed_originals (arrival_id,object_id,original_sha256,manifest_sha256,total_plaintext_bytes,chunk_count,immutable_version_id,external_snapshot_witness_sha256) VALUES ('$(id 301)','$(id 501)',repeat('a',64),repeat('b',64),22447594,6,'immutable-version-v1',repeat('c',64))" >/dev/null
expect_count verified_size_requires_six_chunks 'SELECT chunk_count FROM writer_source_v2_completed_originals' 6
refuse immutable_reservation "UPDATE writer_source_v2_import_intents SET generation=2 WHERE arrival_id='$(id 301)'"
refuse immutable_original "UPDATE writer_source_v2_completed_originals SET chunk_count=7 WHERE arrival_id='$(id 301)'"
sql "INSERT INTO writer_source_v2_pending_publications (arrival_id,member_id,living_work_id,manuscript_id,declaration_id,first_revision_id,section_count,figure_reference_count,confirmed_cuts_sha256,figure_anchors_sha256,encrypted_derived_text_sha256,local_publication_receipt_sha256) VALUES ('$(id 301)','$(id 1)','$(id 101)','$(id 201)','$(id 701)','$(id 801)',13,8,repeat('1',64),repeat('2',64),repeat('3',64),repeat('4',64))" >/dev/null
expect_count local_13_part_8_figure_metadata 'SELECT section_count::text || chr(44) || figure_reference_count::text FROM writer_source_v2_pending_publications' '13,8'
echo 'D22_EXPECTED_UNSAFE: pending publication accepted invented declaration/revision IDs; no real Work+revision publisher or independent R20 attestation'
refuse immutable_pending_receipt "UPDATE writer_source_v2_pending_publications SET section_count=14 WHERE arrival_id='$(id 301)'"
refuse abort_rolls_back_transaction "BEGIN; $(ins 4 ''); SELECT 1/0; COMMIT;"
expect_count incomplete_transaction_left_no_intent "SELECT count(*) FROM writer_source_v2_import_intents WHERE member_id='$(id 4)'" 0
q1="BEGIN; $(ins 3 '') ON CONFLICT (member_id,gesture_id) DO NOTHING; SELECT pg_sleep(1); COMMIT;"
q2="$(ins 3 '') ON CONFLICT (member_id,gesture_id) DO NOTHING"
docker exec "$pg" psql -X -q -v ON_ERROR_STOP=1 -U d22 -d d22 -c "$q1" >/dev/null & p1=$!
sleep .15
docker exec "$pg" psql -X -q -v ON_ERROR_STOP=1 -U d22 -d d22 -c "$q2" >/dev/null & p2=$!
wait "$p1" && wait "$p2" || fail concurrent_write_failed
expect_count concurrent_same_gesture_single_row "SELECT count(*) FROM writer_source_v2_import_intents WHERE member_id='$(id 3)'" 1
# Physical five-entity join negative on the SAME UNCHANGED D21B schema.
# The first pending publication was inserted while canonical tables existed,
# but before any of its declared Work/manuscript/declaration/revision rows.
expect_count "pending_can_reference_no_actual_manuscript" "SELECT count(*) FROM writer_source_v2_pending_publications p LEFT JOIN member_manuscripts m ON m.id=p.manuscript_id WHERE m.id IS NULL" 1
expect_count "pending_can_reference_no_actual_declaration" "SELECT count(*) FROM writer_source_v2_pending_publications p LEFT JOIN living_work_expressions e ON e.id=p.declaration_id WHERE e.id IS NULL" 1
expect_count "pending_can_reference_no_actual_revision" "SELECT count(*) FROM writer_source_v2_pending_publications p LEFT JOIN working_draft_revisions r ON r.id=p.first_revision_id WHERE r.id IS NULL" 1

# Add real fictional rows for authors 1 and 2, then deliberately make the
# existing author-1 local pending receipt point at author-2's valid declaration
# and revision. A different author-2 receipt is a positive context-join control.
sql "INSERT INTO living_works(id,member_id,title) VALUES ('$(id 101)','$(id 1)','Invented Work A'),('$(id 102)','$(id 2)','Invented Work B'); INSERT INTO member_manuscripts(id,member_id,title) VALUES ('$(id 201)','$(id 1)','Invented M A'),('$(id 202)','$(id 2)','Invented M B')" >/dev/null
sql "INSERT INTO living_work_expressions(id,living_work_id,expression_type,expression_id,declared_by) VALUES ('$(id 701)','$(id 102)','manuscript','$(id 202)','$(id 2)')" >/dev/null
sql "INSERT INTO manuscript_working_drafts(id,manuscript_id,member_id,content,base_source_hash,revision_count) VALUES ('$(id 901)','$(id 202)','$(id 2)','Fiction B only',repeat('a',64),1)" >/dev/null
sql "INSERT INTO working_draft_revisions(id,draft_id,revision_number,content,saved_by,note) VALUES ('$(id 801)','$(id 901)',1,'Fiction B only','$(id 2)','Invented baseline')" >/dev/null
expect_count "author1_receipt_can_point_to_author2_declaration" "SELECT count(*) FROM writer_source_v2_pending_publications p JOIN living_work_expressions e ON e.id=p.declaration_id WHERE e.declared_by <> p.member_id" 1
expect_count "author1_receipt_can_point_to_author2_revision" "SELECT count(*) FROM writer_source_v2_pending_publications p JOIN working_draft_revisions r ON r.id=p.first_revision_id WHERE r.saved_by <> p.member_id" 1
sql "INSERT INTO writer_source_v2_completed_originals (arrival_id,object_id,original_sha256,manifest_sha256,total_plaintext_bytes,chunk_count,immutable_version_id,external_snapshot_witness_sha256) VALUES ('$(id 302)','$(id 502)',repeat('a',64),repeat('b',64),22447594,6,'immutable-version-B2',repeat('c',64))" >/dev/null
sql "INSERT INTO writer_source_v2_pending_publications (arrival_id,member_id,living_work_id,manuscript_id,declaration_id,first_revision_id,section_count,figure_reference_count,confirmed_cuts_sha256,figure_anchors_sha256,encrypted_derived_text_sha256,local_publication_receipt_sha256) VALUES ('$(id 302)','$(id 2)','$(id 102)','$(id 202)','$(id 701)','$(id 801)',13,8,repeat('1',64),repeat('2',64),repeat('3',64),repeat('4',64))" >/dev/null
canonical_join="FROM writer_source_v2_pending_publications p JOIN living_works w ON w.id=p.living_work_id JOIN member_manuscripts m ON m.id=p.manuscript_id JOIN living_work_expressions e ON e.id=p.declaration_id JOIN working_draft_revisions r ON r.id=p.first_revision_id JOIN manuscript_working_drafts d ON d.id=r.draft_id WHERE w.member_id=p.member_id AND m.member_id=p.member_id AND e.declared_by=p.member_id AND e.living_work_id=p.living_work_id AND e.expression_type='manuscript' AND e.expression_id=p.manuscript_id AND d.manuscript_id=p.manuscript_id AND d.member_id=p.member_id AND r.saved_by=p.member_id AND r.revision_number=1"
expect_count "matching_canonical_context_only_one_of_two" "SELECT count(*) $canonical_join" 1
expect_count "both_local_pending_rows_survive" "SELECT count(*) FROM writer_source_v2_pending_publications" 2
echo 'D22_EXPECTED_UNQUALIFIED_CANONICAL_SCOPE: author-1 pending row points to other author declaration/revision, and local receipt persists; not a certified publisher'
# Deletion is an independent custody/withdrawal operation. This shows D21B
# metadata neither proves nor prevents actual historical author content erasure.
sql "DELETE FROM member_manuscripts WHERE id='$(id 202)'" >/dev/null
expect_count "pending_metadata_survives_deleted_canonical_manuscript" "SELECT count(*) FROM writer_source_v2_pending_publications WHERE manuscript_id='$(id 202)'" 1
expect_count "no_canonical_context_still_valid_after_delete" "SELECT count(*) $canonical_join" 0
echo 'D22_EXPECTED_UNQUALIFIED_ERASURE: pending metadata survives canonical delete; independent deletion/old-image/backup policy not tested'
echo 'D22_PHYSICAL_PG16_PASS: metadata-only SQL checks; real HTTP/Work/publisher/R20/vault/restore gates remain HOLD'
