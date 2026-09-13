# JARVIS ORCHESTRATION CONTRACT — SPECIFICATION v0.1

**Lane**: `JARVIS-ORCHESTRATION-CORE-01`
**Date**: 2026-09-13
**Status**: ⛔ **CANDIDATE — NOT RATIFIED.** Every contract below awaits a founder act.
**Authorizes**: nothing. This is a specification, not an implementation warrant.

---

## 0. Two findings that must be read before §1

These were established by reading the repository on 2026-09-13. They are not
speculation, and they change the shape of the hierarchy contract.

### 0.1 🔴 `corpus` is already taken — and the existing one is system-scoped

`database/migrations/20260112000001_corpus_environment.sql` defines a live table set:

```
corpora · corpus_documents · corpus_chunks · corpus_ingestions · corpus_retrievals
```

`corpora` carries `slug` (`'commons.manuals'`, `'codebase.repo'`), `embedding_model`,
`chunk_strategy` — and **no member column**. It is a global retrieval namespace, not a
member's body of work. A third sense exists in `manifestation_corpus`, and a fourth in
the book-companion routes.

⛔ **The proposed CORPUS rung must not be built on `corpora`.** Attaching a member's
Work to a system-global retrieval namespace would place private material inside a shared
index by default — the inverse of the layer's purpose. This is the same shape as the
JARVIS-CIRCLES-01 finding that "Commons" denoted three different things and that two of
them carried mechanics the doctrine forbids. **Build the member-owned layer fresh; the
implementation term is chosen at ratification, not inherited.**

### 0.2 The CORPUS rung does not exist at all

Current production hierarchy:

```
members → member_manuscripts → manuscript_sections (manuscript_id, position, heading, body)
```

So **WORK ≈ `member_manuscripts`** and **MATERIAL ≈ `manuscript_sections`**, and there is
**no layer between MEMBER and WORK**. The four-rung hierarchy is therefore not a
re-description of what exists; it is one new rung plus a renaming of two that do.

*A lecture that belongs to the member but to no book has nowhere to live today.* That
absence is the substantive gap, and it is why "bring my 2024 lecture on grief into
consideration for this chapter" has no expressible form.

---

## 1. Hierarchy — MEMBER → CORPUS → WORK → MATERIAL

```
MEMBER          the person. Sole sovereign.
  ↓
CORPUS          the member's body of material. Owned, private, plural in kind.
  ↓
WORK            a bounded authored artifact (a book, an essay, a course).
  ↓
MATERIAL        human-created source: sections, notes, transcripts, sources.
```

**Contracts:**

- **H1** — Every unit of material belongs to exactly one CORPUS and to at most one WORK.
- **H2** — CORPUS membership is intrinsic. WORK membership is an **authored relationship**.
- **H3** — ⛔ **Corpus material does not automatically become Work material.** Admission
  is a member act, recorded, revocable. (Falsifier J7.)
- **H4** — A WORK may reference corpus material without absorbing it. The reference
  carries its own scope and can be withdrawn without altering the material.
- **H5** — Nothing at any rung is shared across members by default. There is no
  cross-member rung in this hierarchy, and none may be added by this lane.

**Open (CA-J1)**: whether CORPUS is singular per member or plural. §0.2 leaves it
undetermined and the answer changes the key shape. Do not assume.

---

## 2. `JarvisExecutionContext`

> ⛔ **SUPERSEDED IN PLACE by AMENDMENT A1 (2026-09-13)** — `JARVIS-ORCHESTRATION-CORE-01_AMENDMENT_A1_BOUND_WORK_SCOPE_2026-09-13.md`.
> Founder naming ruling: the primitive BP-3 requires is **`BoundWorkScope`**, not this envelope.
> `JarvisExecutionContext` is **reserved** for the later orchestration envelope and, if adopted,
> **MUST contain a `BoundWorkScope`**; the raw `memberId` / `corpusId` / `workId` fields below
> **may not substitute for it**. The section is kept as drafted, never as a current contract —
> *a bag of strings inside a nicer-looking object is still BP-3.*

Every flow receives the same non-optional envelope. This is the load-bearing type.

