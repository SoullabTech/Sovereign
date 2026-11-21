#!/usr/bin/env bash
# Journey ledger runner (slice 1). Boots a THROWAWAY stack, walks a scripted persona through the real product in a
# browser, writes a PASS / DEAD END / NOT RUN ledger, tears everything down. Nothing touches production.
#
#   bash tests/e2e/journey-ledger/run.sh --report <path.md> [--persona p1] [--flag K=V ...] [--max-trials N]
#                                        [--wj1 | --wj1-only | --defeat MODE] [--keep] [--app-port N] [--pg-port N] [--stub-port N]
#
# Exit codes: 0 the ledger says the journey WORKS (every row PASS, and the walk did not stop on a harness error, and WJ-1 passed if it
# was run) · 1 it does NOT work (a DEAD END or a NOT RUN row, a walk that crashed after its last row, or a failed WJ-1) · 64-79 the
# harness could not run (nothing was walked, so nothing is claimed). See README.md.
#
# What it starts, and always stops: a PostgreSQL 16 shadow (own data dir, own port, trust auth, 127.0.0.1 only), a loopback
# model stub, `next dev --webpack` on localhost. It touches no other checkout. It WRITES: the report (into the report's existing directory); a run directory under TMPDIR (shadow data, logs, stub); and, in THIS checkout, `.next` and `test-results` while `next dev` runs, plus `AGENTS.md` and `next-env.d.ts`, which Next rewrites and this script restores on exit.
#
# What is isolated, exactly (lib/run-lib.sh, jl_build_app_env; README "What is and is not isolated"):
#   - the app server starts with `env -i` and an ALLOWLIST: PATH, a throwaway HOME and TMPDIR, the shadow DATABASE_URL, the model-stub
#     base URL with a fictional key, the harness flags and a few fixed settings. No variable of the caller's reaches it (no proxy
#     variable, token, cloud credential or agent marker), and every name found in the checkout's Next env files (.env, .env.local,
#     .env.development, .env.development.local) is passed EMPTY, because Next never overrides a variable that is already defined.
#   - NOT isolated, and not claimed: the NETWORK. Nothing stops the app server opening a connection wherever this machine allows (the
#     only network control is that the BROWSER's requests off localhost are blocked and listed). The harness's own process (walker,
#     browser, WJ-1) runs with the caller's environment. Files the app can read by path are readable.
set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
HERE="$ROOT/tests/e2e/journey-ledger"
cd "$ROOT"
# shellcheck source=lib/run-lib.sh
. "$HERE/lib/run-lib.sh"

PERSONA=p1; REPORT=""; KEEP=0; WJ1=0; WJ1_ONLY=0; HOLD=0; DEFEAT=none; MAX_TRIALS=120
APP_PORT="${JL_APP_PORT:-3651}"; PG_PORT="${JL_PG_PORT:-55691}"; STUB_PORT="${JL_STUB_PORT:-55692}"
USER_FLAGS=()
while [ $# -gt 0 ]; do
  case "$1" in
    --persona) PERSONA="${2:?}"; shift ;;
    --report) REPORT="${2:?}"; shift ;;
    --flag) USER_FLAGS+=("${2:?}"); shift ;;
    --max-trials) MAX_TRIALS="${2:?}"; shift ;;
    --app-port) APP_PORT="${2:?}"; shift ;;
    --pg-port) PG_PORT="${2:?}"; shift ;;
    --stub-port) STUB_PORT="${2:?}"; shift ;;
    --wj1) WJ1=1 ;;
    --wj1-only) WJ1=1; WJ1_ONLY=1 ;;
    --keep) KEEP=1 ;;
    --hold) HOLD=1 ;;
    --defeat) DEFEAT="${2:?}"; WJ1=1; WJ1_ONLY=1; shift ;;
    *) echo "unknown argument: $1"; exit 64 ;;
  esac; shift
done
[ -n "$REPORT" ] || [ "$WJ1_ONLY" = 1 ] || [ "$HOLD" = 1 ] || { echo "REFUSED: --report <path.md> is required"; exit 64; }
[ -n "$REPORT" ] || REPORT="${TMPDIR:-/tmp}/jl-unused-report.md"
# The report is written into a directory that already exists; this never creates one (and never falls back to the filesystem root).
REPORT_ABS="$(jl_report_path "$REPORT")" || { echo "REFUSED: the report's directory does not exist ($(dirname -- "$REPORT")); create it first"; exit 64; }
REPORT="$REPORT_ABS"

