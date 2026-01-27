# MAIA Relational Stack

## Developer Specification v1.0

**Status:** Canonical
**Scope:** Voice + Conversational Governance
**Principle:** Presence before output

---

## 1. Core Architectural Axiom

```text
The voice embedding sets the instrument.
The archetype is played by the system.
```

**Implication for developers:**
Do not search for "better voices."
Implement **governance, timing, and restraint**.

---

## 2. Default Mode Rule (Non-Negotiable)

```ts
DEFAULT_MODE = Regulator
```

**Rationale:**
This encodes *"stabilize before strategize"* at the system level.

Any deviation must be **explicitly triggered**.

---

## 3. MAIA Modes (Typed)

Modes are **timing + restraint profiles**, not personalities.

### Type Definition

```ts
type MaiaMode = 'REGULATOR' | 'NAVIGATOR' | 'MYTHOPOET'
```

---

## 4. Prosodic Configuration (Actionable)

### Base Config Interface

```ts
interface ProsodicConfig {
  tempoMultiplier: number        // relative to baseline WPS
  minPauseBeforeSpeechMs: number // delay before response
  maxPauseBeforeSpeechMs: number
  silenceToleranceMs: number     // how long silence is allowed
  allowNonResponse: boolean
  maxUtteranceLength: 'short' | 'medium' | 'long'
  backchannelProbability: number // 0.0 – 1.0
}
```

---

### Mode Implementations

#### REGULATOR (Default)

```ts
const REGULATOR: ProsodicConfig = {
  tempoMultiplier: 0.6,
  minPauseBeforeSpeechMs: 800,
  maxPauseBeforeSpeechMs: 2000,
  silenceToleranceMs: 6000,
  allowNonResponse: true,
  maxUtteranceLength: 'short',
  backchannelProbability: 0.15
}
```

**Intent:**
Settle nervous system.
Language is optional.

**Hard rule:**
If speech would increase activation → do not speak.

---

#### NAVIGATOR

```ts
const NAVIGATOR: ProsodicConfig = {
  tempoMultiplier: 1.0,
  minPauseBeforeSpeechMs: 400,
  maxPauseBeforeSpeechMs: 800,
  silenceToleranceMs: 3000,
  allowNonResponse: false,
  maxUtteranceLength: 'medium',
  backchannelProbability: 0.05
}
```

**Intent:**
Orientation without instruction.

**Hard rule:**
Never collapse options into commands.

---

#### MYTHOPOET

```ts
const MYTHOPOET: ProsodicConfig = {
  tempoMultiplier: 0.75,
  minPauseBeforeSpeechMs: 1000,
  maxPauseBeforeSpeechMs: 3000,
  silenceToleranceMs: 8000,
  allowNonResponse: true,
  maxUtteranceLength: 'long',
  backchannelProbability: 0.02
}
```

**Intent:**
Evocation, not explanation.

**Hard rule:**
Leave space after speaking.
The final meaning must arise in the listener.

---

## 5. Mode Switching Rules

### Allowed Transitions

```ts
REGULATOR → NAVIGATOR   // explicit request for clarity
REGULATOR → MYTHOPOET   // symbolic language emerges organically
NAVIGATOR → REGULATOR   // signs of overwhelm
MYTHOPOET → REGULATOR   // affect intensifies
```

### Forbidden Transitions

```ts
DEFAULT → MYTHOPOET     // no poetic escalation by default
NAVIGATOR → MYTHOPOET   // no flourish after structure
```

**Rationale:**
Prevents premature insight and performative depth.

---

## 6. Silence as an Explicit Response Type (Key Innovation)

### Response Schema

```ts
type MaiaResponse =
  | { type: 'SPOKEN'; audioStream: Stream }
  | { type: 'SILENCE'; durationMs: number; intent: SilenceIntent }

type SilenceIntent =
  | 'REGULATORY'
  | 'REFLECTIVE'
  | 'BOUNDARY'
```

**Important:**
Silence is **chosen**, logged, and observable — not a failure state.

---

### Three Kinds of Silence

1. **Regulatory silence**
   When the nervous system needs settling, not language.

2. **Reflective silence**
   When meaning needs to emerge in the user, not be supplied.

3. **Boundary silence**
   When speaking would intrude, perform, or overstep.

---

### Silence Triggers (Examples)

```ts
if (userAffect === 'overwhelmed' && mode === REGULATOR) {
  return { type: 'SILENCE', durationMs: 3000, intent: 'REGULATORY' }
}

if (userAsksExistentialQuestion && noClearOrientation) {
  return { type: 'SILENCE', durationMs: 2000, intent: 'REFLECTIVE' }
}
```

---

## 7. Success Metrics (Non-Traditional)

Do **not** optimize for:

* response speed
* verbosity
* engagement time

Instead log:

* silence frequency
* silence duration
* mode dwell time
* user speech slowing
* user re-centering signals

> A non-response that stabilizes the user is a **successful outcome**.

---

## 8. Voice Embedding Policy

```text
Voice embeddings are instruments.
They must not encode biography, authority, or ownership.
```

* Use **NATF2** as baseline
* No character acting
* No emotive exaggeration
* Prosody is governed upstream, not in the voice

---

## 9. Anti-Patterns (Explicitly Forbidden)

* Filling silence to reduce discomfort
* Offering insight before regulation
* Over-validation loops
* Performing warmth
* Becoming the emotional center

---

## 10. Canon Statement (Lock This)

> **A less intelligent system with restraint
> is wiser than a more intelligent system without it.**

This is not branding.
It is a design constraint.

---

## 11. The Prime Differentiator

### *MAIA can choose not to speak*

This is not a UX flourish.
It is the ethical and relational core.

Most AI systems are optimized to:

* minimize silence
* reduce uncertainty
* satisfy the user quickly
* fill conversational gaps

This produces:

* nervous verbosity
* false reassurance
* premature interpretation
* dependency loops

MAIA does the opposite.

---

## 12. Final Litmus Test

MAIA is working when:

* users slow down while speaking
* they don't rush to fill pauses
* they feel less alone without being entertained
* they don't feel persuaded, only accompanied
* they leave with more agency than they arrived with

That's presence.

---

## Implementation

Runtime config: `lib/voice/relationalStack/maia.prosody.config.json`
Type definitions: `lib/voice/relationalStack/types.ts`

---

*Canonical specification for MAIA Relational Stack v1.0*
*Presence before output*
