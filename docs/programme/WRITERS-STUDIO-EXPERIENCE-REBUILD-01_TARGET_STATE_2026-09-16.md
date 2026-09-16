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

---

# target state · part two — the working states

Three further founder mockups, same day. These add the states the first image
did not show, and **correct one law**.

## the correction

Part one derived: *"scope is derived, never chosen."* **Wrong, and the
mockups are right.** Scope is now shown as a control in the centre header,
beside the breadcrumb:

    📖  Reviewing entire chapter          ⌄
    ◎   Focused section: II. Finding Our Place   ⌄

⭐⭐ **THIS IS THE ANSWER TO THE WHOLE FAILURE.** On 2026-09-16 the writer
could not see what MAIA was bound to, so a silent substitution was
undetectable until it was wrong. The corrected law:

> **Scope is always visible, and changes only by an explicit member act or by
> the member's attention plainly leaving the thing it was bound to. It never
> changes silently, and it is never inferred behind the writer's back.**

Derivation still does the work — the writer does not usually pick. But the
derived answer is **on screen, named, and adjustable**, which is what makes a
wrong answer impossible to miss.

## S8 — two working states, one Focus

MAIA's column carries a segmented control:

    [ Chapter Review ]  [ Passage Work ]

⛔ **THIS IS NOT THE OLD ORDINARY/EDITORIAL SPLIT RETURNING.** That split was
two conversation *products* with different persistence and different loci.
This is one relationship at two *grains of attention*, over the same Focus,
with explicit continuity between them:

- Passage Work carries a `From chapter review` card — the finding that sent
  the writer here — with `View all findings →`.
- Passage Work ends with `← Back to chapter findings`.

Neither moves the manuscript.

## S9 — chapter review produces findings, and findings are objects

    ✓ Chapter review complete            262 sections · Reviewed

    What's working           4     Needs deepening          3
    Structural opportunities 3     Suggested next steps     5

    Findings by section
      I. The Living Spiral      Strong opening. Sets a soulful tone.  [Strong]        ›
      II. Finding Our Place     Powerful ideas, opportunities to…     [See suggestions] ›
      III. A Life Through…      Beautifully written, could use…       [Structural]    ›
      IV. The Human Rhythm      Rich content, consider more…          [Deeper]        ›
      V. Living the Spiral      A strong conclusion, with room…       [See suggestions] ›

    [ ✨ Let's work on a section together ]   [ 💬 Ask a question ]

⭐ A finding is a typed, section-bound, member-facing object: `kind` ·
`sectionRef` · one-line summary · status chip · detail. Clicking one carries
the writer into Passage Work **on that section**, which is a member act moving
Focus — visible, chosen, and therefore lawful.

⚠️ This is new substrate. It is not the proposal chain and must not be folded
into it: a finding is MAIA's reading, a proposal is a proposed edit.

## S10 — passage work has four verbs

    Interpret | Suggest | Explore | Ask

with `◎ Working on: II. Finding Our Place` and `Change section ⌄` above them.

⚠️ **Governed dependency.** `/api/writers-studio/focus` today admits
`gesture: ask_maia | work_with_this | widen_focus`. Four surface verbs do not
map onto three server gestures, and widening that CHECK is the *accompanying
vocabulary redesign* that earlier acts were deliberately separated to avoid.
**I will map to the existing three where honest and report the gap rather than
widen anything.**

## S11 — a revision has two presentations, one toggle

    Suggested revision                          [ Show changes ]

  - default: `Current  →  Suggested`, side by side.
  - `Show changes`: the full new paragraph with the insertion held in amber,
    in place.

    [ ✓ Apply revision ]  [ ↻ Try another ]  [ 💬 Discuss this ]  …

`Discuss this` is the seam that keeps a proposal from being take-it-or-leave-
it — it returns to conversation without losing the proposal.

## S12 — the centre is state-aware and still never jumps

In chapter review the manuscript carries a quiet banner — `Full chapter in
review` — and in passage work it renders the section headings inline with the
worked paragraph held in amber. **The scroll position does not move between
these states.**

## S13 — outline depth confirmed at three levels, fully

    Part One — The Foundations  ›
    Part Two — The Elements     ›
    Part Three — The Spiral     ⌄
      Chapter 8 … Chapter 9 … Chapter 10 ⌄
        I. · II. · III. · IV. · V.
      Chapter 11 ›
    Part Four · Part Five · Epilogue

Two place marks, nested: the chapter filled, the sub-section barred.

## what part two adds to the build plan

- **E1** Focus gains an explicit, member-visible scope with an override that
  holds until attention leaves it.
- **E2a** findings substrate — typed, section-bound, distinct from proposals.
- **E2b** chapter review as a scope, not a mode.
- **E3** the four verbs, mapped to existing gestures; gap reported, not widened.
- **E4** the two revision presentations and `Discuss this`.
