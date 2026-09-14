#!/usr/bin/env bash
# STEP 2 · schema lane — FALSIFICATION OF THE WITNESS.
#
# ⭐ THE WITNESS IS WHAT IS UNDER TEST. For each known-bad schema this rebuilds
# the database from a mutated migration set and requires the witness to go RED,
# naming which facts caught it.
#
# ⛔ A SURVIVOR IS THE RESULT THAT MATTERS, and a NO-OP mutation is reported as a
# survivor, never a kill — this programme has written four no-ops so far, most
# recently inside this very witness.
set -u
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PGH="${PGH:-/tmp}"; PGP="${PGP:-5599}"; PGU="${PGU:-postgres}"; PGDB="${PGDB:-step2_witness}"
case "$PGDB" in *witness*) ;; *) echo "REFUSED · '$PGDB' is not a witness database."; exit 2;; esac
MIGS="$ROOT/database/migrations"
WORK="$(mktemp -d)"; trap 'rm -rf "$WORK"' EXIT
KILLED=0; SURVIVED=0

SET="20260914000001_proposal_succession 20260914000002_manuscript_revision_offers
     20260914000003_proposal_chains_member_identity 20260914000004_manuscript_revision_authorizations"

mutate() { # $1 label  $2 migration basename  $3 python transform on `s`
  local label="$1" target="$2"
  rm -rf "$WORK/m"; mkdir -p "$WORK/m"
  for m in $SET; do cp "$MIGS/$m.sql" "$WORK/m/$m.sql"; done
  if ! python3 - "$WORK/m/$target.sql" "$3" <<'PY'
import sys
path, transform = sys.argv[1], sys.argv[2]
s = open(path).read(); before = s
ns = {'s': s}; exec(transform, ns); s = ns['s']
if s == before:
    sys.stderr.write("NO-OP\n"); sys.exit(3)
open(path, 'w').write(s)
PY
  then
    printf '  ⛔ NO-OP  %s\n     -> the mutation changed nothing; it proves nothing\n' "$label"
    SURVIVED=$((SURVIVED+1)); return
  fi
  psql -h "$PGH" -p "$PGP" -U "$PGU" -d postgres -q \
    -c "DROP DATABASE IF EXISTS $PGDB;" -c "CREATE DATABASE $PGDB;" >/dev/null 2>&1
  psql -h "$PGH" -p "$PGP" -U "$PGU" -d "$PGDB" -q -v ON_ERROR_STOP=1 -f /tmp/step2_stubs.sql >/dev/null 2>&1
  for m in $SET; do
    psql -h "$PGH" -p "$PGP" -U "$PGU" -d "$PGDB" -q -v ON_ERROR_STOP=1 -f "$WORK/m/$m.sql" >/dev/null 2>&1 || true
  done
  local out; out="$(PGDB="$PGDB" bash "$ROOT/scripts/witness/step2-authorization-schema-witness.sh" 2>&1)"
  if printf '%s' "$out" | grep -q '^  FAIL'; then
    printf '  KILLED  %s\n' "$label"
    printf '%s\n' "$out" | grep '^  FAIL' | sed 's/^  FAIL  /            caught by: /'
    KILLED=$((KILLED+1))
  else
    printf '  ⛔ SURVIVED  %s\n     -> the witness is GREEN against a schema known to be wrong\n' "$label"
    SURVIVED=$((SURVIVED+1))
  fi
}

echo "── STEP 2 · witness falsification ───────────────────────────"

mutate "M-owner · the ownership relationship is dropped" \
  20260914000004_manuscript_revision_authorizations \
"import re; s = re.sub(r'  CONSTRAINT mra_member_owns_chain\n    FOREIGN KEY \(member_id, proposal_chain_id\)\n    REFERENCES proposal_chains \(member_id, id\)\n    ON DELETE RESTRICT,\n', '', s)"

mutate "M-owner2 · ownership compressed to a bare chain reference" \
  20260914000004_manuscript_revision_authorizations \
"s = s.replace('''    FOREIGN KEY (member_id, proposal_chain_id)
    REFERENCES proposal_chains (member_id, id)''', '''    FOREIGN KEY (proposal_chain_id)
    REFERENCES proposal_chains (id)''')"

mutate "M-version · the composite version FK weakens to version_id alone" \
  20260914000004_manuscript_revision_authorizations \
"s = s.replace('''    FOREIGN KEY (proposal_chain_id, proposal_version_id)
    REFERENCES proposal_versions (chain_id, id)''', '''    FOREIGN KEY (proposal_version_id)
    REFERENCES proposal_versions (id)''')"

mutate "M-cascade-version · the version FK becomes CASCADE" \
  20260914000004_manuscript_revision_authorizations \
"s = s.replace('''    REFERENCES proposal_versions (chain_id, id)
    ON DELETE RESTRICT''', '''    REFERENCES proposal_versions (chain_id, id)
    ON DELETE CASCADE''')"

mutate "M-receipt · accepted_at is permitted without resulting_version" \
  20260914000004_manuscript_revision_authorizations \
"s = s.replace('''  CONSTRAINT mra_receipt_whole
    CHECK ((accepted_at IS NULL) = (resulting_version IS NULL)),''', '''  CONSTRAINT mra_receipt_whole CHECK (true),''')"

mutate "M-promotion · identity and binding become mutable" \
  20260914000004_manuscript_revision_authorizations \
"import re; s = re.sub(r'IF NEW[.]id .*?THEN', 'IF false THEN', s, flags=re.S, count=1)"

mutate "M-secondrun · a spent receipt may be executed again" \
  20260914000004_manuscript_revision_authorizations \
"s = s.replace('''  IF OLD.accepted_at IS NULL AND NEW.accepted_at IS NOT NULL THEN
    RETURN NEW;
  END IF;''', '''  RETURN NEW;''')"

mutate "M-operation · the operation vocabulary opens" \
  20260914000004_manuscript_revision_authorizations \
"s = s.replace(\"CHECK (operation = 'replace_exact_text')\", \"CHECK (operation IN ('replace_exact_text','insert_text'))\")"

mutate "M-offer-authority · the offer acquires execution capability" \
  20260914000002_manuscript_revision_offers \
"s = s.replace('  declined_at timestamptz,', '  declined_at timestamptz,\n  accepted_at timestamptz,\n  resulting_version integer,')"

mutate "M-offer-succession · the offer acquires a succession column" \
  20260914000002_manuscript_revision_offers \
"s = s.replace('  declined_at timestamptz,', '  declined_at timestamptz,\n  supersedes uuid,')"

mutate "M-offer-freeze · the offer's provenance becomes editable" \
  20260914000002_manuscript_revision_offers \
"import re; s = re.sub(r'DROP TRIGGER IF EXISTS manuscript_revision_offers_freeze_check\n  ON manuscript_revision_offers;\nCREATE TRIGGER manuscript_revision_offers_freeze_check\n  BEFORE UPDATE ON manuscript_revision_offers\n  FOR EACH ROW EXECUTE FUNCTION [a-z_]+\(\);\n', '', s)"

mutate "M-chain-unique · the supporting UNIQUE(member_id,id) is removed" \
  20260914000003_proposal_chains_member_identity \
"import re; s = re.sub(r'    ALTER TABLE proposal_chains\n      ADD CONSTRAINT proposal_chains_member_id_id_key UNIQUE \(member_id, id\);', '    PERFORM 1;', s)"

echo
echo "  $KILLED killed · $SURVIVED survived"
[ "$SURVIVED" -eq 0 ] || exit 1
