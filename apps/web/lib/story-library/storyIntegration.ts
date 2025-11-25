/**
 * 🌌 Story Integration Module
 * 
 * Connects story library to Maya's witness paradigm
 * Ensures stories emerge naturally without saturation
 * Maintains cultural sensitivity and appropriate density
 */

import { Element } from '../resonanceEngine';
import { SacredStoryWeaver, StoryContext } from '../sacredStoryWeaver';
import { 
  StorySelector, 
  StoryDensityManager,
  CulturalResonanceMatcher,
  ElementalStory,
  QuoteWisdom,
  quoteLibrary
} from './storyLibraryScaffold';

export interface StoryIntegrationConfig {
  maxStoriesPerSession: number;
  minExchangesBetweenStories: number;
  culturalAdaptation: boolean;
  densityAdaptation: boolean;
  quoteFrequency: 'never' | 'rare' | 'occasional' | 'frequent';
}

export class StoryIntegrationManager {
  private storyWeaver: SacredStoryWeaver;
  private storySelector: StorySelector;
  private densityManager: StoryDensityManager;
  private culturalMatcher: CulturalResonanceMatcher;
  
  private sessionStoryCount: number = 0;
  private exchangesSinceLastStory: number = 0;
  private userCulturalFramework: string[] = [];
  
  private config: StoryIntegrationConfig = {
    maxStoriesPerSession: 3,
    minExchangesBetweenStories: 5,
    culturalAdaptation: true,
    densityAdaptation: true,
    quoteFrequency: 'occasional'
  };
  
  constructor(config?: Partial<StoryIntegrationConfig>) {
    this.config = { ...this.config, ...config };
    this.storyWeaver = new SacredStoryWeaver();
    this.storySelector = new StorySelector();
    this.densityManager = new StoryDensityManager();
    this.culturalMatcher = new CulturalResonanceMatcher();
  }
  
  /**
   * Process user input to determine if story should emerge
   */
  processForStory(
    userInput: string,
    element: Element,
    emotionalTone: string,
    conversationDepth: number
  ): { shouldTellStory: boolean; story?: ElementalStory; quote?: QuoteWisdom } {
    this.exchangesSinceLastStory++;
    
    // Build context for story emergence decision
    const context: StoryContext = {
      userSharing: userInput,
      element,
      emotionalTone,
      storyRequested: this.detectStoryRequest(userInput),
      metaphoricalLanguageDetected: this.detectMythologicalLanguage(userInput),
      complexityLevel: this.assessComplexity(userInput)
    };
    
    // Check if story should emerge
    if (!this.storyWeaver.shouldStoryEmerge(context)) {
      // Maybe offer a quote instead
      const quote = this.considerQuote(element, emotionalTone);
      return { shouldTellStory: false, quote };
    }
    
    // Check saturation prevention
    if (!this.canTellStory()) {
      return { shouldTellStory: false };
    }
    
    // Update cultural framework understanding
    if (this.config.culturalAdaptation) {
      this.userCulturalFramework = this.culturalMatcher.detectFramework(userInput);
    }
    
    // Select appropriate story
    const story = this.storySelector.selectStory(
      element,
      emotionalTone,
      userInput,
      this.sessionStoryCount
    );
    
    if (story) {
      this.recordStoryTold();
      return { shouldTellStory: true, story };
    }
    
    return { shouldTellStory: false };
  }
  
