# JARVIS-COMMS-01 — Soullab Communications Architecture Evaluation

**Date:** 2026-08-24
**Authority:** evaluation only. Implementation NOT AUTHORIZED (§19).
**Status:** complete. Do not begin JARVIS-COMMS-02 without explicit authorization.

---

## 0. BOUND REALITY

| Field | Value |
|---|---|
| Repository | `https://github.com/SoullabTech/Sovereign` |
| Working branch | `claude/adoring-davinci-9ckuam` |
| HEAD | `be5b3b80241eb988e74f16cb8851888f135d45df` (`be5b3b8`) |
| HEAD commit | `Merge pull request #1071 from SoullabTech/fix/mic-stuck-arming`, 2026-08-17 15:21:27 -0400 |
| Working tree | **clean** (0 modified files) |
| Production branch | `clean-main-no-secrets` — at the **identical SHA** `be5b3b8`. Working branch and production referent are in sync; no drift. |
| Production deployment referent | minisforum, Docker + Caddy, service `maia-sovereign`; deploy lane `scripts/pre-deploy-gate.sh deploy-maia <SHA>` (per `CLAUDE.md`) |
| Email library | `resend` — declared `^6.6.0` in `package.json`, **lockfile-resolved `6.8.0`** in `package-lock.json` |
| Other transport SDKs present | Twilio (SMS/WhatsApp), Telegram — practitioner comms only |
| No SMTP / SES / Postmark / SendGrid / Novu / Plunk dependency exists | confirmed by `package.json` inspection |

**Binding is unambiguous. Proceeding.**

### Operational access limitation (declared)

This evaluation ran in a remote cloud container. **`ssh` is not installed**; minisforum is unreachable from here. Therefore:

- No production logs were read.
- No Resend dashboard / account state was read.
- **No live provider quota state was observed.**

Every claim below is grounded in repository custody. Provider-side claims are marked **INFERRED** or **UNKNOWN** and are not asserted as proven.

### Current Resend configuration surface

Single environment variable: `RESEND_API_KEY`. Supporting: `EMAIL_FROM`, `EMAIL_INCLUDE_PREVIEW`.

There is **no** provider-selection variable, **no** fallback key, **no** quota configuration, **no** webhook secret, **no** suppression configuration.

Verified sender identities are hardcoded in `lib/email/sendEmail.ts` (`SENDERS`), and re-hardcoded independently as string literals in most routes.

### Every production route/service calling Resend

**30 direct `new Resend(...)` instantiations** across 26 non-script files. The client is constructed per-module, not injected.

**Authentication / identity critical path (5):**
`app/api/members/email-code/route.ts` · `app/api/members/magic-link/route.ts` · `app/api/members/send-verification/route.ts` · `app/api/members/recover/route.ts` · `app/api/members/reset-password/route.ts`

**Other application routes (8):**
`app/api/team/invite/route.ts` · `app/api/feedback/route.ts` · `app/api/build/alert/route.ts` · `app/api/notifications/email/route.ts` · `app/api/labtools/gifts/route.ts` · `app/api/members/beads/route.ts` · `app/api/fields/nathan/message/route.ts` · `app/api/studio/session-followup/send/route.ts`

**Library services (13):**
`lib/email/sendEmail.ts` · `lib/email/sendBetaInvite.ts` · `lib/email/sendBetaInviteWithPasscode.ts` · `lib/comms/emailRouter.ts` (×2) · `lib/comms/providers/ResendProvider.ts` · `lib/services/emailService.ts` · `lib/team/notifications.ts` · `lib/portal/notifications.ts` · `lib/practiceField/inviteEmail.ts` · `lib/masters/partnerNotifications.ts` · `lib/notifications/safety.ts` · `lib/focus/FocusReminderService.ts` · `lib/security/alertEngine.ts`

**Operational scripts (4):** `scripts/send-beta-update-email.ts` · `send-maia-ready-email.ts` · `send-passkey-reminder.ts` · `send-steward-invitation.ts`

---

## 1. THE INCIDENT — PRESERVED AS EVIDENCE

### A. Application truthfulness defect — **PROVEN**

The hypothesised chain is **confirmed in code** for the primary signup/sign-in path.

`app/api/members/email-code/route.ts:180-215`:

```ts
try {
  await getResend().emails.send({ from: 'Soullab <noreply@soullab.life>', to: normalizedEmail, ... });
} catch (emailError) {
  console.error('[EMAIL-CODE] Failed to send email:', emailError);
  return NextResponse.json({ error: 'Could not send the code...' }, { status: 500 });
}

trackOnboarding({ event: 'magic_link_sent', ... });
console.log(`[EMAIL-CODE] Code sent to ${normalizedEmail} ...`);
return NextResponse.json({ success: true, isExistingMember });
```

The call is a **bare `await`**. The resolved `{ data, error }` envelope is **discarded**. Resend's SDK resolves — it does not throw — on API-level rejection, so the `catch` block is unreachable for a quota rejection. Consequently the route:

1. writes a valid code row to `magic_link_tokens`,
2. emits `trackOnboarding({ event: 'magic_link_sent' })` — **the analytics record is false**,
3. logs `[EMAIL-CODE] Code sent to <email>` — **the operator log is false**,
4. returns HTTP 200 `{ success: true }` — **the user-facing state is false**.

The member is told to check their email. No email exists. There is no record anywhere that the provider refused.

**This defect is not isolated.** Mechanical audit of all 38 `emails.send` call sites:

| Route / service | Line | Result inspected? |
|---|---|---|
| `app/api/members/email-code/route.ts` | 181 | ❌ **discarded** |
| `app/api/members/magic-link/route.ts` | 162 | ❌ **discarded** |
| `app/api/members/recover/route.ts` | 61 | ❌ **discarded** |
| `app/api/members/reset-password/route.ts` | 103 | ❌ **discarded** |
| `app/api/members/send-verification/route.ts` | 88 | ✅ `const { error: sendError }`, checked, returns 500 |
| `app/api/team/invite/route.ts` | 58, 118 | ❌ **discarded** ×2 |
| `app/api/feedback/route.ts` | 28 | ❌ discarded |
| `app/api/build/alert/route.ts` | 64 | ❌ discarded |
| `app/api/fields/nathan/message/route.ts` | 45 | ❌ discarded |
| `lib/team/notifications.ts` | 73, 143, 217 | ❌ discarded ×3 |
| `lib/masters/partnerNotifications.ts` | 106 | ❌ discarded |
| `lib/security/alertEngine.ts` | 129 | ❌ discarded |

**4 of the 5 authentication email paths silently drop provider errors.** The one that does not — `send-verification` — is the exception, not the pattern.

Each of the four broken auth routes carries the same shape: a `try/catch` that reads as error handling, a `console.log('... sent to ...')` immediately after, and `{ success: true }`. The defect is *disguised* as handling. That is why it survived review.

**The test suite cannot catch it.** `app/api/members/email-code/__tests__/route.test.ts:26`:

```ts
const mockSend = jest.fn<(...args: unknown[]) => Promise<{ id: string }>>();
mockSend.mockResolvedValue({ id: 'email-mock' });
```

The mock's type is `Promise<{ id: string }>` — it does not model Resend's `{ data, error }` envelope at all. No test case supplies an `error`. Every assertion is `expect(mockSend).toHaveBeenCalledTimes(1)` — *attempt*, never *acceptance*. The tests assert exactly the wrong thing, and would stay green through a total provider outage.

**The fix already exists in-repo and is unadopted.** `lib/email/sendEmail.ts` is a correct central helper. Its own header documents this precise bug class:

> *"Resend's `emails.send()` returns `{ data, error }` and does NOT throw on API failures. Callers that `await` it and assume success silently drop mail — the failure never appears in logs or HTTP responses. That bug had already reappeared in several senders..."*

It always inspects `result.error`, always logs `[MAIA/email] sent` / `[MAIA/email] FAILED` with structural metadata only (Sanctuary-compliant), returns a typed `{ success, id, error, status }`, and never throws.

**It has exactly one caller outside itself**: `lib/notifications/SessionNotificationService.ts`.

> The correct abstraction was built, documented, and then not adopted. 26 call sites route around it. This is the central architectural fact of the incident — **not** a missing capability, but an unenforced one.

### B. Provider delivery failure — **INFERRED, NOT PROVEN**

