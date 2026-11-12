#!/usr/bin/env bash
# WS-RELATIONAL-ARCHITECTURE · erasure after a completed editorial pass (2026-11-11).
#
# Law: once a pass has recorded its letter on editorial_pass_run_events, deleting that letter, erasing the manuscript, and
# deleting the member's account (manuscripts erased first, as production requires) must still succeed; and the run log stays
# append-only for every UPDATE that is not the letter_id foreign key's own ON DELETE SET NULL.
#
# Before the fix this FAILS: the append-only BEFORE UPDATE trigger refused the UPDATE ... SET letter_id = NULL that PostgreSQL
# issues for the foreign key, so the letter, manuscript and account deletes raised "editorial_pass_run_events is append-only".
#
# Production parity (revision 2, after the 2026-11-11 independent review's F1): member_manuscripts.member_id is ON DELETE
# RESTRICT, as declared in database/migrations/20260721000003_press_manuscript_room.sql. So production cannot delete a member who
# still holds a manuscript (case 4 records that this pre-existing refusal is the foreign key, not the new tables), and account
# deletion is modelled as erase-every-manuscript-then-delete-member (case 3).
#
# Runs against a throwaway LOOPBACK PostgreSQL cluster created for this run and destroyed on exit. Fictional rows only; no network.
#   PGBIN=/opt/homebrew/opt/postgresql@16/bin tests/constitutional/ws-delete/dynamic/run-pass-run-letter-erasure-pg16.sh   (Mac Studio)
#   PGBIN=/usr/lib/postgresql/16/bin           tests/constitutional/ws-delete/dynamic/run-pass-run-letter-erasure-pg16.sh   (Linux)
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
PGBIN="${PGBIN:-/usr/lib/postgresql/16/bin}"
export LC_ALL="${LC_ALL:-C}"   # macOS: without a valid locale the postmaster refuses to start ("became multithreaded")
D="$(mktemp -d "${TMPDIR:-/tmp}/ws-passrun-pg-XXXXXX")"
PORT="$(python3 -c "import socket;s=socket.socket();s.bind(('127.0.0.1',0));print(s.getsockname()[1]);s.close()")"
cleanup() { "$PGBIN/pg_ctl" -D "$D/data" -m immediate stop >/dev/null 2>&1 || true; rm -rf "$D"; }
trap cleanup EXIT

"$PGBIN/initdb" -D "$D/data" -A trust -U fictional >/dev/null
"$PGBIN/pg_ctl" -D "$D/data" -o "-p $PORT -c listen_addresses=127.0.0.1 -c unix_socket_directories=''" -w -l "$D/log" start >/dev/null \
  || { echo "server did not start; log:"; tail -20 "$D/log"; exit 2; }
PSQL=("$PGBIN/psql" -X -q -v ON_ERROR_STOP=1 -h 127.0.0.1 -p "$PORT" -U fictional -d postgres)
echo "server: $("${PSQL[@]}" -tAc 'SHOW server_version')  (loopback:$PORT, throwaway)"

# Stub parents (only the columns the new foreign keys need, with production's foreign-key action), then the real migrations,
# all three pending ones, in ledger order.
"${PSQL[@]}" -c "CREATE TABLE members (id uuid PRIMARY KEY DEFAULT gen_random_uuid());
  CREATE TABLE member_manuscripts (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT);"
for m in 20261109000001_sound_studio_reviews 20261111000001_work_editorial_letters 20261111000002_editorial_pass_runs; do
  "${PSQL[@]}" -f "$ROOT/database/migrations/$m.sql" >/dev/null 2>&1
done

