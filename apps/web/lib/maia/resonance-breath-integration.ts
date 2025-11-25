/**
 * Resonance Field + Breath/Lungs Integration
 * The complete system: Archetypal resonance → Atmospheric field → Sesame's breath
 */

import ResonanceFieldGenerator, {
  ResonanceField,
  ElementalFrequency,
  ConsciousnessInfluence
} from './resonance-field-system';
import { BreathLungsSwitch } from './breath-lungs-switch';
import { WiredMaiaSystem, OracleReading } from '../elemental-oracle/blueprint-integration';

/**
 * The Unified System
 *
 * Flow:
 * 1. User input → Archetypal agents sense → Generate resonance field
 * 2. Field constrains possible responses (atmospheric pressure)
 * 3. Breath/Lungs switch determines if depth is needed
 * 4. Response emerges from field constraints + switch decision
 * 5. Timing/pauses determined by field properties
 */
export class ResonanceBreathSystem {
  private resonanceGenerator: ResonanceFieldGenerator;
  private breathSwitch: BreathLungsSwitch;
  private wiredSystem: WiredMaiaSystem;

  // Conversation state
  private exchangeCount: number = 0;
  private intimacyLevel: number = 0;
  private conversationHistory: ConversationTurn[] = [];

  constructor() {
    this.resonanceGenerator = new ResonanceFieldGenerator();
    this.breathSwitch = new BreathLungsSwitch();
    this.wiredSystem = new WiredMaiaSystem();
  }

  /**
   * Main response flow - complete integration
   */
  async respond(userInput: string, context: any): Promise<MaiaResponse> {
    this.exchangeCount++;

    // Step 1: Generate resonance field from archetypes
    const resonanceResult = await this.resonanceGenerator.resonate(
      userInput,
      context,
      this.exchangeCount,
      this.intimacyLevel
    );

    const { response: fieldResponse, field, timing } = resonanceResult;

    // Step 2: Get Oracle reading (underground wisdom)
    const oracleReading = await this.wiredSystem.getOracleReading(
      userInput,
      this.conversationHistory
    );

    // Step 3: Analyze user intent (breath/lungs switch)
    const userIntent = this.breathSwitch.analyzeUserIntent(userInput, {
      ...context,
      oracleReading,
      field
    });

    // Step 4: Decide layer (breath vs lungs)
    const layerDecision = this.breathSwitch.decideLayers(userIntent, oracleReading);

    // Step 5: Generate response based on layer + field
    let finalResponse: string | null;
    let responseMetadata: ResponseMetadata;

    if (layerDecision.primaryLayer === 'breath') {
      // Breath layer: Use field-constrained response
      finalResponse = fieldResponse;
      responseMetadata = {
        layer: 'breath',
        source: 'resonance-field',
        field,
        timing,
        archetypeInfluence: this.getArchetypeInfluence(field)
      };
    } else {
      // Lungs layer: Oracle provides depth, but filtered through field
      const oracleResponse = await this.wiredSystem.generateDeepResponse(
        userInput,
        oracleReading,
        this.conversationHistory
      );

      // Filter Oracle response through field (atmospheric constraint)
      finalResponse = this.filterThroughField(oracleResponse, field);

      responseMetadata = {
        layer: 'lungs',
        source: 'oracle-filtered',
        field,
        timing: {
          delay: timing.delay * 1.5, // Depth takes longer
          pauseAfter: timing.pauseAfter
        },
        archetypeInfluence: this.getArchetypeInfluence(field),
        oracleReading
      };
    }

    // Step 6: Update intimacy based on response quality
    this.updateIntimacy(userInput, finalResponse, field);

    // Step 7: Record turn
    const turn: ConversationTurn = {
      userInput,
      maiaResponse: finalResponse,
      field,
      metadata: responseMetadata,
      timestamp: Date.now()
    };
    this.conversationHistory.push(turn);

    return {
      response: finalResponse,
      timing: responseMetadata.timing,
      metadata: responseMetadata,
      field
    };
  }

