# KERNEL-00 / VPIO-02B · DRIVER-COMPILE-01 — 2026-09-14 — GREEN on `08483cfe4`

**Act:** founder-authorized VPIO-02B instrument-only driver compile on exactly `08483cfe4f6c3e98198805337ced99bae92ce911`.
**Execution:** Mac Studio · fresh detached worktree `/private/tmp/vpio02b-driver-compile-08483cfe4` · fresh DerivedData `/private/tmp/vpio02b-driver-compile-08483cfe4-derived`.
**Authority boundary:** driver instrument compile only. No phone test, no VPIO-02 install, no launch, no app/container read, no journal pull, no physiological sample, no N=30 act.

## Verdict

```text
VPIO-02B instrument      08483cfe4f6c3e98198805337ced99bae92ce911 · COMPILE GREEN
xcodegen generate        PASS
build-for-testing        PASS · ** TEST BUILD SUCCEEDED **
destination              generic/platform=iOS
code signing             CODE_SIGNING_ALLOWED=NO
phone interaction        NONE
install / launch         NOT RUN
container / journal read NOT RUN
sample / N=30            NOT RUN
F-W1 VPIO-02             UNSPENT
```

The compile worktree resolved to the exact authorized SHA and remained clean after `xcodegen generate` and `build-for-testing`. The VPIO organism is byte-identical to `ac12dedf4b7b4efc9855c08bb4285a704e7039f1` under `ios/VoiceKernel` and `ios/VoiceKernelHarness` (`git diff --quiet` rc 0).

## Commands and observed outputs

### 0. Fresh detached worktree

```bash
cd /Users/soullab/MAIA-SOVEREIGN
test ! -e /private/tmp/vpio02b-driver-compile-08483cfe4
git worktree add --detach /private/tmp/vpio02b-driver-compile-08483cfe4 08483cfe4f6c3e98198805337ced99bae92ce911
cd /private/tmp/vpio02b-driver-compile-08483cfe4
git rev-parse HEAD
git status --porcelain
```

Observed:

```text
HEAD is now at 08483cfe4 ...
08483cfe4f6c3e98198805337ced99bae92ce911
```

`git status --porcelain` printed nothing.

### 1. `xcodegen generate`

```bash
( cd ios/VoiceKernelDriver && xcodegen generate )
```

Observed verbatim:

```text
⚙️  Generating plists...
⚙️  Generating project...
⚙️  Writing project...
Created project at /tmp/vpio02b-driver-compile-08483cfe4/ios/VoiceKernelDriver/VoiceKernelDriver.xcodeproj
```

### 2. driver-only `build-for-testing`

```bash
( cd ios/VoiceKernelDriver && xcodebuild build-for-testing     -project VoiceKernelDriver.xcodeproj     -scheme DriverUITests     -destination 'generic/platform=iOS'     -derivedDataPath /private/tmp/vpio02b-driver-compile-08483cfe4-derived     CODE_SIGNING_ALLOWED=NO )
```

The build compiled `DriverHost` and `DriverUITests`, targeted generic iOS, and ended:

```text
** TEST BUILD SUCCEEDED **
```

Process exit code: `0`.

No `test-without-building` was invoked. No `devicectl` command was invoked. No phone destination id was supplied. No app-under-test was installed or launched.

## Driver product hashes — evidence only

```text
xctestrun SHA-256       7105c95ed047091bfc823c5d704f5dd8cc98257c9fde43927c69d83789657739
DriverUITests SHA-256   6d669e39e91d641b5ff58696056b80c0ac4efc20a0ef1dd1e5b2c10e7a1126fc
XCTRunner SHA-256       6fa0f96700913280d0bb3ddd3b400d69bc2ea66592d97c4760a753d2dd701f41
DriverHost SHA-256      5779387686f49134baeee76cfc77f9d2bebd53e56cb59279b163b8dc640d479b
```

Paths read:

```text
/private/tmp/vpio02b-driver-compile-08483cfe4-derived/Build/Products/DriverUITests_iphoneos26.2-arm64.xctestrun
/private/tmp/vpio02b-driver-compile-08483cfe4-derived/Build/Products/Debug-iphoneos/DriverUITests-Runner.app/PlugIns/DriverUITests.xctest/DriverUITests
/private/tmp/vpio02b-driver-compile-08483cfe4-derived/Build/Products/Debug-iphoneos/DriverUITests-Runner.app/DriverUITests-Runner
/private/tmp/vpio02b-driver-compile-08483cfe4-derived/Build/Products/Debug-iphoneos/DriverHost.app/DriverHost
```

These hashes bind only the external witness instrument products. They are not VPIO-02 organism artifact identity and authorize no execution.

Relative to the prior VPIO-01B driver compile, `xctestrun`, XCTRunner and DriverHost hashes are unchanged; the DriverUITests binary hash changed, consistent with the authorized fourth-subject driver source change. No acceptance claim rests on that comparison.

## Source custody after the act

```text
HEAD                   08483cfe4f6c3e98198805337ced99bae92ce911
worktree status        clean
organism vs ac12dedf4  byte-identical (ios/VoiceKernel + ios/VoiceKernelHarness)
```

`xcodegen generate` created the ignored driver project only; no tracked source footprint remained.

## Shared-three-step limitation — unchanged

The instrument compile does not adjudicate the recorded classifier limitation: a gen-1 refusal after only `unit_created · io_enabled · vp_properties_set` is trace-compatible with both VPIO-01 and VPIO-02. The current classifier remains exactly the authorized rule; actual subject custody comes from the declared bundle/container. No such row exists in the recorded corpus.

## Standing

VPIO-02 organism `ac12dedf4` remains COMPILE GREEN and untouched. VPIO-02B instrument `08483cfe4` is now DRIVER-COMPILE GREEN. This record opens nothing downstream. First-install read remains HELD; install, launch, first sample and N=30 remain NOT AUTHORIZED; F-W1 VPIO-02 remains UNSPENT. VPIO-01 remains CLOSED with `.vpio01` frozen; historical K00/R1 untouched; KERNEL-00 not accepted; KERNEL-01 / BENCH-01 / BRIDGE-01 / MIGRATE-01 remain CLOSED; JOP-04 untouched; WS transport not granted.
