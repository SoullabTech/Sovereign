# DEPLOYMENT-SAFETY-03 · MIGRATION COMPATIBILITY CONTRACT

**Date:** 2026-09-21
**Status:** CONTRACT + FALSIFIER CANDIDATE · DEPLOY BINDING NOT YET TAKEN
**Opened from:** REVIEW-CUSTODY-01 Step 3R at 603ed692fe1c1bf80e525c689418c4e3a7dee841

## The missing proposition

Review Custody asks whether the exact migration review was physically witnessed,
admissible and still applicable.

Migration Compatibility asks whether the exact OLD reader can safely remain live
after the exact ordered pending migration set is applied if the candidate reader
never swaps in.

The second proposition is what makes migrate-before-swap recoverable.

## Not timeless migration metadata

A declaration such as reader-compatible=yes on a SQL file is insufficient.
Compatibility is relational. Version 1 binds the exact old-reader commit, exact
target-reader commit, ordered pending paths, SHA-256 of every pending migration,
old-reader source bytes relied upon, physical Read witnesses, rationale and
limitations.

Order is law because the migration runner executes a sequence. Set equality is
not sufficient.

## Old-reader source provenance

Each old-reader evidence item carries:

    repo_path   path inside the old-reader commit
    sha256      bytes recomputed from that exact commit
    trace_path  path physically opened by the independent reviewer

A commit label without byte custody is not evidence.

## What the evaluator proves

evaluateCompatibility() is pure and side-effect free.

An applies result means only that an already-authored compatibility claim is
still about the exact deployment relation and evidence it says it reviewed.
It never means the semantic claim is true. Truthfulness still belongs to the
independent physically-witnessed review boundary.

## Ten falsifiers

1. INCOMPATIBLE never authorizes.
2. Old-reader commit movement refuses.
3. Target-reader commit movement refuses.
4. Ordered pending-set movement refuses.
5. Migration byte movement refuses.
6. Duplicate pending paths refuse.
7. Missing old-reader source evidence refuses.
8. Moved or unwitnessed old-reader evidence refuses.
9. Any pending migration without a Read witness refuses.
10. Rationale and limitations may not silently default.

Every law has a competent wrong implementation as a defeat candidate.

## Boundary not yet crossed

This act does not move migrations before the swap and does not alter
deploy-production.sh.

After the matrix is lethal, the next act is to compose this evaluator into the
existing pre-swap review-custody gate and define a reviewer bundle that
materializes both the exact old-reader git object and target pending set.

Production remains untouched.

## First matrix run — two suite defects, both repaired

The first execution went RED for the instrument around the law, not for STRICT:

- MC-DC5 carried a stale collateral declaration that did not fire. The claim was
  removed rather than inventing collateral.
- MC-DC8 survived because MC-F8 supplied no suffix/basename near-miss at all.
  The falsifier was repaired to present an actual near-miss old-reader path.

After repair:

    COMPATIBILITY MATRIX: LETHAL + DISCRIMINATING
      10/10 candidates died on their named falsifier
      STRICT_COMPATIBILITY satisfies 10/10 laws
      all collateral CLASSIFIED
      typecheck exit 0

Neighbour standing remained unchanged:

    REVIEW-CUSTODY freeze   INTACT
    Step 1 matrix           14/14
    Step 2 matrix            8/8

No deployment surface changed.
