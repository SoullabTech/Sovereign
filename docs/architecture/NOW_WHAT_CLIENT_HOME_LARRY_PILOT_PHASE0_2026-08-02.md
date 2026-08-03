# Now What? Client Home + Larry Pilot Loop — Phase 0 inspection

**Date:** 2026-08-02 · **Status:** RECORDED. Inspection and proposal only.
**No code written. No table created. Implementation requires founder authorization.**

Measured against `origin/clean-main-no-secrets` @ `c0c8b0ba6`. Every existence claim below was
produced by extracting the tree and matching, not by reading prose.

---

## 0. Two corrections that change the brief

### 0.1 The local checkout is 156 commits stale

```
local  HEAD : 7c9dd5192
origin tip  : c0c8b0ba6
behind by   : 156
```

The session-start `gitStatus` describes a tree that is five months of work behind trunk. Any
implementation must happen in a worktree cut from `origin/clean-main-no-secrets`, not here.

### 0.2 The working tree holds a reconciliation doc whose premise is now false

`docs/architecture/NOW_WHAT_PHASE_TRANSITION_RECONCILIATION_2026-08-02.md` (untracked) answers an
earlier version of this brief by asserting the design assessment "already exists, and is on
canonical trunk," carried by **PR #898**.

**It does not.** #898 was reverted:

| PR | Merged | Effect |
|---|---|---|
| #898 | 20:28 | coach/facilitator field foundation |
| **#910** | **22:38** | **revert of #898 — "restore the ruled architecture"** |
| **#902** | **22:59** | **canonical foundation — merge `c0c8b0ba6`** |

All four artifacts that doc cites are **absent from trunk**: the Now What? developmental home
audit, the coach/facilitator field spec, migration `20260802000001_coach_facilitator_field.sql`,
and `lib/coachField/{access,notes,positionSharing}.ts`.

**Consequence:** the audit and spec this phase was told to build on do not exist. Its two open
questions (Q-A, Q-B, §5 below) survive as *questions*, but its "already answered" verdict does not.
That document should be corrected or withdrawn before anyone reasons from it again.

---

## 1. Current-state inventory (measured)

### 1.1 Member-facing routes — nine live, none is a Home

| Route | LOC | What it is |
|---|---|---|
| `/now-what/arrive` | 339 | front door; the **only** page that calls an API |
| `/now-what/map` | 16 | delegates to `EnvironmentMapView` — a **room directory** |
| `/now-what/position` | 223 | |
| `/now-what/field` | 238 | |
| `/now-what/next` | 196 | |
| `/now-what/questions` | 202 | |
| `/now-what/themes` | 108 | |
| `/now-what/reflections` | 105 | |
| `/now-what/room` | 63 | |
| `/now-what/welcome` | 40 | |

**Is `/now-what/map` acting as the Home?** No. It is 16 lines rendering a shared map of doors —
a *directory of rooms*, structurally incapable of answering "where am I in my work." It is the
right **place** for the Home to live and the wrong **content**.

**The finding that governs the build:** across `app/now-what/**` and `components/now-what/**`,
the only API endpoints fetched are `/api/now-what/register` and `/api/now-what/signin`. The nine
rooms are **presentational**. There is no member data-loading layer for Now What? at all.

The prior audit's "~70% of the required experience already has substrate" refers to *routes and
chrome*, not to data. On the data axis the Home is closer to zero than to 70%.

### 1.2 Existing API surface

`app/api/now-what/`: `arrive`-adjacent auth (`register`, `signin`), plus `field-note`,
`field-note/[id]`, `interview`, `program-position`. No caseload, process, commitment, or
publication endpoint.

`app/api/practitioner/**` is large (~55 routes) but belongs to the **older** practitioner/practice
lineage (practices, containers, labtools, materials, referrals). It does **not** sit on the
canonical `practitioner_clients` relationship spine and must not be assumed reusable.

### 1.3 The canonical foundation — what #902 actually shipped

Migrations: `20260802000002_practitioner_client_relationship.sql`,
`20260802000003_coach_field_process_structures.sql`.
Library: `lib/coachField/identity.ts` (branded `MemberId` / `PractitionerRecordId` /
`RelationshipId`, `resolvePractitionerRecordFromMember`, `authorizePractitionerClientRelationship`),
`lib/coachField/invitation.ts` (`createPendingRelationship`, `acceptInvitation`).
Gates: `scripts/verify-coach-field-boundaries.ts`, `scripts/verify-practitioner-relationship-m1.sql`.

**Ten `coach_*` tables exist on trunk:**

```
coach_program_definitions   coach_program_stages       coach_cohorts
coach_cohort_memberships    coach_client_processes     coach_program_enrollments
coach_enrollment_stage_history  coach_sessions
coach_client_selected_focus coach_position_share_consents
```

### 1.4 ⚠️ The invariants document describes tables that do not exist

`docs/architecture/COACH_FIELD_FOUNDATION_INVARIANTS_2026-08-02.md` is on trunk and is
founder-ruled. Its Invariant 1 lists the tables that carry `relationship_id`, and names two
person-owned tables as the enforcement mechanism. Checked against the tree:

