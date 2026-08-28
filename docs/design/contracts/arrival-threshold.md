---
# ── Identity ────────────────────────────────────────────────────────────────
room: Arrival Threshold
human_activity: arriving — crossing from outside Soullab to inside it, and being let in.
#   TWO ENCOUNTERS, NOT ONE. UnifiedAuth.tsx:185 (commit 44b7a52, 2026-08-24) opens
#   /signin on the password phase and /signup on the email phase. First entry and
#   return are different first screens with different door counts, and this contract
#   governs both without asserting they should feel the same — see
#   ARRIVAL-RETURN-TONE-01 in docs/design/arrival/OPEN_FINDINGS.md.

# Deliberately narrow, on the house-return.md precedent. This binds THE FRONT
# DOOR — the one shared auth surface and the two routes that render it — and
# nothing else.
#
# It is NOT a contract for the rooms the member passes through afterwards.
# Excluded on purpose, each still owed its own contract:
#   app/intro/page.tsx                       — the mantra/holoflower introduction
#   components/onboarding/DaimonIntro.tsx    — "I am a Daimon by design"
#   app/test-elemental/**                    — passkey + elemental orientation
#   app/faq/**                               — reference reading, not a threshold
#   app/onboarding/**                        — preferences; a form, not a crossing
# Widening these globs would silently pretend those debts had been paid.
surfaces:
  - components/auth/UnifiedAuth.tsx
  - app/signin/page.tsx
  - app/signup/page.tsx
  - app/begin/page.tsx

change_class: experiential

# ── Governing law ───────────────────────────────────────────────────────────
principles:
  - INHABITABLE_ARCHITECTURE — failure mode 2, The Fog; never sacrifice orientation for atmosphere
  - INHABITABLE_ARCHITECTURE — every capability must have a home; the threshold is a room, not a form
  - SOULLAB_THEME §1 — containment before stimulation
  - SOULLAB_THEME §3 — accent is signal, never decorative
  - SOULLAB_THEME — field hierarchy; Void · Field · Surface · Signal stays continuous across the crossing
  - SOULLAB_MOTION_GRAMMAR §3 — the orientation floor; the primary action is readable at frame one
  - SOULLAB_MOTION_GRAMMAR §4 — Threshold register; one primary cinematic gesture, not two
  - SOULLAB_MOTION_GRAMMAR §5 — reduced motion is a path; the opt-out lives on the shared token

# Approved reference surfaces consulted. Real artifacts, not vibes.
reference_surfaces:
  - components/auth/UnifiedAuth.tsx (the shipped arrival remodel, default-on since 2026-07-22)
  - components/journal/room/tokens.ts (the room-scoped motion token pattern and its measured reduced-motion lesson)
  - docs/design/contracts/house-return.md (narrow-scope precedent)
  - docs/design/arrival/ (exploration treatments A/B/C/D, non-authoritative)
  - docs/design/arrival/OPEN_FINDINGS.md (what this contract deliberately does not settle)
  - docs/design/arrival/DOORS_AND_PHASES_2026-08-28.md (route/phase map and door inventory)

# ── The House / Room split ──────────────────────────────────────────────────
shared_with_house: The Soullab field hierarchy and palette (navy foundation, gold as signal only), the Holoflower as the house mark, the quiet declarative voice, and the gesture language of the rest of the platform. A member who arrives here and later reaches Journal or the Conversation Room should recognise one continuous environment, not a marketing front door bolted to a product.
distinct_to_room: This is the only surface a person meets before they are anyone here — the sole moment with no memory, no continuity and no relationship to draw on. It therefore carries more atmosphere and more stillness than any interior room, and its single cinematic gesture is the crossing itself. No interior room may borrow that gesture; a threshold that happens everywhere stops meaning arrival.

# ── Evidence (required when change_class: experiential) ─────────────────────
# DELIBERATELY UNFILLED. Under the authorized sequence, evidence is owed at
# step 6 (desktop + mobile witness) and acceptance at step 7 — after a
# treatment is chosen, not before. Leaving these as placeholders is the
# ratchet working as designed: the gate will refuse any commit touching the
# surfaces above until the witness exists on disk. See §"Status" below.
screenshot_desktop: <owed at step 6 — docs/design/contracts/screenshots/arrival-threshold-desktop.png>
screenshot_mobile: <owed at step 6 — docs/design/contracts/screenshots/arrival-threshold-mobile.png>
experience_verification: <owed at step 7 — the walk taken, what was looked for, what was seen>
---

# Arrival Threshold — Experience Contract

> **Status: covering, not yet satisfied.** Identity, governing law and the House/Room split are
> authored and binding. Evidence is deliberately absent until steps 6–7 of the authorized
> sequence. Any change to the surfaces above will therefore **fail** `check:design-canon` with
> `missing or placeholder field → screenshot_desktop` until the witness is taken. That failure is
> correct and intended; it is what makes adoption pay for itself.

