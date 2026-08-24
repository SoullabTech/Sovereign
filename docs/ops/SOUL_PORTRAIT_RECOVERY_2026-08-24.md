# Soul Portrait "disappearance" — CLOSED (read-only witness returned)

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

---

# WITNESS RESULT — 2026-08-24T19:47:52Z — **BRANCH 3: ACCOUNT/OWNERSHIP SPLIT**

Run from the Mac Studio against production. Classification: **rows exist under another Kelly
member ID.** The two-email hypothesis is confirmed. Nothing is lost, and **no write is required.**

## The split

| member_id | username | email | created | portraits | live sessions |
|---|---|---|---|---|---|
| `ce284751-e457-42f6-89b6-bc07d0876682` | Kelly | **kelly@soullab.life** | 2026-01-23 | **16** | 3 |
| `49ae4717-2b3a-4189-b25d-2bef95b1a45a` | soullab13cab | **soullab1@gmail.com** | 2026-02-03 | **0** | 35 ← *current browser* |
| `ed52e28f-…` | info | info@soullab.life | 2026-03-24 | 0 | 1 |

18 rows total: 16 Kelly (`ce284751`), 1 Jondi, 1 Cece Campbell. The browser is simply signed into
the Kelly account that has none. `/api/soul-portrait/mine` returning `[]` is the owner filter
working correctly on the wrong account — not deletion, not a filter bug.

Kelly's 16, most recent first: James McCullen · Tess Miller · Susan Bragg · Eric Stiller ·
Cece Campbell · Kristen Nezat · Cathrine Abbot Jones · Maia Pastor · Kimberly Daugherty ·
Stephen Clayton · Jason Ruder · Catherine ×2 · Andrea Fagan ×2 · `liveness-test-delete-me`.
Span 2026-07-08 → **2026-08-23** — active as of yesterday.

## Correction to the Phase 1 reading

Phase 1 concluded the 12 registry files were what Kelly was picturing. **That was wrong, or at best
half of it.** Kelly's memory of "MANY Soul Portraits" in Studio was accurate and referred to real
DB rows — 16 of them — created through `/soul-portrait/generate`. The Phase 1 findings still stand
on their own terms (registry intact, disjoint from the table, no deleting code), but the narrowed
"DB-backed history UNKNOWN" line was the load-bearing one, and it resolved against the guess.

The two sets are different bodies of work that overlap at two names: `catherine` and `andrea-fagan`
exist as both 2026-07-09 DB drafts and hand-authored registry files — the drafts look like the
generator runs those files were authored from.

## Integrity probes — CLEAN

```text
soul_portraits          n_tup_ins 24   n_tup_del 6   n_live_tup 18
soul_portrait_consents  n_tup_ins  9   n_tup_del 0   n_live_tup  9
orphaned_ledger_rows    0
```

- **24 − 6 = 18 closes exactly.** Every insert is accounted for; nothing is unexplained.
- **9 ledger rows = 9 `consent_state='active'` portraits**, 0 orphans. Every published portrait
  carries its consent record.
- The 6 deletes were therefore rows with **no ledger entries** — unconsented drafts (the surviving
  `liveness-test-delete-me` row shows that class was being made). The NO ACTION FK could not have
  permitted deleting a consented one.
- **`members` counters were reset at some point**: 42 ins − 20 del = 22, but 88 live. Database-wide
  `stats_reset` is NULL, so this was a per-table reset or a stats-file loss. `members` last
  autovacuumed 2026-07-01; `soul_portraits` was created 2026-07-02 — one stats-loss event on or
  before ~2026-07-01 explains both, and leaves `soul_portraits` counters covering its full life.
  Consistent with the exact 24−6=18 close. Recorded as a caveat, not an incident.

**No separate integrity investigation is warranted.**

## Recovery: zero writes

`/api/soul-portrait/mine` filters `owner_member_id = <session member>`. Signing in as
**kelly@soullab.life** makes all 16 appear. That is the whole fix — no ownership move, no
reconciliation, no migration.

