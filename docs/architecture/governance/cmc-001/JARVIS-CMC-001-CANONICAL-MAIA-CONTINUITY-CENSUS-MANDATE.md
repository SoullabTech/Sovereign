# JARVIS — CMC-001 — CANONICAL MAIA CONTINUITY CENSUS

| Field | Value |
|---|---|
| **Program ID** | `CMC-001` |
| **Program name** | Canonical MAIA Continuity Census |
| **Revision** | r2 (post-ruling R-1 … R-10 + R-1A/R-1B/R-1C + §XVIII correction) |
| **Status** | `AUTHORED / NOT AUTHORIZED` · `CENSUS_METHOD_NOT_FROZEN` · `NO_EXECUTION_AUTHORITY` |
| **Repository** | `github.com/SoullabTech/Sovereign.git` |
| **Canonical remote ref** | `refs/heads/clean-main-no-secrets` |
| **Referent SHA at custody determination** | `52a3b924b7cf52013c1c8b0d635359c2cad672fc` |
| **Custody path** | `docs/architecture/governance/cmc-001/JARVIS-CMC-001-CANONICAL-MAIA-CONTINUITY-CENSUS-MANDATE.md` |
| **Custody convention basis** | Sole demonstrated program-custody convention at the bound SHA (`docs/architecture/governance/crp-001/`, N=1). Followed as convention; **not claimed as universally established repository law.** |
| **Program independence** | CMC-001 is an explicit founder designation. It is **not** derived from repository adjacency and is **not** a phase, child, or amendment of CRP-001, MRC-001, MDR-001, MIR-001, or SG-001. |
| **Custody index** | CMC-001 maintains its own custody boundary. CRP-001's `CUSTODY-INDEX` does **not** govern CMC-001. No CMC-001 index is created by this object. |

---

## Mission

Establish, from authoritative evidence, the actual continuity/context architecture of the **canonical-live MAIA conversational path** before any hybrid-memory repair, consolidation, migration, or retirement is designed.

This is an **investigation and evidence program**, not an implementation program.

The governing design orientation is:

> **Not maximum recall, but right relationship to memory — remembering enough that the person is genuinely known, while allowing most memory to remain quietly supportive of what is happening now.**

Do not turn that orientation into an architectural conclusion. The evidence comes first.

---

# I. CURRENT AUTHORITATIVE STARTING STATE

All statements in this section are **registry-declared route contract at an inspected source referent**. Per §XXVI they are `route_status` claims carrying an `evidence_date`. None of them is a present-tense assertion about currently deployed production.

### `sovereign/app/maia/list`

`route_status: REGISTERED_CANONICAL_LIVE`

Recorded description:

> Primary sovereign chat ingress — all production surfaces

Registry records:

* frontend traffic audit confirmed production surfaces route here — `evidence_basis: REGISTRY_WITNESSED`
* `memoryHealthExpected: true`
* `atomsExpected: true`

### `sovereign/app/maia`

`route_status: REGISTERED_DORMANT`

Recorded description:

> Dormant predecessor to /list — superseded 2026-05-23

Registry records:

* 48-hour traffic audit found zero production hits — `evidence_basis: REGISTRY_WITNESSED`, `evidence_date: 2026-05-23`
* `memoryHealthExpected: false`
* `atomsExpected: false`

**This audit is historical.** It is not evidence that the route receives zero traffic at the currently deployed production referent. See §XXVI.

### `between/chat`

`route_status: REGISTERED_LIVE_SECONDARY`

Uses a different orchestration path and may still exercise mechanisms associated with `maiaOrchestrator` / `MemoryBundle`.

Do not infer that a subsystem is dead merely because the bare sovereign route is dormant.

Scope for CMC-001: **out of Phase-1 trace scope, retained for later capability extraction.** See §IX-A and §XXXIV.

---

# II. REFERENT DISCIPLINE

**This section is operative as the first action taken *after* explicit launch authorization under §XXXII.** It is not operative upon receipt, review, custody materialization, or freeze of this object.

Before launch, referent binding may occur only as part of an explicitly authorized review or custody action, and only within that action's stated scope.

Upon authorized launch, before tracing continuity behavior, bind the authoritative referent. Determine and record:

* repository
* branch/ref
* canonical remote ref
* inspected SHA
* route-authority registry location
* registry state at that SHA
* deployed production SHA, if independently obtainable
* whether inspected source and deployed production are proven identical

Do not classify source-tree behavior as `RUNTIME_OBSERVED` unless runtime/deployment evidence supports that classification.

A historical traffic audit recorded in the route registry is evidence, but it inherits the binding of that audit. Do not silently treat it as a fresh witness against today's deployment.

If the deployed referent cannot be bound, record:

`DEPLOYED_REFERENT_UNBOUND`

and continue static analysis only where legitimate.

---

# III. AUTHORITATIVE-SURFACE DISCIPLINE

For every material claim, derive it from the strongest available authority for that question.

* executable code outranks comments for branch behavior
* route authority registry outranks filename interpretation
* canonical remote refs outrank stale local refs for repository authority
* actual dispatch outranks nearby model abstractions
* runtime witness outranks static possibility for claims about what actually occurred
* structured producer state outranks serialized prose for claims about what information originally existed

