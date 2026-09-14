#!/usr/bin/env python3
"""M-W4-DROP-REFERENCE

A Direction's explicit reference is silently omitted from canonical
participation, so `refersTo = V1` reaches MAIA as bare prose. Authorship
survives; the authored relationship does not. ⛔ W4-C15.

⚠️ RE-AIMED AT W4-1.2, which added the producing-turn clause to the same render
arm. The operator now drops ONLY `refersTo` and leaves the binding intact, so it
still tests the reference rather than both at once — a mutant that removed both
would be killed by either obligation and prove neither.
"""
import sys
P = 'lib/manuscript/editorialDiscourse/contract.ts'
OLD = "      return `- [${who} ${KIND_LABEL.direction}`\n        + `${r.refersTo !== null ? `, about ${r.refersTo}` : ''}`\n        + `${inTurn('direction', r.id)}] ${r.instruction}`;"
NEW = "      return `- [${who} ${KIND_LABEL.direction}`\n        + `${inTurn('direction', r.id)}] ${r.instruction}`;"
s = open(P).read()
if OLD not in s:
    sys.stderr.write("STALE: anchor not found in %s\n" % P)
    sys.exit(3)
open(P, "w").write(s.replace(OLD, NEW, 1))
