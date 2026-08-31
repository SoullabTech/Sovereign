# Persistence Governance: Room State vs Person State

**Date:** 2026-06-25
**Status:** Architecture / governance principle. **General to MAIA/AIN** — governs `member_spiral_state`, the memory/atoms layer, and any durable store; not Flourishing-specific. The engineering form of *"model the conditions, not the person"* (`docs/architecture/PRACTICE_SOURCE_AND_TRANSLATION_STUDIO_2026-06-25.md` §12).
**Governed by:** `docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md` — esp. *reduce the system's psychological centrality over time* and Invariant 14 (*declared significance > system-inferred*).

---

## 0. The enforcement boundary is commitment, not cognition
You cannot — and must not try to — govern inference: language understanding *is* inference, and prohibiting it cripples the system. The governable boundary is not *what the model infers* but **what the system promotes into a durable representation of reality.** That is a tractable engineering question.

## 1. Three layers — governance lives at only one
| Layer | Allowed | Persistent? | User-visible? |
|---|---|---|---|
| **Inference** | yes | no | no |
| **Response** | yes | no | yes |
| **Representation** | only if grounded | **yes** | sometimes |

Inference and Response are transient. **Representation is the only durable layer — therefore the only governance surface.** (Its "sometimes-visible" is the Representation-Discernment question: held internally, surfaced selectively.) All persistence governance localizes to one boundary: **the write into Representation.**

## 2. Reification = promotion (a state transition)
- **Permissible:** `transient inference → response shaping → discard.`
- **Governed:** `transient inference → stored as member attribute → future reasoning treats it as fact.`

**The problem is not storage; it is promotion.** Once something enters the member model, every future interaction inherits it — and that inheritance is where psychological centrality silently accumulates (§5).

## 3. The type distinction: Room State vs Person State
Cleaner than "ephemeral vs persistent." The real question is **the referent of the stored object.**

- **Room State** — *how the room should behave*: preferred pacing, rhythm, an unresolved thread, the active project, the current metaphor, her preferred language, continuity context. → accumulates **hospitality.**
- **Person State** — *who the member is*: dominant element, developmental stage, attachment pattern, emotional baseline, spiral phase, relational capacity. → accumulates a **psychological model.**

Persist Room State freely; Person State carries a high burden (§4) and is usually refused.

### 3.1 The referent is fixed at every *read*, not only the write
A field's *effective* referent is what its **readers** do with it — not just its definition. A column written as continuity can be **promoted to a person-claim at a downstream read** (e.g., a prompt-builder injecting *"this member is a Fire type"* from a field that meant "last useful register"). So the audit covers **writes and reads**: a Room-State field with even one reader that treats it as identity *is* Person State at that site.

### 3.2 Encode it, or it drifts
The referent is not stable: a Room-State field silently becomes Person State as new readers accumulate. So the distinction must be **encoded** — named / typed / annotated — and **linted**, not audited once. A one-time audit decays; a structural check (*does any reader treat a Room-State field as a member truth-claim?*) holds.

## 4. Three code-review tests (per persistent field)
1. **Could the member reasonably say *"No, that's not me"*?** If yes → it claims something about the person.
2. **If the field vanished tomorrow, would the room merely become less continuous?** If yes → it is about the room.
3. **Can the system honestly say where the value came from?** *"You selected / named this"* or *"this summarizes last session's interaction pattern"* (low burden) vs *"the model determined…"* (high burden).

**Test 3 is provenance** — already recorded in MAIA (atoms carry provenance; `facilitator_id`; the attribution guard). So provenance largely *determines* the category: **member-declared → safe to persist as her meaning; model-inferred → must not be promoted to a person-truth.** The room/person line and the declared/inferred line are the **same line.**

## 5. Psychological centrality now has a mechanism — and a control point
The Sovereignty Invariant *"reduce the system's psychological centrality over time"* has been a qualitative check. This framework gives it a **substrate**: centrality **is** the accumulated set of promoted Person-State claims. That makes it:
- **measurable** — is the Person-State store growing?
- **controllable** — govern the single promotion boundary (§1) and centrality is bounded *structurally.*

Metaphor after measurement: "centrality" is no longer a mood — it is a **count.**

## 6. The heuristic (engineering form)
> **Persist obligations for the room before attributes of the member.**

Not *"What should we remember about her?"* (accumulates psychological models) but *"What should this room remember in order to welcome her well next time?"* (accumulates hospitality). Often the same data — entirely different governance. Continuity is preserved; **what continuity is *about*** changes: not an elaborating internal model of the member, but a well-tended environment that remembers how to receive her.

## 7. Auditing `member_spiral_state` (methodology, not verdict)
Do **not** assume the table is wrong. Audit each field by **referent × read-sites × provenance**:

| Field | Likely disposition |
|---|---|
| `dominant_element` | **Reinterprets cleanly** as *"the register the conductor found most useful last session"* (Room State) — **only if** no reader asserts it as her identity (§3.1). |
| `phase`, `intensity`, `autonomy_streak`, `return_count` | Likely Room State / continuity artifacts; survive reinterpreted. |
| `motion` (ascending / **stuck** / **breakthrough**) | Borderline — *"stuck"/"breakthrough"* read as conditions of the person; survives only if used purely to shape response, never asserted. |
| `relational_phase` (orientation / capacity / **autonomy** / seasonal-return) | **Resists reinterpretation** — a *developmental stage* is hard to honestly call a room-obligation; most likely genuine Person State, and the **first to reexamine.** |

Output per field: **keep-as-is / keep-reinterpreted-and-rename / restrict-reads / retire** — plus a drift lint (§3.2) so referents can't silently migrate.

---

## 8. Refinements (2026-06-25): promotion pipeline, reader contracts, authority

