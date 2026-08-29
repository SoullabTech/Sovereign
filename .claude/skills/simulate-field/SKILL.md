---
name: simulate-field
description: Design and run a bounded relational field simulation under JARVIS-SIM-01 (e.g. /simulate-field relationship-state). Use when asked to simulate, rehearse, war-game, or explore counterfactuals for a decision — what might happen, what breaks, how a field responds to a perturbation. Starts by deciding whether simulation is warranted at all, and refuses when it is not. Not a prediction tool; a controlled rehearsal instrument with a null model and SIMULATED provenance.
---

# Field Simulation / Counterfactual Rehearsal

Charter: `docs/architecture/governance/jarvis-sim-01/JARVIS-SIM-01-FIELD-SIMULATION-LANE-CHARTER.md`.
**Read it before doing anything else.** This skill is the execution harness; the
charter is the authority.

You are the **laboratory director**, not a participant. You never play a
simulated agent. If you find yourself arguing inside your own experiment, the
experiment is over and the result is void.

## Execution is HELD — read this before Step 1

```text
JARVIS-SIM-01
CHARTERED · INSTRUMENTS BUILT
EXECUTION: HELD — FOUNDER GO REQUIRED
```

**Design is not execution.** Steps 1–6 are permitted under the hold: refuse at
the gate, scaffold, write the brief, form hypotheses, design the world on paper,
lay out the matrix, seal. **Step 7 is not.**

Do not run anything — including a toy or smoke run — do not build agents, choose
models, or install a simulation framework, until the founder has recorded:

```text
GO JARVIS-SIM-01 EXPERIMENT 1
```

Record the GO in `RUN_INTEGRITY.md` under *Execution authority*, quoting it.
**You may identify that the authority is missing. You may never supply it.** If
the GO is absent, complete the design, state plainly that execution is held, and
stop. That is a complete and correct outcome, not a blocked one.

## Ordering is the philosophy — do not reorder

The instinct is to start building the world, because that part is fun. The
method starts by trying to talk you out of it.

1. **The refusal gate** — is simulation warranted?
2. Simulation brief
3. Sovereignty gate
4. Competing hypotheses — *before* the world exists
5. World builder
6. Experiment matrix
7. Repeated runs
8. Emergence observatory
9. Hand off to `/adjudicate-simulation`

## Step 1 — The refusal gate

**Answer this before anything else, and answer it adversarially.**

Simulation is seductive. Once the instrument exists, every question starts to
look like it needs one, and a fluent simulated narrative is far more persuasive
than it is informative. The most valuable output of this skill on a given day is
often a single sentence:

> This question does not need simulation.

**Refuse when any of these hold:**

| Condition | Why simulation is the wrong instrument |
|---|---|
| The answer is knowable from the codebase, logs, or production | You have real evidence. Do not replace it with fiction. |
| The question is about what real members did, want, or felt | Simulated people are not evidence about people. Ask people. |
| The decision is already made | You are being asked for a justification generator. |
| There is no observable that could distinguish outcomes | An unfalsifiable design produces narrative, not findings. |
| The result would not change any action | A rehearsal nobody acts on is entertainment. |
| The question is a values or founder decision | Simulation cannot adjudicate what we *should* want. |

**Proceed only when** the question involves multiple interacting actors whose
*interaction* is the unknown, the outcome depends on conditions we can vary
deliberately, and there is a stated observable that would come out differently
across conditions.

State the verdict explicitly. If you refuse, say what instrument fits instead —
ordinary analysis, a real experiment, a production measurement, MAIA, or asking
a person — and stop. **A refusal is a completed run, not a failure to deliver.**

## Step 2 — Scaffold and brief

```bash
bash scripts/simulate-field-scaffold.sh <slug>
```

Complete `SIMULATION_BRIEF.md` **before constructing any agent.** A world built
before the question is fixed will silently be built to produce an answer.

```yaml
question:               # the single interrogative sentence
decision_context:       # what real decision this informs
actors:                 # roles, not people — never a named real person
known_relationships:    # structure asserted as given
unknowns:               # what the run is actually about
intervention:           # the perturbation under test
time_horizon:
metrics:                # observables, defined before the run
sensitivity_variables:  # what you will vary to test fragility
```

Every field is load-bearing. `metrics` defined *after* seeing output is not a
metric; it is a story with numbers attached.

## Step 3 — Sovereignty gate

The gate is not paperwork. A simulation of a relational field is exactly the
artefact that would be most tempting to seed with real member material.

