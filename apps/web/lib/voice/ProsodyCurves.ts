/**
 * Prosody Curves Engine
 * Maps utterances to pitch/intensity curves for dimensional voice delivery
 * Based on sonic shape analysis of emotional weight
 */

// ============================================================================
// CURVE DEFINITIONS
// ============================================================================

export interface ProsodyCurve {
  // Pitch curve in Hz (relative to base)
  pitch: number[];

  // Intensity curve (0-1 amplitude)
  intensity: number[];

  // Time points for interpolation (0-1 normalized)
  timePoints: number[];

  // Overall duration multiplier
  durationScale: number;

  // Breath pattern
  breath: 'held' | 'released' | 'flowing' | 'suspended';

  // Additional modulation
  vibrato?: number;  // 0-1 amount
  roughness?: number; // 0-1 texture
}

// ============================================================================
// UTTERANCE CURVES (FROM VISUALIZATION)
// ============================================================================

export const PROSODY_CURVES: Record<string, ProsodyCurve> = {
  // ========== PROCESSING/CONTEMPLATION ==========

  'Hmm': {
    pitch: [100, 95, 90],  // Gentle falling curve
    intensity: [0.600, 0.550, 0.500],  // Steady medium-soft
    timePoints: [0, 0.5, 1],
    durationScale: 1.0,
    breath: 'held',
    vibrato: 0,
    roughness: 0.1
  },

  'Hmm...': {
    pitch: [100, 95, 88, 85],  // Extended fall
    intensity: [0.600, 0.525, 0.475, 0.450],
    timePoints: [0, 0.3, 0.7, 1],
    durationScale: 2.5,
    breath: 'released',
    vibrato: 0.05,
    roughness: 0
  },

  'Ahh': {
    pitch: [95, 105, 100, 92],  // Rise then fall (recognition)
    intensity: [0.5, 0.65, 0.6, 0.5],
    timePoints: [0, 0.3, 0.6, 1],
    durationScale: 1.5,
    breath: 'released',
    vibrato: 0,
    roughness: 0
  },

  // ========== EMOTIONAL - POSITIVE ==========

  'Oh!': {
    pitch: [120, 180, 160],  // Sharp rise to peak, slight fall
    intensity: [0.7, 0.95, 0.8],  // Strong peak
    timePoints: [0, 0.5, 1],
    durationScale: 0.6,
    breath: 'released',
    vibrato: 0,
    roughness: 0
  },

  'Ha': {
    pitch: [110, 125, 115],  // Quick rise and fall
    intensity: [0.6, 0.75, 0.5],
    timePoints: [0, 0.4, 1],
    durationScale: 0.5,
    breath: 'released',
    vibrato: 0,
    roughness: 0.3
  },

  'Wow': {
    pitch: [140, 160, 150],  // Wonder arc
    intensity: [0.60, 0.80, 0.70],
    timePoints: [0, 0.5, 1],
    durationScale: 1.8,
    breath: 'flowing',
    vibrato: 0.1,
    roughness: 0
  },

  // ========== EMOTIONAL - HEAVY ==========

  'Oh': {  // Soft receiving
    pitch: [130, 120, 110],  // Slow descent
    intensity: [0.500, 0.450, 0.400],  // Fading
    timePoints: [0, 0.5, 1],
    durationScale: 1.5,
    breath: 'flowing',
    vibrato: 0.05,
    roughness: 0
  },

  'Oh...': {  // Grief variant
    pitch: [130, 120, 112, 110],  // Extended descent
    intensity: [0.500, 0.450, 0.425, 0.400],
    timePoints: [0, 0.3, 0.7, 1],
    durationScale: 2.0,
    breath: 'flowing',
    vibrato: 0.08,
    roughness: 0.1
  },

  'Mm': {
    pitch: [110, 105, 100],  // Slight fall
    intensity: [0.5, 0.55, 0.5],  // Holding steady
    timePoints: [0, 0.5, 1],
    durationScale: 1.2,
    breath: 'held',
    vibrato: 0,
    roughness: 0.15
  },

  'Mmm...': {
    pitch: [110, 105, 98, 95],  // Long descent
    intensity: [0.5, 0.52, 0.48, 0.45],
    timePoints: [0, 0.25, 0.75, 1],
    durationScale: 3.0,
    breath: 'flowing',
    vibrato: 0.1,
    roughness: 0.1
  },

  // ========== GROUNDING ==========

  'Okay': {
    pitch: [115, 110, 108],  // Slight falling
    intensity: [0.65, 0.60, 0.60],  // Steady
    timePoints: [0, 0.5, 1],
    durationScale: 0.8,
    breath: 'released',
    vibrato: 0,
    roughness: 0
  },

  'Yes': {
    pitch: [120, 118, 115],  // Almost flat
    intensity: [0.7, 0.68, 0.65],
    timePoints: [0, 0.5, 1],
    durationScale: 0.7,
    breath: 'released',
    vibrato: 0,
    roughness: 0
  },

  'I see': {
    pitch: [120, 115, 112],  // Gentle fall
    intensity: [0.55, 0.60, 0.55],  // Slight peak
    timePoints: [0, 0.5, 1],
    durationScale: 1.0,
    breath: 'flowing',
    vibrato: 0,
    roughness: 0
  },

  // ========== MYTHIC VARIANTS ==========

  'Ha...': {  // Release and amusement
    pitch: [110, 135, 120, 105],  // Rise and extended fall
    intensity: [0.5, 0.65, 0.5, 0.4],
    timePoints: [0, 0.2, 0.5, 1],
    durationScale: 2.0,
    breath: 'released',
    vibrato: 0.15,
    roughness: 0.25
  },

  'yes': {  // Whispered affirmation
    pitch: [95, 92, 90],  // Low and falling
    intensity: [0.3, 0.28, 0.25],  // Very soft
    timePoints: [0, 0.5, 1],
    durationScale: 0.9,
    breath: 'suspended',
    vibrato: 0,
    roughness: 0.4
  },

  'Ahhh': {  // Extended recognition
    pitch: [100, 115, 110, 95],  // Arc up and down
    intensity: [0.4, 0.55, 0.5, 0.4],
    timePoints: [0, 0.3, 0.6, 1],
    durationScale: 2.5,
    breath: 'released',
    vibrato: 0.12,
    roughness: 0.05
  }
};

