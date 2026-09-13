# JARVIS-ORCHESTRATION-BOUNDARY-01 — Founder Rulings

**Date:** 2026-09-13 · **Branch:** `claude/bold-bohr-pmtynu`
**Intake of record:** `JARVIS-ORCHESTRATION-BOUNDARY-01_INTAKE_2026-09-13.md`
**Companion:** `WS-EXTERNAL-INTAKE-01_CHAPTER_CENSUS_AND_DOCKET_2026-09-13.md`
**Standing after these rulings:** ⛔ **LANE STILL NOT OPENED.** No code · no schema · no
producer registered · **CMT-01 M3 remains explicitly unauthorized** · no runtime name adopted.

---

## 0 · ⚠️ Act basis (read before relying on this document)

The founder supplied the ratified text verbatim, named D-J1 as the next act, bound D-J5 to it,
and issued a sequencing directive. It is recorded here as **performed**.

⚠️ The founder's phrasing was *"I would ratify it in this form"*. Jarvis has read that as the
act, not as a proposal, **because the canonical text was supplied and a sequence was ordered
from it**. If that reading is wrong, one line reverts FR-J1/FR-J5 to CANDIDATE: nothing
depends on them yet — no code, no schema, no claim. ⛔ Recorded rather than assumed silently,
because a ruling taken slightly early is the same class of error as a migration deployed
slightly early.

---

## 1 · FR-J1 — The Orchestration Boundary · **RATIFIED**

> **MAIA is the singular relationship with the member. A governed orchestration layer may
> carry the multiplicity of capabilities, models, tools, memories, and specialized
> intelligences behind MAIA. That multiplicity is not exposed to the member as a roster of
> agents or competing identities. The orchestration layer may coordinate participation; it
> does not thereby acquire authority over the member or the Work. Its runtime name remains
> unresolved pending the naming ruling.**

### ⭐ The founder's surgical correction, recorded as the substance of the act

The intake contained a logical collision: **D-J1 canonized "Jarvis = orchestration" while
D-J6 still asked whether "Jarvis" should be the runtime name at all.** Ratifying D-J1 as
drafted would have settled D-J6 by accident — *the law would have been carried into canon by
its own working title*. The amendment separates them.

⛔ **Consequence, binding immediately:** until D-J6 is ruled, **"Jarvis" may not appear as a
runtime identifier** — no module, type, table, column, log marker, env var, or member-facing
string. The provisional term in documents is **"the orchestration layer"**, which is a
description, not a name. "Jarvis" remains what it has been in this repository: the *programme*
word (`JARVIS-CIRCLES-01`, `JARVIS-RD-…`), meaning the governed build intelligence.

### What FR-J1 does and does not grant

```text
GRANTS                                    DOES NOT GRANT
coordination of participation             authority over the member
multiplicity behind one relationship      authority over the Work
a governed layer                          a second voice, persona, or identity
                                          a runtime name
                                          any producer registration
                                          CMT-01 M3
```

⭐ **The clause that carries the most weight is the third sentence**: *coordinating
participation does not thereby acquire authority*. It pre-empts the ordinary drift by which an
orchestrator that decides *what is considered* gradually becomes the thing that decides *what
is true*. It is the same direction-of-authority constraint as Invariant 16, applied to
machinery rather than to development.

### Evidentiary basis (census, `e1c6f527`)

Ratified against built code, not intention: `lib/maia/canonical-turn/` holds a closed producer
registry, `adjudicateParticipation()` classifying participation deterministically before one
response is rendered, a content-free manifest, one renderer, one identity resolver. Corpus
Callosum is the live multiplicity (`agent_runs` / `integration_passes`, production rows).
⭐ **This law names an existing architectural principle; it does not invent a second one.**

---

## 2 · FR-J5 — Answerability · **RATIFIED, as sibling to FR-J1**

> **Not surfaced by default; never concealed when asked.**

Stated in two parts, deliberately inseparable:

1. **Default experience** — multiplicity remains behind MAIA.
2. **Accountability** — everything that *materially participated* must be answerable on request.

⭐ The founder's binding of D-J5 to D-J1 closes the failure mode the intake named (J-F6):
**invisible orchestration drifting into unaccountable orchestration.** The two are now one
law in two directions; neither may be cited without the other.

⛔ **Named refusal:** *unanswerable orchestration.* If something materially participated and
cannot be named on request, that is a defect against FR-J5 — not a performance tradeoff, not a
UX simplification.

### The answer shape the founder specified

The member never sees a roster. The member may ask *"Why did you tell me this?"* and receive,
in MAIA's single voice, what was considered, which author rulings applied, which sources —
**and where analyses disagreed, the disagreement preserved rather than resolved on their
behalf.**

⚠️ **Open question this creates, not settled here:** *materially participated* needs a
definition before it can be enforced. Producer considered-but-excluded (already in the
content-free manifest) is not obviously the same as *materially participated*. That definition
belongs to D-J3 (the single provenance contract), where the three existing traces
(`selectionTrace` · `readerProvenance` · `canonical-turn/manifest`) must agree on one answer.

⭐ **Founder refinement, 2026-09-13 — at least four distinct states lurk inside the phrase and
must not be collapsed casually:**

```text
KNOWN TO EXIST      ≠   CONSIDERED   ≠   USED / CONTRIBUTED   ≠   AFFECTED THE RESULT
```

They diverge exactly where it matters, because *"what did you use to reach this?"* and *"what
was available to you?"* are different questions with different sovereignty weight. ⛔ Not
defined here; D-J3 is the place.

---

## 2b · FR-J6 — Naming · **RULED: NO RUNTIME PROPER NAME**

> **"Jarvis" remains exclusively the programme / build-intelligence word. The runtime
> architecture governed by FR-J1 has no separate proper name at this stage. "The orchestration
> layer" and "orchestration" are descriptive terms, not named entities.**
>
> **No umbrella module, service, schema object, database object, runtime identity, agent
> identity, or member-facing persona is to be created merely to instantiate an
> orchestration-layer name. Existing runtime components retain their existing names until
> their architectural relationship is settled under D-J2.**
>
> **Functional identifiers may describe what a component actually does — participation,
> adjudication, provenance, routing, jobs — but the descriptive vocabulary must not manufacture
> a new central actor.**

### The three-way separation now fixed

```text
JARVIS          programme / governed build intelligence
MAIA            the singular relational identity
orchestration   a runtime function/boundary — NOT another being
```

⭐⭐ **The architecture does not need another noun.** The founder's reasoning is recorded
because it is the load-bearing part: naming the layer now — `Conductor`, `Nexus`,
`Orchestrator`, anything — would invite the exact drift FR-J1 exists to prevent.

```text
MAIA  →  THE NEW THING  →  everything else
```

A named thing acquires APIs, authority, state, dashboards, and eventually a conceptual life of
its own. ⛔ **FR-J6 therefore refuses to presuppose that an orchestration object exists at all** —
that question is D-J2's, and this ruling deliberately does not settle it.

### ⭐ The falsifier: architecture-by-noun

A future change **fails FR-J6** if its justification reduces to:

> *"We need somewhere to put the orchestration layer."*

A component exists because a **specific responsibility** requires it —

```text
bounded-job lifecycle · provenance contract · participation adjudication ·
model-material permission · dependency invalidation
```

— never because something called *the orchestrator* ought to exist. ⭐ This is testable at
review time against any diff, which is what makes it a law rather than a preference.

### Compliance census (`e1c6f527`) — read before assuming either compliance or breach

- ⭐ **Every occurrence of "Jarvis" in runtime code today is already the ruled usage.** All
  hits are lane citations in comments plus one provenance value —
  `registeredBy: 'JARVIS-MEMORY-ORGANISM-PASS1-DIVINATION-01'` in
  `lib/maia/canonical-turn/producerRegistry.ts`. That names the **governing lane that
  registered a producer**, i.e. build provenance, not a runtime actor. **Compliant, and
  precedent for how the word may appear at all.**
