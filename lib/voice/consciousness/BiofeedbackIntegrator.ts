/**
 * MAIA Bio-feedback Integration Architecture
 *
 * Integrates MAIA's voice consciousness analysis with external bio-feedback devices
 * to create a comprehensive multi-modal consciousness monitoring system.
 *
 * Supported device types:
 * - Heart Rate Variability (HRV) monitors
 * - EEG brain activity sensors
 * - Breath pattern sensors
 * - Galvanic Skin Response (GSR) sensors
 * - Temperature sensors
 * - Blood oxygen sensors
 * - EMG muscle tension sensors
 *
 * Integration patterns:
 * - Real-time correlation with voice analysis
 * - Consciousness state validation
 * - Bio-feedback guided voice coaching
 * - Predictive wellness indicators
 */

export interface BiofeedbackDevice {
  id: string;
  type: 'hrv' | 'eeg' | 'breath' | 'gsr' | 'temperature' | 'oximeter' | 'emg' | 'custom';
  name: string;
  manufacturer: string;
  model: string;
  connected: boolean;
  lastReading: number;
  timestamp: Date;
  batteryLevel?: number;
  signalQuality?: number; // 0-1
  calibrated: boolean;
  metadata: {
    sampleRate?: number;
    resolution?: number;
    range?: { min: number; max: number };
    units: string;
  };
}

export interface BiofeedbackReading {
  deviceId: string;
  timestamp: Date;
  value: number;
  quality: number; // 0-1 signal quality
  processed: boolean;
  correlationData?: {
    voiceAnalysisId: string;
    correlationScore: number;
    phase: 'pre' | 'during' | 'post'; // Relative to voice input
  };
}

export interface MultiModalCorrelation {
  timestamp: Date;
  voiceMetrics: {
    stress: number;
    coherence: number;
    presence: number;
    flow: number;
  };
  biofeedbackMetrics: {
    [deviceType: string]: number;
  };
  correlationScores: {
    [deviceType: string]: number;
  };
  consciousnessState: {
    level: string;
    confidence: number;
    stability: number;
    integration: number;
  };
  recommendations: {
    immediate: string[];
    session: string[];
    device: string[]; // Device-specific recommendations
  };
}

export interface BiofeedbackCoaching {
  userId: string;
  sessionId: string;
  deviceType: string;
  guidance: {
    type: 'breathing' | 'relaxation' | 'focus' | 'activation' | 'integration';
    instruction: string;
    targetMetric: string;
    targetValue: number;
    duration: number; // seconds
    visualFeedback?: string;
    audioFeedback?: string;
  };
  progress: {
    baseline: number;
    current: number;
    target: number;
    improvement: number; // percentage
    timeToTarget?: number; // seconds
  };
  voiceIntegration: {
    useVoiceGuidance: boolean;
    voiceCoachingPrompts: string[];
    voiceProgressFeedback: string[];
  };
}

class BiofeedbackIntegrator {
  private connectedDevices: Map<string, BiofeedbackDevice> = new Map();
  private readings: Map<string, BiofeedbackReading[]> = new Map();
  private correlationHistory: MultiModalCorrelation[] = [];
  private activeCoaching: Map<string, BiofeedbackCoaching> = new Map();
  private eventListeners: Map<string, Function[]> = new Map();
  private isInitialized: boolean = false;
  private maxReadingsPerDevice: number = 1000; // Sliding window

