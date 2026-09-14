# W4-0 — CANONICAL EDITORIAL DISCOURSE CENSUS

**Programme** `WS-EDITORIAL-WORKSPACE-01`
**Date** 2026-09-14
**Authorized by** founder act, 2026-09-14
**Base** `575810287` (W5-4) → `1b33b724d` (W5-Z0) → `303212ae7` (W5-3)
**Branch** `claude/w4-0-canonical-discourse-census`
**Class** ⛔ **READ-ONLY / RECORD-ONLY.** No code change, no schema, no producer
registry edit, no `openThread()` edit, no endpoint.

> **The W4 governing question.** How does the same MAIA who inhabits the
> Writer's Studio enter this exact editorial exchange — carrying the provenance
> of what she and the writer have already said — without creating a second
> conversation system, a second cognition path, or a second authorship truth?

---

## 0. The collision table

| # | Question | Existing substrate | Gap / ruling needed |
|---|---|---|---|
| A1 | thread persistence | `ask_threads` / `ask_turns` · append-only · turn index minted in-statement · freeze trigger | **PRESENT** — reusable as-is |
| A2 | chain relationship | `ask_threads.proposal_chain_id` (W5-3, composite FK) | **RUNTIME UNOPENED** — no writer, no reader |
| A3 | anchor | `anchor jsonb NOT NULL` · 8-member `AskAnchor` union | 🔴 **UNRESOLVED** — no truthful member exists for a chain-bound thread |
| B1 | canonical response | `constructWriterTurn → renderWriterTurn → getMaiaResponse` | **PRESENT, FOCUS-SHAPED** — hard-wired to `FIRST_CROSSING_PRODUCERS` |
| B2 | the Ask's own cognition | `askMaia` / `askMaiaDevelopmental` → `runStructured()` direct | 🔴 **NON-CANONICAL** — own system prompt, no `CanonicalTurn`, no MIPA, no floor |
| B3 | the Studio's chat pane | `StudioConversation` → `/api/sovereign/app/maia/list` | ⚠️ **LEGACY-ASSEMBLED** — canonical construction on that route is `cognitionPath: 'shadow'` |
| C1 | editorial producers | `member.writer_pursuit` / `system.writer_pursued_observation` partition | 🔴 **NO EXACT PRODUCER** — and one generic block is falsified below |
| D1 | thread history → cognition | `ask_turns` (Ask) vs `getConversationHistory(sessionId, 10)` (canonical) | 🔴 **TWO HISTORIES** — reconciliation ruling required |
| D2 | durable conversation record | `ask_turns` vs `addConversationExchange` / `TurnsStore.addExchange` | 🔴 **TWO WRITERS** — canonical cognition persists its own |
| E1 | Sanctuary | `TurnPosture.resolve(body)` at the focus route | ⚠️ **NO STUDIO SIGNAL EXISTS** — zero `sanctuary` references in the Studio surface |
| E2 | memory posture | `constructWriterTurn` fixes `allowCrossSessionMemory: false` | **PRESENT** — but continuity persistence is separate (D2) |
| F | Direction ↔ spoken turn | no relationship anywhere | 🔴 **UNRESOLVED** |
| G | MAIA turn ↔ ProposalVersion | `RC-GEN-01` tool envelope (`no_change` / `proposals`) | ⚠️ **MECHANISM EXISTS, ON THE WRONG PATH, WITH ZERO CALLERS** |

---

## A. Conversation identity

### A1 — thread persistence is genuinely reusable

`ask_threads` / `ask_turns` (`20260901000001`) already give what editorial
discourse needs and nothing it must not have:

- turns are append-only; the turn index is computed **inside** the INSERT
  statement, so two concurrent turns cannot claim one slot;
- `ask_threads_freeze()` refuses repointing `manuscript_id`, `member_id`,
  `anchor`, `reading_identity`, `canonical_at_open`, `initiated_by` — and, since
  W5-3, `proposal_chain_id`;
- ownership is in the SQL predicate of every read and of `appendTurn`;
- the author's turn is written **before** cognition and MAIA's turn **only after
  a successful answer** — witnessed at `ask/route.ts:535,540,554`: a failed
  answer returns `502` with the question already recorded and nothing of hers
  rendered.

**No gap.** W4 should not build a second thread store.

### A2 — the chain relationship exists in schema and nowhere in runtime

