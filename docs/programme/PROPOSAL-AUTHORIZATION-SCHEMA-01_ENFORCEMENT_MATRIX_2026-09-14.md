# Step 2 · schema lane — the enforcement matrix

**Lane** `claude/proposal-authorization-schema`, base `0e294a60d`.
**Anchor record** `ac72b23cb`.
**Status** MATRIX. ⛔ **Written before the first `CREATE TABLE`**, as ruled —
and before any migration file is moved, retired, renamed or authored.

> ⭐⭐ **THE DISCIPLINE: DO NOT PORT OLD MECHANISMS BECAUSE OLD TESTS MENTION
> THEM. PORT THE OBLIGATION.** An obligation whose mechanism disappears is not
> dropped — it is either satisfied by construction, or it travels to the lane
> that can enforce it. ⛔ *"Not schema" is never "dropped."*

---

## Reading the dispositions

```
PRESERVED            the law holds, by an equivalent mechanism here
ABSENCE              the law holds because the invalid state cannot exist
DEFERRED             the law is real and this layer cannot enforce it;
                     it travels to a named later lane
N/A                  the obligation's subject does not exist in this programme
⛔ RETIRED           genuinely obsolete — the law itself no longer holds
```

⭐ **Nothing in this matrix is `⛔ RETIRED`.** Every EW-F1a obligation is
preserved, satisfied by absence, or deferred with its lane named. That is the
result, not a formatting accident: the old architecture's laws were right; only
its mechanisms were shaped by an object that no longer exists.

---

# 1 · EW-F1a — execution authority

| # | Source | Object | Law | Disposition | Layer | Mechanism | Witness | Mutation |
|---|---|---|---|---|---|---|---|---|
| A1 | `executionAuthority.test.ts:42` · `mayCrossIntoTheWork` | Authorization | Only a member-authorized thing may cross into the Work | **ABSENCE** | ontology | No `execution_authority` column exists; **the row's existence IS the permission** | execution consumes a stored authorization; with none, it refuses before reading the Work | add an `execution_authority` column → the ontology assertion (§4) fails |
| A2 | `…:49,54` acceptRevision refuses `inspection_only` **before asking anything about the Work** | Execution | A refusal about authority must not depend on manuscript state | **PRESERVED** | store / execution | Ownership + existence are the FIRST query; a missing or foreign authorization refuses before any draft or section read | absent authorization → refusal, and **zero** manuscript reads issued | move the authorization lookup after the draft read → the statement-order witness fails |
| A3 | `…:71` authority is read from the row, never the caller | Execution | A caller cannot assert its own authority | **PRESERVED** | store | Route passes an id only; `member_id` inside the SQL predicate; **no body is read at all** | a request carrying authority fields changes nothing | accept an authority field from the request → the no-body witness fails |
| A4 | `…:80` an absent authority is the one that cannot write | Authorization | The safe default must be the non-writing one | **ABSENCE** | ontology | ⭐ **The safe default is now "no authorization object"** — strictly stronger: a default can be overridden, a nonexistent row cannot | no row → no crossing, with no column consulted | reinstate a defaulted authority column → §4 fails |
| A5 | `…:86,90,98,103` the control is absent, not greyed; the panel never asserts an effect it denies | Integration | A surface must not offer a gesture the boundary would refuse | **DEFERRED → integration lane** | UI | ⛔ Schema cannot enforce it. Carried with **R6** (discussable ≠ executable) so the surface does not resurrect the collapse | rendering witness in the integration lane | — |
| A6 | `…:122` `mrp_inspection_only_never_accepted` — an accepted inspection-only row is unrepresentable | Authorization | The invalid combination must not be writable | **ABSENCE** | ontology | The combination has no columns to be expressed in | §4 absence assertions | — |
| A7 | `…:127` the vocabulary is closed | Authorization | A closed vocabulary, enforced | **PRESERVED (transposed)** | DB CHECK | Authority vocabulary disappears; ⭐ **`operation` inherits the closure** — `CHECK (operation = 'replace_exact_text')` | an unknown operation refuses | widen to `IN (…, 'insert_text')` → the closure witness fails |
| A8 | `…:132` the default is the safe one | Authorization | — | **ABSENCE** | ontology | See A4 | — | — |
| A9 | `…:136` ⭐⭐ it cannot be promoted in place | Authorization | Authority must not be relabelled after the fact | **PRESERVED (widened)** | trigger | ⭐ **Identity and binding immutable after INSERT; ONLY the receipt may transition.** Wider than the old single-column trigger — there is no longer one column to promote, so every identity column is frozen | any UPDATE to identity or binding refuses; the receipt transition is admitted | freeze only `operation` → an identity-rewrite witness passes |
| A10 | `…:145` existing rows backfilled honestly, not flatteringly | — | Historical rows must not be given a protection they never had | **N/A** | — | ⛔ **No protected legacy rows exist** (production and walk: table ABSENT). `maia_focus_witness` holds 4 rows · 2 accepted and is **FROZEN — excluded, never migrated** | — | — |

