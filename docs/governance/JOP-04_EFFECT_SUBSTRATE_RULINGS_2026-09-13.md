# JOP-04 — Effect-Bearing Capability Substrate Rulings

**Date:** 2026-09-13 · **Authority:** founder ruling · **Status:** RATIFIED
**Opened by:** `docs/governance/JOP-04_CONTINUITY_RULING_2026-09-13.md`
**Evidence:** `docs/programme/JOP-04_EFFECT_BEARING_CAPABILITY_SUBSTRATE_CENSUS_2026-09-13.md`

---

## Hard law

> **Authorization makes an act eligible for execution. It does not execute the act.**

Inherited from `executable_after_resolution: false` on `WRITE_AUTHORITY_REQUIRED` and
`PRODUCTION_AUTHORIZATION_REQUIRED` (`scripts/builder/jarvis-governance-gate.mjs:50-51`).

⛔ **No future confirmation or authorization abstraction may erase it**, by convenience, by
defaulting, or by collapsing resolution into invocation.

---

## R1 — Gate class, act, and lane remain separate vocabularies

**RULING: DO NOT UNIFY THEM INTO ONE ENUM.**

```text
ACT     what is being requested?
GATE    what unresolved authority or condition prevents it?
LANE    what execution environment / policy boundary is available?

act ≠ gate ≠ lane
```

No value in one vocabulary may be treated as an alias for a value in another. The reconciliation
JOP-04 owes is an **explicit machine-readable mapping, not vocabulary collapse.**

```text
requested act + capability effect contract + target/destination
  + execution lane + resolved authorities
        ↓
  derivePermissionEnvelope(...)
        ↓
  PERMITTED / REFUSED / GATED
```

`derivePermissionEnvelope()` (`scripts/builder/work-unit.mjs:230`) is evidence the separation has
already begun; it is to be **evolved, not replaced** by a linear authority enum.

**Consequence.** The three vocabularies stay independently meaningful, but every executable act must
pass through one authoritative reconciliation function or equivalent closed policy boundary. ⛔ No
caller may independently infer:

```text
gate resolved   → executable
lane available  → authorized
act named       → permitted
```

## R2 — Effect semantics belong to the capability contract; effective effect belongs to the invocation

**RULING: NEITHER CAPABILITY-ONLY NOR PACKET-ONLY IS SUFFICIENT.**

A capability definition MUST declare the effects it is capable of producing. ⛔ The packet MUST NOT
be trusted to declare the capability's effect. But the actual effect may depend on arguments,
destination, target state, or execution context.

```text
The registry owns the effect contract.
The invocation determines the effective effect within that contract.
```

```ts
CAPABILITIES[name] = { args, effectContract, classifyEffect, handler }
```

A packet may **request or narrow** an allowed effect. ⛔ It may never **elevate** one. A capability
registered read-only cannot become a writer because a packet labels the act writable. Conversely, a
write-capable capability invoked in a read mode does not require treating every invocation as if
the write occurred.

```text
LAW:  requested_effect ≤ capability_permitted_effect
```

Execution authority applies to the **effective invocation**, not merely the capability name.

## R3 — Effect is a vector, not a single severity enum

⛔ Do not replace the present deficiency with `READ · WRITE · DANGEROUS_WRITE · VERY_DANGEROUS_WRITE`.

The effect description must represent, **independently**:

```text
mutation · destination/custody · reversibility · idempotency
externalization · authority requirement · confirmation requirement
distribution eligibility
```

`git commit` and `send email` are both writes with radically different reversibility and custody
consequences. `upload artifact` may leave local state untouched while crossing a custody boundary —
so **`EXTERNALIZE` cannot be modeled as a stronger form of `WRITE`.**

**The specification defines the axes before defining their concrete value sets.**

## R4 — Authority resolution and execution remain separate acts

**INHERIT THE EXISTING LAW WITHOUT WEAKENING IT.** Resolving an authority gate establishes that
*execution may now be considered.* It does not mean *execute now.*

Any confirmation / authorization object MUST be:

- issued by an authority **distinct from the worker's claim**;
- bound to a **specific operation or bounded class** of operation;
- bound to its relevant **target / destination**;
- **non-self-granting**;
- **independently consumed** by an execution act.

```text
REQUEST → GATE → AUTHORITY RESOLUTION → authorization object
        → SEPARATE EXECUTION DECISION → EXECUTE

⛔ NEVER:  gate resolved → automatic execution
```

Applies especially to write and production authority.

## R5 — Receipts must distinguish intention, attempt, report, and observed effect

