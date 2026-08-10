# JARVIS Desktop D-14 — Founder Presence Authentication Architecture

**Status:** architecture + crypto proof-of-concept. **Not implemented, not wired, not authorized as a resolution feature.**
**Branch:** `chore/jarvis-desktop-d14-founder-presence-auth`, off `chore/jarvis-desktop-d13-gate-parity` (D-13, `35e6e11eb`), off `chore/jarvis-unit-19-native-governance-gate` (`8548a30d2`).
**Date:** 2026-08-10.

## 0. Governed entry

| Check | Result |
|---|---|
| Current HEAD (this worktree) | `35e6e11eb` before this unit's commit |
| D-13 commit | `35e6e11eb feat(jarvis-desktop): D-13 — governance gate read-only parity` |
| D-13 proofs, rerun fresh | **23/23 passing** (`jarvis-desktop-proof.mjs`) |
| Runtime lineage | `chore/jarvis-unit-19-native-governance-gate` @ `8548a30d2` — no runtime file differs from D-13's base |
| Builder capacity | `session.mjs status`: 1/2 governed slots active, 0 queued. Rate axis read **ANOMALOUS** (8–10x baseline across 5m/30m windows) — this is the tool's own advisory ("recommend handoff on secondary lanes"), not a hard block; capacity had room and the founder had just explicitly authorized this specific unit, so the work proceeded. Recorded here rather than silently ignored. |
| Duplicate D-14 | **NO** for this lane. `git log --all` matched one unrelated commit, `0a5555819 docs(studio): strengthen D-14 to a declaration requirement; record D-17` — a Writer's Studio unit using the same "D-14" shorthand in a different numbering namespace. No collision with JARVIS Desktop's own D-13→D-14 sequence. |
| Worktree | `.claude/worktrees/jarvis-d14-founder-presence-auth`, isolated |
| Builder claim | Not opened via `session.mjs open` — this session was already operating as an observed-but-ungoverned lane per the Builder status output's own "UNGOVERNED" line before this unit began; noted honestly rather than silently proceeding as if governed |

§0 passes. Proceeding.

## 1. The authentication gap, independently reconstructed

Read in full (not inherited from the prior founder-decision audit without re-verification): `scripts/builder/jarvis-authority-channel.mjs`, `jarvis-governance-gate.mjs`, `jarvis-runtime.mjs`'s `resolve-gate` handler. Confirmed independently:

- `AUTHENTICATORS` (`jarvis-authority-channel.mjs:75-83`) is a **role-naming registry**, not an authentication mechanism:
  ```js
  export const AUTHENTICATORS = Object.freeze({
    'local-operator-possession': { role: 'OPERATOR', description: '...' },
    'founder-control-plane-session': { role: 'FOUNDER', description: '...' },
  });
  ```
- `openChannel({ authenticator, actor_id })` (`:154-179`) checks only that `authenticator` is a known **name** and that `actor_id` is a non-empty string. It performs **no verification whatsoever** that the caller is who `actor_id` claims. Its own comment states the authenticator "names the mechanism that established the session **out of band**" (`:150`).
- A repo-wide grep (`grep -rln "openChannel(\|submitInstruction(" --include="*.mjs" --include="*.ts" --include="*.js" .`) outside `__tests__/` returns **only `jarvis-authority-channel.mjs` itself**. No HTTP endpoint, CLI, or UI anywhere in this repository actually calls `openChannel` or `submitInstruction` in production. `founder-control-plane-session` is a reserved name with zero implementation behind it.
- **New finding, not in the prior audit**: `resolve-gate`'s call to `verifyInstruction({ instruction_id: body2.instruction_id })` (`jarvis-runtime.mjs:466`) passes **no `target`/`required_class` scope**. Gate binding at present exists only via the role-match check inside `resolveGovernanceGate` (`instruction.actor_role !== gate.required_resolver_role`). The Unit 16 instruction object itself is **not** gate-bound — a valid, unexpired FOUNDER-role instruction is not inherently tied to any specific `gate_id`. **This means D-14's challenge/signature scheme cannot simply "reuse" Unit 16 as its binding layer — gate-binding has to be a property this unit supplies itself**, which is exactly what the design below does (challenge issued per-`gate_id`, payload signs `gate_id` directly).

