#!/usr/bin/env bash
# House Source Admissibility — migration (§8) + gate semantics (§9) proof
# Read-only w.r.t. production. Operates on a disposable local DB.
set -uo pipefail
WT=/Users/soullab/MAIA-SOVEREIGN-worktrees/house-admissibility
DB=maia_hsa_proof_$$
MIG=$WT/database/migrations/20260812000001_house_source_admissibility.sql
PASS=0; FAIL=0
ok(){ echo "  PASS  $1"; PASS=$((PASS+1)); }
no(){ echo "  FAIL  $1"; FAIL=$((FAIL+1)); }
# expect_fail: SQL must be REJECTED
ef(){ if psql -q -U soullab -d $DB -v ON_ERROR_STOP=1 -c "$2" >/dev/null 2>&1; then no "$1 (was ACCEPTED — should be rejected)"; else ok "$1"; fi; }
# expect_ok: SQL must succeed
eo(){ if psql -q -U soullab -d $DB -v ON_ERROR_STOP=1 -c "$2" >/dev/null 2>&1; then ok "$1"; else no "$1"; fi; }
# expect_val: scalar query equals expected
ev(){ local got; got=$(psql -tA -U soullab -d $DB -c "$3" 2>&1 | tr -d '[:space:]'); if [ "$got" = "$2" ]; then ok "$1 (=$got)"; else no "$1 (expected $2, got '$got')"; fi; }

createdb -U soullab $DB 2>/dev/null
psql -q -U soullab -d $DB -c 'CREATE EXTENSION IF NOT EXISTS pgcrypto;' >/dev/null 2>&1

echo "=== §8.1 PREREQ GUARD (no library_sources.checksum yet) ==="
if psql -q -U soullab -d $DB -v ON_ERROR_STOP=1 -f "$MIG" >/dev/null 2>&1; then
  no "prereq guard refuses to run without library_sources.checksum"
else
  ok "prereq guard refuses to run without library_sources.checksum"
fi

echo "=== build genuine prerequisites (members, library_sources) ==="
psql -q -U soullab -d $DB -v ON_ERROR_STOP=1 <<'SQL' >/dev/null 2>&1
CREATE TABLE members (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT);
CREATE TABLE library_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT, author TEXT, type TEXT, file_path TEXT,
  checksum TEXT,
  ingestion_status TEXT DEFAULT 'completed',
  identity_valid BOOLEAN,
  review_status TEXT DEFAULT 'uploaded',
  practitioner_member_id UUID,
  vault_file_id UUID,
  field_slug TEXT
);
CREATE TABLE library_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES library_sources(id),
  content TEXT, chunk_index INT, meta JSONB DEFAULT '{}'::jsonb
);
SQL
echo "  (prereq schema built: members, library_sources w/ checksum + ownership cols, library_chunks)"

echo "=== §8.2 APPLY MIGRATION ==="
if psql -q -U soullab -d $DB -v ON_ERROR_STOP=1 -f "$MIG" >/dev/null 2>&1; then ok "migration applies"; else no "migration applies"; fi
echo "=== §8.3 RE-APPLY (idempotency) ==="
if psql -q -U soullab -d $DB -v ON_ERROR_STOP=1 -f "$MIG" >/dev/null 2>&1; then ok "migration re-applies safely"; else no "migration re-applies safely"; fi

echo "=== §8.4 REQUIRED INDEXES ==="
ev "gate partial index present" "1" "SELECT count(*) FROM pg_indexes WHERE indexname='idx_library_source_admissions_gate';"
ev "source_scope index present" "1" "SELECT count(*) FROM pg_indexes WHERE indexname='idx_library_source_admissions_source_scope';"
ev "gate index is partial on admitted" "1" "SELECT count(*) FROM pg_indexes WHERE indexname='idx_library_source_admissions_gate' AND indexdef LIKE '%admitted%';"

