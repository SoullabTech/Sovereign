# Attention — MAIA's awareness model

- **Date**: 2026-06-18
- **Status**: Design proposal / interface target (Cat 2 candidate). **Not canon, not live.** Drafting is mine; filing as canon is Kelly's crossing.
- **Derives from**: [MAIA_ATTENTION_DOCTRINE.md](../canon/MAIA_ATTENTION_DOCTRINE.md), [MAIA_SOVEREIGNTY_INVARIANTS.md](../canon/MAIA_SOVEREIGNTY_INVARIANTS.md)
- **Reframes**: the "Notifications" settings surface (`app/studio/settings/page.tsx`, `components/account/AccountSettings.tsx`)
- **Lineage**: this is the same reconceptualization move as Email → Authorized Actions, Calendar → Shared Commitments, Memory → Sovereign Memory. Here: **Notifications → Attention.**

---

## Thesis

"Notification" carries assumptions imported from Slack, Teams, and social media: interruption, engagement, urgency. MAIA inverts the default. The question is not *"how do we reach the member"* but *"how should MAIA enter the member's awareness, on the member's terms."*

The infrastructure — in-app, email, SMS, push — becomes **implementation beneath a human-attention abstraction**, not the abstraction itself. This is the more fundamental layer, and it scales as capabilities (calendar, tasks, relationships, learning, field notes, shared work) are added: one mental model everywhere instead of a growing pile of per-feature toggles.

## Attention, not Presence

The surface is named **Attention** — not "Attention & Presence." The distinction is load-bearing: a member *configures* attention (when and how MAIA may request it). **Presence is something MAIA embodies, not something a member configures.** Naming the settings surface "Presence" would imply the member tunes MAIA's way of being, which inverts the relationship. Presence emerges elsewhere; here the member governs only the request for their own attention. (Kelly, 2026-06-18 review.)

Member-facing anchor copy for the section — stewardship, not interruption. It stays truthful to what is **live** (what surfaces and how it reaches you) and deliberately makes **no** silence / Sacred Time promise, since that infrastructure is not built:

> Choose what deserves your attention, and how MAIA may bring it to you. You can change this at any time.

