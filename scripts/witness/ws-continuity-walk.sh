#!/usr/bin/env bash
# WS-CONTINUITY — founder walk harness. ONE command up, ONE command down.
#   scripts/witness/ws-continuity-walk.sh up        # stand-in model (nothing leaves this machine)
#   REAL_MODEL=1 ANTHROPIC_API_KEY=… scripts/witness/ws-continuity-walk.sh up   # real MAIA on FICTIONAL text only
#   scripts/witness/ws-continuity-walk.sh down
#
# SAFETY: a throwaway loopback PostgreSQL 16 cluster and a local dev server of THIS worktree. Fictional writer, fictional manuscript.
# It never reads or writes the real database, never reads .env files, never deploys. `down` removes only its own state dir.
# REAL_MODEL=1 sends the fictional manuscript text to the model provider using ONLY the key you put in the environment of this command.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
STATE="${WS_WALK_STATE:-/tmp/ws-continuity-walk}"
PGBIN="${PGBIN:-/opt/homebrew/opt/postgresql@16/bin}"
PSQL_BIN="${PSQL_BIN:-/opt/homebrew/bin/psql}"; [ -x "$PSQL_BIN" ] || PSQL_BIN="$(command -v psql)"
PGPORT="${WS_WALK_PGPORT:-54329}"; APPPORT="${WS_WALK_PORT:-3111}"; STUBPORT="${WS_WALK_STUBPORT:-54400}"
export LC_ALL=en_US.UTF-8
P() { "$PSQL_BIN" -X -q -At -h 127.0.0.1 -p "$PGPORT" -U fictional "$@"; }

down() {
  [ -f "$STATE/app.pid" ]  && kill "$(cat "$STATE/app.pid")"  2>/dev/null || true
  pkill -f "next dev -p $APPPORT" 2>/dev/null || true
  [ -f "$STATE/stub.pid" ] && kill "$(cat "$STATE/stub.pid")" 2>/dev/null || true
  [ -d "$STATE/pg" ] && "$PGBIN/pg_ctl" -D "$STATE/pg" -m immediate stop >/dev/null 2>&1 || true
  case "$STATE" in /tmp/ws-continuity-walk*) rm -rf "$STATE";; esac
  echo "walk harness stopped; state removed."
}

write_stub() {
  cat > "$STATE/stub.mjs" <<'STUBJS'
import http from 'node:http'; import fs from 'node:fs';
const LOG = process.argv[2]; let n = 0;
http.createServer((req, res) => { let b = ''; req.on('data', (c) => b += c); req.on('end', () => {
  let j = {}; try { j = JSON.parse(b); } catch {}
  const sys = typeof j.system === 'string' ? j.system : JSON.stringify(j.system ?? '');
  const marks = ['woke slowly', 'carried the nets', 'The letter came in March', 'leaving had been the long part'];
  const seen = ['The Harbour', 'Salt', 'The Letter', 'Return'].filter((h, i) => sys.includes(marks[i]));
  fs.appendFileSync(LOG, JSON.stringify({ at: new Date().toISOString(), tools: (j.tools ?? []).map((t) => t.name), chaptersInFrontOfMaia: seen, standingPermission: sys.includes('STANDING PERMISSION'), settled: /WHAT THE WRITER HAS SETTLED/.test(sys) }) + '\n');
  const base = { id: 'msg_stub', type: 'message', role: 'assistant', model: j.model ?? 'stub', stop_sequence: null, usage: { input_tokens: 1, output_tokens: 1 } };
  res.setHeader('content-type', 'application/json');
  if ((j.tools ?? []).length) {
    n++; const verbs = ['stirred', 'shifted', 'came to', 'opened', 'rose'];
    const original = 'The harbour woke slowly, and the salt on the rails caught the first light before anyone spoke.';
    const rep = original.replace('woke slowly', verbs[n % verbs.length] + ' slowly');
    res.end(JSON.stringify({ ...base, stop_reason: 'tool_use', content: [{ type: 'tool_use', id: 'toolu_s' + n, name: (j.tool_choice && j.tool_choice.name) || j.tools[0].name,
      input: { kind: 'reply_with_proposal', reply: 'One small option, offered lightly. Your own wording may be better.', proposal: { replacementText: rep, rationale: 'Editorial purpose: Verb. A softer opening verb.' } } }] }));
  } else {
    res.end(JSON.stringify({ ...base, stop_reason: 'end_turn', content: [{ type: 'text', text: '[stand-in] Chapters in front of me: ' + (seen.join(', ') || 'none') + '.' }] }));
  }
}); }).listen(Number(process.argv[3]), '127.0.0.1');
STUBJS
}

