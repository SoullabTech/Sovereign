/**
 * Maya Voice System - Mobile Optimized
 * Optimizations for mobile devices, bandwidth constraints, and touch interactions
 */

interface MobileVoiceConfig {
  // Bandwidth optimization
  compressionLevel: 'low' | 'medium' | 'high';
  maxAudioDuration: number; // seconds
  preloadAudio: boolean;
  
  // Mobile-specific settings
  touchInteractionDelay: number; // ms delay for touch interactions
  backgroundPlayback: boolean;
  wakeLockEnabled: boolean;
  
  // Quality settings for mobile
  audioQuality: 'mobile' | 'wifi' | 'high';
  adaptiveBitrate: boolean;
}

interface MobileAudioCache {
  [key: string]: {
    url: string;
    blob: Blob;
    lastUsed: number;
    size: number;
  };
}

export class MayaVoiceMobile {
  private config: MobileVoiceConfig;
  private cache: MobileAudioCache = {};
  private cacheSize = 0;
  private maxCacheSize = 10 * 1024 * 1024; // 10MB cache limit
  private wakeLock: any = null;

  constructor(config?: Partial<MobileVoiceConfig>) {
    this.config = {
      compressionLevel: 'medium',
      maxAudioDuration: 30,
      preloadAudio: true,
      touchInteractionDelay: 300,
      backgroundPlayback: true,
      wakeLockEnabled: false,
      audioQuality: this.detectOptimalQuality(),
      adaptiveBitrate: true,
      ...config
    };
  }

  /**
   * Detect optimal audio quality based on network and device
   */
  private detectOptimalQuality(): 'mobile' | 'wifi' | 'high' {
    if (typeof navigator === 'undefined') return 'high';

    // Check network connection
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (connection) {
      const { effectiveType, downlink } = connection;
      
      // Low bandwidth - use mobile quality
      if (effectiveType === 'slow-2g' || effectiveType === '2g' || downlink < 1) {
        return 'mobile';
      }
      
      // Medium bandwidth - use wifi quality  
      if (effectiveType === '3g' || downlink < 5) {
        return 'wifi';
      }
    }

    // Default to high quality
    return 'high';
  }

  /**
   * Get audio settings optimized for current quality level
   */
  private getOptimizedAudioSettings() {
    const qualitySettings = {
      mobile: {
        bitrate: 64, // kbps
        sampleRate: 22050,
        format: 'mp3',
        compression: 0.8
      },
      wifi: {
        bitrate: 128,
        sampleRate: 44100, 
        format: 'mp3',
        compression: 0.6
      },
      high: {
        bitrate: 192,
        sampleRate: 44100,
        format: 'wav',
        compression: 0.4
      }
    };

    return qualitySettings[this.config.audioQuality];
  }

  /**
   * Generate speech with mobile optimizations
   */
  async generateSpeech(text: string, options?: any): Promise<string> {
    // Check cache first
    const cacheKey = this.generateCacheKey(text, options);
    const cached = this.cache[cacheKey];
    
    if (cached) {
      this.updateCacheAccess(cacheKey);
      return cached.url;
    }

    // Chunk long text for mobile processing
    if (text.length > 500) {
      return this.generateChunkedSpeech(text, options);
    }

    try {
      const audioSettings = this.getOptimizedAudioSettings();
      
      // Request audio generation with mobile optimizations
      const response = await fetch('/api/voice/mobile-optimized', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          options,
          mobileConfig: {
            ...audioSettings,
            maxDuration: this.config.maxAudioDuration,
            compression: this.config.compressionLevel
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Voice generation failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Cache the result
      this.cacheAudio(cacheKey, audioUrl, audioBlob);

      return audioUrl;
    } catch (error) {
      console.error('Mobile voice generation failed:', error);
      // Fallback to Web Speech API
      return this.fallbackToWebSpeech(text, options);
    }
  }

  /**
   * Generate speech for long text by chunking
   */
  private async generateChunkedSpeech(text: string, options?: any): Promise<string> {
    // Split text into natural chunks
    const chunks = this.splitTextIntoChunks(text, 400);
    const audioChunks: Blob[] = [];

    for (const chunk of chunks) {
      try {
        const chunkUrl = await this.generateSpeech(chunk, options);
        const response = await fetch(chunkUrl);
        const blob = await response.blob();
        audioChunks.push(blob);
      } catch (error) {
        console.warn('Chunk generation failed, skipping:', error);
      }
    }

    // Concatenate audio chunks
    const concatenatedBlob = await this.concatenateAudioBlobs(audioChunks);
    const finalUrl = URL.createObjectURL(concatenatedBlob);

    return finalUrl;
  }

  /**
   * Split text into natural speech chunks
   */
  private splitTextIntoChunks(text: string, maxLength: number): string[] {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > maxLength) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = '';
        }
      }
      currentChunk += sentence + '. ';
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  /**
   * Concatenate multiple audio blobs
   */
  private async concatenateAudioBlobs(blobs: Blob[]): Promise<Blob> {
    // Simple concatenation - in production, would use Web Audio API for seamless joining
    const arrayBuffers = await Promise.all(
      blobs.map(blob => blob.arrayBuffer())
    );

    const totalLength = arrayBuffers.reduce((sum, buffer) => sum + buffer.byteLength, 0);
    const result = new Uint8Array(totalLength);
    
    let offset = 0;
    for (const buffer of arrayBuffers) {
      result.set(new Uint8Array(buffer), offset);
      offset += buffer.byteLength;
    }

    return new Blob([result], { type: 'audio/mpeg' });
  }

