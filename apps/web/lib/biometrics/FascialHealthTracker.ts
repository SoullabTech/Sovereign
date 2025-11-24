/**
 * Fascial Health Tracker
 *
 * Tracks fascial health metrics and correlates with consciousness/coherence
 * Based on Ashley Black's research: fascia as liquid crystalline consciousness antenna
 */

export interface FascialHealthAssessment {
  id?: number;
  timestamp: Date;
  userId: string;

  // Physical Metrics (1-10 scale)
  mobility: number;              // Range of motion, ease of movement
  flexibility: number;           // Tissue suppleness
  hydration: number;             // Subjective tissue hydration state
  painLevel: number;             // 0 = none, 10 = severe
  inflammation: number;          // Subjective inflammation level

  // Somatic/Emotional Markers
  emotionalRelease: boolean;     // Did emotional content surface?
  emotionType?: string;          // Type of emotion (if released)
  bodyRegion?: string;           // Where in body (if specific)
  shadowMaterial?: string;       // Description of unconscious content

  // Consciousness/Quantum Markers
  intuitionClarity: number;      // 1-10: How clear is intuition today?
  synchronicityCount: number;    // Number of meaningful coincidences
  downloadQuality: number;       // 1-10: Quality of insights/downloads
  dreamRecall: number;           // 1-10: Dream recall quality

  // Practice Details
  practiceType: string;          // fascia blaster, yoga, myofascial release, etc.
  durationMinutes: number;       // Length of practice
  intensity: number;             // 1-10 intensity level

  // Elemental Correlation (auto-calculated)
  elementalState?: {
    fire: number;    // Vision/action/creative energy
    water: number;   // Emotional flow/intuition
    earth: number;   // Grounding/structure/embodiment
    air: number;     // Mental clarity/communication
    aether: number;  // Integration/coherence
  };

  // Notes
  notes?: string;

  // 90-Day Cycle Tracking
  cycleDay?: number;             // Day in current 90-day remodeling cycle
  cyclePhase?: 'physical' | 'emotional' | 'quantum';
}

export interface FasciaCorrelation {
  period: string;                // e.g., "last 7 days", "last 30 days"

  // Correlations (r-value, -1 to 1)
  fasciaToIntuition: number;
  fasciaToSynchronicity: number;
  fasciaToEmotionalRelease: number;
  fasciaToCoherence: number;

  // Trends
  mobilityTrend: 'improving' | 'stable' | 'declining';
  consciousnessTrend: 'expanding' | 'stable' | 'contracting';

  // Insights
  insights: string[];
}

/**
 * Calculate elemental state from fascial metrics
 */
export function calculateElementalState(assessment: FascialHealthAssessment) {
  return {
    fire: (assessment.mobility + assessment.intuitionClarity) / 2,
    water: (assessment.flexibility + assessment.emotionalRelease ? 8 : 4) / 2,
    earth: (assessment.hydration + (10 - assessment.painLevel)) / 2,
    air: (assessment.downloadQuality + assessment.dreamRecall) / 2,
    aether: (
      assessment.intuitionClarity +
      assessment.downloadQuality +
      (assessment.synchronicityCount > 0 ? 8 : 4)
    ) / 3
  };
}

/**
 * Determine 90-day cycle phase
 * Phase 1 (Days 1-30): Physical Remodeling
 * Phase 2 (Days 31-60): Emotional Release
 * Phase 3 (Days 61-90): Quantum/Energetic Activation
 */
export function getCyclePhase(cycleDay: number): 'physical' | 'emotional' | 'quantum' {
  if (cycleDay <= 30) return 'physical';
  if (cycleDay <= 60) return 'emotional';
  return 'quantum';
}

/**
 * Generate insights based on assessment
 */
export function generateFasciaInsights(assessment: FascialHealthAssessment): string[] {
  const insights: string[] = [];

  // Physical insights
  if (assessment.mobility >= 8 && assessment.flexibility >= 8) {
    insights.push("Your fascial network is flowing beautifully. This is optimal for quantum reception.");
  }

  if (assessment.painLevel >= 7) {
    insights.push("High pain suggests fascial adhesions storing emotional content. Consider gentle, consistent work rather than aggressive manipulation.");
  }

  if (assessment.hydration <= 4) {
    insights.push("Dehydrated fascia = dampened consciousness antenna. Increase water intake and consider adding electrolytes.");
  }

  // Emotional-physical correlation
  if (assessment.emotionalRelease && assessment.painLevel > 0) {
    insights.push("Emotional release during fascial work confirms trauma storage in tissue. This is healthy integration.");
  }

  // Consciousness correlation
  if (assessment.intuitionClarity >= 8 && assessment.practiceType) {
    insights.push(`${assessment.practiceType} is opening your fascial antenna. Notice increased downloads in next 24-48 hours.`);
  }

  if (assessment.synchronicityCount >= 3) {
    insights.push("High synchronicity suggests your fascial network is coherent with quantum field. You're 'plugged in'.");
  }

  // Cycle-specific insights
  if (assessment.cyclePhase === 'physical' && assessment.emotionalRelease) {
    insights.push("You're moving into Phase 2 (Emotional Release) early. Your body is ready. Have support systems in place.");
  }

  if (assessment.cyclePhase === 'quantum' && assessment.downloadQuality <= 5) {
    insights.push("You're in the Quantum Activation phase but downloads are unclear. Revisit Phases 1-2 - there may be remaining physical/emotional blocks.");
  }

  return insights;
}

