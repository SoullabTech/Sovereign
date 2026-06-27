# Soullab Co-lab — Arrival Experience (Design)

> **Channel-agnostic design.** First channel binding: **Telegram** (`@SoullabMyBot`). The experience described here must remain valid if the same doorway is later opened in Signal, WhatsApp, email, or web chat.

**Status:** Product design artifact — the **canonical source** for the future Tier 1 webhook implementation. This is a *conversation design*, not a webhook spec. No endpoint code, payloads, or routes here.
**Date:** 2026-06-27
**Bot:** `@SoullabMyBot` — verified **send-only** on 2026-06-27 (no webhook registered, no commands, empty Description/About; profile photo set). It currently only *sends* (e.g. session reminders); nothing reads or replies to inbound messages.
**Related:** stewardship model · Conditions of Encounter · `docs/canon/MARKETING_CLAIM_DISCIPLINE.md` · `docs/canon/MAIA_CANON_v1.1.md` (non-simulation, containment) · Wisdom Files (`app/library/page.tsx`)

---

## 0. Why this document exists

The **entry point** now exists — the Wisdom Files "Soullab Co-lab on Telegram" CTA points to `@SoullabMyBot`. The **arrival experience** does not. That gap is a *product* problem, not a messaging problem.

Three tiers, with a deliberate gap this document fills:

| Tier | Solves | Status |
|------|--------|--------|
| **Tier 0** | First impressions (BotFather Description/About) | Copy ready (Appendix A); Kelly to set |
| **This doc** | The **conversation** between arrival and interaction | ← you are here |
| **Tier 1** | Interaction (inbound webhook, `/start` handler, chat_id capture) | Postponed *on purpose* |

**Governing principle:** *implementation follows product design.* The webhook implements this conversation; it does not invent it. The first contributor interaction is hard to change later — the endpoint is straightforward by comparison.

**Scope & altitude (channel-agnostic).** §1–§9 describe the arrival *experience* and must stay valid if the same doorway is later implemented in Signal, WhatsApp, email, or web chat. **Telegram is the first channel binding, not the design.** Channel-specific affordances — buttons, reply keyboards, command menus, webhook-vs-polling, secret-token verification — are out of scope here and belong to the implementation spec. Telegram-specific operational material is quarantined in the Appendices.

---

## 1. Design principles (load-bearing)

> **Arrival is the first act of stewardship.**
>
> The purpose of the arrival experience is not merely to route a message or expose functionality. It is to establish an honest relationship between the visitor and the platform by communicating what this place is, what is possible today, what is not yet possible, and what kind of human stewardship the visitor can expect. Every implementation of the arrival experience should preserve this relationship regardless of communication channel.

This is the **root commitment** — it is *why* this document exists. The principles below, together with the stewardship vocabulary (§4), boundaries (§5), capability ledger (§6), and first-visit success criteria (§8), are all **consequences** of it — not independent UX choices.

1. **`/start` is a conversation, not a menu.** Before offering any action, answer three questions: *What is this place? Why might I be here? What can I do today?*
2. **Claim discipline.** Never present capability that doesn't exist yet. Separate **Available now** from **Coming later**, explicitly and visibly.
3. **Stewardship vocabulary, never transactional.** *received → under stewardship → reviewed → responded to* — never *submitted / processed / completed / ticket #*.
4. **Same platform, another doorway.** The bot is the **Telegram presence of Soullab**, carrying the same stewardship model as the rest of MAIA — not a separate utility.
5. **No dead branches.** Every path ends in a real next step or an honest "a steward will follow up." Silence is a bug.
6. **Boundaries are features.** "Out of scope today" is stated as clearly as capability.

---

## 2. Voice & identity of the bot

The bot speaks as **Soullab's doorway / its stewards** — warm, plain, sovereign, non-hype.

- It **does not speak as MAIA** and does not simulate a personal relationship, intimacy, or certainty (MAIA Canon: no simulated intimacy). When it's the bot speaking, that's clear.
- It is **tended by people.** The honest frame is "we read this and respond," not "the system has handled it."
- It never positions itself as therapy, authority, or a substitute for the member's own judgment.

---

## 3. The arrival conversation (`/start`)

### 3.1 First message — orientation (the three questions, in order)

