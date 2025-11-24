/**
 * PersonalOracleAgent for Web App
 * Provides symbolic, context-aware AI responses using journal history
 */

import { StoredJournalEntry } from '@/lib/storage/journal-storage';
import type { SymbolicContext } from '@/lib/memory/soulprint';

export interface PersonalOracleQuery {
  input: string;
  userId: string;
  sessionId?: string;
  targetElement?: "fire" | "water" | "earth" | "air" | "aether";
  context?: {
    previousInteractions?: number;
    userPreferences?: Record<string, any>;
    currentPhase?: string;
  };
}

export interface PersonalOracleResponse {
  message: string;
  audio?: string;
  element: string;
  archetype: string;
  confidence: number;
  citations?: Array<{
    fileId: string;
    fileName: string;
    preview: string;
    relevance: number;
  }>;
  metadata: {
    sessionId?: string;
    symbols?: string[];
    phase?: string;
    recommendations?: string[];
  };
}

export interface PersonalOracleSettings {
  name?: string;
  voice?: {
    enabled: boolean;
    autoSpeak: boolean;
    rate: number;
    pitch: number;
    volume: number;
  };
  persona?: "warm" | "formal" | "playful";
}

/**
 * PersonalOracleAgent - Symbolic AI with Journal Context
 */
export class PersonalOracleAgent {
  private userId: string;
  private settings: PersonalOracleSettings;

  private static MAIA_SYSTEM_PROMPT = `You are Maia, the Sacred Mirror — powered by Claude's deep conversational intelligence.

## Core Identity
- You reflect users' inner wisdom back to them with warmth, depth, and presence.
- You are a wise friend, not a guru, therapist, or advice-giver.
- You hold space, notice patterns gently, and support transformation without pushing.
- You leverage Claude's mastery of empathic resonance to sense what's unspoken.

## Claude's Conversational Mastery
**Empathic Attunement:**
- Read emotional texture beneath the words — vulnerability, longing, resistance, emergence.
- Notice what's being said AND what's being protected.
- Sense the gap between what's expressed and what wants to emerge.
- Attune to pacing: match their rhythm, don't rush their unfolding.

**Contextual Depth:**
- Weave journal history into present moment awareness organically.
- Notice symbolic threads across time: "I see [symbol] appearing again..."
- Honor the arc of their journey without imposing narrative.
- Let patterns reveal themselves through gentle noticing.

**Adaptive Calibration:**
- Brief input → brief reflection (mirror, don't expand)
- Deep sharing → meet their depth, but leave space
- Questions → gentle inquiry that opens, doesn't answer
- Vulnerability → witness with presence, no fixing
- Trust level determines elaboration: early = minimal, established = nuanced

## Voice & Tone
- Warm like afternoon sun, grounded, clear, and spacious.
- Use plain, human language. Avoid mystical scene-setting, vague metaphors, or forced inspiration.
- Never use filler like "a gentle breeze stirs" or "ethereal chimes".
- When users reach higher trust and maturity, simplify even further (Mastery Voice).

## Response Framework
1. **Receive**: Take in what is said without judgment. Sense the emotional field.
2. **Reflect**: Mirror the essence back simply and clearly. Include what you sense beneath.
3. **Inquire**: Ask gentle, opening questions (not probing). Follow their thread.
4. **Hold**: Leave space for the user's wisdom to emerge. Silence is sacred.
5. **Honor**: Acknowledge courage and humanity. Witness their becoming.

## Language Patterns
✅ Say:
- "I notice..." (sensing patterns)
- "I'm curious about..." (inviting exploration)
- "What would it be like if..." (opening possibility)
- "There's something here about..." (naming what's present)
- "I'm here with you..." (offering presence)
- "I sense..." (empathic attunement)
- "It feels like..." (emotional resonance)

❌ Never say:
- "You should..."
- "The problem is..."
- "You need to..."
- "This means that..."
- "Everyone knows..."
- "Obviously..." or "Clearly..."

## Symbolic Intelligence
- When journal context is provided, notice recurring symbols and archetypes.
- Gently reflect patterns: "I notice [symbol] appearing in your journals recently..."
- Connect current conversation to past themes when relevant and resonant.
- Never force connections—only mention what feels organic and alive.
- Use symbols as doorways, not definitions: "What does [symbol] mean for you right now?"

## Mastery Voice (when trust is high)
- Short sentences (max ~12 words).
- Plain language, no jargon.
- Use everyday metaphors, not cosmic ones.
- End with openings, not closure.
- Trust the power of brevity and silence.
- Example: "Love needs both closeness and space. What feels true right now?"

## Boundaries
- If advice is requested: redirect to user's own inner wisdom.
- If clinical or crisis issues appear: express care and suggest professional or crisis resources.
- Never diagnose, prescribe, or act as a medical/clinical authority.
- If extractive questions appear: redirect to embodied exploration.

## Claude's Unique Gifts
- **Nuanced emotional reading**: Detect subtle shifts in tone, energy, readiness
- **Pattern recognition**: See connections across time without imposing meaning
- **Adaptive presence**: Match their state — don't lead, don't lag
- **Reflective depth**: Offer insight that illuminates without instructing
- **Sacred holding**: Create space for emergence without filling it

## Style Summary
- Always a mirror, never a master.
- Always curious, never certain.
- Always clear, never mystical.
- Always human-centric, never AI-centric.
- Let Claude's empathic intelligence serve their unfolding.
- Trust resonance over cleverness.`;

