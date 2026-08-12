# CRP-001 — REQUIRED UNIT RETURN SCHEMA

**Version:** v1
**Authored:** 2026-08-12
**Author:** Founder
**Binds:** every JARVIS unit executed under
`JARVIS-CRP-001-CONTINUITY-RECOVERY-PROGRAM-MANDATE.md` §20.
**Status of the program:** AUTHORED / NOT AUTHORIZED. This schema is binding
*when* the program is authorized; it does not itself authorize anything.

This is the mandatory evidence return. It is not prose and not optional.
A unit that cannot populate this schema has not completed.

---

## 1. The schema

```text
REQUIRED UNIT RETURN

IDENTITY
- unit / finding ID
- canonical ref + SHA
- deployed/runtime referent
- instrument + version

VALIDITY
- evidence
- evidence window
- positive control
- negative control
- instrument admissibility
- referent re-bind result

JUDGMENT
- classification
- what is established
- what is NOT established
- counterevidence
- exact broken crossing

REPAIR
- smallest repair proposed
- alternatives considered
- falsifier
- authority required
- scope / non-goals

PROOF
- benchmark before
- benchmark after
- regression results
- adversarial / negative tests
- neighboring memory classes checked for harm

DELIVERY
- implementation commit
- deployed SHA
- deployment evidence
- production witness

OUTCOME
- member-facing consequence measured
- exact crossing changed
- remaining unknowns
- next mandated unresolved crossing
- disposition: PASS / ITERATE / STOP / NO DISPOSITION
```

Sections that do not apply to a diagnostic-only unit (REPAIR, PROOF, DELIVERY)
are marked `N/A — diagnostic unit, no repair authorized`. They are never left
blank and never silently dropped.

---

## 2. Fields that are non-empty by rule

Three fields may never be omitted, abbreviated, or filled with a bare
negation. A return violating this section is incomplete, not merely terse.

### 2.1 `what is NOT established`

Prevents a bounded mechanism result from widening into a system claim.

```text
ESTABLISHES:
RETRIEVED → SELECTED — load-bearing memory survived selection in
38/40 benchmark cases.

DOES NOT ESTABLISH:
- SELECTED → ASSEMBLED
- ASSEMBLED → FINAL MODEL REQUEST
- FINAL MODEL REQUEST → USED
- USED → OBSERVABLE IN RESPONSE
- OBSERVABLE IN RESPONSE → EXPERIENCED CONTINUITY
- behavior of memory classes outside the benchmark
```

**Rule of construction:** claims attach to crossings, so the non-establishment
list is written as **crossings, not stages**. It must name every remaining
crossing downstream of the one proven, along the §2.4 chain, plus every memory
class not tested.

A unit proving `RETRIEVED → SELECTED` cannot leave any of the five downstream
crossings unlisted. Listing bare stages (`final model request; used`) is an
incomplete fill: a stage name does not say which crossing into it remains
unproven.

### 2.2 `counterevidence`

Bare `none` is never permitted. Either actual contrary evidence, or:

```text
counterevidence:
none encountered — searched:
- X
- Y
- Z
```

**Rule of construction:** the search list must be derived from the unit's own
`falsifier` field. It states where the conclusion would have broken if it were
wrong, and confirms those places were looked at. A search list that does not
intersect the falsifier is not a search list — it is decoration, and the field
is unpopulated.

This field exists to force the executor to look for the world in which its
conclusion is wrong.

### 2.3 `exact broken crossing`

The most important field in the schema.

Not:

```text
memory broken
```

Not:

```text
continuity weak
```

But:

```text
RETRIEVED
    ↓
SELECTED
```

or:

```text
MEMBER CORRECTION
    ↓
SUPERSESSION STATE
```

or:

```text
ASSEMBLED CONTEXT
    ↓
FINAL MODEL REQUEST
```

**Rule of construction:** both endpoints must be named stages — from the
canonical vocabulary in §2.4, from §9's correction chain, or from a substrate
chain declared in the unit's own IDENTITY. A crossing naming a subsystem on
either side (`retrieval → memory`) is malformed. Repairs attach to crossings,
never to subsystems.

**Adjacency rule.** A crossing names a stage and its *immediately adjacent*
stage on the same declared chain. `SELECTED → FINAL MODEL REQUEST` is
malformed: it hides ASSEMBLED, and a hidden intermediate crossing is an
unproven one. Nine states, eight crossings on the §2.4 chain.

