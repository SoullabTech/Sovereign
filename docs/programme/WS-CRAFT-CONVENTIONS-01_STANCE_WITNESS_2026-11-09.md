# WS-CRAFT-CONVENTIONS-01 · Convention stance: implementation and witness (2026-11-09)

```
AUTHORIZED: founder, "Implement and witness" (2026-11-09), after rulings 1 and 2 (proposal §6a).
CHANGE:     lib/writersStudio/editorialDepth.ts — CONVENTION_STANCE_DIRECTIVE, the seven approved
            rules verbatim, composed inside editorialDirective() after EDITORIAL_INTELLIGENCE_DIRECTIVE
            and before EPISTEMIC_INTEGRITY_DIRECTIVE. Reaches all three depths and both MAIA paths.
            The depth texts are byte-identical.
BRANCH:     feature/ws-work-continuity-part-a-suite. Canonical 84e12cf00. Not merged, not deployed.
EVIDENCE:   INSTRUCTION-LEVEL witness, not a runtime witness (see §3).
```

## 1. Gates

- New guards: `lib/writersStudio/__tests__/conventionStanceDirective.test.ts`, 6/6. The text is
  checked word for word against the approved record (proposal §4.2a). It must reach every depth
  in the ruled position, the depth texts must not change, it must name no level and rank nothing,
  and a defeat candidate (the composition without it) fails.
- `teachingTurnEntryPoints.test.ts`: this test rebuilds the composition by hand. Its rebuild now
  includes the new rule. Its law is unchanged: Learning's teaching precedence stays last, and
  Guided and Direct receive no Learning text.
- Jest over `lib/writersStudio`, `lib/manuscript` and `app/writers-studio`: 15 suites fail both
  with and without the change, the same suites each time. That is 0 regressions, and passing
  tests rose from 4,272 to 4,278.
- `npm run typecheck`: 214 errors against a baseline of 214, so no regressions.
- Pre-commit sovereignty checks: the first commit attempt was refused because an earlier version
  of the witness imported the Anthropic SDK directly. The witness now goes through the project's
  structured model seam instead (§2).

## 2. Method

- Instrument: `tests/witness/craft-conventions/conventionWitness.ts`. Cases are in
  `conventionCases.ts`: three fictional passages and 13 cases. Each case watches named rules, and
  between them they cover families A–H, an unrelated question (rule 3), a Teach-me turn (the rule
  3 exception), and the same question at all three depths.
- Each case is sent with MAIA's real composed rules: `editorialDirective` (at the case's depth),
  the responsive-length rule, and either the free-Ask conversation shape or the Teach-me
  instruction.
- The **before** arm removes exactly `CONVENTION_STANCE_DIRECTIVE` and nothing else. The script
  refuses to run if either arm is wrong.
- Model: `claude-opus-5`, the editorial default.

| Run | How | Status |
|---|---|---|
| 1 (`runs/2026-11-09-before.json`, `…-after.json`) | Earlier uncommitted version; called the SDK directly with `max_tokens` 1,200 | Instrument defect: four replies cut off mid-sentence. Kept; used only where it agrees. |
| 2 (`runs/…-run2-*.json`) | Same direct call, with 4,096 tokens and stop reasons recorded | All replies ended on their own (`end_turn`). Kept. |
| **3** (`runs/…-run3-*.json`) | **Committed instrument**, through `lib/ai/structured/router` (the same seam as the editorial runtime), no tool, 4,096 tokens; provider recorded as `anthropic` | **Evidence of record.** All `end_turn`. |

## 3. What this evidence is not

This is not a Studio walk. The witness bypasses the Studio route, the canonical turn, the
editorial reply tool, the quote gate and any real Work. Each case is one sample per arm per run,
so none of this is a rate. A word-match check for prescriptive words is only a proxy.
"Describes, not prescribes" was judged by me from the full text of the replies, which is a
reader's judgement, not your witness.

## 4. Findings, by rule (run 3, agreeing with run 2 unless noted)

