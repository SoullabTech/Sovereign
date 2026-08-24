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

---

## Live evidence — 2026-08-24 (recorded after the ruling)

The refusal was witnessed in production and is **confirmed quota**, not a hypothesis inferred from
a code comment:

```
[EMAIL-CODE] Provider REFUSED the send for kelly@soullab.life —
  status=error providerCode=monthly_quota_exceeded
  error=You have reached your monthly email sending quota.
```

**Blast radius is the whole `sendEmail` surface**, not sign-in alone: email codes, magic links,
password recovery, reset-password, verification, and invitations all refuse until the Resend account
is topped up. Operator action; no deploy fixes it.

This is what makes the ruling above load-bearing rather than stylistic. With the provider refusing,
**there is no email-based route back into any account** — recovery is down alongside entry. A front
door that treats email as transport has, in this state, no door at all.

The canonical account's credentials at the time of the incident:

```
username Kelly · has_webauthn = t · preferred_auth_method = password · must_reset_password = f
```

### Corrected once the credential count came back

`has_webauthn = t` — **with `SELECT count(*) FROM webauthn_credentials = 0`.** The flag is true and
there is no credential behind it. The passkey path was NOT open; only the password path was.

**This is a second defect, and it compounds the first.** A member with `has_webauthn = true` and zero
credentials is shown "Continue with Face ID or Touch ID" — a button that cannot succeed. During this
outage the founder was therefore offered two apparently-live paths, email code and passkey, and
**both were dead ends.** The only working door was "Use a password instead", the least prominent
element on the screen.

So the ruling's scope is wider than transport-vs-identity: **the front door must not advertise a
credential the account cannot actually present.** Any credential-choice state built under this ruling
must derive its options from real credential availability — while still returning identical options
to an unauthenticated caller regardless of whether the email exists (constraint 3). Those two
requirements are in tension, and resolving that tension is part of the work, not a detail: the honest
answer is likely to gate on availability only *after* an authentication attempt, never before.

### Deployment state at the time of the incident

`docker exec maia-sovereign printenv GIT_COMMIT` → **`e56e502ff`** (PR #1073). #1074 was merged at
`73106dc90` and **was not live**. The `hello@soullab.life` in the member-facing error is confirmed
runtime evidence of the gap, not a message-copy discrepancy. Merged is not deployed.

**Closed 2026-08-24.** `73106dc90` deployed via `pre-deploy-gate.sh deploy-maia`, with the
fail-closed post-swap check confirming it:
`Running container provenance verified: GIT_COMMIT=73106dc90 == asserted 73106dc90`.
Co-Lab boundaries 33 passed · 0 failed · 0 warned. Rollback tags refreshed.

Two attempts were needed. The first ran in the foreground over ssh and died when the terminal was
interrupted — the remote process tree outlived the client briefly, then died on its broken stdout
pipe. The deploy-lane flock behaved exactly as designed throughout: it refused the second attempt
while the first still held the lock (`Holder pid 475350 is ALIVE`), and released cleanly when that
tree died, leaving the running container untouched at `e56e502ff` the whole time. **Operational
note:** this build takes ~5 minutes; run it detached
(`setsid nohup … </dev/null >/tmp/deploy.log 2>&1 &`) and tail the log, so an interrupted terminal
cannot kill it.
