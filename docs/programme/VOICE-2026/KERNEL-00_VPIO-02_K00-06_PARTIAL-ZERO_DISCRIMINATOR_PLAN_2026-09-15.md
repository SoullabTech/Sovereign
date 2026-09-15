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
