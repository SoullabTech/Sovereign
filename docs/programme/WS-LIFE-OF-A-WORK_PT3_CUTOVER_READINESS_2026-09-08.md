# PT-3 production cutover readiness package

**Authority:** FOUNDER RULING — Writer's Studio (2026-09-08) §III, §V, §VI, §VIII. Readiness package authorized.
**Status:** ⛔ **This is not deployment authorization.** Nothing was run against production.

> §IV, restated so it cannot be lost: **the constitutional machinery exists in code; production
> runtime authority has not been placed behind it.** While ordinary runtime uses the owner
> credential, production does not satisfy PT-3 however correct the migration and application code
> are. **PT-3 must not be described as enforced in production until runtime executes as `maia_app`.**

| Evidence | Result |
|---|---|
| §VIII.E cutover witness (`pt3-enforcement-witness.ts`) | **29 passed · 0 failed** |
| §VIII.D backfill simulation (`pt3-legacy-backfill-simulation.ts`) | every legacy category, separation clean |
| §VIII.C production census (`pt3-production-legacy-census.sql`) | written, read-only, **awaiting a founder run** |
| §VIII.A/B seam verifier (`pt3-cutover-readiness.sh`) | written; reports **INCONCLUSIVE** off-host, by design |

---

## §V, §III — what changed since the accepted build

⚠️ **The build's backfill laundered legacy state into member authorship.** It wrote lifecycle acts
carrying `actor_member_id = the member`, so the earlier system's behaviour would have read, forever
after, as something the member declared. That is precisely what §V forbids, and it is now repaired:

```
source_lifecycle_acts
  + provenance ∈ member_act | migration_legacy
    actor_member_id  now NULL for migration_legacy
    CHECK ((provenance = 'member_act') = (actor_member_id IS NOT NULL))
```

**A migration-attributed record cannot be signed with a member's id. The constraint, not the
discipline, is what makes that true.**

### The backfill's two rules (§V, §VI)

- **DETERMINABLE** — exactly one arrival. The old `verifyCustody` read `ORDER BY created_at ASC
  LIMIT 1`; with one arrival that selection was *forced*, not chosen. A `migration_legacy` act makes
  the implicit machine behaviour explicit and attributable.
- **AMBIGUOUS** — more than one arrival, so the ordering *picked* among several. Preserving that as
  currency would convert an incidental property into an authority — the substitution §III forbids.
  **The migration records the ambiguity and creates no currency act**, in a new
  `source_lifecycle_reconciliation` table. Those Works remain on transitional compatibility until
  reconciled.

### §III — fail-open is compatibility, never authority

`COALESCE(source_operative_representation(id), representation_id)` prefers recorded history whenever
it exists and falls back only where none does. **Once a Work has lifecycle history, sort order,
earliest-arrival, insertion order and section position cannot compete with it.** The fallback exists
so a Work never disappears from its author, and for no other reason.

## §VIII.D — backfill simulation (run of record)

Five legacy shapes seeded on a pre-lifecycle database, then migrated:

| Fixture | Result |
|---|---|
| A — one arrival, 2 sections | `extraction/migration_legacy/no-actor` + `arrival/migration_legacy/no-actor` · currency derived |
| B — **two arrivals**, 3 sections | **no acts** · `multiple_legacy_arrivals` recorded · **transitional compatibility** |
| C — no arrival, 1 section | `extraction/migration_legacy/no-actor` · `representation_without_arrival` recorded |
| D — blank member-written | untouched: no representation, no act, still lawful |
| E — unclaimed arrival | untouched; the schema already documents that state |

`migration_legacy acts=3 · carrying a member actor=0` — **legacy stays legacy.**

## §VIII.C — production census

`scripts/witness/pt3-production-legacy-census.sql`, read-only and structurally so
(`SET TRANSACTION READ ONLY`, verified to refuse a write, ends in `ROLLBACK`). Eight sections cover
§VIII.C's list plus §VI's special witness, including **`later_arrival_contradicts_earliest`** per
multi-arrival Work — whether a later arrival's `source_text_hash` differs from the one the old
ordering would have selected.

```
ssh soullab@minisforum 'docker exec -i maia-postgres psql -U soullab maia_consciousness' \
  < scripts/witness/pt3-production-legacy-census.sql
```

⛔ **Not run.** This session has no route to production, and the census is the founder's to run.

## §VIII.A/B — the environmental seam

**Code side (landed, inert):** all three pool sites now read `MAIA_APP_DATABASE_URL || DATABASE_URL`.
Cutover becomes a deployment variable rather than a code change made under pressure.

**Deployment side (NOT made):** runtime services must receive `MAIA_APP_DATABASE_URL` and must *not*
receive `DATABASE_URL`; `migrate` keeps `DATABASE_URL` and must not receive the app credential.
Because `.env.production` is loaded by every service, **the app credential must not be added to it** —
that would be two authorities in one universal environment under different names, which §VIII.A
refuses. Runtime services need their own env file.

`scripts/witness/pt3-cutover-readiness.sh` checks the running stack: constrained credential present,
owner credential absent, credentials not co-located, `maia_app` not a superuser, protected tiers not
owned by it. **It reports INCONCLUSIVE rather than READY when it can observe nothing** — an early
version returned READY on an empty run, which is the false green this project exists to refuse.

⚠️ **Before cutover this verifier is expected to FAIL**, and that failure is the honest statement of
where the deployment stands.

## §VIII.E — cutover witness

Beyond the 24 checks already accepted, five more against a database carrying real legacy shapes:

| | |
|---|---|
| C1 | a blank member-authored Work remains lawful under the constrained role |
| C2 | existing Works remain visible to ordinary authority |
| C3 | an imported Work resolves to its **operative** representation (2 of 3 sections), not every cut ever made |
| C4 | the superseded representation is retained and simply not current |
| C5 | runtime cannot assume owner authority — `permission denied to set role "soullab"` |

⭐ **One defect the witness found in its own teardown, worth recording:** `source_commission_erasure`
issued on the pool authorized nothing for the next statement, because each pool query is its own
transaction and the window is transaction-local. The teardown was refused. **That is the seam
behaving exactly as designed** — a window that leaked across statements would be the side-effect
erasure §II forbids.

## Remaining before deployment

1. **Run the production census** (§VIII.C) and read what it returns — especially multi-arrival Works.
2. **Create `maia_app`'s credential outside the repository** (§VIII.B). No password is minted by the
   migration; that is deliberate.
3. **Give runtime services their own env file** and remove `DATABASE_URL` from them.
4. **Run the readiness verifier on the host** and require READY.
5. Only then deploy, and re-run the verifier after.

⛔ Encounter remains held behind this gate. Production deployment remains held.