- ⚠️ **`Conductor` was never available**: `lib/voice/conductor.ts` already owns it (Bridge D
  element/phase hysteresis). One of the candidate names the ruling declines was a collision
  regardless.
- ⚠️ **Three pre-existing `*Orchestrator` identifiers exist** — `lib/ai/multiEngineOrchestrator.ts`,
  `lib/field/ResonanceFieldOrchestrator.ts`, `lib/consciousness/collective/CollectiveFieldOrchestrator.ts`.
  ⛔ **FR-J6 does not retroactively condemn them**; it forbids creating a new central actor.
  They are recorded because `multiEngineOrchestrator` sits squarely in **D-J7** territory
  (model routing), and D-J7 must decide whether that is the seam to constitute or a legacy
  name that would smuggle a central actor in through the back door. ⛔ Not decided here.

### What FR-J6 does not settle

```text
⛔ whether a distinct orchestration object is needed at all        → D-J2
⛔ whether CMT-01's contract is extended or something new is built → D-J2
⛔ what any future component is called                             → its own responsibility
```


---

## 2c · FR-J2 — CMT-01 is the canonical participation boundary · **RULED: EXTENSION**

> **The orchestration function extends CMT-01's governed producer/participation model. No
> separate orchestration object is admitted.**
>
> **CMT-01 governs what material may participate in a MAIA-authored turn. It does not thereby
> become the execution substrate for retrieval, research, model routing, bounded jobs, evidence
> analysis, memory operations, or other capabilities. Those responsibilities may have their own
> bounded implementations and contracts.**
>
> **When the output of any capability, model, tool, job, memory process, or specialized
> intelligence may contribute to a member-facing MAIA turn, that material must cross the
> canonical participation boundary before it can influence the rendered response. Nothing may
> bypass that boundary by composing directly into MAIA.**
>
> **A capability is not a producer merely because it ran. A model is not a producer merely
> because it reasoned. A job is not a producer merely because it completed. The
> producer/participant is the classified material offered for participation in the turn.**

⛔ **This ruling does not authorize CMT-01 M3, register any new producer, alter the registry,
open a Writer's Studio lane, or authorize any new execution substrate.**

### ⭐ The distinction that carries the ruling: admission boundary, not execution engine

```text
ADMITTED                                  REFUSED (god object)
capability / model / tool / job           CMT-01
          │ produces                       ├── runs research
          ▼                                ├── routes models
       MATERIAL                            ├── executes jobs
          │ provenance + authority         ├── retrieves memory
          │ + participation class          ├── maintains graphs
          ▼                                └── adjudicates everything
   CMT-01 / MIPA boundary
   admitted / held / excluded
          ▼
   singular renderer → MAIA → member
```

⭐ It is a **constitutional extension of the participation contract, not an implementation
expansion of CMT-01.** ⛔ No `lib/orchestration`. No universal manager. No separate object.

### ⭐⭐ The law underneath

> **Execution does not confer participation. Participation does not confer authority.**

Two clauses, two different failure modes, joined to FR-J1:

- A research agent may run and find twelve papers — **that does not mean twelve findings enter
  MAIA's thought.**
- A bounded Work sweep may generate thirty observations — **that does not make them
  member-facing truth.**
- A model may reason about the manuscript — **that does not make the model a voice in the
  relationship.**

⭐ CMT-01 decides what material is **eligible to participate**. It still does not decide what
is **true**. That second clause is the same constraint FR-J1 places on the orchestration
layer, now placed on the boundary itself — so the boundary cannot become the authority by
virtue of being the gate.

### What this settles for the not-yet-built substrates

Bounded jobs stay **outside** CMT-01, and reach MAIA only as offered material:

```text
WHOLE-WORK JOB  commissioned → frozen → executes → produces findings → persists findings
                                                                              │
                                              later MAIA encounter · relevant finding offered
                                                                              ▼
                                                                          CMT-01
```

Identically for the future evidence graph (`research → evidence graph → retrieval → candidate
material → CMT boundary → MAIA`) and for model routing. ⭐ **Background infrastructure can
therefore scale independently without creating a second route into MAIA** — which is the
scaling answer and the sovereignty answer in one move.

### Falsifiers

| | Fails FR-J2 when |
|---|---|
| **F-J2.1 · Bypass** | material produced by a tool, model, job, memory system, Studio analyzer, or research system can influence the rendered MAIA response **without crossing the canonical participation boundary** |
| **F-J2.2 · God-object expansion** | CMT-01 gains a responsibility merely because *"orchestration needs to happen somewhere"*. Research execution, queues, routing, retrieval, dependency invalidation each require their own responsibility-based seam |
| **F-J2.3 · Actor/material collapse** | every executing model, agent, tool or job is registered as a producer **merely because it executed**. What participates is classified material, not the machinery that produced it |

```text
WRONG                       RIGHT
producer: GPT-6             external.research_finding
producer: Scite             computed.work_observation
producer: ResearchAgent     retrieved.author_ruling
producer: ContradictionWorker   member.source_material
```

⭐ with **provenance** naming which machinery produced or retrieved it. That preserves the
distinction D-J3 now needs: *source/provenance says where this came from; participation says
what role it was allowed to have.*

### ⭐⭐ Compliance census (`e1c6f527`) — F-J2.3 is **already satisfied in canonical**

`lib/maia/canonical-turn/producerRegistry.ts` holds **50 producers across ten namespaces**:

```text
member. 10 · computed. 10 · retrieved. 5 · inferred. 5 · floor. 5 ·
declared. 5 · house. 4 · practitioner. 3 · collective. 2 · system. 1
```

⭐ **Not one producer names a model, vendor, agent, worker or service.** Every id names
*material*, and the prefix names *how that material came to be* — authored by the member,
retrieved, computed, inferred, declared, or placed by the floor. The registry is already the
founder's RIGHT column, built. FR-J2 ratifies an existing discipline rather than imposing a
new one.

⭐ **The prefix grammar is already a provenance-class vocabulary**, and D-J3 should begin from
it rather than invent a parallel one — `retrieved.` vs `computed.` vs `inferred.` is precisely
the *"what kind of knowing is this"* axis the provenance contract needs.

### ⚠️ Correction to this lane's own earlier standing

⛔ **Earlier documents in this lane (including §6 of the intake and the FR-J1/FR-J6 standing
blocks) state "PRODUCERS REGISTERED — NONE". That is wrong as an absolute claim and is
corrected here rather than deleted.**

Writer's Studio producers **already exist in the registry**:

```text
floor.writer_role_boundary · member.writer_focus · retrieved.writer_work_context ·
computed.writer_structure · member.writer_intention · member.writer_commission ·
system.writer_pursued_observation
```

and `writers_studio` is a registered room. What is true is narrower and still holds:
**this lane has registered nothing, and registers nothing by these rulings.** ⚠️ Also noted:
the registry now holds 50 producers where the CMT-01 census recorded 38 — it has grown since.
⛔ Nothing is inferred from that about M3, which remains unauthorized.

*A standing line that overstates a gate is the same class of error as one that overstates a
capability; the repair is to date it and correct it in place.*


---

## 2d · FR-J3 — Provenance · **RULED: ONE SEMANTIC CONTRACT, MANY TRACES**

> **There is one semantic provenance contract across MAIA, but no universal provenance object,
> store, service, or runtime actor is thereby authorized. Existing and future subsystems may
> retain bounded traces appropriate to their responsibility, provided those traces use the same
> meanings and can be truthfully correlated across a derivation chain.**
>
> **Provenance answers how material came to be and what happened to it. It does not establish
> truth, authority, significance, or correctness.**

⭐ **The contract unifies what the words mean, not where the records live.** ⛔ No
`provenanceGodObject`, no `universal_provenance` table, no central provenance agent — which
would be F-J2.2 (god-object expansion) arriving through the provenance door.

### ⚠️ Census correction recorded before the ruling: there are **five** instruments, not three

The docket named three. The founder's census found two more, and both are confirmed at
`e1c6f527`:

| Instrument | Responsibility | Confirmed |
|---|---|---|
| `lib/memory/MemoryBundle.ts` — `selectionTrace` | ranking + survival of a cutoff | ⭐ observational by its own comments |
| `lib/manuscript/structure/readerProvenance.ts` | **execution attribution** — provider · actual model · promptHash · readerVersion · frozenAt | ⭐ not source selection, not causal influence |
| `lib/maia/canonical-turn/manifest.ts` | content-free **participation** evidence | ⭐ |
| ⭐ `lib/memory/provenance/turnMemoryProvenance.ts` | retrieval / context assembly — `requested` vs `returnedMaterial`, whether the bundle was consulted, which context origin supplied assembly | ⭐ **already refuses provenance-as-truth in its own header** (*"be read as proof that retrieved material is true"* — listed as a thing it must not be) |
| ⭐ `lib/memory/stores/ConversationMemoryUsesStore.ts` | durable, provenance-adjacent rows in `conversation_memory_uses` | ⚠️ **the live exposure — see below** |

⭐ These are **correctly bounded for different responsibilities and should remain different
instruments.** Execution attribution, participation evidence, selection ranking and retrieval
assembly are four different questions; one table answering all four would answer none of them
honestly.

### ⭐⭐ The confirmed F-J3.1 exposure, stated precisely

`ConversationMemoryUsesStore.recordRetrievedCandidates()` writes **one row per retrieved
memory, explicitly before compression and selection** — its own comment reads *"Call this right
after the retriever returns candidates, BEFORE compression."* Those rows land in a table named
`conversation_memory_uses`, and each candidate carries a field named **`usedAs`**.

⛔ **So the promotion is structural, not merely nominal**: the table name *and* the field name
both assert `used` over material whose established state is `KNOWN TO EXIST` / retrieved.
Called from three sites — `lib/sovereign/maiaService.ts:863`, `lib/memory/MemoryBundle.ts:131`,
`app/api/voice/stream-conversation/route.ts:1319`.

⛔ **Consequence, binding now:** rows in `conversation_memory_uses` **may not be cited as
evidence that memory contributed to, or affected, any response** merely because they live under
`*_uses`. ⛔ **No rename is authorized today** — the ruling governs what may be claimed from the
rows, not what the table is called.

### The four non-collapsible states

```text
KNOWN TO EXIST  ≠  CONSIDERED  ≠  CONTRIBUTED  ≠  EFFECT ESTABLISHED
```

**No state implies the next.**

**`KNOWN TO EXIST`** — a specific source, material item, derived artifact or candidate was
established to exist within the authorized execution scope. ⛔ It does not mean the system
evaluated it.

**`CONSIDERED`** — that specific referent was actually evaluated for possible selection,
participation or execution. ⭐ **Consideration of a producer *class* does not establish
consideration of every material item potentially belonging to that class.** ⚠️ Named against
the live implementation: the canonical manifest's `producersConsidered` is generated from the
producers *registered for the room* — it is not a declaration that every possible piece of
their material was inspected.

**`CONTRIBUTED`** — the material, or a traceably derived representation of it, actually crossed
an execution boundary as input to a process on the lineage producing the result.

```text
DIRECT     material → served cognition
UPSTREAM   source → bounded analysis → finding → served cognition
```

⭐⭐ **This is the binding of FR-J5's phrase:** *materially participated* **= CONTRIBUTED,
directly or through an intact derivation chain.* ⛔ It still does not mean the material changed
the result.

⚠️ **Current-state caveat:** CMT-01 is still **M2 / shadow**. An `ADMITTED` row in the shadow
canonical-turn manifest therefore **does not establish contribution to the live served
response** — the types themselves still describe M2 as shadow construction. ⛔ Until M3, the
manifest is evidence about the shadow, not about what reached the member.

**`EFFECT ESTABLISHED`** — there is valid evidence that the resulting artifact or response
actually depended upon the contribution.

> ⭐⭐⭐ **Supplying material to a generative model does not establish that the material
> affected its output.**

Normal model execution therefore usually yields:

```text
CONTRIBUTED         YES          not         CONTRIBUTED         YES
EFFECT ESTABLISHED  UNKNOWN                  EFFECT ESTABLISHED  YES
```

A subsystem may establish effect **only** where it has a legitimate lineage or causal witness
appropriate to that process. ⭐ Where effect cannot be established, **`unknown` is the truthful
state — not false, and not assumed true.**

The member-facing consequence, which is the point of the whole ruling:

> *"That passage was supplied to the cognition that produced my response. I can establish that
> it contributed to the context; I cannot establish that it changed the wording of my answer."*

### The four axes that must never collapse

```text
ORIGIN CLASS     how did this material come to be?      member. retrieved. computed. inferred. declared.
PROCESS STATE    what happened to it this time?         known · considered · contributed · effect
PARTICIPATION    what role was it permitted to have?    admitted · held · excluded
AUTHORITY        what may it mean / establish?          (never conferred by any of the above)
```

⭐ This corrects the D-J2 note that the registry prefixes could seed the provenance vocabulary:
they are **valuable but answer a different question**. Origin class is not process state.

```text
inferred.     does NOT mean  considered
retrieved.    does NOT mean  contributed
ADMITTED      does NOT mean  authoritative
CONTRIBUTED   does NOT mean  true
CONTRIBUTED   does NOT mean  effect established
```

### ⛔ `used` is refused as canonical vocabulary

> **`used` is not a canonical provenance state. An internal trace must use the strongest term
> it actually establishes — retrieved · known · considered · selected · admitted · supplied ·
> contributed · referenced · effect-established — and may not promote one into another for
> convenience.**

### Falsifiers

| | Fails FR-J3 when |
|---|---|
| **F-J3.1 · Semantic promotion** | a retrieved/known item is recorded or reported as considered, contributed or influential without evidence for that stronger state |
| **F-J3.2 · Causal inflation** | material being placed in a model/context is treated as proof that it affected the resulting response |
| **F-J3.3 · Referent collapse** | consideration of a producer/source *class* is reported as consideration of every underlying item |
| **F-J3.4 · Authority inflation** | any provenance state is treated as evidence that the material is true or authoritative |

### Privacy discipline preserved

Provenance instruments remain **observational and content-minimal**. ⛔ A provenance trace must
not quietly become another memory source. ⭐ This is not new: the discipline is already explicit
in both `turnMemoryProvenance` and the content-free canonical manifest, and the ruling preserves
it rather than introducing it.

### The member-answerability contract FR-J5 now has

```text
"What was available?"      → KNOWN TO EXIST
"What did you consider?"   → CONSIDERED
"What did you actually use?" → CONTRIBUTED  (direct + upstream lineage)
"What changed your answer?" → EFFECT ESTABLISHED where provable;
                              otherwise "I cannot establish that."
```

⭐ **This operationalizes FR-J5 without pretending to know more about model causality than we
do** — which is the rare shape where the rigorous answer and the honest answer are the same
answer.


---

## 2e · FR-J4 — Unreconciled Disagreement · **RULED: REPRESENTABLE, NEVER SILENTLY COLLAPSED**

> **A substantive disagreement among legitimate contributions may remain unresolved and may be
> represented to the member. The system may not collapse such disagreement into a single
> conclusion merely because synthesis is available.**
>
> **Disagreement does not itself confer truth, authority, equality of standing, or
> member-facing visibility. It becomes a truth-bearing condition when materially relevant
> contributions address the same question or referent, remain meaningfully incompatible after
> clarification, retain valid provenance, and no already-constituted authority is entitled to
> resolve the difference.**
>
> **Where such a disagreement materially bears on what MAIA can responsibly say, the
> disagreement must survive synthesis. MAIA may reflect it, distinguish its terms, or offer a
> possible reconciliation; MAIA may not silently settle it.**

### Bind, do not author — verified against canon

⭐ FR-J4 is an **operational binding of `docs/canon/DISCIPLINED_NON_COLLAPSE.md`**, not a
parallel doctrine. The four orientations it rests on are **literally a table in that canon**
(lines 32-37, read at `e1c6f527`):

