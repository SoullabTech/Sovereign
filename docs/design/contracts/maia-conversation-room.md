---
# ── Identity ────────────────────────────────────────────────────────────────
room: MAIA Conversation
human_activity: talking something through with MAIA, and returning to a thread already begun

# Surfaces this contract governs. Only surfaces this unit actually observed are
# claimed — the ratchet grows coverage with real work, and claiming an unobserved
# surface would assert governance no evidence supports. MaiaPresence shares the
# session-identity module but was NOT walked here and is deliberately unclaimed.
surfaces:
  - app/maia/page.tsx
  - components/OracleConversation.tsx
  - components/maia/MaiaArrivalField.tsx

change_class: experiential

# ── Governing law ───────────────────────────────────────────────────────────
principles:
  - INHABITABLE_ARCHITECTURE — rooms come from human activity, not data models
  - INHABITABLE_ARCHITECTURE — warehouse failure: capabilities disappear until context makes them meaningful
  - INHABITABLE_ARCHITECTURE — adaptation keys on member-authored facts only, never inferred psychological state
  - MAIA_SOVEREIGNTY_INVARIANTS — no attachment capture; relationship serves sovereignty
  - MAIA_OATH — MAIA may not simulate certainty, intimacy, or knowledge it does not have
  - SOULLAB_THEME — House token layer (--sl-*); accent is never decorative

# Approved reference surfaces consulted. No prior design reference exists for this
# room, so the deployed surface itself is the reference, captured below.
reference_surfaces:
  - docs/design/contracts/screenshots/maia-conversation-room-desktop.png
  - docs/design/contracts/screenshots/maia-conversation-room-mobile.png
  - docs/design/contracts/journal-room.md
  - docs/canon/INHABITABLE_ARCHITECTURE_STANDARD.md
  - docs/canon/SOULLAB_THEME.md
  - lib/maia/presence/conversationIdentity.ts

# ── The House / Room split ──────────────────────────────────────────────────
shared_with_house: House token layer (--sl-* field/surface/signal hierarchy) · provenance voice — the member is told where a thing came from and who authored it · gesture language in human verbs · the quiet accent used for orientation rather than emphasis · one canonical session identity shared with every MAIA surface, so no two surfaces mint competing sessions for the same member on the same day
distinct_to_room: this is the only room whose primary object is speech rather than an artifact — nothing here is being composed, filed, or kept by default. The member arrives to be met, not to manage anything. Continuity is the room's material: what MAIA carries in, and what it must not claim to carry, is the substance of the experience rather than a feature of it.

# ── Evidence (required when change_class: experiential) ─────────────────────
screenshot_desktop: docs/design/contracts/screenshots/maia-conversation-room-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/maia-conversation-room-mobile.png
experience_verification: Walked the room on a local dev server at both viewports (1280x800 desktop, 375x812 mobile, reloaded after switching so load-time device gates re-ran) against a local-DB dev fixture member. Looked for arrival state before any gesture, warehouse density, the primary gesture, desktop/mobile divergence beyond scale, console and network errors, and off-canon color. Found: a four-affordance arrival with the rest of the room's capabilities present in the DOM but occluded behind the arrival overlay (not a warehouse); no structural desktop/mobile difference; two competing primary gestures; and a violet glow rendering from raw rgba literals rather than House tokens. Recorded below under "Observed, not settled" and "Known non-conformance". LIMIT OF THIS WALK: the session was seeded at middleware level only, so member-scoped APIs returned 401 and the rendered content is thinner than a fully-authenticated member's. Arrival composition is evidenced; populated-conversation state is NOT.
---

# MAIA Conversation — Experience Contract

## What this room is for

A person comes here to talk something through. Not to file it, not to produce
anything, not to manage a record of themselves — to be met, and to think out loud
with something that remembers enough to be useful and admits what it does not know.
The room's material is continuity: what MAIA carries in from elsewhere, how long it
holds, and what it is forbidden to imply about what it holds.

## Arrival

> **Good evening, <name> — I'm here when you're ready.**

The member meets a greeting, a holoflower, a single consent affordance
("I'm ready"), and a message field. Roughly the lower quarter of the viewport is
empty field. Everything else the room can do — the transcript, continuous
listening, The House, keeping a moment, reporting a bug — exists in the DOM but is
occluded behind the arrival overlay until the member has begun.

That withholding is the room's central design fact and is load-bearing: arrival is
an invitation, not an inventory.

## Session identity and continuity

The one place session identity is minted or restored is
`lib/maia/presence/conversationIdentity.ts` — `maia_session_id` + `maia_session_date`
in localStorage, **rotating daily**. Every MAIA surface reads that module so no two
can mint competing sessions for the same member on the same day. The identity-clear
path in `lib/http/apiBase.ts` removes both keys, so signing out ends the session.

