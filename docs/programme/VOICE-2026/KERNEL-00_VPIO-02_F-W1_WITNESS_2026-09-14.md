# KERNEL-00 · VPIO-02 · F-W1 WITNESS — N=30 AUTOMATED-COLD-LAUNCH (2026-09-14)

**Status:** EXECUTED (founder, Mac) · RECEIVED and INDEPENDENTLY VERIFIED HERE · frozen-table READING RETURNED · **ADJUDICATION OWED (founder)**. Nothing downstream is opened by this record.

**Subject:** organism `ac12dedf4b7b4efc9855c08bb4285a704e7039f1` · instrument `08483cfe4f6c3e98198805337ced99bae92ce911` · bundle `life.soullab.voicekernel.vpio02` · FIRST-INSTALL-02 container `E3B88028-A10F-46B1-AB27-CF0A1F83FB78` · dylib UUID `B346F448-A2A8-30DB-9683-B732A80D7899` · stratum `AUTOMATED-COLD-LAUNCH · VPIO-02` · Mode L · VP ON · hold 15 s · N=30. Ruling: plan §13.18.

## 1. Custody

Founder branch `feature/vpio02-f-w1-evidence-20260914` at `fa13d9c860a2635c8f980478e50b847d2b8d3429` → cherry-picked here with `-x` as `8c6254d72` (187 files, 99 268 insertions, nothing else). Core hashes recomputed in this container, all equal to the founder's:

| file | SHA-256 |
|---|---|
| `driver-ledger/VPIO-02-20260914T223500Z/ledger.md` | `419a1bfc935cd2e451983c62a367d4e8abc925e639528e1ae10a8d2831f86a15` |
| `…/batch.log` | `e4fd0543d28768fa80e0845404a80d1e9ea6dcffac988671a5539b20ab053341` |
| `…/sample-timing.tsv` | `81cc4fcea318626714d98b68ecce51163863887e069996e0343a871783e752c7` |
| `driver-ledger/VPIO-02-preflight-20260914T223331Z/apps.json` | `9fddfec2ea43f022f38e1b92879fdd6fdd323ebaa5d7a51c99726994d3b7d949` |
| `…/processes.json` | `2a8c45924df019a88a7de978e39bf1701b05fe57f288b73567ef5733de899d87` |

Batch directory contents: `ledger.md` · `batch.log` (94 lines) · `build-for-testing.log` · 30 `sample-N-xcodebuild.log` · `journals/` (30 files, `not-a-sample/` absent) · `daemons/` (120 files = 30 × before/after × txt/json) · `sample-timing.tsv` (30 rows).

## 2. Preflight (§13.18, read-only, founder transcript + files)

`git rev-parse HEAD` = `08483cfe4…` ✓ · `instrument identical to 08483cfe4` ✓ · `container E3B88028 lines: 1` (re-read here from `apps.json`: 1; the only app under the bundle id is `VoiceKernel VPIO-02` 0.0.1) ✓ · `harness processes: 0` (re-read here from `processes.json`: 0) ✓. Preflight stamp `22:33:31Z`; batch started `22:35:01Z` (90 s later). The §13.8/§13.18 gap warning `harness process present — attempting terminate-only via driver` appears in **no** batch or sample log (0 files).

## 3. Batch mechanics (re-read here)

Ledger header: `stratum=AUTOMATED-COLD-LAUNCH · N=30 · vp=on · mode=L · hold=15s · w4=off · subject=vpio-02 · bundle=life.soullab.voicekernel.vpio02 · device=A0736AC8-… · xcodeDest=00008140-…`; installed harness identity read by the batch = `VoiceKernel VPIO-02 · life.soullab.voicekernel.vpio02 · 0.0.1 · 1`; `last reinstall: 20260914T221040Z` (= FIRST-INSTALL-02). 30/30 invocations; `batch complete` at `22:58:02Z` (23 min); exit 0. No `PRECONDITION-FAILED`, no `DRIVER/INFRASTRUCTURE FAILURE` in ledger or batch log. Daemon snapshots ×60: `audiomxd` PRESENT by PID, `mediaserverd`/`coreaudiod` NOT PRESENT IN THE DOCUMENTED JSON WINDOW (A2 wording), every listing rc=0.

## 4. Independent verification of all 30 journals (this container, instrument at HEAD = `08483cfe4`)

