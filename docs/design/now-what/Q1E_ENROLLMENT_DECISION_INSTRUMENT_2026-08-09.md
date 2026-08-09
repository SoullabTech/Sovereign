# Q1-E — Program Enrollment: Decision Instrument

**Date:** 2026-08-09
**Status:** ✅ **RULED 2026-08-09 — see §6 (R-Q1e).** Evidence + decision set retained as history.
**Implementation status:** ⛔ **NONE AUTHORIZED.** R-Q1e settles the ontology, not a build.
**Requested by:** founder, 2026-08-09 — *"bring forward Q1-E only as the next decision instrument:
what constitutes enrollment, who can initiate it, what member act is required, how it relates to the
already-constituted relationship, and what it explicitly does not inherit from
`field_program_positions`."*

⭐ **Canonical home discipline.** The identity/contact/commitment ruling lives in
`Q1_CLIENT_IDENTITY_DECISION_INSTRUMENT_2026-08-09.md` (**R-Q1a**). This document does **not** restate
it and must not become a shadow copy. Q1-E is the one sub-question R-Q1a left open: R-Q1a.4 fixes
only what enrollment *is not*.

**The chain this sits inside** (founder, 2026-08-09):

```
governed person identity → constituted relationship → program enrollment
   → practitioner authoring → member-facing coaching experience
```

with contact/CRM data **alongside** that chain, never underneath it.

---

## 1. THE HARD LINE, RESTATED AS THE FIRST CONSTRAINT

> **`field_program_positions` must never be promoted into enrollment because it is nearby and
> already modelled.** Position answers *"where is the member in a program?"* Enrollment answers
> *"what program relationship exists?"* Different facts.

**The schema already agrees.** `field_program_positions.stated_by` admits `practitioner_seeded`,
documented verbatim as *"placed **at enrollment**, assumed until the member speaks."* Enrollment is
therefore already referenced by the position model as a **distinct, prior event** that the position
model does not itself contain. The separation is not a new idea to be imposed — it is an existing
implication that was never built.

---

## 2. EVIDENCE — WHAT EXISTS

### 2.1 `field_program_positions` — sovereign member declaration

| Property | Value | Consequence for Q1-E |
|---|---|---|
| `member_id` → `members` NOT NULL | keyed to governed identity | ✅ correct layer |
| `focal_point` | the member's stated/confirmed position, verbatim | member's words, not a status |
| `stated_by` | `member_confirmed` · `member_stated` · `practitioner_seeded` | epistemic footing, not membership |
| `member_confirmed_at` | NULL ⇒ *assumed*, composes as "ask, don't assume" | a position may be **assumed**; membership may not |
| departure | **hard delete** — *"closed = gone, no churn ledger"* | ⛔ an enrollment record that must survive departure cannot live here |
| **`NO practitioner read of these rows, ever`** (catalog §8, enforced in `programPositionService.ts`) | absolute | ⛔ **structurally decisive — see §5** |

### 2.2 `field_programs` — the practitioner's program object

`field_slug` + `program_slug` + `kind` (coaching·training·workshop·course·retreat) + practitioner's
verbatim `focal_points` + a cohort-default `current_focal_point`. It describes **the offering**.
It says nothing about who is in it. There is no join table between a member and a program.

### 2.3 The constitutive-act pattern already in use (relationship)

A commitment becomes real in **two member-side acts**, not one:

1. `POST /api/join/[token]/accept` → sets `participant_member_id` (identity joins the space)
2. `POST /api/relationship-spaces/[spaceId]/consent` → sets `consent_status='accepted'`,
   `consent_accepted_at`, `status='active'`

⇒ **identity link ≠ consent.** The pattern Q1-E should be measured against is *bilateral, explicit,
timestamped, and revocable* — and it separates "I am identified here" from "I agree to this."

### 2.4 ⚠️ THE PRECEDENT THAT MUST NOT BE COPIED — `academy_enrollments`

An enrollment model **already exists** in the schema, and it is keyed the forbidden way:

