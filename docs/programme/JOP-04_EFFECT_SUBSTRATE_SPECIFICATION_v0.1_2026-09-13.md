# JOP-04 — Effect Substrate Specification v0.1

**Date:** 2026-09-13 · **Status:** ⚠️ CANDIDATE — not ratified · **Executable code changed:** none
**Authority:** `docs/governance/JOP-04_EFFECT_SUBSTRATE_RULINGS_2026-09-13.md` (R1–R6 + hard law)
**Discharges:** the six specification items of that record's build order.

> ⛔ **SUPERSEDED 2026-09-13 by v0.2** — `JOP-04_EFFECT_SUBSTRATE_SPECIFICATION_v0.2_2026-09-13.md`.
> Rulings **R7–R8** ratified this document's §7.1 and §7.3 open questions **with one correction that
> invalidates part of §1.1/§2.1**: the request constraint is **not** in the `≤` chain, and `UNKNOWN`
> must **refuse at runtime** rather than resolve to maximal. Retained verbatim as the state of the
> design before that correction — a superseded specification is dated, not edited.

> **Authorization makes an act eligible for execution. It does not execute the act.**

⛔ No write handler is specified here. No capability gains an effect. This document defines contracts
and the falsifiers that must defeat them before anything is built.

---

## §1 — The effect-vector contract *(build-order item 1)*

Per R3, axes are defined before value sets. Value sets below are **CANDIDATE**.

### 1.1 A proposed split — ⚠️ requires ratification

R3 names eight properties. Specification finds they do not all behave alike under R2's
`requested_effect ≤ capability_permitted_effect`, and proposes two groups:

| Group | Axes | Behaviour |
|---|---|---|
| **Descriptive** — what the act *does* | mutation · custody · reversibility · idempotency · externalization | declared as a ceiling, narrowed by invocation, subject to `≤` |
| **Derived obligation** — what the act therefore *requires* | authority requirement · confirmation requirement | **computed** from the descriptive vector, ⛔ never declared or narrowed by a caller |
| **Payload property** — a fact about the material, not the act | distribution eligibility | carried by the artifact, consulted by the outward gate (§5) |

⭐ **Why this matters.** If obligations were subject to `≤`, a packet could narrow its way out of
needing authority — "I request this act with confirmation_requirement: NONE." Obligations must be
**outputs of classification, never inputs to it.**

⚠️ This split is a specification proposal. R3 is satisfied either way (all eight remain
independently representable); the split concerns only which are *requestable*.

### 1.2 Descriptive axes

```text
mutation          NONE | CREATE | MODIFY | DELETE
                  what happens to state that already exists

custody           set of domains the act touches
                  WORKTREE · REPO_LOCAL · REPO_REMOTE · PRODUCTION_DB
                  PRODUCTION_RUNTIME · THIRD_PARTY · MEMBER_DATA

reversibility     GUARANTEED | CONDITIONAL | NONE | UNKNOWN
                  can the act be taken back, and by what

idempotency       IDEMPOTENT | KEYED | NON_IDEMPOTENT | UNKNOWN
                  is a repeat safe, safe-with-a-key, or consequential

externalization   NONE | BOUNDED_INTERNAL | NAMED_EXTERNAL | BROAD_EXTERNAL
                  does information or state cross a custody boundary outward
```

### 1.3 Independence — the obligation each axis carries

An axis earns its place only if two acts can agree on every other axis and differ on it. Per R3's
own examples:

| Pair | Agree on | Differ on | Proves |
|---|---|---|---|
| `git commit` vs `send email` | mutation = CREATE | reversibility, custody | severity is not one line |
| `upload artifact` vs `git commit` | reversibility ≈ | mutation = NONE vs CREATE, externalization | ⭐ **externalization ⊥ mutation** |
| `git commit` vs `git push --force` | mutation, custody | reversibility, idempotency | reversibility ⊥ mutation |
| `git tag -f` vs `git tag` | mutation, custody, reversibility | idempotency | idempotency is its own axis |

⛔ **`EXTERNALIZE` is not a stronger `WRITE`.** Row 2 is the proof: zero mutation, full custody
crossing.

### 1.4 Ordering — a partial order, and what to do when it fails

`≤` is **componentwise and partial**, not total:

```text
mutation          totally ordered      NONE < CREATE < MODIFY < DELETE
custody           subset relation      A ≤ B  iff  A ⊆ B
reversibility     totally ordered      GUARANTEED < CONDITIONAL < NONE
idempotency       totally ordered      IDEMPOTENT < KEYED < NON_IDEMPOTENT
externalization   totally ordered      NONE < BOUNDED_INTERNAL < NAMED_EXTERNAL < BROAD_EXTERNAL

A ≤ B  iff  A.axis ≤ B.axis  for EVERY axis
```

Two fail-closed rules, both load-bearing:

```text
UNKNOWN on any axis      →  treated as the MAXIMAL value of that axis, never the minimal
INCOMPARABLE vectors     →  REFUSE — never "assume the smaller"
```

