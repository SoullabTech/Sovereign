# PT-3 enforcement — build, and the §XI return gate

**Authority:** FOUNDER RULING — Writer's Studio (2026-09-08) §IX–XI. Bounded BUILD authorized.
**Status:** BUILT · witnessed on disposable infrastructure · ⛔ **DEPLOYMENT HELD** — returning before production, as required.

| Run of record | Result |
|---|---|
| `scripts/witness/pt3-enforcement-witness.ts` (the §XI gate) | **24 passed · 0 failed** |
| `scripts/witness/pt3-source-custody-falsifier.ts` (the original attacks, rerun) | **25 passed · 0 failed · 0 structurally-unenforced** |
| `npm run typecheck` | 0 regressions |
| `npm run check:no-supabase` | clean |
| jest — writers-studio · manuscript · press | 1865 passed; **14 pre-existing failures, unchanged on a clean tree** |

> ⭐ **The three attacks that succeeded on 2026-09-08 are now refused, and their SQL is byte-identical.**
> `git diff` over the falsifier shows no change to any attack statement. What changed is the
> architecture around them: the fixture had to start using the seam, and the teardown had to
> commission an erasure. **That the test's own cleanup could no longer delete Source is itself
> evidence the boundary is real.**

---

## 1. What was built

**`database/migrations/20260908000001_pt3_source_custody_enforcement.sql`** (idempotent, applied and
re-applied cleanly on a disposable cluster built from this repository's own migrations):

- **`maia_app`** — a `NOSUPERUSER` application role. Broad authority everywhere, narrowed on the
  protected tiers: `SELECT` + `INSERT` on arrivals, `UPDATE (manuscript_id)` for claim bookkeeping,
  `SELECT` only on `manuscript_sections`, `manuscript_source_representations` and
  `source_lifecycle_acts`.
- **`manuscript_source_representations`** — identity for a representation, carrying its custody as a
  column (`CHECK ((custody = 'source_custodied') = (arrival_id IS NOT NULL))`), so §II's atomicity is
  structural rather than procedural. `manuscript_sections.representation_id` joins to it; existing
  rows were backfilled without touching heading, body, position, depth or signal.
- **`source_lifecycle_acts`** — append-only, enforced by its own trigger. Currency is **derived**
  from it (`source_operative_representation`, `source_operative_arrival`); `is_current` on a
  protected row was refused, not deferred.
- **The seam** — `source_extract`, `source_re_extract`, `source_replace_lineage`,
  `source_withdraw_representation`, `source_commission_erasure`, all `SECURITY DEFINER` with pinned
  `search_path`, owned by the migration authority, `EXECUTE` granted narrowly.
- **Defence in depth** — `pt3_sections_refuse` / `pt3_arrivals_refuse`, scoped to content columns
  and `DELETE`, installed by an authority `maia_app` cannot disable.

**Application side:** `lib/manuscript/source/lifecycle.ts` (the seam's typed API); the import route
now creates representation and custody in one act; `verifyCustody` reads the operative arrival
instead of the first by `created_at`; `eraseManuscript` commissions erasure by name.

**Deploy side:** `scripts/run-sql-migrations.sh` now records `checksum`, `applied_by_authority`,
`applied_by_commit` and `applied_run_id`. **No human actor is fabricated** (§VIII). Verified by
running the real runner against the disposable database: `auth=soullab commit=witness-test-sha
run=run-witness-1 sum=b88b381002`.

---

## 2. ⚠️ Found while building — one constraint made §V unrepresentable

`manuscript_sections` was `UNIQUE (manuscript_id, position)`. **That silently encoded "one
representation per Work":** a second representation's positions collided with the first's, so
re-extraction and replacement were not merely unimplemented, they were **impossible to express**.
The build hit it as a duplicate-key error on the first re-extraction.

Position is meaningful *within a cut* — two cuts of the same arrival each legitimately have a
section at position 0 — so the uniqueness moved to `(representation_id, position)`.

**Its consequence is the reason item 12 was in the authorization.** Once several representations can
stand, every read of "the sections of this manuscript" becomes ambiguous. Ten such reads existed;
each is now scoped to the operative representation, with `COALESCE(source_operative_representation(…), representation_id)`
falling back to prior behaviour where no lifecycle act is known — **a Work is never hidden from its
author by an absent record.** Reads that join by section id were unaffected and were left alone.

---

## 3. The §XI return gate — evidence

### Ordinary authority CANNOT (10 checks, all as `maia_app`)

| | | Evidence |
|---|---|---|
| O1 | update protected Source content | `permission denied` (was A3.2 — 2 rows) |
| O2 | delete protected Source content | `permission denied` (was A3.3 — 1 row) |
| O3 | rewrite the Historical Source | `permission denied` (was A4.1 — 1 row) |
| O4 | disable the constitutional refusal | `must be owner of table` |
| O5 | create a representation outside the seam | `permission denied` |
| O6 | smuggle content through bookkeeping | `permission denied` — the mixed statement is refused, not just the forbidden one |
| O8 | declare currency without performing the act | `permission denied` on `source_lifecycle_acts` |
| O9 | erase by cascade with no act named | `PT-3: destruction … refused — erasure must be commissioned as erasure` |
| O10 | be the owner credential | `current_user=maia_app superuser=false` |

### Lawful authority CAN (8 checks)

import a Historical Source · create a representation **with** its custody in one act · **create
nothing at all when custody cannot be established** (atomicity proven by its negative) · re-extract
(new representation, earlier digest unchanged, currency moved) · replace a lineage (former text
intact) · withdraw (currency gone, **rows still present**) · perform custody bookkeeping · erase —
and only once commissioned.

### Historical truth (4 checks)

The recovered history reads
`extraction → arrival → re_extraction → re_extraction → replacement ×4 → withdrawal`, with reasons
preserved (`member replaced the file`, `not what I meant`), three representations retained
unrewritten, and **the erasure acts still present after the content is gone** — what was erased is
recoverable as a fact, without its content.

### Deployment evidence (3 checks)

The ledger carries attribution; this migration is attributable to its authority, commit and run;
protected tiers are owned by `soullab`, not `maia_app`.

---

## 4. ⛔ What is NOT done, and must not be read as done

1. **The credential change is not made.** `maia_app` exists in the migration; nothing points the
   application at it. **Until `DATABASE_URL` names `maia_app`, every grant and trigger here is inert
   — a superuser is refused by nothing.** This is deployment work, held by §X, and it is the single
   step that turns this from a demonstrated architecture into an enforced one.
2. **`maia_app` has no password set by the migration.** Deliberate: a credential minted inside a
   migration file is a credential in version control. Setting it belongs to deployment custody (§V/§VII).
3. **S1 and S3 of the migration-custody design are not built** — the owner credential is not yet
   withheld from runtime environments, and no per-role DDL logging or event trigger exists.
4. **No member-facing lifecycle UI.** Re-extraction, replacement and withdrawal are reachable only
   from the seam; no route calls them. Erasure's existing member act is unchanged in behaviour.
5. **Not authorized and not touched:** Encounter · Restore · hierarchy · intention authority ·
   Work→Work lineage · Experience implementation · WS2-08B.
6. **Production is untouched.** These runs are against a disposable cluster, destroyed afterwards.
   ⚠️ On a real deployment the backfill in §2 of the migration will run against live data; it writes
   only the new `representation_id` column and new rows, but it has been exercised only on fixture
   data and should be read before it is deployed.
