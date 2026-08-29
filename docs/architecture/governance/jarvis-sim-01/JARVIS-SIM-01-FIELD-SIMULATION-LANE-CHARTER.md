# JARVIS-SIM-01 — Field Simulation / Counterfactual Rehearsal

**Lane ID:** JARVIS-SIM-01
**Chartered:** 2026-08-29 (founder-directed)
**Status:** CHARTERED. Instruments built. **No experiment has been run.**
**Authority ceiling:** synthetic data · isolated · read-only against production ·
`SIMULATED` provenance · no result is canonical without a founder ruling.

---

## 0. What this lane is

JARVIS-SIM-01 asks whether **relational simulation** gives AIN decision
intelligence unavailable from conventional LLM analysis or multi-agent debate.

It is a *method* lane, not a product lane. Its deliverable is not a prediction.
Its deliverable is **a defensible statement about which conclusions survived
controlled repetition and which did not.**

The separation it inherits (held direction, 2026-08-14):

> MAIA lives the relationship. AIN preserves and governs the relationship.
> JARVIS studies how relational intelligence actually develops.

JARVIS-SIM-01 is the *rehearsal* instrument of that study: where the research
programme observes what happened, this lane asks what might happen under
conditions we can vary on purpose.

## 1. JARVIS is the laboratory director, never a participant

**JARVIS is never one of the simulated agents.** It sits above the apparatus.
A director that enters its own experiment can no longer distinguish the result
from its own contribution to the result.

Its ten responsibilities:

1. Determine whether simulation is appropriate — **including refusing.**
2. Construct the experimental question correctly.
3. Generate competing hypotheses, so the run cannot merely confirm the premise.
4. Choose the instrument.
5. Run repetitions and counterfactuals.
6. Compare outputs across architectures.
7. Enforce provenance.
8. Return **findings**, never simulated fiction, into AIN.
9. Route results to MAIA for human-relational interpretation.
10. **Never permit a simulation result to become canonical automatically.**

Responsibility 1 is the load-bearing one. A simulator is a seductive instrument:
left ungated, everything starts to look like it needs simulating. The most
valuable output this lane can produce on a given day is:

> *This question does not need simulation.*

## 2. The `SIMULATED` provenance class

`SIMULATED` is a provenance tag on a **research artefact**. It is deliberately
**outside** the Live / Designed / Vision ladder of
`docs/canon/MARKETING_CLAIM_DISCIPLINE.md`, because that ladder classifies
*capability claims* and a simulation result is not a capability claim at all.

| | |
|---|---|
| **Means** | produced by synthetic agents under stated assumptions |
| **May support** | hypothesis selection · risk surfacing · experiment design · red-teaming |
| **May never support** | a claim about what real members do, want, felt, or would do |
| **Promotion path** | **none.** `SIMULATED` never becomes Live, Designed, or Vision. |

A simulated finding may cause a *real* experiment to be designed. That real
experiment, run against real evidence, may produce a Live claim. The simulation
is never the evidence — it is the reason someone went looking for evidence.

**Every artefact this lane emits carries the tag in its header.** An untagged
simulation output is an invalid result, not a minor omission.

## 3. Standing rules (founder-set)

- **Isolated.** No production writes. No production database mutation. Read-only
  structural reads only, and only where a real-world calibration is explicitly
  part of the design.
- **Synthetic population.** No raw member memory. No member transcripts,
  reflections, atoms, or anchors as agent seeds. **Sanctuary content is
  categorically excluded — research is not an exception** (inherited from the
  field-study ethics rule).
- **Confidential material excluded by default.** Admitting any requires a named
  founder decision recorded in the run directory.
- **Repeated runs.** A single run is an anecdote with a computer attached.
- **Null / control condition mandatory.** A design without one is not run.
- **MAIA interprets; the simulator never adjudicates reality.**

## 4. The confabulation guard — the hazard specific to this lane

The field-study method guards against the observer narrating a felt state it
cannot have. This lane's hazard is worse, because its output *is* fluent human
speech.

**A simulated agent's utterance is fiction. It is never data about people.**

