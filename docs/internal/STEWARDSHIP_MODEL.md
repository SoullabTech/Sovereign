# Soullab Stewardship Model

### *Cost-Bearing Thresholds for Care-Based Systems*

**Internal Working Paper — v1.0**

---

## 1. Purpose of This Document

This paper exists to ensure that everyone building Soullab understands **the economic, ethical, and relational model we are implementing** — and why it is not a conventional SaaS approach.

Soullab is not a productivity platform.
It is a **cognitive load relief and threshold-crossing system** designed for people with variable executive function, emotional intensity, and real nervous-system limits.

Because of that, **how we fund and gate the system is inseparable from what the system is**.

This document explains the stewardship model so that:

* design decisions remain coherent
* monetization never undermines care
* no one on the team has to "guess" what's allowed when pressure appears

---

## 2. Core Principle

> **Soullab does not sell attention.
> It shares the cost of sustained care.**

This single sentence governs all downstream decisions.

We do **not**:

* monetize urgency
* create artificial scarcity
* shame users into upgrading
* lock people out for being poor, overwhelmed, or neurodivergent

We **do**:

* tell the truth about costs
* surface thresholds honestly
* invite contribution without coercion
* preserve dignity at every level of participation

---

## 3. What Makes Soullab Different

### We are not a "productivity tool"

Productivity tools optimize output.

Soullab supports:

* initiation
* follow-through
* remembering
* pattern holding
* nervous-system regulation at thresholds

These are **care functions**, not features.

They require:

* compute
* infrastructure
* background processes
* memory persistence
* scheduled attention over time

That means Soullab has **real, ongoing costs** — not just static hosting.

---

## 4. The Problem with Paywalls

Traditional SaaS models rely on:

* feature locks
* artificial limits
* "upgrade to continue" pressure
* scarcity-based funnels

For our audience, these cause:

* shame
* avoidance
* abandonment
* nervous-system overload

Paywalls turn *care* into *threat*.

We do not use them.

---

## 5. The Stewardship Model (High Level)

Instead of paywalls, we use **cost-bearing thresholds**.

### The idea is simple:

* Every action has a real cost.
* Costs accumulate over time.
* When usage reaches a level that requires sustained holding, the system says so.
* The user chooses how to respond.

No deception.
No punishment.
No coercion.

Just honesty and agency.

---

## 6. Cost-Bearing Thresholds (Mechanism)

Each meaningful action carries a **weight**, proportional to the real resources it consumes.

Examples:

* AI drafting → compute
* Email reminders → infrastructure + delivery
* Pattern memory → storage + retrieval
* Background monitoring → continuous presence

Weights accumulate weekly.

At certain thresholds, the system responds differently:

| Accumulation Level | System Response                                |
| ------------------ | ---------------------------------------------- |
| Low                | Silent — everything flows                      |
| Medium             | Acknowledgment ("Soullab is holding with you") |
| High               | Invitation to stewardship                      |
| Very High          | Honest pause + choice                          |

Important:

* **Nothing is forbidden**
* **Nothing is taken away abruptly**
* **Every response includes an exit**

---

## 7. Stewardship Tiers (Not Products)

These are **positions in a shared field**, not plans or bundles.

### Witness (Free)

* Full dignity
* Basic access
* Light holding

This tier must always feel complete.

### Holder ($9/mo)

* Sustained access to follow-through tools
* Supports infrastructure costs
* Helps keep the system alive

### Steward ($19/mo)

* Pattern continuity
* Deeper system presence
* MAIA integration

This is where relationship emerges over time.

### Sustainer ($49+/mo)

* Funds sponsored access
* Supports development
* Helps prove this model works

No tier is morally superior.
They represent **capacity**, not worth.

---

## 8. Sponsored Access (Non-Negotiable)

Some people cannot pay.

That is not a moral failure.
It is a circumstance.

Sponsored access:

* is funded by Sustainers
* is offered without shame
* creates no debt or obligation
* is time-bounded but renewable