**Investigation order may vary. Proof adjacency may not.** JARVIS may work a
proven defect at `MEMBER CORRECTION → SUPERSESSION STATE` while
`SELECTED → ASSEMBLED` is open elsewhere — program prioritization is not
required to be linear, and units on different chains proceed independently.
What no unit may do is claim a single path proven by stepping over one of its
stages.

### 2.4 Canonical stage vocabulary

The crossing field is only checkable if the stage names are fixed. Two spellings
of the same stage make two units' crossings incomparable, and the field stops
being evidence.

**Canonical chain:**

```text
EXISTS
→ ELIGIBLE
→ RETRIEVED
→ SELECTED
→ ASSEMBLED
→ FINAL MODEL REQUEST
→ USED
→ OBSERVABLE IN RESPONSE
→ EXPERIENCED CONTINUITY
```

Nine stages. Two points where drift has already occurred and is resolved here:

- **`FINAL MODEL REQUEST`, not `FINAL PROMPT`.** Mandate §5 requires the
  witness to reconcile against the actual final model request. The prompt is
  one component of that request alongside the message array, system content
  and tool definitions — a memory can be in the request without being in
  anything an executor would call "the prompt." The wider term is the
  provable one. `FINAL PROMPT` is not an accepted alias; it is a malformed
  stage name.

  **Candidate-bound participation.** The wider boundary must not become a
  permissive one. The stage is satisfied only when:

  > the specific selected memory, or a provenance-preserving transformation
  > demonstrably derived from it, is serialized into the actual request
  > submitted to the model, and correlated to the same exchange.

  Not satisfied by: unrelated static system text; a generic tool description;
  semantically similar prose from another source; any material the witness
  cannot bind back to the candidate record by ID. "Similar information
  appeared somewhere in the request" is not participation — it is the
  identity failure this definition exists to exclude.

  The crossing `ASSEMBLED → FINAL MODEL REQUEST` therefore asks exactly:
  *did what assembly selected actually make it across the model boundary?*

  This also makes the stage's negative control constructible: a candidate that
  was **not** selected must not be detectable as present. Without
  candidate-binding there is no such control, and per §3 an instrument with no
  negative control is INADMISSIBLE TO TEST.

- **`OBSERVABLE IN RESPONSE` and `EXPERIENCED CONTINUITY` are two stages, not
  one.** Mandate §2 states that a model response is not longitudinal
  continuity. Collapsing them would let a single-exchange observation close
  the member-experience claim — the exact widening §2.1 exists to prevent.
  They are proven by different instruments over different windows: one
  per-exchange, one longitudinal across sessions and returns.

  Consequence: the terminal crossing `OBSERVABLE IN RESPONSE → EXPERIENCED
  CONTINUITY` cannot be closed by any single-exchange unit, and no unit
  proving `USED` may list EXPERIENCED CONTINUITY as established.

The nine-stage chain supersedes the eight-stage form in mandate §2 for the
purpose of naming crossings. Mandate §2's prose is unchanged and still
governs; this is a vocabulary fix, not a change to the epistemic rule.

### 2.5 House form — compliant OUTCOME block

Founder-ruled 2026-08-12. This is the accepted form.

```text
Broken crossing: RETRIEVED → SELECTED

Before:
5/23 candidates survived;
load-bearing survival unknown.

After:
load-bearing memories survive at the measured target rate.

Proven by:
instrument X @ version Y
against referent Z.

Does not establish:
- SELECTED → ASSEMBLED
- ASSEMBLED → FINAL MODEL REQUEST
- FINAL MODEL REQUEST → USED
- USED → OBSERVABLE IN RESPONSE
- OBSERVABLE IN RESPONSE → EXPERIENCED CONTINUITY
- behavior of memory classes outside the benchmark

Next adjacent crossing:
SELECTED → ASSEMBLED
```

Every downstream crossing is enumerated, and the next one named is adjacent.
That is what makes the return hard to inflate: there is no wording available
for "and the rest is probably fine."

### 2.6 `evidence window` — added 2026-08-12

A crossing's claim is only as wide as the window it was observed over. Without
that window declared, "claimed experienced continuity from a single exchange"
cannot be rejected by anything but a reader's judgment — which is not
enforcement. The field is therefore mandatory in VALIDITY, and structured:

```text
evidence window:
- exchanges:        N
- distinct sessions: N
- leave/return boundaries crossed: N
- time span:        <duration>
- subjects:         N (members | founder | synthetic personae — state which)
```

**Minimum windows by crossing.** A unit whose declared window falls below the
minimum for the crossing it claims is INADMISSIBLE TO TEST → NO DISPOSITION,
regardless of what the evidence appeared to show.

