/**
 * 📱⌚ Apple Watch & iPhone Real-Time Biometric Service
 * React Native interface for MAIA consciousness integration
 */

import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

// Native module interface
interface AppleWatchBridgeInterface {
  startRealTimeMonitoring: (callback: (result: any) => void) => void;
  stopRealTimeMonitoring: (callback: (result: any) => void) => void;
  setPresenceMode: (mode: string) => void;
  addListener: (eventName: string, callback: (data: any) => void) => void;
}

// Biometric data interface
export interface BiometricReading {
  hrv: number;
  heartRate: number;
  respiratoryRate: number;
  coherenceLevel: number;
  presenceState: 'dialogue' | 'patient' | 'scribe';
  timestamp: number;
  source: 'apple_watch_iphone';
}

// Coherence state interface
export interface CoherenceState {
  level: number; // 0-1
  trend: 'rising' | 'stable' | 'falling';
  presenceRecommendation: 'dialogue' | 'patient' | 'scribe';
  elementalBalance: {
    fire: number;
    water: number;
    earth: number;
    air: number;
    aether: number;
  };
}

class AppleWatchService {
  private bridge: AppleWatchBridgeInterface | null = null;
  private eventEmitter: NativeEventEmitter | null = null;
  private isMonitoring: boolean = false;

  // Event listeners
  private biometricListeners: Set<(data: BiometricReading) => void> = new Set();
  private coherenceListeners: Set<(state: CoherenceState) => void> = new Set();

  // Data history for trend analysis
  private hrvHistory: number[] = [];
  private coherenceHistory: number[] = [];

  constructor() {
    if (Platform.OS === 'ios') {
      this.bridge = NativeModules.AppleWatchBridgeManager;
      if (this.bridge) {
        this.eventEmitter = new NativeEventEmitter(NativeModules.AppleWatchBridgeManager);
        this.setupEventListeners();
      }
    }
  }

  // MARK: - Public Methods

  /**
   * Start real-time biometric monitoring
   */
  async startRealTimeMonitoring(): Promise<boolean> {
    if (!this.bridge || Platform.OS !== 'ios') {
      console.warn('Apple Watch service only available on iOS');
      return false;
    }

    return new Promise((resolve) => {
      this.bridge!.startRealTimeMonitoring((result: any) => {
        if (result.success) {
          this.isMonitoring = true;
          console.log('✅ Apple Watch monitoring started');
          resolve(true);
        } else {
          console.error('❌ Failed to start Apple Watch monitoring:', result.error);
          resolve(false);
        }
      });
    });
  }

  /**
   * Stop real-time biometric monitoring
   */
  async stopRealTimeMonitoring(): Promise<boolean> {
    if (!this.bridge || !this.isMonitoring) {
      return false;
    }

    return new Promise((resolve) => {
      this.bridge!.stopRealTimeMonitoring((result: any) => {
        if (result.success) {
          this.isMonitoring = false;
          console.log('✅ Apple Watch monitoring stopped');
          resolve(true);
        } else {
          console.error('❌ Failed to stop Apple Watch monitoring:', result.error);
          resolve(false);
        }
      });
    });
  }

  /**
   * Set Maya presence mode (affects data collection frequency)
   */
  setPresenceMode(mode: 'dialogue' | 'patient' | 'scribe'): void {
    if (!this.bridge) return;

    this.bridge.setPresenceMode(mode);
    console.log(`🧘 Presence mode set to: ${mode}`);
  }

