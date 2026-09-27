---
room: Journal
human_activity: writing — the member putting their own experience into words, and returning to it
surfaces:
  - app/journal/page.tsx
  - app/journal/layout.tsx
  - app/journal/journal-sanctum.module.css
  - app/journal/room/**
  - components/journal/room/**
change_class: experiential
principles:
  - INHABITABLE_ARCHITECTURE — rooms come from human activity, not data models
  - INHABITABLE_ARCHITECTURE visual-grammar law — the member's OWN words are the meaning layer
  - SOULLAB_THEME §3 — accent is never decorative (ember marks one gesture per state)
  - SOULLAB_THEME §4 — variation by function; the field stays continuous
  - MAIA_OATH — no guru stance; MAIA offers reflection, never authority
  - SOULLAB_READABILITY_STANDARD — literary quiet is carried by space, contrast and weight rather than undersized meaningful text
reference_surfaces:
  - docs/design/references/JOURNAL_EXPERIENTIAL_REFERENCE_2026-08-10.md
  - docs/design/references/JOURNAL_SLICE1_IMPLEMENTATION_CONTRACT.md
  - docs/canon/SOULLAB_READABILITY_STANDARD.md
shared_with_house: House token layer (--sl-* field/surface/signal hierarchy) · provenance voice · gesture language in human verbs · quiet ember accent · the Journal marker as room orientation
distinct_to_room: writing is the destination, not a control surface — the room opens on a question rather than an inventory, holds one long readable measure for composing and reading, and lets MAIA enter only after the member has kept something; once invited, MAIA may remain in a continuous but transient conversation until the member chooses to stop
screenshot_desktop: docs/design/contracts/screenshots/journal-room-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/journal-room-mobile.png
experience_verification: 2026-09-26 founder refinement — live localhost:3597 writing-state walk accepted the Journal as traditional + quietly magical, retained paper/book architecture, simplified the center gutter to one faint crease, moved DAY / DREAM beside lived date/time, added optional member-authored place with no automatic location capture, preserved real MAIA-origin question provenance, and kept Dream interpretation post-writing only. Founder explicitly ruled the flow between facets as load-bearing and authorized full implementation. Focused Journal suite 37/37 PASS; type-health 222 vs baseline 239 with no regressions. CUTOVER (2026-08-11) — walked at /journal from a clean worktree branched off trunk, after the room replaced UnifiedJournalView on the canonical member route. Confirmed the paper arrival renders with no old-surface markers; wrote and kept an entry and verified the row persisted; left and returned and found it still present; opened Browse and reached entries, Captures, Sessions and Changes, with Decisions correctly not offered when its source answers 401; confirmed exact literal search; confirmed Reflect returns 200 for an owned entry and 401 without a session; confirmed Return fires a calendar rule and discloses a factual account. Accessibility re-measured on the paper material across all states: zero room-level failures (lowest contrast 5.16, targets >=44px, named heading per state, zero reduced-motion offenders, no overflow at 1280/400/200% text). EARLIER (2026-08-10) — walked all five approved states in a browser at 1280x800 and 375x812 against a live dev server with an authenticated dev session — arrival, writing (typed, kept), reading, MAIA reflection (live /api/journal/reflect response), and return. Verified the anniversary selection rule fired, that `Why this?` discloses the literal rule, that `Write from here` carries MAIA's question as context without seeding the member's text, and that a failed keep preserves the writing. Unauthorized House chrome observed and reported, not silently suppressed.
---

# Journal — Experience Contract

**Canonical route: `/journal`** (cutover 2026-08-11, founder-authorized).
`/journal/room` remains as the route the room was built and walked on;
`/labtools/journal` still serves the legacy UnifiedJournalView, which the cutover
preserves rather than deletes.

**Material: paper.** The room was first built on a navy field. Walked at
`79fd8e911`, that field broke no behaviour but pulled the room toward *screen*
rather than *surface* — and Journal's activity is inscription. Corrected under
founder ruling to a paper expression, scoped to this room only by re-pointing the
House colour variables on each state's `<main>`; the House layer is untouched and
no other surface changed. Contrast was measured rather than inverted: lowest room
ratio 5.16 against the paper field.

**Composition: one spine.** The same walk found three left edges — marker and
doorway at the page margin, content on the centred measure — so the emptiness
read as leftover. The marker, the writing column and the Browse doorway now hang
from one axis. No air was removed.

**Implementation lineage: NEW.** Built from the approved experiential reference; no
prior Journal code lineage was recoverable. This is not a restoration.

## What this room is for

A person putting their own experience into words, and sometimes returning to what
they wrote before. The room exists for the writing — not for managing writing.
Everything else in it is subordinate to that, including MAIA.

## Arrival

> **What would you like to Journal?**

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
| carry | `Keep as a reflection` | explicitly carries this kept Journal entry into Reflections; Journal does not auto-promote itself |
| release | `Let it rest` | the conversation is transient; the member decides when the encounter is complete |
| disclose | `Why this?` | the room can account for itself without a settings page |

## Forbidden here

- dashboard, card grid, or any listing-as-arrival
- search, filters, category tabs, entry counts, streaks, stats
- title ceremony before writing; required taxonomy or evaluative classification before writing
- generic chat-room chrome that displaces the Journal entry: avatars, floating transcript shell, regenerate, conversation-as-destination
- persisted Journal-owned MAIA transcript or automatic memory created merely by talking
- carousels, "Recommended for you", relevance scores

## 2026-09-26 founder refinement — lived entry context + enchanted traditional register

Founder review retained the Journal's approved paper/book architecture and added a narrower ruling about traditional journaling conventions:

- lived date and actual time stay visible at the top of the writing page;
- time-of-day language may accompany the stamp because it situates the entry in lived experience;
- `DAY / DREAM` belongs beside that temporal context before writing begins;
- this does **not** reintroduce classification ceremony: Day is the quiet default and Dream is a traditional notebook convention, not a system taxonomy;
- an optional **Add a place** gesture may record member-authored place provenance in the existing entry metadata; location is never inferred or captured automatically;
- when the member enters through `Write from here`, the page may say **Written from a question with MAIA** and preserve that question as provenance without seeding it into the member's text;
- after a kept Dream, the relational doorway may read **Reflect on this dream with MAIA**;
- the page keeps one faint central crease rather than a double-rule gutter;
- the material register may feel magical as well as traditional — vellum/paper depth, warm brass/ember, restrained watermark, subtle ambient life — but must not become fantasy-themed interface decoration.

This refinement supersedes the earlier reference's placement of Day/Dream classification below the writing. The load-bearing law remains unchanged: **writing is still the destination; no title ceremony, mood picker, tags-before-writing, word count, streak, score, generated interpretation, or productivity framing may stand between the member and the page.**

## 2026-09-27 founder refinement — MAIA may stay in the room

Live founder use exposed a deeper defect in the earlier State 4 law. The one-shot `MAIA NOTICED / MAIA ASKED` response was elegant but relationally too shallow: the member explicitly wanted to continue talking with MAIA and the room gave no way to do so.

**Ruling:** after `Reflect with MAIA`, the member—not the component—decides when the encounter is complete.

The earlier `never a thread / no follow-up turns` rule is superseded. Journal now permits a continuous, in-place MAIA conversation under these constraints:

- the kept Journal entry remains visually and semantically primary;
- MAIA enters only after the member explicitly chooses `Reflect with MAIA`;
- the conversation may continue for as many turns as the member wants;
- Journal routes those turns through MAIA's canonical sovereign cognition (`getMaiaResponse`), not a Journal-specific assistant/provider prompt;
- the current kept entry is re-resolved server-side and enters MAIA through the canonical `journalContextAddendum` seam;
- each open encounter receives an ephemeral encounter identity and runs under Sanctuary posture: content is not written to `conversation_turns`, session history, memory, patterns, or Journal-owned transcript storage merely because the conversation occurred;
- content-free operational metadata (ephemeral session row/turn count and consent posture) may exist so the serving boundary remains auditable;
- MAIA stays attributed and separate from the member's writing;
- `Write from here` is optional and carries only an offered question back into a blank writing surface;
- `Let it rest` ends the transient encounter without altering the kept Journal entry;
- generic chat-room chrome must not displace the paper room.

The relational standard is now: **continuous while together; transient unless the member explicitly carries something out.**

A second distinction is now explicit: **MAIA identity/cognition and persistence posture are separate axes.** Journal may host the same sovereign MAIA while lawfully choosing a transient, Sanctuary-governed encounter rather than a durable conversation thread.

## The two brand tests

**Same house?** Yes. It draws its field, surface and signal from the House token
layer, keeps ember for one gesture per state, and speaks in the same human verbs as
the rest of Soullab. Nothing in it was copied from a neighbouring room's aesthetic.

**Distinct room?** Yes. No other Soullab surface opens on a question with an empty
field beneath it, and no other surface makes writing the destination rather than a
control surface. A member would know this is the Journal without the label.

## Ambient MAIA handle — RULED, 2026-09-06 (was: known deviation)

The golden screenshots showed the room **without** the House's floating MAIA
handle (`components/maia/presence/MaiaPresence.tsx`) because the headless capture
session resolved no member; a signed-in member saw it, contradicting the arrival
state's *MAIA presence: none*. This was left for a founder ruling. It is now ruled.

**Ruling.** *House MAIA availability does not imply an ambient MAIA affordance in
every room.* Journal suppresses the floating handle. Its sole MAIA affordance is
the room-owned `Reflect with MAIA` gesture on a kept entry.

**Scope: throughout `/journal`, not merely on arrival.** The handle broke the room
in both directions:

```text
before Keep  → MAIA appears without the member crossing Journal's threshold
after Keep   → an always-available House conversation would compete with
               Journal's room-owned, thresholded MAIA encounter
```

Once a kept entry exists Journal already has its legitimate MAIA gesture; showing
the House handle there would introduce a second relationship grammar in one room.

**This is not a rejection of MAIA as House infrastructure.** It is the distinction
the presence layer already carries:

```text
Journal may be MAIA-capable  ≠  Journal must advertise the House MAIA handle
```

The room controls the threshold. Journal remains a **governed room** — place facts
still resolve and still travel on a message the member intentionally sends; only
the unprompted advertisement is gone.

**Implementation.** No new suppression mechanism was built, and the concern that
one would refactor shared House infrastructure does not apply. `place.ts` already
separated eligibility from affordance via `handleVisibility`; this ruling added
the value `'none'` to that existing closed vocabulary and set Journal to it.
`FULL_CONVERSATION_ROUTES` was deliberately **not** reused — it means *the page IS
the conversation*, which Journal is not, and overloading it would have made the
registry say something false about this room. Pinned by
`lib/maia/presence/__tests__/place.test.ts`.
