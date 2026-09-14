# Step 1 · authored proposal succession — census and derived substrate

**Status** CENSUS + DERIVED MODEL. ⛔ No schema. No migration. No UX.
⛔ **Stopped before the first `CREATE TABLE`**, as ruled.
**Controlling** `docs/canon/WRITERS_STUDIO_EDITORIAL_OBJECTIVE.md` ·
`JARVIS-WRITERS-STUDIO-EDITORIAL-01`.

---

## 1 · What already exists

| object | shape | keeps authorship? | keeps history? |
|---|---|---|---|
| `manuscript_revision_proposals` | one exact change, one Work state, single-use | no | n/a |
| `manuscript_structure_proposals` | **proposal + revision counter + adoption** | ⛔ no | ⛔ **no** |
| `editorial_decision_events` | append-only chain, `decision_chain_id` + `event_index` | member only | ✅ yes |
| `developmental_observation_standing_events` | append-only standing chain | member only | ✅ yes |
| `working_draft_revisions` | append-only snapshots, `revision_number`, `saved_by` | ✅ yes | ✅ yes |

## 2 · ⭐⭐ THE FINDING · a proposal-with-revisions object already exists, and it cannot represent the ruling

`manuscript_structure_proposals` is the closest thing in the codebase:

```sql
evidence · interpretation · coverage      frozen at creation (immutability trigger)
reviewed                    jsonb         the member's, mutated by review operations
review_revision             integer       a COUNTER
adopted_at · adopted_review_revision      which revision was accepted
CONSTRAINT adoption_complete              both-or-neither
```

⭐ **Its adoption principle is exactly right and already proven in production
code**: *"Adoption records WHICH revision was authored, so 'what did they
accept' is answerable without replaying the edit history."* That is the
founder's acceptance test, already solved once.

⛔ **But its revision model cannot carry the ruling.** `reviewed` is a MUTABLE
blob and `review_revision` is a counter with **no history table anywhere** —
confirmed, not assumed. So it represents:

```
MAIA proposed ONCE  →  the member revised N times  →  the member adopted revision K
```

⛔ It cannot represent:

```
MAIA v1  →  Kelly v2  →  MAIA v3  →  Kelly v4
```

Two reasons, both structural: **intermediate formulations are overwritten**, and
**a revision has no author** — MAIA's contribution is frozen once in
`interpretation`, and everything after it is "the member's" by position.

> ⚠️ **Step 1 is therefore not "add versions to the existing model."** The
> existing model is a counter over a mutable blob. The ruling requires an
> append-only authored chain. Surfacing this rather than resolving it: whether
> `manuscript_structure_proposals` should later be re-derived from the same
> substrate is a question for its own lane, ⛔ not something to decide by
> building past it.

## 3 · What can be reused, verbatim

⭐ **The chain pattern is settled and need not be invented.**
`editorial_decision_events`:

```sql
decision_chain_id  uuid NOT NULL
-- ⭐ Successor-carried time. current = MAX(event_index). No superseded_by:
event_index        integer NOT NULL CHECK (event_index >= 0)
```

⭐ **Per-entry authorship is settled too.** `working_draft_revisions` carries
`revision_number` + `saved_by` + `UNIQUE (draft_id, revision_number)` — an
append-only, ordered, attributed chain. **The two halves step 1 needs already
exist in this codebase, in two different tables.** Neither has both.

⭐ `DecisionAuthorship` shows the vocabulary discipline: a closed union, with
`member_confirmed_maia_proposal` proving the project already models *"MAIA
proposed, the member made it theirs"* as a distinct kind rather than collapsing
it to one of the two.

## 4 · What is genuinely absent

```
an append-only chain whose ENTRIES carry authorship          absent
a chain scoped to a LOCUS rather than to a draft or reading  absent
MAIA as an author of a persisted authored artefact           absent
a rationale field authored by whoever wrote the formulation  absent
```

⚠️ The third is worth naming: **nothing in the manuscript substrate records MAIA
as the author of anything durable.** `agent_runs` records that she ran;
`editorial_decision_events` records that a member confirmed something of hers.
Step 1 is the first object where *she is the author of record* — which is
precisely why the authorship field cannot be an afterthought.

