#!/usr/bin/env bash
# STEP 2 · runtime seam — FALSIFICATION OF THE WITNESS.
# ⛔ A survivor is the result that matters; a NO-OP is reported as a survivor.
set -u
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
: "${DATABASE_URL:?must name a disposable witness database}"
STORE="$ROOT/lib/manuscript/revisionAuthorization/store.ts"
EXEC="$ROOT/lib/manuscript/revisionAuthorization/execute.ts"
BK="$(mktemp -d)"; cp "$STORE" "$BK/store.ts"; cp "$EXEC" "$BK/execute.ts"
restore() { cp "$BK/store.ts" "$STORE"; cp "$BK/execute.ts" "$EXEC"; rm -rf "$BK"; }
trap restore EXIT
KILLED=0; SURVIVED=0

mutate() { # $1 label  $2 file  $3 transform
  cp "$BK/store.ts" "$STORE"; cp "$BK/execute.ts" "$EXEC"
  if ! python3 - "$2" "$3" <<'PY'
import sys
path, t = sys.argv[1], sys.argv[2]
s = open(path).read(); before = s
ns = {'s': s}; exec(t, ns); s = ns['s']
if s == before: sys.stderr.write("NO-OP\n"); sys.exit(3)
open(path, 'w').write(s)
PY
  then printf '  ⛔ NO-OP  %s\n' "$1"; SURVIVED=$((SURVIVED+1)); return; fi
  bash "$ROOT/scripts/witness/step2-rebuild-db.sh" >/dev/null 2>&1
  local out; out="$(cd "$ROOT" && npx tsx scripts/witness/step2-runtime-seam-witness.ts 2>/dev/null)"
  # ⛔ A mutation that makes the witness CRASH is not a kill. The first harness
  # reported it as SURVIVED, which was conservatively safe but uninformative:
  # "no FAIL lines" is true both when the witness passed and when it never ran.
  if ! printf '%s' "$out" | grep -q 'passed ·'; then
    printf '  ⛔ CRASHED  %s\n     -> the witness never completed; this proves nothing either way\n' "$1"
    SURVIVED=$((SURVIVED+1)); return
  fi
  if printf '%s' "$out" | grep -q '^  FAIL'; then
    printf '  KILLED  %s\n' "$1"
    printf '%s\n' "$out" | grep '^  FAIL' | sed 's/^  FAIL  /            caught by: /'
    KILLED=$((KILLED+1))
  else
    printf '  ⛔ SURVIVED  %s\n' "$1"; SURVIVED=$((SURVIVED+1))
  fi
}

echo "── STEP 2 · runtime seam falsification ──────────────────────"

# ⚠️ R1 and R3 were first written as text surgery that produced code which did
# not compile. The harness reported CRASHED / SURVIVED — correctly, since a witness
# that never ran proves nothing — but a mutation must be a WORKING known-bad
# implementation, not a syntax error.
mutate "R1 · the authorizing Work read leaves the transaction (pool queries)" "$STORE" \
"s = s.replace('await tx.query<{ id: string; version: string }>', 'await query<{ id: string; version: string }>').replace('await tx.query<{ id: string; text: string; heading: string | null }>', 'await query<{ id: string; text: string; heading: string | null }>')"

mutate "R2 · the draft read drops FOR UPDATE" "$STORE" \
"s = s.replace('AND member_id = \$3 FOR UPDATE\`,\n    [chain.locus.draftId', 'AND member_id = \$3\`,\n    [chain.locus.draftId')"

# ⚠️ NO BACKTICKS IN THIS TRANSFORM. The first version used a template literal,
# and inside a bash double-quoted string a backtick is COMMAND SUBSTITUTION — so
# the mutation text was mangled before python ever saw it and the harness
# reported CRASHED. Run by hand, R3 is caught by E1c and E3.
mutate "R3 · execution inspects the Work BEFORE the authorization" "$EXEC" \
"s = s.replace('    const a = await tx.query(', '    await tx.query(\"SELECT version FROM manuscript_working_drafts LIMIT 1\");\n    const a = await tx.query(', 1)"

mutate "R4 · the store hydrates rows itself again, bypassing the contract" "$STORE" \
"s = s.replace('  const hydrated = hydrateAuthorization(plain);\n  if (!hydrated) {\n    throw new Error(\n      \`authorization \${r.id} could not be read truthfully from its durable row\`);\n  }\n  return hydrated;', '  return plain as unknown as RevisionAuthorization;')"

mutate "R5 · execution refuses early instead of reaching the write" "$EXEC" \
"s = s.replace(\"    if (auth.acceptedAt !== null) return no('already_spent');\", \"    if (auth.acceptedAt !== null) return no('already_spent');\n    if (process.env.NODE_ENV !== 'never') return no('stale_base');\")"

# ⚠️ THE DOLLARS ARE ESCAPED. Inside a bash double-quoted string `$1` is a
# POSITIONAL PARAMETER, and under `set -u` an unbound one aborts the harness —
# which is how the first R6 killed the whole run instead of the mutant.
mutate "R6 · the minted identity and time are replaced by database defaults" "$STORE" \
"s = s.replace('(id, member_id, proposal_chain_id', '(member_id, proposal_chain_id').replace('VALUES (\$1, \$2, \$3, \$4, \$5, \$6, \$7, \$8, \$9, \$10)', 'VALUES (\$1, \$2, \$3, \$4, \$5, \$6, \$7, \$8)').replace('[mintedId, memberId,', '[memberId,').replace(', mintedAt]);', ']);').replace(', authorized_at)', ')')"

echo
echo "  $KILLED killed · $SURVIVED survived"
[ "$SURVIVED" -eq 0 ] || exit 1
