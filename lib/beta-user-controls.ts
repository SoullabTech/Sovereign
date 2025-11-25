// Beta User Control Panel - Advanced Options for System Behavior
// Gives power users control over activation logic and experience preferences

export interface BetaUserPreferences {
  // === CORE EXPERIENCE ===
  experienceTier: 'gentle' | 'deep' | 'mystical' | 'auto';

  // === FEATURE TOGGLES ===
  features: {
    loopingProtocol: 'off' | 'light' | 'full' | 'auto';
    contemplativeSpace: boolean;
    storyWeaving: boolean;
    elementalResonance: boolean;
    morphicField: boolean;  // Collective intelligence features
  };

  // === CONVERSATION STYLE ===
  conversationStyle: {
    responseSpeed: 'fastest' | 'balanced' | 'thorough';
    witnessingDepth: 'surface' | 'moderate' | 'deep';
    directiveness: 'pure-witness' | 'gentle-guidance' | 'active-support';
  };

  // === ACCESSIBILITY ===
  accessibility: {
    processingStyle: 'neurotypical' | 'adhd' | 'autism' | 'custom';
    pauseTolerance: 'minimal' | 'moderate' | 'extended';
    sensoryIntensity: number; // 1-10 scale
  };

  // === BETA TESTING ===
  betaFeatures: {
    showDebugInfo: boolean;
    reportingMode: 'passive' | 'active' | 'detailed';
    experimentalFeatures: boolean;
  };
}

export class BetaUserControlSystem {
  private userPreferences = new Map<string, BetaUserPreferences>();
  private betaFeatureFlags = new Map<string, boolean>();

  // === PREFERENCE MANAGEMENT ===
  setUserPreferences(userId: string, preferences: Partial<BetaUserPreferences>): void {
    const existing = this.getUserPreferences(userId);
    const updated = { ...existing, ...preferences };
    this.userPreferences.set(userId, updated);

    console.log(`🎛️ Beta user preferences updated for ${userId.slice(0, 8)}:`, preferences);
  }

  getUserPreferences(userId: string): BetaUserPreferences {
    return this.userPreferences.get(userId) || this.getDefaultPreferences();
  }

  private getDefaultPreferences(): BetaUserPreferences {
    return {
      experienceTier: 'auto',
      features: {
        loopingProtocol: 'auto',
        contemplativeSpace: true,
        storyWeaving: false, // Removed as requested
        elementalResonance: true,
        morphicField: false
      },
      conversationStyle: {
        responseSpeed: 'balanced',
        witnessingDepth: 'moderate',
        directiveness: 'gentle-guidance'
      },
      accessibility: {
        processingStyle: 'neurotypical',
        pauseTolerance: 'moderate',
        sensoryIntensity: 5
      },
      betaFeatures: {
        showDebugInfo: false,
        reportingMode: 'passive',
        experimentalFeatures: false
      }
    };
  }

  // === ACTIVATION LOGIC CUSTOMIZATION ===
  customizeActivationDecisions(
    userId: string,
    standardDecisions: any[],
    context: any
  ): any[] {
    const preferences = this.getUserPreferences(userId);

    return standardDecisions.map(decision => {
      return this.applyUserPreferences(decision, preferences, context);
    });
  }

  private applyUserPreferences(
    decision: any,
    preferences: BetaUserPreferences,
    context: any
  ): any {
    // Apply tier override
    if (preferences.preferredTier !== 'auto') {
      const tierFeatures = this.getTierFeatures(preferences.preferredTier);

      if (!tierFeatures.includes(decision.feature) &&
          preferences.tierOverrideMode === 'strict') {
        return { ...decision, confidence: 0.1, rationale: 'blocked by tier preference' };
      }
    }

    // Apply feature-specific preferences
    const featurePref = preferences.featurePreferences[decision.feature];
    if (featurePref) {
      const adjustment = this.getFeatureAdjustment(featurePref);
      decision.confidence = Math.max(0.1, Math.min(0.9, decision.confidence * adjustment));
      decision.rationale += ` (adjusted: ${featurePref} preference)`;
    }

    // Apply processing time preferences
    if (preferences.processingTimePreference === 'fast') {
      if (['looping_protocol', 'contemplative_space'].includes(decision.feature)) {
        decision.confidence *= 0.7; // Reduce slow features for fast preference
        decision.rationale += ' (reduced for speed preference)';
      }
    }

    return decision;
  }

  private getTierFeatures(tier: string): string[] {
    const tierMap = {
      elegant: ['elemental_attunement'],
      complete: ['elemental_attunement', 'contemplative_space', 'looping_protocol'],
      production: ['elemental_attunement', 'contemplative_space', 'looping_protocol', 'consciousness_profiling']
    };
    return tierMap[tier] || tierMap.complete;
  }

  private getFeatureAdjustment(preference: string): number {
    const adjustmentMap = {
      never: 0.1,
      light: 0.6,
      minimal: 0.6,
      basic: 0.7,
      normal: 1.0,
      balanced: 1.0,
      standard: 1.0,
      detailed: 1.2,
      aggressive: 1.4,
      generous: 1.3,
      deep: 1.5,
      sensitive: 1.2,
      hypervigilant: 1.6
    };
    return adjustmentMap[preference] || 1.0;
  }

  // === BETA TESTING FEATURES ===
  shouldShowExperimentalFeature(userId: string, featureFlag: string): boolean {
    const preferences = this.getUserPreferences(userId);

    if (!preferences.allowExperimentalFeatures) return false;

    return this.betaFeatureFlags.get(`${userId}:${featureFlag}`) || false;
  }

