#!/usr/bin/env python3
"""M-W4-UTTERANCE-AS-HISTORY

The declared-act producer becomes a second copy of what was said, so the
writer's words arrive twice under two different provenances. ⛔ W4-C3.
"""
import sys
P = 'lib/manuscript/editorialDiscourse/contract.ts'
OLD = "    text: `[The writer's declared act] ${input.declaredAct}`,"
NEW = "    text: `[The writer's declared act] ${input.declaredAct}: `\n      + `${input.history.map((r) => r.text).join(' ')}`,"
s = open(P).read()
if OLD not in s:
    sys.stderr.write("STALE: anchor not found in %s\n" % P)
    sys.exit(3)
open(P, "w").write(s.replace(OLD, NEW, 1))
