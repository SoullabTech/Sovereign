# Q1 — Client & Relationship Identity: Decision Instrument

**Date:** 2026-08-09 · **Amended 2026-08-09 (same day) after founder rejection of R-Q1**
**Status:** DECISION INSTRUMENT — no implementation. Requires a founder ruling.
**Baseline:** `origin/clean-main-no-secrets @ ced4ab513` (canonical). Production `b1399f693`, 4 commits behind.
**Governing canon:** [`FOUNDER_RULING_1_COMMITMENT_AUTHORITY_2026-08-09.md`](../practitioner-portal/FOUNDER_RULING_1_COMMITMENT_AUTHORITY_2026-08-09.md) — **ratified**. Nothing here may weaken it.
**Evidence:** static forensics + **read-only production schema and aggregate counts** (no PHI, no row content read).

---

## AMENDMENT — R-Q1 REJECTED, AND WHY IT WAS WRONG

**Founder ruling, 2026-08-09:** R-Q1 as first written is **not ratified**. It conflicts with Founder Ruling 1.

The defective clause was:

> ~~"**A row with `member_id` set is a constituted relationship.** It is the *only* object that may resolve 'who is my practitioner' or 'whose client am I.'"~~

Founder Ruling 1 prohibits exactly this, in terms:

> *"`practitioner_clients` may remain a legitimate contact and operational record. Its existence, population, or association with a member does not establish the constitutional commitment and does not confer relational authority."*
>
> Prohibited: *"deriving authority over a member from `practitioner_clients` or another unilaterally authored record."*

**The error was a category collapse.** I treated *identification* as *constitution*. A practitioner-authored contact row does not become bilateral by acquiring a pointer to a member. The founder's formulation:

> **A contact tells AIN who someone might be. A relationship tells AIN what two people have mutually consented to. Those should never again be the same database fact.**

**The substrate already knew this.** `database/migrations/20260630000008_member_relationships.sql:39-42` states it in comments predating the ruling:

```sql
-- Optional link to practitioner-side CRM record
-- practitioner_clients owns billing/roster; relationship_spaces owns consent/relational scope
-- Nullable, non-authorizing, non-cascading
practitioner_client_id UUID NULL REFERENCES practitioner_clients(id) ON DELETE SET NULL,
```

I proposed inverting a boundary the schema had already drawn correctly. **Second instance in this engagement of the same failure mode: the executable artifact was the more trustworthy witness, and the prose reasoning drifted from it.**

The original R-Q1 is retained verbatim in **§9** as rejected history. The operative ruling is **R-Q1a** (§4).

---

## 0. THE AUDIT'S §C.1 WAS ALSO WRONG — THERE IS NO SECOND CLIENT TABLE

`stellium_clients` is an **alias VIEW** over `practitioner_clients` (`20260118_portal_services_tables.sql:150`). Confirmed live: `STELLIUM_KIND | VIEW`. **No unification migration is needed.** The audit's §C.1 "two client models" is void.

The view exposes 8 of 48 columns and **structurally cannot write `member_id` or `name_enc`**.

---

## 1. WHAT EXISTS — FIVE OBJECTS, NOT ONE

The founder's architecture, matched to substrate that already exists:

```
CONTACT                practitioner_clients            practitioner-authored, unilateral
   │                   "someone whose details I hold"
   │ optional identity link
   ▼
IDENTITY LINK          practitioner_clients.member_id  "this contact corresponds to this member"
   ✕                   ⛔ confers NO authority
   │
   ▼
COMMITMENT             relationship_spaces             bilateral · both identified · active · consent accepted
   │                   THE authority referent
   ▼
   ├─► ENROLLMENT      member ↔ program                separate relation — NOT BUILT
   └─► POSITION        field_program_positions         member's sovereign declaration · Catalog §8
```

### 1.1 `relationship_spaces` already encodes Ruling 1

| Column | Role |
| --- | --- |
| `steward_member_id` → `members` **NOT NULL** | the practitioner side, **as a member** — no separate constitutional person |
| `participant_member_id` → `members` **NULL until accepted** | the member side; NULL ⇒ not a commitment |
| `status` | `invited` / `active` / `paused` / `archived` |
| `consent_status` | `pending` / `accepted` / `declined` / `withdrawn` — **a state distinct from lifecycle**, exactly as ruled |
| `consent_accepted_at`, `consent_items` | what was acknowledged, when |
| `practitioner_client_id` | *"Nullable, non-authorizing, non-cascading"* |
| `relationship_type` | `practitioner_client` · `teacher_student` · **`coach_client`** · `supervisor_supervisee` |

