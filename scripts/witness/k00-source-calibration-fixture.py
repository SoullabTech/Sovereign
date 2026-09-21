#!/usr/bin/env python3
"""Generate/verify the sealed SOURCE LEVEL-CALIBRATION-01 master fixture.

The production fixture is closed by this script:
  48 kHz · mono PCM16 · 997 Hz · 250 ms on / 250 ms off · 180 s · 0.70 FS peak.

No phone, CoreAudio, AVAudioSession, or runtime state is touched here.
The generated file is sealed by SHA-256 during preflight and that exact file
must be reused by the later calibration act.
"""
from __future__ import annotations

import argparse
import array
import hashlib
import json
import math
import os
import struct
import sys
import tempfile
import wave

RATE = 48_000
CHANNELS = 1
SAMPLE_WIDTH = 2
FREQUENCY_HZ = 997.0
GATE_MS = 250
GATE_SAMPLES = RATE * GATE_MS // 1000
DURATION_S = 180
FRAMES = RATE * DURATION_S
AMPLITUDE_FS = 0.70
PEAK_INT = round(AMPLITUDE_FS * 32767.0)


def sha256(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def generate(path: str, seconds: int = DURATION_S) -> None:
    frames = RATE * seconds
    phase = 0.0
    phase_inc = 2.0 * math.pi * FREQUENCY_HZ / RATE
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    with wave.open(path, "wb") as w:
        w.setnchannels(CHANNELS)
        w.setsampwidth(SAMPLE_WIDTH)
        w.setframerate(RATE)
        for start in range(0, frames, RATE):
            n = min(RATE, frames - start)
            buf = bytearray(2 * n)
            for j in range(n):
                idx = start + j
                gated_on = ((idx // GATE_SAMPLES) % 2) == 0
                sample = round(AMPLITUDE_FS * 32767.0 * math.sin(phase)) if gated_on else 0
                struct.pack_into("<h", buf, 2 * j, int(sample))
                phase += phase_inc
                if phase >= 2.0 * math.pi:
                    phase -= 2.0 * math.pi
            w.writeframesraw(buf)


def verify(path: str, seconds: int = DURATION_S) -> dict:
    expected_frames = RATE * seconds
    on_samples = off_samples = 0
    off_nonzero = 0
    peak = 0

    with wave.open(path, "rb") as w:
        meta = {
            "channels": w.getnchannels(),
            "sampleRate": w.getframerate(),
            "sampleWidthBytes": w.getsampwidth(),
            "frames": w.getnframes(),
            "seconds": w.getnframes() / w.getframerate(),
        }
        exact_meta = (
            meta["channels"],
            meta["sampleRate"],
            meta["sampleWidthBytes"],
            meta["frames"],
        ) == (CHANNELS, RATE, SAMPLE_WIDTH, expected_frames)
        if not exact_meta:
            raise ValueError(f"fixture metadata mismatch: {meta}")

        index = 0
        while True:
            raw = w.readframes(RATE)
            if not raw:
                break
            vals = array.array("h")
            vals.frombytes(raw)
            if sys.byteorder != "little":
                vals.byteswap()
            for v in vals:
                gated_on = ((index // GATE_SAMPLES) % 2) == 0
                av = abs(int(v))
                peak = max(peak, av)
                if gated_on:
                    on_samples += 1
                else:
                    off_samples += 1
                    if v != 0:
                        off_nonzero += 1
                index += 1

    expected_on = (expected_frames // (2 * GATE_SAMPLES)) * GATE_SAMPLES
    remainder = expected_frames % (2 * GATE_SAMPLES)
    expected_on += min(remainder, GATE_SAMPLES)
    expected_off = expected_frames - expected_on

    if on_samples != expected_on or off_samples != expected_off:
        raise ValueError("gate duty/count mismatch")
    if off_nonzero != 0:
        raise ValueError(f"off-gate contains {off_nonzero} non-zero samples")
    if not (PEAK_INT - 2 <= peak <= PEAK_INT + 2):
        raise ValueError(f"peak {peak} is not the declared 0.70 FS peak {PEAK_INT}")

    result = {
        **meta,
        "carrierHz": FREQUENCY_HZ,
        "gateMsOn": GATE_MS,
        "gateMsOff": GATE_MS,
        "modulationHz": 2.0,
        "duty": 0.5,
        "amplitudeFS": AMPLITUDE_FS,
        "peakInt": peak,
        "offNonzeroSamples": off_nonzero,
        "sha256": sha256(path),
    }
    return result


def selftest() -> bool:
    with tempfile.TemporaryDirectory() as td:
        a = os.path.join(td, "a.wav")
        b = os.path.join(td, "b.wav")
        generate(a, seconds=2)
        generate(b, seconds=2)
        va = verify(a, seconds=2)
        vb = verify(b, seconds=2)
        checks = [
            ("repeatable bytes in one runtime", va["sha256"] == vb["sha256"]),
            ("exact 2 s frame count", va["frames"] == 96_000),
            ("off gate is digital zero", va["offNonzeroSamples"] == 0),
            ("declared peak", PEAK_INT - 2 <= va["peakInt"] <= PEAK_INT + 2),
        ]
        for name, ok in checks:
            print(("ok " if ok else "FAIL ") + name)
        print(f"selftest: {sum(ok for _, ok in checks)}/{len(checks)}")
        return all(ok for _, ok in checks)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--out")
    ap.add_argument("--verify")
    ap.add_argument("--selftest", action="store_true")
    args = ap.parse_args()

    if args.selftest:
        return 0 if selftest() else 1

    if bool(args.out) == bool(args.verify):
        ap.error("provide exactly one of --out or --verify")

    if args.out:
        generate(args.out)
        result = verify(args.out)
    else:
        result = verify(args.verify)

    print(json.dumps(result, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
