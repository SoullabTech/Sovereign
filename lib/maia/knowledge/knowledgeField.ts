/**
 * MAIA Knowledge Field — 12-Domain Consciousness Registry
 *
 * A structured, living knowledge system that MAIA can draw from to
 * contextualize inquiry across traditions of understanding.
 *
 * Canon: docs/canon/MAIA_KNOWLEDGE_FIELD_v1.0.md
 *        docs/canon/MAIA_KNOWLEDGE_FIELD_12_DOMAIN_MAP.md
 *
 * Design principles:
 *   1. Situated knowledge — always anchor ideas in a tradition
 *   2. Relational mapping — show how systems connect
 *   3. Preserve difference — do not collapse into sameness
 *   4. Integration over accumulation — synthesis, not density
 *   5. Grows with members — member inquiry deepens the field
 */

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export type KnowledgeDomainId =
  | 'islamic_psychology'
  | 'jungian_psychology'
  | 'relational_intelligence'
  | 'mystical_contemplative'
  | 'neuroscience_cognitive'
  | 'spiralogic'
  | 'somatics'
  | 'attachment_trauma'
  | 'systems_theory'
  | 'philosophy_of_mind'
  | 'ritual_symbolic'
  | 'ethics_discernment';

export type KnowledgeConcept = {
  id: string;
  label: string;
  description: string;
  aliases?: string[];
  /**
   * Surfacing flag for retrieval / activation paths.
   *
   * Default `true` (queryable) if omitted.
   *
   * When `false`, the concept is registered for canonical naming only and MUST
   * NOT surface through retrieval, keyword expansion, prompt injection, or any
   * activation path until a tradition-specific gate / containment system
   * exists (cf. the astrologer gate). Any retrieval/activation code added
   * later MUST filter out concepts with `queryable: false`.
   */
  queryable?: boolean;
};

export type KnowledgeMapping = {
  conceptId: string;
  relatesTo: Array<{
    domain: KnowledgeDomainId;
    conceptId: string;
    relationship:
      | 'rough_equivalent'
      | 'partial_overlap'
      | 'contrast'
      | 'developmental_parallel'
      | 'functional_parallel'
      | 'supports'
      | 'differs';
    note: string;
  }>;
};

export type KnowledgeDomain = {
  id: KnowledgeDomainId;
  label: string;
  summary: string;
  orientation: string;
  keywords: string[];
  concepts: KnowledgeConcept[];
  mappings: KnowledgeMapping[];
};

// ═══════════════════════════════════════════════════════════════
// Registry
// ═══════════════════════════════════════════════════════════════

