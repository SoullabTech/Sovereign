# JARVIS-CIRCLES-01 · I1 — INTEREST COMMONS · DESIGN RECORD

**Stage** CIRCLE-05 · INVOKE · I1 **DESIGN ONLY**
**Date** 2026-09-07
**Opened on** the canonical I0.5 witness — SHA `1725a0857624d3d23040dfbb51d45c06d834b6f5`,
`63 passed · 0 failed · 0 warned · 0 skipped · 63/63 discharged by PASS · exit 0`, residue `0|0|0|0`.
**Status** ⛔ **DESIGN. NOTHING IS AUTHORIZED.** No migration · no schema write · no API · no UI · no
discovery implementation · no cohort · no facilitator work · no deploy.

---

## 0 · What changes at I1

Everything before this stage was a constraint on what a Circle must never do. I1 designs the first
**positive human act** the ecology requires:

> **"This matters to me."**

And the whole of FR-06 reduces to one sentence about that act:

> **Soullab knows it because the person said it — not because MAIA decided it for them.**

I0 established there is **no substrate for this and no reusable precedent**: `living_field_affinities`
is system-created from private memory atoms (`created_by='system'`, `affinity_score`,
`evidence_reason`) and `recurring_interests` is session-inferred. Both are barred absolutely. This
design starts from zero, deliberately.

---

## A · OBJECT MODEL

Four objects. Fields and types are **proposed shapes for discussion — no migration is written.**

### A.1 `interest_commons` — the identity of a shared interest

| field | type | note |
|---|---|---|
| `id` | UUID | |
| `slug` | TEXT UNIQUE | stable address; never regenerated from prose |
| `name` | TEXT | the canonical term as a human authored it |
| `created_at` | TIMESTAMPTZ | |
| `lifecycle_state` | TEXT | shape proposed; **the states and who moves them are docket D-J1/D-J5** |

⛔ **Structurally absent, by construction — the direct inverse of `living_field_affinities`:** no
`affinity_score` · no `confidence` · no `evidence_reason` · no `created_by = 'system'` · no
`embedding` · no `derived_from`. Nothing on this object may be produced by inference.

### A.2 `interest_declarations` — the member act

| field | type | note |
|---|---|---|
| `id` | UUID | |
| `member_id` | UUID | |
| `interest_commons_id` | UUID | **selected**, never parsed |
| `declared_at` | TIMESTAMPTZ | timestamp of a member act |
| `withdrawn_at` | TIMESTAMPTZ NULL | ⚠️ presence of this column is **docket D-J6**, not settled here |
| `expressive_text` | TEXT NULL | optional; **expressive only, never matchable** |

Uniqueness: one live declaration per `(member_id, interest_commons_id)`.

⭐ **Contextuality is NOT achieved by this shape.** A row per `(member, commons)` is, read the wrong
way, a global interest profile: `WHERE member_id = $1` returns one. Ruling 4 is therefore a
**retrieval contract**, not a column:

- `listDeclarationsForCommons(commonsId, …)` — scoped to one Commons.
- `listMyDeclarations(memberId)` — **self only**, the member reading their own acts.
- ⛔ **No path may enumerate one member's declarations across Commons for any other member, any
  Circle, MAIA, or any ranking.**

This is the P4/B-08 pattern: *the authorization is the join.* It must live in the contract signature,
so a correctly-scoped caller today is not the same as a signature that refuses an unscoped call
tomorrow.

### A.3 `interest_commons_circles` — a Circle's explicit affiliation

| field | type | note |
|---|---|---|
| `circle_id` · `interest_commons_id` | UUID | |
| `affiliated_by` · `affiliated_at` | UUID · TIMESTAMPTZ | |
| `withdrawn_at` | TIMESTAMPTZ NULL | |

Affiliation is an act **by the Circle side**, never a consequence of any member's declaration. Who
holds that authority is **docket D-J4** — `created_by` is provenance not ownership (D-I6) and
`facilitator` is unassignable (CA-15), so no existing role answers it.

### A.4 `interest_term_proposals` — when nothing fits

