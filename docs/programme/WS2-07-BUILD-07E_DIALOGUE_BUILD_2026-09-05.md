# WS2-07 · BUILD-07E — DEVELOPMENTAL DIALOGUE · build record

> **Implementation landed against the founder's Q1/Q2/Q3 rulings of 2026-09-05.
> NOT CLOSED — closure needs the founder walk in the Develop room on a deployed runtime.
> No PR opened, nothing deployed, nothing merged.**

```text
UNIT             BUILD-07E  DEVELOPMENTAL DIALOGUE
STATE            BUILT · gates green · NOT CLOSED
BRANCH           claude/writer-author-studios-roadmap-b2tqf5
BASE             5c57e27f0 (canonical, LIVE)
BOUNDARY         WS2-07-BUILD-07E_DIALOGUE_BOUNDARY_CENSUS_2026-09-05.md
MIGRATION        NONE — E10 discharged, see §3
```

**Acceptance sentence, as the founder set it:**

> A writer can open a conversation on a specific developmental observation, MAIA can discuss only
> what that frozen observation and its verified evidence support, and nothing said in the
> conversation alters or retroactively expands the reading.
>
> For a superseded observation: the conversation remains available, but neither the interface nor
> MAIA represents the old observation as current.

## 1 · The rulings, and where each one lives in the code

**Q1 — observation-only in v1.** No `{ on: 'reading' }` member exists. It is not declared in the
`AskAnchor` union, not parseable at the boundary, and not reachable from the surface. The union
carries exactly one new member:

```ts
{ on: 'observation'; readingId: string; observationKey: string }
```

The reason is recorded in `anchor.ts` where a future reader will meet it: an observation is the
thing MAIA noticed; a reading is a container of notices, and addressing the container is an
ambiguous conversational object before anyone has established which of summary, synthesis,
critique or cross-observation interpretation it means. Declaring the member "for coherence"
would be pre-building it.

**Q2 — the frozen observation plus digest-verified evidence.** `developmentalContext.ts`
assembles the packet host-side. Evidence reaches the model only through 07A `recoverEvidence`,
which verifies the supplied revision against the digest frozen with the reading *before it slices
a single character*. `EvidenceView` is a discriminated union — the unverifiable case carries the
refusal and **has no field for text to appear in**, so a careless consumer cannot render current
prose in place of what was read. The invariant, in the module header:

> The thread may interpret the frozen observation. It may not acquire new evidence and then
> launder that new evidence back into what MAIA "noticed then."

Not sent, by construction: tools, a read budget, a fresh whole-draft fetch, sibling observations,
any current-text substitution, any path that changes the reading.

**Q3 — a superseded observation opens, as superseded.** `observationLocation` (07A) is the
measurement; it is three-state and conservative — any superseded ref supersedes, unknown never
rounds to current. On a superseded anchor the reader receives a second standing block instructing
her to make the temporal distinction intelligible **early, in her own words, naming what moved**,
and then to stop repeating it, because a qualification restated every turn stops being read. She
is explicitly forbidden to claim the observation still describes the Work, that she has checked
what is true now, or that current text confirms or refutes it. Asked "but what about the Work
now?", the standing instruction is that this thread has not reread the Work and a new
developmental reading is the act that answers it.

The room says it too, before the writer speaks: `ObservationDialogue` renders the superseded line
from the reading the room already measured, so the warning precedes the first turn rather than
arriving after it.

## 2 · What landed

```text
ADDED
  lib/manuscript/ask/developmentalAnchor.ts          coherence rule, its own module
  lib/manuscript/ask/frozenDevelopmentalReading.ts   SELECT-only loader (see below)
  lib/manuscript/ask/developmentalContext.ts         host-assembled packet + staleness mapping
  lib/manuscript/ask/developmentalAskReader.ts       standing instructions, no tools
  app/writers-studio/develop/ObservationDialogue.tsx the room's dialogue surface
  lib/manuscript/ask/__tests__/developmentalDialogue.test.ts   25 falsifiers

EXTENDED
  lib/manuscript/ask/anchor.ts        + observation member; `checkAnchor` REFUSES it
  lib/manuscript/ask/threadStore.ts   ReadingIdentity → discriminated union + `readIdentity`
  lib/writersStudio/askClient.ts      + `location` on the outcome
  app/writers-studio/develop/DevelopRoom.tsx  mounts the dialogue under each observation
  app/api/.../ask/route.ts            separate developmental parser + `developmentalTurn`
  three standing gates (see §4)

UNTOUCHED
  the whole 05B structure path — its parser, its loader, its reader, its staleness
```

Three decisions inside that list are load-bearing and were made against the obvious alternative:

- **`checkAnchor` refuses an observation rather than checking it.** That function is handed a
  structure reading and could not adjudicate an observation without being given both frozen
  objects — and a checker holding both is a checker that can confuse them. The developmental rule
  lives in its own module, and the structure checker's `default` arm names the case explicitly so
  the refusal reads as a decision rather than a gap.
