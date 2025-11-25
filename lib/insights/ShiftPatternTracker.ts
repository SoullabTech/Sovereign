/**
 * Shift Pattern Tracker
 * Detects and tracks consciousness state transitions (shifts between elemental modes,
 * alchemical operations, and other developmental states)
 */

import { ElementalMode } from '../maia/SpiralogicOrchestrator';
import { AlchemicalOperation } from '../maia/AlchemicalOperationDetector';

export interface ConsciousnessShift {
  id?: number;
  timestamp: Date;
  userId: string;

  // What shifted
  fromState: string;
  toState: string;
  shiftType: ShiftType;

  // Shift characteristics
  magnitude: number; // 0-1: how significant the shift was
  wasAttended: boolean; // Was the person consciously present for this shift?

  // Context
  elementalMode?: ElementalMode;
  alchemicalOperation?: AlchemicalOperation;

  // Triggers/catalysts
  trigger?: string; // What caused this shift (conversation, ritual, biometric event, etc.)
  notes?: string;
}

export enum ShiftType {
  ELEMENTAL = 'elemental',           // Fire → Water, etc.
  ALCHEMICAL = 'alchemical',         // Calcination → Solutio, etc.
  ARCHETYPAL = 'archetypal',         // Shadow → Higher Self, etc.
  EMOTIONAL = 'emotional',           // Fear → Courage, etc.
  COGNITIVE = 'cognitive',           // Confusion → Clarity, etc.
  BREAKTHROUGH = 'breakthrough',     // Major insight/realization
  INTEGRATION = 'integration'        // Embodying a shift
}

export interface ShiftPatternMetrics {
  totalShifts: number;
  avgMagnitude: number;
  attendedPercentage: number;
  dominantDirection: ElementalMode | string;
  shifts: ConsciousnessShift[];

  // Temporal patterns
  shiftsPerWeek: number;
  lastShift?: ConsciousnessShift;
  upcomingShiftProbability?: number;
}

class ShiftPatternStorage {
  private dbName = 'maia_shift_patterns';
  private storeName = 'shifts';
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, {
            keyPath: 'id',
            autoIncrement: true
          });
          store.createIndex('userId', 'userId', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('shiftType', 'shiftType', { unique: false });
        }
      };
    });
  }

  async recordShift(shift: ConsciousnessShift): Promise<number> {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.add(shift);

      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  async getShifts(userId: string, daysBack: number = 30): Promise<ConsciousnessShift[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('userId');
      const request = index.getAll(userId);

      request.onsuccess = () => {
        const allShifts = request.result as ConsciousnessShift[];
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysBack);

        const recentShifts = allShifts
          .filter(s => new Date(s.timestamp) >= cutoffDate)
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        resolve(recentShifts);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async calculateMetrics(userId: string, daysBack: number = 30): Promise<ShiftPatternMetrics> {
    const shifts = await this.getShifts(userId, daysBack);

    if (shifts.length === 0) {
      return {
        totalShifts: 0,
        avgMagnitude: 0,
        attendedPercentage: 0,
        dominantDirection: 'none',
        shifts: [],
        shiftsPerWeek: 0
      };
    }

    const totalShifts = shifts.length;
    const avgMagnitude = shifts.reduce((sum, s) => sum + s.magnitude, 0) / totalShifts;
    const attendedCount = shifts.filter(s => s.wasAttended).length;
    const attendedPercentage = (attendedCount / totalShifts) * 100;

    // Calculate dominant direction (most common target state)
    const directions: Record<string, number> = {};
    shifts.forEach(s => {
      directions[s.toState] = (directions[s.toState] || 0) + 1;
    });
    const dominantDirection = Object.keys(directions).reduce((a, b) =>
      directions[a] > directions[b] ? a : b
    );

    const shiftsPerWeek = (totalShifts / daysBack) * 7;

    return {
      totalShifts,
      avgMagnitude: Math.round(avgMagnitude * 1000) / 10, // Convert to percentage
      attendedPercentage: Math.round(attendedPercentage),
      dominantDirection,
      shifts,
      shiftsPerWeek: Math.round(shiftsPerWeek * 10) / 10,
      lastShift: shifts[shifts.length - 1]
    };
  }
}

export const shiftPatternStorage = new ShiftPatternStorage();

/**
 * Shift Detection Engine
 * Analyzes state changes to determine if a shift occurred and its characteristics
 */
export class ShiftDetector {

  /**
   * Detect if a state change qualifies as a consciousness shift
   */
  detectShift(
    previousState: any,
    currentState: any,
    context: {
      biometricChange?: number; // HRV coherence change
      conversationIntensity?: number; // NLP-detected insight markers
      ritualCompleted?: boolean;
    }
  ): ConsciousnessShift | null {

    // Check for elemental mode shift
    if (previousState.elementalMode !== currentState.elementalMode) {
      return {
        timestamp: new Date(),
        userId: currentState.userId,
        fromState: previousState.elementalMode,
        toState: currentState.elementalMode,
        shiftType: ShiftType.ELEMENTAL,
        magnitude: this.calculateMagnitude(previousState, currentState, context),
        wasAttended: this.detectAttending(context),
        elementalMode: currentState.elementalMode,
        trigger: this.identifyTrigger(context)
      };
    }

    // Check for alchemical operation shift
    if (previousState.alchemicalOperation !== currentState.alchemicalOperation) {
      return {
        timestamp: new Date(),
        userId: currentState.userId,
        fromState: previousState.alchemicalOperation,
        toState: currentState.alchemicalOperation,
        shiftType: ShiftType.ALCHEMICAL,
        magnitude: this.calculateMagnitude(previousState, currentState, context),
        wasAttended: this.detectAttending(context),
        alchemicalOperation: currentState.alchemicalOperation,
        trigger: this.identifyTrigger(context)
      };
    }

    // Check for breakthrough-level shift (significant biometric + conversation markers)
    if (context.biometricChange && context.biometricChange > 0.3 &&
        context.conversationIntensity && context.conversationIntensity > 0.7) {
      return {
        timestamp: new Date(),
        userId: currentState.userId,
        fromState: 'ordinary',
        toState: 'breakthrough',
        shiftType: ShiftType.BREAKTHROUGH,
        magnitude: Math.min(1, context.biometricChange + context.conversationIntensity) / 2,
        wasAttended: true, // By definition, breakthroughs are attended
        trigger: this.identifyTrigger(context)
      };
    }

    return null;
  }

  private calculateMagnitude(prev: any, curr: any, context: any): number {
    // Base magnitude on distance between states
    let baseMagnitude = 0.5;

    // Increase if backed by biometric changes
    if (context.biometricChange) {
      baseMagnitude += context.biometricChange * 0.3;
    }

    // Increase if backed by conversation intensity
    if (context.conversationIntensity) {
      baseMagnitude += context.conversationIntensity * 0.2;
    }

    return Math.min(1, baseMagnitude);
  }

  private detectAttending(context: any): boolean {
    // High conversation intensity = they were present for it
    if (context.conversationIntensity && context.conversationIntensity > 0.6) {
      return true;
    }

    // Ritual completion = intentional presence
    if (context.ritualCompleted) {
      return true;
    }

    // Otherwise, shift may have happened unconsciously
    return false;
  }

  private identifyTrigger(context: any): string {
    if (context.ritualCompleted) return 'ritual';
    if (context.conversationIntensity && context.conversationIntensity > 0.7) return 'conversation';
    if (context.biometricChange && context.biometricChange > 0.5) return 'somatic';
    return 'unknown';
  }
}

export const shiftDetector = new ShiftDetector();
