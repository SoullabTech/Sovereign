# `/book-studio/book` — Reader Surface Spec v1

**Author:** Kelly Nezat / Claude  
**Date:** 2026-06-23  
**Status:** Draft — design-only, no implementation authorized  
**Depends on:** `/book-studio/read` (source of truth for content and rendering)

> This surface is not a "reader." It is a **reading environment.**  
> A reader displays text. An environment cultivates conditions.  
> The design variable is the **state transition**, not the component.  
> Every element exists only insofar as it helps someone move from one mode of attention to another.

---

## 1. Design thesis

`/book-studio/book` is not a paginated version of `/book-studio/read`.

It is not a "reader." It is a **reading environment**.

A reader displays text. A reading environment shapes attention. That distinction governs every decision here.

---

### The two modes of consciousness

**`/book-studio/read` — reference consciousness**

Search. Jump. TOC. Anchors. Continuous flow. Editing mindset. The reader navigates the book.

**`/book-studio/book` — immersive consciousness**

Slow reading. Rhythm. Page turns. White space. Silence. Presence. The reader inhabits the book.

These are not aesthetic preferences. They are different cognitive postures, and the interface should produce them deliberately.

---

### Two modes of time

Reference consciousness treats time as **instrumental**: "How quickly can I extract what I need?" The interface optimizes retrieval. Completion is success.

Immersive consciousness treats time as **inhabited**: "What happens if I remain with this?" The interface protects duration. Remaining is success.

Every feature in Book mode can be tested against this:

> Does this reduce reading to retrieval, or does it protect duration?

If the honest answer is retrieval, the feature does not belong here.

---

### The governing word

Every UI element in Book mode is governed by one word: **Stay.**

The environment says *Stay.* The reader decides whether to **dwell.** Those are different verbs. The architecture prepares the condition; the human performs the act. Book mode's entire job is to prepare that condition without coercing the act.

Ask of each element:

> Does this help someone stay with the book?  
> Or does it tempt them away from it?

If the honest answer is the second, the element does not belong here.

---

### The single design question

> **What would make someone forget they're reading a web application and feel instead that they're entering a living book?**

If Book mode succeeds, the interface gradually disappears from awareness, leaving only the relationship between reader and book. That is a stronger design objective than reproducing the mechanics of page-turning.

Everything — layout, chrome, navigation, MAIA's presence, gesture vocabulary — is an answer to that question.

---

## 2. What disappears on entry

When a reader opens `/book-studio/book`, the following disappear or become nearly invisible:

| Element | Disposition |
|---|---|
| Top navigation bar | Hidden. No back link, no Studio nav, no account. |
| Platform eyebrow ("Soullab Press · Read Flow") | Hidden. |
| Cover image | Hidden (already encountered on `/read`). |
| TOC in running flow | Hidden. Available via gesture, not visible by default. |
| All hover states that reveal UI affordances | Suppressed. |
| Scrollbar | Hidden (CSS). |
| Page URL updating in address bar | Allowed — provides deep-link. Visually unobtrusive. |
| MAIA companion presence | Silent. No avatar, no input surface, no ambient indicators. |

What remains: the text, the margins, and one nearly-invisible exit gesture.

---

## 3. What the reader gains

| Quality | Mechanism |
|---|---|
| Reading posture | Wide inner margins (5–8% body width on each side). More than `/read`. |
| Silence | No UI elements that say "you are in a web application." |
| Cadence | Page-unit navigation replaces scroll. A page turn changes the reader's relationship to time. |
| Threshold awareness | Entry and exit feel like crossing a boundary, not clicking a tab. |
| Focus | One readable column. Nothing competes with it. |

---

## 4. Pagination

### 4a. Unit of a page

A page is a **screen of content at current viewport**, not a fixed character count or a chapter.

The content is not reflowed into fixed pages at build time. Pages are determined at render time by the available viewport height. This matches how physical books work — the "page" is what fits in view.

### 4b. Page turn triggers

The reader is inhabiting a pace, not scrolling through information. The gesture vocabulary should reinforce that.

| Input | Action |
|---|---|
| Right arrow / Space | Next page |
| Left arrow / Backspace | Previous page |
| Swipe left (touch) | Next page |
| Swipe right (touch) | Previous page |
| Click right half of screen | Next page |
| Click left half of screen | Previous page |

Scroll wheel: suppressed. Scroll is not the reading gesture here. Suppressing it is a deliberate signal that the reader has entered a different relationship with the text.

### 4c. Turn animation

A page turn should feel like a breath, not a slide.

Options (to evaluate on device before committing):
- **Fade through near-black** — cleanest, no direction signal needed, most literary
- **Horizontal slide** — familiar, may feel too "app"
- **Vertical dissolve** — unusual, may feel more literary than slide

Default recommendation: **fade through near-black** (≈150ms). Conveys transition without borrowing metaphor from carousel UI. The brief darkness between pages has its own weight — it is not dead time, it is the space between sentences.

### 4d. First page

The first page is the manuscript's beginning — the dedication or foreword, whichever comes first in the source file. Not the cover. The cover was the `/read` entry point.

---

## 5. Navigation — nearly invisible, always accessible

### 5a. TOC access

A single nearly-invisible icon (bottom-center, ≤14px, 20% opacity until hovered) opens a chapter list overlay. The overlay:
- Dark background, fills the screen
- Lists chapters and major sections from the TOC
- Each entry navigates to that chapter's first page
- Pressing Escape or clicking outside dismisses it

The icon should not look like a hamburger menu. It should look like a table of contents — three horizontal lines of unequal length, or a small open-book glyph, or simply the word "Contents" in small-caps at ≤8% opacity.

