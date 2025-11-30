/**
 * Sesame TTS Integration with Pause Tokens
 * Handles sacred voice output with natural pausing
 */

import { logger } from '../utils/logger';

interface TTSConfig {
  provider: 'elevenlabs' | 'openai' | 'azure';
  voiceId: string;
  rate: number;
  pitch: number;
  volume: number;
  pauseDefaults: {
    short: number;   // <PAUSE:400>
    medium: number;  // <PAUSE:800>
    long: number;    // <PAUSE:1200>
    sacred: number;  // <PAUSE:3000>
  };
}

interface PauseToken {
  position: number;
  duration: number;
  type: 'short' | 'medium' | 'long' | 'sacred';
}

export class SesameTTSIntegration {
  private config: TTSConfig = {
    provider: 'elevenlabs',
    voiceId: 'maya_sacred_voice', // Your ElevenLabs voice ID
    rate: 0.95,  // Slightly slower for sacred presence
    pitch: 1.0,
    volume: 0.9,
    pauseDefaults: {
      short: 400,
      medium: 800,
      long: 1200,
      sacred: 3000
    }
  };

  private audioQueue: string[] = [];
  private isPlaying = false;

  /**
   * Process text with pause tokens and generate TTS
   */
  async generateSacredVoice(
    text: string,
    element: string,
    mode: 'brief' | 'deeper' | 'silent'
  ): Promise<{
    audioUrl: string;
    duration: number;
    chunks: Array<{ text: string; pauseAfter: number }>;
  }> {
    logger.info('Generating sacred voice', {
      element,
      mode,
      textLength: text.length
    });

    // Parse pause tokens
    const { chunks, totalPauseDuration } = this.parsePauseTokens(text);

    // Apply elemental voice characteristics
    const voiceConfig = this.getElementalVoiceConfig(element, mode);

    // Generate TTS for each chunk
    const audioChunks = await Promise.all(
      chunks.map(chunk => this.generateTTSChunk(chunk.text, voiceConfig))
    );

    // Calculate total duration
    const audioDuration = audioChunks.reduce((sum, chunk) => sum + chunk.duration, 0);
    const totalDuration = audioDuration + totalPauseDuration;

    // Combine audio chunks with pauses
    const combinedAudioUrl = await this.combineAudioWithPauses(
      audioChunks,
      chunks
    );

    return {
      audioUrl: combinedAudioUrl,
      duration: totalDuration,
      chunks
    };
  }

  /**
   * Parse pause tokens from text
   */
  private parsePauseTokens(text: string): {
    chunks: Array<{ text: string; pauseAfter: number }>;
    totalPauseDuration: number;
  } {
    const pausePattern = /<PAUSE:(\d+)>/g;
    const chunks: Array<{ text: string; pauseAfter: number }> = [];
    let lastIndex = 0;
    let totalPauseDuration = 0;

    let match;
    while ((match = pausePattern.exec(text)) !== null) {
      // Add text before pause
      if (match.index > lastIndex) {
        chunks.push({
          text: text.substring(lastIndex, match.index).trim(),
          pauseAfter: parseInt(match[1])
        });
        totalPauseDuration += parseInt(match[1]);
      }
      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      chunks.push({
        text: text.substring(lastIndex).trim(),
        pauseAfter: 0
      });
    }

    // If no chunks (no pause tokens), treat entire text as one chunk
    if (chunks.length === 0 && text.trim().length > 0) {
      chunks.push({
        text: text.trim(),
        pauseAfter: 0
      });
    }

    return { chunks, totalPauseDuration };
  }

