# Reflection provenance — compatibility-window cutover design

**Date:** 2026-08-09 · **Status:** 🔵 **DESIGN FOR REVIEW. No code, no migration, no deploy.**
**R-REFLECTION-4 HOLD remains in force.**

**Governed by:** R-REFLECTION-1/-2/-3/-4 (`7a8787159:docs/governance/R_REFLECTION_1_ADOPTION_AND_PROVENANCE_2026-08-09.md`)
**Extends:** `7a8787159:docs/architecture/REFLECTION_PRODUCER_MIGRATION_TRANSITION_2026-08-09.md`
**Conformance:** `7a8787159:docs/architecture/REFLECTION_PROVENANCE_CONFORMANCE_REVIEW_2026-08-09.md`

> ⚠️ **PROVENANCE OF THIS DOCUMENT.** Authored from `feature/labtools-redesign` @ `9612677fe`,
> which **does not contain the reflection lane**. Every fact below was read via `git show` from a
> named ref, cited inline. The lane spans three branches:
> `chore/house-studio-ontology-trace` (rulings, transition, conformance) ·
> `feature/reflection-provenance-substrate` (migration, producer, harnesses) ·
> `feature/gate1-persistent-corrigibility`. Two are checked out in other worktrees and were not
> touched. **This document must be cherry-picked onto the lane branch before execution** — it is
> not durable where it sits relative to the code it governs.

---

## 0. Headline: the compatibility window already exists — and it has one blocking defect

The requested sequence is **already the design** in `REFLECTION_PRODUCER_MIGRATION_TRANSITION`
§1–§3, and the producer is **already dual-writing**. What was missing is step 8 (retirement), and —
newly found — the split migration's own post-conditions **contradict the window they enable**.

| requested | status |
|---|---|
| 1. additive migration, old representation stays operational | ✅ already designed (`0001a` schema-only) |
| 2. current producer safe against the additive schema | ✅ verified — see §1 |
| 3. producer compatible with legacy head **and** new structures | ✅ **already implemented** — see §2 |
| 4. deploy the compatible producer | ✅ sequence step 3 |
| 5. prove new captures write provenance without breaking readers | ✅ gates G2/G3 |
| 6. reconcile legacy under ratified rules | ✅ `0001b` backfill |
| 7. cut readers/adoption to new substrate only after evidence | ✅ explicitly excluded from this transition |
| 8. retire legacy compatibility after no live dependency | ❌ **not addressed — §7 below** |
| **no irreversible one-shot cutover** | ✅ every step reversible (§3) |
| **🔴 blocking defect** | **the backfill's post-conditions fail if any new capsule is edited during the window (§5.1)** |

---

## 1. Exact schema compatibility requirements

Read from `feature/reflection-provenance-substrate:database/migrations/20260809000001_reflection_provenance_substrate.sql`.

**Purely additive, safe against old code:**

| object | kind | old-code impact |
|---|---|---|
| `capsule_author_kind`, `capsule_origin_status`, `capsule_state_act` | `CREATE TYPE` (guarded by `EXCEPTION WHEN duplicate_object`) | none |
| `capsule_selections` | `CREATE TABLE IF NOT EXISTS` | none — old code never references it |
| `capsule_content_states` | `CREATE TABLE IF NOT EXISTS` | none |
| `trg_capsule_states_immutable`, `trg_capsule_selections_immutable` | triggers **on the new tables only** | none |
| `member_reflections.derived_from_state_id`, `.adopted_by`, `.adopted_at` | `ADD COLUMN IF NOT EXISTS`, nullable, no default | none — nothing writes them until Step 8 |

**No `ALTER` touches `reflection_capsules`. No column is dropped or renamed. No existing trigger is
modified.** The old producer's `INSERT INTO reflection_capsules` is unaffected in every respect.

**Two hard prerequisites already encoded, both correct:**

- The backfill **aborts** if `trg_capsules_updated_at` is absent — attestation rests entirely on
  that trigger, so it refuses to attest rows it cannot vouch for.
- `CHECK (act <> 'legacy_backfill' OR origin_status <> 'origin_verified')` makes A21 structurally
  unviolatable. This constraint is what will catch a mis-implemented lazy heal (§2.2) at the
  database, not merely in review.

