---
room: Astrology — MAIA Encounter
human_activity: Bringing selected calculated chart facts into an ongoing conversation with MAIA while the chart remains visible and the member controls exactly when chart context enters the conversation.
surfaces:
  - app/astrology/page.tsx
  - app/astrology/astrology-room.module.css
  - components/OracleConversation.tsx
change_class: experiential
principles:
  - ASTROLOGY-UX-01 — calculated fact, symbolic interpretation and member meaning remain distinct
  - ASTROLOGY-UX-03 — current-sky and interpretive layers are explicitly bounded
  - CHANGES-UX-05 — opening a room does not transmit unseen object contents
  - MAIA_OATH — MAIA reflects through the chart without becoming astrological authority
reference_surfaces:
  - docs/design/contracts/astrology-room-experience-architecture.md
  - docs/design/contracts/astrology-interpretive-composition.md
  - docs/design/contracts/changes-maia-encounter.md
shared_with_house: one canonical MAIA, contained conversation, stable continuity, explicit context handoff, facts-only place context, and member-controlled chart disclosure.
distinct_to_room: Astrology explicitly withholds birth date/time/location and all chart contents on open. The member may choose to bring selected derived chart facts into conversation without granting MAIA ambient access to stored birth data.
screenshot_desktop: docs/design/contracts/screenshots/astrology-ux-04-maia-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/astrology-ux-04-maia-mobile.png
experience_verification: 2026-09-27 authenticated local witness on isolated localhost:3701 using a temporary member with server-owned birth data and a real calculated natal chart. Opening Explore this chart with MAIA mounted the canonical OracleConversation in contained mode and produced zero conversation POSTs. The explicit Bring these chart facts to MAIA gesture produced exactly one conversation POST using stable session id astrology-natal-<member uuid>. The payload contained selected derived facts (Sun, Moon, Ascendant and selected aspect relations) plus an explicit anti-authority instruction, while the member's raw birth date and location were absent. Closing and reopening MAIA produced zero additional conversation POSTs. No member_memory_atoms were created. Desktop and mobile captures passed; temporary member/session were removed.
---

# ASTROLOGY-UX-04 — MAIA Conversation Through the Chart + Explicit Context Custody

## Purpose

Allow MAIA to enter a conversation **through the chart** without turning the chart into ambient prompt context or MAIA into astrological authority.

The governing experience is:

> **the chart remains visible while the conversation deepens**

## One MAIA

Astrology mounts the existing canonical `OracleConversation` in contained mode.

UX-04 creates no:

- new astrology chatbot;
- new persona;
- new conversation endpoint;
- new memory store;
- new voice stack.

## Explicit threshold

The member chooses:

> **Explore this chart with MAIA**

Opening that chamber sends nothing.

The witness verified:

> conversation POSTs after open = **0**

## What stays visible

The Astrology side of the encounter keeps selected calculated facts materially present:

- Sun sign / degree / house;
- Moon sign / degree / house;
- Ascendant sign / degree;
- up to four selected calculated aspect relations with exact orb.

These remain chart facts, not a generated profile.

## Context custody

The chamber states:

> **CONTEXT STAYS WITH YOU UNTIL YOU SEND IT**

and:

> Opening MAIA does not send your chart.

Only the explicit gesture:

> **Bring these chart facts to MAIA**

creates one conversation handoff.

## What the handoff includes

The message contains:

- current chart lens;
- Sun calculated position;
- Moon calculated position;
- Ascendant calculated position;
- selected calculated aspect relations;
- a direct instruction to keep fact distinct from symbolic interpretation;
- a direct instruction to offer possibilities rather than identity claims or predictions;
- a direct request to ask the member what they recognize in lived experience.

## What the handoff deliberately excludes

The explicit chart handoff does **not** contain:

- raw birth date;
- raw birth time;
- birth location;
- latitude / longitude;
- stored birth-data object;
- natal-chart JSON blob;
- generated report prose;
- hidden interpretations;
- current-sky positions unless the member later explicitly discusses them.

## Shared OracleConversation repair

The canonical OracleConversation previously appended `beta_user.birthData` to every outgoing turn whenever that legacy local object existed.

That behavior would have defeated Astrology's explicit chart-context boundary even though the Astrology host itself never supplied raw birth data.

UX-04 therefore adds one backward-compatible host control:

`includeStoredBirthData?: boolean`

Default:

> `true`

So all existing OracleConversation hosts preserve their current behavior.

Astrology explicitly sets:

> `includeStoredBirthData={false}`

This is a host-level custody boundary, not a global removal of astrology personalization.

The witness proved the resulting Astrology POST contained derived chart facts while the raw birth date and location were absent.

## Stable relationship identity

Each member's natal-chart conversation uses:

`astrology-natal-<member uuid>`

This gives one stable Astrology conversation identity instead of a mount-epoch or page-refresh identity.

## One-time context carrier

The injected chart message is a one-time member act.

When the member closes the MAIA encounter, Astrology clears the injection carrier while preserving the stable conversation itself.

Without this repair, remounting the contained conversation could re-send an earlier explicit chart handoff simply because the component remounted.

The witness verified:

> conversation POSTs on reopen = **0**

## Place context

MAIA receives facts-only place context:

- placeId: `astrology`;
- placeName: `Astrology`;
- route: `/astrology`;
- objectType: `natal_chart`;
- objectId: authenticated member id.

Place context tells MAIA where the conversation is happening.

It does not contain chart contents.

## Voice

The existing canonical MAIA voice capability remains available.

No Astrology-specific voice code is introduced.

## Memory boundary

Opening, sharing chart facts, closing and reopening produced:

> member memory atom delta = **0**

UX-04 therefore does not create astrological memory simply because chart context entered a conversation.

## Explicitly unbound

UX-04 does not:

- auto-send the chart;
- send raw birth data;
- write chart interpretations to memory;
- treat MAIA interpretation as member meaning;
- predict outcomes;
- auto-interpret transits;
- save MAIA conclusions into Astrology;
- cross chart material into Journal or Reflections;
- create an Astrology-specific agent.

## Exact stop

> **ASTROLOGY-UX-04 — PASS · CANONICAL MAIA CONVERSATION THROUGH EXPLICIT DERIVED CHART CONTEXT · RAW BIRTH DATA WITHHELD · REOPEN DOES NOT RESEND · STOP**

The next clean boundary is:

> **ASTROLOGY-UX-05 — MEMBER-RATIFIED CHART MEANING + OPTIONAL KEEP TO REFLECTIONS ONLY**

That act should decide whether a member can author what they recognize from chart inquiry and explicitly keep those words as a Reflection, while never storing MAIA's interpretation as the member's meaning.