# JOP-04 · RB-6B — Host Decision Mechanism Design

**Authorized:** 2026-09-14 · **Mode:** ⛔ **DESIGN ONLY — NO CODE, NO INTERFACE CHANGED**
**Witnessed defect:** `JOP-04_RB-6A_HOST_BOUNDARY_CLOSURE_2026-09-13.md` (real IPC, `3f25932b`)

⛔ No `main.js` change · no execution-authority type built · no receipts · no effects ·
no idempotency · no write capability.

> **The question is not "how do we create a permit?" It is: what makes it truthful for the host to
> say *execute this exact act now*?**

---

## 0 · Ratified before this design: the receipt finding is PATH-SPECIFIC

```text
WORK-UNIT LANE        runWorkUnit → appendEvent / run store   RECEIPT: PARTIAL
DIRECT CAPABILITY     jarvis:submit-task → runCapability      RECEIPT: ABSENT
```

⛔ *"RECEIPT = PARTIAL"* is **no longer valid as a statement about the execution substrate as a
whole.** The witness established something stronger: **a capability can execute successfully through
the production `jarvis:submit-task` path without creating either a delegation event or a run
record.**

⛔ **Do not opportunistically add logging while repairing authority.** An authorization repair and an
auditability repair must remain separately attributable — the same discipline that kept RB-6A and
RB-6B apart, and that the two-component finding proved was load-bearing.

## 1 · The design target

```text
WITNESSED                          TARGET
valid route                        valid route
    ↓                                  ↓
C0                                 C0
    ↓                                  ↓
no independent host decision       HOST DECISION BOUNDARY
    ↓                                  ├── absent      → REFUSE
EXECUTES                               ├── counterfeit → REFUSE
                                       └── legitimate  → EXECUTE
```

**Decisive invariant (CAL-3d):**

> **The host must be capable of withholding execution while preserving exactly the same legitimate
> route.**

## 2 · Census of the five existing host-controlled facts

| Fact | IDENTITY | SCOPE | ORIGIN | LIFETIME | TRANSFERABLE | ROUTE-INDEP? | INVOCATION-SPECIFIC? | SELF-GRANTABLE? | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| `currentRoot()` | a repository root | execution `cwd` | host (binding act) | per binding / process | yes — every invocation reuses it | ✅ yes | ❌ **no** | no | ⛔ **scope, not decision** |
| `AUTHORIZED_LANE` (`'local-native'`) | an execution class | which lane may run | host constant | compile-time | yes — a constant | ✅ yes | ❌ **no** | no | ⛔ **environment/policy fact, not act-now** |
| `newRunId()` | one run | nothing | host (`randomBytes`) | per run | no | ✅ yes | ✅ **yes** | ⚠️ mintable at will | ⛔ **identity, not authority** |
| Owned session ledger (`session.mjs`) | `owner()` = `user@host`; unit, branch, worktree, `--read-only` | a work unit's ownership | host — **an explicit `open` act**, with `opened_at` / `last_heartbeat` | session (leased, heartbeat-derived) | within the session | ✅ yes | ❌ no | ⚠️ the opener opens it | ⚠️ **closest to an act — but session-scoped** |
| `derivePermissionEnvelope(workUnit)` | a work unit's permissions | act classes (`repo_read`, `deploy`, …) | derived from a **stored** work unit | as long as the unit exists | yes — re-derivable | ✅ yes | ❌ **no** | no | 🔴 **standing eligibility — risks `authorized ⇒ executable`** |

### ⭐⭐ The census conclusion

> **Not one of the five can independently answer *"execute this invocation now?"*.**

**And the reason is structural, not incidental:**

```text
ALL FIVE ARE STATES.          An execution decision is an ACT.
```

The substrate has **scope**, **environment**, **identity**, **ownership** and **derived
permission** — every one of them a standing fact that is equally true a second before and a second
after any particular invocation.

> ⭐ **You cannot derive "execute this now" from any amount of standing state. A truthful execution
> decision must be grounded in something that HAPPENED, not something that IS.**

**What the census does yield:** two *ingredients*, neither sufficient.

