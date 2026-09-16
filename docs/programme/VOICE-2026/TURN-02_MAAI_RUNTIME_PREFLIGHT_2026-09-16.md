# TURN-02 — MaAI Runtime Preflight

**Date:** 2026-09-16
**State:** package inspected · no model instantiated · no weights downloaded

## Mac Studio findings

- System-default `python3` is 3.9.6; current MaAI releases require Python >=3.10, so system Python is not a valid runtime.
- Existing Homebrew Python 3.11.14 is sufficient; no Python installation is required.
- Metadata-only inspection used an isolated `/private/tmp` Python 3.11 venv.
- PyPI resolved `maai==0.2.18`; the wheel itself is approximately 99 KB and MIT licensed.
- No MaAI package was installed into the Soullab repo/runtime and no predictor weights were downloaded.

## Published dependency footprint

The default package declares a broad stack including PyTorch >=2.6, Transformers 5.5.3, ONNX Runtime, Hugging Face Hub, FastAPI, PyAudio, PyQt5/PyQtGraph, pygame, matplotlib/seaborn/pandas, soundfile and related dependencies.

This is larger than the MAIA turn sidecar needs. A wholesale `pip install maai` is therefore **not accepted as the production architecture** merely because the wheel is small.

## Upstream mono path

Inspection of `maai/models/vap_mono.py` confirms the mono model is genuinely single-channel and returns raw `p_now`, `p_future`, and `vad` values. `p_now` and `p_future` are already [0,1] expected future-activity values.

Inspection of `maai/util.py` shows `mode='vap_mono', language='en'` resolves its checkpoint inside the generic `maai-kyoto/vap_en` repository and uses `hf_hub_download`. This means the convenience loader can choose/download an asset whose weight-license status is not acceptable for Soullab production.

## Ruling

MAIA will not use upstream implicit model resolution in production. Predictor activation must pass `modelCustody.ts` with:

- exact model ID
- verified weight license
- affirmative commercial-use permission
- exact absolute local weight path
- pinned SHA-256

There is no network fallback at that custody boundary.

## Headless direction

The next technical experiment should isolate only the inference path needed by TURN-02 rather than inherit MaAI's microphone GUI/server dependencies. Upstream code remains the reference implementation; any extracted/forked inference subset must preserve the MIT notice and be separately reviewed before adoption.

No live endpoint authority is authorized by this preflight.
