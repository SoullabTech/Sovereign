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
