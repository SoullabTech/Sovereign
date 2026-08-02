# Missing-table graceful degradation in `query()` — audit and finding

**Date**: 2026-08-01
**Status**: FINDING ONLY — no behavior changed. Awaiting a ruling on (a) / (b) / (c).
**Referent**: `lib/db/postgres.ts:64-69` on `claude/serene-kowalevski-268b9b`
**Occasion**: observed during the #867 authenticated Studio walk.

---

## §1 What the code does

`lib/db/postgres.ts:66`:

```ts
} catch (error: any) {
  // 42P01 = undefined_table - gracefully degrade instead of crashing
  if (error?.code === '42P01') {
    console.warn('⚠️  [POSTGRES] Missing table (graceful degradation):', error?.message);
    return { rows: [], rowCount: 0, command: '', oid: 0, fields: [] } as QueryResult<T>;
  }
  ...
  throw error;
}
```

A missing table is converted into a **successful empty result**. Every consumer of
`query()` — and of the eight helpers built on it — therefore cannot distinguish
*"the read failed"* from *"this member has no data."*

### Observed 2026-08-01 (#867 walk)

| Action | Postgres code | Route result | Studio render |
|---|---|---|---|
| `living_works` renamed aside | `42P01` | `HTTP 200 {"works":[]}` | empty state — "you have no works" |
| a column renamed instead | `42703` | `HTTP 500` | error state (correct) |

The special case is specific to `42P01`. `app/api/sovereign/living-works/route.ts:GET`
has a correct `catch → 500`, and `useLivingWorks` has a dedicated `error` phase built
precisely so the UI never claims emptiness it did not verify. Both are defeated one
layer below, silently.

---

## §2 Provenance — what it was added for

`git log -S '42P01' -- lib/db/postgres.ts` returns exactly one commit:

> **`911130a2a`** · 2025-12-14 · *"📖 Ask The Book UI + somatic_memories table (graceful telemetry)"*

The `-L` blame shows `--- /dev/null`: **the special case was present in the file's birth
commit.** It was never a considered ruling about read-failure semantics. It shipped
alongside a *new* table (`somatic_memories`) in a commit whose own subject calls the
intent "graceful telemetry" — i.e. *don't let a not-yet-migrated telemetry table crash a
request.* The early-migration-tolerance hypothesis is confirmed, and the scope it was
written for was **telemetry writes**, not member-facing reads.

Three sibling copies exist, all with the same comment, none independently reasoned:

- `lib/db/postgres.ts:66` — the live one (749 importers)
- `packages/shared/src/db/postgres.ts:71`
- `apps/api/src/db/postgres.ts:54`

(`lib/orchestration/index.ts:339` also tests `42P01`, but it is legacy **Supabase** code
and it *throws* — `Required table 'X' not found. Run migrations first.` That is the
opposite policy, and the correct one.)

---

## §3 Caller inventory

### 3.1 Blast radius

| Measure | Count |
|---|---|
| Files importing `lib/db/postgres` | **749** |
| Files under `app/api` importing it | 647 |
| API-route files running `INSERT` / `UPDATE` / `DELETE` through it | **277** |
| `insertOne(` call sites | 31 |
| `updateOne(` call sites | 8 |

Every one of these inherits the degradation. There is no opt-out at the call site.

### 3.2 Write paths silently no-op

This is the sharpest consequence and it is not visible from the read case. Because the
helpers are built on `query()`, a missing table makes a write **succeed and vanish**:

| Helper | Returns on missing table | Caller reads it as |
|---|---|---|
| `insertOne` | `rows[0]` → `undefined` | row created, id unreadable |
| `updateOne` | `null` | "no such row" (a 404, not a 500) |
| `softDelete` | `null` | "already deleted" |
| `queryOne` / `getOne` | `null` | "not found" |
| `findMany` / `getMany` | `[]` | "member has nothing" |

A `POST` that creates a Living Work against a missing `living_works` would return
success semantics with no row. Nothing in the stack reports a failure.

### 3.3 Asymmetry with `transaction()`

`transaction()` (`lib/db/postgres.ts:91`) has **no** `42P01` special case. The same
missing table therefore *throws* inside a transaction and *returns empty* outside one.
Identical SQL, opposite failure semantics, decided by whether the caller happened to open
a transaction. This is unreasoned divergence, not policy.

### 3.4 Caller handlers that can never fire (dead code)

These files import `query` (or the default `db`) **and** carry their own `42P01` /
`'does not exist'` branch. The error is swallowed one layer below, so the branch is
unreachable:

