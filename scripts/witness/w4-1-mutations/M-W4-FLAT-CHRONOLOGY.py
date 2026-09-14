#!/usr/bin/env python3
"""M-W4-FLAT-CHRONOLOGY

Every object kind is merged into one sequence and each collection is then
sliced back out of it in ARRIVAL order — so succession order and turn_index
both come from however the caller happened to hand them over. W5 ruled no
global chronology exists across these objects. ⛔ W4-C16b.
"""
import sys
P = 'lib/manuscript/editorialDiscourse/contract.ts'
OLD = "  const side = (author: 'member' | 'maia') => {"
NEW = "  const side = (author: 'member' | 'maia') => {\n    const flat = [\n      ...input.insights, ...input.directions, ...input.versions, ...input.turns,\n    ].filter((r) => r.author === author);\n    return {\n      turns: flat.filter((r): r is TurnRecord => r.kind === 'turn'),\n      versions: flat.filter((r): r is VersionRecord => r.kind === 'version'),\n      insights: flat.filter((r): r is InsightRecord => r.kind === 'insight'),\n      directions: flat.filter((r): r is DirectionRecord => r.kind === 'direction'),\n      count: flat.length,\n    };\n  };\n  const _unusedSide = (author: 'member' | 'maia') => {"
s = open(P).read()
if OLD not in s:
    sys.stderr.write("STALE: anchor not found in %s\n" % P)
    sys.exit(3)
open(P, "w").write(s.replace(OLD, NEW, 1))