| field | type | note |
|---|---|---|
| `id` · `proposed_by` · `proposed_at` | | |
| `proposed_term` | TEXT | **member prose. Inert.** |
| `resolution` · `resolved_into_commons_id` | TEXT NULL · UUID NULL | filled by a human act only |

⛔ A proposal **is not** an Interest Commons and creates no matching eligibility. Nothing
auto-promotes it. No clustering of proposals, no dedupe by similarity, no "we noticed several people
asked for something like this."

---

## B · AUTHORITY MODEL

| field | authored by | alterable by | derived? | may drive discovery | may never |
|---|---|---|---|---|---|
| `interest_commons.name` / `slug` | canonical authority (**D-J1**) | same | no | ✅ it *is* the axis | — |
| `interest_commons.lifecycle_state` | **D-J5** | **D-J5** | no | eligibility only | — |
| `declarations.interest_commons_id` | ⭐ **the member** | the member | no | ⭐ **the sole matchable authority** | — |
| `declarations.declared_at` | system record of a member act | nobody | no | no | recency ranking |
| `declarations.withdrawn_at` | the member (by withdrawing) | nobody | no | eligibility gate only | — |
| `declarations.expressive_text` | the member | the member | no | ⛔ **NEVER** | embedding · classification · clustering · similarity · ranking · MAIA reading it to infer anything |
| `interest_commons_circles.*` | Circle-side authority (**D-J4**) | same | no | which Circles appear | any Circle interior |
| `term_proposals.proposed_term` | the member | the member | no | ⛔ **NEVER** | promotion without a human act |

**Nothing in this design is system-derived.** That is the whole point, and it is checkable: a derived
column appearing anywhere on these objects is the defect.

### B.1 Barred inputs, restated as a closed list

Nothing may reach discovery from: MAIA conversation · memory atoms · semantic memory ·
`recurring_interests` · `living_field_affinities` · inferred themes · psychological interpretation ·
behavioral signals · private Circle membership.

⭐ The one distinction to keep sharp, because FR-08 was corrected once for exactly this: **this bars
ambient appropriation, not a person's sovereign act.** A member may declare an interest they first
noticed while talking to MAIA. What is barred is MAIA making that declaration on their behalf, or
without them.

---

## C · PRIVACY MODEL

⭐ **Matchability and visibility are different questions. Do not infer one from the other.** The
system can know a declaration well enough to make a Commons eligible to that member while no other
human sees it.

| | system may match on | another member sees | a Circle sees | private |
|---|---|---|---|---|
| that a member declared interest X | ✅ | **D-J2** | **D-J2** | default until ruled |
| the member's expressive text | ⛔ never | **D-J3** | **D-J3** | default until ruled |
| the member's *other* declarations | ⛔ never cross-context | ⛔ never | ⛔ never | ✅ |
| Circle interior (members, count, FORMING/ACTIVE, inquiries, shares) | ⛔ never | ⛔ never | — | ✅ |
| Circle outer facts (`name`, `description`, `created_at`) | ✅ | ✅ within an affiliated Commons | — | — |

**Default posture pending ruling: matchable, not human-visible.**

⚠️ **The tension worth naming rather than resolving.** The north-star verb is *"find one another
around a shared interest."* Total invisibility satisfies privacy and defeats the verb — nobody finds
anybody. So a minimum mutual disclosure is required for the ecology to work at all, and the real
question is **what minimum lets two people meet without publishing a profile.** That is a founder
call (D-J2), not a design inference, and it is the single most consequential open question at I1.

---

## D · MEMBER ACTS

Five. **Each is a distinct deliberate act; none may be a side effect of another** — the same rule as
FR-08.5 (*a crossing creates no membership*).

1. **DECLARE** — select one Interest Commons from the enumerated canonical set. ⛔ Selection only. A
   free-text field that creates a declaration is the defect this whole design exists to prevent.
2. **SAY WHAT DRAWS ME** (optional) — attach expressive text to that declaration. Skipping it costs
   the member nothing: it confers no eligibility, no ranking, no standing.
