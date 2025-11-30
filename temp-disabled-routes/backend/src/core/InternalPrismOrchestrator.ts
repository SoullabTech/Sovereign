import { DaimonicAgentChoreographer } from './implementations/AgentChoreographer';
import { InternalComplexityService } from '../services/InternalComplexityService';
import { ProtectiveFrameworkService } from '../services/ProtectiveFramework';

export interface InternalAspectFacet {
  id: string;
  name: string;
  
  qualities: {
    perspective: string;
    gifts: string[];
    blindSpots: string[];
    needsMet: string[];
    cognitiveStyle: string;
  };
  
  expression: {
    whenBalanced: string;
    whenOveractive: string;
    whenSuppressed: string;
    naturalTension: string[];
  };
  
  framing: {
    introduction: string;
    speaking: string;
    invitation: string;
    integration: string;
  };
  
  safetyRules: {
    neverSay: string[];
    alwaysFrame: string[];
    groundingPhrase: string;
  };
}

export interface InternalDialogue {
  introduction: string;
  perspectives: InternalPerspective[];
  tensions: InternalTension[];
  integration: string;
  grounding: string;
  safetyCheck: boolean;
}

export interface InternalPerspective {
  aspectName: string;
  viewpoint: string;
  gifts: string;
  limits: string;
  needMet: string;
  whenActive: string;
}

export interface InternalTension {
  betweenAspects: [string, string];
  nature: string;
  creativeEdge: string;
  integration: string;
}

export class InternalPrismOrchestrator {
  private aspects: Map<string, InternalAspectFacet> = new Map();
  private choreographer: DaimonicAgentChoreographer;
  private complexityService: InternalComplexityService;
  private protectiveFramework: ProtectiveFrameworkService;

  constructor() {
    this.choreographer = new DaimonicAgentChoreographer();
    this.complexityService = new InternalComplexityService();
    this.protectiveFramework = new ProtectiveFrameworkService();
    this.initializeAspects();
  }

