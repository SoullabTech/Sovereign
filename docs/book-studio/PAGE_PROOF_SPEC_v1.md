# Book Studio — Page Proof Specification v1

**Status:** Draft for review. No further code until reviewed and approved.

**Purpose:** Establish the boundary between sound software architecture and professional nonfiction book-design principles. Protect the work from becoming whack-a-mole.

**Mandate:** *Read Flow proves the book works. Page Proof must prove it can hold the book.*

---

## 0. Architectural layers (lock the boundaries)

| Layer | Owns | Authority | Status |
|---|---|---|---|
| **L1 — Deterministic engine** | Parser (structure) · Pagination (layout) · Renderer (typography) | Authoritative, non-AI | Mostly built; this spec finishes it |
| **L2 — Layout Health** | Detection of structural violations on rendered pages | Rule-based, observational | Defined separately; not in this spec |
| **L3 — Soullab aesthetic** | Rhythm of revelation · mythopoetic pacing · breath/density · emotional cadence | Encoded from Kelly's work | Far future |

**Hard rule:** L2 evaluates the renderer; never replaces it. AI critiques code, never overrides it.

### 0.1 Primary success condition

> **Page Proof must preserve the experiential continuity of Read Flow while introducing page structure.**
>
> If Page Proof feels more fragmented than Read Flow, the system is incorrect — regardless of visual quality.

This is the canonical gate for every change in this spec. No PR ships if it makes Page Proof feel less continuous than `/book-studio/read`.

### 0.2 Three sub-layers inside L1 — never blend

L1 fixes belong in exactly one of these three layers. A bug fixed in the wrong layer is a bug that returns. Every PR must declare which sub-layer it touches.

#### Structural layer — *what something is*

Owned by the parser (`parseManuscriptToPages`). Defines:
- What is a chapter
- What is front matter / back matter
- What is a part
- What is a section / subsection / sub-subsection
- What is a threshold (opener) vs body
- What is an epigraph
- What is a placeholder
- What is a quote
- What is a heading vs paragraph vs list

Structure is **classification only**. The structural layer never decides where a page break occurs or what something looks like.

#### Layout layer — *where it goes*

