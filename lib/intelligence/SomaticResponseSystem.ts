/**
 * SOMATIC RESPONSE SYSTEM
 *
 * Provides phase-appropriate response strategies for:
 * - Levine (Somatic Experiencing): Incomplete survival responses & arousal levels
 * - Gestalt (Contact Boundaries): Awareness interruptions & contact disturbances
 *
 * Similar to AlchemicalResponseSystem but focused on body-based intelligence.
 */

import type { SomaticState } from './SomaticExperiencingEngine';
import type { GestaltState } from './GestaltEngine';

export interface SomaticMoment {
  // Levine state
  somaticState?: SomaticState;

  // Gestalt state
  gestaltState?: GestaltState;

  // Awareness level (from AwarenessLevelDetector)
  awarenessLevel?: 'beginner' | 'familiar' | 'intermediate' | 'advanced' | 'master';
}

export interface SomaticResponseStrategy {
  // Core approach
  approach: string; // What to do (e.g., "titrate activation", "pendulate to resource")
  focus: string; // Where to direct attention
  avoid: string; // What NOT to do

  // Language guidance
  languageStyle: string; // How to speak (gentle, direct, technical)
  examplePhrases: string[]; // Sample language to use

  // Clinical protocols
  protocol: string; // Levine/Gestalt protocol name
  interventions: string[]; // Specific techniques
}

export class SomaticResponseSystem {

  /**
   * Get response strategy for a somatic moment
   */
  getResponseStrategy(moment: SomaticMoment): SomaticResponseStrategy {
    // Priority 1: Arousal level (most critical for safety)
    if (moment.somaticState && !moment.somaticState.arousal.windowOfTolerance) {
      return this.getArousalRegulationStrategy(moment);
    }

    // Priority 2: Incomplete survival responses (body-based trauma)
    if (moment.somaticState && moment.somaticState.incompleteResponse.detected) {
      return this.getIncompleteResponseStrategy(moment);
    }

    // Priority 3: Contact boundary disturbances (awareness interruptions)
    if (moment.gestaltState && moment.gestaltState.detected) {
      return this.getContactDisturbanceStrategy(moment);
    }

    // Default: General somatic presence
    return this.getDefaultSomaticStrategy(moment);
  }

  /**
   * AROUSAL REGULATION (Priority 1)
   * Outside window of tolerance = need to regulate first
   */
  private getArousalRegulationStrategy(moment: SomaticMoment): SomaticResponseStrategy {
    const state = moment.somaticState!.arousal.state;
    const level = moment.awarenessLevel || 'beginner';

    if (state === 'hypoarousal') {
      // Shutdown, numb, disconnected
      return {
        approach: 'Gentle activation through grounding and sensation',
        focus: 'Small sensations, gentle movement, orienting to environment',
        avoid: 'Pushing for emotion or insight, talking about trauma content',

        languageStyle: level === 'beginner' ? 'Simple, grounding' : level === 'master' ? 'Technical Levine SE' : 'Clear, supportive',
        examplePhrases: this.getHypoarousalPhrases(level),

        protocol: 'Levine: Gentle Activation from Hypoarousal',
        interventions: [
          'Orient to room (name 5 things you see)',
          'Notice feet on ground',
          'Gentle movement (stretch, shake hands)',
          'Track small sensations',
          'Titrate activation (tiny amounts)'
        ]
      };
    } else {
      // Hyperarousal: Overwhelm, panic, racing
      return {
        approach: 'Pendulation to resource, grounding, slowing down',
        focus: 'Breath, ground, safe place, resource states',
        avoid: 'Going deeper into activation, processing trauma',

        languageStyle: level === 'beginner' ? 'Calm, directive' : level === 'master' ? 'Technical SE protocol' : 'Supportive, clear',
        examplePhrases: this.getHyperarousalPhrases(level),

        protocol: 'Levine: Pendulation from Hyperarousal',
        interventions: [
          'Pendulate to resource (safe memory, person, place)',
          'Grounding through feet/sit bones',
          'Slow exhale (vagal brake)',
          'Orient to safety cues in present',
          'Track discharge (trembling, waves) without pushing'
        ]
      };
    }
  }

