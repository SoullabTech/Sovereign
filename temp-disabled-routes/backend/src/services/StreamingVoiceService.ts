// StreamingVoiceService.ts - Chunked TTS with SSE streaming for natural conversation flow
import { EventEmitter } from 'events';
import { Response } from 'express';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

const SESAME_URL = process.env.SESAME_URL || process.env.SESAME_CSM_URL || 'http://localhost:8000';
const USE_SESAME = process.env.USE_SESAME === 'true' || process.env.SESAME_URL || process.env.SESAME_CSM_URL;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_URL = 'https://api.elevenlabs.io/v1/text-to-speech';

interface ChunkMetadata {
  id: string;
  text: string;
  audioUrl?: string;
  status: 'pending' | 'processing' | 'ready' | 'error';
  timestamp: number;
  duration?: number;
}

export class StreamingVoiceService extends EventEmitter {
  private chunks: Map<string, ChunkMetadata> = new Map();
  private processingQueue: string[] = [];
  private isProcessing = false;

  constructor() {
    super();
  }

  /**
   * Detect sentence boundaries for natural chunking
   * Returns array of text chunks suitable for TTS
   */
  private detectChunks(text: string): string[] {
    // Smart chunking: split on punctuation but keep meaningful phrases together
    const sentenceRegex = /[.!?]+[\s]*/g;
    const chunks: string[] = [];
    let lastIndex = 0;
    let match;

    while ((match = sentenceRegex.exec(text)) !== null) {
      const chunk = text.slice(lastIndex, match.index + match[0].length).trim();
      if (chunk.length > 0) {
        // If chunk is too long, split on commas or natural pauses
        if (chunk.length > 150) {
          const subChunks = this.splitLongChunk(chunk);
          chunks.push(...subChunks);
        } else {
          chunks.push(chunk);
        }
      }
      lastIndex = match.index + match[0].length;
    }

    // Add remaining text if any
    const remaining = text.slice(lastIndex).trim();
    if (remaining.length > 0) {
      if (remaining.length > 150) {
        chunks.push(...this.splitLongChunk(remaining));
      } else {
        chunks.push(remaining);
      }
    }

    return chunks;
  }

  /**
   * Split long chunks at natural pause points
   */
  private splitLongChunk(text: string): string[] {
    const pausePoints = /[,;:—–\-][\s]*/g;
    const subChunks: string[] = [];
    let lastIndex = 0;
    let match;

    while ((match = pausePoints.exec(text)) !== null) {
      const subChunk = text.slice(lastIndex, match.index + match[0].length).trim();
      if (subChunk.length > 0 && subChunk.length < 150) {
        subChunks.push(subChunk);
        lastIndex = match.index + match[0].length;
      }
    }

    const remaining = text.slice(lastIndex).trim();
    if (remaining.length > 0) {
      // If still too long, just split by word count
      if (remaining.length > 150) {
        const words = remaining.split(' ');
        const wordChunks: string[] = [];
        let current = '';
        
        for (const word of words) {
          if ((current + ' ' + word).length < 150) {
            current = current ? `${current} ${word}` : word;
          } else {
            if (current) wordChunks.push(current);
            current = word;
          }
        }
        if (current) wordChunks.push(current);
        subChunks.push(...wordChunks);
      } else {
        subChunks.push(remaining);
      }
    }

    return subChunks.length > 0 ? subChunks : [text];
  }

  /**
   * Process text stream and generate TTS chunks
   */
  async processStreamingText(text: string, sessionId: string, voiceId?: string): Promise<void> {
    const chunks = this.detectChunks(text);
    
    logger.info('🎙️ [StreamingVoice] Processing text chunks', {
      sessionId,
      totalChunks: chunks.length,
      textLength: text.length
    });

    // Create chunk metadata
    for (const chunkText of chunks) {
      const chunkId = `${sessionId}-${uuidv4()}`;
      this.chunks.set(chunkId, {
        id: chunkId,
        text: chunkText,
        status: 'pending',
        timestamp: Date.now()
      });
      this.processingQueue.push(chunkId);
    }

    // Start processing if not already running
    if (!this.isProcessing) {
      this.processQueue(voiceId);
    }
  }

