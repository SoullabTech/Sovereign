# Founder Ruling — Closed Loop 1, Step 5 Review

**Date**: 2026-08-09 · **Status**: RULED. **Review boundary: HOLD.**
**Subject**: `docs/architecture/CLOSED_LOOP_1_DESIGN_AND_PROOF_2026-08-09.md` steps 1–5
**Artifacts reviewed**: `scripts/builder/{orient,continue}.mjs` ·
`scripts/builder/__tests__/{orient,continue}-proof.mjs` · `.claude/skills/{orient,continue}/SKILL.md` ·
`docs/handoffs/feature-labtools-redesign_2026-08-09_closed-loop-1-steps-1-5.md`

---

## Disposition

| item | status |
|---|---|
| **Steps 2–5** | **ACCEPTED / COMPLETE** |
| **Residual-102 class A** | **NOT STARTED** |
| **Dormant proof-suite binding** | **OPEN — Horizon IV / Residual-102 review** |
| **Production governance binding** | **NOT CLAIMED** |
| **First packet** | **VALID LIVE ARTIFACT** |
| **Review boundary** | **HOLD** |

## Accepted with one explicit limitation

- 33/33 orientation proofs pass · 27/27 continuation proofs pass.
- All continuation rules are mutation-tested — a broken packet must fail, or the rule is decorative.
- Ahead/behind semantics are independently derived (two-dot ranges) and protected against
  **symmetric parser failure**.
- The empty-set (`∅`) case is a permanent regression test.
- The first handoff packet is **genuinely produced from a real work cycle**, not reconstructed.
- Four UNKNOWNs remain `PRESERVE` / `not_measurable` — none fabricated into positive claims.
- Governance decisions remain **cite-only**.
- The packet's own dirty-count drift (`claimed 245 → measured 248`) was **detected during live
  work, unforced and uninjected**.
- Unsupported claims are rejected: `typecheck passes` · raw `head_sha` outside DRIFT PROBES · raw
  trunk counts · multi-item next actions · present-state headings.
- `memory staleness` remains honestly `UNKNOWN`.

**⛔ THE LIMITATION**: no production or source behavior beyond the newly introduced untracked
Step 1–5 implementation has been implicitly certified. **27 green tests establish the behavior of
the new instruments; they do not establish that those instruments are governance-bound controls.**

## The strongest evidence

Not the test count. **The system caught real live drift that nobody injected**:
`dirty: claimed 245 → measured 248 → DRIFTED`. That demonstrates the loop is comparing a packet's
claims against **current repository reality**, not merely validating a well-formed fixture.

## The four-rung distinction this ruling establishes

> **instrument exists → instrument works when invoked → instrument is reachable → instrument is
> authorized to constitute proof**

**Steps 1–5 demonstrated the first two. They explicitly do not claim the latter two.**

Therefore the governing status is:

> **Closed Loop 1 is operationally demonstrated, but NOT yet constitutionally bound as a
> governance control.**

## Dormant proof instruments — acknowledged, not bound

The two proof suites are themselves dormant (no invocation boundary), the same pattern as the 61%
in `docs/ops/INSTRUMENT_REGISTRY_2026-08-09.md`. The architectural question this raises —
***can an instrument that is itself dormant legitimately certify another workstream?*** — is real,
and answering it now would convert Step 5 into Horizon IV work.

**Recorded**: *dormant proof instruments discovered → acknowledged → **not bound** → deferred to
Horizon IV / Residual-102 review.*

## Why the grammar matters beyond this loop

Refusing `verified: typecheck passes` for underspecified evidence prevents a **true-sounding
statement from being promoted into an established fact without a defined measurement**. Carrying
`ahead_of_trunk: 10` rather than `trunk_counts: 0 10` keeps a machine-readable fact's **semantics
attached to it**. Both are the same discipline AIN is establishing in memory:

> **claim → evidence → provenance → authority → current status** — never **claim → green checkmark**

## Next action (founder-held)

Review whether steps 1–5 have earned their intended status. **⛔ The next action is not more
Builder OS construction.** This ruling supersedes the `NEXT COHERENT ACTION` of the first packet,
which is left unamended — a packet is an immutable witness of the episode that produced it.
