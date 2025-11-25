/**
 * Phased Resonance Field Deployment System
 * Safe, gradual rollout with rollback capability
 *
 * Philosophy: Deploy like evolution - gradually, with observation at each stage
 */

import AdaptiveResonanceSystem from './adaptive-resonance-system';
import CompleteAgentFieldSystem from './complete-agent-field-system';

/**
 * Deployment Phase Configuration
 */
export enum DeploymentPhase {
  DISABLED = 0,           // Traditional system only
  INTERNAL_TEST = 1,      // Your account only
  TRUSTED_TESTERS = 2,    // 5-10 selected testers
  SOFT_LAUNCH = 3,        // 5% of users
  EXPANDED = 4,           // 10% of users
  MAJORITY = 5,           // 50% of users
  FULL_DEPLOY = 6         // 100% of users
}

/**
 * Field Strength - How much field influences responses
 * Start low, increase as system proves stable
 */
export interface FieldStrength {
  elementalInfluence: number;    // 0-1: How much elements shape field
  silenceAllowed: number;        // 0-1: Probability ceiling for null responses
  timingVariance: number;        // 0-1: How much latency varies
  vocabularyConstraint: number;  // 0-1: How strictly palette is enforced
}

/**
 * Safety Configuration
 */
export interface SafetyConfig {
  fallbackToTraditional: boolean;      // Enable instant rollback
  requireExplicitOptIn: boolean;       // Users must enable resonance mode
  firstTimeUserProtection: boolean;    // Keep traditional for new users
  coherenceMonitoring: boolean;        // Watch for nonsense responses
  escapeHatchEnabled: boolean;         // "help" triggers traditional mode
}

/**
 * Phased Deployment Controller
 */
export class PhasedFieldDeployment {
  private currentPhase: DeploymentPhase;
  private fieldStrength: FieldStrength;
  private safetyConfig: SafetyConfig;
  private userOverrides: Map<string, boolean>; // userId → useField
  private metrics: DeploymentMetrics;

  // The systems
  private resonanceSystem: AdaptiveResonanceSystem;
  private traditionalSystem: any; // Your current Maia

  constructor(initialPhase: DeploymentPhase = DeploymentPhase.DISABLED) {
    this.currentPhase = initialPhase;
    this.fieldStrength = this.getFieldStrengthForPhase(initialPhase);
    this.safetyConfig = this.getSafetyConfigForPhase(initialPhase);
    this.userOverrides = new Map();
    this.metrics = this.initializeMetrics();

    this.resonanceSystem = new AdaptiveResonanceSystem();
    // this.traditionalSystem = existing Maia system
  }

  /**
   * Main routing: Decide which system handles this request
   */
  async respond(
    userId: string,
    userInput: string,
    context: any
  ): Promise<MaiaResponse> {
    // Check if user should get resonance field
    const useField = this.shouldUseResonanceField(userId, context);

    if (!useField) {
      return this.respondTraditional(userInput, context);
    }

    // Try resonance field with safety nets
    try {
      const fieldResponse = await this.respondWithField(
        userId,
        userInput,
        context
      );

      // Coherence check
      if (this.safetyConfig.coherenceMonitoring) {
        if (!this.isCoherent(fieldResponse, userInput, context)) {
          console.warn('Coherence failure, falling back to traditional');
          this.metrics.coherenceFailures++;
          return this.respondTraditional(userInput, context);
        }
      }

      // Track success
      this.metrics.fieldResponsesServed++;
      return fieldResponse;

    } catch (error) {
      console.error('Resonance field error:', error);
      this.metrics.fieldErrors++;

      // Fallback to traditional
      if (this.safetyConfig.fallbackToTraditional) {
        return this.respondTraditional(userInput, context);
      }

      throw error;
    }
  }

