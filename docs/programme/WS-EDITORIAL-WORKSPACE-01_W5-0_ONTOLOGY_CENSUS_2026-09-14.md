# `W5-0` — ONTOLOGY / SUBSTRATE CENSUS · READ-ONLY

**Status:** CENSUS RETURNED · ⛔ NO SCHEMA · NO MIGRATION · NO CODE · branch `claude/w5-ontology-census`
**Authorized by:** founder, 2026-09-14 · runs in parallel with W3.1, on its own branch
**Question:** not *what tables should we add* — **does an existing object already have this subject, and would reuse collapse two acts into one?**

---

## 0. ⭐⭐ THE CHARTER SENTENCE WAS TOO BROAD, AND THE FOUNDER IS RIGHT

The charter said *"Insight · Direction · Discourse — three objects do not exist."* For
**Discourse that is false**, and the correction matters because it changes the act from
*invent storage* to *rule an existing substrate in or out*.

⛔ **We were one ruling away from building a second conversation table beside a working one.**

---

## 1. What already exists — measured

### 1.1 `ask_threads` / `ask_turns` — a real anchored editorial conversation

`database/migrations/20260901000001_ask_threads.sql`. Its own comment: *"One anchored
editorial conversation about a Work… **Not a memory substrate.**"*

| property | state |
|---|---|
| append-only turns | ⭐ enforced by trigger — *"a correction is a new turn, never a revision of one already spoken"* |
| speaker | `CHECK (speaker IN ('author','maia'))` — both parties, explicit |
| body | `CHECK (length(body) > 0)` |
| member ownership | `member_id … ON DELETE RESTRICT` |
| anchor | `jsonb NOT NULL`, gin-indexed, **grouping key, deliberately NOT unique** — many threads per anchor |
| anchor immutability | ⭐ trigger refuses any change to ownership, anchor, reading reference or canonical baseline — *"a thread cannot be re-pointed at a reading it was not about"* |
| frozen reading reference | `reading_identity`, never an FK |
| staleness | carried at the turn |
| initiator | `CHECK (initiated_by IN ('maia','author'))` |

**That is Discourse, already built, already governed.**

### 1.2 What it cannot currently say

`AskAnchor` (`lib/manuscript/ask/anchor.ts`) admits eight subjects:

```
work · proposal · division · question · uncertainty · section · concern · observation
```

⛔ **There is no `{ on: 'proposal_chain', chainId }`.** So:

> **Discourse exists as a Work-anchored editorial conversation substrate, but no lawful
> relationship binds that discourse to the proposal-chain editorial object.**

That is a materially different problem from inventing Discourse storage, and a materially
smaller one.

### 1.3 The neighbouring objects, and why their English labels are traps

⭐ **An existing coherent triad already governs readings and observations:**

```
observation          MAIA's developmental reading, anchored on a FROZEN reading
                     { on: 'observation', readingId, observationKey }

EditorialDecision    the MEMBER's ruling about the Work, governing named observations
                     authorship: member_authored | member_confirmed_maia_proposal
                     body: statement · intent · principle

ask_threads          the conversation, which can ALREADY anchor on an observation
```

⛔ **The proposal chain is a FOURTH object with no relationship to any of the three.**

---

## 2. The five questions, answered

### INSIGHT — *does an existing object already have this subject?*

**NO, and the near-miss is instructive.** A developmental `observation` is MAIA's reading of a
**frozen reading**, keyed `(readingId, observationKey)`. A chain-level Insight is MAIA's reading
of **this locus in the Work, at the moment this chain opened**. Different subject, different
temporal anchor, different lifetime.

⛔ Reusing `observation` would make every editorial insight require a frozen developmental
reading to exist first — which is a real precondition for a developmental observation and an
invented one for an editorial remark about a sentence.

**The exact missing fact:** *an authored MAIA observation whose subject is a proposal chain's
locus, which may exist with no candidate wording beneath it.*

### DIRECTION — *is any existing intent object the same act?*

**NO, and `EditorialDecision.intent` is the dangerous look-alike.** Its own contract says it:

> *"⛔ A DECISION IS NOT A PROTO-REVISIONPROPOSAL. The body carries a ruling, an intent and a
> principle — never prose, offsets, diff hunks or edit operations."*

| | `EditorialDecision.intent` | Direction |
|---|---|---|
| subject | **the Work** | **this chain's next formulation** |
| act | a **ruling** that governs | an **instruction** to try something |
| lifetime | standing | spent when answered |
| authority | governs observations | governs nothing; it asks |

⛔ Reusing it would collapse *"try this again, less absolute"* into *a member ruling about the
Work* — dressing a request as a governing decision. **Two different powers.**

### DISCOURSE — *can `ask_threads` lawfully become the workspace's discourse?*

