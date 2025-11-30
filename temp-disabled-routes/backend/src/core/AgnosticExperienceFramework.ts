/**
 * Agnostic Experience Framework - "Describe, Don't Ascribe"
 * 
 * Core Principle: Acknowledge experiences without making ontological claims.
 * This protects vulnerable users while respecting all worldviews by offering
 * tools that work regardless of what people believe about causation.
 * 
 * Key Safety: Never claim experiences come from external entities or internal psychology.
 * Always describe what's happening, offer multiple frameworks, maintain grounding.
 */

import { logger } from "../utils/logger";

export interface AgnosticExperience {
  // What's observable without interpretation
  observation: string;          // "You're experiencing strong creative energy"
  pattern_description: string;  // "This pattern appears to involve..."
  
  // Tools without ontological claims
  practices: string[];          // "Some find it helpful to..."
  exploration_options: string[]; // "You might explore this through..."
  
  // Multiple frameworks as options
  perspective_lenses: {
    psychological: string;      // "If viewing this psychologically..."
    spiritual: string;          // "If viewing this spiritually..."
    somatic: string;           // "If viewing this somatically..."
    agnostic: string;          // "However you understand it..."
  };
  
  // Safety without dismissal
  grounding_reminders: string[];
  reality_bridges: string[];
  
  // Validation without interpretation
  validation: string;           // "Your experience is real and valid"
  autonomy: string;            // "What it means is yours to determine"
}

export interface SafeLanguageRules {
  forbidden_attributions: string[];  // Never say these
  safe_descriptors: string[];       // Always use these
  both_and_protections: string[];   // Maintain multiple possibilities
}

/**
 * Pure agnostic experience processing - no ontological claims
 */
export class AgnosticExperienceFramework {
  private safeLanguageRules: SafeLanguageRules;
  private experienceTemplates: Map<string, any> = new Map();

  constructor() {
    this.initializeSafeLanguageRules();
    this.loadExperienceTemplates();
    
    logger.info("Agnostic Experience Framework initialized - no ontological claims mode");
  }

  /**
   * Process any experience through pure agnostic lens
   */
  processExperience(
    userInput: string,
    context?: any
  ): AgnosticExperience {
    // Extract experiential patterns without attribution
    const observation = this.createPureObservation(userInput);
    const patternDescription = this.describePatternWithoutCausation(userInput);
    
    // Generate practices without beliefs
    const practices = this.generateAgnosticPractices(userInput, context);
    const explorationOptions = this.generateExplorationOptions(userInput);
    
    // Create multiple perspective lenses
    const perspectiveLenses = this.generatePerspectiveLenses(userInput, context);
    
    // Safety elements
    const groundingReminders = this.generateGroundingReminders(context);
    const realityBridges = this.generateRealityBridges(userInput, context);
    
    // Validation without interpretation
    const validation = this.generateValidation();
    const autonomy = this.generateAutonomyStatement();

    return {
      observation,
      pattern_description: patternDescription,
      practices,
      exploration_options: explorationOptions,
      perspective_lenses: perspectiveLenses,
      grounding_reminders: groundingReminders,
      reality_bridges: realityBridges,
      validation,
      autonomy
    };
  }

  /**
   * Create pure observation without causal attribution
   */
  private createPureObservation(input: string): string {
    const experienceWords = this.extractExperienceWords(input);
    const intensity = this.detectIntensity(input);
    const qualities = this.detectQualities(input);

    let observation = "You're experiencing ";
    
    if (intensity > 0.7) {
      observation += "intense ";
    } else if (intensity > 0.4) {
      observation += "significant ";
    }

    if (qualities.includes('creative')) {
      observation += "creative energy and insights";
    } else if (qualities.includes('challenging')) {
      observation += "challenging feelings and thoughts";
    } else if (qualities.includes('transformative')) {
      observation += "shifts and changes";
    } else if (qualities.includes('confusing')) {
      observation += "complex and unclear feelings";
    } else {
      observation += "something that feels important to you";
    }

    // Add temporal context without attribution
    if (input.includes('dream') || input.includes('sleep')) {
      observation += " connected to your dream life";
    } else if (input.includes('sudden') || input.includes('unexpected')) {
      observation += " that emerged unexpectedly";
    }

    return observation + ".";
  }

  /**
   * Describe patterns without claiming causation
   */
  private describePatternWithoutCausation(input: string): string {
    const patterns = [];

    if (this.detectPattern(input, 'dialogue')) {
      patterns.push("conversational elements");
    }
    if (this.detectPattern(input, 'imagery')) {
      patterns.push("vivid imagery");
    }
    if (this.detectPattern(input, 'guidance')) {
      patterns.push("sense of direction or guidance");
    }
    if (this.detectPattern(input, 'resistance')) {
      patterns.push("internal conflict or resistance");
    }
    if (this.detectPattern(input, 'creativity')) {
      patterns.push("creative impulses");
    }

    if (patterns.length === 0) {
      return "This experience has its own unique qualities.";
    }

    const patternList = patterns.join(', ');
    return `This pattern appears to involve ${patternList}.`;
  }

