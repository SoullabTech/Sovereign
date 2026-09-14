#!/usr/bin/env python3
"""M-W4-WITHDRAW-DELETES

Withdrawing conversation erases the authored acts it was bound to — the
CASCADE lifecycle the ruling names as impossible. ⛔ lifecycle obligation.
"""
import sys
P = 'lib/manuscript/editorialDiscourse/contract.ts'
OLD = '    removesTurnDirectionBinding: true, removesTurnVersionBinding: true,\n    deletesDirection: false, deletesVersion: false,'
NEW = '    removesTurnDirectionBinding: true, removesTurnVersionBinding: true,\n    deletesDirection: true, deletesVersion: true,'
s = open(P).read()
if OLD not in s:
    sys.stderr.write("STALE: anchor not found in %s\n" % P)
    sys.exit(3)
open(P, "w").write(s.replace(OLD, NEW, 1))
