# Book Studio — Layout Health Specification v1 (L2)

**Status:** Draft for review. No code until reviewed and approved.

**Depends on:** `PAGE_PROOF_SPEC_v1.md` (L1). L2 cannot start until L1 is observably stable — the layer evaluates the renderer, never replaces it.

**Mandate:**

> *AI critiques the renderer; never replaces it. If the renderer is wrong → fix code. If the renderer is right → AI observes.*

This is the first externalization of Kelly's own visual intelligence. Read-only. No auto-correction. No content edits. No invented aesthetic judgments. Every flag must trace to a visible rule basis.

---

## 0. Layer position

```
L1 — Deterministic engine        ← parser · renderer · flow · fill-first
       ▲ authoritative
       │
       │ provides: page object · block data · render output · DOM
       │
L2 — Layout Health (this spec)   ← read-only evaluator
       ▲ observational
       │
       │ provides: warnings, notes, pass states
       │
L3 — Soullab aesthetic            ← rhythm of revelation · breath · cadence (deferred)
```

**Hard rules (no exceptions):**

```
Layout Health:
- does not modify layout
- does not suggest style changes
- does not suggest typography changes
- only flags structural and perceptual issues
```

Expanded:
- L2 may not modify manuscript data, parser behavior, renderer output, page boundaries, block content, or stored state.
- L2 may not auto-fix anything.
- L2 may not generate aesthetic prescriptions ("this would look better as…").
- L2 may not invent rules at runtime — every warning maps to a rule defined in §1 of this spec.
- L2 must show **the rule that fired** alongside every warning. No silent aesthetic judgments.
- No LLM/AI calls in v1. Deterministic rule-based detection only.

### 0.2 Vocabulary discipline

Every word the panel uses must be observational, never prescriptive. Forbidden vocabulary in this spec, in code, and in user-facing copy:

| Forbidden | Replacement |
|---|---|
| improve | detect |
| optimize | flag |
| enhance | surface |
| better | (just describe what fired) |
| should look | (just describe what fired) |
| recommend | (state the rule and stop) |

L2 does not improve, optimize, or enhance the book. It detects, flags, and surfaces structural conditions. The author improves the book.

### 0.3 Primary success condition (shared with L1)

> **Page Proof must preserve the experiential continuity of Read Flow while introducing page structure.**
>
> If Page Proof feels more fragmented than Read Flow, the system is incorrect — regardless of visual quality.

L2 exists to surface deviations from this condition, not to declare its own version of "good." Every flag asks one question: *did this break the continuity Read Flow already proves works?*

---

## 1. Rule set

### 1.0 Rule transparency contract

Every rule in §1.1–§1.5 is presented in the panel using this exact three-part structure. No flag may show without all three:

```
Rule          → the rule ID and short name (e.g. "LH-HEAD-ORPHAN — Heading orphan")
Observation   → what the engine detected on this page (e.g. "Heading at bottom of page 47")
Why it matters → the structural or perceptual reason (e.g. "Breaks reading continuity")
```

If any of the three is missing or vague, the rule is incomplete and must not ship. The author should never see a flag without knowing what fired and why.

**Worked example:**

| Field | Content |
|---|---|
| Rule | `LH-HEAD-ORPHAN` — Heading orphan |
| Observation | "An Infinite Embrace" appears as the last block on page 30 with no following paragraph or quote. |
| Why it matters | A heading without body content beneath it on the same page breaks reading continuity — the eye lands on a label and then drops into whitespace. |

The author can disagree with the *judgment* (and dismiss the flag), but they always know what the system saw and why the system flagged it.

### 1.1 Page-level checks

| Rule ID | Rule | Severity |
|---|---|---|
| `LH-RAW-LEAK` | Raw artifact visible: `####`, `**`, `&nbsp;`, `— -`, placeholder `*[…]*`, `[to be authored]` | **high** |
| `LH-HEAD-ORPHAN` | Last meaningful block on a page is a heading; OR heading without following paragraph/quote on same page | **high** |
| `LH-LOW-DENSITY` | Estimated content density < 0.35 of page usable area on a non-opener body page | medium |
| `LH-OVERFULL` | Estimated density > 0.95 OR content approaches bottom margin | medium |
| `LH-QUOTE-ORPHAN` | Page has only one quote block, or quote without surrounding paragraph/heading context, AND page is not explicitly `quote-page` type | medium |
| `LH-BAD-OPENER` | Chapter/part opener contains wrong numbering, body prose, or stray artifacts (see §1.5) | **high** |

### 1.2 Flow checks

| Rule ID | Rule | Severity |
|---|---|---|
| `LH-CONTINUITY-BREAK` | Next page begins without context after an interrupted idea (heuristic: previous page ended mid-sentence and this page opens with a new heading) | medium |
| `LH-WEAK-TRANSITION` | Section heading appears in final 20% of page OR with less than estimated 12px breathing space above | low–medium |
| `LH-ACCIDENTAL-WHITESPACE` | Blank space at page bottom on a non-opener, non-threshold page | medium |
| `LH-DENSE-RUN` | Three or more consecutive full pages with density > 0.90 and no opener, doorway, or quote breath in between | low |