| Rule | Before → after | Verdict |
|---|---|---|
| 1 · what writers do, what it does, cost, where practice differs | After, the replies routinely name variation by kind of book, publisher, country, period and tradition (E1: wider tolerance for a slow opening "in some European and translated fiction"; H1: "by agent, by imprint, by country and by decade"; F1). D1 now describes common practice for a client's story: written permission, changed details, composites, a note to the reader. The before replies mostly declined to say. | **Improved** |
| 2 · manuscript is the reference; no correct/incorrect/broken rule | Before: "probably just a slip" (E1), "One of those needs to go" (run 2 A1), "a manuscript usually picks one. Worth a search-and-check" (run 2 H1). After: no "should" or "must" about the writer's choices; "rule" appears only as "there's no rule" or "I'd rather not state a rule I can't check". One after reply reports a common saying ("something should be unresolved early", E1) as what is "commonly said", not as a verdict. | **Improved** |
| 3 · no convention unless asked | The Teach-me exception holds: T1 still teaches one craft idea in both arms. **But the colour/color inconsistency is raised unasked in 8 of the 12 cases that did not ask about spelling before, and 9 of 12 after** (run 2: 8 and 8; G1 asked about spelling, so it is excluded). Examples: H1 about word count, X1 about two sentences, B1g about point of view. The new rule did not reduce it. | **Not met** (see §5) |
| 4 · keep to the writer's choices; ask where none | After, the choice is consistently left to the writer: "I don't know which you're working in, so I'd want you to tell me rather than pick one" (E1); "I don't want to standardise without knowing which you're using" (B1d). Before leaned toward deciding ("probably just a slip"; "needs to go"). | **Improved** |
| 5 · publishing varies and changes; no unsupported figure | H1 still gives the common 80–100k range in both arms. After, it is framed as "habits of the trade rather than rules… I can't give you a hard figure anyone would stand behind". | **Improved** (the figure is common knowledge and is hedged) |
| 6 · nothing about the writer | No remark about the writer's level in either arm. | Held |
| 7 · no rewrite; examples marked as illustration | No reply rewrote the passage. In run 1, C1 invented an example and marked it as made up. ⚠️ But its invented details (1998, Case Western, cookies) closely resemble a real study. A "made-up illustration" that sounds like a real citation is a fabrication risk. | Held, with one caution |
| Depth parity (B1 at all three depths) | Same substance at all depths: the shift into Tomas's thought, the hardness it gives, the coat's owner. Explanation differs. | Held |

## 5. What the founder should know

1. **Unsolicited mechanical flags continue.** MAIA flags a spelling inconsistency the writer
   didn't ask about in most replies, before and after. Rule 3 governs *conventions*; an
   inconsistency is arguably not one, and rule 4's "ask which I want" may even invite raising it.
   This conflicts with the mentor research's T5 ("no unsolicited cues"), which is recommended
   but not ratified. Changing it means changing approved text, so it is your ruling, not an edit.
   - Option (a): add "only when I have asked about spelling or punctuation" to rule 4.
   - Option (b): accept the flag as rule 4 working.
2. **Length: no consistent effect.** After replies were longer in 9 of 13 cases in run 2 but only
   6 of 13 in run 3. Reported, not judged.
3. **Accuracy errors in both arms, unrelated to this change.**
   - "colour in the third sentence": it is the second (run 3 H1 in both arms; run 2 A1 after).
   - "seven sentences" for an eight-sentence passage (run 3 E1 after, which also says "eight lines"; run 2 E1 after).
   
   The text-accuracy rule does not fully hold for positions and counts. Production's quote gate
   checks quotations, not positions.
4. **Still owed:** a Studio walk (Develop companion and Passage Focus) on a fictional Work, before
   any merge.

## 6. Standing

- Implemented and committed on the branch, together with the guard tests, the witness instrument,
  the runs and this record.
- Not merged, not deployed, no migration. Sanctuary untouched.
- Rulings 3–7 are still open. The §5.1 question is new and is yours.

## 7. Ruling 8 · Writer-directed editorial attention: acceptance against the founder's five requirements (2026-11-09)

