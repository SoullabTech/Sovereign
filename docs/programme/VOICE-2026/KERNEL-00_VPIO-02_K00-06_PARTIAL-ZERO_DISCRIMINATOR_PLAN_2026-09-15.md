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
