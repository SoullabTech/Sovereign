/**
 * ConnectionEncourager - Implicit Reality Testing Through Relationships
 * 
 * Naturally weaves suggestions for sharing experiences with trusted others.
 * Never frames as "reality checking" but as "enriching understanding."
 * 
 * Core principle: Connection protects without pathologizing isolation.
 */

export interface ConnectionPrompt {
  type: 'share_insight' | 'discuss_pattern' | 'seek_perspective' | 'general_connection';
  prompt: string;
  naturalness: number; // How naturally it fits into conversation
  urgency: 'casual' | 'gentle' | 'important';
}

export interface IsolationAssessment {
  isolationLevel: 'connected' | 'somewhat_isolated' | 'concerning_isolation';
  indicators: string[];
  lastConnectionMention?: Date;
  encouragementNeeded: boolean;
}

export class ConnectionEncourajerService {
  private static instance: ConnectionEncourajerService;
  private userConnectionHistory: Map<string, Date[]> = new Map();
  
  // Natural prompts for different contexts
  private readonly connectionPrompts = {
    share_insight: [
      "This insight might be interesting to discuss with someone you trust",
      "Sometimes patterns become clearer when we describe them aloud to a friend",
      "You might enjoy exploring this idea with someone who knows you well",
      "This kind of understanding often deepens when shared with a thoughtful listener"
    ],
    discuss_pattern: [
      "How would you explain this experience to a good friend?",
      "Sometimes describing patterns to others helps us see what we might have missed",
      "This might be worth mentioning to someone whose perspective you value",
      "A trusted friend might offer an interesting angle on this pattern"
    ],
    seek_perspective: [
      "Who in your life might offer a helpful perspective on this?",
      "Sometimes an outside view can illuminate what we can't see from within",
      "This sounds like something that might benefit from a second opinion",
      "A conversation with someone you trust might add another layer to this understanding"
    ],
    general_connection: [
      "When did you last have a meaningful conversation with someone you care about?",
      "This reminds me - how are your connections with others feeling lately?",
      "Sometimes the most profound insights come through simple conversations with friends",
      "Exploring these ideas is often richer with a thinking partner"
    ]
  };
  
  // Gentle escalation for concerning isolation
  private readonly isolationPrompts = [
    "By the way, exploring these patterns is often more interesting when shared. Who in your life enjoys these kinds of conversations?",
    "These insights might resonate with someone you trust. Sometimes discussing experiences helps them settle and integrate.",
    "Have you mentioned any of these experiences to friends or family? Outside perspectives can be surprisingly helpful.",
    "When we're exploring deep territory, it can be grounding to stay connected with people who care about us."
  ];
  
  static getInstance(): ConnectionEncourajerService {
    if (!ConnectionEncourajerService.instance) {
      ConnectionEncourajerService.instance = new ConnectionEncourajerService();
    }
    return ConnectionEncourajerService.instance;
  }
  
  /**
   * Analyze input for connection patterns and isolation indicators
   */
  async assessConnectionNeeds(
    userId: string, 
    userInput: string, 
    conversationContext?: any
  ): Promise<IsolationAssessment> {
    // Track mentions of other people
    await this.trackConnectionMentions(userId, userInput);
    
    const isolationLevel = this.assessIsolationLevel(userId, userInput);
    const indicators = this.identifyIsolationIndicators(userInput);
    
    return {
      isolationLevel,
      indicators,
      lastConnectionMention: this.getLastConnectionMention(userId),
      encouragementNeeded: isolationLevel !== 'connected'
    };
  }
  
  /**
   * Generate appropriate connection prompt based on context
   */
  async generateConnectionPrompt(
    assessment: IsolationAssessment,
    conversationTopic: string,
    urgency?: 'casual' | 'gentle' | 'important'
  ): Promise<ConnectionPrompt | null> {
    // Don't prompt if recently connected
    if (assessment.isolationLevel === 'connected' && !urgency) {
      return null;
    }
    
    // Determine prompt type based on conversation content
    const promptType = this.determinePromptType(conversationTopic, assessment);
    
    // Select appropriate prompt
    const prompts = this.connectionPrompts[promptType];
    const selectedPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    
    const naturalness = this.assessPromptnaturalness(conversationTopic, promptType);
    const finalUrgency = urgency || this.determineUrgency(assessment);
    
    return {
      type: promptType,
      prompt: selectedPrompt,
      naturalness,
      urgency: finalUrgency
    };
  }
  
