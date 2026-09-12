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

## Pass 2 — subject `1435122de` — OWED

Same sequence on the exact SHA. Expected: `Executed 22 tests, with 0 failures` · gate 20/20 · two `BUILD SUCCEEDED` · one known warning · dylib UUID reported (compare to `F00F11D4-…`).

## Standing

```
PASS 1 (32047f9f5)   build PASS · test FAIL C4 (test scope) · gate 20/20 · xcodegen PASS · unsigned PASS · signed PASS
C4                   REPAIRED at 1435122de (tests only)
PASS 2 (1435122de)   OWED
DEVICE ACT           NOT AUTHORIZED until pass 2 is green and the founder accepts this record
```
