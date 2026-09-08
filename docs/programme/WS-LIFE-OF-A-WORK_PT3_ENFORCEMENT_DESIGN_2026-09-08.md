# PT-3 enforcement — design

**Authority:** FOUNDER RULING — Writer's Studio (2026-09-08) §III–IV. DESIGN authorized; **BUILD is not.**
**Answers:** the four options reconciled against the Source lifecycle law (§II), each against the decisive question.
**Status:** ⛔ DESIGN ONLY. No migration, role, grant, trigger, seam, or schema change was made.

> **The decisive question, for every option:**
> *Can ordinary Writer's Studio content-working authority perform any of the three attacks that just succeeded?*

---

## 0. The premise, verified

Before any option can be judged, one fact decides most of them.

**There is exactly one database identity, and it owns the protected tables.**

- `lib/db/postgres.ts` builds a single pool from `DATABASE_URL`. The two other pool sites
  (`lib/database/postgres.ts`, `lib/skills/skillsRuntime.ts`) read the **same** variable.
- `docker-compose.production.yml` sets `POSTGRES_USER: soullab`, `POSTGRES_DB: maia_consciousness`.
- The `migrate` service loads the **same `.env.production`**, so migrations run as that same role — which
  therefore **owns every table it created**, including both protected tiers.

So today, "ordinary content-working authority" is not merely *permitted* to write the protected tiers.
It is their **owner**. That is why all three attacks succeeded, and it is the fact each option below
must be judged against.

---

## 1. The four options against the decisive question

| | Option | Can ordinary content-working authority still perform A3.2 / A3.3 / A4.1? | Verdict |
|---|---|---|---|
| **E4** | Census only (Leg 1 in CI) | **Yes — all three.** Detects new *code*; refuses no *statement*. | ✗ Rejected as enforcement by §III. Retain as detection. |
| **E3** | Single application seam, no lower boundary | **Yes — all three.** A direct `query()` bypasses the seam; the seam is advisory. | ✗ Insufficient alone (§III). Valuable as the lawful API. |
| **E1** | Refusal trigger, tables owned by the app role | **Yes — all three, after one statement.** ⚠️ **Demonstrated below.** | ✗ Insufficient alone. Not a boundary while the app owns the table. |
| **E2** | Least-privilege role: a custodian owns the protected tiers | **No — none of the three.** ⚠️ **Demonstrated below.** | ✓ The only option that answers the question by itself. |

### 1.1 ⚠️ E1 fails for a reason the earlier design did not name

A trigger does not bind the table's owner. On a disposable cluster, with the exact shape of today's
production (the application role owning the protected table and a `BEFORE UPDATE OR DELETE` refusal
trigger installed on it):

```
app: UPDATE protected_a …                       → ERROR: PT-3 … refused        ← the trigger works
app: ALTER TABLE protected_a DISABLE TRIGGER …;
     UPDATE protected_a …                       → 'mutated'                    ← one statement
```

**A refusal trigger installed by the role it is meant to refuse is a request, not a boundary.** This is
not a flaw in triggers; it is a consequence of §0. It means **E1 is not an alternative to E2 — it
depends on E2**, and only becomes defence-in-depth once something else owns the table.

### 1.2 ✓ E2 answers all three attacks, and keeps every lawful act

Same cluster, ownership separated: a `custodian` role owns the protected tier; the application role
holds `SELECT, INSERT` and nothing else; the trigger is installed by the custodian.

```
app: UPDATE src.protected_b …                   → ERROR: permission denied     ← A3.2 / A4.1 defeated
app: DELETE FROM src.protected_b …              → ERROR: permission denied     ← A3.3 defeated
app: ALTER TABLE … DISABLE TRIGGER …            → ERROR: must be owner         ← the E1 bypass is closed
app: INSERT INTO src.protected_b …              → 2 rows                       ← arrival + extraction still lawful
app: SELECT src.erase(2)                        → 1 row remains                ← governed lifecycle act works
```

