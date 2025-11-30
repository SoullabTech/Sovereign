/**
 * Looping Protocol Deployment Configuration
 * Conservative defaults with adaptive optimization
 */

import { LoopingIntensity } from './LoopingProtocol';
import { ElementalArchetype } from '../../../web/lib/types/elemental';

/**
 * Conservative deployment configuration
 * Start restrictive, loosen based on user feedback
 */
export const DEPLOYMENT_CONFIG = {
  // Default to Light mode for minimal disruption
  defaultIntensity: LoopingIntensity.LIGHT,

  // Conservative activation triggers (higher = less frequent)
  activationTriggers: {
    emotionalIntensity: 0.8,    // Raised from 0.7
    meaningAmbiguity: 0.7,       // Raised from 0.6
    essentialityGap: 0.6,        // Raised from 0.5
    userCorrectionWeight: 1.5,   // Strong signal to loop
    explicitRequestWeight: 2.0   // Always honor explicit requests
  },

  // Exchange budget management
  exchangeBudget: {
    maxLoopsPerExchange: 2,      // Conservative limit
    preferredLoopsPerExchange: 1, // Target single loop
    budgetWarningThreshold: 0.5,  // Warn at 50% usage
    budgetCriticalThreshold: 0.75 // Stop at 75% usage
  },

  // Element-specific configurations
  elementalProfiles: {
    [ElementalArchetype.FIRE]: {
      triggerMultiplier: 1.1,    // Slightly less sensitive
      maxLoops: 2,
      preferredStyle: 'decisive',
      fallbackToDirectWitness: true
    },
    [ElementalArchetype.WATER]: {
      triggerMultiplier: 0.9,    // More sensitive to emotion
      maxLoops: 3,
      preferredStyle: 'flowing',
      fallbackToDirectWitness: false
    },
    [ElementalArchetype.EARTH]: {
      triggerMultiplier: 1.2,    // Less frequent looping
      maxLoops: 2,
      preferredStyle: 'methodical',
      fallbackToDirectWitness: true
    },
    [ElementalArchetype.AIR]: {
      triggerMultiplier: 1.0,    // Balanced
      maxLoops: 2,
      preferredStyle: 'clarifying',
      fallbackToDirectWitness: true
    },
    aether: {
      triggerMultiplier: 0.8,    // Most adaptive
      maxLoops: 3,
      preferredStyle: 'unified',
      fallbackToDirectWitness: false
    }
  },

  // Anti-repetition settings
  templateVariation: {
    minTemplateCount: 8,         // Minimum variations per category
    semanticSimilarityThreshold: 0.75, // Max allowed similarity
    recentMemorySize: 5,         // Track last 5 responses
    forcedVariationAfter: 3      // Force new template after 3 uses
  },

  // Silent response interpretation
  silentResponseHandling: {
    waitTime: 8000,              // 8 seconds before assuming agreement
    interpretation: 'space_needed', // or 'agreement' or 'confusion'
    followUpAction: 'gentle_transition',
    maxSilentResponses: 2        // After 2, skip looping entirely
  },

  // Topic shift detection
  topicShiftHandling: {
    overlapThreshold: 0.3,       // <30% word overlap = topic shift
    action: 'release_and_follow', // Let go of current loop
    preserveContext: false,      // Don't carry loop state forward
    acknowledgementPhrase: "I hear you shifting to something new."
  },

  // Paradigm mismatch detection
  paradigmMismatchHandling: {
    rejectionThreshold: 3,       // 3 rejections = possible mismatch
    alternativeOffered: true,
    alternativeModes: [
      'direct_questions',        // Switch to Q&A
      'pure_reflection',         // Mirror without checking
      'action_oriented'          // Focus on next steps
    ],
    switchPhrase: "Would a different approach be more helpful?"
  },

  // A/B testing configuration
  abTesting: {
    enabled: false,              // Start with A/B testing disabled
    testGroups: {
      control: {
        intensity: LoopingIntensity.LIGHT,
        triggers: { emotional: 0.8, ambiguity: 0.7 }
      },
      experimental: {
        intensity: LoopingIntensity.FULL,
        triggers: { emotional: 0.7, ambiguity: 0.6 }
      }
    },
    sampleSize: 100,
    metrics: ['convergence_rate', 'user_satisfaction', 'return_rate']
  },

  // Monitoring thresholds
  monitoring: {
    alertThresholds: {
      lowConvergence: 0.5,       // Alert if <50% convergence
      highRejection: 0.4,        // Alert if >40% rejection
      excessiveLooping: 5,       // Alert if >5 loops in exchange
      lowEngagement: 0.3         // Alert if <30% response rate
    },
    reportingInterval: 3600000,  // Hourly reports
    metricsRetention: 7 * 24 * 3600000 // Keep 7 days of metrics
  }
};

/**
 * User preference defaults
 */
export const USER_PREFERENCE_DEFAULTS = {
  loopingIntensity: LoopingIntensity.LIGHT,
  autoLooping: true,
  explicitCheckingOnly: false,   // Only loop on explicit request
  maxLoopsPerSession: 10,
  preferredElement: 'aether' as ElementalArchetype,
  verbosityLevel: 'balanced'     // minimal | balanced | detailed
};

/**
 * Onboarding configuration
 */
