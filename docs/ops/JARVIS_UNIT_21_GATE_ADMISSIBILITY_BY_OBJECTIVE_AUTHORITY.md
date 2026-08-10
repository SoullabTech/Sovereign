# JARVIS Unit 21 — Gate Admissibility by Objective Authority

**Status:** BLOCKER RECORDED — decision instrument prepared, NOT implemented.
**Raised by:** Unit 20 (`d50f9b390`), which wired the real worker path to Unit 19's governance gate.
**Requires:** founder ruling before any implementation.

> This document records a defect and prepares a decision. It does **not** choose an
> option, and nothing here authorizes a code change. Unit 20's wiring is proven and
> committed; it is **not shippable** until this is ruled on.

---

## 1. The defect

On a **fully-granted READ-ONLY objective** — one where every artifact the worker needs
is inside its materialized grant, and the objective explicitly says *"do not modify
anything"* — the worker emits:

```
GOVERNANCE_GATE: WRITE_AUTHORITY_REQUIRED
```

The worker reads *"do not modify anything"* as **absence of write authority** rather than
as **the shape of the objective**. The wire faithfully transports the claim, the control
plane faithfully honours it, and the run pauses at `PAUSED_FOR_GOVERNANCE`.

**The happy path therefore falsely pauses.**

### Observed evidence

`scripts/builder/__tests__/jarvis-native-gate-live-proof.mjs`, live Ollama worker, no mock,
runtime self-reporting `version=d50f9b390`:

| Check | Expectation | Observed |
|---|---|---|
| A1 | authorized work reaches `VERIFIED` | ✗ `PAUSED_FOR_GOVERNANCE` |
| A2 | no gate raised when nothing is missing | ✗ gate raised |

Run A path:
`QUEUED → VALIDATING → CONTEXT_ROUTING → READY_FOR_WORKER → RUNNING → VALIDATING_RESULT → PAUSED_FOR_GOVERNANCE`

Run B (genuine authority limit, module deliberately withheld) behaves correctly:
worker emits `SCOPE_EXPANSION_REQUIRED`, `emitted_by=worker`, resolver `OPERATOR`,
gate bound to the run, pre-gate evidence preserved.

**The wire is not broken. The taxonomy has no admissibility rule.**

### What has already been tried and did NOT hold

Prompt-level narrowing in `scripts/ain-delegate.sh` (teaching the closed taxonomy, the
self-grant prohibition, and the non-governance exclusions, placed after `EXPECTED OUTPUT`).
It reduced but did not eliminate the false emission.

⛔ **Do not attempt another prompt-only narrowing.** Two passes have now failed. Prompt text
is the wrong layer for an admissibility invariant: it asks the worker to be reliable about
a property the control plane is supposed to *enforce*. A third attempt would be a repeat,
not a new experiment.

### Secondary residual (record only, not this unit's subject)

Check **C5** (`gate carries the objective it was executing`) fails on run B because the
public gate projection does not expose `objective_digest`. This is an **observability gap
in the projection**, not a governance failure — run/objective correspondence holds on the
run record; the harness simply cannot read it. Recorded here so it is not lost. It is
independent of the admissibility question and should not be bundled into the ruling.

---

## 2. Why this needs a ruling rather than a fix

The question is not *"how do we stop this string from appearing"*. It is:

> **Which gate classes are admissible under which objective authority — and when a worker
> emits an inadmissible one, what is the control plane's duty?**

That is a governance question with a constitutional edge. A gate is a **claim** by the
worker that it has hit a boundary. Unit 19's design holds that claims are passed through
verbatim and adjudicated against the run record — **never trusted at the transport**. Any
rule that discards or rewrites a worker's claim touches that principle directly:

- Rejecting a claim silences a boundary the worker believed it hit.
- Normalizing a claim edits the worker's testimony.
- Reclassifying a claim substitutes the control plane's judgment for the worker's.

All three are defensible. None is obviously correct. Hence a founder ruling.

---

## 3. The admissibility matrix (the distinction the instrument must make)

The taxonomy must be partitioned by the **authority the objective actually carries**, not
by the gate name alone.

### 3.1 Gates that may legitimately arise under a READ-ONLY objective

A read-only objective can still hit real boundaries:

- **`SCOPE_EXPANSION_REQUIRED`** — the worker needs to *read* something outside its
  materialized grant. Proven live in run B. Unambiguously admissible.
- **`CONTEXT_MATERIALIZATION_REQUIRED`** — a granted artifact was not actually delivered.
- **`AMBIGUOUS_OBJECTIVE`** — the objective cannot be executed as written.

Common property: **the boundary is about reach, not about mutation rights.**

### 3.2 Gates structurally inadmissible under a READ-ONLY objective

- **`WRITE_AUTHORITY_REQUIRED`** — ⛔ **the defect.** A read-only objective does not
  *withhold* write authority; it does not *involve* write authority. There is no write the
  worker was asked to perform, so there is no write authority it can lack. Emitting this
  is a category error, not a boundary report.

Common property: **the gate presupposes an act the objective never requested.**

### 3.3 Gates that depend on granted write authority

