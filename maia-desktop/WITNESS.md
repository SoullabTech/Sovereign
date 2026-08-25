# MAIA-D01 — Founder macOS Device Witness

**Run this on the founder Mac.** It cannot be run anywhere else, and it cannot be
substituted with unit tests, a Chromium browser, synthetic audio, or prerecorded PCM.

---

## Before you start

```bash
cd <repo>/maia-desktop
git rev-parse --short HEAD          # record this — it is the SHA you witness
npm install                          # installs Electron only
node scripts/witness-env.mjs         # §1 environment record → witness/env-<sha>-<ts>.json
```

Open the generated `env-*.json` and fill in the four `operator_notes` fields.

⚠️ If it warns **WORKING TREE IS DIRTY**, commit or stash first. A dirty tree means the walk
cannot name what it proved.

**Use the built-in Mac microphone.** No AirPods, no Bluetooth, no external interface. The first
question is whether the canonical path works under the simplest physical configuration.

## Launch

```bash
npm start
```

The console prints `[D01 witness] evidence → …/d01-witness-<ts>.jsonl` on the first
**Start listening**. That file is the evidence; the on-screen event list is a convenience.

Confirm before speaking: window opens · event list responds · **Start listening** prompts for
microphone permission.

---

## The walk

### 1 · Microphone (§3)
Grant permission. Expect, in order: `voice_mic_granted` → `voice_listening_started` →
`voice_audio_started` → `voice_speech_started` once you speak.

⛔ **If the microphone does not open, STOP.** Classify it as defect class **A** (§12) before
touching VAD or transcription. Do not tune anything.

### 2 · Calibration (§4) — 20–30 seconds
Speak normally · pause **2 s** · speak · pause **5 s** · speak · stop.

Watch for: did either pause end the epoch? (`voice_recognition_ended` mid-sample is **wrong**.)
Do not change thresholds because a pause *feels* slow — only if segmentation is concretely broken.

### 3 · The monologue (§5) — 2–5 minutes, ~3 preferred
Speak as you actually speak to MAIA. Not a script. Include hesitations, self-corrections,
several 3–6 s silences, **one ~8 s reflective pause with the same thought resumed after it**,
natural volume variation, and a deliberate finish.

### 4 · Tail integrity (§6)
At least once: start a phrase, **pause mid-unfinished-thought**, and create a boundary —
unplugging/disabling the input device is the safe seam this build exposes (the renderer reports
`track_ended` / `track_muted`).

Then check the evidence, not the transcript: every `voice_recognition_ended` with
`tailChars > 0` must carry `tailOutcome: "salvaged"` or `"lost"`. A silent disappearance is **RED**
even if the final text reads fine.

### 5 · User stop (§7)
Stop deliberately mid-speech. Then **Start listening** again and speak. Epoch 2 must not carry
epoch 1's material.

### 6 · Boundary/restart (§8)
Exercise one real boundary — a device removal, or point `MAIA_TRANSCRIBE_URL` at a dead port
before launch to force a genuine transcription failure. Do not manufacture failures outside
these seams.

### 7 · IPC/backpressure (§9)
During the monologue, watch Activity Monitor: main-process CPU, memory growth, renderer
responsiveness, latency drift. **Do not implement batching.** Record what you see.

---

## Judge it

```bash
node scripts/witness-verify.mjs witness/d01-witness-<ts>.jsonl
```

Three verdicts, and **UNWITNESSED is not a pass** — a criterion the walk never reached cannot
close. The script exits non-zero on either FAIL or UNWITNESSED.

Criterion 11 (no renderer authority expansion) reads `SEE SOURCE SUITE`: it is a source property
the event stream cannot show. `npm test` proves it.

---

## If it fails

Classify **before** patching (§12): **A** device acquisition · **B** VAD · **C** audio framing ·
**D** IPC transport · **E** transcription transport · **F** tail integrity.

Patch only the demonstrated defect — do not expand into D02. Then: new SHA · re-run `npm test`
(must stay green) · re-run the affected negative controls · **repeat the physical walk**.

`works but needs later tuning` does not block closure. `cannot preserve a natural utterance` does.

## What to send back

The `env-*.json`, the `d01-witness-*.jsonl`, the verifier output, and your own answer to the one
question no script can judge: **was the monologue real speech, and did it feel like being heard?**