- **Hashes:** 30/30 journal SHA-256 recomputed = the ledger's column.
- **Classifier reproduction:** `k00-ledger.py --stratum AUTOMATED-COLD-LAUNCH --index i --mode L --subject vpio-02` re-run on every journal → 30/30 rows byte-identical to the founder's ledger rows.
- **Subject identity:** every journal's first start carries exactly the 14 VPIO-02 trace steps in order (`unit_created … is_running_immediate`), `input_format_read` stamped `afterProbeInitialize=true` with `48000.0 / 1` ×30 (the probe read that VPIO-01 never reached); `callbacks_armed` `maximumFramesPerSlice=4096 · inputScratchCapacity=4096` ×30 (G9 live); `vp_properties_set` `bypassReadBack=0 · status=0` ×30; `graph_started` gen 1 `voiceProcessing=true · ioRunning=true · inputSampleRate=48000.0 · inputChannels=1 · inputFormatValid=true` ×30. Vocabulary: `ioRunning` present, `engineRunning` absent, no engine record name, in all 30. `io_running_observed` gen 1: 10 ticks ×30, `ioRunning=true` at every tick. Recorder shape noted, not a defect: trace records are stamped with the generation counter *before* the new generation begins (gen-1 start traces read `generation: 0`; sample 1's gen-2 traces read `1`); the classifier accounts for it (30/30 reproduction).
- **Cold:** `cold=True` ×30. **Refusals:** 0. **Resets / interruptions:** 0. **Orphans:** 0.
- **First input callback (gen 1):** present ×30; `msSinceStartReturn` 1 · 1 · 1 · 2 · 2 · 2 · 4 · 5 · 5 · 5 · 5 · 6 ×7 · 7 ×4 · 8 ×4 · 9 · 9 · 10 · 10 (range 1–10 ms; founder's reading confirmed).
- **Classes:** 29 × `gen-1 listen` · 1 × `failure then recovery` (sample 1) · 0 degradation · 0 other. Sequence `FLLLLLLLLLLLLLLLLLLLLLLLLLLLLL`.
- **Listening latency (Enter → `listening`), gen-1 takes:** 319 · 328 · 328 · 329 · 330 · 331 · 331 · 332 · 334 · 336 · 337 · 338 · 338 · 338 · 340 · 340 · 341 · 341 · 341 · 343 · 344 · 344 · 345 · 346 · 346 · 349 · 351 · 351 · 360 ms (median 338; every one under the 1500 ms K00-03 entry ceiling by ≥ 1.1 s; compare the engine strata's 409–529 ms gen-1 listens).
- **Held:** `listeningHeldAtExport=True` ×30 · `listeningLostLater=False` ×30 · last floor at export `listening` ×30 (the recovery row included).

## 5. Sample 1 — the one non-take, read in full (`K00-e247584e`, 204 records)

Gen 1 initialized and started cleanly (`graph_started` at Enter+458 ms, 48 kHz / 1 ch, `ioRunning=true`), first callback at 2 ms, callbacks flowing at ~10/s (104 by the first health sample) — **but every frame digital zero** (`input_health_sample`: `callbacks=104 · digitalZero=104 · peakMax=0`, `input_flow=suspect` from the first callback). The supervisor's existing `input_dead` window fired at Enter+2459 ms (`sinceMs=2001`) → `recovery_requested input_dead` → `recovery_scheduled attempt 1 · 500 ms · nextGeneration 2` → floor `recovering`; 56 further `input_dead` requests coalesced (`recovery_request_coalesced`, ~10 ms cadence) while the request was pending — the one-owner kernel neither looped nor spent more than attempt 1. Two `route_changed` observations on the unchanged `builtInSpeaker/builtInMic` route at Enter+3155/3244 ms (the rebuild's own session traffic; no act taken on them — the §11 eligibility guard held: same ports). Gen 2 `graph_started` at Enter+3399 ms (`priorGeneration 1`), first callback 2 ms, healthy flow at Enter+4172 ms → `listening` (`recovery_flow_reobserved`), held to export. Mechanically `failure then recovery`, exactly as the ledger says; not a hidden take.

⭐ **Antecedent recorded, not attributed (n=1):** sample 1 is the **only** journal of the 30 carrying an `app_lifecycle willResignActive` after Enter — at **0 ms relative to gen-1 `graph_started`** — with `didBecomeActive` 4 074 ms later (after gen 2 was already listening). No other sample has any lifecycle record after Enter. Whether the resign-active caused the digital-zero input (a backgrounded app's input being muted by the OS would be the ordinary reading) is an INFERENCE; whether the driver's first launch after a fresh `build-for-testing` provoked an overlay is UNKNOWN; the census firewall applies (external, already-recorded state — tier FIRST). Candidate evidence field for a later census pass; no class change; no mechanism claim.

## 6. F-W1 frozen-table reading (plan §8 item 2 / §13.18) — reading only, NOT adjudication

Valid rows 30/30 (0 infrastructure) → threshold row **30 valid · ≥ 24 takes = CLEAR IMPROVEMENT**. Observed **29/30**. One-sided Fisher exact (takes vs misses, VPIO-02 against each frozen engine population separately, recomputed here from the 2×2 tables):

| stratum | takes | p (one-sided, greater) |
|---|---|---|
| A | 14/29 | 2.18e-05 |
| B | 15/28 | 1.15e-04 |
| C | 16/29 | 1.59e-04 |
| R1 | 13/30 | 3.98e-06 |

All four `< .05`; the founder's four values reproduced to the digit. VPIO-01's 0/30 stays a closed failed population — not pooled, not substituted, not a threshold. **Mechanical band: CLEAR IMPROVEMENT on the K00-04 entry axis.** This is the predeclared table applied to the numbers and nothing more: the pass rule, thresholds and acceptance obligations are unchanged; K00-05/06/11/12/13/15 are unmeasured on this subject; KERNEL-00 is NOT accepted by this reading.

## 7. Standing after this record

VPIO-02 F-W1 batch COMPLETE · evidence RECEIVED, VERIFIED, READ · **adjudication OWED (founder)** · route / interruption / reset / endurance acts NOT AUTHORIZED · reinstall NOT AUTHORIZED · new sample NOT AUTHORIZED · `.vpio01` FROZEN · historical K00/R1 UNTOUCHED · organism `ac12dedf4` / instrument `08483cfe4` unchanged · KERNEL-00 NOT ACCEPTED · KERNEL-01 / BENCH-01 / BRIDGE-01 / MIGRATE-01 CLOSED · JOP-04 UNTOUCHED.

## 8. C-D19 — gate partition defect exposed by this evidence (gate only; instrument and organism untouched)

On cherry-picking the 30 VPIO-02 journals, the source gate's corpus-regression test went red (59/60): it defined "engine-era journals" as *every tracked journal outside the VPIO-01 directory*, so the new population fell into that set and — correctly — read `gen-1 listen` / `failure then recovery` under `vpio-02`, which the stale expectation (`SUBJECT-MISMATCH` or infrastructure only) did not admit. The classifier was right; the gate's partition predated a second VPIO population. Correction, in `__tests__/voice-kernel-00-source-gates.test.ts` only: the VPIO-02 batch directory is named explicitly, its 30 rows are pinned as produced (29 × gen-1 listen · 1 × failure then recovery under `vpio-02`; 30 × SUBJECT-MISMATCH under `vpio-01`), and "engine-era" = everything outside both VPIO directories. Gate 60/60 read after the amendment; `scripts/witness/*`, `ios/VoiceKernelDriver`, `ios/VoiceKernel`, `ios/VoiceKernelHarness` verified byte-identical to `08483cfe4`. No ledger, journal or classifier byte changed.

## 9. FOUNDER ADJUDICATION (2026-09-14) — VPIO-02 F-W1 PASS · CLOSED

**Verbatim substance (founder):** "I accept the §13.19 witness as read." Population 30 valid · gen-1 listen 29 · failure then recovery 1 · infrastructure 0 · degradation 0 · subject mismatch 0 → **F-W1 band CLEAR IMPROVEMENT · K00-04 entry axis PASS · F-W1 SPENT.** "The predeclared bar was ≥24/30; VPIO-02 produced 29/30, and the one-sided Fisher comparison is < .05 against A, B, C, and R1 independently. Nothing post-hoc is needed to earn that result."

**Sample 1 (ruled):** stays exactly what the ledger calls it — gen 1 initialized/started, first callback 2 ms, `ioRunning=true`, input remained digital zero → existing `input_dead` supervisor → one scheduled recovery → gen 2 → healthy listening. A valid `failure then recovery` row; not an invalid sample, not a hidden take. The unique `willResignActive` immediately after gen-1 start is preserved: *observed* (sample 1 alone), *plausible inference* (backgrounding may explain its zero input), *not established* (causation). **No follow-up lifecycle experiment is authorized by this adjudication.**

**What this result establishes (founder):** "The corrected VPIO-02 lower substrate has now demonstrated reliable, healthy entry on the physical microphone path." Unlike VPIO-01, VPIO-02 reached and exercised, repeatedly: probe initialize → resolved 48 kHz / 1 ch · uninitialize → guard · client-format configuration · callback arming · final initialization · `AudioOutputUnitStart` · running state · real input callbacks · healthy microphone physiology. **The lower-path capability question VPIO-01 left unmeasured is answered YES for the entry axis.**

**C-D19:** ACCEPTED as gate maintenance ("not VPIO-01" no longer meant "engine-era"; naming both VPIO corpora and leaving classifier/evidence untouched is the correct correction). Earns no behavioural evidence; changes no F-W1 result.

**Record correction (prospective, founder):** §4 above calls 1500 ms the "K00-03 entry ceiling" — a wording defect. The governed entry axis is **K00-04**: **K00-04 entry ceiling = 1500 ms.** §4 is not rewritten; this line governs. The 319–360 ms latencies are descriptive supporting evidence only; the PASS rests on the frozen F-W1 rule, not on any new latency comparison.

**Not established:** K00-05 output/cancel · K00-06 duplex physiology · K00-11 route change · K00-12 interruption · K00-13 media-services reset · K00-15 endurance — all UNMEASURED on VPIO-02. **KERNEL-00 NOT ACCEPTED.**

**Standing (verbatim):** VPIO-01 CLOSED · FAILED · 0/30 · VPIO-02 F-W1 CLOSED · PASS · 29/30 · K00-04 PASS on VPIO-02 · lower-path entry QUALIFIED · new sample NOT AUTHORIZED · route/interruption NOT AUTHORIZED · reset/endurance NOT AUTHORIZED · reinstall NOT AUTHORIZED · `.vpio01` FROZEN · historical K00/R1 UNTOUCHED · KERNEL-00 NOT ACCEPTED. "The next programme decision is no longer 'can VPIO listen?' It is whether to open the next bounded qualification act for output/cancellation and duplex physiology — K00-05 / K00-06. That act is not opened by this ruling."
