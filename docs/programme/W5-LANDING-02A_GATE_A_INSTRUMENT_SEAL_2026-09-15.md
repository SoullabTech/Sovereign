# W5-LANDING-02A · GATE A INSTRUMENT SEAL

**Date** 2026-09-15 · **Branch** `claude/w4-2-schema-design` · **Authorized** founder, 2026-09-15,
record/instrument only.

⛔ **NO PROTECTED READ WAS PERFORMED IN THIS ACT.** Everything below is instrument
repair and falsification. The pending-order finding it is being repaired to
reproduce was established independently by the founder, not here.

---

## 1 · What this act is, and what it is not

The founder reran Gate A from `8ee09dfd9` in a detached worktree, reached the
protected database read-only, and **answered the pending-order question**:

> The next deploy of the proposed narrow carrier would attempt exactly
> `000001 … 000005`. Nothing before them. Nothing between them. Nothing after them.

That ruling stands on the founder's own run. ⛔ **This act does not re-derive it,
does not confirm it, and confers nothing on it.** It repairs the instrument so
that the *durable* instrument can produce the same result — and so that the two
defects the run exposed cannot recur.

---

## 2 · The two defects, both real, neither designed around

### D1 · §0 conflated a LOCATION failure with a CONTENT failure

The first protected run refused with all five pins `MISSING`. **The pins were
sound.** §0 hashed `database/migrations/<name>` out of the **working tree,
relative to the caller's cwd**, and was launched from a driver worktree carrying
no such path.

Two things were wrong, and the second is the worse one:

1. it depended on where it was run from and on what happened to be checked out —
   *an uncommitted edit would have moved a pin*;
2. ⛔ **"the file is not here" and "the bytes differ" were reported as one
   finding.** An instrument that says *pin failure* for *wrong directory* has
   told you nothing, and worse, invites re-pinning to make it pass.

**Repaired**: `git rev-parse <ref>:database/migrations/<name>` — root-relative by
git's own path grammar, so cwd cannot move it, and it is a custody statement
about a **commit** rather than about somebody's checkout. Three refusals now,
never one: `UNKNOWN REF` · `ABSENT` · `MISMATCH`. `MISMATCH` is reported first
and separately, so an ABSENT count beside it cannot soften a content finding into
*"we were probably in the wrong place."*

On an `ABSENT` refusal the gate **reports** which local refs carry all five
pinned blobs byte-identical, and then refuses to choose. *Reporting is not
selecting.*

### D2 · ⭐⭐ §4 called lawful history DRIFT

Gate A treated *ledgered + file absent from the image* as automatically `DRIFT`.
**That is not this repository's rule.** `scripts/capture-baseline.sh` preserves a
`schema_migrations` row after its source file leaves the active tree, deliberately
and in its own prose:

> *A filename with no file on disk is stamped with a NULL checksum — production
> records that it ran, and its source is no longer in the repository. That is
> preserved as a ledger fact, never reconstructed and never invented.*

The founder's comparison against the baseline manifest:

```
ledgered, absent from image/base          52
already recorded in baseline manifest     51
not in baseline manifest                   1
```

⛔ **The old classification would have condemned 51 lawful entries — and buried
the one real finding inside them.** A finding that arrives wrapped in 51 false
positives is not a finding.

**Repaired** into three classes, read from the baseline manifest(s) **on the
carrier ref**:

| class | meaning | verdict effect |
|---|---|---|
| `BASELINE-SUBSUMED` | named in a baseline manifest | ⭐ lawful history — no effect |
| `APPLIED-OUTSIDE-CARRIER` | post-baseline, ledgered, no file | ⚠️ a standing **finding** |
| `UNCLASSIFIED` | no manifest on the carrier to judge by | ⛔ **NOT MEASURABLE** — gate fails |

⛔ The third class exists because *an absent manifest is not an empty manifest*.
Without something to classify against, the instrument reports that it **cannot**
classify — never that the names are lawful, never that they are drift.

**The one real finding, preserved as such**:

```
20260903000001_return_authority_fail_closed.sql
  ledgered in production   ✅   present in current image   ❌
  present on canonical base ❌   present in Sep-1 baseline  ❌
```

Observable in production as `member_memory_atoms.return_preference` defaulting to
`member_pulled`. ⛔ **It is already applied. It is NOT a migration the next deploy
would attempt, and the instrument now says so in those words.** It is owed its own
reconciliation record; ⛔ nothing here disposes of it.

---

## 3 · The other two corrections

**C3 · latent pending in the running image now FAILS.** §3 previously warned. A
migration the *current* image would attempt before any merge is a deploy the
carrier does not describe — it needs disposition, not a note. Today the count is
zero, which is why this correction costs nothing to make and would have cost
everything to omit.

**C4 · protected identity, printed and asserted before any result.** §2 now asks
the database `current_database()`, `current_user`, `transaction_read_only`,
`server_version`, `pg_is_in_recovery()` and **refuses** on a wrong database, on a
membrane that is not on, and on silence — before the ledger is read. *No reading
is accepted from a database that has not said who it is.*

---

