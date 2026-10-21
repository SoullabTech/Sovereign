# MAIA-MEMORY-ATTRIBUTION-01 / R1R2 — Class A Admission Hold

**Date:** 2026-10-02
**Standing:** GOVERNANCE HOLD · no new implementation authority
**PR:** #1666
**Branch:** `fix/maia-memory-attribution-shadow-r1-20261001`
**Current canonical reconciled:** `origin/clean-main-no-secrets @ f1c1f96f8531a1812630311cc8d36559995d5e80`

## Finding

Engineering acceptance for R1 is green, but canonical admission is not presently authorized.

The current Class-A custody law requires concurrence from a genuinely distinct human custodian for a self-authored Class A change.

Canonical currently records:
- no constituted second human custodian;
- self-authored Class A admission as FAIL CLOSED until that custodian exists;
- #1671 as a historical admission exception relative to that law;
- #1633 as a second historical admission exception relative to that law.

Therefore #1666 must not be merged merely because CI is green.

## Engineering state

At the last current-canonical witness:
- CMT + MemoryBundle shadow: 48 pass / 0 fail / 229 expectations;
- developmental ancestry coexistence: 6 pass / 0 fail / 10 expectations;
- combined focused suite: 54 pass / 0 fail / 239 expectations;
- TypeScript no-regression: 0 regressions;
- prompt bytes remain unchanged;
- R1 introduces no prompt-label, M3, P6/Path B, schema, ranking, retrieval, or authority widening.

## Admission condition

This hold clears only when canonical evidence establishes a lawful Class-A custody path applicable to the exact PR head, for example:

1. a genuinely distinct human custodian is constituted under CANONICAL-ADMISSION-ENFORCEMENT-01; and
2. that active custodian gives an exact-head APPROVED review for #1666;

or a later canonical founder ruling lawfully supersedes the present fail-closed custody law.

Absence of mechanical GitHub enforcement is not admission authority.

## Non-precedent

The #1671 and #1633 historical exceptions do not authorize repeating the exception.

They establish the opposite: engineering acceptance and canonical-admission custody are distinct boundaries.

## Disposition

```text
R1 implementation                     COMPLETE
current-canonical reconciliation      COMPLETE
engineering acceptance                GREEN
Class A second-human custodian        ABSENT
exact-head independent approval       ABSENT
canonical admission                   HELD / FAIL CLOSED
merge                                 NOT AUTHORIZED
production                            NOT OPENED BY THIS RECORD
```

Next lawful act: constitute the second human custodian under the existing admission programme, or continue fail-closed.
