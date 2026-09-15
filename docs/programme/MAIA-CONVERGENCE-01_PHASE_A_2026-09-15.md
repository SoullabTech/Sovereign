# MAIA-CONVERGENCE-01 + RETURN-RELATIONSHIP · PHASE A — READ-ONLY CENSUS

**Canonical** `3909be968`. ⛔ Nothing merged, deleted, changed or deployed.

> **The acceptance question for the whole act:** when Kelly returns to Chapter 10
> tomorrow, does MAIA feel like the same intelligence continuing the same Work —
> or like another assistant starting over?

---

## 0 · THE HEADLINE

⭐⭐ **Return needs no new memory.** Everything a returnable editorial
relationship requires is already durable: Work identity, section identity,
thread identity, chain identity, per-turn timestamps, and a frozen locus. ⛔ What
is missing is **one read and one binding** — there is no query that lists
editorial relationships for a section, and the room's door is written so that a
second relationship can be opened but an existing one can never be found.

⚠️ **And one surface is the opposite of returnable, structurally.** The live
Studio conversation is not bound to the Work, not persisted, and not readable
back. It is the *"mini-MAIA illusion"* that `EditorialConversation`'s own header
says was replaced — still live, one panel away.

---

## 1 · THE SURFACES — five presences, THREE spines

| surface | spine | what enters | what persists | what she is speaking about |
|---|---|---|---|---|
| `StudioConversation` | `POST /api/sovereign/app/maia/list` | client-minted `sessionId` · **client-supplied `userId`** · **client-held `conversationHistory`** · `workContext.workId` | ⛔ **nothing returnable** | the Work, loosely |
| `EditorialConversation` | `/api/writers-studio/editorial/{thread,turn,version,adoption}` | a `threadId` from the URL | ⭐ `ask_threads` · `ask_turns` · `proposal_chains` · `proposal_versions` · `editorial_turn_bindings` | ⭐ **one exact passage** |
| `AskMaia` | `askClient` → `/api/sovereign/manuscripts/[id]/ask` | an `AskAnchor` | ⭐ `ask_threads` (anchor) · `ask_turns` | an anchored thing in the Work |
| `ObservationDialogue` | ⭐ the **same** Ask spine | an observation anchor | ⭐ same tables | one thing MAIA noticed |
| `MaiaColumn` (renders `MaiaReading`) | ⛔ none | the member's declarations | ⛔ none | MAIA's *place* in the room |

⭐ `AskMaia` and `ObservationDialogue` already converged: *"the spine is shared,
the words are not."* Two vocabularies over one store, and the header says why
sharing the copy would *"say true things about the wrong object."*

⚠️ **`AskMaia` is NOT mounted in the Canvas room.** `CanvasClient` mounts
`StudioConversation`, `EditorialConversation`, `MaiaColumn`, `ReadingsEntry`,
`StructureReview`, `SectionWritingSurface`, `WholeManuscriptSurface`,
`StudioLowerBand`. `AskMaia` reaches the Studio only through
`StructureReview` and the Develop room's `ObservationDialogue`.

### ⚠️⚠️ THE LIVE CONVERSATION IS NOT BOUND TO THE WORK

```
grep -ci manuscript  app/api/sovereign/app/maia/list/route.ts   →  0
```

In 1,980 lines, the endpoint the Studio's main MAIA panel talks to **never
mentions a manuscript**. The panel holds its transcript in `useState` and posts
it back up as `conversationHistory`; the conversation id is
`mintStudioConversationId()`, minted in the browser and never stored; `userId` is
**sent by the client**.

⭐ Compare `EditorialConversation`'s own header, in canonical today:

> *"⛔ It replaces the mini-MAIA illusion, which kept its own `Turn[]`, posted to
> `/api/sovereign/app/maia/list` with a client-minted `sessionId` and a
> client-supplied `userId`, and sent its own local history back up as context.
> Every one of those is now a server fact."*

⛔ **Every one of those is still true of `StudioConversation`.** The sentence
described what the editorial panel stopped doing; it did not describe the room.

---

## 2 · CONVERGE TECHNICALLY vs REMAIN DISTINCT SEMANTICALLY

⭐ The ACT 4/5 model is **verified against canonical**, with one correction.

