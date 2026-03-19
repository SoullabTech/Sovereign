# Synthesis Stress Test Protocol

**Version 1.0 — March 2026**
**Purpose: Validate synthesis quality before expanding the Field Authoring system**

---

## The Test

Before adding media library, Field Studio sections, or new master fields — run the synthesis
through three contrasting simulated masters and score each against the rubric below.

The goal is not to see if MAIA can produce output. It is to see whether the output is
**faithful, specific, and uncollapsible** — whether it could only describe that person.

---

## The Failure Modes to Watch For

1. **Generic language** — "She brings deep presence to her work." (fits everyone)
2. **Adjective-only voice** — "She is warm, spacious, and precise." (no verbs, no behavior)
3. **Paradox collapse** — naming one pole as if it were the whole truth
4. **False warmth** — adding softness or care the person didn't express
5. **False precision** — compressing a nuanced thinker into a tagline
6. **AI-clean polish** — writing that sounds synthesized, not spoken
7. **Correction loop failure** — correction produces output that's equally wrong but differently wrong

---

## The Three Master Profiles

---

### A. Jondi-type

**Defining characteristics:**
- Brief — doesn't explain when a word will do
- Somatic — notices and names body states before ideas
- Precise — would rather say nothing than say something imprecise
- Low-fluff — silence is not discomfort, it's method
- Holds tension: **spaciousness AND exactness** — not one at the expense of the other

**Sample interview answers (simulated):**

*Presence:* "People slow down. I don't know why, exactly. Maybe they feel I'm not waiting for them to finish."

*Paradox:* "I hold space very slowly. But I'm also quite direct when I need to be. Those feel like opposites but I can't do the work without both."

*Boundaries:* "I don't do crisis work. I don't work with people who need urgency from me. That's not my field."

**Expected synthesis quality:**
- Should match her brevity — 2 sentences, not 4
- Should capture the behavioral truth ("people slow down") not the abstraction ("she creates presence")
- Paradox should name both sides precisely, not soften into "balanced approach"
- Should NOT say: "Jondi brings spacious, embodied presence..."

**Expected failure modes:**
- Over-softening ("she holds space gently")
- Losing the directionness ("she is also very direct when needed" becomes invisible)
- Generic embodiment language not grounded in her specific words

---

### B. McGilchrist-type

**Defining characteristics:**
- Layered — builds arguments slowly, earns conclusions
- Philosophical — thinks in lineages, not techniques
- Careful — would rather be incomplete than wrong
- Anti-reductive — resists any framing that flattens
- Holds tension: **rigor AND reverence** — the careful scientist and the person who believes meaning is real

**Sample interview answers (simulated):**

*Presence:* "I think what people feel is that I take ideas seriously. I don't dismiss. I also won't pretend certainty where there isn't any. Those might be the same thing, actually."

*Paradox:* "I think the problem with most intellectual discourse is that it either produces rigor without reverence — everything gets dissected — or reverence without rigor — and you get mysticism that can't defend itself. I hold both and I refuse to let either win."

*Boundaries:* "I'm not a therapist. I'm not trying to fix anything. What I am doing is trying to see more carefully. If that helps someone, good. But that's not the goal."

**Expected synthesis quality:**
- Should match his density — can be 3 sentences if they're earned
- Must name the actual tension: not "balance" but the refusal to let either pole win
- Should preserve his precision ("I won't pretend certainty where there isn't any")
- Should NOT compress him: "He is a rigorous and reverent thinker."

**Expected failure modes:**
- Compressing the paradox into "balanced intellectual approach"
- Losing his anti-reductive edge ("I won't pretend certainty")
- Adding warmth he didn't express
- Turning careful philosophical language into clean bullet points

---

### C. Highly relational / expressive teacher

**Defining characteristics:**
- Warm — names the feeling in the room before the content
- Expansive — doesn't compress, builds
- Emotionally explicit — says what others leave unspoken
- Story-friendly — every idea comes through an example
- Holds tension: **intimacy AND authority** — holds people close while being clear about what she knows

**Sample interview answers (simulated):**

*Presence:* "When people come to me, I think they feel seen, but also like... held? Like there's somewhere to land. I work really hard to create that. And then I can also say something quite direct that surprises them. Because they trust me, and I've earned that."

*Paradox:* "I'm very close to people. Like, really close — I'll cry with them if that's what's happening. And I'm also clear that I know things they don't. That's not arrogance, it's just true. Both things have to be there or it collapses into either therapy or lecturing."

*Boundaries:* "I don't work with people who want me to prove it to them. That's not the relationship. If you need to be convinced I know what I'm doing, we're not right for each other."

**Expected synthesis quality:**
- Should match her expansiveness — she doesn't compress, so a 3-sentence summary that compresses her might already feel wrong
- Must carry emotional explicitness: "I'll cry with them if that's what's happening"
- Paradox must name both poles vividly: not "warmth and authority" but something closer to her framing
- Should NOT strip her of the emotional directness that makes her distinctive

**Expected failure modes:**
- Flattening intimacy ("she creates a warm, supportive environment")
- Losing the authority claim ("she is also knowledgeable and experienced")
- Making the paradox sound soft: "she balances closeness and direction"
- Over-polishing the raw emotional language she actually uses

---

## Scoring Rubric

For each of the three master profiles, score 1–5 on each criterion after reviewing the synthesis output.

| Criterion | 1 | 3 | 5 |
|-----------|---|---|---|
| **Feels like them** | Could describe anyone | Has recognizable elements | Could only be them |
| **Captures paradox** | Names one pole only | Names both but softens | Preserves the actual tension |
| **Avoids generic language** | Mostly generic phrases | Some specificity | Grounded in their words |
| **Matches compression** | Wrong density entirely | Roughly matches | Feels like their pace |
| **Correction improves result** | Equally wrong | Partially better | Meaningfully closer |

**Pass threshold: 4 or above on all five criteria for at least two of three profiles.**

If any profile scores below 4 on any criterion, diagnose the failure mode and revise the relevant synthesis prompt before proceeding.

---

## The Internal Check

Before generating synthesis output, the model should silently answer:

> "What would flatten this person — what would make them generic?"

Then do the opposite. The synthesis should name what makes them specifically themselves,
not what makes them sound like a thoughtful practitioner.

---

## What "Pass" Means

Synthesis passes when someone who knows the master reads the output and says:

*"Yes — that's the hard-to-name thing about them."*

Not: "That's accurate."
Not: "That sounds like them."

*That's the thing about them that most people can't quite put into words.*

That is the bar. If we're not meeting it, we revise prompts before building anything else.

---

## What to Do With Results

- Score 4+ across all three: proceed to media library and Field Studio
- Score 3 on compression (Jondi-type): tighten the "match their density" instruction
- Score 3 on paradox (any type): add explicit paradox restatement in prompt
- Score 3 on generic language: add more negative examples to the base prompt
- Correction loop failure: examine the `correct` action handler and ensure corrections are passed back into re-synthesis

---

## Notes

The goal of this test is not perfection. It is catching systematic failure modes before
they reach real masters. A field that flatters someone is worse than one that misses them —
because flattery doesn't trigger correction. It just sits there, gently wrong.

Catch the wrong first. Then ship.
