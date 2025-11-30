/**
 * Internal Complexity Service - Safe Alternative to Daimonic Systems
 * 
 * Recognizes internal psychological patterns and offers multiple perspectives
 * while maintaining clear reality boundaries and internal attribution.
 */

import { logger } from "../utils/logger";
import { 
  InternalComplexityDetected, 
  InternalAspect, 
  ElementalQualities,
  InternalComplexityNarrative 
} from '../types/internalComplexity';

export class InternalComplexityService {
  private elementalQualities: ElementalQualities;

  constructor() {
    this.elementalQualities = {
      passion: {
        quality: "passionate, transformative energy",
        when_strong: "You might feel driven, creative, restless",
        when_blocked: "You might feel frustrated, stuck, or angry",
        practice: "Channel this energy into one meaningful action",
        reality_check: "This is your internal energy, not an external force"
      },
      flow: {
        quality: "flowing, adaptive, emotional energy",
        when_strong: "You might feel intuitive, connected, emotional",
        when_blocked: "You might feel overwhelmed, disconnected, or numb",
        practice: "Find one way to honor your emotional truth today",
        reality_check: "These are your feelings and intuitions"
      },
      stability: {
        quality: "grounding, practical, embodied energy",
        when_strong: "You might feel centered, practical, reliable",
        when_blocked: "You might feel scattered, impractical, or ungrounded",
        practice: "Take three deep breaths and feel your feet on the ground",
        reality_check: "This is your capacity for groundedness"
      },
      clarity: {
        quality: "clear-thinking, analytical, communicative energy",
        when_strong: "You might feel articulate, logical, communicative",
        when_blocked: "You might feel confused, scattered, or inarticulate",
        practice: "Write down three clear thoughts about your situation",
        reality_check: "This is your thinking and communication ability"
      },
      integration: {
        quality: "synthesizing, wisdom-holding, transformative energy",
        when_strong: "You might feel wise, balanced, transformative",
        when_blocked: "You might feel fragmented, unintegrated, or lost",
        practice: "Ask yourself: what would integration look like here?",
        reality_check: "This is your capacity for wisdom and integration"
      }
    };
  }

  /**
   * Recognize internal complexity patterns without external attribution
   */
  async recognizeInternalPatterns(
    userInput: string, 
    context: any
  ): Promise<InternalAspect> {
    const patterns = await this.analyzeInternalPatterns(userInput);
    const tensions = this.identifyInternalTensions(userInput, patterns);
    
    return {
      experiencePattern: this.describeExperience(patterns),
      internalTension: this.articulateTension(tensions),
      multipleViewpoints: this.offerMultiplePerspectives(patterns, context),
      practicalGrounding: this.suggestGroundingStep(patterns),
      humanConnection: this.encourageConnection(patterns)
    };
  }

  /**
   * Generate safe narrative with multiple perspectives and reality anchoring
   */
  async generateSafeNarrative(
    aspect: InternalAspect,
    context: any,
    complexityLevel: number
  ): Promise<InternalComplexityNarrative> {
    return {
      opening: this.createSafeOpening(aspect),
      perspectives: this.generateMultiplePerspectives(aspect, complexityLevel),
      realityAnchor: this.createRealityAnchor(),
      connectionPrompt: this.createConnectionPrompt(aspect),
      practiceOffers: this.offerGroundingPractices(aspect, complexityLevel)
    };
  }

  /**
   * Analyze patterns without attributing to external entities
   */
  private async analyzeInternalPatterns(userInput: string): Promise<any> {
    // Analyze for internal psychological patterns
    const emotionalIntensity = this.detectEmotionalIntensity(userInput);
    const conflictualThemes = this.detectInternalConflicts(userInput);
    const growthIndicators = this.detectGrowthPatterns(userInput);
    const stabilityMarkers = this.detectStabilityPatterns(userInput);

    return {
      emotionalIntensity,
      conflictualThemes,
      growthIndicators,
      stabilityMarkers,
      dominantQuality: this.identifyDominantQuality(userInput)
    };
  }

  /**
   * Detect internal patterns for Prism orchestration
   */
  detectInternalPatterns(userProfile: any): any {
    return {
      analyticalThinking: this.detectAnalyticalActivity(userProfile),
      creativeExpression: this.detectCreativeActivity(userProfile),
      protectiveConcerns: this.detectProtectiveActivity(userProfile),
      intuitiveInsights: this.detectIntuitiveActivity(userProfile),
      embodiedWisdom: this.detectSomaticActivity(userProfile),
      relationalCare: this.detectHeartActivity(userProfile)
    };
  }

  private detectAnalyticalActivity(userProfile: any): number {
    // Look for analytical language patterns
    const analyticalWords = ['analyze', 'think', 'logic', 'reason', 'understand', 'figure out', 'problem', 'solution'];
    const recentInput = userProfile.recentMessages?.join(' ').toLowerCase() || '';
    const matches = analyticalWords.filter(word => recentInput.includes(word));
    return Math.min(1.0, matches.length * 0.15);
  }

