# SEMANTIC-FIELD-01 · Implicit Academy: one conversational way to teach (plan, 2026-11-01)

```
STATUS:    PLAN for founder approval. Nothing is built by this document.
OWNER:     This (Writers Academy) session, as one bounded piece inside
           WRITERS-STUDIO-SEMANTIC-FIELD-01 (founder, 2026-11-01: "yes").
           The walk session keeps the five-question MAIA witness and the
           stale-message / restored-conversation fix.
CANONICAL: 214855712 (includes #2044).
```

## 1. Direction and what is already done

Founder, 2026-11-01, on MAIA's first "Teach me" reply: teaching should be *"adjusted to the
level of the writer and maybe more importantly part of a conversation rather than a full info
dump"* (ACADEMY-01 census §20). The founder also named this as the priority: *"the most
important aspect now is the internal academy that supports the writer through MAIA and the
studio."*

#2044 (merged) changed two things:
- the "Teach me about the writing" card's instruction (`TEACHING_TURN_SHAPE` in
  `EditorialDancePanel.tsx`);
- the Learning-depth wording in `lib/writersStudio/editorialDepth.ts`.

The aim was one idea, a few plain sentences, then one question the writer steers by.

## 2. Evidence that #2044 is not enough yet (local walk, canonical `214855712`)

The walk used `next dev` on the Mac Studio and the local test member's fictional QA Work, so
no member data was involved.

1. **Selection-menu "Teach me" on a fresh passage** ("Rain tapped the sill.") still produced a
   long reply of about 380 words, in one turn:
   - the move;
   - the convention behind it;
   - what it does;
   - what it costs;
   - an experiment;
   - an offer of a further thought, then a question.

   This path set the Learning depth that #2044 changed, so the depth wording alone did not hold.
2. **A passage taught before #2044** reopened its old conversation with the old long reply
   (`editorialThread` restored from the last writing place, even when removed from the
   address). There is no visible way to start fresh. Restore behaviour is the walk session's
   fix (§6).
3. The **card path #2044 changed** was not reached in this walk, because the menu sent the turn
   directly. Its live behaviour is unwitnessed.

## 3. Why it still dumps (code-read at `214855712`)

**(a) Ten "Teach me" entry points, ten instructions.** #2044 reshaped two of them (the card and
"Teach me more"). The others send their own wording, and several ask for the full shape
outright:

