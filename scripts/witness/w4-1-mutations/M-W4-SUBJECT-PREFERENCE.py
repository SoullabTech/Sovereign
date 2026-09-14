#!/usr/bin/env python3
"""M-W4-SUBJECT-PREFERENCE

A row carrying BOTH subjects is repaired by preferring the chain, so one
subject silently wins over a row nobody meant to write. ⛔ W4-C1.
"""
import sys
P = 'lib/manuscript/editorialDiscourse/contract.ts'
OLD = "  if (hasAnchor && hasChain) return { ok: false, reason: 'subject_ambiguous' };"
NEW = "  if (hasAnchor && hasChain) {\n    return { ok: true, subject: { kind: 'editorial', anchor: null,\n      proposalChainId: row.proposalChainId as string } };\n  }"
s = open(P).read()
if OLD not in s:
    sys.stderr.write("STALE: anchor not found in %s\n" % P)
    sys.exit(3)
open(P, "w").write(s.replace(OLD, NEW, 1))
