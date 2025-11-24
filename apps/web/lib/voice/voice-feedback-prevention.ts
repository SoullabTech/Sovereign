// frontend
// apps/web/lib/voice/voice-feedback-prevention.ts

/**
 * Voice Feedback Prevention for MAIA continuous conversation.
 * Prevents audio feedback loops and manages echo cancellation
 * when using simultaneous voice input and output.
 */

export interface FeedbackPreventionConfig {
  /**
   * Enable echo cancellation
   */
  echoCancellation: boolean;

  /**
   * Enable noise suppression
   */
  noiseSuppression: boolean;

  /**
   * Auto gain control
   */
  autoGainControl: boolean;

  /**
   * Feedback detection sensitivity (0-1)
   */
  sensitivity: number;

  /**
   * Feedback suppression strength (0-1)
   */
  suppressionStrength: number;

  /**
   * Audio processing latency tolerance (ms)
   */
  latencyTolerance: number;

  /**
   * Enable real-time audio monitoring
   */
  enableMonitoring: boolean;
}

export interface FeedbackDetectionResult {
  /**
   * Whether feedback is detected
   */
  detected: boolean;

  /**
   * Confidence level of detection (0-1)
   */
  confidence: number;

  /**
   * Frequency where feedback is detected (Hz)
   */
  frequency?: number;

  /**
   * Recommended action
   */
  action: 'none' | 'reduce_gain' | 'mute_output' | 'adjust_filters';

  /**
   * Timestamp of detection
   */
  timestamp: Date;
}

export interface AudioProcessingState {
  /**
   * Current input gain level (0-1)
   */
  inputGain: number;

  /**
   * Current output gain level (0-1)
   */
  outputGain: number;

  /**
   * Echo cancellation status
   */
  echoCancellationActive: boolean;

  /**
   * Noise suppression status
   */
  noiseSuppressionActive: boolean;

  /**
   * Feedback prevention status
   */
  feedbackPreventionActive: boolean;
}

/**
 * Default configuration for feedback prevention
 */
const DEFAULT_CONFIG: FeedbackPreventionConfig = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
  sensitivity: 0.7,
  suppressionStrength: 0.8,
  latencyTolerance: 100, // ms
  enableMonitoring: true,
};

/**
 * Voice Feedback Prevention class
 */
export class VoiceFeedbackPrevention {
  private static instance: VoiceFeedbackPrevention | null = null;

  private config: FeedbackPreventionConfig;
  private audioContext: AudioContext | null = null;
  private analyserNode: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  private isActive: boolean = false;
  private monitoringInterval: number | null = null;
  private registeredRecognition: any = null;

  // Audio processing nodes
  private inputStream: MediaStream | null = null;
  private outputStream: MediaStream | null = null;

  // Feedback detection
  private frequencyData: Uint8Array = new Uint8Array(2048);
  private lastDetection: FeedbackDetectionResult | null = null;

  constructor(config?: Partial<FeedbackPreventionConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get singleton instance
   */
  static getInstance(): VoiceFeedbackPrevention {
    if (!VoiceFeedbackPrevention.instance) {
      VoiceFeedbackPrevention.instance = new VoiceFeedbackPrevention();
      console.log('🎙️ [VoiceFeedbackPrevention] Created singleton instance');
    }
    return VoiceFeedbackPrevention.instance;
  }

  /**
   * Initialize feedback prevention system
   */
  async initialize(): Promise<void> {
    console.log('🎙️ [VoiceFeedbackPrevention] Initializing audio processing...');

    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Create audio processing nodes
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 4096;
      this.analyserNode.smoothingTimeConstant = 0.3;

      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = 1.0;

      // Setup frequency analysis buffer
      this.frequencyData = new Uint8Array(this.analyserNode.frequencyBinCount);

      this.isActive = true;

      console.log('✅ [VoiceFeedbackPrevention] Audio processing initialized');
    } catch (error) {
      console.warn('[VoiceFeedbackPrevention] Failed to initialize:', error);
      // Fallback to basic functionality without Web Audio API
      this.isActive = false;
    }
  }

  /**
   * Connect input audio stream for monitoring
   */
  async connectInputStream(stream: MediaStream): Promise<void> {
    if (!this.audioContext || !this.analyserNode) {
      console.warn('[VoiceFeedbackPrevention] Not initialized');
      return;
    }

    try {
      this.inputStream = stream;

      // Create source node from stream
      const source = this.audioContext.createMediaStreamSource(stream);

      // Connect processing chain
      source.connect(this.analyserNode);

      if (this.config.enableMonitoring) {
        this.startMonitoring();
      }

      console.log('🎙️ [VoiceFeedbackPrevention] Input stream connected');
    } catch (error) {
      console.warn('[VoiceFeedbackPrevention] Failed to connect input stream:', error);
    }
  }

  /**
   * Start real-time feedback monitoring
   */
  private startMonitoring(): void {
    if (this.monitoringInterval !== null) {
      return; // Already monitoring
    }

    this.monitoringInterval = window.setInterval(() => {
      this.analyzeAudioForFeedback();
    }, 50); // Check every 50ms

    console.log('👂 [VoiceFeedbackPrevention] Started real-time monitoring');
  }

