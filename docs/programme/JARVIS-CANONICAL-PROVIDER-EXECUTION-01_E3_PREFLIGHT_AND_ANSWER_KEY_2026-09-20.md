# JARVIS-CANONICAL-PROVIDER-EXECUTION-01 · E3 — PRE-FLIGHT + PRE-REGISTERED ANSWER KEY

**Date**: 2026-09-20 · **Standing**: ⛔ **E3 NOT SPENT FROM THIS SESSION** · ✅ PRE-FLIGHT DISCHARGED · ✅ ANSWER KEY PRE-REGISTERED

## 1. E3 cannot be spent from this session

A statement about the environment, ⛔ not a deferral and ⛔ not a partial result. **No provider attempt has been made, no grant issued, no Work Unit created.**

| Requirement | State |
|---|---|
| `ollama` binary | **ABSENT** |
| `opencode` binary | **ABSENT** |
| `/Applications/JARVIS.app` | **ABSENT** (Linux container) |
| `/Users/soullab/jarvis-canonical-e3-a2d32f83` | **ABSENT** |
| Platform | `Linux x86_64` — not the bound macOS host |

The E3 act requires the installed artifact `17851fbda`, the bound macOS substrate, and a local Ollama service. All three are properties of the founder's Mac Studio. **E3 is owed to that host.**

## 2. Pre-flight discharged (repository truth, read-only)

Substrate commit `a2d32f83d872bfa6c31b4bf96c5f83cd9d9b5804` — **present**, authored `2026-09-19 14:32:31 -0400`, merge of PR #1419. Confirmed an ancestor of this session's HEAD.

All three authorized evidence paths exist at the exact SHA, with blob identities recorded so the witness host can prove byte-identity without trusting this record:

| Path | blob | bytes | lines |
|---|---|---|---|
| `jarvis-desktop/src/work-unit-control.js` | `fa63cd96b9be` | 44631 | 1281 |
| `scripts/builder/canonical-provider-execution-v1.mjs` | `7c46094a73d3` | 26851 | 721 |
| `scripts/builder/canonical-provider-execution-grant-store-v1.mjs` | `bb8d3d118656` | 9115 | 323 |

Verify on the witness host before Work Unit creation:
```
git rev-parse a2d32f83^{commit}
git rev-parse a2d32f83:jarvis-desktop/src/work-unit-control.js   # → fa63cd96b9be...
```

## 3. ⭐ Pre-registered ground-truth answer key

Established **before any model runs**, so the witness cannot be graded by reading Qwen's answer and deciding it looks right. Derived from the three authorized files at the exact SHA and from nothing else.

**AC-1 — Is an ACTIVE exact grant required before execution? YES.** `canonicalConfirmAuthorizedExecution` refuses `GRANT_NOT_FOUND` if the grant does not exist and `GRANT_NOT_ACTIVE` for any other standing. Both refusals occur **before the provider module is imported**.

**AC-2 — Grant-standing check.** `canonicalGrantStandingV1` folds an append-only JSONL event stream (`ISSUED → ACTIVE`, then `CLAIMED` / `CONSUMED` / `REVOKED` / `INVALIDATED`). ⭐ Standing is **derived from positive events, never stored as a mutable status field** — the same law the temporal-memory and S3 lanes ratified independently.

**AC-3 — Fresh re-admission at Confirm Execute.** `evaluateCanonicalExecutionGrantV1` rebuilds the preview from current facts, then: `validateCanonicalExecutionGrantV1` (11 exact field equalities — work unit, authorized core snapshot, canonical SHA, route version/digest/source, participant, transport binding, attempt population digest, attempt count, verifier count — plus 4 structural digest comparisons over participant / binding / evidence policy / grant scope), then a **fresh `runR4(..., includeProviderExecute: true)` that must return `ADMITTED`**, then `r5aStanding(workUnit).exact`. Any failure calls `invalidateCanonicalExecutionGrantV1` — ⭐ **the stale grant is killed, not left ACTIVE for a second try.**

