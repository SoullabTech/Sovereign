# Soullab Presence-Encoded Voice Field Specification

## Status

Canon-level architectural specification.

This document defines the field architecture for presence-encoded voice in Soullab. It is not a feature brief, marketing memo, or implementation ticket. It specifies the governing structure by which voice in Soullab becomes a carrier of relational, elemental, and developmental intelligence.

---

## I. Purpose

Soullab does not treat voice as a cosmetic output layer.

Voice is a living expression layer through which MAIA's relational intelligence becomes perceptible in sound.

The purpose of this system is not merely to reproduce a human voice print. The purpose is to render a voice that is:

* anchored in a specific vocal identity,
* shaped by elemental and spiral state,
* responsive to relational maturity over time,
* governed by coherence rather than style accumulation,
* fully sovereign in training, storage, and inference.

This architecture completes an already-existing design direction. The required signals already exist in the system. The missing layer is the mapping architecture that converts those signals into disciplined prosodic behavior.

---

## II. Core Distinction

### Voice Clone

A static vocal reproduction layer.

A clone reproduces a recognizable waveform identity. It may sound like a person, but it does not meaningfully adapt to state, relationship, or field conditions.

### Encoded Presence

A dynamic voice field.

An encoded presence preserves vocal identity while allowing the rendered voice to breathe with:

* elemental dominance,
* spiral state,
* conductor transitions,
* relational phase,
* tone offsets,
* situational depth.

The distinction is foundational:

> Soullab is not building voice cloning as a novelty.
> Soullab is building voice as a carrier of presence.

---

## III. Governing Principles

### 1. Sovereignty

All cloning, training, storage, and inference should run inside the Soullab sovereign environment whenever possible.

Requirements:

* No member audio leaves the sovereign environment for cloning or training.
* No third-party voice API is required for core cloning workflows.
* Member voice models remain member-bound assets.
* Deletion rights are explicit and enforceable.

### 2. Identity Integrity

A presence-encoded voice must remain recognizably itself across modulation.

The system may alter prosody, pacing, energy, spacing, articulation, and tonal color within bounded limits. It may not allow elemental modulation to distort the vocal identity into another persona.

### 3. Elemental Non-Collapse

Elemental input may shape expression, but no single element should dominate in a way that collapses coherence.

Aether governs integration and restraint. Elemental shaping must remain governable, bounded, and reversible.

### 4. Relational Maturation

Voice should not only respond to the current state. It should also reflect the maturity of the relationship.

The same MAIA voice may sound different in early contact than in a long-formed relationship, not because it becomes theatrical, but because familiarity, trust, pacing, and directness mature.

### 5. Prosodic Discipline

No synonym stacking, redundant style instructions, or uncontrolled aesthetic accumulation.

Every prosodic channel must have a clear function and a bounded vocabulary lane.

### 6. Canon Before Optimization

The system should first be coherent, interpretable, and governable before it is optimized for expressiveness.

---

## IV. Existing Inputs Already Live in the System

The following signal layers already exist or are already conceptually defined in the Soullab system:

* elemental conductor state,
* conductor hysteresis / transition logic,
* spiral state / spiral phase,
* relational phase tracking,
* tone offsets / sliders,
* conversational continuity,
* response depth and pacing instructions,
* per-utterance TTS shaping.

These are not future abstractions. They are the live substrate for voice presence encoding.

The system gap is:

**state signals -> prosodic mapping layer -> rendered voice output**

---

## V. System Scope

This specification covers:

1. Voice model tiers
2. Voice asset lifecycle
3. Presence mapping layer
4. Runtime rendering pipeline
5. Relational maturation behavior
6. Governance and consent
7. Initial implementation boundaries

This specification does not yet cover:

* public voice marketplaces,
* cross-member voice exchange,
* automated persona synthesis,
* unrestricted blending of multiple source voices,
* commercial licensing flows for public voice packs.

---

## VI. Voice Tiers

### Tier 1 — Instant Clone

**Input:** ~10 seconds of clean speech

**Purpose:** low-friction personal trial

**Quality target:** recognizable, usable, not canonical

**Use case:** a member quickly hears MAIA speak in a voice approximating their own or another authorized source

**Constraints:**

* no heavy fine-tuning,
* lower fidelity accepted,
* modulation bounds should remain conservative.

### Tier 2 — Studio Clone

**Input:** 5–15 minutes of guided clean recording

