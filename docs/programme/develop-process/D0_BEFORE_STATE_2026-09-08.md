# D0 — the before-state, preserved **UNTIDIED**

**Parent flow**: `docs/programme/JARVIS-WS2-DEVELOP-PROCESS-ENVIRONMENT_FLOW_2026-09-08.md`
**Repository state**: `49460c6c0`

> **Gate D0**: a later redesign must be comparable to the room that failed. Nothing here is
> rewritten as though the process model had always existed.

---

## The room as it actually is

```text
Develop today   a reading is commissioned → numbered observations o1…oN are listed in the
                reading's own order → each shows evidence ("Rests on"), limits ("Does not
                establish"), a state chip, and a standing control → "talk with MAIA about this"
                opens a thread on ONE observation
```

⭐ **The founder finding, kept verbatim as the thing to be comparable to**: *"Develop is supposed
to be a process environment, not a critique environment alone."*

**What the room does not do**, stated now so a later design cannot quietly claim it always did:
there is no place for the writer's present intention; no entry that does not begin with MAIA's
perception; no path from an observation into the manuscript; no MAIA-proposed prose; no record of
what changed or whether it helped; no continuation.

## Artifacts frozen as the before-state

```text
b60414ea9a9446dd…   13,228   docs/design/contracts/develop-room.md            (contract, UNDISCHARGED)
c759d83f56e3e20a…    7,930   sel-0/SEL-0_DEVELOP_ROOM_SURFACE.patch           (held, not applied)
f9e775dfa8df7637…  542,076   screenshots/writer-develop-desktop.png           DIAGNOSTIC ONLY
b792cdbb539075d1…  208,014   screenshots/writer-develop-mobile.png            DIAGNOSTIC ONLY
2e1ba9a29c252298…    6,374   sel-0/SEL-0_EA_DEVELOP_WALK_2026-09-08.md
b489d19eb546baa0…    4,179   sel-0/SEL-0_CORPUS_01_RETIREMENT_2026-09-08.md
7a329709894be81e…   13,214   lib/manuscript/ask/developmentalSelector.ts
67e920fbba84a30b…    6,124   lib/manuscript/boundary/candidateEligibility.ts
78841b8900d9b757…    7,833   migrations/20260908000001_developmental_reading_f7_eligibility.sql
```

⚠️ **The two screenshots are WALK-FIXTURE-01 diagnostics and are NOT acceptance evidence.** That
fixture was retired as a preparation defect: `manuscript_sections` was never populated, so no
Studio surface could render the Work the reading claimed to be about. They depict the room's
offer state; they do not witness a valid walk.

## Runtime and migration status at D0

```text
selector            ws2-sel0-selector-01 · LOCKED at 64e439f66 · NOT MEASURED
runtime wiring      committed; Develop SURFACE held out (design-canon gate)
migration           20260908000001 · shadow-validated (PG 14.19, 10/10) and applied to the
                    disposable walk DB with the full chain · UNAPPLIED IN PRODUCTION
production          3afa51b9f — predates the selector entirely
F-7 adjudicator     ABSENT. Every real reading freezes `unestablished`; the boundary admits none
EA-DEVELOP-WALK-01  Chapter 4, 17 sections visible and readable, a REAL 8-observation reading,
                    identity PASS, selector NOT run, F-7 env-instrumented in the walk worktree only
SEL-0 corpus 01     RETIRED unrun · Manifest B UNOPENED · no test occurred
SEL-0B              REQUIRED · NOT CREATED
```

## What the walk did and did not establish

```text
ESTABLISHED   the room can present a reading and open a conversation about one observation
ESTABLISHED   a writer can read the Work section by section in the Canvas
ESTABLISHED   the reading binds to exactly the sections the writer can see
NOT ESTABLISHED  that Develop is a place a writer can work
NOT ESTABLISHED  anything about the selector's quality — it was never run against the EA reading
```
