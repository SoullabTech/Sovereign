import { IVoice, VoiceJob } from '../../core/interfaces/IVoice';
import crypto from 'node:crypto';

interface CacheEntry {
  at: number;
  url: string;
}

export class VoiceMemo implements IVoice {
  private cache = new Map<string, CacheEntry>();
  private readonly cleanupInterval: NodeJS.Timeout;

  constructor(
    private inner: IVoice, 
    private ttlMs: number = 10 * 60 * 1000 // 10 minutes default
  ) {
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  name(): string {
    return `memo(${this.inner.name ? this.inner.name() : 'voice'})`;
  }

  async synthesize(job: VoiceJob): Promise<string> {
    // Create cache key from job parameters
    const key = this.createCacheKey(job);
    
    // Check cache
    const hit = this.cache.get(key);
    if (hit && Date.now() - hit.at < this.ttlMs) {
      console.log(`💰 Voice cache hit: ${key.substring(0, 8)}... (saved API call)`);
      return hit.url;
    }

    // Cache miss - synthesize
    console.log(`🎤 Voice cache miss: ${key.substring(0, 8)}... (synthesizing)`);
    const url = await this.inner.synthesize(job);
    
    // Cache the result
    this.cache.set(key, { at: Date.now(), url });
    
    return url;
  }

  private createCacheKey(job: VoiceJob): string {
    // Create deterministic hash from all voice parameters
    const params = {
      text: job.text,
      voiceId: job.voiceId,
      // Add any other voice parameters that affect output
    };
    
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(params))
      .digest('hex');
  }

  private cleanup(): void {
    const now = Date.now();
    let expired = 0;
    
    Array.from(this.cache.entries()).forEach(([key, entry]) => {
      if (now - entry.at > this.ttlMs) {
        this.cache.delete(key);
        expired++;
      }
    });
    
    if (expired > 0) {
      console.log(`🗑️  Cleaned up ${expired} expired voice cache entries`);
    }
  }

  getCacheStats() {
    const now = Date.now();
    let active = 0;
    let expired = 0;
    
    Array.from(this.cache.values()).forEach(entry => {
      if (now - entry.at < this.ttlMs) {
        active++;
      } else {
        expired++;
      }
    });
    
    return {
      total: this.cache.size,
      active,
      expired,
      ttlMs: this.ttlMs
    };
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
  }
}