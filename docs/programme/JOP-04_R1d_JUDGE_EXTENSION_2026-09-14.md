# JOP-04 · R1d — Two more boundaries: the numeric domain, and the policy's own Unicode rule

**Status:** ⭐ **SEALED. Instrument only.** ⛔ **No product edit. No pin moved. Merge blocked.**

```text
CANDIDATE UNDER TEST   be1be3036      ⚠️ NOT ACCEPTED
JUDGE                  R1c d274f5ea3  → extended here
BOUNDARIES             16 → 18
```

> Both findings were discovered by **inspecting the correction**, so the judge moves first. The
> R1c corrections themselves are sound and general — these are defects *inside* them.

---

## A · D3 numeric domain — the record and the act disagree again

D3 ratified `CALLER RANGE integer 1…200`. `validateSchema()` checks `typeof number`, `>= min`
and `<= max` — but never **finiteness or integrality**. Reproduced at `be1be3036`:

```text
max_results = 1.5    describe: effective_terms.max_results = 1.5    execute: 1 record
max_results = NaN    describe: effective_terms.max_results = null   execute: 0 records
```

⭐ **This is not input hygiene. It is the D4 correspondence law failing on a numeric domain.**
`slice(0, 1.5)` silently coerces to 1 and `slice(0, NaN)` to 0, so the execution-plan record
says one thing and the act performs another — the exact divergence R1c's D4-admission boundary
was created to close, reappearing through a value the schema never should have admitted.

⚠️ **And `NaN` cannot even be represented in the record it appears in:** `effective_terms`
serializes it as `null`. A canonical term that cannot survive its own serialization is not a
term.

The Desktop boundary is **asymmetric in the other direction** — it rejects non-finite numbers
but accepts fractional ones, because it also lacks an integrality test. A local validator that
claims to mirror the registry may not admit what the authoritative boundary refuses, so the
boundary exercises both admission surfaces.

## B · D6 — the host policy misapplies its own Unicode rule

R1c relocated whole-symbol policy into the host, which was right. But the implementation
classifies with `\p{L}` while indexing **UTF-16 code units**:

```text
symbol '𝒜'  (U+1D49C, a Unicode Letter)
  symbol.length                      2
  \p{L}.test(symbol[0])              false      ← a lone high surrogate
  \p{L}.test([...symbol][0])         true       ← the code point
```

⛔ So the policy reads its **own** stated notion of a word constituent incorrectly at the
symbol's edges. The consequence is real, not cosmetic: an astral symbol whose edge is wrongly
read as non-word becomes boundary-satisfied unconditionally, and therefore **matches as a
fragment** of a longer word-constituent run — `𝒜` inside `x𝒜`.

⛔ **An ASCII-only replacement is not admissible**: that would narrow the domain D6 exists to
protect. The law is general — *Unicode classification must operate on code points, never on
UTF-16 halves.* The character is only the falsifier.

---

## Custody

New vectors went into the **separate** `buildSymbolDomainFixture()`, never the D2.3-pinned one.

```text
pinned fixture HEAD before R1d   3fac9c2fe3167a241f54b8e774d2bf48e30b55ef
pinned fixture HEAD after  R1d   3fac9c2fe3167a241f54b8e774d2bf48e30b55ef   IDENTICAL
pins changed                     0
product changed                  0
```

## Phase targets — verified, not asserted

⭐ Rather than declare both new boundaries RED at the unrepaired subject, the product was
**temporarily restored to `2d3a39904`** and the judge run against it:

```text
D6-unicode   RED   the astral symbol THREW — `\b𝒜\b` was never a working query either
D3-numeric   RED   describe refuses even the VALID cases: no seam existed at all

full pre run at the unrepaired subject:   13 RED · 5 GREEN · 0 mismatches
```

⭐ **Zero mismatches at the unrepaired subject means the extended eighteen-boundary table still
describes that custody state exactly** — the extension did not drift the judge's account of
where this began. The product was restored to `be1be3036` immediately; nothing was committed
from that measurement.

## Result at the candidate

```text
--phase post   at be1be3036   2 RED · 16 GREEN ·  2 mismatches · exit 1
--phase pre    at be1be3036   2 RED · 16 GREEN · 11 mismatches · exit 1
```

⭐ **The two post-mode mismatches are exactly the two new boundaries. The sixteen already
discharged stayed GREEN.**

```text
be1be3036             ⚠️ CANDIDATE · NOT ACCEPTED
R1d JUDGE             ✅ SEALED · 18 boundaries
PRODUCT CORRECTION    ⛔ awaits a founder act
MERGE · PRODUCTION    ⛔ BLOCKED        RB-6B · check.run ⛔ OUT
```