### 5b. Page indicator

Bottom-center, below the TOC icon: a progress indicator. Options:
- **Chapter name only** (preferred) — "Chapter 7" in small-caps, 15% opacity
- **Page N of M** — more precise, but borrows e-reader vocabulary
- **Dot progress bar** — visual but noisy

Recommendation: chapter name only. It orients without quantifying.

### 5c. Exit

A single, nearly-invisible exit link (top-right, ≤10% opacity, "← Read Flow" in small-caps) returns to `/book-studio/read`. Never hidden — just quiet.

---

## 6. Deep-link semantics

`/book-studio/book` supports hash-based deep links to chapter anchors:

```
/book-studio/book#chapter-7-earth-the-element-of-stability-and-groundedness
```

These use the same slug scheme as `/book-studio/read` (produced by `slugify()` in `StudioMarkdown.tsx`). On load, the reader opens to the page containing that anchor, not the page top. The `AnchorScrollHandler` pattern from `/read` applies here too.

TOC overlay links should update the URL hash so deep-links are shareable.

---

## 7. Typography

Same type register as `/book-studio/read` (Crimson Pro body, warm amber-on-dark). In Book mode, everything breathes differently.

| Property | `/read` | `/book` |
|---|---|---|
| Line length | `max-w-3xl` | Narrower — `max-w-2xl` or `52ch` |
| Side margin | Content-edge flush | 12–16% page width each side |
| Heading spacing | Current | +25% top margin — chapter openings are events |
| Paragraph spacing | Current | +10–15% — each paragraph is a breath |
| Scroll behavior | Natural | Hidden — paginated |
| Epigraph spacing | Current | Full vertical centering — epigraphs are thresholds |

The narrower column and wider margins make the text feel like it occupies a page object rather than a browser column. White space is not emptiness. It is part of the narrative pacing.

Chapter openings should feel ceremonial. Epigraphs should feel like crossing a threshold. The first line of body text after an epigraph should feel like arrival.

---

## 8. MAIA's posture in Book mode

MAIA is silent unless explicitly summoned.

No floating avatar. No voice button. No oracle input. No ambient presence indicators. No "Ask MAIA" affordance in the running page.

This is not a technical constraint. It is a constitutional statement.

The book has standing. The reader has standing. MAIA has standing. While the author is speaking, MAIA voluntarily yields. That is not absence — it is governance.

"Accompaniment without intrusion" is the right phrase, but the underlying reason is more precise: **another voice currently has the floor.** MAIA's silence here is not aesthetically pleasing restraint. It is the system recognizing that yielding to the present voice is what its standing requires.

A book is a completed artifact — authored, finished, handed across. MAIA's companion mode is for dialogue, orientation, the living relationship. Introducing its interactive presence into the reading would dissolve the distinction between the artifact and the companion.

If MAIA appears at all, it is only because the reader explicitly crossed a gesture threshold to ask for it. That gesture should feel like stepping out of the book for a moment, not like interrupting it.

If a reader wants to discuss a passage, they exit Book mode and return to the companion. Book mode is not a chat interface. The companion's silence here is itself a form of respect for the author's voice.

---

## 9. Mobile considerations

On narrow viewports (< 640px):
- Page width is full viewport minus safe-area insets
- Swipe gestures are primary navigation
- TOC icon scales to 18px for touch target
- Exit link is always accessible (top-right, full opacity on touch devices)
- Orientation lock is not enforced — portrait and landscape both work

---

## 10. What is NOT in scope

These are explicitly excluded from v1:

- Any form of annotation, highlighting, or bookmarking
- Reading progress persistence (where did I leave off?)
- Night mode / font size controls (covered by OS/browser)
- Print or PDF export from Book mode (stays in canvas pipeline)
- Social sharing of passages
- MAIA commentary on specific passages
- Any form of "read aloud" / TTS in Book mode
- Facing-page spread (two visible pages simultaneously) — possible v2

The deferred items are worth building. They are not worth building before the primary mode of attention is established and verified.

---

## 11. Open questions before implementation

These must be answered before code begins:

1. **Pagination approach**: browser-native `column` layout vs. custom scroll-container slicing? The column approach is elegant but requires careful overflow handling for large images/figures. The scroll-container approach is more controllable but needs precise measurement. This decision has CSS and accessibility implications.

2. **Where does the paginator live?** As a wrapper around `StudioMarkdown`? As a separate component that receives pre-rendered HTML? The architecture here matters — `StudioMarkdown` is a server component; the pagination interaction must be client-side.

3. **Is `/book-studio/book` a new page route, or is Book mode a state on `/book-studio/read`?** The URL should be distinct (`/book/`) for deep-linking clarity, but the content source is the same. This is a routing decision with consequences for the iOS Capacitor build.

4. **Entry point**: How does a reader get to Book mode? From a "Enter Book" button on `/read`? From direct navigation? From the Studio sidebar? The entry gesture should feel like crossing a threshold, not clicking a tab.

5. **Kelly editorial sign-off**: Before implementation, Kelly should experience the first chapter in a prototype that answers the design thesis question. The experience check precedes the code review.

---

## 12. First implementation gate

Implementation does not begin until:

- [ ] Kelly has read this spec and confirmed the design thesis
- [ ] Open question #1 (pagination approach) is decided
- [ ] Open question #2 (architecture) is decided  
- [ ] Open question #4 (entry point) is decided
- [ ] A prototype (even a static mockup) answers: *"Does this feel like entering a living book?"*

The spec is not a green light. It is an invitation to the design conversation that precedes the green light.