```ts
type JarvisExecutionContext = {
  invocationId: string;

  actorId: string;            // who is acting
  memberId: string;           // whose sovereignty governs
  corpusId?: string;
  workId?: string;

  authorizationScope: AuthorizationScope;
  permittedSources: SourceRef[];
  permittedOperations: Operation[];

  task: JarvisTask;
  contextManifest: ContextManifest;

  modelPolicy: ModelPolicy;
  retentionPolicy: RetentionPolicy;
  provenancePolicy: ProvenancePolicy;

  budget: ResourceBudget;     // §9
  workRevision?: RevisionRef; // §5
};
```

**Contracts:**

- **X1** — The signature is `capability.run(context, request)`. Never
  `capability.run(request)`. A capability that can be called without a context is a
  capability outside the boundary.
- **X2** — ⛔ **The context is not advisory.** A capability does not read
  `permittedSources` and choose to respect it. See §3.
- **X3** — Context is constructed only at the Jarvis gate, never by a capability, never
  by a model, never from model output.
- **X4** — `actorId` and `memberId` are distinct fields and must stay distinct. Every
  present case has them equal; the field exists so that the day they diverge is a
  decision rather than an accident.

---

## 3. Capability isolation — bypass must be structurally impossible

This is the most important engineering decision in the specification.

Capabilities receive **no database handle**. They receive scoped interfaces that already
carry the boundary:

```ts
ctx.work.read(...)
ctx.sources.search(...)
ctx.memory.retrieve(...)
ctx.graph.query(...)
```

- **I1** — A scoped interface cannot be widened by its holder. There is no parameter
  that reaches outside `memberId` / `corpusId` / `workId`.
- **I2** — A badly written capability must be *unable* to read another member's Work —
  not merely unlikely to. (Falsifier J1.)
- **I3** — Capability identity is declared, versioned, and closed. An unregistered
  capability does not execute.
- **I4** — ⛔ Sovereignty here is infrastructure, not policy. A comment, a prompt
  instruction, or a documented convention does not discharge I1–I3.

**Two precedents already in the repository — generalize these, do not reinvent them:**

| Precedent | File | What it proves |
|---|---|---|
| Unforgeable scoped handle | `lib/manuscript/development/bind.ts` (`bindEvidence` → `BoundEvidence`) | A capability can be handed authority it cannot fabricate |
| Closed registry + adjudication before entry | `lib/maia/canonical-turn/producerRegistry.ts`, `adjudicate.ts` | A closed producer set with participation decided *before* construction |
| Scope union, fails closed, confers nothing beyond its door | `lib/auth` lab-access pattern | Access gates that do not leak authority sideways |

The Jarvis boundary is the same contract at the Work layer. That materially lowers the
cost and raises confidence — the first implementation artifact is a reconciliation of two
working proofs, not a greenfield design.

---

## 4. Jarvis Flow Registry

Flows are **registered**, not improvised. Jarvis selects among known bounded cognitive
operations.

```
retrieval · concept_evolution · claim_verification · source_discovery
deep_research · developmental_read · whole_work_analysis · contradiction_sweep
voice_analysis · dependency_update · version_comparison · publishing
```

Each declares:

```yaml
flow: contradiction_sweep
input:        [work]
requires:     [claims, semantic_graph]
may_access:   [current_work, authorized_sources]
may_write:    [derived_analysis]
models:       { preferred: medium, escalation: frontier }
provenance:   required
whole_work:   false
incremental:  true
class:        compound          # §6
write_authority: derived        # §6
```

- **F1** — An unregistered flow does not execute.
- **F2** — A flow may not access what it did not declare. The declaration is the
  authorization, evaluated at the gate.
- **F3** — ⛔ A flow may not load Whole Work unless `whole_work: true` is declared.
  (Falsifier J2.)
- **F4** — A flow may not invoke a model class outside `models`. (Falsifier J4.)
- **F5** — The registry is a **named set**. Adding a flow is an act; a count is
  descriptive and never the gate. (FR-14 inheritance.)

---

## 5. Work state and change semantics

### 5.1 Work state is first-class

```
WORK
├── material · structure · claims · concepts · entities · themes
├── sources · relationships · decisions · versions · provenance
└── derived understanding
```

- **W1** — Understanding persists **outside** any model invocation. The model is not
  the memory.
