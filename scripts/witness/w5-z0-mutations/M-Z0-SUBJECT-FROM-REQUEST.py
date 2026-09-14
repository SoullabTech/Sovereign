#!/usr/bin/env python3
"""M-Z0-SUBJECT-FROM-REQUEST

The subject is echoed back from what the BROWSER asked for rather than from
what this server RESOLVED — an identity nothing checked.
"""
import sys
P = 'app/api/sovereign/manuscripts/[id]/write-state/route.ts'
OLD = "            kind: 'chain', chainId: r.target.chainId, focusedVersionId: r.target.versionId,"
NEW = "            kind: 'chain', chainId: requested.chainId, focusedVersionId: requested.versionId,"
s = open(P).read()
if OLD not in s:
    sys.stderr.write("STALE: anchor not found in %s\n" % P)
    sys.exit(3)
open(P, "w").write(s.replace(OLD, NEW, 1))
