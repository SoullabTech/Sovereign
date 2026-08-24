# Soul Portrait "disappearance" — Phase 1 finding (read-only)

**Date**: 2026-08-24 · **Canonical branch**: `clean-main-no-secrets` · **Tip audited**: `e56e502ff`

## Verdict

**B — FOUND IN LEGACY STORAGE. All 12 Soul Portraits are intact, and no recovery write is
required.**

The claim is narrowed to exactly what the evidence supports (founder correction, 2026-08-24):

```text
Registry portraits       NOT LOST / NOT DELETED
DB-backed portraits      NO DELETION FOUND IN CODE
                         out-of-band DB history still UNKNOWN
```

"Nothing was deleted" is too broad. Code and git history are decisive about the registry and about
what the *application* can do; they cannot speak to manual SQL, a restore, or volume loss. Only the
DB witness closes that.

`{"portraits":[]}` from `/api/soul-portrait/mine` is the **expected** result for the 12 portraits
Kelly is looking for: they have never lived in the `soul_portraits` table the Studio index reads.
They live in the repository, in the file-based registry, and are served by a different route. The
empty array is not evidence that those 12 were lost. Whether *other*, DB-backed drafts once existed
and are now absent is a separate question, still open below.

## The two disjoint portrait universes

No code path connects them. Verified across the full 5,180-commit history.

