#!/usr/bin/env bash
# WS-WHOLE-MANUSCRIPT-01 · §4b — the real-Work witness runtime.
#
# Boots the MERGED implementation against an ISOLATED copy of a real Work, so
# the founder can perform the eight observations on the actual book.
#
# ⛔ WHY NOT PRODUCTION, AND WHY NOT THE SYNTHETIC FIXTURE.
#   · Observations 2 and 3 TYPE INTO THE MANUSCRIPT. A witness that edits is a
#     witness that must not run where the member's text lives.
#   · The falsifier's synthetic corpus established MECHANICS. §4b asks what a
#     machine cannot: does the book feel continuous, do the divisions recede,
#     does long movement read like a manuscript rather than like operating a
#     windowing system, is the refusal quiet, does place survive a view change.
#     Those need real section lengths and real chapter rhythm.
#
#   The witness needs the real book. It does not need the real database.
#
# ⛔ IT REFUSES PRODUCTION. If DATABASE_URL on entry names anything but the
# ephemeral cluster this script creates, it exits. Nothing here can be pointed
# at minisforum by accident.
#
# Usage:  bash witness-real-work.sh <export_dir>

set -Eeuo pipefail
umask 077
IN="${1:?export directory required (output of export-work.sh)}"

# ⛔ THE MARKER IS THE AUTHORITY, NOT THE ARGUMENT. This script deletes the
# directory it is handed, so it must never accept an arbitrary path. It deletes
# ONLY a directory carrying the marker export-work.sh wrote — anything else is
# refused untouched, including a directory that merely looks like an export.
[ -f "$IN/.wm-witness-export" ] || {
  echo "⛔ $IN carries no witness-export marker — refusing."
  echo "   This script takes custody of and deletes what it is given, so it"
  echo "   accepts only a directory written by export-work.sh."
  exit 1
}
head -1 "$IN/.wm-witness-export" | grep -qx 'wm-witness-export' || {
  echo "⛔ $IN/.wm-witness-export is not a witness-export marker — refusing."; exit 1; }
[ -f "$IN/draft_sections.csv" ] || { echo "⛔ $IN is missing draft_sections.csv"; exit 1; }

SHA="$(git rev-parse HEAD)"
ROOT="$(git rev-parse --show-toplevel)"
RUN="${TMPDIR:-/tmp}/wm-witness.$$"
PGPORT_LOCAL=55688
DB=wm_witness
APP_PORT=3118

# A witness member that exists only here. The real author's identity is NOT
# copied: the Work is remapped to this member, so nothing in the witness
# environment can be mistaken for, or act as, the person who wrote the book.
WITNESS_MEMBER='d0000000-0000-4000-8000-00000000000f'
WITNESS_USER='wm_witness'
WITNESS_PASS='wm-witness-fixture-not-a-secret'

echo "──────────────────────────────────────────────────────────────"
echo "WS-WHOLE-MANUSCRIPT-01 · §4b real-Work witness runtime"
echo "  implementation : $SHA"
echo "  export         : $IN"
echo "──────────────────────────────────────────────────────────────"

cleanup() {
  local rc=$?
  [ -n "${APP_PGID:-}" ] && kill -- "-$APP_PGID" 2>/dev/null || true
  [ -d "$RUN/pg" ] && as_pg "'$PGBIN/pg_ctl' -D '$RUN/pg' -m immediate stop" >/dev/null 2>&1 || true
  rm -rf "$RUN"
  echo "[cleanup] witness environment removed — the copied text is gone with it"
  exit $rc
}
trap cleanup EXIT INT TERM

# ⛔ FIND THE SERVER BINARIES, AND SAY WHERE YOU LOOKED. The first version
# checked two paths and reported only "no PostgreSQL server binaries found" —
# true, useless, and indistinguishable from "PostgreSQL is not installed" on a
# machine where it is. A macOS install can be Homebrew (arm64 or Intel prefix,
# any major version), Postgres.app, or already on PATH.
#
# `initdb` is the discriminator, not `psql`: a client-only install has psql and
# cannot host a cluster, which is the one thing this script needs.
PGBIN="${PGBIN:-}"
[ -n "$PGBIN" ] && [ ! -x "$PGBIN/initdb" ] && { echo "⛔ PGBIN=$PGBIN has no initdb"; exit 1; }
[ -z "$PGBIN" ] && for d in \
  /opt/homebrew/opt/postgresql@*/bin \
  /usr/local/opt/postgresql@*/bin \
  /Applications/Postgres.app/Contents/Versions/*/bin \
  /usr/lib/postgresql/*/bin \
  /usr/pgsql-*/bin
do
  [ -x "$d/initdb" ] && PGBIN="$d"
done
# Last resort: whatever is already on PATH.
if [ -z "$PGBIN" ] && command -v initdb >/dev/null 2>&1; then
  PGBIN="$(dirname "$(command -v initdb)")"
fi

if [ -z "$PGBIN" ]; then
  cat <<'NOPG'
