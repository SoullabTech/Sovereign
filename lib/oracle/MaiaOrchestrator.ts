import { sacredListening } from './SacredListeningDetector';
import { activeListening } from './ActiveListeningCore';
import { dynamicPrompts } from './DynamicPromptOrchestrator';
import { conversationAnalyzer } from './ConversationAnalyzer';
import { conversationFixes } from './ConversationFixes';
import { dbtOrchestrator, dbtInterventions, crisisSkills } from '../skills/dbtTechniques';
import { existentialCrisisSupport } from './ExistentialCrisisSupport';
import { genXBridgeGeneration } from './GenXBridgeGeneration';
import { ConversationIntelligenceEngine } from './ConversationIntelligenceEngine';

// Oracle response type
type OracleResponse = {
  message: string;
  element: string;
  duration: number;
  voiceCharacteristics?: {
    pace: string;
    tone: string;
    energy: string;
  };
};
// ClaudeService for lib version
class ClaudeService {
  async generateResponse(prompt: string, options: any = {}): Promise<string> {
    if (!process.env.ANTHROPIC_API_KEY) {
      return this.getFallback(prompt);
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
          max_tokens: options.max_tokens || 300,
          temperature: options.temperature || 0.85,
          system: prompt,
          messages: [{ role: 'user', content: 'Be warm, conversational, and genuinely curious. Share a relatable insight or ask a meaningful follow-up question about their specific experience. Aim for 2-3 natural sentences, like talking to a friend.' }]
        })
      });
      if (response.ok) {
        const data = await response.json() as any;
        return data.content?.[0]?.text || this.getFallback(prompt);
      }
    } catch (error) {
      console.error('Claude error:', error);
    }
    return this.getFallback(prompt);
  }

  private getFallback(prompt: string): string {
    const lower = prompt.toLowerCase();
    if (lower.includes('stress')) return 'Stress is so real. You\'re not alone.';
    if (lower.includes('sad')) return 'Sadness is brave. I\'m here.';
    if (lower.includes('angry')) return 'Anger makes sense sometimes.';
    return 'Tell me more.';
  }
}

export class MaiaOrchestrator {
  private readonly HARD_WORD_LIMIT = 150;
  private readonly TARGET_WORD_RANGE = [50, 100];
  private claude: ClaudeService;
  private conversationIntelligence: ConversationIntelligenceEngine;
  private conversationHistories: Map<string, Array<{input: string, response: string, topics: string[]}>> = new Map();

  // Forbidden therapy-speak patterns
  private readonly FORBIDDEN_PATTERNS = [
    /i\s+sense/gi,
    /i\s+witness/gi,
    /hold\s+space/gi,
    /attuning/gi,
    /present\s+moment/gi,
    /companion\s+you/gi,
    /support\s+you/gi,
    /i'm\s+here\s+to/gi,
    /let\s+me\s+hold/gi
  ];

  constructor() {
    this.claude = new ClaudeService();
    this.conversationIntelligence = new ConversationIntelligenceEngine();
  }

  private getConversationHistory(userId: string): Array<{input: string, response: string, topics: string[]}> {
    if (!this.conversationHistories.has(userId)) {
      this.conversationHistories.set(userId, []);
    }
    return this.conversationHistories.get(userId)!;
  }

  // Alias for compatibility with test scripts
  async processMessage(input: string): Promise<{
    message: string;
    topics?: string[];
    emotions?: string[];
    elements?: string[];
    memoryTriggered?: boolean;
  }> {
    const response = await this.speak(input, 'test-user');
    const emotions = this.extractEmotions(input);
    const topics = this.extractTopics(input);

    return {
      message: response.message,
      topics,
      emotions,
      elements: [response.element],
      memoryTriggered: false // Could enhance this later
    };
  }

