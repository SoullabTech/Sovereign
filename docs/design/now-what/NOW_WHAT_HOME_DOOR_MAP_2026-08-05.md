# Now What? Client Home — Door Map (2026-08-05)

What follows each box on the Client Home. Every box is a door; this map says where each door
leads, what the person meets on the other side, and what state the path is in. Two states:
**LIVE** (works on real substrate today) · **GATED** (waits on a named slice or ruling —
absent from the page until real, never placeholdered).

## The doors

### 1. The question you are carrying → the room, holding THAT question — LIVE
`/now-what/room?entry=question&thread=<id>` (opaque id; the member's words never ride the URL).
What follows: the arrival threshold framed by their own carried question — *"You are
carrying — «their question». What's moving in it now?"* — then conversation with MAIA from
whatever they say. The frame orients; it never seeds content.

### 2. Your next conversation → preparation in the room — LIVE (renders only when a real session is scheduled)
`/now-what/room?entry=prepare`. The box itself appears only when a scheduled/confirmed
session exists for this member (member-scoped read of the `sessions` substrate: time, status,
location type — never notes, price, or practitioner fields). What follows: an arrival framed
as preparation — *"Before your next coaching conversation — what do you want to bring
forward? What has shifted? What remains unresolved? What deserves deeper exploration?"*

### 3. Reach out (message Larry · your circle) — GATED, not rendered
Messaging requires its own slice: the old `clientMessages` path is on the wrong lineage
(E-1), and message content belongs to the encrypted lane (`phiAccessors`, encrypted from
birth — the boundary gate fails CI if content tables appear outside it). Circles additionally
carry the unruled third-party-consent question. Until those slices land, no box renders.

### 4. What you noticed / What you are living / What you are exploring → the member's field — LIVE
`/now-what/field`. What follows: everything they've kept, where each thread can be reread,
continued, brought forward, or withdrawn. (Future refinement: land focused on the clicked
thread.)

### 5. Your work with Larry (programs) → the position room — LIVE
`/now-what/position`. What follows: their declared position in each engagement — where they
are, in their words or placed by Larry and labelled as such. Stage maps render when program
stage data exists; never invented.

### 6. Your story → the field, as archive — LIVE
`/now-what/field`. What follows: the living record — realizations, turning points,
commitments, lessons, in their own words over time.

### 7. What you are cultivating → the field of contributions — LIVE
`/now-what/field`. **Not another gate to chat** (founder ruling, this session). What
follows: the field where their own contributions gather, held through the six flourishing
dimensions. Per-dimension gathering is a future slice: it requires a member tagging gesture
(the member places a contribution under a dimension); until that gesture exists, filtered
views would be fake and do not render.

### 8. A place to think (MAIA) → the open room — LIVE
`/now-what/room?entry=think`. What follows: the unframed threshold — *"Where's your
attention right now?"* — dictate, upload, or discuss. MAIA helps them think; Larry helps
them grow; they remain the author.

### 9. Your coaching relationship → the field (their side of the relationship) — LIVE, two parts GATED
Renders: coach name · the boundary sentence · **the notes they brought into their coaching**
(their own words, listed — Bring Forward substrate, deployed). Door: `/now-what/field`.
**GATED, founder-requested, needs the encrypted lane:**
- **Notes from Larry** — coach→client notes are a deferred content table
  (`coach_note_publications`-class); it must be born encrypted under `phiAccessors` with a
  practitioner authoring surface (belongs to the practitioner-field lane already seeded).
- **Direct communication field with Larry** — same encrypted lane + the E-1 lineage
  replacement; its design law is already ruled: *useful only if it strengthens the
  relationship without replacing it.*

### 10. Daily thought → no door — LIVE
Ambient orientation in its author's voice (Marcus Aurelius → Jung). Deliberately not a link:
it is a breath, not a destination. Held for its own Experience Inquiry.

### 11. Trust strip → no door — LIVE
The boundary stated once. Expandable disclosure, not a navigation surface.

## The shape underneath

Conversation doors (1, 2, 8) lead to the **room**, each with its own threshold frame.
Material doors (4, 6, 7, 9) lead to the **field** — the member's contributions and archive.
Position door (5) leads to the **position room**. Relationship capabilities (3, 9's gated
parts) wait on the **encrypted lane** and the **practitioner-field lane**. Nothing renders
before its substrate exists.
