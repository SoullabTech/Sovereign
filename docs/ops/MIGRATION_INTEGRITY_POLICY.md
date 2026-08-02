# Migration integrity — enforcement implemented, policy ruled

**Date:** 2026-08-02
**Scope:** `scripts/run-sql-migrations.sh` (the production `migrate` compose service)
**Status:** **RULED 2026-08-02** — mechanism implemented and verified; both policy decisions ruled

> **The invariant this establishes:**
> **A migration ledger is a record of executed artifacts, not merely filenames.**

---

## 1. What was wrong

`database/migrations/README.md` claimed a SHA-256 checksum was recorded at apply time and that
editing an applied migration "is detected as drift, not silently ignored." The runner never
computed, wrote, or compared a checksum. It added a `checksum` column labelled *"for future
compatibility"* and inserted `filename` only. Selection was pure set-membership by filename, so
**editing an applied migration was silently ignored** — the file was skipped and its new contents
never ran.

PR #911 corrected the README to state the measured behaviour and deliberately did **not** implement
enforcement, to keep that PR a governance correction. This lane is the implementation.

## 2. What is now implemented (mechanical — no ruling required)

1. **Calculate** — SHA-256 over file *contents* (hashed from stdin, so the filename never enters the
   digest). Byte-compatible with `scripts/apply-migrations.sh`, verified against production rows.
2. **Persist** — recorded at apply time, hashing the exact bytes fed to `psql` before the migration
   runs.
3. **Compare** — a **pre-flight phase** that verifies every recorded checksum *before any pending
   migration is applied*.
4. **Report** — every run prints `verified / unverified / absent / drift` counts.

### Why pre-flight, specifically

Each migration commits in its **own** transaction (`psql -c "BEGIN;" -f "$f" -c "COMMIT;"`), not one
transaction for the chain. A check that aborted part-way through would leave earlier migrations
permanently applied and the chain half-done. A pre-flight abort leaves the database exactly as it was
found. This is asserted by test T3: a genuinely pending migration sits alongside a drifted one and
must **not** be applied.

### Four outcomes are distinguished, not conflated

| Class | Meaning | Enforced? |
|---|---|---|
| **verified** | recorded checksum matches the file | — |
| **drift** | recorded checksum disagrees with the file | **yes** (policy §3) |
| **unverified** | row recorded before enforcement existed (`checksum IS NULL`) | no (policy §4) |
| **absent** | recorded, file no longer on disk (retired or renamed) | no — legitimate |

The **absent** class is not incidental. Production has **47** such rows, and #911 has just documented
a deliberately retired migration. Treating "recorded but absent" as drift would block every deploy.

### No bypass — unreachable by construction

While the decisions were open, the two postures were script constants (never environment variables).
Once ruled, the alternatives were **removed from the runner entirely**. `warn` and `backfill` are not
un-selected options sitting one token away from a ruled-against behaviour; they do not exist in the
code. Their consequences are preserved here, in prose, where a change of posture requires a reviewed
edit — the governance event it should be.

This is asserted behaviourally, not by inspection: tests T6 and T8 run the runner with every
environment variable a future operator might plausibly reach for (`DRIFT_POLICY=warn`,
`SKIP_MIGRATION_CHECKSUM=1`, `MIGRATION_ALLOW_DRIFT=1`, `FORCE=1`, and others set simultaneously) and
assert the refusal is unchanged and the bypass bought nothing.

## 3. DECISION 1 — behaviour when an applied migration's checksum differs

**RULED: hard failure before any migration executes, with no runtime bypass.**

The question was not *"should drift abort?"* It was:

> **Should production migration integrity behave differently from the migration integrity behaviour that already exists?**

It should not. `scripts/apply-migrations.sh` — the dev runner behind `npm run db:migrate` — has
always treated a checksum mismatch as fatal. The production runner was the divergence, not the
proposal. A drifted migration is not an ordinary warning condition: it means the ledger and the
filesystem disagree about what was applied.

The options as they were weighed:

| Option | Consequence |
|---|---|
| **A. Abort** ← **RULED** | Deploy fails, loudly, naming the file and both checksums. Nothing is applied. The editor must restore the file and ship a new migration. Cost: a genuine drift blocks the deploy lane until resolved — which is the point. |
| **B. Warn** | Drift is printed; pending migrations still apply. Nothing is ever blocked. Cost: in practice this is near-silent — the message lands in deploy output nobody reads, and the asymmetry (docs promise detection, deploys ignore it) partly survives. |
| **C. Require an explicit override** | Abort by default, with a per-file acknowledgement (e.g. an `allowed-drift` ledger entry) to proceed. Cost: a second mechanism to build and govern; the override becomes the thing that needs discipline. |

Supporting evidence: the measured blast radius is zero — on production's current ledger, abort fires
on nothing (§5).

## 4. DECISION 2 — pre-enforcement rows (`checksum IS NULL`)

**RULED: reported as unverified. Never enforced, never auto-certified.**

Production has **430** such rows. This is the decision that could break every existing environment.

Backfilling would compute the hash of the *current* file and record it as the *historical* truth —
silently assuming the current file is the historical file. It may be. It may not be. The system
cannot prove it. Reporting is the only option that does not manufacture history.

The transition path is therefore:

```text
unverified  →  superseded by a new, checksummed application  →  verified
```

