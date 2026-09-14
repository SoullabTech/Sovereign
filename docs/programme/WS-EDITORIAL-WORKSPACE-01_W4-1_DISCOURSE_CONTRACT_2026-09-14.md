# W4-1 — CANONICAL EDITORIAL DISCOURSE CONTRACT

**Programme** `WS-EDITORIAL-WORKSPACE-01`
**Date** 2026-09-14
**Authorized by** founder act, 2026-09-14
**Base** `9827a7e0f` (W4-0) → `575810287` (W5-4)
**Branch** `claude/w4-1-editorial-discourse-contract`
**Sealed by** `W4-1.1 · CONTRACT SEAL` and `W4-1.2 · RELATIONAL SEAL`,
founder acts 2026-09-14
**Class** contract · record · falsifiers. ⛔ No schema, no producer registry
edit, no `getMaiaResponse` change, no `openThread()` change, no route, no Canvas.

> **The governing sentence.** The conversation record is one thing; the
> canonical cognition that reads it is another. MAIA may author a reply, a
> Direction, or candidate wording only through explicit acts whose provenance
> survives all the way to persistence. The system may carry those acts. It may
> not manufacture them.

---

⚠️ **Sections 1–4 record W4-1 AS FIRST WRITTEN (`7a3e394b3`).** Four of their
claims were superseded by the seal below and are kept rather than edited — *a
record is a reading at a time; the honest repair is to date it.* Superseded:
`admitEditorialOutcome` (split into envelope + input), the "no text parameter"
law (withdrawn by the founder as too strong), the flat `EditorialRecord`, and
`editorialPosture(boolean)`. Tallies of `40/0` and `12 killed` are the pre-seal
run; the W4-1.1 run was `54/0 · 16 killed`; the current run is
**62/0 · 20 killed**.

## 1. What landed

`lib/manuscript/editorialDiscourse/contract.ts` — types and **pure laws**. No
database, no HTTP, no registry write, no service call. Every law is total and
side-effect free, so every obligation is falsifiable without a server, a
browser, or a model.

| ruling | encoded as |
|---|---|
| **A3** | `EditorialThreadSubject` (discriminated: `anchored` has no chain field, `editorial` has no anchor field) · `threadSubject()` enforcing the XOR at the read |
| **C1** | `EDITORIAL_PRODUCERS` (four, declared) · `producerForRecord()` · `editorialCandidates()` partitioning by authorship, kinds still labelled |
| **D** | `EDITORIAL_HISTORY_AUTHORITY = 'ask_turns'` · `FORBIDDEN_FOR_EDITORIAL_TURNS` · `editorialHistory()` · `editorialTurnIdentity()` |
| **F** | `MEMBER_ACT_KINDS` (closed) · `MemberEditorialAct` · `memberActPlan()` → atomic `[turn, direction, binding]` |
| **G** | `EDITORIAL_TOOL_NAME` · `editorialToolSchema` · `admitEditorialOutcome()` · `EditorialInvocation` · `maiaOutcomePlan()` · `onVersionRefusal()` |
| lifecycle | `withdrawalEffect()` · `EDITORIAL_BINDING_IS_ITS_OWN_OBJECT` |
| sanctuary | `editorialPosture()` |

### Three absences that are load-bearing

- **The producers are DECLARED, not REGISTERED.** `PRODUCER_REGISTRY` is
  untouched, and a falsifier asserts each of the four ids is *absent* from it.
  `EditorialCandidateBlock` is therefore typed on `EditorialProducerId` rather
  than the registry's closed `ProducerId` — the type system saying *the registry
  ruling has not happened yet*, which is honest rather than inconvenient.
- **`admitEditorialOutcome` has no `text` parameter.** A function that could see
  MAIA's prose is a function that could be asked to look in it for quoted
  wording. The envelope is the only channel, and W4-C11b pins the signature.
- **`EditorialInvocation` has no `headVersionId` field.** There is nothing to
  substitute. W4-C10 pins the absence of `headVersionId|headOf|currentHead|latestVersion`
  anywhere in the module.

---

## 2. Evidence

`lib/manuscript/editorialDiscourse/__tests__/contract.test.ts` — **40 passed · 0 failed**
`scripts/witness/w4-1-mutations.sh` — **12 killed · 0 survived · 0 crashed · 0 stale**