Four distinct states, ⛔ never collapsed into one `success` field:

```text
1. INTENDED         the system decided an operation should be attempted
2. ATTEMPTED        execution was actually invoked
3. TOOL_REPORTED    the underlying tool/process reported its result
4. OBSERVED_EFFECT  independent evidence establishes what changed in the world
```

Both of these are legitimate states:

```text
intended YES · attempted YES · tool_reported_ok YES · world_changed UNKNOWN
intended YES · attempted YES · tool_reported_ok NO  · world_changed YES     ⭐
```

⭐ The second is precisely why **tool return status cannot serve as a world-state receipt.**

Receipts remain **append-only.** Later observations may refine knowledge of an effect; they must not
rewrite what the system previously believed occurred.

## R6 — Outward custody requires its own constitutional boundary

The packet guard controls information crossing **inward**. JOP-04 MUST introduce an **independent
outward-crossing boundary.**

```text
INWARD                                OUTWARD
external information                  worker / artifact / information
        ↓                                     ↓
   PACKET GUARD                      OUTWARD CUSTODY GATE
        ↓                                     ↓
     worker                          external destination
```

Outward crossing includes, not limited to: email · upload · publish · push to external service ·
share · send message · transfer artifact · external API carrying protected content.

⭐ **True even when the operation performs no meaningful local mutation:**

> **READ-only does not imply non-externalizing.**

A capability may read local material and transmit it elsewhere while leaving the repository
completely untouched. That is an authority-bearing act.

**Distribution eligibility.** Artifacts and data intended for outward transfer MUST carry
machine-readable eligibility sufficient to distinguish at least:

```text
not eligible for distribution
eligible only to named / bounded destination
eligible for broader distribution
unknown / unresolved
```

⛔ **Absence of eligibility MUST NOT be interpreted as permission.** Exact vocabulary remains a
specification question.

---

## Build order — specification only

⛔ **Do not begin by adding write handlers.** The next act is specification:

```text
1. effect-vector contract
2. registry declaration / classification contract
3. act ⇄ gate ⇄ lane mapping, without merging
4. four-stage receipt lifecycle
5. outward-custody boundary
6. falsifiers
```

Only after those survive falsification may an existing **harmless read capability** be re-expressed
through the new contract as a proof fixture.

> **No write capability is required to prove the architecture.**

## Why now

⭐ The census discovered something nearly paradoxical: **the current system is safe partly because
it cannot express the dangerous thing yet.** All 13 capabilities are read-class, so the missing
effect vocabulary has remained latent rather than wrong.

That makes this the moment to introduce the effect system — **before** the first genuinely
effect-bearing capability exists. Doing it afterward would turn JOP-04 into remediation rather than
architecture.

## Standing

```text
R1–R6                                RATIFIED
HARD LAW                             RATIFIED
EFFECT AXIS VALUE SETS               ⛔ not ruled — specification question
NEXT ACT                             specification (six items above)
MUTATING CAPABILITY AUTHORIZED       ⛔ NONE
WRITE HANDLER                        ⛔ NOT AUTHORIZED
DISTRIBUTION OF MUTATING AUTHORITY   ⛔ BLOCKED on JOP-01 distribution closure
MAIA RUNTIME                         ⛔ UNTOUCHED
```

---

# R7–R8 — addendum

**Date:** 2026-09-13 (same day) · **Authority:** founder ruling · **Status:** RATIFIED
**Adjudicates:** `JOP-04_EFFECT_SUBSTRATE_SPECIFICATION_v0.1` §7.1 and §7.3
**Effect on v0.1:** ⚠️ **SUPERSEDED** — reissued as v0.2

## R7 — Ratify the descriptive / obligation / payload split

**RULING: RATIFIED.** The eight R3 properties do not share authority semantics and MUST NOT all be
supplied or narrowed by the requesting packet.

**A. Descriptive effect properties** — `mutation` · `custody` · `reversibility` · `idempotency` ·
`externalization`. The registry declares the permitted ceiling; the effective invocation is
**classified from trusted runtime facts**: capability identity, validated arguments, target,
destination, execution context.

⭐ **The refinement that matters.** This is **not** the law:

```text
request constraint ≤ classified effective effect ≤ capability effect contract
```

The law is:

```text
classified effective effect  ≤  capability effect contract
```

— while request constraints are **independently checked** against the classified invocation.

> **A request cannot make an operation safer merely by describing it as safer.**

A requester may constrain an operation to a narrower admissible subset where a defined partial order
exists. ⛔ A requester may never authoritatively declare the effect classification. Admitting the
request into the ordering chain lets a carefully phrased request creep back into being an effect
declaration.

