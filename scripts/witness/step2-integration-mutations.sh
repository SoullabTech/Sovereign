#!/usr/bin/env bash
# STEP 2 · integration — FALSIFICATION OF THE WITNESS.
# ⛔ A survivor is the result; a NO-OP and a CRASH are each reported as such.
set -u
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
: "${DATABASE_URL:?must name a disposable witness database}"
PW="$ROOT/lib/manuscript/proposalChain/proposalWork.ts"
ST="$ROOT/lib/manuscript/revisionAuthorization/status.ts"
FIT="$ROOT/lib/manuscript/revisionAuthorization/executionFit.ts"
BK="$(mktemp -d)"; cp "$PW" "$BK/pw"; cp "$ST" "$BK/st"; cp "$FIT" "$BK/fit"
restore() { cp "$BK/pw" "$PW"; cp "$BK/st" "$ST"; cp "$BK/fit" "$FIT"; rm -rf "$BK"; }
trap restore EXIT
KILLED=0; SURVIVED=0

mutate() { # $1 label  $2 file  $3 transform
  cp "$BK/pw" "$PW"; cp "$BK/st" "$ST"; cp "$BK/fit" "$FIT"
  if ! python3 - "$2" "$3" <<'PY'
import sys
path, t = sys.argv[1], sys.argv[2]
s = open(path).read(); before = s
ns = {'s': s}; exec(t, ns); s = ns['s']
if s == before: sys.stderr.write("NO-OP\n"); sys.exit(3)
open(path, 'w').write(s)
PY
  then printf '  ⛔ NO-OP  %s\n' "$1"; SURVIVED=$((SURVIVED+1)); return; fi
  PGDB="${PGDB:-integration_witness}" bash "$ROOT/scripts/witness/step2-rebuild-db.sh" >/dev/null 2>&1
  local out; out="$(cd "$ROOT" && npx tsx scripts/witness/step2-integration-witness.ts 2>/dev/null)"
  if ! printf '%s' "$out" | grep -q 'passed ·'; then
    printf '  ⛔ CRASHED  %s\n' "$1"; SURVIVED=$((SURVIVED+1)); return
  fi
  if printf '%s' "$out" | grep -q '^  FAIL'; then
    printf '  KILLED  %s\n' "$1"
    printf '%s\n' "$out" | grep '^  FAIL' | sed 's/^  FAIL  /            caught by: /'
    KILLED=$((KILLED+1))
  else
    printf '  ⛔ SURVIVED  %s\n' "$1"; SURVIVED=$((SURVIVED+1))
  fi
}

echo "── STEP 2 · integration falsification ───────────────────────"

# ⭐⭐ THE ONE THAT MATTERS: R6's collapse, reintroduced.
mutate "N1 · proposal work is gated on the authorization fitting (R6 collapse)" "$PW" \
"s = s.replace('import { lineage, validateChain }', 'import { readAuthorizationStatus } from \\\"@/lib/manuscript/revisionAuthorization/status\\\";\nimport { lineage, validateChain }').replace('  const ordered = lineage(versions);', '''  const anyAuth = await query<{ id: string }>(
    'SELECT id FROM manuscript_revision_authorizations WHERE proposal_chain_id = \$1 LIMIT 1',
    [chainId]);
  if (anyAuth.rows[0]) {
    const st = await readAuthorizationStatus(memberId, anyAuth.rows[0].id);
    if (st && st.state !== 'executable') return { ok: false, reason: 'chain_unknown' };
  }
  const ordered = lineage(versions);''')"

mutate "N2 · the status surface stops consuming the shared fit law (CS-3)" "$ST" \
"s = s.replace('  const fit = evaluateExecutionFit(g, {', '  const fit = { fits: true } as const; void evaluateExecutionFit; void ({')"

mutate "N3 · the fit law stops checking expected text" "$FIT" \
"s = s.replace(\"  if (n === 0) return { fits: false, reason: 'expected_text_absent' };\", '  if (false) return { fits: false, reason: %s };' % repr('expected_text_absent'))"

mutate "N4 · the fit law stops checking the base version" "$FIT" \
"s = s.replace(\"  if (reading.version !== binding.baseVersion) return { fits: false, reason: 'stale_base' };\", '  void binding.baseVersion;')"

mutate "N5 · proposal work leaks an executability field" "$PW" \
"s = s.replace('  return { ok: true, work: { chain, versions: ordered, focused } };', '  return { ok: true, work: { chain, versions: ordered, focused, executable: true } as never };')"

mutate "N6 · the status read distinguishes foreign from unknown" "$ST" \
"s = s.replace('  if (a.rows.length === 0) return null;', '''  if (a.rows.length === 0) {
    const anywhere = await query('SELECT 1 FROM manuscript_revision_authorizations WHERE id = \$1', [authorizationId]);
    if (anywhere.rows.length > 0) return { state: 'work_unreadable' } as never;
    return null;
  }''')"

echo
echo "  $KILLED killed · $SURVIVED survived"
[ "$SURVIVED" -eq 0 ] || exit 1