One thing to check on sign-in: whether `ce284751` carries practitioner status. `/studio/*` gates on
`getCurrentPractitioner`; the current session (`49ae4717`) is the one with `practitionerId
717da53c-…` and Team Soullab. If `ce284751` is not a practitioner, the portraits are readable but
the Studio shell may not open for it — and *that*, not the portraits, becomes the real question.

```bash
# read-only, after signing in as kelly@soullab.life
curl -s https://soullab.life/api/studio/whoami        # expect memberId ce284751…
curl -s https://soullab.life/api/soul-portrait/mine   # expect 16 portraits
```

Only if `ce284751` cannot serve as the working practitioner account — or if `soullab1@gmail.com`
must be canonical for other reasons — does an ownership move become a Phase 2 candidate. That would
be a founder decision about which identity is canonical, with its own plan and rollback. It is not
authorized here, and it is not needed to see the portraits.

**No account merge. No member deletion.** Six Kelly-adjacent member records exist; consolidating
them is a separate, larger question that this incident does not settle.

---

## Held state after the witness

```text
SOUL PORTRAITS LOST?          NO — 16 intact under ce284751
WHY STUDIO SHOWS ZERO?        PROVEN — current member owns zero
TWO-ACCOUNT SPLIT?            PROVEN
OWNERSHIP RECONCILIATION?     CANDIDATE — not authorized
MOVE 16 PORTRAITS NOW?        NO
MERGE ACCOUNTS?               NO
DB DELETE ACTIVITY            SEPARATE OPEN QUESTION
```

Two read-only follow-ups, both verified against a live PostgreSQL 16 fixture before shipping:

**`scripts/kelly-identity-footprint.sh`** — answers *which identity is canonical*. It does not guess
table names: it discovers every FK into `members(id)` from `pg_constraint` and counts rows per
identity per table via `query_to_xml()`, so it covers surfaces nobody thought to list and cannot cite
a column that does not exist. Also reports practitioner status (the `/studio/*` gate) and session
recency. Encodes no decision — if the history is split across both identities there is no cheap act,
and canonical identity is a founder ruling, not a query result.

**`scripts/soul-portrait-delete-trace.sh`** — the six deletes get their own trace rather than a
dismissal. Its first question is whether evidence survives at all: if `log_statement = 'none'`, the
six cannot be identified from logs and no further searching will change that. The bounded finding
stands without any log — six *unconsented draft* rows, at an unrecorded time, with no consented or
published portrait possible among them (the NO ACTION FK refuses that delete) and the arithmetic
closing exactly. A hit in its §4 would contradict the Phase 1 "no code deletes portraits" finding and
re-open it.

### Note for whoever runs the reconciliation

`practitioners.member_id` is declared `ON DELETE CASCADE` in one of its three competing definitions.
Deleting a member would silently take their practitioner record with it. Another reason member
deletion is not on the table.

Unauthenticated `curl` against `/api/studio/whoami` and `/api/soul-portrait/mine` returns 401 and
proves nothing about `ce284751` — those routes need a real session. Test by signing into the browser
as kelly@soullab.life, or read practitioner status from §2 of the footprint census.

---

# FOOTPRINT RESULT — 2026-08-24T19:55:50Z — **ce284751 IS THE CANONICAL KELLY**

The census inverted the expected reading. `ce284751` (kelly@soullab.life) does not merely hold the
portraits — it holds **essentially the entire MAIA history**. The account the browser is signed into
is the thin one.

| surface | ce284751 kelly@ | 49ae4717 soullab1@ |
|---|---:|---:|
| `member_theme_signals` | **1268** | 34 |
| `relationship_entries` | **806** | 32 |
| `state_vectors` | **655** | 17 |
| `member_sessions` | **392** | 45 |
| `trust_observations` | **353** | 52 |
| `living_field_affinities` | **259** | 1 |
| `auth_sessions` | **235** | 41 |
| `member_memory_atoms` | **133** | 1 |
| `member_idea_blocks` | **106** | 0 |
| `team_messages` (sender) | **101** | 0 |
| `scribe_sessions` | **73** | 0 |
| `soul_portraits` | **16** | 0 |

