#!/usr/bin/env bash
# A1-LS0 · E1 provisioning instrument.
# Fresh synthetic database → migration-sufficiency run → synthetic identity.
# Usage: ls0-e1-provision.sh <canonical_root> <out_dir>
# Writes <out_dir>/identity.env (synthetic member id + session token).
set -euo pipefail
ROOT="$1"; OUT="$2"
HERE="$(cd "$(dirname "$0")" && pwd)"
ADMIN="postgresql://postgres@127.0.0.1:55432/postgres"
DB="postgresql://soullab@127.0.0.1:55432/maia_consciousness"
mkdir -p "$OUT/migrations"

psql "$ADMIN" -q -X -v ON_ERROR_STOP=1 <<'SQL'
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'maia_consciousness' AND pid <> pg_backend_pid();
DROP DATABASE IF EXISTS maia_consciousness;
CREATE DATABASE maia_consciousness OWNER soullab ENCODING 'UTF8';
SQL

bash "$HERE/ls0-e1-migrate.sh" "$ROOT" "$DB" "$OUT/migrations" | tee "$OUT/migrations/summary.txt"

# Synthetic identities only. Nothing here resembles or derives from a real member.
# Member A serves S1, S2, S4–S9. Member B serves S3 alone, because Home composes
# itself from ALL of a member's writing and S3 must observe one Work in isolation.
mk_member() {
  local tag="$1" id token
  id="$(psql "$DB" -qtAX -v ON_ERROR_STOP=1 -c "INSERT INTO members (passkey, username, password_hash, name, onboarded) VALUES ('LS0-E1-SYNTHETIC-$tag', 'ls0-e1-synthetic-writer-$tag', 'ls0-e1-no-password', 'LS0 Synthetic Writer $tag', true) RETURNING id")"
  token="ls0e1$(head -c 24 /dev/urandom | od -An -tx1 | tr -d ' \n')"
  psql "$DB" -qX -v ON_ERROR_STOP=1 -c "INSERT INTO auth_sessions (member_id, session_token, expires_at) VALUES ('$id', '$token', now() + interval '1 day')"
  printf 'LS0_MEMBER_%s_ID=%s\nLS0_SESSION_%s_TOKEN=%s\n' "$tag" "$id" "$tag" "$token"
}
{ mk_member A; mk_member B; } > "$OUT/identity.env"
echo "members=2"
