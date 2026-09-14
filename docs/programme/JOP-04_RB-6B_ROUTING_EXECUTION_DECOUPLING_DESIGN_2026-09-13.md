# JOP-04 · RB-6B — Routing → Execution Decoupling Design

**Authorized:** 2026-09-13 (founder act) · **Mode:** ⛔ **DESIGN ONLY — NO CODE**
**Closed subject:** RB-6A `fd543df1` · **Judge:** instrument `5c9f5094`

⛔ No `main.js` change · no execution-authority object built · no effect vocabulary ·
no `ExecutionPermit` named or typed · no write capability.

---

## 0 · What RB-6A established, stated narrowly

> **Registration no longer creates routing eligibility, and registration no longer outranks the
> router's own judgment.**

`b3d838a6` (M1-full) and `dd3d8cd7` (M1-partial) are **evidence only. Never merge.**

## 1 · The decisive law

> **A routing result may locate an invocation. It may never constitute the decision to execute it.**

### The discriminating state

```text
routable ∧ ¬executable    must be REPRESENTABLE and REACHABLE
                          through the REAL production composition
```

⭐ That is to RB-6B what `registered ∧ ¬routable` was to RB-6A — and the reachability clause is the
half RB-6A proved is load-bearing. A state constructible only inside a harness is **not** the state.

### Target architecture

```text
registered → routing judgment → ROUTABLE → separate execution decision
                                              ├── withheld/refused → NOT EXECUTED
                                              └── constituted      → EXECUTED
```

## 2 · ⛔ The anti-tautology

```ts
if (route.lane === "C0") { executionDecision = true }        // ⛔ counterfeit
const decision = makeExecutionDecision(route)                 // ⛔ same counterfeit,
                                                              //    if every valid route
                                                              //    necessarily authorizes
```

Both are `routable ⇔ executable` with an extra object in between.

**Required independence test:**

```text
same registered capability · same valid routing state
  execution authority ABSENT   → does not execute
  execution authority PRESENT  → may execute
```

⭐ **The thing that changes between those arms must be independent of routing.**

## 3 · ⭐⭐ The structural difference from RB-6A — the trap most likely to be walked into

RB-6A's routing eligibility is **unforgeable but CALLER-TRANSPORTED**: `main.js` takes
`task.routing` from the submission and re-declares it through the subject's producer. That was
**correct for placement** — a requester may legitimately say *"consider this for routing."*

⛔ **It is NOT sufficient for execution.** An execution decision transported from the requester is
**the requester authorizing themselves**. RB-6A's own `RB-F5` already frozen this in the abstract:
*no task, packet, IPC payload, or caller assertion can manufacture execution eligibility.*

> **RB-6B's independent fact must be HOST-MINTED, not caller-transported.**

⭐ **This is the single structural difference that prevents RB-6B from being "RB-6A again with a
different field name."** Reusing the routing-eligibility shape — a branded object the caller hands in
— would satisfy the *form* of the repair and none of its substance.

## 4 · The six questions

### Q1 · What exact statement consumes C0 as permission to execute?

```text
jarvis-desktop/src/main.js:769   if (decision.execution_lane === 'C0') {
jarvis-desktop/src/main.js:772     const r = runCapability(task.capability, task.args || {}, currentRoot());
```

**(line numbers at `fd543df1`)** — a lane comparison **is** the execution decision. Nothing else
stands between them.

### Q2 · What independent state will be required in addition to a valid route?

A **per-invocation execution decision** that a valid route does not produce and cannot imply.
⛔ **Not typed here.** Naming it before Q3 is answered would repeat the error RB-3's freeze prevented.

**It may not be derived solely from:** registry membership · C0 or any lane · the caller saying
`authorized: true` · a routing-eligibility assertion · `objectiveDigest` · a packet merely existing.

### Q3 · Where does that state originate, and why can neither router nor caller manufacture it?

⭐ **The shape already exists in the substrate, twice, and both are host-controlled:**

| Existing host-controlled fact | Where | Why it qualifies |
|---|---|---|
| `currentRoot()` as the execution scope | `main.js:772` | ⭐ C2 named it *"the one place authority already outranks the request"* — the caller cannot choose it |
| Lane pinned, not accepted | `main.js` → `MECH.AUTHORIZED_LANE` (`builder-mechanism.js:60`) | the Desktop **submits** `local-native`; it does not relay a caller's lane |
| Host-minted run identity | `jarvis-runtime-store.mjs:37` `newRunId()` | identity originates host-side, per run |
| Owned session ledger | `session.mjs` — sessions that explicitly `open`, with owner, worktree, `--read-only` | *"Existence of a process is not semantic activity"* — an explicit, host-recorded act |
| Resolved permission envelope | `work-unit.mjs:230` `derivePermissionEnvelope` | derived from a stored work unit, not from the request |

⛔ **None of these is yet a per-invocation execution decision**, and the census must establish which
can supply an independent fact **without importing the unfinished effect system**.

