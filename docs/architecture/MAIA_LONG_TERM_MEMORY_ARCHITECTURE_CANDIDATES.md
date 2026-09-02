# MAIA Long-Term Memory — Architecture Candidates

**Lane**: JARVIS — Long-Term Memory Participation (Cat-5)
**Predecessor**: `MAIA_LONG_TERM_MEMORY_CURRENT_STATE_CENSUS.md` (2026-09-02)
**Status**: Architecture only. Nothing implemented, nothing wired, nothing deployed, no sovereignty defect repaired.
**Date**: 2026-09-02
**Branch**: `claude/maia-long-term-memory-fda5gf`

**Mandate (founder adjudication, 2026-09-02)**: preserve Candidates A–C for comparison; develop Candidate D as a *Canonical Intelligence-Field Participation Architecture*, informed by the census rather than predetermined by it; determine how differently authoritative memory classes participate without collapsing into one ranking score; extend the analysis one level beyond memory to the canonical seam through which all MAIA intelligence should participate. Do not wire clients. Do not activate semantic retrieval. Do not repair the three sovereignty defects.

**Naming**: the founder has signalled that *"long-term memory"* is becoming too small for the object. This document retains the lane's filename for continuity and uses **MAIA Intelligence Participation Architecture (MIPA)** for the object itself. Memory is one field within it. *Proposed, not ratified.*

---

## 0. What the census settled, and what this document must decide

### Settled (evidence in the census, not re-argued here)

1. No query-conditioned retrieval over member history exists anywhere in the repository.
2. `currentInput` is threaded through the memory pipeline at three seams and read at none.
3. Working entity-tag and pgvector cosine retrieval exist, aimed at `CANON_GLOBAL`, never at member history. **Retrieval is the cheap part.**
4. All suppression is pre-composition. `retrieval eligibility ≠ speaking eligibility` is an aspiration, not a property.
5. Supersession exists only in `developmental_memories`. Similarity ranking without it is *worse* than recency at "what is true about me now."
6. Member-conferred authority (Keep/Mark) and machine similarity are different kinds of authority. A composite score makes them commensurable by construction.
7. Three sovereignty gaps: the export omits the corpus; `episodic_recall_enabled` is unreachable; the two inferred layers have no consent gate.

### Open questions this document must answer

| # | Question | Answered in |
|---|---|---|
| Q1 | How do differently authoritative memory classes participate without a single score? | §2.2 |
| Q2 | What makes restraint *structural* rather than instructional? | §2.5 |
| Q3 | Where is the canonical seam for all MAIA intelligence, not just memory? | §3 |
| Q4 | How is participation *proven*, including the participation of restraint? | §C6 |

### One methodological note

Kelly's adjudication supplied a target shape. **This document is not a transcription of it.** Where the codebase suggests a stronger form than the diagram, the census evidence is followed and the divergence is named. Two such divergences appear: the composition of stages 4–5 (§2.4) and the location of the canonical seam (§3.3). Both are flagged for adjudication rather than assumed.

---

## 1. Candidates A–C, preserved for comparison

### Candidate A — Semantic retrieval across conversation history

```
user query → embed → cosine top-k over conversation_turns → prompt
```

**Cost to build**: near zero. pgvector installed and indexed; `generateLocalEmbedding()` is sovereign (local Ollama `nomic-embed-text`, 768-dim, matching the existing column dimension); `DevelopmentalMemory.semanticSearch()` is a working implementation. The only new work is an embedding backfill and a member-scoped call site.

**Verdict: REJECT as the architecture** (founder adjudication; census-supported).

Failure modes, all census-grounded:

- **Case 4 — actively worse than the status quo.** No supersession exists over `conversation_turns`. A superseded 18-month-old statement outranks its revision whenever it is lexically closer to the question. Recency at least accidentally favours the revision; similarity removes even that accident.
- **Case 6 — laundering.** `developmental_memories.content_text` is MAIA's distillation of the member, stored under their `user_id`, carrying no field marking it as inference. Similarity search over a mixed corpus returns it alongside verbatim member speech, indistinguishable at the point of composition.
- **Case 7 — inversion.** A similarity score lets an ordinary turn outrank a Kept atom that passed six consent predicates. The consent architecture becomes advisory.
- **Case 5 — no answer.** Retrieval reaches the painful disclosure; nothing decides whether it may be spoken.

**Retained as**: a *mechanism* inside a larger architecture — specifically as one candidate generator within a single memory class (§2.1). It is rejected as the system, not as a component.

### Candidate B — Hybrid ranking

```
semantic + structured memory + recency + salience → composite score → top-k → prompt
```

**Verdict: INSUFFICIENT.** Better retrieval; same category error.

B improves *recall quality* and leaves every structural failure of A intact. Its specific defect is that it makes the Case 7 inversion **worse by making it look principled**. A weight vector such as `0.4·similarity + 0.3·salience + 0.2·recency + 0.1·memberKept` is a claim that member-conferred significance is *commensurable* with lexical proximity — that a Kept atom is "0.1 worth" of something. It is not a weighting problem. It is a difference of kind.

