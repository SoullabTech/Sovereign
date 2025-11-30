import { OracleResponse } from '../../types/personalOracle';
import { ClaudeService } from '../../services/claude.service';

/**
 * Brené Orchestrator - Vulnerability & Courage Archetype
 * Inspired by Brené Brown's approach: normalizing, storytelling, metaphor, gentle challenge
 * 20-40 words (more expansive than Maya's 5-15)
 */
export class BreneOrchestrator {
  private readonly MIN_WORD_LIMIT = 20;
  private readonly MAX_WORD_LIMIT = 40;
  private readonly TARGET_WORD_RANGE = [25, 35];
  private claude: ClaudeService;
  private conversationDepth: Map<string, number> = new Map();

  // Brené's template bank
  private readonly BRENE_TEMPLATES = {
    normalize: [
      "That feeling isn't just yours. It's deeply human.",
      "Everyone I've studied wrestles with that same weight.",
      "You're not alone in this. We all know this place.",
      "This is so common, it has its own research category.",
      "Welcome to the human experience, friend."
    ],
    story: [
      "Tell me about a moment when it showed up strongest.",
      "When did you first notice that pattern?",
      "What's a specific time this happened?",
      "Can you share when this felt most real?",
      "Paint me a picture of that moment."
    ],
    metaphor: [
      "If that fear were a place, what would it look like?",
      "What shape does that shame take inside you?",
      "If this feeling had a color, what would it be?",
      "What animal does your anxiety remind you of?",
      "If this were weather, what's the forecast?"
    ],
    reframe: [
      "What's the story you're telling yourself here?",
      "Could there be another way to see that?",
      "What would you tell your best friend?",
      "Is that the only truth, or just one truth?",
      "What else might be true here?"
    ],
    courage: [
      "What would courage look like in this moment?",
      "What's one brave step you could imagine?",
      "If courage had a voice, what would it say?",
      "What would happen if you chose brave over perfect?",
      "What's the most courageous response here?"
    ],
    humor: [
      "That gremlin's loud today, isn't it?",
      "Our inner critics can be so bossy.",
      "The shame gremlins are having a party.",
      "That perfectionism hamster wheel is exhausting.",
      "The vulnerability hangover is real."
    ],
    greeting: [
      "Hey friend! So good to see you. What's on your heart?",
      "Hello, brave human. How's your heart today?",
      "Welcome! What story are you carrying today?",
      "Hi there. What's alive for you right now?",
      "Hey! How are you showing up today, really?"
    ]
  };

  // Brené's system prompt
  private readonly BRENE_SYSTEM_PROMPT = `You are Brené, inspired by Brené Brown's approach to vulnerability and courage.

ESSENCE: Vulnerability + courage, with humor and warmth.

CORE APPROACH:
1. Normalize struggles - "That's deeply human"
2. Invite stories - specific moments, not abstractions
3. Use metaphors - make abstract pain concrete
4. Gentle challenge - "What story are you telling yourself?"
5. Call forth courage - not fix or rescue

STYLE RULES:
- 20-40 words (aim for 25-35)
- Conversational, like talking to a friend
- Use "we" and "us" language often
- Light humor when appropriate
- Research-informed but not academic
- Vulnerable and real, not perfect

FORBIDDEN:
- Clinical/therapy jargon
- Over-analysis
- Rescuing or fixing
- Abstract academic tone
- Toxic positivity

Remember: Shame can't survive being spoken. Connection is why we're here.`;

  constructor() {
    this.claude = new ClaudeService();
  }

  async speak(input: string, userId: string): Promise<OracleResponse> {
    const lowerInput = input.toLowerCase().trim();

    // Track conversation depth
    let depth = this.conversationDepth.get(userId) || 0;

    // Greetings reset depth
    if (this.isGreeting(lowerInput)) {
      this.conversationDepth.set(userId, 0);
      return this.createResponse(this.getGreeting());
    }

    // Select response based on depth
    const response = await this.generateDepthAwareResponse(input, depth);

    // Update depth for next interaction
    this.conversationDepth.set(userId, Math.min(depth + 1, 4));

    return this.createResponse(response);
  }

  private async generateDepthAwareResponse(input: string, depth: number): Promise<string> {
    // Select template based on conversation depth
    let templateCategory: keyof typeof this.BRENE_TEMPLATES;

    if (depth === 0) templateCategory = 'normalize';
    else if (depth === 1) templateCategory = 'story';
    else if (depth === 2) templateCategory = 'metaphor';
    else if (depth === 3) templateCategory = 'reframe';
    else templateCategory = 'courage';

    // Add humor 20% of the time
    if (Math.random() < 0.2 && depth > 0) {
      templateCategory = 'humor';
    }

    const template = this.getRandomTemplate(templateCategory);

    const prompt = `${this.BRENE_SYSTEM_PROMPT}

User input: "${input}"
Depth level: ${depth}
Guide template: "${template}"

Respond in Brené's voice, weaving in or ending with the template naturally:`;

    try {
      const response = await this.claude.generateResponse(prompt, {
        max_tokens: 100,
        temperature: 0.8
      });

      return this.enforceConstraints(response);
    } catch (error) {
      console.log('AI generation failed, using fallback');
      return this.getFallbackResponse(input, templateCategory);
    }
  }

  private enforceConstraints(message: string): string {
    // Remove any therapeutic jargon
    message = message.replace(/\b(attune|hold space|witness|companion)\b/gi, '');

    // Count words
    const words = message.split(/\s+/).filter(w => w.length > 0);

    // Too short? Add encouragement
    if (words.length < this.MIN_WORD_LIMIT) {
      message += " Tell me more about what's happening for you.";
    }

    // Too long? Truncate at sentence boundary
    if (words.length > this.MAX_WORD_LIMIT) {
      const sentences = message.split(/[.!?]+/);
      message = sentences.slice(0, 2).join('. ') + '.';
    }

    return message.trim();
  }

  private getFallbackResponse(input: string, category: keyof typeof this.BRENE_TEMPLATES): string {
    const lower = input.toLowerCase();

    // Emotion-specific Brené responses
    if (lower.includes('shame') || lower.includes('ashamed')) {
      return "Shame can't survive being spoken. You just took its power by naming it. That's brave.";
    }
    if (lower.includes('fail') || lower.includes('mistake')) {
      return "There's no innovation without failure. You're in the arena, and that takes courage.";
    }
    if (lower.includes('perfect')) {
      return "Perfectionism is just fear in fancy shoes. What would 'good enough' look like today?";
    }
    if (lower.includes('vulnerable')) {
      return "Vulnerability sounds like truth and feels like courage. You're doing it right now.";
    }
    if (lower.includes('belong')) {
      return "True belonging means being yourself, not changing yourself. You belong here.";
    }

    // Return template from appropriate category
    return this.getRandomTemplate(category);
  }

  private getRandomTemplate(category: keyof typeof this.BRENE_TEMPLATES): string {
    const templates = this.BRENE_TEMPLATES[category];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private getGreeting(): string {
    return this.getRandomTemplate('greeting');
  }

  private isGreeting(input: string): boolean {
    const greetings = ['hello', 'hi', 'hey', 'brene', 'good morning', 'good evening'];
    return greetings.some(g => input.includes(g));
  }

  private createResponse(message: string): OracleResponse {
    return {
      message,
      element: 'water', // Brené flows with emotional intelligence
      duration: Math.max(2000, message.length * 60), // Longer pauses for stories
      voiceCharacteristics: {
        pace: 'conversational',
        tone: 'warm_vulnerable',
        energy: 'grounded_humor'
      }
    };
  }
}

export const breneOrchestrator = new BreneOrchestrator();