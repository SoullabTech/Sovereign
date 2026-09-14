#!/usr/bin/env python3
"""M-W4-MIXED-PRODUCER

One editorial-context block carries both authorships: every turn is routed to
the member producer, so MAIA's own words arrive inside a block declared
authoredBy: member. ⛔ W4-C2.

⚠️ RE-AIMED AT W4-1.1: the partition moved into `side()`.
"""
import sys
P = 'lib/manuscript/editorialDiscourse/contract.ts'
OLD = '    const turns = input.turns.filter((t) => t.author === author)'
NEW = "    const turns = input.turns.filter(() => author === 'member')"
s = open(P).read()
if OLD not in s:
    sys.stderr.write("STALE: anchor not found in %s\n" % P)
    sys.exit(3)
open(P, "w").write(s.replace(OLD, NEW, 1))