---

# 2 · EDITORIAL-WRITE-01 — the exact-change laws

| # | Source | Object | Law | Disposition | Layer | Mechanism | Witness | Mutation |
|---|---|---|---|---|---|---|---|---|
| B1 | `EW-2` preparing/reading changes not a character | Authorization | Creating a permission is inert | **PRESERVED** | ontology | No manuscript FK, no write path from this table | a created authorization leaves the Work byte-identical | — |
| B2 | `EW-3` a Work past the base refuses | Execution | Stale base refuses | **PRESERVED** | binding + execution | `base_version` on the durable binding; execution compares under lock | stale base → refusal, nothing written | — |
| B3 | ⭐ `EW-4` the version alone never authorizes | Execution | Expected text is the law; version is defence in depth | **PRESERVED** | binding + execution | `expected_text NOT NULL CHECK (length > 0)`; **both** checks, either may refuse | token gone at an UNCHANGED version still refuses | drop `expected_text` and rely on version → the EW-4 witness fails |
| B4 | ⭐⭐ `EW-5` twice is AMBIGUOUS, not "the first one" | Execution | Exactly once, or refuse | **PRESERVED** | execution (pure guard) | `occurrences() === 1`, shared by resolve and execute | two occurrences refuse and write nothing | `indexOf` → the ambiguity witness fails |
| B5 | `EW-6/7/13` the change and ONLY the change | Execution | No collateral edit; heading untouched | **DEFERRED → execution lane** | execution transaction | The existing section writer keeps the mutation | byte-diff witness | — |
| B6 | `EW-8` exactly one section write, one version advance | Execution | — | **DEFERRED → execution lane** | execution transaction | One `UPDATE` each, counted | statement-count witness | — |
| B7 | ⭐ `EW-9` one change, ONCE | Authorization | Single-use | **PRESERVED** | DB + contract | Receipt transitions **null/null → value/value exactly once**; a second refuses | second execution refuses, Work does not move again | allow re-execution → the single-use witness fails |
| B8 | `EW-10` another member's is indistinguishable from absent | Authorization | — | **PRESERVED** | store | `member_id` in the predicate; both read as absent | identical refusals | post-filter instead → distinguishable responses |
| B9 | `EW-11` no second manuscript write path | Execution | — | **DEFERRED → execution lane** | execution | This table issues no `UPDATE` against draft sections | source witness | — |
| B10 | ⭐⭐ `EW-15` acceptance and mutation share ONE `TransactionClient` | Execution | — | **DEFERRED → execution lane** | execution transaction | The transaction-aware seam, never the public wrapper | seam witness | — |
| B11 | ⭐⭐ `EW-12` a failed write leaves the permission UNSPENT | Execution | A failed mutation must not spend a permission | **DEFERRED → execution lane** | execution transaction | ⛔ **Schema alone cannot prove this.** One transaction; rollback leaves the receipt null/null | injected write failure → authorization unspent, Work whole | — |
| B12 | ⭐ `EW-16` receipt whole, and a CHECK is not deferred | Authorization | No durable claimed-but-unwritten state | **PRESERVED (three places)** | type + DB + store | Contract **union** · `CHECK ((accepted_at IS NULL) = (resulting_version IS NULL))` · one statement after the mutation | half-receipt refuses at all three | two independent nullable fields → the type falsifier fails |
| B13 | `EW-14` a proposal writes no standing and no decision | Authorization | — | **PRESERVED** | ontology | No reference to either table; the module imports neither | neither table touched | — |
| B14 | ⭐⭐ `CS-3` preview and execution consume the SAME guard | Integration | A surface must not advertise acceptable where execution refuses | **DEFERRED → integration lane** | integration | ⚠️ **And it must NOT be restored as it was** — R6 requires *discussable* to stop depending on *executable* | integration witness | — |
| B15 | `CS-5` the preview NEVER computes an alternative | Integration | Permission for one exact change is not permission to achieve the intention another way | **DEFERRED → integration lane** | integration | No relocation, widening or regeneration | — | — |
| B16 | `F1-4` the staged change names a PLACE, carries no prose | Integration | — | **DEFERRED → integration lane** | integration | Coordinates and a label; not one manuscript character | — | — |