`ask_threads.proposal_chain_id uuid NULL` with the composite FK
`(member_id, manuscript_id, proposal_chain_id) → proposal_chains (member_id, work_id, id)`,
`MATCH SIMPLE`, frozen at open. **Zero readers, zero writers.** `openThread()`'s
input does not mention it (`threadStore.ts:117`).

### A3 🔴 — the anchor is the live collision

`anchor jsonb NOT NULL`, and the union is closed:

```
work · proposal · division · question · uncertainty · section · concern · observation
```

Every member except `work` and `section` points into a **frozen reading** —
`StructureInterpretation` or `DevelopmentalReading` — and `checkAnchor` enforces
that coherence. A proposal chain is neither.

The two apparently-fitting members are both false:

- `{ on: 'work' }` — says the conversation is about the Work as a whole. An
  editorial exchange about one chain is not that, and threads-on-anchor grouping
  would collapse every chain's discourse into one bucket.
- `{ on: 'section', sectionId }` — the chain's locus **has** a
  `targetSectionId`, which is exactly why this is tempting and exactly why it is
  wrong. Two chains on the same section would share an anchor; the chain
  identity would live only in the new column while the *grouping key* said
  something else. And W5 already ruled `AskAnchor ≠ proposal-chain identity`.
- `{ on: 'proposal', proposalId }` — the retired `revision_proposals` object.
  Reusing its member would be the adapter CUTOVER-01A forbade.

⛔ **And this census does not add `{ on: 'proposal_chain', chainId }`.** That is
the change the founder pre-emptively refused, and the reason is structural, not
stylistic: adding a member would make the chain relationship expressible in
**two** places — the anchor and the column — with nothing forcing them to agree.

**Ruling owed.** Three candidate shapes, stated without choosing:

1. **The anchor stays a Work/section-level truth and the column is the editorial
   parent.** Requires an answer to *what does a chain-bound thread's anchor
   truthfully say?* — and today there is no truthful answer available.
2. **A new union member**, accompanied by a rule making the anchor and the
   column provably one fact (a CHECK, or deriving one from the other).
3. **A schema refinement** making `anchor` nullable when `proposal_chain_id` is
   present — i.e. *the editorial parent IS the subject*, and the anchor column
   is the vestige of a design that predates chains.

⚠️ Option 3 is the only one that does not create a second place for the same
fact, and it is the only one that touches the column the founder named. It is
**not recommended here** — W4-0 is a census, and this is a schema decision
carrying its own migration custody.

---

## B. Canonical cognition path

### B1 — what genuinely exists

`/api/writers-studio/focus` is the **one** real canonical Writer path:

```
resolveCanonicalIdentity(request)            branded VerifiedMemberId
  → constructWriterTurn(...)                 constructCanonicalTurn · ROOM_POLICIES.writers_studio
      → MIPA adjudication                    held / offered / admitted / excluded
  → renderWriterTurn(turn, {tier:'CORE'})    proof, or null
  → tierInvariant(turn)                      FAST ≡ CORE ≡ DEEP membership
  → beginCanonicalGeneration(...)            getMaiaResponse({ writerStudio: { turn, posture, onHandoff } })
```

**Reusable, verbatim:** identity minting · turn construction · MIPA · the tier
invariant · the two-phase handoff (`prepare` returns proof or null; `generate`
resolves `handoff` only when the model was actually reached) · the posture
object travelling as one thing.

**Focus-specific, and the blocker:** `FIRST_CROSSING_PRODUCERS` is the literal
pair `['member.writer_focus', 'retrieved.writer_work_context']`, and
`renderWriterTurn` returns `null` unless **both** are admitted, both appear in
the participant order, and both texts are present in the rendered system prompt.
An editorial turn carries neither a Focus Set nor a Focus-retrieved Work
context, so **`renderWriterTurn` would refuse it** — correctly, since the proof
is about those producers.

⭐ The governing requirement is therefore satisfiable but not free: *an editorial
MAIA turn must be a real `CanonicalTurn`, not an Ask-specific model invocation
decorated afterward with canonical provenance.* The construction seam
generalizes; the **proof** is per-crossing and W4 needs its own.

### B2 🔴 — the Ask's cognition is not MAIA

Both Ask readers call `runStructured()` directly with a locally assembled
system prompt (`askReader.ts:232`, `developmentalAskReader.ts:207`;
`systemFor(ctx)` at `:257`). No `CanonicalTurn`, no MIPA, no floor producers —
`floor.runtime_prompt`, `floor.speech_act_boundary`, `floor.platform_boundary`,
`floor.interface_humility`, `floor.writer_role_boundary` are **all absent**.

