# Member Identity Consolidation — Census Instrument + Plan (NO WRITES PERFORMED)

**Status:** plan only. Nothing has been changed, moved, merged, or deleted.
**Date:** 2026-08-24
**Subject:** two `members` rows for one human (Kelly); Soul Portrait ownership split.

---

## 0. Epistemic state before anything else

| Claim | Status |
|---|---|
| 16 Soul Portraits exist and are intact under `ce284751-e457-42f6-89b6-bc07d0876682` (`kelly@soullab.life`) | **PROVEN** (prior witness) |
| Studio shows zero portraits because the authenticated member `49ae4717-2b3a-4189-b25d-2bef95b1a45a` (`soullab1@gmail.com`) owns zero | **PROVEN** (prior witness) |
| Two distinct Kelly member identities exist | **PROVEN** (prior witness) |
| `kelly@soullab.life` / `ce284751…` should be canonical | **RULED** by Kelly, 2026-08-24 — a decision, not a measurement |
| What each identity owns table-by-table across the whole database | **UNKNOWN** — this is what the census below establishes |
| What the 6 counted `soul_portraits` deletes were | **UNKNOWN** — open question, deliberately not folded into the census |

**This session could not run the census.** It executes in a remote cloud container with no
`DATABASE_URL` and no route to minisforum. The instrument is written and reviewed here; the
run has to happen on minisforum. The plan below therefore has a filled-in *method* and an
empty *result table* — the result table is not guessed.

---

## 1. The instrument

`scripts/witness/member-identity-ownership-census.ts`

```bash
ssh soullab@minisforum 'docker exec maia-sovereign sh -c \
  "DATABASE_URL=\$DATABASE_URL npx tsx scripts/witness/member-identity-ownership-census.ts \
     ce284751-e457-42f6-89b6-bc07d0876682 \
     49ae4717-2b3a-4189-b25d-2bef95b1a45a"'
```

First uuid = canonical candidate (A). Second = legacy candidate (B). Labels only; the script
makes no ruling.

**What it does.** Discovers every member-referencing column two ways — (1) declared foreign
keys to `members(id)` via `pg_constraint`, (2) member-shaped `uuid`/`text` columns with **no**
FK declared (the silent ones; `soul_portraits.owner_member_id` is FK-declared, but the schema
also carries `member_id`, `user_id`, `practitioner_id`, `created_by`, `subject_member_id`,
`actor_member_id`, `invited_by` and ~20 more spellings, and not all are constrained). For each
column it counts rows under A and under B, then — only where **both** are non-zero — reads the
table's unique indexes and tests whether a blind rebind would violate one, by intersecting the
non-member columns of the unique key across the two identities.

**What it refuses to do.** No arbitrary member-scoped content is read. Output is limited to
schema/count information **plus identity/account metadata** (username, email, name, onboarding
state, `created_at`, `last_sign_in`) **for the two explicitly supplied candidate member ids** —
the two identities being reconciled, and nothing else. No conversation, journal, portrait, or
Sanctuary-governed material is selected or printed, for any member; non-candidate portrait
owners appear by uuid prefix only. The whole run is inside `BEGIN; SET TRANSACTION READ ONLY`,
so a write is refused by Postgres itself rather than by the script's good manners. It proposes
no SQL to execute.

**Failure isolation.** Every fallible probe (each count, each collision test, each trace query)
runs inside its own `SAVEPOINT`. Without that, the per-column error handling is decorative:
all probes share one transaction, so the first failure puts Postgres into aborted state and
every later probe returns `current transaction is aborted` — a single exotic column would
collapse the census into a wall of false zeros, defeating the `ERROR ≠ zero` rule this
instrument exists to hold. The savepoints keep failures local; the outer READ ONLY transaction
is untouched, so the no-write guarantee is unweakened.

**FK precision.** The declared-FK sweep constrains the *referenced* attribute to `members.id`,
not merely "references the members table" — a FK pointing at another unique member column
(`email`, `username`, `passkey`) is a different relationship and is not counted as an id
reference. Each column's comparison type is read from the catalog rather than assumed to be
`uuid`; a type the instrument cannot compare a member id against is reported uncounted, never
as zero.

**Output.** A markdown table (table · column · fk? · rows A · rows B · collision risk · merge
rule), a rule tally, and a JSON report at `/tmp/member-identity-census-<ts>.json`.

### Merge-rule classes the census assigns

| Rule | Meaning | Action implied |
|---|---|---|
| `NO_OP` | neither identity has rows | none |
| `CANONICAL_ONLY` | rows only under `ce284751…` | none — already correct |
| `REBIND_CLEAN` | rows only under `49ae4717…`, no uniqueness obstruction | candidate for rebind |
| `REBIND_CHECK` | rows under both, no collision detected | human read required — two identities may hold *different* real content |
| `COLLISION_MANUAL` | a unique key would be violated by a rebind | never automated; one row must be chosen and the loser preserved |
| `PROVENANCE_PRESERVE` | append-only ledger / event / audit / `_runs` / `_consents` | **never rewritten.** who acted is a historical fact, not a pointer |
| `SESSION_NO_REBIND` | auth/session/token state | not moved; let it expire, re-authenticate |
| `ERROR` | count failed (timeout, permission, exotic type) | re-run narrowed; never assumed zero |

