# WS-EXACT-PASSAGE-LOCUS-01 — finding

Read-only. Production `ae27205d9`. No repair authorized, none made.
Live Work `55742458-be2c-406a-a158-d0438cf02892`.

## symptom (founder-visible fact)

Selection at `198 · Chapter 10: The Living Spiral`. One click on
`Work on an exact passage →`. Selection moved to `199 · I. The Living Spiral`;
`Whole manuscript` visible in the centre while the right panel read
`THIS PASSAGE`. Founder: *"it didnt work! It jumped to some other area"*.

## exact causal chain (code-path fact, at `ae27205d9`)

1. `CanvasClient.tsx:1095` — the affordance is
   `onClick={() => setEditorialMode(true)}`. **It carries no locus.** It flips a
   boolean. Nothing about the passage travels with the gesture.
2. The locus is read at render, one line away:
   `sectionId={writing?.activeId ?? null}` (`:1064`, chooser; `:1084`, ordinary).
3. `writing.activeId` is set only by `writing.goToSection`. In Whole view
   `outlineSelect` (`:1360-1369`) returns `setJumpTo` — a scroll request — and
   **explicitly does not call `goToSection`** ("navigation is not observation").
   So clicking `198` in the rail never set the locus. It scrolled.
4. The gold rail row in Whole view is `placeForMode('whole', …)` →
   `session.wholePlaceId` (`manuscriptViewPlace.ts:41`), i.e. **where scrolling
   was observed to settle**, which is `199` — the first heading under the
   chapter title at 198.

So three different quantities were in play, and only one was on screen:

| quantity | value | visible? |
|---|---|---|
| what the rail highlighted | `199` (scroll observation) | yes, as gold |
| what the member believed they selected | `198` | no |
| what editorial actually used | `writing.activeId` — the section last *opened in Section view*, possibly `null` | never |

## whether 198→199 was intended by any existing law

**Partly, and that is the defect.** Scroll-observed place in Whole view is
deliberate, documented and tested (`manuscriptViewPlace.test.ts`). What no law
authorizes is the third quantity: editorial entry binding to `activeId` while
the member is in a view where `activeId` is, by that same design, stale. The
move from 198 to 199 was not caused by the click at all — it is the scroll
observer settling, coincident in time. **The click's own defect is worse than
the movement: it bound to a passage that was never on screen in either state.**

## `Whole manuscript` / `THIS PASSAGE` — same defect or separate

**Same root, plus one independent finding.**

Root: the room was in Whole view; that is precisely why the locus was stale.

Independent: `Section` and `Whole manuscript` are **two toggle buttons, both
always rendered** (`:1420-1437`). Which is active is signalled only by
`underline` and `opacity: 0.45`. The interface never *claimed* whole scope
beside `THIS PASSAGE` — but it also never plainly said which view was in force.
A mode whose state is carried by 55% opacity is a mode the writer cannot read.

## persisted production state

**Nothing was created.** `RelationshipChooser` on mount performs one **GET** —
`/api/writers-studio/editorial/relationships?sectionId=…` (`:105-108`) — and
returns immediately if `sectionId` is null. The only write path,
`openEditorialConversation()` (POST `/editorial/thread`), fires solely from
`onStartNew`, an explicit click that was not made. The comment at `:452` states
the law: a re-render is not a member gesture.

Code-path confidence: high. Database confirmation is owed and is one query
(below); it is confirmation, not the basis of this claim.

## smallest repair boundary

Three candidates, smallest first. **Not authorized; stated for ruling.**

1. **One expression.** Editorial entry takes `outlinePlace(session, writing)`
   instead of `writing.activeId`. The passage it works on becomes the passage
   the rail is showing in gold, in both views. What you see is what you get.
2. Or: the affordance does not appear in Whole view, and says why.
3. The chooser names the passage — *"Chapter 10 · I. The Living Spiral"* —
   before offering to start anything.

(1) + (3) is the whole fix. (1) removes the third invisible quantity; (3) makes
the remaining one legible before any commitment.

## regression witness that would have killed this

None exists. `canvasEditorialMount.test.ts` asserts the panel renders
`This passage`, with the room in Section view. The missing mutant: **enter
editorial with `view === 'whole'` and `writing.activeId` different from
`wholePlaceId`** — a conforming room binds to the observed place or refuses;
the current room binds silently to neither of the two sections on screen.

## recommendation

**Repair.** Boundary (1) + (3). Founder ruling required.

## evidence classes, kept separate

- founder-visible: the symptom block, verbatim.
- code-path: everything cited by file and line at `ae27205d9`.
- runtime/database: **not yet read** — the persistence claim is code-path.
- inference: that the scroll settled on 199 because 199 sits immediately under
  198's chapter title. Consistent with the 24-row Chapter 10 scope; not witnessed.
