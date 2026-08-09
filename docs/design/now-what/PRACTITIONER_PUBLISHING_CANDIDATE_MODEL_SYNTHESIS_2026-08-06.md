# Practitioner Publishing — Consolidated Candidate Model — 2026-08-06

> This document consolidates the current candidate model derived from
> [`PRACTITIONER_PUBLISHING_AND_THE_PRACTICE_SPACE_2026-08-06.md`](./PRACTITIONER_PUBLISHING_AND_THE_PRACTICE_SPACE_2026-08-06.md).
> ⛔ **It does not ratify the model, erase its amendment history, or authorize implementation.**
> Where conflict exists, **the amendment record remains the provenance source** until founder disposition.

---

## 0. Status and provenance

| | |
|---|---|
| **Classification** | 🟡 **Cat 1 — preserved direction.** ⛔ Not authorized to build |
| **Substrate** | ⛔ **None.** No `studio_files`, no resource table, no share mechanism exists in the tree |
| **Implementation** | ⛔ **Blocked.** The Ontology's block lifts only by a **founder act** once the Event Specification is complete — ⛔ never as a consequence of a document existing |
| **Source** | the amendment record, 7 amendments, all 2026-08-06 |
| ⚠️ **Companions** | **This file was authored before reconciling against four existing artifacts in `docs/design/practitioner-portal/` — see §0a. They are more advanced than this synthesis assumed, and where they conflict, they win.** |
| **Canon depended on** | [`THREE_FIELDS_AND_THE_RELATIONSHIP_2026-08-06.md`](./THREE_FIELDS_AND_THE_RELATIONSHIP_2026-08-06.md) · [`PRACTITIONER_INFERENCE_CONTAINMENT_2026-08-06.md`](../../architecture/PRACTITIONER_INFERENCE_CONTAINMENT_2026-08-06.md) · [`INHABITABLE_ARCHITECTURE.md`](../INHABITABLE_ARCHITECTURE.md) · Sovereignty Invariants |
| **Function of this file** | a **stable referent** for the six-part domain-model artifact — the model as it now stands, not how it formed |

⚠️ **Why both documents exist.** The amendment record preserves *how the model was earned* — where distinctions were discovered, where earlier formulations were corrected, which concepts survived repeated pressure. That chronology is **evidentiary and must not be cleaned into this form.** This file exists only so the next artifact does not have to reconstruct which amendment superseded which phrasing.

⛔ **Consolidation ratifies nothing.** Anything that was a candidate in the source is a candidate here.

### 0a. ⚠️ Reconciliation notice — read before using this file

**[O] Observed 2026-08-06, after this synthesis was drafted.** Four companion artifacts exist in [`docs/design/practitioner-portal/`](../practitioner-portal/), authored in a parallel session sequence and **not consulted while drafting this file**:

| Artifact | Holds |
|---|---|
| [`…ONTOLOGY_2026-08-06.md`](../practitioner-portal/PRACTITIONER_PUBLISHING_ONTOLOGY_2026-08-06.md) | domain vocabulary, reconciled against real migrations |
| [`…PERMISSIONS_2026-08-06.md`](../practitioner-portal/PRACTITIONER_PUBLISHING_PERMISSIONS_2026-08-06.md) | Session 2 — four authority sources, principals, three substrate hazards |
| [`…EVENTS_2026-08-06.md`](../practitioner-portal/PRACTITIONER_PUBLISHING_EVENTS_2026-08-06.md) | Session 3 grammar + ⭐ **founder rulings R1–R4** |
| [`…EVENT_SPECIFICATION_2026-08-06.md`](../practitioner-portal/PRACTITIONER_PUBLISHING_EVENT_SPECIFICATION_2026-08-06.md) | the ledger record, fact language, visibility, supersession, erasure |

⛔ **Where this synthesis conflicts with those, they govern.** They are grounded in observed substrate; this file is a consolidation of conceptual direction.

**What that reconciliation already settles, which this file wrongly carried as open:**