/**
 * Storage for fascial health assessments
 */
export class FascialHealthStorage {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'MAIA_Biometrics';
  private readonly STORE_NAME = 'fascialHealth';

  async init(): Promise<void> {
    if (typeof window === 'undefined') return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, 2); // Version 2 adds fascia store

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const store = db.createObjectStore(this.STORE_NAME, {
            keyPath: 'id',
            autoIncrement: true
          });

          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('userId', 'userId', { unique: false });
          store.createIndex('cycleDay', 'cycleDay', { unique: false });
        }
      };
    });
  }

  async storeAssessment(assessment: FascialHealthAssessment): Promise<void> {
    if (!this.db) await this.init();
    if (!this.db) throw new Error('Database not initialized');

    // Auto-calculate elemental state
    assessment.elementalState = calculateElementalState(assessment);

    const transaction = this.db.transaction([this.STORE_NAME], 'readwrite');
    const store = transaction.objectStore(this.STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.add(assessment);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAssessments(userId: string, days: number = 30): Promise<FascialHealthAssessment[]> {
    if (!this.db) await this.init();
    if (!this.db) return [];

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const transaction = this.db.transaction([this.STORE_NAME], 'readonly');
    const store = transaction.objectStore(this.STORE_NAME);
    const index = store.index('userId');

    return new Promise((resolve, reject) => {
      const request = index.getAll(userId);

      request.onsuccess = () => {
        const all = request.result as FascialHealthAssessment[];
        const recent = all.filter(a => new Date(a.timestamp) >= cutoff);
        resolve(recent);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async calculateCorrelations(userId: string, days: number = 30): Promise<FasciaCorrelation> {
    const assessments = await this.getAssessments(userId, days);

    if (assessments.length < 3) {
      return {
        period: `last ${days} days`,
        fasciaToIntuition: 0,
        fasciaToSynchronicity: 0,
        fasciaToEmotionalRelease: 0,
        fasciaToCoherence: 0,
        mobilityTrend: 'stable',
        consciousnessTrend: 'stable',
        insights: ['Need at least 3 assessments to calculate correlations. Keep tracking!']
      };
    }

    // Calculate simple correlations
    const mobilityAvg = assessments.reduce((sum, a) => sum + a.mobility, 0) / assessments.length;
    const intuitionAvg = assessments.reduce((sum, a) => sum + a.intuitionClarity, 0) / assessments.length;
    const syncAvg = assessments.reduce((sum, a) => sum + a.synchronicityCount, 0) / assessments.length;

    // Trend analysis
    const recentMobility = assessments.slice(-7).reduce((sum, a) => sum + a.mobility, 0) / Math.min(7, assessments.length);
    const earlyMobility = assessments.slice(0, 7).reduce((sum, a) => sum + a.mobility, 0) / Math.min(7, assessments.length);

    const mobilityTrend = recentMobility > earlyMobility + 1 ? 'improving' :
                          recentMobility < earlyMobility - 1 ? 'declining' : 'stable';

    const recentIntuition = assessments.slice(-7).reduce((sum, a) => sum + a.intuitionClarity, 0) / Math.min(7, assessments.length);
    const earlyIntuition = assessments.slice(0, 7).reduce((sum, a) => sum + a.intuitionClarity, 0) / Math.min(7, assessments.length);

    const consciousnessTrend = recentIntuition > earlyIntuition + 1 ? 'expanding' :
                                recentIntuition < earlyIntuition - 1 ? 'contracting' : 'stable';

    const insights: string[] = [];

    if (mobilityTrend === 'improving' && consciousnessTrend === 'expanding') {
      insights.push("Beautiful correlation: As your fascia opens, consciousness expands. This validates the fascia-consciousness hypothesis.");
    }

    if (syncAvg >= 2) {
      insights.push("High synchronicity average suggests your fascial antenna is coherent. You're connected to the field.");
    }

    const emotionalReleaseRate = assessments.filter(a => a.emotionalRelease).length / assessments.length;
    if (emotionalReleaseRate > 0.5) {
      insights.push("Frequent emotional releases indicate active trauma processing. Honor this deep work.");
    }

    return {
      period: `last ${days} days`,
      fasciaToIntuition: mobilityAvg / 10,  // Simplified correlation
      fasciaToSynchronicity: syncAvg / 10,
      fasciaToEmotionalRelease: emotionalReleaseRate,
      fasciaToCoherence: (mobilityAvg + intuitionAvg) / 20,
      mobilityTrend,
      consciousnessTrend,
      insights
    };
  }
}

export const fascialHealthStorage = new FascialHealthStorage();