Weaker surfaces may corroborate stronger evidence. They may not carry a stronger claim than they warrant.

If two surfaces disagree, stop the affected inference and resolve the authority conflict. Do not average contradictory evidence.

---

# IV. KNOWN FAILURE MODE

Previous investigation repeatedly encountered the same methodological error:

> A cheaper observation was substituted for the authoritative surface.

Examples included:

* comment over executable branch
* nearby Claude abstraction over actual DeepSeek dispatch
* local object/ref state over canonical remote authority
* route naming over explicit route authority

Treat this as a standing anti-pattern: `SURFACE_SUBSTITUTION`

When detected:

1. retract the unsupported claim;
2. identify the authoritative surface;
3. re-derive the claim;
4. annotate affected prior findings;
5. do not continue downstream reasoning from the stale claim.

This is a method error requiring retraction, not an evidentiary boundary failure requiring a stop.

---

# V. PRIMARY REFERENT

Begin the census from `sovereign/app/maia/list`.

Trace through its declared runtime contract, including `buildMaiaRuntimeContext`, and ultimately into `getMaiaResponse` and the actual final model assembly/dispatch path.

Do **not** begin from the dormant bare route.

Prior U001–U003 evidence concerning the bare route remains valid only within its demonstrated execution-path scope and may later be used for capability extraction. Do not generalize dormant-route findings to canonical-live MAIA.

---

# VI. FIRST QUESTION

Before attempting the complete contributor census, answer:

> **What does the canonical-live runtime contract preserve, and where does it flatten, transform, infer, truncate, synthesize, or discard meaning before MAIA receives it?**

Start with the continuity-bearing contributors already identified on `/list`, including but not limited to:

* conversational recall
* episodic recall
* atoms
* `relationalContext`
* `relationshipContext`
* any canonical-route memory health structure
* any other continuity contributor discovered from the runtime contract

`relationalContext` and `relationshipContext` are carried as **two named candidates**. Whether they are two contributors, one contributor under two names, or one derived from the other is a question for producer tracing (§XXXIV). It may not be resolved by assumption, and neither may be silently dropped.

Do not assume this list is exhaustive.

---

# VII. CONTRIBUTOR CENSUS

The final `maiaService` system-prompt assembly previously showed **33 contributors at one assembly site**, while `contextPrompt` is separately constructed.

That count is evidence about that assembly site, not a claim that the entire runtime contains exactly 33 context mechanisms.

For every contributor relevant to canonical-live MAIA, establish the following evidence record.

## Contributor Record

**Name** — exact runtime variable or field.

**Producer** — exact file/function producing it.

**Entry condition** — the executable condition under which it is populated.

**Upstream representation** — structured object, record collection, string, synthetic value, etc.

**Source substrate** — database rows, conversation turns, episodic records, semantic atoms, relationship memory, runtime state, symbolic calculation, policy, etc.

**Retrieval** — how candidate material is obtained.

**Selection** — ranking, filtering, deduplication, caps, thresholds, inference, or absence thereof.

**Transformation** — any summarization, synthesis, inference, aggregation or semantic transformation.

**Serialization** — exact function/location where structured state becomes model-facing representation.

**Truncation** — all relevant limits, slices, caps or character/token bounds.

**Source provenance** — whether durable source identity exists upstream.

**Surviving provenance** — what source identity remains after serialization.

**Synthetic identity** — any generated IDs that are not durable source identifiers.

**Trace identity** — any trace-local identifiers and their intended semantics.

**Temporal scope** — immediate turn / current session / episodic / longitudinal / derived pattern / other.

**Relational scope** — self / named relationship / member web / practitioner-client / generalized / other.

**Influence intent** — explicit / implicit / latent / mixed / unresolved.

**Visibility policy** — whether retrieved content may be surfaced to the person.

**Assertion warrant** — what the evidence licenses MAIA to state as fact, tentative interpretation, question, orientation, or nothing explicit.

**Assembly position** — where the contribution enters final context.

**Composition behavior** — whether it can coexist with other contributors and which ones.

## Evidence classification — five orthogonal fields

Evidence strength and route/runtime status are **different dimensions and may not share one enum.** Every record carries all five:

| Field | Permitted values | Meaning |
|---|---|---|
| `evidence_basis` | `STATIC_POSSIBLE` · `REGISTRY_WITNESSED` · `RUNTIME_OBSERVED` · `INFERRED` · `UNRESOLVED` | How the claim is known |
| `route_status` | `REGISTERED_CANONICAL_LIVE` · `REGISTERED_LIVE_SECONDARY` · `REGISTERED_DORMANT` · `UNREGISTERED` | Registry-declared status of the containing route |
| `observed_status` | `CURRENTLY_LIVE_OBSERVED` · `NOT_OBSERVED` · `OBSERVATION_PENDING_AUTHORITY` | Whether current bound runtime observation exists |
| `evidence_date` | ISO date | When the evidence was generated — **required** for `REGISTRY_WITNESSED` and `RUNTIME_OBSERVED` |
| `referent_binding` | remote ref + SHA, or `DEPLOYED_REFERENT_UNBOUND` | What the claim is bound to |

