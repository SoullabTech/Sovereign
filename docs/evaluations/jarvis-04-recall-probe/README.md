# JARVIS-04 recall probe — substrate-side measurement

> Companion to `../jarvis-04-spike/` (candidate-side, commit `edde4ff`). Neither replaces the other.

Measures the recall system that **exists now**, by executing the real canonical modules
(`jarvis-runtime-store.mjs`, `epistemic-guard.mjs`, `jarvis-context.mjs`) against an isolated
`AIN_DELEGATION_HOME` with synthetic data. Production untouched; nothing adopted.

```bash
AIN_DELEGATION_HOME=/tmp/j04-home JARVIS_ROOT=/path/to/Sovereign node probe.mjs
```

**Reading the output.** `✖`/`FAIL` means *the capability is absent* — that is the measurement, not
a defect in the probe. `established: 9 · unmet: 9`.

⚠️ **The probe was wrong four times before it was right.** It initially reported four capabilities
as present that do not exist. Each false positive and its correction is recorded in §4 of the
evaluation report — they are evidence about how easily a recall audit flatters itself, and are
deliberately preserved rather than quietly fixed.