# Each case builds a completed pass (queued -> done with the letter), acts, and checks. Every case runs in a transaction that is
# rolled back, so cases are independent. A case that should be refused must raise exactly the append-only error.
# Every case runs even if an earlier one fails; the script fails if any case did.
OUT="$D/cases.out"
set +e
"$PGBIN/psql" -X -q -v ON_ERROR_STOP=0 -h 127.0.0.1 -p "$PORT" -U fictional -d postgres > "$OUT" 2>&1 <<'SQL'
-- A completed pass with its letter, plus a place decision on that letter and a Sound Studio review, so every new table holds rows.
CREATE FUNCTION pass_fixture(OUT m uuid, OUT ms uuid, OUT l uuid, OUT r uuid) LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO members DEFAULT VALUES RETURNING id INTO m;
  INSERT INTO member_manuscripts (member_id) VALUES (m) RETURNING id INTO ms;
  INSERT INTO work_editorial_letters (member_id, manuscript_id, draft_revision, map)
    VALUES (m, ms, 1, '{"items": []}') RETURNING id INTO l;
  INSERT INTO editorial_pass_runs (member_id, manuscript_id, draft_revision) VALUES (m, ms, 1) RETURNING id INTO r;
  INSERT INTO editorial_pass_run_events (run_id, state) VALUES (r, 'queued');
  INSERT INTO editorial_pass_run_events (run_id, state, letter_id) VALUES (r, 'done', l);
  INSERT INTO work_place_decision_events (member_id, manuscript_id, letter_id, place_id, decision) VALUES (m, ms, l, 'place-1', 'intended');
  INSERT INTO sound_studio_reviews (member_id, work_id, lines, consent_version)
    VALUES (m, 'open-ground', '[{"kind": "observation", "text": "fictional"}]', 'fictional-v1');
END $$;

