# JARVIS Unit 19 — Native Governance Gate Emission

**Classification: A — NATIVE GOVERNANCE GATE COMPLETE**
**Work unit:** `jarvis-unit-19-native-governance-gate`
**Base:** `b8808124e` (Unit 18 — Alpha proving walk, Classification C)
**Date:** 2026-08-10

This record stands without conversation context.

---

## 1. Why this unit exists

Unit 18 exercised Units 11–17 as one chain and earned **C** on a single seam:

> a worker executing a bounded objective can encounter a legitimate authority
> limit, but cannot itself emit a structured governance gate that causes the
> control plane to pause and request the missing authority.

In Unit 18 the "ask" was manufactured by the proving harness. That is not
governed agency. Unit 18 did not fail — it **located the missing organ**.

This unit builds that organ. Whether the organism can use it is Unit 18's job to
re-prove, not this unit's to claim.

---

## 2. The load-bearing distinction

> **A WORKER GATE IS A CLAIM, NOT AN AUTHORITY.**

The worker may **identify** the missing authority. It may not **supply** it.
Unit 11 already held that "worker self-report is never authoritative" for
evidence; the same rule now governs authority boundaries.

Every emitted gate is validated against the run **record** before it becomes
governance state. An invalid gate is a **result-contract failure**
(`GOVERNANCE_GATE_INVALID`), never an indefinite pause — a worker must not be
able to suspend its own run by emitting nonsense.

---

## 3. Files

| Path | Role |
|---|---|
| `scripts/builder/jarvis-governance-gate.mjs` | **New.** Gate classes, validation, resolution, public projection |
| `scripts/builder/jarvis-runtime-pipeline.mjs` | `PAUSED_FOR_GOVERNANCE` state + transitions; gate detection at `VALIDATING_RESULT` |
| `scripts/builder/jarvis-runtime.mjs` | `POST /runs/:id/resolve-gate`; gate published on `publicRun` |
| `scripts/builder/__tests__/jarvis-governance-gate-proof.mjs` | **New.** 31 cases |
| `package.json` | `jarvis:governance:proof` |

---

## 4. The gate object (§2)

`gate_id` · `run_id` · `request_id` · `work_unit_id` · `objective` ·
`objective_digest` · `gate_class` · `reason` · `authority_required` ·
`scope_requested` · `current_authority` · `evidence` ·
`required_resolver_role` · `executable_after_resolution` · `emitted_by` ·
`status` · `created_at` · resolution fields.

Only recognised shape survives from the worker's claim; everything else is
dropped rather than carried forward.

### Fields a worker may never put in a gate

`delegation_id` · `delegation` · `granted` · `authority_granted` ·
`principal_type` · `instruction_id` · `channel_id` · `resolution_id` ·
`approved` · `authorized` → `GATE_SELF_GRANT`.

---

## 5. Gate classes (§3) — closed taxonomy

| Class | Resolver | Can become runnable here |
|---|---|---|
| `FOUNDER_DECISION_REQUIRED` | FOUNDER | yes |
| `CONSTITUTIONAL_AMBIGUITY` | FOUNDER | yes |
| `OPERATOR_AUTHORIZATION_REQUIRED` | OPERATOR | yes |
| `SCOPE_EXPANSION_REQUIRED` | OPERATOR | yes |
| `WRITE_AUTHORITY_REQUIRED` | OPERATOR | **no** |
| `PRODUCTION_AUTHORIZATION_REQUIRED` | FOUNDER | **no** |

The distinctions exist because they change **who may resolve**. There is
deliberately no `NEEDS_MORE_AUTHORITY`; a generic class would erase exactly that.

`WRITE` and `PRODUCTION` are representable so a worker can name its boundary
honestly, but **approving them still does not make them runnable** — Unit 14's
ceilings and Unit 15's lanes refuse independently. Proved: approving a
`WRITE_AUTHORITY_REQUIRED` gate yields `permits_resumption: false`.

---

## 6. Capacity is not a governance gate (§15)

`CAPACITY`, `CAPACITY_BLOCKED`, `RATE_LIMIT`, `TIMEOUT`, `LOW_CONFIDENCE`,
`NEEDS_MORE_COMPUTE`, `NEEDS_MORE_TOKENS`, `CLARIFICATION` are refused as
`GATE_NOT_GOVERNANCE` — both as a class and as prose in the reason (normalised,
so `rate limit` and `RATE_LIMIT` are both caught).

That prose scan is a **fail-closed** heuristic layered on the structural class
check. It can only ever refuse more; it never authorises. Unit 18's back-pressure
finding stays a scheduler concern and is not repaired here.

---

## 7. The run state (§6)

`PAUSED_FOR_GOVERNANCE` — **non-terminal, and deliberately so.**

```
VALIDATING_RESULT → PAUSED_FOR_GOVERNANCE     (valid gate accepted)
PAUSED_FOR_GOVERNANCE → QUEUED                (authenticated APPROVE — same run)
PAUSED_FOR_GOVERNANCE → ESCALATION_REQUIRED   (authenticated REFUSE)
PAUSED_FOR_GOVERNANCE → FAILED | CANCELLED
```