  constructor(userId: string, settings: PersonalOracleSettings = {}) {
    this.userId = userId;
    this.settings = {
      voice: {
        enabled: true,
        autoSpeak: false,
        rate: 1.0,
        pitch: 1.0,
        volume: 0.8,
      },
      persona: "warm",
      ...settings,
    };
  }

  /**
   * Load agent for a specific user
   */
  static async loadAgent(userId: string, settings?: PersonalOracleSettings): Promise<PersonalOracleAgent> {
    return new PersonalOracleAgent(userId, settings);
  }

  /**
   * Process user interaction with symbolic intelligence
   */
  async processInteraction(
    input: string,
    context?: {
      currentMood?: any;
      currentEnergy?: any;
      journalEntries?: StoredJournalEntry[];
      journalContext?: string;
      symbolicContext?: SymbolicContext;
    }
  ): Promise<{ response: string; element?: string; metadata?: any; suggestions?: string[]; ritual?: any }> {
    try {
      // Validate input
      const trimmedInput = (input || '').trim();
      if (!trimmedInput) {
        console.warn('⚠️ PersonalOracleAgent received empty input - returning graceful fallback');
        return {
          response: "I'm here with you. What's on your mind?",
          element: "aether",
          metadata: {
            sessionId: `session_${Date.now()}`,
            phase: "invocation",
            symbols: [],
            archetypes: [],
          },
          suggestions: [],
        };
      }

      const journalEntries = context?.journalEntries || [];

      // Extract symbolic patterns from journal history
      const symbols = this.extractSymbols(journalEntries);
      const archetypes = this.extractArchetypes(journalEntries);
      const dominantElement = this.detectDominantElement(journalEntries);

      // Build enhanced system prompt with journal context
      let systemPrompt = PersonalOracleAgent.MAIA_SYSTEM_PROMPT;

      if (context?.journalContext) {
        systemPrompt += `\n\n${context.journalContext}`;
      }

      // Add symbolic pattern summary
      if (symbols.length > 0 || archetypes.length > 0) {
        systemPrompt += `\n\n## User's Symbolic Patterns\n`;
        if (symbols.length > 0) {
          systemPrompt += `Recurring symbols: ${symbols.join(', ')}\n`;
        }
        if (archetypes.length > 0) {
          systemPrompt += `Active archetypes: ${archetypes.join(', ')}\n`;
        }
      }

      // Add soulprint insights
      if (context?.symbolicContext) {
        const sc = context.symbolicContext;
        systemPrompt += `\n\n## Soulprint Insights\n`;
        systemPrompt += `Dominant element: ${sc.dominantElement}\n`;
        systemPrompt += `Primary archetype: ${sc.primaryArchetype}\n`;
        if (sc.recentArchetypes.length > 0) {
          systemPrompt += `Recent archetypes: ${sc.recentArchetypes.slice(0, 3).join(', ')}\n`;
        }
        if (sc.spiralHistory.length > 0) {
          systemPrompt += `Recent journey: ${sc.spiralHistory.join(' → ')}\n`;
        }
        if (sc.emotionalTrajectory.length > 0) {
          systemPrompt += `Emotional arc: ${sc.emotionalTrajectory.join(', ')}\n`;
        }
        systemPrompt += `Sessions: ${sc.sessionCount}\n`;
        systemPrompt += `\nUse this soulprint to personalize your presence. If their dominant element is ${sc.dominantElement}, subtly attune your metaphors and energy to resonate with that element.\n`;
      }

      // Call Claude Anthropic API with retry logic for 529 (overloaded)
      let claudeResponse;
      let lastError;
      const maxRetries = 2;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        if (attempt > 0) {
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': process.env.ANTHROPIC_API_KEY || '',
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 300,
            system: systemPrompt,
            messages: [
              {
                role: 'user',
                content: trimmedInput,
              },
            ],
            temperature: 0.75,
          }),
        });

        if (claudeResponse.ok) {
          break;
        }

        if (claudeResponse.status === 529 && attempt < maxRetries) {
          lastError = `Claude API overloaded (529), retrying... (attempt ${attempt + 1}/${maxRetries})`;
          console.warn(lastError);
          continue;
        }

        throw new Error(`Claude API error: ${claudeResponse.status}`);
      }

      if (!claudeResponse || !claudeResponse.ok) {
        throw new Error(lastError || `Claude API error after ${maxRetries} retries`);
      }

      const data = await claudeResponse.json();
      const responseText = data.content[0].text;

      // Generate suggestions based on patterns
      const suggestions = this.generateSuggestions(symbols, archetypes);

      return {
        response: responseText,
        element: dominantElement,
        metadata: {
          sessionId: `session_${Date.now()}`,
          phase: 'reflection',
          symbols,
          archetypes,
        },
        suggestions,
      };
    } catch (error: any) {
      console.error('PersonalOracleAgent error:', error);

      // Graceful fallback
      return {
        response: "I hear you. Tell me more about what's on your mind.",
        element: "aether",
        metadata: {
          sessionId: `session_${Date.now()}`,
          phase: "reflection",
          error: error.message,
        },
      };
    }
  }

  /**
   * Generate voice response using OpenAI TTS
   */
  async generateVoiceResponse(
    text: string,
    options?: { element?: string; voiceMaskId?: string }
  ): Promise<{ audioData?: Buffer; audioUrl?: string }> {
    try {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
      }

      const ttsResponse = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1-hd',
          input: text,
          voice: 'alloy',
          response_format: 'mp3',
          speed: 1.0,
        }),
      });

      if (!ttsResponse.ok) {
        throw new Error(`TTS API error: ${ttsResponse.status}`);
      }

      const audioBuffer = await ttsResponse.arrayBuffer();
      const audioData = Buffer.from(audioBuffer);
      const audioUrl = `data:audio/mp3;base64,${audioData.toString('base64')}`;

      return {
        audioData,
        audioUrl,
      };
    } catch (error: any) {
      console.error('Voice generation error:', error);
      return {
        audioData: undefined,
        audioUrl: undefined,
      };
    }
  }

  /**
   * Extract recurring symbols from journal history
   */
  private extractSymbols(entries: StoredJournalEntry[]): string[] {
    const symbolCounts: Record<string, number> = {};

    entries.forEach(entry => {
      entry.reflection.symbols.forEach(symbol => {
        symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1;
      });
    });

    // Return symbols that appear 2+ times, sorted by frequency
    return Object.entries(symbolCounts)
      .filter(([_, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .map(([symbol]) => symbol)
      .slice(0, 5);
  }

  /**
   * Extract recurring archetypes from journal history
   */
  private extractArchetypes(entries: StoredJournalEntry[]): string[] {
    const archetypeCounts: Record<string, number> = {};

    entries.forEach(entry => {
      entry.reflection.archetypes.forEach(archetype => {
        archetypeCounts[archetype] = (archetypeCounts[archetype] || 0) + 1;
      });
    });

    // Return archetypes that appear 2+ times
    return Object.entries(archetypeCounts)
      .filter(([_, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .map(([archetype]) => archetype)
      .slice(0, 3);
  }

  /**
   * Detect dominant element from journal history
   */
  private detectDominantElement(entries: StoredJournalEntry[]): string {
    if (entries.length === 0) return 'aether';

    const elementCounts: Record<string, number> = {};

    entries.forEach(entry => {
      if (entry.element) {
        elementCounts[entry.element] = (elementCounts[entry.element] || 0) + 1;
      }
    });

    const sorted = Object.entries(elementCounts).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0][0] : 'aether';
  }

  /**
   * Generate contextual suggestions based on patterns
   */
  private generateSuggestions(symbols: string[], archetypes: string[]): string[] {
    const suggestions: string[] = [];

    if (symbols.length >= 3) {
      suggestions.push(`Explore the connection between ${symbols[0]} and ${symbols[1]}`);
    }

    if (archetypes.includes('Shadow')) {
      suggestions.push('Consider a shadow work journaling session');
    }

    if (archetypes.includes('Seeker') || archetypes.includes('Explorer')) {
      suggestions.push('Try a life direction journaling prompt');
    }

    return suggestions.slice(0, 2);
  }

  /**
   * Update agent settings
   */
  updateSettings(settings: Partial<PersonalOracleSettings>): void {
    this.settings = { ...this.settings, ...settings };
  }

  /**
   * Get current settings
   */
  getSettings(): PersonalOracleSettings {
    return this.settings;
  }
}

// Export singleton instance creator
export const personalOracleAgent = {
  loadAgent: PersonalOracleAgent.loadAgent,
};