# WRITERS-STUDIO-INSPIRATION-OPENING-01 · S1 — Witness Record

**Subject:** the Spark door (S1). Branch `feature/ws-inspiration-opening-20261111`, code commit `60ed7ebbe8`
on base `origin/clean-main-no-secrets` `7f05fa8a46`.
**Authority:** founder direction and rulings Q1–Q4 (2026-11-11), "make this a JARVIS flow".
**Scope of the act:** local build and verification only. Nothing pushed, merged, migrated or deployed.

## Pre-state
A brand-new writer met Home's "What are you beginning?" with three buttons and six rooms in the bar, and MAIA
said nothing at the door (census, 2026-11-11).

## Instruments
1. Falsifier suites (jest): `lib/writersStudio/__tests__/inspirationOpening.test.ts` (F1–F6, F9, F11),
   `app/api/sovereign/writers-studio/arrival/__tests__/route.test.ts` (F7, F8, F10),
   `lib/manuscript/ask/__tests__/arrivalContext.test.ts` (F8).
2. Controlled mutants, applied one at a time to the built code and then restored.
3. `npm run typecheck` (no-regression gate on `tsconfig.ship.json`).
4. Neighbouring suites: `app/writers-studio/__tests__`, `app/dev`, `lib/manuscript/ask/__tests__`.
5. Local walk: `scripts/witness/ws-continuity-walk.sh up` on this worktree (stand-in model, isolated state
   `/tmp/ws-continuity-walk-spark`, ports 3131/54349), with two fictional zero-Work writers added to that throwaway database.

## Results

**Falsifiers:** 26 tests across 3 suites, all PASS.

**Mutants.** Every one went red:

| Mutant (weaker candidate) | Red |
|---|---|
| M1 hold check removed: "yes, you heard me" becomes adoption | 2 failed |
| M2 Sanctuary check removed | 1 failed |
| M3 never-reached check removed | 1 failed |
| M4 MAIA's reflection held instead of the writer's words | 3 failed |
| M5 route gains a database import | 1 failed |
| M6 route skips the pilot check | 1 failed |
| M7 arrival rendered without its own frame | 2 failed |

**Typecheck:** 214 errors, baseline 214. No regressions.

**Neighbours:** 185 suites; 183 pass. The 2 failures (`__tests__/arrival-threshold-exit`,
`__tests__/arrival-visual-viewport`) are `/maia` voice-page source checks that read files this lane does not touch.
They are inherited. Separately, `lib/manuscript/ask/__tests__/askSourceCloseout.test.ts` has 1 failure: a source pattern
in `app/api/sovereign/manuscripts/[id]/ask/route.ts`, which this lane does not touch. Also inherited.

**Walk, writer 1** (Ordinary path; screenshots `1-door` through `7-write-entered` in the session notes folder):
- The door shows on first visit with no room bar.
- Answer → the reflection goes through the route and `askMaia` (stand-in text).
- Yes → the posture is unknown on this device, so MAIA asks Ordinary or Sanctuary before anything can be kept.
- Sanctuary → "I won't keep this: not the spark, and not our conversation."
- Switch to Ordinary → the separate hold question → Hold it in my words → Where to begin.
- Guide me → working style `{"pace":"intimate","explanation":"plain"}`.
- Write the first page → Write opens and the rooms appear.
- Database: one Work. `purpose` equals the writer's sentence **byte-for-byte**. A scan of every public table finds the
  words only in that one row. They appear in neither `app.log` nor `stub.log`.

**Walk, writer 2** (Sanctuary from the door, then Yes → Continue → "I don't know yet"):
- **Zero Works created.**
- The answer text appears in **no table** and not in `app.log`.
- The door is set aside to Home's ordinary threshold.

## What this proves
- On this branch, locally, with the stand-in model: the door appears only for a writer with no Works and no writing.
- Only the writer's own words, held by their own separate act in a readable Ordinary posture, reach the Work.
- Sanctuary, "not yet", unsure answers and never-reached holds keep nothing.
- The opening conversation is stored nowhere.
- The reply comes through `askMaia`.

## What this does not prove
- **How MAIA's real reflection reads.** The stand-in model returned a canned line. Level-fit and the "never define the
  Work" frame need a `REAL_MODEL=1` walk on fictional text.
- **That it feels like the magic.** That is the founder's walk.
- Production, the hotfix branch, phone width, or the import-with-spark path. The last was built and unit-reasoned but
  not walked; its failure path is an explicit notice, never a silent drop.

## Walk findings for the founder
1. "I don't know yet — look around" with nothing held lands on the old *"What are you beginning?"* screen. It works and
   is honest, but it's the screen the founder called intimidating. A gentler landing would be a small follow-up.
2. Entering Write still shows the old blank-page overlay and *"I haven't read this book yet… Read my book"* on an empty
   Work. That is S3/S5 scope, as designed.

## Adjudication
**S1 BUILD/VERIFY: PASS** (bounded: local, stand-in model).
**Next gate:** founder walk (human stop). Then a PR to `clean-main-no-secrets` for founder review. Merge and deploy are
separate founder acts. S2's migration stays HOLD.
