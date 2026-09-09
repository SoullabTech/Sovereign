#!/usr/bin/env bash
# WS-WHOLE-MANUSCRIPT-01 · the automated runtime falsifier, made rerunnable.
#
# WHY THIS FILE EXISTS. On 2026-09-08 this falsifier ran once, against
# `af013cb4a`, and its results were transcribed into §4c of the constitution.
# The harness itself was ephemeral and was lost. On 2026-09-09, asked to
# re-qualify a freshened candidate, there was nothing to re-run — only a claim.
#
#   A machine subject that cannot be re-witnessed on demand degrades into a
#   claim. This file is the repair.
#
# ⛔ WHAT THIS IS NOT. It is not the §4b human witness and cannot become it.
# §4c is explicit: "A machine PASS makes the runtime mechanics eligible for
# human witnessing. It does not promote the human witness." This harness proves
# the mechanics a browser can decide; whether the divisions perceptually recede,
# whether movement feels continuous, whether the boundary feels quiet — none of
# that is here, and none of it can be.
#
# ⛔ NON-PRODUCTION BY CONSTRUCTION, and it refuses rather than trusts:
#   · ephemeral PostgreSQL on a private socket, created and destroyed here
#   · schema from committed artifacts only (canonical baseline + db:migrate)
#   · one synthetic member, one deterministic synthetic 262-section Work
#   · the real application auth path — no injected session, no bypass
#   · loopback app only
#   · no production credential, database, or external service is reachable
#
# UNOBSERVABLE IS NOT PASS. A check that cannot be exercised fails the run.

set -Eeuo pipefail

SHA="$(git rev-parse HEAD)"
SHORT="$(git rev-parse --short HEAD)"
ROOT="$(git rev-parse --show-toplevel)"
RUN="${TMPDIR:-/tmp}/wm-falsifier.$$"
PGPORT_LOCAL=55677
DB=wm_falsifier
APP_PORT=3117

echo "──────────────────────────────────────────────────────────────"
echo "WS-WHOLE-MANUSCRIPT-01 · runtime falsifier"
echo "  subject SHA : $SHA"
echo "  short       : $SHORT"
echo "  run dir     : $RUN"
echo "──────────────────────────────────────────────────────────────"

# ⛔ A harness that silently leaves a server running has changed the machine it
# was supposed to only observe. Cleanup runs on PASS, on FAIL, and on signal.
cleanup() {
  local rc=$?
  [ -n "${APP_PID:-}" ] && kill "$APP_PID" 2>/dev/null || true
  if [ -d "$RUN/pg" ]; then
    as_pg "'$PGBIN/pg_ctl' -D '$RUN/pg' -m immediate stop" >/dev/null 2>&1 || true
  fi
  # A FAILED run keeps its evidence. Deleting the traces, the build log and the
  # app log at the moment they became interesting is how a harness turns a
  # diagnosable failure back into a claim.
  if [ $rc -eq 0 ]; then
    rm -rf "$RUN"
    echo "[cleanup] run directory removed"
  else
    echo "[cleanup] FAILED — evidence kept at $RUN"
  fi
  exit $rc
}
trap cleanup EXIT INT TERM

PGBIN="$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | tail -1 || true)"
[ -x "$PGBIN/initdb" ] || { echo "⛔ no PostgreSQL server binaries found"; exit 1; }

# PostgreSQL refuses to run as root, on purpose. When the harness is invoked as
# root — which is ordinary in a container — the SERVER runs as the `postgres`
# system user and only the server does; everything else stays as the caller and
# reaches it over the socket. Running the whole harness as postgres instead
# would change what the build and the app are, to fix a constraint that belongs
# to one process.
if [ "$(id -u)" -eq 0 ]; then
  id postgres >/dev/null 2>&1 || { echo "⛔ running as root and no postgres user exists"; exit 1; }
  as_pg() { su postgres -s /bin/bash -c "$*"; }
  PG_OWNER=postgres
else
  as_pg() { bash -c "$*"; }
  PG_OWNER="$(id -un)"
fi

mkdir -p "$RUN"
chown "$PG_OWNER" "$RUN"
chmod 1777 "$RUN"

echo "[1/6] ephemeral PostgreSQL"
as_pg "'$PGBIN/initdb' -D '$RUN/pg' -U wm -A trust" >/dev/null 2>&1
as_pg "'$PGBIN/pg_ctl' -D '$RUN/pg' -o \"-k $RUN -p $PGPORT_LOCAL -h ''\" -l '$RUN/pg.log' start" >/dev/null
export DATABASE_URL="postgresql://wm@localhost:$PGPORT_LOCAL/$DB?host=$RUN"
"$PGBIN/createdb" -h "$RUN" -p $PGPORT_LOCAL -U wm "$DB"

