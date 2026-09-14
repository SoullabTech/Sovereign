# DEPLOYMENT-SAFETY-02 · O1 — CANDIDATE-PINNED SCHEMA-FIRST RUNBOOK

**Founder ruling** 2026-09-14 — **O1 selected, bounded to this exact production
act.** ⛔ O2, O3, O4, O5 NOT authorized.
**§1 closed by the founder's read-only production query:** `t|t|t|t|t|t` — all six
objects present. The two older files are **ledger/schema divergence only**.

⛔ **NO PRODUCTION WRITE · NO MIGRATION EXECUTION · NO MERGE · NO SCHEMA DEPLOY ·
NO S3 CHANGE · NO O2/O3 IMPLEMENTATION.** This act derives and proves the
runbook. Executing it is a separate founder act.

---

## 1 · THE CUSTODY POINT, CLOSED

`deploy <SHA>` materializes an immutable named candidate. `cmd_migrate` takes no
SHA and runs compose from the **shared production checkout**. Sequencing them by
hand — *pull, migrate, deploy `<SHA>`* — would reintroduce exactly the
checkout/provenance ambiguity the deploy path was built to eliminate.

⭐ **The runbook materializes the candidate ONCE and derives both the migration
tree and the reader image from that single snapshot.** The mechanism already
exists and needed no invention: `docker-compose.production.yml` bind-mounts

```yaml
${MAIA_BUILD_CONTEXT}/database/migrations:/app/database/migrations:ro
${MAIA_BUILD_CONTEXT}/scripts/run-sql-migrations.sh:…:ro
```

so after `deploy_ctx_assert_and_materialize <SHA>`, the migrations that RUN are
the candidate's **by construction** — and `deploy_ctx_compose` independently
refuses any compose file outside the snapshot ("refusing a two-source deploy").

---

## 2 · THE RUNBOOK — `scripts/s3-schema-first-runbook.sh <SHA>`

```text
lock ─ materialize <SHA> ─ assert pending set ─ BUILD ─ verify image
     └─ MIGRATE (fail closed) ─ tag ─ SWAP ─ verify running ─ Co-Lab gate
```

⭐ **Build precedes migrate deliberately.** A build failure must cost no schema
change at all — and building is not swapping: no container is replaced until the
migrations have succeeded.

⭐ **Act scope is data, and it is re-read at execution time.** The five expected
filenames are hardcoded; the pending set is recomputed from the *candidate's own*
tree against the live ledger and must match exactly. ⛔ A sixth pending file, or a
narrower set, stops the act before any migration. **That refusal is what keeps a
one-off safe set from being promoted into an unproven universal deployment law.**

⛔ `deploy-maia` is never invoked — it runs no migrations, so it cannot fail
closed on one. ⛔ No `DEPLOY_ALLOW_HEAD`: this act names its candidate or does
nothing.

### Failure semantics

```text
build fails       → no migration, no swap; current reader untouched
migration fails   → candidate reader NEVER becomes live; current reader live
swap fails        → current reader live against the already-proved-compatible
                    SUPERSET schema (census §3: all five additive or widening)
verify fails      → same, and the operator is routed to a READER rollback;
                    ⛔ no schema rollback is implied
success           → candidate reader and S3 schema agree
```

### Execution (a separate founder act, not performed here)

```bash
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN \
  && git fetch origin clean-main-no-secrets \
  && scripts/s3-schema-first-runbook.sh <SHA-of-the-merged-candidate>'
```

⚠️ The SHA must be one whose tree contains all five files — i.e. **after** the S3
merge. ⛔ The merge itself remains on HOLD and is still the founder's act.

---

## 3 · THE PROOF — `npm run verify:s3-runbook` · **19 passed · 0 failed**

The REAL function is traced out of the REAL script with every docker-touching
seam stubbed. No docker, no database, no network, no production.

```text
ORDER      MIGRATE strictly precedes SWAP
           BUILD precedes MIGRATE
           happy path exits 0

CUSTODY    migrations run from the materialized snapshot of the named SHA
           build, migrate and swap all derive from ONE snapshot
           the running container is verified against the SAME named SHA

FAILURE    migration failure → candidate reader NEVER becomes live · non-zero
           build failure     → no migration and no swap
           swap failure      → non-zero, after a migration that succeeded
           provenance failure→ non-zero

ACT SCOPE  a sixth pending file refuses before any migration
           a different pending set refuses — this is not a general path
           no SHA → refuses before the lock

⭐ DISCRIM  a swap-before-migrate mutant is DETECTED

STATIC     deploy-maia never invoked
           DEPLOY_ALLOW_HEAD never consulted
           deploy-production.sh UNCHANGED — ⛔ no O2 shipped
           runbook untouched by the harness
```

⭐ **The discrimination case is what makes this an instrument.** Without it every
other green line would also be green against swap-before-migrate.

Neighbours re-run unchanged: `verify:migrate-fail-closed` **14/0** ·
`verify:deploy-provenance` **27/0** · `verify:deploy-lock` **25/0**.
S3 untouched; Class-B freeze diff **EMPTY**.

### ⚠️ Two harness corrections worth recording

The static scans failed on their first run **because the runbook documents its own
compliance** — the C21 lesson, twice:

1. the header states *"deploy-maia is FORBIDDEN"* and *"No DEPLOY_ALLOW_HEAD"*;
   a raw-source scan read the prohibition as the behaviour. **Comments are now
   stripped first**, the same discipline C6/C21 already use.
2. `DEPLOY_ALLOW_HEAD` still appears inside the **refusal message**. ⭐ Rather than
   launder the string, the check was corrected to ask the right question: the law
   is that no code path **consults** the variable. The inherited escape inside
   `deploy_ctx_assert_and_materialize` is unreachable because the empty-SHA case
   returns before materialize is called — **proved dynamically** by the "no SHA"
   trace, where no `materialize` step appears at all.

---

## 4 · WHAT THIS DELIBERATELY IS NOT

⛔ **Not a new deployment path.** `scripts/deploy-production.sh` is byte-unchanged
and still orders swap → migrate. The harness asserts that, so shipping O2 by
accident would turn this proof red.

⛔ **Not O3.** No `reader-compatible` bit was added. The founder's reasoning is
recorded because it is the durable part: *compatibility is relational — this
migration against which currently-running reader?* A permanent yes/no would turn
today's proved relationship into a timeless property it does not possess, and it
would still not govern the `deploy-maia` quick path.

⚠️ **The quick-path gap is still open and still not owned here**: `deploy-maia`
runs no migrations, so ordering custody over `deploy`/`update` does not reach it.

---

## 5 · STANDING

```text
DEPLOYMENT-SAFETY-02        O1 SELECTED · runbook DERIVED and PROVED
§1 reconciliation           ✅ RESOLVED — ledger-only divergence (6/6 true)
pending set                 CLOSED · exactly five
old-reader compatibility    PROVED for this set
runbook proof               ✅ 19 / 0 · discrimination case passes
deploy-production.sh        UNCHANGED (⛔ O2 not shipped)
O3 / O4 / O5                ⛔ NOT IMPLEMENTED
deploy-maia                 ⛔ FORBIDDEN for this act, and asserted absent
quick-path gap              OPEN · NOT OWNED

S3 ROUTE-INTEGRATION        ✅ CLOSED · 6ec5ff1d · untouched
DEPLOYMENT-SAFETY-01        ✅ PASS · 856db2cc
MERGE                       ⏸ HOLD
SCHEMA DEPLOY               ⛔ NOT YET AUTHORIZED
PRODUCTION WRITE            ⛔ NONE IN THIS ACT
```

Stop for authorization.