```sql
academy_enrollments.client_id  UUID NOT NULL REFERENCES practitioner_clients(id) ON DELETE CASCADE
academy_enrollments.path_id    UUID NOT NULL REFERENCES academy_paths(id)
status: active | paused | completed | dropped
```

**Enrollment hung beneath the practitioner's administrative contact record** — the exact inversion
R-Q1a exists to prevent. A row here asserts programme participation for a *contact*, with no member
identity and no constituted commitment anywhere in the chain, and it **cascades on deletion of a CRM
row**. It is also `workflow_enrollments`' shape by analogy.

✅ **Mitigating fact: it is inert.** `academy_enrollments` = **0 rows**, `academy_paths` = **0**,
`workflow_enrollments` = **0** (production, read-only, 2026-08-09). Nothing must be migrated; the
question is whether to quarantine or retire, not how to rescue data.

### 2.5 Production reality (read-only, 2026-08-09)

| Substrate | Rows |
|---|---|
| `services` | **19** ← the only live offering-side object |
| `field_programs` | 0 |
| `field_program_positions` | 0 |
| `academy_enrollments` / `academy_paths` / `workflow_enrollments` | 0 / 0 / 0 |
| `relationship_spaces` (constituted commitments) | **0** |

⇒ **Q1-E is being decided at the cheapest moment it will ever have**: no enrollment data exists in
any of the three candidate shapes, and no commitment exists to hang one from. Nothing to backfill,
nothing to reinterpret. *(Same window the practitioner-provenance work had — and the reason that work
was cheap.)*

---

## 3. THE QUESTIONS

### E1 — What constitutes enrollment?

| Option | Reading | Cost / risk |
|---|---|---|
| **A. A state on the commitment** — `relationship_spaces.program_slug` or a status field | Enrollment is an attribute of the relationship | Cheapest. ⛔ Breaks when one member is in two programs with the same practitioner, and conflates *the relationship* with *what we are doing in it* |
| **B. A separate relation keyed on the commitment** — `program_enrollments(relationship_space_id, field_slug, program_slug, …)` | Enrollment is its own fact, existing **only** where a commitment exists | Matches R-Q1a.4's language (*"a new relation keyed on the commitment"*); supports many programs per relationship; one new table |
| **C. Keyed on member + program directly** (no commitment FK) | Enrollment is between a person and an offering | ⛔ Permits enrollment without a constituted relationship — re-opens exactly what Ruling 1 closed |
| **D. Reuse `academy_enrollments`** | — | ⛔ Rejected on evidence (§2.4): keyed to a CRM contact |

*Evidence leans B. The founder rules.*

### E2 — Who can initiate it?

The relationship pattern (§2.3) is: **practitioner invites → member accepts.** Candidate readings:
practitioner-initiated with member acceptance · member-initiated request with practitioner acceptance ·
either side initiates, both must act. **Open question: must enrollment be bilateral, or may a
practitioner unilaterally place an already-committed member into one of their own programs?**
(A defensible "yes" exists — the member already consented to the relationship — but it would be the
first place a practitioner act alone changes member-visible state, so it should be ruled, not assumed.)

### E3 — What member act is required?

