# Fable 5 / Obsidian / Jarvis Cinematic Lane — Reconciliation

**Date:** 2026-08-28
**Status:** assessment. ⛔ Authorizes no implementation, no new canon, no tooling adoption.
**Occasion:** a proposed architecture — *Obsidian holds design meaning → Fable 5 art-directs →
Claude Code builds → Jarvis orchestrates* — evaluated against what this repository already has.

---

## 0 · The finding in one line

> **The proposal's central recommendation is already built here, and built more strictly than
> proposed. Its one genuinely new contribution is a motion / cinematic grammar, which does not
> exist in canon.**

The proposal argues that settled design philosophy must be *promoted from creative memory into
executable canon inside the codebase*, "so that every coding agent working in Soullab encounters
those rules inside the codebase" and beautifully articulated design philosophy stops
"disappearing between sessions."

That is exactly the diagnosis `docs/design/contracts/README.md` already makes, and it went
further than documentation:

| Proposal says to create | Already exists | Enforcement |
|---|---|---|
| `/design/constitution.md` | `docs/canon/INHABITABLE_ARCHITECTURE_STANDARD.md` | cited by gate |
| design tokens / palette law | `docs/canon/SOULLAB_THEME.md` | cited by gate |
| per-experience briefs | `docs/design/contracts/*.md` (9 live contracts) | **blocking** |
| "agents encounter the rules" | `scripts/check-design-canon.ts` | `.githooks/pre-commit` + `npm run preflight` |
| reference libraries | `docs/design/references/`, persona walks, witness records | evidence class |

The repo's own conclusion on this point is load-bearing and worth restating before any new lane
is opened:

> **"More canon would not have fixed this."** A fifth charter would have joined the same
> unenforced shelf. — `docs/design/contracts/README.md`

So the first thing this proposal should *not* produce is another constitution. It should produce
motion grammar, an Experience Contract for a threshold that currently has none, and evidence.

---

## 1 · What is genuinely missing

Measured 2026-08-28 across `docs/canon/` + `docs/design/`:

```
grep -rilE "motion grammar|cinematic" docs/canon docs/design   →   0 files
```

Soullab has law for **composition, orientation, palette, room identity and containment**. It has
**no law for movement**. Every claim in the proposal about scroll-as-time, depth-as-hierarchy,
light-as-attention, and "motion should indicate transformation, not exist because animation is
available" lands in that vacuum.

This is the real gap, and it is the one the proposal is right about. It is also the gap most
likely to be filled badly by an unbounded generative pass — which is why it should be filled as
**canon first, then a single bounded surface**, not by shipping three cinematic interpretations
and back-forming principles from whichever one looked best.

---

## 2 · Where the proposal collides with standing law

### 2.1 "Let the environment establish itself before asking for information"

Cited in the proposal's `Signup Arrival.md` brief. Read against
`INHABITABLE_ARCHITECTURE_STANDARD.md`, this is a description of **failure mode 2, The Fog**:

> *Metaphor replaces navigation · poetic language replaces action · the user does not know what
> happens next.* — *"This is beautiful, but what do I do?"*

The governing sentence is symmetric and non-negotiable:

> **Never sacrifice orientation for atmosphere. Never sacrifice atmosphere for inventory.**

A cinematic threshold is permitted. A threshold where a first-time member cannot tell that this
is where they sign in, or what happens next, is not — however good it looks. Any motion grammar
authored under §1 must carry an explicit orientation floor, and the Fog is the named failure it
is written against.

### 2.2 "Give Fable considerable creative latitude … three radically different interpretations"

Latitude is fine **in exploration**, and free: HTML mockups under `docs/design/<area>/` are out of
the design-canon gate's scope (`^(app|components)/.*\.tsx$`). The precedent already exists —
`docs/design/author-studio/phase-b/*.html`, `author-studio/mockups/*.html`. Explore there at any
volume, at no governance cost.

Latitude is **not** fine at adoption. The moment an interpretation lands in `app/` or
`components/`, it owes a contract with room, human activity, cited principles, named reference
surfaces, House/Room split, desktop **and** mobile evidence on disk, and a recorded experiential
verification. That is a ratchet, not a formality, and it is what stops a strong single render
from becoming an unaccountable house style.

### 2.3 The proposed first experiment is currently ungated *and* uncovered

Contract coverage as of this date: `astrology`, `conversation-room-mic-lifecycle`,
`conversation-room-voice-capture`, `house-return`, `journal-room`, `journey`, `settings`,
`studio-home`, `voice-diagnostic-visibility`.

**There is no contract for the arrival / sign-in / onboarding threshold** — the exact surface the
proposal nominates as the first experiment. So the first deliverable of this lane is not a Fable
prompt. It is `docs/design/contracts/arrival-threshold.md`, scoped narrowly on the
`house-return.md` precedent (explicit `surfaces:` globs, no silent widening to adjacent rooms).

