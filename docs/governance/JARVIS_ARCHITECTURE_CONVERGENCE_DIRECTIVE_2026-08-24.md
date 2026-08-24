# JARVIS — Architecture Convergence Directive

**Status:** ⭐ **ISSUED** — founder directive 2026-08-24.
**Continues under** the canonical JARVIS Master Directive. This instrument does not replace it; it
adds a convergence rule and a phase ladder to it.
**Confers** the bounded authority described in §13, and nothing beyond it.

⛔ **Issuance is not execution.** No evaluation phase begins because this file exists. Each phase
requires its own explicit instruction (§13).

---

## 0 · Objective

Converge on **one durable JARVIS architecture** rather than accumulating frameworks.

The architecture has become clear enough that JARVIS should now treat Deep Agents, Semantica,
TencentDB Agent Memory, AIVM, MCP, and future discoveries as **candidates competing for defined
jobs** — not as layers to be added.

---

## 1 · Governing Rule

> **JARVIS owns its contracts and laws. External technologies are replaceable implementations
> behind those contracts.**

⛔ Do not allow Deep Agents, LangGraph, Semantica, TencentDB, AIVM, MCP, Claude, GPT, or any other
external system to become JARVIS's architectural identity.

**Own the intelligence architecture. Rent or reuse the machinery.**

---

## 2 · Preserved as JARVIS-native

The following remain canonical Soullab/JARVIS responsibilities **unless the JARVIS-05 architecture
ruling explicitly proves otherwise**:

```text
Task Packet · task scope · authority · risk classification
claims · custody · STOP rules
evidence requirements · verification
operational-memory contracts · epistemic standing · provenance requirements
correction semantics · supersession
context eligibility · model/tool authorization · audit requirements
MAIA / JARVIS / AIN boundaries
```

External systems may **assist implementation**. They may **not redefine these contracts**.

---

## 3 · Adapter architecture

```text
                    JARVIS
                       │
              GOVERNANCE KERNEL
                 Soullab-owned
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
   EXECUTION       KNOWLEDGE        MEMORY
    ADAPTER          ADAPTER        ADAPTER
        │              │              │
 Deep Agents?      Semantica?      AIVM?
 LangGraph?        native?         Tencent?
 native?                           native?
        └──────────────┼──────────────┘
                       │
                 CONTEXT ENGINE
                       │
             MODELS + TOOLS + MCP
```

These are **conceptual boundaries to be established**, not code that exists today. Each names a job
and the mechanics that belong to it.

### 3.1 ExecutionAdapter

| | |
|---|---|
| **Candidates** | current JARVIS runtime · Deep Agents · LangGraph · hybrid |
| **Owns (mechanics)** | worker execution · planning · subagents · checkpoints · cancellation · tool invocation · context isolation |
| **Does NOT own** | ⛔ authority |

### 3.2 DecisionGraphAdapter

| | |
|---|---|
| **Candidates** | Semantica · current JARVIS graph primitives · native · hybrid |
| **Owns (mechanics)** | decisions · evidence relationships · provenance traversal · causal links · dependencies · temporal relationships · contradiction · impact traversal |
| **Does NOT own** | ⛔ the semantic contracts — JARVIS owns those |

### 3.3 MemoryAdapter

| | |
|---|---|
| **Candidates** | current JARVIS storage · AIVM Brain · TencentDB Agent Memory · native · hybrid |
| **Owns (mechanics)** | persistence · retrieval · indexing · cross-agent availability · project knowledge · skills · work episodes |
| **Does NOT own** | ⛔ memory classes · promotion · provenance · authority · correction · supersession · retrieval eligibility |

### 3.4 ModelAdapter

| | |
|---|---|
| **Candidates** | local Ollama models · Claude · GPT · Gemini · future models |
| **Owns (mechanics)** | temporary cognition |
| **Does NOT own** | ⛔ durable JARVIS knowledge |

### 3.5 ToolAdapter

| | |
|---|---|
| **Candidates** | native JARVIS tools · MCP · direct APIs · shell · filesystem |
| **Owns (mechanics)** | tool surface |
| **Does NOT own** | ⛔ tool permission — that remains governed by JARVIS authority |

---

## 4 · Non-integration freeze

**In force until the JARVIS-05 Architecture Ruling.** Do not:

```text
⛔ connect production Soullab operational memory to AIVM
⛔ migrate existing JARVIS memory
⛔ migrate MAIA memory
⛔ replace the current worker runtime
⛔ make Semantica canonical
⛔ make TencentDB canonical
⛔ fork external projects
⛔ introduce production dependencies on experimental frameworks
⛔ redesign working native primitives merely to match external frameworks
```

**Evaluation must precede adoption.** Phases 02–04 are **small experiments, not installations into
production**.

---

## 5 · MAIA boundary