- **W2** — Derived state is always labelled derived and always carries provenance (§7).
- **W3** — Derived state is never authored material. It may inform the member; it may
  never be presented as something they wrote.

### 5.2 Change and invalidation

Every meaningful edit emits:

```ts
WorkChanged {
  workId, materialId, revision,
  changedRange, previousHash, currentHash
}
```

The system then determines affected derived state and recomputes **only that**:

```
paragraph changed
  → claim C17 invalidated
  → embedding C17 · evidence C17 · relationships touching C17 stale
  → argument A3 potentially stale
  → contradiction results involving C17 stale
  → everything demonstrably unaffected: preserved
```

- **D1** — Invalidation is computed from declared dependencies, never guessed.
- **D2** — ⛔ Changing one paragraph must not trigger whole-manuscript recomputation
  unless dependency analysis demonstrates it is required. (Falsifier J6.)
- **D3** — Derived state created against revision *n* may never silently present as
  current after revision *n+1* invalidates it. Staleness is **visible**, never
  auto-resolved. (Falsifier J5.)
- **D4** — The system must be able to say what it still knows and what needs
  reconsideration. Epistemic honesty is the point of the mechanism, not a side effect.

### 5.3 🔴 OPEN-1 — claim identity under revision (**blocking**)

Invalidation assumes C38 is still C38 after the paragraph containing it changes. **That
primitive does not exist and is not trivially derivable from what does.**

WS2-07A deliberately refuses live offsets: evidence is frozen as
`(revisionNumber, code-point range, digest)` and `locateCurrent` is three-state, never
fuzzy. **That is correct for evidence** — a historical reading must not silently follow
edited text — **and insufficient for invalidation**, which needs a claim to survive its
own edit.

Two different questions, collapsed in the source discussion:

| Question | Requirement | Status |
|---|---|---|
| *What did this evidence point at, then?* | identity frozen at read time | ✅ built (07A) |
| *Is this claim still the same claim, now?* | identity stable under revision | ❌ absent |

⛔ Until OPEN-1 is answered, incremental Whole Work degrades to full reanalysis on every
meaningful edit — the exact cost the design exists to avoid. **OPEN-1 is the first unit
of work in this lane, ahead of any orchestrator code.** An answer must also state
honestly when identity is *lost*, not only when it is preserved.

---

## 6. Execution classes — two orthogonal axes

The source discussion proposed one axis (interactive vs compound). Latency is real but
it is not the axis that governs sovereignty. **Both are declared; neither implies the
other.**

### Axis A — latency class

- **INTERACTIVE** — completes inside the conversational loop. Retrieve a passage, recall
  a decision, find a concept, compare excerpts, exact source lookup.
- **COMPOUND** — an explicit job with its own lifecycle:
  `requested → scoped → planned → running → evidence collected → synthesis → verified →
  persisted → available`. Manuscript-wide analysis, major research, citation audit,
  developmental read, contradiction sweep, corpus evolution.

- **E1** — ⛔ Expensive work must never become an implicit part of an ordinary turn.
- **E2** — A compound job is member-visible, inspectable, and cancellable.

### Axis B — write authority

- **READ** — reads Work state, writes nothing.
- **DERIVED** — writes derived understanding, labelled and provenanced.
- **AUTHORED** — writes material. ⛔ **No Jarvis flow holds AUTHORED authority.** Only
  the member authors.

- **E3** — A fast flow that writes derived understanding about the author is more
  consequential than a slow one that only reads. Classification by write authority is
  therefore the governing axis; latency is a scheduling property beneath it.
- **E4** — Every registered flow declares both. A flow that declares neither does not
  execute.

---

## 7. Provenance

Every persisted Jarvis output answers: **what produced this?**

```
Result R391
  flow:          contradiction_sweep
  work_revision: EA-147
  inputs:        C18, C54
  sources:       Chapter 2 ¶18, Chapter 8 ¶41
  capability:    contradiction-analysis-v3
  model:         <route>
  created:       <ts>
  confidence:    <value>
  author_override: none
```

- **P1** — ⛔ A persisted analytical result without provenance is a failure, not a
  degraded success. (Falsifier J3.)
- **P2** — MAIA never says "I vaguely remember that your book contradicts itself here."
  She can state why the system believes it, or she does not state it.
