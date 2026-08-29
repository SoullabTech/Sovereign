# JARVIS-SIM-01 — Field Simulation / Counterfactual Rehearsal

**Lane ID:** JARVIS-SIM-01
**Origin:** derived from founder exploration, 2026-08-29. The capability ceiling
came from that conversation; **authorization to execute did not.**

```text
JARVIS-SIM-01
CHARTERED · INSTRUMENTS BUILT
EXECUTION: HELD — FOUNDER GO REQUIRED
```

**Authority ceiling:** synthetic data · isolated · read-only against production ·
`SIMULATED` provenance · no result is canonical without a founder ruling.

**Execution hold (founder ruling, 2026-08-29).** Specifying this lane's ceiling
was not authority to begin an experiment. Running the first experiment is a
**distinct authority transition**, and it is held pending an explicit:

```text
GO JARVIS-SIM-01 EXPERIMENT 1
```

This is the standing Jarvis principle applied to its own research capability:

> **automate the work, never the authority.**

**What the hold permits and forbids.** Design is not execution. Permitted under
the hold: scaffolding a run, writing and sealing a brief, constructing hypotheses
and a condition matrix, and — always — *refusing* a simulation at the gate.
Forbidden under the hold: building agents, choosing models, installing any
simulation framework, and executing any run, including a toy or smoke run.

A worker may **identify** the missing authority; it may never **supply** it. The
GO is recorded by the founder, and no instrument in this lane can write one —
`scripts/simulate-field-scaffold.sh` deliberately has no `--go` flag.

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

## 7. First experiment (specified, HELD — not run)

Deliberately **not** about customers, pricing, or platform strategy. The first
experiment interrogates AIN's own architecture, because a method's first job is
to be capable of embarrassing its authors.

> **Does maintaining relationship-state between agents produce measurably
> different collective intelligence from agents that merely exchange messages?**

### Five conditions (founder correction, 2026-08-29)

| Condition | What it tests |
|---|---|
| **NULL** | task floor; agents do not interact |
| **BASELINE** | agents exchange messages, no persistent relational state |
| **SHAM / TOKEN-MATCHED CONTROL** | same amount and shape of extra context as treatment, but relationally meaningless |
| **TREATMENT** | accurate persistent relationship state (history, trust, prior correction) |
| **ADVERSARIAL** | persistent relationship state deliberately corrupted |

### Why SHAM and ADVERSARIAL are not the same control

The earlier draft used the adversarial condition as the control for the
"treatment just has more tokens" confound. **That was wrong, and the error is
worth recording rather than quietly fixing.** Corrupting the relational state
introduces a *second* causal variable — misinformation. If the corrupted
condition then behaves differently, three explanations remain live and the design
cannot separate them: relational structure, additional context, or actively false
relational content.

Split, the conditions ask two different questions, and both are worth asking:

**SHAM asks:** is relationship-state doing anything beyond supplying additional
context? This is the clean control for the confound — matched in token count and
shape, empty of relational meaning. It is the condition that can return *no*.

**ADVERSARIAL asks:** if relational state matters, what happens when it is
**wrong**?

The second question is the one that matters most for MAIA. The risk in
accumulated relational understanding is not that memory fails to work. It is
that it works well enough to become **confidently wrong** — familiarity
hardening into ontology. That connects directly to the developmental axis named
in the held research programme:

> **continuity without identity foreclosure**

and to the ratified invariant it points at: *no representation of the system may
acquire more authority simply by being copied into a more durable or more
convenient store.* An accumulated model of a person is the most consequential
such store MAIA will ever hold. The adversarial condition is the first place this
lane can study that failure mode without a real person bearing the cost.

### The standard this experiment is held to

**This directly tests one of the deepest claims underneath AIN. If the answer is
no, we should know.** A null result is a successful experiment and is recorded as
one, at full length.

The design obligation on GO is therefore stated in the inverse of the usual
direction. The first job is **not** to construct an experiment in which AIN wins.
It is to construct an experiment capable of demonstrating that **persistent
relational state adds nothing at all.**

If this lane can faithfully discover *that*, it is a research instrument. If it
cannot, it is a belief-confirmation machine, and the charter has failed
regardless of what any run reports.

## 8. What this charter does not authorize

- **No execution.** No run, no toy run, no smoke run, no agent construction, no
  model selection, no simulation framework installed, until `GO JARVIS-SIM-01
  EXPERIMENT 1` is recorded by the founder.
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
