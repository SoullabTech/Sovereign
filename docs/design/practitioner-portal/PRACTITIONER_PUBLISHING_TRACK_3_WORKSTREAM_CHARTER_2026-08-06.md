# Practitioner Publishing — Track 3 Workstream Charter (Implementation Architecture)

**Status: CHARTER — scope and authorization rule only.** ⛔ No schema, no migration, no code, no
route, no UI. ⛔ **This document does not open Track 3 as a phase** — because, per §1, Track 3 is not
a phase that opens.

Founder framing, 2026-08-06:

> Track 3 is no longer "implementation." It is **implementation architecture**: designing the
> substrate that realizes the constitutional rulings from Track 2, before any production code is
> written.

⭐ The objective, exactly: **design the implementation against the settled constitutional floor
without silently changing it.**

---

## 0. Position in the sequence

```
Track 1  Measure reality                    ✅ complete — SUBSTRATE_VERIFICATION (SHA b1399f693)
    ↓
Track 2  Rule constitutional questions      ⛔ NOT STARTED — 0 of 4 rulings made
    ↓
Track 3  Design implementation architecture ← this charter (⭐ per-workstream, not monolithic)
    ↓
Track 4  Build
    ↓
Track 5  Populate / adopt
    ↓
Track 6  Operate
    ↓
Track 7  Steward
```

⚠️ The arrows describe **narrative order**, ⛔ not authorization. Authorization is §1.

📌 **Ladder reconciliation (2026-08-06).** As authored, this charter carried a **six-track** ladder ending at *"Track 6 Production use"* — correct for the scope known at the time. The ladder was later extended to **seven** tracks and Track 6 renamed **Operate**: see [`TRACK_PROGRESSION_AND_TRACK_5_INHABIT`](TRACK_PROGRESSION_AND_TRACK_5_INHABIT_2026-08-06.md) §1, [`TRACK_6_OPERATE`](TRACK_6_OPERATE_2026-08-06.md), and [`TRACK_7_STEWARD`](TRACK_7_STEWARD_2026-08-06.md). ⭐ Only the displayed ladder above was updated — ⛔ no Track 3 ruling, scope, or authorization in this charter is changed by this note.

## 1. ⭐⭐⭐ The governing rule — dependency-based authorization

Founder ruling on process, 2026-08-06. The earlier formulation was phase-based:

> ⛔ ~~"Track 3 begins after Track 2."~~

It is replaced by:

> ⭐ **"Each Track 3 workstream begins when its own prerequisites are satisfied."**

⭐ **Why the stronger rule.** Track 3 is not a single gate; it is a set of workstreams with
**truthfully independent** constitutional dependencies. A single gate is wrong in both directions at
once, and prevents neither error:

| Error | What a coarse gate does |
|---|---|
| **Waiting unnecessarily** on work that is already constitutionally grounded | ⛔ blocks it anyway — the rendering harness and adoption architecture sit idle behind rulings they do not need |
| **Quietly advancing** work whose governing rulings have not been made | ⛔ permits it — once the phase "opens," every workstream reads as authorized, including the four that would settle a Track 2 question by choosing a column |

⭐ **The evolution this records** — the same refinement the lane has made repeatedly, replacing one
coarse state with several truthfully independent ones:

```
sequential phases  →  collections of independently gated workstreams  →  prerequisite satisfaction
```

⛔ **Chronological order is no longer the governing principle.** Prerequisite satisfaction is.

⚠️ **§1 is necessary, ⛔ not sufficient.** It authorizes a workstream to *begin*; it says nothing
about what the workstream may *contain*. The second constraint is
[Outcome-Neutral Construction](../../canon/OUTCOME_NEUTRAL_CONSTRUCTION_2026-08-06.md) §3.2 — ⛔ an authorized
workstream may still settle an open ruling by construction.

## 2. The Track 2 rulings — state today

📌 **Superseded in part, 2026-08-09: Ruling 1 has been ratified** —
[`FOUNDER_RULING_1_COMMITMENT_AUTHORITY_2026-08-09.md`](FOUNDER_RULING_1_COMMITMENT_AUTHORITY_2026-08-09.md).
⛔ Rulings 2, 3, and 4 remain open, so every workstream gated on them stays blocked. ⚠️ The paragraph
below records the state **as authored on 2026-08-06** and is retained as history.

**As of 2026-08-06, none of the four rulings has been made.** No ruling document exists in the repo;
[Phase Record](PUBLISHING_PHASE_RECORD_2026-08-06.md) §4 still carries all four as open governance
questions. They are **sequenced, not parallel** — each supplies a premise the next needs:

| # | Ruling | Establishes | Depends on | State |
|---|---|---|---|---|
| **1** | Commitment Authority | the constitutional container — `relationship_spaces` or `practitioner_clients` | — | ⛔ open |
| **2** | Custodial Authority | the **fifth** authority source | 1 | ⛔ open |
| **3** | Attestation Governance | the two-authorship conflict | 1 | ⛔ open |
| **4** | Commitment Event Home | the append-only history's attachment point | 1, 2, 3 | ⛔ open |

