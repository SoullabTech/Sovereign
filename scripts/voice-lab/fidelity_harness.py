#!/usr/bin/env python3
"""
Voice Lab — transcript-fidelity harness (the RULER).

Purpose: an OBJECTIVE, automated release gate answering one question per provider —
"does the synthesized audio actually say the requested words?" It is validated
against known-faithful readers (Kokoro, OpenAI) BEFORE it judges any new system
(Sesame CSM), so a failure later belongs to the object, not the ruler.

Pipeline (per passage):
  1. POST /api/admin/voice-lab/synthesize  (the REAL lab path — provenance-honest)
  2. transcribe the returned audio with a LOCAL, sovereign Faster-Whisper
  3. normalize + compute Word Error Rate (WER); fidelity = 1 - WER
  4. pass/fail vs a frozen threshold

FROZEN once validated: passages, Whisper model, decode settings, and normalization
are fixed so the ruler is identical across providers and across time. Do not tune
per provider — that would defeat the point.

Objective gate (this script): health, transcript fidelity, latency, gen-success.
Subjective (human, documented separately): naturalness, presence, warmth. Fidelity
is a HARD gate — nothing passes on "sounds good" if it says the wrong words.

Usage:
  ~/csm-venv/bin/python scripts/voice-lab/fidelity_harness.py \
      --providers kokoro,openai --threshold 0.90 --admin "$LABTOOLS_ADMIN_PASSWORD"
"""

import argparse
import base64
import json
import os
import re
import sys
import tempfile
import time
import urllib.request

# ── FROZEN evaluation set (must match app/admin/voice-lab PASSAGES) ──────────
PASSAGES = [
    ("greeting",    "Welcome back. It's good to see you again."),
    ("reflective",  "Take a moment before answering. Notice what is already present."),
    ("support",     "That sounds difficult. We don't have to rush toward an answer."),
    ("curiosity",   "What feels most alive for you right now?"),
    ("celebration", "Something important has shifted since we last spoke."),
]

# ── FROZEN ruler config ──────────────────────────────────────────────────────
WHISPER_MODEL = "small.en"     # English, accurate enough that STT error ≪ TTS error
WHISPER_DEVICE = "cpu"         # ctranslate2 has no MPS backend; cpu is deterministic
WHISPER_COMPUTE = "int8"
DECODE = dict(beam_size=5, language="en", vad_filter=False)


def normalize(text: str) -> list[str]:
    """Lowercase, drop punctuation, collapse whitespace → word list.
    Applied identically to reference and hypothesis so casing/punctuation never
    counts as an error — only real word differences do."""
    text = text.lower().replace("’", "'")
    text = re.sub(r"[^a-z0-9'\s]", " ", text)   # keep apostrophes (contractions)
    return [w for w in text.split() if w]


def wer(ref: list[str], hyp: list[str]) -> float:
    """Word Error Rate via Levenshtein on word tokens."""
    if not ref:
        return 0.0 if not hyp else 1.0
    d = list(range(len(hyp) + 1))
    for i in range(1, len(ref) + 1):
        prev, d[0] = d[0], i
        for j in range(1, len(hyp) + 1):
            cur = d[j]
            d[j] = min(
                d[j] + 1,                       # deletion
                d[j - 1] + 1,                   # insertion
                prev + (ref[i - 1] != hyp[j - 1]),  # substitution
            )
            prev = cur
    return d[len(hyp)] / len(ref)


def synthesize(base_url: str, admin: str, provider: str, text: str):
    body = json.dumps({"provider": provider, "text": text, "speed": 1.0}).encode()
    req = urllib.request.Request(
        f"{base_url}/api/admin/voice-lab/synthesize",
        data=body,
        headers={"Content-Type": "application/json", "x-admin-password": admin},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=90) as r:
        data = json.loads(r.read().decode())
    ext = ".wav" if data.get("contentType") == "audio/wav" else ".mp3"
    return base64.b64decode(data["audio" + "Base64"]), ext, data.get("provenance", {})


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--providers", default="kokoro,openai")
    ap.add_argument("--threshold", type=float, default=0.90)
    ap.add_argument("--base-url", default="http://localhost:3000")
    ap.add_argument("--admin", default=os.environ.get("LABTOOLS_ADMIN_PASSWORD", ""))
    ap.add_argument("--out", default="")
    args = ap.parse_args()
    if not args.admin:
        print("ERROR: admin password required (--admin or LABTOOLS_ADMIN_PASSWORD)", file=sys.stderr)
        return 2

    from faster_whisper import WhisperModel
    print(f"[ruler] loading Faster-Whisper {WHISPER_MODEL} ({WHISPER_DEVICE}/{WHISPER_COMPUTE}) …")
    model = WhisperModel(WHISPER_MODEL, device=WHISPER_DEVICE, compute_type=WHISPER_COMPUTE)

    report = {"model": WHISPER_MODEL, "threshold": args.threshold, "providers": {}}
    overall_ok = True

    for provider in [p.strip() for p in args.providers.split(",") if p.strip()]:
        rows, fidelities = [], []
        prov_ok = True
        for pid, text in PASSAGES:
            try:
                audio, ext, prov = synthesize(args.base_url, args.admin, provider, text)
            except Exception as e:  # noqa: BLE001
                rows.append({"passage": pid, "error": str(e)}); prov_ok = False; overall_ok = False
                print(f"  {provider:10} {pid:12} SYNTH-FAIL {e}"); continue

            with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as f:
                f.write(audio); path = f.name
            t0 = time.time()
            segments, _ = model.transcribe(path, **DECODE)
            hyp = " ".join(s.text for s in segments)
            stt_ms = int((time.time() - t0) * 1000)
            os.unlink(path)

            ref_w, hyp_w = normalize(text), normalize(hyp)
            fidelity = round(1.0 - wer(ref_w, hyp_w), 4)
            fidelities.append(fidelity)
            ok = fidelity >= args.threshold
            prov_ok = prov_ok and ok
            # a silently-substituted provider corrupts the measurement — flag it
            faithful_provider = prov.get("provider") == provider and not prov.get("fallback", False)
            if not faithful_provider:
                ok = False; prov_ok = False
            rows.append({
                "passage": pid, "fidelity": fidelity, "pass": ok,
                "heard": hyp.strip(), "gen_ms": prov.get("latencyMs"),
                "stt_ms": stt_ms, "provenance_ok": faithful_provider,
            })
            print(f"  {provider:10} {pid:12} fid={fidelity:.3f} {'PASS' if ok else 'FAIL'}  heard=\"{hyp.strip()[:50]}\"")

        mean = round(sum(fidelities) / len(fidelities), 4) if fidelities else 0.0
        mn = round(min(fidelities), 4) if fidelities else 0.0
        report["providers"][provider] = {
            "gate_pass": prov_ok, "mean_fidelity": mean, "min_fidelity": mn, "rows": rows,
        }
        overall_ok = overall_ok and prov_ok
        print(f"  → {provider}: mean={mean:.3f} min={mn:.3f} gate={'PASS' if prov_ok else 'FAIL'}\n")

    out = args.out or f"scripts/voice-lab/fidelity_results_{'-'.join(report['providers'])}.json"
    try:
        with open(out, "w") as f:
            json.dump(report, f, indent=2)
        print(f"[ruler] results → {out}")
    except Exception:
        pass
    print(f"[ruler] OVERALL: {'PASS' if overall_ok else 'FAIL'}")
    return 0 if overall_ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