// ============================================================================
// CURVE INTERPOLATION
// ============================================================================

export class CurveInterpolator {
  /**
   * Interpolate curve values at specific time point
   */
  static interpolateAt(
    curve: number[],
    timePoints: number[],
    t: number  // 0-1 normalized time
  ): number {
    // Clamp t to valid range
    t = Math.max(0, Math.min(1, t));

    // Find surrounding points
    for (let i = 0; i < timePoints.length - 1; i++) {
      if (t >= timePoints[i] && t <= timePoints[i + 1]) {
        // Linear interpolation between points
        const localT = (t - timePoints[i]) / (timePoints[i + 1] - timePoints[i]);
        return curve[i] + (curve[i + 1] - curve[i]) * localT;
      }
    }

    // Edge cases
    return t <= 0 ? curve[0] : curve[curve.length - 1];
  }

  /**
   * Generate smooth curve with N samples
   */
  static generateSmoothCurve(
    prosodyCurve: ProsodyCurve,
    samples: number = 100
  ): {
    pitch: number[];
    intensity: number[];
    time: number[];
  } {
    const pitch: number[] = [];
    const intensity: number[] = [];
    const time: number[] = [];

    for (let i = 0; i < samples; i++) {
      const t = i / (samples - 1);
      time.push(t);
      pitch.push(this.interpolateAt(prosodyCurve.pitch, prosodyCurve.timePoints, t));
      intensity.push(this.interpolateAt(prosodyCurve.intensity, prosodyCurve.timePoints, t));
    }

    return { pitch, intensity, time };
  }
}

