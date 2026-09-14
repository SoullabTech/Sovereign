# S3 · O1 PRODUCTION ACT — REFUSED BY ITS OWN SCOPE CHECK

**Date** 2026-09-14 · **Candidate** `c2cb81f2c3a3b7362fbc4316dc8bfe0dd9e55faa` (merge of PR #1286)
**Outcome** ⛔ **REFUSED BEFORE MIGRATION AND BEFORE SWAP. NOTHING WAS CHANGED.**

---

## 1 · WHAT HAPPENED

Everything up to the scope check passed, and each step is worth naming because
each was a custody property the lane spent an act proving:

```text
✅ runbook self-pinned to the candidate
✅ runbook + all 4 sourced helpers HASH-MATCH c2cb81f2c
✅ deploy lane lock acquired
✅ immutable snapshot materialized from the named SHA
✅ compose carries GIT_COMMIT only as a build arg (no runtime override)
⛔ PENDING SET ≠ THE PROVED SET → REFUSED
```

```text
expected (proved, five)                    actual (three)
  20260121_trusted_colleagues.sql            —
  20260122_transcript_encryption.sql         —
  20260913000001_ask_authorization_acts      20260913000001_ask_authorization_acts
  20260913000002_disclosure_boundary…        20260913000002_disclosure_boundary…
  20260913000003_disclosure_gesture…         20260913000003_disclosure_gesture…
```

⭐⭐ **THE INSTRUMENT DID EXACTLY WHAT IT WAS BUILT FOR.** It was designed to
refuse a *sixth* file; it refused a *missing* pair. The property that mattered was
never "more or fewer" — it was **"this is not the set compatibility was proved
for"**, and an unexplained change to production's ledger between authorization and
execution is precisely the drift an act should stop on.

⭐ The recovery invocation then refused too — *"No recovery image … this act cannot
recover what it never pinned."* **Correct.** The act never reached the point of
pinning one, so there is nothing to restore, and the recovery path does not
pretend otherwise.

---

## 2 · WHAT THE REFUSAL ESTABLISHES

The pending set is computed as *candidate tree* ∖ *production ledger*. So:

1. ⭐ **Production's `schema_migrations` NOW CONTAINS both divergence files.** At
   the founder's read-only preflight earlier today it contained neither.
2. ⭐ **The three S3 migrations are STILL ABSENT** from the ledger — so whatever
   applied the two ran from a migration tree that did **not** contain S3's three,
   i.e. a **pre-merge** tree.
3. ⛔ **This act changed nothing.** No migration ran, no image was tagged, no
   container was swapped, and no shared role tag was touched — the runbook
   refuses before any of those, which §3c of the witness asserts.

⚠️ **What it does NOT establish, and must not be assumed:** *why*. A migration
applying by an act nobody separately authorized is the 2026-09-07 finding's exact
mechanism, but ⛔ this record does not claim that is what happened. It may equally
have been a deliberate founder-run `migrate`. **The timestamps decide, not the
resemblance.**

---

## 3 · THE READ-ONLY DIAGNOSTIC THAT SETTLES IT

⛔ No writes. Four questions, in order of what they foreclose.

```bash
# (a) WHEN were the two applied, and what landed around them?
ssh soullab@minisforum 'docker exec maia-postgres psql -U soullab -d maia_consciousness -c "
  SELECT filename, applied_at FROM schema_migrations
   ORDER BY applied_at DESC NULLS LAST LIMIT 12;"'

# (b) Confirm the S3 three are still absent — bounds the blast radius.
ssh soullab@minisforum 'docker exec maia-postgres psql -U soullab -d maia_consciousness -tAc "
  SELECT count(*) FROM schema_migrations WHERE filename LIKE '"'"'20260913%'"'"';"'

# (c) Did the READER move too, or only the schema?
ssh soullab@minisforum 'docker exec maia-sovereign printenv GIT_COMMIT; docker inspect maia-sovereign --format "{{.Created}} {{.Image}}"'

# (d) Is the deploy-lane lockfile holder metadata still readable?
#     ⚠️ It is overwritten by every acquisition, so absence proves nothing
#     (2026-09-07 finding). Read it only if it is still there.
ssh soullab@minisforum 'cat ~/MAIA-SOVEREIGN/.deploy.lock 2>/dev/null || echo "(no readable holder record)"'
```

**How to read (a):** an `applied_at` from **today** means an act applied them
between the preflight and now — and (c) says whether that act also moved the
reader. An **old** timestamp would instead mean the preflight read was wrong,
which is a different and more worrying finding about the instrument.

---

## 4 · THE RULING THIS NEEDS

⛔ **Not mine to take.** Two separable questions:

**Q1 — Is the three-file set authorized?** Compatibility for the three S3
migrations is *unchanged*: they are the additive/widening ones, censused in
DEPLOYMENT-SAFETY-02 §3, and a subset of a proved-compatible set is still
compatible. ⭐ But the act was authorized for the five-file set, and the runbook
hardcodes it. Proceeding requires either a founder ruling that the three-file set
is authorized **and** a one-line change to `RB_EXPECTED_PENDING` — ⛔ which moves
the runbook and therefore needs its own witness run.

**Q2 — What applied them, and did the reader move?** ⚠️ **Q2 should be answered
first.** If the reader also moved, the "pre-act live reader" the recovery custody
pins is not the one the compatibility census assumed, and that premise needs
re-reading before any production act — not after.

⛔ **Do not narrow `RB_EXPECTED_PENDING` to make the act pass.** Editing the
expectation to match whatever production happens to show would convert the one
instrument that just protected this act into a rubber stamp. The set is the law;
the ledger is the observation.

---

## 5 · STANDING

```text
MERGE                       ✅ DONE · c2cb81f2c3a3b7362fbc4316dc8bfe0dd9e55faa
O1 PRODUCTION ACT           ⛔ REFUSED by act-scope check · NOTHING CHANGED
  runbook self-pin           ✅ proved live (hash-match, 4 helpers)
  deploy lock                ✅ acquired and released
  migration                  ⛔ NOT RUN
  swap                       ⛔ NOT RUN
  role tags                  ⛔ UNTOUCHED
  recovery image             ⛔ never pinned (correctly refused on recover)

production ledger            ⚠️ CHANGED since preflight — 2 divergence files now applied
S3 schema                    ABSENT (3 of 3 still pending)
cause                        ⛔ UNKNOWN — diagnostic in §3, do not infer

SCHEMA DEPLOY                ⏸ HELD pending Q2 then Q1
PRODUCTION                   unchanged BY THIS ACT
```

Stop for ruling.

---

# CORRECTION · §2's INFERENCE IS REFUTED — NOTHING WAS APPLIED

**Founder's read-only ledger query, 2026-09-14:**

```text
newest applied_at in schema_migrations
  20260909000001_context_disclosure_receipts.sql   2026-09-09 23:59:24+00
  … then 2026-09-07, 2026-09-06 …
```

⭐⭐ **Nothing has been applied to production since 2026-09-09.** So the two
divergence files were **not** applied between the preflight and the act, and §2's
inference — *"whatever applied the two ran from a pre-merge tree"* — is **WRONG
and withdrawn**. ⛔ No unauthorized act occurred. Production's ledger has been
stable for five days.

## What that leaves

The runbook computes *candidate tree* ∖ *ledger*, sorting **both sides in the same
shell on the same host**, and reported three. So the two files **are** in the
ledger — with an `applied_at` older than 2026-09-06, or NULL (the query's
`NULLS LAST` would hide those beyond the top twelve either way).

⭐ **Which means there was never a ledger/schema divergence at all — only a bad
read.** The DEPLOYMENT-SAFETY-02 census §1 had already *predicted* this: every
object of both migrations is present in the 2026-09-01 baseline, and that baseline
is documented as a snapshot of production. Objects present in production on
2026-09-01 are entirely consistent with ledger rows applied before then.

⚠️ **The defect is mine, and it is a reasoning defect before it is a shell one.**
I had a repository-derived prediction and a single production read that
contradicted it, and I carried both forward instead of reconciling them. The
census even wrote the falsifier for one direction — *"any false → that object is
genuinely missing"* — and never asked the other: **if all six objects are present,
why would the ledger rows be absent?** That question would have caught this before
the runbook had to.

⚠️ **Mechanism of the bad read: NOT ESTABLISHED.** The preflight `comm` sorted its
two inputs on **different machines** (tree on minisforum, ledger piped to the Mac
Studio), which is the kind of thing that corrupts `comm`. ⛔ But that is a
hypothesis, and the obvious test **did not support it**: on this Linux host the
migration-name ordering is byte-identical under `C` and `en_US.UTF-8`. BSD `sort`
may still differ from GNU `sort`; that is untested and stays untested rather than
asserted. ⭐ **What matters for the act is settled regardless of the mechanism:
the runbook's reading is the trustworthy one, because both of its sorts run in one
shell on one host.**

## The one query that closes it — sort-free, no `comm`, no ordering

```bash
ssh soullab@minisforum 'docker exec maia-postgres psql -U soullab -d maia_consciousness -c "
  SELECT filename, applied_at FROM schema_migrations
   WHERE filename IN (
     '"'"'20260121_trusted_colleagues.sql'"'"',
     '"'"'20260122_transcript_encryption.sql'"'"');"'
```

```text
two rows returned   → they were always applied. No divergence ever existed.
                      The true pending set is the THREE S3 migrations. → Q1 only.
fewer than two      → they really are absent, and the runbook's comm is the thing
                      to distrust. ⛔ That would be a defect in the act's own
                      scope check and stops everything until understood.
```

Also worth one line, to bound it:

```bash
ssh soullab@minisforum 'docker exec maia-postgres psql -U soullab -d maia_consciousness -tAc "
  SELECT count(*) FROM schema_migrations WHERE filename LIKE '"'"'20260913%'"'"';"'
```

Expect `0` — the S3 schema is still absent, which the refusal already implies.

## Standing, corrected

```text
O1 PRODUCTION ACT        ⛔ REFUSED · NOTHING CHANGED        (unchanged)
production ledger        ✅ STABLE since 2026-09-09 — NOT changed since preflight
"two files pending"      ❌ WITHDRAWN — a bad read, not a fact about production
unauthorized act         ❌ NONE — §2's inference refuted by timestamps
ledger/schema divergence ❌ LIKELY NEVER EXISTED — pending confirmation above
true pending set         three S3 migrations (pending the confirming query)

Q2 (what applied them)   ✅ ANSWERED: nothing did
Q1 (is 3 authorized)     ⏸ now the ONLY open question
SCHEMA DEPLOY            ⏸ HELD
PRODUCTION               UNTOUCHED
```

⛔ `RB_EXPECTED_PENDING` still must not be narrowed to make the act pass. If the
confirming query returns both rows, the three-file set becomes the *correct* law
and changing it is a governed act with its own witness run — ⛔ not a convenience
edit.

---

# DEPLOYMENT-SAFETY-02A · ACT-SCOPE CORRECTION (founder ruling, 2026-09-14)

## The sort-free query closed it

```text
20260121_trusted_colleagues.sql      PRESENT · applied_at 2026-01-23 22:17:54+00
20260122_transcript_encryption.sql   PRESENT · applied_at 2026-01-23 22:18:28+00
all three 2026091300000* S3 rows     ABSENT
schema_migrations                    529 rows
```

⭐⭐ **January 23 — eight months before this lane existed.** The production runner
inserts by filename with `applied_at DEFAULT NOW()`, so today's stopped invocation
could not have written these rows; had it done so they would read 2026-09-14.

**Established:** the five-file premise is **WITHDRAWN**. There was **no**
ledger/schema divergence, **no** unauthorized intervening migration act, and
**nothing** was mutated by the refused invocation.

⛔ **Why the earlier preflight disagreed is NOT established and is NOT invented.**
Two explanations stay logically open — the earlier read was wrong despite its
recorded output, or the database state was replaced between observations — and
nothing in evidence distinguishes them. ⭐ *Record the contradiction; do not
manufacture provenance for it.* My own collation hypothesis was tested here and
**did not hold** (identical ordering under `C` and `en_US.UTF-8`), so it is not
offered as the answer either.

⚠️ **On authority, precisely:** commit `211f3b26` is an **evidence correction**, not
authority for this change. The authority is the founder ruling that the lawful
pending set is exactly the three S3 migrations.

## Why no new compatibility census

DEPLOYMENT-SAFETY-02 §3 classified each migration **individually**:

```text
M1  new tables + triggers on its own objects      ✅ old-reader compatible
M2  CHECK widened by one boundary value           ✅ old-reader compatible
M3  CHECK widened by one gesture value            ✅ old-reader compatible
```

The old proof was `A + B + M1 + M2 + M3 = safe`; A and B are already applied, so
the act is `M1 + M2 + M3`. ⭐ Removing two already-present, independently
compatible migrations introduces no new condition. **Three is not a new design —
it is the corrected execution truth.**

## The change

`RB_EXPECTED_PENDING` five → three, with the correction's reasoning and its
⛔ **not-established** provenance recorded in the file itself.

⛔⛔ **THE GATE IS NOT MADE PERMISSIVE.** Exact-set refusal remains the law. The
list was corrected by a governed act with its own witness — ⛔ never edited to
match whatever production happened to show. *The list is the law; the ledger is
the observation.* A future mismatch means STOP, not narrow.

## Witness — **67 passed · 0 failed**

```text
ACT SCOPE — every neighbouring set refused, in BOTH directions
  a FOURTH pending migration                          refused
  the STALE five-file set                             refused
  a narrower set (two of three)                       refused
  a single file                                       refused
  an EMPTY pending set                                refused
  the three plus one already-applied January name     refused
  ⭐ the runbook's own RB_EXPECTED_PENDING is read OUT OF THE RUNBOOK and must
     equal the proved three — the harness cannot pass against a stale
     expectation it carries itself
  ⭐ neither already-applied January filename remains in the act scope

UNCHANGED AND STILL GREEN
  self-pin + hash-proof of runbook and all 4 helpers
  build → capture + recovery tag → migrate → swap → provenance → Co-Lab
  every pre-swap refusal leaves shared role tags untouched
  recovery retags :prod, restarts, confirms commit and health
  ⭐ swap-before-migrate mutant                        DETECTED
  ⭐ recovery leaving :prod on the candidate           DETECTED
  only the happy path declares the act complete
```

⭐ **A guard that only rejects "more" is half a guard.** The first production
invocation was stopped by a set that was *smaller* than expected — so the
corrected witness proves refusal in both directions explicitly.

Neighbours re-run: `verify:migrate-fail-closed` **14/0** ·
`verify:deploy-provenance` **27/0** · `verify:deploy-lock` **25/0**.
⛔ Untouched: S3 route/application code, every migration, `deploy-production.sh`,
the routed-out rollback primitive, and the stale CLAUDE.md closure anchor.

## Standing

```text
first O1 invocation          ✅ REFUSED AS DESIGNED · nothing changed
five-file premise            ❌ WITHDRAWN
ledger/schema divergence     ❌ DID NOT EXIST
cause of the bad read        ⛔ NOT ESTABLISHED · not invented
true pending set             ✅ EXACTLY THREE S3 MIGRATIONS
three-file compatibility     ✅ ALREADY PROVED (DS-02 §3, per-migration)

O1 scope correction          ✅ MADE · witness 67/0
canonical admission          ⏸ PR owed · protected checks not yet run
SCHEMA EXECUTION             ⏸ HOLD until the correction merges and its exact
                                merge-result SHA is captured
c2cb81f2c…                   no longer the executable O1 candidate — its
                                hardcoded scope is falsified by production truth
PRODUCTION                   UNTOUCHED
```
