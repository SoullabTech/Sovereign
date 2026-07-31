---
name: field-study
description: Run an Environmental Field Study of a field (e.g. /field-study now-what). Use when asked to study, audit, or review the lived experience of a product surface — orientation, complexity, gravity, transitions, learning, constitutional consistency. Not a UX review; a constitutional research method with evidence classes and an observer constitution.
---

# Environmental Field Study

Method: `docs/specs/developmental-environment/FIELD_STUDY_METHOD_CANDIDATE_2026-07-29.md`.
**Read it before doing anything else.** This skill is the execution harness; the method is
the authority.

## Ordering is the philosophy — do not reorder

Most UX methods begin with tools. This one begins with **constraints on the observer**.
Before you are permitted to interpret the environment, you must declare the limits of your
knowledge.

1. Observation Declaration (build, immutable for the sitting)
2. Evidence classes and observation status
3. Method integrity
4. Study ethics
5. Confabulation guard
6. **Only now:** instruments
7. Synthesis, last

## Step 1 — Scaffold and declare

```bash
bash scripts/field-study-scaffold.sh <field-slug>
```

Complete `OBSERVATION_DECLARATION.md` **before walking anything**. One sitting, one build.
If you cannot walk production, say so — do not quietly substitute trunk and call it the
same thing. "Fixed on trunk" is not "live in production."

## Step 2 — Gravity map first, before any narrative

Four gravities measured independently: visual · interaction · temporal · relational.
**The finding is the disagreement.** Produce this before writing a single sentence of
narrative about the field, because it answers what the environment is *actually* organizing
around rather than what it claims to.

## Step 3 — Instruments report independently

Discovery maximizes independence; implementation maximizes coherence.

For a **discovery** sitting, run instruments as separate agents that do not read each other's
output, then synthesize. The separation is the point: it stops the strongest narrative from
absorbing contradictory evidence. For an **implementation** sitting on an established grammar,
a single integrated pass is sufficient.

## Step 4 — Classify every statement

| Class | Source | May support rulings? |
|---|---|---|
| A — Direct evidence | Code, walk, measurement | Yes |
| B — Structural inference | Derived, with reasoning chain | Yes — name assumptions |
| C — Experiential prediction | Expected human experience | **No**, until human observation |
| D — Metaphorical interpretation | Narrative framing, analogy | **Never alone** |
| E — Constitutional consistency | Implementation vs. ratified principle | Yes |

No statement is unclassed. Observations and inferences never share a paragraph.

## Step 5 — The confabulation guard

You do not experience duration. Time does not speed up or slow down for you. You do not
become calmer, scattered, or anxious. **"This screen feels anxious" is a literary performance
wearing the costume of evidence** — and downstream it will be read as though a human reported it.

Required form:

> This screen presents 7 competing actions with no stated consequence for 4 of them —
> characteristics associated in UX research and design practice with elevated cognitive
> demand. Whether participants experience overload requires human observation.

The claim stays in the interface characteristic. The felt state is deferred, explicitly.

"Unknown — requires a human walk" is a result, not a failure to deliver.

## Step 6 — Study ethics

The study is itself a governed act. Studying whether an environment protects sovereignty
cannot be done by violating it.

- **Permitted:** structural telemetry — route existence, aggregate counts, latency, schema
  shape, whether a return path resolves.
- **Not permitted without explicit consent:** member reflections, field notes, transcripts,
  journal entries read to characterize experience.
- **Sanctuary content: categorically excluded.** Research is not an exception.

Where member data would be the best evidence, say so and **stop** — log *Needs consent* and
leave the conclusion provisional.

## Step 7 — Three output queues, three destinations

- **Corrections** — objective defects. Repair, no judgment.
- **Founder questions** — authentic tradeoffs. Both sides at equal force, then **stop**.
  No recommendation smuggled in as "obviously we should…". A study that recommends is
  quietly legislating.
- **Architectural opportunities** — convergences. **Category 1 by default: held, not
  authorized.** Recording that something could become a shared primitive does not authorize
  building one.

## Standing constraints

- No production code is edited during a study. This is observation.
- Founder decisions are revealed, never resolved.
- Competing grammars are held separate — no premature synthesis.
- At close, run `--verify` and record whether the build changed under the sitting.

## Calibration status

The method is **Candidate, not ratified**. Now What? is the calibration field. Run one
complete study, notice where the method itself breaks down, revise, run a second field.
Ratification is earned by repeated use across multiple fields — not by this document.