# ⛔ Refuse to proceed against anything but the database this script just made.
case "$DATABASE_URL" in
  *"$RUN"*) : ;;
  *) echo "⛔ DATABASE_URL is not the ephemeral socket — refusing"; exit 1 ;;
esac

echo "[2/6] schema from committed artifacts"
# ⛔ THE CANONICAL BOOTSTRAP SEQUENCE, NOT A HAND-ROLLED ONE. The baseline is a
# present-day snapshot of the production schema, so the migrations it already
# subsumes must be STAMPED, not re-run. Applying the baseline with psql and then
# running the whole ledger over it fails on the first migration that alters
# something the snapshot already carries — which is the runner telling the truth
# about a sequence that was wrong, not a schema problem to work around.
export PATH="$PGBIN:$PATH"
npm run db:bootstrap >"$RUN/bootstrap.log" 2>&1 || {
  echo "⛔ db:bootstrap failed"; tail -40 "$RUN/bootstrap.log"; exit 1; }
npm run db:migrate >"$RUN/migrate.log" 2>&1 || {
  echo "⛔ db:migrate failed on the baselined database"; tail -40 "$RUN/migrate.log"; exit 1; }

SCHEMA_RESULT="PASS"

echo "[3/6] synthetic member + deterministic 262-section Work"
FIXTURE="$(npx tsx scripts/witness/whole-manuscript/seed.ts | tee /dev/stderr | tail -1 | sed 's/^ *//')"

echo "[4/6] build"
npm run build >"$RUN/build.log" 2>&1 || { echo "⛔ build failed — see $RUN/build.log"; tail -30 "$RUN/build.log"; exit 1; }

echo "[5/6] app on loopback :$APP_PORT"
PORT=$APP_PORT npm run start >"$RUN/app.log" 2>&1 &
APP_PID=$!
for i in $(seq 1 60); do
  curl -sf "http://127.0.0.1:$APP_PORT/api/health" >/dev/null 2>&1 && break
  sleep 2
  [ $i -eq 60 ] && { echo "⛔ app never became healthy"; tail -30 "$RUN/app.log"; exit 1; }
done

echo "[6/6] falsifier"
RESULT="$RUN/checks.txt"
: >"$RESULT"
set +e
WM_BASE="http://127.0.0.1:$APP_PORT" WM_SHA="$SHA" WM_OUT="$RUN/results" WM_RESULT="$RESULT" \
  npx playwright test --config scripts/witness/whole-manuscript/playwright.config.ts
FALSIFIER_RC=$?
set -e

# ⭐ THE DATABASE IS DISPOSABLE. THE CLAIM THAT IT PASSED IS NOT.
#
# Everything this run built is about to be deleted, including the only place the
# result existed. So the result is composed and PRINTED here, self-contained and
# transcribable, before cleanup touches anything. Set WM_RESULT_OUT to also keep
# a copy at a path of your choosing.
#
# ⛔ It reports what happened, never what was hoped for: `overall` is derived
# from the runner's exit status, and a check that did not run appears as its
# own status rather than being absent.
BLOCK="$(
  echo "─────── WS-WHOLE-MANUSCRIPT-01 · falsifier result ───────"
  echo "subject SHA             $SHA"
  echo "harness SHA             $SHA (same tree — the harness is versioned with its subject)"
  echo "schema reconstruction   $SCHEMA_RESULT (canonical baseline + ledger stamp + db:migrate)"
  echo "fixture identity        $FIXTURE"
  cat "$RESULT" 2>/dev/null
  if [ "$FALSIFIER_RC" -eq 0 ]; then echo "overall                 PASS"; else echo "overall                 FAIL (runner exit $FALSIFIER_RC)"; fi
  echo "────────────────────────────────────────────────────────"
)"
echo "$BLOCK"
# An `&&` chain here would be the script's own last word under `set -e`: with
# WM_RESULT_OUT unset the chain evaluates false and the harness would exit 1,
# reporting a PASS as a failure. The condition is spelled out instead.
if [ -n "${WM_RESULT_OUT:-}" ]; then
  printf '%s\n' "$BLOCK" >"$WM_RESULT_OUT"
  echo "[result] also written to $WM_RESULT_OUT"
fi

exit "$FALSIFIER_RC"