⛔ No PostgreSQL SERVER binaries found. This script must create its own
   ephemeral cluster, so `initdb` is required — `psql` alone is not enough,
   and a client-only install will fail exactly here.

   Searched:
     /opt/homebrew/opt/postgresql@*/bin      (Homebrew, Apple silicon)
     /usr/local/opt/postgresql@*/bin         (Homebrew, Intel)
     /Applications/Postgres.app/.../bin      (Postgres.app)
     /usr/lib/postgresql/*/bin               (Debian/Ubuntu)
     /usr/pgsql-*/bin                        (RHEL/Fedora)
     $PATH

   On macOS:  brew install postgresql@16
   Or point at an existing install:  PGBIN=/path/to/bin bash <this script>
NOPG
  exit 1
fi
echo "  postgres       $PGBIN"
if [ "$(id -u)" -eq 0 ] && id postgres >/dev/null 2>&1; then
  as_pg() { su postgres -s /bin/bash -c "$*"; }; PG_OWNER=postgres
else
  as_pg() { bash -c "$*"; }; PG_OWNER="$(id -un)"
fi

mkdir -p "$RUN"; chown "$PG_OWNER" "$RUN" 2>/dev/null || true; chmod 1777 "$RUN"

# ⭐ TAKE CUSTODY, SO THE PROMISE IS TRUE. `cleanup()` removes $RUN on every
# exit path. Until the copy lives inside $RUN, "Ctrl-C destroys the copy" is a
# claim about a directory this script never touches — the export would outlive
# the witness on the caller's disk.
#
# The original is removed only AFTER the copy is verifiably in place: a failed
# move must never destroy the member's only copy of the export.
mkdir -p "$RUN/export"; chmod 700 "$RUN/export"
cp -p "$IN/." "$RUN/export/" 2>/dev/null || cp -Rp "$IN"/. "$RUN/export/"
if [ -f "$RUN/export/.wm-witness-export" ] && [ -f "$RUN/export/draft_sections.csv" ]; then
  rm -rf "$IN"
  echo "  custody       taken · original export removed · copy dies with this run"
else
  echo "⛔ could not take custody of the export — leaving the original untouched"
  exit 1
fi
IN="$RUN/export"
export PATH="$PGBIN:$PATH"

echo "[1/5] ephemeral PostgreSQL"
as_pg "'$PGBIN/initdb' -D '$RUN/pg' -U wm -A trust" >/dev/null 2>&1
as_pg "'$PGBIN/pg_ctl' -D '$RUN/pg' -o \"-k $RUN -p $PGPORT_LOCAL -h ''\" -l '$RUN/pg.log' start" >/dev/null
export DATABASE_URL="postgresql://wm@localhost:$PGPORT_LOCAL/$DB?host=$RUN"
createdb -h "$RUN" -p $PGPORT_LOCAL -U wm "$DB"
case "$DATABASE_URL" in *"$RUN"*) : ;; *) echo "⛔ not the ephemeral socket — refusing"; exit 1 ;; esac

echo "[2/5] schema from committed artifacts"
npm run db:bootstrap >"$RUN/bootstrap.log" 2>&1 || { echo "⛔ bootstrap failed"; tail -20 "$RUN/bootstrap.log"; exit 1; }
npm run db:migrate  >"$RUN/migrate.log"  2>&1 || { echo "⛔ migrate failed";  tail -20 "$RUN/migrate.log";  exit 1; }

