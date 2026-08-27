# AUTH-BOUNDARY — parked findings

Findings that AUTH-BOUNDARY-01A/01B/02/03 **surfaced and deliberately did not
repair**. Each is a real defect with a named owner unit. They are recorded here
rather than in unit notes because a finding that lives only in a commit message
is a finding on its way to being forgotten.

Status of the completed work, for context:

```
AUTH-BOUNDARY-01A   header authority closure      PASS   02b22e3fc
AUTH-BOUNDARY-01B   signed access context         PASS   7380443c8
AUTH-BOUNDARY-02    route impersonation closure   PASS   023de49e8
AUTH-BOUNDARY-03    integrated adversarial E2E    PASS   92e127a2b
```

---

## Doctrine established by that work

> **Application security must remain correct with Caddy containment absent.**
> Edge containment reduces exposure; it never substitutes for authenticated
> caller provenance or resource authorization.

The matrix this commits us to:

```
Caddy OFF + app hardened   → safe
Caddy ON  + app hardened   → safe, and contained earlier
```

Never:

```
Caddy ON  → safe
Caddy OFF → compromised
```

This was not theoretical. The edge containment stopped being enforced at
2026-08-25T18:38:38Z and nobody noticed for a day; the application had to be
correct without it, and at that moment it was not.

---

## AUTH-MATRIX-01 — the tier bypass short-circuits the role gate

**Severity: the reason middleware cannot be described as a reliable
authorization layer.**

`config/accessMatrix.ts` has 23 rules pairing `minTier` with `rolesAnyOf` —
`/admin`, `/founder`, `/api/founder`, `/steward`, `/labtools/admin`,
`/caseload`, `/supervision`, `/partners/`, `/api/practitioner/*`,
`/api/stellium`, `/api/notifications`, the commons review queue.

`checkAccess()` reports an insufficient tier **before** it evaluates roles.
`middleware.ts` then handles that reason with an explicit development bypass:

```ts
case 'insufficient-tier':
  // tier gates disabled during development
  return NextResponse.next();
```

So for any rule pairing `minTier` with `rolesAnyOf`, a caller whose tier is
insufficient is **waved through, and the role check never runs at all**. The
`missing-role` 403 is unreachable on those rules.

Discovered in AUTH-BOUNDARY-03 case 16, where a request expected to be denied
403 by middleware was instead denied 401 by the route. The code was right and
the expectation was wrong — which is the only reason it was noticed.

**Consequence to hold onto:** middleware is not the enforcer for those routes in
either compatibility-window state. Route-level identity and ownership carry the
invariant. That is why AUTH-BOUNDARY-02 was necessary and why edge containment
must not be treated as the fix.

**Not repaired here** because re-enabling tier gating is a product decision with
member-visible consequences, not a security patch.

---

## AUTH-BIOMETRY-01 — device binding strength and replay

`app/api/auth/native-biometry/verify/route.ts` is **pre-session
authentication**: no session exists yet, so `x-member-id` is necessarily a
claim. The proof is the trusted-device binding:

```sql
SELECT ... FROM trusted_devices WHERE id = $1 AND member_id = $2
```

AUTH-BOUNDARY-02 classified this as already-guarded and left it alone: the
header is not the authority, possession of a registered `deviceId` is.

**The unverified dependency:** that posture holds only if `deviceId` is
unguessable and not replayable. Neither was measured. If device ids are
sequential, enumerable, or long-lived without rotation, the binding is weaker
than it looks.

**Needs:** entropy audit of `deviceId` generation, replay-window analysis,
rotation/expiry review.

---

## AUTH-IDOR-01 — `check-prompt` prompt ownership

`app/api/pricing/check-prompt/route.ts` POST:

```ts
if (body.promptId && body.response) {
  await recordPromptResponse(body.promptId, body.response);
  return NextResponse.json({ success: true });
}
```

`promptId` is never bound to the caller. AUTH-BOUNDARY-02 repaired the caller
resolution on this route, so an attacker now needs a genuine session — but with
one, they can still write a response onto another member's prompt.

This is **authorization, not provenance**, which is why 02 did not absorb it:
the unit repaired who the caller is, not what they may touch.

**Needs:** ownership predicate on `recordPromptResponse`, plus a hostile test
(member A writing to member B's promptId must fail).

---

## Standing limits carried forward, not defects

- **Signed-context revocation.** A context signed before a role is removed stays
  cryptographically valid until `exp` (12h). Handlers that must not honour a
  stale role re-derive from the database. A dial, not a bug — shortening the TTL
  trades staleness for signing frequency.
- **Compatibility window.** Until `AUTH_CONTEXT_COMPAT_UNTIL`
  (default 2026-09-26T00:00:00Z), forged role cookies still satisfy middleware
  role gates. The migration's stated cost. `AUTH_CONTEXT_SECRET` (≥32 chars)
  must exist in the production environment before that date, or every session
  lands on the compat path and then loses elevated roles.
- **`portal/[slug]/auth` dev bypass.** Returns a mock practitioner when
  `NODE_ENV === 'development'`.