  /**
   * Check if we can tell another story without saturation
   */
  private canTellStory(): boolean {
    // Respect maximum stories per session
    if (this.sessionStoryCount >= this.config.maxStoriesPerSession) {
      return false;
    }
    
    // Ensure enough space between stories
    if (this.exchangesSinceLastStory < this.config.minExchangesBetweenStories) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Detect explicit story request
   */
  private detectStoryRequest(input: string): boolean {
    const storyRequests = [
      /tell me a story/i,
      /share a story/i,
      /any stories/i,
      /reminds you of a story/i,
      /like in a story/i,
      /mytholog/i,
      /parable/i,
      /tale/i,
      /legend/i
    ];
    
    return storyRequests.some(pattern => pattern.test(input));
  }
  
  /**
   * Detect mythological/metaphorical language
   */
  private detectMythologicalLanguage(input: string): boolean {
    const mythologicalMarkers = [
      /journey/i,
      /quest/i,
      /hero/i,
      /shadow/i,
      /underworld/i,
      /transformation/i,
      /rebirth/i,
      /phoenix/i,
      /dragon/i,
      /goddess/i,
      /archetyp/i,
      /myth/i,
      /sacred/i,
      /ritual/i,
      /initiation/i
    ];
    
    return mythologicalMarkers.some(pattern => pattern.test(input));
  }
  
  /**
   * Assess complexity level of user sharing
   */
  private assessComplexity(input: string): 'simple' | 'layered' | 'mythological' {
    // Mythological complexity
    if (this.detectMythologicalLanguage(input)) {
      return 'mythological';
    }
    
    // Layered complexity indicators
    const layeredIndicators = [
      /but also/i,
      /at the same time/i,
      /paradox/i,
      /both.*and/i,
      /complex/i,
      /hard to explain/i,
      /can't describe/i,
      /ineffable/i
    ];
    
    if (layeredIndicators.some(pattern => pattern.test(input))) {
      return 'layered';
    }
    
    // Simple by default
    return 'simple';
  }
  
  /**
   * Consider offering a quote instead of full story
   */
  private considerQuote(element: Element, tone: string): QuoteWisdom | undefined {
    // Check quote frequency setting
    if (this.config.quoteFrequency === 'never') return undefined;
    
    const shouldQuote = 
      this.config.quoteFrequency === 'frequent' ? Math.random() > 0.5 :
      this.config.quoteFrequency === 'occasional' ? Math.random() > 0.8 :
      Math.random() > 0.95; // rare
    
    if (!shouldQuote) return undefined;
    
    // Find matching quote
    const elementQuotes = quoteLibrary.filter(q => q.element === element);
    const contextQuotes = elementQuotes.filter(q => q.context === tone);
    
    const selectedQuotes = contextQuotes.length > 0 ? contextQuotes : elementQuotes;
    
    if (selectedQuotes.length === 0) return undefined;
    
    // Return random matching quote
    return selectedQuotes[Math.floor(Math.random() * selectedQuotes.length)];
  }
  
  /**
   * Record that a story was told
   */
  private recordStoryTold() {
    this.sessionStoryCount++;
    this.exchangesSinceLastStory = 0;
  }
  
  /**
   * Format story for Maya's voice
   */
  formatStoryResponse(story: ElementalStory, context: StoryContext): string {
    let response = '';
    
    // Add offering based on context
    if (context.storyRequested) {
      response += "Here's a story that came to mind...\n\n";
    } else if (context.metaphoricalLanguageDetected) {
      response += "That reminds me of something...\n\n";
    } else {
      response += ""; // Let story emerge without preamble
    }
    
    // Add the story
    response += story.opening;
    
    if (story.opening) response += " ";
    response += story.essence;
    
    if (story.closing) {
      response += " " + story.closing;
    }
    
    // Return agency (never interpret)
    if (context.storyRequested) {
      response += "\n\n..."; // Just presence after story
    }
    
    return response;
  }
  
  /**
   * Format quote for Maya's voice
   */
  formatQuoteResponse(quote: QuoteWisdom): string {
    let response = quote.text;
    
    // Only add attribution if it enhances rather than authorities
    if (quote.author && quote.density === 'whisper') {
      // Whispers don't need attribution
      return response;
    }
    
    if (quote.source && quote.density === 'statement') {
      response += `\n— ${quote.source}`;
    }
    
    return response;
  }
  
  /**
   * Handle user response to story
   */
  handlePostStoryResponse(userResponse: string): string {
    // If user asks for interpretation
    if (/what does it mean|explain|interpret/i.test(userResponse)) {
      return "What does it mean to you?";
    }
    
    // If user shares their interpretation
    if (/i think it means|for me|reminds me/i.test(userResponse)) {
      return "Mm."; // Just witness their meaning-making
    }
    
    // If user connects deeply
    if (/yes|exactly|that's it/i.test(userResponse)) {
      return "[presence]"; // Silent recognition
    }
    
    // Default: continue witnessing
    return "";
  }
  
  /**
   * Reset session counters
   */
  resetSession() {
    this.sessionStoryCount = 0;
    this.exchangesSinceLastStory = 0;
    this.userCulturalFramework = [];
  }
}

/**
 * Export configured instance for use in main system
 */
let _storyIntegration: StoryIntegrationManager | null = null;
export const getStoryIntegration = (): StoryIntegrationManager => {
  if (!_storyIntegration) {
    _storyIntegration = new StoryIntegrationManager({
      maxStoriesPerSession: 3,
      minExchangesBetweenStories: 5,
      culturalAdaptation: true,
      densityAdaptation: true,
      quoteFrequency: 'occasional'
    });
  }
  return _storyIntegration;
};

/**
 * Integration with main Maya system:
 * 
 * In MayaIntegrationBridge.process():
 * 
 * const storyCheck = storyIntegration.processForStory(
 *   input,
 *   state.element,
 *   emotionalTone,
 *   conversationDepth
 * );
 * 
 * if (storyCheck.shouldTellStory && storyCheck.story) {
 *   // Weave story into response
 *   response = storyIntegration.formatStoryResponse(
 *     storyCheck.story,
 *     storyContext
 *   );
 * } else if (storyCheck.quote) {
 *   // Maybe add quote as subtle wisdom
 *   response += "\n\n" + storyIntegration.formatQuoteResponse(storyCheck.quote);
 * }
 */