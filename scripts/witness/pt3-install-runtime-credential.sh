#!/bin/sh
# PT-3 §V (B10) — install the constrained runtime credential. RUNS ON THE PRODUCTION HOST.
#
# AUTHORITY. Founder ruling, Writer's Studio, 2026-09-08 §V, §X.3.
#
#   ssh -t soullab@minisforum 'sh -s' < scripts/witness/pt3-install-runtime-credential.sh
#
# THE LAW IT IMPLEMENTS (§V, corrected): the runtime credential may exist only in a deliberately
# protected secret-bearing runtime location. It may not appear in source control, migration SQL,
# documentation, command history, process arguments, witness output, or other evidentiary artifacts.
#
# HOW EACH IS SATISFIED
#   no echo            `read -r` with `stty -echo`; or generated and never printed
#   not in argv        the password reaches psql through STDIN, never as a command argument
#   not in history     this is a script file piped over ssh; no interactive command contains it
#   URI-safe           percent-encoded before it is placed in a connection URI
#   protected location `.env.production` written with umask 077, verified gitignored
#   never printed      the script prints the ROLE and the file, never the password or the URL
#
# It changes two things and nothing else:
#   .env.production   DATABASE_URL (owner) removed · MAIA_APP_DATABASE_URL (constrained) added
#   ~/.../.env        MIGRATE_DATABASE_URL (owner) added, for the migrate service alone

set -eu

PROJECT="${PROJECT_DIR:-$HOME/MAIA-SOVEREIGN}"
ENVPROD="$PROJECT/.env.production"
ENVCOMPOSE="$PROJECT/.env"
DB="${PT3_DB:-maia_consciousness}"
PGC="${PT3_PG_CONTAINER:-maia-postgres}"

[ -r "$ENVPROD" ] || { echo "ABORT — $ENVPROD not readable." >&2; exit 1; }

# §X.3 — the destination must not be source-controlled.
cd "$PROJECT"
if ! git check-ignore -q .env.production 2>/dev/null; then
  echo "ABORT — .env.production is NOT gitignored. Refusing to write a credential to a tracked path." >&2
  exit 1
fi
if ! git check-ignore -q .env 2>/dev/null; then
  echo "ABORT — .env is NOT gitignored. Refusing to write a credential to a tracked path." >&2
  exit 1
fi
echo "OK    both credential destinations are gitignored"

# ── the password ──────────────────────────────────────────────────────────────
# Default: generate a URL-safe one. Nothing to type, nothing to mistype, and no character that
# would need encoding — which removes the whole class of URI-corruption defects rather than
# handling it. A founder-supplied password is still accepted and is percent-encoded below.
if [ "${PT3_PROMPT_FOR_PASSWORD:-0}" = "1" ]; then
  printf 'maia_app password (not echoed): ' >&2
  stty -echo 2>/dev/null || true
  read -r PW
  stty echo 2>/dev/null || true
  printf '\n' >&2
  [ -n "$PW" ] || { echo "ABORT — empty password." >&2; exit 1; }
else
  PW=$(head -c 48 /dev/urandom | od -An -tx1 | tr -d ' \n' | cut -c1-40)
  echo "OK    generated a 40-character hex credential (URI-safe by construction, never printed)"
fi

# ── percent-encode for the URI (§X.3) ─────────────────────────────────────────
# Unreserved characters pass; everything else becomes %XX. POSIX only — no python on the path.
encode() {
  printf '%s' "$1" | od -An -tx1 -v | tr -s ' ' '\n' | grep -v '^$' | while read -r h; do
    c=$(printf "\\$(printf '%03o' "0x$h")")
    case "$c" in
      [A-Za-z0-9._~-]) printf '%s' "$c" ;;
      *)               printf '%%%s' "$(printf '%s' "$h" | tr 'a-f' 'A-F')" ;;
    esac
  done
}
PW_ENC=$(encode "$PW")

# ── set it in PostgreSQL, via STDIN so it never becomes a process argument ────
printf "ALTER ROLE maia_app WITH LOGIN PASSWORD '%s';\n" "$PW" \
  | docker exec -i "$PGC" psql -U soullab -d "$DB" -q -v ON_ERROR_STOP=1 >/dev/null
echo "OK    maia_app credential set (SQL delivered on stdin, never in argv)"

# ── write the runtime credential where every service already loads from ──────
OWNER_URL=$(grep -E '^DATABASE_URL=' "$ENVPROD" | head -1 | cut -d= -f2- || true)
[ -n "$OWNER_URL" ] || echo "NOTE  no DATABASE_URL found in .env.production (already cut over?)"

umask 077
TMP=$(mktemp "$PROJECT/.env.production.pt3.XXXXXX")
grep -v -E '^(DATABASE_URL|MAIA_APP_DATABASE_URL)=' "$ENVPROD" > "$TMP"
printf 'MAIA_APP_DATABASE_URL=postgresql://maia_app:%s@postgres:5432/%s\n' "$PW_ENC" "$DB" >> "$TMP"
chmod 600 "$TMP"
cp -p "$ENVPROD" "$ENVPROD.pt3-backup"
mv "$TMP" "$ENVPROD"
echo "OK    .env.production now carries MAIA_APP_DATABASE_URL and no DATABASE_URL"
echo "      (previous file kept at .env.production.pt3-backup, mode 600)"

# ── give migrate its owner credential, in Compose's interpolation file only ───
if [ -n "$OWNER_URL" ]; then
  touch "$ENVCOMPOSE"; chmod 600 "$ENVCOMPOSE"
  TMP2=$(mktemp "$PROJECT/.env.pt3.XXXXXX")
  grep -v -E '^MIGRATE_DATABASE_URL=' "$ENVCOMPOSE" > "$TMP2" || true
  printf 'MIGRATE_DATABASE_URL=%s\n' "$OWNER_URL" >> "$TMP2"
  chmod 600 "$TMP2"; mv "$TMP2" "$ENVCOMPOSE"
  echo "OK    MIGRATE_DATABASE_URL written to .env for the migrate service alone"
fi

unset PW PW_ENC OWNER_URL

# ── report identity only, never the credential ───────────────────────────────
echo
echo "resolved runtime role : $(docker exec -i "$PGC" psql -U soullab -d "$DB" -tAc \
  "SELECT rolname FROM pg_roles WHERE rolname='maia_app'" 2>/dev/null || echo '<not found>')"
echo "runtime secret file   : $ENVPROD (mode $(stat -c '%a' "$ENVPROD" 2>/dev/null || echo '?'))"
echo "migrate secret file   : $ENVCOMPOSE (mode $(stat -c '%a' "$ENVCOMPOSE" 2>/dev/null || echo '?'))"
echo
echo "Neither the password nor any connection URL was printed."