**B. Derived obligations** — `authority requirement` · `confirmation requirement`. Not requestable.
Computed from the effective descriptive vector + destination/environment policy + applicable
governance. **May be strengthened by policy; ⛔ never weakened by the request.** Invalid by
construction: `confirmation_requirement: NONE` when policy derives it as required;
`authority_requirement: NONE` to defeat an otherwise applicable gate.

**C. Payload properties** — `distribution eligibility` is a property of the **material**, neither an
effect classification supplied by the capability nor an obligation chosen by the packet. Consulted
by the outward-custody boundary. ⛔ A request cannot elevate it; absence or uncertainty is not
permission.

## R8 — UNKNOWN is non-executable at runtime

**RULING: UNKNOWN MUST REFUSE OUTRIGHT BEFORE AUTHORIZATION.**

`UNKNOWN` may be modeled as top/maximal for conservative **static** reasoning, proofs, or lattice
analysis. ⛔ It MUST NOT behave as an ordinary maximal effect value **at the execution boundary**.

```text
UNKNOWN ≤ MAXIMAL_CAPABILITY_CONTRACT
```

must never become a route by which an unresolved classification executes.

> An invocation whose authority-relevant effect cannot be classified is **not a maximally dangerous
> authorized invocation**. It is an **unclassified invocation**, and execution is refused.

```text
REQUIRED           ⛔ FORBIDDEN
static:  UNKNOWN ≈ TOP          UNKNOWN → convert to MAX
runtime: UNKNOWN → REFUSE       → broad contract allows MAX → EXECUTE
```

The refusal SHOULD name classification uncertainty — `EFFECT_CLASSIFICATION_UNRESOLVED` — rather
than falsely reporting `NOT_AUTHORIZED`, ⭐ **because the system does not yet know what authority
would be sufficient.**

### Also ratified in this addendum

| Item | Ruling |
|---|---|
| **Incomparability** | RATIFIED. The system MUST NOT manufacture an ordering. Incomparability where execution requires comparison → `REFUSE`. ⛔ Categorically different from choosing whichever vector seems intuitively more dangerous. |
| **Contract violation (F14)** | RATIFIED as load-bearing. `classified ≰ contract` is a capability-contract **defect**: REFUSE, ⛔ never clamp. Clamping converts *"this capability does more than it declares"* into *"pretend it only did what it declared"* — destroying the registry contract's evidentiary purpose. |
| **Observation independence** | RATIFIED. A handler's return may establish `TOOL_REPORTED_OK`; it may **never** establish `OBSERVED_EFFECT`. ⭐ The observer need not be a different software service, but MUST be **epistemically independent of the execution claim being verified**. |
| **F12** | Remains the correct acceptance condition. ⛔ Passing F12 does **not** prove write safety — it proves the effect architecture can enter the organism **without changing the organism's behavior**. That is the correct first gate. |

## The separation this establishes

```text
CAPABILITY CONTRACT     what this instrument may do
EFFECT CLASSIFIER       what this invocation actually entails
REQUEST CONSTRAINT      what the caller is asking to permit
PAYLOAD ELIGIBILITY     what may leave custody
POLICY                  what obligations follow
AUTHORITY               whether those obligations are satisfied
EXECUTION DECISION      whether to act now
RECEIPT                 what actually happened
```

> ⭐ **It prevents language about an act from becoming authority over the act.**

---

# R9 · D1–D3 · C1 — addendum

**Date:** 2026-09-13 (same day) · **Authority:** founder · **Effect on v0.2:** ⚠️ SUPERSEDED → v0.3
⚠️ **Mixed instrument.** R9 is ratified. D1–D3 are **directions** — a stated default with
falsification owed, not yet law. C1 is an explicitly **candidate** derived law.

## R9 — Refusal categories stay semantically disjoint, and the ordering is pinned

**RULING: RATIFIED.** Refusal reasons correspond to **different propositions** and must not merge.

| Reason | Proposition |
|---|---|
| `EFFECT_CLASSIFICATION_UNRESOLVED` | epistemic failure — we do not know what kind of act this is |
| `CAPABILITY_CONTRACT_VIOLATION` | **declaration / registry failure — the platform's declared capability boundary is wrong** |
| `POLICY_REQUIREMENT_UNSATISFIED` | a policy-derived obligation is unmet |
| `NOT_AUTHORIZED` | we know what this is; granted authority is insufficient |
| `REQUEST_CONSTRAINT_VIOLATION` | the caller asked to permit something narrower than this act |
| `EXECUTION_REFUSED` | execution-specific refusal **after** admission |

