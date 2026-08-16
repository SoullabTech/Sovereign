# JARVIS Operator Programme — PHASE 0 RECONCILIATION RECORD

**Date:** 2026-08-16 · **Mode:** read-only bind · **Changes:** none (this file only)
**Purpose:** bind the brief's named referents to repository custody before JOP-01 / JCG-01 open.
**Rule applied:** JARVIS Core §C — *never act from a conversational pointer when repository custody
can establish the referent.* Every line below is either witnessed or explicitly marked unwitnessed.

---

## 1. Canonical binding (resolved at execution time, not reused from the brief)

| Referent | Bound value |
|---|---|
| Repository | `https://github.com/SoullabTech/Sovereign.git` ✅ matches brief |
| Canonical trunk | `origin/clean-main-no-secrets` = **`39cc97d87`** |
| Current checkout HEAD | `a377e6878` on `feature/labtools-redesign` |
| Divergence | **550 ahead / 56 behind** trunk · **510 dirty files** |

⛔ **The brief's SHA-freshness instruction was honored:** no SHA from the brief was reused; trunk was
re-resolved by `git fetch` at execution time.

---

## 2. CONFIRMED — the brief was right about existence

**PR #1043 is real, OPEN, and `MERGEABLE.`** Not a draft. Base `clean-main-no-secrets`.
Last updated 2026-08-14. **1,266 additions / 0 deletions / 5 files:**

| File | Lines | Brief's name for it |
|---|---:|---|
| `scripts/builder/jarvis-runtime-pipeline.mjs` | 461 | runtime pipeline ✅ |
| `scripts/builder/jarvis-governance-gate.mjs` | 309 | governance gate ✅ |
| `scripts/builder/jarvis-context.mjs` | 224 | context router ✅ |
| `scripts/builder/jarvis-packet-guard.mjs` | 158 | packet guard ✅ |
| `scripts/builder/jarvis-runtime-store.mjs` | 114 | run store ✅ |

**Five for five.** The brief's inventory of the C1 mechanism cluster is accurate.

`jarvis-context.mjs` exports witnessed by source: `estimateTokens` · `sha256` · `extractSymbol` ·
`materializeOne` · `materializePacket` · `renderFragments` · `budget`. Line selection (21 lexical
hits), symbol (7), anchor (4), SHA (9), token budget (12–13) — **all witnessed.**

**C0 and C1 are genuinely separate lineages, as the brief states.** C0 Desktop = `jarvis-desktop/`
(7 files: `main.js` 230 L, `renderer.js` 177 L, `preload.js`, `index.html`, package files) on
`0bec4eb24` / `feature/jarvis-desktop-c1-evidence-containment`. **PR #1043 contains no
`jarvis-desktop/` files** — the C0↔C1 seam is real and unwired, exactly as described.

---

## 3. ⚠️ CONTRADICTED — custody state, and one load-bearing capability claim

### 3.1 ⛔ NOTHING IS ON TRUNK

| Commit | Date | Subject | On trunk? |
|---|---|---|---|
| `df58fef2f` | 2026-08-10 | JARVIS Unit 8 precision context router | **NO** |
| `e381a6321` | 2026-08-11 | custody of the JARVIS runtime execution fabric | **NO** |
| `0bec4eb24` | 2026-08-11 | jarvis-desktop adopt evidence substrate byte-exact | **NO** |
| `334c11f92` | 2026-08-14 | land the JARVIS builder execution mechanism cluster | **NO** |

Trunk carries **zero** non-`docs/` JARVIS files. The eleven tracked `jarvis`-matching paths in the
primary checkout are **ten documents and one skill** — no mechanism.

**Correct custody classification:** `committed ✅ · pushed ✅ · PR open ✅ · merged ❌ · deployed ❌`.
The brief's "finish the architecture you have already begun" is **right in substance**; the machinery
exists and is good. But "*your open JARVIS mechanism work already says…*" describes **branch state,
not trunk state.** Nothing here is yet load-bearing for anything running.

### 3.2 ✅ RESOLVED 2026-08-16 (P0-C) — **the brief was right; the instrument was wrong**

> **This section is superseded and preserved.** The lexical census below was a **bad instrument**, and
> it produced a false negative. P0-C read the execution paths and ran positive/negative controls.
> **All three claims are CONFIRMED.** The code expresses refusal as `fail(...)`,
> `within_budget`, `ESCALATION_REQUIRED` and `EVIDENCE_OUT_OF_CONTEXT` — using **none** of the words
> grepped for. This is JARVIS Core §B working exactly as written: *absence from a search is evidence
> about the search, not yet about the world.* The caution was correct; the conclusion it guarded
> against would have been wrong. Full result: **§3.2-R** below.
>
> ⛔ Do not cite the table below as evidence of anything except the weakness of lexical search.

