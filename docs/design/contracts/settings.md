---
# ── Identity ────────────────────────────────────────────────────────────────
room: Settings
human_activity: Adjusting how MAIA behaves toward you — voice, memory, consent, and what the system may hold on your behalf.

# Surfaces this contract governs. Globs, repo-relative. Support * and **.
surfaces:
  - components/account/AccountSettings.tsx

change_class: structural
structural_rationale: >
  Introduced to establish jurisdiction for an existing member-facing surface
  during a native-chrome occlusion repair. The page already carried
  max(env(safe-area-inset-top), 2rem), but that padding sat on the SCROLLING
  container, so it only held at scroll position 0. Once the member scrolled,
  the header scrolled away and list rows travelled under the transparent iPhone
  status bar — the row "MAIA Settings" was seen colliding with the system
  clock. The header is now sticky with the page background behind it, and the
  inset moved onto the header itself, so the status-bar strip is covered at
  every scroll position and rows disappear beneath the header instead. No
  gesture, no content, no section, no ordering, and no composition changes; the
  member-visible difference is the ABSENCE of a defect. This contract records
  jurisdiction and the repair; it does NOT constitute an experiential walk of
  Settings and does not approve the room's current composition. A walk remains
  owed, and the description below is the minimum honest account of the surface
  rather than a ratified design.

# ── Governing law ───────────────────────────────────────────────────────────
principles:
  - INHABITABLE_ARCHITECTURE — rooms arise from human activity, not data models
  - MAIA_SOVEREIGNTY_INVARIANTS — consent and memory boundaries are the member's to set
  - SOULLAB_THEME — House language and visual hierarchy remain coherent across rooms

reference_surfaces:
  - docs/design/contracts/journal-room.md
  - docs/design/contracts/astrology.md

# ── The House / Room split ──────────────────────────────────────────────────
shared_with_house: quiet field hierarchy · human-language gestures · amber accent on a navy field · MAIA as companion rather than authority
distinct_to_room: this is the one place the member changes the terms of the relationship rather than living inside it. Settings states what is held and lets the member revoke it; every other room assumes those terms and gets out of the way.
---

# Settings — Experience Contract

## What this room is for

Settings is where a member adjusts the terms of their relationship with MAIA —
how it speaks, what it remembers, what it may hold, and what it must forget.
Every other room assumes those terms; this is the only room that changes them.
It is administrative on purpose: the member came here to set something and
leave, not to linger.

## Arrival

> **Settings**

The member arrives knowing what they want to change. The room's job is to make
the relevant section findable in one scan and to get out of the way.

## Gestures

| Gesture | Language used | Why this wording |
|---|---|---|
| Enter a section | "Voice", "Memory & Consent", "Your Data" | Names the thing being governed, not the control type |
| Leave | back arrow → MAIA | Returns to the room the member came from, never a dead end |

## Forbidden here

- Persuasion or retention framing on any consent control
- Reporting a change as saved when it has not reached the member's account
- Burying deletion or revocation below persuasive copy
- **Scrolling content entering the iOS status-bar region.** The header holds
  that strip; rows pass beneath it. Padding a scrolling container does not
  satisfy this — it holds only at scroll position 0, and acceptance for this
  surface is therefore tested SCROLLED, never at rest.

## The two brand tests

**Same house?** Yes — navy field, amber accent, quiet type hierarchy, and the
same human-language labelling used in Journal and Astrology.

**Distinct room?** Yes — it is the only surface addressing the relationship
itself rather than the member's material. A member could tell it from Journal
without a label, because nothing here is theirs to make; it is theirs to set.
