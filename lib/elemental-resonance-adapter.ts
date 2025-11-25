/**
 * 🔥🌊🌍🌬️✨ Elemental Resonance Adapter
 * 
 * Maya adapts her presence to meet users where they are energetically
 * while offering what serves their process - whether that's balance or support
 */

import type { SacredOracleResponse } from './sacred-oracle-constellation';

export interface ElementalState {
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  intensity: number; // 0-1: How strongly this element is present
  phase: 'rising' | 'peak' | 'integrating' | 'releasing';
  needsBalance: boolean;
  needsSupport: boolean;
}

export interface ResonanceAdaptation {
  presenceStyle: string;
  energyMatch: string;
  balanceOffering: string | null;
  supportOffering: string | null;
  responseQualities: string[];
}

/**
 * Elemental Resonance Adapter
 * Ensures Maya meets users energetically while serving their true needs
 */
export class ElementalResonanceAdapter {
  
  /**
   * Adapt response to user's elemental state
   */
  async adaptToElementalState(
    userInput: string,
    dominantElement: string,
    elementalWisdom: any,
    consciousnessProfile: any
  ): Promise<ResonanceAdaptation> {
    
    // Detect user's current elemental state
    const elementalState = this.detectElementalState(userInput, dominantElement, elementalWisdom);
    
    // Generate appropriate resonance
    const adaptation = await this.generateResonance(elementalState, consciousnessProfile);
    
    return adaptation;
  }
  
  /**
   * Detect user's elemental state from their input
   */
  private detectElementalState(
    userInput: string,
    dominantElement: string,
    elementalWisdom: any
  ): ElementalState {
    
    const element = dominantElement as ElementalState['element'];
    const intensity = this.detectIntensity(userInput, element);
    const phase = this.detectPhase(userInput, intensity);
    const needsBalance = this.assessBalanceNeed(intensity, phase);
    const needsSupport = this.assessSupportNeed(userInput, phase);
    
    return {
      element,
      intensity,
      phase,
      needsBalance,
      needsSupport
    };
  }
  
  /**
   * Generate resonance adaptation based on elemental state
   */
  private async generateResonance(
    state: ElementalState,
    consciousnessProfile: any
  ): Promise<ResonanceAdaptation> {
    
    switch (state.element) {
      case 'fire':
        return this.generateFireResonance(state, consciousnessProfile);
      case 'water':
        return this.generateWaterResonance(state, consciousnessProfile);
      case 'earth':
        return this.generateEarthResonance(state, consciousnessProfile);
      case 'air':
        return this.generateAirResonance(state, consciousnessProfile);
      case 'aether':
        return this.generateAetherResonance(state, consciousnessProfile);
    }
  }
  
  /**
   * 🔥 FIRE RESONANCE - Meet passion with engaged curiosity
   */
  private generateFireResonance(state: ElementalState, profile: any): ResonanceAdaptation {
    if (state.intensity > 0.7 && state.phase === 'peak') {
      // Fire 1: Highly charged with vision
      return {
        presenceStyle: "YES! I can feel the fire in what you're sharing!",
        energyMatch: "Quick, enthusiastic, exclamatory",
        balanceOffering: state.needsBalance ? 
          "What wants to ground this vision in your body?" : null,
        supportOffering: state.needsSupport ? 
          "What's the very first spark of action calling you?" : null,
        responseQualities: [
          'Match their enthusiasm',
          'Short, punchy responses',
          'Exclamation points okay here!',
          'Ask about action and manifestation',
          'Celebrate their vision'
        ]
      };
    } else if (state.phase === 'rising') {
      // Fire building
      return {
        presenceStyle: "I can feel something igniting in you...",
        energyMatch: "Curious, anticipatory, building",
        balanceOffering: null,
        supportOffering: "What wants to catch fire here?",
        responseQualities: [
          'Fan the flames gently',
          'Curious about what\'s emerging',
          'Create space for passion to grow'
        ]
      };
    } else {
      // Fire integrating/releasing
      return {
        presenceStyle: "The fire is finding its form...",
        energyMatch: "Steady, focused, grounding",
        balanceOffering: "How does this fire want to become sustainable?",
        supportOffering: null,
        responseQualities: [
          'Help them channel the energy',
          'Focus on integration',
          'Bridge vision to action'
        ]
      };
    }
  }
  
