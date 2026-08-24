# JARVIS Agent Experience Memory — preserved directive

> ## ⚠️ NAMING RECONCILIATION — founder correction, 2026-08-24
>
> This document was authored as a standalone `JEM-00…JEM-18` programme. **That was
> wrong.** There is one JARVIS ladder, and units belong to it:
>
> | governing unit | was recorded as | status |
> |---|---|---|
> | **JARVIS-00** — canonical runtime/repository binding | JEM-00 | COMPLETE — `docs/ops/JARVIS_00_BINDING_PROOF_2026-08-24.md` |
> | **JARVIS-01** — existing-system census | JEM-01 | COMPLETE — `docs/census/JARVIS_01_*` |
> | **JARVIS-02** — Deep Agents / LangGraph evaluation | — | COMPLETE — `docs/evaluations/JARVIS_02_DEEP_AGENTS_EVALUATION_2026-08-24.md` |
> | **JARVIS-03** — outside graph machinery | — | not started |
> | **JARVIS-04** — outside memory machinery | — | not started |
> | **JARVIS-05** — smallest final architecture | — | not started |
>
> ⛔ **The `JEM-02 … JEM-18` sequence below is DE-AUTHORIZED as a programme.** No
> parallel memory programme is to be created. Its *content* is preserved as
> design input to **JARVIS-04/05**, where any outside memory machinery must beat
> the substrate JARVIS-01 found — not as a ladder to be executed.
>
> ⛔ Two code artifacts still carry the old label and are **deliberately not
> renamed**: `scripts/builder/jarvis-binding.mjs`'s `JEM-00` header comment and
> `scripts/builder/__tests__/jem-00-binding-proof.mjs` (wired into
> `npm run jarvis:proof`). Renaming working, proven, CI-wired code for a labelling
> correction buys nothing and risks a break. The mapping above is the record.
>
> ⚠️ **This ladder exists only in founder direction.** No document in this
> repository defines `JARVIS-00…05`; the table above is the first written record
> of it. If a master directive exists elsewhere, it should supersede this table.

---

## ⭐ Preserved hypothesis for JARVIS-04/05 — falsifiable, NOT implemented

From the JARVIS-01 census, accepted as the canonical baseline:

> **JARVIS may not need a new memory system. It may need a retrieval, derivation,
> promotion, and recall path over mechanisms that already exist.**

Carried alongside it, also as hypothesis and **not** canonized:

```text
AIN_HOME   machine-local operational history — raw runs, transient state, high-volume events
     ↓ promotion
.ain/      portable, project-bound, versioned knowledge — decisions, established
           facts, validated patterns, possibly skills and durable project state
```

*Experience happens locally; validated knowledge becomes portable.* JARVIS must
prove the existing architecture supports that reading before it is ratified.

**Consequence for JARVIS-04:** TencentDB / AIVM / Semantica are no longer default
candidates to *be* JARVIS memory. They must beat or complement an existing
substrate that already implements eight epistemic statuses, evidence standing,
correction anatomy, supersession, and CI-adjudicated claim promotion.

---

## Original directive (preserved below as design input)

**Authored:** 2026-08-24. **Not a programme.** Content for JARVIS-04/05.

---

## Governing sentence

> **MAIA remembers the person. JARVIS remembers the work. AIN governs what may become context.**

## Mission

Build a durable **Agent Experience Memory** system for JARVIS so that future runs begin from verified prior understanding rather than repeatedly reconstructing the same project state.

Informed by concepts demonstrated by TencentDB Agent Memory — persistent agent memory, reusable skills, project wiki, code graph, scenario/project-state memory, selective context retrieval, context/token reduction, agent-specific memory assets.

**Constraints on that influence:**

- Do not adopt TencentDB wholesale.
- Do not replace MAIA memory.
- Do not create a second Soullab memory architecture.
- Do not duplicate existing JARVIS primitives.

JARVIS must first discover what Soullab already possesses and then implement only the architectural delta.

---

## I. Architectural boundary

Three distinct planes.

**MAIA — human continuity memory.** Conversations and episodes, semantic claims, relationships, developmental patterns, psychological and symbolic material, somatic material, breakthroughs, changes, contradictions, corrections, personal continuity, meaning. *This program MUST NOT migrate, rewrite, replace, or flatten MAIA memory.*

**JARVIS — agent experience memory.** Project and repository knowledge, procedures, skills, architecture, operational decisions, previous investigations, known failures, successful remedies, validation protocols, code relationships, work history, build/deploy knowledge, project state, reusable execution patterns. *This is the implementation target.*

