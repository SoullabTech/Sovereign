# The Continuity Calendar — Time as a First-Class Field (2026-08-05)

Founder directive: add Schedule/Calendar as a first-class continuity primitive, not a sidebar
utility. Client and practitioner views are designed separately. **The key rule: the calendar
never becomes the center — the center remains the person's work. The calendar is the bridge
between moments; it answers "when does this relationship continue?"**

## The primitive already exists — vocabulary is what's missing

The founder's "Encounter" spec (participants · start/end · type · relationship context ·
shared notes · preparation · follow-up) maps almost exactly onto the existing **`sessions`**
table: practitioner_id · client_id (via practitioner_clients) · scheduled_start/end · status ·
location_type · team scope. That IS the time-bound relationship event. Per the nomenclature
principle, worlds render it differently — executive coaching: *conversations* · therapy:
*appointments* · spiritual direction: *meetings* · Author Studio: *writing sessions* — one
substrate, read-time vocabulary. No new schema is required for v1.

Member-personal time already has its own substrate too: **`calendar_events`** (member-owned,
disclosure-controlled, external sync). Practitioner scheduling surfaces already exist under
`/studio` (calendar · booking · events).

### ⚠️ Naming hazard — "encounter" carries THREE referents on this platform

1. The existing **`encounters` table** — a practitioner *recording/transcription* substrate
   (audio, transcription status), NOT a scheduled event.
2. The **canon layer** "Encounter" (Constitutional Direction of Authority: Encounter →
   Reflection → Recognition).
3. The founder's proposed **Encounter primitive** (= the `sessions` row).

Do not rename `sessions` to `encounters`, and do not describe the calendar primitive as
"encounters" in code. If canonization of the primitive is wanted, it needs its own naming
ruling with all three referents on the table (same pattern as the "Phase 6" disambiguation).

## Client view

- **Home — Upcoming line/card** (implemented, working tree): next conversation, when, with
  whom, how; renders only when a real scheduled session exists. Never a task list.
- **Calendar Room** (`My Calendar`, mocked in the constellation): *conversations* (coaching
  sessions, group sessions, program events — from `sessions`) · *commitments* (member-created
  only, never assigned — the kept `practice` threads and, later, member `calendar_events`) ·
  *important moments* (member-marked only — a marking gesture, never an activity log).
- The client question: *"what is happening next in my relationship and my work?"* — never
  *"what tasks do I have?"*

## Practitioner view (separate surface, under /studio — never on the member's page)

- The practitioner question: *"what relationships and commitments need my attention?"* —
  never "manage clients like appointments."
- Today / upcoming with **relationship context**, sovereignty-scoped: only member-shared
  items, brought-forward reflections, and explicit preparation notes may render. Never
  private MAIA conversations, unshared reflections, or hidden memory. This is the G3 seam's
  semantic scope applied to time.
- Larry's `/studio` calendar surfaces exist; the continuity-signal enrichment is the new
  work, and it belongs to the practitioner-field lane (already seeded).

## Substrate state

| Piece | State |
|---|---|
| Scheduled relationship events (`sessions`) | LIVE — member-scoped `upcoming` read shipped in `/api/now-what/home` (safe fields only; requires team_id on insert) |
| Member personal events (`calendar_events`) | LIVE table; not yet read by Now What? |
| Client Calendar Room page | MOCKED in the constellation — awaits approval |
| Practitioner continuity calendar | Existing /studio surfaces; enrichment gated to the practitioner-field lane |
| Session creation (who schedules?) | Practitioner-side booking exists under /studio; client-initiated scheduling is UNRULED — not mocked, not built |
