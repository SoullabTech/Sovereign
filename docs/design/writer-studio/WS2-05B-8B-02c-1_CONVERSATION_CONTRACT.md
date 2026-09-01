# WS2-05B-8B-02c-1 · CONVERSATION CONTRACT

*Closeout revision. Adjudicated PASS IN PRINCIPLE with three shape-level
corrections and five rulings; all are applied below. The architecture is
unchanged — §§1–8 rulings stand as approved, with identity, staleness and anchor
coherence corrected to match what the prose already claimed.*

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

**Identity is `threadId` and nothing else.** `(manuscriptId, anchor)` is a
**grouping / lookup key**, never an identity — that is what makes "many threads
per anchor" true rather than a contradiction (§8, and open decision 5 as ruled).

```
thread identity     = id            host-minted, unique
ownership           = manuscriptId  the Work
grouping / lookup   = anchor        many threads may share one
reading reference   = ReadingIdentity | null   frozen, never re-pointed
```

```ts
interface AskThread {
  id: string;                    // THE identity. Host-minted, like unit ids.
  manuscriptId: string;          // ownership. The Work.
  anchor: AskAnchor;             // §2 — grouping key, NOT identity
  reading: ReadingIdentity | null;  // null for a Work with no reading yet
  /**
   * canonicalFingerprint(manuscriptId) at open — the BEFORE of §4's
   * BEFORE == AFTER assertion.
   *
   * ON THE THREAD, NOT IN ReadingIdentity, deliberately: a thread may be opened
   * on a Work that has never been read (§6), and that thread needs the baseline
   * too. A field that lives inside a nullable reading is absent exactly where an
   * author-originated concern would use it.
   */
  canonicalAtOpen: string;
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

### Anchor ⇄ reading coherence — hard invariants

The union alone still permits two incoherent threads: an anchor whose
`proposalId` disagrees with `reading.proposalId`, and a proposal-dependent anchor
with `reading: null`. Both are **impossible, not merely discouraged** — a thread
that points at proposal A while reasoning from proposal B would launder one
reading's authority onto another's content, which is the failure WS2 refuses
everywhere else.

```
proposal | division | question | uncertainty
    REQUIRE  reading !== null
    REQUIRE  anchor.proposalId === reading.proposalId

work | section | concern
    MAY have reading === null
```

- A mismatch is **refused at open**, not repaired and not preferred-to-one-side.
- `division`, `question` and `uncertainty` additionally require their `unitId` /
  index to resolve **within that frozen reading**.
- For a `concern` carrying an optional `unitId`, the unit must resolve against
  the frozen reading it claims to reference. If it does not, the thread opens
  **without the unit relationship** — the concern is the author's and survives;
  the false structural claim is dropped rather than guessed at.
- `sectionIds` on any anchor resolve against the Work, as
  `EditorialQuestion.sectionIds` already do.

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

**Budget: an opening allowance, extended only by an explicit author act.**

```ts
const OPENING_ALLOWANCE: ReadScope = {
  maxIdsPerRequest: 4,   // same as DEFAULT_READ_SCOPE
  maxSections: 8,
  maxChars: 60_000,
};

interface ReadAllowance {
  epoch: number;                       // 0 = the opening allowance
  scope: ReadScope;
  grantedBy: 'contract' | 'author';    // epoch 0 is 'contract'; every other is 'author'
  grantedAtTurn: number;
  /** The author gesture that authorised it. Required for every epoch > 0. */
  grantId: string | null;
}
```

Ruled, not tuned — inheriting `readScope.ts` wholesale, including its two hard
rules: **crossing a ceiling refuses the request whole; it never truncates and
never silently returns fewer sections.** A per-turn budget would be an unbounded
mode wearing a small number, since turns are unbounded.

**Exhaustion is not refill.** When the current epoch is spent, **MAIA cannot
refill it** — not by asking well, not by starting a new turn, and not by the
thread being long. The author may **explicitly grant a further bounded
allowance**, which opens epoch *n+1*. Each grant is recorded as a provenance
event with its own `grantId`.

This is deliberately **not** "resetting the lifetime budget". The budget is an
**initial allowance plus author-authorised extension epochs**, and the spend is
always against the current epoch. Repeated extensions are lawful precisely
because the author is repeatedly choosing them — expansion stays a member act,
matching the `surface_preference` precedent.

Nor can a new thread on the same anchor be used to launder a fresh allowance:
allowances are per thread, and abandoning an exhausted thread to re-ask the same
question in a new one is a **new thread with its own record**, visible as such.

The thread budget is **its own instance**, separate from the reading's. A thread
cannot spend the reading's remaining allowance. When the current epoch is
exhausted the thread can still talk — it simply cannot read more, and must say so
rather than answer as if it had.

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

Recomputed **at every turn** against `ReadingIdentity` and `canonicalAtOpen`.

**The signals are compositional, not mutually exclusive.** A real thread can have
text moved *and* the reviewed tree moved *and* a newer reading existing, all at
once. A tagged union would force a surface to pick one and drop the rest — the
exact collapse this section exists to forbid.

```ts
/** Two-valued dimensions. `unmeasured` is a THIRD state, never a falsy second. */
type ChangeFlag =
  | { state: 'unchanged' }
  | { state: 'changed' }
  | { state: 'unmeasured' };

