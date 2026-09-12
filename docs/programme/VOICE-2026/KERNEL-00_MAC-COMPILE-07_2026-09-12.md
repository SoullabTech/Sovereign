# KERNEL-00 · MAC-COMPILE-07 — 2026-09-12 — on `24a6fcfa1` (P5-B0 removal control) — PARTIAL, signed step owed

**Purpose:** native viability of P5-B0 (the pre-VP `input.outputFormat(forBus: 0)` read removed; nothing else moved).
**Operator:** founder, Mac Studio, 12:28 local. Toolchain as MAC-COMPILE-03…06 (Xcode 17C529, iOS 26.2 SDK). Team `ZVK2X646Z2`.
**Note:** the checkout carried a local modification to `ios/VoiceKernelHarness/Harness/Info.plist` (`M` on checkout) — an operator-side artefact of an earlier `xcodegen` run, not part of the subject; recorded, not acted on.

| Step | Result | Evidence (verbatim) |
|---|---|---|
| `git rev-parse --short HEAD` | `24a6fcfa1` | |
| `swift build` | PASS | `Build complete! (1.22s)` |
| `swift test` | **PASS 30/30** | `Executed 30 tests, with 0 failures (0 unexpected)` (suites 6 · 1 · 7 · 3 · 3 · 8 · 1 · 1 — `StartTraceTests.testTheTraceNamesExactlyTheTwelveSeamsPlusEngineCreatedWithNoPreVPFormatRead` passed) |
| source gate | **PASS 32/32** | `Tests: 32 passed, 32 total` — P5-B0 block ×4 green |
| `xcodegen generate` | PASS | `Created project at …/VoiceKernelHarness.xcodeproj` |
| unsigned iOS compile | PASS | `VoiceKernel.swift:138:9: warning: result of 'try?' is unused` (known, unchanged) · `** BUILD SUCCEEDED **` |
| signed device build | **NOT YET IN EVIDENCE** | the founder's paste ends at `Resolved source packages: VoiceKernel …` for the signed invocation; result line not received |
| debug dylib UUID | **OWED** | run-6 binding |

```
MAC-COMPILE-07       PARTIAL — build · test 30/30 · gate 32/32 · xcodegen · unsigned GREEN; signed build + dylib UUID owed
DEVICE ACT           NOT AUTHORIZED until the signed step is recorded and the founder accepts this record
```
