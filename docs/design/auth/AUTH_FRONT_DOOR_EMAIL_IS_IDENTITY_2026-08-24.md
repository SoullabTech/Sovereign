# AUTH FRONT DOOR — EMAIL IS IDENTITY, NOT TRANSPORT

**Status: RULED, NOT IMPLEMENTED.** Founder ruling 2026-08-24. Deliberately *not* bundled with the
2026-08-24 email delivery incident — that is a provider/deploy problem; this is a design problem.
Sequencing: deploy #1074 first so the live system tells the truth about send failures, *then* take
this up as a contained auth UX correction.

## The defect

`UnifiedAuth` equates entering an email address with requesting an emailed one-time code. `Continue`
calls `/api/members/email-code` directly, so typing an identity selects a transport. When the mail
provider refuses — as it did on 2026-08-24 — the front door becomes a wall for a member who holds
other valid credentials.

## Invariant

> Entering an email **identifies the account context**. It does not select an authentication
> transport.

## Required shape

```text
ENTER EMAIL
     ↓
IDENTIFY SIGN-IN CONTEXT
     ↓
choose / continue with credential
     ├── password
     ├── Face ID / Touch ID / passkey
     ├── email code
     ├── Google
     └── Apple
```

## Constraints

1. Email `Continue` MUST NOT call `/api/members/email-code`.
2. Carry the entered email into a credential-choice / continuation state.
3. **Enumeration-safe:** the observable UI must not tell an unauthenticated caller whether the email
   exists, which auth methods are configured, its roles, or its member id. Present the same choices
   regardless. The server validates credentials; it never confirms account existence to an anonymous
   browser.
4. Choices may include password · passkey · email code · Google · Apple.
5. Email code becomes an **explicit choice**, never the unavoidable consequence of entering an email.
6. Do not alter account identities, member rows, Soul Portrait ownership, roles, or session records.
7. Do not undo #1074's enumeration protections.
8. **Investigate first:** `app/api/members/signin/route.ts` authenticates by
   `WHERE LOWER(username) = LOWER($1)` — **username only.** Decide deliberately whether that endpoint
   should accept an email identifier. Do NOT invent a client-side email→username lookup: that is an
   enumeration oracle.
9. Add negative proof that submitting an email alone does not invoke the email provider.
10. STOP before deploy and report the exact UX/state transition.

## Evidence this is not theoretical

On 2026-08-24 the founder — holding the canonical account `ce284751` (kelly@soullab.life), which
carries a password, 11 trusted devices, a practitioner record, and 16 Soul Portraits — could not sign
in, because Resend refused the send and the UI offered no other path from that state. The working
route was to abandon the entered email and use the username `Kelly` on the password form. A member
should never have to discover that.
