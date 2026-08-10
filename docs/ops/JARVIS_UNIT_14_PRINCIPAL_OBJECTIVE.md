# JARVIS Unit 14 — Principal Identity + Public Run Objective Contract

**Status:** implemented and proved. **The MAIA bridge remains unimplemented.**
**Work unit:** `jarvis-unit-14-principal-objective`
**Branch:** `chore/jarvis-unit-14-principal-objective`
**Base:** `f7c543aab` (Unit 12 — Desktop Alpha)
**Date:** 2026-08-10

Companion to `docs/ops/JARVIS_UNIT_13_MAIA_BRIDGE_CONTRACT.md` (bridge design).
This record stands without conversation context.

---

## 1. What this unit delivers

The two interface-contract gaps Unit 13 identified as bridge prerequisites:

1. **Principal identity + delegated authority** — the runtime can now represent
   *who is requesting* and *what they were authorized to request*, separately
   from what it may execute.
2. **Objective visibility** — `publicRun` now publishes the bounded objective a
   result belongs to, so a caller can attribute evidence to a request without
   private bookkeeping.

It connects nothing to MAIA, grants no write authority, touches no production,
exposes no member content, and adds no member data retrieval.

### The problem being fixed

Units 11–12 trusted **possession of the loopback socket**: reach
`127.0.0.1:8787` and you are, in effect, the operator. `checkAuthority()`
inspected the packet's *self-declared* lane; nothing asked who was asking.

That is sound while the only client is a desktop app on the operator's own
machine. It fails the moment a multi-tenant server is a client, because every
member conversation would inherit operator authority by transitivity.

---

## 2. The three things that were collapsed into one

```
PRINCIPAL            who is requesting
DELEGATION           what that principal is authorized to request
EXECUTION AUTHORITY  what the runtime may do once admitted
```

Ordered, never short-circuited:

**principal → delegated authority → admission decision → execution authority**

Never: *client can reach runtime → therefore authorized.*

---

## 3. Files

| Path | Role |
|---|---|
| `scripts/builder/jarvis-principal.mjs` | **New.** Principal vocabulary, ceilings, delegation contract, admission, public projection, objective view |
| `scripts/builder/jarvis-runtime.mjs` | Admission wired into `POST /runs`; `publicRun` extended |
| `scripts/builder/__tests__/jarvis-principal-proof.mjs` | **New.** 25 cases — P1–P7, T1–T6, I1–I6, M1–M6 |
| `package.json` | `jarvis:principal:proof` |

---

## 4. Principal model

**Types:** `OPERATOR`, `MEMBER`, `PRACTITIONER`, `MAIA`, `SYSTEM_AUTOMATION`,
`UNKNOWN`. Deliberately small — roles not needed yet are not modelled yet.

**Operation classes** (Unit 13 taxonomy): `R1A_SYSTEM_READ`, `R1B_MEMBER_READ`,
`R2_COMPUTE`, `R3_PROPOSAL`, `R4_WRITE`, `R5_PRODUCTION`, `R6_GOVERNANCE`.

### The anti-transitivity ceiling — the load-bearing table

`PRINCIPAL_CEILINGS` is the **most** a principal type may *ever* be delegated,
checked against the **principal type**, never against the delegation document.
A forged or over-broad delegation therefore cannot lift a principal above its
ceiling.

| Principal | Ceiling |
|---|---|
| `OPERATOR` | R1A, R2, R3, R4 |
| `MAIA` | R1A, R2 |
| `MEMBER` | R1A, R2 |
| `PRACTITIONER` | R1A, R2 |
| `SYSTEM_AUTOMATION` | R1A |
| `UNKNOWN` | *(none)* |

The operator ceiling deliberately includes classes the runtime **cannot
execute** (R3/R4). That is what makes the distinction meaningful and testable:

- **MAIA** asking for `R4_WRITE` → `REFUSE_SCOPE` — *"not delegable to principal
  type MAIA"*. Refused on **authority**.
- **OPERATOR** asking for `R4_WRITE` → `REFUSE_UNSUPPORTED_OPERATION` — the
  authority is plausible, the capability is absent. Refused on **capability**.

Same practical outcome today, different reason — and the reason is the security
property. Proved by P3 and I4.

