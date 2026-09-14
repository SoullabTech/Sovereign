# S3 · DEPLOYMENT-CUSTODY CENSUS — CAN MERGE BE SEPARATED FROM SCHEMA EXECUTION?

**Opened by founder ruling** 2026-09-14, alongside `MERGE ⏸ HOLD`.
**Question, bounded:** *Can the proved S3 branch be merged to `clean-main-no-secrets`
without thereby authorizing or accidentally causing its schema migrations to
execute on an unrelated production deployment?*

⛔ **CENSUS ONLY.** No merge · no schema deploy · no production change · no
repair · no S3 architecture reopened. Repository truth only — ⛔ **no production
database or host was read.**

---

## 1 · HOW MIGRATIONS ARE DISCOVERED AND APPLIED

The production path is the `migrate` compose service running
`scripts/run-sql-migrations.sh`. Mechanically, in full:

```sh
for f in /app/database/migrations/*.sql; do        # flat glob, whole directory
  filename=$(basename "$f")
  grep -Fxq "$filename" "$applied_tmp" && continue # ledger membership, by NAME
  psql -v ON_ERROR_STOP=1 -c "BEGIN;" -f "$f" -c "COMMIT;" || exit 1
  INSERT INTO schema_migrations (filename) …
done
```

⭐ **Selection is set-membership against `schema_migrations.filename`, over the
whole directory of the DEPLOYED COMMIT.** The directory is bind-mounted from the
immutable-SHA snapshot (`docker-compose.production.yml:548-554`), so the set that
runs is the set in the tree at the deployed SHA.

⛔ **There is no manifest, no allowlist, no skip list, no ordering file, no
per-migration flag, and no environment gate.** A repository-wide search for
`SKIP_MIGRATION|MIGRATIONS_ENABLED|NO_MIGRATE` returns **zero hits**. The
`checksum` column exists and is **never populated or compared** — editing an
applied migration is silently ignored, as `database/migrations/README.md` states.

**Every other applier globs the same way, flat:** `scripts/apply-migrations.sh`
(`files=("$MIG_DIR"/*.sql)`) and `scripts/bootstrap-database.sh`.

**Which entry points migrate:**

| Entry point | Runs migrations? |
|---|---|
| `deploy-production.sh deploy <SHA>` | **YES** — `--profile migrate run --rm migrate` |
| `deploy-production.sh update` | **YES** — same, after `git pull` on the checkout's current branch |
| `deploy-production.sh migrate` | **YES** — migrations only |
| `pre-deploy-gate.sh deploy-maia <SHA>` | **NO** — no mention of migrate anywhere in the script |
| bare `docker compose up -d` | **NO** — the service is behind `profiles: ["migrate"]` |
| CI `deploy.yml` | **Not triggered** — `push: [main, production]`; a merge to `clean-main-no-secrets` fires nothing |

⚠️ **A failed migrate step does not fail the deploy.** `deploy-production.sh:477-497`
`log_warn`s and proceeds to `log_success "Deployment complete!"`. Combined with
`exit 1` on the first failing file, this means: **a green deploy is not evidence
that any migration ran**, and one unrecorded failing file blocks every
lexicographically later file — S3's `20260913*` sit near the end of the glob.

---

## 2 · DOES MERGE ALONE CHANGE THE SET THE NEXT DEPLOY EXECUTES?

**YES. Mechanically, and by exactly three files.**

```text
git ls-tree origin/chore/s3-class-b-phase-20260913 database/migrations/
  minus  origin/clean-main-no-secrets database/migrations/
→ 20260913000001_ask_authorization_acts.sql
  20260913000002_disclosure_boundary_developmental_ask.sql
  20260913000003_disclosure_gesture_authorize_sections.sql
```

These are the *only* migration-directory delta. After a merge they are present at
the canonical tip, absent from the production ledger, and therefore **pending for
the next full deploy by whoever runs one, for whatever unrelated reason.**

⭐ **This is the 2026-09-07 finding, witnessed a second time, in advance instead of
in retrospect.** That finding was established on the I0.5 migrations *after* they
had already reached production by an unattributed act, and again directly when a
voice-fix deploy carried `20260907000001_vault_erasure_queue.sql`. The mechanism
is not a hypothesis; it is the ordinary semantics of this path.