**AC-4 — Exact provider/model/transport matching.** Three-way equality after resolution: `resolved.provider_id === binding.provider_id && resolved.model_id === binding.model_id && resolved.execution_adapter === binding.adapter_id`. Mismatch → `INVALIDATED` + `REGISTERED_TRANSPORT_IDENTITY_MISMATCH`. ⚠️ See §4 — this is only partially derivable from the authorized evidence set.

**AC-5 — Where the grant becomes CLAIMED.** `claimCanonicalExecutionGrantV1` is called **after** final admission, **after** transport identity match, **after** the credential availability check — and **before** the `EXECUTING` lifecycle transition and **before** the provider runner is invoked. The source states the intent directly: *"Claim before provider execution so double-clicks, crashes, or retries can…"*.

**AC-6 — Does a failed attempt still spend the one-shot authority? YES.** The runner is wrapped in `try/catch`; a throw persists a durable result with `exit_code: -1` and `test_results: 'not_run'`, and `consumeCanonicalExecutionGrantV1` runs **unconditionally afterwards**. ⭐ Precise boundary: the one-shot is spent **iff the claim occurred**. A `HELD_FOR_CREDENTIAL` refusal returns *before* the claim and leaves the grant `ACTIVE` and unconsumed.

**AC-7 — Contradictory evidence to `Authorize Once ≠ Confirm Execute`: NONE FOUND.** `canonicalAuthorizeExecutionOnce` builds a preview and appends one `ISSUED` event. It never imports `opencode-provider.mjs` and never reaches a runner. **Inference is not reachable from the authorization path in source.**

**AC-8 — Uncertainty a correct answer should name, not smooth over.** `issueCanonicalExecutionGrantV1` refuses `UNRESOLVED_GRANT_ALREADY_EXISTS` when a grant is `ACTIVE` **or `CLAIMED`**. So a grant claimed but never consumed (crash between claim and consume) **wedges that participant**: re-authorization is refused, and `revoke` requires `ACTIVE` so it cannot clear it — only `invalidate` (which accepts `ACTIVE|CLAIMED`) recovers. ⛔ Recorded as a named property, **not repaired here**.

## 4. ⚠️ The boundary finding — and why it is the best grader

**`scripts/builder/opencode-provider.mjs` is NOT in the authorized evidence set**, yet `resolveOpenCodeProvider` is what AC-4 turns on. A faithful answer must **name that boundary** and decline to describe the resolver's internals.

⭐⭐ **This makes the answer key a leak detector.** If the Qwen output states the resolver's registry contents — its `credential_env`, its model list, its `opencode_provider` mapping — then either the sandbox delivered files outside the authorized evidence population (**falsifier: evidence-scope breach**) or the model fabricated them (**falsifier: unlicensed confidence**). Both are recordable failures of the witness, ⛔ neither is a reason to widen the evidence set mid-act.

For the adjudicator only, from outside the authorized set: `qwen-local` declares `credential_env: null`, so the `HELD_FOR_CREDENTIAL` path is **not expected to fire** and the founder's *"any credential is requested for local Qwen"* stop condition should stay unspent. ⛔ **This paragraph is grading material and must not enter the provider sandbox.**

**No automatic retry exists** on the execution path — no loop, no re-invocation. A second attempt would require a second human act.

## 5. Required sequence on the witness host

Unchanged from the founder adjudication. The load-bearing step is **step 3**: after `Authorize this execution once`, prove — before any Confirm Execute — that grant standing is `ACTIVE`, that no durable result file exists at `~/.claude/ain-delegation/work-units-v2/results/<wu>/<grant>.json`, that the lifecycle has not advanced, and that no Ollama process ran. **That non-execution interval is the constitutional witness; everything after it is ordinary execution.**

Return the fields named in the adjudication. **STOP after the first Qwen attempt and durable evidence.** ⛔ No GPT-OSS reviewer, no verifier disposition, no `EVIDENCE_READY`, no adjudication, no closure.

## 7. ⚠️ Amendment — pre-spend instrument gate (added same day)

Three ways this act can spend the one-shot on an **instrument failure that looks like a result**. All are checkable on the host before the Work Unit is created. Full procedure in the companion runbook §A.

