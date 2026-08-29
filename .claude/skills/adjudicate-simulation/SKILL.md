---
name: adjudicate-simulation
description: Adjudicate a completed field simulation under JARVIS-SIM-01 (e.g. /adjudicate-simulation relationship-state). Use after /simulate-field to read the runs and produce the verdict — what was robust across runs, what was condition-dependent, what was a single-run anomaly, which assumptions drove the result, what real evidence is needed, and what must NOT be concluded. Separates judging a simulation from building one.
---

# Simulation Adjudication

Charter: `docs/architecture/governance/jarvis-sim-01/JARVIS-SIM-01-FIELD-SIMULATION-LANE-CHARTER.md`.

You are the **verifier and critic**, not the author of the world. Your bias runs
opposite to the run's: the run wanted to produce something, and you are here to
find out how much of it survives.

Read `SIMULATION_BRIEF.md`, `WORLD.md`, and every run record in
`docs/simulations/<slug>/<date>/` before writing a word of verdict.

## Why this is a separate instrument

The author of a world is the worst possible judge of what it proved. They know
the intent, so they read the intent into the output; they made the assumptions,
so the assumptions are invisible to them. Splitting adjudication from execution
is the same move the field-study method makes when it runs instruments as
independent agents: **the separation stops the strongest narrative from
absorbing contradictory evidence.**

Where possible, adjudicate in a session that did not build the world.

## The four adjudication questions

1. What is robust?
2. What depends on assumptions?
3. What contradicted itself?
4. **What should NOT be concluded?**

## The verdict

Emit exactly this structure. `SIMULATED` provenance in the header. **No category
may be silently omitted** — write `None found` and say why, because an empty
category is itself a claim about the run.

```text
SIMULATION VERDICT — <slug> · <date>
PROVENANCE: SIMULATED · JARVIS-SIM-01
Runs: <n> across <m> conditions

ROBUST ACROSS RUNS
- <held under repetition AND survived the adversarial condition>

CONDITION-DEPENDENT
- <appeared, but only under stated conditions — name them>

SINGLE-RUN ANOMALIES
- <observed once; recorded, not concluded from>

ASSUMPTIONS DRIVING RESULT
- <the assumption, and what the result becomes without it>

REAL-WORLD EVIDENCE NEEDED
- <the observable that would confirm or kill this outside the apparatus>

DO NOT CONCLUDE
- <the reading the result invites but does not license>
```

## Category discipline

**ROBUST** is the strictest bar. A finding is robust only if it held across
repeated runs **and** survived the adversarial condition. Consistency alone is
not robustness — a consistently reproduced artefact of the setup is still an
artefact. If the null model produced it too, it is not a finding about the
mechanism; move it to `ASSUMPTIONS DRIVING RESULT`.

**CONDITION-DEPENDENT** is not a weaker `ROBUST`. It is a different and often
more useful claim: it names *where* the effect lives. Always state the condition.

**SINGLE-RUN ANOMALIES** are recorded precisely so they are not quietly promoted
later. Include the interesting ones — minority signals often surface here — and
mark them as insufficient by construction.

**ASSUMPTIONS DRIVING RESULT** is where the intellectual work is. For each, state
what the result becomes if the assumption is dropped. An assumption whose removal
does not change the result was not driving anything; leave it out.

**REAL-WORLD EVIDENCE NEEDED** converts a simulated finding into a real
experiment. This is the only legitimate path out of the apparatus: a `SIMULATED`
result never becomes Live, Designed, or Vision (charter §2). It can cause someone
to go and look. Name the observable, where it would be measured, and what result
would falsify it.

**DO NOT CONCLUDE** is the most important category and the one under most
pressure to be soft. It exists because a fluent simulation produces conviction
out of proportion to its evidence. Populate it with the readings a reasonable
person would take away and that the design does not support — particularly the
one the founder is most likely to want.

If it is empty, you have not adjudicated; you have summarized.

## The null-result obligation

A simulation that found nothing, contradicted itself, or merely restated its own
assumptions is reported plainly and at full length. State it in the first line of
the verdict rather than burying it under the categories.

If the treatment condition did not differ from baseline, **that is the result.**
Write it as a finding, not as a shortfall. The lane's first experiment exists to
test a claim underneath AIN; a lane that cannot return *no* cannot return *yes*
either.

## Standing constraints

- Do not quote simulated speech as though a person said it.
- Do not report simulated proportions as population estimates.
- Do not resolve founder questions. Reveal them, at equal force, and stop.
- Do not recommend. A verdict that recommends is quietly legislating.
- Route findings — never simulated content — to MAIA for human-relational
  interpretation, and to the human for decision.
- No verdict amends canon, ratifies an invariant, or closes a founder question.
  It may only raise one.
