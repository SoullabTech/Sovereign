# PROPOSAL-AUTHORIZATION-SEPARATION-01 — the identity census

**Lane** `claude/proposal-authorization-separation`, from `a6f573537`.
**Status** CENSUS. ⛔ Read-only. No schema, no migration, no route edit, no
implementation. **Collisions are SURFACED here, not reconciled.**

> **The question is not "how do we connect the new tables?" It is: which
> existing behaviours belong to the collaborative proposal, which belong to
> authorization, and which are artifacts of the period when both were
> represented by one object?**

---

## ⛔⛔ FINDING 0 — THE COLLISION IS NOT CONCEPTUAL. IT IS IN THE MIGRATION SET, AND IT HAS A DETERMINATE OUTCOME.

**Two migrations create a table of the same name, with different ontologies,
both `IF NOT EXISTS`:**

```
20260910000004_manuscript_revision_proposals.sql   REVISION-COLLABORATION-01 · R1
20260913000002_manuscript_revision_proposals.sql   EDITORIAL-WRITE-01
```

⭐ **Witnessed on a disposable database** (`collision_witness`, PG16, minimal
stubs for `members`, `member_manuscripts`, `manuscript_working_drafts`,
`manuscript_draft_sections`, `ask_threads`, `ask_turns`), applying them in
**filename order**, which is migration order:

```
20260910000004   applied · 0 errors · creates the COLLABORATIVE shape
20260913000002   NOTICE: relation "manuscript_revision_proposals" already exists, skipping
                 ERROR:  column "work_id" does not exist
20260913000003   ERROR:  column "accepted_at" does not exist
```

**Resulting columns:**

```
id · manuscript_id · draft_id · section_id · member_id · thread_id ·
produced_in_turn_index · created_at · proposed_text · reason · based_on ·
read_state · coverage · origin · authority · producer · input_fingerprint ·
derived_from_candidate_id · derived_from_candidate_revision ·
derived_from_candidate_digest · declined_at
```

⛔ **So on a database built from the migration set in order, the entire
EDITORIAL-WRITE-01 authorization object does not exist** — no `expected_text`,
no `replacement_text`, no `accepted_at`, no `resulting_version`, no
`execution_authority`, and therefore **none of the EW-F1a constraints**
(`mrp_execution_authority_vocabulary`, `mrp_inspection_only_never_accepted`).
`revisionProposal/store.ts`, `preview.ts`, `proposalWork.ts`, both routes and
the proposal-work panel address columns that are absent.

⭐⭐ **`IF NOT EXISTS` SILENTLY SWALLOWED AN ENTIRE DIFFERENT ONTOLOGY.** It is
written to make a migration idempotent — to skip *the same table*. It cannot
tell "already created" from "a different object is squatting on this name", so
the guard that exists to make re-running safe is the thing that made the
collision quiet.

⚠️ **What this census asserts, and what it does not.** It asserts the three
lines above, observed on a fresh disposable database. ⛔ It asserts **nothing**
about which shape production, the walk database, or `maia_focus_witness`
actually carry — those are separate readings and must not be inferred from
migration filenames. The 2026-09-07 drift incident is the precedent: *a witness
is a reading at a time.*

⚠️ **And it changes nothing about the ratified ruling.** `EW-F2_PROPOSAL_VS_
AUTHORIZATION_NAMING_RULING_2026-09-14` already forbids deciding "which version
wins" and forbids a superset migration. ⭐ This finding does not reopen that; it
supplies the operational fact the ruling was made without: **the collision is
already live, already deterministic, and already breaking two migrations.**

---

## The eight identity questions, answered per object

| | **COLLABORATIVE PROPOSAL** | **AUTHORIZATION** |
|---|---|---|
| **Canonical semantic name** | What MAIA proposed, held for the writer — *a formulation offered into a conversation*. Now also the thing `proposal_chains` / `proposal_versions` models as a succession. | *"Here is the exact change I am asking permission to make."* Permission for **one exact change to one exact state**. |
| **Lifecycle** | Born from a MAIA turn; **frozen at creation** except the writer's disposition (`declined_at`). ⭐ Under Step 1 it also *succeeds* — `MAIA v1 → Kelly v2 → …` — which the R1 row cannot express. | Created → (`accepted_at` + `resulting_version` together, at the end of the mutating transaction) → **spent**. Single-use. |
| **Creation act** | `persistRevisionActWithClient()` — MAIA authored a turn, and the proposal is bound to it. RC-08a trigger: the producing turn must exist **and be MAIA's**. Step 1: `openChain()` / `appendAuthoredVersion()`. | `proposeRevision()` — nothing in the repo calls it from a member gesture today; it is called from tests and staged by hand. ⚠️ **Its authoring act is unbuilt.** |
| **Mutation / transition acts** | ⛔ `proposed_text`, `based_on`, `read_state`, `origin`, `authority`, `producer` **immutable by trigger**. `declined_at` is the one mutable field. Step 1's versions are append-only with no mutable field at all. | ⛔ Only `accepted_at` + `resulting_version`, written **together** (`mrp_acceptance_whole`), once. `execution_authority` immutable by trigger — **inspection-only cannot be promoted in place**. |
| **Consumers** | `lib/manuscript/revision/persist.ts` · `lib/manuscript/revision/recovery.ts`. ⚠️ **No surface renders it.** | `revisionProposal/{store,preview,proposalWork}.ts` · `app/api/writers-studio/revision-proposal/[id]{,/accept}` · `write-state` route · `ProposedChange.tsx` · the proposal-work panel. |
| **Authority owner** | **MAIA and the member jointly** — each version names its own author. ⛔ Confers no power over the Work. | **The member, and only for one act.** `execution_authority` decides whether it may cross at all; `expected_text` decides whether it still may. |
| **Persistence / table identity** | `20260910000004` shape, **plus** `proposal_chains` / `proposal_versions` (`20260914000001`, landed, not deployed). | `20260913000002` + `20260913000003` shape. ⛔ **Same table name as the first. See Finding 0.** |
| **Relationship to the other** | ⭐ **An authorization must name ONE EXACT VERSION of one chain.** The contract already states the shape: `VersionAuthorization { chainId, versionId }` — ⛔ built in neither object today. | Carries `decision_chain_id` (a *ruling* lineage) but **no reference to a proposal version at all.** ⚠️ It has never needed one, because until Step 1 there were no versions to name. |