**Requirement added by this design:** `0001a` (schema) and `0001b` (backfill) must be genuinely
separate files, and **`0001b` must carry revised post-conditions** (§5.1).

## 2. Exact producer behavior — before, during, after

Read from `feature/reflection-provenance-substrate:lib/capsules/capsuleService.ts`.

### 2.1 `createCapsule` is already dual-compatible

`createCapsule` (L61) runs a single `transaction(...)` (L104) that writes **all three**:
`reflection_capsules` (L82, the legacy materialized head) · `capsule_selections` (L127) ·
`capsule_content_states` (L189). The comment at L103 states the intent explicitly: *"this is one
transaction or none of it (A2)."*

> **The legacy head is preserved, not replaced.** Existing readers continue to read
> `reflection_capsules` exactly as before. Nothing in the requested step 3 remains to be built —
> the dual-write is the shipped implementation.

| phase | `createCapsule` behavior |
|---|---|
| **before** (old image, either schema) | writes `reflection_capsules` only. Safe on `0001a` — it never references the new tables |
| **during** (new image, `0001a` applied) | writes head + selection + state 0 (`machine`, `distillation`, `origin_verified`) atomically |
| **after** (new image, `0001b` applied) | unchanged — backfill does not alter the create path |

### 2.2 `updateCapsule` is the one incompatible path

`updateCapsule` (L396) selects the latest state (L485) and, when none exists (L490), **throws**:
`capsule ${capsuleId} has no content state — refusing to append (run the provenance backfill)`.

Between deploy (step 3) and backfill (step 6), **every pre-existing capsule is stateless**, so any
member edit of an older capsule fails. This is the transition doc's §2, and it is the only
member-visible breakage in the window.

**Lazy-heal requirement — with a constraint the existing code cannot satisfy as written.**
`stateInsertSql` (L189–195) **hardcodes `'origin_verified'`** in its `VALUES` clause. A lazy heal
must write `origin_attested`/`origin_lost` with `act='legacy_backfill'`, so it **cannot reuse
`stateInsertSql`** — it needs its own insert. If someone reuses it, the CHECK constraint rejects the
write rather than minting a false `origin_verified`. **Fail-closed by construction; note it so the
implementer does not "fix" the constraint.**

Lazy heal applies exactly the batch rule, in the same transaction as the edit:

```
updated_at = created_at → author_kind machine,  origin_attested
updated_at > created_at → author_kind unknown,  origin_lost
act = legacy_backfill  (never distillation, never origin_verified)
```

Then appends the member state as state 1 derived from it. Per-row lazy backfill is semantically
identical to batch backfill — same rule, same inputs, same result.

## 3. Rollback at each step

| step | action | rollback | reversible? |
|---|---|---|---|
| 0 | preflight | none taken | — |
| 1 | `0001a` schema | `DROP TABLE capsule_content_states, capsule_selections; DROP TYPE …;` drop the 3 `member_reflections` columns | ✅ nothing references them |
| 2 | verify G1 | none | — |
| 3 | deploy new image | redeploy previous image. Capsules created meanwhile keep head + state + selection; the old image simply ignores the extra rows | ✅ |
| 4 | verify G2/G3 | none | — |
| 5 | recompute inventory | read-only | ✅ |
| 6 | `0001b` backfill | `DELETE FROM capsule_content_states WHERE act='legacy_backfill'` (⚠️ **not** `TRUNCATE` — see §5.2); re-run | ✅ idempotent |
| 7 | verify G4–G6 | none | — |
| 8 | STOP | — | ✅ **no governed meaning exists yet** |

**The rollback boundary is unchanged: before adoption.** Adoption/withdrawal (`20260809000002`) is
not in this transition, so nothing in the window creates a fact that cannot be undone.

## 4. Capture failure modes

