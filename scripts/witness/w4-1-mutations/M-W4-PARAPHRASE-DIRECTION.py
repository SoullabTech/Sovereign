#!/usr/bin/env python3
"""M-W4-PARAPHRASE-DIRECTION

The Direction's instruction is a host-normalized restatement rather than the
member's own words — a Direction the system partly authored. ⛔ W4-C6b.
"""
import sys
P = 'lib/manuscript/editorialDiscourse/contract.ts'
OLD = "      { write: 'create_member_direction', instruction: act.text, refersTo: act.refersTo },"
NEW = "      { write: 'create_member_direction',\n        instruction: act.text.replace(/[.!?]+\\s*$/, '').toLowerCase(),\n        refersTo: act.refersTo },"
s = open(P).read()
if OLD not in s:
    sys.stderr.write("STALE: anchor not found in %s\n" % P)
    sys.exit(3)
open(P, "w").write(s.replace(OLD, NEW, 1))
