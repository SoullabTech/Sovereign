# Writer's Studio · Canvas — the room scrolled the window

**Founder-witnessed in production 2026-09-11**: switching the manuscript pane to
**Whole manuscript**, and selecting a section from the **Manuscript outline**,
scrolled the entire page — the Studio header and the left rail left the top of
the screen. Reported as *"the screen jumps up… a known error that is also
triggered by hitting a Manuscript section."*

## Cause

```js
node.scrollIntoView({ block: 'start' })
```

⛔ **`scrollIntoView` scrolls EVERY scrollable ancestor, the document
included.** The canvas room scrolls in `<main>` (`overflow: auto`), but the page
itself can also scroll — so a reveal meant for the manuscript pane dragged the
window with it. The member asked to see a section; the room moved instead.

⭐ **The same law was already written down in this room, from the other
direction.** `SectionWritingSurface` calls `.focus({ preventScroll: true })`,
founder-witnessed 2026-09-07, under a comment that reads:

> *a writing room that moves under you while you are reading is worse than one
> that makes you press Tab… If showing the selected section ever becomes a
> requirement, it should be a deliberate scroll that says so — not a side effect.*

**Here the reveal IS deliberate. What was accidental was its reach.**

## Repair

`app/writers-studio/canvas/revealWithin.ts` — finds the nearest ancestor that
actually scrolls, by computed style rather than by selector (the canvas has
several scrollers: the room, the outline, the drawers), and moves **that one
element's `scrollTop`**. No ancestor can be moved by an assignment it never
sees.

⭐ **Returns without acting when nothing between the node and the document
scrolls.** With no container to move, the only way to obey would be to scroll
the document — which is the defect. Silence over the wrong motion.

**Four call sites, all in the same room, all the same defect** — the founder
reported two and the other two would have produced the same jump:

```text
WholeManuscriptSurface   jump to a section        'start'
StructuredOutline        reveal the active row    'center'
StructureReview          go to questions          'start', smooth
StudioConversation       follow the last turn     'end'
```

## Falsifiers — `canvasRevealWithin.test.ts`, 7/7

⚠️ **jsdom performs no layout and returns zero for every rect**, so a DOM-level
test of the reveal would assert nothing at all. The arithmetic is split into a
pure `scrollDelta` precisely so it can be checked for real: start · already-at-top
· above-the-fold (negative) · center · end-marker pinned to the bottom ·
taller-than-scroller.

**Plus an API ban** on `scrollIntoView` across the canvas, in the manner of
`check:no-supabase`. ⛔ Comments are stripped before scanning, because a file
that DOCUMENTS the banned call must not read as the banned call returning —
that false positive has been paid for once already in this repository (C21, the
Circles verifier).

## One existing test updated, and why that is not bending a test to fit code

`wholeManuscriptSurface.test.ts` · *"never scrolls to a node that does not exist
yet"* asserted the `if (!node) return;` guard precedes `scrollIntoView`, keyed on
the **name**. The obligation is unchanged and the behaviour is unchanged — the
guard still precedes the scroll. Only the name of the call changed, so the
assertion now names the call actually present.

```text
tests       976/976 green across the Writer's Studio + reading surface
typecheck   no regressions
deploy      NOT DONE
```

⛔ **Unwitnessed in a browser.** The arithmetic and the ban are falsified; that
the jump is gone on the real page is not, and only a render shows it.