```text
persuasive coherence   →  phenomenological fidelity
interpretive closure   →  living tension
confident abstraction  →  situated tentativeness
consensus flattening   →  multivalence
```

The ruling adds only what that discipline **requires when multiple governed contributions
participate in cognition**. Nothing new is authored.

### 1 · What qualifies as substantive disagreement — all five, or it does not qualify

1. **Common referent** — the contributions address the same material question, claim,
   interpretation, structural issue or decision.
2. **Meaningful incompatibility** — accepting one would materially alter, qualify or oppose
   what could responsibly be said if the other were accepted.
3. **Traceable basis** — each live position has sufficient provenance **under FR-J3** to
   establish where it came from and what contributed to it.
4. **Material relevance** — the divergence matters to the present Work, decision,
   understanding or answer.
5. **No existing authority resolves it** — no member-authored ruling, constitutional
   constraint, deterministic fact or other constituted authority legitimately settles it.

```text
two stochastic completions differ   ≠  substantive disagreement
two paraphrases differ              ≠  substantive disagreement
one contribution plainly stale      ≠  substantive disagreement
two evidence-grounded readings
  remain incompatible               =  candidate unresolved disagreement
```

### 2 · Disagreement does not imply equality

⭐ **Preserving multiplicity is not manufacturing equivalence.** Differences in **authority ·
provenance · evidentiary support · scope · confidence · member authorship · constitutional
standing** are retained, not flattened by the act of representing a difference.

- A member-authored ruling and a system inference do not become two equal "sides".
- A well-supported source position and an unsupported speculation are not balanced merely
  because they differ.
- A constitutional constraint is not placed into debate with an inference that violates it.

⛔ FR-J4 refuses **both** premature collapse **and** false balance. ⭐ That pairing is what
keeps the ruling from becoming relativism.

### 3 · Who may resolve — synthesis confers no resolution authority

```text
member meaning / intention / authorship  → member may resolve
constitutional boundary                  → canon may resolve
deterministic source fact                → verified source may resolve
governed mechanical invariant            → invariant may resolve
unresolved interpretive plurality        → remains unresolved unless the member rules
```

MAIA may help examine a disagreement, propose a reconciling distinction, and say that one
reading currently has stronger evidence. ⛔ **MAIA may not turn any of those acts into
authority merely by producing a fluent synthesis.** For member-owned meaning and the Work, the
system offers **Reflection**; the member authors **Recognition** — the upward-only direction of
`CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md`, applied to machinery.

### 4 · Synthesis is permitted — as a new contribution, not an erasure

```text
ADMITTED                        REFUSED
READING A ─┐                    READING A + READING B
           ├── proposed C                  ↓
READING B ─┘                          TRUE ANSWER C
A and B remain traceable                  ↓
                                 A and B disappear
```

A synthesis may reveal that an apparent disagreement came from different definitions, scopes,
time periods, speakers or levels of abstraction. Where that is **demonstrably established**,
the prior conflict may be classified **reconciled — with the reconciliation basis preserved**.
Where it cannot be established, ⭐ **the tension remains live.**

### 5 · Member-facing singularity intact

```text
"I can see two live readings of this."      not   "Agent A disagrees with Agent B."
```

FR-J1 and FR-J5 continue to govern: multiplicity beneath · one MAIA relationship · answerable
provenance on request. If asked, MAIA explains the **bases** of the disagreement without
turning models, agents, tools or workers into personalities.

### 6 · Relationship to FR-J3

FR-J3 remains controlling. ⛔ **The existence of two candidate analyses does not establish that
both materially participated** in a member-facing response —
`KNOWN ≠ CONSIDERED ≠ CONTRIBUTED ≠ EFFECT ESTABLISHED` holds inside a disagreement exactly as
it holds outside one. If a disagreement itself contributes to what MAIA says, the derivation
chains that make that participation answerable must remain intact.

### 7 · Falsifiers

| | Fails FR-J4 when |
|---|---|
| **F-J4.1 · Silent collapse** | two qualifying unresolved contributions become one conclusion and the difference disappears without legitimate resolution authority |
| **F-J4.2 · Synthesis inflation** | an integrator, router, model or MAIA synthesis is treated as resolution merely because it produced a coherent combined answer |
| **F-J4.3 · False equivalence** | preserving disagreement elevates a lower-authority, unsupported, invalid or constitutionally disallowed contribution into equal standing |
| **F-J4.4 · Roster exposure** | disagreement is represented by exposing internal agents/models/tools as member-facing personalities or competing identities |
| **F-J4.5 · Disagreement inflation** | ordinary stochastic variance, stylistic difference, compatible perspectives or paraphrase variation is persisted or surfaced as substantive conflict |

### 8 · Named refusal — **consensus by machinery**

> ⭐⭐⭐ **No integration process may treat disappearance of disagreement as evidence that
> integration succeeded.**

```text
NOT the success condition        many → one

THE success condition            many → the most faithful representable
                                 relationship among them
```

which may legitimately be **one answer · a qualified answer · several compatible perspectives ·
or an unresolved living tension.**

⭐ This catches a failure mode endemic to multi-agent architecture: most orchestration measures
integration by whether multiplicity successfully became one output. ⭐ **Sometimes the most
faithful integration is the preservation of irreducibility.**

### Census note (`e1c6f527`) — what exists today, stated conservatively

`lib/consciousness/WisdomRouter.ts` describes itself as connecting *pattern detection to wisdom
agent voice **selection***, and `lib/services/corpusCallosumService.ts` is the sole writer of
`integration_passes`. ⭐ **Selection is not reconciliation**: nothing read here represents,
preserves or adjudicates disagreement between voices. ⚠️ **Consequence for the record:** the
~49% integration figure in CLAUDE.md is a **selection rate**, and must not be read as evidence
that multiplicity is being preserved or that disagreement is being handled. ⛔ Scope of this
note: the router's header and its selection vocabulary, plus the table's sole writer — the
implementations were **not read in full**, and no defect is asserted against them.

### 9 · What this ruling does not authorize

```text
⛔ no disagreement schema or table      ⛔ no new producer          ⛔ no agent roster
⛔ no Writer's Studio feature           ⛔ no WisdomRouter change   ⛔ no CMT-01 M3
⛔ no bounded-job substrate             ⛔ no claim that current runtime preserves disagreement
```

⭐ FR-J4 establishes the **semantic and authority contract only.** Implementation and liveness
require their own census, design, falsification and authorization.


---

## 2f · FR-J7 — Model / Material Routing · **RULED: CONSENT PRECEDES SELECTION**

> **Model routing is first an authorization decision and only afterward a capability,
> performance, latency or cost decision.**
>
> **Before member material may be supplied to any inference process, the system must determine
> which execution boundary is authorized for that material and purpose. Model selection occurs
> only within the resulting authorized set. Neither a caller, capability, model, fallback path
> nor optimization process may enlarge that set.**
>
> **A more capable, faster, cheaper or otherwise preferable model is not an authorized model
> merely by virtue of being preferable.**

### 1 · The governed object is the material crossing a boundary

⛔ FR-J7 does not constitute a universal model router. It governs a relationship:

```text
MATERIAL + PURPOSE + CONSENT/CUSTODY + EXECUTION BOUNDARY
                        ↓
              AUTHORIZED MODEL SET
                        ↓
       capability / quality / latency / cost selection
```

```text
NEVER FIRST   Which model should do this?
ALWAYS FIRST  May this material cross that boundary for this purpose at all?
```

### 2 · Two execution-jurisdiction classes, sufficient at this stage

**SOVEREIGN** — inference within infrastructure constitutionally designated as inside the
controlled Soullab/member trust boundary. **EXTERNAL** — inference beyond that boundary through
a third-party model or inference service.

⭐ **Jurisdiction classes, not vendor names and not capability rankings.** A future architecture
may distinguish further trust boundaries if an actual responsibility requires it; ⛔ FR-J7 does
not manufacture categories in anticipation.

