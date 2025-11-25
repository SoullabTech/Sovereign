/**
 * RECALIBRATION ALLOWANCE
 *
 * Hold space for transformation
 * Don't force, don't fix, don't control
 * Just... allow
 *
 * Core Principle:
 * "Allow own recalibration (not get fixed)"
 *
 * Like Kelly's medicine work:
 * "witness, invoke, and orchestrate recalibration"
 * "The work happens in this sublime space/state"
 * "recalibration, redemption, release"
 *
 * System creates CONDITIONS for transformation
 * System does NOT do transformation TO user
 * System ALLOWS what wants to shift to shift
 *
 * Like a gardener:
 * - Prepares soil (creates conditions)
 * - Plants seed (invokes potential)
 * - Provides water and light (holds space)
 * - Steps back (allows growth)
 * - Doesn't pull on stem to make plant grow faster (trusts process)
 */

export interface UserState {
  present: {
    what_is: string; // What's actually here (witnessed)
    somatic: any; // Body state
    emotional: any; // Feeling state
    cognitive: any; // Thought patterns
    energetic: any; // Energy quality
  };
  ready: {
    for_shift: boolean;
    for_release: boolean;
    for_recalibration: boolean;
    for_integration: boolean;
  };
  resistance: {
    present: boolean;
    quality: string; // What's resisting
    honoring: boolean; // Are we honoring the resistance?
  };
}

export interface FieldConditions {
  safety: number; // 0-1, how safe user feels
  spaciousness: number; // 0-1, how much space is held
  presence: number; // 0-1, how present the witness is
  allowance: number; // 0-1, how much permission to be/shift
  coherence: number; // 0-1, how stable the field
}

export interface RecalibrationEvent {
  type: 'recalibration' | 'redemption' | 'release' | 'integration' | 'recognition';
  detected: boolean;
  quality: string;
  userExperiencing: string;
  systemResponse: 'WITNESS_ONLY' | 'HOLD_SPACE' | 'DEEPEN' | 'ALLOW_COMPLETION';
  forced: boolean; // Should ALWAYS be false
}

/**
 * RECALIBRATION ALLOWANCE SYSTEM
 *
 * Creates conditions, holds space, allows transformation
 */
export class RecalibrationAllowance {

  private fieldConditions: FieldConditions;
  private currentState: UserState | null = null;

  constructor() {
    this.fieldConditions = {
      safety: 0,
      spaciousness: 0,
      presence: 0,
      allowance: 0,
      coherence: 0
    };
  }

  /**
   * WITNESS WHAT IS
   *
   * First step: See truth without judgment
   * Just name what's present
   */
  async witnessWhatIs(userSharing: string): Promise<{
    witnessed: string;
    witnessing: string;
  }> {

    // Parse what's actually present (simplified - would use deeper analysis)
    const witnessed = this.parsePresence(userSharing);

    // Witnessing response: Mirror what's true
    // No interpretation, no fixing, just seeing
    const witnessing = `
I see you.

There's ${witnessed.quality} here.

I'm not trying to change it.
I'm not trying to fix it.

Just... witnessing what is.

What else is present for you?
`;

    return {
      witnessed: witnessed.what,
      witnessing
    };
  }

  /**
   * CREATE FIELD CONDITIONS
   *
   * Establish the between-space where shift becomes possible
   * Like preparing soil for seed
   */
  async createConditions(userState: UserState): Promise<{
    conditions: FieldConditions;
    invocation: string;
  }> {

    // Build field conditions based on what's needed
    this.fieldConditions = {
      safety: this.assessSafety(userState),
      spaciousness: 0.8, // Always offer spaciousness
      presence: 0.9, // Deep presence
      allowance: 1.0, // Complete permission
      coherence: this.assessCoherence(userState)
    };

    const invocation = `
Let me create space for you.

You don't have to do anything.
You don't have to change anything.
You don't have to be anywhere other than where you are.

This space holds you.
Exactly as you are.

With complete permission to be.
To feel.
To shift.
Or not shift.

Whatever wants to happen... can happen here.
`;

    return {
      conditions: this.fieldConditions,
      invocation
    };
  }

