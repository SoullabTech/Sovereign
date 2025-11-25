// Preference Migration & Conflict Resolution for Beta Deployment
// Handles updates to defaults, preference conflicts, and user guidance

import { BetaUserPreferences } from './beta-user-controls';
import { getPreferencePersistence } from './preference-persistence';

interface MigrationPlan {
  userId: string;
  currentPreferences: BetaUserPreferences;
  recommendedChanges: Partial<BetaUserPreferences>;
  migrationReason: 'analytics_improvement' | 'safety_update' | 'feature_deprecation';
  userChoice: 'auto_migrate' | 'notify_and_wait' | 'preserve_current';
  rollbackAvailable: boolean;
}

interface PreferenceConflict {
  conflictType: 'performance' | 'logical' | 'user_experience';
  conflictingSettings: string[];
  resolution: 'prioritize_first' | 'disable_conflicting' | 'create_compromise' | 'user_choice';
  explanation: string;
  recommendation: string;
}

export class PreferenceMigrationManager {
  private rollbackHistory = new Map<string, BetaUserPreferences[]>();
  private conflictResolutions = new Map<string, PreferenceConflict[]>();

  // === MIGRATION PATHS ===
  planMigration(
    userId: string,
    newRecommendedDefaults: Partial<BetaUserPreferences>,
    reason: MigrationPlan['migrationReason']
  ): MigrationPlan {
    const current = getPreferencePersistence().loadUserPreferences(userId);
    if (!current) {
      // New user - no migration needed
      return {
        userId,
        currentPreferences: this.getDefaultPreferences(),
        recommendedChanges: newRecommendedDefaults,
        migrationReason: reason,
        userChoice: 'auto_migrate',
        rollbackAvailable: false
      };
    }

    // Analyze impact of changes
    const hasSignificantChanges = this.analyzeChangeImpact(current, newRecommendedDefaults);

    return {
      userId,
      currentPreferences: current,
      recommendedChanges: newRecommendedDefaults,
      migrationReason: reason,
      userChoice: hasSignificantChanges ? 'notify_and_wait' : 'auto_migrate',
      rollbackAvailable: true
    };
  }

  executeMigration(plan: MigrationPlan): {
    success: boolean;
    userMessage?: string;
    requiresUserAction: boolean;
  } {
    // Store rollback point
    this.createRollbackPoint(plan.userId, plan.currentPreferences);

    if (plan.userChoice === 'auto_migrate') {
      const migrated = this.mergePreferences(
        plan.currentPreferences,
        plan.recommendedChanges
      );

      getPreferencePersistence().saveUserPreferences(
        plan.userId,
        migrated,
        'account'
      );

      return {
        success: true,
        userMessage: this.generateMigrationMessage(plan.migrationReason, plan.recommendedChanges),
        requiresUserAction: false
      };
    }

    if (plan.userChoice === 'notify_and_wait') {
      return {
        success: false,
        userMessage: this.generateMigrationNotification(plan),
        requiresUserAction: true
      };
    }

    // Preserve current - no changes
    return {
      success: true,
      requiresUserAction: false
    };
  }

