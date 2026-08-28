# AUTH-BIOMETRIC-01A · Cross-Surface Credential Bootstrap Architecture

**Status:** SPEC ONLY — no implementation authorized
**Opened:** 2026-08-27, on the ruling that split AUTH-BIOMETRIC-01 into B and A (this)
**Predecessor:** `AUTH_BIOMETRIC_01.md` §5 fork, branch A. B merged to canonical at
`df4029aec` (PR #1131); not deployed, not verified in production.
**§6.1 census:** COMPLETE — see §6.2. Finding: **REPAIR**, no schema change indicated.

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

**Do not create `member_web_credentials`.** The §6.1 census (§6.2 below) settled
this on evidence: `webauthn_credentials` already carries every field the sketch
named, with no observed production drift. Standing up a second store to match a
diagram would reproduce the architectural split A exists to remove — a third
credential store is the defect's own shape, not its repair.

What remains true from the sketch is the *derivation*, not the table: capability
must be derived from credential authority rather than stored beside it.

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

### 6.2 Census result — 2026-08-28

Read-only. No writes, no migration, no flag correction. Frozen as adjudicated:

```
Q1 store schema        ADEQUATE
                       required fields present
                       no observed production schema drift

Q2 authority           webauthn_credentials
                       genuine RP/origin/counter-bound credential authority

Q3 divergence          8 real member accounts
                       has_webauthn = true / zero current credentials
                       state not attributable to any writer in current tree

Q4 revocation          soft credential-level lifecycle
                       no native member-flag coupling

finding                REPAIR
                       derive capability from credential authority
                       repair lifecycle coupling
                       no schema change presently indicated

population             8 confirmed member accounts
                       email identity + browser use observed

dependency             AUTH-AUDIT-01 (see §7)

history discriminator  preferred_auth_method = 'webauthn'
                       positive = strong historical credential evidence
                       negative = non-conclusive
                       MEASURED: all 8 are 'password' → narrowing, not adjudication
```

**Q1.** Production `\d webauthn_credentials` matches the migration exactly —
thirteen columns, two partial indexes on `revoked = FALSE`, the UNIQUE
constraint on `credential_id`, and `member_id → members(id) ON DELETE CASCADE`.
No unique constraint on `member_id`, so multiple credentials per member are
already first-class: **Invariant 7 is satisfied by the existing schema.**

**Q2.** Every reference to the table in the repository is inside
`lib/auth/webauthnServer.ts` — seven statements, no other reader or writer.
`verifyAuthenticationResponse` receives `expectedOrigin`, `expectedRPID`, the
stored `publicKey` and the stored `counter`, so origin binding and replay
checking are real.

**Invariant 6 holds for the existing WebAuthn ceremony**: RP/origin binding and
stored-counter verification are present. **This does not establish Invariant 4
for A's future bootstrap authorization.** Invariant 4 governs the *cross-surface
bootstrap challenge* — a mechanism that does not exist yet — not ordinary
WebAuthn verification. It remains gated until that challenge is explicitly
short-lived, single-use, member-bound, and registration-intent-bound. A census
can establish properties of a ceremony that runs today; it cannot establish
properties of one that has not been built.
One exception matters — `webauthn/authenticate/options/route.ts:41` gates on
`members.has_webauthn`, not on the store. That is where the stored-versus-derived
distinction has operational consequence today.

**Q3.** Two flag writers, both in `webauthnServer.ts`: `SET TRUE` after a
successful INSERT, `SET FALSE` on revoking the last active credential. **No
transactions anywhere in the module.** Measured divergence:

```
has_active_credential | flag_true | members
f                     | f         |      77   correct
f                     | t         |       8   DIVERGENT
t                     | t         |       3   correct
t                     | f         |   absent = 0   (OBSERVED EMPTY)
```

Divergence is one-way. All eight have **zero credential rows of any kind**, not
merely zero active ones — so neither known writer explains them: `SET TRUE` runs
only after an INSERT, and `SET FALSE` never sets true. A search across all file
types found no other writer, and the only other occurrence of the column in the
repository is the migration adding it with `DEFAULT FALSE`.

Stated at the strength the evidence supports: **no writer in the current tree
accounts for these states.** That leaves open an older deployed revision, a
retired migration or script, manual SQL, an import, or an administrative action.

**Q4.** Soft revocation, credential-level: `revoked = TRUE` + `revoked_at`, never
a hard delete. Both read paths filter `revoked = FALSE`, so a revoked credential
fails authentication as `CREDENTIAL_NOT_FOUND`. Revoking a web credential does
not touch `trusted_devices`: **Invariant 9 already holds in that direction.**
Minor: `revokeCredential`'s UPDATE omits `AND revoked = FALSE`, so re-revoking
reports success and rewrites `revoked_at`.

### 6.3 What the census changes about A

Only 3 members in the system hold a working web passkey; 8 are told they do.

B repaired the capability-versus-enrollment conflation and is correct in
structure, but **B reads the flag** — so for those eight its input is wrong and
it offers them the button anyway. There were two conflations stacked:

```
capability  vs  enrollment   ← B repaired this
flag        vs  credential   ← A must repair this
```

That is why `has_webauthn` becoming derived is not a tidiness preference. It is
the second half of the same defect.

## 7. Dependencies — recorded alongside, not folded in

**AUTH-AUDIT-01** — discovered during the §6.1 census, and not merely "better
logging." `audit_logs` does not exist in current production, and no repository
migration creates the base table; `20260114000004_add_audit_metadata.sql` is
written to skip gracefully when it is absent, and did. `logAuthEvent` catches the
resulting error and continues, which keeps authentication resilient and made the
absence structurally quiet. Ten modules call it believing they create durable
attribution records.

Stated at the strength the evidence supports: the table is absent *now* and no
migration in the repository creates it. Whether it ever existed would require
production DDL history, which was not read.

**Invariant 10 is therefore presently unprovable and, as implemented,
unsatisfiable.** If registration, naming, use and revocation must be
attributable, durable audit is part of the security invariant itself — not an
observability nicety layered on afterwards. Repairing the flag derivation alone
would not repair this, and A cannot claim Invariant 10 until it is addressed.

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
