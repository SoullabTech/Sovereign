# Craftsman's Table R1 — live Amplifying proposal

Date: 2026-10-07
Candidate observed: a9794302c2, local port 3741.

## Scope

Retry the existing Amplifying request after the writer reported available API credit. Do not accept a proposal, save a writer version, or apply anything to the manuscript.

## Observation

The previously opened verification tab retained a test-only fetch guard. Its first click sent no editorial request. Reopened the same saved editorial thread normally, verified native fetch and no remaining test guard, then sent one explicit Suggest an edit request through the real canvas button.

The request succeeded. The thread gained one writer turn, one MAIA reply, and one MAIA proposal. The proposal deletes only `increasingly ` from the final sentence of the active Amplifying paragraph. The live manuscript DOM displays one deletion mark; there is no insertion in this proposal.

## Verified state

- Focus remains Amplifying, at canonical code-point interval 596–975 of the Fire section.
- Selected passage retains normal paragraph reflow and its focus bracket.
- Proposal version: 68c9ba7c-1479-4865-8e74-c6f637da851f.
- Editorial thread: 223dd267-9c88-42f6-ab68-a20ff2bd027f.
- Before retry: one earlier failed-request writer turn, zero versions.
- After retry: three turns, one MAIA proposal version.
- The new deletion remains unchosen (`decision=original`).
- Clean Preview retains `increasingly` and matches the original working text after presentation whitespace normalization.
- Returned to Markup and opened the deletion's controls, without accepting it.
- Canonical manuscript response remains byte-identical to the pre-retry response; revision remains 2.
- Application remains null. No Save, Apply, Undo, provider switch, or billing change was performed.

## Boundary

This verifies the live path: focused passage → explicit suggestion request → actual MAIA response → inline editorial deletion → unchanged original Preview. It is not acceptance of the proposed wording or completion of the full writer-synthesis / Save / Apply / Undo gate.

No product code was changed during this verification. The earlier test counts belong to their recorded revisions and were not rerun for this documentation-only observation.
