#!/usr/bin/env bash
# #846 migration gate — validate against a PRODUCTION-SHAPED database.
# Schema copied from production; ROWS ARE SYNTHETIC (no encrypted PHI duplicated).
# Scratch DB dropped at the end; residue verified.
set -uo pipefail

DB=maia_846_gate
Q(){ docker exec -i maia-postgres psql -tAX -U soullab "$DB" -c "$1" 2>&1; }

pass=0; fail=0
ok(){ echo "PASS  $1"; pass=$((pass+1)); }
no(){ echo "FAIL  $1  -- $2"; fail=$((fail+1)); }

assert_eq(){ # name expected sql
  local got; got=$(Q "$3" | tr -d '\r')
  [ "$got" = "$2" ] && ok "$1" || no "$1" "expected='$2' got='$got'"
}
assert_reject(){ # name sql   -- MUST be refused by the database
  local out rc
  out=$(Q "$2"); rc=$?
  if [ $rc -ne 0 ]; then
    ok "$1 [$(echo "$out" | grep -oE 'violates [a-z -]+constraint "[a-z_]+"' | head -1)]"
  else
    no "$1" "ACCEPTED but must be refused"
  fi
}
assert_accept(){ # name sql
  local out rc
  out=$(Q "$2"); rc=$?
  [ $rc -eq 0 ] && ok "$1" || no "$1" "$(echo "$out" | grep ERROR | head -1)"
}

echo "=== 0. build production-shaped scratch DB ==="
docker exec maia-postgres dropdb -U soullab --if-exists $DB >/dev/null 2>&1
docker exec maia-postgres createdb -U soullab $DB || { echo "FATAL createdb"; exit 2; }
docker exec maia-postgres pg_dump -U soullab --schema-only --no-owner --no-privileges maia_consciousness \
  | docker exec -i maia-postgres psql -qX -U soullab $DB >/dev/null 2>&1
echo "columns BEFORE migration: $(Q "select string_agg(column_name,',' order by ordinal_position) from information_schema.columns where table_name='practitioner_client_notes';")"

