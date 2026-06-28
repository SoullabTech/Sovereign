# ADR-005: Studio as Orchestration Domain; Providers as Replaceable Adapters

**Status:** Accepted (2026-06-27) — organizing decision; forks **D1–D3 ratified** 2026-06-27 (Kelly). Generalizes existing **Designed** docs; authorizes **no** net-new build (implementation is a separate, later authorization).
**Authors:** Kelly Nezat (vision), Claude (drafting)
**Reviewers:** —

**Relates to:**
- `docs/architecture/VISION_STUDIO.md` — Studio philosophy (chosen relationship, non-ownership, MAIA *proposes, never pronounces*)
- `docs/architecture/MAIA_GROUPS_MEETINGS_2026-06-27.md` — `MeetingProviderAdapter` precedent (8 providers; Level 1 link-launch / Level 2 auto-create); `GroupSession`
- `docs/architecture/MAIA_CALENDAR_TIER_GATED_PROPOSE_CONFIRM.md` — Propose→Authorize→Execute; tier-gating; single `lib/steward/calendarExecutor.ts`; `proposal_origin` / `authorized_by`
- `docs/architecture/CAPTURE_BRIDGE_CONVERSATION_TO_STUDIO_2026-06-25.md`, `docs/architecture/PRACTICE_SOURCE_AND_TRANSLATION_STUDIO_2026-06-25.md` — capture pipeline; `crossing_allowed`; `contains_third_party` triadic gate
- ADR-004 — same governing spirit: *reduce systems, don't add one.*

---

## Context

The sidebar's open threads — Teams invites, Studio-in-sidebar, recording workflow, Calendar entry point, client-add, relationship-centered people, per-channel consent, calendar integration — are **not separate projects**. Each is an aspect of **Studio**. Left unorganized, every new provider (a meeting platform, a calendar backend, a comms channel) expands the system *sideways*.

The adapter pattern that prevents that sprawl **already exists** — but only for meetings (`MeetingProviderAdapter`, GROUPS_MEETINGS) and only as a point solution. Calendar has its own separate authorization pattern (propose-confirm). Communication has its own consent gate (`practitioner_clients.reminder_consent`). Three provider families, three parallel abstractions, no shared spine — the same drift risk ADR-004 identified for the two RAG engines.

Separately, the meetings sketch models scheduling as one `GroupSession { scheduled_at, recurrence, … }` that conflates three things with **different lifecycles**: the recurring rule, a specific occurrence, and the realized conversation.

## Decision

**1. Studio is the stable orchestration domain.** Its sub-areas — People, Groups, Meetings, Calendar, Sessions, Wisdom, Notes, Analytics — are the domain. External systems are **replaceable adapters** beneath it, never definitions of it.

**2. Three port families, one adapter contract.** Generalize the `MeetingProviderAdapter` precedent into a family of ports:
- **MeetingProvider** — Teams · Google Meet · Zoom · Jitsi/LiveKit (sovereignty default)
- **CalendarProvider** — Google · Microsoft · CalDAV
- **Communication** — Email · SMS · WhatsApp

Studio depends on the *port*, never the vendor. Adding a provider = one adapter, zero domain change. This is the same ports-and-adapters sovereignty move already proven at the LLM layer (`lib/consciousness/LLMProvider.ts`, Claude↔Ollama).

**3. Recurrence belongs to the schedule, not the calendar.** The **Meeting Series** owns the recurrence rule. `RRULE` (iCalendar / RFC 5545) is the *wire format* calendar and meeting adapters translate **to** — never the home of truth. Calendars become projections of a schedule they do not own. (`calendar_disclosure` already behaves this way: a property of *how the schedule projects*, not of the calendar.)

**4. Entity model — four lifecycles, not one row.**

