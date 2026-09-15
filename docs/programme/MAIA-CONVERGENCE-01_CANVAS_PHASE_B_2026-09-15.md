# MAIA-CONVERGENCE-01 · CANVAS — Phase B

**Status: BUILT · WITNESSED 43/0 · ⛔ NOT MERGED · ⛔ NOT DEPLOYED**

Canonical `905f436e4`. Branch `claude/maia-convergence-01-canvas`.

---

## 1. The law this act holds

> **No ordinary Canvas conversation may be durable solely because the browser
> replayed it.**

And its two supporting rulings, both superseding laws that were correct for the
architecture they governed:

> Turning editorial off removes the editorial **mode**; it does not remove or
> degrade MAIA's ordinary relationship to the Work.

> The Work anchor is **who the conversation belongs to**. `sectionId` is **where
> she presently is**. No thread is privileged by array position.

## 2. What was built

| file | |
|---|---|
| `lib/writersStudio/askClient.ts` | **D2** — one optional `sectionId`, sent as a **sibling** of `anchor`/`threadId` |
| `app/writers-studio/canvas/WorkConversation.tsx` | NEW — `StudioConversation`'s presentation on B3's spine |
| `app/writers-studio/canvas/StudioConversation.tsx` | **DELETED** |
| `app/writers-studio/canvasIdentity.ts` | `canvasWithoutEditorialThread` — the address can un-name a relationship |
| `app/writers-studio/canvas/CanvasClient.tsx` | ordinary conversation always mounted; editorial an additional mode |
| `app/writers-studio/__tests__/workConversation.test.ts` | NEW — 35 obligations; supersedes `studioConversation.test.ts`, deleted |
| `app/writers-studio/__tests__/canvasEditorialMount.test.ts` | the exclusivity law superseded in place |
| `scripts/witness/maia-convergence-witness.ts` | NEW — A–I in a real browser |

### The four retired mechanisms

```
⛔ mintStudioConversationId()      identity minted in a tab ends with the tab
⛔ conversationHistory: [...]      ⭐ THIS WAS THE CONTINUITY MECHANISM, and there
                                   was no other — reload emptied the array
⛔ userId: identity.memberId       the member comes from the request
⛔ sessionId: conversationId       a browser-minted value in the identity seat
```

⭐ **The predecessor was not lying.** Its own suite said so plainly —
*"conversation identity is minted, never discovered"* — and that was the honest
design for a room with no durable spine. It has one now.

### ⚠️ One judgment call, stated rather than buried

`StudioConversation.tsx` was **deleted**, not left unmounted. The ruling
authorized *replacing* it; a dead 377-line component still containing a live
POST with `conversationHistory` and `userId` is the shortcut someone reaches for
later. ⚠️ `mintStudioConversationId()` in `workContext.ts` now has **no caller**
and was **left in place** — removing an export other lanes may hold is wider
than this act. ⛔ Its disposition is owed, not taken.

## 3. Mode, not alternate MAIA

```
editorialEnabled && (editorialThreadId !== null || editorialMode)
  →  ← Conversation about this Work      (the room owns the way back)
     EditorialConversation | RelationshipChooser
else
  →  WorkConversation                     ⭐ ALWAYS, under BOTH flag settings
     Work on an exact passage →           only when editorialEnabled
```

⚠️ **This is a visible mode distinction, and it is here because the alternative
is worse rather than because the back end has three relational kinds.** Two
conversations stacked in one column is two composers, and a writer typing into
the wrong one addresses a relationship they did not choose. ⛔ It is not a tab
bar: one gesture in, one gesture back, no taxonomy named at the writer.
Developmental readings keep their own affordance and were not touched.

## 4. Witnesses — real browser, disposable cluster, provider replaced at the wire

```
  43 passed · 0 failed
```

