/**
 * Master Field Theme Schema
 *
 * Principle: Same skeleton. Different atmosphere.
 * Small surface area → high expressive power.
 *
 * Every field has the same structure. Identity lives in a constrained
 * set of variables that, when aligned across visual/spatial/voice/motion layers,
 * make the field feel like the person — not like a template with a name swapped in.
 *
 * Test: Open two fields side by side. They should feel like different environments.
 * If you changed only these variables to achieve that — you nailed it.
 */

/** Darkness / brightness of the field atmosphere */
export type FieldTone = 'dark' | 'neutral' | 'light';

/** How much space surrounds content — maps to padding, line-height, section gaps */
export type FieldDensity = 'tight' | 'balanced' | 'spacious';

/** Whether the field moves, and how */
export type FieldMotion = 'none' | 'subtle' | 'flow';

/** What imagery approach the field uses */
export type FieldImagery = 'none' | 'symbolic' | 'natural' | 'abstract';

/** MAIA's voice character in this field */
export type FieldVoiceStyle = 'somatic' | 'reflective' | 'analytical';
export type FieldVoiceLength = 'short' | 'medium';

export type FieldTheme = {
  /** Warm/cool/neutral primary accent (single hex) */
  primaryColor: string;
  /** Background anchor (darkest point of the field) */
  backgroundColor: string;
  /** Tone bias */
  tone: FieldTone;
  /** Spatial density — how crowded or open the field feels */
  density: FieldDensity;
  /** Animation philosophy */
  motion: FieldMotion;
  /** Image treatment */
  imagery: FieldImagery;
  /** MAIA voice in this field */
  voice: {
    length: FieldVoiceLength;
    style: FieldVoiceStyle;
  };
  /** Display font name (loaded via next/font or CDN) */
  displayFont: string;
  /** Body font name */
  bodyFont: string;
};

/**
 * Convert a FieldTheme into CSS custom properties.
 * Injected at the field layout root — all components inherit from here.
 */
export function fieldThemeToCSSVars(theme: FieldTheme): Record<string, string> {
  const densityScale: Record<FieldDensity, string> = {
    tight: '1',
    balanced: '1.4',
    spacious: '2',
  };

  const motionDuration: Record<FieldMotion, string> = {
    none: '0ms',
    subtle: '400ms',
    flow: '800ms',
  };

  return {
    '--field-color-primary': theme.primaryColor,
    '--field-color-bg': theme.backgroundColor,
    '--field-font-display': theme.displayFont,
    '--field-font-body': theme.bodyFont,
    '--field-density': densityScale[theme.density],
    '--field-motion-duration': motionDuration[theme.motion],
  };
}

/**
 * Pre-built field presets — ready to use, no design work required.
 * Each preset captures a complete atmospheric archetype.
 */
export const FIELD_PRESETS = {
  /**
   * Jondi Whitis — Energy Medicine, Somatic Precision.
   *
   * Light ground. Deep sage. Warm clay.
   * Sophisticated enough for Soullab. Alive enough for healing work.
   * Think: Aesop + high-end healing practice. Not pink wellness. Not noir.
   */
  jondi: {
    primaryColor: '#5E7A5C',    // deep sage — grounded, alive, not medicinal
    backgroundColor: '#F7F3EC', // warm linen — like natural paper, light and breathable
    tone: 'light' as FieldTone,
    density: 'spacious' as FieldDensity,
    motion: 'subtle' as FieldMotion,
    imagery: 'natural' as FieldImagery,
    voice: { length: 'short' as FieldVoiceLength, style: 'somatic' as FieldVoiceStyle },
    displayFont: 'Cormorant Garamond',
    bodyFont: 'DM Sans',
  },

  /**
   * Kelly Nezat — warm earth brown.
   * Dark, grounded, sovereign. Her personal field.
   */
  kelly: {
    primaryColor: '#B08060',
    backgroundColor: '#1A140E',
    tone: 'dark' as FieldTone,
    density: 'spacious' as FieldDensity,
    motion: 'subtle' as FieldMotion,
    imagery: 'abstract' as FieldImagery,
    voice: { length: 'medium' as FieldVoiceLength, style: 'reflective' as FieldVoiceStyle },
    displayFont: 'Cormorant Garamond',
    bodyFont: 'DM Sans',
  },

  /** Philosophical depth. Dark, dense, no imagery. Mind-first. */
  mcgilchrist: {
    primaryColor: '#8B9EA8',
    backgroundColor: '#111418',
    tone: 'dark' as FieldTone,
    density: 'tight' as FieldDensity,
    motion: 'none' as FieldMotion,
    imagery: 'none' as FieldImagery,
    voice: { length: 'medium' as FieldVoiceLength, style: 'analytical' as FieldVoiceStyle },
    displayFont: 'Playfair Display',
    bodyFont: 'Georgia',
  },

  /** Ecological intelligence. Neutral, balanced, natural imagery. */
  kimmerer: {
    primaryColor: '#7A9E7E',
    backgroundColor: '#1A1F1A',
    tone: 'neutral' as FieldTone,
    density: 'balanced' as FieldDensity,
    motion: 'subtle' as FieldMotion,
    imagery: 'natural' as FieldImagery,
    voice: { length: 'medium' as FieldVoiceLength, style: 'reflective' as FieldVoiceStyle },
    displayFont: 'Lora',
    bodyFont: 'DM Sans',
  },

  /** Depth psychology. Dark, spacious, symbolic. */
  jung: {
    primaryColor: '#9B7E5C',
    backgroundColor: '#13100E',
    tone: 'dark' as FieldTone,
    density: 'spacious' as FieldDensity,
    motion: 'subtle' as FieldMotion,
    imagery: 'symbolic' as FieldImagery,
    voice: { length: 'medium' as FieldVoiceLength, style: 'reflective' as FieldVoiceStyle },
    displayFont: 'Cormorant Garamond',
    bodyFont: 'Inter',
  },

  /** Compassionate inquiry. Warm neutral, balanced, relational. */
  mate: {
    primaryColor: '#C17F5E',
    backgroundColor: '#1A1512',
    tone: 'neutral' as FieldTone,
    density: 'balanced' as FieldDensity,
    motion: 'subtle' as FieldMotion,
    imagery: 'none' as FieldImagery,
    voice: { length: 'medium' as FieldVoiceLength, style: 'reflective' as FieldVoiceStyle },
    displayFont: 'Playfair Display',
    bodyFont: 'DM Sans',
  },
} satisfies Record<string, FieldTheme>;
