#!/usr/bin/env python3
"""TURN-02 DualTurn shadow sidecar.

Local-only inference. No model download, no network fallback, no transcript/audio
persistence. Reads maia.turn-predictor.v2 JSONL from stdin and writes JSONL to stdout.
"""
from __future__ import annotations

import argparse
import base64
import hashlib
import json
import math
import sys
from pathlib import Path

import numpy as np
import onnxruntime as ort

PROTOCOL = "maia.turn-predictor.v2"
MODEL_ID = "anyreach-ai/dualturn-endpointing"
SAMPLE_RATE = 24000
FRAME_SAMPLES = 1920
LICENSE = "Apache-2.0; base Mimi CC-BY-4.0"
EXPECTED_INPUTS = {"chunk", "audio_ctx", "pk", "pv", "tf_hist", "h", "c", "pos"}


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for block in iter(lambda: f.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


class DualTurnShadow:
    RF = 7680
    NL = 8
    H = 8
    HD = 64
    TFK = 260

    def __init__(self, model_path: Path, threads: int):
        so = ort.SessionOptions()
        so.intra_op_num_threads = threads
        so.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
        self.sess = ort.InferenceSession(str(model_path), sess_options=so, providers=["CPUExecutionProvider"])
        names = {item.name for item in self.sess.get_inputs()}
        if names != EXPECTED_INPUTS:
            raise RuntimeError(f"unexpected ONNX input contract: {sorted(names)}")
        self.reset()

    def reset(self) -> None:
        z = np.zeros
        self.state = {
            "audio_ctx": z((2, 0), np.float32),
            "pk": z((self.NL, 2, self.H, 0, self.HD), np.float32),
            "pv": z((self.NL, 2, self.H, 0, self.HD), np.float32),
            "tf_hist": z((2, self.TFK, 512), np.float32),
            "h": z((2, 1, 256), np.float32),
            "c": z((2, 1, 256), np.float32),
            "pos": np.array([0], np.int64),
        }

    def push(self, mono: np.ndarray) -> dict[str, float]:
        if mono.shape != (FRAME_SAMPLES,):
            raise ValueError(f"expected exactly {FRAME_SAMPLES} mono samples")
        chunk = np.stack([mono.astype(np.float32, copy=False), np.zeros_like(mono, dtype=np.float32)])
        eot, vad, fvad, ac, pk, pv, th, h, c, pos = self.sess.run(
            None,
            {
                "chunk": chunk,
                "audio_ctx": self.state["audio_ctx"],
                "pk": self.state["pk"],
                "pv": self.state["pv"],
                "tf_hist": self.state["tf_hist"],
                "h": self.state["h"],
                "c": self.state["c"],
                "pos": self.state["pos"],
            },
        )
        self.state = {"audio_ctx": ac, "pk": pk, "pv": pv, "tf_hist": th, "h": h, "c": c, "pos": pos}
        user_future = [float(v) for v in fvad[0, 0, 0]]
        return {
            "acousticYield": float(eot[0, 0, 0]),
            "acousticContinue": max(user_future),
            "vad": float(vad[0, 0, 0]),
        }


def decode_audio(message: dict) -> np.ndarray:
    seq = message.get("seq")
    at_ms = message.get("atMs")
    if not isinstance(seq, int) or seq < 0 or not isinstance(at_ms, (int, float)) or not math.isfinite(at_ms):
        raise ValueError("invalid audio metadata")
    raw = base64.b64decode(message.get("pcm16leBase64", ""), validate=True)
    if len(raw) != FRAME_SAMPLES * 2:
        raise ValueError(f"expected {FRAME_SAMPLES} PCM16 samples")
    pcm = np.frombuffer(raw, dtype="<i2").astype(np.float32)
    return pcm / 32768.0


def emit(obj: dict) -> None:
    sys.stdout.write(json.dumps(obj, separators=(",", ":")) + "\n")
    sys.stdout.flush()


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--model-path", required=True)
    ap.add_argument("--expected-sha256", required=True)
    ap.add_argument("--model-version", required=True)
    ap.add_argument("--threads", type=int, default=4)
    args = ap.parse_args()

    model_path = Path(args.model_path).expanduser().resolve()
    if not model_path.is_file():
        raise SystemExit("model path must be an existing local file")
    expected = args.expected_sha256.lower().strip()
    actual = sha256(model_path)
    if len(expected) != 64 or actual != expected:
        raise SystemExit(f"model SHA-256 mismatch: expected={expected} actual={actual}")
    if args.threads < 1 or args.threads > 32:
        raise SystemExit("threads must be in [1,32]")

    engine = DualTurnShadow(model_path, args.threads)
    model = {
        "provider": "dualturn",
        "modelId": MODEL_ID,
        "modelVersion": args.model_version,
        "weightLicense": LICENSE,
    }
    emit({"type": "hello", "protocol": PROTOCOL, "sampleRateHz": SAMPLE_RATE, "channels": 1, "frameSamples": FRAME_SAMPLES, "model": model})

    for line in sys.stdin:
        if not line.strip():
            continue
        seq = None
        try:
            message = json.loads(line)
            seq = message.get("seq")
            if message.get("type") == "reset":
                engine.reset()
                emit({"type": "reset_ack", "seq": seq})
                continue
            if message.get("type") != "audio":
                raise ValueError("unsupported message type")
            mono = decode_audio(message)
            pred = engine.push(mono)
            emit({"type": "prediction", "seq": seq, "atMs": message["atMs"], **pred})
        except Exception as exc:
            emit({"type": "error", "code": str(exc), **({"seq": seq} if isinstance(seq, int) else {})})
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
