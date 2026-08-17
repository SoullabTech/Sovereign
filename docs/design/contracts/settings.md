---
# ── Identity ────────────────────────────────────────────────────────────────
room: Settings
human_activity: adjusting how MAIA behaves for me, and seeing plainly what is and is not available to me here

# Deliberately narrow. This binds specific surfaces, NOT the account area,
# because the contract exists to hold two named principles — not to describe
# Settings as a room. Widening the glob would silently claim authority over
# composition, navigation and copy that this contract explicitly disclaims.
#
# app/account/settings/page.tsx is bound because the page shell is where the
# second principle actually lives: the shell decides what scrolls, and that
# determines whether the header can protect the status bar at all. Binding it
# claims that one mechanism and nothing else about the page.
surfaces:
  - components/account/AccountSettings.tsx
  - app/account/settings/page.tsx

change_class: structural

# ── Governing law ───────────────────────────────────────────────────────────
principles:
  - INHABITABLE_ARCHITECTURE — every visible element must serve the person's current moment; a control that cannot act is not serving it
  - MAIA_OATH — the system does not imply a capacity it does not have
  - P12 (founder ruling 2026-08-16, scripts/capacitor-patch-routes.sh) — the security boundary wins; the export boundary yields
  - Founder ruling 2026-08-17 — land the honest native Settings behaviour; do not weaken P12, do not make /voice-controller-test native, do not bridge it to Safari
  - SOULLAB_THEME — House language and visual hierarchy remain coherent across rooms

# Approved reference surfaces consulted. Named because they are the artifacts
# this contract was reasoned against, not decoration.
reference_surfaces:
  - scripts/capacitor-patch-routes.sh — the P12 exclusion block and its recorded reasoning
  - lib/mobile/mobileAllowlist.ts — the PHONE_ROUTES entry P12 deliberately left in place
  - __tests__/native-entry-points-reach-shipped-routes.test.ts — the executable form of the first principle
  - docs/design/contracts/journal-room.md
  - docs/design/contracts/astrology.md

# ── The House / Room split ──────────────────────────────────────────────────
shared_with_house: the House's provenance voice — a surface states what is true about itself, including what it cannot do, rather than presenting an affordance and failing silently. The same discipline the System surface follows when it says UNCONFIGURED or NOT PROBED instead of UNKNOWN.
distinct_to_room: Settings is operational rather than contemplative. The member arrives to adjust or to check, not to dwell, so an unavailable capability is named in place and briefly — it does not become a story, an apology, or an invitation to somewhere else.

# ── Only if change_class: structural ────────────────────────────────────────
structural_rationale: >
  TWO structural repairs are recorded here; neither alters what the member can
  do.

  (1) Honest controls. The change removes an inert control and puts a static
  statement where it stood. Nothing the member could previously accomplish
  becomes impossible: the button was rendered only under
  Capacitor.isNativePlatform(), and on that platform tapping it did nothing at
  all, because P12 excludes its destination from the native bundle. No
  capability, navigation, route, or voice behaviour changes. The only delta is
  that the surface stops implying an action it cannot perform.
  Screenshots are not supplied and are not evasion: the affected element renders
  ONLY inside the Capacitor native shell, so no browser walk can show it, and
  the founder ruling of 2026-08-17 states that no iPhone build is required to
  prove an unavailable label. What CAN be witnessed without a device is
  witnessed — see the sabotage-checked gate named above, which fails against the
  pre-fix component and passes against the fixed one.

  (2) Status-bar occlusion. On iPhone, scrolling drove Settings rows under the
  system clock. The page already carried max(env(safe-area-inset-top), 2rem),
  but that padding sat on a scrolling container, so it held only at scroll
  position 0. The header is now sticky with the page background behind it and
  the inset on the header itself; and overflow-y-auto was removed from <main>,
  which had created a scrolling BOX that never scrolled while the document did
  the real scrolling — position:sticky binds to the nearest ancestor with a
  scrolling box, so the header was pinned to a container with scrollTop
  permanently 0 and was inert. Measured on device before and after
  (ios_webkit_debug_proxy): header rect.top −334 → 0, document scrollY 387 in
  both, env inset 53px in both. No gesture, content, section, or ordering
  changes; the member-visible delta is the ABSENCE of a defect.

  Neither repair constitutes an experiential walk of Settings, and this contract
  does not approve the room's current composition. A walk remains owed.
---

# Settings — Experience Contract (narrow)

Authorized by founder ruling 2026-08-17, scoped deliberately to two principles.
**This contract does not redesign Settings** — not its composition, navigation,
copy system, or visual language. It describes the surface as it already is and
binds only what the defects it arose from require.

## The principles this binds

Settings is an operational member control surface.

**1. A visible control must represent a capability that is actually available in
the current platform and context.**

Where a capability is intentionally unavailable:

- do not present a dead actionable control;
- state its unavailable status honestly, or omit it where that is appropriate.

Settings must not weaken authentication, authorization, privacy, or platform
boundaries in order to make a control appear functional.

**2. Member content must never occupy the operating system's status-bar region.**

The protection is a sticky header holding that strip, with the safe-area inset
on the header itself. Rows pass beneath it. Padding a scrolling container does
not satisfy this — it holds only at scroll position 0.

## Why they exist

On iPhone, Settings offered "🧪 Voice Controller Test" and tapping it did
nothing. The control was native-only; its destination is native-excluded by P12,
which found the founder gate (`requireFounder()`, a server-session read)
incompatible with static export and ruled that the security boundary wins.

P12 touched only the build script. An exclusion made in the build layer cannot
see entry points in the UI layer, so the orphan was silent by construction. This
contract, and the gate test it names, are the link between those two layers.

Separately, scrolling Settings on iPhone drove the "MAIA Settings" row under the
system clock. Three source-level repairs produced identical pixels before a
device DOM measurement identified the real owner: a false scroll container on
the page shell. The lesson is recorded as a forbidden below.

## Forbidden here

- a tap target that cannot act
- making a control appear functional by relaxing an auth or platform boundary
- an "open it on the web" affordance for a capability that requires the native
  bridge — a door onto nothing is worse than a door marked shut
- persuasion or retention framing on any consent control
- reporting a change as saved when it has not reached the member's account
- **scrolling content entering the iOS status-bar region.** Acceptance for this
  surface is therefore tested SCROLLED, never at rest — at rest looked correct
  in every broken build.
- **a scrolling box on the page shell that does not actually scroll.**
  `position: sticky` binds to the nearest ancestor with a scrolling box.
  `overflow-y-auto` on `<main>` created such a box while the document did the
  real scrolling, so the header was pinned to a container with `scrollTop`
  permanently 0 and was inert. If a future change makes the shell a scroller, it
  must genuinely be the scroller — otherwise the header silently stops
  protecting anything while still looking correct at rest.

## What this contract does not decide

Whether MAIA should have an on-device Voice Controller diagnostic at all, and
how one would preserve the P12 boundary. P12 names that as a separate design
lane and does not authorize it; neither does this. The capability remains
**intentionally UNMET**.

Nor does it ratify Settings' composition, ordering, or copy. Both repairs are
defect removals; the room's design has not been walked.
