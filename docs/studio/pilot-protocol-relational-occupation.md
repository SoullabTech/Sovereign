# Pilot Protocol — Conversational Urgency / Relational Occupation

**Status:** Pilot — first reference implementation
**Version:** 1.0
**For:** Soullab Studio practitioners

---

## Purpose

This protocol is the first formal implementation of the Soullab Studio Practitioner Loop for a specific client pattern. It serves as:

1. A working clinical instrument for this pattern type
2. A reference implementation for generalizing the loop to other patterns
3. The test case for validating the Studio evidence pipeline end-to-end

The pattern: **sustained conversational occupation** — flooding speech, inability to pause, interruption compulsion, silence intolerance, urgency to pre-empt the moment's closing.

This is not a simple etiquette problem. It is a relational structure — a way of managing proximity, visibility, and the fear of disappearing from relational space. The system must work with the structure, not just the behavior.

---

## Pattern Signals

### What to track

These are the observable markers the practitioner should log as field signals or observations after each session or client report.

**Somatic (client-sourced)**
- Chest tightening or pressure before speaking (location, intensity, onset time)
- Throat readying (vocal preparation before speaker has finished)
- Heat, electricity, urgency in the body
- Shallow or held breath during occupation episodes

**Behavioral**
- Number of interruptions (approximate — "twice," "several times," "constant")
- Duration of unbroken speech beyond natural pause points
- Simultaneous talking (speaking while the other is still speaking)
- Accelerated speech rate when approaching emotionally dense material

**Relational field**
- With whom the pattern activates (attachment figures, authority types, dismissive types)
- Absence of the pattern (with whom does it not appear?)
- Recovery — does the client return to reciprocal conversation after an occupation episode?

**Post-contact emotional**
- Shame after occupation episodes
- Emptiness after a long explanation (the contact was not made)
- Relief when the pattern eases
- Defensiveness about the pattern ("she takes too long anyway")

**Markers of the precursor gap opening**
- Any moment where the client noticed the urgency before acting on it
- Successful pause (even 1–2 seconds)
- Moment of genuine listening — "I was actually curious what she would say"

---

## Clinical Workflow

### Rhythm

**Between sessions (client)**
Complete the short-form inquiry (4 questions, 5 minutes maximum).
Log 1–3 field events — not essays, just signal capture.

**Before session (practitioner)**
Review:
- Latest inquiry responses
- Top field signals (highest intensity or most recent)
- Last experiment outcome
- Current occupancy trajectory

**In session**
One warm interruption (practitioner models that interruption can be non-violent)
One body-state identification (locate the precursor)
One live relational naming ("I notice you accelerated when—")
One intervention install (if the channel is open)
One field experiment agreement for the coming week

**After session**
Occupancy rating (1–5, 30 seconds)
Changes entry: one hypothesis, one micro-practice, one success marker, one observation window

---

## Intervention Sequence

The sequence matters. Do not skip stages. Each stage requires the previous to be stable.

### Stage 1 — Precursor mapping (witness-first)

**Condition:** Client can name the pattern but has no gap between precursor and action.
**Modality:** Light trance (hypnosis)
**Template:** `light-trance-precursor-mapping`
**Goal:** Client experiences the precursor signal as *separate* from the behavioral impulse.
**Do not proceed to Stage 2 until:** Client can name the signal distinctly from the action.

### Stage 2 — Relational pause tolerance (between sessions)

**Condition:** Client knows the precursor and has begun to notice it.
**Modality:** Relational experiment
**Template:** `relational-pause-tolerance`
**Goal:** Build tolerance for micro-pauses in low-stakes contexts.
**Do not proceed to Stage 3 until:** Client completes the pause experiment at least twice and reports something discovered in the pause.

### Stage 3 — Somatic anchor installation

**Condition:** Client can notice the signal and has experienced successful pausing.
**Modality:** NLP / somatic
**Template:** `somatic-anchor-installation`
**Goal:** Client has a self-activatable state resource for the moment of urgency onset.
**Success signal:** Anchor reliably recalls calm-present state in session; client reports using it between sessions.

### Stage 4 — Pattern interrupt with substitute discharge

**Condition:** Urgency is still high but the anchor exists.
**Modality:** NLP
**Template:** `pattern-interrupt-substitute-discharge`
**Goal:** Client can insert a brief conscious discharge (feet, breath, touch) when urgency peaks.
**Note:** This is a transitional tool, not the destination. Review what the urgency is protecting.

### Stage 5 — Receiving / spaciousness trance

**Condition:** Client has the anchor and can sometimes pause. Ready to go deeper.
**Modality:** Hypnosis
**Template:** `receiving-spaciousness-trance`
**Goal:** Client viscerally experiences receiving another person's full expression without urgency.
**Signs working:** Client reports genuine curiosity about what the other person will say next.

### Stage 6 — Age regression (if indicated)

**Condition:** Channel is usable, client is stable, prior stages are integrated.
**Modality:** Hypnosis
**Template:** `age-regression-first-time-heard`
**Caution:** Do not lead here until the live channel is open enough for the material to be processed rather than flooded.

---

## Prompt Sets for This Pattern

### Primary — first 1–2 sessions

