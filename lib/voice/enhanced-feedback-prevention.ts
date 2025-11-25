/**
 * Enhanced Voice Feedback Prevention
 * More aggressive system to prevent Maya from hearing herself
 */

export class EnhancedFeedbackPrevention {
  private static instance: EnhancedFeedbackPrevention;
  private isMayaSpeaking = false;
  private recognitionBlocked = false;
  private audioOutputActive = false;
  private recognitionInstance: any = null;
  private blockTimeout: NodeJS.Timeout | null = null;
  private lastMayaText = '';
  private recentMayaPhrases: string[] = [];

  private constructor() {
    this.initializeGlobalListeners();
  }

  static getInstance(): EnhancedFeedbackPrevention {
    if (!EnhancedFeedbackPrevention.instance) {
      EnhancedFeedbackPrevention.instance = new EnhancedFeedbackPrevention();
    }
    return EnhancedFeedbackPrevention.instance;
  }

  /**
   * Initialize global event listeners
   */
  private initializeGlobalListeners() {
    if (typeof window === 'undefined') return;

    // Listen for ANY audio playback that might be Maya
    window.addEventListener('maya-speaking-start', () => {
      this.blockRecognition();
    });

    window.addEventListener('maya-speaking-end', () => {
      // Wait extra time before unblocking
      setTimeout(() => this.unblockRecognition(), 1000);
    });

    // Track Maya's recent outputs to filter echoes
    window.addEventListener('maya-response-generated', (event: any) => {
      if (event.detail?.text) {
        this.lastMayaText = event.detail.text.toLowerCase();
        this.recentMayaPhrases.push(this.lastMayaText);

        // Keep only last 5 phrases
        if (this.recentMayaPhrases.length > 5) {
          this.recentMayaPhrases.shift();
        }
      }
    });
  }

  /**
   * Register and wrap recognition instance
   */
  registerRecognition(recognition: any) {
    this.recognitionInstance = recognition;

    // Save original methods
    const originalStart = recognition.start?.bind(recognition);
    const originalStop = recognition.stop?.bind(recognition);
    const originalAbort = recognition.abort?.bind(recognition);

    // Override start method
    recognition.start = () => {
      if (this.recognitionBlocked || this.isMayaSpeaking) {
        console.log('🚫 Recognition blocked - Maya is speaking');
        return;
      }

      try {
        originalStart();
      } catch (error) {
        console.log('Recognition already started');
      }
    };

    // Override stop method
    recognition.stop = () => {
      try {
        originalStop();
      } catch (error) {
        // Already stopped
      }
    };

    // Override abort method
    recognition.abort = () => {
      try {
        originalAbort();
      } catch (error) {
        // Already aborted
      }
    };

    // Intercept results to filter Maya's voice
    const originalOnResult = recognition.onresult;
    recognition.onresult = (event: any) => {
      if (this.shouldFilterResult(event)) {
        console.log('🔇 Filtered out Maya\'s own voice');
        return;
      }

      if (originalOnResult) {
        originalOnResult(event);
      }
    };

    // Handle recognition start
    recognition.addEventListener('start', () => {
      if (this.isMayaSpeaking || this.recognitionBlocked) {
        console.log('⚠️ Stopping recognition - Maya is active');
        recognition.abort();
      }
    });
  }

  /**
   * Check if speech result is Maya's own voice
   */
  private shouldFilterResult(event: any): boolean {
    if (!event.results || event.results.length === 0) return false;

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      if (result[0]) {
        const transcript = result[0].transcript.toLowerCase().trim();

        // Check if this matches Maya's recent outputs
        for (const phrase of this.recentMayaPhrases) {
          if (this.isSimilarText(transcript, phrase)) {
            console.log(`🔇 Detected echo: "${transcript}" matches Maya's "${phrase}"`);
            return true;
          }
        }

        // Check for common Maya response patterns
        if (this.isMayaPattern(transcript)) {
          console.log(`🔇 Detected Maya pattern: "${transcript}"`);
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Check if two texts are similar (Maya hearing herself)
   */
  private isSimilarText(text1: string, text2: string): boolean {
    // Exact match
    if (text1 === text2) return true;

    // One contains the other
    if (text1.includes(text2) || text2.includes(text1)) return true;

    // Calculate similarity
    const words1 = text1.split(' ');
    const words2 = text2.split(' ');

    let matches = 0;
    for (const word of words1) {
      if (words2.includes(word)) matches++;
    }

    // If more than 70% words match, it's probably an echo
    const similarity = matches / Math.max(words1.length, words2.length);
    return similarity > 0.7;
  }

  /**
   * Detect Maya's typical response patterns
   */
  private isMayaPattern(text: string): boolean {
    const mayaPatterns = [
      /^i see that/i,
      /^tell me more about/i,
      /^there's such/i,
      /^what's calling you/i,
      /^that spark of joy/i,
      /^exploring communication/i,
      /^intimate simplicity/i,
      /^what insights from/i,
      /^remembering that our/i,
      /^truest medicine/i
    ];

    return mayaPatterns.some(pattern => pattern.test(text));
  }

  /**
   * Completely block recognition
   */
  blockRecognition() {
    console.log('🛑 BLOCKING all recognition');
    this.recognitionBlocked = true;
    this.isMayaSpeaking = true;

    // Force stop any active recognition
    if (this.recognitionInstance) {
      try {
        this.recognitionInstance.abort();
      } catch (error) {
        // Already stopped
      }
    }

    // Clear any existing timeout
    if (this.blockTimeout) {
      clearTimeout(this.blockTimeout);
    }

    // Set a safety timeout to unblock after 10 seconds
    this.blockTimeout = setTimeout(() => {
      console.log('⚠️ Safety timeout - unblocking recognition');
      this.unblockRecognition();
    }, 10000);
  }

  /**
   * Unblock recognition
   */
  unblockRecognition() {
    console.log('✅ Unblocking recognition');
    this.recognitionBlocked = false;
    this.isMayaSpeaking = false;

    if (this.blockTimeout) {
      clearTimeout(this.blockTimeout);
      this.blockTimeout = null;
    }
  }

  /**
   * Manual Maya speaking state control
   */
  setMayaSpeaking(speaking: boolean) {
    if (speaking) {
      this.blockRecognition();
    } else {
      // Delay unblocking to ensure audio has stopped
      setTimeout(() => this.unblockRecognition(), 500);
    }
  }

  /**
   * Check if it's safe to listen
   */
  isSafeToListen(): boolean {
    return !this.recognitionBlocked && !this.isMayaSpeaking && !this.audioOutputActive;
  }

  /**
   * Clear Maya's phrase memory (call periodically)
   */
  clearMemory() {
    this.recentMayaPhrases = [];
    this.lastMayaText = '';
  }
}

/**
 * Global function to broadcast Maya's response
 */
export function broadcastMayaResponse(text: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('maya-response-generated', {
      detail: { text }
    }));
  }
}

/**
 * Global function to signal Maya speaking
 */
export function signalMayaSpeaking(speaking: boolean) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(speaking ? 'maya-speaking-start' : 'maya-speaking-end'));
  }
}

export default EnhancedFeedbackPrevention;