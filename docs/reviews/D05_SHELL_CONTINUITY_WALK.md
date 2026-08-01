# D‑05 — Shell Continuity Walk

> **Status: record awaiting the walk.** No entries yet. This file exists before the walk so
> its constraints are fixed in advance rather than recalled afterwards.
>
> **Class:** experienced evidence. **Governs nothing** — it records what happened, not what
> to change. Held against `AUTHOR_STUDIO_EXPERIENCE_SPEC.md` §3.8 and ledger D‑05, D‑17.

---

## A. Observer constraints — read before recording anything

**C1 · localhost is not the merged tree.** ⚠️ **The most important constraint in this file.**

The dev server at `localhost:3000` serves:

> **canonical branch content + uncommitted D‑05 changes** (`app/press/studio/StudioShell.tsx`,
> `app/press/manuscript/page.tsx` — 32 insertions, 17 deletions)

Those changes are **not** in PR #854 and **not** in `clean-main-no-secrets`. Every screenshot,
measurement, and impression taken here is evidence about a tree that exists on one machine.

**No artifact from this walk may be cited as evidence of the merged tree.** If a later
session finds a rail screenshot and reasons from it about production, that is the failure
this constraint exists to prevent. Tag every observation `[E] local+D‑05`.

**C2 · The walker is the founder.** The founder both built the environment and holds the
only account with a manuscript in it. Any question of the form *"would a newcomer
understand this?"* is **structurally unanswerable from this seat.** Do not record a pass.

**C3 · The rail judgment cannot be made from a screenshot.** Ledger §4: *quiet* is an
attentional property, *dimmed* is a visual treatment. The test is **after ten minutes of
real writing — did I stop noticing it?** A measurement of opacity is not an answer. An
impression formed in the first thirty seconds is not an answer either.

**C4 · Viewport must actually change.** On 2026‑07‑31 an attempted mobile walk failed
silently: the browser window resized but `window.innerWidth` stayed pinned at 856px, so the
desktop rail never gave way to the switcher. **Verify `window.innerWidth` before recording
any mobile observation.** A real device is preferred.

---

## B. What D‑17 removed from this walk

Founder ruling, 2026‑07‑31: *an unauthorized or unauthenticated boundary does not need to
preserve the interior Studio shell. It must preserve truthfulness, orientation, and a clear
way forward. Do not render the quiet interior rail around a boundary the member has not
crossed.*

So the unauthorized state leaves the walk entirely. **Two scopes, and they are not the same
size — do not collapse them:**

- **Implementation scope: three unresolved states → two.** Loading and import remain to build.
- **Walk scope: three authorized states, unchanged.** Ready is still walked. It is *built*,
  not *judged* — and the rail judgment (C3) can only be made there.

**The governing test is not "was this state on the checklist?"** It is: *is the member
already inside the authorized Studio journey?* (Founder, 2026‑08‑01, admitting load failure
as a fourth interior state — access has been granted; the Studio is failing to recover the
member's work. Removing the house there would compound *"we cannot read your work"* with
*"and you are nowhere"*, at the moment orientation matters most.)

| State | Inside the authorized journey? | Implementation | In the walk? |
| --- | --- | --- | --- |
| Ready (writing) | yes | **built** — awaiting judgment | **yes** — and it is the only place C3 can be answered |
| Loading | yes | **built** 2026‑08‑01 | yes |
| Load failure | yes | **built** 2026‑08‑01 | yes |
| Import | yes | **built** 2026‑08‑01 | yes |
| Unauthorized / sign‑in | **no — threshold** | **none needed. Correct as it stands** (D‑17) | no |

⚠️ *"Nothing left to build here"* is not *"nothing left to observe here."* Ready-state
evidence is **in scope**, and it carries the question the whole slice turns on.

---

## C. The walk

*(To be completed. Each entry: what happened, not what to change.)*

1. **Loading** — does the house remain while the room fills?
2. **Load failure** — does the house remain when the list cannot be read?
3. **Import** — does the house remain through the whole import flow (empty state, paste,
   confirm-cuts preview)?
4. **Mobile** — at a verified real breakpoint (record `window.innerWidth` — see C4).
5. **The rail, after ten minutes of writing** — quiet, or unavailable-looking?
6. **Adjustment**, if 5 says dimmed: replace opacity reduction with a treatment that
   preserves legibility.