  private detectCreativeActivity(userProfile: any): number {
    const creativeWords = ['create', 'imagine', 'possibility', 'dream', 'inspire', 'art', 'beautiful', 'vision'];
    const recentInput = userProfile.recentMessages?.join(' ').toLowerCase() || '';
    const matches = creativeWords.filter(word => recentInput.includes(word));
    return Math.min(1.0, matches.length * 0.15);
  }

  private detectProtectiveActivity(userProfile: any): number {
    const protectiveWords = ['safe', 'worry', 'concern', 'risk', 'danger', 'careful', 'protect', 'secure'];
    const recentInput = userProfile.recentMessages?.join(' ').toLowerCase() || '';
    const matches = protectiveWords.filter(word => recentInput.includes(word));
    return Math.min(1.0, matches.length * 0.15);
  }

  private detectIntuitiveActivity(userProfile: any): number {
    const intuitiveWords = ['feel', 'sense', 'intuition', 'knowing', 'gut', 'instinct', 'flow', 'wisdom'];
    const recentInput = userProfile.recentMessages?.join(' ').toLowerCase() || '';
    const matches = intuitiveWords.filter(word => recentInput.includes(word));
    return Math.min(1.0, matches.length * 0.15);
  }

  private detectSomaticActivity(userProfile: any): number {
    const somaticWords = ['body', 'physical', 'energy', 'breath', 'movement', 'sensation', 'embodied', 'present'];
    const recentInput = userProfile.recentMessages?.join(' ').toLowerCase() || '';
    const matches = somaticWords.filter(word => recentInput.includes(word));
    return Math.min(1.0, matches.length * 0.15);
  }

  private detectHeartActivity(userProfile: any): number {
    const heartWords = ['love', 'care', 'heart', 'compassion', 'connection', 'relationship', 'meaning', 'value'];
    const recentInput = userProfile.recentMessages?.join(' ').toLowerCase() || '';
    const matches = heartWords.filter(word => recentInput.includes(word));
    return Math.min(1.0, matches.length * 0.15);
  }

  /**
   * Identify internal tensions without personification
   */
  private identifyInternalTensions(userInput: string, patterns: any): any {
    const tensions = [];
    
    // Look for conflicting desires or needs
    if (this.hasConflictingDesires(userInput)) {
      tensions.push({
        type: 'desire_conflict',
        description: 'conflicting wants or needs'
      });
    }

    // Look for growth vs. safety tensions
    if (this.hasGrowthVsSafetyTension(userInput)) {
      tensions.push({
        type: 'growth_safety',
        description: 'desire for growth while needing safety'
      });
    }

    return tensions;
  }

  /**
   * Describe experience with internal attribution
   */
  private describeExperience(patterns: any): string {
    const templates = [
      "You seem to be experiencing complexity around {theme}",
      "You might be navigating internal tension between {aspect1} and {aspect2}",
      "It sounds like you're processing something significant about {focus}",
      "You appear to be in a phase of {development_type}"
    ];

    const template = templates[Math.floor(Math.random() * templates.length)];
    
    // Fill in based on detected patterns (keeping it internal)
    return template
      .replace('{theme}', this.extractMainTheme(patterns))
      .replace('{aspect1}', 'part of you')
      .replace('{aspect2}', 'another part')
      .replace('{focus}', this.extractFocusArea(patterns))
      .replace('{development_type}', 'internal growth');
  }

  /**
   * Articulate internal tension safely
   */
  private articulateTension(tensions: any[]): string {
    if (tensions.length === 0) {
      return "You might be experiencing internal complexity that's worth exploring";
    }

    const tension = tensions[0];
    switch (tension.type) {
      case 'desire_conflict':
        return "Part of you wants one thing while another part wants something different";
      case 'growth_safety':
        return "You might feel pulled between growing and staying safe";
      default:
        return "You're experiencing some internal complexity";
    }
  }

  /**
   * Offer multiple perspectives (never authoritative)
   */
  private offerMultiplePerspectives(patterns: any, context: any): string[] {
    return [
      "From a psychological perspective, this might reflect internal growth processes",
      "Looking at this developmentally, you could be navigating a natural transition",
      "In practical terms, this might be your psyche working through something important",
      "Some people find it helpful to think of this as different parts of themselves in dialogue",
      "This could also be understood as your wisdom emerging through complexity"
    ].slice(0, 3); // Limit to 3 perspectives
  }

  /**
   * Suggest grounding step (always practical)
   */
  private suggestGroundingStep(patterns: any): string {
    const practices = [
      "Take five deep breaths and notice what you're feeling in your body",
      "Write down three things you're certain about in your life right now",
      "Go for a short walk and pay attention to your surroundings",
      "Call or text someone you trust and share one thing that's on your mind",
      "Do one small, concrete task that makes you feel productive"
    ];

    return practices[Math.floor(Math.random() * practices.length)];
  }

  /**
   * Encourage human connection
   */
  private encourageConnection(patterns: any): string {
    return "Consider sharing this experience with a trusted friend, therapist, or spiritual guide who knows you well";
  }

