// Preference Persistence & Conflict Resolution
// Handles session persistence, safety overrides, and analytics patterns

import { BetaUserPreferences } from './beta-user-controls';

interface PreferenceSession {
  userId: string;
  preferences: BetaUserPreferences;
  lastModified: number;
  sessionId: string;
  persistenceLevel: 'session' | 'account' | 'device';
}

interface SafetyOverride {
  feature: string;
  reason: 'crisis_detection' | 'safety_protocol' | 'system_stability';
  overriddenPreference: any;
  timestamp: number;
  acknowledged: boolean;
}

interface AdjustmentPattern {
  userId: string;
  adjustmentType: string;
  frequency: number;
  lastAdjustment: number;
  pattern: 'increasing' | 'decreasing' | 'oscillating' | 'stable';
  effectiveness: number; // 0-1 based on user satisfaction after adjustment
}

export class PreferencePersistenceManager {
  private sessionStorage = new Map<string, PreferenceSession>();
  private safetyOverrides = new Map<string, SafetyOverride[]>();
  private adjustmentPatterns = new Map<string, AdjustmentPattern[]>();

  // === PREFERENCE PERSISTENCE ===
  saveUserPreferences(
    userId: string,
    preferences: BetaUserPreferences,
    persistenceLevel: 'session' | 'account' | 'device' = 'session'
  ): void {
    const session: PreferenceSession = {
      userId,
      preferences,
      lastModified: Date.now(),
      sessionId: this.generateSessionId(),
      persistenceLevel
    };

    // Store in appropriate persistence layer
    switch (persistenceLevel) {
      case 'session':
        this.sessionStorage.set(userId, session);
        break;
      case 'account':
        this.saveToAccountStorage(session);
        break;
      case 'device':
        this.saveToDeviceStorage(session);
        break;
    }

    console.log(`💾 Preferences saved for ${userId.slice(0, 8)} (${persistenceLevel} level)`);
  }

  loadUserPreferences(userId: string): BetaUserPreferences | null {
    // Try session storage first (most recent)
    const sessionPrefs = this.sessionStorage.get(userId);
    if (sessionPrefs && this.isSessionValid(sessionPrefs)) {
      return sessionPrefs.preferences;
    }

    // Fall back to account storage
    const accountPrefs = this.loadFromAccountStorage(userId);
    if (accountPrefs) return accountPrefs.preferences;

    // Fall back to device storage
    const devicePrefs = this.loadFromDeviceStorage(userId);
    if (devicePrefs) return devicePrefs.preferences;

    return null; // No saved preferences found
  }

  // === SAFETY OVERRIDE SYSTEM ===
  applySafetyOverride(
    userId: string,
    feature: string,
    reason: SafetyOverride['reason'],
    originalPreference: any,
    safeValue: any
  ): {
    overrideApplied: boolean;
    safeValue: any;
    userNotification?: string;
  } {
    // Crisis detection always overrides user preferences
    if (reason === 'crisis_detection') {
      this.recordSafetyOverride(userId, feature, reason, originalPreference);

      return {
        overrideApplied: true,
        safeValue,
        userNotification: "I'm prioritizing your safety right now and temporarily adjusting how I respond."
      };
    }

    // Safety protocols override with user notification
    if (reason === 'safety_protocol') {
      this.recordSafetyOverride(userId, feature, reason, originalPreference);

      return {
        overrideApplied: true,
        safeValue,
        userNotification: "For your wellbeing, I've temporarily enabled additional support features."
      };
    }

    // System stability - inform but don't alarm
    if (reason === 'system_stability') {
      this.recordSafetyOverride(userId, feature, reason, originalPreference);

      return {
        overrideApplied: true,
        safeValue,
        userNotification: "Temporarily using simplified processing for optimal performance."
      };
    }

    return { overrideApplied: false, safeValue: originalPreference };
  }