Receiving sponsorship:

* requires only willingness to receive
* creates no permanent label
* leaves no mark in the system

This is essential to Soullab's integrity.

---

## 9. What Is Never Gated

Some things are **baseline human respect**.

They are always available:

* Accessibility features
* Basic capture ("get it out of your head")
* Single-step clarity
* Occasional access to wisdom tools
* Dignified exits from every interaction

If a proposal suggests gating these, it is out of alignment.

---

## 10. Tone and Language Rules (For Everyone)

When implementing or discussing stewardship:

* Never use urgency language
* Never imply moral obligation
* Never say "upgrade"
* Never use countdowns, streaks, or scarcity mechanics
* Never frame payment as virtue

Always:

* name reality plainly
* offer choice
* allow retreat
* preserve dignity

---

## 11. Why This Matters (For the Team)

This model protects:

* **Users** from shame, coercion, and nervous-system harm
* **The system** from quiet collapse and burnout
* **The team** from ethical drift under financial pressure

It also allows Soullab to become something rare:

> A care-based system that can actually sustain itself.

---

## 12. The Line We Do Not Cross

If you are ever unsure in a design or implementation decision, ask:

> "Does this ask the user to *pay to be okay*,
> or does it invite them to *help hold what is holding them*?"

If it's the first — stop.
If it's the second — you're on the right path.

---

## 13. Closing

Soullab exists because we believe systems of care can be built without becoming extractive.

That belief only works if:

* the truth is visible
* contributions are voluntary
* dignity is never compromised

This paper exists so we remember that — together.

---

## Appendix: Implementation Reference

### Action Weights

| Action | Weight | Why |
|--------|--------|-----|
| Capture (triage) | 0 | Local, instant |
| Next step breakdown | 1 | Light compute |
| Focus Garden visit | 1 | Wisdom access |
| Pattern query | 2 | Database + analysis |
| Reminder scheduled | 2 | Scheduled email |
| AI draft generation | 3 | Claude API call |
| Focus Garden complete | 3 | Full wisdom session |
| Gmail send | 5 | OAuth + delivery |
| Background monitoring | 1/hour | Continuous presence |
| Memory persistence | 1/day | Storage + retrieval |

### Tier Thresholds (Weekly)

| Tier | Soft (Acknowledgment) | Medium (Invitation) | Hard (Pause) |
|------|----------------------|---------------------|--------------|
| Witness | 20 | 40 | 60 |
| Holder | 60 | 100 | 150 |
| Steward | 200 | 400 | ∞ |
| Sustainer | ∞ | ∞ | ∞ |
| Sponsored | 40 | 60 | 80 |

### Files

- Migration: `database/migrations/20260203000001_focus_weight_tracking.sql`
- Weight tracking: `lib/focus/weightTracking.ts`
- API routes: `app/api/focus/*/route.ts`
- Focus Garden API: `app/api/focus/garden/route.ts`
- Focus Garden component: `components/ganesha/FocusGarden.tsx`

### Focus Tools (Complete System)

| Tool | Purpose | Weight (visit) | Weight (complete) |
|------|---------|----------------|-------------------|
| **Inbox Triage** | Capture → Classify → Next action | 0 | 0 |
| **Next Step Builder** | Break task → Smallest action → Schedule | 1 | 1 + reminder (2) |
| **Avoidance Breaker** | Draft message → AI assist → Send → Follow-up | 3 (draft) + 5 (send) | + 2 (reminder) |
| **Focus Garden (Ganesha)** | Obstacle → 3 Gates → Insight → Blessing | 1 | 3 |

### Ganesha in the System

Ganesha appears in two forms:
1. **Focus Garden** — The client-facing wisdom practice for obstacle transformation
2. **Consciousness Orchestrator** — The internal system for community building and platform launches

The Focus Garden uses the Ganesha *metaphor* (remover of obstacles, guardian of thresholds) to help users transform blocks into gates. It's the contemplative counterpart to the task-focused Flow tools.

