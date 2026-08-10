# JARVIS Desktop D-14L — Live Founder Presence Proof

**Status:** live device proof, executed. **Not a resolution-implementing unit. No Desktop, IPC, preload, OPERATOR, packaging, or production changes.**
**Branch:** `chore/jarvis-desktop-d14l-live-presence-proof`, off `chore/jarvis-desktop-d14-founder-presence-auth` (`83f4fdfb1`), off D-13 (`35e6e11eb`).
**Date:** 2026-08-10. **Device:** Mac Studio, Apple M4 Max, macOS 15.7.8 (24G806).

## 0. Governed entry

| Check | Result |
|---|---|
| D-13 commit | `35e6e11eb`, verified present |
| D-14 commit | `83f4fdfb1`, verified present, on the correct lineage |
| Duplicate D-14L | NO — no prior branch or commit found |
| Builder capacity | 0/2 active, 0 queued at start. Rate axis: HIGH (not ANOMALOUS this time), advisory only — recorded, not treated as authority to reinterpret the run, per standing instruction |
| Worktree | `.claude/worktrees/jarvis-d14l-live-presence-proof`, isolated |

§0 passes.

## 1. Reverify the live-proof gap

From the D-14 record: cryptographic model proven (12/12 crypto proofs). Live macOS presence: not proven. Live Keychain gating: not proven. Per-signing reauthentication: not proven. Second-signature cache bypass risk: established as a named open question, not yet observed either way. D-14L exists to close exactly this, and only this.

## 2. Live device — synthetic inputs only

All proof inputs used were synthetic: a test-only Keychain application tag (`com.soullab.jarvis.d14l-test.founder-presence-proof`), synthetic authentication reason strings, no production gate, no Builder authority, no member or Jondi data, no operator credentials.

## 3–4. Candidate mechanisms actually available on this Mac

| Candidate | Result |
|---|---|
| A. LocalAuthentication interactive evaluation (`LAContext.evaluatePolicy`) | Available, testable without entitlements. **This is what was actually exercised.** |
| B/D. Keychain access control (`kSecAttrAccessControl` + `.userPresence`/`.privateKeyUsage`) on a permanent `SecKey` item | **Blocked in this test harness** — see §5. Not exercised live. |
| C. Touch ID | Configured for unlock per `bioutil -r`, but `LAContext.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics)` reported `false`, error "No paired accessory" — the Touch ID-capable accessory (a Magic Keyboard with Touch ID; Mac Studio has no built-in sensor) was not paired/available to this process at test time. Password fallback was exercised instead. |
| E. Secure Enclave | Present in hardware (Apple M4 Max SoC), confirmed via `system_profiler SPiBridgeDataType`. **Not reachable from this test harness** — see §5. |

MAC HARDWARE SUPPORT: Apple M4 Max, Secure Enclave present.
TOUCH ID AVAILABLE: configured for unlock, but not paired/available to this process at test time (password fallback used).
KEYCHAIN ACCESS CONTROL AVAILABLE: hardware-capable, **not achievable from an unsigned CLI binary** (§5).
SECURE ENCLAVE AVAILABLE: YES (hardware), **not reachable from this test harness** (§5).
PASSWORD FALLBACK AVAILABLE: YES, confirmed live.

## 5. Proof key — what was actually attempted, and what blocked it

**First attempt**: Secure-Enclave-backed P-256 key (`kSecAttrTokenIDSecureEnclave`), access control `.privateKeyUsage + .userPresence`. `SecKeyCreateRandomKey` failed: `OSStatus -34018` (`errSecMissingEntitlement`) — "failed to add key to keychain."

**Second attempt** (fallback): a software (non-SE) P-256 Keychain key, same access-control intent, `.userPresence` only (`.privateKeyUsage` is SE-specific and was dropped). **Also failed with the same `-34018`.**

