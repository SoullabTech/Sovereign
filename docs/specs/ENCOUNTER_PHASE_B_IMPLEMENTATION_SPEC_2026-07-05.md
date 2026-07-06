# Encounter Stewardship — Phase B Implementation Spec

> Phase A proves Soullab can *host presence*; Phase B proves it can *steward what happened*. Named
> "Stewardship," not "Schema" — that is what begins here.

**Status:** SPEC (Prompt 1). No code. Gated behind launch step **A (native transport) verified** —
which now means the Transport Acceptance checklist **and** the human Encounter Test (see the transport
spec's "Phase A / Transport Acceptance"). *Experience first, stewardship second: the system proves it
can host an Encounter before it learns to preserve one.*
Philosophy: `docs/architecture/CONSTITUTIONAL_SEQUENCE_ENCOUNTER_TO_INTEGRATION_2026-07-05.md`.
Transport: `docs/specs/WEBRTC_SESSION_ROOM_SPEC_2026-07-05.md`.
Governing sentence: *Build Session Room as a sovereign Encounter environment. Every feature must
deepen the fidelity with which Soullab stewards a human Encounter; no feature may replace human
recognition with system authority.*

**Object model:** the **Encounter** is the parent. Everything else is evidence/traces under it. NO
`relational_field` table. NO transport (WebRTC/TURN/SFU) fields on any Encounter row.

## 1. Encounter schema — `encounters`
`id · relationship_space_id (nullable FK) · container (team|witness|practitioner) · steward_member_id ·
status (pending|active|ended|archived) · started_at · ended_at · created_from · created_at`.
No media/transport columns. A row exists only after the consent threshold (see §3).

## 2. Participant + stream schema
- `encounter_participants`: `id · encounter_id · member_id (nullable — guest) · role
  (practitioner|client|peer) · display_name · joined_at`.
- `encounter_media_streams`: `id · encounter_id · participant_id · kind (mic|mixed) · storage_ref ·
  format · started_at · ended_at`. **Media belongs to a participant within an Encounter** — never to
  the Encounter directly, never to a mic.

## 3. Consent threshold events — `encounter_consent_events`
`id · encounter_id · participant_id · kind (join|record|share) · granted_at · text_snapshot`.
**Consent is the threshold, not a gate:** an Encounter row and a participant's media stream may not
exist before that participant's `record` consent event exists.

## 4. Recording lifecycle
Per participant: `pending → consented → recording → stopped`. On stop, persist media metadata under
`encounter_media_streams`. **No reflection/recognition/observation writes during recording** —
recording produces Evidence only.

## 5. Transcription lifecycle
`encounter_transcripts` (per encounter) + `encounter_transcript_segments`:
`id · encounter_id · participant_id (nullable) · speaker_label · start_ms · end_ms · text ·
confidence · source_stream_id · correction_status (raw|corrected)`. Transcript is **evidence, not
interpretation.** Correction never overwrites raw evidence (append a corrected segment).

## 6. Speaker attribution
Derived structurally from **separate participant streams** (track identity = participant → attribution
by construction, not diarization guess). `confidence` preserved; practitioner may correct attribution.

## 7. Observation / Recognition / Integration lifecycle
- `encounter_observations`: `source (system_suggested|practitioner_marked|client_marked) ·
  status (provisional)`. MAIA may write `system_suggested` — always provisional, never elevated.
- `encounter_recognitions`: **human_accepted only**; `authored_by = human participant`.
  **No system writer exists** (write-monopoly). Mutual recognition = both participants independently
  mark the same target (independence required — MAIA must not reveal one mark to induce the other).
- **Integration**: no table stamps "integrated." The system observes *traces* (human-authored new
  practice/behavior); it never asserts integration.

## 8. Elemental Alchemy overview
`encounter_reflections`: `type (elemental_alchemy_overview|…) · body · authored_by (system|practitioner) ·
visibility (practitioner_private|offered) · provisional=true`. Fire/Water/Earth/Air/Aether lenses.
**A reflection, not a fact/recognition/memory.** Language invitational ("possible theme," "may be
worth exploring"); never "recognition occurred," never diagnosis/certainty.

## 9. Iteration & discussion
Reflection workspace: review overview, ask MAIA follow-ups, request alternate lenses, edit, mark/dismiss
observations, offer selected reflections to client, practitioner-private notes, client-facing summaries.
Jurisdiction: practitioner notes stay private; client-facing requires explicit offering; recognitions
require human acceptance; **memory write requires an explicit promotion path** (never automatic).

## 10. Refusal tests (prevent drift — grep/DB-verifiable, extend `tests/constitutional/refusal-registry`)
1. **No recording before consent** — a media stream insert requires a matching `record` consent event.
2. **No system-authored recognition** — write-monopoly on `encounter_recognitions` (only an
   authenticated human-participant gesture route writes; grep finds no system writer). Like R07.
3. **No `relational_field` table** — schema scan fails the build if one appears.
4. **No transport fields on Encounter** — `encounters`/`encounter_participants` contain no
   webrtc/turn/sfu/ice column (R09-style lexical scan).
5. **Observation never elevated** — no code path promotes an `encounter_observations` row to a
   recognition without a human-assent write.
6. **Reflection ≠ memory/recognition** — a reflection cannot be written as a recognition or memory
   without the explicit promotion path.
7. **R11 — Encounter First** — the system refuses to create *any* transcript / observation /
   recognition / reflection / memory object not attached to an existing Encounter. Structural form:
   every derived table carries `encounter_id UUID NOT NULL REFERENCES encounters(id)`, and **no
   ingestion path — including an uploaded MP3 — may create a derived object without first creating or
   attaching an Encounter.** *"Where is the Encounter?"* is the system's answer to every orphaned
   "summarize this audio / analyze this transcript" request. The Encounter is the constitutional parent.
   **Open question R11 forces (must resolve before Solo recordings exist):** is a Solo session an
   Encounter (encounter-with-self / with-MAIA), or does Solo need a parallel parent? R11 is absolute,
   so Solo cannot ship undecided.

## Launch order (unchanged)
A transport (verify first) · B consent+schema · C native recording · D transcription+attribution ·
E practitioner review · F Elemental Alchemy overview · G lenses · H client offering · I MAIA bridge ·
J Studio continuity. **B does not begin until A is verified** (two-browser mic/P2P/coturn test).
