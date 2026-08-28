# Soullab Motion Grammar

**Status:** canonical. Governing law for movement on every member-facing Soullab / MAIA surface.
**Authored:** 2026-08-28, under founder authorization of the cinematic lane sequence.
**Scope:** anything that changes over time — transition, reveal, parallax, scroll-driven sequence,
shader, loop, hover, loading state.
**Companion law:** [`INHABITABLE_ARCHITECTURE_STANDARD.md`](./INHABITABLE_ARCHITECTURE_STANDARD.md)
(composition) · [`SOULLAB_THEME.md`](./SOULLAB_THEME.md) (palette, field hierarchy).

> This document exists because Soullab had law for **composition, orientation, palette, room
> identity and containment**, and none for **movement**. Measured 2026-08-28: zero files in
> `docs/canon/` or `docs/design/` matched *"motion grammar"* or *"cinematic"*. Movement was the
> one part of the experience language with no law — so every session improvised it.

---

## 1 · The single question

Before any movement ships, it must answer:

> ### **What does this motion mean?**

Not *"does it look good"*. **Meaning.** If the honest answer is *"it makes the page feel more
alive"*, *"it felt static"*, or *"the library makes it easy"*, the motion does not ship.

`SOULLAB_THEME.md §3` already rules that **accent color is never decorative**. This is the same
law applied to time:

> ### **Movement is never decorative.**

---

## 2 · What movement is permitted to mean

Movement in Soullab may carry exactly four meanings. Anything else is noise wearing an animation.

| Meaning | Movement says | Typical form |
|---|---|---|
| **Transformation** | *something became something else* | threshold crossing, state change, commit |
| **Depth** | *this is behind / beneath / further in* | layered reveal, parallax, elevation change |
| **Relationship** | *these two things are connected* | shared element across a transition, origin-anchored expansion |
| **Attention** | *look here now* | a single quiet emphasis, arriving content |

**The corollary, and the part that gets ignored:** if a surface has nothing to say in those four
registers, **the correct amount of motion is none**. Stillness is a legitimate and frequently
correct design outcome. A still Soullab surface is not an unfinished Soullab surface.

### 2.1 Motion must be caused

Every movement has a cause the member can locate: their gesture, their scroll, their arrival, or
a system event that concerns them. Motion with no locatable cause — ambient drift, idle float,
perpetual loops, decorative particles — is forbidden. It reads as the interface performing at the
member rather than responding to them, which is the opposite of *containment before stimulation*
(`SOULLAB_THEME.md §1`).

---

## 3 · The orientation floor

`INHABITABLE_ARCHITECTURE_STANDARD.md` names three failure modes. Motion is the fastest route
into the second:

> ### 2. The Fog — too much symbolism, insufficient orientation
> *Metaphor replaces navigation · poetic language replaces action · the user does not know what
> happens next.* — *"This is beautiful, but what do I do?"*

The governing sentence is symmetric and non-negotiable:

> **Never sacrifice orientation for atmosphere. Never sacrifice atmosphere for inventory.**

Therefore, the **orientation floor** — binding on every cinematic surface:

1. **From the first painted frame**, before any sequence begins or completes, the member can tell
   *where they are* and *what they can do here*. The primary action is present and readable at
   frame one — not revealed at the end of an introduction.
2. **No motion is load-bearing for comprehension.** If the animation never runs — reduced motion,
   a slow device, a failed shader, a stalled scroll listener — the surface is still complete,
   still oriented, still usable. Motion may *enrich* meaning; it may never be the *only carrier*
   of it.
3. **The member can always get past it.** Any sequence longer than a single gesture is skippable,
   interruptible, or completes on its own without input. Nothing gates the member behind
   choreography.
4. **Motion never delays the primary action.** A person who arrives knowing what they want must be
   able to do it immediately. Atmosphere waits for them; they do not wait for atmosphere.

⛔ **Explicitly ruled out:** *"let the environment establish itself before asking for
information."* As a description of composition — the environment reading as a place rather than a
form — it is welcome. As a description of *sequence* — orientation withheld until an introduction
finishes — it is the Fog, and it does not ship.

---

## 4 · Where cinema does not belong

Movement means transformation. That meaning is spent if everything moves.

| Register | Surfaces | Motion budget |
|---|---|---|
| **Threshold** | arrival, sign-in, onboarding, room entry, session open/close, commit of something meaningful | cinematic — one primary gesture |
| **Dwelling** | conversation, journal, reading, writing, reflection | near-still — arrive/reveal only, nothing that competes with the member's own attention |
| **Instrument** | settings, billing, account, admin, tables, configuration, diagnostics | fast and quiet — state feedback only; **no cinema** |

