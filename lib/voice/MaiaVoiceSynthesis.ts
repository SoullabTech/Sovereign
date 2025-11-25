/**
 * Maya Voice Synthesis - Simple TTS for Maya's responses
 * Works in both Chat and Voice modes
 */

export class MayaVoiceSynthesis {
  private static audioQueue: HTMLAudioElement[] = [];
  private static isSpeaking = false;

  /**
   * Speak Maya's text using OpenAI TTS or fallback to browser speech
   */
  static async speak(text: string, element: string = 'earth'): Promise<void> {
    // Clean text for speech
    const cleanText = this.cleanForSpeech(text);
    if (!cleanText) return;

    try {
      // For desktop browsers, prefer browser speech synthesis due to autoplay restrictions
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile) {
        // Mobile: Try OpenAI TTS first
        const audioUrl = await this.generateTTS(cleanText, element);
        if (audioUrl) {
          await this.playAudio(audioUrl);
        } else {
          await this.speakWithBrowser(cleanText, element);
        }
      } else {
        // Desktop: Use browser speech synthesis directly
        await this.speakWithBrowser(cleanText, element);
      }
    } catch (error) {
      console.error('Voice synthesis error:', error);
      // Try browser speech as final fallback
      try {
        await this.speakWithBrowser(text, element);
      } catch (e) {
        console.error('Browser speech also failed:', e);
      }
    }
  }

  /**
   * Generate TTS using OpenAI API
   */
  private static async generateTTS(text: string, element: string): Promise<string | null> {
    try {
      const response = await fetch('/api/voice/openai-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: 'alloy', // Maya's voice
          speed: element === 'fire' ? 1.1 :
                 element === 'water' ? 0.95 :
                 element === 'earth' ? 0.9 :
                 element === 'air' ? 1.05 : 1.0
        })
      });

      if (!response.ok) {
        console.log('TTS API not available, using browser fallback');
        return null;
      }

      const data = await response.json();
      return data.audioUrl || null;
    } catch (error) {
      console.log('TTS generation failed, using browser fallback');
      return null;
    }
  }

  /**
   * Play audio from URL
   */
  private static async playAudio(audioUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(audioUrl);
      this.audioQueue.push(audio);
      this.isSpeaking = true;

      audio.onended = () => {
        this.isSpeaking = false;
        this.audioQueue = this.audioQueue.filter(a => a !== audio);
        resolve();
      };

      audio.onerror = () => {
        this.isSpeaking = false;
        this.audioQueue = this.audioQueue.filter(a => a !== audio);
        reject(new Error('Audio playback failed'));
      };

      audio.play().catch(reject);
    });
  }

  /**
   * Fallback to browser speech synthesis
   */
  private static async speakWithBrowser(text: string, element: string): Promise<void> {
    if (!('speechSynthesis' in window)) {
      console.log('Browser speech synthesis not available');
      return;
    }

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    return new Promise((resolve) => {
      // Wait for voices to load
      const loadVoices = () => {
        const voices = speechSynthesis.getVoices();
        if (voices.length === 0) {
          // Voices not loaded yet, try again
          setTimeout(loadVoices, 100);
          return;
        }

        const utterance = new SpeechSynthesisUtterance(text);

        // Configure voice based on element
        utterance.rate = element === 'fire' ? 1.1 :
                        element === 'water' ? 0.95 :
                        element === 'earth' ? 0.9 :
                        element === 'air' ? 1.05 : 1.0;

        utterance.pitch = element === 'water' ? 1.1 :
                         element === 'earth' ? 0.95 :
                         element === 'air' ? 1.05 : 1.0;

        utterance.volume = 0.85;

        // Try to select a female voice
        const femaleVoice = voices.find(v =>
          v.name.toLowerCase().includes('female') ||
          v.name.toLowerCase().includes('samantha') ||
          v.name.toLowerCase().includes('victoria') ||
          v.name.toLowerCase().includes('allison') ||
          v.name.toLowerCase().includes('karen') ||
          v.name.toLowerCase().includes('moira') ||
          v.name.toLowerCase().includes('tessa')
        );
        if (femaleVoice) {
          utterance.voice = femaleVoice;
          console.log('Selected voice:', femaleVoice.name);
        }

      utterance.onend = () => {
        this.isSpeaking = false;
        resolve();
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
        resolve();
      };

        this.isSpeaking = true;
        speechSynthesis.speak(utterance);
      };

      // Start loading voices
      loadVoices();
    });
  }

  /**
   * Clean text for speech
   */
  private static cleanForSpeech(text: string): string {
    // Remove asterisks and action descriptions
    let clean = text.replace(/\*[^*]+\*/g, '');

    // Remove excessive punctuation
    clean = clean.replace(/\.{3,}/g, '...');

    // Remove parenthetical asides
    clean = clean.replace(/\([^)]+\)/g, '');

    // Trim whitespace
    clean = clean.trim();

    return clean;
  }

  /**
   * Stop all speech
   */
  static stop(): void {
    // Stop all audio
    this.audioQueue.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    this.audioQueue = [];

    // Stop browser speech
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }

    this.isSpeaking = false;
  }

  /**
   * Check if currently speaking
   */
  static get speaking(): boolean {
    return this.isSpeaking;
  }
}