# Elemental Alchemy — Design System v1

> **Status.** v1, 2026-04-26. Records the design DNA articulated by
> Kelly during the Soullab Press founding arc. Not derived top-down;
> extracted from the canonical Chapter 1 opener as that page is
> refined.
>
> **Scope.** This is the *system* — typography, principles, page
> rules — that any chapter / future book in the system can inherit.
> The proof object is Chapter 1 of *Elemental Alchemy*. Generalize
> only when later chapters demand it (Fire/Water/Earth/Air variants
> are deferred — see "What is NOT in v1").
>
> **Encoded in code at.** `lib/manuscript/render/print.css`.
> Update both files together.

---

## Page intent — three governing principles

1. **Initiation, not introduction.** The reader is crossing a
   threshold, not being eased in.
2. **Contrast over centered-everything.** Centered elements (chapter
   number, title, image, epigraph) play against grounded, left-anchored
   elements (section titles, body, attribution). Everything centered
   reads polite and flat.
3. **The image is a threshold.** Not decoration, not illustration. It
   marks entry. Treated with scale and breathing room that announce.

---

## 1. Typography

| Role        | Family               | Notes                                                            |
| ----------- | -------------------- | ---------------------------------------------------------------- |
| Body        | **Crimson Text**     | Classical, has soul. Lora is the acceptable fallback.            |
| Headings    | **Playfair Display** | Strong, archetypal presence. Replaces Libre Baskerville.         |
| Reserve     | Cormorant Garamond   | Lighter, more mystical. Held for a future sub-set or variant.    |

Relative scale (calibrate against Atticus point sizes; ranges):
- **Chapter number** — small, letter-spaced ≈ 0.2 em, centered.
- **Chapter title** — large, present (≈ 36–44 pt). The threshold weight.
- **Body** — comfortably readable (≈ 11–12 pt).
- **Quote / epigraph** — slightly smaller than body, narrower measure.

---

## 2. Paragraph system

**No first-line indent. Spaced paragraphs.** More contemplative; pairs
with reflection / practice insertions in later chapters. Reserve indent
for explicitly narrative passages (none in *Elemental Alchemy*).

---

## 3. Image as threshold

- Increase ≈ 15–25 % over the current Atticus default.
- Vertical breathing room above and below dominates the page.
- The image is centered, but the page does NOT need to be.
- Treated as a moment, not an illustration.

---

## 4. Contrast over centered-everything

A page that centers every element is balanced — and dead. The system
holds tension between:

- **Centered:** chapter number, chapter title, image, epigraph.
- **Grounded:** section titles (left-aligned), body paragraphs,
  attribution lines.

This contrast is the page's life. When in doubt, ground the next
element instead of centering it.

---

## 5. Epigraph treatment

- Set in italics. Narrower than body measure (≈ 75 %).
- Generous space above and below.
- Attribution anchored, not floating — small caps or letter-spaced
  small.
- Rendered with class `.epigraph`. The first quote of a chapter is
  promoted to epigraph automatically by the HTML renderer.

---

## 6. Ritual / prayer block treatment

For invocational passages (the prayer in Chapter 1 is the canonical
case):

- Set in italics, centered, narrower than body.
- **Break into 2–3 sections with breathing space between them.**
  A single block reads as paragraph; sectioned blocks read as ritual
  movements.
- Treated as a **second threshold inside the chapter** — not body
  text.
- Closing line: anchored right or attribution-style, to mark the seal.
- Rendered with class `.ritual-line`. The HTML renderer detects
  italic-wrapped paragraphs without em-dash attribution and applies
  this class.

---

## 7. Restrained elemental / alchemical tone

The system carries depth, not flourish.

**Avoid:**
- Gold foil, illuminated-manuscript pastiche.
- Heavy occult / mystical visual codes (pentagrams, sigils
  pasted-in for atmosphere).
- Tarot-card visual conventions (card-shaped frames, ornate borders).
- Decorative drop caps that exceed the type scale.
- Color used for tone — Phase 1 is monochrome ink + paper.