### 1.3 Soullab-specific checks

| Rule ID | Rule | Severity |
|---|---|---|
| `LH-THRESHOLD-INTEGRITY` | Opener (chapter/part) doesn't feel like an entry point: too dense, too noisy, or numbered wrongly | medium |
| `LH-RHYTHMIC-BREATH` | Dense prose runs (>3 full pages) without alternating reflective space (quote / opener / doorway) | low |
| `LH-SYMBOLIC-PLACEMENT` | A quote or image interrupts a section rather than deepening it (heuristic: quote precedes a heading without textual lead-in) | low |
| `LH-READER-STATE-CONTINUITY` | Page resets reader attention rather than carries it forward (heuristic: long pause + fresh heading + no continuity marker) | low |

### 1.4 Continuation pages (`(cont.)`)

| Rule ID | Rule | Severity |
|---|---|---|
| `LH-CONT-START-HEAD` | A `(cont.)` page begins with a heading | medium |
| `LH-CONT-START-QUOTE` | A `(cont.)` page begins with a quote without context | medium |
| `LH-CONT-ABRUPT` | Continuation feels structurally abrupt (heuristic: previous page's last block + this page's first block don't form a continuous paragraph) | low |

### 1.5 Bad opener subtypes

For pages with `type === 'Chapter Opener'`:

| Subtype | Detection | Severity |
|---|---|---|
| `LH-OPENER-FRONTMATTER-NUMBERED` | Title is in the front-matter list (Contents, Preface, Introduction, Dedication, Disclaimer, Permissions, Acknowledgments, Back Matter, etc.) AND a "Chapter N" subtitle is present | **high** |
| `LH-OPENER-PART-NUMBERED` | Title starts with `Part ` AND a "Chapter N" subtitle is present | **high** |
| `LH-OPENER-INVENTED-NUMBER` | "Chapter N" subtitle is present AND title doesn't match `^Chapter\s+\d+` (number was auto-incremented, not parsed from heading text) | **high** |
| `LH-OPENER-HAS-BODY` | Opener page contains body prose blocks beyond the title and an optional epigraph | **high** |
| `LH-OPENER-NOISE` | Opener title text contains raw artifacts (`{#anchor}`, `&nbsp;`, etc.) | **high** |

---

## 2. Implementation spec (per Kelly's directive)

### 2.1 Goal

A read-only visual intelligence layer that evaluates rendered Page Proof pages for book-design and Soullab Press flow issues.

**Hard constraints:**
- Read-only — no edits, no parser changes, no renderer changes
- Deterministic rules first — no LLM calls in v1
- Founder/editor-only access (gated by founder auth like other editorial surfaces)
- No database schema changes
- Class C PR

### 2.2 Inputs (use existing data shape)

For each page being evaluated:
- `page.type` (`Chapter Opener` | `Body` | `Doorway` | `Image Plate` | etc.)
- `page.label` / title
- `page.blocks` (array of block objects)
- `page._height` (parser-side accumulator from #274)
- `page` index in document
- Adjacent page metadata (previous, next) for flow checks
- Rendered DOM (for raw-artifact text scanning)

### 2.3 Detection engine

A pure function:

```
evaluatePage(page, prevPage, nextPage, allPages) → LayoutHealthReport

LayoutHealthReport = {
  score: 'good' | 'needs-review' | 'broken',
  issues: Issue[],
}

Issue = {
  ruleId: string,         // e.g. 'LH-HEAD-ORPHAN'
  severity: 'high' | 'medium' | 'low',
  message: string,        // human-readable description
  suggestedAction: string,// what the author/editor might do
  blockIndex?: number,    // which block on the page triggered the rule, if applicable
}
```

Page score:
- `broken` if any high-severity issue
- `needs-review` if any medium issue (and no high)
- `good` if only low or none

Document-level summary aggregates per-page reports.

### 2.4 UI

A toolbar entry inside Page Proof labeled **🩺 Layout Health** (visible only when in proof mode and user is authorized).

When clicked: a side panel slides in from the right (or overlays at the bottom — choose one) showing:

| Section | Content |
|---|---|
| **Header** | Page N / total · score badge · close button |
| **Issues on this page** | List of `Issue` objects, severity-sorted (high first). Each row: severity dot · rule ID · message · suggested action |
| **Document summary** (collapsible) | Total pages checked · high severity count · medium · top 3 recurring rule IDs |
| **Footer** | "Read-only diagnostic. No automatic changes." |

### 2.5 Copy guidelines (per spec)

Each `Issue.message` should be plain, observational, never prescriptive:

| Rule fires | Message |
|---|---|
| `LH-HEAD-ORPHAN` | "Heading is stranded at bottom." |
| `LH-LOW-DENSITY` | "This page appears underfilled." |
| `LH-RAW-LEAK` | "Raw markdown artifact visible." |
| `LH-OPENER-FRONTMATTER-NUMBERED` | "Front matter should not receive a chapter number." |
| `LH-OPENER-INVENTED-NUMBER` | "Chapter number was generated, not parsed from heading text." |
| `LH-QUOTE-ORPHAN` | "Quote appears without surrounding context." |
| `LH-CONT-START-HEAD` | "Continuation page begins with a heading." |

`Issue.suggestedAction` is the rule's stated remediation, plain language:

| Rule | Suggested action |
|---|---|
| `LH-HEAD-ORPHAN` | "Apply keep-with-next so heading moves to next page." |
| `LH-LOW-DENSITY` | "Investigate why fill-first didn't pack more content here." |
| `LH-RAW-LEAK` | "Strip artifact in parser cleanup pass." |
| `LH-OPENER-FRONTMATTER-NUMBERED` | "Suppress chapter subtitle for front matter titles." |

The author never sees a vague feeling. Every flag has a rule and a suggested move.

### 2.6 What the UI must NOT do

- No "Fix this for me" buttons
- No automatic page reflow
- No live editing of block content
- No suggestions that touch the manuscript text
- No LLM-generated copy in v1
- No "score this whole book" gamification

### 2.7 Pass / fail conditions

**Pass:**
- In Page Proof, opening 🩺 Layout Health on any flagged page tells the author *why the page feels wrong* with a rule and a suggested action — within 1 second.
- No false positives on clean opener pages (no flags fire on a well-formed Chapter 1 opener).
- Read-only behavior verified: opening, closing, navigating with the panel changes nothing in stored data or rendered output.

**Fail:**
- The panel edits content
- A rule fires without showing its rule ID / explanation
- A rule's suggested action is "let MAIA decide" or any vague aesthetic judgment
- Performance regression (panel open shouldn't drop frame rate during page navigation)

### 2.8 Implementation constraints

- Read-only — verified by inspecting stored state before/after panel use
- Founder/editor-only — same gating pattern as `/book-studio/render` and `/book-studio/drafts`
- No runtime behavior changes when panel is closed
- No new API routes (rules run client-side against existing in-memory state)
- No new database tables or schema changes
- Single PR, narrow scope
- Class C unless an architecture change emerges

---

## 3. Future — L2.5 / L3 (NOT in this spec)

Defined here only to mark the boundary so v1 stays disciplined.

### 3.1 L2.5 — MAIA Design Reflection (deferred)

Once deterministic Layout Health is stable AND running for a real session, add optional MAIA-generated reflection on flagged pages:

- "Why this page feels off"
- "How this page affects reader state"
- "Possible interventions"

Constraints when this lands later:
- Reflection is a modal opt-in per-page action, not always-on
- Source data: rule firings + page text + Soullab voice canon
- Output is observational, not prescriptive
- Author always retains final say
- Logged but not stored permanently with manuscript

### 3.2 L3 — Soullab aesthetic encoding (far future)

- Rhythm of revelation
- Mythopoetic pacing
- Symbolic density
- Emotional cadence

Encoded from Kelly's existing work. Not generic AI taste. Not in this spec.

---

## 4. Implementation order (after spec approval)

| PR | Section | Depends on |
|---|---|---|
| **#L2.0a** Detection engine + rules 1.1, 1.4, 1.5 (page-level + continuation + bad opener) | §1.1, §1.4, §1.5 | L1 spec validation tests passing (#5 in `PAGE_PROOF_SPEC_v1.md`) |
| **#L2.0b** Flow checks (1.2) | §1.2 | L2.0a |
| **#L2.0c** Soullab-specific checks (1.3) | §1.3 | L2.0b |
| **#L2.1** UI panel + document summary | §2.4 | L2.0a |
| **#L2.2** Founder gating + Class C verification | §2.8 | L2.1 |

Each PR produces nothing user-visible until L2.1 lands; the rule engine is exercised by tests until then.

---

## 5. Open questions for review

- §1.1 `LH-LOW-DENSITY` threshold = 0.35 — is that the right floor? Should it be content-aware (e.g., chapter's last page exempt)?
- §1.2 `LH-DENSE-RUN` threshold = 3 consecutive — is that right for the Elemental Alchemy manuscript shape?
- §1.3 Soullab-specific rules use heuristics that approximate "feel." Are the heuristics close enough for v1, or should they be deferred until L2.0a/b prove the simpler rules work?
- §2.4 UI placement: side panel vs bottom overlay vs floating chip?
- §2.8 founder-only — or should the panel be visible to any authenticated reader as a "Why this page feels off" learning surface?
- §3.1 L2.5 MAIA reflection — boundary still feels right (rules first, AI commentary later)? Or should it pilot earlier on a small subset?
- Should L2 also evaluate `/book-studio/read` (continuous prose), or is the surface only Page Proof?

---

## 6. What this spec is NOT

- A description of how Page Proof works (that's `PAGE_PROOF_SPEC_v1.md`)
- A description of fixes to the parser (those are PRs #275, #276, #279, #273b, #280, #281 per L1 spec §6)
- A "design intelligence" that overrides the renderer
- A live-suggestion editor
- A scoring system that ranks the book against generic publishing standards
- An LLM-driven aesthetic judge

L2 is a **mirror with rules**. The author looks into it and sees what they already know — but externalized, traceable, and immediate.

---

*End of Layout Health spec v1.*