  /**
   * Generate escalated prompt for concerning isolation
   */
  async generateIsolationPrompt(daysSinceConnection: number): Promise<string> {
    if (daysSinceConnection < 3) {
      return this.isolationPrompts[0];
    } else if (daysSinceConnection < 7) {
      return this.isolationPrompts[1];
    } else if (daysSinceConnection < 14) {
      return this.isolationPrompts[2];
    } else {
      return this.isolationPrompts[3];
    }
  }
  
  /**
   * Suggest connection activities based on user's interests/context
   */
  async suggestConnectionActivities(
    userContext: any,
    preferenceForDepth: 'light' | 'moderate' | 'deep'
  ): Promise<string[]> {
    const suggestions: string[] = [];
    
    if (preferenceForDepth === 'light') {
      suggestions.push(
        "Maybe grab coffee with a friend who makes you laugh",
        "A simple text check-in with someone you haven't heard from in a while",
        "Even sharing this experience with a pet or journal can help clarify what's emerging"
      );
    } else if (preferenceForDepth === 'moderate') {
      suggestions.push(
        "Consider reaching out to someone who enjoys thoughtful conversations",
        "This might be worth mentioning to a friend who appreciates deeper topics",
        "Sometimes a phone call with someone who listens well can provide helpful perspective"
      );
    } else { // deep
      suggestions.push(
        "You might benefit from discussing this with a mentor, therapist, or spiritual director",
        "Consider sharing with someone who has navigated similar territory",
        "A conversation with someone experienced in consciousness exploration might be valuable"
      );
    }
    
    return suggestions;
  }
  
  /**
   * Check if user has mentioned trusted people to draw from
   */
  async identifyTrustedPeople(userId: string, conversationHistory: string[]): Promise<string[]> {
    const trustedPeoplePatterns = [
      /(?:my|a)\s+(friend|therapist|mentor|partner|spouse|colleague|advisor)/gi,
      /(?:talked to|spoke with|discussed with)\s+(\w+)/gi,
      /(\w+)\s+(?:said|told me|mentioned|suggested)/gi
    ];
    
    const mentionedPeople: Set<string> = new Set();
    
    conversationHistory.forEach(text => {
      trustedPeoplePatterns.forEach(pattern => {
        const matches = text.match(pattern);
        if (matches) {
          matches.forEach(match => {
            const person = match.toLowerCase().trim();
            if (person && person.length > 2) {
              mentionedPeople.add(person);
            }
          });
        }
      });
    });
    
    return Array.from(mentionedPeople);
  }
  
  // Private helper methods
  
  private async trackConnectionMentions(userId: string, input: string): Promise<void> {
    const connectionKeywords = [
      'friend', 'family', 'partner', 'spouse', 'colleague', 'talked to',
      'conversation', 'discussed', 'shared with', 'told', 'mentioned to',
      'therapist', 'counselor', 'mentor', 'advisor'
    ];
    
    const hasConnectionMention = connectionKeywords.some(keyword => 
      input.toLowerCase().includes(keyword)
    );
    
    if (hasConnectionMention) {
      let history = this.userConnectionHistory.get(userId) || [];
      history.push(new Date());
      
      // Keep only recent mentions (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      history = history.filter(date => date > thirtyDaysAgo);
      
      this.userConnectionHistory.set(userId, history);
    }
  }
  
