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
| signed device build — attempt 1 | **FAILED PRE-COMPILE (instruction defect, not a kernel defect)** | `xcodebuild: error: Unable to find a device matching the provided destination specifier: { id:A0736AC8-793B-516F-AC72-C076DB6CEE38 }` — the instruction supplied the `devicectl` identifier; Xcode's destination id for the same phone is `00008140-00163D9922E0801C` (`name:Kelly Nezat’s iPhone`, listed in the error). Same mismatch as MAC-COMPILE-02 Appendix A; the remote session repeated it in its instruction. No compile occurred. |
| signed device build — attempt 2 | OWED | rerun with `-destination 'id=00008140-00163D9922E0801C'` |
| debug dylib UUID | **OWED** | run-6 binding |

```
MAC-COMPILE-07       PARTIAL — build · test 30/30 · gate 32/32 · xcodegen · unsigned GREEN; signed attempt 1 refused on a destination-id mismatch (instruction defect); attempt 2 + dylib UUID owed
DEVICE ACT           NOT AUTHORIZED until the signed step is recorded and the founder accepts this record
```