- `app/api/admin/command-center/field-engines/route.ts:86,198` — explicit `code === '42P01'`
- `app/api/members/profile/route.ts:48-50` — comments *"42P01 = undefined_table"*
- `app/api/commons/contributions/route.ts:34` (+ 5 sibling `commons/contributions/*` routes)
- `app/api/studio/energy/route.ts:43,85`
- `app/api/members/register/route.ts:85`, `members/magic-link`, `members/email-code{,/verify}`
- the `auth/{google,apple}` callback + status routes

That is **~20 files** whose authors independently wrote missing-table handling,
believing it would run. It does not. The degradation did not just hide the condition from
the UI — it hid it from every developer who tried to handle it correctly.

**Bounded scope note**: `app/api/supervision/*` (6 files) and `app/api/focus/*` (4 files)
also carry `42P01` branches but do **not** import `lib/db/postgres` directly — they reach
the DB via `SupervisionStore` / `FocusScheduler`. Whether their handlers are live depends
on what those services use. Not resolved by this pass; resolve before acting on those files.

### 3.5 What actually depends on the degradation in production

Production, last 168h (`docker logs maia-sovereign`):

- **7** `Missing table (graceful degradation)` events total
- **all 7 are one table: `lattice_nodes`**
- prod `public` schema holds **676** tables

`lattice_nodes` has **no migration anywhere in `database/`** — it is a phantom table. Its
sole consumer is `lib/memory/ConsciousnessMemoryLattice.ts` (imports
`query as dbQuery`), which `INSERT`s to it at line 502 and counts it at lines 583-632.
Those writes have been silently discarded for the life of the service.
`ConsciousnessMemoryLattice` is Cat 4 / dormant per the service matrix.

**So: across 749 importers and 676 tables, the degradation is load-bearing for exactly one
dormant service writing to a table that was never created.** Removing it breaks no live
member surface. It surfaces one long-hidden dormant-service defect.

### 3.6 Test coverage

Nothing pins this behavior. `lib/anchor/__tests__/loadRecentAnchors.test.ts:168` tests a
*caller-level* graceful-degradation path (`mockRejectedValue`, loader catches and warns) —
that is `loadRecentAnchors`'s own deliberate catch, a different and legitimately-chosen
policy, and it is unaffected by anything here.

---

## §4 Assessment against the options

**(a) Remove outright** — Production evidence supports this: 7 events / 168h, one
dormant-service phantom table, zero live member surfaces relying on it. Removal restores
`42P01` to parity with `42703` (which already propagates correctly), removes the
`transaction()` asymmetry, and revives ~20 dead caller handlers. Cost:
`ConsciousnessMemoryLattice` begins throwing where it silently no-ops. That is a defect
being *revealed*, not created — but it must be handled in the same change (create the
migration, or gate the dormant service), or a dormant Cat 4 service starts throwing into
live request paths.

**(b) Env-flag gate** — Preserves bootstrap tolerance for a fresh DB. But it makes
correctness environment-dependent: a dev run and a prod run of the same code would
disagree about whether a read failed, which is precisely the class of divergence that
makes the walk in §1 hard to catch. There is no existing precedent for such a flag in
`lib/db/*`. Weakest option.

**(c) Explicit table allowlist** — Narrowest and most faithful to original intent
(*telemetry tables may be absent; member tables may not*). Today the allowlist would
contain one entry: `lattice_nodes`. An allowlist of one, guarding a dormant service, is
better expressed as fixing that one service.

**Recommendation (not a ruling)**: **(a), with the `lattice_nodes` defect handled in the
same change** — plus the three sibling copies (§2) and the `transaction()` asymmetry
(§3.3) brought into line, so the policy is one policy rather than four. If a bootstrap
concern makes (a) uncomfortable, (c) scoped to an explicit named list is the acceptable
fallback; (b) should be declined.

**Constitutional note**: a system that reports "you have no works" when it could not read
is asserting a fact about the member's world that it did not verify. Under
*The Member's World is Primary*, that is not a degraded read — it is the platform
authoring a claim about the member's own work. That is the argument for (a) independent
of the operational evidence.

---

## §5 Not done here

No behavior changed. No file outside this document was modified. Open before acting:

1. Resolve §3.4's supervision/focus bounded-scope question.
2. Decide `lattice_nodes`: create the migration, or gate/remove the dormant writer.
3. Decide whether `packages/shared` and `apps/api` copies move with the ruling.
4. Decide whether `transaction()` parity is in scope or a follow-on.