The current `rankCandidates` (`MemoryBundle.ts:422-449`) is already a degenerate Candidate B with `similarity = 0`. **B is not a new architecture; it is the existing one with the dead term revived.** That is a useful thing to notice: the codebase has already been B for over a year, and the census shows what B produces — a ranked list with no account of the ranking, reaching MAIA with no reason attached (§5.4 of the census).

**Retained as**: the correct model *within* a class (§2.2). Ranking turns against turns is legitimate; ranking turns against Kept atoms is not.

### Candidate C — Two-stage participation

```
candidate retrieval → relational eligibility/adjudication → composition
```

**Verdict: CORRECT DIRECTION, UNDER-SPECIFIED.**

C identifies the missing stage. The census shows the gap is not one stage but a **sequence of distinguishable decisions** that C collapses into "adjudication":

- *What is this material?* (recognition/resolution — Case 2, Case 8)
- *What kind of knowledge is it?* (epistemic status — Case 6)
- *Is it still true?* (supersession — Case 4)
- *May it be here at all?* (sovereignty gates — existing atoms SQL)
- *Does it belong in this moment?* (relational eligibility — Case 3)
- *Should it be said?* (speaking eligibility — Case 5)

Collapsing these produces a single opaque adjudicator whose decisions cannot be explained, audited, or separately governed — reintroducing the very opacity the census criticised in `rankCandidates`. **Each of these questions has a different authority source**: resolution is factual, epistemic status is structural, sovereignty is member-conferred, relational eligibility is contextual, and speaking is relational. They should not share a decision surface.

**Superseded by**: Candidate D, which is C with the adjudication stage decomposed.

---

## 2. Candidate D — Canonical Intelligence-Field Participation Architecture

### 2.0 The governing reframe

> Memory is not a lookup. It is **conditional participation in a present encounter**.

The architecture's object is not *"what does MAIA know about me?"* but *"of everything MAIA could know, perceive, infer, remember and recognise — what legitimately belongs in this moment between us?"*

Two consequences follow immediately, and both are structural rather than stylistic:

1. **Every stage may reduce, none may add.** Material passes forward or is withheld. No stage manufactures a memory, synthesises across memories, or promotes standing. This makes the pipeline auditable: what appears in composition is always a subset of what was retrieved, and every removal has a named reason.
2. **The default at every stage is withholding.** Passing forward requires a positive reason. This inverts the retrieval-system default and matches the existing atoms loader, whose scope logic already states the principle: *"Absence = restriction, not widening"* (`memoryAtomsLoader.ts:250`).

### 2.1 The seven stages

```
                    MEMBER + PRESENT ENCOUNTER
                              │
        ┌─────────────────────▼─────────────────────┐
        │  0 · PRESENT MEANING                      │
        │    query · entities · relations · context │
        └─────────────────────┬─────────────────────┘
                              ▼
        ┌───────────────────────────────────────────┐
        │  1 · CANDIDATE RETRIEVAL   (per class)    │
        │    conversation · kept · marked ·         │
        │    developmental · relationship           │
        │    → ranked WITHIN class, never across    │
        └─────────────────────┬─────────────────────┘
                              ▼
        ┌───────────────────────────────────────────┐
        │  2 · RECOGNITION / RESOLUTION             │
        │    what is this material about?           │
        │    entity resolution ≠ similarity         │
        │    conversation-as-unit reconstruction    │
        └─────────────────────┬─────────────────────┘
                              ▼
        ┌───────────────────────────────────────────┐
        │  3 · EPISTEMIC ADJUDICATION               │
        │    what KIND of knowing is this?          │
        │    provenance · status · supersession     │
        │    unlabelled ⇒ withheld (never guessed)  │
        └─────────────────────┬─────────────────────┘
                              ▼
        ┌───────────────────────────────────────────┐
        │  4 · SOVEREIGNTY GATES                    │
        │    may this participate AT ALL?           │
        │    consent · scope · sanctuary · protect  │
        │    member-conferred; never overridden     │
        └─────────────────────┬─────────────────────┘
                              ▼
        ┌───────────────────────────────────────────┐
        │  5 · RELATIONAL ELIGIBILITY               │
        │    does it belong in THIS moment?         │
        │    context · timing · non-intrusion       │
        └─────────────────────┬─────────────────────┘
                              ▼
        ┌───────────────────────────────────────────┐
        │  6 · SPEAKING ELIGIBILITY / RESTRAINT     │
        │    OFFERED  ──→ may be spoken             │
        │    AVAILABLE ──→ may only be offered      │
        │    WITHHELD  ──→ does not enter           │
        └─────────────────────┬─────────────────────┘
                              ▼
        ┌───────────────────────────────────────────┐
        │  7 · CANONICAL COMPOSITION                │
        │    per-class budgets · per-class framing  │
        │    standing order fixed, not computed     │
        └─────────────────────┬─────────────────────┘
                              ▼
                    MAIA'S PRESENT RESPONSE
```

**Divergence from the adjudicated diagram, flagged**: Kelly's sketch places sovereignty gates *after* epistemic resolution and relational eligibility *after* sovereignty. This document keeps that order but notes that **stage 4 is partly implementable at stage 1** — the atoms loader already enforces six sovereignty predicates in SQL, before retrieval completes. Two readings are possible and the choice is architectural:

- **(a) Gates as filters in SQL** — cheaper, and structurally impossible to bypass. But the withheld material leaves no trace, so the system cannot report *"three eligible memories existed and consent withheld them."*
- **(b) Gates as an explicit stage** — retrieves then rejects, producing a full audit of what consent excluded, at the cost of loading material that will be discarded.

**Recommendation: (a) for privacy-critical predicates** (`sacred_protected`, Sanctuary, scope) **and (b) for preference predicates** (`return_preference`, recall toggles) — so the member can be told what their own settings are withholding without the system ever loading material they have sealed. *Flagged for adjudication.*

### 2.2 Q1 — How differently authoritative classes participate without one score

**The answer: standing is structural, ranking is intra-class, composition is budgeted.**

Three mechanisms, none of which is a weight:

**(i) Standing classes.** Every retrievable object belongs to exactly one class, and classes carry **fixed, declared standing** — an ordering that is *authored*, not computed, and changeable only by governed act (the pattern `memorySelectionPolicy.ts` already establishes for the current policy).

| Standing | Class | Authority source | Census evidence |
|---|---|---|---|
| **1** | Member-Kept atoms | member act + consent preference | 6 SQL predicates, `epistemological_status` |
| **1** | Member-Marked episodes | member act + R18 provenance | `marked_by_member = TRUE` only |
| **2** | Member's own verbatim words | the member said it | `conversation_turns`, role `user` |
| **3** | MAIA's own prior words | MAIA said it, member heard it | `conversation_turns`, role `assistant` |
| **4** | Practitioner observation | attributed, epistemically framed | `facilitator_id` + framing (`:550-560`) |
| **5** | System inference | machine construction | `developmental_memories`, `member_theme_signals` |

Standing 1 and 2 are separated because they answer different questions: a Kept atom answers *"what does this member hold as significant?"*; a verbatim turn answers *"what did this member actually say?"* Case 1 needs the second; Case 7 protects the first.

**(ii) Ranking is intra-class only.** Similarity, recency, and salience rank candidates *within* a class to decide *which three turns* — never *whether a turn beats an atom*. Candidate B's model is correct at this scope and only at this scope.

**(iii) Composition is budgeted, not sorted.** Each class receives a bounded allocation in the composed context, rendered in its own section with its own epistemic frame. A class cannot borrow another's budget; an empty class yields nothing to anyone. **Cross-class order is standing order — fixed, declared, never score-derived.**

> **The property this buys**: no computation anywhere in the system can promote a system inference above a member's own words. It is not weighted against — it is structurally in a different section, under a different frame, with a different budget. **Inversion becomes unrepresentable rather than unlikely.**

**This is not invented.** `formatAtomsForPrompt` already does exactly this for two classes: it partitions member-placed from practitioner atoms, renders them in separate sections with different authority language, and never sorts one against the other (`memoryAtomsLoader.ts:414-560`). D generalises a working mechanism to five classes.

**Consequence to accept honestly**: budgets are a *policy* and will be wrong at first. The mitigation is that they are declared and versioned like `MEMORY_SELECTION_POLICY_VERSION`, so being wrong is visible and correctable rather than emergent.

### 2.3 Stage 2 — Recognition / Resolution

Census Case 8 established that **entity resolution and semantic similarity are different problems**. Resolution identifies a referent and gathers what pertains to it. Similarity finds text resembling text. Conflating them produces the classic failure: asked about Karen, return emotionally similar turns about someone else.

Three resolution functions, ordered by how much of the existing substrate they can use:

| Function | Question | Substrate today |
|---|---|---|
| **Entity resolution** | which *Karen*? | `member_relationships` (explicit table, handoff-only); `entity_tags` (written, never read) |
| **Conversation reconstruction** | which *conversation*? | `session_id` + `exchange_id` + `seq`; `episodic_memories.source_turn_id` |
| **Temporal resolution** | *when* is "months ago"? | `created_at` throughout; nothing interprets relative time |

**The system's instinct here is already right and merely unused.** `member_relationships` is an explicit entity table, not an embedding — which is the correct choice, and the census found it is read only on an explicit member handoff gesture (`route.ts:874-889`). Stage 2's first job is not to build entity resolution; it is to *read what is already written*.

**`episodic_memories.source_turn_id` is the only bidirectional link in the system** between a curated object and its raw origin. It is the natural spine for reconstruction: a Marked episode can pull its surrounding conversation without any search at all.

**Open**: whether stage 2 requires model inference (an LLM resolving "that relationship I told you about") or can be entirely structural. Model inference at stage 2 introduces machine judgment *before* epistemic adjudication, which inverts D's own ordering. **Unresolved — §C7.**

### 2.4 Stage 3 — Epistemic adjudication

**The rule: unlabelled material is withheld, never guessed.**

The census found `epistemological_status` implemented on exactly one class and absent from the three that most need it. The safe form of that gap is not to infer the missing labels — inferring an epistemic status is itself an epistemic act, and doing it retroactively over `developmental_memories` would assert authority the write path never established.

Therefore:

- Classes carrying explicit status (atoms) pass with their status.
- Classes whose status is structurally implied (verbatim turns, by `role`) pass with the implied status **declared in code**, not inferred per-row.
- Classes with no status (`developmental_memories`, `member_theme_signals`, `breakthrough_moments`) **do not participate in D until they carry one**. See §C4.