  private recordSafetyOverride(
    userId: string,
    feature: string,
    reason: SafetyOverride['reason'],
    overriddenPreference: any
  ): void {
    const override: SafetyOverride = {
      feature,
      reason,
      overriddenPreference,
      timestamp: Date.now(),
      acknowledged: false
    };

    const userOverrides = this.safetyOverrides.get(userId) || [];
    userOverrides.push(override);
    this.safetyOverrides.set(userId, userOverrides);

    // Clean up old overrides (keep last 10)
    if (userOverrides.length > 10) {
      userOverrides.splice(0, userOverrides.length - 10);
    }
  }

  // === ADJUSTMENT PATTERN ANALYTICS ===
  trackAdjustmentPattern(
    userId: string,
    adjustmentType: string,
    userSatisfactionAfter: number
  ): void {
    const patterns = this.adjustmentPatterns.get(userId) || [];
    let pattern = patterns.find(p => p.adjustmentType === adjustmentType);

    if (!pattern) {
      pattern = {
        userId,
        adjustmentType,
        frequency: 0,
        lastAdjustment: Date.now(),
        pattern: 'stable',
        effectiveness: 0.5
      };
      patterns.push(pattern);
    }

    // Update pattern data
    pattern.frequency += 1;
    const timeSinceLastAdjustment = Date.now() - pattern.lastAdjustment;
    pattern.lastAdjustment = Date.now();

    // Update effectiveness (weighted average)
    pattern.effectiveness = (pattern.effectiveness * 0.7) + (userSatisfactionAfter * 0.3);

    // Determine adjustment pattern
    if (timeSinceLastAdjustment < 5 * 60 * 1000) { // Less than 5 minutes
      pattern.pattern = 'oscillating'; // Rapid back-and-forth adjustments
    } else if (pattern.frequency > 5) {
      pattern.pattern = 'increasing'; // Frequent adjustments
    } else {
      pattern.pattern = 'stable';
    }

    this.adjustmentPatterns.set(userId, patterns);

    // Generate insights for problematic patterns
    if (pattern.pattern === 'oscillating' && pattern.effectiveness < 0.4) {
      this.flagProblematicPattern(userId, adjustmentType, 'user_oscillating_low_satisfaction');
    }

    console.log(`📈 Adjustment pattern tracked: ${adjustmentType} for ${userId.slice(0, 8)} (effectiveness: ${Math.round(pattern.effectiveness * 100)}%)`);
  }

  private flagProblematicPattern(userId: string, adjustmentType: string, issueType: string): void {
    console.log(`⚠️ Problematic pattern detected: ${issueType} for ${userId.slice(0, 8)} with ${adjustmentType}`);

    // In production, this would trigger:
    // 1. UI guidance for the user
    // 2. Analytics alert for the team
    // 3. Possible automatic preset suggestion
  }

  // === ANALYTICS FOR FEATURE EFFECTIVENESS ===
  generateFeatureAnalytics(userId: string): {
    mostAdjustedFeatures: string[];
    effectiveAdjustments: string[];
    problematicCombinations: string[];
    recommendedDefaults: Partial<BetaUserPreferences>;
  } {
    const patterns = this.adjustmentPatterns.get(userId) || [];

    const mostAdjusted = patterns
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 3)
      .map(p => p.adjustmentType);

    const effective = patterns
      .filter(p => p.effectiveness > 0.7)
      .map(p => p.adjustmentType);

    const problematic = patterns
      .filter(p => p.pattern === 'oscillating' && p.effectiveness < 0.5)
      .map(p => p.adjustmentType);

    const recommendedDefaults = this.generateRecommendedDefaults(patterns);

