#!/usr/bin/env python3
"""M-W4-MULTI-PROPOSAL

Sibling proposals are accepted by taking the first, manufacturing a choice
MAIA made in a substrate that has no branch. ⛔ W4-C8b.
"""
import sys
P = 'lib/manuscript/editorialDiscourse/contract.ts'
OLD = "  if (Array.isArray(r.proposal)) return { ok: false, reason: 'multiple_proposals' };"
NEW = '  if (Array.isArray(r.proposal)) {\n    (r as Record<string, unknown>).proposal = (r.proposal as unknown[])[0];\n  }'
s = open(P).read()
if OLD not in s:
    sys.stderr.write("STALE: anchor not found in %s\n" % P)
    sys.exit(3)
open(P, "w").write(s.replace(OLD, NEW, 1))