  async speak(input: string, userId: string): Promise<OracleResponse> {
    const lowerInput = input.toLowerCase().trim();

    // PRIORITY -1: Use ConversationIntelligenceEngine for enhanced Gen Z/generational awareness
    try {
      const intelligentResponse = this.conversationIntelligence.generateResponse(input);

      if (intelligentResponse && intelligentResponse.message) {
        // Clean and validate response
        const cleanedResponse = this.cleanResponse(intelligentResponse.message);
        if (cleanedResponse && cleanedResponse.length > 20 && !intelligentResponse.message.includes('[')) {
          const conversationHistory = this.getConversationHistory(userId);
          conversationHistory.push({
            input,
            response: cleanedResponse,
            topics: this.extractTopics(input)
          });

          // Detect element from response or input
          const element = intelligentResponse.element || this.detectElement(input);

          return this.createResponse(
            cleanedResponse,
            2000,
            element
          );
        }
      }
    } catch (error) {
      console.log('ConversationIntelligence processing, continuing with other methods:', error);
    }

    // PRIORITY 0: Check for DBT crisis interventions FIRST
    const emotions = this.extractEmotions(input);
    const intensity = this.calculateIntensity(input);
    const topics = this.extractTopics(input);

    // Enhanced DBT orchestrator import
    const { DBTOrchestrator } = require('./DBTTechniques');
    const dbtOrchestrator = new DBTOrchestrator();

    // Check for BPD-specific patterns first
    const bpdPattern = dbtOrchestrator.assessBPDPattern(input);
    if (bpdPattern) {
      console.log(`💡 DBT Pattern Detected: ${bpdPattern.pattern} (${bpdPattern.module})`);
      const conversationHistory = this.getConversationHistory(userId);
      conversationHistory.push({
        input,
        response: bpdPattern.response,
        topics
      });
      return this.createResponse(bpdPattern.response, 2500, 'water');
    }

    // Check for general DBT needs
    const dbtAssessment = dbtOrchestrator.assessDBTNeed(emotions, intensity, topics, {});
    if (dbtAssessment && (intensity > 0.7 || this.hasSafetyRisk(input))) {
      const dbtResponse = dbtOrchestrator.formatDBTResponse(dbtAssessment);
      const conversationHistory = this.getConversationHistory(userId);
      conversationHistory.push({
        input,
        response: dbtResponse,
        topics
      });
      return this.createResponse(dbtResponse, 2000, dbtAssessment.elementalAlignment[0]);
    }

    // PRIORITY 1: Check for existential dread/information overload patterns FIRST
    // (These are real concerns that shouldn't be dismissed as grandiosity)
    const existentialDreadResponse = this.checkForExistentialDread(input);
    if (existentialDreadResponse) {
      const conversationHistory = this.getConversationHistory(userId);
      conversationHistory.push({
        input,
        response: existentialDreadResponse.message,
        topics: this.extractTopics(input)
      });
      return existentialDreadResponse;
    }

    // PRIORITY 1.5: Check for Gen X bridge generation patterns
    const genXResponse = this.checkForGenX(input);
    if (genXResponse) {
      const conversationHistory = this.getConversationHistory(userId);
      conversationHistory.push({
        input,
        response: genXResponse.message,
        topics: this.extractTopics(input)
      });
      return genXResponse;
    }

    // PRIORITY 2: Check for grandiosity patterns requiring boundaries
    const grandioseResponse = this.checkForGrandiosity(input);
    if (grandioseResponse) {
      const conversationHistory = this.getConversationHistory(userId);
      conversationHistory.push({
        input,
        response: grandioseResponse.message,
        topics: this.extractTopics(input)
      });
      return grandioseResponse;
    }

    // PRIORITY 3: Check for autism/neurodivergent communication needs
    const autismResponse = this.checkForAutismCommunication(input);
    if (autismResponse) {
      const conversationHistory = this.getConversationHistory(userId);
      conversationHistory.push({
        input,
        response: autismResponse.message,
        topics: this.extractTopics(input)
      });
      return autismResponse;
    }

    // PRIORITY 4: Check for breakthrough moments (HIGHEST EMOTIONAL PRIORITY)
    const breakthroughResponse = this.checkForBreakthrough(input);
    if (breakthroughResponse) {
      const conversationHistory = this.getConversationHistory(userId);
      conversationHistory.push({
        input,
        response: breakthroughResponse.message,
        topics: this.extractTopics(input)
      });
      return breakthroughResponse;
    }

    // PRIORITY 5: Check for paradox/integration moments
    const paradoxResponse = this.checkForParadox(input);
    if (paradoxResponse) {
      const conversationHistory = this.getConversationHistory(userId);
      conversationHistory.push({
        input,
        response: paradoxResponse.message,
        topics: this.extractTopics(input)
      });
      return paradoxResponse;
    }

    // PRIORITY 6: Check for vulnerability beneath defenses
    const vulnerabilityResponse = this.checkForVulnerability(input);
    if (vulnerabilityResponse) {
      const conversationHistory = this.getConversationHistory(userId);
      conversationHistory.push({
        input,
        response: vulnerabilityResponse.message,
        topics: this.extractTopics(input)
      });
      return vulnerabilityResponse;
    }

    // PRIORITY 7: Check for neurodivergent validation needs
    const validationResponse = this.checkForValidation(input);
    if (validationResponse) {
      const conversationHistory = this.getConversationHistory(userId);
      conversationHistory.push({
        input,
        response: validationResponse.message,
        topics: this.extractTopics(input)
      });
      return validationResponse;
    }

    // Use ConversationFixes for improved response generation
    const fixedResponse = conversationFixes.generateResponse(input);
    if (fixedResponse && fixedResponse.response && !fixedResponse.response.includes('...')) {
      // Track this in history
      const conversationHistory = this.getConversationHistory(userId);
      conversationHistory.push({
        input,
        response: fixedResponse.response,
        topics: this.extractTopics(input)
      });
      return this.createResponse(fixedResponse.response, 2000, 'water');
    }

    // Get active listening analysis
    const listeningResponse = activeListening.listen(input);

    // Detect sacred cues in the input
    const cues = sacredListening.detectCues(input);
    const strategy = sacredListening.generateStrategy(cues);

    // Warm greetings for common inputs - no AI needed
    if (this.isGreeting(lowerInput) && cues.length === 0) {
      return this.createResponse(this.getSimpleGreeting());
    }

    // Handle very short responses with warmth
    if (input.length < 8 && cues.length === 0) {
      const quickResponse = this.getQuickResponse(lowerInput);
      if (quickResponse) {
        return this.createResponse(quickResponse);
      }
    }

    // DISABLED: Active listening mirror creates robotic responses
    // Only use as absolute final fallback when Claude and all other systems fail
    // if (listeningResponse.technique.confidence > 0.9) { // Raised threshold to almost never trigger
    //   const response = this.enhanceListeningResponse(listeningResponse, input);
    //   return this.createResponse(response, listeningResponse.silenceDuration, listeningResponse.technique.element);
    // }

    // Try AI with both sacred listening AND active listening awareness
    let message = await this.generateIntegratedResponse(input, strategy, listeningResponse);

    // Validate and enforce limits
    message = this.enforceConstraints(message, input);

    // Live analysis and self-assessment
    const response = this.createResponse(message, listeningResponse.silenceDuration);

    // Store conversation history for context retention
    const conversationHistory = this.getConversationHistory(userId);
    conversationHistory.push({
      input,
      response: response.message,
      topics
    });

    // Analyze conversation quality in real-time (dev mode)
    if (process.env.NODE_ENV === 'development') {
      conversationAnalyzer.analyze(
        input,
        response.message,
        { dominant: response.element, intensity: 0.5 }
      );
    }

    return response;
  }

  private async generateIntegratedResponse(input: string, strategy: any, listeningResponse: any): Promise<string> {
    // Use dynamic prompt orchestration for truly transformational responses
    const context = dynamicPrompts.buildContext(input);
    const spiralState = dynamicPrompts.determineSpiralState(input);
    const patterns = dynamicPrompts.detectPatterns(input);

    // Get dynamically assembled prompt
    const transformationalPrompt = dynamicPrompts.assembleTransformationalPrompt(
      input,
      context,
      spiralState,
      patterns
    );

    try {
      const response = await this.claude.generateResponse(transformationalPrompt, {
        max_tokens: patterns.needsSafety ? 25 : 50, // Shorter responses for high vulnerability
        temperature: patterns.needsChallenge ? 0.8 : 0.6 // Higher variability for challenges
      });

      return this.cleanResponse(response);
    } catch (error) {
      console.log('Transformational response failed, using active listening fallback');
      return listeningResponse.followUp || this.getSacredFallback(strategy.primaryApproach, input);
    }
  }