echo "[3/5] load the witness copy, remapped to a witness member"
node -e "
const {hashPassword}=require('$ROOT/node_modules/bcryptjs')?{}:{};
" 2>/dev/null || true
npx tsx -e "
import { Client } from 'pg';
import { hashPassword } from '@/lib/auth/passwordUtils';
const db = new Client({ connectionString: process.env.DATABASE_URL });
(async () => {
  await db.connect();
  await db.query(\`INSERT INTO members (id, passkey, username, password_hash, name, onboarded, onboarding_step, password_algo)
                  VALUES (\\\$1,'SOULLAB-WM-WITNESS',\\\$2,\\\$3,'Whole Manuscript Witness',true,'complete','bcrypt')\`,
    ['$WITNESS_MEMBER', '$WITNESS_USER', await hashPassword('$WITNESS_PASS')]);
  await db.end();
})().catch(e => { console.error(e); process.exit(1); });
"

psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -q <<SQL
CREATE TEMP TABLE t_ms (id uuid, member_id uuid, title text, provenance text, source_custody text, created_at timestamptz);
CREATE TEMP TABLE t_src (id uuid, manuscript_id uuid, position int, heading text, body text);
CREATE TEMP TABLE t_dr (id uuid, manuscript_id uuid, member_id uuid, content text, base_source_hash text, revision_count int, version bigint, section_addressable_at timestamptz);
CREATE TEMP TABLE t_ds (id uuid, draft_id uuid, position int, text text, source_section_id uuid);
CREATE TEMP TABLE t_rev (draft_id uuid, revision_number int, content text, saved_by uuid, note text, created_at timestamptz);
\copy t_ms  FROM '$IN/manuscript.csv' CSV HEADER
\copy t_src FROM '$IN/source_sections.csv' CSV HEADER
\copy t_dr  FROM '$IN/draft.csv' CSV HEADER
\copy t_ds  FROM '$IN/draft_sections.csv' CSV HEADER
\copy t_rev FROM '$IN/revisions.csv' CSV HEADER

-- ⛔ The author's identity is NOT carried across. Every owning column becomes
-- the witness member: the copy is a reading of the book, not an impersonation
-- of the person who wrote it.
INSERT INTO member_manuscripts (id, member_id, title, provenance, source_custody, created_at)
  SELECT id, '$WITNESS_MEMBER', title, provenance, source_custody, created_at FROM t_ms;
INSERT INTO manuscript_sections (id, manuscript_id, position, heading, body) SELECT * FROM t_src;
INSERT INTO manuscript_working_drafts (id, manuscript_id, member_id, content, base_source_hash, revision_count, version, section_addressable_at)
  SELECT id, manuscript_id, '$WITNESS_MEMBER', content, base_source_hash, revision_count, version, section_addressable_at FROM t_dr;
INSERT INTO manuscript_draft_sections (id, draft_id, position, text, source_section_id) SELECT * FROM t_ds;
INSERT INTO working_draft_revisions (draft_id, revision_number, content, saved_by, note, created_at)
  SELECT draft_id, revision_number, content, '$WITNESS_MEMBER', note, created_at FROM t_rev;
SQL

psql "$DATABASE_URL" -tA -c "SELECT 'Work: '||coalesce(title,'(untitled)')||' · '||(SELECT count(*) FROM manuscript_draft_sections s JOIN manuscript_working_drafts d ON d.id=s.draft_id WHERE d.manuscript_id=m.id)||' addressable sections' FROM member_manuscripts m"
MID="$(psql "$DATABASE_URL" -tA -c 'SELECT id FROM member_manuscripts LIMIT 1')"
ADDRESSABLE="$(psql "$DATABASE_URL" -tA -c 'SELECT count(*) FROM manuscript_working_drafts WHERE section_addressable_at IS NOT NULL')"
if [ "$ADDRESSABLE" != "1" ]; then
  echo "⛔ the copied draft is NOT section-addressable — Whole Manuscript will not mount."
  echo "   §4b cannot be performed on this Work until it is converted. Nothing here converts it."
  exit 1
fi

echo "[4/5] build"
npm run build >"$RUN/build.log" 2>&1 || { echo "⛔ build failed"; tail -30 "$RUN/build.log"; exit 1; }

echo "[5/5] app on loopback :$APP_PORT"
if (exec 3<>/dev/tcp/127.0.0.1/$APP_PORT) 2>/dev/null; then
  exec 3>&- 3<&-; echo "⛔ something is already listening on :$APP_PORT"; exit 1
fi
# ⛔ `setsid` DOES NOT EXIST ON macOS, and the witness machine is a Mac. Bash
# job control gives the same guarantee portably: with `set -m`, each background
# job becomes its own process group led by the job's pid, so `kill -- -$pid`
# takes the whole tree. Without this the group kill is a no-op on the very
# machine the witness is meant to run on — and `kill $APP_PID` killing only the
# npm wrapper, orphaning `next start`, is exactly the defect that let one run
# silently attach to another run's server.
set -m
PORT=$APP_PORT npm run start >"$RUN/app.log" 2>&1 &
APP_PGID=$!
set +m
READY=0
for i in $(seq 1 60); do
  kill -0 -- "-$APP_PGID" 2>/dev/null || { echo "⛔ app died during startup"; tail -30 "$RUN/app.log"; exit 1; }
  curl -sf "http://127.0.0.1:$APP_PORT/api/health" >/dev/null 2>&1 && { READY=1; break; }
  sleep 2
done
[ "$READY" = 1 ] || { echo "⛔ app never became healthy"; tail -30 "$RUN/app.log"; exit 1; }

cat <<BANNER

────────────────────────────────────────────────────────────────
§4b WITNESS READY — implementation $SHA

  sign in   http://127.0.0.1:$APP_PORT/signin
            username  $WITNESS_USER
            password  $WITNESS_PASS
  the Work  http://127.0.0.1:$APP_PORT/writers-studio/canvas?m=$MID

THE EIGHT OBSERVATIONS — a machine cannot answer any of these.

  1   scroll from the start through far-off sections → keeps flowing
  2   type · scroll far away · scroll back → the words are there
  3   type · switch to SECTION · switch back → the words are there
  4   Backspace at a section start → "Sections stay separate here."
  5   rail click to a far section from a distant window → it arrives
  6a  the gold current row follows the observed manuscript place
  6b  \`s=\` follows the same observed manuscript place
  7   WHOLE MANUSCRIPT → SECTION → opens where you were reading

⚠️ Record each as PASS or FAIL, observation by observation, and preserve any
   spontaneous reaction verbatim. UNOBSERVABLE IS NOT PASS.
⛔ This runtime holds a copy of real member text. Ctrl-C when finished; the
   cluster and the copy are destroyed on exit.
────────────────────────────────────────────────────────────────

BANNER
echo "Ctrl-C to end the witness and destroy the copy."
while kill -0 -- "-$APP_PGID" 2>/dev/null; do sleep 5; done
