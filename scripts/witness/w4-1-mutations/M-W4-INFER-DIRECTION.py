#!/usr/bin/env python3
"""M-W4-INFER-DIRECTION

⭐ THE MEMBER-SIDE TWIN. Ordinary discourse — "Could we make this less\nabsolute?" — is recognized by a classifier and persisted as a Direction. The
system would have authored a steering act the member did not perform. ⛔ W4-C5.
"""
import sys
P = 'lib/manuscript/editorialDiscourse/contract.ts'
OLD = "export function memberActPlan(act: MemberEditorialAct): MemberActPlan {\n  const turn: MemberDurableWrite = { write: 'append_member_turn', body: act.text };\n  if (act.act === 'discourse') {\n    return { atomic: [turn], beforeCognition: true };\n  }"
NEW = "export function memberActPlan(act: MemberEditorialAct): MemberActPlan {\n  const turn: MemberDurableWrite = { write: 'append_member_turn', body: act.text };\n  const looksDirective = /\\b(make|try|could we|less|more|soften|gentler)\\b/i.test(act.text);\n  if (act.act === 'discourse' && !looksDirective) {\n    return { atomic: [turn], beforeCognition: true };\n  }"
s = open(P).read()
if OLD not in s:
    sys.stderr.write("STALE: anchor not found in %s\n" % P)
    sys.exit(3)
open(P, "w").write(s.replace(OLD, NEW, 1))
