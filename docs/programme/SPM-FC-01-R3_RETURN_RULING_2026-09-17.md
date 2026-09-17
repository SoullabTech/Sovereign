# SPM-FC-01 · R3 — FOUNDER RULING: RETURN

**R3 IS NOT RATIFIED.**

---

## 0 · BINDING AND CUSTODY

| | |
|---|---|
| Object returned | `docs/programme/SPM-FC-01_COMBINED_D9_F5_FALSIFICATION_CONTRACT_2026-09-17.md` |
| R3 commit | `9d0539b3f813aeed947d6fb83b49aefd76c19e3b` |
| R3 branch | `chore/spm-fc-01-r3-closing-synthesis-20260917` — ⛔ untouched by this ruling |
| Contract blob at R3 | `a4dabcecd7a43c57ca5432b50921421fba6ce129` |
| R3 record blob | `58ee3fefeac613eeebf8d0af796c9d6b64778ff0` |
| R3 predecessor | `8bba2f76d449ba969fe42208f698a94728e38d1d` (R2) — verified as the exact parent |
| This ruling's branch | `chore/spm-fc-01-r4-accounting-20260917`, branched from `9d0539b3f` |

⭐ **This ruling does not commit onto the R3 branch.** It follows R3's own discipline — an explicit
successor branch from the exact predecessor — so `9d0539b3f` remains the pinned R3 object and its
head cannot drift beneath a ruling about it.

⚠️ **Gate-evidence honesty.** Git hooks are **not installed in this execution container**
(`core.hooksPath` unset, no `.git/hooks/pre-commit`). The R3 report's gate passes were produced on
a host where they are installed and are the evidence of record for R3. ⛔ **Nothing in this
document may be read as a gate pass**; the interim rule stands — *absence of the branch hook is
never evidence of branch-policy compliance.* The branch chosen here (`chore/*`) satisfies the
committed allowlist on its face, which is a statement about the name, not about a gate having run.

---

## 1 · FOUNDER RULING

> ## **RETURN R3**
>
> R3 is returned for **one bounded documentary correction only.**
>
> The corrected contract still carries a stale and already-adjudicated accounting block in §5.
> Before ratification, make the contract truthful **standing alone**:
>
> * state **31 locally earned D9/F5 invariant laws**;
> * retain **I-19 as a declared gap**, not an invariant;
> * retain **I-33 as an imported prior ratified law**, excluded from the local count;
> * remove `I-7(part)` from the D9-alone list and `I-10(part)` from the F5-alone list, leaving
>   **I-7 and I-10 once in the convergent list**;
> * remove the stale **NOT ADJUDICATED** and **NEXT — adversarial adjudication** language.
>
> ⛔ No invariant law, evidence binding, R2 scope correction, implementation, schema, route, UI,
> migration, or production state may change.
>
> Recompute and bind the corrected contract object, perform a **bounded R4 re-adjudication of this
> accounting correction**, and **stop before ratification.**
>
> **R3 is not ratified.**

### 1.1 · The reason, recorded as the founder stated it

> **Ratification should attach to an object that tells the truth when opened by itself.**

The current contract at blob `a4dabcec` does not. Its §5 contradicts accounting that has already
been adjudicated — twice independently. ⛔ The defect is therefore **not** to be ratified and
carried as an overlay dependency.

---

## 2 · WHAT R3 GOT RIGHT — verified, and not reopened

R3's claims were verified against the repository before this ruling, and every one holds:

| Claim | Verification |
|---|---|
| Parent is `8bba2f76d` | ✅ exact; no intervening commit |
| Contract `e6e78a58…` → `a4dabcec…` | ✅ both blobs confirmed |
| R3 record blob `58ee3fef…` | ✅ confirmed |
| Change is **0 additions, 4 deletions** | ✅ exact |
| The four lines are the overbroad closing synthesis | ✅ verbatim; ⭐ nothing replaced, no doctrine invented |
| Total scope is contract + R3 record only | ✅ no accidental repair |
| Branch guard satisfied, not bypassed | ✅ `chore/*` is on the committed allowlist |

**Residual-language scan of the surviving contract: CLEAN.** Two hits only, both correct — **I-9**,
which *denies* monotonicity, and **G4**, correctly noting the I-18 warrant is granted by default.
No equivalent generalization escaped elsewhere in the contract.

⭐ **R3's own correction is complete and is not reopened by this return.** The return is about a
different defect that R3 did not carry a mandate to fix.

---

## 3 · THE DEFECT THAT FORCES THE RETURN

The surviving contract's §5, at blob `a4dabcec`, still reads:

```
SPM-FC-01        DELIVERED — ⛔ NOT ADJUDICATED, ⛔ NOT RATIFIED
Invariants       33 across 13 domains
Earned by D9 alone       I-4 · I-5 · I-6 · I-7(part) · I-8 · I-9 · I-14 · I-15 · I-16 · I-17 · I-18 · I-27
Earned by F5 alone       I-1 · I-2 · I-3 · I-10(part) · I-11 · I-20 · I-21 · I-22 · I-23 · I-25 · I-26 · I-28 · I-29 · I-30 · I-31 · I-32
Requires BOTH, join named I-24
Convergent (each lane independently) I-7 · I-10 · I-12 · I-13
Out-of-lane, strikable   I-33
...
NEXT — adversarial adjudication: provenance audit · constitutional review · ...
```

Five defects, each already adjudicated:

1. **`Invariants 33 across 13 domains`** — the contract contains **33 numbered sections**, not 33
   D9/F5-earned invariant laws.
2. **`I-7(part)` and `I-10(part)`** appear in the lane-alone rows *and* I-7 and I-10 appear again
   under Convergent. **Both are double-counted.**
3. **`I-33 — Out-of-lane, strikable`** is not the adjudicated disposition. The ruled disposition is
   *imported prior ratified law, retained, excluded from the local count.*
4. **`NOT ADJUDICATED`** is false. The object has been adjudicated three times.
5. **`NEXT — adversarial adjudication`** is false. That act is spent.

⭐ **Why an overlay does not cure it.** R2 was an overlay by construction and never edited the
contract; R3 touched only the closing lines. `git log` over the contract path confirms
**`99d6f918d` and `9d0539b3f` are the only commits that have ever touched it.** The corrections
exist in the R2 revision and the R2/R3 re-adjudications — and **nothing in the contract points to
them.** A reader opening `a4dabcec` alone reads the un-corrected accounting and has no signal that
it was superseded.

---

## 4 · R4 — AUTHORIZED SCOPE

**R4 may alter §5 of the contract and nothing else.**

**MAY:**

* state **31 locally earned D9/F5 invariant laws**;
* classify **I-19** as a declared gap, excluded from the invariant count;
* classify **I-33** as an imported prior ratified law, retained, excluded from the local count;
* remove `(part)` from the D9-alone and F5-alone lists, leaving **I-7 · I-10** once under
  Convergent;
* remove the stale `NOT ADJUDICATED` status line;
* remove the stale `NEXT — adversarial adjudication` line;
* recompute and bind the corrected contract blob;
* produce a **bounded R4 accounting re-adjudication**.

⛔ **MAY NOT:** touch any invariant law's wording, evidence binding, prohibited clause, adversarial
case, or PASS/FAIL condition · touch any R2 scope correction · touch the D9/F5 source bindings ·
reopen R3's closing-synthesis deletion · alter schema, migrations, routes, UI, prompts,
implementation or production state · re-run D9 or F5 · design a repair · ratify.

### 4.1 · The correct accounting, as adjudicated

| Class | Count | Members |
|---|---:|---|
| D9-only | **11** | I-4 · I-5 · I-6 · I-8 · I-9 · I-14 · I-15 · I-16 · I-17 · I-18 · I-27 |
| F5-only | **15** | I-1 · I-2 · I-3 · I-11 · I-20 · I-21 · I-22 · I-23 · I-25 · I-26 · I-28 · I-29 · I-30 · I-31 · I-32 |
| Convergent | **4** | I-7 · I-10 · I-12 · I-13 |
| Requires both | **1** | I-24 |
| **Locally earned D9/F5 invariant laws** | **31** | |
| Declared gap, not an invariant | — | I-19 |
| Imported prior ratified law, excluded from the local count | — | I-33 |
| **Numbered sections in the artifact** | **33** | |

### 4.2 · R4's own gate, before it returns

Re-run only: unique-set arithmetic (11 + 15 + 4 + 1 = 31) · no member appears in two classes ·
no surviving `33 invariants`, `(part)`, `strikable`, `NOT ADJUDICATED`, or
`NEXT — adversarial adjudication` language · six-field completeness undisturbed · **diff containment
proving the change is confined to §5** · no substantive law drift.

⛔ **R4 does not self-ratify.** It returns the object for ratification adjudication.

---

## 5 · STANDING

```
D9                        ✅ CLOSED
F5 TRACE                  ✅ COMPLETE
F5 ERASURE CONFORMANCE    ⛔ FAIL / STOP
SPM-FC-01 R3              ⛔ RETURNED — NOT RATIFIED
  closing-synthesis fix     ✅ VERIFIED COMPLETE — not reopened
  §5 accounting             ⛔ DEFECTIVE — the sole reason for the return
R4                        ✅ AUTHORIZED — §5 only, documentary, bounded
RATIFICATION              ⛔ NOT TAKEN
IMPLEMENTATION            ⛔ CLOSED
SCHEMA / ROUTE / UI       ⛔ NOT AUTHORIZED
PRODUCTION                ⛔ UNTOUCHED
```

> *R3 removed a sentence that said more than the evidence had earned, and removed it cleanly.
> What remains is a standing block that still counts two laws twice and calls itself unadjudicated.
> A contract is ratified as an object, not as an object plus the corrections someone remembers.*

**STOP.**