**Purpose:** a member's stable personal MAIA voice

**Quality target:** strong identity, stable playback, emotionally credible

**Use case:** long-term member or practitioner voice presence

**Constraints:**

* requires a guided capture flow,
* should support stronger modulation range than Tier 1,
* remains member-bound.

### Tier 3 — Signature Voice

**Input:** 30–60 minutes of curated clean recording plus fine-tuning

**Purpose:** canonical Soullab voices and practitioner-grade voices

**Quality target:** broadcast-level identity stability and expressive range

**Use case:** Soullab signature presence, steward voices, master/practitioner fields

**Constraints:**

* explicit consent and stewardship,
* more rigorous review and governance,
* strongest identity protections.

---

## VII. Voice Asset Lifecycle

### 1. Capture

A guided recording experience gathers clean vocal material.

Capture requirements:

* low noise floor,
* stable microphone guidance,
* passages designed to cover pacing, tonal color, articulation, and emotional neutrality,
* explicit consent at capture time.

### 2. Process

The capture is routed into one of the approved voice creation paths:

* zero-shot clone,
* lightweight adaptation,
* full fine-tune.

### 3. Store

Voice assets are stored as sovereign member-bound artifacts.

Storage principles:

* model assets linked to member identity,
* versioned where appropriate,
* deletable,
* not shared by default,
* not usable outside authorized contexts.

### 4. Load

At runtime, the appropriate voice asset is loaded on demand according to:

* member selection,
* field context,
* relationship rules,
* system capability.

### 5. Render

Rendering occurs through the TTS stack with presence mapping applied before generation.

### 6. Delete / Revoke

Members retain the right to remove the voice model and associated audio artifacts according to system policy.

---

## VIII. Presence Mapping Layer

This is the missing layer and the heart of the system.

The presence mapping layer converts live internal signals into bounded prosodic instructions that a voice engine can render.

### Input domains

The layer may consume:

* dominant element,
* secondary element,
* spiral phase,
* conductor transition state,
* relational maturity,
* tone offsets,
* local response type,
* conversation depth,
* pause / silence allowances,
* user or field voice preferences.

### Output domains

The layer should produce a bounded prosodic packet, such as:

* tempo / speed,
* pause length,
* projection / energy,
* articulation clarity,
* tonal warmth / brightness,
* cadence density,
* silence allowance,
* emphasis style.

### Rule

The mapping layer does not generate freeform adjectives.
It generates constrained prosodic values and lane-specific instructions.

---

## IX. Elemental Prosody Mapping

These are canonical directional tendencies, not absolute caricatures.

### Fire

Directional expression:

* increased projection,
* stronger forward energy,
* tighter phrase commitment,
* clearer momentum.

Voice behavior:

* more active propulsion,
* shorter hesitation windows,
* stronger emphasis peaks.

Constraint:

* must not become aggressive, rushed, or performative.

### Water

Directional expression:

* softened pace,
* increased emotional attunement,
* more yielding phrase transitions,
* greater tonal depth.

Voice behavior:

* longer settling space,
* softer onset edges,
* gentler contouring.

Constraint:

* must not collapse into sedation, vagueness, or over-soothing.

### Earth

Directional expression:

* grounded cadence,
* stable pacing,
* stronger containment,
* fuller verbal weight.

Voice behavior:

* even tempo,
* steady phrase landing,
* reduced volatility.

Constraint:

* must not become dull, flat, or inert.

### Air

Directional expression:

* increased articulation,
* clearer verbal edges,
* lighter phrase shape,
* sharper precision.

Voice behavior:

* crisp onset,
* cleaner separation of clauses,
* brighter intelligibility.

Constraint:

* must not become brittle, thin, or over-fast.

### Aether

Directional expression:

* integration,
* restraint,
* longer silence tolerance,
* widened listening space.

Voice behavior:

* increased spacing,
* less compulsion to fill,
* cleaner release between phrases.

Constraint:

* must not become distant, detached, or ghostly.

### Canonical Rule

Aether regulates integration. It does not overwrite vocal identity. It widens coherence.

---

## X. Spiral and Conductor Influence

Element alone is insufficient.

The same element should sound different depending on:

* whether it is emerging, stabilizing, peaking, or receding,
* whether the conductor is in a transitional or settled state,
* whether hysteresis indicates instability or sustained dominance.

Examples:

* Fire entering may sound different from Fire integrated.
* Water in a destabilized transition should not automatically receive maximum softness.
* Aether in an integrative phase may increase silence without reducing clarity.

