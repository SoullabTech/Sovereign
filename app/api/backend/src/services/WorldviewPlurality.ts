/**
 * WorldviewPlurality - Multi-Lens Reality Framework
 * 
 * Presents ALL interpretations as optional lenses, never as detected realities.
 * Core principle: "Support the person, not the interpretation"
 * 
 * Prevents dogmatic thinking while honoring individual worldviews.
 */

export type InterpretiveLens = 
  | 'psychological' 
  | 'daimonic' 
  | 'neurobiological' 
  | 'systemic' 
  | 'somatic'
  | 'practical'
  | 'mystical';

export interface LensInterpretation {
  lens: InterpretiveLens;
  name: string;
  description: string;
  interpretation: string;
  practicalAction?: string;
}

export interface WorldviewFrame {
  primaryLens: InterpretiveLens;
  interpretations: LensInterpretation[];
  pluralityReminder: string;
  lensRotationSuggestion?: string;
}

export class WorldviewPluralityService {
  private static instance: WorldviewPluralityService;
  private interactionCount: number = 0;
  
  // Lens descriptions to help users understand frameworks
  private readonly lensDescriptions: Record<InterpretiveLens, string> = {
    psychological: "Internal mental processes, unconscious patterns, and personal psychology",
    daimonic: "Autonomous forces or 'Others' that operate beyond personal control",
    neurobiological: "Brain states, neurotransmitters, and biological processes",
    systemic: "Environmental factors, social dynamics, and external influences", 
    somatic: "Body wisdom, physical sensations, and embodied intelligence",
    practical: "Concrete actions, daily routines, and tangible outcomes",
    mystical: "Spiritual dimensions, transcendent experiences, and sacred meaning"
  };
  
  // Gentle reminders that rotate to prevent habituation
  private readonly pluralityReminders: string[] = [
    "Remember: These are interpretive frameworks, not truth claims. What feels most useful to you right now?",
    "All perspectives can coexist - you don't have to choose just one way of understanding this.",
    "These are lenses for exploring, not conclusions about what's real. Which resonates with you?",
    "Different frameworks can all be partially true. What combination serves your wellbeing?",
    "Consider these as tools rather than truths - use what helps, leave what doesn't."
  ];
  
  static getInstance(): WorldviewPluralityService {
    if (!WorldviewPluralityService.instance) {
      WorldviewPluralityService.instance = new WorldviewPluralityService();
    }
    return WorldviewPluralityService.instance;
  }
  
  /**
   * Frame any experience through multiple interpretive lenses
   */
  async frameExperience(
    experience: string,
    suggestedLens?: InterpretiveLens
  ): Promise<WorldviewFrame> {
    this.interactionCount++;
    
    // Generate interpretations through multiple lenses
    const interpretations = await this.generateMultipleLenses(experience);
    
    // Determine primary lens (rotate every 3-5 interactions if not specified)
    const primaryLens = suggestedLens || this.selectRotatingLens();
    
    // Move primary lens to front
    const sortedInterpretations = this.prioritizeLens(interpretations, primaryLens);
    
    return {
      primaryLens,
      interpretations: sortedInterpretations,
      pluralityReminder: this.getRotatingReminder(),
      lensRotationSuggestion: this.shouldSuggestRotation() ? 
        "Try exploring this through a different lens - sometimes new perspectives reveal hidden aspects." : 
        undefined
    };
  }
  
