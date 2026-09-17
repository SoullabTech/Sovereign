# SPM-FC-01 · R4 — BOUNDED ACCOUNTING RE-ADJUDICATION

**R4 PASS · RATIFIABLE · ⛔ RATIFICATION NOT TAKEN**

---

## 0 · BINDING

| | |
|---|---|
| Authorizing ruling | `docs/programme/SPM-FC-01-R3_RETURN_RULING_2026-09-17.md` @ `cde297d4c303ba01e808a99c066de26704d5e4e6` |
| Branch | `chore/spm-fc-01-r4-accounting-20260917` |
| Predecessor (R3) | `9d0539b3f813aeed947d6fb83b49aefd76c19e3b` — verified as the exact parent of `cde297d4` |
| Contract blob **before** (R3) | `a4dabcecd7a43c57ca5432b50921421fba6ce129` |
| Contract blob **after** (R4) | `b52c53eae03851fb6bf21dbc41a1f38fe3a003d1` |
| Change | **+9 / −9**, two hunks, both inside `## 5 · STANDING` |
| Tree at start | clean |

⚠️ **Gate-evidence honesty, unchanged from the ruling.** Git hooks are not installed in this
container (`core.hooksPath` unset, no `.git/hooks/pre-commit`). ⛔ Nothing here is a pre-commit
gate pass. The seven checks in §3 are R4's **own** gate, run explicitly and reported with their
method.

---

## 1 · SCOPE EXECUTED

R4 altered **§5 of the contract and nothing else.**

| Ruling clause | Executed |
|---|---|
| state 31 locally earned D9/F5 invariant laws | ✅ `Locally earned D9/F5 invariant laws  31`, with per-class counts |
| retain I-19 as a declared gap, not an invariant | ✅ `Declared gap — not an invariant   I-19` |
| retain I-33 as imported prior ratified law, excluded from the local count | ✅ `Imported prior ratified law — retained, excluded from the local count   I-33` |
| remove `I-7(part)` from D9-alone, `I-10(part)` from F5-alone | ✅ both removed; I-7 and I-10 now appear **once**, under Convergent |
| remove stale `NOT ADJUDICATED` | ✅ replaced by the true status `ADJUDICATED — ⛔ NOT RATIFIED` |
| remove stale `NEXT — adversarial adjudication` | ✅ removed, **nothing substituted** |

⭐ **The `NEXT` lines were deleted without replacement**, following R3's own discipline: the ruling
authorized removal, not the authoring of a new next act.

⛔ **Not touched, and verified not touched (§3, GATE 6):** every invariant's Law · Evidence ·
Prohibited · Adversarial case · PASS · FAIL · all R2 scope corrections · all D9/F5 source
bindings · R3's closing-synthesis deletion · schema · migrations · routes · UI · prompts ·
implementation · production.

---

## 2 · THE CORRECTED ACCOUNTING

| Class | Count | Members |
|---|---:|---|
| Earned by D9 alone | **11** | I-4 · I-5 · I-6 · I-8 · I-9 · I-14 · I-15 · I-16 · I-17 · I-18 · I-27 |
| Earned by F5 alone | **15** | I-1 · I-2 · I-3 · I-11 · I-20 · I-21 · I-22 · I-23 · I-25 · I-26 · I-28 · I-29 · I-30 · I-31 · I-32 |
| Convergent (each lane independently) | **4** | I-7 · I-10 · I-12 · I-13 |
| Requires BOTH, join named | **1** | I-24 |
| **Locally earned D9/F5 invariant laws** | **31** | |
| Declared gap — not an invariant | — | I-19 |
| Imported prior ratified law — retained, excluded from the local count | — | I-33 |
| **Numbered sections** | **33** | across 13 domains |

---

## 3 · R4'S OWN GATE — 7 / 7 PASS

Each check was executed mechanically against the working file; method stated so it is reproducible.

| # | Check | Method | Result |
|---|---|---|---|
| G1 | Unique-set arithmetic | parse the four class rows from §5; assert cardinalities `(11, 15, 4, 1)` and sum `= 31` | **PASS** |
| G2 | No member appears in two classes | `Counter` over all parsed ids; assert no duplicate | **PASS** |
| G3 | I-1…I-33 each covered exactly once | union of the four classes + I-19 + I-33 equals `{1…33}`, cardinality 33 | **PASS** |
| G4 | Stale language removed | regex over the whole contract for `33 invariant` · `\(part\)` · `strikable` · `NOT ADJUDICATED` · `NEXT — adversarial adjudication` | **PASS — 0 hits** |
| G5 | Six-field completeness undisturbed | split on `#### I-`; assert each carries Law · Evidence · Prohibited · Adversarial case · PASS · FAIL | **PASS — 33 sections; the single exception is I-19, the declared gap, as ruled** |
| G6 | **Zero law drift** | everything above `## 5 · STANDING` compared byte-for-byte against R3 blob `a4dabcec` | **PASS — sha256 `047ea3d964693fd6…`, 35,989 chars, identical on both sides** |
| G7 | Diff containment | `git diff -U0` hunk headers | **PASS — `@@632,6→632,9@@`, `@@639→641,0@@`, `@@646,2→647,0@@`; §5 spans 629–648, so every hunk is inside it** |

⭐ **G6 is the load-bearing one.** *"No law changed"* is not asserted here — it is demonstrated by
a matching digest over 35,989 characters covering every invariant, every evidence binding, every
R2 correction and R3's deletion.

---

## 4 · WHAT R4 DOES NOT CLAIM

* ⛔ **R4 does not ratify.** It returns the object for ratification adjudication.
* ⛔ **R4 did not re-adjudicate the 31 laws.** Their standing is R2's and R3's, carried unchanged.
* ⛔ **R4 did not reopen R3's closing-synthesis repair**, which the return ruling recorded as
  verified complete.
* ⛔ **R4 did not re-run D9 or F5**, design any repair, or authorize implementation.
* ⚠️ **R4 corrected how the contract counts itself. It did not make any law more true.**

---

## 5 · THE CONDITION THE RETURN WAS FOR

The ruling's test was that ratification should attach to an object that tells the truth when
opened by itself.

Blob `b52c53eae03851fb6bf21dbc41a1f38fe3a003d1`, read alone, now states 31 locally earned D9/F5
invariant laws across 33 numbered sections, counts I-7 and I-10 once, classifies I-19 as a
declared gap and I-33 as imported prior law excluded from the local count, and no longer describes
itself as unadjudicated or names a spent act as its next one.

⭐ **The contract no longer depends on an overlay a reader would have to already know about.**

---

## 6 · STANDING

```
SPM-FC-01 R3             ⛔ RETURNED — superseded by R4
SPM-FC-01 R4             ✅ PASS — accounting corrected, §5 only
  G1–G7                    7 / 7 PASS
  law drift                ✅ ZERO — proven by digest, not asserted
  diff containment         ✅ §5 only, two hunks
SPM-FC-01                ✅ RATIFIABLE
RATIFICATION             ⛔ NOT TAKEN — founder act
IMPLEMENTATION           ⛔ CLOSED
SCHEMA / ROUTE / UI      ⛔ NOT AUTHORIZED
D9                       ✅ CLOSED
F5 ERASURE CONFORMANCE   ⛔ FAIL / STOP — unchanged by this act
PRODUCTION               ⛔ UNTOUCHED
```

> *Nine lines out, nine lines in, and 35,989 characters of law identical on both sides.
> The contract now counts itself the way three adjudications already said it should.*

**STOP.**
