#!/usr/bin/env python3
"""M-Z0-HEAD-DEFAULT

THE LOAD-BEARING MUTANT (founder-named). A chain-only ask on a chain that
HAS versions quietly seats the head. Convenient, plausible, and it undoes
CUTOVER-01A: the room would display a formulation the writer never asked for.
"""
import sys
P = 'lib/manuscript/proposalChain/editorialSubject.ts'
OLD = "  if (r.work.versions.length > 0) return { ok: false, reason: 'version_required' };\n\n  return {\n    ok: true,\n    subject: { kind: 'chain', chainId: r.work.chain.id, focusedVersionId: null },\n  };"
NEW = "  return {\n    ok: true,\n    subject: { kind: 'chain', chainId: r.work.chain.id,\n               focusedVersionId: (r.work.focused?.id ?? null) as null },\n  };"
s = open(P).read()
if OLD not in s:
    sys.stderr.write("STALE: anchor not found in %s\n" % P)
    sys.exit(3)
open(P, "w").write(s.replace(OLD, NEW, 1))
