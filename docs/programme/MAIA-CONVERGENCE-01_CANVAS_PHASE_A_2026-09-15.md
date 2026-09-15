# MAIA-CONVERGENCE-01 · CANVAS — Phase A census

**Status: READ-ONLY · COMPLETE · ⛔ NOTHING CHANGED · ⛔ IMPLEMENTATION NOT OPENED**

Canonical `905f436e4`. No file was written. Four questions answered, then the
semantic dependencies that the ruling said to hold for.

---

## Q1 — What does `StudioConversation` own today?

`app/writers-studio/canvas/StudioConversation.tsx`, 377 lines.

| | owns it? | note |
|---|---|---|
| rendering (transcript, situated header, empty state) | **yes** | its own message list |
| input / composer | **yes** | textarea, Enter-to-send, no microphone |
| provider / model selection | **no** | posts to `/api/sovereign/app/maia/list`; the server decides everything |
| loading / error states | **yes** | `sending`, `failed`, and three identity phases |
| voice / audio | **ABSENT** | not disabled — there is no capture API in the file, pinned by four tests |
| DEEP / profile behaviour | **no** | the canonical route's, not this surface's |
| client transcript state | **yes** | `useState<Turn[]>`, and it is the whole record |
| conversation-id creation | **yes** | `mintStudioConversationId()` in the **browser** |

Two more it owns that the question did not name, and both matter:

- **Keeps** — `useManuscriptKeeps`, a chooser, and the rule that a chosen Keep
  lands in the **composer** and never in the transcript. *Sending it
  automatically would make the button a disclosure; putting it in the composer
  makes it a quotation the writer is choosing to read aloud.* ⭐ This is a
  consent law wearing a UI, not a convenience.
- **Open in MAIA** — a handoff link carrying `workId`, a return address, and the
  client-minted `conversationId`.

## Q2 — What belongs to presentation and must survive?

- the **rank**: the manuscript is the primary surface and MAIA sits beside it.
  The header explains at length why `OracleConversation` was refused — it is
  `position: fixed` in four places and its pre-conversation state *is* the full
  presence field. ⛔ That ruling is not reopened by this act.
- the **situated header** — *"In relation to {work.title}"*
- the **empty state** — *"She has your Work in view. She has not been given its
  text."*
- the **Keeps gesture**, with the composer rule intact
- **text-only**, and the pinned tests that make adding a microphone a failing
  build. ⭐ *Opening a conversation is an invitation to converse, never
  permission to listen.*
- the three **identity phases**, including failing closed

## Q3 — What belongs to the ephemeral spine and must disappear?

Every item the ruling listed is present, and each is a distinct mechanism:

1. **client-created conversation identity** — `mintStudioConversationId()` runs
   in the browser and returns `writers-studio-${crypto.randomUUID()}`. Nothing
   server-side ever sees it as an identity to keep.
2. **`conversationHistory` replay** — every POST resends the entire local
   transcript as `{role, content}[]`. ⭐⭐ **This is the continuity mechanism.**
   There is no other. Reload empties `turns`, and the next question therefore
   arrives with MAIA having been told nothing happened.
3. **caller-supplied `userId`** — `userId: identity.memberId` in the body.
4. **`sessionId: conversationId`** — a browser-minted value in the authority
   position.

⭐⭐ **THE HONEST STATEMENT OF WHAT IS WRONG, AND IT IS NARROWER THAN "IT
FORGETS":** the pane is not broken and it is not lying. Its own test file
records the design plainly — *"conversation identity is minted, never
discovered"*, and one test asserts it **asks no "most recent conversation"
question anywhere**. The surface was built to be ephemeral on purpose, before a
durable spine existed. The defect is not deceit; it is that **the browser
transcript is the only record**, and a record held in a tab is not a
relationship.

## Q4 — What can be reused without importing another product's UI?

⭐⭐ **THE DECISIVE FINDING: the durable client already exists, and it is not a
product UI — it is a transport and a pure decision function.**

