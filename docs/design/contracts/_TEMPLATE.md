---
# ── Identity ────────────────────────────────────────────────────────────────
room: <RoomName>
human_activity: <the human activity this room serves — writing, conversation, orientation…>

# Surfaces this contract governs. Globs, repo-relative. Support * and **.
surfaces:
  - app/<route>/**
  - components/<room>/**

# "experiential" (default) — the change alters what the member experiences.
# "structural"             — the change is genuinely not experiential (a prop
#                            rename, a type fix, an extracted helper). Requires
#                            structural_rationale; screenshots not required.
change_class: experiential

# ── Governing law ───────────────────────────────────────────────────────────
# Which existing Soullab principles apply. Cite the canon, do not restate it.
principles:
  - <e.g. INHABITABLE_ARCHITECTURE — objects do not equal rooms>
  - <e.g. SOULLAB_THEME §3 — accent is never decorative>

# Approved reference surfaces consulted. Name real artifacts, not vibes.
reference_surfaces:
  - <e.g. docs/design/author-studio/phase-b/writing-surface.html>

# ── The House / Room split ──────────────────────────────────────────────────
shared_with_house: <what this deliberately holds in common — field hierarchy, provenance voice, gesture language>
distinct_to_room: <what stays particular to this room, and why the member should feel it>

# ── Evidence (required when change_class: experiential) ─────────────────────
screenshot_desktop: docs/design/contracts/screenshots/<room>-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/<room>-mobile.png
experience_verification: <how it was checked as lived experience — the walk you took, what you looked for, what you saw>

# ── Only if departing from canon ────────────────────────────────────────────
# deviation: <what departs from the canon>
# authority: <the ruling or founder decision that permits it — required with deviation>

# ── Only if change_class: structural ────────────────────────────────────────
# structural_rationale: <why this change does not alter member experience>
---

# <RoomName> — Experience Contract

## What this room is for

<One paragraph. The human activity, not the data model. If you cannot write this
without naming a database table, the room is not yet understood.>

## Arrival

> **<the arrival line the member actually meets>**

<Where am I · what is this place for · what is here now · where can I begin.>

## Gestures

| Gesture | Language used | Why this wording |
|---|---|---|
| <primary> | <e.g. "Begin writing"> | <human, not "Create"> |

## Forbidden here

- <e.g. dashboard grid>
- <e.g. card-per-entity listing>
- <e.g. AI-forward framing>

## The two brand tests

**Same house?** <answer, against the reference surfaces named above>

**Distinct room?** <answer — could a member tell this from Journal without a label?>