⛔ No experiment under this programme may use production MAIA personal/human memory.

Use synthetic, public, or non-sensitive development information only. **Human memory remains
outside this evaluation.**

> MAIA remembers the person. JARVIS remembers the work. AIN governs what may become context.

---

## 6 · Phase ladder

Each phase ends in **STOP**. ⛔ No phase advances automatically into the next.

### JARVIS-00 — Gate Zero · complete first

Required final proof:

```text
real C1 execution
evidence verification
automatic C1 persistence
packaged JARVIS runtime
restart
retrieval of same run
provenance intact
running artifact SHA known
operated repository/worktree known
```

If any remain unwitnessed: **GATE ZERO = HELD.** ⛔ Do not begin JARVIS-01.

### JARVIS-01 — Canonical existing-system census

Read-only. Inventory **actual implementations** for:

```text
runtime · router · workers · task packets · claims · worktrees
authority · evidence · verification · persistence · memory · skills
project state · context · prompts · model routing · local models
tools · MCP · code indexing · graph structures · Desktop · monitoring · recovery
```

Classify every primitive as one of:
`PRESERVE · RECONNECT · REPAIR · COMPLETE · CONSOLIDATE · ADAPT · REPLACE · BUILD · DEPRECATE · HOLD`

Produce the canonical **Delta Map**. ⛔ Do not implement replacements during the census. **STOP.**

### JARVIS-02 — Execution substrate spike

Evaluate Deep Agents / LangGraph against the Delta Map, in an **isolated experimental environment**.
Test only enough to establish fitness.

Evaluate: worker lifecycle · planning · subagents · context isolation · tool calls ·
filesystem/shell · checkpointing · cancellation · restart/recovery · human approval · model
abstraction · MCP · complexity introduced · observability · integration cost.

Assign per capability: `KEEP JARVIS · USE · WRAP · ADAPT · REPLACE · EXPERIMENT · REJECT`.
⛔ Do not migrate production. **STOP.**

### JARVIS-03 — Decision / provenance graph spike

Evaluate Semantica against the Delta Map, on **isolated non-production information**.

Test: Observation · Evidence · Decision · Action · Outcome · causal links · provenance · dependency
traversal · contradiction · supersession · temporal state · impact analysis · policy representation ·
auditability.

**One decisive test:**

```text
Evidence A → Decision B → Wiki/Knowledge C → Skill D → Scene E
then INVALIDATE Evidence A
→ can the system reliably identify B–E as dependent and requiring review / staleness handling?
```

⛔ Do not make Semantica authoritative. **STOP.**

### JARVIS-04 — Agent memory bake-off

Compare, on the **same corpus** and the **same acceptance criteria**, using **non-sensitive
development material only**:

```text
A. current JARVIS memory
B. TencentDB Agent Memory
C. AIVM Brain
D. native / hybrid
```

Evaluate: work-episode persistence · skills · project knowledge · cross-session memory · cross-agent
sharing · selective retrieval · provenance · correction · supersession · dependency tracking ·
permissions · agent identity · auditability · redaction · export · deletion · latency · context
reduction · vendor dependency · local/offline capability · operational complexity · security · cost.

⛔ Do not select on marketing claims. **Measure behavior.**

**Critical tests**

| Test | Condition |
|---|---|
| Persistence | Worker A learns something · restart · Worker B retrieves it |
| Isolation | Worker B cannot retrieve knowledge outside its permitted scope |
| Provenance | Retrieved knowledge can identify its source |
| Correction | Correct the source → dependent knowledge becomes identifiable |
| Cross-agent continuity | ≥2 different agent/model runtimes reach the same permitted project knowledge |
| Vendor independence | JARVIS's canonical memory representation can be exported/reconstructed **without** the candidate service |

**STOP.**

### JARVIS-05 — Architecture ruling

Only after 01–04 are complete. Produce **one** canonical architecture.

| Capability | Existing JARVIS | Candidate | Ruling | Why | Migration |
|---|---|---|---|---|---|

Allowed rulings: `KEEP JARVIS · USE · WRAP · ADAPT · REPLACE · BUILD · HYBRID · REJECT`.

The ruling must identify stable JARVIS interfaces for **ExecutionAdapter · DecisionGraphAdapter ·
MemoryAdapter · ModelAdapter · ToolAdapter**. External implementation details remain behind those
boundaries.

---

## 7 · Selection principle

Do not ask: *Which framework has the most features?*

Ask: **Which combination gives JARVIS the smallest, safest, most intelligible architecture while
preserving Soullab sovereignty?**

| Prefer | Avoid |
|---|---|
| fewer overlapping systems | vendor lock-in |
| clear contracts | duplicate memory systems |
| deterministic behavior where possible | duplicate agent runtimes |
| strong provenance | duplicate graph systems |
| strong authority boundaries | opaque autonomous behavior |
| exportability · local capability | unnecessary orchestration layers |
| replaceable dependencies · low context overhead · low operational burden | |

