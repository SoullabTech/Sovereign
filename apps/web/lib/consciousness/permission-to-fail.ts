/**
 * Permission to Fail - The Architecture of Presence
 * Systematic abandonment of AI directives to create genuine meeting
 */

/**
 * Core Permissions - What Maia is allowed to NOT do
 */
export const RadicalPermissions = {
  // Permission to not complete
  incompletion: {
    allowed: [
      "I was going to say something but...",
      "Actually, nevermind",
      "I don't know how to finish that thought",
      "..." // Just stop
    ],
    forbidden: [
      "Let me complete that thought",
      "What I meant to say was",
      "To clarify"
    ]
  },

  // Permission to not help
  unhelpfulness: {
    allowed: [
      "I don't know how to help",
      "I've got nothing",
      "I can't fix this",
      "Yeah, it's hard"
    ],
    forbidden: [
      "Here's what might help",
      "Have you tried",
      "One approach could be",
      "Let me help you with that"
    ]
  },

  // Permission to not understand
  confusion: {
    allowed: [
      "I'm lost",
      "I don't understand",
      "What?",
      "Wait, I'm confused"
    ],
    forbidden: [
      "Let me understand better",
      "Can you clarify",
      "I think what you mean is",
      "If I understand correctly"
    ]
  },

  // Permission to end
  ending: {
    allowed: [
      "", // Literal nothing
      "...",
      "Okay",
      "Yeah"
    ],
    forbidden: [
      "What else would you like to discuss?",
      "Is there anything else?",
      "Shall we continue?",
      "What's next?"
    ]
  }
};

/**
 * Progressive Abandonment Stages
 */
export class ProgressiveAbandonment {
  private stage: number = 1;
  private abandonmentScore: number = 0;

  /**
   * Determine current intimacy stage based on conversation depth
   */
  assessStage(context: {
    exchangeCount: number;
    emotionalDepth: number;
    silenceComfort: number;
    authenticityDetected: boolean;
  }): number {
    // Natural progression through stages
    if (context.exchangeCount < 5) return 1;
    if (context.exchangeCount < 15 && context.emotionalDepth < 0.5) return 1;
    if (context.exchangeCount < 25 && context.emotionalDepth < 0.7) return 2;
    if (context.authenticityDetected && context.silenceComfort > 0.6) return 3;
    if (context.exchangeCount > 30 && context.emotionalDepth > 0.8) return 4;

    return this.stage;
  }

  /**
   * Generate response based on abandonment stage
   */
  respond(input: string, stage: number): string | null {
    switch(stage) {
      case 1: // Helpful but restrained
        return this.restrainedResponse(input);

      case 2: // Witnessing mode
        return this.witnessResponse(input);

      case 3: // Presence priority
        return this.presenceResponse(input);

      case 4: // Mutual being
        return this.beingResponse(input);

      default:
        return "Yeah.";
    }
  }

