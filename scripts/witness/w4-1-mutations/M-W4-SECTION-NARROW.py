#!/usr/bin/env python3
"""M-W4-SECTION-NARROW

⚠️ THIS MUTANT IS THE CONTRACT'S OWN FIRST DEFECT, PRESERVED. The nested
RC-GEN-01 geometry check is removed, so `proposal: { sectionId, replacementText }`
is ADMITTED with the section id silently dropped — a shape asserting a section
scope quietly narrowed into one that does not. ⛔ W4-C12.
"""
import sys
P = 'lib/manuscript/editorialDiscourse/contract.ts'
OLD = "  const nested = r.proposal;\n  if (nested && typeof nested === 'object' && sectionScoped(nested as Record<string, unknown>)) {\n    return { ok: false, reason: 'section_scoped_outcome' };\n  }"
NEW = '  const nested = r.proposal;'
s = open(P).read()
if OLD not in s:
    sys.stderr.write("STALE: anchor not found in %s\n" % P)
    sys.exit(3)
open(P, "w").write(s.replace(OLD, NEW, 1))