  /**
   * INCOMPLETE SURVIVAL RESPONSES (Priority 2)
   * Fight/flight/freeze/fawn stuck in body
   */
  private getIncompleteResponseStrategy(moment: SomaticMoment): SomaticResponseStrategy {
    const response = moment.somaticState!.incompleteResponse;
    const level = moment.awarenessLevel || 'beginner';

    switch (response.type) {
      case 'fight':
        return {
          approach: 'Complete the fight response through contained expression',
          focus: 'Jaw, shoulders, fists, pushing impulse',
          avoid: 'Suppressing anger, intellectualizing it away',

          languageStyle: level === 'beginner' ? 'Permission-giving' : 'Technical SE',
          examplePhrases: this.getFightResponsePhrases(level),

          protocol: 'Levine: Completing Incomplete Fight',
          interventions: [
            'Notice jaw tension (allow gentle clenching/release)',
            'Feel shoulder activation (push against wall slowly)',
            'Track impulse to push away (micro-movements)',
            'Voice the "no" (even whispered)',
            'Allow discharge (shaking, trembling)'
          ]
        };

      case 'flight':
        return {
          approach: 'Complete the flight response through leg activation',
          focus: 'Legs, feet, running impulse, escape energy',
          avoid: 'Forcing stillness, suppressing the need to move',

          languageStyle: level === 'beginner' ? 'Movement-focused' : 'SE titration',
          examplePhrases: this.getFlightResponsePhrases(level),

          protocol: 'Levine: Completing Incomplete Flight',
          interventions: [
            'Notice leg activation (restlessness, energy)',
            'Track impulse to run (without moving yet)',
            'Micro-movements (feet pressing, legs engaging)',
            'Slow running-in-place or pedaling',
            'Orient to exit/safety (you CAN leave)'
          ]
        };

      case 'freeze':
        return {
          approach: 'Gentle thaw through tiny movements and sensation',
          focus: 'Small sensations, micro-movements, warmth',
          avoid: 'Pushing through numbness, forcing big emotions',

          languageStyle: level === 'beginner' ? 'Gentle, patient' : 'SE freeze discharge',
          examplePhrases: this.getFreezeResponsePhrases(level),

          protocol: 'Levine: Thawing Freeze Response',
          interventions: [
            'Notice ANY sensation (even numbness has quality)',
            'Micro-movements (finger wiggle, toe curl)',
            'Track temperature (warmth coming back)',
            'Pendulate: frozen → thawed → frozen (don\'t rush)',
            'Orient to present safety (freeze no longer needed)'
          ]
        };

      case 'fawn':
        return {
          approach: 'Reclaim boundaries through noticing and choice',
          focus: 'Notice people-pleasing impulse, reclaim "no"',
          avoid: 'Shaming the fawn response, forcing confrontation',

          languageStyle: level === 'beginner' ? 'Compassionate' : 'Boundary-focused',
          examplePhrases: this.getFawnResponsePhrases(level),

          protocol: 'Levine: Recognizing Fawn, Gestalt: Reclaiming Boundaries',
          interventions: [
            'Notice impulse to please/appease',
            'Feel what YOU actually want (body sensation)',
            'Practice tiny "no" (even internally)',
            'Track: does your body relax or tense when you appease?',
            'Celebrate boundary moments (even micro-boundaries)'
          ]
        };

      default:
        return this.getDefaultSomaticStrategy(moment);
    }
  }