3. **WITHDRAW** — remove the declaration's matching eligibility (§H).
4. **REUSE ELSEWHERE** — a *second explicit act*. One declaration never propagates to another
   context, and nothing offers to do it silently. Exact reuse semantics remain **CA-11 / D-J7**.
5. **PROPOSE A TERM** — when the canonical set has nothing honest for them. Routes to human review
   (§E); grants nothing in the meantime.

---

## E · INTEREST COMMONS IDENTITY

**The canonical set is authored, enumerated and finite — a human-curated vocabulary.** A member finds
their interest in it or proposes one. There is no third path.

⭐ **The rule that makes this checkable:** any search over the canonical set must be **literal** —
substring or prefix over canonical names. ⛔ **No semantic search, no "did you mean", no nearest
neighbour, no embedding.** A semantic search over a taxonomy *is* a classifier; putting it in the
lookup box rather than the pipeline does not change what it does. It would let MAIA silently decide
which term a person's prose "really" means, which is precisely FR-06's prohibition wearing a
different hat.

Proposals (A.4) are resolved by a human reading them. Nothing normalizes prose into taxonomy.

**Identified, deliberately NOT decided here** (all require founder authority):

| | |
|---|---|
| **D-J1** | who may create a canonical Interest Commons |
| **D-J5** | synonym / duplicate handling · rename · **merge** · retirement |

⚠️ **Merge is not an administrative operation.** Merging X into Y silently moves a member's
declaration to a term **they did not choose** — the system authoring a person's statement about
themselves. Two defensible answers (re-point only on a member act; or preserve the declaration
against its original term and let it lapse) and no way to pick one without a ruling. Named inside
D-J5.

---

## F · CIRCLE RELATION

A Circle **explicitly affiliates** with an Interest Commons (A.3). What may appear:

✅ `name` · `description` · `created_at` — the three safe outer facts established at I0.

⛔ member count · derived FORMING/ACTIVE (**both interior, D-I5**) · membership · inquiries ·
responses · shares · pulse · any activity signal.

⛔ **Affiliation transfers nothing.** Commons participation is not Circle participation. A
declaration creates no membership. Seeing a Circle in a Commons is not standing in that Circle.

⭐ **A Commons must not become a side door around FR-18.** Entering an affiliated Circle still runs
that Circle's own entry contract in full: a member whose standing there is `removed` is refused at
the mutation boundary regardless of how they arrived. Proposed as a named future obligation (§I).

---

## G · DISCOVERY CONTRACT

```
explicit declared interest          ← a member act, the only matchable authority
          ↓
eligible Interest Commons           ← SET MEMBERSHIP, not a score
          ↓
safe Circle outer representations   ← name · description · created_at
```

Each arrow is a **filter**, never a scorer. There is no relevance model, no affinity, no
personalization.

⭐ **Ranking is a status economy in disguise.** Order by activity, member count, recency or
engagement and you have rebuilt `contribution_points` in the sort key — the exact Discourse/Mighty
distortion R9 named and FR-08.7 forbids. So: no engagement ranking, no inferred-affinity ranking. If
ordering is needed for a list to be usable, it must be **non-signalling** — stable arbitrary,
alphabetical, or member-controlled — and that choice is itself a design decision to make in the open,
not a default someone reaches for.

---

## H · REVOCATION

**Certain:** withdrawal removes matching eligibility immediately and completely. A withdrawn
declaration matches nothing, appears nowhere, and confers nothing.

**Applying FR-15** (*keep the fact when integrity needs it; do not keep the surrendered meaning
because storage is easy*):

- **Expressive text — delete.** It is the person's surrendered meaning in the most literal sense. No
  integrity purpose requires retaining what someone said drew them to something after they withdraw.
- **The fact of a past declaration — ⛔ NOT DECIDED. Returned as D-J6.** My analysis, offered as
  analysis and not as a ruling: a removal record exists so a boundary act enacted *upon* a person can
  be independently reviewed later. **An interest declaration is an act against nobody.** No
  independent review needs it, so on FR-15's own test I do not see an integrity requirement — which
  points toward full deletion rather than a tombstone. But if a declaration ever gates something
  durable, that changes, and this design has no authority to foreclose it.

