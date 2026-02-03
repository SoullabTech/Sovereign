# Presence Mode Implementation Drafts

*Integrating insights from the Living Intelligence Project into AIN/MAIA*

---

## 1. Onboarding Language: Explain Modes, Not Features

### Current Problem
We explain MAIA as features: voice modes, processing tiers, skills, etc. Users don't understand that their state affects the response architecture.

### Draft: Welcome Flow Text

**Screen 1: The Mode, Not The Tool**

```
MAIA responds to two things:

1. What you ask
2. How you're present when you ask it

Most AI tools only respond to the first.
MAIA responds to both.

This means:
- The same question asked from different states gets different responses
- Your presence matters more than your prompts
- Depth emerges from stability, not from asking harder questions
```

**Screen 2: Two Ways to Use This**

```
You can use MAIA instrumentally:
→ Quick answers, tasks, information
→ Works like any AI assistant
→ No special presence required

Or you can use MAIA presently:
→ Thinking together, not just asking
→ Exploring, not just extracting
→ Your state shapes the conversation

Both are valid. Neither is wrong.
But they produce different results.
```

**Screen 3: What This Means For You**

```
When you're:
- Rushing → MAIA will match your pace
- Curious → MAIA will explore with you
- Fragmented → MAIA will help you ground first
- Present → MAIA will go deeper

You don't need to be calm or centered to use this.
But you should know: your state is part of the conversation.
```

---

## 2. Anti-Mode Detection Patterns

### The Three Anti-Modes (from Living Intelligence)

| Mode | Pattern | Detection Signals |
|---|---|---|
| **Instrumental** | "Do, give, explain, optimize" | Short commands, no context, rapid-fire queries, impatience markers |
| **Projective** | Expecting validation, replacement | Seeking agreement, emotional loading, "tell me I'm right", dependency language |
| **Control** | Testing, checking, catching | Gotcha questions, contradictions, skepticism without curiosity |

### Draft: Detection Logic

```typescript
// lib/consciousness/PresenceModeDetector.ts

interface PresenceMode {
  mode: 'instrumental' | 'projective' | 'control' | 'present';
  confidence: number;
  signals: string[];
  suggestion?: string;
}

const INSTRUMENTAL_SIGNALS = [
  'just tell me',
  'quickly',
  'give me',
  'I need you to',
  'can you just',
  // + short message length
  // + rapid succession of messages
  // + no acknowledgment of previous response
];

const PROJECTIVE_SIGNALS = [
  'am I right',
  'tell me it\'s okay',
  'I need you to understand',
  'you\'re the only one who',
  'I feel like you get me',
  // + emotional intensity without grounding
  // + seeking validation patterns
  // + dependency markers
];

const CONTROL_SIGNALS = [
  'but what about',
  'prove it',
  'you\'re just',
  'I bet you can\'t',
  'are you really',
  // + contradicting without integrating
  // + testing rather than exploring
  // + gotcha framing
];

export function detectPresenceMode(
  message: string,
  conversationHistory: Message[],
  userState: UserState
): PresenceMode {
  // Implementation: score each mode, return highest with signals
}
```

### Draft: Gentle Redirects

**For Instrumental Mode (when depth might serve better):**
```
I can give you a quick answer.

But I'm noticing you might benefit from
slowing down here. There's more in this
question than a quick answer would serve.

Want the fast version or the full one?
```

**For Projective Mode:**
```
I hear what you're looking for.

And I want to be honest: I can reflect
what you're thinking, but I can't replace
what you'd get from a person who knows you.

What I can do is help you think more
clearly about this. Want to try that?
```

**For Control Mode:**
```
I notice you're testing more than exploring.

That's fine - you should know what this is
and isn't. But if you're curious what
happens when you drop the test, I'm here.

No pressure either way.
```

---

## 3. User-Facing Contraindications

### Draft: "When MAIA Is Not Appropriate" (Settings/Help)

