# DEPLOYMENT-SAFETY-02 · SCHEMA / READER ORDERING CUSTODY — CENSUS

**Opened by founder ruling** 2026-09-14, after the read-only production preflight.
⛔ **CENSUS ONLY. No production write · no ordering repair · no merge · no schema
deploy · S3 NOT reopened · no branch gate, manifest, skip mechanism or
expand/contract architecture invented.**

Repository truth plus the founder's read-only preflight. ⛔ This session has no
production access (no `ssh` binary; `minisforum` does not resolve), so every
production fact below is the founder's reading, cited as such.

---

## 1 · THE TWO OLDER PENDING MIGRATIONS — RECONCILED, AND THEY ARE NOT WHAT THEY LOOK LIKE

> **⭐⭐ FINDING: these are not two units of pending work. They are a LEDGER/SCHEMA
> DIVERGENCE — the schema effects are already in production; only the ledger rows
> are missing.**

The evidence, in order:

| Fact | Source |
|---|---|
| Both files entered the tree **2026-09-06** via merge `66da58b4` (PR #1231) | `git log --diff-filter=A` |
| Both are **ABSENT at trunk `8b31d931c`** — the baseline's own trunk | `git cat-file -e 8b31d931c:…` |
| **Every object they create is present in `database/baseline/0001_baseline_2026-09-01.sql`** — `practitioner_directory_profiles` · `practitioner_connections` · `referral_requests` · `is_colleague` · `supervision_transcript_segments` · `practice_transcript_segments` · `text_enc` · `phi_encryption_status` | grep of the baseline |
| That baseline is *"the current known-good schema of the **production** database `maia_consciousness`, captured 2026-09-01"* | `docs/ops/DB_BASELINE_DESIGN_NOTE.md` §1 |
| Both filenames appear in the **517-entry baseline manifest** | grep of the manifest |
| The baseline **and** the two files entered the tree in the **same commit** | `git log -- database/baseline/` |

⭐ **So the objects existed in production while no migration file for them existed
in the tree.** They reached production by some route outside the tracked set; the
files describing that state arrived five days after the snapshot that already
contained it.

⭐⭐ **The custody defect in one sentence: a blank database bootstrapped today
would mark these two as ALREADY APPLIED and never run them, while production —
which never ran `bootstrap-database.sh` — will ATTEMPT them on its next full
deploy. Two environments disagree about the same two files, and the disagreement
is invisible until a deploy trips over it.**

**Would ordinary execution succeed?** Both are **fully additive and idempotent**:

```text
20260121_trusted_colleagues.sql      CREATE TABLE IF NOT EXISTS ×3
                                     CREATE INDEX IF NOT EXISTS ×6
                                     CREATE OR REPLACE FUNCTION is_colleague
                                     ⛔ no ALTER of an existing table, no DROP,
                                        no data statement

20260122_transcript_encryption.sql   ALTER … ADD COLUMN IF NOT EXISTS ×4
                                     CREATE INDEX IF NOT EXISTS ×2
                                     COMMENT ×4
                                     guarded DO block: acts only if
                                     phi_encryption_status EXISTS; upserts two
                                     tracking rows (⛔ not member content)
```

⭐ If the baseline's account of production still holds, **both execute as no-ops
and simply record their ledger rows.**

⚠️ **The one way they can still fail, named precisely:** `ADD COLUMN IF NOT
EXISTS` guards the *column*, never the *table*. If `supervision_transcript_segments`
or `practice_transcript_segments` were absent, that migration dies on `42P01` —
and, the runner being fail-fast, **every later migration including all three S3
files never runs, while the deploy (before `856db2cc`) still said "complete".**
The baseline says those tables exist; ⛔ that is evidence, not a current reading.

**⛔ The one remaining unread fact, and the whole reconciliation rests on it:**

```sql
-- read-only, on production
SELECT to_regclass('public.supervision_transcript_segments') IS NOT NULL AS supervision_segments,
       to_regclass('public.practice_transcript_segments')    IS NOT NULL AS practice_segments,
       to_regclass('public.practitioner_directory_profiles') IS NOT NULL AS directory_profiles,
       to_regclass('public.practitioner_connections')        IS NOT NULL AS connections,
       to_regclass('public.referral_requests')               IS NOT NULL AS referrals,
       EXISTS (SELECT 1 FROM information_schema.columns
                WHERE table_name='supervision_transcript_segments'
                  AND column_name='text_enc')                AS text_enc_present;
```

All true → **effects present, files are no-ops, divergence is ledger-only.**
Any false → **that object is genuinely missing and the migration is real work**,
which changes this census's answer and must be ruled on before any deploy.

⛔ **The false-ledger shortcut stays refused.** Inserting `schema_migrations` rows
without running the files would assert "applied" for content nobody verified
against the live schema — and with no checksum comparison it could never be
detected. If the effects are present, running them IS the reconciliation: the
statements do nothing and the ledger becomes truthful.

---

## 2 · THE EXACT SET A DELIBERATE S3 PRODUCTION ACT WOULD EXECUTE — **FIVE FILES, CLOSED**

```text
20260121_trusted_colleagues.sql                        ← divergence, §1
20260122_transcript_encryption.sql                     ← divergence, §1
20260913000001_ask_authorization_acts.sql              ← S3 M1
20260913000002_disclosure_boundary_developmental_ask.sql ← S3 M2
20260913000003_disclosure_gesture_authorize_sections.sql ← S3 M3
```

⭐ **The set is closed at the top:** nothing in the canonical tree sorts after
`20260913000003` (477 `.sql` files; the only later name is `README.md`). So the
S3 migrations are last, and the only thing that can block them is what precedes
them — which is exactly the two in §1.

---

## 3 · BACKWARD-COMPATIBILITY WITH THE READER THAT IS LIVE NOW

| Migration | Shape | Compatible with the CURRENT reader? |
|---|---|---|
| `20260121_trusted_colleagues` | new tables, indexes, one function | ⭐ **YES** — nothing existing is touched |
| `20260122_transcript_encryption` | nullable `ADD COLUMN`, indexes, comments, tracking upsert | ⭐ **YES** — old reader never selects the new columns |
| S3 **M1** | two new tables + triggers **on its own tables only** (its `DROP TRIGGER IF EXISTS` lines are idempotency guards on the objects it just created) | ⭐ **YES** |
| S3 **M2** | `context_disclosure_receipts.boundary` CHECK **widened** by one value | ⭐ **YES** — *widening* admits everything the old reader writes |
| S3 **M3** | `context_disclosure_receipts.gesture` CHECK **widened** by one value | ⭐ **YES** — same |

⭐ **Widening is the direction that is safe.** A narrowed CHECK would reject writes
the live reader still makes — the 2026-09-07 `circle_inquiries_status_check` shape.
These two go the other way, and the commented rollbacks in each file show the
original narrower sets, so the direction is verifiable rather than asserted.

⚠️ **One real interaction, not free:** M2 and M3 `DROP CONSTRAINT` then
`ADD CONSTRAINT … CHECK`, which takes `ACCESS EXCLUSIVE` on
`context_disclosure_receipts` and validates existing rows. Brief, but a live
reader minting a Focus receipt in that instant **waits on the lock**. Compatible,
⛔ not instantaneous — and worth saying out loud rather than rounding to "additive".

---

## 4 · IS MIGRATE-BEFORE-SWAP SAFE FOR THIS EXACT SET?

⭐ **YES — for THIS SET, on the evidence above, conditional on §1's unread fact.**
Every one of the five is additive or widening, so applying all five and then
failing the swap leaves the **old reader running against a superset schema it
neither reads nor is rejected by.**

⛔ **And that is precisely as far as the answer goes.** The founder's constraint is
the load-bearing one: *the deploy path is generic, and the production pending set
demonstrably contains migrations outside S3.* Today's set is additive by accident
of what happens to be pending — ⛔ not by any property of the path. A global
reorder justified by "S3 looks additive" would be a general change licensed by a
particular case, and the next pending set is not bound by this one.

---

## 5 · THE SMALLEST MECHANISM — AND THE HALF OF IT THAT ALREADY EXISTS

The four required properties, against what the repository actually has:

```text
migration failure → candidate reader never live      ORDERING   (does not exist)
migration success → swap may proceed                 ORDERING   (does not exist)
swap failure after migration → old reader safe       COMPATIBILITY (does not exist)
success → schema and reader agree                    both
```

⭐ **Properties 1 and 2 are a shell-ordering change** — `run_migrations_or_abort`
is already a discrete fail-closed step (`856db2cc`); moving it above
`deploy_ctx_compose up -d` delivers both. ⚠️ **That move would also falsify text
`856db2cc` deliberately wrote**: its abort message says *"The container swap
already happened"* and routes to `rollback`. ⛔ Named here, not repaired.

⭐⭐ **Property 3 is NOT an ordering property and cannot be bought with a line
move.** It requires knowing whether the pending set is safe under the old reader.
Nothing in the repository classifies that today (searched: no compatibility
header, no expand/contract convention, no gate).

⭐ **But the expression of "this reader requires this schema" already exists** —
`database/required_migrations.txt` + `lib/db/schemaGate.ts` + `scripts/ensure-migrations.sh`.
⚠️ Three limits make it insufficient as-is, all worth the founder knowing:
1. it is **opt-in per route** — only `between/chat`, `ready` and `sovereign/app/maia/list` call it; ⛔ the developmental Ask route does not;
2. it asserts the **reader's** requirement, never the **old reader's tolerance** — a different question;
3. ⭐⭐ **it reads the LEDGER, so it inherits §1's divergence exactly** — listing either divergent file there today would block boot on a schema that already has the objects.

**Options, smallest first. ⛔ Recommended, not taken.**

**O1 · Deliberate act, no new mechanism.** Reconcile §1, then run merge + schema
deploy as one founder-supervised act with the §3 table as its compatibility
review. ⭐ Fits the ruling exactly and invents nothing. ⚠️ The property is held by
a person each time, not by the program.

**O2 · Ordering only (properties 1–2), compatibility still human.** Move the
migrate step above the swap and correct the `856db2cc` text. ⭐ Small and real.
⛔ **Buys property 3 for nothing** — it converts *reader-without-schema* into
*schema-without-matching-reader*, which is only safe because today's set happens
to be additive. ⛔ Should not ship as if it delivered the founder's end-state.

**O3 · Ordering + a declared compatibility fact per migration.** O2 plus one
machine-readable line per file (e.g. `-- reader-compatible: yes|no`), with the
migrate-first path refusing to run when any pending file says `no` or says
nothing. ⭐ Delivers all four properties and is the smallest thing that does.
⚠️ It is a new convention over 477 existing files, and an unannotated file must
**fail closed**, which makes the first run a backfill exercise.

**O4 · Static classification by SQL shape** (additive/widening vs
DROP/narrow/NOT NULL/rename/data-mutating). ⭐ No author annotation. ⛔ Fallible in
both directions on a corpus this size, and a *wrong* GREEN here is exactly the
failure the mechanism exists to prevent. ⛔ Not recommended.

**O5 · General expand/contract architecture.** ⛔ Explicitly excluded by the
ruling, and the census found no evidence it is required.

⚠️ **A THIRD WINDOW, FOUND IN PASSING AND NOT OWNED HERE:**
`pre-deploy-gate.sh deploy-maia` — the quick path — **runs no migrations at all**
and mentions none. A reader needing new schema, shipped that way, meets no
migration step to fail closed and no ordering to fix. ⭐ Ordering custody over
`deploy`/`update` does not reach it. ⛔ Named, not opened.

---

## 6 · STANDING

```text
DEPLOYMENT-SAFETY-02        🟡 CENSUS COMPLETE · repair NOT authorized
§1 reconciliation           LEDGER/SCHEMA DIVERGENCE · effects believed present
                            ⛔ ONE read-only production query still owed (§1)
§2 pending set              CLOSED · 5 files · nothing sorts after S3
§3 compatibility            all five ADDITIVE or WIDENING · one brief ACCESS
                            EXCLUSIVE window on context_disclosure_receipts
§4 migrate-before-swap      SAFE FOR THIS SET · ⛔ not a licence to reorder globally
§5 smallest mechanism       O1…O5 given; half the expression already exists and
                            inherits the §1 divergence

quick-path gap              NAMED · NOT OPENED
S3 ROUTE-INTEGRATION        ✅ CLOSED · 6ec5ff1d · NOT reopened
DEPLOYMENT-SAFETY-01        ✅ PASS · 856db2cc
MERGE                       ⏸ HOLD
SCHEMA DEPLOY               ⛔ NOT AUTHORIZED
PRODUCTION                  UNTOUCHED · no write in this act
```

Stop for ruling.