A constituted commitment is therefore expressible today as:

```sql
participant_member_id IS NOT NULL AND status = 'active' AND consent_status = 'accepted'
```

**The three-part test in Ruling 1 is already a queryable predicate.** No new table is required to express authority correctly.

### 1.2 The contact table's four collapsed roles

`practitioner_clients` carries **48 live columns** doing four jobs: contact details; **a second auth identity** (`portal_email`, `portal_password_hash`, `portal_claimed_at`); relationship-lifecycle vocabulary (`relationship_status`, `linked_at`, `intended_scope`, `invitation_id`); and PHI/billing (`birth_*`, `intake_responses`, `name_enc*`, `stripe_*`).

Under R-Q1a only the first and fourth are legitimate. The lifecycle columns are **vestigial duplicates** of what `relationship_spaces` owns, and are a standing invitation to re-commit the category error.

---

## 2. PRODUCTION REALITY — MEASURED

Read-only, 2026-08-09, `maia_consciousness`:

| Measure | Value |
| --- | --- |
| `stellium_clients` object type | **VIEW** |
| `relationship_spaces` object type | **BASE TABLE** |
| **`relationship_spaces` rows** | **0** |
| **constituted commitments** (participant + active + accepted) | **0** |
| `practitioner_clients` rows | 13 |
| — with `member_id IS NULL` | **12 of 13** |
| — `practitioner_id` matching a `practitioners.id` | 13 |
| — `practitioner_id` matching a `members.id` | **0** |
| — with `name_enc` populated | **0 of 13** |
| `practitioners` with `member_id` set | **18 of 18** |
| `members` | 87 |
| `sessions` | 34 (10 scheduled, 24 cancelled); **6 of 34** linked to a client row |
| `services` | 19 |
| `field_programs` / `field_program_positions` | **0 / 0** |
| `member_field_note_threads` | 10 |

### 2.1 Why My Coaching is empty — the diagnosis, corrected

The first version of this instrument said the coach name was "a wrong-referent join, fix the join." **That was necessary but not sufficient, and stated the wrong primary cause.** There are three failures, at three different layers:

**(a) A genuine code defect.** `app/api/now-what/home/route.ts` joins `pc.practitioner_id` to `members.id`. Zero of 13 rows satisfy it — the FK points at `practitioners`. The correct resolution is:

```
practitioner_clients.practitioner_id → practitioners.id → practitioners.member_id → members.id
```

All 18 practitioners have `member_id` populated, so this path resolves. **This is a real bug and the founder has ruled it should be corrected — but not yet, and not as the fix for My Coaching.**

**(b) A constitutional defect — the primary one.** Even with the join corrected, the room would be reading *"who is my coach?"* out of a **unilaterally authored contact record**, scoped by `pc.member_id`. Under Ruling 1 that is deriving a relational fact from a record the member never co-authored. The correct referent is `relationship_spaces`.

**(c) The authority substrate is empty.** `relationship_spaces` holds **zero rows**. **There is not one constituted commitment anywhere in production.**

⇒ **My Coaching is empty because nothing has been constituted — not merely because a join is wrong.** Under Ruling 1 its emptiness is *substantively correct*. Populating it by fixing the join would render a relationship that does not constitutionally exist. **The audit's framing of this as a bug to be fixed was itself the category error, one layer up.**

The room should read the commitment, and stay honestly empty until commitments exist.

### 2.2 Two findings routed elsewhere

- **SECURITY — plaintext client names at rest.** `name_enc` populated on **0 of 13** rows despite a documented dual-write scheme (`lib/stellium/clients.ts`) and a backfill script. Writes through the `stellium_clients` view **structurally cannot** satisfy the encrypted path — the column is outside the view. **Two findings, one lane:** (i) names are plaintext at rest; (ii) the compatibility view cannot satisfy the intended encrypted path. Per founder: recorded as security findings, escalated to a dedicated security/privacy audit, **not folded into rehabilitation and not left in the notes.**
- **PREREQUISITE — no Larry.** Practitioner slugs in production: `cece`, `jondi`, `kelly`, `kelly-nezat`, `kelly-nezat-old` (suspended), `lighthouse`, `loralee`, `soul-alchemy`, `soullab-partner`, nine `personal-*`. **No Larry.** Per founder: recorded as a rehabilitation prerequisite; **do not hard-code Larry and do not create an exceptional identity path.** He needs the ordinary practitioner identity/profile path — member identity → practitioner profile → commitments — so the same architecture serves Larry, Kelly, Jondi and every future practitioner.

