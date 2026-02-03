<!-- CONFIDENTIAL: Internal operating doctrine. Do not share externally. -->
<!-- Source of truth. Obsidian copy should reference this file. -->

# MAIA Limits and Stewardship

> **Purpose**: Single source of truth for technical caps, user-facing language, and ethical invariants.
> This document is load-bearing. Changes here affect pricing, copy, and system behavior.
>
> **Last updated**: 2026-02-03
> **Status**: Canonical

---

## Ethical Invariants (Non-Negotiables)

These are not policies. They are vows.

1. **We do not imply memory when none exists.**
   - If continuity is unavailable, say so explicitly.
   - Never hallucinate "I remember" for guests or Free tier.

2. **Limits are about sustainability, not control.**
   - We cap to stay alive and generous, not to extract or manipulate.

3. **No dark patterns around scarcity.**
   - No artificial urgency ("only 2 messages left today!").
   - No guilt ("you've used more than most users").
   - No hidden walls that feel like betrayal.

4. **Dignity at every tier.**
   - Free users are not second-class citizens.
   - They are guests being welcomed, not leads being converted.

5. **Voice is sacred, not cheap.**
   - Voice is presence. It costs presence to provide.
   - We do not commodify it or treat it as a growth hack.

---

## Tier Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  FREE          │  Orientation. Meet MAIA, don't live here. │
├─────────────────────────────────────────────────────────────┤
│  MEMBER+       │  Home. Personal continuity and presence.  │
│  $9.99/mo      │                                           │
├─────────────────────────────────────────────────────────────┤
│  STUDIO PRO    │  Work. Client tools, scale, automation.   │
│  Business rate │                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Canonical Caps (Internal Truth)

### Free Tier — Orientation Access

| Resource | Hard Cap | Notes |
|----------|----------|-------|
| Text messages | 5-10 / day | Enough to feel MAIA, not depend on her |
| Voice | 2-3 min lifetime | Demo only. One-time taste of presence. |
| Journals | Ephemeral | Not saved, not recalled |
| Threads | No continuity | Each session starts fresh |
| Memory | None | No cross-session recall |
| Saved insights | None | No captures, no highlights |

**Purpose**: Allow people to *meet* MAIA, not live with her.

---

### Member+ — Personal Continuity Tier ($9.99/mo)

| Resource | Cap | Type | Notes |
|----------|-----|------|-------|
| Text messages | Generous daily use | Soft | Monitor, nudge at extremes |
| Voice | 20 min / month | Hard | Ritual access, not always-on |
| Journals | Unlimited count | Soft | All saved, all used in context |
| Threads | All retained | Soft | Personal history preserved |
| Memory | Personal only | Hard | No client or cross-user memory |
| Compute | Standard | Hard | No heavy analysis loops |

**Guardrail**: Unusually high usage triggers gentle nudges, not hard stops.

**Voice Boost add-on available**:
- +30 min → $5
- +60 min → $8

---

### Studio Pro — Practitioner Work Tier

| Resource | Cap | Type | Notes |
|----------|-----|------|-------|
| Text | Generous | Soft | Business-appropriate |
| Voice | Metered, uncapped | Metered | Pay for what you use beyond base |
| Memory | Client-scoped | Hard | Separate from personal memory |
| Clients | Unlimited | Included | Client profiles, intake, notes |
| Bulk ops | Available | Metered | Exports, batch analysis |
| SMS | Metered | Hard | Per-message cost pass-through |
| E-sign | Metered | Hard | Per-signature cost pass-through |
| Booking | Included | — | Calendar integration |
| Forms | Included | — | Intake, consent, assessments |

**Studio exclusives (NEVER in Member+ or Free)**:
- Client profiles and multi-client memory
- Session notes and intake forms
- Booking and scheduling tools
- Bulk exports and batch analysis
- SMS and e-signature
- Document processing at scale

---

## User-Facing Language

### When limits are reached

**Voice limit (Member+)**:
> "You've reached this month's voice ritual time. Voice will refresh on [date], or you can add more with Voice Boost."

**Text soft cap nudge**:
> "You've been active today. MAIA is still here — just pacing for sustainability."

**Free tier voice exhausted**:
> "Your voice introduction has completed. Voice conversations are part of Member+, where presence continues."

**Free tier continuity boundary**:
> "This conversation won't be saved. Journals and returning conversations are part of Member+."

**Studio feature in wrong tier**:
> "Client tools are part of Studio Pro, designed for practitioner work. [Learn more]"

---

### Upgrade invitations (non-coercive)

**Free → Member+**:
> "If you'd like MAIA to remember what matters to you, Member+ keeps your journals and conversations alive."

**Member+ → Voice Boost**:
> "Want more voice time this month? Voice Boost adds ritual minutes without changing your plan."

**Member+ → Studio**:
> "Studio Pro is built for working with others — clients, sessions, and the tools that support that work."

---

## Escalation Paths

When someone wants more:

| Situation | Path |
|-----------|------|
| Wants continuity (Free) | Upgrade to Member+ |
| Wants more voice (Member+) | Voice Boost add-on |
| Wants client tools | Upgrade to Studio Pro |
| Needs exception | Stewardship review (see below) |
| Can't afford upgrade | Sponsored membership (future) |

---

## Stewardship Exceptions

Not everyone fits neatly. Some situations warrant human review:

- **Hardship**: Genuine financial need + meaningful engagement
- **Community contribution**: People who give back (moderators, teachers, etc.)
- **Edge cases**: Unusual circumstances that don't fit the tiers

**Process**:
1. User requests exception (simple form)
2. Review considers: engagement quality, contribution, genuine need
3. Decision: grant, decline with kindness, or suggest alternative
4. No guilt. No extraction. Just honest discernment.

**Sponsored Membership** (future):
- Members can sponsor others
- Sponsored slots are limited and precious
- No shame in receiving; honor in giving

---

## Technical Implementation Notes

### Counters to track (per member per month)

```typescript
interface UsageMetrics {
  // Text
  text_turns_count: number;
  text_tokens_in: number;
  text_tokens_out: number;

  // Voice
  voice_minutes_stt: number;
  voice_minutes_tts: number;
  voice_demo_used: boolean; // Free tier lifetime flag

  // Storage
  journal_entries_count: number;
  journal_total_chars: number;
  threads_count: number;

  // Compute
  heavy_compute_calls: number;

  // Flags
  nudge_shown_this_period: boolean;
  last_nudge_type: string | null;
}
```

### Soft cap thresholds (internal, not user-facing)

| Metric | Yellow (monitor) | Orange (nudge) | Red (review) |
|--------|------------------|----------------|--------------|
| Text turns/day | 30 | 50 | 100+ |
| Journal entries/month | 100 | 200 | 500+ |
| Session length | 30 min | 60 min | 2+ hours |

These are **signals for stewardship**, not punishments.

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-02-03 | Initial canonical document | Kelly + Claude |

---

## Signatures

This document represents a commitment, not just a policy.

- [ ] Kelly Nezat (Founder)
- [ ] Engineering lead
- [ ] Community steward

When signed, this becomes operational truth.