# ---------------------------------------------------------------------------------------------------------------------
# The Writer's Studio flag matrix this harness boots. Production's actual values are NOT in the repository, so these are
# the repository's documented defaults (.env.example, docker-compose.production.yml) plus the switches the Studio rooms
# need to open at all. They MAY DIFFER FROM PRODUCTION. Override or extend with --flag K=V.
# ---------------------------------------------------------------------------------------------------------------------
DEFAULT_FLAGS=(
  NEXT_PUBLIC_WS_DEVELOP_STAGE=1            # compose default (founder ruling 2026-11-09)
  NEXT_PUBLIC_WS_AUTO_READ=1                # compose default (founder ruling 2026-11-12)
  WRITERS_STUDIO_EDITORIAL_ENABLED=1        # the editorial routes answer 404 without it
  WRITERS_STUDIO_FOCUS_ENABLED=1
  WRITERS_STUDIO_REVIEW_DISCUSS_ENABLED=1
  WS_BETA_GRANT_MODE=legacy                 # .env.example default: the roster boolean admits
  WS_PRO_GATE_ENABLED=false                 # .env.example defaults for the Free/Pro family
  WS_FREE_WORK_LIMIT_ENABLED=false
  WS_FREE_ADMISSION_ENABLED=false
  WS_PRO_TASTE_ENABLED=false
  WS_PRO_ASK_ENABLED=false
  STUDIO_HOLDINGS_ENABLED=false
)
declare -A FLAGS=()
for kv in "${DEFAULT_FLAGS[@]}"; do kv="${kv%%#*}"; kv="${kv//[[:space:]]/}"; [ -n "$kv" ] && FLAGS["${kv%%=*}"]="${kv#*=}"; done
for kv in "${USER_FLAGS[@]:-}"; do [ -n "$kv" ] && FLAGS["${kv%%=*}"]="${kv#*=}"; done
FLAG_ENV=(); FLAG_TEXT=""
for k in $(printf '%s\n' "${!FLAGS[@]}" | sort); do FLAG_ENV+=("$k=${FLAGS[$k]}"); FLAG_TEXT+="$k=${FLAGS[$k]} "; done

# ---------------------------------------------------------------------------------------------------------------------
# Preconditions: refuse rather than guess.
# ---------------------------------------------------------------------------------------------------------------------
[ -d node_modules ] || { echo "REFUSED: node_modules missing (npm ci, or symlink one for a worktree)"; exit 65; }
PGBIN="$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1 || true)"
[ -x "$PGBIN/initdb" ] || { echo "REFUSED: no PostgreSQL server binaries under /usr/lib/postgresql"; exit 66; }
FREE_KB="$(df -Pk "$ROOT" | awk 'NR==2{print $4}')"
[ "${FREE_KB:-0}" -gt 3000000 ] || { echo "REFUSED: under 3 GB free where the checkout lives (next dev writes a .next cache)"; exit 67; }
for p in "$APP_PORT" "$PG_PORT" "$STUB_PORT"; do
  if node -e "const s=require('net').connect($p,'127.0.0.1');s.on('connect',()=>process.exit(0));s.on('error',()=>process.exit(1))"; then
    echo "REFUSED: something is already listening on :$p; a walk must not attach to a subject it did not start"; exit 68
  fi
done
[ ! -e .next ] && NEXT_DIR_PREEXISTED=0 || NEXT_DIR_PREEXISTED=1
[ ! -e test-results ] && TR_PREEXISTED=0 || TR_PREEXISTED=1
# `next dev` rewrites two tracked files (it appends an agent-rules block to AGENTS.md and re-points next-env.d.ts at .next/dev).
# Neither belongs to a walk: if they are clean now, they are restored on the way out. If they are already dirty, they are left alone.
if git diff --quiet -- AGENTS.md next-env.d.ts 2>/dev/null; then RESTORE_NEXT_FILES=1; else RESTORE_NEXT_FILES=0; fi

# Named BEFORE anything starts, so the walk's own writes (next dev rewrites AGENTS.md and next-env.d.ts) cannot read as a modified product.
SUBJECT="$(jl_subject "$ROOT")" || { echo "REFUSED: cannot read this checkout's git state"; exit 66; }