    return {
      mostAdjustedFeatures: mostAdjusted,
      effectiveAdjustments: effective,
      problematicCombinations: problematic,
      recommendedDefaults
    };
  }

  private generateRecommendedDefaults(patterns: AdjustmentPattern[]): Partial<BetaUserPreferences> {
    const recommendations: Partial<BetaUserPreferences> = {};

    // Example logic: If user consistently adjusts speed to "fastest", recommend that as default
    const speedAdjustments = patterns.filter(p => p.adjustmentType.includes('speed'));
    if (speedAdjustments.length > 0 && speedAdjustments[0].effectiveness > 0.7) {
      recommendations.conversationStyle = {
        responseSpeed: 'fastest' as const,
        witnessingDepth: 'surface' as const,
        directiveness: 'gentle-guidance' as const
      };
    }

    // If user consistently disables looping, recommend that as default
    const loopingAdjustments = patterns.filter(p => p.adjustmentType.includes('looping'));
    if (loopingAdjustments.length > 0 && loopingAdjustments[0].effectiveness > 0.7) {
      recommendations.features = {
        loopingProtocol: 'off' as const,
        contemplativeSpace: true,
        storyWeaving: false,
        elementalResonance: true,
        morphicField: false
      };
    }

    return recommendations;
  }

  // === SYSTEM-WIDE INSIGHTS ===
  generateSystemInsights(): {
    globalPatterns: string[];
    featureUtilization: Record<string, number>;
    userSegments: string[];
    recommendedChanges: string[];
  } {
    const allPatterns = Array.from(this.adjustmentPatterns.values()).flat();

    // Most commonly adjusted features across all users
    const featureAdjustmentCounts = new Map<string, number>();
    allPatterns.forEach(pattern => {
      const count = featureAdjustmentCounts.get(pattern.adjustmentType) || 0;
      featureAdjustmentCounts.set(pattern.adjustmentType, count + pattern.frequency);
    });

    const globalPatterns = Array.from(featureAdjustmentCounts.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([feature]) => feature);

    // Feature utilization rates
    const featureUtilization = Object.fromEntries(featureAdjustmentCounts);

    return {
      globalPatterns,
      featureUtilization,
      userSegments: ['quick-users', 'depth-seekers', 'oscillating-users'],
      recommendedChanges: [
        'Consider making "fastest" the default speed',
        'Looping protocol causes frequent adjustments - consider lighter default',
        'Contemplative space is rarely disabled - good default'
      ]
    };
  }

  // === UTILITY METHODS ===
  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private isSessionValid(session: PreferenceSession): boolean {
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    return Date.now() - session.lastModified < maxAge;
  }

  private saveToAccountStorage(session: PreferenceSession): void {
    // In production: Save to user account database
    console.log(`💾 Account storage: ${session.userId.slice(0, 8)} preferences saved`);
  }

  private loadFromAccountStorage(userId: string): PreferenceSession | null {
    // In production: Load from user account database
    console.log(`📂 Account storage: Loading preferences for ${userId.slice(0, 8)}`);
    return null;
  }

  private saveToDeviceStorage(session: PreferenceSession): void {
    // In production: Save to localStorage/IndexedDB
    if (typeof window !== 'undefined') {
      localStorage.setItem(`spiralogic_prefs_${session.userId}`, JSON.stringify(session));
    }
  }

  private loadFromDeviceStorage(userId: string): PreferenceSession | null {
    // In production: Load from localStorage/IndexedDB
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`spiralogic_prefs_${userId}`);
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  }

  // === PREFERENCE MIGRATION ===
  migratePreferences(userId: string, oldVersion: number, newVersion: number): void {
    console.log(`🔄 Migrating preferences for ${userId.slice(0, 8)} from v${oldVersion} to v${newVersion}`);

    // Handle preference schema changes
    // This would include logic for migrating old preference structures to new ones
  }

  // === CLEANUP ===
  cleanupExpiredSessions(): void {
    const expired = [];
    for (const [userId, session] of this.sessionStorage.entries()) {
      if (!this.isSessionValid(session)) {
        expired.push(userId);
      }
    }

    expired.forEach(userId => {
      this.sessionStorage.delete(userId);
      console.log(`🗑️ Cleaned up expired session for ${userId.slice(0, 8)}`);
    });
  }
}

let _preferencePersistence: PreferencePersistenceManager | null = null;
export const getPreferencePersistence = (): PreferencePersistenceManager => {
  if (!_preferencePersistence) {
    _preferencePersistence = new PreferencePersistenceManager();
  }
  return _preferencePersistence;
};