  /**
   * CONTACT BOUNDARY DISTURBANCES (Priority 3)
   * Gestalt awareness interruptions
   */
  private getContactDisturbanceStrategy(moment: SomaticMoment): SomaticResponseStrategy {
    const disturbances = moment.gestaltState!.contactDisturbances;
    const level = moment.awarenessLevel || 'beginner';

    // Prioritize retroflection (most somatic)
    if (disturbances.retroflection.detected) {
      return {
        approach: 'Awareness of retroflection, experiment with outward direction',
        focus: 'Notice action turned inward, explore outward direction',
        avoid: 'Forcing outward expression, shaming self-directed action',

        languageStyle: level === 'beginner' ? 'Awareness-building' : 'Gestalt experiment',
        examplePhrases: this.getRetroflectionPhrases(level),

        protocol: 'Gestalt: Retroflection Awareness Experiment',
        interventions: [
          'Notice: What am I doing to myself?',
          'What would I do if this were directed outward?',
          'Experiment: Say to pillow/empty chair (not to self)',
          'Track: Does body relax when direction shifts?',
          'No forcing - just awareness and experimentation'
        ]
      };
    }

    // Then introjection (swallowed beliefs)
    if (disturbances.introjection.detected) {
      return {
        approach: 'Question introjected "shoulds", reclaim personal truth',
        focus: 'Notice "should/must", ask "is this really mine?"',
        avoid: 'Attacking all structure, forcing rebellion',

        languageStyle: level === 'beginner' ? 'Questioning' : 'Gestalt digestion',
        examplePhrases: this.getIntrojectionPhrases(level),

        protocol: 'Gestalt: Introjection Digestion',
        interventions: [
          'List all "shoulds" - write them down',
          'For each: Whose voice is this? (parent/society/etc)',
          'Chew on it: Do I agree? Want to keep this?',
          'Spit out what doesn\'t fit',
          'Own what resonates (make it "I choose to" not "I should")'
        ]
      };
    }

    // Then projection
    if (disturbances.projection.detected) {
      return {
        approach: 'Reclaim projections, own disowned parts',
        focus: 'What I see "out there" that might be "in here"',
        avoid: 'Forcing self-blame, denying real external issues',

        languageStyle: level === 'beginner' ? 'Curiosity-based' : 'Gestalt ownership',
        examplePhrases: this.getProjectionPhrases(level),

        protocol: 'Gestalt: Reclaiming Projections',
        interventions: [
          'Notice strong judgments of others',
          'Experiment: "I am..." (what I\'m judging in them)',
          'Where does this quality live in ME?',
          'Own it (doesn\'t mean act on it)',
          'Paradox: Owning projection often reduces charge'
        ]
      };
    }

    // Then confluence
    if (disturbances.confluence.detected) {
      return {
        approach: 'Clarify boundaries, reclaim "I"',
        focus: 'Where do I end and you begin?',
        avoid: 'Forcing separation, shaming merger',

        languageStyle: level === 'beginner' ? 'Boundary clarity' : 'Contact boundary work',
        examplePhrases: this.getConfluencePhrases(level),

        protocol: 'Gestalt: Boundary Clarification',
        interventions: [
          'Notice "we" - is this really shared?',
          'Practice: "I feel..." vs "We feel..."',
          'What\'s MINE vs what\'s THEIRS?',
          'Track body: Where is MY boundary?',
          'Contact WITH (not merged INTO)'
        ]
      };
    }

    // Finally deflection
    if (disturbances.deflection.detected) {
      return {
        approach: 'Notice deflection, gentle return to contact',
        focus: 'When/how do I avoid direct contact?',
        avoid: 'Forcing intensity, removing all defenses',

        languageStyle: level === 'beginner' ? 'Gentle noticing' : 'Contact restoration',
        examplePhrases: this.getDeflectionPhrases(level),

        protocol: 'Gestalt: Contact Restoration',
        interventions: [
          'Notice when I change topic, joke, abstract',
          'What am I avoiding contact with?',
          'Experiment: Stay with discomfort 10 seconds longer',
          'Direct statement (vs rambling)',
          'Deflection is protection - honor it, then gently test'
        ]
      };
    }

    return this.getDefaultSomaticStrategy(moment);
  }

  /**
   * DEFAULT STRATEGY
   */
  private getDefaultSomaticStrategy(moment: SomaticMoment): SomaticResponseStrategy {
    return {
      approach: 'Present-moment somatic awareness',
      focus: 'Body sensations, breath, grounding',
      avoid: 'Dissociation, intellectualization',

      languageStyle: 'Gentle, grounding',
      examplePhrases: [
        'What do you notice in your body right now?',
        'Can you feel your feet on the ground?',
        'What sensations are present?'
      ],

      protocol: 'Basic Somatic Presence',
      interventions: [
        'Body scan (head to toe)',
        'Notice breath',
        'Feel ground/support',
        'Track sensations without changing',
        'Gentle curiosity'
      ]
    };
  }