  /**
   * Filter Oracle's deep response through field constraints
   * Even when depth is needed, atmospheric field shapes how it emerges
   */
  private filterThroughField(
    oracleResponse: string,
    field: ResonanceField
  ): string {
    // Heavy Earth field: Compress even Oracle responses
    if (field.elements.earth > 0.6) {
      // Take first sentence only
      const firstSentence = oracleResponse.split('.')[0] + '.';
      return firstSentence;
    }

    // High silence probability: Add pauses
    if (field.silenceProbability > 0.5) {
      return oracleResponse.replace(/\. /g, '... ');
    }

    // High fragmentation: Break into incomplete thoughts
    if (field.fragmentationRate > 0.6) {
      const sentences = oracleResponse.split('.');
      return sentences[0] + '...' + (sentences[1] || '');
    }

    // Water field: Add spacious pauses
    if (field.elements.water > 0.5) {
      return oracleResponse.replace(/\./g, '.\n\n');
    }

    return oracleResponse;
  }

  /**
   * Update intimacy level based on conversation dynamics
   */
  private updateIntimacy(
    userInput: string,
    response: string | null,
    field: ResonanceField
  ): void {
    // Silence deepens intimacy
    if (response === null) {
      this.intimacyLevel = Math.min(1, this.intimacyLevel + 0.02);
    }

    // Brief responses with emotional content deepen intimacy
    if (response && response.length < 10 && field.elements.water > 0.4) {
      this.intimacyLevel = Math.min(1, this.intimacyLevel + 0.03);
    }

    // User sharing vulnerably (detected by Oracle)
    if (userInput.length > 50 && field.elements.water > 0.5) {
      this.intimacyLevel = Math.min(1, this.intimacyLevel + 0.05);
    }

    // Long Oracle responses can decrease intimacy (feels like performing)
    if (response && response.length > 200) {
      this.intimacyLevel = Math.max(0, this.intimacyLevel - 0.02);
    }

    // Earth field presence increases intimacy
    if (field.elements.earth > 0.5) {
      this.intimacyLevel = Math.min(1, this.intimacyLevel + 0.01);
    }
  }

  /**
   * Get readable archetype influence summary
   */
  private getArchetypeInfluence(field: ResonanceField): ArchetypeInfluence {
    const dominantElement = Object.entries(field.elements)
      .reduce((a, b) => a[1] > b[1] ? a : b)[0] as keyof ElementalFrequency;

    const dominantConsciousness = Object.entries(field.consciousness)
      .reduce((a, b) => a[1] > b[1] ? a : b)[0] as keyof ConsciousnessInfluence;

    return {
      dominantElement,
      dominantConsciousness,
      rightBrainDominant: field.hemispheres.rightBrain > field.hemispheres.leftBrain,
      silencePull: field.silenceProbability,
      presenceQuality: this.describePresenceQuality(field)
    };
  }

  /**
   * Describe the quality of presence in this field
   */
  private describePresenceQuality(field: ResonanceField): string {
    if (field.elements.earth > 0.6) {
      return 'grounded, silent, witnessing';
    }
    if (field.elements.water > 0.6) {
      return 'flowing, empathic, emotional';
    }
    if (field.elements.air > 0.6) {
      return 'curious, scattered, exploring';
    }
    if (field.elements.fire > 0.6) {
      return 'intense, catalytic, immediate';
    }
    if (field.consciousness.higherSelf > 0.4) {
      return 'spacious, wise, restrained';
    }
    if (field.consciousness.lowerSelf > 0.4) {
      return 'raw, immediate, visceral';
    }
    return 'balanced, present, attuned';
  }

  /**
   * Get field analysis for debugging/monitoring
   */
  getFieldAnalysis(): {
    currentField: ResonanceField | null;
    exchangeCount: number;
    intimacyLevel: number;
    fieldEvolution: any;
  } {
    const history = this.resonanceGenerator.getFieldHistory();
    const currentField = history[history.length - 1] || null;

    return {
      currentField,
      exchangeCount: this.exchangeCount,
      intimacyLevel: this.intimacyLevel,
      fieldEvolution: this.resonanceGenerator.analyzeFieldEvolution()
    };
  }