| # | mode | when | member-visible | mitigation |
|---|---|---|---|---|
| F1 | **capture 500s** — new code inserting into absent tables | new image deployed before `0001a` | ❌ **total capture failure** | strict ordering: `0001a` **always** precedes deploy. This is the failure the HOLD exists to prevent |
| F2 | **edit of a pre-existing capsule throws** | between deploy and backfill | ⚠️ visible error on edit | §2.2 lazy heal — removes the window entirely |
| F3 | **stateless capsules accumulate** | migration without deploy | invisible now, corrupting later | deploy precedes backfill; after step 3 no new stateless capsule can exist |
| F4 | **backfill aborts on missing timestamp trigger** | any | none — capture unaffected | intended; investigate rather than force |
| F5 | **backfill post-conditions fail** | window edit occurred | **migration fails, leaving `0001a` applied** | 🔴 §5.1 — must be fixed before execution |
| F6 | partial write of head-without-state | never | — | single transaction (L104); Postgres atomicity |

## 5. Duplicate and partial write prevention

**Partial writes** are prevented structurally: both `createCapsule` and `updateCapsule` wrap all
inserts in one `transaction(...)`. `capsule_selections.capsule_id` is `UNIQUE`;
`capsule_content_states` has `UNIQUE (capsule_id, state_number)`. **Duplicates** in the backfill are
prevented by `INSERT … WHERE NOT EXISTS` on both inserts, making `0001b` re-runnable.

### 5.1 🔴 THE BLOCKING DEFECT — post-conditions contradict the compatibility window

`0001`'s post-conditions assume every capsule has **exactly one** state:

```sql
IF n_states <> n_caps THEN RAISE EXCEPTION 'backfill incomplete: % capsules but % content states'
…
SELECT count(*) INTO n_multi FROM (
  SELECT capsule_id FROM capsule_content_states GROUP BY capsule_id HAVING count(*) > 1) x;
IF n_multi > 0 THEN RAISE EXCEPTION 'backfill produced % capsules with more than one state'
```

That holds only when backfill runs **before** any producer can append. **The compatibility window
inverts this**: after step 3, a member who captures a capsule and then edits it produces states 0
and 1. At step 6 both assertions raise, and the backfill **fails on correct data**.

Production creates ~2–3 capsules/day (R-REFLECTION-4 preflight). One edit anywhere in the
deploy→backfill window is enough.

**Required revision to `0001b`'s post-conditions** — assert the invariant that actually holds:

```sql
-- every capsule has a birth state (not: exactly one state)
count(capsules) = count(states WHERE state_number = 0)
count(capsules) = count(selections)
-- no legacy row claims capture-time provenance
count(states WHERE act='legacy_backfill' AND origin_status='origin_verified') = 0
-- lineage is gap-free per capsule (replaces the "more than one state" check)
no capsule has a gap in state_number, and exactly one state_number = 0
```

The transition doc's **gate G4 is already written correctly** (`count(states with state_number=0)`);
it is the SQL post-condition that was not updated to match. Gate and migration disagree — fix the
migration.

### 5.2 Secondary: rollback of `0001b` must not truncate

The transition doc's §4 says *"truncate the two tables and re-run."* After step 3 that would
**destroy `origin_verified` states created by the live producer**, which the backfill cannot
recreate (a legacy backfill may never write `origin_verified`). Rollback must be
`DELETE … WHERE act='legacy_backfill'` and, for selections, only those matching the backfilled set.

## 6. A24 remains valid throughout

A24 (capture → edit → edit → adopt, 18 assertions) exercises the **new** ontology end to end. It is
unaffected by the window because:

- it runs against fixtures created by the new producer, which never touches the legacy path;
- lazy-healed rows enter the chain as a **state 0 with `act='legacy_backfill'`**, and A24's chain
  assertions bind to `derived_from_state_id` and `state_number`, not to `act`;
- adoption/withdrawal are not deployed during the window, so A24 Q5–Q9 describe behavior no live
  member can reach yet.

**Two harness additions required before execution:**

1. *A lazily-healed state is never `origin_verified` and always `legacy_backfill`* — the transition
   doc already names this; it is the invariant for §2.2.
2. **New:** *a capsule created and edited during the window satisfies the revised post-conditions* —
   the regression for §5.1. Without it, the defect can silently return.