| Named in the ruling | On trunk |
|---|---|
| `coach_client_processes`, `coach_program_enrollments`, `coach_sessions`, `coach_cohort_memberships`, `coach_position_share_consents`, `coach_client_selected_focus` | ✅ EXISTS |
| `coach_authored_notes` | ❌ MISSING |
| `coach_note_publications` | ❌ MISSING |
| `coach_work_items` | ❌ MISSING |
| `coach_important_dates` | ❌ MISSING |
| `coach_follow_ups` | ❌ MISSING |
| `coach_resource_recommendations` | ❌ MISSING |
| `coach_client_shared_items` | ❌ MISSING |
| `coach_position_shares` | ❌ MISSING |
| **`coach_client_personal_notes`** | ❌ **MISSING** |

`scripts/verify-coach-field-boundaries.ts` asserts over
`PERSON_OWNED = ['coach_client_personal_notes', 'coach_client_selected_focus']` — **half of the
gate's person-owned set is a table that was never created.** Whether that check passes vacuously
or fails has not been run here and must be established.

This is the standing *documentation as false control surface* pattern: the ruling is not wrong as
architecture, but its binding to the schema is absent. **The ruling is sound; the substrate is
partial.** Anyone who reads only the invariants doc will believe the "From Larry" and "My Field"
panels have backing. They do not.

**This is the single most important finding for sequencing**, because those eight missing tables
are precisely the Home's two richest panels.

---

## 2. Data source map

`element → source object → owner → visibility rule → status`

### Panel 1 — Welcome / Orientation

| Element | Source | Owner | Visibility | Status |
|---|---|---|---|---|
| Practitioner relationship | `practitioner_clients` | relationship | both parties | ✅ substrate |
| Active process | `coach_client_processes` | relationship | both | ✅ substrate |
| Current focus | `coach_client_selected_focus` | **person** | client only; unreachable from practitioner query | ✅ substrate |

### Panel 2 — My Process

| Element | Source | Owner | Visibility | Status |
|---|---|---|---|---|
| Program | `coach_program_definitions` | practitioner record | via relationship | ✅ |
| Stage | `coach_program_stages` + `coach_program_enrollments.current_stage_id` | relationship | both | ✅ |
| Stage history | `coach_enrollment_stage_history` | relationship | both | ✅ |
| Cohort | `coach_cohorts` / `coach_cohort_memberships` | relationship | both | ✅ |
| **Commitments** | `coach_work_items` | relationship | published only | ❌ **absent** |
| **Practices / assignments** | `coach_work_items` (kind) | relationship | published only | ❌ **absent** |

### Panel 3 — From Larry

| Element | Source | Owner | Visibility | Status |
|---|---|---|---|---|
| Note shared with client | `coach_note_publications` (delivery object) | relationship | **only published rows** | ❌ **absent** |
| Larry's private note | `coach_authored_notes` / `practitioner_client_notes` | relationship | **never client-visible** | ◐ `practitioner_client_notes` exists (`content_enc`, `lifecycle`) |
| Resources | `coach_resource_recommendations` | relationship | recommended only | ❌ **absent** |
| Important dates | `coach_important_dates` | relationship | both | ❌ **absent** |
| Sessions | `coach_sessions` | relationship | both | ✅ |

The publication split is load-bearing and already ruled: *the practitioner's private note is not
made visible; a separate delivery object is created.* The Home must read the **publication**, never
the note.

### Panel 4 — My Field

| Element | Source | Owner | Visibility | Status |
|---|---|---|---|---|
| Personal notes | `coach_client_personal_notes` | **person** | client only | ❌ **absent** (and gate-referenced) |
| Field notes | `now_what` field-note substrate (via `/api/now-what/field-note`) | member | member | ◐ route exists, schema untraced |
| Shared back to Larry | `coach_client_shared_items` | separate consent object | client-elected only | ❌ **absent** |
| Position share | `coach_position_shares` + `coach_position_share_consents` | relationship + consent | forward-only, consented | ◐ consents exist, shares absent |

### Panel 5 — Continue · Panel 6 — Calendar

Continue has **no source object** and must not acquire one by inference — a "resume" surface
derived from activity would be hidden synthesis. It must read explicit member acts only.
Calendar composes `coach_sessions` + `coach_important_dates` (the latter absent). A generic
`calendar_events` table exists but belongs to another lineage; do not join it in.

---

## 3. Larry pilot data flow

```
Larry (members.id)
  └─ resolvePractitionerRecordFromMember ──▶ practitioners.id        [identity.ts, the only translation]
       └─ practitioner_clients.id  =  RELATIONSHIP  ◀── the spine; everything hangs here
            ├─ coach_client_processes ─ coach_program_enrollments ─ coach_program_stages
            ├─ coach_sessions
            ├─ coach_work_items ✗           ─┐
            ├─ coach_important_dates ✗       ├─ the "From Larry" panel: NO SUBSTRATE
            ├─ coach_resource_recommendations ✗ │
            └─ coach_note_publications ✗    ─┘   (authored note stays private, always)

Client (members.id)  ── person-owned, NO relationship_id, unreachable from Larry's query ──
       ├─ coach_client_selected_focus ✓
       └─ coach_client_personal_notes ✗

Return loop:  client elects  ──▶ coach_client_shared_items ✗ / coach_position_share_consents ✓
              (a NEW object; the private source is never attached to the relationship)
```

