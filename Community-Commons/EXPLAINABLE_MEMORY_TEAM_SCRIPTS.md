# Explainable Memory — Team Scripts

**Status:** Shipped
**Date:** January 2026
**Use:** Standups, partner demos, investor conversations

---

## 30-Second Standup (Verbatim)

> **Read this exactly. Don't improvise.**

- Shipped **Explainable Memory** end-to-end: patterns → evidence → feedback loop.
- Backend now **attaches top patterns to every chat response** (`metadata.patterns`).
- Frontend renders **PatternChips + "Show Why" drawer**, with **evidence** + **Confirm / Not me / Refine** actions.
- APIs live: **pattern list**, **pattern evidence**, **pattern feedback**.
- Verified with proof user: patterns show up in `/api/between/chat` and populate UI.

**One sentence:**
> MAIA can now form pattern memory she can explain — and users can correct.

**Next:** Regression coverage + Sanctuary (session-level memory exclusion) UX.

---

## 2-Minute Demo Script (Partners / Investors)

**Audience:** Non-technical. Decision-makers. People who've been burned by AI hype.
**Tone:** Confident, grounded, human.
**Timing:** ~400 words / 2 minutes at conversational pace.

---

### [OPEN — 10 seconds]

Most AI remembers everything. That's the pitch — and the problem.

MAIA is different: **she remembers with consent — and she shows her work.**

---

### [TRUST FIRST — 45 seconds]

Not every session has to become long-term memory.

Some sessions can be **Sanctuary** — useful in the moment, then gone. No logs. No training data. No harvest.

Why does this matter?

Because real honesty requires safety. People won't speak freely to a system that might later monetize or weaponize their vulnerability.

So we built the opposite: a companion that can forget on purpose.

---

### [CO-AUTHORSHIP — 45 seconds]

Now here's what happens when something *does* stay.

MAIA notices patterns over time — in choices, body themes, relationships, recurring edges. But she doesn't just assert conclusions. She shows receipts.

Here's the magic: **click a pattern chip**. You see the **evidence** — the moments that led to it. Then *you* decide: **Confirm**, **Reject**, or **Refine**.

You're not the subject of an AI diagnosis. You're the author of your story — with a companion that pays attention and asks permission.

---

### [CLOSE — 20 seconds]

We call this **explainable memory**.

Not as a buzzword — as a rule:

> **If MAIA can't explain why she thinks something, that's a system failure — not a user failure.**

**One-liner:**
> MAIA remembers with consent — and shows her work.

---

## If Asked (Q&A Cheat Sheet)

| Question | Answer |
|----------|--------|
| "How is this different from ChatGPT memory?" | ChatGPT remembers *for itself*. MAIA remembers *with you* — you see the evidence and can correct it. |
| "What about privacy?" | Sanctuary mode = some sessions never enter memory. You choose what stays. |
| "Can users delete patterns?" | Yes. Reject removes it. Refine lets them correct it. |
| "Is this just a database of facts?" | No. It's layered: episodes, meaning, patterns, relationships, developmental arcs. Patterns are the *visible* layer — backed by everything underneath. |
| "What's the business model?" | Subscription, not data harvesting. We don't sell the person. |

---

## What We Shipped (Technical Summary)

| Capability | Status | Endpoint / Component |
|------------|--------|---------------------|
| Pattern detection | Live | Backend pattern engine |
| Patterns API | Live | `GET /api/patterns` |
| Evidence API | Live | `GET /api/patterns/:id/evidence` |
| Feedback API | Live | `POST /api/patterns/:id/feedback` |
| Metadata attachment | Live | `/api/between/chat` includes `metadata.patterns` |
| PatternChips UI | Live | Renders under MAIA messages |
| PatternDrawer | Live | Shows evidence + feedback actions |
| Proof ritual user | Live | Regression tool for testing full loop |

---

## Memory Layers (What MAIA Can Remember)

| Layer | What It Stores | User Value |
|-------|----------------|------------|
| Conversational | Current thread | "Continue that thought" |
| Episodic | Meaningful moments | "Bring back that insight from last week" |
| Semantic | Concepts + embeddings | "Find the thread across conversations" |
| Pattern | Recurring themes | "Here's what keeps showing up" |
| Relational | Relationship dynamics | "How has this evolved over time?" |
| Developmental | Growth arcs + practices | "What's actually working for me?" |
| Sanctuary | Nothing (ephemeral) | "This stays between us, then gone" |

---

## The Ethical Spine

**Sentences the team should internalize:**

> "We open the rules of memory, not the soul itself."

> "If MAIA can't explain why, that's a system failure — not a user failure."

> "MAIA remembers to serve the person — never to harvest the person."

---

## Sanctuary Mode (Upcoming)

**What it is:**
Session-level memory boundary. User chooses that certain engagements do not get integrated into long-term memory.

**Toggle copy (draft):**
> **Sanctuary Mode**
> This session won't be remembered. Speak freely.

**Learn more microcopy (draft):**
> Sanctuary sessions are useful in the moment, then gone. No patterns formed. No memories stored. Just presence.

---

## Next Steps

1. **Regression coverage** — automated tests for pattern → evidence → feedback loop
2. **Sanctuary UX** — toggle + confirmation flow
3. **Pattern confidence thresholds** — only surface patterns above significance threshold
4. **Retrospective skill integration** — learnings from sessions compound into skill updates
