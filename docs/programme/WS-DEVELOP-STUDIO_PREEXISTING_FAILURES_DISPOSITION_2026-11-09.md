# The nine pre-existing test failures — disposition (2026-11-09)

All nine fail at `493f2d6da` (before this lane's Develop work) and the two real ones also fail on today's canonical `84e12cf00`. None is caused by this lane; none is fixed here (each belongs to its owning lane). Evidence: each run on its own last commit, on this branch, and on canonical.

| Suite | Cause | Evidence | Disposition |
|---|---|---|---|
| `lib/writersStudio/listen/__tests__/{browserCaptureInfo,fullPrefaceReading,micLevel,monoCaptureRoute,readingAtmosphere,wavExport}.test.ts` (6) | Written for **Vitest**, collected by **Jest** (`npm test` = jest); fails to load ("Vitest cannot be imported in a CommonJS module") | `npx vitest run` → all pass | **Runner mismatch, not a product failure.** Fix belongs to the Listen lane / test config: exclude Vitest files from Jest's `testMatch` and run them in a Vitest script. |
| `lib/writersStudio/publish/__tests__/kdpCoverGeometry.test.ts` | Same runner mismatch | `npx vitest run` → 5/5 pass | Same, Publish lane. |
| `lib/manuscript/ask/__tests__/askSourceCloseout.test.ts` (1 of 35) | Pins source text `existing.reading.kind !== 'developmental'` in the Ask route, removed by `d6fe58f63` (flagship R2-2, 2026-09-23) | 35/35 at `3bc700c4f`; fails on this branch and on canonical | **Stale pin or moved guarantee — owning lane (flagship R2-2) to decide.** Code-read suggests the guarantee ("a developmental thread never reaches the structure frozen side") is now held by the anchor branch, but that is not established here. |
| `lib/writersStudio/__tests__/manuscriptImportWork.test.ts` (4 of 18) | Import route returns 500 where 201/409 expected (mocked transaction) after the import fixes | 18/18 at `417440308`; fails on this branch and on canonical; route changed in `06d031d5e` / `66e5159b2` (2026-11-03/04) | **Real regression in the import lane's test or route — import lane to repair.** Not attributed further here. |

Net: 7 are a runner mismatch (31 tests pass in their own runner); 2 are canonical defects owned by other lanes. This lane's own suites are green.
