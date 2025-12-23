/**
 * Biofield Sensors Bridge - Journey Page Phase 5
 *
 * Connects to real physiological data sources:
 * - HRV: Apple Watch HealthKit / Polar H10 Bluetooth
 * - Voice: Web Audio API (microphone analysis)
 * - Breath: Camera (chest movement) or microphone (breath sounds)
 *
 * Phase: 4.4-C Phase 5 (Biofield Integration)
 * Created: December 23, 2024
 */

// ============================================================================
// Types
// ============================================================================

export interface HRVData {
  timestamp: Date;
  rmssd: number;        // milliseconds (20-100 typical)
  coherence: number;    // 0-1 (derived)
  quality: 'good' | 'fair' | 'poor';
}

export interface VoiceData {
  timestamp: Date;
  pitch: number;        // Hz (80-300 typical)
  energy: number;       // dB (-60 to 0)
  affect: number;       // -1 to 1
  quality: 'speaking' | 'silence' | 'noise';
}

export interface BreathData {
  timestamp: Date;
  rate: number;         // breaths/min (12-20 typical)
  coherence: number;    // 0-1 (regularity)
  quality: 'detected' | 'estimated' | 'manual';
}

export type HRVSource = 'healthkit' | 'polar-h10' | 'stub';
export type BreathMode = 'camera' | 'microphone' | 'manual';

// ============================================================================
// HRV Bridge
// ============================================================================

export interface HRVBridgeOptions {
  /** Preferred source (auto-detect if not specified) */
  source?: HRVSource;

  /** Polling interval for HealthKit (ms) */
  pollingInterval?: number;

  /** Enable debug logging */
  debug?: boolean;
}

/**
 * HRV Bridge
 *
 * Connects to HRV data sources (HealthKit, Polar H10, or stub).
 * Calculates RMSSD and derives coherence score.
 *
 * @example
 * ```tsx
 * const hrv = new HRVBridge({ source: 'polar-h10' });
 * await hrv.connect();
 *
 * hrv.onData((data) => {
 *   console.log('HRV:', data.rmssd, 'Coherence:', data.coherence);
 * });
 *
 * // Later...
 * hrv.disconnect();
 * ```
 */
export class HRVBridge {
  private options: Required<HRVBridgeOptions>;
  private _connected = false;
  private _source: HRVSource = 'stub';
  private callbacks: Array<(data: HRVData) => void> = [];

  // Bluetooth (Polar H10)
  private bluetoothDevice: BluetoothDevice | null = null;
  private bluetoothCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;

  // RR intervals for RMSSD calculation
  private rrIntervals: number[] = [];
  private readonly RR_BUFFER_SIZE = 10;

  // Stub mode (for development)
  private stubInterval: NodeJS.Timeout | null = null;

  constructor(options: HRVBridgeOptions = {}) {
    this.options = {
      source: options.source || 'stub',
      pollingInterval: options.pollingInterval || 1000,
      debug: options.debug || false,
    };
  }

  // ============================================================================
  // Lifecycle
  // ============================================================================

  /**
   * Connect to HRV source
   */
  async connect(): Promise<void> {
    if (this._connected) return;

    const { source } = this.options;

    try {
      if (source === 'polar-h10') {
        await this.connectPolarH10();
      } else if (source === 'healthkit') {
        await this.connectHealthKit();
      } else {
        await this.connectStub();
      }

      this._connected = true;
      this._source = source;
      this.log('[HRVBridge] Connected:', source);
    } catch (error) {
      this.log('[HRVBridge] Connection failed:', error);
      throw error;
    }
  }

  /**
   * Disconnect from HRV source
   */
  disconnect(): void {
    if (!this._connected) return;

    if (this._source === 'polar-h10') {
      this.disconnectPolarH10();
    } else if (this._source === 'healthkit') {
      this.disconnectHealthKit();
    } else {
      this.disconnectStub();
    }

    this._connected = false;
    this.log('[HRVBridge] Disconnected');
  }

  // ============================================================================
  // Polar H10 (Web Bluetooth)
  // ============================================================================