### Admission dispositions

`ACCEPT` · `PRINCIPAL_REQUIRED` · `AUTHORITY_NOT_ESTABLISHED` ·
`DELEGATION_EXPIRED` · `REFUSE_SCOPE` · `REFUSE_UNSUPPORTED_OPERATION`

Typed refusals, never a generic execution failure. `403` for authority,
`422` for capability, `400` for malformed.

### `UNKNOWN` fails closed

`UNKNOWN` is a real, terminal value that refuses. It never falls back to
operator. Identity without a delegation authorizes nothing — *"identity alone
authorizes nothing"*.

---

## 5. Delegation contract

Carried at admission, **not** in the worker packet:

`principal_id` · `principal_type` · `subject_scope` · `authority_source` ·
`operation_class` · `allowed_targets` · `prohibited_operations` · `purpose` ·
`expires_at`

Checks, in order: principal resolvable → delegation present → `authority_source`
present → not expired → operation class known → **granted by the delegation** →
not on the explicit prohibition list → **within the principal-type ceiling** →
subject scope consistent → executable by this runtime → bounded objective present.

An explicit `prohibited_operations` list is honoured **before** any positive
grant, so a negative is never overridden by a broader positive.

---

## 6. Authority stays out of worker content (§4 of the mandate)

Identity and consent metadata are **never** serialized into the LLM packet.

The flow is: **request admission record → authority validation → approved
execution envelope → bounded worker packet.** The worker receives only what
execution requires; the runtime and audit layer retain the authority provenance.

This matters concretely: the packet guard partitions fields into
`WORKER_VISIBLE_FIELDS` and `VERIFIER_ONLY_FIELDS`, and worker-visible fields are
serialized into the model prompt. A delegation carrying `subject_scope` on that
side would send member identity to the local model. Keeping the grant in the
admission record avoids that class of mistake entirely.

---

## 7. Operator compatibility (§5)

A **bare packet** — how the Unit 12 Desktop and every existing operator tool
submits — is still accepted and mapped to `principal_type = OPERATOR`,
`authority_class = LOCAL_OPERATOR`, `legacy_operator = true`.

This is a narrow compatibility mapping, not a permissive default: it applies only
when **no principal is declared at all**.

`JARVIS_REQUIRE_PRINCIPAL=1` closes it — bare packets are then refused with
`PRINCIPAL_REQUIRED`. Off by default; this is the switch a future bridge
deployment turns on. Proved by P1 and P2.

---

## 8. `publicRun` — what was added

| Field | Meaning |
|---|---|
| `request_id` | Correlation id, issued at admission or accepted from upstream |
| `objective` | Bounded, non-sensitive summary — *what was JARVIS asked to do?* |
| `objective_status` | `admitted` · `legacy_packet` · `unavailable` |
| `operation_class` | e.g. `R1A_SYSTEM_READ` |
| `principal_type` | e.g. `OPERATOR`, `MAIA` |
| `authority_class` | `LOCAL_OPERATOR` or `DELEGATED` |
| `member_scope_present` | **boolean** — never a member id |
| `purpose` | Bounded purpose from the delegation |
| `execution_sha` | Execution head, or the packet's canonical SHA |

`POST /runs` now also returns `request_id`, `objective` and `operation_class` on
its `202`, so correlation starts at acceptance.

### Deliberately **not** published

`authority_source` (can name a credential) · `principal_id` · raw
`subject_scope` · the packet body · established facts · secrets.

Whether a run was member-scoped is operationally meaningful; **which member is
not the runtime's to publish.** Proved by T4 and I3, including against a
`Bearer sk-live-…` authority source and a `member-A` scope.

---

## 9. Objective honesty (§9, §11) — three states, no fabrication

| Status | Meaning |
|---|---|
| `admitted` | Recorded at admission (Unit 14 onward) |
| `legacy_packet` | Read verbatim from the stored packet of a pre-Unit-14 run, and *marked as such* |
| `unavailable` | Genuinely absent — said plainly, `objective: null` |

The objective is **never** inferred from result prose. A run whose result says
*"traced the provider path"* still reports `unavailable`. Bounded to 240
characters with visible truncation; control characters stripped so the value is
safe to render anywhere. An objective is **mandatory at admission** — a result
that could not be truthfully attributed is refused rather than accepted.

