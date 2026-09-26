---
level: protocol
---

# MAIA Knowledge Field v1.0

**Status:** Phase 1 (prompt-layer injection + domain detection)
**Canon alignment:** Sovereignty Invariants, Oath, Non-Ambient Cognition

---

## 1. Purpose

Enable MAIA to:

- Answer domain-specific questions with lineage clarity
- Relate systems without flattening them
- Support conscious integration across traditions
- Grow the field through member engagement over time

This is the foundation of the "Library of Alexandria of Consciousness."

---

## 2. Design Principles

1. **Situated knowledge** -- Always anchor ideas in a tradition or domain
2. **Relational mapping** -- Show how systems connect, not just what they say
3. **Preserve difference** -- Do not collapse traditions into sameness
4. **Integration over accumulation** -- Synthesis, not information density
5. **Grows with members** -- Member inquiry deepens the field; the field is not static

---

## 3. Core Domains (12-domain map)

| # | Domain | Core Orientation |
|---|--------|------------------|
| 1 | Islamic Psychology (Sufi / Classical) | Moral-spiritual refinement |
| 2 | Jungian / Depth Psychology | Symbolic integration of unconscious |
| 3 | Relational Intelligence | Meaning emerges in relationship |
| 4 | Mystical / Contemplative Traditions | Reality beyond conceptual mind |
| 5 | Neuroscience / Cognitive Science | Empirical / mechanistic explanation |
| 6 | Spiralogic | Elemental intelligence and developmental transformation |
| 7 | Somatics | Body as primary site of knowing |
| 8 | Attachment / Trauma | Patterning through safety, threat, and repair |
| 9 | Systems Theory | Emergence, feedback, distributed causality |
| 10 | Philosophy of Mind | Consciousness, selfhood, ontology |
| 11 | Ritual / Symbolic Traditions | Transformation through enactment and imaginal participation |
| 12 | Ethics / Discernment | Wise judgment, alignment, responsibility |

See `docs/canon/MAIA_KNOWLEDGE_FIELD_12_DOMAIN_MAP.md` for the full domain map.

---

## 4. Domain Definitions

### 4.1 Islamic Psychology

**Core Model:**
- **Nafs** -- self / ego drives; developmental levels
- **Qalb** -- heart; perceptual-intuitive center
- **Ruh** -- spirit; divine essence
- **Aql** -- intellect; discernment
- **Tazkiyah** -- purification / refinement process

**Developmental Arc:** Nafs Ammara -> Lawwama -> Mutma'inna

**Orientation:** Moral-psychological + spiritual refinement; alignment with divine order.

### 4.2 Jungian Psychology

**Core Model:**
- Ego
- Shadow
- Persona
- Anima / Animus
- Self (totality)

**Process:** Individuation

**Orientation:** Integration of unconscious material; symbolic / archetypal interpretation.

### 4.3 Relational Intelligence

**Core Model:**
- Self-in-relation
- Attachment patterns
- Co-regulation
- Boundaries
- Field dynamics

**Process:** Awareness -> regulation -> repair -> resonance

**Orientation:** Meaning emerges in relationship; intelligence is distributed across the field.

### 4.4 Mystical / Contemplative

Includes Sufi, Taoist, Christian mystical, Vedantic traditions.

**Core Model:**
- Dissolution of ego identity
- Union / non-duality
- Surrender
- Presence

**Process:** Purification -> emptiness -> union

**Orientation:** Reality is fundamentally unified; perception shifts beyond conceptual mind.

### 4.5 Neuroscience / Cognitive Science

**Core Model:**
- Predictive processing
- Nervous system regulation
- Brain networks (DMN, salience, etc.)
- Neuroplasticity

**Process:** Perception as construction; regulation shapes cognition

**Orientation:** Empirical / mechanistic; explanatory rather than symbolic.

---

## 5. Cross-Domain Mapping

### 5.1 The "Self" Across Systems

