# EMAIL-IDENTITY-01: Soullab Mail Authority

**Date:** 2026-10-01 · **Branch:** `claude/intelligent-clarke-v9zk51` · **Status:** IMPLEMENTED, gates green in container · ⛔ not merged · ⛔ not deployed

## Law

*Proton owns people talking to people. Resend owns software talking to people.*
Both run on one domain (`soullab.life`), and keeping them apart is the design.

## Evidence the founder witnessed on 2026-10-01

- Proton → Gmail: delivered from `mail-106105.protonmail.ch`, `Return-Path: Kelly@soullab.life`, DKIM `d=soullab.life`.
- Gmail → Proton: `Test` and `Test2` sent to `kelly@soullab.life` (10:00:34 and 10:01:20) and both arrived in Proton.
- In production MAIA, `RESEND_API_KEY` is SET and `EMAIL_PROVIDER` is unset, so the code defaults to Resend. Every Proton/SMTP variable is UNSET, so MAIA holds no Proton credentials.
- DMARC is `p=none`. That is correct while both send paths are being verified.

## What landed

| File | Role |
|---|---|
| `lib/email/identity.ts` | Registry. Every `@soullab.life` address in source is declared exactly once, with a class (`HUMAN`, `ORGANIZATIONAL`, `TRANSACTIONAL`, `ALERT_RELAY` or `LEGACY`), the lanes software may send as it on, its presence in the Proton listing, and any open ruling. Also `adjudicateSender(from, lane)`. |
| `lib/email/sendEmail.ts` | Runtime enforcement. A `soullab.life` sender that is not authorized on the provider's lane is refused as `sender_not_authorized` before the ledger opens and before the provider is called. A provider with an unknown lane fails closed. |
| `lib/comms/emailRouter.ts` | The same check on both practitioner lanes. They call providers directly and bypass `sendEmail()`. On the BYO lane the check also stops a practitioner key from sending as Soullab. |
| `lib/email/identityCensus.ts` + `__tests__/identity-authority.test.ts` | Static guard. CI fails on an undeclared `soullab.life` address, on a human or organizational mailbox used as a sender, on a new sender on another Soullab domain, or on a registry that contradicts its own class rules. |
| `scripts/email-identity-census.ts` | `npm run census:mail-identity` prints the registry and any violations. Exits 1 on any violation. |

Scope: only `soullab.life` is governed. A practitioner's own domain passes untouched (`governed: false`).

## Verification (container)

- Census: **0 violations**. Proven lethal: a probe file holding one organizational sender, one undeclared address and one ungoverned-domain sender produced exactly those three violations. The probe was then removed.
- `jest lib/email lib/comms`: **10 suites, 112/112 pass**, including the new suite.
- `tsc` (project config) reports 0 diagnostics in the touched files. The two new modules also pass `--strict --noUncheckedIndexedAccess`.
- ⚠️ `app/api/build/alert` could not load in the container because `next/server` is missing. The failure is identical at baseline and is environmental. The suite's sender (`messages@` on the smtp lane) is authorized.
- ⛔ `npm run typecheck` (ship baseline) and `preflight` were **not** run because the project `node_modules` is absent here. They are owed before merge.

## No live behaviour change found

Every sender literal in source today is authorized on its lane. Dynamic senders: `ALERT_FROM` must equal `ALERT_SMTP_USER` and is unset in production. The managed router defaults are `noreply@` and `updates@`, both authorized. `scripts/maia-monitor.js` calls Resend over HTTP outside the app on purpose (a monitor must not depend on the app it watches), so only the static census governs it.

## Findings: rulings owed, ranked by severity

1. **`notifications@soullab.ai` sends Stellium safety escalations** (`lib/notifications/safety.ts`). Ownership and verification of `soullab.ai` are unconfirmed. If the domain is unverified, practitioners are not receiving safety notices. Check the Resend domain list first.
2. **`problem@soullab.life` receives member problem reports** (`/api/feedback`) but has no mailbox in the Proton listing. Resend accepts the send and the ledger records success, so unless a catch-all exists, reports land nowhere.
3. **`privacy@soullab.life`** is published on both privacy pages with no listed mailbox. A data-rights request that goes nowhere is a legal exposure.
4. `hello@`, `contact@`, `partnerships@`, `research@` and `collaborate@` are all published with no listed mailbox. For each: create it in Proton, alias it to `info@`, or replace it in the copy. **One check settles the whole set:** is a Proton catch-all enabled for `soullab.life`?
5. **Replies to `bookings@` and `updates@` reach no mailbox.** These send practitioner-named mail and set no `replyTo`. Proposed: replyTo = the practitioner, or `support@`.
6. **`kelly@` is a human mailbox that software sends as.** This is coherent for founder-voiced letters. Open question: should **auth** mail (`/api/members/send-verification`) move to `noreply@`? It was not moved here because that changes what members see.
7. `maia@soullab.life` (focus reminders) means MAIA speaks as the companion in the inbox. Confirm against the Sovereignty Invariants (no attachment capture).
8. `noreply@` is also an active Proton address, so bounces and replies collect there. Decide whether to keep it (bounces stay readable) or retire the Proton side.
9. Legacy cleanup: retire `gmail@` after confirming it has no inbound use. Turn `nathan@` into an alias if it is unused.
10. `kelly@soullab.org` (beta invites) stays as named debt, as that file already rules.

