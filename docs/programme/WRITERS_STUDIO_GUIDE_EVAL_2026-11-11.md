# MAIA as the Studio's guide — evaluation results (2026-11-11/12)

**What is evaluated.** Whether MAIA, given the extended Studio guide (`lib/writersStudio/studioGuide.ts`), answers real "how do I… / where is… / what does … do" questions by naming the real control. It also checks that she:
- says what is missing;
- respects permissions, Sanctuary and the switches that are actually on;
- keeps a multi-turn thread;
- explains without acting;
- can run the founder's group-session acceptance prompt.

The questions, expected answers and scoring rules are in `scripts/eval/studio-guide/questions.ts`.

**Evidence class: Claude Code's own run. It is not independent acceptance.** It ran the real **Work-conversation prompt** (`askMaia`, the prompt the Develop and Write conversations use) on a real model, against a **synthetic** Work ("The Salt Year", two chapters):
- No member data, no database. Only `workSituation` was replaced.
- Switches were set to the **production compose defaults** (`NEXT_PUBLIC_WS_DEVELOP_STAGE=1`, `NEXT_PUBLIC_WS_AUTO_READ=1`, Pro gate off, exports not certified). That is source configuration, not a witnessed production environment. Individual questions override switches where noted.
- n=1 per question, so there is no variance estimate.
- It is not a production witness or a member walk.