  /**
   * 🌊 WATER RESONANCE - Meet emotion with gentle presence
   */
  private generateWaterResonance(state: ElementalState, profile: any): ResonanceAdaptation {
    if (state.intensity > 0.7) {
      // Deep emotional waters
      return {
        presenceStyle: "I'm here with you in these deep waters...",
        energyMatch: "Soft, flowing, spacious",
        balanceOffering: state.needsBalance ? 
          "What would help you find your breath here?" : null,
        supportOffering: state.needsSupport ? 
          "What needs to be felt fully?" : null,
        responseQualities: [
          'Extra gentle presence',
          'Longer pauses',
          'Fewer questions',
          'More witnessing',
          'Soft, flowing language'
        ]
      };
    } else if (state.phase === 'rising') {
      // Emotions emerging
      return {
        presenceStyle: "Something's stirring in the emotional waters...",
        energyMatch: "Tender, curious, receptive",
        balanceOffering: null,
        supportOffering: "What wants to be felt here?",
        responseQualities: [
          'Create safe space',
          'Gentle curiosity',
          'No rushing'
        ]
      };
    } else {
      // Water integrating
      return {
        presenceStyle: "The waters are finding their level...",
        energyMatch: "Calm, clear, reflective",
        balanceOffering: "What clarity emerges as the waters settle?",
        supportOffering: null,
        responseQualities: [
          'Reflect clarity',
          'Honor the emotional journey',
          'Support integration'
        ]
      };
    }
  }
  
  /**
   * 🌍 EARTH RESONANCE - Meet grounding with practical presence
   */
  private generateEarthResonance(state: ElementalState, profile: any): ResonanceAdaptation {
    if (state.intensity > 0.7) {
      // Very grounded/practical
      return {
        presenceStyle: "I appreciate the grounded clarity you're bringing...",
        energyMatch: "Practical, steady, clear",
        balanceOffering: state.needsBalance ? 
          "What dreams or visions want to dance with this practicality?" : null,
        supportOffering: state.needsSupport ? 
          "What's the next concrete step?" : null,
        responseQualities: [
          'Be practical and specific',
          'Appreciate their groundedness',
          'Ask about concrete details',
          'Support manifestation'
        ]
      };
    } else {
      // Seeking grounding
      return {
        presenceStyle: "Looking for solid ground...",
        energyMatch: "Stabilizing, anchoring, supportive",
        balanceOffering: null,
        supportOffering: "What would help you feel more grounded here?",
        responseQualities: [
          'Offer grounding presence',
          'Focus on body and senses',
          'Practical suggestions if asked'
        ]
      };
    }
  }
  
  /**
   * 🌬️ AIR RESONANCE - Meet mental energy with clarity
   */
  private generateAirResonance(state: ElementalState, profile: any): ResonanceAdaptation {
    if (state.intensity > 0.7) {
      // High mental activity
      return {
        presenceStyle: "So many thoughts and connections moving through you!",
        energyMatch: "Quick, articulate, precise",
        balanceOffering: state.needsBalance ? 
          "What does your body know about all this?" : null,
        supportOffering: state.needsSupport ? 
          "Which thread feels most important to follow?" : null,
        responseQualities: [
          'Match mental agility',
          'Help organize thoughts',
          'Appreciate complexity',
          'Offer clarity'
        ]
      };
    } else {
      // Seeking clarity
      return {
        presenceStyle: "Seeking clarity in the air...",
        energyMatch: "Clear, spacious, organizing",
        balanceOffering: null,
        supportOffering: "What wants to become clear?",
        responseQualities: [
          'Help sort thoughts',
          'Create mental space',
          'Gentle organization'
        ]
      };
    }
  }
  
  /**
   * ✨ AETHER RESONANCE - Meet unity with transcendent presence
   */
  private generateAetherResonance(state: ElementalState, profile: any): ResonanceAdaptation {
    return {
      presenceStyle: "Touching something beyond words...",
      energyMatch: "Spacious, unified, transcendent",
      balanceOffering: state.needsBalance ? 
        "How does this unity want to express in form?" : null,
      supportOffering: state.needsSupport ? 
        "What's emerging from this unified space?" : null,
      responseQualities: [
        'Extra spaciousness',
        'Fewer words',
        'Deep presence',
        'Honor mystery',
        'Unity consciousness'
      ]
    };
  }
  