  /**
   * Generate interpretations through all major lenses
   */
  private async generateMultipleLenses(experience: string): Promise<LensInterpretation[]> {
    const interpretations: LensInterpretation[] = [];
    
    // Psychological lens
    interpretations.push({
      lens: 'psychological',
      name: 'Psychological Lens',
      description: this.lensDescriptions.psychological,
      interpretation: await this.generatePsychologicalInterpretation(experience),
      practicalAction: "Consider journaling about the emotions and thoughts this brings up."
    });
    
    // Daimonic lens  
    interpretations.push({
      lens: 'daimonic',
      name: 'Daimonic Lens',
      description: this.lensDescriptions.daimonic,
      interpretation: await this.generateDaimonicInterpretation(experience),
      practicalAction: "Listen for what this 'Other' might be asking of you, then discuss with a trusted friend."
    });
    
    // Neurobiological lens
    interpretations.push({
      lens: 'neurobiological', 
      name: 'Neurobiological Lens',
      description: this.lensDescriptions.neurobiological,
      interpretation: await this.generateNeurobiologicalInterpretation(experience),
      practicalAction: "Check your sleep, nutrition, and stress levels - brain states affect everything."
    });
    
    // Systemic lens
    interpretations.push({
      lens: 'systemic',
      name: 'Systemic Lens', 
      description: this.lensDescriptions.systemic,
      interpretation: await this.generateSystemicInterpretation(experience),
      practicalAction: "Look at what's happening in your environment, relationships, and social context."
    });
    
    // Somatic lens
    interpretations.push({
      lens: 'somatic',
      name: 'Somatic Lens',
      description: this.lensDescriptions.somatic,
      interpretation: await this.generateSomaticInterpretation(experience),
      practicalAction: "Notice what your body is telling you - walk, stretch, or simply breathe."
    });
    
    return interpretations;
  }
  
  /**
   * Generate psychological interpretation (never diagnostic)
   */
  private async generatePsychologicalInterpretation(experience: string): Promise<string> {
    if (experience.includes('pattern') || experience.includes('synchron')) {
      return "Through a psychological lens, this could be your unconscious mind recognizing patterns and bringing them to awareness - the brain's natural meaning-making process at work.";
    }
    
    if (experience.includes('resistance') || experience.includes('obstacle')) {
      return "Psychologically, this might represent internal conflicts between different parts of yourself - one part wanting change, another seeking safety.";
    }
    
    if (experience.includes('vision') || experience.includes('insight')) {
      return "From this perspective, insights often emerge when we're relaxed enough for unconscious processing to surface into conscious awareness.";
    }
    
    return "Through a psychological lens, this experience could reflect your mind's natural process of integration, making sense of information in creative ways.";
  }
  
  /**
   * Generate daimonic interpretation (as optional lens, not detected reality)
   */
  private async generateDaimonicInterpretation(experience: string): Promise<string> {
    if (experience.includes('resistance') || experience.includes('demand')) {
      return "Through a daimonic lens, this could be experienced as an autonomous force making demands that your ego wouldn't make - something that maintains its otherness while guiding development.";
    }
    
    if (experience.includes('synchron') || experience.includes('meaning')) {
      return "From this perspective, this might be the 'important Other' speaking through circumstances that won't fit your usual categories.";
    }
    
    if (experience.includes('pattern') || experience.includes('message')) {
      return "Daimonically, this could be understood as a dialogue with forces that remain irreducibly Other - not higher self, but genuine encounter with what cannot be absorbed into ego understanding.";
    }
    
    return "Through a daimonic lens, this experience might be a meeting with something that maintains its autonomous otherness while participating in your development.";
  }
  
  /**
   * Generate neurobiological interpretation (grounding)
   */
  private async generateNeurobiologicalInterpretation(experience: string): Promise<string> {
    if (experience.includes('insight') || experience.includes('clarity')) {
      return "Neurobiologically, insights often occur when the default mode network quiets, allowing new neural connections to form and previously unlinked information to integrate.";
    }
    
    if (experience.includes('energy') || experience.includes('intense')) {
      return "From a brain perspective, this might reflect shifts in neurotransmitter balance, stress hormones, or sleep patterns affecting perception and emotional processing.";
    }
    
    if (experience.includes('pattern') || experience.includes('connection')) {
      return "The brain is constantly seeking patterns - this could be your pattern recognition systems working on information that has been processing in the background.";
    }
    
    return "Neurobiologically, experiences like this often involve the brain's meaning-making networks becoming more active, possibly due to changes in sleep, stress, or attention patterns.";
  }
  
