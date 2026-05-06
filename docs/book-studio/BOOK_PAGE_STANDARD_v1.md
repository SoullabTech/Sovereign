# Book Page Standard — v1

**Status:** Draft for review. No further implementation until reviewed and approved.

**Purpose:** Establish the canonical nonfiction-page standard that every future change must satisfy. Stops patching one symptom at a time. Defines what a *proper book page* is — structurally, compositionally, aesthetically, and experientially — so the validation suite has something to enforce.

**Relationship to other specs:**
- `PAGE_PROOF_SPEC_v1.md` — *how* the engine works (parser, layout, renderer, validation tests).
- `LAYOUT_HEALTH_SPEC_v1.md` — *how the system observes itself* (L2 evaluator).
- **This document** — *what a correct page is.* The other two specs must satisfy this one.

If a rule in `PAGE_PROOF_SPEC_v1.md` contradicts this standard, this standard wins and the spec is updated.

---

## 0. Primary law

> **Page Proof must preserve the experiential continuity of Read Flow while introducing page structure.**
>
> If Page Proof feels more fragmented than Read Flow, the page is wrong — regardless of visual quality.

This is the canonical gate. Every rule below derives from it.

---

## 1. Page types

A page is exactly one of the following types. The parser tags each page with its type; the renderer applies type-specific rules; the validator checks rules per type.

### 1.1 `frontmatter-opener`

**Definition:** A `#` heading whose trimmed text is a front-matter section name (Contents, Preface, Introduction, Dedication, Disclaimer, Permissions, Foreword, Afterword, Acknowledgments, Back Matter, etc.).

**Rules:**
- Always forces a new page
- NEVER receives a chapter label
- Treated visually as an opener (centered, threshold spacing, vertical breath)
- May receive an attached epigraph (italic block below title) — see §2.5
- Body text on the same page is allowed if the section is short (e.g., a one-paragraph Disclaimer); longer bodies flow onto a body page

### 1.2 `part-opener`

**Definition:** A `#` heading whose trimmed text begins with `Part ` (case-insensitive).

**Rules:**
- Always forces a new page
- NEVER receives a chapter label
- Treated visually as an opener (centered, threshold spacing, larger breath than chapter opener)
- May receive an attached epigraph
- Always followed by a chapter opener (or an explicit transition page) — never directly by body content

### 1.3 `chapter-opener`

**Definition:** A `#` heading whose trimmed text matches `^Chapter\s+(\d+|[IVXLCDM]+)`.

**Rules:**
- Always forces a new page
- Receives a "Chapter N" subtitle, where N is extracted from the heading text — never from a counter
- Title displayed without the "Chapter N:" prefix (e.g., source `Chapter 1: The Journey Begins` renders as label `Chapter 1` + title `The Journey Begins`)
- Treated visually as an opener (centered, threshold spacing)
- May receive an attached epigraph
- Body content begins on the next page

### 1.4 `body`

**Definition:** Any non-opener page. Built by capacity-driven flow under a chapter, part, or front-matter section.

**Rules:**
- Top-aligned, left-aligned prose
- Real book margins (~0.78in × 0.68in × 0.72in × 0.78in)
- Constrained measure (~4.45in / ~65 chars per line)
- Content density target range — see §3
- Never starts with an unanchored heading or quote — see §2.3 / §2.6
- Never ends with a heading — see §2.2

### 1.5 `body-continuation`

**Definition:** A `body` page produced by capacity overflow from a previous body page. Carries the previous page's label + ` (cont.)`.

**Rules:**
- Never begins with a heading (heading must come from previous page along with its first paragraph — see §2.2)
- Never begins with a quote without lead-in (see §2.6)
- Continues the prior page's prose flow — first block is the next sentence/paragraph, not a fresh thought
- A subtle "continued" marker may appear in the page bar; never as a heading block on the page itself

### 1.6 `quote-page` (intentional)

**Definition:** A page whose entire content is one or more quotes, marked explicitly as a quote-page in the manuscript (e.g., a chapter epigraph that gets its own facing page in print).