**AIN — context and authority broker.** Who is requesting context, purpose, eligible memory, authority, scope, provenance, privacy, temporal validity, retrieval depth, cross-boundary access. *Do not make JARVIS the authority over human memory.*

## II. Governing principle

The objective is not *remember every conversation*. The objective is **turn verified experience into reusable competence** — JARVIS becomes progressively more capable because previous successful work leaves durable operational structures behind.

## III. Gate 0 — canonical runtime and repository binding

No memory architecture gets built on an unbound runtime. Before any memory feature: determine the repository root JARVIS is actually bound to; verify the runtime can resolve it after restart; verify work-packet routing against it; verify read-only execution; verify worktree/claim mechanisms; verify result persistence; verify existing runtime state; record evidence.

Repository identity may **not** be inferred from shell working directory, comments, documentation, UI labels, or stale configuration. Establish it from runtime behaviour and configuration.

**Acceptance:** a bounded C1 task can resolve the canonical repository, read it, execute, produce evidence, and persist a result — across a restart. **STOP if this cannot be established.**

## IV. Existing-system census

Before building anything, a complete read-only census. Classify every relevant existing primitive as PRESERVE · RECONNECT · REPAIR · RECONCILE · CONSOLIDATE · COMPLETE · DEPRECATE · BUILD · HOLD.

Inspect: persistent runtime · work packets · result records · audit logs · Builder claims · worktrees · evidence · provenance · context routing · project state · repository introspection · skills/prompts · memory · code indexing · semantic search · documentation indexing · model routing · System Field/System Graph · Desktop surfaces.

**Rule: never implement a second version of an already-working primitive.** Produce a delta map before writing code.

## V. Memory Asset

A **Memory Asset** is a durable unit of reusable JARVIS knowledge, sharing a common governance envelope: asset identity · class · owner · creator · source · provenance · evidence references · epistemic standing · authority scope · visibility · project scope · repository scope · created time · observed time · valid-from · valid-until · status · confidence where appropriate · supersedes · superseded-by · contradiction references · correction references · retrieval policy · version · content identity.

Do not force all classes into one undifferentiated schema. Shared envelope, class-specific bodies.

## VI. Asset classes

1. **Work Episode** — a completed or attempted piece of work: objective, project/repository, starting state, actions, files/components, decisions, result, evidence, validation, failures, unresolved issues, completion state. Raw episodes remain recoverable.
2. **Decision** — durable architectural/operational rulings, with provenance and supersession.
3. **Known Failure** — symptoms, causes, diagnostic path, affected environments, resolution where known, evidence.
4. **Skill** — a reusable capability derived from verified work; more than a prompt. Name, purpose, triggers, prerequisites, authority requirements, procedure, tools, hazards, STOP conditions, validation procedure, expected evidence, examples, version, provenance.
5. **Project Wiki** — durable project knowledge distilled from authoritative sources, retaining those sources. *Never turn summaries into unsourced truth.*
6. **Code Graph** — repository · package · directory · file · symbol · function · class · API · caller · callee · import · export · dependency · test · route · table. Answers: where is this implemented, what calls this, what does this call, what depends on this, what tests protect it, what may be affected. Prefer deterministic parsing over LLM inference.
7. **Project Scene** — compact current operational situation. Context, not canonical truth; stays linked to underlying assets.

## VII. Derivation and provenance

`episode → summary → skill/wiki/scene` must never destroy lineage. Every derived asset preserves references to its source evidence. The system must be able to answer **"why does JARVIS believe this?"** and return supporting evidence.

## VIII. Correction and cascade safety

When source information is corrected, contradicted, superseded, invalidated, deleted, or found erroneous, derived assets must be identifiable: *which higher-order memories depend on this source?*

Do not silently rewrite history. Preserve original state, correction, temporal relationship, supersession, current applicability. A corrected low-level fact must not leave an incorrect Skill, Wiki entry, or Project Scene silently active.

## IX. Learning pipeline

`OBSERVED → CANDIDATE → VERIFIED → PROMOTED → ACTIVE`, with `SUPERSEDED` · `REJECTED` · `STALE`. Only sufficiently validated experience becomes an active Skill or authoritative project knowledge.

## X. Skill distillation

After a successful episode, ask: was this likely to recur; was a reliable procedure discovered; were success conditions verified; are STOP conditions known; is it project-specific or general; does an existing Skill already cover it; should an existing Skill be updated instead. **Do not create duplicate Skills.** Modification preserves version history.

## XI. Context retrieval

Selective retrieval, not continuous replay. High-level to low-level: Project Scene → Decisions → Skills → Wiki → Code Graph section → Work Episodes → source evidence. Retrieve deeper only when necessary. Budgets: maximum memory count, character/token budget, retrieval timeout, relevance threshold, evidence depth. Models may request deeper evidence.