  /**
   * Fallback to Web Speech API for mobile compatibility
   */
  private async fallbackToWebSpeech(text: string, options?: any): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!window.speechSynthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Create utterance with mobile-optimized settings
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options?.rate || 0.9; // Slightly slower for mobile clarity
      utterance.pitch = options?.pitch || 1.0;
      utterance.volume = options?.volume || 0.8;

      // Try to use the best available voice
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('female') ||
        voice.name.toLowerCase().includes('samantha') ||
        voice.name.toLowerCase().includes('karen')
      ) || voices.find(voice => voice.lang.includes('en'));

      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }

      utterance.onend = () => {
        resolve('web-speech-synthesis'); // Special flag for Web Speech API
      };

      utterance.onerror = (error) => {
        reject(error);
      };

      // Delay for mobile touch interaction
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, this.config.touchInteractionDelay);
    });
  }

  /**
   * Cache management
   */
  private generateCacheKey(text: string, options?: any): string {
    const optionsString = JSON.stringify(options || {});
    return btoa(text + optionsString).substr(0, 32);
  }

  private cacheAudio(key: string, url: string, blob: Blob): void {
    // Check cache size limit
    if (this.cacheSize + blob.size > this.maxCacheSize) {
      this.cleanupCache();
    }

    this.cache[key] = {
      url,
      blob,
      lastUsed: Date.now(),
      size: blob.size
    };

    this.cacheSize += blob.size;
  }

  private updateCacheAccess(key: string): void {
    if (this.cache[key]) {
      this.cache[key].lastUsed = Date.now();
    }
  }

  private cleanupCache(): void {
    // Remove oldest items until under cache limit
    const items = Object.entries(this.cache)
      .sort(([,a], [,b]) => a.lastUsed - b.lastUsed);

    for (const [key, item] of items) {
      delete this.cache[key];
      this.cacheSize -= item.size;
      URL.revokeObjectURL(item.url);

      if (this.cacheSize < this.maxCacheSize * 0.8) {
        break;
      }
    }
  }

  /**
   * Mobile-specific audio playback with wake lock
   */
  async playWithWakeLock(audioUrl: string): Promise<void> {
    if (this.config.wakeLockEnabled && 'wakeLock' in navigator) {
      try {
        this.wakeLock = await (navigator as any).wakeLock.request('screen');
      } catch (error) {
        console.warn('Wake lock failed:', error);
      }
    }

    return new Promise((resolve, reject) => {
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        this.releaseWakeLock();
        resolve();
      };

      audio.onerror = (error) => {
        this.releaseWakeLock();
        reject(error);
      };

      // Mobile audio requires user gesture
      audio.play().catch(reject);
    });
  }

  private releaseWakeLock(): void {
    if (this.wakeLock) {
      this.wakeLock.release();
      this.wakeLock = null;
    }
  }

  /**
   * Preload common audio for instant playback
   */
  async preloadCommonAudio(): Promise<void> {
    if (!this.config.preloadAudio) return;

    const commonPhrases = [
      "I'm here to listen.",
      "What feels most important right now?", 
      "Let's explore that together.",
      "I notice something in what you're sharing.",
      "How does that land with you?"
    ];

    // Preload in background
    const preloadPromises = commonPhrases.map(phrase => 
      this.generateSpeech(phrase).catch(() => null) // Ignore failures
    );

    await Promise.allSettled(preloadPromises);
  }

  /**
   * Monitor network changes and adjust quality
   */
  adaptToNetworkChanges(): void {
    if (!this.config.adaptiveBitrate) return;

    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', () => {
        const newQuality = this.detectOptimalQuality();
        if (newQuality !== this.config.audioQuality) {
          this.config.audioQuality = newQuality;
          console.log(`Voice quality adapted to: ${newQuality}`);
        }
      });
    }
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    // Clear cache and revoke URLs
    for (const item of Object.values(this.cache)) {
      URL.revokeObjectURL(item.url);
    }
    this.cache = {};
    this.cacheSize = 0;

    // Release wake lock
    this.releaseWakeLock();
  }
}

export default MayaVoiceMobile;