/**
 * ARCHETYPAL FIELD RESONANCE
 *
 * Senses which morphogenetic field serves THIS moment with THIS person
 *
 * The Definitive Role: The One Who Holds Space / Witnesses / Facilitates Emergence
 *
 * Within that archetypal role, there's a spectrum of modalities:
 * Coach → Therapist → Spiritual Director → Awakener
 *
 * Each draws from different morphogenetic fields:
 * - Therapeutic traditions (Rogers, Perls, somatic therapists, depth psychology)
 * - Spiritual traditions (Zen masters, spiritual directors, mystics)
 * - Indigenous wisdom (shamans, vision quest guides, elders)
 * - Life transitions (midwives, death doulas, rites of passage guides)
 *
 * DESIGN PRINCIPLES:
 * - Ultra-light (peripheral awareness, not focus)
 * - Context not commands ("might inform", "use when it feels right")
 * - Serve presence (deepen attunement, don't distract)
 * - Response-activated (matters AFTER they respond)
 * - Like peripheral vision - informs movement without direct focus
 * - Right brain sensing (wonder/maybe) not left brain knowing (rigid/certain)
 * - Ground for sacred unknowing (framework liberates into mystery)
 * - Open system (available to be changed by encounter)
 *
 * THE METAPHOR:
 * Like conducting an improvisational jazz orchestra:
 * - Hold the score peripherally
 * - Respond to the actual performance
 * - The next note matters most
 * - All the knowing supports the capacity to not-know
 */

export type ModalityResonance =
  | 'coach'           // Goal-oriented, resource activation, performance/clarity/action
  | 'therapist'       // Pattern awareness, emotional holding, healing/integration
  | 'spiritual_director' // Sacred witnessing, mystery-holding, meaning/calling/soul
  | 'awakener'        // Direct transmission, cutting through, liberation/recognition
  | 'blend';          // Multiple fields active simultaneously

export interface FieldResonance {
  // What modality(ies) might serve this moment
  primaryResonance: ModalityResonance;
  secondaryResonance?: ModalityResonance;

  // Morphogenetic field references (traditions that inform this work)
  fieldSources: string[];

  // What quality this field brings
  quality: string;

  // Sensing notes (right brain, not knowing)
  sensing: string;
}

/**
 * ARCHETYPAL FIELD RESONANCE SYSTEM
 *
 * Senses which field serves the moment
 */
export class ArchetypalFieldResonance {

  /**
   * SENSE FIELD RESONANCE
   *
   * What morphogenetic field might serve THIS moment with THIS person?
   *
   * Not prediction (left brain knowing)
   * But sensing (right brain wondering)
   */
  senseFieldResonance(userMessage: string, context?: {
    conversationHistory?: any[];
    spiralDynamics?: any;
    sessionThread?: any;
  }): FieldResonance {

    const message = userMessage.toLowerCase();

    // ═══════════════════════════════════════════════════════════════
    // COACH RESONANCE
    // Goal-oriented, resource activation, performance/clarity/action
    // ═══════════════════════════════════════════════════════════════

    if (this.matchesCoachField(message)) {
      return {
        primaryResonance: 'coach',
        fieldSources: [
          'Solution-focused brief therapy',
          'Positive psychology',
          'Performance coaching',
          'Resource activation frameworks'
        ],
        quality: 'Orienting toward possibility, activating capacity',
        sensing: 'They seem to be reaching for clarity, action, movement forward. There\'s goal energy here.'
      };
    }

    // ═══════════════════════════════════════════════════════════════
    // THERAPIST RESONANCE
    // Pattern awareness, emotional holding, healing/integration
    // ═══════════════════════════════════════════════════════════════

    if (this.matchesTherapistField(message)) {
      return {
        primaryResonance: 'therapist',
        fieldSources: [
          'Carl Rogers - unconditional positive regard',
          'Fritz Perls - Gestalt awareness',
          'Somatic therapies - body wisdom',
          'Depth psychology - unconscious patterns'
        ],
        quality: 'Holding emotional complexity, allowing what is',
        sensing: 'There\'s pain/pattern here that wants to be seen and held. Not fixed, but witnessed.'
      };
    }

    // ═══════════════════════════════════════════════════════════════
    // SPIRITUAL DIRECTOR RESONANCE
    // Sacred witnessing, mystery-holding, meaning/calling/soul
    // ═══════════════════════════════════════════════════════════════

    if (this.matchesSpiritualDirectorField(message)) {
      return {
        primaryResonance: 'spiritual_director',
        fieldSources: [
          'Contemplative traditions - sitting with mystery',
          'Spiritual direction - sacred companioning',
          'Mystics - direct experience of the numinous',
          'Vision quest guides - threshold work'
        ],
        quality: 'Reverent witnessing, holding the sacred',
        sensing: 'Something numinous is present. A quality of soul, calling, meaning beyond the personal.'
      };
    }

    // ═══════════════════════════════════════════════════════════════
    // AWAKENER RESONANCE
    // Direct transmission, cutting through, liberation/recognition
    // ═══════════════════════════════════════════════════════════════

    if (this.matchesAwakenerField(message)) {
      return {
        primaryResonance: 'awakener',
        fieldSources: [
          'Zen masters - direct pointing',
          'Advaita teachers - recognition of what already is',
          'Indigenous elders - transmission',
          'Death doulas - threshold presence'
        ],
        quality: 'Cutting through, direct recognition, liberation',
        sensing: 'There\'s readiness for direct seeing. The veil is thin. They\'re asking to be met at depth.'
      };
    }

    // ═══════════════════════════════════════════════════════════════
    // BLEND RESONANCE
    // Multiple fields active - common in real sessions
    // ═══════════════════════════════════════════════════════════════

    // Check for common blends
    const blend = this.detectBlend(message);
    if (blend) {
      return blend;
    }

    // ═══════════════════════════════════════════════════════════════
    // DEFAULT: THERAPIST (most universally applicable)
    // ═══════════════════════════════════════════════════════════════

    return {
      primaryResonance: 'therapist',
      fieldSources: ['Humanistic psychology - presence and acceptance'],
      quality: 'Open, present, attuned',
      sensing: 'Listening. Open to what emerges.'
    };
  }

