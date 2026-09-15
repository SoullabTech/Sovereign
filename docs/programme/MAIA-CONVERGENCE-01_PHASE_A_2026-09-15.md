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

---
---

# PHASE B · SEAM 1 — `RETURN-RELATIONSHIP`

**Branch** `claude/maia-convergence-01` · **base** canonical `3909be968`.
⛔ No merge · ⛔ no deploy · ⛔ no migration · ⛔ no new table or column.

## B0 · RESULT

```
return-relationship witness    30 passed · 0 failed   real Chromium, real PostgreSQL
editorial surface witness      93 passed · 0 failed   re-pointed and repaired
room source suite              35 passed · 0 failed
ship typecheck                 229 vs baseline 239 · 0 regressions
WS + manuscript suites         4 failed / 16 tests — IDENTICAL to canonical
check:no-supabase              clean

⛔ SEAM 2 · MAIA-CONVERGENCE       STOPPED — see §B5
```

## B1 · WHAT WAS BUILT — ONE READ, ONE BINDING

```
lib/manuscript/editorialRuntime/relationships.ts   threads for a SECTION
app/api/writers-studio/editorial/relationships     GET ?sectionId=
app/writers-studio/canvas/RelationshipChooser.tsx  the four states, rendered
CanvasClient                                       one adopter, and a summon
                                                   that no longer mints
```

⛔ **No new table, column or migration.** Every field was already stored.

⭐⭐ **The choosing law is NOT reimplemented.** `observationDialogueResume`
already holds it — `resumeDecision`, pure and proven, written for the
observation subject — including the state that refuses to round *could not find
out* to *there are none*. This act supplies the **subject**; that module supplies
the **decision**. The chooser passes a projection (`id · openedAt · turnCount`)
and keeps the full records for the writer to recognise, so ⛔ the proven law is
consumed unchanged rather than re-typed.

## B2 · ⭐⭐ WHAT THE WITNESS CAUGHT — THE ACCIDENTAL OPEN WAS IN THE RAIL

The first runs showed the room going straight into a conversation. The panel's
chooser was never reached, because the Conversations gesture itself called
`openEditorialConversation()`:

```
if (d.id === 'conversations') {
  summon('conversation');
  summon('maia');
  void openEditorialConversation();   ⛔ every summon minted a relationship
}
```

⭐ **That is exactly the founder's *"accidentally opening another one because
Return has no read"*, and it was one line above the surface I had changed.**
Asking for the panel is not asking for a new relationship. The call is gone; the
room LOOKS first, and starting one is an explicit button the chooser offers by
name.

⚠️ **And the `editorialThreadId` guard came out with it.** It existed *because*
the room could not find a relationship, so suppressing a second open was the only
protection against duplicating one. ⛔ Keeping it would now forbid the plurality
the substrate has always permitted. Discovery replaced suppression.

## B3 · THE WITNESS — 30/0, and "tomorrow" is a browser that knows nothing

⛔ Not a reopened panel, ⛔ not a back button, ⛔ not a remount — a **fresh page**
at the room's own URL with no `editorialThread` parameter.

```
R1 · NOTHING YET            discovery found nothing · ⛔ arriving created NOTHING
                            · the room offers to start, by name

R2 · LEAVE → RETURN         ⭐⭐ returning FINDS the relationship that was there
                            · ⛔ arriving created nothing · it OFFERS, and does
                            not continue by itself · ⭐ she recognises it by the
                            PASSAGE · ⛔ no identifier is shown to her
                            · continuing resumes the SAME one

R3 · A SECOND, EXPLICITLY   named as separate · ⭐ plurality is lawful

R4 · PLURALITY              ⭐⭐ both shown, neither chosen · ⛔ no row marked,
                            preferred or defaulted · each recognisable by its
                            frozen passage · she chose the second and got it

R5 · DISCOVERY FAILS        ⛔⛔ reported as unknown, NEVER as "none"
                            · ⛔ the room does NOT offer to start
                            · ⭐ so nothing was written

R6 · SCOPED                 the other passage has none · ⛔ the server marks no
                            winner · ⭐ order is ASCENDING, so no row sits in the
                            "newest" seat
```

⭐ **R5 is induced by a real transport failure** — the route is intercepted and
made to return 500 — ⛔ not by stubbing the decision.

## B4 · INSTRUMENTS — amended, repaired, and re-run

⭐ **Three assertions amended**, each right for the law that existed, each
narrowed in place with its supersession written beside it:

```
the summon opens the PANEL, never a relationship   (retired coupling asserted GONE)
one place puts a relationship in the room AND in the address
⛔ the chooser discovers from an effect, and can open nothing from one   ⭐ NEW
```

