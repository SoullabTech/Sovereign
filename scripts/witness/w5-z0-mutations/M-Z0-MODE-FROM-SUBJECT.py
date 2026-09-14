#!/usr/bin/env python3
"""M-Z0-MODE-FROM-SUBJECT

The conflation W5-Z0 exists to forbid: an editorial RELATIONSHIP is read as
proposal WORK, so a chain with no candidate wording enters a mode whose whole
meaning is that a formulation is being worked.
"""
import sys
P = 'app/api/sovereign/manuscripts/[id]/write-state/route.ts'
OLD = "        mode: target ? 'proposal_work' : 'section_aware',"
NEW = "        mode: target || editorialSubject ? 'proposal_work' : 'section_aware',"
s = open(P).read()
if OLD not in s:
    sys.stderr.write("STALE: anchor not found in %s\n" % P)
    sys.exit(3)
open(P, "w").write(s.replace(OLD, NEW, 1))
