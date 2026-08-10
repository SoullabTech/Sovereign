# JARVIS Desktop D-14Q — Provisioned Presence Proof

**Disposition: D-14Q BLOCKED (Attempt 3) — DEVICE FAILURE persists after founder-confirmed device registration; Hardware-UUID-vs-Provisioning-UDID hypothesis excluded by direct evidence; root cause narrowed to Apple-portal-side state outside Terminal-only means. Classification C (blocked by external/human authority).**
**Branch:** `chore/jarvis-desktop-d14q-provisioned-presence-proof`, off D-14P clean-retest tip (`73f6ef246`).
**Date:** 2026-08-10 (Attempt 1), 2026-08-10 (Attempt 2, after founder-reported Apple re-auth), 2026-08-10 (Attempt 3, after founder-confirmed device registration). **Device:** Mac Studio, Apple M4 Max, macOS 15.7.8.

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

## Disposition (Attempt 2)

**D-14Q BLOCKED (Attempt 2) — DEVICE FAILURE: this Mac is not registered as a device on team `ZVK2X646Z2`.**

Per §15 of the mandate: stopping here. Authentication is confirmed resolved (real progress from Attempt 1), but a new, distinct external/Apple-side gap blocks provisioning. Not attempting to register the device through the developer website or any other workaround. Not proceeding to Desktop packaging, Electron integration, production wiring, D-14P modification, or the next JARVIS work unit. Awaiting the founder's device-registration action, after which the identical command reruns unchanged and this unit continues from §7 (profile verification) if it succeeds.

---

## Attempt 3 (2026-08-10, same day — resume after founder-confirmed device registration, correct-identifier lesson)

**Explicit resume authorization received** (Builder claim `s-f0a3c60a`, worktree `jarvis-d14q-provisioned-presence-proof`, branch unchanged). Founder confirmed, explicitly and in-conversation, that the Mac had been registered in Apple Developer → Certificates, Identifiers & Profiles → Devices as:

- Name: `Kelly's Mac Studio`
- UDID: `00006041-00146119217A801C`

