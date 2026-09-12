# KERNEL-00 · DEVICE WITNESS · RUN 2 — 2026-09-11

**Status: OPEN — installed · LAUNCHED (attempt 3) · harness idle on screen · pre-enter checkpoint FROZEN (K00-c9bdd9a0) · Enter NOT YET PRESSED.**
**Subject SHA:** `728924819` (PRE-WITNESS-02 §3 applied; plan `6566ace40` accepted as written).
**Compile of record:** `KERNEL-00_MAC-COMPILE-03_2026-09-11.md` — GREEN (build · test 20/20 · gate 16/16 · xcodegen · unsigned · signed).
**Question this run answers:** with an invalid input format made unreachable at `installTap` (§3.1) and every refused build journalled into the existing RecoveryPolicy road (§3.2/§3.4), does the organism survive **Enter conversation** on this device — and what does the journal show at the entry seam (plan §4, candidate A first)?
**Device:** iPhone 16 Pro Max · iOS 26.6.1 (23G83) Beta · devicectl id `A0736AC8-793B-516F-AC72-C076DB6CEE38`.
**Not changed for this run:** thresholds · architecture · STT/TTS (none) · candidate B/C (not implemented).

## 1. Artifact identity (founder-read on the Mac Studio, pre-install)

```
main executable   UUID 81D0C25C-73C9-39BE-B617-CF1020D0A9A4   (stub executor — build-invariant, NOT the code; see MAC-COMPILE-03 §5)
debug dylib       UUID 1AEBEE45-BF4E-3D6E-9D3A-69CFA6E4218A   (the kernel + harness code — THE binding for this run)
codesign          Identifier=life.soullab.voicekernel.k00 · TeamIdentifier=ZVK2X646Z2
identity          Apple Development: Kelly Nezat (N9DTF6434L) · profile "iOS Team Provisioning Profile: *"
```

Run-1 code identity (the dylib UUID inside the three 16:2x `.ips` reports) is still **UNREAD**: the reports are not under `~/Library/Logs/CrashReporter/MobileDevice/` on the Mac Studio (`zsh: no matches found`). Where the founder pulled them from earlier is not recorded. Owed; does not block this run.

## 2. Pre-install device state

`devicectl device info processes … | grep -iE "maia|voicekernel|App$"` → **empty**. No legacy `/maia` process, no resident harness.

## 3. Install (verbatim, founder, 19:54:00–19:54:04 local)

```
xcrun devicectl device install app --device A0736AC8-793B-516F-AC72-C076DB6CEE38 "$APP"
19:54:00  Acquired tunnel connection to device.
19:54:00  Enabling developer disk image services.
19:54:00  Acquired usage assertion.
App installed:
• bundleID: life.soullab.voicekernel.k00
• installationURL: file:///private/var/containers/Bundle/Application/0E9272DC-44AC-4DE0-8EC8-9E4A09D57ED7/VoiceKernelHarness.app/
• launchServicesIdentifier: unknown
• databaseUUID: 42158240-DA3F-491F-8B75-F106CD31316A
• databaseSequenceNumber: 4104
```

**Install = INSTALLED.** The founder executed the install step that this lane had gated on acceptance of MAC-COMPILE-03; the act is taken as that acceptance by conduct. If the founder intends otherwise, say so and this line is corrected, not the install undone.

## 4. Launch attempts

| # | Time | Launcher | Outcome | Classification |
|---|---|---|---|---|
| 1 | 19:54:05 | `devicectl device process launch … life.soullab.voicekernel.k00` | **REFUSED before the process existed**: `CoreDeviceError 10002` → `FBSOpenApplicationServiceErrorDomain error 1` → `SBMainWorkspace … Locked ("Unable to launch … because the device was not, or could not be, unlocked")` · `FBSOpenApplicationErrorDomain error 7` | **Operator condition** (screen locked). No process, no session mutation, no journal, nothing spent. Not a kernel event. |

| 2 | 19:56:13 | same `devicectl … process launch` | **REFUSED, identical**: `10002` → `FBSOpenApplicationServiceErrorDomain 1` → `SBMainWorkspace … Locked` · `FBSOpenApplicationErrorDomain 7`, request `0x93a1` | **Operator condition again** (screen still locked at the moment of the request). No process, nothing spent. |

