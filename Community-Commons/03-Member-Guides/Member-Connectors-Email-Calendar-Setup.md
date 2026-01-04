---
title: "Member Connectors: Email + Calendar Setup"
aliases:
  - "MAIA Integrations: Email + Calendar"
  - "Connectors Setup (Members)"
type: process
project: MAIA-SOVEREIGN
status: draft
version: "1.0"
created: 2026-01-04
updated: 2026-01-04
tags:
  - community-commons
  - member-guide
  - maia
  - integrations
  - connectors
  - calendar
  - email
  - privacy
---

# Member Connectors: Email + Calendar Setup
**Community Commons · MAIA-SOVEREIGN**
**Version:** 1.0 · **Last updated:** January 4, 2026

> [!summary]
> This note defines the **member-facing process** for connecting email + calendar, plus the **consent + privacy rules** that keep the system clean and sovereignty-respecting.

## Related
- [[Member-Privacy-Consent-Principles]]
- [[MAIA Focus Tools Manual (Member Guide)]]
- [[Soullab Workspace Calendar]] *(optional note to create)*

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

## A) The "moment of need" invitation (when to ask)
Offer connection in three natural places:

1) **First time a tool wants to schedule something**
- "Want me to schedule this follow-up in your calendar?"

2) **Settings → Integrations**
- "Connect Calendar / Connect Email"

3) **Onboarding (optional)**
- "Would you like MAIA to help with reminders and follow-ups?"

> [!important]
> Do *not* front-load permissions. Ask only when it becomes useful, and always provide a graceful fallback.

---

## B) What members can expect (plain language)

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

## Privacy + Data Policy

See [[Member-Privacy-Consent-Principles]] for full details.

**TL;DR:** We store only OAuth tokens, calendar IDs, and MAIA-created event refs (all encrypted). We never store full email bodies or calendar history. Disconnect anytime in Settings.

---

# Step-by-step: Connect Calendar (Google)

> [!info]
> Current MAIA-SOVEREIGN supports a Google calendar creation flow (e.g., creating a "Soullab Workspace" calendar).

## 1) Go to Settings → Integrations
Tap/click: **Connect Calendar**

## 2) Sign in with Google
You'll see Google's permission screen.

## 3) Approve only what's needed (recommended minimum)
- create/edit events on the dedicated Soullab calendar
- read basic calendar list (to select where to place reminders)

## 4) Choose your calendar behavior
Pick one:
- **Recommended:** Create / use **Soullab Workspace** calendar
- **Alternative:** Choose an existing calendar (Personal / Work)

## 5) Run a quick test
Ask MAIA:
> "Schedule a follow-up reminder for tomorrow at 9am: 'Send landlord email'."

If it appears, you're set.

---

# Step-by-step: Connect Email (Gmail-first)

> [!warning]
> Email integration should start **conservative** (draft-first) and expand only with clear consent.

## 1) Settings → Integrations → Connect Email
Choose: **Gmail**

## 2) Sign in with Google
You'll see a permissions screen.

## 3) Choose your mode (recommended)
- **Draft-only mode (recommended):** MAIA can create drafts / help you write and save drafts
- **Read-assist mode (optional):** MAIA can help find threads *you ask for* (e.g., "Show me the last email from my landlord")

## 4) Test it with a harmless draft
Ask MAIA:
> "Draft an email to my landlord about the leak. Polite and firm."

MAIA returns:
- a clean email draft (always)
- optional "Save as draft" action (only if supported)

---

# Troubleshooting

## "Calendar scheduling didn't work"
Common causes:
- permissions denied
- token expired / refresh failed
- wrong calendar selected
- work/org restrictions

Member fix:
- reconnect calendar
- pick **Soullab Workspace** again
- run the test reminder

## "I connected but nothing shows up"
- check you're viewing the correct calendar
- ensure it's toggled visible
- search for "Soullab" or "MAIA"

## "Email integration feels too invasive"
- use **draft-only mode**
- or skip integration entirely; MAIA still drafts for copy/paste

---

# Builder Notes (for Community Commons)

## UX requirements
- Integrations screen: Email + Calendar tiles with state (Connected / Not connected)
- "What this enables" bullets on each connector
- Consent prompts as bottom-sheet confirms (match ToolRevealSheet style)

## Technical requirements (high-level)
- OAuth + refresh token storage (encrypted at rest)
- per-user connector state: provider, scopes granted, created calendar_id
- audit logs: action_type, timestamp, result, error_message

## Calendar: recommended behavior
- create dedicated calendar named **Soullab Workspace**
- tag MAIA-created events with a marker (e.g., `source=maia`)
- store event IDs for update/delete **only when member requests**

## Email: recommended rollout
Phase 1:
- generate drafts (no sending)
- optional "save draft" if supported

Phase 2 (optional):
- search threads only on explicit request
- summarize without storing by default

---

# Suggested UI copy

**Connect Calendar**
"Connect your calendar so MAIA can schedule follow-ups you request."

**Connect Email**
"Connect email to save drafts and reduce open loops. MAIA never sends anything without you."

**Consent modal**
"Schedule: 'Check landlord reply' — Thu 10:00am — Soullab Workspace calendar"
Buttons: **Schedule** / **Not now**

---

## Change Log
- **1.0 (Jan 4, 2026):** First connector process note (calendar + email) with consent + privacy rules.
