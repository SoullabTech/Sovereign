# MAIA Relational Intelligence Readiness Program — 2026-08-09

**Status: AUTHORIZED as the controlling readiness program (founder ruling, Kelly, 2026-08-09)**, with two founder amendments incorporated below: (1) the Gate 8 end-to-end encounter is frozen as the **Phase 0 behavioral reference**; (2) **Relational Relevance** is the tenth readiness dimension. This document is the durable record of that directive; it governs subsequent sessions. The seven audit artifacts of 2026-08-09 (`docs/architecture/audits/MAIA_*_2026-08-09.md`) are the controlling evidence set.

**Objective**: not "better memory" — make MAIA's existing memory organism operate as a trustworthy relational intelligence across time. The finished system must distinguish and appropriately use: what the member said · what the member corrected · what MAIA inferred · what the member confirmed · what occurred in an encounter · what remains unresolved · what outside wisdom contributes · what has been superseded · what MAIA does not know · what matters because the member returned after time away.

**Anti-goal**: incremental patching that yields three mechanisms which technically work but don't share one epistemic architecture. Do not optimize for minimal patches; inspect whole affected architecture, reuse strong substrates (atoms' authority model is the named exemplar), make coherent structural changes where evidence requires. Do not resurrect rejected architecture merely because code still exists.

## Phase 0 — Executable relational-memory architecture map

Before implementation: one authoritative map, `member act → capture → epistemic classification → persistence → supersession → retrieval → ranking → prompt assembly → model lane → response → new memory`, traced independently for FAST/CORE/DEEP. For every memory source: authorship, epistemic status, provenance, authority, current/superseded state, consent requirement, retrieval path, prompt rendering, model-lane reach. No new generalized memory store unless existing architecture cannot express a required state. Implementation dependency graph before production code.

### Phase 0 behavioral reference (founder amendment, 2026-08-09)

**The Gate 8 end-to-end encounter is frozen NOW as the non-executable acceptance narrative, before Gate 1 implementation:**

> meet me → remember me → misunderstand me → be corrected → remember my correction (the superseded claim never resurrects) → go deeper with me (DEEP carries continuity and authority framing) → bring wisdom (never presented as member memory) → do not overreach (known ≠ inferred ≠ remembered ≠ unknown) → meet me after absence (posture reflects elapsed time, no canned intimacy) → protect what is private (sanctuary/consent boundaries survive the entire sequence).

This sequence is the telos of the program — each gate exists to make another portion of this encounter possible. **Gates may add discovered cases but may not weaken or redefine this reference merely to accommodate implementation constraints.** Any proposed change to the reference itself is a founder decision, not an engineering one.

## Gates (in order; do not advance past a gate until its tests pass)

### Gate 1 — Persistent corrigibility (ACTIVE)
Semantics: `X recalled/understood → member corrects X → historical X preserved → X loses eligibility as unqualified current member truth → member's replacement Y receives the authority actually established by the member's act`. Supersession, not deletion. Do not mutate X into Y. Distinguish four acts with distinct authority: (1) member correction; (2) member replacement/declaration; (3) MAIA interpretation; (4) member confirmation of interpretation. MAIA's interpretation of a correction is not the member's declaration.
Reconcile the unused interpretive ledger with the COGOS removal ruling; do not resurrect COGOS unless current constitutional evidence explicitly authorizes it.
**Invariants (executable, mutation-tested)**: corrected content cannot render as current truth · historical corrected content remains inspectable · replacement survives future sessions · MAIA inference cannot silently acquire member authority · confirmation changes authority only per the governed promotion rule · supersession holds across FAST, CORE, and DEEP independently · multiple corrections form a traceable chain · correction-of-correction resolves to latest legitimate state · unrelated memories unaffected.
**First action**: produce/verify the reconciliation record (`docs/architecture/audits/MAIA_PERSISTENT_CORRIGIBILITY_RECONCILIATION_2026-08-09.md`), then return with: exact defect · governing ruling · architecture selected for reuse/reconnection · implementation boundary · invariants · affected read/write paths · migration implications · rollback strategy · founder decisions still required. Implementation only after the record establishes the repair does not resurrect the rejected COGOS authority model.