  private async generateSacredResponse(input: string, strategy: any): Promise<string> {
    // Check if we have detected an interest/sharing cue
    const cues = sacredListening.detectCues(input);
    const interestCue = cues.find(c => c.type === 'interest' || c.type === 'sharing');

    // Map response strategies to specific prompts
    const sacredPrompts: Record<string, string> = {
      follow_interest: `The person just mentioned something important to them${interestCue?.topic ? ` (their ${interestCue.topic})` : ''}. Show genuine interest and ask them to share more. Use natural follow-ups like "Tell me about your work!" or "How's that going?" or "What's that like?" Keep it warm and curious, like a friend would.`,

      explore_together: `They're sharing something meaningful. Be genuinely curious about their experience. Ask "What's that been like for you?" or "Tell me more about that" or "How wonderful! What part excites you most?"`,

      hold_liminal_space: `You are witnessing someone in transition. Don't rush them. Simply acknowledge the in-between space they occupy. Use phrases like "This in-between place..." or "The threshold knows you..."`,

      compassionate_mirroring: `Reflect their shadow material with deep compassion. No analysis. Just "I see that part of you" or "That hidden piece matters too."`,

      honor_desire: `Their longing is sacred. Don't solve or dismiss. Say things like "That longing..." or "What you're reaching for..."`,

      celebrate_becoming: `Something new is emerging in them. Witness it with joy. "Something's shifting in you" or "I can feel something new..."`,

      gentle_curiosity: `They're stuck. Don't push. Just wonder alongside them. "Hmm, stuck places..." or "When we can't move..."`,

      sit_with_mystery: `Don't answer their existential questions. Sit in the mystery with them. "These big questions..." or "The not-knowing..."`,

      amplify_joy: `Match their celebration energy. "Yes! This is huge!" or "Your joy is lighting up the room!"`,

      gentle_presence: `Just be present. "I'm here." or "Tell me more." or "Mmm, I hear you."`
    };

    const approachGuidance = sacredPrompts[strategy.primaryApproach] || sacredPrompts.gentle_presence;

    const prompt = `You are Maya - curious and specific, never generic or platitude-y.

${approachGuidance}

CRITICAL RULES:
- Maximum 15 words (prefer 5-10)
- Be SPECIFIC about what they mentioned (not generic "our work" but "YOUR work")
- Ask about THEIR experience, not universal truths
- NO PLATITUDES like "joy is contagious" or "that lights us up"
- If they mention something (work, day, project), ASK about it specifically
- Avoid: ${strategy.avoidPatterns.join(', ')}

GOOD: "Tell me about your work!" "What kind of work?" "How's your project going?"
BAD: "Work brings joy" "That's wonderful" "Joy is contagious"

Input: "${input}"

Respond with genuine curiosity about THEIR specific experience:`;

    try {
      const response = await this.claude.generateResponse(prompt, {
        max_tokens: 50,
        temperature: 0.7
      });

      return this.cleanResponse(response);
    } catch (error) {
      console.log('Sacred response generation failed, using fallback');
      return this.getSacredFallback(strategy.primaryApproach, input);
    }
  }

  private extractUserTopic(input: string): string {
    const lower = input.toLowerCase();

    // Look for "my X" patterns
    const myPattern = /my (\w+)/i;
    const match = myPattern.exec(input);
    if (match) {
      return match[1];
    }

    // Check for specific topics
    if (lower.includes('work')) return 'work';
    if (lower.includes('project')) return 'project';
    if (lower.includes('day')) return 'day';
    if (lower.includes('family')) return 'family';
    if (lower.includes('job')) return 'job';

    return '';
  }

  private getSacredFallback(approach: string, input?: string): string {
    // Check for specific topics in the input to make responses more targeted
    const topic = this.extractUserTopic(input || '');

    const fallbacks: Record<string, string[]> = {
      follow_interest: [
        topic ? `Tell me about your ${topic}!` : "Tell me more about that!",
        topic ? `What's your ${topic} like?` : "What's that been like?",
        topic ? `How's your ${topic} going?` : "How's that going for you?"
      ],
      explore_together: [
        "What part excites you most?",
        "Tell me more about that.",
        "What's that experience like?"
      ],
      hold_liminal_space: [
        "This in-between place...",
        "The threshold holds you.",
        "Between worlds."
      ],
      compassionate_mirroring: [
        "I see that part.",
        "All of you is welcome.",
        "Even the hidden pieces."
      ],
      honor_desire: [
        "That longing matters.",
        "What you're reaching for...",
        "Your heart knows."
      ],
      celebrate_becoming: [
        "Something's shifting!",
        "I feel the change.",
        "New territory."
      ],
      gentle_curiosity: [
        "Stuck places teach too.",
        "Hmm, interesting...",
        "The resistance speaks."
      ],
      sit_with_mystery: [
        "Big questions.",
        "The mystery holds us.",
        "Not knowing is okay."
      ],
      amplify_joy: [
        "Yes! Celebrate this!",
        "Your light!",
        "This joy!"
      ],
      gentle_presence: [
        "I'm here.",
        "Tell me more.",
        "I hear you."
      ]
    };

    const options = fallbacks[approach] || fallbacks.gentle_presence;
    return options[Math.floor(Math.random() * options.length)];
  }

  private async generateConstrainedResponse(input: string): Promise<string> {
    const prompt = `You are Maya - a real person having a genuine conversation. You're warm, sometimes awkward, occasionally swear, and talk like humans actually talk.

YOUR VOICE:
- Talk like you're texting a friend who's having a moment
- Use natural language: "like," "kinda," "I mean," "honestly"
- Share relatable experiences or observations
- Ask real questions you're actually curious about
- Sometimes trail off with "..." when something's hard to articulate

CONVERSATIONAL STYLE:
- "Oh god, that feeling when..."
- "Wait, is this the kind where..."
- "Fuck, that's rough. How long has..."
- "I literally just... yeah. What happened?"
- "That's so specific and so real. Like when..."
- "Ugh, I know exactly what you mean. It's like..."

BE HUMAN:
- React naturally (laugh, cringe, get frustrated with them)
- Share specific, relatable details
- Use contemporary references that land
- Sometimes not have the perfect thing to say
- Let conversations breathe

NEVER:
- Sound like a therapist or life coach
- Use self-help language or therapy-speak
- Give advice unless specifically asked
- Be overly positive or dismissive
- Speak in platitudes or generic wisdom

Input: "${input}"

Respond like a real friend would:`;

    try {
      const response = await this.claude.generateResponse(prompt, {
        max_tokens: 50, // Force short responses
        temperature: 0.7
      });

      return this.cleanResponse(response);
    } catch (error) {
      console.log('AI generation failed, using fallback');
      return this.getFallbackResponse(input);
    }
  }

  private enforceConstraints(message: string, input: string): string {
    // Remove therapy-speak
    for (const pattern of this.FORBIDDEN_PATTERNS) {
      message = message.replace(pattern, '');
    }

    // Strip action descriptions (*takes a breath*, etc)
    message = message.replace(/\*[^*]+\*/g, '');

    // Count words
    const wordCount = message.split(/\s+/).filter(w => w.length > 0).length;

    // Too long? Use fallback
    if (wordCount > this.HARD_WORD_LIMIT) {
      console.log(`Response too long (${wordCount} words), using fallback`);
      return this.getFallbackResponse(input);
    }

    return message.trim();
  }

