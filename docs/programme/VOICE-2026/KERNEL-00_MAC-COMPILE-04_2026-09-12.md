# KERNEL-00 · MAC-COMPILE-04 — 2026-09-12

**Purpose:** native viability of PRE-WITNESS-03 (A exit guard · B bounded route recovery · C VP control · D direct-rebuild gate) before any device act.
**Operator:** founder, Mac Studio, `~/MAIA-SOVEREIGN`. Toolchain as MAC-COMPILE-03 (Xcode 17C529 · iOS 26.2 SDK · target ios16.0). Team `ZVK2X646Z2`.

## Pass 1 — subject `32047f9f5` (10:53 local)

| Step | Result | Evidence (verbatim) |
|---|---|---|
| `swift build` | **PASS** | `[3/4] Compiling VoiceKernel VoiceKernel.swift` · `[4/4] Emitting module VoiceKernel` · `Build complete! (0.80s)` |
| `swift test` | **FAIL — C4** (test file only) | `PureLogicTests.swift:301:13: error: cannot find 'ev' in scope` ×3 · `error: fatalError`. The new W4 orphan test called `ev(...)`, a helper `private` to `ReplayTests`, from a different class. **Kernel sources compiled; no kernel defect.** |
| source gate | **PASS 20/20** | `Tests: 20 passed, 20 total` |
| `xcodegen generate` | PASS | `Created project at …/VoiceKernelHarness.xcodeproj` |
| unsigned iOS compile | **PASS** | `VoiceKernel.swift:121:9: warning: result of 'try?' is unused` (known, unchanged) · `** BUILD SUCCEEDED **` |
| signed device build | **PASS** | `Signing Identity: "Apple Development: Kelly Nezat (N9DTF6434L)"` ×3 · `** BUILD SUCCEEDED **` |
| debug dylib UUID | `F00F11D4-E589-3F06-9919-5609C11DF6C3` | new code identity (run-2's was `1AEBEE45-…`) |

**C4 repair `1435122de`:** `testPostExitRecoveryEdgeIsAnOrphan` moved into `ReplayTests` (where `ev` is scoped); `ConfigurationChangeSeamTests` keeps the budget test. `git diff --stat 32047f9f5 1435122de` → `PureLogicTests.swift | 34 ++++----` only. **No kernel or harness source changed**, so the dylib built from `1435122de` is expected to carry the same UUID `F00F11D4-…`; pass 2 verifies that rather than assuming it.

## Pass 2 — subject `1435122de` (10:55 and 10:56 local, run twice, identical)

| Step | Result | Evidence (verbatim) |
|---|---|---|
| `swift build` | PASS | `Build complete! (0.10s)` |
| `swift test` | **FAIL — C5** (test file only) | `Executed 22 tests, with 2 failures` — both in `ReplayTests.testPostExitRecoveryEdgeIsAnOrphan`: `XCTAssertEqual failed: ("2") is not equal to ("1")` · `("Optional(2)") is not equal to ("Optional(3)")`. **The replayer was right and the test was wrong**: `StateReplayer` starts every trace at `idle`, and my synthetic trace began with `recovering → idle`, which is itself an orphan against `idle`. The device journal carried the full history; the test did not. 20 of 22 passed, including the new `configuration_change` budget test. |
| source gate | PASS 20/20 | `Tests: 20 passed, 20 total` |
| `xcodegen generate` | PASS | (writes `Harness/Info.plist` — the known navigator `M`) |
| unsigned iOS compile | **PASS** | one known warning · `** BUILD SUCCEEDED **` |
| signed device build | **PASS** | `Apple Development: Kelly Nezat (N9DTF6434L)` ×3 · `** BUILD SUCCEEDED **` |
| debug dylib UUID | `F00F11D4-E589-3F06-9919-5609C11DF6C3` | **identical to pass 1** — confirms the C4 change touched no compiled source |

**C5 repair:** the trace now walks a lawful prefix (`enterConversation` → `idle→entering` → `recovery_scheduled configuration_change` → `entering→recovering` → `leaveConversation` → `recovering→idle`) before the W4 edge `idle→recovering`; expected exactly one orphan at seq 7. Tests only; kernel and harness sources unchanged again.

## Pass 3 — subject `e5046059e` (10:57 local) — GREEN

| Step | Result | Evidence (verbatim) |
|---|---|---|
| `git rev-parse --short HEAD` | `e5046059e` | |
| `swift build` | PASS | `Build complete! (0.10s)` |
| `swift test` | **PASS 22/22** | `Executed 22 tests, with 0 failures (0 unexpected)` (suites 1 · 7 · 3 · 3 · 7 · 1 — `ReplayTests` now 7 incl. the W4 orphan test; `ConfigurationChangeSeamTests` 1; `InputFormatPreconditionTests` 3) |
| source gate | PASS 20/20 | `Tests: 20 passed, 20 total` |
| `xcodegen generate` | PASS | `Created project at …/VoiceKernelHarness.xcodeproj` |
| unsigned iOS compile | PASS | one known warning (`try?` unused, unchanged by ruling) · `** BUILD SUCCEEDED **` |
| signed device build | PASS | `Apple Development: Kelly Nezat (N9DTF6434L)` ×3 · `** BUILD SUCCEEDED **` |
| debug dylib UUID | **`F00F11D4-E589-3F06-9919-5609C11DF6C3`** | identical across passes 1–3: C4 and C5 touched tests only, as claimed |

## Standing

```
PASS 1 (32047f9f5)   build PASS · test FAIL C4 (test scope) · gate 20/20 · xcodegen PASS · unsigned PASS · signed PASS
C4                   REPAIRED at 1435122de (tests only)
PASS 2 (1435122de)   build PASS · test FAIL C5 (test trace, replayer correct) · gate 20/20 · unsigned PASS · signed PASS · dylib F00F11D4 unchanged
C5                   REPAIRED (tests only)
PASS 3 (e5046059e)   GREEN — build · test 22/22 · gate 20/20 · xcodegen · unsigned · signed · dylib F00F11D4 (unchanged)
MAC-COMPILE-04       GREEN — awaiting founder acceptance
RUN-3 BINDING        debug dylib F00F11D4-E589-3F06-9919-5609C11DF6C3 (main executable = build-invariant stub, not evidence)
DEVICE ACT           NOT AUTHORIZED until the founder accepts this record
```