| Was listed open here | Actually ruled |
|---|---|
| ledger selection | ✅ **R1** — separate publishing event ledger; ⛔ do not widen `member_field_note_events` |
| attestation's event shape | ✅ **R2** — a third authored act, ⛔ not a fifth object |
| authority instance at write time | ✅ **R3** — mandatory, **concrete instance not category**; ⛔ later role changes never retroactively authorize or invalidate |
| deliberate absences | ✅ **R4** — held; delivery infrastructure may record technical delivery separately, ⛔ never promoted into the publishing ledger |

**Substrate facts this file did not have:**

- ⭐ `relationship_spaces` (`20260701000001`) is the **authority container** for Placement.
- ⭐ **The gap is exactly one object** — `field_program_lessons.material_ids` has no FK and no direct-to-member path. **No Placement object exists anywhere in the schema.**
- ⚠️ **"Role" means eight different things** across migrations — ⛔ permissions cannot be keyed on `role`.
- ⚠️ **No delegation primitive and no organization entity exist** — the assistant and org hard cases have no floor and no rights-holder.

### Two nominations standing for founder ruling

1. **The governing pair** — §0/§17 of the source, consolidated in §1 below.
2. **Act · Fact · Record** — consolidated in §5 below.

### The unresolved erasure problem (carried, not solved)

If facts are irreversible and records preserve facts, ordinary `DELETE` semantics are constitutionally suspect — **and legal erasure obligations remain real.** ⛔ This is not a contradiction to smooth over; it is a design problem, and it is open. See §8 and §12.

### What materially changed during formation

Recorded so intermediate formulations are not mistaken for live ones:

| Changed | From → To |
|---|---|
| Object vocabulary | loose object list → **Work · Arrangement · Placement · Uptake** |
| Placement / Uptake | provenance relations → ⭐ **mirror acts** |
| The relationship | speculative object → **already-ratified Commitment container** |
| Placement modelling | single lifecycle enum → **type ⊥ state** |
| Attestation | *absent* → opened as a third act |
| Event dimensions | one axis → **recorded ⊥ visible ⊥ actionable** |
| Epistemic structure | *absent* → **Act · Fact · Record** |
| §0 and §17 | standalone observations → **a paired nomination** |

---

## 1. The governing pair

🟡 **Nominated together, never independently.**

| | Statement | Register |
|---|---|---|
| **A** | **The system does not organize information. It preserves intentional human acts.** | **teleological** — what the platform is *for* |
| **B** | **Acts create facts.** Every durable fact in the relationship traces to an authored act. | **generative** — *how* it fulfils that purpose |

**The design test:** *What authored act created this fact?* ⛔ No answer → the fact does not belong in the relationship's durable history.

⚠️ **Why paired.** A alone is a value statement — easy to affirm, and it tells no engineer what to refuse at a schema. B alone is a mechanism without a reason — and mechanisms detached from purpose get optimized away by whoever next finds them inconvenient. Each protects the other from its characteristic failure.

### ⭐⭐⭐ Falsifiability — what the pair forbids

⛔ A structure that fits every domain risks explaining nothing. The pair earns standing by its **refusals**:

| ⛔ Forbidden | Because |
|---|---|
| the **laundering chain** (§5) | a fact may not silently become a different fact |
| `expired` · practitioner-visible `viewed` (§8) | no authored act, therefore no fact |
| practitioner attestation read as member declaration (§5) | wrong author on the fact |
| promoting telemetry into relational history (§10) | machine observation is a different order of fact |
| `DELETE` as erasure semantics (§8) | records preserve facts; facts do not un-happen |

### ⚠️ Required scope boundary

The pair governs **facts admitted to the relationship's durable history** — ⛔ not all data the system may lawfully hold.

✅ Legitimately not act-derived: security audit logs (must exist *precisely because* no one authored the act) · delivery/technical telemetry · error and system-health records.

⭐ **Discriminator:** *does this fact enter the shared history two people will read as their story together?* If yes, an authored act must stand behind it. If it describes the machine, the pair is silent — ⛔ **but such a fact may never be promoted into relational history later**, since promotion launders derived into declared.

⛔ **The move this forecloses:** *"The system observed it, therefore the relationship knows it."* **It does not.**