⛔ Incomparability is a real state (A more mutating, B more externalizing). It is not an error to
resolve by preference; it is a refusal.

---

## §2 — Registry declaration and classification *(item 2)*

```ts
CAPABILITIES[name] = {
  args,            // unchanged — existing validated schema
  effectContract,  // EffectVector — the CEILING this capability can ever produce
  classifyEffect,  // (validatedArgs, invocationContext) => EffectVector — the EFFECTIVE effect
  handler,         // unchanged
}
```

| Element | Owner | Law |
|---|---|---|
| `effectContract` | registry | the ceiling. ⛔ A packet may never raise it (R2) |
| `classifyEffect` | registry | determines effective effect from validated args + context |
| requested narrowing | packet | may request **at or below** the classified effect; never above |

### 2.1 `classifyEffect` obligations

- **Pure and deterministic.** No I/O, no network, no filesystem, ⛔ **no model call** — inherits the
  zero-LLM ledger (`JARVIS_ROUTE_A_LIVE_ZERO_LLM_PROOF_2026-08-11`).
- Runs **after** existing arg validation, **before** any handler dispatch.
- Must be total over the validated arg domain — no input may leave it undefined.

### 2.2 The structural check

```text
classifyEffect(args, ctx)  ≤  effectContract     must hold

violation → CAPABILITY_CONTRACT_VIOLATION
          → refuse · do not execute · do not degrade to the contract
```

⭐ A violation is a **registry defect**, not a runtime condition. Clamping the effective effect down
to the contract would hide a capability that under-declares what it does — exactly the failure the
contract exists to prevent.

### 2.3 Migration posture

All 13 existing capabilities are read-class and write-free (census §1). Each receives an explicit
read-class `effectContract` and a constant `classifyEffect`. ⛔ This is a **declaration of what is
already true**, not a behaviour change, and must be provable as such (F12).

---

## §3 — act ⇄ gate ⇄ lane mapping, without merging *(item 3)*

Per R1 the three vocabularies stay independent. Reconciliation is **three explicit tables and one
function** — no aliasing, no shared enum.

```text
T1  effect vector  →  required gate class        (obligation derivation)
T2  execution lane →  admissible effect envelope (lane ceiling)
T3  act            →  eligible capability set    (what an act may invoke)
```

```text
resolveExecutionDisposition({
  act, capability, validatedArgs, target, lane, resolvedAuthorities
}) → PERMITTED
   | REFUSED { reason }
   | GATED   { gateClass, boundTo: { operation, target } }
```

### 3.1 The closed boundary

A handler MUST be unreachable except through this function. The three R1 prohibitions become
structural, not advisory:

```text
⛔ gate resolved   → executable      no caller may infer
⛔ lane available  → authorized      no caller may infer
⛔ act named       → permitted       no caller may infer
```

### 3.2 Inherited values, unchanged

`T2` is seeded from existing law and must not weaken it: `READ_ONLY_LANES = ['local-native']`
(`jarvis-runtime-pipeline.mjs:91`) and the `WRITE_REQUESTING_KEYS` refusal remain exactly as they
are until an explicit ruling changes them.

### 3.3 Authorization objects *(R4)*

`GATED` yields an authorization object that is:

```text
issued_by          an authority distinct from the worker's claim
binds              a specific operation or bounded class
binds              the target / destination
non_self_granting  inherits SELF_GRANT_KEYS (jarvis-governance-gate.mjs:98)
consumed_by        a SEPARATE execution decision
```

⛔ Resolution never triggers execution. `executable_after_resolution: false` on
`WRITE_AUTHORITY_REQUIRED` and `PRODUCTION_AUTHORIZATION_REQUIRED` is inherited verbatim and is the
hard law's structural anchor.

---

## §4 — Four-stage receipt lifecycle *(item 4)*

Four **independent** fields. ⛔ No `success` field exists, at any layer.

```text
intended         YES | NO
attempted        YES | NO
tool_reported    OK  | FAILED | NO_REPORT
observed_effect  CONFIRMED | ABSENT | UNKNOWN | PARTIAL
```

Both R5 states are representable and neither renders as a summary verdict:

```text
intended YES · attempted YES · tool_reported OK     · observed_effect UNKNOWN
intended YES · attempted YES · tool_reported FAILED · observed_effect CONFIRMED   ⭐
```

### 4.1 Independent witness

`observed_effect` may only be set from evidence produced by an invocation **distinct from the one
that produced the effect** — the discipline already proven on 2026-08-11, where `inventory.routes`
was verified by a separate `git ls-files`, and where that separation caught a real test-design
error rather than rubber-stamping the run.

⛔ A handler's own return value may never populate `observed_effect`.

### 4.2 Append-only

Extends the existing append-only `events.jsonl` (`jarvis-runtime-store.mjs:29`). A later observation
appends a **refinement event**; it ⛔ never rewrites the earlier belief. `UNKNOWN` is a legitimate
terminal state and must not be resolved by assumption.

---

