---
name: soullab-design
description: Build or change a member-facing surface in MAIA/Soullab. Use before writing any UI under app/ or components/ that a member will inhabit — a room, a page, a flow, a component, a motion decision. Not a style guide; a constitutional method that moves the Experience Contract questions from commit-time to authoring-time. Also use when auditing an existing surface, or when a design gate or motion guard has gone red.
---

# Soullab Design

Authority: `docs/canon/INHABITABLE_ARCHITECTURE_STANDARD.md` ·
`docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md` · `docs/canon/SOULLAB_THEME.md` ·
`docs/SOULLAB_DESIGN_CANON.md` · `docs/design/contracts/README.md`.

**Read the relevant authority before building. This skill is the execution harness;
the canon is the authority.** Where they disagree, the canon wins and this file is
wrong.

## Why this exists, and what it is not

`npm run check:design-canon` already enforces Experience Contracts. It is a
**ratchet at commit time** — it catches you after the work is done, when changing
your mind is expensive.

This skill asks the same questions **before**. Same law, earlier. That is its
entire value.

⛔ **It is not a taste lint and must never become one.** The contracts README is
explicit: *"There is no 'ivory good, green bad' rule here, and there must never
be one."* Encoding taste as rules would freeze the house style and be
unshippable. **Taste is not enforceable. Having consulted the references and
said what you did is.**

⛔ It does not authorize departures from canon. It cannot widen a gate. It is the
lowest rung of authority in this repository: founder → ratified canon → this.

## Ordering is the philosophy — do not reorder

The default failure is reaching for a generic pattern and decorating it
afterwards. Every step below exists to make that harder.

### 1 · Name the room before naming the component

Not "a settings page" — *what place is this, and what is the human doing here?*
A capability without a home is the first failure mode. If you cannot name the
room and the human activity, **you are not ready to build**, and the contract
will not be writable later either.

### 2 · Check yourself against the three failure modes

From `INHABITABLE_ARCHITECTURE_STANDARD`:

- **The Warehouse** — too much function, no place. Cards, dashboards, office
  forms, metric tiles. ⭐ This is the measured regression: the design gate exists
  because sessions kept producing it.
- **The Fog** — too much symbolism, insufficient orientation. Mystery before the
  member knows where they are.
- **The House** — the goal.

⚠️ **If what you are about to build is a dashboard, stop and say so out loud.**
It may still be right. But law 3 says *the first screen is a threshold, not a
dashboard*, and the 2026-09-20 motion census found unguarded looping motion
concentrated in exactly these surfaces — two independent instruments landing on
the same debt.

### 3 · Consult the reference surfaces, and say which

Named in `SOULLAB_DESIGN_CANON.md`: `/maia/membership` ·
`/maia/community/commons` · `/labtools/journal` (full Soullab aesthetic);
`/oracle` · `/astrology` (hybrid dark).

The contract asks `reference_surfaces`. Fill it from what you actually opened.

### 4 · Only now, build

Shared with the House vs distinct to the Room — decide deliberately, because the
contract asks both.

### 5 · Run the instruments

```bash
npm run check:design-canon                              # the commit gate, early
npx tsx scripts/witness/maia-turn-visibility.ts         # turn readability
npx tsx scripts/witness/motion-census.ts                # motion posture
```

`motion-census.ts --files` ranks unguarded unbounded motion.
`check:design-canon -- --init <Room>` scaffolds a contract.

### 6 · Write the contract, last

`docs/design/contracts/_TEMPLATE.md`. It is the durable artifact — steps 1–4 were
the work, this records it.

## Motion

Motion is the thinnest part of the canon (~20 lines of 481) and the part with a
**measured conformance gap**. State of play as of 2026-09-20, honestly marked:

**LAW — ratified, in the canon's "Don't" list:**
> Do not use Framer Motion for elements that must be visible on load. Avoid
> `initial={{ opacity: 0 }}` on important content.

✅ **CONFORMANT ON TURN TEXT as of 2026-09-20** — `maia-turn-visibility.ts` is
GREEN across all six conversation surfaces. The repair moved **only opacity** to
a fail-open CSS keyframe (`.maia-turn-enter` in `app/globals.css`), keeping each
surface's rise, slide and scale on the motion element. ⚠️ Not deployed and not
member-verified; typecheck and the design gate are owed on a host with
dependencies. `MOTION-CENSUS-01_FINDING2_REPAIR_2026-09-20.md`.

⚠️ **STILL OPEN — the same pattern on CHROME.** 492 member-facing files animate
*something* from invisible; only turn text was repaired. `OracleConversation.tsx`
alone retains 15 such instances in scribe and indicator UI. ⛔ Do not read the
green guard as blanket conformance, and ⛔ do not treat the remaining instances
as precedent for new ones.

**When you need an entrance fade on content, use `.maia-turn-enter`**, not
`initial={{ opacity: 0 }}`. Its resting state is visible, so a failure leaves the
content readable. ⛔ Never give it `animation-fill-mode: backwards/both`.

**CANDIDATE — not ratified, do not cite as authority:**
- *MAIA's turn — content, record, legibility — may not be contingent on any
  subsystem that has no stake in it.* Three instances found (TTS/transcript,
  animation/readability, prompt-builder/memory).
  `MOTION-CENSUS-01_CROSS_LANE_FINDINGS_2026-09-20.md`.

**Practical, pending a founder ruling on whether motion gets law:**
- Content readable without an animation completing. Fade the chrome, not the words.
- Unbounded motion (`repeat: Infinity`, `animate-pulse`, `animate-spin`) needs a
  reason. A spinner during a real wait is honest. A pulsing invitation is a hook.
- `prefers-reduced-motion` is honoured in **1.7%** of member-facing motion files.
  Honour it in what you write.
- Never key an animated node on its own streaming text — every token remounts it
  and restarts the fade from invisible.

## Sovereignty checks — answered, not passed

From `CLAUDE.md`, for anything touching voice, expression, relational tone or
member-facing behaviour:

- Does this increase member agency?
- Does it push life outward into the world?
- Does it reduce the system's psychological centrality over time?
- **Invariant 14** — are we imposing a framework, or translating the member's
  meaning into our vocabulary?

And for anything that increases a capability: what uncertainty does it
introduce, what provenance does it require, what new responsibility does it
create?

⛔ A change that cannot answer these is incomplete work, not a judgement call.

## Two disciplines this repository learned the hard way

**A law written as a mitigation decays.** If a rule's premise could be discharged
by a dependency's patch release — *"framer can cause rendering issues"* — readers
assume it expired. State the premise constitutionally instead: *MAIA's words must
not depend on anything to become readable.* The canon elsewhere already forbids
the mitigation style; the one rule drafted that way is the one that failed 493
times.

**An instrument that finds nothing must say so.** *An instrument can satisfy all
of its remaining questions by forgetting to ask the difficult ones* (FR-14).
*No targets in scope* is a legitimate pass. *Target in scope, detector found
nothing inside it* never is. If you write a guard here, make it fail closed —
the worst motion violation in the tree surfaced only because a detector refused
to score its own silence as success.

## Status

**Internal to Soullab's own build.** ⛔ Not exported, not published, not offered
to partner or third-party builds on the platform. Export is gated on two things:
this build's own conformance (currently RED), and the `COACHING-TEMPLATE-EXTRACTION-01`
freeze on generalized architecture. **Ratified law may eventually travel;
generic architecture may not.**
