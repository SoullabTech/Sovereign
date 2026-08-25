# EMAIL-DELIVERY-CUSTODY-01 — Phase 1 Census

**Status:** Phase 1 complete (census only). No provider decision, no implementation.
**Scope:** read-only. Nothing was changed, migrated, deployed, or configured.
**Occasion:** the Resend account reached 59,995 / 50,000 monthly sends, blocking new-member
signup. The volume question exposed a prior structural one.

---

## The finding

`lib/email/sendEmail.ts` opens by calling itself *"the one place transactional email leaves
the system."* **It is not.**

```
N  24  direct Resend authorities
M  23  bypass sendEmail
K   1  confirmed silent-drop (lib/team/notifications.ts)
```

Counted mechanically — see **P1-CORRECTION** below.

The consequence is not stylistic. `sendEmail` exists because Resend's `emails.send()` returns
`{ data, error }` and **does not throw** on API failure — a caller that awaits it and assumes
success silently drops mail. Every bypassing call site re-opens that bug class on its own
terms, and the system therefore cannot reliably answer three questions:

1. was this mail actually sent?
2. why was it sent, and by which subsystem?
3. which subsystem is producing volume?

The 60,000 sends are a symptom of (3). The architecture is the finding.

---

## Call-site census

All 24, one path per row. `sends` = calls to `emails.send`; `loops` = iteration
constructs; **silent-drop** = the file never references `.error` on the send result, so a
resolved `{data:null,error}` is indistinguishable from success.

| call site | sends | loops | failure handling |
|---|---|---|---|
| `lib/email/sendEmail.ts` | 2 | 0 | **classified** — the intended boundary |
| `lib/comms/emailRouter.ts` | 4 | 0 | inspects error (practitioner BYO routing) |
| `lib/portal/notifications.ts` | 8 | 0 | inspects error |
| `lib/team/notifications.ts` | 3 | 2 | **⚠ SILENT-DROP — never references `.error`** |
| `lib/services/emailService.ts` | 1 | 4 | to verify |
| `lib/email/sendBetaInvite.ts` | 2 | 3 | to verify |
| `lib/email/sendBetaInviteWithPasscode.ts` | 1 | 1 | to verify |
| `lib/focus/FocusReminderService.ts` | 1 | 1 | inspects error |
| `lib/notifications/safety.ts` | 1 | 0 | inspects error |
| `lib/practiceField/inviteEmail.ts` | 1 | 0 | inspects error |
| `lib/masters/partnerNotifications.ts` | 1 | 0 | inspects error |
| `lib/security/alertEngine.ts` | 1 | 1 | to verify |
| `app/api/team/invite/route.ts` | 2 | 0 | inspects error |
| `app/api/feedback/route.ts` | 1 | 0 | inspects error |
| `app/api/members/beads/route.ts` | 1 | 0 | inspects error |
| `app/api/labtools/gifts/route.ts` | 1 | 0 | inspects error |
| `app/api/notifications/email/route.ts` | 1 | 0 | to verify |
| `app/api/fields/nathan/message/route.ts` | 1 | 0 | to verify |
| `app/api/studio/session-followup/send/route.ts` | — | — | to verify |
| `app/api/build/alert/route.ts` | 1 | 0 | to verify |
| `scripts/send-beta-update-email.ts` | 1 | 1 | bulk operator script |
| `scripts/send-maia-ready-email.ts` | 1 | 1 | bulk operator script |
| `scripts/send-passkey-reminder.ts` | 1 | 3 | bulk operator script |
| `scripts/send-steward-invitation.ts` | 1 | 3 | bulk operator script |

`to verify` is honest, not dismissive: the classification above comes from a structural scan
(does the file reference `.error` at all). Confirming each one requires reading its send path.
`lib/team/notifications.ts` was read and **confirmed**: three bare
`await resend.emails.send({...})` calls, no result captured, no error inspected anywhere in the
file.

---

## Scheduled and bulk-capable paths

Volume can only come from something that runs repeatedly or fans out. Four such paths exist:

| path | cadence | fan-out |
|---|---|---|
| `app/api/cron/scheduled-sends` | **every minute** | `LIMIT BATCH` per tick |
| `app/api/cron/session-reminders` | every 10–15 min | per due session |
| `lib/services/newsletter/NewsletterIntegration` | on demand | **batch, grouped by awareness level** |
| `scripts/send-*.ts` | manual | whole-audience |

### `scheduled-sends` — RULED OUT as the runaway

It has the shape that produces five-figure volume from one stuck row — a one-minute cron
against a `pending` queue is 43,200 ticks a month — but it is correctly guarded:

- `attempts` increments on **both** the `!result.success` path and the `catch` path
- `status` flips to `'failed'` at `MAX_ATTEMPTS`, removing the row from the `pending` query
- the due query is `status = 'pending' AND consent_confirmed = true AND scheduled_for <= now()`
- `LIMIT BATCH` bounds each tick

A failing row therefore retires after `MAX_ATTEMPTS`, not forever. It also does not log the
recipient address — it logs `practitionerPrefix` (see the note below).