<details><summary>Superseded lexical census (retained per §G — corrections replace confidence, not evidence)</summary>

#### (superseded) "Refuses when the packet would exceed the worker budget" — NOT WITNESSED

The brief's most load-bearing Context-Governor claim. Lexical search across **all five cluster files
(1,266 lines)**:

| Signal | context | packet-guard | pipeline | gov-gate | store |
|---|---:|---:|---:|---:|---:|
| `refuse\|reject\|deny` | 0 | **0** | **0** | 0 | 0 |
| `exceed\|over budget\|too large\|overflow` | 0 | **0** | **0** | 0 | 0 |
| `cite\|citation\|quoted` | 0 | **0** | **0** | 0 | 0 |
| `leak` | 0 | **6** | **7** | 0 | 0 |
| `verif` | 0 | **18** | **20** | 1 | 0 |
| `budget` | 12 | 0 | **14** | 0 | 0 |

**What this establishes:** leakage lint is **real** (13 hits). Independent verification is **real**
(38 hits). Budget *computation* is **real** (26 hits).

**What this does NOT establish:** that budget overflow produces a **refusal**, or that verification is
specifically **citation** verification. Zero hits for every refusal verb and every citation term.

⛔ **This is not a finding that the refusal is absent.** Per JARVIS Core §B — *absence from a search
is evidence about the search, not yet about the world.* A refusal can be expressed as a throw, a
null return, or a filter without using any of these words. **It requires a read of the budget path
before the claim is either confirmed or dropped.**

</details>

### 3.2-R ✅ P0-C RESULT — read + executed, 2026-08-16

**Claim 1 — over-budget packets are mechanically refused before worker execution. CONFIRMED.**
`budget()` returns `within_budget` and `status: 'CONTEXT_BUDGET_EXCEEDED'`
(`jarvis-context.mjs`). The pipeline gates on it:

```js
// jarvis-runtime-pipeline.mjs:298
if (!budgetReport.within_budget) {
  return fail('CONTEXT_BUDGET_EXCEEDED', `est ${...} tok > threshold ${...}`);
}
```

**Ordering is decisive:** the gate is at **line 298**; the worker is spawned at **line 338**
(`spawnDelegate(['local-native', …])`). The refusal is 40 lines *upstream* of execution.

**Claim 2 — exact refusal class. ESTABLISHED.** Not an exception. `fail(class, detail)` performs a
state transition to `FAILED` carrying `failure_class`, `failure_detail`, `disposition: 'FAILED'`.
`FAILED` is terminal. Sibling class `CONTEXT_SELECTION_FAILED` covers materialization errors.

**Claim 3 — verification binds worker citations to materialized context. CONFIRMED, and stronger
than the brief stated.** `verifyEvidence(output, fragments)` compares the worker's citations against
the **fragments actually materialized**. Three terminal dispositions:

| Condition | Disposition | Class |
|---|---|---|
| citations valid and in-context | `VERIFIED` | — |
| worker returned no citable `file:line` | `ESCALATION_REQUIRED` | `EVIDENCE_INSUFFICIENT` |
| any citation outside materialized context | `ESCALATION_REQUIRED` | **`EVIDENCE_OUT_OF_CONTEXT`** |

**Not in the brief, found in the read — `WORKER_VISIBLE` / `VERIFIER_ONLY` partition with
default-deny.** `expected_citations`, `expected_answer`, `gold_label`, `verification_commands`,
`expected_symbols` are structurally prevented from reaching the worker. The source header records
why: a prior run where *"JARVIS refused verification because one citation was wrong"* and a defect
where verifier expectations leaked into the packet. **This is answer-leakage prevention as
structure, not discipline.**

#### Runtime controls executed (not code-read — actual execution, worktree `39cc97d87`)

| # | Control | Negative | Positive | Verdict |
|---|---|---|---|---|
| 1 | Budget gate | limit 200000 → `within=true`, `OK` (est 5,878 / thr 160,000) | limit 50 → `within=false`, **`CONTEXT_BUDGET_EXCEEDED`** (est 5,878 / thr 40) | **PASS** |
| 2 | Evidence binding | in-context `package.json:5` → total 1, **valid 1** | out-of-context `OracleConversation.tsx:9000` → total 1, **invalid 1**; no citation → total 0 | **PASS** |
| 3 | Answer-leakage partition | — | worker sees only `work_unit_id, context_selectors`; all six expectation fields held verifier-side | **PASS** |
| 4 | SHA binding | selector at head → `OK method=line-range` | stale sha → **`SELECTOR_SHA_MISMATCH`**; absent sha → **`SELECTOR_SHA_UNBOUND`** | **PASS** |

