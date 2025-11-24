// frontend
// apps/web/lib/biometrics/CoherenceDetector.ts

/**
 * Coherence Detection for MAIA biometric analysis.
 * Analyzes physiological coherence patterns, heart rate variability,
 * and other biometric signals to assess emotional and physical coherence.
 */

export interface CoherenceMetrics {
  /**
   * Heart rate variability coherence score (0-1)
   */
  hrvCoherence: number;

  /**
   * Breathing pattern coherence (0-1)
   */
  breathingCoherence: number;

  /**
   * Overall coherence score (0-1)
   */
  overallCoherence: number;

  /**
   * Stability of coherence over time (0-1)
   */
  stability: number;

  /**
   * Timestamp of measurement
   */
  timestamp: Date;

  /**
   * Raw data quality indicator (0-1)
   */
  dataQuality: number;

  /**
   * Additional biometric data
   */
  rawMetrics?: {
    heartRate?: number;
    respirationRate?: number;
    sdnn?: number; // Standard deviation of NN intervals
    rmssd?: number; // Root mean square of successive differences
    [key: string]: any;
  };
}

export interface CoherenceState {
  /**
   * Current coherence level
   */
  level: 'low' | 'medium' | 'high';

  /**
   * Trend direction
   */
  trend: 'increasing' | 'stable' | 'decreasing';

  /**
   * Duration in current state (seconds)
   */
  duration: number;

  /**
   * Confidence in measurement (0-1)
   */
  confidence: number;
}

export interface CoherenceDetectorOptions {
  /**
   * Sampling rate for coherence detection
   */
  samplingRate?: number;

  /**
   * Window size for coherence calculation (seconds)
   */
  windowSize?: number;

  /**
   * Minimum data quality threshold (0-1)
   */
  qualityThreshold?: number;

  /**
   * Enable real-time processing
   */
  realTimeProcessing?: boolean;
}

/**
 * Default configuration for coherence detection
 */
const DEFAULT_OPTIONS: CoherenceDetectorOptions = {
  samplingRate: 250, // Hz
  windowSize: 30, // seconds
  qualityThreshold: 0.6,
  realTimeProcessing: true,
};

/**
 * Coherence Detector class for biometric analysis
 */
export class CoherenceDetector {
  private options: CoherenceDetectorOptions;
  private dataBuffer: number[] = [];
  private timestamps: Date[] = [];
  private isActive: boolean = false;

  constructor(options?: CoherenceDetectorOptions) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Initialize the coherence detector
   */
  async initialize(): Promise<void> {
    console.log('🫀 [CoherenceDetector] Initializing coherence detection...');

    // In production, this would:
    // 1. Initialize biometric sensors
    // 2. Calibrate detection algorithms
    // 3. Set up real-time processing pipelines

    this.isActive = true;
  }

  /**
   * Process new biometric data point
   */
  processDataPoint(value: number, timestamp?: Date): CoherenceMetrics {
    const ts = timestamp || new Date();

    // Add to buffer
    this.dataBuffer.push(value);
    this.timestamps.push(ts);

    // Maintain buffer size
    const maxBufferSize = (this.options.samplingRate || 250) * (this.options.windowSize || 30);
    if (this.dataBuffer.length > maxBufferSize) {
      this.dataBuffer.shift();
      this.timestamps.shift();
    }

    return this.calculateCoherence();
  }