### Remaining candidates, in order

None of these is the cause. Their state is **capability**, not attribution:

```
NewsletterIntegration   HIGH-VOLUME CAPABLE
session-reminders       REPEATED-SEND CAPABLE
bulk scripts            BULK CAPABLE
FocusReminderService    REPEATED-SEND CAPABLE

59,995 attribution      UNRESOLVED
```

1. **`NewsletterIntegration`** — bulk by design, batches by awareness level with inter-batch
   delays "to avoid rate limiting". Highest fan-out per invocation.
2. **`session-reminders`** — repeats every 10–15 min against due sessions.
3. **bulk operator scripts** — whole-audience by intent; a re-run sends again.
4. **`FocusReminderService`** — reminder semantics, cron-adjacent via
   `app/api/focus/process-reminders`.

---

## What this census CANNOT establish

**Code shows what *could* send. Only the provider log shows what *did*.**

Attribution of the 59,995 requires Resend → **Logs** / **Metrics**, filtered by time and by the
`purpose` tag. That page is not reachable from the build environment. Any attribution made from
source alone would be a hypothesis wearing the clothes of a finding.

The `purpose` tag is the join key — but **only sends routed through `sendEmail` carry one.**
The 23 bypassing call sites are exactly the ones hardest to attribute, which is the
same defect from the accounting side.

---

## Related finding — log hygiene

`scheduled-sends` logs `practitioner_id.slice(0, 8)`. Per `lib/privacy/memberRef.ts`, a
truncated identifier is "a fragment of the source identifier, not a derivation of it" and is
explicitly not the standard. This is a practitioner id rather than a member id, and it belongs
to **AUTH-LOG-GUARD-01**, not here. Recorded, not fixed.

---

## P1-CORRECTION — the count

The first draft of this census said *22 direct authorities, 21 bypassing*, while its own table
enumerated 20 named files plus `scripts/send-*.ts (4 files)` — read literally, 24. The headline
and the enumeration disagreed.

Re-counted mechanically over `app/`, `lib/`, `scripts/`, `components/`:

```
grep -rlE "from 'resend'|require\('resend'\)|new Resend"
```

```
N = 24   direct Resend authorities
M = 23   bypass sendEmail
K =  1   confirmed silent-drop
```

The original 22 came from a narrower pattern (`from 'resend'` alone, no `new Resend` or
`require`). **24 is the number**; the table above now carries one path per row and matches it.

`K = 1` is a floor, not a total: it counts only call sites read line-by-line and confirmed.
Rows marked *to verify* may raise it.

---

## Phase 2 — architecture (not yet designed)

Per founder ruling, the goal is **one delivery boundary and one truth model**, not one function
with dozens of conditionals. Auth codes, security alerts, invitations, reminders and
notifications have genuinely different semantics.

```
caller
  └─ sendTransactionalEmail(envelope)
       ├── auth-code
       ├── invitation
       ├── security-alert
       ├── reminder
       └── notification
            └─ provider adapter  →  Resend | SES | Postmark | relay
```

Required envelope: `purpose`, non-PII actor reference where applicable, failure classification,
provider code, retryability, observable result.

**Open question for Phase 2:** whether `sendEmail`'s current contract is broad enough for all
all 24 callers, or whether the semantic split above should come first. Not assumed.

## Phase 3 — consolidation plan (not yet written)

Migration groups, tests proving a failure cannot masquerade as a send, volume instrumentation,
rollback.

---

## Explicitly NOT done

No provider swapped · no SES/Postmark configured · no MTA · no DNS · no auth behavior altered ·
no call site migrated.

## Relationship to the signup incident

Independent. Restoring signup requires Resend capacity (pay-as-you-go, an upgrade, or the
Aug 28 renewal) and nothing from this unit. This unit must not become a prerequisite for
members being able to join.

**But the sequencing matters in one direction:** changing provider before finding the volume
source would turn an expensive bug into a cheap bug rather than fixing it.

---

## Next evidence act — provider volume witness (account-side, not code)

Not a blocker to signup restoration. Inspect or export enough Resend history to answer, where
the provider exposes it:

```
date/time distribution
volume by day / hour
subject or template
from address
status
tags / purpose where present
```

The **shape** may attribute the volume even where bypassing sends carry no `purpose`:

| pattern | reading |
|---|---|
| giant isolated bursts | newsletter or operator run |
| regular 10–15 minute cadence | reminders |
| evenly distributed | many ordinary callers |
| repeated identical destination/content | retry or loop |

If the provider does not expose enough to decide, record **ATTRIBUTION UNRESOLVED** and move on.
Do not manufacture certainty.

## Phase 2's central design question

> What is the smallest common delivery contract every email must obey, while leaving domain
> semantics with the caller?

Candidate invariants:

```
every send has a purpose
every send returns a truthful outcome
provider errors are classified
failure cannot masquerade as success
recipient PII never enters operational logs
volume is attributable by purpose
provider is replaceable
domain semantics remain outside transport
```

The destination is not *"replace Resend."* It is to make email transport trustworthy enough
that replacing Resend becomes boring.
