---
room: Daily Anchor
human_activity: returning to the actual day and choosing one thread to stay connected to without turning the practice into journaling, self-improvement, or task completion
surfaces:
  - app/maia/anchor/page.tsx
  - app/maia/anchor/history/page.tsx
  - app/maia/anchor/anchor-room.module.css
change_class: experiential
principles:
  - INHABITABLE_ARCHITECTURE_STANDARD — the room serves a human act of daily re-entry rather than exposing a persistence model
  - SOULLAB_THEME — the House field remains continuous while the room takes on a quieter practice register
  - MAIA_OATH — the member's own words remain primary; no streak, score, interpretation, or optimization pressure is added
reference_surfaces:
  - docs/design/contracts/journal-room.md — lived time is part of experience, not database chrome
  - app/house/house.module.css — approved House field depth, typography, and restrained symbolic language
  - components/journal/room/WritingSurface.tsx — writing happens in place and time reads as lived
shared_with_house: warm architectural field, editorial serif hierarchy, quiet rules, explicit return to House, and restrained human-language gestures
distinct_to_room: Daily Anchor is intentionally smaller than Journal. One date, one moment, one prompt, one member-authored thread. It is re-entry, not self-development, and continuity is shown without streaks or completion state.
screenshot_desktop: docs/design/contracts/screenshots/daily-anchor-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/daily-anchor-mobile.png
experience_verification: >
  2026-09-26 founder review on localhost:3597. The prior white form did not communicate why Anchor existed.
  The room was reframed around lived time and the founder explicitly accepted the direction as perfect after the
  day/time grounding was added. The accepted surface leads with the actual day and local moment, presents one
  low-demand prompt, lets a few words be enough, and after save makes the member's words the visual center.
  Yesterday and Earlier remain continuity doorways rather than history-management UI. No Anchor was authored
  or persisted during the design witness. Type health passed with 222 errors versus baseline 239, no regressions.
---

# Daily Anchor — Experience Contract

## What this room is for

Daily Anchor is one small place to re-enter the member's actual day. It does not ask what the day means, what the right priority is, or how well the member is doing. It offers one low-demand question and lets the member choose one thread they want to stay connected to today.

## Arrival

> **Saturday, September 26**
>
> **Tonight · 9:56 PM**

Then one question belonging to this day and moment.

## Gestures

| Gesture | Language used | Why this wording |
|---|---|---|
| keep today's thread | `Keep this with me today` | names continuity, not saving a form |
| return to a held anchor | `Revisit this` | permits change without turning it into version management |
| recent continuity | `Yesterday` | one nearby thread, not a streak |
| wider continuity | `Earlier anchors →` | opens past anchors without implying progress |
| memory consent | `For me only` / `MAIA may remember this with me` | makes ambient-memory authority explicit and human-readable |

## Temporal law

One anchor belongs to one calendar day and one real moment in that day. The interface may truthfully show when it was first held and, if changed later, when it was revisited. Time is lived context, not record-management chrome.

## Forbidden here

- streaks, scores, completion states, badges, or gamification
- productivity framing or intention-setting pressure
- mood pickers or extra questions before the member can write
- system interpretation of what the member should stay connected to
- a large content-management history table
- generic white form or dashboard presentation

## The two brand tests

**Same house?** Yes. Daily Anchor shares the House field, typography, quiet thresholds, and return grammar.

**Distinct room?** Yes. Journal is open expressive writing; Daily Anchor is one bounded act of staying connected to something in the actual day. A member should understand the difference without needing a product explanation.
