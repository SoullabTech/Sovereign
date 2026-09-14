#!/usr/bin/env bash
# STEP 1 · schema lane — FALSIFICATION OF THE WITNESS.
#
# ⭐ THE WITNESS IS THE THING UNDER TEST HERE, not the schema. For each known-bad
# schema this rebuilds the database from a MUTATED migration and requires the
# witness to go RED, naming which facts caught it.
#
# ⛔ A MUTATION THAT PASSES IS THE RESULT THAT MATTERS. It means the witness is
# not testing the property it claims to test — and in this lane that has already
# happened three times (M32, M6, and a "cycle" test that was test 3 again).
#
# ⛔ DISPOSABLE CLUSTER ONLY — the same refusal as the witness.
set -u
PGH="${PGH:-/tmp}"; PGP="${PGP:-5599}"; PGU="${PGU:-postgres}"; PGDB="${PGDB:-succession_witness}"
case "$PGDB" in *witness*) ;; *) echo "REFUSED · '$PGDB' is not a witness database."; exit 2;; esac

MIG="$(cd "$(dirname "$0")/../.." && pwd)/database/migrations/20260914000001_proposal_succession.sql"
WIT="$(cd "$(dirname "$0")" && pwd)/step1-succession-schema-witness.sh"
WORK="$(mktemp -d)"; trap 'rm -rf "$WORK"' EXIT

KILLED=0; SURVIVED=0

# $1 label   $2 python transform body operating on `s`
mutate() {
  local label="$1" transform="$2"
  python3 - "$MIG" "$WORK/m.sql" "$transform" <<'PY'
import sys
src, dst, transform = sys.argv[1], sys.argv[2], sys.argv[3]
s = open(src).read()
before = s
ns = {'s': s}
exec(transform, ns)
s = ns['s']
if s == before:
    sys.stderr.write("NO-OP MUTATION\n"); sys.exit(3)
open(dst, 'w').write(s)
PY
  if [ $? -ne 0 ]; then
    printf '  ⛔ NO-OP  %s\n     -> the mutation changed nothing; it proves nothing\n' "$label"
    SURVIVED=$((SURVIVED+1)); return
  fi
  psql -h "$PGH" -p "$PGP" -U "$PGU" -d postgres -q \
    -c "DROP DATABASE IF EXISTS $PGDB;" -c "CREATE DATABASE $PGDB;" >/dev/null 2>&1
  psql -h "$PGH" -p "$PGP" -U "$PGU" -d "$PGDB" -q -v ON_ERROR_STOP=1 \
    -c 'CREATE TABLE members (id uuid PRIMARY KEY DEFAULT gen_random_uuid());' \
    -c "INSERT INTO members (id) VALUES ('11111111-1111-1111-1111-111111111111');" >/dev/null 2>&1
  if ! psql -h "$PGH" -p "$PGP" -U "$PGU" -d "$PGDB" -q -v ON_ERROR_STOP=1 -f "$WORK/m.sql" >/dev/null 2>&1; then
    # A mutation the DATABASE refuses is still a kill, but say so plainly — it
    # was not the witness that caught it.
    printf '  KILLED  %s\n            (by the database: the mutated migration will not apply)\n' "$label"
    KILLED=$((KILLED+1)); return
  fi
  local out; out="$(PGH="$PGH" PGP="$PGP" PGU="$PGU" PGDB="$PGDB" bash "$WIT" 2>&1)"
  if printf '%s' "$out" | grep -q '^  FAIL'; then
    printf '  KILLED  %s\n' "$label"
    printf '%s\n' "$out" | grep '^  FAIL' | sed 's/^  FAIL  /            caught by: /'
    KILLED=$((KILLED+1))
  else
    printf '  ⛔ SURVIVED  %s\n     -> the witness is GREEN against a schema known to be wrong\n' "$label"
    SURVIVED=$((SURVIVED+1))
  fi
}

echo "── STEP 1 · witness falsification ───────────────────────────"

mutate "M1 · the predecessor FK becomes DEFERRABLE INITIALLY DEFERRED" \
"s = s.replace('    REFERENCES proposal_versions (chain_id, id)\n    ON DELETE RESTRICT,',
               '    REFERENCES proposal_versions (chain_id, id)\n    ON DELETE RESTRICT DEFERRABLE INITIALLY DEFERRED,')"

mutate "M2 · the one-successor index is dropped (branching becomes legal)" \
"import re; s = re.sub(r'CREATE UNIQUE INDEX IF NOT EXISTS proposal_versions_one_successor.*?WHERE supersedes IS NOT NULL;', '', s, flags=re.S)"

mutate "M3 · the one-root index is dropped (a chain may have two beginnings)" \
"import re; s = re.sub(r'CREATE UNIQUE INDEX IF NOT EXISTS proposal_versions_one_root.*?WHERE supersedes IS NULL;', '', s, flags=re.S)"

mutate "M4 · version immutability stops covering DELETE" \
"s = s.replace('  BEFORE UPDATE OR DELETE ON proposal_versions', '  BEFORE UPDATE ON proposal_versions')"

mutate "M5 · the no-self-predecessor CHECK is removed" \
"import re; s = re.sub(r'  CONSTRAINT proposal_versions_no_self_predecessor\n    CHECK \(supersedes IS NULL OR supersedes <> id\)', '  CONSTRAINT proposal_versions_no_self_predecessor\n    CHECK (true)', s)"

mutate "M6 · the predecessor FK stops being chain-scoped" \
"s = s.replace('    FOREIGN KEY (chain_id, supersedes)\n    REFERENCES proposal_versions (chain_id, id)',
               '    FOREIGN KEY (supersedes)\n    REFERENCES proposal_versions (id)')"

mutate "M7 · a stored superseded_by column is added back" \
"s = s.replace('  supersedes  uuid,', '  supersedes  uuid,\n  superseded_by uuid,')"

# ── The two obligations added by the 2026-09-14 founder review. ──────────────
mutate "M8 · chain immutability reverts to locus-only (THE MERGE BLOCKER)" \
"s = s.replace('''CREATE OR REPLACE FUNCTION refuse_proposal_chain_mutation()
RETURNS trigger AS \$\$
BEGIN
  RAISE EXCEPTION''', '''CREATE OR REPLACE FUNCTION refuse_proposal_chain_mutation()
RETURNS trigger AS \$\$
BEGIN
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  IF NEW.work_id IS NOT DISTINCT FROM OLD.work_id
     AND NEW.draft_id IS NOT DISTINCT FROM OLD.draft_id
     AND NEW.base_version IS NOT DISTINCT FROM OLD.base_version
     AND NEW.target_section_id IS NOT DISTINCT FROM OLD.target_section_id
     AND NEW.expected_text IS NOT DISTINCT FROM OLD.expected_text
  THEN RETURN NEW; END IF;
  RAISE EXCEPTION''')"

mutate "M9 · the rationale CHECK is removed ('' becomes a third durable state)" \
"s = s.replace(\"  rationale   text CHECK (rationale IS NULL OR length(btrim(rationale)) > 0),\", '  rationale   text,')"

echo
echo "  $KILLED killed · $SURVIVED survived"
[ "$SURVIVED" -eq 0 ] || exit 1