```
People
  └─ Group            reusable PARTICIPANT SET (not a mandatory parent)
       └─ Meeting Series     owns RRULE + default provider / participants / disclosure
            ├─ Meeting Instance   SPARSE — a (Series, date) pair; a row exists only as an
            │                     exception (moved / cancelled / overridden) OR when a Session attaches
            └─ Session            the realized encounter — recording, transcript, attendance,
                                  Practice Source; may be PARENTLESS (ad-hoc session room)
```

- **Group = participant set, not parent.** A 1:1 or ad-hoc encounter invents no Group; a Series *references* a Group. ("Weekly group = one Series, each Tuesday = one Instance" still holds.)
- **Instances are sparse / lazy.** RRULE is open-ended; never materialize every occurrence. Series + RRULE is the generator; Instances are the exceptions and the evidence.
- **Sessions may be scheduled or spontaneous.** A Session descends from a Meeting Instance (scheduled) **or** is born parentless — the live session-room creates one with no schedule behind it. Both paths are first-class; the chain is never forced top-down.

> **The load-bearing distinction (do not collapse):**
> - **Schedule** (Meeting Series) generates *possibilities*.
> - **Instance** records *evidence*.
> - **Session** records *encounter*.
>
> Three tiers, three lifecycles, three authority sources. A schedule is potential; an instance is what actually happened to a date; a session is the conversation itself.

**Three layers — planning, execution, history** (a *lens* on the same three tiers; adds no entity, no table):

| Layer | Purpose | Primary entity |
|---|---|---|
| **Planning** | what is *intended* to happen | Meeting Series |
| **Execution** | what *actually occurred* on a scheduled date | Meeting Instance |
| **History** | what was *experienced and created* | Session |

**Worked examples** (consequences of the ratified model — usable as schema tests):
- **Cancelled meeting** → an **Instance** (the cancellation is the attachment), **no Session**.
- **Spontaneous meeting** → a **Session**, with **no Series and no Instance**.
- **Rescheduled occurrence** → updates an **Instance**; the **Series is untouched**.
- **Recording, transcript, notes, AI summaries** → attach to the **Session** — products of the *encounter*, not the schedule.

**5. One authorization shape; family-specific gates.** Every external write follows **Propose → Authorize → Execute** (generalizing CALENDAR_TIER_GATED across all three families), tier-gated by scope (self vs others/client). Consent lives *inside the port*, each family carrying its own gate:
- Meeting → recording consent (Sanctuary absolute)
- Calendar → `calendar_disclosure` + `crossing_allowed` for third-party occurrences
- Communication → per-channel `reminder_consent` (fail-closed)

One authorization **shape**, not one gate for all.

**6. Adapter status is declared honestly.** Every adapter and entity carries exactly one of four status labels, never inflated beyond its evidence:
- **Live** — deployed to production and verified working
- **Built-not-deployed** — code/migration exists in the repo; not in production (or on an open PR)
- **Designed** — a documented design; no code
- **Vision** — directional intent; not yet designed

No adapter is described as more real than its evidence (claim discipline: *built ≠ wired ≠ surfacing ≠ verified*). Where production state is unverified, the item takes its **weakest safe claim** plus a ⚠ flag — a production audit may promote it, but the doc never *assumes* Live.

## Ratified decisions (2026-06-27, Kelly)

The three forks below are **ratified**; the ADR is **Accepted**. Ratification settles the model, not the schema — see *What this ADR does NOT do*.

- **D1 — Meeting Series is first-class.** A named, reusable **scheduled recurring container** with its own lifecycle: "the weekly group" is edited once and all future occurrences follow. It is **not** hidden inside `GroupSession`. This **supersedes the `GroupSession` sketch** in GROUPS_MEETINGS (design-only, no code → free to refine).
- **D2 — Naming debt resolved.** The three tiers carry these exact names, used consistently from here forward:
  - **Meeting Series** — the scheduled recurring **container** (owns RRULE + defaults).
  - **Meeting Instance** — a **dated occurrence**: exception / attachment point.
  - **Session** — the **realized conversation** (the encounter).

  The existing **built** `sessions` table holds *bookings* (scheduled slots ≈ **Meeting Instance**), **not** realized encounters — a naming-debt to reconcile in a later spec. Do **not** refactor the live table under this ADR.
