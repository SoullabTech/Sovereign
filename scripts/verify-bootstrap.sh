#!/usr/bin/env bash
# FALSIFIER for DB-EMPTY-BOOTSTRAP-01.
#
#   blank PostgreSQL database
#     -> canonical baseline + migration ledger
#     -> npm run db:migrate
#     -> schema invariants hold
#     -> app schema gate satisfied
#
# Nothing here may copy from maia_consciousness. Uses only committed artifacts.
set -euo pipefail

DB="${VERIFY_DB:-maia_bootstrap_verify_$$}"
BASELINE="database/baseline/0001_baseline_2026-09-01.sql"
MANIFEST="database/baseline/0001_baseline_2026-09-01.manifest"
export PGOPTIONS="${PGOPTIONS:-} -c client_min_messages=warning"
fails=0
note(){ printf '%s\n' "$*"; }
bad(){ printf '❌ %s\n' "$*"; fails=$((fails+1)); }

cleanup(){ dropdb --if-exists "$DB" >/dev/null 2>&1 || true; }
trap cleanup EXIT

note "🔎 1/5  baseline contains schema only"
if grep -qE '^\\(restrict|unrestrict) ' "$BASELINE"; then
  bad "baseline carries psql \\restrict meta-commands"
fi
# Dollar-quoted function bodies legitimately contain INSERT; strip them first.
python3 - "$BASELINE" <<'PY' || exit 1
import sys,re
s=open(sys.argv[1],encoding='utf-8',errors='replace').read()
s=re.sub(r'\$(\w*)\$.*?\$\1\$','',s,flags=re.S)      # function bodies
s=re.sub(r"'(?:[^']|'')*'","''",s)                    # string literals
hits=[l for l in s.splitlines() if re.match(r'^\s*(COPY|INSERT\s+INTO)\b',l,re.I)]
if hits:
    print("   data statements found in baseline:")
    for h in hits[:5]: print("     ",h[:90])
    sys.exit(1)
print("   ✓ no data statements outside function bodies")
PY

note "🔎 2/5  bootstrap a blank database"
dropdb --if-exists "$DB" >/dev/null 2>&1 || true
createdb "$DB"
export DATABASE_URL="postgresql:///$DB"
DATABASE_URL="$DATABASE_URL" bash scripts/bootstrap-database.sh >/dev/null

note "🔎 3/5  baseline loaded no rows (ledger excepted)"
rows="$(psql "$DATABASE_URL" -tAc "
  select coalesce(sum(n_live_tup),0) from pg_stat_user_tables
  where relname <> 'schema_migrations'")"
[ "$rows" = "0" ] && note "   ✓ 0 rows outside the migration ledger" \
                  || bad "baseline introduced $rows row(s) of data"

note "🔎 4/5  npm run db:migrate succeeds on the baselined database"
if DATABASE_URL="$DATABASE_URL" npm run --silent db:migrate >/tmp/vb_migrate.$$ 2>&1; then
  note "   ✓ migrations applied cleanly"
else
  bad "db:migrate failed:"; tail -15 /tmp/vb_migrate.$$
fi
rm -f /tmp/vb_migrate.$$

note "🔎 5/5  app schema gate satisfied"
while read -r line; do
  case "$line" in ''|\#*) continue ;; esac
  present="$(psql "$DATABASE_URL" -tAc \
    "select count(*) from schema_migrations where filename='$line'")"
  [ "$present" = "1" ] || bad "required migration not recorded: $line"
done < database/required_migrations.txt
[ "$fails" = "0" ] && note "   ✓ every required migration present"

# Ledger rows alone are not proof the schema is usable; assert the relations the
# gate's required migrations actually depend on.
for t in members auth_sessions agent_runs integration_passes team_channels \
         developmental_memories studio_people manuscript_draft_sections; do
  [ "$(psql "$DATABASE_URL" -tAc "select to_regclass('public.$t') is not null")" = "t" ] \
    || bad "core relation missing after bootstrap: $t"
done

echo
if [ "$fails" = "0" ]; then
  echo "✅ BOOTSTRAP VERIFIED — a blank PostgreSQL database became a bootable MAIA schema."
else
  echo "❌ BOOTSTRAP FAILED — $fails check(s) failed."
  exit 1
fi
