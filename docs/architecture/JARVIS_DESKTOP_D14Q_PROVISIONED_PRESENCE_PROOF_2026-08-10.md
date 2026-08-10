# JARVIS Desktop D-14Q — Provisioned Presence Proof

**Disposition: D-14Q BLOCKED — APPLE ACCOUNT / PROVISIONING INTERACTION REQUIRED.**
**Branch:** `chore/jarvis-desktop-d14q-provisioned-presence-proof`, off D-14P clean-retest tip (`73f6ef246`).
**Date:** 2026-08-10. **Device:** Mac Studio, Apple M4 Max, macOS 15.7.8.

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

## Disposition

**D-14Q BLOCKED — APPLE ACCOUNT / PROVISIONING INTERACTION REQUIRED.**

Per §15 of the mandate: stopping here. Not proceeding to Desktop packaging, Electron integration, production wiring, authentication integration, or the next JARVIS work unit. Not attempting to route around the Apple account block. Awaiting the founder's one interactive action (Xcode → Settings → Accounts → re-authenticate `soullab1@gmail.com`), after which the identical command reruns unchanged and this unit continues from §7.
