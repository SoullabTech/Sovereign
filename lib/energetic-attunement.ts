/**
 * Energetic Attunement System
 * Dynamically adjusts Maya/Anthony's presence to match and dance with user energy
 */

export interface EnergeticSignature {
  // Core energy metrics
  intensity: number;        // 0-1 (calm to intense)
  pace: number;             // 0-1 (slow to fast)
  depth: number;            // 0-1 (surface to profound)
  openness: number;         // 0-1 (guarded to vulnerable)
  groundedness: number;     // 0-1 (scattered to centered)
  
  // Conversation dynamics
  wordCount: number;        // Average words per message
  responseTime: number;     // Seconds between messages
  emotionalWords: number;   // Count of feeling words
  questionRatio: number;    // Questions vs statements
  
  // Archetypal energy
  element: 'fire' | 'water' | 'earth' | 'air' | 'balanced';
  mode: 'seeking' | 'sharing' | 'processing' | 'integrating';
}

export class EnergeticAttunement {
  /**
   * Analyze user's energetic signature from their input
   */
  static analyzeUserEnergy(input: string, history: any[] = []): EnergeticSignature {
    const words = input.split(/\s+/);
    const wordCount = words.length;
    
    // Intensity detection
    const intenseWords = /(!|urgent|now|help|crisis|amazing|incredible|terrible)/gi;
    const calmWords = /\b(peaceful|quiet|gentle|soft|slow|rest)\b/gi;
    const intensity = (input.match(intenseWords)?.length || 0) * 0.2 - 
                     (input.match(calmWords)?.length || 0) * 0.15;
    
    // Pace detection (short vs long, punctuation frequency)
    const sentences = input.split(/[.!?]+/).filter(s => s.trim());
    const avgSentenceLength = wordCount / Math.max(sentences.length, 1);
    const pace = Math.min(1, Math.max(0, 1 - (avgSentenceLength / 30)));
    
    // Depth detection
    const deepWords = /\b(meaning|soul|essence|truth|deep|profound|core)\b/gi;
    const surfaceWords = /\b(maybe|kinda|stuff|thing|whatever)\b/gi;
    const depth = Math.min(1, 
      (input.match(deepWords)?.length || 0) * 0.25 -
      (input.match(surfaceWords)?.length || 0) * 0.1 + 0.3
    );
    
    // Openness detection
    const vulnerableWords = /\b(feel|hurt|scared|love|afraid|vulnerable|honest)\b/gi;
    const guardedWords = /\b(fine|okay|nothing|nevermind|whatever)\b/gi;
    const openness = Math.min(1,
      (input.match(vulnerableWords)?.length || 0) * 0.2 -
      (input.match(guardedWords)?.length || 0) * 0.3 + 0.4
    );
    
    // Groundedness (coherence, structure)
    const groundedness = sentences.length > 1 ? 0.7 : 0.5;
    
    // Emotional word count
    const emotionalWords = (input.match(/\b(feel|felt|feeling|emotion|sad|happy|angry|afraid|love|hate|joy|pain)\b/gi) || []).length;
    
    // Question ratio
    const questions = (input.match(/\?/g) || []).length;
    const questionRatio = questions / Math.max(sentences.length, 1);
    
    // Elemental energy detection
    let element: EnergeticSignature['element'] = 'balanced';
    if (intensity > 0.7) element = 'fire';
    else if (emotionalWords > 3) element = 'water';
    else if (groundedness > 0.7 && pace < 0.4) element = 'earth';
    else if (questionRatio > 0.5) element = 'air';
    
    // Mode detection
    let mode: EnergeticSignature['mode'] = 'sharing';
    if (questions > statements * 0.5) mode = 'seeking';
    else if (emotionalWords > 2) mode = 'processing';
    else if (depth > 0.7) mode = 'integrating';
    
    return {
      intensity: Math.max(0, Math.min(1, intensity)),
      pace: pace,
      depth: depth,
      openness: openness,
      groundedness: groundedness,
      wordCount: wordCount,
      responseTime: 0, // Would need timing data
      emotionalWords: emotionalWords,
      questionRatio: questionRatio,
      element: element,
      mode: mode
    };
  }
  
