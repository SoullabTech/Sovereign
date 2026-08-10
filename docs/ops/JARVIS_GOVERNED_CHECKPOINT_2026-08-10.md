# JARVIS — GOVERNED CHECKPOINT, 2026-08-10

**Purpose:** persist the architecture checkpoint and exact re-entry conditions so a fresh
session can resume **without conversation history**. This record reopens nothing, implements
nothing, and touches no production.

**Builder claim:** `s-5feaea09` · unit `jarvis-governed-checkpoint` · mode write · branch
`chore/jarvis-governed-checkpoint` · worktree `~/.claude/worktrees/ain-jarvis-governed-checkpoint`

**Read this first if you are resuming:** §4 (open questions) and §5 (re-entry conditions).
Everything above them is settled and must not be re-litigated.

---

## 1. Architecture map — relationship memory composition

```
relationship-memory retrieval
        ↓
available at FAST / CORE / DEEP        ← retrieval works at all three tiers
        ├── FAST → bespoke direct interpolation      (maiaService.ts:1293)
        ├── CORE → bespoke block in buildMaiaWisePrompt()  (maiaVoice.ts:890, fn at :530)
        └── DEEP → NO relationship-memory composition path
```

DEEP **loads** the full relational context — `loadRelationshipMemory(userId, { includeThemes:
true, includeBreakthroughs: true })` at `maiaService.ts:1820` — logs it, assigns
`(meta as any).relationshipMemory` at `:1831`, and never composes it into the prompt.

**There are at least two distinct prompt-composition mechanisms in MAIA today:**

| Mechanism | Governs | Example |
|---|---|---|
| `ADDENDA_SPECS` registry (24 fields, `maiaVoice.ts:~407-430`) | registry-governed addenda | `correctionRepairAddendum`, `atomsAddendum`, `episodicRecallAddendum` |
| bespoke per-tier injection | relationship memory | FAST interpolation · CORE hardcoded block · DEEP absent |

Relationship memory **never travels the addenda registry**. Whether these two mechanisms should
eventually converge behind one governed composition interface is an open architectural question
and is explicitly **not** part of the first Relational Depth unit.

---

## 2. Settled findings — do not re-derive

1. **The Relational Depth defect is a missing DEEP composition path.** Not a retrieval failure,
   not a schema gap, not a consent problem, not an addenda-registry problem.
2. **Retrieval redesign is NOT indicated.** The producer and reader both exist and work.
3. **Addenda-registry change is NOT indicated.** Patching `buildComprehensiveVoicePrompt` to
   iterate the registry would import ~24 unrelated fields **and still not compose relationship
   memory**, because relationship memory is not in the registry.
4. **The dirty consumer files are stale residue**, not contested active work. They are an earlier
   iteration of Layer A corrigibility, superseded ~6 hours later by
   `feature/gate1-persistent-corrigibility @ 4542fee66` (file commit `dac99ebf1`,
   2026-08-10T00:20:38Z vs working-copy mtime 2026-08-09T18:20:11Z).
5. **The liveness defect is empirically confirmed, longitudinally.** A contrast pair proved it
   without any intervention: `s-d5e6a4b1` (no writer) aged out and recovered normally at
   10:04:47Z exactly as predicted; `s-2aece444` (writer refreshing every ~180s) remained
   non-recoverable for 6+ hours. The only difference was whether something kept touching the record.

---

## 3. Explicitly CLOSED — do not re-investigate

- **`maiaVoice.ts` residue: CLOSED / VERIFIED.** Its one extra `correctionRepair` reference vs the
  branch is a **comment** citing `CORRIGIBILITY_ACTIVATION_TRACE_2026-08-09.md`, a document that
  does not exist. Both functional elements — the `correctionRepairAddendum?: string` field
  declaration and the `ADDENDA_SPECS` entry — are present on the branch (lines 118, 430; only the
  log wording differs). **Do NOT carry "verify maiaVoice.ts" forward.**
- **`maiaService.ts` residue:** 2 textually-unique lines, both a comment and a `console.log`.
  Non-load-bearing.
- **Whether relationship memory reaches FAST and CORE:** yes, both, verified at the line level.
- **Whether Unit 14 exists:** yes — `docs/ops/JARVIS_UNIT_14_PRINCIPAL_OBJECTIVE.md` on
  `chore/jarvis-unit-14-principal-objective @ dcee1f37f`, status *implemented and proved*.

---

## 4. Explicitly OPEN

**The only functional re-entry check for the corrigibility residue seam:**

> **`route.ts`** — does `feature/gate1-persistent-corrigibility` wire `correctionRepairAddendum`
> into the request path through an **equivalent route**?

Three lines are textually unique to the working copy and are functional (an assignment, an object
property, an argument):

```
correctionRepairAddendum = correction.block;
correction: correctionRepairAddendum,
correctionRepairAddendum, // Layer A corrigibility — in-turn
```

The branch carries **13** `correctionRepair` references against the working copy's **5**, so it
almost certainly implements the same capability more completely. But the check performed was
substring presence, not semantics: *"the branch does it differently and better"* and *"the branch
omits this wiring"* produce identical output from that test. **Requires a side-by-side read of both
wiring paths before anything is discarded.**

Other open threads, with their entry conditions:

| Thread | Entry condition |
|---|---|
| DEEP relationship-memory composition | resolve the `route.ts` question · clear residue · write claim |
| Unit 15 — delegation issuance + verification | a governed slot; scaffolding exists at `dcee1f37f`, stale lock + reusable 348 MB worktree at `ain-jarvis-unit-15-verified-delegation` |
| Unit 16 — founder-channel authentication | branch `chore/jarvis-unit-16-founder-channel` exists; lane `s-cfb2971f` opened 14:55Z and left the active set on its own |
| WU-009 §8+ | `ELEMENTAL_CONSTITUTION_AND_IMPLEMENTATION_READINESS.md` §0–§7 complete but **UNTRACKED** — durability before dependency |
| Worktree / disk residue | 163+ worktrees, ~6.7 GiB free (99% used), ~347 MB each |

---

## 5. Re-entry conditions — the next implementation unit

> **Add a governed relationship-memory composition block to DEEP using the same already-retrieved
> relationship context, without redesigning retrieval, authority semantics, or the addenda registry.**

Why this is unusually safe: DEEP **already pays the entire cost**. It fetches themes and
breakthroughs and discards them. The change adds no new query, no new latency, no new data access,
and no new consent surface. The expensive and consent-bearing half is already done; only
composition is missing.

Do **not** widen this into a generic prompt-composition refactor.

**Operational re-entry hazard.** In a multi-worktree session, tool invocations may execute against
different current working directories. A commit can therefore be structurally valid while
committing another lane's already-staged index. Before any write or commit, verify the target
worktree, branch, index contents, and `pwd` **within the same command context**. Encountered and
detected before push during this checkpoint's own creation; fully restored, no unrelated work lost
or altered.

---

## 6. The governing principle

> **Do not collapse distinct questions into one signal.**

Most defects found in this lineage were not failures of *trust*. They were failures of
*distinction* — one signal being asked to answer two constitutionally different questions.

```
artifact stability   ≠  owner liveness
packet validity      ≠  packet authority
diff coherence       ≠  diff currency
cryptographic integrity ≠ legitimate issuance
authoritative wording   ≠ authoritative standing
evidence of activity ≠  evidence of authority
```

**A checkpoint artifact may be valid and still be insufficient evidence for a different question.**

Worked examples in this repository:

- `check` fused *"is the artifact stable?"* with *"am I still here?"* — so auditing a claim for
  staleness refreshed it. Repaired in `25db0eec9`.
- A delegation is validated for shape, scope, ceiling and expiry, but its **issuer** is not
  authenticated — named by Unit 14 §14 and left as the next contract.
- Three modified files contained coherent work while establishing nothing about **whose** work it
  was or whether it was still current — resolved by locating the successor branch, not by guessing.

The repairs were small precisely because none of them added trust machinery. Each separated two
questions that had been sharing one signal.

### The broader form

> **Context must travel with the artifact across every authority boundary.**

```
valid commit                ≠  intended commit
correct message             ≠  correct provenance
correct index operation     ≠  correct working directory
heartbeat                   ≠  authenticated owner liveness
delegation                  ≠  authenticated issuance
authoritative-looking text  ≠  authenticated authority
```

In each case the local object is valid while the **relational context that gives it meaning has
been dropped**. Context-loss across a boundary can manufacture false authority without any
component being individually wrong.

> **Nothing malfunctioned. Every component was individually valid. The failure was that context
> did not survive the boundary.**

The repair is correspondingly small in every instance — **bind the context to the act**:

| Boundary | Binding |
|---|---|
| git commit | target worktree + branch + index + `pwd` verified in the same command context |
| Builder OS claim | claimant identity bound to liveness evidence (the lease token, `25db0eec9`) |
| delegation | issuer identity bound to the grant (open — Unit 15) |
| founder input | authenticated channel bound to the statement (open — Unit 16) |

A corollary worth keeping: **a guard that reports correctly is not a guard that was consulted.**
The repository's branch guard printed the correct target on both the mistaken and the correct
commit; it only became information when it disagreed with an expectation.

---

## 7. Governance state at checkpoint time

```
liveness repair 25db0eec9      ADOPTED into feature/labtools-redesign by founder ruling,
                               pure fast-forward, 4 files, zero overlap with 324 dirty files
proof suites (authoritative)   session-liveness-authority-proof 9/0 · session-proof 55/0
s-2aece444                     UNTOUCHED — QUIET, lease unauthenticated, aging naturally
first authenticated lease      s-5feaea09 (this claim) — issued a lease token at open
```

The adoption was performed **on the merits of its corrected ownership semantics**, not to unblock
work. Note for the record: a governed claim for that act was structurally impossible —
`feature/labtools-redesign` is checked out only in the worktree `s-2aece444` owns, and the
worktree-ownership invariant refuses before the capacity check, regardless of `--override`. The
authorized adoption could only proceed under the founder ruling itself. That circularity is the
defect describing itself.

---

## 8. Fresh-session reconstruction test

A repository-only reader must be able to answer:

| | Question | Expected |
|---|---|---|
| Q1 | Is `maiaVoice.ts` still open? | **NO** — closed/verified, §3 |
| Q2 | What exact file/path question remains? | **`route.ts`** `correctionRepairAddendum` request-path wiring, §4 |
| Q3 | What should NOT be re-investigated? | settled `maiaVoice.ts` functional verification, §3 |
| Q4 | What conceptual lesson governs re-entry? | do not collapse distinct questions into one signal, §6 |
