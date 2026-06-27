# ADR-006: A canonical Session anchor for the facilitation layer

**Status:** Proposed — recommendation pending steward ratification of the canonical choice
**Date:** 2026-06-27
**Authors:** Kelly Nezat, Claude
**Reviewers:** Kelly Nezat

## Context

Studio is becoming the **facilitation layer**: the meeting provider (Teams/Zoom/Meet/Jitsi)
is a swappable service underneath, and a Session owns its Resources, Notes, AI assistance,
Timeline, Recording, Transcript, and provider link. For that to hold, those concerns need
**one canonical Session** to attach to. Today they attach to different things.

This ADR is **implementation discovery + an architectural recommendation. No schema is created
here.** It maps every session-like table/runtime concept and recommends the canonical anchor,
deciding from **blast radius and altitude, not conceptual elegance**.

### The map (six session-like concepts + the resource edge)

| Concept | Migration / file | Represents (one row) | Owner | Phase | Blast: FK-in / code-refs | Carries (facilitation) |
|---|---|---|---|---|---|---|
| `rl_containers` | `20260120000001_relational_ledger` | a repeating care container | practice | **Series** | — | intent only |
| `sessions` | `20260118_portal_services_tables` | a public booking / calendar slot | practitioner | Instance (booking) | 1 / ~20 | scheduled_start/end, status, location, **payment** |
| `rl_sessions` | `…relational_ledger` + `20260407000001_trust_layer_phase1` | a scheduled occurrence inside a container | container→practice | **Instance** | 2 / ~0 | **`meeting_provider` enum**, meeting_url/id, consent_level, privacy_mode, location |
| `group_sessions` | `20260202300001_client_groups` | a scheduled group meeting | group | Instance (group) | 0–1 / ~0 | scheduled, location_details, notes |
| `scribe_sessions` | `20260126000001_scribe_sessions` | the lived **recording** encounter | member | **Session (lived)** | **8 / 11** | transcript, markers, AI `summary` JSONB, consent, participants, memory_policy, container type |
| `practitioner_sessions` | `20260118_stellium_practitioner_layer` | a modality history + MAIA-prep record | practitioner+client | History | 0 / ~8 | maia_prep, themes, insights, follow-up, notes |
| RecordingContext | `lib/studio/RecordingContext.tsx` | in-flight recording builder (ephemeral) | — | Execution (runtime) | — | segments/markers/insights → persists to `scribe_sessions` |
| `media_projects.source_session_id` | `20260407100001_media_studio_build_a` | resources/media (documents, images, video) | practitioner | — | nullable, **untyped** | **resources exist but hard-attach to no session table** |

Key linkages confirmed: live recording persists to **`scribe_sessions`** (RecordingContext →
`POST /api/scribe/start`); `session_artifacts.session_id` and the transcript/marker tables hard-FK
`scribe_sessions`; the **only structured provider** lives on `rl_sessions`; `sessions` ↔
`practitioner_sessions` are bridged today by `studio_session_id`; resources sit on a loose,
untyped `media_projects.source_session_id`.

### What the map shows

The two independent mappers **disagreed** on which table is "the Session" (`practitioner_sessions`
vs `scribe_sessions`). That disagreement is the finding: **no existing table is the practitioner-
facing facilitation Session.** Each is one facet at a different altitude — `sessions` is a *booking*,
`rl_sessions` is a *scheduled slot* (and holds the provider), `scribe_sessions` is *a recording*,
`practitioner_sessions` is *history*. Facilitation concerns are scattered across all of them, and
the one concern the whole vision turns on — **resources** — attaches firmly to none.

## Decision (recommended)

**Introduce a new canonical `studio_sessions` table — the lived facilitation Session — with
additive bridge FKs to the existing facets. Do not force a legacy table to absorb the others.**

Reached from blast radius + altitude, not elegance:

- **`scribe_sessions`** is the closest (most facilitation gravity), but (a) it is *a recording*,
  `member_id`-owned — a facilitated session with slides over Teams that is **never recorded** would
  have no home; and (b) it has the **highest existing-FK blast radius (8 inbound)**, so re-pointing
  its semantics is the riskiest move on the board.
- **`sessions`** is a booking at payment/calendar altitude (~20 code-refs); making it the lived
  Session bolts recording/resources onto a calendar slot.
- **`practitioner_sessions`** has the smallest blast (0 FK-in) but is astrology/modality *history*,
  not a live anchor — low cost, wrong fit.
- A thin **`studio_sessions`** anchor is **purely additive** to all six (nullable bridge FKs,
  lazy backfill ⇒ near-zero blast on existing tables) and gives **resources, provider, and
  presentation one home now**, while each existing facet keeps doing its current job.

### Series → Instance → Session, mapped onto the spine

- **Series** = `rl_containers` (repeating intent); a group program is a Series variant.
- **Instance** = the scheduled occurrence — `studio_sessions` bridges to `sessions` (booking),
  `rl_sessions` (ledger, carries provider), or `group_sessions`. Provider lives on the Instance.
- **Session** = **`studio_sessions`** (the lived facilitation record) — bridges/owns
  `scribe_sessions` (recording+transcript), `practitioner_sessions` (history/prep), and
  **Resources** via a typed edge that reuses Media Studio (`media_projects`/`media_assets`),
  replacing the loose `source_session_id` with a real `studio_session_resources` join. It
  **references**, and may snapshot, the Instance's `meeting_provider` (resources belong to the
  Session, the provider is a swappable service under it).

Bridges (all additive, nullable, no migration of existing rows):
`studio_sessions.{ booking_session_id→sessions, rl_session_id→rl_sessions, group_session_id→group_sessions,
scribe_session_id→scribe_sessions, practitioner_session_id→practitioner_sessions }`
+ `studio_session_resources(studio_session_id, media_project_id, order, visibility)`.

## Consequences

### Positive
- One anchor for resources · recording · transcript · notes · AI · timeline · provider ·
  presentation. Everything later (Presentation Mode, MAIA-over-slides, Resource Library) clips onto it.
- Existing tables are **untouched** — bridges are additive; the scribe pipeline, booking/calendar,
  payments, and the relational ledger keep working unchanged.
- A facilitated session that is never recorded still exists (it doesn't depend on `scribe_sessions`).
- Reuses Media Studio for storage (no new file infrastructure) and the existing `meeting_provider`
  enum for the swappable provider.

### Negative
- Adds a join layer and a **seventh** session-like table. This only pays off if it is adopted as
  *the* spine: new facilitation features must attach to `studio_sessions`, and the existing facets
  must be bridged (lazily) rather than extended in parallel. Without that discipline it becomes
  another fragment — the exact failure it's meant to cure.
- Backfilling bridges for historical rows is eventual, so older encounters surface less richly until linked.

### Neutral
- Provider stays on the Instance (`rl_sessions`); the Session references it. Whether the Session
  should also snapshot the provider at conduct-time is a schema-phase detail.

## Next step (not in this ADR)

On ratification of the canonical choice, the first build is additive and small: create
`studio_sessions` + the `studio_session_resources` edge + nullable bridges, then surface a Resources
panel + provider picker in the Session Room setup phase (absorbing the create-invite/group/session ask).

## References

- Mappers' evidence (this session): blast-radius table, facilitation-attachment map.
- `lib/studio/RecordingContext.tsx`, `app/studio/session-room/page.tsx`, `app/api/scribe/*`,
  `app/api/studio/sessions/route.ts`, `database/migrations/20260407100001_media_studio_build_a.sql`,
  `database/migrations/20260407000001_trust_layer_phase1.sql` (`meeting_provider` enum).
- Builds on [ADR-005](005-person-relationship-participation.md) (Person/Relationship/Participation;
  Series→Instance→Session frame).
