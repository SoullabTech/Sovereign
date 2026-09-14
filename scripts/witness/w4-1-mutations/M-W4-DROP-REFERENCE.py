#!/usr/bin/env python3
"""M-W4-DROP-REFERENCE

A Direction's explicit reference is silently omitted from canonical
participation, so `refersTo = V1` reaches MAIA as bare prose. Authorship
survives; the authored relationship does not. ⛔ W4-C15.
"""
import sys
P = 'lib/manuscript/editorialDiscourse/contract.ts'
OLD = "    case 'direction':\n      return `- [${who} ${KIND_LABEL.direction}`\n        + `${r.refersTo !== null ? `, about ${r.refersTo}` : ''}] ${r.instruction}`;"
NEW = "    case 'direction':\n      return `- [${who} ${KIND_LABEL.direction}] ${r.instruction}`;"
s = open(P).read()
if OLD not in s:
    sys.stderr.write("STALE: anchor not found in %s\n" % P)
    sys.exit(3)
open(P, "w").write(s.replace(OLD, NEW, 1))