**`ce284751` is a practitioner** — `practitioner_id 0776d427-d550-4da9-8944-cddc3619befa`. The
`/studio/*` gate will pass for it. That closes the open question from the witness.

## This reverses the earlier recommendation

The prior note said: *if the history sits under 49ae4717 and only the portraits sit under ce284751,
move 16 portrait rows.* **The data says the opposite.** Moving portraits to `49ae4717` would drag
16 rows toward the account holding ~1% of the history, stranding 1268 theme signals, 806
relationship entries, 133 memory atoms, and Kelly's entire Co-Lab message history.

**No write is correct here.** The act is to sign in as **kelly@soullab.life**.

## Not perfectly one-sided — the stranded remainder

`49ae4717` is not empty, and consolidation is not authorized on the strength of a lopsided table.
It leads in a few places:

| surface | ce284751 | 49ae4717 |
|---|---:|---:|
| `marketing_contacts` (practitioner_id) | 0 | **24** |
| `working_draft_revisions` (saved_by) | 1 | **3** |
| `member_manuscripts` | 1 | **2** |
| `manuscript_working_drafts` | 1 | **2** |
| `admin_role_grants` (target_id) | 0 | **2** |
| `oauth_accounts` | 0 | **1** |
| `manifestation_corpus` | 0 | **1** |

Signing in as `kelly@soullab.life` strands these. Small and bounded — 24 marketing contacts and a
couple of manuscript drafts — but real, and a separate decision from the portraits.

**Also found:** `49ae4717` has **two** practitioner rows (`fb0cb8b7…` and `717da53c…`, the latter
being what `/api/studio/whoami` reports). A duplicate practitioner record. Recorded, not touched.

## Interpretation boundary (founder, 2026-08-24)

§1 is a census of **direct FK ownership only**. Anything linked indirectly through a
session/practitioner/relationship object, held in legacy text columns or JSON, or carrying no FK to
`members(id)`, does not appear. The result looks decisively one-sided; that is a reason to check the
known indirect memory/session surfaces before any consolidation, not a reason to skip it.

Since the recommended act is a sign-in and not a write, that check is not blocking — it becomes
blocking only if consolidation is ever authorized.

## Delete-trace conclusion — narrowed (founder correction)

The script's earlier wording overreached. Corrected in `1b3f4751b`'s successor:

- **Proven:** none of the six carried a consent-ledger row. The NO ACTION FK refuses that delete, and
  `soul_portrait_consents` shows `n_tup_del = 0`, so no child was removed first to clear the way.
- **NOT proven:** that none was *published*. `publishOwnedPortrait` stamps `published_at` and does
  **not** write consent (`portraitStore.ts:181-190`), so a published-but-unconsented portrait was
  deletable. Publication is not what the FK protects.
- **`24 − 6 = 18` is supporting consistency, not identity reconstruction.** Counters do not retain
  row identity. The six cannot be named, and the arithmetic does not name them.
- The surviving `liveness-test-delete-me` row is *suggestive* of development cleanup, not evidence
  of it.

## Standing holds

```text
SIGN IN AS kelly@soullab.life     ← the act. zero writes.
MOVE 16 PORTRAITS                 NO — and now clearly the wrong direction
MERGE ACCOUNTS                    NO
DELETE ANY MEMBER                 NO (practitioners.member_id is ON DELETE CASCADE)
REVOKE SESSIONS                   NO
TOUCH FAMILY ACCOUNTS             NO
STRANDED 49ae4717 REMAINDER       open, small, separate decision
DUPLICATE PRACTITIONER ROW        recorded, untouched
DELETE TRACE                      separate lane, conclusion narrowed
```

