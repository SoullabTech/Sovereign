#!/usr/bin/env bash
# PRACTITIONER-OFFER-01 · A3-R2-R1 — RB-24 database lifecycle witness.
#
# Builds a schema-only, disposable clone; seeds labelled synthetic contradictions;
# applies NOT VALID guards; proves new mismatches are refused; proves validation
# stops on the frozen ledger; repairs only exact fixture IDs; then validates.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SOURCE_DB="${A3_R2_R1_SOURCE_DB:-maia_consciousness}"
GATE_DB="${A3_R2_R1_GATE_DB:-maia_a3_r2_r1_gate}"
PGHOST_VALUE="${PGHOST:-127.0.0.1}"
PGPORT_VALUE="${PGPORT:-5432}"
PGUSER_VALUE="${PGUSER:-soullab}"
PSQL_BIN="${PSQL_BIN:-psql}"
PG_DUMP_BIN="${PG_DUMP_BIN:-pg_dump}"
CREATEDB_BIN="${CREATEDB_BIN:-createdb}"
DROPDB_BIN="${DROPDB_BIN:-dropdb}"
KEEP_DB="${A3_R2_R1_KEEP_DB:-0}"

case "$GATE_DB" in
  maia_a3_r2_r1_gate|*_a3_r2_r1_test) ;;
  *) echo "REFUSED: gate database name is outside the A3-R2-R1 disposable allowlist: $GATE_DB" >&2; exit 2 ;;
esac
if [[ "$SOURCE_DB" == "$GATE_DB" ]]; then
  echo "REFUSED: source and disposable database names are identical" >&2
  exit 2
fi

PG_ARGS=(-h "$PGHOST_VALUE" -p "$PGPORT_VALUE" -U "$PGUSER_VALUE")
PREP="$REPO_ROOT/database/migrations/20260917000001_practitioner_relationship_binding_preparation.sql"
VALIDATE="$REPO_ROOT/database/migrations/20260917000002_practitioner_relationship_binding_validation.sql"
SEED="$REPO_ROOT/scripts/proof/a3-r2-r1-negative-fixtures.sql"
RECONCILE="$REPO_ROOT/scripts/proof/a3-r2-r1-reconcile-fixtures.sql"
CENSUS="$REPO_ROOT/scripts/research/a3-r2-relationship-binding-census.sql"
TMP_DIR="$(mktemp -d "${TMPDIR:-/tmp}/a3-r2-r1.XXXXXX")"

pass=0
fail=0
ok() { echo "PASS  $1"; pass=$((pass + 1)); }
no() { echo "FAIL  $1 -- $2"; fail=$((fail + 1)); }