**Rules:**
- Centered text column
- Italic, indented, integrated quote treatment
- Allowed intentional whitespace
- Validator does NOT flag this as a "quote orphan"
- Currently NOT auto-detected — would require a manuscript marker; deferred until needed

### 1.7 `image-plate` / `doorway`

**Definition:** Pages whose content is primarily a full-bleed or large image (image-plate) or an elemental marker (doorway).

**Rules:**
- Image fills the page area
- Minimal margins
- No body text
- Validator does NOT enforce density rules

---

## 2. Hard composition rules

These are absolute. No exceptions, no heuristics. A page violating any of these is incorrect.

### 2.1 No invented chapter numbers

A "Chapter N" subtitle exists ONLY when the page's title heading matches `^Chapter\s+(\d+|[IVXLCDM]+)` and N is the captured value. No counter. No inference. No numbering on Part openers or front matter.

### 2.2 Heading must never be the final meaningful block on a page

Specifically: the last block of a `body` or `body-continuation` page must NOT be a heading (h2 / h3 / h4).

If adding the next block (paragraph, quote, list, image) would force a continuation, the heading and at least its first following paragraph or quote MUST move together to the continuation. Heading + first body block stay together — always.

In the rare case where heading + first body block exceed page capacity together (estimated >900 px), they STILL stay together — overflow is acceptable; widow is not.

### 2.3 Continuation page must not begin abruptly

A `body-continuation` page must NOT begin with:
- a bare heading without following paragraph (covered by §2.2)
- a bare quote without a lead-in paragraph from the previous flow

If a quote would begin a continuation without lead-in, the previous text block (paragraph) must be pulled forward to anchor it. The quote arrives with its lead-in.

### 2.4 No raw markdown artifacts

A rendered Page Proof page must not contain visible:
- `**` (bold markers)
- `*…*` literal-asterisk italic
- `_…_` literal-underscore italic
- `&nbsp;` `&amp;` `&quot;` `&apos;` `&#39;` `&lt;` `&gt;` HTML entities
- `{#…}` pandoc attribute syntax
- `— -` em-dash + hyphen attribution doublet
- `####`, `#####`, `######` literal heading markers
- Any author placeholder pattern (see §2.7)

Italic is rendered as actual `<em>` typography, not as literal characters.

### 2.5 Epigraphs anchor to their opener

An epigraph is a quote or short framing line that follows directly after a `#` heading and before the first body paragraph. Epigraphs must render **on the opener page** (italic, indented, below title) — never on a separate continuation page.

If the manuscript has an epigraph between `# Title` and the first body content:
- Parser detects the pattern (`>` blockquote OR italic-quote shorthand OR short italic line directly after `#`).
- Epigraph attaches to the opener page's body region.
- The next non-quote block begins a new body page.

### 2.6 No floating quote without context