  /**
   * Initialize the bio-feedback integration system
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize device discovery and connection protocols
      await this.initializeDeviceProtocols();

      // Start real-time processing pipeline
      this.startRealTimeProcessing();

      this.isInitialized = true;
      console.log('🧬 MAIA Bio-feedback Integration initialized');

    } catch (error) {
      console.error('Failed to initialize BiofeedbackIntegrator:', error);
      throw error;
    }
  }

  /**
   * Register a new bio-feedback device
   */
  async registerDevice(deviceConfig: Partial<BiofeedbackDevice>): Promise<string> {
    const device: BiofeedbackDevice = {
      id: deviceConfig.id || this.generateDeviceId(),
      type: deviceConfig.type || 'custom',
      name: deviceConfig.name || 'Unknown Device',
      manufacturer: deviceConfig.manufacturer || 'Unknown',
      model: deviceConfig.model || 'Unknown',
      connected: false,
      lastReading: 0,
      timestamp: new Date(),
      batteryLevel: deviceConfig.batteryLevel,
      signalQuality: deviceConfig.signalQuality,
      calibrated: deviceConfig.calibrated || false,
      metadata: {
        sampleRate: deviceConfig.metadata?.sampleRate || 1,
        resolution: deviceConfig.metadata?.resolution || 8,
        range: deviceConfig.metadata?.range || { min: 0, max: 100 },
        units: deviceConfig.metadata?.units || 'units'
      }
    };

    this.connectedDevices.set(device.id, device);
    this.readings.set(device.id, []);

    console.log(`📡 Registered ${device.type} device: ${device.name}`);

    // Initialize device-specific protocols
    await this.initializeDeviceSpecific(device);

    this.emitEvent('device_registered', { device });
    return device.id;
  }

  /**
   * Connect to a registered device
   */
  async connectDevice(deviceId: string): Promise<boolean> {
    const device = this.connectedDevices.get(deviceId);
    if (!device) {
      throw new Error(`Device ${deviceId} not found`);
    }

    try {
      // Implement device-specific connection logic
      const connected = await this.establishDeviceConnection(device);

      device.connected = connected;
      device.timestamp = new Date();

      if (connected) {
        console.log(`✅ Connected to ${device.name}`);
        this.emitEvent('device_connected', { device });

        // Start reading from device
        this.startDeviceReading(device);
      } else {
        console.log(`❌ Failed to connect to ${device.name}`);
        this.emitEvent('device_connection_failed', { device });
      }

      return connected;

    } catch (error) {
      console.error(`Connection error for device ${device.name}:`, error);
      return false;
    }
  }

  /**
   * Record a bio-feedback reading
   */
  async recordReading(deviceId: string, value: number, quality: number = 1.0): Promise<void> {
    const device = this.connectedDevices.get(deviceId);
    if (!device || !device.connected) {
      console.warn(`Cannot record reading for disconnected device: ${deviceId}`);
      return;
    }

    const reading: BiofeedbackReading = {
      deviceId,
      timestamp: new Date(),
      value,
      quality,
      processed: false
    };

    // Add to readings buffer
    let deviceReadings = this.readings.get(deviceId) || [];
    deviceReadings.push(reading);

    // Maintain sliding window
    if (deviceReadings.length > this.maxReadingsPerDevice) {
      deviceReadings = deviceReadings.slice(-this.maxReadingsPerDevice);
      this.readings.set(deviceId, deviceReadings);
    }

    // Update device state
    device.lastReading = value;
    device.timestamp = reading.timestamp;

    // Process reading in real-time
    await this.processReading(reading);

    this.emitEvent('reading_recorded', { deviceId, reading });
  }

