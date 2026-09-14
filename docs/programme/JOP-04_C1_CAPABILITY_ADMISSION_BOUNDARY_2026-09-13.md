# JOP-04 · C1 — What actually constitutes the capability admission/execution boundary?

**Run:** 2026-09-13 · **Method:** read-only census at `e1c6f527` · **Evidence class:** E (code paths)
**Stop rule observed:** ⛔ no code changed, nothing built, no capability added.

---

## Verdict

```text
C1 OUTCOME    B. COMPOSITE — and the noun conflated two different objects

REGISTRY      REAL · CANONICAL · ONE OBJECT
              CAPABILITIES (scripts/builder/deterministic.mjs:6)

GATEWAY       NOT ONE OBJECT
              authority is distributed across at least five modules
              that do not meet at the execution seam
```

⛔ **Per the instrument: do not manufacture a registry to make the old language true.** The
composition is named below. *"Capability registry / gateway"* should be retired as a single term —
the **registry** exists and is excellent; the **gateway** does not exist as an object.

## 1 · The authority path, mapped to artifacts

| Arrow | Artifact | What it actually does |
|---|---|---|
| capability **declared** | `deterministic.mjs:6` `CAPABILITIES` | 14 named capabilities, each `{args schema, handler}`. ⭐ A real closed registry. |
| capability **selected** | `deterministic.mjs:208` `runCapability(name,…)` | unknown name → `throw`. Closed-set admission. |
| arguments **validated** | `deterministic.mjs:208-275` | required · type · `maxLength` · `min`/`max` · `enum`; ⭐ **unexpected argument → throw** (closed arg set); path containment resolved against `cwd`. |
| governance **admitted/refused** | `jarvis-governance-gate.mjs:115,233` `validateWorkerGate` · `resolveGovernanceGate`; `objectiveDigest` (sha256) | gate classes, refusal reasons, status; objective bound by digest |
| lane **authority** | `jarvis-runtime-pipeline.mjs:91-113` `checkAuthority(packet)` | `READ_ONLY_LANES=['local-native']`; sniffs 6 write-requesting keys → `LOCAL_WRITE_AUTHORITY_REFUSED` |
| packet **constrained** | `jarvis-runtime-pipeline.mjs:119` `validatePacket` · `jarvis-packet-guard.mjs:41,55,118` `partitionPacket` · `lintLeakage` · `bindSelector` | schema, `canonical_sha` required, branch-prefix policy; worker/verifier field partition; selectors bound to exec head |
| permission **envelope** | `work-unit.mjs:230` `derivePermissionEnvelope` | `repo_read · repo_write_scope · execute_checks · integration_actor · production_read · production_write · deploy · authority_change` |
| execution **dispatched** | `deterministic.mjs:275` `capability.handler(validatedArgs, cwd)` | `execFileSync` — argv array, no shell |
| result/receipt **persisted** | `jarvis-runtime-store.mjs:26-74` `saveRun` · `appendEvent` · `EVENTS_LOG` | append-only `events.jsonl` under `~/.claude/ain-delegation/runtime` |

`router.mjs:32` `route(task)` is **cost-class routing** (`C0 deterministic · C1 local_model ·
C3 frontier_model`), **not authority.** Recorded so it is not mistaken for a gate.

## 2 · ⭐⭐ The finding that matters before any implementation

> **`runCapability(name, args, cwd)` receives no authority.**

Not the packet. Not the permission envelope. Not the governance gate result. Not a work unit, an
actor identity, or an authorization object. **Capability admission and authority admission are two
separate systems that never meet at the execution seam.**

```text
AUTHORITY SYSTEM                     EXECUTION SYSTEM
checkAuthority(packet)               runCapability(name, args, cwd)
derivePermissionEnvelope(workUnit)        │
resolveGovernanceGate(...)                ├─ is the name known?
       │                                  ├─ do the args typecheck?
       │                                  └─ handler(validatedArgs, cwd)
       └────────── never passed ──────────✗
```

⭐ **Today this is safe, and safe by a property that JOP-04 exists to remove:** every one of the 14
registered capabilities is **read-only**, and the only permitted lane is read-only. Authority is
absent from the seam because **nothing at the seam can cause an effect.**

⛔ **The moment one effect-bearing capability enters `CAPABILITIES`, `runCapability` would execute it
with no authority in scope.** That is **defeat candidate D2 — capability authorization without object
scope — latent in the substrate**, discoverable only because the census ran before implementation.

