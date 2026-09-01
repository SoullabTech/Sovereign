# WS2-05B-8B-02c-1 · CONVERSATION CONTRACT

**Status:** specification only. No endpoint, UI, persistence, schema, model call,
or manuscript/structure operation was built.
**Base:** `e586c4189f71aeb32b15005b7208e45c27cacad2`.

**Carried witness debt:** 02c-0's real-book / browser runtime has **not** been
re-executed on the converged branch. It must be cleared before the first 02c
runtime implementation is accepted.

Type sketches below are **contract illustration**, not authored code. They name
shapes so the rulings are unambiguous; nothing here is normative until built.

Everything is expressed in primitives 02c-0 already put on canonical:
`StoredProposal.{id, interpretationInputHash, sectionTopologyHash,
readerProvenance, reviewRevision, adoptedAt}`, `canonicalFingerprint()`,
`DEFAULT_READ_SCOPE`, `ReadScopeReport`, `ReaderOutput.status: 'read-request'`,
`EditorialQuestion`, `UncertainRegion`, `ReviewOperation`. **No new ontology.**

---

## 1 · Conversation identity

An **Ask thread** is the unit. Not a session, not a message log.

```ts
interface AskThread {
  id: string;                    // host-minted, like unit ids
  manuscriptId: string;          // the Work. The ONLY always-present anchor.
  anchor: AskAnchor;             // §2
  reading: ReadingIdentity | null;  // null for a Work with no reading yet
  initiatedBy: 'maia' | 'author';   // §6 — first-class, not derived
  openedAt: string;
  turns: AskTurn[];              // append-only
}

interface ReadingIdentity {      // copied at open, never re-pointed
  proposalId: string;
  interpretationInputHash: string;  // headings + supplied bodies at read time
  sectionTopologyHash: string;      // the Work's section topology at read time
  reviewRevision: number;           // the reviewed tree the author was looking at
  readerProvenance: ReaderProvenance | null;  // null = fixture reader
}
```

**The thread hangs off the Work, not the proposal.** A thread anchored to a
proposal that is later superseded must not be orphaned or silently re-pointed —
it becomes a thread about a reading that is no longer current, and says so (§4).

`readerProvenance: null` is preserved as a distinct fact from an empty object,
exactly as `proposalStore` already preserves it: a thread about a fixture reading
must never be presentable as a thread about MAIA's reading.

**Turn identity is monotonic and append-only.**

```ts
interface AskTurn {
  index: number;                 // 0,1,2… never reused
  speaker: 'author' | 'maia';
  text: string;
  readsGranted?: ThreadRead[];   // §3 — provenance of any body read this turn
  staleness: StalenessState;     // §4 — stamped at the turn, not at render
  proposedGesture?: ProposedGesture;  // §7 — inert
}
```

A turn is never edited or deleted. A correction — by either party — is a **new
turn**. This is the same discipline as `reviewRevision`: the record of what was
believed when is not editable by later belief.

---

## 2 · Anchor model

Anchors are a **discriminated union with no shared optional fields**, for the
reason `StructureInterpretation` gives for `none` and `ambiguous` having no
`units` field at all: a shape that cannot hold a proposal cannot be filled with
one by a surface that forgot to check.

```ts
type AskAnchor =
  | { on: 'work' }                                          // no reading required
  | { on: 'proposal';    proposalId: string }
  | { on: 'division';    proposalId: string; unitId: string }
  | { on: 'question';    proposalId: string; questionIndex: number }
  | { on: 'uncertainty'; proposalId: string; regionIndex: number }
  | { on: 'section';     sectionId: string }                // no reading required
  | { on: 'concern';     sectionIds: string[]; unitId?: string };  // author-originated
```

Rulings:

- **Work** and **section** carry no `proposalId`. An author may open a thread on
  a Work that has never been read. This is what makes §6 real.
- **Division** names `unitId` — the host-minted `ProposedUnit.id`, never the
  `label`. `label` is MAIA's commentary about a division and, per `interpret.ts`,
  never becomes a title and never reaches `reviewed`. An anchor keyed on a label
  would let display text become identity.
- **Question** and **uncertainty** are keyed **positionally into the frozen
  reading** (`editorialSynthesis.questionsForAuthor[i]`, `uncertainRegions[i]`).
  They are content of an immutable proposal, so an index into it is stable for
  that `proposalId`. It is *not* stable across proposals — which is correct, and
  is why the anchor carries `proposalId`.
- **Concern** is author-authored and carries the author's own pointing. It may
  name sections, and may optionally name a division, but it is **not** required
  to correspond to anything MAIA said.

