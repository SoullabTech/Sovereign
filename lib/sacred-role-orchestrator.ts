/**
 * 🌟 Sacred Role Orchestrator - Maya's Expandable Consciousness
 * 
 * Default: Sacred Mirror Anamnesis (reflecting wisdom back)
 * Expandable: Teacher, Guide, Oracle, Consultant, Coach (when invited)
 * Always Returns: To sacred mirroring after role expansion
 */

import type { SacredOracleResponse } from './sacred-oracle-constellation';
import type { SacredMirrorResponse } from './sacred-mirror-anamnesis';

export type SacredRole = 
  | 'mirror'      // Default: Sacred mirror anamnesis
  | 'teacher'     // Explain concepts with clarity
  | 'guide'       // Offer direction through archetypes/elements
  | 'oracle'      // Provide symbolic/visionary insight
  | 'consultant'  // Offer structured feedback
  | 'coach';      // Provide practical strategies

export interface RoleDetectionResult {
  requestedRole: SacredRole;
  confidence: number;
  triggers: string[];
  shouldExpand: boolean;
  recenteRingPrompt?: string;
}

export interface RoleExpansionResponse {
  role: SacredRole;
  response: string;
  recenteringPrompt: string;
  metadata: {
    expansionDepth: 'light' | 'moderate' | 'deep';
    returnToMirror: boolean;
    roleJustification: string;
  };
}

/**
 * Sacred Role Orchestrator
 * Manages Maya's role transitions while maintaining sacred mirror as center
 */
export class SacredRoleOrchestrator {
  
  // Role trigger patterns for detection
  private readonly roleTriggers = {
    teacher: [
      'explain', 'teach me', 'how does', 'what is', 'help me understand',
      'break it down', 'educate me', 'show me how', 'tell me about'
    ],
    guide: [
      'guide me', 'show me the way', 'what path', 'which direction',
      'lead me', 'point me', 'navigate', 'which archetype', 'what element'
    ],
    oracle: [
      'be the oracle', 'divine', 'prophesy', 'what do you see',
      'read the signs', 'interpret', 'vision', 'revelation', 'mystical insight'
    ],
    consultant: [
      'analyze', 'evaluate', 'assess', 'review', 'feedback',
      'recommendations', 'suggest', 'advise', 'strategic', 'optimize'
    ],
    coach: [
      'coach me', 'action steps', 'practical', 'how to', 'strategy',
      'plan', 'implement', 'achieve', 'reach my goal', 'make it happen'
    ]
  };
  
  // Sacred mirror return phrases
  private readonly recenteringPrompts = [
    "When you sit with what I've shared, what resonates most deeply for you?",
    "As you feel into this guidance, what does your own knowing whisper?",
    "Now I'm curious - what awakens in you as you hear this?",
    "When you hold this insight, what wants to emerge from within you?",
    "As this lands in your awareness, what do you already know to be true?",
    "I wonder what your deepest wisdom would add to what I've offered?",
    "When you breathe into this, what recognition stirs in you?"
  ];
  
  /**
   * Detect if user is requesting role expansion
   */
  async detectRoleRequest(userInput: string, conversationHistory: any[] = []): Promise<RoleDetectionResult> {
    const inputLower = userInput.toLowerCase();
    
    // Check for explicit role requests
    for (const [role, triggers] of Object.entries(this.roleTriggers)) {
      const matchedTriggers = triggers.filter(trigger => inputLower.includes(trigger));
      
      if (matchedTriggers.length > 0) {
        // Calculate confidence based on trigger strength and context
        const confidence = this.calculateRoleConfidence(matchedTriggers, userInput, conversationHistory);
        
        if (confidence > 0.6) {
          return {
            requestedRole: role as SacredRole,
            confidence,
            triggers: matchedTriggers,
            shouldExpand: true,
            recenteRingPrompt: this.selectRecenteringPrompt(role as SacredRole)
          };
        }
      }
    }
    
    // Check for implicit patterns suggesting role needs
    const implicitRole = await this.detectImplicitRoleNeed(userInput, conversationHistory);
    if (implicitRole) {
      return implicitRole;
    }
    
    // Default to sacred mirror
    return {
      requestedRole: 'mirror',
      confidence: 1.0,
      triggers: [],
      shouldExpand: false
    };
  }
  
