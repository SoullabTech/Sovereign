# Now What? — Developmental Home: repository audit + architectural decisions

**Date:** 2026-08-02 · **Branch:** `feat/now-what-developmental-home` · **Base:** `8dc94bb75` (trunk)
**Trigger:** Founder direction — move Now What? from a conversation-first entry to a context-aware developmental home.

---

## 1. What already exists

The founder brief describes the current arrival as *"opens directly with 'Where's your attention right now?'"*. That
screenshot is **`/now-what/room`** — the session room. It is one room inside an environment that already has eight
others and a map. The brief's premise (that Now What? is a single blunt conversation entry) is **partly incorrect**,
and that changes the shape of the correct build.

### Member-facing routes (all live)

| Route | What it is |
|---|---|
| `/now-what/arrive` | The front door. Invitation-gated account creation + sign-in. Post-signin landing is `/now-what/map`, **not** the room. |
| `/now-what/map` | `EnvironmentMapView` — the member's map of rooms: what is open, what each door does. |
| `/now-what/room` | The session room (MAIA conversation). **The screenshot in the brief.** |
| `/now-what/position` | "Where you are" — the member's declared position within a program. |
| `/now-what/field` | "Your field" — kept material. |
| `/now-what/next` | "What may be next" — practices the member themselves chose. Composes only; no recommender. |
| `/now-what/questions` | Questions you're living. |
| `/now-what/reflections`, `/now-what/themes` | Reflection + theme surfaces. |
| `/now-what/welcome` | Public welcome. |

Shared chrome: `components/now-what/NowWhatShell.tsx` (nav + threshold + `useMemberSession`),
`components/now-what/EnvironmentMapView.tsx`, `components/now-what/RoomTrustCopy.tsx`.

### API surface

`/api/now-what/{register,signin,interview,field-note,field-note/[id],program-position}`
plus an untracked, uncommitted `/api/studio/now-what/shared` (practitioner support desk — a *different* lane).

### Data substrate already present

- **`field_programs`** — practitioner-authored catalog of offerings (coaching/training/workshop/course/retreat),
  children of a `practice_fields` row. Carries `focal_points` (ordered stage names, verbatim) and a
  `current_focal_point` cohort default.
- **`field_program_positions`** — one row per member per engagement: *where the member says they stand*.
  `stated_by ∈ (member_confirmed, member_stated, practitioner_seeded)`.
- **`field_program_lessons`** — materials/practice/reflection attached to a focal point. No member data.
- **`field_program_revisions`** — append-only authoring history.
- **`library_sources`** — practitioner materials with a ratification lifecycle; only `ratified` composes into MAIA.
- **`calendar_events`**, **`google_calendar_credentials`**, **`sessions`** — scheduling substrate.
- **`client_groups`**, **`client_group_members`** — the nearest existing cohort concept.
- **`field_notes`**, **`member_field_note_threads`**, **`field_attention`**, **`field_events`** — kept material + continuity.
- **`practitioner_client_notes`** (+ `_continuity`) — practitioner-authored notes. **In flight, unmerged.**

**Conclusion: roughly 70% of the brief's "required experience" has substrate.** The correct work is composition and a
new threshold surface — *not* a new data model. Inventing parallel `programs` / `enrollments` / `cohorts` /
`personal_notes` tables would duplicate live concepts under different names, which the brief itself forbids.

---

## 2. Where the brief conflicts with ratified architecture

Three requirements cannot be built as written without overturning existing rulings. They are recorded here rather
than silently resolved, because each is a founder decision, not an implementation detail.

### C1 — "Programs they are signed up for" presumes a roster that was deliberately refused

`database/migrations/20260712000001_field_programs_and_positions.sql` states the ruling in the schema itself:

> *Enrollment is declared by arrival, not administered by roster: a position row exists only from a member's own
> gesture (or an explicit practitioner seed, which composes as assumed until the member speaks). **There is no
> enrollment table, no roster**, no departed-status graveyard — departure hard-deletes.*

The brief asks the client to "see all programs … for which they currently have access" and to pick among them.
Today, *access* is carried by the **invitation's `fieldContext`**, and the only per-member program facts are the
positions the member themselves declared. A member enrolled by Larry but who has never spoken has **no queryable
program list**.

Two coherent resolutions — this is decision **D-NW-1**:

- **(A) Compose without a roster.** The selector lists the *catalog* of the field(s) the member holds an invitation
  into, marks which ones the member has declared a position in, and treats the rest as undeclared doors. No new
  enrollment concept; the declared-by-arrival ruling stands. Weaker: a member with access to several fields still
  needs one row per field to know they have access.