  // === PREFERENCE CONFLICT RESOLUTION ===
  detectAndResolveConflicts(preferences: BetaUserPreferences): {
    resolvedPreferences: BetaUserPreferences;
    conflicts: PreferenceConflict[];
    userGuidance: string[];
  } {
    const conflicts: PreferenceConflict[] = [];
    const guidance: string[] = [];
    let resolved = { ...preferences };

    // Conflict 1: Fast speed + Deep features
    if (preferences.conversationStyle.responseSpeed === 'fastest' &&
        (preferences.features.loopingProtocol === 'full' ||
         preferences.conversationStyle.witnessingDepth === 'deep')) {

      const conflict: PreferenceConflict = {
        conflictType: 'performance',
        conflictingSettings: ['responseSpeed: fastest', 'loopingProtocol: full', 'witnessingDepth: deep'],
        resolution: 'create_compromise',
        explanation: 'Fastest speed conflicts with deep processing features',
        recommendation: 'Use balanced speed with light looping for optimal experience'
      };

      conflicts.push(conflict);

      // Apply compromise
      resolved.conversationStyle.responseSpeed = 'balanced';
      resolved.features.loopingProtocol = 'light';
      guidance.push('⚡ Adjusted to balanced speed for better integration with deep features');
    }

    // Conflict 2: Pure witness + Active support directiveness
    if (preferences.conversationStyle.directiveness === 'pure-witness' &&
        preferences.conversationStyle.witnessingDepth === 'surface') {

      const conflict: PreferenceConflict = {
        conflictType: 'logical',
        conflictingSettings: ['directiveness: pure-witness', 'witnessingDepth: surface'],
        resolution: 'prioritize_first',
        explanation: 'Pure witnessing requires depth to be meaningful',
        recommendation: 'Pure witness works best with moderate or deep witnessing'
      };

      conflicts.push(conflict);
      resolved.conversationStyle.witnessingDepth = 'moderate';
      guidance.push('🎯 Enhanced witnessing depth for more meaningful pure witness experience');
    }

    // Conflict 3: Accessibility conflicts
    if (preferences.accessibility.processingStyle === 'adhd' &&
        preferences.accessibility.pauseTolerance === 'extended') {

      const conflict: PreferenceConflict = {
        conflictType: 'user_experience',
        conflictingSettings: ['processingStyle: adhd', 'pauseTolerance: extended'],
        resolution: 'create_compromise',
        explanation: 'ADHD-friendly processing typically benefits from shorter pauses',
        recommendation: 'Use moderate pause tolerance with ADHD-friendly processing'
      };

      conflicts.push(conflict);
      resolved.accessibility.pauseTolerance = 'moderate';
      guidance.push('🧠 Optimized pause timing for ADHD-friendly processing');
    }

    // Conflict 4: Too many features at once (cognitive overload)
    const activeFeatureCount = Object.values(resolved.features)
      .filter(feature => feature === true || (typeof feature === 'string' && feature !== 'off'))
      .length;

    if (activeFeatureCount > 3 && resolved.accessibility.sensoryIntensity > 7) {
      const conflict: PreferenceConflict = {
        conflictType: 'user_experience',
        conflictingSettings: ['multiple active features', 'high sensory intensity'],
        resolution: 'disable_conflicting',
        explanation: 'Too many active features with high sensory intensity can be overwhelming',
        recommendation: 'Reduce feature complexity or lower sensory intensity'
      };

      conflicts.push(conflict);
      resolved.accessibility.sensoryIntensity = Math.min(5, resolved.accessibility.sensoryIntensity);
      guidance.push('🌟 Reduced sensory intensity to balance multiple active features');
    }

    this.conflictResolutions.set(preferences.experienceTier, conflicts);

    return {
      resolvedPreferences: resolved,
      conflicts,
      userGuidance: guidance
    };
  }

  // === ROLLBACK SYSTEM ===
  createRollbackPoint(userId: string, preferences: BetaUserPreferences): void {
    const history = this.rollbackHistory.get(userId) || [];
    history.push(preferences);

    // Keep last 5 rollback points
    if (history.length > 5) {
      history.shift();
    }

    this.rollbackHistory.set(userId, history);
    console.log(`💾 Rollback point created for ${userId.slice(0, 8)}`);
  }

  rollbackPreferences(userId: string, stepsBack: number = 1): {
    success: boolean;
    rolledBackTo: BetaUserPreferences | null;
    message: string;
  } {
    const history = this.rollbackHistory.get(userId);
    if (!history || history.length === 0) {
      return {
        success: false,
        rolledBackTo: null,
        message: 'No rollback history available'
      };
    }

    const targetIndex = Math.max(0, history.length - stepsBack - 1);
    const target = history[targetIndex];

    getPreferencePersistence().saveUserPreferences(userId, target, 'account');

    return {
      success: true,
      rolledBackTo: target,
      message: `Preferences restored to ${stepsBack} step${stepsBack > 1 ? 's' : ''} back`
    };
  }

  getAvailableRollbacks(userId: string): Array<{
    timestamp: number;
    description: string;
    stepsBack: number;
  }> {
    const history = this.rollbackHistory.get(userId) || [];

    return history.map((prefs, index) => ({
      timestamp: Date.now() - (history.length - index) * 5 * 60 * 1000, // Approximate
      description: this.describePreferenceSet(prefs),
      stepsBack: history.length - index
    }));
  }

  // === GUIDED PREFERENCE SETUP ===
  generateSmartDefaults(
    userBehaviorHints: {
      sessionLength: number;
      messageComplexity: number;
      interruptionFrequency: number;
      feedbackPatterns: string[];
    }
  ): BetaUserPreferences {
    let defaults = this.getDefaultPreferences();

    // Quick users (short sessions, simple messages)
    if (userBehaviorHints.sessionLength < 5 * 60 * 1000 &&
        userBehaviorHints.messageComplexity < 0.3) {
      defaults.experienceTier = 'gentle';
      defaults.conversationStyle.responseSpeed = 'fastest';
      defaults.features.loopingProtocol = 'off';
    }

    // Deep processors (long sessions, complex messages)
    if (userBehaviorHints.sessionLength > 15 * 60 * 1000 &&
        userBehaviorHints.messageComplexity > 0.7) {
      defaults.experienceTier = 'mystical';
      defaults.conversationStyle.responseSpeed = 'thorough';
      defaults.features.loopingProtocol = 'full';
      defaults.features.morphicField = true;
    }

    // Easily interrupted (frequent tab switching, etc.)
    if (userBehaviorHints.interruptionFrequency > 0.5) {
      defaults.accessibility.processingStyle = 'adhd';
      defaults.accessibility.pauseTolerance = 'minimal';
    }

    return defaults;
  }

