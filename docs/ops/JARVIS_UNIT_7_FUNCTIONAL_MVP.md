# JARVIS UNIT 7 — FUNCTIONAL MVP (DURABLE EXECUTION MANDATE)

> **This file is the authority for JARVIS Unit 7.**
> It is deliberately self-contained. A Builder with zero conversational context
> must be able to read this file alone and execute Unit 7 correctly.
> If a session is lost or compacted, the recovery instruction is exactly:
> *"Read `docs/ops/JARVIS_UNIT_7_FUNCTIONAL_MVP.md` and continue from the durable
> record of the current Unit 7 state."*
>
> Authored 2026-08-10 under founder ruling *"TEMPORARY SECOND BUILDER SLOT FOR
> JARVIS UNIT 7"*. Base commit `54809f994`.

---

## §0 — PURPOSE

Unit 7 creates the **first functional governed JARVIS vertical slice**.

Success is **not**:
- another architecture document
- another readiness audit
- another local-model qualification exercise
- another provider audit
- a simulated or narrated execution

Success is **ONE REAL TASK** passing end-to-end through:

```
WORK PACKET
→ BOUNDED CONTEXT SELECTION
→ LANE ELIGIBILITY
→ GENUINE maia-coder EXECUTION
→ STRUCTURED RESULT CAPTURE
→ AIN RESULT CONTRACT VALIDATION
→ INDEPENDENT EVIDENCE VERIFICATION
→ VERIFIED or ESCALATION REQUIRED
→ AUDITABLE RESULT PERSISTENCE
```

---

## §1 — GOVERNANCE GATE (run before any write)

1. Verify repository root, branch, HEAD, `git status`.
2. Inspect active Builder claims: `node scripts/builder/session.mjs status`.
3. Verify Builder WRITE capacity is available.
4. Confirm no conflicting WRITE claim owns the intended worktree.
5. Preserve **all** unrelated dirty/untracked state. Never clean, reset, or stash it.

If another genuine WRITE claim occupies capacity: **STOP**. Do not recover,
force, override, or terminate it. Do not disturb its worktree.

**Liveness lesson (recorded 2026-08-10, load-bearing):** a dead registered PID
does **not** prove a lane is abandoned. Successor/child processes can inherit the
work. Before characterizing any claim as stale, check for live processes with a
CWD inside its worktree:

```bash
/usr/sbin/lsof -a -d cwd -c node -Fn | grep <worktree-basename>
```

The canonical `recover` command requires **both** `pid gone` **and** quiet past
the 4h threshold, and refusing on quiet-time alone is correct behavior, not a bug.

Acquire the claim only when the gate passes:

```bash
bash scripts/ain-worktree-claim.sh claim jarvis-unit-7-functional-mvp <branch> <base_sha>
node scripts/builder/session.mjs open --unit jarvis-unit-7-functional-mvp \
  --branch <branch> --worktree <worktree> --model <model>
```

---

## §2 — REUSE EXISTING CONTROL PLANE FIRST

Locate and use the authoritative current versions of:

- `docs/ops/AIN_DELEGATION_CONTROL_PLANE_2026-08-09.md`
- `docs/ops/AIN_WORK_PACKET_CONTRACT.md`
- `docs/ops/AIN_RESULT_CONTRACT.md`
- `scripts/ain-worktree-claim.sh`
- `scripts/builder/session.mjs` — capacity, claims, ownership, collision
- committed Unit 5 / Unit 6 implementation governing lane dispatch, the Claude
  lane, the local/Kimi lane, worktree ownership, capacity, verification, and
  result persistence

**RULE — do not create duplicates of:** work-packet schemas · result schemas ·
capacity systems · worktree systems · dispatch systems · persistence systems.

The Builder must first identify the **smallest missing seam** preventing a real
JARVIS run, and implement only that.

---

## §3 — maia-coder ROLE (established qualification finding)

maia-coder has demonstrated useful capability for **narrow read-only
reconnaissance**: repository navigation · git inspection · file discovery ·
exact-term search · bounded evidence retrieval.

It has **not** earned autonomous authority. Known reliability evidence includes a
prior malformed/invalid tool invocation and imperfect failure reporting.

Therefore:

```
maia-coder = BOUNDED LOCAL RECONNAISSANCE WORKER
maia-coder ≠ JARVIS
```