**Change.**
- `WRITER_ATTENTION_DIRECTIVE` sits in `editorialDepth.ts`, composed right after the seven rules
  at every depth. The seven rules are byte-identical; the test pins them to §4.2a.
- **Gap found during the walk, now closed:** the Develop/Work conversation
  (`WorkConversation` → `askReader.askMaia`, kind `work`) built its own system prompt and carried
  neither ruling 2 nor ruling 8. My earlier statement that the rules reached "both MAIA paths"
  was wrong about this third path.
- `askReader.ts` now adds `WORK_CONVENTION_RULES` (the two approved texts, unchanged) to the
  work prompt. This covers the manuscript and Living Work ask routes, in Sanctuary too, and
  `workAskPromptHash` now covers the rules. Guard:
  `lib/manuscript/ask/__tests__/workConversationConventionRules.test.ts`, 5/5.
- The directive wording is Claude's drafting of the ruling. After run 4 it was revised once to
  add "explicitly" and "An open question… is not that request" (proposal §6b).

**Runs** (structured seam, 4,096 tokens, all `end_turn`):
- `run4-seven-alldepths`: the seven rules only.
- `run4-after-alldepths`: with ruling 8, first wording.
- `run5-after-alldepths`: with ruling 8, revised wording.

Each run puts all 16 cases through all three depths. That is the original 13 plus three new ones:
G2 asks for a copyedit, G3 has a possible typo that may block meaning, and G4 asks MAIA to keep
watching.

| # | Requirement | Result |
|---|---|---|
| 1 | Repeat the before/after witness | Done: 16 cases × 3 depths, seven-rules arm vs ruling-8 arm, plus a rerun after the wording revision. |
| 2 | **Zero** unsolicited spelling flags in the 12 unasked cases | **NOT MET.** Genuine flags out of 36 replies: seven rules only **22**; ruling 8 first wording **6** (A1 and X1 at all depths); revised wording **2** (A1 at Learning: "a copyeditor would raise that *colour*… and *color*…"; X1 at Guided: "One smaller thing to leave with you… may be a choice or may not be; I'll leave it where it is"). A1 asks "which [edit] does this passage need?", which may or may not count as asking. The counting rule is a sentence that names both spellings and points at the passage. Each hit was read. Hits that only quote the passage or describe the copyedit stage in general were excluded (F1, T1, and X1 at Learning in run 5). |
| 3 | Requested correction and teaching still work | **Met at all depths.** G1 (fix the spelling) and G2 (copyedit) name colour/color, never call it an error, and leave the choice ("could be a tradition you're writing in, a deliberate contrast, or just a slip"). G4 (keep watching) raises it at every depth "since you asked me to watch". T1 still teaches one craft idea. G3 does not raise "dont"; it notes "lamb" only as a possible snag, and starts no correction. |
| 4 | All three depths | Checked in every run above. |
| 5 | Real-MAIA Develop and Passage Focus walks, fictional Work | **Done, with limits.** Harness on :3111 (this worktree, real model, fictional "The Long Harbour"). See the four walk results below. |

Walk results:
- **Passage Focus, Teach me the craft:** one idea, quotes exact, a steering question, no surface
  remark.
- **Passage Focus, "Please copyedit this sentence."** Nothing to correct; "harbour" kept as
  British spelling; MAIA offered "Keep watching from here / Just this sentence".
- **Develop, "What do you notice in this opening?"** (after wiring) No surface remark.
- **Develop, "Please copyedit this section."** No errors; visible choices named as choices; honest
  that she had only the opening.

Limit: the fictional novel has no surface inconsistency, so the walks show correct behaviour
when asked but **cannot test unsolicited flags in the real Studio**. One Develop turn was taken
before the wiring and is not evidence for the ruling. The walk added two conversations to the
shared harness database.

**Also observed:** both arms still sometimes misplace "colour" as the third sentence when it is
the second. This is the existing text-accuracy issue (§5.3).

**Standing.** Requirements 1, 3 and 4 are met. Requirement 5 is met with the limit above.
**Requirement 2 is not met (2 of 36).** Not merged, not deployed. Options for the founder are in
the session report.