  // === FEATURE BUNDLING ===
  createFeatureBundles(): Record<string, {
    name: string;
    description: string;
    features: Partial<BetaUserPreferences>;
    suitableFor: string[];
  }> {
    return {
      'quick-support': {
        name: 'Quick Support',
        description: 'Fast, direct responses with essential features',
        features: {
          conversationStyle: {
            responseSpeed: 'fastest',
            witnessingDepth: 'surface',
            directiveness: 'active-support'
          },
          features: {
            loopingProtocol: 'off',
            contemplativeSpace: false,
            elementalResonance: true,
            morphicField: false,
            storyWeaving: false
          }
        },
        suitableFor: ['busy professionals', 'quick check-ins', 'practical questions']
      },

      'deep-witness': {
        name: 'Deep Witnessing',
        description: 'Spacious, contemplative presence with all witnessing features',
        features: {
          conversationStyle: {
            responseSpeed: 'thorough',
            witnessingDepth: 'deep',
            directiveness: 'pure-witness'
          },
          features: {
            loopingProtocol: 'light',
            contemplativeSpace: true,
            elementalResonance: true,
            morphicField: true,
            storyWeaving: false
          }
        },
        suitableFor: ['therapeutic processing', 'spiritual exploration', 'grief work']
      },

      'neurodiverse-friendly': {
        name: 'Neurodiversity Support',
        description: 'Optimized for ADHD, autism, and processing differences',
        features: {
          conversationStyle: {
            responseSpeed: 'balanced',
            witnessingDepth: 'moderate',
            directiveness: 'gentle-guidance'
          },
          accessibility: {
            processingStyle: 'custom',
            pauseTolerance: 'minimal',
            sensoryIntensity: 3
          },
          features: {
            loopingProtocol: 'light',
            contemplativeSpace: false,
            elementalResonance: true,
            morphicField: false,
            storyWeaving: false
          }
        },
        suitableFor: ['ADHD users', 'autism spectrum', 'sensory sensitivity']
      }
    };
  }

  // === UTILITY METHODS ===
  private analyzeChangeImpact(
    current: BetaUserPreferences,
    changes: Partial<BetaUserPreferences>
  ): boolean {
    // Significant if core experience tier changes or multiple features change
    const tierChange = changes.experienceTier && changes.experienceTier !== current.experienceTier;
    const featureChanges = changes.features ? Object.keys(changes.features).length : 0;

    return tierChange || featureChanges > 2;
  }

  private mergePreferences(
    current: BetaUserPreferences,
    changes: Partial<BetaUserPreferences>
  ): BetaUserPreferences {
    return {
      ...current,
      ...changes,
      features: { ...current.features, ...changes.features },
      conversationStyle: { ...current.conversationStyle, ...changes.conversationStyle },
      accessibility: { ...current.accessibility, ...changes.accessibility },
      betaFeatures: { ...current.betaFeatures, ...changes.betaFeatures }
    };
  }

  private generateMigrationMessage(
    reason: MigrationPlan['migrationReason'],
    changes: Partial<BetaUserPreferences>
  ): string {
    const changeCount = Object.keys(changes).length;

    switch (reason) {
      case 'analytics_improvement':
        return `✨ Updated your preferences based on what works best for users like you (${changeCount} improvements)`;
      case 'safety_update':
        return `🛡️ Enhanced safety features in your preferences (${changeCount} updates)`;
      case 'feature_deprecation':
        return `🔄 Migrated your preferences to new feature options (${changeCount} changes)`;
      default:
        return `🔧 Updated your preferences (${changeCount} changes)`;
    }
  }

  private generateMigrationNotification(plan: MigrationPlan): string {
    return `We've improved the default experience based on user feedback. ` +
           `Would you like to update your preferences, or keep your current settings? ` +
           `You can always rollback if you don't like the changes.`;
  }

  private describePreferenceSet(prefs: BetaUserPreferences): string {
    return `${prefs.experienceTier} tier, ${prefs.conversationStyle.responseSpeed} speed`;
  }

  private getDefaultPreferences(): BetaUserPreferences {
    return {
      experienceTier: 'auto',
      features: {
        loopingProtocol: 'auto',
        contemplativeSpace: true,
        storyWeaving: false,
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
}

let _migrationManager: PreferenceMigrationManager | null = null;
export const getMigrationManager = (): PreferenceMigrationManager => {
  if (!_migrationManager) {
    _migrationManager = new PreferenceMigrationManager();
  }
  return _migrationManager;
};