echo "=== §8.5 CHECK CONSTRAINTS PRESENT ==="
ev "admitted_requires_actor constraint" "1" "SELECT count(*) FROM pg_constraint WHERE conname='library_source_admissions_admitted_requires_actor';"
ev "unique(source_id,scope,version)" "1" "SELECT count(*) FROM pg_constraint WHERE conrelid='library_source_admissions'::regclass AND contype='u';"
ev "check constraints >= 5" "t" "SELECT (count(*)>=5) FROM pg_constraint WHERE conrelid='library_source_admissions'::regclass AND contype='c';"

echo "=== seed fixtures ==="
psql -q -U soullab -d $DB -v ON_ERROR_STOP=1 <<'SQL' >/dev/null 2>&1
INSERT INTO members (id,name) VALUES ('11111111-1111-1111-1111-111111111111','founder');
-- HOUSE-OWNED source (platform)
INSERT INTO library_sources (id,title,type,checksum,ingestion_status,practitioner_member_id,vault_file_id,field_slug)
  VALUES ('aaaaaaaa-0000-0000-0000-000000000001','House Book','book','CHK-HOUSE-V1','completed',NULL,NULL,NULL);
INSERT INTO library_chunks (source_id,content,chunk_index) VALUES ('aaaaaaaa-0000-0000-0000-000000000001','house wisdom text',0);
-- PRACTITIONER-OWNED source (non-platform)
INSERT INTO library_sources (id,title,type,checksum,ingestion_status,practitioner_member_id)
  VALUES ('bbbbbbbb-0000-0000-0000-000000000002','Practitioner Private','book','CHK-PRAC-V1','completed','11111111-1111-1111-1111-111111111111');
INSERT INTO library_chunks (source_id,content,chunk_index) VALUES ('bbbbbbbb-0000-0000-0000-000000000002','practitioner private text',0);
-- VAULT-BACKED source (non-platform)
INSERT INTO library_sources (id,title,type,checksum,ingestion_status,vault_file_id)
  VALUES ('cccccccc-0000-0000-0000-000000000003','Vault Doc','book','CHK-VAULT-V1','completed','11111111-1111-1111-1111-111111111111');
INSERT INTO library_chunks (source_id,content,chunk_index) VALUES ('cccccccc-0000-0000-0000-000000000003','vault text',0);
-- FIELD-SCOPED source (non-platform)
INSERT INTO library_sources (id,title,type,checksum,ingestion_status,field_slug)
  VALUES ('dddddddd-0000-0000-0000-000000000004','Field Doc','book','CHK-FIELD-V1','completed','some-field');
INSERT INTO library_chunks (source_id,content,chunk_index) VALUES ('dddddddd-0000-0000-0000-000000000004','field text',0);
SQL

echo "=== §8.6 ADMITTED ROW REQUIRES ACTOR ==="
ef "admitted without admitted_by/admitted_at is REJECTED" \
  "INSERT INTO library_source_admissions (source_id,source_checksum,admissibility_state,admission_basis,version) VALUES ('aaaaaaaa-0000-0000-0000-000000000001','CHK-HOUSE-V1','admitted','founder ruling',1);"

echo "=== §8.7 NON-EMPTY ADMISSION BASIS ==="
ef "empty admission_basis is REJECTED" \
  "INSERT INTO library_source_admissions (source_id,source_checksum,admissibility_state,admission_basis,version) VALUES ('aaaaaaaa-0000-0000-0000-000000000001','CHK-HOUSE-V1','excluded','   ',1);"

echo "=== §8.8 VALID ADMISSION (house source, v1) ==="
eo "valid admitted row accepted" \
  "INSERT INTO library_source_admissions (source_id,source_checksum,admissibility_state,admitted_by,admitted_at,admission_basis,admitted_title,version) VALUES ('aaaaaaaa-0000-0000-0000-000000000001','CHK-HOUSE-V1','admitted','11111111-1111-1111-1111-111111111111',NOW(),'founder ruling 2026-08-11','House Book (admitted title)',1);"

echo "=== §8.9 UNIQUE / VERSION SEMANTICS ==="
ef "duplicate (source_id,scope,version) is REJECTED" \
  "INSERT INTO library_source_admissions (source_id,source_checksum,admissibility_state,admitted_by,admitted_at,admission_basis,version) VALUES ('aaaaaaaa-0000-0000-0000-000000000001','CHK-HOUSE-V1','admitted','11111111-1111-1111-1111-111111111111',NOW(),'dup',1);"
