---
# ── Identity ────────────────────────────────────────────────────────────────
room: House Return
human_activity: leaving a room — getting back to MAIA from wherever I went

# Deliberately narrow, on the settings.md precedent. This binds the RETURN
# THRESHOLD inside these files and nothing else. It is NOT a contract for
# Anchor, Keeps or the Living Field as rooms: it makes no claim about their
# arrival, composition, gestures, copy or palette, and must never be read as
# authorising any of that. Those three rooms are still owed their own
# Experience Contracts, and widening these globs would silently pretend that
# debt had been paid.
#
# Journal is absent on purpose — it already has docs/design/contracts/journal-room.md,
# which governs its threshold along with the rest of the room.
surfaces:
  - components/navigation/ReturnToMaia.tsx
  - app/maia/anchor/page.tsx
  - app/maia/keep-capture/page.tsx
  - components/maia/living-field/PersonalLivingFieldDashboard.tsx

change_class: experiential

# ── Governing law ───────────────────────────────────────────────────────────
principles:
  - INHABITABLE_ARCHITECTURE — a room is a place, and a place a member can enter must be a place they can leave; the way out is architecture, not a feature
  - INHABITABLE_ARCHITECTURE — every visible element must serve the person's current moment; the way out stays recessive until it is wanted
  - MAIA_SOVEREIGNTY_INVARIANTS — agency first; a member who cannot leave a surface has less of it, whatever the surface offers
  - SOULLAB_THEME §3 — accent is never decorative; this gesture takes no accent, because leaving is not the room's one ember
  - MAIA_OATH — no guru stance; the doorway names where it goes and does not persuade

# Approved reference surfaces consulted. Existing, shipped implementations of
# the same gesture — this follows house practice rather than inventing one.
reference_surfaces:
  - app/maia/ideas/page.tsx — the pre-existing back-to-MAIA gesture in a member room
  - components/account/AccountSettings.tsx — the same return from the utility surface
  - components/maia/MaiaLeftRail.tsx — MAIA at centre, the rail's standing way home
  - lib/navigation/houseDestinations.ts — the registry that declares returnBehavior per destination

# ── The House / Room split ──────────────────────────────────────────────────
shared_with_house: the destination, the accessible name, and the touch floor. One place to go (MAIA), one name for it ("Return to MAIA"), one 44px target — fixed in the component so they cannot drift room by room. The gesture language matches the House label for the centre.
distinct_to_room: the visual register. The rooms do not share a palette — Journal is paper, Living Field is near-black, Keeps is stone-50, Anchor is warm stone — so each room styles the doorway in its own material via className. A member should feel they are leaving THIS room, not meeting a global toolbar.

# ── Evidence ────────────────────────────────────────────────────────────────
screenshot_desktop: docs/design/contracts/screenshots/house-return-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/house-return-mobile.png
experience_verification: >
  Walked 2026-08-17 against a dev server running from the change's own worktree
  (verified by the listener's cwd — the first attempt had silently launched from
  the main checkout, which would have witnessed the wrong tree). Signed OUT, so
  two of four rooms are confirmed and two are not, stated plainly rather than
  averaged. CONFIRMED at 1280x800 and 375x812 on /maia/anchor and
  /maia/keep-capture: exactly one link per room with accessible name "Return to
  MAIA" and href "/maia"; measured bounding box 56.7 x 44 px — the 44px floor is
  met, not approximated; renders recessive against both materials, quieter than
  the heading and the sub-line; no clipping, overlap or layout damage at either
  size; header on Anchor reads "← MAIA │ ANCHOR" and still reads as a room title
  beside a doorway, not as two links. Activating the link navigates to /maia.
  NOT WALKED: /journal and /maia/living-field render only behind a member
  session; their placement is evidenced structurally
  (lib/navigation/__tests__/houseReturn.test.ts) and by the shared component
  behaving correctly in the two rooms above — which is weaker evidence, and is
  recorded as such. An authenticated walk of those two is still owed.
  Console showed no hydration or component errors; only session-related 401s.
---

# House Return — Experience Contract

## What this room is for

This is not a room. It is the doorway every room needs, and it is contracted on
its own because it belongs to no single room and to all of them.

A member reaches Journal, the Living Field, Keeps or Anchor from the House.
Before this, three of those four had no way back to MAIA anywhere in their
component closure, and the fourth had `router.back()` — which does nothing on a
cold start, a deep link, a restored PWA session or a fresh native WebView. The
House registry had declared `returnBehavior: 'back-to-maia'` for all of them the
whole time. The declaration was real; the door was not.

## Arrival

> **← MAIA**

Where am I — still in this room. Where can I go — back to the centre. The
gesture answers only that, and it answers it in the same words in every room, so
the way home is learned once.

## Gestures

| Gesture | Language used | Why this wording |
|---|---|---|
| leave the room | "MAIA" | A doorway is named for where it leads, not for the act of leaving. "Back" names the motion and tells the member nothing; the House already calls the centre MAIA, so the door and the destination agree. |
| (assistive) | "Return to MAIA" | A screen-reader user meets the link without the room around it, so the accessible name carries the full phrase the sighted layout implies. |

## Forbidden here

- `router.back()`, or any return whose behaviour depends on how the member arrived
- an unlabelled arrow — it does not say where it goes
- accent colour — leaving is never the room's one ember
- a persistent global bar, tab strip or breadcrumb trail; this is a doorway in a
  room, not chrome wrapped around the app
- growing this contract's globs to stand in for the room contracts Anchor, Keeps
  and the Living Field are still owed

## The two brand tests

**Same house?** Yes — the destination, the name and the target size are fixed in
one component, and the wording matches the House's own label for the centre.
Against `app/maia/ideas/page.tsx` and `components/account/AccountSettings.tsx`,
this is the gesture those surfaces already made, given one implementation
instead of three.

**Distinct room?** The doorway is deliberately NOT distinct — it should read the
same everywhere, which is what makes it learnable. What stays distinct is its
material: it takes each room's own colour and type scale, so it reads as part of
the paper, the stone or the dark, never as a strip bolted across them.