The Instrument register is not a lesser class of design. It should be **exceptionally elegant,
fast and quiet**. Beauty there is precision, not choreography.

**One primary gesture per surface.** A threshold gets *one* cinematic move that carries its
meaning. Two competing cinematic moves on one surface is animation soup, and neither reads.

---

## 5 · Reduced motion is a path, not a fallback

`prefers-reduced-motion: reduce` is a member telling the system to stop moving. That is a
sovereignty statement, and it is honored completely — not softened, not partially applied.

The rule, and **where it must live**, is settled by measurement already in the tree
(`components/journal/room/tokens.ts`, measured 2026-08-10):

> *"`prefers-reduced-motion: reduce` left the room's transitions running, because the opt-out
> lived on the `motion` token while the gestures used a bare `transition-opacity`. Centralising
> it here is what makes the guarantee hold — a per-element variant is a promise each call site
> can forget to keep."*

Generalized to canon:

1. **The opt-out lives on the shared motion token, never at the call site.** A room defines its
   movement in one module; every gesture composes from it. A bare `transition-*`, a raw framer
   `animate`, or an inline transition in a member-facing surface is a defect — it is a promise
   the call site can forget.
2. **Reduced motion means the end state, immediately.** Not a faster animation. Not a fade
   substituted for a slide. The member arrives at the destination frame with no interpolation.
3. **Reduced motion loses nothing but movement.** By §3.2 the surface is already complete without
   it, so there is no content, no affordance and no orientation to recover.
4. **Scroll-driven sequences degrade to document order.** A scroll-as-time composition under
   reduced motion becomes an ordinary, readable, top-to-bottom page. It never becomes a
   fixed viewport the member cannot advance.

Vestibular safety is part of this: large-field parallax, spin, and rapid scale changes are the
motions most likely to cause harm, and are exactly the ones §2.1 already restricts to a located
cause.

---

## 6 · Register (guidance, not lint)

Stated so sessions stop re-deciding it. Deliberately **not** enforceable by regex — the
[contracts README](../design/contracts/README.md) rules that taste must never be encoded as lint,
and that ruling stands.

- **Arrive and reveal, do not announce.** Opacity and small displacement carry almost everything
  Soullab needs. The room's existing token — `transition-opacity duration-500 ease-out` — is the
  house default, not a Journal peculiarity.
- **Ease out, not in.** Movement decelerates into rest. Soullab settles; it does not launch.
- **Thresholds may be slower than gestures.** A crossing can take its time. A button may not.
- **Nothing bounces, overshoots, or springs past its destination.** Elasticity reads as playful
  product; this is a containing environment.
- **Light behaves as material, not as effect.** Illumination changes may express attention and
  depth (`SOULLAB_THEME` field hierarchy: Void · Field · Surface · Signal). Glow applied to draw
  the eye for its own sake is decoration, and falls to §1.
- **Gold moves last, or not at all.** Accent is signal (`SOULLAB_THEME §3`); animating it
  casually spends the one channel Soullab reserves for meaning.

---

## 7 · Failure modes, named

| Name | What it looks like | Why it fails |
|---|---|---|
| **The Fog** | atmosphere first, orientation later | §3 — the Standard's named failure mode 2 |
| **Animation soup** | several simultaneous unrelated movements | §4 — no single movement can be read |
| **Ambient drift** | perpetual float, idle particles, breathing gradients | §2.1 — motion with no locatable cause |
| **The gated introduction** | the member waits for a sequence to finish | §3.3, §3.4 — choreography ahead of the person |
| **Load-bearing motion** | meaning exists only in the transition | §3.2 — invisible to reduced motion and slow devices |
| **Forgotten opt-out** | reduced motion honored on some elements | §5.1 — the measured 2026-08-10 defect |
| **Instrument cinema** | settings pages that swoop | §4 — spends transformation on billing |

---

## 8 · How this is enforced

Through the existing ratchet, not a new gate. Movement is part of member experience, so it is
already inside the scope of `scripts/check-design-canon.ts`: a member-facing change carries an
Experience Contract, and that contract cites the canon that governs it.

This document is therefore **citable in a contract's `principles:` field**, e.g.
`SOULLAB_MOTION_GRAMMAR §3 — orientation floor`.

⛔ No aesthetic regex is added, and none may be. The contracts README's prohibition on lint-as-taste
governs this canon exactly as it governs palette.

---

## 9 · What this does not authorize

- No implementation. No change to any surface in `app/` or `components/`.
- No adoption of any external tool, model or vault as part of the Soullab architecture.
- No claim that any existing surface complies. This is law going forward; the ratchet applies it
  to surfaces as work touches them, and asks nothing of the rest.
- No relaxation of any existing gate, and no new blocking gate.