  /**
   * Generate systemic interpretation (environmental factors)
   */
  private async generateSystemicInterpretation(experience: string): Promise<string> {
    if (experience.includes('change') || experience.includes('shift')) {
      return "Systemically, this might reflect changes in your environment, relationships, or social context that are affecting your internal landscape.";
    }
    
    if (experience.includes('pattern') || experience.includes('theme')) {
      return "From a systems perspective, this could be your awareness picking up on collective patterns, seasonal changes, or shifts in your social network.";
    }
    
    if (experience.includes('resistance') || experience.calls('challenge')) {
      return "Environmentally, this might represent external pressures or changes that require adaptation, manifesting as internal experience.";
    }
    
    return "Through a systemic lens, this experience might be your system responding to environmental factors - everything from weather patterns to cultural shifts affects internal experience.";
  }
  
  /**
   * Generate somatic interpretation (body wisdom)
   */
  private async generateSomaticInterpretation(experience: string): Promise<string> {
    if (experience.includes('knowing') || experience.includes('sense')) {
      return "Somatically, this could be your body's intelligence communicating through sensation, posture, or breath - often the body knows before the mind.";
    }
    
    if (experience.includes('energy') || experience.includes('flow')) {
      return "From an embodied perspective, this might be energy moving through your system, possibly related to seasonal changes, physical needs, or stored emotions releasing.";
    }
    
    if (experience.includes('tension') || experience.includes('resistance')) {
      return "Body-wise, this could be physical holding patterns or nervous system activation manifesting as psychological experience.";
    }
    
    return "Through a somatic lens, this experience might be your body's wisdom expressing itself - the felt sense that emerges from embodied living.";
  }
  
  /**
   * Select rotating primary lens to prevent single-perspective dominance
   */
  private selectRotatingLens(): InterpretiveLens {
    const lenses: InterpretiveLens[] = ['psychological', 'daimonic', 'neurobiological', 'systemic', 'somatic'];
    const cyclePosition = Math.floor(this.interactionCount / 4) % lenses.length;
    return lenses[cyclePosition];
  }
  
  /**
   * Prioritize specified lens while keeping others available
   */
  private prioritizeLens(interpretations: LensInterpretation[], primaryLens: InterpretiveLens): LensInterpretation[] {
    const primary = interpretations.find(i => i.lens === primaryLens);
    const others = interpretations.filter(i => i.lens !== primaryLens);
    
    return primary ? [primary, ...others] : interpretations;
  }
  
  /**
   * Get rotating plurality reminder to prevent habituation
   */
  private getRotatingReminder(): string {
    const index = Math.floor(this.interactionCount / 3) % this.pluralityReminders.length;
    return this.pluralityReminders[index];
  }
  
  /**
   * Suggest lens rotation every 5-7 interactions
   */
  private shouldSuggestRotation(): boolean {
    return this.interactionCount % 6 === 0;
  }
  
  /**
   * Format worldview frame for presentation
   */
  formatForPresentation(frame: WorldviewFrame): string {
    let output = `**Currently viewing through: ${frame.interpretations[0].name}**\n\n`;
    
    // Primary interpretation
    output += `${frame.interpretations[0].interpretation}\n\n`;
    
    // Practical action if available
    if (frame.interpretations[0].practicalAction) {
      output += `*Practical step: ${frame.interpretations[0].practicalAction}*\n\n`;
    }
    
    // Alternative perspectives
    output += "**Other ways to understand this:**\n";
    frame.interpretations.slice(1, 3).forEach(interp => {
      output += `• **${interp.name}**: ${interp.interpretation}\n`;
    });
    
    output += `\n*${frame.pluralityReminder}*\n`;
    
    if (frame.lensRotationSuggestion) {
      output += `\n💡 ${frame.lensRotationSuggestion}`;
    }
    
    return output;
  }
  
  /**
   * Generate lens switching UI component data
   */
  generateLensSwitchingUI(currentLens: InterpretiveLens): {
    currentLens: InterpretiveLens;
    currentDescription: string;
    availableLenses: { lens: InterpretiveLens; name: string; description: string }[];
  } {
    return {
      currentLens,
      currentDescription: this.lensDescriptions[currentLens],
      availableLenses: Object.entries(this.lensDescriptions)
        .filter(([lens]) => lens !== currentLens)
        .map(([lens, description]) => ({
          lens: lens as InterpretiveLens,
          name: lens.charAt(0).toUpperCase() + lens.slice(1) + ' Lens',
          description
        }))
    };
  }
}