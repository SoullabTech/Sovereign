// Voice Capture and Analysis - Maps voice to sacred motion
export interface VoiceState {
  amplitude: number;      // 0.0-1.0, maps to petal expansion
  pitch: number;          // frequency in Hz, maps to shimmer speed
  emotion: 'calm' | 'excited' | 'sad' | 'anxious' | 'neutral';
  isSpeaking: boolean;
  energy: number;         // 0.0-1.0, overall energy level
  clarity: number;        // 0.0-1.0, voice clarity/coherence
  breathDepth: number;    // 0.0-1.0, breathing quality
}

export interface VoiceAnalyzer {
  start(): Promise<void>;
  stop(): void;
  getState(): VoiceState;
  onStateChange(callback: (state: VoiceState) => void): void;
}

export class SacredVoiceAnalyzer implements VoiceAnalyzer {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private stream: MediaStream | null = null;
  private animationFrame: number | null = null;
  private stateChangeCallbacks: ((state: VoiceState) => void)[] = [];
  
  private currentState: VoiceState = {
    amplitude: 0,
    pitch: 0,
    emotion: 'neutral',
    isSpeaking: false,
    energy: 0,
    clarity: 0,
    breathDepth: 0
  };

  private amplitudeHistory: number[] = [];
  private pitchHistory: number[] = [];
  private silenceCounter: number = 0;

  async start(): Promise<void> {
    try {
      // Request microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      // Setup Web Audio API
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.8;

      this.microphone = this.audioContext.createMediaStreamSource(this.stream);
      this.microphone.connect(this.analyser);

      // Start analysis loop
      this.analyze();
    } catch (error) {
      console.error('Failed to start voice capture:', error);
      throw error;
    }
  }

  stop(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    if (this.microphone) {
      this.microphone.disconnect();
      this.microphone = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.analyser = null;
  }

  private analyze = (): void => {
    if (!this.analyser) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const frequencyData = new Float32Array(bufferLength);

    this.analyser.getByteTimeDomainData(dataArray);
    this.analyser.getFloatFrequencyData(frequencyData);

    // Calculate amplitude (volume)
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      const normalized = (dataArray[i] - 128) / 128;
      sum += normalized * normalized;
    }
    const rms = Math.sqrt(sum / bufferLength);
    const amplitude = Math.min(1, rms * 3); // Scale and cap at 1

    // Calculate dominant pitch
    const pitch = this.calculatePitch(frequencyData);

    // Update amplitude history for breath detection
    this.amplitudeHistory.push(amplitude);
    if (this.amplitudeHistory.length > 100) {
      this.amplitudeHistory.shift();
    }

    // Update pitch history for stability detection
    this.pitchHistory.push(pitch);
    if (this.pitchHistory.length > 50) {
      this.pitchHistory.shift();
    }

    // Detect if speaking
    const isSpeaking = amplitude > 0.05;
    if (!isSpeaking) {
      this.silenceCounter++;
    } else {
      this.silenceCounter = 0;
    }

    // Calculate energy (average amplitude over time)
    const energy = this.amplitudeHistory.reduce((a, b) => a + b, 0) / this.amplitudeHistory.length;

    // Calculate clarity (pitch stability)
    const pitchVariance = this.calculateVariance(this.pitchHistory);
    const clarity = Math.max(0, 1 - (pitchVariance / 1000)); // Normalize variance

    // Calculate breath depth (amplitude variation patterns)
    const breathDepth = this.detectBreathingPattern(this.amplitudeHistory);

    // Detect emotion from voice characteristics
    const emotion = this.detectEmotion(amplitude, pitch, energy, clarity);

    // Update state
    const newState: VoiceState = {
      amplitude,
      pitch,
      emotion,
      isSpeaking: this.silenceCounter < 10, // Allow for brief pauses
      energy,
      clarity,
      breathDepth
    };

    // Check if state changed significantly
    if (this.hasStateChanged(this.currentState, newState)) {
      this.currentState = newState;
      this.notifyStateChange(newState);
    }

    // Continue analysis
    this.animationFrame = requestAnimationFrame(this.analyze);
  };