// ============================================================================
// SSML GENERATION WITH CURVES
// ============================================================================

export class CurveToSSML {
  /**
   * Convert prosody curve to SSML with time-based modulation
   */
  static toSSML(utterance: string, curve: ProsodyCurve): string {
    // Since SSML doesn't support continuous curves, we approximate
    // with segmented prosody changes

    const segments = this.generateSegments(utterance, curve);
    let ssml = '';

    // Add initial pause based on breath pattern
    if (curve.breath === 'held') {
      ssml += '<break time="300ms"/>';
    } else if (curve.breath === 'suspended') {
      ssml += '<break time="500ms"/>';
    }

    // Build SSML with prosody segments
    segments.forEach((segment, i) => {
      ssml += `<prosody pitch="${segment.pitch}%" rate="${segment.rate}" volume="${segment.volume}">`;
      ssml += segment.text;
      ssml += '</prosody>';

      // Add micro-pauses between segments for flowing breath
      if (i < segments.length - 1 && curve.breath === 'flowing') {
        ssml += '<break time="50ms"/>';
      }
    });

    // Add trailing pause
    if (curve.breath === 'released') {
      ssml += '<break time="400ms"/>';
    } else if (curve.breath === 'flowing') {
      ssml += '<break time="600ms"/>';
    }

    return ssml;
  }

  /**
   * Generate prosody segments from curve
   */
  private static generateSegments(
    utterance: string,
    curve: ProsodyCurve
  ): Array<{
    text: string;
    pitch: number;
    rate: number;
    volume: string;
  }> {
    // Split utterance into segments (could be syllables, words, or characters)
    const segments = this.splitUtterance(utterance);
    const results = [];

    for (let i = 0; i < segments.length; i++) {
      const t = i / (segments.length - 1);

      // Interpolate curve values at this time point
      const pitch = CurveInterpolator.interpolateAt(curve.pitch, curve.timePoints, t);
      const intensity = CurveInterpolator.interpolateAt(curve.intensity, curve.timePoints, t);

      // Convert to SSML parameters
      const pitchPercent = ((pitch / 100) - 1) * 100;  // Convert Hz to percentage
      const rate = 1.0 / curve.durationScale;  // Inverse - longer duration = slower rate
      const volume = this.intensityToVolume(intensity);

      results.push({
        text: segments[i],
        pitch: pitchPercent,
        rate: rate.toFixed(2),
        volume
      });
    }

    return results;
  }

  /**
   * Split utterance into segments for prosody application
   */
  private static splitUtterance(utterance: string): string[] {
    // For single words or short utterances, split by character
    if (utterance.length <= 4) {
      return utterance.split('');
    }

    // For longer utterances, split by word
    return utterance.split(' ');
  }

  /**
   * Convert intensity (0-1) to SSML volume
   */
  private static intensityToVolume(intensity: number): string {
    if (intensity < 0.3) return 'x-soft';
    if (intensity < 0.45) return 'soft';
    if (intensity < 0.65) return 'medium';
    if (intensity < 0.85) return 'loud';
    return 'x-loud';
  }
}

// ============================================================================
// OPENAI TTS ADAPTER
// ============================================================================

export class CurveToOpenAI {
  /**
   * Convert curve to OpenAI TTS parameters
   * Note: OpenAI has limited prosody control, so we approximate
   */
  static toOpenAIParams(curve: ProsodyCurve): {
    speed: number;
    model: 'tts-1' | 'tts-1-hd';
    hints: any;
  } {
    // Average intensity affects speed slightly
    const avgIntensity = curve.intensity.reduce((a, b) => a + b) / curve.intensity.length;

    // Duration scale is primary speed control
    let speed = 1.0 / curve.durationScale;

    // Soft utterances slightly slower, strong slightly faster
    speed *= (0.9 + avgIntensity * 0.2);

    // Clamp to OpenAI limits
    speed = Math.max(0.25, Math.min(4.0, speed));

    return {
      speed,
      model: curve.durationScale > 2 ? 'tts-1-hd' : 'tts-1',  // Use HD for longer utterances
      hints: {
        breath: curve.breath,
        vibrato: curve.vibrato,
        roughness: curve.roughness,
        pitchCurve: curve.pitch,
        intensityCurve: curve.intensity
      }
    };
  }
}