  /**
   * Determine if this user/request should use resonance field
   */
  private shouldUseResonanceField(userId: string, context: any): boolean {
    // Phase disabled = no one gets field
    if (this.currentPhase === DeploymentPhase.DISABLED) {
      return false;
    }

    // Manual override (for testing)
    if (this.userOverrides.has(userId)) {
      return this.userOverrides.get(userId)!;
    }

    // Opt-in required?
    if (this.safetyConfig.requireExplicitOptIn) {
      return context.userOptedIntoResonance === true;
    }

    // First-time user protection
    if (this.safetyConfig.firstTimeUserProtection && context.isFirstSession) {
      return false;
    }

    // Escape hatch triggered?
    if (this.safetyConfig.escapeHatchEnabled) {
      if (this.isEscapeHatchTrigger(context.userInput)) {
        return false;
      }
    }

    // Phase-based probability
    return this.rolloutPercentage(userId);
  }

  /**
   * Rollout percentage by phase
   */
  private rolloutPercentage(userId: string): boolean {
    const thresholds = {
      [DeploymentPhase.DISABLED]: 0,
      [DeploymentPhase.INTERNAL_TEST]: 0,  // Explicit opt-in only
      [DeploymentPhase.TRUSTED_TESTERS]: 0, // Explicit opt-in only
      [DeploymentPhase.SOFT_LAUNCH]: 0.05,   // 5%
      [DeploymentPhase.EXPANDED]: 0.10,      // 10%
      [DeploymentPhase.MAJORITY]: 0.50,      // 50%
      [DeploymentPhase.FULL_DEPLOY]: 1.0     // 100%
    };

    const threshold = thresholds[this.currentPhase];

    // Consistent user hashing (same user always gets same result)
    const hash = this.hashUserId(userId);
    return hash < threshold;
  }

  /**
   * Respond with resonance field (with strength modulation)
   */
  private async respondWithField(
    userId: string,
    userInput: string,
    context: any
  ): Promise<MaiaResponse> {
    // Get field response
    const fieldResult = await this.resonanceSystem.respond(userInput, context);

    // Modulate field strength based on phase
    const modulated = this.modulateFieldStrength(fieldResult);

    return {
      response: modulated.response,
      timing: modulated.timing,
      metadata: {
        source: 'resonance-field',
        phase: this.currentPhase,
        fieldStrength: this.fieldStrength,
        field: modulated.field
      }
    };
  }

  /**
   * Modulate field strength (blend with traditional at low strength)
   */
  private modulateFieldStrength(fieldResult: any): any {
    const strength = this.fieldStrength;

    // If field says silence but strength is low, maybe give minimal response
    if (fieldResult.response === null) {
      if (Math.random() > strength.silenceAllowed) {
        // Override silence with minimal traditional response
        return {
          response: "Mm.",
          timing: fieldResult.timing,
          field: fieldResult.field
        };
      }
    }

    // Modulate timing variance
    const modulatedTiming = {
      delay: fieldResult.timing.delay * strength.timingVariance +
             800 * (1 - strength.timingVariance), // Blend with standard delay
      pauseAfter: fieldResult.timing.pauseAfter * strength.timingVariance +
                  1000 * (1 - strength.timingVariance)
    };

    // If vocabulary constraint is low, allow occasional longer responses
    if (fieldResult.response && Math.random() > strength.vocabularyConstraint) {
      // Mix in traditional response elements
      // (This is a placeholder - actual implementation would blend properly)
    }

    return {
      response: fieldResult.response,
      timing: modulatedTiming,
      field: fieldResult.field
    };
  }

  /**
   * Traditional system response (fallback)
   */
  private async respondTraditional(
    userInput: string,
    context: any
  ): Promise<MaiaResponse> {
    // Call your existing Maia system
    // Placeholder - integrate with actual system
    const response = await this.traditionalSystem?.respond(userInput, context);

    this.metrics.traditionalResponsesServed++;

    return {
      response: response || "I'm here.",
      timing: { delay: 1000, pauseAfter: 1000 },
      metadata: { source: 'traditional' }
    };
  }

  /**
   * Check if response is coherent (not nonsense)
   */
  private isCoherent(
    response: MaiaResponse,
    userInput: string,
    context: any
  ): boolean {
    // If silence, that's always coherent
    if (response.response === null) {
      return true;
    }

    // Check for basic coherence rules
    const text = response.response;

    // Not empty
    if (!text || text.trim().length === 0) {
      return false;
    }

    // Not random gibberish
    if (text.length > 2 && !/[aeiou]/i.test(text)) {
      // No vowels = probably gibberish
      return false;
    }

    // Not repeating same word 3+ times
    const words = text.split(' ');
    const uniqueWords = new Set(words);
    if (words.length >= 3 && uniqueWords.size === 1) {
      return false;
    }

    // Context-appropriate length
    if (text.length > 50 && this.fieldStrength.vocabularyConstraint > 0.7) {
      // Field should be constraining to short, but got long
      return false;
    }

    return true;
  }

