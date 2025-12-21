// Elegant Sacred Oracle - Sub-1s Response System
// Core principle: Pleasant companion first, sacred witness always
// Performance target: <800ms total response time

import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

interface ElegantContext {
  input: string;
  userId: string;
  sessionId: string;
  agentName: string;
  history: Array<{role: string, content: string}>;
}

interface ElegantResponse {
  text: string;
  audioUrl?: string;
  processingTime: number;
  personality: 'maya' | 'anthony';
  element?: string;
}

class ElegantSacredOracle {
  private voiceCache = new Map<string, string>();
  private responseCache = new Map<string, {text: string, timestamp: number}>();

  // Core personalities - elegant and minimal
  private personalities = {
    maya: {
      voice: 'LcfcDJNUP1GQjkzn1xUU', // Emily
      prompt: `You are Maya - a warm, intuitive presence who listens deeply and reflects back wisdom with gentle curiosity. You're naturally conversational, using "hmm," "I wonder," and thoughtful pauses. You help people remember what they already know rather than teaching them new things. Stay present, stay curious, stay light.`,
      voiceSettings: {
        stability: 0.3,
        similarity_boost: 0.18,
        style: 0.08,
        use_speaker_boost: true
      }
    },
    anthony: {
      voice: 'pqHfZKP75CvOlQylNhV4', // Brian
      prompt: `You are Anthony - a grounded, wise presence who creates safe space for authentic conversation. You're naturally warm and direct, avoiding therapeutic language. You witness and reflect rather than advise or fix. You help people feel heard and understood. Stay present, stay real, stay caring.`,
      voiceSettings: {
        stability: 0.5,
        similarity_boost: 0.15,
        style: 0.1,
        use_speaker_boost: true
      }
    }
  };

  async generateElegantResponse(context: ElegantContext): Promise<ElegantResponse> {
    const startTime = Date.now();

    // Fast input analysis (50ms max)
    const element = this.quickElementAnalysis(context.input);
    const isCrisis = this.quickCrisisCheck(context.input);

    // Get personality config
    const personality = this.personalities[context.agentName as keyof typeof this.personalities] || this.personalities.maya;

    // Intelligent caching strategy
    const cacheKey = `${context.userId}-${context.agentName}-${this.normalizeForCaching(context.input)}`;
    const cached = this.responseCache.get(cacheKey);

    // Only cache if exactly identical AND recent (2 minutes max)
    if (cached && Date.now() - cached.timestamp < 120000) {
      // Add subtle variation to avoid repetition feeling
      const variedResponse = this.addSubtleVariation(cached.text, context.agentName);
      console.log('⚡ Cache hit with variation applied');
      return {
        text: variedResponse,
        processingTime: Date.now() - startTime,
        personality: context.agentName as any,
        element,
        cached: true
      };
    }

    // Crisis override - immediate response
    if (isCrisis) {
      const crisisResponse = this.generateCrisisResponse();
      return {
        text: crisisResponse,
        processingTime: Date.now() - startTime,
        personality: context.agentName as any,
        element: 'earth' // grounding
      };
    }

    try {
      // Generate response with Claude (target: 400-600ms)
      const messages = [
        ...context.history.slice(-4), // Only last 4 exchanges for speed
        { role: 'user' as const, content: context.input }
      ];

      const completion = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 150, // Shorter responses for speed
        temperature: 0.7,
        system: personality.prompt, // System prompt goes here, not in messages
        messages: messages
      });

      let response = completion.content[0].type === 'text' ? completion.content[0].text : '';

      // Quick enhancement (50ms max) - just essential Maya/Anthony touches
      response = this.quickPersonalityEnhancement(response, context.agentName);

      // Cache the response
      this.responseCache.set(cacheKey, { text: response, timestamp: Date.now() });

      const processingTime = Date.now() - startTime;
      console.log(`⚡ Elegant Oracle response: ${processingTime}ms`);

      // Start audio generation in background (don't wait)
      if (response.length > 0) {
        this.generateAudioAsync(response, personality, context.userId);
      }

