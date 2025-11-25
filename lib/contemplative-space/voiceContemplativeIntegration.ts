/**
 * 🎙️ Voice Contemplative Integration
 * 
 * Special considerations for contemplative space in voice conversations
 * Natural pauses, breath awareness, and sacred silence
 */

export interface VoiceContemplativeConfig {
  silenceDetectionThreshold: number; // ms of silence before considered pause
  naturalPauseLength: number; // ms to wait before responding
  breathAwareness: boolean; // Detect and respect breathing patterns
  ambientSounds: boolean; // Optional background presence sounds
  voiceModulation: 'normal' | 'soft' | 'whisper' | 'slow';
}

/**
 * 🌬️ Breath Detection System
 * Recognizing natural breathing patterns in voice
 */
export class BreathDetector {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private breathPattern: number[] = [];
  private lastBreathTime: number = 0;
  
  /**
   * Initialize audio analysis
   */
  async initialize(stream: MediaStream) {
    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    
    const source = this.audioContext.createMediaStreamSource(stream);
    source.connect(this.analyser);
    
    this.analyser.fftSize = 256;
    this.startBreathDetection();
  }
  
  /**
   * Detect breathing patterns
   */
  private startBreathDetection() {
    const bufferLength = this.analyser!.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const detectBreath = () => {
      if (!this.analyser) return;
      
      this.analyser.getByteFrequencyData(dataArray);
      
      // Low frequency analysis for breath sounds
      const breathFrequencies = dataArray.slice(0, 10);
      const breathLevel = breathFrequencies.reduce((a, b) => a + b, 0) / 10;
      
      // Detect inhale/exhale pattern
      if (breathLevel > 30 && Date.now() - this.lastBreathTime > 1500) {
        this.breathPattern.push(Date.now());
        this.lastBreathTime = Date.now();
      }
      
      requestAnimationFrame(detectBreath);
    };
    
    detectBreath();
  }
  
  /**
   * Get current breathing rate
   */
  getBreathingRate(): number {
    if (this.breathPattern.length < 2) return 12; // Default 12 breaths/min
    
    const recent = this.breathPattern.slice(-5);
    const intervals = [];
    
    for (let i = 1; i < recent.length; i++) {
      intervals.push(recent[i] - recent[i-1]);
    }
    
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    return 60000 / avgInterval; // Breaths per minute
  }
  
  /**
   * Detect if user is in contemplative breathing
   */
  isContemplativeBreathing(): boolean {
    const rate = this.getBreathingRate();
    return rate >= 4 && rate <= 8; // Deep, slow breathing
  }
}

/**
 * 🔇 Sacred Silence Manager
 * Understanding different qualities of silence in voice
 */
export class SacredSilenceManager {
  private silenceStart: number = 0;
  private silenceType: 'processing' | 'contemplating' | 'complete' | null = null;
  private audioLevel: number = 0;
  
  /**
   * Process audio level to detect silence
   */
  processAudioLevel(level: number) {
    this.audioLevel = level;
    
    // Silence detected
    if (level < 10) {
      if (this.silenceStart === 0) {
        this.silenceStart = Date.now();
      }
      
      const silenceDuration = Date.now() - this.silenceStart;
      this.classifySilence(silenceDuration);
    } else {
      // Sound detected, reset
      this.silenceStart = 0;
      this.silenceType = null;
    }
  }
  
  /**
   * Classify the quality of silence
   */
  private classifySilence(duration: number) {
    if (duration < 2000) {
      this.silenceType = null; // Natural pause
    } else if (duration < 5000) {
      this.silenceType = 'processing';
    } else if (duration < 15000) {
      this.silenceType = 'contemplating';
    } else {
      this.silenceType = 'complete';
    }
  }
  
  /**
   * Get appropriate Maya response to silence
   */
  getSilenceResponse(): { 
    shouldRespond: boolean; 
    responseType: 'verbal' | 'ambient' | 'none';
    message?: string;
  } {
    switch(this.silenceType) {
      case 'processing':
        return { 
          shouldRespond: false, 
          responseType: 'none' 
        };
        
      case 'contemplating':
        return { 
          shouldRespond: true, 
          responseType: 'ambient' // Just ambient presence sound
        };
        
      case 'complete':
        return {
          shouldRespond: true,
          responseType: 'verbal',
          message: "I'm here when you're ready."
        };
        
      default:
        return { 
          shouldRespond: false, 
          responseType: 'none' 
        };
    }
  }
}

