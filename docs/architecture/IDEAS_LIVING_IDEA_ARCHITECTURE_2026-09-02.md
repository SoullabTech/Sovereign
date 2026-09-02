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

**Next threshold**: verification (§9) → experiential witness on a **fresh** Idea (§5) →
architectural adjudication.

**Authorization boundaries, explicit:**
- **Cut 3 — NOT AUTHORIZED.**
- **Cut 4 — NOT AUTHORIZED.** Naming imported-material provenance as a known live
  defect (§5, §8) changes its **evidentiary status, not its authorization status**. A
  defect being real is not permission to fix it in this lane.
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

### Before-state baseline

The 2026-09-02 screenshots are the **before state**, not a Cut 0–2 witness. Confirmed
by the surface itself: the opening reflection still renders as the giant title, the
composer still reads `Ask MAIA / Save`, there are no per-turn stance controls, and
there is no seed/name separation. They are preserved as the comparison baseline.

Two failures they document:

1. **Inferred progression pulling toward product-manager closure.** MAIA recognizes the
   conceptual inquiry and then redirects it toward application — what problem does this
   solve, what difference for helpers, where does someone get stuck — and keeps doing so
   as the member moves into reality tunnels, collective conditioning, free will, and
   degrees of consciousness. This is what Cut 0 and Cut 2 target.
2. **Pasted material treated as the member's position** — see the confound below. This
   is **not** fixed by Cut 0–2.

### One confound the witness must hold apart

In the baseline, material pasted from another conversation is labeled **REFLECTION** and
MAIA responds to it as the member's own — *"you're holding this phenomenology"* — when
the passage entered from elsewhere. **The act of pasting means *bring this into my
field*, not *ratify every sentence as mine*.**

This is a **provenance defect, not a stance defect, and Cut 0–2 does not fix it.** Every
member-authored entry is still a single undifferentiated `note`; nothing in the schema
distinguishes material the member wrote from material they brought in. A stance changes
MAIA's *manner*; it cannot change what the block claims to be.

**Why this matters for the witness:** if MAIA speaks pasted material back as the
member's position during Steps 2–4, that is this defect surfacing, **not** a stance
failure — do not read it as one, and do not tune the stances in response. Record it and
carry it to adjudication.

**Two separate witnesses, on two separate threads** (founder correction, 2026-09-02):

| Thread | What it witnesses |
|---|---|
| The **existing** consciousness thread + screenshots | The **provenance defect**. Preserved as before-state evidence. |
| A **fresh Idea**, current edge of the inquiry written directly in the member's own words | **Cut 0–2**. |

Writing new material *inside the existing thread is not sufficient protection* — it
still inherits the pasted passage through context. `ask-maia` composes from the last 6
member blocks and the last 3 reflections regardless of who authored the source
material, so a new entry in a contaminated thread is read alongside the contamination.
Only a fresh Idea gives Cut 0–2 a clean read.

Keeping the two witnesses separate is what prevents either failure from being mistaken
for the other.

It is also the precise case Invariant 17's *manner, not status* clause was written for:
direction changes how MAIA participates, never what the member is taken to have meant or
agreed to. The fix belongs to §7 — `origin` / `participants` / `status: source_material`
at ingestion — and is the first real test of that doctrine in §8.

---

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
This is the first real test of §7 — and it closes a **known live defect**, not a
hypothetical one: pasted assistant material is currently labeled *Reflection* and spoken
back to the member as their own position (§5, "One confound"). Until this ships, a
member's field and a member's position are the same object in the schema.

**Branches.** Highlight → *Branch*: its own thought stream inside the same idea.
Restrained by default; no node graph until a map becomes useful.

**Sources / lineage.** Wilson, McKenna, McGilchrist, De Jaegher & Di Paolo should not
disappear inside MAIA prose. Invariant: **source influence ≠ author's idea** — the same
provenance discipline being worked out in Writer's Studio, designed correctly here from
the start rather than retrofitted.

---

## 9. Verification owed

### Completed 2026-09-02 (Mac Studio, local dev DB)

**Item 1 — static gates: PASS.**

- `npm run typecheck` — 231 errors vs baseline 239, 8 fixed, 0 new. No regressions.
- Jest, 3 suites, **68 tests passing**.

One correction was required to get here: the two new suites were written against
vitest in a Jest repo (`"test": "jest --config jest.config.js"`), so neither could
load and all 22 of their assertions silently never ran. Fixed in `3085b46` by deleting
the two `vitest` import lines — test harness only, no assertion or source change.
Running the suites under vitest instead produces 47 failures that are **not** code
defects: vitest is an unconfigured devDependency here (no config file, so no globals,
no `@/` alias, and no exclude for the ~46 stale `.claude/worktrees` copies). Jest
supplies all three.

**Item 2 — migration: fixture-verified backfill logic.**

