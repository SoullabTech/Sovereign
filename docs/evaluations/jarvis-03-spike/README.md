# JARVIS-03 spike — disposable

Evidence for `docs/evaluations/JARVIS_03_SEMANTICA_EVALUATION_2026-08-24.md`.
**Not production JARVIS.** Nothing here is imported by `scripts/builder/` or
`jarvis-desktop/`, and nothing is wired into `npm run jarvis:proof`.

| File | What it is |
|---|---|
| `experiment.py` | the decisive graph + correction-cascade + negative-control experiment |
| `RUN_OUTPUT.txt` | captured run — 24 passed · 0 failed |
| `SPIKE_REQUIREMENTS.txt` | the **12** packages the minimal spike needed (86 MB) |

## Reproducing

```bash
python3 -m venv .venv
.venv/bin/pip install --no-deps semantica
.venv/bin/pip install networkx rdflib pydantic loguru structlog pyyaml
.venv/bin/python experiment.py
```

⚠️ **`--no-deps` is deliberate and is itself a measurement.** A plain
`pip install semantica` pulls **42 core dependencies** including `torch`,
`transformers`, `spacy`, `sentence-transformers`, `faiss-cpu`, `opencv-python`,
`librosa` and `gensim`; the venv passed 1.8 GB before it finished and was
abandoned. Installing without them establishes what the *provenance/graph* layer
actually needs — 12 packages, 86 MB — and which modules are coupled to the ML
stack. Synthetic data only; no production system and no MAIA memory is touched.