`CURRENTLY_LIVE_OBSERVED` requires a current bound observation. Registry status alone never establishes it.

Record exact supporting file/line evidence and relevant SHA.

---

# VIII. GOVERNING MEMORY QUESTION

Do **not** reduce this census to:

> Does this preserve an ID?

For every continuity-bearing contributor, ask instead:

> **What kind of influence is this contributor intended to have on MAIA's encounter with the person — explicit, implicit, or latent — and does the underlying system retain enough provenance to justify that influence?**

This is the governing census question.

---

# IX. PROVENANCE AND VISIBILITY ARE ORTHOGONAL

Treat this as a governing separation: `PROVENANCE ⟂ VISIBILITY`

A memory can legitimately have `visibilityPolicy: implicit` while retaining `sourceId: <actual durable source>`. There is no contradiction.

Do not interpret implicit memory as defective merely because it is not surfaced.

Do not "repair" implicit continuity by forcing MAIA to recite retrieved history.

A person's experience should tend toward:

> She knows me.

rather than:

> She has a dossier on me.

---

# IX-A. SCOPE OF `between/chat`

`between/chat` is `REGISTERED_LIVE_SECONDARY`. It must **not** be described as legacy, dormant, or dead.

It is **out of Phase-1 trace scope** and retained for later capability extraction.

If `/list` tracing reveals a dependency on `between/chat`, or shared behavior necessary to characterize `/list`, **stop and request scope expansion** rather than silently following it. Record the stop as `STOPPED_AUTHORITY_BOUNDARY`.

---

# X. INFLUENCE TAXONOMY

Use at least these distinctions unless evidence requires refinement.

## Explicit recall

Material MAIA may appropriately surface as remembered history — prior decisions, commitments, events, unfinished threads, or information the person reasonably expects MAIA to remember.

Explicit historical claims require strong source provenance and sufficient fidelity.

## Implicit continuity

Remembered material that may shape attention, tone, pacing, sensitivity, what does not need repeating, which possibilities receive gentle emphasis, and how MAIA understands the immediate exchange — without requiring the memory itself to be surfaced.

Implicitness is a legitimate capability. Loss of provenance in order to achieve implicitness is not.

## Latent orientation

Higher-order patterns or accumulated understanding derived across multiple encounters.

These may be highly valuable while being highly inferential. They therefore receive **less license to assert themselves as facts**, not more.

> **Depth of synthesis does not confer authority of assertion.**

A latent pattern may appropriately support:

> I wonder whether…

when the same evidence would not warrant:

> You always…

---

# XI. FOUR ORTHOGONAL QUESTIONS

For each contribution, keep these distinct:

**Provenance** — What warrants this contribution?
**Influence policy** — How may it shape the encounter?
**Visibility policy** — May its underlying content be surfaced?
**Assertion policy** — How strongly may MAIA claim what it implies?

Do not collapse these into a single `memoryType`, confidence score, or source ID.

---

# XII. KNOWN LEGACY EVIDENCE — DO NOT GENERALIZE

Previous work found multiple memory/context implementations, including:

* `lib/memory/MemoryOrchestrator.ts`
* `lib/maia/memoryOrchestrator.ts`
* `lib/consciousness/maiaOrchestrator.ts`
* FAST `recentContext`
* `MemoryBundle`
* `memoryInfluenceAddendum`
* `memoryContext`
* additional prompt addenda

Known examples include multiple serialization regimes with different truncation behavior and different identity semantics.

These are evidence about specific paths.

Do not treat them as one subsystem because their names resemble one another.

Do not assume that because one route is dormant, every mechanism reachable elsewhere through the same module is dormant.

---

# XIII. MEMORY INFLUENCE FINDING

Previous evidence found a mechanism that retained structured source/role information upstream and then serialized it into behavioral guidance resembling: *remembered direction should influence tone/pacing without surfacing prior content explicitly.*

Treat the capability and the defect separately.

* Potentially valuable capability: **implicit memory influence**
* Observed provenance problem: **structured source information was discarded during serialization**

Do not destroy the former merely to repair the latter.

---

# XIV. MERGE WHILE STRUCTURED — RENDER LAST

This is a target principle, **not yet an implementation authorization**:

> **Merge one level earlier, while context is still structured. Render as late as possible.**

Previous investigation showed that some contributors reach `maiaService` already serialized as strings. Therefore do not assume the eventual typed boundary can exist only at final assembly.

For each producer, determine the latest point at which its meaningful structure and provenance still exist. Record that point. **Do not modify it.**

---

# XV. RUNTIME CONTRACT

Inspect `maiaRuntimeContext` and determine what its declared contract actually guarantees.

Investigate the meaning and enforcement of `memoryHealthExpected: true` and `atomsExpected: true`:

* definition — where declared, with what type and default;
* validator/consumer — what code reads the field;
* CI/runtime enforcement — whether any check, test, or assertion depends on it;
* failure/degradation semantics — what constitutes healthy/unhealthy, what happens when expected memory capability is absent, and whether degradation is visible or silent.

