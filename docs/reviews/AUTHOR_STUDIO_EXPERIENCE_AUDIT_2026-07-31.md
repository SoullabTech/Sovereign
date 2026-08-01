# Author's Studio — Experience Audit

> **Class:** experienced evidence — authenticated walk, 2026-07-31.
> **Referent:** `origin/clean-main-no-secrets` @ `95bee3a03` (the deployed commit), served
> locally from a worktree at `localhost:3000`. Walked signed-in as the founder.
> **Data:** local Mac Studio Postgres — 3 manuscripts, *Elemental Alchemy (KDP print)*
> (209 pages · 174 sections). **Not** production data.
> **Held against:** `docs/architecture/AUTHOR_STUDIO_EXPERIENCE_SPEC.md` (ratified 2026-07-31).

---

## The finding the whole audit reduces to

**An excellent Manuscript Room has been built and presented as the Studio.**

Every element on Arrival names one artifact: *Current Book · Working Draft · Source ·
Import Manuscript · 174 sections · Continue Writing · Read the Source*. The only secondary
action is **import another manuscript**. A creator arriving with a retreat, a methodology,
a keynote, a certification program, field notes, or an unresolved question has **no place
to belong** — not a missing feature, a missing *object*.

The Studio asks *"which manuscript?"* It must ask *"what work are you here to continue?"*

This is now a spec failure, not a preference: **§6 L1** (no universal manuscript entrance)
and **§6 L2** (expression, not identity) fail at Arrival.

---

## A. Arrival — `/press/studio`

| Test | Result | Evidence |
| --- | --- | --- |
| A1 work named before software | **PASS** | *Elemental Alchemy (KDP print)* is in the rail and the page |
| A2 one obvious next action | **PASS** | *Continue Writing* is the only filled button |
| A3 one action to writing | **PASS** | `WRITE_HREF` deep-links to `?tab=draft` |
| A4 nothing unbuilt is clickable | **PASS** | Gatherings · Shape · Release render `— not yet available`, no href |
| A5 empty Studio offers one real door | not walked | requires a member with no manuscript |
| A6 arrival never explains itself | **PASS** | no tour, no tips |
| **L1 non-manuscript entrance** | **FAIL** | every door requires a manuscript to exist or be imported |
| **L2 expression, not identity** | **FAIL** | `CURRENT BOOK` is the identity heading; the work *is* the book |

**A-1 · The heading is the ontology.** `CURRENT BOOK` sits where the Living Work belongs.
**A-2 · The subtitle scopes the Studio to books.** *"A place to gather, shape, write, and
bring your book into form."*
**A-3 · Import occupies the second-most prominent position** — a file-management act
presented as the alternative to writing. `BRING IN ANOTHER` is a file manager's language.
**A-4 · The Studio has no memory of activity.** No conversations, voice, journal, research —
so returning tells you *what you own*, never *what you were doing*.

## B. Writing — `/press/manuscript?tab=draft`

| Test | Result | Evidence |
| --- | --- | --- |
| W3 failure states itself in place, non-destructively | **PASS** | *"Could not open your working draft just now. Try again"* — no modal, nothing discarded |
| W2 saving is never a decision | **PASS** | `Saved · Jul 30, 7:52 PM`, no Save button |
| W1 nothing moves unless caused | **FAIL** | a floating **Report a bug** widget sits permanently over the writing surface |
| W4 measure/leading set for prose | **FAIL** | see W-2 below |
| W5 reachable state of text-only | **FAIL** | no such state exists |
| §3.5 the way out is always visible | **PASS** | `← AUTHOR STUDIO` present |
| §3.6 one vocabulary | **FAIL** | see W-3 |

**W-1 · The writer's own words were the dimmest thing on the page — measured, root-caused,
fixed.** Computed style on 2026-07-31: the draft rendered `rgb(17,24,39)` — near-black — on
the espresso ground `#1A1513`, while every piece of surrounding chrome rendered cream
`rgb(243,237,228)`. The software was literally more visible than the work.

**Cause:** two global rules in `app/globals.css` written for *forms* were landing on the
writing surface — `input, textarea, select { @apply text-gray-900 bg-white }` (the dark
variant is keyed to `.dark`, which this surface never sets) and `textarea { font-size: 16px
!important }` (the iOS zoom guard). Neither was a Studio decision. This is Kelly's thesis
expressed in CSS: **unrelated software intruding into the writing room.**