Also witnessed in the read, unclaimed by the brief: `SELECTOR_REBIND_AMBIGUOUS` (an anchor matching
more than once **throws** rather than picking the first — referent discipline enforced mechanically);
`READ_ONLY_LANES` admission; and *"Fail CLOSED: an unreadable capacity ledger is not permission to
dispatch."*

**Disposition:** the mechanisms satisfy the claims. **Nothing was rewritten** — per the standing
instruction, the proof is preserved and the code is untouched. No successor repair unit is needed.
**PR #1043 moves `BLOCKED_ON_PROOF` → clear to proceed.**

---

## 4. JOP-01 — the legibility defect, bound to source

The Desktop is **small**: `renderer.js` 177 lines, `main.js` 230 lines. JOP-01 is a bounded surface.

**Status vocabulary in `renderer.js` is literally two words:** `'UNKNOWN'` ×2, `'AVAILABLE'` ×2.
There is **no state machine** — the founder's read is exactly correct. One probe function,
`refreshStatus`. The proposed 8-state vocabulary (READY / WORKING / NEEDS SETUP / NEEDS AUTHORITY /
DEGRADED / BLOCKED / FAILED / UNVERIFIED) is **new work**, not a relabeling.

**⭐ But one assumption in the brief is wrong in JARVIS's favour.** `main.js:88` already emits:

> `UNKNOWN (packaged mode) — set JARVIS_REPO_ROOT, or run from inside a checkout with all four canonical markers`

That is **already a state + reason + remediation.** `main.js:46–58` resolves repo root from
`JARVIS_REPO_ROOT` → known checkout, and treats packaged vs dev as **explicitly distinct cases**
(with a source comment recording that this was itself screenshot-verified on the first packaged build).

**Therefore JOP-01 is predominantly a promotion/representation problem, not a missing-information
problem.** The reason string exists and is good; it is rendered in a footer instead of as the primary
state. This makes JOP-01 substantially cheaper than the brief assumes, and it means the first move is
to *surface facts the system already computes* — which is precisely the "no new orchestration
authority" constraint the brief imposed. ✅

⚠️ **Not witnessed by me:** the screenshot itself never arrived in this session. The founder's
transcription of the badges is corroborated by `renderer.js` (2× UNKNOWN, 2× AVAILABLE), so it is
treated as reliable — but no claim here rests on an image I did not see.

---

## 5. ⛔ BLOCKING HAZARD — workspace, before any code is written

- **Current checkout is unusable for this programme:** `feature/labtools-redesign`, **510 dirty
  files**, 550 ahead / 56 behind trunk. Opening JOP-01 or JCG-01 here would entangle two lanes.
- **Nine `jarvis` worktrees on disk**: `ain-jarvis-custody`, `ain-jarvis-desktop-preserve`,
  `ain-jarvis-r7-mechanism-recovery`, `ain-jarvis-route-a-deterministic-lane`,
  `jarvis-builder-cluster`, `jarvis-desktop-c0-explorer`, `jarvis-desktop-c1-evidence`,
  `jarvis-fabric-custody`, `jarvis-u21-admissibility`.
  **Which of these is the authoritative C0 head is NOT yet established** — `jarvis-desktop-c0-explorer`
  and `jarvis-desktop-c1-evidence` are both plausible referents for "C0 Desktop". Names are not
  identity (§C). ⛔ Do not open JOP-01 against a worktree chosen by name.

---

## 5-bis. P0-D RESULT — #1043 MERGED, and a second cluster discovered

**Merged 2026-08-16T15:15:04Z.** Canonical trunk `39cc97d87` → **`310578ca8`**. All five checks green
(`covenant-gates` · `build` 9m59s · `sovereignty` · `check-diagrams` · `auto-label`).

**Gate clearance was earned, not bypassed.** `covenant-gates` failed twice and was satisfied on the
merits: (1) **Class B** derived from `docs/GOVERNANCE_MENTOR_COVENANT.md` — *"routing logic across
agent paths"*; not Class A (touches no consent, retention, memory handling, or safety doctrine), not
Class C (new execution machinery, not a refactor). (2) **Rollback = revert**, factually true at
1,266 additions / 0 deletions of new files that nothing yet imports. ⛔ The `covenant-signoff`
bootstrap label — which bridges *approval* — was **not** applied. That is a steward act, not an
implementer's.

**Merge verified by content, not by exit code:** `334c11f92` is an ancestor of trunk; all five files
present at expected sizes; the module graph resolves entirely on trunk; runtime path dependencies
`scripts/ain-delegate.sh` and `scripts/builder/session.mjs` are both present; and
`jarvis-runtime-pipeline.mjs` **imports cleanly on trunk** (smoke: exports `LEGAL_TRANSITIONS`,
`READ_ONLY_LANES`, `RUN_STATES`, `TERMINAL_STATES`, …). The merged cluster is self-contained.

### ⚠️ NEW FINDING — a second mechanism cluster is unmerged and has **no open PR**