The last two lines matter as much as the first three: an enforcement that also stopped arrival,
extraction, or member-directed erasure would violate the lifecycle law rather than implement it.

### 1.3 ✓ Custody bookkeeping separates from content **at the column**

§II requires that lawful claim/custody bookkeeping "does not authorize mutation of the Source content
itself merely because the metadata and content occupy the same database object." `claimArrival` writes
`manuscript_id` on a row whose other columns are the Historical Source. Postgres draws that line
exactly:

```sql
GRANT SELECT, INSERT ON src.arrivals TO app;
GRANT UPDATE (manuscript_id) ON src.arrivals TO app;          -- bookkeeping only
CREATE TRIGGER … BEFORE UPDATE OF source_text, source_text_hash, artifact_hash OR DELETE …
```

```
app: UPDATE … SET manuscript_id=7 …                       → 7                       ← claimArrival lives
app: UPDATE … SET source_text='forged', hash='h2' …       → permission denied       ← A4.1 defeated
app: UPDATE … SET manuscript_id=8, source_text='forged'   → permission denied       ← ⭐ cannot be smuggled
     SELECT source_text …                                 → 'the received text'
```

**The third line is the one worth keeping.** A column grant does not merely permit the good statement;
it refuses a statement that *mixes* a lawful column with a forbidden one. Bookkeeping cannot be used as
a carrier for content.

Scoping the trigger to `UPDATE OF <content columns>` is what keeps defence-in-depth from firing on the
lawful bookkeeping write.

---

## 2. The smallest architecture that satisfies §II and §III

**Three parts. E2 is load-bearing; E3 and E1 are the parts that make it usable and honest.**

```
  ordinary content-working authority          the application role
      SELECT   both protected tiers           reads freely
      INSERT   both protected tiers           arrival · extraction · re-extraction
      UPDATE   (bookkeeping columns only)     claim / custody
      ✗ no UPDATE of content columns
      ✗ no DELETE
      ✗ cannot disable the triggers
                         │
                         │  the only door
                         ▼
  explicit Source lifecycle authority         SECURITY DEFINER functions owned by the custodian,
      re-extraction · replacement ·           EXECUTE granted narrowly, each act named as itself
      withdrawal · erasure
                         │
                         ▼
  custodian owns both protected tiers         + BEFORE UPDATE OF <content> OR DELETE refusal triggers
                                                (defence in depth — now un-disableable by the app)
```

### 2.1 The lifecycle law, mapped to mechanism

| §II act | Mechanism | Why |
|---|---|---|
| **Content-working act** | Nothing. No grant reaches either tier's content. | The constitutional prohibition becomes a privilege fact. |
| **Arrival** | `INSERT` on arrivals, ordinary authority | Lawful, and not development. |
| **Extraction / initial representation** | `INSERT` on sections, ordinary authority | Same. |
| **Re-extraction** | Lifecycle function — **INSERT of a new representation**, never an UPDATE of the old | §II: re-extraction *creates*, and the previous representation remains historical. The absence of `UPDATE` is what makes this structural rather than conventional. |
| **Replacement** | Lifecycle function — new Historical Source + descendant representation + a **currency pointer move** | §II: replacement never overwrites. Requires a "which lineage is current" fact that **does not exist today** (see §3.1). |
| **Withdrawal** | Lifecycle function — availability change only, no content write | §II: withdrawal is neither deletion nor editing. Also has no representation today. |
| **Erasure** | Lifecycle function, named `erase*`, nothing else | §II: must be unmistakably commissioned as erasure, never a side effect. A function that only erases cannot be mistaken for one that edits. |
| **Claim / custody bookkeeping** | Column-level `UPDATE` grant, ordinary authority | §1.3. The metadata/content line is drawn where §II says it must be. |

### 2.2 Why all three mechanisms, not just the role

- **E2 (role) is the boundary.** It is the only thing that makes ordinary authority *technically
  incapable*, which is §IV's standard.
