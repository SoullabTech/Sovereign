#!/usr/bin/env python3
"""M-W4-REBASE

A stale predecessor is answered by rebasing onto the head and retrying, so
machine timing authors the succession relationship. ⛔ W4-C10b.
"""
import sys
P = 'lib/manuscript/editorialDiscourse/contract.ts'
OLD = "    persistMaiaTurn: false, rebaseOntoHead: false, retry: false,\n    respondWith: 'succession_refusal',"
NEW = "    persistMaiaTurn: true, rebaseOntoHead: true, retry: true,\n    respondWith: 'succession_refusal',"
s = open(P).read()
if OLD not in s:
    sys.stderr.write("STALE: anchor not found in %s\n" % P)
    sys.exit(3)
open(P, "w").write(s.replace(OLD, NEW, 1))
