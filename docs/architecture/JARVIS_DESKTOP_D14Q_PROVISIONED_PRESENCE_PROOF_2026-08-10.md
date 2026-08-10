# JARVIS Desktop D-14Q — Provisioned Presence Proof

**Disposition: D-14Q BLOCKED (Attempt 2) — DEVICE FAILURE (Mac not registered in developer account).**
**Branch:** `chore/jarvis-desktop-d14q-provisioned-presence-proof`, off D-14P clean-retest tip (`73f6ef246`).
**Date:** 2026-08-10 (Attempt 1), 2026-08-10 (Attempt 2, this section, after founder-reported Apple re-auth). **Device:** Mac Studio, Apple M4 Max, macOS 15.7.8.

## Governing sequence

`D-13 ✓ → D-14 (B) → D-14L (C) → D-14P invalidated → clean D-14P discriminating rerun (0ccb13d35) → D-14Q authorized → BLOCKED at Apple account re-authentication`

## §3 — Baseline machine state (captured before creating anything)

- Xcode: **26.3** (Build 17C529), full application, not Command Line Tools only.
- Active developer directory: `/Applications/Xcode.app/Contents/Developer`.
- Code-signing identities (unchanged from D-14P): 3 valid — `Apple Development: Kelly Nezat` and two `iPhone Distribution: Kelly Nezat` entries.
- Certificate evidence (re-confirmed, matches D-14P's independent derivation): X.509 Subject `OU=ZVK2X646Z2`.
- Provisioning profiles installed: **none** (`~/Library/MobileDevice/Provisioning Profiles/` does not exist) — this is the pre-D-14Q baseline, and it is unchanged after this unit (see below).
- Xcode account state: **an account record exists** — `defaults read com.apple.dt.Xcode IDEProvisioningTeamByIdentifier` shows a stored team: `teamID = ZVK2X646Z2`, `teamName = "Kelly Nezat"`, `teamType = Individual`, `isFreeProvisioningTeam = 0` (paid membership, not the free tier). This matched the certificate evidence exactly and was read as a strong signal that no interactive step would be needed.
- **That inference did not hold** — see result below. An account *record* existing is not the same as an account *session* being currently valid; this is the distinction the unit was designed to test, and it is exactly where the block occurred.

## §4 — Provisioning vehicle created

A throwaway macOS app target was generated via `xcodegen` (installed fresh via Homebrew for this unit — a well-known, open-source Apple project generator, chosen specifically so the project is defined by a small, reproducible, inspectable YAML spec rather than a hand-authored or GUI-clicked `.pbxproj`). Files:

- `scripts/builder/design/jarvis-founder-presence-auth/d14q-provisioned-proof/project.yml` — the full, human-readable project definition: bundle id `com.soullab.jarvis.d14q.presenceproof`, `DEVELOPMENT_TEAM: ZVK2X646Z2`, `CODE_SIGN_STYLE: Automatic`, one capability (`keychain-access-groups`, entitlement `$(AppIdentifierPrefix)com.soullab.jarvis.d14q.presenceproof`).
- `Sources/D14QPresenceProofApp.swift` — a trivial empty SwiftUI app, no logic. Exists only so the target has something to build; the actual test logic remains the unchanged D-14P substrate, never touched by this unit.
- `D14QPresenceProof.xcodeproj` — generated output, not committed (regenerable from `project.yml` via `xcodegen generate`; not hand-edited).

Kept fully isolated from production JARVIS/Desktop/runtime code, under the same `design/` convention as D-14/D-14L/D-14P.

## §5 — Command-line provisioning attempt

```
xcodebuild -project D14QPresenceProof.xcodeproj -scheme D14QPresenceProof \
  -configuration Debug -destination 'platform=macOS' -allowProvisioningUpdates build
```

**Exit: BUILD FAILED.**

```
error: The operation couldn't be completed. Unable to log in with account 'soullab1@gmail.com'.
The login details for account 'soullab1@gmail.com' were rejected.
error: No profiles for 'com.soullab.jarvis.d14q.presenceproof' were found: Xcode couldn't find
any Mac App Development provisioning profiles matching 'com.soullab.jarvis.d14q.presenceproof'.
```

Full log captured at `xcodebuild-d14q.log` in the working directory (not committed — build log, not durable evidence needed beyond this record).

## §6 — Interactive stop condition reached

This is precisely the mandate's named stop condition: Apple ID re-authentication. Not routed around.

1. **Command that failed**: the `xcodebuild -allowProvisioningUpdates` invocation above.
2. **Exact Apple/Xcode reason**: the stored Xcode account session for `soullab1@gmail.com` is rejected by Apple — the account *record* (`teamID = ZVK2X646Z2`) exists locally, but its session/token is stale or invalid, so `-allowProvisioningUpdates` has no valid authentication to register the App ID or request a profile with.
3. **Minimum human action required**: Xcode → Settings → Accounts → select `soullab1@gmail.com` → re-authenticate (sign in again, complete 2FA if prompted). Requires the founder's Apple ID and possibly a device-side 2FA approval — cannot be completed by this unit.
4. **What happens immediately after**: rerun the identical `xcodebuild -allowProvisioningUpdates` command unchanged, then proceed to §7 (independently verify the resulting profile's actual authorization before touching the D-14P substrate at all).

## Result discipline (per §11 of the mandate)

- **OBSERVED**: an Xcode account record for the correct team (`ZVK2X646Z2`) exists on this Mac; three valid local signing certificates exist under that team; no provisioning profile exists; `xcodebuild -allowProvisioningUpdates` fails with an explicit account-login rejection, not a generic provisioning failure.
- **INFERRED**: the account *record* existing does not imply the account *session* is currently valid — this was the specific gap the baseline capture's inference ("account already usable by xcodebuild") got wrong, and the mandate's own §3 instruction ("do not infer account readiness merely because a signing certificate exists") is exactly what should have tempered that inference more explicitly beforehand. Recorded here rather than smoothed over.
- **UNRESOLVED**: whether provisioning, once authenticated, will actually clear the D-14P blocker — this remains the open question D-14Q exists to answer, now blocked before reaching it.
- **NOT TESTED**: profile verification (§7), substrate reuse (§8), pristine bundle build (§9), and the full presence sequence (§10) — none of these were reached.

## Cleanup (§13)

- No key material was ever created — the build never produced a runnable, signed binary.
- No persistent Keychain item exists from this unit.
- Provisioning-profile directory remains exactly at its pre-unit baseline: absent.
- The generated `.xcodeproj`, `DerivedData`, and `xcodebuild-d14q.log` were left on local disk (build artifacts, not secrets, not committed) — no deletion was attempted or declined; simply not yet cleaned, and safe to leave or remove at any time (`rm -rf D14QPresenceProof.xcodeproj ~/Library/Developer/Xcode/DerivedData/D14QPresenceProof-*`).

## Commit discipline (§14)

Committed: `project.yml`, `Sources/D14QPresenceProofApp.swift`, this record. Not committed: generated `.xcodeproj`, `DerivedData`, build log, any provisioning artifact (none exists to commit).

## Disposition (Attempt 1)

**D-14Q BLOCKED — APPLE ACCOUNT / PROVISIONING INTERACTION REQUIRED.**

Per §15 of the mandate: stopping here. Not proceeding to Desktop packaging, Electron integration, production wiring, authentication integration, or the next JARVIS work unit. Not attempting to route around the Apple account block. Awaiting the founder's one interactive action (Xcode → Settings → Accounts → re-authenticate `soullab1@gmail.com`), after which the identical command reruns unchanged and this unit continues from §7.

---

## Attempt 2 (2026-08-10, same day — resume after founder-reported Apple re-authentication)

**Explicit resume authorization received.** Founder reported the required human Apple-authentication step (Xcode → Settings → Accounts → re-authenticate `soullab1@gmail.com`, Kelly Nezat Developer Team, Admin role, Certificates/Identifiers/Profiles visible) was completed. Per governing mandate discipline: this was treated only as evidence the human action was completed, not as proof provisioning now works — that had to be proven in Terminal.

### §3 re-verification (state reconciliation before any command)

- Repo: worktree `.../jarvis-d14q-provisioned-presence-proof`, branch `chore/jarvis-desktop-d14q-provisioned-presence-proof`, HEAD `99200cb3e` — unchanged, matches the authorized continuation commit.
- Untracked generated artifacts (`D14QPresenceProof.entitlements`, `D14QPresenceProof.xcodeproj/`, `xcodebuild-d14q.log`) — confirmed to match `project.yml` byte-for-byte in intent (bundle id `com.soullab.jarvis.d14q.presenceproof`, `DEVELOPMENT_TEAM: ZVK2X646Z2`, `CODE_SIGN_STYLE: Automatic`, single `keychain-access-groups` entitlement). Not regenerated, not modified.
- Provisioning profiles: **still zero** (`~/Library/MobileDevice/Provisioning Profiles/` does not exist) — unchanged from Attempt 1 baseline.
- Signing identities (`security find-identity -v -p codesigning`): **3 valid**, unchanged in substance from Attempt 1 — `Apple Development: Kelly Nezat (N9DTF6434L)` and two `iPhone Distribution: Kelly Nezat (ZVK2X646Z2)` entries.
  - **One apparent discrepancy investigated and resolved, not skipped over**: the Apple Development cert's label carries a *different* identifier, `N9DTF6434L`, than the `ZVK2X646Z2` team baselined in Attempt 1. Full X.509 subject was pulled (`openssl x509 -noout -subject`) to check for real state drift: `UID=2Y6RN5Q279, CN=Apple Development: Kelly Nezat (N9DTF6434L), OU=ZVK2X646Z2, O=Kelly Nezat, C=US`. **`OU` (the team field) is `ZVK2X646Z2`, unchanged** — `N9DTF6434L` is Apple's *person ID* embedded in the certificate common name (`Apple Development: <name> (<personID>)`), a normal, non-drifting label component, distinct from the team identifier. Confirmed not state ambiguity; reconciliation holds.
  - Two unrelated pre-existing identities also present in the keychain (`Kelly Nezat - Oracle Access`, `Test Member`) — self-signed MAIA-internal certs, not part of the Apple Developer Program signing set, not counted toward the "3 valid" figure, not touched.
  - Xcode account record (`defaults read com.apple.dt.Xcode IDEProvisioningTeamByIdentifier`): still shows exactly one team, `ZVK2X646Z2` / "Kelly Nezat" / `isFreeProvisioningTeam = 0` — consistent with Attempt 1.
- Xcode: still 26.3 (Build 17C529). No version change.

State confirmed reconcilable — proceeded to rerun the identical build.

### §5 rerun — identical command, unchanged

```
xcodebuild -project D14QPresenceProof.xcodeproj -scheme D14QPresenceProof \
  -configuration Debug -destination 'platform=macOS' -allowProvisioningUpdates build
```

**Exit: BUILD FAILED** (`xcodebuild` exit code 65). Full output captured at `xcodebuild-d14q-rerun.log` (not committed, same convention as Attempt 1's log).

Decisive lines:

```
error: Device "Kelly's Mac Studio" isn't registered in your developer account. The device must be
registered in order to be included in a provisioning profile. (in target 'D14QPresenceProof' from
project 'D14QPresenceProof')
error: No profiles for 'com.soullab.jarvis.d14q.presenceproof' were found: Xcode couldn't find any Mac
App Development provisioning profiles matching 'com.soullab.jarvis.d14q.presenceproof'. (in target
'D14QPresenceProof' from project 'D14QPresenceProof')
```

### Phase separation (per the mandate's request to distinguish auth / App ID / cert / profile / signing / build / runtime)

- **Authentication**: no longer failing. Attempt 1's exact error (`Unable to log in with account 'soullab1@gmail.com'. The login details ... were rejected.`) **did not recur**. The build reached `GatherProvisioningInputs` and produced a *different* class of error (device registration), which only happens after the account session authenticates successfully enough for Xcode to query the team's registered devices. This is real, evidence-backed progress from Attempt 1, not assumed from the founder's GUI report alone.
- **App ID registration / certificate selection**: not observably reached as a distinct failure — the device-registration error pre-empted profile creation before certificate selection could be evaluated.
- **Profile creation/download**: failed — no profile exists because the target device (this Mac) is not a registered device on the team.
- **Signing / build / runtime**: not reached. No signed binary produced (consistent with Attempt 1's "no key material created" baseline).

### Result discipline (per §11 of the mandate)

- **OBSERVED**: identical rerun of the exact Attempt-1 command, with account/cert/profile state independently re-verified beforehand, now fails at a different, later stage — Apple's provisioning service accepted the authenticated session and evaluated the request, then explicitly refused because this Mac (`Kelly's Mac Studio`, Hardware UUID `020FECAE-0098-5C2B-B8F5-04732C957291`, Serial `N4C6JPV6MP`) is not a registered device on team `ZVK2X646Z2`.
- **INFERRED**: the founder's re-authentication step did resolve the Attempt-1 account-session failure — this is evidenced by the disappearance of the login-rejection error, not merely asserted from the GUI report.
- **UNRESOLVED**: whether device registration alone (once completed) is sufficient for the profile/build/runtime chain to succeed — not yet tested.
- **NOT TESTED**: profile verification (§7), signing-context proof (§8), the Security-framework presence proof (§9) — none reached; no provisioning profile exists yet to inspect or use.

### Classification (per §6 of the mandate)

**DEVICE FAILURE.**

- Exact command: the `xcodebuild -allowProvisioningUpdates` invocation shown above, unchanged from Attempt 1.
- Exact error: `Device "Kelly's Mac Studio" isn't registered in your developer account. The device must be registered in order to be included in a provisioning profile.` followed by the resulting `No profiles for 'com.soullab.jarvis.d14q.presenceproof' were found` (a downstream consequence of the device gap, not an independent cause).
- Evidence for classification: the error is Apple/Xcode's own explicit device-registration message, not a generic provisioning failure and not an authentication failure (the distinct Attempt-1 login-rejection text is absent). `-allowProvisioningUpdates` normally auto-registers a Mac automatically when the signed-in account has sufficient standing; that it did not do so here, combined with the explicit named error, places this squarely in the DEVICE FAILURE category rather than ACCOUNT AUTHENTICATION, MEMBERSHIP, CERTIFICATE, IDENTIFIER, PROFILE, XCODE TOOLING, or NETWORK/SERVICE FAILURE.
- Minimum human action (not performed by this unit, per the mandate's explicit prohibition on manually registering devices/profiles through the developer website): register this Mac as a device on team `ZVK2X646Z2`, either by letting Xcode auto-register it (may require re-confirming Admin/Agent role or accepting a pending Program License Agreement update at developer.apple.com/account/#/agreements) or, if automatic registration continues to fail, adding the device manually via developer.apple.com → Certificates, Identifiers & Profiles → Devices, using Hardware UUID `020FECAE-0098-5C2B-B8F5-04732C957291`. After that, the identical `xcodebuild -allowProvisioningUpdates` command reruns unchanged.
- Unchanged continuation point: same command, same project, same branch. No source, entitlement, bundle identifier, or signing-identity change was made or is being proposed.

### Cleanup / baseline preserved (Attempt 2)

- Provisioning-profile directory: still absent — unchanged before and after this attempt.
- No key material created — build never produced a signed binary.
- `xcodebuild-d14q-rerun.log` left alongside the Attempt-1 log as a local build artifact (not committed, same convention).

## Disposition

**D-14Q BLOCKED (Attempt 2) — DEVICE FAILURE: this Mac is not registered as a device on team `ZVK2X646Z2`.**

Per §15 of the mandate: stopping here. Authentication is confirmed resolved (real progress from Attempt 1), but a new, distinct external/Apple-side gap blocks provisioning. Not attempting to register the device through the developer website or any other workaround. Not proceeding to Desktop packaging, Electron integration, production wiring, D-14P modification, or the next JARVIS work unit. Awaiting the founder's device-registration action, after which the identical command reruns unchanged and this unit continues from §7 (profile verification) if it succeeds.