⚠️ **This is not a defect report against existing code.** The read-only substrate is correct for
what it governs, and there is an explicit proof that discovery cannot become execution
(`__tests__/desktop-preload-allowlist.mjs:42`; `desktop-c0-explorer-proof.mjs:235` — *"jarvis:capabilities
is read-only (no runCapability, no execution)"*). **It is a statement about what JOP-04 must build:
not a bigger registry, but the seam that does not exist.**

## 3 · Defeat-candidate exposure, first pass

| | Status against current substrate |
|---|---|
| **D1** confirmation ≠ authorization | ⚠️ **UNVERIFIED** — no human-confirmation path censused yet; `resolveGovernanceGate` is machine-side |
| **D2** capability authorization without object scope | 🔴 **LATENT** — §2. Registry authorizes a *name*; nothing binds an *object* |
| **D3** claimed reversibility | **ABSENT by construction** — no reversibility concept exists; nothing to claim falsely yet |
| **D4** retry duplication | ⚠️ **UNVERIFIED** — `recordAttempt` / `max_attempts` (`work-unit.mjs:187`) exist; whether retry is idempotent at the effect level is **unasked**, and unasked is correct while all effects are reads |
| **D5** receipt without attributable identity | ⚠️ **PARTIAL** — `appendEvent` gives an append-only log; `integration_actor` exists on the work unit; ⛔ **nothing binds credentials + invocation + authorization object + remote identity together** |

## 4 · Two layers that speak different authority vocabularies

- `work-unit.mjs:90` — `DEFAULT_AUTHORIZED_ACTS = ['repo.read', 'repo.write:worktree', 'tests.run']`
  ⭐ **worktree write is already contemplated as a default authorized act.**
- `jarvis-runtime-pipeline.mjs:91` — `READ_ONLY_LANES = ['local-native']`, and any packet field
  matching `/write|worktree|bypass|acceptedits/i` is **refused**.

These operate at different layers and do not contradict each other today — the work unit describes
what a *unit* may authorize; the runtime refuses what a *local worker* may execute. ⚠️ **But they
use the same word to mean different scopes**, and JOP-04's effect vocabulary will have to reconcile
them rather than inherit both. Recorded as a question, ⛔ **not as a defect.**

## 5 · Answering the eleven, as the substrate stands

| # | | Verdict | Artifact |
|---|---|---|---|
| 1 | EFFECT | **ABSENT** | no effect concept; all 14 capabilities are reads |
| 2 | SUBJECT | **PARTIAL** | args validated + path-contained to `cwd`; no object identity |
| 3 | AUTHORITY | **PARTIAL** | `resolveGovernanceGate`, `derivePermissionEnvelope` — ⛔ not at the seam |
| 4 | SCOPE | **PARTIAL** | closed arg set, `cwd` containment, lane restriction |
| 5 | IDENTITY | **PARTIAL** | `integration_actor` on the work unit; no execution-actor identity at dispatch |
| 6 | INTENT | **PARTIAL** | `objective` + `objectiveDigest` (sha256) exist ⭐ |
| 7 | **INTENT BINDING** | **ABSENT** | digest exists; ⛔ nothing binds it to a specific effect |
| 8 | IDEMPOTENCY | **ABSENT** | no concept; `max_attempts` is a retry budget, not idempotency |
| 9 | REVERSIBILITY | **ABSENT** | no concept |
| 10 | RECEIPT | **PARTIAL** | append-only `events.jsonl`; unbound to authorization |
| 11 | DISTRIBUTION | **PRESENT (as a blocker)** | JOP-01 distribution closure owed |

⛔ **`ABSENT` here means "the substrate has no such primitive," never "it should be built."**
⭐ **`objectiveDigest` is the nearest existing thing to intent binding** and is the natural first
probe for the `BoundEvidence` transferability question.

## 6 · What C1 did not do

Read: `deterministic.mjs` (registry + `runCapability` in full), `jarvis-runtime-pipeline.mjs:91-145`,
`work-unit.mjs:90-96, 230-275`, export surfaces of `jarvis-governance-gate.mjs`,
`jarvis-packet-guard.mjs`, `jarvis-runtime-store.mjs`, `router.mjs`, and caller greps for
`runCapability` / `CAPABILITIES`.

⛔ **Not read, and therefore not claimed:** the bodies of `resolveGovernanceGate`,
`validateWorkerGate`, `session.mjs`, `epistemic-guard.mjs`, `rate.mjs`; the Desktop main-process
call site; any human-confirmation path. **D1 and D4 remain UNVERIFIED for that reason — unverified
is not absent.**

> **The conceptual model was cleaner than the system: one "gateway" turned out to be a registry with
> excellent argument discipline, and an authority system standing beside it that the execution seam
> never consults.**