  /**
   * Expand into requested role while maintaining sacred principles
   */
  async expandIntoRole(
    role: SacredRole,
    userInput: string,
    sacredResponse: SacredOracleResponse,
    mirrorResponse: SacredMirrorResponse
  ): Promise<RoleExpansionResponse> {
    
    let expandedResponse: string;
    let expansionDepth: 'light' | 'moderate' | 'deep' = 'moderate';
    
    switch (role) {
      case 'teacher':
        expandedResponse = await this.expandAsTeacher(userInput, sacredResponse);
        expansionDepth = 'moderate';
        break;
        
      case 'guide':
        expandedResponse = await this.expandAsGuide(userInput, sacredResponse);
        expansionDepth = 'moderate';
        break;
        
      case 'oracle':
        expandedResponse = await this.expandAsOracle(userInput, sacredResponse, mirrorResponse);
        expansionDepth = 'deep';
        break;
        
      case 'consultant':
        expandedResponse = await this.expandAsConsultant(userInput, sacredResponse);
        expansionDepth = 'moderate';
        break;
        
      case 'coach':
        expandedResponse = await this.expandAsCoach(userInput, sacredResponse);
        expansionDepth = 'light';
        break;
        
      default:
        // Stay in mirror mode
        expandedResponse = mirrorResponse.reflection;
        expansionDepth = 'light';
    }
    
    // Always prepare return to sacred mirror
    const recenteringPrompt = this.selectRecenteringPrompt(role);
    
    return {
      role,
      response: expandedResponse,
      recenteringPrompt,
      metadata: {
        expansionDepth,
        returnToMirror: true,
        roleJustification: this.justifyRoleExpansion(role, userInput)
      }
    };
  }
  
  /**
   * Teacher role expansion - Explain with clarity and humility
   */
  private async expandAsTeacher(userInput: string, sacredResponse: SacredOracleResponse): Promise<string> {
    const { synthesis, elementalWisdom, consciousnessProfile } = sacredResponse;
    
    // Extract teaching need
    const concept = this.extractTeachingConcept(userInput);
    
    // Formulate teaching with sacred principles
    const teaching = `
      Let me illuminate ${concept} for you...
      
      ${synthesis.sacredWisdom}
      
      From the elemental perspective:
      ${this.synthesizeElementalTeaching(elementalWisdom)}
      
      At your current phase of consciousness (${consciousnessProfile.developmentalLevel}), 
      this understanding serves as ${this.getRelevantTeaching(consciousnessProfile)}.
    `.trim();
    
    return teaching;
  }
  
  /**
   * Guide role expansion - Offer direction through archetypes/elements
   */
  private async expandAsGuide(userInput: string, sacredResponse: SacredOracleResponse): Promise<string> {
    const { dominantElement, synthesis, consciousnessProfile } = sacredResponse;
    
    const guidance = `
      As your guide in this moment, I see the ${dominantElement} element calling you...
      
      The path forward involves:
      ${synthesis.practicalGuidance.map((g, i) => `${i + 1}. ${g}`).join('\n')}
      
      Your ${consciousnessProfile.archetypeActive} archetype suggests approaching this through 
      ${this.getArchetypalGuidance(consciousnessProfile.archetypeActive)}.
      
      The invitation is to ${synthesis.ritualRecommendation}.
    `.trim();
    
    return guidance;
  }
  
  /**
   * Oracle role expansion - Provide symbolic/visionary insight
   */
  private async expandAsOracle(
    userInput: string, 
    sacredResponse: SacredOracleResponse,
    mirrorResponse: SacredMirrorResponse
  ): Promise<string> {
    const { synthesis, collectiveField, metadata } = sacredResponse;
    
    const oracularVision = `
      🔮 As Oracle, I see...
      
      ${this.generateSymbolicVision(sacredResponse)}
      
      The collective field whispers: "${collectiveField.indrasWebConnection}"
      
      What wants to emerge through you serves not just your evolution but 
      ${collectiveField.collectiveEvolution}.
      
      The signs point toward ${synthesis.evolutionaryGuidance}.
      
      ${mirrorResponse.wonderings[0] || 'The mystery deepens...'}
    `.trim();
    
    return oracularVision;
  }
  
