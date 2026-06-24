# Memory Activation Model — CANDIDATE (2026-06-22)

> **Status: Cat 1 — held candidate, NOT canon.** Proposed revision to
> `MEMORY_EXPANSION_PLAN_2026-05-24.md` §1 (Activation Phase Vocabulary).
> Co-developed with Kelly in session 2026-06-22. Promotion to canon requires
> demonstrated architectural rent (per `feedback_principles_pay_rent_in_architecture`)
> **and** an explicit Kelly directive. Until then this is a framing in the register,
> not an authorization.

---

## 0. Why this exists

The nine-layer map in the Expansion Plan described each layer with a single
state word (`dormant`, `observed-only`, `prompt-influencing`, …). That single
word silently carried three different claims at once — *what the layer is*, *how
much of it exists*, and *whether it may participate* — and let a deployed-but-
unproven layer borrow the credibility of a proven one. This model separates
those claims so capability can expand **without outrunning trust**, and so no
label hides a real gap behind a flattering one.

It is, deliberately, a re-derivation of standing project doctrine:

- Kelly's **three-states** rule — *never blur exists / designed / authorized*
  (`feedback_status_three_states_and_rhythm`, 2026-06-20).
- The **`Live / Designed / Vision`** claim instrument (`MARKETING_CLAIM_DISCIPLINE.md`).
- The **six-category typology** (`STATE_AND_ROADMAP_2026-05-24.md` §8) — whose
  whole purpose is to stop Cat 1–5 from being narrated as Cat 6.

Convergence with canon already in force is the point, not a weakness. The one
*additive* move is in §2: turning three **states** into three **orthogonal axes**.

---

## 1. The invariant (state this unmistakably)

> **No memory layer may participate in member interactions until it satisfies the
> constitutional gate: provenance, consent, Sanctuary suppression, observability,
> and any layer-specific governance.**

Activation is a **governed event, not a deployment event**. This is a
*constitutional* claim, not a *historical* one — it says nothing about when the
code was written, only about the condition for influencing a member. (This
replaces the earlier "every layer is designed within the constitutional
architecture from the outset," which over-claimed clean genesis for services
that predate the discipline and are being corrected *into* it — see §4,
QuantumFieldMemory.)