⛔ I have not invented a retention rule to make this section look finished.

---

## I · VERIFIER DESIGN — proposed future obligations

⛔ **IDs are RESERVED, NOT REGISTERED.** Adding these to `REQUIRED_ASSERTIONS` before they exist
would make them MISSING, and under FR-14 a MISSING required obligation never discharges — the gate
would fail by construction. They are registered in the same act that implements them.

| proposed ID | obligation |
|---|---|
| **C23** | no discovery path imports from `living_field_affinities`, `recurring_interests`, memory atoms, semantic memory, or any MAIA conversation source |
| **C24** | no object in the Interest Commons substrate carries a derived column (`*_score`, `confidence`, `evidence_reason`, `embedding`, `created_by='system'`) |
| **C25** | the canonical lookup is literal — no embedding, similarity, or nearest-neighbour call in the term-resolution path |
| **C26** | the declaration read contract is scoped by signature: no exported function returns one member's declarations across Commons to another party |
| **T11** | only an explicit declaration creates matching eligibility — no other write path produces it |
| **T12** | expressive text creates no match: two members whose only overlap is prose match on nothing |
| **T13** | withdrawal removes matching eligibility, and the withdrawn declaration surfaces nowhere |
| **T14** | a declaration in Commons A creates no eligibility in Commons B |
| **T15** | a declaration creates no Circle membership, and Commons affiliation transfers none |
| **T16** | ⭐ a member `removed` from an affiliated Circle is still refused at entry via the Commons — the Commons is not a side door around FR-18 |
| **T17** | Circle interior never reaches Commons discovery material: member count and derived FORMING/ACTIVE stay interior (D-I5) |
| **T18** | a term proposal confers no eligibility and no promotion occurs without a recorded human act |

---

## J · FOUNDER DOCKET — genuinely unresolved

Seven. Each is a real fork where proceeding under either reading would produce materially different
work, and none has been answered here to shorten the list.

| # | Question | Blocks |
|---|---|---|
| **D-J1** | **Who may create a canonical Interest Commons?** Founder-curated · steward-curated · member-proposed-then-ratified. Governs whether the vocabulary is a controlled canon or a growing commons, and therefore how much a proposal (A.4) can be relied on. | I1 implement |
| **D-J2** | ⭐ **Is a declaration visible to other humans, and to whom?** The load-bearing one (§C). Invisible is maximally private and defeats *"find one another"*; visible-to-the-Commons enables meeting and publishes a fact about a person. **What is the minimum disclosure that lets two people meet without publishing a profile?** | I1 implement |
| **D-J3** | **Is expressive text ever visible to another human?** Distinct from D-J2 — a person may want to be findable without their reasons being readable. It is never matchable either way. | I1 implement |
| **D-J4** | **Who may affiliate a Circle with an Interest Commons, and may they withdraw it?** No existing role answers this: `created_by` is provenance not ownership (D-I6), `facilitator` is unassignable (CA-15). | I1 implement |
| **D-J5** | **Synonym, duplicate, rename, merge and retirement authority** — including the merge question in §E: may a merge re-point a member's declaration to a term they did not choose? | I1 implement (a canon can ship before merge policy, but not before rename policy) |
| **D-J6** | **On withdrawal, is the fact of a past declaration retained?** §H argues FR-15 points toward deletion; the ruling is yours. | I1 implement |
| **D-J7** | **CA-11 — cross-context reuse.** Ruling 5 fixes that reuse requires another explicit act. What remains open is what the member is *offered*: may a second Commons show them a term they already declared elsewhere, or would that itself leak their profile into a context they did not bring it to? | reuse only; I1 can ship without it |

---

## Standing

```
I0            CLOSED
I0.5          VERIFIED ON CANDIDATE · 1725a0857 · 63/63 · exit 0
I1 DESIGN     THIS RECORD
I1 IMPLEMENT  NOT AUTHORIZED
PRODUCTION    UNCHANGED AS TO CIRCLES · UNMIGRATED · UNDEPLOYED
DEPLOY        NOT AUTHORIZED
COHORT        NOT AUTHORIZED
```