- **No raw member memory** — no transcripts, reflections, atoms, anchors, or
  journal content as agent seeds.
- **Sanctuary content categorically excluded.** Research is not an exception.
- **No confidential material by default** — admitting any requires a named
  founder decision recorded in the run directory.
- **Synthetic or anonymized population only.** Actors are roles with stated
  properties, never portraits of identifiable people.
- **`SIMULATED` provenance** on every emitted artefact.
- **No production writes.** Structural reads only.

Where real member data would be the best evidence: **say so and stop.** Log
*Needs consent / needs real study* and leave the question open. That is a
result.

## Step 4 — Competing hypotheses, before the world exists

Write down **at least two rival hypotheses that predict different observables**,
including the one the founder does not expect. Then write the observable that
would distinguish them.

A simulation designed after the expected answer is known will find it. This step
is the only structural defence against that, and it must happen before Step 5,
because world-building decisions encode hypotheses whether or not you notice.

Also record: **what result would count as this idea failing?** If nothing would,
return to Step 1.

## Step 5 — World builder

Construct: the relational graph, the synthetic agents, the environment, the
constraints. Record every assumption in `WORLD.md` as it is made — assumptions
recalled afterwards are reconstructions, and reconstructions favour the result.

Each agent gets a role, stated properties, and its information boundary. **You
are not among them.**

## Step 6 — Experiment matrix

Minimum viable matrix. A design missing the null or the adversarial condition is
not run.

| Condition | Purpose |
|---|---|
| **NULL MODEL** | no interaction / no mechanism — the floor. Establishes what the task yields with the mechanism absent. |
| **BASELINE** | the ordinary case |
| **SHAM / TOKEN-MATCHED** | the same *quantity and shape* of added context as the treatment, drained of the meaning under test |
| **COUNTERFACTUAL 1–2** | the varied conditions under test |
| **ADVERSARIAL** | the mechanism present but corrupted or hostile |

**SHAM is required whenever the treatment adds context, tokens, or structure
relative to baseline** — which is nearly always. Without it, "the mechanism
worked" and "the model had more to read" are indistinguishable.

**The adversarial condition is not that control**, and using it as one is a
design error (founder ruling, 2026-08-29). Corrupting the mechanism adds a second
causal variable — misinformation — so a difference under corruption cannot
separate *structure* from *extra context* from *actively false content*. They are
two conditions asking two questions:

- **SHAM:** is the mechanism doing anything beyond supplying more context?
- **ADVERSARIAL:** if the mechanism matters, what happens when it is **wrong**?

Keep both. The second is usually the one with real consequences attached.

Where the question is architectural, add the **architecture comparison**:
(A) ordinary agent debate · (B) social simulation · (C) AIN relational-field
simulation. The point is not to show C wins. The point is to find out whether C
differs at all — **if B and C produce the same result, that is the finding.**

## Step 7 — Repeated runs *(requires founder GO — see the hold above)*

Confirm the GO is recorded in `RUN_INTEGRITY.md` before the first run. If it is
not, stop here and report the design as complete and execution as held.

Run each condition **several times.** Never present one run as the result.

Cross-run variance is a first-class output, not noise to be averaged away. High
variance across identical conditions is itself a finding: it means the
conclusion is not licensed by the design.

## Step 8 — Emergence observatory

Observe and record independently, before interpreting: attractors · coalitions ·
polarization · breakdowns · novel patterns · **minority signals** · relational
shifts.

Minority signals are recorded deliberately because synthesis erases them, and
the rare trajectory is often where the real risk lives.

**The confabulation guard applies to everything you write here.** A simulated
agent's utterance is fiction — never quote it as a person's view, never report
simulated proportions as population estimates. Claims stay inside the apparatus:

> Under the stated assumptions, 7 of 10 runs produced coalition formation around
> the low-disclosure strategy. This is a property of the model and the assumption
> set. Whether real members behave this way is unknown.

## Step 9 — Hand off

Do **not** write conclusions here. Adjudication is a separate instrument with a
separate discipline, precisely so the author of the world is not the sole judge
of what it proved. Run `/adjudicate-simulation <slug>`.

## Standing constraints

- Execution requires a recorded founder GO. Design and refusal do not.
- No production code is edited during a simulation. No production writes.
- JARVIS never plays an agent in its own experiment.
- The simulator never adjudicates reality. MAIA interprets; humans decide.
- No simulation result becomes canonical automatically — canonization requires a
  founder ruling (charter §8).
- A null or negative result is published with the same weight as a positive one.
- At close, run `--verify` and record whether the instrument changed under the run.
