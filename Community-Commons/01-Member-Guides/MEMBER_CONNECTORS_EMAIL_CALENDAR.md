---
title: "Member Connectors: Email + Calendar Setup (Process + Policy)"
type: "process"
project: "MAIA-SOVEREIGN"
tags: [maia, connectors, onboarding, calendar, email, privacy, community-commons]
version: "1.0"
created: 2026-01-04
---

# Member Connectors: Email + Calendar Setup
**Community Commons · MAIA-SOVEREIGN**
**Version:** 1.0 · **Last updated:** January 4, 2026

> [!summary]
> This doc defines the **member-facing process** for connecting email + calendar, plus the **privacy + product rules** that keep the system clean, consensual, and trustworthy.

---

## Why connect email + calendar?

Connecting these allows MAIA to support **follow-through without overwhelm**, especially for Focus Tools:

- **Avoidance Breaker** → draft a message + schedule a follow-up
- **Next Step Builder** → timebox a "first step" + create a reminder
- **Inbox Triage** → convert a messy mental list into scheduled actions

> [!note]
> The goal is not surveillance. It's *relief*: fewer open loops, more clean completions.

---

# Member-Facing Flow

## A) "Connect" moment (when to ask)
Offer connection in three natural places:

1) **First time a tool wants to schedule something**
- "Want me to schedule this follow-up in your calendar?"

2) **Settings → Integrations**
- "Connect Calendar / Connect Email"

3) **Onboarding (optional)**
- "Would you like MAIA to help with reminders and follow-ups?"

Keep it optional and non-coercive.

---

## B) What members can expect (capabilities, plain language)

### Calendar (core)
MAIA can:
- create a dedicated calendar (recommended): **Soullab Workspace**
- schedule follow-ups/reminders you request
- help you review upcoming "MAIA-created" items (optional)

MAIA cannot:
- secretly schedule things without your approval
- rearrange your calendar without you confirming

### Email (recommended as "draft-first")
MAIA can:
- help you draft an email/message in your chosen tone
- optionally save it as a **draft** (if supported) or give a copyable version
- set follow-ups ("If no reply by Thursday, remind me")

MAIA cannot:
- send emails without your explicit action
- impersonate you
- auto-reply to people on your behalf

> [!tip]
> The cleanest member experience is **draft + copy/paste** (works even without email integration).
> Email integration is for convenience, not necessity.

---

# Step-by-step: Connect Calendar (Google)

> [!info]
> Current MAIA-SOVEREIGN build supports a Google calendar creation flow (e.g., creating a "Soullab Workspace" calendar).

## 1) Go to Settings → Integrations
Tap/click: **Connect Calendar**

## 2) Sign in with Google
You'll be shown Google's permission screen.

## 3) Approve only what's needed
Recommended minimum:
- create/edit events on the dedicated Soullab calendar
- read basic calendar list (to select where to place reminders)

## 4) Choose your calendar behavior
Pick one:

- **Recommended:** Create / use **Soullab Workspace** calendar
- **Alternative:** Choose an existing calendar (Personal / Work)

## 5) Run a quick test
Ask MAIA:
> "Schedule a follow-up reminder for tomorrow at 9am: 'Send landlord email'."

If it appears in your calendar, you're set.

---

# Step-by-step: Connect Email (Gmail-first)

> [!warning]
> Email integration should start **conservative** (draft-first) and expand only with clear consent.

## 1) Settings → Integrations → Connect Email
Choose: **Gmail**

## 2) Sign in with Google
You'll see a permissions screen.

## 3) Choose the mode (recommended)
- **Draft-only mode (recommended):** MAIA can create drafts / help you write and save drafts
- **Read-assist mode (optional):** MAIA can help find threads *you ask for* (e.g., "Show me the last email from my landlord")

## 4) Test it with a harmless draft
Ask MAIA:
> "Draft an email to my landlord about the leak. Polite and firm."

MAIA returns:
- a clean email draft (always)
- optional "Save as draft" action (only if email integration supports it)

---

# Consent Rules (what must be true every time)

> [!important]
> **No silent actions.** Every calendar create/schedule or email draft action requires a clear member "Yes."

Minimum pattern:
- MAIA proposes the action → member accepts → action is performed → MAIA confirms what happened.

Example:
- "Want me to schedule this follow-up for Thursday at 10am?"
- "Yes."
- "Done. Follow-up scheduled on Soullab Workspace calendar: 'Check landlord reply'."

---

# Privacy + Data Policy (member-readable)

## What we store (recommended)
- OAuth tokens (encrypted)
- calendar IDs selected for MAIA actions
- event IDs created by MAIA (so the system can reference or update them if the member asks)
- a minimal audit log: timestamp + action type + success/failure

## What we do **not** store (recommended)
- full email bodies (unless member explicitly saves as "Memory")
- entire calendar history
- private attachments

> [!note]
> If a member wants something saved as Memory, treat it like intentional journaling: explicit + reviewable.

---

# Disconnect / Revoke Access (member steps)

## Inside MAIA
Settings → Integrations → **Disconnect Email / Disconnect Calendar**

This should:
- delete stored tokens
- stop all future access immediately

## Inside Google (belt + suspenders)
Google Account → Security → Third-party access → remove MAIA/Soullab

---

# Troubleshooting

## "Calendar scheduling didn't work"
Common causes:
- permissions were denied
- token expired / refresh failed
- wrong calendar selected
- Google account has restricted permissions (work org)

Member fix:
- reconnect calendar
- pick **Soullab Workspace** calendar again
- run the test reminder

## "I connected but nothing shows up"
- check the calendar list (you may be viewing a different calendar)
- ensure the calendar is toggled visible
- search calendar for "Soullab" or "MAIA"

## "Email integration feels too invasive"
- use **draft-only mode**
- or skip integration entirely; MAIA still drafts messages for copy/paste

---

# Implementation Notes (for builders)

## UX requirements
- Integrations screen: Email + Calendar tiles with state (Connected / Not connected)
- Clear "What this enables" bullets on each connector
- Consent prompts as bottom-sheet confirms (match ToolRevealSheet style)

## Technical requirements (high-level)
- OAuth + refresh token storage (encrypted at rest)
- Per-user connector state: provider, scopes granted, created calendar_id
- Audit logs: action_type, timestamp, result, error_message

## Calendar: recommended behavior
- create one dedicated calendar named **Soullab Workspace**
- tag MAIA-created events with a recognizable marker (e.g., `source=maia`)
- store event IDs for update/delete **only when member requests**

## Email: recommended rollout
Phase 1:
- generate drafts (no sending)
- optional "save draft" if supported

Phase 2 (optional):
- search threads on explicit request
- summarize thread content without storing it by default

---

# Suggested Copy (UI strings)

**Connect Calendar**
- "Connect your calendar so MAIA can schedule follow-ups you request."

**Connect Email**
- "Connect email to save drafts and reduce open loops. MAIA never sends anything without you."

**Consent modal**
- "Schedule: 'Check landlord reply' — Thu 10:00am — Soullab Workspace calendar"
- Buttons: **Schedule** / **Not now**

---

## Change Log
- **1.0 (Jan 4, 2026):** First connector process doc (calendar + email) with consent + privacy rules.
