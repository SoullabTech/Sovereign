#!/usr/bin/env python3
"""M-W5-FOREIGN-REFERENCE

The two composite keys stop being told apart, so a Direction naming ANOTHER
chain's version is reported as an absent chain. ⛔ D5 kills it — the refusal
must name what was actually wrong, or a caller cannot tell 'not yours' from
'not in this exchange'.
"""
import sys
P = 'lib/manuscript/editorialWorkspace/store.ts'
OLD = "  if (err.constraint === 'proposal_chain_directions_version_fkey') {\n    return 'reference_not_in_chain';\n  }\n  return 'chain_unknown';"
NEW = "  return 'chain_unknown';"
s = open(P).read()
if OLD not in s:
    sys.stderr.write("STALE: anchor not found in %s\n" % P)
    sys.exit(3)
open(P, "w").write(s.replace(OLD, NEW, 1))
