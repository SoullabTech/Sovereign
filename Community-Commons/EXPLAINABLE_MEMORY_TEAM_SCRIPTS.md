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

---

## Internal Anchor: Disposable Pixels

**For the team. Not the website.**

> *Some interactions are meant to exist only in the moment. We design for that on purpose.*

This gives the team a non-ethicalized way to talk about restraint. Nobody feels the urge to over-explain.

**Rule of 2:** In any conversation, you get *one sentence* on memory consent unless the other person asks a second question. This prevents sliding into a 90-second arc just because you're proud of it.

---

## One Sentence Per Room (Only If Asked)

Use these to close the loop without opening a debate.

| Room | One sentence |
|------|--------------|
| **Spiritual elders** | "Some conversations are meant to pass through, not be carried forward — MAIA respects that." |
| **Product / dev** | "We treat memory like state, not logging — some interactions are intentionally ephemeral." |
| **Therapeutic / clinical** | "We support reflective work without forcing continuity — not everything needs to become part of a record." |
| **Investors / partners** | "We built consent into how memory works, so trust holds under scale." |
| **Enterprise / compliance** | "The system can operate fully without retention when required — by design, not exception." |

**Success metric:** They say "that makes sense" and don't bring it up again.

---

## What NOT to Say

Avoid these phrases — they can trigger unnecessary debate:

- "Privacy-first"
- "We don't store your data" (absolute claims invite audits)
- "Ethical AI" as a lead phrase
- Overusing "Sanctuary" outside the product itself

**Disposable pixels** feels natural. The others can open conversations you didn't intend.

---

## If Asked: Memory Consent (Investor/Partner Only)

**Use only when trust architecture is directly relevant.**

### Sanctuary: Consent-Based Memory

**We don't offer anonymity. We offer consent-based memory.**

**Why Sanctuary is absolute (v1):**

- **Trust must be simple.**
  "Nothing crosses the line" is the only boundary people can feel in their body without doubt.

- **Exceptions break trust at scale.**
  The moment you allow "just this once," you create confusion, loopholes, and anxiety about what was really saved.

- **Honest reflection needs safety.**
  Sanctuary exists so people can think, feel, and speak freely — without wondering how it will be used later.

**Closing line (anchor):**

> Sanctuary is presence without extraction — useful now, gone after.

---

## If Asked: Two Memory Modes (Visual Aid)

**Only if someone needs the architecture explained.**

### Two Intentional Memory Modes

| Sanctuary | Continuity |
|-----------|------------|
| *Presence without extraction* | *Memory in service of growth* |
| Nothing from this session is saved | Patterns form only with consent |
| No patterns formed, no continuity claims | MAIA shows why she remembers |
| Designed for honesty, reflection, and inner work | Users confirm, reject, or refine meaning |
| Useful now, gone after | Designed for learning, coherence, and long-term support |

**Bottom line (spoken):**

> We didn't build one memory system. We built *choice*.

---

## If Asked: Full Trust Story (90 Seconds)

**Rarely needed.** Only for investor deep-dives or compliance-sensitive partnerships. The UI carries 90% of the meaning — this is the 10% backup.

---

**[0–15s | Frame]**
"Most AI remembers everything by default. People edit themselves the moment they feel harvested."

**[15–40s | Difference]**
"MAIA offers consent-based memory. Continuity when you want it, with receipts. Sanctuary when you don't — nothing saved, nothing formed."

**[40–60s | Why absolute]**
"Sanctuary is absolute on purpose. Trust has to be simple enough to feel. Add exceptions, and the boundary collapses."

**[60–80s | Moat]**
"Systems that extract trust burn it. Systems that respect consent compound it. You can't retrofit that."

**[80–90s | Close]**
"When people trust the system, they stay. That's where durable revenue comes from."

---

**Calibration note:** Don't lead with this. Let the feature be discovered. Over-explaining privacy creates the opposite effect — it makes people wonder what you're hiding.

---

## Transition Sentences → Revenue / Governance

Use depending on the room:

**Neutral / Board-ready:**
> Because memory is consent-based, trust compounds — and trust is what makes this system defensible at scale.

**Founder / Visionary:**
> When people trust the system, they stay — and that's where sustainable revenue actually comes from.

**Investor / Moat-focused:**
> This architecture turns ethical restraint into a compounding advantage competitors can't retrofit.

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