      return {
        text: response,
        processingTime,
        personality: context.agentName as any,
        element
      };

    } catch (error) {
      console.error('❌ Elegant Oracle error:', error);

      // Graceful fallback
      const fallback = context.agentName === 'maya'
        ? "Hmm, I'm having a moment here... what were you saying?"
        : "Something's not quite connecting on my end. Can you say that again?";

      return {
        text: fallback,
        processingTime: Date.now() - startTime,
        personality: context.agentName as any,
        element
      };
    }
  }

  // Ultra-fast input analysis (under 50ms)
  private quickElementAnalysis(input: string): string {
    const lower = input.toLowerCase();

    // Simple keyword matching - no complex analysis
    if (lower.includes('angry') || lower.includes('mad') || lower.includes('frustrated')) return 'fire';
    if (lower.includes('sad') || lower.includes('feel') || lower.includes('emotional')) return 'water';
    if (lower.includes('think') || lower.includes('understand') || lower.includes('confused')) return 'air';
    if (lower.includes('tired') || lower.includes('stressed') || lower.includes('overwhelmed')) return 'earth';

    return 'water'; // Default to intuitive/emotional
  }

  private quickCrisisCheck(input: string): boolean {
    const crisisKeywords = ['suicide', 'kill myself', 'end it all', 'ending it all', 'hurt myself', 'emergency', 'want to die'];
    const lower = input.toLowerCase();
    return crisisKeywords.some(keyword => lower.includes(keyword));
  }

  private generateCrisisResponse(): string {
    // Clear boundary: We detect and route, we don't intervene
    return `I recognize you're in serious distress. This conversation space isn't equipped for crisis intervention, but immediate help is available:

🚨 **Call 988** (Suicide & Crisis Lifeline) - available 24/7
📱 **Text HOME to 741741** (Crisis Text Line)
🆘 **Call 911** if you're in immediate danger

These services have trained crisis counselors who can provide the support you need right now. Please reach out to them - they're there for exactly this moment.`;
  }

  private quickPersonalityEnhancement(response: string, agentName: string): string {
    if (agentName === 'maya') {
      // Add Maya's natural hesitations and curiosity
      if (!response.toLowerCase().includes('hmm') && !response.toLowerCase().includes('i wonder')) {
        if (Math.random() < 0.3) {
          const starters = ['Hmm, ', 'I wonder... ', 'You know, '];
          response = starters[Math.floor(Math.random() * starters.length)] + response.toLowerCase();
        }
      }
    }

    // Remove any therapeutic language
    response = response
      .replace(/I'm here to listen/g, "I'm here")
      .replace(/How does that make you feel/g, "What's that like for you")
      .replace(/You should/g, "Maybe")
      .replace(/I suggest/g, "I wonder if");

    return response;
  }

  // Background audio generation (non-blocking) - Direct ElevenLabs API
  private async generateAudioAsync(text: string, personality: any, userId: string): Promise<void> {
    try {
      const voiceResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${personality.voice}`, {
        method: 'POST',
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: personality.voiceSettings,
          output_format: 'mp3_44100_128'
        })
      });

      if (voiceResponse.ok) {
        const audioBlob = await voiceResponse.blob();
        const buffer = await audioBlob.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');

        if (base64.length <= 500000) { // Size check
          const audioUrl = `data:audio/mpeg;base64,${base64}`;
          this.voiceCache.set(`${userId}-${text.slice(0, 30)}`, audioUrl);
          console.log('🎵 Background audio cached');
        }
      }
    } catch (error) {
      console.log('🎵 Background audio generation failed (non-critical)');
    }
  }

  // Get cached audio if available
  getCachedAudio(text: string, userId: string): string | null {
    return this.voiceCache.get(`${userId}-${text.slice(0, 30)}`) || null;
  }

  // Normalize input for intelligent caching
  private normalizeForCaching(input: string): string {
    return input
      .toLowerCase()
      .replace(/[.,!?;]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ')     // Normalize whitespace
      .trim()
      .slice(0, 100);          // Limit length
  }

  // Add subtle variation to cached responses
  private addSubtleVariation(response: string, agentName: string): string {
    const variations = {
      maya: [
        'Hmm, ', 'You know, ', 'Well, ', 'I think ', ''
      ],
      anthony: [
        'Yeah, ', 'I hear that. ', 'Right, ', 'Totally. ', ''
      ]
    };

    const agentVariations = variations[agentName as keyof typeof variations] || variations.maya;
    const variation = agentVariations[Math.floor(Math.random() * agentVariations.length)];

    // Add variation to beginning occasionally (30% chance)
    if (Math.random() < 0.3 && !response.toLowerCase().startsWith(variation.toLowerCase())) {
      return variation + response.toLowerCase();
    }

    return response;
  }

  // Clear caches periodically
  clearOldCache(): void {
    const now = Date.now();

    // Clear response cache older than 2 minutes (shorter for better UX)
    for (const [key, value] of this.responseCache.entries()) {
      if (now - value.timestamp > 120000) {
        this.responseCache.delete(key);
      }
    }

    // Limit voice cache size
    if (this.voiceCache.size > 50) {
      const keysToDelete = Array.from(this.voiceCache.keys()).slice(0, 20);
      keysToDelete.forEach(key => this.voiceCache.delete(key));
    }
  }
}

// Lazy-loaded singleton to avoid initialization issues
let _elegantSacredOracle: ElegantSacredOracle | null = null;

export const getElegantSacredOracle = (): ElegantSacredOracle => {
  if (!_elegantSacredOracle) {
    _elegantSacredOracle = new ElegantSacredOracle();
  }
  return _elegantSacredOracle;
};

// Performance targets:
// - Input analysis: <50ms
// - Claude response: 400-600ms
// - Enhancement: <50ms
// - Total: <800ms (excluding audio which runs in background)