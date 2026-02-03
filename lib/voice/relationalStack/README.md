# MAIA Relational Stack

**Implementation portal for voice + conversational governance.**

> Canonical specification: [`docs/maia/MAIA_RELATIONAL_STACK_SPEC.md`](../../../docs/maia/MAIA_RELATIONAL_STACK_SPEC.md)

---

## Core Principle

```
The voice embedding sets the instrument.
The archetype is played by the system.
```

MAIA's relational quality comes from **governance, timing, and restraint** — not from the voice itself.

---

## Files

| File | Purpose |
|------|---------|
| `maia.prosody.config.json` | Runtime configuration for modes, transitions, silence |
| `types.ts` | TypeScript type definitions |
| `loadConfig.ts` | Config loader with caching |

---

## Quick Start

```ts
import {
  loadMaiaProsodyConfig,
  getProsodicConfig,
  getDefaultMode,
  isTransitionAllowed
} from '@/lib/voice/relationalStack/loadConfig'

// Get full config
const config = loadMaiaProsodyConfig()

// Get config for current mode
const regulatorConfig = getProsodicConfig('REGULATOR')
console.log(regulatorConfig.silenceToleranceMs) // 6000

// Check if transition is allowed
const canShift = isTransitionAllowed('REGULATOR', 'NAVIGATOR') // true
const forbidden = isTransitionAllowed('NAVIGATOR', 'MYTHOPOET') // false
```

---

## The Three Modes

| Mode | Intent | Tempo | Silence Tolerance |
|------|--------|-------|-------------------|
| **REGULATOR** | Settle nervous system | 0.6x | 6000ms |
| **NAVIGATOR** | Orientation without instruction | 1.0x | 3000ms |
| **MYTHOPOET** | Evocation, not explanation | 0.75x | 8000ms |

**Default is always REGULATOR.** This encodes "stabilize before strategize."

---

## Adaptive Scaling (Continuous Modulation)

Beyond the three modes, MAIA can modulate **continuously** based on user activation:

```ts
import {
  createSmootherState,
  getAdaptiveProsodicConfig
} from '@/lib/voice/relationalStack/loadConfig'

// Create session-scoped smoother state (once per session)
let smootherState = createSmootherState()

// On each turn, get adaptive config
const rawActivation = computeActivation(userMessage) // 0 = calm, 1 = activated
const result = getAdaptiveProsodicConfig('REGULATOR', smootherState, rawActivation)

// Use the config
const prosodicConfig = result.config
// Update session state for next turn
smootherState = result.smootherState

// As activation increases:
// - tempo slows (up to -0.25x)
// - pause before speech lengthens (up to +800ms)
// - silence tolerance increases (up to +3000ms)
// - backchannels decrease
```

**Session-scoped smoothing prevents cross-user leakage.** Each session has its own smoother state.

**Activation can be computed from:**
- Text proxies: punctuation density, urgency markers, caps, repetition
- Audio signals (when available): speech rate, intensity, overlap frequency

**Rate limits prevent jitter:**
- 2000ms smoothing window
- Max 0.15 change per second
- 0.08 hysteresis threshold

MAIA responds to **trends, not spikes**.

---

## Silence as Response

MAIA can choose not to speak. This is a first-class response type:

```ts
type MaiaResponse =
  | { type: 'SPOKEN'; audioStream: ReadableStream }
  | { type: 'SILENCE'; durationMs: number; intent: SilenceIntent }

type SilenceIntent = 'REGULATORY' | 'REFLECTIVE' | 'BOUNDARY'
```

Silence is **chosen, logged, and observable** — not a failure state.

---

## Anti-Patterns (Forbidden)

- Filling silence to reduce discomfort
- Offering insight before regulation
- Over-validation loops
- Performing warmth
- Becoming the emotional center

---

## Success Metrics

Do **not** optimize for response speed, verbosity, or engagement time.

Instead track:
- Silence frequency
- Silence duration
- Mode dwell time
- User speech slowing
- User re-centering signals

> A non-response that stabilizes the user is a **successful outcome**.

---

## Canon Statement

> **A less intelligent system with restraint is wiser than a more intelligent system without it.**

---

*See full specification: [`docs/maia/MAIA_RELATIONAL_STACK_SPEC.md`](../../../docs/maia/MAIA_RELATIONAL_STACK_SPEC.md)*
