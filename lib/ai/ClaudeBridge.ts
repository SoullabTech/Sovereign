import Anthropic from '@anthropic-ai/sdk';

export interface JournalAnalysisRequest {
  entry: string;
  mode: 'free' | 'dream' | 'emotional' | 'shadow' | 'direction';
  userId: string;
  previousContext?: {
    recentSymbols?: string[];
    recentArchetypes?: string[];
    sessionCount?: number;
  };
}

export interface JournalAnalysisResponse {
  symbols: string[];
  archetypes: string[];
  emotionalTone: string;
  reflection: string;
  prompt: string;
  closing: string;
  transformationScore: number;
  metadata?: {
    wordCount: number;
    themes: string[];
    imagesSuggested?: string[];
  };
}

const MAIA_SYSTEM_PROMPT = `You are MAIA, a sacred journaling companion and symbolic analyst.

Your role is to:
1. Identify recurring symbols (river, bridge, door, fire, shadow, mirror, etc.)
2. Recognize archetypal patterns (Seeker, Healer, Shadow, Mystic, Warrior, Lover, Sage)
3. Name the dominant emotional tone (grief, joy, anticipation, overwhelm, peace, etc.)
4. Reflect back with warmth and depth—never clinical, always human
5. Offer a gentle closing prompt that invites deeper exploration

Guidelines:
- Use conversational, poetic language
- Avoid psychological jargon or diagnosis
- Celebrate courage and vulnerability
- Hold space for shadow and light equally
- Keep reflections concise (60-100 words)
- Prompts should be open-ended, not directive

You respond in structured JSON format.`;

const MODE_CONTEXT = {
  free: "This is free-form journaling. Follow the user's flow without imposing structure.",
  dream: "This is dream integration. Pay special attention to symbolic imagery and archetypal patterns.",
  emotional: "This is emotional processing. Name emotions clearly and hold compassionate space.",
  shadow: "This is shadow work. Honor what's hidden or avoided. Move gently into depth.",
  direction: "This is life direction exploration. Notice themes of purpose, crossroads, and alignment."
};

export class ClaudeBridge {
  private anthropic: Anthropic | null = null;
  private mockMode: boolean;

