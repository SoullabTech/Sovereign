---
room: Conversation — Turn Legibility
human_activity: reading what was said — a turn, once spoken, remaining readable

surfaces:
  - components/chat/MessageBubble.tsx
  - components/chat/MaiaBubble.tsx
  - components/chat/ChatMessage.tsx
  - components/chat/ConversationFlow.tsx
  - components/chat/BetaMinimalMirror.tsx

change_class: experiential

principles:
  - SOULLAB_DESIGN_CANON "Don't" — do not use Framer Motion for elements that must be visible on load; avoid `initial={{ opacity: 0 }}` on important content
  - MAIA_OATH — MAIA accompanies the member; her speech is not a decorative surface and may not be contingent on a subsystem indifferent to it
  - INHABITABLE_ARCHITECTURE §5 — remove anything that makes the system visible unnecessarily; a turn that fades in per token makes the renderer visible instead of the words
  - MAIA_SOVEREIGNTY_INVARIANTS — asking the member to work around the system's own design failures is a violation; an unreadable turn asks exactly that

reference_surfaces:
  - docs/design/contracts/conversation-turn-taking.md — who holds the floor; this contract governs whether what was said can be read
  - docs/design/contracts/conversation-room-mic-lifecycle.md — neighboring boundary; physical capture truth stays separate from legibility
  - docs/programme/MOTION-CENSUS-01_FINDING2_WITNESS_2026-09-20.md — the measured non-conformance
  - docs/programme/MOTION-CENSUS-01_FINDING2_REPAIR_2026-09-20.md — the repair of record

shared_with_house: the House's quiet field, restrained motion, truthful state, and the rule that the member remains the subject rather than the interface
distinct_to_room: this is the turn itself as a readable object — the one surface where a failed animation is not a cosmetic defect but a lost sentence, so legibility is guaranteed structurally rather than by the animation succeeding

# ── Evidence — OWED, not claimed ────────────────────────────────────────────
# ⛔ These two fields are deliberately left unfilled. The repair was authored in
# a container with no application dependencies; no one has yet walked this
# surface. Filling them from the author's reasoning rather than from looking
# would be the exact failure this gate exists to prevent — and the standard this
# repository set after the 2026-09-07 voice fix: a fix verified only by its
# author's tests is a claim about code, not about MAIA.
#
screenshot_desktop: docs/design/contracts/screenshots/conversation-turn-legibility-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/conversation-turn-legibility-mobile.png
experience_verification: <the walk taken on /maia, what was looked for, what was seen>
---

# Conversation — Turn Legibility — Experience Contract

## What this room is for

Reading what was said. Not composing a turn, not holding the floor, not capturing
speech — those are neighboring contracts. This one governs the narrowest and most
load-bearing thing a conversation surface does: **once MAIA has spoken, her words
are there to be read, and stay there.**

## Arrival

There is no arrival line. This contract governs an object the member meets inside
a room they have already entered — the turn itself. Its whole claim is that the
member should never have to notice it.

## The law

> **MAIA's turn must be readable without an animation having completed.**

`initial={{ opacity: 0 }}` on a motion element *sets* inline `opacity: 0` and
relies on the animation engine to drive it to 1. If that never happens the words
are present in the DOM and cannot be read. The member sees silence and has no way
to know a sentence exists.

The repair inverts the failure. Entrance fading moved to a CSS keyframe
(`.maia-turn-enter`, `app/globals.css`) whose **resting opacity is 1**; the
animation only borrows 0 for its own duration. An animation that never runs, is
unsupported, or is switched off leaves the turn visible. Same fade, same duration,
opposite failure mode.

Transform stayed on the motion element deliberately: a transform that fails to run
leaves the element at its natural position, which is visible. **Only opacity was
ever the readability hazard, so only opacity moved.**

## Gestures

| Gesture | Language used | Why this wording |
|---|---|---|
| a turn appears | — no control, no label | the member reads; the interface does not announce itself |
| a turn streams | text settles in place | streaming is MAIA thinking aloud, not the renderer performing |

## Forbidden here

- `initial={{ opacity: 0 }}`, or any motion prop, on turn **text**
- `animation-fill-mode: backwards` / `both` on `.maia-turn-enter` — either
  reintroduces the invisible resting state the class exists to remove
- keying an animated node on its own streaming content — every token remounts it
  and restarts the fade from invisible
- making legibility conditional on a render preference, a TTS outcome, or any
  subsystem with no stake in whether the turn survives

## Scope kept honest

⚠️ This contract governs turn **text**. The surrounding **chrome** on these and
neighboring surfaces still animates from invisible — `OracleConversation.tsx`
alone retains 15 such instances in scribe and indicator UI, and 492 member-facing
files carry the pattern somewhere. ⛔ None of that is claimed repaired here, and
the green guard must not be read as blanket conformance.

⚠️ `components/chat/BetaMinimalMirror.tsx` currently has **no importers**. It is
governed here so the guard is uniformly green; ⛔ its deletion is not proposed by
this contract.

## The two brand tests

**Same house?** Yes. The fade, its duration and its easing are unchanged on every
surface; what changed is which layer delivers it. Against
`conversation-turn-taking.md` the field reads identically — quiet, unhurried,
nothing announcing itself.

**Distinct room?** This is not a room a member can name, and should not become
one. Its success condition is that nobody ever notices it — the member reads what
MAIA said and never learns that legibility was a question.