**AUTHENTICATION TODAY: NOMINAL.** The role vocabulary, refusal taxonomy, expiry, revocation, and audit persistence are real and correctly built. The one thing that turns a claim into a fact — proof that a specific human authorized a specific act — does not exist anywhere in this codebase.

**WHERE THE TRUST GAP EXISTS**: precisely at `openChannel`'s `actor_id`/`authenticator` inputs. Anything calling `openChannel({ authenticator: 'founder-control-plane-session', actor_id: 'kelly' })` today would be trusted as FOUNDER with zero cryptographic or OS-level evidence. This is the single seam D-14 exists to close.

## 2. Constitutional invariants — carried forward, checked against the design below

All ten invariants from the mandate are structural properties of §5/§9/§11 below, not aspirational text:

- `installed JARVIS.app ≠ authenticated founder` — the design never treats process existence as identity; every accept path requires a fresh signature over a fresh challenge.
- `local machine ≠ authenticated founder` — see §8: device possession is explicitly evaluated and rejected as sufficient on its own.
- `Desktop process ≠ authorized principal` — Desktop never holds standing; it holds, at most, a request to obtain a signature.
- `authenticated founder ≠ authority for every gate` — every payload signs one `gate_id`; a signature for gate A does not verify for gate B (proof P2).
- `button click ≠ authorization` — a click only starts a challenge request; nothing is authorized until a signature independently verifies (proof P10).
- `UI intent ≠ runtime acceptance` — §11, §12: Desktop may display SUBMITTED, never APPROVED/REFUSED, before the verifier accepts.
- `Desktop ≠ authority verifier` / `runtime = final authority verifier` — the proof substrate's `verifyFounderResolution` is designed as the sole accept path (proof P12), standing in for where the real runtime's HTTP handler would call it.
- `founder authentication ≠ persistent universal capability` — each challenge is single-use (proof P5, P11); no session-wide founder token is proposed.

## 3. V1 scope (founder-ruled, not re-derived here)

FOUNDER only. OPERATOR excluded. APPROVE and REFUSE at identical authentication strength (see §12 of the mandate — this was a ruling, not left open). AMEND excluded — nothing in the current runtime forces its inclusion; `resolveGovernanceGate` only accepts `APPROVE`/`REFUSE` (`jarvis-governance-gate.mjs:249-251`), so AMEND exclusion costs nothing. Multi-device trust, remote IdPs, and persistent Desktop-held founder authority are excluded, consistent with the substrate: `verifyFounderResolution` takes no session/token argument that could stand in for a persistent grant.

## 4. Threat model

