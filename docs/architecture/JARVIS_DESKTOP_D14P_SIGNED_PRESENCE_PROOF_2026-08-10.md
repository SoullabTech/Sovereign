# JARVIS Desktop D-14P — Signed Presence Proof

**Status:** COMPLETE — INVARIANT UNRESOLVED DUE TO PROVISIONING AUTHORIZATION GAP. **Not a resolution-implementing unit. No JARVIS Desktop built or packaged.**
**Branch:** `chore/jarvis-desktop-d14p-signed-presence-proof`, off D-14L (`6a36ffd85`), off D-14 (`83f4fdfb1`), off D-13 (`35e6e11eb`).
**Date:** 2026-08-10. **Device:** Mac Studio, Apple M4 Max, macOS 15.7.8.

> **RECORD CORRECTION #1 (2026-08-10).** The original text below said the SIGKILL evidence "leaves one explanation." That overstated it. Apple's own documentation independently supports the diagnosis — `keychain-access-groups` is a documented *restricted* entitlement on macOS requiring provisioning-profile authorization, and `-34018`/`errSecMissingEntitlement` is Apple's own documented error for exactly this condition (TN3125, "Inside Code Signing: Provisioning Profiles"). Well-supported, not merely plausible — but not proof by elimination on its own. Superseded by Correction #2 below, which closes exactly this gap.

