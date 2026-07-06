# Pilot — One Complete Practitioner Journey

**Status:** design spec · CANDIDATE · uncommitted-hold · 2026-07-05 (Kelly's design)
**Not a build authorization.** Defines the smallest end-to-end pilot and its acceptance test.

## The question the pilot answers

Not *"Can we build a Practitioner Studio?"* but:

> **Can ONE practitioner independently create, steward, deliver, and RETURN to one body of
> work — without engineering assistance?**

One practitioner. One authentic journey. Not ten. Not every feature.

## The single story

```
Invite → Create → Steward → Deliver → Reflect → Return
```

## What is really being validated: STEWARDSHIP, not generation

The pilot is not a technology test. It tests whether someone can **maintain a living body of
work over time.** "Can they generate a document?" is easy. "Can they steward a body of work?"
is the rare, load-bearing question — and the one the whole architecture has been built for.

## Acceptance test (per stage)

1. **Create** — begins a body of work.
   *Success:* understands where to begin · needs no documentation · asks no engineering.
2. **Steward** — continues over multiple sessions.
   *Success:* drafts persist · organization feels obvious · history is understandable.
3. **Deliver** — hands something to a client.
   *Success:* PDF · attestation · appropriate boundaries · **no client account required.**
4. **Reflect** — after delivery, can answer *"What happened?"*
   *Success:* notes · decisions · revisions · next version.
5. **Return** — a week later, reopens the work and can immediately answer **"Where was I?"**
   *This is the continuity test.* If they cannot re-enter their own work effortlessly, the rest
   does not matter.

## The three constitutional questions (the pilot's real spine)

| Question | Testing | Canon it exercises |
|---|---|---|
| Can work **begin**? | **Threshold** | Threshold as Constitutional Pattern |
| Can work **continue**? | **Continuity** | Spiral Continuity Engine |
| Can work **return to the world**? | **Stewardship** | Stewardship Field / Stewardship-as-apex |

Everything else is implementation. If those three feel natural, the architecture is probably
right. **If one feels awkward, that is the platform — not the practitioner — asking for
redesign.** The pilot is therefore a *constitutional* test, not only a product test.

## The sharpest probe: is "a body of work" a real object?

The Return test only passes if **"a body of work" is a genuine, re-enterable object** in the
architecture — not scattered rows. Today Stage 1 stores individual portraits (owner-scoped,
listable). The pilot will reveal whether the *container* — a practitioner's ongoing work with
one subject over time (drafts, sessions, revisions, the arc) — needs to be first-class. That is
the most likely first friction, and it connects to the Relationship / Contribution Field
(a life's work organized around a relationship, not a folder of files).

## Operating principle: this is discovery, not software

The shortest path is **not the one with the fewest features — it is the one that exposes the
first genuine friction in real use, fastest and most honestly.** That friction determines the
next build, not the original roadmap.

Resist, after the first run: dashboards · analytics · notifications · collaboration · AI helpers.
Postpone almost all of it. After every practitioner session, ask only:

- Where did you hesitate?
- Where were you confused?
- What did you expect?
- What disappeared?
- What became obvious?

Those answers are the next sprint. And the deepest one (Kelly, 2026-07-05):

> **At what moment, if any, did you stop thinking about the software and start thinking
> about your client again?**

"Almost immediately" is the strong signal. Any moment the *interface* held their attention is
a redesign candidate — it means the platform, not the work, was in the room.

## The truest metric: invisibility

Success is not "the feature works" — it is **"the developmental loop holds."** The clearest sign
it holds is that the practitioner stops noticing the software. On **Return**, if they think
*"I'm coming back to this person and the work we've been doing together"* rather than *"I'm
reopening an artifact,"* the platform has become invisible and the *relationship* is the
returnable thing. The Return test, the invisibility question, and **Interface Humility** (canon —
MAIA as the least noticeable) are one test seen three ways: *did the software disappear?* It
measures **alignment**, not just friction.

## Choosing the first practitioner (the highest-leverage decision)

Not to validate the design — to expose its first genuine friction. Choose someone who:
- already has an **established practice**,
- gives **candid** feedback and **won't be "nice"** out of investment in the project,
- naturally works in an **ongoing developmental relationship**, not one-off sessions.

The last criterion is load-bearing, not a preference: a one-off practitioner passes Create and
Deliver and never exercises **Return** — the very thing that matters. The filter is "who will
actually test continuity," not "who gives good feedback."

## Definition of done

One real practitioner completes the full cycle, unassisted, and returns a week later without
asking "where was I?" — **without the platform ever becoming the center of attention.**

> The pilot's purpose is **not to prove Soul Portrait works, but to discover whether one
> practitioner can begin, continue, and return to meaningful work without the platform
> becoming the center of attention.**

If that happens, you've learned something fundamental. If it doesn't, you'll know exactly where
the architecture first meets lived practice — the most valuable outcome a first pilot can
produce. **No public commitment before that.**