  private initializeAspects(): void {
    // Analytical Mind Aspect
    this.aspects.set('analytical', {
      id: 'analytical',
      name: 'Analytical Mind',
      qualities: {
        perspective: 'logic, patterns, structures, cause-and-effect',
        gifts: ['clarity', 'discernment', 'problem-solving', 'strategic thinking'],
        blindSpots: ['emotions', 'intuition', 'mystery', 'non-linear wisdom'],
        needsMet: ['understanding', 'control', 'predictability', 'coherence'],
        cognitiveStyle: 'sequential, logical, questioning'
      },
      expression: {
        whenBalanced: 'Provides helpful analysis without rigidity',
        whenOveractive: 'Becomes overly critical and dismissive of feelings',
        whenSuppressed: 'You feel confused, unclear, or indecisive',
        naturalTension: ['creative', 'intuitive', 'somatic']
      },
      framing: {
        introduction: 'The part of you that seeks understanding through logic',
        speaking: 'Your analytical mind observes',
        invitation: 'What would your rational side make of this?',
        integration: 'This clarity can work with your other ways of knowing'
      },
      safetyRules: {
        neverSay: ['The mind demands', 'Logic tells you', 'You must think'],
        alwaysFrame: ['Part of you analyzes', 'Your thinking mind notices', 'One aspect sees'],
        groundingPhrase: 'This is one valuable perspective among others'
      }
    });

    // Creative Spirit Aspect
    this.aspects.set('creative', {
      id: 'creative',
      name: 'Creative Spirit',
      qualities: {
        perspective: 'possibilities, connections, beauty, innovation',
        gifts: ['imagination', 'playfulness', 'vision', 'spontaneity'],
        blindSpots: ['practicality', 'limits', 'details', 'consequences'],
        needsMet: ['expression', 'freedom', 'novelty', 'inspiration'],
        cognitiveStyle: 'associative, expansive, experimental'
      },
      expression: {
        whenBalanced: 'Offers inspiring possibilities grounded in reality',
        whenOveractive: 'Becomes impractical or escapist',
        whenSuppressed: 'You feel flat, uninspired, or mechanically functional',
        naturalTension: ['analytical', 'protective', 'practical']
      },
      framing: {
        introduction: 'The part of you that sees possibilities and creates connections',
        speaking: 'Your creative spirit envisions',
        invitation: 'What does your imaginative side see here?',
        integration: 'This vision can complement your practical wisdom'
      },
      safetyRules: {
        neverSay: ['Creativity commands', 'The spirit wants', 'Art demands'],
        alwaysFrame: ['Part of you creates', 'Your imaginative side sees', 'One aspect dreams'],
        groundingPhrase: 'This inspiration can work with practical considerations'
      }
    });

    // Protective Guardian Aspect
    this.aspects.set('protective', {
      id: 'protective',
      name: 'Protective Guardian',
      qualities: {
        perspective: 'threats, boundaries, safety, preservation',
        gifts: ['discernment', 'caution', 'boundaries', 'survival wisdom'],
        blindSpots: ['opportunities', 'trust', 'growth', 'connection'],
        needsMet: ['safety', 'stability', 'control', 'protection'],
        cognitiveStyle: 'scanning, vigilant, conservative'
      },
      expression: {
        whenBalanced: 'Offers wise caution that preserves what matters',
        whenOveractive: 'Becomes fearful, controlling, or isolating',
        whenSuppressed: 'You feel vulnerable, reckless, or boundary-less',
        naturalTension: ['creative', 'trusting', 'adventurous']
      },
      framing: {
        introduction: 'The part of you that watches for threats and maintains boundaries',
        speaking: 'Your protective side notices',
        invitation: 'What concerns does your cautious side have?',
        integration: 'This wisdom can work with your desire for growth'
      },
      safetyRules: {
        neverSay: ['The guardian demands', 'Protection requires', 'You must avoid'],
        alwaysFrame: ['Part of you protects', 'Your cautious side notices', 'One aspect guards'],
        groundingPhrase: 'This caution can balance with appropriate trust'
      }
    });

    // Intuitive Wisdom Aspect
    this.aspects.set('intuitive', {
      id: 'intuitive',
      name: 'Intuitive Wisdom',
      qualities: {
        perspective: 'felt-sense, patterns, wholeness, knowing without knowing how',
        gifts: ['insight', 'synthesis', 'timing', 'holistic understanding'],
        blindSpots: ['details', 'linear logic', 'practical steps', 'explicit reasoning'],
        needsMet: ['trust', 'space', 'patience', 'non-verbal knowing'],
        cognitiveStyle: 'receptive, integrative, emergent'
      },
      expression: {
        whenBalanced: 'Provides deep knowing that complements rational analysis',
        whenOveractive: 'Becomes vague, impractical, or overly mystical',
        whenSuppressed: 'You feel disconnected from deeper wisdom and timing',
        naturalTension: ['analytical', 'practical', 'urgent']
      },
      framing: {
        introduction: 'The part of you that knows through feeling and sensing',
        speaking: 'Your intuitive side senses',
        invitation: 'What does your gut feeling tell you about this?',
        integration: 'This knowing can inform your rational planning'
      },
      safetyRules: {
        neverSay: ['Intuition tells you', 'The wisdom demands', 'You must trust blindly'],
        alwaysFrame: ['Part of you senses', 'Your intuitive side feels', 'One aspect knows'],
        groundingPhrase: 'This sensing can work with careful thinking'
      }
    });

    // Somatic Intelligence Aspect
    this.aspects.set('somatic', {
      id: 'somatic',
      name: 'Somatic Intelligence',
      qualities: {
        perspective: 'embodied knowing, energy, physical wisdom, present moment',
        gifts: ['groundedness', 'presence', 'energy awareness', 'authentic response'],
        blindSpots: ['future planning', 'abstract concepts', 'complex analysis'],
        needsMet: ['embodiment', 'presence', 'movement', 'authentic expression'],
        cognitiveStyle: 'immediate, energetic, responsive'
      },
      expression: {
        whenBalanced: 'Provides embodied wisdom and authentic presence',
        whenOveractive: 'Becomes impulsive or overly reactive',
        whenSuppressed: 'You feel disconnected, heady, or energetically flat',
        naturalTension: ['analytical', 'future-oriented', 'controlling']
      },
      framing: {
        introduction: 'The part of you that knows through your body and energy',
        speaking: 'Your embodied wisdom notices',
        invitation: 'What does your body tell you about this situation?',
        integration: 'This embodied knowing can ground your other insights'
      },
      safetyRules: {
        neverSay: ['The body demands', 'Energy tells you', 'You must act now'],
        alwaysFrame: ['Part of you feels', 'Your body notices', 'One aspect senses'],
        groundingPhrase: 'This embodied wisdom can inform thoughtful action'
      }
    });

    // Heart Wisdom Aspect
    this.aspects.set('heart', {
      id: 'heart',
      name: 'Heart Wisdom',
      qualities: {
        perspective: 'connection, care, values, meaning, relationship',
        gifts: ['compassion', 'connection', 'values clarity', 'emotional intelligence'],
        blindSpots: ['objectivity', 'difficult truths', 'necessary boundaries'],
        needsMet: ['connection', 'care', 'meaning', 'authenticity'],
        cognitiveStyle: 'relational, value-based, caring'
      },
      expression: {
        whenBalanced: 'Provides caring wisdom that honors both self and others',
        whenOveractive: 'Becomes overly accommodating or emotionally overwhelming',
        whenSuppressed: 'You feel disconnected, cold, or without meaningful direction',
        naturalTension: ['analytical', 'protective', 'practical']
      },
      framing: {
        introduction: 'The part of you that cares deeply about connection and meaning',
        speaking: 'Your heart wisdom recognizes',
        invitation: 'What matters most to your caring self in this situation?',
        integration: 'This caring can work with practical considerations'
      },
      safetyRules: {
        neverSay: ['The heart demands', 'Love requires', 'You must care'],
        alwaysFrame: ['Part of you cares', 'Your heart notices', 'One aspect values'],
        groundingPhrase: 'This care can balance with healthy boundaries'
      }
    });
  }