## 4 · Exit codes — tri-valued, deliberately

```
0  order PASS, no standing finding
3  order PASS, and a custody finding stands
1  order FAIL
2  refused before measuring anything
```

⭐ The founder ruled the order question **PASS** while a custody finding stands.
Both are true, and an exit code that can only say *pass* would have made the
second invisible. **`3` exists so that `0` can never be read as "and nothing else
was found."** ⛔ The order verdict does not dispose of a §4 finding, and §7 prints
the debt as `OWED`.

---

## 5 · Falsification — `66 passed · 0 failed`

`scripts/witness/w5-landing-02-gate-a-seal.sh`. Evidence classes named per
obligation: **BEHAVIOURAL** (run and judged) · **SOURCE-LEVEL** (pinned slice with
an anti-vacuity anchor).

**§0, behavioural, real repository and real founder pins, only the ref varies**

- `P1` five resolve on `HEAD` · stops at §0 · ⛔ *"This is not a Gate A result"*
- `P2` unknown ref → `NO PIN WAS JUDGED`, never claims a verification
- `P3` a ref predating the five → `ABSENT`, named a **location** finding, candidates reported
- `P4` a **divergent** ref → `MISMATCH`, named a **content** finding, *"Do not re-pin to make it pass"*, other four still verify
- ⭐⭐ `P6` **the discriminator**: the ABSENT run never says `MISMATCH`, the MISMATCH run never says `ABSENT`. *This is the whole repair.*
- `P5` outside a repository → refused as location · from a **subdirectory** it still resolves

`P4` constructs its divergent ref from **unreferenced** objects (`hash-object -w`
→ `write-tree` → `commit-tree`). ⛔ No ref created, no branch moved, no index and
no working tree touched.

**§3/§4/§6, behavioural, synthetic states through the declared seam**

- `G1` exactly the five → PASSES, exit 0 · `G2` a stray → FAILS · `G3` order is the runner's
- ⭐⭐ `G4` baseline-subsumed → lawful, gate still PASSES, ⛔ and the old blanket drift sentence is gone
- ⭐⭐ `G5` post-baseline ledger-only → `APPLIED-OUTSIDE-CARRIER`, order still PASSES, **exit 3**, §7 records the debt, ⛔ never called something a deploy would attempt
- ⭐ `G6` no manifest → `NOT MEASURABLE`, gate FAILS, ⛔ not translated into either answer
- ⭐ `G7` latent pending in the current image → FAILS (correction 3)
- `G8` one of the five already applied → stale package FAILS · `G9` a synthetic run declares itself twice

**§2, SOURCE-LEVEL and saying so** — `S0` anchor, `S1`–`S4` the four assertions,
⭐ `S5` identity is established **before** the ledger read. ⛔ Sealing these
behaviourally would require a database, which is what this seal refuses to touch.

**Two obligations failed on the first seal run; both were the seal's fault and
both are recorded rather than smoothed**: `P3` asserted a phrase that straddled a
line break in the instrument (the instrument was reflowed, not the assertion
weakened), and `G6` banned the word `BASELINE-SUBSUMED` across the whole output —
**the C21 class for the fifth time**, matching §4's own legend prose, which
documents the taxonomy. Scoped to the count line by regex.

---

## 6 · The rerun this act sets up, predeclared

⛔ Predeclared so the run is falsifiable rather than confirmatory. From a
checkout carrying the five, with `origin/clean-main-no-secrets` fetched:

```
bash scripts/witness/w5-landing-02-gate-a-seal.sh
bash scripts/witness/w5-landing-02-gate-a.sh origin/clean-main-no-secrets HEAD
```

**Expected, if the founder's independent run is right:**

```
§0   verified 5 · absent 0 · mismatched 0
§2   db maia_consciousness · role soullab · read_only on
§3   none — the running image is fully applied
§4   BASELINE-SUBSUMED        51
     APPLIED-OUTSIDE-CARRIER   1   20260903000001_return_authority_fail_closed.sql
§5   1..5, all tagged "W5 package"
§6   GATE A PASSES · and 1 custody finding stands
exit 3
```

⛔ **Any other reading is the finding, not a defect in the expectation.** A
`BASELINE-SUBSUMED` count of 51 is expected, not required: the manifest is read
from the carrier, and a different count is a real disagreement to report.

---

## 7 · Standing

```
W5-LANDING-01                     ✅ CLOSED
W5-LANDING-02 Gate A order        ✅ PASS   (founder's independent run)
W5-LANDING-02A instrument seal    ✅ 66 passed · 0 failed
durable instrument rerun          ⏸ OWED — founder act, protected read-only

20260903000001 applied-outside-carrier   ⚠️ SEPARATE CUSTODY FINDING, UNRECONCILED

Gate B narrow carrier             ⏸ after the rerun is recorded
canonical merge                   ⛔
protected execution               ⛔
deployment                        ⛔
production mutation               ⛔ NONE
```

> ***Historical ledger entries without active files are not automatically drift.
> The runner's real future act is base + five, and that act is clean. One
> unrelated post-baseline schema act remains to be accounted for separately.***
