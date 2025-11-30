/**
 * Sesame CSM Adapter
 * Handles the base64 audio response from Sesame and converts it to usable formats
 */

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

interface SesameResponse {
  audio: string;  // Base64 encoded audio
  format: string; // 'wav' or 'mp3'
  duration: number;
}

export class SesameAdapter {
  private sesameUrl: string;
  private audioDir: string;

  constructor() {
    this.sesameUrl = process.env.SESAME_URL || 'http://localhost:8000';
    // Create audio directory for storing converted files
    this.audioDir = path.join(process.cwd(), '..', 'public', 'audio', 'sesame');
    if (!fs.existsSync(this.audioDir)) {
      fs.mkdirSync(this.audioDir, { recursive: true });
    }
  }

  /**
   * Generate speech from text using Sesame
   */
  async generateSpeech(text: string, voice: string = 'maya'): Promise<string> {
    try {
      const response = await axios.post<SesameResponse>(
        `${this.sesameUrl}/tts`,
        {
          text,
          voice,
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000,
        }
      );

      // Decode base64 audio
      const audioBuffer = Buffer.from(response.data.audio, 'base64');
      
      // Generate filename based on format
      const format = response.data.format || 'wav';
      const filename = `sesame-${uuidv4()}.${format}`;
      const filePath = path.join(this.audioDir, filename);
      
      // Save audio file
      fs.writeFileSync(filePath, audioBuffer);
      
      // Return URL path for frontend access
      return `/audio/sesame/${filename}`;
    } catch (error) {
      console.error('Sesame TTS error:', error);
      throw new Error('Failed to generate speech with Sesame');
    }
  }

  /**
   * Check if Sesame is healthy and ready
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.sesameUrl}/health`, {
        timeout: 2000,
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate streaming audio chunks
   */
  async generateStreamingChunk(
    text: string, 
    voice: string = 'maya'
  ): Promise<{ audioUrl: string; duration: number }> {
    try {
      const audioUrl = await this.generateSpeech(text, voice);
      
      // Sesame provides duration in the response
      // For now, estimate based on text length (roughly 150 words per minute)
      const wordCount = text.split(' ').length;
      const estimatedDuration = (wordCount / 150) * 60 * 1000; // in milliseconds
      
      return {
        audioUrl,
        duration: estimatedDuration,
      };
    } catch (error) {
      console.error('Sesame streaming chunk error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const sesameAdapter = new SesameAdapter();