- **P3** — `author_override` is first-class. The member's judgment outranks derived
  state permanently, and the override is itself provenanced.
- **P4** — Provenance is a record of derivation, never leverage. It is not used to
  argue with the member about their own work.

---

## 8. MAIA / Jarvis authority boundary

- **B1** — Jarvis returns **structured cognitive results**. It does not produce
  member-facing voice. (Falsifier J8.)
- **B2** — ⛔ Jarvis is not an alternate conversational personality and acquires no
  relational standing.
- **B3** — Jarvis coordinates intelligence; it does not accumulate it. A Jarvis that
  grows into a central super-agent has recreated the monolith one level up and is a
  defect against this section.
- **B4** — MAIA holds the relationship. The member's relationship is with MAIA, and
  nothing in this architecture creates a second thing to relate to.

---

## 9. Resource budgets

```ts
type ResourceBudget = {
  maxContextTokens: number;
  maxModelCost: number;
  maxToolCalls: number;
  maxWallTime: number;
  maxSources: number;
  escalationAllowed: boolean;
};
```

- **R1** — Every flow carries a budget. There is no unbudgeted execution path.
- **R2** — Escalation is deliberate, declared, and attributable — never a retry loop's
  emergent behaviour.
- **R3** — "Does this paragraph work?" must not be able to spawn frontier model × 50
  papers × whole manuscript × three agents × four retries.
- **R4** — Budget exhaustion returns a bounded, honest partial result. It never returns
  a confident result computed on truncated evidence, and never silently narrows scope.

---

## 10. Architectural falsifiers

**J1–J8 are the named set** (founder-specified). Each must be mechanically checkable.

| ID | Obligation |
|---|---|
| **J1** | **Tenant isolation** — retrieving Work B while executing as Work A fails structurally, not by convention. |
| **J2** | **Context economy** — a local question may not load Whole Work unless the flow declares `whole_work: true`. |
| **J3** | **Provenance** — a persisted analytical result without provenance fails. |
| **J4** | **Model routing** — a flow cannot invoke an undeclared model class. |
| **J5** | **Revision awareness** — derived state created against revision 12 cannot masquerade as current after revision 13 invalidates it. |
| **J6** | **Incrementality** — one changed paragraph does not trigger complete recomputation unless dependency analysis demonstrates it is required. |
| **J7** | **Corpus boundary** — corpus material cannot automatically become Work material. |
| **J8** | **MAIA/Jarvis separation** — Jarvis returns structured results and does not become an alternate conversational personality. |

### Proposed additions — ⛔ NOT in the named set; each requires a founder act

| ID | Obligation | Why proposed |
|---|---|---|
| **J9** | **Identity honesty** — when claim identity cannot be preserved across a revision, the system says so; it never silently substitutes a new claim for an old one. | Without it OPEN-1 can be "solved" by a fuzzy matcher that quietly relabels, and J5/J6 would both still pass. |
| **J10** | **No authored writes** — no flow, under any budget or escalation, writes authored material. | §6 E-axis states it; nothing currently falsifies it. |

**FR-14 applies**: PASS = zero failed **and** every required obligation present **and**
discharged by PASS. WARN / SKIP / MISSING never discharge.

---

## 11. Open questions carried to the founder docket

- **CA-J1** — CORPUS singular or plural per member? (§1)
- **CA-J2** — Implementation term for the member-owned corpus layer, given `corpora`
  is taken by a system-scoped retrieval namespace. (§0.1)
- **CA-J3** — OPEN-1: the claim-identity model under revision. Blocking. (§5.3)
- **CA-J4** — Do J9/J10 enter the named set?
- **CA-J5** — Does the Flow Registry subsume, extend, or sit beside CMT-01's producer
  registry? They are the same contract at two layers; whether they become one mechanism
  is a decision, not an inference.

---

## 12. Standing

**SPEC v0.1 CANDIDATE · NOTHING RATIFIED · CENSUS NOT STARTED · NO SCHEMA AUTHORED ·
NO MIGRATION · NO DEPLOY · NO ORCHESTRATOR BUILT · OPEN-1 BLOCKING.**

> *The Work is present. The writer acts. Jarvis is the boundary that makes that safe.*
