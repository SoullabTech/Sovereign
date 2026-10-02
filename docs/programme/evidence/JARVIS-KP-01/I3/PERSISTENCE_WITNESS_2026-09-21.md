# JARVIS-KP-01 / I3 — Persistence Witness

**Candidate base:** `2eb441edf8577b35b25e63b6e3cc5e8f6aa3738b`
**Data class:** SYNTHETIC ONLY
**Production DB:** untouched

## Constitutional instruments

| Instrument | Result |
|---|---|
| `npm run matrix:epistemic-join-i3` | **18/18 PASS** |
| `npm run test:epistemic-join` | **104/104 PASS · 4 suites** |
| `npm run typecheck:epistemic-join` | **EXIT 0** |
| `npm run typecheck` | **229 vs 239 baseline · 0 regressions · EXIT 0** |
| `npm run db:verify-bootstrap` | **PASS** with I3 migration present |
| `scripts/witness/epistemic-join-i3-db-witness.sh` | **PASS** |

## Database witness

The disposable PostgreSQL witness proves:

1. I3 migration constructs on an empty minimal substrate.
2. The actual store adapter writes an initial admission.
3. A successor admission appends without rewriting prior custody.
4. A stale expected admission tip is refused.
5. UPDATE of immutable join custody is refused.
6. DELETE of immutable admission custody is refused.
7. A second successor from one standing act is refused.
8. A second successor from one admission is refused.
9. An admission claiming downstream representation authority is refused.
10. Transaction rollback leaves no partial join record.
11. The derived current-standing view resolves the un-superseded admission.
12. Manual rollback followed by the migration reconstructs the I3 schema.
## Full blank-bootstrap evidence

Before the focused witness was narrowed, the repository's canonical empty-DB
instrument completed successfully:

`VERIFY_DB=maia_i3_bootstrap_20260921 npm run db:verify-bootstrap`

Result:

> **BOOTSTRAP VERIFIED — a blank PostgreSQL database became a bootable MAIA schema.**

A later repeat encountered PostgreSQL `No space left on device` while loading
the 2026-09-01 baseline. This is recorded as host-capacity evidence, not silently
reclassified as an I3 migration failure.

## Non-authority scan

The I3 matrix proves there is no application/runtime import of
`epistemic-join/persistence`. The adapter has no public read API, the core
`projection.ts` remains absent, and the top-level I2 pure module remains the
same six TypeScript files.

The feature flag is tested OFF for absence, empty string, `0`, and `true`.
Only literal `1` enables the writer.

## Standing

> **APPEND-ONLY CUSTODY PROVEN · CRASH/STALE-WRITER FAIL-CLOSED · REPRESENTATION CLOSED**

This witness does not establish production suitability, automatic derivation of
epistemic structure, I4 shadow correctness, or any right to activate the flag.