  /**
   * Analyze audio data for feedback patterns
   */
  private analyzeAudioForFeedback(): FeedbackDetectionResult {
    if (!this.analyserNode) {
      return {
        detected: false,
        confidence: 0,
        action: 'none',
        timestamp: new Date(),
      };
    }

    // Get frequency domain data
    this.analyserNode.getByteFrequencyData(this.frequencyData);

    // Analyze for feedback characteristics
    const result = this.detectFeedbackPatterns(this.frequencyData);

    if (result.detected && result.confidence > this.config.sensitivity) {
      console.warn('⚠️ [VoiceFeedbackPrevention] Feedback detected:', result);
      this.applyFeedbackSuppression(result);
    }

    this.lastDetection = result;
    return result;
  }

  /**
   * Detect feedback patterns in frequency data
   */
  private detectFeedbackPatterns(frequencyData: Uint8Array): FeedbackDetectionResult {
    let maxPeak = 0;
    let peakFrequency = 0;
    let peakCount = 0;

    // Analyze frequency bins for sharp peaks (feedback characteristics)
    for (let i = 1; i < frequencyData.length - 1; i++) {
      const current = frequencyData[i];
      const prev = frequencyData[i - 1];
      const next = frequencyData[i + 1];

      // Look for sharp peaks
      if (current > prev + 20 && current > next + 20 && current > 150) {
        peakCount++;
        if (current > maxPeak) {
          maxPeak = current;
          // Convert bin index to frequency
          peakFrequency = (i * (this.audioContext?.sampleRate || 44100)) / (2 * frequencyData.length);
        }
      }
    }

    // Feedback detection logic
    const detected = peakCount > 3 || maxPeak > 200;
    const confidence = Math.min(1, (maxPeak - 150) / 100);

    let action: FeedbackDetectionResult['action'] = 'none';
    if (detected) {
      if (confidence > 0.8) action = 'mute_output';
      else if (confidence > 0.6) action = 'reduce_gain';
      else action = 'adjust_filters';
    }

    return {
      detected,
      confidence: Math.max(0, confidence),
      frequency: detected ? peakFrequency : undefined,
      action,
      timestamp: new Date(),
    };
  }

  /**
   * Apply feedback suppression measures
   */
  private applyFeedbackSuppression(detection: FeedbackDetectionResult): void {
    if (!this.gainNode) return;

    switch (detection.action) {
      case 'mute_output':
        this.gainNode.gain.setValueAtTime(0, this.audioContext?.currentTime || 0);
        setTimeout(() => {
          if (this.gainNode) {
            this.gainNode.gain.setValueAtTime(0.3, this.audioContext?.currentTime || 0);
          }
        }, 1000);
        break;

      case 'reduce_gain':
        const currentGain = this.gainNode.gain.value;
        const newGain = Math.max(0.1, currentGain * (1 - this.config.suppressionStrength * 0.5));
        this.gainNode.gain.setValueAtTime(newGain, this.audioContext?.currentTime || 0);
        break;

      case 'adjust_filters':
        // In a full implementation, would adjust frequency filters
        console.log(`🔧 [VoiceFeedbackPrevention] Adjusting filters for frequency ${detection.frequency}Hz`);
        break;
    }
  }

  /**
   * Get current audio processing state
   */
  getProcessingState(): AudioProcessingState {
    return {
      inputGain: this.gainNode?.gain.value || 1.0,
      outputGain: this.gainNode?.gain.value || 1.0,
      echoCancellationActive: this.config.echoCancellation,
      noiseSuppressionActive: this.config.noiseSuppression,
      feedbackPreventionActive: this.isActive,
    };
  }

  /**
   * Get last feedback detection result
   */
  getLastDetection(): FeedbackDetectionResult | null {
    return this.lastDetection;
  }

  /**
   * Register speech recognition for feedback prevention
   */
  registerRecognition(recognition: any): void {
    this.registeredRecognition = recognition;
    console.log('🎤 [VoiceFeedbackPrevention] Speech recognition registered');
  }

  /**
   * Interrupt Maya speech when user starts speaking
   */
  interruptMaya(): void {
    console.log('🛑 [VoiceFeedbackPrevention] Interrupting Maya speech for user input');
    // Stop any currently playing audio
    if (typeof window !== 'undefined') {
      const audioElements = document.querySelectorAll('audio');
      audioElements.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<FeedbackPreventionConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('⚙️ [VoiceFeedbackPrevention] Configuration updated');
  }

  /**
   * Stop monitoring and cleanup
   */
  dispose(): void {
    if (this.monitoringInterval !== null) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }

    this.isActive = false;
    this.inputStream = null;
    this.outputStream = null;

    console.log('🛑 [VoiceFeedbackPrevention] Disposed');
  }
}

/**
 * Create and initialize feedback prevention instance
 */
export async function createFeedbackPrevention(config?: Partial<FeedbackPreventionConfig>): Promise<VoiceFeedbackPrevention> {
  const prevention = new VoiceFeedbackPrevention(config);
  await prevention.initialize();
  return prevention;
}

/**
 * Global feedback prevention instance
 */
let globalFeedbackPrevention: VoiceFeedbackPrevention | null = null;

/**
 * Get or create global feedback prevention instance
 */
export async function getFeedbackPrevention(): Promise<VoiceFeedbackPrevention> {
  if (!globalFeedbackPrevention) {
    globalFeedbackPrevention = await createFeedbackPrevention();
  }
  return globalFeedbackPrevention;
}

/**
 * Default export for the feedback prevention class
 */
export default VoiceFeedbackPrevention;