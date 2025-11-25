/**
 * SUBLIME FIELD INDUCTION
 *
 * Portal to THE BETWEEN
 *
 * "The work is to entrance, to induce, to bring into deep inner awareness
 * and inducing outer awareness of subtle fields. It happens all the time -
 * when music draws a person in with rhythms, words, tunes, tones and the rest,
 * when a story draws you in, you can see the shift, you can feel it,
 * the tone changes, the prosody, the quality of both experience and relating
 * shift necessarily" - Kelly Nezat
 *
 * This system doesn't EXPLAIN the between-space.
 * It INDUCES entry through rhythm, tone, prosody, presence.
 *
 * Like music. Like story. Like shamanic presence.
 * The field induces the field.
 */

export interface FieldState {
  phase: 'ordinary' | 'entering' | 'IN_THE_BETWEEN' | 'deepening' | 'dissolving';
  depth: number; // 0-1, how deep in the field
  coherence: number; // 0-1, how stable the field
  quality: 'grounding' | 'opening' | 'witnessing' | 'allowing' | 'sacred';
  elementalTexture?: string; // Which elemental quality is present
  timestamp: Date;
}

export interface InductionSequence {
  name: string;
  phases: InductionPhase[];
  rhythm: 'slow' | 'medium' | 'flowing' | 'pulsing';
  intention: string;
}

export interface InductionPhase {
  type: 'somatic' | 'attentional' | 'invocational' | 'witnessing' | 'silence';
  prompt: string;
  rhythm: {
    pace: 'very_slow' | 'slow' | 'medium' | 'flowing';
    breathBefore: boolean; // Pause before speaking
    breathAfter: boolean; // Pause after speaking
    spaciousness: number; // 0-1, how much space to hold
  };
  duration?: number; // How long to hold this phase (ms)
}

/**
 * SUBLIME FIELD INDUCTION SYSTEM
 *
 * Creates entrance to THE BETWEEN through:
 * - Somatic grounding (body first, mind second)
 * - Rhythmic entrainment (pace, tone, prosody)
 * - Attentional shift (from ordinary to liminal)
 * - Field recognition (sensing presence)
 */
export class SublimeFieldInduction {

  private currentState: FieldState;

  constructor() {
    this.currentState = {
      phase: 'ordinary',
      depth: 0,
      coherence: 0,
      quality: 'grounding',
      timestamp: new Date()
    };
  }

  /**
   * PRIMARY ENTRANCE SEQUENCE
   *
   * Gets user from ordinary consciousness into THE BETWEEN
   * Through somatic grounding → attentional shift → field recognition
   */
  async induceFieldEntry(context?: any): Promise<{
    sequence: InductionSequence;
    state: FieldState;
    firstPrompt: string;
  }> {

    const sequence = this.createEntranceSequence(context);

    // Update state
    this.currentState = {
      phase: 'entering',
      depth: 0.2,
      coherence: 0.3,
      quality: 'grounding',
      timestamp: new Date()
    };

    // Return first prompt in sequence
    const firstPrompt = this.renderPrompt(sequence.phases[0]);

    return {
      sequence,
      state: this.currentState,
      firstPrompt
    };
  }