| | |
|---|---|
| **A** durable ordinary conversation | after a **full browser reload** the author's words and MAIA's answer are both still there, and **no second thread was authored by arriving** |
| **B** no client replay | every captured POST inspected: no `conversationHistory`, no `userId`, no `sessionId` — and requests were actually observed, so the absence is not vacuous |
| **C** Work identity / section context | Chapter 10 → Chapter 9: **same thread id**, continued by id, `sectionId` present **beside** the anchor and never inside it, turns grew |
| **D** plurality | two lawful threads → the room asks; **neither adopted on arrival**, no ranking word reaches the writer, composer `blocked:choosing`, and the one she picks is the one that opens |
| **E** editorial flag | flag **absent** → ordinary MAIA present, editorial not offered · flag **on** → ordinary MAIA **still present**, editorial offered |
| **F** Keeps | the kept passage lands in the **composer**; `ask_turns` count **unchanged**; not on screen as a turn |
| **G** editorial return | entering opened **no** relationship, the way back is offered, leaving returns to the ordinary conversation intact, the whole visit authored nothing |
| **H** developmental reading | no proposal-anchored thread and no `proposal_chains` row created by any of it |
| **I** authority removal | a forged `sessionId`/`conversationId`/`userId`/`conversationHistory` **named no conversation** — a new thread was opened, the member is the session's, and the replayed history authored no turn |

## 5. ⚠️ Three instrument failures, recorded rather than only their repairs

**(1) ⭐⭐ A GUARD THAT WAS NOT LETHAL, AND A MUTANT PROVED IT.** `M3` restored
the old either/or — `{!editorialEnabled && <WorkConversation …}` — and the
"mounts under both settings" obligation **survived it in both suites**. The
assertion sliced from `<WorkConversation` and read only the element's **own
props**; the mutant's condition sits in front of the element, outside the slice.
⛔ *An element is not unconditional because its attributes are: the condition
lives in front of it.* The **guard** was repaired, never the candidate, and M3
now dies in both suites.

**(2) ⚠️⚠️ AN ABSENCE CHECK THAT PASSED FOR THE WRONG REASON.** In the first
witness run `E1` failed (*the composer is present*) while `E2` **passed** (*the
editorial mode is not offered*) — because nothing had rendered at all. E1 was a
timing fault; E2 was worse, an absence satisfied by emptiness. E2 is now gated on
the composer being present, so it can only be read off a room that is drawn.

**(3) ⚠️ THE C21 FAMILY, AGAIN.** A first draft of the no-privileging obligation
banned the bare words `primary`, `latest`, `current` — and failed on
`color: INK.primary`, a **theme token**. It was scanning for spellings rather
than behaviour. It now asserts two precise things: no privileging **attribute**,
and no ranking word in anything the **writer reads**.

Two fixture faults are also recorded: the round-trip trigger flattens with
`string_agg(text, '')` and refused a fixture whose paragraph break lived in
`content` — the content is now **derived**, never typed; and the driving path
used the wrong cookie name and waited on the rail rather than on the passage,
which the editorial witness had already paid for once.

## 6. Mutants

| | mutant | outcome |
|---|---|---|
| M1 | discovery effect depends on `sectionId` — locus becomes identity by the back door | ⭐ killed |
| M2 | `adopt(threads[0])` on plurality — a silent latest-wins | ⭐ killed |
| M3 | mount only when editorial is off — the old either/or | ⚠️ **survived**, guard repaired, now killed |
| M4 | replay the transcript on every question | ⭐ killed |

Sources verified **byte-identical** to pre-mutation after every restore.

## 7. Gates — scope named, per the pin

```
scope        npm run typecheck  ·  tsconfig.ship.json
result       ✅ No TypeScript regressions

scope        npx jest  (no path filter — repository-wide)
                        canonical 905f436e4      this branch
  failed suites               42                     42
  failed tests                94                     94
  passed suites              397                    397
  passed tests              7107                   7143

NEW RED vs canonical  : (empty)
NO LONGER RED         : (empty)
```

The 42 standing RED suites are unchanged and are not this act's.

## 8. Standing

```
canonical base   905f436e4
witnesses        43 passed · 0 failed   (browser, disposable cluster)
mutants          4 / 4 lethal (M3 after guard repair)
suites           72 passed in the two amended/new files
merge            ⛔ NOT AUTHORIZED
deploy           ⛔
owed             disposition of the now-callerless mintStudioConversationId()
```