  private calculatePitch(frequencyData: Float32Array): number {
    // Find the dominant frequency
    let maxValue = -Infinity;
    let maxIndex = 0;

    for (let i = 0; i < frequencyData.length; i++) {
      if (frequencyData[i] > maxValue) {
        maxValue = frequencyData[i];
        maxIndex = i;
      }
    }

    // Convert bin to frequency
    const nyquist = this.audioContext!.sampleRate / 2;
    const pitch = (maxIndex * nyquist) / frequencyData.length;

    return pitch;
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    
    return variance;
  }

  private detectBreathingPattern(amplitudes: number[]): number {
    if (amplitudes.length < 30) return 0.5;

    // Look for rhythmic patterns in amplitude
    let peakCount = 0;
    let valleyCount = 0;
    
    for (let i = 1; i < amplitudes.length - 1; i++) {
      if (amplitudes[i] > amplitudes[i - 1] && amplitudes[i] > amplitudes[i + 1]) {
        peakCount++;
      }
      if (amplitudes[i] < amplitudes[i - 1] && amplitudes[i] < amplitudes[i + 1]) {
        valleyCount++;
      }
    }

    // Regular breathing shows consistent peaks and valleys
    const regularity = Math.min(peakCount, valleyCount) / Math.max(peakCount, valleyCount, 1);
    const breathDepth = regularity * this.calculateVariance(amplitudes) * 10; // Scale variance
    
    return Math.min(1, breathDepth);
  }

  private detectEmotion(
    amplitude: number,
    pitch: number,
    energy: number,
    clarity: number
  ): VoiceState['emotion'] {
    // Simple emotion detection based on voice characteristics
    if (energy < 0.2 && clarity > 0.7) return 'calm';
    if (energy > 0.6 && pitch > 300) return 'excited';
    if (energy < 0.3 && pitch < 200) return 'sad';
    if (clarity < 0.4 && energy > 0.5) return 'anxious';
    return 'neutral';
  }

  private hasStateChanged(oldState: VoiceState, newState: VoiceState): boolean {
    const threshold = 0.1;
    
    return (
      Math.abs(oldState.amplitude - newState.amplitude) > threshold ||
      Math.abs(oldState.pitch - newState.pitch) > 50 ||
      oldState.emotion !== newState.emotion ||
      oldState.isSpeaking !== newState.isSpeaking ||
      Math.abs(oldState.energy - newState.energy) > threshold ||
      Math.abs(oldState.clarity - newState.clarity) > threshold ||
      Math.abs(oldState.breathDepth - newState.breathDepth) > threshold
    );
  }

  private notifyStateChange(state: VoiceState): void {
    this.stateChangeCallbacks.forEach(callback => callback(state));
  }

  getState(): VoiceState {
    return { ...this.currentState };
  }

  onStateChange(callback: (state: VoiceState) => void): void {
    this.stateChangeCallbacks.push(callback);
  }

  removeStateChangeListener(callback: (state: VoiceState) => void): void {
    const index = this.stateChangeCallbacks.indexOf(callback);
    if (index > -1) {
      this.stateChangeCallbacks.splice(index, 1);
    }
  }
}

// Helper function to create voice analyzer
export function createVoiceAnalyzer(): VoiceAnalyzer {
  return new SacredVoiceAnalyzer();
}

// Hook for React components
import { useState, useEffect, useRef } from 'react';

export function useVoiceCapture() {
  const [voiceState, setVoiceState] = useState<VoiceState>({
    amplitude: 0,
    pitch: 0,
    emotion: 'neutral',
    isSpeaking: false,
    energy: 0,
    clarity: 0,
    breathDepth: 0
  });
  
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const analyzerRef = useRef<VoiceAnalyzer | null>(null);

  const startCapture = async () => {
    try {
      const analyzer = createVoiceAnalyzer();
      await analyzer.start();
      
      analyzer.onStateChange((state) => {
        setVoiceState(state);
      });
      
      analyzerRef.current = analyzer;
      setIsCapturing(true);
      setError(null);
    } catch (err) {
      setError('Failed to access microphone');
      console.error(err);
    }
  };

  const stopCapture = () => {
    if (analyzerRef.current) {
      analyzerRef.current.stop();
      analyzerRef.current = null;
      setIsCapturing(false);
    }
  };

  useEffect(() => {
    return () => {
      if (analyzerRef.current) {
        analyzerRef.current.stop();
      }
    };
  }, []);

  return {
    voiceState,
    isCapturing,
    error,
    startCapture,
    stopCapture
  };
}