---
level: architecture
---

# MAIA Knowledge Field
## 12-Domain Consciousness Map

This document defines the first full domain map for MAIA's growing "Library of Alexandria of Consciousness."

## Core Domains

1. **Islamic Psychology** -- Nafs, qalb, ruh, tazkiyah. Moral-spiritual refinement.
2. **Jungian / Depth Psychology** -- Ego, shadow, Self, individuation. Symbolic integration.
3. **Relational Intelligence** -- Attunement, co-regulation, field dynamics. Meaning in relationship.
4. **Mystical / Contemplative Traditions** -- Presence, union, surrender. Beyond conceptual mind.
5. **Neuroscience / Cognitive Science** -- Predictive processing, regulation, plasticity. Empirical lens.
6. **Spiralogic** -- Elemental intelligence, developmental transformation, collective field.
7. **Somatics** -- Embodied awareness, felt sense, pattern repatterning.
8. **Attachment / Trauma** -- Protective strategies, earned security, trauma activation.
9. **Systems Theory** -- Emergence, feedback loops, nonlinearity.
10. **Philosophy of Mind** -- Consciousness, selfhood, ontology.
11. **Ritual / Symbolic Traditions** -- Initiation, underworld descent, symbolic enactment.
12. **Ethics / Discernment** -- Wise judgment, alignment, responsibility.

## Purpose

The purpose of this field is not merely to store information. It is to help MAIA:

- Answer cross-domain questions with clarity
- Preserve lineage and distinctions
- Map relationships across traditions
- Support conscious integration rather than flattening

## Guiding Rules

- Always name traditions or domains when relevant
- Do not collapse distinct systems into false sameness
- Permit meaningful overlap, contrast, and developmental parallels
- Use this field in service of understanding, not synthetic authority
- Prefer clear integration over excessive information density

## Growing With Members

This field grows as members engage it. Domain affinity signals are captured when
members use tradition-specific language. Over time, the field reflects what is
alive in the community -- not just what was designed at launch.

## Implementation

- Registry: `lib/maia/knowledge/knowledgeField.ts`
- Prompt block: `lib/maia/prompts/knowledgeFieldBlock.ts`
- Wired into: `app/api/oracle/conversation/route.ts` (non-ambient, domain-detection gated)
- Feature flag: `knowledgeFieldLayer` in `lib/utils/feature-flags.ts`
- Tests: `lib/maia/knowledge/__tests__/knowledgeField.test.ts`
