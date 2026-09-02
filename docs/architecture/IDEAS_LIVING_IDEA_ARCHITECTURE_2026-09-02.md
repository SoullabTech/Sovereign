# Ideas — from thinking journal to living idea

**Date**: 2026-09-02
**Surface**: `/maia/ideas`, `/maia/ideas/[id]`
**Status** (adjudicated 2026-09-02):

| Cut | State |
|---|---|
| Cut 0 — defects | implemented, **unverified** |
| Cut 1 — seed / name separation | implemented, **unverified** |
| Cut 2 — relational stances | implemented, **unverified** |
| Cut 3 — Current Understanding | **explicitly NOT AUTHORIZED** |

**Next threshold**: verification (§9) → real consciousness-thread witness (§5) →
architectural adjudication.
**Founder direction**: 2026-09-02 — *"The core is already right. I would not redesign
this. I would let it acquire a second dimension."*

**Mandate for this lane** (founder, 2026-09-02): *Take Cut 1 + Cut 2. Seed/name
separation first, then per-turn relational stances. Do not build Current
Understanding yet. Preserve Reflect as silent. Preserve "MAIA may propose; only the
member ratifies." Then witness the consciousness thread before authorizing Cut 3.*

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

## 1a. Durable principles (adjudicated 2026-09-02)

Three principles fell out of building Cuts 1–2. They are recorded as durable, not as
notes on this feature.

### P1 — Explicit member stance outranks inferred progression

```
member's explicit relational instruction
              ↓
     inferred conversational stage
              ↓
        generic MAIA behavior
```

An inference about where the member is in a process may **never** override what the
member has just asked MAIA to do. This surfaced as a concrete collision — Cut 0's
`close_and_offer` directive against Cut 2's *Stay with this* — and the resolution
(`PROGRESSION_FLOOR`) is the general form.

**Canonized 2026-09-02** as **Invariant 17 —
`EXPLICIT_MEMBER_DIRECTION_PRECEDES_INFERRED_STATE`** in
`docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md`. The canonical statement carries a
qualification this shorthand does not, and the qualification is load-bearing: the
precedence holds *provided the instruction remains within hard safety, consent,
privacy, and system-integrity boundaries*. It governs MAIA's interpretations of the
member — it is **not** "the latest member instruction overrides everything", and it
does not sit above the Oath or the safety floor. Full hierarchy:

```
hard constitutional / safety / consent boundaries
                    ↓
explicit member relational direction
                    ↓
member-ratified meaning and preferences
                    ↓
MAIA-inferred stage / readiness / pattern
                    ↓
generic conversational heuristics
```

Any surface that both infers something about the member and accepts an explicit
instruction now inherits Invariant 17's design test: ask what happens when they
disagree.

### P2 — Ratification needs structural enforcement, not prompting

```
MAIA   →  proposed_titles
member →  title
```

Encoding the boundary into route topology is stronger than instructing "MAIA must not
rename things", because the architecture makes the epistemic distinction real: there
is no code path from a suggestion to the name, and acceptance is constrained to an
actually stored proposal. When Cut 3 is authorized it inherits the identical pattern:

```
MAIA notices → proposed recognition → member accepts / edits / ignores → ratified understanding
```

### P3 — Capture and interpretation separate cleanly

> **We do not need to know what something means in order to preserve what it was and
> where it came from.**

`seed` + `seed_block_id` is the first concrete instance. It generalizes to every kind
of material coming later — conversation imports, source passages, voice dumps, copied
material, files, and material brought in from another Idea. See §7.

### Corollary — the bias toward preserving possible human authorship

The `LENGTH(title) >= 60` guard in migration `20260902000001` is retained
deliberately. The two error directions are not equivalent harms: a false negative
leaves an awkward title in place, correctable by ordinary member action; a false
positive rewrites the system's interpretation of something a member may have
deliberately authored. **Under-demotion is preferable to falsely demoting member
authorship** — and that bias is correct for the whole system, not just this migration.
The rationale is written into the migration itself so it is not "optimized" later.

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

## 3. Cut 1 — the idea acquires a name (IMPLEMENTED 2026-09-02, unverified)

**Problem**: the large serif heading was the truncated first sentence of the opening
entry (`description.split('\n')[0].slice(0, 120)` in the capture route). That was the
**seed**, not the title. The member reads the room as *I am still inside the note I
wrote forty minutes ago* rather than *this is becoming something*.

**Built** — migration `20260902000001_member_idea_seed_and_title.sql`:

| Column | Meaning |
|---|---|
| `seed` | Display excerpt (≤400 chars) of where the inquiry began. Never rewritten as the title evolves. |
| `seed_block_id` | FK to the authored block the seed came from — provenance by reference, not duplication. `ON DELETE SET NULL`, so the link is nulled honestly rather than dangling. |
| `title_source` | `member` \| `auto_seed` \| `maia_accepted`. |
| `proposed_titles` | MAIA's suggestions. Never read as the idea's name. |

- **Backfill is exact, not heuristic.** The capture route wrote the title as a literal
  prefix of the first block; where the current title still *is* that prefix, no human
  ever named the idea, so it is marked `auto_seed`. **No title text is rewritten by the
  migration** — an unnamed idea is demoted in the UI, never erased.
- UI: an `auto_seed` idea renders as *Unnamed inquiry* (muted italic) with
  `Seed: "…"` beneath, in both the workspace and the list. The pencil offers an
  **empty** field rather than asking the member to edit a sentence into a name.
- `POST /api/ideas/[id]/suggest-title` → Haiku returns 2–3 candidates
  (`lib/team/maiaTitleProposal.ts`). Names are handles, not verdicts: noun phrases in
  the member's own vocabulary, forbidden from summarizing or asserting what the idea
  means.
- Proposals render **dashed, muted, prefixed "MAIA suggests — not yet the name"**.

**The ratification boundary is enforced by route shape, not discipline**:
`suggest-title` writes only `proposed_titles`; `PATCH /api/ideas/[id]` is the only
writer of `title`, and `accept_proposed_title` is verified against the stored
proposals so an arbitrary string cannot be laundered through that path as if MAIA had
offered it. There is no code path from a suggestion to the idea's name that does not
pass through a member's click.

---

## 4. Cut 2 — relational stances (IMPLEMENTED 2026-09-02, unverified)

Five verbs governing **one MAIA turn**. `lib/maia/ideaStances.ts`.

| Stance | MAIA's job | MAIA resists |
|---|---|---|
| **Stay with this** | deepen, reflect, notice, remain close to what is emerging | solving, redirecting, application questions |
| **Explore** | follow implications and adjacent possibilities | premature convergence |
| **Challenge** | test assumptions, contradictions, excluded possibilities | contrarianism for its own sake |
| **Connect** | identify conceptual / source / prior-idea relationships | turning connection into equivalence |
| **Distill** | articulate what has actually become clearer | manufacturing closure, claiming member agreement |

**Held by shape, not by intention:**

- **Per-turn, never a mode.** The stance lives in one request body and one piece of
  component state that clears in the `finally` block of the ask. Nothing persists it
  on `member_ideas`. There is no sticky state, hidden or otherwise.
- **No default.** Plain `Ask MAIA →` sends no stance and behaves exactly as before.
  A member who wants company does not have to operate a control panel to get it.
- **Reflect stays MAIA-silent.** Stances attach to Ask MAIA only — Reflect does not
  call MAIA at all, so a stance cannot reach it.
- An unrecognized stance is **rejected (400)**, never silently ignored: a member never
  gets a different relation than the one they chose.
- The stance is recorded in the reflection block's metadata, so a thread reads back
  with its relations visible.

**The constitutional rule**, appended to every stance directive from a single shared
constant so it cannot drift between them:

> A stance may change MAIA's **manner of participation**. It may never change the
> **epistemic status** of the member's material.

So Distill may say *"one possible formulation I'm hearing is…"*. It may not turn that
formulation into the idea's position. Connect may surface McGilchrist or Wilson;
proximity is not provenance and citing a thinker is not endorsement by that thinker.