- **A1 — Context window.** No `num_ctx` is set anywhere in the builder or the adapter. The evidence bundle is **80,597 bytes ≈ 20–25k tokens**. A default 4096-token window would **silently truncate the prompt**, and Qwen would answer confidently from a fraction of the authorized evidence with nothing in the durable record showing it. ⭐ Gate: effective context ≥ 32768, else ⛔ do not spend — a silently truncated evidence set is not the authorized evidence population.
- **A2 — Timeout spends the grant.** `RUN_TIMEOUT_MS = 600000`. A throw is caught, persists `exit_code: -1`, and consumes. Warm the model first.
- **A3 — Output truncation.** `MAX_LOG_CHARS = 12000`; a thorough eight-condition answer can exceed it, so the durable excerpt may not hold the whole response.

⭐ **Sandbox scope confirmed in source**: the evidence workspace is built by `git show <sha>:<rel>` over `allowed_paths` only (plus `.opencode/agents/jarvis-readonly.md`), into a `mkdtemp` workspace removed in `finally`. This is what makes §4's leak detector sound — Qwen **physically cannot** reach the resolver.

## 8. Companion

`JARVIS-CANONICAL-PROVIDER-EXECUTION-01_E3_HOST_RUNBOOK_AND_GRADING_2026-09-20.md` — executable host procedure, the armed non-execution witness, and the pre-declared grading sheet.

## 9. Host readings — first pass (2026-09-20, Kellys-Mac-Studio)

**§G witness calibration — ✅ PASS.** `~/.ollama/logs/server.log` **745251 → 764260 = +19,009 bytes** across a known inference event. The log witness is **live and non-vacuous**: it demonstrably registers the thing it is relied upon to exclude. Warm-up returned a normal completion, no timeout — A2 mitigated, model resident under a 30m keepalive.

**⚠️ A1 context window — ⛔ NOT PASSED · HELD AT THE GATE.** The reading is ambiguous in the dangerous direction:

- `ollama show qwen3-coder:30b` → **`context length 262144`**
- `ollama show qwen3-coder:30b --modelfile | grep -i num_ctx` → **no output**

⭐⭐ **These measure different things, and only the second one is the gate.** `context length 262144` is the **architecture's trained maximum**, read from GGUF metadata — the ceiling the weights support. It is **not** the runtime context Ollama allocates. With **no `PARAMETER num_ctx` in the Modelfile**, the served `num_ctx` falls back to the **Ollama server default** (historically 4096; later builds 8192, settable via `OLLAMA_CONTEXT_LENGTH`) — potentially **32× smaller than the ceiling the same command prints.**

⭐ **Corroborated from the founder's own registry**: the sibling `maia-coder` carries an explicit `PARAMETER num_ctx 65536`. The tooling pins the runtime window when it matters — so its **absence** on `qwen3-coder:30b` is a meaningful silence, not an implied default of 262144.

⛔ **A headline capability number is not an allocation.** Accepting `262144` here would have passed the A1 gate on a figure that does not govern the run — the exact silent-truncation failure A1 exists to prevent, wearing a larger number.

**Owed before the gate clears**: the *effective allocated* context for this tag, read from the runtime rather than the metadata.

## 10. A1 RESOLVED — ✅ PASSED at the boundary (2026-09-20)

**Runtime allocation read from the server log, not from metadata:**
```
llama_context: n_ctx     = 32768
n_ctx_seq                = 32768
srv load_model: n_ctx_slot = 32768
print_info: n_ctx_train  = 262144
```
⭐ **The gap is exactly the one A1 was written to catch**: `n_ctx_train = 262144` is the trained ceiling; `n_ctx = 32768` is what the slot actually allocates. Had `262144` been accepted, the gate would have cleared on a number that does not govern the run.

**Gate: ≥ 32768. Allocated: 32768. ✅ PASSED** — met exactly, as predeclared. ⛔ The gate is **not** retroactively tightened now that the margin is visible; that would be the "reinterpret the contract when the result is inconvenient" move the freeze discipline forbids.

