# AUTH FRONT DOOR — EMAIL IS IDENTITY, NOT TRANSPORT

> ## AUTH EMAIL INCIDENT — status (founder ruling, 2026-08-24)
>
> ```text
> negative witness        COMPLETE
> truthful refusal        PROVEN LIVE
> quota classification    PROVEN LIVE
> enumeration safety      PROVEN LIVE
> PII-safe logging slice  PROVEN
> observed broader impact NOT ESTABLISHED
>
> Resend capacity         EXHAUSTED
> positive witness        ONLY REMAINING PROOF
> ```
>
> **KNOWN** — Resend transport was unavailable to all recipients · #1074 handled a real quota
> refusal truthfully · recorded email-code attempts in the observed window were the founder's ·
> enumeration parity held for member vs non-member addresses.
>
> **NOT KNOWN** — whether anyone else attempted authentication during the outage · rate-limited
> attempts may leave no token-table trace.
>
> Classified as an **infrastructure outage, not a demonstrated user-impact incident.**
>
> **To close:** restore Resend capacity, then one controlled request requiring the whole chain —
> provider acceptance → real message ID → visible provider send → inbox receipt → code authenticates
> successfully. If all five hold, the Resend incident closes. **No further architecture or auth work
> is to be pulled into it.**
>
> **Frozen, and not part of this incident:** portrait movement · account consolidation · session
> cleanup · passkey repair.

---

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

---

## Negative witness — PASSED, both halves (2026-08-24, post-deploy)

Captured deliberately **while the quota was still exhausted**, since that window closes on top-up.

**Member-facing**, verbatim from the live UI:

> We can't send codes right now. That's a problem on our side, not yours, and retrying won't help.
> Please contact support@soullab.life and we'll get you in.

**Server-side**:

```
[EMAIL-CODE] Provider REFUSED the send for member=88099bb1977c — status=error
failureKind=quota_exceeded providerCode=monthly_quota_exceeded retryable=false
error=You have reached your monthly email sending quota.
```

#1074 delivered three observable changes, not one. Against the pre-deploy line:

| | before (`e56e502ff`) | after (`73106dc90`) |
|---|---|---|
| member-facing mailbox | `hello@soullab.life` | `support@soullab.life` |
| log identity | `kelly@soullab.life` | `member=88099bb1977c` |
| classification | — | `failureKind=quota_exceeded` |
| retry guidance | — | `retryable=false` |

The member's email address is **out of the refusal logs** (`e12377d98`), now proven live rather than
merely merged; and the refusal is classified rather than flattened to prose (`5ce84d10f`).

Chain proven end to end: **provider refuses → server recognizes and classifies → application
manufactures no success → member sees the truth, and a mailbox that exists.**

### Still blocked

`retryable=false` is accurate: no further attempt can succeed until sending capacity is restored on
the provider account. That is an account-side action, not a code or deploy action. Every email path
— codes, magic links, recovery, reset, verification, invitations — stays down until then.

### Positive witness — pending

After capacity is restored, one request, then: a `Code sent` marker carrying a **real, non-empty
provider message id** and no `quota_exceeded`; the send visible in the Resend dashboard; the email
arriving; the code completing sign-in. `id: none` is a soft failure, not a pass — an accepted send
with no message id is precisely the manufactured success this witness exists to rule out.

*(Note for whoever runs it: the success log line's wording was read from the pre-deploy source and
may have been reworded the same way the refusal line was. Match on the `Code sent` marker and a
non-empty id, not on an exact string.)*

---

## Observed impact — and a claim withdrawn

Two refusals logged `member=anonymous`, and they were read here as new arrivals being turned away.
**That reading was wrong and is withdrawn.** `magic_link_tokens` settles it — every recorded attempt
in the window was the founder's own:

```
witness-quota@soullab.life  21:03:35   curl probe
witness-quota@soullab.life  21:03:27   curl probe
kelly@soullab.life          20:58:36   browser negative witness
kelly@soullab.life          20:01:41   pre-deploy attempt
```

`memberRef()` returns `anonymous` for any address without an account, which is why the probe address
logged that way. The inference was mechanically sound and factually false.

The precise claim, stated at the width the evidence supports:

```text
PROVIDER CONDITION     Resend quota exhausted → systemic outage for ALL recipients
OBSERVED IMPACT        every recorded email-code attempt was the founder's
OTHER USERS BLOCKED    unsupported — withdrawn
```

Absence of recorded attempts is **not** proof nobody else was affected. The transport was genuinely
down for everyone, so anyone who tried would have failed. And the record is incomplete at its front
edge: a code row is written *before* the send, so a refused send leaves a row — but a request
rejected earlier (rate limiter, validation) returns before any row exists and leaves no trace beyond
transient container logs. So: no evidence another person met the outage, which is weaker than
"nobody did", and the distinction is the point.

**Consequence for triage:** this is an infrastructure repair, not an active user emergency. Restore
capacity because authentication email is objectively unavailable — not because of imagined users
waiting.

## Additional production evidence from the curl probe

An unauthenticated `POST /api/members/email-code` for a **nonexistent** address returned:

```
HTTP 502
{"error":"We can't send codes right now. …contact support@soullab.life…",
 "reason":"email_provider_refused","retryable":false}
```

Four things confirmed live, beyond the original witness:

- **`TRANSPORT_DOWN` escalation.** A second, operator-facing line fires alongside the per-request
  refusal: `[MAIA/email] TRANSPORT_DOWN kind=quota_exceeded providerCode=monthly_quota_exceeded
  purpose=auth:email-code — email delivery is failing for ALL recipients. Check the provider
  account.` It names the systemic condition and the remedy, distinctly from the individual failure.
- **Enumeration safety holds under failure.** The response for an address with no account is
  byte-identical to one with an account — same status, message, `reason`, `retryable`. Nothing leaks
  registration status, which is exactly what #1074 set out to protect and is the constraint any
  front-door redesign must preserve (constraint 3 above).
- **Failed credentials are invalidated, not left live.** `used = true` on the refused row: a code
  nobody received never remains a usable outstanding credential.
- **No manufactured success.** No `Code sent` line, no 200, no "check your inbox" — under a real
  provider failure, from an unauthenticated caller.

