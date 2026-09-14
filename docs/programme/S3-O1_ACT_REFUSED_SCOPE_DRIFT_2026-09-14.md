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
