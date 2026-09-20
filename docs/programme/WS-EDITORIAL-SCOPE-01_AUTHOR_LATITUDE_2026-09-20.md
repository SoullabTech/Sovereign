# WS-EDITORIAL-SCOPE-01 · AUTHOR EDITING LATITUDE

**Opened by founder act, 2026-09-20, on a reproduced defect.**

## 1 · The incident

2026-09-19. The writer asked MAIA to clarify one concept in one passage of
*Elemental Alchemy*. MAIA returned a `reply_with_proposal` whose
`replacementText` removed most of the author's opening — paragraphs, imagery,
the elemental relationships — and substituted her own prose. The surface
rendered it faithfully as strike-through over the author's words and asked him
to decide.

Founder, verbatim: *"she should be working with my words not rewriting my
work!"* · *"This needs enforcement in the editing logic — not merely a prompt
asking MAIA to preserve your voice."*

## 2 · What actually failed — and what did not

⭐ **Nothing was applied, and the authorization substrate is not at fault.**
`resolveGuard`, exact-text fit, single-use permission, version binding — all of
it held, and **none of it was reached.** Those instruments govern *applying* a
revision. The harm was at the **offer**.

```
admitEditorialToolInput   proved the ENVELOPE was well formed
resolveGuard              proved the APPLICATION named exact characters
⛔ nothing whatsoever      proved the PROPOSAL was an EDIT of the author's
                          passage rather than a REPLACEMENT of it
```

`replacementText: string` was a total function from MAIA's judgement to the
author's passage. The admitter checked that it was a string.

## 3 · The founder's ruling — two controls, not one

> *"I would like to have a slider of degree of editing from minimal to maximum
> but not let MAIA decide to remove paragraphs before discussing them."*

| control | question | default |
|---|---|---|
| **Latitude 1–5** (slider) | how much rewording may one proposal carry? | **1 · Touch** |
| **Paragraph removal** (separate permission) | may a proposal arrive with a whole paragraph already gone? | **off** |

⛔⛔ **THE SECOND IS NOT A DEGREE OF THE FIRST.** Latitude 5 says *recast this
passage freely*. It does not say *decide my paragraph should not exist*. A
writer who wants wholesale rewriting has not thereby asked for silent deletion,
and `F1c` asserts that maximum latitude still refuses paragraph removal.

## 4 · The law

`lib/manuscript/editorialScope/contract.ts` — pure, total, database-free.

- One measurement, reusing the existing exact-equality `sections/myers` diff.
  ⛔ No second diff implementation.
- `ALWAYS_PERMITTED_REMOVED_WORDS = 8` — a floor that protects small edits at
  every latitude. ⚠️ It was a per-band number first; **F3 caught that as a
  defect before it shipped** — scaling the floor with the latitude made it large
  enough at "Shape" to swallow a short passage whole.
- Two bounds that **fail differently on purpose**: a removed *fraction* and a
  longest *contiguous* cut. On a 2,000-word locus a fraction bound alone would
  permit deleting a 300-word paragraph at 15%.
- ⛔ No scoring, no quality judgement, no normalisation of the author's marks.

## 5 · Where it is enforced

`runEditorialTurn`, step **6b** — after envelope admission, **before any
transaction**. Measured against `invocation.locusText`, frozen before cognition,
so MAIA is judged against exactly the words she was shown. ⛔ Never re-read.

⛔⛔ **THE WHOLE TURN IS REFUSED, NEVER REPAIRED.** It would be easy to keep
`reply` and drop the proposal — and that would be *the system authoring MAIA's
act*, the member-side anti-classification law read from the other end. The
member's own act already persisted and still stands.

The route answers **409 with counts** (author words, words that would be
removed, longest unbroken cut, whole paragraphs, the latitude at which it would
have passed) — ⛔ **never the refused wording.** *A refusal is not an occasion to
disclose.* 409 and not 502: nothing went wrong; the system held the line the
writer drew.

## 6 · Evidence

`lib/manuscript/editorialScope/__tests__/scope.test.ts` — **19 falsifiers, all
green.** ⭐ **F1 is the actual 2026-09-19 exchange**, author text and MAIA's
replacement, as a durable regression witness. If F1 ever passes under a default
declaration, the law has been weakened back to the state that produced the
incident.

