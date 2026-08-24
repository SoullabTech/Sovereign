# JARVIS Self-Learning — JSL-00 (Learning Trace) + JSL-01 (Experience Memory)

> ⛔ **FROZEN 2026-08-24 by founder ruling — architectural evidence, not canonical
> implementation. Do not merge, wire, or extend.** Disposition, the eight recorded findings, and
> the corrected sequencing: [`JARVIS_SL_SPIKE_FROZEN_2026-08-24.md`](./JARVIS_SL_SPIKE_FROZEN_2026-08-24.md).
> The capability track is named **JARVIS-SL** prospectively; `JSL-00`/`JSL-01` labels below are
> retained only because renaming CI-bound executable files for cosmetic consistency was refused.

**Class: BUILT SUBSTRATE (Cat 3). Wired into `npm run jarvis:proof`. Zero production callers.**
Authored 2026-08-24, founder-directed, following NVIDIA's AVO / ARC-AGI-3 result.

> **What shipped:** two modules and a 39-assertion proof. **What did not:** any
> change to how a Work Unit is executed. Nothing in the delegation pipeline calls
> JSL yet. *Built ≠ wired; wired ≠ surfacing; surfacing ≠ verified.*

---

## The distinction this rests on

The capability AVO demonstrates is **not** conventional machine learning. Claude's
weights do not change. What changes is that the *agent system* accumulates
experience: it remembers prior attempts and outcomes, retrieves them when the
situation recurs, forms a new hypothesis, tests it, measures what actually
happened, and preserves both what worked and what failed.

That is the definition of self-learning JSL adopts. It is deliberately **not**
"let the agent rewrite itself."

## What was already here

JARVIS Units 5–11 already record a great deal:

| Artifact | Answers |
|---|---|
| `packets/<id>.json` | what this Work Unit *is* |
| `results/<id>.json` | what the latest attempt *produced* |
| `results/<id>.attempts.jsonl` | the history of attempts |
| `episodes.jsonl` | one observability line per delegated run |
| `runtime/runs/`, `runtime/events.jsonl` | run lifecycle and transitions |

Every one of those answers **what was produced**. None answers *what was believed,
what was tried, what actually happened, and what that should change next time*.
And none is retrievable **by symptom across Work Units** — which is where the
expensive failure lives. Forgetting inside a run is cheap. Re-entering a known
dead end in the *next* run, under a new id, with a fresh context, at full cost,
is not.

## ⭐ Reconciliation with the held direction — read before extending this

`docs/architecture/held-directions/JARVIS_RELATIONAL_INTELLIGENCE_RESEARCH_PROGRAMME_2026-08-14.md`
is **PRESERVED DIRECTION, ⛔ NOT AUTHORIZED**, and it already covers much of this
territory (`OBSERVE → DIFFERENTIATE → PERTURB → ABLATE → COMPARE → CORRECT →
ACCUMULATE`, plus the five-rung evidence staircase). **JSL-00/01 do not open it.**
JSL is engineering self-learning over JARVIS's own delegation runs. The held
direction is a *research programme about MAIA's relational intelligence with
members*. They share a shape; they do not share a subject, and the second still
requires a founder ruling.

⭐⭐ **One correction the held direction forces on the framing.** The founder wrote
there, on 2026-08-14:

> | **memory** | *what happened before?* |
> | **operational standing** | *what is true now, what remains unresolved, what has changed, and what actions are currently permitted?* |
>
> ⭐ The second is what JARVIS Desktop lacks. ⛔ It is **not** "better memory."

JSL-00/01 build the **first** column. That is a real gap and worth closing — but
it is not the gap named as the limiting one. **JSL-00/01 should not be described
as addressing operational standing.** They produce the evidence a standing layer
would later read. Naming this now prevents the inverse drift the anchor warns
about in both directions: neither inflating a ledger into an intelligence, nor
letting the ledger go unnamed once it starts producing rows.

## The architecture

```
  delegation run
        │
        ▼
  ┌───────────────────┐
  │  JSL-00  TRACE      │   append-only, per Work Unit
  │  OBSERVATION        │   learning/traces/<work_unit_id>.jsonl
  │  HYPOTHESIS         │
  │  ACTION             │   J1 grounding declared
  │  OUTCOME            │   J2 lineage named
  │  CORRECTION         │   J3 NO epistemic status
  │  ABANDONMENT        │   J4 append-only
  └──────────┬──────────┘   J5 evidence kind adjudicable
             │
             ▼
  ┌───────────────────┐
  │  JSL-01  RETRIEVAL  │   deterministic, cross-Work-Unit
  │  query by symptom   │   "we tried this before —
  │  strategy record    │    here is what happened"
  └──────────┬──────────┘
             │  proposes (never records)
             ▼
  ┌───────────────────┐
  │  epistemic-guard    │   HYPOTHESIS → OBSERVATION → PROVEN → INVARIANT
  │  (already existed)  │   G5: no rung-skipping, no rise on rereading
  └──────────┬──────────┘
             │
             ▼
      founder ruling        ← above HEURISTIC, always
```

## ⭐⭐ The load-bearing decision: JSL does not own an epistemic ladder

The founder's sketch proposed a promotion ladder:

