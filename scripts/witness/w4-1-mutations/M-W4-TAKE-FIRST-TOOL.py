#!/usr/bin/env python3
"""M-W4-TAKE-FIRST-TOOL

Two `editorial_outcome` calls — or the right tool beside another — and the
parser takes the first. Choosing among several structured answers is a
resolver, and a resolver that silently picks has decided something nobody
authorized it to decide. ⛔ W4-C14.
"""
import sys
P = 'lib/manuscript/editorialDiscourse/contract.ts'
OLD = "  if (named.length > 1 || calls.length > named.length) {\n    return { ok: false, reason: 'malformed' };\n  }"
NEW = '  /* take the first and get on with it */'
s = open(P).read()
if OLD not in s:
    sys.stderr.write("STALE: anchor not found in %s\n" % P)
    sys.exit(3)
open(P, "w").write(s.replace(OLD, NEW, 1))
