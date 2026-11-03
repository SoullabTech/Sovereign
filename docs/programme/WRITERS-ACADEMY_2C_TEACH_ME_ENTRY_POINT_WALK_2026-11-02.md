# Writers Academy · 2c · Walk of the "Teach me" entry points (2026-11-02)

```
STATUS:    WITNESS RECORD (local walk). It authorizes no change.
ROADMAP:   WRITERS-ACADEMY_ROADMAP_2026-11-02.md, Phase 2, item 2c.
LANE:      WRITERS-STUDIO-SEMANTIC-FIELD-01 (implicit Academy).
CODE:      local dev server on canonical 5fb8dee0f (same teaching code as production).
DATA:      local test member and test Work ("QA — Window and Rain"); Ordinary chosen;
           MAIA relationship set. Real MAIA replies, not mocks.
```

## 1. What was asked

Until today only one teaching entry point had been walked live: the Write menu's "Teach me
about this" (production re-run, 142 words, passed). Every other "Teach me" shares the same
module (`lib/writersStudio/teachingTurn.ts`), and a test guards the wording. But no one had
read what MAIA actually says through them.

Each reply was read against the founder's shape:
- one idea, in the writer's own words;
- no term, cost, other moves or exercise unless asked;
- it ends with one question the writer can steer by;
- no replacement wording, and nothing about the writer's ability.

## 2. Result

| # | Entry point (where a writer finds it) | Code | Words | Shape |
|---|---|---|---|---|
| 1 | Write · "Work with passage" › **Teach me about this** | `P4R1Pc3WriteEditView.tsx:744` | 142 | **Pass** (production, 2026-11-01) |
| 2 | Focus · empty state › **Teach me about the writing** | `EditorialDancePanel.tsx:618` | ~70, ~118 | **Pass** (twice) |
| 3 | Focus · after a reply › **Teach me more** | `EditorialDancePanel.tsx:715` | ~100 | **Pass**: one next step |
| 4 | Focus · "Want more?" › **Teach me why** | `EditorialDancePanel.tsx:962` | ~110 | **Pass**: names both sides |
| 5 | Write · proposed-change marker Δ › **Teach me** | `P4R1Pc3WriteEditView.tsx:635` | ~85 | **Pass** |
| 6 | Craftsman's Table · change card › **Teach me** | `CraftsmansTableR1.tsx:555` | 93 | **Pass** |
| 7 | Craftsman's Table · MAIA › Ways to work › **Teach me** | `MaiaCraftCompanionR1.tsx:534` | 87 | **Pass** |
| 8 | Develop · observation › **Teach me what is happening** | `P4R1DevelopView.tsx:3122` | ~125 | **Pass** on shape; see F1 |
| 9 | Develop · observation card › **Help me understand** | `P4R1DevelopView.tsx:2952` | n/a | Same prompt and path as 8 |
| 10 | Write · observation marker › **Teach me why** | `ObservationManuscriptLayer.tsx:200` | n/a | Same path as 8; see F1, F2 |
| 11–13 | Rebuild Studio · Revision Desk (**Help me understand**, **Explain the craft**) and its change teach | `RevisionDesk.tsx:247, :438`, `RebuildStudioClient.tsx:1399` | n/a | **Not reachable**; see F4 |

**Every reachable entry point gives a short, conversational teaching turn.** Each reply
carried one idea anchored in the writer's own words and ended with a question the writer
could steer by. No reply drafted new wording or commented on the writer. "Teach me more"
took exactly one next step, and "Teach me why" named both when the direction helps and when
it doesn't.

## 3. Findings

**F1. Develop shows, and stores, the teaching instruction as the writer's own words.**
- In Develop and the observation marker, the conversation shows the writer's turn (labelled
  YOU) as the whole composed instruction: "Teach me the craft at work in this observation…
  Do not add the technical term… Do not test me or say anything about my ability."
- The local database holds that same text in `ask_turns` with `speaker = author`.
- The Write path shows a short label instead (`displayText`), and its controller says
  server-owned policy must never be stored as words the author apparently spoke.
- This predates #2047: Develop always sent its teaching prompt as the writer's question. But
  #2047 made it longer and more rule-like, which reads worse as something a writer said.
- Smallest fix, not decided: give the Develop/observation dialogue the same split the Write
  path has (a short visible question, with the shape carried server-side). This touches the
  Ask question custody, so it needs a design choice before code.

**F2. The observation marker's answer opens out of sight.**
- "Teach me why" on the Write-view observation marker opens its conversation *below* the
  popover's visible area: the popover is 466px tall and its content 798px.
- A writer clicking it sees nothing happen unless they scroll inside the popover.

**F3. A pending proposal stays under a teaching reply.**
- In Focus, when the thread holds an earlier proposal, "Teach me about the writing" and
  "Teach me why" show their reply above "MAIA's recommendation" and its edit.
- The writer asked to learn and also sees a recommendation. It may be intended (the proposal
  is still open), but it pulls toward changing the text.

**F4. Three teaching prompts can't be reached.**
- `/writers-studio/rebuild` redirects to the current Studio (`proxy.ts:751`), so the Revision
  Desk's "Help me understand" and "Explain the craft", and the rebuild Studio's change teach,
  are not reachable by a writer.
- They are still covered by the guard test, so they can't drift. Removing them is cleanup in
  the Studio lane, not Academy work.

**Smaller notes (accuracy, not shape):**
- One reply said the sentences "get shorter and barer as they go"; the third is the longest.
- One reply misquoted the test marker as "A_FIELD_CHECK_1".
- The Craft Companion repeated a point MAIA had already made earlier in the same thread.
- Reachability: the Craft Companion's "Teach me" sits inside a 13-option menu, and the
  proposed-change marker Δ is a 30×25px button in the prose.

## 4. Limits

- This was a local walk by the agent, not a writer's walk. It establishes what MAIA says
  through each button; it says nothing about how a writer experiences it. Jondi's walk
  (Phase 1) is the evidence for that.
- One short test passage. Longer, messier writing may draw longer replies.
- "Help me understand" (9) did not send again because its conversation was already open with
  the same prompt; its reply is the one recorded under 8.
- Develop asked permission to read the section before answering (per question). That gate
  worked as designed and was allowed for the test Work.

## 5. Proposed next steps (each needs approval)

1. **F2, the smallest:** scroll the observation marker's conversation into view when it
   opens. One-component change, with a test.
2. **F1:** decide how Develop's teaching question is shown and stored, then make the change.
   It touches Ask question custody, so the design comes first.
3. **F3:** leave as is unless Jondi's walk shows it confuses.
4. **F4:** pass to the Studio lane as cleanup.