| piece | what it gives | reusable? |
|---|---|---|
| `lib/writersStudio/askClient.ts` | `ask()` · `loadThread()` · `threadsOn()` | ✅ wholesale |
| `lib/writersStudio/observationDialogueResume.ts` | `resumeDecision` → `fresh \| resume \| choose \| unavailable`; `sendMode` → `open \| resume \| blocked` | ✅ wholesale, **pure and already proven** |
| `RelationshipChooser.tsx` (210 lines) | renders exactly those four states | ✅ as a pattern; it is editorial-worded |
| `ObservationDialogue.tsx` (328 lines) | performs the decision against a reading | ✅ as precedent; ⛔ not wholesale — reading-specific |
| `AskMaia.tsx` | anchored composer + staleness prose | ⚠️ **partially** — see below |

`threadsOnAnchor` matches with `t.anchor = $3::jsonb`, exact equality, so
`{"on":"work"}` resolves cleanly. `parseAnyAnchor` already admits `work` on the
**GET** side, because B3 widened the shared `parseAnchor`. ⭐ **Discovery for the
Work anchor works today, unchanged.**

⚠️ **`AskMaia` is not the answer wholesale.** It requires an `about` string
naming what the writer pointed at, and its copy is reading-specific (*"This
points at a different reading than the one open"*). The ordinary conversation
points at nothing. Reuse its **shape** — anchored, says what it cannot do, shows
unknown as unknown — not its body.

---

# ⚠️ THREE SEMANTIC DEPENDENCIES — the ruling said to hold if the read found any

## D1 — ⭐⭐ The panel draws ONE surface, chosen by a flag, so the three modes are mutually exclusive today

`CanvasClient.tsx:994`. `WRITERS_STUDIO_EDITORIAL_ENABLED === '1'` decides which
conversation the room draws:

```
editorialEnabled === true   →  EditorialConversation | RelationshipChooser
editorialEnabled === false  →  StudioConversation
```

⛔ **When editorial is on, ordinary conversation is NOT RENDERED AT ALL.** Not
subordinated, not a tab — absent. The ruling asks for *"three honest modes of one
presence"*; the room currently has one slot and an either/or.

⚠️ `canvasEditorialMount.test.ts` pins this: *"false is the existing room, not a
degraded one"* and *"still mounts StudioConversation when the flag is off."*
Replacing `StudioConversation` therefore **cannot** be a drop-in: the flag's
false branch is a recorded law about what the room is, and converging the modes
changes what that flag means.

**This is a founder question, not an implementation detail.** Does
`WRITERS_STUDIO_EDITORIAL_ENABLED` survive the convergence, and if so, what does
it gate once ordinary conversation is durable and always present?

## D2 — ⭐ `sectionId` is accepted by the server and no client can send it

B3 ruled it precisely — *"it is not part of the anchor: moving from one passage to
another changes this and nothing else"* — and the route reads
`body.sectionId`.

⛔ **`askClient.ask()` has no `sectionId` parameter.** Its body is exactly
`{ threadId, question }` or `{ anchor, question }`.

So the acceptance criterion *"moving Chapter 10 → Chapter 9 changes what MAIA
presently sees, not who the conversation belongs to"* is **provable server-side
and unreachable from any surface.** The client seam needs one optional field.
⛔ Reported, not designed: widening a proven client is a change to the Ask
boundary and belongs to whoever opens implementation.

## D3 — ⚠️ Two discovery orderings now exist, with opposite intent

- `threadsOnAnchor` (Ask spine): `ORDER BY t.opened_at DESC`
- `editorialRelationshipsForSection`: `ORDER BY th.opened_at ASC`, chosen
  deliberately **so no row sits in the "newest" seat**

Both feed choosers that must not pick for the writer. `resumeDecision` is safe
either way — it returns `choose` for N>1 and never ranks. ⛔ So this is **not a
defect and nothing here is authorized to "align" it.** It is named because a
future surface that renders `threads[0]` prominently would inherit a silent
"latest wins" from the Ask ordering that the editorial ordering was written to
prevent.

---

## What Phase A did NOT find

- ⛔ no second conversational runtime — `StudioConversation` posts to the same
  canonical endpoint every MAIA surface posts to
- ⛔ no voice or capture code to remove
- ⛔ no localStorage identity in the Studio (pinned by test)
- ⛔ no reachable path by which this pane writes to the Work

## Standing

```
canonical            905f436e4
files changed        0
Q1–Q4                answered
semantic deps        D1 flag exclusivity · D2 sectionId seam · D3 ordering
implementation       ⛔ NOT OPENED — held, per the ruling
deploy               ⛔
```