⭐ **No database.** Every W4-1 law is pure, so the falsifiers are jest and the
harness needs no cluster. That is a property of the act: *a contract that needed
a server to be falsified would not be a contract.*

⭐ The harness **proves the clean baseline green before any mutant runs** and
refuses outright otherwise — the W5-4 withdrawal, made structural.

| mutant | killed by |
|---|---|
| **`M-W4-PROSE-PROPOSAL`** ⭐ *(founder-named)* | W4-C11 |
| **`M-W4-INFER-DIRECTION`** ⭐ *(its member-side twin)* | W4-C5 |
| `M-W4-HEAD-SUBSTITUTE` | W4-C9 |
| `M-W4-MIXED-PRODUCER` | W4-C2, W4-C2b |
| `M-W4-UTTERANCE-AS-HISTORY` | W4-C3 |
| `M-W4-MERGE-GENERIC-HISTORY` | W4-C4 |
| `M-W4-SUBJECT-PREFERENCE` | W4-C1, W4-C1b |
| `M-W4-SECTION-NARROW` | W4-C12 |
| `M-W4-PARAPHRASE-DIRECTION` | W4-C6b |
| `M-W4-MULTI-PROPOSAL` | W4-C8b |
| `M-W4-REBASE` | W4-C10b |
| `M-W4-WITHDRAW-DELETES` | lifecycle |

**Repo gates:** typecheck *no regressions* · no-supabase clean · scoped jest
`23 failed · 3046 passed` — the same 4 held pre-existing red obligations as
every act since W5-Z0, and no new ones. W5-4 `38/0` and W5-Z0 `38/0` re-run
unchanged.

---

## 3. Two findings, reported not smoothed

### 3.1 ⚠️ The contract had a real defect, and its own falsifier caught it

`admitEditorialOutcome` refused the RC-GEN-01 geometry at the **top level**
only. A nested `proposal: { sectionId, replacementText }` was **admitted**, with
the section id silently dropped:

> A shape that asserts a section scope must be **refused**, never quietly
> narrowed into one that does not. Dropping a field accepts a claim while
> pretending it was never made.

The schema's `additionalProperties: false` was decoration until the parser
enforced it. Repaired at **both** levels — RC keys refuse as
`section_scoped_outcome`, any other unknown key as `malformed`. The defect is
preserved as the mutant `M-W4-SECTION-NARROW`, so the contract's own first
mistake is now one of the twelve things that cannot come back.

### 3.2 ⚠️ A mutant survived because my obligation was weaker than the ruling

`M-W4-UTTERANCE-AS-HISTORY` copied the exchange history into the declared-act
producer and **survived**. W4-C3 asserted an *absence* — that the current
utterance is not in the block — while the ruling is stronger: the producer
*carries ONLY the member-declared kind*, ⛔ not a second copy of their words.

Re-asserted as the **whole assignment**: the block's exact text must be
`[The writer's declared act] <kind>`. A block that *is* the declaration cannot
also be carrying prose, whatever the prose is. A second obligation (W4-C3b)
pins the structural guarantee beneath it — `EditorialParticipationInput` has no
field for the current utterance, so a function that cannot receive it cannot
duplicate it.

This is the same class as the eight mechanism-vs-behaviour bans earlier in this
session, in its other direction: **an absence test is not a content test.**

---

## 4. The laws, stated

**A3** — `AskAnchor` addresses something *inside an Ask reading*;
`proposal_chain_id` identifies an *editorial relationship*. They are alternative
thread subjects, not two descriptions of one. Both present → `subject_ambiguous`
(⛔ refused, never preferred). Neither → `subject_absent`. ⛔ No
`{ on: 'proposal_chain' }` member is added, and no anchor is manufactured to
satisfy a `NOT NULL`.

**C1** — four producers, partitioned by authorship. Object kinds stay visibly
labelled inside a block: *Direction ≠ turn ≠ ProposalVersion ≠ Insight* share a
block only because their provenance axes agree. A producer with nothing to carry
is **omitted**, never emptied. ⛔ `retrieved.writer_work_context` is not reused
for the locus — its provenance means Focus-retrieved member Work, and borrowing
provenance because the text happens to be the writer's is how a provenance chain
stops meaning anything.

