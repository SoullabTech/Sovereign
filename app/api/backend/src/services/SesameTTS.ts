import axios from 'axios';
import { logger } from '../utils/logger';

interface TTSOptions {
  voice?: string;
  speed?: number;
  pitch?: number;
  emotion?: string;
}

interface ProsodyMarker {
  type: 'pace' | 'emphasis' | 'pause' | 'emotion';
  value: string;
  position: number;
}

export class SesameTTS {
  private sesameUrl: string;
  private apiKey: string;
  private defaultVoice: string;

  constructor() {
    this.sesameUrl = process.env.SESAME_CSM_URL || process.env.SESAME_URL || '';
    this.apiKey = process.env.SESAME_API_KEY || '';
    this.defaultVoice = process.env.SESAME_VOICE_ID || 'maya';
  }

  /**
   * Parse prosody markers from text
   */
  private parseProsodyMarkers(text: string): { cleanText: string; markers: ProsodyMarker[] } {
    const markers: ProsodyMarker[] = [];
    let cleanText = text;
    
    // Extract prosody markers with regex
    const prosodyRegex = /<(pace-slow|pace-fast|emphasis|pause|emotion-[^>]+)>([^<]*)<\/\1>|<(pace-slow|pace-fast|emphasis|pause|emotion-[^>]+)>/g;
    
    let match;
    let offset = 0;
    
    while ((match = prosodyRegex.exec(text)) !== null) {
      const tag = match[1] || match[3];
      const content = match[2] || '';
      const position = match.index - offset;
      
      if (tag.startsWith('pace-')) {
        markers.push({
          type: 'pace',
          value: tag.replace('pace-', ''),
          position
        });
      } else if (tag === 'emphasis') {
        markers.push({
          type: 'emphasis',
          value: 'strong',
          position
        });
      } else if (tag === 'pause') {
        markers.push({
          type: 'pause',
          value: '500ms',
          position
        });
      } else if (tag.startsWith('emotion-')) {
        markers.push({
          type: 'emotion',
          value: tag.replace('emotion-', ''),
          position
        });
      }
      
      // Update offset for clean text calculation
      offset += match[0].length - content.length;
    }
    
    // Remove all prosody tags for clean text
    cleanText = text.replace(/<[^>]+>/g, '');
    
    return { cleanText, markers };
  }

  /**
   * Convert prosody markers to SSML
   */
  private toSSML(text: string, markers: ProsodyMarker[]): string {
    let ssml = `<speak>`;
    let lastPos = 0;
    
    // Sort markers by position
    markers.sort((a, b) => a.position - b.position);
    
    for (const marker of markers) {
      // Add text before marker
      if (marker.position > lastPos) {
        ssml += text.substring(lastPos, marker.position);
      }
      
      // Apply marker
      switch (marker.type) {
        case 'pace':
          ssml += `<prosody rate="${marker.value}">`;
          break;
        case 'emphasis':
          ssml += `<emphasis level="${marker.value}">`;
          break;
        case 'pause':
          ssml += `<break time="${marker.value}"/>`;
          break;
        case 'emotion':
          ssml += `<prosody pitch="${marker.value === 'warm' ? '+5%' : '-5%'}">`;
          break;
      }
      
      lastPos = marker.position;
    }
    
    // Add remaining text
    if (lastPos < text.length) {
      ssml += text.substring(lastPos);
    }
    
    // Close any open tags
    const openTags = markers.filter(m => m.type !== 'pause');
    for (let i = openTags.length - 1; i >= 0; i--) {
      if (openTags[i].type === 'pace' || openTags[i].type === 'emotion') {
        ssml += `</prosody>`;
      } else if (openTags[i].type === 'emphasis') {
        ssml += `</emphasis>`;
      }
    }
    
    ssml += `</speak>`;
    return ssml;
  }

  /**
   * Synthesize speech from text with prosody support
   */
  async synthesize(text: string, options: TTSOptions = {}): Promise<string | null> {
    console.log('[SesameTTS] TTS input:', text.substring(0, 100) + '...');
    
    try {
      // Skip if no Sesame URL configured
      if (!this.sesameUrl) {
        logger.warn('Sesame TTS not configured, returning null audio URL');
        console.log('[SesameTTS] No Sesame URL configured, skipping TTS');
        return null;
      }

      // Parse prosody markers
      const { cleanText, markers } = this.parseProsodyMarkers(text);
      console.log('[SesameTTS] Prosody markers found:', markers.length);
      
      // Convert to SSML if markers present
      const ssmlText = markers.length > 0 
        ? this.toSSML(cleanText, markers)
        : cleanText;

      // Prepare TTS request
      const ttsPayload = {
        text: ssmlText,
        voice: options.voice || this.defaultVoice,
        model: 'eleven_turbo_v2', // Or configure via env
        output_format: 'mp3_44100_128',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true
        }
      };

      // Call Sesame TTS endpoint
      const ttsEndpoint = `${this.sesameUrl}/v1/text-to-speech/${options.voice || this.defaultVoice}`;
      console.log('[SesameTTS] Calling TTS endpoint:', ttsEndpoint);
      
      const response = await axios.post(
        ttsEndpoint,
        ttsPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey || process.env.ELEVENLABS_API_KEY,
          },
          responseType: 'arraybuffer'
        }
      );
      
      console.log('[SesameTTS] TTS response status:', response.status);

      // Convert audio to base64 URL
      const audioBuffer = Buffer.from(response.data);
      const base64Audio = audioBuffer.toString('base64');
      const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;

      logger.info('TTS synthesis successful', {
        textLength: text.length,
        prosodyMarkers: markers.length,
        audioSize: audioBuffer.length
      });

      console.log('[SesameTTS] TTS success, audio size:', audioBuffer.length, 'bytes');
      return audioUrl;

    } catch (error) {
      console.error('[SesameTTS] TTS synthesis failed:', error.message);
      logger.error('TTS synthesis failed', error);
      
      // Fallback: try direct ElevenLabs if Sesame fails
      if (process.env.ELEVENLABS_API_KEY) {
        console.log('[SesameTTS] Falling back to direct ElevenLabs');
        return this.fallbackToElevenLabs(text, options);
      }
      
      return null;
    }
  }

  /**
   * Fallback to direct ElevenLabs API
   */
  private async fallbackToElevenLabs(text: string, options: TTSOptions = {}): Promise<string | null> {
    try {
      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${options.voice || 'MF3mGyEYCl7XYWbV9V6O'}`, // Maya voice ID
        {
          text: text.replace(/<[^>]+>/g, ''), // Strip prosody for fallback
          model_id: 'eleven_turbo_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': process.env.ELEVENLABS_API_KEY,
          },
          responseType: 'arraybuffer'
        }
      );

      const audioBuffer = Buffer.from(response.data);
      const base64Audio = audioBuffer.toString('base64');
      return `data:audio/mpeg;base64,${base64Audio}`;

    } catch (error) {
      logger.error('ElevenLabs fallback also failed', error);
      return null;
    }
  }
}

// Export singleton instance
export const sesameTTS = new SesameTTS();