```
OBSERVED → HYPOTHESIS → TESTED ONCE → PROVISIONAL → CONFIRMED → PROCEDURE → CANON
```

**That ladder already exists in this repo** — `scripts/builder/epistemic-guard.mjs`
implements `HYPOTHESIS(0) → OBSERVATION(1) → PROVEN(2) → INVARIANT(3)`, with G5
refusing rung-skips and refusing any status that rises *on rereading* rather than
on new evidence. `HEURISTIC` — *"check X early because it has failed before"* — is
already in that vocabulary, already **lateral** (rank `null`), so it can never
silently climb toward INVARIANT.

So JSL **reuses** it. A trace entry carries **no status at all** (invariant J3,
enforced by name). Building a second ladder would have been building a second
authority, and the invariant that breaks is exact:

> *No representation of the system may acquire more authority simply by being
> copied into a more durable or more convenient store.*

## The invariants

| | Rule | Why |
|---|---|---|
| **J1** | GROUNDING | Every OUTCOME declares `VERIFIED` or `SELF_REPORTED`, never defaulted in either direction. Worker self-report is never authoritative (Unit 11). A `SELF_REPORTED` outcome is **recorded but never countable**. This is the whole defence against an agent learning from its own claim that something worked. |
| **J2** | LINEAGE | An OUTCOME/CORRECTION must name the entry it bears on, checked against disk at write time. An outcome with no antecedent is a story, not evidence. |
| **J3** | NO-STATUS | A trace entry may not carry `status`. Status belongs to the guard. |
| **J4** | APPEND-ONLY | Corrections supersede, never rewrite. **A failed experiment is the most reusable record this system produces.** |
| **J5** | EVIDENCE | Cited evidence kinds must be ones the guard can adjudicate — checked at *write* time, so a trace never accumulates months of evidence that turns out unusable when a claim is finally proposed. |

## ⭐ The asymmetry between failure and success

`promotion-candidate` treats them differently on purpose:

- **≥2 independent VERIFIED refutations** → proposes `HEURISTIC`. A warning costs
  little if wrong, and is lateral in the guard's ladder.
- **Any number of VERIFIED confirmations** → proposes only `HYPOTHESIS`.

*"It worked the last few times"* is not a mechanism. Promoting repeated success
toward PROVEN is precisely the move that turns an accumulated model into an
ontology — the failure mode the fourth developmental axis names.

Self-reported outcomes are carried into a claim as evidence kind `worker_claim`,
which is already a `WEAK_KIND` in the guard. The guard therefore refuses them a
strong status **on its own authority**; JSL does not re-implement that defence.

## Anti-drift: the mirrored vocabulary

`epistemic-guard.mjs` has no main-module guard, so importing it would execute its
CLI. JSL therefore **mirrors** its evidence vocabulary. Duplication is a drift
risk, so it is not left to discipline: `jarvis-learning-proof.mjs` parses the
guard's source and **fails** if the two lists diverge (negative-control verified —
injecting a bogus kind turns the suite red).

> ⭐⭐⭐ Per the founder's own observation: *the controls that actually changed
> outcomes were the mechanical ones, not the disciplined ones.* Build gates that
> fire, not rules an agent is expected to remember.

## Growth-obligation check (CLAUDE.md, founder-added 2026-08-04)

- **What uncertainty does this introduce, and how is it preserved?** That
  accumulated experience will be read as more authoritative than it is. Preserved
  structurally: `INCONCLUSIVE` is a first-class outcome; `verify` reports untested
  hypotheses and self-reported counts as *prominently* as verified ones; verified
  and self-reported counts are never summed.
- **What provenance and ownership boundaries does this require?** Every entry
  carries its Work Unit, step, SHA and evidence refs. Evidence is *referenced*,
  never copied — the pipeline's artifacts stay the one authoritative copy, so the
  trace cannot drift from them.
- **What new responsibility does this create?** That JSL never becomes the thing
  that makes its own beliefs true. Discharged by J3 + the guard reuse + the
  HEURISTIC ceiling: **Jarvis is free to learn; it is not free to self-certify.**

## Usage

```bash
npm run jarvis:learn -- record <work_unit_id> --kind HYPOTHESIS \
  --subsystem voice --symptom "mic stranded in ARMING" \
  --strategy "add arming timeout" --statement "ARMING has no timeout"

npm run jarvis:learn -- record <work_unit_id> --kind OUTCOME \
  --bears-on t-xxxx --outcome REFUTED --grounding VERIFIED \
  --evidence executable_gate:mic-lifecycle.test.ts --statement "still parked"

npm run jarvis:learn -- verify <work_unit_id>

npm run jarvis:experience -- query --symptom "mic stranded in ARMING"
npm run jarvis:experience -- strategy "add arming timeout"
npm run jarvis:experience -- promotion-candidate "add arming timeout"
```

## What is NOT built

JSL-02 (learned procedures), JSL-03 (agentic variation), JSL-04 (supervisor) and
JSL-05 (the AIN learning bridge) are **not started**. The promotion ceiling is
implemented now, before any of them, so it can never be retrofitted loosely later.

⛔ **The AIN bridge in particular is not a next step.** Routing member-side
relational signal into this loop is exactly the held direction above, and it
requires a founder ruling — not an extension of this commit.