⚠️ **Ruling 2 amends settled text.** [Permissions §3](PRACTITIONER_PUBLISHING_PERMISSIONS_2026-08-06.md)
states **four** sources — Authorship · Relationship · Declaration · Ratification — with *"Every
permission below derives from exactly one of these. Nothing else grants."* ⛔ Track 3 may not design
storage for a fifth source before ruling 2 exists; doing so is the silent constitutional change this
track exists to prevent.

## 3. ⭐ Workstream authorization table

| # | Workstream | Prerequisites | Kind | Status today |
|---|---|---|---|---|
| 1 | **Placement substrate** — object · identifiers · lifecycle · snapshot strategy · provenance · relations to Work and Commitment | rulings 1, 2, 4 | constitutional | ⛔ **Blocked** |
| 2 | **Work integration** — version model · supersession · snapshot refs · placement pinning | ruling 1 · Ontology §5 (⚠️ candidate answer, ⛔ not a ruling) | constitutional | ⛔ **Blocked** |
| 3 | **Authority implementation** — authority snapshot · instance storage · delegation refs · custodial-instrument refs | rulings 1, 2 · Event Spec §4 (R3) | constitutional | ⛔ **Blocked** |
| 4 | **Event implementation** — event schema · immutable rows · snapshot refs · authority refs · rendering inputs | ruling 4 (∴ transitively 1, 2, 3) · R1–R4 | constitutional | ⛔ **Blocked** |
| 5 | **Rendering harness architecture** — renderer registry · template registry · mutation harness · determinism | ⭐ **none of the rulings** — [Rendering Conformance](PRACTITIONER_PUBLISHING_RENDERING_CONFORMANCE_2026-08-06.md) §1–§2, §7 is authored | — | ✅ **Open** (⚠️ bounded, §3.2) |
| 6 | **Adoption architecture** — member-linkage workflow · Work ratification workflow · eligibility transitions | ⭐ **production measurement only** — Track 1 is complete | empirical | ✅ **Open** |

### 3.1 ⚠️ Two precisions against the working dependency table

Both are corrections of attribution, ⛔ not of the principle:

1. **"Commitment event home" is a Track 2 *ruling*, not a Track 3 workstream.** It is ruling 4, and
   it depends on rulings 1, 2, and 3 — ⛔ not on ruling 1 alone. The Track 3 workstream it authorizes
   is **event implementation** (row 4 above). Listing both "commitment event home" and "event ledger"
   as workstreams double-counts one workstream and imports the ruling into the track it gates.
2. **Authority implementation depends on rulings 1 *and* 2**, ⛔ not ruling 2 alone. Ruling 2 itself
   depends on ruling 1 — *you cannot define what bypasses commitment-relative jurisdiction until the
   commitment is fixed* (Implementation Map). The dependency is transitive and should be written that
   way, so the workstream is never read as unblocked by ruling 2 in isolation.

⭐ **Work integration (row 2) was absent from the working table** and is restored here: it is
constitutionally gated, and its only current answer — Ontology §5 — is explicitly labelled a
candidate, not a ruling.

### 3.2 ⚠️ Workstream 5, bounded precisely

Rendering Conformance §1's enforcement architecture, §2's template grammar, and §7's mutation matrix
depend on **none** of the four rulings — they are mechanism. But §3's **binding table** names event
types whose home is ruling 4.

> ⭐ The **harness** is designable now. The **bindings** are not.

⛔ A rendering architecture that ships a populated binding table has silently made ruling 4.

📌 ⭐⭐ **This is a second, independent constraint** — generalized as
[Outcome-Neutral Construction](../../canon/OUTCOME_NEUTRAL_CONSTRUCTION_2026-08-06.md) (ratified 2026-08-09). §1 gates
**when a workstream may begin**; that instrument gates **what an authorized workstream may contain**.
⛔ Workstream 5 shows the gap is real: it passes §1 and can still decide ruling 4 by construction.
⛔ Every open workstream is subject to both.

### 3.3 ⭐⭐ Workstreams 5 and 6 are the only work available today — and 6 unblocks the rest

The Implementation Map established that the four rulings settle **two** of the four Track 3
blockers. The other two are adoption and lifecycle problems — ⛔ not rulings, ⛔ not schema:

| Blocker | Settled by Track 2? | Measured state (SHA `b1399f693`) |
|---|---|---|
| 1 — Identity linkage | ⛔ no | 1 of 13 `practitioner_clients` rows carries `member_id`; `relationship_spaces` has 0 rows |
| 3 — Eligible Work corpus | ⛔ no | 0 of 2,228 Works ratified |

⭐ **No ruling can satisfy either.** They are empirical conditions, and under dependency-based
authorization they were never gated on Track 2 at all. ⛔ Holding them behind a phase boundary
delayed the only work in this lane that was already permitted.

⚠️ **Scope limit, so "open" is not read as "build."** Workstream 6 authorizes **design of the
adoption architecture** — ⛔ not adoption tooling, ⛔ not the linkage or ratification runs themselves.
Those are Tracks 4–5.

