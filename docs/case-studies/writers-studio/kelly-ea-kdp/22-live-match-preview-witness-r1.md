# Live continuity and exact-text preview — R1

**Case:** KELLY-NEZAT-EA-KDP-REFINEMENT-01
**Observed:** 2026-10-03T21:36:03.389Z
**Outcome:** PASS for the bounded read-only continuity and preview checks below.

## What was actually done

Read the existing case draft in a repeatable-read, read-only transaction; matched the two approved original paragraphs despite PDF line wrapping; formed the two approved replacements in memory; tested refusal when an original was changed, duplicated, or already incorporated; and re-read the live draft and section digests after the preview. No SQL INSERT, UPDATE, DELETE, or manuscript mutation was executed.

**Result:** 24/24 deterministic continuity/preview checks passed. These are not editorial-quality scores, an independent model council, a Studio Apply witness, or a guarantee of reader effect.

## Named checks

- PASS — exact-case-identity
- PASS — baseline-content
- PASS — draft-version-and-revision
- PASS — 177-sections
- PASS — ordered-section-baseline
- PASS — EA-C02-01-section-position
- PASS — EA-C02-01-unique-original
- PASS — EA-C02-01-outside-passage-preserved
- PASS — EA-C02-01-changed-original-refused
- PASS — EA-C02-01-ambiguous-original-refused
- PASS — EA-C02-01-already-incorporated-original-refused
- PASS — EA-C02-02-section-position
- PASS — EA-C02-02-unique-original
- PASS — EA-C02-02-outside-passage-preserved
- PASS — EA-C02-02-changed-original-refused
- PASS — EA-C02-02-ambiguous-original-refused
- PASS — EA-C02-02-already-incorporated-original-refused
- PASS — only-two-sections-would-change
- PASS — 175-other-sections-preserved
- PASS — withdrawn-faster-and-cut-not-reintroduced
- PASS — earlier-pattern-explanation-preserved
- PASS — dream-sections-unchanged
- PASS — live-draft-unchanged-after-preview
- PASS — live-sections-unchanged-after-preview

## Exact approved wording, still not applied

### EA-C02-01

Section a17c2fcb-5bc8-4a0e-872c-05bd2adc520a, stored position 21.

**Original (line wrapping normalized):**

> Contemporary science enables us to see ourselves as quantum beings within a mysterious world of spooky effects and energetic entanglement. It is at this level that the fuzzy logic of sacred geometry, the beauty of fractal symmetry, and the holism of toroidal processes reveal an expansive view of who we are as elemental beings.

**Approved for incorporation:**

> Contemporary science invites us to contemplate a mysterious world of spooky effects and quantum entanglement. For me, the fuzzy logic of sacred geometry, the beauty of fractal symmetry, and the holism of toroidal processes reveal an expansive view of who we are as elemental beings.

### EA-C02-02

Section c7ade4a4-c586-4a01-a93e-192527578909, stored position 23.

**Original (line wrapping normalized):**

> Despite our best-laid plans, life often takes unforeseen directions. We intuitively sense the underlying cycles and patterns that shape our experiences, even when life seems chaotic and random. This awareness allows us to navigate unpredictability with a sense of wonder and discovery.

**Approved for incorporation:**

> Despite our best-laid plans, life often takes unforeseen directions.

## Preservation and the next real boundary

The in-memory preview changes only the two approved spans in two sections. All other 175 section strings remain byte-identical; the earlier pattern explanation, the mandala-dream sections, and “faster and” remain unchanged. All 177 LIVE sections remain byte-identical to baseline because nothing was applied.

The imported manuscript retains hard line wrapping; normalized matching is used only to discover and record exact stored originals. Preview offsets are stored-text coordinates, not authority to name a runtime adoption locus. Do not force these coordinates into an API or substitute a full-section rewrite.

The existing Studio adoption route requires an owned thread and exact proposal version; it records permission and execution separately. The member-version route labels its wording member-authored. This handoff does not fabricate either route input, mint authentication, relabel AI-proposed text as Kelly-authored, or bypass author-agency mechanisms with direct SQL.

Next: carry these exact approved candidates through the existing Studio proposal/adoption relationship with correct origin and fresh context. On mismatch, stop and reconcile; do not silently adapt the approved text. A returned applied receipt plus fresh draft/section and read-in-context checks are required before saying Applied. Approval need not be re-adjudicated merely because it crossed conversations. No whole chapter is declared complete.

The whole-book and current author-direction handoff is record 20; full source remains the preserved Library companion. This documentary import does not establish that a live Studio model receives that compass. Product context wiring remains a separately evidenced capability, not inferred from file presence.
