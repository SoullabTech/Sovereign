#!/bin/sh
# PT-3 §IV — PHASE 2: activate constrained runtime authority. PRODUCTION HOST. POST-MIGRATION ONLY.
#
# AUTHORITY. Founder ruling, Writer's Studio, 2026-09-08 §IV–§VII (B13, B15, B16).
#
#   ssh soullab@minisforum 'sh -s' < scripts/witness/pt3-activate-runtime-authority.sh
#
# ⛔ IT REFUSES TO RUN UNTIL `maia_app` EXISTS (B13). The migration creates that role; configuring it
# beforehand was not merely early, it could not succeed. This is the second half of the temporal law:
#
#   preserve migration authority → CREATE constrained role → credential it →
#   remove owner runtime authority → restart runtime
#
# SECRET CUSTODY (§V, §VI)
#   generated only     a 40-character hex credential. Hex is SQL-literal-safe AND URI-safe by
#                      construction, which is why the arbitrary-password path is GONE (B16):
#                      stdin-safe is not SQL-literal-safe, and percent-encoding the URI afterwards
#                      does nothing about a quote inside the ALTER ROLE statement. A generated
#                      credential removes the class of defect instead of escaping around it.
#   never in argv      the SQL reaches psql on stdin
#   never in history   this is a file piped over ssh
#   backup outside     the repository (B15), mode-700 directory, mode-600 file
#   never printed      it reports the ROLE and file modes, never a password or a URL

set -eu

PROJECT="${PROJECT_DIR:-$HOME/MAIA-SOVEREIGN}"
ENVPROD="$PROJECT/.env.production"
BACKUP_DIR="${PT3_BACKUP_DIR:-$HOME/.pt3-cutover}"
DB="${PT3_DB:-maia_consciousness}"
PGC="${PT3_PG_CONTAINER:-maia-postgres}"

[ -r "$ENVPROD" ] || { echo "ABORT — $ENVPROD not readable." >&2; exit 1; }
cd "$PROJECT"

# ── B13: the role must already exist ─────────────────────────────────────────
EXISTS=$(docker exec "$PGC" psql -U soullab -d "$DB" -tAc \
  "SELECT count(*) FROM pg_roles WHERE rolname='maia_app'" 2>/dev/null || echo 0)
if [ "$EXISTS" != "1" ]; then
  echo "ABORT — maia_app does not exist. The PT-3 migration creates it; run the migration first." >&2
  echo "        Configuring a role before the act that creates it is B13, and it cannot succeed." >&2
  exit 1
fi
SUPER=$(docker exec "$PGC" psql -U soullab -d "$DB" -tAc \
  "SELECT rolsuper::text FROM pg_roles WHERE rolname='maia_app'" 2>/dev/null || echo '?')
[ "$SUPER" = "f" ] || { echo "ABORT — maia_app is a superuser ($SUPER); the boundary would be inert." >&2; exit 1; }
echo "OK    maia_app exists and is not a superuser"

# ── B15: the backup destination, proven protected, outside the repository ────
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || echo "$PROJECT")
case "$BACKUP_DIR" in
  "$REPO_ROOT"|"$REPO_ROOT"/*)
    echo "ABORT — the backup directory is inside the repository ($BACKUP_DIR)." >&2
    echo "        An owner credential must not sit where it could become a committable file." >&2
    exit 1 ;;
esac
mkdir -p "$BACKUP_DIR"; chmod 700 "$BACKUP_DIR"
echo "OK    backup directory is outside the repository, mode $(stat -c '%a' "$BACKUP_DIR" 2>/dev/null || echo '?')"

git check-ignore -q .env.production 2>/dev/null || {
  echo "ABORT — .env.production is not gitignored." >&2; exit 1; }
echo "OK    .env.production is gitignored"

# ── B16: generated only. No arbitrary-password path exists. ──────────────────
PW=$(head -c 64 /dev/urandom | od -An -tx1 | tr -d ' \n' | cut -c1-40)
case "$PW" in
  *[!0-9a-f]*|"") echo "ABORT — credential generation produced a non-hex value." >&2; exit 1 ;;
esac
[ "$(printf '%s' "$PW" | wc -c)" -eq 40 ] || { echo "ABORT — credential length wrong." >&2; exit 1; }
echo "OK    generated a 40-character hex credential — SQL-literal-safe and URI-safe by construction"

# ── set it, on stdin, never in argv ──────────────────────────────────────────
printf "ALTER ROLE maia_app WITH LOGIN PASSWORD '%s';\n" "$PW" \
  | docker exec -i "$PGC" psql -U soullab -d "$DB" -q -v ON_ERROR_STOP=1 >/dev/null
echo "OK    maia_app credential set (SQL delivered on stdin)"

# ── move runtime from owner authority to constrained authority ───────────────
umask 077
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
cp -p "$ENVPROD" "$BACKUP_DIR/env.production.$STAMP"
chmod 600 "$BACKUP_DIR/env.production.$STAMP"
echo "OK    previous .env.production backed up to $BACKUP_DIR/env.production.$STAMP (mode 600)"

# §V (B28) — OWNER AUTHORITY IS NOT A VARIABLE NAME. It is any credential material sufficient to
# authenticate as the owner. Removing DATABASE_URL while leaving POSTGRES_PASSWORD behind left every
# runtime service holding the owner's password: the pools chose maia_app, but the processes remained
# CAPABLE of being the owner, and several pools still support POSTGRES_* fallback whose default user
# is `soullab`. Selection is not incapability.
TMP=$(mktemp "$PROJECT/.env.production.pt3.XXXXXX")
grep -v -E '^(DATABASE_URL|MAIA_APP_DATABASE_URL|POSTGRES_PASSWORD|MIGRATE_DATABASE_URL)=' "$ENVPROD" > "$TMP"
printf 'MAIA_APP_DATABASE_URL=postgresql://maia_app:%s@postgres:5432/%s\n' "$PW" "$DB" >> "$TMP"
chmod 600 "$TMP"; mv "$TMP" "$ENVPROD"
unset PW
echo "OK    .env.production carries MAIA_APP_DATABASE_URL and no owner material at all"
echo "      (removed: DATABASE_URL, POSTGRES_PASSWORD, MIGRATE_DATABASE_URL)"
for f in .env.migrate .env.postgres; do
  [ -s "$PROJECT/$f" ] || echo "WARN  $PROJECT/$f is missing or empty — postgres/migrate would lose authority"
done

echo
echo "resolved runtime role : $(docker exec -i "$PGC" psql -U soullab -d "$DB" -tAc \
  "SELECT rolname FROM pg_roles WHERE rolname='maia_app'" 2>/dev/null || echo '<not found>')"
echo "runtime secret file   : $ENVPROD (mode $(stat -c '%a' "$ENVPROD" 2>/dev/null || echo '?'))"
echo "migrate secret file   : $PROJECT/.env (mode $(stat -c '%a' "$PROJECT/.env" 2>/dev/null || echo '?'))"
echo
echo "No password and no connection URL was printed. Restart the runtime services next."