**The depth lives in:**
- Typography choices (Crimson Text + Playfair Display already do this).
- Rhythm of centered ↔ grounded.
- Image as threshold.
- Breath between sections.

When color enters (later, with elemental chapters), it enters as
restraint — a single accent, not a palette explosion. The system stays
quiet so the content can be loud.

---

## 8. Chapter opener vertical rhythm

The canonical opener (Chapter 1, "The Journey Begins") top-to-bottom:

1. **Chapter number** — small, letter-spaced, centered.
2. **Chapter title** — larger, present. Subtle off-center placement
   acceptable to introduce the contrast.
3. **Image** — threshold. Larger than current. Breathing dominates.
4. **Epigraph** — narrower than body. Generous space above and below.
   Attribution anchored.
5. **Section title** — left-aligned (grounded). The page's main
   contrast hit against the centered elements above.
6. **Ritual / prayer** (if present) — broken into 2–3 sections,
   italic, centered, narrower.
7. **Body text** begins.

---

## Page geometry

- **Inside margin** 1.0" — **outside margin** 0.875".
- **Top margin** of chapter openers — slightly increased over body
  pages, to give the threshold space.
- **Body measure** — aim for ≈ 65 chars per line.
- **Quote measure** — narrower than body. Visually punctuated.

---

## Scene breaks

- **Long-term** — elemental glyph (per chapter's element).
- **Chapter 1** — pre-elemental. Use a neutral geometric mark
  (three centered middots, generous space above and below).
- **Atticus** — simplest available divider for now.

---

## Apply in Atticus (today)

| Decision                                | Atticus action                                                        |
| --------------------------------------- | --------------------------------------------------------------------- |
| Body → Crimson Text                     | Theme → Body Font → Crimson Text (custom-font upload if needed).       |
| Headings → Playfair Display             | Theme → Heading Font → Playfair Display.                              |
| No-indent + spaced paragraphs           | Style → First-Line Indent OFF; paragraph spacing ON.                  |
| Larger chapter image                    | Resize to ≈ 75–85 % of column width; extra space before / after.      |
| Wider image breathing                   | Add a blank line before and after the image block.                    |
| Quote treatment                         | Reduce size; widen margin on both sides; tighten attribution line.    |
| Prayer block treatment                  | Italicize; break into 2–3 sections; anchor closing line.              |

If Atticus does not carry the two fonts, install via custom-font upload
and verify embeds in the PDF export — do not fall back silently.

---

## Apply in sovereign render

The same decisions encode at `lib/manuscript/render/print.css`:

- `@font-face` chain with the family fallback above (via Google Fonts;
  vendor for offline later).
- `@page` asymmetric margins (inside vs outside).
- `@page chapter-opener` for the differentiated top margin.
- `.chapter-opener` composition matching the vertical rhythm above.
- `.epigraph` and `.ritual-line` rules implementing 5 and 6.
- `.section-title` left-aligned for the grounded contrast.
- `.scene-break` placeholder until the elemental glyph system lands.

The CSS file and this document are kept in sync — when one changes,
update the other in the same commit.

---

## What is NOT in v1

Deferred until proven necessary on later chapters / books:

- Fire / Water / Earth / Air / Aether visual variants
- Color palette beyond ink-on-paper
- Drop caps / ornamented chapter openers
- Pull quotes
- Marginalia / annotations
- Index / glossary typesetting rules
- Multi-column layouts

These do not ship until Chapter 1 reads as **initiation**. Add only
when a real chapter forces the question.

---

## Versioning

This is **v1**. Subsequent versions when:

- An elemental chapter (5 = Fire onward) actually needs color rules.
- A second book in the system reveals constraints v1 doesn't cover.
- The sovereign renderer reveals a CSS / Paged.js limitation that
  shifts a decision.

Each version supersedes the previous. Older versions are preserved
in git history, not as parallel files.
