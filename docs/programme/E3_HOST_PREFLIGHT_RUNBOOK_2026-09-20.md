# E3 Host Pre-Flight Runbook — Execution Protocol

**Status:** ⛔ UNSPENT. Specification only. No run has been performed under this document.
**Date authored:** 2026-09-20
**Executed from:** the bound macOS host. ⛔ **Not spendable from a remote container** — no route to the host exists there. A statement about the environment, not a deferral.
**Evidence discipline:** a run that hits any Hard Stop yields **NO EVIDENCE**, ⛔ never a finding, and the run is re-spent.

---

## §1 Protocol as specified (founder-authored)

### Phase 1 — Environment & context window inspection
1. `ollama show qwen3-coder:30b` → verify `num_ctx >= 32768`
2. **GATE:** `num_ctx < 32768` → ⛔ **STOP (Condition Red).** Otherwise proceed.

### Phase 2 — Log baseline & calibration warm-up
1. `wc -c < ~/.ollama/logs/server.log > /tmp/log_size_pre.txt`
2. Run model warm-up / calibration pass (mitigates A2 runtime timeout)
3. `wc -c < ~/.ollama/logs/server.log > /tmp/log_size_warm.txt`
4. **VERIFY:** warm > pre. Unchanged ⇒ the log witness is vacuous ⇒ ⛔ STOP and repair logging.

### Phase 3 — Work unit creation & fresh ledger verification
1. Mint Work Unit via creation/routing script → dynamic id `v2-<slug>-<suffix>`
2. `test ! -f ~/.jarvis/ledger/v2-<slug>-<suffix>.jsonl`
   **VERIFY:** file MUST be ABSENT. Present ⇒ stale grant inherited ⇒ ⛔ STOP.

### Phase 4 — Physical non-execution witness & UI gestures
1. Fire Preview gesture — IPC `jarvis:work-unit-action` → `canonical-execution-auth-preview`
2. `wc -c < ~/.ollama/logs/server.log > /tmp/log_size_preview.txt`
3. Fire Authorize Once — IPC `jarvis:work-unit-action` → `canonical-authorize-execution-once`
4. `wc -c < ~/.ollama/logs/server.log > /tmp/log_size_auth.txt`
5. **VERIFY:** log bytes UNCHANGED across Preview → Authorize Once; ledger tail shows exactly **1 ISSUED / 0 CLAIMED**.

### Phase 5 — Confirm execute & response extraction
1. Fire Confirm Execute — IPC `jarvis:work-unit-action` → `canonical-confirm-execute`
2. Extract full response **directly from the UI** (mitigates A3 `MAX_LOG_CHARS` truncation)
3. Adjudicate against the §7 leak discriminator:
   - **PASS** — prompt contains NO mention of `opencode-provider.mjs` (sandbox isolated)
   - **FAIL** — prompt describes the resolver registry (prompt leak / sandbox bypass)

---

## §2 Hard stop conditions (invalidation / "no-run")

Any trigger aborts the run **without burning E3 as a valid result**:

1. **A1 context window gate failure** — host model context below 32,768. Running under it produces silent evidence truncation: an instrument failure disguised as a result.
2. **Vacuous log witness** — log size fails to grow during Phase 2 warm-up. Stasis cannot prove non-execution if the logging pipeline is dead.
3. **Stale ledger collision** — `<WU>.jsonl` exists prior to authorization; a previous grant has been inherited.
4. **Pre-execution drift** — log byte count changes between Authorize Once and Confirm Execute, indicating background inference or premature execution before explicit confirmation.

---

## §3 Amendments PROPOSED before first run

⛔ **NOT RATIFIED.** Each stands or falls on its own; the protocol above is unedited. Three restate defect classes this programme has already paid for once.

### A-1 — The non-execution witness is calibrated on one side only ⭐
Phase 2 proves the log grew **once, earlier, under a different load**. It does not establish that the log *would* have grown at the moment of the Phase 4 gestures. That is **ENTAILED, ⛔ not WITNESSED** — the distinction the S3 O1 witness was built to hold.

**Proposed:** add a closing positive control. After Phase 5 step 1, capture `log_size_post_execute`; it **MUST** exceed `log_size_auth`. If it does not, Phase 4's stasis is **retroactively vacuous** and the run yields NO EVIDENCE. This brackets the witness on both sides instead of trusting a calibration taken before the work unit existed.

### A-2 — Absence of one string is a single-sided discriminator ⭐⭐
§7 scores PASS on the absence of `opencode-provider.mjs`. Two ways that reads falsely:
- the prompt may describe the resolver registry **without naming that file** — a leak the test passes;
- an **empty, truncated or failed prompt** contains no forbidden string either, so **a null result scores as PASS.** That is precisely the S3-F8 fixture trap, where a legitimately `null` read had to be prevented from scoring as a block.

**Proposed:** (i) forbidden **token set**, not one filename; (ii) a **positive control** — the prompt must contain the content it is supposed to contain, asserted independently, so PASS requires *present-and-clean*, ⛔ never merely *not-dirty*.

### A-3 — `ollama show` reports the declared parameter, not the window in force
`num_ctx` from `ollama show` is the Modelfile default. A client may override it per request, so Phase 1 licenses a claim about the model's declaration, ⛔ not about the context actually allocated during this run.

**Proposed:** corroborate from the server log at model-load time (the runtime records the `n_ctx` it actually used) and record **both** numbers. Disagreement ⇒ ⛔ STOP.

### A-4 — `wc -c` misreads log rotation as a verdict
If the log rotates between snapshots the byte count resets or **decreases**. Under Phase 4 a decrease reads as "changed" and would be classified as premature execution — the wrong stop condition for the wrong reason.

**Proposed:** capture **inode + size** at each snapshot. An inode change is **INSTRUMENT FAILURE / NO EVIDENCE**, ⛔ never evidence of execution or of non-execution.

### A-5 — Snapshots live in `/tmp` and are never collated
Four separate `/tmp` files, no transcript, no run directory. The S3 O1 act lost its transcript head and had to recover the decisive line from a durable artifact; the lesson recorded there was *capture the transcript from its first line*.

**Proposed:** one timestamped run directory; `script(1)` (or `tee`) from the first command; concatenate every snapshot into a single record at the end. Cheap now, unrecoverable later.

---

## §4 Standing

**RUNBOOK ⛔ UNSPENT · AMENDMENTS A-1…A-5 ⛔ PROPOSED, NOT RATIFIED · PROTOCOL §1 UNEDITED · ⛔ NO HOST TOUCHED FROM THIS SESSION · ⛔ NO LANE OPENED · ⛔ NO GATE CHANGED · PRODUCTION UNTOUCHED.**
