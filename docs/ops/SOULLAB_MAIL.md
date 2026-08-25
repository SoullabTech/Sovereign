# Soullab Mail

Provider-independent transactional email. Application code calls one API;
vendors sit behind an adapter and are replaceable.

```
  application code
        │
        ▼
  lib/email/sendEmail.ts        ← policy: classification, lanes, logging, truth
        │
  lib/email/providers/          ← the ONLY place a vendor SDK is imported
        │
  ┌─────┴─────┐
  ▼           ▼
Resend      Memory (dev/test)     [SES, Postmark: adapters not yet written]
```

## Sending

```ts
import { sendEmail, SENDERS } from '@/lib/email/sendEmail';

const result = await sendEmail({
  purpose: 'auth:email-code',       // required — determines the lane
  from: SENDERS.noreply,
  to: member.email,
  subject: 'Your sign-in code',
  html, text,
  correlationId: requestId,          // optional — ties the send to its cause
  idempotencyKey: `AUTH_CODE:${tokenId}`,
  metadata: { surface: 'signin' },
});

if (!result.success) { /* result.failureKind, result.retryable, result.ourFault */ }
```

`sendEmail` **never throws**. It returns a typed result. A caller that does not
inspect `result.success` is reporting refusals as sends — that is the entire bug
class this subsystem exists to remove.

## Lanes

| Lane | Meaning | Examples |
|------|---------|----------|
| P0 | identity — a member cannot sign in without it | `auth:*`, `security:notice` |
| P1 | access — invitations, service notices | `invite:*`, `system:alert` |
| P2 | transactional — notifications, reminders, reports | `notify:*`, `reminder:*`, `portal:*` |
| P3 | bulk — broadcast, campaigns | `broadcast:*` |

Lanes are resolved in `lib/email/purpose.ts`: exact purpose → family prefix →
`P2` default. **An unregistered purpose can never resolve to P0** — otherwise the
protected lane would be reachable by anything that forgot to register.

Declaring a lane classifies a send. It does not meter it. Per-lane budgets and
reserved P0 capacity are built on this classification; they are not yet built.

## Failure classification

`SendFailureKind` is what a caller branches on; `providerCode` is the vendor's
raw error name, kept verbatim for operators.

| Kind | Ours? | Retryable? |
|------|-------|-----------|
| `quota_exceeded` | yes | no |
| `rate_limited` | yes | yes |
| `provider_auth` | yes | no |
| `provider_config` | yes | no |
| `invalid_recipient` | **no** | no |
| `provider_error` | yes | no |
| `not_configured` | yes | no |
| `exception` | yes | yes |

Unattributed failures are **ours** by construction. `invalid_recipient` is the
only class that tells a member their own address is wrong, so it is the only one
requiring evidence that names the recipient.

## Configuration

```
EMAIL_PROVIDER=resend | memory     # default: resend
RESEND_API_KEY=...                 # required by the resend provider
```

Two refusals, both deliberate:

- An **unknown** `EMAIL_PROVIDER` throws. A deploy that asked for one provider
  and silently got another is not running what it says it is running.
- `EMAIL_PROVIDER=memory` in production throws. The capture transport contacts
  no vendor, so every send would report success and never leave.

## Observability

Every attempt emits one structured line:

```
[MAIA/email] sent   { purpose, priority, provider, correlationId, from, toRef, domain, status, id }
[MAIA/email] FAILED { purpose, priority, provider, ..., failureKind, providerCode, error }
```

Recipient addresses are never logged — `toRef` is a pseudonymous
`memberRef()` reference; `domain` is kept unredacted for deliverability triage;
`error` is passed through `redactEmails()` because vendors echo the rejected
address back inside their message text.

A failure that affects **every** send (quota, bad key, unverified sender,
unconfigured) additionally emits a greppable emergency line:

```
[MAIA/email] TRANSPORT_DOWN kind=... providerCode=... purpose=...
```

Purpose, lane, correlation id and idempotency key also travel with the message
as provider tags, so the vendor dashboard segments the same way the logs do.

## Volume guards

| Path | Guard |
|------|-------|
| `lib/team/notifications.ts` mention fan-out | dedup + `MAX_MENTION_FANOUT = 25`, truncation logged, transport-wide abort |
| `lib/email/sendBetaInvite.ts` batch | `MAX_INVITES_PER_BATCH = 100`, truncation logged, transport-wide abort |
| `scripts/send-beta-update-email.ts`, `send-maia-ready-email.ts` | transport-wide abort |

**No silent caps**: every truncation logs what was dropped. A cap that trims
quietly reads as "we covered everything" when it did not.

`idempotencyKey` is currently **identification, not suppression**. Nothing drops
a second send with the same key — that needs the durable ledger, and claiming
deduplication before it exists would be worse than not having it: an auth code
silently suppressed is a member locked out.

## The architectural guard

`lib/email/__tests__/no-direct-provider-imports.test.ts` fails CI if application
code imports a vendor SDK — statically, via `require`, or via dynamic import.
Adding a file to `ALLOWED_VENDOR_IMPORTERS` is a deliberate decision to write a
new adapter, not a way to unblock a caller.

`KNOWN_UNMIGRATED` is separate and is **debt, not architecture**. Its size is
asserted, so the debt is bounded while unpaid.

## Adding a provider (SES, Postmark)

1. Write `lib/email/providers/SesProvider.ts` implementing `EmailProvider`.
2. Register it in `lib/email/providers/index.ts` (`SUPPORTED_PROVIDERS` + `construct`).
3. Add its path to `ALLOWED_VENDOR_IMPORTERS` in the guard test.
4. Map its async delivery events (bounce/complaint/delivery) onto Soullab states
   at the adapter boundary — application code must not learn vendor event names.

Steps 1–3 are code. **Activating** a provider is a separate operational act
requiring credentials, domain authentication, DKIM/SPF/DMARC, quota review and
production verification. It is not authorised by the code landing.
