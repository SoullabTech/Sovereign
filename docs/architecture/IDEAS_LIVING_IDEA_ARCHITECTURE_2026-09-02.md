# Ideas — from thinking journal to living idea

**Date**: 2026-09-02
**Surface**: `/maia/ideas`, `/maia/ideas/[id]`
**Status**: Cut 0 landed (defects). Cuts 1–3 specified, not built.
**Founder direction**: 2026-09-02 — *"The core is already right. I would not redesign this. I would let it acquire a second dimension."*

---

## 0. Diagnosis

The room today is an elegant **linear thinking journal with MAIA inside it**. That is
real and worth keeping. But ideas do not develop linearly — they branch, contradict
themselves, acquire and discard language, encounter sources, return to earlier
intuitions, and eventually reorganize around a stronger center.

The structural gap: after twenty exchanges the member must **reread the history to
know what they currently think**. The thread records *the conversation through which
an idea evolves*. It does not let the member *see the idea itself evolving*.

```
              LIVING IDEA
           what it has become
                  ↑
SEED ─── conversation / exploration ─── CURRENT EDGE
                  │
          branches · questions
          sources · tensions
          changes · discoveries
```

The conversation stays the river. Above it sits the form the river is creating.

### Defects found in the 2026-09-02 case study (all fixed in Cut 0)

A founder thread developing a phenomenology of consciousness (Awareness → Attending
→ Allowance; PEL) received four consecutive MAIA reflections asking essentially the
same question: *what problem does this solve, who is it for, what changes for a
helper on Monday morning?* Four causes, all structural:

| # | Defect | Cause |
|---|--------|-------|
| 1 | The member's ~9,000-char entry was **silently clipped mid-sentence** | `maxLength={4000}` on the composer. No signal. MAIA then reflected on the amputated text. |
| 2 | Save / Ask failures were **invisible** | Every failure path was `console.error` only. |
| 3 | MAIA **looped on the same clarifying move** | Progression was prompt-hope. The model was handed 2 prior reflections and asked to infer its own stage; a twelve-reflection thread looked like a two-reflection thread. |
| 4 | A conceptual thread was **redirected into product scoping** | The Ideas-mode move set is entirely application-flavoured (audience, problem, first useful version). Written to stop projection, it overcorrected into a single product-manager reflex. |

Defect 4 is the one that matters most, and it is **not only a prompting problem —
it is an interaction-design problem**. The member was dwelling with an emerging
perception; the appropriate stance was *stay with this* or *explore*, not
*operationalize it*. Cut 3 fixes it properly.

---

## 1. The load-bearing invariant

> **MAIA may propose. Only the member ratifies.**

Already true of *Mark as Change*: MAIA identifies a possible shift; the member's
click is the closure; the created object carries the member's own words, unchanged.
That gesture is correct and generalizes to every layer below.

This is not politeness — it is
`docs/canon/CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md` applied. Authority moves
upward only, through authored experience. A **Living Idea** panel is a
Recognition-layer object. If MAIA writes it, the system has manufactured
higher-order meaning from Reflection-layer material and skipped the member. If MAIA
*proposes* it and the member ratifies or edits it, authority still originates in
authored experience and the layer is legitimate.

Concretely, every synthesis object carries:

- `state`: `proposed` | `ratified` | `member_authored`
- `proposed_by`: `maia` | `member`
- `source_block_ids`: provenance back to the authored blocks it came from
- member edit always available; edit promotes state to `member_authored`

