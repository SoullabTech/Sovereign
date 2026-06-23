# Hospitality Audit — the book reader

> **The structural half only.** This maps where the software speaks first (Q1), where it
> demands before the reader can receive (Q2), and what could disappear (Q3) — all read
> from code, all subtractive. The **felt verdict is not here.** Q4 ("at what moment does
> it stop feeling like software and begin feeling like reading?") and whether removing
> any Q3 item *diminishes the encounter* belong to the sit — the inhabitant's, not mine.
> I can find where the software speaks; only a reader can say where it broke the spell.
>
> A *hospitality* audit asks whether the place deserved to be arrived at — never whether
> someone arrived. The first is the architecture's; the second is the person's.

## What was audited

The reader is **`/book-studio/read`** ("Read Flow"), not `/book-studio/book` — that path
doesn't exist (`/book/[slug]` is practitioner *booking*, a name collision). The reading
surface is three files plus two layers above it:

- `app/book-studio/read/page.tsx` — the page (eyebrow → cover → title → text)
- `app/book-studio/layout.tsx` — **the editorial Studio chrome it inherits**
- `app/book-studio/_lib/StudioMarkdown.tsx` — the prose renderer
- `app/globals.css:830` — `.studio-prose` (the reading conditions)
- `app/layout.tsx` — the root layout (global chrome)

## Headline: the book has no reading room of its own

The only way to read the book is **inside the editorial Studio.** A reader who arrives at
`/book-studio/read` is handed the author's workbench — the chrome around the text is a
*production menu*, and it speaks in the register of the workshop, not the book. Almost
everything below follows from this one fact. The single largest act of hospitality is
*separation*: a reading surface that does not inherit the studio. (That is likely what
`/book-studio/book` was reaching for — a reading room distinct from the editorial
`/book-studio/read`.)

## Q1 — Where does the software speak before the book speaks?

In order of loudness, top of viewport downward:

1. **The editorial nav** (`layout.tsx:17-50`) — a 6-item menu: *Read Flow · Passage
   Blocks · Illustration List · Design System · Render Print PDF · Workbench.* This is
   the workshop addressing the reader as an editor. It is the loudest pre-book voice and
   it is in the wrong register entirely — the first thing offered to someone who came to
   read is "Render Print PDF."
2. **The Studio wordmark** (`layout.tsx:31-39`) — "The Book Studio / Soullab Press" as a
   masthead link. The system naming itself before the book does.
3. **The platform eyebrow** (`read/page.tsx:25-36`) — holoflower mark + "SOULLAB PRESS ·
   READ FLOW" (uppercase, tracked). "Read Flow" is an *internal* name for the surface;
   the reader does not need to be told which software flow they are in.
4. **The global Beta pill** (`app/layout.tsx:191` → `BetaBanner.tsx`) — a fixed,
   top-center, non-dismissable "Beta" badge on every route (gated by
   `NEXT_PUBLIC_SHOW_BETA_BADGE`). Honest about platform maturity, but pinned *above the
   page while someone reads.* An honesty claim that belongs at a threshold, not hovering
   over the text.

What is **the book** speaking (keep): the cover image (`read/page.tsx:39-46`) and the
title/subtitle/author block (`48-65`). Those are the book's own face and threshold — they
are appropriate; they are only diluted by the system voices stacked above them.

## Q2 — Where is the reader asked to do something before they can simply receive?

Notably little *inside* the page — and this is real hospitality already: **no sign-in
wall, no modal, no consent popup, no "Start reading" CTA, no rating/subscribe prompt.**
The text is immediately present. The one demand is structural: the **nav** (Q1.1) places
a menu of *tasks* at the threshold, so the implicit first request is "choose a tool,"
before "receive a word." Remove the workshop and Q2 is nearly clean.

## Q3 — What could disappear without diminishing the encounter?

(Candidates. Whether each removal diminishes anything is the sit's call.)

- The **entire editorial nav** — for a reader, all six items are the author's tools.
- The **Studio wordmark masthead** — or demote it to a quiet colophon at the *end*.
- The **"READ FLOW" system label** in the eyebrow — the surface naming itself.
- The **Beta pill**, on the reading surface specifically — let the reading environment be
  one of the conditions where it is suppressed.
- **Candidate, felt-call:** the reader is **one endless scroll** (a single `ReactMarkdown`
  article, `StudioMarkdown.tsx:107`). Whether the book wants *pages* instead of scroll is
  a dwelling-vs-consuming question — yours to feel, not mine to assert.

## Q3 addendum — from the manuscript content itself (the chrome pass missed these)

Reading the source surfaced two structural items *inside* the rendered stream — so the
dedicated route alone will **not** remove them; they need a content-level fix:

- **Front matter in the reading stream.** `StudioMarkdown` renders the manuscript from
  line 1, so after the cover + title the reader scrolls through *publisher front matter*
  before the book begins: copyright/permissions legalese ("No part of this book may be
  reproduced…"), ISBNs, "Printed in the United States of America," dedication, a two-
  paragraph disclaimer, and the full Table of Contents — all in the reading type. In a
  *print* book these are flipped past unread; in an *endless scroll* they are a wall the
  reader must cross before the **Preface** (`…_FULL.md:59`), where the cosmogram plate is
  injected and the book actually takes the floor. The publisher/apparatus speaks for ~5
  sections before the book does. Fix: skip/collapse the apparatus so the stream is
  **cover → title → Preface**, with copyright/ISBN/disclaimer reachable but out of the
  reading flow.
- **Duplicated title.** `read/page.tsx:48-65` renders title + subtitle + author; then the
  manuscript *opens* with the same title + subtitle + author + imprint (`…_FULL.md:1-8`).
  The reader meets the title twice. Drop one.

The in-prose plates (cosmogram before Preface; element plates before Ch 5–9 per
`canonical-plates.config.json`, authored editorial thresholds) are **not** flagged —
whether they deepen or interrupt is a felt call for the sit.

## What is already hospitable (do not strip — this is generosity, not clutter)

- **The type** (`globals.css:830`): Crimson Text serif, 1.05rem, line-height 1.7, warm
  amber-on-charcoal. Quiet, low-glare, readable. Good.
- **The plates** (`globals.css:899`): centered, 3rem margins, `pointer-events: none`, no
  drag — they read as quiet thresholds, not hero images. Good.
- **Immediate text** — no gate between arrival and the first sentence. Good.
- The **measure** is `max-w-3xl` (~48rem) — on the *wide* side for a serif body (~80–90
  characters). Flagging as a condition for the sit, not a defect.

Subtract demand, not substance: the book is well-set. The work is to remove the workshop
from around it, not to redesign the page.

## Two structural facts for later

1. **No dedicated reading route.** The reading room has to be *made* (a `/book-studio/book`
   or `/book` reader that renders the same manuscript without the studio layout). This is
   subtraction expressed as routing: same text, no workbench.
2. **Zero continuity.** There is no "remember where you were" anywhere in the read path
   (confirmed: no scroll-restore, progress, or bookmark). This is the one place where
   *adding* is eventually warranted — and it is the **memory/consent seam**: a consented
   *bookmark* ("without spectacle"), never a tracker. Deliberately the **last** thing to
   add, and only with Sanctuary governance. Named here, not built.

## How this hands to the sit

Open the **live** `/book-studio/read` yourself and sit with it as a first-time reader —
not against this list, but freely. Then bring the four questions, Q4 especially. This map
is here only so that, *after* you have felt where the spell broke, we can name the code
that broke it and subtract it. The structural candidates above are suspects, not verdicts.
The verdict is yours.
