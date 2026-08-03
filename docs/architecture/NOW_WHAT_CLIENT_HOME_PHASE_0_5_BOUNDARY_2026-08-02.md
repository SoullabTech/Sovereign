# Now What? Client Home — Phase 0.5: Model Boundary Resolution

**Date:** 2026-08-02 · **Status:** RECORDED. Q-C **answered by evidence**. Q-A and Q-B carry
**recommended rulings awaiting founder ratification.**
**No migration. No route. No UI. Nothing implemented.**

Measured against `origin/clean-main-no-secrets` @ `c0c8b0ba6`. Supersedes the Q-C section and one
erroneous warning in [Phase 0](NOW_WHAT_CLIENT_HOME_LARRY_PILOT_PHASE0_2026-08-02.md).

---

## 0. Correction to Phase 0

Phase 0 flagged: *"`verify-coach-field-boundaries.ts` asserts over `PERSON_OWNED = [...]` — half of
the gate's person-owned set is a table that was never created… whether that check passes vacuously
or fails has not been established."*

**That framing was wrong.** The gate is not accidentally asserting over a missing table. It is
**deliberately enforcing that the table is absent.** Read at source:

```
1a  person-owned tables have NO relationship_id to reach them by
      → SELECT ... information_schema.columns WHERE table_name = ANY(PERSON_OWNED)
                                                AND column_name = 'relationship_id'
      → passes on zero rows. Absent table ⇒ zero rows ⇒ passes, correctly.

1d  content-bearing tables are deferred to the encrypted lane, not shipped here
      → failure message: "these exist unencrypted: ..."
      → the assertion is ABSENCE. The table existing is the FAILURE condition.
```

`1a` is staged, not vacuous: it is inert while the table is deferred and becomes load-bearing the
moment the encrypted lane creates it. `1d` is what holds the line today. The gate is correct.

**The Home cannot be built by creating those tables in a UI lane — doing so fails gate `1d` by
construction.** That is the intended behaviour, and it is the answer to Q-C.

---

## 1. Q-C — RESOLVED BY EVIDENCE: deferred by design, not omitted

Kelly's expectation — *"the omission is intentional for content-bearing objects; the relationship
foundation was meant to land first"* — is **confirmed**, explicitly and in writing, on trunk.

`docs/architecture/COACH_FIELD_INTEGRATED_FOUNDATION_EVIDENCE_2026-08-02.md` records the founder
merge ruling (**option A, structural-only**):

> **Structural privacy is not encryption at rest.** Invariant 1 proves that no *practitioner
> relationship path* reaches a person-owned record. It proves nothing about database
> administrators, backups, logs, exports… So every column capable of holding human expression was
> removed from this foundation, and every table whose *purpose* is to hold it is deferred rather
> than shipped unencrypted.

**Eleven tables deferred, each named with the content it carries:**

| Deferred table | Content it would carry |
|---|---|
| `coach_authored_notes` | `title`, `body` |
| `coach_note_publications` | `published_title`, `published_body_snapshot` |
| `coach_client_personal_notes` | `title`, `body` |
| `coach_client_shared_items` | `label`, `body` |
| `coach_position_shares` | `declared_position` — verbatim client wording |
| `coach_current_focus` | `focus` |
| `coach_work_items` | `title`, `detail`, `duration_note` |
| `coach_work_item_history` | `old_value`, `new_value` |
| `coach_important_dates` | `label` |
| `coach_resource_recommendations` | `label`, `note`, `external_url` |
| `coach_follow_ups` | `label` |

The ruling closes with: *"Their designs, constraints and append-only semantics are settled… and they
land in a following PR under the encryption contract used by `lib/security/phiAccessors/*`.*
**Sequenced, not abandoned.***

**Corroborating history.** #898 shipped 22 `coach_*` tables including all eleven. #910 reverted it
for *"23 plaintext content columns — human expression at rest, unencrypted."* The revert was clean
(never deployed, zero rows, purely additive) and states the intended sequence:

```
revert  →  #902 governed foundation  →  encrypted expression artifacts
        →  publication / sharing     →  practitioner experience
```

