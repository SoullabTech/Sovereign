# KERNEL-00 · DEVICE WITNESS · RUN 2 — 2026-09-11

**Status: OPEN — installed, not yet launched.**
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

Next: unlock the phone, rerun the same launch command, then the §0-style pre-enter checkpoint (liveness · append · export) **before** any Enter.

## 5. Pre-enter checkpoint — PENDING
## 6. Enter conversation — PENDING (the observation of record is the exported journal, then any device crash report; a report must list dylib UUID `1AEBEE45-…`)
## 7. Findings — PENDING
## 8. Standing — OPEN · INSTALLED · NOT LAUNCHED