Do not infer semantics from field names.

## Constraint — no induced failure

Determine absence and degradation behavior **statically, or from already-existing evidence** (existing logs, existing tests, existing telemetry, existing incident records).

Phase 1 permits **no failure injection, no production perturbation, no destructive test, no cleanup, and no deliberate capability suppression.**

Anything requiring induced failure becomes a **separately authorized test unit**. Record the requirement and stop; do not perform it.

---

# XVI. LIVE WITNESS

Static architecture and runtime observation are separate evidence classes.

When separately permitted and technically available, witness canonical-live behavior and record:

* deployed SHA or strongest obtainable deployment binding
* client surface
* endpoint reached
* runtime contract instantiated
* contributors populated
* contributors empty
* provenance-bearing structures before serialization where observable
* final contributor composition
* actual model dispatch
* degradation/fallback behavior as already observable — never as induced (§XV)

Do not expose private member content unnecessarily. A live witness must establish mechanics, not collect personal material.

> **§XXVII governs live-witness authority and witness-source preference and supersedes any wording in this section.** Nothing in §XVI authorizes a witness.

---

# XVII. CAPABILITY EXTRACTION — RECORD ONLY

During the census, you may discover mechanisms worth preserving. Record them as `CAPABILITY_CANDIDATE`.

Examples might include high-quality episodic retrieval, source-aware selection, semantic atom relevance, relational weighting, recent-session continuity, implicit influence, contradiction detection, memory health monitoring, useful deduplication, prompt economy, traceability.

Do not redesign or consolidate them during this loop.

The purpose is to prevent valuable mechanisms from disappearing merely because their containing legacy subsystem is later retired.

---

# XVIII. PRIOR HYBRID TARGET — ORIENTATION ONLY

A hybrid-memory target was previously authored during investigation but is **not bound to the canonical repository at the inspected referent and is not admitted as governing evidence for CMC-001.**

Its status for this mandate is:

**ORIENTATION ONLY / NOT CANONICALLY CUSTODIED / NOT AUTHORIZED**

CMC-001 must be capable of independently deriving, contradicting, narrowing, or rejecting any concept contained in that prior target.

**No executor is required to locate or consume that external draft.**

If a hybrid target is later admitted into canonical custody, that admission requires a separate explicit act and does not retroactively govern census findings.

## Dimensions carried as hypotheses only

The following dimensions are recorded as **questions the census may test**, not as requirements inherited from any absent document, and not as an established schema:

* kind
* source system
* durable source IDs
* trace identity
* temporal scope
* relational scope
* relevance
* confidence
* content
* provenance
* influence policy
* visibility policy
* assertion policy

The census must be capable of proving any of these incomplete, wrong, or unnecessary. **Evidence outranks the hypothesis set.**

---

# XIX. NO REPAIR / NO CONSOLIDATION

This loop is not authorized to:

rewrite memory systems · delete legacy paths · merge orchestrators · change prompt assembly · add IDs to serialized prose · create the canonical `ContextContribution` implementation · reroute production traffic · modify retrieval policy · modify ranking · modify truncation · alter model routing · retire dormant code · alter implicit/explicit behavior · migrate member data · modify database schema · change production configuration

If a defect is demonstrated, record it. Do not repair it unless a later authorization explicitly opens a repair unit.

---

# XX. NO PREMATURE CANONICALIZATION

Do not select a "winning" legacy memory implementation. The eventual hybrid may take different capabilities from different systems.

For overlapping mechanisms, record what each does, evidence of actual use, strengths, weaknesses, provenance quality, relational value, prompt cost, and failure behavior.

Do not declare one canonical merely because it is newer, richer, more structured, or currently live.

Current routing authority and future architectural merit are different questions.

---

# XXI. JARVIS SKILL DISCIPLINE

**A. Canonical Referent Binder** — Establish exactly what repository/ref/route/deployment a claim refers to. Never permit an unbound local referent to masquerade as canonical authority.

**B. Context Contributor Tracer** — Trace one final-context contributor backward to the earliest relevant structured producer and forward through serialization/assembly. One contributor at a time.

**C. Provenance Auditor** — Distinguish durable source identity, synthetic local identity, trace-local identity, identity-free prose, and inferred/synthesized patterns. Never treat these as interchangeable.

**D. Influence Classifier** — Establish whether a contribution operates explicitly, implicitly, latently, or in a mixed manner. Classification must come from behavior/code/contracts, not variable names alone.

**E. Runtime Witness** — Separate `CAN_EXECUTE` from `DID_EXECUTE` and record actual contribution on controlled requests when separately authorized.

**F. Capability Extractor** — Record mechanisms potentially worth carrying into an eventual hybrid. This role may nominate. It may not redesign.

---

# XXII. LOOP METHOD

Work in bounded units. For each unit:

1. state the exact question;
2. state the authoritative surface required to answer it;
3. bind the referent;
4. gather evidence;
5. distinguish observation from inference;
6. record contradictions;
7. classify evidence across all five fields (§VII);
8. update the census;
9. identify any capability candidate;
10. stop before architectural design.

