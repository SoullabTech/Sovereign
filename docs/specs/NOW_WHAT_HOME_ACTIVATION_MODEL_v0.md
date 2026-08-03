# Now What? — Home Activation Model (v0)

**Status:** **RULED — Model 3, founder ruling 2026-08-03.** See §7. Design artifact; does
not by itself authorize implementation.
**Referent:** deployed SHA `95b21ce42`; code read at trunk `5e8f8a5bb`.
**Occasion:** Founder arrival walk, 2026-08-03. Kelly arrived at `/now-what` and found six
named sections, two doors, and both doors pointing at the same URL.

> **The governing sentence:**
> *The Home does not provide six tools. It provides six ways a member's lived work
> becomes visible.*

> **Deliberately not in memory.** This artifact carries the thread. Root memory carries the
> resulting orientation once the model has been implemented and walked — recording a
> candidate model in the index risks turning it into a standing constraint before it has
> earned that status. Founder direction, 2026-08-03.

§§1–4 record the investigation that preceded the ruling. §5 states the questions as they
stood. §7 is the ruling. Where §5's proposals conflict with §7, **§7 governs.**

---

## 1. The finding

```
The Home surface has achieved semantic separation
but not interaction separation.

The member can see six domains of work,
but cannot enter them as distinct acts.

Current state:
  taxonomy exists
  activation grammar does not
```

The UI says *"these are different places."* The routing says *"there is only one place."*
That contradiction is why the Home reads as empty rather than as quiet.

### Evidence — the door layer

`components/now-what/ClientHome.tsx` (486 lines) uses `Door` three times:

| Section | Door | Destination |
|---|---|---|
| My journey | — | none |
| Decisions | ✓ | `/now-what/room${ctx}` |
| Commitments | — | none |
| Sessions | ✓ | `/now-what/room${ctx}` |
| Reflections | ✓ | `/now-what/field${ctx}` |
| Coach connection | — | none |

`ClientHome.tsx:219` — `const roomHref = '/now-what/room' + ctx` — one constant, used at
lines 344 and 399. The two room doors are **byte-identical URLs**. No phase, no intent, no
discriminator. `app/now-what/room/page.tsx:27` defaults `phase = 'fire_1'`. The room cannot
know which door was pressed.

Nine sibling routes exist and are unreachable from the Home: `arrive`, `map`, `next`,
`position`, `questions`, `reflections`, `themes`, `welcome` (plus `field`, reachable).
Four of those (`position`, `questions`, `next`, `field`) are live composition surfaces;
`reflections` and `themes` are deliberate HOLD + EXPLAIN rooms per the 2026-07-13 ruling.

---

## 2. The object layer already exists — this is the load-bearing discovery

The Home is not reading from six stores. It reads **one table** and discriminates on a tag.

`app/api/now-what/home/route.ts:44`:

```ts
const KIND_OF_TAG: Record<string, 'decision' | 'commitment' | 'question'> = {
  decision: 'decision',
  practice: 'commitment',   // the one thing committed at session close
  question: 'question',
};
```

Every section is `member_field_note_threads` filtered by `spiralogic_phase`, with
**Reflections as the default branch** (`route.ts:132`) — explicitly "default, not leftover."
Sessions are derived from the threads a member kept. Journey reads
`field_program_positions` (member-declared or absent).

So the six fields are **six readings of one authored-act stream**, not six subsystems.

### Consequence: the room already writes into three of the six

`app/api/now-what/field-note/route.ts` accepts `decision`, `practice`, `offering`
(lines 60, 70) and sets `threadPhase = p.isQuestion ? 'question' : spiralogicPhase`
(line 238). `NowWhatRoom.tsx:663` `saveTagged('practice'|'offering', …)` writes the
session-close commitment.

| Section | Can the room fill it today? |
|---|---|
| Commitments | **Yes** — `saveTagged('practice')` at session close |
| Questions | **Yes** — `p.isQuestion` → tag `question` |
| Reflections | **Yes** — default branch, any untagged kept thread |
| Sessions | **Yes** — derived from kept threads |
| Journey | No — different table, member/coach declaration |
| Decisions | **No — see §3** |

---

## 3. The mechanical defect inside the architectural finding

`NowWhatRoom.tsx:646` sends `spiralogicPhase: phase`, where `phase` is the URL param.
The Decisions door (`ClientHome.tsx:344`) carries **no phase param**, so the room defaults
to `fire_1`. `KIND_OF_TAG['fire_1']` is `undefined` → the default branch.

> **Everything a member works through via "Work a decision through →" is stored as a
> Reflection. It can never appear in Decisions.**

The one door whose section has a matching write tag is the one door that does not carry it.
The Decisions section is structurally unfillable through its own entrance — a missing query
parameter, not a missing feature.

