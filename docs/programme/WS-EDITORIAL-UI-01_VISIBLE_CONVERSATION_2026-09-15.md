# WS-EDITORIAL-UI-01 · THE VISIBLE EDITORIAL CONVERSATION

**Branch** `claude/ws-editorial-ui-01` · **base** `a2ed3c67d09b4a7c4d7e152bd43c286c2636470a`
(`WS-EDITORIAL-RUNTIME-01`, CLOSED).

**Status: DATA PATH WITNESSED 23/0 OVER REAL HTTP · VISUAL RENDERING UNWITNESSED ·
NOT MOUNTED · MERGE NOT AUTHORIZED · PRODUCTION UNTOUCHED.**

---

## 1 · What was authorized, and what this cut delivers

The founder's requirement: the Writer's Studio conversation surface must render the
**durable editorial thread**, not a local `Turn[]`; send member discourse and
direction through `/api/writers-studio/editorial/turn`; show You / MAIA from
`ask_turns`; distinguish an ordinary reply from a Direction or a ProposalVersion;
preserve visible authorship; survive close/reopen because the conversation is
**server state, not component state**; keep voice absent; keep Adopt closed.

And on the seam: *"Add only the minimum server read/open seam the visible surface
requires, derived from the already-ruled `ask_threads ↔ proposal_chain`
relationship. No new ontology, no new conversation store, no generic chat
history."*

Delivered:

| | Artifact |
|---|---|
| open + read seam | `lib/manuscript/editorialRuntime/thread.ts` |
| HTTP seam | `app/api/writers-studio/editorial/thread/route.ts` (POST open · GET read) |
| surface | `app/writers-studio/canvas/EditorialConversation.tsx` |
| witness | `scripts/witness/ui-01-visible-conversation-witness.ts` — **23 passed · 0 failed** |

⛔ **No new ontology was introduced.** `openEditorialRelationship` writes one
`proposal_chains` row and one `ask_threads` row inside a single transaction, using
the subject shape `W4-SCHEMA` already landed (`num_nonnulls(anchor,
proposal_chain_id) = 1`). `readEditorialThread` is **one** LEFT-JOINed read through
`editorial_turn_bindings`. There is no conversation table, no message table, and
no history store.

---

## 2 · Why a dedicated constructor, and what was refused

`openThread()` takes an `AskAnchor`. It is **structurally incapable** of expressing
an editorial thread: the landed CHECK admits an anchor **or** a chain, never both
and never neither, so an anchored constructor cannot produce a chain-subject row.

⛔ **REFUSED: widening `openThread()` with an optional `proposalChainId`.** The
anchored path could then pass a chain, and the one place the schema makes the two
subjects exclusive would acquire a caller that can straddle them. The exclusivity
is the ruling; a parameter that can defeat it is a second answer to a settled
question. A separate constructor keeps each path able to express exactly one
subject.

`canonical_at_open` is recorded as `draft:<draftId>@<revisionCount>` — the state
the relationship was opened against, frozen at open, never recomputed.

---

## 3 · The surface holds no transcript

`EditorialConversation.tsx` has no `Turn[]`, no `sessionId`, no `userId`, and no
client-side history. Everything it draws comes from `GET …/thread`. That is the
whole mechanism by which close/reopen and navigation are survivable: **there is no
component memory to lose.**

Three properties the component enforces at its own boundary:

1. ⭐⭐ **The act is DECLARED.** An explicit "Say this as a Direction" checkbox sets
   `act: 'direction'`. ⛔ Nothing classifies the member's wording. This is the
   runtime's governing law expressed at the surface rather than re-litigated there.
2. ⭐⭐ **The adjunct is shown because a BINDING names it** — never because the text
   reads like one. `direction` renders "— said as a Direction"; `version` renders in
   its own inset labelled **"MAIA's wording — offered, not applied."**
3. ⭐ **A MAIA-side failure still reloads.** The member's turn persisted even when
   cognition did not complete, and the surface shows that rather than pretending the
   exchange never happened: *"Your words are saved. MAIA could not answer this time."*

⛔ Absent by construction: microphone, Adopt, comparison, member VersionComposer.

---

## 4 · The witness — 23 passed · 0 failed