`devicectl device info crashes … | grep -iE "VoiceKernel|k00"` at 19:56 → **empty (filtered; raw output NOT preserved)**. A filtered empty cannot distinguish "no VoiceKernel/k00 crash listed" from "`devicectl` itself failed and its error text did not match the filter" (founder caution, adopted). Consistent with no run-2 process having existed, but not proof of it. From here on the crash query is run with the raw capture kept: `… 2>&1 | tee /tmp/maia-device-crashes.txt | grep -iE "VoiceKernel|k00" | head -50`, and an empty filtered result is followed by `tail -50 /tmp/maia-device-crashes.txt` before it is read as anything. (It also did not list the run-1 reports under those names — where those three reports now live remains unrecorded.)

A signed `xcodebuild … BUILD SUCCEEDED` tail appears in the founder's terminal scrollback immediately before attempt 2. Whether that was a fresh build after the 19:54 install, or the 19:49 build's output re-shown, is not established from the paste. If a rebuild occurred, the installed bundle (19:54) and the DerivedData bundle may differ; the dylib UUID must be re-read with `dwarfdump --uuid` and, if it differs from `1AEBEE45-…`, the app reinstalled before launch so that §1 names the bundle that actually runs.

| 3 | phone clock **10:20** (screenshot) | **launcher NOT STATED by the founder** — presumed Home Screen tap after unlocking; to be confirmed in one line | **LAUNCHED.** Harness on screen: `VoiceKernel · K00` · Floor `idle` · `generation 0` · `session inactive` · `inputFlow unknown` · `outputFlow idle` · rms/peak `0.00000 / 0.00000` · `callbacks (gen) 0` · `recovery gen 0 · attempts 0/3` · `Mic: enabled` · `Output: enabled`. Pre-enter state identical in shape to run 1 §0. **Nothing spent.** |

`dwarfdump --uuid "$APP/VoiceKernelHarness.debug.dylib"` in a fresh shell failed with `error: /VoiceKernelHarness.debug.dylib: No such file or directory` — `$APP` was unset in that shell, so the path collapsed to `/VoiceKernelHarness.debug.dylib`. Not evidence about the bundle. The dylib UUID re-read is still owed with the full path (§1 binding stands as `1AEBEE45-…` from the pre-install read until then).

(Previously written before attempt 3, kept for the record:) Next: unlock the phone **and keep it unlocked** (Settings → Display & Brightness → Auto-Lock → Never for the duration of the witness; the runbook's 60-minute session requires it anyway), then launch — either by the same `devicectl` command while the screen is unlocked, or by tapping the `VoiceKernel K00` icon on the Home Screen (a lawful launcher; the record names whichever was used). Then the pre-enter checkpoint (liveness · append · export) **before** any Enter.

## 5. Pre-enter checkpoint — FROZEN (session `K00-c9bdd9a0`)

Two exports received, byte-identical (`kernel00-K00-c9bdd9a0-1789222918.jsonl`, and a second export of the same file). Identical content under the same session id means the same process and **no Enter between them**. Verbatim:

```
{"cause":"didBecomeActive","component":"Harness","event":"app_lifecycle","evidence":{"audioSession":"inactive","floor":"idle","inputFlow":"unknown"},"generation":0,"seq":1,"session":"K00-c9bdd9a0","timeMonotonicMs":836087877}
{"cause":"willResignActive","component":"Harness","event":"app_lifecycle","evidence":{"audioSession":"inactive","floor":"idle","inputFlow":"unknown"},"generation":0,"seq":2,"session":"K00-c9bdd9a0","timeMonotonicMs":836121432}
{"cause":"didBecomeActive","component":"Harness","event":"app_lifecycle","evidence":{"audioSession":"inactive","floor":"idle","inputFlow":"unknown"},"generation":0,"seq":3,"session":"K00-c9bdd9a0","timeMonotonicMs":836196591}
```

Same shape as run 1 §0: liveness PROVEN (recorder alive, `seq` monotonic 1→3), append PROVEN (the resign/active pair is the export share-sheet round-trip, ~34 ms out, ~75 ms back), export PROVEN (non-destructive — the second export reproduces the first exactly). **Zero session mutations before the member act**: `audioSession: inactive` on every record, `generation 0`, no `session_*`, no `command`. K00-01 = pre-enter purity holds; K00-16 consistent; neither spent. The 1,789,222,918 in the filename is the export's epoch-seconds clock.

**Enter NOT YET PRESSED at the time of both exports.**
## 6. Enter conversation — PENDING (the observation of record is the exported journal, then any device crash report; a report must list dylib UUID `1AEBEE45-…`)
## 7. Findings — PENDING
## 8. Standing — OPEN · INSTALLED · LAUNCHED · PRE-ENTER CHECKPOINT FROZEN · ENTER NOT YET PRESSED · NOTHING SPENT