- **D3 — Instances are sparse / lazy.** Recurring occurrences are **never** eagerly materialized. An Instance row is created **only when something attaches** to a date: **cancellation, reschedule, recording, notes, or a realized Session**. Series + RRULE generates the possibilities; Instances record only what actually happened.

## Open implementation decisions (named here, decided elsewhere)

The model above is ratified; **both anchors are now resolved** (below) — each settled by its own
explicit spec, never by a branch merge. They were named here so parallel work could not resolve
them by accident:

1. **Person anchor — `practitioner_contacts` vs `studio_people`.** Two built-not-deployed migrations
   this week model the identity layer differently (`practitioner_contacts_layer` ·
   `studio_people` / `studio_person_roles`; see Mapping). An earlier approach —
   `relationship_roles[]` on `practitioner_clients` (branch `feat/relationship-roles-additive`) —
   is **reference-only and superseded**. **RESOLVED by [ADR-006](006-studio-person-anchor.md):**
   `studio_people` (saved identity) + `encounter_participants` (participation) — participation
   never forces identity creation; `practitioner_contacts` as a parallel table and
   `relationship_roles[]` as the final anchor are rejected.
2. **Session anchor — a canonical `studio_sessions` table vs helpers over existing facets**
   (`sessions` = Meeting Instance per D2 + the realized session-room Session + a thin
   `lib/studio/studioSessionMeeting.ts` provider wrapper). The Mapping leans to the latter; a
   `studio_sessions` proposal lives in the reference branch (its ADR-008). **RESOLVED by
   [ADR-007](007-studio-session-anchor.md):** `studio_sessions` realizes the Session tier (an
   orchestration anchor for a realized encounter); `sessions` stays Meeting Instance; facets stay
   facets; not a super-table.

**Both anchors are resolved** (ADR-006 · ADR-007). Reference-branch survivors are ported under those decisions in a separate, later implementation lane.

## Consequences

**Positive**
- New providers and channels slot *into* the model instead of expanding it sideways.
- One authorization spine to audit, instead of three.
- Recurrence is provider-independent — swap Google ↔ CalDAV without touching the schedule.
- Honors the charter: *reduce, don't add* — unifies three abstractions into one.

**Negative / transitional**
- Reconciles two design docs (`GroupSession` ↔ this Series/Instance/Session split) before either is built.
- Adds one entity tier vs the single-row sketch — justified by lifecycle separation.
- "Session" naming-debt against the live `sessions` table must be tracked until reconciled.

**Neutral**
- **No code changes are authorized by this ADR.** Implementation (schema, RRULE threading, executor wiring) lives in a later spec.

## Mapping — current state vs target

Status labels per Decision 6. ⚠ = production state unverified this session; labeled by weakest safe claim. A one-pass prod audit (migration applied? sync emitting in the live container?) would resolve ⚠ rows to **Live** or **Built-not-deployed**.

**Domain entities**

| Target | Current code | Status |
|---|---|---|
| **Group / People** | `studio_people`, `studio_person_roles` (`20260627000001_studio_people.sql`) | **Built-not-deployed** ⚠ — this week's migration |
| Contacts layer | `practitioner_contacts_layer` (`20260627000002_practitioner_contacts_layer.sql`) | **Built-not-deployed** ⚠ — this week's migration |
| Client records | `practitioner_clients` (+ `reminder_consent`) | **Live** — referenced across studio + reminders |
| **Meeting Series** | `GroupSession { recurrence }` — design sketch only | **Designed** → promote to first-class (D1) |
| **Meeting Instance** | `sessions` bookings table (`scheduled_start/end`, `status`, calendar-sync fields) | **Built-not-deployed** ⚠ — naming-debt (D2) |
| **Session** (realized) | session-room ad-hoc session; recording / transcript; `meetingAudioTelemetry` | **Built-not-deployed** ⚠ — parentless path exists |
| **Recurrence (RRULE)** | — | **Vision** — the only net-new gap; no code, no design detail yet |