⛔ So *"add `proposalChainId` to `openThread()` and call the existing Ask
reader"* would persist editorial discourse produced by a **non-canonical side
channel that does not carry MAIA's constitutional floor** — the precise thing
W4 exists to eliminate.

### B3 ⚠️ — and the Studio's visible chat pane is legacy too

`StudioConversation` posts to `/api/sovereign/app/maia/list`. That route does
construct a `CanonicalTurn`, but with `cognitionPath: 'shadow'` — legacy
assembly is still response-producing (CMT-01 M2). The Canvas comment
(*"does not go through CanonicalTurn"*) is accurate about what decides the
response.

**So three MAIA paths are reachable from the Writer's Studio today:**

| path | canonical? | persists to |
|---|---|---|
| `/api/writers-studio/focus` | ✅ real `CanonicalTurn` | `conversation_turns` (via `getMaiaResponse`) |
| `/api/sovereign/app/maia/list` | ⚠️ shadow only | `conversation_turns` |
| `askMaia` / `askMaiaDevelopmental` | ❌ none | `ask_turns` |

---

## C. Editorial participation

| object | authoredBy | notes |
|---|---|---|
| chain locus / `expectedText` | **member** | the Work's own wording, retrieved |
| Insight | **maia** | W5-3 fixes `author = 'maia'` by CHECK |
| Direction | **member OR maia** | mixed |
| ProposalVersion | **member OR maia** | mixed |
| prior discourse turn | **member OR maia** | mixed |
| current utterance | **member** | the ask |

### C1 🔴 — one generic editorial-context producer fails, and here is the proof

The registry's three axes are `authoredBy` × `participationClass` × `authority`,
and the **partition rule** is explicit: *a producer whose output mixes authorship
must partition into separately classifiable CandidateBlocks before MIPA.*

Direction, ProposalVersion and prior turns are each **mixed-authorship
collections**, so no single `producerId` can carry them without asserting one
`authoredBy` for material that has two. That is not a style preference — the
registry makes `authoredBy` a *per-producer constant*, so a generic
`retrieved.writer_editorial_context` would have to claim `member` or `system`
for a block containing both.

⭐ And the precedent already exists, built for exactly this reason:

```
member.writer_pursuit             authoredBy: member · class: marked
system.writer_pursued_observation authoredBy: system · class: retrieved
```

with the registry's own comment — *"Selecting something MAIA said does NOT make
MAIA's words member-authored… One mixed block would have laundered MAIA's
authorship into the member's."*

⛔ **Stuffing the editorial exchange into `retrieved.writer_work_context` is
doubly false**: that producer is `authoredBy: 'member'`, `class: 'retrieved'`,
provenance *"member-authored Work"*. MAIA's own Insight is neither member-authored
nor the Work.

**Gap:** the registry has **no** producer for any editorial object. What shape
the partition takes — by authorship, by object kind, or the cross-product — is a
W4 contract decision. This census establishes only that *one block cannot carry
it*, and it establishes that from the registry's own rule rather than by
preference.

---

## D. History authority

### D1 / D2 🔴 — canonical cognition brings its own history AND its own persistence

`getMaiaResponse` (`maiaService.ts:2704`):

- **reads** `const conversationHistory = await getConversationHistory(sessionId, 10)` (`:2763`) and passes it into FAST / CORE / DEEP;
- **writes** via `addConversationExchange(sessionId, input, text, …)` (`:2872`, `:3232`) and a direct `TurnsStore.addExchange` in the tail — both under one `exchangeId`;
- mints `exchangeId` from `meta.exchangeId` when the boundary already minted one, else `randomUUID()` (`:2742`).

So an editorial thread that persisted to `ask_turns` **and** called canonical
cognition would produce **two durable conversation records of the same
exchange**, keyed differently (`(thread_id, turn_index)` vs
`(exchange_id, seq)` on `sessionId`), and canonical cognition would read the
**`conversation_turns`** one as history — not the editorial thread.

⚠️ **The failure mode is not "duplicate rows". It is divergence.** `ask_turns` is
the record the editorial surface renders; `conversation_turns` is the record
MAIA's next turn remembers. Nothing makes them agree, and the last 10 turns of a
`sessionId` shared with the Studio chat pane would mix Focus turns, chat turns
and editorial turns into MAIA's memory of an exchange the writer sees as one
thread.

