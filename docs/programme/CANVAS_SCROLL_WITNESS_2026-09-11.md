# CANVAS SCROLL REPAIR — browser witness

**Founder-run, 2026-09-11 · branch `claude/s3-implementation` · repair `b9f7a676b` · witnessed at `24a449c02`.**
Local `next dev` on `:3010`, `maia_consciousness`, manuscript `a3ae67fd…` *Elemental Alchemy*
(174 sections). ⛔ No deploy. Production remains `5f65038d2`.

> ⭐ **The result is valuable precisely because it is mixed, not because it gives a clean green
> light.** — founder

---

## 1 · The repair under witness

`app/writers-studio/canvas/revealWithin.ts` replaces `scrollIntoView` at four call sites.
`scrollIntoView` scrolls **every** scrollable ancestor including the document; `revealWithin` scrolls
the **nearest** scroller and returns without acting when nothing between the node and the document
scrolls.

```text
WholeManuscriptSurface:279   'start'            outline row click → manuscript pane
StructuredOutline:170        'center'           active row revealed once on mount
StructureReview:461          'start', smooth    go-to-questions
StudioConversation:119       'end'              new turn pins to bottom
```

## 2 · Result

```text
DESKTOP
nearest section scroller     inner manuscript pane
shell/document scrollable    no at witnessed width
behavioral click             inner pane moved
page/header/rail movement    none observed
verdict                      PASS — structural + behavioral
qualification                outer-scroll invariant partly vacuous
                              at this viewport because ancestors
                              were not scrollable

COMPACT 390px
nearest section scroller     shell
behavioral click             shell moved 1044 → 13006
verdict                      FAIL / UNFIXED
classification               layout defect, not revealWithin defect
```

⛔ **PRESERVED, and not to be softened later:**

> **No A/B against the old implementation was performed at the desktop witness width.**

⭐ **So the desktop pass rests on MECHANISM plus one observed click — not on a before/after
comparison.** *We do not turn mechanism into observation after the fact.*

## 3 · The measurements, as taken

**Desktop, 1418 × 1098**, three panes side by side:

```text
{ width: 1418, compact: false, nearestScroller: 'DIV.', verdict: 'PASS inner pane is nearest' }
{ shellScrollable: false, note: 'shell cannot move at this width — silence would be vacuous' }
__bad()  →  0        (counter of DOCUMENT or SHELL scroll events during the click)
```

Clicking outline row 7 (*CALL TO ADVENTURE*) moved the manuscript pane from the title page to
`-- 12 of 216 --`; header, left rail and the outline column did not move.

**Compact, 390 × 844**, panes stacked — the capture logger named the scroller:

```text
DIV < DIV[room] < DIV[wsAtmosphere] < BODY < HTML      top= 1044 → 13006
```

⭐ **One scroller throughout, and never `DOCUMENT`.** In compact layout the writing field stops being
a scroller and the shell becomes the nearest one, so `revealWithin` moves it — **correct behaviour
with a bad result**, because there is nothing else to scroll.

⚠️ **The founder's own suggested probe — `document.scrollingElement.scrollTop` before and after —
was NOT run in that form.** The equivalent was established two ways instead: the document was proved
non-scrollable at every width tried (`scrollHeight === innerHeight` exactly), and `__bad()` counted
document scroll events at zero. **Recorded as a difference, not as an equivalence claimed after the
fact.**

## 4 · 🔴 THE INSTRUMENT WAS WRONG BEFORE THE PRODUCT WAS — three times

⭐ **Kept because the pass is only as good as the instrument that produced it**, and because this is
the third session in a row where the instrument, not the subject, was the defect.

```text
1  LISTENED ON THE WRONG TARGET
   `window.addEventListener('scroll')` without capture hears the DOCUMENT only.
   The studio's scrollers are ELEMENTS, and element scroll does not bubble to
   window. ⛔ Four rounds of silence proved nothing.
   → repaired: document-level capture listener naming the scrolling element

2  ASSERTED A CONDITION WITHOUT CHECKING ITS PREREQUISITE OBTAINED
   A silence-based witness was proposed before establishing that the document
   could move at all. `canScroll: false` at every width.
   ⭐ The same defect class as `o8` and the two reader fixtures, committed
     while repairing that very class.

3  MIS-STATED THE TRIGGERS
   "Click an outline row → the outline moves" was wrong: the click sets
   `jumpTo`, which the MANUSCRIPT surface consumes. `StructuredOutline`'s own
   reveal is a PAGE-LOAD trigger, guarded to once per mount — not a click.
```

> ⭐⭐ **An instrument that cannot detect the defect is not evidence of its absence.**

## 5 · What this does and does not close

```text
DESKTOP SCROLL REPAIR
code                         CLOSED
branch browser witness       PASS, with stated viewport qualification
production confirmation      OWED AFTER DEPLOY

COMPACT SCROLL
defect                       CONFIRMED
cause                        writing pane ceases to be a scroller;
                             shell becomes nearest scroller
repair                       NOT AUTHORIZED
classification               RESPONSIVE LAYOUT / SCROLL OWNERSHIP

DEPLOY                       still a separate decision
```

⛔ **Do not modify the desktop fix to solve compact.** That would mix two different problems and risk
breaking the repair that just passed. The compact case needs the writing field to remain a real
scroller at narrow widths — **a layout change, not a call-site change.**

## 6 · Production, separately

The founder reproduced the jump on `soullab.life` during this session, on a **wide desktop window**
with the full multi-column Studio visible — ⛔ **not the 390px compact layout.** Production is
`5f65038d2` and has never carried `b9f7a676b`.

```text
production reproduction      CONFIRMED — the old defect is live
repair falsified             NO
```

⭐ **So the desktop symptom is consistent with the old `scrollIntoView` implementation, and the
branch removed that mechanism.** ⛔ **The compact finding does not explain the production report
away** — they are two distinct things, and only one of them is repaired.

---

## 7 · Standing

```text
repair                       b9f7a676b, on claude/s3-implementation
witnessed at                 24a449c02
desktop witness              PASS (qualified)
compact defect               OPEN, unrepaired, not authorized
A/B against old code         NOT PERFORMED
deploy                       HELD — a separate founder decision
```