`e381a6321` (*"custody of the JARVIS runtime execution fabric"*, 2026-08-11) carries **18 files
absent from trunk**, and no pull request proposes them:

- **7 mechanism modules** — `jarvis-runtime.mjs`, `jarvis-authority-gate.mjs`,
  `jarvis-authority-channel.mjs`, `jarvis-delegation.mjs`, `jarvis-local-worker.mjs`,
  `jarvis-principal.mjs`, `jarvis-runtime-client.mjs`
- **11 proof tests** — including `jarvis-context-proof.mjs`, `jarvis-packet-guard-proof.mjs`,
  `jarvis-governance-gate-proof.mjs`, `jarvis-runtime-proof.mjs`

⚠️ **The code merged by #1043 landed without its own proof suite.** The repository's proofs for
exactly these modules exist, are authored, and are not on trunk. The P0-C controls in §3.2-R were
hand-written for this reconciliation — they are evidence, but they are **not** the repo's own tests.
`df58fef2f` additionally holds `continue.mjs`, `orient.mjs`, and an **earlier** `jarvis-context.mjs`
(`3367219e` vs trunk `c54cb3d8`) — that one genuinely differs and must not be merged blindly over
the newer file.

⛔ This is `DISCOVERED`, not homework. It is recorded, not acted on.

> **Method correction (§G).** The first absence scan reported these as `DIFFERS … vs trunk
> e3b0c442`. `e3b0c442…` is the **sha256 of the empty string** — `git show` on a missing path
> returns nothing, and the hash of nothing is not a difference. They were *absences* misreported as
> *differences*. Re-run with `git cat-file -e`. Same failure family as the §3.2 lexical census: a
> convenient instrument, trusted one step past what it could actually witness.

## 6. Programme state

```text
JARVIS OPERATOR PROGRAMME — PHASE 0 CLOSED 2026-08-16

CONTEXT GOVERNOR
  canonical mechanism ..... MERGED — PR #1043, trunk 310578ca8
  five cluster files ...... ON TRUNK, module graph resolves, import smoke OK
  budget REFUSAL .......... CONFIRMED — gate :298 precedes worker spawn :338
  citation verification ... CONFIRMED — EVIDENCE_OUT_OF_CONTEXT is a real class
  answer-leakage partition  CONFIRMED — default-deny, worker sees 2 fields
  SHA binding ............. CONFIRMED — MISMATCH + UNBOUND both fire
  runtime controls ........ 4/4 PASS (executed, not code-read)
  repo's own proof suite .. *** 11 proof tests NOT on trunk, no open PR ***
  Claude base context ..... AUDITED 2026-08-16, unchanged — JCG-01 not started

OPERATOR
  C0 Desktop .............. *** LINEAGE FORK — 4 divergent heads, no ruling ***
  status vocabulary ....... 2 words, no state machine
  repo-root reason string . ALREADY EXISTS — mis-placed, not missing
  authority ............... unchanged; nothing expanded

WORKSPACE
  governed worktree ....... .claude/worktrees/jarvis-operator-p0 @ 310578ca8, clean
  dirty lane avoided ...... feature/labtools-redesign (510 files) untouched

DEPLOYMENT
  canonical SHA ........... 310578ca8  (was 39cc97d87)
  production SHA .......... NOT CHECKED — no deploy attempted
  Caddy edge freeze ....... PRESERVED (not touched, not tested)

NEEDS FOUNDER
  1. C0 Desktop lineage — which of four divergent heads is authoritative?
     No preserved ruling binds the name. Blocks JOP-01 only.
```

---

## 7. Why nothing is escalated

Run against the founder-escalation contract:

1. **Merging PR #1043** — the brief already rules it ("*Land/reconcile PR #1043*"). Authorized, with
   an unmet execution condition (§3.2). That is **`BLOCKED_ON_PROOF`**, not an open question.
   ⛔ Do not re-ask a settled ruling.
2. **Workspace collision** — two competent implementers would not differ: isolate in a clean
   worktree. **Below the boundary; implement it.**
3. **Which worktree is authoritative C0** — resolvable by custody inspection, not by ruling.
   **Below the boundary; establish it.**

**No founder decision is required to proceed.**

---

## 8. Next acts (all below the authority boundary)

1. Read the `budget` path in `jarvis-context.mjs` + `jarvis-runtime-pipeline.mjs` to resolve §3.2
   — the one unverified claim that JCG-01's design depends on.
2. Bind the authoritative C0 head by custody (commit ancestry + content), not by worktree name.
3. Isolate a clean worktree off `39cc97d87`; do not work in the 510-dirty checkout.
4. Open JOP-01 and JCG-01 as independently reviewable units.

⛔ No code written, no branch created, no PR touched, no deploy attempted in Phase 0.