Per the conformance review, A4 (gap-free sequencing) and A6 (head equals highest state) are
**LIMITED** — they rest on a single choke point plus constraints rather than proof under
concurrency. The window does not worsen this, but lazy heal adds a second write path into state
creation, so **A4/A6 should be re-examined against `updateCapsule` heal-then-append** before ship.

## 7. Retiring legacy compatibility (requested step 8 — new)

Retirement means removing the **lazy-heal path**, not any column or table. Its precondition is
evidence, not time:

```
count(reflection_capsules WHERE NOT EXISTS (state for capsule)) = 0
```

sustained across a defined observation window, plus zero lazy-heal invocations logged. Only then may
§2.2 be deleted, restoring `updateCapsule` to a plain refuse-if-stateless.

⛔ **Nothing else is retired.** The legacy `reflection_capsules` head remains the materialized read
surface for every current reader; retiring it is a separate question that belongs with the reader
cutover (step 7), which is explicitly not in this transition.

## 8. Shortest safe deployment sequence

```
0  preflight        trg_capsules_updated_at present · sole writer confirmed ·
                    substrate absent · lane branch merged to trunk · clean tree
1  migrate 0001a    SCHEMA ONLY. Old image unaffected.
2  gate G1          tables/types/triggers present; capture still succeeds on OLD image
3  deploy           compatible producer (already dual-writing) + §2.2 lazy heal
4  gate G2          fresh capture → exactly one state 0 (machine, origin_verified) + selection
   gate G3          editing a PRE-EXISTING capsule succeeds (proves lazy heal)
5  RECOMPUTE        attested/lost split + totals, from live evidence, now
6  migrate 0001b    backfill with REVISED post-conditions (§5.1)
7  gates G4–G6      every capsule has a state 0; every capsule has a selection;
                    zero legacy origin_verified; recomputed split matches step 5 exactly
8  STOP             no adoption schema, no adoption behaviour, no doorway
```

**Why deploy precedes backfill:** it closes the producer gap first, so step 6 addresses a **closed,
finite set** rather than a moving target — which is exactly what R-REFLECTION-4 requires. ⚠️ **G6 is
the stop condition**: if the recomputed split differs from step 5, halt; do not best-effort.

## 9. Does any fact make a compatibility window impossible?

**No.** Assessed against the evidence:

| candidate blocker | verdict |
|---|---|
| new tables invisible to old code | ✅ additive only; no `ALTER` on `reflection_capsules` |
| producer must write both ontologies | ✅ **already does**, atomically |
| a state must exist before an edit | ⚠️ real, and the only breakage — closed by lazy heal |
| backfill must not double-write | ✅ `WHERE NOT EXISTS`, idempotent |
| immutability triggers might block the window | ✅ they guard only the new tables |
| irreversibility | ✅ nothing governed is created before step 8 |

**The maintenance-pause alternative is therefore not required and is not recommended.** For
completeness: a pause would eliminate F2 without lazy heal, at the cost of a one-shot event on a
live member-facing capture path with no partial-progress recovery — strictly worse on reversibility,
which is the property that matters most here.

**Atomicity is satisfied in the sense the ruling requires**: at no point in this sequence does an
externally visible state exist in which producer and substrate disagree about what a valid
reflection is. Before step 3 the substrate is present but unused; after step 3 every new capsule is
fully provenanced; the only inconsistency — a stateless legacy capsule — is a *known, finite,
pre-existing* condition that the window closes rather than creates.

## 10. What must happen before execution

1. **Split `0001` into `0001a`/`0001b`** and **revise `0001b`'s post-conditions** (§5.1). 🔴 blocking.
2. **Implement §2.2 lazy heal** with its own insert (not `stateInsertSql`) + its harness invariant.
3. **Add the window regression** — capture-then-edit during the window satisfies the post-conditions.
4. **Re-examine A4/A6** against the second state-creation path.
5. **Fix §5.2 rollback** to `DELETE … WHERE act='legacy_backfill'`.
6. **Cherry-pick this design onto the lane branch**; consolidate the three branches.
7. **A separate deployment authorization.** This design does not carry one.

**R-REFLECTION-4 HOLD remains in force until 1–7 are satisfied.**
