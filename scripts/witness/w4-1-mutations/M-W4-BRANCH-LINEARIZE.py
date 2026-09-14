#!/usr/bin/env python3
"""M-W4-BRANCH-LINEARIZE

A branch in succession is linearized rather than refused: one successor is
picked and the other appended as an "unreachable" tail, manufacturing a
plausible presentation of an invalid history. ⭐ THIS IS THE SEAL'S OWN
`lineageOrder()`, restored as a mutant — a corrupt succession must be refused,
not made displayable, and succession stays owned by the subsystem that judges
it. ⛔ W4-C19.
"""
import sys
P = 'lib/manuscript/editorialDiscourse/contract.ts'
OLD = "  if (!versionsAreStructural(input.versions)) {\n    return { ok: false, reason: 'versions_not_structural' };\n  }"
NEW = '  const _byPredecessor = new Map<string | null, VersionRecord>();\n  for (const v of input.versions) _byPredecessor.set(v.supersedes, v);\n  const _linearized: VersionRecord[] = [];\n  const _seen = new Set<string>();\n  let _cursor: string | null = null;\n  for (;;) {\n    const n: VersionRecord | undefined = _byPredecessor.get(_cursor);\n    if (!n || _seen.has(n.id)) break;\n    _linearized.push(n); _seen.add(n.id); _cursor = n.id;\n  }\n  for (const v of input.versions) if (!_seen.has(v.id)) _linearized.push(v);\n  input = { ...input, versions: _linearized };'
s = open(P).read()
if OLD not in s:
    sys.stderr.write("STALE: anchor not found in %s\n" % P)
    sys.exit(3)
open(P, "w").write(s.replace(OLD, NEW, 1))