### 3 · Material carries an egress disposition

```text
LOCAL_REQUIRED               external inference is not authorized
EXTERNAL_PERMITTED           external inference authorized for the stated purpose
NO_MEMBER_CONSENT_REQUIRED   not member-about/private material; no member authorization
                             required for external processing
```

⛔ **Semantic states — not hereby authorized type names, fields, enums, columns or schema.**
The system may implement the contract differently provided it can establish the same facts.

### 4 · Transformation does not erase custody

> **Derived material inherits the routing restriction of the material from which it was derived.**

```text
local-only journal      → summarize   → summary remains local-only
local-only Work passage → embed/extract/analyse → derived representation remains local-only
restricted + unrestricted → compose   → combined payload carries the MORE restrictive boundary
```

unless the materials remain **technically separable** and only the authorized subset crosses.

⛔ Compression, paraphrase, embedding, summarization, anonymization-by-description, or
conversion into an inference **must not become accidental declassification mechanisms.**
⭐ A change in routing authority requires a **legitimate authorization act**, not a
transformation operation.

### 5 · Minimum necessary material

Authorization to use an external model is **not** authorization to send everything available.

```text
RIGHT   task → determine necessary scope → resolve authorization for that scope → send bounded material
WRONG   external model permitted → send member context → let the model decide what matters
```

⭐ Whole-Work access, memory, Studio materials, source libraries, conversations and surrounding
member context remain **distinct scopes**. Permission for one does not silently authorize the
others.

### 6 · Mixed material obeys the most restrictive unresolved component

Given `A EXTERNAL_PERMITTED` and `B LOCAL_REQUIRED`, exactly two lawful choices:

```text
1. execute the combined operation inside the sovereign boundary
2. remove B completely and perform an external operation whose result does not depend upon B
```

⛔ It may not summarize, conceal, transform or indirectly encode B merely to make the external
call possible.

### 7 · The caller may request capability; it may not request permission

A cognitive surface may request *structured reading · deep reasoning · research synthesis ·
large-context analysis · creative generation*. ⛔ It may not thereby select a less restrictive
execution jurisdiction.

> **No caller-controlled flag, metadata field, model name, provider name, task label or
> fallback request may increase the permitted egress of member material.** The routing
> authority must be resolved **outside the caller's discretionary control.**

### 8 · Fallback may contract permission; it may never expand it

```text
LAWFUL     authorized external → failure → authorized sovereign (operation still semantically valid)
UNLAWFUL   LOCAL_REQUIRED → local unavailable → EXTERNAL   (without a new authorization act)
```

If no capable execution path exists inside the authorized set, the lawful result is **refusal ·
degraded capability · deferred operation** — ⛔ never silent egress.

> ⭐ **Availability does not create consent.**

### 9 · Provider/model provenance remains mandatory

For every completed model operation capable of contributing downstream, provenance must
establish at minimum: **purpose/operation class · execution jurisdiction · actual provider ·
actual model · material scope or scope reference · authorization basis · time/version.**

⭐ Extends FR-J3. ⛔ It does not establish that the output is true — it establishes what
execution occurred and under what authority. Where output later contributes to a MAIA turn,
FR-J2 and FR-J3 remain controlling: *execution does not confer participation; participation
does not confer authority; contribution does not establish effect.*

### 10 · Economics comes last

```text
CONSENT / CUSTODY → AUTHORIZED EXECUTION SET → CAPABILITY FITNESS →
QUALITY / LATENCY / AVAILABILITY → ECONOMICS
```

⛔ **never the reverse.** ⭐ **Cost optimization across unauthorized boundaries is not
optimization; it is a consent violation.**

### 11 · Status of `multiEngineOrchestrator`

⛔ `lib/ai/multiEngineOrchestrator.ts` is **not constituted as the FR-J7 routing authority.**
Its present responsibility is bounded local multi-model execution over Ollama models. Its
pre-existing `Orchestrator` name is **not retroactively prohibited by FR-J6** and does not
establish a central runtime actor. FR-J7 neither renames nor elevates it. If it handles member
material it remains subject to the same material-authorization and provenance contract as any
other inference implementation; its consensus/integration behaviour is separately governed by
**FR-J4**.

### 12 · ⭐⭐ Verified census (`e1c6f527`) — precedent, **not** blanket compliance

**The stronger precedent, confirmed.** `lib/ai/structured/policy.ts` states it in its own
header: **"THE CALLER DOES NOT CHOOSE."**

```text
the caller owns    model · system · messages · tools · token ceiling
the platform owns  whether that provider is authorized HERE
```

⭐ It resolves mode from platform configuration in one place, no production caller can name a
mode, and **an invalid mode is a refusal, never a default** — *"a typo in a deployment variable
must not silently select the most permissive policy."* ⭐ **This is §7 of this ruling, already
built, in one seam.** Modes: `primary | sovereign | local_only`.

**The weaker path, confirmed.** `lib/ai/modelService.ts`:

```text
:53   TEXT_MODEL_PROVIDER = (process.env.MAIA_TEXT_PROVIDER as …) || 'anthropic'
:79   Phase-1 sovereign routing guard — opt-in; if unset, the path below runs
:127  if (TEXT_MODEL_PROVIDER === 'moonshot' || req.meta?.useKimi) …
```

⚠️ So with no inference mode set, the general text path **defaults to an external provider**,
and **a caller-supplied `req.meta?.useKimi` selects a different external provider** — the exact
shape §7 forbids and F-J7.2 names.

⛔ **Recorded as a census finding, not a violation.** FR-J7 did not exist when that path was
built, and the full consent-chain census has not been run. ⛔ **No repair authorized here.**

**Data-minimization precedent (founder-read).** The manuscript structure reader constrains how
much Work crosses an external inference boundary — headings first, prose only when specifically
requested, hard scope ceilings — on the explicit recognition that each requested section is
another piece of private Work leaving the machine. ⭐ That is §5 of this ruling, already built,
in a second seam. *(Files present at `lib/manuscript/structure/`; the founder's reading is the
evidence of record — Jarvis did not re-read them for this ruling.)*

⭐ **Two partial precedents exist and are to be generalized.** ⛔ They do **not** establish that
every current inference route satisfies FR-J7. A separate census is required before any such
claim.

### 13 · Falsifiers

| | Fails FR-J7 when |
|---|---|
| **F-J7.1 · Consent-after-selection** | a model/provider is selected first and authorization checked afterward |
| **F-J7.2 · Caller escalation** | a caller-controlled option moves member material to a less restrictive execution boundary |
| **F-J7.3 · Fallback escalation** | provider failure causes material to cross a boundary it was not authorized to cross |
| **F-J7.4 · Transformation laundering** | summarization, extraction, embedding, paraphrase or inference is treated as removing the source's routing restriction |
| **F-J7.5 · Scope inflation** | authorization for one material scope is treated as authorization for surrounding Work, memory, sources, conversations or Studio material |
| **F-J7.6 · Mixed-payload laundering** | restricted material influences an external request indirectly after being removed only cosmetically |
| **F-J7.7 · Economics-first routing** | cost, latency, model quality, provider availability or context size enlarges the authorized execution set |
| **F-J7.8 · Unanswerable execution** | a materially contributing model operation cannot answer which provider/model executed it and under what authorization basis |

### 14 · Named refusals

```text
Availability does not create consent.
Transformation does not erase custody.
Capability does not create permission.
Economics may choose within authority; economics may never define authority.
```

### 15 · What this ruling does not authorize

```text
⛔ no routing-table implementation   ⛔ no new consent schema      ⛔ no provider migration
⛔ no model change                   ⛔ no member-setting UI        ⛔ no rename of multiEngineOrchestrator
⛔ no inference that current runtime is compliant                  ⛔ no CMT-01 M3
⛔ no Writer's Studio producer       ⛔ no bounded-job substrate
```

⭐ FR-J7 establishes **constitutional ordering and routing semantics only.** Implementation
begins only after current routes, material scopes, consent bases and execution jurisdictions
have been censused against it.

