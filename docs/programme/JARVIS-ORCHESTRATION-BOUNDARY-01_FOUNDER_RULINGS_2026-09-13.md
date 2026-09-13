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

## 3 · FR-J-SEQ — Sequencing directive · **RULED**

Founder-ordered sequence of subsequent acts. ⛔ None of these is hereby performed.

```text
1. D-J1 + D-J5          ── PERFORMED (this document)
2. D-J6   naming        ── PERFORMED (FR-J6): no runtime proper name
3. D-J2   extend CMT-01 ── PERFORMED (FR-J2): extension, admission boundary only
4. D-J3   provenance ── PERFORMED (FR-J3): one semantic contract, many bounded traces
5. D-J4   unreconciled disagreement ── NEXT
6. D-J7   model/material routing as CONSENT law, before economics
7. D-J8   inferred Work structure bound to existing authority law
8. bounded-job / incremental-computation substrate
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
| **D-J4** | ⭐ **NEXT ACT** — unreconciled disagreement. Now tractable: provenance can faithfully preserve who contributed what |
| **D-J7 · D-J8** | OPEN, sequenced (§3) |
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