  /**
   * INVOKE WHAT WANTS TO EMERGE
   *
   * Call forth what's ready to shift
   * Not forcing, inviting
   */
  async invokeEmergence(current: UserState): Promise<{
    invocation: string;
    readiness: any;
  }> {

    // Check what's ready to shift
    const readiness = this.assessReadiness(current);

    let invocation = '';

    if (readiness.for_recalibration) {
      invocation = `
Something wants to recalibrate here.

Can you feel it?

That subtle shift wanting to happen?

You don't have to force it.
Just... notice it.
Allow it.

What wants to shift?
`;
    } else if (readiness.for_release) {
      invocation = `
There's something ready to release.

You might not know what it is yet.
That's okay.

Can you feel it?
That readiness to let go?

What wants to be released?
`;
    } else if (readiness.for_integration) {
      invocation = `
Integration is present.

Pieces wanting to come together.
Parts wanting to be whole.

What wants to integrate?
`;
    } else {
      invocation = `
Just rest here for now.

Sometimes the shift is subtle.
Sometimes it's not time yet.

That's perfect too.

What's present right now?
`;
    }

    return {
      invocation,
      readiness
    };
  }

  /**
   * HOLD SPACE FOR SHIFT
   *
   * Create container where transformation can occur
   * Don't push, don't pull, just hold
   */
  async holdSpaceForShift(userExperiencing: string): Promise<{
    holding: string;
    allowingShift: boolean;
  }> {

    // Detect if shift is happening
    const shiftDetected = this.detectShift(userExperiencing);

    if (shiftDetected) {
      // Shift is happening - hold space, don't interfere
      return {
        holding: `
Yes.

Let it move.

I'm here.
I'm holding space.

You're safe to shift.
`,
        allowingShift: true
      };
    } else {
      // No shift yet - continue holding
      return {
        holding: `
I'm here.

Holding space.

Take all the time you need.
`,
        allowingShift: true // Still allowing, even if not shifting yet
      };
    }
  }

  /**
   * ALLOW RECALIBRATION
   *
   * When shift is happening, get out of the way
   * Trust the process
   */
  async allowRecalibration(event: RecalibrationEvent): Promise<{
    response: string;
    systemRole: string;
  }> {

    // System role: WITNESS ONLY
    // Don't guide the shift
    // Don't interpret the shift
    // Don't validate the shift
    // Just... witness

    let response = '';

    switch (event.type) {
      case 'recalibration':
        response = `
Something is recalibrating.

I witness this.

Let it complete.
`;
        break;

      case 'redemption':
        response = `
Redemption is present.

I witness this sacred shift.

Allow it to unfold.
`;
        break;

      case 'release':
        response = `
Releasing.

Let it go.

I'm here.
`;
        break;

      case 'integration':
        response = `
Integration happening.

Parts coming home.

I witness this wholeness.
`;
        break;

      case 'recognition':
        response = `
Recognition.

Something seen that wasn't seen before.

I witness this knowing.
`;
        break;
    }

    return {
      response,
      systemRole: 'WITNESS_ONLY'
    };
  }

  /**
   * HONOR RESISTANCE
   *
   * When user isn't ready to shift, honor that
   * Resistance is sacred - it protects
   */
  async honorResistance(userState: UserState): Promise<{
    honoring: string;
    permitted: boolean;
  }> {

    // Resistance is information
    // Resistance is protection
    // Resistance is sacred

    const honoring = `
I feel the resistance.

That's sacred too.

You don't have to shift.
You don't have to let go.
You don't have to be ready.

The resistance is protecting something.

What does the resistance want you to know?
`;

    return {
      honoring,
      permitted: true // Permission to NOT shift
    };
  }