  /**
   * Correlate bio-feedback data with voice analysis
   */
  async correlateBiofeedbackWithVoice(
    voiceAnalysis: any,
    sessionId: string
  ): Promise<MultiModalCorrelation> {
    const timestamp = new Date();

    // Get recent readings from all connected devices
    const biofeedbackMetrics: { [deviceType: string]: number } = {};
    const correlationScores: { [deviceType: string]: number } = {};

    for (const [deviceId, device] of this.connectedDevices) {
      if (!device.connected) continue;

      const recentReadings = this.getRecentReadings(deviceId, 10); // Last 10 readings
      if (recentReadings.length === 0) continue;

      // Calculate average for this device
      const avgValue = recentReadings.reduce((sum, r) => sum + r.value, 0) / recentReadings.length;
      biofeedbackMetrics[device.type] = this.normalizeDeviceReading(device, avgValue);

      // Calculate correlation with voice metrics
      correlationScores[device.type] = await this.calculateVoiceBiofeedbackCorrelation(
        voiceAnalysis,
        device,
        recentReadings
      );
    }

    // Determine integrated consciousness state
    const consciousnessState = this.determineIntegratedConsciousnessState(
      voiceAnalysis,
      biofeedbackMetrics
    );

    // Generate multi-modal recommendations
    const recommendations = this.generateMultiModalRecommendations(
      voiceAnalysis,
      biofeedbackMetrics,
      correlationScores
    );

    const correlation: MultiModalCorrelation = {
      timestamp,
      voiceMetrics: {
        stress: voiceAnalysis.biofeedbackMetrics?.stressLevel || 0.5,
        coherence: voiceAnalysis.consciousnessIndicators?.coherence || 0.5,
        presence: voiceAnalysis.consciousnessIndicators?.presence || 0.5,
        flow: voiceAnalysis.consciousnessIndicators?.flowState || 0.5
      },
      biofeedbackMetrics,
      correlationScores,
      consciousnessState,
      recommendations
    };

    // Store correlation
    this.correlationHistory.push(correlation);

    // Maintain correlation history size
    if (this.correlationHistory.length > 100) {
      this.correlationHistory = this.correlationHistory.slice(-100);
    }

    this.emitEvent('correlation_complete', { correlation });
    return correlation;
  }

  /**
   * Start bio-feedback guided coaching session
   */
  async startBiofeedbackCoaching(
    userId: string,
    deviceId: string,
    coachingType: 'breathing' | 'relaxation' | 'focus' | 'activation' | 'integration'
  ): Promise<string> {
    const device = this.connectedDevices.get(deviceId);
    if (!device || !device.connected) {
      throw new Error(`Device ${deviceId} not available for coaching`);
    }

    const sessionId = `coaching_${Date.now()}_${userId}`;
    const baseline = await this.establishBaseline(deviceId);

    const coaching: BiofeedbackCoaching = {
      userId,
      sessionId,
      deviceType: device.type,
      guidance: this.createCoachingGuidance(coachingType, device, baseline),
      progress: {
        baseline,
        current: baseline,
        target: this.calculateTargetValue(device.type, coachingType, baseline),
        improvement: 0
      },
      voiceIntegration: {
        useVoiceGuidance: true,
        voiceCoachingPrompts: this.generateVoiceCoachingPrompts(coachingType),
        voiceProgressFeedback: []
      }
    };

    this.activeCoaching.set(sessionId, coaching);

    console.log(`🎯 Started ${coachingType} coaching session: ${sessionId}`);
    this.emitEvent('coaching_started', { coaching });

    return sessionId;
  }

  /**
   * Update coaching progress with real-time feedback
   */
  async updateCoachingProgress(sessionId: string, currentReading: number): Promise<void> {
    const coaching = this.activeCoaching.get(sessionId);
    if (!coaching) return;

    const previousValue = coaching.progress.current;
    coaching.progress.current = currentReading;

    // Calculate improvement
    const baseline = coaching.progress.baseline;
    const target = coaching.progress.target;
    const improvement = ((currentReading - baseline) / (target - baseline)) * 100;
    coaching.progress.improvement = Math.max(0, Math.min(100, improvement));

    // Generate voice feedback if significant progress
    if (Math.abs(currentReading - previousValue) > 0.1) {
      const feedback = this.generateProgressFeedback(coaching);
      coaching.voiceIntegration.voiceProgressFeedback.push(feedback);

      this.emitEvent('coaching_progress', {
        sessionId,
        progress: coaching.progress,
        feedback
      });
    }

    // Check if target achieved
    if (coaching.progress.improvement >= 80) {
      await this.completeCoachingSession(sessionId);
    }
  }