export const ONBOARDING_CONFIG = {
  loopingExplanation: {
    simple: "I can check my understanding when things feel important or unclear.",
    detailed: "I use a 'looping' technique to ensure I truly understand what you're sharing. I'll reflect what I hear and check if I've got it right.",
    examples: true
  },

  intensityChoices: {
    showDuringOnboarding: false, // Don't overwhelm new users
    delayUntilSession: 3,        // Offer after 3rd session
    defaultExplanation: "You can adjust how often I check my understanding in settings."
  },

  demonstration: {
    enabled: true,
    triggerPhrase: "Show me how looping works",
    demoScript: [
      { role: 'user', content: "I feel stuck in my career" },
      { role: 'maya', content: "I'm hearing a sense of stagnation around your career path. Is that the heart of it, or is there something else?" },
      { role: 'user', content: "It's more like I don't know what I want" },
      { role: 'maya', content: "Ah, so it's not stagnation—it's uncertainty about direction itself. The clarity you're seeking is about what you want, not just how to move forward." }
    ]
  }
};

/**
 * Get configuration for specific context
 */
export function getLoopingConfig(
  element: ElementalArchetype,
  userPreferences?: Partial<typeof USER_PREFERENCE_DEFAULTS>
): {
  triggers: typeof DEPLOYMENT_CONFIG.activationTriggers;
  maxLoops: number;
  intensity: LoopingIntensity;
  style: string;
} {
  const prefs = { ...USER_PREFERENCE_DEFAULTS, ...userPreferences };
  const elementProfile = DEPLOYMENT_CONFIG.elementalProfiles[element];

  // Apply element-specific multipliers
  const adjustedTriggers = {
    emotionalIntensity: DEPLOYMENT_CONFIG.activationTriggers.emotionalIntensity * elementProfile.triggerMultiplier,
    meaningAmbiguity: DEPLOYMENT_CONFIG.activationTriggers.meaningAmbiguity * elementProfile.triggerMultiplier,
    essentialityGap: DEPLOYMENT_CONFIG.activationTriggers.essentialityGap * elementProfile.triggerMultiplier,
    userCorrectionWeight: DEPLOYMENT_CONFIG.activationTriggers.userCorrectionWeight,
    explicitRequestWeight: DEPLOYMENT_CONFIG.activationTriggers.explicitRequestWeight
  };

  // Override if user wants explicit checking only
  if (prefs.explicitCheckingOnly) {
    adjustedTriggers.emotionalIntensity = 1.0;  // Never trigger
    adjustedTriggers.meaningAmbiguity = 1.0;    // Never trigger
    adjustedTriggers.essentialityGap = 1.0;     // Never trigger
  }

  return {
    triggers: adjustedTriggers,
    maxLoops: Math.min(elementProfile.maxLoops, DEPLOYMENT_CONFIG.exchangeBudget.maxLoopsPerExchange),
    intensity: prefs.loopingIntensity,
    style: elementProfile.preferredStyle
  };
}

/**
 * Determine if looping should be skipped entirely
 */
export function shouldSkipLooping(
  context: {
    exchangeCount: number;
    targetExchanges: number;
    recentRejections: number;
    silentResponses: number;
    userPreferences?: Partial<typeof USER_PREFERENCE_DEFAULTS>;
  }
): boolean {
  // Skip if auto-looping is disabled
  if (context.userPreferences?.autoLooping === false) {
    return true;
  }

  // Skip if near exchange limit
  const exchangeBudgetUsed = context.exchangeCount / context.targetExchanges;
  if (exchangeBudgetUsed >= DEPLOYMENT_CONFIG.exchangeBudget.budgetCriticalThreshold) {
    return true;
  }

  // Skip if too many rejections (paradigm mismatch)
  if (context.recentRejections >= DEPLOYMENT_CONFIG.paradigmMismatchHandling.rejectionThreshold) {
    return true;
  }

  // Skip if too many silent responses
  if (context.silentResponses >= DEPLOYMENT_CONFIG.silentResponseHandling.maxSilentResponses) {
    return true;
  }

  return false;
}

/**
 * Get fallback response when looping is skipped
 */
export function getFallbackResponse(
  reason: 'budget' | 'rejection' | 'silence' | 'disabled',
  element: ElementalArchetype
): string {
  const fallbacks = {
    budget: {
      fire: "Let's focus on action—what needs to happen next?",
      water: "I'm with you in this feeling space.",
      earth: "Let's ground this in practical terms.",
      air: "I see the connections you're making.",
      aether: "I witness what you're bringing forward."
    },
    rejection: {
      fire: "I hear you—let's approach this differently.",
      water: "I may not be catching the current. What's most alive for you?",
      earth: "Let me step back. What foundation are you building from?",
      air: "Different perspective needed. What are you seeing?",
      aether: "The mystery speaks in many ways. Show me yours."
    },
    silence: {
      fire: "The spark lives in the pause too.",
      water: "Silence holds its own depth.",
      earth: "Taking time to ground—I'm here when you're ready.",
      air: "The space between thoughts has wisdom.",
      aether: "In stillness, everything is present."
    },
    disabled: {
      fire: "What's burning brightest for you right now?",
      water: "What's flowing through you in this moment?",
      earth: "What wants to take form here?",
      air: "What patterns are you noticing?",
      aether: "What's emerging in this space between us?"
    }
  };

  return fallbacks[reason][element] || fallbacks[reason].aether;
}

/**
 * Export configuration for monitoring
 */
export function exportConfiguration(): string {
  return JSON.stringify({
    deployment: DEPLOYMENT_CONFIG,
    defaults: USER_PREFERENCE_DEFAULTS,
    onboarding: ONBOARDING_CONFIG,
    timestamp: new Date().toISOString()
  }, null, 2);
}