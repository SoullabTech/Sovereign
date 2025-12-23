/**
 * Biofield Coherence Mappers - Journey Page Phase 5
 *
 * Maps biofield coherence (HRV, voice, breath) to:
 * - Visual parameters (color, opacity, glow intensity)
 * - Audio parameters (volume, frequency modulation)
 * - Element ratios (for spiral and soundscape)
 *
 * Phase: 4.4-C Phase 5 (Biofield Integration)
 * Created: December 23, 2024
 */

import type { HRVData, VoiceData, BreathData } from './sensors';
import type { ElementRatios } from '../audio/spatialSoundscape';

// ============================================================================
// Types
// ============================================================================

export interface BiofieldCoherence {
  hrv: number;        // 0-1
  voice: number;      // 0-1 (affect normalized)
  breath: number;     // 0-1
  combined: number;   // Weighted average
}

export interface VisualParams {
  /** Thread node color (hex) */
  color: string;

  /** Node opacity (0-1) */
  opacity: number;

  /** Glow intensity (0-1) */
  glowIntensity: number;

  /** Shimmer speed (0-2) */
  shimmerSpeed: number;

  /** Atmosphere intensity for Aether layer (0-1) */
  atmosphereIntensity: number;
}

export interface AudioParams {
  /** Master volume adjustment (dB, -20 to 0) */
  volumeAdjustment: number;

  /** Frequency modulation amount (0-1) */
  frequencyMod: number;

  /** Reverb mix (0-1) */
  reverbMix: number;

  /** Element energy ratios */
  elementRatios: ElementRatios;
}

// ============================================================================
// Combined Coherence Calculation
// ============================================================================

/**
 * Calculate combined biofield coherence from individual sources.
 *
 * Weighting:
 * - HRV: 50% (most reliable physiological indicator)
 * - Breath: 30% (second most reliable)
 * - Voice: 20% (context-dependent)
 *
 * @param hrv - HRV coherence (0-1)
 * @param voice - Voice affect (-1 to 1, normalized to 0-1)
 * @param breath - Breath coherence (0-1)
 * @returns Combined coherence (0-1)
 */
export function calculateCombinedCoherence(
  hrv: number,
  voice: number,
  breath: number
): number {
  // Normalize voice affect (-1 to 1 → 0 to 1)
  const normalizedVoice = (voice + 1) / 2;

  // Weighted average
  const combined = hrv * 0.5 + breath * 0.3 + normalizedVoice * 0.2;

  return Math.max(0, Math.min(1, combined));
}

/**
 * Calculate biofield coherence from sensor data.
 */
export function calculateBiofieldCoherence(
  hrvData: HRVData | null,
  voiceData: VoiceData | null,
  breathData: BreathData | null
): BiofieldCoherence {
  const hrv = hrvData?.coherence || 0.5; // Default to neutral if missing
  const voice = voiceData?.affect || 0;
  const breath = breathData?.coherence || 0.5;

  const combined = calculateCombinedCoherence(hrv, voice, breath);

  return { hrv, voice, breath, combined };
}

// ============================================================================
// Visual Parameter Mapping
// ============================================================================

/**
 * Map coherence to thread node color.
 *
 * Algorithm:
 * - High coherence (0.8-1.0): Vibrant, saturated (thread "glows")
 * - Medium coherence (0.4-0.7): Normal saturation
 * - Low coherence (0.0-0.3): Muted, desaturated (thread "dims")
 *
 * @param baseColor - Base element color (hex string)
 * @param coherence - Combined coherence (0-1)
 * @returns Modulated color (hex string)
 */
export function modulateThreadColor(
  baseColor: string,
  coherence: number
): string {
  // Parse hex color to RGB
  const rgb = hexToRgb(baseColor);
  if (!rgb) return baseColor;

  // Convert to HSL
  const hsl = rgbToHsl(rgb);

  // Modulate saturation and lightness
  // High coherence = more saturated + brighter
  // Low coherence = desaturated + darker
  hsl.s = hsl.s * (0.5 + coherence * 0.5); // 50-100% saturation
  hsl.l = hsl.l * (0.7 + coherence * 0.3); // 70-100% lightness

  // Convert back to hex
  return hslToHex(hsl);
}

/**
 * Map biofield coherence to complete visual parameters.
 */
export function mapCoherenceToVisual(
  baseColor: string,
  coherence: BiofieldCoherence
): VisualParams {
  const { combined, hrv, breath } = coherence;

  // Color modulation (based on combined coherence)
  const color = modulateThreadColor(baseColor, combined);

  // Opacity (breath influences visibility)
  // Low breath coherence = more transparent (unstable presence)
  const opacity = 0.7 + breath * 0.3; // 0.7-1.0

  // Glow intensity (HRV influences radiance)
  // High HRV coherence = stronger glow (heart-centered presence)
  const glowIntensity = hrv * 0.8; // 0-0.8

  // Shimmer speed (combined influences animation)
  // Higher coherence = slower, more stable shimmer
  const shimmerSpeed = 2 - combined * 1.5; // 0.5-2.0

  // Atmosphere intensity (Aether layer responsiveness)
  // Combined coherence influences field intensity
  const atmosphereIntensity = combined * 0.6; // 0-0.6

  return {
    color,
    opacity,
    glowIntensity,
    shimmerSpeed,
    atmosphereIntensity,
  };
}

// ============================================================================
// Audio Parameter Mapping
// ============================================================================