---

## 2. The relational container

📌 **Pre-existing canon, not established here.** Per `THREE_FIELDS` §2:

- The **Relationship is a first-class object, conceptually above** clients · practitioners · sessions · keeps · programs.
- Refined the same day: **the primitive is a *shared developmental commitment***, with participants occupying **roles inside it**. "Practitioner" is a position held in one commitment, not a global identity.
- **Contents belong to the commitment**, not to either individual — *"which is why neither may unilaterally remove them and why neither owns the crossing."*
- ⛔ The user never sees this terminology. It is architectural.

⭐ **Publishing creates no container.** It contributes acts to one already ratified.

### The three fields

```
                Commitment
                     │
     ┌───────────────┼───────────────┐
     ▼               ▼               ▼
 Practitioner    Shared State     Client
    Studio                         Field
```

⛔ Neither party pulls from the other's field. Each may only **place into the shared one**. MAIA stewards continuity among the three **without owning any of them**.

### 🟡 Open — the commitment's own lifecycle

The ontological question is settled; this one is not: **does the commitment require its own state and event stream, or only ownership of contents?** Carried to §12.

---

## 3. Domain objects

| Object | Is |
|---|---|
| **Work** | authored content — a manual, video, worksheet, practice, reading, assessment, program, module |
| **Arrangement** | an **authored composition** of Works |
| **Placement** | the record of a practitioner act into a commitment |
| **Uptake** | the record of a member declaration |

⛔ **Commitment is pre-existing canon (§2), not a fifth publishing object.**

⚠️ **Vocabulary status: emerging.** `Work` and `Arrangement` are candidate names for what the source calls Objects and Collection. Renaming happens **once and completely** in the domain-model artifact — ⛔ never leaving two vocabularies in the tree.

### ⭐ Objects exist. Gestures move them.

```
Objects exist.        ← authored in the Practitioner Field, independent of any client
Gestures move them.   ← Share / Recommend / Assign relate an existing object
                        to one commitment
```

⛔ **A gesture never creates an object.** It authors, copies, duplicates, and owns nothing. One Work may be placed into many commitments; **each placement is its own act with its own provenance.**

Consequences: one revision serves all clients · authorship never fragments · *who authored* and *who placed* cannot be confused.

### Arrangement is not a folder

| | Folder | **Arrangement** |
|---|---|---|
| Removing an item | changes what is inside | ⭐ **changes what it means** |
| Order | incidental | authored |
| Authorship | none — a container | **the practitioner's, as a composition** |

*Difficult Conversations Starter Kit* · *Before Our Next Session* are publishable works in their own right, placeable as one act across many commitments.

⚠️ An Arrangement may not be silently partially delivered — a missing member is an **altered statement**, not a missing file.

---

## 4. Human acts