A `proposed` field renders visibly provisional and is never spoken as the member's
position. Nothing downstream (prompt context, exports, Writer's Studio drafts) may
read a `proposed` field as settled.

---

## 2. Cut 0 — defects (LANDED 2026-09-02)

| Change | Where |
|---|---|
| Block cap 4,000 → 12,000 chars, single source of truth | `lib/ideas/constants.ts`, blocks + capture routes |
| No `maxLength`. Visible counter past 80%, visible refusal past 100%, nothing ever silently dropped | `app/maia/ideas/[id]/page.tsx` |
| Every save / ask failure surfaces a member-legible sentence in the composer | same |
| Progression stage **computed server-side** from total reflection count, stated to the model as a directive; from the third reflection on, the scoping questions are banned outright and conceptual material must be developed on its own terms | `progressionStage()` + `PROGRESSION_DIRECTIVES` in `lib/team/maiaThreadReflection.ts`; `reflectionCount` wired in `ask-maia` route |
| Prompt context bounded per-block (latest 6k / older 1.2k / prior reflections 800), truncation **marked** so MAIA never reasons over a fragment it believes is whole | same |
| Composer split into two named acts: **Reflect** (member's own, nothing answers) and **Ask MAIA →** (explicit invitation) | `app/maia/ideas/[id]/page.tsx` |

The progression directive is a **floor, not the answer**. It stops the loop; it does
not give the member the wheel. Cut 3 does that, and once stances exist the directive
recedes to being the default-stance behavior.

---

## 3. Cut 1 — the idea acquires a name

**Problem**: the enormous serif heading is the truncated first sentence of the
opening entry (`description.split('\n')[0].slice(0, 120)` in the capture route).
That was the **seed**, not the title. The member reads it as *I am still inside the
note I wrote forty minutes ago* rather than *this is becoming something*.

**Shape**:

- Migration: `member_ideas.seed TEXT` — preserves the opening words permanently.
  Backfill from the current title where the title was auto-derived.
- Title becomes a real name, freely editable, allowed to evolve.
- Seed renders quietly beneath: *Seed: "I want to look at some ideas, some
  qualities, stages…"*
- MAIA gesture: **Suggest a name** → proposes 2–3 candidate names drawn from the
  thread. Member picks, edits, or ignores. Proposal only; the member's choice is
  the act. Never auto-renames.
- Capture route stops writing a truncated sentence into `title`; it writes `seed`
  and leaves the idea provisionally *Unnamed*.

Small cut. Highest felt-change per line of code in this list.

---

## 4. Cut 2 — Current Understanding (the living idea)

**The biggest missing piece.** Not a summary, not another MAIA message — a compact
persistent representation of where the idea currently stands, so the member can
wander without having to remember where the center is.

Fields (each independently proposable, ratifiable, editable, and dismissable):

| Field | Question it answers |
|---|---|
| Emerging proposition | What is the idea claiming right now? |
| Current structure | What shape does it have? |
| Related formulation | What parallel framing is in play? |
| Live tension | What is unresolved? |
| Open question | What is it reaching toward? |

**Schema** — `member_idea_understanding`, one row per field, append-only history
with a current-pointer, never a mutable blob:

```
id, idea_id, member_id,
field_key       TEXT   -- proposition | structure | formulation | tension | question
content         TEXT
state           TEXT   -- proposed | ratified | member_authored
proposed_by     TEXT   -- maia | member
source_block_ids UUID[]
superseded_by   UUID   -- previous version pointer; edits never destroy history
created_at
```

**Behavior**:
- MAIA proposes a field only when the thread gives it grounds, and never
  unprompted more than once per N blocks — the panel must not become a synthesis
  faucet.
- Proposed fields render provisional (dashed, muted, "MAIA suggests").
- Panel is **dismissable to zero**. The thinking space must stay quiet when the
  member wants to think.
- Member-authored fields are the ordinary case; MAIA proposal is the assist.

**Risk to hold**: this is the room's synthesis-drift vector. If proposed fields ever
render as settled, or feed prompt context as the member's position, the system has
started thinking on the member's behalf. The `state` column is the guard and must
be honored at every read site.

---

## 5. Cut 3 — relational stances

Not twenty AI buttons. Five modes of relationship to an emerging idea, selected by
the member before asking:

| Stance | What MAIA does |
|---|---|
| **Stay with this** | Doesn't solve it. Reflects what seems alive or unresolved. |
| **Explore** | Follows implications, associations, questions. |
| **Challenge** | Finds assumptions, contradictions, counterexamples. |
| **Connect** | Relates this to other ideas, thinkers, previous work, sources. |
| **Distill** | Asks what has actually become clearer. |

**Implementation**: `POST /api/ideas/[id]/ask-maia` takes an optional `stance`.
Each stance is a directive block appended to the system prompt, same mechanism as
`PROGRESSION_DIRECTIVES`. Stance is recorded in the reflection block's metadata so
threads can be read back later with the relation visible. Default (no stance chosen)
= current Ideas-mode behavior under the progression floor.

**Why this is the real fix for defect 4**: the member gets the wheel. A member
dwelling with an emerging perception selects *Stay with this*, and the system stops
demanding the idea justify itself. Sovereignty: the member directs the relation
rather than writing more prose in the hope of being read differently.

---

## 6. Cut 4 — lineage, branches, sources (later)

**Evolution history.** Ratified Changes become the idea's spine — not conversation
history but **intellectual provenance**:

```
Seed        Consciousness as Awareness → Attending → Allowance
 ↓ Change 1 AAA may describe relational capacities rather than stages
 ↓ Change 2 Freedom may mean increasing conscious participation
 ↓ Change 3 AAA and PEL may operate at different levels
```

Already half-built: `member_idea_blocks` where `block_type = 'change'`, ordered.
Needs a lineage view, nothing more.

**Branches.** Highlight → *Branch*. A branch is its own thought stream inside the
same idea. Restrained by default; no node graph until a map becomes useful. Schema:
`member_ideas.parent_idea_id` + `branch_label`, or a `member_idea_branches` join —
decide when built, not now.

**Sources / lineage.** Wilson, McKenna, McGilchrist, De Jaegher & Di Paolo should
not disappear inside MAIA prose. An idea gradually acquires a sources layer with the
invariant **source influence ≠ author's idea** — the same provenance discipline
being worked out in Writer's Studio, and it should be designed correctly here from
the start rather than retrofitted.

---

## 7. Product boundary this clarifies

| Space | Fundamental act |
|---|---|
| **Ideas** | *Something is becoming thinkable.* |
| **Explore** | *What else is connected to this?* |
| **Develop** | *What could this become?* |
| **Review** | *What have I actually made?* |
| **Writer's Studio** | *How do I give this enduring form?* |
| **MAIA conversation** | *What is happening with me now?* |

**Ideas is pre-form.** The interface must not become structured too soon: just
enough structure to make emergence visible, never enough to force premature
crystallization. Every cut above is measured against that line.

---

## 8. Sequencing

1. ~~Cut 0 — defects~~ **landed 2026-09-02**
2. Cut 1 — seed / name separation *(small, high felt-change)*
3. Cut 3 — relational stances *(the real fix for the case-study failure; no schema)*
4. Cut 2 — Current Understanding *(largest; carries the ratification invariant)*
5. Cut 4 — lineage view, then branches, then sources

Cut 3 before Cut 2 deliberately: stances are cheap, fix the observed failure, and
generate the thread quality that makes a Current Understanding panel worth
synthesizing from. Building the panel first would mean synthesizing over threads
still being steered wrong.
