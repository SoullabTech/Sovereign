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

## 9. S1 EXECUTED · RECEIVED · READ HERE — VP-OFF output witness (`K00-0506-VPOFF-20260915T012817Z`) — descriptive mechanism evidence · adjudication OWED

### 9.1 Custody

Evidence `36b9865a6078ba2bc84c63046ff772265c883628` (branch `feature/k00-0506-vpoff-s1-evidence-20260915`) cherry-picked `-x` → `2eef7d500`: 69 files = 66 batch files + 2 preflight files (`K00-0506-VPOFF-preflight-20260915T012701Z/`) + `EXECUTION-TRANSPORT-NOTE.txt`. Five core hashes recomputed here = founder's (`ledger.md` `27235a2a…` · `output-ledger.md` `5609f03d…` · `batch.log` `bfadc9ae…` · `build-for-testing.log` `3a1752e1…` · `sample-timing.tsv` `c37291b9…`); 10/10 journal hashes = ledger rows. Preflight files: `apps.json` carries `E3B88028…` (1 hit); `processes.json` 271 rows, `VoiceKernelHarness` 0. Batch: signed `TEST BUILD SUCCEEDED` ×1 (team `ZVK2X646Z2`, destination `00008140-…`), xctestrun from the S1 worktree's own `.derived`, 10/10 `ledgered` + `output rows read`, 0 terminate-only, 0 abort, 0 infrastructure, `batch complete` 01:40:22Z; every runner log `testOutputSample passed`, one reveal swipe each, hierarchy path never taken, Play 1 · Cancel · Play 2 markers ×10. Both readers reproduced here: entry rows identical; output rows identical modulo carriage-return bytes in the driver-marker lines (as in §10.11).

**Transport deviation (founder-disclosed, preserved in the evidence commit's `EXECUTION-TRANSPORT-NOTE.txt`, not absorbed):** the remote safety layer refused the pinned preflight block as one interactive payload; the same single logical preflight was completed as HEAD / diff / concurrent-batch check in the original shell plus exactly one apps read and exactly one process read in helper shells, all into the one preflight directory; no read repeated, no normalization, no termination, no reinstall, no corrective act; the full 2 389-byte authority then submitted once and exactly one batch ran. A custody-transport fact for the founder's ruling; the readings themselves are clean.

### 9.2 What the ten journals show (read here)

| # | session | bypass requested / read-back | `graph_started.voiceProcessing` | cancel − last non-silent | completion | near-silence callbacks inside any stream | full rendering windows: `digitalZero` · `signal` of ≈103 · `rmsMean` |
|---|---|---|---|---|---|---|---|
| 1 | `K00-558df5b2` | 1 / 1 | false | 5 ms | 144 000 | 0 | 0 · 103 · 6.1e-2 … 6.8e-2 |
| 2 | `K00-50f5c8ce` | 1 / 1 | false | 4 ms | 144 000 | 0 | 0 · 101–103 · 6.0e-2 … 6.9e-2 |
| 3 | `K00-51c48f02` | 1 / 1 | false | 4 ms | 144 000 | 0 | 0 · 104 · 6.3e-2 … 7.3e-2 |
| 4 | `K00-822ea2d0` | 1 / 1 | false | 9 ms | 144 000 | 0 | 0 · 98–104 · 4.1e-2 … 7.2e-2 |
| 5 | `K00-8b4af32f` | 1 / 1 | false | 4 ms | 144 000 | 0 | 0 · 99–103 · 6.2e-2 … 7.4e-2 |
| 6 | `K00-10b8490c` | 1 / 1 | false | 6 ms | 144 000 | 0 | 0 · 96–103 · 6.1e-2 … 7.3e-2 |
| 7 | `K00-71c8f1af` | 1 / 1 | false | 1 ms | 144 000 | 0 | 0 · 92–103 · 5.7e-2 … 7.4e-2 |
| 8 | `K00-26ae5003` | 1 / 1 | false | 3 ms | 144 000 | 0 | 0 · 103–104 · 6.5e-2 … 6.9e-2 |
| 9 | `K00-f68d1971` | 1 / 1 | false | 9 ms | 144 000 | 0 | 0 · 103 · 6.5e-2 … 7.3e-2 |
| 10 | `K00-0c16ff90` | 1 / 1 | false | 5 ms | 144 000 | 0 | 0 · 101–104 · 6.3e-2 … 6.9e-2 |

Entry: 10 × `gen-1 listen` (326–441 ms), cold ×10, 14-step trace ×10, `ioRunning` true throughout, 0 refusals/interruptions/resets, `input_dead` never. **VP bypass evidence:** `vp_properties_set bypassRequested 1 · bypassReadBack 1 · status 0` and `graph_started voiceProcessing false` in every journal. **The near-silence shape is absent under bypass:** the only `healthy → suspect` transition in every journal is the entry `unknown → suspect → healthy` (one `digitalZero` callback in the first window, the start-up shape); **zero near-silence callbacks inside either stream in all ten**, `digitalZeroTotal 0` in every full rendering window, no progressive attenuation. Instead the consumed input **during rendering rises to `rmsMean` ≈ 0.06–0.07 with `signal` ≈ 103 of ≈103 callbacks — ×10 to ×55 the pre-output baseline (baselines 1.2e-3 … 6.0e-3)**: with the processor bypassed, the phone's own 440 Hz tone reaches the consumed seam un-cancelled and dominates it. Callbacks continued at 99.0–100.2/s throughout. (Same-family fact for the record: K00-05 rows 10/10 PASS-05 cancel ∧ 10/10 PASS-05 completion, handle-exact, cancel → last non-silent 1–9 ms; evidence only — K00-05 is CLOSED and this population cannot reopen it.)

### 9.3 Frozen K00-06 rows (as produced; descriptive here, never a K00-06 adjudication)

**7 PASS-06 · 2 UNMEASURED-06 (rows 2 and 8, one full rendering window) · 1 FAIL-06 (row 1) · 0 CHARACTERIZE-06.** Row 1's FAIL-06 fired on the reader's independent-families falsifier: `output-health family absent beside the input window at t=1037764041`. Read from the journal: that `input_health_sample` (seq 70) is stamped at the **same millisecond** as `stream_complete` (seq 71, `framesRendered 144000`); the reader counts a window as a full rendering window when its end ≤ the interval end, so an exact coincidence makes the last window "full" while the output family's record at that tick is `stream_complete`, which the reader's family check (`output_render_sample` within 250 ms, line 168) does not admit. Checked across both populations: near-coincidences (window end within 250 ms after completion) occur in 8 of 20 journals and are never counted full because the window ends *after* the completion; **only the exact-equality case (S1 row 1) is counted full and fails.** Callback rate 99.0/s, `digitalZero` 0, `input_dead` never, the stream rendered to 144 000/144 000 in that row. **C-D22 candidate (reader-law boundary, NOT applied; row stays FAIL-06 as produced):** a full rendering window whose end coincides with `stream_complete` has its output-family evidence in `stream_complete` rather than `output_render_sample`. Whether the rule admits `stream_complete` as the family record at the boundary is a founder ruling on the frozen reader; under the S1 reading law this row is descriptive mechanism evidence either way.

### 9.4 S1 discriminator reading (§7.3 law, no new taxonomy)

**Own playback is clearly observable at the consumed input with voice processing bypassed, callbacks and `ioRunning` intact, in 10/10 invocations; the deep near-silence/attenuation shape does not appear in any of the ten.** Under §7.3 that is the first reading: **processor-dependent suppression strongly supported; B (capture collapse below the VP unit) not supported by S1.** The second reading (deep near-silence persisting under bypass) is not observed in any row; the population is not mixed. Bounded as ruled: S1 has no labelled near-end source, so it does not show that an *independent* near-end signal survives with VP ON — it shows that the near-silence during own playback is produced by the Voice-Processing unit's processing (the same seam reads the un-cancelled own tone at ×10–55 baseline when that processing is bypassed). Two corollaries, descriptive: (i) with VP ON the seam reads near-silence during own playback; with VP OFF it reads the own tone at full strength — neither state demonstrates independent near-end availability at the seam, which remains S2's question under the ratified §7.2 criteria; (ii) the VP-ON `digitalZero` callbacks (peak ≤ 1e-7) were the tail of the processor's suppression, not a capture path fault — consistent with §2.3 and now supported by a bypass control rather than inferred.

### 9.5 Standing after S1 (adjudication owed)

S1 authority SPENT (one batch, 10/10). K00-04 PASS · K00-05 PASS · CLOSED · K00-06 built-in CHARACTERIZE ONLY · INCOMPLETE (the 3/5/2 VP-ON population unchanged; S1 rows are mechanism evidence, never pooled) · S1 READ: processor-dependent suppression strongly supported, B not supported · C-D22 candidate returned (reader boundary; no change made) · transport deviation returned · S2 shape SELECTED, implementation HELD (next lawful act if ruled: the read-only Mac playback-capability census; verb discovered, never assumed) · S3 conditional, not open · organism FROZEN · `.vpio02` untouched · `.vpio01` FROZEN · K00/R1 UNTOUCHED · route/interruption/reset/endurance NOT AUTHORIZED · KERNEL-00 NOT ACCEPTED. **Returned for ruling:** S1 acceptance as read · C-D22 · the transport deviation · whether the Mac playback-capability census opens.

### 9.6 C-D23 — gate maintenance (C-D19/C-D21 shape), gate stopped the commit correctly

The gate run before this record commit was RED on the corpus-regression test: the ten S1 journals fell into the "engine-era" partition and read `gen-1 listen` under vpio-02. This time the gate read acted as a stop — no commit was made on red (the §10.11 defect did not recur). C-D23 names `K00-0506-VPOFF-20260915T012817Z` as its own tracked VPIO-02 population (10 × `gen-1 listen` under vpio-02 · 10 × SUBJECT-MISMATCH under vpio-01) and excludes it from engine-era; gate read ALONE after the edit: **65/65**; classifier, readers, batch, reinstall, organism untouched. Third explicit naming in a row (C-D19 · C-D21 · C-D23): a structural partition keyed on each ledger's `subject=` header would remove this recurring maintenance step — a candidate for a founder-ruled gate change, not made here. Founder acceptance of C-D23 as gate maintenance owed.

## 10. Founder adjudication (2026-09-15) — S1 ACCEPTED · transport deviation ACCEPTED · C-D22 ACCEPTED + correction AUTHORIZED (offline) · C-D23 ACCEPTED, enumeration at its limit · playback-capability census OPEN

**S1 accepted as read.** Mechanism ruling: processor-dependent suppression strongly supported; a VP-independent collapse of the capture path not supported by S1. S1 does not distinguish **A** (VP removes MAIA's own playback while independent near-end speech survives) from **A′** (VP suppresses the whole consumed near-end signal while MAIA speaks) — exactly S2's question: *while VP is ON, can an independent person-side signal still reach the seam MAIA actually consumes?* S1 earns no K00-06 PASS and reopens nothing about K00-05.

**Transport deviation — ACCEPTED** (`EXECUTION-TRANSPORT DEVIATION ACCEPTED · custody consequence none · preflight consequence none · repeat required no`): same governed observations, different transport packaging; not a general permission to split pinned transactions.

**C-D22 — ACCEPTED as a reader-boundary defect (evidence-family membership, not duplex failure); the produced S1 row 1 stays FAIL-06.** Correction AUTHORIZED, offline only: *when a full input-health window ends at the exact timestamp of the same stream's `stream_complete`, that completion record satisfies the output-family-presence requirement at the closed rendering boundary*; the 0.90 criterion, digital-zero rules, `input_dead`, every constitutional threshold and the full-window definition unchanged. Surface: `k00-output-ledger.py` · gate · records · CLAUDE.md; frozen: organism · harness · driver · batch · `k00-ledger.py` · reinstall · thresholds. Must add an explicit synthetic equality-boundary case and replay the complete tracked K00 output corpus offline; original S1 row preserved; successor result recorded separately; any replay change for another reason → STOP. No device act.

**C-D23 — ACCEPTED as gate maintenance; explicit enumeration has reached its limit** (C-D19 · C-D21 · C-D23). RULED: future corpus membership must be structural, not a list of population directory names; the subject-header approach is directionally correct but its implementation is NOT yet authorized — a bounded read-only **corpus-partition census** must first show how every tracked journal population obtains its subject/provenance and define a deterministic partition reproducing the current gate truth without per-population naming (may inspect tests, ledger headers, corpus layout; may not modify classifier behaviour, historical evidence or reader output). Owed before S2 evidence can land.

**Mac playback-capability census — OPEN, read-only, capability discovery only** (no sound, no reconfiguration, no stimulus file, no volume change, no device selection): what playback facility exists on the Mac Studio and the smallest deterministic command by which the future batch can start, observe and stop a known stimulus through a known output — read, not assume: available playback executables · their actual help/usage/exit documentation · non-interactive file path · level/gain controls · how playback lifetime can be observed and stopped · available output devices · current/default output · whether device identity is readable from the CLI · whether an output can be selected without UI · what evidence proves playback was alive during an invocation. `afplay` stays a candidate until the Mac establishes it. Returned design must prefer the smallest solution yielding: stimulus file SHA-256 · playback command identity · per-invocation start evidence · per-invocation stop evidence · playback process / exit status · Mac output-device custody. S2 implementation stays HELD behind the census, its exact batch-only design, gate, and a new orchestration SHA. S3 conditional, not open.

### 10.1 C-D22 correction — DONE (offline; reader + gate + records)

`scripts/witness/k00-output-ledger.py`: `completion_ends` = the set of `stream_complete` timestamps of the journal's streams; the family check now reads `if not any(|t(o) − t(r)| ≤ 250 for o in outs) and t(r) not in completion_ends` — exact equality only; nothing else moved (constants, full-window definition, every other falsifier byte-identical; gate-pinned). Synthetic case added (`build(boundary_complete=True)`: the last full window ends at the exact ms of `stream_complete` with no `output_render_sample` beside it): **historical reader `8b111709b` → FAIL-06 "output-health family absent"; successor → PASS-06** (proved here by loading both readers on the same synthetic rows). Self-test 33 → **35/35**. **Corpus replay (every tracked K00 journal with output records = the two 10-journal populations; plus the 60 F-W1 journals):** VP-ON `K00-0506-20260915T004738Z` 40/40 rows byte-identical to the produced ledger · S1 `K00-0506-VPOFF-20260915T012817Z` identical except **exactly row 1 K00-06 FAIL-06 → PASS-06** (the boundary condition and nothing else) · F-W1 60 journals 60 × NO-OUTPUT / 120 × EN-ROW / 60 × UNMEASURED-06 unchanged. No other verdict moved → no STOP. Produced ledgers untouched; successor result recorded separately as `K00-0506-VPOFF-20260915T012817Z/output-ledger.successor-C-D22.md`. Gate: the `8b111709b` byte-pin now excludes the reader (which must differ) and a new C-D22 test pins the rule, the synthetic case and the replay outcome; **66/66**. No device act.

## 11. Corpus-partition census RETURNED (read-only) — `KERNEL-00_CORPUS_PARTITION_CENSUS_2026-09-15.md`

Sixteen tracked journal directories + the 154-journal container archive (548 files). Every population carries two independent provenance carriers: **H** the directory's `ledger.md` header `subject=` (the batch's declared subject; the archive has none) and **C** the journal's own start-trace signature (`format_probe_initialize_begin` ⇒ VPIO-02 · `input_format_read` without probe ⇒ VPIO-01 · else engine, Phase-A/P5-B0 distinguished by `input_format_before_vp`). Across all 548 files H and C never disagree at the VPIO-02/VPIO-01/engine level. **Two deterministic partitions were computed and both reproduce the current four-name gate buckets set-for-set: P-H (header) and P-C (signature) → vpio-02 50 · vpio-01 30 · engine 468.** Recommended structural rule (for ruling; NOT implemented): membership = H ∧ C agreement (disagreement = named gate failure); per-population truth = the frozen classifier reproduces each population's produced `ledger.md` class column under its header subject (replacing C-D19/21/23-style count lists for every future population, S2 included); historical count assertions untouched; not-a-sample/flood treatment unchanged. Only the corpus-regression test's partition would move; classifier, readers, batch, journals, ledgers, thresholds untouched. **Implementation NOT authorized; returned for ruling.**

## 12. Mac playback-capability census — INSTRUMENT PINNED (read-only), NOT YET RUN

`scripts/witness/k00-playback-probe.sh` (new; gate-pinned 67/67; the `de3efd3fb` instrument-roots pin now admits exactly the reader and this probe): captures VERBATIM, with stdin closed on every invocation, `command -v` · man page · SHA-256 of the binary for each candidate (`afplay say ffplay ffmpeg sox play mpv SwitchAudioSource osascript system_profiler`), one conventional help flag per present player (`afplay -h` and bare `afplay`, `ffplay -h`, `ffmpeg -h`, `sox -h`, `play -h`, `mpv --help`, `SwitchAudioSource -h`), `system_profiler SPAudioDataType` (text + `-json`; the listing itself marks the default output device) and `osascript -e 'get volume settings'` (read only). **`say` is documented from its man page and NEVER executed** (it speaks its argument). No audio file is named, created or played; no volume set; no device selected; no `devicectl`/`xcodebuild`/batch verb. `SUMMARY.txt` greps the captured text for file-argument, gain/volume and duration lines and lists devices/default output; a capture-time `manifest.json` (HEAD · timestamp · `soundPlayed:false` · per-file SHA-256) is sealed by `SEAL.sha256`. Gate pins: filename shift (C-D11), `</dev/null` on every capture, `say` never executed, no audio-file literal, no `set volume`/`SwitchAudioSource -s`, no player given a path, no device verb, manifest + seal.

**Pinned invocation (founder Mac act; read-only; fresh detached worktree at the SHA this record lands on, printed by the record commit; paste as a block, no comments):**

```bash
git -C /Users/soullab/MAIA-SOVEREIGN fetch origin claude/voice-2026-census-01
git -C /Users/soullab/MAIA-SOVEREIGN worktree add --detach /private/tmp/k0506-playback-probe origin/claude/voice-2026-census-01
cd /private/tmp/k0506-playback-probe
git rev-parse HEAD
grep -c 'soundPlayed' scripts/witness/k00-playback-probe.sh
scripts/witness/k00-playback-probe.sh
```

Expected: the HEAD line (record it), `1`, then the SUMMARY and `probe written: docs/programme/VOICE-2026/driver-ledger/playback-probe-<stamp>` with `## sealed: <sha>`. Return the whole `playback-probe-<stamp>/` directory on a `feature/*` branch; read here → the S2 batch-only design (playback command identity · start/stop evidence · process/exit status · output-device custody · stimulus SHA-256) is written from the captured text, never from assumption. Nothing downstream opens: S2 implementation HELD behind the census reading → exact design → gate → new orchestration SHA → S2 authority; S3 not open.

**Standing:** K00-04 PASS · K00-05 PASS · CLOSED · K00-06 built-in CHARACTERIZE ONLY · INCOMPLETE (seam RULED) · S1 ACCEPTED · C-D22 DONE offline · C-D23 accepted; structural partition CENSUS RETURNED, implementation NOT authorized · playback-capability probe PINNED, NOT RUN · S2 implementation HELD · S2 witness NOT AUTHORIZED · S3 not open · organism FROZEN · `.vpio02` untouched · `.vpio01` FROZEN · K00/R1 UNTOUCHED · route/interruption/reset/endurance NOT AUTHORIZED · KERNEL-00 NOT ACCEPTED.

## 13. Mac playback-capability probe EXECUTED · RECEIVED · READ HERE (`playback-probe-20260915T020250Z`) · founder rulings (2026-09-15): output source UNRESOLVED · corpus-partition rule RATIFIED → gate-only implementation DONE · S2 HELD

### 13.1 Custody

Founder executed the §12 invocation on the Mac; the whole `playback-probe-20260915T020250Z/` directory returned on a `feature/*` branch (`047a3287c`) and was cherry-picked here as `60f4044c5`. Verified in this session from the files: `SEAL.sha256` = `fc14fd500d8d5da335d64c8ada301dbb9ced41c4381d6a4817e7ad6ac6fd799b` = sha256(`manifest.json`); 37 manifest entries, 0 hash mismatches; execution HEAD `01bb8a29df680eac04fd641cb230066707d8a957` (the pinned tip); manifest flags `soundPlayed:false · volumeChanged:false · deviceSelected:false · filesCreatedOutsideProbe:false`. No device verb, no journal, no sample: this is a Mac census, never a stratum.

### 13.2 What the Mac showed (captured text, not assumption)

- **Present:** `afplay` (`/usr/bin/afplay`) · `say` (`/usr/bin/say`, never executed) · `ffplay` · `ffmpeg` · `sox` · `play` (all `/opt/homebrew/bin`) · `osascript` · `system_profiler`. **Absent:** `mpv` · `SwitchAudioSource`. macOS 15.7.8 (24G806), Darwin 24.6.0, arm64.
- **`afplay` (verbatim):** `Usage: afplay [option...] audio_file` · options `{-v | --volume} VOLUME` · `{-h | --help}` · `{--leaks}` · `{-t | --time} TIME` · `{-r | --rate} RATE` · `{-q | --rQuality} QUALITY` · `{-d | --debug}`; help exits rc=1; man page: *"Audio File Play plays an audio file to the default audio output"*.
- **Output devices (`system_profiler SPAudioDataType`):** `ED343CUR V` (HDMI) · **`B06Ultra` — Transport: Bluetooth — `Default Output Device: Yes`** · `Scarlett 2i2 USB` · **`Mac Studio Speakers` (Built-in) — `Default System Output Device: Yes`** · Camo / Microsoft Teams Audio / Loopback (virtual). `afplay` plays to the *default audio output* = B06Ultra today.
- **Volume read:** `output volume:25, input volume:missing value, alert volume:59, output muted:false` (rc=0). Nothing changed.

### 13.3 S2 design consequence (founder ruling)

- **Player ESTABLISHED:** `afplay <stimulus>` with `-v` (ruled volume) and `-t` (bounded duration) is the S2 batch-orchestrated source; custody shape = stimulus SHA-256 → ruled `-v` → PID + start stamp → alive check inside the invocation → exit status/stop → output-device identity read (`system_profiler SPAudioDataType`) before each population.
- **Physical output source UNRESOLVED.** The current default output is a Bluetooth device (B06Ultra), which is neither the phone's environment nor a stable acoustic path to the phone's microphone; the built-in Mac Studio Speakers are the *system* default only. No CLI device selector is installed (`SwitchAudioSource` absent). **Founder favours option B — prepare Mac Studio Speakers as the default output by a separate, explicit preparation act — NOT AUTHORIZED here;** the S2 design is written against a to-be-ruled output device and refuses to run when the pre-population device read differs from the ruled identity.
- **S2 implementation HELD** behind that ruling → batch-only design → gate → new orchestration SHA → S2 authority. **S2 witness NOT AUTHORIZED. S3 not open.**

### 13.4 Corpus-partition ruling (founder, 2026-09-15) — ACCEPTED · structural rule RATIFIED · implementation AUTHORIZED gate-only → DONE

Ruling: census §4 rule ratified as the gate's membership law (H ∧ C agreement; disagreement fails closed with named evidence; per-population truth from the produced ledger; historical counts remain; not-a-sample and flood treatment unchanged); population truth ratified as vpio-02 50 · vpio-01 30 · engine 468. Implementation authorized in `__tests__/voice-kernel-00-source-gates.test.ts` ONLY. Acceptance criteria as ruled: (1) no future-population directory exclusion · (2) H and C derived structurally · (3) disagreement fails closed with named evidence · (4) current set exactly 50/30/468 · (5) produced-ledger reproduction row-for-row · (6) existing historical count assertions remain · (7) gate green before commit.

Done, in the corpus test only (`k00-ledger.py` · `k00-output-ledger.py` · batch · every journal · every ledger untouched):
- **H** = `subject=` of the nearest `ledger.md` above the journal (none ⇒ headerless archive); **C** = the journal's own `graph_start_trace` steps (`format_probe_initialize_begin` ⇒ vpio-02 · `input_format_read` without the probe ⇒ vpio-01 · else engine). Membership = H ∧ C; every disagreement is collected as `file: header=… signature=…` and asserted empty.
- Sets asserted exactly `[50, 30, 468]`; headerless = 154. Historical pins kept as counts, not membership: vpio-01 30 × failure then degradation; vpio-02 corpus 49 × gen-1 listen + 1 × failure then recovery (= 29+1 · 10 · 10). Cross-subject: every vpio-02 journal SUBJECT-MISMATCH under vpio-01 and vice versa; engine-era ∈ {SUBJECT-MISMATCH, DRIVER/INFRASTRUCTURE FAILURE} under BOTH VPIO subjects.
- **Produced-ledger reproduction loop:** for each of the 15 ledgered directories, every row naming a journal must name a tracked journal of that directory; every `not-a-sample/` journal is named in no row; every other journal is named in a row; the frozen classifier run under the header subject must reproduce the row's class — deltas asserted empty. **Structural flood detection:** the one ledger naming a journal in more than one row (the C-D5 listing-flood shape, PRE-AUTH, produced before C-D6) is identified by that property, not by name; its only delta from the frozen classifier is pinned exactly — `kernel00-K00-faf8fa3e-1789240954.jsonl` produced `SUBJECT-MISMATCH`, current `failure then degradation`, 10 rows (the C-D6 gen-1 §3 refusal, recorded 2026-09-12) — and exactly one such ledger must exist.
- The four `includes(dir)` filters and the C-D19/C-D21/C-D23 comments are gone; no directory name appears in the test. Measured before writing (offline, this session): 548 journals, H∧C 0 disagreements, 15 ledgered directories, reproduction 0 deltas everywhere except the pinned flood delta.
- **Fail-closed proven offline, then restored (`git checkout`):** flipping one header `subject=vpio-02 → vpio-01` fails naming all ten journals (`header=vpio-01 signature=vpio-02`); flipping one produced row class fails naming `K00-0506-VPOFF-20260915T012817Z kernel00-K00-558df5b2-…: produced=failure then recovery current=gen-1 listen`.
- Gate read alone before commit: **67/67** (count unchanged: one test replaced one test).

**Standing after §13:** K00-04 PASS · K00-05 PASS · CLOSED · K00-06 built-in CHARACTERIZE ONLY · INCOMPLETE (seam RULED) · S1 ACCEPTED · C-D22 DONE · C-D23 CLOSED by the structural partition (no further per-population naming will be needed for S2's evidence) · playback probe READ · S2 player ESTABLISHED (`afplay`) · S2 output source UNRESOLVED (founder favours preparing Mac Studio Speakers; separate act, NOT authorized) · S2 implementation HELD · S2 witness NOT AUTHORIZED · S3 not open · organism FROZEN · `.vpio02` untouched · `.vpio01` FROZEN · K00/R1 UNTOUCHED · KERNEL-00 NOT ACCEPTED.

## 14. FOUNDER RULING (2026-09-15) — S2 physical source = **Mac Studio Speakers** · OUTPUT-SOURCE PREPARATION ACT OPEN (founder-performed macOS UI act) · S2 design direction FIXED, not live

### 14.1 Ruling (founder, verbatim in substance)

Mac Studio Speakers are selected as the governed physical source for S2: `afplay` is documented to play through the *default audio output*; the probe shows `B06Ultra` (Bluetooth) as that default and `Mac Studio Speakers` only as the system-default device. An unidentified Bluetooth endpoint would weaken the physical custody of the experiment; the built-in speakers are a stable, named, local acoustic source.

**Output-source preparation act — OPEN.** A founder-performed macOS UI act, not a CLI utility, not an audio experiment.

```text
purpose
  make Mac Studio Speakers the macOS Default Output Device
  used by future afplay playback

authorized mutation
  exactly one output-device selection:
  Mac Studio Speakers

not authorized
  playing sound
  changing volume
  disconnecting / unpairing B06Ultra
  installing SwitchAudioSource or any other utility
  changing input device
  changing sample rate
  changing the iPhone
  starting S2
```

### 14.2 Pinned sequence (as ruled; paste-able; no `#` comment lines)

Before-read, immediately before the selection:

```bash
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="/private/tmp/k00-s2-output-source-$STAMP"
mkdir -p "$OUT"
system_profiler SPAudioDataType -json > "$OUT/audio-before.json"
osascript -e 'get volume settings' > "$OUT/volume-before.txt"
echo "$OUT"
```

Then exactly one UI gesture: **Control Center → Sound → Output → Mac Studio Speakers.** No volume gesture. No test sound.

After-read, immediately afterwards (the parser below was run in this session against the probe's captured `audio-devices.json` — every key it reads exists as written: `_name` · `coreaudio_default_audio_output_device` · `coreaudio_device_transport` · `coreaudio_device_srate`; on the probe's capture it prints `DEFAULT_OUTPUT B06Ultra coreaudio_device_type_bluetooth 44100` and `MAC_STUDIO_DEFAULT_OUTPUT False`, i.e. the before-state):

```bash
system_profiler SPAudioDataType -json > "$OUT/audio-after.json"
osascript -e 'get volume settings' > "$OUT/volume-after.txt"

python3 - "$OUT/audio-after.json" <<'PY'
import json, sys

raw = open(sys.argv[1], encoding="utf-8").read()
raw = raw[raw.find("{"):raw.rfind("}")+1]
d = json.loads(raw)

items = []
for group in d.get("SPAudioDataType", []):
    items.extend(group.get("_items", []))

defaults = [
    x for x in items
    if x.get("coreaudio_default_audio_output_device") == "spaudio_yes"
]

for x in defaults:
    print(
        "DEFAULT_OUTPUT",
        x.get("_name"),
        x.get("coreaudio_device_transport"),
        x.get("coreaudio_device_srate"),
    )

mac = next((x for x in items if x.get("_name") == "Mac Studio Speakers"), None)
print("MAC_STUDIO_DEFAULT_OUTPUT",
      bool(mac and mac.get("coreaudio_default_audio_output_device") == "spaudio_yes"))
PY
```

Then seal the four captures for return (read-only; `shasum` is present on the Mac, the probe used it):

```bash
( cd "$OUT" && shasum -a 256 audio-before.json volume-before.txt audio-after.json volume-after.txt > SHA256SUMS && cat SHA256SUMS )
```

### 14.3 PASS / STOP (as ruled; literals from the captured JSON vocabulary)

PASS requires all of:

```text
exactly one DEFAULT_OUTPUT line
name       Mac Studio Speakers
transport  coreaudio_device_type_builtin        (the JSON literal for "built-in")
MAC_STUDIO_DEFAULT_OUTPUT True
```

Custody only, not criteria: the sample rate printed on that line (the probe read 48000 for the built-in device), both `volume-*.txt` values (macOS keeps per-device volume state; they need not equal the Bluetooth values; the act must not alter volume by hand), and `B06Ultra` still listed in `audio-after.json` without the default-output flag (it was not unpaired). Anything else is **STOP**: no second selection, no volume correction, no playback test, no S2 execution.

### 14.4 Return

Copy `$OUT` into `docs/programme/VOICE-2026/driver-ledger/s2-output-source-<STAMP>/` on a `feature/*` branch (the Mac hooks refuse `claude/*`), with the parser's printed lines pasted into a `READ.txt` beside the captures; it is cherry-picked here and the PASS/STOP is read from the files. A PASS establishes only *the default output device is Mac Studio Speakers at <STAMP>*; the S2 batch re-reads the device identity before each population and refuses on a mismatch (design direction below) — the preparation is not a standing guarantee.

### 14.5 S2 design direction — FIXED by this ruling, NOT live

```text
player               /usr/bin/afplay
physical source      Mac Studio Speakers
stimulus             deterministic static audio file · SHA-256 pinned · steady for the entire phone
                     invocation · distinct from MAIA's 440-Hz own-output tone
orchestration        batch-only
per-sample custody   stimulus SHA · afplay binary identity · default-output identity before invocation ·
                     player PID · player start epoch · proof the PID remained alive during the governed
                     interval · explicit stop/wait · exit status · stop epoch
```

Physical chain the design must make legible: hash-pinned stimulus → `/usr/bin/afplay` → macOS Default Output Device → Mac Studio Speakers → room → iPhone `builtInMic` → VoiceProcessingIO → MAIA's consumed input seam. Phone-side validity unchanged (§7 as ratified): the source must be visible as `signal` in at least two healthy pre-output baseline windows, else that invocation is UNMEASURED for the discriminator; no amplitude threshold is manufactured.

**Lane rule:** a PASS on the preparation does not authorize the S2 design act or implementation; before/after evidence returns first, then a separate bounded S2 batch-only design authority.

**Standing after §14:** structural corpus partition LANDED · playback census COMPLETE · S2 physical source Mac Studio Speakers · RULED · **output-source preparation OPEN (Mac act, not yet executed; evidence owed)** · sound playback NOT AUTHORIZED · S2 design execution HELD · S2 implementation HELD · S2 witness NOT AUTHORIZED · S3 NOT OPEN · organism FROZEN · `.vpio02` untouched · `.vpio01` FROZEN · K00/R1 UNTOUCHED · KERNEL-00 NOT ACCEPTED.

### 14.6 Before-read CAPTURED · act paused at the governed boundary (founder-relayed, 2026-09-15)

Before-read captured at `/private/tmp/k00-s2-output-source-20260915T022305Z` (`audio-before.json` · `volume-before.txt`; contents not yet received here). The Mac-side session stopped at the exact boundary: its terminal control does not reach Control Center, and it declined to substitute AppleScript or a CLI device switch for the pinned UI gesture — correct under §14.1. The request to *perform* the gesture was relayed to this session, which has no Mac, no display and no Control Center and likewise cannot and will not substitute. **The one authorized mutation — Control Center → Sound → Output → Mac Studio Speakers — is a physical act of the founder's hand.** Sequence unchanged: gesture → after-read → parser → four-file seal → return under the SAME stamp (`20260915T022305Z`); a second before-read would be a new stamp and the first pair is then evidence only. Nothing else is authorized.

### 14.7 Founder confirmation (2026-09-15) — BLOCKED act, not a failed one · lane PAUSED at the boundary

```text
before-read             CAPTURED · 20260915T022305Z
record                  bf7d2fc63
required mutation       physical Control Center selection
mutation performed      NO
after-read              NOT AUTHORIZED YET
seal                    NOT CREATED
S2 design               HELD
S2 implementation       HELD
S2 witness              NOT AUTHORIZED
```

The ruling authorized one human UI gesture; no session (this one or the Mac terminal session) replaces it with AppleScript, CoreAudio commands, an installed selector or any other mechanism. The before-state is legitimate custody evidence with no after-state yet. Exactly two clean paths: **(1) hold** until someone physically at the Mac Studio selects Control Center → Sound → Output → Mac Studio Speakers and the after-read + seal complete under stamp `20260915T022305Z`; **(2) a new founder ruling** that abandons the human-gesture act and authorizes a different output-selection mechanism — a new act with its own preconditions, never a workaround inside this one. Until one happens, nothing further runs in S2.

### 14.8 Gesture performed (founder statement, 2026-09-15: "all done") · after-read evidence NOT YET RECEIVED

The founder states the one authorized mutation — Control Center → Sound → Output → Mac Studio Speakers — was performed by hand at the Mac Studio. This session holds only that statement: no `s2-output-source-20260915T022305Z/` directory exists on any `origin/feature/*` branch at the time of this entry (fetched and scanned), so `audio-after.json` · `volume-after.txt` · `READ.txt` · `SHA256SUMS` are unread here and PASS/STOP is NOT determined. State:

```text
before-read             CAPTURED · 20260915T022305Z
mutation performed      YES — founder-stated; not yet evidenced
after-read              OWED (Mac-side session, same stamp)
seal                    OWED
return                  OWED (feature/* → driver-ledger/s2-output-source-20260915T022305Z/)
PASS / STOP             UNDETERMINED until the files are read here
S2 design / impl        HELD
S2 witness              NOT AUTHORIZED
```

Reading law unchanged (§14.3): exactly one `DEFAULT_OUTPUT` line · `Mac Studio Speakers` · `coreaudio_device_type_builtin` · `MAC_STUDIO_DEFAULT_OUTPUT True`; B06Ultra present without the flag; volumes custody only. On PASS the sequence the founder restated applies in order and each step is its own act: (1) record the preparation PASS → (2) separate S2 batch-only design authority → (3) implement only the orchestration (deterministic stimulus, SHA custody, `/usr/bin/afplay`, PID/start/alive/stop/exit evidence, default-output verification before each population) → (4) gate → new orchestration SHA → (5) fresh S2 witness authority → (6) S2 with VP ON + the labelled external signal → (7) read whether the near-end signal survives at the consumed seam while MAIA speaks → (8) only then decide S3. None of (2)–(8) is opened by this entry.

### 14.9 OUTPUT-SOURCE PREPARATION — EVIDENCE RECEIVED · VERIFIED HERE · **PASS** (stamp `20260915T022305Z`)

**Custody.** Founder returned `driver-ledger/s2-output-source-20260915T022305Z/` on `feature/k00-s2-output-source-evidence-20260915` at `8a3ca8fda198c8d2a8970a0674bcbbca95321345`, cherry-picked here with `-x`. Six files: `audio-before.json` · `volume-before.txt` · `audio-after.json` · `volume-after.txt` · `READ.txt` · `SHA256SUMS`. All four sealed hashes RECOMPUTED here and identical to `SHA256SUMS` (`26ad8eab…` · `4b30c689…` · `81d2fbf5…` · `e0d2120e…`). The founder read the gate 67/67 before the Mac-side commit (founder-stated).

**Independent read (the §14.2 parser run in this session on both captures, not `READ.txt`):**

```text
BEFORE  DEFAULT_OUTPUT B06Ultra coreaudio_device_type_bluetooth 44100      (1 line)   MAC_STUDIO_DEFAULT_OUTPUT False
AFTER   DEFAULT_OUTPUT Mac Studio Speakers coreaudio_device_type_builtin 48000  (1 line)   MAC_STUDIO_DEFAULT_OUTPUT True
AFTER   B06ULTRA_PRESENT True · B06ULTRA_DEFAULT_OUTPUT False · transport bluetooth (not unpaired)
BOTH    default input Scarlett 2i2 USB (unchanged) · Default System Output Mac Studio Speakers (unchanged) · no sample-rate change on any device
```

`READ.txt` agrees line for line. **§14.3 PASS: exactly one `DEFAULT_OUTPUT` line · `Mac Studio Speakers` · `coreaudio_device_type_builtin` · flag True · B06Ultra present without the flag.**

**Custody observations (recorded, not absorbed, not criteria):**
- `output volume:25 → 69`, `output muted:false` both sides, alert volume 59 unchanged. Volume is custody only under §14.3; the founder states no volume-setting command was issued and the act contained no volume gesture. The mechanism (per-device volume state retained by macOS) is the ruling's stated interpretation; this session asserts only the two read values. S2's `afplay -v` is the governed playback level; the system output level at S2 time is re-read before each population.
- Device set delta: `Kelly Nezat’s iPhone Microphone` (transport `coreaudio_device_type_unknown`, an input-only Continuity entry) present in the before capture, absent in the after capture. Not an output device, not touched by any authorized act, not a criterion; recorded as an OS-side transient between the two reads.

**Result:** `S2 output-source preparation PASS · Mac Studio Speakers default output confirmed at 20260915T022305Z`. This is evidence at a time, not a standing guarantee: the S2 batch must re-read the default-output identity before each population and refuse on mismatch (§14.5).

**Standing after §14.9:** structural corpus partition LANDED · playback census COMPLETE · S2 physical source Mac Studio Speakers RULED · **output-source preparation PASS** · sound playback NOT AUTHORIZED · **S2 batch-only design authority = the founder's next separate ruling (NOT opened here)** · S2 implementation HELD · S2 witness NOT AUTHORIZED · S3 NOT OPEN · organism FROZEN · `.vpio02` untouched · `.vpio01` FROZEN · K00/R1 UNTOUCHED · KERNEL-00 NOT ACCEPTED.

## 15. FOUNDER RULING (2026-09-15) — S2 BATCH-ONLY DESIGN/IMPLEMENTATION OPEN → LANDED at `b198e2e37058f2e059d986b4b148e224215f3ee3` · gate 75/75 · NOTHING PLAYED

### 15.1 Ruling (as issued; substance preserved)

Output-source preparation PASS opened the bounded S2 batch-only act. It may produce the new orchestration SHA; it authorizes no playback on the Mac, no iPhone population, no physiological sampling. Ruled: **stimulus** = tracked `scripts/witness/fixtures/k00-s2-nearend-997hz-180s.wav` (WAV/PCM · mono · 48 000 Hz · signed 16-bit · exactly 180.000 s · 8 640 000 frames · continuous 997 Hz sine · peak 0.20 FS · no fades; created offline, never listened to) · **SHA custody** pinned identically in the sidecar, the batch and the gate, gate reads header/frames and recomputes, no placeholder · **player** `/usr/bin/afplay -v 0.50 -t 180 "$S2_STIMULUS"`, binary SHA `88f3b577…` from the playback census as a precondition (a different binary = STOP) · **Mac output-level custody** read, never changed: Mac Studio Speakers · `coreaudio_device_type_builtin` · output volume 69 · muted false, mismatch = STOP before playback; no S2 code sets volume, selects a device, disconnects Bluetooth or repairs state · **lifetime per sample** (13 steps: cold precondition → one afplay child → PID + epoch → 1 s → alive/non-zombie proof → `run_test testOutputSample` with 1 s liveness monitoring → alive-through proof → explicit TERM → wait → stop time + exit status → normal journal custody); not alive before the invocation = abort as orchestration; death during = sample + journal preserved, custody INVALID, row UNMEASURED for the discriminator · **interface** exactly `--stimulus s2-nearend` (no path), lawful only with `--act output --vp on --mode L --subject vpio-02`, stratum `K00-0506-S2`, N = 10, historical invocations unchanged · **evidence** `stimulus-preflight/{audio-output.json, volume.txt, afplay.sha256, stimulus.sha256, stimulus-wave-metadata.txt}` + `stimulus-sample-N.tsv`; readers never carry stimulus validity · **phone-side reading** exactly §7 as ratified (≥ 2 healthy baseline windows showing the source as `signal`, else UNMEASURED; A / A′ / UNMEASURED / CHARACTERIZE; no `rmsMean` multiplier decides; S2 does not earn K00-06 PASS) · **surface** batch · fixtures · gate · records · CLAUDE.md; frozen: `ios/VoiceKernel/**` · `ios/VoiceKernelHarness/**` · `ios/VoiceKernelDriver/**` · `k00-ledger.py` · `k00-output-ledger.py` · `k00-reinstall.sh` · all journals · all produced ledgers · all thresholds/classes · **gate acceptance** list (§15.4) · the design/gate run never executes `afplay`.

### 15.2 What landed (instrument commit `b198e2e37`, four files)

- **Fixture** generated offline in this session with Python's `wave` module: `int16(round(6553·sin(2π·997·k/48000)))`, k = 0…8 639 999; 17 280 044 bytes; **SHA-256 `1a505b3d38a97b75cb935f85bd33deb889628322e558f74af9a5f05afbfbd00e`**; sidecar `1a505b3d…  k00-s2-nearend-997hz-180s.wav`. No player invoked at any point (none is installed in this container: `/usr/bin/afplay` absent here).
- **Batch** (`scripts/witness/k00-driver-batch.sh`, 218 → 322 lines; every one of the 218 historical lines preserved verbatim and in order — gate-proven): `STIMULUS=""` default · `--stimulus) STIMULUS="$2"` · closed `case` (only `s2-nearend`; any other value including a path → refused, exit 2) · the four-condition guard (exit 2, before the device lock, before any build) · S2 constants (`S2_STIMULUS` resolved from `$ROOT`, `S2_STIMULUS_SHA256`, `S2_AFPLAY="/usr/bin/afplay"`, `S2_AFPLAY_SHA256`, `S2_AFPLAY_VOLUME="0.50"`, `S2_AFPLAY_SECONDS="180"`, `S2_OUTPUT_DEVICE="Mac Studio Speakers"`, `S2_OUTPUT_TRANSPORT="coreaudio_device_type_builtin"`, `S2_OUTPUT_VOLUME="69"`, `S2_OUTPUT_MUTED="false"`) · ledger header gains one `stimulus=…` line under `--stimulus` only · `afplay_state` (ps-only: alive | zombie | gone | not-afplay) · `stimulus_preflight` after the driver build and before sample 1, order **fixture present → SHA = pin → exact WAV format (python `wave`) → exactly one default output = Mac Studio Speakers/builtin (`system_profiler SPAudioDataType -json`, the §14.2 parser) → `output volume:69,` and `output muted:false` (`osascript -e 'get volume settings'`) → `/usr/bin/afplay` executable → SHA = pin**, every clause `STOP` → exit 8, nothing played · `stimulus_start` (one child: the verbatim ruled command with `</dev/null`, stdout/err to `stimulus-sample-N-afplay.log`; PID + startEpoch; `sleep 1`; preRunState; not alive → custody INVALID, child reaped, **exit 9** with a `DRIVER/INFRASTRUCTURE FAILURE` row, no identical rows; else a background 1 s liveness monitor) · `stimulus_stop` (monitor stopped → postRunState → dead-liveness count → stopRequestedEpoch → `kill -TERM "$S2_PID"` → `wait "$S2_PID"` → waitExitStatus + stopEpoch → `custody VALID` iff alive after run_test ∧ zero dead observations, else `custody INVALID` and a log line naming the row UNMEASURED) · loop order `daemon_snapshot before → stimulus_start → run_test → stimulus_stop → …` with nothing able to skip the stop between the two · `trap … INT TERM` reaps a live child on interruption (the EXIT trap for the lock dir untouched); `-t 180` remains the failsafe only.
- **Not enforced by the batch, deliberately:** the stratum label and N are invocation arguments (`K00-0506-S2` · `10` per the ruling) and are recorded, not policed — the ruling closed the token and its conditions, not the label grammar; the record pins the invocation instead (§15.5).
- **Gate** (`__tests__/voice-kernel-00-source-gates.test.ts`, 67 → 75): new S2 block (8 tests) + the instrument-roots expectation gains the fixture and sidecar + C-D20's frozen list drops the batch (moved for S2, preservation proven structurally) + the daemon-witness pin now forbids signalling outside the four S2 functions and requires every `kill` in the file to name only `$S2_PID`/`$S2_MON`.

### 15.3 Offline exercise (shims: `xcodegen`/`xcodebuild`/`xcrun`/`system_profiler`/`osascript` fakes on PATH; no device, no player, no sound)

| invocation | result |
|---|---|
| `--stimulus /tmp/x.wav` | rc 2 · `unknown stimulus '/tmp/x.wav' (the only token is s2-nearend; no path is accepted)` |
| `s2-nearend` with `--vp off` · `--act entry` · `--mode I` · `--subject vpio-01` | rc 2 each · `lawful only with --act output --vp on --mode L --subject vpio-02 (got …)` |
| lawful args, `system_profiler` shim = probe capture (B06Ultra default) | rc 8 · `STOP: default output device is not exactly one Mac Studio Speakers (coreaudio_device_type_builtin)` |
| lawful args, device shim = `audio-after.json`, volume shim = `volume-before.txt` (25) | rc 8 · `STOP: output volume is not 69 (…)` |
| lawful args, device = after, volume = after (69) | rc 8 · `STOP: /usr/bin/afplay is not an executable file` (absent in this container — the pin's own refusal) |

Fixture presence, SHA and exact format passed inside every rc-8 run before the STOP clause fired. The afplay-PASS branch and everything after it are exercisable only on the Mac. Shim ledger directories were created under the repo tree by these runs and removed before commit; none is evidence.

### 15.4 Gate acceptance (ruling §9) → proof

fixture format/frame count exact ✓ (RIFF/fmt/data parsed; 1 ch · 48 000 · 16-bit · data 17 280 000 B · 8 640 000 frames; peak exactly ±6553 over the whole file; 1994±2 zero crossings in the first second; first second and last sample match the 997 Hz sine to 1 LSB) · fixture SHA = sidecar = batch pin = gate pin ✓ · afplay binary SHA pinned = census `shasum-afplay.txt` ✓ · `-v` exactly 0.50 · `-t` exactly 180 ✓ (one verbatim invocation, inside `stimulus_start` only) · default-output preflight fails closed ✓ · volume 69 / unmuted preflight fails closed ✓ · no code changes system volume or selects a device ✓ (one `osascript … get volume settings` read, one `system_profiler SPAudioDataType -json` read; no set-volume/SwitchAudioSource/blueutil/defaults-write/sudo) · `--stimulus` accepts only `s2-nearend` ✓ · refuses outside output + VP ON + Mode L + vpio-02 ✓ · player starts before `run_test` ✓ · continuous liveness recorded ✓ · player stops/waits after `run_test` ✓ · invalidity cannot become physiological PASS ✓ (both reader invocations byte-identical to `8b111709b`; custody written only to `stimulus-sample-N.tsv`; readers/reinstall/driver byte-frozen to `08483cfe4` · `b2a18e484` · `83a382a14`) · historical path preserved ✓ (ordered-subsequence proof; every added executable line is inside an S2 function, an S2 constant, or a `$STIMULUS` guard) · organism frozen ✓ (existing `ac12dedf4` pins) · source gate green before commit ✓ 75/75.

### 15.5 Standing · what is owed

```text
orchestration SHA      b198e2e37058f2e059d986b4b148e224215f3ee3
fixture SHA-256        1a505b3d38a97b75cb935f85bd33deb889628322e558f74af9a5f05afbfbd00e
afplay SHA-256 pin     88f3b577790877524edc79a20de8838a019c0ca723a0eaa4a8612a860317cabb
future invocation      scripts/witness/k00-driver-batch.sh K00-0506-S2 10 --act output --cancel-at 1000 --settle 2 --vp on --mode L --subject vpio-02 --stimulus s2-nearend
                       (shape only — NOT an authority; runs from a fresh detached worktree at exactly b198e2e37; K00_DEVICE / K00_XCODE_DEST as before)
sound playback         NOT AUTHORIZED
S2 population          NOT AUTHORIZED (separate founder witness authority, issued only after reading the two SHAs)
S3                     NOT OPEN
KERNEL-00              NOT ACCEPTED
```

Owed before any S2 witness (founder decisions, none opened here): the witness authority string · whether the driver runner must be rebuilt signed from the `b198e2e37` worktree (the driver test is byte-identical to `83a382a14`, so the batch's own `build-for-testing` step rebuilds the same product) · a read-only preflight shaped like §10.10 plus the batch's own stimulus preflight.

## 16. FOUNDER RULING (2026-09-15) — `S2-WITNESS-01` GRANTED, BOUNDED: one witness of the landed orchestration on the real Mac Studio against exactly `b198e2e37` · playback permitted ONLY as an instrument of this witness · S2 population CLOSED · Mac act, NOT YET EXECUTED

### 16.1 Authority (verbatim from the ruling; this is the authority of record — no instrument consumes an authority string in this act, so the invocation carries none)

```text
S2-WITNESS-01

PURPOSE
Witness that the landed S2 batch orchestration behaves on the actual
Mac Studio exactly as the offline instrument claims.

AUTHORIZED
✅ checkout / verify b198e2e37058f2e059d986b4b148e224215f3ee3
✅ read the 75/75 gate before the act
✅ verify clean tree
✅ verify fixture SHA-256:
   1a505b3d38a97b75cb935f85bd33deb889628322e558f74af9a5f05afbfbd00e
✅ verify /usr/bin/afplay SHA-256:
   88f3b577790877524edc79a20de8838a019c0ca723a0eaa4a8612a860317cabb
✅ exercise the real-device population preflight
✅ permit the ruled S2 stimulus playback only as required by this witness
✅ execute the minimum real-Mac witness necessary to observe:
   - preflight PASS
   - child creation
   - PID / epoch custody
   - alive + non-zombie proof
   - run_test containment
   - monitor behavior
   - post-run state
   - TERM directed only to the locally created child
   - wait / exit-status capture
   - stimulus-sample custody record
✅ preserve terminal output and generated witness artifacts
✅ record PASS / STOP from observed evidence

NOT AUTHORIZED
⛔ S2 population collection
⛔ repeated samples merely to accumulate data
⛔ S3
⛔ KERNEL-00 acceptance
⛔ device mutation
⛔ output-volume mutation
⛔ fixture regeneration or substitution
⛔ alternate stimulus paths or tokens
⛔ edits to readers, driver, reinstall path, or organism
⛔ code repair during the witness
⛔ weakening a STOP into a warning
⛔ treating a failed witness as implementation authority
```

Fail-closed rule (founder): if the real Mac contradicts any pinned precondition, the witness STOPS there — no repair and rerun under this authority. If playback begins but custody cannot be proved (wrong PID, premature death, zombie state, monitor failure, ambiguous termination, malformed/missing custody record) the result is witness failure / infrastructure evidence, never permission to continue. *Playback is authorized only as an instrument of S2-WITNESS-01; it is not independently authorized; S2 population remains closed.* Acceptance boundary: **witness PASS ≠ S2 population authorized · ≠ S3 opened · ≠ KERNEL-00 accepted.** On PASS: return the evidence and stop for a separate S2 population ruling.

### 16.2 Shape of the minimum witness (this session's reading of "minimum")

`run_test containment` can only be observed around a real `run_test`, and `run_test` is one phone invocation of `testOutputSample`. The minimum is therefore **N = 1** under its own stratum label `S2-WITNESS-01`: one cold precondition, one `afplay` child, one phone invocation, one stop, one custody record. The phone will write one journal; it is preserved, hashed and ledgered exactly as the batch does for any sample, **but it is witness evidence of the orchestration, never an S2 population row** — the K00-06 / A / A′ reading of §7 is NOT performed on it under this authority. (When its evidence lands here, the structural corpus test's exact set count moves 50 → 51 for the vpio-02 corpus; that is count maintenance under the ratified rule, not a directory naming.)

### 16.3 Pinned sequence — Mac act (paste each block whole; no `#` lines)

**Block A — source custody: fresh detached worktree at exactly the orchestration SHA, gate read, tree clean, fixture and player SHAs.** (`/private/tmp/k0506-s2w-b198e2e37` must not pre-exist; a pre-existing path is STOP for `worktree add`. The gate needs `node_modules`; link the main checkout's if absent.)

```bash
git -C /Users/soullab/MAIA-SOVEREIGN fetch origin claude/voice-2026-census-01
git -C /Users/soullab/MAIA-SOVEREIGN worktree add --detach /private/tmp/k0506-s2w-b198e2e37 b198e2e37058f2e059d986b4b148e224215f3ee3
cd /private/tmp/k0506-s2w-b198e2e37
HEAD_NOW="$(git rev-parse HEAD)"
echo "HEAD=$HEAD_NOW"
if [ "$HEAD_NOW" != "b198e2e37058f2e059d986b4b148e224215f3ee3" ]; then
  echo "STOP: wrong orchestration HEAD"
  exit 80
fi
[ -e node_modules ] || ln -s /Users/soullab/MAIA-SOVEREIGN/node_modules node_modules
git status --porcelain | grep -v '^?? node_modules$' > /private/tmp/s2w-tree-status.txt
if [ -s /private/tmp/s2w-tree-status.txt ]; then
  cat /private/tmp/s2w-tree-status.txt
  echo "STOP: tree not clean"
  exit 81
fi
echo "TREE_CLEAN=1"
npx jest --config jest.config.js __tests__/voice-kernel-00-source-gates.test.ts 2>&1 | tee /private/tmp/s2w-gate.txt | grep -E "Tests:"
grep -q "75 passed, 75 total" /private/tmp/s2w-gate.txt && echo "GATE_75_75=1" || { echo "STOP: gate not 75/75"; exit 82; }
FIX_SHA="$(shasum -a 256 scripts/witness/fixtures/k00-s2-nearend-997hz-180s.wav | cut -d' ' -f1)"
echo "FIXTURE_SHA=$FIX_SHA"
[ "$FIX_SHA" = "1a505b3d38a97b75cb935f85bd33deb889628322e558f74af9a5f05afbfbd00e" ] || { echo "STOP: fixture SHA differs from the pin"; exit 83; }
AF_SHA="$(shasum -a 256 /usr/bin/afplay | cut -d' ' -f1)"
echo "AFPLAY_SHA=$AF_SHA"
[ "$AF_SHA" = "88f3b577790877524edc79a20de8838a019c0ca723a0eaa4a8612a860317cabb" ] || { echo "STOP: /usr/bin/afplay SHA differs from the census pin"; exit 84; }
pgrep -x afplay > /private/tmp/s2w-afplay-before.txt && { cat /private/tmp/s2w-afplay-before.txt; echo "STOP: an afplay process already exists before the witness"; exit 85; } || echo "AFPLAY_PROCESSES_BEFORE=0"
echo "BLOCK_A_PASS=1"
```

Proceed only on `HEAD=b198e2e37…` · `TREE_CLEAN=1` · `GATE_75_75=1` · `FIXTURE_SHA=1a505b3d…` · `AFPLAY_SHA=88f3b577…` · `AFPLAY_PROCESSES_BEFORE=0` · `BLOCK_A_PASS=1`.

**Block B — read-only device preflight** (the §10.10 / S1 law, on this worktree; the `pgrep` pattern also matches any running K00-0506 or S2-WITNESS batch by design):

```bash
cd /private/tmp/k0506-s2w-b198e2e37
git diff --quiet b198e2e37058f2e059d986b4b148e224215f3ee3 -- \
  ios/VoiceKernelDriver \
  scripts/witness/k00-driver-batch.sh \
  scripts/witness/k00-ledger.py \
  scripts/witness/k00-output-ledger.py \
  scripts/witness/k00-reinstall.sh \
  scripts/witness/fixtures
DIFF_RC=$?
echo "PREFLIGHT_DIFF_RC=$DIFF_RC"
if [ "$DIFF_RC" -ne 0 ]; then
  echo "STOP: witness surface differs"
  exit 91
fi

if pgrep -fl 'k00-driver-batch.sh \(K00-0506\|S2-WITNESS\)' > /private/tmp/s2w-preflight-other-batches.txt; then
  cat /private/tmp/s2w-preflight-other-batches.txt
  echo "STOP: another batch process exists"
  exit 92
else
  echo "OTHER_BATCHES=0"
fi

DEV=A0736AC8-793B-516F-AC72-C076DB6CEE38
PF="docs/programme/VOICE-2026/driver-ledger/S2-WITNESS-01-preflight-$(date -u +%Y%m%dT%H%M%SZ)"
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

Proceed only on `PREFLIGHT_DIFF_RC=0` · `OTHER_BATCHES=0` · `APPS_READ_RC=0` · `E3B88028_CONTAINER_HITS` ≥ 1 · `PROCESS_READ_RC=0` · `VoiceKernelHarness processes: 0`. Anything else is STOP; no normalization, no corrective device act.

**Block C — the one witness invocation** (N = 1 · output act · cancel-at 1000 · settle 2 · VP ON · Mode L · vpio-02 · `--stimulus s2-nearend`; the batch's own stimulus preflight runs inside it after the driver build and STOPs with exit 8 on any mismatch; terminal output preserved by `tee`):

```bash
cd /private/tmp/k0506-s2w-b198e2e37
K00_DEVICE=A0736AC8-793B-516F-AC72-C076DB6CEE38 K00_XCODE_DEST=00008140-00163D9922E0801C \
scripts/witness/k00-driver-batch.sh S2-WITNESS-01 1 --act output --cancel-at 1000 --settle 2 --vp on --mode L --subject vpio-02 --stimulus s2-nearend 2>&1 | tee /private/tmp/s2-witness-01-transcript.txt
echo "BATCH_PIPELINE_RC=${PIPESTATUS[0]}"
```

**Block D — post-witness read (read-only; nothing signalled, nothing changed):**

```bash
cd /private/tmp/k0506-s2w-b198e2e37
LD="$(ls -td docs/programme/VOICE-2026/driver-ledger/S2-WITNESS-01-2* | head -1)"
echo "LEDGER_DIR=$LD"
pgrep -x afplay > /private/tmp/s2w-afplay-after.txt && { cat /private/tmp/s2w-afplay-after.txt; echo "AFPLAY_PROCESSES_AFTER=nonzero"; } || echo "AFPLAY_PROCESSES_AFTER=0"
ls -la "$LD/stimulus-preflight"
cat "$LD/stimulus-preflight/stimulus.sha256" "$LD/stimulus-preflight/afplay.sha256" "$LD/stimulus-preflight/stimulus-wave-metadata.txt" "$LD/stimulus-preflight/volume.txt"
cat "$LD/stimulus-sample-1.tsv"
cat "$LD/stimulus-sample-1-afplay.log"
cat "$LD/sample-timing.tsv"
grep -E 'stimulus|STOP|ABORT|custody|ledgered|batch complete' "$LD/batch.log"
grep -c '^| AUTOMATED' "$LD/ledger.md"
ls "$LD/journals"
cp /private/tmp/s2-witness-01-transcript.txt "$LD/transcript.txt"
( cd "$LD" && shasum -a 256 transcript.txt stimulus-sample-1.tsv stimulus-sample-1-afplay.log stimulus-preflight/* journals/*.jsonl ledger.md output-ledger.md batch.log > SHA256SUMS.witness && cat SHA256SUMS.witness )
```

**Return:** the whole `S2-WITNESS-01-<stamp>/` directory (with `transcript.txt` and `SHA256SUMS.witness`) plus the `S2-WITNESS-01-preflight-<stamp>/` directory and the Block A/B/D terminal output, on a `feature/*` branch (Mac hooks refuse `claude/*`); it is cherry-picked here with `-x` and read against §16.4.

### 16.4 Reading law — predeclared before any evidence exists

**PASS** requires ALL of:
1. Blocks A and B: every gate line as listed (HEAD · tree clean · gate 75/75 · fixture SHA · afplay SHA · no pre-existing afplay · surface diff 0 · no other batch · apps + processes readable · container present · harness 0).
2. `batch.log` carries `stimulus preflight PASS: fixture 1a505b3d… · afplay 88f3b577… · default output Mac Studio Speakers (coreaudio_device_type_builtin) · volume 69 · muted false`; `stimulus-preflight/` holds the five files; `stimulus.sha256` and `afplay.sha256` equal the pins; `stimulus-wave-metadata.txt` reads `format=EXACT`; `volume.txt` carries `output volume:69,` and `output muted:false`; `audio-output.json` parses to exactly one default output = Mac Studio Speakers/builtin.
3. `stimulus-sample-1.tsv` is well-formed and complete: `sample 1` · fixture path · fixture SHA = pin · `afplay /usr/bin/afplay` · afplay SHA = pin · `afplayVolume 0.50` · `afplaySeconds 180` · `pid <n>` · `startEpoch` · `preRunState <epoch> alive` · liveness rows **all `alive`**, at ≈1 s spacing, spanning at least the `run_test` wall window recorded in `sample-timing.tsv` (T0…T1) · `postRunState <epoch> alive` · `stopRequestedEpoch` · `waitExitStatus <n>` (the recorded value is custody; 143 is the expected TERM outcome, any other value is recorded and read, not normalised) · `stopEpoch` · **`custody VALID`**; `stopEpoch − startEpoch < 180` (the batch stopped it; the `-t` failsafe did not).
4. Child identity: exactly one `pid` row; `stimulus-sample-1-afplay.log` empty or free of `error`/`failed`; `AFPLAY_PROCESSES_BEFORE=0` and `AFPLAY_PROCESSES_AFTER=0` (the only afplay that ever existed was the batch's child, and it is gone).
5. `run_test` containment: `sample-timing.tsv` has exactly one row; the ledger has exactly one `AUTOMATED-COLD-LAUNCH` row for sample 1 (any class as produced; physiology is recorded, not adjudicated); one journal in `journals/` whose SHA-256 appears in the ledger row; `batch complete` in `batch.log`; `BATCH_PIPELINE_RC=0`.
6. No device act beyond the batch's ordinary reads/launch/pull; no `set volume`, device selection or reinstall anywhere in the transcript.

**STOP / FAIL** is anything else, recorded as infrastructure / witness evidence: a Block A/B STOP is *precondition not met* (nothing played); a batch exit 8 is *stimulus preflight STOP* (nothing played); exit 9 is *child not alive before the invocation* (played ≤ 1 s); `custody INVALID` or any malformed/missing custody field is *custody not proved* (the phone journal, if any, is preserved and is not evidence of anything about S2). None of these authorises a rerun under this authority.

**PASS opens nothing:** S2 population NOT AUTHORIZED · S3 NOT OPEN · KERNEL-00 NOT ACCEPTED · the sample-1 journal is never an S2 row and its §7 reading is not performed.

**Standing after §16:** orchestration `b198e2e37` LANDED · **S2-WITNESS-01 GRANTED, NOT YET EXECUTED (Mac act; evidence owed)** · playback permitted only inside that witness · S2 population NOT AUTHORIZED · S3 NOT OPEN · organism FROZEN · `.vpio02` untouched · `.vpio01` FROZEN · K00/R1 UNTOUCHED · KERNEL-00 NOT ACCEPTED.

### 16.5 Founder confirmation (2026-09-15) — handoff clean · one distinction to carry into the return record

The founder confirms §16 as a clean handoff: fixed subject (`b198e2e37` + the two pinned hashes) · fixed act (exactly one witness invocation, explicitly not an S2 population sample) · fixed epistemic law (§16.4 decides PASS/STOP before the evidence exists). The load-bearing sentence is retained verbatim: *the phone journal is orchestration evidence only; it receives no §7 interpretation and never becomes an S2 row* — the witness cannot quietly become the first population datum merely because the machinery produced the same carrier. The return record (§17, when written) MUST carry this distinction:

```text
S2-WITNESS-01
    proves / fails orchestration custody

S2 population
    remains an unperformed experimental act

same invocation machinery ≠ same evidentiary act
```

Failure law restated by the founder: a failed witness may diagnose what failed; it cannot bootstrap authority to change the instrument and try again.

```text
batch implementation       LANDED        b198e2e37
witness authority          RECORDED      1045bdd6e
witness reading law        PREDECLARED   §16.4

S2-WITNESS-01 Mac act      UNSPENT
S2 population              CLOSED
S3                         CLOSED
KERNEL-00 acceptance       CLOSED
```

The next legitimate event in this lane is the Mac evidence bundle, not another design or implementation act. On its return the only work is custody verification, seal recomputation and adjudication against §16.4; no interpretation is invented after seeing the result.

### 16.6 Path correction for the Mac operator (instruction defect prevented before the act)

The witness directories are written by the batch under **`docs/programme/VOICE-2026/driver-ledger/`** (batch: `LEDGER_DIR="${LEDGER_DIR:-$ROOT/docs/programme/VOICE-2026/driver-ledger/$STRATUM-$STAMP}"`), never under a repo-root `driver-ledger/`. A `find driver-ledger …` run from the repository root returns nothing on a run that succeeded; that empty result is a path miss, not a STOP and not evidence. Exact-path form, from the worktree root, after Block D:

```bash
cd /private/tmp/k0506-s2w-b198e2e37
find docs/programme/VOICE-2026/driver-ledger -maxdepth 1 \( -name 'S2-WITNESS-01-*' -o -name 'S2-WITNESS-01-preflight-*' \) -print
find docs/programme/VOICE-2026/driver-ledger/S2-WITNESS-01-* -maxdepth 2 -type f -print
```

Provenance of the three evidence sources: (1) `S2-WITNESS-01-<stamp>/` is written by the batch during Block C (ledger · journals · `stimulus-preflight/` · `stimulus-sample-1.tsv` · afplay log · timing · daemons · batch.log) and completed by Block D (`transcript.txt` copied in, `SHA256SUMS.witness` sealed); (2) `S2-WITNESS-01-preflight-<stamp>/` is written by Block B (`apps.json` · `processes.json`); (3) the Block A / B / D Terminal output exists only in the Terminal session and must be captured into the bundle by the operator (e.g. `script` or copy of the scrollback into `S2-WITNESS-01-<stamp>/blocks-ABD.txt`) — it is required because several custody facts (gate read, tree clean, both SHAs, afplay process counts before/after) occur outside the batch. All three go into one commit on one `feature/*` branch. This session is not at the Mac; the blocks are already pinned verbatim in §16.3 and are not to be reconstructed from this note.

### 16.7 Execution transport for §16.3 (instruction defect prevented before the act): run each block under `bash` from a file, never pasted into the interactive shell

Two hazards in the pinned text when pasted into an interactive zsh: every STOP is an `exit N`, which would close the Terminal window and lose the scrollback that §16.6 requires as evidence; and Block C's `${PIPESTATUS[0]}` is a bash array (zsh spells it `pipestatus`), so `BATCH_PIPELINE_RC` would print empty. Transport rule: extract each block verbatim from the record at the revision that pinned it (`17b4df63b`; §16.3's lines do not move in later appends), run it with `bash`, capture its output to a file. The blocks' text is unchanged; only the carrier is fixed. Code-line ranges at `17b4df63b`: A 599–625 · B 633–702 · C 710–713 · D 719–732.

```bash
cd /Users/soullab/MAIA-SOVEREIGN
git fetch origin claude/voice-2026-census-01
DOC=docs/programme/VOICE-2026/KERNEL-00_VPIO-02_K00-06_PARTIAL-ZERO_DISCRIMINATOR_PLAN_2026-09-15.md
git show 17b4df63b:$DOC | sed -n '599,625p' > /private/tmp/s2w-blockA.sh
git show 17b4df63b:$DOC | sed -n '633,702p' > /private/tmp/s2w-blockB.sh
git show 17b4df63b:$DOC | sed -n '710,713p' > /private/tmp/s2w-blockC.sh
git show 17b4df63b:$DOC | sed -n '719,732p' > /private/tmp/s2w-blockD.sh
head -1 /private/tmp/s2w-blockA.sh; tail -1 /private/tmp/s2w-blockA.sh
head -1 /private/tmp/s2w-blockB.sh; tail -1 /private/tmp/s2w-blockB.sh
head -1 /private/tmp/s2w-blockC.sh; tail -1 /private/tmp/s2w-blockC.sh
head -1 /private/tmp/s2w-blockD.sh; tail -1 /private/tmp/s2w-blockD.sh
shasum -a 256 /private/tmp/s2w-block[ABCD].sh
```

Expected: A begins `git -C /Users/soullab/MAIA-SOVEREIGN fetch …` and ends `echo "BLOCK_A_PASS=1"`; B begins `cd /private/tmp/k0506-s2w-b198e2e37` and ends `echo "PREFLIGHT_CLEAN=$PF"`; C begins `cd …` and ends `echo "BATCH_PIPELINE_RC=${PIPESTATUS[0]}"`; D begins `cd …` and ends the `( cd "$LD" && shasum … )` line. No fence line, no prose line inside any file; if any file's first or last line differs, STOP and do not run it.

Then, one at a time, reading each output before the next (a non-zero `rc` is the STOP; nothing after it runs):

```bash
bash /private/tmp/s2w-blockA.sh 2>&1 | tee /private/tmp/s2w-blockA.out; echo "rc=${PIPESTATUS[0]}" | tee -a /private/tmp/s2w-blockA.out
```

```bash
bash /private/tmp/s2w-blockB.sh 2>&1 | tee /private/tmp/s2w-blockB.out; echo "rc=${PIPESTATUS[0]}" | tee -a /private/tmp/s2w-blockB.out
```

```bash
bash /private/tmp/s2w-blockC.sh 2>&1 | tee /private/tmp/s2w-blockC.out; echo "rc=${PIPESTATUS[0]}" | tee -a /private/tmp/s2w-blockC.out
```

```bash
bash /private/tmp/s2w-blockD.sh 2>&1 | tee /private/tmp/s2w-blockD.out; echo "rc=${PIPESTATUS[0]}" | tee -a /private/tmp/s2w-blockD.out
```

(The `echo "rc=…"` lines run in the operator's zsh, where `${PIPESTATUS[0]}` is empty — read the block's own last echo line for its result; the `rc=` line is informational only. If the operator's shell is bash, `rc=` carries the block's exit code.)

**Block E — assemble the Terminal evidence into the bundle and return it** (read-only except for the two evidence files it adds and the commit; runs only after Block D produced `SHA256SUMS.witness`; if the act STOPPED earlier, run only the `cat` line into a `blocks-ABD.txt` placed beside whatever directories exist, and commit those):

```bash
cd /private/tmp/k0506-s2w-b198e2e37
LD="$(ls -td docs/programme/VOICE-2026/driver-ledger/S2-WITNESS-01-2* | head -1)"
echo "LEDGER_DIR=$LD"
cat /private/tmp/s2w-blockA.out /private/tmp/s2w-blockB.out /private/tmp/s2w-blockC.out /private/tmp/s2w-blockD.out > "$LD/blocks-ABCD.txt"
( cd "$LD" && shasum -a 256 blocks-ABCD.txt >> SHA256SUMS.witness && tail -1 SHA256SUMS.witness )
STAMP="$(basename "$LD" | sed 's/^S2-WITNESS-01-//')"
git checkout -b "feature/k00-s2-witness-01-evidence-$STAMP"
git add docs/programme/VOICE-2026/driver-ledger/S2-WITNESS-01-*
git status --short
git commit -m "witness(voice-2026): return S2-WITNESS-01 evidence ($STAMP)"
git push -u origin "feature/k00-s2-witness-01-evidence-$STAMP"
git rev-parse HEAD
```

Return the branch name and the `git rev-parse HEAD` value. The pre-commit hook needs `node_modules`, which Block A linked. Nothing in Block E touches the device, the player, the volume or the organism.

## 17. `S2-WITNESS-01` EXECUTED → **STOP at the batch's stimulus preflight (exit 8) — nothing played, nothing sampled** · evidence RECEIVED and VERIFIED HERE · witness NOT PASS · orchestration fail-closed behaviour witnessed on the real Mac

### 17.1 Custody

Founder returned `feature/k00-s2-witness-01-evidence-20260915T122842Z` at `3cbec915b6db3a6ab8757c5d8f839be0f41265dc`, cherry-picked here with `-x` as `706dc4cf2`. Eleven files in two directories (`S2-WITNESS-01-20260915T122842Z/` · `S2-WITNESS-01-preflight-20260915T122817Z/`). Block D never ran (correctly — the act stopped in Block C), so no `transcript.txt` / `SHA256SUMS.witness` exists; the Block A/B/C Terminal output was captured as `blocks-ABCD.txt` under the §16.7 transport and the commit is the custody. SHA-256 of every file as received (recomputed here):

```text
01a79a3023de39393229fc5c898be90614770078088321db72e30849e2404358  S2-WITNESS-01-20260915T122842Z/batch.log
cd75582f493919ad8a5de600fc868815d6bf4ce94f30aba87fe1a947d25f3d93  S2-WITNESS-01-20260915T122842Z/blocks-ABCD.txt
556002e728d7c3a6fd0f9a6d541175a7b00c11d18c0caad2144c2b74476ac1ee  S2-WITNESS-01-20260915T122842Z/ledger.md
06eba1145fb46478cdadc40680978c02eb4b9cd36c974dceb1336336434783b3  S2-WITNESS-01-20260915T122842Z/xcodegen.log
498d16fdffb030242c97ba77ef69ffa4691df27f2a69ca4751ae676314d770c5  S2-WITNESS-01-20260915T122842Z/build-for-testing.log
81d2fbf57485a5244d9082bb429f7c9c5823031d049c8fd79b2619b514428363  S2-WITNESS-01-20260915T122842Z/stimulus-preflight/audio-output.json
5ad16ccb77db01f635bdf77e713faf3d90b69298b4d53ef7331a6920958dbc32  S2-WITNESS-01-20260915T122842Z/stimulus-preflight/stimulus.sha256
b4b77a9378f1972b2143b1326ebcc5969daaff056c9f1d598d86608e9812e2b4  S2-WITNESS-01-20260915T122842Z/stimulus-preflight/stimulus-wave-metadata.txt
dbb842b2ba78319047525f51195ac3b0f7d3ffa96d0fd231a427722181b0f056  S2-WITNESS-01-20260915T122842Z/stimulus-preflight/volume.txt
20cd53b85f15185baa6f92561d0e9944f5cd2e2c070fcc3c49311798cff05f06  S2-WITNESS-01-preflight-20260915T122817Z/apps.json
8b0577575b8bff090a1b7c07395636b06ec05007ef7fb90177b7f1d3f447160e  S2-WITNESS-01-preflight-20260915T122817Z/processes.json
```

### 17.2 What the files say (read here; nothing taken from the summary)

**Block A (custody) — every gate line present, in order:** worktree created detached at `b198e2e37` · `HEAD=b198e2e37058f2e059d986b4b148e224215f3ee3` · `TREE_CLEAN=1` · `Tests: 75 passed, 75 total` → `GATE_75_75=1` · `FIXTURE_SHA=1a505b3d…` (= pin) · `AFPLAY_SHA=88f3b577…` (= census pin, read from the real `/usr/bin/afplay`) · `AFPLAY_PROCESSES_BEFORE=0` · `BLOCK_A_PASS=1`. **Block B (device preflight):** `PREFLIGHT_DIFF_RC=0` · `OTHER_BATCHES=0` · `APPS_READ_RC=0` · `E3B88028_CONTAINER_HITS=1` (verified in `apps.json`) · `PROCESS_READ_RC=0` · `VoiceKernelHarness processes: 0` (478 process rows, 0 harness, verified in `processes.json`) · `PREFLIGHT_CLEAN=…122817Z`. The `rc=` trailer lines are empty exactly as §16.7 said they would be under zsh; each block's own last echo is the result.

**Block C (the one invocation):** `xcodegen` PASS · driver `build-for-testing` `** TEST BUILD SUCCEEDED **` ×1 (0 `devicectl` / `install` / `test-without-building` in the build log — the phone was never launched) · xctestrun resolved · ledger header written (`stratum=AUTOMATED-COLD-LAUNCH · N=1 · vp=on · mode=L · subject=vpio-02 · bundle=.vpio02`, the S2 `stimulus=` line, installed identity `VoiceKernel VPIO-02`, last reinstall `20260913T145025Z`) · then the batch's stimulus preflight, in the pinned order: fixture present → `stimulus.sha256` = `1a505b3d…` (pin MATCH) → `stimulus-wave-metadata.txt` `channels=1 sampleRate=48000 sampleWidthBytes=2 frames=8640000 seconds=180.000 · format=EXACT` → `audio-output.json` parsed here: **exactly one default output, `Mac Studio Speakers`, `coreaudio_device_type_builtin`, 48000 → `DEFAULT_OUTPUT_MATCH True`** (B06Ultra present, not default) → `volume.txt`: **`output volume:31, input volume:missing value, alert volume:59, output muted:false`** → **`STOP: output volume is not 69 (…) — read-only precondition, nothing changed`** → `STOP: stimulus preflight failed — nothing played, nothing sampled` → **`BATCH_PIPELINE_RC=8`**. The afplay clause was never reached (no `afplay.sha256` in `stimulus-preflight/`, by the pinned order). Ledger: header only, zero rows. No journal, no `stimulus-sample-1.tsv`, no afplay log. Zero rows in the phone journal set; the vpio-02 corpus count is unchanged (50).

### 17.3 Adjudication under §16.4 (predeclared; nothing invented after the result)

**STOP — *stimulus preflight STOP (nothing played)*.** Criterion 1 (Blocks A and B) satisfied in full; criterion 2 failed on exactly one clause — the ruled read-only precondition `output volume 69` read `31`. Criteria 3–5 are unreachable and unassessed. **The witness is NOT PASS.** No physiology exists; no §7 reading arises; §16.5's distinction stands trivially (no journal was produced, so nothing can be mistaken for a population row). Under the fail-closed rule, no repair and no rerun occurred under this authority — the founder stated it and the files confirm it (one batch stamp, one preflight stamp, nothing after the STOP). **`S2-WITNESS-01` authority SPENT.**

### 17.4 What the STOP is evidence of (recorded, not interpreted beyond the files)

- **The orchestration's fail-closed preflight behaved on the real Mac exactly as the offline instrument claimed for that branch:** fixture custody, exact format and the default-output identity all PASSED against the live machine, and the first clause that did not match stopped the act before any player process existed. This is not a PASS of the witness; it is the STOP branch of the same instrument, witnessed once.
- **The Mac's output volume was `31` at 12:28:50Z.** The preparation after-read (§14.9) recorded `69` at `20260915T022305Z`. No authorized act set a volume between those reads (the preparation, the batch and every pinned block only read volume; the gate forbids any set-volume code). **The cause of the change from 69 to 31 is UNKNOWN and is not inferred here** (candidate mechanisms exist — keyboard volume keys, another application, a device re-select restoring a per-device level — none is asserted). The `69` precondition was ruled as custody of the preparation reading; on this Mac, that value did not hold for ten hours without any governed act touching it.
- Everything else read as ruled: Mac Studio Speakers still the one default output on the builtin transport; B06Ultra present and not default; harness absent; container present; `.vpio02` untouched; no device act beyond the two read-only listings and the driver build.

### 17.5 Standing · returned for ruling

```text
S2-WITNESS-01              EXECUTED · STOP (stimulus preflight, volume 31 ≠ 69) · authority SPENT
playback                   NONE occurred · NOT AUTHORIZED
S2 population              CLOSED
S3                         CLOSED
KERNEL-00 acceptance       CLOSED
orchestration b198e2e37    unchanged · fail-closed branch witnessed once on the real Mac
```

Returned to the founder, not chosen here: (a) the volume-precondition question — whether `69` remains the ruled read-only precondition (in which case a separate, founder-performed, read-then-hand-then-read preparation act shaped like §14 would be needed to re-establish it before any second witness authority) or whether the precondition is re-ruled (any change to the batch's pinned `S2_OUTPUT_VOLUME` = new orchestration SHA = new gate read = new authority; the batch does not, and must not, set volume); (b) whether the 69→31 drift is to be characterised further by read-only means before either path; (c) whether a second `S2-WITNESS-02` authority is issued at all. None of these is opened by this record.

## 18. FOUNDER RULING (2026-09-15) — **69 STAYS the precondition** · `S2-VOLUME-DRIFT-01` OPEN (read-only) · restoration = founder hand act · `S2-WITNESS-02` NOT ISSUED

*(Heading corrected in commit two after `84c68cd42`: the two backticked identifiers were lost to command substitution in this session's unquoted heredoc while writing §18 — a record-transport defect of this session, visible as two `command not found` lines on stderr; the §18 body and §10.24 were written with escaped backticks and are intact. No evidence or instrument was affected.)*

### 18.1 Ruling (substance preserved)

Keep `69`. Do not re-rule the batch around the observed `31`. The STOP is evidence that the instrument did exactly what it was designed to do when the live machine departed from the prepared state; changing the acceptance condition because the machine drifted would convert a successful refusal into pressure to weaken the refusal. *31 ≠ evidence that 69 was wrong; 31 = evidence that the prepared state did not persist; cause UNKNOWN.* **(1) `S2-VOLUME-DRIFT-01` AUTHORIZED, read-only:** *what can the Mac tell us, without changing anything, about the transition from 69 to 31?* — inspection of current output/device state, relevant system/audio logs if available, process/application state, configuration/preferences, and repository evidence bearing on volume mutation. NOT authorized: set volume · restore 69 · playback · `run_test` · S2 sample · batch modification · new stimulus · any causal claim unsupported by evidence. May end *cause found* / *candidate mechanism* / *cause unknown* — unknown is valid. **(2) Restoration remains a human boundary:** if 69 is still the ruled state after the census, restoring it is a founder-performed read → hand → read act shaped like §14; *machine may READ 69 · founder may SET 69 · machine may READ 69 afterward · the instrument still may not SET 69*; the before/after readings are custody for the next witness. **(3) `S2-WITNESS-02` not pre-authorized:** census → restoration (only if 69 remains) → post-hand read proves 69 → a new witness authority as its own act; it may reuse `b198e2e37` if nothing in the batch changes. If 69 itself is ever changed, that is a new orchestration artifact, gate evidence and fresh authority. *The refusal earned confidence in the boundary; it did not earn permission to move the boundary.*

### 18.2 Repository half of the census — DONE here, read-only

- **No volume-mutation code exists in the instrument surface or the organism.** `git grep` over `scripts/` · `ios/` · `__tests__/` · `package.json` for `set volume|setVolume|SwitchAudioSource|blueutil|kAudioDevicePropertyVolume|AudioDeviceSetProperty|osascript`: the only `osascript` calls are the two volume READS (`k00-driver-batch.sh:182` stimulus preflight; `k00-playback-probe.sh:37`) and one unrelated `display notification … sound name "Glass"` in `scripts/storage-health-monitor.sh:219` (posts a notification; sets nothing; not part of any witness act). The gate already forbids set-volume verbs in the batch and the probe.
- **Timeline of every governed volume read (all `output muted:false`, alert volume 59 throughout):** `playback-probe-20260915T020250Z` → **25** (default output B06Ultra/Bluetooth) · `s2-output-source-20260915T022305Z` before → **25** (B06Ultra) · after → **69** (Mac Studio Speakers, the founder's Control Center selection between the two reads) · `S2-WITNESS-01` 12:28:50Z → **31** (Mac Studio Speakers). Three distinct values on the built-in device across two reads ten hours apart with no governed act between them.
- **Device state did not move.** The `SPAudioDataType` capture in the witness preflight is property-for-property identical to the preparation after-read (same seven devices, same default output, transport and sample rates; B06Ultra present, not default) — only the volume scalar differs.
- No causal claim is made from the repository half. It rules out the instrument surface as the actor; it says nothing about what did act.

### 18.3 Mac half — instrument PINNED, NOT RUN: `scripts/witness/k00-volume-drift-census.sh` (commit `302b7bc4745e6ba59eb9ba3dff7e913bc7de244b`, gate 76/76)

Reads only, into `docs/programme/VOICE-2026/driver-ledger/volume-drift-<stamp>/`: `osascript -e 'get volume settings'` · `system_profiler SPAudioDataType -json` · `system_profiler SPBluetoothDataType -json` (is B06Ultra connected / when) · `uptime` · `who -b` · `last reboot` · `last shutdown` · `pmset -g log` filtered to Sleep/Wake/DarkWake/Display lines · `pmset -g assertions` · full `ps -axo pid,ppid,lstart,etime,user,comm` · audio-related preference domains discovered by name from `defaults domains` (audio|sound|volume|coreaudio|bluetooth|systemsound) and then `defaults read` only · `~/Library/Preferences` and `ByHost` listings filtered the same way · `log show --help` + `man log` captured first, then ONE `log show --last $LAST --style syslog --predicate 'subsystem == "com.apple.coreaudio" OR process == "coreaudiod" OR eventMessage CONTAINS[c] "volume"'` whose raw output stays OFF-repo at `/private/tmp/k00-volume-drift-<stamp>/log-window.txt` (line count + SHA-256 recorded; only the `volume` and device-name subsets enter the census directory). Manifest with `volumeSet · deviceSelected · soundPlayed · phoneTouched · preferencesWritten` all false + `SEAL.sha256`. The gate pins every mutation verb absent, every `osascript` a read, every `defaults` a `domains`/`read`, every `system_profiler` a JSON read, the single `log show`, the off-repo raw path, and that the batch is untouched.

**Window note:** `K00_DRIFT_LOG_LAST` defaults to `14h`. The transition lies between 02:23:05Z (after-read, 69) and 12:28:50Z (witness, 31); the window must reach back past 02:23Z from the moment the census runs, so set `K00_DRIFT_LOG_LAST` to at least (hours since 02:23Z + 1)h — e.g. a run at 16:00Z needs `15h`. The log level read is default (no `--info`/`--debug`); a silent window is a visibility boundary, not evidence of no event (the §7.17 rule).

**Invocation (Mac; fresh detached worktree at the branch tip; paste as a block; no device verb inside):**

```bash
git -C /Users/soullab/MAIA-SOVEREIGN fetch origin claude/voice-2026-census-01
git -C /Users/soullab/MAIA-SOVEREIGN worktree add --detach /private/tmp/k0506-drift-census origin/claude/voice-2026-census-01
cd /private/tmp/k0506-drift-census
git rev-parse HEAD
grep -c "volumeSet" scripts/witness/k00-volume-drift-census.sh
K00_DRIFT_LOG_LAST=16h scripts/witness/k00-volume-drift-census.sh
```

Expected: the HEAD line · `1` · per-file captures · `files: N` · `sealed: <sha>  manifest.json` · `census written: …/volume-drift-<stamp>` · the off-repo raw path. Return the whole `volume-drift-<stamp>/` directory on a `feature/*` branch; it is cherry-picked here, the seal recomputed, and the reading written as §18.4 with one of the three ruled outcomes. **Nothing about this act touches volume, device, player, phone or batch; the restoration hand act (§18.1 item 2) is separate and not part of the census.**

**Standing after §18:** `S2-WITNESS-01` STOP adjudicated · authority SPENT · fail-closed behaviour witnessed · 69 RULED to stand · **`S2-VOLUME-DRIFT-01` AUTHORIZED, instrument pinned, NOT RUN** · founder restoration act NOT part of the census, NOT opened · `S2-WITNESS-02` NOT ISSUED · S2 population · S3 · KERNEL-00 acceptance CLOSED · organism FROZEN · `.vpio02` untouched.

### 18.4 `S2-VOLUME-DRIFT-01` — Mac half EXECUTED (founder) · evidence RECEIVED and VERIFIED HERE · reading: **CANDIDATE MECHANISM** (not cause found; not unknown)

#### 18.4.1 Custody

- Evidence branch `feature/k00-s2-volume-drift-01-evidence-20260915T125109Z`, HEAD `7447a6b1de14616929a7855ea0ea4a69306b575d`, cherry-picked here as `edb138f70` (`-x`). Directory `driver-ledger/volume-drift-20260915T125109Z/`, **36 files**. `SEAL.sha256` = `e3dbc8f117ac747093ad675e3a7b84c2d4500d5fb421283a012c5a04df4fce27` = sha256 of `manifest.json` recomputed here; all 36 manifest hashes recomputed here = recorded. `manifest.json`: `act S2-VOLUME-DRIFT-01` · `executionHead 3284a51ff…` (= the branch tip the invocation pinned) · `volumeSet false` · `deviceSelected false` · `soundPlayed false` · `phoneTouched false` · `preferencesWritten false` · raw log off-repo at `/private/tmp/k00-volume-drift-20260915T125109Z/log-window.txt`, sha `cd3c5bd6…`, 34 692 lines, window `16h` (founder-supplied `K00_DRIFT_LOG_LAST=16h`, as §18.3 required to reach back past 02:23Z). The in-repo `log-volume-lines.txt` (19 837 lines) and `log-device-lines.txt` (4 lines) are the instrument's fixed-pattern extracts of that raw window; every line quoted below is from those two files, `pmset-log-sleepwake.txt`, `ps.txt`, `volume-now.txt`, `audio-devices.json`, `bluetooth.json`.
- Founder-disclosed, preserved: `node_modules` was linked into the census worktree for the commit hook only; no rerun; nothing changed after capture. Capture instant `2026-09-15T12:51:09Z` = `08:51:09 EDT` (Mac local offset −04:00; every local time below is EDT).

#### 18.4.2 What the captures say (read here; nothing taken from the summary)

1. **Volume at capture: still 31.** `output volume:31, input volume:missing value, alert volume:59, output muted:false` (12:51:09Z). Default output still `Mac Studio Speakers` (`spaudio_yes` on both default-output and default-system-output, transport `coreaudio_device_type_builtin`); B06Ultra present, not default, listed `device_connected` (`AVRCP A2DP ACL`). Same seven audio devices as the preparation after-read and the witness preflight.
2. **No reboot, no sleep in the window.** `uptime` 15 days 20:18; `system boot Aug 30 12:33`; `pmset -g log` shows no sleep/wake transition between 02:23Z and 12:28Z. Screen lock `22:37:03` local (`loginwindow startScreenLock`, 02:37Z); display turned on `07:03:54` local (11:03:54Z) by a HID event (`UserIsActive … iohideventsystem … tickle`, `Display is turned on`).
3. **Coverage limit, stated first.** `com.apple.coreaudio`-subsystem entries exist in the retained default-level window **only from 07:08:31 local onward** (23 in the 07 hour, 43 in the 08 hour, none earlier); `coreaudiod[428]` itself has exactly 14 entries, all in the 07 hour. The preparation act (22:23 local, 02:23Z) lies inside the requested window but has **zero** coreaudio entries and no `default output device changed` line from the two client processes that logged one at 07:25:48 (both were running at 22:23: `Messages` since Sep 12, `Camo Studio` PID 54266). **Absence at 22:23 is therefore a retention/coverage fact, not evidence** about that act. The window contains no entry whose text carries a volume value: every `LogVolumeChangeForServerSideControl` line redacts it as `volume <private>`.
4. **A System Settings → Sound session opened at 07:25 local and was still open at capture.** `ps`: `System Settings` PID 48974 started `07:25:23`; `Sound.appex` PID 49015 started `07:25:29`; both alive at 08:51 (etime 01:25). At `07:25:29.642` `Sound[49015]` activated `com.apple.coremedia.volumecontroller.xpc` and registered for `com.apple.sound.alertVolumeChanged`.
5. **The default output device changed at `07:25:48.100` local (11:25:48Z), inside that session** — four simultaneous, independent witnesses:
   - `Messages[22428]` and `Camo Studio[54266]`: `HAL notification: default output device changed` → `fetched default output device, ID = 128` (`log-device-lines.txt`, the only four device lines in the window).
   - `ControlCenter[737]` `[com.apple.controlcenter:sound] Can set system volume for output device id:` **`4e5` in every line before this instant (6 lines, 07:08:31–07:25:33) and `7f` in every line after it (109 lines, 07:25:48–08:51)** — the device whose volume the system-volume control targets changed identity at that instant.
   - `pmset`: `coreaudiod` **`TurnedOff PreventUserIdleSystemSleep "com.apple.audio.11-22-33-44-66-D5:output.context…"` age `18:02:04`** — the B06Ultra output context (its Bluetooth address) had been alive since ≈13:23 local Sep 14 (≈17:23Z), i.e. through the playback probe, through the preparation act that made Mac Studio Speakers default, and through the night, and stopped at 07:25:48; two further coreaudiod contexts (16382, 16316) released at the same second.
   - `AirPlayXPCHelper[404]` `FigVolumeControllerSaveRoutingContextState` for `System Audio` and `Video` routing contexts at the same millisecond.
   The Sound pane's `playVolumeKeyFeedback` fired at 07:25:48.172 and .192, 70–90 ms after the change.
6. **Fourteen explicit server-side volume changes followed, 07:32:18 → 07:56:59 local (11:32–11:56Z).** `coreaudiod[428] HALB_Logging.cpp:53 LogVolumeChangeForServerSideControl … control id 138 … control element 0, volume <private>` ×14: seven within 2.1 s at 07:32:18.058–07:32:20.152 (the shape of a slider drag or repeated key presses), three at 07:38:17–19, two at 07:42:16, two at 07:56:58–59. **Every one is coincident (±70 ms) with a `Sound[49015] playVolumeKeyFeedback` firing.** The owning device UID and the value are `<private>` at default level. `Google Chrome` held `NoIdleSleepAssertion "Playing audio"` 07:32:21–07:33:35 and coreaudiod's `BuiltInSpeakerDevice.context` assertion ran 07:32:22–07:33:43 — the built-in speakers were rendering during the first burst.
7. **`playVolumeKeyFeedback` fired 34 times in the window** (07:25:29 → 08:46:06); the last firing before the witness read at 08:28:42 local is **08:21:53**. Firings at 07:25:29–07:25:41 (before the device change) and after 07:56:59 (08:05, 08:06, 08:21 ×2, 08:37, 08:46) have **no** matching `coreaudiod` volume-change entry — so the feedback method is not, by itself, evidence of a volume write; only the 14 coreaudiod lines are.
8. **Nothing else in the window writes volume.** No `set volume` / `SetVolume` / `setOutputVolume` / `VirtualMainVolume` vocabulary anywhere; `systemsoundserverd` reports a constant `user vol 0.666334` on all 65 UI-sound starts from 07:08:31 to 08:51:07 (this value did not move across the 07:32–07:56 changes, so it is not the main output scalar; recorded, not interpreted). `arkaudiod` (Loopback) and `Music.app` have run since boot; neither logs in the window. No preference-domain capture contains a volume key.

#### 18.4.3 Reading under the ruling's three outcomes

**Outcome: CANDIDATE MECHANISM.** Two mechanisms are witnessed in the drift interval, both inside an interactive System Settings → Sound session on the Mac Studio that began 07:25:23 local (11:25:23Z), one hour before the witness read 31:

- **M1 — default-output-device change at 07:25:48 local.** macOS keeps output volume per device, and `get volume settings` reports the current default device's scalar (this is how 25 became 69 at the preparation act without any volume command). The change at 07:25:48 is witnessed by four independent processes; its end state at 12:28Z and 12:51Z is `Mac Studio Speakers`, the same name as before. Whether it was a change to another device and back (a second change would have been logged by the same two clients; none is, through 08:51), or a re-creation of the same physical device's HAL object (ControlCenter's target id `4e5 → 7f`; the HAL id fetched was 128), **is not determined from the window** — `device UID` is redacted.
- **M2 — fourteen server-side volume changes 07:32:18–07:56:59 local on control id 138**, each coincident with the Sound pane's own volume-feedback firing, values redacted.

**What is NOT established:** which of M1/M2 produced 31 (M2 is the only witnessed volume *write*; M1 could have changed which device's scalar is read); the value written at any step; the owning device of control 138; the actor. **No line writes 31; no line names 69.** Cause is therefore not *found*; it is also not *unknown*: the interval contains a specific, timestamped, multiply-witnessed mechanism family and nothing else that can move the scalar.

**Actor: recorded, not inferred.** The window shows a person-shaped session (HID wake 07:03:54 → System Settings 07:25:23 → Sound pane → Chrome audio 07:32 → feedback firings to 08:46), on the logged-in user's desktop. Who sat at the Mac is outside the census and is not inferred, per the ruling.

#### 18.4.4 What this changes and does not change

- **The ruling stands unchanged: 69 stays; restoration is a founder read → hand → read act.** The census confirms the ruling's own reading: *31 is evidence that the prepared state did not persist*, and now names how prepared state on this Mac is exposed — the Sound pane and the volume keys of a Mac in ordinary daily use, and per-device volume semantics under any default-device change. Neither the instrument nor the organism touched it (repository half, §18.2; `manifest` flags all false).
- **Structural note for the next witness (observation, not authority):** the S2 precondition is a *scalar on a shared desktop*, and the only lawful writer is the founder's hand. The window between restoration and invocation should be minutes, not hours, and the Sound pane should be closed at the restoration read — both are founder conduct, not instrument changes. The batch's own preflight already refuses on drift; that refusal is what §17 witnessed. No new precondition, no wider tolerance, no instrument change is proposed from this reading.
- **A second output context on the Bluetooth device outlived the preparation act by nine hours** (item 5). This is descriptive: it says a client held B06Ultra open while Mac Studio Speakers was default, which S2's preflight does not and need not read (it reads the default device only). Recorded for the record; no act follows from it.

**Standing after §18.4:** `S2-VOLUME-DRIFT-01` **CLOSED — CANDIDATE MECHANISM** (M1 device change at 11:25:48Z · M2 fourteen volume writes 11:32–11:56Z, inside a System Settings → Sound session on the Mac Studio; actor not inferred; value never logged) · 69 STANDS · **restoration NOT YET PERFORMED** (founder read → hand → read; its evidence returns on `feature/*` like §14) · `S2-WITNESS-02` NOT ISSUED (its own act after the post-hand read; `b198e2e37` reusable if the batch is unchanged) · S2 population · S3 · KERNEL-00 acceptance CLOSED.

### 18.5 FOUNDER RULING (2026-09-15) — `S2-VOLUME-DRIFT-01` **CLOSED · candidate mechanism** (accepted as read in §18.4) · **`S2-VOLUME-RESTORE-01` AUTHORIZED** (founder read → hand → read, shaped by §14) · `S2-WITNESS-02` NOT YET ISSUED

#### 18.5.1 Ruling (substance preserved)

- `S2-VOLUME-DRIFT-01` accepted as closed with outcome **candidate mechanism** — not cause found, not cause unknown. The 07:25:48 default-output transition plus the subsequent server-side volume writes inside the active Sound session is enough to move beyond "unknown"; the redacted values prevent saying which event produced 31.
- **`S2-VOLUME-RESTORE-01` AUTHORIZED** as a founder-performed read → hand → read act. Authorized: close System Settings / Sound first · a short settling interval · machine READ current output device + volume · founder manually SETS output volume to 69 · machine READ device + volume again · both reads and timestamps preserved · evidence returned on `feature/*`. Not authorized: instrument sets volume · playback · `run_test` · phone invocation · S2 sample · `S2-WITNESS-02` · batch modification.
- Post-hand acceptance condition, narrow: `default output = Mac Studio Speakers` · `transport = builtin` · `volume = 69` · `muted = false`. Anything else → STOP; no further adjusting under the same act.
- The §18.4.4 conduct note stands as execution discipline, not as an instrument requirement: *restore with the Sound pane closed and shortly before the next witness.* The Sound session is a witnessed candidate mechanism family for scalar movement; it need not be proven the cause to be kept closed during preparation.
- Standing: 69 RULED, unchanged · `b198e2e37` reusable if the batch remains byte-unchanged · S2 population · S3 · KERNEL-00 acceptance CLOSED. **A successful restoration read does not itself authorize the second witness**; `S2-WITNESS-02` gets its own authority after the restoration evidence is returned.

#### 18.5.2 Pinned sequence for `S2-VOLUME-RESTORE-01` (Mac; founder; paste-able; no `#` comment lines; every command a read except the founder's hand)

Step 0 — close the Sound pane by hand (System Settings → quit, ⌘Q). Then wait a short settling interval (the ruling names none; 30 s is proposed). Then confirm it is closed, by a read only:

```bash
pgrep -fl "System Settings|Sound.appex" ; echo "[pgrep rc=$?]"
```

Expected: no process line and `[pgrep rc=1]`. A listed process = the pane is still open → close it by hand and re-read; this step is preparation, not a sample, and may repeat.

Step 1 — before-read (the same reads as §14.2; `SPBluetoothDataType` added so B06Ultra's connection state is on the record; `date -u` first so the stamp is the timestamp of record):

```bash
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="/private/tmp/k00-s2-volume-restore-$STAMP"
mkdir -p "$OUT"
date -u +%Y-%m-%dT%H:%M:%SZ > "$OUT/before-utc.txt"
system_profiler SPAudioDataType -json > "$OUT/audio-before.json"
system_profiler SPBluetoothDataType -json > "$OUT/bluetooth-before.json"
osascript -e 'get volume settings' > "$OUT/volume-before.txt"
pgrep -fl "System Settings|Sound.appex" > "$OUT/sound-pane-before.txt" ; echo "rc=$?" >> "$OUT/sound-pane-before.txt"
cat "$OUT/volume-before.txt"
echo "$OUT"
```

Expected before-state on the census evidence: `output volume:31, … output muted:false`, and `rc=1` in `sound-pane-before.txt`.

Step 2 — **exactly one hand act: set the output volume to 69.** The ruling names the value, not the control; §14's act used Control Center. Whichever control is used, it is one act; no device selection, no test sound, no second adjustment after the after-read.

Step 3 — after-read, immediately afterwards, then the parser (the §14.2 device parser extended with the volume line; every key it reads exists in the captured JSON, as verified in §14.2/§14.9):

```bash
date -u +%Y-%m-%dT%H:%M:%SZ > "$OUT/after-utc.txt"
system_profiler SPAudioDataType -json > "$OUT/audio-after.json"
osascript -e 'get volume settings' > "$OUT/volume-after.txt"
pgrep -fl "System Settings|Sound.appex" > "$OUT/sound-pane-after.txt" ; echo "rc=$?" >> "$OUT/sound-pane-after.txt"

python3 - "$OUT/audio-after.json" "$OUT/volume-after.txt" <<'PY'
import json, re, sys

raw = open(sys.argv[1], encoding="utf-8").read()
raw = raw[raw.find("{"):raw.rfind("}")+1]
d = json.loads(raw)

items = []
for group in d.get("SPAudioDataType", []):
    items.extend(group.get("_items", []))

defaults = [
    x for x in items
    if x.get("coreaudio_default_audio_output_device") == "spaudio_yes"
]

for x in defaults:
    print(
        "DEFAULT_OUTPUT",
        x.get("_name"),
        x.get("coreaudio_device_transport"),
        x.get("coreaudio_device_srate"),
    )

mac = next((x for x in items if x.get("_name") == "Mac Studio Speakers"), None)
mac_default = bool(mac and mac.get("coreaudio_default_audio_output_device") == "spaudio_yes")
print("MAC_STUDIO_DEFAULT_OUTPUT", mac_default)

vol = open(sys.argv[2], encoding="utf-8").read()
m_vol = re.search(r"output volume:(\d+)", vol)
m_mute = re.search(r"output muted:(true|false)", vol)
volume = int(m_vol.group(1)) if m_vol else None
muted = m_mute.group(1) if m_mute else None
print("OUTPUT_VOLUME", volume)
print("OUTPUT_MUTED", muted)

ok = (
    len(defaults) == 1
    and mac_default
    and defaults[0].get("coreaudio_device_transport") == "coreaudio_device_type_builtin"
    and volume == 69
    and muted == "false"
)
print("RESTORE_ACCEPTANCE", "PASS" if ok else "STOP")
PY
```

Step 4 — seal the captures for return (read-only):

```bash
( cd "$OUT" && shasum -a 256 before-utc.txt audio-before.json bluetooth-before.json volume-before.txt sound-pane-before.txt after-utc.txt audio-after.json volume-after.txt sound-pane-after.txt > SHA256SUMS && cat SHA256SUMS )
```

#### 18.5.3 PASS / STOP (as ruled; literals from the captured JSON vocabulary)

PASS requires all of, on the after-read:

```text
exactly one DEFAULT_OUTPUT line
name        Mac Studio Speakers
transport   coreaudio_device_type_builtin
MAC_STUDIO_DEFAULT_OUTPUT True
OUTPUT_VOLUME 69
OUTPUT_MUTED  false
RESTORE_ACCEPTANCE PASS
```

Custody only, not criteria: the before-read values (expected 31 / Mac Studio Speakers) · the sample rate on the `DEFAULT_OUTPUT` line · B06Ultra's connection state · `sound-pane-*.txt` (expected `rc=1` both times; a pane open at the after-read is recorded, not a STOP by this ruling, but it contradicts the execution discipline and should be stated). Anything else is **STOP**: no second adjustment, no device selection, no playback, no S2 execution; the evidence returns as it is and the founder rules again.

#### 18.5.4 Return

Copy `$OUT` into the repo as `docs/programme/VOICE-2026/driver-ledger/s2-volume-restore-<STAMP>/` on a `feature/*` branch, commit, push, and report `BRANCH · HEAD · STAMP · the parser's seven lines · the SHA256SUMS`. This session cherry-picks it, recomputes every hash, runs the same parser on the returned `audio-after.json` + `volume-after.txt`, and records §18.6. Nothing here plays, samples, touches the phone, or edits the batch; `b198e2e37` is not moved.

**Standing after §18.5:** `S2-VOLUME-DRIFT-01` CLOSED · candidate mechanism · 69 RULED · **`S2-VOLUME-RESTORE-01` AUTHORIZED, pinned, NOT YET EXECUTED (founder hand act)** · `S2-WITNESS-02` NOT ISSUED · `b198e2e37` reusable if the batch is byte-unchanged · S2 population · S3 · KERNEL-00 acceptance CLOSED.

**Parser verification (this session, offline, before commit):** the §18.5.2 parser was extracted verbatim from this record and run against two real captures already in the repo — the §14.9 after-read (`s2-output-source-20260915T022305Z`: `DEFAULT_OUTPUT Mac Studio Speakers coreaudio_device_type_builtin 48000` · `MAC_STUDIO_DEFAULT_OUTPUT True` · `OUTPUT_VOLUME 69` · `OUTPUT_MUTED false` · **`RESTORE_ACCEPTANCE PASS`**) and the census capture (`volume-drift-20260915T125109Z`: same device line · `OUTPUT_VOLUME 31` · `OUTPUT_MUTED false` · **`RESTORE_ACCEPTANCE STOP`**). Both branches of the acceptance line are exercised on real data; the only untested input is the one the founder's hand will produce.

#### 18.5.5 First Step 0 read (founder-relayed, 2026-09-15): pane still open → preparation not complete · act NOT started

The read-only Step 0 check returned `System Settings` · `GeneralSettings.appex` · `Sound.appex` · `[pgrep rc=0]` — the Sound session the census found alive at 12:51Z was still resident. Founder-stated: Step 1 not run, no before-read created, no volume change, no audio state touched. Under §18.5.2 this is a preparation read that may repeat; it is not a sample and not a STOP of the act. The quit (⌘Q) is a physical act at the Mac Studio that no session may substitute (§14.7 rule); this session has no Mac. The act resumes only when Step 0 returns no process and `[pgrep rc=1]`; nothing else in §18.5.2 runs before that.

#### 18.5.6 Step 1 captured (founder-relayed, 2026-09-15): before-read `20260915T132000Z` · output volume **44** · muted false · hand act pending

Relayed from the Mac session: Step 0 passed on the reread (implied by Step 1 having run; the file `sound-pane-before.txt` will carry the `rc=1`), then Step 1 wrote `/private/tmp/k00-s2-volume-restore-20260915T132000Z/` with `output volume:44, … output muted:false`. Under §18.5.3 the before value is custody only, not a STOP criterion. Recorded, not inferred: the scalar moved again between the census capture (31 at 12:51:09Z) and this before-read (44 at 13:20Z), an interval during which the Sound session found alive in §18.5.5 was still resident for at least part of the time — consistent with the §18.4.3 candidate mechanism, attributed to nothing. The one hand act (set 69; no device selection, no test sound, no second adjustment) is the founder's and had not been performed at the time of this note; Steps 3–4 run on the Mac after it. Nothing here changes the act, the acceptance condition or the standing.

#### 18.5.7 HOLD at Step 2 (Mac session, founder-relayed, 2026-09-15): the hand boundary — a BLOCKED act, not a failed one (§14.7 shape)

The Mac session reports terminal access only, no GUI/mouse surface; every method available to it for changing the volume (`osascript`, accessibility scripting) would be an instrument mutation, which §18.5.1 forbids. It therefore did not change the volume and did not run Steps 3–4. Custody: Step 0 ✅ (pane closed, `rc=1`) · Step 1 ✅ (`20260915T132000Z`, volume 44, muted false) · Step 2 ⛔ NOT PERFORMED · Step 3 ⛔ NOT RUN · Step 4 ⛔ NOT RUN. This session has no GUI either. Lawful paths, exactly as §14.7: **path 1** a human hand at the Mac Studio (physical or ordinary screen sharing) sets 69 once, then the Mac session runs Steps 3–4 under the same stamp; **path 2** a new founder ruling authorizing a different mechanism as a new act. Neither session chooses. Conduct note: the before-read is a reading at a time; if the hand comes much later, Steps 0–1 are re-run under a fresh stamp rather than pairing a stale before-read with a new after-read (conduct within §18.5.2, not a change to it). Standing unchanged: 69 RULED · `S2-VOLUME-RESTORE-01` AUTHORIZED · HELD at Step 2 · `S2-WITNESS-02` NOT ISSUED.

**Founder confirmation (2026-09-15) of §18.5.7:** act status BLOCKED, not failed · Step 2 ⏸ HOLD, human hand unavailable · the boundary is explicit — neither the remote record-keeper nor the Mac terminal session may substitute automation for the founder hand act · stale-read continuation confirmed as the lawful one (fresh Step 0 → fresh Step 1 → one hand act → Step 3 → Step 4 under a new stamp; `20260915T132000Z` remains custody of the blocked attempt, never paired with a later after-read) · nothing further in this lane until a lawful human hand is available at the Mac Studio or a new founder ruling authorizes a different restoration mechanism as a separate act · `S2-WITNESS-02` · S2 population · S3 · KERNEL-00 acceptance remain CLOSED.

### 18.6 `S2-VOLUME-RESTORE-01` EXECUTED (fresh stamp `20260915T134328Z`) → **STOP** (`OUTPUT_VOLUME 73 ≠ 69`) · evidence RECEIVED and VERIFIED HERE · authority SPENT · volume to be left alone

#### 18.6.1 Custody

- Evidence branch `feature/k00-s2-volume-restore-01-evidence-20260915T134328Z`, HEAD `47ba68d30f1812b7dce5647db49d83754679bf4f`, cherry-picked here as `a8dad7942` (`-x`). Directory `driver-ledger/s2-volume-restore-20260915T134328Z/`, nine files + `SHA256SUMS`. **All nine hashes recomputed here = sealed = the founder's supplied list** (byte-identical set). The blocked attempt `20260915T132000Z` (§18.5.6–18.5.7) was not paired with this after-read: the stale-read continuation was followed — fresh Step 0 → fresh Step 1 → one hand act → Steps 3–4 under the new stamp — exactly as confirmed in §18.5.7.
- The pinned §18.5.2 parser was re-run here on the returned `audio-after.json` + `volume-after.txt` and reproduces the founder's seven lines exactly.

#### 18.6.2 What the files say

```text
before-utc            2026-09-15T13:43:28Z
volume-before         output volume:44 · alert 59 · output muted:false
sound-pane-before     rc=1  (pane closed)
after-utc             2026-09-15T13:46:03Z   (2 min 35 s later)
volume-after          output volume:73 · alert 59 · output muted:false
sound-pane-after      rc=0  (System Settings 69392 · GeneralSettings 69394 · Sound.appex 69408 — a NEW instance; the §18.5.5 PIDs 48974/49015 had been quit)
audio-after.json      sha 5b7be6ac… == audio-before.json (byte-identical: device state did not move)
DEFAULT_OUTPUT        Mac Studio Speakers coreaudio_device_type_builtin 48000 (exactly one line)
MAC_STUDIO_DEFAULT_OUTPUT True
OUTPUT_VOLUME         73
OUTPUT_MUTED          false
RESTORE_ACCEPTANCE    STOP
```

B06Ultra connected (A2DP) at the before-read, not default. Default output, transport and muted state satisfy the acceptance condition; **the scalar does not: 73 ≠ 69 → STOP** under §18.5.3. No second adjustment under this act; no playback; no device selection; no phone act.

#### 18.6.3 Adjudication (predeclared §18.5.3; nothing invented after the result)

**`S2-VOLUME-RESTORE-01` → STOP. Authority SPENT.** The decisive criterion is the scalar. The Sound pane open at the after-read contradicts the §18.4.4 execution discipline and is recorded, but it is not the acceptance criterion and it is explained by the act itself: the hand act was performed through the System Settings → Sound slider, which the founder reports does not expose an exact numerical 69. Founder-disclosed, preserved and not absorbed: a later "fixed" adjustment was made after the after-read; it is outside this act, changes nothing adjudicable, was not read by any governed instrument, and **the current volume is therefore UNKNOWN to the record until the next lawful read**. Founder instruction: leave the volume alone.

#### 18.6.4 What the STOP is evidence of (recorded; one inference flagged as such)

- The fail-closed acceptance works at the hand seam too: a real hand act that lands near, not on, the ruled value is refused, not rounded. Same boundary as §17.
- The five governed integer readings to date — 25 · 31 · 44 · 69 (accepted) · 73 (refused) — are all `osascript` reports of the system output scalar, which is also exactly what the S2 batch preflight compares (`output volume:69`). **INFERENCE, untested, for the next authority:** macOS's keyboard volume keys move the scalar in sixteenths (6.25 per step); 4/16 = 25, 5/16 = 31.25 → 31, 7/16 = 43.75 → 44, **11/16 = 68.75 → reported 69**, while 73 fits no sixteenth (73 ÷ 6.25 = 11.68) — consistent with 69 having been produced by a stepped control and 73 by a continuous slider drag. If true, a hand act by the volume keys (from 44 = 7/16, four presses up; or from any state, count to 11/16) would land on the reported integer 69 exactly, and the reported integer is the criterion the preflight reads. This is arithmetic on five readings, not a mechanism claim; a fresh restoration authority may test it or ignore it.
- Whether the ruled value should remain an exact integer, become a band, or be reached by a stepped control is a **founder decision** (a band would change the batch's precondition = new orchestration SHA; a stepped-control hand act would not). This record chooses none.

**Standing after §18.6:** `S2-VOLUME-DRIFT-01` CLOSED · candidate mechanism · 69 RULED · **`S2-VOLUME-RESTORE-01` STOP · SPENT** · current volume UNKNOWN to the record (a post-act adjustment disclosed, unread) · restoration re-open = a fresh founder authority (not issued) · `S2-WITNESS-02` NOT ISSUED · `b198e2e37` reusable if the batch is byte-unchanged · S2 population · S3 · KERNEL-00 acceptance CLOSED.

### 18.7 FOUNDER RULING (2026-09-15) on §18.6 — precondition stays **exact integer 69** · band NOT ADOPTED · `b198e2e37` unchanged · **`S2-VOLUME-RESTORE-02` AUTHORIZED** (fresh act: fresh read → one bounded founder stepped-control sequence → fresh read) · `S2-VOLUME-RESTORE-01` remains STOP · spent

#### 18.7.1 Ruling (substance preserved)

- The §18.6.4 sixteenth-step inference (25 = 4/16 · 31 ≈ 5/16 · 44 ≈ 7/16 · 69 ≈ 11/16 · 73 not on the grid) is sufficiently supported to justify a **different human control mechanism**, not to redefine the target. The slider failure is informative — the slider can land between the keyboard steps — and does not show that 69 is an inappropriate acceptance value.
- **`S2-VOLUME-RESTORE-02`** is a new act. Preparation: close System Settings / Sound by hand, let it settle; the Mac session performs a fresh Step 0 and a fresh Step 1 under a new stamp; the current volume is UNKNOWN until that read. **The single authorized founder hand act is the whole bounded sequence:** using the Mac Studio keyboard's normal volume keys — (1) press Volume Down until the bottom/zero state; (2) press Volume Up exactly 11 times; (3) stop. No device selection · no System Settings Sound slider · no scripted keystrokes · no `osascript` · no test playback · no twelfth press · no slider correction · no correction after the governed after-read · no retry under the same authority.
- Epistemic point (founder): eleven presses are not assumed to produce 69; that candidate human mechanism is tested once; the machine after-read remains authoritative. PASS = the unchanged §18.5.3 condition (`Mac Studio Speakers` · `coreaudio_device_type_builtin` · `MAC_STUDIO_DEFAULT_OUTPUT True` · `OUTPUT_VOLUME 69` · `OUTPUT_MUTED false` · `RESTORE_ACCEPTANCE PASS`); anything else STOP, result preserved, rule again. A PASS teaches that a human stepped-control sequence can establish the exact scalar the batch already requires, without changing the instrument.
- Standing: RESTORE-01 STOP · spent · RESTORE-02 AUTHORIZED · target 69 exact · batch `b198e2e37` unchanged · band NOT ADOPTED · scripted volume change FORBIDDEN · `S2-WITNESS-02` NOT ISSUED · S2 population · S3 · KERNEL-00 acceptance CLOSED.

#### 18.7.2 Pinned sequence for `S2-VOLUME-RESTORE-02` (Mac; the §18.5.2 mechanics verbatim except the directory prefix and the hand act; no `#` comment lines)

Step 0 — hand: quit System Settings (⌘Q); settle (30 s proposed); read-only confirmation, repeatable until it passes:

```bash
pgrep -fl "System Settings|Sound.appex" ; echo "[pgrep rc=$?]"
```

Expected: no process line and `[pgrep rc=1]`.

Step 1 — before-read (new stamp; current volume UNKNOWN until this read):

```bash
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="/private/tmp/k00-s2-volume-restore-02-$STAMP"
mkdir -p "$OUT"
date -u +%Y-%m-%dT%H:%M:%SZ > "$OUT/before-utc.txt"
system_profiler SPAudioDataType -json > "$OUT/audio-before.json"
system_profiler SPBluetoothDataType -json > "$OUT/bluetooth-before.json"
osascript -e 'get volume settings' > "$OUT/volume-before.txt"
pgrep -fl "System Settings|Sound.appex" > "$OUT/sound-pane-before.txt" ; echo "rc=$?" >> "$OUT/sound-pane-before.txt"
cat "$OUT/volume-before.txt"
echo "$OUT"
```

Step 2 — **the one founder hand act, the whole sequence:** keyboard Volume Down until the bottom/zero state → Volume Up exactly 11 times → stop. Nothing else touched. (Note, not a rule: if macOS's "play feedback when volume is changed" is on, the key feedback click is a side effect of the control, not a test playback and not the S2 stimulus; it is recorded if heard, and does not STOP the act.)

Step 3 — after-read + the unchanged §18.5.2 parser (`python3 - "$OUT/audio-after.json" "$OUT/volume-after.txt" <<'PY' … PY` exactly as pinned in §18.5.2; verified offline in §18.5.2 and reproduced on the real §18.6 files):

```bash
date -u +%Y-%m-%dT%H:%M:%SZ > "$OUT/after-utc.txt"
system_profiler SPAudioDataType -json > "$OUT/audio-after.json"
osascript -e 'get volume settings' > "$OUT/volume-after.txt"
pgrep -fl "System Settings|Sound.appex" > "$OUT/sound-pane-after.txt" ; echo "rc=$?" >> "$OUT/sound-pane-after.txt"
```

then the §18.5.2 parser block, unchanged.

Step 4 — seal (read-only), the same nine files:

```bash
( cd "$OUT" && shasum -a 256 before-utc.txt audio-before.json bluetooth-before.json volume-before.txt sound-pane-before.txt after-utc.txt audio-after.json volume-after.txt sound-pane-after.txt > SHA256SUMS && cat SHA256SUMS )
```

PASS / STOP exactly §18.5.3 (with `RESTORE_ACCEPTANCE PASS` the decisive line). Return as `docs/programme/VOICE-2026/driver-ledger/s2-volume-restore-02-<STAMP>/` on a `feature/*` branch with `BRANCH · HEAD · STAMP`, the parser's seven lines and the `SHA256SUMS`; this session cherry-picks, recomputes every hash, reruns the parser and records §18.8. Nothing plays, samples, touches the phone or edits the batch.

**Standing after §18.7:** `S2-VOLUME-RESTORE-02` AUTHORIZED · pinned · NOT YET EXECUTED (founder hand act) · 69 exact · `b198e2e37` unchanged · `S2-WITNESS-02` NOT ISSUED · S2 population · S3 · KERNEL-00 acceptance CLOSED.

### 18.8 `S2-VOLUME-RESTORE-02` EXECUTED (stamp `20260915T135919Z`) → **PASS** · evidence RECEIVED and VERIFIED HERE · authority SPENT · 69 restored by the stepped-control hand act

#### 18.8.1 Custody

- Evidence branch `feature/k00-s2-volume-restore-02-evidence-20260915T135919Z`, HEAD `988628e0d8110648270636c61a5edb18d5725377`, parent `001970366` (the §18.7 pin), cherry-picked here as `8b8c8f299` (`-x`). Directory `driver-ledger/s2-volume-restore-02-20260915T135919Z/`, nine files + `SHA256SUMS`. **All nine hashes recomputed here = sealed = the founder's supplied list** (byte-identical set). The §18.5.2 parser was re-run here on the returned `audio-after.json` + `volume-after.txt` and reproduces the founder's seven lines exactly.

#### 18.8.2 What the files say

```text
before-utc            2026-09-15T13:59:19Z
volume-before         output volume:65 · alert 59 · output muted:false
sound-pane-before     rc=1  (pane closed)
after-utc             2026-09-15T14:05:42Z   (6 min 23 s later)
volume-after          output volume:69 · alert 59 · output muted:false
sound-pane-after      rc=1  (pane closed)
audio-after.json      sha 5b7be6ac… == audio-before.json == the §18.6 captures (device state byte-identical across all four reads)
DEFAULT_OUTPUT        Mac Studio Speakers coreaudio_device_type_builtin 48000 (exactly one line)
MAC_STUDIO_DEFAULT_OUTPUT True
OUTPUT_VOLUME         69
OUTPUT_MUTED          false
RESTORE_ACCEPTANCE    PASS
```

B06Ultra connected (A2DP) at the before-read, not default. The before value 65 is the first governed read after the §18.6 post-act adjustment (previously UNKNOWN to the record; 65 is itself off the sixteenth grid, consistent with a slider value — custody only). The Sound pane was closed at both reads.

#### 18.8.3 Adjudication (predeclared §18.7.1 / §18.5.3; nothing invented after the result)

**`S2-VOLUME-RESTORE-02` → PASS. Authority SPENT.** Every acceptance line met: exactly one default output, `Mac Studio Speakers`, `coreaudio_device_type_builtin`, `MAC_STUDIO_DEFAULT_OUTPUT True`, `OUTPUT_VOLUME 69`, `OUTPUT_MUTED false`, `RESTORE_ACCEPTANCE PASS`. Founder-stated: the one hand act was the pinned sequence (Volume Down to the bottom, Volume Up exactly eleven times, stop); nothing downstream was run or opened.

#### 18.8.4 What the PASS is evidence of

- **The S2 precondition (`output volume:69` · Mac Studio Speakers · builtin · unmuted) is re-established as of 14:05:42Z** — a reading at a time, exactly as §14.9 was; the batch preflight re-reads it before any population.
- **The stepped-control candidate mechanism is supported by one observation:** eleven keyboard steps from zero produced the reported integer 69 on this Mac (11/16 = 68.75 → 69), where the slider had produced 73. One trial, n = 1, on one Mac; it is a witnessed human procedure that reached the exact scalar the batch compares, not a general claim about macOS. If restoration is ever needed again, this is the procedure of record; whether it reproduces is learned only by using it again.
- **Nothing in the instrument moved.** `b198e2e37` unchanged, target 69 exact, band not adopted. The lesson from §18.6 → §18.8 is procedural, not architectural: on this desktop the exact scalar is reachable by a stepped control and not by the continuous slider.
- **Drift exposure remains** (§18.4 candidate mechanism, §18.6 slider, the 65 before this act): the prepared state is a scalar on a shared desktop. The conduct rule stands — the next witness should follow restoration closely, with the Sound pane closed, and the preflight refuses on any drift.

**Standing after §18.8:** `S2-VOLUME-DRIFT-01` CLOSED · candidate mechanism · `S2-VOLUME-RESTORE-01` STOP · spent · **`S2-VOLUME-RESTORE-02` PASS · spent · 69 RESTORED at 14:05:42Z** · target 69 exact · `b198e2e37` unchanged, reusable if the batch is byte-unchanged · **`S2-WITNESS-02` NOT ISSUED (its own founder authority; the §16 shape is the natural template — one invocation, N=1, Blocks A–D, §16.4 law)** · S2 population · S3 · KERNEL-00 acceptance CLOSED.

### 18.9 FOUNDER RULING (2026-09-15) — **`S2-WITNESS-02` ISSUED** (one act; unchanged `b198e2e37`; §16 Blocks A–D; N=1; §16.4 law unchanged) · conduct rule PART OF THIS AUTHORITY (Block C by **14:35:42Z**, Sound pane closed, volume and device untouched, fresh Step 0 immediately before Block C) · volume LEFT EXACTLY ALONE

#### 18.9.1 Authority (founder, substance preserved verbatim)

`S2-WITNESS-02` authorizes exactly one real-Mac orchestration witness of unchanged `b198e2e37`, using the already-pinned §16 Blocks A–D, exactly one N=1 invocation, and the unchanged §16.4 PASS/STOP law. Playback is authorized only as an instrument of this witness. The phone journal, if produced, is orchestration evidence only and never an S2 population row. Any STOP or witness failure spends this authority; no repair, correction, or rerun occurs under it. Nothing about the implementation changes; `b198e2e37` remains the subject.

Conduct rule, part of this authority but separate from the §16.4 acceptance law: RESTORE-02 after-read 14:05:42Z · volume 69 → **Block C freshness window ≤ 30 min from that read → Block C must begin by 14:35:42Z** · Sound pane CLOSED · volume UNTOUCHED · device UNTOUCHED · a fresh read-only Step 0 (`pgrep -fl "System Settings|Sound.appex" ; echo "[pgrep rc=$?]"` → no process line and `[pgrep rc=1]`) REQUIRED immediately before Block C; it does not replace the batch preflight, which still proves device · transport · volume 69 · mute · fixture · player pin immediately before playback. **If the window is missed: do not hurry or manipulate the machine; the issuance is LAPSED / UNSPENT; return for a fresh ruling.** Until the witness runs or lapses: no volume keys · no slider · no Sound pane · no output-device selection · no test sound · no scripted volume action. The current 69 is a reading at a time; the batch decides whether it persisted.

#### 18.9.2 Execution pin — the §16.7 transport with exactly three literal substitutions (the blocks themselves are otherwise byte-identical to `17b4df63b`)

The §16.3 blocks name the first witness in three places that must not collide with the spent act: the run label `S2-WITNESS-01` (batch run name, preflight dir, ledger dir, return commit), the transcript file `s2-witness-01-transcript.txt`, and the worktree path `/private/tmp/k0506-s2w-b198e2e37` (Block A STOPs on a pre-existing path, and it pre-exists from §17). Extract exactly as §16.7, then apply exactly these three substitutions and prove by diff that nothing else moved:

```bash
DOC=docs/programme/VOICE-2026/KERNEL-00_VPIO-02_K00-06_PARTIAL-ZERO_DISCRIMINATOR_PLAN_2026-09-15.md
cd /Users/soullab/MAIA-SOVEREIGN
git show 17b4df63b:$DOC | sed -n '599,625p' > /private/tmp/s2w1-blockA.sh
git show 17b4df63b:$DOC | sed -n '633,702p' > /private/tmp/s2w1-blockB.sh
git show 17b4df63b:$DOC | sed -n '710,713p' > /private/tmp/s2w1-blockC.sh
git show 17b4df63b:$DOC | sed -n '719,732p' > /private/tmp/s2w1-blockD.sh
for b in A B C D; do sed -e 's/S2-WITNESS-01/S2-WITNESS-02/g' -e 's/s2-witness-01/s2-witness-02/g' -e 's#/private/tmp/k0506-s2w-b198e2e37#/private/tmp/k0506-s2w2-b198e2e37#g' /private/tmp/s2w1-block$b.sh > /private/tmp/s2w2-block$b.sh; done
for b in A B C D; do echo "== block $b diff (only the three tokens may appear)"; diff /private/tmp/s2w1-block$b.sh /private/tmp/s2w2-block$b.sh; done
shasum -a 256 /private/tmp/s2w2-block[ABCD].sh
```

Then, in order, each as §16.7 (bash from file, `rc=${PIPESTATUS[0]}`, STOP on any non-zero rc, no repair):

```bash
bash /private/tmp/s2w2-blockA.sh 2>&1 | tee /private/tmp/s2w2-blockA.out; echo "rc=${PIPESTATUS[0]}" | tee -a /private/tmp/s2w2-blockA.out
bash /private/tmp/s2w2-blockB.sh 2>&1 | tee /private/tmp/s2w2-blockB.out; echo "rc=${PIPESTATUS[0]}" | tee -a /private/tmp/s2w2-blockB.out
```

**Immediately before Block C — the conduct-rule reads (both required; Block C begins only if both hold and the clock is before 14:35:42Z):**

```bash
date -u +%Y-%m-%dT%H:%M:%SZ
pgrep -fl "System Settings|Sound.appex" ; echo "[pgrep rc=$?]"
```

```bash
bash /private/tmp/s2w2-blockC.sh 2>&1 | tee /private/tmp/s2w2-blockC.out; echo "rc=${PIPESTATUS[0]}" | tee -a /private/tmp/s2w2-blockC.out
bash /private/tmp/s2w2-blockD.sh 2>&1 | tee /private/tmp/s2w2-blockD.out; echo "rc=${PIPESTATUS[0]}" | tee -a /private/tmp/s2w2-blockD.out
```

Return exactly as §16.7's return block with the same three substitutions applied (the `S2-WITNESS-02-<stamp>/` ledger dir with `transcript.txt` + `SHA256SUMS.witness`, the `S2-WITNESS-02-preflight-<stamp>/` dir, the four `.out` files, the date/pgrep lines from the conduct-rule read, and the block-file diffs + hashes), on a `feature/*` branch; cherry-picked here with `-x` and read against §16.4 → §18.10. PASS ≠ S2 population · ≠ S3 · ≠ KERNEL-00.

**Standing after §18.9:** `S2-WITNESS-02` ISSUED · one act · window to 14:35:42Z · NOT YET EXECUTED · `b198e2e37` unchanged · §16.4 unchanged · S2 population · S3 · KERNEL-00 acceptance CLOSED.

### 18.10 `S2-WITNESS-02` — **LAPSED UNSPENT** (Mac session, founder-relayed, 2026-09-15): the conduct-rule clock read 14:52:19Z, past the pinned 14:35:42Z · nothing executed · no new authority

Under §18.9 the freshness window (≤ 30 min from the RESTORE-02 after-read at 14:05:42Z → Block C by 14:35:42Z) was checked at the conduct-rule read and found missed by 16 min 37 s. Exactly as the ruling requires, the Mac session did not hurry, substitute a later clock, or manipulate the machine: Block A, B, C and D were NOT executed; no batch pipeline ran; no ledger or preflight directory, no `s2w2-block[A-D].out`, no `BATCH_PIPELINE_RC`, no S2 row; volume, device and Sound pane untouched by that session; no new authority opened. The issuance is **LAPSED UNSPENT** (not STOP, not failure; nothing was witnessed); `b198e2e37` remains reusable; the §18.9.2 execution pin remains valid text for any re-issuance.

Custody note: the pin landed at 14:15:48Z (`24f111302`, ~10 min after the restoration read); the ruling → pin → Mac-side preparation loop consumed the remainder of the window. That is an observation about the window's anchoring, not a defect of any act; whether a fresh issuance anchors its freshness window to a new pre-Block-C volume read rather than to the RESTORE-02 read, or pairs restoration and witness in one sequence, is a founder decision. The volume has not been read by any governed instrument since 14:05:42Z (69); it remains a reading at a time until the next lawful read.

**Standing after §18.10:** `S2-VOLUME-RESTORE-02` PASS · spent · 69 last read at 14:05:42Z · **`S2-WITNESS-02` LAPSED UNSPENT** · `b198e2e37` unchanged · §16.4 unchanged · a fresh issuance/custody act is the next legitimate move (founder's) · S2 population · S3 · KERNEL-00 acceptance CLOSED.

#### 18.10.1 Cause of the lapse (founder-stated, 2026-09-15): the Mac lane timed out

The founder reports the previous Mac lane timed out: the screenshot shows the Mac session's last visible step as "Inspected §18.9 text and extracted substitutions with proof capture", followed by "Connection interrupted. Waiting for the complete answer". The lapsed-unspent report in §18.10 came from a later lane at 14:52:19Z, which found the window already missed. Recorded, not inferred beyond the founder's statement: the window was lost to a transport interruption, not to any decision; no act of either session is at fault; the ruling's "do not hurry" clause was applied correctly by the later lane.

Custody consequence for the fresh issuance (read-only, before any Block A): the interrupted lane had reached the substitution step and may have written `/private/tmp/s2w1-block*.sh` and `/private/tmp/s2w2-block*.sh`; whether it reached `worktree add` (which would create `/private/tmp/k0506-s2w2-b198e2e37`) is UNKNOWN. §16.3 Block A STOPs on a pre-existing worktree path. The fresh issuance should therefore begin with a read (`ls -d /private/tmp/k0506-s2w2-b198e2e37 /private/tmp/s2w2-block*.sh 2>&1`); if the worktree path exists it is residue of the interrupted lane and its disposition (remove by a founder-authorized act, or a new path token such as `k0506-s2w3-b198e2e37` in the substitution list) is the founder's ruling, never a silent cleanup. Stale `s2w1-`/`s2w2-` block files are overwritten by the re-extraction step and carry no evidentiary weight.

#### 18.10.2 Residue read (founder, Mac, 2026-09-15) — the interrupted lane reached at least Block A's `worktree add`; §18.10 corrected beside the original

Founder-pasted read (`ls -d /private/tmp/k0506-s2w2-b198e2e37 /private/tmp/s2w2-block*.sh`; the paste carried a stray trailing `f` after `2>&1` — a paste artefact, not part of the pinned command; the listing printed regardless):

```text
/private/tmp/k0506-s2w2-b198e2e37
/private/tmp/s2w2-blockA.sh  /private/tmp/s2w2-blockB.sh  /private/tmp/s2w2-blockC.sh  /private/tmp/s2w2-blockD.sh
```

**Correction to §18.10, recorded beside it:** the worktree path exists, so the interrupted lane executed at least the `worktree add` line of Block A before the connection dropped. §18.10's "Blocks A–D not executed" is accurate for the later lane's own conduct and inaccurate as a statement about the interrupted lane; how far that lane got is UNKNOWN until read. The four `s2w2-block*.sh` files are the substituted blocks (their diffs and hashes were never returned; they carry no evidentiary weight and are overwritten by any re-extraction).

Pinned follow-up read (read-only; nothing removed, nothing run) and its reading law, fixed before the output is seen:

```bash
ls -la /private/tmp/s2w2-block*.out /private/tmp/s2-witness-02-transcript.txt 2>&1
ls -d /private/tmp/k0506-s2w2-b198e2e37/docs/programme/VOICE-2026/driver-ledger/S2-WITNESS-02-* 2>&1
git -C /private/tmp/k0506-s2w2-b198e2e37 status --short 2>&1 | head -20
pgrep -fl "afplay|k00-driver-batch|xcodebuild" ; echo "[pgrep rc=$?]"
date -u +%Y-%m-%dT%H:%M:%SZ
```

- no `.out`, no transcript, no `S2-WITNESS-02-*` directory, clean worktree, `[pgrep rc=1]` → the lane died inside Block A after `worktree add`; residue = an inert worktree; disposition (founder-authorized removal, or a new path token `k0506-s2w3-b198e2e37` in the substitution list) is the founder's ruling, never a silent cleanup.
- `blockA.out`/`blockB.out` present, no `blockC.out`, no ledger directory → Blocks A–B ran under the lapsed issuance (read-only acts: custody + device preflight), Block C did not; no playback; same disposition question, plus those two `.out` files are returned as custody.
- anything from Block C (a `blockC.out`, a transcript, a `S2-WITNESS-02-2*` ledger directory, a live `afplay`/batch process) → the interrupted lane STARTED THE BATCH under an authority that had not yet lapsed at that moment or had; either way an orchestration act whose record never returned. It is adjudicated on its own evidence before any fresh issuance; nothing is re-run to "complete" it.

No fresh issuance runs until this read is on the record.

### 18.11 Follow-up residue read (founder, Mac, 14:55:27Z) → reading-law case 2: **Blocks A and B ran under the still-live issuance, Block C did not, no playback** · FOUNDER RULING — **`S2-WITNESS-03` AUTHORIZED** as a new custody act (residue preserved · new path token `k0506-s2w3-b198e2e37` · freshness anchored to a fresh pre-Block-C volume read)

#### 18.11.1 What the §18.10.2 read returned

```text
/private/tmp/s2-witness-02-transcript.txt        absent
/private/tmp/s2w2-blockA.out                      2530 bytes · Sep 15 10:18 local (14:18Z)
/private/tmp/s2w2-blockB.out                       157 bytes · Sep 15 10:19 local (14:19Z)
/private/tmp/s2w2-blockC.out · blockD.out         absent
S2-WITNESS-02-preflight-20260915T141935Z          present inside the s2w2 worktree (Block B's preflight directory)
S2-WITNESS-02-2* ledger directory                 absent
git status --short (s2w2 worktree)                printed nothing
pgrep afplay|k00-driver-batch|xcodebuild          [pgrep rc=1] (no process)
clock                                             2026-09-15T14:55:27Z
```

**Reading under the predeclared §18.10.2 law → case 2.** The interrupted lane executed Block A (14:18Z) and Block B (preflight stamped 14:19:35Z), both read-only custody/preflight acts, while the §18.9 issuance was still live (deadline 14:35:42Z), then died before the conduct-rule reads and Block C. No transcript, no `blockC.out`, no ledger directory, no player or batch process: **the batch never started; nothing played; no S2 row exists.** The 157-byte `blockB.out` is small for a 70-line block; whether Block B completed or was cut mid-run is not determinable from the listing and is not inferred (the preflight directory exists, so it reached at least its directory creation). `git status --short` printing nothing is recorded as observed, not interpreted. The window was therefore lost with ~16 min remaining at Block B's stamp, to the transport failure alone.

#### 18.11.2 Ruling (founder, substance preserved) — `S2-WITNESS-03`

1. **Residue disposition.** `/private/tmp/k0506-s2w2-b198e2e37`, `s2w2-block[A–D].sh`, `s2w2-blockA.out`, `s2w2-blockB.out` and the `S2-WITNESS-02-preflight-20260915T141935Z` directory are preserved as residue of the interrupted, lapsed `S2-WITNESS-02` preparation: ⛔ not removed, reused, modified or executed. Their existence does not establish that any governed witness act occurred. (Custody: the two `.out` files and the preflight directory may be copied to a `feature/*` branch as residue when convenient — a copy is a read — but this is not a precondition of WITNESS-03.)
2. **Freshness authority.** The WITNESS-03 window is anchored to a **fresh governed volume read immediately before Block C**, not to the spent RESTORE-02 act; the 14:05:42Z reading is historical evidence only; the batch preflight's drift refusal remains operative. **No fresh read, no Block C.** The founder's own confirmation that the volume has not been touched since 14:05:42Z may be recorded as historical continuity but does not replace the read.
3. **Reusable pin.** §18.9.2 may be reused only with these literal substitutions relative to its text: `S2-WITNESS-02 → S2-WITNESS-03` · `s2-witness-02 → s2-witness-03` · `s2w2 → s2w3` · `/private/tmp/k0506-s2w2-b198e2e37 → /private/tmp/k0506-s2w3-b198e2e37`. No other substantive change. The substitution proof (diff against the `17b4df63b` blocks) must show only run/path-token changes before execution.
4. **Conduct immediately before Block C:** (1) the fresh governed volume read · (2) `date -u` · (3) the pinned `pgrep` check · (4) verify no process · (5) verify the read satisfies the pinned precondition (`output volume:69` · `output muted:false`). Only then Block C. Preparation does not authorize execution; `READ OK` is a precondition, never a trigger.
5. **Standing:** RESTORE-02 PASS · spent · WITNESS-02 lapsed unspent · its residue preserved, non-authoritative · **WITNESS-03 AUTHORIZED** · `b198e2e37` unchanged · §16.4 unchanged · S2 population · S3 · KERNEL-00 acceptance CLOSED. No authority for S3, restoration, residue cleanup or anything beyond the bounded WITNESS-03 witness.

#### 18.11.3 Execution pin — `S2-WITNESS-03` (Mac; the §18.9.2 transport; blocks re-extracted from `17b4df63b` so that one substitution step yields the 03 text directly; the diff proves it)

```bash
DOC=docs/programme/VOICE-2026/KERNEL-00_VPIO-02_K00-06_PARTIAL-ZERO_DISCRIMINATOR_PLAN_2026-09-15.md
cd /Users/soullab/MAIA-SOVEREIGN
git show 17b4df63b:$DOC | sed -n '599,625p' > /private/tmp/s2w1-blockA.sh
git show 17b4df63b:$DOC | sed -n '633,702p' > /private/tmp/s2w1-blockB.sh
git show 17b4df63b:$DOC | sed -n '710,713p' > /private/tmp/s2w1-blockC.sh
git show 17b4df63b:$DOC | sed -n '719,732p' > /private/tmp/s2w1-blockD.sh
for b in A B C D; do sed -e 's/S2-WITNESS-01/S2-WITNESS-03/g' -e 's/s2-witness-01/s2-witness-03/g' -e 's#/private/tmp/k0506-s2w-b198e2e37#/private/tmp/k0506-s2w3-b198e2e37#g' /private/tmp/s2w1-block$b.sh > /private/tmp/s2w3-block$b.sh; done
for b in A B C D; do echo "== block $b diff (only the three tokens may appear)"; diff /private/tmp/s2w1-block$b.sh /private/tmp/s2w3-block$b.sh; done
shasum -a 256 /private/tmp/s2w3-block[ABCD].sh
ls -d /private/tmp/k0506-s2w3-b198e2e37 2>&1
```

(The last line must report no such directory; a pre-existing s2w3 path is STOP before Block A.) Then, each as §16.7 (bash from file, `rc=${PIPESTATUS[0]}`, STOP on any non-zero rc, no repair):

```bash
bash /private/tmp/s2w3-blockA.sh 2>&1 | tee /private/tmp/s2w3-blockA.out; echo "rc=${PIPESTATUS[0]}" | tee -a /private/tmp/s2w3-blockA.out
bash /private/tmp/s2w3-blockB.sh 2>&1 | tee /private/tmp/s2w3-blockB.out; echo "rc=${PIPESTATUS[0]}" | tee -a /private/tmp/s2w3-blockB.out
```

**Immediately before Block C — the ruling-4 reads (all five conditions must hold; volume and pane untouched throughout):**

```bash
date -u +%Y-%m-%dT%H:%M:%SZ | tee /private/tmp/s2w3-preC-clock.txt
osascript -e 'get volume settings' | tee /private/tmp/s2w3-preC-volume.txt
pgrep -fl "System Settings|Sound.appex" ; echo "[pgrep rc=$?]"
```

Proceed only if the volume line reads `output volume:69` and `output muted:false`, the pgrep prints no process and `[pgrep rc=1]`. Anything else: STOP, no adjustment, return for ruling (the issuance is spent by a STOP; a non-69 read = the prepared state did not persist again, adjudicated then).

```bash
bash /private/tmp/s2w3-blockC.sh 2>&1 | tee /private/tmp/s2w3-blockC.out; echo "rc=${PIPESTATUS[0]}" | tee -a /private/tmp/s2w3-blockC.out
bash /private/tmp/s2w3-blockD.sh 2>&1 | tee /private/tmp/s2w3-blockD.out; echo "rc=${PIPESTATUS[0]}" | tee -a /private/tmp/s2w3-blockD.out
```

Return as §16.7's return block with the same substitutions: the `S2-WITNESS-03-<stamp>/` ledger dir (`transcript.txt` + `SHA256SUMS.witness`), the `S2-WITNESS-03-preflight-<stamp>/` dir, the four `s2w3-block*.out`, `s2w3-preC-clock.txt` + `s2w3-preC-volume.txt`, the block-file diffs + hashes, `BRANCH · HEAD · STAMP · BATCH_PIPELINE_RC`, on a `feature/*` branch; cherry-picked here and read against §16.4 → §18.12. PASS ≠ S2 population · ≠ S3 · ≠ KERNEL-00.

**Standing after §18.11:** `S2-WITNESS-03` AUTHORIZED · pinned · NOT YET EXECUTED · freshness = the pre-Block-C read · WITNESS-02 residue preserved · `b198e2e37` unchanged · S2 population · S3 · KERNEL-00 acceptance CLOSED.

---

## §18.12 — `S2-WITNESS-03` EXECUTED → STOP BEFORE BLOCK C (pre-Block-C read 38 ≠ 69; §16.4 read; authority SPENT) — 2026-09-15

### §18.12.1 Custody

- Evidence branch `feature/k00-s2-witness-03-stop-evidence-20260915T150551Z`, founder commit `e85a39dae9901eabee9e316be45838b40573635e` → cherry-picked onto this lane as `05bbccc80feb67dcaf660e51154c3296aaa2c0c3` (`-x`, no edit).
- Evidence directory `driver-ledger/S2-WITNESS-03-preflight-20260915T150524Z/` — 12 files: `RETURN.txt` · `SHA256SUMS.stop` · `apps.json` · `processes.json` · `blocks-ABD.txt` · `s2w3-block-diffs.txt` · `s2w3-block-hashes.txt` · `s2w3-preC-clock.txt` · `s2w3-preC-volume.txt` · `s2w3-preC-pgrep.operator-capture.txt` · `s2w3-preexistence.operator-capture.txt` · `stop-status.txt`.
- `sha256sum -c SHA256SUMS.stop` here: **11/11 OK** (the seal file lists everything but itself).
- `RETURN.txt`: `BRANCH=feature/k00-s2-witness-03-stop-evidence-20260915T150551Z · EXECUTION_HEAD=b198e2e37058f2e059d986b4b148e224215f3ee3 · STAMP=20260915T150551Z · BATCH_PIPELINE_RC=NOT_RUN_PRE_C_STOP`.
- **Deliberately absent, by design of a pre-C STOP:** no `S2-WITNESS-03-<stamp>/` ledger dir, no `transcript.txt`, no `SHA256SUMS.witness`, no `s2w3-blockC.out` / `s2w3-blockD.out`. Their absence is the evidence that Block C never ran, not a custody gap.
- WITNESS-02 residue (`/private/tmp/k0506-s2w2-b198e2e37`, `s2w2-block*`, `S2-WITNESS-02-preflight-20260915T141935Z`) NOT copied, NOT touched (§18.11.2 ⛔ honoured).

### §18.12.2 The §18.11.3 pin, honoured line by line

| Pinned step | Evidence | Read |
|---|---|---|
| Path did not pre-exist | `s2w3-preexistence.operator-capture.txt`: `ls: /private/tmp/k0506-s2w3-b198e2e37: No such file or directory` (pre-Block-A, PID 80148) | ✓ fresh token, no collision with WITNESS-01/02 |
| Three literal substitutions only | `s2w3-block-diffs.txt`: every hunk in A/B/C/D is `k0506-s2w-` → `k0506-s2w3-`, `S2-WITNESS-01` → `S2-WITNESS-03`, `s2-witness-01` → `s2-witness-03`; nothing else | ✓ diff-proven |
| Block hashes | A `ee17183f…` · B `2dce2db8…` · C `82f3c6be…` · D `c682e8aa…` — identical to the four the founder reported | ✓ |
| Block A (custody) | `HEAD=b198e2e37…` · `TREE_CLEAN=1` · `Tests: 75 passed, 75 total` · `GATE_75_75=1` · `FIXTURE_SHA=1a505b3d…` · `AFPLAY_SHA=88f3b577…` · `AFPLAY_PROCESSES_BEFORE=0` · `BLOCK_A_PASS=1` | ✓ PASS every line |
| Block B (device preflight) | `PREFLIGHT_DIFF_RC=0` · `OTHER_BATCHES=0` · `APPS_READ_RC=0` · `E3B88028_CONTAINER_HITS=1` (recount here on `apps.json`: 1) · `PROCESS_READ_RC=0` · `VoiceKernelHarness processes: 0` (recount here on `processes.json`: 0) · `PREFLIGHT_CLEAN=…/S2-WITNESS-03-preflight-20260915T150524Z` | ✓ PASS every line |
| `rc=` blank after A and B | zsh `PIPESTATUS` — informational, §16.7 | — |
| Pre-C clock | `s2w3-preC-clock.txt`: `2026-09-15T15:05:51Z` | read |
| Pre-C volume | `s2w3-preC-volume.txt`: `output volume:38, input volume:missing value, alert volume:59, output muted:false` | **38 ≠ 69 → STOP** |
| Pre-C pane | `s2w3-preC-pgrep.operator-capture.txt`: `OBSERVED=[pgrep rc=1]` (no `System Settings` / `Sound.appex` process; PID 82431 capture) | pane closed ✓ |
| Block C / D | `stop-status.txt`: `BLOCK_C=NOT_RUN · BLOCK_D=NOT_RUN · PLAYBACK=NONE` | not run ✓ |

The pre-C read did exactly what §18.11.2 built it to do: it was a precondition, it refused, and nothing downstream moved. No adjustment, no second read, no retry under the same authority.

### §18.12.3 Adjudication (§16.4 + §18.11.3)

**`S2-WITNESS-03` — STOP before Block C · witness NOT PASS · authority SPENT.**

- Blocks A and B PASSED every predeclared line on the real Mac (second clean A/B pass on `b198e2e37`; WITNESS-01 was the first).
- The §16.4 questions were never reached: no `stimulus-sample-1.tsv`, no liveness rows, no custody verdict, no afplay child, no journal, no S2 row, rc none. The batch's own stimulus preflight (which would have refused 38 with exit 8) was not exercised — the pre-C read refused first, as pinned.
- Nothing played. `.vpio02` was not launched. K00/R1 · `.vpio01` untouched. `b198e2e37` unchanged.
- **The founder's attestation is carried verbatim as the standing of the volume fact:** *"I cannot truthfully attest that nobody touched the volume after 14:05:42Z… 69 did not persist to the fresh read at 15:05:51Z; it was 38. Cause and actor remain unadjudicated."*

### §18.12.4 The second drift (record, not inference)

| Read | UTC | Output volume | Pane | Governed act |
|---|---|---|---|---|
| §14.9 after-read | 02:23Z | 69 | closed | preparation PASS |
| WITNESS-01 batch preflight | 12:28Z | 31 | — | STOP (§17) |
| census | 12:51Z | 31 | Sound pane open since 11:25Z | read only |
| RESTORE-01 before | 13:43Z | 44 | closed | — |
| RESTORE-01 after (slider) | 13:4xZ | 73 | open | STOP |
| RESTORE-02 before | 13:59:19Z | 65 | closed | — |
| RESTORE-02 after (11 key presses) | 14:05:42Z | **69** | closed | PASS |
| WITNESS-03 pre-C | **15:05:51Z** | **38** | closed (`rc=1`) | STOP |

Facts: 69 → 38 inside one hour and nine seconds, Sound pane closed at both ends, no governed act between the two reads touched volume (this lane: none; the Mac-side lanes: WITNESS-02 residue read at 14:55:27Z was a read; WITNESS-03 Blocks A/B are read-only by construction and gate-proven not to contain a volume verb). The §18.4 candidate mechanism (a person-shaped desktop session writing through `coreaudiod` server-side control) is *consistent* with this reading but was observed only for the 07:25–08:46 local window; nothing here re-observes it. **Cause UNKNOWN · actor UNKNOWN · not inferred.**

Flagged inference only (same class as §18.6's): 38 lies on the sixteenth-step grid (6/16 = 37.5 → reported 38), as 25 · 31 · 44 · 69 did; 73 and 65 did not. A keyboard-step-shaped value is compatible with a keyboard act and with several other writers; it identifies nobody. The record does not choose.

### §18.12.5 What this STOP earns and what it does not

- Earned: the pre-Block-C freshness read (§18.11.2's re-anchoring) is now witnessed once refusing on drift — the third fail-closed boundary in this lane to do so (batch preflight §17 · restoration parser §18.6 · pre-C read here). *The refusal earned confidence in the boundary, not permission to move it* (§18 ruling, unchanged).
- Earned: a second clean A/B pass on `b198e2e37`; the orchestration's custody and device-preflight blocks are stable under repetition.
- Not earned: any S2 row · any §7 reading · any change to the volume target, the batch, or the pinned blocks · any diagnosis of the drift. A failed witness may diagnose; it may never bootstrap authority.
- Not measured: whether 69 would have survived a tighter restoration→witness pairing. The two PASS reads of 69 (02:23Z, 14:05:42Z) were each followed by a non-69 read at the next governed touch (12:28Z, 15:05:51Z); the intervals were ~10 h and ~1 h. n = 2, no rate claimed.

### §18.12.6 Returned to the founder (nothing opened here)

1. **Acceptance of the STOP as read** (§18.12.3).
2. **Disposition of the drift question**: (a) a second read-only drift census bounded to 14:05Z–15:06Z (the §18.3 instrument reused, `K00_DRIFT_LOG_LAST` sized to reach back past 14:05:42Z — retained coreaudio log coverage permitting), or (b) proceed without a mechanism, treating volume as a state that must be re-prepared immediately before use.
3. **Whether a paired act is issued** — one issuance covering `S2-VOLUME-RESTORE-03` (§18.7.2 keyboard sequence, hand) immediately followed by `S2-WITNESS-04` Block C, with the pre-C read as the single joint between them and a conduct window measured in minutes, not thirty; `b198e2e37` reusable if the batch is byte-unchanged; new path token `s2w4`; WITNESS-02 and WITNESS-03 worktrees preserved as residue.
4. Nothing else. S2 population · S3 · KERNEL-00 acceptance remain CLOSED.

**Standing after §18.12:** `S2-WITNESS-03` STOP · SPENT · Blocks A/B PASS ×2 on `b198e2e37` · pre-C read refused 38 · nothing played · no S2 row · 69 last read 14:05:42Z, 38 read 15:05:51Z · drift cause/actor UNKNOWN · `b198e2e37` unchanged · WITNESS-02 + WITNESS-03 residue preserved · `S2-WITNESS-04` / `S2-VOLUME-RESTORE-03` NOT ISSUED · S2 population · S3 · KERNEL-00 acceptance CLOSED.

---

## §18.13 — FOUNDER RULING (2026-09-15) on §18.12: `S2-WITNESS-03` ACCEPTED · second drift census ⛔ NOT OPENED · **`S2-RESTORE/WITNESS-04` AUTHORIZED AS ONE PAIRED CUSTODY** (restoration after-read = the freshness read; ordinal boundary, not a clock)

### 18.13.1 Ruling (founder, verbatim)

```text
S2-WITNESS-03          ACCEPTED · STOP before Block C · authority SPENT
69 target              UNCHANGED
second drift census    ⛔ NOT OPENED
cause of 69 → 38       UNKNOWN · no further mechanism required for progress

NEXT ACT:
S2-RESTORE/WITNESS-04  AUTHORIZED AS ONE PAIRED CUSTODY

sequence:
  WITNESS-04 Block A
  WITNESS-04 Block B
  confirm pane closed / no competing process
  RESTORE-03 founder hand act:
      Volume Down → zero
      Volume Up ×11
  immediate governed after-read

joint condition:
  Mac Studio Speakers
  builtin
  output volume 69
  output muted false
  Sound/System Settings absent

PASS at joint
  → Block C immediately
  → Block D if C succeeds

FAIL at joint
  → STOP
  → no correction
  → no retry
  → authority spent

No unrelated command, deliberation, documentation act,
commit, push, or preparation step may intervene between
the accepted joint read and Block C.

b198e2e37              reusable unchanged
WITNESS-04 token       s2w4
WITNESS-02 residue     preserved
WITNESS-03 residue     preserved

S2 population          CLOSED
S3                     CLOSED
KERNEL-00 acceptance   CLOSED
```

Founder reasoning, substance preserved: (1) `S2-WITNESS-03` accepted exactly as adjudicated, no qualification. (2) No second drift census — the operational fact that matters is already established: *output volume is volatile state on this Mac*; another census might name another candidate mechanism but would not change the witness design requirement; cause may remain UNKNOWN. (3) The lesson of WITNESS-02/03 is not "find out why 69 moves" but "do not depend on 69 persisting while governance/preparation consumes time" → all slow preparation (custody Block A, device preflight Block B) happens **before** the hand; RESTORE-03 is the already-tested §18.7.2 keyboard sequence; **its after-read is the WITNESS-04 pre-Block-C read** — no separate freshness read later. (4) No 5/10/30-minute window: the boundary is **causal/ordinal** — the accepted restoration read must be the last relevant state observation before Block C with nothing intervening that could legitimately delay the act; an interruption after that read STOPs the act rather than relying on remaining minutes. *A volatile environmental prerequisite belongs at the last responsible moment, not at the beginning of a governed sequence. The refusal boundaries have demonstrated that they work; the next experiment tests the intended phenomenon, not whether macOS volume stays stable for an hour.*

### 18.13.2 What this changes and what it does not

| | §18.11.3 (WITNESS-03) | §18.13.3 (RESTORE/WITNESS-04) |
|---|---|---|
| Restoration | separate prior act (RESTORE-02, 14:05:42Z), then a lapse | inside the same custody, after Blocks A+B |
| Freshness read | a separate pre-C read of an inherited state | the restoration after-read itself |
| Boundary | five conditions, clock-free but an inherited state | same five conditions + `RESTORE_ACCEPTANCE PASS`; ordinal: last observation before Block C |
| Interruption after the read | (not reached) | STOP; never resumed on "remaining minutes" |
| `b198e2e37` · §16 blocks · §16.4 law · batch preflight · parser · keyboard act | unchanged | unchanged (three literal substitutions only, diff-proven) |

Unchanged laws: the batch's own stimulus preflight inside Block C still re-reads volume and refuses ≠ 69 with exit 8 (a second boundary, not a substitute for the joint); the machine reads, the founder's hand sets (§18.5.1); no `osascript`/slider/scripted keys; the sample-1 journal is never an S2 row and gets no §7 reading (§16); PASS ≠ S2 population · ≠ S3 · ≠ KERNEL-00. Residue rule: `/private/tmp/k0506-s2w2-…`, `/private/tmp/k0506-s2w3-…` and every `s2w2-*`/`s2w3-*` file stay untouched (never removed/reused/modified/executed).

Recorded fact, not a change: inside Block C the batch builds the driver (xcodegen + signed `build-for-testing`) before its stimulus preflight reads volume, so minutes elapse between the joint read and the batch's own read. The ruling's "immediately" governs what the operator does (nothing) between the joint read and starting Block C; what the batch does after that is `b198e2e37`'s frozen order.

### 18.13.3 Execution pin — `S2-RESTORE/WITNESS-04` (Mac; founder; paste-able; no `#` comment lines; nothing between the joint read and Block C)

**Stage 0 — extraction with the `s2w4` token (the §18.11.3 mechanics; the diff must show only the three tokens; the `s2w4` path must not pre-exist):**

```bash
DOC=docs/programme/VOICE-2026/KERNEL-00_VPIO-02_K00-06_PARTIAL-ZERO_DISCRIMINATOR_PLAN_2026-09-15.md
cd /Users/soullab/MAIA-SOVEREIGN
git show 17b4df63b:$DOC | sed -n '599,625p' > /private/tmp/s2w1-blockA.sh
git show 17b4df63b:$DOC | sed -n '633,702p' > /private/tmp/s2w1-blockB.sh
git show 17b4df63b:$DOC | sed -n '710,713p' > /private/tmp/s2w1-blockC.sh
git show 17b4df63b:$DOC | sed -n '719,732p' > /private/tmp/s2w1-blockD.sh
for b in A B C D; do sed -e 's/S2-WITNESS-01/S2-WITNESS-04/g' -e 's/s2-witness-01/s2-witness-04/g' -e 's#/private/tmp/k0506-s2w-b198e2e37#/private/tmp/k0506-s2w4-b198e2e37#g' /private/tmp/s2w1-block$b.sh > /private/tmp/s2w4-block$b.sh; done
for b in A B C D; do echo "== block $b diff (only the three tokens may appear)"; diff /private/tmp/s2w1-block$b.sh /private/tmp/s2w4-block$b.sh; done
shasum -a 256 /private/tmp/s2w4-block[ABCD].sh
ls -d /private/tmp/k0506-s2w4-b198e2e37 2>&1
```

(Expected: Block A `ee17183f…` / B `2dce2db8…` / C `82f3c6be…` / D `c682e8aa…` hashes will differ from WITNESS-03's only by the token; the last line must report no such directory, else STOP before Block A.)

**Stage 1 — Blocks A and B (§16.7 transport; STOP on any non-zero rc, no repair):**

```bash
bash /private/tmp/s2w4-blockA.sh 2>&1 | tee /private/tmp/s2w4-blockA.out; echo "rc=${PIPESTATUS[0]}" | tee -a /private/tmp/s2w4-blockA.out
bash /private/tmp/s2w4-blockB.sh 2>&1 | tee /private/tmp/s2w4-blockB.out; echo "rc=${PIPESTATUS[0]}" | tee -a /private/tmp/s2w4-blockB.out
```

Both must print their PASS lines (`BLOCK_A_PASS=1` · `PREFLIGHT_CLEAN=…S2-WITNESS-04-preflight-<stamp>`).

**Stage 2 — pane closed, no competing process (§18.7.2 Step 0; a hand ⌘Q if a pane is resident; repeatable until it passes; this is preparation, not the joint):**

```bash
pgrep -fl "System Settings|Sound.appex" ; echo "[pgrep rc=$?]"
pgrep -fl "afplay|k00-driver-batch" ; echo "[pgrep rc=$?]"
```

Expected: no process line and `[pgrep rc=1]` on both.

**Stage 3 — RESTORE-03 before-read (§18.7.2 Step 1 with the `restore-03` prefix; volume UNKNOWN until read):**

```bash
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="/private/tmp/k00-s2-volume-restore-03-$STAMP"
mkdir -p "$OUT"
date -u +%Y-%m-%dT%H:%M:%SZ > "$OUT/before-utc.txt"
system_profiler SPAudioDataType -json > "$OUT/audio-before.json"
system_profiler SPBluetoothDataType -json > "$OUT/bluetooth-before.json"
osascript -e 'get volume settings' > "$OUT/volume-before.txt"
pgrep -fl "System Settings|Sound.appex" > "$OUT/sound-pane-before.txt" ; echo "rc=$?" >> "$OUT/sound-pane-before.txt"
cat "$OUT/volume-before.txt"
echo "$OUT"
```

**Stage 4 — the one founder hand act (§18.7.2 Step 2 verbatim):** keyboard Volume Down until the bottom/zero state → Volume Up exactly 11 times → stop. Nothing else touched. (Key-feedback click, if on, is a side effect of the control, recorded if heard, not a STOP.)

**Stage 5 — THE JOINT READ (§18.7.2 Step 3 + the unchanged §18.5.2 parser + the pane read; this is both RESTORE-03's after-read and WITNESS-04's pre-Block-C read):**

```bash
date -u +%Y-%m-%dT%H:%M:%SZ > "$OUT/after-utc.txt"
system_profiler SPAudioDataType -json > "$OUT/audio-after.json"
osascript -e 'get volume settings' > "$OUT/volume-after.txt"
pgrep -fl "System Settings|Sound.appex" > "$OUT/sound-pane-after.txt" ; echo "rc=$?" >> "$OUT/sound-pane-after.txt"
cat "$OUT/after-utc.txt" "$OUT/volume-after.txt" "$OUT/sound-pane-after.txt"
```

then the §18.5.2 parser block, unchanged (`python3 - "$OUT/audio-after.json" "$OUT/volume-after.txt" <<'PY' … PY`).

**Joint condition — all of, read from the parser's lines and `sound-pane-after.txt`:**

```text
exactly one DEFAULT_OUTPUT line
DEFAULT_OUTPUT Mac Studio Speakers coreaudio_device_type_builtin …
MAC_STUDIO_DEFAULT_OUTPUT True
OUTPUT_VOLUME 69
OUTPUT_MUTED false
RESTORE_ACCEPTANCE PASS
sound-pane-after.txt = no process line, last line rc=1
```

**PASS at the joint → Block C is the very next shell act. Nothing intervenes: no seal, no commit, no push, no note, no re-read, no deliberation.** **FAIL at the joint (any line) → STOP: no correction, no second hand act, no retry; run only Stage 7's seal for the restoration files; authority SPENT.** **Interruption after an accepted joint read and before Block C started → STOP, same rule; never resumed.**

**Stage 6 — Blocks C and D (only on PASS at the joint; §16.7 transport):**

```bash
bash /private/tmp/s2w4-blockC.sh 2>&1 | tee /private/tmp/s2w4-blockC.out; echo "rc=${PIPESTATUS[0]}" | tee -a /private/tmp/s2w4-blockC.out
bash /private/tmp/s2w4-blockD.sh 2>&1 | tee /private/tmp/s2w4-blockD.out; echo "rc=${PIPESTATUS[0]}" | tee -a /private/tmp/s2w4-blockD.out
```

Block D runs only if Block C's rc is 0 (§16.7). A Block-C STOP (e.g. the batch's own preflight refusing) is evidence, not a retry.

**Stage 7 — seal the restoration files (read-only; after Block D, or immediately on a joint FAIL / Block-C STOP):**

```bash
( cd "$OUT" && shasum -a 256 before-utc.txt audio-before.json bluetooth-before.json volume-before.txt sound-pane-before.txt after-utc.txt audio-after.json volume-after.txt sound-pane-after.txt > SHA256SUMS && cat SHA256SUMS )
```

**Return (one `feature/*` branch, one commit):** `driver-ledger/s2-restore-witness-04-<STAMP>/` = the nine restoration files + `SHA256SUMS` + the parser's seven lines as `parser.txt` + `JOINT.txt` (`PASS` or `STOP <line>`); and §16.7's return block with the `04` substitutions — the `S2-WITNESS-04-<stamp>/` ledger dir (`transcript.txt` + `SHA256SUMS.witness`) when Block C ran, the `S2-WITNESS-04-preflight-<stamp>/` dir, the `s2w4-block*.out` that exist, block diffs + hashes, the Stage-0 pre-existence line, `BRANCH · HEAD · STAMP · BATCH_PIPELINE_RC` (`NOT_RUN_JOINT_STOP` if Block C never started). Cherry-picked here; the restoration half read against §18.5.3, the witness half against §16.4 → **§18.14**. PASS ≠ S2 population · ≠ S3 · ≠ KERNEL-00.

**Standing after §18.13:** `S2-WITNESS-03` ACCEPTED · STOP · spent · second drift census NOT OPENED · 69 exact · `S2-RESTORE/WITNESS-04` AUTHORIZED · pinned · NOT YET EXECUTED (founder hand inside it) · joint = restoration after-read = last observation before Block C · `b198e2e37` unchanged · WITNESS-02/03 residue preserved · S2 population · S3 · KERNEL-00 acceptance CLOSED.

---

## §18.14 — `S2-RESTORE/WITNESS-04` EXECUTED → **STOP IN BLOCK B** (device preflight: apps listing unreadable, CoreDevice error 4000) · RESTORE-03 never started · authority SPENT — 2026-09-15

### 18.14.1 Custody

- Evidence branch `feature/k00-s2-restore-witness-04-stop-evidence-20260915T152805Z`, founder commit `83b7fe3d2c1b9f531daed63f102b960d1a82a2a6` → cherry-picked here as `f33bff911` (`-x`, no edit).
- Evidence directory `driver-ledger/S2-WITNESS-04-preflight-20260915T152805Z/` — 8 files: `RETURN.txt` · `STOP.txt` · `SHA256SUMS.stop` · `apps.json` · `blocks-ABD.txt` · `s2w4-block-diffs.txt` · `s2w4-block-hashes.txt` · `s2w4-preexistence.operator-capture.txt`. `sha256sum -c SHA256SUMS.stop` here: **7/7 OK**.
- `RETURN.txt`: `BASE_HEAD=b198e2e37…` · `PIN=112a40615…` (the §18.13 record commit, i.e. the pin this execution followed) · `PREFLIGHT_STAMP=20260915T152805Z` · `BATCH_PIPELINE_RC=NOT_RUN_BLOCK_B_STOP`.
- Deliberately absent, by design of a Block-B STOP: no `PREFLIGHT_CLEAN` line, no `processes.json`, no restoration directory (`k00-s2-volume-restore-03-*` was never created), no joint read, no `s2w4-block[CD].out`, no ledger, no transcript, no `SHA256SUMS.witness`.
- WITNESS-02 / WITNESS-03 residue untouched.

### 18.14.2 The §18.13.3 pin, honoured to the point of refusal

| Stage | Evidence | Read |
|---|---|---|
| 0 — path absent | `ls: /private/tmp/k0506-s2w4-b198e2e37: No such file or directory` | ✓ |
| 0 — substitutions | `s2w4-block-diffs.txt`: 18 changed lines, every one carries only `S2-WITNESS-01→04` / `s2-witness-01→04` / `k0506-s2w-→k0506-s2w4-` (0 lines outside the three tokens, recounted here) | ✓ diff-proven |
| 0 — block hashes | A `8bebb636…` · B `e8ead651…` · C `fefcec89…` · D `4752ac25…` = the founder's four | ✓ |
| 1 — Block A | `HEAD=b198e2e37…` · `TREE_CLEAN=1` · `Tests: 75 passed, 75 total` · `GATE_75_75=1` · fixture `1a505b3d…` · afplay `88f3b577…` · `AFPLAY_PROCESSES_BEFORE=0` · `BLOCK_A_PASS=1` | ✓ PASS every line (third clean Block A on `b198e2e37`) |
| 1 — Block B | `PREFLIGHT_DIFF_RC=0` · `OTHER_BATCHES=0` · then the apps read: `ERROR: The device disconnected immediately after connecting. (com.apple.dt.CoreDeviceError error 4000 (0xFA0))` · `DeviceIdentifier = A0736AC8-…` · `APPS_READ_RC=1` · `STOP: apps listing unreadable` | **STOP** — the block's own fail-closed line |
| 2–7 | `STOP.txt`: `RESTORE_03=NOT_STARTED · JOINT=NOT_REACHED · BLOCK_C=NOT_RUN · BLOCK_D=NOT_RUN · PLAYBACK=NONE · S2_ROW=NONE` | not reached ✓ |

`apps.json` (35 lines) is the `devicectl` error envelope, not an apps listing: `error.code 4000`, `domain com.apple.dt.CoreDeviceError`, the device identifier, and the invoked arguments. It carries no container information; `E3B88028` was never read.

### 18.14.3 Adjudication (§16.4 · §18.13.3)

**`S2-RESTORE/WITNESS-04` — STOP in Block B · witness NOT PASS · authority SPENT.**

- Block B stopped on its own predeclared refusal (`APPS_READ_RC≠0 → STOP`), before the pane check, before the restoration before-read, before the hand act, before the joint. The paired custody was never entered; the ordinal boundary it introduced was never exercised.
- **Nothing about volume, restoration, the joint condition, S2 physiology or `b198e2e37`'s batch was measured.** The 69 target is untested by this act; the last governed volume read remains 38 at 15:05:51Z (§18.12). No volume operation of any kind occurred.
- The failure is a device-preflight transport failure at the Mac ↔ iPhone seam (`devicectl` could not hold a connection for one listing). Founder statement carried verbatim: *"I am making no inference about why the iPhone disconnected."* This record makes none either. It is not evidence about the S2 lane's design, the volume question, or the phone's audio state.
- First occurrence of this error class in the S2 lane. Comparable device-availability refusals exist in the driver history (Stage-B samples 1–2 "device not automatable at start"; readiness/automation-mode timeouts), all recorded as infrastructure, never as audio outcomes. Same classification here: infrastructure, not sample, not physiology.
- No repair, rerun, reconnect or second listing was attempted under this authority — correct under §18.13.1 (*FAIL → STOP · no correction · no retry · authority spent*).

### 18.14.4 What is and is not learned

- Learned: Block A is stable (three clean passes: WITNESS-01, -03, -04); the §18.13.3 Stage-0 mechanics (token substitution, diff proof, pre-existence read) work on the first attempt; Block B's apps-read refusal fails closed exactly as pinned, with the error envelope preserved as evidence.
- Not learned: whether the paired restoration → joint → Block C sequence holds 69 across its own short interval. That question is exactly where it was before this act.
- Not inferred: the disconnect's cause; whether it is transient; whether it relates to any earlier act. A single occurrence names nothing.

### 18.14.5 Returned to the founder (nothing opened here)

1. Acceptance of the Block-B STOP as read.
2. Whether a fresh paired issuance (`S2-RESTORE/WITNESS-05`, token `s2w5`, the §18.13.3 pin with the token substituted, `b198e2e37` unchanged) is made now, or whether a read-only device-availability read comes first. Under §18.13's own logic the device seam is another volatile prerequisite that Block B already verifies at the last responsible moment before the hand; a reissue exercises that boundary again without new design. A separate device-availability act would be a new authority; not proposed here, only named.
3. Nothing else. S2 population · S3 · KERNEL-00 acceptance remain CLOSED.

**Standing after §18.14:** `S2-RESTORE/WITNESS-04` STOP in Block B · SPENT · RESTORE-03 NOT STARTED · joint NOT REACHED · 69 untested by this act (last read 38 at 15:05:51Z) · disconnect cause UNKNOWN, not inferred · `b198e2e37` unchanged · Block A PASS ×3 · WITNESS-02/03/04 residue preserved · `S2-RESTORE/WITNESS-05` NOT ISSUED · S2 population · S3 · KERNEL-00 acceptance CLOSED.

---

## §18.15 — FOUNDER RULING (2026-09-15) on §18.14: `S2-RESTORE/WITNESS-04` ACCEPTED (STOP in Block B · spent) · device-availability act ⛔ NOT OPENED · **`S2-RESTORE/WITNESS-05` AUTHORIZED AS ONE PAIRED CUSTODY** (§18.13.3 unchanged except the fresh `05` / `s2w5` tokens)

### 18.15.1 Ruling (founder, verbatim)

```text
1. Acceptance
S2-RESTORE/WITNESS-04 is accepted exactly as adjudicated:
    STOP in Block B
    authority SPENT
The STOP establishes only that the Mac → iPhone apps-read seam was unavailable during that act.
It establishes no S2 physiology, no volume state, no restoration result, and no defect in the S2 design.
RESTORE-03 was never entered.
The §18.13 ordinal boundary was never exercised and remains unchanged.

2. Device-availability act
A separate read-only device-availability act is NOT OPENED.
Block B already occupies the correct architectural position for that question: it tests the required
device seam before the founder hand act and refuses if the seam is unavailable.
An earlier availability census would not establish availability at the moment the paired custody requires it.
The infrastructure refusal therefore earns a fresh attempt through the existing boundary, not a new
boundary in front of it.

3. Fresh paired authority
S2-RESTORE/WITNESS-05 is AUTHORIZED as one paired custody.
Its execution contract is §18.13.3 unchanged except for the fresh run/path tokens:
    S2-WITNESS-04 → S2-WITNESS-05
    s2-witness-04 → s2-witness-05
    s2w4          → s2w5
    /private/tmp/k0506-s2w4-b198e2e37 → /private/tmp/k0506-s2w5-b198e2e37
The blocks are again extracted from the original 17b4df63b carrier and substitution-proved before execution.
b198e2e37 remains the orchestration artifact.
No batch, block, target, parser, restoration sequence, or acceptance law changes.

4. Execution order remains unchanged
    Stage 0   fresh extraction / substitution proof / path absence
    Stage 1   Block A · then Block B
    Stage 2   pane closed · no competing process
    Stage 3   restoration before-read
    Stage 4   founder hand act: Volume Down → zero · Volume Up exactly 11 times · stop
    Stage 5   joint read = RESTORE after-read = WITNESS pre-Block-C read
    PASS      Block C is the next shell act
    then      Block D only if Block C returns rc 0
The joint condition remains:
    exactly one default output · Mac Studio Speakers · builtin transport ·
    OUTPUT_VOLUME 69 · OUTPUT_MUTED false · RESTORE_ACCEPTANCE PASS ·
    Sound/System Settings absent · rc=1

5. Failure law
Every existing refusal remains operative.
If Block A or Block B stops, the paired authority is spent before restoration.
If the joint condition fails, STOP with no correction, second hand act, or retry.
If execution is interrupted after an accepted joint read and before Block C begins, STOP.
If Block C's own frozen preflight refuses, that STOP is evidence and there is no rerun under the same authority.
No failure permits weakening 69, modifying b198e2e37, changing the blocks, or bypassing the failed boundary.

6. Residue
S2-WITNESS-02, S2-WITNESS-03, and S2-WITNESS-04 worktrees and evidence remain preserved residue.
They are not reused, modified, executed, or cleaned under this authority.
S2-WITNESS-05 receives a fresh s2w5 path and fresh evidence carrier.

Standing
    S2-RESTORE/WITNESS-04   STOP · accepted · spent
    RESTORE-03              not entered
    device census           NOT OPENED
    S2-RESTORE/WITNESS-05   AUTHORIZED · pinned execution = §18.13.3 unchanged except fresh 05 / s2w5 tokens · NOT YET EXECUTED
    69 target               unchanged
    b198e2e37               unchanged
    S2 population           CLOSED
    S3                      CLOSED
    KERNEL-00 acceptance    CLOSED

The governing principle remains:
A transient failure of a lawful boundary is reason to approach that boundary again under fresh authority,
not reason to route around it.
```

Founder reasoning, substance preserved: Block B *is* the availability gate, placed at the last responsible moment before the hand; a census earlier in time would not establish availability at the moment the paired custody needs it. WITNESS-04 did not fail to produce the intended phenomenon; it never reached the experiment, so there is nothing yet to redesign. The next meaningful evidence comes from another clean passage through Block B.

### 18.15.2 Execution pin — `S2-RESTORE/WITNESS-05`

**The contract is §18.13.3 verbatim, with `s2w4` → `s2w5` in every path and the run/transcript tokens `04` → `05`.** Only Stage 0 differs textually and is reproduced here so the paste needs no editing; Stages 1–7 are §18.13.3's blocks with `/private/tmp/s2w4-block*` read as `/private/tmp/s2w5-block*`, `k00-s2-volume-restore-03-` unchanged as the restoration prefix (RESTORE-03 was never entered under WITNESS-04, so its label is unspent and stays), and the return directory `driver-ledger/s2-restore-witness-05-<STAMP>/` + `S2-WITNESS-05-…` for the §16.7 return.

**Stage 0 — extraction with the `s2w5` token (three literal substitutions from the original `17b4df63b` carrier; the diff must show only those; the path must not pre-exist):**

```bash
DOC=docs/programme/VOICE-2026/KERNEL-00_VPIO-02_K00-06_PARTIAL-ZERO_DISCRIMINATOR_PLAN_2026-09-15.md
cd /Users/soullab/MAIA-SOVEREIGN
git show 17b4df63b:$DOC | sed -n '599,625p' > /private/tmp/s2w1-blockA.sh
git show 17b4df63b:$DOC | sed -n '633,702p' > /private/tmp/s2w1-blockB.sh
git show 17b4df63b:$DOC | sed -n '710,713p' > /private/tmp/s2w1-blockC.sh
git show 17b4df63b:$DOC | sed -n '719,732p' > /private/tmp/s2w1-blockD.sh
for b in A B C D; do sed -e 's/S2-WITNESS-01/S2-WITNESS-05/g' -e 's/s2-witness-01/s2-witness-05/g' -e 's#/private/tmp/k0506-s2w-b198e2e37#/private/tmp/k0506-s2w5-b198e2e37#g' /private/tmp/s2w1-block$b.sh > /private/tmp/s2w5-block$b.sh; done
for b in A B C D; do echo "== block $b diff (only the three tokens may appear)"; diff /private/tmp/s2w1-block$b.sh /private/tmp/s2w5-block$b.sh; done
shasum -a 256 /private/tmp/s2w5-block[ABCD].sh
ls -d /private/tmp/k0506-s2w5-b198e2e37 2>&1
```

(Last line must report no such directory, else STOP before Block A. The `s2w1-block*.sh` intermediates are regenerated from the carrier each time; overwriting them is not a residue violation — the residue rule covers the `s2w2`/`s2w3`/`s2w4` files and worktrees, which this Stage never names.)

**Stage 1:**

```bash
bash /private/tmp/s2w5-blockA.sh 2>&1 | tee /private/tmp/s2w5-blockA.out; echo "rc=${PIPESTATUS[0]}" | tee -a /private/tmp/s2w5-blockA.out
bash /private/tmp/s2w5-blockB.sh 2>&1 | tee /private/tmp/s2w5-blockB.out; echo "rc=${PIPESTATUS[0]}" | tee -a /private/tmp/s2w5-blockB.out
```

Both must print their PASS lines (`BLOCK_A_PASS=1` · `PREFLIGHT_CLEAN=…S2-WITNESS-05-preflight-<stamp>`); a Block-B refusal (as §18.14) spends the authority before restoration.

**Stages 2–5:** §18.13.3 Stages 2–5 verbatim (pane + competing-process reads · RESTORE-03 before-read under `k00-s2-volume-restore-03-$STAMP` · the one hand act · the joint read with the §18.5.2 parser). Joint condition unchanged. PASS → Block C is the very next shell act; FAIL / interruption after an accepted read → STOP, spent.

**Stage 6 (only on PASS at the joint):**

```bash
bash /private/tmp/s2w5-blockC.sh 2>&1 | tee /private/tmp/s2w5-blockC.out; echo "rc=${PIPESTATUS[0]}" | tee -a /private/tmp/s2w5-blockC.out
bash /private/tmp/s2w5-blockD.sh 2>&1 | tee /private/tmp/s2w5-blockD.out; echo "rc=${PIPESTATUS[0]}" | tee -a /private/tmp/s2w5-blockD.out
```

**Stage 7:** §18.13.3 seal of the nine restoration files, after Block D or immediately on a joint FAIL / Block-C STOP.

**Return:** one `feature/*` branch: `driver-ledger/s2-restore-witness-05-<STAMP>/` (nine restoration files + `SHA256SUMS` + `parser.txt` + `JOINT.txt`) and the §16.7 return with the `05` substitutions (`S2-WITNESS-05-<stamp>/` ledger dir when Block C ran, `S2-WITNESS-05-preflight-<stamp>/`, the `s2w5-block*.out` that exist, diffs + hashes, the Stage-0 pre-existence line, `BRANCH · HEAD · STAMP · BATCH_PIPELINE_RC`). On a pre-restoration STOP the return is the §18.14 shape (`STOP.txt` + `SHA256SUMS.stop`, no restoration directory). Cherry-picked here; read against §18.5.3 / §16.4 → **§18.16**. PASS ≠ S2 population · ≠ S3 · ≠ KERNEL-00.

**Standing after §18.15:** `S2-RESTORE/WITNESS-04` ACCEPTED · STOP · spent · device-availability act NOT OPENED · `S2-RESTORE/WITNESS-05` AUTHORIZED · pinned · NOT YET EXECUTED (founder hand inside it) · 69 exact · `b198e2e37` unchanged · WITNESS-02/03/04 residue preserved · S2 population · S3 · KERNEL-00 acceptance CLOSED.

#### 18.15.3 Mid-act relay (founder, 2026-09-15) — `S2-RESTORE/WITNESS-05` at the hand boundary: Stages 0–3 PASS · RESTORE-03 before-read COMPLETE · hand act PENDING

Relayed from the executing Mac lane, recorded as custody only (this session has no hand and no Mac; nothing here acts on the Mac lane):

```text
Stage 0          PASS
Block A          PASS
Block B          PASS
pane check       PASS · rc=1
competing proc   PASS · rc=1
RESTORE-03
before-read      COMPLETE

before volume    38
muted            false
OUT              /private/tmp/k00-s2-volume-restore-03-20260915T154626Z
```

Reading: Block B passed this time (the WITNESS-04 device seam refusal did not recur; no inference about why). The before-read of 38 equals the WITNESS-03 pre-C read of 15:05:51Z — recorded as an observation, not as continuity (no read in between). The next act is the one §18.7.2 keyboard sequence by the founder's hand, then the joint read; PASS at the joint → Block C is the very next shell act on the Mac lane. This note is written before the hand act and does not sit between the joint read and Block C; it authorizes nothing and changes nothing. Outcome → §18.16 on return of the evidence.

---

## §18.16 — `S2-RESTORE/WITNESS-05` EXECUTED → **JOINT PASS → BLOCK C PASS → BLOCK D COMPLETED** · witness half VERIFIED HERE (§16.4 PASS on every committed line) · restoration half FOUNDER-ATTESTED, custody OWED (packaging refused by the remote safety layer) — 2026-09-15

### 18.16.1 Custody

- Evidence branch `feature/k00-s2-restore-witness-05-evidence-20260915T154626Z`, founder commit `36bfde4e653eb6c84b3d872f04056da2b148ad57` → cherry-picked here as `041b892c0` (`-x`, no edit). Branch clean at push (founder-stated).
- Committed: `driver-ledger/S2-WITNESS-05-20260915T154952Z/` (ledger · output-ledger · transcript · batch.log · xcodegen.log · build-for-testing.log · sample-1-xcodebuild.log · sample-timing.tsv · `stimulus-preflight/` ×5 · `stimulus-sample-1.tsv` · `stimulus-sample-1-afplay.log` · `daemons/` ×4 · `journals/kernel00-K00-fb8793df-1789487467.jsonl` · `SHA256SUMS.witness`) and `driver-ledger/S2-WITNESS-05-preflight-20260915T154525Z/` (`apps.json` · `processes.json`). **`sha256sum -c SHA256SUMS.witness` here: 12/12 OK** (= the founder's independent recount).
- **NOT committed, founder-disclosed:** the restoration half (`/private/tmp/k00-s2-volume-restore-03-20260915T154626Z/`: nine captures + `SHA256SUMS` + `parser.txt`, seal 9/9 founder-verified), the `s2w5-block[ABD].out` files, the Stage-0 diffs/hashes/pre-existence line and `JOINT.txt`. The remote safety layer refused every post-execution packaging write into the worktree; the founder did not bypass it. Block D ran once under `bash`; the `tee` wrapper was rejected, so `s2w5-blockD.out` never existed; Block D was not rerun to manufacture it. → **custody gap, not a defect in the act**: the raw restoration evidence is intact, unchanged and unrerun on the Mac; it is OWED to the record by a lawful packaging path (§18.16.5).
- Residue: `s2w2`/`s2w3`/`s2w4` untouched.

### 18.16.2 Restoration half — founder-relayed (§18.5.3 law), NOT YET VERIFIED HERE

```text
before  2026-09-15T15:46:26Z   volume 38 · unmuted · pane rc=1
after   2026-09-15T15:49:23Z   volume 69 · unmuted · pane rc=1
joint read lines (relayed):
  output volume:69 ... output muted:false
  rc=1
  DEFAULT_OUTPUT Mac Studio Speakers coreaudio_device_type_builtin 48000
  MAC_STUDIO_DEFAULT_OUTPUT True
  OUTPUT_VOLUME 69
  OUTPUT_MUTED false
  RESTORE_ACCEPTANCE PASS
```

Reading: every §18.5.3 line present in the relay; the one hand act (Down to zero · Up ×11) took 38 → 69 — the second observation of the stepped-control procedure reaching the exact integer (n = 2: RESTORE-02 65 → 69, RESTORE-03 38 → 69; the slider act gave 73). Standing of this half until the nine files + seal + `parser.txt` are received and re-hashed here: **FOUNDER-ATTESTED PASS**, not VERIFIED HERE. Independent corroboration inside the committed witness half: the batch's own stimulus preflight at 15:49:59Z (36 s after the joint read) read `output volume:69 · muted false · Mac Studio Speakers · builtin` (`stimulus-preflight/volume.txt`, `audio-output.json` with exactly one default-output device, `transcript.txt` line 6) — the batch's frozen boundary saw the same state the joint read saw.

### 18.16.3 Witness half — §16.4, read here from the committed files

| §16.4 condition | Evidence | Read |
|---|---|---|
| Preflight PASS | `transcript.txt`: `stimulus preflight PASS: fixture 1a505b3d… · afplay 88f3b577… · default output Mac Studio Speakers (coreaudio_device_type_builtin) · volume 69 · muted false`; `stimulus-preflight/`: fixture SHA = pin · afplay SHA = pin · `format=EXACT` (mono · 48 000 · 16-bit · 8 640 000 frames · 180.000 s) · `DEFAULT_OUTPUT_MATCH True` | ✓ |
| Complete `stimulus-sample-1.tsv` | 82 rows: sample · fixture · fixtureSha256 · afplay · afplaySha256 · afplayVolume 0.50 · afplaySeconds 180 · pid 94754 · startEpoch 1789487400 · preRunState alive · 67 liveness · postRunState alive · stopRequestedEpoch · waitExitStatus 143 · stopEpoch · custody | ✓ complete |
| All-alive liveness spanning `run_test` | 67 liveness rows, every state `alive`, epochs 1789487402 → 1789487471 (69 s), no gap > 2 s; driver started 15:50:01, `testOutputSample` passed in 28.890 s, liveness continues to the stop | ✓ |
| `custody VALID` | last row `custody VALID`; transcript: `pid 94754 alive through the governed interval; stopped by the batch, wait rc=143` | ✓ |
| Stopped before the 180 s failsafe | start 1789487400 → stop 1789487471 = 71 s; `waitExitStatus 143` = the batch's TERM, not the failsafe | ✓ |
| No afplay before / after | before: Block A `AFPLAY_PROCESSES_BEFORE=0` (founder-relayed; `.out` not packaged) · after: Block D `AFPLAY_PROCESSES_AFTER=0` (founder-relayed; Block D ran once, output not captured) | ✓ relayed, not in custody here |
| One row + one journal | `ledger.md` one row; `journals/` exactly one file; `sample-timing.tsv` one line (`1 1789487401 1789487471`) | ✓ |
| rc 0 | `BATCH_PIPELINE_RC=0` (founder-relayed); transcript ends `batch complete`; `output rows read` | ✓ |

Additional verification here: `k00-ledger.py --subject vpio-02` on the journal reproduces the ledger row byte-for-byte (`K00-fb8793df` · 72 records · SHA `156fcca2…` · **gen-1 listen** · cold · `isRunningImmediate` true · first callback 2 ms · listening 397 ms · held 19 s · generations 1); `k00-output-ledger.py` reproduces the four output rows (K00-05-CANCEL PASS-05 · K00-05-COMPLETE PASS-05 · K00-06 UNMEASURED-06 · COUPLING UNMEASURED-06, one full rendering window). Journal: 14-step VPIO-02 trace, one `app_lifecycle` (`didBecomeActive` at seq 1, generation 0), 18 input-health samples, 3 output-render samples, `stream_cancel_measured` + `stream_complete` present. Daemon snapshots identical before/after (`audiomxd` PID 113). Preflight dir: `E3B88028` ×1, harness processes 0. `stimulus-sample-1-afplay.log` is 0 bytes (afplay wrote nothing to its log on a normal run; observed, not read as a fault).

**Per §16: the sample-1 journal is never an S2 row and receives no §7 reading.** Its rows above are evidence of the instrument working, not physiology adjudicated.

### 18.16.4 Adjudication

**`S2-RESTORE/WITNESS-05`:**
- Restoration half — **FOUNDER-ATTESTED PASS** (§18.5.3), custody OWED; corroborated by the batch's own frozen boundary 36 s later.
- Ordinal joint — **HONOURED**: the founder relays that Block C was the very next shell act after the accepted joint read, with no read, note or deliberation between; the batch's preflight at +36 s is the first machine confirmation of that ordering.
- Witness half — **PASS under §16.4** on every line verifiable from the committed evidence; the two "no afplay" reads and rc 0 are founder-relayed and consistent with everything in custody. Authority SPENT.
- This is the **first complete passage of the S2 orchestration on the real Mac**: the batch's stimulus preflight, the per-sample stimulus custody, the liveness monitor, TERM/wait, the ledger row and the output reader all executed as `b198e2e37` pinned them. What §16 set out to witness has been witnessed once.
- What this PASS does not establish: no S2 population (sample 1 is never an S2 row) · no §7 reading · no K00-06 movement · S3 not opened · KERNEL-00 not accepted.

### 18.16.5 Returned to the founder (nothing opened here)

1. **Acceptance of the witness PASS** as read in §18.16.3–18.16.4.
2. **Custody of the restoration half + block outputs.** The nine restoration captures, `SHA256SUMS`, `parser.txt` and (if they exist) the Stage-0 diffs/hashes/pre-existence line are OWED to the record by a lawful packaging path — a founder-side copy into a fresh `feature/*` worktree where the safety layer permits it, or any route the founder rules; nothing is rerun or regenerated; the 9/9 seal must re-hash here. Until received, §18.16.2 stands as founder-attested. This is a custody item, not a STOP.
3. **Whether the S2 population is issued.** The orchestration is now witnessed; the population authority is a separate founder act (§15/§16 shape: `k00-driver-batch.sh K00-0506-S2 10 --act output --cancel-at 1000 --settle 2 --vp on --mode L --subject vpio-02 --stimulus s2-nearend`, with the §7 reading law). Not proposed here beyond naming it; the volume precondition will be re-read by the batch at its own preflight, and the §18.13 lesson (prepare at the last responsible moment) applies to any population issuance.
4. Nothing else. S3 NOT OPEN · KERNEL-00 acceptance CLOSED.

### 18.16.6 C-D24 — gate maintenance (instrument commit `dbbc8e8c1`, founder acceptance owed)

The evidence cherry-pick `041b892c0` landed the 549th tracked journal and the 16th ledgered directory; the corpus-partition assertion pins the set sizes exactly (`vpio-02 50 · vpio-01 30 · engine 468`, total 548, 15 directories) and went RED on the cherry-pick alone (records untouched). This is the C-D19/C-D21/C-D23 species under the structural rule: the founder's ratified partition keeps set sizes as pins, so a lawful new population moves them by exactly its size. Maintenance applied in the gate only: total 548→549 · vpio-02 50→51 · gen-1 listen 49→50 · cross-subject mismatch array 50→51 · ledgered directories 15→16 · the title's set sizes; membership rule (H ∧ C), disagreement fail-closed, the produced-ledger row-for-row reproduction (now over 16 directories, the new one reproducing its single row) and every other assertion unchanged. Gate 76/76 read alone before the instrument commit; the gate commit precedes this records commit (the C-D21 red-push shape did not recur — the red was read before any push). Whether a structural rule that must move on every lawful population is the right shape is a founder question, not decided here.

**Standing after §18.16:** `S2-RESTORE/WITNESS-05` EXECUTED · joint PASS (founder-attested, custody owed) · witness half PASS (§16.4, verified here) · authority SPENT · orchestration WITNESSED ONCE on the real Mac · 69 last read 15:49:23Z (joint) and 15:49:59Z (batch preflight) · `b198e2e37` unchanged · WITNESS-02/03/04 residue preserved · S2 population NOT AUTHORIZED · S3 NOT OPEN · KERNEL-00 acceptance CLOSED.

---

## §18.17 — FOUNDER RULING on §18.16 (2026-09-15): `S2-RESTORE/WITNESS-05` ACCEPTED · restoration standing FIXED (repository-verifiable + founder-attested, upgradable only by custody transfer) · **`S2-WITNESS-05-CUSTODY-COMPLETE-01` AUTHORIZED, custody only** · C-D24 ACCEPTED · S2 population NOT YET ISSUED

### 18.17.1 The ruling, as captured

Transport note (custody-side, recorded not absorbed): this session's context was compacted between the founder's message and this pin; the ruling below is carried by the session's own compaction record, which preserved the founder's sentences quoted here verbatim and the remainder as a faithful capture. Nothing in it was reconstructed from the repository. Where a sentence is quoted it is the founder's; where it is not, it is the captured substance.

1. **`S2-RESTORE/WITNESS-05` ACCEPTED as read** in §18.16.3–18.16.4 — "first complete passage of the S2 orchestration on the real Mac". The missing repository copy of the restoration captures is **custody incompleteness, not a defect**; no downgrade of the PASS.
2. **Restoration standing** = two carriers, named separately and never merged: (a) **repository-verifiable** — the batch's own stimulus preflight at 15:49:59Z read `69 · unmuted · Mac Studio Speakers · builtin` (`S2-WITNESS-05-20260915T154952Z/stimulus-preflight/`); (b) **founder-attested, local** — the RESTORE-03 captures at `/private/tmp/k00-s2-volume-restore-03-20260915T154626Z/` (before 38 → after 69 · parser `RESTORE_ACCEPTANCE PASS` · pane rc=1 · `SHA256SUMS` 9/9 verified at the Mac). Standing (b) is **upgradable only by custody transfer** and is **never described as rerun**.
3. **`S2-WITNESS-05-CUSTODY-COMPLETE-01` AUTHORIZED — custody only.** Copy byte-for-byte the already-existing `before-utc.txt · audio-before.json · bluetooth-before.json · volume-before.txt · sound-pane-before.txt · after-utc.txt · audio-after.json · volume-after.txt · sound-pane-after.txt · SHA256SUMS · parser.txt` from `/private/tmp/k00-s2-volume-restore-03-20260915T154626Z/` into `docs/programme/VOICE-2026/driver-ledger/s2-restore-witness-05-20260915T154626Z/`; originals untouched; the nine `SHA256SUMS` files must verify **before and after** the copy, mismatch = STOP. `parser.txt` **may** be compared with a fresh execution of the pinned §18.5.2 parser on the copied `audio-after.json` + `volume-after.txt` — a read/derivation check, **not a rerun** of the act. A new `JOINT.txt` **may** be created but must self-identify as an index over existing evidence (e.g. `JOINT PASS` · `DERIVED_DURING_CUSTODY_COMPLETION true` · `SOURCE after-utc.txt · volume-after.txt · sound-pane-after.txt · parser.txt` · `ORIGINAL_JOINT_FILE absent — packaging write refused after execution`). `/private/tmp/s2w5-blockA.out`, `s2w5-blockB.out`, `s2w5-blockC.out` may be copied byte-for-byte. **`s2w5-blockD.out` must NOT be manufactured**; custody note, founder's words: *"Block D executed once. The tee carrier was refused by the remote safety layer. No original s2w5-blockD.out exists. Block D was not rerun to manufacture one. Its produced repository artifacts and SHA256SUMS.witness are the evidence of that act."* Stage-0 material that was displayed but never written = attested/derived custody material, **not original files**.
4. **NOT authorized** under this act: volume change · keyboard volume act · device selection · playback · `run_test` · batch invocation · new S2 sample · new restoration read · new witness read · regeneration of missing experimental evidence · modification of `b198e2e37`.
5. **C-D24 ACCEPTED** as gate maintenance (§18.16.6). The structural question — pins that test historical cardinality versus corpus integrity — deserves a later design ruling; **not opened**.
6. **S2 population NOT YET ISSUED.** The experimental prerequisite is met. After custody completion returns and the 9/9 restoration seal recomputes from the repository carrier, the programme returns for an **explicit** S2-population issuance ruling; authority does not arise automatically.
7. Governing distinction, founder's words: *"The experiment is complete. The evidence transfer is not. Custody may complete the carrier; custody may not recreate the act."*

Standing fixed by the ruling: WITNESS-05 PASS · accepted · spent · RESTORE-03 PASS, local, intact · restoration repository custody INCOMPLETE · C-D24 accepted · `b198e2e37` unchanged · CUSTODY-COMPLETE-01 authorized, custody only · S2 population NOT YET AUTHORIZED · S3 CLOSED · KERNEL-00 acceptance CLOSED · WITNESS-02/03/04 residue preserved.

### 18.17.2 Execution pin — `S2-WITNESS-05-CUSTODY-COMPLETE-01` (Mac act; founder or the Mac-side lane; this session has no Mac)

Shape: every line is a read, a byte-for-byte copy, a hash, a derivation labelled as such, or a git act on a fresh `feature/*` branch. No line runs `afplay`, `osascript`, `xcodebuild`, `devicectl`, the batch, the driver or any volume/device verb. The source directory is read only; nothing under `/private/tmp` is written, moved or removed. Any STOP line ends the act with its evidence in place — no correction, no retry under this authority.

Stage 0 — fresh carrier worktree from the lane tip (the branch that carries this pin); pre-existence read; source inventory read:

```bash
set -u
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
BR="feature/k00-s2-witness-05-custody-complete-$STAMP"
WT="/private/tmp/k00-s2w5-custody-$STAMP"
SRC="/private/tmp/k00-s2-volume-restore-03-20260915T154626Z"
REL="docs/programme/VOICE-2026/driver-ledger/s2-restore-witness-05-20260915T154626Z"
cd /Users/soullab/MAIA-SOVEREIGN
git fetch origin claude/voice-2026-census-01
test ! -e "$WT" && echo "WT_PREEXISTS false" || { echo "STOP: worktree path pre-exists $WT"; exit 2; }
git worktree add -b "$BR" "$WT" origin/claude/voice-2026-census-01
cd "$WT"
git rev-parse HEAD
test -d "$SRC" && echo "SRC_PRESENT true" || { echo "STOP: source dir absent"; exit 2; }
ls -la "$SRC"
for f in before-utc.txt audio-before.json bluetooth-before.json volume-before.txt sound-pane-before.txt after-utc.txt audio-after.json volume-after.txt sound-pane-after.txt SHA256SUMS parser.txt; do test -f "$SRC/$f" && echo "SRC_FILE $f present" || { echo "STOP: $f absent in source"; exit 2; }; done
test ! -e "$WT/$REL" && echo "DST_PREEXISTS false" || { echo "STOP: target dir pre-exists in the carrier"; exit 2; }
```

Stage 1 — verify the nine-file seal in the SOURCE before any copy (read only; STOP on any line that is not `OK`):

```bash
( cd "$SRC" && shasum -a 256 -c SHA256SUMS ) | tee "/private/tmp/k00-s2w5-custody-$STAMP.before-copy.txt"
grep -c ': OK$' "/private/tmp/k00-s2w5-custody-$STAMP.before-copy.txt"
grep -q 'FAILED' "/private/tmp/k00-s2w5-custody-$STAMP.before-copy.txt" && { echo "STOP: source seal mismatch before copy"; exit 3; }
test "$(grep -c ': OK$' "/private/tmp/k00-s2w5-custody-$STAMP.before-copy.txt")" = "9" && echo "BEFORE_COPY_SEAL 9/9 OK" || { echo "STOP: before-copy count is not 9"; exit 3; }
```

Stage 2 — byte-for-byte copy of the eleven files into the carrier; verify the seal AFTER the copy and compare every file to its original (STOP on any difference):

```bash
mkdir -p "$WT/$REL"
DST="$WT/$REL"
for f in before-utc.txt audio-before.json bluetooth-before.json volume-before.txt sound-pane-before.txt after-utc.txt audio-after.json volume-after.txt sound-pane-after.txt SHA256SUMS parser.txt; do cp -p "$SRC/$f" "$DST/$f"; done
( cd "$DST" && shasum -a 256 -c SHA256SUMS ) | tee "$DST/after-copy-seal-check.txt"
grep -q 'FAILED' "$DST/after-copy-seal-check.txt" && { echo "STOP: seal mismatch after copy"; exit 3; }
test "$(grep -c ': OK$' "$DST/after-copy-seal-check.txt")" = "9" && echo "AFTER_COPY_SEAL 9/9 OK" || { echo "STOP: after-copy count is not 9"; exit 3; }
for f in before-utc.txt audio-before.json bluetooth-before.json volume-before.txt sound-pane-before.txt after-utc.txt audio-after.json volume-after.txt sound-pane-after.txt SHA256SUMS parser.txt; do cmp "$SRC/$f" "$DST/$f" && echo "BYTE_IDENTICAL $f"; done
( cd "$DST" && shasum -a 256 SHA256SUMS parser.txt ) | tee "$DST/unsealed-originals.sha256"
```

Stage 3 — derivation check: the §18.5.2 parser, code unchanged, executed on the COPIED after-captures; its output is compared with the original `parser.txt`. This is a read of already-captured state, never a new read of the Mac (no `system_profiler`, no `osascript`). A difference is evidence to return, not a line to edit:

```bash
{
python3 - "$DST/audio-after.json" "$DST/volume-after.txt" <<'PY'
import json, re, sys

raw = open(sys.argv[1], encoding="utf-8").read()
raw = raw[raw.find("{"):raw.rfind("}")+1]
d = json.loads(raw)

items = []
for group in d.get("SPAudioDataType", []):
    items.extend(group.get("_items", []))

defaults = [
    x for x in items
    if x.get("coreaudio_default_audio_output_device") == "spaudio_yes"
]

for x in defaults:
    print(
        "DEFAULT_OUTPUT",
        x.get("_name"),
        x.get("coreaudio_device_transport"),
        x.get("coreaudio_device_srate"),
    )

mac = next((x for x in items if x.get("_name") == "Mac Studio Speakers"), None)
mac_default = bool(mac and mac.get("coreaudio_default_audio_output_device") == "spaudio_yes")
print("MAC_STUDIO_DEFAULT_OUTPUT", mac_default)

vol = open(sys.argv[2], encoding="utf-8").read()
m_vol = re.search(r"output volume:(\d+)", vol)
m_mute = re.search(r"output muted:(true|false)", vol)
volume = int(m_vol.group(1)) if m_vol else None
muted = m_mute.group(1) if m_mute else None
print("OUTPUT_VOLUME", volume)
print("OUTPUT_MUTED", muted)

ok = (
    len(defaults) == 1
    and mac_default
    and defaults[0].get("coreaudio_device_transport") == "coreaudio_device_type_builtin"
    and volume == 69
    and muted == "false"
)
print("RESTORE_ACCEPTANCE", "PASS" if ok else "STOP")
PY
} > "$DST/parser.custody-derivation.txt"
cat "$DST/parser.custody-derivation.txt"
diff "$DST/parser.txt" "$DST/parser.custody-derivation.txt" > "$DST/parser.derivation-diff.txt"; echo "PARSER_DERIVATION_DIFF_RC=$?" | tee -a "$DST/parser.derivation-diff.txt"
```

Stage 4 — derived index `JOINT.txt` (self-identifying; an index over existing evidence, never an original), the Block A/B/C outputs copied only if they exist, the Block-D custody note in the founder's words, and a custody-time read of the Stage-0 block files (labelled as a read at custody time, not the Stage-0 original):

```bash
{
printf 'JOINT PASS\n'
printf 'DERIVED_DURING_CUSTODY_COMPLETION true\n'
printf 'SOURCE after-utc.txt · volume-after.txt · sound-pane-after.txt · parser.txt\n'
printf 'ORIGINAL_JOINT_FILE absent — packaging write refused after execution\n'
printf 'ACT S2-RESTORE/WITNESS-05 · RESTORE-03 after-read = pre-Block-C joint · plan §18.13 / §18.15.2\n'
printf 'DERIVED_AT_UTC %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
printf -- '--- after-utc.txt ---\n'; cat "$DST/after-utc.txt"
printf -- '--- volume-after.txt ---\n'; cat "$DST/volume-after.txt"
printf -- '--- sound-pane-after.txt ---\n'; cat "$DST/sound-pane-after.txt"
printf -- '--- parser.txt (original) ---\n'; cat "$DST/parser.txt"
} > "$DST/JOINT.txt"
cat "$DST/JOINT.txt"
for b in A B C; do if test -f "/private/tmp/s2w5-block$b.out"; then cp -p "/private/tmp/s2w5-block$b.out" "$DST/s2w5-block$b.out" && cmp "/private/tmp/s2w5-block$b.out" "$DST/s2w5-block$b.out" && echo "BLOCK_OUT_COPIED s2w5-block$b.out"; else echo "BLOCK_OUT_ABSENT s2w5-block$b.out" | tee -a "$DST/block-outs.custody-read.txt"; fi; done
test ! -e /private/tmp/s2w5-blockD.out && echo "BLOCK_D_OUT_ABSENT true (as attested)" | tee -a "$DST/block-outs.custody-read.txt" || { echo "STOP: /private/tmp/s2w5-blockD.out exists, contradicting the attestation — not copied, returned for ruling"; exit 4; }
cat > "$DST/BLOCK-D-CUSTODY-NOTE.txt" <<'NOTE'
Block D executed once. The tee carrier was refused by the remote safety layer. No original s2w5-blockD.out exists. Block D was not rerun to manufacture one. Its produced repository artifacts and SHA256SUMS.witness are the evidence of that act.
NOTE
{ printf 'STAGE-0 CUSTODY-TIME READ — not the Stage-0 original (that material was displayed, never written)\nREAD_AT_UTC %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"; ls -la /private/tmp/s2w5-block[ABCD].sh 2>&1; shasum -a 256 /private/tmp/s2w5-block[ABCD].sh 2>&1; } > "$DST/stage-0.custody-read.txt"
cat "$DST/stage-0.custody-read.txt"
```

Stage 5 — seal the carrier, return file, commit on the feature branch, push (the lane cherry-picks with `-x` and recomputes every hash here):

```bash
( cd "$DST" && ls -1 | grep -v '^SHA256SUMS.custody$' | xargs shasum -a 256 > SHA256SUMS.custody && cat SHA256SUMS.custody )
{ printf 'ACT S2-WITNESS-05-CUSTODY-COMPLETE-01\nBRANCH %s\nCARRIER_BASE %s\nSTAMP %s\nSOURCE %s\nBEFORE_COPY_SEAL 9/9 OK\nAFTER_COPY_SEAL 9/9 OK\nPARSER_DERIVATION_DIFF_RC %s\nORIGINALS_TOUCHED none\nDEVICE_ACTS none\nVOLUME_ACTS none\n' "$BR" "$(git rev-parse HEAD)" "$STAMP" "$SRC" "$(tail -1 "$DST/parser.derivation-diff.txt" | sed 's/.*=//')"; } > "$DST/RETURN.txt"
cat "$DST/RETURN.txt"
git add "$REL"
git status --short
git commit -m "custody(voice-2026): S2-WITNESS-05-CUSTODY-COMPLETE-01 — RESTORE-03 evidence carrier, byte-identical, seal 9/9 before and after copy; derived JOINT.txt self-identified; Block D note, no manufactured output"
git push -u origin "$BR"
git log -1 --format=%H
```

Return: branch name + commit SHA + the `RETURN.txt` and `SHA256SUMS.custody` text → §18.18 (this session cherry-picks with `-x`, runs `shasum`/`sha256sum -c` on both seals, re-executes the §18.5.2 parser on the copied captures, reads `JOINT.txt` as derived, and records; the gate's corpus partition is not touched by this directory — it holds no journal and no `ledger.md`). Nothing about the S2 population is opened by a clean return; §18.17.1 item 6 governs.

**Standing after §18.17:** WITNESS-05 ACCEPTED · spent · CUSTODY-COMPLETE-01 AUTHORIZED, pinned, NOT YET EXECUTED · C-D24 ACCEPTED · 69 last read 15:49:59Z (batch preflight, in custody) · `b198e2e37` unchanged · S2 population NOT YET AUTHORIZED · S3 CLOSED · KERNEL-00 acceptance CLOSED.

---

## §18.18 — `S2-WITNESS-05-CUSTODY-COMPLETE-01` EXECUTED → custody Stages 0–5 PASS · **STOP AT THE COMMIT TRANSPORT** (governance hook refused: dependencies absent in the fresh worktree) · carrier STAGED LOCALLY, NOT COMMITTED, NOT PUSHED · pin defect C-D25 (this session's) — 2026-09-15

### 18.18.1 What the executing lane reported (founder-relayed; nothing received here)

Every custody line of §18.17.2 passed before the commit boundary: source seal **9/9 OK** before the copy · destination seal **9/9 OK** after · all eleven files `cmp` byte-identical · parser derivation identical (`PARSER_DERIVATION_DIFF_RC=0`) · `JOINT.txt` self-identified as derived · `s2w5-block[ABC].out` copied · `s2w5-blockD.out` absent as attested, the Block-D note written exactly as pinned · Stage-0 block hashes read and labelled as a custody-time read · originals untouched · no device / volume / playback / batch / witness act. `SHA256SUMS.custody` was generated. `RETURN.txt` as produced:

```text
ACT S2-WITNESS-05-CUSTODY-COMPLETE-01
BRANCH feature/k00-s2-witness-05-custody-complete-20260915T163124Z
CARRIER_BASE a5e874aa21964958372a3699df01dfb6874ba264
STAMP 20260915T163124Z
SOURCE /private/tmp/k00-s2-volume-restore-03-20260915T154626Z
BEFORE_COPY_SEAL 9/9 OK
AFTER_COPY_SEAL 9/9 OK
PARSER_DERIVATION_DIFF_RC 0
ORIGINALS_TOUCHED none
DEVICE_ACTS none
VOLUME_ACTS none
```

Then the pre-commit hook refused (verbatim, relayed):

```text
❌ Pre-commit blocked: repository dependencies are not installed.
Run: npm ci
Governance hooks never download dependencies at hook time.
```

The lane did not install dependencies, bypass the hook, amend the pin or retry — none of which §18.17.2 authorized. Because the Stage-5 block ran under `set -u` only (no `set -e`), the `git push -u origin "$BR"` line executed after the refused commit and **created the remote branch at the carrier base `a5e874aa2` with no custody commit on it**. The staged carrier is intact in the local worktree `/private/tmp/k00-s2w5-custody-20260915T163124Z`; no custody evidence exists on any remote.

### 18.18.2 Reading

- **The custody act did its work; the transport failed.** Nothing about the evidence is in doubt: the seals verified twice, the copies are byte-identical, the derivation matched, the source directory was only read. What did not happen is the carrier reaching a commit. The founder's distinction holds in the other direction too: *custody may complete the carrier; a carrier that never left the worktree has completed nothing yet.*
- **The refusal was the hook doing its job, and the lane refusing to improvise was correct.** A fresh `git worktree add` shares the object database but not `node_modules`; the governance pre-commit needs them and, by its own rule, never downloads at hook time. The lane returned for a ruling instead of choosing a transport — the AUTH-3 posture (authority is an input, never a discovery).
- **C-D25 — defect in this session's pin, not in the lane's conduct.** §18.17.2 Stage 0 created a fresh worktree and never provisioned the hook's dependencies, although this record already carries the exercised answer: §16 Block A links the main checkout's tree (`[ -e node_modules ] || ln -s /Users/soullab/MAIA-SOVEREIGN/node_modules node_modules`, line 608; Block E note at line 852; the §18.4 census worktree did the same, founder-disclosed at line 944). Second defect in the same pin: Stage 5 chained `git commit` and `git push` without `set -e`, so a refused commit still pushed an empty branch. Both are instruction defects of the §12.1 / MAC-COMPILE-03 shape; the pin is preserved as written, corrected beside it (§18.18.4) only on a ruling.
- **The remote branch `feature/k00-s2-witness-05-custody-complete-20260915T163124Z` at `a5e874aa2`** carries no evidence and is not a custody artefact; it is residue of the pin defect. Left in place (deletion of a remote branch is a founder act, not needed for anything).
- Nothing here is a rerun, a new read, a device act or a volume act. The restoration standing is unchanged from §18.17.1 item 2: repository-verifiable (batch preflight) + founder-attested/local; the carrier that would upgrade it is staged, unshipped.

### 18.18.3 Returned to the founder — commit-transport ruling only

The evidence is not in question; only how the already-staged carrier may lawfully reach a commit. Three shapes, none chosen here:

1. **Link the existing dependencies (precedented in this record):** in the same local worktree, `ln -s /Users/soullab/MAIA-SOVEREIGN/node_modules node_modules` — no download, no network, the exact line §16 Block A and the §18.4 census already exercised — then the same `git commit` and `git push` on the same staged carrier. The staged index is not rebuilt; the symlink is untracked and never added.
2. **`npm ci` in the worktree** — what the hook message suggests; downloads and writes a dependency tree; not precedented in this lane; the lane was right not to treat the message as authority.
3. **Hold** — the local worktree keeps the staged carrier; nothing more.

Whatever is ruled: no new stamp, no fresh worktree, no re-copy — the carrier already staged is the evidence, and creating a second one would be the "recreate the act" the founder forbade. A ruling for shape 1 can use §18.18.4 verbatim.

### 18.18.4 Transport pin for shape 1 — valid ONLY on the founder's ruling naming it (nothing else runs)

```bash
set -eu
WT="/private/tmp/k00-s2w5-custody-20260915T163124Z"
REL="docs/programme/VOICE-2026/driver-ledger/s2-restore-witness-05-20260915T154626Z"
cd "$WT"
git rev-parse HEAD
git rev-parse --abbrev-ref HEAD
git status --short
test -e node_modules && echo "NODE_MODULES_PRESENT true" || ln -s /Users/soullab/MAIA-SOVEREIGN/node_modules node_modules
test -L node_modules && echo "NODE_MODULES_LINKED true"
git status --porcelain | grep -v '^?? node_modules$' | grep -v "^A  $REL/" > /private/tmp/k00-s2w5-custody-20260915T163124Z.status-residue.txt || true
test ! -s /private/tmp/k00-s2w5-custody-20260915T163124Z.status-residue.txt && echo "STAGED_CARRIER_ONLY true" || { echo "STOP: index or tree carries more than the staged carrier"; cat /private/tmp/k00-s2w5-custody-20260915T163124Z.status-residue.txt; exit 3; }
( cd "$REL" && shasum -a 256 -c SHA256SUMS.custody ) | tail -3
( cd "$REL" && shasum -a 256 -c SHA256SUMS ) | grep -c ': OK$'
git commit -m "custody(voice-2026): S2-WITNESS-05-CUSTODY-COMPLETE-01 — RESTORE-03 evidence carrier, byte-identical, seal 9/9 before and after copy; derived JOINT.txt self-identified; Block D note, no manufactured output"
git push -u origin "$(git rev-parse --abbrev-ref HEAD)"
git log -1 --format=%H
```

Return: the commit SHA + the pushed branch → this session cherry-picks with `-x`, recomputes both seals, re-executes the §18.5.2 parser on the copied captures, reads `JOINT.txt` as derived, records §18.19. The symlink is never committed (untracked; the `STAGED_CARRIER_ONLY` line refuses anything beyond the staged carrier).

**Standing after §18.18:** CUSTODY-COMPLETE-01 custody PASS · commit REFUSED (dependencies absent) · carrier STAGED LOCALLY · custody evidence pushed NO · remote feature branch at base only (residue) · C-D25 = this session's pin defect (dependency link omitted; no `set -e`), pin preserved, correction beside it · experimental act untouched · restoration standing unchanged · `b198e2e37` unchanged · S2 population NOT AUTHORIZED · S3 CLOSED · KERNEL-00 acceptance CLOSED.

---

## §18.19 — `S2-WITNESS-05-CUSTODY-COMPLETE-01` TRANSPORT COMPLETE (founder ruling: shape 1, §18.18.4) → carrier RECEIVED, cherry-picked, **VERIFIED HERE on every line** · restoration half of WITNESS-05 now **REPOSITORY-VERIFIED** — 2026-09-15

### 18.19.1 Transport and custody

- Founder ruled shape 1 (§18.18.3) and ran §18.18.4 in the same local worktree: `NODE_MODULES_LINKED true` · `STAGED_CARRIER_ONLY true` · both seals 9/9 · pre-commit PASS · push PASS; no `npm ci`, no new worktree, no re-copy, no device/volume/playback act (founder-relayed; the commit itself is the evidence).
- Branch `feature/k00-s2-witness-05-custody-complete-20260915T163124Z`, commit `34bdfbb91d027a223a9b46a547bf3514feca4c28`, parent `a5e874aa2` (= the §18.17 pin commit, as `RETURN.txt` declares) → cherry-picked here as `e6af62b18` (`-x`, no edit): 24 files, 487 insertions, all under `driver-ledger/s2-restore-witness-05-20260915T154626Z/`. The directory holds no journal and no `ledger.md`; the corpus-partition gate read **76/76** on the cherry-pick (no C-D24-species movement).

### 18.19.2 Verified here (recomputed from the committed files, not relayed)

| Check | Result |
|---|---|
| `sha256sum -c SHA256SUMS.custody` | **22/22 OK** |
| `sha256sum -c SHA256SUMS` (the RESTORE-03 seal made at the Mac at 15:49Z) | **9/9 OK** |
| Founder's pasted `SHA256SUMS.custody` vs the committed file vs a fresh recompute over the 22 files | all three identical |
| §18.5.2 parser re-executed here on the copied `audio-after.json` + `volume-after.txt` | `DEFAULT_OUTPUT Mac Studio Speakers coreaudio_device_type_builtin 48000` · `MAC_STUDIO_DEFAULT_OUTPUT True` · `OUTPUT_VOLUME 69` · `OUTPUT_MUTED false` · **`RESTORE_ACCEPTANCE PASS`** — byte-equal to the original `parser.txt` and to `parser.custody-derivation.txt` (`PARSER_DERIVATION_DIFF_RC=0`) |
| Same parser on the before-captures | `OUTPUT_VOLUME 38` · `RESTORE_ACCEPTANCE STOP` — the before-state as relayed in §18.15.3 |
| `before-utc.txt` → `after-utc.txt` | `2026-09-15T15:46:26Z` → `2026-09-15T15:49:23Z` (2 min 57 s around the one hand act) |
| `sound-pane-before/after.txt` | `rc=1` both (pane closed at both reads; the two files hash identically) |
| `audio-before.json` = `audio-after.json` | identical hash — device state byte-identical across the act, only the volume scalar moved (the §18.8 shape) |
| `JOINT.txt` | self-identified: `DERIVED_DURING_CUSTODY_COMPLETION true` · `ORIGINAL_JOINT_FILE absent — packaging write refused after execution` · `DERIVED_AT_UTC 2026-09-15T16:33:57Z` ≠ the 15:49:23Z read it indexes — an index over existing evidence, as ruled |
| `BLOCK-D-CUSTODY-NOTE.txt` | the founder's sentence verbatim; `block-outs.custody-read.txt`: `BLOCK_D_OUT_ABSENT true (as attested)`; no `s2w5-blockD.out` in the carrier |
| **Stage-0 blocks** | `stage-0.custody-read.txt` lists the four `/private/tmp/s2w5-block[ABCD].sh` with SHA-256s. **Reproduced here from the immutable source** (`git show 17b4df63b:` lines 599–625 / 633–702 / 710–713 / 719–732 + exactly the three §18.15.2 substitutions): `4c0c7f4d…` · `918b0323…` · `3eab254f…` · `e30277f5…`, byte sizes 1763 · 2035 · 373 · 1035 — **identical to the custody-time read**. The blocks the Mac executed are the §18.15.2 derivation, proven from the object database, not attested. |
| `s2w5-blockA.out` | `HEAD=b198e2e37…` · `TREE_CLEAN=1` · `Tests: 75 passed, 75 total` · `GATE_75_75=1` · fixture + afplay SHAs = pins · **`AFPLAY_PROCESSES_BEFORE=0`** · `BLOCK_A_PASS=1` |
| `s2w5-blockB.out` | `PREFLIGHT_DIFF_RC=0` · `OTHER_BATCHES=0` · `APPS_READ_RC=0` · `E3B88028_CONTAINER_HITS=1` · `PROCESS_READ_RC=0` · harness 0 · preflight dir = the committed `S2-WITNESS-05-preflight-20260915T154525Z` |
| `s2w5-blockC.out` | stimulus preflight PASS at 15:49:59Z (volume 69) · sample 1 custody VALID · ledgered `K00-fb8793df` · **`BATCH_PIPELINE_RC=0`** |

Consequences for §18.16.3: the two rows that were "founder-relayed, not in custody" move — `AFPLAY_PROCESSES_BEFORE=0` and `BATCH_PIPELINE_RC=0` are now committed evidence. The one remaining relayed value is Block D's `AFPLAY_PROCESSES_AFTER=0` (no output file exists; by ruling never manufactured) — it stays attested, corroborated by the batch's own TERM/wait custody (`waitExitStatus 143`, `custody VALID`) in the witness directory.

Observation, not a STOP (recorded for the next §16.7 use, nothing repaired): every `.out` ends `rc=` with an empty value. The §16.7 line reads `${PIPESTATUS[0]}`, a bash name; the founder's shell is zsh (`pipestatus`), so the carrier line printed nothing. Each block's own last line (`BLOCK_A_PASS=1` · `PREFLIGHT_CLEAN=…` · `BATCH_PIPELINE_RC=0`) carries the exit evidence instead. Instruction defect of the §12.1 shape, candidate **C-D26**; correction = future pins run the block under `bash -c` for the rc line or write `${pipestatus[1]}` — not applied to any produced record.

### 18.19.3 Adjudication (this session's reading; acceptance is the founder's)

- **`S2-WITNESS-05-CUSTODY-COMPLETE-01`: COMPLETE.** Custody stages PASS (§18.18), transport PASS by the ruled shape, carrier verified here on every line, nothing recreated, no originals touched. The only new bytes in the carrier are the ruled derived files (`JOINT.txt`, the derivation/diff outputs, the custody-time reads, the note, the seals, `RETURN.txt`), each self-identified.
- **Restoration half of `S2-RESTORE/WITNESS-05` (§18.16.2): FOUNDER-ATTESTED PASS → REPOSITORY-VERIFIED PASS** under §18.5.3, on the custody-transfer path the §18.17 ruling named, never by rerun. The whole paired act now stands on committed evidence: RESTORE-03 before 38 → one keyboard act → joint 69 at 15:49:23Z (pane closed, device state byte-identical) → Block C's own preflight re-read 69 at 15:49:59Z → sample 1 with `custody VALID` → `BATCH_PIPELINE_RC=0`; Block A/B/C outputs in custody; Block D attested. The ordinal joint (§18.13) is now corroborated by two committed clocks 36 s apart with nothing between them in the block outputs.
- **C-D25** (this session's pin defects) stands as recorded in §18.18.2; the ruled transport exercised the precedented link once more. The empty base-only remote branch was overwritten in place by the ruled push (the branch now points at `34bdfbb91`, parent `a5e874aa2`) — the residue resolved itself under the ruling; nothing was deleted.
- **What this completes and what it does not:** the §18.17.1 item 6 precondition — *"after custody completion returns and the 9/9 restoration seal recomputes from the repository carrier"* — is met. It **opens nothing**: the S2 population is a separate, explicit founder issuance; S3 not open; KERNEL-00 not accepted; `b198e2e37` unchanged; 69 last committed reads 15:49:23Z and 15:49:59Z (output volume is volatile state on this Mac — §18.13; any population issuance re-prepares at the last responsible moment, the batch preflight refusing drift).

### 18.19.4 Returned to the founder

1. Acceptance of §18.19.2–18.19.3 as read (custody complete; restoration half repository-verified).
2. C-D26 (zsh `PIPESTATUS` rc line) — record-only candidate; whether the §16.7 transport line is amended for future pins.
3. The S2-population issuance ruling, now that its stated precondition is met. Named, not proposed: the §15 invocation shape on unchanged `b198e2e37` with the §7 reading law, in the §18.13 paired-custody form (restoration joint → immediate batch). Nothing is opened by this record.

**Standing after §18.19:** CUSTODY-COMPLETE-01 COMPLETE · WITNESS-05 witness half PASS (§16.4) + restoration half PASS (§18.5.3), both repository-verified · authority SPENT · C-D24 accepted · C-D25 recorded · C-D26 candidate · `b198e2e37` unchanged · WITNESS-02/03/04 residue preserved · S2 population NOT AUTHORIZED (issuance ruling owed) · S3 CLOSED · KERNEL-00 acceptance CLOSED.

---

## §18.20 — FOUNDER RULING on §18.19 (2026-09-15): §18.19 ACCEPTED · C-D26 ACCEPTED as a non-blocking transport/observability defect (repair NOT authorized here) · **S2 POPULATION AUTHORIZED** (the existing §15 invocation under the existing §7 reading law; nothing else) → execution pin `K00-0506-S2` · Mac act, NOT YET EXECUTED

### 18.20.1 The ruling (founder, verbatim where quoted)

1. **§18.19 ACCEPTED as written.** `S2-RESTORE/WITNESS-05` "now stands wholly on committed evidence"; the restoration half moved from founder-attested/local to repository-verified PASS "by custody transfer only. No restoration, witness, playback, device act or sample was rerun to obtain that upgrade." The paired evidence establishes: RESTORE-03 before 38 · after 69 · Mac Studio Speakers default/builtin · Sound pane absent at both reads · `RESTORE_ACCEPTANCE PASS` · ordinal joint PASS · Block C PASS · `BATCH_PIPELINE_RC` 0 · stimulus custody VALID · governed S2 sample 1 · Block D completed · seals 9/9 · 22/22 · 12/12 · `b198e2e37` unchanged. "The two committed clocks around the joint are accepted as custody of the sequence, not as a replacement for the ordinal law."
2. **C-D26 ACCEPTED, non-blocking.** Defect: "The §16.7 outer execution wrapper emits an empty `rc=` when invoked from zsh because it references Bash's `${PIPESTATUS[0]}` in the operator shell." Classification: transport/observability · outer wrapper only · experiment, block body and evidence unaffected where the block's own terminal line records its result. `C-D26 OPEN as maintenance candidate · repair NOT AUTHORIZED HERE · population blocker NO`. "No transport repair is folded into the population act."
3. **S2 POPULATION AUTHORIZED.** "The authority is strictly the already-defined S2 population act: Execute the existing §15 S2-population invocation under the existing §7 reading law. Nothing about the population act changes the witness, classifier, output reader, corpus semantics or evidentiary law. The successful witness does not itself become a population interpretation; it merely establishes that the governed S2 acquisition path is fit to be used."
4. **Population law unchanged** — "acquisition ≠ interpretation · presence ≠ significance · one sample ≠ pattern · population ≠ acceptance". "No finding is strengthened merely because WITNESS-05 passed. The population may produce whatever the existing law permits it to produce, including null, absence, ambiguous or counter-hypothesis evidence."
5. **Scope boundary** — authorizes only S2 population; NOT: S3 · KERNEL-00 acceptance · new orchestration · new stimulus · new volume target · new witness architecture · repair of C-D26 · cleanup of WITNESS residue · reinterpretation of prior samples. `b198e2e37` frozen; WITNESS-02/03/04 residue preserved.
6. **Return** under the existing §15 return contract, then read under §7; a successful execution "does not automatically open S3 or KERNEL-00 acceptance."

Governing distinction, founder's words: *"The witness proved the path. The population may now use the path. What the population means remains governed by the reading law, not by the success of the witness."*

Standing fixed by the ruling: WITNESS-05 PASS · accepted · spent · restoration custody repository-verified · C-D24 ACCEPTED · C-D25 resolved by the corrected transport · C-D26 OPEN, non-blocking · `b198e2e37` unchanged · **S2 population AUTHORIZED** · S3 CLOSED · KERNEL-00 acceptance CLOSED.

### 18.20.2 What the population act is (read from §15 · §7 · §16, nothing new)

- **Invocation** (§15, verbatim shape): `k00-driver-batch.sh K00-0506-S2 10 --act output --cancel-at 1000 --settle 2 --vp on --mode L --subject vpio-02 --stimulus s2-nearend` on unchanged `b198e2e37`; stratum `K00-0506-S2`; N = 10 fixed; no top-up, no auto-rerun; an abort → INCOMPLETE. The batch's own stimulus preflight re-reads fixture SHA · afplay SHA · default output · **volume 69 · unmuted** before sample 1 and STOPs (exit 8) on any mismatch, before playback; every sample carries its `stimulus-sample-N.tsv` custody (INVALID → that row UNMEASURED for the discriminator).
- **Reading law** (§7.2/§7.3, ratified, unchanged): per invocation, valid stimulus row = the 997 Hz source visible as `signal`-class input in ≥ 2 healthy pre-output baseline windows, else **UNMEASURED**; `signal`-class input persists through the full rendering windows → **A-consistent**; disappears during deep rendering while callbacks/`ioRunning` continue → **A′-consistent**; mixed → **CHARACTERIZE**. No `rmsMean` multiplier decides. Every row also yields the frozen K00-05/K00-06 rows (`k00-output-ledger.py`), evidence only — the K00-06 PASS condition is untouched by S2 and the 3/5/2 population is never pooled with it. The WITNESS-05 sample-1 journal stays outside the population (§16).
- **Shape of the act** = §16 Blocks A–D on the real Mac with the population tokens, plus the governed pre-Block-C volume read that §18.11 introduced (read-only; it protects the invocation from being spent on a drift STOP). **No restoration hand act is inside this pin** — the ruling authorizes the population, not a restoration; if the pre-C read shows drift, the act STOPs before Block C and returns (the batch was never invoked; disposition of the authority is the founder's; a paired restoration + population issuance would be the §18.13.3 shape with Block C = the population, a separate ruling). Volume was last read 69 at 15:49:59Z (batch preflight, committed); output volume is volatile state on this Mac (§18.13) — the pre-C read is expected to decide.
- **Transport** = §16.7 unchanged (per C-D26 ruling: no repair folded in). Under zsh the outer `rc=` line prints empty; each block's own terminal line carries its result (`BLOCK_A_PASS=1` · `PREFLIGHT_CLEAN=…` · `BATCH_PIPELINE_RC=…` · the seal listing).

### 18.20.3 Execution pin — `K00-0506-S2` population (Mac act; this session has no Mac)

**Stage 0 — blocks from the immutable source, token-substituted, diff-proven; pre-existence read.** Blocks A/B/C are §16's blocks with exactly these substitutions: run label `S2-WITNESS-01` → `K00-0506-S2` · N `1` → `10` (in the invocation only) · transcript `s2-witness-01-transcript` → `k00-0506-s2-transcript` · worktree `/private/tmp/k0506-s2w-b198e2e37` → `/private/tmp/k0506-s2pop-b198e2e37`. Block D is NOT token-substituted (the §16 post-read names `stimulus-sample-1.tsv`, N = 1); the population post-read `Dpop` is written out in Stage 5 below (globs over `stimulus-sample-*.tsv`, row and journal counts, seal `SHA256SUMS.population`). Expected SHA-256 of the four block files as derived here (must match on the Mac before anything runs):

```text
e157eaa4fb184d13fda80f597c23b74347d6e9acb51f02f473708105993f3625  /private/tmp/s2pop-blockA.sh
eee5b2c37b14c45c139c58ea51a5750505370abd769b600f229b1df4a72fe392  /private/tmp/s2pop-blockB.sh
3f39acd4f3400a086e47bc60e1ab00dd2e7b22fc352ccb5fa73f5c96e8ed952f  /private/tmp/s2pop-blockC.sh
17e3f18496b485fe5ebf138c7cd820c38dc66f1e29652f4dd4a422943670bc9d  /private/tmp/s2pop-blockDpop.sh
```

```bash
cd /Users/soullab/MAIA-SOVEREIGN
DOC=docs/programme/VOICE-2026/KERNEL-00_VPIO-02_K00-06_PARTIAL-ZERO_DISCRIMINATOR_PLAN_2026-09-15.md
git show 17b4df63b:$DOC | sed -n '599,625p' > /private/tmp/s2w1-blockA.sh
git show 17b4df63b:$DOC | sed -n '633,702p' > /private/tmp/s2w1-blockB.sh
git show 17b4df63b:$DOC | sed -n '710,713p' > /private/tmp/s2w1-blockC.sh
for b in A B C; do sed -e 's/S2-WITNESS-01 1 --act/K00-0506-S2 10 --act/' -e 's/S2-WITNESS-01/K00-0506-S2/g' -e 's/s2-witness-01/k00-0506-s2/g' -e 's#/private/tmp/k0506-s2w-b198e2e37#/private/tmp/k0506-s2pop-b198e2e37#g' /private/tmp/s2w1-block$b.sh > /private/tmp/s2pop-block$b.sh; done
for b in A B C; do echo "== block $b diff (only the four tokens may appear)"; diff /private/tmp/s2w1-block$b.sh /private/tmp/s2pop-block$b.sh; done
shasum -a 256 /private/tmp/s2pop-block[ABC].sh
test ! -e /private/tmp/k0506-s2pop-b198e2e37 && echo "POP_WORKTREE_PREEXISTS false" || { echo "STOP: /private/tmp/k0506-s2pop-b198e2e37 pre-exists"; exit 2; }
```

Then write `/private/tmp/s2pop-blockDpop.sh` with exactly the Stage 5 text and confirm `shasum -a 256 /private/tmp/s2pop-blockDpop.sh` = the value above. Any hash mismatch = STOP before Block A.

**Stage 1 — Block A (custody) then Block B (device preflight), §16.7 transport:**

```bash
bash /private/tmp/s2pop-blockA.sh 2>&1 | tee /private/tmp/s2pop-blockA.out; echo "rc=${PIPESTATUS[0]}" | tee -a /private/tmp/s2pop-blockA.out
bash /private/tmp/s2pop-blockB.sh 2>&1 | tee /private/tmp/s2pop-blockB.out; echo "rc=${PIPESTATUS[0]}" | tee -a /private/tmp/s2pop-blockB.out
```

`BLOCK_A_PASS=1` and `PREFLIGHT_CLEAN=…` must appear; any STOP line ends the act (evidence returned, nothing invoked).

**Stage 2 — governed pre-Block-C read (read-only; §18.11 shape). `output volume:69` ∧ `output muted:false` ∧ pane closed (`rc=1`) → Stage 3 is the very next act. Anything else → STOP, return; no restoration, no adjustment, no retry under this authority:**

```bash
date -u +%Y-%m-%dT%H:%M:%SZ | tee /private/tmp/s2pop-preC-clock.txt
osascript -e 'get volume settings' | tee /private/tmp/s2pop-preC-volume.txt
pgrep -fl "System Settings|Sound.appex" | tee /private/tmp/s2pop-preC-pgrep.txt; echo "[pgrep rc=$?]" | tee -a /private/tmp/s2pop-preC-pgrep.txt
grep -q 'output volume:69, ' /private/tmp/s2pop-preC-volume.txt && grep -q 'output muted:false' /private/tmp/s2pop-preC-volume.txt && echo "PRE_C_READ OK" || echo "STOP: pre-Block-C volume read is not 69/unmuted — population NOT invoked"
```

**Stage 3 — Block C, exactly one invocation (the ten samples run inside it; the batch's own stimulus preflight is the second volume boundary and STOPs before playback on drift):**

```bash
bash /private/tmp/s2pop-blockC.sh 2>&1 | tee /private/tmp/s2pop-blockC.out; echo "rc=${PIPESTATUS[0]}" | tee -a /private/tmp/s2pop-blockC.out
```

`BATCH_PIPELINE_RC=0` and `batch complete` are the PASS lines; an exit 8/9 STOP inside the batch is evidence (nothing sampled on 8; the partial ledger on 9), never rerun.

**Stage 4 — Block Dpop (read-only post-read + seal), only after Block C returned:**

```bash
bash /private/tmp/s2pop-blockDpop.sh 2>&1 | tee /private/tmp/s2pop-blockDpop.out; echo "rc=${PIPESTATUS[0]}" | tee -a /private/tmp/s2pop-blockDpop.out
```

**Stage 5 — the `Dpop` block text (write byte-for-byte to `/private/tmp/s2pop-blockDpop.sh` in Stage 0):**

```bash
cd /private/tmp/k0506-s2pop-b198e2e37
LD="$(ls -td docs/programme/VOICE-2026/driver-ledger/K00-0506-S2-2* | head -1)"
echo "LEDGER_DIR=$LD"
pgrep -x afplay > /private/tmp/s2pop-afplay-after.txt && { cat /private/tmp/s2pop-afplay-after.txt; echo "AFPLAY_PROCESSES_AFTER=nonzero"; } || echo "AFPLAY_PROCESSES_AFTER=0"
ls -la "$LD/stimulus-preflight"
cat "$LD/stimulus-preflight/stimulus.sha256" "$LD/stimulus-preflight/afplay.sha256" "$LD/stimulus-preflight/stimulus-wave-metadata.txt" "$LD/stimulus-preflight/volume.txt"
for f in "$LD"/stimulus-sample-*.tsv; do echo "== $f"; grep -E '^(sample|pid|startEpoch|preRunState|postRunState|waitExitStatus|stopEpoch|custody)' "$f"; done
grep -c "custody$(printf '\t')VALID" "$LD"/stimulus-sample-*.tsv
cat "$LD/sample-timing.tsv"
grep -E 'stimulus|STOP|ABORT|custody|ledgered|batch complete|INFRASTRUCTURE' "$LD/batch.log"
grep -c '^| AUTOMATED' "$LD/ledger.md"
ls "$LD/journals" | grep -c '\.jsonl$'
cp /private/tmp/k00-0506-s2-transcript.txt "$LD/transcript.txt"
( cd "$LD" && shasum -a 256 transcript.txt stimulus-sample-*.tsv stimulus-sample-*-afplay.log stimulus-preflight/* journals/*.jsonl ledger.md output-ledger.md batch.log sample-timing.tsv daemons/* > SHA256SUMS.population && wc -l SHA256SUMS.population && cat SHA256SUMS.population )
```

**Return (§15/§16.7 contract):** one `feature/*` branch (e.g. `feature/k00-s2-population-evidence-<stamp>`) carrying `driver-ledger/K00-0506-S2-<stamp>/` complete (ledger · output-ledger · transcript · batch.log · xcodegen/build/sample logs · `sample-timing.tsv` · `stimulus-preflight/` ×5 · `stimulus-sample-1…10.tsv` + afplay logs · `daemons/` · `journals/` · `SHA256SUMS.population`), `driver-ledger/K00-0506-S2-preflight-<stamp>/`, the `s2pop-block[ABC]*.out` + `s2pop-blockDpop.out` + `s2pop-preC-*.txt` copied into the ledger directory, and `BRANCH · HEAD · STAMP · BATCH_PIPELINE_RC`. On a pre-C or in-batch STOP the return is the §18.12/§17 shape (STOP evidence, no population rows). This session then cherry-picks with `-x`, recomputes `SHA256SUMS.population`, reruns `k00-ledger.py --subject vpio-02` and `k00-output-ledger.py` over every journal, applies the §7.2/§7.3 reading per invocation, and records → **§18.21**. Expected gate movement on receipt: the corpus partition moves by the population's size (C-D24 species; 549→559 · vpio-02 51→61 · directories 16→17), read red before any push and maintained in a separate instrument commit as before.

**What a completed population does and does not do:** produces up to ten §7 readings (A / A′ / UNMEASURED / CHARACTERIZE) beside ten frozen K00-05/06 rows; may be null, mixed or counter-hypothesis; earns no K00-06 PASS; opens neither S3 nor KERNEL-00 acceptance; both remain separate founder rulings after §18.21 is read.

**Standing after §18.20:** S2 population AUTHORIZED · pinned · NOT YET EXECUTED (Mac act) · `b198e2e37` unchanged · 69 last committed read 15:49:59Z (pre-C read decides) · C-D26 OPEN, non-blocking · WITNESS-02/03/04 residue preserved · S3 CLOSED · KERNEL-00 acceptance CLOSED.

---

## §18.21 — `K00-0506-S2` POPULATION ACT EXECUTED → **STOP IN BLOCK B: two `VoiceKernelHarness` processes present, NEITHER in the `.vpio02` container** · population NOT invoked · nothing played · evidence RECEIVED and VERIFIED HERE — 2026-09-15

### 18.21.1 Custody

- Branch `feature/k00-s2-population-stop-evidence-20260915T170040Z`, founder commit `e128037428be61a820659d5e43d3f41c0a2e9ad9` (parent `b198e2e37`, the execution worktree's HEAD) → cherry-picked here as the commit preceding this record (`-x`, no edit). Directory `driver-ledger/K00-0506-S2-preflight-20260915T170040Z/` — 9 files: `RETURN.txt` · `STOP.txt` · `SHA256SUMS.stop` · `apps.json` · `processes.json` · `block-hashes.txt` · `s2pop-blockA.out` · `s2pop-blockB.out` · `stage0-diffs.txt`. **`sha256sum -c SHA256SUMS.stop` here: 8/8 OK.** No journal, no `ledger.md` → corpus partition untouched; gate **76/76** on the cherry-pick.
- **Stage 0 verified:** `block-hashes.txt` = the four §18.20.3 values exactly (`e157eaa4…` · `eee5b2c3…` · `3f39acd4…` · `17e3f184…`) = recomputed here from the immutable source + the four substitutions; `stage0-diffs.txt` carries 12 changed lines, all four tokens, nothing else; `/private/tmp/k0506-s2pop-b198e2e37` did not pre-exist (founder-relayed).
- **Block A PASS** (fourth clean pass on `b198e2e37`): `HEAD=b198e2e37…` · `TREE_CLEAN=1` · `Tests: 75 passed, 75 total` · `GATE_75_75=1` · fixture + afplay SHAs = pins · `AFPLAY_PROCESSES_BEFORE=0` · `BLOCK_A_PASS=1`.
- **Block B STOP on its own fail-closed line:** `PREFLIGHT_DIFF_RC=0` · `OTHER_BATCHES=0` · `APPS_READ_RC=0` · `E3B88028_CONTAINER_HITS=1` (the `.vpio02` install is intact and present) · `PROCESS_READ_RC=0` · **`VoiceKernelHarness processes: 2` → `STOP: harness process present`**. Pre-C read NOT RUN · Block C NOT RUN · `Dpop` NOT RUN · population NOT invoked · playback NONE · S2 rows NONE · `BATCH_PIPELINE_RC=NOT_RUN_BLOCK_B_STOP`. The outer `rc=` lines are empty (C-D26, as expected under zsh).

### 18.21.2 What the two processes are (read from the committed `processes.json`, 349 rows)

| PID | Executable container | Identified by |
|---|---|---|
| **2098** | `…/Bundle/Application/0B07D423-97E7-4196-BC1C-C69C96F994BE/VoiceKernelHarness.app` | `driver-ledger/reinstall-20260914T011754Z.txt` lines 15–16: `bundleID: life.soullab.voicekernel.k00` · `installationURL …0B07D423…` — **the R1 install (`.k00`, Phase-A repro subject)** |
| **2099** | `…/Bundle/Application/6A2E406B-D1B8-43A4-92F3-29D50333AF19/VoiceKernelHarness.app` | `driver-ledger/reinstall-20260914T194554Z.txt` lines 17–18: `bundleID: life.soullab.voicekernel.vpio01` · `installationURL …6A2E406B…` — **the FIRST-INSTALL-01 `.vpio01` install (FROZEN evidence)** |

Neither is the `.vpio02` container `E3B88028…` (present in `apps.json`, no process). So: the population's subject was cold; two *other* subjects were running. Facts, not inference: (i) no governed act has launched `.vpio01` since its first install (it was "installed, never launched" through every record to date), and R1 was last governed on 2026-09-14 (device HOLD IN PLACE); (ii) the two PIDs are adjacent (2098 · 2099); (iii) every harness PID previously read on this device was five digits (`54266 · 55561 · 63378 · 67021 · 80148 · 82431`). Inference only, kept as inference: adjacent low PIDs are consistent with the device having restarted since 15:51Z and both apps being relaunched together; **cause and actor UNKNOWN, not inferred** (founder: no inference offered; none is made here).

### 18.21.3 Reading

- **Block B refused correctly, and it refused something that would have aborted the batch inside.** The batch's own sample-1 precondition (`k00-driver-batch.sh` `harness_present()`, line 101) greps for *any* `VoiceKernelHarness` and, finding one, runs `testTerminateOnly` on the driver's own subject — `.vpio02` — which cannot terminate a `.k00` or `.vpio01` process; sample 1 would have been ledgered `PRECONDITION-FAILED` and the batch aborted as DRIVER/INFRASTRUCTURE FAILURE (line 259). Block B stopping before Block C kept the invocation unspent and avoided an infra row; the pin's ordering did its work.
- **Nothing about the organism, the volume or S2 physiology was read.** The pre-C volume read never ran; 69 remains last committed at 15:49:59Z; no afplay before; no playback.
- **Two foreign harness processes alive is itself a custody fact of the device**, of the same species as the stray pid 63378 (census §7.13–7.14: origin UNKNOWN, precondition residue, not a finding). It differs in one respect that the founder may weigh: one of the two is the `.vpio01` frozen-evidence subject, whose container has now been entered by a launch no record authorized. Whether that launch changed anything inside the container (a journal is written only on Export; the recorder starts at launch) is UNREAD; a read-only container listing would answer it and is named, not proposed.
- **Disposition of the population authority:** by the §18.15 precedent (WITNESS-04's Block-B STOP = spent, re-issued fresh), a Block-B STOP spends the act. The population was authorized as "the existing §15 invocation"; that invocation never began. Whether the same issuance survives a clearance act or a fresh issuance is made is the founder's.

### 18.21.4 Returned to the founder (nothing opened here)

1. **STOP acceptance** as read.
2. **Disposal of the two foreign processes** — a device act, not authorized by §18.20. The exercised shape is §10.5 C (one `testTerminateOnly` per subject on the `83a382a14` runner with `TEST_RUNNER_K00_SUBJECT` = `phase-a` for the `.k00` process and `vpio-01` for the `.vpio01` process; read before, read after, no launch); the `.vpio01` termination touches a frozen subject (termination only, no launch/uninstall/overwrite) and needs its own words. Alternative: leave them and accept that every population precondition aborts until they exit.
3. **Read-only container reads** of `.vpio01` (`6A2E406B…`) and R1 (`0B07D423…`) `tmp/` — to learn whether the ungoverned launches wrote anything; named only.
4. **Population re-issuance** after clearance: the §18.20.3 pin is reusable with a fresh worktree token (the `s2pop` path now pre-exists → Stage 0 would STOP; next token `s2pop2`, `K00-0506-S2` label unchanged); Blocks A/B/C/Dpop unchanged; the pre-C 69 read still decides, restoration still outside unless paired by ruling.
5. Nothing else: `b198e2e37` unchanged · S3 CLOSED · KERNEL-00 acceptance CLOSED.

**Standing after §18.21:** `K00-0506-S2` act STOP in Block B (foreign harness processes: R1 `.k00` PID 2098 · frozen `.vpio01` PID 2099; cause/actor UNKNOWN) · population NOT invoked · S2 rows NONE · playback NONE · volume UNREAD by this act · `.vpio02` install intact · `b198e2e37` unchanged · C-D26 open, non-blocking · WITNESS-02/03/04 residue preserved · S2 population authority: disposition owed · S3 CLOSED · KERNEL-00 acceptance CLOSED.

---

## §18.22 — FOUNDER RULING on §18.21 (2026-09-15): STOP ACCEPTED · `tmp/` census NOT OPENED · **`S2-FOREIGN-HARNESS-DISPOSAL-01` AUTHORIZED (termination only)** · **`K00-0506-S2-02` AUTHORIZED CONDITIONALLY** on a clean disposal (`s2pop2` token; §18.20.3 otherwise unchanged) · two distinct evidentiary acts · NOT YET EXECUTED

### 18.22.1 The ruling (founder; quoted where it governs)

1. **`K00-0506-S2` STOP — ACCEPTED** as read: "STOPPED in Block B · authority SPENT · population invocation NOT begun · population rows NONE · playback NONE · pre-Block-C volume read NOT reached." Classified as "an infrastructure refusal caused by two live `VoiceKernelHarness` processes belonging to subjects other than the population subject" — PID 2098 → R1 / `.k00` / `phase-a`; PID 2099 → frozen `.vpio01`; `.vpio02` process absent, install intact. The restart/relaunch inference "remains inference only. Cause and actor remain UNKNOWN. Block B behaved correctly."
2. **Optional container `tmp/` census — NOT OPENED.** "The process capture already establishes the fact necessary for the population boundary … Determining whether those ungoverned processes wrote additional material is a separate forensic question and is not required to restore the population precondition." May be opened later under its own authority.
3. **`S2-FOREIGN-HARNESS-DISPOSAL-01` — AUTHORIZED**, termination only, "the already-exercised §10.5 C termination shape": `subject phase-a → testTerminateOnly` · `subject vpio-01 → testTerminateOnly`, `TEST_RUNNER_K00_SUBJECT` explicit for each. For `.vpio01` "this ruling authorizes termination only"; NOT authorized for either subject: test launch · sample acquisition · reinstall · container mutation · journal generation · reader invocation · stimulus · playback · volume change · configuration change.
4. **Disposal acceptance:** after the two invocations, `VoiceKernelHarness processes: 0` "using the same process-reading surface already used by Block B. If either foreign process remains, the disposal act STOPs and returns for ruling. No escalation, kill command, reinstall, retry with another mechanism, or manual process destruction is authorized."
5. **`K00-0506-S2-02` AUTHORIZED upon a clean disposal result only** — "§18.20.3 unchanged except for the fresh population worktree/path token" `/private/tmp/k0506-s2pop-b198e2e37` → `/private/tmp/k0506-s2pop2-b198e2e37` "and any corresponding fresh carrier names required solely to prevent collision with the spent act." Semantics unchanged: run label `K00-0506-S2` · N 10 · subject `vpio-02` · stimulus `s2-nearend` · `b198e2e37` unchanged · §7 reading law unchanged. The spent `s2pop` worktree is residue, "not reused or cleaned under this authority."
6. **The pre-Block-C gate remains decisive.** No restoration authority added; the governed read (69 · unmuted · Sound pane absent) decides; on failure "STOP · no restoration · no adjustment · no retry · population invocation remains unbegun." The 15:49:59Z reading is historical custody only.
7. **No inference from successful disposal** — a clean termination establishes only that the known foreign state was removed; a later Block B PASS does not explain the earlier presence.
8. **C-D26** stays OPEN · non-blocking; no repair inside either act.

"The foreign processes are a precondition defect, not a population finding. Remove the defect by the narrowest already-exercised act; then approach the same population boundary again without weakening it." Disposal and population "as two distinct evidentiary acts."

### 18.22.2 Execution pin — `S2-FOREIGN-HARNESS-DISPOSAL-01` (Mac act; §10.5 C shape twice; reads only otherwise)

Runner: the same signed `8b111709b` batch runner the §10.5 C act used (`testTerminateOnly` is byte-identical across `8b111709b` · `83a382a14` · `b198e2e37`; C-D20 touched `testOutputSample` only). If that xctestrun no longer exists on the Mac, STOP before any invocation and return — no rebuild is inside this authority. Device id `A0736AC8-…` for `devicectl`, Xcode destination `00008140-…` for `xcodebuild`, never swapped. The harness receives nothing; the runner env is the only input.

**Stage 0 — before-read (the Block-B surface; the §10.5 C matcher verbatim). Proceed only if exactly the two identified containers are listed and nothing else:**

```bash
set -u
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
OUT="/private/tmp/k00-disposal-$STAMP"
mkdir -p "$OUT"
echo "$STAMP" > "$OUT/stamp.txt"
XR=/private/tmp/k0506-driver-compile-8b111709b/ios/VoiceKernelDriver/.derived/Build/Products/DriverUITests_iphoneos26.2-arm64.xctestrun
test -f "$XR" && echo "RUNNER_PRESENT true" || { echo "STOP: the 8b111709b signed runner xctestrun is absent — no rebuild under this authority"; exit 2; }
( cd /private/tmp/k0506-driver-compile-8b111709b && git rev-parse HEAD )
xcrun devicectl device info processes --device A0736AC8-793B-516F-AC72-C076DB6CEE38 --json-output "$OUT/processes-before.json"
python3 - "$OUT/processes-before.json" <<'PY'
import json,re,sys
s=json.dumps(json.load(open(sys.argv[1])))
rows=re.findall(r'\{"executable": "file://([^"]+)", "processIdentifier": (\d+)\}', s)
hits=[(p,pid) for p,pid in rows if p.rsplit('/',1)[-1]=='VoiceKernelHarness']
print('VoiceKernelHarness processes BEFORE:', len(hits), hits)
c={p.split('/Bundle/Application/')[1].split('/')[0] for p,_ in hits}
exp={'0B07D423-97E7-4196-BC1C-C69C96F994BE','6A2E406B-D1B8-43A4-92F3-29D50333AF19'}
print('BEFORE_SET_IS_THE_TWO_IDENTIFIED', c==exp, sorted(c))
PY
```

`BEFORE_SET_IS_THE_TWO_IDENTIFIED True` is the precondition. Any other set (a third process, the `.vpio02` container, zero, or an unreadable listing) → STOP, return the before-read, no invocation.

**Stage 1 — exactly two `testTerminateOnly` invocations, one per foreign subject, in this order; each once:**

```bash
cd /private/tmp/k0506-driver-compile-8b111709b
TEST_RUNNER_K00_SUBJECT=phase-a xcodebuild test-without-building -xctestrun "$XR" -destination id=00008140-00163D9922E0801C -collect-test-diagnostics never -only-testing:DriverUITests/K00DriverTests/testTerminateOnly 2>&1 | tee "$OUT/terminate-phase-a.log"
TEST_RUNNER_K00_SUBJECT=vpio-01 xcodebuild test-without-building -xctestrun "$XR" -destination id=00008140-00163D9922E0801C -collect-test-diagnostics never -only-testing:DriverUITests/K00DriverTests/testTerminateOnly 2>&1 | tee "$OUT/terminate-vpio-01.log"
grep -hE 'Executed 1 test|TEST EXECUTE|DRIVER/INFRASTRUCTURE|PRECONDITION' "$OUT/terminate-phase-a.log" "$OUT/terminate-vpio-01.log"
```

A `harness did not terminate` failure on either → still take the after-read, then STOP and return; no second invocation of either subject.

**Stage 2 — after-read on the same surface; acceptance = 0:**

```bash
xcrun devicectl device info processes --device A0736AC8-793B-516F-AC72-C076DB6CEE38 --json-output "$OUT/processes-after.json"
python3 - "$OUT/processes-after.json" <<'PY'
import json,re,sys
s=json.dumps(json.load(open(sys.argv[1])))
rows=re.findall(r'\{"executable": "file://([^"]+)", "processIdentifier": (\d+)\}', s)
hits=[(p,pid) for p,pid in rows if p.rsplit('/',1)[-1]=='VoiceKernelHarness']
print('VoiceKernelHarness processes AFTER:', len(hits), hits)
print('DISPOSAL_ACCEPTANCE', 'PASS' if len(hits)==0 else 'STOP')
PY
```

**Stage 3 — seal and return on its own `feature/*` branch** (fresh worktree from the lane tip; the §18.18.4 dependency link is the precedented transport; nothing else committed):

```bash
{ printf 'ACT S2-FOREIGN-HARNESS-DISPOSAL-01\nSTAMP %s\nRUNNER_SOURCE 8b111709b6e5010b4b6ee7281d257141945276ff\nSUBJECTS phase-a vpio-01\nINVOCATIONS 2\nSECOND_INVOCATION_PER_SUBJECT none\nESCALATION none\nDEVICE_ACTS termination-only\n' "$STAMP"; } > "$OUT/RETURN.txt"
( cd "$OUT" && shasum -a 256 stamp.txt processes-before.json processes-after.json terminate-phase-a.log terminate-vpio-01.log RETURN.txt > SHA256SUMS.disposal && cat SHA256SUMS.disposal )
BR="feature/k00-s2-foreign-harness-disposal-$STAMP"
WT="/private/tmp/k00-disposal-carrier-$STAMP"
cd /Users/soullab/MAIA-SOVEREIGN && git fetch origin claude/voice-2026-census-01 && git worktree add -b "$BR" "$WT" origin/claude/voice-2026-census-01
cd "$WT" && test -e node_modules || ln -s /Users/soullab/MAIA-SOVEREIGN/node_modules node_modules
REL="docs/programme/VOICE-2026/driver-ledger/S2-FOREIGN-HARNESS-DISPOSAL-01-$STAMP"
mkdir -p "$REL" && cp -p "$OUT"/* "$REL"/ && ( cd "$REL" && shasum -a 256 -c SHA256SUMS.disposal )
git add "$REL" && git commit -m "witness(voice-2026): return S2-FOREIGN-HARNESS-DISPOSAL-01 evidence (termination-only, two subjects, before/after process reads)" && git push -u origin "$BR" && git log -1 --format=%H
```

Return: branch + commit SHA → §18.23 (verified here: seal, the two logs, before = the two identified containers, after = 0). **PASS = `DISPOSAL_ACCEPTANCE PASS` with both invocations `Executed 1 test, 0 failures`.** Anything else = STOP · spent · return for ruling. A PASS establishes only that the known foreign state was removed (ruling item 7).

### 18.22.3 Execution pin — `K00-0506-S2-02` (Mac act; ONLY after §18.22.2 returned `DISPOSAL_ACCEPTANCE PASS` and its evidence is committed and pushed; a separate evidentiary act, its own branch)

§18.20.3 verbatim with the `s2pop2` token: worktree `/private/tmp/k0506-s2pop2-b198e2e37`; block files `/private/tmp/s2pop2-block*.sh`; outputs `/private/tmp/s2pop2-block*.out`; pre-C files `/private/tmp/s2pop2-preC-*.txt`; the ledger label `K00-0506-S2` and the transcript name `/private/tmp/k00-0506-s2-transcript.txt` unchanged (that transcript was never created by the spent act, so no collision). Expected block hashes (derived here from `17b4df63b` + the four substitutions with the new path; `Dpop` = §18.20.3 Stage 5 text with the two path lines changed):

```text
5dd16bdd1d1aafdf40c740a615d92b1e8e54bbe4e1bebdeb1cecc623174aa276  /private/tmp/s2pop2-blockA.sh
22e105ddd7f3e7389ad86c1dc0c4359cb5ad609d50030a810692c73b2d9ac16e  /private/tmp/s2pop2-blockB.sh
77d40528fb81f403ae43c22af5db7ec3d1ba4f5e2fa9b763448e67b6533c48c0  /private/tmp/s2pop2-blockC.sh
e4f93c0beb49831438320ffd5af1f82d111b0c529392d33f5a3af0a0462b5879  /private/tmp/s2pop2-blockDpop.sh
```

**Stage 0:**

```bash
cd /Users/soullab/MAIA-SOVEREIGN
DOC=docs/programme/VOICE-2026/KERNEL-00_VPIO-02_K00-06_PARTIAL-ZERO_DISCRIMINATOR_PLAN_2026-09-15.md
git show 17b4df63b:$DOC | sed -n '599,625p' > /private/tmp/s2w1-blockA.sh
git show 17b4df63b:$DOC | sed -n '633,702p' > /private/tmp/s2w1-blockB.sh
git show 17b4df63b:$DOC | sed -n '710,713p' > /private/tmp/s2w1-blockC.sh
for b in A B C; do sed -e 's/S2-WITNESS-01 1 --act/K00-0506-S2 10 --act/' -e 's/S2-WITNESS-01/K00-0506-S2/g' -e 's/s2-witness-01/k00-0506-s2/g' -e 's#/private/tmp/k0506-s2w-b198e2e37#/private/tmp/k0506-s2pop2-b198e2e37#g' /private/tmp/s2w1-block$b.sh > /private/tmp/s2pop2-block$b.sh; done
for b in A B C; do echo "== block $b diff (only the four tokens may appear)"; diff /private/tmp/s2w1-block$b.sh /private/tmp/s2pop2-block$b.sh; done
shasum -a 256 /private/tmp/s2pop2-block[ABC].sh
test ! -e /private/tmp/k0506-s2pop2-b198e2e37 && echo "POP2_WORKTREE_PREEXISTS false" || { echo "STOP: /private/tmp/k0506-s2pop2-b198e2e37 pre-exists"; exit 2; }
```

Then write `/private/tmp/s2pop2-blockDpop.sh` as exactly the Stage 5 text below and confirm its hash. Any mismatch = STOP before Block A.

**Stages 1–4** = §18.20.3 Stages 1–4 with `s2pop` → `s2pop2` in every `/private/tmp/…` path (Blocks A · B → pre-C read → Block C → `Dpop`), §16.7 transport unchanged. The pre-C read is unchanged and decisive: `output volume:69, ` ∧ `output muted:false` ∧ pane `rc=1`, else `STOP: pre-Block-C volume read is not 69/unmuted — population NOT invoked`, no restoration, no adjustment, no retry.

**Stage 5 — `Dpop` for this act (write byte-for-byte):**

```bash
cd /private/tmp/k0506-s2pop2-b198e2e37
LD="$(ls -td docs/programme/VOICE-2026/driver-ledger/K00-0506-S2-2* | head -1)"
echo "LEDGER_DIR=$LD"
pgrep -x afplay > /private/tmp/s2pop2-afplay-after.txt && { cat /private/tmp/s2pop2-afplay-after.txt; echo "AFPLAY_PROCESSES_AFTER=nonzero"; } || echo "AFPLAY_PROCESSES_AFTER=0"
ls -la "$LD/stimulus-preflight"
cat "$LD/stimulus-preflight/stimulus.sha256" "$LD/stimulus-preflight/afplay.sha256" "$LD/stimulus-preflight/stimulus-wave-metadata.txt" "$LD/stimulus-preflight/volume.txt"
for f in "$LD"/stimulus-sample-*.tsv; do echo "== $f"; grep -E '^(sample|pid|startEpoch|preRunState|postRunState|waitExitStatus|stopEpoch|custody)' "$f"; done
grep -c "custody$(printf '\t')VALID" "$LD"/stimulus-sample-*.tsv
cat "$LD/sample-timing.tsv"
grep -E 'stimulus|STOP|ABORT|custody|ledgered|batch complete|INFRASTRUCTURE' "$LD/batch.log"
grep -c '^| AUTOMATED' "$LD/ledger.md"
ls "$LD/journals" | grep -c '\.jsonl$'
cp /private/tmp/k00-0506-s2-transcript.txt "$LD/transcript.txt"
( cd "$LD" && shasum -a 256 transcript.txt stimulus-sample-*.tsv stimulus-sample-*-afplay.log stimulus-preflight/* journals/*.jsonl ledger.md output-ledger.md batch.log sample-timing.tsv daemons/* > SHA256SUMS.population && wc -l SHA256SUMS.population && cat SHA256SUMS.population )
```

**Return** = §18.20.3's return contract on its own `feature/*` branch (`K00-0506-S2-<stamp>/` complete + `SHA256SUMS.population` · `K00-0506-S2-preflight-<stamp>/` · `s2pop2-*` outputs · pre-C files) → §18.24 here (seal · classifier · output reader · §7 reading per row; partition pins expected to move by ten, C-D24 species). A pre-C or in-batch STOP returns in the §18.21/§17 shape.

**Standing after §18.22:** `K00-0506-S2` STOP · accepted · spent · foreign harnesses `.k00` + `.vpio01` identified · **DISPOSAL-01 AUTHORIZED, pinned, NOT YET EXECUTED** · **`K00-0506-S2-02` AUTHORIZED CONDITIONALLY (after `DISPOSAL_ACCEPTANCE PASS`), pinned, NOT YET EXECUTED** · `s2pop` worktree = residue · `b198e2e37` unchanged · 69 exact, pre-C read decisive · `tmp/` census NOT OPENED · C-D26 OPEN, non-blocking · S3 CLOSED · KERNEL-00 acceptance CLOSED.

---

## §18.23 — `S2-FOREIGN-HARNESS-DISPOSAL-01` EXECUTED → STOP AT STAGE 0 (2026-09-15 · runner absent · nothing invoked)

### §18.23.1 Custody

Founder return: branch `feature/k00-s2-foreign-harness-disposal-stop-20260915T171701Z`, commit `939a00bbae531ff95b6f191f89f7fb54ea85f967` → cherry-picked here with `-x` as `1d95272b6`. Bundle `docs/programme/VOICE-2026/driver-ledger/S2-FOREIGN-HARNESS-DISPOSAL-01-STOP-20260915T171701Z/` (four files). `SHA256SUMS.disposal-stop` recomputed here: **3/3 OK**, every hash = the founder's list:

```
1b9ab1cb74571ce60e1a018ee3889f76993ca6425c5e7a3c5822e41431defa50  stamp.txt
fb08570f6e86ee83d4d40bb8347fce6034a0089ea6c81dbf1121b1e8942c4837  STOP.txt
f904d78cc9000e452d17500af362d9ba9bbe47160b517e86fe5212bab0fd7459  RETURN.txt
96812a36c9a8f69c7086b019d3a92dc65f6b330dab4b1c39408fe5071311ef18  SHA256SUMS.disposal-stop
```

`stamp.txt` = `20260915T171701Z`. `STOP.txt` verbatim:

```
ACT S2-FOREIGN-HARNESS-DISPOSAL-01
RESULT STOP before Stage 0 process read
STOP_LINE STOP: the 8b111709b signed runner xctestrun is absent — no rebuild under this authority
RUNNER_PATH /private/tmp/k0506-driver-compile-8b111709b/ios/VoiceKernelDriver/.derived/Build/Products/DriverUITests_iphoneos26.2-arm64.xctestrun
TERMINATION_INVOCATIONS 0
PROCESS_BEFORE_READ NOT_RUN
PROCESS_AFTER_READ NOT_RUN
DISPOSAL_ACCEPTANCE NOT_REACHED
POPULATION_REISSUANCE CONDITION NOT_MET
```

`RETURN.txt` verbatim: `RESULT STOP · RUNNER_PRESENT false · INVOCATIONS 0 · SECOND_INVOCATION_PER_SUBJECT none · ESCALATION none · DEVICE_ACTS none · POPULATION_ACT NOT_OPENED`.

Founder's return, verbatim: *"`S2-FOREIGN-HARNESS-DISPOSAL-01` STOPPED at Stage 0 before any process read or termination invocation. The pinned signed runner was absent … Per §18.22.2, I did not rebuild it or substitute another runner."*

### §18.23.2 Reading

1. **The §18.22.2 Stage-0 precondition fired exactly as pinned.** The pin required the `8b111709b` signed runner xctestrun to exist at the recorded path and forbade a rebuild inside the authority. It did not exist; the act stopped before reading the device. Zero `devicectl` verbs, zero `xcodebuild` invocations, zero terminations. This is the fourth fail-closed boundary on this lane to refuse on real state (batch stimulus preflight · restoration parser · pre-C read · now the disposal runner check).
2. **Why the runner is absent is UNKNOWN and is not inferred.** The path was last logged as present at the §10.7 corrective termination (2026-09-15, before-read one process, after-read zero — the act the disposal was shaped after). Nothing governed removed it; `/private/tmp` is volatile on macOS, but that is a possibility, not a finding. No census of `/private/tmp` was run and none is proposed.
3. **The foreign process state was NOT re-read by this act.** The last evidence remains the population Block-B read (`K00-0506-S2-preflight-20260915T170040Z`, PID 2098 R1 `.k00` · PID 2099 frozen `.vpio01`). Whether they still run is UNKNOWN; a future disposal act's before-read decides, and its before-set must still equal exactly the two identified containers (a different set → STOP, return).
4. **Nothing else was touched.** Volume unread (last governed read 69 at 15:49:59Z, batch preflight). `.vpio02` install, `.vpio01` frozen, K00/R1, organism `ac12dedf4`, `b198e2e37`: unchanged. No S2 row exists.
5. **Standing:** DISPOSAL-01 STOP · spent · `DISPOSAL_ACCEPTANCE NOT_REACHED` → the `K00-0506-S2-02` conditional authority (§18.22.3) is UNMET and stays unopened; the `s2pop2` pin remains valid text, unused.

### §18.23.3 Instrument fact for the next ruling (read from the repository, not from the Mac)

The disposal's only test, `testTerminateOnly`, is **byte-identical across every driver SHA the lane has used**: the function body in `ios/VoiceKernelDriver/DriverUITests/K00DriverTests.swift` hashes to `c483528b…` at `8b111709b`, `83a382a14` and `b198e2e37` (recomputed here from the git object database). The subject table it reads (`phase-a` → `life.soullab.voicekernel.k00`, `vpio-01` → `.vpio01`, `vpio-02` → `.vpio02`) is likewise unchanged since VPIO-01B. So a signed runner built from any of those three SHAs would run the same termination test against the same bundle ids; the §18.22 ruling named `8b111709b` because it was the already-exercised runner, not because the test differs.

Signed runner xctestrun paths ever logged on this lane's record (existence on the Mac today UNKNOWN for every one; the `8b111709b` path proved that a logged path is not a present file): `/private/tmp/k0506-s2w5-b198e2e37/…` (built 15:49:53Z inside WITNESS-05 Block C, the most recent) · `/private/tmp/k0506-s2w-b198e2e37/…` · `/private/tmp/k0506-batch-83a382a14/…` · `/private/tmp/k0506-vpoff-83a382a14/…` · `/private/tmp/k0506-driver-compile-83a382a14/…` (§10.9 readiness, pinned hashes xctestrun `3b6360f7…`) · older `voice-*` / `vpio-*` worktrees on earlier driver SHAs (not candidates: their subject tables predate `vpio-02`, and `vpio-01b`/`vpio02b` predate the output act — irrelevant to termination but not the exercised shape).

### §18.23.4 Returned for ruling (named, not chosen)

The narrowest already-exercised act needs a runner that exists. Three shapes, each fail-closed, none authorized here:

- **(a) Name an already-built signed runner on record.** The §18.22.2 pin is reused with only `XR` changed to the named path; Stage 0 gains a presence read of that file (absent → STOP, no rebuild, no second path tried inside the act) and records its xctestrun SHA-256 as custody. Candidate of record: `/private/tmp/k0506-s2w5-b198e2e37/ios/VoiceKernelDriver/.derived/Build/Products/DriverUITests_iphoneos26.2-arm64.xctestrun` (most recent, built by the batch's own recipe under a passed witness). Cost: nothing new is built; risk: it may also be absent, spending another authority on a read.
- **(b) Authorize a disposal-only signed runner build.** A Stage −1 in a fresh detached worktree at `b198e2e37` (`/private/tmp/k0506-disposal-b198e2e37`, path must not pre-exist): `node_modules` link → `xcodegen generate` → the batch's own signed `build-for-testing` recipe (lines 147–150: `-scheme DriverUITests -destination "id=00008140-00163D9922E0801C" -derivedDataPath "$ROOT/ios/VoiceKernelDriver/.derived" DEVELOPMENT_TEAM=ZVK2X646Z2`) → xctestrun SHA-256 recorded → then §18.22.2 Stages 0–4 unchanged with `XR` = that product. Cost: one signed build (no device verb; the build targets the destination id only for signing); it is the same build every population Block C already performs, so it widens nothing. Risk: none to the subject; the organism is not compiled by the driver project.
- **(c) Hold.** No disposal; the population boundary stays blocked by two foreign processes of unknown origin; nothing decays by waiting except that the Mac's `/private/tmp` may lose more runners.

Under any of (a)/(b): before-set must equal exactly `{0B07D423… (.k00), 6A2E406B… (.vpio01)}` else STOP; two invocations (`phase-a` then `vpio-01`), one each, no retry; after-read must be 0; `DISPOSAL_ACCEPTANCE PASS` is the only thing that meets the `K00-0506-S2-02` condition; `.vpio01` termination only. The `s2pop2` population pin (§18.22.3) is unaffected by which runner performs the disposal — it builds its own.

**Standing after §18.23:** DISPOSAL-01 STOP at Stage 0 · spent · runner absent, cause UNKNOWN · foreign process state NOT re-read · termination invocations 0 · `K00-0506-S2-02` condition UNMET · S2 population NOT invoked · `s2pop`/`s2w2`/`s2w3`/`s2w4` worktrees residue · `b198e2e37` unchanged · 69 last read 15:49:59Z · C-D26 OPEN, non-blocking · S3 CLOSED · KERNEL-00 acceptance CLOSED.

---

## §18.24 — FOUNDER RULING on §18.23 (2026-09-15): DISPOSAL-01 STOP ACCEPTED · option (a) NOT ADOPTED · `S2-FOREIGN-HARNESS-DISPOSAL-02` AUTHORIZED with a Stage −1 runner build

### §18.24.1 Ruling as captured (founder, verbatim in substance; standing block verbatim)

Choice: **(b), not (a).** *"The most recent WITNESS-05 worktree is not a good authority carrier now: during custody completion we already observed that `/private/tmp/k0506-s2w5-b198e2e37` had ceased to be a Git worktree. Naming a runner underneath that ephemeral path would make the next act depend on residue we already know is not durable. A fresh disposal-only `build-for-testing` at `b198e2e37` is cleaner. It creates the exact runner needed for the already-authorized termination behavior, without borrowing from historical residue or changing the termination semantics."*

1. **DISPOSAL-01 STOP — ACCEPTED** exactly as recorded (STOP at Stage 0 · signed runner absent · invocations 0 · device acts none · `DISPOSAL_ACCEPTANCE NOT_REACHED` · authority SPENT). The STOP establishes runner absence only; it does not establish the current state of either foreign harness process; cause of absence UNKNOWN.
2. **Existing-runner option (a) — NOT ADOPTED.** No historical runner path is searched as a fallback; a disposal authority should not depend on the accidental survival of an old `/private/tmp` build product.
3. **`S2-FOREIGN-HARNESS-DISPOSAL-02` — AUTHORIZED**: Stage −1 build the signed disposal runner only · Stage 0 before-process read · Stage 1 two termination-only invocations · Stage 2 after-process read · Stage 3 evidence return. Runner built from `b198e2e37058f2e059d986b4b148e224215f3ee3` in a fresh worktree.
4. **Stage −1 authority**: the same driver-only `build-for-testing` recipe the frozen batch uses; sole purpose = produce the xctestrun containing the already-proven `testTerminateOnly`. Authorized: fresh detached worktree at `b198e2e37` · `xcodegen` for the driver project as the recipe requires · driver-only `build-for-testing` · xctestrun resolution · runner SHA/custody capture. NOT authorized: test execution during Stage −1 · phone launch · install · reinstall · sample · stimulus · playback · volume mutation · organism modification · batch modification. *Stage −1 is runner preparation, not disposal itself.*
5. **Runner identity** proven before any termination invocation: execution HEAD = `b198e2e37` · runner exists · `testTerminateOnly` is the pinned implementation · subject table unchanged. If Stage −1 cannot produce the runner under the existing recipe → STOP · no alternate build · no historical runner fallback · no termination invocation.
6. **Disposal boundary unchanged**: the before-read must show exactly `0B07D423-97E7-4196-BC1C-C69C96F994BE` and `6A2E406B-D1B8-43A4-92F3-29D50333AF19`; anything else (zero, one, a third, `.vpio02`) → STOP before termination.
7. **Termination authority**: exactly `TEST_RUNNER_K00_SUBJECT=phase-a` → `testTerminateOnly`, then `TEST_RUNNER_K00_SUBJECT=vpio-01` → `testTerminateOnly`, once each, in that order. `.vpio01`: termination only; no launch/sampling/reinstall/mutation/other interaction.
8. **Acceptance**: the same governed process read returns `VoiceKernelHarness processes AFTER: 0` → `DISPOSAL_ACCEPTANCE PASS`. A PASS proves only that the known foreign live harness state was removed; it does not establish why the processes existed, who launched them, when, or whether either had already exited before termination.
9. **Population conditional authority**: `K00-0506-S2-02` remains conditionally authorized exactly as pinned (§18.22.3); it does not begin until DISPOSAL-02 returns `DISPOSAL_ACCEPTANCE PASS` AND that evidence is committed and pushed as its own act; then the population begins as a separate evidentiary act under the `s2pop2` contract; no restoration authority added; the pre-Block-C `69 · unmuted · pane closed` read remains decisive.

Standing (founder, verbatim):

```text
DISPOSAL-01                 STOP · accepted · spent

historical runner reuse     NOT ADOPTED

DISPOSAL-02                 AUTHORIZED
Stage -1                    fresh signed runner build
runner source               b198e2e37
termination subjects        phase-a · vpio-01
termination count           once each
after-read requirement      zero harness processes

K00-0506-S2-02              CONDITIONALLY AUTHORIZED
                            remains unopened until
                            DISPOSAL-02 PASS is
                            committed and pushed

b198e2e37                   unchanged
C-D26                       OPEN · non-blocking
S3                          CLOSED
KERNEL-00 acceptance        CLOSED
```

Governing distinction (founder): *"Rebuilding the carrier does not reopen the design. The code being exercised is frozen; only the disposable signed runner needed to exercise it is being restored."*

### §18.24.2 Execution pin — `S2-FOREIGN-HARNESS-DISPOSAL-02` (Mac act; Stage −1 build + the §18.22.2 stages with the runner path substituted; nothing else changed)

Recipe provenance: Stage −1 reproduces `scripts/witness/k00-driver-batch.sh` lines 243 and 245 at `b198e2e37` term for term (`xcodegen generate` in `ios/VoiceKernelDriver`; `xcodebuild build-for-testing -project … -scheme DriverUITests -destination "id=00008140-00163D9922E0801C" -derivedDataPath <worktree>/ios/VoiceKernelDriver/.derived DEVELOPMENT_TEAM=ZVK2X646Z2`), and resolves the xctestrun the way line 246 does. The destination id is used for signing only; no device verb runs in Stage −1. `testTerminateOnly` identity = the function body's SHA-256 recomputed from the worktree source must equal `c483528b804f3aae6113f347ffdaecad51a80f6a0d3499bd419ae474b27d888e` (§18.23.3, computed here from the git object database at `8b111709b` · `83a382a14` · `b198e2e37`). Paths must not pre-exist (a pre-existing path = STOP, never reused or cleaned). No `#` on any shell line; `zsh` is the expected shell.

**Stage −1 — build the disposal runner only (no device verb; no test executes):**

```bash
set -u
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
OUT="/private/tmp/k00-disposal02-$STAMP"
WTB="/private/tmp/k0506-disposal-b198e2e37"
test -e "$WTB" && { echo "STOP: $WTB pre-exists — never reused"; exit 2; }
mkdir -p "$OUT"
echo "$STAMP" > "$OUT/stamp.txt"
cd /Users/soullab/MAIA-SOVEREIGN && git fetch origin claude/voice-2026-census-01 && git worktree add --detach "$WTB" b198e2e37058f2e059d986b4b148e224215f3ee3
cd "$WTB" && git rev-parse HEAD | tee "$OUT/build-head.txt"
test "$(git rev-parse HEAD)" = "b198e2e37058f2e059d986b4b148e224215f3ee3" || { echo "STOP: HEAD is not b198e2e37"; exit 2; }
awk '/func testTerminateOnly/,/^    }$/' ios/VoiceKernelDriver/DriverUITests/K00DriverTests.swift | shasum -a 256 | tee "$OUT/testTerminateOnly.sha256"
grep -q 'c483528b804f3aae6113f347ffdaecad51a80f6a0d3499bd419ae474b27d888e' "$OUT/testTerminateOnly.sha256" || { echo "STOP: testTerminateOnly is not the pinned implementation"; exit 2; }
grep -nE '"phase-a": +Subject\(key: "phase-a", +bundleID: "life\.soullab\.voicekernel\.k00"|"vpio-01": +Subject\(key: "vpio-01", +bundleID: "life\.soullab\.voicekernel\.vpio01"' ios/VoiceKernelDriver/DriverUITests/K00DriverTests.swift | tee "$OUT/subject-table.txt"
test "$(wc -l < "$OUT/subject-table.txt" | tr -d ' ')" = "2" || { echo "STOP: subject table rows for phase-a / vpio-01 not found as pinned"; exit 2; }
( cd ios/VoiceKernelDriver && xcodegen generate ) > "$OUT/xcodegen.log" 2>&1 || { echo "STOP: xcodegen generate failed — no alternate build"; exit 3; }
xcodebuild build-for-testing -project "$WTB/ios/VoiceKernelDriver/VoiceKernelDriver.xcodeproj" -scheme DriverUITests -destination "id=00008140-00163D9922E0801C" -derivedDataPath "$WTB/ios/VoiceKernelDriver/.derived" DEVELOPMENT_TEAM=ZVK2X646Z2 > "$OUT/build-for-testing.log" 2>&1 || { echo "STOP: build-for-testing failed — no alternate build"; exit 3; }
grep -c 'TEST BUILD SUCCEEDED' "$OUT/build-for-testing.log"
XR="$(ls -t "$WTB"/ios/VoiceKernelDriver/.derived/Build/Products/*.xctestrun | head -1)"
test -f "$XR" && echo "RUNNER_PRESENT true $XR" | tee "$OUT/runner-path.txt" || { echo "STOP: no xctestrun produced"; exit 3; }
( cd "$(dirname "$XR")" && shasum -a 256 "$(basename "$XR")" DriverUITests-Runner.app/PlugIns/DriverUITests.xctest/DriverUITests DriverUITests-Runner.app/DriverUITests-Runner DriverHost.app/DriverHost ) | tee "$OUT/runner-custody.sha256"
git -C "$WTB" status --porcelain | tee "$OUT/worktree-footprint.txt"
```

The worktree footprint (xcodegen's regenerated project + `.derived`) is recorded, never committed. A STOP anywhere in Stage −1 ends the act: no termination invocation, no historical runner, no second build.

**Stage 0 — before-read (unchanged from §18.22.2 except `XR` is now Stage −1's product):**

```bash
test -f "$XR" || { echo "STOP: runner absent after Stage -1"; exit 2; }
xcrun devicectl device info processes --device A0736AC8-793B-516F-AC72-C076DB6CEE38 --json-output "$OUT/processes-before.json"
python3 - "$OUT/processes-before.json" <<'PY'
import json,re,sys
s=json.dumps(json.load(open(sys.argv[1])))
rows=re.findall(r'\{"executable": "file://([^"]+)", "processIdentifier": (\d+)\}', s)
hits=[(p,pid) for p,pid in rows if p.rsplit('/',1)[-1]=='VoiceKernelHarness']
print('VoiceKernelHarness processes BEFORE:', len(hits), hits)
c={p.split('/Bundle/Application/')[1].split('/')[0] for p,_ in hits}
exp={'0B07D423-97E7-4196-BC1C-C69C96F994BE','6A2E406B-D1B8-43A4-92F3-29D50333AF19'}
print('BEFORE_SET_IS_THE_TWO_IDENTIFIED', c==exp, sorted(c))
PY
```

`BEFORE_SET_IS_THE_TWO_IDENTIFIED True` is the precondition (ruling item 6). Any other set → STOP, return the before-read, no invocation.

**Stage 1 — exactly two `testTerminateOnly` invocations, `phase-a` then `vpio-01`, once each:**

```bash
cd "$WTB"
TEST_RUNNER_K00_SUBJECT=phase-a xcodebuild test-without-building -xctestrun "$XR" -destination id=00008140-00163D9922E0801C -collect-test-diagnostics never -only-testing:DriverUITests/K00DriverTests/testTerminateOnly 2>&1 | tee "$OUT/terminate-phase-a.log"
TEST_RUNNER_K00_SUBJECT=vpio-01 xcodebuild test-without-building -xctestrun "$XR" -destination id=00008140-00163D9922E0801C -collect-test-diagnostics never -only-testing:DriverUITests/K00DriverTests/testTerminateOnly 2>&1 | tee "$OUT/terminate-vpio-01.log"
grep -hE 'Executed 1 test|TEST EXECUTE|DRIVER/INFRASTRUCTURE|PRECONDITION' "$OUT/terminate-phase-a.log" "$OUT/terminate-vpio-01.log"
```

A `harness did not terminate` failure on either → still take the after-read, then STOP and return; no second invocation of either subject.

**Stage 2 — after-read; acceptance = 0:**

```bash
xcrun devicectl device info processes --device A0736AC8-793B-516F-AC72-C076DB6CEE38 --json-output "$OUT/processes-after.json"
python3 - "$OUT/processes-after.json" <<'PY'
import json,re,sys
s=json.dumps(json.load(open(sys.argv[1])))
rows=re.findall(r'\{"executable": "file://([^"]+)", "processIdentifier": (\d+)\}', s)
hits=[(p,pid) for p,pid in rows if p.rsplit('/',1)[-1]=='VoiceKernelHarness']
print('VoiceKernelHarness processes AFTER:', len(hits), hits)
print('DISPOSAL_ACCEPTANCE', 'PASS' if len(hits)==0 else 'STOP')
PY
```

**Stage 3 — seal and return on its own `feature/*` branch** (fresh carrier worktree from the lane tip; the §18.18.4 dependency link is the precedented transport; nothing else committed):

```bash
{ printf 'ACT S2-FOREIGN-HARNESS-DISPOSAL-02\nSTAMP %s\nRUNNER_SOURCE b198e2e37058f2e059d986b4b148e224215f3ee3\nRUNNER_BUILT_IN %s\nSUBJECTS phase-a vpio-01\nINVOCATIONS 2\nSECOND_INVOCATION_PER_SUBJECT none\nESCALATION none\nDEVICE_ACTS termination-only\n' "$STAMP" "$WTB"; } > "$OUT/RETURN.txt"
( cd "$OUT" && shasum -a 256 stamp.txt build-head.txt testTerminateOnly.sha256 subject-table.txt xcodegen.log build-for-testing.log runner-path.txt runner-custody.sha256 worktree-footprint.txt processes-before.json processes-after.json terminate-phase-a.log terminate-vpio-01.log RETURN.txt > SHA256SUMS.disposal && cat SHA256SUMS.disposal )
BR="feature/k00-s2-foreign-harness-disposal-02-$STAMP"
WT="/private/tmp/k00-disposal02-carrier-$STAMP"
cd /Users/soullab/MAIA-SOVEREIGN && git fetch origin claude/voice-2026-census-01 && git worktree add -b "$BR" "$WT" origin/claude/voice-2026-census-01
cd "$WT" && test -e node_modules || ln -s /Users/soullab/MAIA-SOVEREIGN/node_modules node_modules
REL="docs/programme/VOICE-2026/driver-ledger/S2-FOREIGN-HARNESS-DISPOSAL-02-$STAMP"
mkdir -p "$REL" && cp -p "$OUT"/* "$REL"/ && ( cd "$REL" && shasum -a 256 -c SHA256SUMS.disposal )
git add "$REL" && git commit -m "witness(voice-2026): return S2-FOREIGN-HARNESS-DISPOSAL-02 evidence (Stage -1 runner build at b198e2e37; termination-only, two subjects, before/after process reads)" && git push -u origin "$BR" && git log -1 --format=%H
```

A STOP before Stage 3 still returns whatever `$OUT` holds under the same carrier shape (the §18.23 STOP bundle is the precedent), with `RETURN.txt` stating the stage reached and `INVOCATIONS` as actually performed.

Return: branch + commit SHA → §18.25 (verified here: seal · `build-head.txt` = `b198e2e37…` · `testTerminateOnly.sha256` = `c483528b…` · subject-table rows 2 · `TEST BUILD SUCCEEDED` · runner custody hashes recorded · before-set = the two identified containers · both logs `Executed 1 test, 0 failures` · after = 0). **PASS = `DISPOSAL_ACCEPTANCE PASS` with both invocations `Executed 1 test, 0 failures`.** Anything else = STOP · spent · return for ruling. A PASS establishes only that the known foreign live harness state was removed (ruling item 8); only after its evidence is committed and pushed does the `K00-0506-S2-02` condition (§18.22.3, unchanged) become MET — the population is then its own act on its own branch.

**Standing after §18.24:** DISPOSAL-01 STOP · accepted · spent · option (a) NOT ADOPTED · **DISPOSAL-02 AUTHORIZED, pinned, NOT YET EXECUTED** (Stage −1 fresh signed runner at `b198e2e37` · subjects `phase-a` · `vpio-01` once each · after-read 0) · `K00-0506-S2-02` CONDITIONALLY AUTHORIZED, unopened until DISPOSAL-02 PASS is committed and pushed · `b198e2e37` unchanged · 69 exact, pre-C read decisive · C-D26 OPEN, non-blocking · S3 CLOSED · KERNEL-00 acceptance CLOSED.

---

## §18.25 — `S2-FOREIGN-HARNESS-DISPOSAL-02` EXECUTED → STOP IN STAGE −1 AT THE RUNNER-CUSTODY LINE (2026-09-15 · runner BUILT and IDENTIFIED · custody paths mis-pinned · nothing invoked) — C-D27

### §18.25.1 Custody

Founder return: branch `feature/k00-s2-foreign-harness-disposal-02-stop-20260915T173055Z`, commit `761bef73950c6b5ef76ef80191949f75e5909267` → cherry-picked here with `-x` as `60269c4ed`. Bundle `driver-ledger/S2-FOREIGN-HARNESS-DISPOSAL-02-STOP-20260915T173055Z/` (13 files). `SHA256SUMS.disposal-stop` recomputed here: **12/12 OK** (stamp · build-head · testTerminateOnly.sha256 · subject-table · xcodegen.log · build-for-testing.log · runner-path · runner-custody.sha256 · worktree-footprint · products-post-stop-listing · STOP · RETURN). `STOP.txt` verbatim:

```
S2-FOREIGN-HARNESS-DISPOSAL-02 STOP in Stage -1
BUILD_HEAD b198e2e37058f2e059d986b4b148e224215f3ee3
TEST_TERMINATE_ONLY_SHA c483528b804f3aae6113f347ffdaecad51a80f6a0d3499bd419ae474b27d888e
SUBJECT_TABLE_ROWS 2
XCODEGEN PASS
BUILD_FOR_TESTING PASS
RUNNER_PRESENT true
RUNNER_CUSTODY_HASHES INCOMPLETE
MISSING_PINNED_PATH DriverUITests-Runner.app/PlugIns/DriverUITests.xctest/DriverUITests
MISSING_PINNED_PATH DriverUITests-Runner.app/DriverUITests-Runner
MISSING_PINNED_PATH DriverHost.app/DriverHost
PROCESS_BEFORE_READ NOT_RUN
TERMINATION_INVOCATIONS 0
PROCESS_AFTER_READ NOT_RUN
DISPOSAL_ACCEPTANCE NOT_REACHED
POPULATION_ACT NOT_OPENED
```

`RETURN.txt`: `RESULT STOP · STAGE_REACHED Stage -1 runner custody · RUNNER_SOURCE b198e2e37… · BUILD_FOR_TESTING PASS · RUNNER_PRESENT true · RUNNER_CUSTODY COMPLETE false · INVOCATIONS 0 · DEVICE_ACTS none · POPULATION_ACT NOT_OPENED`.

### §18.25.2 What Stage −1 established (verified here from the files)

- `build-head.txt` = `b198e2e37058f2e059d986b4b148e224215f3ee3` (exact).
- `testTerminateOnly.sha256` = `c483528b…` = the §18.23.3 value recomputed from the git object database — the pinned implementation.
- `subject-table.txt` = exactly the two rows (`phase-a` → `.k00` · `vpio-01` → `.vpio01`).
- `xcodegen.log` PASS · `build-for-testing.log` `** TEST BUILD SUCCEEDED **` ×1, no `devicectl` / `test-without-building` verb in the log (the only `xctest` matches are build paths).
- `runner-path.txt`: `RUNNER_PRESENT true /private/tmp/k0506-disposal-b198e2e37/ios/VoiceKernelDriver/.derived/Build/Products/DriverUITests_iphoneos26.2-arm64.xctestrun`.
- `runner-custody.sha256`: the xctestrun hashed `3b6360f76e2ec96f0917bcac180dea439c7bddfcafa2c592317b953cfd08d1fc`. **Observation, not inference:** this equals the §10.9 readiness signed-runner xctestrun hash recorded from the `83a382a14` worktree (`3b6360f7…`) — two builds in different worktrees produced byte-identical xctestrun text; consistent with the file's `__TESTROOT__`-relative content, recorded as observed.
- `worktree-footprint.txt` empty (the generated project and `.derived` are gitignored; nothing tracked moved).
- `products-post-stop-listing.txt` (founder-added, read-only): the xctestrun sits in `Build/Products/`; **every bundle sits one level deeper in `Build/Products/Debug-iphoneos/`** — `DriverHost.app/DriverHost` · `DriverUITests-Runner.app/DriverUITests-Runner` · `DriverUITests-Runner.app/PlugIns/DriverUITests.xctest` all present there; the build log names the test binary at `…/Debug-iphoneos/DriverUITests-Runner.app/PlugIns/DriverUITests.xctest/DriverUITests`.

**The runner was built, signed, and identified. The device was never touched.**

### §18.25.3 C-D27 — this session's pin defect (the boundary was right; the pin was wrong)

The §18.24.2 custody line ran `cd "$(dirname "$XR")"` (= `Build/Products`) and named the three bundle binaries relative to that directory, **omitting the `Debug-iphoneos/` configuration-platform level**. The correct line already existed in the repository and had already run on the Mac twice — §10.6 (`8b111709b`) and §10.9 (`83a382a14`):

```
shasum -a 256 *.xctestrun Debug-iphoneos/DriverUITests-Runner.app/PlugIns/DriverUITests.xctest/DriverUITests Debug-iphoneos/DriverUITests-Runner.app/DriverUITests-Runner Debug-iphoneos/DriverHost.app/DriverHost
```

I wrote a fresh line instead of reusing the precedent. The founder executed exactly as pinned and stopped exactly where §18.24 item 5 says to stop (*any Stage −1 failure → STOP, no adaptation*); adapting the paths inside the act would have been the wrong move, and it was not made. Classification: **instruction defect of this session (C-D27), same species as C-D3/C-D25** — a pinned line that had never run anywhere. Nothing about the Mac, the toolchain, the recipe, or the design is implicated: the recipe produced the runner; the custody sentence could not see it.

Consequence under §18.24: **DISPOSAL-02 STOP · spent.** Termination invocations 0 · foreign process state NOT re-read (last evidence still the population Block-B read) · volume unread · `.vpio02`/`.vpio01`/K00/R1/organism/`b198e2e37` untouched · `K00-0506-S2-02` condition UNMET.

Founder's observation, kept: *"the executable was successfully rebuilt; the act stopped on custody path assumptions before reaching the problem it was created to solve."*

### §18.25.4 Returned for ruling (named, not chosen)

The runner now exists at `/private/tmp/k0506-disposal-b198e2e37/…` with its xctestrun hash committed (`3b6360f7…`) and its build HEAD committed. Two shapes for a DISPOSAL-03, both with the C-D27 line corrected to the precedent; neither authorized here:

- **(α) Reuse the DISPOSAL-02 runner.** Stage −1′ = read-only: the worktree HEAD re-read must be `b198e2e37…`; the xctestrun must exist and re-hash to exactly `3b6360f7…`; the four-file precedent custody line (with `Debug-iphoneos/`) must succeed; any mismatch → STOP, no rebuild inside. Then §18.22.2 Stages 0–3 unchanged. Cost: no build. Tension with §18.24 item 2: this is a `/private/tmp` product, but one whose identity is committed and which is minutes old, not a historical residue; the founder decides whether the item-2 reasoning applies to it.
- **(β) Fresh Stage −1 in a new path** (`/private/tmp/k0506-disposal03-b198e2e37`, must not pre-exist), the §18.24.2 Stage −1 block verbatim except the corrected custody line; then Stages 0–3 unchanged. Cost: one more signed build; borrows nothing.

Corrected custody line for either shape (the only substitution against §18.24.2; the precedent's shape, run from the products directory):

```bash
( cd "$(dirname "$XR")" && shasum -a 256 "$(basename "$XR")" Debug-iphoneos/DriverUITests-Runner.app/PlugIns/DriverUITests.xctest/DriverUITests Debug-iphoneos/DriverUITests-Runner.app/DriverUITests-Runner Debug-iphoneos/DriverHost.app/DriverHost ) | tee "$OUT/runner-custody.sha256"
test "$(wc -l < "$OUT/runner-custody.sha256" | tr -d ' ')" = "4" || { echo "STOP: runner custody incomplete"; exit 3; }
```

Under either shape: before-set exactly `{0B07D423…, 6A2E406B…}` else STOP · `phase-a` then `vpio-01`, once each · after-read 0 · `DISPOSAL_ACCEPTANCE PASS` alone meets the `K00-0506-S2-02` condition once committed and pushed · `.vpio01` termination only · `s2pop2` pin (§18.22.3) unaffected. The `k0506-disposal-b198e2e37` worktree is residue under (β) and the carrier under (α); under neither is it removed.

**Standing after §18.25:** DISPOSAL-01 STOP · spent · DISPOSAL-02 STOP in Stage −1 · spent · runner BUILT + IDENTIFIED (xctestrun `3b6360f7…`) · **C-D27 = this session's pin defect** (custody line omitted `Debug-iphoneos/`; precedent existed at §10.6/§10.9) · termination invocations 0 · foreign process state NOT re-read · `K00-0506-S2-02` condition UNMET · DISPOSAL-03 shapes (α)/(β) returned, NOT authorized · `b198e2e37` unchanged · 69 last read 15:49:59Z · C-D26 OPEN · S3 CLOSED · KERNEL-00 acceptance CLOSED.

---

## §18.26 — FOUNDER RULING on §18.25 (2026-09-15): DISPOSAL-02 STOP ACCEPTED · C-D27 ACCEPTED · option (α) ADOPTED → `S2-FOREIGN-HARNESS-DISPOSAL-03` AUTHORIZED on the just-built runner, read-only requalification first

### §18.26.1 Ruling as captured (founder; standing block verbatim)

Choice **(α)**: *"This is materially different from the earlier historical-runner reuse I rejected. That earlier candidate depended on stale `/private/tmp` residue whose worktree had already disappeared. Here, DISPOSAL-02 has just produced a runner whose build HEAD, source identity, subject table, xctestrun hash, and successful signed build are already in committed custody. The STOP happened after those facts were established and only because the custody paths in the pin were wrong. Rebuilding the same runner again would add cost without adding evidence."*

1. **DISPOSAL-02 STOP — ACCEPTED** exactly as recorded (Stage −1 build PASS · runner source identity PASS · subject-table identity PASS · signed `build-for-testing` PASS · xctestrun produced PASS · runner-custody path check STOP · device acts NONE · termination invocations 0 · authority SPENT). The STOP arose from C-D27; it is not evidence of a Mac, runner, disposal-design or phone-state failure.
2. **C-D27 — ACCEPTED** as a pin defect: §18.24.2 named the companion binaries relative to `Build/Products/` when the actual and precedented signed-product layout is `Build/Products/Debug-iphoneos/`; the corrected line already existed in §10.6/§10.9 and had run on the Mac. No design change arises.
3. **Option (α) — ADOPTED. `S2-FOREIGN-HARNESS-DISPOSAL-03` AUTHORIZED** using the runner built by DISPOSAL-02 at `/private/tmp/k0506-disposal-b198e2e37`. **No fresh build authorized.** Reuse is allowed because the spent act already established and committed HEAD `b198e2e37…` · `testTerminateOnly` `c483528b…` · subject rows `phase-a` + `vpio-01` · `TEST BUILD SUCCEEDED` · xctestrun SHA `3b6360f7…`; *the runner is not being trusted because it happens to exist in `/private/tmp`; it is being reused because its identity has already been established by the spent act and will be re-established before use.*
4. **Stage −1′ — read-only runner requalification**, before any phone/process read or termination: worktree still present · HEAD = `b198e2e37…` · xctestrun still present · xctestrun SHA-256 = `3b6360f7…` · the corrected four-file custody line succeeds (`Build/Products/Debug-iphoneos/` layout exactly as pinned in §18.25.4) · exactly four custody hashes produced. NOT authorized: rebuild · `xcodegen` · `build-for-testing` · alternate runner search · historical runner fallback · file repair · product regeneration. Any mismatch or missing product → STOP · no rebuild · no second path · no termination invocation.
5. **Disposal boundary unchanged**: before-read exactly `0B07D423-97E7-4196-BC1C-C69C96F994BE` and `6A2E406B-D1B8-43A4-92F3-29D50333AF19`, no other `VoiceKernelHarness`; anything else → STOP before termination.
6. **Termination authority unchanged**: `phase-a` → `testTerminateOnly`, then `vpio-01` → `testTerminateOnly`, once each, in order; `.vpio01` termination only.
7. **Acceptance unchanged**: after-read `VoiceKernelHarness processes AFTER: 0` → `DISPOSAL_ACCEPTANCE PASS`; proves only that the known foreign live state is absent after the act — not cause, actor, launch time, or whether either process had already exited before its termination call.
8. **Population condition**: `K00-0506-S2-02` conditionally authorized, unopened; condition met only when DISPOSAL-03 = PASS AND evidence committed AND pushed; then the population begins as its own act under the `s2pop2` pin; no restoration authority added.

```text
DISPOSAL-02                 STOP · accepted · spent
C-D27                       ACCEPTED · pin defect

DISPOSAL-03                 AUTHORIZED
runner strategy             reuse just-built runner
Stage −1′                   read-only identity/custody requalification
fresh build                 NOT AUTHORIZED
runner SHA                  must remain 3b6360f7…
termination subjects        phase-a · vpio-01
termination count           once each
after-read                  zero harness processes

K00-0506-S2-02              CONDITIONALLY AUTHORIZED
                            unopened until
                            DISPOSAL-03 PASS
                            is committed and pushed

b198e2e37                   unchanged
C-D26                       OPEN · non-blocking
S3                          CLOSED
KERNEL-00 acceptance        CLOSED
```

Governing distinction (founder): *"Do not rebuild what the previous act already built and proved. Re-read its identity, correct the custody path, and continue only if the carrier is still exactly the runner already placed in custody."* And: β is strongly resisted unless α fails its identity re-read — *the next act should consume evidence already earned, not pay again for the same build.*

### §18.26.2 Execution pin — `S2-FOREIGN-HARNESS-DISPOSAL-03` (Mac act; Stage −1′ read-only, then §18.22.2 Stages 0–3 with only the act name, the carrier and the C-D27-corrected custody line changed)

Carrier = the DISPOSAL-02 worktree `/private/tmp/k0506-disposal-b198e2e37` and its product `ios/VoiceKernelDriver/.derived/Build/Products/DriverUITests_iphoneos26.2-arm64.xctestrun`, both named explicitly (no `ls -t`, no search). Every Stage −1′ line is a read; the only writes are into `$OUT`. No `#` on any shell line; `zsh` expected.

**Stage −1′ — read-only requalification (any failing line = STOP; nothing after it runs):**

```bash
set -u
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
OUT="/private/tmp/k00-disposal03-$STAMP"
WTB="/private/tmp/k0506-disposal-b198e2e37"
XR="$WTB/ios/VoiceKernelDriver/.derived/Build/Products/DriverUITests_iphoneos26.2-arm64.xctestrun"
mkdir -p "$OUT"
echo "$STAMP" > "$OUT/stamp.txt"
test -d "$WTB/.git" -o -f "$WTB/.git" && echo "WORKTREE_PRESENT true" | tee "$OUT/requal.txt" || { echo "STOP: carrier worktree absent — no rebuild under this authority"; exit 2; }
git -C "$WTB" rev-parse HEAD | tee -a "$OUT/requal.txt"
test "$(git -C "$WTB" rev-parse HEAD)" = "b198e2e37058f2e059d986b4b148e224215f3ee3" || { echo "STOP: carrier HEAD is not b198e2e37"; exit 2; }
git -C "$WTB" diff --quiet -- ios/VoiceKernelDriver/DriverUITests/K00DriverTests.swift && echo "DRIVER_SOURCE_UNMODIFIED true" | tee -a "$OUT/requal.txt" || { echo "STOP: driver source modified in the carrier"; exit 2; }
test -f "$XR" && echo "RUNNER_PRESENT true $XR" | tee -a "$OUT/requal.txt" || { echo "STOP: xctestrun absent — no rebuild under this authority"; exit 2; }
shasum -a 256 "$XR" | tee "$OUT/xctestrun.sha256"
grep -q '^3b6360f76e2ec96f0917bcac180dea439c7bddfcafa2c592317b953cfd08d1fc ' "$OUT/xctestrun.sha256" || { echo "STOP: xctestrun hash is not the DISPOSAL-02 custody value"; exit 2; }
( cd "$(dirname "$XR")" && shasum -a 256 "$(basename "$XR")" Debug-iphoneos/DriverUITests-Runner.app/PlugIns/DriverUITests.xctest/DriverUITests Debug-iphoneos/DriverUITests-Runner.app/DriverUITests-Runner Debug-iphoneos/DriverHost.app/DriverHost ) | tee "$OUT/runner-custody.sha256"
test "$(wc -l < "$OUT/runner-custody.sha256" | tr -d ' ')" = "4" || { echo "STOP: runner custody incomplete"; exit 3; }
echo "REQUALIFICATION PASS" | tee -a "$OUT/requal.txt"
```

**Stage 0 — before-read (§18.22.2 verbatim; the §10.5 C matcher):**

```bash
xcrun devicectl device info processes --device A0736AC8-793B-516F-AC72-C076DB6CEE38 --json-output "$OUT/processes-before.json"
python3 - "$OUT/processes-before.json" <<'PY'
import json,re,sys
s=json.dumps(json.load(open(sys.argv[1])))
rows=re.findall(r'\{"executable": "file://([^"]+)", "processIdentifier": (\d+)\}', s)
hits=[(p,pid) for p,pid in rows if p.rsplit('/',1)[-1]=='VoiceKernelHarness']
print('VoiceKernelHarness processes BEFORE:', len(hits), hits)
c={p.split('/Bundle/Application/')[1].split('/')[0] for p,_ in hits}
exp={'0B07D423-97E7-4196-BC1C-C69C96F994BE','6A2E406B-D1B8-43A4-92F3-29D50333AF19'}
print('BEFORE_SET_IS_THE_TWO_IDENTIFIED', c==exp, sorted(c))
PY
```

`BEFORE_SET_IS_THE_TWO_IDENTIFIED True` is the precondition (ruling item 5). Any other set → STOP, return the before-read, no invocation.

**Stage 1 — exactly two `testTerminateOnly` invocations, `phase-a` then `vpio-01`, once each:**

```bash
cd "$WTB"
TEST_RUNNER_K00_SUBJECT=phase-a xcodebuild test-without-building -xctestrun "$XR" -destination id=00008140-00163D9922E0801C -collect-test-diagnostics never -only-testing:DriverUITests/K00DriverTests/testTerminateOnly 2>&1 | tee "$OUT/terminate-phase-a.log"
TEST_RUNNER_K00_SUBJECT=vpio-01 xcodebuild test-without-building -xctestrun "$XR" -destination id=00008140-00163D9922E0801C -collect-test-diagnostics never -only-testing:DriverUITests/K00DriverTests/testTerminateOnly 2>&1 | tee "$OUT/terminate-vpio-01.log"
grep -hE 'Executed 1 test|TEST EXECUTE|DRIVER/INFRASTRUCTURE|PRECONDITION' "$OUT/terminate-phase-a.log" "$OUT/terminate-vpio-01.log"
```

A `harness did not terminate` failure on either → still take the after-read, then STOP and return; no second invocation of either subject.

**Stage 2 — after-read; acceptance = 0:**

```bash
xcrun devicectl device info processes --device A0736AC8-793B-516F-AC72-C076DB6CEE38 --json-output "$OUT/processes-after.json"
python3 - "$OUT/processes-after.json" <<'PY'
import json,re,sys
s=json.dumps(json.load(open(sys.argv[1])))
rows=re.findall(r'\{"executable": "file://([^"]+)", "processIdentifier": (\d+)\}', s)
hits=[(p,pid) for p,pid in rows if p.rsplit('/',1)[-1]=='VoiceKernelHarness']
print('VoiceKernelHarness processes AFTER:', len(hits), hits)
print('DISPOSAL_ACCEPTANCE', 'PASS' if len(hits)==0 else 'STOP')
PY
```

**Stage 3 — seal and return on its own `feature/*` branch** (fresh carrier worktree from the lane tip; §18.18.4 dependency link; nothing else committed):

```bash
{ printf 'ACT S2-FOREIGN-HARNESS-DISPOSAL-03\nSTAMP %s\nRUNNER_SOURCE b198e2e37058f2e059d986b4b148e224215f3ee3\nRUNNER_CARRIER %s\nRUNNER_BUILT_BY S2-FOREIGN-HARNESS-DISPOSAL-02-STOP-20260915T173055Z\nRUNNER_XCTESTRUN_SHA 3b6360f76e2ec96f0917bcac180dea439c7bddfcafa2c592317b953cfd08d1fc\nFRESH_BUILD none\nSUBJECTS phase-a vpio-01\nINVOCATIONS 2\nSECOND_INVOCATION_PER_SUBJECT none\nESCALATION none\nDEVICE_ACTS termination-only\n' "$STAMP" "$WTB"; } > "$OUT/RETURN.txt"
( cd "$OUT" && shasum -a 256 stamp.txt requal.txt xctestrun.sha256 runner-custody.sha256 processes-before.json processes-after.json terminate-phase-a.log terminate-vpio-01.log RETURN.txt > SHA256SUMS.disposal && cat SHA256SUMS.disposal )
BR="feature/k00-s2-foreign-harness-disposal-03-$STAMP"
WT="/private/tmp/k00-disposal03-carrier-$STAMP"
cd /Users/soullab/MAIA-SOVEREIGN && git fetch origin claude/voice-2026-census-01 && git worktree add -b "$BR" "$WT" origin/claude/voice-2026-census-01
cd "$WT" && test -e node_modules || ln -s /Users/soullab/MAIA-SOVEREIGN/node_modules node_modules
REL="docs/programme/VOICE-2026/driver-ledger/S2-FOREIGN-HARNESS-DISPOSAL-03-$STAMP"
mkdir -p "$REL" && cp -p "$OUT"/* "$REL"/ && ( cd "$REL" && shasum -a 256 -c SHA256SUMS.disposal )
git add "$REL" && git commit -m "witness(voice-2026): return S2-FOREIGN-HARNESS-DISPOSAL-03 evidence (runner requalified read-only from DISPOSAL-02 custody; termination-only, two subjects, before/after process reads)" && git push -u origin "$BR" && git log -1 --format=%H
```

A STOP at any stage returns whatever `$OUT` holds under the same carrier shape, `RETURN.txt` naming the stage reached and `INVOCATIONS` as actually performed (the §18.23/§18.25 STOP bundles are the precedent).

Return: branch + commit SHA → §18.27 (verified here: seal · `requal.txt` = worktree present · HEAD exact · driver source unmodified · runner present · `REQUALIFICATION PASS` · `xctestrun.sha256` = `3b6360f7…` · four custody lines · before-set = the two containers · both logs `Executed 1 test, 0 failures` · after = 0). **PASS = `DISPOSAL_ACCEPTANCE PASS` with both invocations `Executed 1 test, 0 failures`.** Anything else = STOP · spent · return for ruling. A PASS establishes only that the known foreign live state was removed (ruling item 7); only after its evidence is committed and pushed is the `K00-0506-S2-02` condition (§18.22.3, unchanged) MET.

**Standing after §18.26:** DISPOSAL-01 STOP · spent · DISPOSAL-02 STOP · accepted · spent · C-D27 ACCEPTED · **DISPOSAL-03 AUTHORIZED, pinned, NOT YET EXECUTED** (reuse the just-built runner · read-only Stage −1′ · fresh build NOT authorized · runner SHA must remain `3b6360f7…` · `phase-a` · `vpio-01` once each · after-read 0) · `K00-0506-S2-02` CONDITIONALLY AUTHORIZED, unopened until DISPOSAL-03 PASS is committed and pushed · `b198e2e37` unchanged · 69 last read 15:49:59Z · C-D26 OPEN · S3 CLOSED · KERNEL-00 acceptance CLOSED.

---

## §18.27 — `S2-FOREIGN-HARNESS-DISPOSAL-03` STOPPED IN STAGE −1′ BY THE REMOTE EXECUTION TRANSPORT (2026-09-15 · no hash · no evidence carrier · nothing invoked) — spent-vs-unspent RETURNED

### §18.27.1 Founder report (verbatim in substance; no evidence bundle exists)

Stage −1′ ran through its first four read-only lines and established, founder-attested only (no file reached custody):

```
STAMP                      20260915T174632Z
WORKTREE_PRESENT           true
HEAD                        b198e2e37058f2e059d986b4b148e224215f3ee3
DRIVER_SOURCE_UNMODIFIED    true
XCTESTRUN_PRESENT           true
```

The next pinned line — the xctestrun SHA-256, then the corrected four-file custody line — was **refused by the remote execution safety layer**. The founder did not substitute another hashing mechanism, did not infer the hash from the DISPOSAL-02 custody, and did not proceed on file existence alone. The safety layer then also refused creation of the local STOP evidence directory, so **no evidence branch, no commit and no bundle exist for this attempt**; the founder did not route around that refusal either.

```
xctestrun re-hash          NOT COMPLETED
four custody hashes        NOT COMPLETED
REQUALIFICATION PASS       NOT REACHED
process before-read        NOT RUN
phase-a termination        NOT RUN
vpio-01 termination        NOT RUN
process after-read         NOT RUN
DISPOSAL_ACCEPTANCE        NOT REACHED
K00-0506-S2-02             NOT OPENED
phone touched              NO
device acts                NONE
```

Founder's classification, adopted here: *an execution-transport STOP, not a runner mismatch and not a disposal-design result.* The runner's known identity remains exactly what §18.25 committed (xctestrun `3b6360f7…`, HEAD, source SHA, subject rows); this attempt neither confirmed nor contradicted it. Founder's default: *treat DISPOSAL-03 as STOP · spent unless you explicitly rule that a platform refusal before the pinned hash operation does not constitute execution of the act.*

### §18.27.2 Reading

1. **Nothing in the disposal's substance was reached.** The four lines that ran are reads of the Mac's filesystem and git state; the first line that touches the runner's identity (the hash) never executed. No device verb, no `xcodebuild`, no termination.
2. **The refusal is of the transport, not of the pin.** `shasum -a 256` on a `/private/tmp` path and `mkdir -p` under `/private/tmp` are the same operations every prior act on this lane has run; the refusing layer is the remote-command channel through which the founder was executing, not the Mac. This is the third transport refusal on record: §18.16.5 (the remote safety layer refused post-execution packaging writes; the act itself had already completed), §18.6 (RESTORE-01's first attempt `132000Z` blocked at the hand boundary, kept as custody, then a fresh stamp under the same authority), and §18.10 (WITNESS-02 LAPSED UNSPENT: nothing executed, nothing witnessed, pin text stayed valid).
3. **No custody exists for the four attested lines.** They are recorded here as the founder's report, never as verified fields; a future Stage −1′ re-reads all of them from zero.
4. **C-D27 is not implicated**: the corrected custody line was never reached, so it remains unexercised; the §18.26.2 block text stands unchanged.
5. **The carrier is unchanged as far as anything read**: worktree present, HEAD exact, driver source unmodified, xctestrun present — consistent with §18.25, not a requalification.

### §18.27.3 Returned for ruling (the founder's question, with the two shapes on record; nothing chosen)

- **(i) STOP · spent** (the founder's stated default under the pin's fail-closed rule). Then DISPOSAL-04 = §18.26.2 verbatim with the act name/branch/dir tokens `03 → 04`, executed from a transport that can run `shasum` and `mkdir` on the Mac (a hand at the Mac Studio, as §18.16/§18.19 used for packaging). Cost: one more authority; nothing else changes.
- **(ii) NOT EXECUTED · authority intact** (the §18.10 / §18.6-first-attempt shape): the act never reached its first substantive operation and produced no evidence; the §18.26.2 pin stays live text and is run once, from a working transport, under the same DISPOSAL-03 name with a fresh stamp. Cost: none; the distinction it relies on — *a platform refusal before the pinned operation is not an execution of the act* — is the founder's to make, not this session's.

Under either shape: no fresh build (§18.26 item 4 unchanged), runner SHA must still read `3b6360f7…`, before-set exactly the two containers, `phase-a` then `vpio-01` once each, after-read 0; the `K00-0506-S2-02` condition stays unmet until a committed and pushed PASS.

**Standing after §18.27:** DISPOSAL-01 STOP · spent · DISPOSAL-02 STOP · spent · C-D27 accepted · **DISPOSAL-03 STOPPED BY TRANSPORT in Stage −1′** (four read-only lines founder-attested, no hash, no bundle, no device act, invocations 0) · **spent vs not-executed RETURNED** · runner identity = §18.25 custody, not requalified · `K00-0506-S2-02` condition UNMET · `b198e2e37` unchanged · 69 last read 15:49:59Z · C-D26 OPEN · S3 CLOSED · KERNEL-00 acceptance CLOSED.

---

## §18.28 — FOUNDER RULING on §18.27 (2026-09-15): `S2-FOREIGN-HARNESS-DISPOSAL-03` = NOT EXECUTED · AUTHORITY INTACT · §18.26.2 pin unchanged · restarts from Stage −1′ line one on a Mac-side transport

### §18.28.1 Ruling as captured (founder; standing block verbatim)

Choice **(ii)**: *"Nothing inside the governed act actually happened: no hash completed, no custody line completed, no process read, no termination, no evidence carrier. The remote-command channel refused the operation before the act crossed its first substantive evidentiary boundary. Calling that a spent act would make a transport layer capable of consuming constitutional authority merely by refusing to carry it."*

1. **Classification:** DISPOSAL-03 = **NOT EXECUTED · authority INTACT.** The transport refused the pinned hash before the first substantive requalification result; no governed evidence carrier, no device act, no termination; no runner identity requalified or contradicted.
2. **Why not a spent STOP:** *transport refusing to carry an authorized operation* ≠ *the authorized operation executing and returning STOP*; only the latter spends the authority. The four founder-attested observations (worktree present · HEAD exact · driver source unmodified · xctestrun present) **do not become the starting state of the resumed act** — no custody bundle exists, so DISPOSAL-03 begins again from Stage −1′ line one; nothing from the refused attempt is inherited as evidence.
3. **Precedent:** §18.6 (an attempt blocked before the hand boundary did not substitute for the governed act that later ran under the authority) · §18.10 (WITNESS-02 lapsed without becoming an executed STOP) · §18.16.5 (a platform refusal affecting evidence transport distinguished from the act itself). Principle: *a carrier may fail without converting an unperformed governed operation into a performed one; authority is spent by the act or by a ruled STOP inside the act, not by a transport refusing to carry the act.*
4. **DISPOSAL-03 remains authorized.** §18.26.2 unchanged · no `03 → 04` rename · no stamp inherited · fresh stamp · Stage −1′ from the beginning, every check repeated (carrier worktree present · HEAD = `b198e2e37…` · driver source unmodified · xctestrun present · xctestrun SHA = `3b6360f7…` · corrected four-file custody line succeeds · exactly four custody lines); only after all of those may Stage 0 touch the phone.
5. **Transport boundary:** the remote-command channel that refused the `shasum`/evidence operations is **INELIGIBLE** for the resumed act; do not test it again inside this authority; execute through a Mac-side transport already capable of carrying the pinned shell operations without selectively refusing them — the Mac Studio terminal directly is an appropriate carrier. A transport choice only; the pinned act is unaltered.
6. **Disposal boundary unchanged:** before-set exactly `0B07D423-97E7-4196-BC1C-C69C96F994BE` + `6A2E406B-D1B8-43A4-92F3-29D50333AF19`, no other harness process → `phase-a` then `vpio-01` `testTerminateOnly` once each → after-read `VoiceKernelHarness processes AFTER: 0` → `DISPOSAL_ACCEPTANCE PASS`; anything else = a genuine governed STOP that spends DISPOSAL-03.
7. **Population condition unchanged:** `K00-0506-S2-02` conditionally authorized, unopened until DISPOSAL-03 PASS + evidence committed + pushed; then the `s2pop2` population act begins separately.

```text
DISPOSAL-01             STOP · spent
DISPOSAL-02             STOP · spent
C-D27                   ACCEPTED

DISPOSAL-03             NOT EXECUTED
                        authority INTACT
                        pin unchanged
                        fresh stamp required
                        Stage −1′ restarts from line one

remote refusing channel INELIGIBLE for resumed act
fresh build             NOT AUTHORIZED
runner source           b198e2e37
runner SHA              must read 3b6360f7…

K00-0506-S2-02          CONDITIONALLY AUTHORIZED
                        still unopened

b198e2e37               unchanged
C-D26                   OPEN · non-blocking
S3                      CLOSED
KERNEL-00 acceptance    CLOSED
```

Governing distinction (founder): *"A refusal by the transport is not a refusal by the governed instrument. Do not spend authority on an operation the instrument never performed."* Operational rule made explicit: *do not send DISPOSAL-03 back through the remote channel that just proved unable to carry the pin.*

### §18.28.2 Execution note (no new pin)

The act of record is **§18.26.2 verbatim** — every Stage −1′ line, Stages 0–3, the seal list, the branch/dir names `S2-FOREIGN-HARNESS-DISPOSAL-03-<stamp>` and `feature/k00-s2-foreign-harness-disposal-03-<stamp>`, and the `RETURN.txt` fields — run once from the top with the stamp the block itself mints. The only thing this ruling adds is where it runs: at the Mac Studio, in a shell that has already carried `shasum -a 256` and `mkdir -p` on this lane, never through the remote-command channel of §18.27. §18.27's four attested lines are not a checkpoint; if any of them reads differently on the resumed run, the resumed run's reading governs and its STOP line applies. Return → §18.29 (verified here: seal · `requal.txt` lines · `REQUALIFICATION PASS` · xctestrun hash = `3b6360f7…` · four custody lines · before-set = the two containers · both logs `Executed 1 test, 0 failures` · after = 0).

**Standing after §18.28:** DISPOSAL-01 STOP · spent · DISPOSAL-02 STOP · spent · C-D27 ACCEPTED · **DISPOSAL-03 NOT EXECUTED · authority INTACT · §18.26.2 pin unchanged · fresh stamp · Stage −1′ from line one · Mac-side transport only** · fresh build NOT AUTHORIZED · runner SHA `3b6360f7…` · `K00-0506-S2-02` CONDITIONALLY AUTHORIZED, unopened · `b198e2e37` unchanged · 69 last read 15:49:59Z · C-D26 OPEN · S3 CLOSED · KERNEL-00 acceptance CLOSED.

### §18.28.3 Execution note — Mac terminal attempt `20260915T175743Z`: paste slip, nothing ran, not an execution (founder transcript, 2026-09-15)

At the Mac Studio terminal the founder fetched `462ba5951`, displayed §18.26.2 from the committed object, then pasted the five Stage −1′ assignment lines (`set -u` · `STAMP` · `OUT` · `WTB` · `XR`) and, next, **only the final line** `echo "REQUALIFICATION PASS" | tee -a "$OUT/requal.txt"`. The shell answered `tee: /private/tmp/k00-disposal03-20260915T175743Z/requal.txt: No such file or directory` and echoed `REQUALIFICATION PASS` to the terminal. Reading: `mkdir -p "$OUT"` never ran (the directory does not exist), and none of the printing lines between — `WORKTREE_PRESENT`, `git rev-parse HEAD`, `DRIVER_SOURCE_UNMODIFIED`, `RUNNER_PRESENT`, the xctestrun `shasum`, the four-file custody `shasum` — produced output, so none of them executed. **The printed `REQUALIFICATION PASS` is a terminal echo from the last line alone; it was written to no file and it is not a requalification.** No hash, no custody line, no device verb, no termination. Stamp `20260915T175743Z` has no `$OUT` directory and nothing to seal; it is not inherited. Classification under §18.28: not an execution of the instrument (no governed line ran; no STOP line fired) — an operator paste slip on an eligible transport, recorded so the echoed line can never be read as a pass. Resumption = §18.26.2 verbatim from `set -u` through the final echo **as one contiguous paste**, minting its own stamp; a Mac-side transport remains the only eligible carrier. C-D28 candidate (instruction shape only, not yet ruled): the pin's final echo can print `REQUALIFICATION PASS` when reached out of sequence; a future pin could gate that echo on `test -s "$OUT/runner-custody.sha256"` — NOT applied here; the pin stands unchanged under §18.28 item 4.

### §18.28.4 Founder ruling after §18.28.3 (2026-09-15): paste slip ACCEPTED as NOT EXECUTED · genuine-STOP boundary stated · carrier/residue classification temporal · C-D28 ACCEPTED for future pins

1. **DISPOSAL-03 authority.** The `20260915T175743Z` event = operator paste slip · governed instrument NOT EXECUTED · authority INTACT. The isolated printed `REQUALIFICATION PASS` has no evidentiary standing (`tee` failed because `$OUT` was never created; the intervening governed lines did not execute; no requalification evidence; no device operation). §18.26.2 unchanged; the next Mac-side attempt restarts Stage −1′ from `set -u` with a fresh stamp.
2. **Genuine-STOP boundary.** If, during the contiguous execution, any pinned `STOP:` condition actually fires inside Stage −1′ or any later governed stage, that is a genuine STOP and spends DISPOSAL-03; no interpretive rescue merely because the failure is inconvenient. *Paste/transport prevents a governed line from executing → NOT EXECUTED. A governed line executes and its pinned STOP condition fires → genuine STOP · authority SPENT.*
3. **Carrier/residue, temporal.** `/private/tmp/k0506-disposal-b198e2e37` = **authorized carrier during DISPOSAL-03**; **retained residue after** DISPOSAL-03 reaches PASS or a genuine STOP; never called residue while the live authority depends on it; §18.29 may name it so; no cleanup authorized by the classification.
4. **C-D28 — ACCEPTED for future pins**, not an amendment to the current one: a PASS line must be causally downstream of the evidence that earns it, not merely textually downstream in a shell block (e.g. require the custody file to exist and hold exactly four rows before emitting PASS). Present act: §18.26.2 UNCHANGED · DISPOSAL-03 AUTHORIZED · NOT EXECUTED · authority INTACT · fresh stamp · Mac Studio terminal · `K00-0506-S2-02` still UNOPENED.

Outstanding: the Mac-side return only — PASS branch + commit, or the first genuine `STOP:` line that fires → §18.29.

### §18.28.5 Founder rulings on the three open housekeeping questions (2026-09-15) — no act opened

```text
DISPOSAL-03        OPEN · authorized · not executed · Mac Studio Terminal act only · return outstanding
C-D26              HOLD · no repair authority (non-blocking, understood; no bearing on DISPOSAL-03 or the S2 population; not to be repaired while the population lane is open)
CLAUDE compaction  APPROVED IN PRINCIPLE · DEFERRED until DISPOSAL-03 and the S2-population disposition are closed (compact from a stable standing into a pointer to this plan's standing table + VOICE_CLAIM_STATE_2026-09-15.md; not before)
```

Founder: *"That keeps the only active work exactly where it belongs: getting the Mac-side DISPOSAL-03 return, without opening another maintenance or records sub-lane around it."* Claim-state record `eeb176cd1` accepted; case-study reference line `978046bea` in place.

---

## §18.29 — `S2-FOREIGN-HARNESS-DISPOSAL-03` EXECUTED → PASS (2026-09-15 · Mac Studio terminal directly · verified here) · `K00-0506-S2-02` CONDITION MET

### §18.29.1 Custody

Founder return: branch `feature/k00-s2-foreign-harness-disposal-03-20260915T181106Z`, commit `cb195a05267d7d97ec4c8e82f3e8c37e57383e69` → cherry-picked here with `-x` as `79fa57e87`. Bundle `driver-ledger/S2-FOREIGN-HARNESS-DISPOSAL-03-20260915T181106Z/` (ten files). `SHA256SUMS.disposal` recomputed here: **9/9 OK**. Transport: **Mac Studio terminal directly** (founder), the only carrier eligible under §18.28 item 5; the transcript was relayed stage by stage during execution and matches the sealed files.

### §18.29.2 Verification (every §18.26.2 return field, read from the sealed files)

- `stamp.txt` = `20260915T181106Z` — fresh; the dead `175743Z` of §18.28.3 was not reintroduced.
- `requal.txt` = `WORKTREE_PRESENT true` · `b198e2e37058f2e059d986b4b148e224215f3ee3` · `DRIVER_SOURCE_UNMODIFIED true` · `RUNNER_PRESENT true /private/tmp/k0506-disposal-b198e2e37/…/DriverUITests_iphoneos26.2-arm64.xctestrun` · `REQUALIFICATION PASS` — and this time the PASS line is causally downstream: the custody file exists beside it.
- `xctestrun.sha256` = `3b6360f7…` = the DISPOSAL-02 custody value (§18.25). Runner identity requalified, not inherited.
- `runner-custody.sha256`: exactly **four** lines with the C-D27-corrected `Debug-iphoneos/` paths — xctestrun `3b6360f7…` · `DriverUITests` `74ce3f48…` · `DriverUITests-Runner` `23f85491…` · `DriverHost` `efb57e22…`. Observation only: the three bundle-binary hashes differ from the §10.9 readiness runner's (`4d8684d1…` / `d77c2490…` / `704d21d3…`), as expected for a different worktree's signed build, while the xctestrun text is byte-identical.
- `processes-before.json` (matcher reproduced here): **exactly two** `VoiceKernelHarness` — `0B07D423…` PID 2098 · `6A2E406B…` PID 2099 = the identified R1 `.k00` and frozen `.vpio01` containers, the same PIDs the population Block-B read saw hours earlier (same process instances, not relaunches); `BEFORE_SET_IS_THE_TWO_IDENTIFIED True`; no `.vpio02` (`E3B88028…`) process.
- `terminate-phase-a.log`: one `Command line invocation`; `Terminate life.soullab.voicekernel.k00:2098` → `Wait for … to become Not Running` → `Executed 1 test, with 0 failures` → `** TEST EXECUTE SUCCEEDED **`. The log also carries `Unlock Kelly Nezat's iPhone to Continue` / `Waiting for the destination to become ready`: the device was locked at invocation; the founder unlocked it and the **same** invocation proceeded (56.97 s elapsed); no second invocation. Unlocking = a physical readiness act, not a governed operation on the harness (§18.29.3).
- `terminate-vpio-01.log`: one `Command line invocation`; `Terminate life.soullab.voicekernel.vpio01:2099` → Not Running → `Executed 1 test, with 0 failures` → `** TEST EXECUTE SUCCEEDED **` (4.96 s). `.vpio01`: termination only, as ruled.
- `processes-after.json` (matcher reproduced here): **`VoiceKernelHarness processes AFTER: 0`** → `DISPOSAL_ACCEPTANCE PASS`. No `.vpio02` process before or after.
- `RETURN.txt`: `ACT S2-FOREIGN-HARNESS-DISPOSAL-03` · `RUNNER_SOURCE b198e2e37…` · `RUNNER_CARRIER /private/tmp/k0506-disposal-b198e2e37` · `RUNNER_BUILT_BY S2-FOREIGN-HARNESS-DISPOSAL-02-STOP-20260915T173055Z` · `RUNNER_XCTESTRUN_SHA 3b6360f7…` · `FRESH_BUILD none` · `SUBJECTS phase-a vpio-01` · `INVOCATIONS 2` · `SECOND_INVOCATION_PER_SUBJECT none` · `ESCALATION none` · `DEVICE_ACTS termination-only`.

**PASS on every predeclared line: `DISPOSAL_ACCEPTANCE PASS` with both invocations `Executed 1 test, with 0 failures`.** Ruling item 8 bounds what it means: the known foreign live harness state is absent after the act; cause, actor, launch time, and whether either process had already exited before its termination call are NOT established.

### §18.29.3 Observations, none an act

- **Legacy `App.app` (container `B3E9C88A…`, PID 2100)** — the legacy MAIA iOS app — was running in both the before and after reads. It is not a `VoiceKernelHarness`, it is outside this authority and every pin on the lane, and nothing touched it. Recorded so it is never mistaken for a third harness. (Legacy repair remains forbidden.)
- **Device lock at Stage 1**: the first `xcodebuild` waited ~50 s for the phone to be unlocked, then ran. The unlock is a readiness act of the calibration-setup species (setup acts are not samples); it did not alter the invocation count.
- The two foreign harnesses had survived from before 17:00Z (population Block-B read) to 18:11Z with the same PIDs.

### §18.29.4 Founder ruling (2026-09-15, verbatim in substance)

```text
DISPOSAL-03             PASS · accepted · spent
transport               Mac Studio terminal directly

phase-a                 termination-only PASS
vpio-01                 termination-only PASS
foreign harnesses after 0

runner carrier          DISPOSAL-03 carrier during act
                        retained residue after completion

C-D27                   closed as pin defect
C-D28                   future hardening only
C-D26                   HOLD

K00-0506-S2-02
condition               MET
population execution    NOT YET OPENED
```

Founder: *"The foreign harness precondition has been removed under committed evidence. The condition that blocked `K00-0506-S2-02` is satisfied. I would not run the population yet. First cherry-pick, recompute the seal, and record §18.29. After §18.29 is durable, the population can be opened as its own explicit act under the unchanged `s2pop2` pin."*

`/private/tmp/k0506-disposal-b198e2e37` = **retained residue** from this point (§18.28.4 item 3); no cleanup authorized.

**Standing after §18.29:** DISPOSAL-01 STOP · spent · DISPOSAL-02 STOP · spent · **DISPOSAL-03 PASS · accepted · spent** (evidence committed `cb195a052` → `79fa57e87`, pushed) · C-D27 CLOSED · C-D28 future pins only · C-D26 HOLD · **`K00-0506-S2-02` CONDITION MET · execution NOT YET OPENED — its own explicit founder act under the unchanged §18.22.3 `s2pop2` pin** (pre-Block-C 69/unmuted/pane-closed read decisive; no restoration authority inside it; 69 last governed read 15:49:59Z) · `b198e2e37` unchanged · CLAUDE.md compaction DEFERRED until the population disposition closes · S3 CLOSED · KERNEL-00 acceptance CLOSED.

---

## §18.30 — FOUNDER RULING after §18.29 (2026-09-15): `K00-0506-S2-02` ISSUED AS A PAIRED RESTORATION + POPULATION ACT (option b) · Mac Studio terminal directly · pinned §18.30.2

### §18.30.1 Ruling as captured (founder; standing block verbatim)

Choice **(b)**: *"Given the demonstrated volume drift, issuing it bare would knowingly make a transient host-volume condition capable of consuming another population authority before a single sample is taken. The paired shape removes that avoidable failure mode while preserving the exact 69 boundary."*

1. **`K00-0506-S2-02` — ISSUED.** Scientific semantics = §18.22.3 unchanged: run label `K00-0506-S2` · N 10 · subject `vpio-02` · stimulus `s2-nearend` · source `b198e2e37` · §7 reading unchanged. Not acceptance, not S3, not KERNEL-00 acceptance.
2. **Execution shape — paired restoration joint (§18.13.3 shape):** Block A → Block B → RESTORE before-read → one founder keyboard restoration act (Volume Down to zero · Volume Up exactly 11 times · stop; no other adjustment) → immediate after-read = the joint → Block C as the very next act → `Dpop` → seal/return.
3. **Joint acceptance:** default output `Mac Studio Speakers` · `builtin` · `output volume 69` · `output muted false` · Sound pane closed · parser PASS. The post-restoration read **is** the population's pre-Block-C boundary; no second discretionary pause between the joint and Block C; anything else = STOP before population invocation.
4. **Why paired is authorized:** it prepares the host to the already-required state, it does not relax the state the population requires; target exactly 69 · unmuted · builtin · pane closed; known host drift must not consume another population authority without testing S2.
5. **Transport:** Mac Studio terminal directly; the remote-command channel is NOT eligible for this population execution (operational ruling; the channel has carried valid work but has also selectively refused required shell operations, and Block C is a long-running playback/batch act; the paired act contains a founder physical keyboard act, so one direct Mac-side shell gives the cleanest custody).
6. DISPOSAL-03 PASS · accepted · spent; foreign harnesses removed under committed evidence; carrier retained residue; condition MET; no disposal work reopened.
7. C-D26 HOLD · repair authority NONE (not repaired inside the population act).
8. CLAUDE.md compaction APPROVED IN PRINCIPLE · DEFERRED until the S2 population disposition closes; not at §18.29.
9. **Scope:** authorizes the paired restoration joint + one `K00-0506-S2` population invocation of N=10 + its pinned `Dpop`/custody return. NOT: S3 · KERNEL-00 acceptance · C-D26 repair · new runner design · new stimulus · new volume target · alternate restoration · population rerun after a governed STOP.

```text
DISPOSAL-03              PASS · spent
K00-0506-S2-02           AUTHORIZED · paired shape
population               NOT YET EXECUTED
restoration              one keyboard act authorized
joint target             69 · unmuted · builtin · pane closed
transport                Mac Studio terminal directly
remote channel           INELIGIBLE for this act
b198e2e37                unchanged
C-D26                    HOLD
CLAUDE compaction        DEFER until population disposition
S3                       CLOSED
KERNEL-00 acceptance     CLOSED
```

Governing distinction (founder): *"Do not spend another scientific authority discovering that the Mac changed its volume. Restore the already-proven boundary immediately before the population, prove the boundary, then let the population be the next act."*

### §18.30.2 Execution pin — `S2-RESTORE-04 / K00-0506-S2-02` paired act (Mac Studio terminal directly; founder hand inside it; nothing between the accepted joint read and Block C)

Composition, nothing new: Stage 0 and Blocks A/B/C/`Dpop` = §18.22.3 verbatim (`s2pop2` tokens, the four pinned hashes); Stages 2–5 and 7 = §18.13.3's restoration joint (as executed in WITNESS-05) with the directory prefix `k00-s2-volume-restore-04-` so it never collides with RESTORE-03's; the §18.5.2 parser block embedded verbatim. **The joint read replaces §18.20.3's separate pre-C read** (ruling item 3: the post-restoration read *is* the pre-Block-C boundary); no `s2pop2-preC-*` files are produced. Every block runs under `bash` from its file (§16.7); the `rc=` trailer is informational under zsh (C-D26, HOLD). No `#` on any shell line.

**Stage 0 — extraction with the `s2pop2` token, diff-proven, hashes = §18.22.3, pre-existence read (§18.22.3 verbatim):**

```bash
cd /Users/soullab/MAIA-SOVEREIGN
git fetch origin claude/voice-2026-census-01
DOC=docs/programme/VOICE-2026/KERNEL-00_VPIO-02_K00-06_PARTIAL-ZERO_DISCRIMINATOR_PLAN_2026-09-15.md
git show 17b4df63b:$DOC | sed -n '599,625p' > /private/tmp/s2w1-blockA.sh
git show 17b4df63b:$DOC | sed -n '633,702p' > /private/tmp/s2w1-blockB.sh
git show 17b4df63b:$DOC | sed -n '710,713p' > /private/tmp/s2w1-blockC.sh
for b in A B C; do sed -e 's/S2-WITNESS-01 1 --act/K00-0506-S2 10 --act/' -e 's/S2-WITNESS-01/K00-0506-S2/g' -e 's/s2-witness-01/k00-0506-s2/g' -e 's#/private/tmp/k0506-s2w-b198e2e37#/private/tmp/k0506-s2pop2-b198e2e37#g' /private/tmp/s2w1-block$b.sh > /private/tmp/s2pop2-block$b.sh; done
for b in A B C; do echo "== block $b diff (only the four tokens may appear)"; diff /private/tmp/s2w1-block$b.sh /private/tmp/s2pop2-block$b.sh; done
shasum -a 256 /private/tmp/s2pop2-block[ABC].sh
test ! -e /private/tmp/k0506-s2pop2-b198e2e37 && echo "POP2_WORKTREE_PREEXISTS false" || { echo "STOP: /private/tmp/k0506-s2pop2-b198e2e37 pre-exists"; exit 2; }
```

Then write `/private/tmp/s2pop2-blockDpop.sh` as exactly the §18.22.3 Stage 5 text and confirm `shasum -a 256 /private/tmp/s2pop2-blockDpop.sh` = `e4f93c0beb49831438320ffd5af1f82d111b0c529392d33f5a3af0a0462b5879`. Expected A/B/C hashes `5dd16bdd…` · `22e105dd…` · `77d40528…`. Any mismatch or a pre-existing path = STOP before Block A.

**Stage 1 — Block A (custody) then Block B (device preflight), §16.7 transport; any STOP line ends the act, nothing invoked:**

```bash
bash /private/tmp/s2pop2-blockA.sh 2>&1 | tee /private/tmp/s2pop2-blockA.out; echo "rc=${PIPESTATUS[0]}" | tee -a /private/tmp/s2pop2-blockA.out
bash /private/tmp/s2pop2-blockB.sh 2>&1 | tee /private/tmp/s2pop2-blockB.out; echo "rc=${PIPESTATUS[0]}" | tee -a /private/tmp/s2pop2-blockB.out
```

`BLOCK_A_PASS=1` and `PREFLIGHT_CLEAN=…K00-0506-S2-preflight-<stamp>` must appear. Block B's process read must show `VoiceKernelHarness processes: 0` (DISPOSAL-03 removed the two foreign ones; a harness present here is a STOP under this pin, never a terminate-only).

**Stage 2 — pane closed, no competing process (preparation, repeatable, not the joint; a hand ⌘Q if a Sound pane is resident):**

```bash
pgrep -fl "System Settings|Sound.appex" ; echo "[pgrep rc=$?]"
pgrep -fl "afplay|k00-driver-batch" ; echo "[pgrep rc=$?]"
```

Expected: no process line and `[pgrep rc=1]` on both.

**Stage 3 — RESTORE-04 before-read (volume UNKNOWN until read):**

```bash
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="/private/tmp/k00-s2-volume-restore-04-$STAMP"
mkdir -p "$OUT"
date -u +%Y-%m-%dT%H:%M:%SZ > "$OUT/before-utc.txt"
system_profiler SPAudioDataType -json > "$OUT/audio-before.json"
system_profiler SPBluetoothDataType -json > "$OUT/bluetooth-before.json"
osascript -e 'get volume settings' > "$OUT/volume-before.txt"
pgrep -fl "System Settings|Sound.appex" > "$OUT/sound-pane-before.txt" ; echo "rc=$?" >> "$OUT/sound-pane-before.txt"
cat "$OUT/volume-before.txt"
echo "$OUT"
```

**Stage 4 — the one founder hand act (ruling item 2, verbatim):** keyboard Volume Down until the bottom/zero state → Volume Up exactly 11 times → stop. Nothing else touched; no slider, no scripted keys, no `osascript`, no twelfth press, no post-read correction.

**Stage 5 — THE JOINT READ (= RESTORE-04's after-read = the population's pre-Block-C boundary); the parser writes `parser.txt` and `JOINT.txt` in the same pass, no second read:**

```bash
date -u +%Y-%m-%dT%H:%M:%SZ > "$OUT/after-utc.txt"
system_profiler SPAudioDataType -json > "$OUT/audio-after.json"
osascript -e 'get volume settings' > "$OUT/volume-after.txt"
pgrep -fl "System Settings|Sound.appex" > "$OUT/sound-pane-after.txt" ; echo "rc=$?" >> "$OUT/sound-pane-after.txt"
cat "$OUT/after-utc.txt" "$OUT/volume-after.txt" "$OUT/sound-pane-after.txt"
python3 - "$OUT/audio-after.json" "$OUT/volume-after.txt" <<'PY' | tee "$OUT/parser.txt"
import json, re, sys

raw = open(sys.argv[1], encoding="utf-8").read()
raw = raw[raw.find("{"):raw.rfind("}")+1]
d = json.loads(raw)

items = []
for group in d.get("SPAudioDataType", []):
    items.extend(group.get("_items", []))

defaults = [
    x for x in items
    if x.get("coreaudio_default_audio_output_device") == "spaudio_yes"
]

for x in defaults:
    print(
        "DEFAULT_OUTPUT",
        x.get("_name"),
        x.get("coreaudio_device_transport"),
        x.get("coreaudio_device_srate"),
    )

mac = next((x for x in items if x.get("_name") == "Mac Studio Speakers"), None)
mac_default = bool(mac and mac.get("coreaudio_default_audio_output_device") == "spaudio_yes")
print("MAC_STUDIO_DEFAULT_OUTPUT", mac_default)

vol = open(sys.argv[2], encoding="utf-8").read()
m_vol = re.search(r"output volume:(\d+)", vol)
m_mute = re.search(r"output muted:(true|false)", vol)
volume = int(m_vol.group(1)) if m_vol else None
muted = m_mute.group(1) if m_mute else None
print("OUTPUT_VOLUME", volume)
print("OUTPUT_MUTED", muted)

ok = (
    len(defaults) == 1
    and mac_default
    and defaults[0].get("coreaudio_device_transport") == "coreaudio_device_type_builtin"
    and volume == 69
    and muted == "false"
)
print("RESTORE_ACCEPTANCE", "PASS" if ok else "STOP")
PY
grep -q '^RESTORE_ACCEPTANCE PASS$' "$OUT/parser.txt" && test "$(tail -1 "$OUT/sound-pane-after.txt")" = "rc=1" && echo "PASS" > "$OUT/JOINT.txt" || echo "STOP $(grep -E '^(RESTORE_ACCEPTANCE|OUTPUT_VOLUME|OUTPUT_MUTED|MAC_STUDIO_DEFAULT_OUTPUT)' "$OUT/parser.txt" | tr '\n' ' ') pane=$(tail -1 "$OUT/sound-pane-after.txt")" > "$OUT/JOINT.txt"
cat "$OUT/JOINT.txt"
```

**Joint condition — all of:** exactly one `DEFAULT_OUTPUT` line · `DEFAULT_OUTPUT Mac Studio Speakers coreaudio_device_type_builtin …` · `MAC_STUDIO_DEFAULT_OUTPUT True` · `OUTPUT_VOLUME 69` · `OUTPUT_MUTED false` · `RESTORE_ACCEPTANCE PASS` · `sound-pane-after.txt` = no process line, last line `rc=1` — summarised mechanically as `JOINT.txt` = `PASS` (C-D28 shape: the PASS word is written only from the parser's own output and the pane read, never by a bare echo).

**PASS at the joint → Stage 6 is the very next shell act. Nothing intervenes: no seal, no commit, no push, no note, no re-read, no deliberation.** **FAIL at the joint (any line) → STOP: no correction, no second hand act, no retry; run only Stage 7's seal; authority SPENT; population NOT invoked.** **Interruption after an accepted joint read and before Block C started → STOP, same rule; never resumed.**

**Stage 6 — Block C, exactly one invocation (the ten samples run inside it; the batch's own stimulus preflight is the second volume boundary and STOPs before playback on drift), then `Dpop` only after Block C returned:**

```bash
bash /private/tmp/s2pop2-blockC.sh 2>&1 | tee /private/tmp/s2pop2-blockC.out; echo "rc=${PIPESTATUS[0]}" | tee -a /private/tmp/s2pop2-blockC.out
bash /private/tmp/s2pop2-blockDpop.sh 2>&1 | tee /private/tmp/s2pop2-blockDpop.out; echo "rc=${PIPESTATUS[0]}" | tee -a /private/tmp/s2pop2-blockDpop.out
```

`BATCH_PIPELINE_RC=0` and `batch complete` are Block C's PASS lines; an exit 8/9 STOP inside the batch is evidence (nothing sampled on 8; the partial ledger on 9), never rerun; a governed STOP spends the authority (ruling item 9).

**Stage 7 — seal the restoration files (read-only; after `Dpop`, or immediately on a joint FAIL / Block-C STOP):**

```bash
( cd "$OUT" && shasum -a 256 before-utc.txt audio-before.json bluetooth-before.json volume-before.txt sound-pane-before.txt after-utc.txt audio-after.json volume-after.txt sound-pane-after.txt parser.txt JOINT.txt > SHA256SUMS && cat SHA256SUMS )
```

**Stage 8 — return, one `feature/*` branch, one commit, from a fresh carrier worktree with the dependency link (C-D25 lesson); read-only except the copies and the commit:**

```bash
cd /private/tmp/k0506-s2pop2-b198e2e37
LD="$(ls -td docs/programme/VOICE-2026/driver-ledger/K00-0506-S2-2* 2>/dev/null | head -1)"
PF="$(ls -td docs/programme/VOICE-2026/driver-ledger/K00-0506-S2-preflight-2* 2>/dev/null | head -1)"
echo "LEDGER_DIR=$LD"; echo "PREFLIGHT_DIR=$PF"
RSTAMP="$(basename "$OUT" | sed 's/^k00-s2-volume-restore-04-//')"
BR="feature/k00-s2-population-02-evidence-$RSTAMP"
WT="/private/tmp/k00-s2pop2-carrier-$RSTAMP"
cd /Users/soullab/MAIA-SOVEREIGN && git fetch origin claude/voice-2026-census-01 && git worktree add -b "$BR" "$WT" origin/claude/voice-2026-census-01
cd "$WT" && test -e node_modules || ln -s /Users/soullab/MAIA-SOVEREIGN/node_modules node_modules
mkdir -p "docs/programme/VOICE-2026/driver-ledger/s2-volume-restore-04-$RSTAMP" && cp -p "$OUT"/* "docs/programme/VOICE-2026/driver-ledger/s2-volume-restore-04-$RSTAMP"/ && ( cd "docs/programme/VOICE-2026/driver-ledger/s2-volume-restore-04-$RSTAMP" && shasum -a 256 -c SHA256SUMS )
test -n "$LD" && cp -R "/private/tmp/k0506-s2pop2-b198e2e37/$LD" docs/programme/VOICE-2026/driver-ledger/ || echo "LEDGER_DIR absent (Block C not run, or STOP before a ledger existed)"
test -n "$PF" && cp -R "/private/tmp/k0506-s2pop2-b198e2e37/$PF" docs/programme/VOICE-2026/driver-ledger/ || echo "PREFLIGHT_DIR absent"
RUN="docs/programme/VOICE-2026/driver-ledger/K00-0506-S2-02-run-$RSTAMP"
mkdir -p "$RUN" && cp -p /private/tmp/s2pop2-block*.sh "$RUN"/ && cp -p /private/tmp/s2pop2-block*.out "$RUN"/ 2>/dev/null; true
{ printf 'ACT K00-0506-S2-02 paired with S2-RESTORE-04\nRESTORE_STAMP %s\nJOINT %s\nLEDGER_DIR %s\nPREFLIGHT_DIR %s\nBASE_HEAD b198e2e37058f2e059d986b4b148e224215f3ee3\nTRANSPORT Mac Studio terminal directly\n' "$RSTAMP" "$(cat "$OUT/JOINT.txt")" "$LD" "$PF"; } > "$RUN/RETURN.txt"
( cd "$RUN" && shasum -a 256 * > SHA256SUMS.run && cat SHA256SUMS.run )
git add docs/programme/VOICE-2026/driver-ledger && git status --short && git commit -m "witness(voice-2026): return K00-0506-S2-02 paired evidence (S2-RESTORE-04 joint + K00-0506-S2 population, $RSTAMP)" && git push -u origin "$BR" && git log -1 --format=%H
```

**Return:** branch + full SHA + the terminal transcript from Stage 0 through the SHA + any `STOP:` line with its stage + `Mac Studio terminal directly` → **§18.31** here: restoration half read against §18.5.3 (seal 11/11 · parser reproduced · joint condition), population half against §16.4 and §18.20.3's `Dpop` (seal · stimulus custody · classifier · output reader · **§7.2/§7.3 reading per row**), partition pins expected to move by ten (C-D24 species). A joint FAIL, a Block-B STOP or an in-batch STOP returns in the same carrier shape with `JOINT.txt`/`RETURN.txt` naming the stage reached.

**Standing after §18.30:** DISPOSAL-03 PASS · spent · **`K00-0506-S2-02` AUTHORIZED · paired shape · pinned §18.30.2 · NOT YET EXECUTED** (founder hand inside it) · joint target 69 · unmuted · builtin · pane closed · transport Mac Studio terminal directly (remote channel INELIGIBLE) · `b198e2e37` unchanged · C-D26 HOLD · CLAUDE.md compaction DEFERRED until the population disposition · S3 CLOSED · KERNEL-00 acceptance CLOSED.

### §18.30.3 Founder acceptance of the pin + one advance ruling (2026-09-15)

- **Pin accepted as written at `d14844e95`** — names `S2-RESTORE-04` and `feature/k00-s2-population-02-evidence-<RSTAMP>` accepted; no amendment before execution. The founder verified the committed `d14844e95` object through GitHub because the Mac checkout had not yet fetched it and the ineligible remote channel refused the fetch; **the direct Mac Studio Terminal still performs the pinned `git fetch` + `git show … §18.30.2` read before executing** (a read of the object it will run, from the transport that will run it).
- **Advance ruling (in-batch drift STOP):** if the joint reads `PASS` and Block C's own stimulus preflight then STOPs on drift with exit 8 before playback (§17 shape), **that is a genuine governed STOP and spends `K00-0506-S2-02`** — not a transport non-execution: no sample was taken, but the governed population act had begun and its own internal acceptance boundary refused it; no rerun under the same authority. Recorded so §18.31 can adjudicate that outcome from the return alone.
- Nothing else changes: transport Mac Studio terminal directly · remote channel ineligible · C-D26 HOLD · compaction deferred · S3 / KERNEL-00 acceptance CLOSED.

## §18.31 — `S2-RESTORE-04 / K00-0506-S2-02` EXECUTED (2026-09-15 · Mac Studio terminal directly · founder hand inside it) → JOINT PASS → BLOCK C PASS → POPULATION ACQUIRED 10/10 · VERIFIED HERE · §7.2/§7.3 READING PERFORMED → population CHARACTERIZE · returned for ruling

### §18.31.1 Custody

Return branch `feature/k00-s2-population-02-evidence-20260915T184016Z`, commit `84eb74094609be6a569fc0c8572ef85be4527594`, cherry-picked here as `d82e7a834` (`-x`; 117 files). Transport: Mac Studio terminal directly (the §18.28 ruling honoured; the remote channel carried nothing). Four carriers, all read from the committed files:

| Carrier | Files | Seal | Read here |
|---|---|---|---|
| `driver-ledger/s2-volume-restore-04-20260915T184016Z/` | 11 (`before-utc` · `after-utc` · `volume-before/after` · `audio-before/after.json` · `bluetooth-before.json` · `sound-pane-before/after` · `parser.txt` · `JOINT.txt` · `SHA256SUMS`) | **11/11** | §18.31.2 |
| `driver-ledger/K00-0506-S2-02-run-20260915T184016Z/` | `RETURN.txt` · `s2pop2-block{A,B,C,Dpop}.{sh,out}` · `SHA256SUMS.run` | **9/9** | §18.31.4 |
| `driver-ledger/K00-0506-S2-preflight-20260915T183343Z/` | `apps.json` · `processes.json` (Block B's two device reads) | inside the run seal's reach via Block B's `PREFLIGHT_CLEAN` line | §18.31.4 |
| `driver-ledger/K00-0506-S2-20260915T184128Z/` | 10 journals · `ledger.md` · `output-ledger.md` · `batch.log` · `transcript.txt` · `stimulus-preflight/` ×5 · `stimulus-sample-1..10.tsv` · `stimulus-sample-1..10-afplay.log` (all 0 bytes: afplay wrote nothing) · `sample-timing.tsv` · `daemons/` · `SHA256SUMS.population` | **80/80** | §18.31.4–§18.31.6 |

Block scripts re-hashed here = the §18.30.2 pin exactly: A `5dd16bdd…` · B `22e105dd…` · C `77d40528…` · Dpop `e4f93c0b…`. `RETURN.txt` verbatim: `ACT K00-0506-S2-02 paired with S2-RESTORE-04 · RESTORE_STAMP 20260915T184016Z · JOINT PASS · LEDGER_DIR …/K00-0506-S2-20260915T184128Z · PREFLIGHT_DIR …/K00-0506-S2-preflight-20260915T183343Z · BASE_HEAD b198e2e37058f2e059d986b4b148e224215f3ee3 · TRANSPORT Mac Studio terminal directly`.

### §18.31.2 Restoration half — read against §18.5.3 → PASS

- Before-read `2026-09-15T18:40:16Z`: `output volume:69 … output muted:false`, Sound pane `rc=1` (closed). **The volume was already 69 before the hand act** (last governed read 69 at 15:49:59Z, §18.16; no drift in the 2 h 50 min between) — the §18.30.2 pin performs the keyboard act unconditionally, so the hand act re-established a state that had not moved. Observation, not a defect; the pin never conditioned the hand on the before-read, and a conditional hand would have been a different act.
- One keyboard act (Volume Down to zero · Up ×11), founder's hand.
- After-read `2026-09-15T18:41:19Z`: `output volume:69 … output muted:false`, pane `rc=1`.
- §18.5.2 parser re-executed here on the copied `audio-after.json` + `volume-after.txt` = `parser.txt` byte-for-byte: `DEFAULT_OUTPUT Mac Studio Speakers coreaudio_device_type_builtin 48000` · `MAC_STUDIO_DEFAULT_OUTPUT True` · `OUTPUT_VOLUME 69` · `OUTPUT_MUTED false` · **`RESTORE_ACCEPTANCE PASS`**. `audio-before.json` and `audio-after.json` byte-identical (device state untouched by the act; only the scalar was exercised). `JOINT.txt` = `PASS`, derived mechanically (C-D28 shape) from `RESTORE_ACCEPTANCE PASS` ∧ pane `rc=1`.
- **Joint condition MET at 18:41:19Z.** Ordinal boundary honoured: Block C's first line (`build-for-testing`) is stamped 18:41:29 in `s2pop2-blockC.out` — ten seconds later, nothing governed between (§18.31.3 names the one thing that happened *before* Stage 5, not after it).

### §18.31.3 Sequencing deviation — founder-disclosed, ruled NON-MATERIAL (verbatim in substance)

> After the keyboard act and before Stage 5, the Stage 7 seal command was run once prematurely and failed (the after-read files did not exist yet). It touched no device, volume or harness. Stage 5 then returned PASS and Block C was the very next act; the batch's own stimulus preflight reconfirmed 69 / unmuted / builtin. Ruled non-material: not a governed STOP, and the ordering is not relaxed for future acts.

Recorded as ruled. The premature seal produced no file (the later Stage 7 seal is the only `SHA256SUMS` in the carrier, 11/11). It sits *before* the joint read, so the boundary that matters — nothing between the accepted joint read and Block C — was not crossed. Species: operator sequencing slip inside a hand-driven stage, harmless because the seal command is read-only and fails closed on absent inputs.

### §18.31.4 Population half — read against §16.4 and §18.20.3 `Dpop` → PASS on every committed line

- **Block A PASS** (fourth clean pass on `b198e2e37`): `HEAD=b198e2e37…` · `TREE_CLEAN=1` · `GATE_75_75=1` (the frozen worktree's own gate) · `AFPLAY_SHA=88f3b577…` · `AFPLAY_PROCESSES_BEFORE=0` · `BLOCK_A_PASS=1`.
- **Block B `PREFLIGHT_CLEAN`**: `E3B88028_CONTAINER_HITS=1`; `processes.json` read here = 310 processes, **0 `VoiceKernelHarness`** (the DISPOSAL-03 state held; the two foreign harnesses did not return).
- **Block C**: `build-for-testing` 18:41:29 → **stimulus preflight PASS 18:41:35** (`fixture 1a505b3d…` · `afplay 88f3b577…` · `default output Mac Studio Speakers (coreaudio_device_type_builtin)` · **`volume 69` · `muted false`** — the second volume boundary, re-read by the batch itself 16 s after the joint) → samples 1–10 each `stimulus custody VALID (pid … alive through the governed interval; stopped by the batch, wait rc=143)` → `batch complete` 18:48:02 → **`BATCH_PIPELINE_RC=0`**. Every `.out` ends `rc=` (empty) — C-D26, HOLD, unchanged; the explicit `BATCH_PIPELINE_RC=0` line is the authoritative status.
- **`Dpop`**: `AFPLAY_PROCESSES_AFTER=0` · ten `custody VALID` lines · ten journal hashes · population seal written.
- **Stimulus custody, read from the ten TSVs**: fixture path + SHA `1a505b3d…`, `/usr/bin/afplay` SHA `88f3b577…`, `-v 0.50`, 180 s; one child per sample (pids 30133 · 30583 · 30995 · 31467 · 31819 · 32222 · 32632 · 32986 · 33430 · 33803); `preRunState alive` → 32–42 `liveness … alive` rows at 1 s, no gap, no `dead`/`zombie` → `postRunState alive` → `stopRequestedEpoch` → `waitExitStatus 143` → `custody VALID` ×10. `sample-timing.tsv`: sample 1 run_test 18:41:37Z–18:42:19Z … sample 10 18:47:25Z–18:47:57Z; 32–39 s per governed interval; the stimulus outlived every run_test on both ends.
- **Preflight artefacts**: `stimulus.sha256` = fixture pin · `afplay.sha256` = census pin · `volume.txt` = `output volume:69 … output muted:false` · `stimulus-wave-metadata.txt` = `channels=1 sampleRate=48000 sampleWidthBytes=2 frames=8640000 seconds=180.000 format=EXACT` · `audio-output.json` parsed here → exactly one default output, `Mac Studio Speakers coreaudio_device_type_builtin 48000`.

### §18.31.5 Classifier and output reader reproduced here

- `k00-ledger.py --subject vpio-02` on the ten journals → **10/10 rows byte-identical** to `ledger.md`: **10 × gen-1 listen** (listening 328–434 ms), cold ×10, 14-step VPIO-02 trace, VP ON, `isRunningImmediate=true` · `graphStartedRunning=true`, first callback 2–10 ms, `generations=1`, hold 18.9–27.2 s, `listeningHeldAtExport=True` ×10, `listeningLostLater=True` ×10 (the lawful `listening → maiaSpeaking` output floor, §10.12). 0 refusals · 0 resets · 0 interruptions · 0 orphans.
- `k00-output-ledger.py --subject vpio-02` → every K00-05-CANCEL · K00-05-COMPLETE · K00-06 · COUPLING row byte-identical to `output-ledger.md`; the four `DRIVER-MARKER` rows per sample are taken by the batch from the runner log, not the journal, and are therefore not reproducible from the journals alone (the same shape as every prior K00-0506 verification).
- **Frozen rows, beside the S2 reading, never pooled, earning nothing:** K00-05 cancel **PASS-05 ×10** (`cancelToSilenceMs 0` ×10; frames at cancel 70 080–94 560 of 144 000) ∧ completion **PASS-05 ×10** (144 000/144 000; 2 992–3 001 ms descriptive) — K00-05 is CLOSED (§10.12), these are evidence only. K00-06: **9 PASS-06 · 1 UNMEASURED-06 (sample 6, one full rendering window) · 0 CHARACTERIZE-06 · 0 FAIL-06**; `digitalZeroTotal=0` in all ten (§18.31.7 (a)). The K00-06 built-in standing (CHARACTERIZE ONLY · INCOMPLETE from the K00-0506 population, §10.12) is untouched: an S2 row earns no K00-06 PASS by the §18.20 ruling, and 9/10 would not meet the frozen 10/10 condition in any case.

### §18.31.6 §7.2/§7.3 reading, per row — the scientific reading the population was acquired for

**Definitions applied (existing evidence only, §7.2):** kernel energy classes per callback — `digitalZero` peak ≤ 1e-7 · `noiseFloor` rms < 1e-3 · `signal` rms ≥ 1e-3 (`HealthSupervisor.swift:21–22`); *baseline window* = an `input_health_sample` whose whole span precedes the first `stream_scheduled`, `inputFlow healthy`; *full rendering window* = a window whose whole span lies inside one scheduled stream (either stream; stream 1 is cancelled at ≈1.5–2.0 s after scheduling and so holds at most one full window; stream 2 completes at 3.0 s and holds one or two); *partial* windows straddle a stream edge and are shown but do not decide. Validity: the stimulus visible as `signal` in ≥ 2 healthy baseline windows. Verdict per row: `signal` present in **every** full rendering window with callbacks ≥ 90 and `ioRunning true` → **A-consistent** · absent in **every** full rendering window with callbacks/`ioRunning` intact → **A′-consistent** · mixed → **CHARACTERIZE**. Reading script (offline, reads only the ten journals; kept verbatim so the reading is reproducible):

```python
#!/usr/bin/env python3
"""§7.2/§7.3 per-window reading of the K00-0506-S2 population (evidence-only; never a K00-06 PASS/FAIL).
Per input_health_sample window: phase relative to the two scheduled streams, callbacks, digitalZero,
noiseFloor, signal (kernel classes: digitalZero peak<=1e-7 · noiseFloor rms<1e-3 · signal rms>=1e-3),
rmsMean, rmsMin, ioRunning. Validity = signal present (signal>0) in >=2 healthy pre-output baseline windows.
Full rendering window = a window whose whole span lies inside a scheduled stream (stream2 = uncancelled)."""
import json, sys, glob, os
def rd(p):
    return [json.loads(l) for l in open(p)]
def read(path):
    R = rd(path); E = lambda r: r.get('evidence', {})
    sess = R[0]['session']
    gs = next(r for r in R if r['event']=='graph_started'); t0 = gs['timeMonotonicMs']
    streams = []  # (start, end, kind)
    for r in R:
        if r['event']=='stream_scheduled':
            streams.append([r['timeMonotonicMs'], None, r['to'] if 'to' in r else r.get('stream')])
        if r['event'] in ('stream_cancelled','stream_complete'):
            for s in streams:
                if s[1] is None: s[1] = r['timeMonotonicMs']; s[2] = r['event']; break
    rows = []; prev_t = t0
    for r in R:
        if r['event']!='input_health_sample': continue
        e = E(r); t = r['timeMonotonicMs']; ws, we = prev_t, t; prev_t = t
        phase = 'pre-output'
        if streams and ws >= streams[0][0]:
            phase = 'post-output'
            for i, s in enumerate(streams):
                if s[0] <= ws and s[1] is not None and we <= s[1]: phase = f'FULL-RENDER s{i+1}({s[2][7:]})'
                elif s[0] < we and (s[1] is None or ws < s[1]): phase = f'partial s{i+1}({s[2][7:]})'
            if phase == 'post-output' and streams[-1][1] and ws < streams[-1][1]: phase='between'
        rows.append(dict(t=(t-t0), phase=phase, cb=int(e['callbacks']), dz=int(e['digitalZero']), nf=int(e['noiseFloor']),
                         sig=int(e['signal']), rmsMean=float(e['rmsMean']), rmsMin=float(e['rmsMin']), peakMax=float(e['peakMax']),
                         io=e['ioRunning'], flow=e['inputFlow']))
    return sess, rows
def verdict(rows):
    base = [w for w in rows if w['phase']=='pre-output' and w['flow']=='healthy']
    base_sig = [w for w in base if w['sig']>0]
    full = [w for w in rows if w['phase'].startswith('FULL-RENDER')]
    if len(base_sig) < 2: return 'UNMEASURED (stimulus not seen as signal in >=2 baseline windows)', base, full
    if len(full) < 1: return 'UNMEASURED (no full rendering window)', base, full
    persists = all(w['sig']>0 and w['io']=='true' and w['cb']>=90 for w in full)
    vanishes = all(w['sig']==0 and w['io']=='true' and w['cb']>=90 for w in full)
    if persists: return 'A-consistent (signal persists through every full rendering window)', base, full
    if vanishes: return "A'-consistent (signal disappears in every full rendering window; callbacks/ioRunning intact)", base, full
    return 'CHARACTERIZE (mixed across full rendering windows)', base, full
if __name__=='__main__':
    files = sorted(glob.glob(sys.argv[1]+'/journals/*.jsonl'), key=lambda p: int(p.rsplit('-',1)[1].split('.')[0]))
    for i,p in enumerate(files,1):
        sess, rows = read(p); v, base, full = verdict(rows)
        bs = ' '.join(f"{w['sig']}" for w in base)
        print(f"\n## {i} {sess}  baselineWindows={len(base)} signal/window=[{bs}] withSignal={sum(1 for w in base if w['sig']>0)}  fullRender={len(full)}  → {v}")
        for w in rows:
            if w['phase']=='pre-output' and w['sig']>0 and w['dz']==0: continue  # elide ordinary baseline rows
            print(f"  t={w['t']:6d} {w['phase']:26s} cb={w['cb']:3d} dz={w['dz']:2d} nf={w['nf']:3d} sig={w['sig']:3d} rmsMean={w['rmsMean']:.5f} rmsMin={w['rmsMin']:.2e} peak={w['peakMax']:.4f} io={w['io']} {w['flow']}")
```

**Result table** (baseline = `signal` callbacks per baseline window; full = `signal` callbacks per full rendering window in order, `s1` = cancelled stream, `s2` = completed stream; rms = `rmsMean` of those windows):

| # | Session | Baseline windows with signal | Baseline signal/window | Full rendering windows (signal · rmsMean) | Verdict |
|---|---|---|---|---|---|
| 1 | `K00-8d09e590` | 9/11 (marginal: windows 2·4 read 0 at rms 0.0007) | 9 0 2 0 48 49 67 54 23 24 29 | s2 103 · 0.0030 / s2 103 · 0.0027 | **A-consistent** |
| 2 | `K00-48b857c6` | 6/11 (marginal: most windows rms 0.0008–0.0009) | 71 0 6 0 0 0 3 9 0 6 42 | s2 103 · 0.0016 / s2 52 · 0.00097 | **A-consistent** (second window half-signal, at the threshold) |
| 3 | `K00-ea4d3805` | 18/18 | 53–103 | s1 41 · 0.0011 / s2 99 · 0.0017 / **s2 0 · 0.00008** | **CHARACTERIZE** (one deep-attenuation window inside stream 2) |
| 4 | `K00-4989dad6` | 11/11 | 85–104 | s1 96 · 0.0010 / s2 104 · 0.0016 / s2 102 · 0.0018 | **A-consistent** |
| 5 | `K00-bbd4ec34` | 11/11 | 93–104 | s1 101 · 0.0011 / s2 104 · 0.0018 / s2 104 · 0.0018 | **A-consistent** |
| 6 | `K00-46d00487` | 11/11 | 4–104 | s2 102 · 0.0017 (the only full window) | **A-consistent on n = 1 window** — the frozen K00-06 reader reads this row UNMEASURED-06 (< 2 full windows); §7.2 states no full-window minimum → founder to rule (§18.31.8 item 2) |
| 7 | `K00-923c4e4b` | 11/11 | 32–104 | **s1 0 · 0.00003** / s2 103 · 0.0054 / s2 103 · 0.0081 (peak 1.0000) | **CHARACTERIZE** (deep attenuation in stream 1; full-scale peak in stream 2) |
| 8 | `K00-388b3ac9` | 11/11 | 46–104 | **s1 0 · 0.00001 (peak 0.0000)** / s2 102 · 0.0018 / s2 103 · 0.0018 | **CHARACTERIZE** (deep attenuation in stream 1) |
| 9 | `K00-e5e6f9bb` | 11/11 | 87–104 | s2 103 · 0.0023 / s2 103 · 0.0025 | **A-consistent** |
| 10 | `K00-08e81fa8` | 11/11 | 52–101 | s1 92 · 0.0018 / s2 103 · 0.0020 / s2 95 · 0.0027 | **A-consistent** |

**Tally (rows, N = 10, 0 infra, 0 custody-INVALID):** A-consistent **6** (1 · 2 · 4 · 5 · 9 · 10) + **1 on a single window** (6) · CHARACTERIZE **3** (3 · 7 · 8) · A′-consistent **0** · UNMEASURED **0** by the letter of §7.2 (rows 1–2 valid but marginal, §18.31.7 (e)).
**Window level (25 full rendering windows):** **22** carry `signal`-class input (rmsMean 0.00097–0.0081, callbacks 102–104, `ioRunning true`) · **3** carry none — rmsMean **1e-5 … 8e-5**, i.e. 10–100× *below* the pre-output baseline noise level (≈ 7e-4), with callbacks 102–104 and `ioRunning true`: exactly the A′ shape (the whole near-end suppressed at the consumed seam while MAIA speaks), two of them in stream 1 (samples 7 · 8, the cancelled stream's only full window), one in stream 2 (sample 3, its second full window).

**§7.2 verdict for the population: CHARACTERIZE.** The dominant shape is A-consistent (signal-class input persists at the consumed post-VP seam through 22/25 full rendering windows, every row contributing at least one such window); A′ is **not excluded** — three windows in three rows show the seam driven to ~1e-5 rms with capture intact; A is **not established** as the whole-population shape. Neither hypothesis is ruled out by this population; nothing here earns K00-06 PASS, and nothing here is constitutional.

### §18.31.7 Observations — descriptive, none an act, none a mechanism claim

(a) **No digital-zero callback anywhere in-stream, 0/10** (`digitalZeroTotal=0` on every frozen K00-06 row; the only `digitalZero` callbacks in any journal are the 3 in the first window after `graph_started`, the known start transient). The K00-0506 VP-ON population without a stimulus (§10.11) read partial digital zero in 5/10. The two populations differ in stimulus presence and in nothing else known; they are never pooled and the difference is not attributed.
(b) **Onset transient in every row**: the partial window containing a stream start reads `peakMax` 0.09–0.57 and `rmsMean` 0.0035–0.019 — the own tone before the processor converges, the same shape as §10.11 and S1.
(c) **Limitation of the ratified discriminator, named:** in the A-consistent full windows the seam rms sits at 1.3–2.5× the baseline rms. The journal carries amplitude classes only, no spectral evidence, so whether that residual is the 997 Hz near-end tone, residual echo of the phone's own tone, or both cannot be separated from these files. The A reading therefore establishes *"signal-class input persists at the consumed seam while MAIA speaks"*, not *"the near-end tone specifically persists"*. This is a property of §7.2 as ratified (existing evidence only), not a defect and not repaired here.
(d) The three deep-attenuation windows are **not** explained by (c): a seam at 1e-5 rms is below the tone, below the residual echo and below the room — under S1 (VP OFF) the same seam during rendering read 0.06–0.07 rms. Those three windows are the strongest A′-shaped evidence the programme holds; three windows in ten rows is characterization, not a verdict.
(e) **The stimulus reaches the seam at threshold-edge level**: baseline rms 0.0007–0.0013 straddles the 1e-3 `signal` boundary, hence rows 1–2's patchy baseline visibility. INFERENCE, not read: a stationary 997 Hz tone is the kind of input a voice processor's noise suppression may treat as stationary noise; the row-to-row baseline difference is consistent with that and establishes nothing. If S3 or any further stimulus act is ever ruled, a non-stationary labelled source (or a higher fixture level) is the design question this raises — not proposed here.
(f) Sample 7's second stream-2 window reads `peakMax 1.0000`: a full-scale callback at the consumed seam during own playback. Descriptive.
(g) Restoration: the volume had not drifted since 15:49:59Z (69 → 69 across 2 h 50 min with the Sound pane closed). Consistent with the §18.4 candidate mechanism (a person-shaped Sound-pane session), not evidence of it.

### §18.31.8 Standing and what is returned (nothing opened)

- `S2-RESTORE-04` **PASS** · evidence committed · joint honoured (ordinal) · the sequencing deviation of §18.31.3 recorded as ruled non-material.
- `K00-0506-S2-02` **EXECUTION PASS · SPENT** · samples 10/10 · custody 10/10 VALID · journals 10 · `BATCH_PIPELINE_RC 0` · every §16.4 / `Dpop` line verified here · classifier + output reader reproduced.
- **Scientific reading PERFORMED (§18.31.6): population CHARACTERIZE** — A dominant at window level (22/25), A′ present in 3 windows / 3 rows, neither established, neither excluded.
- Returned for ruling, in order: **(1)** acceptance of the §18.31.6 reading as the S2 disposition; **(2)** sample 6 — A-consistent on one window vs UNMEASURED by extension of the reader's ≥ 2 rule (the record does not choose); **(3)** whether observation (c) (amplitude-only seam evidence) means S2 as ratified cannot separate A from residual echo, and what that implies for the conditional S3 (S3 was conditioned on A′; the population is CHARACTERIZE, not A′; S3 stays NOT OPEN unless ruled); **(4)** C-D24-species gate maintenance (§18.31.9) acceptance; **(5)** the CLAUDE.md compaction deferred at §18.28.5 is now eligible on the founder's word.
- NOT proposed: any S2 top-up or rerun (forbidden by the ruling) · any threshold · any organism/harness/driver/reader change · C-D26 repair (HOLD) · S3 · KERNEL-00 acceptance. No Mac population act is needed; the work moved from acquisition to reading, and the reading is on the record.

### §18.31.9 Gate maintenance (C-D24 species; instrument-only commit, preceding the records commit)

The corpus-partition test read red on the cherry-pick exactly where §18.30.2 predicted: tracked journals 549 → **559**, vpio-02 51 → **61**, ledgered directories 16 → **17**, and (a fourth pin not predicted) vpio-02 gen-1 listens 50 → **60** (the ten new rows). Four count pins moved, the comment beside them updated, rule unchanged, no directory named; 76/76 read alone before the instrument commit and again before the records commit. Founder acceptance owed.

## §18.32 — FOUNDER RULING on §18.31 (2026-09-15): return ACCEPTED · S2 disposition CHARACTERIZE · sample 6 A-consistent on n=1 · amplitude-only limitation MATERIAL · S3 CLOSED and non-executable as written · C-D24 maintenance ACCEPTED · CLAUDE.md compaction AUTHORIZED

### §18.32.1 Ruling as captured (founder; five rulings, substance verbatim)

1. **§18.31.6 ACCEPTED as the S2 disposition: `CHARACTERIZE`.** The reading is internally faithful to the ratified §7.2 law: 22/25 full rendering windows retain signal-class input; 3/25, across samples 3, 7 and 8, fall to the A′-shaped deep-attenuation floor while callbacks and `ioRunning` remain intact. The record correctly does not promote that to either A or A′ as the population finding. **S2 closes as CHARACTERIZE — founder question unresolved, not PASS, FAIL, A or A′.**
2. **Sample 6 is `A-consistent on n=1 full rendering window`, not UNMEASURED.** The frozen K00-06 reader's two-full-window measurement rule is not imported into S2 after the evidence exists. The ratified S2 validity rule requires the external stimulus visible in ≥ 2 healthy baseline windows; its rendering rule does not require two full rendering windows. Sample 6 satisfies that law and has one qualifying full window in which signal persists. The evidentiary weakness is preserved explicitly as `n=1`; the tally is not flattened to an undifferentiated 7/10 — "6 + sample 6 on one window" is the right carrier.
3. **The amplitude-only limitation is MATERIAL TO INTERPRETATION, accepted exactly as named.** S2 can establish that signal-class energy persists at the consumed seam in a window; it cannot establish that the persisting energy is specifically the controlled 997 Hz near-end stimulus rather than residual echo of MAIA's own playback. The 22 signal-positive windows are legitimately A-consistent but cannot establish hypothesis A as originally defined (*independent near-end signal still passes*). The three deep-attenuation windows remain strong A′-shaped observations (the whole consumed seam falls toward ~1e-5–8e-5 rms while capture continues), but three windows in three rows do not establish A′ for the population.
   **Consequence for S3: S3 remains CLOSED, and S3 as presently designed must not be executed merely by later satisfying the old A′ condition.** The original S3 design uses VP OFF plus the same external stimulus and reads "signal during rendering" as evidence that the external stimulus survives; but S1 already established that with VP OFF MAIA's own 440 Hz playback itself reaches the consumed seam at roughly 0.06–0.07 rms and dominates it. An amplitude-only S3 therefore could not tell whether its positive signal came from the 997 Hz external stimulus or the uncancelled 440 Hz own playback. The old conditional is not triggered by this S2 result and its positive arm is now known to be non-discriminating. If the programme later needs to distinguish A from residual echo, or reopen the A′ → B question, it requires a **new source-identifying discriminator** (spectral / correlation, or another labelled-source method whose evidence can distinguish the external source from own playback) — a new design and ruling, not S3 by inheritance.
4. **C-D24-species gate maintenance ACCEPTED.** `c78ccd59c` moves only the four structural count pins the ten new journals require (total 549 → 559 · vpio-02 51 → 61 · ledgered directories 16 → 17 · vpio-02 gen-1 listens 50 → 60); the structural partition rule is unchanged and no population directory is added to membership logic; 76/76 read alone.
5. **CLAUDE.md compaction AUTHORIZED.** The §18.28.5 ruling approved it in principle and deferred it only until the S2 population disposition closed; this ruling closes that disposition. The compaction is its own subsequent carrier after this adjudication is durable; it may not introduce new doctrine, reopen S3, repair C-D26, or alter the scientific findings.

### §18.32.2 Standing after this ruling (founder's table, verbatim)

```text
S2-RESTORE-04           PASS · CLOSED
K00-0506-S2-02          EXECUTION PASS · SPENT
S2 scientific disposition
                        CHARACTERIZE · ACCEPTED · CLOSED

sample 6                A-consistent · n=1 full window
                        not S2-UNMEASURED

A                       NOT ESTABLISHED
A′                      NOT ESTABLISHED · NOT EXCLUDED
founder question         UNRESOLVED by amplitude-only S2

S2 top-up / rerun        ⛔
new Mac population act   ⛔

S3                       ⛔ CLOSED
S3 as currently written ⛔ not executable without new
                           source-identifying discriminator ruling

C-D24 maintenance        ✅ ACCEPTED
C-D26                    HOLD
CLAUDE compaction        ✅ AUTHORIZED after adjudication record

K00-06 built-in          CHARACTERIZE ONLY · INCOMPLETE
KERNEL-00                NOT ACCEPTED
```

Founder, on the result: *"The important scientific result is narrower — and more useful — than forcing A or A′: VP ON does not produce one stable duplex behavior. The consumed seam preserves signal-class energy through most rendering windows, but in three independently observed windows it collapses by orders of magnitude while the capture machinery remains alive. What S2 cannot tell us is whose energy survives in the other 22 windows. That is now the actual unresolved discriminator."*

### §18.32.3 Applied here

- §18.31.6's table row for sample 6 now reads under ruling 2; the tally "6 + 1 on a single window (sample 6) · CHARACTERIZE 3" stands as the carrier. Nothing in §18.31 is edited.
- S3 (§5 / §7.4 conditional) is CLOSED and, as written, non-executable; any future source-identifying discriminator is a new design act, not opened here.
- This section is the adjudication record the compaction waits on; the compaction follows as its own commit (pointer to this standing table + `VOICE_CLAIM_STATE_2026-09-15.md`; no new doctrine).
- Nothing else opens. `.vpio02` untouched · organism, harness, driver, readers, reinstall frozen · C-D26 HOLD · KERNEL-00 NOT ACCEPTED.

## §18.33 — `SOURCE-ID-01` OPENED (founder, 2026-09-15) as a READ-ONLY DESIGN ACT → design RETURNED, authorizes nothing

Founder, after §18.32: *"Next is not another witness. The next lawful move is a new design lane for the unresolved discriminator: can we prove that the energy surviving at the consumed seam is the independent near-end source, rather than MAIA's own playback / residual echo? … Open a read-only source-identification design act. No device run, no harness change, no S3, no K00-06 acceptance attempt."* Four questions to answer before any implementation: measurement · stimulus · reading law · minimal surface; sequence = design → founder ruling → minimal evidence instrument → offline/gate validation → one controlled population if authorized → source-specific reading → only then reconsider S3 (redesigned, not inherited) / KERNEL-00.

**Returned:** `docs/programme/VOICE-2026/KERNEL-00_VPIO-02_SOURCE-ID-01_DESIGN_2026-09-15.md` (read-only; seam census at `efad9b399`). In one line each: **Q1** a fixed-bin Goertzel on the very buffer `measure()` reads, Hann-windowed over a 40 ms frame (4 callbacks), bins `{440, 880, 997, 700, 1200}` Hz, coefficients from the observed rate, one `input_source_sample` per second on the existing tick beside an unchanged `input_health_sample` (computed: worst own-harmonic leak into the 997 bin −51 dB; in-band noise ≈ 2.8e-5 at the S2 baseline vs a tone at ≈ 7e-4; a 10 ms rectangular frame would have let 880 Hz leak −8.5 dB and is refused); **Q2** keep 997 Hz; recommend a **gated** 997 Hz fixture (250 ms on/off) as the population stimulus, whose 2 Hz temporal contrast no residual can imitate, with the stationary fixture retained as a small first arm that turns S2's stationarity-suppression inference into evidence or drops it; chirp/PRN named as the escalation, not recommended first; **Q3** a predeclared per-invocation, self-calibrated reading law (validity V1–V3; NEAR-END-SURVIVES / NEAR-END-SUPPRESSED / OWN-PLAYBACK-RESIDUAL-PRESENT (descriptive) / INDETERMINATE-SRC per full rendering window, with a measured leakage bound; row and population tallies; explicit mapping onto A / A′; earns no K00-06 PASS); **Q4** the whole diff = `AudioGraph.swift` interior + two kernel seams (one hop, one record) + tests + new bundle id + gate + a new evidence-only reader; nine invariant files, `InputObservation`, thresholds, both frozen readers byte-identical; behaviour claim falsifiable at the gate. Observer-effect firewall: not an AVAudio read, still a NEW SUBJECT by custody (P5-F1). Falsifiers F-S1…F-S6 (design-time refusals) and four first-witness readings that would falsify the design are pinned. Rulings owed (design §8): Q1 · Q2 · Q3 numbers · Q4 surface + bundle name + whether a separate entry witness is required — then, separately, implementation authority.

**Standing unchanged:** S2 CHARACTERIZE · CLOSED · S3 CLOSED (non-executable as written) · K00-06 built-in CHARACTERIZE ONLY · INCOMPLETE · KERNEL-00 NOT ACCEPTED · C-D26 HOLD · `.vpio02` untouched · organism/instrument frozen · **open execution authority NONE.**

## §18.34 — FOUNDER RULING on `SOURCE-ID-01` (2026-09-15; design §9) → read-only AMENDMENT returned (design §10)

Ruling (substance verbatim in design §9): spectral core ACCEPTED (consumed buffer after `AudioUnitRender`, no new AVAudio read, 40 ms Hann, fixed-frequency magnitudes, evidence only, one record/s, no raw audio/phase/spectrum, new subject by custody) · **Q1 aggregate AMEND REQUIRED** (unordered high/low counts prove contrast, not a 2 Hz signature; frame arithmetic 25/s → ≈ 12–13 on/off, not 6/6) · **Q2 S-b gated 997 Hz ACCEPTED as the first population stimulus; S-a N=5 NOT OPEN; chirp/PRN escalation only; N=10 retained** · **Q3 structure ACCEPTED, numbers AMEND REQUIRED** (the leakage bound applied power-domain ratios to magnitude outputs — −51.2 dB → 2.75e-3 amplitude, not 3.5e-6) · **Q4 surface ACCEPTED IN PRINCIPLE; subject named `life.soullab.voicekernel.vpio02sid` / `VoiceKernel VPIO-02-SID`; a SEPARATE SID ENTRY WITNESS is REQUIRED before any source population (not opened)** · implementation NOT AUTHORIZED.

Amendment (design §10, computed here): **A** — the 1 s record carries `m2_997` and `m2_440`, a phase-independent 2 Hz DFT magnitude of the *ordered* 40 ms frame envelope normalized by its sum (ideal gate 1.21–1.31; NS-adapting gate ≈ 1.33; unmodulated heavy fluctuation max 0.82 in 4 000 trials → threshold **`m2 ≥ 0.9`**); frame arithmetic corrected. **B** — amplitude-domain leakage coefficients into the 997 bin: 440 → 2.16e-5 · 880 → 2.77e-3 · 1 320 → 4.00e-5 · 1 760 → 1.12e-5; `Lk` re-derived on measured harmonic maxima (recommended: add 1 320 / 1 760 bins; 5-bin fallback bounds higher harmonics by the 2nd, stated as an assumption); V2 = baseline `m2_997 ≥ 0.9`; SURVIVES requires amplitude ≥ 0.1 × baseline ∧ ≥ 10 × max(noise, leakage) ∧ `m2_997 ≥ 0.9`; SUPPRESSED < 0.01 × baseline with capture intact; INDETERMINATE-SRC carries reason codes, notably **`signature_absent`** — 997 Hz energy present but not gated, i.e. the S2 ambiguity made measurable per window. Owed: acceptance of §10.A/§10.B (and the bin-set choice), then a separate implementation/qualification pin that also shapes the required SID entry witness. **Standing: implementation NOT AUTHORIZED · device act NONE · S3 CLOSED · K00-06 built-in CHARACTERIZE ONLY · INCOMPLETE · KERNEL-00 NOT ACCEPTED · open execution authority NONE.**

## §18.35 — FOUNDER RULING on `d02ce1094` (2026-09-15): §10.A/§10.B ACCEPTED · `m2_440` confound veto RULED · 7-bin set RULED · tail bound required · **`SOURCE-ID-02` implementation AUTHORIZED, code/offline only** → LANDED at `6f0e2e0b2`, NOT COMPILED

Ruling (substance verbatim in the design record §9 and the implementation record): §10.A accepted, with `m2_440 ≥ 0.9` during a rendering window vetoing NEAR-END-SURVIVES → `INDETERMINATE-SRC: own_modulated` (`m2_440 < 0.9` is part of SURVIVES; no health or K00-06 law changes) · §10.B accepted with the **7-bin set** `{440, 700, 880, 997, 1200, 1320, 1760}` (5-bin fallback REJECTED) and an explicit conservative tail `Ltail = 2.82e-6 × e880Max` (≥ 5th harmonics ≤ the measured 2nd, stated) · final SURVIVES law = amplitude ∧ noise/leakage ∧ `m2_997 ≥ 0.9` ∧ `m2_440 < 0.9` ∧ no frameReset · **SOURCE-ID-02 implementation AUTHORIZED** (Q4 surface; return before any compile with unit vectors · deterministic 2 Hz tests incl. the veto · leakage/tail tests · every reader path · fixture checks · frozen-reader row-identical replay · invariant byte-identity · gate green) · qualification PINNED but CLOSED (SID MAC-COMPILE → FIRST-INSTALL → SID ENTRY WITNESS, mandatory and separately authorized → S-b N=10 → source reading → only then redesigned S3 / KERNEL-00).

**Landed:** `docs/programme/VOICE-2026/KERNEL-00_VPIO-02_SOURCE-ID-02_IMPLEMENTATION_2026-09-15.md` — implementation SHA `6f0e2e0b25ff74636dab21b6c4239865ba51c691`; exactly the ruled surface (AudioGraph estimator · kernel hop/aggregate/record · tests · project.yml `.vpio02sid` / `VoiceKernel VPIO-02-SID` · gated fixture SHA `30d51cf4…` + token `sid-nearend-gated` · `k00-source-ledger.py` · batch/reinstall/driver custody declarations · gate 76 → 82/82 by history); invariant files byte-identical to `ac12dedf4`, frozen readers to `b198e2e37`; reader self-test 20/20; 61 tracked VPIO-02 journals → `no_source_evidence`; two explicit substitutions on historical instrument lines pinned; five flags for the founder (record §7: `SourceEvidence` component name · driver row · S-a refused on the SID subject · compile-era Swift risk · empty SID pins). **NOT COMPILED. Nothing opened: MAC-COMPILE · install · SID entry witness · population · S-a · S3 all CLOSED; device execution authority NONE.**

## §18.36 — FOUNDER RULING on `6f0e2e0b2` (2026-09-15): SOURCE-ID-02 NOT YET ACCEPTED for MAC-COMPILE · five flags disposed · two offline defects + one control ambiguity → `SOURCE-ID-02A` AUTHORIZED → LANDED at `f0c6ae13b`

Ruling and repair recorded verbatim in substance in the implementation record §9. Defect 1: the gated token was unreachable behind the batch's earlier catch-all (the record's "lawful on the SID subject" claim was false in executable behaviour) → one closed dispatch, two lawful pairings, gate-pinned so no admitted token can sit behind a prior refusal. Defect 2: `frameReset` did not veto SUPPRESSED → `frameReset` is now indeterminate before either attribution verdict; self-test 21. Ambiguity: an undefined `m2_440` cleared like a measured quiet control → control clears only numeric-and-quiet or undefined-with-no-own-band-energy on a complete record, else `INDETERMINATE-SRC: own_control_unmeasured`; self-tests 22–24. Flags: `SourceEvidence` · driver row · S-a refusal · empty pins ACCEPTED; compile-era Swift risk DEFERRED to MAC-COMPILE. Swift untouched; self-test 24/24; gate 82/82. **Standing: implementation + repair RETURNED, NOT YET ACCEPTED; MAC-COMPILE · FIRST-INSTALL · SID ENTRY WITNESS (required) · S-b N=10 CLOSED · S-a NOT OPEN · S3 CLOSED · KERNEL-00 NOT ACCEPTED · device execution authority NONE.** Next = the founder's adjudication of the whole; if clean, SID MAC-COMPILE opens as its own act.

## §18.37 — FOUNDER ADJUDICATION (2026-09-15): `SOURCE-ID-02` ACCEPTED · `SOURCE-ID-02A` ACCEPTED · accepted code state `f0c6ae13b88db29cbd1537bec585d98376c8bc4f` · **SID MAC-COMPILE OPEN** (only newly authorized act; pinned in the implementation record §10.2; NOT YET EXECUTED)

Ruling recorded verbatim in substance in `KERNEL-00_VPIO-02_SOURCE-ID-02_IMPLEMENTATION_2026-09-15.md` §10.1. The compile act: fresh detached worktree at exactly `f0c6ae13b` → HEAD/tree proofs → gate 82/82 → `swift test` (the never-executed source unit vectors) → `xcodegen` → unsigned generic-iOS build → signed device build (team `ZVK2X646Z2`, Xcode destination id) → identity (bundle `life.soullab.voicekernel.vpio02sid` · display `VoiceKernel VPIO-02-SID` · dylib UUID · dylib SHA · executable SHA · manifest + SHA + count · codesign) → post-build surface proof → sealed evidence. STOP on any failure; predeclared-risk compiler errors return as bounded compile defects, never repaired inside the act; **reinstall pins are NOT filled by the compile**. Install · launch · sample 0. Still closed: FIRST-INSTALL · pin mutation · SID ENTRY WITNESS (required) · S-b N=10 · S-a · S3 · KERNEL-00 acceptance; device execution NONE.


## §18.38 — `SID MAC-COMPILE-01` EXECUTED → **STOP at `swift test`** (2026-09-15; implementation record §10.5; qualification plan §10.58)

Founder-executed at the Mac Studio terminal via the §10.4 file transport (script SHA/line count matched the §10.2 pin). Worktree at `f0c6ae13b` exact and clean · gate **82/82 PASS** · `xcrun swift build` **PASS** (the SID kernel interior compiles on the Mac toolchain) · `xcrun swift test` **FAIL at test-target compilation** — `PureLogicTests.swift:485:13: error: the compiler is unable to type-check this expression in reasonable time` (the `ripple` binding in the modulation-index unit test: an untyped closure mixing literals, `Double.pi`, `sin`, `Double(k)` and a captured `Double`) → `set -e` STOP at the pinned `Executed … 0 failures` check. `$OUT = /private/tmp/sid-mac-compile-01-out-20260915T204348Z`: `gate.log` · `head.txt` · `status-before.txt` · `swift-build.log` · `swift-test.log` · `toolchain.txt` — nothing from `xcodegen` onward; no seal. **Zero Swift tests ran** (target did not link): the six source unit vectors remain never-executed. **Bounded compile-era defect in the predeclared risk class, returned as the exact failure and not repaired inside the act** (§10.1 rule). Authority **SPENT**. Duplicate queued invocation = visible scrollback only, execution NOT ESTABLISHED (not recorded as a precondition refusal witnessed); the 0-byte 20:43:11Z transcript belongs to the §10.4 empty-script no-op. Candidate repair (named, not written, not authorized): split the expression into typed sub-expressions, values and assertions unchanged, `PureLogicTests.swift` only; sibling closure expressions in the same class may stop a second compile the same way. Any repair = new SHA = fresh compile authority; reinstall pins stay empty. Evidence carrier (`$OUT` + seal + Desktop copies) owed on `feature/*`. Standing otherwise unchanged from §18.37.


## §18.39 — FOUNDER RULING on §18.38 (2026-09-15): `SID REPAIR-01` OPEN for `PureLogicTests.swift:485` ONLY · siblings HOLD · `SID MAC-COMPILE-02` NOT OPEN · carrier FIRST (implementation record §10.6; qualification plan §10.59)

Narrower than the §18.38 candidate: *one admissible compiler finding → one repair; the sibling expressions are candidates by shape, not findings — repairing them now would turn prediction into authority.* Repair authority = the modulation-index test's line-485 binding only; purpose = make the existing expression type-checkable; semantic change NONE, values and assertions unchanged, kernel untouched. Accepted shape: explicit `[Double]`, typed closure argument, `kk`, `arg`, same arithmetic (pinned text in §10.6 step 3). Three separate acts: MAC-COMPILE-01 (spent) → REPAIR-01 (new SHA, founder diff review) → MAC-COMPILE-02 (separately authorized against that exact SHA; if it stops on `g` / `seq26` / the `on` loop, that is the evidence for the next repair; if it passes, no change was manufactured). **Evidence carrier lands before the repair**: `SID_MAC-COMPILE-01_CARRIER_2026-09-15.sh` issued (feature branch `feature/sid-mac-compile-01-evidence-20260915T204348Z` → `driver-ledger/sid-mac-compile-01-20260915T204348Z/`, six `$OUT` files + both Desktop copies + the script + every transcript incl. the 0-byte no-op + `SHA256SUMS.run` + `RETURN.txt`; reads `$OUT`, never writes it). REPAIR-01 is not written until the carrier is cherry-picked and read here.


## §18.40 — carrier LANDED + READ (§10.7) · `SID REPAIR-01` WRITTEN at `faf918b5c5b2cd85f8e8a6c9cbda8bc76df11ce8` (§10.8) · awaiting founder diff review · `SID MAC-COMPILE-02` NOT OPEN (2026-09-15; qualification plan §10.60)

Carrier `feature/sid-mac-compile-01-evidence-20260915T204348Z` @ `1c772e14f` cherry-picked `-x` (here `1fbf1cd00`); `SHA256SUMS.run` reproduced (`ba8c0528…`, 0 mismatches); `head.txt` = `f0c6ae13b`; script = pinned `a3a803f4…`; `swift-test.log` read in full: the single `485:13` type-check diagnostic, no test ran; `swift-build.log` = 13/13 kernel units, `Build complete!`. New fact: a third 0-byte transcript `…T213208Z.log` (mtime 17:32 local) — the queued duplicate invocation DID execute at 21:32:08Z; its outcome is most plausibly a silent `test ! -e "$WT"` refusal before any act (NOT witnessed); the governed `$OUT` mtimes are unaffected; one read-only `ls -ld /private/tmp/sid-mac-compile-01-out-* /private/tmp/sid-mac-compile-01-f0c6ae13b*` settles it (an empty `…-out-20260915T213208Z` = refused at the precondition). Then, under §18.39: `SID REPAIR-01` written — one hunk, `+5 −1`, `PureLogicTests.swift` line 485 only, the pinned typed sub-expression form, values/assertions/siblings unchanged; `git diff --stat f0c6ae13b faf918b5c -- ios scripts __tests__` = 1 file, 5+/1−; gate 82/82. Whether Swift 6.2.4 now type-checks it is unverifiable here and is `MAC-COMPILE-02`'s question. Design note for the next pin: `mkdir -p "$OUT"` after the worktree precondition.


## §18.41 — FOUNDER RULING (2026-09-15): the queued duplicate invocation is **ESTABLISHED as executed and refused at the existing `$WT`** (implementation record §10.9; qualification plan §10.61)

0-byte `…T213208Z.log` at 21:32:08Z, carrier transcript begins 21:32:12Z, `mkdir -p "$OUT"` then `test ! -e "$WT"` with the governed worktree present → non-substantive residue only: no gate, no Swift, no Xcode, no device act. Supersedes the "not established" wording in §18.38 / §18.40 and in the carrier's `RETURN.txt` (frozen, not rewritten). The §18.40 `ls` is no longer owed. MAC-COMPILE-01 standing unchanged (EXECUTED · STOP · SPENT). REPAIR-01 written at `faf918b5c` under §18.39, diff review pending; siblings HOLD; MAC-COMPILE-02 NOT OPEN.

§18.41 confirmed by direct read (§10.10): empty `/private/tmp/sid-mac-compile-01-out-20260915T213209Z` (17:32 local, `.`/`..` only) beside the untouched governed `$OUT` and the 16:43 worktree — the duplicate created its `$OUT`, hit `test ! -e "$WT"`, exited. No change to any standing.


## §18.42 — FOUNDER RULINGS (2026-09-15): `SID REPAIR-01` ACCEPTED at `faf918b5c5b2cd85f8e8a6c9cbda8bc76df11ce8` · `SID MAC-COMPILE-02` OPEN against that SHA exactly · pin issued (implementation record §10.11; qualification plan §10.62)

Repair reviewed directly by the founder: one file, one hunk, 5+/1−, kernel/harness/driver/siblings/assertions/values untouched, semantic drift NONE FOUND. MAC-COMPILE-02 = requalification, not continuation; the §10.2 path with two ruled changes (subject SHA; `mkdir -p "$OUT"` after the worktree precondition) plus a disclosed act-label substitution 01→02 in paths/manifest/echo (revertible before any run if the founder prefers the strict reading). Boundary: siblings HOLD · code change NONE · reinstall pins EMPTY · install/launch/sample/device mutation 0 · own fate (any new compiler finding = STOP, not inherited repair permission). Pin `SID_MAC-COMPILE-02_PIN_2026-09-15.sh` (50 lines, `554e663e…`), file transport. NOT YET EXECUTED.


## §18.43 — `SID MAC-COMPILE-02` EXECUTED → final echo reached (PASS as founder-reported) on `faf918b5c`; carrier issued; NOT YET ACCEPTED (2026-09-15; implementation record §10.12; qualification plan §10.63)

Same toolchain as the 485:13 time-out (Xcode 26.3 / Swift 6.2.4): HEAD exact · tree clean · gate 82/82 · `swift build` PASS · **`swift test` `Executed 33 tests, with 0 failures`** (SourceEstimatorTests 6/6 — the source unit vectors' first execution anywhere) · xcodegen · unsigned + signed device builds `BUILD SUCCEEDED` · bundle `life.soullab.voicekernel.vpio02sid` · display `VoiceKernel VPIO-02-SID` · dylib UUID `4A6AD464-0A19-320F-980E-7446F6AA1440` · dylib SHA `a15b399d…` · executable SHA `db036694…` · manifest `699ac758…` (7 files) · `TeamIdentifier=ZVK2X646Z2` · post-build surface = Info.plist footprint only · `$OUT=/private/tmp/sid-mac-compile-02-out-20260915T214212Z`. No sibling expression diagnosed — sibling HOLD moot, nothing manufactured. Install 0 · launch 0 · sample 0 · reinstall pins EMPTY (identity recorded, not pinned). Acceptance waits on the carrier (`SID_MAC-COMPILE-02_CARRIER_2026-09-15.sh` → `feature/sid-mac-compile-02-evidence-20260915T214212Z`).


## §18.44 — FOUNDER RULINGS (2026-09-15): labels ACCEPTED as act identity · `SID MAC-COMPILE-02` **PASS · SPENT** on the founder's direct `$OUT` read (implementation record §10.13; qualification plan §10.64)

Complete pin diff enumerated by the founder (SHA · worktree/OUT identity · mkdir order · manifest name · echo), no undisclosed change; the worktree rename was necessary to instantiate the act. PASS chain: subject exact before/after · clean · 82/82 · Swift build · 33/33 (SourceEstimatorTests 6/6; the repaired test executed and passed) · unsigned + signed builds · identity/team/authority exact · manifest 7 · Info.plist-only footprint · `SHA256SUMS.compile` 17 entries, `d835bebc…`. Sibling HOLD **remains HOLD** (no finding). Reinstall pins EMPTY; install/launch/sample/device 0. Carrier issued (`3bad244ad`), not withheld; custody reproduction here on arrival is confirmation, not condition.


## §18.45 — carrier-02 attempt STOP (checker self-entry defect) → carrier-B issued · `SID REINSTALL-PIN-SID` written at `3f3cb15b070d9237f17f66625ede6591b1ae5940` (code-only, diff review next) · `SID ENTRY-WITNESS-DESIGN` OPEN (2026-09-15; implementation record §10.14; qualification plan §10.65)

Compile seal `SHA256SUMS.compile` lists itself at zero length (recipe defect, not repaired; seal frozen, real hash `d835bebc…`, 16/16 other entries OK); carrier-B verifies with the self-entry excluded and preserved, fresh worktree/branch identity. Reinstall pin: UUID `4A6AD464-…` + dylib SHA `a15b399d…` recorded exactly as ruled; exec/manifest pins empty (outside the ruling) so `pins-unrecorded` still refuses; `VPIO02SID_CONTAINER="WITNESS-REQUIRED"` sentinel, consumed nowhere; gate 82/82. ENTRY witness design opened as records only.


## §18.46 — carrier-B in custody (all seals reproduced) · reinstall-pin act 1 ACCEPTED `3f3cb15b0` · act 2 written `3035c0235` (review pending) · `SID ENTRY-WITNESS-DESIGN` RETURNED (2026-09-15; implementation record §10.15–§10.16; qualification plan §10.66)

Design `KERNEL-00_VPIO-02_SID_ENTRY_WITNESS_DESIGN_2026-09-15.md`: Q-ENTRY = did the in-process source observer perturb physical entry, on the K00-04 axis, against F-W1 (29/30, 338 ms median, 1 500 ms ceiling); three moments (PRE-INSTALL · INSTALL TRANSACTION · POST-INSTALL ENTRY · ONLY AFTER ENTRY PASS) and a four-link binding chain; chain [A]–[H] each its own authority; observer-liveness validity read (bins/`m2` never read); predeclared classes UNPERTURBED / PERTURBED / INDETERMINATE / CHARACTERIZE ONLY + `SUBJECT-MISMATCH` STOP-CLASS; strict ENTRY/population boundary (no stimulus, no source reader, journals counted for liveness only). Authorizes nothing; Q2–Q6 owed. A terminal-paste incident after carrier-B executed nothing against repo or device; that window retired from governed work.


## §18.47 — act 2 ACCEPTED `3035c0235` · ENTRY design ACCEPTED, Q2–Q6 ruled (Q3 AMENDED: UNPERTURBED ≥ 27/30) · `FIRST-INSTALL-SID` pin DRAFT returned, run NOT OPEN (2026-09-15; implementation record §10.17; qualification plan §10.67)

All five SID reinstall pins recorded (identity completion, not install authority). ENTRY law as ruled: N = 30 · UNPERTURBED = t ≥ 27/30 ∧ Fisher n.s. ∧ 0 ceiling breach ∧ all OBSERVER-LIVE (≥ 10 source samples per hold) · 24–26 takes INDETERMINATE · product gate at install, read at preflight · `.vpio02`/`.vpio02sid` coexist, uninstall never. Draft pin `SID_FIRST-INSTALL-01_PIN_DRAFT_2026-09-15.sh` (57 lines, `6201d9bb03d22f334784b8abff96d5ba1003633b682f7739b040a02c7b8dfd70`; `bash -n` only): authority from the environment (never the repo), local identity gate, read-only absence + coexistence reads, exactly one instrument invocation, container extracted from the install result line, post-install bind reads, seal written outside the dir. Review next; opening is a separate act.


## §18.48 — FIRST-INSTALL draft AMENDED (seven-file product-vs-manifest proof before any device read) · execution NOT OPEN · [D] `SID_ENTRY-PREFLIGHT-01` and [E] `SID_ENTRY-BATCH-01` DRAFTED as separate artifacts, placeholder container, frozen N = 30 law, adjudication kept outside the instrument (2026-09-15; implementation record §10.18; qualification plan §10.68)

Three draft artifacts (`a052f081…` 59 lines · `bc83ca0e…` 41 lines · `2a5b6206…` 28 lines; all `bash -n` only) returned for review; nothing runs; no admissible SID container exists; `K00_EXEC_AUTHORITY` not issued. Structural couplings: [E] requires [D]'s worktree and a `PREFLIGHT-CLEAN` ≤ 600 s old and refuses a second ledger; [D] refuses while `__SID_CONTAINER_FROM_FIRST_INSTALL_RECORD__` stands.


## §18.49 — FIRST-INSTALL draft ACCEPTED (execution closed) · [D]/[E] amended as ruled (preflight sealed; batch verifies the seal; freshness 0…300 s) · FIRST-INSTALL carrier drafted with refusing placeholders · observer-liveness verifier committed at `6f9c4e6ad` (selftest 9/9; gate 82 → 85) (2026-09-15; implementation record §10.19; qualification plan §10.69)

Artifacts: `SID_ENTRY-PREFLIGHT-01_PIN_DRAFT` 44 lines `1e77bb05…` · `SID_ENTRY-BATCH-01_PIN_DRAFT` 32 lines `990e34ff…` · `SID_FIRST-INSTALL-01_CARRIER_DRAFT` 42 lines `bf4283b7…` · `scripts/witness/k00-source-liveness.py` + 8 fixtures. The verifier reads two evidence keys of one record kind and decides only LIVE/DORMANT; F-W1 journals read DORMANT (negative control). Nothing runs; no container exists; authority not issued.


## §18.50 — [D] · [E] · FIRST-INSTALL carrier · liveness verifier ALL ACCEPTED at `6769627f5` (gate 85/85 accepted) · **`SID FIRST-INSTALL-01` OPEN — one custody-gated transaction** (2026-09-15; implementation record §10.20; qualification plan §10.70)

Authority issued by the founder in-session (seven lines: act · subject `faf918b5c…` · instrument `3035c0235…` · bundle · one transaction · launch 0 · sample 0); by ruling it lives only as the invocation input in a fresh Terminal window and is never committed. Bounded to the accepted 59-line pin `a052f081…`. Permits the pre-install custody chain, the coexistence/absence/process reads, exactly one `k00-reinstall.sh` transaction, container capture from the install result, post-install bind reads, sealing `$OUT`. Does not permit a second attempt, uninstall, overwrite, launch, driver test, [D], [E], sample or source population. Any refusal spends it. Not yet executed.


## §18.51 — `SID FIRST-INSTALL-01` attempt 1: NOT ENTERED — payload file absent, pin refused at `test -n "$K00_EXEC_AUTHORITY"` before any path, worktree, `mkdir`, device read or instrument; window was not fresh (deleted cwd, another lane's scrollback) (2026-09-15; implementation record §10.21; qualification plan §10.71)

Extraction matched custody (`a052f081…`, 59 lines); nothing created but a few-byte transcript; device untouched. Session reading: not a governed refusal but a non-entry (§10.3/§10.4 form) — authority intact; **founder rules spend vs intact.** Next attempt, if intact: fresh window, `cd ~`, step 0 (write the payload), then the five lines.


## §18.52 — FOUNDER RULING (2026-09-16): `SID FIRST-INSTALL-01` EXECUTED · STOP at the authority precondition · **SPENT** · carrier NOT OPEN (implementation record §10.22; qualification plan §10.72)

Authority file absent → empty `K00_EXEC_AUTHORITY` → accepted pin invoked → line-3 gate refused; transcript `…T235951Z.log` 116 bytes; worktree/`$OUT`/device verbs/install/container none; the deleted-cwd message is terminal context, not cause. Rule settled: once the accepted pin is invoked, any refusal — the authority gate included — spends the authority; no retry inherits it. §18.51's "intact" reading withdrawn. A future install = a new separately opened act with fresh authority. Standing: install 0 · launch 0 · sample 0 · source population 0 · container not yet produced · [D]/[E] closed.


## §18.53 — `SID FIRST-INSTALL-02` OPEN under a new act identity · authority issued (uncommitted) · `02` pin re-issued by label substitution only (59 lines, `c4b37e69…`; diff = 5 lines / 2 hunks), returned for review, NOT RUN (2026-09-16; implementation record §10.23; qualification plan §10.73)

Act identity is constitutive, not scope expansion (MAC-COMPILE-02 principle). Preparation law for the run: fresh window · `cd ~` · write the seven-line payload to `/private/tmp/sid-fi02-authority.txt` · `test -s` · `wc -l`/`wc -c` · export · only then extract/verify/invoke. Any refusal of the invoked `02` pin, the authority gate included, spends the authority. The `01` STOP transcript travels in the `02` carrier under `prior-attempts/` with its disposition, never via the `02` glob. Standing otherwise unchanged: install 0 · launch 0 · sample 0 · source population 0 · container not yet produced.


## §18.54 — `02` pin ACCEPTED (`c4b37e69…`, authority unspent, paste did not invoke it) · `02` carrier re-issued before the run (48 lines, `5ef55233…`: `01` STOP transcript under `prior-attempts/`, predecessor block in `RETURN.txt`, seal via `find` to descend the subdirectory — disclosed) · run shape HELD pending carrier review (2026-09-16; implementation record §10.25; qualification plan §10.74)


## §18.55 — `02` carrier ACCEPTED (`5ef55233…`) · seven-step run shape for `SID FIRST-INSTALL-02` ISSUED in-session (payload never in git; expected `wc -l` 7 · `wc -c` 244; `test -s` before export and before invocation) · pin not yet invoked (2026-09-16; implementation record §10.26; qualification plan §10.75)


## §18.56 — `SID FIRST-INSTALL-02` INVOKED → STOP at the pre-install harness-process precondition: the historical `.vpio02` harness (`E3B88028-…`, PID 3347) was running; every local custody gate (incl. the seven-file manifest proof) passed; `.vpio02` = 1, `.vpio02sid` = 0; instrument never invoked; install 0; container none (2026-09-16; implementation record §10.27; qualification plan §10.76)

Authority present and correct (7 lines / 244 bytes), pin `c4b37e69…`/59 verified. Under the settled rule the authority is SPENT; founder ruling owed. Cause of the running harness unknown (PID adjacent to a cluster of relaunched user apps; nothing in the lane launched it). Disposition owed: how the lingering harness is ended (manual quit vs bounded `testTerminateOnly` act vs wait); whether a STOP carrier is drafted; a future attempt = new act `03`, preconditions unrelaxed.


## §18.57 — `02` ruled STOP · SPENT (harness-process precondition; cause of the running historical harness unknown) · three drafts returned: `SID HISTORICAL-HARNESS-TERMINATE-01` pin (51 lines `4bad7211…`; one `testTerminateOnly`; PRE/POST process reads; container-bound), `02` STOP carrier (49 lines `e5934487…`; partial `$OUT`, authority metadata only, no fabricated seal, `01` lineage segregated), `FIRST-INSTALL-03` label-only pin (59 lines `9b3526c4…`; harness-absent precondition unrelaxed) (2026-09-16; implementation record §10.28; qualification plan §10.77)

`03` may not receive a run shape until the `02` STOP carrier is durable, the terminate-only act is completed, a post-termination read proves the harness absent, the `03` pin is accepted and fresh `03` authority is issued. No device act; no authority issued for any of the three.


## §18.58 — terminate-only pin AMENDED (just-in-time bound process read before the one `testTerminateOnly`; 55 lines, `576fd2b2…`) · `02` STOP carrier ACCEPTED (`5e0b755a…`, run shape issued, not yet run) · `03` pin ACCEPTED (`9b3526c4…`, authority unissued) · order: STOP carrier → terminate → post-read → `03` · terminate authority HELD (2026-09-16; implementation record §10.30; qualification plan §10.78)


## §18.59 — `02` STOP carrier in custody (`3f3dcfb40` → cherry-picked; run seal `15e71bd9…`, 10 entries, 0 mismatches; no install artefact; authority metadata only; PID 3347 bound to `E3B88028-…` in the JSON; `01` lineage sealed under `prior-attempts/`) — `03` dependency step 1 satisfied; terminate-only pin review + authority next (2026-09-16; implementation record §10.31; qualification plan §10.79)


## §18.60 — terminate-only pin ACCEPTED (`576fd2b2…`) · `SID HISTORICAL-HARNESS-TERMINATE-01` OPEN for exactly one `testTerminateOnly` · authority issued in-session (8 lines / 275 bytes expected; never in git) · seven-step run shape issued · not yet invoked (2026-09-16; implementation record §10.32; qualification plan §10.80)


## §18.61 — `SID HISTORICAL-HARNESS-TERMINATE-01` INVOKED → STOP · UI-test runner initialization failure ("Timed out while enabling automation mode") · SPENT — PRE and just-in-time reads both PASS (historical harness alive, container-bound), the one `xcodebuild test` attempted, `testTerminateOnly` body never entered, no POST read, harness state unknown since; precedent = DRIVER-01 Stage-B samples 1–4 and K00-05/06 samples 1–2 (device asleep or locked at start; lesson "awake and unlocked before the batch starts"); STOP carrier drafted (45 lines `d27d8836…`) (2026-09-16; implementation record §10.33; qualification plan §10.81)


## §18.62 — the road (founder, 2026-09-16): preserve → diagnose automation → terminate old harness → install SID → ENTRY witness → source discrimination; position between steps 1 and 2; phone reported "open and on" (2026-09-16; implementation record §10.34)


## §18.63 — step-1 STOP carrier ACCEPTED (`7606892a…`, run shape issued) · step-2 diagnostics OPEN as one read-only act (`SID_STEP2-DIAGNOSTICS-01_READ_2026-09-16.sh`, 52 lines `53b0efa2…`: terminate-01 log · xcresult · devicectl capability discovery · current device state, observation only; run shape issued) · phone state at 20:29:32 UNKNOWN, sleep/lock HYPOTHESIS ONLY · `TERMINATE-02` not drafted until step 2 lands (2026-09-16; implementation record §10.36)

## §18.64 — steps 1 + 2 LANDED and READ: terminate-01 STOP carrier (`8349553577cf15cc…`, 15/0) and step-2 diagnostics (`372e9bc51e272553…`, 24/0) in custody · mechanism LOCATED = device-side XCTest automation-mode enablement timing out at its fixed 60 s bound (`Running tests...` 20:29:41.443 → failure 20:30:41.651; no test enumerated; runner install/launch/env transport all succeeded) · cause UNKNOWN, sleep/lock HYPOTHESIS ONLY · historical harness ALIVE at 00:39:27Z, PID 3347, unperturbed · `devicectl device info lockState` / `displays` DISCOVERED as read-only device-state reads, output shape UNREAD · proposal: step-2b read-only calibration read first, then `TERMINATE-02` = accepted 01 body + just-in-time `lockState`/`displays` gate before the runner invocation; not drafted (2026-09-16; implementation record §10.37)

## §18.65 — STEP-2B DEVICE-STATE CALIBRATION OPEN AS DRAFT-ONLY (founder; authority none, read-only, `TERMINATE-02` undrafted) → draft returned `SID_STEP2B-DEVICE-STATE-CALIBRATION-01_READ_DRAFT_2026-09-16.sh` (46 lines `b00876bd…`; founder attestation file copied verbatim as evidence · `lockState`/`displays` help + raw JSON with taken-at stamps, no key parsed, nothing gated · process table · both app reads · seal · push); `TERMINATE-02` shape ruled = 01 body + labels/paths + PRE binding + just-in-time `lockState`/`displays` gates derived from observed 2b semantics + just-in-time harness binding + one `testTerminateOnly` + POST absent; NOT RUN (2026-09-16; implementation record §10.38)

## §18.66 — STEP-2B DEVICE-STATE CALIBRATION-01 ACCEPTED at `03289d89d` (`b00876bd…`/46, founder-verified) · read-only execution OPEN, authority none, device writes none · attestation = the founder's own observation at calibration time, written only after looking at the phone, phone not made to fit the wording · run shape issued (fresh window → attestation file → `test -s` → `git show 03289d89d:…` → shasum/46 → one tee'd invocation) · `TERMINATE-02` gate to be derived from observed semantics after landing; not drafted (2026-09-16; implementation record §10.39)

## §18.67 — STEP-2B EXECUTED · LANDED · READ (`2f8c16dda` → cherry-picked; seal `83928c80b7b41cdd…` 21/0): calibrated automatable tuple = `passcodeRequired:false ∧ unlockedSinceBoot:true ∧ backlightState:"activeOn"` at 00:58:10Z beside the founder's four-line attestation (locked/dark vocabulary UNOBSERVED; `unlockedSinceBoot` is a since-boot latch; gate derivable = equality against the calibrated tuple only) · ⚠️ THREE harness processes alive at 00:58Z — `.vpio02` 3347 (historical) + `.k00` 3617 (`0B07D423…`) + `.vpio01` 3618 (`6A2E406B…`) relaunched between 00:39Z and 00:58Z inside a 23-process cluster (SleepLockScreen · AppStore · FaceTime · Claude · TestFlight …), nothing in the lane launched them, cause UNKNOWN, second such cluster tonight; the same two containers were disposed by DISPOSAL-03 (§18.29) and are back · TERMINATE-01 body (lines 28/41/47), FIRST-INSTALL-03 (line 41) and [D] (line 39) would all REFUSE on their harness-0 law; `testTerminateOnly` clears only the subject bundle · founder's question: (i) foreign disposal first then TERMINATE-02, or (ii) re-scope three accepted pins to the subject container; recommendation (i) · `TERMINATE-02` NOT drafted (2026-09-16; implementation record §10.40)

## §18.68 — FOUNDER RULING: zero-harness law PRESERVED · (i) foreign harnesses first · two acts · read-only relaunch census before termination · sequence CENSUS → FOREIGN-DISPOSAL-04 → TERMINATE-02 → harness 0 → FIRST-INSTALL-03 → [D] → [E] → two drafts returned: `SID_HARNESS-RELAUNCH-CENSUS-01_READ_DRAFT_2026-09-16.sh` (58 lines `9d60cc22…`; root-free reads always, device `log collect` only under `K00_LOG_SUDO=1` per the LOG-CAL jurisdiction, else recorded SKIPPED; archive never committed) and `SID_FOREIGN-DISPOSAL-04_PIN_DRAFT_2026-09-16.sh` (68 lines `0bc098e4…`; DISPOSAL-03 runner `b198e2e37` requalified read-only; exact three-set PRE; calibrated device-state gate before each of two `testTerminateOnly` invocations `phase-a` · `vpio-01`; POST foreign 0 · `E3B88028` 1 · total 1; four app reads prove containers untouched) · frozen subjects declare `UIBackgroundModes: [audio]` only, no relaunch/restoration configuration — relaunch is external; prewarming named as a testable hypothesis only · NOT RUN · `TERMINATE-02` waits (2026-09-16; implementation record §10.41)

## §18.69 — FOUNDER RULINGS: census AMEND (collect rc + archive-state custody; `log show` only if rc=0 ∧ archive present; failure carried as evidence) + ROOT GRANTED narrowly (`K00_LOG_SUDO=1` = one `sudo log collect` only) · disposal AMEND (JIT exact process-set proof before EACH termination; MID full set 2·0·1·1; any drift = STOP; never weakened to "target exists") · sequence unchanged → amended census 70 lines `5c8526d9…` · amended disposal 80 lines `c6f42ee5…` · NOT RUN · review of the amended hashes precedes any run · a pasted takeover passage recorded as text, not ruling (2026-09-16; implementation record §10.42)


## §18.70 — TAKEOVER ENGINEERING DISPOSITION: relaunch census PASS → `.k00` / `.vpio01` relaunch cause = iOS DAS app-resume prewarming; current harness set 0; empty-target disposal/terminate acts become conditional fallbacks; SID reinstall instrument hardened at `ec60321b7`; `FIRST-INSTALL-04` drafted `81f29c59…`/59, execution CLOSED (2026-09-16; implementation record §10.43; qualification plan §10.88)

Census evidence `17141843b…` (cherry-picked `bbb543f4c`) sealed 24/24, `log collect` rc 0/archive present. Device log: `osservice<com.apple.dasd>` → `DAS Prewarm launch` → `.k00` PID 3617 and `.vpio01` PID 3618 at 20:56:17 local. Current read 01:29:51Z = harness 0. Zero-harness ENTRY law is preserved; no empty-target termination is manufactured. Because the accepted `03` outer harness-zero read was not adjacent to the actual install verb inside `k00-reinstall.sh`, witnessed asynchronous prewarming created a race. Code-only repair `ec60321b741d9a2ec0ba35b8b7134e16a6cb1f7a` adds a SID-only process read after codesign and immediately before the one install verb, raw evidence persisted, unreadable/nonzero harness count → refuse exit 5; gate 85/85. `03` remains unexecuted/unissued and is superseded as candidate. `04` pin carries the same product/custody laws plus the new instrument SHA; no install authority issued here.


## §18.71 — FIRST-INSTALL-04 PASS · SID container witnessed · duplicate later invocation refused before device · install carrier durable · ENTRY [D] container-bound (2026-09-16; implementation record §10.44; qualification plan §10.89)

Successful 01:47Z act: pin `81f29c59…`/59 · instrument `ec60321b7…` · outer harness 0 · SID JIT harness 0 immediately before the one install · `.vpio02sid` installed exactly once at container `85948DBD-BA8F-4679-950D-31767B1C24E5` · historical `.vpio02` remains at `E3B88028-…` · post harness 0 · launch/sample/source population 0. Authority spent by PASS. The later 01:56Z duplicate invocation hit the pre-existing worktree guard and had no device effect. Carrier commits `13b67d085` + completion `dab338f22`; run seal `d92a2821…`, inner install seal 12/12. ENTRY [D] bound pin = 44 lines `1d1eb08d…`, only placeholder→witnessed-container substitution; zero-harness law unchanged. [E] remains closed until [D] PASS.


## §18.72 — FOUNDER RULING: `SID ENTRY-PREP-01` OPEN → FIRST-INSTALL-04 carrier durable · SID sample-1 JIT harness-zero refusal implemented · PRELIGHT-02 / BATCH-02 drafted, NOT RUN (2026-09-16; implementation record §10.45; qualification plan §10.90)

Carrier first: FIRST-INSTALL-04 evidence is durable at `13b67d085` + `dab338f22`, SID container `85948DBD-BA8F-4679-950D-31767B1C24E5`, historical `.vpio02` unchanged. Tooling commit `36e412f8ed0136cf6ac22ee8dfb2cbd790a75a1c` changes only the batch + source gate: for SID ENTRY sample 1, an already-present harness now STOPs before the historical `testTerminateOnly`, and an additional raw process read immediately before the first driver invocation must be readable with total `VoiceKernelHarness = 0`; otherwise STOP exit 10, no terminate, no launch, no sample. All historical executable lines survive verbatim/in order; samples 2–30 and non-SID paths unchanged. Gate **86/86**. PRELIGHT-02 = 44 lines `cecaa12c…` with witnessed container and instrument `36e412f8e…`, read-only and NOT RUN. BATCH-02 = 32 lines `b8941411…`, same N=30/VP-on/Mode-L/hold-15 physiology, `K00_EXEC_AUTHORITY` still required, NOT RUN. No launch/sample/source population or downstream authority opened.


## §18.73 — `SID ENTRY-01` complete N=30 → **INDETERMINATE-ENTRY · observer-dormant**; evidence durable; PRELIGHT-02 refusal preserved; fresh retryable `03` successor conditionally opened (2026-09-16; implementation record §10.46; qualification plan §10.91)

ENTRY-01 evidence `6543484f2` → cherry-picked `a4364a842`: PRELIGHT-01 CLEAN; N=30 complete; 30 journals; seals reverified. Frozen classifier = 29 × gen-1 listen + sample-1 failure then degradation; 0 subject mismatch · 0 infrastructure · 0 ceiling breaches; 29/30 equals F-W1 29/30, one-sided deterioration Fisher p = 0.754237288136. Observer-liveness = 29 LIVE + sample 1 DORMANT (9 frames-present records, floor 10; resets 0) → **INDETERMINATE-ENTRY**, exactly under the predeclared law. The act used pre-hardening `3035c0235`, so it does not discharge the later sample-1 adjacent JIT custody law. PRELIGHT-02 later found the still-running SID harness and refused without CLEAN; its fixed-path retry was a zero-byte precondition refusal, no batch. Retryable pins at `7d4b01ee5`: PRELIGHT-03 `a5c56517…` /48 + BATCH-03 `e1ca9cb6…` /35. Gate maintenance recognizes `vpio-02-sid` as a separate 30-journal custody corpus sharing the VPIO-02 trace, and excludes ENTRY from output/source interpretation; 86/86. Founder authorizes the next levels: PRELIGHT-03 OPEN; BATCH-03 conditionally OPEN only on clean fresh PRELIGHT-03, as a new full N=30 (no top-up). Source population remains non-executable until fresh ENTRY adjudication.


## §18.73 — `SID ENTRY-BATCH-03` PARTIAL STOP/SPENT at sample 16 precondition; 15/15 completed = gen-1 listen + observer-LIVE; all-sample no-auto-terminate + bounded natural prewarm-clear wait implemented; PRELIGHT-04 / BATCH-04 drafted, execution CLOSED (2026-09-16; implementation record §10.47; qualification plan §10.91)

BATCH-03 completed 15 journals, all `gen-1 listen`, firstCallbackMs 6…10, 0 ceiling breaches, all 15 observer-LIVE with 15 source records each and resets_total 0; sample 16 was not launched. Historical instrument `36e412f8e…` attempted `testTerminateOnly` on a harness appearing before sample 16 and aborted rc=4 when it remained. Partial evidence is sealed at `driver-ledger/VPIO-02-SID-ENTRY-PARTIAL-03-20260916T022128Z/` (`2cc99d0f…`), never a top-up. `f6f02093d…` extends fail-closed no-auto-terminate/JIT zero custody to every SID ENTRY sample; `9df4c934…` adds read-only ≤60 s natural-clear polling before every SID ENTRY sample, preserving the adjacent JIT zero check; gate 87/87. PRELIGHT-04 = `6a503774…`/48, BATCH-04 = `3a745d95…`/35; fresh N=30 only, NOT RUN, authority NONE.

## §18.74 — forward review: PRELIGHT-03 refusal durable; committed 04 pin defects repaired; natural-clear wait is an amended successor law, not inherited authority (2026-09-16; implementation record §10.48; qualification plan §10.92)

PRELIGHT-03 at 02:35Z refused read-only on exactly one historical `.vpio02` harness (`E3B88028-…`), before CLEAN/seal/batch; carrier `6a4ca824a`, seal `3adaa7b8…`. Review then found the first `c5a1f2540` 04 drafts deterministically unexecutable: PRELIGHT-04 fetched the wrong branch for `9df4c934…`, and BATCH-04 required zero historical ENTRY directories even though its pinned history already contains ENTRY evidence. Forward repair only: PRELIGHT-04 `3268743e…`/48 fetches the correct branch; BATCH-04 `b9fa2971…`/46 marks act invocation before the authority gate, snapshots existing ENTRY directories, requires exactly one new ledger after its one N=30 invocation, and never treats durable history as contamination. Gate **88/88**. `9df4c934…`'s bounded natural-clear wait is read-only and preserves adjacent JIT zero custody, but it is an amended successor witness law and has **no inherited execution authority**. PRELIGHT-04/BATCH-04 execution and source population remain CLOSED until explicit founder acceptance/opening.


## §18.75 — FOUNDER RULING: `SID ENTRY-PRECONDITION-REPAIR-01` OPEN → immediate fail-closed all-sample JIT semantics implemented at `9ed72a38c`; natural-clear wait retired; execution CLOSED (2026-09-16; implementation record §10.49; qualification plan §10.93)

BATCH-03 sample 16 is adjudicated as an orchestration/precondition mismatch, not a VoiceKernel physiology failure: the global predicate could observe any `VoiceKernelHarness`, while the historical cleanup test targeted only SID. Founder ruling replaces the held natural-clear successor amendment with a stricter law: for every `vpio-02-sid` ENTRY sample, one adjacent full process-set read immediately before launch must be readable and show total harnesses = 0; any nonzero/unreadable set is preserved and STOPs before launch, with no wait, `testTerminateOnly`, termination, signal, cleanup, replacement sample or retry. Commit `9ed72a38c…`; batch SHA `88f82c91…`; gate **88/88**. Non-SID/non-ENTRY cleanup behavior remains historical. No organism/driver/reader/threshold change; no device act. Existing 04 witness drafts bound to `9df4c934…` are superseded as execution candidates by the instrument change and receive no authority.


## §18.76 — RECORD-OF-RECORD RECONCILIATION: 03:31 census found the three harnesses relaunched; 04:09 separate direct clearance proved 3→2→1→0; older XCTest disposal identities not claimed; ENTRY-05 successor pins accepted as shape (2026-09-16; implementation record §10.50; qualification plan §10.94)

Current engineering frontier is `e810d0f5a` plus reconciled evidence: `39893cad8` (second census; cherry-picked here as `d2c0295ed`) observed at 03:31:55Z exactly three `VoiceKernelHarness` processes, one each in `.k00`, `.vpio01`, `.vpio02`; `2d376c350` (clearance; cherry-picked here as `6cb1d7ca3`) then captured exact-set PRE/JIT/MID/POST custody and ended at harness 0 using native PID SIGTERM. The state change is admissible evidence but is not relabelled as `FOREIGN-DISPOSAL-04` or `TERMINATE-02`, whose accepted historical instruments were XCTest `testTerminateOnly`. Zero is bounded to the clearance POST. PRELIGHT-05 `ded53aa8…`/48 and BATCH-05 `e00529be…`/46 are accepted successor shapes against the repaired instrument `9ed72a38…`; PRELIGHT must independently prove current zero, and BATCH still requires fresh founder-authored execution authority.

## §18.77 — PRELIGHT-05 refusal preserved; BATCH-05 untouched; post-install historical-clear successor drafted (2026-09-16; implementation §10.51; qualification §10.95)

PRELIGHT-05 at `20260916T122310Z` bound both installed subjects/containers, then observed exactly one historical `.vpio02` harness (PID 5066 in custody) and refused on the accepted total-harness-zero law before CLEAN/seal. BATCH-05 marker absent = uninvoked. Refusal evidence is sealed. Historical `TERMINATE-02` is now state-incompatible because its basis requires SID absent; it is not reused. New draft `ENTRY-05-HISTORICAL-HARNESS-CLEAR-02` = 51 lines `cabec09c…`: both installed containers bound before and after; exact one historical harness; PID discovered then required unchanged at the JIT read; one native PID termination only; POST harness 0; SID install preserved; no launch/install/uninstall/XCTest/batch. Fresh founder authority still required; execution closed. PASS would return to a fresh PRELIGHT-05, never directly to BATCH-05.