**D** — `ask_turns` is the record. `editorialHistory()` takes a generic
conversation as a second parameter **so the law can be falsified rather than
merely asserted** — a reader that merged the two would pass a test that never
handed it both. `sessionRef = threadId`, `turnId = exchangeId`: the thread is the
conversation identity, the invocation is one act inside it. ⛔ Not a
browser-supplied `sessionId` — that is the identifier the Studio chat pane and
the Focus panel already share.

**F** — the act arrives **declared**. There is no function whose input is text
alone and whose output is an act kind, and W4-C5b pins the absence of classifier
vocabulary. A Direction's `instruction` is the turn body character for
character — never a paraphrase, because *a Direction whose text the system wrote
is a Direction the system authored*. An explicit reference travels; absence
stays `null` — *the writer's silence is not a reference*.

**G** — one reply, at most one candidate. `reply_only` is a complete canonical
answer: *"I would leave this alone."* needs no excuse. The candidate carries
`invocation.authoredAgainstVersionId` unchanged; a stale predecessor costs MAIA
her turn and nothing is rebased or retried. For `reply_with_proposal`, her answer
and her wording stand together — if the version cannot lawfully append, **no
MAIA turn persists either**, and the system does not leave behind *"Here's the
revision I made…"* when no durable revision exists. The member's turn remains; it
was written before cognition, as it should be.

**Lifecycle** — withdrawing discourse removes the bindings and **never** the
Direction or the Version. The relationship cannot be a restrictive FK from a
durable act onto a withdrawable thread: `RESTRICT` means the writer cannot
withdraw their own conversation, `CASCADE` erases an authored act, `SET NULL`
rewrites an immutable record. It needs its own binding object. ⛔ No migration
is authorized here.

**Sanctuary** — the surface supplies no act, so the posture is ordinary and
nothing is fabricated. Because D removes generic conversation persistence for
editorial turns, canonical MAIA creates no second retention path merely by being
canonical. ⛔ No new ambient Writer memory is authorized.

---

## 5. Standing

```
W5                                   ✅ CLOSED · 575810287
W4-0 census                          ✅ CLOSED · 9827a7e0f
W4-1 discourse contract              ✅ IMPLEMENTED · 40/0 · 12 killed

W4 schema refinement                 ⛔ after contract acceptance
W4 producer registry                 ⛔
W4 canonical service seam            ⛔
W4 route / runtime                   ⛔
W4 Canvas discourse UI               ⛔

01B recovery                         ⛔
W6 decision experience               ⛔
W7 retirement                        ⛔

W5/W4 schema landing                 ⛔
canonical merge                      ⛔
protected migration                  ⛔
production                           UNTOUCHED
maia_focus_witness                   FROZEN
```

### What each later act inherits from this contract

| act | inherits |
|---|---|
| schema refinement | the XOR `threadSubject()` is already written against; the binding object requirement |
| producer registry | the four specs, verbatim, with their axes |
| canonical service seam | `FORBIDDEN_FOR_EDITORIAL_TURNS` as a list to fail against; `editorialTurnIdentity()` |
| route | `MEMBER_ACT_KINDS` as the closed request discriminant; `memberActPlan()` as the atomic write set |
| runtime | `editorialToolSchema`, `admitEditorialOutcome()`, `maiaOutcomePlan()`, `onVersionRefusal()` |

### Owed, still not done

The W5-4 `Z4` label overstates its coverage (it reads two files while claiming
the codebase). The claim is true at `575810287`; the repair is owed the next time
that witness is touched. ⛔ Not done in W4-1, which touches no witness but its
own.


---

# W4-1.1 — CONTRACT SEAL

**Authorized by** founder act, 2026-09-14, on source inspection of `7a3e394b3`.
Same branch. Contract · tests · mutants · record only. ⛔ Still no schema,
registry, service, `openThread`, route or Canvas.

> **The correction that governs the seal.** Preserving authorship is not enough.
> Canonical cognition must receive the relationships the authors actually
> created — what a Direction referred to, what a Version succeeded, and which
> semantic act was explicitly declared. Otherwise provenance survives while
> meaning quietly loses its edges.

## A · the tool geometry is now ENCODED, not asserted

`EDITORIAL_TOOL_NAME` existed; nothing enforced it. `admitEditorialOutcome`
received an arbitrary object, so `not_through_tool` meant roughly *"not an
object"* rather than *"MAIA did not answer through the required tool"*. It could
not tell zero tool calls from the wrong tool from two `editorial_outcome` calls.

