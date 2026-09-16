# WRITERS-STUDIO-EXPERIENCE-REBUILD-01 — target state

Founder-supplied mockup, 2026-09-16. **This is the specification.** Where it
and the package's §5 disagree, this wins and the package is corrected.

Described in full below because the image cannot live in the repo, and a
target state that exists only in a chat window is not a target state.

---

## what the mockup shows

**Top chrome.** `SOULLAB | Writer's Studio` · mode bar
`Write · Develop · Explore · Review · Publish` (pill on Write) · search ·
notifications · avatar. ⭐ The mode bar **survives** — those are phases of the
writer's work, not implementation taxonomy.

**Left region — permanent.** `‹ All Works` · the Work as a card (cover,
title, one-line description) · `Manuscript · Materials 0 · Notes · Versions 5
· Goals` · then `OUTLINE  +`, hierarchical and collapsible:

    Part Three — The Spiral
      Chapter 8: The Threshold          ›
      Chapter 9: Integration            ›
      Chapter 10: The Living Spiral     ⌄   ← gold fill: the chapter you are in
        I. The Living Spiral                ← gold bar: the passage you are at
        II. Finding Our Place
        III. A Life Through the Elements
      Chapter 11: Emergence             ›
    Part Four — Embodiment              ›
    Part Five — The Return              ›
    Epilogue                            ›

**Centre — the manuscript.** Breadcrumb `Elemental Alchemy / Chapter 10: The
Living Spiral` · `262 sections | Saved 2m ago | …`. Then the book, set as a
book: `CHAPTER 10` eyebrow, `The Living Spiral` display title, italic
standfirst, body prose. The worked paragraph is held in a warm amber
selection. Footer: `1,248 words` · `✨ Ask MAIA` · `Aa ⌄` · list · panel.

**Right — MAIA, permanent.** Avatar · `MAIA` · `In relation to: Elemental
Alchemy ⌄`. Composer **at the top**: `Ask MAIA about this passage…`. Her
answer below, with `👍 👎 ⧉` and `More like this ⌄`. Then:

    ✦ Suggested revision
      A more vivid, flowing expression that maintains your meaning.

      Current                  →   Suggested
      [the writer's sentence]      [MAIA's sentence]

      [✓ Apply revision]  [↻ Try another]  …

---

## what it settles

**S1 — three permanent regions, not two.** Outline · Manuscript · MAIA. My
package §5 had the outline receding; that is wrong for a 262-section book.
Navigation is permanent. **Context** — Materials, Notes, Versions, Goals —
becomes a rail destination, not a permanent band. The lower band is gone.

**S2 — MAIA sits beside, permanently.** The banked E4 decision is answered.

**S3 — the identity line is the Work.** `In relation to: Elemental Alchemy`
renders `workContext`'s law at the surface, where it currently isn't, and is a
control: scope is inspectable and adjustable without a mode.

**S4 — place is nested, not competing.** The chapter is filled gold; the
passage carries a gold bar. *You are in Chapter 10, at I. The Living Spiral.*
⭐ This dissolves 198-versus-199 by construction: they were never rivals, they
are two depths of one place. `StudioFocus.sectionRef` is the leaf; the chapter
is derived from it.

**S5 — the entire editorial machinery, with no taxonomy.** Propose, compare,
adopt, retry — inline in MAIA's column. No room, no mode, no chooser, no
`proposal chain`, no `version`, no `relationship`. The words the writer reads
are *Suggested revision*, *Current*, *Suggested*, *Apply revision*,
*Try another*.

**S6 — the flat numbered list is gone.** No `189. · 190. · 191.` No
`262 sections` as a rail. The count moves to the centre header where it is
information, not navigation.

**S7 — selection is a first-class, visible, persistent state** — an amber hold
on the paragraph, not a transient browser selection. It survives asking,
answering, comparing.

---

## the dependency this exposes

⚠️ **The outline as drawn cannot be built on a flat section list.** It needs
Part → Chapter → sub-section depth. `heading_depth (1..3)` landed in **WS2-08
BUILD-08A** (migration `20260906000001`) on the Source, and **08B — member-
confirmed imported hierarchy — is on HOLD**. The 08A census also recorded
`deriveImportedStructure()` folding 185 all-caps cuts into **0 units** for an
imported Work.

So: whether ELEMENTAL_ALCHEMY carries usable depth today is **unknown to me**
and is the first E0 question. If it does not, **08B is a dependency of this
rebuild**, not an optional later stage, and needs a founder act to open.

⛔ I will not open it. I will report in E0 whether it is required.

---

## open, and deliberately not asked

The mockup is warm paper; production is dark olive with an Appearance menu.
I will build the structure theme-agnostic against the existing atmosphere
layer, so this stays a setting rather than a rebuild. **Not a blocking
question.**

---

## acceptance, restated against the image

The rebuilt Studio is done when a screenshot of it is indistinguishable from
this mockup in structure — three regions, hierarchical outline, nested place,
scope-derived composer, inline compare-and-apply — and the founder can work in
it for an hour thinking about the book.