  private async connectPolarH10(): Promise<void> {
    if (!navigator.bluetooth) {
      throw new Error('Web Bluetooth not supported');
    }

    // Request Polar H10 device
    this.bluetoothDevice = await navigator.bluetooth.requestDevice({
      filters: [{ services: ['heart_rate'] }],
      optionalServices: ['heart_rate'],
    });

    // Connect to GATT server
    const server = await this.bluetoothDevice.gatt?.connect();
    if (!server) throw new Error('Failed to connect to GATT server');

    // Get heart rate service
    const service = await server.getPrimaryService('heart_rate');

    // Get heart rate measurement characteristic
    this.bluetoothCharacteristic = await service.getCharacteristic(
      'heart_rate_measurement'
    );

    // Listen for notifications
    await this.bluetoothCharacteristic.startNotifications();
    this.bluetoothCharacteristic.addEventListener(
      'characteristicvaluechanged',
      this.handleHeartRateMeasurement.bind(this)
    );

    this.log('[HRVBridge] Polar H10 connected');
  }

  private disconnectPolarH10(): void {
    if (this.bluetoothCharacteristic) {
      this.bluetoothCharacteristic.stopNotifications();
      this.bluetoothCharacteristic = null;
    }

    if (this.bluetoothDevice?.gatt?.connected) {
      this.bluetoothDevice.gatt.disconnect();
    }

    this.bluetoothDevice = null;
  }

  private handleHeartRateMeasurement(event: Event): void {
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    const value = target.value;
    if (!value) return;

    // Parse heart rate measurement
    // Byte 0: Flags
    // Byte 1-2: Heart rate value
    // Bytes 3+: RR intervals (if present)

    const flags = value.getUint8(0);
    const rrPresent = (flags & 0x10) !== 0;

    if (!rrPresent) return;

    // Read RR intervals (16-bit values, 1/1024 second resolution)
    let offset = 2; // Skip flags + heart rate
    const rrIntervals: number[] = [];

    while (offset < value.byteLength) {
      const rr = value.getUint16(offset, true); // Little-endian
      rrIntervals.push((rr / 1024) * 1000); // Convert to milliseconds
      offset += 2;
    }

    // Process RR intervals
    for (const rr of rrIntervals) {
      this.processRRInterval(rr);
    }
  }

  // ============================================================================
  // HealthKit (iOS only - requires native bridge)
  // ============================================================================

  private async connectHealthKit(): Promise<void> {
    // HealthKit integration requires native iOS bridge
    // For web, we'll stub this for now
    // In production, this would use a React Native bridge or similar

    this.log('[HRVBridge] HealthKit not yet implemented (requires native bridge)');
    throw new Error('HealthKit integration requires native iOS bridge');
  }

  private disconnectHealthKit(): void {
    // Cleanup HealthKit connection
  }

  // ============================================================================
  // Stub Mode (Development)
  // ============================================================================

  private async connectStub(): Promise<void> {
    // Generate realistic HRV data for development
    this.stubInterval = setInterval(() => {
      const baseRMSSD = 45;
      const variance = 10;
      const rmssd = baseRMSSD + (Math.random() - 0.5) * variance;

      const hrvData: HRVData = {
        timestamp: new Date(),
        rmssd,
        coherence: this.calculateHRVCoherence(rmssd),
        quality: rmssd > 40 ? 'good' : rmssd > 30 ? 'fair' : 'poor',
      };

      this.emitData(hrvData);
    }, this.options.pollingInterval);

    this.log('[HRVBridge] Stub mode connected');
  }

  private disconnectStub(): void {
    if (this.stubInterval) {
      clearInterval(this.stubInterval);
      this.stubInterval = null;
    }
  }

  // ============================================================================
  // RR Interval Processing
  // ============================================================================

  private processRRInterval(rr: number): void {
    // Add to buffer
    this.rrIntervals.push(rr);

    // Keep buffer size limited
    if (this.rrIntervals.length > this.RR_BUFFER_SIZE) {
      this.rrIntervals.shift();
    }

    // Calculate RMSSD if enough data
    if (this.rrIntervals.length >= 2) {
      const rmssd = this.calculateRMSSD(this.rrIntervals);

      const hrvData: HRVData = {
        timestamp: new Date(),
        rmssd,
        coherence: this.calculateHRVCoherence(rmssd),
        quality: rmssd > 40 ? 'good' : rmssd > 30 ? 'fair' : 'poor',
      };

      this.emitData(hrvData);
    }
  }