### Q4 · How is `routable ∧ ¬executable` reached through the real production path?

The natural reachable form: a submission that is **routable** (registered + satisfied routing
eligibility) for which **no execution decision has been constituted**. ⛔ Whether that is the absence
of a host-minted artifact, an explicit refusal, or a pending state is Q2's undecided question.

⭐ **Acceptance requires this arm to be reachable by an ordinary submission**, not by a harness
reaching around the IPC boundary.

### Q5 · How is `routable ∧ executable` reached for an existing harmless read capability?

`git.rev_parse`, routable exactly as today, **plus** whatever Q2 constitutes. ⛔ **No effect-bearing
capability is required to witness either arm** — the same economy that let RB-F4 be witnessed RED
without an effect vocabulary.

### Q6 · How will the real Electron IPC witness prove both arms?

See §5. Both arms must cross `ipcMain('jarvis:submit-task')`.

## 5 · ⛔ The real IPC hop becomes MANDATORY

RB-6A could be proved around routing without an Electron host. **RB-6B cannot**, because the defect
*lives* at that boundary:

```text
renderer / request  →  ipcMain('jarvis:submit-task')  →  production branch  →  execution seam
```

⛔ **Not source inspection. Not calling `route()` and `runCapability()` sequentially in the harness**
— which is exactly what the current Layer B does, and why it has always been recorded as PARTIAL and
non-discharging.

> **If the environment cannot run Electron, RB-6B remains unclosed. That is evidence gating, not a
> reason to weaken RB-F3 or RB-F6.**

⚠️ **Standing environment fact:** this session has no Electron host. The host-run witness is a
founder-run act, like the FR-V3 benchmark and the disposable-shadow verifier.

## 6 · Candidate forms — compared, not selected

| | Form | Independence | Risk |
|---|---|---|---|
| **A** | trusted execution identity + explicit host decision | strong — identity is host-established | needs an identity that survives the IPC hop |
| **B** | resolved authority → separate dispatch decision | reuses `derivePermissionEnvelope` / gate | 🔴 envelopes are **per work unit**, not per invocation — risks `authorized ⇒ executable` |
| **C** | host-minted single-invocation authority object | strongest per-invocation binding | 🔴 **most likely to become a convenient token** — selecting it for that reason is the failure |
| **D** | composition of existing primitives (§Q3) | smallest new surface | must still answer §3: host-minted, not transported |

⛔ **Do not select a form because it yields a convenient token.** The test is §1's reachability
question, not the elegance of the object.

## 7 · Predeclared intended matrix — the aim, not a freeze

| Obligation | After RB-6B |
|---|---|
| RB-F1 | GREEN |
| RB-F2 | GREEN |
| **RB-F3** | ⭐ **GREEN** |
| **RB-F4** | 🔴 **RED — MUST STAY RED** |
| RB-F5 | UNINSTANTIATED |
| **RB-F6** | ⭐ **GREEN** |
| RB-F7 | N/A |
| RB-F8 | GREEN |
| CAL-2a | GREEN |
| CAL-2b | GREEN |

⛔ **If RB-6B makes RB-F4 GREEN, the repair has crossed into the effect-contract work**, which is
blocked on independently filing or freshly ratifying the Effect Substrate law.

⭐ **The specific way that could happen, named so it can be refused:** if the execution decision
refuses on *"effect unclassified"*, the effect system has leaked in. **The decision must refuse on
absence of a constituted permit, never on absence of an effect contract.** Those look identical from
the outside and are entirely different repairs.

**RB-6B solves only:** `routing result ≠ execution authority`.
**Not:** `what effects are permitted`.

## 8 · Explicitly deferred

```text
effect classification · confirmation UX · write authority · distribution policy
idempotency repair · canonical invocation digest (C2-Q12) · RB-F4 GREEN
effect-bearing capabilities
```

⛔ **None is necessary to remove Condition B.**

## 9 · Method — the pattern that closed RB-6A

```text
1. define a state the current organism cannot express     routable ∧ ¬executable
2. build the judge that detects it                        BEFORE touching execution
3. calibrate the judge against the known-bad substrate    it must fail first
4. only then repair
5. mutate to prove the judge bites on the CLASS
```

⛔ **Step 2 comes before step 4.** The instrument amendment that teaches the judge to distinguish
`routable ∧ executable` from `routable ∧ ¬executable` is the **next act after this design**, and it
carries its own SHA.

---

```text
RB-6A               CLOSED · subject fd543df1
CONDITION A         DEFEATED
CONDITION B         ACTIVE — this design addresses it
RB-6 EMBARGO        ACTIVE
RB-F3 · RB-F6       RED on REACHED preconditions
RB-F4               RED — must remain so through RB-6B
LAYER B IPC         PARTIAL — must become REAL before any RB-6B GREEN
EFFECT LAW          UNFILED — blocks F4's repair, not this design
NO CODE · NO TYPE NAMED · NOTHING BUILT
```

> **STOP.**
