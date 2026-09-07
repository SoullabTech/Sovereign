# Mail Abuse Incident — Triage 2026-09-07

Founder report: ~$200 of unauthorised Resend sends consumed without detection.

**This note is triage, not a closed finding.** No production evidence has been
read. Everything below is code-shape reasoning; §4 names the queries that would
turn it into evidence.

## 1. The load-bearing conclusion

**Self-hosting the transport does not fix this, and doing it first makes it worse.**

The bill was the *detector*, not the *defect*. If the vector is an open send
endpoint (§2), moving to our own MTA removes the bill and keeps the abuse — the
theft becomes free and therefore silent. The cost lands instead on domain and IP
reputation, which is where P0 identity mail lives. Trading a $200 invoice for
`soullab.life` being unable to deliver sign-in codes is a sovereignty loss, not a
sovereignty gain.

Order is: **contain → meter → then choose transport.**

## 2. Candidate vectors (code-shape, unconfirmed)

Key leakage was checked and found clean: no `re_` secret in tracked env files or
in git history for env paths, no `NEXT_PUBLIC_*` exposure of `RESEND_API_KEY`.

Two unauthenticated routes call `sendEmail` with no rate limit and no captcha.
Compare `app/api/members/email-code/route.ts` and `magic-link/route.ts`, which
both gate on `checkRateLimit(clientIP, 'ip', ENDPOINT)`.

### V1 — `app/api/members/send-verification/route.ts` (most serious)

Accepts `{ memberId, email }`. Unauthenticated. It writes the caller-supplied
address onto the member row and then sends to it:

- arbitrary destination — the `to` is attacker-chosen, which is what makes
  volume theft *useful* rather than merely annoying
- account takeover primitive — it rewrites `members.email` for a supplied
  `memberId` with no proof of ownership
- lands in P0 by family fallback (`auth:email-verification` is unregistered in
  `EMAIL_PURPOSE_LANES`; the registered name is `auth:verification`), so it
  would be the *last* traffic shed by any future lane guard

`memberId` is a UUID and not guessable, but an attacker needs only one — their
own registration supplies it. That is a working open relay.

### V2 — `app/api/members/recover/route.ts`

Unauthenticated, unmetered, `{ email }` → send. Destination is constrained to
addresses already in `members`, so it is a mail-bomb against known members rather
than a general relay. Separately: it emails the **plaintext passkey**, so
uncapped invocation is also a credential-exposure amplifier.

## 3. Why nobody noticed

`sendEmail` classifies failures well (MAIL-01) and records attempts (MAIL-02),
but it **meters nothing**. `lib/email/purpose.ts` names `lib/email/guards.ts` as
the home for lane guards; that file does not exist. Volume guards today are
per-caller constants (`MAX_MENTION_FANOUT`, `MAX_INVITES_PER_BATCH`) in a handful
of senders, not a property of the transport. No budget, no anomaly alert, no
per-lane ceiling. The first signal available was the invoice.

Note the ledger's own rule is not in tension with this: the ledger *observes* and
must never authorize. A guard is a separate mechanism above the ledger, reading
its own counters — it must not become a ledger read in the send path.

## 4. Turning this into evidence

Requires production DB access; not run from this session.

```sql
-- Volume by purpose/lane over the incident window
SELECT date_trunc('day', created_at) d, purpose, lane, state, count(*)
  FROM email_delivery_attempts
 WHERE created_at > NOW() - INTERVAL '45 days'
 GROUP BY 1,2,3,4 ORDER BY 5 DESC LIMIT 50;

-- Fan-out to non-member destinations (the V1 signature)
SELECT recipient_domain, count(*)
  FROM email_delivery_attempts
 WHERE purpose LIKE 'auth:%' AND member_ref IS NULL
 GROUP BY 1 ORDER BY 2 DESC LIMIT 30;

-- Repeats (idempotency_key is recorded but never suppressed)
SELECT idempotency_key, count(*) c FROM email_delivery_attempts
 WHERE idempotency_key IS NOT NULL GROUP BY 1 HAVING count(*) > 5
 ORDER BY c DESC LIMIT 30;
```

Caveat: the ledger landed 2026-08-25 and prunes recipient-level rows at 90 days.
Abuse before that date survives only in `email_delivery_monthly` aggregates, and
Resend's own dashboard may be the only record of the earliest traffic.

## 5. What "in-house" can and cannot mean

The policy layer is **already sovereign** and is the genuinely hard part:
purpose/lane vocabulary, honest failure classification, the provider boundary,
the delivery ledger, the no-vendor-import CI guard. Vendors are already reduced
to `EmailProvider` — 63 lines of interface.

What Resend actually supplies is **IP reputation and deliverability
relationships**. That is a physical and social asset accumulated over time, not
software. It cannot be written; it can only be built or rented.

Self-hosting an MTA on minisforum is not viable for P0: consumer ISPs block
outbound :25, and a residential IP delivering auth mail to Gmail/Outlook lands in
spam or nowhere. Sign-in would break.

The architecture our own lane model already implies is a **split by lane**:

| Lane | Traffic | Transport posture |
|------|---------|-------------------|
| P0 identity | sign-in, recovery | highest-reputation path, tiny volume, isolated credential |
| P1 access | invitations | same or adjacent |
| P2/P3 bulk | notifications, broadcast | own MTA — where reputation damage is survivable |

This is the sovereignty win that is actually available: own the policy layer and
the MTA, rent only the last mile for P0, and make sure a compromised bulk lane
can never consume identity capacity. `EMAIL_PURPOSE_LANES` was built for exactly
this and is currently unused by any enforcement.

## 6. Recommended sequence

1. **Contain** — auth + rate limit on V1/V2; stop `send-verification` accepting
   an arbitrary destination; separate email-change from verification-send.
2. **Meter** — write the missing `lib/email/guards.ts`: per-lane ceilings, P0
   reserved, anomaly alert on `security:alert`. Fail *open* for P0 (a guard that
   locks members out is worse than the abuse it prevents).
3. **Rotate** — new Resend key, old one revoked, and confirm the key is not
   present in any image layer or CI log.
4. **Then** choose transport, from evidence rather than from the incident.

Steps 1–3 are required regardless of what transport we end up on.
