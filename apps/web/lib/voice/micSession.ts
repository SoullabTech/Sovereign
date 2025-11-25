// lib/voice/micSession.ts
// Mic session management with wake word detection and mode-specific behavior

import { MicSessionConfig, PersonalUtterance, VADEvent, PresenceMode } from './types';
import { WakeWordDetector } from './wakeWord';
import { StreamTranscriber } from './streamTranscribe';
import { ElementalDetector } from './elementalDetect';

export class MicSession {
  private isActive = false;
  private stream?: MediaStream;
  private audioContext?: AudioContext;
  private processor?: ScriptProcessorNode;
  private wakeWordDetector: WakeWordDetector;
  private transcriber: StreamTranscriber;
  private elementalDetector: ElementalDetector;
  private lastSpeechTime = 0;
  private silenceTimer?: NodeJS.Timeout;
  private sessionId: string;

  constructor(private config: MicSessionConfig) {
    this.sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.wakeWordDetector = new WakeWordDetector(config.wakeWord);
    this.transcriber = new StreamTranscriber();
    this.elementalDetector = new ElementalDetector();
  }

  async start(onUtterance: (utterance: PersonalUtterance) => void): Promise<void> {
    if (this.isActive) return;

    try {
      // Request microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: this.config.noiseSupression ?? true,
          autoGainControl: true
        }
      });

      // Setup audio processing
      this.audioContext = new AudioContext();
      const source = this.audioContext.createMediaStreamSource(this.stream);
      this.processor = this.audioContext.createScriptProcessor(2048, 1, 1);

      let audioBuffer: Float32Array[] = [];
      let isListening = !this.config.alwaysOn; // If not always-on, start listening immediately

      this.processor.onaudioprocess = async (e) => {
        const inputData = e.inputBuffer.getChannelData(0);

        // Check for wake word if in always-on mode
        if (this.config.alwaysOn && !isListening) {
          const wakeResult = await this.wakeWordDetector.detect(inputData);
          if (wakeResult.detected) {
            console.log(`Wake word detected: ${wakeResult.keyword}`);
            isListening = true;
            audioBuffer = []; // Clear buffer for fresh start

            // Set timeout for listening window
            setTimeout(() => {
              if (this.config.alwaysOn) {
                isListening = false;
                this.processAudioBuffer(audioBuffer, onUtterance);
                audioBuffer = [];
              }
            }, this.getModeTimeout());
          }
        }

        // Collect audio if listening
        if (isListening) {
          audioBuffer.push(new Float32Array(inputData));

          // Detect speech/silence transitions
          const vadEvent = this.detectVoiceActivity(inputData);
          this.handleVADEvent(vadEvent, audioBuffer, onUtterance);
        }
      };

      source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
      this.isActive = true;

      console.log(`MicSession started in ${this.config.mode} mode`);
    } catch (error) {
      console.error('Failed to start mic session:', error);
      throw error;
    }
  }

  private detectVoiceActivity(buffer: Float32Array): VADEvent {
    // Simple energy-based VAD
    const energy = buffer.reduce((sum, sample) => sum + sample * sample, 0) / buffer.length;
    const threshold = 0.01; // Adjust based on environment

    const now = Date.now();
    const isSpeech = energy > threshold;

    if (isSpeech) {
      this.lastSpeechTime = now;
      return { type: 'speech-start', timestamp: now, confidence: energy * 100 };
    } else if (now - this.lastSpeechTime > this.config.silenceGraceMs) {
      return { type: 'silence', timestamp: now, confidence: 1 };
    } else {
      return { type: 'speech-end', timestamp: now, confidence: 1 };
    }
  }

  private handleVADEvent(
    event: VADEvent,
    audioBuffer: Float32Array[],
    onUtterance: (u: PersonalUtterance) => void
  ) {
    if (event.type === 'silence' && audioBuffer.length > 0) {
      // Process accumulated audio after silence
      this.processAudioBuffer(audioBuffer, onUtterance);
      audioBuffer.length = 0; // Clear buffer
    }

    // Reset silence timer
    if (this.silenceTimer) clearTimeout(this.silenceTimer);

    if (event.type === 'speech-end') {
      // Set timer for end of utterance
      this.silenceTimer = setTimeout(() => {
        if (audioBuffer.length > 0) {
          this.processAudioBuffer(audioBuffer, onUtterance);
          audioBuffer.length = 0;
        }
      }, this.getModeSpecificSilence());
    }
  }

  private async processAudioBuffer(
    audioBuffer: Float32Array[],
    onUtterance: (u: PersonalUtterance) => void
  ) {
    if (audioBuffer.length === 0) return;

    // Concatenate audio chunks
    const totalLength = audioBuffer.reduce((sum, chunk) => sum + chunk.length, 0);
    const fullAudio = new Float32Array(totalLength);
    let offset = 0;
    for (const chunk of audioBuffer) {
      fullAudio.set(chunk, offset);
      offset += chunk.length;
    }

    // Transcribe audio
    const text = await this.transcriber.transcribe(fullAudio);
    if (!text || text.trim().length === 0) return;

    // Detect elements and intents
    const elements = await this.elementalDetector.detect(text);
    const intents = this.detectIntents(text);

    // Create utterance
    const utterance: PersonalUtterance = {
      id: `utt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: this.getUserId(),
      ts: Date.now(),
      mode: this.config.mode,
      text,
      elementBlend: elements,
      intents,
      silenceMsBefore: Date.now() - this.lastSpeechTime,
      emotionalContext: this.detectEmotionalContext(text)
    };

    onUtterance(utterance);
  }

  private detectIntents(text: string): string[] {
    const intents: string[] = [];
    const lower = text.toLowerCase();

    if (lower.includes('?')) intents.push('question');
    if (/tell me|explain|what is/.test(lower)) intents.push('seek-info');
    if (/i feel|i'm feeling/.test(lower)) intents.push('share-emotion');
    if (/help|guide|show me/.test(lower)) intents.push('seek-guidance');
    if (/thank|grateful|appreciate/.test(lower)) intents.push('gratitude');
    if (/breathe|meditate|silence/.test(lower)) intents.push('presence');
    if (/remember|last time|before/.test(lower)) intents.push('recall');

    return intents.length > 0 ? intents : ['general'];
  }

  private detectEmotionalContext(text: string) {
    const lower = text.toLowerCase();

    // Simple valence detection
    let valence = 0;
    if (/happy|joy|excited|love|grateful/.test(lower)) valence = 0.7;
    else if (/sad|hurt|pain|difficult|hard/.test(lower)) valence = -0.7;
    else if (/angry|frustrated|annoyed/.test(lower)) valence = -0.5;
    else if (/calm|peaceful|centered/.test(lower)) valence = 0.3;

    // Simple arousal detection
    let arousal = 0.5;
    if (/!|excited|urgent|amazing/.test(lower)) arousal = 0.8;
    else if (/tired|exhausted|drained/.test(lower)) arousal = 0.2;

    return { valence, arousal };
  }

  private getModeTimeout(): number {
    switch (this.config.mode) {
      case 'conversation': return 30000;  // 30 seconds
      case 'meditation': return 300000;   // 5 minutes
      case 'guided': return 60000;        // 1 minute
    }
  }

  private getModeSpecificSilence(): number {
    switch (this.config.mode) {
      case 'conversation': return 3000;   // 3 seconds
      case 'meditation': return 60000;    // 1 minute
      case 'guided': return 10000;        // 10 seconds
    }
  }

  private getUserId(): string {
    // Get from auth context or use anonymous session ID
    return localStorage.getItem('userId') || `anon-${this.sessionId}`;
  }

  stop() {
    this.isActive = false;

    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
    }

    if (this.processor) {
      this.processor.disconnect();
    }

    if (this.audioContext) {
      this.audioContext.close();
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }

    console.log('MicSession stopped');
  }

  isListening(): boolean {
    return this.isActive;
  }

  getSessionId(): string {
    return this.sessionId;
  }
}