### 16 · Carried forward, not decided

⚠️ **`multiEngineOrchestrator`'s "consensus" is an FR-J4 question, not a D-J7 one.** Confirmed
at `e1c6f527`: per-engine `weight` values, *"Build consensus if multiple engines responded"*,
and a confidence figure — i.e. **selection of the highest-weighted response plus a bonus for
multiplicity, without establishing agreement.** ⭐ Under FR-J4 that is a candidate
**F-J4.2 (synthesis inflation)** shape. ⛔ **Not adjudicated here, and no repair smuggled into
this ruling** — it deserves its own census.


---

## 2g · FR-J8 — Inferred Work Structure · **RULED: PERCEPTION, NEVER AUTHORITY**

> **The system may infer entities, relationships, motifs, structure or other organization in a
> Work only as visibly derived, refusable, revisable system perception.**
>
> **Persistence, recurrence, confidence, model agreement, graph position or downstream reuse do
> not convert an inference into member-authored fact or authority.**
>
> **The member may reject, distinguish, merge, correct or adopt an inferred relation. Where the
> member rules, that member-authored ruling is authoritative for its scope until the member
> revises it.**
>
> **Unowned system inference may never be used as leverage to manufacture higher-order meaning,
> Recognition, identity, or an authoritative account of what the Work "really is."**

### Bind, do not author

⭐ No ontology doctrine is added. FR-J8 binds inferred Work structure to
`CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md` (Invariant 16), `RECOGNITION_INTEGRITY.md` —
explicit keeping, resealability, evidence before pattern, truthful continuity rather than
manufactured coherence — and the Authority × Time discipline.

### The four conditions

1. **Visibly derived** — system inference may never masquerade as member-authored or settled.
   Its derivation remains answerable under FR-J3. ⭐ *"Visible" does not require permanent UI
   exposure; it requires that origin not be concealed when the inference matters.*
2. **Refusable** — the member may reject an inference. ⭐ Recalculation may notice the pattern
   again, but **may not silently restore a refused inference as settled truth.**
3. **Member override authoritative** — member correction, distinction, adoption or rejection
   governs its scope. Later system perception may be offered as **new evidence, never as a
   silent overwrite.**
4. **Never leverage** — an unowned inference cannot gain authority by being repeated,
   persisted, highly confident, model-agreed, central in a graph, or useful downstream.

> ⭐⭐⭐ **Inference may accumulate evidence; it may not accumulate authority.**

⭐ That sentence is the whole ruling in nine words, and it protects the system we actually want:
**MAIA may become extraordinarily perceptive about a Work over years without gradually becoming
the author of what the Work means.**

### ⭐ Verified precedent (`e1c6f527`) — already built, in the manuscript reader

`lib/manuscript/structure/review.ts` states the boundary in its own header:

> *"…the member's copy of a proposal. `manuscript_structure_units` and
> `manuscript_structure_members` are not imported, not written, not consulted.*
> **Only adoption crosses that line."**

⭐ A proposal lives in `proposalStore`, separate from the member's structure; ids are minted
when the interpretation is **copied into the member's** structure, not before. **That is
condition 3 already implemented** — the reader may perceive and propose, and only the member's
adoption makes the reading real. ⭐ FR-J8 generalizes an existing technical discipline rather
than imposing a new one.

### Falsifiers

| | Fails FR-J8 when |
|---|---|
| **F-J8.1 · Derivation erasure** | a system-derived relation is represented or consumed as authored or settled without preserving its derived status |
| **F-J8.2 · Refusal erosion** | a member-refused inference becomes operative again merely because the system re-inferred it |
| **F-J8.3 · Override inversion** | confidence, recency, repetition, model agreement, graph centrality or another machine signal supersedes a member ruling |
| **F-J8.4 · Authority bootstrapping** | an unowned inference becomes leverage for Recognition, identity, authoritative meaning or authoritative Work structure |

### Named refusal — **ontology by accumulation**

> **Repeated perception does not become authorship.**

### What this ruling does not authorize

```text
⛔ no Work entity graph or ontology store    ⛔ no extraction or relationship engine
⛔ no graph UI        ⛔ no schema        ⛔ no new producer        ⛔ no CMT-01 M3
⛔ no claim that the current runtime holds a Work ontology
```

⭐ FR-J8 establishes the **authority boundary only.**


---

## 2h · FR-J9 — Bounded Cognition Lifecycle Contract · **RULED: GENERALIZE PROVEN RESPONSIBILITIES; DO NOT CREATE A CENTRAL SUBSTRATE**

> **Turn-exceeding cognition executes against an explicitly commissioned, frozen, authorized
> scope. Execution may persist progress and produce durable outputs, but execution and
> completion confer neither participation, authority, currency, nor producer identity.**
>
> **The lifecycle generalizes responsibilities already proved elsewhere; it does not create a
> universal jobs service, orchestration object, or canonical job table.**

### ⭐⭐⭐ 1 · Preflight correction — "epistemic dependency" is REFUSED as the default term

BCS-M1 was recorded hours earlier and **immediately caught this lane's own provisional name.**

An execution can establish:

```text
material E at frozen state R  →  supplied to / read by execution X  →  X produced output F
```

⭐ That is **frozen input lineage.** ⛔ It does **not** establish `F causally depended on E`,
because FR-J3 already rules **`CONTRIBUTED ≠ EFFECT ESTABLISHED`.** Calling it *epistemic
dependency* would promote contribution into causal effect — the exact class of error BCS-M1
exists to stop.

```text
FROZEN INPUT LINEAGE   output F was produced by an execution to which E@R contributed   ← required
EFFECT DEPENDENCY      a valid causal witness establishes F actually depended on E@R     ← only where establishable
```

⭐ **Invalidation requires conservative lineage, not invented causality.** A changed input may
require an output to be re-evaluated **even when the system cannot establish that the change
altered it.**

### 2 · "Bounded cognition" states a property, not an object

> A **bounded-cognition execution** is a turn-exceeding computation whose purpose, material
> scope, authorization ceiling and frozen Work state are finite and recoverable.

⛔ It implies no `BoundedCognitionService`, universal queue, single worker, single table, single
producer or single model. FR-J6 and BCS-M1 continue to govern.

### 3 · The lifecycle

```text
COMMISSION → SCOPE → FREEZE → EXECUTION ENQUEUED → CLAIMED / RUNNING
                                                    ├── checkpoints
                                                    ├── crash recovery
                                                    ├── execution prerequisites
                                                    └── cancellation may be requested
  → COMPLETED / FAILED / CANCELLED → DURABLE OUTPUTS → frozen input lineage
  → currency measurement → later retrieval / classification
  → CMT-01 participation boundary → MAIA
```

⛔ **These nouns name different responsibilities. They are not one state machine merely because
they appear in sequence.**

### 4 · Commission and frozen scope are the authority root

An execution record does not independently manufacture permission. Authority comes from a
referenced **frozen commission/scope** establishing at minimum: *member/owner scope · Work scope
· purpose · material scope · freeze identity · authorization basis · maximum permitted execution
jurisdiction · commission time.*

⭐ **Index identity may duplicate the scope. Authority may not.** Member/Work ids on execution
records are for indexing, partitioning and lookup only.

**Current protection can contract a frozen authorization.**

```text
effective permission  =  frozen authorization ceiling  ∩  current protection / revocation state
```

⭐ Current state may make the authorized set **smaller**; ⛔ never silently larger.

> **Freeze preserves permission evidence; it does not defeat later revocation.**

### 5 · Generalize responsibilities, not tables

⛔ No existing domain table becomes the substrate merely because it contains useful mechanics.

```text
commission · freeze · scope                    ← manuscript developmental-reading discipline
concurrent claim / worker identity / heartbeat
attempt ceiling / priority / prerequisite      ← media-job precedent
stale-claim recovery                           ← DB reaper precedent
three-state currency / unmeasured              ← manuscript staleness discipline
frozen input lineage                           ← EvidenceRef + frozen read state
partial-computation checkpoints                ← NEW responsibility
cancellation                                   ← NEW responsibility
```