CREATE FUNCTION expect_refused(sql text, label text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  BEGIN
    EXECUTE sql;
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM NOT LIKE '% is append-only' THEN RAISE EXCEPTION 'FAIL %: refused for the wrong reason: %', label, SQLERRM; END IF;
    RAISE NOTICE 'PASS %: refused (%)', label, SQLERRM;
    RETURN;
  END;
  RAISE EXCEPTION 'FAIL %: UPDATE was allowed; the run log is no longer append-only', label;
END $$;

-- 1. Delete the letter: the events stay, their letter_id becomes NULL, nothing else changes.
BEGIN;
DO $$ DECLARE f record; n int; BEGIN
  SELECT * INTO f FROM pass_fixture();
  BEGIN
    DELETE FROM work_editorial_letters WHERE id = f.l;
  EXCEPTION WHEN raise_exception THEN RAISE EXCEPTION 'FAIL delete letter: %', SQLERRM; END;
  SELECT count(*) INTO n FROM editorial_pass_run_events WHERE run_id = f.r AND letter_id IS NULL;
  IF n <> 2 THEN RAISE EXCEPTION 'FAIL delete letter: expected 2 events kept with letter_id NULL, got %', n; END IF;
  IF NOT EXISTS (SELECT 1 FROM editorial_pass_run_events WHERE run_id = f.r AND state = 'done') THEN
    RAISE EXCEPTION 'FAIL delete letter: the done event changed'; END IF;
  RAISE NOTICE 'PASS delete letter: events kept, letter_id NULL, state unchanged';
END $$;
ROLLBACK;

-- 2. Erase the manuscript: letter, run and events all go.
BEGIN;
DO $$ DECLARE f record; BEGIN
  SELECT * INTO f FROM pass_fixture();
  BEGIN
    DELETE FROM member_manuscripts WHERE id = f.ms;
  EXCEPTION WHEN raise_exception THEN RAISE EXCEPTION 'FAIL delete manuscript: %', SQLERRM; END;
  IF EXISTS (SELECT 1 FROM editorial_pass_run_events WHERE run_id = f.r) OR EXISTS (SELECT 1 FROM editorial_pass_runs WHERE id = f.r)
     OR EXISTS (SELECT 1 FROM work_editorial_letters WHERE id = f.l) THEN
    RAISE EXCEPTION 'FAIL delete manuscript: rows survived the cascade'; END IF;
  RAISE NOTICE 'PASS delete manuscript: letter, run and events removed';
END $$;
ROLLBACK;

-- 3. Delete the member's account as production must: erase every manuscript, then delete the member. Everything of theirs goes.
BEGIN;
DO $$ DECLARE f record; BEGIN
  SELECT * INTO f FROM pass_fixture();
  BEGIN
    DELETE FROM member_manuscripts WHERE member_id = f.m;
    DELETE FROM members WHERE id = f.m;
  EXCEPTION WHEN OTHERS THEN RAISE EXCEPTION 'FAIL delete account: %', SQLERRM; END;
  IF EXISTS (SELECT 1 FROM editorial_pass_run_events WHERE run_id = f.r) OR EXISTS (SELECT 1 FROM editorial_pass_runs WHERE id = f.r)
     OR EXISTS (SELECT 1 FROM work_editorial_letters WHERE id = f.l) OR EXISTS (SELECT 1 FROM member_manuscripts WHERE id = f.ms)
     OR EXISTS (SELECT 1 FROM work_place_decision_events WHERE member_id = f.m) OR EXISTS (SELECT 1 FROM sound_studio_reviews WHERE member_id = f.m)
     OR EXISTS (SELECT 1 FROM members WHERE id = f.m) THEN
    RAISE EXCEPTION 'FAIL delete account: rows survived'; END IF;
  RAISE NOTICE 'PASS delete account (manuscripts erased first): manuscript, letter, decision, run, events and review removed';
END $$;
ROLLBACK;

-- 4. Pre-existing, unchanged by these migrations: a member who still holds a manuscript cannot be deleted, and the refusal comes
--    from member_manuscripts' own RESTRICT foreign key, not from any of the new tables or triggers.
BEGIN;
DO $$ DECLARE f record; BEGIN
  SELECT * INTO f FROM pass_fixture();
  BEGIN
    DELETE FROM members WHERE id = f.m;
  EXCEPTION
    WHEN foreign_key_violation THEN
      IF SQLERRM NOT LIKE '%member_manuscripts%' THEN RAISE EXCEPTION 'FAIL member with manuscript: refused by another table: %', SQLERRM; END IF;
      RAISE NOTICE 'PASS member with manuscript: refused by member_manuscripts RESTRICT (pre-existing), not by the new tables';
      RETURN;
    WHEN raise_exception THEN RAISE EXCEPTION 'FAIL member with manuscript: refused by a new trigger: %', SQLERRM;
  END;
  RAISE EXCEPTION 'FAIL member with manuscript: delete succeeded; the stub no longer matches production RESTRICT';
END $$;
ROLLBACK;

-- 5. The run log is still append-only for every ordinary UPDATE.
BEGIN;
DO $$ DECLARE f record; BEGIN
  SELECT * INTO f FROM pass_fixture();
  PERFORM expect_refused(format('UPDATE editorial_pass_run_events SET letter_id = NULL WHERE run_id = %L', f.r), 'direct letter_id -> NULL on events');
  PERFORM expect_refused(format('UPDATE editorial_pass_run_events SET state = %L WHERE run_id = %L', 'failed', f.r), 'state change on events');
  PERFORM expect_refused(format('UPDATE editorial_pass_run_events SET letter_id = NULL, state = %L WHERE run_id = %L', 'failed', f.r), 'letter_id -> NULL plus another column on events');
  PERFORM expect_refused(format('UPDATE editorial_pass_runs SET draft_revision = 2 WHERE id = %L', f.r), 'update on editorial_pass_runs');
  PERFORM expect_refused(format('UPDATE work_editorial_letters SET draft_revision = 2 WHERE id = %L', f.l), 'update on work_editorial_letters');
END $$;
ROLLBACK;
SQL
set -e
grep -E "PASS|FAIL|ERROR" "$OUT" | sed -E 's/^(psql:[^ ]+ )?(NOTICE|ERROR): +//'
if grep -q -E "FAIL|ERROR" "$OUT"; then echo "RESULT: FAIL"; exit 1; fi
echo "RESULT: ALL PASS"
