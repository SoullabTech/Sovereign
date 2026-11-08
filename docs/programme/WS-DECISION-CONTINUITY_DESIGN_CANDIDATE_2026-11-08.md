# Writer's Studio — decision continuity (design candidate) — 2026-11-08

STATUS: read-only trace + proposed laws. Authorizes nothing; no code changed by this document. Checkout `feature/ws-work-continuity-part-a-suite`.
Method: greps for stores and their readers (not a runtime or browser walk). Everything below is "traced", not "witnessed".

## The crossing
*A writer refuses, keeps, or corrects something. Later, in another room or another day, MAIA proposes it again, ignores the correction, or does not
know.* A journey is not complete until the writer's decisions survive moving between rooms and returning (the founder's acceptance standard).

## Four different things are all called "a decision" today
| Store | What the writer decided | Written by | Read by (traced) |
|---|---|---|---|
| Observation standing (`lib/manuscript/standing/store.ts`, `developmental_observation_standing`) | their stance on one developmental observation (e.g. refused / not true of my book) | Develop room (`standingClient`) | Develop room; **not** found in the Work conversation or the editorial turn |
| Writer corrections (`writerCorrectionsServer`, `writer_studio_corrections`) | "that is not what I meant" about MAIA's interpretation | Work conversation | Work conversation context (`workContext.ts`), living-work routes; editorial turn: **not verified** |
| Writer's declared understanding (`writerUnderstanding*`: purpose, preserve, non-negotiables, challenge-me-on) | the writer's own intent for the Work | Develop form | Ask context, attention map, orientation, and the editorial turn references it (`editorialRuntime/turn.ts`) — **whether "preserve" is honoured in a proposal is NOT verified** |
| Kept spans / adopted-or-declined proposals (`craftSettledChoicesR1`, editorial chain/version) | "keep my wording"; adopted or undone a proposal | passage desk | `craftSaveContractR1` only (single importer); the chain carries the act's own standing within a thread |

## Gaps (traced)
1. A refused observation is a Develop-room fact only; a later conversation or passage turn is not told it was refused.
2. A kept span binds to a saved version; nothing tells another capacity "this wording was kept deliberately".
3. A declined proposal is carried inside its chain, not across chains or sessions.
4. Corrections and observation standing are separate vocabularies with no shared "what the writer has settled" read.
5. Return context is structural only (`prose: 'unmeasured'`), so after text changes MAIA cannot say whether a settled decision still applies.

## Proposed laws (for a lethality-first suite; NOT written yet)
- **DC-L1 survives return.** A settled decision recorded in room A is present, as the writer's own words/act, in room B and after a session break.
- **DC-L2 never inferred.** A decision exists only because the writer acted; unchanged wording, silence, or a model's reading never creates one.
- **DC-L3 member-owned and revocable.** The writer can see, change, or withdraw it; withdrawal is itself recorded, and a prior decision never silently becomes current again.
- **DC-L4 evidence, not criterion.** A decision orients what MAIA attends to; it is not a rubric the text is graded against, and it is never restated as an observation about the text.
- **DC-L5 version-bound.** A decision about wording says which saved version it was made against; if that text moved, MAIA says "this may no longer apply" and does not enforce it.
- **DC-L6 isolation.** Decisions are member- and Work-scoped; Sanctuary content never becomes a decision.
- **DC-L7 not a dead end.** Where a decision blocks a proposal, the writer can still ask to revisit it; MAIA does not repeat the refused suggestion unprompted but is never forbidden to discuss it.

## Defeat candidates to build before any implementation
re-proposes a refused suggestion · decision inferred from unchanged text · decision lost on return · decision applied to a changed passage as if still valid · decision shared across members/Works · withdrawn decision revived · decision used as a grading rubric.

## The one question for a founder ruling (principle, with a recommendation)
> What does a settled decision bind MAIA to? **Recommended:** it binds her to *know and say* that the writer settled it (and not re-offer it unprompted),
> never to *refuse to discuss* it, and never to treat it as a fact about the text. It lives as one member-visible, revocable record of the writer's own acts
> with a read shared by the Work conversation, the passage turn and Develop. ⛔ Not decided; no store is added until this is ruled.