echo
echo "=== 1. seed synthetic PRE-MIGRATION rows (production shape: 3 notes, 2 scopes) ==="
SEED=$(Q "
insert into members (id, passkey, username, password_hash, name)
  values ('11111111-1111-1111-1111-111111111111','GATE846','gate846','x','Gate846');
insert into practitioners (id, name, email, slug) values
  ('22222222-2222-2222-2222-222222222222','Gate846 A','a@gate846.invalid','gate846-a'),
  ('22222222-2222-2222-2222-222222222223','Gate846 B','b@gate846.invalid','gate846-b');
insert into practitioner_clients (id, practitioner_id, name, email) values
  ('33333333-3333-3333-3333-333333333333','22222222-2222-2222-2222-222222222222','Client A','ca@gate846.invalid'),
  ('33333333-3333-3333-3333-333333333334','22222222-2222-2222-2222-222222222223','Client B','cb@gate846.invalid');
insert into practitioner_client_notes (id, client_id, practitioner_id, content_enc, content_enc_meta, note_date) values
  ('44444444-4444-4444-4444-444444444441','33333333-3333-3333-3333-333333333333','22222222-2222-2222-2222-222222222222','SYNTHETIC','{}','2026-07-01'),
  ('44444444-4444-4444-4444-444444444442','33333333-3333-3333-3333-333333333333','22222222-2222-2222-2222-222222222222','SYNTHETIC','{}','2026-07-15'),
  ('44444444-4444-4444-4444-444444444443','33333333-3333-3333-3333-333333333334','22222222-2222-2222-2222-222222222223','SYNTHETIC','{}','2026-07-20');
")
echo "$SEED" | grep -i error | head -3
assert_eq "seeded 3 pre-migration notes across 2 practitioner scopes" "3" "select count(*) from practitioner_client_notes;"

echo
echo "=== 2. apply the migration ==="
docker exec -i maia-postgres psql -v ON_ERROR_STOP=1 -qX -U soullab $DB < /tmp/846.sql >/dev/null 2>&1 \
  && ok "migration applied cleanly" || no "migration applied cleanly" "psql nonzero"

echo
echo "=== 3. schema after migration ==="
assert_eq "kind: TEXT NOT NULL DEFAULT 'note'" "text|NO|'note'::text" \
  "select data_type||'|'||is_nullable||'|'||column_default from information_schema.columns where table_name='practitioner_client_notes' and column_name='kind';"
assert_eq "status: nullable text" "text|YES" \
  "select data_type||'|'||is_nullable from information_schema.columns where table_name='practitioner_client_notes' and column_name='status';"
assert_eq "promoted_from: nullable uuid" "uuid|YES" \
  "select data_type||'|'||is_nullable from information_schema.columns where table_name='practitioner_client_notes' and column_name='promoted_from';"
assert_eq "all 4 constraints present" "4" \
  "select count(*) from pg_constraint where conrelid='practitioner_client_notes'::regclass and conname in ('practitioner_client_notes_kind_check','practitioner_client_notes_status_check','practitioner_client_notes_scope_key','practitioner_client_notes_promoted_from_fkey');"
assert_eq "all 3 partial indexes present" "3" \
  "select count(*) from pg_indexes where tablename='practitioner_client_notes' and indexname in ('idx_pcn_commitments_live','idx_pcn_recognitions','idx_pcn_details');"

echo
echo "=== 4. PRE-MIGRATION NOTES REMAIN ORDINARY NOTES (the backfill) ==="
assert_eq "all 3 legacy rows backfilled kind='note'" "3" "select count(*) from practitioner_client_notes where kind='note';"
assert_eq "no legacy row acquired a status" "0" "select count(*) from practitioner_client_notes where status is not null;"
assert_eq "no legacy row acquired provenance" "0" "select count(*) from practitioner_client_notes where promoted_from is not null;"

echo
echo "=== 5. IDEMPOTENCY — apply a second time ==="
docker exec -i maia-postgres psql -v ON_ERROR_STOP=1 -qX -U soullab $DB < /tmp/846.sql >/dev/null 2>&1 \
  && ok "migration is re-runnable (idempotent)" || no "migration is re-runnable" "second run failed"
assert_eq "still exactly 4 constraints after re-run" "4" \
  "select count(*) from pg_constraint where conrelid='practitioner_client_notes'::regclass and conname in ('practitioner_client_notes_kind_check','practitioner_client_notes_status_check','practitioner_client_notes_scope_key','practitioner_client_notes_promoted_from_fkey');"
assert_eq "legacy rows untouched by the re-run" "3" "select count(*) from practitioner_client_notes where kind='note';"

echo
echo "=== 6. CONSTRAINT SEMANTICS ==="
A=33333333-3333-3333-3333-333333333333; PA=22222222-2222-2222-2222-222222222222
ins(){ echo "insert into practitioner_client_notes (id, client_id, practitioner_id, content_enc, content_enc_meta, note_date, kind, status, promoted_from) values ('$1','$A','$PA','S','{}','2026-08-01','$2',$3,$4);"; }
assert_reject "unknown kind 'arrival' is refused"                    "$(ins 44444444-0000-0000-0000-000000000001 arrival null null)"
assert_reject "COMMITMENT WITHOUT STATUS is refused"                 "$(ins 44444444-0000-0000-0000-000000000002 commitment null null)"
assert_reject "commitment with bogus status 'pending' is refused"    "$(ins 44444444-0000-0000-0000-000000000003 commitment "'pending'" null)"
assert_reject "non-commitment carrying a status is refused"          "$(ins 44444444-0000-0000-0000-000000000004 recognition "'alive'" null)"
assert_accept "commitment with status 'alive' is accepted"           "$(ins 44444444-0000-0000-0000-000000000005 commitment "'alive'" null)"
assert_accept "recognition with NULL status is accepted"             "$(ins 44444444-0000-0000-0000-000000000006 recognition null null)"
assert_accept "detail with NULL status is accepted"                  "$(ins 44444444-0000-0000-0000-000000000007 detail null null)"

echo
echo "=== 7. CROSS-SCOPE PROMOTION FAILS PLAINLY ==="
assert_accept "same-scope promotion is accepted" "$(ins 44444444-0000-0000-0000-000000000008 commitment "'alive'" "'44444444-4444-4444-4444-444444444441'")"
assert_reject "promotion from ANOTHER practitioner's client is refused" "$(ins 44444444-0000-0000-0000-000000000009 commitment "'alive'" "'44444444-4444-4444-4444-444444444443'")"
assert_reject "promotion from a nonexistent note is refused" "$(ins 44444444-0000-0000-0000-00000000000a commitment "'alive'" "'44444444-dead-dead-dead-44444444dead'")"

echo
echo "=== 8. THE SOURCE IS LEFT UNCHANGED by promotion ==="
assert_eq "source note still kind='note'" "note" "select kind from practitioner_client_notes where id='44444444-4444-4444-4444-444444444441';"
assert_eq "source note still has no status" "0" "select count(*) from practitioner_client_notes where id='44444444-4444-4444-4444-444444444441' and status is not null;"
assert_eq "source note still has no provenance of its own" "0" "select count(*) from practitioner_client_notes where id='44444444-4444-4444-4444-444444444441' and promoted_from is not null;"

echo
echo "=== 9. ON DELETE SET NULL — deleting a source does not delete the promoted item ==="
Q "delete from practitioner_client_notes where id='44444444-4444-4444-4444-444444444441';" >/dev/null
assert_eq "promoted item SURVIVES source deletion" "1" "select count(*) from practitioner_client_notes where id='44444444-0000-0000-0000-000000000008';"
assert_eq "its provenance is nulled, not dangling" "1" "select count(*) from practitioner_client_notes where id='44444444-0000-0000-0000-000000000008' and promoted_from is null;"

echo
echo "=== 10. ROLLBACK — reversible as schema ==="
Q "
alter table practitioner_client_notes drop constraint if exists practitioner_client_notes_promoted_from_fkey;
alter table practitioner_client_notes drop constraint if exists practitioner_client_notes_scope_key;
alter table practitioner_client_notes drop constraint if exists practitioner_client_notes_status_check;
alter table practitioner_client_notes drop constraint if exists practitioner_client_notes_kind_check;
drop index if exists idx_pcn_commitments_live;
drop index if exists idx_pcn_recognitions;
drop index if exists idx_pcn_details;
alter table practitioner_client_notes drop column if exists promoted_from;
alter table practitioner_client_notes drop column if exists status;
alter table practitioner_client_notes drop column if exists kind;
" >/dev/null && ok "rollback statements execute cleanly" || no "rollback" "failed"
assert_eq "schema back to the exact production 8 columns" "id,client_id,practitioner_id,content_enc,content_enc_meta,note_date,created_at,updated_at" \
  "select string_agg(column_name,',' order by ordinal_position) from information_schema.columns where table_name='practitioner_client_notes';"

echo
echo "=== 11. RESIDUE ==="
docker exec maia-postgres dropdb -U soullab --if-exists $DB >/dev/null 2>&1
left=$(docker exec maia-postgres psql -tAX -U soullab postgres -c "select count(*) from pg_database where datname='$DB';" | tr -d '\r')
[ "$left" = "0" ] && ok "scratch database removed (residue 0)" || no "scratch database removed" "still present"
prod=$(docker exec maia-postgres psql -tAX -U soullab maia_consciousness -c "select string_agg(column_name,',' order by ordinal_position) from information_schema.columns where table_name='practitioner_client_notes';" | tr -d '\r')
[ "$prod" = "id,client_id,practitioner_id,content_enc,content_enc_meta,note_date,created_at,updated_at" ] \
  && ok "PRODUCTION schema untouched by this gate" || no "PRODUCTION schema untouched" "got '$prod'"

echo
echo "SUMMARY  $pass passed / $fail failed"
[ $fail -eq 0 ] || exit 1