RUN="$(mktemp -d "${TMPDIR:-/tmp}/jl-run.XXXXXX")"
if [ "$(id -u)" -eq 0 ]; then
  id postgres >/dev/null 2>&1 || { echo "REFUSED: running as root and no postgres user exists"; rm -rf "$RUN"; exit 66; }
  as_pg() { su postgres -s /bin/bash -c "$*"; }
  chown postgres "$RUN"; chmod 1777 "$RUN"
else
  as_pg() { bash -c "$*"; }
fi

APP_PGID=""; STUB_PID=""; RC=0
cleanup() {
  local rc=$?
  set +e
  [ -n "$APP_PGID" ] && kill -- "-$APP_PGID" 2>/dev/null
  [ -n "$STUB_PID" ] && kill "$STUB_PID" 2>/dev/null
  sleep 1
  [ -n "$APP_PGID" ] && kill -9 -- "-$APP_PGID" 2>/dev/null
  if [ -d "$RUN/pg" ]; then as_pg "'$PGBIN/pg_ctl' -D '$RUN/pg' -m immediate stop" >/dev/null 2>&1; fi
  if [ "$rc" -ge 64 ] && [ "$KEEP" != 1 ]; then
    echo "-- harness failure; tail of the app and database logs before they are removed --"
    tail -15 "$RUN/app.log" 2>/dev/null; tail -8 "$RUN/pg.log" 2>/dev/null
  fi
  if [ "$KEEP" = 1 ]; then echo "== --keep: run directory left at $RUN"; else rm -rf "$RUN"; fi
  sleep 1     # let the dev server's last writes land before the cache directory it created is removed
  [ "$NEXT_DIR_PREEXISTED" = 0 ] && rm -rf "$ROOT/.next"
  [ "$TR_PREEXISTED" = 0 ] && rm -rf "$ROOT/test-results"
  [ "$RESTORE_NEXT_FILES" = 1 ] && git -C "$ROOT" checkout -- AGENTS.md next-env.d.ts 2>/dev/null
  exit "$rc"
}
trap cleanup EXIT INT TERM

DB=jl_shadow
export DATABASE_URL="postgresql://jl@127.0.0.1:$PG_PORT/$DB"
export PGOPTIONS='-c client_min_messages=warning'
PSQL=("$PGBIN/psql" -h 127.0.0.1 -p "$PG_PORT" -U jl -d "$DB" -X -q)

echo "[1/6] throwaway PostgreSQL ($("$PGBIN/postgres" --version | awk '{print $3}')) on 127.0.0.1:$PG_PORT"
as_pg "'$PGBIN/initdb' -D '$RUN/pg' -U jl -A trust --no-sync" >"$RUN/initdb.log" 2>&1 || { tail -5 "$RUN/initdb.log"; exit 69; }
as_pg "'$PGBIN/pg_ctl' -D '$RUN/pg' -o \"-k $RUN -p $PG_PORT -h 127.0.0.1 -c fsync=off -c synchronous_commit=off -c full_page_writes=off\" -l '$RUN/pg.log' -w start" >/dev/null || { tail -5 "$RUN/pg.log"; exit 69; }
"$PGBIN/createdb" -h 127.0.0.1 -p "$PG_PORT" -U jl "$DB" || exit 69

echo "[2/6] schema: canonical baseline (pgvector absent: tolerant), ledger stamp, pending migrations one by one"
BASELINE=database/baseline/0001_baseline_2026-09-01.sql
MANIFEST=database/baseline/0001_baseline_2026-09-01.manifest
sed 's/^CREATE EXTENSION IF NOT EXISTS "vector".*$/-- neutralised by the journey harness: pgvector is not installed/' "$BASELINE" >"$RUN/baseline.sql"
"${PSQL[@]}" -f "$RUN/baseline.sql" >/dev/null 2>"$RUN/baseline.err" || true
BASE_ERRORS="$(grep -c 'ERROR' "$RUN/baseline.err" || true)"
EXPECT_TABLES="$(grep -c '^CREATE TABLE' "$BASELINE" || true)"
GOT_TABLES="$("${PSQL[@]}" -Atc "select count(*) from pg_tables where schemaname='public'")"
"${PSQL[@]}" -c "CREATE TABLE IF NOT EXISTS schema_migrations (filename text PRIMARY KEY, checksum text, applied_at timestamptz NOT NULL DEFAULT now());" >/dev/null
{ echo "INSERT INTO schema_migrations(filename) VALUES"
  grep -v '^#' "$MANIFEST" | tr -d ' \r' | grep -v '^$' | sed "s/.*/('&')/" | paste -sd,
  echo "ON CONFLICT DO NOTHING;"; } | "${PSQL[@]}" >/dev/null