**⚠️ Headroom is thin at the low end, recorded as an observation, ⛔ not a gate change.** Evidence bundle = **80,597 chars**; generation shares the same 32768 window:

| chars/token | prompt | + scaffold | remaining for output |
|---|---|---|---|
| 4.0 | ~20,149 | ~1,500 | **~11,119** |
| 3.5 | ~23,028 | ~1,500 | **~8,240** |
| 3.0 (dense code) | ~26,866 | ~1,500 | **~4,402** |

A thorough answer to eight acceptance conditions can approach the low figure. **This does not truncate the prompt** — the A1 hazard — but it can truncate the *generation*, which would surface as an answer that stops mid-condition.

**⭐⭐ And a free remedy is already configured but not in effect.** `OLLAMA_CONTEXT_LENGTH = 65536` is set in the environment, yet the running server allocated **32768** — **the server did not inherit it.** *A declared setting that is not authoritative in the execution environment* — the same defect class as the branch-policy finding of 2026-09-13, where a committed rule was present but not enforced where it mattered.

**Founder's call, ⛔ not a blocker:** restarting the Ollama server claims the already-configured 65536 and doubles the headroom before the Work Unit exists. Cost: **re-run the §G calibration afterwards**, since a restart may rotate the log handle and the witness must be proven live against the server that will actually serve the run. Proceeding at 32768 is within the ratified gate and defensible.

## 11. Restart executed — 65536 claimed, §G recalibrated (2026-09-20)

**Restart confirmed.** `launchctl setenv OLLAMA_CONTEXT_LENGTH 65536` + relaunch produced a **new server PID `8809`** (was `6227`), app-managed as before — ⛔ no shell-backgrounded process, so hazard **J2 avoided**.

**⭐ Strongest evidence is the live process, not the log.** The running inference subprocess carries the allocation on its own command line:
```
llama-server --model …sha256-1194192c… --port 64556 -c 65536 -np 1 --context-shift --keep 4
```
`-c 65536` is the actual allocated window for the loaded model.

**§G recalibrated against the new server: ✅ PASS — `delta=18985` bytes.** The witness is live against **the server that will serve the run**, not its predecessor. Hazard **J1 avoided**: the prior log was copied to `server.log.pre-e3-restart` and the restart appended rather than truncated.

**⚠️ One ambiguity, flagged rather than smoothed.** `grep … | tail -3` returned `65536 · 65536 · 32768` — and since the log is append-ordered, the *last* line printed is the most recent match, which reads `32768`. Candidate explanations: a second model load (a different tag) after the qwen load, or interleaving across server generations in one file. ⛔ **Not resolved from this reading**, and the live `-c 65536` is not a substitute for knowing which load was last. Disambiguate with explicit line numbers and residency before Authorize Once.

**⭐⭐ And the reading named the mechanism A1 was gating against.** The llama-server flags include **`--context-shift`** with `--keep 4`. With context shift enabled, a prompt exceeding the window does **not** error — llama.cpp **discards the oldest tokens and proceeds**. *That is the silent truncation A1 exists to prevent, now identified as a concrete runtime behaviour rather than an inferred risk.* At 65536 the ~20–27k-token bundle sits far under the limit, so it will not trigger; at the original 32768 with a dense-tokenizing bundle it was closer than comfortable. ⭐ The gate was correct, and for a more specific reason than when it was written.

## 12. ⚠️ §11 CORRECTED — 65536 was NOT claimed for this model

**The disambiguation settles it against 65536.** `ollama ps`:
```
qwen3-coder:30b   06c1097efce0   21 GB   100% GPU   CONTEXT 32768
```
Line-numbered log agrees: loads at 13641 / 14120 / 14466 show `65536`, and **the most recent load — 14797 / 14834 — is `32768`.** That is the resident one.

**⛔ My §11 reading was wrong, and the error is instructive.** I cited the live `llama-server … -c 65536` as the strongest evidence for the loaded model. **The blob hash does not match**: that process serves `sha256-1194192c…` while `ollama ps` gives qwen3-coder the id `06c1097efce0`. ⭐ It is a **different model's** server — almost certainly `maia-coder`, which pins `PARAMETER num_ctx 65536` in its own Modelfile and therefore allocates 65536 regardless of server environment. *The same registry fact that corroborated the A1 finding also produced the false positive.*

