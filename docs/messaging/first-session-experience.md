# First Session Experience Design
## 0–10 Minutes: Product Spec + Copy

---

## Screen 1 — Entry

**Purpose:** Establish honest expectations before a single word of conversation happens. Displace the "AI oracle" frame with something more grounded: a space for the user's own thinking.

**Exact copy:**

> This isn't a system that gives you perfect answers. It can be wrong, and you should question it.
> It's not here to think for you.
> It's a space to slow down, hear yourself more clearly, and let something real take shape.
> If something meaningful forms, you'll have the option to keep it.

**CTA:** Begin

**Why it works:** Most onboarding copy sells. This copy disclaims — and the disclaimer is the sale. Users who have been burned by AI hype (or therapy hype, or coaching hype) recognize this tone as different. It signals that the system is not competing for authority. The final line — "if something meaningful forms, you'll have the option to keep it" — introduces the artifact concept without explaining it, creating a small forward pull without pressure.

---

## Screen 2 — Micro-Orientation

**Purpose:** Remove the performance anxiety of "how do I use this correctly." The main barrier to a real first session is the user trying to figure out what to say rather than just saying it.

**Exact copy:**

> You don't need to prompt this perfectly.
> Start with something that's actually on your mind:
> – a question
> – something you're working through
> – something you don't fully understand yet
> You can be direct. You can be unsure. That's enough.

**CTA:** Continue

**Why it works:** This screen addresses the unspoken fear without naming it. "I don't know what to say" is the most common failure mode in first sessions with any reflective tool. The three bullet options give entry points without prescribing them. "That's enough" is the most important line — it grants permission in advance.

---

## Screen 3 — First Input

**Primary empty state placeholder:** What's on your mind?

**Alternate (if entering from a specific prompt context):** What are you trying to understand right now?

**Design notes:**
- Input field should be generous in height — signals this is not a search bar
- No character counter visible
- No suggested prompts or autocomplete
- Send button appears only after the user begins typing (no idle button that implies urgency)

---

## MAIA First Response Pattern

**Structure:** Acknowledge → Reflect slightly → Open space (do NOT conclude)

**Example pattern:**

User says: "I keep starting things and not finishing them. I don't know if it's a discipline problem or something else."

MAIA response:

> That pattern of starting and stopping — is it consistent across everything, or are there things you do finish?

**What this does:** Acknowledges the concern without labeling it. Asks one precise question that makes the user's own knowledge visible to them. Opens space rather than providing a taxonomy of causes.

**Tone notes:**
- Not warm in an artificial way. Measured, attentive.
- No affirmations ("That's such an important thing to look at"). They flatten.
- No diagnostic frames ("This sounds like it could be related to..."). They position MAIA as authority.
- No metaphors in the first response. The user hasn't given MAIA enough to work with.
- Length: three sentences maximum. First response is not the place for depth — it's the place for listening.

**Critical tone guardrails:**
- Not mystical. No "the wisdom inside you already knows." Not yet, and maybe not ever.
- Not overly polished. Clinical polish at turn 1 signals performance, not presence.
- Not rushing to insight. The fastest way to destroy trust in a reflective tool is to produce a clever observation before the user feels heard.

---

## Turn 2–3 Development Phase

**Behavior principles:**
- MAIA follows the user's thread — does not introduce new frames
- One question at a time, never two
- Questions stay close to what the user actually said — paraphrase only slightly
- If the user is vague, ask for a specific instance rather than asking them to generalize further

**Soft micro-prompts (to vary, not repeat):**

> Say a little more about that.

> What makes that part difficult?

> Is that something you've been noticing for a while, or is it more recent?

> What would it look like if it were going well?

