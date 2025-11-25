/**
 * Audio Handler - Clean implementation for TTS functionality
 */

export class AudioHandler {
  /**
   * Convert array buffer to base64 with validation
   */
  static arrayBufferToBase64(buffer: ArrayBuffer): string {
    try {
      // Method 1: Using Buffer (Node.js environment)
      if (typeof Buffer !== 'undefined') {
        return Buffer.from(buffer).toString('base64');
      }

      // Method 2: Browser environment
      const bytes = new Uint8Array(buffer);
      let binary = '';

      // Process in chunks to avoid stack overflow on large buffers
      const chunkSize = 8192;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.slice(i, i + chunkSize);
        binary += String.fromCharCode.apply(null, Array.from(chunk));
      }

      return btoa(binary);
    } catch (error) {
      console.error('Base64 encoding failed:', error);
      throw new Error('Failed to encode audio data');
    }
  }

  /**
   * Validate base64 string
   */
  static validateBase64(base64: string): boolean {
    try {
      // Remove any whitespace
      const cleaned = base64.replace(/\s/g, '');

      // Check if it's valid base64
      const regex = /^[A-Za-z0-9+/]*={0,2}$/;
      if (!regex.test(cleaned)) {
        console.error('Invalid base64 characters detected');
        return false;
      }

      // Try to decode a sample
      if (typeof Buffer !== 'undefined') {
        Buffer.from(cleaned.substring(0, 100), 'base64');
      } else {
        atob(cleaned.substring(0, 100));
      }

      return true;
    } catch (error) {
      console.error('Base64 validation failed:', error);
      return false;
    }
  }

  /**
   * Create data URL from audio buffer
   */
  static createAudioDataUrl(buffer: ArrayBuffer, mimeType: string = 'audio/mpeg'): string {
    const base64 = this.arrayBufferToBase64(buffer);

    if (!this.validateBase64(base64)) {
      throw new Error('Invalid base64 audio data');
    }

    // Clean the base64 string
    const cleanBase64 = base64.replace(/\s/g, '');

    return `data:${mimeType};base64,${cleanBase64}`;
  }

  /**
   * Test audio playback capability
   */
  static async testAudioPlayback(dataUrl: string): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const audio = new Audio(dataUrl);

        const timeout = setTimeout(() => {
          console.error('Audio test timeout');
          resolve(false);
        }, 5000);

        audio.addEventListener('canplaythrough', () => {
          clearTimeout(timeout);
          console.log('Audio can play through');
          resolve(true);
        });

        audio.addEventListener('error', (e) => {
          clearTimeout(timeout);
          const audioElement = e.target as HTMLAudioElement;
          console.error('Audio test error:', {
            error: audioElement.error,
            code: audioElement.error?.code,
            message: audioElement.error?.message
          });
          resolve(false);
        });

        // Trigger load
        audio.load();
      } catch (error) {
        console.error('Failed to create audio element:', error);
        resolve(false);
      }
    });
  }

  /**
   * Play audio with fallback
   */
  static async playAudio(dataUrl: string, fallbackHandler?: () => void): Promise<void> {
    try {
      // Validate the data URL format
      if (!dataUrl.startsWith('data:audio/')) {
        throw new Error('Invalid audio data URL format');
      }

      // Test if audio can play
      const canPlay = await this.testAudioPlayback(dataUrl);

      if (!canPlay) {
        console.warn('Audio cannot play, using fallback');
        if (fallbackHandler) {
          fallbackHandler();
        }
        return;
      }

      // Create and play audio
      const audio = new Audio(dataUrl);
      audio.volume = 0.8;

      await audio.play();
      console.log('Audio playing successfully');

    } catch (error) {
      console.error('Audio playback failed:', error);
      if (fallbackHandler) {
        fallbackHandler();
      }
    }
  }

  /**
   * Fetch and process audio from API
   */
  static async fetchAudio(url: string, apiKey: string, text: string): Promise<string | null> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        console.error('Audio API error:', response.status);
        return null;
      }

      const buffer = await response.arrayBuffer();

      if (buffer.byteLength === 0) {
        console.error('Empty audio buffer received');
        return null;
      }

      console.log('Audio buffer received:', buffer.byteLength, 'bytes');

      return this.createAudioDataUrl(buffer);

    } catch (error) {
      console.error('Failed to fetch audio:', error);
      return null;
    }
  }
}

export default AudioHandler;