# SEL-0 · Writer's Studio developmental selector — **IMPLEMENTED · NOT WIRED · NOT MEASURED**

**Branch** `feature/jarvis-ws2-sel0-production-discovery-2026-09-08`
**Contract** `ebcb46d0d` §2.1–§2.10 + the Q12 amendment · **Instrument** `af155f414`
**Fixture** locked at Step 4 · `58f033adc`

Built against the ratified product contract and synthetic fixtures only. **Manifest B was not
opened. Manifest C and the source snapshot were not used as examples, not consulted for tuning,
and not read during implementation.** No provider was called. The selector has never been run on
the frozen 19. The founder blind is intact.

---

## 1 ⛔ The product gap is NOT closed, and the reason is a collision between two ratified instruments

The route wiring the contract requires **cannot be written without breaking a different ratified
boundary**, so it was not written.

```text
CONTRACT §2.3     a lawful candidate is F-7 eligible AND standing != 'dismiss'
                  AND not superseded
CONTRACT §2.9     the selector is invoked from
                  app/api/sovereign/manuscripts/[id]/ask/route.ts POST

D5  (BUILD-07F)   standing NEVER reaches MAIA cognition — enforced as a
                  module-graph property, with that exact route named as a
                  COGNITION ROOT
                  lib/manuscript/standing/__tests__/standingOutsideCognition.test.ts
```

Enforcing the ratified boundary at the ratified invocation point requires the ask route to read
standing. D5 forbids exactly that, and it is not advisory — it is a walk over the real import
graph, itself falsified against a doctored overlay so it cannot pass vacuously.

**Both instruments are ratified. Neither may be weakened to keep the flow moving.** So the wiring
stops here and returns a founder question rather than a repair:

```text
WITHHELD   the import of currentStandings into the ask route
WITHHELD   the DevelopRoom commission surface, which has nothing to call
NOT DONE   adding the route to D5's permitted set
NOT DONE   enforcing the boundary without the dismiss predicate
```

⛔ **The second of those was available and is the one to be most suspicious of.** Passing an empty
standing map would have made everything compile, every test pass, and the gate stay green — while
silently dropping Q5, under which `dismiss` is sticky and reversible only by the writer. It would
have looked exactly like success.

### The question for the founder, stated once

> Standing is currently barred from the ask route because standing must not influence what MAIA
> *thinks*. The selector needs it for the opposite purpose: to constrain what MAIA may *offer*.
> Are those the same thing?

Three resolutions are visible; **none is chosen here**, and each has a different cost:

```text
a  amend D5 to admit the ask route as a standing READER for boundary
   enforcement only        — narrowest, but puts standing in the cognition graph
b  enforce the boundary in a non-cognition seam the route does not import
   — preserves D5, needs a seam that does not presently exist
c  carry standing from the client in the commission
   — no import at all, but makes Q5's stickiness client-asserted, so a
     dismissal would no longer be authoritatively enforced
```

⚠️ **(c) is the tempting one and the worst one.** It is the smallest diff and it quietly moves
lifecycle authority from the store to whatever the browser sends.

---

## 2 · What was built, and what it is

```text
lib/manuscript/ask/selectionCommission.ts    the writer's explicit commission — its own
                                             field, its own strict parser, never an anchor
lib/manuscript/ask/f7Eligibility.ts          F-7 eligibility as the runtime can establish it
lib/manuscript/ask/developmentalSelector.ts  the gates (pure) and the selector
lib/manuscript/ask/__tests__/developmentalSelector.test.ts   39 falsifiers, synthetic only
```

**No benchmark-only path was created.** The selector calls `runStructured` — the same
orchestration seam `askMaiaDevelopmental` uses — with no `tools` key and no `execution` key, so
the capability is absent rather than disabled. There is no evaluator, no scorer, no harness, and
no second model path.

### The gates, in the contract's order

```text
1  SELECTION_BOUNDARY_UNMEASURED   ANY observation unmeasured -> stop
2  NO_LAWFUL_CANDIDATE             nothing survives the boundary
3  NO_REMAINING_CANDIDATE_THIS_COMMISSION
```

⛔ **`unmeasured` anywhere stops everything — it does not merely exclude that observation.** If
supersession could not be established for one member of the reading, the *boundary* of the lawful
set is unknown, and excluding only the unmeasured ones would answer confidently from a candidate
space nobody measured. That is the error Q12 exists to forbid, and it is asserted by a test that
holds both conditions true at once and requires the boundary gate to win.