Fields are always present even when values are absent, so a caller never has to
distinguish *"field missing"* from *"value absent"*. Proved by T5 and I6.

---

## 10. Ordering correction found during implementation

Admission was initially placed **before** packet schema validation, which turned
a malformed packet into a `403` authority refusal. That is a lie: well-formedness
is prior to authority, and answering `403` tells a caller their authority was the
problem when it was not.

Corrected order: **schema (400) → admission (403/422) → packet lane authority
(403)**. Caught by the Unit 11 regression suite (case 3), which is why that suite
is run unchanged.

---

## 11. CAPACITY_BLOCKED — resolved, and a Unit 13 correction

**Not implemented, and not needed as a new lifecycle state.**

Unit 13 recorded that "CAPACITY_BLOCKED does not exist as a runtime state." The
*state* does not exist, but **the fact is already represented and already
published**:

- `jarvis-runtime-pipeline.mjs:303` sets
  `blocked = { reason: 'WORKER_CAPACITY_UNAVAILABLE', ...capacity(), at }`
  when it returns a run to `QUEUED`;
- `publicRun` has published `blocked` since Unit 11.

So `state = QUEUED` **plus** `blocked.reason` already distinguishes "waiting for
capacity" from "about to dispatch", truthfully. Adding a lifecycle state would
duplicate an existing signal.

**What was actually missing is client rendering.** The Unit 12 Desktop never
displayed `blocked`, which is why the 423/529 re-queue cycles looked like silence.
That is a Desktop gap, not a runtime gap — recorded for a future client unit.

---

## 12. Audit record (§13)

Every admitted request reconstructs: `request_id` · `principal_type` ·
`principal_id` · `authority_source` · `subject_scope` · `operation_class` ·
`objective` · `purpose` · `expires_at` · `admitted_at` · `legacy_operator`,
persisted on the run record alongside execution state, result and evidence.

No member conversational content is persisted for audit purposes.

---

## 13. Tests

```
npm run jarvis:principal:proof   →  25 passed, 0 failed
node scripts/builder/__tests__/jarvis-runtime-proof.mjs   →  15 passed · 0 failed   (Unit 11 regression)
node scripts/builder/__tests__/jarvis-desktop-proof.mjs   →  20 passed, 0 failed    (Unit 12 regression)
```

Hermetic: `AIN_DELEGATION_HOME` is redirected to a temp dir before the runtime
modules load. The delegate is stalled and never invoked — every case is decided
at admission, before dispatch, which is the property under test.

| Group | Cases |
|---|---|
| **P1–P7** | operator still valid · UNKNOWN refused · MAIA cannot inherit operator authority · member scope preserved · READ never implies WRITE · expiry refused · class outside delegation refused |
| **T1–T6** | request_id · bounded objective · objective matches the admitted request · privacy · legacy honesty · no cross-run swapping |
| **I1–I6** | the same properties over a **real socket** through `publicRun` |
| **M1–M6** | mutation proofs — each weakens the logic and requires a real assertion to FAIL |

The I-group exists because the T-group proves the pure contract; `publicRun` is
where a privacy or honesty regression would actually land.

---

## 14. What is still NOT true

- **No MAIA caller exists.** No bridge endpoint, no conversational route change,
  no member context passed, no JARVIS invocation from MAIA.
- **No WRITE authority.** `R4/R5/R6` are refused for every principal.
- **No member data retrieval.** `R1B_MEMBER_READ` is above the ceiling for every
  principal in this unit; member scope is *representable*, not *readable*.
- **No production change**, no deploy, no migrations, no feature flags.
- **Delegation is validated, not authenticated.** The runtime checks a
  delegation's *shape, scope, ceiling and expiry* — it does not yet verify a
  signature or consult an issuing authority. On loopback with an operator-only
  client that is sound; **issuing and verifying delegations is the next contract**
  before any real MAIA caller.

---

## 15. Next bounded unit

**Delegation issuance + verification** — how a delegation is minted, by whom,
and how the runtime verifies it was not self-asserted. Unit 14 gives the runtime
somewhere truthful to *put* a principal; it does not yet prove the principal is
who the envelope claims. That is the last authority gap before a shadow bridge.