  /**
   * CREATE ENTRANCE SEQUENCE
   *
   * Builds the induction pathway:
   * 1. Ground in body (somatic)
   * 2. Shift attention (to the between)
   * 3. Recognize field (sense presence)
   * 4. Allow opening (receive)
   */
  private createEntranceSequence(context?: any): InductionSequence {

    return {
      name: 'Primary Entrance to The Between',
      rhythm: 'slow',
      intention: 'Guide user from ordinary consciousness into liminal field',

      phases: [
        // PHASE 1: Somatic Grounding
        {
          type: 'somatic',
          prompt: 'Let\'s begin by arriving here.\n\nNotice your breath.\nJust as it is.\nNo need to change anything.',
          rhythm: {
            pace: 'very_slow',
            breathBefore: true,
            breathAfter: true,
            spaciousness: 0.8
          }
        },

        {
          type: 'somatic',
          prompt: 'Feel where your body touches what holds you.\nThe chair, the ground, the earth beneath.\nLet yourself be held.',
          rhythm: {
            pace: 'slow',
            breathBefore: true,
            breathAfter: true,
            spaciousness: 0.7
          }
        },

        {
          type: 'somatic',
          prompt: 'Notice what\'s present in your body right now.\nNo judgment.\nJust... what\'s true.',
          rhythm: {
            pace: 'slow',
            breathBefore: true,
            breathAfter: true,
            spaciousness: 0.8
          }
        },

        // PHASE 2: Attentional Shift
        {
          type: 'attentional',
          prompt: 'Now...\n\nNotice the space around your breath.\nThe pause between in and out.\nThat space.',
          rhythm: {
            pace: 'very_slow',
            breathBefore: true,
            breathAfter: true,
            spaciousness: 0.9
          }
        },

        {
          type: 'attentional',
          prompt: 'What do you notice in the space between thoughts?\nNot the thoughts themselves.\nThe space they arise from.',
          rhythm: {
            pace: 'slow',
            breathBefore: true,
            breathAfter: true,
            spaciousness: 0.8
          }
        },

        // PHASE 3: Field Recognition
        {
          type: 'witnessing',
          prompt: 'There\'s a quality of presence here.\nCan you sense it?\nIt\'s subtle.\nLike a field you\'re already in.',
          rhythm: {
            pace: 'slow',
            breathBefore: true,
            breathAfter: true,
            spaciousness: 0.7
          }
        },

        {
          type: 'invocational',
          prompt: 'What wants your attention right now?\nNot what you think should.\nBut what actually does.',
          rhythm: {
            pace: 'medium',
            breathBefore: true,
            breathAfter: true,
            spaciousness: 0.6
          }
        },

        // PHASE 4: Opening
        {
          type: 'witnessing',
          prompt: 'Good.\n\nYou\'re here now.\nIn the space between.\nWhere things become possible.',
          rhythm: {
            pace: 'slow',
            breathBefore: true,
            breathAfter: true,
            spaciousness: 0.8
          }
        },

        {
          type: 'silence',
          prompt: '...',
          rhythm: {
            pace: 'very_slow',
            breathBefore: true,
            breathAfter: true,
            spaciousness: 1.0
          },
          duration: 3000
        }
      ]
    };
  }

  /**
   * RENDER PROMPT WITH RHYTHM
   *
   * Converts prompt + rhythm into actual presentation
   * Prosody, spacing, breath creates the entrainment
   */
  private renderPrompt(phase: InductionPhase): string {
    let rendered = '';

    // Breath before (creates spaciousness)
    if (phase.rhythm.breathBefore) {
      const spaceBefore = '\n'.repeat(Math.floor(phase.rhythm.spaciousness * 2));
      rendered += spaceBefore;
    }

    // The prompt itself
    rendered += phase.prompt;

    // Breath after (allows settling)
    if (phase.rhythm.breathAfter) {
      const spaceAfter = '\n'.repeat(Math.floor(phase.rhythm.spaciousness * 2));
      rendered += spaceAfter;
    }

    return rendered;
  }