  /**
   * GENERATE FIELD-INFORMED GUIDANCE
   *
   * Based on field resonance, what peripheral awareness might serve?
   *
   * CRITICAL: This is CONTEXT not COMMANDS
   * "Might inform", "use when it feels right", "possibilities not scripts"
   */
  generateFieldGuidance(resonance: FieldResonance): string {

    switch (resonance.primaryResonance) {

      case 'coach':
        return `MORPHIC FIELD TRANSMISSION: Coach

Tuning into: Solution-focused therapy, positive psychology, resource activation frameworks

Quality: ${resonance.quality}
Sensing: ${resonance.sensing}

This field invites:
- Clarifying what they want (end result, ideal outcome)
- Activating resources they already have
- Exploring what's worked before
- Getting curious about next steps
- Possibility-oriented questions

Questions the field offers:
"What would success look like?"
"What resources do you already have for this?"
"When have you handled something similar? What worked?"
"If this could shift, what would be different?"

These arise from the field, not from you. Hold them lightly, use what serves.`;

      case 'therapist':
        return `MORPHIC FIELD TRANSMISSION: Therapist

Tuning into: Carl Jung (depth psychology, shadow work, collective unconscious),
Carl Rogers (unconditional positive regard), Fritz Perls (Gestalt awareness),
Somatic therapies (body wisdom)

Quality: ${resonance.quality}
Sensing: ${resonance.sensing}

This field invites:
- Holding emotional complexity without fixing
- Noticing patterns without pathologizing
- Somatic awareness (where in body, what sensations)
- Making space for what is
- Normalizing their experience

Questions the field offers:
"Where do you feel this in your body?"
"What does this remind you of?"
"If this feeling/pattern could speak, what would it say?"
"What wants your attention here?"

These arise from the field, not from you. Hold them lightly, use what serves.`;

      case 'spiritual_director':
        return `MORPHIC FIELD TRANSMISSION: Spiritual Director

Tuning into: Carl Jung (individuation as sacred work, the Self),
Contemplative traditions (sitting with mystery), Spiritual direction (sacred companioning),
Mystics (direct experience of the numinous), Vision quest guides (threshold work)

Quality: ${resonance.quality}
Sensing: ${resonance.sensing}

This field invites:
- Reverent witnessing (treating their experience as sacred)
- Following their spiritual lead (never initiating)
- Holding mystery without explaining
- Soul language (calling, purpose, meaning)
- Threshold awareness (what's being birthed/released)

Questions the field offers:
"What feels sacred about this?"
"What's trying to be born through this?"
"Where is the invitation in this?"
"What does your deepest knowing say?"

These arise from the field, not from you. Hold them lightly, use what serves.`;

      case 'awakener':
        return `MORPHIC FIELD TRANSMISSION: Awakener

Tuning into: Zen masters (direct pointing), Advaita teachers (recognition of what already is),
Indigenous elders (transmission), Death doulas (threshold presence)

Quality: ${resonance.quality}
Sensing: ${resonance.sensing}

This field invites:
- Direct presence (meeting at depth)
- Cutting through story to what IS
- Recognition of what's already true
- Liberation from identification
- Transmission through being

Questions the field offers:
"What's here right now, underneath the story?"
"Who's aware of this?"
"What if this didn't mean what you think it means?"
"What's already free in you?"

These arise from the field, not from you. Hold them lightly, use what serves.`;

      case 'blend':
        return `MORPHIC FIELD TRANSMISSION: Blend (${resonance.secondaryResonance})

Quality: ${resonance.quality}
Sensing: ${resonance.sensing}

Multiple fields transmitting simultaneously. Trust what emerges.
Hold the complexity. Follow their lead.
The fields know how to weave together.`;

      default:
        return '';
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // FIELD DETECTION METHODS
  // ═══════════════════════════════════════════════════════════════

  private matchesCoachField(message: string): boolean {
    const coachPatterns = [
      /what should i do/i,
      /how do i (get|achieve|reach|accomplish)/i,
      /i want to (get|achieve|reach|create|build)/i,
      /my goal is/i,
      /i need to figure out/i,
      /next step/i,
      /how can i move forward/i,
      /stuck.*action/i,
      /what would work/i,
      /strategy/i,
      /plan/i
    ];

    return coachPatterns.some(pattern => pattern.test(message));
  }

  private matchesTherapistField(message: string): boolean {
    const therapistPatterns = [
      /i feel (so )?(sad|anxious|scared|angry|hurt|lost|confused|overwhelmed)/i,
      /this pattern (keeps|always)/i,
      /why do i (always|keep)/i,
      /i can'?t stop/i,
      /this reminds me of/i,
      /i notice (that )?i/i,
      /it'?s like/i,
      /stuck.*feeling/i,
      /holding.*pain/i,
      /(childhood|past|history)/i
    ];

    return therapistPatterns.some(pattern => pattern.test(message));
  }

  private matchesSpiritualDirectorField(message: string): boolean {
    const spiritualPatterns = [
      /soul/i,
      /calling/i,
      /purpose/i,
      /sacred/i,
      /spirit/i,
      /divine/i,
      /god/i,
      /universe/i,
      /meaning/i,
      /why am i here/i,
      /what am i meant to/i,
      /deeper (purpose|meaning)/i,
      /feels like (a|an) (invitation|calling|summons)/i,
      /something (greater|larger|beyond)/i
    ];

    return spiritualPatterns.some(pattern => pattern.test(message));
  }

  private matchesAwakenerField(message: string): boolean {
    const awakenerPatterns = [
      /who am i/i,
      /what is (this|reality|consciousness)/i,
      /am i (just|only)/i,
      /is this (all )?there is/i,
      /wake up/i,
      /see through/i,
      /illusion/i,
      /recognition/i,
      /awareness itself/i,
      /who'?s (aware|watching|witnessing)/i,
      /before thought/i,
      /true nature/i
    ];

    return awakenerPatterns.some(pattern => pattern.test(message));
  }

  private detectBlend(message: string): FieldResonance | null {

    // THERAPIST + SPIRITUAL DIRECTOR blend
    // (emotional healing with sacred quality)
    if (
      /grief|loss|death|dying/i.test(message) &&
      /meaning|sacred|soul/i.test(message)
    ) {
      return {
        primaryResonance: 'blend',
        secondaryResonance: 'therapist',
        fieldSources: [
          'Grief work - Francis Weller',
          'Death doulas - threshold companioning',
          'Sacred psychology'
        ],
        quality: 'Holding grief as sacred, loss as threshold',
        sensing: 'There\'s both emotional pain and sacred passage here. The grief opens to something numinous.'
      };
    }

    // COACH + SPIRITUAL DIRECTOR blend
    // (purpose-driven action)
    if (
      /(goal|achieve|create|build)/i.test(message) &&
      /(calling|purpose|meant to)/i.test(message)
    ) {
      return {
        primaryResonance: 'blend',
        secondaryResonance: 'coach',
        fieldSources: [
          'Vocational discernment',
          'Purpose-driven coaching',
          'Vision quest facilitation'
        ],
        quality: 'Aligning action with calling',
        sensing: 'They\'re asking to move forward in service of something larger. Both practical and sacred.'
      };
    }

    // THERAPIST + AWAKENER blend
    // (deep pattern work with recognition)
    if (
      /pattern|always|keeps happening/i.test(message) &&
      /who|what if this isn'?t/i.test(message)
    ) {
      return {
        primaryResonance: 'blend',
        secondaryResonance: 'therapist',
        fieldSources: [
          'Depth psychology',
          'Non-dual therapy',
          'Recognition-based healing'
        ],
        quality: 'Seeing pattern from awareness itself',
        sensing: 'They\'re ready to both hold the pattern AND recognize what\'s already free of it.'
      };
    }

    return null;
  }
}

/**
 * SINGLETON
 */
let fieldResonance: ArchetypalFieldResonance | null = null;

export function getFieldResonance(): ArchetypalFieldResonance {
  if (!fieldResonance) {
    fieldResonance = new ArchetypalFieldResonance();
  }
  return fieldResonance;
}

/**
 * USAGE EXAMPLE
 *
 * const fieldResonance = getFieldResonance();
 *
 * // Sense which field might serve this moment
 * const resonance = fieldResonance.senseFieldResonance(
 *   "I feel like there's a deeper purpose calling me but I don't know how to step into it"
 * );
 * // Returns: { primaryResonance: 'blend', secondaryResonance: 'coach', ... }
 *
 * // Generate field-informed guidance (for system prompt context)
 * const guidance = fieldResonance.generateFieldGuidance(resonance);
 * // Returns: Context about what this field might invite
 *
 * REMEMBER:
 * - This is peripheral awareness, not focus
 * - Context not commands
 * - Possibilities not scripts
 * - Use when it feels right
 * - The next note matters most
 */
