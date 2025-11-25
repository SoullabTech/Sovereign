/**
 * Prosody SSML Renderer
 * Converts utterances and full responses to SSML with proper prosody
 * Includes subtle variations to prevent repetitive delivery
 */

import { PROSODY_CURVES, ProsodyCurve, CurveToSSML } from './ProsodyCurves';
import { PROSODY_LOOKUP, ProsodyShape } from './ProsodyLookupTable';

// ============================================================================
// VARIATION ENGINE
// ============================================================================

export class ProsodyVariation {
  private static variationSeed = 0;

  /**
   * Add subtle variations to prevent repetitive utterances
   */
  static varyProsody(
    baseCurve: ProsodyCurve,
    utterance: string
  ): ProsodyCurve {
    // Increment seed for variation
    this.variationSeed = (this.variationSeed + 1) % 100;

    const varied = JSON.parse(JSON.stringify(baseCurve)); // Deep clone

    // Variation amount based on utterance type
    const variationAmount = this.getVariationAmount(utterance);

    // Apply subtle random variations
    const pitchVariation = 1 + (Math.sin(this.variationSeed * 0.1) * variationAmount * 0.05);
    const intensityVariation = 1 + (Math.cos(this.variationSeed * 0.15) * variationAmount * 0.08);
    const durationVariation = 1 + (Math.sin(this.variationSeed * 0.2) * variationAmount * 0.1);

    // Apply variations
    varied.pitch = varied.pitch.map(p => p * pitchVariation);
    varied.intensity = varied.intensity.map(i => Math.min(1, i * intensityVariation));
    varied.durationScale *= durationVariation;

    // Occasionally vary breath pattern (10% chance)
    if (Math.random() < 0.1) {
      varied.breath = this.varyBreath(varied.breath);
    }

    return varied;
  }

  /**
   * Determine how much variation is appropriate
   */
  private static getVariationAmount(utterance: string): number {
    // More variation for common utterances
    const commonUtterances = ['Hmm', 'Oh', 'Mm', 'Okay', 'Yes'];
    if (commonUtterances.includes(utterance)) {
      return 0.15; // 15% variation
    }

    // Less variation for emotional utterances
    const emotionalUtterances = ['Oh!', 'Wow', 'Oh...'];
    if (emotionalUtterances.includes(utterance)) {
      return 0.08; // 8% variation
    }

    // Minimal variation for rare/mythic
    return 0.05; // 5% variation
  }

  /**
   * Occasionally vary breath pattern
   */
  private static varyBreath(
    breath: 'held' | 'released' | 'flowing' | 'suspended'
  ): 'held' | 'released' | 'flowing' | 'suspended' {
    const variations: Record<string, string[]> = {
      'held': ['held', 'released'],
      'released': ['released', 'flowing'],
      'flowing': ['flowing', 'released'],
      'suspended': ['suspended', 'held']
    };

    const options = variations[breath] || [breath];
    return options[Math.floor(Math.random() * options.length)] as any;
  }
}

// ============================================================================
// SSML UTILITIES
// ============================================================================

export class SSMLUtilities {
  /**
   * Map length to SSML rate
   */
  static mapLength(length: string): string {
    const rateMap: Record<string, string> = {
      'short': 'fast',
      'medium': 'medium',
      'long': 'slow',
      'extended': 'x-slow'
    };
    return rateMap[length] || 'medium';
  }

  /**
   * Map pitch curve to SSML pitch modifier
   */
  static mapPitch(pitchCurve: number[]): string {
    const avg = pitchCurve.reduce((a, b) => a + b, 0) / pitchCurve.length;

    if (avg > 150) return '+25%';
    if (avg > 130) return '+15%';
    if (avg > 110) return '+5%';
    if (avg < 90) return '-15%';
    if (avg < 100) return '-5%';
    return '0%';
  }