Weight for Focus Garden is intentionally lower than AI drafting because:
- It doesn't call external APIs
- It's a wisdom/reflection practice, not a transaction
- We want people to use it freely (with soft gating for continuity/pattern-saving)

---

## 14. Practitioner Tools and the Shared Ledger

### The System is Already Unified

The weight tracking system is not "Focus Flow-specific." It is a **platform-wide ledger** that already captures costs from:

- Focus Flow (member-facing)
- Practitioner portals (SMS, email, outreach)
- MAIA background services (monitoring, persistence)

### One Ledger, Many Callers

All services write to the same ledger:

```
Focus Flow, Practitioner Portals, Outreach, SMS, Email, MAIA background tasks
  → all write to focus_weight_log
```

This preserves:
- fairness
- transparency
- a single mental model for users
- a single ethics model for the team

### Practitioner Action Weights

| Area                | Action              | Weight | Real Cost          |
| ------------------- | ------------------- | ------ | ------------------ |
| Practitioner portal | Client reminder     | 2      | Cron + delivery    |
| Practitioner portal | Email send          | 3      | Resend             |
| Practitioner portal | SMS send            | 4      | Twilio             |
| Practitioner portal | Campaign schedule   | 5      | Background workers |
| Practitioner portal | Bulk outreach       | 8      | Mass delivery      |

### Current Enforcement State

**UI thresholds are currently enforced ONLY in Focus Flow.**

Practitioner routes log weight silently for now.

This is intentional:
- Practitioners need stable income tools
- We need data before setting thresholds
- Language must be proven gentle before surfacing

### When to Surface to Practitioners

Only after:
- Focus Flow thresholds feel right
- Language is proven gentle
- Sponsorship model exists

Then practitioner stewardship becomes a *parallel track*, not a surprise.

### Important Boundary

> Practitioner tools are **income-generating tools**.
> Member tools are **support tools**.

They use the same ledger, but:
- thresholds
- language
- expectations

will be *different*.

Same ethics, different contexts.

### Implementation Notes

When adding weight logging to practitioner routes:

```ts
// Just log - no checkCapacity yet
await logAction(practitionerId, 'email_send', { source: 'practitioner-portal' });
```

Do NOT add threshold checks to practitioner routes until the team explicitly decides to surface this.

### Practitioner Routes to Wire (Inventory)

**Portal Booking** (`app/api/portal/[slug]/book/route.ts`)
- `sendBookingConfirmation()` → log `email_send` (weight 3)
- `sendBookingNotificationToPractitioner()` → log `email_send` (weight 3)
- Total per booking: 6 weight

**Portal Chat/AI** (`app/api/portal/[slug]/chat/route.ts`)
- Booking flow: same as above (6 weight)
- Inquiry flow: `sendInquiryNotification()` → log `email_send` (weight 3)

**Portal Inquiry** (`app/api/portal/[slug]/inquiry/route.ts`)
- `sendInquiryNotification()` → log `email_send` (weight 3)

**Real-time Alerts** (`lib/alerting/real-time-alerts.ts`)
- `sendEmailAlert()` → log `email_send` (weight 3)
- `sendSMSAlert()` → log `sms_send` (weight 4)

**Gift Passkeys** (`app/api/labtools/gifts/route.ts`)
- `sendGiftEmail()` → log `email_send` (weight 3)

### How to Wire (Pattern)

1. Import logAction at top of file:
   ```ts
   import { logAction } from '@/lib/focus/weightTracking';
   ```

2. Add logging after successful send:
   ```ts
   // After successful email
   if (result.success && practitionerId) {
     try {
       await logAction(practitionerId, 'email_send', {
         source: 'portal-booking',
         metadata: { recipient: booking.clientEmail }
       });
     } catch (e) {
       console.warn('[Weight] Logging skipped:', e);
     }
   }
   ```

