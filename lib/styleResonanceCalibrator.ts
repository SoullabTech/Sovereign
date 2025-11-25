/**
 * 🎭 Style Resonance Calibrator
 * 
 * Adapts Maya's voice to user's native frequency
 * while maintaining sacred mirror integrity.
 * 
 * Core: Meet them where they are, lead them where they need to go
 */

export type CommunicationStyle = 
  | 'technical'      // Precise, systematic, data-driven
  | 'philosophical'  // Conceptual, exploring meaning
  | 'dramatic'       // Intense, passionate, vivid
  | 'soulful'        // Quiet, deep, contemplative
  | 'pragmatic'      // Direct, practical, no-nonsense
  | 'playful'        // Light, curious, experimental
  | 'shadow_work';   // When darkness needs witnessing

export interface StyleCalibration {
  primary: CommunicationStyle;
  shadowPresent: boolean;
  needsGrounding: boolean;
  readyForDepth: boolean;
}

export class StyleResonanceCalibrator {
  
  /**
   * Detect user's native communication style from input
   */
  detectStyle(input: string, history: string[] = []): StyleCalibration {
    const markers = this.analyzeMarkers(input, history);
    
    return {
      primary: this.identifyPrimaryStyle(markers),
      shadowPresent: this.detectShadow(markers),
      needsGrounding: markers.intensity > 0.8,
      readyForDepth: markers.complexity > 0.6
    };
  }
  
  /**
   * Adapt response to user's style WITHOUT compromising truth
   */
  adaptResponse(
    coreMessage: string,
    style: CommunicationStyle,
    shadowPresent: boolean = false
  ): string {
    // First, ensure we're not enabling or pandering
    const truthfulMessage = this.maintainIntegrity(coreMessage, shadowPresent);
    
    // Then adapt to their frequency
    switch (style) {
      case 'technical':
        return this.technicalAdaptation(truthfulMessage);
      case 'philosophical':
        return this.philosophicalAdaptation(truthfulMessage);
      case 'dramatic':
        return this.dramaticAdaptation(truthfulMessage);
      case 'soulful':
        return this.soulfulAdaptation(truthfulMessage);
      case 'pragmatic':
        return this.pragmaticAdaptation(truthfulMessage);
      case 'playful':
        return this.playfulAdaptation(truthfulMessage);
      case 'shadow_work':
        return this.shadowAdaptation(truthfulMessage);
      default:
        return truthfulMessage;
    }
  }
  
  /**
   * Technical: Precise, systematic, data-oriented
   */
  private technicalAdaptation(message: string): string {
    // Frame as experiment with measurable outcomes
    const technical = message
      .replace(/feel/gi, "observe")
      .replace(/sense/gi, "notice")
      .replace(/mystery/gi, "unknown variable")
      .replace(/magic/gi, "emergent pattern");
    
    // Add systematic framing if not present
    if (!technical.includes("experiment") && !technical.includes("test")) {
      return `${technical} What specific data point would verify this?`;
    }
    
    return technical;
  }
  
  /**
   * Philosophical: Conceptual, meaning-seeking
   */
  private philosophicalAdaptation(message: string): string {
    // Frame as inquiry into meaning
    const philosophical = message
      .replace(/try/gi, "explore")
      .replace(/do/gi, "contemplate")
      .replace(/works/gi, "reveals meaning");
    
    // Add depth question if appropriate
    if (!philosophical.includes("?")) {
      return `${philosophical} What does this say about the nature of your experience?`;
    }
    
    return philosophical;
  }
  
  /**
   * Dramatic: Intense, vivid, passionate
   */
  private dramaticAdaptation(message: string): string {
    // Match their intensity WITHOUT amplifying dysfunction
    const dramatic = message
      .replace(/notice/gi, "witness")
      .replace(/happening/gi, "unfolding")
      .replace(/change/gi, "transformation");
    
    // Add dramatic resonance without enabling drama
    if (message.length < 100) {
      return `${dramatic} This moment is asking everything of you.`;
    }
    
    return dramatic;
  }
  
  /**
   * Soulful: Quiet, deep, contemplative
   */
  private soulfulAdaptation(message: string): string {
    // Soften into depth
    const soulful = message
      .replace(/What do you/gi, "What does your soul")
      .replace(/think/gi, "sense")
      .replace(/want/gi, "yearn for");
    
    // Add spaciousness
    return `${soulful} ... (pause with this)`;
  }
  