("how MAIA *may* bring it to you" — permission framing: the member governs MAIA's request for their attention, not merely their preference about it.)

## Constitutional grounding

- **Attention Doctrine** — leave undisturbed the interior space that belongs to the person; deepen attention rather than compete with it. A settings surface that *protects* attention rather than *competing* for it.
- **Sovereignty Invariants** — increase agency; reduce the system's psychological centrality over time. The member owns what is important, when, and where.
- **Permission over obligation** — the behavioral test for the entire surface. An *invitation* preserves a permission: it can wait, be declined, expects no response. A *notification that nags* replaces a permission with an obligation. Every control here must keep the member the author of their own importance.

## The unified model (one pattern everywhere)

For each thing that could enter awareness, the member owns **four orthogonal choices**:

1. **Does this deserve my attention?** — surface / don't.
2. **When should it reach me?** — *cadence*, temporal and member-owned, never algorithmic:
   `Immediately` · `In today's digest` · `In the weekly digest` · `Only when I ask` · `Never`
3. **Where should it reach me?** — *channel*:
   `In-app` · `Email` · `SMS (later)` · `Push (later)`
4. **Sacred Time** — a cross-cutting protection, not a per-item setting (below).

### Sharpening: When and Where are different axes

An earlier framing mixed channel and cadence under one "How should I receive it" list. **Digest is a *when*, not a *where*.** Keeping the axes truly orthogonal — **Where = channel, When = cadence (digest is a cadence)** — is what lets the model stay simple as domains multiply. A new domain inherits the same two dropdowns; it never invents new vocabulary.

### Priority disappears

No "High Priority." That is an algorithm deciding importance. Importance is expressed **temporally** and **owned by the member**: `Immediate / Today / This Week / Never`. Temporal, not judgmental.

### Language: Invitations, not notifications

The copy reinforces that the member retains agency:

- "Invite me immediately"
- "Collect into today's reflection"
- "Only if action is needed"
- "Don't surface"

## Sacred Time (replaces Quiet Hours / Do Not Disturb)

> **Sacred Time** — Protect this time from interruption. Only what *you* name as urgent may enter.

- A member-authored window in which nothing crosses by default.
- **The exception list is also member-authored.** What counts as "emergency" is defined by the person, not inferred by the system — otherwise algorithmic priority re-enters through the back door.
- Overrides `Immediately` for everything not on the member's own cross-the-threshold list.

This is the constitution's language, not Apple's. "Sacred Time" / "Attention Sanctuary" reflects what the window is *for*.

## The rhythm: Receive → Protect → Reflect

The surface reads, top to bottom, as a rhythm of attention rather than a list of toggles:

1. **Receive** — *What may surface* (event × channel). The one movement that is **live** today.
2. **Protect** — *Sacred Time*. A member-authored window. **Future** infrastructure (below); shown honestly as "Not available yet."
3. **Reflect** — *Daily & weekly reflection*. How the member revisits what mattered. **Future** (below).

### Sacred Time — future structural promise (not present UI copy)

When Sacred Time's enforcement is built, the surface may state:

> Nothing is interrupted unless you've explicitly allowed it.

This is a **structural promise** — a claim the system keeps by construction — **not reassurance copy, and not present in the UI**. Per the enforcement-mode review test, a protection promise ships only when the structure makes it true; shown over un-built infrastructure it would be a protection the member believes in and the system cannot keep. Until that enforcement exists, the honest stand-in is the "Not available yet" badge — *do not* add this sentence to the UI before the infrastructure is real.

## Reflection (the Reflect movement) — future, not built

Design constraint, to be true by construction when built:

> Reflection is offered, never required.

MAIA helps the member *metabolize* experience; it never obligates a review, scores a day, or nags an unread digest. This is a constraint on the feature's design, not UI copy to add now.

**Reflection ships in two stages, divided by a hard discipline line:**

1. **Event roll-up (first).** A digest of discrete, **provenance-grounded** events the member already authored or received — e.g. "Nathan approved the calendar proposal," "Jeremy confirmed next Tuesday," "you postponed two commitments." Each item traces to a specific recorded event. No interpretation. This is the safe, buildable first version of Reflection.
2. **Thematic synthesis (later, gated).** Reading *across* conversations to surface patterns — e.g. "most conversations this week centered on grief and transition." This reads content and aggregates, landing directly on **Sanctuary Mode** (sanctuary sessions must never be retained or patterned) and the **synthesis freeze** (system-inferred themes are held until a consent + aggregation gate is designed). Shipping the roll-up does **not** authorize this. Same card, two different crossings — build the first, gate the second.

> **Status (2026-06-18):** none of the above is built. Sacred Time and Reflection remain "Not available yet" in the UI. This section records the *shape* of the future so it is visible without the future being claimed as live. **Do not build Sacred Time. Do not build Reflection. Do not place unimplemented promises in the UI.** (Kelly directive.)

## The domains (the "What") — honest mapping to what exists today

*Declaration is not liveness.* Each domain uses the **same four-axis pattern** when it lands; most do not have an attention layer yet.

| Domain | Status today | Maps to |
|---|---|---|
| Messages / Team activity | **Built** | `member_notification_preferences` (`dm_received`, `mentioned`, `thread_reply`, `channel_activity`) + `lib/team/notificationPreferences.ts` |
| Calendar (first-class) | Not built | Proposals requiring approval · events MAIA created · changes to shared events · conflicts · daily agenda → Authorized Action / proposal work + `calendar_events` |
| Scheduled emails | Partial | `scheduled_sends` (L2 send rail) exists; surfacing-on-send not wired to an attention layer |
| MAIA reflections | Not built | — |
| Relationships | Not built | `field_people` activity |
| Learning updates | Not built | — |
| System | Partial | `security_alerts` is admin-side only |

**Calendar is a first-class citizen**, not an afterthought — and notice its items are *awareness preferences*, not notifications:

```
Calendar
  □ Proposals requiring approval
  □ Events MAIA created
  □ Changes to shared events
  □ Conflicts needing attention
  □ Daily agenda
```

## Long-term shape

Settings looks less like `Notifications` and more like:

```
Attention
  Messages
  Calendar
  Shared Work
  Relationships
  Learning
  System
```

Each section, same pattern: *Should this surface? · When? · Where?* — with **Sacred Time** as the cross-cutting boundary.

## Implemented (2026-06-18, branch `feature/rapport-pilot-v1`)

Phase 0 + Phase 1 landed **together, on the Studio settings surface** (`app/studio/settings/page.tsx`) — not the account surface originally sketched below; this is where the work began. What shipped:

- The cosmetic "Notifications" section (client-only dead toggles: Agent Complete / High Priority / Review Ready / Sound) is **replaced** by a persistent **"Attention"** section.
- A **what × how matrix**: events (`dm_received`, `mentioned`, `thread_reply`, `channel_activity`) × channels (`in_app`, `email` live; `sms` disabled until phase 3), persisted per-toggle via the **existing** `GET`/`PUT /api/team/notifications/preferences` → `member_notification_preferences`. No new table, API, or system.
- **Sacred Time** and **digest / weekly reflection** shown as "Not available yet" (model visible, infra honest).
- Defaults **unchanged** (see Decisions) — the code-resolved `DEFAULTS` in `notificationTypes.ts` remain today's baseline.

Still unbuilt: the **When** axis (cadence) and a member-authored Sacred Time window. Today's matrix is event × channel only.

## Phased path (original proposal)

- **Phase 0 — Language & frame** (Studio settings): rename "Notifications" → "Attention," reframe copy to invitations, replace "High Priority" with temporal cadence. *(Done — and unlike the original "presentation only" caveat, persistence landed with it; see Implemented.)*
- **Phase 1 — The model, on the member's own surface** (account settings): wire per-domain × cadence × channel against an extended `member_notification_preferences` (today it stores channel booleans; add a **cadence** column). Start with the one domain that is built: Messages / Team. *(Landed on the Studio surface instead; account surface still open — see Open questions.)*
- **Phase 2 — Sacred Time**: member-authored window + member-authored exception list.
- **Phase 3 — Extend domains as capabilities surface**: Calendar proposals first (connects directly to the Authorized Action work).

## Decisions (2026-06-18 review)

- **Name = Attention** (not "Attention & Presence") — Presence is embodied, not configured (see above).
- **Defaults left unchanged.** Changing `DEFAULTS` in `notificationTypes.ts` alters behavior for every member before anyone has observed how members actually configure attention. The current defaults are *today's operating assumptions / baseline*, not a claim they are ideal. Revisit only when field observation (Heather) yields evidence — consistent with the project's earn-before-name / measure-don't-optimize discipline.
- **Review sequence before further change:** (1) Kelly logged in; (2) Nathan strictly as engineering; (3) Heather strictly as member experience & language; (4) only then decide whether any defaults change.

## Open questions (await Kelly's authored decision)

- Whether **Attention** becomes a named canon primitive (filing is Kelly's crossing, not mine).
- Sacred Time's "emergency" vocabulary — must stay member-owned.
- Whether Studio (practitioner) and account (member) share one Attention surface or mirror the same model in two places.