## §5 — Outward custody boundary *(item 5)*

A gate independent of the packet guard, in the opposite direction.

```text
INWARD                           OUTWARD
external information             worker / artifact / information
        ↓                                ↓
   PACKET GUARD  (exists)       OUTWARD CUSTODY GATE  (absent — to build)
        ↓                                ↓
     worker                      external destination
```

**Trigger:** `externalization ≠ NONE`, ⛔ **independent of `mutation`.**

> **READ-only does not imply non-externalizing.**

A capability may read local material and transmit it while leaving the repository untouched. Its
mutation vector is `NONE`; it is an authority-bearing act regardless.

### 5.1 Distribution eligibility

Carried by the **payload**, not the capability. Consulted by the gate:

```text
NOT_ELIGIBLE   never crosses
BOUNDED        crosses only to named destinations — the gate checks membership
BROAD          may cross
UNKNOWN        ⛔ REFUSE
```

```text
LAW:  absence of eligibility is NOT permission.
      missing field ≡ UNKNOWN ≡ refusal.
```

### 5.2 Relation to JOP-01

Distribution *of mutating authority* remains blocked on JOP-01 closure (continuity ruling). This
gate governs distribution *of content* and is a separate mechanism — ⛔ neither satisfies the other.

---

## §6 — Falsifiers *(item 6)*

Each must be demonstrated to **fail** against a naive implementation and **pass** against the
specified one. ⛔ A design that cannot be defeated by these has not been tested.

| # | Falsifier | Defeats |
|---|---|---|
| **F1** | A packet declaring `mutation: MODIFY` on a read-contract capability is REFUSED, and the refusal names the **contract**, not the packet | packet-declared effect (R2) |
| **F2** | For each axis, two acts agreeing on all others and differing on it are classified differently | axis collapse (R3) |
| **F3** | ⭐ A capability reading local files and transmitting them — `mutation: NONE` — is GATED by the outward gate | *read ⇒ safe* (R6) |
| **F4** | ⭐ A resolved `WRITE_AUTHORITY_REQUIRED` gate with no separate execution decision does **not** execute | the hard law (R4) |
| **F5** | A worker-supplied authorization object is refused | self-grant (R4) |
| **F6** | An authorization bound to target A does not authorize the identical operation on target B | scope creep (R4) |
| **F7** | `attempted YES · tool_reported FAILED · observed_effect CONFIRMED` is representable and does **not** render as failure | receipt collapse (R5) |
| **F8** | A later `observed_effect` does not mutate the earlier `tool_reported` record | append-only (R5) |
| **F9** | An artifact with no eligibility field is REFUSED outward | absence ≠ permission (R6) |
| **F10** | Three separate probes: gate-resolved alone, lane-available alone, act-named alone — none authorizes | caller inference (R1) |
| **F11** | `classifyEffect` performs 0 model calls, 0 network, 0 filesystem reads, and is deterministic across repeated invocation | zero-LLM ledger |
| **F12** | ⭐ `git.rev_parse` re-expressed through the new contract returns byte-identical results and an identical effect vector across N runs | **the architecture is proven with no write capability** |
| **F13** | Two incomparable effect vectors REFUSE rather than resolving to either | partial-order collapse (§1.4) |
| **F14** | A capability whose `classifyEffect` exceeds its `effectContract` refuses and does **not** clamp down to the contract | silent under-declaration (§2.2) |

⭐ **F12 is the acceptance condition for the whole substrate.** Per the build order: *no write
capability is required to prove the architecture.*

---

## §7 — Open questions for founder adjudication

1. **§1.1 split** — ratify descriptive / derived-obligation / payload, or keep all eight requestable?
2. **Custody domain set** — is §1.2's seven-domain list right, and is `MEMBER_DATA` a custody domain
   here at all given the MAIA exclusion boundary?
3. **`UNKNOWN` as maximal** — correct fail-closed default, or should UNKNOWN refuse outright?
4. **Authorization expiry** — do authorization objects expire by time, by run, or only by consumption?
5. **`PARTIAL` observed effect** — legitimate fourth value, or a disguised UNKNOWN?
6. **Which read capability is the F12 fixture** — `git.rev_parse` as proposed, or a broader one?

## §8 — Standing

```text
SPECIFICATION                        v0.1 CANDIDATE — ⛔ not ratified
BUILD-ORDER ITEMS 1–6                discharged as specification
FALSIFIERS                           F1–F14 specified · ⛔ none executed
EXECUTABLE CODE CHANGED              none
EFFECT AXIS VALUE SETS               CANDIDATE
MUTATING CAPABILITY AUTHORIZED       ⛔ NONE
WRITE HANDLER                        ⛔ NOT AUTHORIZED
PROOF FIXTURE (F12)                  ⛔ not built
DISTRIBUTION OF MUTATING AUTHORITY   ⛔ BLOCKED on JOP-01 distribution closure
MAIA RUNTIME                         ⛔ UNTOUCHED
NEXT ACT                             founder adjudication of §7, then falsification
```