**Correction carried into this attempt, not re-litigated**: Attempt 2's record named the Hardware UUID (`020FECAE-0098-5C2B-B8F5-04732C957291`, from `system_profiler SPHardwareDataType`) as "the minimum human action." That was imprecise. On Apple Silicon, `system_profiler SPHardwareDataType` reports **two distinct fields** — Hardware UUID and Provisioning UDID — and Apple's Devices registration page wants the **Provisioning UDID**, not the Hardware UUID. The value the founder registered, `00006041-00146119217A801C`, **is** the Provisioning UDID, and it matches exactly the destination identifier `xcodebuild` itself reports for this machine (`id:00006041-00146119217A801C, name:My Mac` — confirmed independently in both this attempt's and Attempt 2's build output, not asserted from the founder's report alone). This is recorded as a durable correction for future JARVIS Apple-signing work — not implemented or generalized anywhere in this unit, per the governing mandate's explicit boundary.

### §3 re-verification (state reconciliation before any command)

- Repo: worktree `.../jarvis-d14q-provisioned-presence-proof`, branch `chore/jarvis-desktop-d14q-provisioned-presence-proof`, HEAD `9a9223b7f` — unchanged, matches the authorized continuation commit (`git log --oneline -3` confirmed).
- Untracked generated artifacts unchanged from Attempt 2 (`D14QPresenceProof.entitlements`, `D14QPresenceProof.xcodeproj/`) — not regenerated, not modified.
- Signing identities (`security find-identity -v -p codesigning`): **still 3 valid**, byte-identical set to Attempt 2 — `Apple Development: Kelly Nezat (N9DTF6434L)` + two `iPhone Distribution: Kelly Nezat (ZVK2X646Z2)` entries. No drift.
- Xcode account record (`defaults read com.apple.dt.Xcode.plist IDEProvisioningTeamByIdentifier`): still exactly one team — `teamID = ZVK2X646Z2`, `teamName = "Kelly Nezat"`, `teamType = Individual`, `isFreeProvisioningTeam = 0`. Confirms the authenticated Xcode session is scoped to the correct, expected team (not a stale or wrong account) before attempting the rerun.
- **A stale rerun log was found already present** at `xcodebuild-d14q-rerun.log` (Attempt 2's artifact, timestamp 16:27 EDT) predating this session's start. Not treated as this attempt's evidence — a fresh, independent rerun was executed and captured separately (`xcodebuild-d14q-attempt3.log`) to avoid conflating stale and current evidence.

### §5 rerun — identical command, unchanged

```
xcodebuild -project D14QPresenceProof.xcodeproj -scheme D14QPresenceProof \
  -configuration Debug -destination 'platform=macOS' -allowProvisioningUpdates build
```

**Exit: BUILD FAILED** (same failure class as Attempt 2). Full output captured at `xcodebuild-d14q-attempt3.log` (not committed, same convention as prior attempts). Timestamp: 2026-08-10 16:46:35 EDT.

Decisive lines (byte-identical in substance to Attempt 2's failure, confirmed via independent rerun rather than assumed from the stale log):

```
--- xcodebuild: WARNING: Using the first of multiple matching destinations:
{ platform:macOS, arch:arm64, id:00006041-00146119217A801C, name:My Mac }
{ platform:macOS, arch:x86_64, id:00006041-00146119217A801C, name:My Mac }
...
error: Device "Kelly's Mac Studio" isn't registered in your developer account. The device must be
registered in order to be included in a provisioning profile. (in target 'D14QPresenceProof' from
project 'D14QPresenceProof')
error: No profiles for 'com.soullab.jarvis.d14q.presenceproof' were found: Xcode couldn't find any Mac
App Development provisioning profiles matching 'com.soullab.jarvis.d14q.presenceproof'. (in target
'D14QPresenceProof' from project 'D14QPresenceProof')
```

**Decisive observation**: `xcodebuild`'s own destination-resolution line names this Mac's Provisioning UDID as `00006041-00146119217A801C` — the **exact same value** the founder registered. This directly confirms the founder registered the correct identifier (settling the Hardware-UUID-vs-Provisioning-UDID question with hard evidence, not inference) — and yet `-allowProvisioningUpdates` still reports the device as unregistered.

### Phase separation

- **Authentication**: not failing (no login-rejection text; consistent with Attempt 2).
- **Account/team scoping**: confirmed correct (`ZVK2X646Z2`, matches certificate `OU` and project `DEVELOPMENT_TEAM`).
- **Device registration**: still failing, with the exact same message as Attempt 2, despite independently confirmed use of the correct Provisioning UDID.
- **App ID / certificate / profile / signing / build / runtime**: not reached — pre-empted by the device-registration gap, identical to Attempt 2.

### Result discipline (per §11 of the mandate)

- **OBSERVED**: an identical rerun of the exact command, after independently re-verifying account/team/certificate state showed no drift, still fails with Apple's explicit device-registration refusal — for the device whose Provisioning UDID is now independently confirmed (via `xcodebuild`'s own destination report) to match what the founder registered.
- **INFERRED**: the Hardware-UUID-vs-Provisioning-UDID distinction is resolved and was not the cause of this recurrence — the correct identifier was used. The remaining gap is therefore either (a) registration propagation delay on Apple's infrastructure not yet elapsed at rerun time, or (b) the registration did not persist/save correctly on Apple's side despite the founder's UI confirmation, or (c) a further Apple-side state gap not yet identified (e.g., a pending Program License Agreement acceptance, or the device needing to be associated with this specific App ID/team in a way distinct from the general Devices list). This unit cannot discriminate among (a)/(b)/(c) without either waiting and retrying, or the founder checking the Devices list state directly on developer.apple.com — both outside this unit's remaining terminal-only means.
- **UNRESOLVED**: whether device registration, once genuinely effective, is sufficient for the profile/build/runtime chain — still not tested, three attempts in.
- **NOT TESTED**: profile verification (§7), signing-context proof (§8), the Security-framework presence proof (§9) — none reached; no provisioning profile exists yet to inspect or use; the D-14Q presence/keychain proof was NOT run (build never succeeded, so running it would not discriminate anything).

### Classification

**DEVICE FAILURE — recurrence, cause narrowed but not resolved.** Mapped to mandate outcome **C — PROVISIONING REMAINS BLOCKED BY EXTERNAL/HUMAN AUTHORITY.**

- Exact command: the `xcodebuild -allowProvisioningUpdates` invocation shown above, unchanged across all three attempts.
- Exact error: identical text to Attempt 2 — `Device "Kelly's Mac Studio" isn't registered in your developer account...` plus the downstream `No profiles ... were found`.
- Evidence for classification: the Hardware-UUID/Provisioning-UDID ambiguity that could have explained Attempt 2's failure is now excluded by direct evidence (`xcodebuild`'s own reported destination UDID matches the founder-registered UDID exactly). The remaining explanation is Apple-account/portal-side state this unit cannot inspect or fix from Terminal alone — propagation timing, an unsaved/incomplete registration, or an adjacent portal gate (e.g. agreements). This is squarely an external/Apple-authority blocker, not a local misconfiguration, not an authentication failure, not a certificate failure (identities unchanged and valid), and not an Xcode tooling failure (identical command behaves consistently and predictably).
- Minimum human action (not performed by this unit — outside Terminal-only means and outside this unit's authorization to visit/modify the developer portal): the founder directly re-checking developer.apple.com → Certificates, Identifiers & Profiles → Devices to confirm the entry for `Kelly's Mac Studio` / `00006041-00146119217A801C` is actually saved and shows as an active/enabled device (not pending), and separately checking developer.apple.com/account/#/agreements for any unsigned Program License Agreement update that could silently block provisioning-profile generation even with a valid device entry. If both check out, allow more propagation time (Apple's provisioning-profile generation service is not always instantaneous) and rerun the identical command unchanged.
- Unchanged continuation point: same command, same project, same branch, same HEAD. No source, entitlement, bundle identifier, or signing-identity change was made or is being proposed in this attempt either.

### Cleanup / baseline preserved (Attempt 3)

- Provisioning-profile directory: still absent — unchanged before and after this attempt.
- No key material created — build never produced a signed binary. Presence/keychain proof was not run (nothing to test).
- `xcodebuild-d14q-attempt3.log` left alongside the Attempt-1/Attempt-2 logs as a local build artifact (not committed, same convention).

## Disposition (Attempt 3, current)

**D-14Q BLOCKED (Attempt 3) — DEVICE FAILURE persists; Hardware-UUID-vs-Provisioning-UDID hypothesis excluded by direct evidence; root cause narrowed to Apple-portal-side state (propagation, unsaved registration, or an adjacent agreement gate) outside Terminal-only means. Classification C — blocked by external/human authority.**

Per §15 of the mandate: stopping here. Not attempting to check or modify the developer portal directly, not attempting to synthesize GUI/2FA interaction, not proceeding to Desktop packaging, Electron integration, production wiring, D-14P modification, or the next JARVIS work unit. Awaiting founder verification of the Devices/Agreements portal state (or simply more propagation time), after which the identical command reruns unchanged and this unit continues from §7 if it succeeds.

## Attempt 4 (2026-08-10, same day — remote-state verification via App Store Connect API)

**What changed vs. Attempts 1–3**: nothing local. Attempts 1–3 all ended at the same `xcodebuild` refusal
and could not discriminate *why*, because every available signal was local. Attempt 4 did not rerun the
build. It first answered the prior attempts' explicitly-named unresolved question — *does Apple actually
have this Mac registered?* — using an authoritative, read-only, non-mutating remote source.

### §1 — Governance baseline

- Worktree: `/Users/soullab/MAIA-SOVEREIGN/.claude/worktrees/jarvis-d14q-provisioned-presence-proof`
- Branch: `chore/jarvis-desktop-d14q-provisioned-presence-proof`
- HEAD at entry: `c66182b1db897cc97f45bf12ab3e4e4979489e19` — the mandated continuation point, unchanged.
- Dirty state at entry: 2 untracked paths only — `D14QPresenceProof.entitlements` and
  `D14QPresenceProof.xcodeproj/` (the Attempt-1 generated provisioning vehicle). No tracked modifications.
- Builder capacity: 0 / 2 Claude sessions active; D-14Q not owned by any live claim. Claim opened
  legitimately as `s-1c2a1a26` (write mode). No claim evicted, no forced recovery, no `--no-verify`.
- D-14P: not read, not modified, not touched.

### §3 — Read-only remote verification (the decisive step)

Established Facts 1–6 were re-checked rather than assumed, and one near-miss correction is recorded below.

**Correction recorded (a re-litigation that was attempted and then withdrawn on evidence):** the
development certificate's Common Name is `Apple Development: Kelly Nezat (N9DTF6434L)`, which momentarily
looked like a *second team* contradicting Established Fact 2. It is not. The full subject is:

```
subject=UID=2Y6RN5Q279, CN=Apple Development: Kelly Nezat (N9DTF6434L), OU=ZVK2X646Z2, O=Kelly Nezat, C=US
```

`N9DTF6434L` is the **certificate identifier**; the **team** is the `OU`, `ZVK2X646Z2`. Established Fact 2
stands, and Attempt 3's statement that the certificate OU matches the team was correct. Recorded because the
mandate requires contradictory-looking evidence to be surfaced and resolved rather than silently dropped.

**Method.** An App Store Connect API key already provisioned on this machine was used to make read-only
`GET` calls. No credential was entered into any interface, nothing was created, modified, or deleted:

- Key: `~/.appstoreconnect/private_keys/AuthKey_36J9MBP9U6.p8` (issuer `2f3ea491-…-3c50172f10ab`)
- Team scope confirmed **from the response itself**, not assumed: the returned profile payload carries
  `ApplicationIdentifierPrefix = ZVK2X646Z2`. The key is querying the correct team.
- Cross-checked with the second local key (`AuthKey_RZJ852Y4NZ.p8`) — byte-identical device results.

**Results** (all HTTP 200, 2026-08-10 ~17:05 EDT):

| Query | Result |
|---|---|
| `GET /v1/devices?limit=200` | `total: 1` — a single `iPhone 16 Pro Max`, UDID `00008140-00163D9922E0801C`, platform `IOS`, status `ENABLED` |
| `GET /v1/devices?filter[udid]=00006041-00146119217A801C` | `total: 0` — **the Mac Studio is not in the registry** |
| `GET /v1/devices?filter[platform]=MAC_OS` | `total: 0` — no Mac devices at all on this team |
| `GET /v1/devices?filter[status]=DISABLED` | `total: 0` — nothing present-but-disabled |
| `GET /v1/bundleIds?filter[identifier]=com.soullab.jarvis.d14q.presenceproof` | `total: 0` — App ID never created (consistent: `-allowProvisioningUpdates` aborted before creating it) |
| `GET /v1/profiles?filter[profileType]=MAC_APP_DEVELOPMENT` | `total: 0` — no Mac development profile exists |

**Why the `MAC_OS` query matters (validity control).** A `total: 0` for Mac devices would be worthless if the
API simply could not represent Mac devices. It can: `filter[platform]=MAC_OS` was **accepted** (HTTP 200 with
an empty set), not rejected as an invalid enum value (HTTP 400). The empty result is therefore a real
statement about the registry, not an artifact of the instrument.

### Result discipline

- **OBSERVED**: team `ZVK2X646Z2`'s device registry currently contains exactly one device — an iPhone. The
  Provisioning UDID `00006041-00146119217A801C` returns zero matches on direct lookup. There are zero Mac
  devices and zero disabled devices on the team.
- **INFERRED**: `xcodebuild`'s refusal in Attempts 2 and 3 was **accurate reporting of true remote state**,
  not a stale cache, not a propagation lag, and not an Xcode tooling defect. The three-way ambiguity
  Attempt 3 left open — (a) propagation delay / (b) registration did not persist / (c) some other portal
  gate — collapses: whatever the cause, the device is **not registered now**, ~20 minutes after Attempt 3
  and after the founder's confirmation. Apple's own API and Xcode agree; there is no
  remote-state/Xcode disagreement to investigate.
- **NOT ESTABLISHED — and deliberately not inferred**: *why* the registration is absent. This record does
  **not** claim the founder's registration attempt failed, was mis-entered, or was not made. It states only
  what the registry contains right now. A plausible and specific candidate worth the operator's attention:
  a Mac must be registered with **Platform: macOS**; a Mac UDID entered under the iOS device flow does not
  produce a Mac device entry. This is a hypothesis for the operator to check, not a finding.
- **NOT DETERMINABLE from this instrument**: whether an unsigned Apple Developer Program License Agreement
  is separately pending. The App Store Connect API exposes no agreements resource. This remains an open
  question for portal inspection, but it is **not** needed to explain the current failure — device absence
  is already sufficient and specific.
- **NOT TESTED (unchanged from Attempts 1–3)**: §7 profile verification, §8 signing-context proof, §9/§10
  the Security-framework presence/keychain proof. No provisioning profile exists to inspect. The D-14 keychain
  proof was **not** run — running it now would discriminate nothing. The governing question — *does valid
  Apple development provisioning cross the prior `-34018` boundary?* — remains **untested after four attempts**.

### Supersession of earlier interpretation

Attempt 3's §Classification treated propagation delay and an unsaved registration as live, co-equal
possibilities, and recommended "allow more propagation time and rerun the identical command." That
recommendation is **superseded**: rerunning the build is now known to be futile until the device exists.
Attempt 3's *evidence* and its exclusion of the Hardware-UUID/Provisioning-UDID hypothesis both stand
unamended — only the forward recommendation changes. Attempts 1–3 are otherwise left as written.

### §5 not executed — deliberately

The mandate authorizes rerunning the unchanged build **only** under §5 (device PRESENT + ENABLED). The device
is ABSENT, so §7 governs and the build was not rerun. This is a decision, not an omission.

### Classification (§11)

**C — EXTERNAL / APPLE AUTHORITY BLOCKER REMAINS.** Specifically, mandate §7:
**DEVICE ABSENT FROM TEAM REGISTRY.**

Same disposition letter as Attempt 3, but no longer the same epistemic state: Attempt 3 was blocked *and*
could not say why; Attempt 4 is blocked with the cause located and the alternatives eliminated.

§7 verification checklist, completed:
- Correct team — **yes**, `ZVK2X646Z2`, confirmed from the API response payload rather than assumed.
- Correct Provisioning UDID — **yes**, `00006041-00146119217A801C`, corroborated by `xcodebuild`'s own
  destination resolution (Established Fact 5).
- Device quota — **not a factor**; 1 device registered, nowhere near any limit.
- Does Apple permit registration — **yes**; no quota, membership, or device-status obstruction is visible.

### Minimum human action required

Register this Mac in the Apple Developer portal → Certificates, Identifiers & Profiles → Devices, using:

- **Platform: macOS** (not iOS — see the hypothesis above)
- **Device ID (UDID):** `00006041-00146119217A801C`
- **Name:** any; `Kelly's Mac Studio` matches what Xcode reports.
- Team: `ZVK2X646Z2`

While in the portal, also note whether any outstanding agreement/banner requires acceptance.

Per the safety constraint governing this unit, no Apple account authentication, agreement acceptance, or
portal mutation was performed or simulated. This unit does not perform the registration.

### Cleanup / baseline preserved (Attempt 4)

- No build was run; no new build log was produced.
- Provisioning-profile directory: unchanged (no Mac development profile before or after).
- No App ID, certificate, profile, device, or key material was created, modified, or deleted — locally or at Apple.
- No key material or presence/keychain proof executed.
- D-14P: untouched.

## Disposition (Attempt 4, current)

**D-14Q BLOCKED (Attempt 4) — Classification C, mandate §7: DEVICE ABSENT FROM TEAM REGISTRY.** Verified
against Apple's own authoritative read-only API rather than local caches or portal screenshots. The
"registered but still refused" paradox of Attempt 3 is resolved: the device is genuinely not registered, and
`xcodebuild` was telling the truth. Unchanged continuation point — same command, same project, same branch,
same HEAD; no source, entitlement, bundle-identifier, or signing-identity change was made or is proposed.
Resume at §5 (unchanged rerun) once `00006041-00146119217A801C` appears as an enabled **macOS** device on
team `ZVK2X646Z2` — which this unit can now re-verify in seconds via the same read-only API call before
spending another build.
