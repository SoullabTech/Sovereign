# DEPLOYMENT-SAFETY-03 · STEP 2B — COMPATIBILITY GATE COMPOSITION

**Date:** 2026-09-21
**Status:** IMPLEMENTED CANDIDATE · COMPOSITION MATRIX LETHAL
**Parent:** `e87875116975fd0d26f3c2855c8d89731117f76c`
**Branch:** `feature/deployment-safety-03-step2b-compatibility-gate-20260921`

## Founder choice carried

Step 2B uses **one admitted review over the exact bundle**.

The migration review and `migration_compatibility` attestation inhabit the same
exact review bytes and share the same externally captured trace identity.

They remain different laws:

```text
review custody
  is this exact review admissible, physically witnessed and still applicable?

migration compatibility
  can this exact old reader tolerate this exact ordered pending schema
  before this exact target reader swaps in?
```

Shared custody does not merge their semantics.

## Pure composition core

`scripts/migration-compatibility-gate-core.ts` is side-effect free.

Six composition laws are separately falsifiable:

1. custody refusal is terminal;
2. compatibility must come from the exact admitted review, never a sidecar;
3. the compatibility target must equal the target custody bound;
4. the exact ordered pending paths and hashes must equal the custody-gated set;
5. compatibility may not substitute an independent witness corpus;
6. compatibility refusal is terminal.

Every law has one defeat candidate.

```text
COMPOSITION MATRIX: LETHAL + DISCRIMINATING
  6/6 defeat candidates died on their named falsifier
  STRICT_COMPOSITION satisfies 6/6 laws
```

The existing DS-03 compatibility matrix remains 10/10 and Review Custody remains
frozen.

## CLI composition

`scripts/review-custody-migration-gate.ts` now composes both laws after the
existing custody checks.

For pending migrations it observes:

- exact target commit;
- exact currently-running old-reader commit supplied by the deployment lane;
- ordered pending migration paths and SHA-256 bytes;
- old-reader evidence bytes recomputed from the exact old-reader git object;
- the **same** `witnessed.files` already produced by Review Custody from the
  admitted review trace.

There is no second trace argument for compatibility.

The compatibility attestation is read only from:

`review.migration_compatibility`

after the exact review bytes have already been matched to the custody record's
admitted `review_sha256`.

Therefore a compatibility sidecar cannot be swapped in after admission.

## Old-reader identity

`scripts/deploy-production.sh` now resolves the old reader from the
currently-running `maia-sovereign` container's `GIT_COMMIT` stamp before any
swap.

If that stamp is absent or does not resolve to a repository commit, pending
migrations refuse.

This does not move migrations. It only supplies the exact old-reader observation
needed by the composed gate.

## End-to-end discrimination

`verify-migration-compatibility-gate-e2e.sh` builds a clean target worktree and
an exact two-tree compatibility bundle, then performs real Review Custody bind
and admit operations.

It proves:

```text
lawful exact review + same admitted trace
  -> composed gate APPLIES

raw trace contains old-reader Read
but admitted custody coverage omits that evidence
  -> COMPATIBILITY_REFUSED
     OLD_READER_EVIDENCE_UNWITNESSED
```

So compatibility cannot borrow an undeclared read merely because it appears
somewhere in the raw trace.

## Preserved boundaries

Step 2B does **not** authorize or perform:

- migrate-before-swap;
- production migration;
- production schema mutation;
- deploy;
- merge;
- historical migration edits;
- weakening of Review Custody;
- a second compatibility trace;
- automatic compatibility inference from SQL shape.

Deployment ordering remains unchanged.

The next act is a separate ordering decision. Only after this Step 2B candidate is
accepted should any act consider changing:

`build -> swap -> migrate`

to a compatibility-gated migrate-before-swap sequence.
