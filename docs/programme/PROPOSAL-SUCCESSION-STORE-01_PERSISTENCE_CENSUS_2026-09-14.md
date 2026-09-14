# PROPOSAL-SUCCESSION-STORE-01 — the persistence census

**Lane** `claude/proposal-succession-store`, from `e44453b39`.
**Status** CENSUS. ⛔ Read-only. Written before the first line of adapter code,
as ruled — *census first, adapter second.*

> **Censused:** `lib/manuscript/editorialDecision/store.ts` ·
> `lib/manuscript/revisionProposal/store.ts` ·
> `lib/manuscript/standing/store.ts` (the nearest append-only member-scoped
> store, which both of the above say they mirror) ·
> `lib/writers-studio/currentDraftRead.ts` and
> `lib/manuscript/revision/persist.ts` (working-draft persistence) ·
> `lib/db/postgres.ts` (the client contract underneath all of them).

---

## 1 · How are member-scoped reads enforced?

**`member_id` appears inside the SQL predicate of every statement. Never as a
filter applied after another member's row has already been returned.**

The standing store states the law in its own header, and it is worth quoting
because it settles two things at once:

> *"`member_id` appears in the SQL of every statement below, never as a filter
> applied after another member's row has already been returned. Authentication
> supplies it; a request never does. The owner is not derived from the reading's
> owner — those are different claims, and the second breaks the day legitimate
> sharing arrives."*

Observed everywhere:

```sql
readProposal        WHERE id = $1 AND member_id = $2
currentDecision     WHERE member_id = $1 AND decision_chain_id = $2
decisionHistory     WHERE member_id = $1 AND decision_chain_id = $2
acceptRevision      WHERE id = $1 AND member_id = $2 FOR UPDATE
```

⭐ **And ownership and resolution are asked in ONE question.** `addressResolves`
(`editorialDecision/store.ts:49`) joins the reading's id, the member and the
Work into a single `EXISTS`, with this reason given:

> *"A foreign key proves the reading EXISTS. It does not prove the observation
> belongs to this member's copy of THIS Work… another member's reading must be
> indistinguishable from one that does not exist — so both are asked in one
> question and answered by one row."*

`currentDraftRead.ts` says the same from the other side: ownership is proven by
the draft's own `(manuscript_id, member_id)` **inside the read**, *"not by a
separate check a later edit could drop."*

---

## 2 · How are inserts/transactions structured?

Three shapes, each with a stated trigger.

```
query(sql, params)              one statement, nothing else must commit with it
transaction(async tx => …)      two or more tables must commit together or not
…WithClient(tx, …)              this act composes INTO a caller's transaction
```

**`transaction()` when a torn write would lie.** The decision store writes the
event and its governed observations together because *"a torn write would leave
a ruling governing fewer places than the member said — the single most
misleading state this record could reach."*

**One client, ordered, with `FOR UPDATE`,** when the act is a sequence.
`acceptRevision` locks the proposal, then the draft, then reads the section
inside that lock, and notes that using the public `saveSection` *"would take a
second pool connection and land the write outside this transaction — where a
rollback could not undo it."*

**The `…WithClient` seam is an established project convention**, four instances:

```
lib/manuscript/revision/persist.ts   persistRevisionActWithClient
lib/circles/inviteService.ts         joinWithInviteWithClient
lib/circles/removalService.ts        removeMemberWithClient
lib/circles/inquiryService.ts        withdrawResponseWithClient
```

⭐ The Circles precedent is load-bearing for us: FR-18's authority lives **inside
the mutation** on the caller's client, not in a precheck, because
`transaction()` is an ordinary `BEGIN` with no row lock.

---

## 3 · How are rows hydrated into contract objects?

A single, uniform four-part pattern:

```ts
interface Row { … }                     // snake_case, exactly the DB shape
const hydrate = (r: Row): Contract => …  // the ONLY place a column becomes a field
const COLUMNS = `…`                      // shared by every SELECT so they cannot drift
Number(r.x)   r.t.toISOString()          // numerics arrive as strings; dates as Date
```

⭐ **Optional contract fields are produced by conditional spread**, so an absent
field is genuinely absent rather than `undefined`-valued:

```ts
...(r.intent ? { intent: r.intent } : {})
```

⚠️ **BUT THAT IDIOM TESTS TRUTHINESS, AND WE MUST TEST NULLNESS.** With the
`rationale` CHECK in place (`NULL OR btrim(…) <> ''`) the two coincide *today* —
but a hydrator whose correctness depends on a constraint in another file is
depending on something it does not state. Our adapter tests `!== null`.

