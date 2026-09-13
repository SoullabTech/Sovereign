# DRIVER-01 · P5B0-POSTCLEAN-CONTROL — the matched P5-B0 baseline on the cleaned container, N=30 (Mode L)

Lane: `VOICE-2026` · `KERNEL-00` · `DRIVER-01` → `PHASE-A-REPRO-01` sequence step 1 (plan §5). Subject `24a6fcfa1` (P5-B0, dylib `CC0D3604-7902-373E-A2BB-2C093D9BF804`), the Stage-B install (seq 5208, `last reinstall: 20260913T145025Z`, **no reinstall**). The only changed condition against Stage B is the cleaned container. Evidence commit `082c23084` (ledger branch), cherry-picked; ledger `driver-ledger/P5B0-POSTCLEAN-CONTROL-20260913T164252Z/`.

**Status of this record: CONTROL EXECUTED · VERIFIED HERE · READ. Phase-A build remains HELD; opening it is a founder act (plan §8).**

---

## §1 The purge that precedes it — VERIFIED (`purge-20260913T164023Z`)

Founder fired the armed purge under the §11 ruling. Artefacts received and re-read here: `D: archive RECONCILED` · `E:` deep probe documents `--remove-existing-content` · `preimage: reported total=154 · file rows=154 · non-journal rows=0 · distinct journal rows=154 · PASS` · `.archive-set` = `.live-set` (0 differing lines) · `F: rc=0` · `.listing-after`: `0 files`, zero table rows · `## PURGE VERIFIED — tmp/ reports zero files; 154 journals removed, all held in container-archive/pre-purge-20260913T154847Z`. Housekeeping steps A–H complete as ruled; nothing but `tmp/kernel00-*.jsonl` was touched; no `uninstall`.

## §2 Result — 29 valid audio samples · 1 infrastructure row

`k00-driver-batch.sh P5B0-POSTCLEAN-CONTROL 30 --mode L` (subject `p5b0`, VP ON, hold 15 s), 16:42:53Z → 17:11:35Z.

| class | count |
|---|---|
| gen-1 listen | **16** (411–529 ms; 15 of 16 within 411–463 ms) |
| failure then recovery | **6** (first listening in gen 3 ×3 at 3.7–3.9 s · gen 4 at 6.8 s · gen 5 at 6.5 s · gen 7 at 14.0 s) |
| failure then degradation | **3** (gen 7, 7, 8) |
| other observed shape | **4** (still `recovering` at export, gen 8, 296–301 records) |
| DRIVER/INFRASTRUCTURE FAILURE | 1 — **sample 17**: `xcodebuild` rc=65 after 259 s, `IDELaunchCoreDeviceWorker … An error occurred when reading or writing data`, `** TEST EXECUTE FAILED **` — the runner could not launch the test host; the harness never launched; no journal; not the H2 shape (H2 = passed test, no export file) |

Sequence `OOFLFLLFFLLFLFFL-LLFLLLFLLLOLO`.

## §3 Verification here (all 29)

SHA-256 as ledgered 29/29 · cold (`didBecomeActive` first, generation 0) 29/29 · **13-step** gen-1 trace, no `input_format_before_vp` 29/29 (subject confirmed) · VP ON (`vp_enable_return readBack true`) 29/29 · **13 failures = 13 §3 0 Hz refusals**, exactly one each · 0 media-services resets · 0 interruptions · max generation 8 · `journals/not-a-sample/` empty · the container began this batch at zero, so every journal is this batch's own.

**O5 held with one exception.** 12 of 13 failures show gen-1 `is_running_immediate` TRUE then zero callbacks (the A/B shape). Sample 15 (`K00-83187756`) shows gen-1 `is_running_immediate` **FALSE** — `graph_started` at 368 ms, `os_configuration_change` at 474 ms, `entry_timeout` at 1938 ms, refusal at 2683 ms — the run-2/3/4-era "never running" reading, first time on the automated stratum. One row; recorded, not attributed.

## §4 A beside B beside the control — never pooled

| | Stage A (same install, seq 4224) | Stage B (reinstall, seq 5208) | **Control (same install as B, cleaned container)** |
|---|---|---|---|
| valid samples | 29 | 28 | 29 |
| gen-1 listen | 14 | 15 | **16** |
| failure then recovery | 9 | 10 | 6 |
| failure then degradation | 6 | 1 | 3 |
| other (recovering at export, gen 8) | 0 | 2 | 4 |
| infrastructure rows | 1 | 2 | 1 |
| gen-1 listen latency | 419–517 ms | 409–441 ms | 411–529 ms |
| refusals = failures | 15 = 15 | 13 = 13 | 13 = 13 |
| container at batch start | ~40 exports | ~130 exports | **0 exports** |

**Gen-1 axis:** 14/29 · 15/28 · 16/29. The cleaned container did not move whether generation 1 takes.

