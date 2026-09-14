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
restore() { cp "$BK/pw" "$PW"; cp "$BK/st" "$ST"; cp "$BK/fit" "$FIT";
  [ -f "$BK/authrt" ] && cp "$BK/authrt" "$ROOT/app/api/writers-studio/proposal-chains/[chainId]/versions/[versionId]/authorize/route.ts";
  [ -f "$BK/statusrt" ] && cp "$BK/statusrt" "$ROOT/app/api/writers-studio/revision-authorizations/[authorizationId]/route.ts";
  rm -rf "$BK"; }
trap restore EXIT
KILLED=0; SURVIVED=0

# ⚠️ TRANSFORMS MOVED OUT OF BASH STRINGS. Three separate defects came from
# quoting them inline: `$1` in SQL expanding as a POSITIONAL PARAMETER under
# `set -u`, a backtick reading as COMMAND SUBSTITUTION, and an unbalanced quote
# silently turning a mutation into a no-op. A transform is python; it belongs in
# a python file.
mutate_file() { # $1 label  $2 target  $3 transform .py
  mutate "$1" "$2" "$(cat "$ROOT/scripts/witness/step2-mutations/$3")"
}

mutate() { # $1 label  $2 file  $3 transform
  cp "$BK/pw" "$PW"; cp "$BK/st" "$ST"; cp "$BK/fit" "$FIT"
  [ -f "$BK/authrt" ] && cp "$BK/authrt" "$ROOT/app/api/writers-studio/proposal-chains/[chainId]/versions/[versionId]/authorize/route.ts"
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
# ⚠️ REWRITTEN: the first N1 inserted a `query<>` call, but proposalWork no
# longer imports `query` — the mutant did not compile and the harness reported
# CRASHED. A mutation must be a WORKING known-bad implementation.
mutate_file "N1 · proposal work is gated on the authorization fitting (R6 collapse)" "$PW" "N1.py"

mutate "N2 · the status surface stops consuming the shared fit law (CS-3)" "$ST" \
"s = s.replace('  const fit = evaluateExecutionFit(g, {', '  const fit = { fits: true } as const; void evaluateExecutionFit; void ({')"

mutate "N3 · the fit law stops checking expected text" "$FIT" \
"s = s.replace(\"  if (n === 0) return { fits: false, reason: 'expected_text_absent' };\", '  if (false) return { fits: false, reason: %s };' % repr('expected_text_absent'))"

mutate "N4 · the fit law stops checking the base version" "$FIT" \
"s = s.replace(\"  if (reading.version !== binding.baseVersion) return { fits: false, reason: 'stale_base' };\", '  void binding.baseVersion;')"

mutate "N5 · proposal work leaks an executability field" "$PW" \
"s = s.replace('  return { ok: true, work: { chain, versions: ordered, focused } };', '  return { ok: true, work: { chain, versions: ordered, focused, executable: true } as never };')"

# ⚠️ REWRITTEN for the transactional status read: the first N6 called the pool
# `query`, which status.ts no longer imports.
mutate_file "N6 · the status read distinguishes foreign from unknown" "$ST" "N6.py"

AUTH_RT="$ROOT/app/api/writers-studio/proposal-chains/[chainId]/versions/[versionId]/authorize/route.ts"
cp "$AUTH_RT" "$BK/authrt"

mutate "N7 · the authorize transport leaks the binding again" "$AUTH_RT" \
"s = s.replace('    authorizedAt: r.authorization.authorizedAt,', '    authorizedAt: r.authorization.authorizedAt,\\n    binding: r.authorization.guard,')"

mutate "N8 · the status read leaves the transaction (collage possible)" "$ST" \
"s = s.replace('WHERE id = \$1 AND manuscript_id = \$2 AND member_id = \$3 FOR SHARE', 'WHERE id = \$1 AND manuscript_id = \$2 AND member_id = \$3')"

mutate_file "N9 · the consent transport stops naming a place" "$ST" "N9.py"

mutate "N10 · proposalWork hydrates rows itself again (second adapter)" "$PW" \
"s = s.replace('  const stored = await readChain(memberId, chainId);', '  const stored = await readChain(memberId, chainId); const _sql = %s;' % repr('SELECT x FROM proposal_chains'))"

echo
echo "  $KILLED killed · $SURVIVED survived"
[ "$SURVIVED" -eq 0 ] || exit 1