| | verdict |
|---|---|
| conversational MAIA = one continuous presence | ⭐ **CONFIRMED as the target, ⛔ NOT the current state.** Two live conversational spines exist — the canonical-turn route (no Work binding, no persistence) and the Ask/editorial thread store (Work-bound, durable, append-only). |
| `MaiaColumn` = arrival/empty state, not another MAIA | ⭐ **CONFIRMED.** It makes no request of any kind; its own header says *"exactly one of those has substrate on this surface — none."* ⛔ Nothing to converge; it is already honest. |
| developmental reading = same MAIA, frozen to a revision/scope | ⭐ **CONFIRMED and already structural.** Readings reach the room through `reviewClient` / `ReadingsEntry`, and `ReadingsEntry` renders **null** where there is no stored reading rather than offering to make one. |

### ⚠️ THE CORRECTION

The model says *"conversational MAIA = one continuous presence"*, and canonical
holds **two conversational stores with different laws**:

```
ask_threads / ask_turns        append-only, DB-enforced; subject XOR
                               (anchor  XOR  proposal_chain_id);
                               staleness stamped AT THE TURN;
                               provenance recorded per MAIA turn
/api/sovereign/app/maia/list   no thread, no turn table, no Work binding,
                               transcript held by the browser
```

⛔ **They are not two implementations of one thing.** One is a durable relational
record; the other is a stateless turn service. ⭐ Convergence is therefore not a
merge of two components — it is a question about **which store the room's
conversation lives in**, and that is a founder ruling, not a refactor.

### ⭐ THE DUPLICATION THAT IS REAL

```
transcript in React state + posted back as context     StudioConversation
transcript read from the server every time             EditorialConversation
                                                       AskMaia · ObservationDialogue
```

Three of four surfaces already read their conversation from the server. One does
not. ⭐ That is the duplicated implementation, and it is **one-sided** — there is
nothing to unify in the other direction.

---

## 3 · WHAT MAKES AN EDITORIAL RELATIONSHIP RETURNABLE

⭐ **All six identities already exist and are durable.**

| fact | where it lives | durable? |
|---|---|---|
| Work identity | `ask_threads.manuscript_id` (denormalised on purpose) | ✅ |
| section identity | `proposal_chains.target_section_id` | ✅ |
| thread identity | `ask_threads.id` | ✅ |
| chain identity | `ask_threads.proposal_chain_id` → `proposal_chains.id` | ✅ |
| latest activity | `ask_turns.created_at` + `MAX(turn_index)` | ✅ |
| frozen locus | `proposal_chains.expected_text` (⭐ now the projected passage) | ✅ |
| relationship status | ⭐ **derivable, not stored** — versions exist? adopted? legacy locus? | ✅ derived |

⛔ **Nothing is missing from storage.** `ask_threads` is indexed
`(manuscript_id, opened_at DESC)`, `ask_turns` is append-only with per-turn
timestamps, and `proposal_chains` is immutable against UPDATE and DELETE.

### ⭐⭐ THE PRECEDENT IS ALREADY WRITTEN — FOR THE OTHER SUBJECT

`threadStore.threadsOnAnchor` exists, is exposed at
`GET /api/sovereign/manuscripts/[id]/ask`, and its header already states the law
this act is being asked to establish:

> *"MANY THREADS PER ANCHOR ARE LAWFUL — identity is the thread id, and the
> anchor is a grouping key. This exists so a surface can OFFER to resume one
> rather than being structurally unable to make a second, which is presentation
> policy and deliberately not enforced here."*

⛔ **There is no counterpart for editorial threads.** Every editorial read in
canonical takes a `threadId` the caller already has:

```
editorialRuntime/thread.ts       WHERE th.id = $1 AND th.member_id = $2
editorialRuntime/turn·assembly·memberAct·memberVersion·maiaOutcome·adoption
                                 WHERE id = $1 AND member_id = $2
```

⭐ Six reads by identity, **zero by section**. The relationship can be opened and
re-entered from a URL, and never *found*.

### ⚠️ AND THE ROOM'S DOOR CANNOT FIND ONE EITHER

```ts
if (!editorialEnabled || editorialThreadId || editorialOpening) return;
...
await apiFetch('/api/writers-studio/editorial/thread', { method: 'POST', … })
```

⛔ The gesture is **always POST** — always *open a new one*. The guard suppresses
a second open only while a thread id is already in the URL. ⭐ So returning to
Chapter 10 tomorrow, with a fresh URL, opens a **second relationship on the same
passage** and shows nothing of the first. That is lawful by the store's own
design; it is the surface that has no way to say so.

### THE MINIMUM READ