**Failure tail** (13 failures each on B and C): B → 10 recovered / 1 degraded / 2 still recovering at export; C → 6 recovered / 3 degraded / 4 still recovering. Descriptively the tail is heavier on the cleaned container; at N=30 this is not separated from run-to-run variation (A's tail was heavier still: 6 degraded of 15), and the record attributes it to nothing.

## §5 O9 — listening reached in recovery is often not held (new evidence field, measured retroactively on A and B)

The classifier names `failure then recovery` by the *first* listening transition. Reading the whole floor history: of the recovery rows, listening was **lost again later** (any non-listening floor after it) in A 4 of 9 · B 5 of 10 · **C 5 of 6**, and the floor was **listening at export** in A 5 of 9 · B 5 of 10 · **C 1 of 6**. Example (`K00-83187756`, C sample 15): listening gen 3 at 3.86 s → `recovering` 104 ms later (`input_dead`) → listening gen 6 at 10.03 s → `recovering` 106 ms later → gen 8 at export. Every gen-1 listen on all three strata (14 · 15 · 16) held listening to export. So the strata differ less in *whether* recovery reaches listening than in whether a recovered generation *keeps* it — a fact the class vocabulary did not carry and now does. No mechanism is read from it. (Instrument note: the classifier is unchanged; `listeningHeldAtExport` / `listeningLostLater` are candidates for evidence fields, not classes, and would be a C-D9 for a founder to admit.)

## §6 Reading against the predeclared table (`PHASE-A-REPRO-01_PLAN` §6)

Row applied: **"control ≈ A/B"** on the gen-1 axis (16/29 beside 14/29 and 15/28). The cleaned container did not move the picture that the Phase-A reproduction will be read against. The recovery-tail and O9 differences are recorded as observations and carried into that reading as context, not as a baseline shift. Mechanism claim: NONE.

## §7 What this opens — a founder act

Plan §5 step 1 is finished and read; step 2 (build `PHASE-A-REPRO-01` per plan §2–§4) is *"executed only on a further founder act after that reading"* (plan §8). The precondition the founder set — *"we do not build the answer before we know what cleaning the container did to the control"* — is now answerable: on the gen-1 axis it did nothing measurable; on the recovery tail it may have, at a size that cannot say. The build is therefore **eligible**, not opened.

## §8 Standing

PURGE VERIFIED (154 archived, tmp/ = 0) · P5B0-POSTCLEAN-CONTROL EXECUTED · VERIFIED · READ (16/29 gen-1) · O9 recorded · PHASE-A-REPRO-01 BUILD HELD → eligible on founder act · VoiceKernel + harness FROZEN · mechanism NONE · B2 HOLD · E1–E4 HELD.

## §5.1 C-D9 — O9 fields ADMITTED (founder, 2026-09-13); retrospective derivation from the journals only

Ruling, verbatim: *"ADMIT the two fields as evidence … with definitions pinned before retrospective calculation. `listeningHeldAtExport`: true iff listening was reached AND the authoritative floor/state immediately at export is still listening. `listeningLostLater`: true iff listening was reached AND after that first listening state, a later authoritative floor transition leaves listening before export. Important: these are not mutually exclusive. … Do not infer continuity merely from `listeningHeldAtExport`. CLASSIFICATION UNCHANGED · K00 PASS/FAIL LAW UNCHANGED · RECOVERY POLICY UNCHANGED · THRESHOLDS UNCHANGED · MECHANISM CLAIM NONE. … retrospectively derive the two fields across A, B, and the post-clean control, from the journals only, and record the result as C-D9 evidence enrichment. Do not reclassify any row."*

Instrument: `k00-ledger.py` now emits both fields in the evidence column (authoritative floor at export = the journal's last `floor_transition`; a journal that never reached listening carries neither). Regression: all 118 ledgered rows across A, authorized B, attempts 1 and 3, and the control classify identically. No produced ledger was edited; the enrichment is this table, derived here from the journals:

| stratum · class | n | heldAtExport | lostLater | both (lost, regained) | never reached |
|---|---|---|---|---|---|
| **A** gen-1 listen | 14 | 14 | 0 | 0 | 0 |
| A failure then recovery | 9 | 5 | 4 | 0 | 0 |
| A failure then degradation | 6 | – | – | – | 6 |
| **B** gen-1 listen | 15 | 15 | 0 | 0 | 0 |
| B failure then recovery | 10 | 5 | 5 | 0 | 0 |
| B degradation · other | 1 · 2 | – | – | – | 3 |
| **Control** gen-1 listen | 16 | 16 | 0 | 0 | 0 |
| Control failure then recovery | 6 | 1 | 5 | 0 | 0 |
| Control degradation · other | 3 · 4 | – | – | – | 7 |
| *(PRE-AUTH attempt 3, observational, not counted)* recovery | 9 | 8 | 3 | **2** | 0 |

Read descriptively: every gen-1 listen on every stratum held to export; recovered listening held in 5/9 · 5/10 · 1/6; the only lose-then-regain rows (both fields true) are two in the PRE-AUTH attempt-3 batch, which is why the fields are not mutually exclusive. Founder framing carried as the open question, not a defect theory: *"the problem may not only be whether a failed start can recover into listening; it may also be whether recovered listening is stable once reached."* Nothing repaired; nothing authorized by this section.
