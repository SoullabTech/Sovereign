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
  const marks = ['woke slowly', 'carried the nets', 'The letter came in March', 'leaving had been the long part', 'one claim: attention', 'clinic study', 'attention budget that interruptions', 'slowing down protects', 'two-hour block'];
  const allText = sys + '\n' + JSON.stringify(j.messages ?? []);
  const seen = ['The Harbour', 'Salt', 'The Letter', 'Return', 'The Scarce Resource', 'What the Clinic Found', 'The Attention Budget', 'Why Slowness Scales', 'What to Do on Monday'].filter((h, i) => allText.includes(marks[i]));
  fs.appendFileSync(LOG, JSON.stringify({ at: new Date().toISOString(), tools: (j.tools ?? []).map((t) => t.name), chaptersInFrontOfMaia: seen, standingPermission: sys.includes('STANDING PERMISSION'), settled: /WHAT THE WRITER HAS SETTLED/.test(sys) }) + '\n');
  const base = { id: 'msg_stub', type: 'message', role: 'assistant', model: j.model ?? 'stub', stop_sequence: null, usage: { input_tokens: 1, output_tokens: 1 } };
  res.setHeader('content-type', 'application/json');
  if ((j.tools ?? []).some((t) => t.name === 'development_plan')) {
    // Plan: steps anchored to EXACT sentences from the chapters she was handed, plus one invented step that grounding must drop.
    const all = sys + '\n' + (j.messages ?? []).map((m) => typeof m.content === 'string' ? m.content : JSON.stringify(m.content)).join('\n');
    const blocks = [...all.matchAll(/<chapter id="([0-9a-f-]{36})" heading="([^"]*)">\n([\s\S]*?)\n<\/chapter>/g)].map((m) => ({ h: m[2], id: m[1], text: m[3] }));
    const firstSentence = (t) => { const b = t.split('\n\n').slice(-1)[0]; const m = b.match(/^[^.!?]+[.!?]/); return (m ? m[0] : b.slice(0, 80)).trim(); };
    const steps = blocks.slice(0, 2).map((c) => ({ chapterId: c.id, anchor: firstSentence(c.text), direction: 'Try letting this opening answer what an earlier chapter promised.', why: 'It would tie the chapters together.' }));
    if (blocks[0]) steps.push({ chapterId: blocks[0].id, anchor: 'a lighthouse that never appears in this book', direction: 'invented', why: '' });
    res.end(JSON.stringify({ ...base, stop_reason: 'tool_use', content: [{ type: 'tool_use', id: 'toolu_plan' + (++n), name: 'development_plan',
      input: { summary: '[stand-in] A plan across ' + blocks.map((b) => b.h).join(', ') + '.', steps } }] }));
  } else if ((j.tools ?? []).length) {
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
  python3 - "$1" "$2" "$PSQL_BIN" "$PGPORT" "$3" <<'PYSEED'
import sys, subprocess, json
dr, ms, psql, port, chfile = sys.argv[1:6]
chapters = [(c["h"], c["b"]) for c in json.load(open(chfile))]
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

# one Work + manuscript + draft for the fictional writer; prints "manuscriptId|draftId"
seed_book() {  # $1 member id  $2 title  $3 purpose
  P -d walk_fictional <<SQLBOOK
WITH w AS (INSERT INTO living_works(member_id,title,purpose) VALUES ('$1','$2','$3') RETURNING id,member_id),
ms AS (INSERT INTO member_manuscripts(member_id,title) SELECT member_id,'$2' FROM w RETURNING id,member_id),
e AS (INSERT INTO living_work_expressions(living_work_id,expression_type,expression_id,declared_by) SELECT w.id,'manuscript',ms.id,w.member_id FROM w,ms RETURNING 1),
d AS (INSERT INTO manuscript_working_drafts(manuscript_id,member_id,content,base_source_hash) SELECT id,member_id,'','h' FROM ms RETURNING id)
SELECT (SELECT id FROM ms)||'|'||(SELECT id FROM d);
SQLBOOK
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
  MEMBER=$(P -d walk_fictional -c "INSERT INTO members(passkey,username,password_hash,name,onboarded,onboarding_step) VALUES ('walk-passkey','bwriter','$PWHASH','Fictional Writer',true,'complete') RETURNING id")
  cat > "$STATE/novel.json" <<'NOVELJSON'
[{"h":"The Harbour","b":"The harbour woke slowly, and the salt on the rails caught the first light before anyone spoke. Marta stood at the end of the quay with her mother's key in her pocket, counting the boats that were not there."},
 {"h":"Salt","b":"Marta carried the nets uphill every morning, counting each knot as though it were a name she owed. Her hands learned the work before she did; by the third winter she no longer noticed the cold."},
 {"h":"The Letter","b":"The letter came in March, folded small, written in a hand she had hoped never to read again. It asked for nothing, which was how she knew it wanted everything."},
 {"h":"Return","b":"When she returned, the harbour was smaller, and she understood that leaving had been the long part. The boats she had counted were all there now, and none of them knew her."}]
NOVELJSON
  cat > "$STATE/nonfiction.json" <<'NFJSON'
[{"h":"The Scarce Resource","b":"This book rests on one claim: attention, not money or time, is the scarce resource of modern work. Every later chapter either supports that claim or shows what follows from it."},
 {"h":"What the Clinic Found","b":"In the clinic study, staff who protected two unbroken hours a day made fewer errors and reported less fatigue. The effect held across three shifts, which is why this chapter treats it as evidence for the central claim."},
 {"h":"The Attention Budget","b":"Think of each person as holding an attention budget that interruptions draw down. A budget is spent, saved and overdrawn; the rest of the book uses the term in exactly this sense."},
 {"h":"Why Slowness Scales","b":"If attention is the scarce resource, then slowing down protects the budget that organisations depend on. Teams that spend their attention on fewer things do better work on those things, and the effect compounds."},
 {"h":"What to Do on Monday","b":"Begin by protecting one two-hour block. Tell the people who depend on you when it is, and keep it for three weeks before judging whether it works."}]
NFJSON
  OUT=$(seed_book "$MEMBER" "The Long Harbour" "A novel about leaving a place and finding it smaller on return.")
  MS="${OUT%%|*}"; DR="${OUT##*|}"
  seed_sections "$DR" "$MS" "$STATE/novel.json"
  OUT2=$(seed_book "$MEMBER" "The Quiet Economy" "A nonfiction book arguing that attention is the scarce resource of modern work.")
  MS2="${OUT2%%|*}"; DR2="${OUT2##*|}"
  seed_sections "$DR2" "$MS2" "$STATE/nonfiction.json"
  echo "$MS" > "$STATE/manuscript.id"; echo "$MS2" > "$STATE/manuscript2.id"

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
    DATABASE_URL="postgresql://fictional@127.0.0.1:$PGPORT/walk_fictional" WRITERS_STUDIO_EDITORIAL_ENABLED=1 NEXT_PUBLIC_WS_DEVELOP_STAGE=1 "${MODEL_ENV[@]}" \
    nohup npx next dev -p "$APPPORT" > "$STATE/app.log" 2>&1 &
  echo $! > "$STATE/app.pid"
  for i in $(seq 1 60); do grep -q "Ready in" "$STATE/app.log" 2>/dev/null && break; sleep 1; done
  echo
  echo "────────────────────────────────────────────────────────────────────────────"
  echo " WALK HARNESS UP — $MODE"
  echo "   open:      http://localhost:$APPPORT/signin      (the real sign-in page)"
  echo "   username:  bwriter        password:  walkpass     (FICTIONAL; this throwaway database only)"
  echo "   novel:     http://localhost:$APPPORT/writers-studio?mode=develop&m=$MS"
  echo "   nonfiction: http://localhost:$APPPORT/writers-studio?mode=develop&m=$MS2"
  echo "   stop:      $0 down"
  echo "   logs:      $STATE/app.log   $STATE/stub.log"
  echo "────────────────────────────────────────────────────────────────────────────"
}

case "${1:-}" in up) up;; down) down;; *) echo "usage: $0 up|down"; exit 2;; esac