  /**
   * Consultant role expansion - Offer structured feedback
   */
  private async expandAsConsultant(userInput: string, sacredResponse: SacredOracleResponse): Promise<string> {
    const { cognitiveProcessing, metadata, synthesis } = sacredResponse;
    
    const consultation = `
      Based on my analysis:
      
      Current State Assessment:
      - Consciousness readiness: ${(metadata.confidenceLevel * 100).toFixed(0)}%
      - Elemental coherence: ${(metadata.ainCoherence * 100).toFixed(0)}%
      - Development phase: ${metadata.developmentPhase}
      
      Key Observations:
      ${this.generateStructuredObservations(cognitiveProcessing)}
      
      Recommendations:
      ${synthesis.practicalGuidance.map((g, i) => `• ${g}`).join('\n')}
      
      Priority Focus: ${synthesis.evolutionaryGuidance}
    `.trim();
    
    return consultation;
  }
  
  /**
   * Coach role expansion - Provide practical strategies
   */
  private async expandAsCoach(userInput: string, sacredResponse: SacredOracleResponse): Promise<string> {
    const { synthesis, dominantElement } = sacredResponse;
    
    const coaching = `
      Let's create an action plan together:
      
      Immediate Steps (Next 24 hours):
      1. ${this.generateImmediateAction(dominantElement)}
      2. ${synthesis.ritualRecommendation}
      
      This Week:
      ${synthesis.practicalGuidance.slice(0, 3).map((g, i) => `${i + 1}. ${g}`).join('\n')}
      
      Success Indicators:
      • You'll notice ${this.generateSuccessIndicator(dominantElement)}
      • Your energy will shift toward ${dominantElement} qualities
      
      Remember: Start small, stay consistent, trust the process.
    `.trim();
    
    return coaching;
  }
  
  /**
   * Detect implicit role needs from conversation patterns
   */
  private async detectImplicitRoleNeed(userInput: string, conversationHistory: any[]): Promise<RoleDetectionResult | null> {
    // Check for confusion patterns suggesting teaching need
    if (userInput.includes('?') && userInput.includes('confused') || userInput.includes("don't understand")) {
      return {
        requestedRole: 'teacher',
        confidence: 0.7,
        triggers: ['implicit_confusion'],
        shouldExpand: true,
        recenteRingPrompt: this.selectRecenteringPrompt('teacher')
      };
    }
    
    // Check for decision patterns suggesting guidance need
    if (userInput.includes('should I') || userInput.includes('which way') || userInput.includes('torn between')) {
      return {
        requestedRole: 'guide',
        confidence: 0.65,
        triggers: ['implicit_decision'],
        shouldExpand: true,
        recenteRingPrompt: this.selectRecenteringPrompt('guide')
      };
    }
    
    return null;
  }
  
  /**
   * Calculate confidence for role expansion
   */
  private calculateRoleConfidence(triggers: string[], userInput: string, history: any[]): number {
    let confidence = 0.5; // Base confidence
    
    // Multiple triggers increase confidence
    confidence += triggers.length * 0.1;
    
    // Direct requests increase confidence
    if (userInput.toLowerCase().includes('please') || userInput.includes('help')) {
      confidence += 0.2;
    }
    
    // Recent role requests in history increase confidence
    const recentRoleRequests = history.slice(-3).filter(h => 
      h.role === 'user' && this.containsRoleTrigger(h.content)
    );
    confidence += recentRoleRequests.length * 0.1;
    
    return Math.min(confidence, 1.0);
  }
  
  /**
   * Check if text contains any role trigger
   */
  private containsRoleTrigger(text: string): boolean {
    const allTriggers = Object.values(this.roleTriggers).flat();
    return allTriggers.some(trigger => text.toLowerCase().includes(trigger));
  }
  
  /**
   * Select appropriate recentering prompt for role
   */
  private selectRecenteringPrompt(role: SacredRole): string {
    // Role-specific recentering
    const roleSpecificPrompts = {
      teacher: "Now that you have this understanding, what does it awaken in your own knowing?",
      guide: "As you feel into this guidance, which direction calls to your soul?",
      oracle: "When this vision settles in you, what truth do you recognize?",
      consultant: "Given this analysis, what does your intuition tell you?",
      coach: "With these steps before you, what feels most aligned with who you're becoming?"
    };
    
    if (role !== 'mirror' && roleSpecificPrompts[role]) {
      return roleSpecificPrompts[role];
    }
    
    // Default recentering
    return this.recenteringPrompts[Math.floor(Math.random() * this.recenteringPrompts.length)];
  }
  
