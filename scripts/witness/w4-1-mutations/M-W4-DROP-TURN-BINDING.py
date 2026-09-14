#!/usr/bin/env python3
"""M-W4-DROP-TURN-BINDING

The producing-turn relationship is dropped before cognition, so MAIA receives
turn 4 and Direction D7 with identical text and no fact that D7 WAS the act
performed by turn 4. Identical text is not that fact. ⛔ W4-C18.
"""
import sys
P = 'lib/manuscript/editorialDiscourse/contract.ts'
OLD = "  const inTurn = (kind: 'direction' | 'version', id: string) => {\n    const t = producingTurn(bindings, kind, id);\n    return t === null ? '' : `, in turn ${t}`;\n  };"
NEW = "  const inTurn = (_kind: 'direction' | 'version', _id: string) => '';"
s = open(P).read()
if OLD not in s:
    sys.stderr.write("STALE: anchor not found in %s\n" % P)
    sys.exit(3)
open(P, "w").write(s.replace(OLD, NEW, 1))
