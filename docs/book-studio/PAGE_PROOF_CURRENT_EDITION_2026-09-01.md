# Production Page Proof — Current-Edition Interior

**Source:** `ELEMENTAL_ALCHEMY_CURRENT_EDITION.md` · **Trim:** 6 × 9 in (432 × 648 pt)
**Scope:** layout only. **No prose was changed.** Every fix below is CSS.

## Result

| | Before proof | After proof |
|---|---|---|
| Pages | 199 | **207** |
| vs. published 216 | −7.87% | **−4.17%** |
| KDP band (195–237) | inside by 4.6 pages | **inside by 12.6 pages** |
| Widows (line alone at page top) | 3 | **1** |
| Single-line pages | 4 | **3** (all part titles — correct) |
| Stranded headings | 2 | **2** (engine limit — see below) |
| Font substitution | none | none |
| Overflow / clipping | none | none |

**The proof improved the headroom.** Fixing the layout added pages, which moves the interior
*away* from the 10% floor rather than toward it. 207 is a safer number to upload than 199 was.

Metadata re-verified on the final render: `First Soullab Press Edition` present,
`Second Soullab Press Edition` absent, existing ISBNs unlabelled, no foreword.

## Fixes applied (CSS only)

1. **`orphans`/`widows` 2 → 3.** Trade convention is three. At 2 the proof left three single lines
   alone at a page top — including **the Conclusion's final line stranded on a page of its own**,
   a defect the subtraction introduced and the worst thing the proof found. Gone.
2. **Epigraphs: `break-inside: avoid` + `break-before: avoid`.** An epigraph is one unit and
   belongs to the heading above it.
3. **Blockquotes: `break-inside: avoid`.** A quotation block reads as one object.
4. **List items: `break-inside: avoid`.** A split item reads as two items.
5. **Headings: `break-inside: avoid`,** so a heading that wraps to two lines cannot split across
   the turn. Plus `h2/h3/h4 + p|ul|ol|blockquote { break-before: avoid }`.

### One fix was wrong and was reversed — recorded, not buried

`break-after: avoid` on epigraphs **made the book worse.** Chained against the heading's own
`break-after: avoid` it gave the engine an unsatisfiable constraint, which it resolved by breaking
*between* heading and epigraph — stranding the heading alone (p99, p146). Reversing to
`break-before: avoid` fixed it.

**The general lesson, now in the CSS comments:** this engine honours a break constraint declared on
the **later** element far more reliably than the same constraint declared on the earlier one. State
cohesion rules from the following element, not the preceding one.

## Remaining defects — 2, both engine limits, both recorded not fixed

- **p82** — *The Alchemy of Water: Cleansing Emotional Impurities* (Ch6)
- **p123** — *Embracing the Element of Air* (Ch8)

Both are h3s sitting at a page bottom with their body overleaf. Both carry `break-after: avoid`
*and* a following paragraph with `break-before: avoid`; Paged.js honours neither here. Confirmed the
markup is a clean `<h3>` + `<p>` sibling pair, so this is the renderer's ceiling, not a markup fault.

**Not fixed deliberately.** The available fix is an id-keyed `break-before: page` on those two
headings. It would work today and **misfire silently** the moment pagination shifts — which it will,
when Michael's foreword is added. A hard-coded page break that lands in the wrong place later is a
worse production hazard than two stranded subheads. Two in 207 pages is within normal trade
tolerance. **Author's call**; the fix is one CSS block if you want it.

- **p9** — one widow survives in the Preface (*"of peace, harmony, and love."*). `widows: 3` did
  not catch this instance. One in 207 pages.

## Checked and clean

- **Chapter/part opener parity — pre-existing, not a regression, deliberately not "fixed."**
  The published book is recto 7 / verso 9; the revision is recto 5 / verso 11. **The convention that
  openers fall on recto was never enforced in the published edition.** Forcing it now would insert
  up to eleven blank pages and make the interim update differ *more* from the object readers own,
  not less. Raise it for the Second Edition, where the foreword changes the pagination anyway.
- **Contents carries no folios** — it is a hand-curated prose TOC. Pagination churn therefore
  cannot desynchronise it. This is why the 199 → 205 → 206 → 207 iteration was safe.
- **Blank pages: 8**, all correct — verso blanks facing part titles and chapter openers.
- **Single-line pages: 3**, all part titles (*Part One / Two / Three*), which is what they are for.
- **Fonts:** EB Garamond only — Regular, Medium, Italic, Bold. All embedded, all subset, all
  Identity-H. **No substitution.**
- **Overflow / clipping:** maximum text extent 388.8 pt against a 432 pt page. Zero words past the
  margin.
- **Tables:** none in the manuscript. Not a risk.
- **Areas most changed by subtraction, inspected directly:** Preface, Ch5 Fire openings, Ch8 Air,
  Conclusion close, back matter flow. The Conclusion's stranded final line was the only defect the
  subtraction introduced, and it is fixed.

## Editorial issues found — RECORDED, NOT CHANGED

**None.** The proof found no textual or editorial issue. The manuscript stays closed.

## Re-rendering

```bash
BOOK_MD=docs/book-studio/ELEMENTAL_ALCHEMY_CURRENT_EDITION.md \
  npx tsx scripts/render-book-print.ts current-edition-2026-09-01
```
Requires `PUPPETEER_EXECUTABLE_PATH` pointing at a Chromium binary in this environment.
Any CSS change requires a re-render and a fresh page count before upload.