- **E3 (seam) is the lawful API.** Without one, every lifecycle act becomes an ad-hoc privileged call
  site, and §II's "unmistakably commissioned as erasure" has nowhere to live. The seam is where an act
  is *named*.
- **E1 (trigger) is defence-in-depth, and only now.** Under E2 the app cannot disable it, so it
  catches a future migration, a psql session, or a lifecycle function that grows a bug — the paths a
  role grant alone does not cover, because migrations run as the owner.
- **E4 (census) stays as detection.** It answers a question the runtime cannot: *did new code start
  reaching for the Source?* — visible in review, before it ships.

**§IV's warning is the reason for the shape:** these are not four candidates to pick from by
convenience. They occupy four different positions — boundary, API, depth, detection — and only one of
them is the boundary.

---

## 3. What this design does not settle

### 3.1 ⭐ Three lifecycle acts have no representation to govern

§II constitutes **re-extraction**, **replacement**, and **withdrawal**. The schema cannot express any
of them:

- `manuscript_sections` has **no currency marker**. Every row is simply "the sections". A second
  representation could be inserted, and nothing would say which is operative — §II's *"may designate
  which representation is presently operative without pretending the previous representation never
  existed"* has no column.
- `member_manuscripts` has **no lineage pointer**, so "which source lineage is current for the Work"
  cannot be moved.
- Nothing anywhere expresses **withdrawn-but-not-erased**.

**Consequence for sequencing:** enforcement can be designed now, but a build that granted only
`INSERT` would make re-extraction *representable and unusable* — new rows with no way to mark them
current. **The currency/lineage representation is a prerequisite of the enforcement build, not a
follow-on.** ⛔ Not authorized; named so it is not discovered mid-build.

### 3.2 Migrations run as the owner

Under E2, migrations must run as the custodian for the protected tiers — which means **the deploy lane
gains a second credential**, in a stack whose 2026-09-07 finding was that production-changing acts are
already under-attributed (three of four acts that day were unattributed). A second privileged identity
is exactly the kind of fact that drifts. ⚠️ This is the strongest cost of E2 and it is operational, not
technical.

### 3.3 Open design questions, deliberately unanswered

- **Where the custodian's `SECURITY DEFINER` functions live** — a schema (`src`), or the public schema
  with naming discipline. `search_path` pinning is mandatory either way.
- **Whether the protected tiers move to their own schema.** Cleaner grants; a wide blast radius across
  existing queries.
- **Ownership migration for existing tables** — `ALTER TABLE … OWNER TO custodian` on live tables, with
  the app's grants issued in the same transaction. Ordering matters; a half-applied change locks the
  app out of its own Source.
- **Whether `member_manuscripts` is a third protected surface.** It carries `source_custody` and is the
  cascade parent by which erasure reaches the arrivals. Today it is neither tier.
- **Erasure's residue.** §II explicitly reserves the "minimal non-content evidence" question to
  privacy/custody law. This design does not settle it and must not.

### 3.4 Verification

The instrument already exists. **The PT-3 falsifier is the acceptance test for its own remediation:**
A3.2, A3.3 and A4.1 must turn from `RED` to `PASS`, with **no change to the attacks themselves** —
only to what the architecture does when they run. Two obligations must be added rather than assumed:
Leg 2 must still be green (every lawful content-working path unaffected) and the lifecycle acts must be
exercised through the seam (arrival, extraction, erasure at minimum), because an enforcement that broke
`eraseManuscript` would violate PT-3's amendment while appearing to strengthen it.

⛔ **Do not weaken the falsifier to fit the implementation.** If an attack cannot be made to fail, that
is a finding about the design, not about the attack.

---

## 4. Standing

⛔ No build. No migration, role, grant, trigger, seam, ownership change, or schema change was made. The
demonstrations in §1 ran on a disposable cluster that has been destroyed; they touched no repository
file and no real database. Encounter, hierarchy, intention authority, quiet manuscript, Restore,
lineage and WS2-08B all remain held.