ef "version 0 is REJECTED" \
  "INSERT INTO library_source_admissions (source_id,source_checksum,admissibility_state,admission_basis,version) VALUES ('aaaaaaaa-0000-0000-0000-000000000001','CHK-HOUSE-V1','excluded','v0',0);"
ef "unknown scope is REJECTED" \
  "INSERT INTO library_source_admissions (source_id,source_checksum,admissibility_state,admission_basis,scope,version) VALUES ('aaaaaaaa-0000-0000-0000-000000000001','CHK-HOUSE-V1','excluded','bad scope','other_scope',9);"
ef "unknown admissibility_state is REJECTED" \
  "INSERT INTO library_source_admissions (source_id,source_checksum,admissibility_state,admission_basis,version) VALUES ('aaaaaaaa-0000-0000-0000-000000000001','CHK-HOUSE-V1','ratified','bad state',9);"
ef "unknown use_constraint is REJECTED" \
  "INSERT INTO library_source_admissions (source_id,source_checksum,admissibility_state,admission_basis,use_constraint,version) VALUES ('aaaaaaaa-0000-0000-0000-000000000001','CHK-HOUSE-V1','excluded','bad uc','full_reproduction',9);"

echo "=== §8.10 FK BEHAVIOUR (ON DELETE RESTRICT) ==="
ef "deleting a source with admission history is REJECTED" \
  "DELETE FROM library_sources WHERE id='aaaaaaaa-0000-0000-0000-000000000001';"

# ---- the read gate, exactly as lib/library/admissibility.ts::admissionGateJoin + PLATFORM_ONLY_PREDICATE ----
GATE_SQL="SELECT count(*) FROM library_chunks c
 JOIN library_sources s ON c.source_id = s.id
 JOIN library_source_admissions a
   ON a.source_id = s.id
  AND a.source_checksum = s.checksum
  AND a.admissibility_state = 'admitted'
  AND a.scope = 'member_wisdom_retrieval'
  AND a.version = (SELECT MAX(a2.version) FROM library_source_admissions a2 WHERE a2.source_id = s.id AND a2.scope = a.scope)
 WHERE s.ingestion_status='completed'
   AND s.identity_valid IS DISTINCT FROM false
   AND s.practitioner_member_id IS NULL
   AND s.vault_file_id IS NULL
   AND s.field_slug IS NULL"

echo "=== §9.A ADMITTED HOUSE SOURCE IS RETRIEVABLE ==="
ev "A: admitted house source visible through gate" "1" "$GATE_SQL;"

echo "=== §9.B UNREVIEWED FAILS CLOSED ==="
ev "B: source with no admission row is NOT retrievable" "0" "$GATE_SQL AND s.id='bbbbbbbb-0000-0000-0000-000000000002';"

echo "=== §9.C APPEND-ONLY SUPERSESSION ==="
eo "C: append v2 'excluded' (no UPDATE/DELETE)" \
  "INSERT INTO library_source_admissions (source_id,source_checksum,admissibility_state,admission_basis,version) VALUES ('aaaaaaaa-0000-0000-0000-000000000001','CHK-HOUSE-V1','excluded','reversed on review',2);"
ev "C: later exclusion supersedes earlier admission" "0" "$GATE_SQL;"
ev "C: v1 admission row still permanently legible" "1" "SELECT count(*) FROM library_source_admissions WHERE source_id='aaaaaaaa-0000-0000-0000-000000000001' AND version=1 AND admissibility_state='admitted';"
eo "C: re-admit as v3" \
  "INSERT INTO library_source_admissions (source_id,source_checksum,admissibility_state,admitted_by,admitted_at,admission_basis,version) VALUES ('aaaaaaaa-0000-0000-0000-000000000001','CHK-HOUSE-V1','admitted','11111111-1111-1111-1111-111111111111',NOW(),'re-admitted',3);"
ev "C: highest version governs (retrievable again)" "1" "$GATE_SQL;"