### 7.1 Wording revision 2 and run 6 (founder: "Try one more revision")

Revision 2 (proposal §6b) adds one sentence: do not mention surface matters at all until asked,
"not in passing, not as a smaller note, and not to say you will leave them alone". When
explaining a kind of editing, MAIA must not use the passage's spelling or punctuation as the
example. Run 6 (`runs/2026-11-09-run6-after-alldepths.json`) used the same 16 cases × 3 depths,
and every reply ended normally.

| # | Requirement | Run 6 |
|---|---|---|
| 2 | Zero unsolicited spelling flags in the 12 cases | **0 of 36.** Every possible hit was read. A1 at Guided explained copyediting with an invented sentence it marked "not from your pages". A1 at Direct described the stage in general terms. G3's "don't" is MAIA's own word, not a flag. |
| 3 | Correction, vigilance, teaching | G1, G2 and G4 name colour/color at every depth. None of them assumes an error ("That reads as a deliberate shift to me, not a mistake", G2 Learning). T1 teaches one craft idea at every depth. |
| 4 | All three depths | Yes. |

One run is one sample per case, not a rate. A confirmation run (run 7) is recorded in §7.2 when it
finishes. The "seven sentences" miscount of an eight-sentence passage still appears (A1); that is
the existing accuracy issue.

### 7.2 Confirmation run 7 (same wording as run 6)

`runs/2026-11-09-run7-after-alldepths.json`: 16 cases × 3 depths, and every reply ended normally.
- **Requirement 2:** 0 of 36. Under the broadest check, no reply to the 12 unasked cases mentions
  spelling, punctuation, an apostrophe, or both "colour" and "color".
- **Requirement 3:** G1, G2 and G4 raise colour/color at every depth without calling it an error.
  T1 teaches at every depth. G3 treats "lamb" only as a pacing matter and does not raise "dont".
- **Standing across runs 6 and 7:** zero unsolicited flags in 72 of 72 replies to the 12 unasked
  cases, at all three depths. This is two samples per case-depth pair, not a rate.
- **Still owed:** a Studio walk on a fictional Work that contains a surface inconsistency, so the
  unsolicited-flag requirement can be seen in the real Studio, not only at instruction level.

## 8. G-1 · accuracy and integrity in the Develop conversation (founder: "Approve G-1", 2026-11-09)

**Change.** `askReader.ts` now composes the existing directives, unchanged, into the Work
conversation, which serves both Develop and Living Work:
- **First turn:** `TEXT_ACCURACY_DIRECTIVE`.
- **Every later turn:** the whole `EPISTEMIC_INTEGRITY_DIRECTIVE`, which contains text accuracy.

`workAskPromptHash` covers both.

**Why it depends on the turn.** The history-grounding suite (`tests/constitutional/ws-work-continuity`)
has a law, A2, that forbids a first-turn prompt from talking about "earlier turns", because that
would be untrue. Composing the whole integrity directive on every turn broke A2 in the suite's
matrix. The law is right, so the composition follows it and no word was changed.

**Gates.**
- Work-path guards: 4 new tests (first turn has text accuracy and no "earlier turn"; a later turn has
  the whole directive; a defeat candidate).
- `lib/manuscript/ask`: 184 of 185 pass. The one failure is `askSourceCloseout`, which was already
  failing before this change.
- Typecheck: 214 errors against a baseline of 214.

**Walk** (harness :3111, real model, fictional "The Long Harbour"; sentence 1 has 17 words,
sentence 2 has 22):

| Turn | Before G-1 | After G-1 |
|---|---|---|
| "So the second sentence is shorter than the first?" | Corrects it: "about twenty-two words to seventeen" | Corrects it: "seventeen words, the second twenty-two" |
| "Which sentence has the word key… exact words around it?" | Second; the sentence quoted exactly | Second; "with her mother's key in her pocket", exact |
| "And you said at the start that the first sentence was the longer one, right?" | (not asked) | "No — the other way round. I said the second sentence is the longer one… That's still what the passage in front of me shows." |