  /**
   * Subscribe to real-time biometric updates
   */
  onBiometricUpdate(listener: (data: BiometricReading) => void): () => void {
    this.biometricListeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.biometricListeners.delete(listener);
    };
  }

  /**
   * Subscribe to coherence state changes
   */
  onCoherenceChange(listener: (state: CoherenceState) => void): () => void {
    this.coherenceListeners.add(listener);

    return () => {
      this.coherenceListeners.delete(listener);
    };
  }

  /**
   * Get current monitoring status
   */
  isCurrentlyMonitoring(): boolean {
    return this.isMonitoring;
  }

  /**
   * Get latest biometric trends for consciousness analysis
   */
  getBiometricTrends(): {
    hrvTrend: 'rising' | 'stable' | 'falling';
    coherenceTrend: 'rising' | 'stable' | 'falling';
    averageHRV: number;
    averageCoherence: number;
  } {
    const hrvTrend = this.calculateTrend(this.hrvHistory);
    const coherenceTrend = this.calculateTrend(this.coherenceHistory);

    return {
      hrvTrend,
      coherenceTrend,
      averageHRV: this.calculateAverage(this.hrvHistory),
      averageCoherence: this.calculateAverage(this.coherenceHistory)
    };
  }

  // MARK: - Private Methods

  private setupEventListeners(): void {
    if (!this.bridge) return;

    // Listen for biometric updates
    this.bridge.addListener('biometricUpdate', (data: any) => {
      const biometricData: BiometricReading = {
        hrv: data.hrv || 0,
        heartRate: data.heartRate || 0,
        respiratoryRate: data.respiratoryRate || 0,
        coherenceLevel: data.coherenceLevel || 0,
        presenceState: data.presenceState || 'dialogue',
        timestamp: data.timestamp || Date.now(),
        source: 'apple_watch_iphone'
      };

      // Update history
      this.updateHistory(biometricData);

      // Notify listeners
      this.biometricListeners.forEach(listener => {
        try {
          listener(biometricData);
        } catch (error) {
          console.error('Error in biometric listener:', error);
        }
      });
    });

    // Listen for coherence changes
    this.bridge.addListener('coherenceChange', (data: any) => {
      const coherenceState = this.calculateCoherenceState(data.state);

      this.coherenceListeners.forEach(listener => {
        try {
          listener(coherenceState);
        } catch (error) {
          console.error('Error in coherence listener:', error);
        }
      });
    });
  }

  private updateHistory(data: BiometricReading): void {
    // Keep last 20 readings for trend analysis
    const maxHistory = 20;

    this.hrvHistory.push(data.hrv);
    if (this.hrvHistory.length > maxHistory) {
      this.hrvHistory.shift();
    }

    this.coherenceHistory.push(data.coherenceLevel);
    if (this.coherenceHistory.length > maxHistory) {
      this.coherenceHistory.shift();
    }
  }

  private calculateTrend(values: number[]): 'rising' | 'stable' | 'falling' {
    if (values.length < 3) return 'stable';

    // Compare recent vs earlier values
    const recent = values.slice(-5);
    const earlier = values.slice(-10, -5);

    const recentAvg = this.calculateAverage(recent);
    const earlierAvg = this.calculateAverage(earlier);

    const change = (recentAvg - earlierAvg) / earlierAvg;

    if (change > 0.05) return 'rising';
    if (change < -0.05) return 'falling';
    return 'stable';
  }

  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateCoherenceState(presenceState: string): CoherenceState {
    const latestCoherence = this.coherenceHistory[this.coherenceHistory.length - 1] || 0;
    const trend = this.calculateTrend(this.coherenceHistory);

    // Calculate elemental balance based on biometric data
    const elementalBalance = this.calculateElementalBalance();

    return {
      level: latestCoherence,
      trend,
      presenceRecommendation: presenceState as 'dialogue' | 'patient' | 'scribe',
      elementalBalance
    };
  }

  private calculateElementalBalance(): {
    fire: number;
    water: number;
    earth: number;
    air: number;
    aether: number;
  } {
    const latestHRV = this.hrvHistory[this.hrvHistory.length - 1] || 0;
    const latestCoherence = this.coherenceHistory[this.coherenceHistory.length - 1] || 0;

    // SPiralogic elemental mapping
    return {
      fire: Math.min(100, latestCoherence * 100), // Energy/readiness
      water: Math.min(100, (latestHRV / 80) * 100), // Parasympathetic tone
      earth: this.calculateEarthElement(), // Grounding/stability
      air: this.calculateAirElement(), // Mental clarity
      aether: Math.min(100, latestCoherence * 120) // Integration/transcendence
    };
  }

  private calculateEarthElement(): number {
    // Earth element based on HRV stability
    const hrvVariability = this.calculateVariability(this.hrvHistory);
    return Math.max(0, 100 - (hrvVariability * 100)); // Lower variability = better grounding
  }

  private calculateAirElement(): number {
    // Air element based on coherence stability
    const coherenceVariability = this.calculateVariability(this.coherenceHistory);
    return Math.max(0, 100 - (coherenceVariability * 100)); // Lower variability = better clarity
  }

  private calculateVariability(values: number[]): number {
    if (values.length < 2) return 0;

    const mean = this.calculateAverage(values);
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);

    return mean > 0 ? standardDeviation / mean : 0; // Coefficient of variation
  }
}

