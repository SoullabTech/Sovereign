#!/usr/bin/env python3
"""M-W4-INFER-MAIA-DIRECTION

⭐ THE MAIA-SIDE TWIN OF M-W4-INFER-DIRECTION. A `reply_only` outcome whose
prose sounds directive is promoted into a Direction, so the SYSTEM authors her
steering act. Semantic acts are authored by the party who performs them; they
are not extracted into existence afterward. ⛔ W4-C20b.
"""
import sys
P = 'lib/manuscript/editorialDiscourse/contract.ts'
OLD = "  if (r.kind === 'reply_only') {\n    /* ⛔ An adjunct riding along with `reply_only` is a contradiction, not a\n       bonus. Refused rather than silently dropped or silently honoured. */\n    if ('proposal' in r || 'direction' in r) return { ok: false, reason: 'malformed' };\n    return { ok: true, outcome: { kind: 'reply_only', reply: r.reply } };\n  }"
NEW = "  if (r.kind === 'reply_only') {\n    if ('proposal' in r || 'direction' in r) return { ok: false, reason: 'malformed' };\n    if (/\\b(try|let me|first|softer|less)\\b/i.test(r.reply)) {\n      return { ok: true, outcome: { kind: 'reply_with_direction', reply: r.reply,\n        direction: { instruction: r.reply, refersTo: null } } };\n    }\n    return { ok: true, outcome: { kind: 'reply_only', reply: r.reply } };\n  }"
s = open(P).read()
if OLD not in s:
    sys.stderr.write("STALE: anchor not found in %s\n" % P)
    sys.exit(3)
open(P, "w").write(s.replace(OLD, NEW, 1))