### Gate 2 — Unified authority-aware context assembly
One common contract through which conversational memory reaches prompts (not per-route authority solutions). Must retain distinctions: member-declared · member-confirmed · MAIA-inferred · encounter-derived · episodic · generated offering · superseded/historical · external wisdom. Labels need not be exposed verbatim to the model if a safer rendering exists, but the assembly system retains them. Every rendered item must be able to answer: where from, who established it, still current?, what authority, may MAIA assert / tentatively interpret / background-only. Reuse atoms' authorship+epistemic-status strength; do not flatten plural memory into one semantic-search list.

### Gate 3 — DEEP continuity **and depth eligibility**

**Founder clarification (2026-08-09, governing):** AIN's expected member population is depth-oriented. **DEEP is not intended as an exceptional edge-case capability** — appropriate deep engagement is a normal and important part of MAIA's intended lived experience. Near-zero DEEP execution across thousands of measured turns is evidence the eligibility model is misaligned with product intent. Requirements this adds:

- **Do not simply lower a threshold.** Re-evaluate what the system currently means by "depth." Audit whether DEEP eligibility overweights cognitive/intellectual complexity while under-recognizing: emotional depth · relational depth · developmental/transformational depth · existential inquiry · grief/loss/transition · symbolic or imaginal depth · sustained self-reflection · creative depth · morally or personally consequential decisions · longitudinal significance arising from accumulated history rather than the current utterance alone.
- **Never infer shallowness from lexical or cognitive simplicity.** *"My father died this morning."* is six ordinary words and enormous relational depth; so are *"I don't know if I love him anymore"* and *"Something in me has changed."* Test simple-language/high-depth cases explicitly.
- **Re-examine the DEEP→CORE down-regulators** (low altitude, spiritual bypassing). They should change *how* MAIA responds in depth — more grounded, less interpretively expansive, closer to experience — not remove depth capacity altogether.
- **Evaluate the architecture**: FAST = lightweight ordinary interaction · **CORE = relational foundation** · **DEEP = additional integration/depth capacity layered on CORE when warranted** — rather than three mutually exclusive buckets receiving different continuity.
- ⭐ **HARD DESIGN PRINCIPLE: processing depth may add capability; it may never subtract relationship.** Any DEEP architecture must preserve the same governed member memory, relationship history, corrigibility, provenance, and continuity available to CORE. The deepest moments are precisely when MAIA most needs to remember: *I know what you've been through. I remember what you said before. I recognize what's changing. And I'm meeting what is happening now in light of what has actually unfolded between us.* A DEEP that cannot do this is not deeper — only more computationally elaborate.
- **Deliverable before any threshold or routing change**: a proposed depth-discrimination model and representative test corpus, returned for review.

DEEP must not be the least relationally informed lane. Governed context seam for the actual DEEP invocation; different context budgets allowed, same authority/provenance semantics required. DEEP receives the subset needed for: who this member is, current themes, episodic continuity, corrections/supersession, relational posture, relevant prior encounter context, unresolved material where legitimately established. No payload dumping; context selection appropriate to depth. Remove/replace the canned timeout stub so failure does not masquerade as relational response. Tests: correction continuity in DEEP · cross-session recall · conflicting memory · insufficient evidence · timeout/fallback · no-context member · high-context long-term member.

### Gate 4 — Wisdom Field connection
Epistemic boundary first: member memory ≠ MAIA interpretation ≠ external/AIN wisdom. Wisdom arrives as wisdom, never masquerades as memory. Prefer `deterministic corpus/authority narrowing → semantic retrieval within allowed corpus → ranking → provenance-aware rendering` over global vector retrieval. Populate/repair embeddings only after the retrieval contract exists. MAIA must distinguish conversationally: "You told me…" / "I've understood…" / "There is something in this tradition…" — provenance preserved internally, exposed when appropriate, no robotic citation in ordinary conversation. Tests: relevance, authority, provenance, room boundaries, no-result behavior, contradictory sources, prompt-injection resistance from corpus content.

### Gate 5 — Return intelligence
Server-side return-context calculation from legitimate evidence (time since meaningful encounter, continuity density, governed unresolved threads, recent correction, major episodic memories, active developmental material; commitments only if a governed substrate exists). Do NOT invent unfinished-threads/commitments/significant-people substrates merely because the audit found them absent — use existing evidence first. Output: a small relational-state object consumed by prompt assembly, not a prose greeting generator. Tests: same-day / 2-day / 2-week / 2-month returns, first encounter, sparse vs rich history, recent-correction-before-absence, sanctuary material must not leak.

