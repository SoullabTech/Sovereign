# Coherence Engine — Beta Test Plan (v0 / "Arrival")

> Status: **draft** · Surface: `/maia/calendar` ("Arrival") · Doctrine: [MAIA_COHERENCE_ENGINE_v0.md](../canon/MAIA_COHERENCE_ENGINE_v0.md)
> Branch: `feature/rapport-pilot-v1` (local, **unpushed, undeployed**).

## What this beta is for

We are testing a **thesis, not a feature.**

The principal uncertainty of this phase — one, not many:

> **Does holding relieve the pull, so people return more fully to what they were doing?**

If that doesn't happen for real people, no taxonomy, calendar sync, or polish will rescue it. Beta validates the underlying model of *attention-and-holding* — whether it corresponds to lived experience. A clean **negative** result is a real result: it tells us the model is wrong *before* we build on it.

## What testers see — the smallest doctrine-faithful artifact

- The Arrival surface: *"What are you still carrying?"* → **Hold this**.
- **Classification is optional.** Nothing is required or pre-selected; a capture is held first, shaped later or never.
- Held items can be **released** (reversible).
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

These map the *ecology of attention* — far more than feature ratings ever will.

## What success is (and is not)

Success is **not** "people capture a lot." High volume may be a **warning sign** — capture becoming a compulsive task is a failure mode, not a win.

Success is: people capture **rarely but deliberately**, and when they do, it **genuinely changes the quality of the rest of the session.** The architecture's signature:

> The system intervenes lightly, but when it does, the intervention has lasting value.

| Signal | Reading |
|---|---|
| Rare, deliberate captures + reported return-to-presence | ✅ thesis holding |
| "I felt lighter after setting it down" | ✅ friction low |
| "It was *mine* — MAIA just held it" | ✅ authorship intact |
| High-volume / compulsive capture | ⚠️ drifting toward a to-do app |
| "I felt pushed to organize / categorize" | ⚠️ classification not optional *enough* |
| "MAIA organized my thoughts (for me)" | ⚠️ authorship drift — investigate |
| Ignored entirely | ⚠️ investigate why — no felt pull? friction? unclear? |

## Cohort & exposure

- **Small, known beta cohort only — not the masses.** Reachable solely by invited testers via the existing tester gate (`members.tester` / `requireCohort`, the same pattern as the Field Lab).
- Keep N small enough for qualitative, conversational debriefs (the questions above), not aggregate dashboards.

## Feedback capture

- Lightweight and member-initiated; debrief conversationally against the three questions.
- **No analytics that would themselves violate the doctrine** — no covert tracking of capture *content*. Coarse capture/release **event** counts (not content) are acceptable only as a secondary signal, read alongside the qualitative answers, never as the success metric.

## Path to beta — each step a separate authorization (all currently HELD)

The artifact is a local commit, deployed nowhere. Beta requires crossing these gates in order, each on explicit go:

1. **Reconcile** `feature/rapport-pilot-v1` vs `origin/feature/rapport-pilot-v1` (diverged) — *held; read-only inspect → propose plan → approve before applying.*
2. **Land** the coherence commits onto the deploy branch.
3. **Deploy** to minisforum (`scripts/deploy-production.sh`, which runs migrations — both coherence migrations apply).
4. **Register routes** in `config/accessMatrix.ts` (`/maia/calendar`, `/api/maia/coherence`) — required before strict access mode; worth doing for hygiene regardless.
5. **Gate to the tester cohort** (`members.tester`).
6. **Invite** a small cohort; begin conversational debriefs.

Nothing above is done. Reconciliation remains a separate, explicit authorization.

## Graduation

Beta graduates toward wider release only when the **principal uncertainty resolves affirmatively, with evidence** — testers report genuine return-to-presence, low friction, and intact authorship — **not** when capture volume or engagement is high. If the thesis fails, that is the most valuable outcome: we learned the model was wrong before scaling it, and we revise the *model*, not just the UI.