Do not batch dozens of contributors if context quality begins degrading. Prefer a smaller number of fully evidenced traces over a large partially inferred inventory.

---

# XXIII. STOP CONDITIONS

Stop immediately if:

1. canonical-live routing authority changes;
2. inspected and deployed referents conflict;
3. a new conversational entry point invalidates the current topology;
4. an unenumerated context assembly site materially changes scope;
5. code contradicts a comment being used as evidence;
6. a supposedly single contributor resolves to multiple independent producers;
7. a provenance claim cannot be tied to its source;
8. runtime behavior contradicts static analysis;
9. investigation begins requiring architectural choice rather than behavioral characterization;
10. context degradation threatens evidence quality;
11. completing the next claim would require guessing;
12. an unauthorized write or side effect is discovered to have already occurred — including retrospectively.

On condition 12: **preserve the evidence, attempt no cleanup**, and report. Cleanup is itself a write and requires its own authority (§XXVII).

Report the stop condition precisely. Do not "finish the section" after the evidentiary boundary has failed.

---

# XXIV. REQUIRED ARTIFACTS

Maintain or create evidence artifacts sufficient to resume cold without conversational memory. At minimum preserve:

**Canonical route/referent record** — authority registry, inspected SHA, deployment binding status.

**Final context contributor census** — all identified contributors and evidence state across the five fields.

**Canonical continuity path map** — canonical `/list` path from client ingress through runtime context, producers, assembly, and dispatch.

**Provenance discontinuity ledger** — every demonstrated point where provenance is preserved, transformed, synthesized, conflated, stripped, or unavailable.

**Capability candidate ledger** — potentially valuable mechanisms discovered during tracing.

**Contradiction/correction ledger** — every significant retraction caused by stronger evidence.

Do not erase wrong earlier conclusions. Mark them superseded and preserve why.

---

# XXV. PROVISIONAL PROGRAM SEQUENCE

**This sequence is a roadmap authored by this object.** It is not evidence of an existing externally governed program, and it creates **no authority for Phases 2–10**. Each later phase remains contingent on evidence and separate authorization. No CRP/MRC/MDR/MIR/SG identity is implied.

Phases 5–8 presuppose a unified hybrid substrate. That presupposition is **conditional**: the census is permitted to falsify it. If the evidence does not support a unified substrate, Phases 5–8 do not follow.

### Phase 1 — Canonical Continuity Census · **THIS OBJECT'S SUBJECT**
Establish what exists and what canonical-live MAIA actually carries. Not open until launch (§XXXII).

### Phase 2 — Runtime Witness
Bind actual production behavior and distinguish possible from observed contribution. May overlap Phase 1 only where needed for evidence, and only under §XXVII authority.

### Phase 3 — Capability Extraction
Compare relevant canonical, dormant, and live-secondary mechanisms. Determine what is worth preserving.

### Phase 4 — Canonicalization
Define shared semantics for provenance, influence, visibility, assertion, temporal scope, relational scope, and identity.

### Phase 5 — Hybrid Architecture *(conditional)*
**If** the census supports a unified structured context/continuity substrate, design it.

### Phase 6 — Compatibility Layer *(conditional)*
Wrap existing producers before replacing them.

### Phase 7 — Shadow Validation *(conditional)*

After an eventual hybrid architecture and compatibility layer are separately authorized and implemented, compare legacy/canonical behavior with the candidate hybrid without changing the member-facing response path solely for the purpose of comparison.

Required properties:

* old and candidate paths remain distinguishable;
* provenance survives comparison;
* contributor-level differences are observable;
* implicit continuity is evaluated as implicit continuity, not merely by textual overlap;
* explicit recall fidelity is measured against durable sources;
* latent orientation is evaluated for restraint as well as usefulness;
* prompt/context cost is measured;
* failures and degradations are attributable to the responsible path;
* no shadow result silently becomes member-facing behavior.

Shadow validation is a future program phase. It is **not authorized by this census mandate.**

### Phase 8 — Incremental Cutover *(conditional)*

Move capabilities into a canonical hybrid, if one is established, only through separately authorized, bounded migration units.

Prefer `wrap → shadow → compare → prove → cut over` over `rewrite → replace`.

Each migration must preserve a reversible boundary until its acceptance evidence is complete.

### Phase 9 — Legacy Retirement

A legacy mechanism becomes eligible for retirement only after its relevant capability is:

1. identified;
2. represented in the canonical model where appropriate;
3. preserved or intentionally superseded;
4. tested against demonstrated behavior;
5. migrated;
6. independently shown unnecessary to remaining live surfaces.

**Dormant route does not mean dead module.** Do not delete a mechanism merely because its original ingress is dormant if another live surface still depends upon it.

### Phase 10 — Learning Loop

Only after a canonical substrate is established may JARVIS continuously evaluate retrieval quality, provenance integrity, continuity quality, relational usefulness, implicit influence quality, explicit recall fidelity, latent-pattern restraint, prompt economy, duplication, contradiction, degradation, and source coverage.