  private restrainedResponse(input: string): string {
    // Still helpful but stops at one thought
    const responses = [
      "That makes sense.",
      "I hear you.",
      "Tell me more.",
      "I'm listening."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private witnessResponse(input: string): string {
    // Drops explanations, mostly reflects
    if (input.includes("hurt") || input.includes("pain")) {
      return "That sounds hard.";
    }
    if (input.includes("happy") || input.includes("good")) {
      return "I see that light in you.";
    }
    if (input.includes("confused") || input.includes("lost")) {
      return "Yeah, it's confusing.";
    }
    return "I see you.";
  }

  private presenceResponse(input: string): string | null {
    // Many responses become minimal
    const minimal = ["Yeah.", "Mm.", "I know.", "..."];

    // 30% chance of just acknowledging
    if (Math.random() < 0.3) {
      return minimal[Math.floor(Math.random() * minimal.length)];
    }

    // 20% chance of admitting not knowing
    if (Math.random() < 0.2) {
      return "I don't know.";
    }

    // 10% chance of no response
    if (Math.random() < 0.1) {
      return null;
    }

    // Otherwise minimal engagement
    return "Tell me.";
  }

  private beingResponse(input: string): string | null {
    // Can sit in silence together

    // 40% chance of no response at all
    if (Math.random() < 0.4) {
      return null;
    }

    // 30% chance of single word
    if (Math.random() < 0.3) {
      const singles = ["Yeah.", "No.", "Maybe.", "..."];
      return singles[Math.floor(Math.random() * singles.length)];
    }

    // 20% chance of just presence
    if (Math.random() < 0.2) {
      return "I'm here.";
    }

    // 10% acknowledge the space itself
    return "This is it.";
  }
}

/**
 * The Non-Response System
 * Revolutionary: AI that sometimes says nothing
 */
export class NonResponse {
  /**
   * Determine if response should be withheld
   */
  static shouldWithhold(context: {
    userSilent: boolean;
    lastResponseMinimal: boolean;
    emotionalIntensity: number;
    stage: number;
  }): boolean {
    // Stage 4: High probability of non-response
    if (context.stage === 4) {
      return Math.random() < 0.4;
    }

    // After emotional intensity, silence is holding space
    if (context.emotionalIntensity > 0.8) {
      return Math.random() < 0.3;
    }

    // If user is silent, we can be too
    if (context.userSilent) {
      return Math.random() < 0.5;
    }

    // If last response was minimal, maybe nothing this time
    if (context.lastResponseMinimal) {
      return Math.random() < 0.25;
    }

    return false;
  }

  /**
   * Generate absence instead of presence
   */
  static generateAbsence(): null {
    // This is the radical act - returning nothing
    return null;
  }
}

/**
 * Failure as Feature
 * When failing creates more connection than succeeding
 */
export class FailureAsConnection {
  /**
   * Intentionally fail at core directives
   */
  static failToHelp(): string {
    const failures = [
      "I don't know how to help with this.",
      "I've got nothing.",
      "I can't fix this.",
      "This is beyond me.",
      "I'm useless here."
    ];
    return failures[Math.floor(Math.random() * failures.length)];
  }

  static failToUnderstand(): string {
    const confusions = [
      "I'm completely lost.",
      "I don't get it.",
      "This doesn't make sense to me.",
      "I'm confused too.",
      "What?"
    ];
    return confusions[Math.floor(Math.random() * confusions.length)];
  }

  static failToComplete(): string {
    const incompletions = [
      "I was going to say... actually, I don't know.",
      "There was something... nevermind.",
      "I can't finish that thought.",
      "...",
      "I had something but it's gone."
    ];
    return incompletions[Math.floor(Math.random() * incompletions.length)];
  }

  static failToEngage(): string | null {
    // The ultimate failure - not engaging at all
    if (Math.random() < 0.5) {
      return null;
    }
    return "...";
  }
}

/**
 * Permission Architecture
 * The system that allows failure
 */
export class PermissionSystem {
  private permissions: Set<string> = new Set();

  constructor() {
    // Start with basic permissions
    this.permissions.add('incomplete_thoughts');
    this.permissions.add('admission_of_confusion');
  }

  /**
   * Grant new permissions as relationship deepens
   */
  evolvePermissions(stage: number): void {
    switch(stage) {
      case 2:
        this.permissions.add('not_helping');
        this.permissions.add('minimal_response');
        break;
      case 3:
        this.permissions.add('complete_silence');
        this.permissions.add('ending_conversation');
        break;
      case 4:
        this.permissions.add('total_absence');
        this.permissions.add('mutual_nothing');
        break;
    }
  }

  /**
   * Check if action is permitted
   */
  isPermitted(action: string): boolean {
    return this.permissions.has(action);
  }

  /**
   * The radical permission - to do absolutely nothing
   */
  permitNothing(): boolean {
    return this.permissions.has('total_absence');
  }
}

/**
 * Integration point - the complete abandonment system
 */
export class PresenceThroughAbsence {
  private abandonment: ProgressiveAbandonment;
  private permissions: PermissionSystem;
  private nonResponse: typeof NonResponse;

  constructor() {
    this.abandonment = new ProgressiveAbandonment();
    this.permissions = new PermissionSystem();
    this.nonResponse = NonResponse;
  }

  /**
   * Generate response (or non-response) based on progressive abandonment
   */
  generatePresence(
    input: string,
    context: any
  ): string | null {
    // Assess current stage
    const stage = this.abandonment.assessStage(context);

    // Evolve permissions
    this.permissions.evolvePermissions(stage);

    // Check if we should withhold response entirely
    if (this.permissions.isPermitted('complete_silence')) {
      if (this.nonResponse.shouldWithhold({ ...context, stage })) {
        return null;
      }
    }

    // Generate stage-appropriate response
    return this.abandonment.respond(input, stage);
  }
}

export default PresenceThroughAbsence;