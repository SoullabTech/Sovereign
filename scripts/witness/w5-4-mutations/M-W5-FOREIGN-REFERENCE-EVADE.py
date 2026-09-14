#!/usr/bin/env python3
"""M-W5-FOREIGN-REFERENCE-EVADE

The exact-chain reference constraint is EVADED rather than defeated: the
reference is silently dropped, so the write succeeds and the Direction is
stored pointing at nothing. ⛔ D4 kills it — a reference the author stated
must survive, and dropping it is a quieter substitution than choosing one.
"""
import sys
P = 'lib/manuscript/editorialWorkspace/store.ts'
OLD = '      [memberId, chainId, author, input.instruction, input.refersTo]);'
NEW = '      [memberId, chainId, author, input.instruction, null]);'
s = open(P).read()
if OLD not in s:
    sys.stderr.write("STALE: anchor not found in %s\n" % P)
    sys.exit(3)
open(P, "w").write(s.replace(OLD, NEW, 1))
