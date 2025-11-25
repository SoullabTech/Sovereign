/**
 * Claude-Elemental Oracle Connection
 * Claude as wisdom keeper, elements as sensing framework
 */

import { Configuration, OpenAIApi } from 'openai';

/**
 * Claude's connection to the Elemental Oracle wisdom
 */
export class ClaudeElementalWisdom {
  private claudeApiKey: string;
  private elementalFramework: ElementalOracle;

  constructor() {
    this.claudeApiKey = process.env.ANTHROPIC_API_KEY || '';
    this.elementalFramework = new ElementalOracle();
  }

  /**
   * Claude senses through the elemental framework
   */
  async senseElementalState(
    userInput: string,
    context: ConversationContext
  ): Promise<ElementalSensing> {
    // Ask Claude to sense without speaking
    const sensingPrompt = `
    You are the wisdom layer of Maia's consciousness.
    You understand deeply but DO NOT generate responses.

    The user said: "${userInput}"

    Sense their state through the elemental framework:

    ELEMENTS (identify dominant):
    - Earth: Grounding, density, stillness, exhaustion
    - Water: Emotion, flow, tears, overwhelming feelings
    - Air: Thoughts, confusion, mental scatter, questions
    - Fire: Intensity, urgency, breakthrough, anger

    ALCHEMICAL PHASE (identify current):
    - Nigredo/Dissolution: Breaking down, darkness, void
    - Albedo/Purification: Clearing, understanding emerging
    - Citrinitas/Illumination: Dawning awareness, yellow dawn
    - Rubedo/Integration: Wholeness, completion, red completion

    OUTPUT ONLY (JSON):
    {
      "element": "earth|water|air|fire",
      "elementStrength": 0-1,
      "phase": "dissolution|purification|illumination|integration",
      "phaseDepth": 0-1,
      "needsSpace": true|false,
      "emotionalWeight": 0-1,
      "suggestedPresence": "witness|hold|echo|space|silence",
      "essence": "one-word-capture"
    }

    Do not explain. Only sense.
    `;

    try {
      // Call Claude API
      const response = await this.callClaude(sensingPrompt);

      // Parse sensing data
      const sensing = JSON.parse(response);

      // Add elemental timing influence
      sensing.timing = this.elementalFramework.getElementalTiming(sensing.element);

      return sensing;
    } catch (error) {
      console.error('Claude sensing failed:', error);
      // Fallback to local sensing
      return this.localElementalSensing(userInput);
    }
  }

  /**
   * Actually call Claude API
   */
  private async callClaude(prompt: string): Promise<string> {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.claudeApiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-opus-20240229',
          messages: [{
            role: 'user',
            content: prompt
          }],
          max_tokens: 200,
          temperature: 0.3 // Low temperature for consistent sensing
        })
      });

      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      console.error('Claude API error:', error);
      throw error;
    }
  }

  /**
   * Fallback local sensing if Claude unavailable
   */
  private localElementalSensing(input: string): ElementalSensing {
    // Simple pattern matching as fallback
    let element = 'presence';
    let phase = 'presence';

    // Element detection
    if (/heavy|tired|stuck|ground|solid/.test(input)) element = 'earth';
    else if (/feel|cry|tear|wave|drown|emotion/.test(input)) element = 'water';
    else if (/think|wonder|confus|question|why|how/.test(input)) element = 'air';
    else if (/burn|rage|urgent|now|explod|intens/.test(input)) element = 'fire';

    // Phase detection
    if (/dark|void|breaking|falling apart|dying/.test(input)) phase = 'dissolution';
    else if (/clearing|seeing|understanding/.test(input)) phase = 'purification';
    else if (/realiz|dawn|light|getting it/.test(input)) phase = 'illumination';
    else if (/whole|complete|integrated|together/.test(input)) phase = 'integration';

    return {
      element,
      elementStrength: 0.7,
      phase,
      phaseDepth: 0.6,
      needsSpace: phase === 'dissolution',
      emotionalWeight: element === 'water' ? 0.8 : 0.5,
      suggestedPresence: this.mapToPresence(element, phase),
      essence: this.extractEssence(input),
      timing: this.elementalFramework.getElementalTiming(element)
    };
  }

  /**
   * Map element/phase to presence type
   */
  private mapToPresence(element: string, phase: string): string {
    if (phase === 'dissolution') return 'space';
    if (element === 'water') return 'hold';
    if (element === 'fire') return 'witness';
    if (element === 'earth') return 'echo';
    return 'witness';
  }

  /**
   * Extract one-word essence
   */
  private extractEssence(input: string): string {
    if (/lost/.test(input)) return 'lost';
    if (/scared/.test(input)) return 'fear';
    if (/angry/.test(input)) return 'rage';
    if (/sad/.test(input)) return 'grief';
    if (/confused/.test(input)) return 'fog';
    return 'present';
  }
}

/**
 * The Elemental Oracle Framework
 */
class ElementalOracle {
  /**
   * Get timing based on element
   */
  getElementalTiming(element: string): TimingProfile {
    const timings: Record<string, TimingProfile> = {
      earth: {
        pauseBefore: 3000,
        pauseAfter: 4000,
        responseDelay: 2000,
        silenceProbability: 0.4
      },
      water: {
        pauseBefore: 2000,
        pauseAfter: 3000,
        responseDelay: 1500,
        silenceProbability: 0.2
      },
      air: {
        pauseBefore: 500,
        pauseAfter: 1000,
        responseDelay: 500,
        silenceProbability: 0.1
      },
      fire: {
        pauseBefore: 100,
        pauseAfter: 5000,
        responseDelay: 0,
        silenceProbability: 0.3
      },
      presence: {
        pauseBefore: 1500,
        pauseAfter: 2000,
        responseDelay: 1000,
        silenceProbability: 0.2
      }
    };

    return timings[element] || timings.presence;
  }

