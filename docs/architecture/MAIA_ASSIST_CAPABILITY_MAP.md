# MAIA Assist — Capability Map

**Purpose:** one accurate, legible place that states what MAIA can do in the world on a
person's behalf, and what it cannot do yet. No hidden capabilities; no overclaiming.
Surface: **`/studio/assist`**.

Every Assist function is an **Authorized Action**: the human authors it, explicitly consents,
and the system executes exactly that — audited, and revocable before execution. MAIA never
originates an action. (See `MAIA_ASSIST_SCOPE_2026-06-17.md` and the Authorized Action
constitution: Authorship · Consent · Faithful Execution · No Substitution · Revocability · Legibility.)

## Status labels (the promotion ladder, made user-facing)

| Label | Meaning |
|---|---|
| **Live** | Certified end-to-end (execute + revoke) and in production use. |
| **Pending Certification** | Machinery works in production; the human UI A/B certification has not been run. |
| **In Build** | Being built; not exposed as an action yet. |
| **Blocked** | Cannot be exposed until an external/compliance condition is met. |
| **Not Available** | Not present. |

## Capability matrix

| Function | Status | Current state | Needed next |
|---|---|---|---|
| **Email** | Pending Certification | Delivery rail live in prod (worker → managed Resend → inbox, audited). UI at `/studio/scheduled-sends` deployed. | Run the UI A/B certification (A: author→consent→send; B: author→consent→revoke). |
| **Calendar** | In Build | Booking/calendar substrate exists (`/api/studio/calendar/events`, CalDAV sync, `/studio/calendar`). No consent-gated Authorized-Action event executor. | Build as executor #2, reusing the same constitutional spine; run the identical A/B certification. |
| **Text / SMS** | Blocked | Provider code exists (`lib/comms/providers/TwilioProvider.ts`, WhatsApp) but is **not exposed**. | Resolve SMS consent + A2P / carrier compliance before any exposure. |

## Per-function detail

### Email — Pending Certification
- **Live:** scheduled send via the due-send worker (`/api/cron/scheduled-sends`), managed Resend, full audit (`status`, `sent_at`, `provider`, `provider_message_id`, `attempts`). Linux scheduler installed (1-min cron). Production self-send delivered + audited.
- **UI actions (`/studio/scheduled-sends`):** schedule an email · view scheduled & sent · cancel a pending email · send a test to yourself.
- **Not yet certified:** the *human UI path*. The verified self-send was operator-inserted (machinery proof). Certification = a person authoring through the UI (proves Authorship, Consent) and revoking one before it fires (proves Revocability).

### Calendar — In Build
- The existing calendar is for **booking / availability**, not an Authorized Action executor.
- The executor (consent-gated create/schedule/cancel event) is **executor #2**: it reuses the consent/audit/revoke spine; only the executor-specific **evidence** differs (event id, attendees, start/end, calendar audit — there is no `provider_message_id`; calendar's semantic success is *state creation*, not delivery).
- No event actions are exposed on `/studio/assist` until built and certified.

### Text / SMS — Blocked
- Intentionally not exposed. SMS carries consent semantics email does not (TCPA / A2P 10DLC). Provider code present but **no callers exposed** through Assist.
- Unblocks only after carrier consent + A2P/compliance are resolved.

## Discipline
- **No autonomous outreach.** Every action is human-authored and human-consented.
- **No SMS exposure** until compliance is resolved.
- A function moves to **Live** only by passing the execute-and-revoke certification against the six invariants. New channels are added at the **executor** layer; the constitutional model does not change.
