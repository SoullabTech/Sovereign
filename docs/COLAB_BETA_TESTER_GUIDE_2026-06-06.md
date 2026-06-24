# Co-lab Beta — What to Test (and what isn't here yet)

**For:** Heather + the practitioner / engineer beta team
**Date:** 2026-06-06
**Why this guide exists:** so you can tell "this is broken" apart from "this hasn't shipped yet." Each capability is labeled by its **real state**. If something is under **Future**, it's intentionally not here — please don't log it as a bug.

> States used here: **Currently Live** (on production now) · **Deploying in this release** (new, arriving with this update) · **Future** (planned, not built).

---

## Currently Live — use it today
Running in production now (if any of these misbehaves, that *is* a bug — please report):
- **Channels** — create, public/private, join
- **Direct messages**
- **Threads** — reply in-thread without losing the room
- **Roles & permissions** — owner / admin / member; private-channel access
- **Presence, reactions, read receipts, invites, admin panel**
- **Decision → accountable-work loop** — ✅ shipped + verified on the live site (2026-06-06):
  - **Tag a message as a Decision** (kind picker: build / question / decision / insight → choose *Decision*)
  - **Capture as Decision** — **hover the message → "Capture as Decision"** (it gains a *✓ Captured* badge). *Note: tagging the kind is not the same as capturing — capture is what puts it in the Decisions view.*
  - **Decisions view** — sidebar → **✓ Decisions** — what the team decided, across channels, with who/when
  - **Make task** — on a decision card → **assign → Create task** → the card shows a *"1 task"* badge
  - ✅ **Works on iPhone too** — mobile layout shipped + device-verified 2026-06-06 (tap **☰** top-left to open the channel drawer). Minor mobile refinements coming next: a more obvious channel switcher and a **one-tap Create Task right after capture** (so you don't have to open Decisions).

## Shipped in this release ✅
The Co-lab **decision → task loop** above moved from *Deploying* to **Currently Live** on 2026-06-06 (verified end-to-end on production). Nothing else pending in this release.

## Future — planned, not here yet (by design)
- **Mark a task complete inside Co-lab** — completion currently lives in the task system, not the Decisions view *(coming next)*
- **Session Room → Co-lab** — drop a session summary into a channel — *specified, not built*
- **Recording → Co-lab** — *planned*
- **Start video / voice from a channel** — *infrastructure only, not wired*

---

## The loop to test (the heart of this release)
It's **live** — walk this end to end (desktop **or iPhone**):
1. In a channel, post a real decision and **tag it `decision`**.
2. **Capture as Decision** (from the message).
3. Open **Decisions** in the sidebar — your decision is listed, with its channel and who captured it.
4. **Make task** → choose an assignee → create. The decision now shows a task count.
5. Open the task — it's **assigned**, and it links back to the decision.

**The continuity test — *can you find why you decided it?***
Open a decision and follow it back to its **source conversation**. The rationale is preserved through the **linked conversation** (the captured message + its channel) — not a separate "reason" field. The test that matters: *from a decision, can you recover why it was made?*

---

## What to report
- A **Currently Live** feature that doesn't work → real bug, please report.
- A **Deploying in this release** feature still missing *after* the release lands → report.
- A **Future** item → not a bug; it's on the roadmap.

*Co-lab loop **Currently Live** — verified end-to-end on production, **desktop + iPhone**, 2026-06-06. Mobile refinements next: one-tap Create-Task-after-capture + clearer channel switcher. **Mark complete in Co-lab** remains Future.*
