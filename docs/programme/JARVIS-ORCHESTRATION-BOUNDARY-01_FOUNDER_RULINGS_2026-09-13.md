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

## 3 · FR-J-SEQ — Sequencing directive · **RULED**

Founder-ordered sequence of subsequent acts. ⛔ None of these is hereby performed.

```text
1. D-J1 + D-J5          ── PERFORMED (this document)
2. D-J6   naming        ── PERFORMED (FR-J6): no runtime proper name
3. D-J2   extend CMT-01 ── NEXT. Does NOT authorize M3
4. D-J3   one provenance contract (never a fourth trace)
5. D-J4   unreconciled disagreement
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
| **D-J3 · D-J4 · D-J7 · D-J8** | OPEN, sequenced (§3) |
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
RUNTIME NAME           SETTLED BY REFUSAL — none exists, none to be created
CANON PLACEMENT        NOT PERFORMED (D-J15)
CMT-01 M3              UNAUTHORIZED
PRODUCERS REGISTERED   NONE
CODE / SCHEMA          UNTOUCHED
```

> **Not surfaced by default; never concealed when asked.**
> The architecture the three intakes were reaching for turns out to be one relational
> presence, governed multiplicity beneath it, provenance that makes the multiplicity
> answerable, and a cognition substrate that outlives a conversational turn. Two of those four
> are now law. Neither is yet built, and neither needs to be built to be binding.