/**
 * Map biofield coherence to element energy ratios.
 *
 * Algorithm:
 * - HRV → Earth (grounding, embodiment)
 * - Breath → Water (flow, rhythm)
 * - Voice → Fire (expression, activation)
 * - Combined → Air (awareness, integration)
 * - Aether is inverse of combined (mystery, unknown)
 */
export function mapCoherenceToElements(
  coherence: BiofieldCoherence
): ElementRatios {
  const { hrv, voice, breath, combined } = coherence;

  // Normalize voice affect (-1 to 1 → 0 to 1)
  const normalizedVoice = (voice + 1) / 2;

  // Calculate element ratios
  const earth = hrv * 0.25;                        // HRV → Earth
  const water = breath * 0.25;                     // Breath → Water
  const fire = normalizedVoice * 0.2;              // Voice → Fire
  const air = combined * 0.2;                      // Combined → Air
  const aether = (1 - combined) * 0.1;             // Inverse → Aether

  // Normalize to sum to 1.0
  const total = earth + water + fire + air + aether;
  const scale = total > 0 ? 1 / total : 1;

  return {
    earth: earth * scale,
    water: water * scale,
    fire: fire * scale,
    air: air * scale,
    aether: aether * scale,
  };
}

/**
 * Map biofield coherence to complete audio parameters.
 */
export function mapCoherenceToAudio(
  coherence: BiofieldCoherence
): AudioParams {
  const { combined, hrv } = coherence;

  // Volume adjustment (combined coherence → master volume)
  // Higher coherence = louder (more present)
  const volumeAdjustment = -20 + combined * 15; // -20 to -5 dB

  // Frequency modulation (HRV → pitch variance)
  // Higher HRV coherence = less frequency drift (more stable)
  const frequencyMod = 0.1 + (1 - hrv) * 0.15; // 0.1-0.25

  // Reverb mix (combined → spatial depth)
  // Higher coherence = less reverb (more direct, present)
  const reverbMix = 0.5 - combined * 0.3; // 0.2-0.5

  // Element ratios
  const elementRatios = mapCoherenceToElements(coherence);

  return {
    volumeAdjustment,
    frequencyMod,
    reverbMix,
    elementRatios,
  };
}

// ============================================================================
// Color Utility Functions
// ============================================================================

interface RGB {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

interface HSL {
  h: number; // 0-360
  s: number; // 0-1
  l: number; // 0-1
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): RGB | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Convert RGB to HSL
 */
function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (diff !== 0) {
    s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / diff + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / diff + 2) / 6;
        break;
      case b:
        h = ((r - g) / diff + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s,
    l,
  };
}

/**
 * Convert HSL to RGB
 */
function hslToRgb(hsl: HSL): RGB {
  const { h, s, l } = hsl;
  const hue = h / 360;

  const hue2rgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, hue + 1 / 3);
    g = hue2rgb(p, q, hue);
    b = hue2rgb(p, q, hue - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Convert RGB to hex
 */
function rgbToHex(rgb: RGB): string {
  const toHex = (n: number): string => {
    const hex = n.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/**
 * Convert HSL to hex
 */
function hslToHex(hsl: HSL): string {
  return rgbToHex(hslToRgb(hsl));
}

// ============================================================================
// Interpolation Utilities
// ============================================================================

/**
 * Smooth interpolation (ease-out cubic)
 */
export function smoothInterpolate(
  from: number,
  to: number,
  progress: number
): number {
  // Ease-out cubic: 1 - (1 - t)^3
  const eased = 1 - Math.pow(1 - progress, 3);
  return from + (to - from) * eased;
}

/**
 * Interpolate visual parameters
 */
export function interpolateVisualParams(
  from: VisualParams,
  to: VisualParams,
  progress: number
): VisualParams {
  return {
    color: progress < 0.5 ? from.color : to.color, // Snap at midpoint
    opacity: smoothInterpolate(from.opacity, to.opacity, progress),
    glowIntensity: smoothInterpolate(from.glowIntensity, to.glowIntensity, progress),
    shimmerSpeed: smoothInterpolate(from.shimmerSpeed, to.shimmerSpeed, progress),
    atmosphereIntensity: smoothInterpolate(
      from.atmosphereIntensity,
      to.atmosphereIntensity,
      progress
    ),
  };
}

/**
 * Interpolate audio parameters
 */
export function interpolateAudioParams(
  from: AudioParams,
  to: AudioParams,
  progress: number
): AudioParams {
  return {
    volumeAdjustment: smoothInterpolate(
      from.volumeAdjustment,
      to.volumeAdjustment,
      progress
    ),
    frequencyMod: smoothInterpolate(from.frequencyMod, to.frequencyMod, progress),
    reverbMix: smoothInterpolate(from.reverbMix, to.reverbMix, progress),
    elementRatios: {
      earth: smoothInterpolate(
        from.elementRatios.earth,
        to.elementRatios.earth,
        progress
      ),
      water: smoothInterpolate(
        from.elementRatios.water,
        to.elementRatios.water,
        progress
      ),
      fire: smoothInterpolate(
        from.elementRatios.fire,
        to.elementRatios.fire,
        progress
      ),
      air: smoothInterpolate(from.elementRatios.air, to.elementRatios.air, progress),
      aether: smoothInterpolate(
        from.elementRatios.aether,
        to.elementRatios.aether,
        progress
      ),
    },
  };
}