⚠️ **And `replacementText` may legitimately be `''`** — a deletion is a
formulation — so it is never spread-guarded. It is required; it is read
verbatim.

---

## 4 · How are DB-unavailable / not-found / ownership failures represented?

**Three states, deliberately kept apart. The project has already paid for this
distinction once.**

| state | representation | evidence |
|---|---|---|
| the query could not run | ⭐ **throws** — propagates to the caller | `postgres.ts:64-86` |
| the row is not there | **`null`** | `readProposal`, `currentDecision` |
| the row is someone else's | **`null`, indistinguishable from absent** | `readProposal`; `addressResolves` |
| a domain rule refused | **typed union** `{ outcome: 'refused'; reason }` | both stores |

⛔ **`query()` does NOT translate a missing table into an empty result**, and the
removal of that translation is recorded in the file:

> *"This function used to translate Postgres 42P01 into a successful
> `{rows: []}`, which collapsed two independent states — 'the query ran and
> found nothing' and 'the query could not run' — for all ~750 callers at once.
> A member could then be told 'you have no works' when the platform was in fact
> unable to read them."*

⭐ **`DraftReadFailure`** (`currentDraftRead.ts`) is the precedent for a *typed*
read failure, used where the host must tell causes apart: *"An empty lookup is
not a database error. A body unavailable is not a boundary refused."*

**23505 becomes a named refusal**, never a crash and never a silent overwrite:
`simultaneous_write` — *"the unique constraint refused the loser; it did not
overwrite anyone."*

---

## 5 · Which patterns are appropriate to reuse verbatim?

```
Row / hydrate / COLUMNS                           reuse verbatim
member_id inside the predicate                    reuse verbatim
null for BOTH not-found and foreign-member        reuse verbatim
throw for database unavailability                 reuse verbatim
transaction() when two tables must commit         reuse verbatim
the …WithClient seam                              reuse verbatim
23505 → a typed refusal, never a retry            reuse verbatim
typed discriminated refusals, never exceptions    reuse verbatim
```

---

## 6 · ⛔ Where reusing an existing pattern would DISTORT the contract

**This is the part the census exists for. Six, and the first is the founder's
named trap arriving by inheritance rather than by carelessness.**

### 6.1 ⛔⛔ `event_index` ordering — the forbidden pattern, one layer up

`editorialDecision/store.ts` defines *current* as **highest `event_index`**:

```sql
ORDER BY event_index DESC LIMIT 1
DISTINCT ON (decision_chain_id) … ORDER BY decision_chain_id, event_index DESC
```

That is correct **there** — the contract says so: *"That is an event LOG, where
order is the record. This is SUCCESSION, where each entry names what it
replaces."* **Succession has no index.** The nearest column is `authored_at`,
and ordering by it and calling the last row the head is exactly the defect the
founder pinned. ⭐ **The head comes from `headOf()`, from `supersedes`, and from
nothing else.**

### 6.2 ⛔ "read only the current" would destroy the point

`currentDecision` returns one event. An equivalent `currentVersion` would return
the head and discard the intermediate formulations — *the* thing this substrate
exists to preserve. The adapter reads **all** versions of a chain.

### 6.3 ⛔ The `unchanged` outcome would collapse authorship

`recordEditorialDecision` returns `{ outcome: 'unchanged' }` when a ruling is
re-recorded identically — right there, because nothing new was decided. ⛔ Here,
**two identical formulations by different authors are two formulations**, and
the schema already admits consecutive same-author versions as legal. There is no
`unchanged` in this adapter.

### 6.4 ⛔ A second staleness mechanism — *and the conclusion was half wrong*

The decision store carries `expectedCurrentEventId`, a CAS token tested before
sameness. ⛔ **Adding one here would be a second thing to keep true**, and the
first divergence would be invisible until it mattered. **That part stands.**

⚠️ **BUT THE CONCLUSION DRAWN FROM IT DID NOT.** This section originally said the
candidate *"must supersede the head"* and left it there — and the adapter
therefore had the **store** find the head and fill `supersedes` in. ⛔ That is not
"no second token"; that is **no token at all, and a synthesized fact in its
place.** Founder review, second pass, 2026-09-14, merge blocker.

⭐ **THE CORRECTED CONCLUSION:**

> **`supersedes` itself crosses the adapter boundary.** It is the authored
> succession fact AND the staleness token, because those were always the same
> fact. The store transports it; the pure `appendVersion` decides whether the
> stated relationship is still lawful and returns `not_successor_of_head` when
> the chain moved underneath it.

⛔ **What the original wording permitted, concretely.** Two acts authored while
`v4` was the visible head, neither carrying `v4`:

