---
room: Sound Studio / Listen to someone
human_activity: meeting, with credit and a link back, the people whose music is shared inside the room — noticing who is behind the sound and choosing, by your own press, whether to listen to them where they share their work — without any ranking, counting, or pressure to engage
surfaces:
  - components/listening/PerformerShelf.tsx
  - components/listening/PerformerEmbed.tsx
  - app/listen/SoundStudioNow.tsx
change_class: experiential
principles:
  - INHABITABLE_ARCHITECTURE_STANDARD — the Now view stays one quiet threshold; the new row is an invitation inside it, not another dashboard card, and the shelf is a room-sized place of its own reached by a deliberate step
  - SOULLAB_THEME — one contained field; the row and the shelf take the room's own serif titles, gold small-caps signal and navy field rather than adding a palette
  - MAIA_SOVEREIGNTY_INVARIANTS — no ranking, counts, "popular" or status signals; nothing is learned about, stored on, or inferred from what a member listens to; performers describe themselves and are never relabelled in Soullab's vocabulary (Invariant 14)
  - STEWARDSHIP_MODEL §10 — calm tone; no urgency, scarcity, countdown, "be first" or obligation language, and no "support them" nudge (links read "Where to find more of their work")
  - AUDIO-PLATFORM-01 — member intent starts sound; the platform's own player is pressed by the member; Soullab only ever pauses, never starts or resumes, and yields to MAIA, Reader, Writer and other music through the shared audio lease
  - MARKETING_CLAIM_DISCIPLINE — the row says plainly that the shelf is "In preparation"; it names no performer and promises only credit and a link back, which the design guarantees
reference_surfaces:
  - docs/design/contracts/sound-studio-field.md — the room this lives in; its four-doors Now entrance, its serif/gold hierarchy and its member-controlled audio contract
  - docs/design/contracts/house-room.md — explicit orientation, a quiet threshold and a truthful way back (here, "← Now")
  - docs/design/contracts/sound-field.md — one persistent, member-controlled listening session across the product
shared_with_house: the deep contained navy field, Georgia serif titles at weight 400 in the warm #f3dfbd, gold #d0b785 small-caps labels at .24em, restrained borders, a plain "← Now" return, human-language gestures and progressive disclosure (nothing loads from a platform until the member presses "Play here")
distinct_to_room: the thing shown is other people's work, so credit and a link back come first; there is deliberately no rank, count, recommendation engine or "listening activity" anywhere; while nothing has been approved by a named human signer the row is a non-interactive, dashed "In preparation" note rather than a button, so it cannot be mistaken for something that already exists
screenshot_desktop: docs/design/contracts/screenshots/sound-studio-listen-to-someone-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/sound-studio-listen-to-someone-mobile.png
experience_verification: >
  2026-11-06, static render only — NOT a walk through the authenticated /listen. The real ListenRoom
  (standalone boundary, no persistent provider, next/link stubbed to a plain anchor) and the real
  PerformerShelf were bundled with esbuild and opened in headless Chrome with real device emulation
  (1440×1000 desktop; 390×844 @2x mobile with touch). Looked at: the Now view with the shipped state,
  which is ONLY the dashed "Listen to someone · IN PREPARATION" row (no link, button, image or player),
  at both sizes — the five-item mobile tab bar is unchanged and fully visible, and scrollWidth equalled
  clientWidth at 390 (no horizontal overflow); no page errors and no failed requests. First look found
  the new row's labels cream and its titles sans-serif where the room's are gold small-caps and serif;
  the stylesheet was changed to the room's own values and re-shot. The two *-fixture-* screenshots show
  the shelf view with TWO FICTIONAL performers (names marked "(fixture)") to check the card layout, the
  "In their own words" treatment and the link list; they are NOT shipped — the shipped catalog is empty.
  Separate jsdom behaviour tests (34 passing, listen79–81) check the empty state, hiding, the audio lease,
  pause-on-MAIA, and that nothing is requested from a platform before "Play here". NOT verified:
  an authenticated /listen session; any sound; the real YouTube/Spotify players in a real browser; the
  native iOS shell (the YouTube player is not offered there, by design); a keyboard-only or screen-reader
  pass beyond DOM semantics asserted in jsdom; WebKit/Safari; web fonts beyond the room's Georgia/Inter
  stacks; and founder felt acceptance. Also unchanged and unverified here: the rest of the Now view
  (SoundStudioNow.tsx is not listed in sound-studio-field.md's surfaces — a pre-existing gap for the
  room's owner; this contract governs only the "Listen to someone" row it now hosts).
---

# Sound Studio / Listen to someone — Experience Contract

## What this room is for

Inside the Sound Studio, a small place to notice **who is behind the sound** and to listen to them where
they share their work. Each person is shown by name, with a line in Soullab's own words, and links to
where to find more of their work. Nothing is ranked, counted or recommended, and nothing about what a
member listens to is kept or shown to anyone — not to other members, not to MAIA.

## What the member meets today

Only a quiet, non-interactive note on the Now view: **Listen to someone — In preparation.** Nothing to
press, no name, no player. The shelf itself, its cards and "Play here" exist in the code and are covered
by tests and by the fixture screenshots, but **no performer is approved or shown**: the shipped catalog is
empty, and an entry appears only after a named human signer has approved it and every gate has passed.

## When an entry exists

A card shows the performer's name, Soullab's own words, optionally the performer's introduction in their
own words (under "In their own words"), and "Where to find more of their work". A platform player appears
only after the member presses "Play here" and says what it will load; the member then presses the
platform's own play button. The player is paused — never started or resumed — whenever MAIA speaks, a
Reader or other music starts, or the shared audio lease is unavailable.

## What it must never become

A ranking, a "popular" list, an advertising surface, a place a performer messages members, a record of
what anyone listened to, or a way to put Soullab's words about healing or effect in a musician's mouth.

## Owed before a member sees an entry

An authenticated walk of `/listen` on a fictional member; the real players in Chrome and WebKit; a
keyboard and screen-reader pass; a physical-device and native-shell witness; independent review; counsel
on embedding; and the founder's felt acceptance.