  /**
   * Reset conversation (new session)
   */
  reset(): void {
    this.exchangeCount = 0;
    this.intimacyLevel = 0;
    this.conversationHistory = [];
    this.resonanceGenerator = new ResonanceFieldGenerator();
  }

  /**
   * Export conversation for analysis
   */
  exportConversation(): ConversationExport {
    return {
      turns: this.conversationHistory,
      fieldEvolution: this.resonanceGenerator.analyzeFieldEvolution(),
      finalIntimacy: this.intimacyLevel,
      exchangeCount: this.exchangeCount
    };
  }
}

/**
 * Types
 */
interface ConversationTurn {
  userInput: string;
  maiaResponse: string | null;
  field: ResonanceField;
  metadata: ResponseMetadata;
  timestamp: number;
}

interface ResponseMetadata {
  layer: 'breath' | 'lungs';
  source: 'resonance-field' | 'oracle-filtered';
  field: ResonanceField;
  timing: {
    delay: number;
    pauseAfter: number;
  };
  archetypeInfluence: ArchetypeInfluence;
  oracleReading?: OracleReading;
}

interface ArchetypeInfluence {
  dominantElement: keyof ElementalFrequency;
  dominantConsciousness: keyof ConsciousnessInfluence;
  rightBrainDominant: boolean;
  silencePull: number;
  presenceQuality: string;
}

interface MaiaResponse {
  response: string | null;
  timing: {
    delay: number;
    pauseAfter: number;
  };
  metadata: ResponseMetadata;
  field: ResonanceField;
}

interface ConversationExport {
  turns: ConversationTurn[];
  fieldEvolution: any;
  finalIntimacy: number;
  exchangeCount: number;
}

/**
 * Example usage
 */
export async function exampleResonanceBreath() {
  const system = new ResonanceBreathSystem();

  // Early conversation
  console.log('\n=== EARLY CONVERSATION (Air dominant) ===');
  const response1 = await system.respond("I'm feeling lost", {});
  console.log('Maia:', response1.response);
  console.log('Field:', response1.metadata.archetypeInfluence);
  console.log('Timing delay:', response1.timing.delay + 'ms');

  // User shares more (Water rises)
  console.log('\n=== DEEPENING (Water rising) ===');
  const response2 = await system.respond(
    "Everything I built is falling apart and I don't know what to do",
    {}
  );
  console.log('Maia:', response2.response);
  console.log('Field:', response2.metadata.archetypeInfluence);
  console.log('Silence probability:', response2.field.silenceProbability);

  // Intimate phase (Earth dominant)
  console.log('\n=== INTIMATE (Earth dominant) ===');
  for (let i = 0; i < 20; i++) {
    await system.respond("...", {});
  }
  const response3 = await system.respond("I'm scared", {});
  console.log('Maia:', response3.response);
  console.log('Field:', response3.metadata.archetypeInfluence);
  console.log('Intimacy level:', system.getFieldAnalysis().intimacyLevel);

  // User asks for depth
  console.log('\n=== DEPTH REQUEST (Lungs surface) ===');
  const response4 = await system.respond("Why is this happening?", {});
  console.log('Maia:', response4.response);
  console.log('Layer:', response4.metadata.layer);
  console.log('Source:', response4.metadata.source);

  // Field returns to breath
  console.log('\n=== RETURN TO BREATH ===');
  const response5 = await system.respond("Yeah", {});
  console.log('Maia:', response5.response);
  console.log('Field:', response5.metadata.archetypeInfluence);

  // Export analysis
  const analysis = system.getFieldAnalysis();
  console.log('\n=== FIELD EVOLUTION ===');
  console.log('Elemental shift:', analysis.fieldEvolution.elementalShift);
  console.log('Intimacy growth:', analysis.fieldEvolution.intimacyGrowth);
  console.log('Silence trend:', analysis.fieldEvolution.silenceTrend);
}

export default ResonanceBreathSystem;