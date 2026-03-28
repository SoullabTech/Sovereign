# Voice Calibration Pass 01

Date: ___________
Evaluator: ___________

## Method

For each test case:
1. Shape the raw text through textShaper
2. Synthesize with Kokoro (default)
3. Synthesize with OpenAI (fallback)
4. Score both on the rubric
5. Record diagnosis and decision

## Scoring Rubric (1-5)

| Dimension | 1 | 3 | 5 |
|-----------|---|---|---|
| Naturalness | robotic | passable | human |
| MAIA-ness | generic assistant | neutral | distinctly MAIA |
| Emotional fit | wrong tone | adequate | precise |
| Clarity | muddy | clear enough | crystalline |
| Pacing | flat/rushed | acceptable | alive |
| Restraint | theatrical/overdone | balanced | grounded |
| Trustworthiness | unsettling | neutral | safe to receive |

---

## Case 1: grounded_reflective

**Agent:** main
**Context:** journaling, meaning-making

**Raw text:**
You're not actually confused so much as split between two loyalties, and because both matter, you keep converting the conflict into analysis.

**Expected shaped text:**
You're not actually confused. You're split between two loyalties. And because both matter, you keep converting the conflict into analysis.

### Kokoro

| Dimension | Score | Notes |
|-----------|-------|-------|
| Naturalness | | |
| MAIA-ness | | |
| Emotional fit | | |
| Clarity | | |
| Pacing | | |
| Restraint | | |
| Trustworthiness | | |

What felt off:
Which layer likely caused it:
What to adjust:

### OpenAI

| Dimension | Score | Notes |
|-----------|-------|-------|
| Naturalness | | |
| MAIA-ness | | |
| Emotional fit | | |
| Clarity | | |
| Pacing | | |
| Restraint | | |
| Trustworthiness | | |

What felt off:
Which layer likely caused it:
What to adjust:

### Decision

Provider sufficient: [ ] Kokoro [ ] OpenAI [ ] Both
Elevation needed: [ ] Yes [ ] No
Adjustments needed:

---

## Case 2: quiet_containing

**Agent:** guide
**Context:** overwhelm, activation, someone spiraling

**Raw text:**
You do not need to resolve the whole system tonight; you only need to stop escalating it. Just stay with the next honest step.

**Expected shaped text:**
You do not need to resolve the whole system tonight. You only need to stop escalating it. Just stay with the next honest step.

### Kokoro

| Dimension | Score | Notes |
|-----------|-------|-------|
| Naturalness | | |
| MAIA-ness | | |
| Emotional fit | | |
| Clarity | | |
| Pacing | | |
| Restraint | | |
| Trustworthiness | | |

What felt off:
Which layer likely caused it:
What to adjust:

### OpenAI

| Dimension | Score | Notes |
|-----------|-------|-------|
| Naturalness | | |
| MAIA-ness | | |
| Emotional fit | | |
| Clarity | | |
| Pacing | | |
| Restraint | | |
| Trustworthiness | | |

What felt off:
Which layer likely caused it:
What to adjust:

### Decision

Provider sufficient: [ ] Kokoro [ ] OpenAI [ ] Both
Elevation needed: [ ] Yes [ ] No
Adjustments needed:

---

## Case 3: clear_direct

**Agent:** fire
**Context:** someone stuck in analysis paralysis, needs directness

**Raw text:**
The issue is that you keep asking for certainty before action, which guarantees delay. Choose the path you can actually live with and move.

**Expected shaped text:**
The real issue is simple. You keep asking for certainty before action. And that guarantees delay. Choose the path you can actually live with. And move.

### Kokoro

| Dimension | Score | Notes |
|-----------|-------|-------|
| Naturalness | | |
| MAIA-ness | | |
| Emotional fit | | |
| Clarity | | |
| Pacing | | |
| Restraint | | |
| Trustworthiness | | |

What felt off:
Which layer likely caused it:
What to adjust:

### OpenAI

| Dimension | Score | Notes |
|-----------|-------|-------|
| Naturalness | | |
| MAIA-ness | | |
| Emotional fit | | |
| Clarity | | |
| Pacing | | |
| Restraint | | |
| Trustworthiness | | |

What felt off:
Which layer likely caused it:
What to adjust:

### Decision