Owned by allocation logic (`addBlock`, `addInlineSectionHeading`, `startChapterOpener`, `addBlock`'s capacity check, `canFitOnPage`). Defines:
- Where pages break (only `#` forces breaks)
- How fill-first allocates content (capacity-driven continuation)
- Keep-with-next behavior (heading + first body block stay together)
- Continuation page rules
- Epigraph attachment to opener pages

Layout is **page-boundary policy only**. The layout layer never decides what is bold or italic; it never decides margins.

#### Typography layer — *how it renders*

Owned by `renderProofPage` and the `body.reading-mode .proof-*` CSS. Defines:
- Fonts (Georgia serif body)
- Margins (0.78in / 0.68in / 0.72in / 0.78in)
- Hierarchy (h2 / h3 / h4 sizes and weights)
- Alignment (left for body, centered for openers)
- Quote treatment (left border, italic, indent)
- Continuation marker styling

Typography is **presentational only**. It never invents structure or moves content between pages.

**Why this matters:** Without strict separation, the same bug gets fixed in three places. Examples:
- "Chapter N appears on Preface" is a *structural* bug (front-matter classification), not a typography bug.
- "Heading at bottom of page" is a *layout* bug (keep-with-next), not a structural bug.
- "Body text centered" is a *typography* bug (CSS), not a parser bug.

---

## 1. Source hierarchy

### 1.1 Heading-level semantics

| Markdown | Semantic role | Page allocation | Renders as |
|---|---|---|---|
| `#` | Chapter opener · Part opener · Front-matter section · Back-matter section | **Forces new opener page** | Centered threshold treatment (§2.1, §2.2) |
| `##` | Inline section heading | Flows inline (no forced break) | `<h2 class="proof-heading h2">` left-aligned (or centered on opener pages) |
| `###` | Inline subsection heading | Flows inline | `<h3 class="proof-heading h3">` left-aligned |
| `####` | Inline sub-subsection heading | Flows inline | `<h4 class="proof-heading h4">` left-aligned, distinct typography (§3.8) |
| `#####` / `######` | Collapse to `<h4>` styling for v1 | Same as `####` | Same `<h4>` treatment until manuscript needs deeper |

**Locked decisions (no further deliberation):**
- `####` is rendered as a distinct `<h4>` subheading, NOT mapped to `<h3>` and NOT left as paragraph text. See §3.8.
- All inline heading levels (`##`, `###`, `####`) flow on the current page; only `#` forces a new page.
- All inline headings are subject to keep-with-next (§3.4).

### 1.2 Front-matter classification — AUTHORITATIVE RULE

Front matter is a **first-class structural type**, not a side-effect of "chapter numbering suppression." The parser classifies it explicitly.

```
Front matter classification:

Headings matching:
- Contents
- Preface
- Introduction
- Dedication
- Disclaimer
- Acknowledgements (or Acknowledgments)
- Permissions
- Foreword
- Afterword
- Back Matter

→ classified as front-matter

Front-matter rules:
- always force a new page
- never receive chapter numbering
- use opener styling
```

**Detection:** case-insensitive whole-line match on the trimmed `#` heading text. Variants accepted: `Acknowledgements` / `Acknowledgments`, `Table of Contents` ↔ `Contents`. Any extension beyond this canonical list is a future spec change, not an inference.

**Type tagging:** the parser produces these pages with `type: 'Chapter Opener'` AND a marker `frontMatter: true` on the page object. The renderer consumes the marker to:
- Suppress the `Chapter N` subtitle (per §1.3)
- Apply opener styling (centered, threshold spacing, vertical breath)
- Mark the page-type slug as `proof-page-type-frontmatter` (distinct from `chapter-opener`)

**Part openers (separate type, same opener treatment):**
A `#` heading whose trimmed text starts with **`Part `** is a Part opener. Same rules:
- always force a new page
- never receive chapter numbering
- use opener styling (with `proof-page-type-part-opener` slug)

**Back matter** (extension, not in Kelly's canonical list — kept for completeness):
- Conclusion
- Epilogue
- Appendix · Appendices
- Bibliography · Additional Resources · Resources
- Index · Glossary · Notes
- About the Author · A Message to *

These get the same treatment as front matter (no chapter numbering, opener styling) but are tagged `backMatter: true` for future-proofing.

**Why this matters:** Without explicit classification, the system *reacts* to front matter (suppresses numbering when it sees the title) instead of *understanding it* (knows what type of page this is and applies the type's rules). Reaction breaks at edge cases; classification holds.

### 1.3 Chapter number derivation — AUTHORITATIVE RULE (non-negotiable)

```
Chapter numbering is derived ONLY from headings matching "Chapter X".

No auto-incrementing.
No inferred numbering.
No numbering applied to front matter or parts.
```

**Detection regex (the only source of chapter numbers):**

```
^Chapter\s+(\d+)\b
```

The number is taken **from the matched group**, never from a counter. The parser carries no `chapterIndex` variable that increments per `#` heading. The current `chapterIndex++` line is a regression to be removed.

**Worked examples:**

| Heading text | Subtitle |
|---|---|
| `Chapter 1: The Journey Begins` | `Chapter 1` |
| `Chapter 10 — The Living Spiral` | `Chapter 10` |
| `Preface` | (none) |
| `Part One — The Ground` | (none) |
| `Contents` | (none) |
| `Conclusion — Embracing Your Elemental Soul` | (none) |
| `Appendix` | (none) |
| `The Journey Begins` (no "Chapter" prefix) | (none) |

**Front-matter / back-matter / part suppression list (no chapter subtitle ever):**
See §1.2 for the canonical list. If a `#` heading text starts with `Part ` OR matches one of the front/back-matter terms (case-insensitive), no chapter subtitle is rendered, full stop.

**Validation (§5.2):** every Chapter Opener page with a "Chapter N" subtitle must satisfy `^Chapter\s+(\d+)\b` AND the number N must equal the captured group. Any deviation is a structural bug, not a styling preference.

---

## 2. Book-design rules

### 2.1 Chapter opener page

- Vertically centered text column
- "Chapter N" subtitle (small, letter-spaced) **only when** §1.3 derives a number
- Title (large, serif, centered)
- Optional epigraph attached **on the same page** (italic, indented, below title) — see §2.3
- No body content on this page; body begins on the next page
- No page number on opener (decision deferred)

### 2.2 Part opener page

- Same shape as chapter opener
- No "Chapter N" subtitle ever
- Title styled identically to chapter title (or with a marker like "PART ONE / The Ground" — decision deferred)
- Optional epigraph attached on same page

### 2.3 Epigraphs

Definition: a quote or short framing line authored by someone other than the immediate body voice, placed at the start of a chapter or part as tonal preparation.

**Rule:** An epigraph follows directly after a `#` heading and **before** the first body paragraph. It must render **on the opener page**, not on its own continuation page.

Detection patterns (any of):
- `> "…"` immediately after a `#` (with optional `— Author` line)
- `*"…" — Author*` (italic-quote shorthand) immediately after a `#`
- A short italic line `*…*` immediately after a `#` and before any non-italic body

If an epigraph is detected, it attaches to the opener page's body region (small italic indented block, NOT a stand-alone body page).

### 2.4 Body page

- Left-aligned prose
- Real book margins (top ~0.78in, sides ~0.68in/0.78in, bottom ~0.72in)
- Constrained measure (column ≈ 4.45in / ~65 chars per line)
- Serif body type
- Paragraph spacing tighter than card spacing (12px margin-bottom on `<p>`)
- Section heading (`<h2>`) margin-bottom 26px above first paragraph
- Quotes integrated, not boxed (left border + italic + indent)
- Lists: indented, normal disc/decimal markers, no card geometry
- Continuation pages: subtle "continued" marker top-right; never a big `(cont.)` heading interrupting prose

### 2.5 Section / subsection headings

- `<h2>` (level 2): section heading, larger weight
- `<h3>` (level 3): subsection heading, smaller
- `<h4>` (level 4): sub-subsection heading, smaller still (existing CSS doesn't render this — must add)
- All inline, never on their own page
- All keep-with-next (see §3.4)

### 2.6 Quote pages

A quote is **never** alone on a body page unless the manuscript explicitly intends a "quote page." Detection:

- An isolated quote between two `#` headings → attach to the preceding opener as epigraph (§2.3)
- An isolated quote in mid-chapter → render inline at the natural location

### 2.7 Whitespace philosophy

- **Intentional whitespace:** only on opener/threshold pages (chapter, part, intentional pauses)
- **Accidental whitespace:** anything mid-chapter — **never acceptable**

Mid-chapter pages with > 30% empty bottom indicate fill-first miscalibration; treat as a bug.

---

## 3. Parser rules

### 3.1 What forces a new page

Only `#` headings (chapter, part, front matter, back matter). Nothing else.

### 3.2 What flows inline

`##`, `###`, `####` headings · text paragraphs · quotes · lists · images.

### 3.3 Capacity-based pagination

A continuation page spawns when, and only when, the next block's estimated height + accumulated page height exceeds `MAX_HEIGHT` (currently 900). See §3.7 for keep-with-next override.

### 3.4 Keep-with-next — HARD RULE (no exceptions, no heuristics)

```
A heading cannot appear without at least one following paragraph or quote
on the same page.

If insufficient space:
→ move heading and first block to next page.
```

This is a hard rule, not a hint. There is no "try to keep them together" — they are kept together or both move. No exception clauses, no soft thresholds, no special-case bypass.

**Layer:** Layout (per §0.2). Implementation lives in `addBlock`, never in the renderer or the parser's structural classification.

**Implementation contract:**

```
ON addBlock triggering a continuation due to capacity:
  IF the last block on the current page is a heading (h2 | h3 | h4):
    pop the heading off the current page
    decrement page._height by estimateBlockHeight(heading)
    spawn the continuation page (existing behavior)
    re-append the heading to the continuation page first
    re-append the new block (which triggered the break) second
  ELSE:
    spawn continuation as before
```

The heading and the first body block now occupy the continuation page together. The current page ends one block earlier than it would have. **No content is lost, mutated, or reordered** — only the page boundary moves.

**Edge cases:**
- Two headings in a row at end of page → both move (recursive application of the rule).
- Heading is the only block on a page → that page never existed in the first place; the heading was the first block on the page that just spawned. No-op.
- Chapter Opener pages (`#`) are exempt — their structure is intentionally heading-then-empty (§2.1). The rule applies only to inline headings (`##`, `###`, `####`) on body pages.

**Validation (§5.1):** for every Body page in `parseManuscriptToPages` output, the last block's `kind` must NOT be `heading`.

### 3.5 Placeholder handling — EXPLICIT RULE

```
Lines matching:
  *[ ... ]*
or containing "to be authored"

→ are suppressed in Page Proof
→ remain visible in Edit Mode
→ remain in the source markdown (Read Flow's surface)
```

**Detection patterns (any match):**

```
Pattern A:  ^\s*\*\[[^\]]+\]\*\s*$        (italic-bracket placeholder)
Pattern B:  /to be authored/i              (anywhere on the line)
Pattern C:  ^\s*\*\[\s*TODO[^\]]*\]\*\s*$  (italic-TODO bracket)
Pattern D:  ^\s*\[(TBD|TODO)[^\]]*\]\s*$   (plain-bracket TODO)
```

**Worked examples:**

| Source line | Suppressed in Page Proof? |
|---|---|
| `*[Epigraph or framing line — to be authored by Kelly.]*` | yes |
| `*[TODO: Add citation]*` | yes |
| `[TBD]` | yes |
| `It was time to be authored. He said softly...` | **no** — narrative use of "authored" in prose; pattern B requires whole-line context. *Refinement: pattern B fires only when the line is short AND contains "to be authored" AND has fewer than 12 words.* |
| `**Important** announcement here.` | no — bold emphasis, not placeholder |

**Layer:** Structural (per §0.2). The parser drops placeholder lines before they become blocks. They never enter the page allocation pipeline.

**Edit Mode behavior:** The parser is shared between Page Proof and Edit Mode (§5.8). To preserve "remains visible in Edit Mode," the placeholder line is converted to a special block type `kind: 'placeholder'` that the **edit-mode renderer** displays (with a faded amber tint to mark "author TODO") but the **proof renderer** suppresses entirely. Stored block data carries the placeholder flag; rendering decides visibility per surface.

**Validation (§5.4):** No Page Proof page may contain rendered text matching pattern A, B, C, or D. Edit Mode may show placeholder blocks with their amber treatment.

### 3.6 Markdown noise cleanup (already mostly done, kept for completeness)

- Standalone bold lines `**Word**` → heading L2 (#269)
- Inline `**bold**` markers stripped from text (#269)
- Em-dash + hyphen attribution doublet `— -` → `—` (#269)
- `&nbsp;` and other HTML entities decoded (#269)
- Pandoc attribute syntax `{#anchor .class}` stripped from heading text (currently TODO)

### 3.7 Quote attachment to opener (currently broken — must add)

When a `#` heading is immediately followed (with only whitespace between) by a `>` blockquote OR italic-quote OR short italic line, the parser must:

- Append that quote to the opener page (small italic block, vertically below the title)
- Not start a new body page until after the epigraph
- The next non-quote block triggers a new body page

### 3.8a Continuation integrity — HARD RULE

Pairs with §3.4 (keep-with-next). Both rules together prevent the subtle fragmentation that visible in current-state Page Proof screenshots.

```
Continuation rule:

A page marked as continuation (cont.):

- must not begin with a heading
- must not begin with a quote
- must continue the previous paragraph flow

If violated:
→ pull prior content forward or push heading/quote to next page
```

**Layer:** Layout (per §0.2). Implementation is parser-side allocation only; no content mutation.

**Detection at allocation time:**

When `addBlock` triggers a continuation page (capacity overflow):
1. Determine what the FIRST block of the continuation will be (the block that triggered the break, plus any heading carried by §3.4 keep-with-next).
2. If that first block is a `heading` → §3.4 already handles this case (heading must come from current page bottom along with first body block; never starts continuation alone).
3. If that first block is a `quote` and the previous page's last block is **not** the quote's natural lead-in (heading or paragraph that introduces it):
   - Pull the immediately-preceding text block from the previous page **forward** to the continuation, so the quote arrives with its lead-in.
   - The previous page ends one block earlier; the continuation page starts with `[lead-in paragraph][quote]`.
4. If that first block is mid-paragraph (i.e., the previous page's last block is a paragraph that was about to be split) — current behavior is correct; paragraph flow continues.

**Edge cases:**
- Two consecutive headings at end of page → both move via §3.4 (recursive).
- Quote with no natural lead-in available (e.g., it's the first block of the chapter section) → render the quote at the top of the continuation; no lead-in to pull. Mark the page-type as `quote-page` so future Layout Health rules don't flag it as orphan (§5.5).
- Continuation of a continuation (`(cont.) (cont.)` situation) — does not happen in current code; the label is appended once. If it does, treat the same as any continuation.

**Validation (§5.x — added):** for every page whose label ends in `(cont.)`:
- The first block's `kind` must NOT be `heading` (covered by §3.4 + this rule).
- The first block's `kind` must NOT be `quote` UNLESS the page is type `quote-page` OR the previous page ended on a heading or sentence-completing punctuation.

### 3.8 `####` handling — LOCKED DECISION

**Decision:** `####` headings render as a distinct `<h4>` subheading style with its own typography. They are **NOT** mapped to `<h3>` (would erase semantic distinction). They are **NOT** rendered as paragraph text (would leak `####` literal markers).

**Parser rule:**

```
Source line matching: ^####\s+(.+)$
→ addInlineSectionHeading(text, 4)
→ produces block { kind: 'heading', level: 4, text }
```

Same allocation behavior as `##` and `###` (inline, no forced page break, subject to keep-with-next).

**Renderer rule (typography layer, §4):**

```css
body.reading-mode .proof-heading.h4 {
  font-family: Georgia, "Times New Roman", serif;
  font-size: 16px;        /* between body 13.5 and h3 ~18 */
  line-height: 1.18;
  font-weight: 600;
  text-align: left;
  margin: 18px 0 10px 0;  /* tighter than h3 */
  color: #2a221a;
}
```

The `proof-heading` element gets an additional class `h${level}` so CSS can target each heading level distinctly. (Currently the renderer emits `proof-heading` only without level class — to be added.)

**Same rule extends to `#####` and `######` (`<h5>`/`<h6>`):** map to level 4 styling for now (collapse 4/5/6 to a single `<h4>` visual treatment until the manuscript actually requires deeper levels). When that day comes, add `<h5>` styling explicitly — until then, levels 4–6 share the `<h4>` typography.

**Validation:** `#### Title` produces a heading block (not a paragraph), the heading text contains no `#` characters, and the rendered DOM has no literal `####` substrings (§5.3).

---

## 4. Renderer rules

### 4.1 Two surfaces, two render paths

- **Edit Mode** (`renderCanvas` default path) — absolute-positioned `.block` divs with x/y/w/h. Editor affordances visible: dashed borders, resize handles, selection. Untouched by this spec.
- **Page Proof** (`renderProofPage`) — semantic HTML in normal document flow. No absolute positioning, no editor affordances, no `.block` elements produced.

Dispatch is by `isReadingMode()` inside `renderCanvas`.

### 4.2 Single design system across Proof and Export

**Hard rule:** Page Proof and Export PDF must share the same renderer / CSS. Otherwise the studio lies.

Translation: Export PDF's render path must use `renderProofPage` (or its server-side equivalent producing identical HTML/CSS) — not a different paged-media generator with different rules. This locks "what you see is what you publish."

Currently: Page Proof renders in the iframe; Export PDF route exists separately. **Spec requires:** the Export route consumes the same `renderProofPage` output (or uses Paged.js / Puppeteer to PDF the proof iframe).

### 4.3 Render-time safety net

`cleanProofText` mirrors the parser cleaners (`**` strip, `&nbsp;` decode, em-dash doublet) so that pre-cleanup-PR imports still proof clean. **Read-only:** never mutates stored block data.

### 4.4 Page-type rendering

Each page has `proof-page-type-{slug}` class. CSS rules per type:

| Page type | Treatment |
|---|---|
| `chapter-opener` | Vertically centered flex; max-width 4.7in; centered text; larger heading |
| `part-opener` | Same as chapter-opener |
| `frontmatter` | Same as chapter-opener (no chapter subtitle present) |
| `backmatter` | Same as chapter-opener |
| `body` | Top-aligned, left-aligned, paragraph rhythm |
| `image-plate` | Full-page image, minimal margins |
| `doorway` | Full-page elemental marker, centered |

### 4.5 Continuation pages

A page whose label ends in `(cont.)` is a continuation. Render rules:

- Heading block whose text is just `(cont.)` is suppressed
- Subtle "continued" marker top-right (or omit if no heading on the page)
- Body content flows continuously from previous page — should feel uninterrupted

### 4.6 Italic and emphasis

- `<em>` rendered with `font-style: italic`
- Surrounding `*…*` markers in source: convert to `<em>…</em>` in proof render (no literal asterisks visible)
- Underscore italic `_…_`: same treatment
- Render-time conversion (not parser strip), so source data preserves authoring intent

---

## 5. Validation tests

Each test runs against the parser output (or proof DOM, where noted). All must pass before a Page Proof read is considered "L1 complete."

### 5.1 No widow heading
- For every page in `parseManuscriptToPages` output:
- The **last block** must NOT be a heading.
- (Trivial pass: chapter-opener pages are exempt — their structure is heading-then-empty by design.)

### 5.2 No invented chapter numbers
- For every Chapter Opener page with a "Chapter N" subtitle block:
- The page's title must match `^Chapter\s+(\d+)\b` and N must equal the captured group.
- For every Chapter Opener page WITHOUT a "Chapter N" subtitle:
- The title must be in the front-matter / back-matter / Part list (§1.2) OR not match `^Chapter\s+\d+`.

### 5.3 No raw markdown artifacts in proof DOM
- After `renderProofPage`, the DOM text content must contain none of:
- `**` `*…*` (literal-asterisk italic) `_…_` (literal-underscore italic)
- `&nbsp;` `&amp;` `&quot;` `&apos;` `&#39;` `&lt;` `&gt;`
- `{#…}` (pandoc attribute syntax)
- `— -` `— –` (em-dash doublet)
- `*[…]*` (placeholder)
- `####` `#####` `######` (literal heading markers)

### 5.4 No placeholder pages
- No page contains a single block whose text matches `*[…]*`
- No page is rendered solely from a placeholder line

### 5.5 No orphan quote pages
- For every body page where the only content blocks are quote(s):
- Those quotes must be attached to the preceding opener as epigraph (§3.7), OR
- The manuscript explicitly marks the page as a quote page (a future page-type, deferred)
- A quote-only body page that doesn't satisfy either is a structural failure.

### 5.6 Page-density floor
- Every body page (excluding `(cont.)` final overflow tails) should have estimated content density ≥ some threshold (TBD; first pass: 60% of MAX_HEIGHT).
- Exempt: chapter-opener · part-opener · image-plate · doorway · the last continuation of each chapter.

### 5.7 Page count sanity
- Predicted page count for the current Elemental Alchemy manuscript should fall in the band: **220–280**.
- A predicted count outside this band signals miscalibrated capacity or a parser regression.

### 5.8 Single parser path
- Both `importManuscriptText` and `autoTypesetCurrentPage` must call the same `parseManuscriptToPages` function.
- (Verified continuously by the verification pass that audited #273.)

### 5.9 Edit Mode regression check
- Open `/book-studio/canvas` (not in Page Proof).
- Verify drag, resize, double-click-to-edit, and inspector all behave as before.
- No proof-related changes leak into Edit Mode.

### 5.10 Read Flow ↔ Page Proof equivalence (qualitative gate)
- Open `/book-studio/read`. Read 60–90 sec. Note the experience.
- Open Page Proof for the same passage. Read 60–90 sec.
- Verdict: *do you feel the same thing?* If yes → L1 holds. If no → identify the specific interruption.

---

## 6. Implementation order (LOCKED — after spec approval)

This order is non-negotiable per the master review. Each PR is narrow, parser- or render-layer-only per §0.2, and re-tested before the next begins.

```
1. Chapter logic            (#275)
2. Keep-with-next           (#273b)
3. Placeholder suppression  (#276a)
4. #### handling            (#279)
5. Re-test Page Proof       (qualitative §5.10 + automated §5.1–§5.9)
6. Layout Health v1         (LAYOUT_HEALTH_SPEC_v1.md, minimal scope)
```

**Detailed PR breakdown:**

| Order | PR | Layer (§0.2) | Spec sections | Fixes validation tests |
|---|---|---|---|---|
| 1 | **#275** Smart chapter numbering | Structural | §1.2, §1.3 | §5.2 |
| 2 | **#273b** Keep-with-next (hard rule) | Layout | §3.4 | §5.1 |
| 3 | **#276a** Placeholder suppression + italic render-time conversion | Structural + Typography | §3.5, §4.6 | §5.3, §5.4 |
| 4 | **#279** `####` handling | Structural + Typography | §1.1, §3.8, §4.4 | §5.3 |
| — | **Gate: re-test Page Proof** | (qualitative + automated) | §5 in full | — |
| 5 | **#280** Epigraph attachment | Structural | §2.3, §3.7 | §5.5 |
| 6 | **#281** Pandoc `{#anchor}` strip on headings | Structural | §3.6 | §5.3 |
| — | **Gate: re-test Page Proof again** | — | — | — |
| 7 | **L2 Layout Health v1** | (new layer) | `LAYOUT_HEALTH_SPEC_v1.md` | (its own validation) |

**Hard rule:** PRs 5–6 do not begin until the qualitative gate after PR 4 passes. L2 (PR 7) does not begin until PR 6's gate passes. No skipping ahead.

**Qualitative gate after each cluster:**

> Open `/book-studio/read`, then `/book-studio/canvas` → 📖 Page Proof. Read 60–90 sec on each.
>
> Verdict: `holds the book` or `still breaks because ___`.
>
> If `holds the book` → next PR.
> If `still breaks because ___` → that becomes the spec v2 entry. Do not advance.

---

## 7. What's explicitly NOT in this spec

- L2 Layout Health rules (defined separately when L1 is stable)
- L3 Soullab aesthetic encoding (far future)
- Spread mode (Single / Two-Page Spread toggle — separate small PR after L1 stable)
- Image / doorway / image-plate full-page rendering (deferred until manuscript requires)
- Cross-page typography optimization (widow/orphan beyond keep-with-next, hyphenation, justification refinement)
- Layout Intelligence panel UI

---

## 8. Open questions for review

- §2.1: should chapter-opener pages have page numbers? (Most books: no.)
- §2.2: should Part openers visually differ from Chapter openers (e.g., "PART ONE" overline)? Or stay identical?
- §2.7: density floor in §5.6 — is 60% of MAX_HEIGHT the right threshold, or should it be content-aware (e.g., last page of chapter exempt)?
- §4.2: Export PDF parity — implement now (one PR after L1 stable) or defer to its own track?
- §5.7: page count band 220–280 — does this match author intent for the manuscript's print length?
- §3.5: should the placeholder pattern detect more variants (e.g., `[TBD]`, `[…]` plain-bracket)?

---

*End of spec v1.*
