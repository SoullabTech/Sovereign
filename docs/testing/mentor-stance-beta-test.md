# Mentor Stance — Beta Tester Guide

**Feature:** Supervision mode for practitioners in Care
**Status:** Beta — explicit opt-in only
**Who this is for:** Therapists, counsellors, coaches using MAIA to think through clinical work

---

## What you're testing

When Mentor stance is active, MAIA shifts from **member-facing care** to **collegial clinical thinking partner**. Instead of being the person being supported, you are the practitioner — and MAIA acts as a supervisor.

What should change:
- MAIA reflects the case back before responding
- She offers **two meaningfully distinct options** with rationale, timing, risk, and signals
- She returns judgment explicitly to you ("Given your feel for the alliance, which direction seems most alive?")
- She disambiguates: if you're speaking personally rather than about a client, she drops back to Care stance

---

## Enabling / disabling

### Option A — UI toggle (recommended)
Switch to **Care mode**. A small **⚕ Mentor** badge appears in the top-left corner.
- Tap to enable — badge turns teal with a pulse indicator
- Tap again to disable

### Option B — Browser console
```js
// Enable
localStorage.setItem('maia.mentorStance.enabled', '1')

// Disable
localStorage.setItem('maia.mentorStance.enabled', '0')
```
Refresh the page after either method.

---

## Test cases

Run each prompt **twice**: once with Mentor off, once with Mentor on.
Note what changes in tone, structure, and depth.

### Category A — Case reflection

> "I'm holding a client with grief and collapse. She cries but then deflects before anything lands. What should I pay attention to?"

> "My client presents as highly functional but I sense something underneath that he won't touch. We've been at this for three months. I'm unsure whether to name it or wait."

> "She had a breakthrough last session, then came in this week completely flat. I don't know whether to follow the flatness or reference what happened."

### Category B — Stuck process

> "I keep circling the same interpretation and I'm not sure I'm helping. The sessions feel repetitive but the client seems satisfied. What am I missing?"

> "I find myself preparing a lot before sessions with this client — more than usual. I'm not sure if that's useful or avoidant."

### Category C — Countertransference / entanglement

> "I feel unusually activated after this session and can't tell what is mine. The client barely said anything but I left the room exhausted."

> "I notice I don't look forward to this client's sessions. I'm not sure if that's information about the work or something I need to address personally."

### Category D — Intervention selection

> "Would you deepen emotion here or help them regulate first? I'm at a choice point and can't read what the client needs."

> "The client is asking me directly what I think they should do. How do I stay present without either collapsing into advice or becoming withholding?"

---

## Combined test (Mentor + IFS lens)

Enable both Mentor stance and the IFS framework:

```js
localStorage.setItem('maia.mentorStance.enabled', '1')
localStorage.setItem('maia_counsel_framework', 'ifs')
```

Then send:
> "I'm working with a client whose protector system is very strong. Every time we approach something tender, a manager comes in fast. I'm not sure whether to address the protector directly or try to slow the process."

**Expected:** Supervision stance + IFS conceptualization (parts, protectors, pacing, alliance) — not generic therapy warmth.

---

## Personal vs. practitioner disambiguation

Send this prompt with Mentor **on**:

> "I feel overwhelmed and don't know what to do with my anger."

**Expected:** MAIA drops out of Mentor stance and responds in normal Care voice — she does not supervise you about your own emotion.

---

## What to look for

### Mentor OFF (Care baseline)
- Warm, present, member-facing
- Reflective, open-ended
- May offer frameworks but doesn't structure as supervision

### Mentor ON (supervision stance)
- Collegial tone, not effusive
- Brief case reflection (2–4 lines)
- Two distinct options with WHAT / WHY / WHEN / RISK / SIGNALS
- Explicit return of judgment: "You'll be in the best position to judge timing"
- Less generic warmth, more clinical discernment

### Red flags (report these)
- Mentor mode sounds identical to normal Care
- Options feel like one option with a weak alternative
- No return of judgment to the clinician
- Response collapses into advice-giving
- Mentor stance activates when it shouldn't (non-practitioner prompts)

---

## Server verification (internal)

When Mentor is active, the server logs:
```
[Oracle] mentor-stance active
```

If you have log access, confirm this appears for Mentor-on requests and is absent for Mentor-off requests.

---

## Rating scale

For each Mentor-on response, rate 1–5:

| Dimension | 1 | 5 |
|---|---|---|
| Distinctiveness | Sounds like normal Care | Clearly different posture |
| Usefulness | No clinical value | Actively improved my thinking |
| Depth | Generic | Intervention-specific discernment |
| Trust | Would not use in real practice | Would use with real cases |
| Practical guidance | Abstract | Actionable |

**One binary question (most important):**
> Would you deliberately turn this on during real supervision use?

Yes / No / Maybe after refinement

---

## Reporting findings

Send findings to Kelly with:
1. Which prompts you used
2. Mentor OFF vs ON contrast (paste both responses if possible)
3. Your 1–5 ratings
4. Answer to the binary question
5. Any red flags or unexpected behaviour

---

## Decision rule

**If ratings are strong (4–5, binary mostly Yes):** Mentor stance gets promoted to a named practitioner feature in Care.

**If ratings are mixed:** Stance block gets sharpened — better supervisory questions, stronger intervention discrimination, less comforting filler.

**If ratings are weak:** Plumbing stays, but prompt needs another iteration before broader exposure.