⛔ **The founder gate sits on the DEPLOY decision. Nothing gates the BRANCH.**

Two further custody facts, for completeness:

- `update` runs `git pull` on the **shared checkout's current branch**, so "what
  deploys next" is partly a property of the minisforum working tree, not only of
  canonical.
- The canonical PR gate disclaims this authority in its own header: *"A green run
  does NOT establish … that a migration is safe to apply to the production
  database."* (`canonical-pr-quality.yml:26-27`)

---

## 3 · CAN THE MIGRATION BE PRESENT IN THE MERGED TREE AND MECHANICALLY WITHHELD?

**Not by any mechanism that exists.** The only lever the runner offers is the
ledger, and there are exactly two ways to put a filename in it:

1. **Apply it** — which *is* the schema deploy this ruling withholds.
2. **Insert the row without running the file** — ⛔ a false ledger entry. It would
   permanently mask the real migration (set-membership by filename, no checksum
   comparison), so the schema would never afterwards be applied by the normal
   path. ⛔ Not lawful withholding; it is destroying the record to simulate one.

⭐ **One mechanically real alternative exists and is NOT new architecture:** the
glob is `*.sql`, non-recursive, in **every** applier. A file under
`database/migrations/pending/` is invisible to all of them, and because the ledger
keys on `basename`, moving it back later applies it under the same identity. §5
weighs it.

---

## 4 · DOES A WITHHOLDING MECHANISM ALREADY EXIST? — NO, AND THE REPO SAYS WHY

⛔ **No.** And the repository has already faced this exact situation once and
answered it differently.