"${PSQL[@]}" -Atc "select filename from schema_migrations" >"$RUN/applied.txt"
PENDING=0; MIG_OK=0; MIG_FAIL=0; MIG_FAIL_LIST=""
for f in database/migrations/*.sql; do
  b="$(basename "$f")"
  grep -qxF "$b" "$RUN/applied.txt" && continue
  PENDING=$((PENDING+1))
  if "${PSQL[@]}" -v ON_ERROR_STOP=1 -f "$f" >/dev/null 2>"$RUN/mig.err"; then
    "${PSQL[@]}" -c "INSERT INTO schema_migrations(filename) VALUES ('$b')" >/dev/null; MIG_OK=$((MIG_OK+1))
  else
    MIG_FAIL=$((MIG_FAIL+1)); MIG_FAIL_LIST+="$b ($(grep -m1 ERROR "$RUN/mig.err" | sed 's/.*ERROR: *//' | cut -c1-60)); "
  fi
done
SCHEMA_TEXT="baseline tables $GOT_TABLES of $EXPECT_TABLES ($BASE_ERRORS baseline statements refused, pgvector absent); pending migrations applied $MIG_OK of $PENDING${MIG_FAIL_LIST:+; refused: $MIG_FAIL_LIST}"
echo "   $SCHEMA_TEXT"

echo "[3/6] loopback model stub on 127.0.0.1:$STUB_PORT (refuses every call; logs the count)"
MODEL_LOG="$RUN/model-calls.jsonl"
node "$HERE/lib/model-stub.mjs" "$STUB_PORT" "$MODEL_LOG" >"$RUN/stub.log" 2>&1 &
STUB_PID=$!
for i in $(seq 1 20); do node -e "const s=require('net').connect($STUB_PORT,'127.0.0.1');s.on('connect',()=>process.exit(0));s.on('error',()=>process.exit(1))" && break; sleep 0.3; done

echo "[4/6] next dev --webpack on http://localhost:$APP_PORT (a development server, not a production build)"
# The app server gets an allowlisted environment and nothing else (jl_build_app_env): none of the caller's variables, the checkout's Next
# env-file names blanked, the model SDK pointed at the stub. It is NOT network-isolated (see the header). Started through the checkout's
# own next binary, not through npx, so npm's config and registry are not consulted either.
jl_build_app_env || { echo "REFUSED: cannot tell what the checkout's env files would inject into the app (@next/env did not run)"; exit 71; }
start_app() {
  setsid env -i "${JL_APP_ENV[@]}" "$ROOT/node_modules/.bin/next" dev --webpack -p "$APP_PORT" >>"$RUN/app.log" 2>&1 &
  APP_PID=$!; APP_PGID="$APP_PID"
  sleep 1     # setsid makes the child its own group leader a moment after the fork; do not test the group before that
}
app_alive() { kill -0 "$APP_PID" 2>/dev/null || kill -0 -- "-$APP_PGID" 2>/dev/null; }
start_app
READY=0; RESTARTED=0
for i in $(seq 1 90); do
  if ! app_alive; then
    # Next 16 prints a one-time upgrade notice the first time it runs under an agent and exits; the same command is
    # allowed to proceed on a retry. The harness retries once and takes NO other action on that text.
    if [ "$RESTARTED" = 0 ] && grep -q "upgrade recommendation" "$RUN/app.log" 2>/dev/null; then
      RESTARTED=1; echo "   (next printed its one-time upgrade notice and exited; retrying the same command once)"; start_app; continue
    fi
    echo "REFUSED: the app process died during startup"; exit 70
  fi
  code="$(node -e "fetch('http://localhost:$APP_PORT/signin').then(r=>console.log(r.status)).catch(()=>console.log(0))")"
  [ "$code" = 200 ] && { READY=1; break; }
  sleep 2
done
[ "$READY" = 1 ] || { echo "REFUSED: the app never answered on :$APP_PORT"; exit 70; }
app_alive || { echo "REFUSED: :$APP_PORT answers but the process this run started is gone"; exit 70; }

