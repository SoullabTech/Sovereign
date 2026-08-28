# AUTH-BIOMETRIC-01A · Cross-Surface Credential Bootstrap Architecture

**Status:** SPEC ONLY — no implementation authorized
**Opened:** 2026-08-27, on the ruling that split AUTH-BIOMETRIC-01 into B (shipped) and A (this)
**Predecessor:** `AUTH_BIOMETRIC_01.md` §5 fork, branch A

---

## 0. What this is not

Not "make Face ID work everywhere." That framing is what produced the original
defect: it treats two cryptographic ceremonies as one feature with a bug.

> A member who has established trusted biometric identity on one Soullab surface
> can **deliberately** establish a cryptographically valid credential on another
> surface, without the product pretending that device capability equals account
> enrollment.

We are not unifying Face ID implementations. We are unifying the member's
**trust relationship** while preserving the distinct ceremonies of each surface.

## 1. Architecture

```
SOVEREIGN MEMBER ACCOUNT
        │
        ├── Native trust
        │     trusted_devices
        │     device biometric verification
        │
        └── WebAuthn credentials
              credential id · public key
              counter / metadata
              RP-bound ceremony

Native trust ≠ WebAuthn credential

But:
        verified native trust
              + explicit member consent
              + fresh server challenge
                        ↓
        may AUTHORIZE registration of a new WebAuthn credential
```

**Authorize** is the load-bearing word. Native Face ID does not become a web
passkey. It authorizes a fresh WebAuthn registration ceremony, which then
succeeds or fails on its own terms.

## 2. Invariants

1. **No flag flip.** `has_webauthn = true` only after the server verifies a
   completed WebAuthn registration.
2. **No credential copying.** Native biometric secrets never leave Secure
   Enclave / platform storage and are never converted into WebAuthn material.
3. **Fresh proof of presence.** Bootstrap requires a fresh native biometric
   verification, not merely an existing `trusted_devices` row.
4. **Fresh server challenge.** Short-lived, single-use, bound to member and to
   the intent of credential registration.
5. **Explicit member act.** "Use Face ID to set up sign-in on this browser" is a
   ceremony, never an automatic background migration.
6. **RP / origin binding intact.** The result is a genuine Soullab WebAuthn
   credential for the correct relying-party ID.
7. **Multiple credentials are first-class.** iPhone, Mac, security key — each
   separately revocable, not one global biometric flag.
8. **Recovery never depends on biometrics alone.** Email code and password
   remain available.
9. **Revocation is asymmetric.** Removing a trusted native device does not
   silently delete a web credential; deleting a web credential does not
   silently revoke native trust.
10. **Auditability.** Registration, naming, last-use and revocation are
    attributable without storing biometric material.

## 3. The ceremony

```
Member signed in on native app
        ↓
Account → Security
        ↓
"Set up sign-in for web / another device"
        ↓
fresh native biometric verification
        ↓
server issues one-time bootstrap authorization
        ↓
member opens target browser
        ↓
browser performs a real WebAuthn registration
        ↓
server verifies attestation / credential
        ↓
credential stored
        ↓
has_webauthn DERIVED from actual credential existence
```

Explicitly not:

```
Face ID worked in app  →  set has_webauthn = true
```

That second path is the semantic collapse B repaired. Reintroducing it under a
new name would undo B while appearing to complete A.

## 4. Data model direction

`members.has_webauthn` stops being the source of truth. It may remain a cached
convenience for compatibility, but canonical truth becomes:

```
member_web_credentials
  id · member_id · credential_id · public_key
  sign_count · transports
  device_label / member_label
  created_at · last_used_at · revoked_at
```

with

```
has_webauthn = EXISTS(active web credential for member)
```

A derived flag cannot diverge from the store it is derived from. A stored flag
can, and did — that divergence is the whole of AUTH-BIOMETRIC-01.

**Do not create `member_web_credentials` because that is the name in the
sketch above.** `lib/auth/webauthnServer.ts` already writes a
`webauthn_credentials` table and sets `has_webauthn` alongside it. Standing up a
second store to match a diagram would reproduce the architectural split A exists
to remove — a third credential store is the defect's own shape, not its repair.
The shape above is a target to reconcile toward, and it may turn out that
`webauthn_credentials` already satisfies it. See §6.1: whether any schema change
exists at all is an output of the census, not an input.

## 5. Acceptance

Every line demonstrated, none assumed:

```
native-only member                    → web button withheld initially
fresh native verification + bootstrap → browser completes WebAuthn registration
after registration                    → server holds a real credential
                                      → has_webauthn derives true
                                      → web biometric sign-in succeeds
revoke web credential                 → web biometric sign-in stops
                                      → native trusted-device sign-in still works
revoke native device                  → native sign-in stops there
                                      → unrelated web credential still works
replay bootstrap token                → refused
expired bootstrap token               → refused
wrong member / wrong origin           → refused
```

Per the standard this thread has held: each must go RED against the code as it
stands before it counts as evidence. The first line is already green from B —
which makes it a regression guard for A, not a new claim.

## 6. Gate before implementation

Spec-only until **challenge binding, recovery, revocation and credential
provenance** are each explicit. That is not caution for its own sake: A is the
one unit where a shortcut re-creates the exact defect its predecessor removed,
and the shortcut is a single line of SQL.

### 6.1 First implementation task is a census, not a migration

When the gate lifts, the first task is **not** schema work. It is establishing
what already exists:

1. What does `webauthn_credentials` actually store — columns, constraints,
   indexes, and how many live rows across how many members?
2. How do registration and authentication read and write it today
   (`lib/auth/webauthnServer.ts`, the four `webauthn/*` routes)?
3. By what paths can `members.has_webauthn` diverge from it? Enumerate the
   writers of each independently, then find members where the flag and the store
   disagree — in production, by count.
4. What revocation semantics exist today? Is a credential deleted, or flagged?
   Does anything clear the member flag when the last credential goes?

Only after those four are answered does A decide whether any schema change
exists at all. A census that finds `webauthn_credentials` adequate is a
successful outcome, not a wasted step.

This rule exists because the alternative is well-trodden: a diagram names a
table, the table gets created, and the system now has two stores where it had
one. That is how AUTH-BIOMETRIC-01 came to exist in the first place.

## 7. Recorded alongside, not folded in

**AUTH-BIOMETRY-01** (`AUTH_BOUNDARY_PARKED_FINDINGS.md`) — `deviceId` entropy
and replay on the native store. Invariant 3 makes a fresh native verification
the authorization for minting a web credential, so native trust stops being one
surface's concern and becomes load-bearing for both.

Precisely scoped: it blocks **the point where native biometric proof becomes
authority to mint a cross-surface bootstrap authorization**. It does not block
continuing to specify A. Challenge binding, replay defence, revocation semantics
and provenance can all be designed while that finding is open; implementation
must not cross the native-trust boundary until it is resolved. It remains its
own finding and is not absorbed here.