| Act | Author | Direction |
|---|---|---|
| **Placement** | practitioner | practitioner → commitment |
| **Uptake** | member | member → commitment |
| **Attestation** | practitioner | practitioner → commitment *(about the practitioner's own hearing)* |
| **Withdrawal** | practitioner (or org — §9) | changes availability **forward only** |
| **Ratification** | founder | governance; included because the structure applies to itself |

### ⭐⭐⭐ Placement ⊥ Uptake — the mirror

```
Placement:  practitioner → commitment     (an offer crosses)
Uptake:     member       → commitment     (a taking-up crosses)
```

Both are authored crossings performed by the party whose material it is. ⭐ **That symmetry is the consent-carried model expressed in the domain model rather than in policy.**

---

## 5. Act · Fact · Record

🟡 **Second nomination.** Three layers that must not be conflated:

| Layer | Example |
|---|---|
| **1. Act** | Larry places a Manual |
| **2. Fact** | that Manual entered this commitment through Larry's **Share** gesture, at this time |
| **3. Record** | the persisted event keeping the fact historically recoverable |

⛔ **The event row is neither the act nor the fact.** Conflating them is how durable history becomes a mutable log — edit the row and you appear to edit what happened. Separating them makes irreversibility mechanical: **the fact is irreversible; the record is merely how it stays recoverable.**

### Per act — what each may and may not create

| Act | Fact it legitimately creates | ⛔ Fact it cannot create |
|---|---|---|
| **Placement** | a Work entered this commitment, by this gesture, at this time | that the member received, read, or valued it |
| **Uptake** | the member took this into their own work | that the practitioner's framing was accepted |
| **Attestation** | ⭐ *that the practitioner recorded hearing something* | ⛔ *that the member declared it* |
| **Withdrawal** | availability changed going forward | that the placement never occurred |
| **Completion** *(if ever modeled)* | the member **declared** completion | that the member complied, progressed, or is ready |

### ⭐⭐⭐ The laundering chain — a failure class, not a bug

```
Larry writes  →  database stores  →  MAIA later reads  →  system renders "You said…"
```

⭐ **No single step is obviously wrong.** The error emerges from **cumulative promotion of one fact into a different fact** — which is why review of any individual step passes, and why the separation must be structural rather than remembered.

⭐ **What it protects is epistemic ownership**, not database normalization. *"Someone recorded hearing it"* may never become *"the person declared it."*

⭐ **Attestation needs no new object** — a practitioner-authored act creating a practitioner-scoped fact, expressible in Act · Fact · Record with the §7 relations. The urge to model *"what the member said"* as its own object is exactly the urge to refuse.

---

## 6. Placement grammar

Three gestures, distinguished by **the claim they make**, not by mechanics.

| Gesture | Claim | Client experience | Creates obligation |
|---|---|---|---|
| **Share** | *"I want you to have this."* | it is simply yours now | No |
| **Recommend** | *"This might help you right now."* | offered, not owned | No |
| **Assign** | *"I'm asking you to work with this."* | active practice | ✅ **from the practitioner, never from the system** |

### ⭐ Type ⊥ state — two axes, never one enum

| Placement **type** *(immutable, set by the act)* | Placement **state** *(mutable, by authored acts)* |
|---|---|
| Share | delivered |
| Recommend | delivered |
| Assign | accepted · declined · completed |

⛔ **Never `enum { shared, recommended, assigned, delivered, completed }`.** That collapse makes *"the same Work, Shared to A and Assigned to C"* unrepresentable.

### The Assign constraint

| ✅ Permitted | ⛔ Refused |
|---|---|
| *Larry assigned this.* | *The system is tracking whether Kelly complied.* |

✅ The system may **remember that something was assigned** — that is provenance. ✅ Whether the work was done is a subject **the practitioner may raise, in conversation.** ⛔ No completion scoring, streaks, adherence rates, ranking, nagging, or escalation. ⛔ Assignment state may not feed pattern detection or developmental inference. ✅ **Declining or ignoring is terminal without consequence.**

⭐ `accepted`/`declined` are meaningful **only for Assign** — requiring acknowledgment on a Share converts a gift into a task.

### 🟡 Held candidates — earned by evidence, never by symmetry

| Candidate | Claim | Why interesting |
|---|---|---|
| **Offer** | *"If you want this, it's available."* | ⭐ makes **no timing and no relevance claim** — sidesteps the §10 interpretation problem entirely |
| **Invitation** | *"When you're ready, I'd love you to explore this."* | neither ownership nor obligation, and unlike Recommend asserts **no present relevance** |

⛔ A fourth gesture may be added **only when it emerges from actual practitioner experience** — never because the model looks incomplete. **Symmetry is not evidence.**

---

## 7. Provenance relations

⭐⭐⭐ **Four constitutional relationships. ⛔ Not metadata. Non-collapsible from the first migration.**

| Relation | Means | Held by |
|---|---|---|
| **authored by** | this party made it | the Work |
| **shared / placed by** | this party placed it into *this* commitment | the Placement |
| **attributed to** | the system associated it with this party | ⛔ **never sufficient to act on** |
| **adopted by** | the member took it up as their own | the Client Field (Uptake) |

⚠️ This is the exact defect the containment ruling hit from the other direction: `studio_field_signals.source='practitioner'` recorded a *category* where a *provenance* was needed — nothing established whether a row was authored **by** the practitioner or attributed **to** them. ⛔ A publishing system that stores "practitioner-related" without storing which relation holds inherits that ambiguity at far greater scale.

⚠️ **`adopted by` is the one most easily lost.** It is a Client Field fact — ⛔ it does not travel back to the practitioner, and it does not convert the object into shared material.

### The three note types

| Type | Field | Visibility |
|---|---|---|
| practitioner's private notes | Practitioner | practitioner only — ⛔ never shared, never MAIA-readable |
| shared coaching notes | Commitment | deliberately shared; member may revisit, discuss with MAIA, reference |
| member reflections | Client | ⛔ **private by default**; member may share selected ones back |

---

## 8. State and historical truth

### Object lifecycle

📌 **Editorial reconciliation, 2026-08-06 — ⛔ not a design change.** An earlier draft of this file proposed a parallel vocabulary (`draft → published → superseded/withdrawn/archived`). **Production settled it:** `library_sources.review_status` is deployed and holds 2228 rows, all `uploaded`. The documentation converges on the **existing substrate vocabulary**; ⛔ changing it later would be a governance act, not an edit.

```
uploaded → processed → reviewed → ratified → archived
                                     ↘ de-ratified
                                     ↘ superseded (new version)
```

| State | Meaning |
|---|---|
| `uploaded` · `processed` · `reviewed` | authored, ⛔ **not yet placeable** |
| `ratified` | ⭐ **the composability gate** — available to Arrangement, Placement, and (subject to the unruled §7 crossing rule) MAIA. ⛔ Only the practitioner's own gesture ratifies |
| de-ratified | ⛔ no longer placeable; existing placements **not** silently revoked |
| `archived` | retired from active practice; history preserved |
| superseded | newer version exists; ⭐ **the link is provenance** — prior placements must still resolve to the version the member actually received |

⭐ De-ratification **never rewrites the past.** A member who received something did receive it.

⚠️ **Measured state:** ⛔ **0 of 2228 Works are ratified**, and `practitioner_member_id` is populated on 0 — so the population currently eligible for Placement is **zero**. See [`…SUBSTRATE_VERIFICATION_2026-08-06.md`](../practitioner-portal/PRACTITIONER_PUBLISHING_SUBSTRATE_VERIFICATION_2026-08-06.md) §2.3.

### Placement lifecycle

```
created → delivered → accepted | declined
                              ↘ completed
                              ↘ withdrawn
```

⛔ `completed` is **member-authored only** — never inferred from opening, viewing, dwell time, or elapsed days; never scored, ranked, or aggregated.
⛔ `withdrawn` retracts the placement; the member's own reflections on it **remain theirs**.

### ⭐⭐⭐ Human-authored transitions only

> **Time may be recorded. Deadlines may exist. State transitions happen because of authored human acts** — unless an exception is intentionally and explicitly decided.

*"Larry asked me to look at this before Thursday"* is a legitimate recorded fact. ⛔ What is refused is the system converting it, unasked, into *"the system now believes this obligation has lapsed."* Different claims, different authorities.

### ⛔ Telemetry states are absent from the model

**Named individually so their absence is a ruling, not an oversight** — silence invites reinvention:

| ⛔ Absent | Why |
|---|---|
| **`viewed`** · **`opened`** · **`downloaded`** | accuracy does not make a fact relationally neutral. A *"not opened"* signal becomes implicit accountability, engagement pressure, and a basis for inference about avoidance or readiness. ⛔ None may cross to the practitioner |
| **`expired`** · **`overdue`** | a time-based automatic state is the system acquiring an interest in compliance through the back door — deadline pressure **no human authored** |
| **inferred `completed`** | only the member may declare completion |

⭐ All six fail the §1 test identically: **no authored act, therefore no fact.** ⛔ They are not merely unbuilt — they are refused, and adding any one is a constitutional change, not a feature.

🟡 **`viewed` disposition:** at most (a) private member-side continuity or (b) technical delivery telemetry — ⛔ **each requiring its own stated purpose and retention boundary before existing at all.** ⛔ Neither crosses to the practitioner.

### ⛔ Destructive deletion refused

Permissions ask *who may act **now***. Irreversibility asks *what remains historically true **after every later act***. A person may lose access, a Work may be withdrawn, a commitment may end — **and the fact that a Placement occurred remains true.**

⛔ **No role, at any level, may make an act un-have-happened.** An organization may revoke a practitioner's access; it may not revoke the fact that they placed something.

🟡 **Open:** erasure obligations are real and must be met by a mechanism that does not require the history to have never happened. ⛔ Not solved by `DELETE`. See §12.

---

## 9. Jurisdiction

⭐⭐⭐ **Permissions are defined relative to the commitment — never as global platform roles.** This is the mechanical form of *"roles are held inside the commitment, not globally"* (§2), and it is what stops *organization* · *assistant* · *coach* · *member* becoming capabilities floating above the relationship in which authority actually exists.

### Six questions asked of every act

| | Question | Establishes |
|---|---|---|
| 1 | Who **authored** the underlying object? | §7 `authored by` |
| 2 | Who holds the relevant **role in this commitment**? | jurisdiction, not identity |
| 3 | Who may **perform** the gesture? | the act |
| 4 | Who may **observe that it occurred**? | ⭐ visibility, separable from the act |
| 5 | Who may **reverse or supersede** it? | §8 `withdrawn` / `superseded` |
| 6 | Which **historical fact remains irreversible**? | ⭐ what no authority may erase |

⭐ **Q4 and Q6 are what a conventional permission model omits — and why this cannot be an ACL.** Performing, seeing, and undoing are three different authorities; Q6 asserts some facts outlive all three. ⛔ A model that can express *"admin may delete"* without qualification has already violated it.

⭐ **Q6 is not a permission — it is a constitutional invariant**, belonging to the *declared ≠ derived* family, which is why it must be specified **alongside** permissions rather than inside them.

### Seed cases

1. Can an **assistant coach** Share?
2. ⚠️ Can an **organization withdraw** something a practitioner placed?
3. Can two practitioners **co-author** a Work?
4. ⚠️ Can a **member re-share** something they received?
5. Can a **supervisor inspect** a commitment?
6. ⛔ Can **MAIA place anything**? *(posture says no — §10 — but it must be ruled, not assumed)*

⚠️ Cases 2 and 4 are sharpest: both are crossings **the placing party did not perform**.

---

## 10. Event grammar

⛔ **Relationship events, not notifications.**

`session concluded` · `object placed` · `recommendation made` · `assignment requested` · `reflection shared` · `reflection kept private` · `manual revised` · `program begun` · `program completed (member-declared)` · `object withdrawn` · `invitation accepted`

⭐⭐⭐ **Admission test for every future event: every event is an authored occurrence — never a system inference.** ⛔ Nothing derived, scored, or noticed by the system is admissible.

### Session follow-up is a relational event

The unit is not *upload file · send worksheet · assign practice*. It is **"This was today's session."** Everything associated arrives as **one moment**, because that is how the member experienced it. ⛔ Implementation may not decompose a follow-up into independent deliveries that merely happen to be near each other in time.

### ⭐⭐⭐ recorded ⊥ visible ⊥ actionable

All four combinations are legitimate and must be expressible: recorded but **private** · recorded and visible but **inert** · recorded, visible and **actionable** · recorded and actionable **for one party**, invisible to another.

| Event | Recorded | Visible to practitioner |
|---|---|---|
| member viewed a resource | *maybe* (§8) | ⛔ **not ruled; presently no** |
| member Uptake | ✅ | only if **explicitly shared** |
| member private reflection | ✅ | ⛔ **no** |
| practitioner Placement | ✅ | ✅ |

⛔ **If these axes collapse, the event stream becomes surveillance rather than history.**

⭐⭐ **MAIA is the clearest test case.** Seeing a Placement grants **no authority** to recommend · interpret · re-place · withdraw · or act on it. **Visibility is not permission.**

### MAIA stays on the provenance side

| | Utterance | Status |
|---|---|---|
| ✅ | *"Larry shared this with you during your work together."* | **provenance** — factual, attributable |
| ⛔ | *"This is what you need right now."* | **interpretation** — unruled, refused pending founder ruling |

The first states a fact about an act. The second makes a claim about the member's present state — the same authority the containment ruling closed, direction reversed, constitutional question identical. ⛔ Until ruled: no contextual surfacing, no relevance ranking, no "recommended for you," no timing judgment about practitioner material.

### Deliberate absences

The sequence contains **no notifications · no analytics · no dashboards · no completion tracking · no engagement metrics.** ⛔ If any appear later, they must be derived from the ontology and justified against §1 — never imported because platforms usually have them.

---

## 11. Explicit exclusions

| ⛔ Excluded | Note |
|---|---|
| **folders as an organizing principle** | `Documents/Manuals/Week3/` is the warehouse failure mode. Standing invariant |
| **renamed hierarchies** | a hierarchy merely re-labelled (Programs → Modules → Weeks, nested lists) is the same violation in better vocabulary. **Test: does the member navigate a structure, or receive an act?** |
| **analytics / engagement telemetry** in relational surfaces | §10 |
| **the compliance engine** | scoring, streaks, adherence, escalation, read receipts (§6, §8) |
| **MAIA-created placements** | posture; ⛔ must still be ruled (§9.6) |
| **machine-authored relational facts** | §1 scope boundary |
| **implementation before Permissions and Events are complete** | §0 |

---

## 12. Open rulings

⚠️ **Corrected after the §0a reconciliation.** An earlier draft flagged three items as *"new at consolidation."* **That was wrong** — all three have provenance in the companion artifacts, and two were already **ruled**. The error is recorded rather than quietly fixed, because misattributing settled rulings as novel is precisely the drift this discipline exists to prevent.

| # | Open ruling | Provenance |
|---|---|---|
| 1 | **§0/§17 paired ratification** — the governing pair (§1) as canon | amendment record |
| 2 | **Act · Fact · Record ratification** (§5) as canon | amendment record |
| 3 | **Erasure vs. irreversible historical fact** (§8) | amendment record; ⭐ **in scope of the Event Specification** |
| 4 | **Operational / safety authority carve-out** — whether any act may bypass commitment-relative jurisdiction | ⚠️ Permissions places platform admin as *"operational only, never a publishing principal"* — the **carve-out boundary itself** is not stated |
| 5 | **Scope: Author Studio / broader publishing** — *coach publishing* or a general **AIN Publishing Grammar**? | source §14 watch item |
| 6 | **Commitment's own lifecycle and event stream** (§2) | amendment record |
| 7 | ⚠️ **Substrate gaps with no floor** — no delegation primitive, no organization entity, `role` means eight things | Permissions §1 hazards |

⛔ **Closed, not open — do not reopen:** ledger selection (**R1**) · attestation's act status (**R2**) · authority instance at write time (**R3**) · deliberate absences (**R4**).

⭐ **Test for #8, to be applied during implementation and not before:** does any rule here depend on the publisher being a practitioner? If none does, the layer exists and should be extracted (practitioner · organization · author · member). If several do, the generalization is false. ⛔ Do not extract speculatively — an abstraction built before its second instance is a guess.

---

## Next artifact

⚠️ **Superseded by the §0a reconciliation.** The six-part domain model is **already substantially authored** across the four companion artifacts — Ontology, Permissions, Events (R1–R4), Event Specification. ⛔ Do not re-author it here.

The next artifact is the **Practitioner Publishing Implementation Map** — the bridge between constitutional design and engineering. ⛔ Not schema, not code. For every concept: **Storage · Authority · Event · Rendering.**

⭐ **Its test:** if the map completes **without inventing new concepts**, the architecture is mature. If it cannot, the missing concepts reveal themselves as genuinely absent rather than imagined because the model *felt* incomplete.

⚠️ **Two rows are known to be unmappable now**, and that is the finding, not a failure: **Placement has no storage object anywhere in the schema**, and **Authority cannot be keyed on `role`** (eight meanings). The map should record these as gaps, ⛔ not resolve them by invention.

⛔ Implementation remains blocked; the block lifts only by founder act. ⛔ Consolidation ratified nothing.