**Conversational Urgency / Interruption** (`conversational-urgency`)
Full 5-question set. Use in first session after naming the pattern.

### Ongoing — sessions 3+

**Conversational Urgency — Short Form** (`conversational-urgency-short`)
4 questions, hard character limits. For weekly signal capture.
Prevents inquiry from becoming another narrative dump.

### Relational layer — when ready

**Relational Occupation / Silence Intolerance** (`relational-occupation`)
5 questions pulling the therapeutic relationship into view.
Use when client can hold the relational dimension without flooding.
The question "What happens between us when I pause you?" is especially generative.

### Pre-hypnotherapy sessions

**Hypnotherapy / NLP Session Preparation** (`hypnotherapy-nlp-prep`)
5 questions surfacing target state, earliest memory, safety anchor, cautions.
Use before Stages 3–6.

---

## Intervention Selection Logic

| Occupancy Score | Warm Interruption Tolerated | Recommended Next |
|----------------:|:---------------------------:|:----------------|
| 4–5 | No | Map precursor only. No technique installation. |
| 4–5 | Yes | Map precursor + introduce pause experiment. |
| 3 | No | Pause experiment + introduce anchor in low-stakes context. |
| 3 | Yes | Install anchor. |
| 1–2 | — | Receiving trance or age regression if client is stable and willing. |

**Overriding principle:** If the client flooded in this session, do not install technique. Use the session to map what happened.

---

## UI Logic (Studio)

### What to open before each session

1. **Decision** for this client → Evidence panel
2. Check: any new field signals logged by client?
3. Check: inquiry responses completed?
4. Check: occupancy trend — improving, stable, worsening?
5. Review the last experiment outcome from the Changes section.

### What to record after each session

1. **Occupancy rating** (3 clicks) — always
2. **1–3 practitioner observations** — be specific, keep brief
3. **Update Change status** — active / completed
4. **Create new Change (experiment)** if ready for next stage
5. **Update follow-up intention** — what you will look for next session

### What to flag for council

Before running a Decisions council consultation, ensure the evidence bundle has at least:
- One completed inquiry response
- At least 2 field signals
- At least 1 practitioner observation

If fewer, the council will note the sparse data and recommend gathering evidence first. This is correct behavior — do not override it by expanding practitioner notes to compensate.

---

## Success Metrics

The real test is not architectural elegance. It is whether the sessions change.

**Week 1–2**
- Client can name the somatic precursor signal
- Client reports at least one moment of noticing the urgency before acting
- Occupancy score below 4 at least once

**Week 3–4**
- Client completes pause experiment in low-stakes context
- Something new discovered in the pause
- Occupancy trend: stable or improving

**Month 2**
- Client spontaneously pauses in at least one conversation per week
- Anchor installed and used between sessions
- Interruption frequency reduced (client or partner report)
- First moment of genuine receiving — "I was actually curious what she would say next"

**Month 3**
- Occupancy score predominantly 1–2
- Warm interruption tolerated in session
- Client can discuss the relational pattern without flooding
- Grief or fear beneath the pattern accessible (if Stage 5/6 used)

---

## Risk Notes

**Shame collapse**
When the urgency is named directly, some clients collapse into shame rather than curiosity. Watch for: sudden deflation, self-criticism, "I know, I'm terrible." Reframe before the shame forecloses. "This has a function. Let's find out what it's protecting."

**Compensatory flooding**
A client who is interrupted may flood more immediately afterward. This is not failure — it is the pattern demonstrating itself. Name it live, gently: "There it is. The urgency just went up. What happened in your body just then?"

**Narrative as defense**
If the client begins bringing elaborate stories about their interrupting behavior, the inquiry is functioning as another occupation channel. Tighten the inquiry to 4 questions with hard limits. Keep session focus on what happened in the body, not the story.

**Age regression too early**
If the therapeutic relationship is still occupied, regression material may become narrative rather than contact. Wait until the channel is open before regression work.

---

## Generalizing This Protocol

When this pilot has validated the loop for Relational Occupation, the same structure can be applied to:

- **Grief / Withdrawal** — with the `grief-beneath-behavior` prompt set and `receiving-spaciousness-trance` as primary intervention
- **Conflict Avoidance** — with `relational-activation` as primary inquiry and relational experiment as primary intervention
- **Indecision / Stuck** — with the Decisions council as primary synthesis tool and a structured decision tree as intervention
- **Trauma Response** — requires separate protocol with expanded cautions; not for this pilot phase

The structure is the same:
```
Named pattern → Specific inquiry set → Staged intervention sequence → Occupancy tracking → Success markers
```

What changes is the inquiry set, the intervention sequence, and the success markers.

---

## Protocol Feedback

After first use with a client, review:

1. Were the inquiry responses signal-dense or did they become narrative dumps?
   → If narrative: tighten character limits further, move to short-form earlier

2. Did the council synthesis distinguish the three evidence sources?
   → If not: review the prompt assembly output in the consult route

3. Was the occupancy widget used in real time or only retrospectively?
   → If only retrospective: consider in-session reminder trigger

4. Did the Changes panel stay narrow (1–2 interventions) or expand?
   → If expanded: apply the smallest-intervention constraint more strictly

5. Did session quality improve by session 3?
   → This is the only metric that matters.