⚠️⚠️ **AND A REAL FINDING IN AN OLDER INSTRUMENT.** `ui-editorial-surface-witness`
would not run: its fixture recorded Source heading `'One'` while the stored draft
slice carried **no `One\n\n` prefix** — a shape `splitStoredSection` cannot
project, which the aligned door correctly refuses as `section_unprojectable`.

⭐ **The fixture was invalid all along and only worked because the old producer
ignored the heading.** `EDITORIAL-LOCUS-ALIGNMENT-01` exposed it. The heading was
dropped rather than the prefix invented — with no heading, stored and projected
coincide exactly as they always did there, so ⛔ the witness's subject is
unchanged.

⚠️ Its `K11`/`K12` carried the **same retired UI-03 law** the jest suite had
already had amended — a second instrument holding the same sentence. Amended the
same way, keeping every surviving clause (the retired vocabulary stays closed;
comparison still writes nothing — `K7…K10` untouched and still passing).

⚠️ And one amendment of mine was wrong before it was right: `K11` scanned
rendered text case-sensitively, which tests the stylesheet rather than the
surface. Recorded, because the retired `K12` had called `.toUpperCase()` for
exactly that reason and I did not read it closely enough.

```
89 / 2   after re-pointing          (K11 · K12, the retired law)
92 / 1   after amending them        (K11, case-sensitivity — my error)
93 / 0   ⭐ green
```

## B5 · ⛔⛔ SEAM 2 IS STOPPED — A BOUNDARY THAT WAS CLOSED ON PURPOSE

The ruling authorizes replacing the room's ephemeral conversation with *"the
existing durable anchored conversation substrate"*. ⭐ The substrate is right:
`AskAnchor` already declares `{ on: 'work' }` and `{ on: 'section', sectionId }`,
neither is proposal-dependent, and **no schema change would be needed**.

⛔ **But the Ask POST boundary refuses both, deliberately:**

```ts
const SUPPORTED_ANCHORS = ['question', 'uncertainty', 'division'] as const;
```

and, in that file's own words:

> *"WHY `work` AND `proposal` CAME OUT. A `work` anchor loads no proposal, so a
> raw POST could open and PERSIST a thread and only then return `no_reading` — an
> author-originated Work thread entering through HTTP before the slice that
> defines what such a thread is. The type may know the future union; the boundary
> must not. `section` and `concern` were never parseable for the same reason.*
>
> *A shape the boundary accepts before its surface exists is a shape nobody has
> proved, and the row it writes is evidence of a conversation nobody designed."*

⭐⭐ **This is not an oversight to route around; it is a recorded decision with a
reason, and the reason names an ordering defect** — persist first, refuse after.

⛔ **NOT OPENED HERE.** Widening a boundary a prior act closed for a stated
reason is the move this programme refused when `askRuntimeCannotWrite` blocked
the S3 claimant: the answer then was to move the code to its honest home, ⛔ never
to add an allowlist entry so a change could pass.

⭐ **And the question is genuinely narrow now**, because Phase B *is* the slice
that defines what an author-originated Work thread is:

```
1  may the Ask POST boundary admit { on: 'work' }?
2  is the room's ordinary conversation anchored to the WORK, or to the ACTIVE
   PASSAGE? — those are different relationships, and the acceptance test
   ("MAIA's ordinary conversation is still there") reads as the Work
3  a Work-anchored turn acquires per-turn STALENESS and PROVENANCE, because that
   is what `ask_turns` stores. ⭐ That is a semantic commitment, not a refactor
4  the ordering defect the comment names: does the POST still persist before it
   can refuse a readingless anchor?
```

⛔ Nothing about the room's conversation was changed. `StudioConversation` is
byte-for-byte as it was.

## B6 · STANDING

```
RETURN-RELATIONSHIP            ✅ BUILT · 30/0 · no new memory
prior editorial witness        ✅ RE-POINTED · fixture repaired · 93/0
room source suite              ✅ 35/35 · three assertions amended, one NEW
gates                          ✅ 0 regressions · suites identical to canonical

MAIA-CONVERGENCE (seam 2)      ⛔ STOPPED · boundary ruling owed
StudioConversation             ⛔ UNCHANGED
developmental readings         ⛔ UNCHANGED
adoption                       ⛔ UNCHANGED
schema                         ⛔ UNCHANGED

merge                          ⛔ NOT AUTHORIZED
production                     UNTOUCHED
```

> **The acceptance question, honestly, after seam 1:** Kelly returns to Chapter
> 10 tomorrow. The Studio remembers the chapter. **If she had an editorial
> relationship, the Studio now finds it — offers the one, or shows her both and
> lets her choose — and starting another is something she does, not something
> that happens to her.** Her ordinary conversation with MAIA still starts over,
> and closing that is seam 2.
