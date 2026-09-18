# JARVIS-ROUTER-02 — Governed Multi-Model Orchestration — 2026-09-17

**Standing:** BOUNDED IMPLEMENTATION · OFFLINE PROOF GREEN · AUTOMATIC RUNTIME ACTIVATION NOT YET OPEN

## Purpose

ROUTER-01 determines which models may participate in a Work Unit and what standing their outputs
have. ROUTER-02 executes that participation plan without creating a second Work Unit, a second
authority system, or a model-voting mechanism.

The core sequence is:

```text
canonical Work Unit
  → ROUTER-01 participation plan
  → explicit stage + external-call budgets
  → primary attempt
  → immutable role snapshot + canonical attempt history
  → release Builder claim
  → challenger attempt with primary output labelled UNTRUSTED
  → challenge adjudication
  → READY_FOR_EXISTING_GATE or REVIEW_REQUIRED
```

`READY_FOR_EXISTING_GATE` is deliberately not `VERIFIED`.

## One Work Unit, multiple attributable attempts

All model stages keep the same `work_unit_id`.

Each delegate result now carries:

```text
attempt_role      primary | challenger
route_plan_id     stable ROUTER-01 plan identifier
peer_attempt_ref  primary result snapshot referenced by challenger
```

The existing `recordAttempt()` history is reused. ROUTER-02 does not create a parallel attempt
ledger.

Each orchestration also stores immutable role snapshots under:

```text
$AIN_DELEGATION_HOME/orchestrations/<work_unit_id>/<orchestration_id>/
  plan.json
  orchestration.json
  01-primary-<provider>.result.json
  01-primary-<provider>.log
  02-challenger-<provider>.result.json
  02-challenger-<provider>.log
  primary-output.untrusted.txt
```

These snapshots preserve attribution even though the pre-existing `result.json` path remains the
single latest-attempt compatibility surface.

## Role membrane

### Primary

The primary receives its ordinary bounded Work Unit prompt plus:

```text
ATTEMPT ROLE: PRIMARY
Your output is candidate work/evidence only.
It does not carry integration, governance, or epistemic authority.
```

### Challenger

The challenger receives the same bounded Work Unit context plus the primary model output, labelled:

```text
PRIMARY MODEL OUTPUT (UNTRUSTED):
```

The primary output is not evidence and not authority. The challenger is instructed not to vote and
not to infer that agreement proves the primary claim.

The peer-context file must:

- live under JARVIS orchestration custody;
- be a regular non-symlink file;
- be no larger than 64 KiB;
- contain only the primary model output captured by JARVIS.

The challenger must end with exactly one parseable marker:

```text
JARVIS_CHALLENGE_RESULT_JSON: {
  "status":"NO_MATERIAL_CHALLENGE|MATERIAL_CHALLENGE|UNRESOLVED",
  "summary":"<brief>",
  "findings":["<brief finding>"]
}
```

A missing, malformed, or unknown marker becomes `UNRESOLVED`.

## Verifier-only expectations

During ROUTER-02 reconciliation, a pre-existing conformance defect was found:

`ain-delegate.sh` still serialized `verification_commands` into worker-visible prompts even though
`jarvis-packet-guard.mjs` Unit 10 explicitly classifies them as verifier-only.

ROUTER-02 repairs that seam:

- `verification_commands` are no longer serialized into any worker prompt;
- the existing post-worker verification loop remains unchanged;
- a regression plants a unique verifier sentinel, proves the model invocation cannot see it, and
  proves the command still runs independently after the worker returns.

This is required for primary/challenger independence: neither model may see verifier expectations.

## Explicit execution budgets

ROUTER-02 adds two optional canonical Work Unit fields:

```json
{
  "model_stage_budget": 1,
  "external_call_budget": 0
}
```

Defaults are intentionally conservative:

- one model stage;
- zero external provider calls.

An admissible ROUTER-01 plan does not execute if it exceeds either budget.

Typed refusals:

```text
BUDGET_INVALID
STAGE_BUDGET_EXCEEDED
EXTERNAL_CALL_BUDGET_EXCEEDED
```

Malformed budget values are refused rather than coerced.

Provider authority and routing intent still remain separate from these budgets. A Work Unit needs
all applicable gates:

```text
routing intent
+ provider authority
+ safe data classification
+ model-stage budget
+ external-call budget
```

before an external orchestration may execute.

## Write authority boundary

ROUTER-01 may correctly identify Qwen as the preferred implementation model. That capability
selection does not create a write-capable adapter.

OpenCode V1 and the current direct-Tinker lanes remain read-only. Therefore ROUTER-02 refuses a
Work Unit whose canonical permission envelope contains `repo.write_scope = worktree` with:

```text
WRITE_CAPABLE_MODEL_ADAPTER_REQUIRED
```

This refusal occurs before a model stage begins.