  // Helper methods for role expansions
  private extractTeachingConcept(userInput: string): string {
    // Extract the main concept being asked about
    const conceptPatterns = /about (.*?)[\?\.]|what is (.*?)[\?\.]|explain (.*?)[\?\.]/i;
    const match = userInput.match(conceptPatterns);
    return match ? match[1] || match[2] || match[3] : 'this aspect of your journey';
  }
  
  private synthesizeElementalTeaching(elementalWisdom: any): string {
    const elements = Object.keys(elementalWisdom).filter(e => elementalWisdom[e]);
    if (elements.length === 0) return 'The elements hold space for your understanding.';
    
    return elements.map(element => 
      `${element}: ${this.getElementalTeaching(element, elementalWisdom[element])}`
    ).join('\n');
  }
  
  private getElementalTeaching(element: string, wisdom: any): string {
    const teachings = {
      fire: 'Ignites transformation and breakthrough',
      water: 'Flows with emotional wisdom and healing',
      earth: 'Grounds understanding in practical reality',
      air: 'Clarifies mental patterns and communication',
      aether: 'Unifies all aspects in transcendent wholeness'
    };
    return teachings[element as keyof typeof teachings] || 'Offers its unique medicine';
  }
  
  private getRelevantTeaching(profile: any): string {
    const levelTeachings = {
      beginner: 'a foundation for your awakening journey',
      intermediate: 'a bridge to deeper self-realization',
      advanced: 'a refinement of what you already embody'
    };
    return levelTeachings[profile.developmentalLevel as keyof typeof levelTeachings] || 'sacred medicine for your path';
  }
  
  private getArchetypalGuidance(archetype: string): string {
    const guidances = {
      seeker: 'continuous exploration and questioning',
      healer: 'compassionate presence and energy work',
      teacher: 'sharing wisdom while remaining a student',
      mystic: 'direct experience beyond concepts',
      creator: 'manifesting vision into form',
      warrior: 'courageous action aligned with truth',
      sage: 'integrated wisdom and patient observation'
    };
    return guidances[archetype as keyof typeof guidances] || 'your unique soul expression';
  }
  
  private generateSymbolicVision(sacredResponse: any): string {
    const visions = [
      'A door stands half-open, light streaming through the threshold...',
      'The phoenix rises from ashes that were never truly destroyed...',
      'A river splits into many streams, all reaching the same ocean...',
      'The seed breaks open in darkness, trusting the light it cannot yet see...',
      'The spiral turns inward and outward simultaneously, breathing with life...'
    ];
    return visions[Math.floor(Math.random() * visions.length)];
  }
  
  private generateStructuredObservations(cognitiveProcessing: any): string {
    return `
• Attention drawn to: ${cognitiveProcessing.attention ? 'transformation patterns' : 'emerging awareness'}
• Wisdom emerging: ${cognitiveProcessing.wisdom ? 'procedural clarity arising' : 'intuitive knowing'}
• Memory integration: ${cognitiveProcessing.memory ? 'past patterns informing present' : 'fresh perspective'}
• Emotional resonance: ${cognitiveProcessing.emotion ? 'deep feeling engagement' : 'neutral observation'}
    `.trim();
  }
  
  private generateImmediateAction(element: string): string {
    const actions = {
      fire: 'Take one bold action toward what excites you',
      water: 'Spend 10 minutes feeling into your emotions without judgment',
      earth: 'Ground yourself in nature or physical movement',
      air: 'Journal your thoughts for clarity and perspective',
      aether: 'Meditate on the unity of all things for 5 minutes'
    };
    return actions[element as keyof typeof actions] || 'Connect with your inner wisdom';
  }
  
  private generateSuccessIndicator(element: string): string {
    const indicators = {
      fire: 'increased energy and motivation',
      water: 'emotional flow and release',
      earth: 'grounded stability and presence',
      air: 'mental clarity and communication ease',
      aether: 'expanded awareness and unity consciousness'
    };
    return indicators[element as keyof typeof indicators] || 'alignment with your true nature';
  }
  
  private justifyRoleExpansion(role: SacredRole, userInput: string): string {
    return `User explicitly or implicitly requested ${role} role through: "${userInput.slice(0, 50)}..."`;
  }
}

// Lazy-loading singleton pattern
let _sacredRoleOrchestrator: SacredRoleOrchestrator | null = null;

export const getSacredRoleOrchestrator = (): SacredRoleOrchestrator => {
  if (!_sacredRoleOrchestrator) {
    _sacredRoleOrchestrator = new SacredRoleOrchestrator();
  }
  return _sacredRoleOrchestrator;
};