#!/usr/bin/env python3
"""M-W4-DROP-TURN-INDEX

Authorship is partitioned and the turn index is omitted, so
`0 writer · 1 MAIA · 2 writer · 3 MAIA` reaches cognition as two lists with
nothing left that reconstructs the interleaving. Partitioning provenance must
not partition away relationship. ⛔ W4-C17.
"""
import sys
P = 'lib/manuscript/editorialDiscourse/contract.ts'
OLD = '      return `- [turn ${r.turnIndex} · ${who} ${KIND_LABEL.turn}] ${r.body}`;'
NEW = '      return `- [${who} ${KIND_LABEL.turn}] ${r.body}`;'
s = open(P).read()
if OLD not in s:
    sys.stderr.write("STALE: anchor not found in %s\n" % P)
    sys.exit(3)
open(P, "w").write(s.replace(OLD, NEW, 1))
