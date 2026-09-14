#!/usr/bin/env python3
"""M-Z0-WORKSPACE-ACCEPTS-HEAD

The room's own cut at the head default is removed, so a chain read that came
back focused is rendered as if it were what the writer asked to see.
"""
import sys
P = 'app/writers-studio/EditorialWorkspace.tsx'
OLD = "        if (versionId === null && body.focusedVersionId !== null) {\n          setPhase('error');\n          return;\n        }\n"
NEW = ''
s = open(P).read()
if OLD not in s:
    sys.stderr.write("STALE: anchor not found in %s\n" % P)
    sys.exit(3)
open(P, "w").write(s.replace(OLD, NEW, 1))
