#!/usr/bin/env python3
"""M-Z0-WORK-UNBOUND

THE 01A.1 MUTANT, CARRIED FORWARD. Binds member and chain and NOT the Work,
so a chain authored against another Work of the same writer becomes this
room's editorial subject. ⛔ Here there is no location read to produce a
plausible-looking 'section_unreadable' — the substitution is silent.
"""
import sys
P = 'lib/manuscript/proposalChain/editorialSubject.ts'
OLD = "  if (r.work.chain.locus.workId !== expectedWorkId) {\n    return { ok: false, reason: 'wrong_work' };\n  }\n\n"
NEW = ''
s = open(P).read()
if OLD not in s:
    sys.stderr.write("STALE: anchor not found in %s\n" % P)
    sys.exit(3)
open(P, "w").write(s.replace(OLD, NEW, 1))