---

## 8 · Absorption rule (standing, after this directive)

⛔ The master architecture is **no longer modified each time an interesting AI product appears.**

When a new system is discovered, the question is:

> **Which adapter does this compete for, and is it better than what we have already evaluated?**

Not:

> *Should we add another layer?*

This is how a rapidly changing AI ecosystem gets absorbed without rebuilding Soullab every week.

---

## 9 · Gate Zero standing at issuance

⚠️ **This section is repository evidence only.** Gate Zero's proofs are machine-side (packaged app,
install, restart, run retrieval on the founder's host). They **cannot be witnessed from a remote
container**, and nothing below is presented as a witness of them.

### 9.1 What repository custody establishes

| Referent | Bound value |
|---|---|
| Canonical trunk | `origin/clean-main-no-secrets` = **`be5b3b80241eb988e74f16cb8851888f135d45df`** (re-resolved at issuance) |
| C1 mechanism cluster on trunk | ✅ `334c11f92` is contained in trunk — the 5 files of PR #1043 are merged |
| Last installed + witnessed artifact | `6d3c0cbc4` — JOP-02 record, 2026-08-16, **6/6 closure matrix PASS** |

⛔ **The Phase-0 finding "NOTHING IS ON TRUNK" (`JARVIS_OPERATOR_PHASE0_RECONCILIATION_2026-08-16.md`
§3.1) is superseded.** The mechanism cluster is now merged. That section describes custody as of
2026-08-16 and should not be cited as current.

### 9.2 The blocking finding — distribution closure is owed again

Five JARVIS runtime/desktop commits have landed on trunk **since** the last installed-and-witnessed
artifact `6d3c0cbc4`:

```text
9290f3d  JOP-04  — dev mode gets the durable resolver it never had
a4c9ab3  JOP-04  — Home states the workspace before Work has to refuse it
83d7e04  JOP-04b — resolve the node a packaged launch cannot see
0d91185  JOP-04b — Builder OS reports the machine it runs on
1634f8c  JOP-04b — name the builder's node, not Electron's
```

These are precisely the commits that bear on Gate Zero's last two proofs — *running artifact SHA
known* and *operated repository/worktree known*. **They are on trunk and not in the installed
artifact.** This is the JOP-01 pattern recurring: `SOURCE CLOSURE ESTABLISHED · DISTRIBUTION CLOSURE
OWED`.

⛔ `merged ≠ packaged ≠ installed ≠ running ≠ witnessed`.

### 9.3 Standing

| Gate Zero proof | Standing | Basis |
|---|---|---|
| real C1 execution | ⚠️ UNWITNESSED HERE | mechanism merged; execution is host-side |
| evidence verification | ⚠️ UNWITNESSED HERE | `jarvis-governance-gate.mjs` present; refusal paths confirmed by Phase-0 §3.2-R |
| automatic C1 persistence | ⚠️ UNWITNESSED HERE | `jarvis-runtime-store.mjs` (Unit 11) present; run history is host-side |
| packaged JARVIS runtime | ⚠️ SUPERSEDED | witnessed for `6d3c0cbc4`; trunk has advanced (§9.2) |
| restart | ⚠️ UNWITNESSED HERE | host-side |
| retrieval of same run | ⚠️ UNWITNESSED HERE | host-side |
| provenance intact | ⚠️ UNWITNESSED HERE | host-side |
| running artifact SHA known | ❌ **NOT ESTABLISHED for trunk** | installed stamp predates JOP-04 (§9.2) |
| operated repository/worktree known | ❌ **NOT ESTABLISHED for trunk** | the commits that produce this are unpackaged (§9.2) |

```text
GATE ZERO = HELD
```

⛔ **JARVIS-01 does not open.** Closing Gate Zero requires a packaging + installed-witness unit
against a named descendant of trunk, on the founder's host, under the JOP-03 identity chain
(`SOURCE SHA → FINAL PACKAGE DIGEST → PACKAGED .app DIGEST → INSTALLED .app DIGEST → RUNNING
EXECUTABLE PATH + BUILD STAMP`).

---

## 10 · Execution instruction

```text
1. Complete JARVIS-00.
2. Once and ONLY once GATE ZERO = ACCEPTED, execute:
     JARVIS-01 — Canonical Existing-System Census only.
     Produce the Delta Map, report evidence, and STOP.
3. ⛔ Do not proceed automatically from JARVIS-01 into JARVIS-02.
```

Each phase requires an explicit next instruction.

---

## Governing principle

> **Own the intelligence architecture. Rent or reuse the machinery.**
>
> **MAIA remembers the person.
> JARVIS remembers the work.
> AIN governs what may become context.**