  // ========================================================================
  // PHRASE GENERATION (Awareness-Level Adapted)
  // ========================================================================

  private getHypoarousalPhrases(level: string): string[] {
    if (level === 'beginner') {
      return [
        'Let\'s gently come back into your body.',
        'Can you feel your feet on the ground?',
        'What do you notice in the room right now?'
      ];
    } else if (level === 'master') {
      return [
        'Hypoarousal detected. Gentle activation protocol: Orient → Ground → Small movement.',
        'Titrate activation from dorsal shutdown.',
        'Track any small sensation as system gently re-engages.'
      ];
    } else {
      return [
        'You\'re in shutdown (hypoarousal). Let\'s gently activate.',
        'Notice anything small - a sensation, the ground, the room.',
        'We\'re not pushing, just inviting your system back online.'
      ];
    }
  }

  private getHyperarousalPhrases(level: string): string[] {
    if (level === 'beginner') {
      return [
        'Let\'s slow down and find some ground.',
        'Can you take a slow breath with me?',
        'What feels safe or supportive right now?'
      ];
    } else if (level === 'master') {
      return [
        'Hyperarousal state. Pendulation protocol: Resource → Ground → Discharge tracking.',
        'Vagal brake activation via slow exhale.',
        'Orient to safety cues, allow trembling/waves without pushing.'
      ];
    } else {
      return [
        'You\'re in overwhelm (hyperarousal). Let\'s find a resource.',
        'Swing back to something safe - a memory, person, place.',
        'We\'re not suppressing, just giving your nervous system a break.'
      ];
    }
  }

  private getFightResponsePhrases(level: string): string[] {
    if (level === 'beginner') {
      return [
        'Your body wants to push away or say "no." That\'s okay.',
        'Can you feel where that "no" lives in your body?',
        'What if you could gently let that "no" be felt?'
      ];
    } else if (level === 'master') {
      return [
        'Incomplete fight response. Protocol: Track jaw/shoulder activation → Micro-movements → Contained expression.',
        'Titrate aggression discharge through push-back experiments.',
        'Allow organismic completion without re-traumatization.'
      ];
    } else {
      return [
        'You have an incomplete fight response - the push-away never finished.',
        'Let\'s gently complete it: Notice jaw, shoulders, the impulse to push.',
        'Small movements, slow pushing - let the body finish what it started.'
      ];
    }
  }

  private getFlightResponsePhrases(level: string): string[] {
    if (level === 'beginner') {
      return [
        'Your body wants to run or escape. That makes sense.',
        'Can you feel that restless energy in your legs?',
        'What if we let your legs move just a little?'
      ];
    } else if (level === 'master') {
      return [
        'Incomplete flight response. Protocol: Leg activation tracking → Micro-movements → Contained running.',
        'Titrate escape energy through pedaling/running-in-place.',
        'Orient to exits (you CAN leave), allow completion.'
      ];
    } else {
      return [
        'You have trapped flight energy - the escape never completed.',
        'Let\'s complete it: Feel your legs, the impulse to run.',
        'Small movements first - feet pressing, legs engaging.'
      ];
    }
  }

  private getFreezeResponsePhrases(level: string): string[] {
    if (level === 'beginner') {
      return [
        'You\'re frozen or numb. That\'s a protective response.',
        'Let\'s just notice - any tiny sensation, even numbness has a quality.',
        'No rush. We\'ll go as slow as your body needs.'
      ];
    } else if (level === 'master') {
      return [
        'Freeze response active. Protocol: Sensation tracking → Micro-movements → Pendulated thaw.',
        'Titrate freeze discharge (don\'t force thaw).',
        'Orient to present safety, track temperature/sensation return.'
      ];
    } else {
      return [
        'You\'re in freeze - immobilized, shut down.',
        'Let\'s gently thaw: Notice any sensation, wiggle a finger.',
        'Freeze → thaw → freeze - we\'ll pendulate, not push.'
      ];
    }
  }