## What this room is for

A person arrives at Soullab with no history here. This is the one surface that meets them before
they are anyone — before memory, before MAIA, before continuity of any kind. Its human activity
is not *account creation*. It is **being let in**: recognising that this is a place, that it is
for them, and that the way in is plain.

Everything the platform later offers depends on the member believing this is somewhere worth
speaking honestly. That belief is formed here, in a few seconds, largely before a word is read.

## What is already true here

Not virgin territory. An **arrival remodel** shipped and is default-on
(`arrivalSignin`, a kill-switch flag, presentation-only): navy cosmos ground with a plum bloom,
spectrum Holoflower at low glow, Spectral serif on the "Welcome." line, one emailed-code path
forward with biometric as the return and password as recovery. `/signin` and `/signup` were
unified 2026-06-04 so the two doors cannot drift; `/begin` is a deprecated redirect into it.

Any treatment adopted here is therefore a **revision of a considered surface**, not a rescue of a
plain form. It must be argued against what already exists, and it inherits the unification: there
is one front door, and both routes keep rendering the same component.

## Arrival

Two arrivals, because there are two encounters:

| | first entry — `/signup` | return — `/signin` |
|---|---|---|
| first screen | email phase | password phase |
| the line met | **"Welcome."** — Spectral, with the period | **"Welcome"** — plain sans |
| visible ways in | ~3 (Continue · Google · Apple) | 4–5 (Sign in · code · Google · Apple · biometric when available) |

Whether that difference is intended ceremony or accidental composition is
**ARRIVAL-RETURN-TONE-01**, and this contract deliberately does not settle it.

Both must answer, in the first painted frame:

- **Where am I** — Soullab, unmistakably: navy field, Holoflower, the house voice.
- **What is this place for** — enough to be worth entering, without a pitch.
- **What is here now** — the ways in, legible at a glance.
- **Where can I begin** — the first field, present and reachable before anything resolves.

## Gestures

| Gesture | Language used | Why this wording |
|---|---|---|
| primary — enter | "Sign in with an emailed code." | states the mechanism plainly; no mystery about what happens next |
| return | biometric | recognition, not re-authentication — the returning member is known |
| recovery | password · "Forgot your passkey?" | recovery is named as recovery, never dressed as a primary path |
| new member | "New to Soullab? Begin Journey" | an invitation, not a signup CTA |

## Forbidden here

- **A gated introduction.** Nothing the member must watch or wait through before they can act
  (`SOULLAB_MOTION_GRAMMAR §3.3`). Atmosphere waits for them.
- **Orientation deferred for atmosphere** — the Fog. Withholding "this is where you sign in" until
  a sequence resolves fails, however good it looks.
- **Two competing cinematic gestures.** One crossing, one move.
- **Ambient drift** — perpetual float, particles, breathing gradients. Motion here is caused by
  arrival or by the member.
- **Load-bearing motion.** With animation off, the door is still a door.
- **Marketing surface behaviour** — feature grids, testimonials, social proof, logo walls,
  scroll-to-learn-more. This is a threshold, not a landing page.
- **AI-forward framing.** No orb, no mascot, no "powered by", no chat widget. MAIA is not
  introduced here; she is met later.
- **Any change to auth behaviour under cover of presentation.** Sequence, completion flags
  (`members.onboarded`, `localStorage.beta_user.onboarded`), code delivery, biometric, recovery,
  and the `/signin`–`/signup` unification are **preservation boundaries**. Presentation only.

## Open questions this contract does not settle

Registered in [`../arrival/OPEN_FINDINGS.md`](../arrival/OPEN_FINDINGS.md). Each is unresolved by
ruling, not by neglect, and none may be quietly closed by a future session:

| ID | Question | Blocks |
|---|---|---|
| `ARRIVAL-RETURN-TONE-01` | should return carry lighter ceremony than first entry? | any move to normalize the two phases' typography |
| `ARRIVAL-BIOMETRIC-REFLOW-01` | does a control arrive after the page has finished resolving, and move the stack? | any easing decision on the settling gesture |
| `ARRIVAL-AUTH-HIERARCHY-01` | how much auth complexity belongs visibly at the *return* threshold? | any demotion of an existing door |

⛔ In particular: **do not normalize the `/signin` and `/signup` typography to match.** The
asymmetry may be meaningful. It is held, not overlooked.

## The two brand tests

**Same house?** Yes — the field hierarchy, navy foundation, gold-as-signal and Holoflower are the
same ones the interior rooms use. Against `house-return.md` and `journal-room.md`, a member should
read one continuous environment across the crossing.

**Distinct room?** Yes — it should be the *stillest and most atmospheric* surface in Soullab, and
the only one that performs a crossing. If an interior room could be mistaken for this, that room
has borrowed a gesture it is not entitled to.