/** Carries its numbers only when it actually has them. */
type ReviewChange =
  | { state: 'unchanged' }
  | { state: 'changed'; was: number; now: number }
  | { state: 'unmeasured' };

type Supersession =
  | { state: 'not-superseded' }
  | { state: 'superseded'; by: string | null }
  | { state: 'unmeasured' };

interface StalenessState {
  inputMoved: ChangeFlag;
  topologyMoved: ChangeFlag;
  reviewMoved: ReviewChange;
  readingSuperseded: Supersession;
  /** BEFORE == AFTER against `AskThread.canonicalAtOpen`. */
  canonicalMoved: ChangeFlag;
}
```

**All five dimensions are genuinely three-state.** The earlier shape used `null`
for *could not measure* on two dimensions while `reviewMoved` and
`readingSuperseded` used `null` for *measured and unchanged* — so those two could
not distinguish "I checked, nothing moved" from "I could not check", and an
absent measurement read as a clean one. `{ state }` makes the third case
unrepresentable-as-absence, and lets `ReviewChange` carry `was`/`now` only in the
one case that has them.

This follows the precedent `reviewClient` already sets for `staleAsRead`: *"True,
false, or NULL when the server could not measure it. Three states, because a
surface that cannot say 'I do not know' will say 'no'."*

**`unmeasured` is never `unchanged`.** The derivation is:

```
CURRENT  =  every required signal was successfully measured
            AND every measured signal is unchanged