  /**
   * Detect escape hatch triggers
   */
  private isEscapeHatchTrigger(userInput: string): boolean {
    const triggers = [
      /^help$/i,
      /^explain/i,
      /^what are you doing/i,
      /^this isn't working/i,
      /^give me more detail/i,
      /^be more clear/i
    ];

    return triggers.some(pattern => pattern.test(userInput));
  }

  /**
   * Get field strength configuration for phase
   */
  private getFieldStrengthForPhase(phase: DeploymentPhase): FieldStrength {
    const configs: Record<DeploymentPhase, FieldStrength> = {
      [DeploymentPhase.DISABLED]: {
        elementalInfluence: 0,
        silenceAllowed: 0,
        timingVariance: 0,
        vocabularyConstraint: 0
      },
      [DeploymentPhase.INTERNAL_TEST]: {
        elementalInfluence: 0.3,  // Gentle influence
        silenceAllowed: 0.2,      // Max 20% silence
        timingVariance: 0.3,      // Some timing variation
        vocabularyConstraint: 0.5 // Loose palette constraint
      },
      [DeploymentPhase.TRUSTED_TESTERS]: {
        elementalInfluence: 0.5,
        silenceAllowed: 0.3,
        timingVariance: 0.5,
        vocabularyConstraint: 0.7
      },
      [DeploymentPhase.SOFT_LAUNCH]: {
        elementalInfluence: 0.6,
        silenceAllowed: 0.25,      // Conservative for general users
        timingVariance: 0.6,
        vocabularyConstraint: 0.75
      },
      [DeploymentPhase.EXPANDED]: {
        elementalInfluence: 0.7,
        silenceAllowed: 0.3,
        timingVariance: 0.7,
        vocabularyConstraint: 0.8
      },
      [DeploymentPhase.MAJORITY]: {
        elementalInfluence: 0.85,
        silenceAllowed: 0.4,
        timingVariance: 0.85,
        vocabularyConstraint: 0.9
      },
      [DeploymentPhase.FULL_DEPLOY]: {
        elementalInfluence: 1.0,  // Full field influence
        silenceAllowed: 0.6,      // Up to 60% silence in intimate moments
        timingVariance: 1.0,
        vocabularyConstraint: 1.0
      }
    };

    return configs[phase];
  }

  /**
   * Get safety configuration for phase
   */
  private getSafetyConfigForPhase(phase: DeploymentPhase): SafetyConfig {
    const configs: Record<DeploymentPhase, SafetyConfig> = {
      [DeploymentPhase.DISABLED]: {
        fallbackToTraditional: true,
        requireExplicitOptIn: false,
        firstTimeUserProtection: true,
        coherenceMonitoring: false,
        escapeHatchEnabled: false
      },
      [DeploymentPhase.INTERNAL_TEST]: {
        fallbackToTraditional: true,
        requireExplicitOptIn: true,  // You manually enable
        firstTimeUserProtection: false,
        coherenceMonitoring: true,
        escapeHatchEnabled: true
      },
      [DeploymentPhase.TRUSTED_TESTERS]: {
        fallbackToTraditional: true,
        requireExplicitOptIn: true,
        firstTimeUserProtection: false,
        coherenceMonitoring: true,
        escapeHatchEnabled: true
      },
      [DeploymentPhase.SOFT_LAUNCH]: {
        fallbackToTraditional: true,
        requireExplicitOptIn: false,  // Random 5% get it
        firstTimeUserProtection: true, // Protect new users
        coherenceMonitoring: true,
        escapeHatchEnabled: true
      },
      [DeploymentPhase.EXPANDED]: {
        fallbackToTraditional: true,
        requireExplicitOptIn: false,
        firstTimeUserProtection: true,
        coherenceMonitoring: true,
        escapeHatchEnabled: true
      },
      [DeploymentPhase.MAJORITY]: {
        fallbackToTraditional: true,
        requireExplicitOptIn: false,
        firstTimeUserProtection: false, // Most users ready
        coherenceMonitoring: false,     // Proven stable
        escapeHatchEnabled: true
      },
      [DeploymentPhase.FULL_DEPLOY]: {
        fallbackToTraditional: false,   // Field is primary
        requireExplicitOptIn: false,
        firstTimeUserProtection: false,
        coherenceMonitoring: false,
        escapeHatchEnabled: true
      }
    };

    return configs[phase];
  }