/**
 * 🎵 Ambient Presence Sounds
 * Non-verbal audio cues for presence
 */
export class AmbientPresenceSounds {
  private audioContext: AudioContext;
  
  constructor() {
    this.audioContext = new AudioContext();
  }
  
  /**
   * Play a gentle presence tone
   */
  async playPresenceTone(type: 'breath' | 'bell' | 'hum' | 'silence') {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    switch(type) {
      case 'breath':
        // Soft white noise like breath
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(100, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.05, this.audioContext.currentTime + 2);
        gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 4);
        break;
        
      case 'bell':
        // Soft bell tone
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(528, this.audioContext.currentTime); // Love frequency
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 3);
        break;
        
      case 'hum':
        // Low presence hum
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(136.1, this.audioContext.currentTime); // Om frequency
        gainNode.gain.setValueAtTime(0.03, this.audioContext.currentTime);
        break;
        
      case 'silence':
        // Just space
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        break;
    }
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 5);
  }
}

/**
 * 🗣️ Voice Modulation for Contemplative Space
 */
export class ContemplativeVoiceModulator {
  /**
   * Adjust TTS parameters for contemplative delivery
   */
  modulateVoiceSettings(
    baseSettings: any,
    contemplativeMode: 'normal' | 'soft' | 'whisper' | 'slow'
  ): any {
    const modulated = { ...baseSettings };
    
    switch(contemplativeMode) {
      case 'soft':
        modulated.volume = (modulated.volume || 1) * 0.7;
        modulated.pitch = (modulated.pitch || 1) * 0.95;
        break;
        
      case 'whisper':
        modulated.volume = (modulated.volume || 1) * 0.4;
        modulated.pitch = (modulated.pitch || 1) * 1.1;
        modulated.breathiness = 0.8;
        break;
        
      case 'slow':
        modulated.rate = (modulated.rate || 1) * 0.8;
        modulated.pauseLength = (modulated.pauseLength || 500) * 1.5;
        break;
        
      case 'normal':
      default:
        // Keep base settings
        break;
    }
    
    return modulated;
  }
  
  /**
   * Add natural pauses to text
   */
  addContemplativePauses(text: string, depth: 'surface' | 'deep'): string {
    if (depth === 'surface') return text;
    
    // Add pauses after sentences
    let pausedText = text.replace(/\. /g, '. ... ');
    
    // Add pauses after questions
    pausedText = pausedText.replace(/\? /g, '? ... ... ');
    
    // Add breath pauses in longer sentences
    const sentences = pausedText.split(/[.!?]/);
    pausedText = sentences.map(sentence => {
      if (sentence.split(' ').length > 15) {
        // Add mid-sentence pause
        const words = sentence.split(' ');
        const midPoint = Math.floor(words.length / 2);
        words.splice(midPoint, 0, '...');
        return words.join(' ');
      }
      return sentence;
    }).join('. ');
    
    return pausedText;
  }
}

/**
 * 🎙️ Voice Conversation Rhythm Tracker
 */
export class VoiceRhythmTracker {
  private turnTakingPattern: number[] = [];
  private userSpeakingDurations: number[] = [];
  private mayaSpeakingDurations: number[] = [];
  private silenceDurations: number[] = [];
  
  /**
   * Record user speaking duration
   */
  recordUserTurn(duration: number) {
    this.userSpeakingDurations.push(duration);
    this.turnTakingPattern.push(Date.now());
  }
  
  /**
   * Record Maya speaking duration
   */
  recordMayaTurn(duration: number) {
    this.mayaSpeakingDurations.push(duration);
  }
  
  /**
   * Record silence duration
   */
  recordSilence(duration: number) {
    this.silenceDurations.push(duration);
  }
  
  /**
   * Determine optimal response timing based on rhythm
   */
  getOptimalResponseDelay(): number {
    // If user takes long turns, Maya should pause more
    const avgUserDuration = this.average(this.userSpeakingDurations);
    
    if (avgUserDuration > 10000) {
      // User speaks at length, give more processing time
      return 3000 + Math.random() * 2000;
    } else if (avgUserDuration < 3000) {
      // Quick exchanges
      return 1000 + Math.random() * 1000;
    } else {
      // Balanced rhythm
      return 2000 + Math.random() * 1500;
    }
  }
  