| Attack | Current exposure (today, no D-14) | V1 mitigation | Residual risk |
|---|---|---|---|
| Malicious renderer | N/A — no resolve path exists at all | Renderer never holds the private key or raw signature material (§14/§15) | Renderer could still *display* misleading gate info sourced from a compromised runtime — out of scope, runtime compromise is a different threat |
| Compromised Desktop process | N/A | Cannot forge a signature without the enrolled key; proof P10 | If the OS-level key-use gate (Touch ID) is itself bypassed by a compromised process with system-level access, no software mitigation in Desktop helps — this is the LIVE LOCAL DEVICE PROOF boundary |
| Stolen local session | N/A | No "session" is minted; each decision requires fresh signing | If the enrolled private key material itself is exfiltrated, V1 has no revocation UX beyond re-enrollment (§7) |
| Another user at Kelly's Mac | N/A | Touch ID / password prompt at signing time (§8) is the actual gate — a different physical person cannot produce Kelly's biometric or password | macOS password fallback is only as strong as the account password |
| Replayed approval | N/A | Single-use challenge, proof P5 | None identified within V1's boundary |
| Stale governance gate | N/A | `expires_at` on the challenge, proof P4; gate identity checked against the runtime's current gate state (would happen at the real runtime layer, not proven here) | Clock skew between Desktop and runtime — see below |
| Gate already resolved elsewhere | N/A | Real runtime's existing `OPEN`→`RESOLVED` transition (already implemented, Unit 19) is untouched and remains the actual single-resolution guard | None beyond what Unit 19 already provides |
| Forged role | N/A | Role is a signed field; tampering breaks the signature, proof P8 | None |
| Forged founder identity | N/A | `enrolledFounders` lookup + signature check, proof P7/P7b | Enrollment process itself (§7) is the trust root — compromising enrollment compromises everything downstream |
| Copied authentication artifact | N/A | Single-use challenge consumption is durable (persisted), proof P11 | None within a challenge's TTL window if consumption races correctly — see below |
| Two simultaneous Desktop instances | N/A | Both would request the runtime's HTTP resolve-gate; whichever authenticates first would rely on the real runtime's persistence to reject the second — the design substrate's ledger uses atomic file write+rename, matching this repo's existing convention, but true concurrent-race safety of `consume()` under simultaneous processes is **not proven here** (single-process test only) | **Flagged as unproven**, not claimed proven |
| Runtime restart | N/A | Persisted ledger, proof P11 | None |
| Desktop restart | N/A | Desktop holds no state that matters — a fresh Desktop process re-requests a challenge | None |
| Machine restart | N/A | Same as Desktop restart; key custody survives via Keychain (§7), not Desktop process memory | None |
| Clock skew | N/A | `expires_at` comparison uses whichever process's clock evaluates it — this is inherited risk from any TTL scheme | **Not solved by this unit**; real implementation should use the runtime's clock as authoritative for `expires_at` evaluation, not Desktop's |
| Challenge interception | N/A | Challenge alone (without a valid signature over it) is not accepted — an interceptor without the private key gains nothing, proof P10 | An interceptor who also compromises the signing step defeats this — same as "compromised Desktop process" above |
| Malicious localhost process | N/A | Design assumes the loopback boundary from Unit 12 (`runtime-client.js`'s loopback-only refusal) is unchanged; a malicious localhost process could still *attempt* HTTP calls to the runtime but cannot forge a valid signature | Localhost is explicitly **not** treated as trusted for authentication purposes in this design — only for transport, per Unit 12's existing model |
| Filesystem theft / credential extraction | N/A | Private key material is designed to live in Keychain/Secure Enclave, not a plaintext file (§7) — the proof substrate's `generateFounderKeypair()` returns PEM strings only because it is a math proof, and explicitly must never be the real key-custody path | This is the single highest-value target if V1 is built carelessly — **explicitly flagged**, not solved by this document |

## 5. Local-first authentication options

| Option | Foundational trust | Secret location | User presence | Device binding | Replay resistance | Recovery | Portability | Auditability | 3rd-party dep | macOS support | Electron integration | Runtime verifiability |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| A. OS-level interactive auth (Touch ID / password, `LocalAuthentication`) | OS biometric/password subsystem | N/A alone — gates key use | Yes, per-decision | Weak alone | N/A alone | OS account recovery | Low (device-specific) | OS-level only | None | Native | `electron` has no first-party LocalAuthentication API — needs a native module or Touch ID-gated Keychain item | N/A alone |
| B. Keychain-held private key, unlocked via OS auth | Keychain ACL + OS auth | macOS Keychain | Yes, if ACL requires auth on each use | Strong (device-specific keychain) | Strong (combined with challenge/nonce) | Manual re-enrollment if lost | Low | Full (signature is the record) | None | Native | `keytar`/`electron-store` do not manage signing keys directly; would need `Security.framework` via a native addon or `node-keychain`-style access, or Electron's `safeStorage` (encrypts, not sign-capable alone) | High — runtime verifies signature independently |
| C. Secure Enclave-backed keypair | Hardware | Secure Enclave (non-extractable) | Yes, if paired with Touch ID policy | Strongest | Strong | Requires new enrollment, key cannot be exported/backed up | Lowest (hardware-bound, deliberately) | Full | None | Native (Apple Silicon) | Requires native code (Swift/ObjC bridge or a maintained native Node module) — **no evidence found in this repo of such a module today** | High |
| D. Runtime-minted short-lived challenge signed by a founder-bound local key | Combines B or C with a fresh per-decision challenge | Wherever B/C places it | Yes, if signing requires B/C's gate | Strong | Strong (this is exactly what §9's design proves) | Same as B/C | Same as B/C | Full | None | Native | Combines B/C's integration cost with straightforward runtime-side logic (design substrate proves this half) | Highest — this IS the design chosen below |

