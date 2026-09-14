#!/usr/bin/env python3
"""M-W4-MIXED-PRODUCER

One editorial-context block carries both authorships, so MAIA's Insight
arrives inside a producer declared authoredBy: member. ⛔ W4-C2.
"""
import sys
P = 'lib/manuscript/editorialDiscourse/contract.ts'
OLD = "  const member = input.history.filter((r) => r.author === 'member');\n  const maia = input.history.filter((r) => r.author === 'maia');"
NEW = '  const member = input.history;\n  const maia: readonly EditorialRecord[] = [];'
s = open(P).read()
if OLD not in s:
    sys.stderr.write("STALE: anchor not found in %s\n" % P)
    sys.exit(3)
open(P, "w").write(s.replace(OLD, NEW, 1))