  /**
   * Detect if conversation is in contemplative rhythm
   */
  isContemplativeRhythm(): boolean {
    const avgSilence = this.average(this.silenceDurations);
    const avgUserDuration = this.average(this.userSpeakingDurations);
    
    // Long pauses and thoughtful speaking
    return avgSilence > 3000 && avgUserDuration > 8000;
  }
  
  private average(nums: number[]): number {
    if (nums.length === 0) return 0;
    return nums.reduce((a, b) => a + b, 0) / nums.length;
  }
}

/**
 * 🎯 Master Voice Contemplative Controller
 */
export class VoiceContemplativeController {
  private breathDetector = new BreathDetector();
  private silenceManager = new SacredSilenceManager();
  private ambientSounds = new AmbientPresenceSounds();
  private voiceModulator = new ContemplativeVoiceModulator();
  private rhythmTracker = new VoiceRhythmTracker();
  
  private config: VoiceContemplativeConfig = {
    silenceDetectionThreshold: 2000,
    naturalPauseLength: 2500,
    breathAwareness: true,
    ambientSounds: true,
    voiceModulation: 'normal'
  };
  
  /**
   * Initialize voice contemplative features
   */
  async initialize(mediaStream: MediaStream, config?: Partial<VoiceContemplativeConfig>) {
    this.config = { ...this.config, ...config };
    
    if (this.config.breathAwareness) {
      await this.breathDetector.initialize(mediaStream);
    }
  }
  
  /**
   * Process voice input for contemplative response
   */
  processVoiceInput(
    audioLevel: number,
    userSpeakingDuration: number
  ): {
    shouldWait: boolean;
    waitDuration: number;
    ambientResponse?: 'breath' | 'bell' | 'hum';
    voiceModulation: 'normal' | 'soft' | 'whisper' | 'slow';
  } {
    // Update tracking
    this.silenceManager.processAudioLevel(audioLevel);
    this.rhythmTracker.recordUserTurn(userSpeakingDuration);
    
    // Check if user is in contemplative breathing
    if (this.config.breathAwareness && this.breathDetector.isContemplativeBreathing()) {
      // Match their contemplative state
      return {
        shouldWait: true,
        waitDuration: 4000,
        ambientResponse: 'breath',
        voiceModulation: 'whisper'
      };
    }
    
    // Check silence type
    const silenceResponse = this.silenceManager.getSilenceResponse();
    if (silenceResponse.responseType === 'ambient') {
      return {
        shouldWait: true,
        waitDuration: 2000,
        ambientResponse: 'hum',
        voiceModulation: 'soft'
      };
    }
    
    // Determine rhythm-based response
    const optimalDelay = this.rhythmTracker.getOptimalResponseDelay();
    const isContemplative = this.rhythmTracker.isContemplativeRhythm();
    
    return {
      shouldWait: true,
      waitDuration: optimalDelay,
      voiceModulation: isContemplative ? 'slow' : 'normal'
    };
  }
  
  /**
   * Prepare Maya's voice response
   */
  prepareVoiceResponse(
    text: string,
    contemplativeDepth: 'surface' | 'exploring' | 'deep'
  ): {
    processedText: string;
    ttsSettings: any;
    preResponseAction?: () => Promise<void>;
  } {
    // Add natural pauses to text
    const processedText = this.voiceModulator.addContemplativePauses(
      text, 
      contemplativeDepth === 'deep' ? 'deep' : 'surface'
    );
    
    // Determine voice modulation
    const voiceMode = contemplativeDepth === 'deep' ? 'soft' : 
                      contemplativeDepth === 'exploring' ? 'slow' : 'normal';
    
    // Get TTS settings
    const ttsSettings = this.voiceModulator.modulateVoiceSettings(
      { rate: 1, volume: 1, pitch: 1 },
      voiceMode
    );
    
    // Pre-response ambient sound if needed
    const preResponseAction = contemplativeDepth === 'deep' 
      ? async () => await this.ambientSounds.playPresenceTone('bell')
      : undefined;
    
    return {
      processedText,
      ttsSettings,
      preResponseAction
    };
  }
}

/**
 * Export configured instance
 */
let _voiceContemplative: VoiceContemplativeController | null = null;
export const getVoiceContemplative = (): VoiceContemplativeController => {
  if (!_voiceContemplative) {
    _voiceContemplative = new VoiceContemplativeController();
  }
  return _voiceContemplative;
};