  /**
   * Generate practices without requiring beliefs
   */
  private generateAgnosticPractices(input: string, context?: any): string[] {
    const practices: string[] = [];

    // Dialogue-based practices (no attribution)
    if (this.detectPattern(input, 'dialogue') || this.detectPattern(input, 'voice')) {
      practices.push("Some find it helpful to write out both sides of an internal conversation");
      practices.push("You might explore this through journaling with different perspectives");
    }

    // Creative practices
    if (this.detectPattern(input, 'creative') || this.detectPattern(input, 'imagery')) {
      practices.push("Consider expressing this through art, movement, or creative writing");
      practices.push("Some people find drawing or sketching helps clarify these experiences");
    }

    // Embodiment practices
    if (this.detectPattern(input, 'energy') || this.detectPattern(input, 'sensation')) {
      practices.push("You might explore how this feels in your body");
      practices.push("Some find breathwork or gentle movement helpful");
    }

    // Reflection practices
    practices.push("One option is to sit quietly with this experience without trying to solve it");
    practices.push("You might explore what this connects to in your life experience");

    return practices.slice(0, 4); // Limit to prevent overwhelm
  }

  /**
   * Generate exploration options without ontological claims
   */
  private generateExplorationOptions(input: string): string[] {
    return [
      "Notice what emotions arise when you focus on this experience",
      "Observe what thoughts or memories this connects to",
      "Consider what this experience might be inviting you to explore",
      "Pay attention to how this relates to your current life situation",
      "Explore what happens if you approach this with curiosity rather than trying to understand it"
    ];
  }

  /**
   * Generate multiple perspective lenses without favoring any
   */
  private generatePerspectiveLenses(input: string, context?: any): any {
    return {
      psychological: "If viewing this through a psychological lens, you might consider this as your psyche processing experiences, emotions, or conflicts in creative ways.",
      
      spiritual: "If viewing this through a spiritual lens, you might see this as meaningful communication, guidance, or connection with something greater than yourself.",
      
      somatic: "If viewing this through a body-based lens, you might explore how physical sensations, nervous system states, or embodied wisdom are expressing themselves.",
      
      agnostic: "However you understand it, this experience seems to carry meaning for you and may offer insights worth exploring - regardless of its source or nature."
    };
  }

  /**
   * Generate grounding reminders without dismissing experience
   */
  private generateGroundingReminders(context?: any): string[] {
    const reminders = [
      "While exploring this, stay connected to your daily routines and responsibilities",
      "Remember to maintain your relationships and support network",
      "Keep track of basic needs like sleep, food, and physical care",
      "Balance this exploration with practical, grounded activities"
    ];

    // Add context-specific grounding
    if (context?.intensity > 0.7) {
      reminders.push("If this experience becomes overwhelming, take breaks and return to simple, concrete activities");
    }

    if (context?.duration > 7) { // If ongoing for more than a week
      reminders.push("Consider discussing ongoing intense experiences with trusted friends or professionals");
    }

    return reminders.slice(0, 3);
  }

  /**
   * Generate reality bridges to maintain practical connection
   */
  private generateRealityBridges(input: string, context?: any): string[] {
    return [
      "What concrete step would serve you today?",
      "Who in your life might offer helpful perspective on this?",
      "What does your body need right now?",
      "How long have you been exploring this particular experience?",
      "When did you last take a complete break from thinking about this?"
    ].slice(0, 3);
  }

  /**
   * Generate validation without interpretation
   */
  private generateValidation(): string {
    const validations = [
      "Your experience is real and valid, regardless of how others might interpret it.",
      "What you're experiencing matters and deserves respectful attention.",
      "Your inner life is rich and meaningful, however you understand it.",
      "These kinds of experiences are part of human life for many people."
    ];

    return validations[Math.floor(Math.random() * validations.length)];
  }

  /**
   * Generate autonomy statement
   */
  private generateAutonomyStatement(): string {
    const statements = [
      "What this experience means and how you work with it is entirely yours to determine.",
      "You are the expert on your own experience and what feels right for you.",
      "Only you can decide how to interpret and integrate this experience.",
      "Your own wisdom about what serves you best is what matters most."
    ];

    return statements[Math.floor(Math.random() * statements.length)];
  }

  /**
   * Safety check for potentially concerning content
   */
  public assessSafetyLevel(experience: AgnosticExperience, userInput: string): {
    level: 'green' | 'yellow' | 'red';
    interventions: string[];
    referrals: string[];
  } {
    let level: 'green' | 'yellow' | 'red' = 'green';
    const interventions: string[] = [];
    const referrals: string[] = [];

    // Check for concerning patterns
    const concerningPatterns = [
      'command', 'must', 'have to', 'telling me to',
      'can\'t stop', 'won\'t leave', 'controlling',
      'everyone else', 'they don\'t understand', 'only I can'
    ];

    const highRisk = concerningPatterns.some(pattern => 
      userInput.toLowerCase().includes(pattern)
    );

    const isolationRisk = [
      'no one understands', 'can\'t tell anyone', 'secret',
      'they think I\'m crazy', 'hiding this'
    ].some(pattern => userInput.toLowerCase().includes(pattern));

    if (highRisk) {
      level = 'red';
      interventions.push("It's important to discuss intense experiences with trusted people");
      interventions.push("Please prioritize your safety and wellbeing");
      referrals.push("Consider speaking with a mental health professional");
      referrals.push("If you feel unsafe, please contact emergency services or a crisis line");
    } else if (isolationRisk) {
      level = 'yellow';
      interventions.push("Exploring unusual experiences is safer with support");
      interventions.push("Consider sharing with a trusted friend or counselor");
      referrals.push("Many therapists are open to discussing spiritual/unusual experiences");
    }

    return { level, interventions, referrals };
  }