When a synthetic actor says *"I would never trust a system that remembers me,"*
that sentence is evidence about **the model's prior over how such a person talks**
— nothing more. It is not a member objection, not market research, not a quote.

Prohibited: quoting simulated speech as though a person said it; reporting
simulated proportions ("68% of the field resisted") as population estimates;
naming a synthetic agent after a real person, member, or customer.

Required form:

> Under the stated assumptions, 7 of 10 runs produced coalition formation around
> the low-disclosure strategy. This is a property of the model and the assumption
> set. Whether real members behave this way is unknown and requires real evidence.

The claim stays inside the apparatus. The real-world inference is deferred,
explicitly.

## 5. Growth-obligation answers

Required of any capability increase (`CLAUDE.md`; `docs/canon/RECIPROCAL_SOVEREIGNTY_INTENTION_2026-08-04.md`).

**What uncertainty does this introduce, and how is it preserved?**
Simulation manufactures plausible detail with no truth-tracking guarantee — its
failure mode is *confident fiction*. Preserved structurally: mandatory null
model, mandatory repetition, cross-run variance reported as a first-class result,
and the `DO NOT CONCLUDE` output category, which is never permitted to be empty
by default.

**What provenance and ownership boundaries does this require?**
The `SIMULATED` class with **no promotion path** (§2), synthetic-only population,
and per-run recording of every assumption the result depends on. Findings enter
AIN; simulated content does not.

**What new responsibility does this capability create?**
The duty to publish negative and null results. An instrument that can rehearse
any future will produce a supporting narrative for any proposal put to it. The
only defence is a standing obligation to report when the simulation found
nothing, contradicted itself, or merely restated its assumptions.

## 6. Instruments

| Instrument | Path | Role |
|---|---|---|
| `/simulate-field` | `.claude/skills/simulate-field/SKILL.md` | design + run a simulation, or refuse |
| `/adjudicate-simulation` | `.claude/skills/adjudicate-simulation/SKILL.md` | read runs, produce the six-category verdict |
| scaffold | `scripts/simulate-field-scaffold.sh` | run directory, brief, instrument fingerprint |

Run artefacts: `docs/simulations/<slug>/<date>/`.

## 7. First experiment (specified, NOT run)

Deliberately **not** about customers, pricing, or platform strategy. The first
experiment interrogates AIN's own architecture, because a method's first job is
to be capable of embarrassing its authors.

> **Does maintaining relationship-state between agents produce measurably
> different collective intelligence from agents that merely exchange messages?**

| Condition | Description |
|---|---|
| **NULL** | agents in isolation, no exchange — establishes the task's floor |
| **BASELINE** | message-passing only; no persistent inter-agent relationship state |
| **TREATMENT** | persistent relationship state (history, trust, prior correction) carried across turns |
| **ADVERSARIAL** | relationship state present but *corrupted* — tests whether any effect is the state itself or merely extra tokens |

The adversarial condition is what separates a finding from an artefact. Extra
context alone changes behaviour; the question is whether *relational* structure
does something extra context does not.

**This directly tests one of the deepest claims underneath AIN. If the answer is
no, we should know.** A null result here is a successful experiment and must be
recorded as one.

## 8. What this charter does not authorize

- No production write path, on any result.
- No member-facing surface describing simulated findings.
- No promotion of a simulated finding to Live / Designed / Vision (§2).
- No canonization: a simulation may not amend canon, ratify an invariant, or
  close a founder question. It may only *raise* one.
- No simulation of an identifiable real person, member, or partner.

## 9. Relationship to prior work

`docs/architecture/held-directions/JARVIS_RELATIONAL_INTELLIGENCE_RESEARCH_PROGRAMME_2026-08-14.md`
remains **PRESERVED DIRECTION / NOT AUTHORIZED**. This charter does not open it.
JARVIS-SIM-01 is a bounded rehearsal lane; the research programme is the larger
observational study of real member trajectories. Simulation sits *upstream* of
that programme's evidence staircase — it can suggest what to look for, and can
never occupy a rung on it.