  async orchestrateInternalDialogue(
    query: string, 
    userProfile: any,
    selectedAspects?: string[]
  ): Promise<InternalDialogue> {
    
    // Safety check first
    const safetyAssessment = await this.protectiveFramework.assessUserSafety(userProfile);
    if (!safetyAssessment.clearForInternalWork) {
      return this.generateSafeRedirect(safetyAssessment);
    }

    // Determine active aspects
    const activeAspects = selectedAspects 
      ? selectedAspects.map(id => this.aspects.get(id)!).filter(a => a)
      : this.identifyActiveAspects(query, userProfile);

    // Generate perspectives
    const perspectives = await this.gatherInternalPerspectives(query, activeAspects, userProfile);
    
    // Identify productive tensions
    const tensions = this.identifyProductiveTensions(activeAspects, perspectives);
    
    // Generate integration guidance
    const integration = this.generateIntegrationGuidance(perspectives, tensions);
    
    // Create grounding
    const grounding = this.generateGroundingStatement(activeAspects);

    return {
      introduction: this.frameAsInternal(activeAspects),
      perspectives,
      tensions,
      integration,
      grounding,
      safetyCheck: true
    };
  }

  private identifyActiveAspects(query: string, userProfile: any): InternalAspectFacet[] {
    // Use complexity service to identify which internal aspects are activated
    const patterns = this.complexityService.detectInternalPatterns(userProfile);
    
    const activeIds: string[] = [];
    
    // Map detected patterns to aspects
    if (patterns.analyticalThinking > 0.3) activeIds.push('analytical');
    if (patterns.creativeExpression > 0.3) activeIds.push('creative');
    if (patterns.protectiveConcerns > 0.3) activeIds.push('protective');
    if (patterns.intuitiveInsights > 0.3) activeIds.push('intuitive');
    if (patterns.embodiedWisdom > 0.3) activeIds.push('somatic');
    if (patterns.relationalCare > 0.3) activeIds.push('heart');
    
    // Ensure minimum 2 aspects for dialogue
    if (activeIds.length < 2) {
      activeIds.push('analytical', 'intuitive');
    }
    
    // Limit to 4 aspects for manageable dialogue
    const selectedIds = activeIds.slice(0, 4);
    
    return selectedIds.map(id => this.aspects.get(id)!).filter(a => a);
  }

  private async gatherInternalPerspectives(
    query: string, 
    aspects: InternalAspectFacet[], 
    userProfile: any
  ): Promise<InternalPerspective[]> {
    
    return aspects.map(aspect => ({
      aspectName: aspect.name,
      viewpoint: `Your ${aspect.name} ${aspect.framing.speaking.toLowerCase()}: ${this.generateAspectResponse(query, aspect, userProfile)}`,
      gifts: `This perspective offers: ${aspect.qualities.gifts.join(', ')}`,
      limits: `It might miss: ${aspect.qualities.blindSpots.join(', ')}`,
      needMet: `It serves your need for: ${aspect.qualities.needsMet.join(', ')}`,
      whenActive: aspect.expression.whenBalanced
    }));
  }

