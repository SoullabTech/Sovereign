# JARVIS Desktop D-14R — Founder-Presence Invariant Live Proof

**Disposition: D-14R CLOSED — CLASSIFICATION D (FAILED).**
**Branch:** `chore/jarvis-desktop-d14r-founder-presence-live-proof`, off D-14Q tip (`d3a9dab2e`).
**Date:** 2026-08-10. **Device:** Mac Studio, Apple M4 Max, macOS 15.7.8. No Touch ID hardware present on this machine.

## Objective

Prove or falsify: *JARVIS cannot produce a valid founder-authorization signature unless the founder is freshly and physically present.*

## What was run — Test 1 only, per explicit scope

Used the exact, unmodified, already-verified D-14Q signed/provisioned bundle (`D14QKeychainProof.app` — signature, entitlements, and embedded provisioning profile independently re-confirmed unchanged before any test began: `TeamIdentifier=ZVK2X646Z2`, `keychain-access-groups=[ZVK2X646Z2.com.soullab.jarvis.d14q.presenceproof.keychainproof]`, embedded profile UUID `a68812e6-1907-4a27-978d-d0ba500604f0`, unexpired). No rebuild, no reprovisioning, no substrate change.

**Step 1 — `generate`**: `key_creation: PASS`, `key_type: SecureEnclave-P256`, `access_control: userPresence+privateKeyUsage`. **Human-observed: silent, no prompt.** Expected and not concerning on its own — SE key access control conventionally gates *use*, not creation.

**Step 2 — `sign`, continuously-unlocked session**: valid signature returned. **Human-observed, founder's direct report: "No — no password prompt or other macOS authentication dialog appeared during `sign`."**

**Discriminating retest — fresh lock/unlock boundary**: screen locked via `osascript`/System Events (required an explicit Accessibility grant the founder confirmed before this worked), founder unlocked with password, `sign` run immediately after. Valid signature returned again. **Human-observed, founder's direct report: "No. After the fresh lock and password unlock, sign again completed silently. No additional macOS authentication dialog appeared."**

Apple Watch auto-unlock was checked and ruled out as a confound: `defaults -currentHost read com.apple.security.AppleWatchUnlock` — domain does not exist; no watch found via `system_profiler SPBluetoothDataType`.

## Independent verification (this unit's final, non-interactive step)

Per explicit instruction: no further presence attempts, no diagnosis of *why*, only verify what was already captured. `verify-d14r-test1.mjs` (Node `crypto`, P-256/SHA-256, DER SPKI reconstruction from the raw exported point, ECDSA DER signature verify) — both signatures checked against the actual public key returned by `generate`, over the exact UTF-8 message bytes passed to `sign`, with an explicit tamper check (append one byte → verification must fail, confirming the check discriminates rather than passing vacuously):

```
test1 (continuously unlocked):        verifies_against_exact_payload: true,  verifies_against_tampered_payload: false → PASS
test1-postunlock (fresh lock/unlock): verifies_against_exact_payload: true,  verifies_against_tampered_payload: false → PASS

OVERALL: BOTH SIGNATURES INDEPENDENTLY VERIFIED
```

Both are genuine, valid ECDSA signatures over exactly the claimed payloads, produced by the key `generate` reported. This is not in question. What is now settled is that they were produced under **both tested conditions with no visible founder-presence event.**

## Result

```
required invariant:
  fresh founder presence → authorization

observed:
  no visible fresh presence → valid signature (2/2 attempts, 2 distinct
  lock-state conditions)
```

The invariant is **falsified** for this specific configuration: a Secure-Enclave-backed key with `.userPresence + .privateKeyUsage` access control, accessed via `SecItemCopyMatching` + `SecKeyCreateSignature` with a fresh `LAContext` passed through `kSecUseAuthenticationContext`, under a valid Apple development provisioning profile, on this Mac. Not a claim about Secure Enclave in general, and not a claim about *why* — per explicit instruction, cause was not investigated in this unit.

## Deliverable — per the governing mandate

1. **Exact build/signing identity**: unchanged from D-14Q — `Apple Development: Kelly Nezat (N9DTF6434L)`, Team `ZVK2X646Z2`, cert fingerprint `42E2C8D83763966C9411E9622B92872D0D3885B4`.
2. **Provisioning profile**: `a68812e6-1907-4a27-978d-d0ba500604f0`, re-verified unchanged (§ above).
3. **Key attributes**: `SecureEnclave-P256`, `.userPresence + .privateKeyUsage` access control, `kSecUseDataProtectionKeychain: true`.
4. **Test 1 evidence**: recorded above in full — mechanical + human-observed, both channels.
5. **Test 2 evidence**: not run — unit closed after Test 1 per explicit instruction, once Test 1 itself falsified the invariant.
6. **Cancel/refusal evidence**: not run — same reason.
7. **Failure-path evidence**: not run — same reason.
8. **Non-exportability proof**: not re-run in this unit — already established in D-14Q (`export` query succeeds in finding the item, `errSecSuccess`, but returns no raw private material — a documented Secure Enclave/access-control platform guarantee, not independently re-derived here or there).
9. **Independent signature verification**: done — see above, both PASS with tamper-detection confirmed.
10. **Relaunch proof**: not run — the fresh lock/unlock discriminator substituted for this in practice (each `sign` invocation is already a fresh OS process; the discriminator additionally forced a fresh OS-level authentication boundary) and was judged sufficient to reach a decisive result without needing the separate relaunch test.
11. **LAContext reuse behavior**: not diagnosed — explicitly out of scope per instruction ("do not speculate about cause").
12. **Final classification**: **D — FAILED.** A signature was produced without the required founder presence, under two independently tested conditions, with results independently verified.
13. **Desktop resolution wiring eligibility**: **NOT eligible.** This result affirmatively argues against proceeding, not merely "not yet proven" — the specific mechanism tested does not currently enforce the constitutional invariant it was built to enforce.

## What this does and does not mean

**Does not mean**: Secure Enclave is unusable, or D-14's architecture is wrong in its shape (challenge/response, domain separation, single-use replay protection — none of that was touched or implicated here). Does not mean no mechanism can work on this Mac.

**Does mean**: this specific `.userPresence` access-control configuration, exercised via this specific API call pattern, does not currently establish the per-action visible founder-presence guarantee JARVIS's constitutional model requires. Wiring Desktop resolution around this mechanism as-is would build real authority-granting code on top of a false security assumption — exactly what this unit existed to catch before that happened.

## Next step (not opened here)

A separate diagnostic unit, if and when the founder decides this mechanism is still worth pursuing — investigating *why* `.userPresence` isn't visibly firing on this call path (candidates worth checking there, not here: whether `SecItemCopyMatching` vs. `SecKeyCreateSignature` is the actual gate point that's misconfigured; whether the `LAContext` needs an explicit `evaluatePolicy` call before being passed via `kSecUseAuthenticationContext` rather than left for Security framework to drive; whether this is a documented behavior specific to SE-backed keys accessed this way). Not started, not authorized by this record.

## Cleanup

No new secrets created — reused D-14Q's existing key/session per its own already-established flow (the `generate` step deletes-then-recreates, matching the substrate's known idempotent behavior). No system state altered beyond the screen lock/unlock cycle itself and the one-time Accessibility grant to allow the lock trigger — both already-necessary, ordinary machine use, not unit-specific artifacts requiring rollback.

## Commit discipline

Committed: this record, `d14r-test1-evidence.json` (captured signatures/messages — public data, no private key material), `verify-d14r-test1.mjs` (verification script). Nothing else — no `.app` bundles, no provisioning material, no build products.