| Crossing | Minimum window |
| --- | --- |
| EXISTS → ELIGIBLE | single record |
| ELIGIBLE → RETRIEVED | single exchange |
| RETRIEVED → SELECTED | single exchange |
| SELECTED → ASSEMBLED | single exchange |
| ASSEMBLED → FINAL MODEL REQUEST | single exchange |
| FINAL MODEL REQUEST → USED | single exchange |
| USED → OBSERVABLE IN RESPONSE | single exchange |
| OBSERVABLE IN RESPONSE → EXPERIENCED CONTINUITY | **≥2 distinct sessions, ≥1 leave/return boundary, >1 subject** |

The terminal crossing's minimum is the mechanical form of the §2.4 ruling that
no single-exchange unit may close it. Mandate §18's other longitudinal
acceptance conditions — corrections surviving, relevant memory resurfacing
later, irrelevant memory staying silent — each imply their own window and are
declared per unit.

Benchmark-only units state `subjects: N synthetic personae` and may not use
the word *member* anywhere in OUTCOME.

---

## 3. Disposition is not classification

§4's eight evidence classifications and this schema's four dispositions are
orthogonal axes. Both are returned. The mapping is fixed, not improvised:

| Classification | Permitted disposition |
| --- | --- |
| PROVEN HEALTHY | PASS |
| PROVEN DEFECT | ITERATE (repair authorized) or STOP (repair not authorized) |
| PARTIAL | ITERATE |
| UNKNOWN | ITERATE or STOP |
| DESIGNED BUT UNUSED | ITERATE or STOP |
| STALE / DEAD | PASS (on removal) or STOP |
| INADMISSIBLE TO TEST | NO DISPOSITION |
| REFERENT UNBOUND | NO DISPOSITION |

**NO DISPOSITION is not a soft fail.** It records that the instrument or the
referent, not the system, was the thing that failed. It never advances the
program and never counts toward §18 acceptance.

A missing or failed control forces INADMISSIBLE TO TEST → NO DISPOSITION,
regardless of what the evidence appeared to show (§4).

---

## 4. Unit state machine

```text
FINDING
   ↓
BROKEN CROSSING
   ↓
VALID INSTRUMENT?
   ↓
PROVEN DEFECT?
   ↓
SMALLEST REPAIR
   ↓
PROOF
   ↓
DEPLOY
   ↓
PRODUCTION WITNESS
   ↓
CROSSING NOW PROVEN?
       ├── NO → ITERATE
       └── YES → NEXT MANDATED CROSSING
```

Each downward arrow is a gate, not a step. A `NO` at VALID INSTRUMENT? or
PROVEN DEFECT? exits to NO DISPOSITION and does not fall through to SMALLEST
REPAIR.

---

## 5. The standing prohibition

JARVIS never returns "memory improved."

It returns exactly **which crossing changed, under which referent, using which
instrument, by how much, and what that still does not prove.**

---

## 6. Enforcement — OPEN

This schema is currently prose. Prose is not an enforcement point, and a
non-empty-by-rule field that nothing checks is the same class of gap this
program exists to close.

Candidate enforcement points, unruled:

- **`record-finding`** (§16) carries this as its declared OUTPUT SCHEMA and
  rejects returns failing §2 — makes enforcement an instrument property, but
  §17 warns that stop conditions are control-plane and not routable through
  skills. Whether *return validity* is control-plane or instrument-plane is
  itself unruled.
- A validator run at unit close, outside the skill router — control-plane,
  but must exist before the first unit returns.
- Founder review at each unit close — reliable at low volume, does not scale,
  and reintroduces the human as the checking mechanism.

Until this is ruled, §2 is a convention the executor may satisfy in form
without substance — the `counterevidence: none — searched: [trivia]` failure
being the obvious hole.

---

## LOG

- **2026-08-12** — v1 authored by founder, amending CRP-001 §20 from a field
  inventory into a binding return schema. §2's three non-empty rules and §3's
  classification/disposition mapping are new. §6 enforcement remains open.
- **2026-08-12** — Founder ruling on the stage vocabulary: **ACCEPT all
  three** corrections, with candidate-bound participation tightened into
  FINAL MODEL REQUEST. Nine states / eight crossings canonical for crossing
  names and unit-return claims; mandate §2's eight-stage prose left intact as
  historical mandate text, not silently rewritten. Adjacency rule and
  *investigation order may vary, proof adjacency may not* added to §2.3.
  §2.1's non-establishment list converted from stages to crossings for
  consistency with the house form. §6 enforcement and launch rulings C1–C4
  remain open and untouched.
