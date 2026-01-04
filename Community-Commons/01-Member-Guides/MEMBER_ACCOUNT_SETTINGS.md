---
title: "Member Account Settings: Your Control Center"
type: "guide"
project: "MAIA-SOVEREIGN"
tags: [maia, settings, account, privacy, notifications, community-commons]
version: "1.0"
created: 2026-01-04
---

# Member Account Settings: Your Control Center
**Community Commons · MAIA-SOVEREIGN**
**Version:** 1.0 · **Last updated:** January 4, 2026

> [!summary]
> Your Account Settings is where you customize how MAIA works for you — from voice and memory preferences to privacy controls and data ownership. Everything here is about **your sovereignty**.

---

## Where to find Settings

1. Open MAIA (`/maia`)
2. Tap your **Account** button (top-right corner)
3. Select **Settings**

Or navigate directly to: `/account/settings`

---

# Settings Sections Overview

Your settings are organized into eight sections:

| Section | What it controls |
|---------|-----------------|
| **Profile** | Name, email, bio — how MAIA knows you |
| **Account** | Passkey, password — how you access MAIA |
| **MAIA Settings** | Voice, memory, conversation style |
| **Notifications** | What emails you receive |
| **Privacy** | Data sharing preferences |
| **Membership** | Your Sustaining Circle tier |
| **Connections** | Google Calendar, Gmail integrations |
| **Your Data** | Export or delete your data |

---

# Profile

Your basic identity within MAIA.

## Editable fields
- **Name** — How MAIA addresses you
- **Email** — For account recovery and notifications
- **Bio** — A brief description (optional, for future community features)

> [!tip]
> Changes save automatically when you tap outside the field.

---

# Account

Your access credentials.

## Passkey
Your unique Soullab passkey (e.g., `SOULLAB-YOURNAME-XXXX`). This is your permanent identifier.

- Tap **Reveal** to see your full passkey
- Passkeys cannot be changed — they're your permanent key to MAIA

## Password
Used alongside your username to sign in across devices.

- Tap **Change Password** to update
- Requires current password for verification

---

# MAIA Settings

Customize how MAIA interacts with you.

## Memory Mode
How MAIA remembers your conversations:

| Mode | Behavior |
|------|----------|
| **Continuity** | MAIA builds on previous conversations, remembering patterns and preferences |
| **Session** | Each conversation starts fresh — no long-term memory |
| **Sanctuary** | Nothing is remembered. Speak freely. (See [Sanctuary Mode docs](../01-Core-Concepts/sanctuary-mode.md)) |

## Voice Model
Choose MAIA's speaking voice:
- **Shimmer** (default) — Warm, balanced
- **Alloy** — Clear, neutral
- **Echo** — Deeper, grounded
- **Fable** — Expressive, dynamic
- **Onyx** — Rich, resonant
- **Nova** — Bright, energetic

## Voice Speed
Adjust playback speed: `0.5x` to `2.0x`

## Archetype
MAIA's relational style:
- **Guide** — Supportive, directional
- **Mirror** — Reflective, non-directive
- **Mentor** — Instructive, developmental
- **Companion** — Warm, conversational

## Conversation Mode
How MAIA engages:
- **Balanced** — Adapts to context
- **Reflective** — More questions, deeper exploration
- **Direct** — Concise, action-oriented
- **Exploratory** — Open-ended, creative

---

# Notifications

Control what emails you receive from Soullab.

| Notification | Description |
|--------------|-------------|
| **Weekly Digest** | Summary of your week's insights and patterns |
| **Breakthrough Moments** | When MAIA notices significant growth |
| **Community Updates** | News from the Soullab community |
| **Product Updates** | New features and improvements |

> [!note]
> All notifications are opt-in. We never sell your email or spam you.

---

# Privacy

Your data, your rules.

## Share Anonymous Insights
When enabled, anonymized patterns (never content) help improve MAIA for everyone.

- **What's shared:** Statistical patterns (e.g., "users who journal in the morning report higher clarity")
- **What's never shared:** Your actual words, identity, or personal details

## Allow Research Participation
Opt into occasional research studies about consciousness technology.

- You'll be asked before any study
- Participation is always voluntary
- You can withdraw at any time

> [!important]
> Both settings default to **off**. Your data is yours unless you explicitly choose to contribute.

---

# Membership

View your Sustaining Circle status.

## Tiers
- **Explorer** — Free tier with core MAIA access
- **Sustainer** — Monthly contribution, full features
- **Pioneer** — Founding supporter, early access to everything

Your tier, contribution amount, and join date are displayed here.

> [!tip]
> To change your membership, visit [Sustaining Circle](/sustaining-circle).

---

# Connections

Link external services to enhance MAIA's capabilities.

## Google Calendar
Allow MAIA to schedule reminders and follow-ups.

## Gmail
Enable draft creation and inbox assistance.

See [Member Connectors: Email + Calendar](./MEMBER_CONNECTORS_EMAIL_CALENDAR.md) for detailed setup instructions.

---

# Your Data

You own everything. Here's how to exercise that ownership.

## Export Your Data
Download a complete JSON file containing:
- Your profile information
- All settings and preferences
- Session history
- Developmental memories
- Connected service status

> [!note]
> This is GDPR-compliant data portability. Your data, your format, your control.

## Delete Account
Permanently remove your account and all associated data.

**What gets deleted:**
- Your member profile
- All settings and preferences
- Session history
- Developmental memories
- Connected service credentials
- Memory links and patterns

> [!warning]
> Account deletion is **permanent and irreversible**. You'll need to confirm by typing your username.

---

# Technical Implementation Notes (for builders)

## Database Tables
- `members` — Core profile (name, email, passkey, password_hash)
- `member_settings` — Preferences (MAIA settings, notifications, privacy, membership)
- `member_sessions` — Session history tracking

## API Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/members/profile` | GET/PUT | Profile CRUD |
| `/api/members/settings` | GET/PUT | Settings management |
| `/api/members/export-data` | POST | GDPR data export |
| `/api/members/delete-account` | POST | Account deletion |

## Storage Strategy
- Server-side: PostgreSQL via `lib/db/postgres.ts`
- Client-side: localStorage for session caching
- Sync: Settings persist to server, with localStorage as fallback

---

## Change Log
- **1.0 (Jan 4, 2026):** Initial Account Settings documentation with all eight sections.
