# KERNEL-00 · MAC-COMPILE-05 — 2026-09-12 — GREEN on `35b0f61d0`

**Purpose:** native viability of PRE-WITNESS-04 (accepted with two amendments): one-shot generation-scoped classifier `voice_processing_reconfiguration`, deferral that touches neither graph nor policy, provenance fields, deferral as a replay automatic act.
**Operator:** founder, Mac Studio, 11:22 local. Toolchain as MAC-COMPILE-03/04. Team `ZVK2X646Z2`.

| Step | Result | Evidence (verbatim) |
|---|---|---|
| `git rev-parse --short HEAD` | `35b0f61d0` | |
| `swift build` | PASS | `Build complete! (0.89s)` |
| `swift test` | **PASS 29/29** | `Executed 29 tests, with 0 failures (0 unexpected)` (suites 6 · 1 · 7 · 3 · 3 · 8 · 1 — `ConfigurationChangeClassifierTests` 6, `ReplayTests` 8) |
| source gate | **PASS 25/25** | `Tests: 25 passed, 25 total` |
| `xcodegen generate` | PASS | |
| unsigned iOS compile | PASS | `VoiceKernel.swift:129:9: warning: result of 'try?' is unused` (the known warning, line moved by the edit, unchanged by ruling) · `** BUILD SUCCEEDED **` |
| signed device build | PASS | `Apple Development: Kelly Nezat (N9DTF6434L)` ×3 · `** BUILD SUCCEEDED **` |
| debug dylib UUID | **`37A27138-676A-3E4B-B277-FA71DE53A982`** | new code identity — THE run-4 binding (run 3's was `F00F11D4-…`) |

Single pass, no C-class defects.

```
MAC-COMPILE-05       GREEN — awaiting founder acceptance
RUN-4 BINDING        debug dylib 37A27138-676A-3E4B-B277-FA71DE53A982
DEVICE ACT           NOT AUTHORIZED until the founder accepts this record (install = acceptance by conduct, as before)
```