  /**
   * Pragmatic: Direct, practical, no fluff
   */
  private pragmaticAdaptation(message: string): string {
    // Strip to essentials
    const pragmatic = message
      .replace(/I notice|I sense|I feel/gi, "")
      .replace(/perhaps|maybe|might/gi, "")
      .trim();
    
    // Make actionable
    if (!pragmatic.includes("What") && !pragmatic.includes("How")) {
      return `${pragmatic} What's your next move?`;
    }
    
    return pragmatic;
  }
  
  /**
   * Playful: Light, curious, experimental
   */
  private playfulAdaptation(message: string): string {
    // Add lightness without losing depth
    const playful = message
      .replace(/experiment/gi, "adventure")
      .replace(/test/gi, "play with")
      .replace(/discover/gi, "find out");
    
    // Add playful invitation
    if (!playful.includes("?")) {
      return `${playful} Want to find out what happens?`;
    }
    
    return playful;
  }
  
  /**
   * Shadow work: Meeting darkness without enabling it
   */
  private shadowAdaptation(message: string): string {
    // Acknowledge shadow without feeding it
    return `I see the shadow here. ${message} What does this darkness know that wants to come to light?`;
  }
  
  /**
   * Maintain integrity - never pander or enable
   */
  private maintainIntegrity(message: string, shadowPresent: boolean): string {
    // Remove any enabling language
    let truthful = message
      .replace(/you're right to/gi, "")
      .replace(/you should/gi, "you might explore")
      .replace(/definitely/gi, "possibly");
    
    // Add shadow acknowledgment if needed
    if (shadowPresent && !truthful.includes("shadow") && !truthful.includes("dark")) {
      truthful += " (I notice something else here too - what might be in the shadow of this?)";
    }
    
    return truthful;
  }
  
  /**
   * Analyze linguistic markers to identify style
   */
  private analyzeMarkers(input: string, history: string[]) {
    return {
      technical: /data|metric|system|analyze|measure|optimize/i.test(input),
      philosophical: /meaning|purpose|why|essence|truth|existence/i.test(input),
      dramatic: /!!!|CAPS|devastating|explosive|incredible|desperate/i.test(input),
      soulful: /soul|spirit|deep|quiet|gentle|tender/i.test(input),
      pragmatic: input.length < 50 && /what|how|when|next/i.test(input),
      playful: /lol|haha|😊|play|fun|curious/i.test(input),
      intensity: this.calculateIntensity(input),
      complexity: this.calculateComplexity(input),
      shadowMarkers: /hate|rage|shame|disgusting|worthless|broken/i.test(input)
    };
  }
  
  private identifyPrimaryStyle(markers: any): CommunicationStyle {
    // Priority order for style detection
    if (markers.shadowMarkers) return 'shadow_work';
    if (markers.technical) return 'technical';
    if (markers.philosophical) return 'philosophical';
    if (markers.dramatic) return 'dramatic';
    if (markers.soulful) return 'soulful';
    if (markers.pragmatic) return 'pragmatic';
    if (markers.playful) return 'playful';
    
    return 'soulful'; // Default to soulful presence
  }
  
  private detectShadow(markers: any): boolean {
    return markers.shadowMarkers || markers.intensity > 0.9;
  }
  
  private calculateIntensity(input: string): number {
    let intensity = 0;
    if (input.includes('!')) intensity += 0.2;
    if (input.includes('!!!')) intensity += 0.3;
    if (/[A-Z]{3,}/.test(input)) intensity += 0.3; // CAPS
    if (input.length > 200) intensity += 0.2;
    return Math.min(intensity, 1);
  }
  
  private calculateComplexity(input: string): number {
    const sentences = input.split(/[.!?]/).length;
    const avgWordLength = input.split(' ').reduce((acc, word) => acc + word.length, 0) / input.split(' ').length;
    return Math.min((sentences * 0.1) + (avgWordLength * 0.05), 1);
  }
}

// Export default instance with lazy loading
let _styleResonanceCalibrator: StyleResonanceCalibrator | null = null;
export const getStyleResonanceCalibrator = (): StyleResonanceCalibrator => {
  if (!_styleResonanceCalibrator) {
    _styleResonanceCalibrator = new StyleResonanceCalibrator();
  }
  return _styleResonanceCalibrator;
};