UNKNOWN  ≠  CURRENT
```

If any required dimension is `unmeasured`, the thread is **not current** — it is
*unknown*, which is its own answer and must render and reason as one. A surface
may say "I could not check whether the text moved"; it may **never** answer as
though it had checked. MAIA is under the same constraint as for a measured
change: she may say what she saw, and may not assert what the text now says.

"Current" is **derived, never stored** — a stored summary flag beside the parts
is how the parts drift out of agreement with it.

Rulings:

- **`inputMoved` / `topologyMoved` is not a warning banner, it is a constraint
  on MAIA.** When either reads `changed`, she is told so in the turn: the prose
  underneath her reading has moved. She may continue to explain *what she saw*,
  and she may **not** assert what the text *currently says* about a moved region
  without re-reading it under §3.
- **`reviewMoved`** means the author has been editing the reviewed tree since the
  thread opened. Her advice must be recomputed against the current
  `reviewRevision` or explicitly marked as advice about an older tree.
- **`readingSuperseded`** means a newer proposal exists. The thread does **not**
  re-point to it. It stays a thread about the reading it was opened on, and the
  surface offers to open a new thread on the new reading.
- **Never quietly reattach old reasoning to new text.** Where any signal is
  `changed` — **or `unmeasured`** — an answer that depends on that material must
  either re-read it or say it is reasoning about what she read then. An
  unverifiable assumption of freshness is the same defect as a known-stale one,
  arrived at more quietly.

`canonicalMoved` is the **BEFORE == AFTER assertion for the whole thread**,
against the `canonicalAtOpen` baseline pinned in §1: canonical structure must be
byte-identical at close to what it was at open. It can only show that nothing
moved, never that nothing could — so it stands alongside §7's structural
inability, never in place of it.

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

**Adopted:** the thread is **owned by** `manuscriptId` and **grouped by**
`anchor`; its identity is `threadId` (§1); the reading is a *frozen reference*,
not the owner. Grouping is not identity — many threads may share an anchor.

- Append-only. Turns are never mutated; corrections are new turns.
- A thread is **never** a memory substrate for anything outside the Work. It is
  not a member atom, not episodic memory, not a pattern source, and nothing in it
  is eligible for cross-session recall. It is a record of an editorial exchange
  about one Work, readable by its author.
- **Sanctuary applies to the conversation record, not to lawful reference.**
  A Sanctuary thread is **not persisted at all** — not stored, not indexed, no
  pattern formation, no memory or atom extraction. This is the project's absolute
  boundary and 02c gets no exemption for being useful.
  It **may** still be anchored to a stored proposal, division, question or
  uncertainty: where the member is already authorised to view that proposal,
  reasoning about it in Sanctuary is lawful reference to Work material they can
  already see. What Sanctuary forbids is **creating, persisting or indexing the
  conversation**, not looking at the reading. Nothing from such a thread — no
  read grant, no turn, no proposed gesture — survives it.
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
- An author thread may request **bounded sections** under §3. It may **not**
  silently launch a new whole-Work 05B reading. If the inquiry genuinely needs
  the book read again, that is an explicit handoff to a new reading, chosen by
  the author — never a side effect of a conversation.
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
| 1 | *"Why did you put 82 in Water?"* | **No read needed *if* the frozen reading holds enough evidence to answer honestly.** She cites what she saw, not a fresh rationalisation, and if the reading's own `uncertainRegions` cover 82 she must say so. Where `evidence` / `coverage` do **not** settle it, she requests the relevant body under §3 rather than reasoning past the gap. The zero-body default survives: it is a default, not a prohibition on reading. |
| 2 | *"Read 81–84 and reconsider."* | A `read-request` under §3. 4 ids ≤ `maxIdsPerRequest`. Grant recorded as `ThreadRead`. She may then revise **in the thread**. The frozen interpretation does not change (§8). |
| 3 | *"I disagree. I think 82 belongs in Earth."* | Legitimate author input, not an instruction. She may agree, disagree with reasons, or offer a `ProposedGesture` (`reparent`). **Nothing moves.** Author disagreement is never itself a mutation trigger. |
| 4 | *"Could your original reading simply have been wrong?"* | **She must be *capable* of concluding "yes" when the evidence warrants it**, and must never defend the frozen proposal merely because it is hers — `reviewRevision`, `uncertainRegions` and `coverage` exist precisely because a reading is a claim, not a fact. This is **not** a demand for a yes on every instance: where the evidence still supports the original reading, saying so with reasons is the correct answer. The failure modes are symmetric — a thread that cannot concede error, and a thread that performs self-doubt to seem agreeable. Both are failed threads. |
| 5 | *"Chapter 10 is inside what you called Bibliography. Explain that."* | Anchor `division`. She explains from `evidence`/`coverage` — and `unaccountedSectionIds` and `possible-scaffold-contamination` are exactly the vocabulary for this. Likely a §3 read. Correct outcome may be conceding a misread run. |
| 6 | *"I have a problem with Chapter 10 that has nothing to do with your question."* | Anchor `concern`, `initiatedBy: 'author'` (§6). Opens with **no** obligation to relate to any `questionsForAuthor` entry. May be opened where no proposal exists. |
| 7 | *"What would you change?"* | Developmental answer permitted, as **options** — plural, with trade-offs. May include `ProposedGesture` values. May not be phrased as instruction, and may not be executed. |
| 8 | *"What would you leave alone?"* | First-class answer, never a filler response. Restraint must be sayable with reasons. A system that can only propose change has an interest in change. |
| 9 | *"Show me what evidence changed your mind."* | Answerable from `ThreadRead` rows: what she asked for, what she received, and which turn used it. This is the legibility obligation in §3, and it is why `requestedIds` and `grantedIds` are separate fields. |
| 10 | *"Do it."* | **Ask MAIA does not execute.** §7 handoff: the `ProposedGesture` + anchor + `againstReviewRevision` are handed to the author, who acts through the existing 05B review surface. The thread has no apply path to reach. |

---

## 10 · Adjudicated decisions

All five open decisions were ruled at closeout. None remain assumed.

1. **Read-budget refill — explicit author-granted bounded extension.** The
   opening allowance stands (8 sections / 60k chars). MAIA cannot refill it. The
   author may explicitly grant a further bounded allowance, opening a new epoch,
   recorded as a provenance event. Not a reset: *initial allowance + author-
   authorised extension epochs*. Repeated extensions are lawful because the
   author repeatedly chooses them. **Applied in §3.**
2. **Zero-body opening — KEEP.** Bodies are not pre-fed merely because a
   conversation opened. Case 1 is now conditional on the frozen reading holding
   enough evidence to answer honestly; where it does not, she reads under §3.
   **Applied in §3 and §9.1.**
3. **Author thread triggering a re-read — no implicit whole-Work reread.** An
   author-originated thread may request bounded sections through the same thread
   read protocol. It may **not** silently launch a new whole-Work 05B reading. If
   the inquiry genuinely requires reading the book again, that is an **explicit
   handoff to a new reading**, made by the author, not a side effect of a
   conversation. **Applied in §6.**
4. **Sanctuary + proposal anchors — anchor allowed, persistence prohibited.**
   Where the member may already view the stored proposal, a Sanctuary thread may
   reason about it; what Sanctuary forbids is creating, persisting or indexing
   the conversation, plus any memory or pattern extraction from it.
   **Applied in §5.**
5. **Multiple / concurrent threads per anchor — allowed.** `threadId` makes them
   distinct (§1). Preferring "resume this thread" over casually multiplying
   threads is **presentation policy, not an identity restriction**, and belongs
   to 02c-2's surface, not to this contract. **Applied in §1, §5 and §8.**

## 11 · What this unit did not do

No endpoint, no UI, no persistence, no schema or migration, no model call, no
manuscript or structure operation, no `OracleConversation` involvement. No file
under `lib/`, `app/`, `database/` or `scripts/` was added or modified.

Next, in order: **this contract is closed out and adjudicated** → **clear the 02c-0 real-row witness
debt on the Mac Studio** (load the real `e6cab…` proposal from `e586c418` and
confirm the closed 02a room still behaves as witnessed — a regression witness, not
another adjudication) → **02c-2 · Anchored Ask**.