  /**
   * Process TTS queue
   */
  private async processQueue(voiceId?: string): Promise<void> {
    this.isProcessing = true;

    while (this.processingQueue.length > 0) {
      const chunkId = this.processingQueue.shift();
      if (!chunkId) continue;

      const chunk = this.chunks.get(chunkId);
      if (!chunk) continue;

      try {
        chunk.status = 'processing';
        this.emit('chunk:processing', { chunkId, text: chunk.text });

        // Generate TTS for this chunk
        const audioUrl = await this.synthesizeChunk(chunk.text, voiceId);
        
        chunk.audioUrl = audioUrl;
        chunk.status = 'ready';
        
        // Emit ready event
        this.emit('chunk:ready', {
          chunkId: chunk.id,
          text: chunk.text,
          audioUrl,
          timestamp: chunk.timestamp
        });

        logger.info('🎵 [StreamingVoice] Chunk ready', {
          chunkId,
          audioUrl,
          textLength: chunk.text.length
        });

      } catch (error) {
        logger.error('🎙️ [StreamingVoice] Chunk synthesis failed', {
          chunkId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        
        chunk.status = 'error';
        this.emit('chunk:error', { chunkId, error });
      }
    }

    this.isProcessing = false;
  }

  /**
   * Synthesize audio for a single chunk
   */
  private async synthesizeChunk(text: string, voiceId?: string): Promise<string> {
    // Try Sesame first if configured
    if (USE_SESAME) {
      try {
        const response = await axios.post(
          `${SESAME_URL}/tts`,
          {
            text: text,
            voice: voiceId || 'maya',
            output_format: 'mp3_44100_128',
            // Maximum streaming optimization to reduce lag
            optimize_streaming_latency: 4
          },
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000 // Shorter timeout for chunks
          }
        );

        // Sesame returns base64-encoded audio in JSON
        const audioData = response.data.audio;
        const format = response.data.format || 'wav';
        const buffer = Buffer.from(audioData, 'base64');
        
        const filename = `chunk-${uuidv4()}.${format}`;
        
        // Save to public/audio/chunks directory
        const chunksDir = path.resolve(process.cwd(), '..', 'public', 'audio', 'chunks');
        if (!fs.existsSync(chunksDir)) {
          fs.mkdirSync(chunksDir, { recursive: true });
        }
        
        const outputPath = path.join(chunksDir, filename);
        fs.writeFileSync(outputPath, buffer);
        
        return `/audio/chunks/${filename}`;
        
      } catch (error) {
        logger.warn('🌱 [StreamingVoice] Sesame chunk failed, trying ElevenLabs', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Fallback to ElevenLabs
    if (ELEVENLABS_API_KEY) {
      const response = await axios.post(
        `${ELEVENLABS_VOICE_URL}/${voiceId || 'XrExE9yKIg1WjnnlVkGX'}`,
        {
          text,
          voice_settings: {
            stability: 0.35,
            similarity_boost: 0.85,
            style: 0.65,
            use_speaker_boost: true
          },
          model_id: 'eleven_turbo_v2_5', // Latest fastest model
          optimize_streaming_latency: 4  // Max optimization
        },
        {
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
            Accept: 'audio/mpeg'
          },
          responseType: 'arraybuffer',
          timeout: 10000
        }
      );

      const buffer = Buffer.from(response.data);
      const filename = `chunk-${uuidv4()}.mp3`;
      
      const chunksDir = path.resolve(process.cwd(), '..', 'public', 'audio', 'chunks');
      if (!fs.existsSync(chunksDir)) {
        fs.mkdirSync(chunksDir, { recursive: true });
      }
      
      const outputPath = path.join(chunksDir, filename);
      fs.writeFileSync(outputPath, buffer);
      
      return `/audio/chunks/${filename}`;
    }

    throw new Error('No TTS provider available');
  }

  /**
   * Setup SSE connection for streaming chunks to client
   */
  setupSSE(res: Response, sessionId: string): void {
    // SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    
    // Listen for chunk events and stream to client
    const chunkReadyHandler = (data: any) => {
      if (data.chunkId?.startsWith(sessionId)) {
        res.write(`event: audio-chunk\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      }
    };

    const chunkErrorHandler = (data: any) => {
      if (data.chunkId?.startsWith(sessionId)) {
        res.write(`event: audio-error\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      }
    };

    this.on('chunk:ready', chunkReadyHandler);
    this.on('chunk:error', chunkErrorHandler);

    // Cleanup on disconnect
    res.on('close', () => {
      this.off('chunk:ready', chunkReadyHandler);
      this.off('chunk:error', chunkErrorHandler);
      
      // Clean up chunks for this session
      for (const [chunkId] of this.chunks) {
        if (chunkId.startsWith(sessionId)) {
          this.chunks.delete(chunkId);
        }
      }
    });
  }

  /**
   * Get streaming status for monitoring
   */
  getStatus(): { activeChunks: number; queueLength: number; isProcessing: boolean } {
    return {
      activeChunks: this.chunks.size,
      queueLength: this.processingQueue.length,
      isProcessing: this.isProcessing
    };
  }
}

// Export singleton instance
export const streamingVoiceService = new StreamingVoiceService();