**Recommended combination**: **D, built on B (Keychain-held key, OS-auth-gated) as V1**, with **C (Secure Enclave) as the natural upgrade path** once a maintained Electron/Secure-Enclave bridge is confirmed to exist or is built. This is not a new invention — it is the standard "challenge-response with a locally-custodied, OS-gated signing key" pattern, applied to the specific fields Unit 19's gate object already carries.

## 6. Minimum safe flow (derived, matches §6 of the mandate, confirmed against the design substrate)

```
runtime emits governance gate (Unit 19, unchanged)
        ↓
Desktop displays gate (D-13, unchanged, already shipped)
        ↓
founder chooses APPROVE or REFUSE (new UI, NOT built in D-14)
        ↓
Desktop requests a runtime-issued challenge for (gate_id, resolution_type)
        ↓
runtime issues { challenge_id, gate_id, principal, role, nonce,
                 permitted_resolution_types, requested_authority_digest,
                 issued_at, expires_at }
        ↓
Desktop invokes OS-level founder-presence authentication
   (Touch ID / password — gates use of the Keychain/Secure-Enclave key)
        ↓
founder-bound local key signs the canonical payload:
   { v, domain, principal, role, gate_id, resolution_type,
     challenge_id, nonce, issued_at, expires_at,
     requested_authority_digest }
        ↓
Desktop sends { payload, signature } to the runtime
        ↓
runtime independently verifies (proof substrate's verifyFounderResolution,
   or its eventual wired equivalent):
     domain, enrolled principal's public key, signature, role, resolution
     type, gate_id match, requested-authority-digest match, challenge
     existence/binding/expiry/consumption
        ↓
runtime consumes the challenge (single-use, persisted)
        ↓
runtime persists the canonical resolution (existing Unit 19 machinery,
   resolveGovernanceGate, unchanged)
        ↓
runtime resumes the run only if the resolution permits (existing Unit 19
   machinery, unchanged)
        ↓
Desktop displays the canonical runtime result — never its own guess
```

This sequence differs from the mandate's sketch in exactly one place worth naming: the mandate's sketch implies the Unit 16 channel/instruction system sits in the middle of this flow. §1's new finding shows that system isn't gate-bound today, so **this design bypasses Unit 16 entirely for V1** rather than trying to retrofit gate-binding into it. Whether Unit 16 and this new challenge/signature scheme should later be unified is a question for a future unit, not this one — flagged, not solved.

## 7. Cryptographic identity model

