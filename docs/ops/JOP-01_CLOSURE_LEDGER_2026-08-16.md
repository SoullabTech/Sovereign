# JOP-01 — closure ledger

**Date:** 2026-08-16 · **Canonical at closure:** `1c1e99578`
**Disposition:** ⚠️ **SOURCE CLOSURE ESTABLISHED · DISTRIBUTION CLOSURE OWED**

---

## ⚠️ Correction to an earlier closure claim

An earlier report in this lane presented a single ✓ column:

```
BUILT ✓  TESTED ✓  MERGED ✓  FRESH-CHECKOUT VERIFIED ✓
PACKAGED ✓  INSTALLED ✓  RUNNING ✓  FOUNDER-WITNESSED ✓
```

**Those eight marks cannot describe one artifact.** The installed app was packaged from
`a059264ea`; canonical is now `1c1e99578`; and the installed binary **predates two fixes that its
own founder walk demanded**. Presenting them as one column implies the running app carries
corrections it does not carry.

## The precise state

```
JOP-01 SOURCE / CANONICAL
  CANONICAL SHA            1c1e99578
  BUILT                    ✓
  TESTED                   ✓  256 assertions / 0 failures
  MERGED                   ✓
  FRESH-CHECKOUT VERIFIED  ✓

CURRENT CANONICAL PACKAGE
  PACKAGED                 ✗ NOT YET
  INSTALLED                ✗ NOT YET
  RUNNING                  ✗ NOT YET
  FOUNDER-WITNESSED        ✗ NOT YET

HISTORICAL PACKAGE
  PACKAGE SHA              a059264ea
  PACKAGED / INSTALLED / RUNNING / FOUNDER-WITNESSED   ✓ (all four)

POST-WITNESS FIXES
  canonical                ✓
  packaged                 ✗
  runtime witnessed        ✗
```

## Why this is not full closure — settled from the contract

The stated completion condition is:

> `BUILT → TESTED → MERGED → FRESH-CHECKOUT VERIFIED → PACKAGED → INSTALLED → RUNNING → FOUNDER-WITNESSED`

…**against the resulting artifact.** The resulting artifact is `1c1e99578`. It has never been
packaged. The four distribution legs were earned against a **different** SHA.

The prior founder walk is not void — it is what *found* the two defects. But a witness that produces
repairs cannot also witness those repairs. The sequence was: witness → defects → repair → canonical
verification. The final leg, **repackage and re-witness**, is outstanding.

⛔ Do **not** record JOP-01 as CLOSED on the strength of the `a059264ea` walk.

## Verified at canonical `1c1e99578`

Ancestry — all four JOP-01 commits are ancestors: `fc3936513`, `995ad35dd`, `d196ccf04`,
**`7253b57fb`** (the packaged-fix commit, preserved through two merge-updates without rewrite).

All four packaged-acceptance fixes present on canonical: the translated `UNKNOWN` sentinel, the
guarded unbound source line, the precedence panel, the precedence style.

Fresh-checkout suite totals — **actual, not asserted**:

| Suite | Result |
|---|---|
| `jop-01-legibility` | 39 / 0 |
| `jop-00-negative-controls` | 14 / 0 |
| `wire-local-native` | 15 / 0 |
| `c1-evidence-containment` | 17 / 0 |
| `desktop-c0-explorer-proof` | 52 / 0 |
| `jarvis-alpha-floor-proof` | 90 / 0 |
| `epistemic-ci-proof` | 29 / 0 |
| **Total** | **256 / 0** |

## How distribution closure is discharged

Not by a new unit. Steps 9–10 of the standing instruction already require packaging from canonical
after the Living Spiral implementation merges, installing a single referent, verifying its build SHA
and bound substrate, and conducting the founder walk. **That packaging carries the JOP-01
post-witness fixes**, and its walk witnesses them.

⭐ JOP-01 distribution closure therefore rides on the Living Spiral packaging step, and is recorded
here so it cannot be quietly forgotten between the two.