A future write-capable model adapter requires a separate proof. ROUTER-02 does not smuggle that
authority in through model selection.

## Disagreement policy

ROUTER-02 never performs model voting.

```text
NO_MATERIAL_CHALLENGE
    → orchestration may reach READY_FOR_EXISTING_GATE

MATERIAL_CHALLENGE
UNRESOLVED
    → STOPPED / REVIEW_REQUIRED
```

If ROUTER-01 nominated a Nemotron disagreement reasoner, ROUTER-02 may record that provider as a
`tie_breaker_nominated` candidate. It does not execute the tie-breaker automatically.

Human/JARVIS review must decide whether a separately budgeted/authorized attempt is warranted.

## Existing advancement authority remains unchanged

ROUTER-02 consumes ROUTER-01's advancement contract. It does not replace it.

| Work class | Model standing | Existing next gate |
|---|---|---|
| implementation/testing/migration | `CANDIDATE_EXECUTION` | independent verification |
| architecture/security/evaluation | `ADVISORY_EVIDENCE` | epistemic guard |
| governance | `GOVERNANCE_ADVISORY_ONLY` | governance gate |

`model_output_sufficient` remains `false` in every model route.

Even unanimous model agreement does not establish:

- `OBSERVATION`;
- `PROVEN`;
- `INVARIANT`;
- integration authority;
- governance authority.

## External orchestration

ROUTER-02 reuses the direct Tinker transport and evidence membrane from PROVIDER-02.

The offline external-deep proof executes, with local stubs only:

```text
Nemotron 3.5 Lightning primary
  → Inkling-Small challenger
```

and proves:

- two external calls are required in the budget;
- both attempts remain one canonical Work Unit history;
- the challenger receives primary output only as untrusted peer context;
- `NO FILES` causes no repository-file evidence bundle to cross the provider membrane;
- the credential never appears in orchestration snapshots or provider logs.

No real Tinker request or provider spend occurs in ROUTER-02 proof.

## Runtime behavior

`scripts/builder/model-orchestrator.mjs` is **dry-run by default**:

```text
node scripts/builder/model-orchestrator.mjs <work_unit_id>
```

returns the compiled orchestration and typed blockers without invoking models.

Execution requires an explicit CLI act:

```text
node scripts/builder/model-orchestrator.mjs <work_unit_id> --execute
```

ROUTER-02 does not yet wire this executor into the Desktop/runtime submission path. Automatic
runtime admission is a separate gate.

## Proof

Current exact-tree evidence:

```text
model-orchestrator-proof                    33 passed · 0 failed
opencode-adapter-governance-proof           44 passed · 0 failed
router-model-routing-proof                  45 passed · 0 failed
work-unit-route-proof                       16 passed · 0 failed
work-unit-proof                             37 passed · 0 failed
router-alpha-proof                          12 passed · 0 failed
tinker-direct-proof                         12 passed · 0 failed
external-context-proof                       9 passed · 0 failed
delegate-workspace-convergence-proof        20 passed · 0 failed
Claude adapter governance                   30 passed · 0 failed
```

The orchestration proof includes:

- malformed budget refusal;
- write-capable adapter refusal;
- local primary/challenger sequence;
- immutable role snapshots;
- one canonical attempt history;
- route-plan identity continuity;
- untrusted peer-context labelling;
- no model voting;
- material-challenge stop;
- no automatic tie-breaker;
- external-call budget refusal;
- external Nemotron → Inkling chain with zero network;
- external evidence membrane preservation;
- secret non-leakage.

## Not done

- no live model/provider call for ROUTER-02;
- no provider spend;
- no automatic runtime invocation;
- no automatic tie-breaker execution;
- no write-capable model adapter;
- no claim promotion by model consensus;
- no merge;
- no deployment;
- no production/member/PHI access;
- no MAIA member-facing behavior change.

## Next gate

### JARVIS-ROUTER-03 — Runtime Admission

ROUTER-03 may connect the canonical runtime/Desktop submission path to ROUTER-01/02 only after it
proves:

1. the caller supplies or resolves canonical Work Unit routing metadata without free-prose model
   guessing;
2. dry-run planning remains the default for unbudgeted or externally blocked Work Units;
3. runtime admission never manufactures `network.external`, `provider.spend`, stage budget, or
   external-call budget;
4. `ROUTING_BLOCKED`, `REVIEW_REQUIRED`, and governance/epistemic gates remain visible states rather
   than being flattened into generic model failure;
5. local-first remains the default;
6. external provider execution occurs only from explicit canonical Work Unit intent + authority;
7. successful multi-model orchestration returns to the existing verification/epistemic/governance
   pipeline rather than becoming a new truth authority.

Until ROUTER-03 closes, multi-model orchestration is an explicit governed CLI capability, not an
ambient autonomous behavior.
