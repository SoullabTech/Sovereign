# JOP-00 — Canonical JARVIS Desktop composition

**Date:** 2026-08-16 · **Base:** canonical trunk `310578ca8`
**Branch:** `feature/jop-00-desktop-canonicalization` (isolated worktree, not the 510-dirty checkout)
**Authority:** founder ruling 2026-08-16 — composition/reconstruction, **not** fork selection.

---

## 1. Lineage, bound by ancestry

```
ef3d57c4e ──▶ 1b692f672 ──▶ 029b7aa98        authoritative C0 (Alpha Floor)
   (3/0)        (5/0)          (8/0 vs ef3d57c4e)

                    ec2671e3b ──▶ e4cf9881a   divergent C1 delta (7 ahead / 2 behind)
```

Verified by `git merge-base --is-ancestor` plus ahead/behind counts. ⚠️ An earlier run of this same
check reported "no containment relation" — that run used bash-only `declare -A` under `sh`, printed
nothing, and **silence was read as absence**. Corrected; see the method record in
`JCG-01_IMAGE_ISOLATION_CONTROL_2026-08-16.md` §4.

## 2. The substrate question was never actually in contention

| Check | Result |
|---|---|
| `jarvis-desktop/` on trunk before JOP-00 | **0 files** — Desktop was entirely off-trunk |
| C1's five mechanism files vs trunk | **byte-identical, all five** |
| C0 alpha-floor mechanism copies | **none** |
| C0 Desktop wire targets | `jarvis-context/governance-gate/packet-guard/runtime-pipeline/runtime-store.mjs` + `ain-delegate.sh` — all canonical on trunk |

⭐ The founder's constraint *"do not transplant the older Builder mechanism copies from the C1
branch"* is satisfied **structurally, not by care**: C1's mechanism files *are* what PR #1043 landed,
and C0 carries none. There was nothing older to exclude.

## 3. Composition performed

```
trunk 310578ca8
  + jarvis-desktop/            from 029b7aa98              16 files
  + C1 Desktop delta           ec2671e3b..e4cf9881a         +325 / −3
      correctness.js (new, 68) · main.js (+64) · renderer.js (+3/−1)
      test/c1-evidence-containment.test.mjs (new, 193)
  + Desktop proofs             from 029b7aa98               2 files
```

⛔ C1's non-Desktop paths were **excluded from the patch by path restriction**, not by manual review.

**One 3-way conflict, in `main.js:10–39`, resolved ADDITIVELY.** "Ours" was C0's module requires plus
its instance-identity block (the single-instance lock keyed on userData — the fix for the
2026-08-11 *"JARVIS.app won't launch"* symptom). "Theirs" was C1's single
`require('./correctness')`. **Both kept; nothing discarded.** All composed files pass `node --check`;
no conflict markers remain.

## 4. Proof results — 4 suites required, 4 run

| Suite | Result |
|---|---|
| `jarvis-desktop/test/wire-local-native.test.mjs` (C0 ↔ Builder wire) | **15 / 15 PASS** |
| `jarvis-desktop/test/c1-evidence-containment.test.mjs` (C1 containment) | **17 / 17 PASS** |
| `scripts/builder/__tests__/desktop-c0-explorer-proof.mjs` | 44 pass / **2 fail** |
| `scripts/builder/__tests__/jarvis-alpha-floor-proof.mjs` | 85 pass / **2 fail** |

⛔ **No proof was modified.** The four failures are classified below and left red on purpose.

### 4.1 Two failures are PRE-EXISTING — not caused by this composition

Both suites fail `preload exposes exactly the seven … channels`. **The same failure occurs on
`029b7aa98` itself** (45/1 and 86/1 there), so the composition did not introduce it.

Actual surface is **nine** channels: `capabilities · choose-repo · clear-repo · governance-action ·
mechanism-status · repo-config · run-work-unit · status · submit-task`.

The guard is deliberately an **exact** list — its own comment says a subset-check *"would let the next
addition through silently."* Alpha Floor added `mechanism-status` and `run-work-unit` for the C0→Builder
wire and did not update the guard. **So the guard is working exactly as designed: the IPC surface
widened, and it noticed.** This is a real standing finding about `029b7aa98`, inherited honestly
rather than silenced.

### 4.2 Two failures are SUPERSEDED — the authorized composition intentionally changes what they assert

**(a) `C1 execution + honest verification split untouched`** — asserts
`main.js` contains both `kind: 'execution'` and `correctness: 'unverified'`.
Measured: `kind: 'execution'` present (1); `correctness: 'unverified'` — **composed 0, alpha-floor 1**.
C1 replaced that hardcoded placeholder with a real decision:

```js
const { correctness, correctness_reason } = decideCorrectness({ … });
```

**The placeholder is the precise thing C1 was built to remove.** A proof asserting its continued
presence cannot survive C1 being reconciled — and the founder's "must preserve" list explicitly
requires C1's evidence containment.

**(b) `no runtime/pipeline substrate pulled in from lineage A`** — asserts no Desktop source string-matches
`jarvis-runtime` / `runtime-pipeline`. Now matches at `main.js:636,639`.

⭐ **This one fails precisely *because* an invariant is being honored.** The intent is *don't fork the
substrate into Desktop*. Measured: there is **no Desktop-local runtime, pipeline, or verifier file** —
Desktop *references* the canonical module. That is exactly the founder's *"no Desktop-local duplicate
verifier"* requirement. The proof's string-match **cannot distinguish a ported copy from a reference
to canonical**, so satisfying the invariant trips the guard that protects it.

⛔ **Neither may be "fixed" to go green here.** Both are the case the founder named for JCR-PROOF-01:
*prove it still tests the current contract.* They no longer do. Re-specifying them is a bounded
successor unit with its own review — silently rewriting a red proof during a composition is precisely
how evidence of a structural change gets absorbed.

## 5. Acceptance status against the founder's boundary

**Preserved and evidenced:** C0→canonical-Builder wire (15/15) · C1 canonical evidence containment
(17/17, including a delegate-dormancy negative proof) · no Desktop-local duplicate verifier
(measured: zero such files) · C1's execution-vs-correctness honesty split (now a real decision, not a
placeholder).

**Not yet evidenced in this unit — deliberately:** the negative-control matrix (unbound repo ·
missing mechanism · write refusal · C3-not-auto-executed · no-evidence · out-of-context citation ·
in-context citation). Four of the seven are already covered inside the two green suites; the
remaining three need explicit controls. **JOP-00 is not complete until they run.**

## 6. Not done

- Commit is **blocked at a repo gate**, not authored around it: the pre-commit hook first rejected
  branch prefix `feat/*` (renamed to `feature/*`, passed), then required installed dependencies in
  this fresh worktree. `npm ci` is running. ⛔ No `--no-verify`.
- Nothing pushed, no PR opened, no deploy.
- **JOP-01 must not begin until §5's remaining negative controls run**, per the founder's boundary:
  presentation work waits for a coherent candidate.