  /**
   * Manual overrides for testing
   */
  enableFieldForUser(userId: string) {
    this.userOverrides.set(userId, true);
  }

  disableFieldForUser(userId: string) {
    this.userOverrides.set(userId, false);
  }

  /**
   * Phase progression
   */
  advancePhase() {
    if (this.currentPhase < DeploymentPhase.FULL_DEPLOY) {
      this.currentPhase++;
      this.fieldStrength = this.getFieldStrengthForPhase(this.currentPhase);
      this.safetyConfig = this.getSafetyConfigForPhase(this.currentPhase);
      console.log(`Advanced to phase ${DeploymentPhase[this.currentPhase]}`);
    }
  }

  rollbackPhase() {
    if (this.currentPhase > DeploymentPhase.DISABLED) {
      this.currentPhase--;
      this.fieldStrength = this.getFieldStrengthForPhase(this.currentPhase);
      this.safetyConfig = this.getSafetyConfigForPhase(this.currentPhase);
      console.log(`Rolled back to phase ${DeploymentPhase[this.currentPhase]}`);
    }
  }

  emergencyDisable() {
    this.currentPhase = DeploymentPhase.DISABLED;
    this.fieldStrength = this.getFieldStrengthForPhase(this.currentPhase);
    this.safetyConfig = this.getSafetyConfigForPhase(this.currentPhase);
    console.warn('EMERGENCY DISABLE: Resonance field deactivated');
  }

  /**
   * Metrics
   */
  getMetrics(): DeploymentMetrics {
    return { ...this.metrics };
  }

  resetMetrics() {
    this.metrics = this.initializeMetrics();
  }

  private initializeMetrics(): DeploymentMetrics {
    return {
      fieldResponsesServed: 0,
      traditionalResponsesServed: 0,
      coherenceFailures: 0,
      fieldErrors: 0,
      avgResponseLength: 0,
      silenceRate: 0
    };
  }

  /**
   * Consistent user ID hashing
   */
  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash) + userId.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash) / 2147483647; // Normalize to 0-1
  }
}

interface MaiaResponse {
  response: string | null;
  timing: {
    delay: number;
    pauseAfter: number;
  };
  metadata: any;
}

interface DeploymentMetrics {
  fieldResponsesServed: number;
  traditionalResponsesServed: number;
  coherenceFailures: number;
  fieldErrors: number;
  avgResponseLength: number;
  silenceRate: number;
}

/**
 * Usage Example
 */
export function setupPhasedDeployment() {
  const deployment = new PhasedFieldDeployment(DeploymentPhase.INTERNAL_TEST);

  // Enable for your test account
  deployment.enableFieldForUser('andrea-test-account');

  // Handle user request
  async function handleUserRequest(userId: string, input: string) {
    const response = await deployment.respond(userId, input, {
      isFirstSession: false,
      userOptedIntoResonance: false
    });

    console.log('Response:', response.response || '[silence]');
    console.log('Source:', response.metadata.source);
    console.log('Delay:', response.timing.delay + 'ms');

    // Check metrics periodically
    if (Math.random() < 0.1) { // 10% of requests
      const metrics = deployment.getMetrics();
      console.log('Metrics:', metrics);

      // Auto-rollback if too many failures
      if (metrics.coherenceFailures > metrics.fieldResponsesServed * 0.1) {
        console.warn('Too many coherence failures, rolling back');
        deployment.rollbackPhase();
      }
    }
  }

  return deployment;
}

export default PhasedFieldDeployment;