and never:

```text
unverified  →  pretend verified
```

| Option | Consequence |
|---|---|
| **A. Report** ← **RULED** | Counted and named as UNVERIFIED in every run; never enforced, never written. Cost: **430 historical migrations are never protected** — the gap is permanent, but permanently *visible*. |
| **B. Backfill** | On first sight, adopt current file contents as the recorded truth. Cost: **manufactures assurance.** If a file already drifted before enforcement existed, the backfill makes the drift canon and the ledger then certifies a lie. |
| **C. Treat NULL as drift** | Full protection. Cost: fails every environment with pre-enforcement history — 430 rows in production — until each is individually resolved. Blocks all deploys immediately. |
| **D. Verified backfill** | Backfill only where an independent hash proves contents unchanged. `apply-migrations.sh` does this for legacy MD5 rows. **Not available here** — the 430 rows are NULL, not MD5. There is nothing to verify against. |

D is the only option that would close the gap honestly, and it is not reachable for these rows —
there is no independent historical source to verify against. B trades a visible gap for an invisible
false guarantee, which is the exact failure mode this lane exists to correct. A leaves the gap open
and *named*: the count prints on every deploy, so it cannot quietly become assumed coverage.

## 5. Measured production blast radius (not estimated)

Against the live ledger on minisforum, 2026-08-02:

| | |
|---|---|
| ledger rows | 480 |
| already carrying a checksum | 3 — **all three match** the SHA-256 of the current file |
| unverified (NULL) | 430 |
| absent (recorded, file gone) | 47 |
| **drift** | **0** |
| pending migrations that would apply | 7 |
| **next-deploy outcome under the interim values** | **exit 0 — deploy proceeds** |

The three pre-existing checksums were written by `apply-migrations.sh`. That they match confirms the
two runners agree on the algorithm, so they can share one ledger without fighting.

Pre-flight cost at production scale (440 files): **~2.1s**.

## 6. Secondary finding — two runners, one ledger

The repo has two migration runners writing to the same `schema_migrations` table:

- `scripts/apply-migrations.sh` (`npm run db:migrate`, dev) — already checksums and aborts on drift.
- `scripts/run-sql-migrations.sh` (production `migrate` service) — did not, until this change.

They are now consistent on algorithm and on drift posture. **This is not a claim that they are
otherwise equivalent** — their selection logic, transaction handling, and invariant checks differ and
have not been reconciled.

**Ruled 2026-08-02: that reconciliation is explicitly OUT OF SCOPE for this lane**, so that an
integrity fix does not become another foundation project. The boundary:

| Lane | Question it answers |
|---|---|
| **This lane** | Can we detect migration artifact drift reliably? |
| **Future lane** | Why do we have multiple migration execution paths? |

Runner consolidation, migration transaction semantics, and deploy-workflow redesign all belong to the
second question. None of them are prerequisites for the first.

## 7. Sequencing — this lane must not land before #911

`database/migrations/README.md` is currently owned by open PR #911, which corrects it to say
enforcement is *not* implemented. This lane deliberately **does not touch that file** — editing it
here would collide with #911 and pre-empt its correction.

Order of operations:

1. #911 merges (README states the pre-enforcement truth).
2. Founder rules §3 and §4.
3. This lane's runner change merges **carrying the README update in the same PR**, so the README and
   the runner change state together and neither describes a behaviour the other does not have.

Until step 3, the README correctly describes trunk.

## 8. Verification

`scripts/test-migration-checksums.sh` — **44 assertions, 44 passed, 0 failed** (run 2026-08-02).

It creates its own throwaway database and its own fixture migration directory; it never touches
`maia_consciousness` or `database/migrations`. (The dev database is shared across worktrees, so
evidence gathered against it is not repeatable.)

Every refusal probe asserts a **matching reason**, not merely a non-zero exit. A migration check that
exits non-zero because PostgreSQL rejected syntax is not evidence that drift detection works — the
refusal reason is part of the proof. T3 asserts the abort names the drifted file, states the edited
contents never ran, states nothing was applied, and then verifies against the database that the
smuggled column is absent, the pending migration did not apply, and the ledger is unchanged.

| Test | Asserts |
|---|---|
| T1 | first run applies and records checksums matching the files' SHA-256 |
| T2 | clean re-run verifies, applies nothing |
| T3 | edited migration aborts **before** anything is applied (pre-flight ordering) |
| T4 | restoring the file clears drift; the backlog then applies |
| T5 | NULL-checksum row is UNVERIFIED, not drift; not silently backfilled |
| T6 | no environment variable can backfill a NULL checksum |
| T7 | retired migration (recorded, file removed) is ABSENT, not drift |
| T8 | no environment variable can downgrade drift from abort |
| T9 | digest covers contents only — the filename is not in it |
| T10 | a failing migration is not recorded and its checksum is not banked |
| T11 | a fresh database has zero unverified rows |

## 9. What this change does *not* do

- It does not protect the 430 pre-enforcement migrations (§4).
- It does not detect a migration edited *and* re-recorded by a direct SQL write to the ledger.
- It does not reconcile the two runners beyond algorithm and drift posture — ruled out of scope (§6).
- It does not change selection: set-membership by filename is unchanged, and ordering guarantees are
  still what `database/migrations/README.md` says they are.
