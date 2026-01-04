# MAIA Focus Tools Manual (Member Guide)
**For Community Commons**
**Version:** 1.0
**Last updated:** January 4, 2026
**Applies to:** MAIA-SOVEREIGN (Claude Code v2.0.76 workflow + Focus Tools)

---

## What these tools are (in plain language)

MAIA's **Focus Tools** are small "helper modes" that appear when you're stuck, overloaded, or avoiding something.

They're not a separate app section you have to hunt for.
They show up as **gentle invitations during conversation**—right when MAIA notices a familiar pattern:

- *"I'm overwhelmed."* → you probably need a **Next Step**
- *"I keep avoiding this message."* → you probably need an **Avoidance Breaker**
- *"Before I forget…"* → you probably need **Inbox Triage**

Think of them as **a soft hand on your shoulder** that helps you convert inner noise into clean action.

---

## How you access Focus Tools

### The simplest way
Just talk normally.

If your message contains a "focus pattern," MAIA may respond with something like:

> "Want to break this down into the tiniest next step?"
> "Want help drafting that message (and setting a follow-up so it doesn't haunt you)?"
> "Want to quickly capture and sort what's in your head?"

You'll see options like:
- **Yes, let's explore**
- **Not now**

If you accept, the tool opens in a **bottom sheet** (a panel that slides up), so you don't lose the conversation thread.

---

## The three core Focus Tools

## 1) Inbox Triage (Quick Capture)
### When it appears
When you're holding too much in your head, or you're trying not to forget something.

Common triggers:
- "I need to remember something…"
- "Before I forget…"
- "I have an idea…"
- "So many things on my mind…"
- "Let me just get this out…"

### What it does
Inbox Triage helps you:
- **capture** what's in your mind (fast)
- **sort** it into a sane bucket
- optionally **schedule** a follow-up so it doesn't dissolve

### Best way to use it
1. Drop the raw thought(s) in one messy dump.
2. Let MAIA reflect them back as a short list.
3. Choose what happens next (examples):
   - "Do now"
   - "Schedule"
   - "Track as next step"
   - "Park it / Someday"
4. If scheduling: MAIA can create a follow-up event in your **Soullab Workspace calendar** (if connected).

### Example
You:
> "Before I forget: pay the renewal, call the vet, and I just had an idea for the next Soullab workshop."

MAIA (invites Inbox Triage) → you accept → MAIA turns it into a clean triage list.

---

## 2) Next Step Builder
### When it appears
When something feels big, foggy, overwhelming, or you can't start.

Common triggers:
- "I can't start this project."
- "I don't know where to begin."
- "It's too overwhelming."
- "I keep procrastinating on…"
- "I'm stuck."

### What it does
Next Step Builder turns "a mountain" into **one small, real action**—the kind your hands can actually do.

It focuses on:
- the **tiniest meaningful next step**
- a **timebox** (so it stays humane)
- what might **block you** (and how to make it easier)

### The core question it answers
**"What is the first thing your hands would do?"**

Not the whole plan. Not the perfect plan.
Just: *open the doc, create the folder, write the first line, choose the date, send the one text.*

### Example
You:
> "I need to build this landing page but I'm frozen."

MAIA might guide you to:
- "Open the design file"
- "Create a blank page called 'Landing v1'"
- "Paste the 3 bullet promise"
- "Set a 12-minute timer"

That's a win. The goal is motion.

---

## 3) Avoidance Breaker
### When it appears
When you're avoiding a message, a conversation, a response, or a request.

Common triggers:
- "I need to text/email someone…"
- "I've been avoiding this message…"
- "I haven't replied to…"
- "I'm dreading sending this…"

### What it does
Avoidance Breaker helps you:
- name what you're avoiding (without shaming you)
- draft the message in the tone you want
- make it short and sendable
- **schedule a follow-up reminder** so it doesn't hang over you

### Why it works
Avoidance often isn't laziness—it's usually:
- emotional charge
- unclear stakes
- fear of conflict
- fear of being misunderstood
- perfectionism ("I need to say it perfectly")

This tool reduces the charge by making the next move *simple and clean.*

### Example
You:
> "I've been putting off emailing my landlord about the leak for a week…"

MAIA offers Avoidance Breaker → you accept → MAIA:
- drafts a clear landlord email (polite / firm / brief — your choice)
- gives you a copyable version
- offers to schedule a follow-up in your calendar (e.g., 48 hours)

---

## Scheduling Follow-Ups (Soullab Workspace Calendar)

Some Focus Tools can optionally create a follow-up reminder/event in your calendar.

### What you'll notice
- If your Google Calendar is connected, MAIA can schedule the follow-up into your **Soullab Workspace calendar**
- If it's not connected, MAIA will still help you draft/plan, but scheduling may be disabled until permissions are set

### Good moments to schedule
- after sending an avoided message
- after choosing a next step you want to protect
- when something is time-sensitive but you're overloaded

---

## How to get the tool you want (quick phrases)

If you want to "call" a tool more directly, just say:

### Inbox Triage
- "MAIA, quick capture: …"
- "Help me triage what's in my head."

### Next Step Builder
- "I need the tiniest next step on this."
- "Help me find the first hands-on action."

### Avoidance Breaker
- "Help me draft this message."
- "I'm avoiding replying—can you help me write something short?"

---

## Best practices (the "how to make this work" section)

1. **Don't polish your first message.** Messy input is fine.
2. **Choose the smallest true action.** Tiny beats ideal.
3. **Timebox your next step.** 7–15 minutes is often perfect.
4. **Use follow-ups to reduce psychic load.** You're building trust with your future self.
5. **If you feel shame, name it.** ("I feel embarrassed I waited.") It often releases the knot.

---

## Troubleshooting

### "The tool didn't appear."
Try:
- using one of the direct phrases above
- describing the stuckness more plainly ("I'm overwhelmed" / "I'm avoiding" / "I don't know where to start")

### "Scheduling didn't work."
Likely causes:
- calendar isn't connected yet
- permissions need re-auth
- wrong calendar selected (should be **Soullab Workspace**)

Workaround:
- ask MAIA to generate the follow-up text anyway ("Give me a reminder line I can paste into my calendar")

### "I got the tool invite but I'm not ready."
Choose **Not now**.
That's not failure. It's good boundary-setting.

---

## A note on ethos (why this is different)

These tools aren't designed to "fix you."
They're designed to **help you move with yourself**—to reduce friction between intention and action, without violence.

The goal is coherence:
- less dread
- more clarity
- fewer open loops
- more clean completions

---

# Appendix (Builder Notes for Community Commons)

> If you're reading this as a developer/operator: these tools are currently surfaced via MAIA's "wisdom routing" + reveal-sheet UI.

## Tool identifiers (conceptual)
- `inbox-triage`
- `next-step`
- `avoidance-breaker`

## Reveal pattern
- Tool invitation appears in chat
- Accept → opens **ToolRevealSheet** (bottom sheet panel)

## Related API routes (current build)
- `/api/focus/next-step`
- `/api/focus/schedule-followup`
- (Google Calendar creation route) `/api/auth/google/calendars/create`

## Routing / plumbing (high-level)
- "Path revelation" and tool routing logic lives in the MAIA consciousness/routing layer
- UI ties tool activation to conversation state (active tool selection)

---

## Change Log
- **1.0 (Jan 4, 2026):** First member-facing manual for Focus Tools + routing/reveal behavior + calendar follow-ups.