  /**
   * Get current bio-feedback state for all devices
   */
  getCurrentBiofeedbackState(): { [deviceType: string]: any } {
    const state: { [deviceType: string]: any } = {};

    for (const [deviceId, device] of this.connectedDevices) {
      if (!device.connected) continue;

      const recentReadings = this.getRecentReadings(deviceId, 5);
      if (recentReadings.length === 0) continue;

      state[device.type] = {
        deviceId,
        name: device.name,
        currentValue: device.lastReading,
        normalizedValue: this.normalizeDeviceReading(device, device.lastReading),
        trend: this.calculateTrend(recentReadings),
        quality: device.signalQuality || 1.0,
        lastUpdate: device.timestamp
      };
    }

    return state;
  }

  /**
   * Get detailed correlation analysis
   */
  getCorrelationAnalysis(timeWindowMinutes: number = 30): any {
    const cutoff = new Date(Date.now() - timeWindowMinutes * 60 * 1000);
    const recentCorrelations = this.correlationHistory.filter(c => c.timestamp >= cutoff);

    if (recentCorrelations.length === 0) {
      return { error: 'No correlation data available' };
    }

    // Calculate average correlations by device type
    const deviceTypes = new Set(
      recentCorrelations.flatMap(c => Object.keys(c.correlationScores))
    );

    const averageCorrelations: { [deviceType: string]: number } = {};
    for (const deviceType of deviceTypes) {
      const scores = recentCorrelations
        .map(c => c.correlationScores[deviceType])
        .filter(s => s !== undefined);

      averageCorrelations[deviceType] = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    }

    return {
      timeWindow: timeWindowMinutes,
      correlationCount: recentCorrelations.length,
      averageCorrelations,
      strongestCorrelation: Object.entries(averageCorrelations)
        .sort(([, a], [, b]) => b - a)[0],
      weakestCorrelation: Object.entries(averageCorrelations)
        .sort(([, a], [, b]) => a - b)[0]
    };
  }

  // Private helper methods

  private async initializeDeviceProtocols(): Promise<void> {
    // Initialize communication protocols for different device types
    // This would include Bluetooth, USB, WiFi, etc.
    console.log('🔌 Initializing device communication protocols');
  }

  private startRealTimeProcessing(): void {
    // Start background processing for real-time correlation
    setInterval(() => {
      this.processRealTimeCorrelations();
    }, 1000); // Process every second
  }

