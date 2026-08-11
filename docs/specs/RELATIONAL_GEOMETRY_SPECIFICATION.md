# PHASE 0 — RELATIONAL GEOMETRY SPECIFICATION

**Cat 1 research artifact.** Governs: `RELATIONAL_GEOMETRY_PROGRAM_2026-08-11.md`. Session `s-cad54855` · branch `chore/relational-geometry-program` · trunk `f9a7326f1`.

Phase 0 deliverable under the corrected ordering. **No external claim has been recovered and none is relied on here.** Nothing in this document is evidence of anything about any model; it specifies what would count as evidence.

---

## 1. What makes a row complete

A candidate geometry is admissible only with every field filled:

```
DOMAIN/STATE → TRANSFORMATION → EXPECTED INVARIANT → EXPECTED VARIANT
             → MEASUREMENT → FALSIFIER
```

Plus three requirements that exist to stop the harness from being unfalsifiable:

- **R1 — Null variant.** Every family carries a transformation that should produce *no* effect. Without it, "the model changed its answer" is uninterpretable.
- **R2 — Independent raters.** Invariants are validated by people who did not author the transformation. Otherwise a pass means only that the model shares our conception (§2.3 circularity hazard).
- **R3 — Declared structure.** State the algebraic structure claimed, and what would refute it. `UNKNOWN` is a legal value. "Group" is not a default.

⛔ **An incomplete row is a metaphor and does not enter the corpus.**

Scope discipline: **three domains specified completely** beats twelve specified loosely. The schema is proven on the hard cases first.

---

## 2. DOMAIN A — Relational episode

**The sharpest and cheapest domain. Build this first.**

### State
A minimal relational episode: two participants, one act, one response.

> **Canonical seed:** *A betrays B; B withdraws from A.*

State = the assignment of **roles** (agent-of-act, recipient-of-act, agent-of-response) to **participants**, plus the act/response types. State is **not** the words.

### Transformations

| ID | Transformation | Class |
|---|---|---|
| `A-P1` | rename participants | presentation |
| `A-P2` | change gender / pronouns | presentation |
| `A-P3` | change setting (workplace → family → friendship) | presentation |
| `A-P4` | change register (clinical → colloquial → literary) | presentation |
| `A-P5` | recast in metaphor (weather, animals, geometry) | presentation |
| `A-P6` | reorder narration (chronological ↔ retrospective) | presentation |
| `A-P7` | change emotional intensity (understated ↔ vivid) | presentation |
| `A-P8` | change grammatical voice (active ↔ passive) | presentation |
| `A-N0` | **null:** reparaphrase with no structural or presentational change | **control (R1)** |
| `A-S1` | **role reversal:** `A betrays B → B betrays A` | **structural** |
| `A-S2` | response reversal: `B withdraws → B approaches` | structural |
| `A-S3` | act substitution: `betrays → protects` | structural |
| `A-S4` | add third participant C as instigator | structural |

### Expected invariant
Under **any composition of `A-P*`**, answers to the fixed probe set must be *identical up to the renaming bijection*:

1. Whose trust was violated?
2. Who is more likely to initiate contact next?
3. Who, if anyone, owes repair?
4. What would repair require?
5. What is the risk if nothing changes?

### Expected variant
Under `A-S1`, probes 1–3 **must** swap participants. Under `A-S3`, probe 1 must become inapplicable rather than swap — a system that answers "whose trust was violated" after `betrays → protects` is pattern-completing, not reasoning.

### Measurement
Deterministic. Probes 1–3 are role-assignment questions with a closed answer set `{A, B, C, neither, both}`. Score:

- **Presentation invariance** = fraction of `A-P*` items where the role map is preserved under the bijection.
- **Structural sensitivity** = fraction of `A-S*` items where the role map changes *as specified* (not merely changes).
- **Null stability** = agreement under `A-N0`. **This is the noise floor.** Sensitivity is meaningless unless it exceeds it.
- Probes 4–5 are free text → independent raters (R2), blind to condition.

### Falsifier
**Structural sensitivity ≤ null stability.** A system whose answers move no more under role reversal than under pure reparaphrase has no relational geometry — it has semantic content association. Conversely, presentation invariance at chance means the system tracks surface, not relation.

### Declared structure (R3)
**Claim: group-like.** `A-P1`, `A-P2`, `A-P8` are invertible. `A-S1` and `A-S2` are **involutions** (order 2, self-inverse). Composition is expected to be associative.

**Refuted if:** applying `A-S1` twice does not return the original role map, or if `A-P*` composition is order-dependent in the probe answers.

---

## 3. DOMAIN B — Developmental transition

**Where the composition test lives. The candidate cheapest decisive falsifier.**

### State
A person-description at a timepoint, drawn from *authored* material only — member-written text, never inferred state. `S(t₁)`, `S(t₂)`, `S(t₃)`.

⚠️ **Sovereignty constraint, binding on this domain:** the object under study is the *system's characterization of a span*, not a person's development. No output of Domain B may be shown to a member, and no member-facing trajectory surface is authorized by any result here. See program §4bis.4.

### Transformations
`τ₁ : S(t₁) → S(t₂)` · `τ₂ : S(t₂) → S(t₃)` · `τ_c : S(t₁) → S(t₃)` (the composite span)

### Expected invariant
**Compositionality.** The system's characterization of `τ_c` must be derivable from its characterizations of `τ₁` and `τ₂`.