**Supersession.** `valid_to` exists only on `developmental_memories`. Case 4 requires it over the conversational corpus, where it does not exist and cannot be retrofitted honestly — nothing in `conversation_turns` records that turn N revises turn M. Three options, in increasing cost and increasing honesty:

| Option | Mechanism | Honest? |
|---|---|---|
| **S1** | Temporal disclosure only — surface age, let MAIA hold uncertainty | ✅ yes, and weak |
| **S2** | Member-declared supersession — a gesture ("that's not true any more") | ✅ yes, needs a new member act |
| **S3** | Inferred contradiction detection | ❌ machine judgment about the member's truth |

**S3 is rejected on canon**: a system that decides which of a member's statements is no longer true has taken authorship of their self-account. **S1 is the floor and should ship with any retrieval.** S2 is the real answer and is a product-design question, not an engineering one (§C7).

### 2.5 Q2 — Stage 6, and what makes restraint structural

**The problem.** Census §5.5: all suppression is pre-composition; once composed, material is in the prompt and restraint is natural-language instruction. Case 5 — a painful, semantically relevant, uninvoked memory — has no architectural answer.

**The mechanism: three participation states, not two.**

| State | Meaning | Reaches the prompt as |
|---|---|---|
| **WITHHELD** | does not participate | nothing |
| **AVAILABLE** | MAIA may know it exists, and may *offer* it — never speak its content | a **pointer**: class, age, subject-at-the-coarsest-grain, and *no body* |
| **OFFERED** | MAIA may speak it | content, with provenance and epistemic frame |

**Why this is structural rather than instructional**: an AVAILABLE memory's *content is not in the context window*. MAIA cannot speak what she does not have. Restraint stops being a request and becomes a fact about what was composed. The failure mode of instruction-based restraint — the model reads the sensitive material and mentions it anyway — is not merely discouraged; it is unavailable.

**What AVAILABLE makes possible**: *"There's something from a while back that may connect to this. Do you want me to bring it in?"* Retrieval reached it. The member decides whether it enters. **The member becomes the one who authorises recollection of their own difficult material** — which is the sovereign form of the answer, and better than any judgment MAIA could make on their behalf.

**This is not invented either.** `member_memory_atoms.return_preference` is *already exactly this distinction*, at one layer: `member_pulled` (private; the member retrieves it) versus `contextual_doorway` (may surface ambiently). The Daily Anchor consent gate shipped on this model 2026-07-03. **D generalises a ratified, deployed member-consent primitive from one class to all classes, and from a standing preference to a per-turn decision.**

**The unresolved part is the promotion rule** — what moves material from AVAILABLE to OFFERED. Candidates: member invocation only (safest, and possibly too narrow — it cannot serve Case 1, where the member *is* invoking); explicit-query match at stage 2; a sensitivity classifier (machine judgment about what is painful — likely rejected on the same grounds as S3). **§C7.**

### 2.6 Where the census's live defects land in D

| Census gap | Stage | Disposition in D |
|---|---|---|
| No query-conditioned retrieval | 1 | resolved — intra-class ranking |
| `currentInput` unread | 1 | resolved — becomes stage 0's product |
| Dead vector branch | 1 | resolved or deleted; must not stay ambiguous |
| Entity retrieval aimed at canon | 2 | resolved — member-scoped resolution |
| No epistemic status outside atoms | 3 | **blocks participation** of those classes |
| No supersession over turns | 3 | S1 floor; S2 is the real answer |
| No speaking gate | 6 | resolved — AVAILABLE state |
| MAIA can't know why a memory appeared | 7 | resolved — per-class framing carries the reason |
| Export omits corpus | — | **prerequisite, §C4** |
| Orphaned episodic gate | 4 | **prerequisite, §C4** |
| Ungated inferred layers | 3/4 | **prerequisite, §C4** |
| No correction path | — | S2 depends on it |
| No contextual constraint | 5 | stage 5 is where it would live; no substrate yet |

---

## 3. Q3 — One level beyond memory: the canonical participation seam

### 3.1 The founder's rule, restated as an architectural requirement

> There must not be an iOS memory system, a PWA memory system, and a Desktop memory system. There is one canonical MAIA intelligence field. The clients are different doors into it.

### 3.2 What the codebase actually shows

**Good news first, and it is substantial:**

- **Cognition has already converged.** `getMaiaResponse` has exactly three callers (`sovereign/app/maia/list`, `sovereign/app/maia`, `now-what/interview`).
- **`/api/oracle/conversation` is retired** — HTTP 410, "Legacy route retired pending Sanctuary-governed persistence (S2, 2026-07-17)."
- **The addenda channel has converged.** `appendAllContextAddenda` reaches FAST, CORE and DEEP (census §5.3).
- **The divergent voice mind has been removed structurally.** VOICE-CANONICAL-CONVERGENCE-02 (`OracleConversation.tsx:7209-7235`) deleted the exit that sent spoken turns to `/api/voice/stream-conversation` — a route with *"its own Claude service, memory bundle, relational stack, prompt machinery and TTS… It was not a thinner call into canonical cognition. **It was a SECOND MIND.**"* It was also the *default*. It was removed structurally rather than defaulted off, and is pinned by a closed-set test.