- **`frozenDevelopmentalReading.ts` exists rather than importing `developmentalReading/store`.**
  That store exports `freezeAndStore`, which INSERTs. Importing it for a reader would put a
  writer in the Ask module graph — precisely the reason `frozenReading.ts` exists beside
  `proposalStore`. Now gated, not merely intended.
- **The revision content is NOT re-implemented here.** `development/capture.ts` already owns
  `loadRevisionContent` and `loadLiveWork`, is read-only by construction, and carries its own
  standing gate. A second SQL path would be a second thing to keep true.

**The thread identity union, and the rows that predate it.** `kind` is optional on the structure
member and absent from every row written before 07E. It is never backfilled: a historical row's
missing discriminant *is* the evidence that it predates the second object — the same doctrine as
a v1 reading's missing contract version. `readIdentity` normalises at the read boundary, so the
in-memory type is a proper union while the stored history stays as it was written.

**`readingSuperseded` is always `unmeasured` on a developmental turn, deliberately.** In the
structure lane a newer proposal supersedes an older one. Developmental readings do not work that
way — they are per-lens and coexist by design (07D walk D5: asking under a different lens is a
second ledger entry and the first still opens). "A newer reading exists" is therefore not
supersession, and reporting it as such would be false. What supersession genuinely means here is
that the evidence moved, and that is `location`.

## 3 · Falsifiers

```text
E1   readingId mismatch REFUSED, not repaired                              PASS
E1b  the structure checker refuses a developmental anchor                  PASS
E2   unresolvable observationKey refuses; no degrade to reading-level      PASS
E3   identity cannot hold both references; pre-07E rows read as structure  PASS
E4   ask runtime writes ask_threads and ask_turns and nothing else         PASS  (gate extended)
E5   no reachable path mutates a frozen reading from the ask route         PASS  (gate extended)
E6   three-state location; a dimension with nothing to measure is
     `unmeasured`, never `unchanged`; unknown never rounds to current      PASS
E7   thread anchor and reading reference immutable                         PASS  (pre-existing
                                                                                 DB trigger)
E8   no tools and no read budget on the developmental path                 PASS  (gate extended)
E9   refusals said honestly, once, and the room stays usable               PASS
E10  no migration needed                                                   DISCHARGED — none
                                                                           written; `anchor` and
                                                                           `reading_identity` were
                                                                           already `jsonb`
```

```text
lib/manuscript/ask/__tests__/         104 passed · 6 suites
related suites (writersStudio ·
  development · developmentalReading ·
  app/writers-studio)                 641 passed · 44 suites
```

## 4 · Falsification discipline

A guard that has never failed against the code it guards is a tautology. The two new *structural*
gates were run against deliberately broken code and observed to fail:

```text
added `"".slice(0)` to developmentalContext.ts
  → "evidence reaches the model only through recoverEvidence, never a raw slice"   FAILED ✓

added `tools: []` to the developmental runStructured call
  → "sends no tools to the model, so there is no read-request path"                FAILED ✓
```

Both were then restored and the suite re-run green.

**Two pre-existing gates failed on this change and were repaired forward, not relaxed.**
`askHttpBoundary` asserted ownership precedes `parseAnchor(body.anchor)`, and `askSourceCloseout`
asserted the frozen side comes from `stored: existing?.reading`. Both literals moved — the POST
now parses through `parseAnyAnchor`, and the structure path narrows the union through
`storedStructure`. The **properties** they defend are unchanged, so each assertion was retargeted
at the call the route actually makes, and two new assertions were added in the same place: that
`observation` is absent from `SUPPORTED_ANCHORS`, and that the developmental branch precedes the
narrowing so a developmental identity can never reach the structure comparison.

## 5 · What the founder walk needs

Not run here — this record claims gates, not lived use.

```text
W1  open a reading in the Develop room · "talk with MAIA about this" under an observation
W2  ask something; MAIA answers about THAT observation and stays with it
W3  ask "is this still true of the book now?" → she says this conversation has not reread the
    Work and names a new reading as the act. She does not estimate.
W4  a superseded observation → the room says so BEFORE the first turn; her first answer makes
    the temporal distinction and does not repeat it every turn afterwards
W5  say "do it" → she names the gesture and says she cannot
W6  close and reopen → the thread resumes; the anchor and reading are unchanged
W7  the refusal state seen honestly once (key absent from the env): the question is held, not lost
W8  narrow window / phone: the dialogue is reachable and readable
```

The reading is unchanged after all of it — that is the acceptance sentence, and it is what the
walk is looking at.

## 6 · What this record does not do

```text
no claim the dialogue is GOOD — that is W2–W4, and it is the founder's judgment
no opening of BUILD-07F. Keep / dismiss / unresolved / investigate is not built, not stubbed,
   and not reachable. If the dialogue turns out to need a decision to be coherent, that is a
   finding to record, not a licence.
no revision path (BUILD-07H)
no reading-level thread
no migration · no deploy · no PR · no merge
nothing pulled off the parked ledger
```