**The encryption contract is real, not aspirational.** `lib/security/phiAccessors/` has eight
modules on trunk — including `practitionerClientNotes.ts`, `sessionNotes.ts`, `clientMessages.ts` —
with an established shape (`encrypt*`, `decrypt*`, `getEncryptedColumnsForInsert`, `read*`).

### Classification requested by the prompt

| Class | Tables | Basis |
|---|---|---|
| **Deferred by design — encrypted lane** | all 11 above | founder merge ruling, option A; gate `1d` enforces |
| **Required for first pilot** | **none** | Slice 0 uses only shipped structural tables |
| **Replaced by existing primitives** | **none in the coach lane** | see §4 — Now What?'s own primitives are parallel, not substitutes |

**One nuance the Home must not blur.** `coach_current_focus` (free-text `focus`) is deferred;
`coach_client_selected_focus` **shipped**. They are different objects. What exists is a *pointer to
which process the client is attending to* — not the client's words about it. Phase 0's data map
called this "current focus"; that was imprecise. The Home may show *which process*, and may not show
*what the client said about it*, until the encrypted lane lands.

> **Q-C answer: deferred by design, pending the encryption contract. No new ruling needed — the
> ruling exists. The Home is the first consumer to feel it, which is correct: it exposed the
> sequence rather than breaking it.**

---

## 2. Q-A — RECOMMENDED RULING: co-equal perspectives on a shared relationship

Kelly's stated model:

```
             Process
                |
      ---------------------
      |                   |
 Larry view          Client view
 practice data       lived experience
```

**Recommendation: adopt it.** Two independent grounds.

### 2.1 It is already the house pattern — with a working precedent

`field_program_positions` (live since 2026-07-12) implements exactly this shape:

```sql
focal_point           TEXT NOT NULL          -- the member's stated/confirmed position
stated_by             TEXT NOT NULL CHECK (stated_by IN
                        ('member_confirmed','member_stated','practitioner_seeded'))
member_confirmed_at   TIMESTAMPTZ            -- NULL until the member's own gesture
```

A practitioner **may seed** a position. It does not become the member's position until
`member_confirmed_at` is set by the member's own act. Same row, two authorities, provenance carried
in the row itself. The projection model was already rejected here, in code, months ago.

The coach lane goes **further** in the same direction: the evidence doc records that for the
deferred `coach_position_shares`, `stated_by` *"admits no practitioner-authored value"* at all.

### 2.2 The projection model violates a standing constitutional constraint

`Larry's model of client → client sees themselves` is manufactured higher-order meaning delivered
downward. The Constitutional Direction of Authority permits authority to move only **upward through
authored experience**. A Home that shows the client Larry's assessment of them as their own state
inverts that direction. Kelly's read is right, and it is not merely a preference — the projection
model is unshippable under existing canon.

### 2.3 The constraint that makes "co-equal" precise

*Co-equal* must not decay into *symmetrical write access*. The precise form:

> **The relationship is shared. The claims within it are separately authored, and every claim
> carries its author.** Larry authors the offering (program, stage, commitment offered, date,
> resource). The client authors the taking-up (focus, confirmation, reflection, meaning, what they
> share back). Neither may author in the other's voice. Where both touch one object, provenance is
> a column, not a convention — the `stated_by` / `*_confirmed_at` pattern.

Corollary already ruled in the deferred designs: *`member_affirmed_at` required for a commitment*.
A commitment Larry offers is not a commitment the client has made.

**Not co-equal:** the client does not author `coach_program_definitions` or move their own
`current_stage_id`. Those are Larry's offering. Co-equality is about **whose account of the client's
experience is authoritative**, not about symmetric table permissions.

---

## 3. Q-B — RECOMMENDED RULING: absence of a program is a valid inhabited state

**Recommendation: adopt Kelly's framing.** The Home must orient before it has anything to report.

Per the standing return test — *when the member returns after time, what do they naturally
resume?* — a person returning does not resume "a program." They resume **their own material**.

### Four states the Home must define