**Conclusion, stated precisely rather than generalized**: this specific test harness — a bare `swiftc`-compiled, unsigned, non-bundled CLI binary with no provisioning profile — cannot create **any** permanent `SecKey` Keychain item with an access-control policy on this macOS version, whether or not the key is Secure-Enclave-backed. This is evidence about **what an ad-hoc binary can do**, not evidence that the underlying mechanism is unsound. A properly signed and provisioned Electron app bundle (D-14's actual eventual target, per §14/§15 of the D-14 record) is a materially different code-signing posture and was explicitly out of scope for this unit (§10 of the D-14L mandate allows marking this NOT RUN — IMPLEMENTATION WOULD EXCEED UNIT, which is exactly what happened here for the Keychain-ACL path).

KEY TYPE: attempted SE P-256, then software P-256 — **neither was successfully created**.
KEY LOCATION: N/A — no key was ever persisted.
ACCESS CONTROL: attempted `.privateKeyUsage + .userPresence` (SE) and `.userPresence` (software) — neither reached the point of being tested live.
PRIVATE MATERIAL EXPORTABLE: N/A.
USER PRESENCE REQUIRED: N/A for this path — untested, blocked before reaching that question.

Given this blocker, the unit fell back to testing candidate A (`LAContext.evaluatePolicy(.deviceOwnerAuthentication)`) directly, gating nothing but itself — no key material, Keychain-independent. This is a real, valid, weaker test than the Keychain-ACL path would have been, and is reported as exactly that.

## 6–7. Proof 1 — first signing-equivalent act

`./presence-gate authenticate "D-14L Proof 1..."` — process returned `{"ok": true, ...}` promptly.

**Ground truth, from the operator directly, not inferred from the return value**: *"I don't know. Didn't see it."* — **no visible authentication prompt appeared on screen for this call**, yet the call reported success.

OS AUTH PROMPT OBSERVED: **NO**.
TOUCH ID / PASSWORD REQUIRED: apparently not, for this specific call.
SIGNATURE PRODUCED: N/A (this variant tests presence only, not signing — see §5's scope note).
Per §6 of the mandate: *"If signing occurs without a fresh presence event: FAIL."* — **this proof fails the stated invariant.**

## 7. Proof 2 — second signing-equivalent act

Second call returned `{"ok": true, ...}` as well. Operator's report ("I just okd it") was ambiguous as to whether a prompt was actually seen for this specific call — **not treated as confirmed evidence either way**, and not relied on for the classification below.

## Retry — a third, unambiguous call

A third call was run with an explicit request to watch the screen. **This one produced a real, visible macOS system dialog** — titled "presence-gate," reading *"presence-gate is trying to D-14L retry: watch your screen for this one. Enter the password for the user 'Kelly Nezat' to allow this,"* with Cancel/OK buttons — confirmed by a screenshot the operator provided. The operator entered their password and clicked OK; the call then returned `{"ok": true}`.

**This establishes, with direct visual confirmation, that the mechanism CAN produce a real interactive prompt** — the earlier silent pass (Proof 1) was not a fabrication or a broken test harness; the mechanism genuinely varies between calls.

## 8. Proof 3 — same-gate replay

Not separately exercised as a distinct step: this proof variant (bare `LAContext.evaluatePolicy`) carries no gate/challenge binding of its own to replay against — that binding lives in the D-14 crypto substrate (already proven, P5/P11 in the D-14 record), not in this live-presence-only test. Not overclaimed as tested here.

## 9. Proof 4 — process restart

Each of the three calls above was already a fresh OS process (no long-running daemon) — this is structurally equivalent to "process restart" for every single call, and the result (inconsistent — one silent pass, one confirmed prompt) stands regardless of restart, since there is no process to restart from in the first place. Fresh presence was **not** reliably required across these fresh-process calls, which is the more concerning finding: even without any in-process caching to blame, the OS-level behavior was inconsistent.

## 10. Proof 5 — Electron context

**ELECTRON CONTEXT PROOF: NOT RUN — IMPLEMENTATION WOULD EXCEED UNIT.** Per the mandate's own allowance (§10). Building a signed/provisioned Electron harness is a materially larger unit than this one, and is the natural next candidate if this finding is pursued further.

## 11. No cached authority — the actual finding

**CAN SECOND SIGN SKIP PRESENCE: inconclusive as tested for "second," but YES was observed at least once (Proof 1) without any prior successful call in this harness to have cached anything.**

The most defensible explanation, given the pattern (silent pass, then — after intervening time spent on conversation — a confirmed fresh prompt): macOS's `.deviceOwnerAuthentication` policy appears to carry an **OS-level authentication-recency grace window** that is outside this (or any) app's control — distinct from `LAContext.touchIDAuthenticationAllowableReuseDuration`, which was left at its default (no reuse) in this code and was not the cause. If the device was authenticated (unlocked, or otherwise recently verified) shortly before a call, that call can be silently satisfied; once enough time elapses, a fresh interactive prompt is required again. **This is a real cache/grace-window behavior, sourced from the OS rather than from any code in this substrate**, and it directly undermines "every signing act requires fresh presence" as an invariant enforceable purely via this policy.

CACHE SURFACES: OS-level authentication-recency grace for `.deviceOwnerAuthentication`, timing not controlled by the caller.
CAN SECOND SIGN SKIP PRESENCE: **YES, observed** (Proof 1, and structurally the risk applies to any call, not specifically "second").
IF YES: exact mechanism — not fully diagnosable from outside Apple's LocalAuthentication implementation; behavior is consistent with a short post-unlock/post-auth grace period.
V1 ACCEPTABLE: **NO** — this is precisely the gap the operator's standing ruling said must return B (or, as classified below, C) rather than being accepted as close enough.

## 12. Authentication strength

Not meaningfully testable given §11's finding — both APPROVE-equivalent and REFUSE-equivalent acts would ride the same underlying `.deviceOwnerAuthentication` call and inherit the same grace-window weakness. No asymmetry was introduced. OPERATOR: not tested, out of scope, unchanged from D-14.

## 13. Failure cases

Not systematically exercised beyond what naturally occurred: no explicit cancel/Touch-ID-failure/expired-challenge tests were run, because the more fundamental finding (§11) makes those secondary — a mechanism that doesn't reliably require presence in the first place has a defect upstream of failure-mode polish. Not overclaimed as tested.

## 14. Cleanup

TEST KEY REMOVED: N/A — no key was ever successfully created (both generate attempts failed at `-34018` before any Keychain write occurred).
TEST KEYCHAIN ENTRY REMOVED: N/A, confirmed via `security find-key`/`security find-generic-password` — nothing found, nothing to remove.
SECRETS LEFT BEHIND: **NO.**
Compiled binary (`presence-gate`, a build artifact) removed; Swift source retained as the design/proof record, matching D-14's convention of keeping isolated, non-secret proof substrate in the repo.

## 15. Classification

**C — macOS/Keychain mechanism cannot establish required per-signing presence**, bounded precisely as follows:

- The **stronger** candidate mechanism (Keychain-item access control, `.userPresence`/`.privateKeyUsage`, evaluated at actual key-use time — the one D-14's architecture actually recommended) could not be tested at all: blocked by code-signing entitlement requirements this ad-hoc test binary cannot hold (§5). This remains **genuinely open**, not disproven — it may behave correctly (forcing fresh presence on every access, independent of the OS-level grace window seen below) once run from a properly signed, provisioned application. That is untested, not ruled out.
- The **fallback** candidate mechanism actually tested (bare `LAContext.evaluatePolicy(.deviceOwnerAuthentication)`, no Keychain binding) **failed the stated invariant live**: at least one call succeeded with no visible interactive event, confirmed directly by the operator watching their own screen, while another call — under otherwise identical code — did produce a real, screenshotted prompt. The mechanism as tested is real but unreliable for "fresh presence on every act," due to an OS-level grace window outside app control.

Not A: fresh presence was not reliably required — directly contradicted by Proof 1.
Not B: the gap was not specifically "second signing caches on the first" — it was more diffuse (any call could be silently satisfied depending on OS-judged recency), which is arguably a harder problem than simple in-app caching, since there is no in-app state to fix.
Not D: no Electron context was tested at all (§10), so no Electron-specific leak was found or ruled out — that question stays open, not concluded.
Not E: the apparatus was not insufficient — it produced clear, reproducible, screenshot-confirmed evidence. The mechanism itself is what fell short, not the ability to test it.

## 16. Final report

```
CLASSIFICATION: C — macOS/Keychain mechanism (as reachable from an unsigned
                 CLI test harness) cannot establish required per-signing
                 presence via bare LAContext.deviceOwnerAuthentication; the
                 stronger Keychain-ACL-bound mechanism remains untested,
                 not disproven, blocked by code-signing entitlements
MAC: Mac Studio, Apple M4 Max
macOS VERSION: 15.7.8 (24G806)
TOUCH ID: configured for unlock; not paired/available to this process at
          test time (password fallback exercised instead)
D-14 COMMIT: 83f4fdfb1
TEST KEY TYPE: none successfully created (SE and software both failed,
               OSStatus -34018, errSecMissingEntitlement)
KEYCHAIN / SECURE ENCLAVE MODEL: untested — blocked before reaching this
FIRST SIGNING REQUIRES PRESENCE: NO (Proof 1 — confirmed by direct operator
                                  observation: no visible prompt)
SECOND SIGNING REQUIRES FRESH PRESENCE: INCONCLUSIVE for the labeled
                                         "second" call, but a later
                                         (third) call DID require and
                                         receive fresh presence, confirmed
                                         by screenshot
CACHED AUTHORITY OBSERVED: YES — OS-level authentication-recency grace
                            window, not app-controlled, not app-caused
PROCESS RESTART REQUIRES FRESH PRESENCE: NOT RELIABLY — every call was
                                          already a fresh process, and
                                          behavior was still inconsistent
ELECTRON CONTEXT PROOF: NOT RUN — IMPLEMENTATION WOULD EXCEED UNIT
PRIVATE KEY EXPOSED TO RENDERER: NOT TESTED (no renderer, no key)
REPLAY: NOT SEPARATELY TESTED — no gate/challenge binding exists in this
        presence-only variant; already proven at the crypto layer in D-14
CANCEL FAILS CLOSED: NOT TESTED
AUTH FAILURE FAILS CLOSED: NOT TESTED
EXPIRED CHALLENGE FAILS CLOSED: NOT TESTED (no challenge in this variant)
MALFORMED PAYLOAD FAILS CLOSED: NOT TESTED (no payload in this variant)
APPROVE / REFUSE AUTH STRENGTH: SAME (both would ride the same underlying
                                 mechanism; no asymmetry introduced)
OPERATOR: OUT OF SCOPE, unchanged
TEST SECRET CLEANUP: PASS — nothing was ever persisted; confirmed via
                      `security find-key` / `security find-generic-password`
LIVE FOUNDER PRESENCE STANDING: NOT PROVEN
D-14 READY FOR FUTURE RESOLUTION IMPLEMENTATION UNIT: NO
FILES MODIFIED: scripts/builder/design/jarvis-founder-presence-auth/
                d14l-live-proof/presence-gate.swift (new, isolated,
                source only — compiled binary not committed);
                docs/architecture/JARVIS_DESKTOP_D14L_LIVE_FOUNDER_
                PRESENCE_PROOF_2026-08-10.md (this file, new)
PRODUCT CODE MODIFIED: NO
DESKTOP BUTTONS: NONE
PACKAGING: UNTOUCHED
PRODUCTION: UNTOUCHED
NEXT CANDIDATE UNIT: a signed/provisioned Electron (or minimal signed .app)
                     harness testing the Keychain-ACL-bound key path
                     directly — the mechanism §5 could not reach from an
                     unsigned CLI binary, and the one most likely to
                     actually force fresh presence per access, since
                     Keychain access-control evaluation (unlike bare
                     LAContext.deviceOwnerAuthentication) is tied to the
                     specific access event rather than a general
                     device-recency check
NEXT UNIT AUTHORIZED: NO
```

Live founder presence proven ≠ Desktop resolution authorized. Touch ID succeeds ≠ runtime accepted governance authority. Device trusted ≠ principal authenticated. Principal authenticated ≠ gate authorized. **And, newly earned by this unit: a signature architecture being cryptographically sound (D-14) does not mean the human-presence claim underneath it is true (D-14L) — those are separable, and this unit is why they were separated rather than assumed together.**