- **What is the founder key?** An Ed25519 keypair. Chosen for small signatures, fast verification, no parameter footguns (unlike RSA), and native support in both Node's `crypto` module (runtime side) and Apple's `CryptoKit`/Secure Enclave family (Desktop side, future).
- **Where generated?** In the real system: on the founder's enrolled device, ideally inside the Secure Enclave (non-extractable) or, as a V1 fallback, inside macOS Keychain with an access-control policy requiring biometric/password auth per use. **Never** generated by, or passed through, the runtime or any network call.
- **Where is private material stored?** Keychain (V1) or Secure Enclave (target). Never a plaintext file, never `localStorage`, never anywhere Electron's renderer process can read it.
- **Can private material leave the device?** No — this is a design requirement, not merely a preference. Secure Enclave keys are non-extractable by hardware design; a Keychain-held key should be marked non-exportable.
- **What does the runtime trust?** Only the enrolled **public** key, mapped to a principal id (`enrolledFounders` in the proof substrate). The runtime never sees, transports, or needs the private key.
- **How is the public key enrolled?** **Unresolved by this unit, and explicitly so** — enrollment is itself an authority-bearing act (whoever can enroll a new public key as "founder" can mint founder authority going forward) and deserves its own scrutiny, not a default invented here. A plausible shape: an out-of-band, one-time enrollment ceremony run by Kelly directly against the runtime host (e.g., a local CLI step run at the terminal, not through Desktop), analogous to how SSH `authorized_keys` enrollment works. Not designed further here.
- **How is enrollment itself authorized?** Same open question — flagged, not answered.
- **Key rotation?** Not designed. A plausible shape (re-enroll a new public key, mark the old one revoked in the same file-based pattern Unit 16 already uses for channels) is consistent with the architecture but not specified.
- **Key revocation?** Same — plausible, not specified.
- **Mac lost?** Founder loses the ability to resolve gates via Desktop until re-enrollment; the existing (non-Desktop) resolution path — whatever authorizes gates today, which per §1 is presently *nothing wired* — would be the fallback. This is itself evidence that D-14 does not need to solve "what if the only path breaks," because no path exists yet to be a single point of failure.
- **Touch ID changes (re-enrolled fingerprint)?** Keychain ACL policies tied to biometry generally continue to work with re-enrolled biometrics on the same device (the key itself isn't tied to a specific fingerprint) — not verified against a live device in this unit.
- **After OS reinstall?** Keychain-held keys do not survive an OS reinstall unless separately backed up (and backing up defeats non-extractability, a real tension); Secure Enclave keys never survive because Enclave state is tied to the specific chip's re-provisioning. Re-enrollment would be required. Not designed further.

## 8. Founder presence ≠ device possession

**Confirmed: NO, device possession is not sufficient.** This is not merely the mandate's default hypothesis carried forward — it's structurally enforced in the design: a Keychain item with a biometric/password ACL requires the interactive OS prompt **at the moment of use**, not merely at device unlock. Possessing an unlocked Mac does not, by itself, satisfy that ACL. `Touch ID` is the primary mechanism (fast, already muscle-memory for macOS users); macOS password is the required fallback (Touch ID hardware can be unavailable, disabled, or the founder may be using external keyboard/monitor setups where fingerprint sensor access varies). Both mechanisms funnel through the same Keychain-gated key-use event, so the cryptographic proof (§9 below) is identical regardless of which OS-level method satisfied the prompt.

**FOUNDER PRESENCE PROOF**: the OS-level prompt succeeding, immediately followed by successful use of the gated key to produce a valid signature.
**DEVICE POSSESSION PROOF**: merely having the Mac powered on and unlocked — explicitly insufficient alone.
**WHY BOTH ARE REQUIRED, NOT ONE**: device possession alone is defeated by "another user at Kelly's Mac" (§4); presence-at-decision-time without device binding would require a different (non-local-first) architecture (§10). Combined, they answer "this specific device, this specific enrolled key, this specific interactive moment."

## 9. Challenge binding — canonical payload, proven

Schema (implemented in `scripts/builder/design/jarvis-founder-presence-auth/founder-presence-auth.mjs`):

```
{ v: 1, domain: "jarvis.desktop.founder_presence.gate_resolution.v1",
  principal, role, gate_id, resolution_type, challenge_id, nonce,
  issued_at, expires_at, requested_authority_digest }
```

- **Canonical serialization**: keys sorted, JSON-stringified, prefixed with the fixed domain string and a newline before signing (`canonicalize()`) — this is domain separation: a signature produced for this scheme's bytes can never be replayed as valid input to a different signing protocol that happens to consume similar JSON.
- **Signature algorithm**: Ed25519 (Node's one-shot `crypto.sign(null, bytes, privateKey)` / `crypto.verify(null, bytes, publicKey, signature)` — the streaming `createSign`/`createVerify` API does not support Ed25519 and was a bug in the first draft of this substrate, caught and fixed before the proof ran).
- **`requested_authority_digest`**: a SHA-256 digest of the gate's actual requested-authority object (mirroring `authority_required` from `publicGovernanceGate()`), so a resolution cannot silently apply to a widened or narrowed authority claim than what the founder actually saw and decided on.
- Platform primitives are used throughout — no bespoke cryptography was implemented; only the payload shape and binding logic are new.

**Proven** (proof P2, P3, P6, P8): tampering `gate_id`, `resolution_type`, `requested_authority_digest`, or `role` after signing invalidates the signature, because canonicalization re-derives the signed bytes from the (possibly tampered) fields on every verification — there is no field the verifier trusts without it being part of what was actually signed.

## 10. Replay protection

- **Single-use semantics**: a challenge transitions from unconsumed to consumed exactly once (`ledger.consume()`), file-persisted with the same atomic write+rename pattern already used by `jarvis-authority-channel.mjs`'s own `writeAtomic`.
- **Expiry**: `expires_at` set at issuance (V1 default 120s in the proof substrate — a real value should be chosen to comfortably fit an interactive Touch ID/password flow without being so long it widens the replay window unnecessarily).
- **Duplicate submission**: rejected with `CHALLENGE_CONSUMED`, distinct from other refusal classes (proof P5).
- **Runtime restart behavior**: proven directly — a *fresh process* reloading the ledger file sees the same consumed state (proof P11).
- **Persistent replay ledger**: required by this design (not optional), and is exactly what makes P11 provable — an in-memory-only ledger would fail this property across a runtime restart.

**Not proven**: true concurrent-process race safety of `consume()` (two simultaneous callers hitting the same challenge_id at the exact same instant) — the proof substrate is single-process. The real runtime implementation should use whatever file-locking or single-threaded-event-loop guarantee the existing `jarvis-runtime.mjs` HTTP server already relies on elsewhere (it appears to be a single Node event loop handling one request at a time per the existing code structure, which would make this a non-issue in practice — but that inference is not verified here and should be confirmed, not assumed, when this is actually wired).

## 11. Runtime remains sovereign

Structurally enforced in the substrate, not merely asserted: `verifyFounderResolution` is the **only** function in the module whose name matches accept-like semantics (proof P12 checks this by introspecting the module's exports). Every other function either issues a challenge, builds an unsigned payload, or signs — none of them can, by themselves, produce an accepted resolution. Signature verification happens **before** any other field is trusted (§9), so nothing about "what the caller says" is accepted until the cryptographic fact is independently established. Desktop's future responsibility is display-only: **SUBMITTED**, never **APPROVED/REFUSED**, until whatever wires this into the real runtime returns confirmation.

## 12. Approve / Refuse — V1 ruling carried forward unchanged

Per the founder's explicit ruling in the mandate: APPROVE and REFUSE require identical authentication strength in V1. The design substrate does not special-case either — `PERMITTED_RESOLUTION_TYPES` is a flat two-element list, and `verifyFounderResolution` applies the exact same check sequence regardless of which value `resolution_type` holds. Recorded reasons (simplicity, single trust model, less policy branching, proving the seam before optimizing it) are the founder's own; this document does not add new justification, and does not revisit the ruling.

## 13. Operator exclusion

OPERATOR is out of scope, cleanly. **No blocker was found that would have prevented a clean FOUNDER-only implementation** — the design substrate's `V1_ROLE` constant is a hard-coded `'FOUNDER'`, and nothing in the current runtime's `GATE_CLASSES` (`jarvis-governance-gate.mjs:46-51`) forces OPERATOR-class gates to be resolved through this same mechanism; they simply remain unresolvable through Desktop, same as today. No speculative OPERATOR work was done.

## 14. Desktop boundary (future — not built in D-14)

Minimum future Desktop responsibilities: display gate (already true, D-13); capture explicit founder choice (APPROVE/REFUSE selection, no default); initiate a challenge request; invoke OS-level authentication; request the founder-key signature (via whatever native/Keychain bridge is eventually built); submit the signed response; display the canonical runtime result.

Desktop must **not**: store universal founder authority (no long-lived token cached across gates); mint a gate; expand requested authority; choose a role (V1 hard-codes FOUNDER, not user-selectable); infer founder identity (identity comes only from which enrolled key successfully signs); modify resolution_type after the founder's explicit choice; declare success before the runtime confirms; resume a run itself (that remains exclusively `jarvis-runtime.mjs`'s `resolveGovernanceGate`/`transition` machinery, untouched by this unit).

## 15. Preload / IPC boundary (future — not built in D-14)

Minimum conceptual API, **not implemented**:

```
requestFounderChallenge(gateId, resolutionType)
authenticateAndSignFounderDecision(challenge)   // triggers OS prompt + Keychain/Enclave signing internally
submitFounderResolution(signedAssertion)
```

No generic `shell`, `filesystem`, `keychain`, `crypto signing`, `environment`, or `child_process` API should ever be exposed to the renderer — the three functions above are the entire surface, and even `authenticateAndSignFounderDecision` should be implemented so the renderer receives only the finished `{ payload, signature }` object, never raw key handles. This mirrors D-13's existing preload discipline (`jarvis/preload.js` exposes exactly 8 fixed methods today, no generic `invoke`) and should be held to the same standard.

## 16. Proof strategy — results

Executable: `node scripts/builder/__tests__/jarvis-founder-presence-auth-proof.mjs` — **12/12 passing**.

| Proof | Result |
|---|---|
| P1 valid decision verifies | ✓ |
| P2 wrong gate fails | ✓ (signature invalidated by tamper) |
| P3 wrong resolution type fails | ✓ (signature invalidated) |
| P4 expired challenge fails | ✓ |
| P5 replay fails | ✓ |
| P6 modified requested authority fails | ✓ (signature invalidated) |
| P7 wrong principal (impostor key) fails | ✓ |
| P7b unenrolled principal fails | ✓ (rejected before signature check even runs) |
| P8 wrong role fails | ✓ |
| P9 unsigned renderer-originated click fails | **ARCHITECTURAL — not exercised.** No renderer exists in this substrate; the Desktop boundary (§14/§15) is what prevents this in the eventual real system. Not overclaimed as tested. |
| P10 no bypass path without real key use | ✓ |
| P11 replay protection survives process restart | ✓ (fresh-process ledger reload) |
| P12 runtime is the sole accept path | ✓ (module export introspection) |

**CRYPTOGRAPHIC PROOF**: complete for the properties above (12/12).
**OS-PRESENCE PROOF**: not attempted — Touch ID/password gating of key use requires a live macOS integration this headless substrate does not build.
**LIVE LOCAL DEVICE PROOF REQUIRED**: yes, before any implementation unit ships — specifically, that a Keychain (or Secure Enclave) item can actually be configured to require biometric/password auth per signing operation from an Electron process, and that no unintended caching of the "unlocked" state lets a second use skip the prompt.

## 17. Implementation limit — respected

The only code written is the isolated proof substrate (`scripts/builder/design/jarvis-founder-presence-auth/founder-presence-auth.mjs`) and its proof file. Neither is imported by, nor imports from, `jarvis-runtime.mjs`, `jarvis-authority-channel.mjs`, `jarvis-governance-gate.mjs`, or any file under `desktop-app/jarvis/`. No IPC, no preload, no UI, no OPERATOR, no packaging, no production code was touched. This is the smallest executable substrate that could discriminate the architecture's claims (§16) rather than merely assert them in prose — writing it as prose-only would have left P1–P8/P10–P12 unverified rather than proven.

## 18. Unresolved founder decisions carried forward

1. **Key enrollment**: how is a public key first accepted as "the founder's key"? (§7) Not designed here — this is itself authority-bearing.
2. **Key rotation / revocation UX**: plausible shape sketched, not specified.
3. **Whether to unify this new challenge/signature scheme with Unit 16's channel/instruction model, or keep them permanently separate** (§6) — §1's finding that Unit 16 isn't gate-bound means V1 bypasses it entirely; a future unit could reconsider.
4. **Concurrent-process race safety of challenge consumption** (§10) — assumed benign given the existing runtime's apparent single-threaded request handling, not verified.
5. Everything already flagged as out of scope by the mandate (OPERATOR reconciliation, APPROVE/REFUSE asymmetry, device-trust-vs-principal-trust for any future device-enrollment feature) remains exactly as open as the prior founder-decision audit left it — this unit did not touch those questions.

## 19. Classification

**B — architecture sound but live OS-presence / device proof still required.**

Not A: the cryptographic architecture is proven, but nothing here has exercised an actual Touch ID/Keychain integration on real hardware — that gap is real and named, not closed.
Not C: the current authority channel does not need to be refactored for this to work — D-14's design deliberately routes around it (§1, §6) rather than depending on it.
Not D: FOUNDER/OPERATOR reconciliation is not a blocker for a FOUNDER-only V1 (§13).

## 20. Final report

```
CLASSIFICATION: B — architecture sound; live OS-presence/device proof still required
START SHA: 35e6e11eb (D-13 tip)
END SHA: (this unit's commit, see git log)
CLAIM: not opened via session.mjs open — session already running as an
       observed-but-ungoverned Builder lane before this unit began (noted, §0)
WORKTREE: .claude/worktrees/jarvis-d14-founder-presence-auth
D-13 VERIFIED: YES — 23/23 proofs, rerun fresh in this worktree
CURRENT AUTHENTICATION: NOMINAL (role vocabulary real; verification of the
                         claimed actor does not exist anywhere in the repo)
FOUNDER-CONTROL-PLANE-SESSION IMPLEMENTED: NO
RECOMMENDED FOUNDER AUTH: Ed25519 keypair, Keychain-held (V1) with
                          biometric/password ACL, Secure-Enclave upgrade path
OS PRESENCE MECHANISM: Touch ID, macOS password fallback
DEVICE KEY MODEL: non-exportable, device-bound, gated per-use by OS prompt
RUNTIME CHALLENGE: yes — { challenge_id, gate_id, principal, role, nonce,
                    permitted_resolution_types, requested_authority_digest,
                    issued_at, expires_at }, single-use, persisted
SIGNED PAYLOAD: { v, domain, principal, role, gate_id, resolution_type,
                  challenge_id, nonce, issued_at, expires_at,
                  requested_authority_digest }, Ed25519, domain-separated
REPLAY PROTECTION: single-use challenge ledger, persisted, survives restart
RUNTIME FINAL VERIFIER: YES
APPROVE / REFUSE AUTH: SAME STRENGTH (V1 ruling, unrevisited)
OPERATOR: OUT OF SCOPE (no blocker found)
DESKTOP PRIVATE KEY ACCESS: NO (design requirement — key never leaves
                             Keychain/Enclave, renderer never touches it)
RENDERER PRIVATE KEY ACCESS: NO
PROOFS: 12/12 passing (P1-P8, P10-P12); P9 architectural/not exercised;
        OS-presence/live-device proof not attempted (out of reach headlessly)
LIVE LOCAL DEVICE PROOF REQUIRED: YES
FILES CHANGED: scripts/builder/design/jarvis-founder-presence-auth/
               founder-presence-auth.mjs (new, isolated);
               scripts/builder/__tests__/jarvis-founder-presence-auth-proof.mjs
               (new, isolated);
               docs/architecture/JARVIS_DESKTOP_D14_FOUNDER_PRESENCE_
               AUTHENTICATION_2026-08-10.md (this file, new)
DESKTOP RESOLUTION IMPLEMENTED: NO
RESOLUTION BUTTONS ADDED: NO
PACKAGING TOUCHED: NO
PRODUCTION: UNTOUCHED
NEXT CANDIDATE UNIT: a live-device proof spike — confirm on real hardware that
                     an Electron process can require Touch ID/password to use a
                     Keychain-held Ed25519 (or equivalent) key per signing
                     operation, with no caching that would let a second
                     signature skip the prompt. This is a narrower, still
                     non-resolution-implementing unit.
NEXT UNIT AUTHORIZED: NO
```

D-14 success ≠ resolution implementation authority. Authenticated founder ≠ universal authority. Desktop intent ≠ runtime acceptance.