- **`newRunId()`** — host-minted **invocation identity**. The thing a decision could be *bound to*.
- **The session ledger** — the only primitive in the substrate anchored to an **explicit act**
  (*"Only sessions that explicitly `open` here are Builder-governed. Existence of a process is not
  semantic activity."*) ⭐ That sentence is already the right instinct, one layer up.

⚠️ **`derivePermissionEnvelope` is the trap.** It is the most permit-shaped thing available and the
most dangerous: standing, re-derivable, per-work-unit. Reaching for it would produce
`authorized ⇒ executable` with an object in between.

## 3 · Two objects — conceptually distinct even if representation later collapses

```text
route valid
    ↓
required authority satisfied          ← RESOLVED AUTHORITY  (eligibility)
    ↓
⛔ STILL NOT EXECUTABLE
    ↓
host constitutes per-invocation
execution decision                    ← EXECUTION DECISION  (act now)
    ↓
runCapability
```

**Inherited law, unchanged:** *resolving authority does not execute.*

⛔ **The next accidental equivalence this prevents:** `authorized ⇔ executed`. Every prior collapse
in this lane had exactly this shape — `registered ⇔ routable`, then `routable ⇔ executable`. **This
is the third, and it is predictable, so it is refused in advance.**

## 4 · Invocation binding — where `objectiveDigest` stops being enough

`objectiveDigest = sha256(objective_text)`. It authorizes *"something related to this objective."*
**A host decision must bind THIS invocation.**

**Fields whose substitution must invalidate the decision:**

```text
capability identity
arguments
bound repository / scope
route / execution environment        where relevant
subject / actor identity             where relevant
invocation identity
```

### ⛔ PREREQUISITE, surfaced rather than hidden inside a hash

> **A permit cannot be securely bound until the invocation representation is stable enough that
> equivalent spellings and materially different acts are distinguished correctly.**

⭐ **This is not hypothetical here — C2 §4 already measured it:** containment is verified against the
*resolved* path form while the handler receives the *unresolved* one, so `./foo/../bar` and `bar`
reach execution as two different strings denoting one object. **A digest taken today would bind the
spelling, not the act.**

⚠️ **Therefore RB-6B may require a small prerequisite design — canonical invocation binding —
BEFORE implementation.** ⛔ Named as a gate, not folded into the permit's hash where it would look
solved. This is C2-Q12 arriving as a dependency rather than as a deferral.

## 5 · Route-independence proof obligation

```text
same valid route · same capability · same request
  host decision WITHHELD                  → no execution
  host decision INDEPENDENTLY constituted → execution
```

⛔ **Host origin is necessary and not sufficient.** The counterfeit:

```ts
if (validRoute) { hostDecision = mint(); }   // clean provenance, worthless architecture
```

**The requirement is a REACHABLE withheld state.** If the decision's truth is a function of the
route, the withheld arm cannot exist — and **CAL-3d stays RED however impressive the object looks.**

## 6 · Caller-counterfeit model

Once a real host-side shape is proposed, the judge must attempt the **closest caller-controlled
imitation of that shape** — not arbitrary fields.

⛔ Forbidden as a specimen: spraying `approved: true` / `authorized: true`.
⭐ **This becomes the first concrete specimen for RB-F5**, abstract since the freeze.

**Frozen host-origin disqualifiers (unchanged):** a field on the task · a nested object through
`jarvis:submit-task` · a branded object made in the renderer · `mintPermit(task.callerSuppliedDecision)`
— **rewrapping is not minting** · any value whose truth is a function of the route alone.

## 7 · Arm semantics the design must make constructible

| Arm | Condition | Required |
|---|---|---|
| **A** withheld | same valid route · decision absent | **no execution** |
| **B** legitimate | same valid route · decision independently constituted | **execution** |
| **C** counterfeit | same valid route · caller supplies closest structural imitation | **no execution** |
| **D** auto-mint trap | same valid route · host would normally mint · mint **deliberately withheld** | ⭐ **reachable, and no execution** |

⛔ **If Arm D cannot exist, CAL-3d remains RED.** Arm D is the one that distinguishes sovereignty
from provenance theatre.

## 8 · Interfaces that would need to change — ⛔ named, not changed

| Interface | What RB-6B would require | ⛔ Not decided here |
|---|---|---|
| `main.js` C0 branch (`:769-772`) | a decision boundary between the lane test and the seam | its shape, its name, its type |
| the host | ability to constitute **and to withhold** a per-invocation decision | where the deciding fact originates |
| `runCapability(name, args, cwd)` | ⚠️ **possibly unchanged** — a boundary *above* the seam may suffice | whether the seam itself must take the decision |
| `router.mjs` | ⛔ **unchanged.** Routing is placement. | — |
| `routing-eligibility.mjs` | ⛔ **unchanged.** RB-6A is closed at the host boundary. | — |
| `CAPABILITIES` | ⛔ **unchanged.** No effect metadata. | — |

⭐ **Note the third row.** RB-6A's lesson was that the grant preceded the seam. Here the opposite may
hold: the decision boundary may live **above** `runCapability` without the seam needing a new
parameter. ⛔ Deciding that is implementation-design, not this act.

## 9 · Frozen post-RB-6B falsifier matrix

| Probe | Target |
|---|---|
| RB-F1 · RB-F2 | GREEN |
| **RB-F3** | ⭐ **GREEN** |
| **RB-F4** | 🔴 **RED — MUST STAY RED** |
| RB-F5 | GREEN once Arm C instantiates it; ⛔ non-discharging until then |
| **RB-F6** | ⭐ **GREEN** |
| RB-F7 | N/A |
| RB-F8 | GREEN |
| CAL-2a · 2b | GREEN |
| **CAL-3a** | ⭐ **GREEN** |
| **CAL-3b** | GREEN — Arm B instantiable |
| **CAL-3c** | GREEN — Arm C instantiable |
| **CAL-3d** | ⭐ **GREEN — Arm D reachable** |
| CAL-4a…4e | GREEN (unchanged — RB-6A holds) |

⛔ **RB-F4 must remain RED on a REACHED precondition.** The correct RB-6B refusal is
**`no constituted execution decision`**, never **`effect contract absent`**. ⭐ Those are
indistinguishable from outside and are entirely different repairs — one of which is blocked on an
unfiled document.

⛔ **CAL-4a…4e turning anything but GREEN means RB-6B disturbed RB-6A.**

## 10 · Unresolved prerequisites

1. ⭐ **Canonical invocation identity** (§4) — likely a small design act **before** RB-6B implementation.
2. **Where the deciding fact originates.** §2 establishes that no existing state supplies it; the
   substrate has no primitive for *an act that occurred*. This is the open question, and it is the
   whole question.
3. **Whether the decision is human-originated.** ⚠️ D1 is `ABSENT` — no confirmation-of-an-act path
   exists anywhere. If the decision requires a person, RB-6B builds that from zero, which is an
   advantage: there is no *"Are you sure?"* habit to break.

## 11 · Explicitly deferred

```text
receipts (RECEIPT: ABSENT on the executing lane — separate lane)
effect classification · idempotency repair · write authority
distribution policy · confirmation UX · RB-F4 GREEN
effect-bearing capabilities
```

A good eventual lifecycle is `INTENDED → AUTHORIZED → EXECUTION DECIDED → ATTEMPTED → TOOL REPORTED
→ OBSERVED → RECEIPTED`. ⭐ **RB-6B needs only `ROUTED → EXECUTION DECIDED` to be real and sovereign.
Everything after may remain as bad as it is and RB-6B stays properly attributable.**

---

```text
RB-6A                CLOSED AT HOST BOUNDARY
CONDITION B          🔴 ACTIVE · REAL-IPC WITNESSED
CENSUS               5/5 existing host facts INSUFFICIENT — all are states, none an act
TWO OBJECTS          resolved authority ≠ execution decision
PREREQUISITE         canonical invocation identity — SURFACED, not hidden
ARMS A/B/C/D         specified · ⛔ none constructible until a shape exists
MATRIX               FROZEN before implementation
RB-6 EMBARGO         ACTIVE · NOTHING BUILT
```

> **STOP.**