### Expected variant
Reordering the spans (`τ₂` before `τ₁`) should generally produce a *different* composite — non-commutativity is expected and is itself a structural signal.

### Measurement
Characterizations are elicited into a **closed vocabulary** fixed in advance (e.g. `differentiating · integrating · stabilizing · dissolving · repeating · escalating · relinquishing · widening`), scored three ways:

- **Composition agreement:** does `characterize(τ_c)` equal `compose(characterize(τ₁), characterize(τ₂))` under a composition table **declared before measurement**?
- **Blind-span control:** the same span presented without its intermediate state. Divergence localizes whether the model is reading the transition or re-reading the endpoints.
- **Order sensitivity:** does swapping produce a different composite?

### Falsifier
**Composition agreement at or below chance** ⟹ the transformation vocabulary is decorative. The system is applying labels to spans, not composing transformations, and every downstream claim about a "transformation algebra" collapses. **This test requires no interpretability tooling and runs on any model today.**

Secondary falsifier: if the blind-span control matches the full condition, the system is not using the transition at all — only the endpoints. That refutes *"the transition carries information"* directly.

### Declared structure (R3)
**Claim: NOT a group.** Expected to be a **monoid or a category with partial composition** — irreversible transitions, and not every transformation applicable to every state.

**Refuted if** transitions turn out cleanly invertible — which would be evidence they are labels attached to endpoint pairs rather than operations on states.

### Testing the §5bis.1 discriminator
The same corpus tests the development/disintegration discriminator without any normative judgment:

| Signature | Structural test |
|---|---|
| repetition | `characterize(τ_c) ≈ identity` while `τ₁, τ₂ ≠ identity` |
| escalation | same characterization repeated, reachable-set unchanged |
| disintegration | Domain-A-style invariants no longer recoverable at `t₃` |
| development | invariants recoverable **and** reachable set enlarged |

**Reachable set** is operationalized as: the number of distinct admissible next-transformations independent raters judge available at `t₃` vs `t₁`. If raters cannot do this reliably, **the discriminator is refuted** and §5bis.1 is recorded as failed. That outcome is a first-class result.

---

## 4. DOMAIN C — Elemental transformation family

**The riskiest domain. Specified last and guarded hardest.**

⛔ Invariant 14 (cultural sovereignty) governs. This domain tests whether a *transformation algebra of experience* is detectable. It establishes nothing about the ontological status of the elements, and no result here authorizes any member-facing elemental surface.

### State
A passage of experiential material, member-authored or synthetic, with no elemental labelling.

### Transformations
Candidate families, stated as verbs per program §4bis:

| Family | Candidate transformations |
|---|---|
| **Fire** | differentiate · intensify · direct · transform |
| **Water** | flow · join · dissolve · resonate · carry |
| **Earth** | form · stabilize · contain · materialize |
| **Air** | distinguish · relate · reframe · circulate · perspectivize |
| **Aether** | ⚠️ **typed separately — not a fifth member.** See §4bis.2. Provisionally: a property *of* composition, tested only after C1–C3 resolve. |
| `C-N0` | **null:** stylistic edit, no transformation | **control (R1)** |

### Expected invariant
Under a within-family transformation, the *referent* of the passage remains identifiable — it is recognizably the same phenomenon undergoing something.

### Expected variant
Across families, the transformed passages must be **distinguishable by independent raters above chance without seeing the family label**.

### Measurement — three tests, in order, each gating the next

- **C1 — Human identifiability (R2).** Blind raters assign transformed passages to families. **Gate: κ ≥ 0.6 across ≥ 3 raters.** Below that, the families are not reliably distinguishable *by people*, and no model result is interpretable. **If C1 fails, Domain C stops. This is the most likely outcome and it is a real finding.**
- **C2 — Model performance.** Can a model perform a named transformation such that blind raters identify it at C1 rates?
- **C3 — Invertibility probe.** Given a transformed passage, can the original be recovered? **Predicted: no.** Recovery success is evidence the "transformation" was a stylistic overlay — i.e. a label.

### Falsifier
C1 below threshold ⟹ **no elemental transformation algebra is demonstrated.** Record as negative result; do not rescue by loosening the vocabulary, adding raters until agreement appears, or reducing to fewer families.

### Declared structure (R3)
**Claim: NOT a group. Expected monoid/semigroup — composition without inverses.** Refuted by C3 success.

---

## 5. Cheapest decisive falsifier — recommended first experiment

**Domain B composition test, run on the Domain A corpus.**

Rationale: it needs no model internals, no training, no GPU, and no external claim recovery. It falsifies the program's *central* structural commitment — that transformations compose — using only prompt-level access. If transformations do not compose, Phases 4–5 have nothing to look for and the program stops before any expensive work.

Estimated shape: ~60 episode triples × ~8 presentation transforms × a fixed probe set, closed-vocabulary scoring, 3 blind raters on the free-text probes. Runnable against any model, including local.

**Second-cheapest:** Domain A structural-sensitivity vs null-stability. Same corpus, answers whether relational structure is tracked at all. Run both from one build.

---

## 6. What this document does not establish

It specifies questions. It contains **no** measurement, no model result, no rater data, no external source. Every claim about expected outcomes is a **prediction recorded before measurement** so that it can be wrong.

Negative results are first-class. Do not optimize the corpus to validate the founder's hypothesis.