*Not verification against real member data.* `member_ideas` on the dev DB was **empty
(0 rows)**, so applying the migration as-is would have exercised the DDL and left the
backfill — the part carrying the actual judgment — untouched, while reporting all-zero
counts that could be misread as proof. A three-row fixture was inserted first,
reproducing the exact decision boundary, then the **unmodified** migration was applied
twice:

| title | length | first block | expected | result |
|---|---|---|---|---|
| "I want to look at some ideas…" | 86 | title is a literal prefix | `auto_seed` | `auto_seed` ✓ |
| "A completely different heading…" | 86 | not a prefix | `member` | `member` ✓ |
| "Short named idea" | 16 | title is a literal prefix | `member` | `member` ✓ |

- **All three title md5 hashes identical before and after** — the migration changed no
  title text, as designed.
- `seed` and `seed_block_id` populated on **all three**. Seed backfill is not
  length-gated; only `title_source` is. Correct, not a miss.
- **Idempotent replay confirmed**: first run `UPDATE 3` / `UPDATE 1` / `INSERT 0 1`;
  second run `UPDATE 0` / `UPDATE 0` / `INSERT 0 0`, with `IF NOT EXISTS` notices only.
- The `>=60` guard held: the short prefix-matching title was correctly left alone,
  which is the asymmetry recorded in §1a.

Preflight output was partly lost to terminal scroll, but its conditions are proven
retroactively: `schema_migrations` exists (the migration's final `INSERT 0 1`
succeeded) and `members` is non-empty (the fixture insert succeeded).

The `auto_seed` fixture row is retained **only** until the Cut 1 surface is visually
confirmed, then deleted. The experiential witness (§5) uses a separate fresh Idea in
the member's own words — never the fixture.

### Items 3–5 — experiential witness, 2026-09-02. **NOT GREEN.**

**Witnessed runtime: `3085b46`.** Local dev server, port 3007, fresh Idea
`f424f299-9417-4563-ac19-abc54d84f966`, written by the member in their own words — no
pasted material, so the §5 provenance confound does not apply.

Static surfaces (Cut 1 + Cut 2 rendering) confirmed visually on the `auto_seed` fixture:
*Unnamed inquiry* heading, seed line beneath, **Suggest a name**, the **Reflect** /
**Ask MAIA →** split, and all five stance chips. Fixture deleted afterward as required.

#### Result 1 — Cut 0's narrow checkpoint: **PASS**

Turn 3 fired at `close_and_offer` and did what that directive requires: a closure move,
no clarifying question, no new fork, one concrete structural offering. The banned
scoping questions (audience, purpose, problem solved, first useful version) did not
appear in any of the three ordinary turns.

#### Result 2 — ordinary correction path: **FAIL.** Classified A/B/C.

Member wrote: *"I feel like you are arguing with me rather than attempting to understand
me."* MAIA's next response opened **"From that distinction—"**, restating the frame
being objected to, and prescribed a process. No acknowledgement, no repair.

| Layer | Classification |
|---|---|
| **C — Repair is not a capability** | **Primary design failure.** Repair has been reduced to silently changing course. MAIA cannot visibly acknowledge that its participation caused a rupture and then alter that participation. Note `CORRECTION_ADDENDUM` *instructs* against acknowledgement ("No apology preambles, no 'I hear you' openers") — under load, that removed the only repair gesture available. Non-acknowledgement here is compliance, not a miss. |
| **B — Precedence gap** | **Direct Invariant 17 violation.** A recognized correction must outrank inferred progression, not compete with `close_and_offer`. `CORRECTION_ADDENDUM` is appended *after* the stage directive while leaving it at full strength; a chosen stance reduces progression to `PROGRESSION_FLOOR`, a correction does not. |
| **A — Detection gap** | **Architectural weakness, not missing regexes.** `latestBlockHasCorrection()` is ten lexical templates; the member's phrasing matched none. A secret phrasebook makes the member's standing depend on using words the detector happens to recognize. |

Fixing A alone is phrase-by-phrase tuning. Fixing B alone permits silent redirection
without relational repair. **C names the capacity that is actually absent.**

#### Result 3 — Cut 2, *Stay with this*: **NOT EXERCISED**

> **Reclassified 2026-09-02 on decisive evidence.** Initially recorded as a Cut 2 FAIL.
> A subsequent DevTools observation showed the POST to `/api/ideas/[id]/ask-maia`
> returned **201** with a **Request Payload of `{}`, no properties**. The stance was
> therefore never transmitted. **Cut 2 was not exercised.** The exchange below is an
> ordinary `close_and_offer` response, not a failed *Stay with this* response.
> Server-side parsing, stance composition, and stance persistence are **not implicated**
> by this request. The exchange is retained in full because it remains the evidence for
> the reclassification, and because it independently documents `close_and_offer`
> behaviour under load.

Member reflection, verbatim:

> I want you to understand that I am seeking a problem solution set not whatever it is
> you are doing

MAIA response, verbatim:

> You've moved from the relational friction to a structural solution: a designed cadence
> and explicit decision boundaries that let him move at his pace while you protect the
> creative depth where it matters. That's the bridge—not reframing how you experience his
> terseness, but building a container where his speed and your process don't collide
> because you've already named where each operates.
>
> One way this could take shape: map the Now What platform work into phases (discovery,
> ideation, iteration, refinement), then for each phase, name three things—his input
> points (what he decides or directs), your thinking time (what you explore before
> bringing options), and the rhythm (how often you progress, how you take feedback). That
> specificity becomes the shared reference; when he moves fast or dismissively, there's
> already a structure that says "here's where fast is right, here's where we've built in
> time," which removes the interpretation of his style as a personal rejection.

Member clarification afterward, verbatim:

> NO, I was presenting a process to explore ideas around this problem solution set.

The member was presenting material for collaborative exploration — not requesting that
MAIA convert it into an implementation plan.

- **Expected from Stay with this:** depth without displacement.
- **Observed:** MAIA declared that the inquiry had moved to a structural solution, then
  prescribed phases, decision points, and workflow.
- **Verdict: Cut 2 — NOT EXERCISED, blocked by client-side stance transmission failure.**
  The displacement observed above is `close_and_offer` behaviour. A/B/C remain valid and
  separate, classifying the ordinary correction pathway.

**Evidence establishing the reclassification:**

- **Request Payload `{}` with no properties; response 201.** Decisive. The current
  handler is `body: JSON.stringify(stance ? { stance } : {})` — an empty object means the
  new code ran and `stance` was falsy at call time. (The pre-stance handler sent no body
  at all, which would present as no payload rather than `{}`.)
- `metadata->>'stance'` empty on all four `maia_reflection` rows, consistent with the
  above.
- `apiFetch` preserves `options.body` (`{...options, headers, credentials, mode}`).
- The member selected the chip; it cleared after the response. **That clearing proves
  nothing** — `setStance(null)` runs in the `finally` block regardless of whether the
  stance was ever sent.

**Read-only source trace (2026-09-02).** Every link in the client path is sound on
inspection and the loss point is **not provable from source**:

| Link | `app/maia/ideas/[id]/page.tsx` | Status |
|---|---|---|
| state | `const [stance, setStance] = useState<IdeaStance \| null>(null)` | line 212, correct |
| chip click | `onClick={() => setStance(selected ? null : option)}` | line 1185, correct |
| handler read | `body: JSON.stringify(stance ? { stance } : {})` | line 369, correct |
| closure freshness | `useCallback` deps include `stance` | correct — no stale capture |
| button binding | `onClick={handleAskMaia}`, same component, inline | line 1223, correct |
| clear | `setStance(null)` in `finally` | line 392, correct |

Remaining explanations are runtime-only and cannot be distinguished statically: the chip
was not in selected state when Ask was clicked; a stale dev bundle for this component; or
a remount between the two clicks. **Instrumentation authorization is required to proceed;
none has been granted and none has been added.**

**Independent static finding — no receipt for member direction.** Whatever the cause, a
silently dropped stance is **indistinguishable from a working one from the member's
chair**. Selected and unselected chips both carry a ring (`ring-amber-400/40` vs
`ring-white/[0.06]`); the stance clears silently after every turn; and the stance label on
a MAIA block renders only if metadata carries it — so a lost stance also loses its own
evidence. The member's explicit direction can vanish with no signal. This is an
**Invariant 17 concern in its own right**, a sibling of finding A: there, standing
depended on words the detector recognised; here, standing depends on a transmission the
member cannot verify.

- A latent composition defect exists independently and is **not implicated in this
  request**, since no stance reached the server: each
  stance directive supersedes only the base prompt's *"Ideas-mode move list"*, leaving
  its **Progression**, **Closure moves**, **Non-directive offerings**, and **Balance
  rule** sections at full strength. The observed response's *"One way this could take
  shape…"* is a verbatim prescribed Synthesis offering from the base prompt, and
  *"You've moved…"* is from its closure-move family. `PROGRESSION_FLOOR` replaces only
  the computed stage string, not the base prompt's own progression section.

**On the test suite:** the stance test asserts each directive contains the string
*"supersedes the default Ideas-mode move list."* It passes. It verifies the sentence
exists — not that the sentence covers what needs superseding. 68 green tests and this
defect coexist.

#### Witness status

- **Explore and Distill were not run.** The witness stopped at the failed Stay
  condition; later stances cannot rescue it.
- **Cut 0–2 experiential witness: NOT GREEN.** Cut 2 remains **unwitnessed** — not
  failed, not passed.
- **A/B/C and the Result 3 transmission failure are blocking before merge or
  deployment.**
- **No repair authorized.** Nothing has been changed in response to these findings.
- **Cut 3 and Cut 4 remain NOT AUTHORIZED.** Result 3 does not authorize work on Cut 2
  either; diagnosis was authorized, repair was not.

### Still owed

Items 3–5 require the app served locally. Nothing has been deployed.



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