**Identifier behaviour through the canonical Writer path:**

| identifier | source | role |
|---|---|---|
| `sessionId` | request body at `/focus` (client-supplied) | history key **and** persistence key |
| `sessionRef` | `= sessionId`, passed to `constructWriterTurn` | recorded on the turn's `encounter` |
| `exchangeId` | `= requestId` (`randomUUID()` at the route), forwarded as `meta.exchangeId` | one member action ⇄ one exchange, both persistence paths |
| `turnId` | `= exchangeId` | `CanonicalTurn` identity |

**Ruling owed, and it is one question with one answer:** *what is the durable
conversation record?* One of —

1. `ask_turns` is the record; canonical cognition is called with continuity
   persistence **suppressed**, and the thread's turns are supplied as history;
2. `conversation_turns` is the record; `ask_turns` becomes a projection;
3. both persist, with an explicitly ruled and reconciled relationship.

⛔ None of these may be arrived at by default. Option 1 is the only one that
keeps `ask_turns`'s existing guarantees (author-before-cognition, MAIA-only-on-
success, append-only, freeze) as the truth — but it requires a suppression seam
that **does not exist today**: `writerStudio` currently suppresses persistence in
exactly one place, the pre-handoff field-safety refusal (`:2870`), and nowhere
else.

---

## E. Sanctuary / memory behaviour

### E1 ⚠️ — the Studio supplies no sanctuary signal, and never has

- The `ask_threads` migration says so for its own lane (`:32-35`): *"The Writer's
  Studio has NO Sanctuary mode today — there is no member- or session-level
  sanctuary flag reachable from this surface — so there is nothing here to gate
  on and no gate is faked."*
- **That is still true of the surface at `575810287`**: a repository search finds
  **zero** occurrences of `sanctuary` under `app/writers-studio/**` or
  `lib/writersStudio/**`.
- `TurnPosture.resolve(body)` at the focus route reads `sanctuary` from the
  request body; no Studio client sends it, so every Writer turn resolves
  `sanctuary: false`.

So the two historical assumptions are **both** inherited incorrectly: the Ask
lane's *"not reachable"* is accurate but stale-by-luck, and *"canonical Writer
turns carry sovereignty posture"* is true of the **mechanism** and empty of
**signal**.

### E2 — what canonical Writer turns do fix

`constructWriterTurn` sets `memoryMode: sanctuary ? 'ephemeral' : 'continuity'`
and `allowCrossSessionMemory: false` **unconditionally**. `ROOM_POLICIES.writers_studio`
is `{ persists: true, memberAboutAllowed: true, fieldCompositionAllowed: false }`.

⛔ **No new ambient Writer memory is authorized by this census**, and none is
acquired merely by using canonical MAIA. But note the asymmetry for W4: the turn
forbids *cross-session* memory while `getMaiaResponse` persists the exchange and
reads the last 10 turns of the session — which is D2 again, from the sovereignty
side.

---

## F 🔴 — the member's three acts

```
"Why?"                      → discourse turn
"Try it less absolute."     → Direction  (+ probably a discourse turn)
"I'd write it this way…"    → ProposalVersion   (W2, built)
```

**Substrate today:** the third is built and reachable
(`POST /proposal-chains/[chainId]/versions`, member-authored, explicit
`supersedes`). The first has `ask_turns`. The second has
`proposal_chain_directions` (W5-4) and **no relationship of any kind** to a turn
— no column, no join, no timestamp inference (deliberately: W5-4 refuses
chronology).

**Ruling owed** — three candidate shapes, and the census will not choose:

1. **one atomic act represented twice** — the utterance *is* the Direction, and
   both rows are written in one transaction with an explicit link;
2. **a Direction produced from a turn** — the turn is primary and the Direction
   is an authored extraction, which raises *who extracted it*;
3. **distinct acts** — the writer speaks, and separately steers.

⚠️ Shape 2 is the one to be most careful with: if the *system* decides that
*"Try it less absolute"* was a Direction, then the system, not the member, has
authored a steering act. That is the F/G symmetry — the same hazard on the
member's side that G names on MAIA's.

---

## G ⚠️ — MAIA's answer versus MAIA's formulation

```
"Because the repetition is carrying the emotional turn."   → discourse
"Try: 'He stayed there, held by the river.'"               → discourse + ProposalVersion?
```