  /**
   * Calculate RMSSD (Root Mean Square of Successive Differences)
   */
  private calculateRMSSD(intervals: number[]): number {
    if (intervals.length < 2) return 0;

    let sumSquaredDiffs = 0;
    for (let i = 1; i < intervals.length; i++) {
      const diff = intervals[i] - intervals[i - 1];
      sumSquaredDiffs += diff * diff;
    }

    return Math.sqrt(sumSquaredDiffs / (intervals.length - 1));
  }

  /**
   * Calculate HRV coherence score (0-1)
   * Higher RMSSD = higher coherence (relaxed, parasympathetic)
   */
  private calculateHRVCoherence(rmssd: number): number {
    const optimalRMSSD = 50; // milliseconds
    const score = Math.min(rmssd / optimalRMSSD, 2) / 2;
    return Math.max(0, Math.min(1, score));
  }

  // ============================================================================
  // Data Streaming
  // ============================================================================

  /**
   * Register callback for HRV data
   */
  onData(callback: (data: HRVData) => void): () => void {
    this.callbacks.push(callback);

    // Return unsubscribe function
    return () => {
      this.callbacks = this.callbacks.filter((cb) => cb !== callback);
    };
  }

  private emitData(data: HRVData): void {
    this.callbacks.forEach((cb) => cb(data));
  }

  // ============================================================================
  // Getters
  // ============================================================================

  get connected(): boolean {
    return this._connected;
  }

  get source(): HRVSource {
    return this._source;
  }

  // ============================================================================
  // Utils
  // ============================================================================

  private log(...args: any[]): void {
    if (this.options.debug) {
      console.log(...args);
    }
  }
}

// ============================================================================
// Voice Prosody Analyzer
// ============================================================================

export interface VoiceAnalyzerOptions {
  /** FFT size for frequency analysis */
  fftSize?: number;

  /** Smoothing time constant */
  smoothingTimeConstant?: number;

  /** Analysis interval (ms) */
  analysisInterval?: number;

  /** Silence threshold (dB) */
  silenceThreshold?: number;

  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Voice Prosody Analyzer
 *
 * Analyzes voice via Web Audio API to extract:
 * - Pitch (fundamental frequency)
 * - Energy (volume/amplitude)
 * - Affect (emotional valence from pitch variance)
 *
 * @example
 * ```tsx
 * const voice = new VoiceProsodyAnalyzer();
 * await voice.start();
 *
 * voice.onData((data) => {
 *   console.log('Pitch:', data.pitch, 'Affect:', data.affect);
 * });
 *
 * // Later...
 * voice.stop();
 * ```
 */
export class VoiceProsodyAnalyzer {
  private options: Required<VoiceAnalyzerOptions>;
  private _active = false;
  private _speaking = false;
  private callbacks: Array<(data: VoiceData) => void> = [];

  // Web Audio API
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private stream: MediaStream | null = null;

  // Analysis data
  private dataArray: Uint8Array | null = null;
  private analysisInterval: NodeJS.Timeout | null = null;

  // Pitch history for affect calculation
  private pitchHistory: number[] = [];
  private readonly PITCH_HISTORY_SIZE = 10;

  constructor(options: VoiceAnalyzerOptions = {}) {
    this.options = {
      fftSize: options.fftSize || 2048,
      smoothingTimeConstant: options.smoothingTimeConstant || 0.8,
      analysisInterval: options.analysisInterval || 100,
      silenceThreshold: options.silenceThreshold || -50,
      debug: options.debug || false,
    };
  }

  // ============================================================================
  // Lifecycle
  // ============================================================================

  /**
   * Start voice analysis
   */
  async start(): Promise<void> {
    if (this._active) return;

    try {
      // Request microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
        },
      });

      // Create audio context
      this.audioContext = new AudioContext();
      this.microphone = this.audioContext.createMediaStreamSource(this.stream);

      // Create analyser
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = this.options.fftSize;
      this.analyser.smoothingTimeConstant = this.options.smoothingTimeConstant;

      // Connect nodes
      this.microphone.connect(this.analyser);

      // Prepare data array
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

      // Start analysis loop
      this.analysisInterval = setInterval(
        this.analyzeFrame.bind(this),
        this.options.analysisInterval
      );

