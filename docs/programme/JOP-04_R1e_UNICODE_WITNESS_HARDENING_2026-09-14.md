# JOP-04 · R1e — The Unicode witness exercised only half its implementation sites

**Status:** ⭐ **SEALED. Instrument only.** ⛔ **No product edit. No pin moved. 18 boundaries — unchanged count.**

```text
CANDIDATE UNDER TEST   be1be3036      ⚠️ NOT ACCEPTED
JUDGE                  R1d 08a76e4c6  → D6-unicode strengthened here
BOUNDARIES             18 → 18        no nineteenth boundary; one boundary got stronger
```

> **The semantic law was already correct. Its witness was incomplete.** R1d stated the law
> broadly — *classification operates on code points, never UTF-16 halves* — but exercised only
> the **symbol** edges. The implementation indexes code units at **four** sites.

---

## The gap

`be1be3036` reads code units on the **content** side too:

```js
const leftOk  = i === 0 || !(leftEdgeIsWord  && isWordChar(content[i - 1]));
const rightOk = j === content.length || !(rightEdgeIsWord && isWordChar(content[j]));
```

⛔ So a superficially correct repair —

```js
const first = [...symbol][0];
const last  = [...symbol].at(-1);
```

— **passes R1d while leaving the defect live.** The new controls put an ordinary BMP letter in
the symbol and the surrogate pair in the **content**, immediately beside the occurrence:

```text
symbol   Ƶ  (U+01B5, a BMP Unicode letter)

Ƶ        standalone      → MATCH      the domain is not narrowed
𝒜Ƶ       astral-left     → NO MATCH   content[i-1] is the LOW surrogate of 𝒜
Ƶ𝒜       astral-right    → NO MATCH   content[j]   is the HIGH surrogate of 𝒜
```

A surrogate half is not a letter, so each misreads as a non-word constituent, the boundary is
wrongly accepted, and the symbol matches as a **fragment** of a longer word-constituent run.

**Measured at `be1be3036` — all three content-side arms fire:**

```text
BMP symbol · standalone=true · astral-left=true · astral-right=true
  ✔ found standing alone — the domain is not narrowed
  ✘ matched with an astral letter to its LEFT   — content[i-1] was the LOW SURROGATE
  ✘ matched with an astral letter to its RIGHT  — content[j] was the HIGH SURROGATE
```

⭐ **Four indexing sites are now witnessed, not two:** the symbol's first and last code points,
and the content code points immediately before and after the occurrence.

---

## Custody

```text
pinned fixture HEAD   3fac9c2fe3167a241f54b8e774d2bf48e30b55ef   UNCHANGED
pins changed          0
product changed       0
boundary count        18 → 18
```

New vectors extended the **separate** `buildSymbolDomainFixture()`. No nineteenth boundary was
created: `D6-unicode` simply became harder to satisfy.

## ⭐ The standing rule, applied

> **A new judge must still describe the ORIGINAL subject exactly — not merely diagnose the
> current candidate.**

Product temporarily restored to `2d3a39904`, judge run, product restored; nothing committed
from the measurement:

```text
R1e --phase pre at 2d3a39904   13 RED · 5 GREEN · 0 mismatches
```

## Result at the candidate

```text
--phase post   at be1be3036   2 RED · 16 GREEN ·  2 mismatches · exit 1
--phase pre    at be1be3036   2 RED · 16 GREEN · 11 mismatches · exit 1
```

The two mismatches remain `D6-unicode` and `D3-numeric`. The sixteen already discharged stayed
GREEN — the hardening did not disturb settled law.

---

## What the eventual correction must satisfy

```text
D6   classify ALL FOUR positions by CODE POINT, never code unit
       symbol first code point · symbol last code point
       content code point immediately BEFORE the occurrence
       content code point immediately AFTER the occurrence
     ⛔ no ASCII-only replacement — that narrows the domain D6 protects

D3   max_results ∈ integers 1…200
     ⛔ NOT "all numeric fields become integers" — D3 ratifies that domain for max_results
     enforced by the authoritative schema AND the Desktop boundary that mirrors it
```

```text
be1be3036             ⚠️ CANDIDATE · NOT ACCEPTED
R1e JUDGE             ✅ SEALED · 18 boundaries
PRODUCT CORRECTION    ⭐ conditionally authorized — surface: deterministic.mjs + capability-form.js
MERGE · PRODUCTION    ⛔ BLOCKED        RB-6B · check.run ⛔ OUT
```
