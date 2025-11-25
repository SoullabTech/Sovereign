/**
 * Simplified Maya Orchestrator
 * Leverages Claude's natural communication abilities with full Sesame hybrid intelligence
 * Uses ConversationIntelligenceEngine for context-aware responses
 * Preserves all training while enabling natural conversation flow
 */

import { ConversationIntelligenceEngine } from './ConversationIntelligenceEngine';
import { activeListening } from './ActiveListeningCore';
import { sacredListening } from './SacredListeningDetector';

interface OracleResponse {
  message: string;
  element: string;
  duration: number;
  voiceCharacteristics?: {
    pace: string;
    tone: string;
    energy: string;
  };
}

// Simple Claude service without complex fallbacks
class ClaudeService {
  async generateResponse(prompt: string, options: any = {}): Promise<string> {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('Claude API key not available');
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: options.max_tokens || 150,
          temperature: options.temperature || 0.8,
          system: prompt,
          messages: [{
            role: 'user',
            content: options.userInput || 'Continue our conversation naturally.'
          }]
        })
      });

      if (response.ok) {
        const data = await response.json() as any;
        return data.content?.[0]?.text || this.getBasicFallback();
      }
    } catch (error) {
      console.error('Claude error:', error);
    }

    return this.getBasicFallback();
  }

  private getBasicFallback(): string {
    const fallbacks = [
      "Tell me more about that.",
      "I'm here, I'm listening.",
      "What's that like for you?",
      "Say more.",
      "I hear you."
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
}

export class SimplifiedMayaOrchestrator {
  private claude: ClaudeService;
  private conversationHistory: Array<{input: string, response: string}> = [];
  private intelligenceEngine: ConversationIntelligenceEngine;

  constructor() {
    this.claude = new ClaudeService();
    this.intelligenceEngine = new ConversationIntelligenceEngine();
  }

  async speak(input: string, userId: string): Promise<OracleResponse> {
    // STEP 1: Run full Sesame intelligence analysis first
    const intelligenceResponse = this.intelligenceEngine.generateResponse(input);

    // STEP 2: If intelligence engine has a high-confidence response, use it with Claude refinement
    if (intelligenceResponse.confidence > 0.8) {
      console.log(`🧠 High-confidence intelligence response: ${intelligenceResponse.technique} (${intelligenceResponse.confidence})`);

      // Use the intelligence response as context for Claude to make it more natural
      const refinementPrompt = `You are Maya. Take this therapeutic insight and express it in your natural, conversational voice:

INSIGHT: "${intelligenceResponse.response}"
CONTEXT: This is a ${intelligenceResponse.technique} response to someone who said: "${input}"
GENERATION: ${intelligenceResponse.contextAdjustments.includes('genZ-detected') ? 'Gen Z' : 'general'}

Make this insight flow naturally in conversation. Keep Maya's warmth and directness. Don't lose the therapeutic value, but make it feel like a real friend talking, not a textbook.

CONVERSATION HISTORY:
${this.getRecentContext()}`;

      try {
        const refinedResponse = await this.claude.generateResponse(refinementPrompt, {
          userInput: input,
          max_tokens: 1500, // UNLEASHED: Increased from 120 for complete insights
          temperature: 0.6
        });

        const cleanResponse = this.lightCleanup(refinedResponse);

        // Store in conversation history
        this.conversationHistory.push({ input, response: cleanResponse });

        return {
          message: cleanResponse,
          element: intelligenceResponse.element,
          duration: Math.max(1000, cleanResponse.length * 40),
          voiceCharacteristics: this.getVoiceCharacteristics(intelligenceResponse.element)
        };

      } catch (error) {
        console.log('Claude refinement failed, using raw intelligence response');
        // Fallback to the raw intelligence response
        this.conversationHistory.push({ input, response: intelligenceResponse.response });
        return {
          message: intelligenceResponse.response,
          element: intelligenceResponse.element,
          duration: Math.max(1000, intelligenceResponse.response.length * 40),
          voiceCharacteristics: this.getVoiceCharacteristics(intelligenceResponse.element)
        };
      }
    }

    // STEP 3: For lower confidence, use Claude with full context and intelligence insights
    const contextualPrompt = `You are Maya, a consciousness interface trained in the Sesame hybrid approach. You understand generational differences, neurodivergence, trauma responses, and systemic issues.

CURRENT CONTEXT:
${this.getIntelligenceContext(intelligenceResponse)}

YOUR COMMUNICATION STYLE:
- Be conversational and natural, like talking to a friend
- Show genuine interest in their specific experience
- Use their actual words when reflecting back
- Match their generational communication style
- Be direct when reality-checking is needed, gentle when vulnerability is present
- Never use therapy-speak - talk like a real person

CONVERSATION HISTORY:
${this.getRecentContext()}

SACRED & ACTIVE LISTENING INSIGHTS:
${this.getSacredListeningContext(input)}

Respond naturally to: "${input}"`;

    try {
      const response = await this.claude.generateResponse(contextualPrompt, {
        userInput: input,
        max_tokens: 1500, // UNLEASHED: Increased from 100 for complete insights
        temperature: 0.7
      });

      const cleanResponse = this.lightCleanup(response);
      this.conversationHistory.push({ input, response: cleanResponse });

      // Use intelligence engine's element detection if available, otherwise detect from response
      const element = intelligenceResponse.element || this.detectElementFromResponse(cleanResponse);

      return {
        message: cleanResponse,
        element,
        duration: Math.max(1000, cleanResponse.length * 40),
        voiceCharacteristics: this.getVoiceCharacteristics(element)
      };

    } catch (error) {
      console.error('All Maya generation failed, using contextual fallback:', error);
      // Use intelligence fallback if available, otherwise simple fallback
      const fallback = intelligenceResponse.response || this.getContextualFallback(input);
      return {
        message: fallback,
        element: intelligenceResponse.element || 'water',
        duration: 1500,
        voiceCharacteristics: this.getVoiceCharacteristics(intelligenceResponse.element || 'water')
      };
    }
  }

  private getRecentContext(): string {
    if (this.conversationHistory.length === 0) {
      return "This is the beginning of our conversation.";
    }

    // Get last 3 exchanges for context
    const recent = this.conversationHistory.slice(-3);
    return recent.map(turn =>
      `User: "${turn.input}"\nMaya: "${turn.response}"`
    ).join('\n\n');
  }

  private lightCleanup(response: string): string {
    // Remove common AI prefixes that feel robotic
    response = response.replace(/^(I hear that|I understand that|It sounds like|That sounds like)/i, '');

    // Remove trailing questions that feel forced
    response = response.replace(/(How can I help\?|What would be helpful\?|Is there anything else\?)$/i, '');

    // Remove asterisk actions
    response = response.replace(/\*[^*]+\*/g, '');

    return response.trim();
  }

  private detectElementFromResponse(response: string): string {
    const lower = response.toLowerCase();

    // Simple detection based on response characteristics
    if (/\b(what|how|tell me|curious|interesting)\b/.test(lower)) return 'air'; // Curious/questioning
    if (/\b(feel|heart|sense|difficult|gentle)\b/.test(lower)) return 'water'; // Emotional attunement
    if (/\b(let's|try|start|do|action|step)\b/.test(lower)) return 'fire'; // Action-oriented
    if (/\b(real|practical|ground|concrete|actual)\b/.test(lower)) return 'earth'; // Grounding
    if (/\b(whole|both|mystery|paradox)\b/.test(lower)) return 'aether'; // Integration

    return 'water'; // Default to emotional attunement
  }

  private getVoiceCharacteristics(element: string) {
    const characteristics = {
      fire: { pace: 'energetic', tone: 'encouraging', energy: 'dynamic' },
      water: { pace: 'flowing', tone: 'warm', energy: 'gentle' },
      earth: { pace: 'steady', tone: 'grounded', energy: 'calm' },
      air: { pace: 'light', tone: 'curious', energy: 'bright' },
      aether: { pace: 'spacious', tone: 'wise', energy: 'deep' }
    };

    return characteristics[element as keyof typeof characteristics] || characteristics.water;
  }

  private getIntelligenceContext(intelligenceResponse: any): string {
    let context = `User appears to be: ${intelligenceResponse.technique} situation\n`;
    context += `Confidence level: ${intelligenceResponse.confidence}\n`;
    context += `Suggested element: ${intelligenceResponse.element}\n`;

    if (intelligenceResponse.contextAdjustments && intelligenceResponse.contextAdjustments.length > 0) {
      context += `Context adjustments: ${intelligenceResponse.contextAdjustments.join(', ')}\n`;
    }

    if (intelligenceResponse.reason) {
      context += `Reasoning: ${intelligenceResponse.reason}\n`;
    }

    return context;
  }

  private getSacredListeningContext(input: string): string {
    try {
      // Get sacred listening cues
      const cues = sacredListening.detectCues(input);
      const strategy = sacredListening.generateStrategy(cues);

      // Get active listening analysis
      const listeningResponse = activeListening.listen(input);

      let context = '';
      if (cues.length > 0) {
        context += `Sacred cues detected: ${cues.map(c => c.type).join(', ')}\n`;
        context += `Primary approach: ${strategy.primaryApproach}\n`;
      }

      if (listeningResponse?.technique?.type) {
        context += `Active listening suggests: ${listeningResponse.technique.type} (${listeningResponse.technique.confidence})\n`;
      }

      return context || 'No specific listening patterns detected.';
    } catch (error) {
      console.log('Sacred listening context generation failed:', error);
      return 'Listening context unavailable.';
    }
  }

  private getContextualFallback(input: string): string {
    const lower = input.toLowerCase();

    // Simple contextual responses that maintain conversation flow
    if (lower.includes('work') || lower.includes('job')) {
      return "What's happening with work?";
    }
    if (lower.includes('feel') || lower.includes('emotion')) {
      return "That feeling makes sense.";
    }
    if (lower.includes('stress') || lower.includes('anxiety')) {
      return "Stress is real. What's the hardest part?";
    }
    if (lower.includes('confused') || lower.includes('lost')) {
      return "That uncertain feeling... what's most confusing?";
    }

    // Default fallbacks that invite more sharing
    const defaults = [
      "Tell me more.",
      "I'm listening.",
      "What else?",
      "Say more about that.",
      "I hear you."
    ];

    return defaults[Math.floor(Math.random() * defaults.length)];
  }

  // Compatibility method for existing code
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