**Open, and not answerable by the builder:** 4 and 5. Everything above them is built and
observable; these two require a real viewport and a real writing session.

## C-bis. Builder verification completed 2026‑08‑01

Everything below was resolved **before** the founder walk, so the walk asks only what
founder experience can answer.

**Shell continuity — all four interior states render inside `StudioShell`:** loading ·
load failure · import (empty state, paste, confirm-cuts preview) · ready writing.
Unauthorized deliberately outside (D‑17), asserted in a code comment so it is not
"fixed" later.

**No duplicated navigation or room titles.** The room's own `← Author Studio` link and
`<h1>{title}</h1>` were removed from the ready state, and the `← Author Studio` link was
removed from the import threshold; the rail carries both permanently (§3.9). The seven-item
tab row is untouched — naming those tabs is a decision one layer down.

**Accessibility — a regression I introduced, found and fixed.** `opacity-45` on the rail
**multiplies** with the per-element opacities already inside it (links 0.6, group labels
0.35, notes 0.45). Measured composite contrast against the espresso ground:

| Element | at `opacity-45` | at `opacity-85` | WCAG AA (4.5:1) |
| --- | --- | --- | --- |
| Home | 2.25 | **4.84** | now passes |
| Working Draft | 2.50 | **5.72** | now passes |
| Source | 2.25 | **4.84** | now passes |
| Import Manuscript | — | **11.42** | passes |

Quiet is now carried by **footprint** (208px vs 240px, less padding) plus one modest
opacity step, not by dimming destinations below legibility. Hover and `focus-within` still
restore full weight. **This mattered for the walk itself:** at 45% the founder would have
been judging *quiet vs dimmed* on a surface that was neither — it was inaccessible.

**Pre-existing and NOT introduced by D‑05** — `[E]` measured, recorded not fixed:
Studio Home's rail (live on canonical, `opacity-1`) already renders secondary text below
AA — group labels 2.94:1, destination notes 2.25:1, unavailable destinations 2.49:1. In
quiet mode these sit at 0.85× those values. **Out of D‑05's scope** (it is Home's treatment,
not the shell-continuity change) but it should not be lost: fixing it means revisiting the
rail's secondary-text opacities everywhere, which is its own slice.

**D‑14 complete inside Press.** Every text-entry control in `app/press/**` now declares:

| Control | Declaration |
| --- | --- |
| Working draft (`WorkingDraftEditor`) | `.writing-surface` — it is a page |
| Checkpoint note | `.press-field` |
| Import title | `.press-field` |
| Import paste box | `.press-field` |
| Section heading (confirm-cuts) | `.press-field` |
| New collection name | `.press-field` |
| File chooser (`type="file"`) | n/a — not text entry |

No control inherits the global `input, textarea, select` rule implicitly. The checkpoint
note, section heading, and collection name were all measured at `rgb(17,24,39)` before the
fix — three further instances of the same defect, on fields the code itself describes as
carrying the member's authorship. **The sweep outside Press was not performed and remains
`[V]`.**

---

## D. The commit name

D‑05 was held once already because its commit name claimed more than the code did — it
persisted the shell in the ready state alone. **The name is the test.** When this slice is
committed, it must name the states it genuinely covers and nothing further.

---

## E. The three questions

*Answered last, after the writing — not during it.*

**Do not evaluate the implementation. Evaluate your relationship to the work.** The walker
is not a founder reviewing software; they are a person who came here to write. Observations
like *"the opacity should be 82%"* or *"the rail should be 12px narrower"* are less valuable
than *"I thought about navigation twice in ten minutes."* The first kind of note prescribes;
the second kind is evidence.

1. **When, if at all, did I stop thinking about the interface?**
2. **What was the first thing that pulled me out of the writing?**
3. **If I returned tomorrow, what would I remember — the software or the work?**

Supporting noticings, if they arise: did you forget you were inside the Studio · did
anything interrupt a train of thought · when you reached for something, was it already
where your attention expected it · did the room feel like it was *holding* your work, or
asking you to *operate software*.

**These three questions are what everything else is for.** Contrast ratios, shell
continuity, D‑05, D‑14, the evidence classes, the governance, the migrations — every one of
them exists only to make these answers better. A slice that satisfies all its acceptance
tests and leaves question 3 answered *"the software"* has not succeeded.