> **RECORD CORRECTION #2 — CLEAN DISCRIMINATING RETEST (2026-08-10, same day, before D-14Q's interactive step).** Correction #1's finding, while well-supported by Apple's documentation, had not actually eliminated two cheaper hypotheses: (1) the original bundle had been repeatedly re-signed in place across three configurations, risking residual-state contamination between attempts; (2) `kSecUseDataProtectionKeychain` — the key that opts a Security-framework call into the modern data-protection keychain rather than the legacy file-based one (Apple TN3137, "On Mac Keychains") — had never been set, so a "wrong keychain" explanation was never ruled out as a pure code-side fix.
>
> A clean retest closed both gaps, from fresh, never-reused bundles (`presence-proof-v2.swift`, `D14PRetestV2-*.app` — not committed, contained no secrets, both AMFI-killed or `-34018`'d before any Keychain write could occur). The Team ID was independently re-derived from the certificate's raw X.509 Subject via `openssl x509 -noout -subject`, not trusted from the first attempt: `OU=ZVK2X646Z2` — confirming, by a second and more authoritative method, what `codesign -dvvv` had already shown. A full 2×2 matrix was then run:
>
> | | no `kSecUseDataProtectionKeychain` | with it |
> |---|---|---|
> | no restricted entitlement | `-34018` (graceful) | `-34018` (graceful) |
> | entitlement + real cert, correct Team ID | SIGKILL | SIGKILL |
>
> The data-protection-keychain flag changed nothing in either row — ruled out as a confound. The restricted-entitlement/provisioning-profile blocker reproduces identically on fresh, uncontaminated, freshly-signed bundles. **This is now a clean, discriminating result, not an inherited assumption**: D-14P's finding stands, on firmer evidence than either prior version of this record. D-14Q (obtaining an actual provisioning profile) is the correctly earned next step — held pending the founder's separate authorization for that specific unit, and to be done Terminal-first (`xcodebuild -allowProvisioningUpdates`, not Xcode GUI) per standing instruction, escalating to an interactive step only if Apple account authentication itself requires it.
>
> **RECORD CORRECTION #3 (wording precision, 2026-08-10, before D-14Q execution).** Correction #2 above should not be read as calling provisioning/entitlement authorization "the sole reproducible cause" — that overstates what a discriminating rerun can establish. What the 2×2 proves is that it is the **remaining discriminating hypothesis**: the confounds tested (contamination, wrong keychain) are ruled out, but causation itself — that a correctly provisioned build actually clears the blocker — is not yet demonstrated. That is precisely D-14Q's job. Only if D-14Q succeeds does this get promoted from hypothesis to demonstrated cause.

## Goal, restated

D-14L found two things: the Keychain-ACL-bound mechanism (the one D-14 actually recommended) couldn't be reached from an unsigned CLI binary (`-34018`, missing entitlement), and the fallback bare-`LAContext` mechanism was live-tested and failed the freshness invariant. D-14P's job was to build the smallest signed/provisioned `.app` needed to reach the first mechanism and test it properly. It did not get there — but it got much further, and the failure is now precisely characterized rather than merely observed.

## What was built

A minimal `.app` bundle (`D14PPresenceProof.app`) wrapping the same Swift Security-framework logic as D-14L's substrate: `Contents/Info.plist` with a real bundle identifier (`com.soullab.jarvis.d14p.presenceproof`), an `entitlements.plist`, and the compiled binary. Three signing configurations were tried in sequence, each one informative:

### Attempt 1 — ad-hoc signing (`codesign -s -`), explicit `keychain-access-groups` entitlement
Result: `SecKeyCreateRandomKey` failed, `-34018` (`errSecMissingEntitlement`) — same failure as D-14L's bare CLI binary. Bundling alone, without a real signing identity, changes nothing.

### Attempt 2 — real Apple Development certificate found on this Mac (`Apple Development: Kelly Nezat`), `keychain-access-groups` entitlement present
First pass used the certificate's display-name parenthetical (`N9DTF6434L`) as the Team ID prefix — **wrong**: `codesign -dvvv` showed the certificate's actual embedded `TeamIdentifier` is `ZVK2X646Z2`, not `N9DTF6434L`. Corrected the prefix and re-signed. **Both the mismatched and corrected versions were killed outright — `exit 137` / `SIGKILL` — before any application code ran.** This is AMFI (Apple Mobile File Integrity) refusing to even launch a process that claims a *restricted* entitlement (`keychain-access-groups` is restricted, unlike most entitlements) without a matching macOS-targeted **provisioning profile** backing the claim. A bare Apple Development certificate, signed without an embedded `.provisionprofile`, is not sufficient authorization for AMFI to permit this — this is consistent with the Bash execution sandbox NOT being the cause: the same kill occurred with `dangerouslyDisableSandbox: true`, isolating the cause to macOS's own code-signing/entitlement enforcement, not this harness's tooling.

### Attempt 3 — real certificate, entitlements file present but empty (no explicit `keychain-access-groups`)
No crash — the process ran to completion, meaning the SIGKILL in Attempt 2 was specifically about the *restricted entitlement claim*, not about lacking a real certificate per se. But `SecKeyCreateRandomKey` again returned `-34018` for both Secure-Enclave and software-Keychain variants: the *implicit* default keychain-access-group a validly-signed app receives (without explicitly declaring one) was not sufficient to create an access-control-protected `SecKey` item either.

## Diagnosis

**The blocker is a missing macOS provisioning profile, not a code-signing or entitlement-syntax mistake.** A genuine Apple Development certificate is present and was correctly applied; the Team ID was correctly identified and corrected once the actual embedded value was checked rather than assumed from the certificate's label. What's absent is a provisioning profile authorizing this specific App ID for the `keychain-access-groups` capability on macOS — something normally obtained through Xcode's automatic-signing flow (registering an App ID on the Apple Developer portal, generating and downloading a profile, embedding it in the bundle) or a manual equivalent. **Obtaining one requires interactive Apple Developer account/portal steps this unit cannot perform on its own** and would meaningfully exceed "smallest test substrate."

## Answers to the mandate's required returns

```
KEY CREATION: FAIL
  — three configurations tried; graceful -34018 (ad-hoc, and real-cert-no-
    entitlement) or hard SIGKILL (real-cert-with-restricted-entitlement,
    no provisioning profile). Root cause: missing macOS provisioning
    profile, precisely diagnosed, not previously known at this resolution.

SIGN 1 PRESENCE: UNRESOLVED — no protected key was ever created; there was
  nothing to sign against.

SIGN 2 PRESENCE: UNRESOLVED — same reason.

CANCEL/REFUSE: NOT REACHED — no signing operation was ever attempted
  against a real protected key.

PRIVATE KEY EXPORTABILITY: NOT TESTED — no key existed to attempt export
  against. (The substrate's `export` command, which queries with
  kSecReturnData against a SecKey item, was written but never exercised
  live — architecturally, SecKey items never yield raw private material
  through SecItemCopyMatching regardless of query flags, which is a
  documented platform guarantee, not something this unit independently
  confirmed live.)

INVARIANT: NOT PROVED
  — same standing as D-14L: "every signing act requires fresh founder
    presence" remains unproven, now for a more precisely understood
    reason (infrastructure gap, not mechanism unsoundness).

D-14 CONSEQUENCE: D-14's cryptographic architecture (12/12 proofs, D-14
  record) is unaffected and still stands as designed. What changes is the
  live-implementability picture: the Keychain-ACL path D-14 recommended as
  V1's presence mechanism requires a real macOS provisioning profile to
  even test, let alone ship — this is now a known, named prerequisite
  rather than an open unknown. D-14 remains NOT ready for a resolution
  implementation unit. The felt distance to "ready" did not grow; it got
  a concrete next blocker instead of a vague one.
```

## What this rules in and rules out

**Ruled out**: casual assumptions that "just bundle it as a signed .app" would be enough — it would not, without a provisioning profile. Also rules out blaming Attempt 1's failure on ad-hoc signing being merely "unsigned" in some loose sense — a real, valid Apple Development certificate exhibits the identical entitlement-missing symptom when the restricted entitlement isn't provisioning-profile-backed.

**Ruled in, still open**: the underlying Security-framework design (SE/software Keychain key + `.userPresence`/`.privateKeyUsage` access control, evaluated at use time) has not been shown unsound — it has never actually run. Once a provisioning profile exists, the exact same substrate code (unchanged, both from D-14L and D-14P) is ready to test immediately.

## Cleanup

No Keychain material was ever created in any of the three attempts (`-34018` and `SIGKILL` both occur before `SecItemAdd` would succeed) — nothing to remove. The built `.app` bundle (a compiled artifact, contains no secrets) was left on local disk after Bash cleanup calls were declined mid-session; it is not committed to this branch and can be deleted manually (`rm -rf scripts/builder/design/jarvis-founder-presence-auth/d14p-signed-proof/D14PPresenceProof.app`) at any time — it holds no key material and poses no standing risk.

## Next candidate unit (not authorized here)

Obtain or generate a macOS provisioning profile for a throwaway test App ID with the `keychain-access-groups` capability enabled (via Xcode's automatic-signing UI, or the Apple Developer portal directly — both require Kelly's interactive participation, not something Claude Code can do unattended), then rerun this exact substrate. If that clears, D-14L's original 7-step live proof (sign 1, sign 2, cancel/refuse, export attempt) becomes executable for real, against the actual recommended mechanism, for the first time.

Files: `scripts/builder/design/jarvis-founder-presence-auth/d14p-signed-proof/{presence-proof.swift, entitlements.plist, D14PPresenceProof.app/Contents/Info.plist}`, this record. No `jarvis-runtime.mjs`/`jarvis-authority-channel.mjs`/`jarvis-governance-gate.mjs`/`desktop-app/jarvis/*` touched. No Desktop UI, no IPC, no OPERATOR, no packaging, no production.