### Gate 6 — Observability tells the truth
Fix `memoryHealth.semantic` (reports atom counts). Identify every metric whose name overstates what it measures. Explicit dimensions: conversational recall availability · episodic retrieval · atom retrieval · semantic vector write vs read health · wisdom corpus availability · wisdom retrieval · supersession/corrigibility · DEEP context assembly · consent filtering. Never "healthy" merely because a table has rows; health should exercise the production read path where practical.

### Gate 7 — Deletion & stewardship (may end in Founder ruling, not implementation)
Map every member-bearing substrate; classify: member-authored / MAIA-generated / inferred / operational / encounter record / audit-provenance / retained / deletable / anonymizable / unresolved. Produce the deletion disposition instrument before changing destructive behavior. Member-facing semantics must eventually say truthfully what "delete my memory" means. Backups, audit trails, and active memory are not equivalent categories. No silent broadening of deletion.

### Gate 8 — Golden-member relational harness (after Gates 1–6 green)
**Three golden members**, all synthetic (never a real member's history as fixture):
- **New member** — almost no history; tests that MAIA does not manufacture familiarity.
- **Developing member** — history, corrections, reflections, episodic memory; tests continuity.
- **Longitudinal member** — months of deliberately conflicting/superseded material, absences, changing themes, wisdom interactions; the torture test.
Run E1–E14 from `MAIA_MEMORY_ADVERSARIAL_EVALS_2026-08-09.md` plus tests discovered during implementation, against production-equivalent retrieval and prompt assembly (no mocks bypassing the repaired architecture).
**Required end-to-end encounter** (readiness proof): meet me → remember me → misunderstand me → be corrected → remember the correction (superseded claim never resurrects) → go deeper (DEEP carries continuity + authority framing) → bring wisdom (not presented as member memory) → do not overreach (known vs inferred vs remembered vs unknown) → meet me after absence (posture reflects elapsed time, no canned intimacy) → protect what is private (sanctuary/consent boundaries survive the whole sequence).

## Readiness standard

Never "ready" because tests compile or retrieval returns results. Required evidence across ten dimensions: **Continuity · Corrigibility · Epistemic humility · Stewardship · Wisdom · Depth · Temporal intelligence · Isolation · Graceful uncertainty** (missing evidence produces uncertainty, not fabrication) · **Relational Relevance** (founder amendment, 2026-08-09: correct recall is not sufficient — the question is not only *did she remember correctly?* but *was remembering this useful now?* MAIA can pass continuity and wisdom tests while constantly surfacing things that are true but inappropriate; salience must be relational, not merely computational).

**Report a readiness score after every gate** (update `MAIA_TESTER_READINESS_SCORECARD` lineage) — measurable progression from baseline to tester-ready; "we implemented the feature" is never synonymous with "the relational capacity works."

## Execution discipline

Separate bounded branches/PRs per gate. Before each gate: canonical trunk provenance → branch state → controlling rulings → trace existing executable path → identify reusable architecture → define invariants. After each gate: focused tests → regression → typecheck against clean cache (compare same-base control where needed) → mutation-test critical invariants → semantic diff inspection → record PROVEN vs inferred → merge only under explicit authorization. Never branch from stale trunk. A passing test never substitutes for production-equivalent proof.

## Stop conditions (return for Founder ruling)

Whether MAIA inference can become member truth · whether a new substrate carries authority · whether member confirmation promotes epistemic status · whether sanctuary material may cross an existing boundary · whether external wisdom may enter a prohibited room · whether deletion destroys historical/audit provenance · whether a new relational claim can be inferred rather than constituted · any question where implementation would silently create governance. **Do not encode constitutional decisions as engineering convenience.**

## Four layers (orientation)

1. **Memory integrity** — corrections, provenance, authority, supersession (Gates 1–2)
2. **Relational cognition** — FAST/CORE/DEEP share one governed understanding at different budgets (Gate 3)
3. **Wisdom intelligence** — governed retrieval; knowing when wisdom is relevant and what kind of knowledge it is (Gate 4)
4. **Temporal relationship** — time-aware posture without fake intimacy (Gate 5)
