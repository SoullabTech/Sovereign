# Scope correction — the Author's Studio is a resident, not the platform

> **Status: CANDIDATE architectural correction — recorded, not ratified.** Renames
> nothing, moves no code, authorizes no build. It corrects a framing error in the
> 2026-07-31 Studio design sequence.

## The correction

**The Author's Studio is not the platform. It is one resident of it.**

> **The platform's purpose: to support people in service to others with every
> environment, instrument, and capability they need to deepen, practice, express, and
> sustain their work.**

Writing is one such practice. So are coaching · teaching · building curricula ·
designing workshops · preparing sessions · reflecting after sessions · research ·
building programs · publishing · speaking · retreats · assessments · running a practice ·
nurturing a community.

**North star, widened:** *the platform supports human practice in service to others.*
The Author's Studio is one beautiful expression of that mission — and a **proving
ground** for primitives every other Studio can inherit.

## The shape — three layers, and they are different in kind

```
AIN Platform
├── Shared Primitives      — capabilities every environment can use
├── Living Works           — the enduring objects of relationship
└── Practice Environments  — ways of entering into relationship with them
```

**The layers are not a hierarchy of containment; they differ in kind.**

- **Platform capabilities** — Capture · Gather · Explicit Insertion · Reflect · Review ·
  Publish · Search · Conversations · Memory · MAIA. These are *instruments you carry
  between environments.*
- **Living Works** — **not capabilities. Enduring relationships.** A Living Work
  persists whether the member is writing, coaching, researching, building a curriculum,
  designing a retreat, creating an assessment, or preparing a keynote. **It is what
  endures while environments change.**
- **Practice Environments** — different ways of *being with* the work. Author Studio:
  *help me write.* Practitioner Studio: *help me prepare.* Vision Studio: *help me
  discover.* Research Studio: *help me investigate.* Session Room: *help me accompany.*
  **None of them owns the work.**

> **Living Works are the enduring objects of relationship. Practice Environments are
> different ways of entering into relationship with them. Platform capabilities support
> both.**

**The platform is not "many Studios." It is one coherent ecology:** Living Works endure ·
Practice Environments are places you visit · capabilities are the instruments you carry
between them · MAIA is a relational participant who may accompany you in any of them,
under the established constitutional constraints. This is why Practitioner Studio,
Vision Studio, Session Room, Personal Field, and Co-Labs belong together **without
collapsing into one interface** — each serves a different mode of practice while staying
connected through shared capabilities and enduring relationships.

*MAIA — present, relationally governed, serving every environment.*

**Capture, Gather, and Integrate do not belong to the Author's Studio.** The gesture is
identical across environments; only the expression differs. A practitioner integrates a
coaching insight into tomorrow's session; an author integrates a paragraph into a
chapter; a teacher integrates an exercise into a course.

**Two different design questions, kept apart:**
- The Author's Studio answers **what does writing require?**
- The platform answers **what does serving others require?**

## This describes what the repo already is

Not a new direction — a corrected description. Practitioner Studio, Vision Studio,
Session Room, Personal Field, and Co-Labs already exist, and
`CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md` already governs *"every developmental
surface"* by name. The framing error was local to the July 31 design sequence, which
reasoned as though the Author's Studio were the whole house.

## Consequence for the authorized slice — one thing only

Explicit Insertion is a **platform primitive discovered in the Author's Studio**, not a
Studio feature. The disciplined response is *not* to build a platform module now — with
one consumer, that is premature generalization and produces the wrong abstraction.
Instead:

1. **Build the slice exactly as scoped**, in place. Scope does not change.
2. **Keep the core function pure** — text in, position in, text out — with no manuscript-,
   Keep-, or press-specific assumptions inside it. Studio-specific wiring stays at the
   call site.
3. **Promote on the second consumer, not the first.** When a second environment needs to
   insert preserved material, the pure function moves to a shared location and both call
   it. Extraction then is cheap; guessing now is not.

This is the proving-ground discipline: **discover the primitive here, promote it when a
second Studio asks for it.**

### Standing architectural heuristic

> **Never promote an abstraction because you can imagine a second use. Promote it
> because you have observed one.**

The evidence discipline, applied to architecture: imagination is not observation. This
is what keeps a platform from becoming a framework in search of problems.

## The north star

> **The platform exists to support people whose work serves other people. Studios are
> specialized environments for particular practices. Shared capabilities support those
> practices without belonging to any one Studio. Living Works are the enduring
> relationships that those practices cultivate.**

## The platform is not being discovered — it is being revealed

Nothing in this design sequence invented the platform. **Every correction took the same
form: *this was already true; we were describing it incorrectly.*** The Author Studio
isn't the platform · Living Works don't belong to it · environments don't own the work ·
shared capabilities aren't Author Studio capabilities · the creative center is the field,
not the manuscript · Studios are different relationships with the same enduring work.

Those are **recognitions, not inventions.** So the governing question changes:

> Not *"what architecture should we create?"* but **"what architecture is already
> implied by what exists?"**

## Three kinds of truth, kept separate

| Kind | What it is | Examples |
| --- | --- | --- |
| **Platform truth** | endures regardless of environment | Living Works · MAIA · shared capabilities · constitutional governance |
| **Environment truth** | unique to one practice; lives inside a Studio | writing · coaching · teaching · retreat design · research · publishing |
| **Practice truth** | what humans do regardless of Studio — **acts, not rooms** | capture · gather · integrate · shape · reflect · express · publish |

## The standing architectural test

> **If the Author Studio disappeared tomorrow, would this capability still make sense?**
> **Yes → platform. No → Author Studio.**

| Capability | Test | Belongs to |
| --- | --- | --- |
| Explicit Insertion | still useful | **platform** |
| Capture | still useful | **platform** |
| Returning (spatial continuity) | still useful — a practitioner returning to a session plan needs it identically | **platform** *(currently implemented press-locally; see note)* |
| Chapter outline | meaningless outside writing | Author Studio |
| Publishing to KDP | meaningless outside writing | Author Studio |
| Session preparation · session timeline | meaningless outside practitioners | Practitioner Studio |

**Note (recognition, no action):** by this test, **Returning is platform truth currently
living at `app/press/manuscript/returningState.ts`** (PR #848). Consistent with *promote
on observed use*, it stays where it is until a second environment needs it — but it is
now correctly classified, so its eventual promotion will be a recognition rather than a
refactor.

## Requires a founder ruling (not assumed)

- Whether **Living Works are the enduring objects of relationship**, with Practice
  Environments as ways of entering relationship with them — this is the *second* pending
  question touching
  `LIVING_WORK_ONTOLOGY_RATIFICATION_INSTRUMENT_2026-07-31.md` (the first being
  Practice-as-an-intermediate-layer). ⚠️ **That instrument remains seated and unamended.**
  If either is adopted, it is re-cut and re-seated as an explicit act.
- Whether the eight named primitives are canonical, or a working list.
- Whether "Practice Environments" is the standing term for the Studio tier.