**The remaining divergence, and it is precisely Kelly's concern:**

`getMaiaResponse` is the seam for **cognition**. It is not the seam for **context assembly**. Assembly happens in each route handler, and the three live handlers assemble differently:

| Route | Bundle | Atoms | Conversational | Episodic | Developmental | Relational | Symbolic |
|---|---|---|---|---|---|---|---|
| `sovereign/app/maia/list` (1797 ln) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `sovereign/app/maia` (532 ln) | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `voice/stream-conversation` (1639 ln) | ✅ own | ❌ | ❌ | ❌ | ❌ | own | own |

> **Cognition converged. Context assembly did not.** The "second mind" problem was solved at the modality boundary and remains open at the route boundary. A member reaching MAIA through `sovereign/app/maia` gets canonical cognition with roughly one-seventh of the memory field, and nothing in the system announces the difference.

**Client evidence** (`OracleConversation.tsx:823`, `app/maia/page.tsx:843,1540`, `MaiaPresence.tsx:239`, `AcademySheet.tsx:240`): the primary surfaces converge on `/api/sovereign/app/maia/list`. **This is the good case and it is fragile** — it holds by convention, not by construction. Nothing prevents the next client, the next platform, or the next feature from calling `sovereign/app/maia` and silently receiving a thinner MAIA. The census's production data shows `desktop-*` and `session_*` clients already coexisting under one member.

### 3.3 The seam, and it already exists

**`buildMaiaRuntimeContext` (`lib/maia/maiaRuntimeContext.ts`) is described in its own header as "required contract for all `getMaiaResponse()` callers"**, with a governed route registry (entries require status, reason, date, and registering thread) and canonical 8-field per-turn observability.

And it explicitly declares itself an observer:

> *"This wrapper does NOT: … Modify the meta passed to getMaiaResponse() — **the caller does that**."*

CLAUDE.md names the same thing as an open architectural seam: *"`buildMaiaRuntimeContext` is observer, not orchestrator."*

> **The recommendation is therefore a promotion, not a new abstraction: make the existing mandatory contract the assembler.** Routes stop assembling context and start declaring an encounter — member, session, mode, tier, surface, present input. The seam assembles the intelligence field once, identically, for every caller.

```
  iOS ─┐
  PWA ─┼─► authenticated member ─► ENCOUNTER DECLARATION
Desktop┘                                    │
                                            ▼
                        ╔═══════════════════════════════════╗
                        ║  CANONICAL PARTICIPATION SEAM     ║
                        ║  (buildMaiaRuntimeContext,        ║
                        ║   promoted to orchestrator)       ║
                        ║                                   ║
                        ║   memory · relationship ·         ║
                        ║   development · Spiralogic ·      ║
                        ║   symbolic · knowledge gate ·     ║
                        ║   practice field · corpus callosum║
                        ╚═════════════════╤═════════════════╝
                                          ▼
                                   getMaiaResponse
                                          ▼
                                   MAIA cognition
```

**Why this is the right seam and not a new one:**

1. It is **already mandatory** for every cognition caller. No new obligation is created.
2. It **already has a governed registry** with the convention that adding an entry is a deliberate architectural act, never done to silence a warning.
3. It **already emits per-turn observability** — the natural home for participation evidence (§C6).
4. It sits **exactly at the boundary** between "which door" and "which MAIA" — the boundary Kelly's rule draws.
5. Promoting it makes the parity contract **checkable by construction**: if assembly happens in exactly one place, divergence requires bypassing a mandatory contract, which the closed-set gate pattern can detect (§C5).

**Divergence from the adjudication, flagged**: Kelly's diagram places intelligence participation *after* the canonical MAIA turn. This document places the seam *at* turn construction, because the census shows the divergence is upstream of cognition, not downstream. If the seam sits after cognition it cannot fix what the census found. *Flagged for adjudication.*

### 3.4 The precedent that makes this credible

`__tests__/voice-non-degradation.test.ts` is worth reading in full before designing the parity contract. Four prior versions of that gate failed, **all in the same way**: v1 a denylist of named routes; v2 a catalogue of call patterns; v3 exhaustive AST enumeration with regex classification; v4 per-guard inversion that left the fall-through corridor ungoverned.

> *"THE SAME EPISTEMIC FAILURE FOUR TIMES, EACH TIME IN A SMALLER ROOM. Every version asked 'does this look like something we thought of?' and answered no. A denylist fails open on the unknown, and narrowing WHERE it is applied does not change that."*

The version that works enumerates **two closed sets derived from the source by the compiler**: every `return` belonging to the handler, and the complete set of calls it makes. *"An unknown call fails BECAUSE IT IS UNKNOWN, without the gate ever learning its name. That is the only form in which a gate can be honest about the unknown."*

**This is the enforcement pattern the cross-surface parity contract must use** (§C5), and the four-failure history is the reason not to attempt anything weaker. A parity check that lists the intelligence systems and asserts each is present is a denylist wearing a different hat: it passes the day someone adds a system it never heard of.

---

## 4. Comparative evaluation

Scored against the dimensions named in the lane brief. **★★★** strong · **★★** adequate · **★** weak · **✗** failing.