  /**
   * Map intensity curve to SSML volume
   */
  static mapIntensity(intensityCurve: number[]): string {
    const avg = intensityCurve.reduce((a, b) => a + b, 0) / intensityCurve.length;

    if (avg > 0.85) return 'x-loud';
    if (avg > 0.7) return 'loud';
    if (avg > 0.5) return 'medium';
    if (avg > 0.35) return 'soft';
    return 'x-soft';
  }

  /**
   * Map breath pattern to SSML breaks
   */
  static mapBreath(breath: string): string {
    const breathMap: Record<string, string> = {
      'held': '<break time="200ms"/>',
      'released': '<break time="400ms"/>',
      'flowing': '<break time="600ms"/>',
      'suspended': '<break time="800ms"/>'
    };
    return breathMap[breath] || '';
  }
}

// ============================================================================
// SINGLE UTTERANCE RENDERER
// ============================================================================

/**
 * Render a single utterance with prosody and optional variation
 */
export function renderUtteranceSSML(
  utterance: string,
  options?: {
    addVariation?: boolean;
    element?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  }
): string {
  // Get base prosody curve
  let curve = PROSODY_CURVES[utterance];

  if (!curve) {
    // Fallback to basic utterance
    return `<speak>${utterance}</speak>`;
  }

  // Apply variation if requested
  if (options?.addVariation) {
    curve = ProsodyVariation.varyProsody(curve, utterance);
  }

  // Apply elemental modulation if specified
  if (options?.element) {
    const { ElementalCurveModulator } = require('./ProsodyCurves');
    curve = ElementalCurveModulator.modulateCurve(curve, options.element);
  }

  // Generate SSML
  const rate = SSMLUtilities.mapLength(curve.durationScale > 1.5 ? 'long' :
                                        curve.durationScale < 0.8 ? 'short' : 'medium');
  const pitch = SSMLUtilities.mapPitch(curve.pitch);
  const volume = SSMLUtilities.mapIntensity(curve.intensity);
  const breathBefore = curve.breath === 'held' || curve.breath === 'suspended' ?
                       '<break time="300ms"/>' : '';
  const breathAfter = SSMLUtilities.mapBreath(curve.breath);

  return `
    <speak>
      ${breathBefore}
      <prosody rate="${rate}" pitch="${pitch}" volume="${volume}">
        ${utterance}
      </prosody>
      ${breathAfter}
    </speak>
  `.trim();
}

// ============================================================================
// BATCH RESPONSE RENDERER
// ============================================================================

/**
 * Render a full response with mixed utterances and text
 */
export function renderResponseSSML(
  response: string,
  options?: {
    addVariation?: boolean;
    element?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
    detectUtterances?: boolean;
  }
): string {
  // Utterance detection patterns
  const utterancePatterns = [
    /^(Hmm+\.*)$/i,
    /^(Oh!?)$/i,
    /^(Ah+)$/i,
    /^(Mm+\.*)$/i,
    /^(Wow)$/i,
    /^(Ha\.*)$/i,
    /^(Okay)$/i,
    /^(Yes)$/i,
    /^(I see)$/i,
    /^(Alright)$/i,
    /^(So)$/i
  ];

  // Smart tokenization - preserve utterance boundaries
  const tokens = response.split(/(\b(?:Hmm+\.?|Oh!?|Ah+|Mm+\.?|Wow|Ha\.?|Okay|Yes|I see|Alright|So)\b|\.|!|\?|\s+)/i)
                        .filter(Boolean);

  const ssmlParts: string[] = [];
  let inSpeakTag = false;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const trimmed = token.trim();

    // Check if this is an utterance
    let isUtterance = false;
    if (options?.detectUtterances !== false) {
      isUtterance = utterancePatterns.some(pattern => pattern.test(trimmed));
    }

    // Also check against known prosody curves
    if (!isUtterance && PROSODY_CURVES[trimmed]) {
      isUtterance = true;
    }

    if (isUtterance) {
      // Render utterance with prosody
      const utteranceSSML = renderUtteranceSSML(trimmed, options);

      // Extract just the prosody part (remove outer speak tags)
      const prosodyContent = utteranceSSML
        .replace(/<speak>/g, '')
        .replace(/<\/speak>/g, '');

      ssmlParts.push(prosodyContent);
    } else if (trimmed && trimmed !== '.') {
      // Regular text
      ssmlParts.push(trimmed);
    } else if (token === '.') {
      // Preserve punctuation
      ssmlParts.push('.');
    }
  }

  // Join and clean up
  let finalSSML = ssmlParts.join(' ')
    .replace(/\s+([.!?,])/g, '$1')  // Remove space before punctuation
    .replace(/\s+/g, ' ')            // Normalize spaces
    .trim();

  return `<speak>${finalSSML}</speak>`;
}