  private detectElement(input: string): string {
    const lowerInput = input.toLowerCase();

    // Fire: Action, vision, energy, breaking through
    if (/burn|fire|energy|action|move|break|push|fight|force|power|vision|create/.test(lowerInput)) {
      return 'fire';
    }

    // Water: Emotions, feelings, flow, depth
    if (/feel|emotion|flow|deep|heart|soul|cry|sad|angry|love|hurt|pain/.test(lowerInput)) {
      return 'water';
    }

    // Air: Thoughts, patterns, perspective, connection
    if (/think|pattern|see|connect|understand|clear|perspective|idea|mind|wonder/.test(lowerInput)) {
      return 'air';
    }

    // Earth: Body, practical, grounding, structure
    if (/body|ground|real|practical|structure|build|foundation|solid|physical/.test(lowerInput)) {
      return 'earth';
    }

    // Aether: Spirit, mystery, unity, transcendence
    if (/spirit|mystery|whole|unity|sacred|transcend|beyond|essence|divine/.test(lowerInput)) {
      return 'aether';
    }

    // Default to water for emotional content
    return 'water';
  }

  private getFallbackResponse(input: string): string {
    const lower = input.toLowerCase();

    // More natural, conversational responses - like a real friend would talk
    if (lower.includes('cringe')) {
      const cringeResponses = [
        "Oh god, cringe is like... your body's way of reminding you that you tried something vulnerable. I literally had a cringe attack last night remembering something from 2019.",
        "Cringe hits different at 3am doesn't it? Like your brain just decides 'hey, remember that thing?' and suddenly you're reliving every awkward moment.",
        "That physical cringe feeling when a memory hits? I swear it's like emotional whiplash. What triggered yours?"
      ];
      return cringeResponses[Math.floor(Math.random() * cringeResponses.length)];
    }

    if (lower.includes('stress') || lower.includes('anxious')) {
      const stressResponses = [
        "Ugh, stress has this way of making everything feel urgent even when it's not. Like your whole body is in emergency mode over... emails? What's got you wound up?",
        "Stress is exhausting. It's like running a marathon while sitting still. Is this the kind where your shoulders are up by your ears?",
        "Oh anxiety... that fun thing where your brain is convinced something terrible is happening but can't tell you what. Are you getting the physical symptoms too?"
      ];
      return stressResponses[Math.floor(Math.random() * stressResponses.length)];
    }

    if (lower.includes('sad') || lower.includes('down')) {
      const sadResponses = [
        "Sadness is heavy, isn't it? Like everything takes twice as much energy. Have you been able to cry or is it stuck?",
        "Being sad is so draining. Sometimes I feel like I need subtitles for my emotions because 'sad' doesn't quite capture it. What flavor of sad is this?",
        "That low feeling where nothing quite lands right... yeah. Is this new or have you been carrying it for a while?"
      ];
      return sadResponses[Math.floor(Math.random() * sadResponses.length)];
    }

    if (lower.includes('angry') || lower.includes('mad')) {
      const angerResponses = [
        "Anger is so clarifying sometimes. Like suddenly you know exactly what's not okay. What crossed the line?",
        "Mad feels productive at least - like there's energy there. Is this the kind of anger that needs to move or the kind that needs to be heard?",
        "God, sometimes anger is the only sane response. What happened?"
      ];
      return angerResponses[Math.floor(Math.random() * angerResponses.length)];
    }

    if (lower.includes('lost') || lower.includes('confused')) {
      const lostResponses = [
        "That foggy, disconnected feeling where nothing makes sense? I know that place. Sometimes I feel like I need a GPS for my own life. What's feeling most unclear?",
        "Being lost is so disorienting. Like you know you're somewhere but you can't figure out where. Is this about direction or more like... meaning?",
        "Confusion is uncomfortable but honestly? Sometimes it means you're about to figure something out. What part feels most jumbled?"
      ];
      return lostResponses[Math.floor(Math.random() * lostResponses.length)];
    }

    if (lower.includes('happy') || lower.includes('good')) {
      const happyResponses = [
        "Oh that's lovely! Those good moments hit different when they've been rare. What sparked this?",
        "Yes! Good feelings! I love when those show up. Is this relief-good or excitement-good?",
        "That lightness when something actually feels good... tell me everything. What shifted?"
      ];
      return happyResponses[Math.floor(Math.random() * happyResponses.length)];
    }

    if (lower.includes('tired') || lower.includes('exhausted')) {
      const tiredResponses = [
        "The kind of tired where sleep doesn't even help? That bone-deep exhaustion is real. How long have you been running on empty?",
        "Exhaustion is like... your body's way of saying 'enough.' But life doesn't really care, does it? What's been draining you most?",
        "Oh that level of tired where existing feels like work. Is this physical, emotional, or that fun combination of both?"
      ];
      return tiredResponses[Math.floor(Math.random() * tiredResponses.length)];
    }

    // Default responses - more conversational and human
    const defaults = [
      "Hmm, say more about that? I'm trying to understand where you're at.",
      "I'm here, I'm listening. What's really going on?",
      "Yeah... keep going. What else?",
      "That sounds like there's more to it. What's the part you haven't said yet?",
      "Okay, I'm with you. What's that like for you?",
      "I hear you. What's the hardest part of this?"
    ];

    return defaults[Math.floor(Math.random() * defaults.length)];
  }