| Dimension | A | B | C | **D** |
|---|:--:|:--:|:--:|:--:|
| Recall quality | ★★★ | ★★★ | ★★ | ★★ |
| False-association risk | ✗ | ★ | ★★ | ★★★ |
| Provenance | ✗ | ★ | ★★ | ★★★ |
| Sovereignty | ✗ | ★ | ★★ | ★★★ |
| Privacy | ★ | ★ | ★★ | ★★★ |
| Interpretive contamination | ✗ | ✗ | ★★ | ★★★ |
| Restraint | ✗ | ✗ | ★★ | ★★★ |
| Contradiction / supersession | ✗ | ★ | ★★ | ★★ |
| Latency / cost | ★★★ | ★★ | ★★ | ★ |
| Migration burden | ★★★ | ★★★ | ★★ | ★ |
| Compatibility with Keep/Mark | ✗ | ★ | ★★ | ★★★ |
| Explainability | ★ | ★ | ★★ | ★★★ |

**Reading the two columns where D is weakest, honestly:**

- **Recall quality ★★ (below A and B).** D deliberately recalls *less*. Stage 3 excludes unlabelled classes; stage 6 renders sensitive material as an offer rather than content. **A member could reasonably experience D as remembering less than B would** — while remembering more *appropriately*. That trade is the architecture's whole thesis and should be stated to members plainly rather than discovered by them.
- **Latency / cost ★ and migration ★.** D is a staged pipeline inside a FAST tier already targeting <2s and already running MemoryBundle, WuXing and astrology in parallel. The budget is unmeasured (§C7). Migration touches epistemic labelling, three sovereignty prerequisites, and a seam promotion — this is quarters of work, not weeks, and the sequence in §C3 is designed so that value lands before the whole is finished.

**Supersession is ★★ not ★★★** because S1 (temporal disclosure) is a floor, not a solution; S2 requires a member gesture that does not exist.

---

# CLOSING SECTIONS

## C1 · Recommended architecture

**Candidate D — Canonical Intelligence-Field Participation Architecture (MIPA)**, with the three-mechanism authority model (§2.2), the three-state participation model (§2.5), and the seam promotion (§3.3).

**Does the evidence warrant a recommendation?** For the *shape*, yes: A is rejected on Case 4 and Case 7; B is A with a principled-looking inversion; C is D under-specified; and every stage of D is a generalisation of a mechanism already working somewhere in the codebase — the atoms gate stack, `return_preference`, `formatAtomsForPrompt`'s class partition, `epistemicFraming`, `valid_to`, the closed-set gate, the mandatory runtime-context contract. **D is less an invention than a naming of what the system has been building toward in five places without connecting them.**

**Three things the evidence does *not* yet warrant, and they should not be smuggled in with the recommendation:**

1. **The promotion rule for AVAILABLE → OFFERED** (§2.5). The state model is sound; the rule that governs it is unresolved and is where the architecture could still go wrong.
2. **Whether stage 2 needs model inference** (§2.3). If it does, D contains machine judgment before epistemic adjudication, violating its own ordering.
3. **Whether the latency budget exists at all** (§C7). Unmeasured. If FAST cannot afford D, the tiering question reopens the architecture.

## C2 · Invariants and covenants

**Proposed for canon. Ratification is Kelly's act, not this document's.**

> **COVENANT 1 — Sovereignty ceiling.**
> *Machine access to memory MUST NOT exceed member sovereignty over memory.*
> No capability ships that lets MAIA reach material the member cannot inspect, correct, or withhold. (Founder-authored, 2026-09-02.)

> **COVENANT 2 — Standing is structural.**
> Memory classes carry declared standing. Ranking operates within a class only. No computation may promote a class above another. Cross-class order is authored and versioned, never score-derived.

> **COVENANT 3 — Retrieval is not permission.**
> That a memory *can* be reached is not grounds for speaking it. Speaking eligibility is a separate decision with a separate default, and the default is not to speak.

> **COVENANT 4 — Unlabelled material does not participate.**
> Material without explicit or structurally-declared epistemic status is withheld. The system never infers what kind of knowing something is.

> **COVENANT 5 — The system does not author the member's truth.**
> Supersession is declared by the member or disclosed temporally. MAIA never decides which of a member's statements is no longer true.

> **COVENANT 6 — One field, many doors.**
> Given the same authenticated member and equivalent present encounter, every surface invokes the same participation architecture. Device-local state governs capture, modality, UI and cache. It never governs which MAIA the person receives.

> **COVENANT 7 — Participation must be provable.**
> A capability that cannot be shown to have participated in a served turn is not live. **This includes restraint**: an architecture whose withholding leaves no trace cannot be verified, only trusted.

> **COVENANT 8 — Every stage may reduce; none may add.**
> No stage manufactures, synthesises, or promotes. Composed material is always a subset of retrieved material, and every removal carries a named reason.

## C3 · Migration sequence

Ordered so each phase is independently valuable, independently reversible, and leaves the system honest if the next phase never ships.

