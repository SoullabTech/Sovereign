# WS-DECISION-CONTINUITY — passage desk browser walk (2026-11-08)

Candidate: `feature/ws-work-continuity-part-a-suite` @ `abb8a9d45`. Local next dev server (worktree) on a disposable loopback Postgres 16, a loopback stand-in for the model API
(it returns one scripted editing proposal; nothing leaves the machine), one fictional writer and manuscript. Evidence class: BROWSER, scripted model. Not a founder walk. Production untouched.

## Walked, in the real UI
| Step | Result |
|---|---|
| Write room → select the passage → "Talk with MAIA" → "Show me an edit" → "Start with MAIA" | works once the editorial flag is on (`WRITERS_STUDIO_EDITORIAL_ENABLED=1`; without it the relationships route answers 404 and the panel says it could not verify a relationship) |
| The proposal | rendered as "One change to your words" (woke → stirred) with **Use it · Change it · Talk about it**; the quote gate did not interfere with an honest reply |
| A decision recorded as the Work box records it ("I am keeping my opening verb."), then a new passage-desk question | the stand-in model's request carried `WHAT THE WRITER HAS SETTLED … I am keeping my opening verb.` with the "discuss it freely / not a fact about the text" framing. Before the decision the same turn carried none |

## DEFECT / GAP FOUND — the "Keep mine" prompt is not reachable from this live surface
The live proposal card has **no "Keep mine"** (its choices are Use it, Change it, Talk about it, and four adjustments such as "Keep more of mine", which is a request, not a decline).
The `onKeep` handler I wired the writer-confirmed prompt to belongs to a *workspace* layout (`EditorialDancePanel` with the original-passage header), which this Write-room desk does not show
(`showOriginal={false}` here). So today there is **no decline gesture at all** on the live card: leaving it unapplied is silent.
Not established: whether any member reaches the workspace layout in production.

## Not established
The full path (Keep mine → prompt → Note it → MAIA honours it) was NOT walked, because step one does not exist on this surface. Component behaviour is covered by tests (not a browser).
Shadow-schema note: re-applying `20261002000001` fails once rows with the newer boundary exist (it restates a four-value CHECK); the migration runner applies each file once in date order and `20261108000001` is later, so this is a re-run hazard, not a defect in order. Recorded, not repaired.

---
## UPDATE — "Keep mine" added to the live proposal card (founder: "Yes, add it") and the FULL PATH WALKED
Change: `EditorialDancePanel` now offers **Keep mine** beside Use it · Change it · Talk about it (`data-stage-keep`; it calls only `onKeep`, never apply/send/save; absent once the option is used).
The pinned button list in `conversationStage.test.ts` was updated by this act; two new tests hold the button to "says no, mutates nothing".
Walk (real UI, local server, disposable DB, scripted model): proposal → **Keep mine** → the note prompt appeared → I rewrote the sentence in my own words → **Note it** →
DB: `passage_desk | wording | I am keeping my opening line exactly as I wrote it.` (exactly the edited text; the click alone recorded nothing) → Develop room shows
**"What you have settled (2)"** → an Ask in the Work conversation carried both decisions to the model request under "WHAT THE WRITER HAS SETTLED".
DEFECT FOUND AND FIXED BY THE WALK: the prompt first rendered inside the Write room's clipped frame (`fr-capture-frame`) — present in the DOM, invisible. It now renders through a portal to the page.
Remaining observations (not fixed): the note box's textarea is unstyled (white); in the Develop panel the settled list sits behind a cramped scroll area; a second identical scripted proposal produced
"MAIA couldn't answer that just now" (probably the no-op-adjustment law refusing a repeated identical proposal — NOT verified); version-binding is still unset.
