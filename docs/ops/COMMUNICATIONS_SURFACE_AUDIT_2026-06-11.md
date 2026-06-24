# Communications Surface — Grounded Audit

- **Date**: 2026-06-11
- **Audited**: `origin/clean-main-no-secrets` @ `c15aabfdb` ("fix(studio-mobile): unblock add-client first crossing (#402)") via a clean detached worktree (`/tmp/maia-comms-audit`) — **not** the local dirty `fix/studio-calendar-timezone-edit` tree.
- **Scope**: The Studio → Communications screen (`/studio/comms`) shown in the screenshot. No redesign proposed (per directive: establish what is real, mocked, removable).

---

## Headline

The Communications screen the practitioner sees (`/studio/comms`) is **100% hardcoded mock data** — a 7-item TypeScript array. It performs **no data fetch**. This is **Situation A** (a mock/demo surface), not a partially-wired one.

Separately, the codebase contains a **real, substantial communications backend** ("Comms Spine") — but the Studio screen does **not** consume it. The real backend is wired to a *different, older* practitioner surface (`/stellium/comms`). So there are **two parallel comms systems**, and the one in the Studio reveal is the mock.

---

## The two systems

| | **A. Studio Communications (the screenshot)** | **B. Comms Spine (real backend)** |
|---|---|---|
| Route | `/studio/comms` (+ `/studio/comms/[messageId]`) | API: `/api/comms/*`; UI: `/stellium/comms` |
| Data source | `lib/studio/mockMessages.ts` (static array) | PostgreSQL: `comms_threads`, `comms_messages`, … |
| Load mechanism | `useState(initialMessages)` — **no fetch** | `fetch('/api/comms/inbox')` → `getInbox()` → DB |
| Status | **Demo/placeholder** | **Real code** (live data flow unverified here) |
| Consumed by Studio? | — | **No** |

The file header of the mock data states its own intent: `// Replace with real data/service later.` (`lib/studio/mockMessages.ts:1-6`).

---

## Answers to the 7 questions

### 1. Real data, mock, or mixture?
**Pure mock.** `app/studio/comms/page.tsx:37` → `const [messages, setMessages] = useState<Message[]>(initialMessages);` where `initialMessages` is imported from `lib/studio/mockMessages.ts:23` (`page.tsx:23`). The only network call on the page is `sendSms()` → `/api/notifications/sms` (`page.tsx:129`), which is an *outbound action*, not a load. There is no `useEffect` fetch, no `/api/comms/inbox` call. Nothing on this screen reflects the practitioner's real world.

### 2. Every source feeding the inbox list
**One source:** the static array `mockMessages` in `lib/studio/mockMessages.ts` (7 objects, ids `'1'`–`'7'`). That is the entire feed. No DB, no API, no aggregation.

### 3. Which records are seeded/demo
**All 7** rows are demo, hardcoded in `lib/studio/mockMessages.ts`:
1. Sarah Chen — "Re: Q1 Strategy Session Follow-up" (email)
2. You → +1 (555) 123-4567 — "Session Reminder" (sms, sent)
3. MAIA — "Agent task completed" (notification)
4. Marcus Johnson — "Rescheduling Friday session" (email)
5. +1 (555) 987-6543 — "Incoming SMS" (sms)
6. System — "New client registration: Elena Rodriguez" (notification)
7. Triage Queue — "iOS build failing on TestFlight…" (internal)

### 4. Can seeded items currently be deleted?
**No.** The detail pane renders Archive and Trash buttons (`components/studio/CommsMessageDetail.tsx:84,91`), but they call **optional** callbacks `onArchive?.()` / `onTrash?.()`. Neither Studio page passes those props:
- Split-pane: `page.tsx:457` passes only `onToggleStar`.
- Detail route: `[messageId]/page.tsx:35` passes only `message`.

So the Trash/Archive icons are **silent no-ops**. There is no DELETE endpoint, no persistence, not even a local-state removal. `toggleStar`/`markAsRead` (`page.tsx:97-108`) mutate React state only and reset on reload.