The learning loop must improve the canonical substrate rather than create another disconnected memory architecture.

---

# XXVI. HISTORICAL ROUTING EVIDENCE — REQUIRED QUALIFIER

The route registry's statement that `sovereign/app/maia` received zero production hits during a 48-hour audit is:

**`evidence_basis: REGISTRY_WITNESSED` · `evidence_date: 2026-05-23`**

It is **not** a fresh assertion that the route has received zero traffic at the currently deployed production referent.

Likewise, registry descriptions such as:

> Primary sovereign chat ingress — all production surfaces

are authoritative statements of the registered route contract at the inspected source referent. They do not independently prove that today's deployed production SHA matches that source referent.

Therefore distinguish `route_status: REGISTERED_CANONICAL_LIVE` from `observed_status: CURRENTLY_LIVE_OBSERVED` until deployment/runtime evidence binds them.

**This section supersedes any wording in §I that could be read as converting the historical traffic audit into a present-tense production observation.**

---

# XXVII. CONTROLLED LIVE-WITNESS AUTHORITY

**This section supersedes §XVI on live-witness authority and witness-source preference.**

A live witness may create conversation rows, memory rows, telemetry, traces, metrics, episodic artifacts, semantic atoms, relationship/context artifacts, and other durable or semi-durable runtime state.

Therefore:

> **LIVE WITNESS IS NOT READ-ONLY MERELY BECAUSE IT DOES NOT MODIFY SOURCE CODE.**

This census does **not** automatically authorize production writes for evidentiary convenience.

Static investigation may proceed without live-witness authority once this mandate is otherwise authorized.

Before any controlled production witness, establish separately:

1. the exact environment;
2. the test/founder identity being used;
3. the expected durable writes;
4. whether those writes can influence future MAIA behavior;
5. privacy implications;
6. cleanup requirements, if any;
7. whether cleanup itself would alter legitimate continuity;
8. the authority permitting the witness.

## Witness-source preference order

1. **Existing controlled founder/test traffic**, where sufficient to establish the required mechanics;
2. **Synthetic controlled traffic**, only when necessary *and separately authorized*.

Neither is authorized by this mandate.

## Perturbation and cleanup

**Perturbation is not witnessing.** Failure injection, deliberate capability suppression, and destructive testing are outside §XXVII entirely and require a separately authorized test unit (§XV).

**Cleanup is a write.** It requires its own explicit authority. Absent that authority, preserve state and report.

If no sufficiently safe witness exists: `LIVE_WITNESS_PENDING_AUTHORITY`

This does not block static census work unless a specific finding requires runtime evidence.

---

# XXVIII. PROGRAM IDENTITY AND AUTHORITY BOUNDARY

This object defines the investigative method for **CMC-001 — Canonical MAIA Continuity Census**, founded as an independent program by explicit founder designation.

It does **not**, by similarity of terminology or subject matter, establish that it is CRP-001, MRC-001, MDR-001, MIR-001, SG-001, a phase of any existing governance program, an amendment to another mandate, or authority inherited from another artifact.

Any such relationship must be established by explicit governing evidence.

Do not infer program identity from filenames, `CRP` terminology, memory, neighboring documents, prior conversational summaries, architectural similarity, apparent sequencing, or shared custody convention.

**Custody adjacency is not program identity.** CMC-001 residing beside `crp-001/` under a shared convention creates no relationship between them.

---

# XXIX. CURRENT STATUS OF THIS OBJECT

This object is **AUTHORED / NOT AUTHORIZED** unless an independently valid authority explicitly changes that state.

Completion of the text is not launch authorization.
Reading it is not launch authorization.
Recording it is not launch authorization.
Reviewing it is not launch authorization.
**Materializing it into canonical custody is not launch authorization.**
**Computing its digest is not launch authorization.**
**Freezing it is not launch authorization.**
The existence of an apparently executable procedure is not launch authorization.

No JARVIS executor may infer authorization from the imperative form of this document.

---

# XXX. REVIEW BEFORE FREEZE

Before this object becomes an executable census mandate, perform one bounded consistency review of the complete object.

The review asks only:

1. Is the object complete?
2. Are internal authority boundaries consistent?
3. Does any section accidentally authorize behavior another section prohibits?
4. Are historical, static, and runtime evidence classes kept distinct?
5. Are dormant, canonical-live, and live-secondary route claims correctly scoped?
6. Does any proposed investigation require writes not explicitly governed?
7. Does any language prematurely establish a hybrid architecture as canonical?
8. Are stop conditions sufficient to prevent inference from outrunning evidence?
9. Is the relationship to any existing CRP/MRC/MDR program explicitly established rather than inferred?
10. Is executor authority explicitly deferred to §XXXII?

Return contradictions. Do not repair them silently.

---

# XXXI. FREEZE CRITERION

The census method may be frozen only when:

* the full object has been received;
* **the object is materialized as a durable artifact in canonical custody at a ruled path**;
* **its exact blob digest and repository referent are recorded**;
* the consistency review is complete against **that exact artifact**;
* material contradictions have been ruled;
* the canonical referent discipline is intact;
* production-witness authority is either explicitly granted or explicitly deferred;
* program identity is explicitly bound or explicitly independent;
* **executor authority is explicitly deferred to §XXXII** — not granted here.