---

# 3 · `RevisionOffer` — its own obligations, ⛔ NOT a mechanical rename

⚠️ **The September-10 SQL is not to be copied with the table name swapped.** Its
laws are re-derived here against the three-object ontology.

| # | Source | Law | Disposition | Layer | Mechanism | Witness | Mutation |
|---|---|---|---|---|---|---|---|
| O1 | RC-08a trigger | An offer is born knowing **which exact MAIA turn** produced it | **PRESERVED** | trigger + composite FK | `thread_id`/`turn_index` NOT NULL at insert; FK proves the turn exists; trigger proves its speaker is **`maia`** | an offer with no producer, or a member-spoken turn, refuses | drop the speaker check → a member turn can produce an offer |
| O2 | RC-08 trigger | A producer turn may be **severed**, never **reassigned** | **PRESERVED** | trigger | Monotonic: non-null → null is lawful (erasure); non-null → different non-null refuses | reassignment refuses; severance succeeds | allow any change → reassignment passes |
| O3 | freeze trigger | `proposed_text` is frozen after creation | **PRESERVED** | trigger | ⭐ MAIA's authored output cannot be edited into something she did not offer | UPDATE refuses | — |
| O4 | freeze trigger | What she **read** and **why she offered it** are frozen | **PRESERVED** | trigger | `based_on` · `read_state` · `coverage` · `reason` · `producer` · `input_fingerprint` immutable | UPDATE refuses | freeze only `proposed_text` → provenance becomes editable |
| O5 | `declined_at` | The member's disposition is recorded, and is **the one mutable field** | **PRESERVED** | column | ⭐ Declining is a member act on a frozen offer; it changes the relationship, never the offer | decline recorded; nothing else moves | — |
| O6 | `..._work_authority` CHECK | `origin='work'` requires the S3 disclosure that licensed the reading | **PRESERVED** | DB CHECK | `CHECK (origin <> 'work' OR authority IS NOT NULL)` | a work-origin offer with no authority refuses | — |
| O7 | `..._candidate_ref_complete` / `..._candidate_origin_agrees` | The candidate triple is whole, and origin agrees with it | **PRESERVED** | DB CHECK | All three of `derived_from_candidate_{id,revision,digest}` or none; `(origin='candidate') = (id IS NOT NULL)` | a partial triple refuses | — |
| O8 | ⭐ NEW — the three-object ruling | An offer **confers no authority over the Work** | **ABSENCE** | ontology | No `accepted_at`, `resulting_version`, `execution_authority`, or manuscript write path | §4 absence assertions | — |
| O9 | ⭐⭐ NEW — the three-object ruling | An offer is **not** a proposal version | **ABSENCE** | ontology | No `supersedes`, no chain reference, no succession columns | §4 absence assertions | add `supersedes` → §4 fails |
| O10 | ⭐ NEW — Step 3 | An offer never **silently** becomes a `ProposalVersion` | **DEFERRED → Step 3** | Step 3 | ⛔ The transition act is Step 3's to define. ⚠️ **Schema must not pre-empt it by adding a link column now** | Step 3 witness | — |

---

# 4 · ⛔ THE ONTOLOGY ABSENCES — asserted, not assumed

⭐⭐ **This is how another hybrid table is prevented even if somebody later picks
plausible-looking columns.** Each line is a test against the live catalog, of the
same shape as §3 of the migration-state census.

```
manuscript_revision_offers            MUST NOT HAVE
  accepted_at · resulting_version · execution_authority
  proposal head / current state
  any manuscript-write capability
  ⭐ and no succession column: supersedes · chain_id

manuscript_revision_authorizations    MUST NOT HAVE
  proposed_text · replacement_text · rationale
  producer-turn provenance (thread_id · produced_in_turn_index)
  inspection_only · execution_authority
  head / current / latest field

proposal_chains · proposal_versions   ⭐ UNCHANGED — Step 1, not reopened
```