⭐ **Plausibly YES, by adding one anchor member — and the census says so without choosing it.**
Everything Discourse needs is present and governed. The open questions are **three**, and each
is a founder ruling, not an implementation detail:

1. **Anchor admission.** Adding `{ on: 'proposal_chain', chainId }` to a union whose stored
   anchors are **immutable by trigger** is additive and safe for history. ⭐ But it makes the
   chain a *subject of conversation*, and the anchor is `jsonb` with **no FK** — so nothing
   in the database would enforce that the chain exists or is the same member's. The existing
   anchors have the same property; whether that is acceptable for this one is a ruling.
2. **⛔ DELETION ASYMMETRY — the founder predicted this and it is real.**

   ```
   ask_threads.manuscript_id   ON DELETE CASCADE   → conversation dies with the Work
   ask_turns.thread_id         ON DELETE CASCADE   → turns die with the thread
   proposal_chains             NO FK to the Work   → deliberately, so authored history is
                                                     not hostage to a topology change
   authorizations              ON DELETE RESTRICT  → history is retained, hard
   ```

   So a thread may be deleted whole for member sovereignty, while the version lineage it
   discussed **cannot**. ⭐ *That may be exactly right* — the conversation is the member's to
   withdraw; the authored formulations are a record of acts. ⛔ **But it must be ruled
   explicitly, not inherited.** The question to answer: *may deleting the discourse leave the
   authored version lineage standing?*
3. **Lifecycle.** A thread freezes `canonical_at_open` and a reading reference. A proposal
   chain has its own immutable locus and `base_version`. ⛔ Whether these are two freezes of
   the same moment or two different moments is **UNREAD** — I did not establish it and will
   not infer it.

### KEEP — *can MAIA say "I would keep this" without manufacturing a ProposalVersion?*

⭐ **Yes, and only through Insight.** It requires exactly one property: an Insight that can
exist with **no Suggestion beneath it**. Nothing else in the design needs to move.

⛔ **THE FALSIFIER STANDS.** `ProposalVersion(replacementText = the original text)` is not a
recommendation to keep; it is a candidate replacement that happens to be identical, and it is
**authorizable**. A system that represented *leave it alone* as an authorizable replacement
would let a writer "adopt" a no-op change into their manuscript history.

### AUTHORIZATION — *can any candidate object reach `authorizeVersion`?*

**Required answer: NO.** Measured, at this tip:

```
authorizeVersion(memberId, chainId, versionId)
    → proposal_chains         member-owned, by id
    → proposal_versions       WHERE id = $1 AND chain_id = $2
```

⛔ It reaches **exactly two tables** and reads a version's `formulation`. An Insight, a
Direction or an `ask_turn` is not a row in `proposal_versions` and cannot become one, so none
of the three is reachable **as long as they are not stored there.** ⭐ That is the whole of the
protection, and it is why the rule is the design's load-bearing sentence:

> **Only candidate wording can ever become authorizable manuscript text.**

---

## 3. The tree question — the census confirms the founder's instinct and does not encode it

`proposal_versions` carries `UNIQUE (chain_id, supersedes)` (one successor), a single-root
index, and `not_successor_of_head`. **The authorizable lineage is linear by construction.**

⭐ A Direction or a Discourse turn may *refer* backward — *"go back to what V1 was doing, but
gentler"* — and the next candidate still supersedes the head:

```
conversation refers to V1          ⭐ a reference
V5 supersedes V4                   ⭐ a succession
```

⛔ **A conversational reference is not a structural supersession.** That separation is almost
certainly the answer; the census records it as the leading disposition and does not ratify it.

---

## 4. What this census did NOT establish

⛔ Named so the next act does not inherit them as settled:

- whether `ask_threads`' freeze and a chain's `base_version` freeze the same moment (§2.3);
- whether an unenforceable `jsonb` anchor is acceptable for a chain subject (§2.1);
- the deletion ruling (§2.2);
- whether Insight belongs on the chain or on its own object with a chain reference — **not
  examined**, because it is a schema shape and this act is not a schema act;
- any row counts. ⛔ **No production or protected database was read.**

---

## 5. Disposition, for the founder — NOT chosen here

```
INSIGHT      new object          ⭐ no existing subject matches
DIRECTION    new object          ⛔ EditorialDecision.intent is a ruling, not an instruction
DISCOURSE    REUSE ask_threads   ⭐ leading disposition, gated on three rulings above
KEEP         falls out of Insight-without-Suggestion
AUTHORIZATION unchanged — none of the three is stored in proposal_versions
```

> ***We may not need to invent discourse at all. We may need to give the discourse substrate we
> already have a lawful home inside the editorial object — without letting it become wording,
> decision, or authorization.***