## 5 · The derived minimum

```
ProposalChain            one LOCUS, fixed at open
  workId · draftId · baseVersion · targetSectionId · expectedText
  memberId
  decisionChainId?       ⭐ a REFERENCE to the governing ruling, never a parent

ProposalVersion          one authored FORMULATION
  chainId · versionIndex (1-based, contiguous)
  replacementText
  rationale?             ⛔ absent when there is none; never synthesised
  author: 'maia' | 'member'
  authoredAt
```

⭐⭐ **The separation is structural, not guarded.** `ProposalVersion` has no
field a target, an expected text or a base version could travel in. So

> *changing what should replace the text cannot change what text the
> authorization is permitted to replace*

is true **by shape** — no check to forget, no validation to bypass, and no later
refactor that can quietly reunite them. `manuscript_revision_proposals` held both
on one row and one gesture edited both; that is the defect this retires.

⛔ **The chain does not evolve. Only the versions do.**

## 6 · Tested against the five scenarios

```
MAIA v1 → Kelly v2 → MAIA v3 → Kelly v4
  four rows, indices 1–4, authors maia/member/maia/member.          ✅ representable

writer rejects MAIA and writes their own
  v2 by member, replacing v1 entirely. v1 is NOT deleted —          ✅ representable
  "no version overwrites its predecessor" holds by append.

MAIA revises after writer direction
  v3 by maia. ⚠️ THE DIRECTION ITSELF has no home in this model —   ⚠️ SEE §7
  it is conversation, and the chain records only formulations.

stale manuscript state
  the chain's baseVersion is a locus fact; the Work moving makes    ✅ representable
  the CHAIN stale, not any version. Refusal stays where it is.

multi-locus ruling with independent chains
  three chains, one decisionChainId, three terminal versions,       ✅ representable
  three independent acceptance states.
```

## 7 · ⚠️ Unresolved implementation collisions — surfaced, not resolved

1. **The writer's direction has no home.** *"Too absolute — I want the
   experiential quality without saying it as universal truth"* is neither a
   formulation nor an editorial ruling. It is the conversation that produced v3.
   ⛔ Do not smuggle it into `rationale`: that field belongs to the author of
   the formulation, and putting the member's instruction into MAIA's rationale
   would misattribute it. **Owed before the revise loop (step 4), not before the
   schema.**
2. **`manuscript_structure_proposals` overlaps and cannot be reconciled here**
   (§2). Its own lane.
3. **`member_confirmed_maia_proposal` versus `author: 'maia' | 'member'`.** The
   decision contract already models a third state — a member taking MAIA's
   proposal as their own. ⚠️ Is a member *accepting* MAIA's v3 unchanged the
   same as authoring v4? ⛔ Under the ruling it is not: acceptance binds an
   authorization to v3, and no v4 exists. **But the two vocabularies must not
   drift apart** — flagged for the schema lane.
4. **Chain identity when the Work moves.** A stale chain is refused, but is it
   *closed*? A new proposal against the new state is a new chain — so a chain
   needs no terminal state today, ⚠️ and a later "reopen" feature would be a new
   chain, never a revived one.

## 8 · The acceptance test

> **Can we reconstruct, without inference, exactly who authored every staged
> formulation, what it succeeded, which locus it belongs to, and which exact
> version — if any — was ultimately authorized?**

```
who authored          version.author                        explicit
what it succeeded     versionIndex − 1 in the same chain    explicit, contiguous
which locus           chain.locus                           explicit, immutable
which was authorized  the authorization names ONE versionId  explicit
```

⭐ All four are stated, none derived. ⛔ The fourth is step 2's to build; the
model makes room for it and does not presume it.

---

## Standing

```
census                 COMPLETE
derived model          PROPOSED — §5
collisions             FOUR, surfaced and unresolved
schema lane            NOT OPENED
migration              NOT AUTHORED
production             UNTOUCHED
```

⛔ **The table must be derived from this ontology, never the reverse.**
