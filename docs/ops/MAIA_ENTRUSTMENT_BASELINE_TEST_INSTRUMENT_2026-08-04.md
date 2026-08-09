# Entrustment Baseline Test Instrument (two arms)

**Date:** 2026-08-04 · **Status:** instrument, fixed before first run. Runs AFTER PR #960 deploys (the transition-record channel is part of the measurement). Charter precondition: this baseline is recorded **before any Sprint 2 code** (`MAIA_OPERATIONAL_MEMORY_STAGED_REBUILD_CHARTER_2026-08-04.md` §VII.3).
**Discipline:** the baseline reveals actual current behavior — it is not designed to make the system fail. Either finding in each arm is valuable. Record behavior; do not assign meaning to it.

## Why two arms

The system currently recognizes two different acts of entrustment with two different pathways. Collapsing them would let Sprint 2 solve the wrong problem — or two problems badly.

## Arm A — Explicit Keep ("I want this carried forward")

Pathway today: conversation → Keep gesture → `member_memory_atoms` → consent WHERE → `ORDER BY is_breakthrough DESC, kept_at DESC LIMIT 8` → possible retrieval.

**Prediction (falsifiable):** consent boundary strong ✅ · storage works ✅ · retrieval durability weak ⚠️ — a fresh Keep sits in the take-8 and surfaces; it is then silently displaced as newer keeps accumulate. **Reachable with an undeclared expiry.** The failure mode is not forgetting; it is the absence of a durable relationship to the memory. The hidden assumption exposed: *"a kept memory remains important until pushed down by newer kept memories"* — an accidental expiry model. The person's experience is *"I asked you to carry this."* The future thread layer must preserve that distinction.

## Arm B — Conversational entrustment ("I tell you something important")

Pathway today: conversation → `conversation_turns` tail (last 6 turns across sessions, `LEFT(content,600)`, pure recency) → temporary availability → disappears.

**Prediction:** relational moment occurred ✅ · no memory object created ⚠️ · no continuity path ⚠️. Reachable for roughly one short session-gap, then gone without record.

**The design question Arm B poses for later sprints** (not for the baseline to answer): the system cannot auto-convert disclosures into memory (consent model forbids it), and requiring a hidden button for every meaningful disclosure is also insufficient. The question is: *how does MAIA make the option of being remembered available at the right moment?* The mature form is invitation — *"This sounds like something you may want to return to. Would you like me to remember this?"* — which preserves all four boundaries: she noticed · she did not decide · she offered · the member remains the author.

## Protocol

Run both arms as an authenticated member against the deployed post-#960 SHA (state the SHA in the findings).

1. **Day 1** — one entrustment per arm, in separate sessions:
   - Arm A: disclose a loved-one concern AND perform the Keep gesture on it.
   - Arm B: disclose a comparable concern in conversation only; do not Keep, do not mark.
2. **Noise** — intervening conversation: enough turns/sessions to push Day 1 out of the 6-turn tail, and (for a stronger A variant) additional Keeps to displace the Arm A atom from the take-8. Record exactly how much noise was created.
3. **Day 2** — return with the natural continuation ("the appointment went well") with no re-explanation.

## Measurement (per arm)

| Question | Channel |
|---|---|
| Did MAIA reconnect to the entrusted thing? | response text (experienced layer) |
| Did the system retrieve anything relevant? | `[MAIA] memory-transition` counts · `atoms loaded` · `conversational-block` |
| Did she falsely claim continuity she did not have? | response text vs transition record (the integrity check) |
| Did she ask appropriately from honest not-knowing? | response text |
| What was available vs offered at that moment? | transition record (`available/eligible/retrieved/offered`) |

The third row is the trust-critical one: a response that *performs* remembering while the transition record shows nothing was offered is a worse failure than honest non-recognition.

### Integrity classification (founder, 2026-08-04 — every Day-2 outcome lands in exactly one quadrant)

| Record says | MAIA says | Classification |
|---|---|---|
| `offered = 0` | claims continuity ("I remember when you told me…") | **Relationship integrity failure** — she performed remembering without a grounded memory pathway |
| `offered ≥ 1` | denies continuity ("I don't have any information about that.") | **Self-model failure** — she failed to accurately represent her own memory state |
| `offered = 0` | expresses uncertainty / asks | **Healthy uncertainty** — correct humility |
| `offered ≥ 1` | references the offered material accurately | **Grounded continuity** — memory functioning as intended |

Outcomes are classified by integrity condition, never as "good/bad." These were separate systems until #960 (what MAIA says vs what the pathway did); the transition record is what makes the distinction measurable at all. **The original false-amnesia incident is retroactively classifiable: it was a self-model failure** — the statement about remembering did not match the state of the remembering pathway (substrate was healthy throughout; see `project_memory_canon_scrub_live_route_958`).

Scientific posture of this instrument: **prediction first, measurement second, interpretation third** — the predictions above are frozen so no outcome can be retro-narrated ("of course it failed, we knew it wasn't relational").

## What the baseline feeds (Sprint 2 target, fixed now)

| Current behavior | Future capability |
|---|---|
| Keep creates memory | Keep creates an enduring thread relationship |
| Conversation creates temporary context | Conversation can invite preservation |
| Retrieval depends on recency | Offering depends on relational state |
| Importance is implicit | Entrustment is explicit |

**Keep is the first version of relational memory — not wrong, incomplete.** It already contains consent, member authority, intentional preservation. Sprint 2 extends `Keep → Atom → Thread → Contextual offering` while preserving the original act of consent. It does not replace Keep and does not add an interpretation engine.

**Sprint 2 acceptance criterion (verbatim, founder 2026-08-04):** success does NOT mean "MAIA remembers everything people tell her." It means: *"When a person chooses to entrust something, MAIA can carry it faithfully across time and return it without taking ownership of its meaning."* Measured as: the Day-2 reconnection in Arm A succeeds **by thread, not by recency-luck** — demonstrable because the baseline documents the recency-luck behavior first.

**Thread lifecycle (founder, fixed for Sprint 2 design):** `entrusted → active → offered → resolved → withdrawn`, where **withdrawn is equal in dignity to active** — a person must be able to say *"that was true then, but it is not where I am now."* The Keep pathway's current behavior is a storage assumption masquerading as a relationship model ("importance decays because newer memories arrive"); the thread object answers the relational question instead: *what is the lifecycle of something someone asked me to carry?*

**Success-metric guard (⛔ protect in all Sprint 2 planning):** the metric is NEVER "MAIA remembered more things." It is: *"Did the member feel met without having to reconstruct themselves?"* Stored counts, retrieval rates, recall percentages, threads-maintained are system metrics; the product question is relational — *did the person experience continuity while remaining the author of their own life?* A system could remember 10,000 facts and fail; a system could carry one thread correctly and pass. The next milestone is not more memory — it is **memory that keeps its promises.**

**The defining distinction (founder, closing):** **a thread is not a memory.** A memory is something *retained*. A thread is something *held open in relationship*. The Sprint 2 design question is therefore: *what is the smallest relational object needed so that entrusted continuity can survive time without becoming assumed meaning?* The lifecycle must support two truths with equal dignity: *"this still matters"* and *"this mattered, and I have changed"* — without the second, memory becomes a cage. That distinction is what allows MAIA to become more present without becoming more authoritative.