// ============================================================================
// ELEMENTAL CURVE MODULATION
// ============================================================================

export class ElementalCurveModulator {
  /**
   * Modulate prosody curve based on elemental state
   */
  static modulateCurve(
    baseCurve: ProsodyCurve,
    element: 'fire' | 'water' | 'earth' | 'air' | 'aether'
  ): ProsodyCurve {
    const modulated = JSON.parse(JSON.stringify(baseCurve));  // Deep clone

    switch (element) {
      case 'fire':
        // Sharper, quicker, higher
        modulated.pitch = modulated.pitch.map(p => p * 1.1);
        modulated.intensity = modulated.intensity.map(i => Math.min(1, i * 1.2));
        modulated.durationScale *= 0.8;
        modulated.roughness = (modulated.roughness || 0) + 0.1;
        break;

      case 'water':
        // Flowing, extended, softer
        modulated.pitch = modulated.pitch.map(p => p * 0.95);
        modulated.intensity = modulated.intensity.map(i => i * 0.9);
        modulated.durationScale *= 1.3;
        modulated.vibrato = (modulated.vibrato || 0) + 0.05;
        modulated.breath = 'flowing';
        break;

      case 'earth':
        // Grounded, steady, lower
        modulated.pitch = modulated.pitch.map(p => p * 0.9);
        modulated.intensity = modulated.intensity.map(i => i * 0.95);
        modulated.durationScale *= 1.1;
        modulated.breath = 'released';
        break;

      case 'air':
        // Light, higher, quicker
        modulated.pitch = modulated.pitch.map(p => p * 1.05);
        modulated.intensity = modulated.intensity.map(i => i * 0.85);
        modulated.durationScale *= 0.9;
        modulated.breath = 'flowing';
        break;

      case 'aether':
        // Ethereal, whispered, extended
        modulated.pitch = modulated.pitch.map(p => p * 0.85);
        modulated.intensity = modulated.intensity.map(i => i * 0.6);
        modulated.durationScale *= 1.5;
        modulated.breath = 'suspended';
        modulated.roughness = (modulated.roughness || 0) + 0.2;
        break;
    }

    return modulated;
  }
}

// ============================================================================
// MAIN INTERFACE
// ============================================================================

/**
 * Get complete prosody configuration for an utterance
 */
export function getProsodyForUtterance(
  utterance: string,
  options?: {
    element?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
    emotion?: 'neutral' | 'joy' | 'sadness' | 'contemplation';
  }
): {
  curve: ProsodyCurve;
  ssml: string;
  openaiParams: any;
  smoothCurves: any;
} {
  // Get base curve
  let curve = PROSODY_CURVES[utterance];

  if (!curve) {
    // Default curve for unknown utterances
    curve = {
      pitch: [100, 100, 100],
      intensity: [0.6, 0.6, 0.6],
      timePoints: [0, 0.5, 1],
      durationScale: 1.0,
      breath: 'released'
    };
  }

  // Apply elemental modulation if specified
  if (options?.element) {
    curve = ElementalCurveModulator.modulateCurve(curve, options.element);
  }

  // Generate outputs
  return {
    curve,
    ssml: CurveToSSML.toSSML(utterance, curve),
    openaiParams: CurveToOpenAI.toOpenAIParams(curve),
    smoothCurves: CurveInterpolator.generateSmoothCurve(curve, 50)
  };
}

export default {
  PROSODY_CURVES,
  CurveInterpolator,
  CurveToSSML,
  CurveToOpenAI,
  ElementalCurveModulator,
  getProsodyForUtterance
};