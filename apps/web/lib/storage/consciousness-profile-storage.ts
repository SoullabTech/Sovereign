/**
 * CONSCIOUSNESS PROFILE STORAGE
 *
 * Tracks user consciousness levels, preferences, and progression.
 * Currently in-memory; will be replaced with database in production.
 *
 * Kelly's Vision: "Track without surveillance. Serve growth, not metrics."
 */

import { ConsciousnessLevel, UserConsciousnessProfile } from '../consciousness/ConsciousnessLevelDetector';

export interface JourneyProgression {
  userId: string;
  snapshots: JourneySnapshot[];
  totalSnapshots: number;
  coherenceHistory: number[];
  coherenceTrend: 'ascending' | 'descending' | 'stable';
  lastUpdated: Date;
}

export interface JourneySnapshot {
  timestamp: Date;
  sessionId?: string;
  coherence: number;
  elementalBalance: {
    fire: number;
    water: number;
    earth: number;
    air: number;
    aether: number;
  };
  alchemicalStage: string;
  archetypes: string[];
}

export interface UserMetadata {
  userId: string;
  role?: 'advocate' | 'elder' | 'member';
  completedMissions: number;
  completedRituals: number;
  teachesOthers: boolean;
  joinedAt: Date;
  lastActive: Date;
}

/**
 * In-memory storage for consciousness profiles
 */
class ConsciousnessProfileStorage {
  private profiles: Map<string, UserConsciousnessProfile>;
  private journeys: Map<string, JourneyProgression>;
  private metadata: Map<string, UserMetadata>;

  constructor() {
    this.profiles = new Map();
    this.journeys = new Map();
    this.metadata = new Map();
  }

  // ===== PROFILE MANAGEMENT =====

  /**
   * Save or update user consciousness profile
   */
  saveProfile(profile: UserConsciousnessProfile): void {
    this.profiles.set(profile.userId, {
      ...profile,
      lastUpdated: new Date()
    });
  }

  /**
   * Get user consciousness profile
   */
  getProfile(userId: string): UserConsciousnessProfile | null {
    return this.profiles.get(userId) || null;
  }

  /**
   * Update specific preferences for a user
   */
  updatePreferences(userId: string, updates: Partial<UserConsciousnessProfile>): void {
    const existing = this.getProfile(userId);

    if (existing) {
      this.saveProfile({
        ...existing,
        ...updates,
        lastUpdated: new Date()
      });
    } else {
      // Create new profile with defaults
      this.saveProfile({
        userId,
        detectedLevel: 1,
        effectiveLevel: 1,
        metrics: {
          daysActive: 0,
          journalEntries: 0,
          completedMissions: 0,
          completedRituals: 0,
          coherenceTrend: 'stable',
          currentCoherence: 0.5,
          usedConsciousnessLanguage: false,
          teachesOthers: false,
          isAdvocate: false,
          isElder: false
        },
        frameworksIntroduced: [],
        frameworksMastered: [],
        languagePreference: 'auto',
        explainFrameworks: true,
        progressiveEducation: true,
        lastUpdated: new Date(),
        ...updates
      });
    }
  }

  // ===== JOURNEY TRACKING =====

  /**
   * Get journey progression data
   */
  getJourney(userId: string): JourneyProgression | null {
    return this.journeys.get(userId) || null;
  }

  /**
   * Add a journey snapshot
   */
  addJourneySnapshot(userId: string, snapshot: JourneySnapshot): void {
    const existing = this.journeys.get(userId);

    if (existing) {
      // Add snapshot to existing journey
      existing.snapshots.push(snapshot);
      existing.totalSnapshots++;
      existing.coherenceHistory.push(snapshot.coherence);
      existing.coherenceTrend = this.calculateCoherenceTrend(existing.coherenceHistory);
      existing.lastUpdated = new Date();

      this.journeys.set(userId, existing);
    } else {
      // Create new journey
      this.journeys.set(userId, {
        userId,
        snapshots: [snapshot],
        totalSnapshots: 1,
        coherenceHistory: [snapshot.coherence],
        coherenceTrend: 'stable',
        lastUpdated: new Date()
      });
    }
  }

  /**
   * Calculate trend from coherence history
   */
  private calculateCoherenceTrend(history: number[]): 'ascending' | 'descending' | 'stable' {
    if (history.length < 3) return 'stable';

    const recent = history.slice(-5); // Last 5 snapshots
    const avg = recent.reduce((sum, val) => sum + val, 0) / recent.length;

    const older = history.slice(-10, -5);
    if (older.length === 0) return 'stable';

    const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;

    const diff = avg - olderAvg;

    if (diff > 0.1) return 'ascending';
    if (diff < -0.1) return 'descending';
    return 'stable';
  }

  // ===== METADATA MANAGEMENT =====

  /**
   * Get user metadata
   */
  getMetadata(userId: string): UserMetadata | null {
    return this.metadata.get(userId) || null;
  }

  /**
   * Save or update user metadata
   */
  saveMetadata(metadata: UserMetadata): void {
    this.metadata.set(metadata.userId, {
      ...metadata,
      lastActive: new Date()
    });
  }

  /**
   * Update mission count
   */
  incrementMissions(userId: string): void {
    const meta = this.getMetadata(userId) || this.createDefaultMetadata(userId);
    meta.completedMissions++;
    this.saveMetadata(meta);
  }

  /**
   * Update ritual count
   */
  incrementRituals(userId: string): void {
    const meta = this.getMetadata(userId) || this.createDefaultMetadata(userId);
    meta.completedRituals++;
    this.saveMetadata(meta);
  }

  /**
   * Update user role
   */
  updateRole(userId: string, role: 'advocate' | 'elder' | 'member'): void {
    const meta = this.getMetadata(userId) || this.createDefaultMetadata(userId);
    meta.role = role;
    this.saveMetadata(meta);
  }

  /**
   * Create default metadata for new user
   */
  private createDefaultMetadata(userId: string): UserMetadata {
    return {
      userId,
      completedMissions: 0,
      completedRituals: 0,
      teachesOthers: false,
      joinedAt: new Date(),
      lastActive: new Date()
    };
  }

  // ===== ANALYTICS =====

  /**
   * Get system-wide statistics
   */
  getSystemStats(): {
    totalUsers: number;
    levelDistribution: Record<ConsciousnessLevel, number>;
    averageCoherence: number;
    activeLastWeek: number;
  } {
    const profiles = Array.from(this.profiles.values());
    const journeys = Array.from(this.journeys.values());

    const levelDistribution: Record<ConsciousnessLevel, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    };

    profiles.forEach(profile => {
      levelDistribution[profile.effectiveLevel]++;
    });

    const totalCoherence = journeys.reduce((sum, j) => {
      const lastCoherence = j.coherenceHistory[j.coherenceHistory.length - 1] || 0;
      return sum + lastCoherence;
    }, 0);

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activeLastWeek = journeys.filter(j => j.lastUpdated > weekAgo).length;

    return {
      totalUsers: profiles.length,
      levelDistribution,
      averageCoherence: journeys.length > 0 ? totalCoherence / journeys.length : 0,
      activeLastWeek
    };
  }

  /**
   * Clear all data (for testing)
   */
  clear(): void {
    this.profiles.clear();
    this.journeys.clear();
    this.metadata.clear();
  }
}

// Export singleton instance
export const consciousnessProfileStorage = new ConsciousnessProfileStorage();