- **(B) Introduce access-grant rows.** A real `program_access` concept (practitioner-granted, member-visible,
  distinct from position). Stronger and matches the brief literally, but **overturns the no-roster ruling** and
  re-opens the departure/graveyard question that ruling closed.

### C2 — "Notes from Larry" sits on an unmerged, unverified PHI surface

`practitioner_client_notes` is the subject of three open PRs (#888 docs · #889 PHI · #890 implementation) with
**0/12 acceptance criteria verified**, an unpatched covenant-gate hole (`class-a` is a category, not a severity
rank, so `covenant-gates.yml:127` never fires rollback discipline on it), and `sessions.notes` plaintext-PHI still
unruled. Building a **client-facing reader** on top of it now would:

1. take a hard dependency on an unmerged branch (the concurrent-work conflict the brief says to pause on), and
2. put PHI on a member-facing surface before its PHI gate has been verified even once.

This is decision **D-NW-2**: build the client-visible-note surface now against the in-flight schema, or ship the
home with that panel structurally absent until #888–#890 land and verify.

### C3 — Practitioner "program placement" contradicts a schema-level prohibition

`field_program_positions` carries: *"NO practitioner read of these rows, ever (catalog spec §8)."*
The brief asks Larry to manage "program placement." Practitioner **seeding** is already permitted
(`stated_by='practitioner_seeded'`, composes as *assumed* until the member speaks); practitioner **reading** of a
member's declared position is not. The practitioner surface will therefore support *seeding and revising the seed*,
and will **not** display what the member has since declared. No decision required — the existing ruling governs and
is sufficient.

---

## 3. Decisions taken without escalation

| # | Decision | Rationale |
|---|---|---|
| D1 | New route `/now-what/home`, not a rewrite of `/now-what/room` | The room is a room. Orientation is a different place. `/now-what/map` becomes reachable *from* home rather than being the landing. |
| D2 | Post-signin landing moves `/now-what/map` → `/now-what/home` | Restores the brief's ordering (orientation → active → relationships → continuity → today's work) without deleting the map. |
| D3 | Selected focus is **surface state**, not a durable object | Per the ratified Member Field re-centering: *Reference = durable · Placement = surface state.* Focus is a member-changeable pointer, never retroactively applied to history. |
| D4 | Personal notes reuse `member_field_note_threads`, not a new table | A private note *is* kept material. A parallel notes table would fragment the member's field, and the brief forbids duplicate concepts. |
| D5 | Calendar insight rules are deterministic and labelled | Every surfaced date states why it is shown. No inferred "insights"; the brief forbids opaque inference and the canon forbids AI-advanced state. |
| D6 | Every item renders its source and visibility | *From Larry · From your cohort · Private to you · Kept from your last conversation.* Private and shared material never share an undifferentiated feed. |
| D7 | No promotion of anything into a Field Object without an explicit member act | Per `FIELD_OBJECT_PROMOTION_RULING_2026-08-02.md`: sources produce events; the declaration creates the object. The home *surfaces* continuity; it never auto-keeps. |

---

## 4. Status

**Updated 2026-08-02, after the founder's Coach/Facilitator Field revision**
(`docs/specs/developmental-environment/COACH_FACILITATOR_FIELD_SPEC_2026-08-02.md`).

- **C1 / D-NW-1 — RESOLVED → Option B.** The revision introduces `ProgramEnrollment`, `StageHistory`, and explicit
  practitioner enroll/advance/pause/complete/re-enroll verbs. Enrollment becomes practitioner-administered. This
  reverses the declared-by-arrival ruling; see spec §16.1 for the consequences that need naming (chiefly: departure
  acquires a history where the prior ruling deliberately gave it none).
- **C3 — REOPENED, now the sharpest question.** Previously assessed as needing no decision. The revision's
  four-axis model (spec §4) lists *"client-declared sense of where they are"* among the axes Larry works with,
  which collides with `field_program_positions`' categorical *"NO practitioner read of these rows, ever."*
  Three resolutions in spec §16.2; recommendation is **(ii) narrow §8 to consent** — shareable by explicit member
  act, defaulting private, reusing the live `surface_preference` pattern.
- **C2 / D-NW-2 — STILL OPEN, and larger.** Visibility semantics (spec §10) are now load-bearing for the entire
  practitioner field rather than one client-facing panel.

The unblocked spine (orientation, current context, calendar, personal notes, continuity, next actions, conversation
entry, navigation) still depends on neither open question.