Split into two functions:

```
model completion blocks
        ↓
admitEditorialToolEnvelope(blocks)
    zero editorial_outcome calls        → not_through_tool
    exactly one, and nothing else       → inspect its input
    two editorial_outcome calls         → malformed   ⛔ never take-first
    editorial_outcome + another tool    → malformed
    some other tool only                → malformed
        ↓
admitEditorialToolInput(input)          the object schema
```

⭐ **And the founder's correction to their own earlier ruling is adopted
verbatim.** *"The admitter cannot see prose"* was too strong: the envelope
parser **must** see the block geometry in order to prove text blocks carry zero
weight. The law is not that prose is invisible —

> Prose may arrive; prose carries **zero authority** to create a semantic
> editorial act.

— which is stronger and actually falsifiable. `W4-C11b` was **rewritten, not
deleted**, and now pins the split: the envelope takes `readonly StructuredBlock[]`,
the outcome builder takes only a tool input, and nothing anywhere reads a text
block's contents for meaning. ⛔ No vendor termination vocabulary is consulted.

## B · the authored relationships now survive

`EditorialRecord` was `{ kind, author, text, refersTo? }` — one shape for four
objects, re-flattening ontology W5 spent several acts separating. It admitted a
member-authored Insight, a turn carrying `refersTo`, a Version carrying
`refersTo`; and the renderer **dropped `refersTo` entirely** while a Version
carried neither its identity nor its `supersedes`. So

```
Direction D · "That one, but softer." · refersTo = V1
```

reached cognition as `[the writer directed] That one, but softer.` — the exact
authored reference gone — and `V1 → V2 → V3` arrived as three unlabelled strings.

Replaced by four discriminated records: `InsightRecord` (`author: 'maia'` as a
literal, so a member-authored Insight is not a value to reject but a shape that
cannot be written) · `DirectionRecord` (`refersTo`) · `VersionRecord` (`id` +
`supersedes`) · `TurnRecord` (`turnIndex`, and ⛔ no `refersTo`, no `supersedes`).
`renderRecord()` carries the relationships into the block: *"about V1"*,
*"proposed wording V2, succeeding V1"*.

## C · no invented chronology

`history: EditorialRecord[]` quietly handed the **caller** authority to establish
one cross-object sequence, which W5 expressly ruled does not exist.
`EditorialParticipationInput` now carries four collections by their own order
laws — turns by `turn_index`, versions by `lineageOrder()` from `supersedes`
alone, insights and directions with no order law claimed — and each is rendered
under its own heading so a block never reads as one chronological stream.
⛔ No record carries an `authoredAt`, which is the strongest available form of
the ban; `W4-C14b` pins its absence.

`lineageOrder()` appends an unreachable version rather than dropping it: ⛔
omitting it would silently delete an authored formulation to make a list tidy.

## D · Sanctuary

`editorialPosture(true)` pre-authorized an act that does not exist, on the word
of a caller, with nothing verifying a member act. **The parameter is removed** —
*a parameter is not a signal; it is a place a future caller can assert consent
that was never given.* `editorialPosture.length === 0` is pinned, and
`member_act` no longer appears anywhere in the module.

## E · string states

```
reply              nonblank                  (`' '` was admitted)
rationale          absent OR nonblank        (`''` was admitted)
replacementText    any string, INCLUDING ''  — a deletion is a formulation
```

The first two aligned the pure contract with what `proposal_versions` can
actually accept; the third is explicitly preserved.

## Evidence

**54 passed · 0 failed** · **16 killed · 0 survived · 0 crashed · 0 stale**.

New discriminators: `W4-C13` (plain object, no tool call) · `W4-C14` +
`W4-C14b`/`c` (two calls, right-plus-other, other-only) · `W4-C15` (Direction's
reference survives) · `W4-C16` + `W4-C16b` (Version identity and succession
survive; order from `supersedes`, not from the array).

New mutants: `M-W4-TAKE-FIRST-TOOL` · `M-W4-TEXT-AS-OUTCOME` ·
`M-W4-DROP-REFERENCE` · `M-W4-FLAT-CHRONOLOGY`. `M-W4-PROSE-PROPOSAL` stays —
it protects persistence planning from a `reply_only` outcome, while
`M-W4-TEXT-AS-OUTCOME` attacks outcome **admission**; different layers.

