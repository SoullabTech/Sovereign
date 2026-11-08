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
