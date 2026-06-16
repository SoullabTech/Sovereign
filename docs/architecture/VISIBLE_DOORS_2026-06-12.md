# Visible Doors
## Orientation Through Possibility, Not Restriction

**Date:** 2026-06-12
**Status:** Adopted — governs all tier-gated UX across the platform
**Origin:** Track A pre-build doctrine (Kelly directive)

---

## Purpose

The role of a visible door is to orient a member to the deeper layers of the platform.

A visible door is not an upsell.
A visible door is not a paywall.
A visible door explains what exists beyond the current layer of relationship and why it matters.

---

## Core Principle

Members should always understand:

- Where they are
- What is available now
- What becomes available with deeper engagement

The system should never create the feeling:
> "You are being denied something."

The system should create the feeling:
> "There is more here when you are ready."

---

## The Wrong Pattern

A standard SaaS implementation typically presents locked features.

**Example:**
```
🔒 Focus Garden
Companion Only
Upgrade Now →
```

The message received by the member is:
> "You cannot have this."

This creates exclusion before relationship.

---

## The Right Pattern

A visible door explains the next layer.

**Example:**
```
Patterns become available as your thread grows.

Focus Garden helps you work intentionally with recurring themes
and long-term development.

Available at Companion.
```

The message received by the member is:
> "This exists."
> "I understand its purpose."
> "I know where it sits on the path."

The member is oriented rather than excluded.

---

## Relationship Before Access

Every visible door should answer three questions:

1. What is this?
2. Why would it matter?
3. When does it become available?

It should not lead with: "Pay to unlock."

It should lead with: "Here is the next layer of stewardship."

---

## Application to the Threshold

Explorer members should encounter visible doors for:

- Continuity
- Patterns
- Gathering
- Focus Garden
- AvoidanceBreaker

These doors should appear as part of the environment rather than as advertisements. The Threshold remains complete at the Explorer level. The visible doors simply reveal the broader landscape.

---

## Relationship Levels

```
Explorer
  → Self-awareness
  → Orientation

Companion
  → Self-development
  → Continuity

Practitioner
  → Care for others
  → Meaning
```

Visible doors help members understand this progression without requiring explanation.

---

## Implementation Rules

**Do not:**
- Render locked cards with lock icons
- Show upgrade banners inside the Threshold
- Lead with pricing or tier names before explaining what the feature does
- Create a visible sense of what is missing

**Do:**
- Name the thing: what is it?
- Explain its purpose in one sentence
- Note when it becomes available, after the explanation
- Keep visible doors quiet — part of the environment, not foreground UI

**Copy pattern:**
```
[What the feature does, in plain language.]
[Why it matters — one sentence.]
Available at [tier level].
```

---

## Success Test

A visible door is successful if a member thinks:
> "That sounds useful. I understand why it exists."

A visible door has failed if a member thinks:
> "They are hiding the good stuff behind a paywall."

The purpose is orientation, not pressure.
The purpose is relationship, not conversion.

---

## Why this requires a doctrine document

Once Track A code lands, the default gravity of most product patterns pulls toward locked cards, upgrade banners, and feature gating. Without a named alternative, implementation decisions default to the standard pattern — not out of bad intent, but because that is what most frameworks, component libraries, and SaaS examples demonstrate.

This document exists so that when a developer implements a tier-gated surface, they have a clear answer: the job is to orient people to the next layer, not to hide features behind locks.

---

*See also:*
- `docs/architecture/ORIENTATION_CONTINUITY_MEANING_2026-06-12.md` — surface empty-state doctrine
- `docs/architecture/PORTAL_TIER_NAMING_2026-06-12.md` — stored vs. portal tier naming
- `docs/architecture/PORTAL_STRATEGY_SAME_ROOM_MORE_DEPTH_2026-06-12.md` — business doctrine
