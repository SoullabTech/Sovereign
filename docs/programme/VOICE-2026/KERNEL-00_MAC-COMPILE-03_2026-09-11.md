# KERNEL-00 · MAC-COMPILE-03 — 2026-09-11

**Subject SHA:** `728924819` (PRE-WITNESS-02 §3 applied on `claude/voice-2026-census-01`; plan `6566ace40` accepted as written).
**Purpose:** native viability of the §3 entry-seam repair before any device act. Compile is not a witness. A green compile does not lift anything except the prohibition on installing.
**Operator:** founder, Mac Studio, checkout `~/MAIA-SOVEREIGN` at detached HEAD `728924819` (`git rev-parse --short HEAD` → `728924819`, verbatim in the transcript).
**Toolchain (from the build log):** Xcode `17C529` · iPhoneOS SDK `26.2` (`23C57`) · target `arm64-apple-ios16.0` · Swift language mode 5.
**Team:** `DEVELOPMENT_TEAM=ZVK2X646Z2` (Xcode label "Kelly Nezat"; Individual; `isFreeProvisioningTeam = 0` — founder-read from Xcode's account metadata).

## 1. Results

| Step | Command | Result | Evidence |
|---|---|---|---|
| 1 | `cd ios/VoiceKernel && swift build` | **PASS** | `Building for debugging...` · `[12/12] Compiling VoiceKernel StateProjection.swift` · `Build complete! (5.51s)` |
| 2 | `swift test` | **NOT RUN in this pass** | The instruction line carried a trailing `# expect 20 tests`; the founder's zsh does not treat `#` as a comment on an interactive line (`interactivecomments` off), so `swift test` received four unexpected arguments and refused: `error: 4 unexpected arguments: '#', 'expect', '20', 'tests'`. **Instruction defect (this session's), not a kernel defect. Rerun owed — see §3.** |
| 3 | `npx jest --config jest.config.js __tests__/voice-kernel-00-source-gates.test.ts` | **PASS 16/16** | `Tests: 16 passed, 16 total` — including the three PRE-WITNESS-02 gates: validity check lexically precedes every input-node `installTap(onBus: 0` (§3.1) · no `NSException` / `ExceptionCatcher` / `objc_try` anywhere (§3.1) · refused build + configuration change journal format and generation age (§3.4). (The same stray `#` leaked into the jest path pattern, `…\|#\|16\/16`; the suite still matched and ran in full.) |
| 4 | `cd ios/VoiceKernelHarness && xcodegen generate` | **PASS** | `Created project at /Users/soullab/MAIA-SOVEREIGN/ios/VoiceKernelHarness/VoiceKernelHarness.xcodeproj` |
| 5 | unsigned iOS compile (`-destination generic/platform=iOS CODE_SIGNING_ALLOWED=NO build`) | **COMPILED — terminal line not captured** | Kernel target compiled every source (`AudioGraph.swift`, `VoiceKernel.swift` included) with exactly one diagnostic (§2). Harness target compile began. The founder's paste of this step was cut before its `** BUILD …` line, so the unsigned step's own verdict is **not in the record verbatim**. It is superseded, not replaced, by step 6, which compiles and links the same two targets from the same sources. |
| 6 | signed device build (`-destination id=00008140-00163D9922E0801C DEVELOPMENT_TEAM=ZVK2X646Z2 CODE_SIGN_STYLE=Automatic -allowProvisioningUpdates build`) | **PASS — `** BUILD SUCCEEDED **`** | Linked `VoiceKernelHarness.app/VoiceKernelHarness` and `VoiceKernelHarness.debug.dylib`; `CopySwiftLibs`; `CodeSign` ×3 (debug dylib · `__preview.dylib` · app bundle with entitlements `VoiceKernelHarness.app.xcent`); `Validate … -shallow-bundle`; then `** BUILD SUCCEEDED **`. |

### Signing facts (verbatim from step 6)

```
Signing Identity:     "Apple Development: Kelly Nezat (N9DTF6434L)"
Provisioning Profile: "iOS Team Provisioning Profile: *"
                      (08a653d1-5ec3-4206-84fd-991a5fcc11c2)
/usr/bin/codesign --force --sign 42E2C8D83763966C9411E9622B92872D0D3885B4 --entitlements …/VoiceKernelHarness.app.xcent --timestamp=none --generate-entitlement-der …/VoiceKernelHarness.app
```

`appintentsmetadataprocessor`: `warning: Metadata extraction skipped. No AppIntents.framework dependency found.` — tooling note, not a diagnostic against the kernel; the harness declares no App Intents.

Bundle identifier confirmed in the build (`--bundle-identifier life.soullab.voicekernel.k00`). Note the profile in this run is the wildcard team profile (`*`), where MAC-COMPILE-02 recorded an explicit profile for `life.soullab.voicekernel.k00`. Both sign the same bundle id under the same team; recorded as observed, not adjudicated.

## 2. Diagnostics

Exactly one, identical to MAC-COMPILE-02:

```
/Users/soullab/MAIA-SOVEREIGN/ios/VoiceKernel/Sources/VoiceKernel/VoiceKernel.swift:121:9: warning: result of 'try?' is unused
        try? session?.release(cause: "leaveConversation", causeSeq: cmd)
```

**Deliberately not changed** (same ruling as MAC-COMPILE-02: a fix would be a new subject requiring its own qualification; it is outside the §3 entry-seam scope).

Nothing in the §3 diff produced a diagnostic. The two compile risks this session flagged before the run — actor-isolated `clock` called inside `graph.flatMap { … }` in `startGraph`, and the `Double` interpolation in the new test's exact-string assertion — did not fire in the kernel target. The second can only be judged by step 2.

## 3. What is still owed before this record can be accepted

**Step 2, `swift test`, on the same SHA — the only open item.** Expected: 20 tests (17 prior + `InputFormatPreconditionTests` ×3), 0 failures. Run with no trailing comment on the line:

```bash
cd ~/MAIA-SOVEREIGN && git rev-parse --short HEAD
cd ios/VoiceKernel && swift test 2>&1 | tail -30
```

If the founder wants the unsigned step's own `BUILD SUCCEEDED` in the record verbatim as well:

```bash
cd ~/MAIA-SOVEREIGN/ios/VoiceKernelHarness && xcodebuild -project VoiceKernelHarness.xcodeproj -scheme VoiceKernelHarness -destination generic/platform=iOS CODE_SIGNING_ALLOWED=NO build 2>&1 | grep -E "error:|warning:|BUILD (SUCCEEDED|FAILED)"
```

## 4. Standing after this record

```
SUBJECT              728924819
swift build          PASS
swift test           OWED (instruction defect; rerun)
source gate          PASS 16/16
xcodegen             PASS
unsigned compile     compiled; verdict line not captured (superseded by signed)
signed device build  PASS · BUILD SUCCEEDED · team ZVK2X646Z2 · identity N9DTF6434L
diagnostics          1 warning (known, unchanged)
device act           NOT AUTHORIZED until swift test is green and the founder accepts this record
```

A green MAC-COMPILE-03 authorizes exactly one thing: installing `728924819` and rerunning the KERNEL-00 witness **from Enter conversation** under candidate A (rebuild-now with the precondition), recording whatever the organism does into `KERNEL-00_WITNESS_<date>_run2.md`. Thresholds unchanged. Candidate B/C not implemented. Both outcomes legitimate.
