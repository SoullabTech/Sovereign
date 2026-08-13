---
# ── Identity ────────────────────────────────────────────────────────────────
room: Threshold
human_activity: arriving — crossing from outside into MAIA, or returning to it

# Scoped deliberately to the OAuth callback only. /begin, /signin and
# /test-elemental almost certainly belong to this same Threshold, but they are
# NOT claimed here: each needs its own walk and its own evidence before this
# contract may govern it. Widening this glob without that walk would be the
# gate passing on surfaces nobody looked at.
surfaces:
  - app/oauth-success/**

change_class: experiential

# ── Governing law ───────────────────────────────────────────────────────────
principles:
  - INHABITABLE_ARCHITECTURE — the House has a threshold, a hearth, rooms and a
    natural path; a threshold is a crossing, not a room, and must not announce
    itself as a separate place (docs/design/INHABITABLE_ARCHITECTURE.md:108,118)
  - SOULLAB_THEME §2 — depth before brightness; light backgrounds are not
    canonical for core sanctuary surfaces
  - SOULLAB_THEME §3 — meaningful accent only; gold/amber is signal, activation
    or selected state, never decoration
  - SOULLAB_THEME §1 — containment before stimulation; visual intensity stays
    low unless signal requires emphasis

# Approved reference surfaces consulted. Named because they were actually read.
reference_surfaces:
  - components/auth/UnifiedAuth.tsx:393 — the field the member is standing in
    immediately before this screen (bg-soullab-core + radial lift)
  - app/globals.css:41-43 — --sl-bg-canvas / -deep / -lift, the canonical field
  - tailwind.config.js:274 — the bg-soullab-core token itself
  - docs/design/contracts/journal-room.md — the one existing contract, read for
    house voice and the shape of an honest evidence section

# ── The House / Room split ──────────────────────────────────────────────────
shared_with_house: Everything that carries identity — the navy canvas
  (bg-soullab-core), the radial lift above the horizon, the Holoflower, amber
  reserved for signal, slate for speech. This surface deliberately holds
  *nothing* of its own that a member could name. That is the point: a threshold
  the member notices is a threshold that failed.
distinct_to_room: Only its brevity and its single line of speech. There is no
  navigation, no object, no gesture and no choice here, because the member did
  not come here to do anything — they are mid-stride between the front door and
  the hearth.

# ── Evidence ────────────────────────────────────────────────────────────────
screenshot_desktop: docs/design/contracts/screenshots/auth-threshold-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/auth-threshold-mobile.png
experience_verification: >
  Walked the surface in a dev preview built from an isolated worktree at
  1280x800 and 390x844, holding the 1.5s router.push open so the settled frame
  could actually be looked at rather than guessed at from a mid-fade capture
  (the first three attempts caught the fade and read misleadingly dim).
  Looked specifically for: whether the field matches the one the member just
  left; whether anything on screen asks for a decision; whether the accent
  reads as status or as decoration. Field matches /signin; nothing asks for a
  decision; the amber mark is the only accent and it reports state. Contrast
  measured rather than eyeballed — slate-300 message, amber-300 mark, red-300
  error text and slate-200 button text against all three canvas stops
  (#0F1D32 / #0A1628 / #060D18) fall between 8.9:1 and 13.5:1, all above AA
  body; the replaced teal-800-on-mint was 6.91:1.
  NOT YET WITNESSED on a real iPhone. The reported defect was a light/mint
  flash seen on iPhone Safari during signin → oauth-success → /maia, and the
  device walk that closes it has not been performed. This contract records a
  verified mechanism and an outstanding experiential acceptance.
---

# Threshold — Experience Contract

## What this room is for

Nothing. That is not evasion — it is the design. This surface exists for the
second and a half in which the member has finished proving who they are and has
not yet arrived at the hearth. The human activity is *crossing*, and the only
honest goal for a crossing is that the member never registers it as a place. If
a member can later describe this screen, it has taken up more of their attention
than it earned.

It is listed here as `room: Threshold` because the schema requires a room and
the canon already names Threshold as a floor-plan element. It should not be read
as a claim that the OAuth callback is a room in its own right.

## Arrival

> **Welcome back! Resuming your journey...**

Where am I — still inside Soullab, on the same navy field I was on a moment ago.
What is this place for — it is not a place; it is the door swinging shut behind
me. What is here now — confirmation that I was recognised. Where can I begin —
nowhere, and nothing asks me to.

## Gestures

| Gesture | Language used | Why this wording |
|---|---|---|
| (none — the surface acts, the member waits) | — | A threshold that asks for a gesture is a room. The only interactive control here appears on failure. |
| recover from failure | "Return to Sign In" | Names the place the member is going back to, not the operation ("Retry", "Dismiss"). |

## Forbidden here

- A field of its own — any background not drawn from `--sl-bg-canvas*`
- Light or mint canvases (SOULLAB_THEME §2)
- Decorative colour; amber appears only as status (SOULLAB_THEME §3)
- Branding, product name, tagline, or anything that reintroduces the member to a
  product they have already entered
- Navigation, menus, settings, or any choice that competes with the crossing
- Progress bars or step counts that make the crossing feel like a procedure

## The two brand tests

**Same house?** Yes, and this is the entire substance of the change. Measured
against `components/auth/UnifiedAuth.tsx:393`, the surface now stands on the same
`bg-soullab-core` canvas with the same radial lift the member was looking at one
frame earlier. Previously it painted its own `linear-gradient(145deg, #f0fdf4 …
#cffafe)` mint-to-teal field with `text-teal-800` and a solid `bg-emerald-500`
mark — a palette that appears nowhere else on the member path and that
contradicts SOULLAB_THEME §2 outright.

**Distinct room?** Deliberately not, and it must never become one. A member
should not be able to tell this from `/signin` except by its brevity and its one
line of text. Distinctiveness here would be a regression, not an improvement.