### 5. Tables and APIs backing each category

**For the Studio screen: none.** The four `type` values (`email | sms | notification | internal`) are just strings in the mock array; they map to no table or service.

Elsewhere in the codebase (the real Comms Spine + notifications), the backing infrastructure that *exists* but does **not** feed this screen:

- **Email** — Outbound: `lib/email/*` (Resend), `/api/notifications/email`, `lib/comms/providers/ResendProvider.ts`. Inbound: Comms Spine `comms_messages` (+ `comms_channels`, `comms_identities`, `lib/comms/emailRouter.ts`). No email-inbox table feeds `/studio/comms`.
- **SMS** — Outbound: `/api/notifications/sms` (real Twilio via `lib/comms/providers/TwilioProvider.ts`; reads `practitioner_integrations`/`practitioner_comms_credentials`; **dev mode = log only**, sends nothing). This is the *one* real wire on the mock page (the "Compose SMS" button). Inbound: Comms Spine `comms_messages` + `comms_webhooks_log`.
- **Notifications** — `/api/notifications/*` exists; the mock "MAIA/System" notification rows correspond to no real notification record.
- **System / internal (Triage Queue)** — Pure mock; no backing table.

Real Comms Spine tables (migration `20260122_comms_spine.sql` + `_delivery_infrastructure.sql`): `comms_channels`, `comms_identities`, `comms_threads`, `comms_messages`, `comms_events`, `comms_consent`, `comms_policies`, `comms_safety_flags`, `comms_delivery_queue`, `comms_webhooks_log`, `practitioner_comms_credentials`, `practitioner_comms_settings`. Services: `lib/comms/{InboxService,ThreadService,SafetyService,DeliveryService,ReplySuggestionService,maiaAnalyzer}.ts` + providers (Twilio/WhatsApp/Telegram/Resend). API: `/api/comms/inbox`, `/api/comms/threads/[id]`, `…/messages`, `…/suggested-replies`, `…/safety`, `…/feedback`. UI consumers: `app/stellium/comms/page.tsx`, plus count-only badges in `components/masters/NathanStudio.tsx` and `components/maia/CommsQuickAccess.tsx`.

### 6. Production-ready vs placeholder
- **`/studio/comms` (System A)** — **Placeholder/demo.** No fetch, no persistence, no delete, no empty state. Only "Compose SMS" is a real action (and only if Twilio is configured; otherwise log-only/credential-gated).
- **Comms Spine (System B)** — **Real code, substantial.** Whether it has *live production data / active inbound ingestion* is **not verified by this audit** (code-level reality confirmed; runtime data flow not checked). It is **not wired into the Studio surface** the practitioner now uses.

### 7. If all seeded/demo content were removed today, what would the page show?
A **broken-looking blank**, not a designed empty state. `filteredMessages.map(renderMessageItem)` over an empty array renders an empty list; `selectedMessage` defaults to `'1'` (`page.tsx:40`), which would resolve to `undefined`, so the right pane falls through to the "Select a message to view" placeholder. **No "No communications yet" empty state exists.**

---

## What can safely be removed

- `lib/studio/mockMessages.ts` — the demo dataset (the source of every visible row).
- The mock import + local `useState` seed in `app/studio/comms/page.tsx` and `app/studio/comms/[messageId]/page.tsx`.
- Decorative no-op Trash/Archive handlers surfaced by `components/studio/CommsMessageDetail.tsx` (until backed by a real action).

Removing the mock with no replacement leaves the blank state in Q7 — so a truthful empty state must land in the same change. **Nothing real is lost by deleting the demo data**; the real Comms Spine is independent of it.

---

## Caveats / not-yet-verified

- Runtime/production data state of the Comms Spine (row counts, live inbound webhooks) — not checked here; this audit is code-level on clean-main.
- Access/guard model of `/stellium/*` vs `/studio/*` — not fully traced.
- Whether `/stellium/comms` is currently reachable/used by any real practitioner — unverified.