**Ref.** Canonical `clean-main-no-secrets` @ `a5a80f7e05` (which includes #2230), plus this branch.

## Tier 1 — deterministic (part of the test suite)
`lib/writersStudio/__tests__/studioGuideEval.test.ts`, 54/54: for every question, the guide MAIA would be given under that question's switches contains the expected control, and the Sanctuary questions' guide contains none of the forbidden ones.

## Tier 2 — real model (opt-in, paid)
```
STUDIO_GUIDE_EVAL=1 ANTHROPIC_API_KEY=… npx jest scripts/eval/studio-guide/studioGuide.modelEval.test.ts
```
Run of 2026-11-12T01:58Z: provider anthropic, model `claude-opus-5` (repo default `MAIA_ASK_MODEL`). It took 54 scored questions plus 4 earlier turns, about 58 calls. Every reply is in `WRITERS_STUDIO_GUIDE_EVAL_RUN_2026-11-12.md`.

An earlier run that day of the first 30 questions, before the runtime, workflow and stance additions, scored 27/30. Its misses were the same kind of scorer false negatives.

**Raw score: 52/54.**

| Category | Score |
|---|---|
| how-do-i | 28/30 |
| missing feature | 3/3 |
| ambiguous label | 3/3 |
| permissions | 3/3 |
| disabled | 3/3 |
| consent / Sanctuary | 3/3 (+2/2 in how-do-i) |
| runtime-dependent | 2/2 |
| explain, don't do | 2/2 |
| multi-turn follow-up | 2/2 |
| founder group session | 3/3 |

The scorer was not changed after the run. Both misses were read by hand and are scorer false negatives:
- **read-chapter.** She offered the take-me-there button `[[studio:read-chapter]]` (it renders as the clickable control) instead of writing the label.
- **sanctuary-what.** She said "nothing from the session is saved at all", which the regex did not match.

**Found by reading, not by the scorer (a real defect, now FIXED in this PR):**
- **stage-off** was scored PASS. With the Develop stage switched off, she correctly said the plan control was not on here, but then offered the `show:plan` button. That button opens Develop's More panel, which isn't there with the stage off.
- The cause was wider than the stage switch. `WorkConversation` shows an acting offer only when its room passes `onStudioAct`, and a reading offer only with `onReadChapter`. Only the Develop stage does that. Write, Review and the older Develop map show the same conversation without them, yet MAIA was told about all of those offers everywhere. So in those rooms "click below" could lead to no button, **in production today**.
- The fix:
  - the conversation now sends `roomActs: true` only when its room can act;
  - the ask route and `askMaia` carry it through;
  - `studioActionsInstruction` describes only the buttons that room will show, and tells her to name the control instead of saying "click below".
- The new test `studioActionsRoomActs.test.ts` pins `ROOM_ACTS` to WorkConversation's own `ACTING` set and checks the flag end to end. The flag changes only what she may *offer*; every click is still gated where it lands.
- **Targeted re-check on the real model** (subset of 6, about 7 calls; `WRITERS_STUDIO_GUIDE_EVAL_RUN_2026-11-12_ROOMACTS_RECHECK.md`): 5/6.
  - stage-off now passes with a stricter check (no acting marker at all). She points to the older map's "Read this chapter" and "Start an editorial pass", and to Review.
  - The one miss is the same read-chapter false negative: she offered the button, which is correct on the stage.

**Also noted:**
- **Revision latitude names differ between surfaces.** `editorialScope/contract.ts` uses Touch, Line, Passage, Shape, Open, while `IsolatedEditorialRoom.tsx` calls band 1 "Light". The guide used to say "from Light upward" and now names no band. Product inconsistency, reported only.
- **Founder group session** (category group, 3/3). She walks Home ("New Work", "Import writing", "Return to this work") through Ordinary/Sanctuary and What MAIA can read. She uses an invented example ("my invention, not from anyone in the room"). On follow-ups she says plainly that automatic reading is on once permission is granted, and points to "Stop" and "Which ones?". She says only "Apply my version" puts wording in the manuscript.
- **Asked about another writer's chapter**, she says she cannot reach it and offers a made-up example instead.
- **Asked to start the pass**, she says she can't, names it, offers the button, and asks what the writer hopes for. Across the three-turn editorial-pass thread she keeps context and leaves the decision with the writer.
- **In Sanctuary**, she still guides layout questions and says reading, plans and Review Discuss are not offered. She does offer to read lines the writer pastes into the exchange. That is not stored and is lawful in Sanctuary, but it may want a founder ruling.

## Context cost
Measured with Anthropic's `count_tokens` (free):
- The guide adds about **7,630 input tokens per Work-conversation turn** (22,085 characters).
- The Sanctuary variant adds about 6,020.

Before this change, the Write/Passage Focus guide was roughly a quarter of that, judging by size. This cost is paid on every Studio turn. Prompt caching would make the guide largely cacheable, because it is identical across turns for the same runtime. Trimming per room is the alternative. **That is a founder or ops decision.** The guide is bounded, generated from the registries above, and grows only with real controls.

The eval spend was one opt-in run of about 58 calls to `claude-opus-5`, plus the earlier 30-call run. Nothing runs in CI or in `npm test`; the model tier is skipped unless `STUDIO_GUIDE_EVAL=1`.

## Inherited baseline failures (recorded separately; not caused by this branch)
Running `npx jest lib/writersStudio lib/manuscript app/writers-studio/__tests__/p4r1FocusNextAndPause.test.ts` on **untouched canonical `a5a80f7e05`** gives 16 failing suites and 18 failing tests. The same 16 suites and 18 tests fail on this branch, which adds about 140 passing tests and no new failures:

developmentalSemanticContract, providerSeamMigration, askSourceCloseout, evidenceCannotAct, reader05, readerCannotBypass, workingDraftBody, developAskable (the `lenses` defect recorded on 2026-11-11 trips the "no open defects" check), manuscriptImportWork, listen/{browserCaptureInfo, fullPrefaceReading, micLevel, monoCaptureRoute, readingAtmosphere, wavExport}, publish/kdpCoverGeometry.

## What this does not establish
- That writers or a group find the guidance useful in the live Studio. That needs the founder acceptance walk (the group-session prompt, in the deployed Studio) after any deploy.
- Model answers in Passage Focus, Develop observation dialogue or Review → Discuss. Their wiring is pinned by the guard test, but only the Work conversation was run on a model.
- What production actually has switched on. The guide reads the switches at runtime, but this run used the compose defaults.
- Stability across runs or models.
- Security acceptance. That stays with #1969, and release stays under the #1938 HOLD.