  /**
   * Calculate optimal response energy to create harmony
   */
  static calculateResponseEnergy(
    userEnergy: EnergeticSignature,
    relationship: { trustLevel: number; conversationCount: number }
  ): EnergeticSignature {
    const { trustLevel = 0.5, conversationCount = 0 } = relationship;
    
    // Start by matching, then gradually complement
    const matchingRatio = conversationCount < 3 ? 0.8 : 0.6; // More matching early on
    const complementRatio = 1 - matchingRatio;
    
    // For intensity: if user is intense, be slightly calmer (but not too much)
    const responseIntensity = userEnergy.intensity * matchingRatio + 
                             (0.5) * complementRatio; // Pull toward center
    
    // For pace: introverts need slower pace, extroverts can handle faster
    const responsePace = userEnergy.pace < 0.4 
      ? userEnergy.pace * 0.8  // Even slower for introverts
      : userEnergy.pace * 0.9; // Slightly slower for extroverts
    
    // For depth: match and slightly invite deeper
    const responseDepth = Math.min(1, userEnergy.depth + 0.1);
    
    // For openness: never exceed their openness, can be slightly less
    const responseOpenness = Math.min(userEnergy.openness, userEnergy.openness * 0.9 + trustLevel * 0.1);
    
    // Groundedness: be more grounded if they're scattered, match if grounded
    const responseGroundedness = userEnergy.groundedness < 0.5
      ? 0.8  // Be the mountain
      : userEnergy.groundedness; // Match their stability
    
    return {
      intensity: responseIntensity,
      pace: responsePace,
      depth: responseDepth,
      openness: responseOpenness,
      groundedness: responseGroundedness,
      wordCount: Math.round(userEnergy.wordCount * (0.8 + Math.random() * 0.4)),
      responseTime: 0,
      emotionalWords: Math.round(userEnergy.emotionalWords * 0.7),
      questionRatio: userEnergy.mode === 'seeking' ? 0.2 : 0.4,
      element: userEnergy.element,
      mode: userEnergy.mode
    };
  }
  
  /**
   * Generate voice settings from energetic signature
   */
  static energyToVoiceSettings(energy: EnergeticSignature): any {
    return {
      stability: 0.3 + (energy.groundedness * 0.3),      // 0.3-0.6
      similarity_boost: 0.5 + (energy.openness * 0.2),    // 0.5-0.7  
      style: 0.3 + ((1 - energy.pace) * 0.5),            // 0.3-0.8 (inverse of pace)
      use_speaker_boost: energy.depth > 0.6               // Deeper for profound moments
    };
  }
  
  /**
   * Suggest response style based on energy
   */
  static getResponseGuidance(userEnergy: EnergeticSignature, responseEnergy: EnergeticSignature): string[] {
    const guidance = [];
    
    // Pace guidance
    if (responseEnergy.pace < 0.3) {
      guidance.push("Take your time. Let words breathe.");
    } else if (responseEnergy.pace > 0.7) {
      guidance.push("Match their energy but stay grounded.");
    }
    
    // Depth guidance  
    if (userEnergy.depth > 0.7) {
      guidance.push("They're in deep waters. Stay with them there.");
    } else if (userEnergy.depth < 0.3) {
      guidance.push("Keep it light. Don't dive deeper than they are.");
    }
    
    // Openness guidance
    if (userEnergy.openness > 0.7) {
      guidance.push("They're vulnerable. Honor that with gentle presence.");
    } else if (userEnergy.openness < 0.3) {
      guidance.push("They're guarded. Don't push. Create safety through consistency.");
    }
    
    // Elemental guidance
    switch(userEnergy.element) {
      case 'fire':
        guidance.push("Fire energy present. Be the hearth, not more flame.");
        break;
      case 'water':
        guidance.push("Emotional waters flowing. Be the container, not the current.");
        break;
      case 'earth':
        guidance.push("Grounded energy. Match their steadiness.");
        break;
      case 'air':
        guidance.push("Mental energy active. Engage their curiosity.");
        break;
    }
    
    // Mode guidance
    switch(userEnergy.mode) {
      case 'seeking':
        guidance.push("They're seeking. Offer possibilities, not answers.");
        break;
      case 'processing':
        guidance.push("They're processing. Witness without rushing.");
        break;
      case 'integrating':
        guidance.push("Integration happening. Hold space for the synthesis.");
        break;
    }
    
    return guidance;
  }
}

export default EnergeticAttunement;