cleanup() {
  if [[ "$KEEP_DB" != "1" ]]; then
    "$DROPDB_BIN" "${PG_ARGS[@]}" --if-exists --force "$GATE_DB" >/dev/null 2>&1 || true
  else
    echo "INFO  preserved disposable database $GATE_DB because A3_R2_R1_KEEP_DB=1"
  fi
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

q() {
  "$PSQL_BIN" "${PG_ARGS[@]}" -d "$GATE_DB" -X -qAt -v ON_ERROR_STOP=1 -c "$1"
}

assert_eq() {
  local name="$1" expected="$2" sql="$3" got
  got="$(q "$sql" | tr -d '\r')"
  if [[ "$got" == "$expected" ]]; then ok "$name"; else no "$name" "expected '$expected', got '$got'"; fi
}

assert_reject() {
  local name="$1" expected_state="$2" sql="$3" out rc
  set +e
  out="$("$PSQL_BIN" "${PG_ARGS[@]}" -d "$GATE_DB" -X -q -v ON_ERROR_STOP=1 -v VERBOSITY=verbose -c "$sql" 2>&1)"
  rc=$?
  set -e
  if [[ $rc -ne 0 ]] && grep -q "$expected_state" <<<"$out"; then
    ok "$name [$expected_state]"
  else
    no "$name" "expected SQLSTATE $expected_state; rc=$rc; ${out//$'\n'/ }"
  fi
}

assert_metric() {
  local file="$1" metric="$2" expected="$3"
  if grep -Fxq "$metric|$expected" "$file"; then
    ok "$metric = $expected"
  else
    no "$metric" "expected $expected; observed $(grep -F "$metric|" "$file" || echo missing)"
  fi
}

run_census() {
  local output="$1"
  "$PSQL_BIN" "${PG_ARGS[@]}" -d "$GATE_DB" -X -qAtF '|' -v ON_ERROR_STOP=1 -f "$CENSUS" >"$output"
}

echo "=== A3-R2-R1: create disposable production-shaped database ==="
"$DROPDB_BIN" "${PG_ARGS[@]}" --if-exists --force "$GATE_DB" >/dev/null 2>&1
"$CREATEDB_BIN" "${PG_ARGS[@]}" "$GATE_DB"
"$PG_DUMP_BIN" "${PG_ARGS[@]}" --schema-only --no-owner --no-privileges "$SOURCE_DB" \
  | "$PSQL_BIN" "${PG_ARGS[@]}" -d "$GATE_DB" -X -q -v ON_ERROR_STOP=1
assert_eq "scratch clone starts before A3-R2-R1" "0" \
  "SELECT count(*) FROM information_schema.columns WHERE table_schema='public' AND column_name='practitioner_record_id' AND table_name IN ('practitioner_sessions','scribe_sessions','session_artifacts','client_invites');"

echo "=== Seed and freeze exact pre-migration contradictions ==="
"$PSQL_BIN" "${PG_ARGS[@]}" -d "$GATE_DB" -X -q -v ON_ERROR_STOP=1 -f "$SEED"
run_census "$TMP_DIR/census-before.txt"

assert_metric "$TMP_DIR/census-before.txt" mismatch.sessions.client_wrong_practice 1
assert_metric "$TMP_DIR/census-before.txt" mismatch.sessions.service_wrong_practice 1
assert_metric "$TMP_DIR/census-before.txt" mismatch.sessions.rescheduled_from_wrong_practice 1
assert_metric "$TMP_DIR/census-before.txt" mismatch.sessions.scribe_wrong_member_or_client 1
assert_metric "$TMP_DIR/census-before.txt" mismatch.practitioner_sessions.member_client_practice_mismatch 1
assert_metric "$TMP_DIR/census-before.txt" mismatch.practitioner_sessions.studio_session_mismatch 1
assert_metric "$TMP_DIR/census-before.txt" mismatch.scribe_sessions.client_wrong_member_practice 1
assert_metric "$TMP_DIR/census-before.txt" mismatch.scribe_sessions.booking_wrong_member_or_client 1
assert_metric "$TMP_DIR/census-before.txt" mismatch.voice_notes.session_or_owner_mismatch 1
assert_metric "$TMP_DIR/census-before.txt" mismatch.session_join_tokens.client_mismatch 1
assert_metric "$TMP_DIR/census-before.txt" mismatch.session_artifacts.session_client_or_member_mismatch 1
assert_metric "$TMP_DIR/census-before.txt" mismatch.client_invites.member_client_practice_mismatch 1
assert_metric "$TMP_DIR/census-before.txt" mismatch.booking_requests.service_wrong_practice 1
assert_metric "$TMP_DIR/census-before.txt" mismatch.booking_requests.session_wrong_practice 1
assert_metric "$TMP_DIR/census-before.txt" mismatch.encounters.meeting_wrong_practice 1
assert_metric "$TMP_DIR/census-before.txt" mismatch.encounter_participants.person_wrong_team 1
assert_metric "$TMP_DIR/census-before.txt" mismatch.encounter_consent_events.participant_wrong_encounter 1

echo "=== Apply additive identity columns and NOT VALID constraints ==="
"$PSQL_BIN" "${PG_ARGS[@]}" -d "$GATE_DB" -X -q -v ON_ERROR_STOP=1 -f "$PREP"
assert_eq "all 35 relationship guards are present and unvalidated" "35|35" \
  "SELECT count(*) FILTER (WHERE NOT convalidated) || '|' || count(*) FROM pg_constraint WHERE conname LIKE 'a3r2_%' AND contype IN ('c','f');"
assert_eq "exactly 15 contradictory fixture decisions are frozen" "15" \
  "SELECT count(*) FROM relationship_binding_adjudications WHERE status='open';"
run_census "$TMP_DIR/census-after-preparation.txt"
if cmp -s "$TMP_DIR/census-before.txt" "$TMP_DIR/census-after-preparation.txt"; then
  ok "NOT VALID preparation preserved every historical contradiction"
else
  no "NOT VALID preparation preserved every historical contradiction" "census changed before reconciliation"
fi

echo "=== New bad writes are refused immediately ==="
assert_reject "RB-02 DB: session with foreign client" 23503 \
  "INSERT INTO sessions (id,practitioner_id,client_id,service_id,scheduled_start,scheduled_end,team_id) VALUES ('b3200000-0000-4000-8000-000000000001','a3100000-0000-4000-8000-000000000001','a3300000-0000-4000-8000-000000000002','a3400000-0000-4000-8000-000000000001',NOW(),NOW()+INTERVAL '1 hour','a3200000-0000-4000-8000-000000000001');"
assert_reject "RB-03 DB: session with foreign service" 23503 \
  "INSERT INTO sessions (id,practitioner_id,client_id,service_id,scheduled_start,scheduled_end,team_id) VALUES ('b3200000-0000-4000-8000-000000000002','a3100000-0000-4000-8000-000000000001','a3300000-0000-4000-8000-000000000001','a3400000-0000-4000-8000-000000000002',NOW(),NOW()+INTERVAL '1 hour','a3200000-0000-4000-8000-000000000001');"
assert_reject "RB-11 DB: practitioner session cannot omit practice identity" 23514 \
  "INSERT INTO practitioner_sessions (id,practitioner_id,client_id,session_type) VALUES ('b3200000-0000-4000-8000-000000000003','a3000000-0000-4000-8000-000000000001','a3300000-0000-4000-8000-000000000001','Synthetic refusal');"
assert_reject "RB-14 DB: practitioner session cannot attach foreign Studio session" 23503 \
  "INSERT INTO practitioner_sessions (id,practitioner_id,practitioner_record_id,client_id,studio_session_id,session_type) VALUES ('b3200000-0000-4000-8000-000000000004','a3000000-0000-4000-8000-000000000001','a3100000-0000-4000-8000-000000000001','a3300000-0000-4000-8000-000000000001','a3500000-0000-4000-8000-000000000002','Synthetic refusal');"
assert_reject "RB-15 DB: voice note cannot name a foreign session practice" 23503 \
  "INSERT INTO voice_notes (id,practitioner_id,session_id,client_id,storage_path,size_bytes) VALUES ('b3200000-0000-4000-8000-000000000005','a3100000-0000-4000-8000-000000000002','a3500000-0000-4000-8000-000000000001','a3300000-0000-4000-8000-000000000001','synthetic/refused.webm',1);"
assert_reject "RB-16 DB: voice note cannot name the wrong session client" 23503 \
  "INSERT INTO voice_notes (id,practitioner_id,session_id,client_id,storage_path,size_bytes) VALUES ('b3200000-0000-4000-8000-000000000006','a3100000-0000-4000-8000-000000000001','a3500000-0000-4000-8000-000000000001','a3300000-0000-4000-8000-000000000002','synthetic/refused.webm',1);"
assert_reject "RB-10 DB: join token cannot name a different client" 23503 \
  "INSERT INTO session_join_tokens (id,session_id,client_id,agreement_version,token_hash,expires_at) VALUES ('b3200000-0000-4000-8000-000000000007','a3600000-0000-4000-8000-000000000001','a3300000-0000-4000-8000-000000000001','refused','a3r2r1-refused-token',NOW()+INTERVAL '1 day');"
assert_reject "artifact cannot omit practice identity" 23514 \
  "INSERT INTO session_artifacts (id,session_id,client_id,practitioner_id,artifact_type,draft_content,created_by) VALUES ('b3200000-0000-4000-8000-000000000008','a3600000-0000-4000-8000-000000000001','a3300000-0000-4000-8000-000000000002','a3000000-0000-4000-8000-000000000001','client_summary','{}','a3000000-0000-4000-8000-000000000001');"
assert_reject "RB-19 DB: invite member cannot differ from practice owner" 23503 \
  "INSERT INTO client_invites (id,practitioner_id,practitioner_record_id,client_id,code_hash) VALUES ('b3200000-0000-4000-8000-000000000009','a3000000-0000-4000-8000-000000000002','a3100000-0000-4000-8000-000000000001','a3300000-0000-4000-8000-000000000001','a3r2r1-refused-invite');"
assert_reject "booking request cannot cross practice" 23503 \
  "INSERT INTO booking_requests (id,practitioner_id,service_id,status) VALUES ('b3200000-0000-4000-8000-00000000000a','a3100000-0000-4000-8000-000000000001','a3400000-0000-4000-8000-000000000002','received');"
assert_reject "RB-20 DB: encounter cannot name a foreign meeting" 23503 \
  "INSERT INTO encounters (id,practitioner_id,session_id,title,team_id) VALUES ('b3200000-0000-4000-8000-00000000000b','a3100000-0000-4000-8000-000000000001','a3c00000-0000-4000-8000-000000000002','Synthetic refusal','a3200000-0000-4000-8000-000000000001');"
assert_reject "RB-21 DB: participant person cannot cross team" 23503 \
  "INSERT INTO encounter_participants (id,encounter_id,person_id,team_id,display_name,role) VALUES ('b3200000-0000-4000-8000-00000000000c','a3e00000-0000-4000-8000-000000000001','a3d00000-0000-4000-8000-000000000002','a3200000-0000-4000-8000-000000000001','Synthetic refusal','client');"
assert_reject "RB-22 DB: consent participant cannot cross encounter" 23503 \
  "INSERT INTO encounter_consent_events (id,encounter_id,participant_id,kind) VALUES ('b3200000-0000-4000-8000-00000000000d','a3e00000-0000-4000-8000-000000000001','a3f00000-0000-4000-8000-000000000002','share');"
assert_reject "RB-23: media requires exact record consent tuple" P0001 \
  "INSERT INTO encounter_media_streams (id,encounter_id,participant_id,consent_event_id,kind) VALUES ('b3200000-0000-4000-8000-00000000000e','a3e00000-0000-4000-8000-000000000001','a3f00000-0000-4000-8000-000000000001','b3000000-0000-4000-8000-000000000001','mic');"

echo "=== Reciprocal Session Room link refuses disagreement ==="
q "INSERT INTO sessions (id,practitioner_id,client_id,service_id,scheduled_start,scheduled_end,team_id) VALUES ('b3300000-0000-4000-8000-000000000001','a3100000-0000-4000-8000-000000000001','a3300000-0000-4000-8000-000000000001','a3400000-0000-4000-8000-000000000001',NOW(),NOW()+INTERVAL '1 hour','a3200000-0000-4000-8000-000000000001'), ('b3300000-0000-4000-8000-000000000002','a3100000-0000-4000-8000-000000000001','a3300000-0000-4000-8000-000000000001','a3400000-0000-4000-8000-000000000001',NOW()+INTERVAL '2 hours',NOW()+INTERVAL '3 hours','a3200000-0000-4000-8000-000000000001');"
q "INSERT INTO scribe_sessions (id,member_id,practitioner_record_id,container,client_id,booking_id,title) VALUES ('b3300000-0000-4000-8000-000000000003','a3000000-0000-4000-8000-000000000001','a3100000-0000-4000-8000-000000000001','practitioner','a3300000-0000-4000-8000-000000000001','b3300000-0000-4000-8000-000000000001','Valid reciprocal-control fixture');"
assert_reject "reciprocal booking and Session Room IDs must agree" P0001 \
  "UPDATE sessions SET scribe_session_id='b3300000-0000-4000-8000-000000000003' WHERE id='b3300000-0000-4000-8000-000000000002';"
q "DELETE FROM scribe_sessions WHERE id='b3300000-0000-4000-8000-000000000003'; DELETE FROM sessions WHERE id IN ('b3300000-0000-4000-8000-000000000001','b3300000-0000-4000-8000-000000000002');"

echo "=== Validation must stop while adjudications remain open ==="
set +e
validation_before="$("$PSQL_BIN" "${PG_ARGS[@]}" -d "$GATE_DB" -X -q -v ON_ERROR_STOP=1 -f "$VALIDATE" 2>&1)"
validation_rc=$?
set -e
if [[ $validation_rc -ne 0 ]] && grep -q 'adjudication row(s) remain open' <<<"$validation_before"; then
  ok "RB-24 validation refuses unresolved historical contradictions"
else
  no "RB-24 validation refuses unresolved historical contradictions" "rc=$validation_rc; ${validation_before//$'\n'/ }"
fi

echo "=== Reconcile exact fixture IDs, recensus, and validate ==="
"$PSQL_BIN" "${PG_ARGS[@]}" -d "$GATE_DB" -X -q -v ON_ERROR_STOP=1 -f "$RECONCILE"
assert_eq "all 15 frozen decisions were explicitly resolved" "0|15" \
  "SELECT count(*) FILTER (WHERE status='open') || '|' || count(*) FILTER (WHERE status='resolved') FROM relationship_binding_adjudications;"
run_census "$TMP_DIR/census-after-reconciliation.txt"
remaining="$(awk -F'|' '$1 ~ /^mismatch\./ && $2 != 0 {print}' "$TMP_DIR/census-after-reconciliation.txt")"
if [[ -z "$remaining" ]]; then
  ok "relationship census returns zero after explicit fixture reconciliation"
else
  no "relationship census returns zero after explicit fixture reconciliation" "${remaining//$'\n'/; }"
fi

"$PSQL_BIN" "${PG_ARGS[@]}" -d "$GATE_DB" -X -q -v ON_ERROR_STOP=1 -f "$VALIDATE"
assert_eq "all 35 relationship guards validate" "0|35" \
  "SELECT count(*) FILTER (WHERE NOT convalidated) || '|' || count(*) FROM pg_constraint WHERE conname LIKE 'a3r2_%' AND contype IN ('c','f');"

echo "=== A3-R2-R1 relationship lifecycle result ==="
echo "PASS=$pass FAIL=$fail"
if ((fail > 0)); then exit 1; fi
echo "A3-R2-R1 DATABASE LIFECYCLE: PASS"