> **Welcome to Soullab Co-lab.**
>
> **What this is** — the Telegram doorway into Soullab. A place to offer your wisdom, ask a question, and take part in what we're building. It's tended by people, not automated.
>
> **Why you might be here** — maybe you followed the link from the Wisdom Files, you have something you've written to share, or you have a question about Soullab or MAIA.
>
> **What you can do today** — three things: share a Wisdom File, ask a question, or report an issue. A few more things are coming later (I'll be honest about which is which).
>
> Where would you like to begin?

*Only after this orientation are paths offered.* The orientation is not skippable on first contact — it's the difference between a doorway and a command line.

### 3.2 Paths

**Available now** (each leads somewhere real):
- 📄 **Share a Wisdom File**
- ❓ **Ask a question**
- 🐞 **Report an issue**

**Coming later** (named, never tappable into nothing):
- 👥 **Join the community** — when the real Co-lab group opens
- 📚 **Upload a personal library** — not yet supported
- 🤝 **Practitioner collaboration** — not yet supported

> *How* options are presented — selectable buttons, typed replies, links, numbered choices — is a **channel/implementation choice**, not part of this design. The *design requirement*: paths are offered only **after** the orientation; "Coming later" items are **visible and honest**; and choosing one always returns either a real next step or a graceful "not yet — here's what is available." Never a dead end.

### 3.3 Per-path responses (stewardship-framed)

**📄 Share a Wisdom File**
> Beautiful. Send it here as text or a Markdown file — an original insight or practice. A few things help us steward it well: share your own work, cite any sources, and tell us how you'd like to be credited.
>
> Here's what happens next:
> • **Received** — it's with us.
> • **Under stewardship** — a person reads it with care.
> • **Reviewed** — we consider its fit and depth.
> • **Responded to** — we come back to you, whether or not it's published.
>
> Nothing is published automatically, and never without your name where you want it.

**❓ Ask a question**
> Go ahead and ask. This isn't a live support line, and it isn't a MAIA conversation — it's a way to reach the people behind Soullab. We read what comes in and respond; you'll hear back from a person.

**🐞 Report an issue**
> Thank you — this genuinely helps. Tell us what happened and where (a screenshot helps). We'll get it to the right person, let you know we received it, and follow up.

### 3.4 Fallback / free-text / unknown input

If someone types a message without choosing a path: **receive it gracefully.** Acknowledge as *received / under stewardship*, then gently offer the three paths. Never ignore, never error, never "I didn't understand that command."

### 3.5 Interim honesty (before Tier 1 ships)

Until the webhook exists, even "Available now" paths are **steward-relayed, not automated.** The copy already reflects this ("a person reads it," "you'll hear back from a person") — so the conversation stays true whether the eventual routing is automated capture or a steward reading `getUpdates`. The bot must never imply automation it doesn't have.

---

## 4. Stewardship states (canonical vocabulary)

| State | Meaning | What the contributor hears |
|-------|---------|----------------------------|
| **Received** | It's with us | "We have it." |
| **Under stewardship** | A person is holding it | "Someone's reading this with care." |
| **Reviewed** | Considered for fit/depth | "We've looked closely." |
| **Responded to** | Loop closed | "Here's what we think / what's next." |

**Forbidden vocabulary:** *submitted, processed, completed, ticket, queue, request #, automated reply.* Transactional words break the doorway feeling and make Telegram read as a separate utility.

---

## 5. Out of scope today (explicit boundaries)

This bot:
- **does not provide live therapeutic or crisis support;**
- **does not automatically publish** submissions;
- **does not replace MAIA conversations;**
- **does not yet support** document uploads or personal libraries;
- **does not represent itself as MAIA** or as a human when it is the bot speaking.

**Safety deflection (required, even in interim):** because this is a *public* doorway, people may arrive in distress. The arrival flow must include a brief, compassionate line — *"If you're in crisis, this bot can't help in the moment. Please reach [crisis resource]."* — consistent with MAIA's containment vow. This is non-negotiable for a public entry point and should be set even at Tier 0 if possible.

---

## 6. Capability ledger (claim-discipline, single source of truth)

The webhook reads status from this ledger so copy and reality can never drift. Mapped to the canon's **Live / Designed / Vision** instrument.

| Capability | Center of gravity | What the bot says |
|-----------|-------------------|-------------------|
| Share a Wisdom File | **Designed** (interim: acknowledge + steward follow-up; full ingestion = Tier 1) | offered now |
| Ask a question | **Designed** (interim: relayed to stewards) | offered now |
| Report an issue | **Designed** (interim: relayed to stewards) | offered now |
| Join the community | **Vision** (blocked on a real `t.me/+…` group invite) | "coming when the group opens" |
| Upload personal library | **Vision** | "not yet" |
| Practitioner collaboration | **Vision** | "not yet" |

Note: nothing here is "Live/automated" yet. The honest interim framing for the three available paths is *"you can do this, and a steward will respond"* — not *"this is fully automated."*

---

## 7. What this hands to Tier 1 (the webhook implements, does not invent)

- the `/start` orientation message (§3.1) and path affordances (§3.2)
- per-path response copy (§3.3) and graceful free-text fallback (§3.4)
- the stewardship-state vocabulary (§4) anywhere it reports status
- the boundaries (§5) and the crisis deflection
- reads capability status from the ledger (§6) so it can't promise vapor
- captures the visitor's **reply handle** (e.g. a Telegram `chat_id`) on first contact for later response — with consent framing consistent with Sanctuary / consent principles (tell people the bot will remember how to reach them; never capture silently)

**Open questions for the implementation spec (NOT decided here).**
*Product / channel-agnostic:* where steward-bound contributions land and who reviews them; the human response workflow; reply-handle storage + consent record.
*Channel-specific (Telegram is the example — these belong in the spec):* how options are rendered (buttons vs. typed replies vs. links); transport + security (webhook vs. polling; secret-token verification).

---

## 8. Success criteria for a first visit

The measurable product target — independent of any channel or UI. After a first interaction, a new visitor should:

- **understand what Co-lab is;**
- **understand what's possible today** — and what isn't yet;
- **know what will happen to their contribution** (the stewardship states, §4);
- **know roughly when to expect a response** — the actual window (e.g. "within a few days") is a commitment Soullab sets and the copy should state; it is not invented here;
- **leave confident that a human steward received them** — not that a machine processed them.

If a first visit doesn't produce these five outcomes, the arrival experience has failed — regardless of how polished the channel implementation is. This is what the webhook (and any future channel) is measured against, and what §9 checks.

---

## 9. Review checklist (gate before Tier 1 begins)

- [ ] Would a first visit produce the **five outcomes in §8**?
- [ ] Does `/start` answer the **three questions** before offering any action?
- [ ] Does **every** path end without a dead branch?
- [ ] Is any "Coming later" capability ever tappable into nothing?
- [ ] Does all copy use **stewardship** vocabulary, never transactional?
- [ ] Are the **boundaries** + **crisis deflection** present?
- [ ] Does anything claim **automation that doesn't exist**?
- [ ] Does it read as the **same platform** (a doorway into Soullab), not a separate utility?
- [ ] Does the bot avoid speaking **as MAIA** / simulating intimacy?

---

## Appendix A — Tier 0 BotFather copy (first impressions)

Set via **@BotFather → `/mybots` → @SoullabMyBot → Edit Bot**. (Both fields are currently empty.) Do **not** set commands yet — a command menu with no handler dead-ends exactly like `/start` does.

**Edit Description** (empty-chat screen *before* START; ≤512 chars):
```
Soullab Co-lab — the Telegram home of Soullab.

Share a Wisdom File (an original insight or practice for consciousness exploration), ask a question, or follow what the community is building. Markdown welcome. Everything is reviewed before publishing.

Prefer email? submissions@soullab.life

Tap START to begin.
```

**Edit About** (profile + link previews; ≤120 chars):
```
The Telegram home of Soullab — share Wisdom Files, ask questions, follow the Co-lab. Reviewed before publishing.
```

---

## Appendix B — current technical state (2026-06-27, verified)

- `@SoullabMyBot` (id 8307510998): `getWebhookInfo.url=""`, `getMyCommands=[]`, Description/About empty, photo set, `can_join_groups=true`, privacy mode on.
- Code: only `lib/comms/providers/TelegramProvider.ts` (send + unused `setWebhook`/`getUpdates` primitives; `parseWebhook` returns null) and `app/api/notifications/telegram/route.ts` (outbound POST + setup/debug GET). No inbound route, no bot framework, no polling worker.
- Wisdom Files CTA → `t.me/SoullabMyBot` is wired but **uncommitted** (branch `fix/faq-claim-discipline`); beta-email private `t.me/c/3246163571` link intentionally **not** swapped until a real public group/channel invite exists.