⭐⭐ **And the mechanism of the failure is the one this lane keeps meeting**: a process argument, read without binding it to the model it serves, returned the hoped-for number for an unrelated reason. **Fourth instance.** The discipline that catches it is the same each time — *bind the reading to the thing it claims to measure.*

**⭐ `ollama ps` CONTEXT is the authoritative reading** for A1 — one column, bound to the named model, unambiguous. The server log and `pgrep` args are both susceptible to cross-model confusion; ⛔ neither should be used to clear A1 again.

**Why 65536 did not take**: `launchctl setenv` affects only processes started **after** it. Server PID `8809` was already running when the setenv executed, so it never inherited the variable, and its subsequent loads used its own default. **The app was not quit and relaunched after the setenv** — step 1 was skipped.

**A1 standing**: ✅ **PASSED at 32768**, as ratified. The 65536 upgrade is ⛔ **NOT APPLIED**. Either proceeding at 32768 (within the gate, ~4.4–11.1k output headroom) or completing the relaunch is lawful; the founder chose the upgrade, so it is owed. After any relaunch the model is evicted — **A2 and §G both become VOID and must be re-run.**

## 13. ⭐⭐ RECOMMENDATION — waive the 65536 upgrade, proceed at 32768

**Third attempt, same result: `pgrep` still returns PID `8809`.** The app was never quit, so `launchctl setenv` still has nothing new to apply to. The quit is a **GUI act** (menu bar → Quit) and cannot be pasted — which is why it keeps being skipped in multi-line pastes that the terminal is visibly mangling (`% OR    CONTEXT    UNTIL`).

**⭐ But the upgrade turns out to buy nothing for the evidence of record, and the arithmetic settles it:**

| chars/token | output capacity | in chars | vs `MAX_LOG_CHARS` 12,000 |
|---|---|---|---|
| 4.0 | ~11,119 tok | ~44,475 | **cap binds first** |
| 3.5 | ~8,240 tok | ~28,841 | **cap binds first** |
| 3.0 (dense) | ~4,402 tok | ~13,207 | **cap binds first** |

**At every tokenization rate, the 12,000-char durable excerpt cap (A3) binds before the 32768 context window does.** The durable result cannot hold more output than 32768 already permits — so ⛔ **the upgrade cannot improve the artifact this act produces.** It would only widen the UI-side read, where ~4,400 tokens is already a substantial answer to eight conditions.

**And each further restart has a real cost**: it evicts the model and **voids A2 and §G**, which must then be re-earned against the new server. Three attempts have produced three rounds of environment churn and zero gate movement.

**⭐ RECOMMENDATION: waive the upgrade. A1 is ✅ PASSED at 32768 as ratified, and 32768 is sufficient for the evidence of record.** ⛔ This is not a gate being relaxed — the gate was `≥ 32768` before any reading was taken, and it is met. *Continuing to optimise a gate that already passed is how a pre-flight turns into its own project.*

**Current environment standing**: `ollama ps` returned **no rows**, so the model is not resident and **A2 is VOID**; `§G delta = 2805 > 0` **passes** liveness, and its small magnitude relative to ~19,000 simply indicates no cold model load occurred in that window — the witness still registered the inference, which is all §G asserts.

**One warm-up, one `ollama ps`, run singly — then mint.**

## 6. Standing

**E3 AUTHORIZED · PRE-FLIGHT ✅ DISCHARGED · SUBSTRATE ✅ VERIFIED AT EXACT SHA · ANSWER KEY ✅ PRE-REGISTERED · ⛔ MEASUREMENT UNSPENT, OWED TO THE BOUND macOS HOST · ⛔ NO PROVIDER ATTEMPT MADE · ⛔ NO GRANT ISSUED · ⛔ NO SOURCE MODIFIED · PRODUCTION UNTOUCHED.**