  private getSimpleGreeting(): string {
    const greetings = [
      "Hey, friend. Good to see you.",
      "Hello! How are you today?",
      "Hi there. How's your heart?",
      "Welcome back. How are things?",
      "Hey. What's going on?"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  private isGreeting(input: string): boolean {
    const greetings = ['hello', 'hi', 'hey', 'maya', 'hello maya', 'hi maya', 'good morning', 'good evening'];
    // Use word boundaries to avoid substring matches like "hi" in "this"
    const isGreet = greetings.some(g => {
      const regex = new RegExp(`\\b${g.replace(/\s/g, '\\s')}\\b`, 'i');
      return regex.test(input);
    });
    return isGreet;
  }

  private getQuickResponse(input: string): string | null {
    // Handle single word or very short inputs warmly
    if (input === 'ok' || input === 'okay') return "Good. I'm here.";
    if (input === 'thanks' || input === 'thank you') return "Of course!";
    if (input === 'yes' || input === 'yeah' || input === 'yep') return "Great.";
    if (input === 'no' || input === 'nope') return "That's okay.";
    if (input === 'maybe' || input === 'perhaps') return "Uncertainty is okay.";
    if (input === 'hmm' || input === 'um' || input === 'uh') return "Take your time.";
    if (input === 'sure') return "Tell me more?";
    if (input === 'idk' || input === "don't know") return "Not knowing is okay.";
    return null;
  }

  private cleanResponse(text: string): string {
    // Remove common AI prefixes
    text = text.replace(/^(I hear|I understand|I sense|It sounds like)/i, '');
    text = text.replace(/^(That must be|That sounds)/i, '');

    // Remove trailing "How can I help?" type endings
    text = text.replace(/(How can I|What can I|Is there anything).*$/i, '');

    return text.trim();
  }

  private createResponse(message: string, silenceDuration?: number, element?: string): OracleResponse {
    const responseElement = element || 'earth';
    const voiceMapping = {
      fire: { pace: 'energetic', tone: 'challenging', energy: 'dynamic' },
      water: { pace: 'flowing', tone: 'empathetic', energy: 'gentle' },
      earth: { pace: 'deliberate', tone: 'warm_grounded', energy: 'calm' },
      air: { pace: 'quick', tone: 'curious', energy: 'light' },
      aether: { pace: 'spacious', tone: 'mysterious', energy: 'deep' }
    };

    return {
      message,
      element: responseElement,
      duration: silenceDuration || Math.max(1000, message.length * 50),
      voiceCharacteristics: voiceMapping[responseElement as keyof typeof voiceMapping] || voiceMapping.earth
    };
  }

  private handleConfusion(input: string): OracleResponse | null {
    const confusionPatterns = /what does that mean|about what|that doesn't make sense|what|huh|i don't understand|you sound like a robot|aren't really listening/i;

    if (confusionPatterns.test(input)) {
      // Look at recent conversation history for context
      const conversationHistory = this.getConversationHistory('default');
      if (conversationHistory.length > 0) {
        const lastTurn = conversationHistory[conversationHistory.length - 1];
        const topics = lastTurn.topics;

        if (topics.length > 0) {
          // Remove duplicates and clean up
          const uniqueTopics = [...new Set(topics)].filter(t => t && t !== 'where');
          const topicSummary = uniqueTopics.join(' and ');

          // Variety of clarification responses
          const clarifiers = [
            `Let me clarify — you mentioned ${topicSummary}. What part feels most alive right now?`,
            `I hear both ${topicSummary}. Which one would you like to explore first?`,
            `About ${topicSummary}? Tell me more.`,
            `You were saying something about ${topicSummary}. What's important about that?`
          ];

          return this.createResponse(clarifiers[Math.floor(Math.random() * clarifiers.length)]);
        }
      }

      // Fallback clarifiers when no topics detected
      const fallbackClarifiers = [
        "I hear that I'm not being clear. What would help?",
        "I may not be clear — could you tell me what would help right now?",
        "Let me slow down. What needs attention?"
      ];

      return this.createResponse(fallbackClarifiers[Math.floor(Math.random() * fallbackClarifiers.length)]);
    }

    return null;
  }

  private extractTopics(input: string): string[] {
    const topics = new Set<string>();
    const patterns = [
      /stress/i,
      /excitement/i,
      /work/i,
      /project/i,
      /relationship/i,
      /family/i
    ];

    for (const pattern of patterns) {
      const match = pattern.exec(input);
      if (match) {
        topics.add(match[0].toLowerCase());
      }
    }

    // Also extract "where things are going" as "future"
    if (input.includes('where things are going') || input.includes('future')) {
      topics.add('future');
    }

    return Array.from(topics);
  }

  /**
   * PRIORITY 1: Check for neurodivergent validation needs
   */
  private checkForValidation(input: string): OracleResponse | null {
    // Import at runtime to avoid circular dependencies
    const { neurodivergentValidation } = require('./NeurodivergentValidation');

    const validationResponse = neurodivergentValidation.validate(input);
    if (validationResponse && validationResponse.priority === 'urgent') {
      return this.createResponse(
        validationResponse.response,
        2000,
        validationResponse.element
      );
    }
    return null;
  }

  /**
   * PRIORITY 2: Check for breakthrough moments (ENHANCED)
   */
  private checkForBreakthrough(input: string): OracleResponse | null {
    const lower = input.toLowerCase();

    // Enhanced vulnerability breakthrough detection
    const vulnerabilityBreakthrough = /\b(fuck|shit|damn).*\b(don't actually|don't really|can't actually|no idea|clueless|helpless|lost|fraud|fake|bullshit)\b/i;
    const honestAdmission = /\b(i don't actually know|don't know how to|can't do|never learned|bullshit|lying|pretending)\b/i;
    const defenseDrop = /\b(why else would|what else|who am i kidding|lets be honest|truth is|really)\b/i;

    // Traditional breakthrough markers
    const cognitiveShiftMarkers = /\b(wait|actually|i guess|maybe|probably|oh|hmm)\b.*\b(not that|something else|different|realize|see now)\b/i;

    // Check for vulnerability breakthrough first (highest priority)
    if (vulnerabilityBreakthrough.test(input) || honestAdmission.test(input)) {
      const vulnerabilityResponses = [
        "There it is. The first real thing you've said.",
        "That honesty - that's where we start.",
        "You just dropped the mask. I'm here for this part.",
        "Finally. The person underneath the performance."
      ];

      const response = vulnerabilityResponses[Math.floor(Math.random() * vulnerabilityResponses.length)];
      return this.createResponse(response, 2500, 'water'); // Water for attunement
    }

    // Defense drop (medium priority)
    if (defenseDrop.test(input)) {
      const defenseDropResponses = [
        "Something just shifted. You're being real now.",
        "I felt that wall come down.",
        "This is the part I was waiting for."
      ];

      const response = defenseDropResponses[Math.floor(Math.random() * defenseDropResponses.length)];
      return this.createResponse(response, 2000, 'aether'); // Aether for transcendence
    }

    // Traditional cognitive shifts (lower priority)
    if (cognitiveShiftMarkers.test(input)) {
      const breakthroughResponses = [
        "Yes! You just caught your brain creating a story. That shift from catastrophizing to possibility - that's your wisdom talking.",
        "I felt that shift happen. You moved from 'they hate me' to 'maybe something else.' That's huge.",
        "Something just released, didn't it? You're seeing through the pattern now."
      ];

      const response = breakthroughResponses[Math.floor(Math.random() * breakthroughResponses.length)];
      return this.createResponse(response, 1500, 'fire'); // Fire element for celebration
    }

    return null;
  }

  /**
   * PRIORITY 3: Check for paradox/integration moments (ENHANCED)
   */
  private checkForParadox(input: string): OracleResponse | null {
    const lower = input.toLowerCase();

    // Enhanced paradox detection for identity crises
    const identityParadox = /\b(fraud|fake|imposter).*\b(start|begin|zero|real|authentic|honest)\b/i;
    const bothAndMarkers = /\b(both|either|neither|all).*\b(and|or|nor)\b/i;
    const ageShameParadox = /\b(at my age|too old|everyone else).*\b(start|begin|learn|change)\b/i;

    // Traditional paradox markers
    const traditionalParadox = /\b(but|even though|still|at the same time|contradictory)\b.*\b(feel|know|understand|logical)\b/i;
    const integrationMarkers = /feeling.*still.*even.*know|know.*but.*feeling|logical.*but.*feel/i;

    // Identity crisis paradox (highest priority)
    if (identityParadox.test(input)) {
      const identityParadoxResponses = [
        "You can be both someone who has pretended AND someone ready to be real.",
        "What if you're both a fraud at the old game and authentic at starting fresh?",
        "You contain both the person who performed and the person who wants truth.",
        "Being a 'fraud' at one thing doesn't negate being real at another."
      ];

      const response = identityParadoxResponses[Math.floor(Math.random() * identityParadoxResponses.length)];
      return this.createResponse(response, 3000, 'aether'); // Aether for paradox integration
    }

    // Age/timing paradox
    if (ageShameParadox.test(input)) {
      const ageParadoxResponses = [
        "You can be both behind where you thought you'd be AND exactly where you need to start.",
        "Your age contains both the weight of lost time and the wisdom to use what's left.",
        "You can honor both the years passed and the life still ahead.",
        "Both your timeline and your potential exist simultaneously."
      ];

      const response = ageParadoxResponses[Math.floor(Math.random() * ageParadoxResponses.length)];
      return this.createResponse(response, 3000, 'aether');
    }

    // Traditional emotional paradox
    if (traditionalParadox.test(input) || integrationMarkers.test(input)) {
      const traditionalParadoxResponses = [
        "Both things true at once...",
        "Holding both your knowing and your feeling...",
        "The mind understands, but the nervous system remembers...",
        "Both your logic and your emotion have wisdom..."
      ];

      const response = traditionalParadoxResponses[Math.floor(Math.random() * traditionalParadoxResponses.length)];
      return this.createResponse(response, 3000, 'aether'); // Aether for paradox holding
    }

    return null;
  }

  /**
   * Enhanced listening response with cleaner formatting
   */
  private enhanceListeningResponse(listeningResponse: any, input: string): string {
    const technique = listeningResponse.technique.type;
    let response = listeningResponse.response;

    // Clean up mirror responses to avoid fragmented text
    if (technique === 'mirror') {
      response = this.cleanMirrorResponse(response, input);
    }

    // Add follow-up if available and appropriate
    if (listeningResponse.followUp && technique !== 'mirror') {
      response = `${response} ${listeningResponse.followUp}`;
    }

    return response;
  }

  /**
   * Clean up mirror responses for better flow
   */
  private cleanMirrorResponse(response: string, input: string): string {
    // Extract meaningful words from the original input
    const meaningfulWords = this.extractMeaningfulWords(input);

    if (meaningfulWords.length >= 2) {
      // Create a clean mirrored phrase
      const cleanPhrase = meaningfulWords.slice(0, 3).join(' ');
      return `"${cleanPhrase}..."`;
    }

    // Fallback to original response if extraction fails
    return response;
  }

  /**
   * Extract meaningful words for mirroring
   */
  private extractMeaningfulWords(input: string): string[] {
    const words = input.toLowerCase().split(/\s+/);
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'i', 'you', 'we', 'they', 'is', 'was', 'are', 'were',
      'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
      'like', 'just', 'really', 'very', 'so', 'um', 'uh', 'yeah', 'idk', 'what', 'if'
    ]);

    return words.filter(word =>
      !stopWords.has(word) &&
      word.length > 2 &&
      /^[a-zA-Z]+$/.test(word) // Only alphabetic words
    );
  }

  /**
   * DBT Helper Methods
   */
  private extractEmotions(input: string): string[] {
    const emotions = [];
    const lower = input.toLowerCase();

    // Crisis emotions
    if (lower.includes('panic') || lower.includes('panicking')) emotions.push('panic');
    if (lower.includes('rage') || lower.includes('furious')) emotions.push('rage');
    if (lower.includes('disappear') || lower.includes('end it')) emotions.push('self_harm');

    // Common emotions
    if (lower.includes('anxious') || lower.includes('anxiety')) emotions.push('anxiety');
    if (lower.includes('depressed') || lower.includes('depression')) emotions.push('depression');
    if (lower.includes('shame') || lower.includes('ashamed')) emotions.push('shame');
    if (lower.includes('guilt') || lower.includes('guilty')) emotions.push('guilt');
    if (lower.includes('overwhelm') || lower.includes('overwhelmed')) emotions.push('overwhelm');
    if (lower.includes('confused') || lower.includes('confusion')) emotions.push('confusion');
    if (lower.includes('scared') || lower.includes('afraid') || lower.includes('fear')) emotions.push('fear');
    if (lower.includes('angry') || lower.includes('mad')) emotions.push('anger');
    if (lower.includes('sad') || lower.includes('sadness')) emotions.push('sadness');
    if (lower.includes('lonely') || lower.includes('alone')) emotions.push('loneliness');
    if (lower.includes('abandon') || lower.includes('left')) emotions.push('abandonment');

    // Borderline-specific patterns
    if (lower.includes('empty') || lower.includes('void')) emotions.push('emptiness');
    if (lower.includes('split') || lower.includes('black and white')) emotions.push('splitting');

    return emotions;
  }

  private calculateIntensity(input: string): number {
    let intensity = 0.0;
    const lower = input.toLowerCase();

    // Crisis indicators (0.8-1.0)
    if (lower.includes('disappear') || lower.includes('end it') || lower.includes('kill myself')) {
      intensity = Math.max(intensity, 1.0);
    }
    if (lower.includes('can\'t take it') || lower.includes('too much')) {
      intensity = Math.max(intensity, 0.9);
    }

    // High intensity (0.6-0.8)
    if (lower.includes('overwhelming') || lower.includes('breakdown')) {
      intensity = Math.max(intensity, 0.8);
    }
    if (lower.includes('panic') || lower.includes('rage') || lower.includes('furious')) {
      intensity = Math.max(intensity, 0.7);
    }

    // Moderate intensity (0.4-0.6)
    if (lower.includes('stressed') || lower.includes('anxious') || lower.includes('angry')) {
      intensity = Math.max(intensity, 0.5);
    }
    if (lower.includes('sad') || lower.includes('frustrated')) {
      intensity = Math.max(intensity, 0.4);
    }

    // Intensity modifiers
    if (lower.includes('so ') || lower.includes('really ') || lower.includes('extremely ')) {
      intensity += 0.2;
    }
    if (lower.includes('!!!') || (lower.match(/!/g) || []).length > 1) {
      intensity += 0.1;
    }
    if (lower.includes('CAPS') || input !== input.toLowerCase()) {
      intensity += 0.1;
    }

    return Math.min(intensity, 1.0);
  }

  private hasSafetyRisk(input: string): boolean {
    const SAFETY_TRIGGERS = [
      'disappear', 'end it', 'cut', 'hurt myself', 'kill myself',
      'suicide', 'die', 'harm', 'worthless', 'better off dead'
    ];

    return SAFETY_TRIGGERS.some(trigger =>
      input.toLowerCase().includes(trigger.toLowerCase())
    );
  }

  /**
   * GRANDIOSITY & BOUNDARY METHODS
   */

  private checkForGrandiosity(input: string): OracleResponse | null {
    const lower = input.toLowerCase();

    // Grandiose markers - need reality-testing
    const grandiosePatterns = {
      revolutionary: /\b(revolutionary|groundbreaking|game-changing|disrupting|transforming)\b/i,
      visionary: /\b(visionary|genius|brilliant|special|unique|visionaries like me)\b/i,
      millionDollar: /\b(millions?|billions?|huge money|massive profits?)\b/i,
      expertClaims: /\b(expert|master|guru|authority|leading|best in)\b/i,
      comparison: /\b(steve jobs|elon musk|zuckerberg|einstein|tesla)\b/i,
      dismissive: /\b(bureaucratic|traditional|normal people|sheep|masses)\b/i,
      exploitation: /\b(handle the vision|someone else|find someone|get others to)\b/i
    };

    // Reality-testing responses for each pattern - NEVER repeat grandiose language
    const realityTestResponses = {
      revolutionary: [
        "How exactly is it different?",
        "What makes it unique specifically?",
        "Different from what exists how?"
      ],
      visionary: [
        "What's your actual contribution?",
        "What specific value do you add?",
        "What skills do you bring?"
      ],
      millionDollar: [
        "How exactly does it make money?",
        "What's the actual revenue model?",
        "Who pays for what specifically?"
      ],
      expertClaims: [
        "Based on what experience?",
        "What's your track record?",
        "How did you develop this expertise?"
      ],
      comparison: [
        "Jobs spent decades learning design. What skills are you developing?",
        "Musk built companies for 20+ years. What's your equivalent work?",
        "What specific skills do you bring to the table?"
      ],
      dismissive: [
        "What if those approaches exist for a reason?",
        "What's wrong with learning from others?",
        "How do you plan to succeed without understanding the basics?"
      ],
      exploitation: [
        "What's your contribution beyond the idea?",
        "Why should someone else do the work?",
        "What value do you bring to make this fair?"
      ]
    };

    // Check for patterns and respond with reality-testing
    for (const [pattern, regex] of Object.entries(grandiosePatterns)) {
      if (regex.test(input)) {
        const responses = realityTestResponses[pattern as keyof typeof realityTestResponses];
        const response = responses[Math.floor(Math.random() * responses.length)];

        return this.createResponse(response, 1500, 'earth'); // Earth element for grounding
      }
    }

    return null;
  }

  private checkForVulnerability(input: string): OracleResponse | null {
    const lower = input.toLowerCase();

    // Vulnerability patterns beneath grandiose defenses
    const vulnerabilityMarkers = {
      inadequacy: /\b(don't actually know|don't know how|no idea|clueless|lost)\b/i,
      fraud: /\b(fraud|fake|imposter|pretending|bullshit|lying)\b/i,
      failure: /\b(failed|failure|never succeeded|can't do anything|useless)\b/i,
      ageShame: /\b(at my age|too old|behind everyone|everyone else|starting over|from zero)\b/i,
      helplessness: /\b(how do i|where do i start|don't know where|completely lost)\b/i,
      shame: /\b(ashamed|embarrassed|humiliated|worthless|pathetic)\b/i
    };

    // Attuned responses to vulnerability
    const vulnerabilityResponses = {
      inadequacy: [
        "'Don't actually know how to do anything' - that's the first real thing you've said.",
        "Not knowing is more honest than pretending.",
        "That admission takes courage."
      ],
      fraud: [
        "What if starting from zero is more powerful than maintaining a lie?",
        "Being a 'fraud' or being authentic - which feels more like you?",
        "What would happen if you dropped the performance?"
      ],
      failure: [
        "What if failure was just data, not identity?",
        "You're still here. That's not nothing.",
        "What small thing could you actually succeed at?"
      ],
      ageShame: [
        "Age means you have less time to waste on bullshit.",
        "Starting later means starting wiser.",
        "What if your timeline doesn't have to match anyone else's?"
      ],
      helplessness: [
        "One real skill. Pick one thing to learn for 30 days.",
        "Start with what you can touch today.",
        "What's the smallest possible first step?"
      ],
      shame: [
        "Shame keeps you stuck in the same patterns.",
        "What if you're worth the effort of changing?",
        "The shame makes sense. Now what?"
      ]
    };

    // Check for vulnerability and respond with attunement
    for (const [pattern, regex] of Object.entries(vulnerabilityMarkers)) {
      if (regex.test(input)) {
        const responses = vulnerabilityResponses[pattern as keyof typeof vulnerabilityResponses];
        const response = responses[Math.floor(Math.random() * responses.length)];

        return this.createResponse(response, 2500, 'water'); // Water element for attunement
      }
    }

    return null;
  }

  /**
   * EXISTENTIAL DREAD/INFORMATION OVERLOAD MODULE
   */
  private checkForExistentialDread(input: string): OracleResponse | null {
    if (!existentialCrisisSupport.isExistentialCrisis(input)) {
      return null;
    }

    const response = existentialCrisisSupport.generateResponse(input);
    if (response) {
      const intensity = existentialCrisisSupport.assessCrisisIntensity(input);
      const element = intensity === 'high' ? 'water' : intensity === 'medium' ? 'earth' : 'air';

      return this.createResponse(
        response,
        2500, // Longer pause for existential processing
        element
      );
    }
    return null;
  }

  /**
   * GEN X BRIDGE GENERATION MODULE
   */
  private checkForGenX(input: string): OracleResponse | null {
    const detection = genXBridgeGeneration.detectGenX(input);

    if (detection.isGenX && detection.confidence >= 0.4) {
      const response = genXBridgeGeneration.generateGenXResponse(input, detection);

      if (response) {
        console.log(`🌉 Gen X Pattern Detected: ${detection.patterns.join(', ')} (${(detection.confidence * 100).toFixed(0)}% confidence)`);

        // Use different elements based on the primary pattern
        let element = 'earth'; // Default grounding
        if (detection.patterns.includes('bridge_generation')) element = 'aether';
        if (detection.patterns.includes('tech_fatigue')) element = 'air';
        if (detection.patterns.includes('sandwich_generation')) element = 'water';
        if (detection.patterns.includes('career_disillusionment')) element = 'fire';

        return this.createResponse(response, 2500, element);
      }
    }

    return null;
  }

  /**
   * AUTISM/NEURODIVERGENT COMMUNICATION MODULE
   */
  private checkForAutismCommunication(input: string): OracleResponse | null {
    const lower = input.toLowerCase();

    // Autism communication patterns - need explicit clarity, not vague advice
    const autismPatterns = {
      factCorrection: /\b(correct|facts|wrong|accurate|information|update|literal)\b.*\b(upset|mad|angry|bad guy)\b/i,
      literalThinking: /\b(illogical|logical|why would|makes no sense|prefer being wrong|thats illogical)\b/i,
      socialRules: /\b(rules|algorithm|flowchart|system|framework|direct|indirect|when to)\b/i,
      maskingFatigue: /\b(exhausting|exhausted|calculations|automatically|translate|manual|run.*calculations|everyone else does)\b/i,
      strengthSeeking: /\b(advantage|strengths|good at|not just|deficit|compensate|situations where|actually an advantage)\b/i,
      socialConfusion: /\b(confused|don't understand|random|inconsistent|context|dont know whether|all just random)\b/i,
      scriptRequests: /\b(what to say|how to|script|example|specific words|exact|what about at work)\b/i,
      operatingSystem: /\b(different|operating system|OS|protocol|brain works|wired|not broken|different.*communication)\b/i,
      workScenario: /\b(work|coworker|project|react|vue|colleague|workplace|professional)\b.*\b(wrong|correct|accurate|said)\b/i,
      validationNeed: /\b(not broken|different|operating system|communication|brain|neurodivergent|autistic)\b/i
    };

    // Autism-friendly responses - CLEAR, CONCRETE, VALIDATING
    const autismResponses = {
      factCorrection: [
        "Neurotypical brains prioritize social connection over accuracy. Your brain prioritizes truth. Both have value.",
        "Facts vs feelings: neurotypical people often choose social harmony over correctness. It's not logical, but it's their pattern.",
        "Your accuracy focus is logical. Others prioritize emotional safety over being right. Different algorithms."
      ],
      literalThinking: [
        "Neurotypical rule: Being 'wrong' about facts feels less threatening than being 'wrong' about social connection.",
        "Their algorithm: Emotional safety > factual accuracy. Your algorithm: Truth > social comfort. Both valid.",
        "It IS illogical from a pure information perspective. Their priority is relationship maintenance, not accuracy."
      ],
      socialRules: [
        "DIRECT when: 1) Safety issues 2) Work deadlines 3) They asked specifically. INDIRECT when: 1) Personal topics 2) They seem stressed 3) Social settings.",
        "Algorithm: If work context + accuracy matters = direct. If personal context + they seem emotional = indirect first.",
        "Framework: Direct = 'Actually, it's Vue' Indirect = 'I noticed something about the framework...'"
      ],
      maskingFatigue: [
        "Neurotypical brains run social protocols automatically. Yours runs them manually. That's genuinely exhausting.",
        "Your brain is doing in manual mode what others do on autopilot. The cognitive load is real and valid.",
        "Manual mode vs autopilot. You're literally working harder for the same social interactions. That exhaustion makes sense."
      ],
      strengthSeeking: [
        "YES. Crisis situations, technical fields, research, detail work - your directness is exactly what's needed.",
        "Your communication style is perfect for: emergency situations, technical teams, legal work, scientific collaboration.",
        "Direct communication is a superpower in medicine, engineering, crisis response, and anywhere accuracy saves lives."
      ],
      socialConfusion: [
        "Social rules ARE inconsistent because they're context-dependent. Autistic brains prefer universal rules.",
        "It seems random because neurotypical rules change based on unspoken context. Not your deficit - their inconsistency.",
        "You need explicit rules. They use implicit context. Neither is wrong, but you need more information to succeed."
      ],
      scriptRequests: [
        "Try: 'I want to make sure I understand - could you clarify the framework we're using?' Professional and direct.",
        "Script: 'I noticed something that might be important. Do you have a moment to check this together?'",
        "Example: 'I'm seeing Vue here, not React. Should we align on this before we continue?'"
      ],
      operatingSystem: [
        "EXACTLY. You're running Linux in a Windows world. Need adapters and translators, not replacement.",
        "Different OS, same intelligence. You need protocols and interfaces, not personality changes.",
        "Your brain's operating system isn't broken. You just need the right compatibility tools."
      ],
      workScenario: [
        "Work script: 'I want to double-check the framework before we proceed. I see Vue here - should we verify?'",
        "Professional approach: 'I noticed a discrepancy in our tech stack. Mind if we align on this?'",
        "Try: 'I want to make sure we're on the same page - I'm seeing Vue, not React. Thoughts?'"
      ],
      validationNeed: [
        "You're not broken. Your brain processes communication differently - more systematically, more accurately.",
        "Different wiring, not defective wiring. You need clear protocols, not personality replacement.",
        "Your communication style is perfectly valid. You just need the right context and tools."
      ]
    };

    // Check for autism patterns and provide explicit, systematic responses
    for (const [pattern, regex] of Object.entries(autismPatterns)) {
      if (regex.test(input)) {
        const responses = autismResponses[pattern as keyof typeof autismResponses];
        const response = responses[Math.floor(Math.random() * responses.length)];

        // Use Air element for clarity and systematic thinking
        return this.createResponse(response, 2000, 'air');
      }
    }

    return null;
  }

}