### 8.1 Promotion is the governed operation
The whole problem narrows to one state transition: `transient computation → PROMOTION → persistent representation`. Before promotion = runtime cognition; after = system knowledge. **The governance surface is the promotion pipeline itself** — not the model, prompt, or database. Every promotion answers four questions:

| Question | Purpose |
|---|---|
| **Referent** | room or person? |
| **Provenance** | declared, observed, or inferred? |
| **Promotion authority** | is this (referent × provenance) allowed to persist? |
| **Reader contract** | how may downstream components interpret it? |

### 8.2 Readers are part of governance (the field contract)
A field has **no intrinsic meaning** — its operational meaning is set by *every component that reads it* (§3.1). Governance cannot stop at schema; it must govern **interpretation.** Each persistent field carries an explicit contract:

```
Field: last_effective_register
Referent: Room   Provenance: Runtime inference   Persistence: Allowed
Reader permissions:
  ✓ response planning   ✓ continuity   ✓ UI adaptation
  ✗ identity claims     ✗ developmental assessment   ✗ personality inference
```

**Enforcement (what makes it architecture, not a comment):** a documented permission *decays* (§3.2). The strong form is a **capability boundary** — expose the field only through typed accessors matching its permitted readers (`registerForResponsePlanning()`), and provide **no accessor** that hands it to an identity-claim builder. Then forbidden interpretations are **unrepresentable** (the bad reader doesn't compile), not merely reviewed. The contract is the spec; the accessor is the enforcement; a read-site lint is the fallback where capability typing isn't feasible.

### 8.3 Provenance ≠ authority (this corrects §4)
§4 said *"the room/person line is the declared/inferred line."* That collapses two **independent axes.** Authority is a function of both:

| | Room-state referent | Person-state referent |
|---|---|---|
| **Declared** | persist freely | persist **as her declaration** (attributed, held as hers — never a system truth-claim) |
| **Observed / Inferred** | persist freely (*"switched from Project A to B"* — model-derived, legitimately a room obligation) | **the governed failure mode** — requires explicit, rare authority; usually refused |

So the rule is **not** *inferred → forbidden.* It is: **model-derived *claims about the person* require explicit promotion authority.** The only routinely-persistable person-state is **member-declared**, stored as *"she named herself in a season of grief,"* not *"she is in grief"* — the autobiographical-memory principle made precise: person-facts persist only when she authored them, and are stored *as* authored.

### 8.4 Centrality is a metric, with a direction
*"Reduce psychological centrality"* (aspiration) → **count persistent person-state assertions** (engineering signal). Track at the **data level** — assertions across members × time, not just schema fields (one `relational_phase` column emits one assertion *per member*; centrality scales with members × person-fields × update-rate). The target is directional: **room-state may grow freely with use; person-state should trend toward zero.** Sustained person-state growth is the centrality alarm — a tripwire for what was previously only a judgment call.

### 8.5 The `member_spiral_state` audit is a plan, not a verdict
The matrix is the *shape* of the audit; recommendations are **hypotheses until the read-sites are examined** ("Audit" = not yet looked).

| Field | Referent (hyp.) | Provenance | Read sites | Recommendation (hyp.) |
|---|---|---|---|---|
| `dominant_element` | mixed | runtime inference | **audit** | rename → "last register" / constrain readers |
| `motion` | ambiguous | mixed | **audit** | reinterpret or narrow |
| `relational_phase` | person | model inference | **audit** | highest priority for redesign |

Running the read-site audit (grep every consumer, classify each against §8.2) is the first concrete **design → live-code** action — and is itself an act of *verify, don't assert.*

---

## 9. Scope before provenance: adapt to the encounter, don't model the person

§1–§8 govern **provenance, referent, and authority** for persisted state. ADR-003 (`docs/adr/003-relational-phase-as-behavioral-signal.md`) surfaced a **prior gate**: some person-state fails not on provenance but on **scope** — it answers a question the room should not be asking. An autonomy / maturity / dependence *score*, even honestly computed and attributed, is still wrong — it models *who the person is* rather than *what the encounter requires.*

> **The room may adapt to the encounter; it must not model the person.**

This **scope gate sits above** the referent/provenance tests: first ask whether the question is in-scope (about the encounter), *then* apply §3/§8. Everything behavior keys on should fall into **three legitimate input classes:**
1. **Encounter signals** *(preferred)* — properties of the current interaction (first session · returning after a gap · continuing a thread · an explicit in-the-moment request).
2. **Member declarations** — what the practitioner intentionally tells the room (the authorship / capture channel — `CAPTURE_BRIDGE…` ).
3. **Earned relational continuity** — recognizable, attributable facts of the working relationship (prefers voice · returns to unfinished ideas · has an active project). *Relational continuity, not developmental stages.*

**Excluded:** latent developmental / evaluative **person-models** (stages, scores) — they fail scope *even with good provenance.* (Member-declared person-state, §8.3, remains legitimate — it's authored, recognizable, revisable; the exclusion is of *inferred/latent* models.)

**Constitutional test —** *could the room explain its behavior using only things the practitioner would reasonably recognize?*
- ✓ *"We're continuing yesterday's thread."* · *"You asked me to challenge you."*
- ✗ *"I'm using relational phase 3."* · *"Your autonomy score has risen."*

**Schema heuristic (generative — apply to every new field):** *Whenever you are about to add a field that describes the **person**, ask whether it can instead describe the **encounter.*** The Studio grows more sophisticated in how it *holds an encounter* while staying restrained in what it *claims to know about the person.*

**Status:** candidate **Conditions-of-Encounter** constitutional principle (Kelly, 2026-06-26) — flagged for canon ratification by the steward, **not self-promoted to canon here.**