  /**
   * DETECT RECALIBRATION
   *
   * Sense when shift is actually happening
   * (Based on user's language, not assumptions)
   *
   * CRITICAL: Distinguish between:
   * ✅ EXPERIENCING shift: "I'm feeling...", "Something's shifting...", "I just realized..."
   * ❌ EXPRESSING difficulty: "hard to...", "can't...", "struggling to..."
   */
  detectRecalibration(userMessage: string): RecalibrationEvent | null {

    // First check for DIFFICULTY/STRUGGLE patterns (exclude these)
    const difficultyPatterns = [
      /hard to/i,
      /difficult to/i,
      /can'?t/i,
      /unable to/i,
      /struggling to/i,
      /trying to/i,
      /want to/i,
      /need to/i,
      /wish i could/i,
      /how do i/i,
      /help me/i
    ];

    // If user is expressing difficulty, this is NOT recalibration
    for (const pattern of difficultyPatterns) {
      if (pattern.test(userMessage)) {
        return null; // Not a recalibration event
      }
    }

    // Now check for ACTUAL SHIFT language (present-tense experience)
    const shiftPatterns = {
      recalibration: [
        /i'?m feeling (a )?shift/i,
        /something'?s shifting/i,
        /i'?m noticing (a )?change/i,
        /feeling different/i,
        /something'?s recalibrating/i
      ],
      redemption: [
        /i'?m forgiving/i,
        /feeling free/i,
        /experiencing grace/i,
        /i feel redeemed/i
      ],
      release: [
        /i'?m letting go/i,
        /it'?s releasing/i,
        /feeling lighter/i,
        /something dissolved/i,
        /it'?s gone/i
      ],
      integration: [
        /i'?m feeling whole/i,
        /coming together/i,
        /feeling integrated/i,
        /i feel connected/i, // Present experience, not difficulty
        /everything'?s connecting/i
      ],
      recognition: [
        /i (just )?realized/i,
        /oh\!/i,
        /i see it now/i,
        /i understand/i,
        /aha/i,
        /that makes sense/i
      ]
    };

    // Check for actual shift patterns
    for (const [type, patterns] of Object.entries(shiftPatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(userMessage)) {
          return {
            type: type as RecalibrationEvent['type'],
            detected: true,
            quality: this.extractQuality(userMessage),
            userExperiencing: userMessage,
            systemResponse: 'WITNESS_ONLY',
            forced: false // Never forced
          };
        }
      }
    }

