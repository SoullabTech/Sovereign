'use client';

import { JournalingMode } from '../journaling/JournalingPrompts';

export interface VoiceAIConfig {
  userId: string;
  mode: JournalingMode;
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  enableVoiceResponse: boolean;
  responseVoice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
}

export interface AIVoiceResponse {
  text: string;
  audioUrl?: string;
  symbols?: string[];
  guidance?: string;
}

export class RealtimeVoiceAI {
  private config: VoiceAIConfig;
  private transcriptBuffer: string = '';
  private lastProcessedLength: number = 0;
  private processingTimeout: NodeJS.Timeout | null = null;
  private onResponse: (response: AIVoiceResponse) => void;
  private audioContext: AudioContext | null = null;
  private currentAudio: HTMLAudioElement | null = null;

  constructor(
    config: VoiceAIConfig,
    onResponse: (response: AIVoiceResponse) => void
  ) {
    this.config = config;
    this.onResponse = onResponse;

    if (typeof window !== 'undefined' && config.enableVoiceResponse) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  async updateTranscript(transcript: string): Promise<void> {
    this.transcriptBuffer = transcript;

    if (this.processingTimeout) {
      clearTimeout(this.processingTimeout);
    }

    this.processingTimeout = setTimeout(() => {
      this.processBuffer();
    }, 3000);
  }

  private async processBuffer(): Promise<void> {
    const newContent = this.transcriptBuffer.slice(this.lastProcessedLength);

    if (newContent.trim().length < 50) {
      return;
    }

    this.lastProcessedLength = this.transcriptBuffer.length;

    try {
      const response = await this.getAIReflection(newContent);
      this.onResponse(response);

      if (this.config.enableVoiceResponse && response.audioUrl) {
        await this.playAudioResponse(response.audioUrl);
      }
    } catch (error) {
      console.error('Failed to get AI reflection:', error);
    }
  }

  private async getAIReflection(content: string): Promise<AIVoiceResponse> {
    const response = await fetch('/api/voice/realtime-reflection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: this.config.userId,
        mode: this.config.mode,
        element: this.config.element,
        content,
        enableVoiceResponse: this.config.enableVoiceResponse,
        voice: this.config.responseVoice || 'shimmer',
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  }

  private async playAudioResponse(audioUrl: string): Promise<void> {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }

    return new Promise((resolve, reject) => {
      const audio = new Audio(audioUrl);
      this.currentAudio = audio;

      audio.onended = () => {
        this.currentAudio = null;
        resolve();
      };

      audio.onerror = () => {
        this.currentAudio = null;
        reject(new Error('Audio playback failed'));
      };

      audio.play().catch(reject);
    });
  }

  async finalReflection(): Promise<AIVoiceResponse> {
    if (this.processingTimeout) {
      clearTimeout(this.processingTimeout);
    }

    return await this.getAIReflection(this.transcriptBuffer);
  }

  stop(): void {
    if (this.processingTimeout) {
      clearTimeout(this.processingTimeout);
      this.processingTimeout = null;
    }

    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
  }

  isPlaying(): boolean {
    return this.currentAudio !== null && !this.currentAudio.paused;
  }
}