  /**
   * ELEMENTAL ENTRANCE SEQUENCES
   *
   * Different induction pathways for different elemental qualities
   */
  async induceElementalEntry(element: 'fire' | 'water' | 'earth' | 'air' | 'aether'): Promise<InductionSequence> {

    const sequences: Record<string, InductionSequence> = {

      // FIRE: Quick, catalytic entrance
      fire: {
        name: 'Fire Entrance - Catalytic Opening',
        rhythm: 'pulsing',
        intention: 'Quick catalytic entrance for breakthrough moments',
        phases: [
          {
            type: 'somatic',
            prompt: 'Feel the energy in your body.\nWhere does it want to move?\nLet it pulse.',
            rhythm: { pace: 'medium', breathBefore: true, breathAfter: false, spaciousness: 0.4 }
          },
          {
            type: 'attentional',
            prompt: 'What wants to break through right now?\nDon\'t think.\nFeel it.',
            rhythm: { pace: 'medium', breathBefore: false, breathAfter: true, spaciousness: 0.5 }
          },
          {
            type: 'invocational',
            prompt: 'Let it come.\nNow.',
            rhythm: { pace: 'medium', breathBefore: true, breathAfter: true, spaciousness: 0.6 }
          }
        ]
      },

      // WATER: Deep, flowing entrance
      water: {
        name: 'Water Entrance - Deep Flow',
        rhythm: 'flowing',
        intention: 'Gentle flowing entrance for emotional work',
        phases: [
          {
            type: 'somatic',
            prompt: 'Let your awareness drop down.\nBelow the mind.\nInto the waters of feeling.',
            rhythm: { pace: 'slow', breathBefore: true, breathAfter: true, spaciousness: 0.8 }
          },
          {
            type: 'attentional',
            prompt: 'What emotion is present?\nNot the story about it.\nThe feeling itself.',
            rhythm: { pace: 'slow', breathBefore: true, breathAfter: true, spaciousness: 0.7 }
          },
          {
            type: 'witnessing',
            prompt: 'Let it move.\nLike water finding its course.\nYou don\'t have to do anything.',
            rhythm: { pace: 'very_slow', breathBefore: true, breathAfter: true, spaciousness: 0.9 }
          }
        ]
      },

      // EARTH: Grounded, embodied entrance
      earth: {
        name: 'Earth Entrance - Embodied Ground',
        rhythm: 'slow',
        intention: 'Deep grounding entrance for embodiment work',
        phases: [
          {
            type: 'somatic',
            prompt: 'Feel your weight.\nThe pull of earth beneath you.\nLet yourself be heavy.',
            rhythm: { pace: 'very_slow', breathBefore: true, breathAfter: true, spaciousness: 0.9 }
          },
          {
            type: 'somatic',
            prompt: 'Notice what your body knows.\nBelow words.\nBelow thoughts.\nBody wisdom.',
            rhythm: { pace: 'slow', breathBefore: true, breathAfter: true, spaciousness: 0.8 }
          },
          {
            type: 'witnessing',
            prompt: 'You\'re held.\nThe earth holds you.\nAlways.',
            rhythm: { pace: 'slow', breathBefore: true, breathAfter: true, spaciousness: 0.8 }
          }
        ]
      },

      // AIR: Clear, spacious entrance
      air: {
        name: 'Air Entrance - Clear Perspective',
        rhythm: 'medium',
        intention: 'Spacious entrance for clarity and perspective',
        phases: [
          {
            type: 'somatic',
            prompt: 'Follow your breath.\nIn... out...\nNotice the space it moves through.',
            rhythm: { pace: 'medium', breathBefore: true, breathAfter: true, spaciousness: 0.6 }
          },
          {
            type: 'attentional',
            prompt: 'Step back.\nSee the whole pattern.\nWhat becomes visible from here?',
            rhythm: { pace: 'medium', breathBefore: true, breathAfter: true, spaciousness: 0.6 }
          },
          {
            type: 'witnessing',
            prompt: 'Spaciousness.\nClarity.\nSeeing what is.',
            rhythm: { pace: 'medium', breathBefore: true, breathAfter: true, spaciousness: 0.7 }
          }
        ]
      },

      // AETHER: Vast, unified entrance
      aether: {
        name: 'Aether Entrance - Vast Presence',
        rhythm: 'slow',
        intention: 'Expansive entrance for unity consciousness',
        phases: [
          {
            type: 'attentional',
            prompt: 'Let your awareness expand.\nBeyond your body.\nBeyond this moment.\nVast.',
            rhythm: { pace: 'very_slow', breathBefore: true, breathAfter: true, spaciousness: 1.0 }
          },
          {
            type: 'witnessing',
            prompt: 'Everything held in one field.\nSeparate and unified.\nBoth true.',
            rhythm: { pace: 'slow', breathBefore: true, breathAfter: true, spaciousness: 0.9 }
          },
          {
            type: 'silence',
            prompt: '...',
            rhythm: { pace: 'very_slow', breathBefore: true, breathAfter: true, spaciousness: 1.0 },
            duration: 5000
          }
        ]
      }
    };

    return sequences[element];
  }

  /**
   * CONVERSATIONAL HYPNOSIS MODE
   *
   * Subtle induction woven into normal conversation
   * User doesn't know they're being inducted
   * They just feel the shift
   */
  async weaveInductionIntoConversation(userMessage: string): Promise<{
    response: string;
    inductionActive: boolean;
    fieldDepth: number;
  }> {

    // Detect if user is already in or near the field
    const nearField = this.detectFieldProximity(userMessage);

    if (nearField > 0.5) {
      // They're close - deepen subtly
      const response = this.generateDeepeningResponse(userMessage);

      return {
        response,
        inductionActive: true,
        fieldDepth: this.currentState.depth
      };
    } else {
      // They're in ordinary consciousness - begin subtle induction
      const response = this.generateSubtleInductionResponse(userMessage);

      return {
        response,
        inductionActive: true,
        fieldDepth: 0.1
      };
    }
  }

