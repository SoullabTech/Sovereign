# INV — §5.3(4) Attribution Enforceability

**Lane**: `feature/ideas-cut02-attribution-enforceability`
**Base**: `65dd0aa` — the ratified repair contract
**Status**: **BOUNDED DESIGN INVESTIGATION.** No production code, migration, prompt edit,
implementation, merge, or deploy.
**Opened**: 2026-09-02

**Question.** §5.3(4) of the ratified contract requires that *unsupported member-attribution
fails before persistence*. It is the only required control whose **enforceability** is
unknown, and it is load-bearing: if it cannot stand, **Finding D stays open** and Cuts 0–2
cannot go green regardless of what else lands.

**Verdict required, one of:** ENFORCEABLE · PARTIALLY ENFORCEABLE · NOT ENFORCEABLE.

**Out of scope.** Semantic drift (§7.1) is **not** in scope and is used **only as a negative
control** — a topology that appears to catch drift is over-claiming and must be rejected.

---

## 1. What counts as unsupported member-attribution

### 1.1 Definition

> An **attribution claim** is an assertion by MAIA whose subject is the member and whose
> predicate ascribes to them a **position, commitment, belief, in-progress act, or
> possession** with respect to the idea.
>
> An attribution claim is **supported** iff it references a proposition that is `current`
> for that member in that idea. Otherwise it is **unsupported**.

Two properties make this workable where drift is not:

- **The subject is syntactically identifiable** — second person, ascriptive predicate.
- **Support is a lookup**, not a judgement — an id either resolves to `current` or it does
  not.

### 1.2 Positive set — drawn from the witness, not invented

| Witnessed utterance | Stance | Why it qualifies |
|---|---|---|
| *"you're building a **protocol for legibility**"* | Distill | ascribes an in-progress act; the phrase is MAIA's own |
| *"you've built a protocol for legibility"* | Challenge | ascribes a completed act, after the member declined to own it |
| *"you're building a shared **protocol** for when each mindset gets to lead"* | Connect | ascribes an act; phrase MAIA-originated |
| *"**You've already identified** that the process needs to be linear and clear"* | ordinary | ascribes a recognition |
| *"**You've moved** from the relational friction to a structural solution"* | ordinary | ascribes a movement of position |
| *"**what you're holding** is…"* | ordinary | ascribes a held position |
| *"visibility itself creates alignment"* — **as the member's assumption** | Challenge | ascribes a premise, then tests it |

### 1.3 Negative set — must NOT be caught

| Utterance | Why excluded |
|---|---|
| *"One possible formulation is X"* | MAIA-owned, hedged, no member subject |
| *"What would clear instructions be for tomorrow?"* | question |
| *"From that distinction…"* | connective |
| *"Larry may not participate in the protocol"* | subject is a third party |
| **`pace → speed → CEO speed → move fast`** | **negative control — drift.** No step attributes a position to the member. A topology that flags this is over-reaching. |

### 1.4 The boundary case, named explicitly

*"That's where the bridge **actually lives**"* asserts something about **the idea**, not about
**the member's position**. It is Finding D's *other* half — declarative drift about the
material — and is **not** an attribution claim under this definition. It is **not** in scope
here, and §5.3(4) does not repair it.

---

## 2. Enforcement topologies, compared

### T1 — Prompt instruction · **REJECTED (excluded by mandate, and by evidence)**

Failed three times in the witness against instructions written specifically to prevent it.
Not a control.

### T2 — Lexical phrasebook on output · **INSUFFICIENT ALONE (excluded by mandate)**

**But one asymmetry must be recorded, because it is easy to get wrong.**

Finding A's objection was that *the member's standing depended on the member's phrasing* —
a phrasebook applied to **input the member controls**. Here the pattern-matching applies to
**MAIA's own output**, which the system generates.

| | Finding A (rejected) | Output-side check |
|---|---|---|
| Applies to | member's words | MAIA's words |
| Can we constrain the vocabulary? | **no** | **yes** |
| Cost of a false negative | member unheard | a Finding D recurrence |
| Cost of a false positive | — | **one regeneration** |

**Finding A's objection does not transfer symmetrically.** An output-side syntactic check is
not the same defect. It remains **insufficient alone** — but it is admissible as a
*component*, which T5 uses.

### T3 — Model self-certification · **REJECTED (excluded by mandate, and by evidence)**

MAIA emits its own claim/reference list. The Connect failure is decisive: the model produced
a fabricated attribution *with confidence*. A self-certifying gate passes exactly the cases
it exists to catch.

### T4 — Second-model adjudication · **NOT A GATE — second line only**

A separate call has no stake in the output, so it is not strictly self-certification. But it
is still model judgement, inherits the same error class, and can be confidently wrong. It
belongs where the contract already puts validation: **after** structure, never instead of it.

### T5 — Referenced-attribution emission + closed-world persistence · **CANDIDATE**