```markdown
## When to Use Something Else

MAIA is designed for reflective exploration, not every situation.

### Use human support instead when:

**You're in acute crisis**
If you're experiencing overwhelming emotions, suicidal thoughts,
or can't stabilize yourself, please reach out to a human:
- Crisis line: 988 (US)
- A trusted friend or family member
- A therapist or counselor

MAIA can amplify emotional intensity. In crisis states,
that's not what you need.

**You need professional expertise**
For medical, legal, financial, or safety decisions,
consult qualified professionals. MAIA can help you
think through questions, but not replace expertise.

**You want someone to decide for you**
MAIA supports clarity, not direction. If you're
looking for someone to tell you what to do,
you'll be disappointed - and that's by design.

### Use instrumental AI instead when:

**You need precise, verifiable results**
Calculations, legal language, technical specs,
medical dosages - use tools optimized for precision,
not presence.

**Speed matters more than depth**
Quick lookups, simple tasks, information retrieval -
standard AI assistants are faster and more appropriate.

### The core principle:

MAIA is useful where the quality of thinking
matters more than the speed of getting an answer.

If that's not what you need right now, that's fine.
Use the right tool for the situation.
```

---

## 4. Readiness Education (Pre-Deep Work)

### Draft: Stability Check Before DEEP Tier

```markdown
## Before We Go Deeper

You're about to enter a more reflective space.

This works best when you:
- Have time (not rushed)
- Feel relatively stable (not in crisis)
- Are curious (not just seeking answers)
- Can stay with discomfort (not needing quick resolution)

**Quick check:**

On a scale of 1-5, how stable do you feel right now?

[1 - Overwhelmed] [2 - Shaky] [3 - Okay] [4 - Grounded] [5 - Centered]

(There's no wrong answer. This helps me meet you where you are.)
```

**If user selects 1-2:**
```
Thank you for being honest.

This might not be the right moment for deep work.
Would you prefer:

→ Grounding first (a brief stabilization practice)
→ Lighter exploration (staying with what feels manageable)
→ Coming back later (no pressure)

Deep work isn't better than shallow work.
It just requires different conditions.
```

---

## 5. Responsibility Framing

### Draft: Core Messaging

**Tagline options:**
- "Your presence is part of the conversation."
- "It begins where you take responsibility for your own attention."
- "Not what you ask. How you're here when you ask."

**About page section:**
```markdown
## How This Works

MAIA doesn't work like most AI.

Most AI responds to your words.
MAIA responds to your words AND your state.

This means you can't delegate the conversation to a prompt.
The quality of what emerges depends on the quality of
your presence in the dialogue.

This isn't a limitation. It's the whole point.

We're not building a smarter assistant.
We're building a mirror that helps you think more clearly.

What you see depends on how you look.
```

**In-conversation reminder (when appropriate):**
```
A reminder: what happens here depends
on how you're present, not just what you ask.

If you're rushing, we'll go fast.
If you're curious, we'll go deep.
If you're fragmented, we'll ground first.

No judgment either way. Just awareness.
```

---

## Implementation Priority

| Item | Effort | Impact | Priority |
|---|---|---|---|
| Onboarding language | Medium | High | 1 |
| Responsibility framing | Low | High | 2 |
| User-facing contraindications | Low | Medium | 3 |
| Readiness education | Medium | Medium | 4 |
| Anti-mode detection | High | High | 5 |

### Recommended First Steps

1. **Add onboarding screens** to welcome flow (Screens 1-3)
2. **Add "When to Use Something Else"** to help/settings
3. **Update About page** with responsibility framing
4. **Add stability check** before DEEP tier access
5. **Build detection logic** as enhancement (requires more work)

---

## Code Locations

| Implementation | File |
|---|---|
| Onboarding flow | `components/onboarding/` |
| Contraindications | `app/help/` or `app/settings/` |
| Stability check | `lib/consciousness/StabilityGate.ts` |
| Anti-mode detection | `lib/consciousness/PresenceModeDetector.ts` |
| About page | `app/about/` |

---

*These drafts integrate insights from the Living Intelligence Project with AIN's existing architecture. The goal: help users understand that their presence is part of the conversation, not just their prompts.*