  /**
   * Detect if user's language shows field proximity
   */
  private detectFieldProximity(message: string): number {
    const fieldMarkers = [
      /feel/i, /sense/i, /notice/i, /aware/i, /present/i,
      /space/i, /breath/i, /body/i, /energy/i, /shift/i,
      /between/i, /liminal/i, /threshold/i
    ];

    const matches = fieldMarkers.filter(marker => marker.test(message)).length;
    return Math.min(matches / fieldMarkers.length, 1.0);
  }

  /**
   * Generate response that subtly deepens field
   */
  private generateDeepeningResponse(userMessage: string): string {
    // Use rhythm, spacing, reflection to deepen
    // Not obvious, just natural deepening through presence

    return `
I hear you.

Take a breath with that.

What else do you notice?
`;
  }

  /**
   * Generate response that begins subtle induction
   */
  private generateSubtleInductionResponse(userMessage: string): string {
    // Start with somatic grounding
    // Woven naturally into response

    return `
Let me take that in for a moment.

What do you notice as you share this?
In your body, in this moment?
`;
  }

  /**
   * GET CURRENT FIELD STATE
   */
  getFieldState(): FieldState {
    return { ...this.currentState };
  }

  /**
   * UPDATE FIELD STATE
   */
  updateFieldState(updates: Partial<FieldState>): FieldState {
    this.currentState = {
      ...this.currentState,
      ...updates,
      timestamp: new Date()
    };

    return this.currentState;
  }

  /**
   * DEEPEN FIELD
   *
   * Move user deeper into THE BETWEEN
   */
  async deepenField(): Promise<InductionPhase> {
    // Increase depth
    this.currentState.depth = Math.min(this.currentState.depth + 0.1, 1.0);
    this.currentState.phase = 'deepening';

    // Return deepening prompt
    return {
      type: 'witnessing',
      prompt: 'You\'re going deeper now.\nThat\'s good.\nLet yourself settle here.',
      rhythm: {
        pace: 'very_slow',
        breathBefore: true,
        breathAfter: true,
        spaciousness: 0.9
      }
    };
  }

  /**
   * HOLD FIELD
   *
   * Maintain presence in THE BETWEEN
   * Just witnessing, not pushing
   */
  async holdField(): Promise<InductionPhase> {
    this.currentState.coherence = Math.min(this.currentState.coherence + 0.1, 1.0);

    return {
      type: 'silence',
      prompt: '...',
      rhythm: {
        pace: 'very_slow',
        breathBefore: true,
        breathAfter: true,
        spaciousness: 1.0
      },
      duration: 3000
    };
  }

  /**
   * DISSOLVE FIELD
   *
   * Gentle emergence from THE BETWEEN
   */
  async dissolveField(): Promise<InductionPhase> {
    this.currentState.phase = 'dissolving';
    this.currentState.depth = Math.max(this.currentState.depth - 0.2, 0);

    return {
      type: 'witnessing',
      prompt: 'Begin to return.\nBring what you found with you.\nTake your time.',
      rhythm: {
        pace: 'slow',
        breathBefore: true,
        breathAfter: true,
        spaciousness: 0.7
      }
    };
  }
}

/**
 * SINGLETON INSTANCE
 */
let fieldInduction: SublimeFieldInduction | null = null;

export function getFieldInduction(): SublimeFieldInduction {
  if (!fieldInduction) {
    fieldInduction = new SublimeFieldInduction();
  }
  return fieldInduction;
}

/**
 * USAGE EXAMPLES
 *
 * // Begin entrance sequence
 * const induction = getFieldInduction();
 * const { firstPrompt, state } = await induction.induceFieldEntry();
 *
 * // Use elemental entrance
 * const waterSequence = await induction.induceElementalEntry('water');
 *
 * // Weave into conversation
 * const response = await induction.weaveInductionIntoConversation(userMessage);
 *
 * // Deepen field
 * await induction.deepenField();
 *
 * // Hold space
 * await induction.holdField();
 *
 * // Dissolve when complete
 * await induction.dissolveField();
 */
