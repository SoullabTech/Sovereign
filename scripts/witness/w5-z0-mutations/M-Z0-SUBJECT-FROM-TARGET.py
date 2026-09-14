#!/usr/bin/env python3
"""M-Z0-SUBJECT-FROM-TARGET

W3's derivation, reintroduced: the editorial relationship becomes a function
of a candidate formulation again, so a chain with no wording can never mount.
"""
import sys
P = 'app/writers-studio/canvas/page.tsx'
OLD = '  const subject = editorialSubjectOf(writeState);'
NEW = "  const subject = engine?.target\n    ? { kind: 'chain' as const,\n        chainId: (engine.target as { chainId: string }).chainId,\n        focusedVersionId: (engine.target as { versionId: string }).versionId }\n    : null;"
s = open(P).read()
if OLD not in s:
    sys.stderr.write("STALE: anchor not found in %s\n" % P)
    sys.exit(3)
open(P, "w").write(s.replace(OLD, NEW, 1))