### A second product gap, found while building — F-7 has no runtime source

Standing has an authoritative store. Supersession has an authoritative derivation. **F-7
eligibility has neither** — no column, no table, no classifier. The only F-7 adjudication that
exists is the one performed by hand over the frozen corpus at Step 0.

`f7Eligibility.ts` therefore reports a THREE-state verdict, and the deployed source returns
`unestablished` for every observation — because that is true, not because a lookup failed.
`unestablished` is not `eligible`, so it cannot enter the lawful set.

⛔ **Consequence, stated plainly rather than buried: even once the D5 question is resolved, the
selector will report `NO_LAWFUL_CANDIDATE` on every commission until an F-7 eligibility source
exists.** The two available defaults were both refused — "assume eligible" would admit material
whose lawfulness was never established; "assume ineligible" would be honest but indistinguishable
from having nothing to say. The gap is recorded, not defaulted. An F-7 classifier, or a stored
per-observation verdict written when a reading freezes, is a founder question and is not opened
here.

### Output form

`ORDERING + internal confidence`, or `DECLINE_TO_SELECT`. Confidence is a number the room never
receives; the ordering never leaves the selector. A malformed or unreachable model answer returns
`unreachable`, **never a decline** — a transport failure must not be rendered to the writer as
MAIA's developmental restraint.

---

## 3 · Gates

```text
lib/manuscript/ask/__tests__/developmentalSelector.test.ts   39 passed
npx jest lib/manuscript                                      55 suites · 1078 passed
npx jest lib/manuscript/standing                             D5 / D6 GREEN — the wiring
                                                             that would have broken them
                                                             is not present
check:no-supabase · provider governance · no-direct-anthropic · PHI · design canon   PASS
npm run typecheck                                            RED — see below
```

⚠️ **The typecheck gate is RED, and it was RED before this work.** Verified by stashing every
change and re-running on the clean branch tip: the same three diagnostics, in
`app/wisdom-keepers/sacred-texts/page.tsx`, `components/focus/InboxTriage.tsx` and
`components/focus/NextStepBuilder.tsx` — none of them touched here, none of them reachable from
this path. Program file count is identical with and without these changes.

⛔ **Not repaired.** Absorbing three unrelated defects because this lane happened to discover them
is exactly the widening the standing rules forbid, and fixing them would also make it impossible
to see later that they were not this lane's doing.

⚠️ **The new modules are not yet in the ship program**, precisely because nothing imports them.
That is not an oversight to route around — it is the same fact as §1, showing up in the type
gate. When the wiring lands, they enter.

---

## 4 · Selector lock

```text
STATUS                LOCKED — NOT YET MEASURED
implementation commit see the commit carrying this file
selector version      ws2-sel0-selector-01
provider              anthropic
model                 MAIA_SELECT_MODEL || MAIA_ASK_MODEL || claude-opus-5
prompt hash           sha256 of the standing prompt —
                      developmentalSelectorPromptHash()
confidence floor      0.50   below this, the outcome is DECLINE_TO_SELECT
tie-break             candidates absent from or duplicated in the model ordering are
                      appended in ascending numeric-aware observation-key order
                      (o2 before o10)
determinism           the ordering is a deterministic function of the model's answer and
                      the candidate set; the seam exposes no temperature or seed, so
                      run-to-run identity of the MODEL's answer is not claimed
```

⚠️ **That last line is a real limit and is stated rather than glossed.** `StructuredRequest`
carries no temperature and no seed, so two runs may differ in what the model returns. What is
deterministic is everything this implementation controls: gate order, candidate set, and the
completion of a partial ordering. A claim of full run-to-run determinism would be false.

---

## 5 · Standing

```text
SELECTOR              IMPLEMENTED · LOCKED · NOT YET MEASURED
RUNTIME WIRING        WITHHELD — D5 collision, founder question open
PRODUCT GAP           OPEN — the capability is not reachable from the Studio path
F-7 RUNTIME SOURCE    ABSENT — second gap, recorded
MANIFEST B            NOT OPENED
FOUNDER RANKING       NOT STARTED
SEL-0 RUN             NOT PERFORMED
THRESHOLD             UNSET · instrument frozen af155f414
FOUNDER BLIND         INTACT
MERGE / DEPLOY        NOT AUTHORIZED · none performed
```

**Next act is a founder ruling on §1**, not more code. Under the Productization obligation the
honest report is the one above: *the benchmark-side implementation exists; the Studio does not yet
have the capability, and saying otherwise would be the exact substitution that obligation forbids.*