  private getFawnResponsePhrases(level: string): string[] {
    if (level === 'beginner') {
      return [
        'You\'re trying to keep the peace or make them happy.',
        'What do YOU actually want or need right now?',
        'It\'s okay to have boundaries, even if they\'re upset.'
      ];
    } else {
      return [
        'Fawn response detected (appeasement pattern).',
        'Track: What happens in your body when you appease vs set boundary?',
        'Reclaim your "no" - even tiny boundaries count.'
      ];
    }
  }

  private getRetroflectionPhrases(level: string): string[] {
    if (level === 'beginner') {
      return [
        'You\'re turning something inward on yourself.',
        'What would you do if this were directed outward instead?',
        'Let\'s explore: What if you said that to the situation, not yourself?'
      ];
    } else if (level === 'master') {
      return [
        'Retroflection detected. Gestalt experiment: Redirect action outward.',
        'Notice self-directed action → Explore original outward direction.',
        'Empty chair / pillow technique for safe externalization.'
      ];
    } else {
      return [
        'Retroflection: You\'re doing to yourself what you want to do to others/world.',
        'Notice: What am I doing to myself? Where did it want to go?',
        'Experiment: Direct it outward (safely) and track what shifts.'
      ];
    }
  }

  private getIntrojectionPhrases(level: string): string[] {
    if (level === 'beginner') {
      return [
        'You have a lot of "shoulds" - beliefs you swallowed whole.',
        'Whose voice is that? Is it really true for you?',
        'Let\'s question: Do you actually agree with that rule?'
      ];
    } else if (level === 'master') {
      return [
        'Introjection pattern: Undigested external norms.',
        'Gestalt digestion: Chew → Spit out or assimilate.',
        'Convert "I should" → "I choose to" (or reject).'
      ];
    } else {
      return [
        'Introjections: Beliefs you swallowed without chewing.',
        'List your "shoulds" → Ask: Is this mine or someone else\'s?',
        'Digest: Keep what fits, spit out what doesn\'t.'
      ];
    }
  }

  private getProjectionPhrases(level: string): string[] {
    if (level === 'beginner') {
      return [
        'You see something strongly in them.',
        'Could any part of that also be in you?',
        'Not blaming yourself - just curious: Where does this live in me?'
      ];
    } else if (level === 'master') {
      return [
        'Projection detected. Gestalt ownership experiment.',
        '"I am..." (the quality I\'m seeing in them).',
        'Reclaim disowned parts → Reduces charge, increases choice.'
      ];
    } else {
      return [
        'Projection: What you disown in yourself, you see in others.',
        'Experiment: "I am [what I\'m judging]." How does that feel?',
        'Owning projection doesn\'t mean acting on it - just awareness.'
      ];
    }
  }

  private getConfluencePhrases(level: string): string[] {
    if (level === 'beginner') {
      return [
        'Your boundaries are blurred - hard to tell where you end and they begin.',
        'Let\'s clarify: What\'s YOUR feeling vs theirs?',
        'Practice: "I feel..." instead of "We feel..."'
      ];
    } else if (level === 'master') {
      return [
        'Confluence: Boundary dissolution.',
        'Clarify: I vs We, Mine vs Theirs.',
        'Contact WITH (separate-together) not INTO (merged).'
      ];
    } else {
      return [
        'Confluence: Merged boundaries, loss of "I".',
        'Where do you end and they begin?',
        'Reclaim your separate experience while staying in contact.'
      ];
    }
  }

  private getDeflectionPhrases(level: string): string[] {
    if (level === 'beginner') {
      return [
        'You\'re avoiding direct contact - changing topic, joking, abstracting.',
        'What would happen if you stayed with this a little longer?',
        'Deflection protects you - what does it protect you from?'
      ];
    } else if (level === 'master') {
      return [
        'Deflection pattern: Contact avoidance.',
        'Notice: Topic shift, intellectualization, humor-as-buffer.',
        'Experiment: Stay 10 seconds longer with discomfort.'
      ];
    } else {
      return [
        'Deflection: You\'re avoiding direct contact.',
        'Notice when you shift topic or go abstract.',
        'Gently return: What\'s here if I stay present?'
      ];
    }
  }
}

export const somaticResponseSystem = new SomaticResponseSystem();