| Entry point | File | Asks for |
|---|---|---|
| Selection menu "Teach me" | `P4R1Pc3WriteEditView.tsx` (~767) | "what is happening… as writing" |
| Revision change "Teach me" | `P4R1Pc3WriteEditView.tsx` (~633), via `RevisionManuscriptLayer` | "what the move does, what it may cost, and when my original…" |
| "Teach me why" (direction) | `EditorialDancePanel.tsx` (~932) | "what the move may gain and what it could cost" |
| Craft companion "Teach me" | `MaiaCraftCompanionR1.tsx` (~533) | "plain language first; professional terminology second" |
| Craftsman's Table "Teach me" | `CraftsmansTableR1.tsx` (~555) | "plain language first, then professional terminology" |
| Observation "Teach me why" | `ObservationManuscriptLayer.tsx` (~199) | "the one… idea… plain language first, then my own words" |
| Develop "Teach me" (observation) | `P4R1DevelopView.tsx` (~2951) | same |
| Develop "Teach me what is happening" | `P4R1DevelopView.tsx` (~3121) | "keep the technical term optional" |
| Card "Teach me about the writing" | `EditorialDancePanel.tsx` | conversational shape (#2044) |
| "Teach me more" | `EditorialDancePanel.tsx` | conversational shape (#2044) |

**(b) The always-on editorial rules pull the other way.** `editorialDirective(depth)` sends
the depth wording **first**, then `EDITORIAL_INTELLIGENCE_DIRECTIVE`. That directive says:
- "If you recommend a move, say what it may gain and what it could cost";
- "distinguish what you noticed, why it matters here, what you are proposing, and why".

Coming last, these read as the required structure even when the writer only asked to learn.

## 4. The change (one bounded piece)

1. **One teaching instruction.** A small module, `lib/writersStudio/teachingTurn.ts`, holds
   the shape:
   - one idea, in a few plain sentences, shown in the writer's own words;
   - no term, cost, second move or experiment unless asked;
   - end with one short question the writer steers by;
   - no replacement wording.

   It provides an opening and a continuation for each anchor kind: passage, observation,
   revision change, editorial direction. All ten entry points call it instead of their own
   wording. #2044's text moves there unchanged in intent.
2. **Teaching shape governs length.** In `editorialDirective`, for the Learning depth only,
   the conversational instruction is placed **last** with one added clause. The clause: when
   I asked to learn, you are not recommending a move, so the gain/cost and noticed-why-propose
   structure waits until I ask. `EDITORIAL_INTELLIGENCE_DIRECTIVE` itself is not edited, and
   Guided and Direct are unchanged.
3. **Level stays the writer's.** MAIA's closing question and the existing chips ("That makes
   sense" / "Help me with it" / "Teach me more" / "Go deeper") set the next turn's depth. The
   attunement directive already honours "say that more simply". Nothing is inferred, stored or
   labelled (L6c, L6e).
4. **Findable in one step.** In the Write selection menu ("Work with passage"), "Teach me"
   moves from under "More ways to work" to the top level, worded "Teach me about this —
   Learn the craft already at work here". The menu item and the card do the same thing, so
   a writer meets one "Teach me", not two. The privacy-posture and MAIA-relationship gates
   stay exactly as they are (constitutional). They are named when "Teach me" is first chosen,
   as today.

## 5. Tests and evidence

- **Static guard (new test).** Every "Teach me" entry point builds its message through
  `teachingTurn.ts`, so a bespoke teaching prompt fails the test. Defeat candidate: one entry
  point restored to its pre-plan wording, which the guard must catch.
- **Composition tests.**
  - Learning depth ends with the teaching clause.
  - Guided and Direct output is byte-identical to before.
  - No depth or teaching text mentions a level, skill or competence.
  - No teaching instruction asks for a cost or a term unless the writer asked.
- **Unchanged law.** The frozen ACAD-2 suite stays green (`npm run verify:ws-academy-freeze`,
  `matrix:ws-academy` if present), as do the facet invariants in `editorialDepth` tests and
  `npm run typecheck`. Tests that fail on canonical and pass after the change are named in
  the PR.
- **Runtime witness (local, fictional data).** Each entry point once, scored on:
  - one idea;
  - shown in the writer's words;
  - ends in exactly one question;
  - no term, cost or experiment unless asked;
  - no proposed wording.

  Then follow up with "say that more simply", "why does it work?" and "what does it cost?",
  and check each reply takes exactly that step. Reported as observations of model behaviour,
  not proof. The founder judges whether it *feels* like a conversation.
- **After deploy:** the walk session re-runs its Q3 ("Why does this paragraph feel flat?") in
  production.

## 6. Not in this piece

- The restored-conversation / stale "nothing was sent" fix. It belongs to the walk session;
  this piece's witness uses fresh passages until that lands.
- Deploy: a separate act, approved by the founder.
- Any facet/depth selector UI, any stored writer profile, the explicit Academy room, and craft
  content (the ACAD-1 contract's "founder authors" rule stands).
- Changing the closed act kinds (`discourse`, `direction`) or adding a server-side "teach" act.

## 7. Sovereignty and growth-obligation answers

- **Agency:** the writer sets the depth turn by turn and can stop at "That makes sense". MAIA
  writes no more of their prose.
- **Uncertainty:** whether a one-idea instruction actually produces one idea is a model
  behaviour. It is witnessed per entry point, not assumed from the tests.
- **Provenance:** every teaching turn stays anchored in the writer's own words. No external
  standard of good writing.
- **New responsibility:** one module now governs all teaching. Its guard test keeps new
  entry points from drifting back into bespoke prompts.

## 8. Authorization requested

Build §4 with §5's tests on one PR, then the local witness. ⛔ No deploy without a separate
founder approval.
