---
title: "Member Privacy + Consent Principles"
aliases:
  - "MAIA Privacy Principles"
  - "Consent Rules (Members)"
type: policy
project: MAIA-SOVEREIGN
status: draft
version: "1.0"
created: 2026-01-04
updated: 2026-01-04
tags:
  - community-commons
  - member-guide
  - maia
  - privacy
  - consent
  - sovereignty
---

# Member Privacy + Consent Principles
**Community Commons · MAIA-SOVEREIGN**
**Version:** 1.0 · **Last updated:** January 4, 2026

> [!summary]
> Canonical privacy + consent rules for all MAIA integrations and features. Linked from connector docs, Focus Tools, and anywhere member data flows.

## Related
- [[Member-Connectors-Email-Calendar-Setup]]
- [[MAIA Focus Tools Manual (Member Guide)]]

---

## Core Philosophy

> **Relief, not surveillance.**

MAIA exists to reduce overwhelm—fewer open loops, more clean completions. Every integration serves that goal. If a feature doesn't reduce cognitive load or support follow-through, it doesn't belong.

Sovereignty means:
- You control what's connected
- You control what's stored
- You can disconnect and delete at any time

---

## The Consent Rule (non-negotiable)

> [!important]
> **No silent actions.** Every action that touches external systems or stores member data requires explicit approval.

### The Four-Step Pattern
Every action follows this sequence:

1. **MAIA proposes** — clear description of what will happen
2. **Member accepts** — explicit "Yes" or confirm tap
3. **Action executes** — only after approval
4. **MAIA confirms** — what happened, where, when

### Example
```
MAIA: "Want me to schedule this follow-up for Thursday at 10am?"
Member: "Yes."
MAIA: "Done. Scheduled on Soullab Workspace calendar: 'Check landlord reply'."
```

### What "explicit" means
- A button tap or typed confirmation
- Not assumed from context
- Not inferred from previous sessions
- Not bundled with other actions without itemized consent

---

## Data Storage Principles

### What we store (minimum viable)
| Data | Purpose | Encrypted |
|------|---------|-----------|
| OAuth tokens | Maintain connection to external services | Yes |
| Calendar IDs | Know where to create/update events | Yes |
| Event IDs (MAIA-created) | Reference or update if member asks | Yes |
| Audit log (minimal) | Timestamp, action type, success/failure | Yes |

### What we do NOT store
| Data | Why not |
|------|---------|
| Full email bodies | Not needed; drafts live in your email provider |
| Entire calendar history | MAIA only needs what it created |
| Private attachments | Never transferred or cached |
| Conversation content (by default) | Only stored if member explicitly saves as Memory |

> [!note]
> **Memory is intentional.** If a member wants something saved long-term, it's treated like journaling: explicit action, reviewable, deletable.

---

## Scope Minimization

When requesting permissions from external providers (Google, etc.):

1. **Ask only for what's needed now** — not "might need later"
2. **Prefer narrow scopes** — e.g., create events on one calendar vs. full calendar access
3. **Upgrade with consent** — if a new feature needs more access, ask again

### Recommended scope progression
| Phase | Capability | Scope |
|-------|------------|-------|
| Calendar v1 | Create/edit events on Soullab Workspace | Single calendar write |
| Email v1 | Draft creation only | Compose (no read) |
| Email v2 (optional) | Search threads on request | Read with explicit trigger |

---

## Disconnect + Deletion

Members can revoke access at any time through two paths:

### Inside MAIA
Settings → Integrations → **Disconnect**

This immediately:
- Deletes stored OAuth tokens
- Stops all future access
- Clears cached IDs (calendar, event refs)

### Inside the Provider (belt + suspenders)
Google Account → Security → Third-party access → Remove MAIA/Soullab

> [!tip]
> Recommend members do both for full peace of mind.

### Data retention after disconnect
- Tokens: deleted immediately
- Audit logs: retained 30 days (for support), then purged
- Memory items: remain unless member explicitly deletes (they own these)

---

## Transparency Requirements

### What members can see
- Settings → Integrations: connection status, scopes granted
- Settings → Data: what's stored, with "Delete" options
- Audit log (if exposed): recent actions taken on their behalf

### What we surface proactively
- Connection health (e.g., "Calendar token expired — reconnect?")
- Permission changes from provider side
- Any failures (scheduled event didn't create, draft didn't save)

---

## Edge Cases

### Work/Org accounts with restrictions
If a member's organization blocks third-party access:
- Fail gracefully with clear message
- Offer fallback (e.g., copy/paste instead of draft save)
- Never retry silently

### Token refresh failures
- Notify member: "Calendar connection needs refresh"
- Don't queue actions hoping it resolves
- Clear guidance: "Reconnect in Settings"

### Member changes their mind mid-action
- Cancel is always available before execution
- If action already executed, offer undo where possible (e.g., delete the event just created)

---

## Builder Checklist

When adding any new integration or data-touching feature:

- [ ] Does it follow the four-step consent pattern?
- [ ] Is the scope minimal for the use case?
- [ ] Is there a disconnect path that fully removes access?
- [ ] Is data retention documented and reasonable?
- [ ] Does the member have visibility into what's stored?
- [ ] Is there a graceful fallback if permissions are denied?

---

## Change Log
- **1.0 (Jan 4, 2026):** Initial privacy + consent principles extracted from connector docs.