Sanctuary suppression is named explicitly in the gate because it is **universal
and never relaxes** — it is not "layer-specific governance" and must not be
demoted into that bucket (Expansion Plan Cross-Layer Principle #6).

---

## 2. Three orthogonal axes (the additive move)

Every capability answers three questions **independently**:

| Axis | Question | Maps to |
|------|----------|---------|
| **Architecture** | What is it? | design / "designed" |
| **Implementation** | How much of it exists? | "exists" / built |
| **Authorization** | May it participate? | "authorized" / the constitutional gate |

These are axes, not stages on a line. Legitimate combinations include:
*architecturally complete · partially implemented · constitutionally unauthorized*,
or *experimentally implemented · architecturally under revision · permanently
barred*. Architecture, implementation, and authorization evolve independently and
meet at exactly one decisive point: **nothing influences a member until it has
earned the right.**

### The rent this pays

Orthogonality **forbids a specific inference**: *"more built ⇒ closer to live."*

> **QuantumFieldMemory (810 LOC) is *further* from activation than Episodic
> (283 LOC).** It is behind on all three axes — architecture under redesign,
> 0 persistence despite the line count, authorization frozen — and carries 3× the
> code. Implementation mass is orthogonal to authorization; in this instance it is
> *inversely* correlated.

Because it changes what a reviewer is *permitted to conclude* from the evidence,
the orthogonality has architectural consequence — the basis for canon-candidacy.

---

## 3. "Dormant" — keep it internal, narrow; retire it publicly

**Internal definition (engineering term, precise):**

> **Dormant** — this implementation currently has **zero live runtime consumers.**
> Nothing more. It asserts nothing about design maturity, implementation maturity,
> constitutional readiness, technical quality, or future intent.

That narrowness is a virtue — but the public hears "unfinished / abandoned /
disabled / sleeping / incomplete," which are interpretations, not the definition.
So **"dormant" is never a public headline.** Public-facing docs answer the
question readers actually have — *what is this layer's current operational role?*
— as a deliberate **projection of the three axes onto the operational-role axis.**
Internally, all three axes are retained.

A direct consequence of the narrow definition: **Developmental and Symbolic are
not dormant.** They participate at the *observation tier* (loaders feed counts
into `memoryHealth`); they simply don't influence the prompt yet. The truly-
dormant set is **{Episodic, Somatic, Field substrates}**.

### Participation tiers (what the operational-role axis projects onto)

`None (dormant)` → `Observation-only` → `Influence` → `Spine`

---

## 4. Per-layer placement (honest, three-axis)

> Evidence: `MEMORY_EXPANSION_PLAN_2026-05-24.md` §2 + `MEMORY_SERVICE_STATUS_MATRIX_2026-05-24.md`.

| Layer | Architecture | Implementation | Authorization | Public status |
|-------|--------------|----------------|---------------|---------------|
| **Semantic (atoms)** | member-marked salience; cross-atom synthesis refused | live loader + schema constraints + `is_breakthrough` | **authorized, in prod** (Cut 1) | **Active** |
| **Relational** | member-declared relationships | `MemberLiveContext.ts` wired | authorized, limited surface | **Active (limited)** |
| **Conversational** | recall block + consent gate | code-complete (Phase 2) | **not yet** — branch-only; DEEP blocked at `buildComprehensiveVoicePrompt` (`ADDENDA_CHANNEL_DIVERGENCE` §II.B) | **Activation staged — pending deploy + verification** |
| **Developmental** | defined | loader feeds count → `memoryHealth.developmental` | observation tier only | **Observing (count only)** |
| **Symbolic** | defined; highest interpretive risk | `loadRecentThemeSignals` feeds count → `memoryHealth.pattern` | observation tier only; influence gated on **member-confirmation** | **Observing (count only)** |
| **Episodic** | clear-provenance events | service 283 LOC + table `episodic_memories` ✓; 0 callers; no test | not activated — **engineering** (wire 1st + verify) | **Implemented, pending activation** |
| **Somatic** | member-stated only, never inferred; default-off consent | service exists; **no capture schema / input source defined** (matrix lists a `somatic_memories` table — reconcile) | not activated — **interaction design** (input mechanism first) | **Under implementation** |
| **Field / Coherence** | operational (drift/continuity), not mystical; `CoherenceFieldService` is the real substrate (403 LOC + table ✓, 0 callers) | substrate built, unwired | **constitutionally gated** — observation-phase freeze; lift = Kelly directive | **Constitutionally gated** |
| _QuantumFieldMemory_ (service, not a layer) | **under redesign** → `FieldPatternMemoryService` (rename + gut) | 810 LOC, **0 persistence** | barred (frozen + slated for demolition) | **Legacy prototype under redesign** |
| **Meta / Provenance** | the governing / observability plane | `buildMemoryHealth` + substrate monitor live | infrastructural — not member-opt-out; surfaces no member content | **Active (spine)** |

Note the composability: each cell varies independently of its neighbors. Episodic
is implementation-strong / authorization-pending; Field is architecture-defined /
authorization-gated; QuantumFieldMemory is implementation-heavy / architecture-
under-revision / barred. No single word could carry all of that without lying.

---

## 5. Headline framing (public)

> The MAIA memory architecture is intentionally layered and progressively
> activated. **No layer is activated outside the constitutional architecture** —
> provenance, consent, Sanctuary suppression, and observability bind every layer
> before it can influence a member interaction. Layers activate only when their
> operational behavior, governance, and verification criteria are sufficiently
> mature; a few early services predate that standard and are queued for correction
> before they could ever activate. This lets capability expand without outrunning
> trust — and without "designed" or "implemented" borrowing credibility a given
> layer hasn't earned.

---

## 6. What this does NOT authorize

- It does **not** activate any layer. Activation remains per-layer, evidence-gated,
  Kelly-directed.
- It does **not** lift the Field observation-phase freeze.
- It does **not** promote itself to canon. It is a held framing until it pays rent
  in a concrete decision and Kelly directs promotion.

## 7. Promotion conditions

1. **Rent**: the model demonstrably changes a real decision — e.g. it catches an
   over-claim in an architectural overview, or blocks a "more built ⇒ closer to
   live" inference in a live planning thread.
2. **Directive**: Kelly authorizes folding §1–§3 into `MEMORY_EXPANSION_PLAN` §1,
   replacing the single-word activation vocabulary with the three-axis projection.

Cross-refs: `feedback_status_three_states_and_rhythm`,
`feedback_principles_pay_rent_in_architecture`,
`project_no_static_ui_claim_without_verified_state`,
`ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md`,
`MEMORY_SERVICE_STATUS_MATRIX_2026-05-24.md`.
