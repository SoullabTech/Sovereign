# JARVIS — Writer's Studio Experiences · BUILD

**Authority:** FOUNDER RULING — Writer's Studio (2026-09-08) §XIII–XX. BUILD authorized.
**Status:** BUILT · witnessed on disposable infrastructure · ⛔ **member-facing deployment of
facilitated Experiences remains held behind PT-3 production enforcement (§XIX).**

| Gate | Result |
|---|---|
| `scripts/witness/experiences-witness.ts` — the §XX return gate | **18 passed · 0 failed** |
| `participationIsNonAuthorizing.test.ts` — the CI privacy census | 3 passed |
| `npm run typecheck` | 0 regressions |
| jest — manuscript · writers-studio | 1651 passed |

---

## 1. Two jurisdictional corrections, applied

### §XV — Contribution belongs to Living Work, not to Experiences

The DESIGN placed Contribution in the Experience's orbit with both `experience_id` and
`living_work_id` nullable. The ruling corrected the jurisdiction, and the tables now say so by name:
**`living_work_contributions`**, with `living_work_id` **NOT NULL** and `experience_id` optional.

An editor's note, a research interview, a peer reader's response and a musician's idea are all
Contributions; **none of them requires an Experience to have existed.** Witness D5 exercises exactly
that: a contribution recorded with `experience_id NULL`.

### §XIII — the Experience↔Work relation is returned as a conflict, not saved as a table

The DESIGN proposed reusing `living_work_materials` with `material_type = 'experience'`. **Returned
instead, per §XIII's instruction not to distort ontology to avoid one small object.**

That table means *material that feeds the Work*. An Experience is not material — it is the field a
Work arose within. Reusing it would have made the relationship indistinguishable from adoption,
which is the very failure Witness D exposed one level down. `writer_experience_work_relations` keeps
the declaration **pattern** (`relationship_sentence`, `declared_by`) while keeping the meaning:
*this Work arose within this Experience*, never *this Experience became content of the Work*.

## 2. What was built

```
writer_experiences                    owner · title · intention · orientation · state
writer_experience_versions            version_number · frozen_at        (§XI)
writer_experience_movements           position · kind · title · body · authorship
writer_experience_participations      experience · version · member    (§XII)
writer_experience_work_relations      declared by the author, in their sentence
living_work_contributions             §XV — a Living Work provenance primitive
living_work_contribution_adoptions    §XVII — material | influence
```

Naming is `writer_*` per §VI: `decision_experiences` / `change_experiences` already mean *an
experience someone HAD*, and `lib/experiences` means Guided Experiences. `studio_*` was refused too —
it denotes the Pro, Vision and Media Studios, which are not this one.

**Two laws are enforced by the database rather than by convention:**

- `wep_freeze_on_encounter` — a version freezes at the first participation, whoever encounters it
  and by whatever route. Freezing is a database fact.
- `wem_refuse_frozen_edit` — an encountered version's movements cannot be inserted, updated or
  deleted. **PT-3's law one scale up:** revision creates a descendant; it never edits the past.

## 3. ⭐ What is absent, on purpose

There is **no** `current_movement_id`, no completed state, no percentage, no ordinal progress record,
and **no participation↔movement table anywhere.** Witness A2 asserts this against the live schema
rather than the source: no column in the Experience namespace matches
`current|complet|progress|percent|score|level|rank|stage|streak`.

Witness C1 is the same absence read from the other side: `writer_experience_participations` carries
**no column beyond identity and time**, so a screenwriter entering at *Whole Script Encounter*
violates no invariant — the architecture cannot represent aheadness.

## 4. The §XX return gate

**A — Self / Poetry.** A self-directed Experience exists with **zero** participation rows; no
progress column exists anywhere; every movement is the member's own.

**B — Facilitator / Memoir.** No bridge exists from the Experience to a participant's Work: the one
declarative bridge is a member act the facilitator cannot perform, and no sharing/access/roster
table exists in the namespace. The facilitator's method is attributed to them at movement level. An
encountered version **refused** an edit, and the earlier participant still holds version 1 while the
revision is version 2.

**C — Screenwriter.** Entry at any movement violates nothing. The Work's relation to the Experience
is the author's own sentence. `living_works.form = 'Screenplay'` while the Experience has **no form
column at all** — form stays the Work's.

**D — Playwright (the suitcase).** `Maria Alvarez, actor playing Ruth` is recorded with **no member
id** and keeps her human-readable identity. Her discovery sits in relationship to the play with **no
material and no adoption**. The playwright then adopts it as **influence**: the Work changed, and
nothing of the actor's was incorporated. The genealogy reads
`Maria Alvarez, actor playing Ruth → influence`.

> ⭐ That row is the architecture saying what was previously unsayable: **the actor's discovery
> influenced a subsequent authorial act.** Not "the playwright thought of it". Not "the actor wrote
> it". Causation without possession.

**Negative privacy witness.** P1: no shipped file reaches a private table from participation. P2: no
view or function in the database travels that route.

⚠️ **P2 is stated narrower than "the route is impossible", and deliberately.** Every member shares
one database role, so **participation is not a database privilege boundary — it is an application
one.** A hand-written join in a psql session still returns rows. What must be true, and is, is that
**nothing has been built that travels it**: P1 covers the code, P2 covers the schema, and the CI
census keeps both true on every commit. Claiming a privilege boundary here would be a false green.

⚠️ **Two witness checks were rewritten during this build because they were not falsifiable.** B1
originally asserted `true` outright, and P2 originally passed by confirming a join returned rows.
Both now assert something that can fail.

## 5. ⛔ Not built (§XIX)

MAIA commissioning · CMT-01 changes · LMS behaviour · scoring · progress tracking · marketplace or
discovery · practitioner-client attachment · facilitator access to private participant material ·
form-specific schemas · screenwriting or playwriting pedagogy · production participant enrollment ·
any route, page or member-facing surface. Nothing is deployed; these runs are against a disposable
cluster, since destroyed.

**Also not built, and named so it is not assumed:** invitation (when it comes, FR-18 applies at the
mutation boundary from the first commit), co-facilitation, resume-where-I-left-off, and any sharing
surface — sharing remains a separate authority that does not yet exist.