⭐ **`CAPABILITY_CONTRACT_VIOLATION` is evidence that the platform's declared boundary is wrong. It
is ⛔ NOT evidence that a human declined permission.** Collapsing it into `NOT_AUTHORIZED` makes
registry defects unauditable — they would be indistinguishable from ordinary denials in the record.

`NOT_AUTHORIZED` vs `EFFECT_CLASSIFICATION_UNRESOLVED` cannot collapse **without creating false
evidence**: the first asserts the act is known and authority insufficient; the second asserts the
act is not yet known well enough to say what authority would suffice.

### The pinned ordering

```text
1. classify
2. verify capability contract
3. derive policy obligations
4. compare granted authority
5. apply caller / request narrowing
6. execute or refuse

⛔ NOT:  permission supplied → try to decide whether that seems enough
```

⭐ **Request narrowing is step 5 — after authority comparison.** This is stronger than placing it
earlier: the request cannot participate in obligation derivation or authority evaluation **even by
timing**. It is a pure final veto.

> *"That ordering may become one of the most consequential laws in the whole programme."*

## D1 — Custody domains: `MEMBER_DATA` stays outside JARVIS jurisdiction · DIRECTION

⛔ Do not create `custodyDomain = MEMBER_DATA` inside JARVIS **merely so JARVIS can say it is
forbidden.** That still makes member data part of the operator's representational universe.

```text
JARVIS custody-domain vocabulary CONTAINS NO MEMBER_DATA DOMAIN
```

A capability requiring such reach therefore fails **before ordinary effect admission**, as
**jurisdictional absence** — not as a policy flag.

> **No authority object can grant JARVIS reach into a domain JARVIS does not possess.**

This preserves the MAIA exclusion **structurally**. Falsifier owed, in the spirit of F16:
`domain = MEMBER_DATA` + `authority = MAXIMAL` ⇒ **still impossible**.

## D2 — Authorization expiry belongs to the canonical grant · DIRECTION

```text
AuthorityGrant { scope · effects · subject · issued_at · expires_at / consumption condition }
```

The invocation merely **presents or references** it. Same one-way rule:

```text
request may demand a SHORTER usable window
⛔ request cannot extend the authority's canonical lifetime
```

⚠️ **Not yet decided:** whether authority is purely time-expiring, consumable, or both — different
effect classes will probably require different lifetime semantics. Direction only:
**the request cannot manufacture persistence of authority.**

## D3 — `PARTIAL` is an outcome property, not an effect value · DIRECTION

`PARTIAL` describes **execution completeness**, not effect identity. `observed_effect: PARTIAL` does
not say what happened, and ⚠️ **launders epistemic uncertainty** — *"something happened, partly"* is
dangerously close to a disguised `UNKNOWN`.

```text
observed_effect       known effect dimensions actually witnessed   (per axis)
execution_completion  NONE | PARTIAL | COMPLETE
```

An effect dimension that cannot be established is `observed_effect.axis = UNKNOWN`, ⛔ never folded
into `PARTIAL`. **Default ruling; worth falsifying before ratifying.**

## C1 — CANDIDATE DERIVED LAW: one-way narrowing

⚠️ **NOT CONSTITUTION.** Marked because it is *"showing up too consistently to be accidental."*

```text
request constraint           may only refuse more
confirmation assertion       may only refuse more
authorization expiry override may only shorten
effect contract              may bound known classified effects · may not cure UNKNOWN
```

> **Untrusted or invocation-local inputs may narrow authority, but can never enlarge, create,
> repair, or reinterpret authority.**

Potentially governs: requested effects · confirmation · scope · duration · audience · destination ·
budget · custody boundary.

⛔ **Not elevated until the falsifiers earn it.**

## F12 fixture — sequencing constraint

⛔ **The test fixture must instantiate a ruled law, never quietly decide one.** The danger named:

```text
choose fixture → fixture implies ontology → ontology appears "proven" by test
```

Where F12 would depend on choosing between two plausible models, **run the independent falsifiers
first**, then pin the fixture.

```text
F1–F14 → evidence → resolve remaining semantic questions → pin F12 fixture → complete adversarial set
```

— conditional on F15–F18 not themselves depending on the unresolved questions.

## The pattern this establishes

> ⭐ **Each layer is losing the ability to impersonate the layer above it. Classification cannot
> pretend to be authority; authority cannot pretend to be jurisdiction; the request cannot pretend
> to be either.**
