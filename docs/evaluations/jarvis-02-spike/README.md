# JARVIS-02 spike — disposable

Evidence for `docs/evaluations/JARVIS_02_DEEP_AGENTS_EVALUATION_2026-08-24.md`.
**Not production JARVIS.** Nothing here is imported by `scripts/builder/` or
`jarvis-desktop/`, and nothing here is wired into `npm run jarvis:proof`.

| File | What it is |
|---|---|
| `packet.json` | a real JARVIS work packet, C1 `local-native`, read-only |
| `adapter.py` | the ExecutionAdapter — the entire seam onto Deep Agents |
| `experiment.mjs` | the decisive experiment; imports the **real** production gates |
| `RUN_OUTPUT.txt` | captured run — 20 passed · 0 failed |
| `SPIKE_REQUIREMENTS.txt` | the 52 packages the spike venv pulled in |

## Reproducing

The venv is deliberately **not** committed. `experiment.mjs` expects it at
`.venv/` beside itself:

```bash
cd docs/evaluations/jarvis-02-spike
python3 -m venv .venv && .venv/bin/pip install -r SPIKE_REQUIREMENTS.txt
node experiment.mjs
```

`experiment.mjs` hard-codes `REPO=/home/user/Sovereign` — it was written for one
throwaway run, not for portability. Change that constant to re-run elsewhere.

The worker runs on a deterministic stub model: there are no model credentials in
the spike environment, and the seam is what is under test. See §2 of the
evaluation for exactly what that does and does not prove.