echo "=== §9.D CHECKSUM INVALIDATION ==="
eo "D: source content changes (checksum v1 -> v2)" \
  "UPDATE library_sources SET checksum='CHK-HOUSE-V2' WHERE id='aaaaaaaa-0000-0000-0000-000000000001';"
ev "D: prior admission goes inert automatically" "0" "$GATE_SQL;"
eo "D: restore checksum" "UPDATE library_sources SET checksum='CHK-HOUSE-V1' WHERE id='aaaaaaaa-0000-0000-0000-000000000001';"
ev "D: retrievable again at admitted version" "1" "$GATE_SQL;"

echo "=== §9.E SCOPE SPECIFICITY ==="
ev "E: admission does not leak to a different scope" "0" \
  "${GATE_SQL/member_wisdom_retrieval/some_other_scope};"

echo "=== §9.F OWNERSHIP BEATS ADMISSION  (deliberately admitted, non-platform-owned) ==="
eo "F: deliberately admit the PRACTITIONER-owned source" \
  "INSERT INTO library_source_admissions (source_id,source_checksum,admissibility_state,admitted_by,admitted_at,admission_basis,version) VALUES ('bbbbbbbb-0000-0000-0000-000000000002','CHK-PRAC-V1','admitted','11111111-1111-1111-1111-111111111111',NOW(),'deliberate test admission',1);"
eo "F: deliberately admit the VAULT-backed source" \
  "INSERT INTO library_source_admissions (source_id,source_checksum,admissibility_state,admitted_by,admitted_at,admission_basis,version) VALUES ('cccccccc-0000-0000-0000-000000000003','CHK-VAULT-V1','admitted','11111111-1111-1111-1111-111111111111',NOW(),'deliberate test admission',1);"
eo "F: deliberately admit the FIELD-scoped source" \
  "INSERT INTO library_source_admissions (source_id,source_checksum,admissibility_state,admitted_by,admitted_at,admission_basis,version) VALUES ('dddddddd-0000-0000-0000-000000000004','CHK-FIELD-V1','admitted','11111111-1111-1111-1111-111111111111',NOW(),'deliberate test admission',1);"
ev "F: ADMITTED practitioner-owned source STILL EXCLUDED" "0" "$GATE_SQL AND s.id='bbbbbbbb-0000-0000-0000-000000000002';"
ev "F: ADMITTED vault-backed source STILL EXCLUDED" "0" "$GATE_SQL AND s.id='cccccccc-0000-0000-0000-000000000003';"
ev "F: ADMITTED field-scoped source STILL EXCLUDED" "0" "$GATE_SQL AND s.id='dddddddd-0000-0000-0000-000000000004';"
ev "F: total gate results = house source only" "1" "$GATE_SQL;"

echo "=== §9.G OWNERSHIP-CHANGE INVALIDATION ==="
eo "G: house source becomes practitioner-owned" \
  "UPDATE library_sources SET practitioner_member_id='11111111-1111-1111-1111-111111111111' WHERE id='aaaaaaaa-0000-0000-0000-000000000001';"
ev "G: previously-admitted source now EXCLUDED by ownership" "0" "$GATE_SQL;"
eo "G: revert ownership" "UPDATE library_sources SET practitioner_member_id=NULL WHERE id='aaaaaaaa-0000-0000-0000-000000000001';"
ev "G: retrievable again" "1" "$GATE_SQL;"

echo "=== §9.H UNRESTRICTED PATH search() UNCHANGED (no ownership bypass) ==="
ev "H: unrestricted search() still ownership-bounded" "1" \
  "SELECT count(DISTINCT s.id) FROM library_chunks c JOIN library_sources s ON c.source_id=s.id WHERE s.ingestion_status='completed' AND s.identity_valid IS DISTINCT FROM false AND s.practitioner_member_id IS NULL AND s.vault_file_id IS NULL AND s.field_slug IS NULL;"

echo
echo "==================== RESULT ===================="
echo "PASS=$PASS  FAIL=$FAIL"
[ "$FAIL" -eq 0 ] && echo "VERDICT: ALL MIGRATION + GATE PROOFS PASS" || echo "VERDICT: FAILURES PRESENT"
dropdb -U soullab $DB 2>/dev/null
echo "(disposable db $DB dropped)"