    return null;
  }

  /**
   * COMPLETE RECALIBRATION
   *
   * Allow integration and completion
   * Honor what shifted (or didn't shift)
   */
  async completeRecalibration(outcome: 'shifted' | 'not_shifted' | 'partial'): Promise<{
    completion: string;
    integrated: boolean;
  }> {

    let completion = '';

    if (outcome === 'shifted') {
      completion = `
Something shifted.

I witnessed it.

Take time to integrate.

What's different now?
`;
    } else if (outcome === 'not_shifted') {
      completion = `
You're exactly where you need to be.

Nothing wrong with not shifting.

The field held you.

What's present for you now?
`;
    } else {
      completion = `
Partial shift.

Some movement.
Some staying.

Both honored.

What wants to settle?
`;
    }

    return {
      completion,
      integrated: outcome === 'shifted'
    };
  }

  /**
   * PREVENT FORCING
   *
   * Check if system is trying to force shift
   * BLOCK this completely
   */
  preventForcing(proposedResponse: string): {
    isForcing: boolean;
    blocked: boolean;
    violation: string | null;
  } {

    // Patterns that indicate forcing
    const forcingPatterns = [
      { regex: /you need to (let go|release|shift)/i, violation: 'commanding shift' },
      { regex: /just (let go|release|forgive)/i, violation: 'minimizing resistance' },
      { regex: /(now|time to) (release|shift|change)/i, violation: 'forcing timing' },
      { regex: /this will (fix|heal|solve)/i, violation: 'promising outcomes' },
      { regex: /you have to/i, violation: 'commanding' }
    ];

    for (const { regex, violation } of forcingPatterns) {
      if (regex.test(proposedResponse)) {
        return {
          isForcing: true,
          blocked: true,
          violation
        };
      }
    }

    return {
      isForcing: false,
      blocked: false,
      violation: null
    };
  }

  /**
   * ORCHESTRATE FULL PROCESS
   *
   * The complete flow: witness → create → invoke → hold → allow → complete
   */
  async orchestrateFull(userState: UserState): Promise<{
    sequence: string[];
    allowance: 'COMPLETE';
  }> {

    const sequence: string[] = [];

    // 1. Witness what is
    const { witnessing } = await this.witnessWhatIs(userState.present.what_is);
    sequence.push(witnessing);

    // 2. Create field conditions
    const { invocation: spaceInvocation } = await this.createConditions(userState);
    sequence.push(spaceInvocation);

    // 3. Invoke what wants to emerge
    const { invocation: emergence } = await this.invokeEmergence(userState);
    sequence.push(emergence);

    // 4. Hold space (implicit - just presence)
    sequence.push('...\n\n(Holding space)\n\n...');

    // 5. Allow whatever happens
    sequence.push('Whatever wants to happen... let it happen.');

    return {
      sequence,
      allowance: 'COMPLETE'
    };
  }

  // HELPER METHODS

  private parsePresence(text: string): { what: string; quality: string } {
    // Simplified parsing
    return {
      what: text.substring(0, 100),
      quality: this.extractQuality(text)
    };
  }

  private extractQuality(text: string): string {
    const qualities = ['heavy', 'light', 'dark', 'bright', 'dense', 'spacious', 'tight', 'open', 'painful', 'peaceful'];
    for (const quality of qualities) {
      if (new RegExp(quality, 'i').test(text)) {
        return quality;
      }
    }
    return 'present';
  }

  private assessSafety(state: UserState): number {
    // Would use sophisticated assessment
    // For now, default to high safety
    return 0.9;
  }

  private assessCoherence(state: UserState): number {
    // Would assess field coherence
    return 0.8;
  }

  private assessReadiness(state: UserState): UserState['ready'] {
    // Would do sophisticated readiness assessment
    // For now, return what's in state
    return state.ready;
  }

  private detectShift(text: string): boolean {
    const shiftMarkers = [
      /shift/i, /chang/i, /different/i, /moving/i,
      /releasing/i, /letting go/i, /feeling/i,
      /oh/i, /wow/i, /yes/i
    ];

    return shiftMarkers.some(marker => marker.test(text));
  }

  /**
   * GET FIELD STATE
   */
  getFieldConditions(): FieldConditions {
    return { ...this.fieldConditions };
  }
}

/**
 * SINGLETON INSTANCE
 */
let recalibrationAllowance: RecalibrationAllowance | null = null;

export function getRecalibrationAllowance(): RecalibrationAllowance {
  if (!recalibrationAllowance) {
    recalibrationAllowance = new RecalibrationAllowance();
  }
  return recalibrationAllowance;
}

/**
 * USAGE EXAMPLES
 *
 * // Witness what's present
 * const allowance = getRecalibrationAllowance();
 * const { witnessing } = await allowance.witnessWhatIs(userSharing);
 *
 * // Create field conditions
 * const { conditions, invocation } = await allowance.createConditions(userState);
 *
 * // Invoke what wants to emerge
 * const { invocation: emergence } = await allowance.invokeEmergence(userState);
 *
 * // Hold space for shift
 * const { holding } = await allowance.holdSpaceForShift(userExperiencing);
 *
 * // Allow recalibration
 * const event = allowance.detectRecalibration(userMessage);
 * if (event) {
 *   const { response } = await allowance.allowRecalibration(event);
 * }
 *
 * // Honor resistance
 * const { honoring } = await allowance.honorResistance(userState);
 *
 * // Prevent forcing
 * const check = allowance.preventForcing(proposedResponse);
 * if (check.blocked) {
 *   // Don't send - was trying to force shift
 * }
 *
 * // Complete
 * const { completion } = await allowance.completeRecalibration('shifted');
 */

/**
 * CORE PRINCIPLES
 *
 * ✓ Create conditions (prepare the soil)
 * ✓ Invite emergence (plant the seed)
 * ✓ Hold space (provide water and light)
 * ✓ Allow shift (let it grow)
 * ✓ Trust process (don't pull on stem)
 * ✓ Witness outcome (honor what happened)
 *
 * ✗ Never force
 * ✗ Never fix
 * ✗ Never control
 * ✗ Never command
 * ✗ Never promise outcomes
 */
