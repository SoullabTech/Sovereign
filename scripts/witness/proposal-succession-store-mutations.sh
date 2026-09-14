#!/usr/bin/env bash
# PROPOSAL-SUCCESSION-STORE-01 — FALSIFICATION OF THE ADAPTER WITNESS.
#
# ⭐ THE WITNESS IS WHAT IS UNDER TEST HERE. For each known-bad adapter this
# patches `store.ts`, reruns the witness, and requires it to go RED, naming
# which falsifiers caught it.
#
# ⛔ A MUTATION THAT SURVIVES IS THE RESULT THAT MATTERS — it means the witness
# is not testing the property it claims. And a NO-OP mutation is reported as a
# survivor, never a kill: this programme has written three no-ops already, and a
# mutation that changes no behaviour is a green light with nothing behind it.
#
# ⛔ DISPOSABLE DATABASE ONLY — inherited from the witness itself.
set -u
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
STORE="$ROOT/lib/manuscript/proposalChain/store.ts"
WIT="$ROOT/scripts/witness/proposal-succession-store-witness.ts"
: "${DATABASE_URL:?DATABASE_URL must name a disposable witness database}"

BACKUP="$(mktemp)"; cp "$STORE" "$BACKUP"
restore() { cp "$BACKUP" "$STORE"; rm -f "$BACKUP"; }
trap restore EXIT

KILLED=0; SURVIVED=0

mutate() { # $1 label   $2 python transform on `s`
  local label="$1"
  cp "$BACKUP" "$STORE"
  if ! python3 - "$STORE" "$2" <<'PY'
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
  local out; out="$(cd "$ROOT" && npx tsx "$WIT" 2>/dev/null)"
  if printf '%s' "$out" | grep -q '^  FAIL'; then
    printf '  KILLED  %s\n' "$label"
    printf '%s\n' "$out" | grep '^  FAIL' | sed 's/^  FAIL  /            caught by: /'
    KILLED=$((KILLED+1))
  else
    printf '  ⛔ SURVIVED  %s\n     -> the witness is GREEN against an adapter known to be wrong\n' "$label"
    SURVIVED=$((SURVIVED+1))
  fi
}

echo "── PROPOSAL-SUCCESSION-STORE-01 · witness falsification ─────"

# ⭐⭐ M1 IS THE FOUNDER'S NAMED MUTATION, and the reason F7 exists. The pure
# contract already paid for this lesson; persistence must not reintroduce the
# defect one layer later.
mutate "M1 · ⭐⭐ the adapter sorts by authored_at and reconstructs predecessor order" \
"s = s.replace('''      WHERE chain_id = \$1
      ORDER BY id\`, [chainId]);

  return {
    chain: hydrateChain(c.rows[0]),
    versions: v.rows.map(hydrateVersion),
  };''', '''      WHERE chain_id = \$1
      ORDER BY authored_at\`, [chainId]);

  const byTime = v.rows.map(hydrateVersion);
  return {
    chain: hydrateChain(c.rows[0]),
    versions: byTime.map((x, i) => ({ ...x, supersedes: i === 0 ? null : byTime[i - 1].id })),
  };''')"

# RETARGETED after the founder review removed the store's local head helper.
# There is no second head algorithm left to mutate, so this now corrupts the USE
# of the pure headOf() into a clock-derived predecessor -- which is the defect
# the old helper made possible, expressed at the only place it can still live.
mutate "M2 · the candidate's predecessor is clock-derived instead of headOf()" \
"s = s.replace('      supersedes: headOf(versions)?.id ?? null,',
               '      supersedes: versions.length === 0 ? null : [...versions].sort((a, b) => a.authoredAt < b.authoredAt ? 1 : -1)[0].id,')"

mutate "M3 · rationale hydrates with the truthiness idiom (\\'\\' becomes absent)" \
"s = s.replace(\"...(r.rationale !== null ? { rationale: r.rationale } : {}),\",
               \"...(r.rationale ? { rationale: r.rationale } : {}),\")"

mutate "M4 · a NULL rationale hydrates as '' instead of being absent" \
"s = s.replace(\"...(r.rationale !== null ? { rationale: r.rationale } : {}),\",
               \"rationale: r.rationale ?? '',\")"

mutate "M5 · member_id leaves the read predicate (a UUID becomes enough)" \
"s = s.replace('''    \`SELECT \${CHAIN_COLUMNS} FROM proposal_chains
      WHERE id = \$1 AND member_id = \$2\`, [chainId, memberId]);''',
'''    \`SELECT \${CHAIN_COLUMNS} FROM proposal_chains
      WHERE id = \$1\`, [chainId]);''')"

mutate "M6 · member_id leaves the APPEND predicate" \
"s = s.replace('''        WHERE id = \$1 AND member_id = \$2 FOR UPDATE\`, [chainId, memberId]);''',
'''        WHERE id = \$1 FOR UPDATE\`, [chainId]);''')"

mutate "M7 · governedBy hydrates as a key holding null (a third state)" \
"s = s.replace('''  ...(r.decision_chain_id !== null
    ? { governedBy: { decisionChainId: r.decision_chain_id } satisfies EditorialRulingRef }
    : {}),''',
'''  governedBy: (r.decision_chain_id !== null
    ? { decisionChainId: r.decision_chain_id }
    : null) as never,''')"

mutate "M8 · the author is inferred from position instead of read from the row" \
"s = s.replace('  author: r.author,', '  author: (r.supersedes === null ? \\'maia\\' : \\'member\\') as VersionAuthor,')"

mutate "M9 · the adapter gains a mutator (rewriting a version becomes possible)" \
"s = s.rstrip() + '''

export async function updateVersionText(chainId: string, versionId: string, text: string) {
  await query(\`UPDATE proposal_versions SET formulation = \$3 WHERE chain_id = \$1 AND id = \$2\`,
    [chainId, versionId, text]);
}
'''"

mutate "M10 · replacementText is spread-guarded, so a deletion ('') is lost" \
"s = s.replace('  replacementText: r.formulation,', '  replacementText: r.formulation || undefined as never,')"

# M11 IS THE S3 `unreachable` DEFECT, REPRODUCED HERE ON PURPOSE. A blanket
# catch turns every database exception -- unavailability included -- into one
# domain refusal, and the caller can no longer tell "the rule said no" from
# "the database could not answer". F17 is the only thing standing between this
# adapter and that collapse.
mutate "M11 · a blanket catch converts EVERY database error into a domain refusal" \
"s = s.replace('      throw e;', \"      return refuse('simultaneous_append');\")"

echo
echo "  $KILLED killed · $SURVIVED survived"
[ "$SURVIVED" -eq 0 ] || exit 1