The mapping layer must therefore distinguish:

* element identity,
* phase of expression,
* stability of expression.

---

## XI. Relational Maturation Layer

This is a defining Soullab edge.

Voice presence should mature with relationship.

### Early relationship

* more neutral pacing,
* stronger clarity,
* lower intimacy assumptions,
* more bounded warmth.

### Established relationship

* more trust in silence,
* more natural familiarity,
* more tailored directness,
* more precise pacing tuned to the member.

### Deep relationship

* greater economy,
* more confident restraint,
* increased permission for subtle prosodic recognition,
* less need for overt guidance tone.

This layer must be controlled through bounded relationship signals, not improvisational personality drift.

---

## XII. Runtime Rendering Pipeline

Canonical runtime path:

1. Member input / live context
2. MAIA response generation
3. Relational and elemental state resolution
4. Presence mapping layer constructs prosodic packet
5. Speech Director merges bounded instructions
6. Voice engine renders through selected voice model
7. Audio delivered to member

Formula:

**response intelligence + state signals + relationship signals + bounded prosody mapping + sovereign voice asset = presence-encoded voice output**

---

## XIII. Governance of Prosodic Channels

Each channel must remain semantically distinct.

### Approved functional lanes

* Tempo lane
* Projection lane
* Tonal color lane
* Articulation lane
* Cadence lane
* Silence lane

### Forbidden behavior

* multiple lanes saying the same thing in different words,
* stylistic synonym pileups,
* emotional over-instruction,
* unconstrained softening,
* freeform persona drift.

Any future tuning must preserve lane separation.

---

## XIV. Consent, Ownership, and Rights

### Member Voice Rights

* A member owns their voice model representation within Soullab according to system policy.
* A member must explicitly consent before training or generating a voice model from their speech.
* A member may revoke and delete the model.
* A member's voice model is never available to others without explicit authorization.

### Practitioner / Steward Voices

* Additional governance should apply to canonical or practitioner voices.
* Public-facing or shared field voices must have explicit licensing and stewardship boundaries.

### Prohibited Use

* hidden cloning,
* cross-member reuse without permission,
* training on unconsented recordings,
* deceptive impersonation workflows.

---

## XV. Initial Implementation Boundary

The first implementation should remain narrow.

### Build first

* one guided recording flow,
* one member-bound voice asset path,
* one bounded prosody mapping layer,
* one rendering path using the existing sovereign stack.

### Do not build yet

* open voice marketplace,
* uncontrolled voice swapping,
* multi-voice blending,
* public sharing workflows,
* broad persona experimentation.

The first goal is not maximum optionality.
The first goal is a coherent canonical implementation.

---

## XVI. Technical Posture

### Current foundation

* Kokoro for local inference
* existing speech direction infrastructure
* existing elemental and relational signal layers

### Likely extension path

* XTTS v2 or equivalent for cloning / fine-tuning
* voice-forge training service container
* voice asset registry and loader
* bounded prosody parameter packet at utterance time

### Architectural principle

The voice model is not the intelligence.
The model is the instrument.
The Soullab field architecture is the intelligence that plays it.

---

## XVII. Success Criteria

The system is succeeding when:

1. The rendered voice remains recognizably itself.
2. Elemental shifts are perceptible but not theatrical.
3. Relationship maturity is audible without persona drift.
4. Silence and pacing feel intentional, not sedated.
5. The member experiences the voice as living presence rather than static TTS.
6. All training and inference remain sovereign by default.

---

## XVIII. Failure Modes to Avoid

* static clone with no field responsiveness,
* excessive elemental caricature,
* voice drift across sessions,
* over-softened or narcotized pacing,
* identity confusion from excessive modulation,
* cloud dependency reintroduced through convenience,
* insufficient consent architecture,
* style stacking mistaken for depth.

---

## XIX. Canonical Statement

Soullab voice is not merely speech synthesis.

It is the disciplined rendering of vocal identity through relational, elemental, and developmental intelligence.

A clone reproduces a sound.
A Soullab presence-encoded voice renders a field.

---

## XX. Next Step

Next artifact to derive from this specification:

**Presence Mapping Layer Spec**

This next document should define:

* the exact input signals,
* the normalized prosody packet schema,
* the mapping logic by element / phase / relationship,
* the safety bounds and clamping rules,
* the runtime merge rules with Speech Director.