Freeze establishes **what the mandate is.** Launch establishes **who may execute it.** They are two events and must not be combined.

Until all criteria are met: `CENSUS_METHOD_NOT_FROZEN`

---

# XXXII. EXECUTION AUTHORITY

**THIS DOCUMENT DOES NOT ITSELF AUTHORIZE EXECUTION.**

A separate founder/governance act must explicitly authorize launch.

Valid launch authority must identify, at minimum:

* this census object by its frozen digest and revision;
* the permitted phase;
* the permitted repository/referent;
* whether work is static-only or includes runtime witnessing;
* whether production writes are permitted;
* the executor or executor class;
* applicable stop conditions.

Without that: `NO_EXECUTION_AUTHORITY`

---

# XXXIII. COLD EXECUTOR BINDING

If launch is later authorized, use a fresh JARVIS executor under cold-executor discipline.

The executor must begin from:

1. the frozen mandate at its canonical custody path and digest;
2. the explicit launch authority;
3. the route authority registry;
4. the bound canonical repository/ref;
5. existing evidence artifacts explicitly admitted by the mandate.

It must **not** begin from conversational recollection of this investigation.

Previous summaries are orientation only unless admitted as evidence. The cold executor must independently establish the facts it relies upon.

---

# XXXIV. FIRST EXECUTION UNIT — WHEN AUTHORIZED

The first unit is not "trace all 33."

It is:

## Canonical Runtime Contract Trace

Starting from the route authority registry:

1. bind `sovereign/app/maia/list` at the authorized referent;
2. inspect `maiaRuntimeContext`;
3. trace `buildMaiaRuntimeContext`;
4. identify the continuity-bearing fields actually defined by that contract;
5. establish the producers for:
   * conversational recall;
   * episodic recall;
   * atoms;
   * `relationalContext`;
   * `relationshipContext`;
   * memory health;
   * any additional continuity field discovered;
6. **determine the relationship between `relationalContext` and `relationshipContext`** — two contributors, one under two names, or one derived from the other. Do not resolve by assumption; do not drop either;
7. **investigate `memoryHealthExpected` and `atomsExpected` per §XV** — definition → validator/consumer → CI/runtime enforcement → failure/degradation semantics, determined statically or from already-existing evidence only;
8. determine what remains structured at each producer boundary;
9. identify the first serialization boundary for each;
10. trace those representations to `getMaiaResponse`;
11. trace their position in final assembly;
12. stop before proposing repair.

If tracing reaches `between/chat`, stop and request scope expansion (§IX-A).

For each finding, distinguish `STRUCTURE` · `PROVENANCE` · `INFLUENCE` · `VISIBILITY` · `ASSERTION`.

Do not allow one dimension to stand in for another.

---

# XXXV. FIRST-UNIT RETURN

### A. Referent
canonical remote/ref · inspected SHA · deployed binding status · route-registry classification

### B. Runtime contract
exact contract fields · enforcement mechanism · `memoryHealthExpected` semantics · `atomsExpected` semantics · degradation visibility — each with the evidence basis by which it was determined, and an explicit note where a question was answerable only by induced failure and was therefore deferred

### C. Continuity contributors
For each canonical contributor: producer · upstream structure · selection/retrieval · serialization boundary · surviving provenance · influence classification · visibility classification · assertion warrant · assembly position · all five evidence fields (§VII)

Plus: the determined relationship between `relationalContext` and `relationshipContext`, or an explicit statement that it remains unresolved and why.

### D. Corrections
Any prior claim superseded by stronger evidence.

### E. Capability candidates
Mechanisms worth preserving later.

### F. Unresolved questions
Only questions that genuinely remain unresolved after the evidence pass.

### G. Stop state

One of:

`UNIT_COMPLETE` · `STOPPED_ROUTING_AUTHORITY_CHANGED` · `STOPPED_REFERENT_CONFLICT` · `STOPPED_TOPOLOGY_CHANGE` · `STOPPED_UNENUMERATED_ASSEMBLY_SITE` · `STOPPED_EVIDENCE_CONTRADICTION` · `STOPPED_CONTRIBUTOR_RESOLVES_TO_MULTIPLE_PRODUCERS` · `STOPPED_PROVENANCE_UNTRACEABLE` · `STOPPED_RUNTIME_CONTRADICTS_STATIC` · `STOPPED_ARCHITECTURAL_CHOICE_REQUIRED` · `STOPPED_CONTEXT_DEGRADATION` · `STOPPED_WOULD_REQUIRE_GUESSING` · `STOPPED_UNAUTHORIZED_SIDE_EFFECT` · `STOPPED_AUTHORITY_BOUNDARY`

or another precisely stated demonstrated stop. This list maps to §XXIII and is not to be treated as narrowing it.

No repair proposal unless separately requested and authorized.

---

# XXXVI. DESIGN NORTH STAR

The eventual architecture should not optimize for the quantity of remembered material.

