# Now What? — The Workshop Loop
**For:** Larry Closs's first working-model session
**Status:** CANDIDATE working model — one complete loop, not breadth. Authorized direction (Kelly, 2026-07-05).
**Version:** 0.1

---

## The question the workshop answers

> **Can Larry recognize his own work becoming continuously inhabitable?**

If he can, the software is succeeding even if half the features aren't finished yet.

The goal is not to show him "the platform." It is to let him **experience his own work living inside the platform**.

## The success criterion

Not: *"The software is impressive."*

But: **"This feels like my work."**

Everything built around provenance, authorship, the Living Field, and constitutional governance exists to make that sentence possible. Second-order success: he also sees something his work can *become* that wasn't previously possible.

The architectural test (the same one governing the whole collaboration):

> AIN can faithfully host "Now What?" without ceasing to be itself, while allowing Larry's work to become **continuously inhabitable rather than episodically teachable**.

---

## The loop — six steps, one path, nothing competing for attention

### 1. Threshold
The first screen is not a dashboard. It is:

> **Now What?**
>
> *How are you entering this room today?*

Nothing else.

**Substrate today:** `VisionStudioRoom.tsx` arrival phase (Opening frame + Begin) — Live on branch.
**Gap:** program-specific threshold copy. A `Now What?` arrival variant replacing the generic frame. UI copy change only.

### 2. Origin Conversation
A live MAIA conversation centered on Larry's work — a guided developmental conversation using the Fire interview already written. The person experiences **being received rather than interrogated**.

**Substrate today:** `app/api/maia/vision-studio/interview/route.ts` — phase-aware prompts, twelve disciplines, Fire I–III + Water I–III. Live on branch.
**Gap:** none for the workshop.

### 3. Living Field
Immediately after the conversation, the field appears. Not a transcript. Not AI analysis. Instead:

- themes that emerged
- questions still alive
- practices available
- what remains open

Everything presented as **authored or offered — not concluded**.

**Substrate today:** proposal phase (threads → keep / revise / leave → carry). Live on branch.
**Gap:** the four-category presentation. A `PROPOSE_SYSTEM` prompt evolution + proposal UI grouping. No schema change.

### 4. Practice — the heart of Larry's work
The interview naturally becomes:

> **Now what will you actually live?**

**One** practice. One experiment. One commitment. Not ten.

**Substrate today:** field-note route saves authored threads with phase tagging.
**Gap:** a single practice-commitment step after the proposal phase — one input, saved as a `practice`-tagged thread via the existing route (extend the `asPhase` allowlist). Small build, no migration.

### 5. Offering — when appropriate, not required
The settled prompt:

> **What would you enjoy making available to others at this point in your life?**

Demonstrates the movement from flourishing into contribution.

**Substrate today:** same mechanics as Practice.
**Gap:** optional `offering`-tagged thread, same pattern. Small build, no migration.

### 6. Return — the differentiator
The second visit is where the platform becomes convincing. Instead of beginning again:

> *Last time you chose this practice.*
>
> *What happened?*

Continuity, not conversation history.

**Substrate today:** field-note GET filters by `fieldContext` (Live on branch); the columns are in production.
**Gap:** arrival phase checks for an existing `practice` thread in this field context; if found, the conversation opens with the return prompt (prior practice folded into the interview system prompt as context). The one genuinely new behavior — still lands entirely on existing routes. No migration.

---

## What Larry should recognize by the end

> "This isn't digitizing my program. It's giving my work somewhere to continue living between conversations."

## Four concrete outcomes

1. Larry experiences his own methodology through MAIA.
2. Larry sees the Living Field emerging from the encounter.
3. Larry leaves with one real practice he would actually give to a client.
4. Larry sees how "Now What?" becomes a **companion rather than a course**.

---

## What not to build yet (phase refusals)

Deliberately excluded — none of these answer Larry's question:

- marketplace
- directories
- categories
- ratings
- recommendation engines
- complex analytics
- practitioner dashboards
- advanced reporting

---

## Build list (complete)

| # | Piece | Kind | Schema change |
|---|-------|------|---------------|
| 1 | Now What? threshold copy (arrival variant) | UI copy | none |
| 2 | Four-category Living Field presentation | prompt + UI grouping | none |
| 3 | Practice commitment step (`practice` tag) | small feature | none |
| 4 | Offering step, optional (`offering` tag) | small feature | none |
| 5 | Return branch (detect prior practice → return prompt) | small feature | none |

The entire loop closes with zero migrations — the `spiralogic_phase` + `field_context` columns already carry it.

---

*The workshop doesn't need to demonstrate every capability. It needs to demonstrate that the work has somewhere to continue living.*
