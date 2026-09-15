set -e
SHA=f0c6ae13b88db29cbd1537bec585d98376c8bc4f
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
WT=/private/tmp/sid-mac-compile-01-$SHA
DD=$WT-derived
OUT=/private/tmp/sid-mac-compile-01-out-$STAMP
mkdir -p "$OUT"
test ! -e "$WT"
cd /Users/soullab/MAIA-SOVEREIGN
git fetch origin claude/voice-2026-census-01
git worktree add --detach "$WT" "$SHA"
cd "$WT"
git rev-parse HEAD | tee "$OUT/head.txt"
test "$(git rev-parse HEAD)" = "$SHA"
git status --porcelain | tee "$OUT/status-before.txt"
test -z "$(git status --porcelain)"
ln -s /Users/soullab/MAIA-SOVEREIGN/node_modules node_modules
xcodebuild -version | tee "$OUT/toolchain.txt"
xcodegen --version | tee -a "$OUT/toolchain.txt"
xcrun swift --version 2>&1 | head -1 | tee -a "$OUT/toolchain.txt"
npx jest --config jest.config.js __tests__/voice-kernel-00-source-gates.test.ts 2>&1 | tee "$OUT/gate.log" | tail -5
grep -E 'Tests:\s+82 passed, 82 total' "$OUT/gate.log"
( cd ios/VoiceKernel && xcrun swift build 2>&1 ) | tee "$OUT/swift-build.log" | tail -3
( cd ios/VoiceKernel && xcrun swift test 2>&1 ) | tee "$OUT/swift-test.log" | grep -E 'Executed|error|failed' | tail -4
grep -E 'Executed [0-9]+ tests, with 0 failures' "$OUT/swift-test.log"
grep -E 'SourceEstimatorTests' "$OUT/swift-test.log" | grep -E "passed" | wc -l | tee "$OUT/source-tests-passed-count.txt"
( cd ios/VoiceKernelHarness && xcodegen generate 2>&1 ) | tee "$OUT/xcodegen.log" | tail -2
( cd ios/VoiceKernelHarness && xcodebuild -project VoiceKernelHarness.xcodeproj -scheme VoiceKernelHarness -destination 'generic/platform=iOS' -derivedDataPath "$DD" CODE_SIGNING_ALLOWED=NO build ) > "$OUT/xcodebuild-unsigned.log" 2>&1 || true
grep -E '\*\* BUILD (SUCCEEDED|FAILED) \*\*' "$OUT/xcodebuild-unsigned.log" | tee -a "$OUT/build-results.txt"
grep -q 'BUILD SUCCEEDED' "$OUT/xcodebuild-unsigned.log"
( cd ios/VoiceKernelHarness && xcodebuild -project VoiceKernelHarness.xcodeproj -scheme VoiceKernelHarness -destination id=00008140-00163D9922E0801C -derivedDataPath "$DD" DEVELOPMENT_TEAM=ZVK2X646Z2 CODE_SIGN_STYLE=Automatic -allowProvisioningUpdates build ) > "$OUT/xcodebuild-signed.log" 2>&1 || true
grep -E '\*\* BUILD (SUCCEEDED|FAILED) \*\*' "$OUT/xcodebuild-signed.log" | tee -a "$OUT/build-results.txt"
grep -q 'BUILD SUCCEEDED' "$OUT/xcodebuild-signed.log"
P="$DD/Build/Products/Debug-iphoneos/VoiceKernelHarness.app"
/usr/libexec/PlistBuddy -c 'Print CFBundleIdentifier' -c 'Print CFBundleDisplayName' "$P/Info.plist" | tee "$OUT/identity.txt"
test "$(/usr/libexec/PlistBuddy -c 'Print CFBundleIdentifier' "$P/Info.plist")" = life.soullab.voicekernel.vpio02sid
test "$(/usr/libexec/PlistBuddy -c 'Print CFBundleDisplayName' "$P/Info.plist")" = 'VoiceKernel VPIO-02-SID'
dwarfdump --uuid "$P/VoiceKernelHarness.debug.dylib" | tee -a "$OUT/identity.txt"
shasum -a 256 "$P/VoiceKernelHarness.debug.dylib" "$P/VoiceKernelHarness" | tee -a "$OUT/identity.txt"
( cd "$P" && find . -type f | LC_ALL=C sort | xargs shasum -a 256 ) > "$OUT/SID-MAC-COMPILE-01.manifest.sha256"
shasum -a 256 "$OUT/SID-MAC-COMPILE-01.manifest.sha256" | tee -a "$OUT/identity.txt"
wc -l "$OUT/SID-MAC-COMPILE-01.manifest.sha256" | tee -a "$OUT/identity.txt"
codesign -dv --verbose=2 "$P" 2>&1 | grep -E 'Identifier|TeamIdentifier|Authority' | tee -a "$OUT/identity.txt"
git rev-parse HEAD | tee "$OUT/head-after.txt"
test "$(git rev-parse HEAD)" = "$SHA"
git status --porcelain | tee "$OUT/status-after.txt"
git diff --stat | tee "$OUT/diff-after.txt"
git diff --quiet -- ios/VoiceKernel ios/VoiceKernelHarness/project.yml scripts __tests__
( cd "$OUT" && find . -type f | LC_ALL=C sort | xargs shasum -a 256 ) > "$OUT/SHA256SUMS.compile"
echo "SID-MAC-COMPILE-01 $STAMP subject $SHA out $OUT"
