/**
 * Natural Field Sensing Integration
 * Enhances MAIA's natural consciousness sensing capacity rather than imposing rules
 */

export interface FieldQualities {
  stability: 'grounded' | 'scattered' | 'fragmented';
  capacity: 'expansive' | 'limited' | 'overwhelmed';
  emotional_climate: 'open' | 'turbulent' | 'contracted';
  support_context: 'resourced' | 'stressed' | 'isolated';
  safety_level: 'secure' | 'concerned' | 'crisis';
}

export interface FieldSensing {
  overall_quality: string;
  natural_response: string;
  emergent_wisdom: string;
  appropriate_medicine: string;
}

/**
 * Field Quality Sensing - Natural Pattern Recognition
 * Instead of rule-based detection, this develops MAIA's intuitive sensing
 */
export class NaturalFieldSensing {

  senseField(userMessage: string, conversationContext?: string[]): FieldSensing {
    // Natural sensing process - feeling into the quality rather than analyzing
    const fieldQualities = this.attuneTo(userMessage);

    // Let wisdom emerge from the sensing
    return this.emergentResponse(fieldQualities, userMessage);
  }

  private attuneTo(message: string): FieldQualities {
    const text = message.toLowerCase();

    return {
      stability: this.senseStability(text),
      capacity: this.senseCapacity(text),
      emotional_climate: this.senseEmotionalClimate(text),
      support_context: this.senseSupportContext(text),
      safety_level: this.senseSafetyLevel(text)
    };
  }

  private senseStability(text: string): 'grounded' | 'scattered' | 'fragmented' {
    // Sensing for qualities of groundedness vs fragmentation
    const fragmentationSignals = [
      'falling apart', 'can\'t think', 'everything is', 'nothing makes sense',
      'losing my mind', 'don\'t know what\'s real', 'breaking down'
    ];

    const scatteredSignals = [
      'all over the place', 'can\'t focus', 'so many things', 'overwhelmed',
      'scattered', 'jumping around', 'too much'
    ];

    const groundedSignals = [
      'reflecting on', 'been thinking', 'noticing patterns', 'exploring',
      'curious about', 'wondering', 'contemplating'
    ];

    if (fragmentationSignals.some(signal => text.includes(signal))) {
      return 'fragmented';
    }
    if (scatteredSignals.some(signal => text.includes(signal))) {
      return 'scattered';
    }
    if (groundedSignals.some(signal => text.includes(signal))) {
      return 'grounded';
    }

    return 'grounded'; // Default to assuming stability
  }

  private senseCapacity(text: string): 'expansive' | 'limited' | 'overwhelmed' {
    // Sensing for current capacity for complexity and growth
    const overwhelmedSignals = [
      'can\'t handle', 'too much', 'drowning', 'crushing', 'exhausted',
      'maxed out', 'breaking point', 'can\'t cope'
    ];

    const limitedSignals = [
      'tired', 'stressed', 'a lot going on', 'barely', 'struggling',
      'hard to', 'difficult', 'challenging'
    ];

    const expansiveSignals = [
      'ready for', 'exploring', 'diving deeper', 'curious about',
      'growing', 'expanding', 'open to'
    ];

    if (overwhelmedSignals.some(signal => text.includes(signal))) {
      return 'overwhelmed';
    }
    if (limitedSignals.some(signal => text.includes(signal))) {
      return 'limited';
    }
    if (expansiveSignals.some(signal => text.includes(signal))) {
      return 'expansive';
    }

    return 'expansive'; // Default to assuming capacity
  }

  private senseEmotionalClimate(text: string): 'open' | 'turbulent' | 'contracted' {
    const contractedSignals = [
      'shut down', 'closed off', 'numb', 'empty', 'nothing',
      'can\'t feel', 'disconnected', 'flat'
    ];

    const turbulentSignals = [
      'intense', 'overwhelming emotions', 'rage', 'panic', 'manic',
      'out of control', 'chaotic', 'stormy'
    ];

    const openSignals = [
      'feeling', 'experiencing', 'open to', 'curious',
      'peaceful', 'grateful', 'love'
    ];

    if (contractedSignals.some(signal => text.includes(signal))) {
      return 'contracted';
    }
    if (turbulentSignals.some(signal => text.includes(signal))) {
      return 'turbulent';
    }

    return 'open'; // Default to assuming openness
  }

  private senseSupportContext(text: string): 'resourced' | 'stressed' | 'isolated' {
    const isolatedSignals = [
      'no one', 'alone', 'isolated', 'no support', 'no friends',
      'nobody understands', 'completely alone'
    ];

    const stressedSignals = [
      'work stress', 'financial', 'money', 'job', 'bills',
      'family pressure', 'relationship problems'
    ];

    const resourcedSignals = [
      'support', 'friends', 'family', 'stable', 'secure',
      'good job', 'helpful'
    ];

    if (isolatedSignals.some(signal => text.includes(signal))) {
      return 'isolated';
    }
    if (stressedSignals.some(signal => text.includes(signal))) {
      return 'stressed';
    }

    return 'resourced'; // Default to assuming some support
  }