## 4. ⭐⭐⭐ The traceability instrument

> **Every Track 3 design decision must trace upward to exactly one Track 2 ruling (or an earlier
> ratified invariant), and downward to exactly one implementation responsibility.**

Two failure modes, ⛔ not interchangeable:

| Symptom | Diagnosis | ⭐ Required response |
|---|---|---|
| cannot point upward to an authorizing ruling | it is **inventing governance** | ⛔ stop — refer to Track 2; a founder act, never an engineering decision |
| cannot point downward to an implementation responsibility | it is **modeling for its own sake** | ⛔ cut it — the model is not the deliverable |

⭐ **Enforcement is documentary, not automated.** Every Track 3 deliverable carries a traceability
table with two columns — *authorizing ruling* and *implementation responsibility satisfied*. A row
with a blank in either column does not ship.

📌 **This instrument is general, not publishing-specific.** Founder observation, 2026-08-06: it forces
every design to answer two questions that are routinely conflated — *why is this permitted?* and
*who is responsible for making it real?* Hoisted as a canon **candidate**:
[`AUTHORIZATION_AND_RESPONSIBILITY_TRACE_2026-08-06.md`](../../canon/AUTHORIZATION_AND_RESPONSIBILITY_TRACE_2026-08-06.md).
⛔ Candidate only — ratification is a founder act and is ⛔ not performed by this charter.

⭐ **Its complement** is [Outcome-Neutral Construction](../../canon/OUTCOME_NEUTRAL_CONSTRUCTION_2026-08-06.md):
the trace catches a decision citing **no** ruling; that instrument catches one citing a ruling **that
does not exist yet**. ⛔ A traceability table can be fully populated and still encode an unruled
outcome — the citation is to ruling 4, and ruling 4 is open.

## 5. Deliverables

Eight documents. Each carries the §4 traceability table.

| Deliverable | Workstream | Authorized today? |
|---|---|---|
| Placement implementation architecture | 1 | ⛔ no |
| Work version architecture | 2 | ⛔ no |
| Authority snapshot architecture | 3 | ⛔ no |
| Commitment event architecture | 4 | ⛔ no |
| Rendering architecture | 5 | ⚠️ harness only — ⛔ no binding table |
| Adoption architecture | 6 | ✅ yes |
| Migration dependency graph | cross-cutting | ⛔ no — its inputs are workstreams 1–4 |
| Implementation sequencing | cross-cutting | ⛔ no — same |

⛔ The last two are **ordering documents**, not migrations. A dependency graph names what must exist
before what; it does not author DDL.

## 6. ⛔ What Track 3 refuses, in every workstream

⛔ UI polish · ⛔ features · ⛔ workflows · ⛔ product behavior · ⛔ coaching experience ·
⛔ implementation shortcuts · ⛔ migrations · ⛔ code · ⛔ any ruling reserved to Track 2 ·
⛔ remediation of the measured substrate gaps.

⭐ Those belong to Tracks 4–6, or to the founder.

## 7. Success criterion

> **Every constitutional object has one — and only one — implementation home, and every
> implementation element traces back to a constitutional ruling.**

Complete when the correspondence is total:

```
Constitution → Domain Model → Implementation Architecture → (subsequent) Schema → Code
```

⭐ *One and only one* is the load-bearing clause. Two implementation homes for one constitutional
object is the drift this track exists to prevent — the point at which the architecture begins
competing with the constitution instead of realizing it.

⚠️ **Under dependency-based authorization, completion is also per-workstream.** ⛔ There is no single
"Track 3 is done" moment; there are six, each satisfied when its deliverable's traceability table has
no blank cells.

## 8. ⛔ Not authorized by this document

⛔ Any of the four Track 2 rulings · ⛔ schema, migration, code, route, UI · ⛔ lifting the Ontology's
implementation block (a founder act) · ⛔ ratification of any candidate instrument, including the
traceability canon candidate · ⛔ starting workstreams 1–4 · ⛔ workstream 5's binding table ·
⛔ adoption *tooling* or adoption *runs* under workstream 6.

---

**Sources:** [Implementation Map](PRACTITIONER_PUBLISHING_IMPLEMENTATION_MAP_2026-08-06.md) §"Next
work" / §"Track 2 — ruling order" / §"Track 3 begins only after all four" ·
[Phase Record](PUBLISHING_PHASE_RECORD_2026-08-06.md) §4–§6 ·
[Substrate Verification](PRACTITIONER_PUBLISHING_SUBSTRATE_VERIFICATION_2026-08-06.md) (Track 1) ·
[Ontology](PRACTITIONER_PUBLISHING_ONTOLOGY_2026-08-06.md) §5, §9 ·
[Permissions](PRACTITIONER_PUBLISHING_PERMISSIONS_2026-08-06.md) §3 ·
[Event Specification](PRACTITIONER_PUBLISHING_EVENT_SPECIFICATION_2026-08-06.md) §4, §8 ·
[Rendering Conformance](PRACTITIONER_PUBLISHING_RENDERING_CONFORMANCE_2026-08-06.md) §1–§3, §7.