⛔ D-J9 does not choose a table name, module name or storage layout.

### 6 · Checkpoint means execution progress, not epistemic result

⛔ The provisional phrase **"partial finding" is refused.**

> A **checkpoint** establishes only: a bounded portion of the commissioned computation completed
> successfully, and enough durable execution state exists to avoid unnecessarily repeating it.

```text
A checkpoint is NOT: a finding · a conclusion · a Work observation · a CMT producer ·
                     member-facing material · proof of truth · a completed job
```

> ⭐ **Persistence for recovery does not confer epistemic standing. Checkpoint durability must
> not become conversational eligibility.**

Exposing meaningful partial *results* before terminal completion is a different object requiring
its own classification, provenance, participation and authority treatment.

### 7 · Cancellation is an act before it is a terminal fact

```text
CANCELLATION REQUESTED   a legitimate actor asked execution to stop
CANCELLED                execution actually terminated early because that request was accepted
```

⛔ The system may not report `cancelled` merely because a request exists. The act stays
answerable for **who/what authority · when · which execution**, and where appropriate the reason.

⛔ A completed execution cannot truthfully be retroactively "cancelled" — withdrawal, deletion or
retirement of completed outputs is a separate responsibility, **not decided here.**

### 8 · Execution status and output currency are orthogonal

> `completed` means: the commissioned computation reached its normal execution terminus against
> its frozen scope.

⛔ It does **not** mean currently accurate · relevant · unchanged · approved · member-facing ·
authoritative.

Currency is measured separately as `UNCHANGED | CHANGED | UNMEASURED` across the relevant
independent dimensions. ⭐ **`UNMEASURED` remains a genuine state; a failure to measure currency
may never become "current."**

> **Execution terminus is historical fact. Currency is a comparison with now. Never collapse the
> two.**

### 9 · Frozen input lineage drives conservative invalidation

```text
OUTPUT
  ├── input lineage → EvidenceRef @ frozen revision / range / digest
  └── …
```

⭐ These edges establish **contribution to the execution lineage, not causal effect.** A changed
referenced input may make currency `CHANGED`; an impossible comparison makes it `UNMEASURED`.
⛔ It may not default to current.

**Execution dependency remains separate.** `JOB B requires JOB A to complete` is
execution/scheduling. If B actually consumes A's output, that consumption **additionally**
creates frozen input lineage. ⛔ The prerequisite alone establishes no epistemic relation.

### 10 · ⭐⭐ Invalidation does not authorize recomputation

> **Staleness creates a reason to recompute; it does not create permission to recompute.**

Re-execution requires either the original commission explicitly authorizing maintained/repeated
computation within its scope, or a **new authorization act** — ⛔ particularly binding where
recomputation would cause member material to cross an execution jurisdiction under **FR-J7**.

### 11 · Outputs have no producer class by virtue of the job

⛔ There is no `bounded_job.*`, `bounded_cognition.*` or `job.result` producer class. Material is
classified by **what it actually is**:

```text
deterministic Work structure → computed material, where an existing contract truthfully fits
interpretive Work observation → inferred material
member-authored material retrieved during the job → remains member-authored / retrieved
external scholarly evidence → external/retrieved evidence class as constituted
```

⭐ If no registered producer truthfully describes an output, **the output remains outside the CMT
boundary** until a separate producer-registration act. **Completion confers durability, not
participation.** FR-J2 remains controlling.

### 12 · Completed outputs cross CMT-01 only when later offered

```text
completed execution → durable output → later task determines relevance → material classified
  → offered to the participation boundary → ADMITTED / HELD / EXCLUDED → MAIA
```

⛔ Until CMT-01 M3 exists, **no shadow admission may be represented as contribution to the served
response.**

### 13 · FR-J3 applies across the lifecycle

`KNOWN ≠ CONSIDERED ≠ CONTRIBUTED ≠ EFFECT ESTABLISHED` holds inside bounded cognition exactly as
outside it. Execution provenance may establish provider · model · jurisdiction · scope · frozen
inputs · completed units · outputs ⛔ **without thereby establishing truth or causal effect.**
Where analyses remain substantively incompatible **FR-J4** applies — *completion does not require
disagreement to disappear.* Where outputs infer structure or meaning **FR-J8** applies —
*persistence and recomputation do not accumulate authority.*

### 14 · Falsifiers

| | Fails FR-J9 when |
|---|---|
| **F-J9.1 · Scope escape** | execution reads or processes material beyond the commissioned frozen scope |
| **F-J9.2 · Revocation defeat** | a frozen authorization is treated as permission to ignore a later, more protective member state |
| **F-J9.3 · Checkpoint promotion** | persisted progress becomes a finding, result, producer or member-facing contribution merely because it survived a restart |
| **F-J9.4 · Status/currency collapse** | `completed` is used to assert an output remains current |
| **F-J9.5 · Causal promotion** | frozen input lineage is reported as proof an input affected an output where no effect witness exists |
| **F-J9.6 · Dependency collapse** | execution prerequisite and input lineage are treated as the same relation |
| **F-J9.7 · Cancellation fiction** | a cancellation request is represented as `cancelled` before execution actually terminates |
| **F-J9.8 · Actor/material collapse** | a generic producer identity is assigned to outputs because a bounded job produced them |
| **F-J9.9 · Invalidation-as-authorization** | a changed or unmeasured result automatically causes new cognition outside the standing commission |
| **F-J9.10 · Substrate absorption** | an existing domain-specific queue/table/service is enlarged into a universal cognition substrate merely because it contains reusable mechanics |

### 15 · Named refusals

```text
Progress is not a finding.          Completion is not currency.
Lineage is not causality.           Invalidation is not authorization.
Freeze is not irrevocable consent.
The job is machinery; the material carries the meaning.
```

### 16 · What D-J9 settles

```text
SIBLING IMPLEMENTATION   yes — generalize responsibilities, not an existing domain table
AUTHORITY ROOT           frozen commission/scope reference
CURRENT REVOCATION       may contract frozen permission; never expand it
PARTIAL WORK             checkpoint, not finding
CANCELLATION             request act + actual terminal state
IDENTITY                 scope is authoritative; duplicated IDs only operational
OUTPUT CURRENCY          independent of execution status
INVALIDATION RELATION    frozen input lineage, not presumed causal dependency
RECOMPUTATION            separately authorized
CMT CROSSING             later offered material only
PRODUCER CLASS           belongs to material, never the job
```

### 17 · What D-J9 does not authorize

```text
⛔ no schema      ⛔ no migration    ⛔ no table name   ⛔ no worker     ⛔ no API
⛔ no queue impl  ⛔ no checkpoint format               ⛔ no dependency/lineage store
⛔ no producer registration          ⛔ no CMT-01 M3    ⛔ no automatic Whole-Work sweep
⛔ no implementation lane
```

⭐ FR-J9 establishes the **lifecycle and responsibility contract only.**


---

## 3 · FR-J-SEQ — Sequencing directive · **RULED**

Founder-ordered sequence of subsequent acts. ⛔ None of these is hereby performed.

```text
1. D-J1 + D-J5          ── PERFORMED (this document)
2. D-J6   naming        ── PERFORMED (FR-J6): no runtime proper name
3. D-J2   extend CMT-01 ── PERFORMED (FR-J2): extension, admission boundary only
4. D-J3   provenance ── PERFORMED (FR-J3): one semantic contract, many bounded traces
5. D-J4   unreconciled disagreement ── PERFORMED (FR-J4): representable, never silently collapsed
6. D-J7   routing ── PERFORMED (FR-J7): consent precedes selection
7. D-J8   inferred Work structure ── PERFORMED (FR-J8): perception, never authority
8. bounded-job / incremental-computation substrate ── census RUN, then AMENDED IN PLACE by
                          founder act BCS-C2 (three falsified findings). ⛔ D-J9 NOT OPENED.
                          Record: JARVIS-BOUNDED-COGNITION-SUBSTRATE-CENSUS_2026-09-13.md
```

