---
# Exists because the design-canon gate requires a contract to cover a
# member-facing file, and because this change IS experiential: the member
# sees the newest thing MAIA said sit in a different place on the screen.
# Scope is one thing — where a short transcript comes to rest relative to
# the composer, at desktop widths. It defines nothing else about the room.
room: Conversation
human_activity: reading what MAIA just said, and answering it — the turn-taking rhythm of a conversation
surfaces:
  - components/OracleConversation.tsx
change_class: experiential
principles:
  - INHABITABLE_ARCHITECTURE "The law" — the interface is the spatial expression of a human journey; distance between two elements is a statement about their relationship, and 500px of nothing between a reply and the reply box states that they are unrelated
  - INHABITABLE_ARCHITECTURE visual-grammar law (founder, 2026-08-05) — "Design should carry the meaning. Words should only orient." Layout and spatial relationship communicate before language does; here the layout was communicating the wrong thing
  - Founder rule fbf7a7295 (2026-07-23) — "the conversation must never end inside the footer's airspace"; preserved, and now applied where it was meant to apply
reference_surfaces:
  - docs/design/contracts/conversation-room-voice-capture.md — sibling contract on this room; consulted for scope discipline and for the precedent of a narrow, single-mechanism contract
  - docs/design/contracts/conversation-room-mic-lifecycle.md — sibling contract; same scope-discipline precedent
  - __tests__/mobile-bottom-anchor.test.ts — the July acceptance contract this change amends
  - __tests__/transcript-reserve-overflow.test.ts — the conditional-reserve acceptance contract this change extends to desktop
  - commit fbf7a7295 (2026-07-23) — the founder reserve rule being preserved
  - the 2026-07-28 mobile reading-window fix recorded in OracleConversation.tsx — the proven mechanism this change extends rather than reinvents
shared_with_house: the House's rule that a member's own content is the meaningful layer — MAIA's reply and the member's next turn are one exchange, and the layout must not put a void between them
distinct_to_room: this room's content arrives in turns, so the resting position of the newest turn IS the room's rhythm; in a reading room a wide margin is calm, here it reads as MAIA having finished and left
screenshot_desktop: docs/design/contracts/screenshots/conversation-room-transcript-settling-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/conversation-room-transcript-settling-mobile.png
experience_verification: >
  FIXTURE-SEEDED RENDER OF THE REAL SURFACE, 2026-08-22 — NOT an authenticated
  production member walk, and must never be recorded as one. The real /maia
  route and the real OracleConversation component were driven in headless
  Chrome (puppeteer-core, deviceScaleFactor 2) against a local dev server at
  1440x900 and 390x844. Production code was NOT modified to make this
  possible. Two fixtures were used, both outside the repository: (1) a local
  proxy adding the `x-capacitor-app` header that middleware.ts already honors,
  because no database was available to mint a session cookie; (2) localStorage
  seeded with a two-turn conversation under the component's OWN restore keys
  (`maia_session_id`, `maia_session_date`, `maia_conversation_<sid>`), so the
  transcript was restored by the component's own code path rather than
  injected into the DOM. The member identity is synthetic (DevLocal) and the
  conversation text is invented; no real member data was used or displayed.
  WHAT THIS ESTABLISHES: with the real component, real CSS and the real
  composer, a short two-turn transcript at 1440x900 settles with the newest
  MAIA reply 44px above the end of the transcript field and 57px above the
  fixed control region, reserve resolving to md:h-8 (32px), no overlap; at
  390x844 the same state measures 36px / 49px with reserve h-6 (24px),
  matching the pre-existing mobile behavior. A CONTROL was run in the same
  harness with the two classes reverted to their previous values: desktop
  measured 190px / 203px with a 240px reserve, so the screenshots demonstrate
  the change rather than merely a pleasant layout. The component file was
  restored and SHA-256 verified identical to the accepted implementation
  afterwards. WHAT THIS DOES NOT ESTABLISH, still owed: behaviour with a real
  authenticated session and DB-backed history; a genuinely long/overflowing
  transcript in the live app (the md:h-60 branch is covered by unit assertion
  and by the replica harness only); real device rendering as opposed to
  Chrome mobile emulation; and any voice-mode interaction, which was switched
  away from via the surface's own "Switch to text mode" control.
---

# Conversation (transcript settling) — Experience Contract

**Scope, stated plainly.** This contract governs one mechanism in one component:
where a short transcript comes to rest inside `components/OracleConversation.tsx`,
the surface `/maia` renders. It is **not** a full room contract for the
Conversation room. Authoring that remains unauthored work, as the two sibling
contracts on this room also record.

## What this room is for

A person saying something to MAIA and reading what she says back — turn after
turn. The activity is conversation, not "message display." The member's
attention moves between two places only: the newest thing MAIA said, and the
place where they answer. Everything the layout does should serve that short
trip.

## What was wrong

A short conversation on a desktop viewport left the newest reply stranded near
the top of the field, with roughly 500px of empty space between it and the
composer (measured 496px at 1440×900, two turns). The member read MAIA's
answer, then had to travel a void to respond to it. The two halves of one
exchange did not look like one exchange.

