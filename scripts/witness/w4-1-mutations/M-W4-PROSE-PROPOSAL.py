#!/usr/bin/env python3
"""M-W4-PROSE-PROPOSAL

⭐ THE FOUNDER-NAMED MUTANT. MAIA replies "Try: 'He stayed there by the\nriver.'" with a structured outcome of reply_only; the implementation scrapes
the quoted prose and persists it as a ProposalVersion. The SYSTEM would then
have decided which of her words were a candidate formulation. ⛔ W4-C11.
"""
import sys
P = 'lib/manuscript/editorialDiscourse/contract.ts'
OLD = "  const turn: MaiaDurableWrite = { write: 'append_maia_turn', body: outcome.reply };\n  if (outcome.kind === 'reply_only') {\n    return { atomic: [turn], afterAdmission: true };\n  }"
NEW = "  const turn: MaiaDurableWrite = { write: 'append_maia_turn', body: outcome.reply };\n  if (outcome.kind === 'reply_only') {\n    const quoted = /'([^']{8,})'/.exec(outcome.reply);\n    if (quoted) {\n      return {\n        atomic: [turn, {\n          write: 'append_maia_version',\n          replacementText: quoted[1],\n          supersedes: invocation.authoredAgainstVersionId,\n        }, { write: 'bind_turn_to_version' }],\n        afterAdmission: true,\n      };\n    }\n    return { atomic: [turn], afterAdmission: true };\n  }"
s = open(P).read()
if OLD not in s:
    sys.stderr.write("STALE: anchor not found in %s\n" % P)
    sys.exit(3)
open(P, "w").write(s.replace(OLD, NEW, 1))
