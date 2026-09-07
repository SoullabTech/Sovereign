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

## 6. Roadmap (founder ruling, 2026-09-07)

The subsystem is named **Soullab Mail**. Six layers, and **transport comes last**:

| Layer | Function | State |
|-------|----------|-------|
| 1 Admission | is this caller allowed to cause this email? | MAIL-04 |
| 2 Guard | IP/member/address/purpose limits, anomaly detection | MAIL-05 |
| 3 Scheduler | independent P0/P1/P2/P3 queues | MAIL-06 |
| 4 Ledger | requested / accepted / refused / bounced | built (MAIL-02) |
| 5 Transport | Resend now, Soullab SMTP later | MAIL-09/10 |
| 6 Reputation | DKIM/SPF/DMARC, bounces, complaints | MAIL-09 |

```
MAIL-03  CONTAINMENT       close arbitrary-destination verification;
                           protect recovery; rotate provider credentials
MAIL-04  ADMISSION         every email-causing route has an authority rule
MAIL-05  GUARDS            guards.ts — per IP/member/recipient/purpose/lane,
                           global anomaly ceiling
MAIL-06  QUEUES            physical P0-P3 separation, P0 reserve
MAIL-07  ABUSE INTELLIGENCE baselines, anomaly events, alerting, breakers
MAIL-08  SUPPRESSION       bounces, complaints, lane-aware idempotency
MAIL-09A POSTAL LABORATORY self-host Postal, dedicated clean IP,
                           PostalProvider adapter, DNS + DKIM/SPF/DMARC
MAIL-09B P3 MIGRATION      broadcast / newsletter
MAIL-09C P2 MIGRATION      notifications / transactional
MAIL-09D P1 MIGRATION      invitations / access
MAIL-09E P0 QUALIFICATION  auth delivery measured against Gmail/Apple/Outlook
MAIL-10  RESEND REMOVAL    keys destroyed, ResendProvider removed
```

The lane order is the point: new infrastructure proves itself on expendable
mail before member authentication is entrusted to it.

### Transport decision (founder, 2026-09-07)

Keep Soullab Mail as the control plane. Adopt **Postal** as the delivery engine.

There is no self-hostable Resend distribution — Resend open-sources SDKs and
tooling, not the delivery platform. Of the Resend-shaped alternatives, Plunk and
Unsend still require AWS SES underneath, so they replace the interface without
removing the external dependency; Selfsend is explicitly incomplete. Postal is an
actual MTA (SMTP, IP pools, DKIM, SPF, return paths, suppression, retries,
delivery telemetry), actively maintained, and forkable.

Adopting a Resend clone would duplicate the control plane we already own.
Postal supplies layers 5-6 and nothing above them, which is exactly the seam
`EmailProvider` was drawn at: `PostalProvider.ts` plus one line in
`providers/index.ts`, and `EMAIL_PROVIDER=postal`. The rest of MAIA is unaffected.

Reputation is the hard part and cannot be downloaded — hence 09B→09E.

### Three seams to settle before 09A, not during it

1. **Suppression authority.** Postal keeps its own suppression list and MAIL-08
   defines ours. Two suppression stores with no stated precedence is a silent
   divergence. Policy lives above the provider boundary, so Soullab's is
   authoritative and Postal's is a delivery-layer backstop — which means bounce
   and complaint events must flow UP into our model rather than terminating in
   Postal's.

2. **The bounce webhook is a new inbound surface.** Postal delivers async events
   by webhook, so MAIL-08 adds an internet-facing ingress that accepts
   attacker-reachable POSTs. That is the same class of endpoint as the one this
   incident is about. It needs signature verification and admission control from
   its first commit — MAIL-04's rule applies to ingress, not only to send routes.

3. **P0 has no failover on a single IP.** If a dedicated sending IP is blocked,
   sign-in mail stops — a sovereignty loss, not a gain. So MAIL-10's "destroy
   Resend keys" needs deciding as a question rather than assumed: removing Resend
   as PRIMARY is not the same as removing every high-reputation standby path for
   P0. The lane model already permits keeping a different provider for P0 than
   for P3, and that may be the correct permanent end state rather than a
   transitional one.

Item 3 is a founder decision about what sovereignty means here, and it is not
settled by this note.

MAIL-03 is **not** combined with MAIL-05: security containment stays tiny,
auditable and independently deployable.

### Correction to §3's implied guidance — P0 does not fail open

An earlier draft of this note proposed that guards "fail open" for P0, on the
grounds that locking members out is worse than the abuse. That is half right and
the missing half is decisive: if the limiter infrastructure dies, failing open
turns the endpoint back into unlimited email issuance — the exact state this
lane exists to end.

Neither open nor closed. A bounded emergency path:

```
limiter available
       ├─ legitimate → SEND
       └─ excessive  → BLOCK
limiter unavailable
       └─ emergency local ceiling
              ├─ small legitimate allowance → SEND
              └─ everything else            → BLOCK
```

Availability and abuse resistance both survive. Implemented in
`lib/auth/rateLimiter.ts`; pinned by `lib/auth/__tests__/emergency-ceiling.test.ts`.

### What the incident actually exposed

```
SEE what email is doing       ✓  MAIL-01
CLASSIFY what email is doing  ✓  MAIL-01
ABSTRACT the vendor           ✓  provider boundary
RECORD what happened          ✓  MAIL-02
CONTROL what email may do     ←  missing
```

The architecture was right; it stopped one layer short of the part that governs
who may spend the system's sending power.

### Credential rotation (operational, not code)

Rotate and revoke **every** Resend API key that existed during the incident,
regardless of whether V1/V2 is confirmed as the vector. An exposed endpoint and
a compromised credential are not mutually exclusive, and the ledger cannot rule
the second one out.