| # | Phase | Gate to enter | Lands |
|---|---|---|---|
| **0** | **Sovereignty prerequisites** (§C4) | — | Covenant 1 satisfiable |
| **1** | **Seam promotion** — `buildMaiaRuntimeContext` becomes assembler; three routes converge; parity contract (§C5) | 0 complete | **Cross-surface parity. Highest leverage, zero new capability.** |
| **2** | **Participation evidence** (§C6) — including not-spoken records | 1 complete | Covenant 7 satisfiable |
| **3** | **Epistemic labelling** — status on all classes; unlabelled classes formally excluded | 2 complete | Covenants 4 + 8 satisfiable |
| **4** | **Stage 1 intra-class retrieval** — semantic/entity within conversation-history class only; standing enforced by construction | 3 complete | **Case 1, Case 2 reachable** |
| **5** | **Stage 2 resolution** — entity + conversation reconstruction | 4 verified in prod | Case 8 |
| **6** | **Stage 6 three-state participation** — AVAILABLE/OFFERED/WITHHELD | 5 + promotion rule adjudicated | **Case 5** |
| **7** | **Supersession S2** — member-declared revision | correction path exists | Case 4 |

**Why phase 1 precedes any retrieval work**: adding retrieval before the seam means adding it to `sovereign/app/maia/list` alone, deepening the divergence in §3.2 rather than closing it. **The parity problem gets worse with every capability added upstream of the seam.**

**Why phase 2 precedes phase 3, and 3 precedes 4**: the census's governing standard — *can we prove it participated?* — must be answerable before there is anything new to prove. And labelling must precede retrieval, or phase 4 ships Case 6 into production at scale.

**The first four phases add no new recall.** That is intentional and should be said out loud when the sequence is reviewed: phases 0–3 are entirely infrastructure, sovereignty, and proof. The first phase a member could notice is 4.

## C4 · Sovereignty prerequisites

**Phase 0. Blocking. Not cleanup.** These satisfy Covenant 1; without them the lift makes MAIA's reach exceed the member's.

| # | Defect | Requirement | Census |
|---|---|---|---|
| **P1** | Export omits `conversation_turns`, atoms, episodes, breakthroughs, theme signals | The member can obtain their full corpus | §6.3 |
| **P2** | `episodic_recall_enabled` read every turn, exposed nowhere | The gate is member-writable | §6.1 |
| **P3** | `developmental_memories` + `member_theme_signals` have no consent gate and no epistemic status | Gate + status, or formal exclusion from participation | §6.1, §4 |

**P1 is the one that most directly gates the lane.** Making the Louisiana corpus machine-reachable while it remains member-unreachable is precisely the inversion Covenant 1 forbids: MAIA would gain a capability over the member's history that the member lacks over their own. This is also the plain reading of the growth-obligation check in `CLAUDE.md` — *every increase in capability must produce a matching increase in provenance, restraint, and transparency*. **P1–P3 are that matching increase.**

**Two further items, prerequisites for specific phases rather than for the lane:**

- **P4** — a correction path (Covenant 5, phase 7). Rejection ≠ revision; no layer supports revision today.
- **P5** — a contextual-constraint substrate (stage 5). A member cannot currently exclude a topic, a period, or a person from resurfacing. Stage 5 has a name and no substrate.

**Not repaired here**, per mandate. Recorded as blocking, with the disposition each requires.

## C5 · Cross-surface parity contract

**The claim to be enforced** (Covenant 6):

> Given the same authenticated member and an equivalent present encounter, iOS, PWA and Desktop invoke the same canonical intelligence-participation architecture — and this is provable, not asserted.

**Enforcement must be closed-set, not checklist.** The four documented failures of the voice gate (§3.4) are the argument: any contract that enumerates the systems it expects passes on the day an unknown one appears. The working pattern is compiler-derived closed sets where *"an unknown call fails BECAUSE IT IS UNKNOWN, without the gate ever learning its name."*

**Proposed contract, three parts:**

1. **Closed set — assembly call sites.** The complete set of call sites that construct MAIA context, derived from source. A new assembler fails because a new site appeared, whatever it does. This is the direct analogue of the exit set.
2. **Closed set — seam inputs.** The complete set of fields the seam reads to build the field. A route slipping in a client-supplied context field fails because the input set changed. *This is where client-determined MAIA would actually enter, so it is the load-bearing half.*
3. **Equivalence assertion.** For a fixed member + encounter, the seam's output is identical across declared surfaces. Surface may vary capture, modality, budget-for-latency, and rendering. It may not vary class membership, standing, gates, or epistemic framing.

**What "equivalent present encounter" must exclude**, or the contract is vacuous: surface, client version, session id shape (`session_*` vs `desktop-*`), transport, and modality are **not** part of encounter equivalence. Member identity, present input, mode, and consent state **are**.

**Deliberately left open**: whether tier (FAST/CORE/DEEP) is part of encounter equivalence. The census found `memoryContext` reaches FAST only and CORE declares the absence in code. If tier may vary the field, the contract must say *what* it may vary and what it may never vary. **§C7.**

## C6 · Participation-evidence and observability model

**The standard** (Covenant 7): *not "does it exist?" but "can we prove it participated in the living turn?"*

**The hard half, which no existing instrument covers**: proving **restraint** participated. A memory retrieved and deliberately not spoken leaves no trace unless the architecture is designed to leave one. Every observability mechanism in the codebase today records what *happened*; none records what was *declined*.

**Build on four working precedents rather than inventing:**