`database/migrations/README.md` → *Retired migrations* →
`20260802000001_coach_facilitator_field.sql`: merged (PR #898), **never applied in
production**, judged unsafe, and **removed from trunk by revert** (PR #910). The
invariant it established is stated there verbatim:

> **When a merged migration is unsafe and has never executed in any protected
> environment, correcting the migration history before execution is safer than
> adding a later blocking migration.**
>
> *A migration can be absent from production and still be dangerous while it
> remains executable in the path to production.*

⭐ **That second sentence is this census's answer restated by the repository
itself**: presence in the merged tree IS the exposure. The precedent's remedy was
removal, ⛔ not a withholding mechanism — because none exists.

⚠️ **The README also forbids the tempting shortcut**: each migration commits in
**its own transaction**, so a later "blocking" migration cannot neutralize an
earlier one — the state exists by the time the guard runs.

⭐ **And a constraint that binds any option below** — README rule 4: *"Schema and
reader ship together — a migration and the code that reads its tables belong to
the same deploy."* ⛔ **The coupling is therefore not merely mechanical; it is
architectural.** Withholding the schema while merging the reader does not produce
a safe partial state — it produces a reader whose tables do not exist.

**Scoped precisely:** the S3 route touches no S3 table on the no-body path (ACT 1
returns before `mintAct`). Only a **body-requiring developmental Ask** reaches
`mintAct`, which would throw against absent tables → 500. ⚠️ **The decisive fact
is unread here:** whether any member in production can reach a body-requiring
developmental Ask — which needs a frozen developmental reading to exist. The
Develop surface carries **no founder gate and no middleware gate** (checked:
`app/writers-studio/develop/page.tsx`, `middleware.ts`); authority is ownership at
the API. ⛔ Whether any such reading or Work exists in production is a production
read this census did not perform, and must not be assumed either way.

---

## 5 · THE 56 REFUSED LEGACY MIGRATIONS — CORRECTED, AND NARROWED

⚠️ **The witness's caveat was true but is narrower than it reads, and the honest
correction belongs here rather than in a later silence.**

`database/baseline/0001_baseline_2026-09-01.sql` + `.manifest` (**517 entries**)
exist, and `scripts/bootstrap-database.sh` is the canonical way to start a blank
database: apply the baseline, **seed the ledger from the manifest**, then migrate
the delta. ⛔ The witness shadow did not do that — it replayed the **raw chain**
against an empty cluster, which is a mode the repository already documents as not
supported: *"it makes no claim that every migration in the tree is individually
replayable from empty (**32 of them are not, by record**)."*

Spot-check: `20251229000001_create_selflet_chain_tables.sql`,
`20260112000001_corpus_environment.sql` and `20260629000001_encounters.sql` — all
three are **in the baseline manifest**.

⭐ **Consequence for this ruling: the 56 are an artifact of how the shadow was
built, not a property of production's pending set, and not evidence that the
production migrate path is broken.** They remain recorded, not normalized away —
but they should not be carried forward as if production were about to replay
them.

⚠️ **What does survive, and is the real interaction:** the runner is
**fail-fast-and-ignored** — `exit 1` on the first failing file, `log_warn` at the
deploy. So *any* unrecorded file that fails ahead of `20260913*` silently
prevents S3's migrations from running while the deploy still reports success.
⛔ Whether production's ledger currently leaves any such file unrecorded is an
**unread production fact**, and is the one thing that would have to be read before
a schema deploy — never inferred from a green deploy.

---

## 6 · THE SMALLEST LAWFUL OPTIONS

⛔ **Recommended, not taken.** The choice is the founder's.

**Option 1 — HOLD THE BRANCH UNMERGED (status quo; zero new mechanism).**
Merge and schema stay one act, deferred together. ⭐ Honest: it does not pretend a
separation exists. ⚠️ Cost: proved code sits outside canonical and accrues
drift against a moving `clean-main-no-secrets`; the longer the hold, the larger
the eventual merge and the weaker the witness's grip on what is merged.

**Option 2 — MERGE THE CODE WITHOUT THE THREE MIGRATION FILES.**
⛔ **Refused on the evidence.** It violates README rule 4 directly and lands a
reader whose tables do not exist. It converts a governed pause into a latent
runtime break whose blast radius is exactly the unread production fact in §4.

**Option 3 — MERGE WITH THE THREE FILES PARKED UNDER `database/migrations/pending/`.**
Mechanically sufficient — invisible to every flat glob; the basename identity
survives the later move. ⚠️ But it carries Option 2's architectural defect
unchanged (reader merged, tables absent), adds a convention with **no precedent
in this repository**, and creates a new way to forget: a parked migration looks
merged. ⛔ Not smaller than Option 1 in anything that matters — only in git
topology, which is precisely where the founder ruled authority must not be
smuggled.

**Option 4 — AUTHORIZE MERGE + SCHEMA DEPLOY AS ONE DELIBERATE PRODUCTION ACT.**
The ruling's own outcome (B). Preconditions this census can already name, ⛔ none
of them authorized here: read production's `schema_migrations` for any unrecorded
file sorting before `20260913*` (§5) · read whether a body-requiring developmental
Ask is reachable (§4) · run the deploy by the full path with a rollback tag ·
verify the three filenames landed in the ledger afterwards, ⛔ **never inferring
it from "Deployment complete!"**.

**Option 5 — CLOSE THE BRANCH GATE FIRST (the lane 2026-09-07 already opened).**
The defect is not S3's; it is that *merging a migration to canonical is, in
effect, authorizing whoever deploys next to apply it.* ⭐ The census's evidence
says this is the only option that makes the separation **real rather than
per-deploy discipline** — and it is also the largest. ⛔ It is a deployment-lane
act, not an S3 act, and opening it is a separate founder decision.

---

## 7 · THE ANSWER, PLAINLY

> **B. Current mechanics couple merge and schema execution — and README rule 4
> says they are coupled by design, not merely by accident of tooling.**

⭐ There is no existing mechanism that keeps a migration in the merged tree and
withholds it from production. The one mechanical trick that would work (§3) does
not reach the architectural half of the coupling (§4), and the repository's only
precedent for "merged but must not execute" was **removal from trunk** (§4).

⛔ Nothing here argues for modifying the S3 implementation. The census found no
reason to: this is deployment custody, exactly as ruled.

```text
S3 ROUTE-INTEGRATION      ✅ CLOSED · 6ec5ff1d · witness e5241151 · closure 69bde664
MERGE                     ⏸ HOLD — census answers B
SCHEMA DEPLOY             ⛔ NOT AUTHORIZED
PRODUCTION                UNTOUCHED · UNREAD
thread-store finding      OPEN · ROUTED OUT
branch-gate lane          NOT OPENED
```

Stop for ruling.