**Interaction with the Cut 0 progression floor**: when a stance is chosen, the member
has taken the wheel — the stance governs the move and progression reduces to
`PROGRESSION_FLOOR` (anti-repetition only). Without this, `close_and_offer` ("close the
loop and make a structural offering") would directly contradict Stay with this ("do not
offer structure they did not ask for"), and a stance the member *chose* would be
overridden by a stage the system *inferred*.

---

## 5. The witness — experiential, not technical

**Do not build Current Understanding yet.** After verification (§9) is green, the
consciousness thread is used as the witness, approached the way a naïve member would
approach it — not as a test harness.

**The acceptance criterion is not that the prompt contains the correct instructions.**
It is what the member experiences.

### Step 1 — three ordinary Ask MAIA turns, no stance

This isolates Cut 0. We need to know whether the computed progression stage removed
the repetitive product-manager behavior **independently of the stance system**. If it
did not, Cut 2 would be masking a defect rather than adding a capacity.

### Step 2 — write something genuinely exploratory, then choose *Stay with this*

Not a test sentence. Real material. The criterion:

> *Yes. MAIA remained with the thing I was trying to perceive rather than dragging me
> toward an outcome.*

### Step 3 — *Explore* on the same inquiry

The experiential distinction should be obvious:

```
Stay with this  →  depth without displacement
Explore         →  movement without forced convergence
```

**If those two feel almost identical, the stance architecture is not yet doing enough
work.** That is a real failure result, not a tuning note — it would mean the
directives are being flattened somewhere between the prompt and the response, and the
right response is to diagnose that rather than to add a sixth stance.

### Step 4 — *Distill*, watching for the constitutional failure

The thing to watch is not quality. It is:

> Does MAIA describe what appears to be emerging, or does she start telling me what I
> now believe?

The former is **recognition**. The latter is **appropriation**. Distill is the stance
where that line is thinnest, which is why its resist clause is the strictest of the
five.

### What authorizes Cut 3

Not "the stance test passed." The authorization is a **felt moment**: after several
good turns, finding yourself thinking —

> *This is working — but where have we actually arrived?*

That is the requirement. It tells us Current Understanding would be solving a real
phenomenological problem — **the difficulty of maintaining gestalt while thought
continues to unfold** — rather than filling a box on an architecture diagram.

---

## 6. Cut 3 — Current Understanding (NOT AUTHORIZED)

When authorized, the **first cut is deliberately small**: three fields only. Not the
branches/sources/concepts apparatus.

**Which three is not settled.** The current proposal is *Emerging proposition · Live
tension · Open question*. The thread may instead want:

- **What seems to be emerging**
- **What remains alive**
- **What has changed**

— which is more phenomenological and less propositional, and closer to how the
material in the witness thread actually moves. **Use will tell us.** Do not fix the
field set before §5 has run; picking it from the diagram is exactly the error this
whole sequencing is designed to avoid.

Schema — `member_idea_understanding`, one row per field, append-only with a
supersede pointer, never a mutable blob:

```
id, idea_id, member_id,
field_key        TEXT   -- field set decided by the witness, not in advance
content          TEXT
state            TEXT   -- proposed | ratified | member_authored
proposed_by      TEXT   -- maia | member
source_block_ids UUID[]
superseded_by    UUID   -- edits never destroy history
created_at
```

Behavior: proposed fields render provisional; the panel is dismissable to zero (the
thinking space must stay quiet when the member wants to think); MAIA proposes only
when the thread gives it grounds, and rate-limited, so the panel never becomes a
synthesis faucet.

**Risk to hold**: this is the room's synthesis-drift vector. If a `proposed` field ever
renders as settled, or feeds prompt context as the member's position, the system has
started thinking on the member's behalf. The `state` column is the guard and must be
honored at every read site.

---

## 7. Capture doctrine (founder, 2026-09-02) — governs Cut 4 and after

> **Ideas should adapt to how people actually think before asking them to conform to
> how the system organizes thought.**

People will paste chat conversations, voice transcripts, half-written notes, book
passages, emails to themselves, screenshots, fragments from MAIA, things they wrote
three years ago, and huge unruly blobs. Making them classify all of that before
capture would make Ideas less fertile.

**Separate capture from interpretation. Capture first, meaning later.** The first
system response to a long paste is *Got it. Nothing lost.* — not *what kind of
artifact is this?*

```
CAPTURE      anything that enters the field
   ↓
WORKING      what I am actively thinking with
   ↓
RECOGNITION  what I have come to believe / formulate / create
```

That distinction dissolves most of the provenance problem. A pasted conversation is
not yet *my idea* — it is material entering my field of thought. Two truths held
simultaneously: *this matters to my thinking*, and *not every sentence in it
originated with me or represents what I believe*.

**The provenance rule**: don't solve authorship by preventing messy input —
**preserve origin at ingestion; determine meaning through use.** A block knows its
`origin`, `participants`, `captured`, `source`, and `status: source_material`.
Operations on it — *continue from this, pull into reflection, mark as important,
connect, extract questions, distill with MAIA* — never alter the original. A member's
rewrite of a sentence has its own provenance. A MAIA formulation the member explicitly
affirms becomes ratified. The messy genealogy is preserved, not pretended away.

Cut 1's `seed` / `seed_block_id` is this doctrine in miniature and its first
implementation: origin preserved by reference at ingestion, meaning (the name)
determined later through use.

### Dynamic UI — the honest definition

Dynamic must **not** mean the UI rearranges itself because a model thinks it knows
better; that is disorienting. It means:

> **The workspace reveals the affordances appropriate to the member's present act.**

Composer promiscuous by design — type, speak, paste, drop a file, import a
conversation, add an image, add a link — without deciding what kind of thinker the
system wants you to be today. Then the UI quietly adapts: a two-sentence thought stays
a reflection; a 9,000-character essay is treated as long-form; a multi-speaker paste is
recognized as a conversation; a URL becomes a source; a voice ramble becomes a
transcript; disconnected snippets stay fragments. Capabilities appear when behavior
makes them relevant, instead of one permanent toolbar.

### Learning the member's process

Not *Kelly likes dark mode*, but *this member opens with long associative reflections,
brings prior conversations in, explores widely before wanting synthesis, and often
needs MAIA to stay with an intuition longer before converting it into an application.*
The system can then foreground **Stay with this · Explore · Connect** during an
opening run and leave **Distill** available but quieter. Someone else works
`fragment → question → research → synthesis`, or `voice dump → distill → outline →
develop`, or `source → annotation → contradiction → thesis`. Ideas must not require
everyone to use one person's process; it should discover theirs and support it.

**The firm boundary**: the interface may adapt to behavior, and MAIA may infer which
*operation* might be useful — but neither may silently infer **authorship,
endorsement, or meaning**. *"You often paste conversations — want me to preserve these
as imported conversation blocks?"* is fine. *"This appears to be your current thesis"*
must remain a proposal.

> MAIA may recognize, suggest, connect, organize and propose.
> The member determines what something means to them.

### Design doctrine

> **Meet the member where their creative process actually occurs, preserve what they
> bring without distortion, and gradually offer structures that increase their capacity
> to notice, develop, connect and give form to what is emerging.**

*Offer structures* is load-bearing. This is not merely reproducing habits: if someone
has fifty disconnected notes, Ideas should not congratulate them on having fifty
disconnected notes — it can make relationships visible. If someone converges
prematurely, MAIA can help reopen the field. If someone endlessly explores,
distillation becomes available. If someone forgets where an insight came from,
provenance restores the lineage.

```
honor the natural process
        ↓
make the process visible
        ↓
expand its available moves
        ↓
help the member become more conscious of how they themselves create
```

Which returns the room to the material that started it: Ideas can itself embody
**Awareness → Attending → Allowance**. *Awareness*: here is what has arisen.
*Attending*: here is what I choose to stay with. *Allowance*: I don't have to know what
it is yet.

---

## 8. Cut 4 — lineage, branches, sources (later, under §7)

**Evolution history.** Ratified Changes become the idea's spine — not conversation
history but **intellectual provenance**:

```
Seed        Consciousness as Awareness → Attending → Allowance
 ↓ Change 1 AAA may describe relational capacities rather than stages
 ↓ Change 2 Freedom may mean increasing conscious participation
 ↓ Change 3 AAA and PEL may operate at different levels
```

Already half-built: `member_idea_blocks` where `block_type = 'change'`, ordered. Needs
a lineage view, nothing more.

**Imported material.** Block `origin` / `participants` / `status: source_material`,
collapsed rendering with exchange counts, and operations that never alter the original.
This is the first real test of §7.

**Branches.** Highlight → *Branch*: its own thought stream inside the same idea.
Restrained by default; no node graph until a map becomes useful.

**Sources / lineage.** Wilson, McKenna, McGilchrist, De Jaegher & Di Paolo should not
disappear inside MAIA prose. Invariant: **source influence ≠ author's idea** — the same
provenance discipline being worked out in Writer's Studio, designed correctly here from
the start rather than retrofitted.

---

## 9. Verification owed

`node_modules` is empty in the build environment these cuts were written in, so
**nothing here has been executed**. Status is precise: *implemented and pushed, not yet
verified.* Before stacking further behavioral work:

1. `npm run typecheck` (no-regression gate) and `npx vitest run lib/maia lib/team`.
2. Apply `20260902000001_member_idea_seed_and_title.sql`; confirm the backfill marked
   the expected rows `auto_seed` and **changed no title text**.
3. On a real thread: paste a long entry (>4,000 chars) and confirm nothing is clipped
   and the counter appears; force a save failure and confirm it is visible.
4. Ask MAIA three times with no stance on a live thread and confirm the third response
   does not re-ask a scoping question.
5. Ask with **Stay with this** on the consciousness thread — the case-study control.

---

## 10. Sequencing

1. ~~Cut 0 — defects~~ implemented 2026-09-02, unverified
2. ~~Cut 1 — seed / name separation~~ implemented 2026-09-02, unverified
3. ~~Cut 2 — relational stances~~ implemented 2026-09-02, unverified
4. **Verify (§9) → witness (§5) → adjudicate** ← current position
5. Cut 3 — Current Understanding, three fields only, field set chosen by the witness,
   *if* use earns it. **NOT AUTHORIZED** until the felt moment in §5 arrives.
6. Cut 4 — imported material, lineage view, branches, sources — under the §7 doctrine

Nothing in step 5 or 6 begins on the strength of this document. The document records
what was decided and what remains open; the next authorization comes from use.