`scripts/witness/ui-01-visible-conversation-witness.ts` boots a real Next server
against a disposable cluster and executes the founder's human sequence over real
HTTP with a real `x-session-token`:

> open → speak → MAIA answers → speak again, explicitly as a Direction → MAIA
> returns candidate wording → **close** → **reopen**.

⭐⭐ **Close/reopen is modelled by DISCARDING EVERY CLIENT-HELD VALUE and re-reading
from the server.** The witness keeps only the thread id. It therefore passes only if
the server remembers — a client that cached the transcript would pass a weaker test
and fail this one.

Boundary obligations:

- **B1** — another member reading the same `threadId` gets **404**, not a redacted body.
- **B2** — unauthenticated gets **401**.
- **B3** (SOURCE-LEVEL) — no generic conversation store was added.

---

## 5 · ⚠️ WHAT IS NOT WITNESSED — stated plainly

⛔ **THE VISUAL RENDERING IS UNWITNESSED.** There is no browser in this container.
What is proven is the **data path**: the seam opens, persists, binds and reads back
correctly over real HTTP. That the component *draws* those facts correctly — that
"You" and "MAIA" appear where they should, that the offered-wording inset is
visually distinguishable from the member's prose, that the checkbox reads as a
declaration — is **asserted by construction and confirmed by nothing.**

Typecheck is not rendering. A component can typecheck, hold the right props, and
still present the writer with something wrong.

⚠️ **Two instrument defects of my own, recorded rather than smoothed:**

1. The component was first written against `<StudioText variant="…">`. The real prop
   is `role: TypeRoleName`, and `label` is not a role (`panelLabel` is). It also used
   `RADIUS.md`, which does not exist, and `MAIA_ACCENT` as a colour when it is an
   object. **Four token errors in one file, all caught by the compiler and none by
   me** — the ordinary reason a design system is worth having.
2. My patch script asserted on its *anchors* but one of its outcome assertions —
   `assert 'MAIA_ACCENT,' not in s.replace('MAIA_ACCENT, RADIUS','')` — was
   **vacuous**, and a bare `MAIA_ACCENT` survived it at the ternary on line 154.
   A grep found it; the assert did not. *This is the same class as the earlier
   `.replace()` that silently no-op'd: an assertion on the edit, not on the result.*

---

## 6 · ⛔ NOT MOUNTED — and the one question that blocks it

`app/writers-studio/canvas/page.tsx:911` still renders `StudioConversation`.
Mounting `EditorialConversation` there is mechanically a one-line swap: the page
already holds `writing` state (line 256), so `writing.activeId` supplies the
`sectionId` the surface needs, and nothing else is missing.

⛔ **It was not swapped, because doing so requires answering a question that has not
been ruled.**

`WRITERS_STUDIO_EDITORIAL_ENABLED` is a **server** variable and is **off by
default**. The canvas surface is a client component and cannot read it. So an
unconditional mount would replace the working conversation panel with a surface
whose seam returns **404** everywhere the flag is not set — including production.

The three available answers are all governed decisions, and none is mine to take:

- **(a)** a `NEXT_PUBLIC_` mirror — ⛔ a second, independently-settable source of
  truth for one flag, and the two can disagree;
- **(b)** the surface treating a **404** as "feature disabled" — ⛔ a client
  inferring policy from a status code, which is the same family as inferring an act
  from prose;
- **(c)** the page asking the server for its own enablement — a new seam, small but
  real, and an ontology question about who holds that fact.

**Reported, not designed around.** The surface and its seam are built and witnessed;
the mount awaits a ruling on (a)/(b)/(c).

⛔ Legacy retirement is separately held: `StudioConversation.tsx` and its route are
untouched.

---

## 7 · Standing

**WS-EDITORIAL-UI-01 · DATA PATH WITNESSED 23/0 · VISUAL RENDERING UNWITNESSED ·
NOT MOUNTED (enablement-visibility ruling owed) · LEGACY UNTOUCHED · ADOPT CLOSED ·
VOICE ABSENT · MERGE NOT AUTHORIZED · PRODUCTION UNTOUCHED.**

Held for a later act: member VersionComposer · comparison · Adopt · legacy
retirement · canonical merge and production.
