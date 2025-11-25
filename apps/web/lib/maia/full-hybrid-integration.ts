/**
 * Full Hybrid Integration
 * Elemental Oracle → Claude Wisdom → Sesame Voice
 * Each system in its proper element
 */

import { ElementalMaiaConnection, ElementalSensing, ConversationContext } from './claude-elemental-connection';
import { SesamePresenceLayer } from '../sesame/presence-layer-architecture';
import { HybridMaiaSystem } from './hybrid-ab-system';

/**
 * The Complete Stack - Each Layer in Its Element
 */
export class FullHybridMaia {
  private elementalOracle: ElementalOracleWeatherReader;
  private claudeWisdom: ElementalMaiaConnection;
  private sesameVoice: SesamePresenceLayer;
  private abSystem: HybridMaiaSystem;

  constructor() {
    this.elementalOracle = new ElementalOracleWeatherReader();
    this.claudeWisdom = new ElementalMaiaConnection();
    this.sesameVoice = new SesamePresenceLayer();
    this.abSystem = new HybridMaiaSystem();
  }

  /**
   * The complete flow - weather to word
   */
  async respond(
    userInput: string,
    context: ConversationContext,
    userId?: string
  ): Promise<{
    response: string | null;
    timing: any;
    metadata: {
      elementalWeather: any;
      claudeWisdom: ElementalSensing;
      sesameChoice: string;
    }
  }> {
    try {
      // 1. ELEMENTAL ORACLE: Read the user's weather
      const weather = await this.elementalOracle.readWeather(userInput, context);

      // 2. CLAUDE: Understand deeply, guide wisely
      const wisdom = await this.claudeWisdom.respond(userInput, {
        ...context,
        elementalWeather: weather
      });

      // 3. SESAME: Speak simply based on guidance
      const sesameResponse = this.sesameVoice.guidedResponse({
        category: this.mapWisdomToCategory(wisdom.metadata),
        suggestSilence: wisdom.metadata.needsSpace,
        emotionalWeight: wisdom.metadata.emotionalWeight
      });

      return {
        response: sesameResponse,
        timing: wisdom.metadata.timing,
        metadata: {
          elementalWeather: weather,
          claudeWisdom: wisdom.metadata,
          sesameChoice: sesameResponse || 'silence'
        }
      };

    } catch (error) {
      console.error('Hybrid system error:', error);

      // Graceful fallback - Sesame can always just be present
      return {
        response: this.sesameVoice.immediateResponse('default'),
        timing: { pauseBefore: 1000, pauseAfter: 2000 },
        metadata: {
          elementalWeather: { error: 'sensing_failed' },
          claudeWisdom: { error: 'wisdom_failed' },
          sesameChoice: 'fallback_presence'
        }
      };
    }
  }

  /**
   * Map Claude's wisdom to Sesame's categories
   */
  private mapWisdomToCategory(wisdom: ElementalSensing): string {
    // Dissolution needs space/silence
    if (wisdom.phase === 'dissolution') {
      return Math.random() > 0.5 ? 'silence' : 'emotional';
    }

    // Fire needs brief acknowledgment
    if (wisdom.element === 'fire') {
      return 'acknowledgment';
    }

    // Water needs holding
    if (wisdom.element === 'water') {
      return 'emotional';
    }

    // Earth needs minimal
    if (wisdom.element === 'earth') {
      return 'acknowledgment';
    }

    // Default to presence
    return 'presence';
  }
}

/**
 * Elemental Oracle Weather Reader
 * Pure sensing - no interpretation
 */
class ElementalOracleWeatherReader {
  /**
   * Read user's weather through elemental lens
   */
  async readWeather(
    userInput: string,
    context: ConversationContext
  ): Promise<ElementalWeather> {
    // Quick elemental sensing
    const weather: ElementalWeather = {
      dominantElement: this.senseElement(userInput),
      secondaryElement: this.senseSecondaryElement(userInput),
      alchemicalPhase: this.sensePhase(userInput),
      intensity: this.measureIntensity(userInput),
      direction: this.senseDirection(userInput),
      quality: this.assessQuality(userInput),
      needsSpace: this.assessSpaceNeed(userInput, context),
      weatherPattern: this.identifyPattern(userInput, context)
    };

    return weather;
  }

  private senseElement(input: string): Element {
    const earthWords = /heavy|tired|stuck|solid|ground|stone|mountain|root|slow|dense|still/i;
    const waterWords = /feel|cry|tear|flow|wave|drown|emotion|heart|river|ocean|deep|fluid/i;
    const airWords = /think|thought|idea|wonder|question|confus|scatter|wind|breath|light|quick/i;
    const fireWords = /burn|rage|passion|urgent|intense|explod|bright|energy|heat|flame/i;

    if (fireWords.test(input)) return 'fire';
    if (waterWords.test(input)) return 'water';
    if (airWords.test(input)) return 'air';
    if (earthWords.test(input)) return 'earth';

    // Default sensing based on length and punctuation
    if (input.length < 10) return 'earth'; // Brief = grounded
    if (input.includes('!')) return 'fire'; // Exclamation = fire
    if (input.includes('?')) return 'air'; // Question = air
    if (input.includes('...')) return 'water'; // Trailing = water

    return 'earth'; // Default to earth presence
  }

  private senseSecondaryElement(input: string): Element | null {
    // Sometimes there's a mix
    const elements = ['earth', 'water', 'air', 'fire'];
    const scores = elements.map(e => this.scoreElement(input, e));
    const sorted = elements
      .map((e, i) => ({ element: e, score: scores[i] }))
      .sort((a, b) => b.score - a.score);

    return sorted[1].score > 0.3 ? sorted[1].element as Element : null;
  }

