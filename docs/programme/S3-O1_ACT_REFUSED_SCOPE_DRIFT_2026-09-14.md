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
