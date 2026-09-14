# KERNEL-00 / VPIO-01B · DRIVER-COMPILE-01 — 2026-09-14 — GREEN on `de3efd3fb`

**Act:** founder-authorized VPIO-01B instrument-only driver compile on exactly `de3efd3fb` (`de3efd3fbaf3e97f1dc6d6f9bf013ddfb0a6a2e8`).  
**Execution:** Mac Studio · detached worktree `/private/tmp/vpio-01b-driver-compile-de3efd3fb` · fresh DerivedData `/private/tmp/vpio-01b-driver-compile-de3efd3fb-derived`.  
**Toolchain:** Xcode 26.3 (`17C529`) · iPhoneOS SDK 26.2 · Swift 6.2.4 · XcodeGen 2.46.0.  
**Authority boundary:** driver instrument compile only. No VPIO install, no harness install, no launch, no phone test, no journal pull, no sample, no N=30 act.

## Verdict

```text
VPIO-01B instrument     de3efd3fb · COMPILE GREEN
xcodegen generate       PASS
build-for-testing       PASS
DriverHost compiled     YES
DriverUITests compiled  YES
phone interaction       NONE
VPIO install            NOT RUN
VPIO launch             NOT RUN
sample                  NOT RUN
F-W1                    UNSPENT
```

The compile used `-destination generic/platform=iOS` and `CODE_SIGNING_ALLOWED=NO`, so it built the driver host and XCUITest bundle without targeting or contacting the paired phone. The executed build log contains no `devicectl`, no `test-without-building`, no install verb, and no `life.soullab.voicekernel.vpio01` app-under-test action. The `ios/VoiceKernel/Sources` and `ios/VoiceKernelHarness/Harness` trees at the instrument subject are byte-identical to `85e5e7154`.

## Build product custody (driver instrument only)

```text
xctestrun SHA-256       7105c95ed047091bfc823c5d704f5dd8cc98257c9fde43927c69d83789657739
DriverUITests SHA-256   f8fe6048cbba28227859daf58451ff34015f9fc49ab9915e33f1b4cef004df71
XCTRunner SHA-256       6fa0f96700913280d0bb3ddd3b400d69bc2ea66592d97c4760a753d2dd701f41
DriverHost SHA-256      5779387686f49134baeee76cfc77f9d2bebd53e56cb59279b163b8dc640d479b
```

These hashes bind only this compile's external witness instrument products. They are **not** VPIO organism artifact identity and authorize no execution.

## Operator note — duplicate action token

The one `xcodebuild` invocation accidentally named `build-for-testing` twice: once immediately after `xcodebuild` and once as the final action token. Xcode therefore emitted `** TEST BUILD SUCCEEDED **` twice in the same invocation: the first after the full driver build, the second after the repeated incremental action. This is recorded as a command-construction defect, not hidden or repaired by a rerun. It did not execute tests, address the phone, install anything, or mutate source. The first successful build is sufficient to establish native compile viability; the second success adds no new acceptance claim.

## Source custody after the act

```text
HEAD                   de3efd3fbaf3e97f1dc6d6f9bf013ddfb0a6a2e8
worktree status        clean
organism vs 85e5e7154  byte-identical (VoiceKernel sources + harness behavioural source)
```

`xcodegen generate` created the ignored driver project only; no tracked source footprint remained.

## Outputs verbatim

### 1. `xcodegen generate`

Command:

```bash
cd ios/VoiceKernelDriver && xcodegen generate
```

Output:

````text
⚙️  Generating plists...
⚙️  Generating project...
⚙️  Writing project...
Created project at /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver/VoiceKernelDriver.xcodeproj
````

### 2. driver-only `build-for-testing`

Command as executed:

```bash
xcodebuild build-for-testing \
  -project VoiceKernelDriver.xcodeproj \
  -scheme DriverUITests \
  -destination 'generic/platform=iOS' \
  -derivedDataPath /private/tmp/vpio-01b-driver-compile-de3efd3fb-derived \
  CODE_SIGNING_ALLOWED=NO \
  build-for-testing
```

Output, verbatim:

````text
Command line invocation:
    /Applications/Xcode.app/Contents/Developer/usr/bin/xcodebuild build-for-testing -project VoiceKernelDriver.xcodeproj -scheme DriverUITests -destination generic/platform=iOS -derivedDataPath /private/tmp/vpio-01b-driver-compile-de3efd3fb-derived CODE_SIGNING_ALLOWED=NO build-for-testing

Build settings from command line:
    CODE_SIGNING_ALLOWED = NO

ComputePackagePrebuildTargetDependencyGraph

Prepare packages

CreateBuildRequest

SendProjectDescription

CreateBuildOperation

ComputeTargetDependencyGraph
note: Building targets in dependency order
note: Target dependency graph (2 targets)
    Target 'DriverUITests' in project 'VoiceKernelDriver'
        ➜ Explicit dependency on target 'DriverHost' in project 'VoiceKernelDriver'
    Target 'DriverHost' in project 'VoiceKernelDriver' (no dependencies)

GatherProvisioningInputs

CreateBuildDescription

ExecuteExternalTool /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang -v -E -dM -isysroot /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -x c -c /dev/null

ExecuteExternalTool /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/swiftc --version

ExecuteExternalTool /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/ld -version_details

Build description signature: c02eb56eb13251c85b782c1c7a5751cf
Build description path: /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/XCBuildData/c02eb56eb13251c85b782c1c7a5751cf.xcbuilddata
CreateBuildDirectory /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver/VoiceKernelDriver.xcodeproj
    builtin-create-build-directory /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products

CreateBuildDirectory /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver/VoiceKernelDriver.xcodeproj
    builtin-create-build-directory /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex

ClangStatCache /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang-stat-cache /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk /tmp/vpio-01b-driver-compile-de3efd3fb-derived/SDKStatCaches.noindex/iphoneos26.2-23C57-3794476bd08197c3e2abd9bb477ef7f7.sdkstatcache
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver/VoiceKernelDriver.xcodeproj
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang-stat-cache /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -o /tmp/vpio-01b-driver-compile-de3efd3fb-derived/SDKStatCaches.noindex/iphoneos26.2-23C57-3794476bd08197c3e2abd9bb477ef7f7.sdkstatcache

CreateBuildDirectory /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/SwiftExplicitPrecompiledModules
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver/VoiceKernelDriver.xcodeproj
    builtin-create-build-directory /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/SwiftExplicitPrecompiledModules

CreateBuildDirectory /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/ExplicitPrecompiledModules
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver/VoiceKernelDriver.xcodeproj
    builtin-create-build-directory /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/ExplicitPrecompiledModules

CreateBuildDirectory /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver/VoiceKernelDriver.xcodeproj
    builtin-create-build-directory /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos

CreateBuildDirectory /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/EagerLinkingTBDs/Debug-iphoneos
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver/VoiceKernelDriver.xcodeproj
    builtin-create-build-directory /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/EagerLinkingTBDs/Debug-iphoneos

WriteAuxiliaryFile /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/VoiceKernelDriver-450d5ee07790ea55984dc2c5681c04c4-VFS-iphoneos/all-product-headers.yaml
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver/VoiceKernelDriver.xcodeproj
    write-file /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/VoiceKernelDriver-450d5ee07790ea55984dc2c5681c04c4-VFS-iphoneos/all-product-headers.yaml

