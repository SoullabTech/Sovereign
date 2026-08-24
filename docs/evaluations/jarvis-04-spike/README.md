# JARVIS-04 spike — disposable

Evidence for `docs/evaluations/JARVIS_04_AGENT_MEMORY_EVALUATION_2026-08-24.md`.
**Not production JARVIS.** Nothing here is imported by `scripts/builder/` or
`jarvis-desktop/`; nothing is wired into `npm run jarvis:proof`.

| File | What it is |
|---|---|
| `adversarial.py` | the adversarial record — same cases against the candidate and against JARVIS's real guard |
| `RUN_OUTPUT.txt` | captured run — 18 passed · 0 failed · 4 UNKNOWN |
| `SPIKE_REQUIREMENTS.txt` | the 35 packages `mem0ai` pulled in (207 MB) |
| `TENCENTDB_NPM_REGISTRY_RECORD.json` | the npm registry record showing publication and unpublication six minutes apart |

## Reproducing

```bash
python3 -m venv .venv && .venv/bin/pip install -r SPIKE_REQUIREMENTS.txt
MEM0_TELEMETRY=False .venv/bin/python adversarial.py
```

⚠️ **Always set `MEM0_TELEMETRY=False`.** It defaults to `"True"` and posts to
`https://us.i.posthog.com`. It was disabled throughout the evaluation.

`adversarial.py` shells out to `scripts/builder/epistemic-guard.mjs` at
`/home/user/Sovereign` for section D; change `REPO` to re-run elsewhere.

⚠️ Four cases are reported `UNKNOWN` rather than stubbed. In this unit the model
*is* the mechanism under test, so a stub model would have authored the verdict
instead of measuring it — the opposite of the JARVIS-02 spike, where a stub was
the correct instrument because the adapter seam was under test.