**This is recorded as a FINDING. It is not fixed here.** Fixing it in isolation would
harden Model 2 by default, which is precisely the decision this artifact exists to keep open.

---

## 4. The three candidate models

### Model 1 — Six rooms
Each field gets its own page and its own conversation.
*Strength:* clearest mental model. *Risk:* fragments the relational experience; turns MAIA
into a collection of tools — a feature mall.
*Evidence against:* the object layer is one stream with six readings. Six rooms would
duplicate a discrimination the read layer already performs.

### Model 2 — One relational room, six lenses
Every field enters the same room; intent is carried as state; the room emits the right object.
*Strength:* preserves the conversational heart; requires the least new surface.
*Risk:* stronger intent/state handling required; the member's felt sense of "different
places" is carried entirely by copy, not by structure.
*Evidence for:* this is what the code is one query param away from being.

### Model 3 — House + activated rooms
The room is not the destination; it is the hearth where things become real.

```
              House
My Journey ───┐
Decisions ────┤
Commitments ──┼──> MAIA relational room
Sessions ─────┤          ↓
Reflections ──┘     activated artifact
                         ↓
                    returns to Home
```

*Evidence for:* the return leg already exists. The room writes an authored object; the Home
composes it back. `member_field_note_threads` **is** the activated artifact, and the Home
**is** the return doorway. Model 3 is closest to what is already built — what is missing is
the *outbound* leg carrying intent, not the object or the return.

> The House is not a menu. It is a set of latent capabilities waiting for a meaningful
> human act.

---

## 5. What must be ruled before any door is built

For each field, four questions. Answers below are **proposals grounded in existing code**,
not rulings.

| Field | Activation gesture | Who may activate | Object created | Return doorway |
|---|---|---|---|---|
| My Journey | "What am I working on?" | member **or** coach, labelled | `field_program_positions` row | `/now-what/position` |
| Decisions | "I am carrying this decision" | member only | thread, tag `decision` | Home §Decisions |
| Commitments | "This is how I want to practise" | member only | thread, tag `practice` | Home §Commitments |
| Sessions | "Keep this thread alive" | member only | kept-thread set | `/now-what/room` |
| Reflections | "Keep this" | member only | thread, default tag | Home §Reflections |
| Coach connection | "Share this" | member only, per-piece, withdrawable | `shareWithPractitioner` flag | Home §Coach |

### Open questions requiring a founder ruling

1. **Which model?** 1, 2, or 3. Everything downstream depends on this.
2. **May MAIA propose an activation?** The room already proposes threads the member keeps,
   revises or discards. Does that proposal power extend to *typing* a thread as a Decision,
   or may only the member type it? (Bears on Constitutional Direction of Authority: typing
   is a higher-order act than proposing.)
3. **Does a coach-stated Journey belong on the member's Home at all**, and if so does the
   member confirm before it renders? (`field_program_positions.stated_by` /
   `member_confirmed_at` exist; the Home currently renders without requiring confirmation.)
4. **Do the four undoored sections get doors, or is their emptiness correct?** Commitments,
   Reflections and Coach connection may be *properly* doorless — they fill only as
   consequences of acts made elsewhere. Giving them doors may be the feature-mall mistake.
   My Journey is the one whose doorlessness looks unintended.

---

## 6. What this artifact does not authorize

- ⛔ No routing change. The identical-`roomHref` defect is recorded, not fixed.
- ⛔ No new rooms, no new tables, no migration.
- ⛔ No door added to any currently doorless section.
- ⛔ The `phase=decision` one-liner is **not** to be applied as a quick win — it silently
  selects Model 2.

---

## 7. RULING — founder, 2026-08-03

### The finding the ruling rests on

> The Home is not missing six rooms. It is missing the **outbound intent signal** that
> activates an existing authored-act stream.

What exists:

```
Member gesture → Authored act → member_field_note_threads → Home composition
              → Decision / Commitment / Reflection / Session surfaces
```

What is missing:

```
Where did this act begin?
What was the member trying to do?
```

The `phase` param defect (§3) is revealing precisely because it exposes the temptation:
*Decision button → add `?phase=decision` → same room → different tag.* That works
mechanically and it makes **the room the center**. The deeper question it forces:

> Does the House organize *conversations*, or does it organize *meaningful acts that
> conversations can serve?*

### 7.1 — Model — **RULED: Model 3, House + activated acts**

Not on philosophical preference. **On substrate:** the object layer, the write path and the
return leg already describe Model 3. The architecture already says that is what exists.

The Home is not six rooms. It is **six views into the member's evolving field.**

Activation grammar:

```
Intent → Gesture → Authored act → Object → Home returns it
```

**Refinement (binding): the Home exposes GESTURES, not rooms.**

