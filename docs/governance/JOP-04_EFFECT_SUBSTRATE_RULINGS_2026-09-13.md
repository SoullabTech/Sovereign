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