⭐ **The order is itself a ruling**: naming before code, consent before economics,
constitution before substrate. Each step is cheap while the one before it is unsettled and
expensive afterward.

⛔ **Explicitly reaffirmed by the founder:** no Studio producer registered · M3 not opened ·
no new intelligence engine built.

---

## 4 · Founder findings recorded (not yet rulings)

**FF-1 — The census materially reduced the problem.** What the competitor scan framed as
~21 new capabilities resolves to three genuinely new objects plus a scaling substrate:

```text
        EXISTING              GENUINELY NEW            SCALING
developmental readings    external evidence graph   bounded jobs
standing                  Work entity graph         dependency / invalidation
provenance                disagreement              routing policy
render                    representation
memory
```

**FF-2 — ⭐⭐ The bounded-job lifecycle is the major infrastructural discovery**, and the
founder specified its shape:

```text
commissioned → scoped → frozen against Work state → queued → running →
partial findings → completed / failed / cancelled → standing results

Work changes → which prior findings became stale? → invalidate dependencies →
recompute only affected cognition
```

⛔ **It is not `FAST → CORE → DEEP → EVEN DEEPER`.** Recorded as the shape to build toward;
⛔ **not authorized** — it is step 8.

⭐ Note the continuity with what exists: *frozen against Work state* is the discipline the
developmental reading layer already uses (`commission` · `freeze` · `scope`, digest-bound
evidence). The new object is the **lifecycle that outlives a conversational turn**, not a new
freeze semantics.

**FF-3 — ⭐⭐⭐ Disagreement preservation may be the most distinctive capability available.**

```text
most AI systems     multiple signals → one answer
MAIA could be       multiple legitimate perceptions → held in tension →
                    returned to the writer without premature collapse
```

Founder grounding: McGilchrist's concern with premature abstraction — *the system need not
force the living particular into one finalized representation merely because computation
prefers closure*. This is kin to `docs/canon/DISCIPLINED_NON_COLLAPSE.md` and, if ruled at
D-J4, should be reconciled with it rather than authored beside it.

---

## 5 · Docket state after these rulings

| # | State |
|---|---|
| **D-J1** | ⭐ **RATIFIED (amended)** — boundary ratified, runtime name withheld |
| **D-J5** | ⭐ **RATIFIED** — bound as sibling to FR-J1 |
| ~~**D-J6**~~ | ⭐ **RULED 2026-09-13 — NO RUNTIME PROPER NAME** (FR-J6). "Jarvis" stays the programme word permanently; the runtime layer gets no proper name. Falsifier: architecture-by-noun |
| **D-J2** | ⭐ **NEXT ACT** — extend CMT-01's governed contract, or a separate orchestration object? ⛔ FR-J6 deliberately leaves this open and does not presuppose the object exists |
| ~~**D-J3**~~ | ⭐ **RULED 2026-09-13 — ONE SEMANTIC CONTRACT, MANY TRACES** (FR-J3). Four non-collapsible states; *materially participated* = CONTRIBUTED; effect usually UNKNOWN; `used` refused. ⚠️ The registry prefixes are ORIGIN CLASS, a different axis from process state — the D-J2 note is corrected in §2d |
| ~~**D-J4**~~ | ⭐ **RULED 2026-09-13 — REPRESENTABLE, NEVER SILENTLY COLLAPSED** (FR-J4). Five qualifying conditions; refuses premature collapse AND false balance; synthesis is a new contribution, never an erasure. Named refusal: *consensus by machinery*. F-J4.1-5 |
| ~~**D-J7**~~ | ⭐ **RULED 2026-09-13 — CONSENT PRECEDES SELECTION** (FR-J7). Authorization first, then capability, then economics. Availability ≠ consent; transformation ≠ declassification. F-J7.1-8. ⚠️ `modelService` census finding recorded, not repaired |
| ~~**D-J8**~~ | ⭐ **RULED 2026-09-13 — PERCEPTION, NEVER AUTHORITY** (FR-J8). Four conditions bound to Invariant 16 + Recognition Integrity + Authority × Time. *Inference may accumulate evidence; it may not accumulate authority.* F-J8.1-4 |
| ~~**D-J9**~~ | ⭐ **RULED 2026-09-13 — GENERALIZE PROVEN RESPONSIBILITIES; NO CENTRAL SUBSTRATE** (FR-J9). Answers all six census design questions without inventing a runtime object. ⛔ Implementation lane NOT opened |
| **D-J9 … D-J14** | OPEN, unsequenced (scaling docket) |
| **D-01 … D-12** | OPEN (companion intake) |
| **D-J15** *(new)* | Where does FR-J1/FR-J5 live as canon — a new `docs/canon/` document, or an addition to `MAIA_SOVEREIGNTY_INVARIANTS.md` (Invariant 16 precedent)? ⛔ Jarvis does not place canon on its own act |

---

## 6 · Standing

```text
FR-J1                  RATIFIED (amended — boundary yes, name no)
FR-J5                  RATIFIED (sibling; unanswerable orchestration is a named refusal)
FR-J-SEQ               RULED
FR-J6                  RULED — NO runtime proper name; "Jarvis" = programme word only
FR-J8                  RULED — perception, never authority. Visibly derived · refusable ·
                       member override authoritative · never leverage. Named refusal:
                       ontology by accumulation. F-J8.1-4
CONSTITUTIONAL SEQ     COMPLETE through D-J8
STEP 8                 census RUN + AMENDED (BCS-C2). Strongest queue precedent NOT finally
                       selected. Real gap = EPISTEMIC dependency
BCS-M1                 RECORDED — identifier claim discipline (method binding, not canon).
                       A name is a claim. ⭐ It caught "epistemic dependency" within hours
FR-J9                  RULED — bounded cognition lifecycle contract. Generalize proven
                       responsibilities; no central substrate. Lineage is not causality;
                       invalidation is not authorization. F-J9.1-10. ⛔ No schema, no
                       worker, no lineage store, no implementation lane
FR-J7                  RULED — consent precedes selection. Authorization → capability →
                       economics, never the reverse. Caller may request capability, never
                       permission. Fallback may contract permission, never expand it.
                       F-J7.1-8. ⚠️ modelService default-external + req.meta.useKimi is a
                       recorded CENSUS FINDING, not a violation; no repair authorized
FR-J4                  RULED — substantive disagreement is representable and may not be
                       silently collapsed. Refuses premature collapse AND false balance.
                       Named refusal: consensus by machinery. F-J4.1-5. ⛔ No claim that
                       current runtime preserves disagreement — selection ≠ reconciliation
FR-J3                  RULED — one semantic contract, many bounded traces. KNOWN ≠
                       CONSIDERED ≠ CONTRIBUTED ≠ EFFECT ESTABLISHED. "materially
                       participated" = CONTRIBUTED. `used` refused. F-J3.1/2/3/4
PROVENANCE INSTRUMENTS FIVE, not three (corrected §2d). conversation_memory_uses rows
                       may NOT be cited as contribution or effect. No rename authorized
FR-J2                  RULED — EXTENSION. Admission boundary, not execution substrate.
                       Execution does not confer participation; participation does not
                       confer authority. F-J2.1/2/3 attached
RUNTIME NAME           SETTLED BY REFUSAL — none exists, none to be created
CANON PLACEMENT        NOT PERFORMED (D-J15)
CMT-01 M3              UNAUTHORIZED
PRODUCERS REGISTERED   NONE BY THIS LANE. ⚠️ NOT none overall — seven Writer's Studio
                       producers already exist in canonical (corrected §2c)
CODE / SCHEMA          UNTOUCHED
```

> **Not surfaced by default; never concealed when asked.**
> The architecture the three intakes were reaching for turns out to be one relational
> presence, governed multiplicity beneath it, provenance that makes the multiplicity
> answerable, and a cognition substrate that outlives a conversational turn. Two of those four
> are now law. Neither is yet built, and neither needs to be built to be binding.