Repo gates: typecheck *no regressions* · no-supabase clean · scoped jest
`23 failed · 3060 passed` — the same four held pre-existing red obligations.

## Three instrument findings from the seal

### 1 ⚠️ A mutant was reported KILLED while judging nothing

After the seal, `M-W4-UTTERANCE-AS-HISTORY` referenced `input.history`, which no
longer exists — so the **test suite failed to compile**. jest exits 1 either
way, and the harness read that as a kill *with zero obligations*.

> A mutant that does not compile has judged nothing, and a kill with no named
> obligation is a kill for the wrong reason.

Repaired on both sides: the harness now classifies `Test suite failed to run`
— and any `rc=1` with **no named obligation** — as **CRASHED**, and the operator
is re-aimed at the sealed implementation.

### 2 ⚠️ Two operators went STALE and were reported as such

`M-W4-MERGE-GENERIC-HISTORY` and `M-W4-MIXED-PRODUCER` anchored on code the seal
replaced. Both exited 3 and were reported **STALE**, not passed — the
classification working as intended — and both are re-aimed.

### 3 ⚠️ A helper block was lost in an edit, and the falsifiers caught it

Splicing the new envelope documentation over the old comment deleted
`SECTION_SCOPED_KEYS` / `sectionScoped` / `unknownKey` along with it. Thirteen
obligations went red immediately with `ReferenceError: sectionScoped is not
defined`. Restored. ⛔ Recorded because the near-miss is the point: the
`additionalProperties` enforcement added an hour earlier would have vanished
silently if these laws had been documented rather than executed.

## Standing after the seal

```
W4-1 five founder rulings               ✅ encoded
W4-1 envelope geometry                  ✅ SEALED
W4-1 relational history fidelity        ✅ SEALED
W4-1 Sanctuary boundary                 ✅ SEALED
W4-1 string-state alignment             ✅ SEALED

W4 schema refinement                    ⛔ HELD
W4 producer registry                    ⛔ HELD
W4 canonical service seam               ⛔ HELD
W4 route / runtime · Canvas             ⛔
production                              UNTOUCHED
```


---

# W4-1.2 — RELATIONAL SEAL

**Authorized by** founder act, 2026-09-14, on source inspection of `4885beeba`.
Same branch. Contract · tests · mutants · record only. ⛔ Still no schema,
registry, service, thread store, route or Canvas.

> **The sentence over this seal.** Partitioning provenance must not partition
> away relationship. MAIA needs to know not only who authored each thing, but
> which turn it belonged to and which formulation it succeeded — while
> succession itself remains owned by the one subsystem that already knows how to
> judge it.

## 1 · discourse order survived the record and was lost at the renderer

`TurnRecord` carried `turnIndex`; `renderRecord()` dropped it. Because C1
correctly puts the writer's turns and MAIA's in **separate producers**, this

```
turn 0 writer · turn 1 MAIA · turn 2 writer · turn 3 MAIA
```

reached cognition as two lists with **nothing left that reconstructs the
interleaving**. ⭐ And that is not the forbidden cross-object chronology:
`ask_turns.turn_index` is the discourse object's **own** structural order and is
expressly authoritative. Rendering now carries it —
`[turn 2 · the writer said] …` — so the provenance partition survives *and* the
conversation survives.

## 2 · the turn↔act bindings were ruled and then disappeared

The contract said a Direction and its turn are one act with two representations,
and that the relationship needs its own binding object — and then participation
had **no binding input at all**. MAIA would receive turn 4 *"Try it less
absolute."* and Direction D7 *"Try it less absolute."* without the fact that
**D7 was the act performed by turn 4**. ⛔ Identical text is not that fact.

`TurnBinding` is now an explicit input (`{kind:'direction', turnIndex, directionId}` /
`{kind:'version', turnIndex, versionId}`), rendered as *", in turn N"*. ⭐ It
stays a **relationship object**, never a field on the Direction or the Version —
which is what lets withdrawal delete the binding while the authored act stands,
the impossible-lifecycle reasoning honoured in the shape rather than only in a
comment. ⛔ Never inferred from equal text, adjacency or time; an unbound act
simply says nothing about a turn.

## 3 · `lineageOrder()` was a second succession resolver, and weaker

