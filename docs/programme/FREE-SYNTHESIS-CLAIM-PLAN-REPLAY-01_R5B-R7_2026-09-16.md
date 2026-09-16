# FREE-SYNTHESIS-CLAIM-PLAN-REPLAY-01 — R5b–R7

**Status:** COMPLETE · STOP
**Date:** 2026-09-16
**Canonical base:** `bfdc06f71176841f62b3805806dc52f6433e08cd`
**Production-equivalent replay model:** `claude-sonnet-4-6`
**Authority:** offline replay/falsification only

## R5b bounded repairs

Three missing primitives were added without serving integration:

1. **Local claim handles** — model-local `localId` / `targetLocalIds` resolve deterministically to stable claim IDs. The model names the relation; code resolves identity.
2. **Historical reference** — `historical_only` may be used by a GROUNDED claim only to report superseded/corrected material as history, never as present truth.
3. **Unresolved-reference system fact** — an explicit `system_fact` may ground honest abstention when no exact antecedent is resolved.

R5b primitive suite: **5/5 PASS**.
## Focused replay

Only previously failing fixtures were rerun: F2 candidate discipline, F3 member correction, F5 opaque reference. Two passes each; one deterministic-error repair permitted.

| Fixture | First-pass | Final |
| --- | ---: | ---: |
| F2 Candidate discipline | 1/2 | 2/2 |
| F3 Member correction | 2/2 | 2/2 |
| F5 Opaque reference | 2/2 | 2/2 |

Totals: **5/6 first-pass valid; 6/6 final valid; 1 repair; 0 final failure modes.**
Candidate confirmation/adoption binding passed **2/2**.

The earlier full replay remains evidence of the pre-repair state: 3/10 first-pass and 5/10 final valid. The focused rerun does not erase that history; it demonstrates the bounded repairs against the exact failed classes.

## Engineering standing

- prospective + standing tests: **45/45 PASS**
- `npm run typecheck`: **PASS**, 229 diagnostics vs 239 baseline, zero regressions
- no serving-path integration authorized or introduced by this lane
## R7 adjudication

**PASS for offline claim-plan replay.** The architecture now demonstrates that production-equivalent Sonnet can propose plans that survive deterministic standing, evidence-descent, claim-identity, targeting, and rendering checks across the previously failing classes after the bounded R5b repairs.

The constitutional criterion is satisfied in this lane: **a model mistake does not silently acquire authority.** Invalid first proposals are rejected; one bounded repair may be attempted; unresolved invalidity remains inadmissible.

This does **not** authorize live cognition exposure. It does not prove production latency, conversational naturalness under full MAIA prompt load, or safe live failure handling. Those require separate founder authority.

## STOP

`FREE-SYNTHESIS-CLAIM-PLAN-REPLAY-01` stops here. No prompt deployment, serving integration, live cognition exposure, member-facing behavior, schema migration, memory write, or production response change follows automatically.
