// Security and cost guardrails for voice synthesis

export interface VoiceGuardConfig {
  maxTextLength: number;
  maxRequestsPerHour: number;
  maxCharactersPerDay: number;
  enablePiiScrubbing: boolean;
  quotaWarningThreshold: number; // percentage
}

export const DEFAULT_VOICE_GUARDS: VoiceGuardConfig = {
  maxTextLength: 1500, // ~30 seconds of speech
  maxRequestsPerHour: 100,
  maxCharactersPerDay: 50000,
  enablePiiScrubbing: true,
  quotaWarningThreshold: 80 // warn at 80% usage
};

export class VoiceGuards {
  private userUsage = new Map<string, { requests: number; characters: number; resetAt: number }>();
  
  constructor(private config: VoiceGuardConfig = DEFAULT_VOICE_GUARDS) {}

  /**
   * Check if text passes all guards
   * @throws Error with specific guard failure reason
   */
  async checkText(userId: string, text: string): Promise<void> {
    // Length check
    if (text.length > this.config.maxTextLength) {
      throw new Error(`Text too long: ${text.length} chars (max ${this.config.maxTextLength})`);
    }

    // Rate limit check
    const usage = this.getUserUsage(userId);
    if (usage.requests >= this.config.maxRequestsPerHour) {
      throw new Error(`Rate limit exceeded: ${usage.requests} requests this hour`);
    }

    // Daily character limit
    if (usage.characters + text.length > this.config.maxCharactersPerDay) {
      throw new Error(`Daily character limit exceeded: ${usage.characters + text.length}/${this.config.maxCharactersPerDay}`);
    }

    // Update usage
    usage.requests++;
    usage.characters += text.length;
  }

  /**
   * Scrub PII from text before synthesis
   */
  scrubPii(text: string): string {
    if (!this.config.enablePiiScrubbing) return text;

    // Email addresses
    text = text.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[email]');
    
    // Phone numbers (US format)
    text = text.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[phone]');
    
    // Credit card numbers
    text = text.replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[card]');
    
    // Social Security Numbers
    text = text.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[ssn]');
    
    // IP addresses
    text = text.replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[ip]');

    return text;
  }

  /**
   * Check if user has voice enabled preference
   */
  async checkUserPreference(userId: string): Promise<boolean> {
    // In production, check user preferences from database
    // For now, check environment variable
    const globalVoiceEnabled = process.env.VOICE_SYNTHESIS_ENABLED !== 'false';
    
    // Could also check user-specific preference
    // const userPref = await getUserPreference(userId, 'voice_enabled');
    
    return globalVoiceEnabled;
  }

  /**
   * Get quota warning if approaching limits
   */
  getQuotaWarning(charactersRemaining: number, characterLimit: number): string | null {
    const percentUsed = ((characterLimit - charactersRemaining) / characterLimit) * 100;
    
    if (percentUsed >= this.config.quotaWarningThreshold) {
      return `Voice quota ${percentUsed.toFixed(0)}% used (${charactersRemaining} chars remaining)`;
    }
    
    return null;
  }

  private getUserUsage(userId: string) {
    const now = Date.now();
    let usage = this.userUsage.get(userId);
    
    // Initialize or reset if hour passed
    if (!usage || now > usage.resetAt) {
      usage = {
        requests: 0,
        characters: 0,
        resetAt: now + 60 * 60 * 1000 // 1 hour
      };
      this.userUsage.set(userId, usage);
    }
    
    return usage;
  }

  /**
   * Get current usage stats for monitoring
   */
  getUsageStats() {
    const stats = {
      totalUsers: this.userUsage.size,
      totalRequests: 0,
      totalCharacters: 0
    };
    
    for (const usage of this.userUsage.values()) {
      stats.totalRequests += usage.requests;
      stats.totalCharacters += usage.characters;
    }
    
    return stats;
  }
}