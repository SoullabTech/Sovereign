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