`monthly_quota_exceeded` is a **real, documented Resend error type**, returned with HTTP 429 alongside `daily_quota_exceeded` ([Resend usage limits](https://resend.com/docs/api-reference/rate-limit)).

Resend's free plan is **3,000 emails/month AND no more than 100/day** ([Resend free tier](https://resend.com/blog/new-free-tier)). Paid plans carry pay-as-you-go overage — meaning **`monthly_quota_exceeded` is structurally a free-plan-only hard stop**. On a paid plan the send would bill through rather than be refused.

**Not proven here**: no ssh, no dashboard, no logs. The account's actual plan, quota consumption, and the specific error string returned in the live incident are **UNKNOWN from repository custody**.

**These two failures must not be collapsed.** They are independent:

- Fixing (B) — upgrading the plan — restores delivery **and leaves the truthfulness defect fully intact**, invisible until the next provider failure of any kind.
- Fixing (A) — inspecting the result — does not deliver a single additional email, but converts every future failure from silent to visible.

**(A) is the more serious defect.** (B) is a billing condition with a five-minute remedy. (A) is a system that lies to its members about whether it acted, on the authentication path, by construction.

Under `docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md` this is not merely a bug: the system reports a state it has not verified, on the path that governs a member's access to their own account.

### Proven / inferred / unknown

**PROVEN (from code at `be5b3b8`):**
- 4/5 auth routes discard the Resend result envelope and return `{ success: true }` regardless.
- `trackOnboarding({ event: 'magic_link_sent' })` fires on attempt, not acceptance — the analytics record is corrupt at source.
- A correct central helper exists with 1 adopting caller vs 26 bypassing call sites.
- Tests mock a non-enveloped return and assert call count only.
- No quota-, 429-, or provider-error-class handling exists anywhere in the email layer.
- No Resend webhook endpoint exists (`app/api/*webhook*` → only Stripe and LiveKit).
- No retry, no fallback provider, no suppression list, no delivery record for platform email.

**INFERRED:**
- The live rejection was `monthly_quota_exceeded` under a free plan (consistent with symptom + documented error type + free-tier structure).
- Signups broke at the moment quota was exhausted, with zero operator signal, because the only signal path was a `console.log` that reports success unconditionally.

**UNKNOWN:**
- Actual Resend plan, quota state, and consumption.
- Whether `soullab.life` domain verification remains healthy.
- How many members hit a false-success signup, and over what window.
- Whether any code rows in `magic_link_tokens` correspond to never-delivered codes (measurable in production, not from here).

---

## 2. COMMUNICATION SURFACE CENSUS

### 2.1 The finding that reframes this evaluation

Soullab **already has a communications platform**. It is not missing — it is *misapplied*.

`lib/comms/` contains: `DeliveryService` (539 LOC), `InboxService`, `ThreadService`, `SafetyService`, `ReplySuggestionService`, `maiaAnalyzer`, `events`, `emailRouter`, and a real provider abstraction at `lib/comms/providers/`:

```ts
export interface CommsProvider {
  readonly provider: ProviderType;      // 'resend' | 'twilio' | 'sendgrid' | 'postmark'
  readonly channel: DeliveryChannel;    // 'email' | 'sms'
  verifyCredentials(creds): Promise<boolean>;
  send(payload, creds): Promise<DeliveryResult>;
  parseWebhook(payload): DeliveryStatusUpdate | null;
  verifyWebhookSignature(payload, signature, secret): boolean;
}
```

`DeliveryResult` already separates `status: 'sent' | 'queued' | 'failed'` from `errorCode`/`errorMessage`. `DeliveryStatusUpdate` already models `'delivered' | 'bounced' | 'failed' | 'complained'`.

The schema (`database/migrations/20260122_comms_delivery_infrastructure.sql`) already carries `comms_delivery_queue` with:

`status` (queued/processing/sent/delivered/failed) · `external_id` (provider message id) · `provider_response JSONB` · `error_code` · `error_message` · `retry_count` / `max_retries` · `worker_id` / `locked_at` · `scheduled_for` · and **separate** `queued_at` / `processing_at` / `sent_at` / `delivered_at` / `failed_at`.

Plus `comms_webhooks_log`. Plus `member_notification_preferences (member_id, event_type, channel, enabled)` — a real per-member × event × channel consent model.

**This is, structurally, the architecture §7 proposes building.** It already exists.

### 2.2 Why the auth path cannot use it

Two hard blocks:

1. **`practitioner_id UUID NOT NULL REFERENCES practitioners(id)`** on `comms_delivery_queue`, and `practitionerId: string` (required) on `DeliveryPayload`. The entire spine is bound to *practitioner BYO* communications. A platform auth email has no practitioner. It cannot be represented.

2. **The queue has no drainer in production.** `comms_delivery_queue` is referenced by exactly one file, `lib/comms/DeliveryService.ts`. The deployed `maia-comms-worker` container runs `scripts/run-comms-analysis-worker.ts` — *analysis*, not delivery. The only live caller of `deliveryService` in the app is `app/api/stellium/comms/credentials/route.ts`, which calls `verifyAndStoreCredentials` — credential checking, not sending.

In the project's own six-category typology (`CLAUDE.md`): **the comms delivery spine is Category 3 — built substrate, migration applied, zero live delivery callers.** Naming it as live infrastructure would be exactly the inflation drift the Anchor warns against. Naming it as *absent* would be the inverse (omission) drift. It is built, unwired, and practitioner-scoped.

### 2.3 Event → delivery map (actual, current)

```
AUTHENTICATION / IDENTITY  ── the critical path ──────────────────────────────

signup / signin code
  → POST /api/members/email-code
    → template: inline HTML+text string literal in the route
      → new Resend(process.env.RESEND_API_KEY)
        → DELIVERY RESULT: ****DISCARDED****
          → OBSERVABILITY: console.log "Code sent" (false on failure)
                         + trackOnboarding('magic_link_sent') (false on failure)
                         → HTTP 200 { success: true }              ❌ LIES

magic link
  → POST /api/members/magic-link          → inline template → raw Resend → DISCARDED  ❌ LIES
password reset
  → POST /api/members/reset-password      → inline template → raw Resend → DISCARDED  ❌ LIES
passkey recovery
  → POST /api/members/recover             → inline template → raw Resend → DISCARDED  ❌ LIES
                                             (also emails the passkey in plaintext — see §11)
email verification
  → POST /api/members/send-verification   → inline template → raw Resend
        → { error: sendError } inspected → HTTP 500 on failure                        ✅ TRUTHFUL

RELATIONAL / PRODUCT ────────────────────────────────────────────────────────

team invitation      → POST /api/team/invite            → raw Resend → DISCARDED ×2
team notifications   → lib/team/notifications.ts        → raw Resend → DISCARDED ×3
beta invites         → lib/email/sendBetaInvite*.ts     → raw Resend → inspected
practice field invite→ lib/practiceField/inviteEmail.ts → raw Resend → inspected
portal notifications → lib/portal/notifications.ts      → raw Resend → inspected ×8
session notifications→ lib/notifications/SessionNotificationService.ts
                       → sendEmail() helper             → inspected + logged   ✅ ONLY ADOPTER
focus reminders      → lib/focus/FocusReminderService.ts→ raw Resend → inspected
session follow-up    → POST /api/studio/session-followup/send → raw Resend → inspected
gifts / beads        → labtools/gifts, members/beads    → raw Resend → inspected
partner notify       → lib/masters/partnerNotifications → raw Resend → DISCARDED

SAFETY / OPS ────────────────────────────────────────────────────────────────

safety escalation    → lib/notifications/safety.ts      → raw Resend → inspected
security alerts      → lib/security/alertEngine.ts      → raw Resend → DISCARDED  ⚠ silent safety path
build alerts         → POST /api/build/alert            → raw Resend → DISCARDED
feedback             → POST /api/feedback               → raw Resend → DISCARDED

PRACTITIONER BYO (the only layered path) ────────────────────────────────────

practitioner message → lib/comms/emailRouter.ts
                        → BYO key from practitioner_integrations, else platform key
                          → Resend → { data, error } inspected
                            → updateIntegrationStatus() on failure
                              (does NOT write comms_delivery_queue)

SMS / WhatsApp / Telegram → lib/comms/providers/{Twilio,WhatsApp,Telegram}Provider.ts
                            (practitioner-scoped; sms_delivery_status migration exists)

MAIA-GENERATED OUTBOUND → NONE. No path exists by which MAIA initiates
                          communication outside an active conversation.
                          (Correct. See §15.)
```

### 2.4 Defect inventory

| Defect | Evidence |
|---|---|
| **Duplicated provider calls** | 30 `new Resend()` instantiations; ~4 distinct client-construction idioms (`process.env` inline, `apiKey` local, lazy `getResend()`, module singleton) |
| **Provider-specific code in routes** | `import { Resend } from 'resend'` appears in 13 route files. Swapping providers means editing 26 files. |
| **Ignored send results** | 13 call sites, incl. 4/5 auth routes and the security alert engine |
| **Missing message identifiers** | No platform-side communication id exists. Resend's `data.id` is captured by some inspecting callers and persisted by **none** for platform email. |
| **Missing delivery status** | No webhook endpoint. `accepted` vs `delivered` vs `bounced` is unobservable for all platform email. |
| **Retry** | None on the platform path. `retry_count`/`max_retries` exist in `comms_delivery_queue` — undrained. |
| **Failure handling** | Best case = HTTP 500 + `console.error`. No classification, no alerting, no persistence. |
| **Rate/quota handling** | **None anywhere.** No 429 branch, no `Retry-After`, no quota-header read. The 429s in `app/api/members/*` are Soullab's *inbound* limiter, unrelated. |
| **Template ownership** | Soullab owns 100% — but as **inline string literals inside route handlers**. No template table, no template directory, no versioning. Brand markup is copy-pasted across ~26 files. |
| **Provider coupling** | Total on the platform path. Partial abstraction on the practitioner path. |
| **Intent vs transport** | **Not separated on the platform path.** `lib/comms/providers/types.ts` separates them correctly — for practitioners only. |

Nothing was refactored. No file was modified. Working tree remains clean.

---

## 3. REQUIREMENTS

### 3.1 Critical — transactional identity (must not degrade)

| Requirement | Current status |
|---|---|
| signup verification | ✅ delivers · ❌ **lies on failure** |
| login / magic link | ✅ delivers · ❌ **lies on failure** |
| password reset | ✅ delivers · ❌ **lies on failure** |
| account recovery | ✅ delivers · ❌ **lies on failure** · ⚠️ emails plaintext passkey |
| security communication | ⚠️ `alertEngine` discards result — a failed security alert is indistinguishable from a sent one |
| low-latency delivery | ✅ synchronous send, acceptable |
| **provider acceptance evidence** | ❌ **absent** — the core gap |

### 3.2 Future — relational / product

MAIA follow-up · practitioner & member notifications · session reminders · invitations · community · in-app inbox · push · optional SMS · member-controlled preferences.

Partial substrate exists: `member_notification_preferences`, `InboxService`, `ThreadService`, Twilio/WhatsApp/Telegram providers, `sms_delivery_status`. All practitioner-scoped or undrained.

### 3.3 Future — business

Newsletters · announcements · campaigns · onboarding sequences · education · events · segmentation · contact lifecycle.

**Currently: none.** Bulk sends run through one-off `scripts/send-*.ts` files executed by hand. No contact model, no unsubscribe, no segmentation, no suppression.

⚠️ **These scripts send to member lists with no consent gate and no unsubscribe header.** That is a live compliance exposure independent of the architecture question (§11).

### 3.4 Agentic — exploration only

```
event → communication intent → consent/policy → channel selection → delivery → receipt
```

Recorded as future architectural relevance. **No agent-initiated outbound authority is granted, proposed, or implied.** See §15.

### 3.5 Sovereignty requirements

Soullab must own: communication **intent**, **consent/preferences**, **routing policy**, **templates**, **history**, **delivery evidence**.

Soullab need not own: SMTP daemons, IP reputation, DNS-level deliverability, bounce-protocol parsing.

Per the Anchor: *sovereignty is not the same as operating infrastructure.* Self-hosting a mail server is an infrastructure choice, not automatically an ethical one; the ethical requirement is that no third party can hold Soullab's members hostage or become unreplaceable.

---

## 4. ARCHITECTURAL PRINCIPLES (as applied here)

1. **Provider replaceability** — application code must not import `resend`. Currently 13 route files do.
2. **Sovereignty** — own intent, consent, policy, templates, history, evidence. Do not conflate with running SMTP.
3. **Truthful state** — `attempted ≠ accepted ≠ delivered`, represented as three distinct facts. Currently all three are collapsed into one `console.log`.
4. **Provenance** — communication id, originating event, recipient, channel, template+version, provider, provider message id, `requested_at`, `accepted_at`, delivery state, failure class, retry state. Never message bodies (Sanctuary: minimal metadata, never content). `lib/email/sendEmail.ts` already models this discipline correctly in its logging.
5. **Failover** — evaluated in §9. Warranted for auth only, and only after truthfulness lands.
6. **Consent** — authentication email is *not* consent-gated (it is member-initiated and service-essential); marketing email *must* be. These must never share a code path or a suppression list.
7. **Privacy** — member email addresses are the PII crossing the boundary. §11.
8. **Operational burden** — Soullab is a one-person operation. An architecture that creates a full-time infrastructure job is disqualified regardless of score.

---

## 5. CANDIDATE EVALUATION

### Resend — *managed email transport*

- **Transactional reliability**: good. Established, well-regarded for developer transactional email. No repository evidence of delivery failure other than the quota rejection.
- **API ergonomics**: excellent — and its `{ data, error }` non-throwing contract is precisely what the current code misuses. The ergonomics did not cause the bug; unenforced adoption did.
- **Observability**: dashboard-side logs, 30-day retention on Free/Pro, delivery webhooks available — **none currently consumed by Soullab**.
- **Pricing/quota**: Free = 3,000/mo **and ≤100/day**. Pro = $20–$35/mo for 50k–100k. Scale = $90 (100k) → $1,150 (2.5M). **Paid plans include pay-as-you-go overages**, so `monthly_quota_exceeded` is essentially a free-tier-only failure mode. ([pricing](https://resend.com/blog/new-free-tier), [overage](https://resend.com/changelog/pay-as-you-go-pricing))
- **Domain support**: `soullab.life` verified; `SENDERS` defines 7 identities on it.
- **Webhooks**: supported. Not wired.
- **Vendor coupling**: *currently severe* — 13 route files import the SDK. But this is Soullab's coupling, not Resend's lock-in. There is no proprietary data format, no stored state on Resend that Soullab needs back.
- **SDK openness vs service openness**: SDK is MIT and open. **The service is proprietary.** Do not confuse the two.
- **Migration cost**: behind an adapter, ~1 file. Today, ~26 files.
- **Verdict**: **entirely suitable as one transport behind a Soullab abstraction.** The evaluation must not reject Resend for a quota condition caused by remaining on a free plan.

### AWS SES — *low-level managed transport*

- **Cost**: $0.10/1,000 — cheapest at any Soullab-plausible volume. ($10 at 100k/mo.)
- **Deliverability responsibility**: shifts substantially to Soullab. Reputation, bounce/complaint rates, and sandbox exit are Soullab's problem.
- **Operational burden**: meaningful. Sandbox removal request, DKIM/SPF/DMARC, configuration sets, SNS topics for events, bounce/complaint handling (mandatory — AWS suspends accounts over unhandled complaint rates).
- **Failover usefulness**: **high.** Genuinely independent infrastructure from Resend, near-zero fixed cost when idle. This is SES's strongest role for Soullab.
- **Sovereignty note**: SES is AWS. It reintroduces exactly the hyperscaler dependency the Anchor's infrastructure section deliberately avoids. Acceptable as a *secondary* transport; a values regression as a *primary*.
- **Verdict**: **excellent fallback, poor primary** for Soullab specifically.

### Postmark — *transactional-delivery specialist*

- **Reliability/deliverability**: the strongest reputation in the category for transactional inbox placement.
- **Simplicity**: high. Enforces separate transactional and broadcast message streams — a *structural* version of §14's discipline.
- **Cost**: $15/mo for 10k; ~$1.50/1,000 at 10k scaling to ~$0.81/1,000 at 300k. Roughly 10× SES, comparable to Resend at low volume, more expensive above ~50k.
- **Observability / delivery evidence**: excellent — full event webhooks, 45-day searchable activity.
- **Value relative to Resend**: better deliverability record and better stream separation; higher unit cost; less pleasant SDK.
- **Verdict**: **the strongest fallback candidate on quality grounds**, the strongest primary candidate if auth deliverability ever becomes the binding constraint. Not worth a migration today.

### Plunk — *open-source email platform*

- **License**: **AGPL-3.0.** Genuinely open source.
- **Self-hostable**: yes, Docker image published.
- **Critical dependency**: **Plunk is built on top of AWS SES and requires it.** It is a control plane, not a transport. Self-hosting Plunk therefore *adds* an AWS SES dependency plus AWS SNS for event ingestion — it does not remove a vendor, it inserts a layer above one.
- **Provides**: transactional send, campaigns, contacts, workflows, analytics, custom domains with DKIM/SPF.
- **Operational burden**: a Node service + its own Postgres/Redis on minisforum, plus AWS account and SES/SNS configuration, plus upgrades and security patching.
- **Maturity**: small project, small maintainer base. For the **authentication critical path** this is a material risk.
- **Sovereignty**: AGPL self-hosting is real sovereignty over *contacts, campaigns, and analytics data*. It is **not** sovereignty over transport.
- **Verdict**: **would answer a real future gap (business/marketing communication, which Soullab has none of).** It answers *nothing* about today's incident, and putting it on the auth path would be strictly worse than Resend. **This is the candidate most likely to be mistaken for a sovereignty win. It is not one at the transport layer.**
- **Explicit correction of a tempting assumption**: self-hosted ≠ sovereign when the self-hosted thing hard-requires a hyperscaler underneath it.

### Novu — *multi-channel orchestration*

- **License**: **open core.** Core API, worker, WebSocket service, embeddable Inbox, provider integrations, and workflow engine are **MIT**. The `/enterprise` directory and certain dashboard modules are under a **proprietary Enterprise licence that forbids redistribution, third-party hosting, and modification without written approval**. SSO, RBAC, HIPAA BAA, and data residency are commercial-tier.
- **Self-hostable**: yes (Community Edition), but the deployment is substantial: API + worker + WebSocket + dashboard + MongoDB + Redis + object storage. On minisforum that is a **materially larger operational footprint than the entire current email surface**.
- **Provider abstraction**: strong, with first-class Resend and SES integrations — exactly the L4/L5 separation §4 asks for.
- **Capabilities Soullab would otherwise build**: workflow engine, subscriber + preference model, in-app inbox, digest/batching, quiet hours, multi-channel routing, failover between providers, delivery activity feed. **This is the largest genuine capability answer of any candidate.**
- **Agent-oriented model**: Novu markets communication infrastructure for agents — architecturally adjacent to §15's future question.
- **Operational complexity**: **the disqualifying dimension today.** MongoDB + Redis + four services, self-hosted, on the auth critical path, run by one person.
- **Verdict**: **the right answer to a question Soullab does not yet have.** Soullab has ~10 transactional email types, no in-app inbox demand, no push, no campaigns. Adopting Novu now would mean operating a notification platform to send a six-digit code. Revisit when multi-channel is a real product requirement — and note that a well-built Soullab adapter (§13) makes Novu a *later, cheap* substitution rather than a rewrite.

### Postal — *self-hosted mail transport*

- Full MTA. Requires: dedicated IP with clean history, PTR/rDNS control, SPF/DKIM/DMARC operation, IP warming over weeks, bounce/FBL/complaint loop handling, blocklist monitoring, abuse and security response, and 24/7 availability for authentication mail.
- Residential/small-office egress IPs are widely blocklisted for SMTP; major providers apply heavy scrutiny to new sending IPs.
- **Verdict: DISQUALIFIED for the authentication path.** Placing signup and password-reset delivery behind an unwarmed, self-operated MTA converts a solved problem into a continuous operational liability with a member-facing failure mode. The sovereignty gain is symbolic; the reliability loss is real. This is the clearest case where sovereignty-as-infrastructure would actively harm members.

### Other candidates

**None added.** Every named candidate covers a distinct architectural role (managed transport / low-level transport / deliverability specialist / open control plane / orchestration / self-hosted MTA). No capability gap remains that would justify inflating the list.

Worth *naming but not evaluating*: the real gap Soullab has is **business/lifecycle communication** (§3.3), which no current system covers. That gap is a LATER decision (§16), and Plunk is its leading candidate — not a NOW one.

---

## 6. LAYER MAP (required artifact)

```
LAYER                                SOULLAB TODAY            RESEND   NOVU   PLUNK   SES/POSTMARK
─────────────────────────────────────────────────────────────────────────────────────────────────
L0  Application comm. intent         ✅ owns (scattered in       —      —      —          —
                                        26 call sites, no
                                        intent type)
L1  Comm. policy / consent           ◐ partial:                  —     ✅     ✅          —
                                        member_notification_
                                        preferences exists,
                                        unused by email paths
L2  Workflow / orchestration         ❌ none (comms_delivery_    —     ✅     ✅          —
                                        queue built, undrained,
                                        practitioner-bound)
L3  Templates / content              ✅ owns — as inline        ◐      ✅     ✅         ◐
                                        literals in routes    (react)
L4  Channel routing                  ◐ practitioner path only:   —     ✅     ◐          —
                                        emailRouter managed/BYO       (email/
                                        + Twilio/WA/Telegram          sms/push/
                                        providers                     inbox/chat)
L5  Provider transport               ❌ none (direct SDK)       ✅      —      ❌         ✅
                                                                            (needs SES)
L6  Delivery / event telemetry       ❌ none for platform email ✅     ✅     ✅         ✅
                                        (no webhook endpoint;  (unused)
                                        comms_webhooks_log
                                        table exists, unused)
L7  Comm. history / analytics        ◐ comms_delivery_queue     ◐      ✅     ✅         ◐
                                        schema exists,      (30d,
                                        no platform rows    vendor-held)
```

**Reading of the map.** Soullab owns L0 and L3 — the two layers it *should* own — but owns them **badly** (scattered, unversioned, duplicated), not insufficiently. It owns L1 partially and correctly in schema. **The genuine holes are L5 (no adapter — the coupling defect) and L6 (no delivery evidence — the truthfulness defect).**

Both holes are small. Neither requires a new vendor.

---

## 7. TESTING THE CORE HYPOTHESIS

The proposed direction —

```
AIN/MAIA/Soullab → Communication Intent API → Consent+Policy → Orchestrator → Channel → Transport
```

— is **correct as a target shape and wrong as a next step.**

It is correct because it names exactly the two missing layers (L5, L6) and preserves intent/acceptance/delivery separation.

It is wrong as a next step because Soullab's current problem is not that it lacks an orchestrator. **Soullab already built an orchestrator-shaped substrate and never drained the queue.** Adding a second, larger orchestration layer above an unadopted one would repeat the exact failure that produced this incident: *build the right abstraction, then route around it.*

The binding constraint is **adoption enforcement**, not capability.

### Architecture options

**A — Keep Resend directly (fix errors in place).** Add result inspection to 13 call sites. Smallest possible change. Leaves 26-file coupling, no delivery evidence, and — decisively — **no structural prevention of recurrence.** The 27th call site reintroduces the bug. The repo has already proven this: `sendEmail.ts` was written *because* the bug recurred, and the bug recurred *again* after it was written.

**B — Thin Soullab adapter + Resend.** Promote `lib/email/sendEmail.ts` to the single boundary. Add a typed intent (`kind`, `recipient`, `payload`), a `communication_id`, a `communications` delivery record, and — critically — **a lint/CI rule forbidding `import ... from 'resend'` outside the adapter.** Provider swap becomes a one-file change. `attempted / accepted / delivered` become three persisted states. Genuinely small: the adapter is already written and already correct.

**C — B + SES fallback for auth only.** Adds a second transport behind the same adapter, used only for `kind: 'authentication_*'` on primary failure. Removes single-vendor auth risk. Costs: AWS account, SES verification + sandbox exit, DKIM for a second sending path, a second reputation to maintain, and a values question about reintroducing AWS.

**D — Novu orchestration.** Correct destination, wrong decade. Four services + MongoDB + Redis on minisforum for ~10 email types. **Disqualified on operational burden today, not on merit.**

**E — Plunk + SES.** Replaces a proprietary managed transport with a small AGPL control plane over a hyperscaler transport. Increases operational surface, decreases auth-path reliability confidence, and **does not deliver transport sovereignty**. Real value only for the business-communication gap Soullab has not yet reached.

**F — Hybrid: B now, with the adapter shaped so C, D, or E is a later one-file substitution.** The adapter's interface is the durable asset; the transport behind it is disposable.

**G — none identified** that the evidence supports over F.

---

## 8. THE SOVEREIGNTY QUESTION, ANSWERED PER ARCHITECTURE

| | **What Soullab owns** | **What the vendor owns** | **Data leaving Soullab** | **Provider replaceable without touching routes?** | **Survives one vendor failing?** | **New infra Kelly operates** | **Real sovereignty gain?** |
|---|---|---|---|---|---|---|---|
| **A** | intent, templates, consent | transport, all delivery evidence | member email, subject, body | ❌ **no** — 26 files | ❌ no | none | ❌ **none** |
| **B** | intent, templates, consent, **history, evidence, policy** | transport only | member email, subject, body | ✅ **yes** — 1 file | ❌ not yet | none | ✅ **material** |
| **C** | same as B | transport ×2 | same, to two vendors | ✅ yes | ✅ **yes** (auth) | AWS acct + SES/DKIM/bounce handling | ✅ material + resilience; ⚠️ AWS dependency |
| **D** | intent, templates, consent, history, orchestration | transport; **enterprise features proprietary** | member email + **full subscriber profiles into self-hosted Mongo** | ✅ yes | ✅ yes | **Novu API+worker+WS+dashboard, MongoDB, Redis** | ◐ moves dependency from vendor to self-run platform |
| **E** | contacts, campaigns, analytics, templates | **AWS SES owns transport**; Plunk owns nothing (AGPL, self-run) | member email → **AWS**; contacts → self-hosted Plunk DB | ◐ Plunk is SES-bound | ❌ no (SES is single point) | **Plunk service + DB + AWS SES/SNS** | ❌ **illusory at transport**; real for contacts |
| **F** | B today, optionality preserved | transport only | member email, subject, body | ✅ yes | deferrable to C | none today | ✅ **material, with no burden** |

**Does this strengthen AIN's sovereignty materially, or merely move dependencies around?**

- **A**: neither. It patches symptoms.
- **B/F**: **materially.** Soullab gains, for the first time, its own record of what it tried to send, what a provider accepted, and what failed — held in Soullab's own Postgres, on Soullab's own hardware, under Soullab's own retention rules. That record is the sovereign asset. The transport is a commodity.
- **C**: B's gain plus vendor-failure survival, paid for with an AWS dependency.
- **D/E**: **move dependencies around.** They convert *vendor operational risk* into *self-operated infrastructure risk* while leaving the actual defect — the application lying about state — completely untouched. Neither D nor E would have prevented this incident.

**Stated plainly, because §8 demands it: "open source" is not a proxy for sovereignty.** Plunk is AGPL and *requires AWS*. Novu is MIT-cored with a proprietary enterprise ring and would put a hyperscaler-scale platform on a one-person ops budget. Resend is proprietary and holds *nothing Soullab needs back*. Sovereignty here is measured by **replaceability and self-held evidence**, not by licence text.

---

## 9. RELIABILITY / FAILURE MODEL

| Failure | **A / today** | **B / F (adapter)** | **C (+fallback)** |
|---|---|---|---|
| **provider quota exceeded** | user: "check your email" (**false**); Soullab: nothing; no retry; no fallback; **operator cannot diagnose** | user: honest error + retry option; Soullab: `communications` row `accepted=false, failure_class='quota'`; alertable | fallback transport sends; user unaffected |
| **provider API unavailable** | same silent false success | honest failure, recorded, retryable | fallback |
| **provider key invalid** | silent false success | recorded `failure_class='auth'`; loud | fallback + alert |
| **domain verification failure** | silent false success | recorded `failure_class='domain'` | ⚠️ fallback needs its **own** verified domain — must be pre-configured or it fails too |
| **rate limit (429)** | silent false success | recorded; `Retry-After` honoured on retry | fallback or backoff |
| **template error** | 500 or malformed send | caught at adapter, recorded pre-send | same |
| **network timeout** | ⚠️ `catch` **does** fire here → honest 500 (the one case today's code handles) | recorded; retry-safe | fallback |
| **accepted but delivery later fails** (bounce) | **invisible** — no webhook | **requires webhook ingestion** (Phase 3); until then `accepted` is the terminal known state, *and is labelled as such* | same |
| **provider webhook unavailable** | n/a (none) | delivery state stays `accepted`; **never silently upgraded to `delivered`** | same |
| **primary provider outage** | total auth email outage, silent | total outage, **loud and recorded** | **survivable** |
| **duplicate retry** | n/a (no retry) | idempotency via `communication_id` | same |
| **recipient suppressed / bounced** | invisible; repeated sends to a dead address damage reputation | recorded once webhooks land | needs a **shared** suppression list across both providers — else a fallback re-sends to a suppressed address ⚠️ |

**The critical rule, enforced structurally:**

```
INTENTION  ≠  ACCEPTANCE  ≠  DELIVERY
requested_at  accepted_at + provider_message_id   delivered_at (webhook only)
```

Today all three collapse into `console.log('Code sent to ...')`. **In every architecture that improves on today, they must be three columns, and `delivered_at` must remain NULL until a webhook says otherwise.** An architecture that infers delivery from acceptance reintroduces the same lie one layer up.

---

## 10. COST MODEL

Provider fees, USD/month. *Soullab's realistic near-term volume is well under 5,000/month.*

| Volume/mo | Resend | AWS SES | Postmark | Novu CE (self-host) | Plunk (self-host) + SES |
|---|---|---|---|---|---|
| **1,000** | **$0** (free — but ≤100/day cap) | ~$0.10 | $15 | $0 lic. + infra | $0 lic. + ~$0.10 SES |
| **5,000** | **$20** (Pro; free tier exceeded) | ~$0.50 | $15 | $0 + infra | ~$0.50 |
| **25,000** | **$20** (Pro) | ~$2.50 | ~$40–55 | $0 + infra | ~$2.50 |
| **50,000** | **$20** (Pro base) | ~$5 | ~$65–85 | $0 + infra | ~$5 |
| **100,000** | **$35–90** (Pro top / Scale) | ~$10 | ~$105 | $0 + infra | ~$10 |

*Sources: [Resend pricing](https://resend.com/blog/new-free-tier) · [SES/Postmark comparison](https://www.courier.com/integrations/compare/amazon-ses-vs-postmark). Postmark mid-tier figures interpolated from published per-1,000 rates; treat as indicative.*

**Non-provider costs (the ones that actually decide this):**

| | Infra cost | Operational time |
|---|---|---|
| **A** | $0 | ~2h now, **recurring** (bug reintroduced at each new call site) |
| **B / F** | $0 | ~1–2 days once; ~0 ongoing |
| **C** | $0 + SES usage | +1 day setup; ongoing bounce/complaint handling + second reputation |
| **D (Novu)** | minisforum RAM/disk for 4 services + MongoDB + Redis | **days to stand up; ongoing upgrades, Mongo backups, security patching — a standing operational commitment** |
| **E (Plunk+SES)** | Plunk service + DB + AWS account | days to stand up; ongoing patching + SES reputation |

**The decisive line.** The gap between Resend Pro ($20/mo) and SES (~$0.50/mo) at Soullab's volume is **under $20/month**. Novu or Plunk would consume days of setup and a permanent share of a one-person ops budget **to save less than the cost of a lunch**. Per §10's own instruction — do not optimise for fractions of a cent while multiplying operational burden — **cost is not a live variable in this decision.** Anyone arguing SES-over-Resend on price at these volumes is optimising the wrong quantity.

---

## 11. SECURITY & PRIVACY REVIEW

*(No secret values were read, printed, or transmitted at any point in this evaluation.)*

| Area | Finding |
|---|---|
| **API-key custody** | Single `RESEND_API_KEY` in `.env.production` on minisforum, read via `process.env` at 30 sites. No rotation procedure in repo. Practitioner BYO keys are **encrypted at rest** in `practitioner_comms_credentials.credentials_encrypted` with `key_version` — a *good* pattern the platform key does not follow. |
| **Secrets management** | env-file based. Acceptable for the deployment model; note there is no key-rotation runbook. |
| **PII sent externally** | Member email address, display name, and full message body (including **six-digit auth codes**, magic-link tokens, and password-reset tokens) transit to Resend and are retained in Resend's dashboard for 30 days. |
| **🔴 Plaintext passkey by email** | `app/api/members/recover/route.ts` emails **`PASSKEY: ${member.passkey}` and `USERNAME: ${member.username}` in plaintext**. That credential is then held in Resend's 30-day log and in the recipient's mailbox indefinitely. **This is the most serious privacy finding in this evaluation** and is independent of any architecture choice. Standard practice is a single-use, short-expiry recovery link — never the credential itself. |
| **Retention** | Soullab retains **nothing** about platform email (no rows). Resend retains 30 days. Inverted: the vendor has the record and Soullab does not. |
| **Logs** | `lib/email/sendEmail.ts` logs structural metadata only and explicitly refuses subject/body — **Sanctuary-compliant, correctly reasoned in its own comments**. Ad-hoc routes log recipient addresses in plaintext to container logs (e.g. `[EMAIL-CODE] Code sent to ${normalizedEmail}`). Acceptable within a sovereign stack; worth a retention policy. |
| **Telemetry** | `trackOnboarding({ event: 'magic_link_sent' })` fires on **attempt**. Downstream onboarding funnel data is therefore **known-corrupt** for any period of provider failure. |
| **Webhook authentication** | No email webhook exists. `verifyWebhookSignature` is defined on `CommsProvider` and implemented for Twilio (`lib/comms/twilioSignature.ts`) — the pattern is available when email webhooks are wired. |
| **Replay protection** | Not applicable yet; **must** be designed in with webhook ingestion (`comms_webhooks_log` exists for this). |
| **🔴 Unsubscribe / preferences** | `member_notification_preferences` exists and **no email path consults it**. `scripts/send-beta-update-email.ts`, `send-maia-ready-email.ts`, `send-passkey-reminder.ts`, `send-steward-invitation.ts` send to member lists **with no consent check and no `List-Unsubscribe` header**. This is a compliance exposure (CAN-SPAM / GDPR) *and* a direct tension with the Anchor's consent vows. |
| **Suppression lists** | None held by Soullab. Bounces and complaints are invisible; a hard-bounced address will be re-sent to indefinitely, degrading domain reputation for the auth path. |
| **Provider account isolation** | Auth email, ops alerts, security alerts, beta blasts, and practitioner managed-mode email **all share one Resend account and one quota pool**. A beta-announcement blast can therefore exhaust the quota that signup codes depend on. **This is almost certainly the mechanism of the present incident** and is an architectural fault independent of vendor. |

**Flagged as incompatible with Soullab's stated sovereignty/privacy commitments:**

1. Plaintext passkey transmission and vendor-side retention (`recover/route.ts`).
2. Bulk member sends with no consent gate and no unsubscribe, while a consent table sits unused.
3. Authentication email sharing a quota pool with marketing email.
4. Analytics recording delivery events that did not occur.

---

## 12. OPEN-SOURCE VERIFICATION

| Candidate | Classification | Evidence |
|---|---|---|
| **Resend** | **PROPRIETARY SERVICE + OPEN SDK** | `resend-node` is MIT and public. The service is closed, hosted, commercial. **Do not describe Resend as open source.** |
| **AWS SES** | **PROPRIETARY SERVICE** | Closed AWS service; SDKs Apache-2.0. |
| **Postmark** | **PROPRIETARY SERVICE** | Closed, hosted, commercial; open client libraries. |
| **Plunk** | **OPEN SOURCE (AGPL-3.0)** — with a hard proprietary dependency | `useplunk/plunk`, AGPL-3.0, Docker images published. **Requires AWS SES to function.** The open licence is real; it does not extend to the transport. |
| **Novu** | **OPEN CORE** | `novuhq/novu`. Core (API, worker, WebSocket, Inbox, provider integrations, workflow engine) **MIT**. `/enterprise` directory and certain dashboard modules under a **proprietary Enterprise licence forbidding redistribution, third-party hosting, and unapproved modification**. SSO, RBAC, HIPAA BAA, data residency are commercial-tier. **Novu's own marketing says "open-source"; the accurate term is open core.** |
| **Postal** | **OPEN SOURCE (MIT)** | Genuinely open, genuinely self-hostable, genuinely a full-time job. |

**Terminology discipline applied.** Two candidates market themselves in ways this report deliberately does not repeat: Resend's SDK openness is not service openness, and Novu's MIT core is not a fully open product. Neither observation disqualifies either tool — but the sovereignty argument in §8 must be made on **replaceability**, not on licence marketing.

---

## 13. MIGRATION ANALYSIS (estimation only — NOT AUTHORIZED)

**Target call shape** — as §13 proposes, and close to what `lib/email/sendEmail.ts` already accepts:

```ts
await sendCommunication({
  kind: 'authentication_code',   // typed union — drives policy, template, transport class
  recipient,                     // member id or address
  payload,                       // template variables only — never rendered markup
});
// → { communicationId, accepted: boolean, providerMessageId?, failureClass? }
```

**Should Soullab introduce these?**

| Component | Verdict |
|---|---|
| communication service/module | **Yes** — 90% exists as `lib/email/sendEmail.ts`; needs a typed `kind` and a persisted record |
| provider adapter | **Yes** — the `CommsProvider` interface in `lib/comms/providers/types.ts` is already the right shape; it needs a platform-scoped (non-practitioner) variant |
| communication ids | **Yes** — smallest change with the largest observability return |
| delivery records | **Yes** — but as a **new platform-scoped table**, not by loosening `comms_delivery_queue`'s `practitioner_id NOT NULL`. Loosening it would blur two consent regimes into one table |
| webhook ingestion | **Later** — required before any claim of `delivered`; `comms_webhooks_log` already exists |
| retry worker | **Later** — and *not* for auth codes, which are user-retriable by design and should fail fast and honestly |
| provider failover | **Later** — only after truthfulness and evidence land. Failover on top of a system that cannot detect failure is inert |

**Smallest safe migration — staged (estimates only):**

- **Phase 0 — Truth (hours).** Inspect the result at the 4 auth call sites + `alertEngine`. Return honest errors. Move `trackOnboarding` after confirmed acceptance. *Zero new dependencies, zero schema change, fully reversible.* This alone would have surfaced the incident on day one.
- **Phase 1 — Boundary (~1–2 days).** Route all platform email through `sendEmail()`. Add typed `kind`. Add a CI/lint rule: **`import ... from 'resend'` is forbidden outside `lib/email/` and `lib/comms/providers/`.** *The lint rule is the load-bearing part* — without it, Phase 1 decays exactly as `sendEmail.ts` already did.
- **Phase 2 — Evidence (~1–2 days).** Platform-scoped `communications` table: `communication_id`, `kind`, originating event, recipient ref, channel, template + version, provider, `provider_message_id`, `requested_at`, `accepted_at`, `delivered_at NULL`, `failure_class`, `retry_state`. **No message bodies.** Extract templates out of route handlers into versioned modules.
- **Phase 3 — Delivery truth (~2–3 days).** Resend webhook endpoint with signature verification and replay protection → populate `delivered_at` / bounce / complaint → Soullab-held suppression list. Only after this may the system say *delivered*.
- **Phase 4+ — Optional, gated.** Separate Resend accounts (or at minimum separate quota governance) for transactional vs bulk. Then, if and only if a real requirement appears: SES fallback for auth (C), or Novu (D) when multi-channel becomes a product need, or Plunk (E) when business communication becomes a product need.

**None of this is implemented in JARVIS-COMMS-01. No file was modified. Working tree clean at `be5b3b8`.**

---

## 14. AUTHENTICATION SEPARATION

**Answer to §14's question: yes — the first communication boundary should cover transactional account email only.**

Reasons grounded in this evaluation:

1. It is where the incident is, and where the truthfulness defect is proven.
2. It is ~10 message types across 5 routes — small enough to complete without a platform build.
3. Auth email is **not consent-gated** (member-initiated, service-essential); marketing email **must be**. Fusing them into one pipeline forces a single consent regime onto two genuinely different obligations.
4. §11 found auth email sharing a quota pool with beta blasts — the plausible mechanism of this incident. Separation is a **reliability** control, not just a tidiness preference.
5. A marketing/campaign system on the auth path adds failure modes (segmentation, unsubscribe, suppression, scheduling) to the path that must never fail.

**Explicit constraint for any future work: no marketing, campaign, or workflow architecture may share a code path, a provider account, a quota pool, or a suppression list with login, signup, recovery, or reset.**

---

## 15. RELATIONSHIP TO MAIA / AIN

*Recorded as future architectural relevance only. Nothing here is proposed for implementation.*

Today MAIA has **no outbound communication path whatsoever** — no service, no route, no queue. This is verified, not assumed. It is also **correct**, and it should not be treated as a gap to be closed by default.

> **If MAIA eventually needs to communicate with a person outside the active conversation, what policy boundary should govern that act?**

The relevant canon is `docs/canon/CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md`: **authority may only move upward through authored experience — never skipping a layer, never manufacturing higher-order meaning.** An unprompted outbound message is a system-initiated *Encounter*. A system that can initiate encounter can manufacture the conditions for its own relevance — which is precisely the attachment-capture the Anchor's vows forbid.

The interesting structural point: **the layered architecture recommended in §16 is what would make such a boundary expressible at all.** In today's architecture, "MAIA sent a message" and "a route called Resend" are the same event with no distinguishing record. In the target architecture, an outbound communication carries a `kind`, an originating event, a consent check, a template version, and an audit record — meaning the constraint *"MAIA may not originate an unprompted outbound communication"* becomes a checkable invariant rather than a matter of trust.

Future requirements to preserve if that day comes: member consent · practitioner permission · declared purpose · channel preference · quiet hours · urgency class · frequency caps · **human approval for any MAIA-originated send** · full auditability · member cancellation · provenance of the triggering event.

**The correct posture now: the architecture should make agent-initiated communication *representable and refusable*, not *possible*.** Building the boundary is not the same as opening the gate. No autonomous outbound authority is granted, designed, or implied by this evaluation.

---

## 16. RECOMMENDATION

### NOW (today — the incident)

**Two actions, in this order. Do not stop after the first.**

1. **Upgrade the Resend plan** (~$20/mo Pro). Paid plans carry pay-as-you-go overage, which converts `monthly_quota_exceeded` from a hard stop into a billing line. This restores delivery in minutes. *This is the smaller of the two fixes and must not be mistaken for the fix.*
2. **Make the four lying auth routes tell the truth.** Inspect the `{ data, error }` envelope in `email-code`, `magic-link`, `recover`, `reset-password` (and `lib/security/alertEngine.ts`). Return an honest error. Move `trackOnboarding` after confirmed acceptance. Hours of work, no dependencies, no schema change.

**Also now, and independently of architecture:** stop emailing plaintext passkeys in `recover/route.ts` (§11). That finding does not wait for a comms decision.

**Do not change providers today.** Resend did not fail — it correctly refused a request from an account over its free quota, and Soullab's code refused to look at the refusal.

### NEXT (weeks — remove coupling)

**Architecture B, realised as F.** Promote `lib/email/sendEmail.ts` to the sole platform email boundary; add a typed `kind`; add `communication_id` and a platform-scoped `communications` record separating `requested_at` / `accepted_at` / `delivered_at`; extract templates from route handlers.

**And the part that actually determines whether this holds: a CI rule forbidding `import ... from 'resend'` outside the adapter.** The repo has already run this experiment once — a correct helper was written, documented, and bypassed by 26 call sites. Without mechanical enforcement, Phase 1 decays into Phase 0 again. *The lint rule is the architecture.*

Then: Resend webhook ingestion, so `delivered` becomes a fact rather than an assumption, and so Soullab holds its own suppression list.

### LATER (months — only on a real requirement)

- **Postmark or SES as a second transport behind the adapter** — when auth deliverability or single-vendor risk becomes a demonstrated problem, not a hypothetical one. Postmark on quality, SES on independence and cost.
- **Novu** — when Soullab genuinely needs multi-channel (in-app inbox + push + SMS) with workflows, digests, and quiet hours. Behind the §13 adapter this is a substitution, not a rewrite. Note the open-core boundary (§12).
- **Plunk** — when *business* communication (newsletters, campaigns, contact lifecycle) becomes a real requirement. It answers that gap well. It answers nothing on the auth path.
- **Separate provider accounts** for transactional vs bulk, so a beta blast can never again consume the quota that signup depends on.

### NOT NOW (explicitly avoid)

- **Postal or any self-hosted MTA on the authentication path.** Symbolic sovereignty, real member harm. Disqualified.
- **Novu today.** Four services + MongoDB + Redis, self-operated, to send a six-digit code. Right destination, wrong decade.
- **Plunk as a "sovereign" replacement for Resend.** It requires AWS SES. Self-hosted ≠ sovereign when the self-hosted thing hard-requires a hyperscaler underneath it.
- **Migrating providers as the response to this incident.** The defect is Soullab's code, and it travels to any new provider intact.
- **Any agent-initiated outbound communication.** §15.
- **A communication "platform" build.** Soullab already built one (`lib/comms/`), scoped it to practitioners, never drained the queue, and then routed the critical path around it. Building a second, larger one before adopting the small correct one would repeat the exact failure this evaluation documents.

---

## 17. DECISION MATRIX

Scores 1–10 (10 best) for the four architectures that are live options. D and E are scored for completeness and carry disqualifying conditions.

| Dimension | **A** keep Resend | **B/F** adapter + Resend | **C** adapter + fallback | **D** Novu | **E** Plunk+SES |
|---|:--:|:--:|:--:|:--:|:--:|
| Reliability | 4 | 7 | 9 | 7 | 5 |
| Transactional email | 6 | 8 | 9 | 7 | 6 |
| Provider replaceability | 1 | 9 | 10 | 9 | 5 |
| Sovereignty | 3 | 8 | 8 | 7 | 6 |
| Privacy | 4 | 8 | 7 | 7 | 6 |
| Open-source integrity | 3 | 5 | 5 | 7 | 8 |
| Multi-channel future | 2 | 6 | 6 | 10 | 4 |
| Observability | 2 | 8 | 8 | 9 | 7 |
| Failover | 1 | 3 | 9 | 8 | 3 |
| Cost | 8 | 8 | 8 | 6 | 7 |
| Operational simplicity | 9 | 8 | 6 | **2** | **3** |
| MAIA/AIN fit | 3 | 8 | 8 | 7 | 5 |
| Migration difficulty | 10 | 8 | 6 | **2** | **3** |
| **Total** | **56** | **94** | **99** | **88** | **68** |

**Totals must not be read alone.** Named independently, as §17 requires:

### Disqualifying conditions

- **A — DISQUALIFIED for the medium term.** Scores 1/10 on provider replaceability and, decisively, **provides no structural prevention of recurrence.** The repo has already demonstrated that the correct helper alone does not hold. A is acceptable *only* as the Phase-0 emergency fix inside a plan that continues to B.
- **C — carries a hidden prerequisite.** Its 9/10 failover is only real if the fallback transport has its **own verified sending domain, its own DKIM, and a suppression list shared with the primary.** Without those, "failover" fails identically to the primary and delivers a false sense of resilience. C is also blocked behind B: **failover on top of a system that cannot detect failure is inert.** Its 99 total is a *destination*, not a next step.
- **D (Novu) — DISQUALIFIED today on operational burden (2/10 twice).** MongoDB + Redis + four services on a one-person ops budget, placed under the authentication path, to serve ~10 email types. Its 88 is genuine and its 10/10 multi-channel is genuine — which is exactly why the §13 adapter should be shaped to make D a cheap later substitution.
- **E (Plunk+SES) — DISQUALIFIED as presented.** Its 8/10 open-source integrity is accurate and **misleading in context**: the AGPL licence does not cover the transport, which is AWS SES. It scores 3/10 on failover because SES becomes a single point of failure. It would not have prevented this incident. Its real value is the *business communication* gap, which is a LATER question.
- **Postal — DISQUALIFIED outright**, not scored. Placing authentication delivery behind an unwarmed self-operated MTA converts a solved problem into a permanent operational liability with a member-facing failure mode.

**Winner on evidence: F — architecture B built so that C, D, or E is a later one-file substitution.**

The adapter interface is the durable asset. The transport behind it is disposable. That is what replaceability *means*, and it is the only form of sovereignty available here that does not cost Kelly a second job.

---

## 18. TARGET ARCHITECTURE

```
                        MAIA / AIN / SOULLAB
                                 │
                     ┌───────────┴───────────┐
                     │  COMMUNICATION INTENT │      ← Soullab owns (L0)
                     │  sendCommunication({  │        typed `kind` — the only
                     │    kind, recipient,   │        entry point; enforced by
                     │    payload })         │        CI lint, not convention
                     └───────────┬───────────┘
                                 │
              ┌──────────────────┴──────────────────┐
              │                                     │
     ┌────────┴─────────┐                 ┌─────────┴──────────┐
     │  TRANSACTIONAL   │                 │    RELATIONAL      │   ← §14: never
     │  auth · security │                 │  notifications ·   │     share a path,
     │  NOT consent-    │                 │  reminders ·       │     an account,
     │  gated (member-  │                 │  invitations       │     a quota, or a
     │  initiated,      │                 │  CONSENT-GATED     │     suppression list
     │  service-        │                 │  member_notif_     │
     │  essential)      │                 │  preferences (L1)  │
     └────────┬─────────┘                 └─────────┬──────────┘
              │                                     │
              └──────────────────┬──────────────────┘
                                 │
                     ┌───────────┴────────────┐
                     │  TEMPLATES (versioned) │      ← Soullab owns (L3)
                     │  extracted from routes │        content never leaves
                     └───────────┬────────────┘        as stored state
                                 │
                     ┌───────────┴────────────┐
                     │  COMMUNICATION RECORD  │      ← Soullab owns (L6/L7)
                     │  communication_id      │        ★ THE SOVEREIGN ASSET ★
                     │  requested_at          │        self-held, own Postgres,
                     │  accepted_at   ← 429 / │        own retention, own hardware
                     │                  quota │
                     │                  lands │        INTENTION ≠ ACCEPTANCE
                     │                  HERE  │                  ≠ DELIVERY
                     │  delivered_at (webhook │        three columns, never
                     │                only —  │        one inference
                     │                NULL    │
                     │                until)  │        NO MESSAGE BODIES
                     │  failure_class         │        (Sanctuary: metadata only)
                     │  provider_message_id   │
                     └───────────┬────────────┘
                                 │
                     ┌───────────┴────────────┐
                     │   PROVIDER ADAPTER     │      ← the replaceability seam (L5)
                     │   CommsProvider iface  │        `import 'resend'` FORBIDDEN
                     │   (already exists in   │        above this line — CI-enforced
                     │    lib/comms/providers)│
                     └───────────┬────────────┘
                                 │
                     ┌───────────┴────────────┐
                     │   RESEND (transport)   │      ← vendor owns ONLY this
                     │   proprietary service, │        holds nothing Soullab
                     │   open SDK             │        needs back
                     └───────────┬────────────┘
                                 │
                     ┌───────────┴────────────┐
                     │  WEBHOOK INGESTION     │      ← Soullab owns (L6)
                     │  signature verified,   │        the only thing permitted
                     │  replay-protected      │        to write delivered_at
                     │  → suppression list    │        (self-held, cross-provider)
                     └────────────────────────┘

    ┅┅┅┅┅┅┅┅┅┅ deferred, not built, gated on real requirement ┅┅┅┅┅┅┅┅┅┅
    at the ADAPTER seam:  + SES / Postmark fallback (auth only)   → C
    above the ADAPTER:    + Novu orchestration (multi-channel)    → D
    beside the ADAPTER:   + Plunk (business/campaign comms)       → E
    ┅┅┅┅┅ each is a one-file substitution IF the seam is built now ┅┅┅┅┅
```

---

## WHY

Soullab does not have a vendor problem. It has a **truthfulness** problem and an **enforcement** problem.

The truthfulness problem: four of five authentication email routes discard the provider's answer and report success regardless. A member is told to check their email for a code that was never accepted, never sent, and never recorded as failed. The analytics say it was delivered. The logs say it was delivered. Nothing in the system knows otherwise. On the path that governs a member's access to their own account, the system reports a state it never verified.

The enforcement problem is why the first one persists. **The correct fix already exists in this repository.** `lib/email/sendEmail.ts` inspects the error envelope, logs structurally, never throws, and its own header comment explains this exact bug class — because the bug had already recurred once before. It has one adopting caller. Twenty-six call sites construct their own Resend client and route around it.

That is the finding. A correct abstraction, written deliberately, documented clearly, and then bypassed. Adding a larger abstraction above it would not change the outcome; the same thing already happened one layer down, where `lib/comms/` holds a full provider interface, a delivery queue with `sent_at` and `delivered_at` as separate columns, retry counters, and a webhook log — built, migrated, practitioner-scoped, and never drained.

So the recommendation is deliberately small, and its load-bearing element is not a component. It is the **CI rule** that makes `import ... from 'resend'` outside the adapter a build failure. Everything else — the typed intent, the communication record, the webhook — is ordinary work. The lint rule is what makes it hold.

On sovereignty: the sovereign asset here is not the transport. It is **the record**. Today Resend holds thirty days of history about Soullab's members and Soullab holds none — the vendor knows what happened and the platform does not. The architecture in §18 inverts that. Soullab keeps intent, consent, templates, policy, delivery evidence, and suppression in its own Postgres on its own hardware, and treats the transport as the commodity it is. Replaceability, not licence text, is what makes that sovereign — which is why an AGPL tool that hard-requires AWS SES underneath it, or a self-run MTA that puts a member's password reset behind an unwarmed IP, would both be sovereignty in name while costing real reliability.

And the smallest version of that claim: **a communication system's first obligation is to know, and to say, whether it actually did the thing it says it did.** Soullab's does not. That is the work.

---

## MIGRATION (estimates only — NOT AUTHORIZED)

| Phase | Scope | Est. | Reversible |
|---|---|---|---|
| **0 — Truth** | Inspect `{ data, error }` in 4 auth routes + `alertEngine`; honest errors; move `trackOnboarding` after acceptance | hours | fully |
| **1 — Boundary** | All platform email through `sendEmail()`; typed `kind`; **CI lint forbidding `import 'resend'` outside adapter** | 1–2 days | fully |
| **2 — Evidence** | Platform-scoped `communications` table; `communication_id`; `requested_at`/`accepted_at`/`delivered_at`; extract templates | 1–2 days | additive migration |
| **3 — Delivery truth** | Resend webhook + signature verification + replay protection → `delivered_at`, bounces, Soullab-held suppression | 2–3 days | additive |
| **4+ — Gated** | Separate transactional/bulk accounts; then SES fallback (C) / Novu (D) / Plunk (E) only on demonstrated requirement | — | at the seam |

---

## RISKS

1. **The plan is adopted and the lint rule is dropped as "process overhead."** Then Phase 1 decays exactly as `sendEmail.ts` already did, and this incident recurs at the 27th call site. **Highest risk in this document.**
2. **Quota is upgraded and step 2 is skipped.** Delivery resumes, the incident looks resolved, and the truthfulness defect survives — invisible until the next failure of any kind.
3. **Plaintext passkey email continues.** Independent of architecture; a live credential-handling exposure today.
4. **Bulk sends keep sharing the auth quota pool.** The mechanism of this incident stays armed.
5. **`delivered` is inferred from `accepted`** in Phase 2 before webhooks land. That reintroduces the same lie one layer up, with more infrastructure behind it. `delivered_at` must stay NULL until a webhook writes it.
6. **The evaluation is read as a vendor question** and answered by migrating providers. The defect travels intact.
7. **Onboarding funnel data is known-corrupt** for the incident window; any signup-conversion analysis over that period is unreliable.
8. **Unknown member impact.** How many members hit false-success signup, over what window, is measurable in production and was not measurable here.
9. **`comms_delivery_queue` gets loosened** (`practitioner_id` made nullable) as a shortcut, blurring two distinct consent regimes into one table.
10. **Second-provider work starts before Phase 0–1.** Failover on a system that cannot detect failure is inert.

---

## COST

**Current:** $0/mo — Resend free tier (3,000/mo, ≤100/day). *This is the incident's root condition.*

**Recommended (NOW + NEXT):** **~$20/mo** — Resend Pro, with pay-as-you-go overage so quota exhaustion becomes a billing line rather than a silent outage. **$0 additional infrastructure. $0 additional operational burden.**

**Projected at volume:** $20/mo through ~50k/mo; $35–90/mo at 100k/mo.

**Not a live variable.** At Soullab's volumes the spread between the cheapest option (SES, ~$0.50/mo) and the recommended one (Resend Pro, $20/mo) is **under $20/month**. Novu or Plunk would spend days of setup and a permanent share of a one-person ops budget to chase that spread. Per §10's own instruction: do not optimise fractions of a cent while multiplying operational burden.

---

## DECISION REQUIRED FROM KELLY

Genuine founder-level decisions only. Everything else follows from the evidence.

1. **Authorize the Resend Pro upgrade (~$20/mo)?** — a spend decision, not an architecture decision. Restores delivery in minutes.
2. **Authorize JARVIS-COMMS-02 for Phase 0 (truthfulness fix) as an immediate, standalone change?** — hours of work, no dependencies, no schema change, fully reversible, and the actual defect.
3. **Accept the CI lint rule** forbidding `import ... from 'resend'` outside the adapter as a permanent constraint? — this is the enforcement mechanism the whole recommendation rests on, and it constrains all future contributors including MAIA-assisted work.
4. **The passkey-recovery question** (§11): replace plaintext passkey email with a single-use short-expiry recovery link? — a member-facing UX and security change, independent of architecture, and the most serious privacy finding here.
5. **Consent posture for existing bulk-send scripts** (§11): should `member_notification_preferences` gate them, and should they carry `List-Unsubscribe`, before any further use? — a vows question, not a technical one.
6. **Is multi-channel (in-app inbox / push / SMS) a real product direction within ~12 months?** — the only input that would change LATER. If yes, the Phase-1 adapter interface should be shaped with Novu's substitution in mind now, at no extra cost.

---

## IMPLEMENTATION

**NOT AUTHORIZED.**

No file was modified. No dependency was added. No provider was contacted. No test communication was sent. No DNS, MX, SPF, DKIM, or DMARC record was inspected or altered. No secret value was read, printed, or transmitted.

Working tree clean at `be5b3b80241eb988e74f16cb8851888f135d45df`.

**STOP.** Do not begin JARVIS-COMMS-02 without explicit authorization.