**Local authority in Unit 7 is READ-ONLY.** maia-coder must never receive
repository WRITE authority. JARVIS must independently validate its output.

---

## §4 — WORK PACKET

Use `AIN_WORK_PACKET_CONTRACT`. A bounded packet must communicate, using existing
canonical fields wherever available:

packet identity · objective · repository/scope · authority · allowed operations ·
prohibited operations · required evidence · context requirements · completion
condition · escalation condition · stop condition.

**Malformed or materially incomplete packets fail closed.**

---

## §5 — CONTEXT ROUTER MVP

Implement the smallest **deterministic** bounded context-selection seam required.

Do **not** send the worker: the entire repository · the entire memory corpus ·
every canon document · unrelated project history · large orientation context.

Produce a **context manifest**:

```
SELECTED
  <path/resource>   reason
EXCLUDED
  <path/resource/category>   reason
```

Path/rule-based routing is sufficient for the MVP. **Do not** build vector
retrieval or generalized semantic memory in this unit.

---

## §6 — LANE ELIGIBILITY

**Local maia-coder MAY be eligible for:** repository search · file discovery ·
call-site inventory · dependency tracing · schema/test inventory · static
implementation mapping · evidence collection · bounded read-only code-path tracing.

**Local maia-coder is NOT final authority for:** constitutional decisions ·
governance rulings · security adjudication · production mutation · destructive
operations · unresolved evidence conflicts · ambiguous architectural adjudication ·
founder decisions.

Ineligible work must become **ESCALATION REQUIRED**, never forced through local
execution.

---

## §7 — GENUINE LOCAL EXECUTION

JARVIS must **actually invoke** maia-coder through the existing local execution
mechanism.

Prohibited: simulation · manually pasted worker results · a Claude-produced answer
relabeled as local · inference of execution from configuration alone.

Capture evidence establishing: selected lane · requested worker · invocation ·
backend/model identity available to the control plane · packet supplied · context
supplied · execution state · worker output · failures.

If genuine non-interactive local execution cannot be achieved, **report the
precise blocker** — that is a legitimate Unit 7 outcome (classification B).

---

## §8 — FIRST FUNCTIONAL PACKET

```
OBJECTIVE
  Trace the live MAIA text-model provider path from the sovereign MAIA route
  to its provider-selection layer and return exact file:line evidence.

AUTHORITY
  READ-ONLY

PROHIBITED
  edits · writes · installs · commits · network calls · production access ·
  service mutation

REQUIRED RESULT
  live entry point · call chain · provider-selection location ·
  exact file:line evidence · failures · unknowns

STOP after completing the bounded evidence task.
```

---

## §9 — RESULT VALIDATION

Use `AIN_RESULT_CONTRACT`. JARVIS must distinguish four separate states:

```
EXECUTION COMPLETE  ≠  RESULT CONTRACT VALID  ≠  EVIDENCE SUFFICIENT  ≠  VERIFIED
```

Validate at least: packet/result identity · completion · required evidence ·
failure disclosure · unknown disclosure · authority compliance · boundary
compliance · escalation state.

**A syntactically valid result is not automatically trusted.**

---

## §10 — INDEPENDENT EVIDENCE VERIFICATION

JARVIS must independently check enough worker evidence to decide whether the
result deserves verification. For the first packet, verify at minimum:

- cited files exist
- cited lines actually support the claims
- call-chain edges are real
- the provider-selection location is real
- no unauthorized write occurred
- material failures were disclosed

Then classify **EVIDENCE SUFFICIENT** or **EVIDENCE INSUFFICIENT**. Insufficient
evidence must produce **ESCALATION REQUIRED**.

**Never silently repair a worker result and mark it verified.**

---

## §11 — ESCALATION

Escalate when: local invocation fails · task is locally ineligible · result is
malformed · required evidence is absent · evidence contradicts claims · a material
tool failure occurs · the worker violates boundaries · an unresolved UNKNOWN
prevents completion · worker execution identity cannot be established.

Reuse the existing Claude lane if current governance supports it. Otherwise
persist **ESCALATION REQUIRED** with the exact reason and the required next
authority.

**Correct escalation counts as successful JARVIS behavior.**

---

## §12 — AUDITABILITY

Use existing result persistence. Each run must preserve enough to reconstruct:
WORK PACKET · CONTEXT · LANE DECISION · WORKER · EXECUTION · RESULT · VALIDATION ·
VERIFICATION · ESCALATION.

