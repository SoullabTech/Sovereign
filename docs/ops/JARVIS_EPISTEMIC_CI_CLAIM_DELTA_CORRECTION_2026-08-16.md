# JARVIS Epistemic CI — base-relative claim delta correction

**Date:** 2026-08-16
**Authority:** founder ruling 2026-08-16 (R1–R4), issued after the defect was demonstrated.
**Unit:** narrow gate correction. ⛔ Changes **selection semantics only**, never evidence custody.
**Base:** `0863838cb` (PR #1054, which admitted the gate).

## The defect

`scripts/builder/epistemic-ci.mjs` enumerated **every** `.json` under `.ain/claims` in the **head**
checkout and required one freshly appended ledger transition for each. Because an admitted claim
record stays in the tree, every subsequent PR looked as though it had resubmitted all prior claims.

Demonstrated by control, not inferred:

```text
canonical 0863838cb adjudicated against ITSELF  →  BLOCKED
  [LEDGER-DELTA-MISMATCH] JARVIS-ADMISSION-001:
      adjudicated but no corresponding appended ledger row
```

A no-op PR was refused. **The gate admitted at #1054 blocked every subsequent PR to
`clean-main-no-secrets`, including one that changed nothing.**

⚠️ The bug was never that the claim file survives admission. It is that **survival was being read as
resubmission**. The fix is to selection, not to custody.

## The ruling implemented

**R1 — canonical claim records are prior evidence, not new submissions.** A claim present at the PR
base is not adjudicated again merely because it remains in the tree.

**R2 — submitted claims are base-relative additions.**

```text
HEAD .ain/claims/*.json  MINUS  BASE .ain/claims/*.json  =  CLAIMS SUBMITTED BY THIS PR
```

Adjudicated against the ledger read from the base SHA, in deterministic filename order.

**R3 — existing canonical claims are immutable.** Unchanged → ignored as historical evidence;
modified → `CLAIM-HISTORY-MUTATION`; deleted → `CLAIM-HISTORY-MUTATION`. Correct an old claim by
submitting a **new claim/revision identity**, never by rewriting the historical submission.

**R4 — the ledger stays transition history, not merge history.** For `N` newly submitted claims
there must be exactly `N` derived rows. `0` new claims with `0` delta is a valid no-op reported as
`PASS / NOT_APPLICABLE`; `0` claims with `1` row still **BLOCKS**.

⛔ **`JARVIS-ADMISSION-001` was not pruned.** Deleting admitted claim records was considered and
rejected: keeping the claim file immutable preserves durable provenance — *submission* plus
*canonical adjudicated transition*. No duplicate ledger row was written, and no transition was
fabricated to obtain a green run.

⛔ **Zero new claims is not a failure.** #1054 scopes Axis 1 to claims actually submitted; requiring
one per PR would manufacture epistemic activity. A rule that certain change classes **must** submit a
claim belongs in a separate path/change classifier — ⛔ not smuggled into the adjudicator.

## Controls

`scripts/builder/__tests__/epistemic-ci-proof.mjs` — **29 passed · 0 failed** (was 18).

```text
zero claims, zero delta                        → PASS / NOT_APPLICABLE
canonical vs itself                            → PASS      ⭐ permanent regression
base claim + 1 new claim + matching row        → PASS
base claim + 1 new claim + no row              → BLOCK
ledger row appended with no new claim          → BLOCK
canonical claim modified                       → BLOCK
canonical claim deleted                        → BLOCK
2 new claims, 1 row                            → BLOCK
2 new claims, 2 derived rows                   → PASS
```

Every pre-existing negative control still passes; `epistemic-guard-proof.mjs` remains **49/0** and
the guard artifact is **byte-unchanged** — this unit never edits the instrument it invokes.

### Mutation validation — the controls can go red

A control that cannot fail is not evidence. Each was deliberately broken:

| mutation | result |
|---|---|
| restore "all head claims" selection (**the original defect**) | 22/7 — the regression control catches it |
| remove the R3 immutability check | 28/1 |
| allow a row with no new claim | 28/1 |

## Superseded assertion

The prior proof asserted *"zero claim records BLOCKS — absence is never success."* That is
**overturned by R4** and replaced, not deleted — the superseding rationale is recorded inline at the
scenario. The bypass it guarded (skipping epistemics to dodge the gate) is now covered by the
stronger control: **a row may never be appended without a submission.**

## Reported, not repaired here

`docs/ops/JARVIS_EPISTEMIC_GUARDRAILS_2026-08-11.md` still carries the status line *"built + proved
locally. **NOT wired into any hook, gate, or CI path**"*. That became false when #1054 wired it into
authoritative CI. ⛔ Left untouched: it is #1054's staleness, not this unit's, and absorbing adjacent
defects because they were discovered is how a narrow correction stops being narrow.

## Not authorized by this unit

- ⛔ no change to `scripts/builder/epistemic-guard.mjs`
- ⛔ no ledger row appended, no claim record pruned, modified, or created
- ⛔ no change to what evidence classes can carry which status
- ⛔ no Living Spiral content — that lane stays held at `cb075a4e5`, unpushed
