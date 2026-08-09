# Witness Jurisdiction Corollary

**Status: RATIFIED (founder, 2026-08-09)** — as a **corollary** of the standing rule
*Measurement ⊥ Governance ⊥ Implementation* (founder, 2026-08-06), not as new canon.
**Falsification basis**: seven real repository conflict cases, all survived —
`docs/architecture/audits/BUILDER_OS_INSTRUMENT_RECONCILIATION_2026-08-09.md` §3.

---

## The corollary

> **A witness has authority only over the kind of claim it is competent to establish.**
>
> - **Measurement** witnesses *what is observed*.
> - **Implementation** witnesses *what is encoded*.
> - **Governance** witnesses *what is permitted, required, or intended*.
>
> **Evidence from one jurisdiction cannot establish a claim belonging to another merely because it
> is strong evidence within its own jurisdiction.** Where witnesses conflict, first classify the
> claim being adjudicated; never apply a total ranking across witness classes.

## The error family this names

All of the following are **jurisdiction errors**, and all have occurred in this repository:

| error | substitution |
|---|---|
| `tests green → capability works` | implementation evidence answering a measurement claim |
| `table exists → feature is live` | implementation evidence answering a measurement claim |
| `production does X → X is authorized` | measurement evidence answering a governance claim |
| `design says X → production does X` | governance/design evidence answering a measurement claim |
| `code exists → member can reach it` | implementation evidence answering a measurement claim |
| `document says live → production is live` | declaration answering a measurement claim |

## Experiential acceptance — ruled: NOT a fourth jurisdiction (provisional)

**Experience is a measurement referent, not a separate jurisdiction.** Measurement has different
referents, and the competent witness changes with the referent:

| referent | competent witness |
|---|---|
| machine behavior | tests / runtime instrumentation |
| production behavior | deployed observation |
| human usability | the human walk |
| relational / felt experience | the experiencing person |

Preserved intact: **never let a green check stand in for a walk** — and its symmetric partner:

> A tester saying "MAIA felt deeply continuous" cannot prove persistence worked.
> A green persistence test cannot prove MAIA felt continuous.

Neither becomes more authoritative by crossing referents. *Not everything real becomes more
authoritative by becoming machine-measurable.*

**Standing search**: a counterexample in which experiential evidence must constitute a genuinely
separate authority jurisdiction would reopen this. Until one exists, the smaller ontology governs.

## Proximity-to-referent — CANDIDATE, ⛔ NOT RATIFIED

Observed seven-for-seven in the conflict record, held for falsification:

> *Within a witness jurisdiction, evidentiary authority tends to increase with proximity to the
> claim's actual referent* (deployed SHA > observer checkout, as a witness of deployment; an
> instrument's actual scope > the claim citing it).

**Known falsification pressure (founder, 2026-08-09):** a single maximally-proximal observation can
be poor evidence of general behavior — one production request is maximally proximal to itself yet
weak evidence of system behavior; an aggregate or longitudinal instrument may be the stronger
witness. "Proximity" must be tested against aggregate-vs-instance cases before any ratification.
