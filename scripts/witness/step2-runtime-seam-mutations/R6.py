#!/usr/bin/env python3
"""
R6 · the minted identity and time are replaced by database defaults.

THE LAW UNDER TEST
    the application mints `id` and `authorizedAt`
    persistence must carry THOSE EXACT FACTS, not equivalent-looking ones

THE KNOWN-BAD IMPLEMENTATION THIS BUILDS
    `authorize()` still receives mintedId + mintedAt, so the PURE act is
    unchanged and still claims those values. The INSERT simply omits the two
    columns, so `gen_random_uuid()` and `now()` substitute different ones. The
    fidelity check must then throw, and the witness must report it by name.

    `operation` REMAINS explicitly persisted — this mutant is about identity
    substitution, not about reopening the operation-source question.

WHY THIS FILE EXISTS
    ⚠️ INSTRUMENT DEFECT, founder-diagnosed 2026-09-14. The bash-string version
    of this operator still targeted the PRE-`operation` INSERT: it matched
    `VALUES ($1 … $10)` when the lawful store now binds eleven parameters. The
    column and argument removals applied; the VALUES rewrite did not. It
    therefore manufactured

        9 columns · 11 placeholders · 9 arguments

    — invalid SQL, so the witness crashed before it could judge the fidelity
    law. ⛔ That was never evidence about `authorizeVersion()`, and a crash is
    not a kill: the obligation stood UNPROVEN, not discharged.

    A stale mutation operator is an instrument defect. The answer was never
    wrong; the question had rotted.

    ⛔ Every replacement below asserts. A transform that silently matches
    nothing is exactly how the defect survived a full harness run looking green.
"""
import sys

path = 'lib/manuscript/revisionAuthorization/store.ts'
s = open(path).read()

def cut(old, new):
    global s
    assert old in s, f'R6 operator is stale: it no longer matches\n{old}'
    s = s.replace(old, new, 1)

# 1 · the two columns the application is supposed to own
cut("""         (id, member_id, proposal_chain_id, proposal_version_id, work_id, draft_id,
          base_version, target_section_id, expected_text, operation, authorized_at)""",
    """         (member_id, proposal_chain_id, proposal_version_id, work_id, draft_id,
          base_version, target_section_id, expected_text, operation)""")

# 2 · the placeholder list, kept in arity with the columns above
cut("       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)",
    "       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)")

# 3 · the arguments, minus mintedId and mintedAt, operation retained
cut("""      [mintedId, memberId, chain.id, version.id, g.workId, g.draftId, g.baseVersion,
        g.targetSectionId, g.expectedText, g.operation, mintedAt]);""",
    """      [memberId, chain.id, version.id, g.workId, g.draftId, g.baseVersion,
        g.targetSectionId, g.expectedText, g.operation]);""")

open(path, 'w').write(s)
sys.stderr.write('R6: 9 columns · $1..$9 · 9 arguments\n')