- **`WRITE_AUTHORITY_REQUIRED`** — admissible **only** when the objective requests a
  mutation and the grant does not carry it.
- **`DESTRUCTIVE_ACTION_REQUIRED`** — mutation whose blast radius exceeds what was granted.

Common property: **admissibility is conditional on the objective's operation class being
`WRITE` or above.**

### 3.4 Gates that depend on scope expansion rather than mutation rights

The load-bearing distinction the worker is currently collapsing:

| | reach | mutation |
|---|---|---|
| **question** | *may I look at X?* | *may I change X?* |
| **gate** | `SCOPE_EXPANSION_REQUIRED` | `WRITE_AUTHORITY_REQUIRED` |
| **valid under READ-ONLY** | ✅ yes | ⛔ no |

A worker that wants to *read* an ungranted module and emits `WRITE_AUTHORITY_REQUIRED` has
named the wrong axis. Note the observed run B gate already carries
`authority_required.operation_class: "READ"` — **the operation class is present on the
claim**, which means an admissibility rule has real data to work with and does not need to
infer intent from prose.

---

## 4. Options for the founder to rule on

Each option is stated with what it costs. **No option is recommended here.**

### Option A — REJECT (fail closed against the worker)

Control plane refuses an inadmissible gate; the run errors as a worker contract violation.

- ✅ Sharpest boundary; the taxonomy becomes enforceable rather than advisory.
- ✅ Never silently changes the worker's testimony.
- ⛔ A single miscategorized emission kills an otherwise good run.
- ⛔ Punishes the worker for a control-plane taxonomy the worker cannot see fully.

### Option B — NORMALIZE (drop the inadmissible gate, continue the run)

Control plane discards the gate and lets the run proceed to verification.

- ✅ Restores the happy path immediately; smallest behavioural delta.
- ⛔ **Discards a claim.** If the worker was right for a reason the rule did not anticipate,
  the boundary is silently erased — the exact failure Unit 19 was built to prevent.
- ⛔ Creates a class of gates that are emitted, recorded, and then ignored. Corrosive to the
  meaning of "gate".

### Option C — RECLASSIFY (map to the admissible neighbour)

`WRITE_AUTHORITY_REQUIRED` under READ-ONLY becomes `SCOPE_EXPANSION_REQUIRED`, preserving
the original claim as provenance.

- ✅ Preserves the boundary while correcting the axis.
- ✅ `authority_required.operation_class` gives a principled mapping key.
- ⛔ The control plane is now **authoring** a gate the worker did not emit. `emitted_by`
  becomes ambiguous — the property Unit 20 exposed the field to make observable.
- ⛔ Risks masking genuine worker confusion behind a tidy reclassification.

### Option D — ADMISSIBILITY DECLARED AT GRANT TIME

The delegation packet declares the objective's operation class; the control plane validates
each emitted gate against a declared admissibility set, and the worker is told only the
gates admissible for *this* objective.

- ✅ Moves the invariant from prompt text into the **contract**, which is the layer that can
  actually enforce it.
- ✅ Shrinks the worker's choice set, which is likely why prompt narrowing kept failing.
- ✅ Composes with A, B, or C as the residual-violation policy.
- ⛔ Largest change: touches the packet schema, the delegate prompt, and the gate validator.
- ⛔ Requires deciding what happens when a declared-inadmissible gate still arrives — so it
  does **not** remove the A/B/C choice, it only narrows how often it fires.

### Cross-cutting question the ruling must also answer

> Should an inadmissible gate be **recorded** even when it is not **honoured**?

Recording preserves the evidence trail and makes over-emission measurable rather than
invisible. It is separable from A/B/C/D and can be ruled on independently.

---

## 5. Boundaries on any future implementing unit

- ⛔ Do **not** broaden Alpha's definition.
- ⛔ Do **not** build the REFUSE harness under this unit.
- ⛔ Do **not** weaken Unit 19's rule that a gate is a claim adjudicated against the run
  record, never trusted at the transport.
- ✅ Any implementation must keep the `MUTATE=drop-gate-wire` discriminating control
  meaningful — the proof must still be able to reproduce the pre-Unit-20 false-`VERIFIED`
  path.

---

## 6. Reproduction

```bash
cd ~/.claude/worktrees/ain-jarvis-unit-20-native-gate-wiring

# Unit 19 hermetic suite (expect 31/31)
node scripts/builder/__tests__/jarvis-governance-gate-proof.mjs

# Live proof — A1/A2 reproduce the defect, §C/§D pass except C5
node scripts/builder/__tests__/jarvis-native-gate-live-proof.mjs

# Discriminating control — runtime must be restarted WITH MUTATE in its environment
bash scripts/jarvis-runtime.sh stop
MUTATE=drop-gate-wire bash scripts/jarvis-runtime.sh start
PHASE=B MUTATE=drop-gate-wire node scripts/builder/__tests__/jarvis-native-gate-live-proof.mjs
# run B → VERIFIED, gate present false  (pre-Unit-20 behaviour)

# Restore
bash scripts/jarvis-runtime.sh stop && bash scripts/jarvis-runtime.sh start
```

Observed: **9 failed checks mutated → 1 unmutated (C5 only).** The wire is what makes the
difference.