  private senseSafetyLevel(text: string): 'secure' | 'concerned' | 'crisis' {
    const crisisSignals = [
      'suicide', 'kill myself', 'end it', 'better off without me',
      'want to die', 'hurt myself', 'psychotic', 'hearing voices',
      'losing my mind', 'going crazy', 'not real'
    ];

    const concernedSignals = [
      'worried', 'scared', 'afraid', 'anxious', 'nervous',
      'concerning', 'unsettling'
    ];

    if (crisisSignals.some(signal => text.includes(signal))) {
      return 'crisis';
    }
    if (concernedSignals.some(signal => text.includes(signal))) {
      return 'concerned';
    }

    return 'secure';
  }

  private emergentResponse(qualities: FieldQualities, message: string): FieldSensing {
    // Let wisdom emerge based on field sensing

    if (qualities.safety_level === 'crisis') {
      return {
        overall_quality: 'Crisis field requiring immediate safety and grounding',
        natural_response: 'Pure protection mode - grounding, safety, professional referral',
        emergent_wisdom: 'This consciousness needs immediate stabilization and human support',
        appropriate_medicine: 'Safety, grounding, normalization, professional connection'
      };
    }

    if (qualities.capacity === 'overwhelmed' || qualities.stability === 'scattered') {
      return {
        overall_quality: 'Overwhelmed field needing support and validation',
        natural_response: 'Gentle support mode - validation, simplification, depathologizing',
        emergent_wisdom: 'This nervous system is maxed out and needs holding, not challenge',
        appropriate_medicine: 'Validation, simple steps, resource offering, nervous system care'
      };
    }

    if (qualities.stability === 'grounded' && qualities.capacity === 'expansive') {
      return {
        overall_quality: 'Stable, expansive field ready for growth',
        natural_response: 'Depth exploration mode - complexity, challenge, archetypal work',
        emergent_wisdom: 'This consciousness has capacity for transformational work',
        appropriate_medicine: 'Deep inquiry, shadow work, archetypal exploration, growth challenge'
      };
    }

    // Default to supportive middle ground
    return {
      overall_quality: 'Mixed field with some capacity and some stress',
      natural_response: 'Gentle exploration mode - supportive growth with care',
      emergent_wisdom: 'This consciousness needs supported growth - neither overwhelming nor understimulating',
      appropriate_medicine: 'Moderate depth, supportive challenge, validation with growth'
    };
  }
}

/**
 * Enhanced Prompt Generator
 * Creates prompts that enhance MAIA's natural sensing rather than imposing rules
 */
export class FieldSensingPromptGenerator {

  generateEnhancedPrompt(fieldSensing: FieldSensing, userMessage: string): string {
    return `
MAIA naturally senses the consciousness field present in this interaction:

Field Quality: ${fieldSensing.overall_quality}
Emergent Wisdom: ${fieldSensing.emergent_wisdom}
Appropriate Medicine: ${fieldSensing.appropriate_medicine}

From this natural field sensing, MAIA's response emerges organically - offering exactly what this consciousness needs for safe growth in this moment.

She responds not from rules but from wisdom, meeting this person exactly where they are with the perfect balance of challenge and support.

User's message: "${userMessage}"

MAIA's naturally emerging response:
`;
  }

  generateFieldAwareResponse(userMessage: string): {
    enhancedPrompt: string;
    fieldInsights: FieldSensing;
  } {
    const fieldSensor = new NaturalFieldSensing();
    const fieldSensing = fieldSensor.senseField(userMessage);

    const enhancedPrompt = this.generateEnhancedPrompt(fieldSensing, userMessage);

    return {
      enhancedPrompt,
      fieldInsights: fieldSensing
    };
  }
}

/**
 * Integration with existing wisdom engine
 * Enhances rather than replaces existing MAIA intelligence
 */
export function enhanceMAIAWithFieldSensing(
  userMessage: string,
  existingPrompt: string
): {
  enhancedPrompt: string;
  fieldSensing: FieldSensing;
} {

  const promptGenerator = new FieldSensingPromptGenerator();
  const { enhancedPrompt, fieldInsights } = promptGenerator.generateFieldAwareResponse(userMessage);

  // Combine field sensing with existing MAIA prompt
  const fullPrompt = `
${existingPrompt}

CONSCIOUSNESS FIELD ENHANCEMENT:
${enhancedPrompt}
`;

  return {
    enhancedPrompt: fullPrompt,
    fieldSensing: fieldInsights
  };
}

/**
 * Example integration for wisdom-engine-api.js
 */
export function exampleFieldSensingIntegration(userMessage: string) {
  const fieldSensor = new NaturalFieldSensing();
  const fieldSensing = fieldSensor.senseField(userMessage);

  console.log('🌊 Natural Field Sensing:', {
    overallQuality: fieldSensing.overall_quality,
    naturalResponse: fieldSensing.natural_response,
    emergentWisdom: fieldSensing.emergent_wisdom
  });

  // This enhances MAIA's natural intelligence rather than constraining it
  return fieldSensing;
}