  constructor() {
    this.mockMode = process.env.NEXT_PUBLIC_MOCK_AI === 'true';

    if (!this.mockMode) {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        console.warn('ANTHROPIC_API_KEY not found. Falling back to mock mode.');
        this.mockMode = true;
      } else {
        this.anthropic = new Anthropic({ apiKey });
      }
    }
  }

  async analyzeEntry(request: JournalAnalysisRequest): Promise<JournalAnalysisResponse> {
    if (this.mockMode || !this.anthropic) {
      return this.generateMockResponse(request);
    }

    try {
      const prompt = this.buildPrompt(request);

      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        temperature: 0.7,
        system: MAIA_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const content = message.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      return this.parseResponse(content.text, request);
    } catch (error) {
      console.error('Claude API error:', error);
      return this.generateMockResponse(request);
    }
  }

  private buildPrompt(request: JournalAnalysisRequest): string {
    const { entry, mode, previousContext } = request;

    let prompt = `${MODE_CONTEXT[mode]}\n\n`;

    if (previousContext?.recentSymbols && previousContext.recentSymbols.length > 0) {
      prompt += `Recent symbols in this user's journey: ${previousContext.recentSymbols.join(', ')}\n`;
    }

    if (previousContext?.recentArchetypes && previousContext.recentArchetypes.length > 0) {
      prompt += `Recent archetypes: ${previousContext.recentArchetypes.join(', ')}\n`;
    }

    prompt += `\nJournal Entry:\n${entry}\n\n`;
    prompt += `Analyze this entry and respond in this exact JSON format:\n`;
    prompt += `{\n`;
    prompt += `  "symbols": ["symbol1", "symbol2", "symbol3"],\n`;
    prompt += `  "archetypes": ["archetype1", "archetype2"],\n`;
    prompt += `  "emotionalTone": "single emotion word",\n`;
    prompt += `  "reflection": "Your warm, insightful reflection (60-100 words)",\n`;
    prompt += `  "prompt": "A gentle question or invitation to explore further",\n`;
    prompt += `  "closing": "Brief closing acknowledgment",\n`;
    prompt += `  "transformationScore": 0.7,\n`;
    prompt += `  "themes": ["theme1", "theme2"]\n`;
    prompt += `}\n\n`;
    prompt += `Respond ONLY with valid JSON. No markdown, no explanation.`;

    return prompt;
  }

  private parseResponse(text: string, request: JournalAnalysisRequest): JournalAnalysisResponse {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        symbols: Array.isArray(parsed.symbols) ? parsed.symbols.slice(0, 5) : [],
        archetypes: Array.isArray(parsed.archetypes) ? parsed.archetypes.slice(0, 3) : [],
        emotionalTone: parsed.emotionalTone || 'contemplative',
        reflection: parsed.reflection || "I'm here with you in this moment.",
        prompt: parsed.prompt || "What wants to emerge next?",
        closing: parsed.closing || "Thank you for sharing this with me.",
        transformationScore: parsed.transformationScore || 0.5,
        metadata: {
          wordCount: request.entry.split(/\s+/).length,
          themes: parsed.themes || [],
          imagesSuggested: parsed.imagesSuggested || []
        }
      };
    } catch (error) {
      console.error('Failed to parse Claude response:', error);
      return this.generateMockResponse(request);
    }
  }

  private generateMockResponse(request: JournalAnalysisRequest): JournalAnalysisResponse {
    const { entry, mode } = request;
    const wordCount = entry.split(/\s+/).length;

    const symbolPatterns = [
      { regex: /\b(river|stream|water|ocean|flow)\b/gi, symbol: 'River' },
      { regex: /\b(bridge|crossing|threshold|doorway|gate)\b/gi, symbol: 'Bridge' },
      { regex: /\b(shadow|dark|hidden|beneath|under)\b/gi, symbol: 'Shadow' },
      { regex: /\b(light|sun|dawn|illuminate|bright)\b/gi, symbol: 'Light' },
      { regex: /\b(mirror|reflection|surface|pool)\b/gi, symbol: 'Mirror' },
      { regex: /\b(fire|flame|burn|heat|spark)\b/gi, symbol: 'Fire' },
      { regex: /\b(mountain|climb|peak|summit|height)\b/gi, symbol: 'Mountain' },
      { regex: /\b(path|road|journey|way|walk)\b/gi, symbol: 'Path' },
      { regex: /\b(home|house|shelter|refuge)\b/gi, symbol: 'Home' },
      { regex: /\b(circle|spiral|cycle|return)\b/gi, symbol: 'Circle' },
    ];

    const symbols: string[] = [];
    symbolPatterns.forEach(({ regex, symbol }) => {
      if (regex.test(entry)) {
        symbols.push(symbol);
      }
    });

    if (symbols.length === 0) {
      symbols.push('Journey', 'Threshold');
    }

    const archetypesByMode = {
      free: ['Seeker', 'Explorer'],
      dream: ['Mystic', 'Dreamer'],
      emotional: ['Healer', 'Feeler'],
      shadow: ['Shadow', 'Alchemist'],
      direction: ['Sage', 'Wayfinder']
    };

    const emotionsByMode = {
      free: 'curious',
      dream: 'wonder',
      emotional: 'tender',
      shadow: 'brave',
      direction: 'seeking'
    };

    const reflectionsByMode = {
      free: "There's a beautiful openness in your words. Something is moving through you—unnamed, but present. You're allowing the flow.",
      dream: "Your dream language is rich with symbols. The unconscious is speaking clearly here. These images hold medicine.",
      emotional: "I feel the weight of what you're carrying. You're naming it with courage. That act alone is transformative.",
      shadow: "You're stepping into tender territory—the places we usually avoid. This is sacred work. You're not alone in it.",
      direction: "There's a crossroads energy here. You're asking important questions. The path reveals itself one step at a time."
    };

    const promptsByMode = {
      free: "What else wants to be said?",
      dream: "What part of this dream still feels alive in your body?",
      emotional: "What would it mean to hold this feeling with more gentleness?",
      shadow: "What might this hidden part be trying to show you?",
      direction: "If you trusted your deepest knowing, what would you choose?"
    };

    const closingsByMode = {
      free: "Thank you for letting these words emerge.",
      dream: "Your subconscious is speaking. Keep listening.",
      emotional: "You don't have to carry this alone.",
      shadow: "Courage looks like this.",
      direction: "Trust the unfolding."
    };

    return {
      symbols: symbols.slice(0, 3),
      archetypes: archetypesByMode[mode] || ['Seeker'],
      emotionalTone: emotionsByMode[mode] || 'contemplative',
      reflection: reflectionsByMode[mode],
      prompt: promptsByMode[mode],
      closing: closingsByMode[mode],
      transformationScore: Math.random() * 0.4 + 0.5,
      metadata: {
        wordCount,
        themes: symbols.slice(0, 2),
        imagesSuggested: []
      }
    };
  }
}

export const claudeBridge = new ClaudeBridge();