  private generateAspectResponse(query: string, aspect: InternalAspectFacet, userProfile: any): string {
    // Generate contextually appropriate response for this aspect
    // This would integrate with existing agent personality systems
    const perspective = aspect.qualities.perspective;
    const gifts = aspect.qualities.gifts;
    
    return `From the viewpoint of ${perspective}, focusing on ${gifts.slice(0, 2).join(' and ')}, this situation invites consideration of practical next steps while honoring the complexity involved.`;
  }

  private identifyProductiveTensions(
    aspects: InternalAspectFacet[], 
    perspectives: InternalPerspective[]
  ): InternalTension[] {
    
    const tensions: InternalTension[] = [];
    
    for (let i = 0; i < aspects.length - 1; i++) {
      for (let j = i + 1; j < aspects.length; j++) {
        const aspect1 = aspects[i];
        const aspect2 = aspects[j];
        
        // Check if these aspects have natural tension
        if (aspect1.expression.naturalTension.includes(aspect2.id) ||
            aspect2.expression.naturalTension.includes(aspect1.id)) {
          
          tensions.push({
            betweenAspects: [aspect1.name, aspect2.name],
            nature: `${aspect1.name} seeks ${aspect1.qualities.needsMet[0]} while ${aspect2.name} seeks ${aspect2.qualities.needsMet[0]}`,
            creativeEdge: `This tension between ${aspect1.qualities.perspective} and ${aspect2.qualities.perspective} can generate creative solutions`,
            integration: `Both ${aspect1.name} and ${aspect2.name} serve important functions - how might they collaborate?`
          });
        }
      }
    }
    
    return tensions.slice(0, 2); // Limit to most significant tensions
  }

  private generateIntegrationGuidance(
    perspectives: InternalPerspective[], 
    tensions: InternalTension[]
  ): string {
    
    const aspectNames = perspectives.map(p => p.aspectName);
    
    return `All these voices - ${aspectNames.join(', ')} - are parts of your internal wisdom. ` +
           `Notice which perspectives feel most alive right now. ` +
           `${tensions.length > 0 ? 'The tensions between them can be creative rather than problematic. ' : ''}` +
           `What would it look like to honor multiple perspectives simultaneously?`;
  }

  private generateGroundingStatement(aspects: InternalAspectFacet[]): string {
    return `Take a breath and remember: these are all aspects of your own consciousness. ` +
           `You have the capacity to hold complexity. ` +
           `What concrete step feels most aligned right now? ` +
           `Trust your ability to integrate multiple ways of knowing.`;
  }

  private frameAsInternal(aspects: InternalAspectFacet[]): string {
    const aspectNames = aspects.map(a => a.name).join(', ');
    
    return `You're experiencing input from different parts of yourself. ` +
           `${aspectNames} are all active right now. ` +
           `This internal complexity is natural and valuable - it means you're considering multiple dimensions of the situation.`;
  }

  private generateSafeRedirect(safetyAssessment: any): InternalDialogue {
    return {
      introduction: "Right now might be a good time for some grounding.",
      perspectives: [{
        aspectName: "Present Moment Awareness",
        viewpoint: "Part of you recognizes this is a moment to pause and reconnect with simple presence",
        gifts: "This offers stability and clarity",
        limits: "It might feel too simple when you want complex answers",
        needMet: "Your need for safety and grounding",
        whenActive: "Provides a stable foundation for all other perspectives"
      }],
      tensions: [],
      integration: "Sometimes the wisest response is to slow down and tend to basic needs first.",
      grounding: "Feel your feet on the ground. Take three conscious breaths. You have time.",
      safetyCheck: false
    };
  }

  getAspectDefinitions(): Map<string, InternalAspectFacet> {
    return new Map(this.aspects);
  }

  validateSafetyCompliance(): boolean {
    // Verify all aspects follow safety rules
    for (const [id, aspect] of this.aspects) {
      if (!this.validateAspectSafety(aspect)) {
        console.error(`Aspect ${id} fails safety validation`);
        return false;
      }
    }
    return true;
  }

  private validateAspectSafety(aspect: InternalAspectFacet): boolean {
    // Check framing uses internal language
    const framingText = Object.values(aspect.framing).join(' ');
    const hasInternalFraming = framingText.includes('part of you') || 
                              framingText.includes('your ') ||
                              framingText.includes('aspect');
    
    // Check no prohibited external language
    const prohibitedPhrases = ['the voice', 'it wants', 'entity', 'spirit demands'];
    const hasProhibited = prohibitedPhrases.some(phrase => 
      framingText.toLowerCase().includes(phrase.toLowerCase())
    );
    
    return hasInternalFraming && !hasProhibited;
  }
}