| ⛔ Avoid | ✅ Prefer |
|---|---|
| "Create a Decision" | "I'm carrying a decision" |
| "Create a Commitment" | "I want to practise this" |
| "New Reflection" | "Keep this" |

**The object follows the human act** — never the reverse. A door named for the object it
produces is a feature-mall door. A door named for what the member is doing is a gesture.

### 7.2 — May MAIA propose an activation? — **RULED: propose, never assign**

```
MAIA proposes meaning.
Member declares meaning.
```

| | |
|---|---|
| ✅ MAIA **may propose** | *"This sounds like something you may want to keep as a decision."* |
| ⛔ MAIA **may not assign** | *"This is now a Decision."* |

**The tag is a member-authority act.** This is the Constitutional Direction of Authority at
the typing boundary: proposing is a lower-order act than typing, and authority may not skip
the layer. MAIA's existing propose/keep/revise/discard power in the room does **not** extend
to typing a thread's kind.

### 7.3 — Coach-stated Journey before confirmation? — **RULED: may appear, must stay attributed**

The data model already carries the answer: `stated_by` and `member_confirmed_at`.

A coach-stated Journey **may** render before member confirmation, but the attribution must
remain **visible in the copy itself**:

| ✅ | *"Your coach identified this as a focus for your work."* |
|---|---|
| ⛔ | *"Your focus is…"* |

**The confirmation boundary must remain visible.** An unconfirmed coach statement may never
render in the member's own voice.

### 7.4 — Doorless sections — **RULED, with one open edge**

Some sections should **not** have doors, because they are **accumulations of lived acts**,
not surfaces to be worked.

| Section | Door? | Basis |
|---|---|---|
| My Journey | **yes** | ruled |
| Decisions | **yes** | ruled |
| Commitments | **yes** | ruled |
| Sessions | **yes** | ruled |
| Reflections | **lean no** | ⏳ *not settled — see below* |
| Coach Connection | **no** | ruled |

Governing rationale: *otherwise the House becomes a task manager.*

#### Open edge — Reflection ontology

**This belongs to the activation model, not to gesture vocabulary.** It is not a door
question; it determines *what kind of thing Reflection is.* If it is carried forward as a
copy decision, the wording will settle the ontology by accident.

```
Open edge: Reflection ontology

Question:
Is Reflection:
A) a member-authored act of creating reflection,
or
B) the return surface where meaning appears after a member chooses to keep something?

Current lean:
Reflection should not become a productivity object or task surface.

Resolution criterion:
Determine whether a member experiences reflection as something they intentionally begin,
or something the system preserves after an intentional keeping gesture.
```

Recorded as a **lean, not a ruling**, so it cannot later be cited as settled. A and B
produce materially different houses. It must be closed explicitly before Reflections is
doored or finalised as doorless.

### 7.5 — What the ruling narrows the implementation question to

1. Expose the correct **gestures** (not object-creation buttons).
2. Carry **intent** into the existing object stream.
3. Preserve **member authority** over the tag.
4. Avoid creating **six miniature apps**.

> This is an architecture decision, not a UI polish pass.

### 7.6 — Sequence discipline (binding)

```
Object → Relationship → Gesture → Surface
```

**not**

```
Surface → Button → Object
```

The second path is how "six fields, one chat door" happened in the first place. The order is
the control; each stage may only be decided once the stage above it is closed.

| # | Stage | Answers | Artifact | Status |
|---|---|---|---|---|
| 1 | Activation model | *What are these things?* | this document | ✅ ruled, one open edge (§7.4) |
| 2 | Gesture vocabulary | *How does a person enter relationship with them?* | next artifact | ⏳ not started |
| 3 | Placement | *Where/when does that gesture become available?* | held **inside** artifact 2 as an explicit unresolved dimension — **not merged into the copy** | ⏳ not started |
| 4 | Implementation | — | — | ⛔ build only what 1–3 require |

**Why placement stays separate from vocabulary.** They answer different questions:

- **Gesture meaning:** *What human act is this?*
- **Placement:** *When does that act become available?*

```
Gesture:   "I'm carrying a decision."
Meaning:   The member recognises an unresolved matter worth holding.
Placement: A. inside conversation, after exploration
           B. on Home, as a return invitation
           C. both
```

Deciding placement too early turns the Home into a command center — *"Create Decision"* —
instead of a field — *"Something you are carrying may be worth continuing."*

### 7.7 — Queue

- [ ] Close the **Reflection ontology** open edge (§7.4). Stage 1; blocks stage 2.
- [ ] Author the **gesture vocabulary** artifact — member's own words, first person, per
      §7.1 and the Member's World principle. Carry placement inside it as an open dimension.
- [ ] Confirm the **Decisions write tag** reaches its section once intent is carried
      (§3 defect closes as a consequence of the model, not as a patch).
- ⛔ **Do not build the doors yet.**
