# Practitioner Publishing — Track 4: Implementation (Charter)

**Status: CHARTER.** ⛔ Authorizes nothing and starts nothing. It states the conditions under which
implementation may begin, the form implementation must take, and the acts it may never perform.
Founder-authored, 2026-08-06.

⭐⭐⭐ **Tracks 1–3 are about thinking correctly. Track 4 is about building correctly.** The danger in
Track 4 is ⛔ no longer inventing ontology — it is **violating the rulings during implementation**.

---

## 1. Purpose

Implement the ruled architecture faithfully. The question is no longer *"what should the model be?"*
It becomes:

> ⭐ **Does every implementation faithfully realize a constitutional ruling?**

## 2. Preconditions

⛔ Track 4 may not begin until:

| | Precondition | State as of 2026-08-06 |
|---|---|---|
| ✅ | Track 1 measured production | complete — [`…SUBSTRATE_VERIFICATION_2026-08-06.md`](PRACTITIONER_PUBLISHING_SUBSTRATE_VERIFICATION_2026-08-06.md) (SHA `b1399f693`) |
| ✅ | Track 2 constitutional rulings ratified | ⛔ **open — 1 of 4 made** (⚠️ amended 2026-08-09; as authored: *all four unmade*). ✅ Ruling 1 [ratified](FOUNDER_RULING_1_COMMITMENT_AUTHORITY_2026-08-09.md); ⛔ Rulings 2–4 open, so this precondition is **unmet** ([map §Track 2](PRACTITIONER_PUBLISHING_IMPLEMENTATION_MAP_2026-08-06.md)) |
| ✅ | Track 3 implementation architecture complete | ⛔ **not begun** — gated on Track 2 |

> ⛔⛔ **If any constitutional ruling is still open: STOP.**
> **Implementation is not permitted to settle governance.**

⚠️ **Open refinement — this gate may be narrower than it reads.**
[Constitutional Implementation ⊥ Operational Adoption](TRACK_4_CONSTITUTIONAL_VS_OPERATIONAL_CANDIDATE_2026-08-06.md)
(candidate, founder 2026-08-06) proposes that **category-B adoption work** — which creates *governed
data*, ⛔ not constitutional facts — may run **in parallel** with Track 2, gated instead by:
*operational work is permitted only when it does not require answering an unresolved constitutional
question.* ⛔ **Not adopted** — until a founder act adopts it, the preconditions above stand unamended
and Track 4 **in whole** remains gated on Track 2.

## 3. Workstreams

### 4.1 Placement substrate
Implement the Placement object **exactly as Track 3 specified**.
Deliverables: schema · migrations · tests · repository · APIs.
⛔ **No UI.**

### 4.2 Authority implementation
Implement: authority snapshot · authority instance · delegation references · custodial mandate
references.
⛔ **No authorization shortcuts.** ⭐ Every act must resolve **exactly one** authority source.

### 4.3 Work versioning
Implement: Work revisions · supersession · snapshot pinning · placement references.
⛔ **No live pointers.**

### 4.4 Event implementation
Implement: commitment event ledger · immutable events · authority snapshot · rendering inputs.
⛔ **No rendering.** Only event persistence.

### 4.5 Rendering implementation
Implement the renderer described in
[Rendering Conformance](PRACTITIONER_PUBLISHING_RENDERING_CONFORMANCE_2026-08-06.md).
Requirements: deterministic · pure · total · **sole rendering path**.
⭐ **Mutation tests required.**

### 4.6 Adoption implementation
Implement identity linkage · Work ratification · eligibility — ⛔ **without changing governance.**

⚠️ ⭐ **The only workstream whose gating is under open question.** 4.1–4.5 instantiate constitutional
concepts and require Track 2 unconditionally; 4.6 creates **governed data** and may be separable — see
[the candidate refinement](TRACK_4_CONSTITUTIONAL_VS_OPERATIONAL_CANDIDATE_2026-08-06.md).
⚠️⚠️ **Amended 2026-08-09.** As authored: *"seeding `relationship_spaces` remains blocked — it **is**
Track 2 ruling 1."* ⭐ Ruling 1 is now made, so ⛔ that reason is superseded. **Seeding by backfill from
`practitioner_clients` is now prohibited outright** (Ruling 1 §2.1) — ⭐ a constitutional bar, ⛔ no
longer a procedural wait. ⭐ Seeding through a **genuine bilateral constituting act is permitted** and
legitimately persists a row (§5.1).

⚠️ **And 4.6's premise narrowed:** identity linkage no longer counts toward Placement eligibility —
see the [Implementation Map blocker-1 reclassification](PRACTITIONER_PUBLISHING_IMPLEMENTATION_MAP_2026-08-06.md).

## 4. ⭐⭐⭐ The four questions every PR must answer

1. Which **Track 2 ruling** authorizes this?
2. Which **Track 3 architecture** does this implement?
3. Which **production measurement** does this change?
4. Which **rendering conformance tests** are affected?

> ⛔⛔ **If those answers cannot be given: STOP.**

## 5. Forbidden

⛔ No PR may:

- introduce a new authority source
- infer member state
- bypass Placement
- widen existing ledgers
- reinterpret governance
- create telemetry that failed Gate 2
- replace constitutional wording with implementation convenience

## 6. Acceptance

⛔ **A feature is not complete because code exists.** It is complete only when:

- implementation matches architecture
- architecture matches rulings
- rulings match the constitutional model
- production verification passes
- rendering conformance passes
- mutation suite passes

## 7. Success criterion

⭐ **The implementation should be boring.** There should be ⛔ no architectural creativity left.
Every line of code should be traceable upward:

```
Code
    ↓
Track 3 Architecture
    ↓
Track 2 Ruling
    ↓
Constitution
```

⚠️ **If an implementation decision cannot be traced upward, it is almost certainly making governance
silently.**

## 8. ⭐⭐⭐ The implementation law

> **Implementation may specialize; it may never reinterpret.**

⭐ Emerged repeatedly across this lane. It means: if engineers encounter ambiguity while building,
⛔ they do **not** resolve it in code. They **stop, document the ambiguity, and return it to
governance**.

⭐ That preserves the discipline built across Tracks 1–3: **constitutional decisions remain explicit
acts rather than accidental consequences of implementation.**

---

## 9. Not authorized by this charter

⛔ Schema · migration · code · route · UI · any Track 2 ruling · remediation of any
[Phase Record §5](PUBLISHING_PHASE_RECORD_2026-08-06.md) prerequisite · lifting the
[Ontology](PRACTITIONER_PUBLISHING_ONTOLOGY_2026-08-06.md) implementation block — ⭐ a **founder act**.