  enableBetaFeature(userId: string, featureFlag: string): void {
    this.betaFeatureFlags.set(`${userId}:${featureFlag}`, true);
    console.log(`🧪 Beta feature enabled: ${featureFlag} for ${userId.slice(0, 8)}`);
  }

  // === DEBUG & TRANSPARENCY OPTIONS ===
  generateDebugResponse(
    userId: string,
    standardResponse: string,
    activationData: any
  ): string {
    const preferences = this.getUserPreferences(userId);

    if (!preferences.debugMode && preferences.transitionStyle === 'invisible') {
      return standardResponse;
    }

    let debugInfo = '';

    // Add transition transparency
    if (preferences.transitionStyle === 'transparent' || preferences.transitionStyle === 'verbose') {
      debugInfo += this.generateTransitionExplanation(activationData, preferences.transitionStyle);
    }

    // Add debug information
    if (preferences.debugMode) {
      debugInfo += this.generateDebugInfo(activationData);
    }

    return debugInfo ? standardResponse + '\n\n' + debugInfo : standardResponse;
  }

  private generateTransitionExplanation(data: any, style: string): string {
    const features = data.activatedFeatures || [];

    if (features.length === 0) return '';

    if (style === 'transparent') {
      return `✨ *Drawing on ${features.join(', ').replace(/_/g, ' ')} for this response*`;
    }

    if (style === 'verbose') {
      return `🔧 **Technical Context**: Activated features: ${features.join(', ')}\n` +
             `💡 **Reasoning**: ${data.rationale || 'Standard activation pattern'}\n` +
             `⚡ **Processing**: ${data.processingTime || 'unknown'}ms`;
    }

    return '';
  }

  private generateDebugInfo(data: any): string {
    return `\n📊 **Debug Information**:\n` +
           `- Features: ${JSON.stringify(data.activatedFeatures)}\n` +
           `- Confidence scores: ${JSON.stringify(data.confidenceScores)}\n` +
           `- Conflicts resolved: ${data.conflictsResolved || 0}\n` +
           `- Processing time: ${data.processingTime}ms`;
  }

  // === USER FEEDBACK COLLECTION ===
  collectBetaFeedback(
    userId: string,
    feedbackType: 'activation' | 'transition' | 'response_quality' | 'bug_report',
    content: string,
    context?: any
  ): void {
    const preferences = this.getUserPreferences(userId);

    if (!preferences.provideDetailedFeedback) return;

    const feedback = {
      userId: userId.slice(0, 8) + '...',
      type: feedbackType,
      content,
      context: this.sanitizeContext(context),
      timestamp: Date.now(),
      userPreferences: preferences
    };

    console.log('📝 Beta feedback collected:', feedback);

    // In production, would send to feedback collection system
    this.storeBetaFeedback(feedback);
  }

  private sanitizeContext(context: any): any {
    if (!context) return null;

    return {
      activatedFeatures: context.activatedFeatures,
      processingTime: context.processingTime,
      transitionType: context.transitionType,
      // Remove any user content for privacy
      hasUserContent: !!context.userInput
    };
  }

  private storeBetaFeedback(feedback: any): void {
    // Placeholder for feedback storage system
    console.log('Feedback stored for analysis');
  }

  // === A/B TEST PARTICIPATION ===
  getABTestVariant(userId: string, testName: string): 'A' | 'B' | null {
    const preferences = this.getUserPreferences(userId);

    if (!preferences.participateInABTests) return null;

    // Simple hash-based assignment for consistent experience
    const hash = this.hashString(userId + testName);
    return hash % 2 === 0 ? 'A' : 'B';
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // === PREFERENCE PRESETS ===
  getPresetPreferences(presetName: string): Partial<BetaUserPreferences> {
    const presets = {
      'quick-checkin': {
        experienceTier: 'gentle' as const,
        conversationStyle: {
          responseSpeed: 'fastest' as const,
          witnessingDepth: 'surface' as const,
          directiveness: 'gentle-guidance' as const
        },
        features: {
          loopingProtocol: 'off' as const,
          contemplativeSpace: false,
          storyWeaving: false,
          elementalResonance: true,
          morphicField: false
        }
      },

      'therapeutic': {
        experienceTier: 'deep' as const,
        conversationStyle: {
          responseSpeed: 'balanced' as const,
          witnessingDepth: 'deep' as const,
          directiveness: 'pure-witness' as const
        },
        features: {
          loopingProtocol: 'full' as const,
          contemplativeSpace: true,
          storyWeaving: false,
          elementalResonance: true,
          morphicField: false
        }
      },

      'contemplative': {
        experienceTier: 'mystical' as const,
        conversationStyle: {
          responseSpeed: 'thorough' as const,
          witnessingDepth: 'deep' as const,
          directiveness: 'pure-witness' as const
        },
        features: {
          loopingProtocol: 'light' as const,
          contemplativeSpace: true,
          storyWeaving: false,
          elementalResonance: true,
          morphicField: true
        },
        accessibility: {
          pauseTolerance: 'extended' as const
        }
      },

      'experimental': {
        experienceTier: 'auto' as const,
        features: {
          loopingProtocol: 'auto' as const,
          contemplativeSpace: true,
          storyWeaving: false,
          elementalResonance: true,
          morphicField: true
        },
        betaFeatures: {
          showDebugInfo: true,
          reportingMode: 'detailed' as const,
          experimentalFeatures: true
        }
      }
    };

    return presets[presetName] || {};
  }
}

let _betaUserControls: BetaUserControlSystem | null = null;
export const getBetaUserControls = (): BetaUserControlSystem => {
  if (!_betaUserControls) {
    _betaUserControls = new BetaUserControlSystem();
  }
  return _betaUserControls;
};