| | **Registry (where Kelly's portraits are)** | **DB (what Studio reads)** |
|---|---|---|
| Storage | `lib/soulPortrait/portraits/*.ts` (git) | `soul_portraits` table (Postgres) |
| Index | `lib/soulPortrait/registry.ts` | `owner_member_id = <session member>` |
| Read route | `/soul-portrait/[slug]` (static, public) | `/api/soul-portrait/mine` → `/studio/soul-portraits` |
| Write path | hand-authored, committed | `POST /api/soul-portrait/generate` |
| Ownership column | none — no `owner_member_id` at all | `owner_member_id` |
| Kelly's content | **12 portraits** | 0 rows |

Because the registry rows carry no `owner_member_id`, they are structurally invisible to the Studio
index. They were never in it — the Studio index has only ever had two commits (`508ec2073`,
`f13948f92`) and neither ever imported the registry.

## The 12 portraits — all present at `origin/clean-main-no-secrets`

| slug | name | status |
|---|---|---|
| `andrea` | Andrea Nezat | live |
| `andrea-fagan` | Andrea Fagan | live |
| `augusten` | Augusten Lucas Nezat | live |
| `catherine` | Catherine Teresa Butler | live |
| `heather` | Heather Hampton | live |
| `jondi` | Jondi | live |
| `katie` | Katie Claire McCullen | live |
| `kelly` | Kelly Nezat | live |
| `nathan` | Nathan Kane | live |
| `sophie` | Sophie Claire Nezat | live |
| `summer` | Summer Angela Bell Skalos | live |
| `larry` | Larry Closs | **content intact; slug 404s** — withdrawn from the public registry by founder directive 2026-08-05 (`19a054ccf`), pending consent. Re-enabling is one import + one registry line. |

Reachable now at `https://soullab.life/soul-portrait/<slug>` (unauthenticated, statically generated,
unlisted — not linked from navigation).

## Evidence — decisive for the registry, code-scope only for the DB

1. **No portrait file was ever deleted, on any branch, in the entire history**
   (`git log --all --diff-filter=D -- '*soul*ortrait*'` → empty).
2. **No code has ever deleted a `soul_portraits` row.** The only `DELETE FROM soul_portraits` in
   history is commented-out teardown in `scripts/soul-portrait-demo-seed.sql` (`5bd8f8608`), scoped
   to the fixed demo UUID `00000000-0000-4000-a000-000000000d01` — not Kelly's.
3. **No code has ever updated `owner_member_id` after insert.** It is set once, at
   `portraitStore.ts:84`, from the session-verified member.
4. **Ownership has always been session-verified.** The auth hardening that stopped trusting a bare
   `x-member-id` claim (`5b4eff3d5`, 2026-06-09) *predates* the portrait pilot (`508ec2073`,
   2026-07-07), so no portrait was ever written under a client-asserted identity.
5. **The identity chain is consistent.** `/api/studio/whoami` and `/api/soul-portrait/mine` both
   resolve identity through the same `getMemberIdFromRequest`. The `practitionerId`
   (`717da53c-…`) is never used for portrait ownership.
6. **The query ran successfully against an existing table.** `listOwnedPortraitsWithSubject` has no
   try/catch and neither does the route — a missing table would return 500, not 200. HTTP 200 with
   an empty array means the table exists and matched zero rows.
7. **The `/mine` filter has no hidden predicate.** `WHERE sp.owner_member_id = $1` only — no
   soft-delete, archive, consent, published, or team filter, and the `studio_people` join is a
   LEFT JOIN, so it cannot drop rows.

## Residual question — OPEN (needs the DB witness)

This session has no SSH client (`ssh` absent, `~/.ssh` empty), no `DATABASE_URL`, and no route to
the LAN — `192.168.0.104:5432` is unreachable from this cloud container, though `soullab.life:443`
is. The three queries were therefore **not run**. This is environmental, not a permissions refusal.

They are packaged as **`scripts/soul-portrait-db-witness.sh`** — run it from the Mac Studio:

```bash
scripts/soul-portrait-db-witness.sh
```

Held state:

```text
PHASE 1                 COMPLETE
REGISTRY PORTRAITS      INTACT / NOT DELETED
DB-BACKED HISTORY       UNKNOWN
REGISTRY RECOVERY       NOT NEEDED
DB RECOVERY             NOT AUTHORIZED / NOT ESTABLISHED
NEXT                    corrected read-only DB witness
```

Structurally read-only: every statement runs inside `BEGIN READ ONLY` with
`default_transaction_read_only = on`, so a write would abort rather than execute. It covers the
three recorded queries plus two integrity probes that speak directly to out-of-band deletion:

- **§4 `pg_stat_user_tables.n_tup_del`** — deletes counted on `soul_portraits` since the applicable
  stats reset. `> 0` is **deletion activity detected**, not proof that a missing Kelly portrait was
  the row deleted. `0` is weaker evidence than `> 0`: counters are lost on crash recovery, and
  `pg_stat_reset_single_table_counters()` zeroes one table without touching the database-wide
  `stats_reset` timestamp — which is why that timestamp is reported separately, for context only.
- **§5 orphaned consent-ledger rows** — an orphan proves referential integrity was violated at some
  point, but not by what: a dropped or disabled constraint, a migration anomaly, a restore, or
  historical bad data all produce one. **Escalation signal, not a reconstruction of the event.**

Both were **verified against a live PostgreSQL 16.13 instance** built from the actual migrations
(`20260702000004`, `20260704000001`, `20260709000002`), not read off the schema:

- `pg_stat_user_tables` has **no** `stats_reset` column — confirmed `0` matching columns in
  `information_schema`, and selecting it raises `ERROR: column "stats_reset" does not exist`. With
  `set -e` + `ON_ERROR_STOP=1` the original script would have **died at §4, before §5 — the
  strongest probe — ever ran.** Now split across `pg_stat_user_tables` and `pg_stat_database`.
- The consent-ledger FK is **`confdeltype = 'a'` (NO ACTION)**, and a plain parent `DELETE` is
  refused: `violates foreign key constraint "soul_portrait_consents_portrait_id_fkey"`. **Corollary:**
  because the FK blocks it, any `n_tup_del` most likely reflects portraits that never had ledger
  rows — unconsented drafts.
- All **7 SQL blocks** in the script execute clean, exit 0, under `default_transaction_read_only`.
- The read-only guard **bites**: an `UPDATE` inside it fails with
  `ERROR: cannot execute UPDATE in a read-only transaction`, row unchanged.

### Classification (founder ruling, 2026-08-24)

| Result | Conclusion |
|---|---|
| `total_rows = 0` and `n_tup_del = 0` | **Architecture mismatch, not recovery.** Studio has never indexed the static registry. Close it. No Phase 2. |
| Rows exist, none under another Kelly identity | **No recovery incident.** Same conclusion. |
| Rows exist under another Kelly member ID | **Narrow Phase 2 — ownership reconciliation.** Still no write until the canonical identity is established and what moves is agreed. No account merge. |
| `n_tup_del > 0`, orphaned ledger rows, or rows visibly absent | **Deletion activity / integrity violation detected — investigate before classifying the portrait incident.** Neither signal names which row, or proves a Kelly portrait was affected. Establish when, by what, and what else that operation touched, before any restore; keep it on its own track. |

If the third row is what comes back, that is the only branch that opens a Phase 2, and it opens a
scoped one: repair `owner_member_id` linkage on existing rows. Nothing is recreated from memory.

## Why no write was made

Phase 2 was not entered. The portraits are not lost, so there is nothing to restore, and the two
systems were never joined. Backfilling the registry portraits into `soul_portraits` to make them
appear in Studio would **not** be recovery — it would be manufacturing ownership rows for portraits
about real, named people, one of whom (Larry Closs) is currently withdrawn precisely because his
consent has not been obtained. That is a new consent-bearing feature decision for Kelly, not an
incident remedy.