  /**
   * Calculate coherence metrics from current buffer
   */
  private calculateCoherence(): CoherenceMetrics {
    if (this.dataBuffer.length < 10) {
      // Not enough data for meaningful calculation
      return {
        hrvCoherence: 0,
        breathingCoherence: 0,
        overallCoherence: 0,
        stability: 0,
        timestamp: new Date(),
        dataQuality: 0,
      };
    }

    // Stub implementation - in production would use advanced HRV algorithms
    const mean = this.dataBuffer.reduce((sum, val) => sum + val, 0) / this.dataBuffer.length;
    const variance = this.dataBuffer.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / this.dataBuffer.length;
    const stdDev = Math.sqrt(variance);

    // Simplified coherence calculation based on variability patterns
    const hrvCoherence = Math.max(0, Math.min(1, 1 - (stdDev / mean) * 2));
    const breathingCoherence = Math.max(0, Math.min(1, 0.7 + Math.random() * 0.3)); // Placeholder
    const overallCoherence = (hrvCoherence + breathingCoherence) / 2;

    // Data quality assessment
    const dataQuality = Math.max(0, Math.min(1, 0.8 + Math.random() * 0.2)); // Placeholder

    return {
      hrvCoherence,
      breathingCoherence,
      overallCoherence,
      stability: this.calculateStability(),
      timestamp: new Date(),
      dataQuality,
      rawMetrics: {
        heartRate: mean,
        sdnn: stdDev,
      },
    };
  }

  /**
   * Calculate stability of coherence over time
   */
  private calculateStability(): number {
    if (this.dataBuffer.length < 50) return 0.5;

    // Calculate coefficient of variation as stability measure
    const recentData = this.dataBuffer.slice(-50);
    const mean = recentData.reduce((sum, val) => sum + val, 0) / recentData.length;
    const cv = Math.sqrt(
      recentData.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / recentData.length
    ) / mean;

    return Math.max(0, Math.min(1, 1 - cv));
  }

  /**
   * Get current coherence state
   */
  getCoherenceState(): CoherenceState {
    const metrics = this.calculateCoherence();

    let level: 'low' | 'medium' | 'high' = 'low';
    if (metrics.overallCoherence > 0.7) level = 'high';
    else if (metrics.overallCoherence > 0.4) level = 'medium';

    return {
      level,
      trend: 'stable', // Simplified - would analyze trends over time
      duration: this.timestamps.length > 0 ?
        (Date.now() - this.timestamps[0].getTime()) / 1000 : 0,
      confidence: metrics.dataQuality,
    };
  }

  /**
   * Start real-time coherence monitoring
   */
  startMonitoring(): void {
    if (!this.isActive) {
      console.warn('[CoherenceDetector] Detector not initialized');
      return;
    }

    console.log('🫀 [CoherenceDetector] Starting real-time monitoring...');
    // In production, would start continuous data acquisition
  }

  /**
   * Stop real-time coherence monitoring
   */
  stopMonitoring(): void {
    console.log('🫀 [CoherenceDetector] Stopping real-time monitoring...');
    // In production, would stop data acquisition and cleanup
  }

  /**
   * Reset detector state
   */
  reset(): void {
    this.dataBuffer = [];
    this.timestamps = [];
    console.log('🫀 [CoherenceDetector] State reset');
  }

  /**
   * Get detector status
   */
  getStatus(): {
    isActive: boolean;
    bufferSize: number;
    lastUpdate: Date | null;
    configuration: CoherenceDetectorOptions;
  } {
    return {
      isActive: this.isActive,
      bufferSize: this.dataBuffer.length,
      lastUpdate: this.timestamps.length > 0 ? this.timestamps[this.timestamps.length - 1] : null,
      configuration: this.options,
    };
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.stopMonitoring();
    this.reset();
    this.isActive = false;
    console.log('🫀 [CoherenceDetector] Disposed');
  }
}

/**
 * Create and initialize a coherence detector instance
 */
export async function createCoherenceDetector(options?: CoherenceDetectorOptions): Promise<CoherenceDetector> {
  const detector = new CoherenceDetector(options);
  await detector.initialize();
  return detector;
}

/**
 * Global coherence detector instance (singleton pattern for browser use)
 */
let globalDetector: CoherenceDetector | null = null;

/**
 * Get or create global coherence detector instance
 */
export async function getCoherenceDetector(): Promise<CoherenceDetector> {
  if (!globalDetector) {
    globalDetector = await createCoherenceDetector();
  }
  return globalDetector;
}

/**
 * Export coherence detector instance (for dynamic imports)
 */
export const coherenceDetector = {
  create: createCoherenceDetector,
  getInstance: getCoherenceDetector,
  CoherenceDetector,
};

export default coherenceDetector;