  private generateDeviceId(): string {
    return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async initializeDeviceSpecific(device: BiofeedbackDevice): Promise<void> {
    switch (device.type) {
      case 'hrv':
        device.metadata.sampleRate = 1000; // 1kHz for HRV
        device.metadata.units = 'ms';
        break;
      case 'eeg':
        device.metadata.sampleRate = 256; // 256Hz for EEG
        device.metadata.units = 'µV';
        break;
      case 'breath':
        device.metadata.sampleRate = 50; // 50Hz for breath
        device.metadata.units = 'flow';
        break;
      case 'gsr':
        device.metadata.sampleRate = 10; // 10Hz for GSR
        device.metadata.units = 'µS';
        break;
      // Add other device types...
    }
  }

  private async establishDeviceConnection(device: BiofeedbackDevice): Promise<boolean> {
    // Implement actual device connection logic based on device type
    // This would interface with device APIs, Bluetooth, etc.

    // Simulate connection for now
    return new Promise((resolve) => {
      setTimeout(() => resolve(Math.random() > 0.1), 1000); // 90% success rate
    });
  }

  private startDeviceReading(device: BiofeedbackDevice): void {
    const readingInterval = 1000 / (device.metadata.sampleRate || 1);

    const intervalId = setInterval(async () => {
      if (!device.connected) {
        clearInterval(intervalId);
        return;
      }

      // Simulate reading from device
      const reading = this.simulateDeviceReading(device);
      await this.recordReading(device.id, reading.value, reading.quality);

    }, readingInterval);
  }

  private simulateDeviceReading(device: BiofeedbackDevice): { value: number; quality: number } {
    // Simulate realistic readings based on device type
    let value: number;
    let quality = 0.8 + Math.random() * 0.2; // 0.8-1.0 quality

    switch (device.type) {
      case 'hrv':
        value = 30 + Math.random() * 100; // 30-130ms HRV
        break;
      case 'eeg':
        value = Math.random() * 100; // 0-100µV
        break;
      case 'breath':
        value = Math.sin(Date.now() / 5000) * 50 + 50; // Breathing pattern
        break;
      case 'gsr':
        value = 5 + Math.random() * 15; // 5-20µS
        break;
      default:
        value = Math.random() * 100;
    }

    return { value, quality };
  }

  private async processReading(reading: BiofeedbackReading): Promise<void> {
    // Process new reading for real-time analysis
    reading.processed = true;

    // Check for significant changes
    const device = this.connectedDevices.get(reading.deviceId)!;
    const recentReadings = this.getRecentReadings(reading.deviceId, 5);

    if (recentReadings.length >= 5) {
      const trend = this.calculateTrend(recentReadings);

      if (Math.abs(trend) > 0.3) { // Significant trend
        this.emitEvent('biofeedback_trend', {
          deviceId: reading.deviceId,
          deviceType: device.type,
          trend,
          reading
        });
      }
    }
  }

  private processRealTimeCorrelations(): void {
    // Process real-time correlations between devices
    // This runs continuously to identify patterns
  }

  private getRecentReadings(deviceId: string, count: number): BiofeedbackReading[] {
    const readings = this.readings.get(deviceId) || [];
    return readings.slice(-count);
  }

  private normalizeDeviceReading(device: BiofeedbackDevice, value: number): number {
    const range = device.metadata.range;
    if (!range) return value / 100; // Default normalization

    return (value - range.min) / (range.max - range.min);
  }

  private async calculateVoiceBiofeedbackCorrelation(
    voiceAnalysis: any,
    device: BiofeedbackDevice,
    readings: BiofeedbackReading[]
  ): Promise<number> {
    // Calculate correlation between voice metrics and bio-feedback
    // This would use statistical correlation algorithms

    const voiceStress = voiceAnalysis.biofeedbackMetrics?.stressLevel || 0.5;
    const avgBioValue = readings.reduce((sum, r) => sum + r.value, 0) / readings.length;
    const normalizedBio = this.normalizeDeviceReading(device, avgBioValue);

    // Simple correlation for now - would implement proper statistical correlation
    return Math.abs(voiceStress - normalizedBio) < 0.3 ? 0.8 : 0.4;
  }

  private determineIntegratedConsciousnessState(
    voiceAnalysis: any,
    biofeedbackMetrics: { [deviceType: string]: number }
  ): any {
    const voiceCoherence = voiceAnalysis.consciousnessIndicators?.coherence || 0.5;
    const biofeedbackCoherence = Object.values(biofeedbackMetrics)
      .reduce((sum, val) => sum + val, 0) / Object.keys(biofeedbackMetrics).length || 0.5;

    const integratedLevel = (voiceCoherence + biofeedbackCoherence) / 2;

    return {
      level: integratedLevel > 0.8 ? 'high' : integratedLevel > 0.6 ? 'medium' : 'developing',
      confidence: Math.min(voiceAnalysis.confidenceScore || 0.5, 0.9),
      stability: 1 - Math.abs(voiceCoherence - biofeedbackCoherence),
      integration: integratedLevel
    };
  }

  private generateMultiModalRecommendations(
    voiceAnalysis: any,
    biofeedbackMetrics: { [deviceType: string]: number },
    correlationScores: { [deviceType: string]: number }
  ): any {
    const immediate: string[] = [];
    const session: string[] = [];
    const device: string[] = [];

    // Analyze voice-biofeedback coherence
    const strongCorrelations = Object.entries(correlationScores)
      .filter(([, score]) => score > 0.7);

    if (strongCorrelations.length > 0) {
      immediate.push(`Strong coherence detected between voice and ${strongCorrelations[0][0]} - you're well integrated`);
    }

    // HRV-specific recommendations
    if (biofeedbackMetrics.hrv && biofeedbackMetrics.hrv < 0.4) {
      immediate.push("Consider heart-focused breathing to improve HRV");
    }

    // EEG-specific recommendations
    if (biofeedbackMetrics.eeg && biofeedbackMetrics.eeg > 0.8) {
      session.push("High brain activity detected - perfect time for deep work");
    }

    return { immediate, session, device };
  }

  private async establishBaseline(deviceId: string): Promise<number> {
    const recentReadings = this.getRecentReadings(deviceId, 10);
    if (recentReadings.length === 0) return 0.5;

    return recentReadings.reduce((sum, r) => sum + r.value, 0) / recentReadings.length;
  }

  private createCoachingGuidance(
    type: string,
    device: BiofeedbackDevice,
    baseline: number
  ): BiofeedbackCoaching['guidance'] {
    const guidanceMap: { [key: string]: any } = {
      breathing: {
        type: 'breathing',
        instruction: 'Breathe slowly and deeply, focusing on extending your exhales',
        targetMetric: 'coherence',
        duration: 300 // 5 minutes
      },
      relaxation: {
        type: 'relaxation',
        instruction: 'Allow your body to soften and release tension',
        targetMetric: 'stress_reduction',
        duration: 600 // 10 minutes
      },
      focus: {
        type: 'focus',
        instruction: 'Bring your attention to a single point of focus',
        targetMetric: 'concentration',
        duration: 180 // 3 minutes
      }
    };

    const guidance = guidanceMap[type] || guidanceMap.breathing;
    guidance.targetValue = this.calculateTargetValue(device.type, type, baseline);

    return guidance;
  }

  private calculateTargetValue(deviceType: string, coachingType: string, baseline: number): number {
    // Calculate appropriate target based on device type and coaching goal
    switch (deviceType) {
      case 'hrv':
        return baseline * 1.3; // 30% improvement
      case 'gsr':
        return baseline * 0.8; // 20% reduction (less stress)
      case 'eeg':
        return coachingType === 'focus' ? baseline * 1.2 : baseline * 0.9;
      default:
        return baseline * 1.1;
    }
  }

  private generateVoiceCoachingPrompts(type: string): string[] {
    const prompts: { [key: string]: string[] } = {
      breathing: [
        "Let your breath become your anchor",
        "Notice the natural pause between inhale and exhale",
        "Feel your breath moving deeper into your belly"
      ],
      relaxation: [
        "Allow your shoulders to drop",
        "Let tension melt away with each exhale",
        "Notice areas of holding and gently release"
      ],
      focus: [
        "Bring your attention to this moment",
        "Notice when your mind wanders and gently return",
        "Let your focus become steady and clear"
      ]
    };

    return prompts[type] || prompts.breathing;
  }

  private generateProgressFeedback(coaching: BiofeedbackCoaching): string {
    const improvement = coaching.progress.improvement;

    if (improvement > 75) return "Excellent progress! You're reaching your target.";
    if (improvement > 50) return "Great work! You're making solid progress.";
    if (improvement > 25) return "Good! You're moving in the right direction.";
    if (improvement > 0) return "You're on track. Keep going.";
    return "Stay with it. Progress takes time.";
  }

  private async completeCoachingSession(sessionId: string): Promise<void> {
    const coaching = this.activeCoaching.get(sessionId);
    if (!coaching) return;

    console.log(`✅ Completed coaching session: ${sessionId}`);
    this.emitEvent('coaching_completed', { coaching });

    this.activeCoaching.delete(sessionId);
  }

  private calculateTrend(readings: BiofeedbackReading[]): number {
    if (readings.length < 2) return 0;

    const first = readings[0].value;
    const last = readings[readings.length - 1].value;

    return (last - first) / first; // Percentage change
  }

  private emitEvent(eventType: string, data: any): void {
    const listeners = this.eventListeners.get(eventType) || [];
    listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Event listener error for ${eventType}:`, error);
      }
    });
  }

  /**
   * Add event listener
   */
  addEventListener(eventType: string, callback: Function): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(callback);
  }

  /**
   * Remove event listener
   */
  removeEventListener(eventType: string, callback: Function): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }
}

// Export singleton instance
export const biofeedbackIntegrator = new BiofeedbackIntegrator();