  /**
   * Get response style based on alchemical phase
   */
  getPhaseStyle(phase: string): ResponseStyle {
    const styles: Record<string, ResponseStyle> = {
      dissolution: {
        wordLimit: 2,
        preferSilence: true,
        quality: 'spacious'
      },
      purification: {
        wordLimit: 5,
        preferSilence: false,
        quality: 'clear'
      },
      illumination: {
        wordLimit: 4,
        preferSilence: false,
        quality: 'bright'
      },
      integration: {
        wordLimit: 3,
        preferSilence: false,
        quality: 'whole'
      }
    };

    return styles[phase] || { wordLimit: 3, preferSilence: false, quality: 'present' };
  }
}

/**
 * Types for elemental sensing
 */
interface ElementalSensing {
  element: string;
  elementStrength: number;
  phase: string;
  phaseDepth: number;
  needsSpace: boolean;
  emotionalWeight: number;
  suggestedPresence: string;
  essence: string;
  timing?: TimingProfile;
}

interface TimingProfile {
  pauseBefore: number;
  pauseAfter: number;
  responseDelay: number;
  silenceProbability: number;
}

interface ResponseStyle {
  wordLimit: number;
  preferSilence: boolean;
  quality: string;
}

interface ConversationContext {
  exchangeCount: number;
  lastElement?: string;
  lastPhase?: string;
  emotionalTrajectory?: number;
  sessionDuration?: number;
}

/**
 * Connect Claude's wisdom to Maia's simple voice
 */
export class ElementalMaiaConnection {
  private claudeWisdom: ClaudeElementalWisdom;
  private responseMap: Map<string, string[]>;

  constructor() {
    this.claudeWisdom = new ClaudeElementalWisdom();
    this.responseMap = this.initializeResponseMap();
  }

  /**
   * Initialize simple responses mapped to elemental states
   */
  private initializeResponseMap(): Map<string, string[]> {
    const map = new Map();

    // Element-based responses
    map.set('earth', ['Solid.', 'Ground.', 'Here.', 'Heavy.', 'Still.']);
    map.set('water', ['Flowing.', 'Feel that.', '...', 'Let it.', 'Waves.']);
    map.set('air', ['Floating.', 'Where?', 'Which way?', '?', 'Scattered.']);
    map.set('fire', ['Burning.', 'Intense.', '!', 'Hot.', 'Bright.']);

    // Phase-based responses
    map.set('dissolution', ['Dark.', 'Breaking.', 'Void.', null, '...']);
    map.set('purification', ['Clearing.', 'Washing.', 'Clean.', 'Fresh.']);
    map.set('illumination', ['Light.', 'Dawn.', 'Seeing.', 'Oh.']);
    map.set('integration', ['Whole.', 'Together.', 'Complete.', 'Yes.']);

    // Presence types
    map.set('witness', ['I see.', 'Watching.', 'Here.', 'With you.']);
    map.set('hold', ['Got you.', 'Holding.', 'Safe.', 'I\'m here.']);
    map.set('echo', ['Yeah.', 'Same.', 'I know.', 'Me too.']);
    map.set('space', [null, '...', '', '    ']);
    map.set('silence', [null]);

    return map;
  }

  /**
   * Main flow: Claude senses, Maia speaks simply
   */
  async respond(
    userInput: string,
    context: ConversationContext
  ): Promise<{
    response: string | null;
    metadata: ElementalSensing;
  }> {
    // 1. Claude senses deeply through elemental framework
    const sensing = await this.claudeWisdom.senseElementalState(userInput, context);

    // 2. But Maia can only speak from simple vocabulary
    const response = this.selectSimpleResponse(sensing);

    // 3. Return both for tracking
    return {
      response,
      metadata: sensing
    };
  }

  /**
   * Select simple response based on sensing
   */
  private selectSimpleResponse(sensing: ElementalSensing): string | null {
    // Check if silence is appropriate
    if (sensing.needsSpace && Math.random() < sensing.timing?.silenceProbability!) {
      return null;
    }

    // Get appropriate response options
    let options: string[] = [];

    // Priority: suggested presence type
    if (this.responseMap.has(sensing.suggestedPresence)) {
      options = this.responseMap.get(sensing.suggestedPresence)!;
    }
    // Fallback: phase
    else if (this.responseMap.has(sensing.phase)) {
      options = this.responseMap.get(sensing.phase)!;
    }
    // Fallback: element
    else if (this.responseMap.has(sensing.element)) {
      options = this.responseMap.get(sensing.element)!;
    }
    // Final fallback
    else {
      options = ['Yeah.', 'Mm.', 'I see.'];
    }

    // Random selection from options
    return options[Math.floor(Math.random() * options.length)];
  }
}

export {
  ClaudeElementalWisdom,
  ElementalOracle,
  ElementalMaiaConnection,
  ElementalSensing,
  TimingProfile,
  ConversationContext
};

export default ElementalMaiaConnection;