## Next, after the rulings

DMARC hardening `p=none → quarantine → reject` becomes safe once every legitimate sender authenticates. This registry now lists those senders: the Resend identities above, Proton for the HUMAN and ORGANIZATIONAL mailboxes, and the `messages@` SMTP relay. Get a DMARC aggregate report (`rua=`) back clean before each step.

---

## Addendum (same day): first production evidence, and the non-delivery register

### ⛔ P0: production `RESEND_API_KEY` reads as INVALID

The founder ran the Resend domain listing **from inside the production container** and got `{"statusCode":400,"message":"API key is invalid","name":"validation_error"}`. That is a key-level rejection, not a domain one. If it reproduces on the send path, **every** transactional send fails: auth codes, magic links, recovery, reminders, safety notices. That ranks above every other item in this record. Leading hypotheses, not yet established:
(a) the 2026-09-07 key rotation (MAIL-04c) left a quoted or whitespace-padded value in `.env.production`;
(b) the key was revoked in Resend after rotation;
(c) the container was not recreated after a later edit.
**The decisive evidence is the delivery ledger** (`email_delivery_attempts.state` / `failure_class`), not the domains endpoint. The ledger records what actually happened to real sends.

### Refusal loudness (verified in source)

The established contract, which this lane keeps, is that `sendEmail()` never throws. It returns `success:false` with a classified `failureKind`. Throwing would turn a notification failure into a crashed route. What matters is that no caller *ignores* the result. Checked:
- Stellium safety (`lib/notifications/safety.ts`) logs `REFUSED` and sets `safety_concern_logs.email_status='failed'` with the error.
- Scheduled sends (cron and self-test) write `status`/`last_error` to `scheduled_sends`. Soul Portrait inspects `result.success`.
- Mail Authority refusals now also emit `[MAIA/email] SENDER_REFUSED reason=… lane=… purpose=…`. This is needed because they never reach the provider or the ledger, so the log is their only trace.
⚠️ A recorded failure is not a *seen* failure. Nothing pages anyone when `safety_concern_logs.email_status='failed'`, so that table belongs in the register's daily check.

### `soullab.ai` under the new rules: allowed, explicitly

`adjudicateSender` governs `soullab.life` only, so `notifications@soullab.ai` passes as `governed:false`. It is not silently exempt: it is named debt in `UNGOVERNED_SOULLAB_SENDERS`, and the static guard fails CI if that list grows. Whether Resend accepts the domain is a separate fact. It is unknowable until the key works, because the domains call above failed on the key, not on the domain.

### Non-delivery register

| # | Path | Failure mode | Status | Next evidence |
|---|---|---|---|---|
| R1 | All Resend mail | Invalid API key | ⛔ OBSERVED on the domains endpoint | Ledger states over 7 days; key shape check |
| R2 | Stellium safety → practitioner | `soullab.ai` may be unverified | UNKNOWN (blocked by R1) | Domains listing once the key is valid; `safety_concern_logs` where `email_status='failed'` |
| R3 | Member problem reports → `problem@` | Mailbox may not exist | UNKNOWN | External test email (a bounce is decisive) |
| R4 | Data-rights requests → `privacy@` | Mailbox may not exist | UNKNOWN, legal deadline | External test email; create today if it bounces |
| R5 | `hello@` and the other published contacts | Mailbox may not exist | UNKNOWN | External test email |
| R6 | Replies to `bookings@` / `updates@` | No reply-to | STRUCTURAL | Ruling: reply-to = practitioner or `support@` |
| R7 | Auth mail from `kelly@` | Reputation coupling; replies go to the personal inbox | DEFERRED, not indefinite | Move to `noreply@` + reply-to `support@` |