Consequences the member actually experiences, and which this contract binds:

- **A reload does not end the conversation.** Same calendar day, same session.
- **A new day is a new session.** Yesterday's thread does not silently continue.
- **Signing out ends the session.** Nothing session-scoped survives a member change.
- **Anything session-scoped inherits exactly this lifetime.** A capability that
  wants to persist across a turn must stamp itself with this session and this
  member, and must read as absent when either no longer matches. It may not invent
  its own duration.

## Relational context and handoff

A member may hand a specific relationship to MAIA from `/relationships/[id]`. That
is an explicit act and it is the only thing that may start a handoff — nothing in
this room may infer which relationship is in play from conversation content,
recency, or a return path.

While a handoff is active the room shows a return affordance naming the
relationship. That visible claim and the relational context actually travelling
with the request must be the same fact, gated by one predicate:

> **If the interface says a relationship has been taken to MAIA, the request must
> carry that relationship, or the interface must stop saying it.**

Sanctuary suspends a handoff rather than ending it: nothing travels, so nothing is
claimed, and the member's explicit act is restored on exit rather than silently
discarded.

## Gestures

| Gesture | Language used | Why this wording |
|---|---|---|
| begin | "I'm ready" | the member declares readiness; the room does not start on their behalf |
| speak | "Tap to speak" | a bodily act, not "record" or "input" |
| write | "Message MAIA…" | addressed to someone, not entered into a field |
| keep | "Keep this moment" | the member authors what persists; nothing is kept by default |
| return | "Return to <relationship>" | names where they came from, not a back button |

## What MAIA may not imply about continuity

- It may not imply it knows the **present** state of anything it was told earlier.
- It may not present system inference (themes, tensions, patterns) as something the
  member said. Member-authored and system-inferred must be distinguishable.
- It may not recite what it holds back as evidence of intimacy, or diagnose.
- It may not claim continuity that is not in fact travelling with the request.
- Absence of memory is stated plainly, never performed as discretion.

## Forbidden here

- dashboard grid, card-per-entity listing, tabs over data models
- an arrival that displays all capabilities at once
- adaptation keyed on inferred psychological state or activity-derived readiness
- anything kept without a member gesture
- AI-forward framing (model names, "powered by", capability boasting)
- raw hex/rgba color literals in place of House tokens

## The two brand tests

**Same house?** Partly, and this contract records the gap rather than papering it.
The room shares the House's provenance voice, human-verb gestures, quiet accent and
canonical identity. It does **not** yet share the token layer: measured on this
surface, color is emitted as raw literals (see below).

**Distinct room?** Yes. Journal opens on a question and gives the member a long
readable measure to write into; this room opens on a greeting and withholds its
instruments until invited. A member could tell them apart with the labels removed.

## Known non-conformance (recorded, not authorized)

Measured during the walk above. These are **pre-existing defects on the surface**,
not departures this contract permits — hence recorded here rather than in
`deviation:`, which exists for authorized departures and would require naming an
authority that does not exist for these:

- `components/maia/MaiaArrivalField.tsx:156` — `rgba(150,95,205,0.42)` /
  `rgba(110,70,180,0.12)`; the violet glow visible in both screenshots.
- `components/OracleConversation.tsx:8198, 8220` — `rgba(139,92,246,…)`,
  `rgba(124,58,237,…)`, `rgba(167,139,250,…)` as raw rgba.
- Body field renders warm near-black `rgb(26,21,19)`, not the House navy field.

Purple on member-facing surfaces is a standing brand regression. Fixing it is not
in scope for the unit that authored this contract, and this contract does not bless
it — a future change to these surfaces must resolve or explicitly justify it.

## Observed, not settled

These are open questions surfaced by evidence. This contract records them and
deliberately does **not** rule on them; each needs a founder decision:

1. **Daily rotation.** Whether yesterday's visible conversation should carry
   forward — one continuous thread vs. daily chapters vs. consciously closed
   sessions — is explicitly awaiting Kelly's ruling per the comment in
   `conversationIdentity.ts` and `docs/architecture/MAIA_HOUSE_PRESENCE_IMPLEMENTATION.md`.
   Rotation must not be changed without it.
2. **Two competing primary gestures.** A consent tap ("I'm ready") sits above a
   persistent typed input while the occluded layer offers "Tap to speak". Voice
   appears to be the intent; the typed field is visually dominant on arrival. The
   room does not currently declare one primary gesture.
3. **Populated-conversation state is unverified.** The walk evidenced arrival only.
4. **Mobile is desktop reflowed.** No structural difference was observed beyond
   scale and glow shape. Whether this room should differ on mobile is undecided.