| State | What the Home says | Substrate today |
|---|---|---|
| **No program** (invited, accepted, not yet placed) | relationship + doors + their own field | ✅ fully available |
| **One active program** | process · stage · focus · doors | ✅ structurally available |
| **Multiple programs** | ⚠️ **genuinely unresolved — see below** | schema permits it |
| **Completed program** | the work remains; the container closed | ✅ `status`/`ended_at` exist |

**Empty state is the design centre, not the fallback.** Kelly's draft copy is the right register —
it names the relationship, names the absence honestly (*"nothing is currently selected as your
focus"*), and offers doors rather than prompts. Nothing in it requires a program to exist.

**Newly surfaced sub-question (Q-B′).** `coach_client_processes` has no uniqueness constraint per
relationship, and `coach_client_selected_focus` is keyed to the person — so *selected focus* is
plausibly the mechanism that resolves multiplicity ("which of these am I in right now"). But
whether multiple concurrent processes are a supported state or an accident of the schema **is not
ruled**. This matters for Larry only if he runs a client in more than one program at once.
*Recommend: rule it out of Slice 0 scope, decide before Slice 2.*

**Prohibited in every state:** inferring progress from activity, scoring development, or turning
"Continue" into a recommendation engine. `Continue` lists **named doors**, never a computed
suggestion.

---

## 4. Existing object map

### 4.1 Accepted foundation objects (shipped, #902 `c0c8b0ba6`)

```
practitioner_clients                  ← THE SPINE. relationship_status pending/active/paused/ended,
                                        write-once member_id, invitation-claim provenance
practitioner_client_reconciliation    ← one queue, one spine
coach_program_definitions             coach_program_stages          coach_cohorts
coach_cohort_memberships              coach_client_processes        coach_program_enrollments
coach_enrollment_stage_history        coach_sessions
coach_client_selected_focus  (person-owned, no relationship_id)
coach_position_share_consents         (consent mechanics only; the snapshot is deferred)

lib/coachField/identity.ts    — branded MemberId / PractitionerRecordId / RelationshipId
lib/coachField/invitation.ts  — createPendingRelationship, acceptInvitation
scripts/verify-coach-field-boundaries.ts  — 32 passed · 0 failed
```

### 4.2 Existing Now What? objects

```
member_field_note_threads / member_field_note_events   ← wired: /api/now-what/field-note
field_programs / field_program_positions               ← the stated_by/confirmed precedent
/api/now-what/{register,signin,interview,program-position}
9 presentational routes + NowWhatShell / EnvironmentMapView / WithdrawVisibility
```

### 4.3 Member-owned primitives elsewhere on trunk

`member_memory_atoms` · `member_reflections` · `reflection_capsules` · `field_notes` ·
`manuscript_keeps` · `member_daily_anchors` · `breakthrough_moments` · `encounter_reflections` ·
`living_works` / `living_work_expressions` · `member_keep_preferences`

⚠️ **These are not substitutes for the deferred coach tables.** They are the member's own
platform-wide material, person-owned and correctly outside the relationship. The Home may surface
them under *"Yours"*; it must not reach them through a practitioner-scoped query, and Larry must not
see them absent an explicit share. Treating `member_reflections` as "the client's reflections in
Larry's process" would attach a person-owned source to a relationship — the exact move Invariant 1
forbids.

### 4.4 Deferred by design

The eleven tables of §1, blocked by gate `1d` until the encrypted lane.

---

## 5. Ownership map

Owner = **who the record belongs to**. Author = who performed the act. The foundation keeps these
distinct: `originated_by_member_id` / `published_by_member_id` answer *who did this*, never *whose
record is this*.

| Element | Owner | Author(s) | Visibility | Source | Status |
|---|---|---|---|---|---|
| Relationship | relationship | either | both parties | `practitioner_clients` | ✅ |
| Program | practitioner record | Larry | via relationship | `coach_program_definitions` | ✅ |
| Stage | relationship | Larry | both | `coach_program_stages` + `coach_program_enrollments.current_stage_id` | ✅ |
| Stage history | relationship | Larry | both | `coach_enrollment_stage_history` | ✅ (no `change_reason` — stripped) |
| Process placement | relationship | Larry | both | `coach_client_processes` | ✅ (no `title` — stripped) |
| Cohort | relationship | Larry | both | `coach_cohorts` / `coach_cohort_memberships` | ✅ |
| Session | relationship | either | both | `coach_sessions` | ✅ (no `location_note`) |
| **Selected focus** (which process) | **person** | client only | **client only — unreachable from any practitioner query** | `coach_client_selected_focus` | ✅ |
| Focus, in the client's words | person | client | client only | `coach_current_focus` | ⛔ deferred |
| Commitment offered | relationship | Larry | published only | `coach_work_items` | ⛔ deferred |
| Commitment **affirmed** | relationship | **client** (`member_affirmed_at`) | both | `coach_work_items` | ⛔ deferred |
| Note from Larry (delivered) | relationship | Larry | **publication row only** | `coach_note_publications` | ⛔ deferred |
| Larry's private note | relationship | Larry | **never client-visible** | `coach_authored_notes` | ⛔ deferred (`practitioner_client_notes.content_enc` exists in the older lane) |
| Resource | relationship | Larry | recommended only | `coach_resource_recommendations` | ⛔ deferred |
| Important date | relationship | Larry | both | `coach_important_dates` | ⛔ deferred |
| Client personal note | **person** | client | client only | `coach_client_personal_notes` | ⛔ deferred |
| Reflection | **person** | client | client only | `member_reflections`, `member_field_note_*` | ◐ exists, parallel lane |
| Shared back to Larry | **separate consent object** | client elects | only what is elected | `coach_client_shared_items` / `coach_position_shares` | ⛔ deferred (consents ✅) |
| Declared position | person → shared snapshot | **client only** (`stated_by` admits no practitioner value) | forward-only, consented | `coach_position_shares` | ⛔ deferred |

**The rule that generates this table:** *does this record exist because of a professional
relationship, or because the person exists?* The first gets `relationship_id`; the second must never
acquire one, and shares by creating a **separate** object.

---

## 6. What this means for sequencing

Q-C's resolution changes the shape of the work. The Home's two richest panels — *From Larry* and
*My Field* — are not buildable now, and that is a **ruling being honoured, not a blocker**.

```
Slice 0   structural loop on shipped tables        ← buildable today, no migration, no new ruling
   ↓
Lane E    encrypted expression artifacts           ← the 11 tables under phiAccessors
   ↓
Lane P    publication / sharing objects
   ↓
Slice 2   the full Home: "From Larry" + "Yours"
```

**Slice 0 stands as recommended in Phase 0**, and Q-C strengthens the case: it is the only slice
that proves the relationship loop without waiting on encryption.

> Larry creates relationship → client accepts → Larry places client in a program with a stage →
> client opens `/now-what` and sees *"You and Larry · working through <program> · <stage>"* and
> selects their own focus → **Larry cannot see that focus.**

Q-B is answered along the way for free: the client between acceptance and placement **is** the
no-program state.

**One prerequisite named in #902 and not yet met:** *"Practitioner **services** before any UI…
UI begins only after those services prove the identity and authorization boundaries."* Slice 0
therefore begins with the service layer (`lib/coachField/*`), not with a page.

---

## 7. Status

| Question | State |
|---|---|
| **Q-C** | ✅ **Resolved by existing evidence.** Deferred by design pending encryption. No new ruling required. |
| **Q-A** | 📋 **Recommended: co-equal perspectives**, constrained per §2.3. Awaiting ratification. |
| **Q-B** | 📋 **Recommended: no-program is a valid inhabited state.** Awaiting ratification. |
| **Q-B′** | 🔴 **Newly surfaced, unruled** — are concurrent processes supported? Out of Slice 0 scope; decide before Slice 2. |
| **Q-E** | 🔴 Standing: `sessions.notes` plaintext PHI in the older lane. Inherited by anything surfacing session content. |

Recorded, not decided. Nothing implemented.