**Repair:** `textarea.writing-surface` opts the page out of the form rules; every existing
form is untouched. Verified after: `color rgb(243,237,228)` · `font-size 19px` ·
`line-height 33.25px` · **64 characters per line**.

**W-2 · CORRECTION — my earlier claim that measure was not held was wrong.** The component
always specified `maxWidth: 38rem` and 19px/1.75. What I saw was collateral damage: the
`!important` rule forced the type to 16px, which stretched the same 608px column to ~76
characters. With the override removed the measure is **64 characters** — exactly what the
source comment says it was designed for. There was one defect here, not two.

**W-3 · The Studio disappears exactly where it should be strongest.** `StudioShell` — the
Layer 2 rail that makes the Studio an environment you are *inside* — is **not rendered on
the writing surface**. It is replaced by a seven-item tab bar (*Manuscript · Working Draft ·
Keeps · Collections · Emerging Books · Export · Your Book*) that **wraps onto two lines**.
So the Studio is not a house the Manuscript Room lives inside; it is a page you left.

**W-4 · Every tab names an artifact or a software function.** None names an act of work.

## C. Import — threshold

Not re-walked this session. Prior record stands (`AUTHOR_WRITING_WALK_2026-07-30.md`):
copy states the consequence before the file dialog, and the way back up is visible. Both
still correct in source at `95bee3a03`.

## D. Return

`returningState.ts` restores the last open pane; deep links win. **PASS** on §3.4 within
the Manuscript Room. **Untested at Studio scope** — there is nothing but a manuscript to
return *to*.

---

## E. One defect found, correctly scoped

**Local dev only. Production is not affected.**

`GET /api/sovereign/manuscripts/[id]/draft` returned **500** — `column "version" does not
exist` (`manuscript_working_drafts`). The Working Draft would not open.

- Cause: migration `20260731000001_draft_concurrency.sql` (shipped with PR #851) was **not
  applied to the local Mac Studio database**.
- **Production checked directly**: `manuscript_working_drafts.version bigint not null
  default 1` **is present** on minisforum. Production is correct.
- Resolution: migration applied locally; the Working Draft now opens. No code change.

*Why this is worth recording:* the quick `deploy-maia` path runs no migrations, so a
Phase B deploy could have produced exactly this symptom in production. It did not — the
full deploy path was used. The check was necessary; the alarm was not.

---

## F. What is genuinely good, and must survive the rework

Not defended out of ownership — these are properties the rework must not lose:

1. **Honest unavailability.** `studioMap.ts` gives unbuilt destinations no `href`. That
   discipline is rare and should become platform-wide.
2. **Failure never asserts absence.** Load failure is visually distinct from emptiness, in
   both the Room and the list. Hard-won; keep it.
3. **Source is never altered.** Stated in the import copy, enforced in the substrate.
4. **No interpretation on screen.** No scores, themes, badges, or AI indicators anywhere.
5. **The palette and typography are right.** Espresso ground, warm cream, deep amber, quiet
   serif. The problem is not the aesthetic — it is what the aesthetic is arranged around.

---

## G. Roadmap, re-ordered by experiential leverage

The ten-stage roadmap stands. The Living Work ruling changes **what Stage 2 is** and moves
it ahead of everything else.

**Stage 1 — Make the writing surface serve the writing.** *No schema. Highest ratio.*
Raise prose contrast above chrome (W-1) · hold measure (W-2) · remove the bug widget from
the writing surface (W1) · render `StudioShell` on Layer 3 so the Studio does not vanish
(W-3).

**Stage 2 — Make the house belong to the work, not the artifact.** *The Living Work ruling.*
A Living Work becomes the governing record. The creator **names their work** — one gesture,
member-authored, never inferred. Existing manuscripts attach to it as **expressions**;
nothing is re-segmented, re-titled, or re-interpreted. Arrival is re-founded on
*"Continue where you left off"* + **Current focus** + **Expressions**, and `CURRENT BOOK`
and `BRING IN ANOTHER` leave the center.

**Stage 3 — A real non-manuscript entrance** (§6 L1). The first door for material that is
not a book. Honest scope: it may hold and return material without organizing it.

**Stages 4–10** — unchanged from `STUDIO_PRODUCT_ROADMAP_2026-07-31.md`, now expressed
against a Living Work rather than a manuscript.

**Sequencing note.** Stage 1 before Stage 2 deliberately: Stage 2 is the larger correction,
but a creator who cannot comfortably see their own sentences will not stay long enough to
notice the better house.