seed_sections() {
  python3 - "$1" "$2" "$PSQL_BIN" "$PGPORT" <<'PYSEED'
import sys, subprocess
dr, ms, psql, port = sys.argv[1:5]
chapters = [
 ("The Harbour", "The harbour woke slowly, and the salt on the rails caught the first light before anyone spoke. Marta stood at the end of the quay with her mother's key in her pocket, counting the boats that were not there."),
 ("Salt", "Marta carried the nets uphill every morning, counting each knot as though it were a name she owed. Her hands learned the work before she did; by the third winter she no longer noticed the cold."),
 ("The Letter", "The letter came in March, folded small, written in a hand she had hoped never to read again. It asked for nothing, which was how she knew it wanted everything."),
 ("Return", "When she returned, the harbour was smaller, and she understood that leaving had been the long part. The boats she had counted were all there now, and none of them knew her."),
]
q = lambda x: x.replace("'", "''")
sql = []
for i, (h, b) in enumerate(chapters):
    sql.append(f"WITH src AS (INSERT INTO manuscript_sections(manuscript_id,position,heading,body) VALUES ('{ms}',{i+1},'{q(h)}','{q(b)}') RETURNING id) "
               f"INSERT INTO manuscript_draft_sections(draft_id,position,text,source_section_id) SELECT '{dr}',{i+1},'{q(h + chr(10) + chr(10) + b)}',id FROM src;")
content = "".join(h + "\n\n" + b for h, b in chapters)
sql.append(f"UPDATE manuscript_working_drafts SET content='{q(content)}', section_addressable_at=NOW() WHERE id='{dr}';")
for s in sql:
    r = subprocess.run([psql,'-X','-q','-h','127.0.0.1','-p',port,'-U','fictional','-d','walk_fictional','-v','ON_ERROR_STOP=1','-c',s], capture_output=True, text=True)
    if r.returncode:
        print(r.stderr); sys.exit(1)
PYSEED
}