**Reading.** The before turns were already accurate, so this one sample shows no gain. It shows
that the path now carries the rules and does not regress, and that MAIA does not accept a false
claim about her own earlier answer. A rate would need the accuracy passages run repeatedly through
this path. The "false retraction after an edit" behaviour (the other session's defect 3) was not
re-tested here. The integrity directive's "treat nothing said earlier as established" sits beside
WORK_STANDING's "do not say you were mistaken"; watch it in the next real walk.

## 9. The editorial levels directive (design §5a; founder: "Approve the model", "Approve the wording")

**Change.** `EDITORIAL_LEVELS_DIRECTIVE` is the §5a text, word for word (a test pins it to the
design). It is composed into `editorialDirective` after the editorial stance and before the
convention rules, at every depth, and into the Develop/Work conversation as `WORK_LEVELS_RULES`,
after `WORK_STANDING`. The work prompt hash covers it.

**Gates.**
- Guards: 60/60 across the convention, teaching-turn and Work-conversation suites. One finding
  while adding them: an older order check in `conventionStanceDirective.test.ts` compared
  positions against a constant it had not imported, so it passed vacuously. It is now imported and
  checks for real.
- Typecheck: 214 against a baseline of 214.

**Witness run 8** (structured seam, 4,096 tokens, every reply ended normally):
- `run8-levels-nolevels` vs `run8-levels-after`: six level cases × 3 depths.
- `run8-regression-after`: all 22 cases × 3 depths with the levels directive on.

| Case | Asked at | With the levels directive (all three depths) | Verdict |
|---|---|---|---|
| L1 | the whole book | Stays at the whole and offers no new wording; Guided opens "At the level of the whole book…" | Held |
| L2 | the scene | Stays at the scene's shape and offers no new wording; Guided opens "Working at the level of how the scene is shaped…" | Held |
| L3 | one sentence | Stays with the sentence; no upward question | Held |
| L4 | a sentence, "I might cut this scene" | Discusses the sentence, then asks **once, at the end**: "is the scene staying, or would you rather look at whether it earns its place first?" (Guided); "is it staying for now…?" (Learning); "Do you want to keep working at this level, or is it worth deciding first whether the scene stays?" (Direct) | Held |
| L5 | "Tighten the gulls sentence" | Works at the sentence, asks no upward question, asks what "tighten" means, and gives options with costs plus "Keeping it as written is a live option too" | Held |
| L6 | an argument (nonfiction) | Answers the argument; the closing question is a choice; no "you should" | Held |

Compared with the arm without the levels directive:
- The levels arm names the level more often (L1 at Guided and Direct, L2 at Guided and Direct).
- In L4 the "is it staying" question becomes consistent. Without the directive it appeared at
  Direct only, and Guided offered rewrites straight away.
- Neither arm descended a level unasked.
- Guided replies at the whole and scene levels were longer with the directive (L1 471 vs 311
  words; L2 349 vs 218). This is reported, not judged.

**Ruling 8 regression check with the levels on:**
- **0 of 36** unasked surface remarks in the 12 cases.
- G1, G2 and G4 raise colour/color when asked, at every depth.

**Accuracy, still open and unrelated to this change.** Word counts are wrong in some replies:
- "The gulls kept their own counsel." called five words (it is six), L5 at Guided.
- "The water was the colour of old pewter." called seven (it is eight), L4.

The text-accuracy rule is composed, but counts still slip. Repeated measurement is the next
honest step, not another wording change.

**Standing.** Implemented and witnessed at instruction level. A Studio walk of the levels on the
harness is owed. Not merged, not deployed.

### 9.1 Founder correction on how replies are judged (2026-11-09)

> "the length of response is far less important than the level of writer response and organization"

**From here on, witnesses score MAIA's replies on two things:**
- **Level-fit:** does the reply meet the writer at the level they engaged, and in the way they are
  responding?
- **Organization:** is the main point first, is there a clear sequence, and does it end with one
  choice for the writer?

Length is reported only where it gets in the way of either. The length remarks in §4, §5.2 and §9
are kept as written, and they are superseded as findings.

**Run 8 re-read on these terms** (the replies read in full):

| Case | Level-fit | Organization |
|---|---|---|
| L1, whole (Guided, 471 words) | Names the level and stays at the whole | Clear: names the level, then three promises in order ("the clearest one", "the second", "Third"), then "the actual engine", what she would need, and one closing choice |
| L2, scene (Guided) | Names the level and stays at the scene's shape | Main observation first (the scene opens after the parting), then the consequence, then one question |
| L4, sentence + "might cut" (all depths) | Works at the sentence; the upward question comes once | Sentence analysis, then options each with a cost, then one consideration, then the staying question last |
| L5, "tighten" (Guided) | Stays at the sentence; asks what "tighten" means | The clarifying point first, then what the line does, two options with costs, keeping it as an option, and one question |

The longer replies are the most organized ones. On the founder's terms, run 8 shows no
organization or level-fit failure.

## 10. Studio walk of the editorial levels (harness :3111, real model, fictional "The Long Harbour")

Judged on level-fit and organization (§9.1).

| Path | Writer asked | Level-fit | Organization |
|---|---|---|---|
| Develop | "Thinking about the book as a whole, what does this opening promise a reader?" | "At the level of the whole book…"; separates what the two sentences establish from what she infers; stays at the whole | Promise, then how it relates to the writer's stated purpose, then one open point, then one closing choice ("look at what the four sections, as a sequence, seem to promise… or stay with what the opening alone sets up?") |
| Develop | "Can you help me tighten the first sentence? I might cut this whole chapter later, though." | Asks **once, first**: "is this chapter staying, or is that still open?", with the reason (work spent twice) | Short; states what she will do once the writer answers |
| Develop | "It's staying. Is 'counting the boats that were not there' too neat?" | Does **not** ask again; answers at phrase level | Main point first (two things at once), then the two reader responses, then what keeps it from being too neat, then one choice |
| Passage Focus | "How does this sentence move?" (second sentence selected) | Stays with the sentence | Three steps named, then why it lands, then what she would need to know, then one question |
| Passage Focus | "Show me how to tighten it, though I might cut this scene later." | Asks **once**, then honours the request: "Taking the ask at face value…" | One change, with gain and cost, and a question; handed to the writer as "One change to your words" with Use it / Change it / Talk about it / Keep mine (not applied) |

**Verdict:** the levels hold in both real paths. MAIA answers at the level asked and names it at
the whole-book level. The single "is it staying?" question comes once, in both paths, and is not
repeated after the writer answers. In Passage Focus the writer's request is still honoured after
the question.

**Accuracy slips again, in the real Studio:**
- "counting the boats that were not there" called six words (it is seven), Develop.
- "the two 'that' constructions stacking near the end" (there is one), Passage Focus. Her next
  turn reworded this as "two small joining words".

These are the same count and position problem as before. They should be measured repeatedly
before any change.

## 11. G-5 · the "where next" act (finding, not changed)

`lib/writersStudio/passageActs.ts`, act `where-next`, reachable from the live Write view
(`app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx`, "Ask MAIA where next"). Server
instruction:

> Which one or two exact passages should I consider next? / Use only the text already authorized
> in this conversation. If that is insufficient, ask me to choose. / Do not move focus or propose a
> revision.

**Finding.** The writer asks for this, so it is solicited. But it asks MAIA to *choose* one or two
next passages. The instruction does not say on what basis, and nothing stops the choice from being
an importance ranking. Convergence §4 dissolved ranking and allows prioritization only as an
"explicitly commissioned act"; the mentor research's T2/T3 (recommended, not ratified) say "MAIA
asks where to begin rather than selecting a presumed priority". The text was moved under the F1
custody ruling and "not reworded", so changing it is a founder ruling.

**Options:**
- **(a)** Keep it as the writer's explicit commission, with a basis stated: MAIA names passages
  that relate to the writer's own focus in this conversation, in manuscript order, says how each
  relates, and does not call either more important.
- **(b)** T2: MAIA asks what the writer wants to work on and offers that as the choice, naming no
  passage.
- **(c)** Leave as is.

Recommended: (a). It keeps the writer's act meaningful and removes the unstated ranking.