  private scoreElement(input: string, element: string): number {
    const patterns: Record<string, RegExp> = {
      earth: /heavy|tired|stuck|solid|ground/i,
      water: /feel|cry|tear|flow|wave/i,
      air: /think|wonder|question|confus/i,
      fire: /burn|rage|urgent|intense/i
    };

    const matches = (input.match(patterns[element]) || []).length;
    return matches / input.split(' ').length;
  }

  private sensePhase(input: string): AlchemicalPhase {
    if (/dark|void|break|fall|apart|dying|end|dissolv|destroy/i.test(input)) {
      return 'nigredo'; // Dissolution/darkness
    }
    if (/clear|clean|wash|purify|see|understand|dawn|light/i.test(input)) {
      return 'albedo'; // Purification/clarity
    }
    if (/realiz|insight|get it|understand|dawn|illuminate/i.test(input)) {
      return 'citrinitas'; // Illumination/insight
    }
    if (/whole|complete|together|integrate|unity|one/i.test(input)) {
      return 'rubedo'; // Integration/wholeness
    }

    return 'prima_materia'; // Raw material/starting point
  }

  private measureIntensity(input: string): number {
    let intensity = 0;

    // Exclamation marks
    intensity += (input.match(/!/g) || []).length * 0.3;

    // ALL CAPS
    intensity += /[A-Z]{3,}/.test(input) ? 0.4 : 0;

    // Profanity/intensity words
    if (/fuck|shit|damn|hell|god|jesus|christ/i.test(input)) intensity += 0.5;

    // Length intensity (very short or very long)
    if (input.length < 10 || input.length > 200) intensity += 0.2;

    // Multiple questions
    intensity += Math.min((input.match(/\?/g) || []).length * 0.15, 0.3);

    return Math.min(intensity, 1.0);
  }

  private senseDirection(input: string): WeatherDirection {
    if (/want|need|seek|find|get|achieve|goal/i.test(input)) return 'seeking';
    if (/avoid|escape|run|hide|stop|quit/i.test(input)) return 'avoiding';
    if (/stuck|trapped|can't|unable|blocked/i.test(input)) return 'stuck';
    if (/moving|changing|shifting|growing|flow/i.test(input)) return 'flowing';

    return 'present'; // Just being here
  }

  private assessQuality(input: string): WeatherQuality {
    if (/beautiful|love|joy|happy|light|bright|good/i.test(input)) return 'luminous';
    if (/dark|heavy|difficult|hard|struggle|pain/i.test(input)) return 'shadow';
    if (/confus|lost|unclear|mixed|chaos/i.test(input)) return 'turbulent';
    if (/calm|peace|still|quiet|settle/i.test(input)) return 'clear';

    return 'mixed'; // Most human weather is mixed
  }

  private assessSpaceNeed(input: string, context: ConversationContext): boolean {
    // High emotion needs space
    if (this.measureIntensity(input) > 0.7) return true;

    // Dissolution phase needs space
    if (this.sensePhase(input) === 'nigredo') return true;

    // Very short inputs might need space
    if (input.length < 5) return true;

    // Recent intense exchanges
    if (context.emotionalTrajectory && context.emotionalTrajectory > 0.6) return true;

    return false;
  }

  private identifyPattern(input: string, context: ConversationContext): string {
    // Recurring themes
    if (/again|always|keep|same|repeat/i.test(input)) return 'cycling';
    if (/new|different|change|first/i.test(input)) return 'emerging';
    if (/end|finish|complete|done/i.test(input)) return 'completing';
    if (/begin|start|try|attempt/i.test(input)) return 'initiating';

    return 'flowing';
  }
}

/**
 * Types for elemental weather
 */
type Element = 'earth' | 'water' | 'air' | 'fire';
type AlchemicalPhase = 'prima_materia' | 'nigredo' | 'albedo' | 'citrinitas' | 'rubedo';
type WeatherDirection = 'seeking' | 'avoiding' | 'stuck' | 'flowing' | 'present';
type WeatherQuality = 'luminous' | 'shadow' | 'turbulent' | 'clear' | 'mixed';

interface ElementalWeather {
  dominantElement: Element;
  secondaryElement: Element | null;
  alchemicalPhase: AlchemicalPhase;
  intensity: number;
  direction: WeatherDirection;
  quality: WeatherQuality;
  needsSpace: boolean;
  weatherPattern: string;
}

/**
 * Integration with A/B System
 */
export class IntegratedHybridSystem extends HybridMaiaSystem {
  private fullHybrid: FullHybridMaia;

  constructor() {
    super();
    this.fullHybrid = new FullHybridMaia();
  }

  /**
   * Override respond method to use full hybrid stack
   */
  async respond(
    userInput: string,
    context: any,
    userId?: string
  ): Promise<{
    response: string | null;
    system: 'current' | 'hybrid';
    timing?: any;
    elementalMetadata?: any;
  }> {
    // Check if user should get hybrid
    const useHybrid = this.shouldUseHybrid(userId);

    if (useHybrid) {
      // Use full hybrid stack
      const result = await this.fullHybrid.respond(userInput, context, userId);

      return {
        response: result.response,
        system: 'hybrid',
        timing: result.timing,
        elementalMetadata: result.metadata
      };
    }

    // Use current system
    return {
      response: await this.getCurrentMaiaResponse(userInput, context),
      system: 'current'
    };
  }

  // Access the should use hybrid method
  private shouldUseHybrid(userId?: string): boolean {
    return super['shouldUseHybrid'](userId);
  }

  private getCurrentMaiaResponse(input: string, context: any): Promise<string> {
    return super['getCurrentMaiaResponse'](input, context);
  }
}

export {
  FullHybridMaia,
  ElementalOracleWeatherReader,
  ElementalWeather,
  IntegratedHybridSystem
};

export default IntegratedHybridSystem;