```
A takes the row lock · reads v4 · store writes A.supersedes = v4 · commit
B takes the row lock · reads v5 · store writes B.supersedes = A   · commit

durable record:  v4 → A → B        but B never revised A.
```

⚠️ And `23505` never fires on that path, because `FOR UPDATE` serialized the two
calls **before** they could compete for the successor slot. So the file's own
comment — *retrying would make machine scheduling the ordering authority over two
authored acts* — was true in principle while the synthesized predecessor made it
so anyway, on the ordinary path. **Witnessed by F18; reproduced by M12.**

⭐⭐ **And this removes the head question from persistence entirely** — not just
a local reimplementation of it, and not just the call to the pure one:

> The database may determine whether a successor relationship is still lawful.
> ⛔ It must never determine what relationship the author meant.

### 6.5 ⛔ The truthiness spread, for `rationale`

See §3. `!== null`, stated explicitly, not inherited.

### 6.6 ⛔⛔ `catch { return refuse('write_failed') }`

`revisionProposal/store.ts:211` wraps its whole transaction and converts **any**
throw — including database unavailability — into one domain refusal. ⚠️ **That is
the same shape as the open S3 finding**: `lib/ai/structured/router.ts` captures
the provider's real error and `developmentalAskReader.ts:207` discards it, so a
genuine failure surfaces as the single word `unreachable` with no cause, and
hours were lost to it on 2026-09-10.

⛔ **Not copied here.** Database unavailability propagates; only named domain
conditions become refusals. *(Recorded as an observation about that file. ⛔ No
repair authorized in this lane.)*

---

## ⭐ The contract ⇄ database mapping (founder, verbatim)

```
contract                         database
────────────────────────────────────────────────
chain.id                         proposal_chains.id
chain.memberId                   member_id
locus.workId                     work_id
locus.draftId                    draft_id
locus.baseVersion                base_version
locus.targetSectionId            target_section_id
locus.expectedText               expected_text
governedBy?.decisionChainId      decision_chain_id
openedAt                         opened_at

version.id                       proposal_versions.id
version.chainId                  chain_id
version.author                   author
version.replacementText          formulation
version.rationale?               rationale / NULL
version.supersedes               supersedes
version.authoredAt               authored_at
```

⛔ **A mapping, not permission to rename the contract or reinterpret either
side.** ⚠️ Note the one name that differs on purpose: contract
`replacementText` ⇄ column `formulation`. The hydrator is where that is
reconciled, and it is the only place.

---

## ⛔ The three pinned constraints

```
1  the store must NOT infer order from authored_at.
   `ORDER BY authored_at` treated as succession is forbidden. The adapter
   hydrates rows and hands them to the already-proven pure functions.

2  member identity is enforced AT the persistence boundary.
   Knowing a chain UUID is not enough. And a foreign chain must not leak
   through a differently shaped response — census answer: it reads as `null`,
   the same as absent, which is the established convention.

3  the decision_chain_id event ambiguity is NOT resolved here.
   Persist and hydrate the lineage reference exactly: { decisionChainId }.
   ⛔ Nothing converts lineage → latest event → "the ruling that governed this".
```

---

## The derived adapter surface

⭐ **Derived from the evidence above, not from the capability names**, which the
ruling was explicit are capabilities and not API design.

```
openChain(memberId, { locus, governedBy? })    → ProposalChain          (query)
appendAuthoredVersion(memberId, chainId, {
  supersedes,                                  ⭐ AUTHORED, never synthesized
  author, replacementText, rationale? })       → AppendResult           (transaction)
readChain(memberId, chainId)                   → StoredChain | null     (query ×2)
```

with

```ts
interface StoredChain { chain: ProposalChain; versions: readonly ProposalVersion[]; }
```

**Why three and not six.** *lineage* and *head* are not store functions — they
are `lineage()` and `headOf()` applied to what `readChain` returned. ⭐ Making
them store calls would put a second implementation of succession behind a
database, which is 6.1 arriving through the front door instead.

**Why `appendAuthoredVersion` is a transaction.** It must read the chain's
existing versions, ask the *pure* `appendVersion` whether the candidate is
lawful, and insert — with no window in which another append lands between the
read and the write. The DB's one-successor index is the second guard; the pure
function is the first; ⛔ neither is decorative.

---

## Standing

```
census          COMPLETE
adapter         NOT WRITTEN
falsifiers      NOT WRITTEN
authorization   ⛔ NO    acceptance ⛔ NO    generation ⛔ NO
route ⛔ NO     UI ⛔ NO     manuscript write ⛔ NO
production migration ⛔ NO          canonical merge ⛔ NO
```