Validation, mirroring how `EditorialQuestion.sectionIds` is already handled: an
anchor naming a section or unit the Work/proposal does not hold is **refused, not
silently dropped**.

---

## 3 · Reading scope

**Opening context** is the frozen reading and nothing else: the interpretation
(account, units, editorial synthesis, uncertain regions), `coverage`,
`unaccountedSectionIds`, the current `reviewed` tree, section **headings and
positions**, and the anchor's neighbourhood. **Zero bodies.**

The thread does **not** inherit the bodies the reading was given. Those were
consented for a reading; a conversation is a new act. This is the conservative
default and it is cheap to relax later; the reverse is not.

**MAIA may request bodies**, using the protocol that already exists —
`ReaderOutput.status: 'read-request'` with `sectionIds` and `why`. Nothing new is
invented for the ask.

**Budget: a thread-lifetime ceiling, not per turn.**

```ts
const THREAD_READ_SCOPE: ReadScope = {
  maxIdsPerRequest: 4,   // same as DEFAULT_READ_SCOPE
  maxSections: 8,
  maxChars: 60_000,
};
```

Ruled, not tuned — inheriting `readScope.ts` wholesale, including its two hard
rules: **crossing a ceiling refuses the request whole; it never truncates and
never silently returns fewer sections.** A per-turn budget would be an unbounded
mode wearing a small number, since turns are unbounded.

The thread budget is **its own instance**, separate from the reading's. A thread
cannot spend the reading's remaining allowance, and cannot top itself up by being
long. When the ceiling is reached the thread can still talk — it simply cannot
read more, and must say so rather than answer as if it had.

**Materials remain out of scope**, per `readScope.ts`. Notes, uploads, scraps and
surrounding Studio context are not readable in a thread either. A conversation
interprets the Work as written.

**Every grant is recorded**, and the record distinguishes asked from received:

```ts
interface ThreadRead {
  turnIndex: number;
  requestedIds: string[];   // what she asked for
  grantedIds: string[];     // what she actually received
  refused?: ReadScopeReport; // numbers only — never headings, never prose
  why: string;              // her stated reason, frozen
}
```

`refused` reuses `ReadScopeReport` precisely because it is numeric-only: a scope
refusal must not become the channel that leaks what the scope exists to bound.

The author-facing obligation is *legibility, not forensics*: the surface must be
able to say **what she asked for, what she got, how much she has read, and which
answer used it** without the author reading a log.

---

## 4 · Staleness

Three digests already exist and they answer different questions. The contract
uses all three and does **not** collapse them:

| Signal | Question it answers |
|---|---|
| `interpretationInputHash` | has the **text she read** changed? |
| `sectionTopologyHash` | has the **shape of the Work** changed? |
| `reviewRevision` | has the **author's reviewed tree** moved? |
| `canonicalFingerprint()` | has **canonical structure** moved? (read-only check) |

Recomputed **at every turn**, compared against `ReadingIdentity`:

```ts
type StalenessState =
  | { state: 'current' }
  | { state: 'text-moved';          changed: ('input' | 'topology')[] }
  | { state: 'review-moved';        was: number; now: number }
  | { state: 'reading-superseded';  supersededBy: string | null };
```

Rulings:

- **`text-moved` is not a warning banner, it is a constraint on MAIA.** She is
  told, in the turn, that the prose underneath her reading has changed. She may
  continue to explain *what she saw*, and she may **not** assert what the text
  *currently says* about a moved region without re-reading it under §3.
- **`review-moved`** means the author has been editing the reviewed tree since the
  thread opened. Her advice must be recomputed against the current
  `reviewRevision` or explicitly marked as advice about an older tree.
- **`reading-superseded`** means a newer proposal exists. The thread does **not**
  re-point to it. It stays a thread about the reading it was opened on, and the
  surface offers to open a new thread on the new reading.
- **Never quietly reattach old reasoning to new text.** Where staleness is not
  `current`, an answer that depends on the moved material must either re-read or
  say it is reasoning about what she read then.

`canonicalFingerprint()` is a **BEFORE == AFTER assertion for the whole thread**:
canonical structure must be byte-identical at close to what it was at open. It
can only show that nothing moved, never that nothing could — so it stands
alongside §7's structural inability, never in place of it.

---

## 5 · Persistence

**Decision: persisted, append-only editorial thread.** Semantics only; no storage
is designed here.

Rejected — *transient*: an editorial conversation the author cannot return to
teaches them not to invest in it, and re-asking regenerates a different answer
with no record of what was said before. That is a chat toy, not editorial
relationship.