This was not an oversight. The July 2026 work fixed exactly this defect on
mobile and **deliberately scoped the fix below the `md` breakpoint**, on the
stated premise that top-anchoring "reads fine on a tall desktop viewport." Two
mechanisms carried that carve-out:

- the transcript wrapper reverted to plain block flow on desktop
  (`md:block md:min-h-0`), turning off the bottom-anchor;
- the trailing reserve stayed at `md:h-60` (240px) unconditionally, sized for a
  long thread scrolled to its true end.

The premise did not hold. On desktop the same defect was simply larger, because
there was more viewport for the reply to float away in.

## What changed

The already-proven mechanism now applies at every width, and the governing
distinction becomes **shortness vs. overflow** rather than **mobile vs.
desktop**:

| | Before | After |
|---|---|---|
| Wrapper | `min-h-full flex flex-col justify-end md:block md:min-h-0` | `min-h-full flex flex-col justify-end` |
| Reserve | `h-6 md:h-60` always | `h-6 md:h-60` when overflowing · `h-6 md:h-8` when not |

The founder reserve is **preserved, not weakened**: a genuinely long transcript
still ends with the full `md:h-60` at its natural scroll end, which is the case
the rule was written for. A four-line reply was never that case.

Nothing else moves. The measured `composerClearancePx` geometry, the holoflower
clearance, typography and line spacing, voice behavior, composer positioning,
and mobile behavior are all untouched. No fixed-height viewport arithmetic was
reintroduced.

## Arrival

> **(unchanged — this contract adds no arrival state)**

The member arrives at this room exactly as before. This change is visible only
once MAIA has said something.

## Gestures

| Gesture | Language used | Why this wording |
|---|---|---|
| read the reply | *(unchanged)* | no gesture is added, renamed or removed |
| answer | *(unchanged)* | the composer is untouched; only its distance from the reply changes |

## Forbidden here

- reducing line-height, font size or paragraph spacing to disguise a structural
  gap — the text's own breathing is not the problem and must not pay for it
- fixed-pixel viewport arithmetic (`calc(100vh - Npx)`) reintroduced anywhere in
  this geometry; the clearance is measured from the live composer and must stay
  measured
- letting the transcript end inside the composer's airspace, at any width
- a `md:min-h-*` override returning to the wrapper, which would silently restore
  desktop top-anchoring while every other assertion stayed green

## Preserved here

Long transcripts keep the full founder reserve, ordinary scrolling, and complete
reachability of the earliest message. Mobile keeps the exact spacing the
2026-07-28 reading-window fix established — `h-6` in both branches, unchanged in
every measurement.

## The two brand tests

**Same house?** Yes. It applies the House's own rule — the member's content is
the meaningful layer — and it does so by extending a mechanism this room already
proved, rather than inventing a second way to do the same thing.

**Distinct room?** Yes, and this is the point. In a reading room, generous space
below the last line is calm. In a conversation, it reads as absence — as MAIA
having finished and gone. The resting position of the newest turn is this room's
rhythm, which is why the same spacing that would be correct elsewhere is wrong
here.

## Evidence status

**What the harness established.** A WebKit replica of this exact container
geometry (clearance 132px = 120px composer + `TRANSCRIPT_COMPOSER_GAP_PX` 12),
measuring the gap from the last message to the composer's top edge:

| Case | Before | After |
|---|---|---|
| Desktop 1440×900, short (2 turns) | 496px | **44px** |
| Desktop 1440×900, medium (6 turns) | 288px | **44px** |
| Desktop 1440×900, long (40 turns) | 252px | 252px (unchanged) |
| Desktop 1280×800, short | 252px | **44px** |
| Mobile 390×844 — short / medium / long | 36 / 36 / 36 | 36 / 36 / 36 (identical) |

In every case: no composer overlap, first message reachable at `scrollTop 0`,
long transcripts still scrollable.

**What the real surface established.** The screenshots this contract names were
produced from the real `/maia` route and the real component, with a two-turn
transcript restored through the component's own localStorage path. Measured on
the rendered page:

| | Desktop 1440×900 | Mobile 390×844 |
|---|---|---|
| Reply → transcript end | **44px** | **36px** |
| Reply → control region | **57px** | **49px** |
| Reserve resolved | `md:h-8` → 32px | `h-6` → 24px |
| Overlaps controls | no | no |

**Control.** The same harness was run with both classes reverted to their
previous values: desktop measured **190px / 203px** with a 240px reserve. The
screenshots therefore witness the change, not merely an agreeable layout. The
component was restored afterwards and SHA-256 verified byte-identical to the
accepted implementation.

**What is NOT established, and is owed.** No authenticated production session
was used — see `experience_verification` for the exact fixtures and their
limits. A genuinely long/overflowing transcript was not walked in the live app;
the `md:h-60` branch rests on unit assertion and the replica harness. Mobile
evidence is Chrome emulation at 390×844, not a physical device.