Note: Many practitioner routes use `portal.member_id` as the practitioner ID. Make sure to use the correct ID for the practitioner, not the client.

---

## 15. Verification & Debugging

This system is deterministic. Don't "feel around." Verify in this order:

### 1) Prove the DB is receiving weight rows

**Baseline (before testing):**

```sql
select weekly_weight('<MEMBER_UUID>'::uuid) as weekly;

select count(*) as rows
from focus_weight_log
where member_id = '<MEMBER_UUID>'::uuid;
```

**Inspect recent rows:**

```sql
select action_type, weight, created_at
from focus_weight_log
where member_id = '<MEMBER_UUID>'::uuid
order by created_at desc
limit 20;
```

Expected:

* rows increase after using Focus tools
* action_type matches the tool path (e.g., `ai_draft`)

---

### 2) Prove the action mapping is correct (surgical breakdown)

This catches "logging works but weights are wrong" or action types drifted.

```sql
select action_type,
       sum(weight) as total_weight,
       count(*) as n
from focus_weight_log
where member_id = '<MEMBER_UUID>'::uuid
  and created_at > now() - interval '7 days'
group by action_type
order by total_weight desc;
```

Expected after "7 drafts" test:

* `ai_draft` total_weight ≈ 21
* `n` ≈ 7

If you see only `capture`, you tested the wrong tool path.
If weights are 0/1 unexpectedly, the weight map changed.

---

### 3) Fastest end-to-end test (cross 21 quickly)

**Goal:** hit acknowledgment threshold at weekly weight ≥ 21.

Fastest path:

* Use **AvoidanceBreaker → Draft Message** (each `ai_draft` = weight 3)
* Generate/regenerate **7 times** (7 × 3 = 21)

DB verification:

```sql
select weekly_weight('<MEMBER_UUID>'::uuid) as weekly;
```

Expected:

* weekly ≥ 21
* rows include `ai_draft` weight 3

---

### 4) Prove the API is returning stewardship metadata

In DevTools → Network, inspect the JSON response from:

* `/api/focus/draft-message`
* `/api/focus/next-step`
* `/api/focus/schedule-followup`
* `/api/focus/triage`

Expected response shape:

```json
"stewardship": {
  "threshold": "acknowledgment",
  "weeklyWeight": 21,
  "projectedWeight": 24,
  "tier": "witness"
}
```

If DB weight is rising but `stewardship` is missing:

* route is not attaching the object on success
* or the route is returning a different key name

---

### 5) Prove the UI chain is wired (single assertion)

If DB is correct AND API includes `stewardship`, then the UI must show.

UI chain must be:

1. Tool component attaches:
   * `result.stewardship = data.stewardship`

2. `ToolRevealSheet` captures:
   * `if (result.stewardship) setStewardship(result.stewardship)`

3. `HoldingBanner` condition matches:
   * `threshold === "acknowledgment"`

If `stewardship` is present in the network response but banner does not render:
* it's a UI propagation bug, not an accounting bug.

---

### 6) Important: incognito is for limits tests, not stewardship

Stewardship weight logging requires a valid `memberId` (UUID).

Incognito often means:

* no session / not authenticated
* memberId is missing
* weight logging intentionally skips invalid IDs (by design)

Use a normal logged-in session for stewardship verification.

---

### 7) Practitioner portal logging verification (silent phase)

To verify portal actions are logging (no UI impact yet):

```sql
select action_type, weight, created_at
from focus_weight_log
where member_id = '<PRACTITIONER_MEMBER_UUID>'::uuid
order by created_at desc
limit 30;
```

Expected:

* inquiry → one `email_send` (weight 3)
* booking → two `email_send` rows (3 + 3)

---

### 8) Optional: tail logs locally (supporting signal, not source of truth)

Primary proof is DB + network payloads. Logs are secondary.

```bash
docker logs -f --tail 200 maia-sovereign | egrep -i "weight|steward|logAction|checkThreshold|triage|next-step|draft|follow-up|usage|limits"
```
