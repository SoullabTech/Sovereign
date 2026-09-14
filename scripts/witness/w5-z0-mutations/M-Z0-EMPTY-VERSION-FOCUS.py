#!/usr/bin/env python3
"""M-Z0-EMPTY-VERSION-FOCUS

`?proposalVersion=` becomes a focus on the empty string — a named-but-blank
ask the server would then have to interpret.
"""
import sys
P = 'app/writers-studio/canvasIdentity.ts'
OLD = '  return { chainId, versionId: versionId && versionId.length > 0 ? versionId : null };'
NEW = '  return { chainId, versionId };'
s = open(P).read()
if OLD not in s:
    sys.stderr.write("STALE: anchor not found in %s\n" % P)
    sys.exit(3)
open(P, "w").write(s.replace(OLD, NEW, 1))
