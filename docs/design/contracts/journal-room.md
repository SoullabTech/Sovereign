---
room: Journal
human_activity: writing — the member putting their own experience into words, and returning to it
surfaces:
  - app/journal/room/**
  - components/journal/room/**
change_class: experiential
principles:
  - INHABITABLE_ARCHITECTURE — rooms come from human activity, not data models
  - INHABITABLE_ARCHITECTURE visual-grammar law — the member's OWN words are the meaning layer
  - SOULLAB_THEME §3 — accent is never decorative (ember marks one gesture per state)
  - SOULLAB_THEME §4 — variation by function; the field stays continuous
  - MAIA_OATH — no guru stance; MAIA offers reflection, never authority
reference_surfaces:
  - docs/design/references/JOURNAL_EXPERIENTIAL_REFERENCE_2026-08-10.md
  - docs/design/references/JOURNAL_SLICE1_IMPLEMENTATION_CONTRACT.md
shared_with_house: House token layer (--sl-* field/surface/signal hierarchy) · provenance voice · gesture language in human verbs · quiet ember accent · the Journal marker as room orientation
distinct_to_room: writing is the destination, not a control surface — the room opens on a question rather than an inventory, holds one long readable measure for both composing and reading, and lets MAIA appear only after the member has kept something
screenshot_desktop: docs/design/contracts/screenshots/journal-room-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/journal-room-mobile.png
experience_verification: Walked all five approved states in a browser at 1280x800 and 375x812 against a live dev server with an authenticated dev session — arrival, writing (typed, kept), reading, MAIA reflection (live /api/journal/reflect response), and return. Verified the anniversary selection rule fired, that `Why this?` discloses the literal rule, that `Write from here` carries MAIA's question as context without seeding the member's text, and that a failed keep preserves the writing. Unauthorized House chrome observed and reported, not silently suppressed.
---

# Journal — Experience Contract

**Implementation lineage: NEW.** Built from the approved experiential reference; no
prior Journal code lineage was recoverable. This is not a restoration.

## What this room is for

A person putting their own experience into words, and sometimes returning to what
they wrote before. The room exists for the writing — not for managing writing.
Everything else in it is subordinate to that, including MAIA.

## Arrival

> **What is here today?**

The question is the largest thing in the room, and most of the surface is empty.
There is no inventory to survey on arrival: three gestures, one of which is
tertiary. Nothing counts, filters, or summarises the member back to themselves.

## Gestures

| Gesture | Language used | Why this wording |
|---|---|---|
| primary | `Begin writing` | an invitation to an activity, not `New Entry` |
| secondary | `Or note something` | lower ceremony, same room — not a separate product |
| keep | `Keep this` | the member decides what becomes an entry; not `Save` |
| reflect | `Reflect with MAIA` | a gesture toward relationship, offered only on kept writing |
| release | `Let it go` | the reflection is transient and says so |
| disclose | `Why this?` | the room can account for itself without a settings page |

## Forbidden here

- dashboard, card grid, or any listing-as-arrival
- search, filters, category tabs, entry counts, streaks, stats
- title ceremony before writing; classification before writing
- chat input, message bubbles, avatars, "MAIA is thinking", regenerate
- persisted reflection history
- carousels, "Recommended for you", relevance scores

## The two brand tests

**Same house?** Yes. It draws its field, surface and signal from the House token
layer, keeps ember for one gesture per state, and speaks in the same human verbs as
the rest of Soullab. Nothing in it was copied from a neighbouring room's aesthetic.

**Distinct room?** Yes. No other Soullab surface opens on a question with an empty
field beneath it, and no other surface makes writing the destination rather than a
control surface. A member would know this is the Journal without the label.

## ⚠️ Known deviation from the room's own contract — reported, not resolved

The golden screenshots show the room **without** the House's floating MAIA handle
(`components/maia/presence/MaiaPresence.tsx`) and bug-report button
(`app/layout.tsx`), because the headless capture session did not resolve a member.
**A signed-in member sees both.** The arrival state's specification says MAIA
presence: none.

This is a **House vs Room boundary question, not a Journal bug**: is the ambient MAIA
handle House furniture that legitimately appears in every room, or does the Journal
reference's *"MAIA appears only on a kept entry"* require its absence here? The only
sanctioned suppression list (`FULL_CONVERSATION_ROUTES`) means *"the page IS the
conversation"*, which the Journal is not. Building a new suppression mechanism would
refactor shared House infrastructure, which Work Unit §10 forbids.

Left for a founder ruling. Not silently suppressed, and not silently accepted.
