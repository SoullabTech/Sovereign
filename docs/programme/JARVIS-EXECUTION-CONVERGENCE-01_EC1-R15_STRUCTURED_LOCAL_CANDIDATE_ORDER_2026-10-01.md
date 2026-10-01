# JARVIS-EXECUTION-CONVERGENCE-01 / EC1-R15 — Structured Local-Candidate Order

**Date:** 2026-10-01  
**Parent:** EC1-R14 inspection verifier executor `f5482ff414fb`  
**Class:** pre-implementation ordering constitution  
**Delegate/runtime changes:** NONE

## Existing Path A order

The current local-native delegate does:

`MODEL → NPA1 APPLY → LEGACY SHELL VERIFY → optional MODEL REPAIR → LEGACY SHELL VERIFY → rollback on failure → JARVIS candidate commit → result contract`

The runtime then independently replays the same legacy shell verification after reading the result.

Therefore replacing only the runtime replay would leave the unsafe shell effect in the delegate twice.

## Frozen structured-v1 order

The first converged cut must instead be:

`MODEL → NPA1 APPLY → CANDIDATE COMMIT → CUSTODY VERIFY → STRUCTURED INSPECTION → VERIFIED`

with these additional laws:

- no legacy shell verifier on structured-v1;
- no model repair turn on structured-v1;
- candidate custody is proved before structured verification;
- structured verifier PASS is required for VERIFIED standing;
- verifier failure rolls the candidate worktree back without erasing attempt evidence;
- crash after candidate commit does not rerun model or reapply patch; next lawful action is to verify the existing candidate;
- a passing candidate may progress to W4 projection;
- legacy mode remains unchanged.

## Matrix

Reference: **10/10 PASS**.  
Defeat candidates: **10/10 killed on named law**.  
Every defeat candidate changes exactly one decision.  
No collateral deaths.  
Matrix: **LETHAL + DISCRIMINATING**.  
Freeze: **INTACT**.

## Standing

```text
Legacy Path A order:              OBSERVED
Structured-v1 order:             FROZEN
Legacy shell on structured path: FORBIDDEN
Model repair on structured path: FORBIDDEN (first cut)
Candidate commit before inspect: REQUIRED
Custody before inspect:          REQUIRED
Crash after commit:              VERIFY EXISTING, NO REPLAY
Legacy behavior:                 UNCHANGED
Delegate implementation:         NOT YET OPENED
```

The next act may implement only a **structured-v1 branch inside local-native delegation/runtime** that preserves the legacy branch untouched. It must create the candidate before structured inspection, skip legacy shell/eval and repair entirely, then let the runtime prove custody and invoke EC1-R14 inspection verification.