WriteAuxiliaryFile /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/ProductTypeInfoPlistAdditions.plist (in target 'DriverUITests' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    write-file /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/ProductTypeInfoPlistAdditions.plist

WriteAuxiliaryFile /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/DriverUITests-project-headers.hmap (in target 'DriverUITests' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    write-file /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/DriverUITests-project-headers.hmap

WriteAuxiliaryFile /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/DriverUITests.hmap (in target 'DriverUITests' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    write-file /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/DriverUITests.hmap

WriteAuxiliaryFile /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/empty-DriverUITests.plist (in target 'DriverUITests' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    write-file /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/empty-DriverUITests.plist

WriteAuxiliaryFile /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/DriverUITests.DependencyStaticMetadataFileList (in target 'DriverUITests' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    write-file /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/DriverUITests.DependencyStaticMetadataFileList

WriteAuxiliaryFile /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/DriverUITests.DependencyMetadataFileList (in target 'DriverUITests' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    write-file /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/DriverUITests.DependencyMetadataFileList

WriteAuxiliaryFile /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/DriverUITests-generated-files.hmap (in target 'DriverUITests' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    write-file /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/DriverUITests-generated-files.hmap

WriteAuxiliaryFile /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/DriverUITests-own-target-headers.hmap (in target 'DriverUITests' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    write-file /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/DriverUITests-own-target-headers.hmap

WriteAuxiliaryFile /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/DriverUITests-all-target-headers.hmap (in target 'DriverUITests' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    write-file /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/DriverUITests-all-target-headers.hmap

WriteAuxiliaryFile /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/DriverUITests-all-non-framework-target-headers.hmap (in target 'DriverUITests' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    write-file /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/DriverUITests-all-non-framework-target-headers.hmap

WriteAuxiliaryFile /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/Objects-normal/arm64/DriverUITests.SwiftConstValuesFileList (in target 'DriverUITests' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    write-file /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/Objects-normal/arm64/DriverUITests.SwiftConstValuesFileList

WriteAuxiliaryFile /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/Objects-normal/arm64/DriverUITests.LinkFileList (in target 'DriverUITests' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    write-file /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/Objects-normal/arm64/DriverUITests.LinkFileList

WriteAuxiliaryFile /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/Objects-normal/arm64/DriverUITests-OutputFileMap.json (in target 'DriverUITests' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    write-file /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/Objects-normal/arm64/DriverUITests-OutputFileMap.json

WriteAuxiliaryFile /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/Objects-normal/arm64/DriverUITests_const_extract_protocols.json (in target 'DriverUITests' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    write-file /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/Objects-normal/arm64/DriverUITests_const_extract_protocols.json

WriteAuxiliaryFile /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/Objects-normal/arm64/DriverUITests.SwiftFileList (in target 'DriverUITests' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    write-file /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/Objects-normal/arm64/DriverUITests.SwiftFileList

WriteAuxiliaryFile /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/DriverHost.hmap (in target 'DriverHost' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    write-file /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/DriverHost.hmap

WriteAuxiliaryFile /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/Objects-normal/arm64/DriverHost.LinkFileList (in target 'DriverHost' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    write-file /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/Objects-normal/arm64/DriverHost.LinkFileList

WriteAuxiliaryFile /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/DriverHost.DependencyStaticMetadataFileList (in target 'DriverHost' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    write-file /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/DriverHost.DependencyStaticMetadataFileList

WriteAuxiliaryFile /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/Objects-normal/arm64/DriverHost-OutputFileMap.json (in target 'DriverHost' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    write-file /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/Objects-normal/arm64/DriverHost-OutputFileMap.json

WriteAuxiliaryFile /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/Objects-normal/arm64/DriverHost_const_extract_protocols.json (in target 'DriverHost' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    write-file /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/Objects-normal/arm64/DriverHost_const_extract_protocols.json

WriteAuxiliaryFile /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/DriverHost.DependencyMetadataFileList (in target 'DriverHost' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    write-file /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/DriverHost.DependencyMetadataFileList

WriteAuxiliaryFile /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/Objects-normal/arm64/DriverHost.SwiftFileList (in target 'DriverHost' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    write-file /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/Objects-normal/arm64/DriverHost.SwiftFileList

WriteAuxiliaryFile /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/Objects-normal/arm64/DriverHost.SwiftConstValuesFileList (in target 'DriverHost' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    write-file /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/Objects-normal/arm64/DriverHost.SwiftConstValuesFileList

WriteAuxiliaryFile /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/DriverHost-project-headers.hmap (in target 'DriverHost' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    write-file /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/DriverHost-project-headers.hmap

WriteAuxiliaryFile /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/DriverHost-generated-files.hmap (in target 'DriverHost' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    write-file /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/DriverHost-generated-files.hmap

WriteAuxiliaryFile /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/DriverHost-own-target-headers.hmap (in target 'DriverHost' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    write-file /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/DriverHost-own-target-headers.hmap

WriteAuxiliaryFile /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/DriverHost-all-target-headers.hmap (in target 'DriverHost' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    write-file /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/DriverHost-all-target-headers.hmap

WriteAuxiliaryFile /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/DriverHost-all-non-framework-target-headers.hmap (in target 'DriverHost' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    write-file /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/DriverHost-all-non-framework-target-headers.hmap

WriteAuxiliaryFile /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/DriverHost-DebugDylibPath-normal-arm64.txt (in target 'DriverHost' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    write-file /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/DriverHost-DebugDylibPath-normal-arm64.txt

WriteAuxiliaryFile /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/DriverHost-DebugDylibInstallName-normal-arm64.txt (in target 'DriverHost' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    write-file /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/DriverHost-DebugDylibInstallName-normal-arm64.txt

MkDir /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverHost.app (in target 'DriverHost' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    /bin/mkdir -p /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverHost.app

MkDir /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests-Runner.app/PlugIns/DriverUITests.xctest (in target 'DriverUITests' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    /bin/mkdir -p /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests-Runner.app/PlugIns/DriverUITests.xctest

ProcessInfoPlistFile /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverHost.app/Info.plist /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver/DriverHost/Info.plist (in target 'DriverHost' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    builtin-infoPlistUtility /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver/DriverHost/Info.plist -producttype com.apple.product-type.application -genpkginfo /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverHost.app/PkgInfo -expandbuildsettings -format binary -platform iphoneos -requiredArchitecture arm64 -o /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverHost.app/Info.plist

Ld /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverHost.app/__preview.dylib normal (in target 'DriverHost' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang -Xlinker -reproducible -target arm64-apple-ios16.0 -dynamiclib -isysroot /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -O0 -L/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos -F/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos -install_name @rpath/DriverHost.debug.dylib -dead_strip -rdynamic -Xlinker -no_deduplicate -Xlinker -dependency_info -Xlinker /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/Objects-normal/arm64/DriverHost_dependency_info.dat -o /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverHost.app/__preview.dylib

SwiftDriver DriverHost normal arm64 com.apple.xcode.tools.swift.compiler (in target 'DriverHost' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    builtin-SwiftDriver -- /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/swiftc -module-name DriverHost -Onone -enforce-exclusivity\=checked @/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/Objects-normal/arm64/DriverHost.SwiftFileList -DDEBUG -enable-bare-slash-regex -enable-experimental-feature DebugDescriptionMacro -sdk /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -target arm64-apple-ios16.0 -g -module-cache-path /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex -Xfrontend -serialize-debugging-options -enable-testing -index-store-path /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Index.noindex/DataStore -Xcc -D_LIBCPP_HARDENING_MODE\=_LIBCPP_HARDENING_MODE_DEBUG -swift-version 5 -I /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos -F /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos -parse-as-library -c -j16 -enable-batch-mode -incremental -Xcc -ivfsstatcache -Xcc /tmp/vpio-01b-driver-compile-de3efd3fb-derived/SDKStatCaches.noindex/iphoneos26.2-23C57-3794476bd08197c3e2abd9bb477ef7f7.sdkstatcache -output-file-map /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/Objects-normal/arm64/DriverHost-OutputFileMap.json -use-frontend-parseable-output -save-temps -no-color-diagnostics -explicit-module-build -module-cache-path /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/SwiftExplicitPrecompiledModules -clang-scanner-module-cache-path /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex -sdk-module-cache-path /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex -serialize-diagnostics -emit-dependencies -emit-module -emit-module-path /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/Objects-normal/arm64/DriverHost.swiftmodule -validate-clang-modules-once -clang-build-session-file /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/Session.modulevalidation -Xcc -I/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/swift-overrides.hmap -emit-const-values -Xfrontend -const-gather-protocols-file -Xfrontend /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/Objects-normal/arm64/DriverHost_const_extract_protocols.json -Xcc -iquote -Xcc /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/DriverHost-generated-files.hmap -Xcc -I/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/DriverHost-own-target-headers.hmap -Xcc -I/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/DriverHost-all-target-headers.hmap -Xcc -iquote -Xcc /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/DriverHost-project-headers.hmap -Xcc -I/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/include -Xcc -I/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/DerivedSources-normal/arm64 -Xcc -I/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/DerivedSources/arm64 -Xcc -I/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/DerivedSources -Xcc -DDEBUG\=1 -emit-objc-header -emit-objc-header-path /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/Objects-normal/arm64/DriverHost-Swift.h -working-directory /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver -experimental-emit-module-separately -disable-cmo

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/_SwiftConcurrencyShims-8MKXBOTIHO2WKSOQ78CTW9XHJ.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/_Builtin_stdbool-B1JK6GZ4R7RA3PZI3FAXQND3T.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/ptrcheck-CLRM2OBDE8QJLVGRII8V739TU.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/_AvailabilityInternal-BME6CA6EU2AGAQIYBUTF2HA19.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/SwiftShims-E6PISTI279A46VIXFXG2JTMDD.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/_Builtin_float-3RXMV15WBOFJN2I6UMG7WWQLU.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/_Builtin_stddef-8UPTNHNDNI9TP0C5G4DUXUS5U.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/DeveloperToolsSupport-6RJNXZYFYYF19R5WA2LILIMML.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/_Builtin_stdarg-638W88GJ58YRKC3H6EGPU65X2.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/ptrauth-4AENCLLN9V4SGFJMTD6C2IG3V.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/_DarwinFoundation1-1RT4A0676RJFPPU25ZRGF04LK.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/_DarwinFoundation2-X24VWM3OHUTZIZGXBI05Z17E.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/_Builtin_limits-5DZMHEF5ASUMX3YJ910WUIVB9.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/_Builtin_stdint-E9ND12J53M5OU353JA3QLWCKE.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/sys_types-BED6P8O8N1QURAOY58RHU7Z68.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/_Builtin_tgmath-2CPQ83LRKJKHPQCPD3PU56NAU.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/_Builtin_intrinsics-F1NFW0S323JHYUY9MWM4JKWQ7.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/_DarwinFoundation3-DXNRCHV429I0RDO2EXTICQG29.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/_Builtin_stdatomic-APBJHBI3ZMR52M8W8K05RRQLA.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/_Builtin_inttypes-EMFWB2SU9W8RGKJWH3KTMFSTB.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/Darwin-ECZT8JR4CKW0V054V0NDQ9GPH.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/simd-8KWA6NZSL7SU9R5V9SLYH8SPB.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/MachO-EBU23D45RVLX8M8UDKE0NFCAN.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/ObjectiveC-8KKSUM6GF2K8KAFJ24SO8HSZL.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/os_object-B7XXGHLR4VNLMOONSMV2GGPLA.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/os_workgroup-DQVEZJKXA8P864987B2P5IYFZ.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/Spatial-6QGBBM6UJ2QOTIK7R3VFIUOCT.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/Dispatch-9144S4CY1L33JKK1SEU0CJ7KO.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/XPC-6CGPNRSRZI1ACZH4XR31PRT19.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/CoreFoundation-CLFKS4ZF3TDJQ5PH9QPC4NJ0J.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/os-22EFZF06B9NWYN62K7H04BH4O.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/CoreGraphics-8H4SHF1OE1L5NIDNIZQJFUUOZ.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/CFNetwork-9KMY727ACVK18MCZFHKFNXQ6Y.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/Security-2IQ2BFZ51XYADVE2YDAA86GJ6.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/Foundation-10XIBK0EYZ7IIC9558RACDUW2.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/ImageIO-C4X48MGZCDG59G6Q8N2WNCVSP.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/CoreText-37GLW849WFAF3BCVVWRF4U6KA.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/DataDetection-1XOTC4T7L5PKRNOM8V2EXE855.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/Symbols-1UNTUW13PHPTH8T6MTAEDPSCS.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/CoreData-6897WP1FR388SPF4J5VT22D3G.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/Accessibility-8ZYC8OGB0BEGGYZQEJ3ZN2L0I.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/IOSurface-3GPEZ7RJGJQYBFM8NXWJV651J.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/UniformTypeIdentifiers-9QKLD66KZD4SSLI694TKHSRTU.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/CoreTransferable-939VXB8853GTR8FJG92NF9CMB.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/OSLog-AR3CB6BJJ5WQ7EMHFJS0OVARL.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/FileProvider-B7OAE4Z3P3OSCQ63NYP4BXN4N.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/UserNotifications-1X9S19H777D7YWPJKFF3NJCQK.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/UIUtilities-70XRBD59AT3TGPZCVEMRZEYOD.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/OpenGLES-1UJJJTRDJOJF6GQR5DWSHEB2N.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/Metal-4U757QPZPXLOZP5VA6VX8ZJ2H.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/CoreVideo-ELAGS5A21YV79BFLOLLFXFEZE.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/QuartzCore-3N46B7YJHMSRLU2G69VH2QSQC.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/CoreImage-5E5JPK3HFS2XF5VC8757J47UQ.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/SwiftUICore-1QG88806B7BNORLOBE10HRIQH.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/UIKit-5K073Q7FLI1XEQDJMR7ZVACGB.pcm

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/SwiftUI-6F48YW3IQDOHJ7FQTKI4ADQTK.pcm

SwiftEmitModule normal arm64 Emitting\ module\ for\ DriverHost (in target 'DriverHost' from project 'VoiceKernelDriver')

SwiftCompile normal arm64 /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver/DriverHost/DriverHostApp.swift (in target 'DriverHost' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    

SwiftCompile normal arm64 Compiling\ DriverHostApp.swift /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver/DriverHost/DriverHostApp.swift (in target 'DriverHost' from project 'VoiceKernelDriver')
SwiftCompile normal arm64 /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver/DriverHost/DriverHostApp.swift (in target 'DriverHost' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    

SwiftDriverJobDiscovery normal arm64 Emitting module for DriverHost (in target 'DriverHost' from project 'VoiceKernelDriver')

SwiftDriver\ Compilation\ Requirements DriverHost normal arm64 com.apple.xcode.tools.swift.compiler (in target 'DriverHost' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    builtin-Swift-Compilation-Requirements -- /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/swiftc -module-name DriverHost -Onone -enforce-exclusivity\=checked @/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/Objects-normal/arm64/DriverHost.SwiftFileList -DDEBUG -enable-bare-slash-regex -enable-experimental-feature DebugDescriptionMacro -sdk /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -target arm64-apple-ios16.0 -g -module-cache-path /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex -Xfrontend -serialize-debugging-options -enable-testing -index-store-path /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Index.noindex/DataStore -Xcc -D_LIBCPP_HARDENING_MODE\=_LIBCPP_HARDENING_MODE_DEBUG -swift-version 5 -I /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos -F /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos -parse-as-library -c -j16 -enable-batch-mode -incremental -Xcc -ivfsstatcache -Xcc /tmp/vpio-01b-driver-compile-de3efd3fb-derived/SDKStatCaches.noindex/iphoneos26.2-23C57-3794476bd08197c3e2abd9bb477ef7f7.sdkstatcache -output-file-map /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/Objects-normal/arm64/DriverHost-OutputFileMap.json -use-frontend-parseable-output -save-temps -no-color-diagnostics -explicit-module-build -module-cache-path /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/SwiftExplicitPrecompiledModules -clang-scanner-module-cache-path /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex -sdk-module-cache-path /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex -serialize-diagnostics -emit-dependencies -emit-module -emit-module-path /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/Objects-normal/arm64/DriverHost.swiftmodule -validate-clang-modules-once -clang-build-session-file /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/Session.modulevalidation -Xcc -I/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/swift-overrides.hmap -emit-const-values -Xfrontend -const-gather-protocols-file -Xfrontend /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/Objects-normal/arm64/DriverHost_const_extract_protocols.json -Xcc -iquote -Xcc /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/DriverHost-generated-files.hmap -Xcc -I/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/DriverHost-own-target-headers.hmap -Xcc -I/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/DriverHost-all-target-headers.hmap -Xcc -iquote -Xcc /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/DriverHost-project-headers.hmap -Xcc -I/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/include -Xcc -I/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/DerivedSources-normal/arm64 -Xcc -I/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/DerivedSources/arm64 -Xcc -I/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/DerivedSources -Xcc -DDEBUG\=1 -emit-objc-header -emit-objc-header-path /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/Objects-normal/arm64/DriverHost-Swift.h -working-directory /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver -experimental-emit-module-separately -disable-cmo

SwiftMergeGeneratedHeaders /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/DerivedSources/DriverHost-Swift.h /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/Objects-normal/arm64/DriverHost-Swift.h (in target 'DriverHost' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    builtin-swiftHeaderTool -arch arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/Objects-normal/arm64/DriverHost-Swift.h -o /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/DerivedSources/DriverHost-Swift.h

Copy /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverHost.swiftmodule/arm64-apple-ios.swiftdoc /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/Objects-normal/arm64/DriverHost.swiftdoc (in target 'DriverHost' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    builtin-copy -exclude .DS_Store -exclude CVS -exclude .svn -exclude .git -exclude .hg -resolve-src-symlinks -rename /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/Objects-normal/arm64/DriverHost.swiftdoc /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverHost.swiftmodule/arm64-apple-ios.swiftdoc

Copy /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverHost.swiftmodule/arm64-apple-ios.abi.json /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/Objects-normal/arm64/DriverHost.abi.json (in target 'DriverHost' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    builtin-copy -exclude .DS_Store -exclude CVS -exclude .svn -exclude .git -exclude .hg -resolve-src-symlinks -rename /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/Objects-normal/arm64/DriverHost.abi.json /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverHost.swiftmodule/arm64-apple-ios.abi.json

Copy /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverHost.swiftmodule/arm64-apple-ios.swiftmodule /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/Objects-normal/arm64/DriverHost.swiftmodule (in target 'DriverHost' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    builtin-copy -exclude .DS_Store -exclude CVS -exclude .svn -exclude .git -exclude .hg -resolve-src-symlinks -rename /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/Objects-normal/arm64/DriverHost.swiftmodule /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverHost.swiftmodule/arm64-apple-ios.swiftmodule

Copy /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverHost.swiftmodule/Project/arm64-apple-ios.swiftsourceinfo /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/Objects-normal/arm64/DriverHost.swiftsourceinfo (in target 'DriverHost' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    builtin-copy -exclude .DS_Store -exclude CVS -exclude .svn -exclude .git -exclude .hg -resolve-src-symlinks -rename /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/Objects-normal/arm64/DriverHost.swiftsourceinfo /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverHost.swiftmodule/Project/arm64-apple-ios.swiftsourceinfo

SwiftDriver DriverUITests normal arm64 com.apple.xcode.tools.swift.compiler (in target 'DriverUITests' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    builtin-SwiftDriver -- /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/swiftc -module-name DriverUITests -Onone -enforce-exclusivity\=checked @/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/Objects-normal/arm64/DriverUITests.SwiftFileList -DDEBUG -module-alias Testing\=_Testing_Unavailable -plugin-path /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/lib/swift/host/plugins/testing -enable-bare-slash-regex -enable-experimental-feature DebugDescriptionMacro -sdk /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -target arm64-apple-ios16.0 -g -module-cache-path /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex -Xfrontend -serialize-debugging-options -enable-testing -index-store-path /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Index.noindex/DataStore -Xcc -D_LIBCPP_HARDENING_MODE\=_LIBCPP_HARDENING_MODE_DEBUG -swift-version 5 -I /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos -Isystem /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/usr/lib -F /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos -F /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/Library/Frameworks -F /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk/Developer/Library/Frameworks -parse-as-library -c -j16 -enable-batch-mode -incremental -Xcc -ivfsstatcache -Xcc /tmp/vpio-01b-driver-compile-de3efd3fb-derived/SDKStatCaches.noindex/iphoneos26.2-23C57-3794476bd08197c3e2abd9bb477ef7f7.sdkstatcache -output-file-map /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/Objects-normal/arm64/DriverUITests-OutputFileMap.json -use-frontend-parseable-output -save-temps -no-color-diagnostics -explicit-module-build -module-cache-path /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/SwiftExplicitPrecompiledModules -clang-scanner-module-cache-path /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex -sdk-module-cache-path /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex -serialize-diagnostics -emit-dependencies -emit-module -emit-module-path /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/Objects-normal/arm64/DriverUITests.swiftmodule -validate-clang-modules-once -clang-build-session-file /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/Session.modulevalidation -Xcc -I/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/swift-overrides.hmap -emit-const-values -Xfrontend -const-gather-protocols-file -Xfrontend /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/Objects-normal/arm64/DriverUITests_const_extract_protocols.json -Xcc -iquote -Xcc /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/DriverUITests-generated-files.hmap -Xcc -I/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/DriverUITests-own-target-headers.hmap -Xcc -I/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/DriverUITests-all-target-headers.hmap -Xcc -iquote -Xcc /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/DriverUITests-project-headers.hmap -Xcc -I/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/include -Xcc -I/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/DerivedSources-normal/arm64 -Xcc -I/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/DerivedSources/arm64 -Xcc -I/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/DerivedSources -Xcc -DDEBUG\=1 -emit-objc-header -emit-objc-header-path /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/Objects-normal/arm64/DriverUITests-Swift.h -working-directory /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver -experimental-emit-module-separately -disable-cmo

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/SwiftExplicitPrecompiledModules/XCUIAutomation-E6WXERTDUG9JC7ZJS8AT5Y7SK.pcm

SwiftExplicitDependencyCompileModuleFromInterface arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/SwiftExplicitPrecompiledModules/XCUIAutomation-TZ31D0DG18LS.swiftmodule

SwiftExplicitDependencyGeneratePcm arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/SwiftExplicitPrecompiledModules/XCTest-4PG0HZJ7656FN6OMBLKWV8V0N.pcm

SwiftExplicitDependencyCompileModuleFromInterface arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/SwiftExplicitPrecompiledModules/XCTest-2J2PUP7E907Z1.swiftmodule

SwiftEmitModule normal arm64 Emitting\ module\ for\ DriverUITests (in target 'DriverUITests' from project 'VoiceKernelDriver')

SwiftCompile normal arm64 /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver/DriverUITests/K00DriverTests.swift (in target 'DriverUITests' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    

SwiftCompile normal arm64 Compiling\ K00DriverTests.swift /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver/DriverUITests/K00DriverTests.swift (in target 'DriverUITests' from project 'VoiceKernelDriver')

SwiftCompile normal arm64 /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver/DriverUITests/K00DriverTests.swift (in target 'DriverUITests' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    

SwiftDriverJobDiscovery normal arm64 Emitting module for DriverUITests (in target 'DriverUITests' from project 'VoiceKernelDriver')

SwiftDriver\ Compilation\ Requirements DriverUITests normal arm64 com.apple.xcode.tools.swift.compiler (in target 'DriverUITests' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    builtin-Swift-Compilation-Requirements -- /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/swiftc -module-name DriverUITests -Onone -enforce-exclusivity\=checked @/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/Objects-normal/arm64/DriverUITests.SwiftFileList -DDEBUG -module-alias Testing\=_Testing_Unavailable -plugin-path /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/lib/swift/host/plugins/testing -enable-bare-slash-regex -enable-experimental-feature DebugDescriptionMacro -sdk /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -target arm64-apple-ios16.0 -g -module-cache-path /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex -Xfrontend -serialize-debugging-options -enable-testing -index-store-path /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Index.noindex/DataStore -Xcc -D_LIBCPP_HARDENING_MODE\=_LIBCPP_HARDENING_MODE_DEBUG -swift-version 5 -I /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos -Isystem /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/usr/lib -F /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos -F /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/Library/Frameworks -F /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk/Developer/Library/Frameworks -parse-as-library -c -j16 -enable-batch-mode -incremental -Xcc -ivfsstatcache -Xcc /tmp/vpio-01b-driver-compile-de3efd3fb-derived/SDKStatCaches.noindex/iphoneos26.2-23C57-3794476bd08197c3e2abd9bb477ef7f7.sdkstatcache -output-file-map /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/Objects-normal/arm64/DriverUITests-OutputFileMap.json -use-frontend-parseable-output -save-temps -no-color-diagnostics -explicit-module-build -module-cache-path /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/SwiftExplicitPrecompiledModules -clang-scanner-module-cache-path /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex -sdk-module-cache-path /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex -serialize-diagnostics -emit-dependencies -emit-module -emit-module-path /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/Objects-normal/arm64/DriverUITests.swiftmodule -validate-clang-modules-once -clang-build-session-file /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/Session.modulevalidation -Xcc -I/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/swift-overrides.hmap -emit-const-values -Xfrontend -const-gather-protocols-file -Xfrontend /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/Objects-normal/arm64/DriverUITests_const_extract_protocols.json -Xcc -iquote -Xcc /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/DriverUITests-generated-files.hmap -Xcc -I/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/DriverUITests-own-target-headers.hmap -Xcc -I/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/DriverUITests-all-target-headers.hmap -Xcc -iquote -Xcc /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/DriverUITests-project-headers.hmap -Xcc -I/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/include -Xcc -I/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/DerivedSources-normal/arm64 -Xcc -I/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/DerivedSources/arm64 -Xcc -I/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/DerivedSources -Xcc -DDEBUG\=1 -emit-objc-header -emit-objc-header-path /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/Objects-normal/arm64/DriverUITests-Swift.h -working-directory /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver -experimental-emit-module-separately -disable-cmo

SwiftMergeGeneratedHeaders /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/DerivedSources/DriverUITests-Swift.h /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/Objects-normal/arm64/DriverUITests-Swift.h (in target 'DriverUITests' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    builtin-swiftHeaderTool -arch arm64 /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/Objects-normal/arm64/DriverUITests-Swift.h -o /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/DerivedSources/DriverUITests-Swift.h

Copy /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests.swiftmodule/arm64-apple-ios.swiftdoc /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/Objects-normal/arm64/DriverUITests.swiftdoc (in target 'DriverUITests' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    builtin-copy -exclude .DS_Store -exclude CVS -exclude .svn -exclude .git -exclude .hg -resolve-src-symlinks -rename /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/Objects-normal/arm64/DriverUITests.swiftdoc /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests.swiftmodule/arm64-apple-ios.swiftdoc

Copy /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests.swiftmodule/arm64-apple-ios.abi.json /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/Objects-normal/arm64/DriverUITests.abi.json (in target 'DriverUITests' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    builtin-copy -exclude .DS_Store -exclude CVS -exclude .svn -exclude .git -exclude .hg -resolve-src-symlinks -rename /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/Objects-normal/arm64/DriverUITests.abi.json /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests.swiftmodule/arm64-apple-ios.abi.json

Copy /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests.swiftmodule/arm64-apple-ios.swiftmodule /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/Objects-normal/arm64/DriverUITests.swiftmodule (in target 'DriverUITests' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    builtin-copy -exclude .DS_Store -exclude CVS -exclude .svn -exclude .git -exclude .hg -resolve-src-symlinks -rename /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/Objects-normal/arm64/DriverUITests.swiftmodule /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests.swiftmodule/arm64-apple-ios.swiftmodule

Copy /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests.swiftmodule/Project/arm64-apple-ios.swiftsourceinfo /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/Objects-normal/arm64/DriverUITests.swiftsourceinfo (in target 'DriverUITests' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    builtin-copy -exclude .DS_Store -exclude CVS -exclude .svn -exclude .git -exclude .hg -resolve-src-symlinks -rename /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/Objects-normal/arm64/DriverUITests.swiftsourceinfo /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests.swiftmodule/Project/arm64-apple-ios.swiftsourceinfo

SwiftDriverJobDiscovery normal arm64 Compiling K00DriverTests.swift (in target 'DriverUITests' from project 'VoiceKernelDriver')

SwiftDriver\ Compilation DriverUITests normal arm64 com.apple.xcode.tools.swift.compiler (in target 'DriverUITests' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    builtin-Swift-Compilation -- /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/swiftc -module-name DriverUITests -Onone -enforce-exclusivity\=checked @/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/Objects-normal/arm64/DriverUITests.SwiftFileList -DDEBUG -module-alias Testing\=_Testing_Unavailable -plugin-path /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/lib/swift/host/plugins/testing -enable-bare-slash-regex -enable-experimental-feature DebugDescriptionMacro -sdk /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -target arm64-apple-ios16.0 -g -module-cache-path /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex -Xfrontend -serialize-debugging-options -enable-testing -index-store-path /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Index.noindex/DataStore -Xcc -D_LIBCPP_HARDENING_MODE\=_LIBCPP_HARDENING_MODE_DEBUG -swift-version 5 -I /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos -Isystem /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/usr/lib -F /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos -F /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/Library/Frameworks -F /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk/Developer/Library/Frameworks -parse-as-library -c -j16 -enable-batch-mode -incremental -Xcc -ivfsstatcache -Xcc /tmp/vpio-01b-driver-compile-de3efd3fb-derived/SDKStatCaches.noindex/iphoneos26.2-23C57-3794476bd08197c3e2abd9bb477ef7f7.sdkstatcache -output-file-map /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/Objects-normal/arm64/DriverUITests-OutputFileMap.json -use-frontend-parseable-output -save-temps -no-color-diagnostics -explicit-module-build -module-cache-path /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/SwiftExplicitPrecompiledModules -clang-scanner-module-cache-path /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex -sdk-module-cache-path /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex -serialize-diagnostics -emit-dependencies -emit-module -emit-module-path /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/Objects-normal/arm64/DriverUITests.swiftmodule -validate-clang-modules-once -clang-build-session-file /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/Session.modulevalidation -Xcc -I/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/swift-overrides.hmap -emit-const-values -Xfrontend -const-gather-protocols-file -Xfrontend /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/Objects-normal/arm64/DriverUITests_const_extract_protocols.json -Xcc -iquote -Xcc /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/DriverUITests-generated-files.hmap -Xcc -I/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/DriverUITests-own-target-headers.hmap -Xcc -I/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/DriverUITests-all-target-headers.hmap -Xcc -iquote -Xcc /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/DriverUITests-project-headers.hmap -Xcc -I/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/include -Xcc -I/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/DerivedSources-normal/arm64 -Xcc -I/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/DerivedSources/arm64 -Xcc -I/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/DerivedSources -Xcc -DDEBUG\=1 -emit-objc-header -emit-objc-header-path /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/Objects-normal/arm64/DriverUITests-Swift.h -working-directory /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver -experimental-emit-module-separately -disable-cmo

SwiftDriverJobDiscovery normal arm64 Compiling DriverHostApp.swift (in target 'DriverHost' from project 'VoiceKernelDriver')

SwiftDriver\ Compilation DriverHost normal arm64 com.apple.xcode.tools.swift.compiler (in target 'DriverHost' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    builtin-Swift-Compilation -- /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/swiftc -module-name DriverHost -Onone -enforce-exclusivity\=checked @/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/Objects-normal/arm64/DriverHost.SwiftFileList -DDEBUG -enable-bare-slash-regex -enable-experimental-feature DebugDescriptionMacro -sdk /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -target arm64-apple-ios16.0 -g -module-cache-path /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex -Xfrontend -serialize-debugging-options -enable-testing -index-store-path /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Index.noindex/DataStore -Xcc -D_LIBCPP_HARDENING_MODE\=_LIBCPP_HARDENING_MODE_DEBUG -swift-version 5 -I /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos -F /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos -parse-as-library -c -j16 -enable-batch-mode -incremental -Xcc -ivfsstatcache -Xcc /tmp/vpio-01b-driver-compile-de3efd3fb-derived/SDKStatCaches.noindex/iphoneos26.2-23C57-3794476bd08197c3e2abd9bb477ef7f7.sdkstatcache -output-file-map /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/Objects-normal/arm64/DriverHost-OutputFileMap.json -use-frontend-parseable-output -save-temps -no-color-diagnostics -explicit-module-build -module-cache-path /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/SwiftExplicitPrecompiledModules -clang-scanner-module-cache-path /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex -sdk-module-cache-path /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex -serialize-diagnostics -emit-dependencies -emit-module -emit-module-path /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/Objects-normal/arm64/DriverHost.swiftmodule -validate-clang-modules-once -clang-build-session-file /tmp/vpio-01b-driver-compile-de3efd3fb-derived/ModuleCache.noindex/Session.modulevalidation -Xcc -I/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/swift-overrides.hmap -emit-const-values -Xfrontend -const-gather-protocols-file -Xfrontend /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/Objects-normal/arm64/DriverHost_const_extract_protocols.json -Xcc -iquote -Xcc /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/DriverHost-generated-files.hmap -Xcc -I/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/DriverHost-own-target-headers.hmap -Xcc -I/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/DriverHost-all-target-headers.hmap -Xcc -iquote -Xcc /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/DriverHost-project-headers.hmap -Xcc -I/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/include -Xcc -I/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/DerivedSources-normal/arm64 -Xcc -I/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/DerivedSources/arm64 -Xcc -I/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/DerivedSources -Xcc -DDEBUG\=1 -emit-objc-header -emit-objc-header-path /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/Objects-normal/arm64/DriverHost-Swift.h -working-directory /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver -experimental-emit-module-separately -disable-cmo

Ld /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverHost.app/DriverHost.debug.dylib normal (in target 'DriverHost' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang -Xlinker -reproducible -target arm64-apple-ios16.0 -dynamiclib -isysroot /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -O0 -L/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/EagerLinkingTBDs/Debug-iphoneos -L/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos -F/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/EagerLinkingTBDs/Debug-iphoneos -F/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos -filelist /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/Objects-normal/arm64/DriverHost.LinkFileList -install_name @rpath/DriverHost.debug.dylib -Xlinker -rpath -Xlinker /usr/lib/swift -Xlinker -rpath -Xlinker @executable_path/Frameworks -dead_strip -Xlinker -object_path_lto -Xlinker /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/Objects-normal/arm64/DriverHost_lto.o -rdynamic -Xlinker -no_deduplicate -Xlinker -dependency_info -Xlinker /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/Objects-normal/arm64/DriverHost_dependency_info.dat -fobjc-link-runtime -L/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/lib/swift/iphoneos -L/usr/lib/swift -Xlinker -add_ast_path -Xlinker /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/Objects-normal/arm64/DriverHost.swiftmodule @/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/Objects-normal/arm64/DriverHost-linker-args.resp -Xlinker -alias -Xlinker _main -Xlinker ___debug_main_executable_dylib_entry_point -o /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverHost.app/DriverHost.debug.dylib

ConstructStubExecutorLinkFileList /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/DriverHost-ExecutorLinkFileList-normal-arm64.txt (in target 'DriverHost' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    construct-stub-executor-link-file-list /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverHost.app/DriverHost.debug.dylib /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/usr/lib/libPreviewsJITStubExecutor_no_swift_entry_point.a /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/usr/lib/libPreviewsJITStubExecutor.a --output /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/DriverHost-ExecutorLinkFileList-normal-arm64.txt
note: Using stub executor library with Swift entry point. (in target 'DriverHost' from project 'VoiceKernelDriver')

Ld /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverHost.app/DriverHost normal (in target 'DriverHost' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang -Xlinker -reproducible -target arm64-apple-ios16.0 -isysroot /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -O0 -L/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos -F/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos -Xlinker -rpath -Xlinker @executable_path -Xlinker -rpath -Xlinker @executable_path/Frameworks -rdynamic -Xlinker -no_deduplicate -e ___debug_blank_executor_main -Xlinker -sectcreate -Xlinker __TEXT -Xlinker __debug_dylib -Xlinker /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/DriverHost-DebugDylibPath-normal-arm64.txt -Xlinker -sectcreate -Xlinker __TEXT -Xlinker __debug_instlnm -Xlinker /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/DriverHost-DebugDylibInstallName-normal-arm64.txt -Xlinker -filelist -Xlinker /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/DriverHost-ExecutorLinkFileList-normal-arm64.txt /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverHost.app/DriverHost.debug.dylib -o /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverHost.app/DriverHost

CopySwiftLibs /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverHost.app (in target 'DriverHost' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    builtin-swiftStdLibTool --copy --verbose --scan-executable /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverHost.app/DriverHost.debug.dylib --scan-folder /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverHost.app/Frameworks --scan-folder /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverHost.app/PlugIns --scan-folder /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverHost.app/SystemExtensions --scan-folder /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverHost.app/Extensions --platform iphoneos --toolchain /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain --destination /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverHost.app/Frameworks --strip-bitcode --strip-bitcode-tool /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/bitcode_strip --emit-dependency-info /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/SwiftStdLibToolInputDependencies.dep --filter-for-swift-os --back-deploy-swift-span
Ignoring --strip-bitcode because --sign was not passed

ExtractAppIntentsMetadata (in target 'DriverHost' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/appintentsmetadataprocessor --toolchain-dir /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain --module-name DriverHost --sdk-root /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk --xcode-version 17C529 --platform-family iOS --deployment-target 16.0 --bundle-identifier life.soullab.voicekernel.driverhost --output /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverHost.app --target-triple arm64-apple-ios16.0 --binary-file /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverHost.app/DriverHost --dependency-file /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/Objects-normal/arm64/DriverHost_dependency_info.dat --stringsdata-file /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/Objects-normal/arm64/ExtractedAppShortcutsMetadata.stringsdata --source-file-list /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/Objects-normal/arm64/DriverHost.SwiftFileList --metadata-file-list /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/DriverHost.DependencyMetadataFileList --static-metadata-file-list /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/DriverHost.DependencyStaticMetadataFileList --swift-const-vals-list /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/Objects-normal/arm64/DriverHost.SwiftConstValuesFileList --compile-time-extraction --deployment-aware-processing --validate-assistant-intents --no-app-shortcuts-localization
2026-09-14 15:09:53.286 appintentsmetadataprocessor[35221:29626144] Starting appintentsmetadataprocessor export
2026-09-14 15:09:53.291 appintentsmetadataprocessor[35221:29626144] warning: Metadata extraction skipped. No AppIntents.framework dependency found.

AppIntentsSSUTraining (in target 'DriverHost' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/appintentsnltrainingprocessor --infoplist-path /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverHost.app/Info.plist --temp-dir-path /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/ssu --bundle-id life.soullab.voicekernel.driverhost --product-path /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverHost.app --extracted-metadata-path /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverHost.app/Metadata.appintents --metadata-file-list /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverHost.build/DriverHost.DependencyMetadataFileList --archive-ssu-assets
2026-09-14 15:09:53.305 appintentsnltrainingprocessor[35222:29626145] Parsing options for appintentsnltrainingprocessor
2026-09-14 15:09:53.305 appintentsnltrainingprocessor[35222:29626145] No AppShortcuts found - Skipping.

RegisterExecutionPolicyException /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverHost.app (in target 'DriverHost' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    builtin-RegisterExecutionPolicyException /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverHost.app

Validate /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverHost.app (in target 'DriverHost' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    builtin-validationUtility /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverHost.app -shallow-bundle -infoplist-subpath Info.plist

Touch /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverHost.app (in target 'DriverHost' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    /usr/bin/touch -c /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverHost.app

ProcessInfoPlistFile /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests-Runner.app/PlugIns/DriverUITests.xctest/Info.plist /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/empty-DriverUITests.plist (in target 'DriverUITests' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    builtin-infoPlistUtility /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/empty-DriverUITests.plist -producttype com.apple.product-type.bundle.ui-testing -expandbuildsettings -format binary -platform iphoneos -additionalcontentfile /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/ProductTypeInfoPlistAdditions.plist -requiredArchitecture arm64 -o /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests-Runner.app/PlugIns/DriverUITests.xctest/Info.plist

Ld /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests-Runner.app/PlugIns/DriverUITests.xctest/DriverUITests normal (in target 'DriverUITests' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang -Xlinker -reproducible -target arm64-apple-ios16.0 -bundle -isysroot /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -O0 -L/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/EagerLinkingTBDs/Debug-iphoneos -L/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos -L/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/usr/lib -F/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/EagerLinkingTBDs/Debug-iphoneos -F/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos -iframework /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/Library/Frameworks -iframework /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk/Developer/Library/Frameworks -filelist /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/Objects-normal/arm64/DriverUITests.LinkFileList -Xlinker -rpath -Xlinker /usr/lib/swift -Xlinker -rpath -Xlinker @loader_path/Frameworks -Xlinker -rpath -Xlinker @executable_path/Frameworks -dead_strip -Xlinker -object_path_lto -Xlinker /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/Objects-normal/arm64/DriverUITests_lto.o -rdynamic -Xlinker -no_deduplicate -Xlinker -dependency_info -Xlinker /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/Objects-normal/arm64/DriverUITests_dependency_info.dat -fobjc-link-runtime -L/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/lib/swift/iphoneos -L/usr/lib/swift -Xlinker -add_ast_path -Xlinker /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/Objects-normal/arm64/DriverUITests.swiftmodule @/tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/Objects-normal/arm64/DriverUITests-linker-args.resp -Xlinker -needed_framework -Xlinker XCTest -framework XCTest -Xlinker -needed-lXCTestSwiftSupport -lXCTestSwiftSupport -o /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests-Runner.app/PlugIns/DriverUITests.xctest/DriverUITests

CopySwiftLibs /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests-Runner.app/PlugIns/DriverUITests.xctest (in target 'DriverUITests' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    builtin-swiftStdLibTool --copy --verbose --scan-executable /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests-Runner.app/PlugIns/DriverUITests.xctest/DriverUITests --scan-folder /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests-Runner.app/PlugIns/DriverUITests.xctest/Frameworks --scan-folder /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests-Runner.app/PlugIns/DriverUITests.xctest/PlugIns --scan-folder /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests-Runner.app/PlugIns/DriverUITests.xctest/SystemExtensions --scan-folder /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests-Runner.app/PlugIns/DriverUITests.xctest/Extensions --platform iphoneos --toolchain /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain --destination /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests-Runner.app/PlugIns/DriverUITests.xctest/Frameworks --strip-bitcode --scan-executable /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/usr/lib/libXCTestSwiftSupport.dylib --strip-bitcode-tool /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/bitcode_strip --emit-dependency-info /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/SwiftStdLibToolInputDependencies.dep --filter-for-swift-os --back-deploy-swift-span
Ignoring --strip-bitcode because --sign was not passed

ExtractAppIntentsMetadata (in target 'DriverUITests' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/appintentsmetadataprocessor --toolchain-dir /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain --module-name DriverUITests --sdk-root /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk --xcode-version 17C529 --platform-family iOS --deployment-target 16.0 --bundle-identifier life.soullab.voicekernel.driver.xctest --output /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests-Runner.app/PlugIns/DriverUITests.xctest --target-triple arm64-apple-ios16.0 --binary-file /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests-Runner.app/PlugIns/DriverUITests.xctest/DriverUITests --dependency-file /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/Objects-normal/arm64/DriverUITests_dependency_info.dat --stringsdata-file /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/Objects-normal/arm64/ExtractedAppShortcutsMetadata.stringsdata --source-file-list /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/Objects-normal/arm64/DriverUITests.SwiftFileList --metadata-file-list /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/DriverUITests.DependencyMetadataFileList --static-metadata-file-list /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/DriverUITests.DependencyStaticMetadataFileList --swift-const-vals-list /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/Objects-normal/arm64/DriverUITests.SwiftConstValuesFileList --compile-time-extraction --deployment-aware-processing --validate-assistant-intents --no-app-shortcuts-localization
2026-09-14 15:09:53.448 appintentsmetadataprocessor[35226:29626167] Starting appintentsmetadataprocessor export
2026-09-14 15:09:53.450 appintentsmetadataprocessor[35226:29626167] warning: Metadata extraction skipped. No AppIntents.framework dependency found.

GenerateDSYMFile /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests-Runner.app/PlugIns/DriverUITests.xctest.dSYM /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests-Runner.app/PlugIns/DriverUITests.xctest/DriverUITests (in target 'DriverUITests' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/dsymutil /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests-Runner.app/PlugIns/DriverUITests.xctest/DriverUITests -o /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests-Runner.app/PlugIns/DriverUITests.xctest.dSYM

AppIntentsSSUTraining (in target 'DriverUITests' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/appintentsnltrainingprocessor --infoplist-path /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests-Runner.app/PlugIns/DriverUITests.xctest/Info.plist --temp-dir-path /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/ssu --bundle-id life.soullab.voicekernel.driver.xctest --product-path /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests-Runner.app/PlugIns/DriverUITests.xctest --extracted-metadata-path /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests-Runner.app/PlugIns/DriverUITests.xctest/Metadata.appintents --metadata-file-list /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Intermediates.noindex/VoiceKernelDriver.build/Debug-iphoneos/DriverUITests.build/DriverUITests.DependencyMetadataFileList --archive-ssu-assets
2026-09-14 15:09:53.461 appintentsnltrainingprocessor[35228:29626169] Parsing options for appintentsnltrainingprocessor
2026-09-14 15:09:53.462 appintentsnltrainingprocessor[35228:29626169] No AppShortcuts found - Skipping.

CopyPlistFile /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests-Runner.app/Info.plist /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/Library/Xcode/Agents/XCTRunner.app/Info.plist (in target 'DriverUITests' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    builtin-copyPlist --validate --convert xml1 --macro-expansion WRAPPEDPRODUCTNAME DriverUITests-Runner --macro-expansion WRAPPEDPRODUCTBUNDLEIDENTIFIER life.soullab.voicekernel.driver.xctest.xctrunner --macro-expansion TESTPRODUCTNAME DriverUITests --macro-expansion TESTPRODUCTBUNDLEIDENTIFIER life.soullab.voicekernel.driver.xctest --copy-value UIDeviceFamily /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests-Runner.app/PlugIns/DriverUITests.xctest/Info.plist --outdir /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests-Runner.app -- /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/Library/Xcode/Agents/XCTRunner.app/Info.plist

Copy /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests-Runner.app/PkgInfo /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/Library/Xcode/Agents/XCTRunner.app/PkgInfo (in target 'DriverUITests' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    builtin-copy -exclude .DS_Store -exclude CVS -exclude .svn -exclude .git -exclude .hg -resolve-src-symlinks /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/Library/Xcode/Agents/XCTRunner.app/PkgInfo /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests-Runner.app

CopyAndPreserveArchs /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests-Runner.app/DriverUITests-Runner (in target 'DriverUITests' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/lipo /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/Library/Xcode/Agents/XCTRunner.app/XCTRunner -output /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests-Runner.app/DriverUITests-Runner -extract arm64

Copy /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests-Runner.app/Frameworks/XCTestSupport.framework /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/Library/PrivateFrameworks/XCTestSupport.framework (in target 'DriverUITests' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    builtin-copy -exclude .DS_Store -exclude CVS -exclude .svn -exclude .git -exclude .hg -exclude Headers -exclude PrivateHeaders -exclude Modules -exclude \*.tbd -resolve-src-symlinks /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/Library/PrivateFrameworks/XCTestSupport.framework /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests-Runner.app/Frameworks

Copy /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests-Runner.app/Frameworks/XCUIAutomation.framework /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/Library/Frameworks/XCUIAutomation.framework (in target 'DriverUITests' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    builtin-copy -exclude .DS_Store -exclude CVS -exclude .svn -exclude .git -exclude .hg -exclude Headers -exclude PrivateHeaders -exclude Modules -exclude \*.tbd -resolve-src-symlinks /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/Library/Frameworks/XCUIAutomation.framework /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests-Runner.app/Frameworks

Copy /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests-Runner.app/Frameworks/libXCTestSwiftSupport.dylib /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/usr/lib/libXCTestSwiftSupport.dylib (in target 'DriverUITests' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    builtin-copy -exclude .DS_Store -exclude CVS -exclude .svn -exclude .git -exclude .hg -exclude Headers -exclude PrivateHeaders -exclude Modules -exclude \*.tbd -resolve-src-symlinks /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/usr/lib/libXCTestSwiftSupport.dylib /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests-Runner.app/Frameworks

Copy /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests-Runner.app/Frameworks/XCUnit.framework /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/Library/PrivateFrameworks/XCUnit.framework (in target 'DriverUITests' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    builtin-copy -exclude .DS_Store -exclude CVS -exclude .svn -exclude .git -exclude .hg -exclude Headers -exclude PrivateHeaders -exclude Modules -exclude \*.tbd -resolve-src-symlinks /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/Library/PrivateFrameworks/XCUnit.framework /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests-Runner.app/Frameworks

MkDir /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests-Runner.app (in target 'DriverUITests' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    /bin/mkdir -p /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests-Runner.app

Copy /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests-Runner.app/Frameworks/XCTestCore.framework /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/Library/PrivateFrameworks/XCTestCore.framework (in target 'DriverUITests' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    builtin-copy -exclude .DS_Store -exclude CVS -exclude .svn -exclude .git -exclude .hg -exclude Headers -exclude PrivateHeaders -exclude Modules -exclude \*.tbd -resolve-src-symlinks /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/Library/PrivateFrameworks/XCTestCore.framework /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests-Runner.app/Frameworks

Copy /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests-Runner.app/Frameworks/XCTest.framework /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/Library/Frameworks/XCTest.framework (in target 'DriverUITests' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    builtin-copy -exclude .DS_Store -exclude CVS -exclude .svn -exclude .git -exclude .hg -exclude Headers -exclude PrivateHeaders -exclude Modules -exclude \*.tbd -resolve-src-symlinks /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/Library/Frameworks/XCTest.framework /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests-Runner.app/Frameworks

Copy /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests-Runner.app/Frameworks/XCTAutomationSupport.framework /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/Library/PrivateFrameworks/XCTAutomationSupport.framework (in target 'DriverUITests' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    builtin-copy -exclude .DS_Store -exclude CVS -exclude .svn -exclude .git -exclude .hg -exclude Headers -exclude PrivateHeaders -exclude Modules -exclude \*.tbd -resolve-src-symlinks /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/Library/PrivateFrameworks/XCTAutomationSupport.framework /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests-Runner.app/Frameworks

Copy /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests-Runner.app/Frameworks/Testing.framework /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/Library/Frameworks/Testing.framework (in target 'DriverUITests' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    builtin-copy -exclude .DS_Store -exclude CVS -exclude .svn -exclude .git -exclude .hg -exclude Headers -exclude PrivateHeaders -exclude Modules -exclude \*.tbd -resolve-src-symlinks /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/Library/Frameworks/Testing.framework /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests-Runner.app/Frameworks

RegisterExecutionPolicyException /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests-Runner.app/PlugIns/DriverUITests.xctest (in target 'DriverUITests' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    builtin-RegisterExecutionPolicyException /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests-Runner.app/PlugIns/DriverUITests.xctest

Touch /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests-Runner.app/PlugIns/DriverUITests.xctest (in target 'DriverUITests' from project 'VoiceKernelDriver')
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver
    /usr/bin/touch -c /tmp/vpio-01b-driver-compile-de3efd3fb-derived/Build/Products/Debug-iphoneos/DriverUITests-Runner.app/PlugIns/DriverUITests.xctest

** TEST BUILD SUCCEEDED **

ComputePackagePrebuildTargetDependencyGraph

Prepare packages

CreateBuildRequest

SendProjectDescription

CreateBuildOperation

ComputeTargetDependencyGraph
note: Building targets in dependency order
note: Target dependency graph (2 targets)
    Target 'DriverUITests' in project 'VoiceKernelDriver'
        ➜ Explicit dependency on target 'DriverHost' in project 'VoiceKernelDriver'
    Target 'DriverHost' in project 'VoiceKernelDriver' (no dependencies)

GatherProvisioningInputs

ClangStatCache /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang-stat-cache /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk /tmp/vpio-01b-driver-compile-de3efd3fb-derived/SDKStatCaches.noindex/iphoneos26.2-23C57-3794476bd08197c3e2abd9bb477ef7f7.sdkstatcache
    cd /tmp/vpio-01b-driver-compile-de3efd3fb/ios/VoiceKernelDriver/VoiceKernelDriver.xcodeproj
    /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang-stat-cache /Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer/SDKs/iPhoneOS26.2.sdk -o /tmp/vpio-01b-driver-compile-de3efd3fb-derived/SDKStatCaches.noindex/iphoneos26.2-23C57-3794476bd08197c3e2abd9bb477ef7f7.sdkstatcache

** TEST BUILD SUCCEEDED **
````

## Standing

```text
VPIO-01B instrument       de3efd3fb · IMPLEMENTED · COMPILE GREEN
first-install absence     HELD · just-in-time only
VPIO artifact install     NOT AUTHORIZED
VPIO launch               NOT AUTHORIZED
VPIO sample               NOT AUTHORIZED
N=30 F-W1 witness         NOT AUTHORIZED
F-W1                      UNSPENT
historical K00/R1         UNTOUCHED
KERNEL-01                 CLOSED
BENCH-01                  CLOSED
BRIDGE-01                 CLOSED
MIGRATE-01                CLOSED
JOP-04                    UNTOUCHED
```

A green driver compile establishes only that the external witness instrument builds. It does not authorize the just-in-time absence read, artifact install, launch, or physiological witness.
