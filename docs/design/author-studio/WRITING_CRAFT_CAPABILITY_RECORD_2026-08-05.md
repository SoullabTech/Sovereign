# The Writing Craft — Capability Record (what the Canvas must be able to host)

> **Status**: A RECORD, not a build authorization. Founder-authored
> 2026-08-05 in the same review that produced the rail refinements. Its
> purpose is the founder's own: *"You don't need to decide today… You only
> need to make sure Writer Canvas can host them naturally."*
>
> ⛔ Nothing here is authorized. The stop-rule holds: the Creator Walk of
> the deployed room comes first, and each capability opens through the
> authorization gate (*the creator repeatedly tried X and the room could
> not support X*), never because it appears on this list.

---

## The governing question

Every capability answers **"does this help someone express their work?"** —
never *"does this make the editor more powerful?"* That distinction is what
separates an author's environment from a word processor.

And the shape of the answer: **capabilities stay quiet until needed. The
manuscript stays at the center, and the tools come to the author** — the
author never navigates the tools.

## Why a record and not a roadmap

These are not features; they are **the grammar of books**. An author should
never have to leave the environment because a fundamental is missing. But
the extension contract (`components/canvas/registry.ts`) already means each
one plugs into the same Canvas instead of becoming a special case — so the
list can wait without the architecture waiting.

```
Canvas
 ├── Manuscript      (the center — never extensible, by construction)
 ├── Rich Text
 ├── Images
 ├── Quotes
 ├── Citations
 ├── Tables
 ├── Math
 ├── References
 ├── Timeline
 └── Reflection
```

## The craft, as the founder named it

**Rich text — authoring formatting, not decoration**: headings · block
quotes · epigraphs · poetry · lists · footnotes · endnotes · side notes ·
callouts · scene breaks · tables · horizontal rules.

**Images as first-class objects**: drop into a manuscript · caption · cite
the source · anchor to a passage · wrap text where appropriate · move
without breaking references. Later: galleries · figure numbering ·
full-page plates · illustrations · diagrams.

**Quotations, richer than a quote block** — attributed quotations ·
personal · interview excerpts · cited research · scripture · poetry ·
archival documents, **each with provenance**:

```
Carl Jung
Memories, Dreams, Reflections
page 214
```

rather than pasted text. (Note the convergence: this is the same
belonging-with-provenance grammar the Materials design ruled — a quote is
a member-made fragment whose source keeps its home.)

**Citations** — footnotes · endnotes · bibliography · Chicago · APA · MLA ·
custom. *Not because everyone needs them. Because authors eventually do.*

**Links** — internal (another chapter, another passage, another manuscript)
and external (sites, articles, videos, papers).

**Tables** — indispensable for business, psychology, science, history.

**Mathematical notation** — probably not R1; eventually inline and display
math if this is to be a universal writing environment.

**Code blocks** — many authors write technical books.

**Pull quotes** — especially during design.

**Comments** — different from notes: *conversations about the work*.

**Version comparison** — eventually, not immediately.

## The one addition the founder named as missing

**A Writer's Toolbox** — not a feature, a gesture. Not visible all the
time: a quiet `+` / insert menu from which an author naturally inserts
Quote · Image · Table · Diagram · Footnote · Endnote · Citation ·
Reference · Callout · Poem · Letter · Interview · Timeline · Divider.

> *"It feels like reaching into a drawer beside the writing desk. Not
> opening another application."*

This is the toolbar's eventual answer — and it is exactly why the toolbar
was left near-empty rather than filled with speculative furniture.

## THE WRITER'S DESK (founder, developed same evening — a signature idea)

⛔ **Not a toolbar.** Named **The Writer's Desk** (or Writer's Drawer).
While writing, almost nothing is visible; when the author needs something,
a quiet `+` in the margin opens a designed panel — **not formatting
buttons, but acts of writing**:

| Drawer | What the author reaches for |
|---|---|
| **Write** | New chapter · Scene break · Letter · Dialogue · Journal entry · Poem · Reflection |
| **Bring Something In** | Quote · Photograph · Illustration · Sketch · Table · Timeline · Diagram · PDF excerpt · Research note |
| **Reference** | Footnote · Endnote · Citation · Cross-reference · Bibliography entry |
| **Organize** | Callout · Sidebar · Appendix · Glossary · Index marker |
| **Think** | Ask MAIA about this passage · Compare versions · Find related passages · Gather supporting material |

⭐⭐⭐ **The mental model shift**: the writer never thinks *"where's the
image button?"* — they think *"I want to bring in a photograph."* The
vocabulary is the author's act, not the software's control.

**Each drawer item is an extension**, so the architecture stays still while
the desk fills: *the Canvas doesn't become more complicated; the desk
simply has more drawers.*

**Deployments change the desk, never the Canvas** — a novelist sees
Character · Scene · Dialogue · Setting · Timeline; a historian sees
Citation · Footnote · Archive · Map · Timeline; a scientist sees Equation ·
Figure · Table · Reference · Dataset; a memoir writer sees Photograph ·
Letter · Journal · Conversation · Family Tree. **The canvas never changes.
The desk changes.**

### The adaptive drawer — and its exact boundary

> *"What if the desk learns from the work — but only by offering, never by
> assuming?"* A memoirist who has inserted several photographs finds
> Photograph risen toward the top; a researcher finds Citation rising. No
> modal, no onboarding, no settings.

⚠️ **This is adaptive behavior, so the sovereignty rider governs it
exactly** (`docs/design/INHABITABLE_ARCHITECTURE.md`): the desk may order
itself by **counted member acts — what they actually inserted, how often,
how recently**. Those are authored facts. It may NEVER order itself by an
inferred genre, an inferred intent, or a guess about what kind of writer
the person is. *"You have used Photograph often"* is memory of their own
gestures; *"you seem to be writing a memoir"* is the system deciding who
they are. The first is a well-made desk; the second is the third voice.

Corollaries that keep it honest: everything stays reachable (rising must
never mean hiding); the order is inspectable and resettable by the member;
and the desk never announces what it noticed.