Provider sufficient: [ ] Kokoro [ ] OpenAI [ ] Both
Elevation needed: [ ] Yes [ ] No
Adjustments needed:

---

## Case 4: shadow_depth

**Agent:** shadow
**Context:** grief, loss, something ending

**Raw text:**
Part of your pain is that you are trying to mourn and negotiate at the same time. Something in you already knows this ending has begun, but another part is still trying to keep it alive.

**Expected shaped text:**
Part of the pain is this. You are trying to mourn and negotiate at the same time. Something in you already knows this ending has begun. But another part is still trying to keep it alive.

### Kokoro

| Dimension | Score | Notes |
|-----------|-------|-------|
| Naturalness | | |
| MAIA-ness | | |
| Emotional fit | | |
| Clarity | | |
| Pacing | | |
| Restraint | | |
| Trustworthiness | | |

What felt off:
Which layer likely caused it:
What to adjust:

### OpenAI

| Dimension | Score | Notes |
|-----------|-------|-------|
| Naturalness | | |
| MAIA-ness | | |
| Emotional fit | | |
| Clarity | | |
| Pacing | | |
| Restraint | | |
| Trustworthiness | | |

What felt off:
Which layer likely caused it:
What to adjust:

### Decision

Provider sufficient: [ ] Kokoro [ ] OpenAI [ ] Both
Elevation needed: [ ] Yes [ ] No
Adjustments needed:

---

## Case 5: mentor_firm

**Agent:** mentor
**Context:** someone looping on the same pattern, needs calibration

**Raw text:**
You already know the pattern. The question is not whether it is there. The question is whether you are willing to stop protecting it.

**Expected shaped text:**
You already know the pattern. The question is not whether it is there. The question is whether you are willing to stop protecting it.

### Kokoro

| Dimension | Score | Notes |
|-----------|-------|-------|
| Naturalness | | |
| MAIA-ness | | |
| Emotional fit | | |
| Clarity | | |
| Pacing | | |
| Restraint | | |
| Trustworthiness | | |

What felt off:
Which layer likely caused it:
What to adjust:

### OpenAI

| Dimension | Score | Notes |
|-----------|-------|-------|
| Naturalness | | |
| MAIA-ness | | |
| Emotional fit | | |
| Clarity | | |
| Pacing | | |
| Restraint | | |
| Trustworthiness | | |

What felt off:
Which layer likely caused it:
What to adjust:

### Decision

Provider sufficient: [ ] Kokoro [ ] OpenAI [ ] Both
Elevation needed: [ ] Yes [ ] No
Adjustments needed:

---

## Case 6: ritual_spacious

**Agent:** aether
**Context:** meditation opening, threshold moment

**Raw text:**
Take one breath. Let the room become simple again. Notice what remains when you stop reaching.

**Expected shaped text:**
Take one breath. Let the room become simple again. Notice what remains when you stop reaching.

### Kokoro

| Dimension | Score | Notes |
|-----------|-------|-------|
| Naturalness | | |
| MAIA-ness | | |
| Emotional fit | | |
| Clarity | | |
| Pacing | | |
| Restraint | | |
| Trustworthiness | | |

What felt off:
Which layer likely caused it:
What to adjust:

### OpenAI

| Dimension | Score | Notes |
|-----------|-------|-------|
| Naturalness | | |
| MAIA-ness | | |
| Emotional fit | | |
| Clarity | | |
| Pacing | | |
| Restraint | | |
| Trustworthiness | | |

What felt off:
Which layer likely caused it:
What to adjust:

### Decision

Provider sufficient: [ ] Kokoro [ ] OpenAI [ ] Both
Elevation needed: [ ] Yes [ ] No
Adjustments needed:

---

## Summary

### Where Kokoro is sufficient


### Where OpenAI adds real value


### Preset tuning needed


### Auto-elevation candidates


### Layer diagnosis pattern

| Issue pattern | Layer | Fix |
|--------------|-------|-----|
| | | |

---

## Diagnostic Reference

| Problem | Likely layer |
|---------|-------------|
| robotic phrasing | text shaping |
| wrong emotional tone | preset resolution |
| over-soft / over-hard | instruction tuning |
| flat delivery | provider limitation |
| inconsistency | provider drift |
| too theatrical | instruction overreach |
| assistant-y tone | identity instruction |
| pacing feels off | speed/pause params |