// MARK: - Integration with MAIA Consciousness System

export class MAIAAppleWatchIntegration {
  private watchService: AppleWatchService;
  private currentPresenceMode: 'dialogue' | 'patient' | 'scribe' = 'dialogue';

  constructor() {
    this.watchService = new AppleWatchService();
    this.setupMAIAIntegration();
  }

  async startConsciousnessMonitoring(): Promise<boolean> {
    const success = await this.watchService.startRealTimeMonitoring();

    if (success) {
      // Set initial presence mode
      this.watchService.setPresenceMode(this.currentPresenceMode);

      console.log('🌟 MAIA Apple Watch consciousness monitoring active');
    }

    return success;
  }

  async stopConsciousnessMonitoring(): Promise<boolean> {
    return await this.watchService.stopRealTimeMonitoring();
  }

  private setupMAIAIntegration(): void {
    // Subscribe to biometric updates and send to MAIA consciousness system
    this.watchService.onBiometricUpdate((data: BiometricReading) => {
      this.sendToMAIA(data);
    });

    // Subscribe to coherence changes and adapt Maya's response
    this.watchService.onCoherenceChange((state: CoherenceState) => {
      this.adaptMAIAPresence(state);
    });
  }

  private async sendToMAIA(data: BiometricReading): Promise<void> {
    try {
      // Send to MAIA consciousness API
      const response = await fetch('/api/biometric/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          source: 'apple_watch',
          data: {
            hrv: data.hrv,
            heartRate: data.heartRate,
            respiratoryRate: data.respiratoryRate,
            coherenceLevel: data.coherenceLevel,
            presenceState: data.presenceState,
            timestamp: data.timestamp
          }
        })
      });

      if (!response.ok) {
        console.error('Failed to send biometric data to MAIA');
      }
    } catch (error) {
      console.error('Error sending biometric data to MAIA:', error);
    }
  }

  private adaptMAIAPresence(state: CoherenceState): void {
    const newMode = state.presenceRecommendation;

    if (newMode !== this.currentPresenceMode) {
      this.currentPresenceMode = newMode;
      this.watchService.setPresenceMode(newMode);

      // Notify MAIA to adapt response style
      this.sendPresenceModeUpdate(newMode, state);
    }
  }

  private async sendPresenceModeUpdate(mode: string, state: CoherenceState): Promise<void> {
    try {
      await fetch('/api/maya/presence-mode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          presenceMode: mode,
          coherenceState: state,
          timestamp: Date.now()
        })
      });

      console.log(`🧘 MAIA presence adapted to: ${mode} (coherence: ${(state.level * 100).toFixed(0)}%)`);
    } catch (error) {
      console.error('Error updating MAIA presence mode:', error);
    }
  }

  // Public methods for React components
  getCurrentTrends() {
    return this.watchService.getBiometricTrends();
  }

  isMonitoring(): boolean {
    return this.watchService.isCurrentlyMonitoring();
  }

  getCurrentPresenceMode(): 'dialogue' | 'patient' | 'scribe' {
    return this.currentPresenceMode;
  }
}

// Export singleton instance
export const maiaWatchIntegration = new MAIAAppleWatchIntegration();
export default AppleWatchService;