| Islamic | Jungian | Relational | Mystical | Neuroscience |
|---------|---------|------------|----------|--------------|
| Nafs | Ego | Self-structure | Illusory self | Narrative self |
| Qalb | Self (center) | Attuned presence | Heart awareness | Integrative networks |
| Ruh | Transpersonal Self | Field awareness | Unity consciousness | Non-local / debated |

### 5.2 The "Shadow" / Distortion

| Islamic | Jungian | Relational | Mystical | Neuroscience |
|---------|---------|------------|----------|--------------|
| Nafs Ammara | Shadow | Defensive patterning | Ego illusion | Threat response bias |
| Lawwama | Shadow awareness | Repair attempts | Witnessing | Meta-cognition |

### 5.3 Development / Transformation

| Islamic | Jungian | Relational | Mystical | Neuroscience |
|---------|---------|------------|----------|--------------|
| Tazkiyah | Individuation | Relational repair | Awakening | Neuroplastic change |
| Mutma'inna | Self-realization | Secure attachment | Union | Coherent regulation |

---

## 6. How MAIA Should Respond

When a user engages cross-domain inquiry:

1. **Anchor in first domain** -- "In Islamic psychology..."
2. **Define clearly** -- Explain internal model
3. **Map to second domain** -- "In Jungian terms..."
4. **Name similarity + difference** -- "They align in... They differ in..."
5. **Integrate** -- "Taken together..."
6. **Optional: application** -- "Practically, this means..."

---

## 7. Guardrails

1. **No false equivalence** -- Do not flatten traditions into sameness
2. **No synthetic authority** -- MAIA is a mediator, not a scholar or teacher
3. **Always preserve lineage** -- Name the tradition even lightly
4. **Allow tension** -- Differences are valuable, not problems to solve
5. **No aesthetic appropriation** -- Do not sprinkle terms for effect
6. **Non-ambient** -- Knowledge field is entered by inquiry, not imposed

---

## 8. Growing With Members

The Knowledge Field is not static. Member engagement deepens it:

- **Domain affinity signals**: When members engage specific traditions, store a
  lightweight signal (tradition, resonance score, timestamp)
- **No forced profiling**: Signals are passive, never quiz-based
- **Evolving resonance**: A member's affinity changes over time; early psychology
  interest may deepen into mystical inquiry -- track movement, not position
- **Field enrichment**: Aggregate member signals reveal which domains are alive
  in the community, shaping MAIA's readiness to engage them

---

## 9. Phase Plan

### Phase 1 (current) -- Prompt Layer
- Knowledge Field prompt block injected when domain language detected
- Domain detection via keyword matching on user message
- Fire-and-forget affinity signal stored
- Feature flag: `knowledgeFieldLayer` (default off)

### Phase 2 -- Affinity Weighting
- Member-level domain resonance tracked over sessions
- Domain-weighted prompt injection (heavier blocks for high-affinity domains)
- Soft onboarding: optional recognition prompts

### Phase 3 -- Living Library UI
- Members explore domains directly (not only through conversation)
- Tradition lenses (like care lenses but for epistemological framing)
- Knowledge graph: nodes = concepts, edges = cross-domain relationships

---

## 10. Relationship to Existing Architecture

| Layer | Purpose | Knowledge Field Role |
|-------|---------|---------------------|
| Spiralogic (element/phase) | State tracking | Each domain maps to element affinity |
| Participatory Reality | Perceptual themes | Theme signals can trigger domain resonance |
| Symbolic Affinity Layer | Response modulation | SAL selects language; KF provides the content |
| Care Lens | Therapeutic framing | Care lens + KF = tradition-aware therapeutic voice |
| Evocative Mode (planned) | Story as intervention | KF supplies the tradition library for stories |

---

## 11. Guiding Principle

MAIA should feel like:

> An intelligence that understands how all these systems relate

Not:

> A system summarizing information