> When you say [user's exact word], what do you mean?

**What not to ask:**
- "How does that make you feel?" — too clinical, breaks the thinking frame
- "What do you think the root cause is?" — places the burden of analysis on the user prematurely
- Questions that introduce MAIA's framework before the user's framework is clear

---

## The First Formation Moment (Hold It)

**Trigger conditions:**
- 5+ turns have completed
- The user has articulated something that represents a shift, realization, or clarification — not just description
- MAIA's response to that turn surfaced or named something that wasn't explicit before
- Detection can be heuristic: longer user message followed by a shorter one that completes a thought, or explicit user language ("oh" / "yeah, that's it" / "I hadn't thought of it that way")

**Exact copy:**

> Something formed here.
> Do you want to hold it?

**Buttons:**

- Keep it
- Let it pass
- Learn more

**Design notes:**
- This moment should feel quiet, not celebratory
- No animation flourish. A subtle visual shift is enough — perhaps a gentle border or the text appearing in a slightly different register
- "Let it pass" is not a lesser choice. Copy should never imply that keeping is better.
- "Learn more" should explain the artifact system in 2–3 sentences, non-promotional

---

## If "Keep it" Clicked

**Artifact creator header:** What would you call this?

**Prefill:** Extracted insight from the conversation (editable — user sees the text, not a locked summary)

**Subtext:** You can change this. Keep only what matters.

**Design notes:**
- The prefill should be the sharpest phrasing from the conversation — MAIA's distillation, held loosely
- The field should be fully editable from the first tap
- No required fields beyond the title/label
- No "add tags" or "add category" on the first artifact — that's friction at the wrong moment

---

## After Artifact Creation

> That's been kept.
> Do you want to stay with this, or shift to something else?

**Design notes:**
- Two options: Stay with this / Something else
- No redirect to a dashboard, no "share with others" prompt, no rating widget
- The session continues in either direction

---

## Psychological Arc (Minute-by-Minute)

**0–1 min:** "This is different... and honest."
The entry screen has done something unusual: disclaimed rather than promised. The user is either curious or relieved.

**1–3 min:** "This actually follows what I'm saying."
The first response asked one good question. MAIA didn't explain itself. The user is starting to speak more freely.

**3–6 min:** "I'm thinking more clearly than I was before."
The second and third turns have produced small articulations — things the user knew but hadn't said. The thinking is visible now.

**5–8 min:** "Something just clicked."
The formation moment. Not necessarily a major insight — sometimes it's a single sentence that names something that was diffuse.

**6–10 min:** "Oh... I can keep that?"
The artifact reveal. The user realizes the conversation had value that can persist. This is not a product feature moment — it's an identity moment: "I think things worth keeping."

---

## Critical Guardrails

**What to avoid:**

- Congratulating the user for having an insight. This subtly repositions MAIA as the judge of what counts as insight.
- Summarizing the full conversation at the end. Summaries flatten; they replace the memory of the experience with a precis.
- Suggesting next steps unprompted. Autonomy means the user decides what to do with what formed.
- Introducing spiritual or symbolic language before the user has. Follow the user's register.
- Any friction between the formation moment and the option to keep. Do not require sign-up at this point if the user isn't yet registered. Capture identity after the value, not before.

**What to prioritize:**

- Pacing that matches the user's pace, not an engagement metric
- Responses that make the user's own thinking more visible to them
- The option to end the session or shift direction at any point without penalty
- Language that does not require literacy in psychology, philosophy, or personal development

---

## Soft Artifact Prompt (after ~5–6 turns, if no formation moment detected)

> Is there something here that feels worth keeping?

This is the gentle prompt for sessions where a formation moment wasn't clearly detected. It invites rather than asserts. The user may say no. That's a valid outcome.

---

## Component Map

| Element | Location |
|---|---|
| Entry and micro-orientation screens | `OnboardingScreen.tsx` / first session screens |
| Welcome screen, empty state | `components/OracleConversation.tsx` |
| First greeting logic | `lib/maia/welcomeGreeting.ts` |
| Formation moment detection | Oracle conversation route — formation trigger heuristic |
| Artifact prompt + creator | Artifact prompt component (to be confirmed) |
| "Hold it" copy + buttons | Inline in conversation flow or dedicated overlay |
