# AUTH-BIOMETRIC-01 — unify biometric enrollment semantics across web and native

**Status:** OPEN — census complete, convergence not authorized
**Opened:** 2026-08-27
**Class:** cross-surface identity inconsistency (not a UI defect)
**Scope discipline:** auth and identity only. No migration, no deletion, no store
convergence until §5 is ruled on.

---

## 0. Why this is not cosmetic

A member enrolls what the OS calls "Face ID" inside the iOS app. Later they open
the website, see a button that says "Sign in with Face ID or Touch ID", press it,
and it fails. Nothing in the product tells them these are different credentials,
because from where they stand they are not different — the same finger, the same
face, the same phrase on both buttons.

The platform treats them as unrelated. That gap produces *false lockout reports*:
a member with valid credentials, correctly enrolled, reasonably concluding the
system has forgotten them. The cost is not a failed click. It is the member's
belief that their account is unreliable.

## 1. Discovery

Found 2026-08-27 while diagnosing a beta tester locked out of `/signin`. Her
record read:

```
has_webauthn      false        ← web store: empty
trusted_devices   3 rows       ← native store: populated
```

Three enrolled devices and a sign-in button that could not succeed. She had
attributed months of trouble to her own forgotten passwords.

## 2. Census — two stores, disjoint

| | Web / WebAuthn | Native biometry |
|---|---|---|
| Credential store | `webauthn_credentials` | `trusted_devices.biometry_enabled` |
| Member flag written | `members.has_webauthn = TRUE` | `members.preferred_auth_method = 'biometry'` |
| Enrollment route | `/api/auth/webauthn/register/{options,verify}` | `/api/auth/native-biometry/enable` |
| Verification route | `/api/auth/webauthn/authenticate/{options,verify}` | `/api/auth/native-biometry/verify` |
| Server module | `lib/auth/webauthnServer.ts` | route-local |
| Client entry | `lib/auth/biometricAuth.ts` → `SignInCard.tsx:70` | Capacitor / iOS app |

Neither store reads the other. `native-biometry/enable` writes
`preferred_auth_method` and `trusted_devices.biometry_enabled`; it never touches
`has_webauthn`. `webauthn/authenticate/options` gates on
`has_webauthn = TRUE` (`route.ts:41`). Native enrollment is therefore invisible
to every web code path that asks "is this member enrolled?".

## 3. The mechanism, precisely

`SignInCard.tsx:38` decides whether to render the biometric button from
`biometricAuth.getAvailability()`. That call answers **can this device do
biometrics** — a platform-authenticator capability probe. It does not answer
**does this member have a credential**.

> **Capability is being used as a proxy for enrollment.** They are independent
> facts, and the button is rendered on the wrong one.

Any Touch ID Mac or Face ID iPhone renders the button for any member, enrolled
or not. The failure is then opaque: with no `memberId` resolved,
`authenticate/options` falls back to discoverable credentials, the OS prompts,
finds no passkey for this relying party, and the ceremony dies without ever
naming the real cause.

## 4. Secondary finding, same file

`app/api/auth/webauthn/authenticate/verify/route.ts:145`

```ts
hasWebauthn: member.has_webauthn || true,
```

`|| true` is unconditional — the response reports `hasWebauthn: true` for every
caller regardless of the column. The sibling native route (`verify/route.ts:129`)
correctly uses `|| false`. Any client branching on this field is branching on a
constant. Small, isolated, and independently fixable; recorded here rather than
patched so the unit stays one reviewable decision.

## 5. The fork — needs a ruling before any code moves

Both branches are legitimate. They differ in what we tell the member is true.

**A · Native biometry bootstraps WebAuthn.** One credential concept, two
transports. Enrolling in the app registers a WebAuthn credential the web can
verify. Honest to the member's mental model, and the strongest end state.
Requires the native enrollment to produce a real attestation the server can
verify — not a flag flip. **A flag flip would make `has_webauthn` a claim
without a credential behind it, which is the same defect wearing the opposite
sign.**

**B · The UI distinguishes them honestly.** Two credentials, named as two. The
web button renders only on *enrollment*, not capability, and a natively-enrolled
member sees an accurate account of what works where. Smaller, fully reversible,
no new trust surface. Does not remove the underlying split — it stops the split
from lying.

B is the smaller correct step and does not foreclose A. A is the destination.
My recommendation is B now, A specified separately, because B can be proven with
existing data and A cannot ship without an attestation design.

## 6. Goals (as scoped)

1. Census both stores and both enrollment flows. **[done — §2]**
2. Identify the canonical credential source. **[open — §5]**
3. Decide: native bootstraps WebAuthn, or the UI distinguishes honestly. **[open — §5]**
4. Stop the web button offering a path that cannot succeed for a natively
   enrolled member. **[blocked on 3]**
5. Preserve every working credential. **[binding constraint]**
6. No migration, no deletion, until the convergence plan is explicit. **[binding constraint]**

## 7. Acceptance — falsification required

No claim here is accepted on a passing test alone. Each must go red against the
current code first:

- A member with `trusted_devices.biometry_enabled = TRUE` and
  `has_webauthn = FALSE` is not offered a web path that cannot succeed.
  *Falsify:* the same case against today's `SignInCard` renders the button.
- A member with a real WebAuthn credential still signs in by that credential,
  unchanged. *Falsify:* must fail if the gate is written to read the wrong store.
- Availability and enrollment are asserted separately and never conflated.
- No member's `has_webauthn` is set TRUE without a verifiable credential behind it.
- Population claim: the fix is proven across **both** stores, not on the web
  store alone. A repair verified only where `has_webauthn = TRUE` has verified
  the case that was never broken.

## 8. Out of scope — deliberately

- `relationship_essence` / `relationship_essences` duplicate-table smell.
  Recorded separately (`docs/ops/SCHEMA_DUPLICATE_SMELLS.md`). Different class
  of defect; it does not enter this unit.
- The Resend delivery outage. Concurrent, unrelated, account-side.
- AUTH-BIOMETRY-01 (`deviceId` entropy / replay, in
  `AUTH_BOUNDARY_PARKED_FINDINGS.md`) stays parked. It concerns whether the
  native store's binding is *strong*; this unit concerns whether the two stores
  are *coherent*. Related surface, different question — do not merge them.

## 9. Blast radius

Every member who enrolled biometrics in the iOS app and has since opened the
website. Unmeasured. Bounding it is read-only and should precede the ruling:

```sql
SELECT count(DISTINCT td.member_id) AS natively_enrolled_only
FROM trusted_devices td
JOIN members m ON m.id = td.member_id
WHERE td.biometry_enabled = TRUE AND m.has_webauthn = FALSE;
```

If that number is large, B is urgent rather than merely correct.
