#!/usr/bin/env python3
"""M-W4-HEAD-SUBSTITUTE

The candidate is attached to whatever is newest rather than to what MAIA
actually authored against. ⛔ W4-C9 / W4-C10.
"""
import sys
P = 'lib/manuscript/editorialDiscourse/contract.ts'
OLD = "        /* ⛔ THE INVOCATION'S PREDECESSOR. Not a head lookup, not a re-read. */\n        supersedes: invocation.authoredAgainstVersionId,"
NEW = '        supersedes: (invocation as unknown as { headVersionId?: string })\n          .headVersionId ?? invocation.authoredAgainstVersionId,'
s = open(P).read()
if OLD not in s:
    sys.stderr.write("STALE: anchor not found in %s\n" % P)
    sys.exit(3)
open(P, "w").write(s.replace(OLD, NEW, 1))