  /**
   * Get elemental voice configuration
   */
  private getElementalVoiceConfig(
    element: string,
    mode: string
  ): Partial<TTSConfig> {
    const configs = {
      fire: {
        rate: 1.05,      // Slightly faster, energetic
        pitch: 1.05,     // Slightly higher, activated
        volume: 0.95     // Strong presence
      },
      water: {
        rate: 0.9,       // Slower, flowing
        pitch: 0.95,     // Lower, emotional depth
        volume: 0.85     // Softer, receptive
      },
      earth: {
        rate: 0.85,      // Slow, grounded
        pitch: 0.9,      // Lower, stable
        volume: 0.9      // Solid presence
      },
      air: {
        rate: 1.0,       // Clear, balanced
        pitch: 1.0,      // Neutral, clear
        volume: 0.9      // Present but light
      },
      aether: {
        rate: 0.95,      // Slightly slower, contemplative
        pitch: 1.0,      // Balanced
        volume: 0.8      // Ethereal, spacious
      }
    };

    const elementConfig = configs[element] || configs.aether;

    // Adjust for mode
    if (mode === 'silent') {
      elementConfig.volume *= 0.7; // Even softer for silent mode
      elementConfig.rate *= 0.9;   // Even slower
    } else if (mode === 'deeper') {
      elementConfig.rate *= 0.95;  // Slightly slower for depth
    }

    return elementConfig;
  }

  /**
   * Generate TTS for a single chunk
   */
  private async generateTTSChunk(
    text: string,
    voiceConfig: Partial<TTSConfig>
  ): Promise<{ audioUrl: string; duration: number }> {
    const config = { ...this.config, ...voiceConfig };

    try {
      switch (config.provider) {
        case 'elevenlabs':
          return await this.generateElevenLabsTTS(text, config);

        case 'openai':
          return await this.generateOpenAITTS(text, config);

        case 'azure':
          return await this.generateAzureTTS(text, config);

        default:
          throw new Error(`Unknown TTS provider: ${config.provider}`);
      }
    } catch (error) {
      logger.error('TTS generation failed', { error, text: text.substring(0, 50) });
      throw error;
    }
  }