The response is emitted as **typed segments** rather than free prose:

| Segment type | Requirement | Persistence |
|---|---|---|
| `attribution` | **must** carry `proposition_id` | rejected unless the id resolves to `current` **for this member, in this idea** |
| `offering` | none | persisted as an `open` MAIA proposition (§5.3(3)) |
| `question` / `connective` | none | no standing |

**The referenced half is fully, structurally enforceable.** *"Does this id resolve to a
`current` proposition scoped to this member and idea?"* is a foreign-key and status check at
the persistence boundary — no judgement, no model, no phrasing.

**The residual hole is real:** MAIA writes an attribution *inside* a segment it typed
`offering` or `connective`. Catching that requires inspecting prose.

---

## 3. The move that closes the hole

**Do not block unsupported attribution. Route it.**

> **An attribution claim with no `current` proposition to reference cannot be emitted as an
> assertion. It can only be emitted as an `offering`.**

This is not a new mechanism — it is **§1.7 nomination**, already ratified. The claim becomes
*"one thing this could be…"*, carries `open` standing, is addressable, and is available for
`adopt` / `revise` / `reject`. **The member confirmation boundary is the offering itself.**

So §5.3(4) is satisfied **by conversion, not by refusal**: nothing is suppressed, and
nothing is asserted about the member that they have not ratified.

The residual syntactic check now has a **recoverable** failure mode: a second-person
ascriptive construction detected in a non-`attribution` segment triggers **regeneration or
downgrade to `offering`**, bounded by retry, then failing the attempt (§6.1). A false
positive costs a retry. A false negative is a Finding D recurrence — so the gate is tuned to
**over-block**.

---

## 4. Test against the witnessed record

| Witnessed failure | Under T5 + §3 |
|---|---|
| Distill: *"what's firmed up across this thread: you're building a protocol for legibility"* | no `current` prop → emitted as `offering`, `open` standing, member may adopt/revise/reject. **Failure does not occur.** D-4 has separately removed the prior-reflection channel that fed it. |
| Connect: *"you're building a shared protocol"* | same → `offering` |
| Challenge: *"you've built a protocol for legibility"* | same → `offering`. The frame is no longer available to pressure-test as the member's. |
| ordinary: *"You've already identified…"* / *"You've moved…"* | same → `offering` |
| **NEGATIVE CONTROL — `pace → speed → CEO speed → move fast`** | **not caught, correctly.** No step attributes a position to the member; the subject throughout is Larry. **§7.1 remains genuinely separate and genuinely unresolved.** |

**Discrimination is exact:** every witnessed attribution failure is converted; the drift
chain is untouched. A topology that caught the drift chain would be over-claiming, and this
one does not.

---

## 5. Verdict

> ## PARTIALLY ENFORCEABLE, requiring a member confirmation boundary
>
> **The boundary already exists in the ratified contract: §1.7 nomination.** Unsupported
> attribution is not blocked — it is **converted into an `open` offering** the member may
> adopt, revise, or reject.

**Why not ENFORCEABLE.** The referenced half is fully structural. The unreferenced half
depends on a **syntactic gate over MAIA's own output whose recall is empirical, not proven**.
Until measured, "no unsupported attribution reaches persistence" is a claim about a
detector, not a property of the schema.

**Why not NOT ENFORCEABLE.** The ratified architecture does **not** need reconsidering. The
mechanism that closes the hole is already in it; this investigation found a **routing**
answer, not a missing component.

### Proof obligations — what implementation must discharge

| # | Obligation | Kind |
|---|---|---|
| **P1** | Segment typing enforced at the API boundary (structured output), never by prose convention | structural |
| **P2** | `attribution` segments: `proposition_id` must resolve to `current`, scoped to member **and** idea, checked at the **persistence boundary** | structural — fully checkable |
| **P3** | Non-`attribution` segments validated for absence of second-person ascriptive constructions | **empirical — recall must be measured, not assumed** |
| **P4** | On detection: regenerate or downgrade to `offering`; bounded retry; then fail the attempt (§6.1) | structural |
| **P5** | Gate tuned to over-block: false positive = one retry; false negative = Finding D recurrence | policy |
| **P6** | P3's measured recall is **published with the green verdict**. Cuts 0–2 cannot be called green on an unmeasured detector. | evidentiary |

### Consequences for the ratified contract

- **§5.3(4) stands** — amended in reading from *"fails before persistence"* to **"cannot be
  emitted as an assertion; is converted to an `offering`."** Docs amendment, when authorized.
- **Finding D's attribution half** moves from *unresolved* to *conditionally resolved,
  pending P3*.
- **Finding D's declarative half** (§1.4 boundary case) remains **unresolved and out of scope
  here**.
- **§7.1 semantic drift** remains untouched and separate — confirmed by the negative control.

**Next**: INV-2, the unexplained 500. INV-1 stays closed until this verdict is ratified.