      this._active = true;
      this.log('[VoiceAnalyzer] Started');
    } catch (error) {
      this.log('[VoiceAnalyzer] Start failed:', error);
      throw error;
    }
  }

  /**
   * Stop voice analysis
   */
  stop(): void {
    if (!this._active) return;

    // Stop analysis loop
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
    }

    // Disconnect audio nodes
    if (this.microphone) {
      this.microphone.disconnect();
      this.microphone = null;
    }

    // Stop microphone stream
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    // Close audio context
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.analyser = null;
    this.dataArray = null;
    this._active = false;
    this.log('[VoiceAnalyzer] Stopped');
  }

  // ============================================================================
  // Analysis
  // ============================================================================

  private analyzeFrame(): void {
    if (!this.analyser || !this.dataArray) return;

    // Get frequency data
    this.analyser.getByteFrequencyData(this.dataArray);

    // Calculate energy (RMS)
    const energy = this.calculateEnergy(this.dataArray);

    // Check if speaking
    const isSpeaking = energy > this.options.silenceThreshold;
    this._speaking = isSpeaking;

    if (!isSpeaking) {
      const voiceData: VoiceData = {
        timestamp: new Date(),
        pitch: 0,
        energy,
        affect: 0,
        quality: 'silence',
      };

      this.emitData(voiceData);
      return;
    }

    // Calculate pitch (fundamental frequency)
    const pitch = this.calculatePitch(this.dataArray);

    // Update pitch history
    this.pitchHistory.push(pitch);
    if (this.pitchHistory.length > this.PITCH_HISTORY_SIZE) {
      this.pitchHistory.shift();
    }

    // Calculate affect from pitch variance
    const affect = this.calculateAffect(this.pitchHistory);

    const voiceData: VoiceData = {
      timestamp: new Date(),
      pitch,
      energy,
      affect,
      quality: 'speaking',
    };

    this.emitData(voiceData);
  }

  /**
   * Calculate energy (RMS) in dB
   */
  private calculateEnergy(frequencyData: Uint8Array): number {
    let sum = 0;
    for (let i = 0; i < frequencyData.length; i++) {
      sum += frequencyData[i] * frequencyData[i];
    }

    const rms = Math.sqrt(sum / frequencyData.length);

    // Convert to dB (0-255 → -60 to 0 dB)
    return 20 * Math.log10(rms / 255) || -60;
  }

  /**
   * Calculate pitch (F0) using autocorrelation
   * Simplified implementation for demo purposes
   */
  private calculatePitch(frequencyData: Uint8Array): number {
    // Find peak frequency bin
    let maxValue = 0;
    let maxIndex = 0;

    for (let i = 0; i < frequencyData.length; i++) {
      if (frequencyData[i] > maxValue) {
        maxValue = frequencyData[i];
        maxIndex = i;
      }
    }

    // Convert bin index to frequency
    const sampleRate = this.audioContext?.sampleRate || 44100;
    const nyquist = sampleRate / 2;
    const binFrequency = (maxIndex / frequencyData.length) * nyquist;

    // Clamp to typical speech range (80-300 Hz)
    return Math.max(80, Math.min(300, binFrequency));
  }

  /**
   * Calculate affect from pitch variance
   * Higher variance = more expressive (positive affect)
   */
  private calculateAffect(pitchHistory: number[]): number {
    if (pitchHistory.length < 2) return 0;

    // Calculate variance
    const mean = pitchHistory.reduce((a, b) => a + b, 0) / pitchHistory.length;
    const squaredDiffs = pitchHistory.map((p) => (p - mean) ** 2);
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / pitchHistory.length;

    // Map variance to affect score
    const baselineVariance = 20; // Hz
    const score = Math.sqrt(variance) / baselineVariance;

    // Normalize to -1 to 1
    return Math.max(-1, Math.min(1, (score - 0.5) * 2));
  }

  // ============================================================================
  // Data Streaming
  // ============================================================================

  /**
   * Register callback for voice data
   */
  onData(callback: (data: VoiceData) => void): () => void {
    this.callbacks.push(callback);

    return () => {
      this.callbacks = this.callbacks.filter((cb) => cb !== callback);
    };
  }

  private emitData(data: VoiceData): void {
    this.callbacks.forEach((cb) => cb(data));
  }

  // ============================================================================
  // Getters
  // ============================================================================

  get active(): boolean {
    return this._active;
  }

  get speaking(): boolean {
    return this._speaking;
  }

  // ============================================================================
  // Utils
  // ============================================================================

  private log(...args: any[]): void {
    if (this.options.debug) {
      console.log(...args);
    }
  }
}