If bilateral: what is the act, and is it distinguishable from relationship consent? The relationship
model separates **identity join** from **consent**; enrollment plausibly needs its own explicit,
timestamped, revocable acceptance rather than inheriting the relationship's. **Open: does leaving a
program require a member act, and does it hard-delete (positions' rule) or retain a completed state
(academy's rule)?** These give opposite answers and the choice is constitutional, not technical.

### E4 — How does it relate to the constituted relationship?

Proposed invariant for ratification:

> **No enrollment may exist without a constituted commitment** — `participant_member_id IS NOT NULL
> AND status='active' AND consent_status='accepted'` — between that member and the program's
> practitioner. Enrollment inherits its authority from the commitment and **never substitutes for it**.

Corollary to rule: what happens to enrollment when the commitment is paused, archived, or withdrawn?
(Suspend · archive · hard-delete — the departure doctrine differs by substrate today.)

### E5 — Practitioner readability (structurally decisive)

`field_program_positions` carries an **absolute** invariant: *no practitioner read of these rows,
ever* — because a cohort of eight re-identifies trivially. But a practitioner plainly must be able
to see **who is enrolled in their own program** to run it.

> ⇒ **Enrollment and position cannot be the same substrate, because their read boundaries are
> opposite.** This is the strongest structural argument that E1-A/C are unsafe, independent of any
> philosophical claim: merging them would either break the catalog §8 invariant or make enrollment
> unusable by the practitioner who owns the program.

### E6 — Disposition of the inert precedents

`academy_enrollments` / `academy_paths` / `workflow_enrollments`: quarantine (no new reader/writer,
as `stellium_clients` was frozen under R-Q1a.5) · or retire by migration. All 0 rows.

---

## 4. WHAT ENROLLMENT MUST NOT INHERIT FROM `field_program_positions`

Explicit, per the founder's request:

1. ⛔ **`focal_point` semantics** — the member's own words about where they stand. Enrollment is not a
   statement of position and must never overwrite or imply one.
2. ⛔ **`stated_by` / assumed footing** — a position may be `practitioner_seeded` and *assumed until
   the member speaks*. **Membership may never be assumed.** Enrollment must be a fact or absent.
3. ⛔ **`member_confirmed_at`'s "ask, don't assume" composition** — an unconfirmed position still
   composes with epistemic hedging; an unconfirmed enrollment must simply not exist.
4. ⛔ **Hard-delete-on-departure** — appropriate for a self-declaration ("closed = gone"), unsafe as
   the only record that a person participated in a program.
5. ⛔ **The no-practitioner-read invariant** — must NOT be inherited (§E5), and equally the position
   rows must NOT become readable because enrollment is. Two boundaries, kept separate.
6. ⛔ **The row's identity** — an enrollment must not be represented as a position row with a special
   `stated_by`, however convenient.

**And the reverse guard:** position must not acquire enrollment semantics either. `field_program_positions`
is 0 rows today; it stays a sovereign member declaration.

---

## 5. THE DECISION REQUESTED

1. **Rule E1** — the shape (evidence leans **B**: a separate relation keyed on the commitment).
2. **Rule E2/E3** — initiation and the required member act (bilateral or practitioner-placed-within-commitment).
3. **Ratify E4** — no enrollment without a constituted commitment; and rule the pause/withdraw cascade.
4. **Note E5** — the opposed read boundaries as the structural reason enrollment ≠ position.
5. **Rule E6** — quarantine or retire the three inert enrollment tables.

**Nothing is built by this document.** Not authorized here: any migration, any `program_enrollments`
table, any change to positions, any surfacing in My Coaching. Under R-Q1a and Ruling 1, My Coaching
remains correctly empty until commitments exist — enrollment does not change that, and must not be
used to populate it.

---

## 6. R-Q1e — THE RULING (founder, 2026-08-09)

§§1–5 above are retained as the evidence and the decision set. This section is the ruling they were
prepared for. It is **operative**; where the sections above pose options, this settles them.

> **R-Q1e. Enrollment is a separate governed relation between an existing constituted commitment and
> a practitioner-authored program. It may not be inferred from contact, membership, position, or
> program visibility.**
>
> 1. **Separate relation.** Enrollment relates a **constituted commitment** to a **practitioner-authored
>    program**. It is not a state on the commitment, not a property of a contact, and not a position row.
> 2. **No inference, ever.** Enrollment may not be derived from `practitioner_clients`, from
>    `practitioner_clients.member_id`, from `field_program_positions`, or from the fact that a member
>    can see a program. **Membership is never assumed.**
> 3. **Offer ≠ enrollment.** A practitioner may offer/initiate enrollment for a member **already inside
>    a valid commitment**. The enrollment does **not become active** until the member performs an
>    **explicit accepting act**.
> 4. **Member may pause or withdraw** an enrollment **without dissolving the underlying commitment**.
> 5. **Dissolution cascades downward only.** Dissolution of the underlying commitment **must end or
>    invalidate** any active enrollment that depends on it. (Enrollment never survives its commitment;
>    the commitment survives the enrollment.)
> 6. **Enrollment has its own read boundary.** Practitioner and member may **both** inspect enrollment
>    state. ⛔ Neither gains access to the member's sovereign `field_program_positions` by virtue of
>    enrollment. Catalog §8 is untouched by this ruling.
> 7. **Nonconforming models are quarantined, not migrated.** `academy_enrollments` and any other
>    enrollment model rooted in `practitioner_clients` are **constitutionally nonconforming**. Quarantine
>    / deprecate — ⛔ do not migrate their shape forward — unless a later audit proves a distinct
>    legitimate use.

### 6.1 The open question of §E2, answered: NO

> **A practitioner may not unilaterally place an already-committed member into active enrollment.**
> A practitioner may create an **offer / proposed enrollment**. Because enrollment changes the
> member's visible participation state, a **member act** is required before it becomes active.

**Founder's reason, recorded because it generalizes:**

> *Otherwise the system quietly turns "relationship consent" into "consent to every future program,"
> which is too broad.*

⭐ **Consent remains granular.** A member can consent to the relationship without thereby consenting to
every program the practitioner later creates. This is the same shape as the relationship model's own
two-step (identity join ⊥ consent) — one act does not silently license the next.

### 6.2 The ruled lifecycle

```text
constituted commitment
        ↓
practitioner offers program
        ↓
pending enrollment          ← practitioner-created, NOT active, confers nothing
        ↓
member accepts              ← the constitutive member act
        ↓
active enrollment
        ↓
member may pause / withdraw ← does NOT dissolve the commitment
        ↓
commitment dissolution ends dependent enrollment
```

### 6.3 How the decision set resolves

| | Question | Ruled |
|---|---|---|
| **E1** | Shape | **Option B** — a separate relation keyed on the commitment. (A and C rejected: A conflates the relationship with what is done inside it; C permits enrollment with no commitment. D rejected on §2.4.) |
| **E2** | Who initiates | Practitioner **offers**; member **accepts**. No unilateral activation. |
| **E3** | Required member act | An **explicit accepting act**, distinct from relationship consent. Member may also pause/withdraw. |
| **E4** | Relation to commitment | No enrollment without a constituted commitment; dissolution ends or invalidates dependent enrollment. |
| **E5** | Read boundary | Enrollment is bilaterally inspectable; ⛔ grants **no** access to positions. |
| **E6** | Inert precedents | Quarantine / deprecate. Not migrated. |

### 6.4 What R-Q1e does NOT settle (do not infer these)

1. **Retention semantics.** Whether a withdrawn, completed, or invalidated enrollment leaves a
   historical record or is removed. The two precedents point opposite ways — positions hard-delete
   (*"closed = gone, no churn ledger"*), `academy_enrollments` retained `completed`/`dropped`.
   ⛔ Do not settle this by copying either.
2. **Member-initiated enrollment.** The ruling names the practitioner-offer path. Whether a member may
   *request* enrollment (with practitioner acceptance) is unaddressed — neither authorized nor forbidden.
3. **Whether "end or invalidate" (clause 5) means the same thing in both cases**, and what the member
   sees when it happens.
4. **Surfaces.** Where an offer appears to the member, and how acceptance is performed. No surface is
   authorized by this ruling.
5. **Schema specifics** — table name, columns, FK targets, indices.

### 6.5 Standing consequence for rehabilitation

My Coaching remains **correctly empty** (R-Q1a, Ruling 1): zero constituted commitments exist in
production, so there is nothing for an enrollment to attach to. ⛔ R-Q1e does not authorize populating
that room, and enrollment must never be used as the mechanism that fills it.

**Still no implementation.** R-Q1e authorizes no migration, no table, no surface, and no change to
`field_program_positions`.
