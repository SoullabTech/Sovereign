---
level: protocol
---

# MAIA Connector Experience — Member-Owned Capacities

> Connectors are member-owned capacities, not integrations in the SaaS sense.

## The Four Verbs

| Verb | Domain | Connector | What it means |
|------|--------|-----------|---------------|
| **Keep** | Sovereign Archive | Obsidian | Your own record. Your own vault. |
| **Release** | Sovereign Expression | Nostr | Something leaves the sanctuary by choice. |
| **Coordinate** | Sovereign Coordination | CalDAV | Bring this into lived time. |
| **Send** | Sovereign Communication | Google / Proton | Carry this into relationship. |

MAIA speaks in these verbs. Not "sync," "integration," "provider," or "endpoint."

## When Connectors Appear

Connectors surface **at the moment of need**, not as settings clutter.

- After a meaningful reflection: **Keep this** / **Release this**
- After planning or scheduling: **Coordinate this**
- After drafting a message: **Send this**

Members never "go use connectors." Connectors appear inside the flow.

## Capability Routing

MAIA routes by capability, not by provider:

- `send_email` — routes to Google or Proton, whichever is connected
- `create_calendar_event` — routes to CalDAV or Google Calendar
- `export_markdown` — routes to Obsidian
- `publish_note` — routes to Nostr

The member only sees the provider name if a choice matters.

## Permission Model

Three levels per capability:

1. **Not connected** — no access
2. **Ask every time** — default for most members
3. **Allow directly** — for trusted, repeated actions

Nostr: always ask (v1). No auto-publish.
Obsidian: on-demand default, auto-export opt-in.
CalDAV: ask before creating events.
Mail: ask before sending.

## Member Journey Stages

1. **Arrival** — MAIA meets them. No connectors required.
2. **Continuity** — MAIA remembers them. Still no connectors.
3. **Preservation / Action** — Keep, Coordinate, Send, Release become relevant.
4. **Sovereign extension** — The member uses their own systems. The ecosystem is theirs.

## Contextual Invitations (not forced onboarding)

- "Want to preserve this in your own archive? Connect Obsidian."
- "Want MAIA to place this on your calendar? Connect CalDAV."
- "Want to release this reflection to your relay? Connect Nostr."

Never a generic "Connect your tools now."

## The Capability Loop

When MAIA needs to act:

1. What capability is needed?
2. Does the member have a connector for it?
3. What permission mode is set?
4. Act or ask.

## The Promise

If done well, members experience:

- MAIA helps me think
- MAIA remembers me
- When I want, MAIA can **place things into my own systems**
- Nothing is taken automatically
- Nothing leaves without consent
