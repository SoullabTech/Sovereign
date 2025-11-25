/**
 * Maya Intelligent Orchestrator
 * Simple, powerful architecture that gives Claude full intelligence to be Maya
 * Enhanced with comprehensive knowledge base integration
 */

import { getMayaSystemPrompt, getMayaGreeting } from './MayaSystemPrompt';
import { getMayaEnhancedPrompt, getContextualGreeting, UserJourney, ConversationContext } from './MayaEnhancedPrompt';
import { mayaKnowledgeBase } from './MayaKnowledgeBase';

type ConversationEntry = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

type MayaResponse = {
  message: string;
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  duration: number;
  voiceCharacteristics: {
    pace: string;
    tone: string;
    energy: string;
  };
};

export class MayaIntelligentOrchestrator {
  private conversations = new Map<string, ConversationEntry[]>();
  private apiKey = process.env.ANTHROPIC_API_KEY;

  async speak(input: string, userId: string): Promise<MayaResponse> {
    // Handle greetings naturally
    if (this.isSimpleGreeting(input)) {
      return this.createResponse(getMayaGreeting(), 'earth');
    }

    // Get conversation history for context
    const conversationHistory = this.getConversationHistory(userId);

    // Build context for Claude
    const userContext = this.buildUserContext(conversationHistory, input);
    const systemPrompt = getMayaSystemPrompt(userContext);

    // Create conversation messages for Claude
    const messages = [
      ...conversationHistory.slice(-6).map(entry => ({
        role: entry.role,
        content: entry.content
      })),
      {
        role: 'user' as const,
        content: input
      }
    ];

    try {
      // Get Maya's response from Claude
      const response = await this.callClaude(systemPrompt, messages);

      // Store conversation
      this.storeConversation(userId, input, response);

      // Detect element from response content
      const element = this.detectElement(response);

      return this.createResponse(response, element);

    } catch (error) {
      console.error('Maya Intelligence Error:', error);

      // Natural fallback
      const fallbacks = [
        "I'm having trouble connecting right now. What's most important for you to share?",
        "Something's off with my processing. Can you tell me more about what's going on?",
        "I'm not quite catching that. What's really on your mind?"
      ];

      const fallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      return this.createResponse(fallback, 'earth');
    }
  }

  private async callClaude(systemPrompt: string, messages: any[]): Promise<string> {
    if (!this.apiKey) {
      throw new Error('No Claude API key available');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 300,
        temperature: 0.8,
        system: systemPrompt,
        messages: messages
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json() as any;
    return data.content?.[0]?.text?.trim() || '';
  }

  private getConversationHistory(userId: string): ConversationEntry[] {
    if (!this.conversations.has(userId)) {
      this.conversations.set(userId, []);
    }
    return this.conversations.get(userId)!;
  }

  private storeConversation(userId: string, userInput: string, mayaResponse: string): void {
    const history = this.getConversationHistory(userId);

    history.push({
      role: 'user',
      content: userInput,
      timestamp: new Date()
    });

    history.push({
      role: 'assistant',
      content: mayaResponse,
      timestamp: new Date()
    });

    // Keep last 20 exchanges (40 entries)
    if (history.length > 40) {
      history.splice(0, history.length - 40);
    }
  }

  private buildUserContext(history: ConversationEntry[], currentInput: string): any {
    const recentTopics = history
      .filter(entry => entry.role === 'user')
      .slice(-3)
      .map(entry => entry.content);

    return {
      conversationLength: history.length / 2,
      recentTopics,
      currentInput,
      lastMayaResponse: history.filter(entry => entry.role === 'assistant').slice(-1)[0]?.content
    };
  }

  private isSimpleGreeting(input: string): boolean {
    const greeting = input.toLowerCase().trim();
    const simpleGreetings = ['hi', 'hello', 'hey', 'maya', 'hi maya', 'hello maya'];
    return simpleGreetings.includes(greeting) && input.length < 20;
  }

  private detectElement(response: string): 'fire' | 'water' | 'earth' | 'air' | 'aether' {
    const lower = response.toLowerCase();

    // Fire: Action, energy, breakthrough
    if (/action|energy|move|change|breakthrough|fire|passion|power/i.test(lower)) {
      return 'fire';
    }

    // Water: Emotions, feelings, flow
    if (/feel|emotion|heart|flow|tears|love|pain|hurt|gentle/i.test(lower)) {
      return 'water';
    }

    // Air: Thoughts, clarity, perspective
    if (/think|mind|clarity|understand|perspective|idea|breath/i.test(lower)) {
      return 'air';
    }

    // Earth: Grounding, practical, body
    if (/ground|body|practical|solid|foundation|present|here/i.test(lower)) {
      return 'earth';
    }

    // Aether: Spirit, mystery, transcendence
    if (/spirit|soul|mystery|sacred|divine|whole|unity/i.test(lower)) {
      return 'aether';
    }

    // Default to water for emotional content
    return 'water';
  }

  private createResponse(message: string, element: 'fire' | 'water' | 'earth' | 'air' | 'aether'): MayaResponse {
    const voiceMapping = {
      fire: { pace: 'energetic', tone: 'encouraging', energy: 'dynamic' },
      water: { pace: 'flowing', tone: 'empathetic', energy: 'gentle' },
      earth: { pace: 'deliberate', tone: 'warm_grounded', energy: 'calm' },
      air: { pace: 'quick', tone: 'curious', energy: 'light' },
      aether: { pace: 'spacious', tone: 'wise', energy: 'deep' }
    };

    return {
      message,
      element,
      duration: Math.max(1500, message.length * 60),
      voiceCharacteristics: voiceMapping[element]
    };
  }

  // Compatibility method for testing
  async processMessage(input: string): Promise<{
    message: string;
    topics?: string[];
    emotions?: string[];
    elements?: string[];
    memoryTriggered?: boolean;
  }> {
    const response = await this.speak(input, 'test-user');
    return {
      message: response.message,
      elements: [response.element],
      memoryTriggered: false
    };
  }
}