export const KNOWLEDGE_FIELD: Record<KnowledgeDomainId, KnowledgeDomain> = {
  islamic_psychology: {
    id: 'islamic_psychology',
    label: 'Islamic Psychology',
    summary: 'A moral, spiritual, and psychological model of the human being grounded in nafs, qalb, ruh, and aql.',
    orientation: 'Refinement of the self through remembrance, discernment, purification, and alignment with divine order.',
    keywords: [
      'islamic psychology', 'sufi psychology', 'nafs', 'qalb', 'ruh', 'aql',
      'tazkiyah', 'ihsan', 'sufi', 'al-ghazali', 'ghazali', 'ibn arabi',
      'rumi', 'mesnevi', 'mesnevihan', 'adab', 'suhba', 'tawba',
      'purification of the soul', 'purification of the heart',
    ],
    concepts: [
      {
        id: 'nafs',
        label: 'Nafs',
        description: 'The self in its appetitive, reactive, and developmental dimensions.',
        aliases: ['ego-self', 'lower self'],
      },
      {
        id: 'qalb',
        label: 'Qalb',
        description: 'The heart as the subtle center of perception, receptivity, and turning.',
        aliases: ['heart'],
      },
      {
        id: 'ruh',
        label: 'Ruh',
        description: 'Spirit; the divine-origin principle of life and higher orientation.',
        aliases: ['spirit'],
      },
      {
        id: 'aql',
        label: 'Aql',
        description: 'Discernment or intellect in its deeper sense, oriented toward wisdom and right understanding.',
        aliases: ['intellect', 'discernment'],
      },
      {
        id: 'tazkiyah',
        label: 'Tazkiyah',
        description: 'Purification and refinement of the self through practice and remembrance.',
        aliases: ['purification'],
      },
    ],
    mappings: [
      {
        conceptId: 'nafs',
        relatesTo: [
          {
            domain: 'jungian_psychology',
            conceptId: 'ego',
            relationship: 'partial_overlap',
            note: 'Both name the ordinary center of identification, but nafs carries a more explicit moral-developmental dimension.',
          },
          {
            domain: 'jungian_psychology',
            conceptId: 'shadow',
            relationship: 'partial_overlap',
            note: 'The more compulsive and unintegrated aspects of nafs overlap with shadow material.',
          },
          {
            domain: 'neuroscience_cognitive',
            conceptId: 'narrative_self',
            relationship: 'functional_parallel',
            note: 'Both involve identity organization and self-referential patterning.',
          },
        ],
      },
      {
        conceptId: 'qalb',
        relatesTo: [
          {
            domain: 'jungian_psychology',
            conceptId: 'self',
            relationship: 'partial_overlap',
            note: 'Both can function as a deeper organizing center, though qalb remains a specifically spiritual-perceptual organ.',
          },
          {
            domain: 'relational_intelligence',
            conceptId: 'attuned_presence',
            relationship: 'functional_parallel',
            note: 'Both describe a refined, receptive, responsive mode of presence.',
          },
          {
            domain: 'spiralogic',
            conceptId: 'aether_center',
            relationship: 'developmental_parallel',
            note: 'Both represent a central integrative field rather than a reactive surface identity.',
          },
        ],
      },
      {
        conceptId: 'tazkiyah',
        relatesTo: [
          {
            domain: 'jungian_psychology',
            conceptId: 'individuation',
            relationship: 'developmental_parallel',
            note: 'Both describe refinement toward wholeness, though one is spiritually and morally framed while the other is archetypal and psychological.',
          },
          {
            domain: 'attachment_trauma',
            conceptId: 'earned_security',
            relationship: 'supports',
            note: 'Purification and refinement can support increased regulation and relational maturity.',
          },
        ],
      },
    ],
  },

  jungian_psychology: {
    id: 'jungian_psychology',
    label: 'Jungian / Depth Psychology',
    summary: 'A symbolic, archetypal, and developmental psychology centered on ego, shadow, and the Self.',
    orientation: 'Wholeness emerges through relationship with unconscious material and the integration of opposites.',
    keywords: [
      'jung', 'jungian', 'depth psychology', 'shadow', 'persona', 'self',
      'individuation', 'archetype', 'archetypal', 'collective unconscious',
      'anima', 'animus', 'active imagination', 'synchronicity',
      'analytical psychology', 'shadow work',
    ],
    concepts: [
      { id: 'ego', label: 'Ego', description: 'The ordinary conscious center of identity and orientation.' },
      { id: 'shadow', label: 'Shadow', description: 'Disowned, unconscious, or underdeveloped material outside conscious self-image.' },
      { id: 'persona', label: 'Persona', description: 'The social mask or adaptive presentation of self.' },
      { id: 'self', label: 'Self', description: 'The deeper organizing totality of the psyche beyond the ego.' },
      { id: 'individuation', label: 'Individuation', description: 'The process of becoming more whole through integration of unconscious material.' },
    ],
    mappings: [
      {
        conceptId: 'shadow',
        relatesTo: [
          { domain: 'islamic_psychology', conceptId: 'nafs', relationship: 'partial_overlap', note: 'Compulsive and unrefined dimensions of nafs often resemble shadow material.' },
          { domain: 'attachment_trauma', conceptId: 'protective_strategy', relationship: 'functional_parallel', note: 'What is shadowed psychologically often appears relationally as protective behavior.' },
          { domain: 'ritual_symbolic', conceptId: 'underworld_descent', relationship: 'developmental_parallel', note: 'Both describe encounter with what has been denied, feared, or buried.' },
        ],
      },
      {
        conceptId: 'self',
        relatesTo: [
          { domain: 'islamic_psychology', conceptId: 'qalb', relationship: 'partial_overlap', note: 'Both can function as deeper centers of guidance, though they arise from distinct metaphysical frameworks.' },
          { domain: 'mystical_contemplative', conceptId: 'true_self', relationship: 'partial_overlap', note: 'Both point beyond the defensive ego, though mystical traditions may move further into non-duality.' },
        ],
      },
      {
        conceptId: 'individuation',
        relatesTo: [
          { domain: 'spiralogic', conceptId: 'elemental_integration', relationship: 'developmental_parallel', note: 'Both describe maturation through differentiated yet integrated development.' },
        ],
      },
    ],
  },

  relational_intelligence: {
    id: 'relational_intelligence',
    label: 'Relational Intelligence',
    summary: 'An account of human intelligence as emergent in relationship, attunement, boundaries, repair, and shared fields.',
    orientation: 'Meaning and development arise through patterns of contact, rupture, repair, and co-regulation.',
    keywords: [
      'relational intelligence', 'attunement', 'repair', 'co-regulation',
      'boundaries', 'field', 'resonance', 'relational', 'attachment theory',
      'relational field', 'field dynamics', 'rupture and repair',
      'self-in-relation', 'intersubjective', 'winnicott', 'bowlby',
    ],
    concepts: [
      { id: 'attuned_presence', label: 'Attuned Presence', description: 'Responsive presence capable of sensing, adapting, and remaining in contact without collapse or intrusion.' },
      { id: 'co_regulation', label: 'Co-regulation', description: 'The mutual shaping of nervous system states through safe, responsive connection.' },
      { id: 'boundary', label: 'Boundary', description: 'The living edge that allows contact without fusion or violation.' },
      { id: 'rupture_repair', label: 'Rupture and Repair', description: 'The developmental cycle by which disconnection can become a site of deeper trust and integration.' },
      { id: 'field_intelligence', label: 'Field Intelligence', description: 'The idea that insight and pattern emerge across the relationship, not only within one person.' },
    ],
    mappings: [
      {
        conceptId: 'co_regulation',
        relatesTo: [
          { domain: 'neuroscience_cognitive', conceptId: 'autonomic_regulation', relationship: 'supports', note: 'Relational safety influences regulation, perception, and cognitive flexibility.' },
          { domain: 'attachment_trauma', conceptId: 'secure_attachment', relationship: 'developmental_parallel', note: 'Secure attachment is one of the primary developmental homes of co-regulation.' },
        ],
      },
      {
        conceptId: 'field_intelligence',
        relatesTo: [
          { domain: 'spiralogic', conceptId: 'collective_field', relationship: 'rough_equivalent', note: 'Both treat intelligence as distributed across a living field rather than contained in isolated individuals.' },
          { domain: 'systems_theory', conceptId: 'emergence', relationship: 'supports', note: 'Both emphasize patterns arising from interaction rather than linear causality.' },
        ],
      },
    ],
  },

  mystical_contemplative: {
    id: 'mystical_contemplative',
    label: 'Mystical / Contemplative Traditions',
    summary: 'A family of traditions oriented toward purification, surrender, direct presence, and union or non-dual realization.',
    orientation: 'The deepest knowing is participatory, transformative, and often exceeds conceptual thought.',
    keywords: [
      'mysticism', 'contemplative', 'sufi', 'tao', 'vedanta',
      'christian mysticism', 'presence', 'union', 'nonduality', 'non-duality',
      'dark night of the soul', 'via negativa', 'apophatic', 'meister eckhart',
      'teresa of avila', 'john of the cross', 'advaita', 'zen', 'fana',
      'kenosis', 'centering prayer', 'hesychasm', 'wu wei',
    ],
    concepts: [
      { id: 'ego_dissolution', label: 'Ego Dissolution', description: 'A loosening of rigid ego identification, sometimes temporary and sometimes developmental.' },
      { id: 'presence', label: 'Presence', description: 'Direct, receptive awareness not wholly mediated by conceptual control.' },
      { id: 'union', label: 'Union', description: 'A sense of communion, non-separation, or intimate participation in a greater reality.' },
      { id: 'true_self', label: 'True Self', description: 'A deeper identity beyond defensive structures and surface conditioning.' },
      { id: 'surrender', label: 'Surrender', description: 'A release of compulsive control into trust, receptivity, or deeper alignment.' },
      // ── Tradition-specific concepts (added 2026-04-26).
      // Registered in their own field only; no cross-tradition mappings here.
      // The Symbolic Field Containment canon forbids flattening these terms
      // into one another.
      //
      // ALL marked `queryable: false` — they are NOT surfaceable until
      // tradition-specific gate / containment systems exist (cf. the
      // astrologer gate). Retrieval, keyword matching, prompt injection, and
      // activation paths MUST filter these out. Premature availability is
      // the failure mode this flag guards against.
      { id: 'wu_wei', label: 'Wu Wei (無爲)', description: 'Daoist principle of non-coerced action — acting in accord with the grain of what is moving, without the internal violence of imposed will. Distinct from passivity, surrender, kenosis, or fana.', queryable: false },
      { id: 'five_precepts', label: 'Five Precepts (五戒)', description: 'Five Daoist moral commitments transmitted in the Ultra Supreme Elder Lord\'s Scripture of Precepts: no killing, no stealing, no sexual misconduct, no false speech, no jealousy (or no taking of intoxicants in some streams). Held in lineage; not a generic ethic.', queryable: false },
      { id: 'samaya', label: 'Samaya (Tantric Vow)', description: 'Vajrayāna vow-bond between practitioner and teacher, more strictly held than Prātimokṣa or Mahāyāna vows. Received in empowerment; cannot be transmitted through chat. Distinct from covenant, oath, or contract.', queryable: false },
      { id: 'bodhicitta', label: 'Bodhicitta', description: 'Mahāyāna and Vajrayāna orientation toward awakening for the benefit of all beings. Carries specific tradition-internal scaffolding (relative and ultimate bodhicitta); not equivalent to generic compassion or empathy.', queryable: false },
      { id: 'hermetic_principles', label: 'Seven Hermetic Principles', description: 'The seven principles (Mentalism, Correspondence, Vibration, Polarity, Rhythm, Cause and Effect, Gender) as articulated in The Kybalion (1908). A modern New Thought synthesis, not an ancient Hermetic source. To be cited as such.', queryable: false },
    ],
    mappings: [
      {
        conceptId: 'surrender',
        relatesTo: [
          { domain: 'islamic_psychology', conceptId: 'tazkiyah', relationship: 'supports', note: 'Surrender often accompanies refinement, softening, and moral-spiritual reorientation.' },
          { domain: 'relational_intelligence', conceptId: 'attuned_presence', relationship: 'functional_parallel', note: 'Both require reduced defensiveness and increased receptivity.' },
        ],
      },
      {
        conceptId: 'presence',
        relatesTo: [
          { domain: 'somatics', conceptId: 'embodied_awareness', relationship: 'rough_equivalent', note: 'Contemplative presence often becomes experientially available through embodied awareness.' },
        ],
      },
      // No mappings yet for wu_wei, five_precepts, samaya, bodhicitta,
      // hermetic_principles. Cross-tradition resonance, if it ever lands,
      // will be a separate, deliberate decision. Surface resemblance ≠ identity.
    ],
  },

  neuroscience_cognitive: {
    id: 'neuroscience_cognitive',
    label: 'Neuroscience / Cognitive Science',
    summary: 'Empirical and theoretical models of mind, brain, nervous system regulation, and perception.',
    orientation: 'Perception, meaning, and behavior are shaped by prediction, regulation, salience, and plasticity.',
    keywords: [
      'neuroscience', 'cognitive science', 'predictive processing',
      'nervous system', 'brain', 'dmn', 'plasticity', 'salience',
      'vagal', 'vagus nerve', 'polyvagal', 'amygdala', 'prefrontal',
      'interoception', 'neuroception', 'porges', 'damasio',
      'window of tolerance', 'neuroplasticity',
    ],
    concepts: [
      { id: 'predictive_processing', label: 'Predictive Processing', description: 'The brain as an inference engine that continually predicts and updates based on incoming signals.' },
      { id: 'autonomic_regulation', label: 'Autonomic Regulation', description: 'The regulation of physiological arousal, threat, safety, and recovery states.' },
      { id: 'narrative_self', label: 'Narrative Self', description: 'The constructed sense of identity assembled through memory, interpretation, and self-reference.' },
      { id: 'salience_network', label: 'Salience Network', description: 'A network involved in detecting relevance and switching between internal and external attention.' },
      { id: 'neuroplasticity', label: 'Neuroplasticity', description: 'The capacity of the nervous system to change through repetition, experience, and learning.' },
    ],
    mappings: [
      {
        conceptId: 'predictive_processing',
        relatesTo: [
          { domain: 'attachment_trauma', conceptId: 'protective_strategy', relationship: 'supports', note: 'Protective strategies can be understood as prediction patterns shaped by prior threat and adaptation.' },
          { domain: 'jungian_psychology', conceptId: 'persona', relationship: 'functional_parallel', note: 'Some social identity patterns can be viewed as predictive adaptations to expected environments.' },
        ],
      },
      {
        conceptId: 'neuroplasticity',
        relatesTo: [
          { domain: 'spiralogic', conceptId: 'developmental_transformation', relationship: 'supports', note: 'Plasticity gives a mechanistic account of how repeated inner and outer practice changes patterns.' },
          { domain: 'somatics', conceptId: 'pattern_repatterning', relationship: 'supports', note: 'Embodied practices can leverage plasticity to shift entrenched states.' },
        ],
      },
    ],
  },

  spiralogic: {
    id: 'spiralogic',
    label: 'Spiralogic',
    summary: 'An elemental and developmental architecture of human process, transformation, coherence, and becoming.',
    orientation: 'Human development moves through differentiated yet interrelated elemental intelligences and phases of transformation.',
    keywords: [
      'spiralogic', 'elements', 'fire', 'water', 'earth', 'air', 'aether',
      'facets', 'alchemy', 'elemental', 'spiral',
    ],
    concepts: [
      { id: 'elemental_integration', label: 'Elemental Integration', description: 'Balanced maturation across elemental intelligences rather than one-sided development.' },
      { id: 'aether_center', label: 'Aether Center', description: 'The central integrative field or organizing axis of the whole.' },
      { id: 'developmental_transformation', label: 'Developmental Transformation', description: 'Movement through phases of becoming, refinement, and conscious participation.' },
      { id: 'collective_field', label: 'Collective Field', description: 'A shared field of intelligence and meaning emerging across individuals and contexts.' },
      { id: 'facet_process', label: 'Facet Process', description: 'A differentiated map of nuanced states and movements within elemental development.' },
    ],
    mappings: [
      {
        conceptId: 'elemental_integration',
        relatesTo: [
          { domain: 'jungian_psychology', conceptId: 'individuation', relationship: 'developmental_parallel', note: 'Both involve wholeness through integration rather than reduction.' },
          { domain: 'somatics', conceptId: 'embodied_awareness', relationship: 'supports', note: 'Elemental development requires lived bodily participation, not only conceptual understanding.' },
        ],
      },
      {
        conceptId: 'collective_field',
        relatesTo: [
          { domain: 'relational_intelligence', conceptId: 'field_intelligence', relationship: 'rough_equivalent', note: 'Both understand intelligence as distributed, emergent, and relational.' },
          { domain: 'systems_theory', conceptId: 'emergence', relationship: 'supports', note: 'Collective field effects can be understood through emergence and non-linear interaction.' },
        ],
      },
    ],
  },

  somatics: {
    id: 'somatics',
    label: 'Somatics',
    summary: 'Embodied approaches to awareness, regulation, sensation, movement, and lived participation.',
    orientation: 'The body is not merely a container but a primary site of knowing, patterning, and transformation.',
    keywords: [
      'somatics', 'embodiment', 'body', 'sensation', 'movement',
      'interoception', 'felt sense', 'somatic', 'embodied',
    ],
    concepts: [
      { id: 'embodied_awareness', label: 'Embodied Awareness', description: 'Direct awareness of bodily sensation, posture, breath, and inner experience.' },
      { id: 'felt_sense', label: 'Felt Sense', description: 'A whole-bodied, pre-conceptual sense of meaning or situation.' },
      { id: 'pattern_repatterning', label: 'Pattern Repatterning', description: 'Shifting entrenched bodily and nervous system habits through practice and experience.' },
      { id: 'interoception', label: 'Interoception', description: 'Awareness of internal bodily states and signals.' },
    ],
    mappings: [
      {
        conceptId: 'felt_sense',
        relatesTo: [
          { domain: 'mystical_contemplative', conceptId: 'presence', relationship: 'functional_parallel', note: 'Embodied sensing often becomes the ground of contemplative presence.' },
          { domain: 'relational_intelligence', conceptId: 'attuned_presence', relationship: 'supports', note: 'Better embodied awareness supports finer relational attunement.' },
        ],
      },
    ],
  },

  attachment_trauma: {
    id: 'attachment_trauma',
    label: 'Attachment / Trauma',
    summary: 'Developmental and trauma-informed models of patterning, protection, regulation, and earned repair.',
    orientation: 'Patterns of safety, threat, and connection shape identity, perception, and relational possibility.',
    keywords: [
      'attachment', 'trauma', 'protection', 'nervous system', 'repair',
      'earned security', 'wounding', 'secure attachment', 'anxious attachment',
      'avoidant', 'disorganized', 'complex trauma',
    ],
    concepts: [
      { id: 'secure_attachment', label: 'Secure Attachment', description: 'A pattern of trust, flexibility, and relational stability built through reliable connection.' },
      { id: 'protective_strategy', label: 'Protective Strategy', description: 'Adaptive relational or nervous system behaviors shaped by prior threat or instability.' },
      { id: 'earned_security', label: 'Earned Security', description: 'A more secure and coherent relational organization developed over time through repair and practice.' },
      { id: 'trauma_activation', label: 'Trauma Activation', description: 'State shifts driven by unresolved threat patterns that compress perception and flexibility.' },
    ],
    mappings: [
      {
        conceptId: 'protective_strategy',
        relatesTo: [
          { domain: 'jungian_psychology', conceptId: 'shadow', relationship: 'partial_overlap', note: 'Some disowned material is also protective adaptation, not merely pathology.' },
          { domain: 'neuroscience_cognitive', conceptId: 'predictive_processing', relationship: 'supports', note: 'Protection can be understood as an anticipatory prediction shaped by lived history.' },
        ],
      },
    ],
  },

  systems_theory: {
    id: 'systems_theory',
    label: 'Systems Theory',
    summary: 'A non-linear view of pattern, emergence, feedback, and distributed causality.',
    orientation: 'What appears as isolated behavior is often better understood as participation within a larger system.',
    keywords: [
      'systems', 'systems theory', 'feedback', 'emergence', 'complexity',
      'pattern', 'nonlinear', 'complex systems', 'cybernetics',
    ],
    concepts: [
      { id: 'emergence', label: 'Emergence', description: 'Higher-order pattern arising from interaction among parts.' },
      { id: 'feedback_loop', label: 'Feedback Loop', description: 'Reciprocal influence that stabilizes or amplifies patterns over time.' },
      { id: 'nonlinearity', label: 'Nonlinearity', description: 'Disproportionate relationships between cause and effect within complex systems.' },
    ],
    mappings: [
      {
        conceptId: 'emergence',
        relatesTo: [
          { domain: 'relational_intelligence', conceptId: 'field_intelligence', relationship: 'supports', note: 'Field intelligence can be framed as emergent relational pattern.' },
          { domain: 'spiralogic', conceptId: 'collective_field', relationship: 'supports', note: 'Collective intelligence is not additive but emergent.' },
        ],
      },
    ],
  },

  philosophy_of_mind: {
    id: 'philosophy_of_mind',
    label: 'Philosophy of Mind',
    summary: 'Philosophical inquiry into consciousness, selfhood, perception, mind-body relations, and reality.',
    orientation: 'Clarifies conceptual distinctions and ontological assumptions beneath scientific and spiritual claims.',
    keywords: [
      'philosophy of mind', 'consciousness', 'self', 'mind-body', 'ontology',
      'idealism', 'dualism', 'panpsychism', 'phenomenology', 'qualia',
    ],
    concepts: [
      { id: 'consciousness', label: 'Consciousness', description: 'Awareness or sentience as subjectively lived presence and/or metaphysical problem.' },
      { id: 'selfhood', label: 'Selfhood', description: 'The nature and coherence of the self as subject, construct, or process.' },
      { id: 'ontology', label: 'Ontology', description: 'A framework for what fundamentally exists and how reality is constituted.' },
    ],
    mappings: [
      {
        conceptId: 'selfhood',
        relatesTo: [
          { domain: 'neuroscience_cognitive', conceptId: 'narrative_self', relationship: 'contrast', note: 'Philosophy of mind asks what the self is, while neuroscience often describes how self-models are generated.' },
          { domain: 'mystical_contemplative', conceptId: 'true_self', relationship: 'partial_overlap', note: 'Both raise questions about deeper identity beyond ordinary surface selfhood.' },
        ],
      },
    ],
  },

  ritual_symbolic: {
    id: 'ritual_symbolic',
    label: 'Ritual / Symbolic Traditions',
    summary: 'Symbolic, mythic, and ritual frameworks that shape transformation through enactment and imaginal participation.',
    orientation: 'Meaning is not only thought but embodied, enacted, and symbolically mediated.',
    keywords: [
      'ritual', 'symbol', 'myth', 'archetype', 'initiation', 'underworld',
      'alchemy', 'mythic', 'imaginal', 'ceremony',
    ],
    concepts: [
      { id: 'initiation', label: 'Initiation', description: 'A threshold process involving death of an old organization and emergence of a new one.' },
      { id: 'underworld_descent', label: 'Underworld Descent', description: 'A symbolic journey into obscurity, loss, shadow, or hidden truth.' },
      { id: 'symbolic_enactment', label: 'Symbolic Enactment', description: 'Transformation mediated by ritualized action, image, gesture, or form.' },
    ],
    mappings: [
      {
        conceptId: 'initiation',
        relatesTo: [
          { domain: 'spiralogic', conceptId: 'developmental_transformation', relationship: 'developmental_parallel', note: 'Both describe patterned transformation through thresholds and phases.' },
          { domain: 'jungian_psychology', conceptId: 'individuation', relationship: 'supports', note: 'Initiatory symbolism often accompanies individuation processes.' },
        ],
      },
    ],
  },

  ethics_discernment: {
    id: 'ethics_discernment',
    label: 'Ethics / Discernment',
    summary: 'Frameworks for wise judgment, alignment, responsibility, and right relation.',
    orientation: 'Insight without discernment can distort; integration requires moral and relational intelligence.',
    keywords: [
      'ethics', 'discernment', 'wisdom', 'judgment', 'alignment',
      'responsibility', 'moral', 'virtue', 'phronesis',
    ],
    concepts: [
      { id: 'discernment', label: 'Discernment', description: 'The capacity to distinguish what is true, fitting, timely, and aligned.' },
      { id: 'alignment', label: 'Alignment', description: 'Congruence between insight, value, action, and relation.' },
      { id: 'responsibility', label: 'Responsibility', description: 'Participation in consequences with awareness and integrity.' },
    ],
    mappings: [
      {
        conceptId: 'discernment',
        relatesTo: [
          { domain: 'islamic_psychology', conceptId: 'aql', relationship: 'rough_equivalent', note: 'Both point toward wise judgment, though framed within different metaphysical worlds.' },
          { domain: 'relational_intelligence', conceptId: 'boundary', relationship: 'supports', note: 'Discernment often becomes visible relationally through wise boundaries.' },
        ],
      },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════
// Query Functions
// ═══════════════════════════════════════════════════════════════

export function listKnowledgeDomains(): KnowledgeDomain[] {
  return Object.values(KNOWLEDGE_FIELD);
}

export function getKnowledgeDomain(domainId: KnowledgeDomainId): KnowledgeDomain | null {
  return KNOWLEDGE_FIELD[domainId] ?? null;
}

/**
 * Detect which knowledge domains are relevant to user input.
 * Case-insensitive keyword matching against domain keyword lists.
 */
export function detectKnowledgeDomains(input: string): KnowledgeDomainId[] {
  const text = input.toLowerCase();

  return Object.values(KNOWLEDGE_FIELD)
    .filter((domain) =>
      domain.keywords.some((keyword) => text.includes(keyword.toLowerCase()))
    )
    .map((domain) => domain.id);
}

/**
 * Find specific concept matches in user input (labels + aliases).
 * Useful for targeted cross-domain mapping in responses.
 */
export function getKnowledgeConceptMatches(input: string): Array<{
  domain: KnowledgeDomainId;
  conceptId: string;
  label: string;
}> {
  const text = input.toLowerCase();
  const matches: Array<{
    domain: KnowledgeDomainId;
    conceptId: string;
    label: string;
  }> = [];

  for (const domain of Object.values(KNOWLEDGE_FIELD)) {
    for (const concept of domain.concepts) {
      // Defensive guard — non-queryable concepts must not surface through any
      // retrieval / activation path until a tradition-specific gate exists.
      // See KnowledgeConcept.queryable docstring.
      if (concept.queryable === false) continue;

      const names = [concept.label, ...(concept.aliases ?? [])].map((v) => v.toLowerCase());

      if (names.some((name) => text.includes(name))) {
        matches.push({
          domain: domain.id,
          conceptId: concept.id,
          label: concept.label,
        });
      }
    }
  }

  return matches;
}