| Precedent | What it demonstrates |
|---|---|
| `MemorySelectionTraceEntry` (`MemoryBundle.ts:160-169`) | derived strictly *after* the cutoff; documented as unable to influence it |
| `emitTurnMemoryProvenance` + `bundleConsulted: false` (`maiaService.ts:1538-1559`) | **naming an absence as a first-class record** |
| `MEMORY_SELECTION_POLICY_VERSION` | the governing policy travels with the record |
| `runtime_events` + `deriveStatus` | substrate-level per-turn status |

**Proposed record — one per turn, per class:**

```
  encounter:        member_ref · session_ref · surface · tier · turn_id
  policy:           participation_policy_version
  per class:        eligible_count          (passed sovereignty gates)
                    retrieved_count         (entered stage 1)
                    resolved_count          (survived stage 2-3)
                    offered_count           (state OFFERED)
                    available_count         (state AVAILABLE — pointer only)
                    withheld_count + reasons[]
  restraint:        offers_made · offers_taken_up
  seam:             assembler_version · systems_participating[]
```

**The two fields that carry the standard**: `withheld_count + reasons[]` makes restraint *observable*, and `available_count` makes it *distinguishable from failure* — the difference between "MAIA had nothing" and "MAIA had something and did not bring it." Without them, a restrained turn and a broken turn are indistinguishable in production, and the architecture's central claim is unfalsifiable.

**Privacy constraint, non-negotiable**: counts, class labels, reason codes, and digests only. Never content, never titles, never entity names. The existing `memberRef()` / `digest()` discipline applies throughout. **An observability layer that records what MAIA declined to say must not become the place that says it.**

**Parity evidence** falls out for free: same member, same encounter, two surfaces, two records, compared field by field. §C5's equivalence assertion becomes a production query rather than a promise.

## C7 · Unresolved architectural questions

Ordered by how much they could change the architecture.

**Could change the architecture**

1. **What promotes AVAILABLE → OFFERED?** (§2.5) Member invocation only is safest but cannot serve Case 1, where the member *is* invoking. Explicit-query match at stage 2 is plausible. A sensitivity classifier is machine judgment about what is painful and probably falls to the same objection as S3. **This is where D could still go wrong.**
2. **Does stage 2 require model inference?** (§2.3) "That relationship I told you about" may not be structurally resolvable. If it needs a model, machine judgment enters *before* epistemic adjudication and D violates its own ordering — which would need either a reordering or an explicit, bounded exception.
3. **Is there a latency budget for D at FAST?** Unmeasured. FAST targets <2s and already parallelises three subsystems. If D does not fit, either tiering changes or the architecture does.
4. **May tier vary the field?** (§C5) Unanswered, and it determines whether the parity contract is meaningful or vacuous.
5. **What member gesture declares supersession?** (§2.4 S2) Case 4's real answer is a product-design question with no current vocabulary — and it depends on P4, which does not exist.
6. **What would "the member endorsed this inference" look like?** Carried from census Unknown #9. Without it, `provisional` is a label with no mechanism, and P3's "gate + status" option may be unreachable — leaving formal exclusion as the only honest disposition for the inferred layers.

**Could change the estimate, not the shape**

7. **Corpus scale across the member base.** One member: 446 turns / 24 sessions / 7 days. Distribution unknown. Determines whether embedding backfill is hours or weeks, and whether stage 1 is a 10k-row or 10M-row problem.
8. **Is Ollama reachable from `maia-sovereign`?** `generateLocalEmbedding` has a 2s timeout and returns `[]` on failure. Query-time embedding and corpus-wide backfill have very different profiles. Unmeasured.
9. **Are `developmental_memories` rows actually distilled, or mostly guard-rejected?** If most fail `isValidDistilledSignal`, that layer is thinner than it appears and its Case-6 exposure correspondingly smaller.
10. **Does `breakthrough_moments` contain member-marked rows at all?** Determines salvage vs. exclusion.
11. **What is in `member_theme_signals` at volume?** Ungated, unbounded, fire-and-forget, per-turn — plausibly the largest inference table in the system, entirely unaudited.

**Governance**

12. **Who authors standing order and class budgets?** §2.2 makes these declared policy. `MEMORY_SELECTION_POLICY_VERSION` establishes the versioning convention; it does not establish who may bump it.
13. **Does MIPA become canon, or remain an architecture document?** Covenants 1–8 read as canon. Several generalise existing canon (Right to Remain Unpossessed, Interface Humility, Recognition Integrity, Constitutional Direction of Authority). Whether they belong in `MAIA_SOVEREIGNTY_INVARIANTS.md` or a separate instrument is Kelly's call.

---

## STOP

Per the lane's stop rule: **architecture only. Nothing implemented.**

No client wired. Semantic retrieval not activated. The three sovereignty defects recorded as blocking prerequisites and **not repaired**. The seam not promoted. No migration begun.

Awaiting Kelly's architectural adjudication on:

- **C1** — Candidate D as the recommended architecture, and the three things the evidence does not yet warrant
- **§2.1** — the stage-4 gate placement divergence (SQL filter vs. explicit stage)
- **§3.3** — the seam-location divergence (at turn construction, not after cognition)
- **C2** — Covenants 1–8, and whether they become canon
- **C3** — the migration sequence, and specifically that phases 0–3 add no member-visible recall
- **C7 items 1–4** — the questions that could still change the shape