  /**
   * Generate TTS using ElevenLabs
   */
  private async generateElevenLabsTTS(
    text: string,
    config: TTSConfig
  ): Promise<{ audioUrl: string; duration: number }> {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${config.voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY || ''
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.75,
            similarity_boost: 0.75,
            style: 0.2,
            use_speaker_boost: true
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs TTS failed: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const audioUrl = await this.saveAudioBuffer(audioBuffer, 'mp3');
    const duration = await this.getAudioDuration(audioBuffer);

    return { audioUrl, duration };
  }

  /**
   * Generate TTS using OpenAI
   */
  private async generateOpenAITTS(
    text: string,
    config: TTSConfig
  ): Promise<{ audioUrl: string; duration: number }> {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'tts-1-hd',
        input: text,
        voice: 'nova', // or 'alloy', 'echo', 'fable', 'onyx', 'shimmer'
        speed: config.rate
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI TTS failed: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const audioUrl = await this.saveAudioBuffer(audioBuffer, 'mp3');
    const duration = await this.getAudioDuration(audioBuffer);

    return { audioUrl, duration };
  }

  /**
   * Generate TTS using Azure
   */
  private async generateAzureTTS(
    text: string,
    config: TTSConfig
  ): Promise<{ audioUrl: string; duration: number }> {
    // Azure Cognitive Services implementation
    const ssml = `
      <speak version='1.0' xml:lang='en-US'>
        <voice xml:lang='en-US' name='en-US-JennyNeural'>
          <prosody rate='${config.rate}' pitch='${config.pitch}'>
            ${text}
          </prosody>
        </voice>
      </speak>
    `;

    const response = await fetch(
      `https://${process.env.AZURE_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': process.env.AZURE_SPEECH_KEY || '',
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3'
        },
        body: ssml
      }
    );

    if (!response.ok) {
      throw new Error(`Azure TTS failed: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const audioUrl = await this.saveAudioBuffer(audioBuffer, 'mp3');
    const duration = await this.getAudioDuration(audioBuffer);

    return { audioUrl, duration };
  }

  /**
   * Combine audio chunks with silence for pauses
   */
  private async combineAudioWithPauses(
    audioChunks: Array<{ audioUrl: string; duration: number }>,
    chunks: Array<{ text: string; pauseAfter: number }>
  ): Promise<string> {
    // For production, use FFmpeg or Web Audio API to combine
    // For now, return playlist format

    const playlist = [];

    for (let i = 0; i < audioChunks.length; i++) {
      playlist.push({
        type: 'audio',
        url: audioChunks[i].audioUrl,
        duration: audioChunks[i].duration
      });

      if (chunks[i].pauseAfter > 0) {
        playlist.push({
          type: 'silence',
          duration: chunks[i].pauseAfter / 1000 // Convert to seconds
        });
      }
    }

    // Store playlist and return URL
    const playlistUrl = await this.savePlaylist(playlist);
    return playlistUrl;
  }

  /**
   * Save audio buffer to storage
   */
  private async saveAudioBuffer(
    buffer: ArrayBuffer,
    format: string
  ): Promise<string> {
    // Save to your storage solution (S3, GCS, local, etc.)
    const fileName = `maya_${Date.now()}.${format}`;
    const blob = new Blob([buffer], { type: `audio/${format}` });

    // For production, upload to cloud storage
    // For now, create object URL
    if (typeof window !== 'undefined') {
      return URL.createObjectURL(blob);
    }

    // Server-side storage
    const fs = await import('fs');
    const path = `/tmp/${fileName}`;
    await fs.promises.writeFile(path, Buffer.from(buffer));

    return `file://${path}`;
  }

  /**
   * Get audio duration from buffer
   */
  private async getAudioDuration(buffer: ArrayBuffer): Promise<number> {
    // Use audio context to decode and get duration
    if (typeof window !== 'undefined' && window.AudioContext) {
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(buffer);
      return audioBuffer.duration;
    }

    // Server-side: use ffprobe or audio library
    // Placeholder: estimate based on file size and bitrate
    const estimatedDuration = buffer.byteLength / (128 * 1000 / 8); // 128kbps
    return estimatedDuration;
  }

  /**
   * Save playlist for sequential playback with pauses
   */
  private async savePlaylist(
    playlist: Array<{ type: string; url?: string; duration: number }>
  ): Promise<string> {
    const playlistId = `playlist_${Date.now()}`;

    // Store in memory or database
    // For now, return data URI
    const playlistJson = JSON.stringify(playlist);
    const dataUri = `data:application/json;base64,${Buffer.from(playlistJson).toString('base64')}`;

    return dataUri;
  }

  /**
   * Play audio with pause handling
   */
  async playAudioWithPauses(audioUrl: string): Promise<void> {
    if (typeof window === 'undefined') {
      logger.warn('Audio playback not available in server environment');
      return;
    }

    // Parse playlist if it's a data URI
    if (audioUrl.startsWith('data:')) {
      const playlist = this.parsePlaylistDataUri(audioUrl);
      await this.playPlaylist(playlist);
    } else {
      // Single audio file
      await this.playAudioFile(audioUrl);
    }
  }

  /**
   * Parse playlist from data URI
   */
  private parsePlaylistDataUri(dataUri: string): any[] {
    const base64 = dataUri.split(',')[1];
    const json = Buffer.from(base64, 'base64').toString('utf-8');
    return JSON.parse(json);
  }

  /**
   * Play playlist with pauses
   */
  private async playPlaylist(playlist: any[]): Promise<void> {
    for (const item of playlist) {
      if (item.type === 'audio') {
        await this.playAudioFile(item.url);
      } else if (item.type === 'silence') {
        await this.playSilence(item.duration * 1000);
      }
    }
  }

  /**
   * Play single audio file
   */
  private playAudioFile(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(url);
      audio.volume = this.config.volume;

      audio.addEventListener('ended', () => resolve());
      audio.addEventListener('error', reject);

      audio.play().catch(reject);
    });
  }

  /**
   * Play silence (wait)
   */
  private playSilence(duration: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, duration));
  }

  /**
   * Update TTS configuration
   */
  updateConfig(config: Partial<TTSConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info('TTS config updated', { config: this.config });
  }
}

// Export singleton
export const sesameTTS = new SesameTTSIntegration();