Onboarding is also the one flow CLAUDE.md fixes as **one-time per member, no shortcuts, strict
sequence** (`/begin → /intro-maia → /intro-daimon → /test-elemental → /faq → /onboarding → /maia`).
A cinematic pass there is presentation-only by construction: sequence, completion flags
(`members.onboarded`, `localStorage.beta_user.onboarded`), auth and recovery are preservation
boundaries, not design surface.

---

## 3 · On Obsidian as the design memory tier

**Recommendation: no second source of design truth.**

The proposal's own strongest argument defeats its weakest one. If the reason to write design
philosophy down is that *agents must encounter it where they work*, then design memory that lives
outside the repo is memory the gate cannot check, the pre-commit hook cannot enforce, and a fresh
Claude session will not read. That is precisely the failure the Experience Contract ratchet was
built to end.

Concretely, `check-design-canon.ts` requires each contract to name **reference surfaces that
resolve** — an Obsidian note is not a citable reference under that gate.

If Obsidian is used, bound it to one role:

```
OBSIDIAN            drafting + inspiration scratch      no authority, never cited
      │
      │  one-way promotion, when a thing is settled
      ▼
docs/design/        creative memory, in repo            citable as reference
      │
      │  ratification
      ▼
docs/canon/         governing law                       cited by the gate
      │
      ▼
docs/design/contracts/   per-surface, blocking          pre-commit
```

Promotion is one-way and manual. Nothing in `docs/canon/` may cite a vault path.

---

## 4 · On Jarvis as the cockpit

`jarvis-desktop/` already exists as the governed founder/operator surface, and per
`docs/ops/MAIA-D00_DESKTOP_CANONICAL_RECONCILIATION_2026-08-25.md` is explicitly **patterns only,
not a base** for member-facing work. Its modules (`governance.js`, `provenance.js`,
`correctness.js`, `legibility.js`) are the shape the proposal is reaching for.

Two constraints carry over from the existing Jarvis epistemic guardrails work
(`docs/ops/JARVIS_EPISTEMIC_GUARDRAILS_2026-08-11.md`,
`JARVIS_EPISTEMIC_CI_CLAIM_DELTA_CORRECTION_2026-08-16.md`):

1. **The agent that built the surface does not certify that the surface succeeded.** The
   proposal's own split — functional checks automated, experiential judgment retained by the
   founder — is correct and must not erode into a green checkmark for "cinematic threshold
   achieved."
2. **"Promote this learning" must terminate in a repo commit**, not in a Jarvis-internal store.
   A learning that only Jarvis remembers has the vault problem with extra steps.

Model routing by faculty (design model / reasoning model / coding agent / deterministic tools) is
compatible with everything here and needs no new governance — it changes *who drafts*, not *what
is authorized*.

---

## 5 · Sequenced first move

Smallest path that produces evidence instead of more design deliberation:

1. **Author motion grammar as canon** — `docs/canon/SOULLAB_MOTION_GRAMMAR.md`. Short. Must state:
   what movement is permitted to mean (transformation, depth, relationship, attention); the
   orientation floor from §2.1; the surfaces where cinema is *forbidden* (settings, billing,
   admin, tables — the proposal is right that these should be fast and quiet); and
   `prefers-reduced-motion` as a first-class path, not a fallback.
2. **Write `docs/design/contracts/arrival-threshold.md`** — narrow `surfaces:` globs, preservation
   boundaries named (auth, sequence, completion flags, recovery, mobile, accessibility).
3. **Explore in `docs/design/arrival/*.html`** — as many interpretations as wanted, gate-free.
4. **Adopt exactly one**, into the contracted surfaces only, with desktop + mobile evidence on
   disk and the experiential verification recorded.
5. **Then, and only then**, decide whether the lane earned a permanent place in the architecture.

Steps 1–2 are the prerequisite the proposal skips. Step 4 is the evidence the proposal correctly
says should replace "another 20,000 words of design deliberation."

---

## 6 · Citation gap (recorded, not fixed)

Both `scripts/check-design-canon.ts` and `docs/design/contracts/README.md` cite:

```
docs/design/SOULLAB_EXPERIENCE_LANGUAGE_RECONCILIATION_2026-08-10.md   (§5 M1)
```

**That file does not exist** — not on disk, and not in any commit reachable from `--all`. The
gate it is cited as originating is nonetheless real, wired and enforcing. Recorded here so the
next session does not either hallucinate its contents or conclude the gate is unauthorized. No
canon is authored to close it; that is the founder's call.

---

## 7 · What this document does not authorize

- No adoption of Fable 5, Obsidian, or any external tool as part of the Soullab architecture.
- No new canon (§5.1 is a *proposal for* canon, not canon).
- No changes to `app/` or `components/`.
- No relaxation of `check:design-canon`, and no extension of it into aesthetic regex — the
  README's prohibition on lint-as-taste stands.
- No claim that any cinematic treatment has been evaluated. Nothing has been built or seen.