⛔ **W4 must not scrape MAIA's prose for wording.** That would make the system,
rather than MAIA's explicit authored act, decide which words were a candidate
formulation — and every guarantee W1–W5 bought (exact focus, authored
succession, `supersedes` stated by the author) would rest on a regex.

**⭐ The mechanism already exists, and it is the strongest finding in this
census.** `RC-GEN-01` (`lib/manuscript/revision/`) has MAIA answer **through a
tool**, not through prose:

```
REVISION_TOOL_NAME = 'revision_outcome'
  kind: 'no_change' | 'proposals'
    no_change  → requires `reason`
    proposals  → [{ sectionId, proposedText, reason }]
```

with its own file header: *"⭐ RESTRAINT IS A FIRST-CLASS ANSWER (RC-07a)… An
editorial agent optimised to always edit — because editing is the visible
feature — is the specific failure this contract exists to make impossible to
reach by accident."* and *"⛔ NO WORK MUTATION EXISTS HERE OR DOWNSTREAM."*

That is exactly *reply only* vs *reply + explicit authored candidate
formulation*, already designed, already restraint-first.

**Three facts about it that W4 must not gloss:**

1. it runs through `runStructured()` **directly** — same non-canonical path as
   B2, so adopting it as-is would import the very side channel W4 removes;
2. it has **zero production callers** at `575810287`. Outside
   `lib/manuscript/revision/**` the only references to `generateRevision` or
   `REVISION_TOOL_NAME` anywhere in the repository are three lines in two test
   files (`__tests__/revision-outcome.test.ts`,
   `__tests__/revision-generate-protocol.test.ts`);
3. its output shape is `{ sectionId, proposedText }` — a **section-scoped whole
   replacement**, not a chain-scoped `ProposalVersion` with a stated
   `supersedes`. The gap between the two is a contract question, not a mapping.

**And a fourth fact that reframes the whole of G:** ⭐ **`openChain()` has no
production callers at all.** Nothing in the running system has ever opened a
proposal chain, so MAIA has never authored a `ProposalVersion` through any live
path. W2 built the member's side; MAIA's side of the succession is, today,
entirely unbuilt.

---

## H. What W4 must not inherit — the short list

```
⛔ an Ask-shaped model call decorated with canonical provenance afterwards
⛔ a generic editorial-context producer that flattens mixed authorship
⛔ retrieved.writer_work_context as the carrier for Insight/Direction/Version
⛔ an anchor chosen because a NOT NULL column needed filling
⛔ two durable conversation records with no ruled relationship
⛔ prose-scraping MAIA's answer for candidate wording
⛔ a Direction inferred by the system from something the member said
⛔ new ambient Writer memory acquired as a side effect of canonical cognition
```

---

## I. Standing

```
W5                                   ✅ CLOSED · through 575810287
W4-0 canonical discourse census      ✅ COMPLETE — this record

W4 contract                          ⛔ after founder rulings on A3 · C1 · D · F · G
W4 runtime                           ⛔
openThread chain binding             ⛔ until W4 contract
canonical producer additions         ⛔ until W4 contract
Direction ↔ turn relationship        ⛔
MAIA turn ↔ ProposalVersion relation ⛔

01B execution-response recovery      ⛔
W6 decision experience               ⛔
W7 legacy retirement                 ⛔

W5-SCHEMA-LAND                       ⛔
canonical merge                      ⛔
protected migration                  ⛔
production                           UNTOUCHED
maia_focus_witness                   FROZEN
```

### Rulings owed before a W4 contract can be written

| id | question |
|---|---|
| **A3** | what does a chain-bound thread's `anchor` truthfully say — or is a schema refinement required? |
| **C1** | how is editorial participation partitioned into producers, given that mixed authorship forbids one block? |
| **D** | what is **the** durable conversation record, and what happens to the other? |
| **F** | are a Direction and its spoken turn one act, an extraction, or two acts? |
| **G** | does MAIA author a `ProposalVersion` through a structured envelope (and is `RC-GEN-01`'s the one), and how does a section-scoped `proposedText` become a chain-scoped version with a stated `supersedes`? |

### One instrument item, owed and NOT done here

The founder's precision on W5-4 stands: `Z4` labels itself *"one chain INSERT in
the whole codebase"* while reading only two files. The claim was independently
verified true at `575810287`; the **label overstates the instrument's coverage**.
Repair — widen the check or rename the obligation — is owed the next time that
witness is touched. ⛔ Not done in W4-0, which is record-only.