⚠️ **Run in this container with a scratchpad TypeScript toolchain, because the
checkout has no `node_modules`.** The module typechecks clean under the
project's own strictness. ⛔ **`npm test` and `npm run typecheck` have NOT been
run here and are owed** on a host with dependencies installed.

## 7 · ⭐⭐ READ SCOPE — the founder's first bullet, DISCHARGED

> *"Separate the material MAIA reads for context from the exact words she may
> change."*

**The defect was worse than "not separated".** Until 2026-09-20 `RevisionDesk`
pasted the whole section **into the writer's own message** as *"Current section
context (reference only)"*. So Work text reached cognition under
`encounter.input` — a producer whose provenance says *this is what the member
said to you*. ⛔ **It was not what the member said. It was the Work, wearing the
member's voice,** with the permission difference stated as a parenthetical in
prose. A producer whose provenance is false about who authored the text is
exactly the failure the registry exists to prevent, and it was live.

**Repair — a fifth governed producer**, `retrieved.writer_editorial_surround`:

- `lib/manuscript/editorialScope/surround.ts` — pure, so the locating rule is
  falsifiable without a database. ⛔ Not left inside an assembly that imports
  `pg`; a rule buried there is a rule nobody tests.
- ⭐⭐ **Exact-once locate, or NO surround.** A surround built around *"the first
  occurrence"* is a neighbourhood the writer is not standing in, shown to MAIA
  as though it were. `S3` asserts the null.
- Windowed to 4,000 characters **nearest the passage** per side — ⛔ not the
  opening of the section, which is the part least likely to explain it — and the
  elision is **stated** when it bites.
- The locus block now says **"THIS IS THE ONLY TEXT ANY PROPOSAL OF YOURS
  REPLACES."** The surround states its own permission in its own voice.
- Registered in `PRODUCER_REGISTRY` (`rooms: ['writers_studio']`) and classified
  `ambient` in the Writer's Studio membrane, beside the locus.
- ⭐ **The read/change boundary is structural, not advisory:** the scope law
  measures only against the locus, so no proposal can reach the surround even if
  she wanted it to.

⚠️ **A stale header was corrected in passing.** `editorialDiscourse/contract.ts`
claimed *"DECLARED, NOT REGISTERED … a falsifier asserts that absence"*. That
had been **false since ER-R2 (2026-09-15)**: the ids are registered, and the
falsifier asserts the opposite. Corrected in place, not deleted — a header
describing a decision the code has since reversed is worse than no header.

**Evidence: 9 read-scope falsifiers green; the editorial discourse contract
suite 70/70 (was 63/63); the Writer's Studio room membrane 51/51.**

## 8 · Named and NOT repaired

1. **Nothing requires discussion before a proposal.** The UI shows
   Notice → Discuss → Try → Decide; the runtime lets `reply_with_proposal`
   arrive on turn one. *Part of why this reads as an editor who acts before
   asking.*
3. **The latitude is per-session UI state, not a durable member preference.** It
   resets on reload to the protective default — safe, but the writer re-sets it
   every time.
4. `EditorialConversation.tsx` (canvas surface) calls the same route and does
   **not** yet send a scope, so it receives the protective default. Correct, but
   it has no slider.

## 9 · Regression sweep

Every `.test.ts` under `lib/manuscript`, `lib/writers-studio`,
`lib/writersStudio`, `app/writers-studio` and `lib/maia/canonical-turn` was run
at `aa15c4ef^` and again on this work, and the two runs **diff to additions
only** — the three suites this lane adds or extends. ⭐ No other suite's result
changed by a single case.

⚠️ Several suites report failures in **both** runs. They are harness
limitations (`jest.mock`, DOM, `localStorage`), ⛔ not regressions — which is
precisely why the comparison was made against a baseline rather than read off a
single run.

**Standing: CHANGE-SCOPE LAW LANDED · READ-SCOPE LAW LANDED · 28 NEW FALSIFIERS
GREEN (19 change · 9 read) · SLIDER SHIPPED · PARAGRAPH PERMISSION DEFAULT OFF ·
NO REGRESSION vs BASELINE · ⛔ NO MIGRATION · ⛔ NO SCHEMA CHANGE ·
⛔ NOT DEPLOYED · PRODUCTION UNTOUCHED.**

> ⭐ *The authorization layer protected the manuscript. It was never reached,
> because the injury was the offer. A proposal is an edit of the author's
> passage — not a replacement of it — and that is now a bound, not a hope.*