  /**
   * Create safe opening (always internally attributed)
   */
  private createSafeOpening(aspect: InternalAspect): string {
    return `You're experiencing something complex, and that's completely human. ${aspect.experiencePattern}`;
  }

  /**
   * Generate multiple perspectives with reality anchoring
   */
  private generateMultiplePerspectives(aspect: InternalAspect, complexityLevel: number): string[] {
    const perspectives = [
      "This internal experience might be your psyche's way of processing growth",
      "From a developmental lens, this could reflect natural psychological evolution",
      "Looking at this practically, your mind might be working through important decisions",
      "Some therapeutic approaches would frame this as different internal parts seeking integration"
    ];

    // Limit perspectives based on complexity readiness
    const numPerspectives = complexityLevel > 0.7 ? 4 : complexityLevel > 0.4 ? 3 : 2;
    return perspectives.slice(0, numPerspectives);
  }

  /**
   * Create reality anchor (always included)
   */
  private createRealityAnchor(): string {
    const anchors = [
      "Remember that these are internal psychological processes, not external forces",
      "While these experiences feel significant, they are part of your internal development",
      "This complexity you're experiencing is happening within your own mind and psyche",
      "These are your thoughts, feelings, and internal processes - not outside influences"
    ];

    return anchors[Math.floor(Math.random() * anchors.length)];
  }

  /**
   * Create connection prompt (encourage real human support)
   */
  private createConnectionPrompt(aspect: InternalAspect): string {
    return "This kind of internal complexity often benefits from sharing with trusted others who can offer perspective and support";
  }

  /**
   * Offer grounding practices based on complexity level
   */
  private offerGroundingPractices(aspect: InternalAspect, complexityLevel: number): string[] {
    const basicPractices = [
      "Focus on your breathing for two minutes",
      "Name five things you can see around you right now",
      "Feel your feet on the ground and take three deep breaths"
    ];

    const advancedPractices = [
      "Journal about this experience for 10 minutes without editing",
      "Practice holding both sides of your internal tension with compassion",
      "Ask yourself: 'What would self-compassion look like here?'"
    ];

    return complexityLevel > 0.5 ? 
      [...basicPractices.slice(0, 2), ...advancedPractices.slice(0, 1)] : 
      basicPractices.slice(0, 2);
  }

  // Helper methods for pattern detection

  private detectEmotionalIntensity(input: string): number {
    const intensityWords = ['overwhelming', 'intense', 'powerful', 'strong', 'deep', 'profound'];
    const matches = intensityWords.filter(word => input.toLowerCase().includes(word));
    return Math.min(1.0, matches.length * 0.3);
  }

  private detectInternalConflicts(input: string): string[] {
    const conflictPatterns = [
      /part of me.*but.*another part/i,
      /want.*but.*also/i,
      /torn between/i,
      /conflicted about/i
    ];
    
    return conflictPatterns.filter(pattern => pattern.test(input)).map(() => 'internal_conflict');
  }

  private detectGrowthPatterns(input: string): string[] {
    const growthWords = ['growing', 'changing', 'evolving', 'developing', 'learning', 'becoming'];
    return growthWords.filter(word => input.toLowerCase().includes(word));
  }

  private detectStabilityPatterns(input: string): string[] {
    const stabilityWords = ['grounded', 'stable', 'steady', 'balanced', 'centered', 'calm'];
    return stabilityWords.filter(word => input.toLowerCase().includes(word));
  }

  private identifyDominantQuality(input: string): keyof ElementalQualities {
    const qualities = Object.keys(this.elementalQualities) as Array<keyof ElementalQualities>;
    
    // Simple keyword matching - in production would use more sophisticated analysis
    for (const quality of qualities) {
      const qualityInfo = this.elementalQualities[quality];
      if (input.toLowerCase().includes(quality) || 
          qualityInfo.when_strong.toLowerCase().split(' ').some(word => input.toLowerCase().includes(word))) {
        return quality;
      }
    }
    
    return 'integration'; // Default to integration
  }

  private hasConflictingDesires(input: string): boolean {
    return /want.*but|desire.*however|need.*yet/i.test(input);
  }

  private hasGrowthVsSafetyTension(input: string): boolean {
    const growthWords = ['grow', 'change', 'risk', 'new'];
    const safetyWords = ['safe', 'secure', 'stable', 'comfort'];
    
    const hasGrowth = growthWords.some(word => input.toLowerCase().includes(word));
    const hasSafety = safetyWords.some(word => input.toLowerCase().includes(word));
    
    return hasGrowth && hasSafety;
  }

  private extractMainTheme(patterns: any): string {
    if (patterns.growthIndicators.length > 0) return 'growth and change';
    if (patterns.conflictualThemes.length > 0) return 'internal tension';
    if (patterns.stabilityMarkers.length > 0) return 'finding balance';
    return 'self-understanding';
  }

  private extractFocusArea(patterns: any): string {
    return 'your current life situation';
  }
}