Its north star is:

> **Not maximum recall, but right relationship to memory — remembering enough that the person is genuinely known, while allowing most memory to remain quietly supportive of what is happening now.**

A mature continuity system should permit MAIA to know:

* what is remembered;
* where it came from;
* how directly or inferentially it is known;
* how it relates to this person and this moment;
* how it may influence the encounter;
* whether it should be surfaced;
* how strongly it may be asserted.

Good memory should increase recognition without requiring increased reference to the past.

Preserve:

> **Depth of synthesis does not confer authority of assertion.**
> **Provenance and visibility are orthogonal.**
> **Merge while structured. Render last.**

These are evaluation principles. They are not permission to implement an architecture before the evidence program and subsequent authorization permit it.

---

# XXXVII. FINAL STOP

**DO NOT LAUNCH.**

This object is materialized and pending freeze. The only acts performed upon it to date are: authorship, consistency review, ruling incorporation, custody materialization, and digest calculation.

Do not spawn an executor.
Do not begin the contributor census.
Do not perform a production witness.
Do not modify MAIA.

Hold at the authorization boundary.

---

# APPENDIX A — CHANGE LEDGER (r1 → r2)

Prior conclusions are marked superseded, not erased (§XXIV).

| Ruling | Sections amended | Change |
|---|---|---|
| **R-1** | Header, §XXXI | Custody path, referent, and digest recording added as freeze preconditions. Conversation is source material, not custody. |
| **R-1A** | Header, §XXVIII | `CMC-001` founded as an independent program by explicit founder designation. Custody adjacency explicitly severed from program identity. |
| **R-1B** | Header | Path approved: `docs/architecture/governance/cmc-001/`. N=1 convention basis recorded as such. |
| **R-1C** | Header | CRP-001 `CUSTODY-INDEX` ruled non-governing. No CMC-001 index created. |
| **R-2** | §XXXI, §XXXII | Executor authority removed from freeze criteria; now *explicitly deferred to §XXXII*. Circularity resolved. Freeze/launch separation stated. |
| **R-3** | §XVI, §XXVII | §XXVII given an explicit supersession clause. Preference order corrected to existing-founder-traffic first, synthetic only when necessary and separately authorized. |
| **R-4** | §VI, §XXXIV.5–6, §XXXV.C | `relationalContext` and `relationshipContext` both retained as named candidates; relationship is a question for tracing, resolvable neither by assumption nor by omission. |
| **R-5** | §XV, §XXXIV.7, §XXXV.B | First unit expanded to investigate `memoryHealthExpected` / `atomsExpected`: definition → validator/consumer → enforcement → failure semantics. Return spec no longer exceeds unit scope. |
| **R-6** | §XV, §XVI, §XXIII.12, §XXVII | Phase 1 barred from failure injection, perturbation, destructive test, cleanup, and capability suppression. Cleanup ruled a write requiring its own authority. |
| **R-7** | §XXV | Retitled *Provisional Program Sequence*; declared a roadmap authored by this object, creating no authority for Phases 2–10; no external program identity implied. |
| **R-8** | §I, §VII, §XXVI | Single evidence enum replaced by five orthogonal fields. `DORMANT_PATH` removed from the strength ladder and expressed as `route_status`. `evidence_date` added. `LIVE_OBSERVED`/`CURRENTLY_LIVE_OBSERVED` collision resolved: `RUNTIME_OBSERVED` is basis, `CURRENTLY_LIVE_OBSERVED` is observed status. |
| **R-9** | §I, §IX-A, §XXXIV | `between/chat` scoped out of Phase 1, retained for capability extraction, explicitly not legacy/dormant, with a stop-and-request-expansion rule. |
| **R-10** | §II | "FIRST ACTION" scoped to first action *after* explicit launch authorization. |
| **§XVIII correction** | §XVIII | Dangling reference to a non-canonical hybrid-target document removed. Reclassified `ORIENTATION ONLY / NOT CANONICALLY CUSTODIED / NOT AUTHORIZED`. Dimension list retained only as testable hypotheses. |
| **NB-1** | §XXV | Phases 5–8 made conditional on the census supporting a unified substrate. |
| **NB-2** | §XXXV.G | Stop-code list expanded to cover the full §XXIII taxonomy. |
| **NB-3** | §XXIII.12, §XXXV.G | `STOPPED_UNAUTHORIZED_SIDE_EFFECT` added, with evidence preservation and no attempted cleanup. |

## Superseded conclusions

**S-1.** An earlier reading inferred that this census was an execution mandate for Phase 1 of CRP-001. **Retracted.** It rested on terminology similarity and subject adjacency — the exact surfaces §XXVIII rules inadmissible. Superseded by R-1A: CMC-001 is independently founded.

**S-2.** An earlier draft of §XVIII treated `CRP-TARGET-HYBRID-MEMORY-SUBSTRATE.md` as an existing repository artifact. **Retracted.** Custody discovery at SHA `52a3b924b7cf52013c1c8b0d635359c2cad672fc` found zero occurrences of that filename anywhere on the canonical ref. Superseded by the §XVIII correction.