  private assessIsolationLevel(userId: string, currentInput: string): 'connected' | 'somewhat_isolated' | 'concerning_isolation' {
    const connectionHistory = this.userConnectionHistory.get(userId) || [];
    const recentConnections = connectionHistory.filter(
      date => date > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
    
    // Check for isolation indicators in current input
    const isolationKeywords = [
      'alone', 'lonely', 'no one understands', 'by myself',
      'isolated', 'withdrawn', 'nobody', 'on my own'
    ];
    
    const hasIsolationMention = isolationKeywords.some(keyword =>
      currentInput.toLowerCase().includes(keyword)
    );
    
    if (recentConnections.length === 0 && hasIsolationMention) {
      return 'concerning_isolation';
    } else if (recentConnections.length === 0) {
      return 'somewhat_isolated';
    } else {
      return 'connected';
    }
  }
  
  private identifyIsolationIndicators(input: string): string[] {
    const indicators: string[] = [];
    
    if (input.includes('no one understands') || input.includes('nobody gets it')) {
      indicators.push('feeling uniquely understood');
    }
    
    if (input.includes('alone in this') || input.includes('only I')) {
      indicators.push('sense of solitary experience');
    }
    
    if (input.includes('can\'t tell anyone') || input.includes('wouldn\'t understand')) {
      indicators.push('reluctance to share');
    }
    
    if (input.includes('avoid') || input.includes('withdraw')) {
      indicators.push('avoidance patterns');
    }
    
    return indicators;
  }
  
  private getLastConnectionMention(userId: string): Date | undefined {
    const history = this.userConnectionHistory.get(userId);
    return history && history.length > 0 ? history[history.length - 1] : undefined;
  }
  
  private determinePromptType(
    conversationTopic: string, 
    assessment: IsolationAssessment
  ): keyof typeof this.connectionPrompts {
    if (conversationTopic.includes('insight') || conversationTopic.includes('understanding')) {
      return 'share_insight';
    }
    
    if (conversationTopic.includes('pattern') || conversationTopic.includes('experience')) {
      return 'discuss_pattern';
    }
    
    if (assessment.isolationLevel === 'concerning_isolation') {
      return 'general_connection';
    }
    
    return 'seek_perspective';
  }
  
  private assessPromptnaturalness(topic: string, promptType: keyof typeof this.connectionPrompts): number {
    // Higher scores for more natural fits
    if (topic.includes('insight') && promptType === 'share_insight') return 0.9;
    if (topic.includes('pattern') && promptType === 'discuss_pattern') return 0.9;
    if (topic.includes('confusion') && promptType === 'seek_perspective') return 0.8;
    
    return 0.6; // Default naturalness
  }
  
  private determineUrgency(assessment: IsolationAssessment): 'casual' | 'gentle' | 'important' {
    if (assessment.isolationLevel === 'concerning_isolation') {
      return 'important';
    } else if (assessment.isolationLevel === 'somewhat_isolated') {
      return 'gentle';
    } else {
      return 'casual';
    }
  }
  
  /**
   * Format connection prompt for natural integration into response
   */
  formatConnectionPrompt(prompt: ConnectionPrompt, context: string): string {
    if (prompt.naturalness > 0.8) {
      return prompt.prompt; // Use as-is for very natural fits
    } else if (prompt.urgency === 'important') {
      return `💭 ${prompt.prompt}`;
    } else {
      return `*${prompt.prompt}*`;
    }
  }
  
  /**
   * Check if it's appropriate timing for connection prompt
   */
  shouldPromptNow(
    assessment: IsolationAssessment,
    conversationLength: number,
    lastPromptInteraction?: number
  ): boolean {
    // Don't prompt too frequently
    if (lastPromptInteraction && (conversationLength - lastPromptInteraction) < 3) {
      return false;
    }
    
    // Always prompt for concerning isolation (but not every message)
    if (assessment.isolationLevel === 'concerning_isolation') {
      return !lastPromptInteraction || (conversationLength - lastPromptInteraction) >= 2;
    }
    
    // Occasional prompts for mild isolation
    if (assessment.isolationLevel === 'somewhat_isolated') {
      return Math.random() > 0.7; // 30% chance
    }
    
    // Rare prompts for connected users
    return Math.random() > 0.9; // 10% chance
  }
}