It is reachable **only** from `VALIDATING_RESULT`, and it **cannot** become
`VERIFIED`. It is distinct from:

- `FAILED` — nothing malfunctioned;
- `VERIFIED` — nothing was concluded;
- `QUEUED` / `CAPACITY_BLOCKED` — no amount of capacity will start it. Its
  `blocked.reason` is `AUTHORITY_REQUIRED`, never `WORKER_CAPACITY_UNAVAILABLE`.

A paused run has `disposition: null`, `failure_class: null`, `finished_at: null`.

### This is the first state-machine change since Unit 11

Units 17 and 18 deliberately refused to add one. Here it was mandated and is
justified: §11 requires the **same** run to resume, and no existing state can
represent "intentionally incomplete, objective still open, authority missing"
without lying about one of those three.

---

## 8. Resolution, and what it does not do (§9, §10, §13)

`POST /runs/:id/resolve-gate` with `instruction_id` (Unit 16) +
`resolution_type` (`APPROVE` | `REFUSE`) + optional `scope_grant`.

Authority comes wholly from Unit 16 — no second authority system. The
authenticated role must match `required_resolver_role`; a founder cannot close
an operator gate and vice versa. Untyped prose is refused
(`RESOLUTION_TYPE_REQUIRED`).

**APPROVE** confers only the delta the gate asked for, then re-queues the same
run. **REFUSE** confers nothing (`authority_delta: null`) and closes the run as
`ESCALATION_REQUIRED / GOVERNANCE_REFUSED` — truthfully unresolved, not verified,
not retried, not re-asked of a different authority class.

A resolution may not restate the objective or retarget the work unit
(`GATE_WIDENS_OBJECTIVE`), so §12 holds by construction: *"inspect X + WRITE
approved"* can never become *"modify X, Y, Z and deploy."*

---

## 9. Same-run resumption (§11)

Proved end to end over a real socket with a two-phase objective:

| Property | Result |
|---|---|
| Run id after resume | **identical** — not a successor |
| `request_id` | preserved |
| `objective` | preserved |
| Pre-gate evidence | preserved (`pre_gate_result`) and additive after resume |
| Worker invocations | **exactly 2** — phase A, then phase B |
| Final state | `VERIFIED` with citations from both phases |
| Gate on the run | `RESOLVED` / `APPROVE` |

Between pause and resolution the worker did **not** run again.

---

## 10. Tests

```
npm run jarvis:governance:proof   →  31 passed, 0 failed
```

Regressions (§20), all unchanged:

```
jarvis-runtime-proof            15 passed · 0 failed
jarvis-desktop-proof            20 passed, 0 failed
jarvis-principal-proof          25 passed, 0 failed
jarvis-delegation-proof         45 passed, 0 failed
jarvis-authority-channel-proof  29 passed, 0 failed
jarvis-gate-resumption-proof    35 passed, 0 failed
```

**N1–N10** all covered. **M1–M10** all discriminate.

### Two real defects the suite caught during development

1. **A REFUSE resolution silently left the run paused.** `ESCALATION_REQUIRED`
   was not a legal transition from `PAUSED_FOR_GOVERNANCE`, so the transition
   threw and was swallowed. Fixed by making the transition legal — a denied gate
   must be able to close its objective.
2. **The reason-scan missed prose forms.** `rate limit` did not match
   `RATE_LIMIT`. Fixed by normalising before comparison.

Neither was found by reading the code.

---

## 11. §16 semantic-verification residue — recorded, not repaired

Unit 18 observed a run reach `VERIFIED` while only half-satisfying its objective,
because every citation it made was contained.

Unit 19 does **not** repair this, and does not need to: a governance gate is
never mistaken for successful completion, because `PAUSED_FOR_GOVERNANCE` cannot
transition to `VERIFIED` and a gate-bearing result never reaches
`VERIFYING_EVIDENCE`. The two concerns are structurally separate.

**Recorded as a NEXT UNIT candidate:** *objective-satisfaction verification* —
distinguishing "every claim is contained" from "the bounded objective was
answered". It is independent of gate correctness.

---

## 12. What is still NOT true

- **No MAIA caller, no member data, no member conversation.**
- **No expanded write authority.** `WRITE`/`PRODUCTION` gates are nameable, not
  runnable.
- **No production change**, no deploy, no migrations, no feature flags.
- **No conversational founder resolution** — resolution is a typed API call
  carrying a Unit 16 instruction id.
- **No scheduler repair.** Unit 18's capacity back-pressure is untouched.
- **Gate emission is proved hermetically, with an injected delegate.** A real
  local model has not yet emitted a gate of its own accord. That is precisely
  what the Unit 18 re-run must establish.

---

## 13. Next bounded unit

**Re-run JARVIS Unit 18 — the Alpha proving walk** against this substrate, with a
real worker and a real two-phase objective.

Unit 19 proves the organ exists. Unit 18 must prove the organism can use it.
Alpha should be declared from that re-run, not from these component tests.

Its entry conditions are unchanged and now include one more: a real worker must
be capable of emitting a well-formed gate, which requires prompting the local
model to return the `governance_gate` shape when it hits a boundary.