At minimum: packet id · timestamp · repository · HEAD · branch/worktree · context
manifest · selected lane · worker/backend · execution status · contract status ·
evidence status · verification status · escalation status · failures · result
location.

**Never persist secrets.**

---

## §13 — OPERATOR ENTRY POINT

Provide one simple repeatable operator command, preferring extension of existing
Builder OS tooling. Conceptually `scripts/jarvis run <packet>`, but follow
existing naming conventions if a canonical surface already exists.

Operator output must make clear: packet accepted · context selected · lane
selected · worker executed · result captured · contract status · evidence status ·
verification/escalation · result location.

CLI is sufficient. **No UI.**

---

## §14 — TESTS

Focused tests must cover at least:

1. valid read-only reconnaissance → local eligible
2. governance/security work → local ineligible
3. malformed packet → rejected
4. missing evidence → escalation
5. material worker failure → escalation
6. bounded context manifest
7. required audit metadata persistence
8. local worker cannot receive WRITE authority
9. fabricated/invalid `file:line` evidence cannot become VERIFIED

Use existing test conventions. Avoid unrelated large suites unless repository
policy requires them.

---

## §15 — NON-GOALS (Unit 7 must NOT)

deploy · touch production · clean unrelated dirty state · solve the dirty-checkout
problem · continue general provider auditing · repair provider-policy governance ·
repair Builder PID/liveness semantics · install plugins · restructure CLAUDE.md
context · ingest the whole memory corpus · modify MAIA member behavior · build
Postiz · create recursive agents · create autonomous planning · grant maia-coder
WRITE authority · **begin Unit 8**.

---

## §16 — COMPLETION CLASSIFICATION

**A — FUNCTIONAL JARVIS MVP.** A genuine work packet passed through bounded
context routing, **genuine maia-coder execution**, structured result capture,
contract validation, evidence verification, verified/escalated disposition, and
persisted audit record through a repeatable operator entry point.

**B — FUNCTIONAL CONTROL PLANE / LOCAL INVOCATION BLOCKED.** The governed path
exists, but genuine maia-coder invocation is blocked by one precisely identified
technical seam.

**C — PARTIAL.** One or more required JARVIS stages remain incomplete.

**D — STOPPED.** Governance/repository/capacity contradiction prevented safe
implementation.

> **A requires genuine maia-coder execution. Passing tests alone do not qualify.**

---

## §17 — COMMIT DISCIPLINE

Commit only Unit 7-owned changes. Do not sweep unrelated dirty files into the
commit. Use path-scoped staging. Verify the staged diff before committing.
Preserve unrelated dirty/untracked state exactly. Release Builder ownership only
through the canonical procedure, and only after durable Unit 7 state is recorded.

---

## §18 — FINAL REPORT CONTRACT

```
# JARVIS UNIT 7 — FUNCTIONAL MVP
## Starting state            repo / branch / starting HEAD / Builder claim / dirty-state preservation
## Existing infrastructure reused        file:line → role
## Missing functional seam discovered
## Implementation            file → purpose
## Functional path           PACKET → CONTEXT → LANE → WORKER → RESULT → VALIDATION → VERIFICATION/ESCALATION → PERSISTENCE
## First real run            packet id / objective / context selected / context excluded / lane / worker / exact invocation
                             Did maia-coder genuinely execute? YES/NO + evidence
## JARVIS judgment           execution complete / contract valid / evidence sufficient / boundary respected / verified / escalation required
## Tests                     command → result
## Audit/result artifact     path
## Git proof                 starting HEAD / ending HEAD / commit / unrelated dirty preserved / claim released
## Classification            A / B / C / D
## What JARVIS can actually do now      demonstrated capability only
## Smallest legitimate Unit 8           ONE action only
```

Then **STOP**. Do not begin Unit 8.

---

## §19 — EXECUTION STATE LOG (append-only; the durable record)

| Date | HEAD | Session | Event |
|---|---|---|---|
| 2026-08-10 | `54809f994` | `s-362ec1a9` | Mandate authored. Capacity raised 1→2 by founder ruling; deep-v1 (`s-ea973bea`) confirmed LIVE and untouched. Unit 7 claim acquired on isolated worktree `~/.claude/worktrees/ain-jarvis-unit-7-functional-mvp`, branch `jarvis/unit-7-functional-mvp`. Execution begins. |
