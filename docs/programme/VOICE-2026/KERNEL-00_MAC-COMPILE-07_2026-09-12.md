# KERNEL-00 · MAC-COMPILE-07 — 2026-09-12 — GREEN on `24a6fcfa1` (P5-B0 removal control)

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
| signed device build — attempt 2 | **REFUSED PRE-COMPILE (operator cwd)** | run from `~/MAIA-SOVEREIGN` rather than `ios/VoiceKernelHarness`: `xcodebuild: error: 'VoiceKernelHarness.xcodeproj' does not exist.` No compile occurred. |
| debug dylib UUID (unsigned product, 12:28 build) | `CC0D3604-7902-373E-A2BB-2C093D9BF804` | read after attempt 2; belongs to the UNSIGNED build product. Provisional — the run-6 binding is the UUID read after the signed build succeeds. |
| signed device build — attempt 3 (12:31) | **PASS** | from `ios/VoiceKernelHarness`, `-destination 'id=00008140-00163D9922E0801C' DEVELOPMENT_TEAM=ZVK2X646Z2` · `** BUILD SUCCEEDED **` |
| debug dylib UUID (signed product) | **`CC0D3604-7902-373E-A2BB-2C093D9BF804`** | **the run-6 binding** — identical to the unsigned product's UUID (same pattern as MAC-COMPILE-04: signing does not move the dylib identity). Run 5's was `11A057AA-…`. |
| debug dylib UUID | **OWED** | run-6 binding |

```
MAC-COMPILE-07       GREEN — build · test 30/30 · gate 32/32 · xcodegen · unsigned + signed BUILD SUCCEEDED · one known warning
                     two pre-compile refusals recorded (destination id given as the devicectl id — instruction defect; wrong cwd) — no compile occurred on either; not kernel evidence
RUN-6 BINDING        debug dylib CC0D3604-7902-373E-A2BB-2C093D9BF804
FOUNDER ACCEPTANCE   GIVEN (explicit: record read, AudioGraph.swift delta inspected against 4596b9bdb, "Accepted") AND by conduct (signed artifact installed)
                     signing: Apple Development: Kelly Nezat (N9DTF6434L) · iOS Team Provisioning Profile: * (08a653d1-…) · TeamIdentifier ZVK2X646Z2 · Identifier life.soullab.voicekernel.k00
                     install: bundle container 977ED940-4F17-4129-869D-0DA71BB3FC00 · databaseUUID 42158240-… · databaseSequenceNumber 4224 · post-install: installed, NOT running (cold process available)
RUN 6                READY — 6a VP ON · 6b VP OFF · 6a-2 VP ON if 6a listens; predeclared table governs
```