---

## 3. WHAT MAY CONFER AUTHORITY

| Candidate | May confer authority? | Legitimate role |
| --- | --- | --- |
| `practitioner_clients.id` (the row) | **No** — Ruling 1, explicit prohibition | contact / CRM / operational record |
| `practitioner_clients.member_id` | **No** — identification is not constitution | optional contact→member identity bridge |
| `portal_email` / `portal_password_hash` | **No** | frozen legacy credential; a shadow auth system, not to be extended |
| **`relationship_spaces`** — participant identified, active, consent accepted | **Yes — and only this** | the constituted commitment; the authority referent |
| `field_program_positions` | **No** | the member's sovereign declaration; Catalog §8, practitioner-unreadable |

---

## 4. R-Q1a — THE AMENDED SMALLEST RULING

> **R-Q1a. Contact, identity, and commitment are three permanently distinct facts. Only the constituted commitment confers relational authority.**
>
> 1. **`practitioner_clients` is the practitioner-owned contact / CRM / operational record.** It remains legitimate for details, invitations, billing and roster. It is **not** a relationship.
> 2. **`practitioner_clients.member_id` is an optional identity bridge** — *"this contact corresponds to this governed AIN member."* It answers **which member**, never **whether a relationship exists**. It **confers no relational authority.**
> 3. **Authority over acts within a developmental relationship derives only from the separately constituted relationship defined by Founder Ruling 1** — both governed member identities identified, relationship active, consent explicitly accepted. In substrate: `relationship_spaces` with `participant_member_id IS NOT NULL AND status='active' AND consent_status='accepted'`.
> 4. **Permanent distinction, never again one database fact:**
>    - `practitioner_clients` → contact / operational record
>    - `practitioner_clients.member_id` → optional contact-to-member identity bridge
>    - `relationship_spaces` → constituted relationship and **authority referent**
>    - enrollment → separate member ↔ program relation *(not built)*
>    - `field_program_positions` → sovereign member state, **not enrollment**
> 5. **`stellium_clients` is frozen** as a legacy alias view — no new reader or writer. **The secondary portal-credential model is frozen** from further architectural expansion. No third client model is created.
> 6. **No automatic or inferred linking.** The 12 unlinked contacts are **not** to be linked by email match, migration, or administrative population. A contact→member link may arise **only** through an explicit governed claim/invitation path — **and even then it does not constitute the bilateral relationship.**
> 7. **Practitioner identity resolves** `practitioner_clients.practitioner_id → practitioners.id → practitioners.member_id → members.id`. A practitioner profile is not a separate constitutional person.

### Consequence table

| Question | Answer under R-Q1a |
| --- | --- |
| Who is my coach? | the steward of my **constituted commitment**, resolved to a member — **not** the owner of a contact row bearing my `member_id` |
| Am I in a coaching relationship? | a `relationship_spaces` row exists with me as participant, active, consent accepted |
| Does a booked stranger get member access? | no — booking creates a contact; contacts confer nothing |
| Does linking a contact to my member id give my coach access? | **no** — identification is not constitution |
| Can Larry see my note? | only if `can_be_shown_to_practitioner` is true on that thread, **within** a constituted commitment |
| Where does enrollment live? | a new relation keyed on the commitment — not built |
| Why is My Coaching empty today? | **because zero commitments have been constituted** — correct, not broken |

---

## 5. WHAT R-Q1a UNBLOCKS — AND WHAT IT DOES NOT

| Item | Status under R-Q1a |
| --- | --- |
| **Kelly/Larry hard-coded identity** | **unblocked in principle, blocked in fact.** The room must resolve the practitioner from the *commitment*. With zero commitments, there is nothing to resolve to. The copy fix is now **last**: constitute commitments → read the commitment → then the sentence reads from it. |
| **The `pc.practitioner_id → members.id` join** | **confirmed defective**; correction deferred — it is not the fix for My Coaching, and correcting it in place would harden the wrong referent |
| **My Coaching populated** | requires constituted commitments. **Not a code fix.** |
| **Member Messages UI** | recipient must be the commitment |
| **Enrollment / programs** | separate relation keyed on the commitment |
| **In-product booking** | may create a contact; **may not** create access |
| **Absence vs failure rendering** | a wrong-referent join logged a warning for weeks and rendered identically to honest absence. **Absence and failure must never render the same.** This is a genuine defect independent of Q1. |

---

