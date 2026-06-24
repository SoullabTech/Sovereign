# Mayan Three-Pillar (Mark Elmy) — Findings & Decision Memo

**Date:** 2026-06-05
**Context:** Kelly proposed adding Mark Elmy's three-pillar Mayan developmental lens
(Conception / Core / Elder, + left/right-hand powers) to MAIA, wrapped in the
epistemic boundary proven by the Da Yun ablation. This memo records what
verification found before any of it shipped.

> Headline: the **epistemic wrapper already existed** (`SYMBOLIC_LENS_BOUNDARY`,
> commit `8d6f6508d` "Deploy 2", deployed off an unmerged branch) — the version
> written this session was a duplicate and was reverted. The **three-pillar feature
> is an architecture replacement** (already a HELD project), not a relabel — gated on
> a count-system mismatch. This memo's durable asset is the **decoded +
> double-validated Maya Cross formula** (Finding 2), which reproduces both CeCe's and
> Kelly's authoritative grids and so removes the hard unknown from that build.

---

## Finding 1 — the existing "Path of Life" pillars are DEGENERATE

`calculatePathOfLife()` (`lib/astrology/mayanAstrology.ts`) derives youth /
adulthood / future by offsetting the birth date by **±180 days**. But
`180 = 9 × 20`, an exact multiple of the 20-day day-sign cycle, so **all three
pillars land on the same nawal**; only the 13-day galactic tone differs (±2).

Verified for Kelly (1966-12-09): Foundation/Core/Emerging = **Planetary Lamat /
Galactic Lamat / Rhythmic Lamat** — distinct pillar count **1 / 3**.

⇒ "Relabel the existing pillars as Foundation/Core/Emerging" surfaces "Lamat ×3".
The relabel path is void.

## Finding 2 — Mark Elmy's Maya Cross formula: DECODED + VERIFIED (9/9)

From Mark Elmy's worked example (CeCe, 27 Jul 1976, core **7 Kʼat**), the
"Tree of Life" 3×3 grid decomposes exactly. Let the birth kin be
`n0` = nawal index 0–19 (canonical order Imix/Imox=0 … Ahau/Ajpu=19) and
`t0` = tone 0–12. For a cell at `(row r, col c)`:

```
row r:  -1 = Child / Conception (top)     col c:  -1 = Right-Hand Power
         0 = Adult (birth row)                     0 = Center (life-stage pillar)
        +1 = Elder (bottom)                       +1 = Left-Hand Power

nawal = ((n0 + 6*c + 8*r) mod 20)
tone  = ((t0 + 6*c - 5*r) mod 13)
```

Central pillars (`c = 0`):
| pillar | nawal | tone |
|---|---|---|
| Conception (r=−1) | n0 − 8 | t0 + 5 |
| Core (r=0)        | n0     | t0     |
| Elder (r=+1)      | n0 + 8 | t0 − 5 |

Hand powers are **±6 kin** horizontally (RHP = −6, LHP = +6). RHP = the **trecena
lord** (start of the 13-day period) — independently confirmed by the PDF's
"Trecena – Tijax" for CeCe.

**Validation — reproduces all 9 of CeCe's cells** (core 7 Kʼat = nawal #4, tone 7):

```
Child RHP 6 Tzʼi  |  Conception 12 Ajmak  |  Child LHP 5 Iqʼ
Adult RHP 1 Tijax |  CORE       7 Kʼat    |  Adult LHP 13 Tzʼi
Elder RHP 9 Kame  |  Elder       2 Eʼ     |  Elder LHP 8 Tijax
```

Caveat: derived from a single worked example. It is over-determined (4 step
parameters fit 16 numbers across 8 non-center cells, plus the trecena
cross-check), so confidence is high — but **validate against a 2nd known chart
before full trust**.

Canonical positional map (code Yucatec ↔ Mark Elmy Kʼicheʼ), PDF-confirmed
("Kʼat … corresponds with the Yucatec glyph Kan"):
`Imix=Imox, Ik=Iqʼ, Akbal=Aqʼabʼal, Kan=Kʼat, Chicchan=Kan, Cimi=Kame,
Manik=Kej, Lamat=Qʼanil, Muluc=Toj, Oc=Tzʼi, Chuen=Bʼatz, Eb=Eʼ, Ben=Aj,
Ix=Ix, Men=Tzʼikin, Cib=Ajmaq, Caban=Noʼj, Etznab=Tijax, Cauac=Kawoq, Ahau=Ajpu`.