up() {
  [ -x "$PGBIN/initdb" ] || { echo "PostgreSQL 16 not found at $PGBIN (set PGBIN)"; exit 2; }
  [ -d "$STATE" ] && { echo "already up (or leftover): run '$0 down' first"; exit 2; }
  mkdir -p "$STATE"; chmod 700 "$STATE"
  "$PGBIN/initdb" -D "$STATE/pg" -A trust -U fictional >/dev/null
  "$PGBIN/pg_ctl" -D "$STATE/pg" -o "-p $PGPORT -c listen_addresses=127.0.0.1 -c unix_socket_directories=$STATE/pg" -w -l "$STATE/pg.log" start >/dev/null
  P -d postgres -c "CREATE DATABASE walk_fictional" >/dev/null
  echo "applying migrations (some legacy files fail on a bare cluster; that is expected)…"
  for pass in 1 2; do
    ok=0; bad=0
    for f in $(ls "$ROOT"/database/migrations/*.sql | sort); do
      if P -d walk_fictional -v ON_ERROR_STOP=1 -f "$f" >/dev/null 2>&1; then ok=$((ok+1)); else bad=$((bad+1)); fi
    done
    echo "  pass $pass: $ok clean, $bad refused"
  done
  P -d walk_fictional -c "ALTER TABLE members ADD COLUMN IF NOT EXISTS must_reset_password boolean DEFAULT false" >/dev/null
  n=$(P -d walk_fictional -c "SELECT count(*) FROM information_schema.tables WHERE table_name IN ('work_reading_scope_events','writer_decision_events','ask_turn_reads')")
  [ "$n" = "3" ] || { echo "the three new tables are missing ($n/3) — stopping"; down; exit 3; }

  PWHASH='$2b$12$OawyGAFeyQo9AaRCCWqkNuYi6brcwutNJ6Mn.vAdghF54eMiIn75O'   # bcrypt of the fictional password shown below
  OUT=$(P -d walk_fictional <<SQLSEED
WITH m AS (INSERT INTO members(passkey,username,password_hash,name,onboarded,onboarding_step) VALUES ('walk-passkey','bwriter','$PWHASH','Fictional Writer',true,'complete') RETURNING id),
w AS (INSERT INTO living_works(member_id,title,purpose) SELECT id,'The Long Harbour','A book about leaving a place and finding it smaller on return.' FROM m RETURNING id,member_id),
ms AS (INSERT INTO member_manuscripts(member_id,title) SELECT member_id,'The Long Harbour' FROM w RETURNING id,member_id),
e AS (INSERT INTO living_work_expressions(living_work_id,expression_type,expression_id,declared_by) SELECT w.id,'manuscript',ms.id,w.member_id FROM w,ms RETURNING 1),
d AS (INSERT INTO manuscript_working_drafts(manuscript_id,member_id,content,base_source_hash) SELECT id,member_id,'','h' FROM ms RETURNING id)
SELECT (SELECT id FROM ms)||'|'||(SELECT id FROM d);
SQLSEED
)
  MS="${OUT%%|*}"; DR="${OUT##*|}"
  seed_sections "$DR" "$MS"
  echo "$MS" > "$STATE/manuscript.id"

  if [ "${REAL_MODEL:-0}" = "1" ]; then
    [ -n "${ANTHROPIC_API_KEY:-}" ] || { echo "REAL_MODEL=1 needs ANTHROPIC_API_KEY in this command's environment"; down; exit 2; }
    MODEL_ENV=(ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY")
    MODE="REAL MAIA (the fictional text goes to the model provider)"
  else
    write_stub
    node "$STATE/stub.mjs" "$STATE/stub.log" "$STUBPORT" >"$STATE/stub.out" 2>&1 &
    echo $! > "$STATE/stub.pid"
    MODEL_ENV=(ANTHROPIC_BASE_URL="http://127.0.0.1:$STUBPORT" ANTHROPIC_API_KEY="fictional-local-only")
    MODE="STAND-IN model (it logs which chapters it was handed to $STATE/stub.log)"
  fi

  cd "$ROOT"
  env -i PATH="$PATH" HOME="$HOME" LC_ALL="$LC_ALL" NODE_ENV=development NEXT_TELEMETRY_DISABLED=1 \
    DATABASE_URL="postgresql://fictional@127.0.0.1:$PGPORT/walk_fictional" WRITERS_STUDIO_EDITORIAL_ENABLED=1 "${MODEL_ENV[@]}" \
    nohup npx next dev -p "$APPPORT" > "$STATE/app.log" 2>&1 &
  echo $! > "$STATE/app.pid"
  for i in $(seq 1 60); do grep -q "Ready in" "$STATE/app.log" 2>/dev/null && break; sleep 1; done
  echo
  echo "────────────────────────────────────────────────────────────────────────────"
  echo " WALK HARNESS UP — $MODE"
  echo "   open:      http://localhost:$APPPORT/signin      (the real sign-in page)"
  echo "   username:  bwriter        password:  walkpass     (FICTIONAL; this throwaway database only)"
  echo "   then:      http://localhost:$APPPORT/writers-studio?mode=develop&m=$MS"
  echo "   stop:      $0 down"
  echo "   logs:      $STATE/app.log   $STATE/stub.log"
  echo "────────────────────────────────────────────────────────────────────────────"
}

case "${1:-}" in up) up;; down) down;; *) echo "usage: $0 up|down"; exit 2;; esac
