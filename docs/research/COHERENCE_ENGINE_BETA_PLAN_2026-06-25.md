# Coherence Engine — Beta Test Plan (v0 / "Arrival")

> Status: **draft** · Surface: `/maia/calendar` ("Arrival") · Doctrine: [MAIA_COHERENCE_ENGINE_v0.md](../canon/MAIA_COHERENCE_ENGINE_v0.md)
> Branch: `feature/coherence-engine-arrival-beta` (off `clean-main-no-secrets`; local, **unpushed, undeployed**).

## What this beta is for

We are testing a **thesis, not a feature.**

The principal uncertainty of this phase — one, not many:

> **Does holding relieve the pull, so people return more fully to what they were doing?**

If that doesn't happen for real people, no taxonomy, calendar sync, or polish will rescue it. Beta validates the underlying model of *attention-and-holding* — whether it corresponds to lived experience. A clean **negative** result is a real result: it tells us the model is wrong *before* we build on it.

## What testers see — the smallest doctrine-faithful artifact

- The Arrival surface: *"What are you still carrying?"* → **Hold this**.
- **Classification is optional.** Nothing is required or pre-selected; a capture is held first, shaped later or never.
- Held items can be **let go** (reversible) — via a gentle letting-go gesture, deliberately *not* a checkmark (see "the deeper test" below).
- Text is **stored verbatim** — no AI parsing, no interpretation, no routing.

**Deliberately NOT in this beta** (so we test the thesis, not features): taxonomy redesign, new capture destinations, calendar/reminder/sync, AI classification, edge-case handling, Arrival-as-its-own-route. If beta reveals the need, those come *after* — earned.

## The three questions

Every piece of feedback maps to one of these.

1. **Presence (the thesis).** After capturing something, do people actually return more fully to what they were doing?
2. **Friction.** Does capturing feel *lighter* than continuing to carry it? If capture becomes another cognitive task, we've lost.
3. **Authorship.** Do people feel the capture belongs to *them*, or to MAIA? If users say *"MAIA organized my thoughts"* rather than *"I captured something I wanted to keep,"* the authorship boundary is already drifting.

## How we ask — concrete experience, never "did you like it?"

Ratings and "was it useful?" are too coarse. Ask about specific moments:

- "Did you return to your conversation more easily?"
- "Did anything feel unnecessary?"
- "Did you ever feel pushed to organize before you were ready?"
- "Did you ignore capture entirely? If so, why?"
- "Was there a moment you wished you'd captured something only after it had passed?"
- **"After you released something, what changed?"** — the most revealing probe. Let the answer report itself (don't ask "did it feel like checking a box?" — too leading). Answers map to what *release* is doing psychologically:
  - *"nothing"* / *"I forgot about it"* → disposal / deletion
  - *"it felt lighter"* → relinquishment **(the thesis)**
  - *"I wondered if I'd made a mistake"* / *"I wanted to look at it again"* → avoidance / distrust

These map the *ecology of attention* — far more than feature ratings ever will.

## What success is (and is not)

Success is **not** "people capture a lot." High volume may be a **warning sign** — capture becoming a compulsive task is a failure mode, not a win.

Success is: people capture **rarely but deliberately**, and when they do, it **genuinely changes the quality of the rest of the session.** The architecture's signature:

> The system intervenes lightly, but when it does, the intervention has lasting value.

**The deeper test behind every signal** is not "does this optimize engagement?" but **"what behavior does each UI element silently reward?"** Removing streaks, badges, and feeds removes *explicit* engagement mechanics — but every affordance still teaches what counts as success. (This is why the release control was changed from a `✓` to a letting-go gesture *before* beta: a checkmark silently rewards *completion*, which would recode the practice as productivity — the exact drift we're studying.)

| Signal | Reading |
|---|---|
| Rare, deliberate captures + reported return-to-presence | ✅ thesis holding |
| "I felt lighter after setting it down" | ✅ friction low; release = relinquishment |
| "It was *mine* — MAIA just held it" | ✅ authorship intact |
| High-volume / compulsive capture | ⚠️ drifting toward a to-do app |
| "I felt pushed to organize / categorize" | ⚠️ classification not optional *enough* |
| "MAIA organized my thoughts (for me)" | ⚠️ authorship drift — investigate |
| Release reads as "done / accomplished" | ⚠️ completion-priming — affordance/copy still teaching productivity |
| Ignored entirely | ⚠️ investigate why — no felt pull? friction? unclear? |

**Watch latency, not just satisfaction.** The *timing* of release is a tell the words miss: hesitation before letting go, hovering, revisiting, reopening — versus immediately releasing everything. Considered, slow release suggests **discernment**; reflexive clear-the-board suggests **disposal**. (Observed in facilitated or self-reported sessions — not covert instrumentation; see Feedback capture.)

## Cohort & exposure

- **Small, known beta cohort only — not the masses.** Reachable solely by invited testers (`members.tester`): enforced **server-side** via `isMemberTester` / the `labs.preview` entitlement in the API, plus the client `<PreviewGate>` on the page — the same pattern as Field Lab. **Wired in this branch** (not a deferred deploy step), so no deploy can expose it member-wide.
- Keep N small enough for qualitative, conversational debriefs (the questions above), not aggregate dashboards.

## Feedback capture

- Lightweight and member-initiated; debrief conversationally against the three questions.
- **No analytics that would themselves violate the doctrine** — no covert tracking of capture *content*. Coarse capture/release **event** counts and release **latency** (timing, not content) are acceptable only as secondary signals, read alongside the qualitative answers, never as the success metric.

## Path to beta — each step a separate authorization

The work is one clean commit on `feature/coherence-engine-arrival-beta` (off `clean-main-no-secrets`), deployed nowhere. The AccessMatrix route registration is already **included** in the branch. Remaining gates, each on explicit go:

1. **Push** the branch + **open PR** → `clean-main-no-secrets`. *(stage b)*
2. **Review** the diff; **merge** only after review.
3. **Deploy** to minisforum (`scripts/deploy-production.sh`, which runs both coherence migrations). *(separate authorization)*
4. **Gate to the tester cohort** (`members.tester`).
5. **Invite** a small cohort; begin conversational debriefs.

Discipline held throughout: **commit → review → merge → deploy**, each transition its own explicit decision, never automatic.

## Graduation

Beta graduates toward wider release only when the **principal uncertainty resolves affirmatively, with evidence** — testers report genuine return-to-presence, low friction, and intact authorship — **not** when capture volume or engagement is high. If the thesis fails, that is the most valuable outcome: we learned the model was wrong before scaling it, and we revise the *model*, not just the UI.

**The unusual optimization target.** Most software asks "how do we increase use?" This asks **"how do we know when we're no longer needed?"** If someone arrives burdened, leaves with more authorship, and over time needs MAIA *less* because the practice has become their own, that is success here — a *declining* reliance curve for a maturing member is a win, not churn. Beta should preserve this orientation: we are watching for decreasing necessity, not engagement. Very few products are built to measure their own diminishing indispensability; holding that line through beta may be one of the platform's most distinctive properties.