## Finding 3 — THE BLOCKER: count-system mismatch (Dreamspell vs traditional)

The code's Mayan engine is the **Dreamspell / Argüelles** count: tone names
Magnetic/Lunar/Electric/Self-Existing/Overtone/Rhythmic/Resonant/Galactic/
Solar/Planetary/Spectral/Crystal/Cosmic, Yucatec sign names. Mark Elmy uses the
living **traditional Guatemalan Cholqʼij** count (Kʼicheʼ names, numeric tones).

They disagree. For CeCe (27 Jul 1976):

| | day sign | tone | signature |
|---|---|---|---|
| Code (Dreamspell) | Chicchan (#5) | 2 | "Lunar Chicchan" |
| Mark Elmy (traditional) | Kan/Kʼat (#4) | 7 | "7 Kʼat" |

Offset ≈ **21 kin** (`D ≡ 1 mod 20`, `D ≡ 8 mod 13`). This is **not** a timezone
artifact — tz shifts the day by ±1 at most; here tone is off by 5 and sign by 1.

⇒ Applying the verified cross formula to the code's Dreamspell core produces
**wrong (non-Elmy) pillars**. Faithful Mark Elmy pillars require a **new
traditional Cholqʼij count** (GMT correlation 584283, no leap-day skip) + Kʼicheʼ
naming, *then* the cross. This also means **MAIA's current birth sign is
Dreamspell and silently contradicts any member's traditional reading** (e.g. CeCe,
who has a Mark Elmy report).

---

## This session — what changed (post-reconciliation)

- **Boundary wrapper: NOT new.** The `SYMBOLIC_FRAMEWORK_BOUNDARY` first added here
  duplicated the already-deployed `SYMBOLIC_LENS_BOUNDARY` (commit `8d6f6508d`), which
  prepends the same boundary to the astrology + Wu Xing addenda **at the route** —
  already covering FAST+CORE (it travels with the addendum string). **Reverted** to
  avoid a competing primitive.
- **Kept: `[object Object]` tone-bug fix** (`.tone.name`) at
  `maiaAstrologyContextService.ts` lines 535 / 568 / 1092 / 1095 — `8d6f6508d` does
  not touch these.
- **Kept:** the thin Mayan block cleaned to an honest single Core-sign interim (drops
  the degenerate duplicate "adulthood pillar").
- **Branch state — VERIFIED (corrects an earlier false alarm in this doc):** production
  (minisforum) runs `clean-main-no-secrets` @ `7a345d170`, which **contains** both
  `8d6f6508d` (boundary) and `66ef4ab60` (BaZi/Da Yun); the running container's bundle
  carries the boundary, Da Yun, and Wu Xing strings; prod and `origin/clean-main` are
  consistent (0/0). The earlier "clean-main is missing them" claim came from a **stale
  local** `clean-main` ref (`a66eb8c1b`, 29 behind / 4 ahead of origin) — there is no
  prod↔source divergence. Real items: `git fetch` + reconcile the local ref, and move
  these astrology edits off the marketing-docs branch onto a feature branch from
  `origin/clean-main`.
- **Optional follow-up:** extract the route-inline `SYMBOLIC_LENS_BOUNDARY` into a
  shared module so Da Yun / future lenses import one source.

## Decision (pending Kelly)

- **A — Build it right.** New traditional Cholqʼij count + the verified cross +
  Kʼicheʼ names. True Mark Elmy. Biggest build; forces a Dreamspell-vs-traditional
  **source-of-truth** decision for MAIA's whole Mayan layer. Validation gate:
  reproduce CeCe = 7 Kʼat and the full 9-cell grid.
- **C — Hold pillars; ship the safe wins.** Keep the wrapper + tone fixes; surface
  only the honest Core sign for now; make A its own scoped build later.
- **D — Cross on the Dreamspell count.** Distinct pillars immediately, no new count
  system — but values will NOT match members' traditional reports, so it must be
  labeled Dreamspell, never "Mark Elmy." (Risks the inflation it set out to avoid.)
