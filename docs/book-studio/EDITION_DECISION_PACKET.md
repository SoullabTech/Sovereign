# Edition Decision Packet — First Edition vs. Current Revision

**Date:** 2026-09-01 · **Manuscript state:** final QA closed (`2cfc0742`)
**Purpose:** decide, from measurement rather than from how large the revision *felt*, whether the
current revision ships as an **update to the live First Edition** or as a **Second Edition**.

---

## 0. What the baseline actually is — read this before the numbers

The repository does **not** contain `book-print-kdp-final(1).pdf`. It contains two rendered PDFs,
both produced by this branch's own pipeline (HeadlessChrome / Skia, 432×648 pt = 6×9 in) on
2026-08-31 — **mid-revision renders, not the published file.** Treating either as "the published
first edition" would have silently corrupted the comparison.

So the baseline was **rebuilt from the text, not borrowed from a file**: the manuscript as it stood
at the first commit on this branch (`5fdbc28a`) was rendered through the **identical** pipeline,
CSS, fonts, trim, and margins as the current revision.

**That baseline renders at exactly 216 pages** — the published book's page count, reproduced
independently from the as-published text. This is the strongest available evidence that the
pipeline reproduces the published interior's layout, and it makes the comparison below a pure
**content** comparison: same engine, same typography, one variable.

Baseline content verified as pre-revision: it carries the Tolle and Heraclitus epigraphs that were
later removed, and the pre-repair reading *"This key reminds us"*. It does **not** carry the Four
Grades of Fire.

---

## 1. The measurements

| | **First Edition (as published)** | **Current revision** | **Change** |
|---|---|---|---|
| **Rendered pages** | **216** | **199** | **−17 pages · −7.87%** |
| Extracted words (PDF) | 62,369 | 59,690 | −4.30% |
| Source words (markdown) | 62,036 | 59,509 | −4.07% |
| Trim | 6 × 9 in | 6 × 9 in | unchanged |
| Chapters / major divisions (H1) | 22 | 22 | **identical — zero added, zero removed** |
| Interior sections (H2 + H3) | 216 | 171 | −45 |
| Epigraph-form lines | 167 | 56 | −111 |
| Foreword | none | none | unchanged |
| Edition statement | First Soullab Press Edition | First Soullab Press Edition | unchanged |
| ISBNs | `-0-0` pbk / `-2-4` hc | same, unlabelled | unchanged |

*(The author's independent figure from the published PDF — ~62,626 words — gives −4.98%. Every
word-count method lands between −4% and −5%.)*

---

## 2. KDP's explicit page-count test

KDP requires a new edition when the interior changes page count by **more than 10%**.

```
216 pages ±10%   →   194.4 … 237.6
Permissible range →   195 … 237 pages
Current revision  →   199 pages          ✅ INSIDE, by 4 pages
```

**The revision clears KDP's explicit numerical trigger — but not by much.** Four pages of margin
is thin enough that any further subtraction should be re-rendered before upload, and thin enough
that it should not be treated as settled headroom.

---

## 3. What the −4% does not show

Net word count is the measure that most understates this revision. Underneath a −4% delta:

- **~111 epigraph-form lines removed** — the largest single source of the page reduction, and the
  reason pages fell faster (−7.87%) than words (−4.07%): epigraphs consume vertical space out of
  proportion to their word count.
- **Source language reclaimed into the author's voice** where quotations were misattributed,
  unverifiable, or decorative — 12 records reclaimed as author prose, 75 removed outright.
- **Correspondence claims reframed** — the four-way lens applied across ten chapters; ontological
  assertions restated as phenomenological ones.
- **Source and translation corrections** — Waley identified for two *Tao Te Ching* chapters, Weil's
  translator established, three witness-not-work citations repaired.
- **Structural duplication removed**, heading hierarchy repaired (H2 33→9 reflects that repair, not
  lost content).
- **New authorial content added: the Four Grades of Fire.** The published book contains the Four
  Grades of Water, Earth, and Air — **and not Fire.** That is a genuine gap in the printed product,
  now filled.
- **The Conclusion's closing movement changed** from fusion to relational wholeness.

Bowker's test is broader than KDP's: substantial revision or added content constitutes a new
edition; typo-level correction does not. **By Bowker's test this is unambiguously a new edition.**
By KDP's numerical test it is unambiguously within update range. Both are true at once.

---

## 4. Recommendation — the two-step, and why the measurements support it

**Now — update the live First Edition.**
The revision is inside KDP's page-count band, the chapter architecture is bit-for-bit identical
(22 H1s, no diff), and the product a buyer receives is recognizably the same book, corrected. The
strongest argument is ethical rather than procedural: the live book currently ships with
misattributed quotations, a missing Fire section, and correspondence claims the author has since
declined to make. Leaving that live for two months while a foreword is drafted is the worse option.

**Ship from `ELEMENTAL_ALCHEMY_CURRENT_EDITION.md`** — the production fork already carries First
Edition identity: `First Soullab Press Edition`, existing ISBNs unlabelled, no foreword. Verified
present in the rendered PDF; `Second Soullab Press Edition` verified **absent**. The canonical
`FROM_ORIGINAL_FULL.md` retains the Second Edition block and is never uploaded.

**Later — the Second Edition.**
Its status comes from the foreword plus the substantive revision, not from page count. Useful
production note: a foreword is likely to return several of the 17 lost pages, so the Second
Edition's physical object may land close to 216 pages again — the spine and cover geometry may
barely move even though the book is more substantial. **Do not let that page-count coincidence
argue against Second Edition status.** It is the content, and the added front matter, that make it
one.

**Do not assign `-3-1` / `-4-8` yet.** Nothing in these measurements requires them today, and the
Second Edition's final page count is not knowable until the foreword exists.

---

## 5. Reproducing this

```bash
# baseline: the as-published text through the current pipeline
git show 5fdbc28a:docs/book-studio/ELEMENTAL_ALCHEMY_FROM_ORIGINAL_FULL.md \
  > docs/book-studio/_AS_PUBLISHED_BASELINE.md
BOOK_MD=docs/book-studio/_AS_PUBLISHED_BASELINE.md npx tsx scripts/render-book-print.ts as-published-baseline

# the current-edition production interior
BOOK_MD=docs/book-studio/ELEMENTAL_ALCHEMY_CURRENT_EDITION.md \
  npx tsx scripts/render-book-print.ts current-edition-2026-09-01
```

`scripts/render-book-print.ts` now honours `BOOK_MD`; it previously hard-coded
`FROM_ORIGINAL_FULL.md`, which would have rendered the Second Edition metadata into a file destined
for the First Edition's ISBNs. Output lands in `exports/` — gitignored, so the PDFs are not in the
repository.

**Open — production, not editorial:** the rendered interior has not been checked for widows,
orphans, or bad page breaks introduced by the subtraction. That is a page-proof pass on the 199-page
PDF, and it is the last thing owed before upload.