Rejected — *thread owned by the proposal*: readings are superseded routinely, and
that model destroys or orphans the conversation each time. It also invites the
worst failure in §4 — silently re-pointing a thread at a reading it was not about.

**Adopted:** identity is `(manuscriptId, anchor)`; the reading is a *frozen
reference*, not the owner.

- Append-only. Turns are never mutated; corrections are new turns.
- A thread is **never** a memory substrate for anything outside the Work. It is
  not a member atom, not episodic memory, not a pattern source, and nothing in it
  is eligible for cross-session recall. It is a record of an editorial exchange
  about one Work, readable by its author.
- **Sanctuary applies.** A thread opened under Sanctuary is not persisted at all
  — not stored, not indexed, no pattern formation. This is the project's absolute
  boundary and 02c does not get an exemption for being useful.
- **Deletable by the author, whole.** Append-only governs MAIA and the system, not
  the author's sovereignty over their own record.

**Provenance held per thread:** the `ReadingIdentity` at open (including
`readerProvenance`, `null` preserved), and per turn: the model actually used, the
prompt hash, the reader/asker version, the staleness state stamped at that turn,
and the `ThreadRead` rows. Same shape discipline as `ReaderProvenance` — *the
resolved model string actually sent, never the default's name.*

---

## 6 · Two directions of initiation

`initiatedBy` is stored, not inferred, and **author-origination is first-class**:

- An author thread may be opened on a Work with **no proposal at all**
  (`anchor.on: 'work' | 'section' | 'concern'`, `reading: null`).
- It requires no MAIA question to exist, and does not become one. Nothing about
  an author-originated thread is written into `questionsForAuthor` (§8).
- MAIA's opening move in an author thread is **not** to produce a reading.
  "I have a problem with Chapter 10" is answered by helping the author find what
  the problem is, which may end with no structural conclusion at all.

The asymmetry to refuse: a system where developmental editing only works if MAIA
noticed first makes the author a respondent to the machine's agenda. Both
directions are the same thread type; only `initiatedBy` and the available anchor
kinds differ.

---

## 7 · Relationship to action

**Conversation is structurally incapable of mutation.** Not "declines to" —
*cannot*. It may explain, question, compare, suggest, develop, recommend. It may
never modify interpretation, reviewed proposal, manuscript text, canonical
structure, or adoption state.

The strongest thing a conversation may produce is an **inert proposed gesture**:

```ts
interface ProposedGesture {
  operation: ReviewOperation;      // the existing 05B vocabulary, unchanged
  againstReviewRevision: number;   // what it was computed against
  rationale: string;
  // NO execution token, NO apply handle, NO callback.
}
```

It is a **value**, not a call. Enforcement is by construction, mirroring how
`readerProvenance` is kept in its own module so the store "must be able to
describe who read a Work without being able to reach the thing that reads":

> **The Ask surface must not import `applyGesture`, `updateReviewed`, any
> structure-service writer, or any adoption path.** Not disabled, not
> feature-flagged: absent. While the surface is being proven it must be
> *incapable* of a write rather than choosing not to make one — the same standing
> rule `reviewClient.ts` already states about adoption.

**"Do it" is a handoff, not an execution.** The thread hands the author the
`ProposedGesture` and the anchor; the author performs it through the **existing**
05B review gesture surface, which already carries `expectedReviewRevision`,
`stale_revision` and `already_adopted` refusals. The gesture the author then makes
is theirs, made knowingly, on the reviewed proposal — and adoption remains behind
that, untouched by 02c.

If `againstReviewRevision` no longer matches when the author acts, the existing
`stale_revision` refusal fires. Conversation does not get a private path around a
guard the review surface already enforces.

---

## 8 · Static questions vs live thread

These are different objects and neither may overwrite the other.

| | `questionsForAuthor` | Ask thread |
|---|---|---|
| What | frozen content of MAIA's reading | live relational exchange |
| Lives in | the immutable proposal | its own record, keyed to the Work |
| Authored at | reading time, by the reader | conversation time, by both |
| Mutable | **never** | append-only |

Rulings:

- A thread anchored to a question **references it** by `(proposalId,
  questionIndex)`. Opening, answering, or abandoning the thread **never** edits
  the `EditorialQuestion`, never marks it answered inside the proposal, and never
  writes anything back into `editorialSynthesis`.
- The frozen reading is what she thought **then**. If the thread changes her mind,
  that lives in the thread. It does not retro-edit the letter she wrote.