**CalendarProvider port**

| Target | Current code | Status |
|---|---|---|
| `calendar_events` table | `20260407000005_calendar_events.sql` (`start_time/end_time`, `calendar_provider`, `sync_status`, `calendar_disclosure`) | **Built-not-deployed** ⚠ |
| CalDAV sync | `lib/calendar/CalDAVService.ts`, `lib/calendar/syncStudioEventToCalDAV.ts` | **Built-not-deployed** ⚠ — single-event only (no RRULE) |
| Google Calendar sync | `lib/calendar/GoogleCalendarService.ts`, `lib/calendar/syncSessionToGoogle.ts` | **Built-not-deployed** ⚠ — single-event only (no RRULE) |
| Microsoft / Graph | — | **Designed** |

**MeetingProvider port**

| Target | Current code | Status |
|---|---|---|
| `MeetingProviderAdapter` interface | sketch in `MAIA_GROUPS_MEETINGS_2026-06-27.md` (8 providers; Level 1 / Level 2) | **Designed** |
| Audio capture | `lib/studio/meetingAudioTelemetry.ts` | **Built-not-deployed** ⚠ — telemetry only, not provider scheduling |
| Teams / Zoom / Meet auto-create | Level 2 design notes | **Designed** |

**Communication port**

| Target | Current code | Status |
|---|---|---|
| Email | Resend | **Live** |
| SMS / WhatsApp | dual-channel sender + `reminder_consent` fail-closed gate | **Built-not-deployed** — **PR #531 open**, not merged/deployed |

## Alternatives considered

1. **Leave the three adapter patterns separate** (meetings has its interface, calendar its executor, comms its gate). Rejected — three abstractions drift independently; exactly the failure ADR-004 names.
2. **Keep `GroupSession` single-row with a `recurrence` field.** Rejected for recurring work — conflates rule / occurrence / encounter, each with a different lifecycle; blocks per-occurrence exceptions (move one Tuesday) without hacks. Acceptable only for strictly one-off meetings, which the model already covers (Series with no recurrence, or a parentless Instance).
3. **Materialize every recurrence instance eagerly.** Rejected — open-ended RRULE → unbounded rows; contradicts *reduce, don't add*.

## What this ADR does NOT do

Consistent with the freeze posture and claim discipline: this is an **organizing** decision (a design agreement), **not** a build authorization. It does not declare any port "Live," does not author the recurrence engine, and does not move any member-facing claim from Designed to Live. It makes future work *fit*; it ships nothing.

## Anticipated, deliberately deferred

Per the restraint principle — *resist adding architectural concepts until implementation reveals a genuine gap* — the following is **named but not modeled**: held as direction, not a decision (no entity, no schema, no authorization).

- **Session Resources** — presentations, PDFs, worksheets, videos, whiteboards, polls, transcripts. As products of the *encounter*, they will belong to **Session**, never to a meeting provider — which is what keeps Teams / Zoom / Meet interchangeable and lets Studio be the practitioner's operational workspace.

  **Promotion criterion (agreed 2026-06-27):** recordings, transcripts, and notes attach directly to **Session** first. Session Resources earns its own identity, lifecycle, and governance **only if** attachment behavior becomes too varied to remain a simple session-associated artifact. Until then, attachment teaches the model — the structure is not anticipated.

The Series → Instance → Session spine + provider adapters is cohesive enough to carry recurring meetings, spontaneous conversations, recordings, AI assistance, presentations, and resource management **without another structural redesign**. The next structural concept should be *earned by an implementation gap*, not anticipated.
