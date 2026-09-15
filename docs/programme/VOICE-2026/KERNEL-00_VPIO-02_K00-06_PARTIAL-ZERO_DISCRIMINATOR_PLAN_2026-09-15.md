# KERNEL-00 · VPIO-02 · K00-06 built-in — PARTIAL-ZERO DISCRIMINATOR — PLANNING ACT (read-only) — 2026-09-15

**Authority:** founder adjudication of witness-02 §12 (2026-09-15): one read-only planning act; may produce a protocol; **authorizes no implementation, no instrument change, no device witness, no interruption/reset/endurance act; changes nothing in the organism, the reader law, the 0.90 criterion, the 100 ms ceiling or the route.** Everything below is design, returned for ruling.

**Question (founder, verbatim substance):** while VPIO-02 renders through `builtInSpeaker`, can `builtInMic` continue carrying an independent external acoustic signal, or are the partial-zero callbacks evidence of actual capture loss rather than attenuation/suppression associated with own playback?

## 0. What was read (nothing run on a device)

The ten fresh K00-0506 journals (`K00-0506-20260915T004738Z/journals/`, hashes verified in witness-02 §1) · `scripts/witness/k00-output-ledger.py` (frozen) · `HealthSupervisor.swift` (classification and verdict rules) · `AudioGraph.swift` (observation point, VP bypass property, tone) · `VoiceKernel.swift` (1 s aggregation, fault injection) · `HarnessView.swift` / `HarnessModel.swift` (member-visible controls) · `K00DriverTests.swift` + `k00-driver-batch.sh` (external driver seams; `--vp on|off` already forwarded to the driver, which taps the harness VP button before Enter).

## 1. Semantics census — what "digital zero" means at the seam the organism consumes

