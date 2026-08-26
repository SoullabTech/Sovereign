# Writer's Studio Phase 1 — Walk Evidence Record 003

> **Status: OPEN — P0-M PASSED, P0-D NOT EXECUTED.**
> This record is opened while the mechanism evidence is fresh. It is completed only when
> P0-D is executed or the witness is aborted. Nothing here authorizes a step.

## Run identity

| Field | Value |
|---|---|
| Specification version | **1.1**, frozen 2026-08-24; freezing commit `e5f36d83ce4a449f5a59aab5c5bc75ec71cb6f87`, sealed in the same lineage. Carried to this candidate **unchanged, by merge** |
| Run | 003 |
| Date | 2026-08-25 |
| Restart basis | §9 — a repaired/replaced candidate restarts at **A**. Run 002 stands as recorded and is **not** re-judged |

### Release candidate — assembled

| Field | Value |
|---|---|
| Candidate SHA | `83efa86df2e6b5d158bbf4d478061c29a5a8e409` |
| Branch | `feature/ws-01-source-custody-v4` |
| Base | `7531a9290` (canonical) |
| What it assembles | **Zero runtime delta.** All ten WS-01 runtime files are byte-identical to canonical. The candidate adds only acceptance apparatus: the frozen v1.1 walk specification, the Manuscript Room contract, and the Run 002 evidence record |
| Assembled by | **Merge** of the v3 lineage into a branch from current canonical — deliberately not cherry-pick, not blob-copy, not re-seal |
| Specification version judged against | 1.1 — unchanged, not re-authored, not version-bumped |

### Why a new candidate exists

The v3 candidate `4a551d3d1` was deployed and its runtime identity verified. Another lane then
deployed `b4133c7b8` (PR #1099) over it — a **different lineage**, not a descendant. Deployment
correspondence was lost, so P0-D could no longer be executed against the named object.

Separately, the WS-01 runtime reached canonical through PR **#1096**
(`reconcile/ws01-voice-mail-mainline`, commit `5e46212bc`), bundled in one 13-file commit with
voice diagnostics and a chat text-wrap fix — **without completing the frozen acceptance walk**.

⛔ **#1096 solved integration. It did not solve acceptance.**

### Why the seal is still true

The v1.1 Freeze Record names `e5f36d83c` as its freezing commit. Replaying those commits onto
canonical would mint new SHAs and force a re-seal, silently producing a v1.2 while the criteria
were unchanged. Merging makes `e5f36d83c` a genuine ancestor of `83efa86df`, so the seal is
**true as written** and the acceptance standard is untouched.

```text
ancestry inherited     YES
acceptance inherited   NO
```

This is **not** retroactive acceptance of #1096.

## P0-M — mechanism — **PASS**

Run against a real PostgreSQL, a real file vault, through the real migration
(`20260824000001_manuscript_source_custody.sql`) and the real code paths, per v1.1's admissibility
requirement.

| Field | Value |
|---|---|
| Controls | **27 passed · 0 failed** |
| Database | real PostgreSQL, migration applied from the candidate tree |
| Vault | real file vault |
| Command | `WS01_WITNESS_CONFIRM=1 … scripts/verify-ws01-source-custody.ts` |

### The negative leg — what makes the ruling load-bearing

| Control | Result |
|---|---|
| Vault bytes deleted, DB row intact → `verifyCustody` FAILS `artifact_missing` | PASS |
| The hash was still in the database, so the refusal was not incidental | PASS |
| A paste given artifact provenance is refused **structurally** by the `CHECK` constraint | PASS |

The control can fail, and does, when it should.

## P0-D — deployed candidate — **NOT EXECUTED**

| Field | Value |
|---|---|
| Verdict | `NOT EXECUTED` |
| Blocker | No exclusive deploy lease. Production deploy is held |
| Lease state | messages delivered 4/4 · **ACK 0/4** · lease **NOT ACTIVE** |

⛔ v1.1 states P0-D **may not** be satisfied locally, by an agent-driven browser, or by re-running
the mechanism controls. It requires a real file-backed arrival and a real pasted arrival through
the actual ingest HTTP path on the deployed candidate, verified server-side.

## Verdicts

| Step | Verdict | Notes |
|---|---|---|
| P0-M | `PASS` | 27 controls, real DB + real vault |
| P0-D | `NOT EXECUTED` | blocked on deploy lease |
| P0 (overall) | `INCOMPLETE` | passes only when both legs pass |
| A–H | `NOT REACHED` | the human walk has not been executed |
| G1 · final felt criterion | `NOT REACHED` | founder gates |

## Why the lease exists

Production state was replaced under an in-flight acceptance witness. The rule adopted:

> A production acceptance witness owns an exclusive deploy lease from runtime-identity
> verification through final evidence capture.

If any production deployment occurs during that interval, P0-D is invalidated and must abort.
Whether the intervening deploy "probably didn't affect WS-01" is **not** a question to be argued.

**Coordination is not custody.** Session-to-session hold notices are the best available
coordination; they do not prevent a deploy. Silence is not assent, and no timeout converts it
into assent. An enforced deploy lock is deferred — named, not built.

## State after this run

```text
canonical            7531a9290
candidate            83efa86df   assembled, P0-M PASSED, NOT deployed
runtime delta        ZERO
specification        v1.1 frozen, unchanged, seal true
P0-D                 NOT EXECUTED
deploy lease         NOT ACTIVE — 0/4 acknowledged
WS-01                IN ACCEPTANCE — not promoted
```