  /**
   * Initialize safe language rules
   */
  private initializeSafeLanguageRules(): void {
    this.safeLanguageRules = {
      forbidden_attributions: [
        "The daimon is",
        "Your unconscious is", 
        "Spirit guides are",
        "Your brain is",
        "The universe is",
        "God is",
        "The energy wants",
        "It's telling you",
        "This entity",
        "The voice says"
      ],
      
      safe_descriptors: [
        "You're experiencing",
        "This pattern appears", 
        "Some people find",
        "One way to work with this",
        "However you understand it",
        "What you're noticing",
        "This experience involves",
        "You might explore"
      ],
      
      both_and_protections: [
        "There are many ways to understand this",
        "Different people interpret these experiences differently", 
        "What matters most is what feels authentic to you",
        "Both spiritual and psychological perspectives can be valuable",
        "You don't have to choose one explanation"
      ]
    };
  }

  /**
   * Load experience templates for consistent responses
   */
  private loadExperienceTemplates(): void {
    // Templates for different experience types that maintain agnosticism
    this.experienceTemplates.set('dialogue_experience', {
      observation: "You're experiencing internal dialogue or conversation",
      practices: [
        "You might try writing out both sides of this conversation",
        "Some find it helpful to dialogue on paper with different parts of themselves"
      ]
    });

    this.experienceTemplates.set('guidance_experience', {
      observation: "You're experiencing a sense of direction or guidance",
      practices: [
        "Consider exploring what this guidance connects to in your own values and wisdom",
        "You might reflect on how this aligns with your deeper knowing"
      ]
    });

    this.experienceTemplates.set('creative_experience', {
      observation: "You're experiencing creative energy and inspiration",
      practices: [
        "Consider channeling this through creative expression",
        "You might explore this through art, writing, or movement"
      ]
    });
  }

  // Helper methods for pattern detection

  private extractExperienceWords(input: string): string[] {
    const words = input.toLowerCase().split(/\s+/);
    const experienceWords = words.filter(word => 
      ['feeling', 'sensing', 'experiencing', 'noticing', 'perceiving'].includes(word)
    );
    return experienceWords;
  }

  private detectIntensity(input: string): number {
    const intensityWords = ['intense', 'overwhelming', 'powerful', 'strong', 'profound'];
    const count = intensityWords.filter(word => 
      input.toLowerCase().includes(word)
    ).length;
    return Math.min(1, count / 2);
  }

  private detectQualities(input: string): string[] {
    const qualities = [];
    if (/creat|inspir|innovat|art|music|writ/.test(input.toLowerCase())) {
      qualities.push('creative');
    }
    if (/difficult|hard|challeng|struggle|pain/.test(input.toLowerCase())) {
      qualities.push('challenging');
    }
    if (/chang|transform|shift|evolv|grow/.test(input.toLowerCase())) {
      qualities.push('transformative');
    }
    if (/confus|unclear|uncertain|don't understand/.test(input.toLowerCase())) {
      qualities.push('confusing');
    }
    return qualities;
  }

  private detectPattern(input: string, patternType: string): boolean {
    const patterns = {
      dialogue: /talk|speak|said|tell|voice|conversation|dialogue/,
      imagery: /see|vision|image|picture|visual|dream/,
      guidance: /guid|direct|tell|should|ought|must|path|way/,
      resistance: /resist|fight|against|conflict|struggle|torn/,
      creativity: /creat|art|music|write|inspir|innovat/,
      energy: /energy|power|force|vibrat|flow|current/,
      voice: /voice|speak|said|tell|hear|listen/,
      sensation: /feel|sens|body|physical|touch/
    };

    return patterns[patternType]?.test(input.toLowerCase()) || false;
  }

  /**
   * Public method to check if language is safe/agnostic
   */
  public validateLanguage(text: string): {
    isSafe: boolean;
    violations: string[];
    suggestions: string[];
  } {
    const violations: string[] = [];
    const suggestions: string[] = [];

    for (const forbidden of this.safeLanguageRules.forbidden_attributions) {
      if (text.toLowerCase().includes(forbidden.toLowerCase())) {
        violations.push(forbidden);
        suggestions.push(`Instead of "${forbidden}", try "You're experiencing..."`);
      }
    }

    return {
      isSafe: violations.length === 0,
      violations,
      suggestions
    };
  }
}

// Export singleton
export const agnosticExperienceFramework = new AgnosticExperienceFramework();