1. **Observation point.** The organism's only input is the Voice-Processing I/O unit's output on element 1, pulled by `AudioUnitRender` in the input callback (`AudioGraph.pullInput`, 480 frames = 10 ms at 48 kHz) and measured there (`rms`, `peak`). With VP on (`kAUVoiceIOProperty_BypassVoiceProcessing` = 0; read-back `bypassReadBack 0` in all ten journals; `agcReadBack -`, unreadable) this is the **post-processing** signal. There is no raw-microphone seam anywhere in the organism; a "raw vs processed" comparison inside one build is not available and would be a new subject.
2. **Classification (ratified thresholds, frozen).** `digitalZero` ⇔ `peak ≤ 1e-7`; `noiseFloor` ⇔ `rms < 1e-3`; else `signal`. **"Digital zero" is therefore a near-silence class at the consumed seam, not a proof of an empty or dropped buffer.** A callback with `rms 2.2e-8 · peak 7.8e-8` (sample 4, `input_flow healthy → suspect`) is a real buffer of very small values.
3. **Flow and verdicts.** One digital-zero callback flips `healthy → suspect`; any noise-floor/signal callback flips back to `healthy` and refreshes `lastLiveInputMs`; `input_dead` fires only when no live callback has arrived for `deadInputMs` = 2 000 ms. In this corpus the longest run of consecutive near-silence callbacks is far below that (the suspect → healthy return is 10–20 ms), so `input_dead` never approached.
4. **Aggregation.** `input_health_sample` once per ≥ 1 000 ms: `callbacks · digitalZero · noiseFloor · signal · rmsMean/Min · rmsMax · peakMax · inputFlow · route · ioRunning`. The reader's K00-06 row uses FULL rendering windows only; `digitalZero > 0` in a full window = CHARACTERIZE-06; `digitalZero == callbacks` or an `input_dead` verdict = FAIL-06; callbacks/s < 0.90 × baseline = FAIL-06.
5. **Controls that already exist, no code:** the harness VP button (inert unless idle; the driver's `setVoiceProcessing(on:)` taps it before Enter; the batch forwards `--vp off` as `TEST_RUNNER_K00_VP=off`); `Mic: enabled/disabled`; `Speaker` / `System default` output override (route stays built-in); fault toggles (synthetic-stamped, never physiology). The tone is fixed: 440 Hz, 3 s, amplitude 0.2 (`playTone(seconds:frequencyHz:)`; the harness passes only `seconds: 3.0`).

## 2. What the existing evidence already shows (read from the journals; observation, not attribution)

**2.1 The near-silence callbacks are a convergence tail inside the second stream, not a scatter.** Locating every generation-1 `healthy → suspect` transition against the two stream intervals (schedule → cancel / complete): apart from the entry `unknown → suspect → healthy` at start (3 near-silence callbacks at the very first window in every journal — the start-up shape, outside both streams), **every near-silence callback that fell inside a stream fell inside stream 2** (the 3 s stream left to complete), at offsets **S2 + 766 … + 2 965 ms**; **none fell inside stream 1** (cancelled at 1.46–1.97 s) in any journal. Three transitions in three journals lie outside both streams (−4 810 / −580 ms before stream 1 in sample 5; +1 839 and +6 173/+6 389 ms after stream 2 in samples 6, 4, 5) — isolated, not clustered.

**2.2 Post-processing input attenuates progressively during own playback, over roughly the first second of a stream.** Windows overlapping the first ~1 s of a stream read `rmsMean` ≈ 3e-4 … 2e-3 (from baselines of 1e-3 … 5e-3); windows overlapping the second and third seconds of stream 2 read `rmsMean` ≈ 2e-6 … 6e-6 with `signal` = 0 and `noiseFloor` ≈ 100–105 of ≈103 callbacks. Stream 1 is cancelled before this depth is reached, which is why its windows never carry near-silence callbacks.

**2.3 The PASS-06 / CHARACTERIZE-06 boundary among samples 3–10 is a threshold-edge effect on one continuous shape, not two physiologies.** Samples 7 and 9 (PASS-06) show the same deep attenuation (`rmsMean` 3e-6 … 6e-6, `peakMax` 7e-5 … 1.6e-4, `signal` 0) with no callback dipping below `peak 1e-7`; samples 3, 4, 5, 8, 10 (CHARACTERIZE-06) show the same attenuation with 1–42 callbacks below it. The class label depends on whether the residual's peak crosses 1e-7, not on a different behaviour. *(The frozen law is not changed by this reading; the rows keep their verdicts.)*

**2.4 Sample 1 is a genuinely different shape.** `K00-8272014d` shows **no attenuation**: rendering windows read `rmsMean` 1.1e-2 … 2.7e-2 with `signal` 58–100 of ≈103, `peakMax` up to 0.30 (baseline 0.23; every other journal's baseline `peakMax` ≤ 0.06). Its coupling row is the only ×1.03 (`rmsMax` ×1.75). Whether that is a louder room, the phone's own tone reaching the consumed seam un-cancelled (AEC not converged in that invocation), or something else, **cannot be read from the corpus**; it is the first of the ten and the only PASS-06 without attenuation. Recorded as an unexplained shape, n = 1.

**2.5 An uncontrolled independent near-end signal is already present and already vanishes.** Every journal's pre-output baseline carries `signal`-class callbacks (24–80 of ≈103 per window; `rmsMean` 1.3e-3 … 1.8e-2), i.e. ambient acoustic energy above the noise-floor threshold reaches the seam before output. During deep own-playback attenuation that ambient energy reads `signal` 0. **This is consistent with near-end suppression at the consumed seam during own playback (hypothesis A′ below) — but the ambient signal is uncontrolled, unlabeled and of unknown level, so the corpus cannot separate "the near-end is suppressed" from "the room happened to be quiet in those seconds".** That is exactly the gap the founder's question names.

## 3. Hypotheses to discriminate (kept as hypotheses)

- **A — own-playback/AEC attenuation with live capture:** the microphone captures; the VP unit removes the echo of the 440 Hz tone; an independent near-end signal still passes to the seam during rendering (perhaps attenuated).
- **A′ — near-end suppression at the consumed seam during own playback:** the microphone captures, but the VP unit's processing (residual-echo suppression / half-duplex behaviour / AGC) drives the *whole* post-processed signal, near-end included, to near-silence while the far end (own tone) is active. Not capture loss at the hardware; capture loss **at the seam the organism consumes** — which is the seam K00-06 governs ("independently observable input during output").
- **B — capture collapse:** the microphone path itself stops delivering (hardware/route/lower-layer duck): near-end absent at the seam regardless of VP processing.

The corpus is compatible with A′ and with A-at-a-quiet-moment; it does not support B (callbacks continue, `ioRunning` true, never `input_dead`, recovery to healthy within 20 ms) but cannot exclude a B-shaped duck that ends when playback ends.

## 4. Answer: can an independent physical acoustic stimulus discriminate? — YES, at the consumed seam, with existing evidence fields; the existing corpus alone cannot

The discriminating quantity is already journalled: **does a known independent near-end signal register at the seam (as `signal`-class callbacks / `rmsMean` above the no-stimulus rendering floor) inside the deep-attenuation window of stream 2, and does the answer change when VP is bypassed?** No new field, threshold or classifier is needed for the discrimination itself; what is missing is a **controlled, labelled** near-end signal and a **VP-OFF arm**. Reading law for the design (descriptive, existing classes only; no constitutional threshold coined):

| arm | VP | external stimulus | what the deep-attenuation rendering windows read | reading |
|---|---|---|---|---|
| S0 (this corpus) | on | none (ambient only) | `signal` 0 · `rmsMean` ~1e-6 · some `peak ≤ 1e-7` | baseline of the question |
| S1 | **off** (bypass 1, same unit, existing control) | none | attenuation and near-silence **absent** → the shape is the VP unit's processing (A/A′), not the capture path · **present** → below the VP unit (B-shaped) | isolates the processor |
| S2 | on | **steady, labelled, spanning the whole invocation** (baseline + both streams) | stimulus registers in baseline windows AND in deep-attenuation windows (`signal` > 0 / `rmsMean` ≥ 10× the S0 floor) → **A** · registers at baseline but **not** in deep-attenuation windows → **A′** (near-end suppressed at the seam) | the founder's question |
| S3 (only if S2 reads A′) | off | same stimulus | registers during rendering → A′ confirmed as the VP unit's policy · does not register → B at the capture path | decides A′ vs B |

The comparison is window-level (baseline windows vs full rendering windows of the same invocation, existing reader partition), so **no millisecond alignment between the Mac and the phone journal is required** if the stimulus spans the entire invocation. Validity precondition per invocation (existing fields): the stimulus must produce `signal`-class callbacks in ≥ 2 healthy pre-output baseline windows; otherwise the row is UNMEASURED for this question (the stimulus was too weak to be seen at all) — this is a validity rule for the new question, not a change to the K00-06 reader.

## 5. Smallest lawful next witness

**5.1 Arm S1 needs NOTHING new.** `k00-driver-batch.sh K00-0506-VPOFF 10 --act output --cancel-at 1000 --settle 2 --vp off --mode L --subject vpio-02` on the installed `.vpio02` with the `83a382a14` instrument: the driver taps `Voice processing: OFF (control run)` before Enter (existing helper), the organism starts the same unit with bypass = 1 (`vp_properties_set bypassRequested 1`, read-back journalled), the frozen readers produce the same rows. Its own stratum, never pooled with S0; K00-05 rows from it are evidence, not a second K00-05 population (K00-05 is CLOSED). Cost ≈ 11 min. **Recommended first**, because it can already settle "processor vs capture path" for the near-silence shape.

**5.2 Arms S2/S3 need exactly one addition, outside the organism, the driver and the readers:** a labelled external acoustic source spanning each invocation. Two shapes, smallest first:
- **(a) Founder-placed continuous source, no instrument change:** a second device or the Mac plays a steady known sound (e.g. a fixed-level tone or band noise, ≠ 440 Hz so it is distinguishable from own playback if ever needed) continuously for the whole batch, at a fixed distance; custody = founder attestation of source · level · distance · start/stop; the validity precondition in §4 proves per invocation that the stimulus is seen at baseline. Weakest custody, zero code.
- **(b) Batch-orchestrated source (recommended for custody):** a batch flag (e.g. `--stimulus <audio file>`) that starts playback on the Mac's speaker immediately before `run_test` and stops it after export, recording start/stop epoch and the file's SHA-256 in `sample-timing.tsv`/the ledger header. Touches `k00-driver-batch.sh` only (a new SHA, driver-only compile unaffected since the driver does not change; gate pins must admit the batch delta). The playback verb must be read from the Mac (`afplay` is the usual macOS candidate; **not asserted here** — its presence and flags are a founder read, never a guess). The organism, harness, driver, `k00-ledger.py`, `k00-output-ledger.py`, `k00-reinstall.sh` stay byte-frozen.

**5.3 Not needed and not proposed:** a raw-microphone tap, a second audio unit, any change to thresholds (1e-7 / 1e-3 / 0.90 / 100 ms), a new K00-06 class, STT, cognition, route change, interruption/reset, endurance, a retry of S0.

**5.4 Population and reading, for the ruling:** N = 10 per arm (same shape as K00-0506); arms sequenced S1 → S2 → (S3 only on A′); predeclared readings per §4 with the validity precondition; every row also produces the frozen K00-06 row (evidence, never pooled into the S0 CHARACTERIZE/INCOMPLETE reading and never a substitute for the K00-06 PASS condition, which remains 10/10 PASS-06 on a built-in population under VP ON — this act does not decide K00-06; it decides what the partial-zero shape *is*). Sample-1-shaped invocations (no attenuation) are recorded as their own shape, not excluded.

## 6. What this act returns and what it does not open

Returned: the semantics census (§1), the corpus reading (§2 — convergence tail in stream 2, threshold-edge boundary, sample-1 exception, ambient near-end vanishing), the hypothesis set (§3), the discrimination design on existing fields (§4), and the smallest witnesses (§5). **Nothing implemented, compiled, installed, launched, played or sampled.** Rulings needed before any act: (1) whether S1 (VP-OFF output act, existing instrument) opens as a witness, with its own preflight and authority string; (2) whether S2 opens and in which shape (5.2 a or b); (3) the reading law of §4 ratified as witness criteria (not constitutional); (4) which seam K00-06 governs — this plan assumes the consumed (post-VP) seam, since it is the organism's only input.

**Standing (unchanged by this plan):** K00-04 PASS · K00-05 PASS · CLOSED · K00-06 built-in CHARACTERIZE ONLY · INCOMPLETE · organism `ac12dedf4` FROZEN · `.vpio02` installed, untouched · `.vpio01` FROZEN · K00/R1 UNTOUCHED · new instrument / device witness / route / interruption / reset / endurance NOT AUTHORIZED · KERNEL-00 NOT ACCEPTED.


## 7. Founder ruling (2026-09-15) — plan ACCEPTED · K00-06 seam RULED · §4 reading law RATIFIED (one amendment) · S1 OPEN after record pin · S2 shape SELECTED, implementation HELD · S3 conditional, not open

**7.1 K00-06 governs the consumed seam — RULED.** K00-06 asks whether usable input remains available to the organism while output renders — the path `VoiceProcessingIO output → AudioUnitRender → organism input callback` — not whether a hypothetical raw microphone upstream keeps capturing. `hardware mic may still capture ≠ K00-06 satisfied`. Hypothesis A′ therefore matters architecturally: a controlled independent near-end source reaching the hardware but suppressed before the consumed seam means duplex at the organism boundary is not yet demonstrated. No raw-mic tap is authorized or needed.

**7.2 §4 reading law — RATIFIED as witness criteria only** (never constitutional, never a change to `k00-output-ledger.py`): N = 10 per arm · valid stimulus row = the independent source visible in ≥ 2 healthy pre-output baseline windows · comparison = baseline windows vs FULL rendering windows within the same invocation · existing evidence only (`callbacks · digitalZero · noiseFloor · signal · rmsMean/rmsMax/peakMax · inputFlow · ioRunning`) · no ms Mac↔phone alignment when the stimulus spans the full invocation. **Amendment:** `rmsMean ≥ 10× the S0 floor` is NOT a deciding threshold — descriptive only (S0 carries the unexplained sample-1 shape and uncontrolled room energy; a numerical boundary from it would be a manufactured threshold). The clean S2/S3 discriminator is the existing classification: stimulus seen at baseline ∧ `signal`-class input persists through the relevant full rendering windows → **A-consistent**; stimulus seen at baseline ∧ `signal`-class input disappears during deep rendering while callbacks/`ioRunning` continue → **A′-consistent**; stimulus not visible at baseline → **UNMEASURED** for the discriminator; mixed rows → **CHARACTERIZE**, never forced. The existing 3 PASS / 5 CHARACTERIZE / 2 UNMEASURED K00-06 population is unchanged.

**7.3 S1 — OPEN after this record is pinned.** Purpose, narrow: *does the progressive near-silence/attenuation shape remain when Voice Processing is bypassed on the same VPIO unit?* Not an attempt to earn K00-06 PASS; cannot reopen K00-05 (CLOSED). Population: stratum `K00-0506-VPOFF` · N 10 · instrument `83a382a1455161996d499f30cbf00504bbd0332a` · organism `ac12dedf4b7b4efc9855c08bb4285a704e7039f1` · subject vpio-02 · act output · cancel-at 1000 ms · settle 2 s · **VP OFF** · Mode L · route unchanged `builtInSpeaker/builtInMic`. No code: `--vp off` exists end-to-end (batch → `TEST_RUNNER_K00_VP=off` → driver taps `Voice processing: OFF (control run)` before Enter → the same VPIO unit journals `vp_properties_set bypassRequested 1` + read-back). **S1 reading (no new PASS/FAIL taxonomy):** return the frozen K00-06 rows plus — VP-OFF own-playback clearly observable at the consumed input with callbacks/`ioRunning` intact → processor-dependent suppression strongly supported, B not supported by S1 · deep near-silence still appears with VP bypassed → B-shaped/below-VP possibility remains, no causal closure from S1 · mixed → CHARACTERIZE. S1 has no labelled near-end source, so absence of ambient energy cannot prove capture collapse.

**7.4 S2 — shape SELECTED: §5.2(b) batch-orchestrated source (custody: file hash + per-sample playback start/stop evidence beats memory of a second device's placement); organism, harness, driver and both readers stay frozen. Implementation HELD.** Sequence: S1 witness → independent reading / founder adjudication → read-only Mac playback-capability census (the playback verb is discovered, not assumed; no `afplay` claim ratified) → exact S2 batch-only design → gate → new orchestration SHA → S2 authority. **S3 conditional, not open.** No S1 result silently opens S2.

## 8. S1 — pinned before it is live (custody, preflight, authority, invocation)

**Source custody — fresh detached worktree** (the §10.10 batch worktree `/private/tmp/k0506-batch-83a382a14` already exists and is not reused; a pre-existing path is STOP for `worktree add`):

```bash
git -C /Users/soullab/MAIA-SOVEREIGN fetch origin claude/voice-2026-census-01
git -C /Users/soullab/MAIA-SOVEREIGN worktree add --detach /private/tmp/k0506-vpoff-83a382a14 83a382a1455161996d499f30cbf00504bbd0332a
cd /private/tmp/k0506-vpoff-83a382a14
```

**One read-only preflight immediately before the batch** (the §10.10 custody law on the new worktree; the `pgrep` pattern `k00-driver-batch.sh K00-0506` also matches a running `K00-0506-VPOFF` batch by design; paste as a block):

```bash
cd /private/tmp/k0506-vpoff-83a382a14
HEAD_NOW="$(git rev-parse HEAD)"
echo "HEAD=$HEAD_NOW"
if [ "$HEAD_NOW" != "83a382a1455161996d499f30cbf00504bbd0332a" ]; then
  echo "STOP: wrong instrument HEAD"
  exit 90
fi

git diff --quiet 83a382a1455161996d499f30cbf00504bbd0332a -- \
  ios/VoiceKernelDriver \
  scripts/witness/k00-driver-batch.sh \
  scripts/witness/k00-ledger.py \
  scripts/witness/k00-output-ledger.py \
  scripts/witness/k00-reinstall.sh
DIFF_RC=$?
echo "PREFLIGHT_DIFF_RC=$DIFF_RC"
if [ "$DIFF_RC" -ne 0 ]; then
  echo "STOP: witness surface differs"
  exit 91
fi

if pgrep -fl 'k00-driver-batch.sh K00-0506' > /private/tmp/k0506-vpoff-preflight-other-batches.txt; then
  cat /private/tmp/k0506-vpoff-preflight-other-batches.txt
  echo "STOP: another K00-0506 batch process exists"
  exit 92
else
  echo "OTHER_K00_0506_BATCHES=0"
fi

DEV=A0736AC8-793B-516F-AC72-C076DB6CEE38
PF="docs/programme/VOICE-2026/driver-ledger/K00-0506-VPOFF-preflight-$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$PF"

xcrun devicectl device info apps \
  --device "$DEV" \
  --bundle-id life.soullab.voicekernel.vpio02 \
  --json-output "$PF/apps.json" >/dev/null
APPS_RC=$?
echo "APPS_READ_RC=$APPS_RC"
if [ "$APPS_RC" -ne 0 ]; then
  echo "STOP: apps listing unreadable"
  exit 93
fi

CONTAINER_HITS="$(grep -c 'E3B88028-A10F-46B1-AB27-CF0A1F83FB78' "$PF/apps.json")"
echo "E3B88028_CONTAINER_HITS=$CONTAINER_HITS"
if [ "$CONTAINER_HITS" -lt 1 ]; then
  echo "STOP: ruled VPIO-02 container not found"
  exit 94
fi

xcrun devicectl device info processes \
  --device "$DEV" \
  --json-output "$PF/processes.json" >/dev/null
PROCESS_RC=$?
echo "PROCESS_READ_RC=$PROCESS_RC"
if [ "$PROCESS_RC" -ne 0 ]; then
  echo "STOP: process listing unreadable"
  exit 95
fi

HCOUNT="$(python3 - "$PF/processes.json" <<'PY'
import json,re,sys
s=json.dumps(json.load(open(sys.argv[1])))
rows=re.findall(r'\{"executable": "file://([^"]+)", "processIdentifier": (\d+)\}', s)
hits=[(p,pid) for p,pid in rows if p.rsplit('/',1)[-1]=='VoiceKernelHarness']
print(len(hits))
PY
)"
echo "VoiceKernelHarness processes: $HCOUNT"
if [ "$HCOUNT" != "0" ]; then
  echo "STOP: harness process present"
  exit 96
fi

echo "PREFLIGHT_CLEAN=$PF"
```

Proceed only on: HEAD exact `83a382a14…` · `PREFLIGHT_DIFF_RC` 0 · `OTHER_K00_0506_BATCHES` 0 · `APPS_READ_RC` 0 · `E3B88028_CONTAINER_HITS` ≥ 1 · `PROCESS_READ_RC` 0 · `VoiceKernelHarness processes` 0. Anything else is STOP; no normalization or corrective device act.

**S1 execution authority — verbatim (2 389 UTF-8 bytes, no apostrophe; reproduced byte-for-byte from the ruling, sha256 `4e77a98214c93f7f…`; an invocation input, never reconstructed from this record):**

```text
FOUNDER-AUTH: VPIO-02 K00-06 partial-zero discriminator S1 only; execute exactly one N=10 K00-0506-VPOFF automated output witness population on the existing VPIO-02 artifact installed by FIRST-INSTALL-02, using instrument 83a382a1455161996d499f30cbf00504bbd0332a, subject vpio-02, bundle life.soullab.voicekernel.vpio02, Mode L, voice processing OFF, act output, settle 2 seconds, cancel the first 3-second known-PCM tone at 1000 ms, then exercise the second 3-second tone to completion. Purpose is mechanism discrimination only: determine whether the progressive attenuation and partial digital-zero shape observed with voice processing ON remains when voice processing is bypassed on the same Voice-Processing I/O unit. This population cannot reopen K00-05, cannot by itself earn K00-06 PASS, and cannot alter any frozen K00-06 verdict, threshold, reader rule or constitutional criterion. Execute only after the immediately preceding ruled read-only preflight returns HEAD exactly 83a382a1455161996d499f30cbf00504bbd0332a, witness-surface diff rc 0, the installed life.soullab.voicekernel.vpio02 subject resolving to container E3B88028-A10F-46B1-AB27-CF0A1F83FB78, and zero VoiceKernelHarness processes. If any preflight field is unreadable or different, STOP before sampling and return the preflight evidence. Do not normalize state, terminate a harness, reinstall, overwrite, change source, or take a corrective device act. If preflight is clean, finish all ten declared invocations unless the frozen instrument itself aborts. No pilot, no top-up, no automatic rerun, no source change, no reinstall, no threshold change, no fault injection, no manual intervention, no route-change act, no interruption act, no media-services-reset act, no endurance act, no unified-log experiment, no mutation of the frozen .vpio01 artifact, and no historical K00/R1 mutation. The installed .vpio02 app under test must not be rebuilt, replaced or reinstalled. The batch may regenerate and signed-build only its external driver as its frozen orchestration requires. Return the complete preflight, journals, frozen entry rows, frozen output-reader rows, driver markers and batch evidence for independent reading. Report the VP bypass requested and read-back evidence from every valid journal. S1 evidence is descriptive mechanism evidence only. No outcome from S1 authorizes S2, S3 or any subsequent act.
```

**Exact invocation — same shell, immediately after `PREFLIGHT_CLEAN` (the complete string is carried; an abbreviated rendering is not an invocation):**

```bash
K00_DEVICE=A0736AC8-793B-516F-AC72-C076DB6CEE38 \
K00_XCODE_DEST=00008140-00163D9922E0801C \
K00_EXEC_AUTHORITY='FOUNDER-AUTH: VPIO-02 K00-06 partial-zero discriminator S1 only; execute exactly one N=10 K00-0506-VPOFF automated output witness population on the existing VPIO-02 artifact installed by FIRST-INSTALL-02, using instrument 83a382a1455161996d499f30cbf00504bbd0332a, subject vpio-02, bundle life.soullab.voicekernel.vpio02, Mode L, voice processing OFF, act output, settle 2 seconds, cancel the first 3-second known-PCM tone at 1000 ms, then exercise the second 3-second tone to completion. Purpose is mechanism discrimination only: determine whether the progressive attenuation and partial digital-zero shape observed with voice processing ON remains when voice processing is bypassed on the same Voice-Processing I/O unit. This population cannot reopen K00-05, cannot by itself earn K00-06 PASS, and cannot alter any frozen K00-06 verdict, threshold, reader rule or constitutional criterion. Execute only after the immediately preceding ruled read-only preflight returns HEAD exactly 83a382a1455161996d499f30cbf00504bbd0332a, witness-surface diff rc 0, the installed life.soullab.voicekernel.vpio02 subject resolving to container E3B88028-A10F-46B1-AB27-CF0A1F83FB78, and zero VoiceKernelHarness processes. If any preflight field is unreadable or different, STOP before sampling and return the preflight evidence. Do not normalize state, terminate a harness, reinstall, overwrite, change source, or take a corrective device act. If preflight is clean, finish all ten declared invocations unless the frozen instrument itself aborts. No pilot, no top-up, no automatic rerun, no source change, no reinstall, no threshold change, no fault injection, no manual intervention, no route-change act, no interruption act, no media-services-reset act, no endurance act, no unified-log experiment, no mutation of the frozen .vpio01 artifact, and no historical K00/R1 mutation. The installed .vpio02 app under test must not be rebuilt, replaced or reinstalled. The batch may regenerate and signed-build only its external driver as its frozen orchestration requires. Return the complete preflight, journals, frozen entry rows, frozen output-reader rows, driver markers and batch evidence for independent reading. Report the VP bypass requested and read-back evidence from every valid journal. S1 evidence is descriptive mechanism evidence only. No outcome from S1 authorizes S2, S3 or any subsequent act.' \
scripts/witness/k00-driver-batch.sh K00-0506-VPOFF 10 \
  --act output \
  --cancel-at 1000 \
  --settle 2 \
  --vp off \
  --mode L \
  --subject vpio-02
```

The batch does not consume `K00_EXEC_AUTHORITY` mechanically; it is invocation provenance, not a runtime flag. Evidence (preflight directory · `K00-0506-VPOFF-<stamp>/` complete · `output-ledger.md` · journals · logs) returns on a `feature/*` branch → §9. Read here: every valid journal's `vp_properties_set` (`bypassRequested 1`, read-back) and `graph_started voiceProcessing`, the frozen entry and output rows, and the §7.3 discriminator reading per invocation. **S1 authorizes nothing downstream.**

**Standing at the pin:** K00-04 PASS · K00-05 PASS · CLOSED · K00-06 built-in CHARACTERIZE ONLY · INCOMPLETE · K00-06 seam = consumed post-VP input (RULED) · §4 criteria RATIFIED (10×-floor amendment) · **S1 OPEN after record pin · S1 new code NONE** · S2 shape SELECTED (batch-orchestrated) · S2 implementation HELD · S2 witness NOT AUTHORIZED · S3 CONDITIONAL · NOT OPEN · organism FROZEN · `.vpio02` untouched · `.vpio01` FROZEN · K00/R1 UNTOUCHED · route/interruption/reset/endurance NOT AUTHORIZED · KERNEL-00 NOT ACCEPTED.