⭐ One query, mirroring `threadsOnAnchor` exactly, keyed on the editorial
subject instead of the anchor:

```
threads for this member and this Work
  whose proposal_chain_id targets THIS draft section
  with  opened_at · MAX(turn_index) · MAX(created_at) · version count
```

⛔ It needs **no new table, no new column, no migration, and no memory
architecture**. Every field is already stored.

---

## 4 · WHERE THE SYSTEM MUST REFUSE TO GUESS

> **The law:** if exactly one relationship is unambiguously resumable it may be
> offered directly; if several legitimate relationships exist, the Studio must
> let Kelly choose.

⭐ **The programme has already ruled this shape twice, and both rulings bind here.**

**RETURN-LOCUS-01:** *continuity may recover what the evidence distinguishes; it
may not turn ambiguity into biography.* Its instrument is the strict-uniqueness
type, which is the exact shape this act needs:

```ts
type SectionActivity =
  | { kind: 'distinct'; sectionId; at }
  | { kind: 'undifferentiated'; at; among }   // ⭐ ties are REAL and named
  | { kind: 'none' };
```

⭐ `count(*) OVER () AS among` in one statement; `among === 1 ? distinct : undifferentiated`.
⛔ Not "most recent wins".

**`threadsOnAnchor`:** *presentation policy, deliberately not enforced here.* ⭐ The
store already refuses to pick for the surface, which means the choosing must
happen where the member is.

### ⛔ THE THREE CONVENIENCES THAT MUST BE REFUSED BY NAME

```
ORDER BY opened_at DESC LIMIT 1     ⛔ "most recent thread" — the RETURN-LOCUS
                                       defect in a new place
the only thread with turns          ⛔ activity is not intent
the only thread with versions       ⛔ nor is authorship
```

⚠️ **And a fourth, subtler one this act introduces:** a relationship whose locus
is `legacy_locus` is **readable and comparable but not adoptable**. ⛔ It must
still be offered for resumption — withholding it would hide a real exchange —
and the surface must not present it as though adoption were merely one click
further away. ⭐ ADOPTION-01 already carries `legacyLocus` on the thread view, so
the fact is available at listing time without a new read.

---

## 5 · DOES RETURN NEED NEW MEMORY? — ⛔ NO

```
new table                    ⛔ none
new column                   ⛔ none
migration                    ⛔ none
memory architecture change   ⛔ none
change to developmental readings ⛔ none
change to adoption           ⛔ none

missing                      ⭐ ONE READ  — threads for a section
                             ⭐ ONE BINDING — the door finds before it opens
```

⭐⭐ **ACT 3's suspicion is confirmed: this is a connection problem, not a memory
capability.** Every durable fact a returnable relationship needs was written
down by the acts that came before; nothing has ever read them back by section.

---

## 6 · ⚠️ WHAT PHASE A WILL NOT DECIDE

1. ⛔ **Which store the room's live conversation belongs in.** The two spines
   have different laws, not different code. Moving `StudioConversation` onto the
   thread store would give the Work a durable conversation — and would also make
   the room's general talk an append-only record with per-turn staleness and
   provenance, which is a semantic commitment, not a refactor. **Founder ruling.**
2. ⛔ **Whether a second relationship on one passage should be openable at all.**
   The store says many are lawful and calls it presentation policy. The surface
   currently opens one every visit *by accident*. ⭐ Those are not the same
   answer, and choosing between them is a ruling about what a relationship means.
3. ⛔ **Whether `AskMaia`'s absence from the Canvas room is intended.** It is
   built, mounted elsewhere, and the room does not use it. Named, not judged.

---

## 7 · STANDING

```
Q1 surfaces                  ✅ five presences · THREE spines · mapped
Q2 converge vs distinct      ✅ model VERIFIED, with one correction:
                                two conversational STORES, not two components
Q3 returnability             ✅ all six identities durable · precedent exists
                                for the other subject · minimum read identified
Q4 refuse to guess           ✅ law already ruled twice · three named
                                conveniences to refuse · one new one

new memory required          ⛔ NONE
implementation               ⛔ NOT OPENED
production                   UNTOUCHED
```

> **The honest answer to the acceptance question, today:** in the editorial
> panel MAIA is already the same intelligence continuing the same Work — the
> conversation is server state and survives close, reopen and navigation. In the
> room beside it she starts over every time the page loads, and tomorrow she
> will not be able to find the exchange she had today.