// ============================================================================
// CONTEXTUAL RENDERER
// ============================================================================

/**
 * Render response with full context awareness
 */
export function renderContextualSSML(
  response: string,
  context: {
    emotionalIntensity?: number;
    complexity?: number;
    element?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
    userState?: 'exploring' | 'processing' | 'releasing' | 'integrating';
    previousUtterances?: string[];
  }
): string {
  // Determine if we should add variation
  // (More variation if we've used similar utterances recently)
  let addVariation = false;
  if (context.previousUtterances && context.previousUtterances.length > 0) {
    const recentUtterances = response.match(/^(Hmm+|Oh|Ah|Mm+|Wow)/i);
    if (recentUtterances) {
      const utterance = recentUtterances[1];
      const recentCount = context.previousUtterances
        .filter(u => u.toLowerCase().startsWith(utterance.toLowerCase()))
        .length;
      addVariation = recentCount > 2; // Vary if used more than twice recently
    }
  }

  // Apply emotional intensity to prosody
  let element = context.element;
  if (!element && context.emotionalIntensity) {
    if (context.emotionalIntensity > 0.8) {
      element = 'fire'; // High intensity
    } else if (context.emotionalIntensity < 0.3) {
      element = 'water'; // Low intensity, flowing
    }
  }

  return renderResponseSSML(response, {
    addVariation,
    element,
    detectUtterances: true
  });
}

// ============================================================================
// EXAMPLE OUTPUTS
// ============================================================================

export const SSML_EXAMPLES = {
  simple: {
    input: "Hmm",
    output: `<speak>
      <prosody rate="medium" pitch="-5%" volume="medium">
        Hmm
      </prosody>
      <break time="200ms"/>
    </speak>`
  },

  emotional: {
    input: "Oh! When did that happen?",
    output: `<speak>
      <prosody rate="fast" pitch="+15%" volume="loud">
        Oh!
      </prosody>
      <break time="400ms"/>
      When did that happen?
    </speak>`
  },

  complex: {
    input: "Hmm... I see. You've been circling Water.",
    output: `<speak>
      <break time="300ms"/>
      <prosody rate="slow" pitch="-5%" volume="soft">
        Hmm...
      </prosody>
      <break time="400ms"/>
      <prosody rate="medium" pitch="0%" volume="medium">
        I see
      </prosody>
      <break time="600ms"/>
      You've been circling Water.
    </speak>`
  },

  withVariation: {
    input: "Hmm",
    output1: `<speak>
      <prosody rate="medium" pitch="-5%" volume="medium">
        Hmm
      </prosody>
      <break time="200ms"/>
    </speak>`,
    output2: `<speak>
      <prosody rate="medium" pitch="-3%" volume="soft">
        Hmm
      </prosody>
      <break time="250ms"/>
    </speak>`,
    note: "Subtle variations in pitch, volume, and timing"
  }
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  ProsodyVariation,
  SSMLUtilities,
  renderUtteranceSSML,
  renderResponseSSML,
  renderContextualSSML,
  SSML_EXAMPLES
};