if [ "$HOLD" = 1 ]; then
  echo "== --hold: stack is up and nothing is walked. app http://localhost:$APP_PORT  database $DATABASE_URL  run dir $RUN"
  echo "   members: node -e or lib/members.mjs; stop with: touch $RUN/stop (or Ctrl-C). For development of the harness only."
  while [ ! -e "$RUN/stop" ]; do sleep 2; done
  exit 0
fi

if [ "$WJ1_ONLY" = 1 ]; then echo "[5/6] ledger walk skipped (--wj1-only / --defeat)"; else echo "[5/6] walk: persona $PERSONA"; fi
JL_SUBJECT="$SUBJECT" JL_APP_PORT="$APP_PORT" JL_STUB_PORT="$STUB_PORT" JL_SCHEMA_TEXT="$SCHEMA_TEXT" \
JL_PGV="$("$PGBIN/postgres" --version | awk '{print $3}')" JL_FLAG_TEXT="$FLAG_TEXT" JL_META_OUT="$RUN/meta.json" node -e '
const e = process.env;
require("fs").writeFileSync(e.JL_META_OUT, JSON.stringify({
  Subject: e.JL_SUBJECT,
  Server: `next dev --webpack on http://localhost:${e.JL_APP_PORT} (development server; NOT a production build)`,
  Database: `PostgreSQL ${e.JL_PGV} shadow; ${e.JL_SCHEMA_TEXT}`,
  Model: `loopback stub at 127.0.0.1:${e.JL_STUB_PORT}, refuses every call; slice 1 has no MAIA step. The app server was started with an allowlisted environment (no caller variables); its NETWORK is not isolated`,
  Flags: `${e.JL_FLAG_TEXT.trim()} (production values are not in the repository and may differ)`,
  Node: process.version,
}, null, 2));'
RC=0
if [ "$WJ1_ONLY" != 1 ]; then
set +e
JL_BASE="http://localhost:$APP_PORT" JL_MODEL_LOG="$MODEL_LOG" JL_META_FILE="$RUN/meta.json" JL_MAX_TRIALS="$MAX_TRIALS" \
  node "$HERE/run.mjs" --persona "$PERSONA" --report "$REPORT"
RC=$?
set -e
fi

if [ "$WJ1" = 1 ]; then
  echo "[6/6] WJ-1 (tests/e2e/writers-journey) against the same stack"
  node tests/e2e/writers-journey/seed-fictional-writers.cjs >/dev/null
  case "$DEFEAT" in
    none|bad_password|block_autosave) ;;
    no_roster) "${PSQL[@]}" -c "DELETE FROM ops_contacts WHERE member_id = (SELECT id FROM members WHERE username='journey_alice')" ;;
    no_marker) "${PSQL[@]}" -c "UPDATE ops_contacts SET metadata = '{}'::jsonb WHERE member_id = (SELECT id FROM members WHERE username='journey_alice')" ;;
    *) echo "unknown --defeat mode $DEFEAT (none|no_roster|no_marker|bad_password|block_autosave)"; exit 64 ;;
  esac
  set +e
  WJ_DEFEAT="$DEFEAT" WJ_BASE_URL="http://localhost:$APP_PORT" WJ_CHROMIUM_PATH="$(node -e "import('$HERE/lib/trial.mjs').then(m=>console.log(m.findChromium()||''))")" WJ_REPORT="$RUN/wj1.json" \
    npx playwright test -c tests/e2e/writers-journey/playwright.journey.config.ts
  WJ1_RC=$?
  set -e
  if [ "$DEFEAT" != none ]; then echo "== WJ-1 under defeat mode $DEFEAT exit: $WJ1_RC (NON-ZERO is the expected result: the spec must fail when the product is broken this way)"
  else echo "== WJ-1 exit: $WJ1_RC"; fi
  [ "$WJ1_ONLY" = 1 ] && exit "$WJ1_RC"
else
  echo "[6/6] WJ-1 not requested (--wj1)"
fi
FINAL_RC="$(jl_combined_exit "$RC" "${WJ1_RC:-}")"
echo "== ledger exit: $RC${WJ1_RC:+, WJ-1 exit: $WJ1_RC} -> run exit: $FINAL_RC (0 = works; 1 = does NOT work, in the ledger or in WJ-1; the report is $REPORT)"
exit "$FINAL_RC"
