# JARVIS-AIN-PLATFORM-01 · J1 — Falsification Witness

**Date:** 2026-09-17
**Subject:** Runtime Boundary Census
**Claim being tested:** enough current evidence exists to distinguish a real but distributed cross-field substrate from both (a) the old AIN engine package and (b) a falsely claimed already-complete platform.
**Exact canonical SHA:** 34e7fe4eb3acdadb690f403d1c17734fc182209e
**Authority for this act:** J1 read-only census under the programme charter.

## Pre-state

- isolated worktree on chore/ain-platform-01-j1-runtime-boundary-census-20260917;
- canonical base/head 34e7fe4eb3acdadb690f403d1c17734fc182209e;
- no J1 runtime, schema, route, UI, or production modifications;
- only documentary J1 records present in the worktree.

## Instruments

1. Git history/path check for docs/canon/FIELD_MANIFEST.md.
2. Source check of packages/ain-engine/src/index.ts.
3. Consumer search for @maia/ain-engine.
4. Importer search for @/lib/maia/roomComposition.
5. Direct Now What → MAIA import search.
6. custody/status inspection.
## Expected discriminating results

If the “already-separated runtime” claim were true, the existing AIN package should be realized and materially consumed by the applications.

If the “platform already exists” claim were true, Now What should be instantiated against a common field/runtime contract rather than depending directly on MAIA-namespaced implementation seams.

## Result

### FIELD_MANIFEST history

- commit count for docs/canon/FIELD_MANIFEST.md across available refs: **0**
- current canonical path: **ABSENT**

### Existing packages/ain-engine

- placeholder located at packages/ain-engine/src/index.ts line 48:
  - output: 'AIN engine not yet migrated'
- non-package @maia/ain-engine source hits: **1**
- that hit is packages/shared/src/index.ts, an architectural comment rather than application consumption.

### Shared composition seam

Exactly **2** importers of @/lib/maia/roomComposition were found:

1. app/api/maia/vision-studio/interview/route.ts
2. app/api/now-what/interview/route.ts
### Direct Now What → MAIA coupling

Exactly **4** sampled direct MAIA import files were found:

1. app/api/now-what/interview/route.ts
2. app/now-what/arrive/page.tsx
3. components/now-what/NowWhatRoom.tsx
4. components/now-what/NowWhatShell.tsx

## Falsification adjudication

### Mutant A — packages/ain-engine already is the desired constitutional runtime

**Result: FAIL.**

The package is an earlier deliberative-engine object, is placeholder-level, and is not the source of current constitutional field behavior.

### Mutant B — Now What already proves AIN is a platform

**Result: FAIL.**

Now What is a genuine second field/application, but it is manually composed, directly coupled to MAIA seams, and has no canonical common manifest/runtime specification from which both fields are instantiated.

## Post-state

No implementation, schema, route, UI, production state, or constitutional standing changed during the witness.

The only changes are documentary programme records on the isolated branch.
## Freshness reconciliation

The witness was first assembled from canonical 5b5683048c75087f8bc611fb55e6628cf2983687. Canonical then advanced to **34e7fe4eb3acdadb690f403d1c17734fc182209e**. Intervening changes were H8 relational-field-shadow and voice work with no material overlap in the J1 evidence seams. All discriminators were rerun at 34e7fe4eb and remained: Field Manifest history 0/current absent; AIN placeholder 1; non-package AIN-engine hits 1; roomComposition importers 2; direct Now What→MAIA coupling files 4.

## Adjudication

**J1: PASS — bounded claim only.**

**Proves:** the AIN platform programme has a real evidentiary substrate to formalize, and the current boundary is distributed/entangled rather than already packaged.

**Does not prove:** that any particular implementation family is AIN-generic, that MAIA-specific canon is portable, that a Field Manifest is authorized, that extraction may begin, or that AIN Studio/open-source work may proceed.

**Next exact act:** J2 — Founder Adjudication on the three authority questions named in the Gap Register.

**Still not authorized:** constitutional promotion, runtime extraction, renaming code, schema changes, member-facing change, merge, deploy, production write, open-source publication.