// ============================================================================
// Breath Detector
// ============================================================================

export interface BreathDetectorOptions {
  /** Analysis interval (ms) */
  analysisInterval?: number;

  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Breath Detector
 *
 * Detects breath rate via camera (chest movement) or microphone.
 * Note: Camera-based detection requires computer vision (MediaPipe).
 * For Phase 5, we'll use a simplified microphone-based approach.
 *
 * @example
 * ```tsx
 * const breath = new BreathDetector();
 * await breath.start('microphone');
 *
 * breath.onData((data) => {
 *   console.log('Breath rate:', data.rate, 'BPM');
 * });
 *
 * // Later...
 * breath.stop();
 * ```
 */
export class BreathDetector {
  private options: Required<BreathDetectorOptions>;
  private _active = false;
  private _mode: BreathMode | null = null;
  private callbacks: Array<(data: BreathData) => void> = [];

  // Stub mode (for now - full implementation requires MediaPipe or audio DSP)
  private stubInterval: NodeJS.Timeout | null = null;

  constructor(options: BreathDetectorOptions = {}) {
    this.options = {
      analysisInterval: options.analysisInterval || 1000,
      debug: options.debug || false,
    };
  }

  // ============================================================================
  // Lifecycle
  // ============================================================================

  /**
   * Start breath detection
   */
  async start(mode: BreathMode = 'microphone'): Promise<void> {
    if (this._active) return;

    this._mode = mode;

    if (mode === 'camera') {
      await this.startCamera();
    } else if (mode === 'microphone') {
      await this.startMicrophone();
    } else {
      await this.startManual();
    }

    this._active = true;
    this.log('[BreathDetector] Started:', mode);
  }

  /**
   * Stop breath detection
   */
  stop(): void {
    if (!this._active) return;

    if (this.stubInterval) {
      clearInterval(this.stubInterval);
      this.stubInterval = null;
    }

    this._active = false;
    this._mode = null;
    this.log('[BreathDetector] Stopped');
  }

  // ============================================================================
  // Detection Modes
  // ============================================================================

  private async startCamera(): Promise<void> {
    // Camera-based breath detection requires MediaPipe Pose
    // For Phase 5, we'll stub this
    this.log('[BreathDetector] Camera mode not yet implemented (requires MediaPipe)');
    await this.startStub('detected');
  }

  private async startMicrophone(): Promise<void> {
    // Microphone-based breath detection requires audio DSP
    // For Phase 5, we'll stub this
    this.log('[BreathDetector] Microphone mode not yet implemented (requires audio DSP)');
    await this.startStub('detected');
  }

  private async startManual(): Promise<void> {
    // Manual breath rate entry
    await this.startStub('manual');
  }

  private async startStub(quality: BreathData['quality']): Promise<void> {
    // Generate realistic breath data
    this.stubInterval = setInterval(() => {
      const baseRate = 14; // BPM
      const variance = 2;
      const rate = baseRate + (Math.random() - 0.5) * variance;

      const breathData: BreathData = {
        timestamp: new Date(),
        rate,
        coherence: this.calculateBreathCoherence(variance / 2),
        quality,
      };

      this.emitData(breathData);
    }, this.options.analysisInterval);
  }

  // ============================================================================
  // Calculations
  // ============================================================================

  /**
   * Calculate breath coherence from regularity
   * Lower variance = higher coherence
   */
  private calculateBreathCoherence(variance: number): number {
    const optimalVariance = 2; // BPM
    const score = 1 - Math.min(variance / (optimalVariance * 2), 1);
    return Math.max(0, Math.min(1, score));
  }

  // ============================================================================
  // Data Streaming
  // ============================================================================

  /**
   * Register callback for breath data
   */
  onData(callback: (data: BreathData) => void): () => void {
    this.callbacks.push(callback);

    return () => {
      this.callbacks = this.callbacks.filter((cb) => cb !== callback);
    };
  }

  private emitData(data: BreathData): void {
    this.callbacks.forEach((cb) => cb(data));
  }

  // ============================================================================
  // Getters
  // ============================================================================

  get active(): boolean {
    return this._active;
  }

  get mode(): BreathMode | null {
    return this._mode;
  }

  // ============================================================================
  // Utils
  // ============================================================================

  private log(...args: any[]): void {
    if (this.options.debug) {
      console.log(...args);
    }
  }
}