⚠️ **Names are not ontology.** The shape verdict from the migration-state census
runs against **all four** tables and must return **one** verdict each, **never
`HYBRID`** — that gate is separate from the "no `manuscript_revision_proposals`"
gate, and a set could pass the second while failing the first.

---

# 5 · ⭐⭐ TWO RELATIONSHIPS THE DATABASE SHOULD PROVE, NOT THE APPLICATION

## 5.1 · `proposalVersionId` belongs to `proposalChainId`

⛔ **Two UUIDs that application code promises belong together is exactly the
class this programme keeps finding** — *a link is not a binding.*

⭐ **Step 1 already supplies the substrate**: `proposal_versions` carries
`UNIQUE (chain_id, id)`, authored for the predecessor FK and equally usable
here.

```
FOREIGN KEY (proposal_chain_id, proposal_version_id)
  REFERENCES proposal_versions (chain_id, id)
```

⭐ A version from another chain becomes **unrepresentable**, not merely refused.
⚠️ **Open question for the ruling**: the delete action. `RESTRICT` follows Step
1's posture (an authored record is not deleted out from under the thing that
names it) and versions are already undeletable by trigger — ⛔ but this creates
the schema's first reference **into** the Step 1 tables, and whether Step 1's
substrate should acquire an inbound dependency is a founder question, not mine.

## 5.2 · The authorizing member owns the proposal chain

⛔ Today only application discipline says so.

⚠️ **Three candidate mechanisms, none chosen:**

```
1  application only          the predicate in every statement     ⛔ weakest
2  redundant member_id + FK  (member_id, id) unique on chains,
                             composite FK from the authorization  ⭐ structural
3  trigger                   verify ownership at INSERT           ⚠️ procedural
```

⭐ Option 2 makes cross-member authorization unrepresentable and matches the
composite device already used in 5.1. ⚠️ It requires a `UNIQUE (member_id, id)`
on `proposal_chains` — **a change to a Step 1 table**, which is why it is a
ruling and not a decision. ⛔ **Not chosen here.**

---

# 6 · ⭐⭐ B6 — the closure gate, pinned before implementation

```
blank database
    ↓
complete ACTIVE migration set, in order
    ↓
ZERO errors
ZERO "relation already exists, skipping" NOTICES
    ↑ ⛔ that notice is HOW THIS DEFECT STAYED QUIET.
      Here it is a FAILURE, never noise.

end state exactly:
  manuscript_revision_offers
  proposal_chains
  proposal_versions
  manuscript_revision_authorizations

NO manuscript_revision_proposals

each table → EXACTLY ONE ontology · no hybrid column family
ledger names every active applied migration
schema ↔ ledger AGREE
```

⭐ **Five separate failures, and two of them are easy to conflate.**
*Correct table names do not prove correct ontology* — the shape classification
is its own gate, run against every table, and a set can pass the name gate while
failing it.

⚠️ **`schema ↔ ledger agree` is the property `maia_focus_witness` violates.**
It is in the gate precisely because we have now seen it fail in a real database.

---

# ⛔ Standing

```
matrix                  COMPLETE
obligations             39   (EW-F1a 10 · EDITORIAL-WRITE-01 16 · offer 10 · relationships 2 + 1)
  PRESERVED             21
  ABSENCE                6
  DEFERRED              10   execution 6 · integration 4  (+ O10 → Step 3)
  N/A                    1
  ⛔ RETIRED             0   ⭐ no obligation is genuinely obsolete

open enforcement questions
  5.1  delete action on the composite version FK — and whether Step 1's
       substrate should acquire an inbound dependency at all
  5.2  how strongly the database proves chain ownership; option 2 requires a
       UNIQUE (member_id, id) on a STEP 1 TABLE

SQL                     ⛔ NOT AUTHORIZED — no CREATE TABLE written
migration file moves    ⛔ NONE
retirement archive      ⛔ NOT MOVED
code-dependent renames  ⛔ NONE
route · UI              ⛔ NONE
production              UNTOUCHED
maia_focus_witness      FROZEN
```
