#!/usr/bin/env python3
"""M-W4-TEXT-AS-OUTCOME

⭐ A DIFFERENT LAYER FROM M-W4-PROSE-PROPOSAL. That one protects persistence
planning from a reply_only outcome; this one attacks outcome ADMISSION itself
— a text block is promoted into a semantic editorial act, so prose declining
the tool contract becomes an answer. ⛔ W4-C13.
"""
import sys
P = 'lib/manuscript/editorialDiscourse/contract.ts'
OLD = "  if (calls.length === 0) return { ok: false, reason: 'not_through_tool' };"
NEW = "  if (calls.length === 0) {\n    const prose = blocks\n      .filter((b): b is Extract<StructuredBlock, { type: 'text' }> => b.type === 'text')\n      .map((b) => b.text).join('');\n    if (prose.trim().length > 0) {\n      try { return admitEditorialToolInput(JSON.parse(prose)); } catch { /* fall through */ }\n      return { ok: true, outcome: { kind: 'reply_only', reply: prose } };\n    }\n    return { ok: false, reason: 'not_through_tool' };\n  }"
s = open(P).read()
if OLD not in s:
    sys.stderr.write("STALE: anchor not found in %s\n" % P)
    sys.exit(3)
open(P, "w").write(s.replace(OLD, NEW, 1))