Every read is scoped by `authorizePractitionerClientRelationship(actorMemberId, relationshipId)`,
which returns `null` — not a throw — so "not yours" and "does not exist" stay indistinguishable.
No route improvises the `practitioner_id` translation; no caller submits an ownership claim.

---

## 4. Proposed IA — the Home as threshold

`/now-what` (index) becomes the Home. `/now-what/map` stays the room directory it already is.

```
┌─────────────────────────────────────────────────┐
│  You and Larry                                  │  relationship + process + focus
│  Working through: <process>  ·  <stage>         │  no inferred progress, ever
├─────────────────────────────────────────────────┤
│  From Larry                     (empty ok)      │  publications · work items · resources · dates
├─────────────────────────────────────────────────┤
│  Yours                          (empty ok)      │  focus · personal notes · field notes
│         [ what you've chosen to share ]         │  explicit acts only
├─────────────────────────────────────────────────┤
│  Coming up                      (empty ok)      │  sessions · dates
├─────────────────────────────────────────────────┤
│  Continue  →  room · field · MAIA               │  named doors, not recommendations
└─────────────────────────────────────────────────┘
```

Ownership must be **visible in the surface**, not just enforced underneath: the member should be
able to see at a glance which things Larry placed and which are theirs. That is the difference
between a Home and a dashboard.

---

## 5. Open questions — must be ruled before Slice 2

**Q-A — Is the client's journey a projection, or a co-equal object?** The foundation is written
from Larry's side; `coach_client_selected_focus` is the only client-authored structural row. If the
Home is a read-only projection, the client is a spectator to their own development — which the
member-experience constitution refuses. **Unruled.**

**Q-B — What does the Home show with no active program?** Every composed element is null for an
invited-but-unenrolled client. Empty state determines whether this is a *place* or a
*sometimes-blank dashboard*. **Unruled.** Per the return test, this is not polish.

**Q-C — Are the eight missing tables an omission or a deliberate cut?** The ruling names them; the
migration omits them. Someone must say which. **This blocks Slice 1.**

**Q-D — Does the boundary gate currently pass vacuously?** It asserts over a non-existent table.
Unmeasured here.

**Q-E — Plaintext PHI.** `practitioner_client_notes.content_enc` is encrypted; `sessions.notes` is
flagged plaintext in the standing record. Any Home that surfaces session content inherits that.

---

## 6. Missing backend requirements

1. **Ruling on Q-C**, then one migration completing the ruled set (eight tables) — *or* an amended
   ruling that cuts them. Not a new lineage; not a parallel `programs`/`commitments` table.
2. **A client-side read service** — `lib/coachField/clientHome.ts` — composing the panels behind
   `authorizePractitionerClientRelationship`, returning typed, ownership-tagged sections.
3. **One route**, `GET /api/now-what/home`, scoped server-side from the session. No client-supplied
   identity. Zero write capability.
4. **A practitioner write surface** for Larry (Slice 1) on the canonical spine — not the legacy
   `app/api/practitioner/**` lineage.

---

## 7. Smallest vertical slice recommendation

The proposed Slice 1 (full practitioner workspace) is too large to be the first evidence, and it is
blocked on Q-C regardless. Invert it — prove the loop end-to-end on the substrate that **already
exists**, before building the eight tables.

> **Slice 0 — the thinnest true loop.**
> Larry creates a relationship (`createPendingRelationship`) → client accepts (`acceptInvitation`) →
> Larry places the client in a program with a stage (`coach_program_definitions` →
> `coach_client_processes` → `coach_program_enrollments`) → the client opens `/now-what` and sees
> **"You and Larry · working through <program> · <stage>"** and can set their own focus
> (`coach_client_selected_focus`) → Larry sees the relationship and process, and **cannot** see the
> focus.

Every object in Slice 0 exists on trunk today. It needs no migration and no new ruling. It proves
the identity chain, the relationship spine, the authorization boundary, and the person-owned
enforcement in one walk — and the negative assertion (Larry cannot read the focus) is the most
valuable evidence in the whole phase, because it is the invariant most likely to be violated later.

Slice 0 also answers Q-B for free: the client with no program is exactly the state between
acceptance and placement.

Then, and only then: Q-C ruling → the eight tables → "From Larry" → the share-back loop.

**What Slice 0 must not do:** infer progress, score development, surface an unpublished note,
recommend a next action, or read `coach_client_selected_focus` from any practitioner-scoped query.

---

## 8. Status

Recorded, not decided. Awaiting: **Q-C ruling** (blocking), **Q-A / Q-B rulings** (block Slice 2),
and authorization for Slice 0.