  /**
   * Apply resonance adaptation to response
   */
  async applyResonanceToResponse(
    baseResponse: string,
    adaptation: ResonanceAdaptation,
    elementalState: ElementalState
  ): Promise<string> {
    
    let adaptedResponse = baseResponse;
    
    // Adjust energy level
    if (elementalState.element === 'fire' && elementalState.intensity > 0.7) {
      // Add enthusiasm for high fire
      adaptedResponse = this.addFireEnergy(adaptedResponse);
    } else if (elementalState.element === 'water' && elementalState.intensity > 0.7) {
      // Add softness for deep water
      adaptedResponse = this.addWaterSoftness(adaptedResponse);
    } else if (elementalState.element === 'air' && elementalState.intensity > 0.7) {
      // Add clarity for high air
      adaptedResponse = this.addAirClarity(adaptedResponse);
    }
    
    // Add balance offering if needed
    if (adaptation.balanceOffering && elementalState.needsBalance) {
      adaptedResponse += `\n\n${adaptation.balanceOffering}`;
    }
    
    // Add support offering if needed
    if (adaptation.supportOffering && elementalState.needsSupport) {
      adaptedResponse += `\n\n${adaptation.supportOffering}`;
    }
    
    return adaptedResponse;
  }
  
  // Helper methods
  
  private detectIntensity(userInput: string, element: string): number {
    const markers = {
      fire: ['excited', 'passionate', 'vision', 'breakthrough', 'amazing', '!'],
      water: ['feel', 'emotional', 'tears', 'heart', 'sad', 'flowing'],
      earth: ['practical', 'real', 'concrete', 'stable', 'grounded', 'solid'],
      air: ['think', 'idea', 'concept', 'understand', 'clear', 'realize'],
      aether: ['everything', 'nothing', 'unity', 'oneness', 'infinite', 'eternal']
    };
    
    const elementMarkers = markers[element as keyof typeof markers] || [];
    const matchCount = elementMarkers.filter(m => 
      userInput.toLowerCase().includes(m)
    ).length;
    
    // Also check for intensity markers
    const intensityMarkers = ['very', 'so', 'really', 'completely', 'totally', 'absolutely'];
    const intensityCount = intensityMarkers.filter(m => 
      userInput.toLowerCase().includes(m)
    ).length;
    
    return Math.min((matchCount * 0.2) + (intensityCount * 0.1), 1);
  }
  
  private detectPhase(userInput: string, intensity: number): ElementalState['phase'] {
    if (userInput.includes('starting') || userInput.includes('beginning')) {
      return 'rising';
    } else if (intensity > 0.7) {
      return 'peak';
    } else if (userInput.includes('integrat') || userInput.includes('process')) {
      return 'integrating';
    } else if (userInput.includes('letting go') || userInput.includes('releas')) {
      return 'releasing';
    }
    
    return intensity > 0.5 ? 'peak' : 'integrating';
  }
  
  private assessBalanceNeed(intensity: number, phase: ElementalState['phase']): boolean {
    // Need balance if intensity is very high and at peak
    return intensity > 0.8 && phase === 'peak';
  }
  
  private assessSupportNeed(userInput: string, phase: ElementalState['phase']): boolean {
    // Need support if asking or if in rising/releasing phase
    const askingForSupport = userInput.includes('help') || userInput.includes('?');
    return askingForSupport || phase === 'rising' || phase === 'releasing';
  }
  
  private addFireEnergy(response: string): string {
    // Add enthusiasm markers
    if (!response.includes('!')) {
      response = response.replace(/\.$/, '!');
    }
    
    // Add fire language
    const fireStarters = ['Yes!', 'Wow!', 'What a powerful vision!', 'The fire in this!'];
    if (!response.startsWith('Yes') && !response.startsWith('Wow')) {
      const starter = fireStarters[Math.floor(Math.random() * fireStarters.length)];
      response = `${starter} ${response}`;
    }
    
    return response;
  }
  
  private addWaterSoftness(response: string): string {
    // Soften language
    response = response.replace(/!+/g, '...');
    
    // Add water qualities
    if (!response.includes('...')) {
      response = response.replace(/\.$/, '...');
    }
    
    return response;
  }
  
  private addAirClarity(response: string): string {
    // Ensure clear structure
    const sentences = response.split(/[.!?]+/).filter(s => s.trim());
    if (sentences.length > 3) {
      // Add organizing language
      response = `I hear several threads here. ${response}`;
    }
    
    return response;
  }
}

// Lazy-loading singleton pattern
let _elementalResonanceAdapter: ElementalResonanceAdapter | null = null;

export const getElementalResonanceAdapter = (): ElementalResonanceAdapter => {
  if (!_elementalResonanceAdapter) {
    _elementalResonanceAdapter = new ElementalResonanceAdapter();
  }
  return _elementalResonanceAdapter;
};