`PROVENANCE_PRESERVE` is the load-bearing one. Consolidating an identity must not rewrite
history so that it reads as though the canonical member did things the duplicate did. That
would manufacture a past — the exact failure the Traceability Covenant and the consent ledger
exist to prevent. Ledger rows stay as recorded; continuity is achieved by *linking* the two
ids, not by overwriting the actor.

---

## 2. Recommended consolidation shape (to be confirmed against census output)

The prior witness already shows the asymmetry that matters: the legacy identity's mass is
**35 live sessions** — ephemeral auth state — while the canonical identity holds the 16
portraits, which are the irreplaceable artifacts. So the cheapest safe consolidation moves
*credentials*, not *content*.

**Option A — move the login, not the data (recommended).**
Point the credential Kelly actually signs in with at `ce284751…`, and retire `49ae4717…` as a
person. Data rows move only where the census proves real Kelly content sits under the legacy
id (`REBIND_CLEAN` rows). Portraits never move. Ledgers never move.
Constraint to respect: `members.passkey`, `members.username`, `members.email` are UNIQUE — any
credential transfer is a two-step through a parked value inside one transaction, never a
straight `UPDATE ... SET email = 'kelly@soullab.life'` while the other row still holds it.

**Option B — row rebind.** Only for the `REBIND_CLEAN` set the census names, one table at a
time, each inside its own transaction with a pre-count and post-count assertion.

**Option C — merge everything wholesale.** Rejected: it necessarily rewrites ledger actors.

**Not doing, in any option:** deleting either `members` row; moving the 16 portraits;
rewriting `soul_portrait_consents`; touching Sanctuary-marked material; collapsing sessions.

Retirement of the duplicate is a *soft* retirement — flagged/parked, not deleted — so the
provenance of every ledger row that names it stays resolvable.

---

## 3. Sequence (each step gated on the previous)

1. **Run the census.** Attach the markdown output and the JSON path to this doc.
2. **Fill §4 result table.** Named tables only — no category left as "probably nothing".
3. **Human ruling per `REBIND_CHECK` / `COLLISION_MANUAL` row.** Kelly decides; no default.
4. **Write the change script** (a separate reviewable file, single transaction per table,
   pre/post counts asserted, dry-run mode default-on). Not written yet, by design.
5. **`pg_dump` of `members` + every table the plan touches**, before the first write.
6. **Execute, verify, then re-run the census** — it is also the after-check: the same
   instrument that found the split proves the consolidated state.
7. **Verify the member-facing surface**: Studio shows 16 portraits under the canonical login,
   and the Co-Lab boundary gate still passes 31/31
   (`docker exec maia-sovereign sh -c 'DATABASE_URL="$DATABASE_URL" npx tsx scripts/verify-colab-boundaries.ts'`).

---

## 4. Census result — NOT YET RUN

_Paste the census table here. Do not fill from memory or inference._

| table | column | fk | rows ce284751… | rows 49ae4717… | collision risk | merge rule |
|---|---|---|---|---|---|---|
| _(pending run on minisforum)_ | | | | | | |

---

## 5. Open question, held separately: the 6 counted deletes

`pg_stat_user_tables` counts `n_tup_del = 6` on `soul_portraits`, with 18 live and 24 inserted.
The consent ledger showed 9 rows and 0 orphans, so no *consented* portrait lost its ledger.
That is consistent with the six deletes having been drafts, tests, or duplicates — and also
consistent with six real portraits gone. **The evidence does not distinguish these.**

The census script carries a clearly separated trace section (portraits-by-owner across all
members, table stats, and any consent events pointing at portraits that no longer exist) that
*narrows* the question. It does not answer it. `pg_stat` counters are cumulative and reset on
`pg_stat_reset()`/major restart, and deleted rows leave no tuple behind — a definitive answer
needs WAL/backup archaeology, which is its own bounded job and is **not** authorized here.

Do not let "16 portraits are intact" be heard as "nothing was ever deleted." Both statements
are currently true and separate.

---

## 6. Sovereignty check (CLAUDE.md §Before Making Changes)

- **Agency:** consolidation returns Kelly's own artifacts to the identity she signs in as. It
  adds no capability the system did not have.
- **Provenance:** the census reads schema/count information plus account metadata for the two
  named candidate ids only; the plan forbids rewriting ledger actors, so the record of *who did
  what, under which identity* survives consolidation intact.
- **Uncertainty preserved:** the delete question is named as open rather than closed by
  convenience; `ERROR` and uncounted rows are never read as zero — and the savepoint isolation
  is what makes that rule structurally true rather than merely intended; §4 stays empty until
  measured.
- **New responsibility created:** one canonical identity means one blast radius. Hence the
  dump-before-write, the transaction-per-table discipline, and the soft retirement of the
  duplicate rather than deletion.
- **Consent:** no Sanctuary-governed material is read, moved, or inferred at any step.