Step 1 owns `validateChain()` / `lineage()`. The seal added an independent
resolver — the class this programme already removed from
`proposalChain/store.ts`, where a local head helper *"duplicated no logic"* and
quite literally did. And the duplicate was **weaker on corrupt input**, which is
the worse half:

```
V1 root · V2 supersedes V1 · V3 supersedes V1        ← a branch

validateChain()   refuses — `branched`
lineageOrder()    picked one successor, APPENDED the other as "unreachable"
```

It manufactured a plausible presentation of an invalid history, and
*"anything the chain could not reach is APPENDED, never discarded"* was the
wrong recovery law for ProposalVersions entirely.

Removed. `versions` now arrive **already ordered** from the Step-1 read, and
`versionsAreStructural()` only **guards** that the supplied order agrees with the
links — exactly W1's `not_structural`, and ⛔ a guard is not a second
implementation. `editorialCandidates()` became a **result**: a corrupt
succession refuses as `versions_not_structural` and renders nothing. ⭐ The
deleted resolver is preserved as the mutant `M-W4-BRANCH-LINEARIZE`.

## 4 · MAIA could not author a Direction

The clearest internal contradiction in the seal: the governing sentence says she
may author one, W5 permits `Direction.author = maia`, W5-4 built
`createMaiaDirection()` — and the envelope offered only `reply_only` and
`reply_with_proposal`. So *"Let me try this less abstractly first"* had two
outcomes and one was forbidden: leave it as discourse and no Direction ever
exists, or infer one from her prose.

Added `reply_with_direction` → `[append_maia_turn, create_maia_direction,
bind_turn_to_direction]`, atomically. ⛔ Nothing reads `reply` for it; the
instruction is her own words verbatim, the member-side law unchanged.

⭐ **One semantic adjunct per turn.** `reply_only` · `reply_with_direction` ·
`reply_with_proposal`, and a Direction beside a proposal refuses as
`multiple_adjuncts` — checked before the kind is dispatched, so neither branch
can quietly honour the other's field. *"Direction and formulation
simultaneously"* earns its own contract extension rather than arriving through
optional-field combinatorics.

## Evidence

**62 passed · 0 failed** · **20 killed · 0 survived · 0 crashed · 0 stale**.

New: `W4-C17` (interleaving survives the partition) · `W4-C18` + `W4-C18b`
(bindings explicit, and a relationship object not a field) · `W4-C19` +
`W4-C19b` (branch refuses; W4 owns no resolver) · `W4-C20` … `W4-C20d` (MAIA's
declared Direction; the same sentence as `reply_only` authors nothing; one
adjunct; blank instruction refused and absent `refersTo` is `null`, not a guess).

New mutants: `M-W4-DROP-TURN-INDEX` · `M-W4-DROP-TURN-BINDING` ·
`M-W4-BRANCH-LINEARIZE` · `M-W4-INFER-MAIA-DIRECTION` — the last being the exact
MAIA-side twin of `M-W4-INFER-DIRECTION`, so the anti-classification law is now
falsified on **both** sides of the exchange.

Repo gates: typecheck *no regressions* · no-supabase clean · scoped jest
`23 failed · 3068 passed` — the same four held pre-existing red obligations.

## One instrument finding

⚠️ **`M-W4-DROP-REFERENCE` went STALE twice**, and the second time was my repair
being wrong rather than the seal moving: the operator stores its anchors as
single-line Python reprs, and my first re-aim edited a triple-quoted form that
does not exist in that file. It was reported **STALE** both times — never
passed — and the rewrite now verifies the anchor is present in the contract
before the harness runs.

⭐ And the re-aim is deliberately **narrow**: the operator drops only `refersTo`
and leaves the producing-turn clause intact. A mutant that removed both would be
killed by either obligation and prove neither.

## Standing after the relational seal

```
W4-1 core                               ✅
W4-1.1 envelope/ontology/posture        ✅ 4885beeba
W4-1.2 relational seal                  ✅

discourse interleaving fidelity         ✅ SEALED
turn↔authored-act provenance            ✅ SEALED
single succession authority             ✅ SEALED
MAIA Direction act                      ✅ SEALED

W4 schema design                        ⛔ HELD
W4 producer registration                ⛔ HELD
W4 canonical service seam               ⛔ HELD
W4 route / runtime · Canvas             ⛔
production                              UNTOUCHED
```
