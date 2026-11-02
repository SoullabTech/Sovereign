# WRITERS-STUDIO-SEMANTIC-FIELD-01 · Academy F1: Witness Record and Closure (2026-11-02)

```
LANE:      Implicit Academy, finding F1 of the 2c walk (#2062).
FLOW:      WRITERS-STUDIO-SEMANTIC-FIELD-01 (2026-11-01 ruling). No new flow.
OUTCOME:   PASS (canonical). Production witness OWED.
CANONICAL: 3031eba2d (merge of #2071; PR head 2023d591e3eb9f3df878c15b346441856b817cfb).
PRODUCTION: a4dd6fc85 (container created 2026-11-02T13:25:12Z). Does NOT contain F1.
```

## Witness record (manual §29)

**Date/time:** 2026-11-02, local walk before merge. Canonical and production readings were
taken after the merge.

**Subject:** what a Teach me stores as the writer's turn, and how MAIA is told to answer.

**Claim being tested:**
- A Teach me stores only the button's words as the writer's `ask_turns` row.
- The teaching shape reaches MAIA server-side.
- MAIA's answer keeps the conversational teaching shape.

**Exact SHA:**
- Built and walked on branch head `60f67f0b0`, plus merges from main.
- Merged head: `2023d591e`. CI ran on that exact head: 11 check runs, 11 success.
- Canonical: `3031eba2d`.

**Authority for this act:**
- Founder ruling 2026-11-02: "Yes, build it". Pressing a button counts as saying its words
  (design #2070, §4).
- Merge: founder "Yes, merge on green". Auto-merge was enabled by the founder.

### Pre-state
- On main before `3031eba2d`, every Teach me sent a composed instruction as the writer's
  words.
- The local database held those instructions in `ask_turns` with `speaker = 'author'` on
  every walked path, for example:
  - `Teach me the craft at work in this observation, as a conversation rather than a lesson. | Start with … | Do not test me or say anything about my ability.`

### Instrument
1. **Guard and unit suites:**
   - `teachingTurnEntryPoints.test.ts`: no client composes a teaching instruction; no client
     carries a teaching-only line; every entry point names its anchor; both servers add the
     shape.
   - `developmentalDialogue.test.ts`: the shape is in Develop's system prompt with the
     anchor, absent without it, and the prompt hash differs.
2. **Suite comparison:** the failure list on the branch was compared with a clean main
   worktree, over app/writers-studio, app/dev/writers-studio-pc3-live, lib/writersStudio,
   lib/manuscript, app/api/writers-studio, app/api/sovereign/manuscripts and
   tests/constitutional/writers-studio.
3. **Typecheck:** `npm run typecheck`, the no-regression gate.
4. **Local live walk:** dev server on the branch, local test member, test Work "QA — Window
   and Rain". Real MAIA replies, then `ask_turns` read directly.

### Population
- **Live walk:** the two paths that reach different servers: the editorial turn (Write menu
  › "Teach me about this") and the developmental Ask (Develop › observation › "Teach me what
  is happening").
- **Not walked live:** the other entry points share these two server paths. The guard test
  pins their call sites.

### Expected discriminating result
- The new author row equals the button's words exactly, with no instruction line.
- The reply is still one idea with a steering question.
- Develop's prompt hash differs from answers given without the shape.

### Result
| Path | Stored author row | Reply |
|---|---|---|
| Editorial turn (Write menu) | `Teach me about the writing in this passage.` (thread `f9d7…`, turn 18) | ~65 words, one idea, steering question |
| Developmental Ask (Develop) | `Teach me the craft at work in what you noticed.` (turn 3) | ~110 words, one idea, ends with a choice; promptHash `fb84547b…` vs earlier `cd6e38e1…` |

- **Suites:** no failure on the branch that is not also on main. The pre-existing failures
  are identical on both.
- **Typecheck:** no regressions.
- After merging main (which carried #2069), 90 tests across the affected suites passed.

### Falsification
- Main's client files contain none of the required `teachingQuestion(` or `teachingAnchor:`
  calls (0 in each of 6 files).
- Main's `turn.ts` has no `teachingTurnInstruction`.
- So the entry-point and server checks fail against main.
- The guard's own defeat candidates (a restored composed prompt, a leaked shape line) are
  caught.

### Post-state
- New writer turns hold only the button's words.
- Older rows are unchanged: they record what was actually sent (no backfill, by design).
- No schema change.

### Adjudication
**PASS** for the canonical claim.

**Proves:**
- On canonical `3031eba2d`, every reachable Teach me sends the button's words as the writer's
  turn and names a closed anchor.
- Both servers refuse unknown anchors and add the teaching shape to the system prompt.
- On the walked paths, the stored row is exactly the button's words and the reply keeps the
  teaching shape.

**Does not prove:**
- Production behaviour: production runs `a4dd6fc85`, which does not contain F1.
- Behaviour on a writer's longer Work.
- Anything about the free Ask box (switched separately by the walk session after #2069), or
  about other composed non-teaching prompts.

**Next exact act:**
- A production deploy that includes `3031eba2d`, by the walk session (deploys are its lane).
- Then a production witness:
  - one Teach me on each server path;
  - read the new `ask_turns` author rows on production;
  - confirm the running `GIT_COMMIT`.

**Still not authorized:**
- Deploy from this lane.
- Backfilling or rewriting historical `ask_turns`.
- Changing other composed prompts.

## Closure and handoff (manual §30)

**Outcome:** PASS (canonical) · production witness OWED.
**Canonical subject:** `3031eba2d`.
**Production subject:** `a4dd6fc85` (does not contain F1; also does not contain F2 `2a97f83f1`).

### What changed
- `lib/writersStudio/teachingTurn.ts` now has two halves:
  - `teachingQuestion` (the writer's words);
  - `teachingTurnInstruction` (server only).
- It also defines a closed `TeachingAnchor`: passage, observation, change, direction,
  continue.
- **Editorial turn:** the route accepts and validates `teachingAnchor`, and `turn.ts` adds the
  shape to `system`.
- **Developmental Ask:** the route, reader, client and `ObservationDialogue` do the same,
  including the resume after read permission. `promptHash` includes the shape.
- **Entry points:** Focus (writing, more, why), the Write menu, the change marker, Craftsman's
  Table, Craft Companion, Develop and the observation marker. Display labels that differed
  from the stored words were removed.

### What did not change
- The shape text MAIA receives.
- Depth (Guided, Learning, Direct).
- The privacy, relationship and read-permission gates.
- Proposal policy.
- Schema.
- Historical rows.

### Evidence of record
- #2062 (2c walk, F1 finding).
- #2070 (design).
- #2071 (build; CI 11/11 on `2023d591e`).
- This record.

### Current truth
- Canonical stores only the button's words for every Teach me.
- Production does not yet run that code.

### Historical truth retained
- Pre-F1 `ask_turns` rows contain composed teaching instructions as author text. They remain
  as the record of what was sent.

### Open findings
- **Same class, other prompts:** Discuss, "Why this?", `withOrigin` arrival framing and
  Craftsman's Table `localWorking` still travel as the writer's words. Each needs its own
  decision.
- **Free Ask box:** the walk session moves the conversation shape server-side after this
  merge.
- **F3:** a pending proposal stays under teaching replies. Left until Jondi's walk.
- **F4:** unreachable rebuild-Studio prompts. Cleanup belongs to the walk session's lane.
- **CI tooling:** the TypeScript gate script ignores tsc's exit status and signal, so a
  crashed run reports "coverage lost" (seen on #2063). That belongs to the deploy and CI lane.
