# Now What? — Member Field Experience Architecture

**Date**: 2026-08-03
**Status**: DRAFT for ruling. Not canon. Does not authorize implementation.
**Supersedes in scope**: `docs/architecture/NOW_WHAT_HOME_ACTIVATION_MODEL_2026-08-03.md`
(that document's finding stands; its "first cut" is narrower than this model).

---

## 0. The ruling this document exists to make

> **Do not create more rooms. Create field activation logic.**
>
> *What human gesture causes something to enter each field?*

The rooms exist. The navigation exists. What is missing is the correspondence
between how a person actually moves through their work and what the surface
lets them do. Every section below is written to answer one question per field:
**purpose · what enters · who may initiate · what actions are available.**

---

## 1. The central architectural claim

The nine surfaces are **not nine pages**. They are **lenses on one living
field**.

```
                        MEMBER FIELD
                             │
   ┌──────────┬──────────┬───┴───────┬───────────┬──────────┐
Journey   Decisions  Commitments  Questions   Sessions   Coach
                             │
                        Reflections
```

The underlying object is not a section. It is an **engagement** — a state of
relationship between the member and a piece of their work:

```
Engagement
 ├── Program      (a container entered)
 ├── Practice     (an intention accepted)
 ├── Decision     (a choice being carried)
 ├── Question     (an exploration being lived)
 ├── Session      (a conversation continued)
 └── Reflection   (something kept)
```

Home renders the member's current field. It is an **orientation point**, not a
dashboard. The question it answers is *"what is alive in my work right now?"* —
never *"what features do I have?"*

## 2. The activation table (the load-bearing artifact)

| Field | Human gesture | Substrate | Status |
|---|---|---|---|
| Journey | "This is where I am" | `field_program_positions` | ⚠️ needs a catalog entry (§5) |
| Decision | "I am carrying this choice" | thread, tag `decision` | ✅ proven live |
| Commitment | "I want to practise this" | thread, tag `practice` | ✅ proven live |
| Question | "I am living with this question" | thread, tag `question` | ✅ proven live |
| Reflection | "I want to keep this" | thread, untagged | ✅ proven live |
| Session | "I want to continue this conversation" | session room | ✅ live |
| Coach | "I choose to share this" | `can_be_shown_to_practitioner` | ⚠️ asymmetric (§6) |

**Evidence** (local dev, throwaway fixture member, rows removed after): all four
thread gestures returned 200 and landed in the correct Home band; share-at-
creation produced `shared: 1`; withdraw moved `shared` 1 → 0. `program-position`
returned 404 `No such field here` because the dev catalog has no such field.
This is dev-server evidence of **contract correctness**, not member evidence.

## 3. Per-field definitions

### HOME — "Your Field"
- **Purpose**: orientation. What is alive right now.
- **What enters**: nothing. Home composes; it never stores.
- **Who initiates**: the member, by arriving.
- **Actions**: continue · enter · view field.

### MY JOURNEY / CURRENT WORK
- **Purpose**: where the work is pointed.
- **What enters**: a programme entered · a coaching focus · a member-named intention.
- **Who initiates**: **both** — practitioner may *place*, member *states* or *confirms*. Attribution is permanent and per-row.
- **Actions**: confirm · update · leave · continue.

### DECISIONS
- **Purpose**: unresolved meaningful choices, held open.
- **What enters**: a choice the member names, from a conversation or directly.
- **Who initiates**: **member only**. A coach may say *"you might want to explore this"* — that is an utterance, never a write. The member owns the decision object.
- **Actions**: keep · revisit · resolve · let go.
- **Framing**: the object is *the question*, not the answer. Not "create decision" — *"something you are carrying."*

### COMMITMENTS
- **Purpose**: where intention becomes practice.
- **What enters**: a practice the member names, or a programme-suggested practice **the member accepts**.
- **Who initiates**: **member only**. A programme may *offer*; only acceptance makes it theirs.
- **Actions**: continue · reflect · revise.
- **Refuses**: goals · tasks · compliance tracking.

### QUESTIONS YOU'RE LIVING
- **Purpose**: developmental exploration. Distinct from Decisions — *"I am exploring"*, not *"I need to choose."*
- **What enters**: a question the member keeps while still living it.
- **Who initiates**: member only.
- **Actions**: continue exploring · let go.

### SESSIONS
- **Purpose**: continuity between conversations. **The one place where conversation is the centre.**
- **What enters**: conversations the member carried something out of.
- **Who initiates**: member.
- **Actions**: return to conversation · prepare for the next.

### REFLECTIONS — *ontology decision required*
- **Model A** — reflection is an **act**; a door exists ("Keep a reflection").
- **Model B** — reflection is a **return surface**; things appear because they were kept elsewhere. No door.
- **Current lean: Model B.** Model A risks turning the environment into journaling software.
- ⚠️ The candidate implementation on `feature/client-home-executive-copy` builds **Model A**. If Model B is ruled, that door is removed before merge.

### WHAT MAY BE NEXT
- **Purpose**: what is *available* — never what the member *should do*.
- **What enters**: things the member already has open (a paused conversation, a begun practice, a kept question).
- **Who initiates**: nothing; it is a view.
- **Refuses**: recommendation · ranking · prompting.

### COACH CONNECTION
- **Purpose**: the trust boundary, seen from the member's side.
- **Coach sees**: programmes they invited the member into · explicitly shared pieces · agreed practices.
- **Coach never sees**: private reflections · unshared decisions · personal exploration.
- **Actions**: share (at authoring) · stop sharing.

## 4. Practitioner → Member activation (the missing bridge)

```
PRACTITIONER FIELD                    MEMBER FIELD
  Clients                               "Available through your
  ├── Programs      ──── offers ───▶     coaching relationship:
  ├── Groups                              Leadership Presence
  ├── Practices                           [Enter]"
  └── Resources                                │
                                          member decides
                                               ▼
                                          becomes theirs
```

**The invariant**: *assigning a client to a programme creates **availability**,
never **ownership**.* The practitioner offers; the member enters. Nothing a
practitioner does may write an object into the member's field as *theirs*.

The existing `program-position` shape already encodes this
(`practitioner` seed → `member_confirmed`). It is the only room that does. No
other room should acquire a practitioner-seed path without ruling who may
produce that value.

## 5. Why the Journey gesture 404s — and why it matters

`POST /program-position` resolves a real field **and** a real programme before
writing. With no catalog entry it refuses rather than fabricate. That refusal is
correct behaviour, and it locates the gap precisely:

> **The one member gesture that cannot complete is the one that depends on a
> practitioner-created container.** Everything the member can author alone
> already works. Everything requiring the practitioner bridge does not exist yet.

That is the strongest available argument that §4 is the correct next build.

## 6. Open questions requiring a ruling

1. **Reflections: Model A or Model B?** Blocks merge of the candidate branch.
2. **Sharing is asymmetric.** `PATCH` supports **withdraw only**. A member can share at the moment of authoring and revoke later, but cannot share an existing unshared thread — there is no grant path. Deliberate, or a gap?
3. **Does "Continue" on a Decision open a conversation?** If yes, chat re-enters through the back door for every room.
4. **Group/cohort visibility** — §4 names Groups with no boundary model. Unspecified.
5. **What May Be Next** — how does "available" stay distinguishable from "recommended" once more than three things are open?

## 7. What this document does not authorize

No implementation. The candidate branch `feature/client-home-executive-copy`
(`d8fb19794`) holds working member gestures and is explicitly **not for merge**
until Q1 and Q3 are ruled. The arrival walk instrument stays pinned to
`95b21ce42` and is untouched by any of this.