---

## ⛔ FINDING 1 — `ProposalWorkTarget` is the seam where the two objects are already fused

```ts
export interface ProposalWorkTarget {
  readonly proposalId: string;        // ← an AUTHORIZATION id
  readonly sectionId: string;         // ← authorization: exact target
  readonly sectionLabel: string;
  readonly range: SpacedRange;        // ← authorization: exact place
  readonly operation: 'delete_exact_text';   // ← authorization: exact act
  readonly replacementText: string;   // ← COLLABORATIVE: the staged wording
}
```

⭐ Six fields; **five are authorization facts and one is authored content.** The
file's own comment says `replacementText` *"is the field that becomes a
successor chain at step 3"* — the fusion was seen and written down at the time.

⚠️ And today `resolveProposalWork` sets it to `''` unconditionally, with the
note *"Deletion today. The vocabulary opens at step 4, not here."* ⛔ **So the
one collaborative field on the seam currently carries no authored content at
all.** That is the artifact to classify, not a behaviour to preserve.

---

## ⛔ FINDING 2 — `previewProposal` resolves BOTH questions in one pass

`resolveProposalWork` → `previewProposal` → `manuscript_revision_proposals`, and
`previewProposal` answers, in one `acceptable` verdict:

```
is this the member's?            ← authorization
does the Work still match?       ← authorization (expected_text, exactly once)
may it cross into the Work?      ← authorization (execution_authority)
where is it, for the surface?    ← rendering
```

⭐ **That fusion is defensible on its own terms** and the file argues it well:
preview and acceptance must consume the same guard, or the panel advertises a
change acceptance would refuse. ⛔ **But it means "can this be worked on
collaboratively" and "can this be executed" are currently the same question**,
and `null` is returned for both. A writer cannot discuss a proposal whose
expected text has moved — there is no state for *"still worth talking about,
no longer executable."*

⚠️ **Recorded, not resolved.** Whether that state should exist is a Step 2
design question.

---

## ⛔ FINDING 3 — the authorization's creation act is unbuilt, and that is load-bearing

`proposeRevision()` has **no member-gesture caller** anywhere in `app/`. Every
row reaching acceptance today was staged by hand or by test.

⭐ **This is fortunate rather than alarming**, and it is why Step 2 is cheap
now: there is no live authoring path whose semantics must be migrated. **The
relation can be built in the required direction from the start:**

```
member chooses version V  →  authorization NAMES V  +  exact Work state
                                                       exact target
                                                       expected text
                                                       operation
```

⛔ **and never:**

```
member accepts "the proposal"  →  system looks up the current head
                                  →  authorizes whatever happens to be there
```

⚠️ **This is the Step 1 law arriving one layer up.** We have just spent a whole
lane proving the system must not infer the author's succession relation from
current state. The same law: **an authorization must state which authored
version it authorizes.**

---

## ⛔ FINDING 4 — `decision_chain_id` appears on BOTH new objects, meaning the same thing

`manuscript_revision_proposals.decision_chain_id` and
`proposal_chains.decision_chain_id` both name a governing ruling lineage, and
Step 1's standing interpretation governs both:

> the **lineage**, never proof of which decision **event** was current.

⚠️ **Not a collision** — a ruling legitimately governs both the conversation and
the permission. ⛔ But it is the field most likely to be mistaken for the
proposal↔authorization link, and it is not that link. The link the contract
already names is `VersionAuthorization { chainId, versionId }`.

---

## Artifacts of the one-object period (classified, not repaired)

```
replacementText: '' on ProposalWorkTarget      the collaborative field, emptied
proposal id as the proposal-work selector      an AUTHORIZATION id naming a
                                               collaborative surface
`null` for "not acceptable" AND "not workable" one verdict, two questions
`IF NOT EXISTS` on both CREATE TABLEs          idempotence guard as collision hider
no caller of proposeRevision()                 the authoring act was never built
expected_text on the same row as
replacement_text                               the defect Step 1 retired for
                                               versions, still live here
```

⚠️ **That last one is exact.** The Step 1 contract says of `ProposalVersion`:
*"changing what should replace the text cannot change what text the
authorization is permitted to replace"* is true **by shape** — and names
`manuscript_revision_proposals` as the object that *"held both on one row and
one gesture edited both; that is the defect this retires."* ⭐ **It is retired
for versions. It is not retired here.**

---

## ⛔ Standing

```
census                  COMPLETE — collisions surfaced, none reconciled
schema                  ⛔ NOT AUTHORIZED
migration               ⛔ NOT AUTHORIZED
route edit              ⛔ NONE
implementation          ⛔ NONE
production              UNTOUCHED

Finding 0               a migration-set defect with a determinate outcome,
                        witnessed on a disposable database only
DIRECTION-HOME          OPEN — blocks Step 4, not Step 2
```

⚠️ **Nothing in this census decides which ontology keeps the table name.** The
ratified ruling forbids both "pick a winner" and a superset migration; this
lane's job was to say what is actually there. ⭐ **It is worse than the naming
ruling assumed: the two objects are not merely sharing a name, they are
breaking each other's migrations.**