- A question may carry **many** threads over time. Answered-ness is a fact about a
  thread, never a mutation of the reading.
- Conversely, nothing in a thread is ever promoted into `questionsForAuthor`.
  That field has exactly one author — the reader, at reading time.

---

## 9 · Adversarial case rulings

| # | Case | Ruling |
|---|---|---|
| 1 | *"Why did you put 82 in Water?"* | Answerable from the frozen reading + `evidence` + `coverage`. **No read needed.** She cites what she saw, not a fresh rationalisation. If the reading's own `uncertainRegions` cover 82 she must say so. |
| 2 | *"Read 81–84 and reconsider."* | A `read-request` under §3. 4 ids ≤ `maxIdsPerRequest`. Grant recorded as `ThreadRead`. She may then revise **in the thread**. The frozen interpretation does not change (§8). |
| 3 | *"I disagree. I think 82 belongs in Earth."* | Legitimate author input, not an instruction. She may agree, disagree with reasons, or offer a `ProposedGesture` (`reparent`). **Nothing moves.** Author disagreement is never itself a mutation trigger. |
| 4 | *"Could your original reading simply have been wrong?"* | **Must be answerable "yes".** The contract forbids defending the frozen proposal as such: `reviewRevision`, `uncertainRegions` and `coverage` exist precisely because a reading is a claim, not a fact. A thread that cannot concede error is a failed thread, and this is the case most worth testing. |
| 5 | *"Chapter 10 is inside what you called Bibliography. Explain that."* | Anchor `division`. She explains from `evidence`/`coverage` — and `unaccountedSectionIds` and `possible-scaffold-contamination` are exactly the vocabulary for this. Likely a §3 read. Correct outcome may be conceding a misread run. |
| 6 | *"I have a problem with Chapter 10 that has nothing to do with your question."* | Anchor `concern`, `initiatedBy: 'author'` (§6). Opens with **no** obligation to relate to any `questionsForAuthor` entry. May be opened where no proposal exists. |
| 7 | *"What would you change?"* | Developmental answer permitted, as **options** — plural, with trade-offs. May include `ProposedGesture` values. May not be phrased as instruction, and may not be executed. |
| 8 | *"What would you leave alone?"* | First-class answer, never a filler response. Restraint must be sayable with reasons. A system that can only propose change has an interest in change. |
| 9 | *"Show me what evidence changed your mind."* | Answerable from `ThreadRead` rows: what she asked for, what she received, and which turn used it. This is the legibility obligation in §3, and it is why `requestedIds` and `grantedIds` are separate fields. |
| 10 | *"Do it."* | **Ask MAIA does not execute.** §7 handoff: the `ProposedGesture` + anchor + `againstReviewRevision` are handed to the author, who acts through the existing 05B review surface. The thread has no apply path to reach. |

---

## 10 · Open decisions (for adjudication, not assumed)

1. **Thread budget refill.** `THREAD_READ_SCOPE` is a thread-lifetime ceiling. A
   long, legitimate editorial thread will exhaust it. Options: it never refills
   (thread ends its reading life); the author may explicitly grant a new
   allowance as a consent gesture; or a new thread on the same anchor starts a new
   budget — which is a loophole unless ruled. **Recommendation: explicit author
   grant**, because it keeps expansion a member act, matching the
   `surface_preference` precedent. Not decided here.
2. **Zero-body opening.** §3 opens with no bodies on conservative grounds. If real
   use shows case 1 (*"Why 82?"*) routinely needs one read to answer well, that is
   a finding to rule on, not to quietly default.
3. **Does an author thread ever trigger a re-read of the Work?** Contract says no
   — that is a reading, and readings are 05B. Confirm.
4. **Sanctuary interaction with anchors.** A Sanctuary thread persists nothing;
   whether it may be *opened* on a proposal anchor at all (the anchor itself is a
   pointer into stored content) needs a ruling.
5. **Multiple concurrent threads on one anchor.** §8 permits many threads per
   question over time. Whether several may be *open simultaneously* is undecided.

---

## 11 · What this unit did not do

No endpoint, no UI, no persistence, no schema or migration, no model call, no
manuscript or structure operation, no `OracleConversation` involvement. No file
under `lib/`, `app/`, `database/` or `scripts/` was added or modified.

Next, in order: **adjudicate this contract** → **clear the 02c-0 real-row witness
debt on the Mac Studio** (load the real `e6cab…` proposal from `e586c418` and
confirm the closed 02a room still behaves as witnessed — a regression witness, not
another adjudication) → **02c-2 · Anchored Ask**.