## What this document does not establish
No runtime behaviour; not whether the editorial turn honours "preserve"; not whether any room shows settled decisions to the writer; no migration, store or route is proposed here.


## UPDATE — founder ruling (2026-11-08): **"Yes, as recommended."**
A settled decision binds MAIA to KNOW AND SAY that the writer settled it and not re-offer it unprompted; never to refuse to discuss it; never to treat it as a fact about
the text. One member-visible, revocable record of the writer's own acts, shared by the Work conversation, the passage turn and Develop. (Recorded as given; no store, route or
migration is authorized by this ruling alone.)

Suite authored BEFORE any implementation: `tests/constitutional/ws-decision-continuity/` — 13 laws (L1a…L7b), 14 defeat candidates (DC-1…DC-14), reference double,
matrix 16/16: the reference satisfies every law, each candidate dies on its named law with only classified collateral, every law is a candidate's target.
The reference is a TEST DOUBLE, not an implementation and never a seed. Not frozen (a founder act).


## BUILT (founder: "Yes, build it", 2026-11-08) — candidate, NOT applied, NOT merged
- Migration `20261108000002_writer_decision_events.sql` (candidate; append-only; withdraw must target the same member and Work, enforced by trigger; no direct delete or truncate; cascades with the Work).
- `lib/writersStudio/decisionRecord.ts` (pure + the ONE shared read) and `decisionRecordWrite.ts` (writer gestures only, kept out of the Ask route's graph).
- Gesture API `app/api/sovereign/living-works/[id]/decisions` (GET list, POST settle/withdraw; a settle must state `sanctuary:false`).
- Readers wired: the Work conversation (Ask route, via the declared-context channel, posture stated and not Sanctuary) and the passage desk (editorial turn, not Sanctuary).
- Writer-visible control: `SettledDecisions.tsx` in the Work conversation (their own words, Withdraw, Keep this).
- Evidence: laws suite 16/16 (test double); disposable-database witness + real Ask route walk 4/4; earlier route walk still 9/9; unit and typecheck clean; no new failures vs the pre-existing set.
## NOT done / NOT established
- Develop observation standing and passage-desk gestures ("Keep mine", declined proposal) do NOT yet write to this record; today a decision is created only by the writer's note here or via the API. The shared READ exists; the other rooms' WRITES are the next crossing.
- L5 (version-bound, stale flagged): the schema carries `version_ref`, but no writer sets it yet and the reader does not compute staleness. Not claimed.
- The living-work-only conversation (no manuscript) route does not read the record.
- The passage desk's reading is wired but not witnessed against a real or scripted editorial turn end to end.
- Suite not frozen (founder act). No browser walk of the new control. Migration not applied anywhere real.


## STOP — two gestures could not be wired without a ruling (2026-11-08)
1. **Develop (observation standing) → MAIA.** A read adapter that put the writer's DISMISSED observations into the Work conversation was written and then REVERTED:
   `lib/manuscript/standing/__tests__/standingOutsideCognition.test.ts` (D5, ratified) fails by design — *standing ──X──► MAIA cognition*, with
   "permitting standing into a writer-initiated conversation requires a deliberate architectural change rather than one convenient import". The guard was NOT weakened.
   **Question for a ruling:** may a writer's dismissal of an observation be carried to MAIA (Work conversation, passage desk) under the settled-decision ruling, and if so,
   by which amendment to D5 (recommended: a named, narrow exception limited to `dismiss`, read through one module, with the guard's allowlist updated by that act)?
2. **Passage desk "Keep mine" / decline.** Today it is LOCAL STATE ONLY (`P4R1WriteEditController` `onKeep` clears local state and shows "Current wording retained"); it writes nothing durable.
   Recording it would make the system compose a sentence for the writer ("I kept my own wording…"), which is not their words. **Question for a ruling:** does a
   "Keep mine" click settle anything? Recommended: no automatic decision; offer a one-line, writer-confirmed "Note that you have decided this?" after the click, recorded only on their yes.
Until ruled, the shared record is fed only by what the writer writes (the Work conversation box and the API).