A quote must NOT appear alone on a body page unless the page is explicitly `quote-page`. If a quote would land alone on a body page (e.g., it's the only content between two headings or chapters), it must:
- Attach to the preceding opener as epigraph (§2.5), OR
- Be combined with the preceding paragraph as lead-in on the same page

### 2.7 No placeholder pages — HARD RULE

The system cannot distinguish editorial scaffolding from reader-facing content unless we name the scaffolding explicitly. The rule:

```
A line identified as a placeholder or editorial instruction:
  - does NOT render in Page Proof
  - does NOT generate a body page
  - does NOT trigger an opener page
  - does NOT anchor an epigraph slot
  - does NOT count toward layout density
  - DOES remain in the source markdown (Read Flow surface)
  - MAY be shown in Edit Mode with an amber author-only marker
```

#### 2.7.1 Detection patterns (canonical)

A line is a placeholder if it matches **any** of these patterns (case-insensitive on words; whole-line match):

| Pattern ID | Regex / rule | Example matches |
|---|---|---|
| `PLC-A` italic-bracket | `^\s*\*\[[^\]]*\]\*\s*$` | `*[Epigraph or framing line — to be authored by Kelly.]*` · `*[TODO]*` · `*[]*` |
| `PLC-B` plain-bracket marker | `^\s*\[\s*(TBD\|TODO\|DRAFT\|PLACEHOLDER\|FIXME\|NOTE)\b[^\]]*\]\s*$` | `[TBD]` · `[TODO: add citation]` · `[DRAFT — needs review]` · `[PLACEHOLDER]` |
| `PLC-C` HTML comment whole-line | `^\s*<!--[\s\S]*?-->\s*$` | `<!-- TODO -->` · `<!-- needs revision -->` |
| `PLC-D` author-instruction phrase | line is ≤ 12 words AND matches `^[^a-zA-Z0-9]*\s*(to be (authored\|written\|added\|filled\|completed)\|placeholder text\|fill in here\|insert .{1,30} here)\b` (case-insensitive) | `*To be authored.*` · `Placeholder text` · `Fill in here` · `Insert epigraph here.` |
| `PLC-E` all-caps editorial flag | `^\s*\*?(REVISE\|REVIEW\|EXPAND\|CITATION NEEDED\|REWRITE)\*?\s*$` | `REVISE` · `*REVIEW*` · `CITATION NEEDED` |

A pattern fires only on a **whole-line** match (after trimming). A line that has placeholder text mid-paragraph is NOT a placeholder — only standalone author-scaffold lines are suppressed.

#### 2.7.2 Implementation contract

- Detection runs at **parse time**, before any block is created from the line.
- Matched lines are dropped from the parser's input stream entirely. The page-allocation pipeline never sees them; therefore they cannot generate pages, cannot trigger openers, cannot anchor epigraphs.
- The empty space the line would have occupied collapses naturally — the next non-placeholder line proceeds as if the placeholder didn't exist.
- Edit Mode rendering: deferred decision. v1 = simply suppressed everywhere. A future amendment may surface them in Edit Mode only as a `kind: 'placeholder'` block with an amber tint, so authors can find their TODOs without polluting Page Proof.
- Read Flow (`/book-studio/read`): renders the source markdown verbatim. Placeholders remain visible there because that's the raw-source surface, by design.

#### 2.7.3 What this rule is NOT

- It is NOT content authoring. The author can replace any placeholder with real content (e.g., write a real epigraph) and the page composes naturally per §2.5.
- It is NOT a hide-from-the-author. The author can find every placeholder in the source markdown (`/book-studio/read`).
- It is NOT a smart-suppression that infers intent. Only the explicit patterns in §2.7.1 fire. If a line doesn't match a pattern, it's content.

#### 2.7.4 Worked examples

| Source line | Suppressed? | Why |
|---|---|---|
| `*[Epigraph or framing line — to be authored by Kelly.]*` | yes | matches `PLC-A` |
| `*[TODO]*` | yes | matches `PLC-A` |
| `[TBD]` | yes | matches `PLC-B` |
| `[TODO: add Sadhguru citation]` | yes | matches `PLC-B` |
| `<!-- needs revision before print -->` | yes | matches `PLC-C` |
| `*To be authored.*` | yes | matches `PLC-D` (≤ 12 words; phrase) |
| `Insert epigraph here.` | yes | matches `PLC-D` |
| `Placeholder text` | yes | matches `PLC-D` |
| `It was time to be authored, he wrote softly...` | **no** | line is > 12 words AND it's narrative prose |
| `**Important** announcement here.` | **no** | not a placeholder pattern; bold emphasis is rendering |
| `[Smith 2024]` (a real bracketed citation) | **no** | doesn't match any TBD/TODO/etc. keyword |

### 2.8 Front matter never gets chapter numbering

Per §1.1: a front-matter opener never receives a "Chapter N" subtitle. The validator checks: every page with a "Chapter N" subtitle must have a title matching `^Chapter\s+\d+`.

---

## 3. Aesthetic proportion (page-density standards)

Pages have target density ranges. Density is computed as `currentPage._height / 900` (estimated content height divided by usable area).

| Page type | Min density | Max density | Notes |
|---|---|---|---|
| `chapter-opener` | n/a | n/a | Intentionally sparse. Threshold treatment. |
| `part-opener` | n/a | n/a | Intentionally sparse. Largest breath. |
| `frontmatter-opener` | n/a | n/a | Intentionally sparse. May absorb short body content. |
| `body` | 0.55 | 0.95 | Stable text field. Never starved, never overstuffed. |
| `body-continuation` | n/a (if last in chapter) · 0.55 (otherwise) | 0.95 | Final continuation of a chapter exempt from min. |
| `quote-page` | n/a | n/a | Intentionally sparse. |
| `image-plate` / `doorway` | n/a | n/a | Image fills the page; density n/a. |

### 3.1 Intentional vs accidental whitespace

- **Intentional whitespace:** thresholds, openers, quote pages, final pages of chapters. The whitespace is part of the meaning.
- **Accidental whitespace:** a body page that ended early because of broken pagination, mis-allocation, or premature page break. Always wrong.

A body page below the min density floor is accidental whitespace unless it's the final continuation of a chapter.

### 3.2 Heading-move trigger

When the parser is about to add a heading, it must look ahead (or the layout layer must reactively pull) such that:

- If the heading would land in the **final 20%** of the current page's available area AND the heading + first following paragraph wouldn't fit together on the current page → start a new page BEFORE the heading.
- If the heading + first following paragraph fits → keep them together on the current page.

This is the proactive form of §2.2.

### 3.3 Reader-state continuity

Page turns should never interrupt a single thought. Specifically:
- A paragraph mid-thought must not split across pages unless it physically exceeds page capacity (the only acceptable break-mid-paragraph case).
- A heading + paragraph pair must stay together (§2.2).
- An epigraph + its first body paragraph should stay together when the section opener and body coexist on the same page.

---

## 4. Flow standards

### 4.1 Page turns preserve thought

Each page turn (in single-page proof OR two-page spread mode) must feel like the next breath of the same thought, not the start of a new one — except at intentional thresholds (chapter, part, front-matter section). The reader should not feel reset by a page turn.

### 4.2 Section transitions feel earned

A `##` or `###` section heading mid-chapter must:
- Have body content on the same page (§2.2)
- Have at least one preceding paragraph that completes the previous section's thought (no abrupt mid-thought heading insertion)
- Have rhythmic breath above (typography margin) — not crammed against the previous paragraph

### 4.3 Body pages do not feel like slides

A body page is a **continuous reading field**, not a deck slide. Specifically:
- Each block must flow into the next (paragraph → paragraph, paragraph → heading + paragraph, paragraph → quote + paragraph)
- No card geometry, no boxed blocks, no arbitrary vertical gaps between unrelated items
- Quote treatment is integrated (left border, italic, indent), not a card

### 4.4 Read Flow is the continuity reference

`/book-studio/read` (the continuous prose surface) is the ground truth for *how the book reads*. Page Proof is the paginated embodiment of that experience. If a reader compares the two surfaces and Page Proof feels more fragmented, the engine has failed §0.

---

## 5. Validation checklist

A page is **PASS** if it satisfies all rules for its type. A page is **FAIL** if it violates any hard composition rule (§2). A page is **REVIEW** if it falls outside aesthetic ranges (§3) but doesn't break a hard rule.

Each rule has a stable ID for cross-referencing with `LAYOUT_HEALTH_SPEC_v1.md` rule firings.

### 5.1 Hard failures (any of these = page fails)

| Rule ID | Failure | Detection |
|---|---|---|
| `BPS-CHAPTER-INVENTED` | Page has "Chapter N" subtitle but title doesn't match `^Chapter \d+` | structural |
| `BPS-FAKE-CHAPTER-FM` | Front-matter title (Contents, Preface, etc.) has chapter subtitle | structural |
| `BPS-FAKE-CHAPTER-PART` | Part opener has chapter subtitle | structural |
| `BPS-WIDOW-HEADING` | Body page's last block is a heading | layout |
| `BPS-CONT-ABRUPT-HEAD` | Continuation page's first block is a heading (not via §2.2 carry, but a fresh heading) | layout |
| `BPS-CONT-ABRUPT-QUOTE` | Continuation page begins with a quote without lead-in | layout |
| `BPS-RAW-MARKDOWN` | Rendered text contains `**` `*…*` `_…_` `{#…}` `— -` `&nbsp;` `####+` | typography (mirrors §2.4) |
| `BPS-PLACEHOLDER-PAGE` | Page contains a block matching placeholder patterns | structural (mirrors §2.7) |
| `BPS-QUOTE-ORPHAN` | Body page has only quote block(s) and is not `quote-page` | layout |
| `BPS-EPIGRAPH-DETACHED` | Quote that should attach to opener (per §2.5) renders on its own page | layout |

### 5.2 Reviews (warning, not blocking)

| Rule ID | Issue | Detection |
|---|---|---|
| `BPS-DENSITY-LOW` | Body page density < 0.55 (and not final-continuation-of-chapter) | aesthetic |
| `BPS-DENSITY-HIGH` | Body page density > 0.95 | aesthetic |
| `BPS-WEAK-TRANSITION` | Section heading appears in final 20% of page's area | aesthetic |
| `BPS-DENSE-RUN` | 3+ consecutive full pages without breath (opener/quote/threshold) | aesthetic |

### 5.3 Hard-failure examples

| Source pattern | Hard failure |
|---|---|
| `# Contents` produces page with `Chapter 2 / Contents` subtitle | `BPS-FAKE-CHAPTER-FM` |
| `# Part One — The Ground` produces page with `Chapter 4` subtitle | `BPS-FAKE-CHAPTER-PART` |
| Body page ending in `### Living in the Moment` heading | `BPS-WIDOW-HEADING` |
| `*[Epigraph or framing line — to be authored by Kelly.]*` rendering on its own page | `BPS-PLACEHOLDER-PAGE` |
| `#### The Circle: A Model of Wholeness` rendering with literal `####` | `BPS-RAW-MARKDOWN` |
| Single Zhuangzi quote alone on a body page after `# Preface` | `BPS-EPIGRAPH-DETACHED` (or `BPS-QUOTE-ORPHAN` depending on context) |

---

## 6. Implementation order (against this standard)

After this document is approved, implementation follows in this exact order. Each PR has a §5 validator test it must satisfy before the next begins.

1. **Keep-with-next** — eliminates `BPS-WIDOW-HEADING`. Parser/layout. Spec §2.2.
2. **Continuation integrity** — eliminates `BPS-CONT-ABRUPT-HEAD` and `BPS-CONT-ABRUPT-QUOTE`. Parser/layout. Spec §2.3.
3. **Quote/epigraph anchoring** — eliminates `BPS-EPIGRAPH-DETACHED` and `BPS-QUOTE-ORPHAN`. Parser. Spec §2.5–§2.6.
4. **Density thresholds** — flags `BPS-DENSITY-LOW` / `BPS-DENSITY-HIGH` (read-only flags first; refinement after). Aesthetic. Spec §3.
5. **Layout Health evaluator** — runs the §5 checklist on rendered pages and surfaces flags via the L2 panel. Implements `LAYOUT_HEALTH_SPEC_v1.md` against this standard.

Pre-existing PRs that already satisfy parts of this standard:
- `#275` chapter logic (§2.1, §1.3)
- `#275a` chapter title strip (§1.3 — pending merge)
- `#278` keep-with-next + continuation integrity (§2.2, §2.3 — pending review; this PR currently has 3 widow cases that will be resolved when the safety-skip is replaced with overflow-tolerant carry per §2.2's "overflow is acceptable; widow is not" clause)

---

## 7. What's explicitly NOT in this standard

- Specific font choices (Georgia is the v1 default; spec'd in `PAGE_PROOF_SPEC_v1.md` §4)
- Specific size, weight, leading values (typography spec, §4 of PAGE_PROOF_SPEC)
- Drop caps, ornaments, dingbats, running heads, page numbers (deferred — typography refinement after L1 stable)
- Index, footnote, citation, hyperlink rendering (deferred — manuscript doesn't currently use)
- Multi-column layouts (deferred)
- Marginalia, sidebars (deferred)
- Two-page spread differential rules (left vs right page) (deferred to spread PR)

---

## 8. Open questions for review

- §3 density thresholds (0.55 / 0.95) — drafted; needs author calibration on a real read of 50+ pages
- §1.6 `quote-page` intentional marker — what's the manuscript syntax? `<!-- quote-page -->` HTML comment? Front-matter on the heading? Defer until the manuscript actually requires it.
- §3.3 reader-state continuity — currently encoded as "no mid-thought split unless physically required." Are there manuscripts where mid-thought split is intentional (e.g., suspense-builder)? Probably not for nonfiction.
- §4.2 "rhythmic breath" above section headings — is the spec value of 26px margin-bottom on `<h2>` the right number, or does it need to be larger?
- §5.2 reviews — should `BPS-DENSITY-LOW` ever block a deploy, or always be a warning? Current draft: always warning.
- §6 should §5.4 (density flags) ship before #279 (`####` handling) and #276a (placeholder)? Or are those cosmetic enough to defer?
- §1.1 front-matter list — is the canonical list in §1.1 of `PAGE_PROOF_SPEC_v1.md` complete, or are there manuscript-specific terms to add?

---

## 9. How this standard is enforced

Two enforcement layers:

### 9.1 Build-time (parser + layout, deterministic)

The parser and layout rules in `PAGE_PROOF_SPEC_v1.md` produce pages that **structurally cannot** violate hard rules §2.1, §2.2, §2.3, §2.4, §2.5, §2.7, §2.8. These rules are enforced at allocation time — the page can't be wrong because the code can't produce it wrong.

### 9.2 Run-time (Layout Health observer, read-only)

The §5 validation checklist runs against the rendered page output. Hard failures (§5.1) trigger high-severity flags in the Layout Health panel. Reviews (§5.2) trigger medium/low-severity flags. The observer never modifies pages.

If a rule slips past §9.1 (structural enforcement) and shows up in §9.2 (observer), it's a code regression — the parser/layout is permitting something it shouldn't. Fix is in §9.1.

---

## 10. Opener Composition (Deferred — Layer 3)

> **Status:** Parked. NOT active. Do NOT implement until Layer 1 composition is fully stable per §0 primary law (Page Proof feels like Read Flow, just paginated).

### 10.0 Position in the layer model

This section belongs to **Layer 3 — Expression / Aesthetic Encoding**, not Layer 1 (composition integrity).

- **Layer 1** answers: *is the page structurally and compositionally correct?*
- **Layer 2** answers: *can the system observe its own structural correctness?*
- **Layer 3** answers: *now that the structure is correct, how does it speak beautifully?*

Implementing Layer 3 before Layer 1 is stable will mask structural errors, create false positives ("this looks better" when it's still wrong), force rework, and entangle parser + presentation prematurely. The keystone (semantic grouping in §2.2 and continuation integrity in §2.3) must hold before any of this work begins.

### 10.1 Activation gate

This section becomes implementable when, and only when, all of these hold:

- §2 hard composition rules pass on the full Elemental Alchemy manuscript with zero failures
- §3 aesthetic proportion ranges are observably hit on body pages (no accidental whitespace)
- A 30–40 page scroll-read in Page Proof produces no "this feels off" signal
- The Read Flow ↔ Page Proof equivalence test (§5.10) passes qualitatively

Until those hold, this section is reference material only. No parser changes. No renderer changes. No CSS classes added for these elements.

### 10.2 Opener element vocabulary (catalog, not an implementation)

When Layer 3 work becomes active, opener pages may compose from this vocabulary:

| Element | Definition | Where it fires |
|---|---|---|
| **Title** (required) | The heading text — chapter / part / section name | Every opener |
| **Epigraph** | Italic framing quote or short framing line directly below the title; same as §2.5 attached epigraph | Any opener; only when manuscript has a `>` quote / italic-quote / short italic line immediately after `#` |
| **Decorative ornament** | Asterism `* * *` · fleuron · alchemical glyph | Any opener; thematic |
| **Element marker** | Small element glyph (🜂 fire / 🜄 water / 🜃 earth / 🜁 air / 🜀 aether) | Chapter openers whose title contains an element name; Part openers thematically mapped |
| **Threshold rule** | Thin decorative horizontal line under title or above body | Any opener |
| **Part marker overline** | Small-caps "PART ONE" above the part name | Part openers only |
| **Chapter-number wordform** | "Chapter One" instead of "Chapter 1" (stylistic) | Chapter openers — author choice, not automatic |
| **Subtitle slot** | "A Practitioner's Field Manual" treatment under main title | Book title page; extended to chapters as needed |

### 10.3 Hard constraints when this layer is implemented

These constraints are non-negotiable for the eventual implementation. They are stated now so the future spec amendment doesn't drift.

#### 10.3.1 Optional, not required

Not every opener gets every element. The minimum opener is: title alone (current behavior). Each additional element is an *option*, not a default. A book may choose to have plain openers throughout; another may choose to ornament every threshold. Both must be valid.

#### 10.3.2 Hierarchical — never compete with the title

The title is the strongest visual element on an opener page. Every other element must:
- Be smaller in size than the title
- Be lower in visual weight (lighter weight, smaller leading, less letter-spacing)
- Resolve to the title rather than draw the eye away from it
- Sit either above (small marker) or below (epigraph, ornament, body) the title — never to the side

If an element competes with the title, the element is wrong.

#### 10.3.3 Semantically triggered first, aesthetic second

Elements appear because the manuscript or page-type *demands* them, not because they look nice. Examples:

| Wrong | Right |
|---|---|
| Add ornament because it looks nice | Add ornament because this is a Part boundary |
| Add element glyph for visual interest | Add element glyph because Chapter 5 is mapped to Fire |
| Always add a threshold rule | Add threshold rule when an epigraph is present (separates threshold from body) |

The activation logic is **structural** (heading is a Part opener; chapter title contains an element name; epigraph is present); the aesthetic treatment is *consequence*, not cause.

### 10.4 Vertical rhythm (when implemented)

The default top-down sequence on an opener page, when all elements are present:

```
[part marker overline]      ← if Part opener
[title]                     ← always
[chapter-number wordform]   ← if requested by author
[threshold rule]            ← if epigraph present, separator
[epigraph]                  ← if manuscript provides
[ornament]                  ← if thematic / Part boundary
[element marker]            ← if applicable
[body content]              ← if §1.1 short-section inline allowed (currently disabled)
```

Vertical spacing rules between elements: deferred. They will be specified when this layer becomes active, after observing real opener pages with real content.

### 10.5 What this section is NOT

- A specification for typography (`font-size`, `letter-spacing`, etc.) — those will be added when implementation begins
- A list of CSS classes — none are reserved yet
- A render-layer specification — `renderProofPage` does not consume any of these elements yet
- A parser specification — `startChapterOpener` does not detect or emit any of these markers yet
- A green light for piecemeal implementation — all of §10 lands together as one coherent Layer 3 amendment, never one element at a time

### 10.6 When the gate opens

When §10.1 activation conditions are met, the implementation amendment will:

1. Add a new section in `PAGE_PROOF_SPEC_v1.md` covering parser detection, renderer rules, and CSS for the elements in §10.2
2. Add validation tests in BOOK_PAGE_STANDARD §5 (and Layout Health rules in `LAYOUT_HEALTH_SPEC_v1.md`) for opener composition correctness
3. Reference this section as the canonical source

Until then, this is reference. The system continues to teach itself how to think before it learns to speak beautifully.

---

*End of Book Page Standard v1.*

> The current renderer is no longer enough; the system needs **composition law**.
> Composition first. Expression after.
