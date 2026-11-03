# Writers Academy · F1 · Teaching instructions stored as the writer's words: design (2026-11-02)

```
STATUS:    DESIGN CANDIDATE for the founder. It authorizes no code.
FINDING:   F1 of the 2c walk (WRITERS-ACADEMY_2C_TEACH_ME_ENTRY_POINT_WALK_2026-11-02.md, #2062).
LANE:      WRITERS-STUDIO-SEMANTIC-FIELD-01 (implicit Academy). The free Ask box path is the
           walk session's ("Work Passage options unselectable"); this design covers it by agreement.
CANONICAL: 2a97f83f1.
```

## 1. The defect, measured

When a writer presses a teaching button, the Studio sends a composed instruction as the
writer's own words, and the server stores it as the writer's turn.

- **Where it shows:** Develop and the observation marker display it as the writer's message:
  "YOU: Teach me the craft at work in this observation… Do not test me or say anything about
  my ability." The Write path shows a short label (`displayText`), so the problem is hidden
  there but not absent.
- **Where it is stored:** the local database holds the full instruction in `ask_turns` with
  `speaker = 'author'` for **every** teaching path walked: Focus, the Write menu, the change
  marker, Craftsman's Table, Craft Companion, Develop and the observation marker.
- **The free Ask box does the same:** `sendOpenPrompt` appends instruction lines to what the
  writer typed. Design 3C (#2069) adds the conversational lines there too (walk session's
  report, 2026-11-02).
- **It contradicts a rule already in the code:**
  - `P4R1WriteEditController.tsx:1318`: register, pedagogy and model policy are
    "server-owned and never stored as another sentence apparently spoken by the author in
    ask_turns".
  - `editorialRuntime/turn.ts:408`: "Server-owned fixed editorial register, not
    author-authored speech."
  - The composed prompts break that rule one layer up, in the client.
- **History:** this predates the Academy. Develop and Write always sent composed teaching
  prompts this way. #2047 made them longer and more rule-like, which made the problem visible.

Why it matters:
- **Provenance:** the writer's turn is the record of what the writer said. Today it holds
  sentences the writer never wrote, including a sentence about their own ability.
- **Downstream:** later turns read the stored author turns (`turn.ts:242`) and
  `relationalCraftSystemGuidance(utterance)` derives guidance from them. So the system's own
  instructions are read back as if they were the writer's intent.

## 2. What already exists, so nothing new is needed

The server already has the right channel. Both MAIA paths compose server-owned instructions
into the **system** prompt from closed, validated request fields. The writer's stored words
go in as the user message.

| Path | Server-owned system parts today | Closed request fields today |
|---|---|---|
| Editorial turn (`turn.ts:405`) | `editorialDirective(depth)`, `studioGuideInstruction()`, latitude, sequence, `proposalPolicyInstruction(policy)` | `proposalPolicy` (`allow \| reply_only`), `responseDepth` (`guided \| learning \| direct`), validated against a fixed field list (`turn/route.ts:52`) |
| Developmental Ask (`developmentalAskReader.ts:248`) | `editorialDirective('guided')`, `explanationInstruction(style)`, all covered by `developmentalAskPromptHash` | `responseStyle` |

`teachingTurn.ts` already holds the teaching shape as server-importable constants, and #2069
adds `CONVERSATION_TURN_SHAPE`.

## 3. The design

**One rule:** the writer's turn holds only words the writer chose. The *shape* of MAIA's
answer is a closed, server-owned field, never sentences in the writer's turn.

1. **One new closed request field on both paths: `turnShape`.**
   - Values: `'teaching'` or `'conversation'`, plus a closed `teachingAnchor` for teaching
     (`passage | observation | change | direction | continue`).
   - The route validates them like `proposalPolicy` and refuses anything else. No free-text
     instruction field exists or is added.
2. **The server adds the shape to the system prompt.**
   - It uses `teachingTurnSystemInstruction(anchor)`, built from `TEACHING_TURN_SHAPE`, or
     `CONVERSATION_TURN_SHAPE` once #2069 merges.
   - It sits beside `editorialDirective` in `turn.ts`, and in `systemFor` plus
     `developmentalAskPromptHash` for Develop, so a stored reply still names the exact system
     prompt it was produced under.
3. **The writer's turn becomes the words on the button the writer pressed.** These are words
   the writer saw and chose, for example:
   - "Teach me what is happening in this passage."
   - "Teach me what is happening in this change: 'quiet when' → 'quiet, and'."
   - "Teach me more."
   - "Teach me why this direction might work."

   These are close to the existing `displayText` labels. For the free Ask box, the writer's
   turn is exactly what they typed.
4. **`teachingTurn.ts` changes role, not wording.**
   - It exports the visible question per anchor plus the server-side shape. The client
     imports only the questions.
   - The guard test (`teachingTurnEntryPoints.test.ts`) is extended to fail if any instruction
     line ("Do not…", "End with one short question…") is sent from the client.
5. **History is left as it is.** Existing `ask_turns` rows keep their bodies: they record what
   was actually sent. No backfill, no migration. The change is forward-only.
6. **No schema change.** The new field rides the existing request bodies.

What does not change:
- What MAIA is told: the same shape lines, moved to the system prompt.
- Depth (Guided, Learning, Direct), the privacy and relationship gates, Sanctuary, the
  read-permission gate in Develop, and proposal policy.

## 4. The one question of principle (founder)

**Does pressing a button count as the writer saying the button's words?**

Under this design the stored writer turn is "Teach me what is happening in this change."
The writer chose that by pressing a button, not by typing it.

- **Recommended: yes.** The words are short, visible on the button before it's pressed, and
  say nothing the writer didn't choose. They contain no rules, nothing about the writer, and
  no policy. This needs no schema change.
- **Alternative:** record button presses as a separate *act*, not as author speech (a new
  turn kind, or `speaker = 'author'` with an act field and no body). This is more exact about
  provenance, but it needs a migration, and every reader of `ask_turns` would have to learn
  the new kind.

Everything else in §3 follows from the existing rule in the code, so it doesn't need a
separate ruling.

## 5. Acceptance (what proves it, before and after)

- **Defeat candidate:** today's code fails each check below. Each check must fail first, then
  pass.
- **Storage:** for each teaching entry point and the free Ask box, the new `ask_turns` author
  row equals the visible question or the typed text exactly, with no instruction line.
- **System prompt:** the system prompt for that turn contains the shape for its `turnShape`.
  Develop's prompt hash changes accordingly.
- **Refusal:** an unknown `turnShape` or anchor is refused by the route. A request without
  `turnShape` behaves as today minus the shape (plain question).
- **Live:** a local re-walk of 2c gives the same short conversational answers, and the YOU
  line now shows only the button's words.
- **Unchanged:** depth, gates and the existing suites (`teachingTurnEntryPoints`, C6R6-4,
  `editorialDepth`) still pass.

## 6. Split of work (after approval)

- **This lane:** `teachingTurn.ts`, the route fields and system composition for teaching,
  every Teach me entry point, Develop and the observation dialogue, and the tests.
- **Walk session:** `sendOpenPrompt` and the Speak path switch to `turnShape: 'conversation'`
  with the typed text only, after #2069.
- **Order:** the server field first, so both sides can move independently.

## 7. Not in scope

- Rewriting stored history.
- Changing what MAIA is asked to do.
- Showing writers a depth choice (roadmap 2e).
- F2 (merged as #2063), F3 and F4.