## 6. MIGRATION IMPLICATIONS

**No data migration is authorized by R-Q1a, and several are now explicitly prohibited.**

| Work | Nature |
| --- | --- |
| Freeze `stellium_clients` and the portal-credential model | convention + optional lint; no schema change |
| Correct the practitioner-resolution join | code; **deferred** |
| Separate absence from failure in non-fatal reads | code; genuine defect |
| Point relational reads at `relationship_spaces` | code; the substrate exists |
| Retire the vestigial lifecycle columns on `practitioner_clients` (§1.2) | **later, needs its own ruling** — they duplicate what the commitment owns |
| Enrollment relation | new migration, **after** R-Q1a |
| Backfill `member_id` on 12 contacts | ⛔ **PROHIBITED** by R-Q1a.6 and Ruling 1 |
| Backfill `relationship_spaces` from contacts | ⛔ **PROHIBITED** — *"no unilateral contact, roster, invitation, or practitioner-authored record may be converted into a bilateral commitment by migration, inference, or administrative population in place of the absent member act"* |
| `name_enc` backfill | security lane, separate |

**The 12 unlinked contacts are not debt.** They are contacts. That may simply be what they are.

---

## 7. THE REAL BLOCKER THIS EXPOSES

With `relationship_spaces = 0`, **no constituted commitment exists anywhere in production.** Every relational surface in the rehabilitation — My Coaching, Messages, sharing, enrollment, session visibility — is downstream of an object that has never been instantiated.

The commitment-constituting path partially exists in code (`/api/join/[token]`, `/api/join/[token]/accept`, `/api/relationship-spaces/[spaceId]/consent`, `/api/practitioner/practice-field/invite`), but **it has never produced a row.** Whether that path is complete, correct, and conformant to Ruling 1 is **unverified** and is the natural next investigation — it is the true critical path for the rehabilitation, ahead of every product surface.

**Not claimed here:** that the path works, or that it does not. Only that it has never run to completion in production.

---

## 8. THE DECISION REQUESTED

1. **Ratify R-Q1a** (§4) as the amended canonical identity ruling, conformant to Founder Ruling 1.
2. **Confirm** the 12 unlinked contacts remain contacts — no linking by inference, and a link would not constitute a relationship in any case.
3. **Confirm** the vestigial lifecycle columns on `practitioner_clients` (§1.2) are deprecated in intent, with disposition deferred to its own ruling.
4. **Authorize the next investigation:** trace the commitment-constituting path end to end for conformance with Ruling 1 — the true critical path (§7).
5. **Note as recorded, not actioned here:** the two security findings (§2.2) escalated to a dedicated security/privacy audit; and the missing Larry practitioner identity as a rehabilitation prerequisite, to be met through the ordinary practitioner identity path, never a hard-coded or exceptional one.

No implementation follows until (1) is ruled.

---

## 9. REJECTED — R-Q1 AS ORIGINALLY WRITTEN (retained verbatim)

Preserved as evidence of the reasoning that was corrected. **Not operative.** Its clauses 1, 2, 5, 6 survive in R-Q1a; clauses 3 and 4 were the defect.

> **R-Q1. The constituted practitioner↔member relationship is the only identity that confers authority, and it is constituted by `practitioner_clients.member_id` being non-null.**
>
> 1. **`practitioner_clients` is the single client table.** `stellium_clients` is an alias view over it and is **frozen** — no new reader or writer may use it. No third client model is created.
> 2. **A row with `member_id IS NULL` is a contact record.** It may hold details, receive invitations, and be booked against. It confers **no** access to member material, and no member-facing surface may read it as a relationship.
> 3. **A row with `member_id` set is a constituted relationship.** It is the *only* object that may resolve "who is my practitioner" or "whose client am I." Linking is an explicit act (`linked_at`, `invitation_id`); it is never inferred from a shared email.
> 4. **Practitioner identity resolves `practitioner_clients → practitioners → members`,** via `practitioners.member_id`. The direct `pc.practitioner_id = members.id` join is wrong at every call site and must be corrected.
> 5. **Enrollment is a distinct relation and is not this row, and not `field_program_positions`.** Positions remain the member's sovereign declaration under Catalog §8 — practitioner-unreadable, hard-deleted on departure. Enrollment, when built, is a separate table keyed on the constituted relationship.
> 6. **`portal_email` / `portal_password_hash` are frozen legacy.** No new surface authenticates through them. Members authenticate as members.

