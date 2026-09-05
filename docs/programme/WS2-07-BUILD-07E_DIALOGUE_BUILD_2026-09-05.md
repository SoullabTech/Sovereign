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
FIRST CANDIDATE  3bc700c4f — source-reviewed by the founder, TWO BLOCKERS (§0)
```

## 0 · Corrections after the founder's source review (2026-09-05)

The founder reviewed `3bc700c4f` before the walk and found two source blockers. Both are repaired
here. The architecture was not changed: Q1/Q2/Q3 hold as built, and W4's first-turn superseded
wording was reviewed and **accepted as written** — it reports the reading's existing claim until
the first server turn returns a newly measured `location`, and does not pretend the surface
measured anything.

**BLOCKER A — W6 was unreachable.** `ObservationDialogue` mounted with `thread = null` and
`threadId = null` and never asked the store what existed. Closing unmounted it; reopening built a
fresh component; the next question carried an anchor and `openThread` — a plain INSERT — opened a
**second** thread rather than resuming the first. The acceptance condition "close and reopen → the
thread resumes" could not pass.

Repaired as **persistence, not component state**, per the founder's ruling: on mount the room asks
the store which threads exist on this anchor and loads the one it is told about. Nothing survives
in React — which is why the resumed thread also survives a reload and a different device. Lifting
`threadId` into the parent would have made the case *look* repaired while proving only that a
component stayed mounted, and a standing guard now asserts the parent holds open/closed and
nothing else.

Many threads per anchor stay lawful and **no silent "latest wins" rule was invented**. The
decision is a pure function (`lib/writersStudio/observationDialogueResume.ts`):

```text
0 threads   → fresh
1 thread    → resume it — there is nothing to choose
2+ threads  → the WRITER chooses; the room presents them all, in the order the
              server gave, and picks none
```

The room also refuses to send while discovery is in flight or a choice is open — otherwise a fast
question posts an anchor and opens a second thread beside the one about to be resumed. Threads are
offered by when and how long, never by id.

**BLOCKER B — internal identifiers reached model-facing prose.** `developmentalAskReader` sent
`section ${sectionId}`, `the authored unit ${unitId}`, and `u.title ?? u.id`. Section ids are
UUIDs, and the Reader-04 production gate established that no raw UUID appears in MAIA's prose;
07E adds new prose inside the same DEVELOP mode.

Repaired as a **capability removal, not an instruction**. `lib/manuscript/ask/developmentalLabels.ts`
derives author-facing names from the reading's own FROZEN state — `sectionTopology` for order,
`structureContext` for authored titles — and **no function in it can return an id**, including on
the not-found path:

```text
section uuid          → "Section 3"
outside the topology  → "a section outside what you read"
authored unit         → the author's own title, where they gave one
untitled unit         → "an untitled chapter (number 2 at its level)"
unit not frozen here  → "a part of your structure that was not frozen with this reading"
```

Q2 is untouched by this: every label comes from what the Work *was* when she read it, so naming a
section is a statement about the reading, never a fresh look at the Work. The one admitted
exception is an authored title that happens to look like an identifier — that is the author's own
content about their own Work, and the ruling permits a meaningful identifier.

A second defect surfaced while repairing this and was fixed: the falsifiers had been reading a
*second*, similar assembly of the system prompt. `systemFor` is now the single assembly and
`__systemForTest` returns exactly the string that is sent, so a leak added to production cannot
pass a test that never saw it.

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

BLOCKER A · resume
  0 / 1 / 2+ threads → fresh / resume / choose                             PASS
  never silently resumes the newest of several                             PASS
  drops none — many threads per anchor stay lawful                         PASS
  a thread is offered by when and how long, never by id                    PASS
  the room asks the store on mount and loads what it is told about         PASS
  the room refuses to send before the store has answered                   PASS
  the parent holds open/closed and no thread state                         PASS
  one read on open: no timer, no refetch on focus or visibility            PASS

BLOCKER B · no identifier reaches the model
  sections named by their place in what she read                           PASS
  an authored part named by the author's own title                         PASS
  an untitled part named positionally, never by id                         PASS
  ZERO uuid-shaped strings in the system prompt — current                  PASS
  ZERO — superseded (the moved list is the other leak path)                PASS
  ZERO — evidence that could not be verified                               PASS
  a reference outside the frozen topology said honestly, never as an id    PASS
```

```text
ask · writersStudio · development ·
  developmentalReading ·
  app/writers-studio                  765 passed · 51 suites · 0 failed
typecheck (tsconfig.ship.json)        no regressions against typecheck-baseline.json
check:no-supabase                     clean
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

**The two blocker repairs were falsified against `3bc700c4f` itself** — the code the founder
reviewed — by restoring each shipped file from that commit and running the new guards against it:

```text
developmentalAskReader.ts @ 3bc700c4f
  → 6 of the 7 Blocker B guards FAILED ✓
    (the seventh — "a reference outside the frozen topology" — passed at 3bc700c4f too,
     because such a ref refuses at recovery and the unverifiable branch never printed an
     id in either version. It is kept as a standing guard, NOT claimed as repair evidence.)

ObservationDialogue.tsx @ 3bc700c4f
  → 4 of the 7 Blocker A structural guards FAILED ✓
    (threadsOn on mount · loadThread · resumeDecision · refuses to send before the store
     answers. The other three — threadId preferred over anchor, no lifted parent state, no
     timer — were already true at 3bc700c4f and are standing guards, not evidence.)
```

The pure `resumeDecision` cases have no counterpart at `3bc700c4f` — the function did not exist —
so they are new-capability tests and are not claimed as falsified.

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
W6  close and reopen → the SAME thread resumes with its prior turns visible; asking again
    posts by threadId, still one ask_thread, anchor and reading_identity unchanged.
    Then: reload the page and reopen — it must still resume (the proof that this is
    persistence and not component state).
W6b if a second thread is deliberately started on the same observation, reopening OFFERS A
    CHOICE and resumes neither on its own
W7  the refusal state seen honestly once (key absent from the env): the question is held, not lost
W8  narrow window / phone: the dialogue is reachable and readable
W9  nothing MAIA says names a section or a part by an internal identifier — she says
    "Section 3" and the author's own titles
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
