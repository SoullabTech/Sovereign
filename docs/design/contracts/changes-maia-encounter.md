---
room: Changes — MAIA Encounter
human_activity: Bringing a lived Change into an ongoing conversation with MAIA while keeping the Change itself visible and retaining member control over when its contents enter the conversation.
surfaces:
  - components/maia/changes/ChangeRoom.tsx
  - components/maia/changes/change-room.module.css
change_class: experiential
principles:
  - CHANGES-UX-01 — the lived Change has authority and the Change remains present while conversation deepens
  - CHANGES-UX-02 — the room is continuous and the existing Change object remains primary
  - RELATIONSHIPS-UX-02 — MAIA remains MAIA; use the canonical OracleConversation in contained mode
  - MAIA place-context law — opening a room does not transmit unseen contents; context travels only on an intentional member message
  - MAIA continuity invariant — a stable session id restores the same conversation rather than creating a fresh assistant encounter
reference_surfaces:
  - docs/design/contracts/changes-living-room.md
  - docs/design/contracts/changes-room-live-shell.md
  - docs/architecture/RELATIONSHIPS-UX-01.md
  - docs/architecture/RELATIONSHIPS-UX-02.md
  - components/OracleConversation.tsx
  - lib/maia/presence/place.ts
shared_with_house: one canonical MAIA, contained in-room conversation, explicit context handoff, stable conversation continuity, and facts-only room orientation.
distinct_to_room: the Change stays materially visible beside MAIA. Opening the MAIA chamber does not disclose the Change's content; the member explicitly chooses when to bring the current Change context into the conversation.
screenshot_desktop: docs/design/contracts/screenshots/changes-ux-05-encounter-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/changes-ux-05-encounter-mobile.png
experience_verification: 2026-09-27 authenticated local witness on isolated port 3697 using temporary member-owned Changes. Opening Explore with MAIA mounted the canonical OracleConversation in contained mode and produced zero conversation POSTs. Only the explicit Bring this Change to MAIA gesture produced one conversation POST. The request used stable session id living-change-<change uuid>, contained the exact member-authored Change title and description, and carried facts-only place context {placeId:changes, objectType:change, objectId:<uuid>}. Closing and reopening the encounter restored the same local conversation under the stable session key rather than minting a new session. Desktop and mobile encounter captures were made. Mobile witness exposed an important layout defect—the desktop right membrane is hidden below 1050px—so a governed in-field Explore with MAIA doorway was added for mobile/tablet rather than relying on the invisible membrane. Temporary witness records were removed after testing.
---

# CHANGES-UX-05 — MAIA Encounter Inside the Living Change

## Purpose

Open one bounded MAIA relationship inside the Change Room without allowing MAIA to become the room's organizing authority.

The governing experience is:

> **The Change remains present while the conversation deepens.**

MAIA is not a separate destination and not a new Change-specific chatbot.

The canonical `OracleConversation` is mounted directly in contained mode.

## One MAIA

This act creates no:

- new persona;
- new conversation engine;
- new prompt provider;
- new voice stack;
- new memory store;
- new AI endpoint.

It uses the same `OracleConversation` already used elsewhere in the House.

## Explicit encounter threshold

Desktop:

> **Explore with MAIA**

appears in the MAIA edge membrane.

Because the right membrane is intentionally hidden on tablet/mobile, the live witness revealed that the desktop doorway would become unreachable there.

The repair is not to keep the membrane visible.

Instead, the same explicit gesture appears inside the central Change field on narrower layouts.

This preserves:

- one room;
- one gesture;
- responsive composition;
- no duplicate MAIA semantics.

## Change remains visible

When the member enters the MAIA encounter, the center becomes a two-field relation:

### Change field

The Change remains materially present with:

- title;
- description;
- created date;
- most recent kept moment when available;
- context-sharing boundary.

### MAIA field

The canonical conversation mounts beside it.

On narrow screens the two fields stack into one continuous vertical composition.

The member can always return to the Change without navigating away.

## Context custody

Opening the MAIA chamber transmits no Change prose.

This is a hard law.

On open:

- no seeded prompt is created;
- no conversation POST occurs;
- no Change description is silently injected;
- MAIA receives no object contents merely because the chamber is visible.

The room states:

> **Context stays with you until you send it.**

The explicit gesture:

> **Bring this Change to MAIA**

constructs a visible, bounded handoff from material the member already authored:

- Change title;
- Change description;
- current intention or emotional-state text when present;
- latest kept moment when present.

The handoff asks MAIA to stay close to the authored material and not decide what the Change means.

This message uses the canonical `injectedMessage` seam, which appends to the running conversation rather than clearing it.

## Why this does not use seedFromSource

The seed-prompt channel intentionally clears prior conversation state before sending a new seed.

That behavior is correct for a fresh “Take to MAIA” transition and wrong for a Living Change relationship.

Changes needs continuity.

Therefore UX-05 deliberately uses:

- stable conversation identity;
- contained `OracleConversation`;
- `injectedMessage` for explicit context carriage.

It does not use `seedMaiaPrompt` or `seedFromSource`.

## Stable conversation identity

Each Change receives the stable session identity:

`living-change-<change uuid>`

This is derived from the durable Change id, not a mount epoch.

The canonical conversation persistence layer therefore restores the same thread on return from:

- closing and reopening the chamber;
- navigation return;
- refresh;
- a later visit with the same member and Change.

This directly supports the long-encounter continuity requirement:

> one MAIA continuing the same Change, not another assistant starting over.

## Place context

The contained conversation receives facts-only place context:

- placeId: `changes`;
- placeName: `Changes`;
- route: `/changes`;
- objectType: `change`;
- objectId: exact Change UUID.

The place contract explicitly tells MAIA that an object is open without revealing its contents.

The Change prose travels only through the explicit context message described above.

## Voice

The canonical conversation remains voice-enabled.

UX-05 introduces no new voice code.

Text is the default visible entry in this first encounter composition, while the existing OracleConversation retains its own governed voice/text capabilities.

## Existing conversation continuity

If the stable session already contains a real conversation, OracleConversation restores it through its existing continuity invariant.

Opening the chamber does not clear history.

Bringing updated Change context later appends to that thread rather than replacing it.

The member can therefore say, in effect:

> this is the same Change, and this is what has changed since we last spoke.

without losing prior turns.

## What MAIA may know

Before explicit context handoff:

- that the member is in Changes;
- that a specific Change object is open;
- no Change prose.

After explicit context handoff:

- only the exact authored material included in that handoff;
- conversation history already held in the stable Change session.

No unseen notes, tags, field-state inference, or hidden source content are added.

## Explicitly unbound

UX-05 does not bind:

- automatic interpretation of the Change;
- Council consultation;
- automatic pattern synthesis;
- automatic Change classification;
- background context refresh;
- hidden observation of room behavior;
- re-casting I Ching;
- changing status;
- saving MAIA conclusions back into the Change;
- automatic memory promotion.

## Witness findings

The witness proved:

1. opening MAIA caused **0** conversation POSTs;
2. explicit context handoff caused **1** conversation POST;
3. the POST used the exact stable session id `living-change-<uuid>`;
4. the request contained the exact member-authored Change title and description;
5. place context identified Changes and the exact Change object;
6. closing and reopening reused the same local conversation store;
7. mobile required a central MAIA doorway because the desktop membrane correctly disappears at narrower widths.

That seventh point is an experiential finding, not a cosmetic fix.

A hidden affordance is not a responsive version of an affordance.

## Exact stop

CHANGES-UX-05 stops with:

- canonical MAIA mounted inside the Change;
- the Change continuously visible;
- explicit context consent;
- stable Change-specific conversation continuity;
- desktop and mobile access;
- existing voice capability preserved.

No Pattern cognition is opened.

The next clean boundary is:

> **CHANGES-UX-06 — TEMPORAL PATTERN VIEW AS MEMBER-GROUNDED EVIDENCE ONLY**

That act should work only from the Change's existing member-authored moments and should distinguish observation from hypothesis before any MAIA synthesis is allowed.