**Why clause 3 failed:** it made a unilaterally authored record constitutive of a bilateral relationship — the precise act Founder Ruling 1 prohibits. **Why clause 4 failed:** not wrong as a join, but wrong as a *purpose* — it resolved the practitioner for a relational claim sourced from the contact record rather than from the commitment.

---

## 10. GRANULAR CONSENT SEMANTICS — the invariant R-Q1e generalized (founder, 2026-08-09)

Recorded here, in the spine document, because it is **not enrollment-specific**. It emerged from
R-Q1e (`Q1E_ENROLLMENT_DECISION_INSTRUMENT_2026-08-09.md` §6.1) and governs every transition in the
identity → relationship spine.

> ### ⭐⭐⭐ One act does not silently license the next.

Consent is **not a field**. `consent = true` records almost nothing: it cannot say *what* was
consented to. The governing model is **consent as a sequence of acts**:

> *This person performed **this act**, concerning **this transition**, within **this relationship**,
> under **this scope**.*

Later acts may not borrow authority from earlier ones merely because they involve the same two humans.

**Consent must never become a transitive permission chain:**

```
identity ≠ relationship ≠ enrollment ≠ participation ≠ publication ≠ sharing
```

⛔ **Specifically, do not infer:**

| Forbidden inference | Why |
|---|---|
| `identity → relationship consent` | being identified is not agreeing (R-Q1a.2) |
| `relationship consent → enrollment consent` | would make one consent cover every future program (R-Q1e.3) |
| `enrollment → program position` | position is the member's own sovereign declaration; enrollment cannot state it |
| `program participation → additional sharing / publication authority` | participation is not permission to surface, share, or publish |

**Each transition that changes a person's relational or governance state requires its own legitimate
constitutive basis.** Where a transition does not change governed state, this rule does not apply —
it is a rule about *authority*, not about friction.

⭐ **What this gives AIN:** consent with **grammar** rather than consent as a checkbox.

---

## 11. Q1-A RATIFIED + R-Q1c RULED (founder, 2026-08-09)

Evidence: `Q1_SPINE_CLOSURE_A_C_D_2026-08-09.md`.

### 11.1 ✅ Q1-A — RATIFIED

> **A practitioner is constitutionally a member identity carrying practitioner role/profile state —
> not a separate kind of constitutional person.**
>
> **The constitutional actor is the member who is a practitioner, never the practitioner profile
> itself.** `relationship_spaces.steward_member_id → members NOT NULL` already encodes this; the
> schema agreed before the ruling did.

Consequences (already implied, now settled): `practitioners` is a **projection**, never a party ·
resolution runs `practitioner_clients.practitioner_id → practitioners.id → practitioners.member_id →
members.id` (R-Q1a.7) · every practitioner, Larry included, uses the ordinary path — ⛔ no exceptional
identity path for anyone.

### 11.2 ✅ R-Q1c — CLAIM SEMANTICS

> **R-Q1c. A claim is an act by an authenticated governed member linking that member identity to an
> existing administrative contact record.**
>
> 1. **Claiming must not create a parallel member identity or an independent credential domain.**
> 2. **`practitioner_clients.member_id` may be populated only through an explicit governed
>    claim/constitution process, and remains write-once.** (Already DB-enforced by
>    `practitioner_client_link_guard` — verified present in production.)
> 3. **Legacy portal credentials confer neither member identity nor relationship authority.**

### 11.3 Disposition — RECONNECT + DEPRECATE/CONTAIN, ⛔ not BUILD

The founder's characterization, recorded because it names the class of defect the rehabilitation
directive exists to find:

> *Not missing. Not needing invention. **The correct architecture exists, but the product selects the
> obsolete architecture instead.***

The conforming path (`lib/coachField/invitation.ts`, write-once, DB-guarded) has zero callers; the
live portal-claim routes create a parallel credential identity and never set `member_id`.

⛔ **Do NOT delete portal credentials.** Ordered sequence:

1. **Freeze their identity authority** (R-Q1c.3 does this constitutionally, today).
2. **Audit callers** — they may have residual legitimate operational uses not yet traced.
3. **Retire safely** only if nothing legitimate remains.

### 11.4 Held open — readiness as a prerequisite for relationship formation

> *"Are we in a relationship?"* is **not necessarily** the same question as *"Is my practitioner field
> fully ready to publish?"*

A practitioner may legitimately establish a consensual relationship with someone before finishing
their MAIA/Practice Field presentation material. **This dependency is to be examined separately and
BEFORE any change to Q1-D.** ⛔ Q1-D's pathway is not modified by this ruling.