## XII. Context Packet

Bounded, containing only relevant knowledge: **Task** · **Current Scene** · **Relevant Decisions** · **Relevant Skills** · **Relevant System Knowledge** · **Known Hazards** · **Authority** · **Evidence Requirements**. The worker does not receive the entire historical corpus by default.

## XIII. Model independence

Models are temporary cognition; JARVIS owns durable learning. No memory asset depends on one model provider. Remain compatible with the existing lane architecture. Do not add automatic model orchestration merely to complete this program.

## XIV. Token and re-reading reduction

Instrument so the value is measurable: files repeatedly reread · context supplied · retrieval hit rate · repeated investigations · skills reused · wiki retrieval · code graph retrieval · work avoided · incorrect retrieval · stale memory incidents.

Do not optimize merely for lower token count. **Primary goal: equal or better correctness with less reconstruction work.**

## XV. TencentDB evaluation

External reference implementation and optional experimental sidecar. Not production-critical during initial implementation. For each capability classify: adopt · adapt · reproduce natively · already exists · reject · experimental. Evaluate Skills, Wiki, CodeGraph, memory hierarchy, retrieval, ACL/asset assignment, persistence, provenance, correction semantics, token/context behaviour. Any experiment uses non-sensitive JARVIS development material. **Never connect experimental Tencent memory to MAIA production human memory.**

## XVI. Security and authority

**Memory does not grant execution authority.** Remembering that a previous agent performed an action does not authorize repeating it. Maintain separation between knowledge · recommendation · capability · authority · execution. Existing JARVIS governance remains authoritative.

## XVII. Desktop integration

After the primitives are proven, expose read-only views: Memory · Skills · Project · Code · Decisions · Learning · Provenance. **Do not build polished UI before the underlying primitives are proven.**

## XVIII. Acceptance tests

Persistence · Skill reuse · Project continuity · Provenance · Correction · Supersession · Code intelligence · Bounded context · Isolation (JARVIS operational memory does not leak into MAIA human memory) · Authority · Restart continuity · Non-duplication.

## XIX. Execution method

Each bounded unit: orient → verify current repository/runtime state → declare intended delta → claim appropriate scope → implement only that delta → test → independently verify where required → persist evidence → release claim/worktree → report completion → **STOP**. Do not silently continue into the next major unit.

## XX. Build sequence — ⛔ DE-AUTHORIZED as a programme (preserved as design input)

*See the naming reconciliation above. These are not units to execute.*


| Unit | Scope | Status |
|---|---|---|
| ~~JEM-00~~ → **JARVIS-00** | Canonical repository/runtime binding | **COMPLETE** — `docs/ops/JARVIS_00_BINDING_PROOF_2026-08-24.md` |
| ~~JEM-01~~ → **JARVIS-01** | Existing-system census | **COMPLETE** — `docs/census/JARVIS_01_ARCHITECTURE_MAP.md` + `JARVIS_01_CENSUS.json` (42 mechanisms) |
| JEM-02 | Delta architecture and Memory Asset contract | ⛔ de-authorized — folded into JARVIS-04/05 |
| JEM-03 | Work Episode + Decision + Known Failure persistence | not started |
| JEM-04 | Provenance and derivation graph | not started |
| JEM-05 | Correction/supersession/cascade semantics | not started |
| JEM-06 | Skill registry and lifecycle | not started |
| JEM-07 | Skill distillation from verified episodes | not started |
| JEM-08 | Project Wiki | not started |
| JEM-09 | CodeGraph | not started |
| JEM-10 | Project Scene | not started |
| JEM-11 | Context retrieval and budgeting | not started |
| JEM-12 | Bounded Context Packet generation | not started |
| JEM-13 | Learning promotion pipeline | not started |
| JEM-14 | Restart and recovery proof | not started |
| JEM-15 | Desktop read-only surfaces | not started |
| JEM-16 | TencentDB isolated comparison/experiment | not started |
| JEM-17 | Adversarial validation | not started |
| JEM-18 | Integrated readiness proof | not started |

## XXI. Final architectural test

A worker encounters a problem. JARVIS recognizes related work has happened before. It retrieves the relevant project state, applicable architectural decisions, a verified Skill, affected code relationships, and prior failure knowledge. It supplies a small bounded context packet. The worker performs the task. JARVIS independently verifies the result. The completed experience is persisted. Useful new knowledge is proposed for promotion. Verified knowledge becomes reusable.

**The next worker starts smarter than the previous one.**
